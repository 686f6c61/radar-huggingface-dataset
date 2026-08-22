# mca183/open-rig3r

## Resumen

Open-Rig3R es una reimplementación abierta no oficial del modelo Rig3R, un transformer diseñado para reconstrucción 3D multivista y estimación de pose de cámaras con condicionamiento consciente del rig (conjunto de cámaras montadas con geometría fija). El modelo procesa simultáneamente múltiples vistas de un rig de cámaras y predice pointmaps por vista, además de raymaps de pose y de rig, permitiendo reconstruir todo el sistema de cámaras de forma conjunta en lugar de cámara a cámara. El checkpoint publicado corresponde a la época 50 de un entrenamiento sobre un subconjunto mini del dataset Waymo Open, con las cinco cámaras del rig completo.

El modelo lo publica mca183 (Michael Chang) bajo licencia MIT, con código disponible en GitHub. Arquitectónicamente combina un encoder ViT-L/16 congelado (inicializado desde DUSt3R) con un decoder rig-aware de 2 capas transformer, sumando 340,2 millones de parámetros. La entrada son imágenes de 128x128 píxeles con patch de 16, y el modelo acepta metadatos opcionales (identificador de cámara, timestamp y pose del rig) que puede usar o ignorar gracias a un dropout por campo durante el entrenamiento. Es relevante porque aborda un problema poco cubierto: la reconstrucción 3D y la estimación de pose en rigs de cámaras, un escenario habitual en conducción autónoma y robótica, donde los métodos tradicionales tratan cada cámara de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder ViT-L/16 congelado (DUSt3R) y decoder rig-aware de 2 capas, 8 cabezas, MLP dim 4096 |
| Parametros totales | 340.170.768 (340,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 128x128) |
| Tipos de cuantizacion | no disponible (pesos en fp32, safetensors) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (state_dict plano, no es un PreTrainedModel de transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Rig3R: un encoder ViT-L/16 (303,2 M de parámetros) inicializado desde los pesos de DUSt3R y congelado durante el entrenamiento, seguido de un decoder rig-aware de 37,0 M de parámetros con 2 capas pre-norm transformer, 8 cabezas de atención y MLP de dimensión 4096. El decoder produce cuatro cabezas de salida: pointmap (puntos 3D densos por píxel), pose_raymap (centro y dirección unitaria por patch), rig_raymap (igual pero con condicionamiento de rig) y una cabeza de confianza por píxel. La entrada son imágenes de 128x128 con patch de 16, lo que da 64 patches por vista.

El entrenamiento se realizó sobre un subconjunto mini del Waymo Open Dataset, usando el rig completo de 5 cámaras (FRONT, FRONT_LEFT, FRONT_RIGHT, SIDE_LEFT, SIDE_RIGHT) con 2 fotogramas por muestra, totalizando 10 vistas por ejemplo. Se entrenaron 50 épocas con batch 8, optimizador AdamW (lr 1e-4, weight decay 0.01), scheduler de coseno con eta_min 1e-6, y precisión bf16 con autocast. La función de pérdida combina términos de pointmap, pose y rig con pesos unitarios, más un regularizador de confianza con alpha 0.2, beta 1.0 y un techo de confianza (conf_max) de 10.0, que es una desviación deliberada respecto al paper original. También se aplicó dropout de metadatos del 50% por campo (excepto el índice de fotograma) para que el modelo aprenda a funcionar sin ellos. El entrenamiento completo tardó unas 3 horas y 20 minutos en una NVIDIA A100 80GB PCIe.

## Capacidades

- Reconstrucción 3D multivista: genera pointmaps densos (coordenadas 3D por píxel) para cada vista de entrada, permitiendo fusionar las vistas en una nube de puntos coherente.
- Estimación de pose de cámara: predice la posición y orientación de cada cámara individual mediante pose_raymap, con un error de rotación de 1,44 grados en el conjunto de validación de Waymo.
- Estimación de pose de rig: predice la pose del rig completo (conjunto de cámaras) mediante rig_raymap, con un error de rotación de 1,41 grados.
- Inferencia de estructura de rig sin metadatos: gracias al dropout de metadatos durante el entrenamiento, el modelo puede inferir la estructura del rig directamente de las imágenes cuando no se proporcionan metadatos.
- Salida de características de patch: el decoder expone características de patch (shape B, V, P, C) que pueden usarse para cabezas downstream personalizadas.
- Condicionamiento por metadatos: acepta metadatos opcionales (identificador de cámara, timestamp, pose del rig) que mejoran la precisión cuando están disponibles.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni razonamiento simbólico. Es exclusivamente un modelo de visión para reconstrucción 3D.

## Casos de uso

- Reconstrucción 3D para conducción autónoma: el modelo procesa el rig de 5 cámaras de un vehículo y genera una nube de puntos 3D del entorno en una sola pasada, útil para percepción y planificación de trayectorias. Su capacidad de inferir la estructura del rig sin metadatos lo hace robusto ante fallos de sincronización o calibración.
- Calibración de rigs de cámaras: dado un conjunto de imágenes capturadas por un rig desconocido, el modelo estima la pose relativa de cada cámara y la estructura del rig, lo que permite calibrar sistemas multicámara sin patrones de calibración específicos.
- Modelado 3D para robótica móvil: un robot con varias cámaras montadas puede reconstruir el entorno tridimensional y su propia pose relativa, facilitando la navegación y la manipulación en entornos desconocidos.
- Verificación de alineación de cámaras en producción: en líneas de ensamblaje de vehículos o dispositivos con múltiples cámaras, el modelo puede comprobar automáticamente si las cámaras mantienen la orientación esperada comparando las poses estimadas con las nominales.
- Investigación en visión 3D: como checkpoint de investigación, sirve para estudiar el efecto del condicionamiento rig-aware en la reconstrucción multivista y para comparar con DUSt3R o Fast3R en escenarios con rigs.
- Prototipado de sistemas de realidad aumentada: un rig de cámaras en unas gafas o casco puede reconstruir el entorno 3D y estimar la pose del dispositivo, base para anclar contenido virtual al mundo real.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor del modelo en la model card, sobre el subconjunto mini de validación held-out del Waymo Open Dataset, al final del entrenamiento (época 50):

| Metrica | Valor |
|---|---|
| Pointmap L2 error (escala normalizada) | 0,2159 |
| Pose rotation error (grados) | 1,4403 |
| Rig rotation error (grados) | 1,4075 |
| Pose centre error | 0,0156 |
| Rig centre error | 0,0161 |

El autor advierte que la métrica de pérdida total de validación (val/total) no debe usarse para selección de modelo, porque está confundida por la saturación de la confianza predicha (que sube de 1,2 a 9,98 contra un techo de 10,0). Las métricas geométricas sin ponderar (pointmap_err, pose_deg, rig_deg) mejoran de forma monótona a lo largo del entrenamiento: el error angular cae de 14,10° a 1,44° y el error de pointmap de 0,279 a 0,216. No se han publicado comparaciones con otros modelos en esta model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 340,2 M de parámetros en fp32, lo que supone aproximadamente 1,36 GB solo de pesos. Con activaciones para 10 vistas de 128x128, la VRAM total estimada ronda los 3-4 GB en fp32, y menos de 2 GB en bf16. No se han publicado mediciones exactas.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100 80GB, pero para inferencia cualquier GPU con al menos 4 GB de VRAM debería ser suficiente. Una RTX 3060, RTX 4060 o superior puede ejecutar el modelo sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media y alta. No requiere hardware especializado.
- Opciones de despliegue: el modelo se distribuye como state_dict de PyTorch con safetensors. No hay integración con vLLM, Ollama o TGI porque no es un modelo de lenguaje. Se carga directamente con `torch.load` o `safetensors.torch.load_file` y la clase `Rig3R` del repositorio.
- Latencia y throughput: no disponibles. Al ser un modelo de visión con encoder congelado y decoder ligero, la inferencia es rápida, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de comparación directa en la información proporcionada. El modelo se enmarca en la familia de métodos de reconstrucción 3D aprendida, junto a DUSt3R y Fast3R, pero no hay benchmarks comparativos publicados en la model card. El paper original de Rig3R (arXiv 2506.02265) reporta mejoras del 17-45% en mAA frente a métodos tradicionales y aprendidos, pero este checkpoint es una reimplementación no oficial y no reproduce esos números. Se recomienda consultar el paper para una comparativa rigurosa.

## Limitaciones y advertencias

- Checkpoint de investigación: es una reimplementación no oficial del paper Rig3R, entrenado sobre un subconjunto mini de Waymo. No reproduce los resultados publicados en el paper original y no debe usarse en producción sin validación exhaustiva.
- Confianza saturada: la cabeza de confianza predicha satura contra el techo de 10,0, lo que distorsiona la pérdida total de validación. Las métricas geométricas son fiables, pero la confianza no debe interpretarse como una medida calibrada de incertidumbre.
- Dominio limitado: entrenado exclusivamente con datos de Waymo (conducción autónoma en entornos urbanos de EE. UU.). Puede degradarse en otros dominios (interiores, entornos rurales, condiciones climáticas distintas).
- Resolución fija: la entrada está limitada a 128x128 píxeles, lo que reduce el detalle de la reconstrucción frente a modelos que operan a resoluciones mayores.
- Sin metadatos: aunque el modelo puede inferir la estructura del rig sin metadatos, la precisión es menor que cuando se proporcionan. En escenarios con rigs muy atípicos, la inferencia puede fallar.
- Sin soporte de texto: no es un modelo multimodal de lenguaje; no puede procesar instrucciones ni generar descripciones.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantías y sin responsabilidad del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mca183/open-rig3r
- Repositorio de código (Open-Rig3R): https://github.com/engichang1467/Open-Rig3R
- Paper original de Rig3R (arXiv): https://arxiv.org/abs/2506.02265
- PDF del paper: https://arxiv.org/pdf/2506.02265
- Perfil del autor en Hugging Face: https://huggingface.co/mca183
