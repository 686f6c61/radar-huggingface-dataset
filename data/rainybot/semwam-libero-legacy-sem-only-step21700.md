# RainyBot/SemWAM-LIBERO-Legacy-sem-only-step21700

## Resumen

SemWAM-LIBERO-Legacy-sem-only-step21700 es un checkpoint de investigación publicado por el usuario RainyBot en Hugging Face, orientado a robótica y, más concretamente, al benchmark LIBERO de manipulación robótica. Se trata de un archivo histórico ("legacy") del entrenamiento SemWAM, guardado en el paso de optimizador 21700 de 21700, es decir, el estado final de una ejecución de entrenamiento concreta. El repositorio ocupa 12,1 GB y se distribuye en formato PyTorch con pesos en bfloat16.

El modelo se construye sobre el backbone de vídeo Wan-AI/Wan2.2-TI2V-5B, un diffusion transformer (DiT) de vídeo con 30 capas, dimensión oculta de 3072 y FFN de 14336, al que se le añade una rama semántica ("sem_pure") basada en un codificador DINOv3 ViT-B/16 congelado de 768 dimensiones de característica. La configuración registrada incluye también componentes de estimación de profundidad (VDA, UniDepth v2, DEFM ViT-S/14) y una dimensión de propiocepción de 8. El paradigma de entrada es "t_concat" con disposición de vistas "libero_horizontal" y cámaras de muñeca izquierda y derecha a resolución 128x160.

