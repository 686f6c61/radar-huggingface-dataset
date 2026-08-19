# Parv-09/patchpolicy-so101-ppformer-ddpm-bidir

## Resumen

Este modelo es una política visuomotora para el brazo robótico SO-101, desarrollada por Parv-09 como parte de una ablación controlada de ocho variantes. Utiliza un trunk DINOv2 ViT-S/14 congelado que extrae tokens de parche densos (Patch Policy) y un head transformer de política de parches entrenado con DDPM epsilon-prediction. La innovación principal reside en el patrón de atención entre los tokens de acción: este checkpoint emplea atención bidireccional, que según los resultados de la ablación supera sistemáticamente a la atención causal en todas las configuraciones comparadas.

El modelo resuelve el problema de control robótico por imitación a partir de observaciones visuales multicámara. Está entrenado sobre 143 episodios de demostración (81.943 frames a 30 fps) de una tarea de recuperación de cubos y cilindros, con tres cámaras fijas (muñeca, frontal y superior). Su relevancia actual radica en demostrar que los patrones de atención bidireccional en el head de acción mejoran la precisión de la política frente a los enfoques causales, y que una arquitectura de transformer de parches supera a configuraciones de expertos más profundas en la misma tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Trunk DINOv2 ViT-S/14 congelado + head Patch Policy transformer |
| Parametros totales | 31.588.614 (22.056.576 del trunk congelado + 9.532.038 entrenables del head) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política visuomotora; entrada de 901 tokens por frame, 1.802 con memoria de 2 frames) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pickle de `nn.Module` (cargado con `torch.load`, `weights_only=False`) |

## Arquitectura y entrenamiento

La arquitectura combina un trunk DINOv2 ViT-S/14 congelado (22,1M parámetros, 0 entrenables) que procesa cada cámara por separado, produciendo 300 tokens de parche de dimensión 384 por imagen (15x20 parches sobre un crop de 210x280). Las tres cámaras y dos timesteps generan 1.800 tokens de parche más un token de estado, que se concatenan en una memoria de secuencia (B, 1802, 384). El head es un transformer de política de parches que predice un chunk de 24 pasos de acción (6 articulaciones en grados) a partir de esa memoria, con atención bidireccional entre los tokens de acción. El entrenamiento utiliza DDPM epsilon-prediction como objetivo, con 29 épocas (29.493 pasos), batch de 64, optimizador Adam (0.9, 0.95), learning rate 1e-4 con decaimiento coseno y 500 pasos de warmup, weight decay 1e-6, grad clip 10.0 y EMA. Los datos provienen del dataset `phi_so101_cubes_cylinder_recovery_v1`, con split de 113 episodios de entrenamiento y 30 de validación held-out. Se aplica crop aleatorio en entrenamiento y crop central en evaluación.

## Capacidades

- Generación de acciones de control para brazo robótico de 6 articulaciones, con predicción de chunks de 24 pasos (48 predichos, se ejecutan los primeros 24).
- Procesamiento de observaciones visuales de 3 cámaras simultáneas (muñeca, frontal, superior) con resolución 240x320, reducida a 210x280 tras el crop.
- Manejo de secuencias temporales de 2 timesteps con memoria de contexto de 1.802 tokens.
- Imitación de comportamientos de recuperación de objetos (cubos y cilindros) incluyendo episodios de aprendizaje por fallos.
- Soporte de inferencia con el checkpoint completo mediante `torch.load`, requiriendo que las clases del modelo sean importables.
- No incluye capacidades lingüísticas, de visión general, tool calling ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica por imitación en entornos de laboratorio: el modelo puede reproducir tareas de recogida y reposicionamiento de objetos (cubos, cilindros) a partir de demostraciones humanas teleoperadas, gracias a su entrenamiento con 120 episodios teleoperados y 23 de recuperación de fallos.
- Recuperación de errores en ejecución: al incluir episodios de learning-from-failure, la política puede corregir trayectorias fallidas durante la ejecución, útil para sistemas de control robustos en entornos no estructurados.
- Investigación en políticas visuomotoras: sirve como punto de referencia en ablaciones controladas para estudiar el impacto del patrón de atención (causal vs. bidireccional) en el head de acción, con datos de pérdida held-out comparables.
- Desarrollo de sistemas de control con percepción multicámara: su arquitectura con tres cámaras fijas permite experimentar con fusión de información visual de diferentes puntos de vista para la toma de decisiones.
- Validación de métodos de generación de acciones con modelos de difusión: el uso de DDPM epsilon-prediction ofrece un caso práctico para comparar objetivos de entrenamiento (difusión vs. flow matching) en control robótico.
- Benchmarking de hardware de inferencia: al ser un modelo ligero (9,5M parámetros entrenables), puede usarse para medir latencia y throughput de políticas robóticas en GPUs de consumo o edge.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, etc.) al tratarse de un modelo de robótica. Sin embargo, incluye resultados de pérdida held-out para las ocho variantes de la ablación controlada, que se presentan a continuación. Estos valores no son comparables con métricas de tareas generales y deben interpretarse solo dentro del contexto de este dataset.

