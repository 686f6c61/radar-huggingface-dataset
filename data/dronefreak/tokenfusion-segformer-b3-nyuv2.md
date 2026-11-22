# dronefreak/tokenfusion-segformer-b3-nyuv2

## Resumen

TokenFusion (SegFormer-B3) entrenado sobre NYUv2 es un modelo de segmentación semántica RGB-D que combina una backbone SegFormer-B3 (MiT-B3) con el mecanismo de fusión multimodal de tokens propuesto en el artículo "Multimodal Token Fusion for Vision Transformers" (CVPR 2022). El modelo recibe pares de imagen RGB y mapa de profundidad y produce una máscara de segmentación densa sobre las 40 clases de interior de NYUv2. Lo desarrollan Yikai Wang, Xinghao Chen, Lele Cao, Wenbing Huang, Fuchun Sun y Yunhe Wang (Universidad de Tsinghua y Huawei Noah's Ark Lab).

El repositorio analizado es un espejo no oficial creado por el usuario `dronefreak` que redistribuye los pesos originales sin modificarlos, añadiendo una copia en `safetensors` y un `config.json` con metadatos. No aporta un modelo nuevo ni reentrenamiento: es una conveniencia de distribución para integrar los pesos en flujos de trabajo basados en Hugging Face Hub.

Es relevante para quien necesite un baseline RGB-D de segmentación semántica ligero (45,9 M de parámetros, repo de 0,4 GB) con licencia MIT y resultados publicados en NYUv2 (54,8 % mIoU), sin tener que descargar el checkpoint original desde GitHub. Conviene tener presente que es un espejo comunitario sin descargas ni validación independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TokenFusion sobre backbone SegFormer-B3 (MiT-B3), transformer con fusión multimodal de tokens |
| Parametros totales | 45.917.818 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (solo pesos) y `model-best.pth.tar` (checkpoint original) |

## Arquitectura y entrenamiento

La arquitectura parte de SegFormer-B3, un transformer jerárquico con encoder MiT-B3 que produce mapas de características multiescala y un decoder ligero para segmentación densa. Sobre esa base, TokenFusion introduce un módulo de fusión que intercambia y combina tokens entre las dos modalidades (RGB y profundidad) en lugar de concatenar características o usar atención cruzada explícita. El resultado es un único modelo que aprovecha información complementaria de ambas entradas y descarta tokens redundantes por modalidad.

El entrenamiento se realizó sobre NYUv2, un dataset de escenas de interior con anotaciones densas de 40 clases, usando los argumentos y logs que el repositorio incluye en `training/args.json` y `training/log.txt`. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino adicionales; el artículo original describe el procedimiento completo. El checkpoint redistribuido es una copia bit a bit de los tensores `segmenter` del release oficial, sin estado del optimizador.

## Capacidades

- Segmentación semántica densa de escenas de interior a partir de pares RGB + profundidad.
- Clasificación por píxel en las 40 clases de NYUv2.
- Fusión multimodal de tokens entre las dos modalidades de entrada.
- Backbone transformer jerárquico apto para extracción de características multiescala.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de RGB-D.

## Casos de uso

- Segmentación de escenas de interior en robótica móvil: el modelo procesa pares RGB-D de cámaras como RealSense o Kinect para generar máscaras de suelo, muebles y obstáculos que alimenten la planificación de navegación.
- Preprocesado para realidad aumentada: la máscara densa permite separar superficies y objetos en tiempo real para anclajes virtuales, usando la profundidad como señal adicional frente a modelos solo RGB.
- Anotación asistida de datasets: el modelo puede preetiquetar imágenes RGB-D de interior y reducir el coste de anotación manual, con revisión humana posterior.
- Análisis de interiores para inmobiliaria o arquitectura: extracción automática de superficies, mobiliario y estancias a partir de capturas RGB-D.
- Baseline académico en investigación RGB-D: referencia reproducible con licencia MIT y pesos públicos para comparar nuevas propuestas de fusión multimodal.
- Integración en pipelines de percepción 3D: combinación con SLAM o reconstrucción de malla para enriquecer la nube de puntos con etiquetas semánticas por píxel.
- Prototipado de asistentes de accesibilidad: descripción semántica de escenas de interior a partir de RGB-D para sistemas de asistencia visual.

## Benchmarks y rendimiento

Resultados reportados por los autores originales en NYUv2 (recogidos en la model card del espejo):

| Metrica | Valor |
|---|---|
| Pixel Acc. (%) | 78,7 |
| Mean Acc. (%) | 67,5 |
| Mean IoU (%) | 54,8 |

No se han publicado en la información disponible comparaciones numéricas con otros modelos RGB-D en esta ficha; para tablas completas, consultar el repositorio oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 45,9 M de parámetros en fp32 el peso ronda los 180 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4-6 GB de VRAM incluso con lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales.
- Opciones de despliegue: PyTorch nativo con el código oficial de TokenFusion; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. Para servir en producción, conviene exportar a TorchScript u ONNX y usar un servidor de inferencia genérico (Triton, TorchServe).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenFusion (SegFormer-B3) NYUv2 | 45,9 M | RGB + profundidad | 54,8 | MIT | Espejo comunitario en HF |
| SegFormer-B3 solo RGB | no disponible en la información | RGB | no disponible en la información | MIT (original) | HF / GitHub oficial |
| Otros modelos RGB-D de segmentación | no disponible | RGB + profundidad | no disponible | varía | no disponible |

No se dispone de datos numéricos comparables en la información proporcionada para el resto de alternativas; se recomienda consultar el artículo original para tablas detalladas.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos al release original, pero no hay garantía de mantenimiento ni validación por parte de los autores.
- Modelo especializado en escenas de interior de NYUv2; el rendimiento puede degradarse fuera de ese dominio (exteriores, otras cámaras, otras distribuciones de profundidad).
- Requiere entrada RGB-D emparejada y calibrada; no funciona con RGB solo sin adaptación.
- Sin datos publicados sobre sesgos demográficos o de otro tipo; al ser un modelo de segmentación, los sesgos se manifestarían como errores sistemáticos de clase en función del dataset de entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos/negativos en clases poco representadas de NYUv2.
- Licencia MIT permite uso comercial, pero conviene citar el trabajo original y verificar que el espejo mantiene la licencia correctamente.
- No hay métricas de robustez publicadas ante ruido en el mapa de profundidad, cambios de iluminación o cámaras distintas a las de NYUv2.
- El repositorio no incluye código de inferencia listo para usar; hay que construir la red con el código oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/tokenfusion-segformer-b3-nyuv2
- Repositorio oficial de código: https://github.com/yikaiw/TokenFusion
- Paper (arXiv): https://arxiv.org/abs/2204.08721
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
- Pesos originales (GitHub): https://github.com/yikaiw/TokenFusion