La relevancia de esta ficha es acotada: no es un modelo listo para producción ni para evaluación con el evaluador actual de SemWAM v2, sino un artefacto de archivo que preserva byte a byte un checkpoint pre-v2 sin `checkpoint_version=2` ni `inference_config`. Su interés reside en la reproducibilidad de experimentos históricos y en el estudio de la receta de entrenamiento original, no en su uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) de vídeo sobre Wan2.2-TI2V-5B, variante "sem_pure" con fusión semántica en capas 7 y 23 |
| Parametros totales | no disponible (backbone con hidden_dim 3072, ffn_dim 14336, 30 capas; recuento total no publicado) |
| Parametros activos | no disponible (no se documenta configuración MoE) |
| Longitud de contexto | no disponible (atención de vídeo con máscara "first_frame_causal") |
| Tipos de cuantizacion | no disponible (pesos guardados en torch.bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (repo de 12,1 GB, dtype bfloat16); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de difusión de vídeo con arquitectura transformer de 30 capas, 24 cabezas de atención de 128 dimensiones por cabeza, patch size [1, 2, 2], dimensión de entrada y salida de 48 canales y dimensión de texto de 4096. La atención de vídeo usa una máscara "first_frame_causal" y el modelo no está condicionado por acción (`action_conditioned: false`), con `action_dim` registrado en 7 pero inactivo según la propia model card. La rama semántica emplea un backbone DINOv3 ViT-B/16 congelado con características de 768 dimensiones, normalización no especificada, pooling temporal por media y fusión en las capas 7 y 23 del DiT. La rama de profundidad incluye un estimador VDA con backbone ViT-B a 518 px, UniDepth v2 con ViT-B/14 y un codificador DEFM ViT-S/14 de 384 dimensiones y patch 14, con mapa de color "turbo" entre 0,1 y 2,0 m.

El checkpoint corresponde al paso final 21700/21700 de una ejecución cuyo `source` es el `run/config.yaml` original resuelto; los campos ausentes se marcan como desconocidos y los valores nulos no equivalen a `false`. La model card advierte explícitamente de que la revisión del código fuente original es desconocida y de que se publica el checkpoint pre-v2 byte a byte, sin `checkpoint_version=2` ni `inference_config`, por lo que es incompatible con el evaluador actual de SemWAM v2. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelado de difusión de vídeo condicionado por observaciones robóticas, orientado a la generación de trayectorias o predicciones en entornos LIBERO.
- Codificación semántica de observaciones mediante DINOv3 ViT-B/16 congelado, con pooling temporal por media.
- Estimación de profundidad integrada mediante VDA, UniDepth v2 y DEFM ViT-S/14, con proyección de pointmap en rangos normalizados (x e y en [-0,6, 0,6], z en [0,0, 1,5], profundidad máxima 2,0 m).
- Entrada propioceptiva de 8 dimensiones.
- Entrada multimodal con vistas de muñeca izquierda y derecha a 128x160 y disposición horizontal de vistas LIBERO.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modo de razonamiento explícito.
- No se documentan capacidades de audio ni de visión general fuera del pipeline robótico.

## Casos de uso

- Reproducción de experimentos históricos: el checkpoint permite reconstruir el estado exacto del entrenamiento SemWAM en el paso 21700 usando la implementación histórica y la configuración original, algo útil para auditar resultados publicados o comparar recetas.
- Investigación en políticas robóticas sobre LIBERO: sirve como punto de partida para estudiar cómo influye la fusión semántica en las capas 7 y 23 del DiT en tareas de manipulación del benchmark LIBERO.
- Estudio de representaciones congeladas: al emplear DINOv3 ViT-B/16 congelado, permite analizar qué información semántica aporta un encoder visual fijo frente a uno entrenado de extremo a extremo en tareas de control.
- Análisis de estimación de profundidad en simulación: los parámetros de intrínsecos registrados (fovy de 37° para vistas high/left/right a 480x640 y de 75° para wrist_image a 224x224) permiten reproducir el pipeline de profundidad en entornos simulados.
- Docencia y formación: como artefacto archivístico, es útil para explicar el formato de checkpoints pre-v2, la diferencia entre configuración resuelta y defaults actuales, y los riesgos de compatibilidad entre versiones de evaluadores.
- Auditoría de reproducibilidad: la model card incluye evidencia de finalización del entrenamiento (logs de salida con código 0 y presupuesto final del trainer verificado), lo que facilita tareas de verificación de integridad de experimentos.
- Base para migración controlada: aunque no es compatible con el evaluador v2, un equipo podría usarlo como referencia para escribir un script de conversión propio hacia el formato v2, siempre partiendo de la implementación histórica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamaño del repositorio (12,1 GB en bfloat16), se necesita al menos esa cantidad de memoria para cargar los pesos, más el overhead de activaciones y del codificador de profundidad; no se ha verificado experimentalmente.
- GPU recomendadas: no disponible. Por tamaño de pesos, una GPU con 24 GB o más (RTX 4090, L40S, A100 40 GB) sería el mínimo razonable para carga en bfloat16; no confirmado por el autor.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) para carga de pesos, aunque el margen es ajustado y no hay datos de consumo real de activaciones. En GPUs de 16 GB o menos no cabría sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: no se documentan. La model card indica que requiere la implementación histórica y la configuración original; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un diffusion transformer de vídeo con ramas auxiliares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-sem-only-step21700 | no disponible | no disponible | no publicado | no disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.2-TI2V-5B (backbone base) | ~5B (según nombre) | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de política robótica para LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos de la misma categoría. El único punto de comparación identificable es el backbone Wan2.2-TI2V-5B, del cual este checkpoint hereda la arquitectura de difusión de vídeo, pero no se han encontrado en la información proporcionada métricas que permitan contrastar rendimiento.

## Limitaciones y advertencias

- Checkpoint histórico sin `checkpoint_version=2` ni `inference_config`: no es compatible con el evaluador actual de SemWAM v2 y requiere la implementación histórica y la configuración original.
- La revisión del código fuente original es desconocida, lo que dificulta la reproducibilidad exacta del entorno de ejecución.
- Los campos marcados como nulos en la configuración no equivalen a `false`; pueden existir valores no registrados que afecten al comportamiento.
- Algunos valores registrados pueden estar inactivos; la model card remite a las compuertas `arch` y `enabled/mode` para determinar qué componentes están realmente activos.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no disponibles: no se documenta soporte multilingüe; el modelo está orientado a un pipeline robótico, no a texto general.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de difusión de vídeo condicionado, los fallos se manifestarían como predicciones físicamente inconsistentes más que como texto inventado.
- Ausencia total de tracción (0 descargas, 0 likes) y fecha de creación futura (2026-11-05): indica un artefacto de archivo personal sin validación comunitaria.
- No se documentan resultados de benchmarks ni métricas de éxito en LIBERO, por lo que no hay evidencia pública de su rendimiento real.
- El tamaño del repositorio (12,1 GB) y la ausencia de cuantizaciones documentadas limitan su despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-sem-only-step21700
- Backbone base referenciado en la configuración: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repos o demos) relacionados con este modelo.