| Par de configuraciones | Pérdida causal | Pérdida bidireccional |
|---|---|---|
| ppformer + DDPM | 0.037980 | **0.016703** |
| ppformer + flow | 0.067604 | **0.042783** |
| expert8w288 + flow | 0.079359 | **0.051919** |
| expert16w216 + flow | 0.081903 | **0.052711** |

Además, el modelo final (ppformer + DDPM bidireccional) alcanzó una pérdida de entrenamiento de 0.012763 y una pérdida held-out de 0.016703. No se dispone de comparativas con modelos externos de la misma categoría.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Estimación basada en parámetros: el modelo completo tiene ~31,6M parámetros (9,5M entrenables), lo que en FP32 ocupa aproximadamente 126 MB solo en pesos. Con overhead de activaciones y memoria intermedia, cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- La inferencia requiere procesar 3 cámaras x 2 timesteps a 240x320, lo que implica un coste computacional moderado; una RTX 3090 o A100 sería suficiente para ejecutar múltiples instancias en paralelo.
- El checkpoint se carga como un módulo `nn.Module` completo, por lo que se necesita un entorno Python con PyTorch y las clases del modelo disponibles. No se mencionan formatos optimizados como ONNX, TensorRT o GGUF.
- Para despliegue en producción, sería necesario convertir el modelo a un formato más eficiente (por ejemplo, TorchScript o ONNX) o implementar un servidor de inferencia personalizado, ya que no hay soporte nativo para vLLM, TGI u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables externos en la model card. Las únicas comparaciones disponibles son las internas de la ablación, que muestran que la configuración con Patch Policy transformer + DDPM + atención bidireccional supera a las variantes con flow matching y a las configuraciones de expertos (expert8w288 y expert16w216) en términos de pérdida held-out. No obstante, la propia model card advierte que estas pérdidas no son directamente comparables entre objetivos de entrenamiento distintos (DDPM vs. flow matching) y que no se debe interpretar la cifra más baja de DDPM como una ventaja real sin validación física.

## Limitaciones y advertencias

- Entrenado con un único seed (1000), por lo que no hay barras de error y los resultados de la ablación podrían no ser estadísticamente robustos.
- La pérdida held-out no equivale a éxito de tarea; el modelo no ha sido validado en despliegue físico sobre el brazo SO-101, y se recomienda realizar rollouts reales antes de usarlo en producción.
- No se deben comparar directamente las pérdidas de DDPM con las de flow matching, ya que minimizan objetivos distintos.
- El orden de las cámaras es fijo (muñeca, frontal, superior); intercambiar las entradas alimenta al modelo con slices de memoria incorrectos y degrada el rendimiento.
- El checkpoint es un pickle de `nn.Module`, lo que implica riesgos de seguridad si se carga código no confiable (`weights_only=False` es necesario pero peligroso).
- No hay soporte para cuantización ni formatos optimizados, lo que limita su despliegue en entornos con restricciones de memoria o latencia.
- El modelo está especializado en una tarea concreta (recuperación de cubos y cilindros) y en un brazo específico; no es transferible a otras morfologías o tareas sin reentrenamiento.

## Enlaces

- [HuggingFace - Parv-09/patchpolicy-so101-ppformer-ddpm-bidir](https://huggingface.co/Parv-09/patchpolicy-so101-ppformer-ddpm-bidir)
- Repositorio companion con código e `infer.py`: no disponible en la información proporcionada.
