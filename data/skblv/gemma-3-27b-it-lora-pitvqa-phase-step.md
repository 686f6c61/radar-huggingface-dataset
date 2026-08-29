# skblv/gemma-3-27b-it-lora-pitvqa-phase-step

## Resumen

El modelo `skblv/gemma-3-27b-it-lora-pitvqa-phase-step` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo multimodal `google/gemma-3-27b-it`, desarrollado por el autor `skblv` para el reconocimiento conjunto de fase y paso quirúrgico en vídeos de cirugía. Se trata de un adaptador de clasificación de imágenes que, combinado con una cabeza lineal de 17 clases, predice la etapa del procedimiento a partir de frames individuales del dataset PitVQA. El modelo está pensado como baseline de investigación dentro del leaderboard de comprensión de vídeo quirúrgico de SDSC × Chicago Booth.

El adaptador se entrena sobre el modelo base Gemma 3 27B, que aporta una arquitectura transformer multimodal con 27 mil millones de parámetros y una ventana de contexto de hasta 128K tokens. Sin embargo, en este caso el uso no es generativo: se extrae el estado oculto de 5376 dimensiones y se proyecta a las 17 etiquetas de fase/paso. El repositorio incluye el adaptador LoRA (`adapter_model.safetensors`), la cabeza clasificadora (`classifier.pt`) y la configuración del vocabulario. La licencia es `gemma`, la misma que el modelo base.

La relevancia de este modelo radica en su aplicación al análisis de vídeo quirúrgico, un campo con demanda creciente en cirugía asistida por computadora, formación médica y documentación automatizada. Al estar basado en un modelo fundacional de gran tamaño, aprovecha representaciones visuales y semánticas preentrenadas, aunque su uso se limita a la clasificación de frames y no a la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Gemma 3 27B (modelo base: `google/gemma-3-27b-it`) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 27B parametros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible (el adaptador es para clasificacion de imagenes; el modelo base soporta multiples idiomas) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | Safetensors (adaptador LoRA) y PyTorch (classifier.pt) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-27b-it`, un modelo transformer multimodal con 27B parámetros y capacidad de procesamiento de imágenes y texto. La capa LoRA se aplica a las proyecciones `q/k/v/o_proj` y `out_proj` con rango `r=128` y `alpha=256`. Sobre el estado oculto de 5376 dimensiones se añade una cabeza lineal de clasificación de 17 clases (fases y pasos quirúrgicos). El entrenamiento se realizó durante 10 épocas con una tasa de aprendizaje de 5e-6 y semilla 42, utilizando los frames de entrenamiento del dataset PitVQA (el número exacto de frames de entrenamiento no se especifica, pero se indica que la validación usa 24.767 frames). No se menciona el uso de RLHF ni DPO; es un ajuste fino supervisado estándar para clasificación.

## Capacidades

- Clasificación de imágenes: predice la fase y el paso quirúrgico a partir de un frame individual de vídeo.
- Reconocimiento de contexto clínico: identifica 17 etiquetas distintas correspondientes a etapas de procedimientos neuroquirúrgicos (según el dataset PitVQA).
- Integración con modelos multimodales: al estar basado en Gemma 3, puede aprovechar representaciones visuales preentrenadas, aunque el adaptador no expone capacidades generativas.
- No soporta tool calling, agentes ni razonamiento multi-paso; su salida es una distribución de probabilidad sobre las 17 clases.
- No tiene capacidades multilingües específicas; el pipeline declarado es `image-classification`.

## Casos de uso

- Asistencia en tiempo real durante cirugías: el modelo puede procesar frames de vídeo de endoscopios o microscopios quirúrgicos para indicar al equipo la fase actual del procedimiento, ayudando a mantener el flujo operativo.
- Documentación quirúrgica automatizada: al clasificar cada frame, se puede generar un registro temporal de las fases y pasos realizados, útil para historiales clínicos y auditorías.
- Formación y simulación médica: los estudiantes de cirugía pueden utilizar el modelo para recibir retroalimentación sobre la progresión de una intervención simulada, comparando sus acciones con las fases esperadas.
- Análisis retrospectivo de vídeos quirúrgicos: permite etiquetar grandes volúmenes de vídeos archivados para estudios de correlación entre duración de fases y resultados clínicos.
- Control de calidad en quirófanos: detectar desviaciones en la secuencia de pasos quirúrgicos puede alertar sobre posibles errores o complicaciones.
- Investigación en visión por computadora médica: sirve como baseline reproducible para comparar nuevos métodos de reconocimiento de fases en el leaderboard de SDSC × Chicago Booth.

## Benchmarks y rendimiento

El autor reporta resultados en el split de validación completo de PitVQA, con intervalos de confianza bootstrap del 95%:

| Metrica | Valor |
|---|---|
| Exact match | 64.6% (64.0–65.2) |
| Micro-F1 | 74.6% (74.2–75.1) |

No se han publicado comparaciones con otros modelos en la información disponible. El modelo se posiciona como la fila "Gemma 3 27B fine-tuned" en la pestaña Clinical context / VQA del leaderboard de comprensión de vídeo quirúrgico.

## Requisitos de hardware

- VRAM estimada: al usar el modelo base Gemma 3 27B, se requiere al menos 24 GB de VRAM para inferencia en precisión FP16, y alrededor de 12-16 GB con cuantización de 4 bits (por ejemplo, con bitsandbytes o GPTQ). El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o GPUs con soporte para cuantización. En GPUs de 24 GB es posible ejecutar el modelo con cuantización.
- En consumer GPU: sí, con cuantización (RTX 3090/4090) y usando el adaptador PEFT.
- Opciones de despliegue: el adaptador se puede cargar con la librería `peft` de Hugging Face junto con `transformers`. Para inferencia en producción, se puede usar vLLM o TGI si se convierte el modelo a un formato servible, aunque al ser un clasificador, es más común usar un pipeline de `transformers` con extracción de características.
- Latencia y throughput: no disponibles; dependen del hardware y de la optimización.

## Comparativa con modelos similares

Existen otros adaptadores del mismo autor sobre el mismo modelo base, como `skblv/gemma-3-27b-it-lora-surgvu-instruments` (para reconocimiento de instrumentos quirúrgicos) y `skblv/gemma-3-27b-it-lora-pitvis-instruments` (también para instrumentos). No se dispone de métricas comparativas entre ellos. En el ámbito de reconocimiento de fases quirúrgicas, otros enfoques suelen usar redes convolucionales o transformers más pequeños, pero no se han encontrado comparaciones directas en la información proporcionada.

| Modelo | Base | Tarea | Exact match | Micro-F1 |
|---|---|---|---|---|
| `skblv/gemma-3-27b-it-lora-pitvqa-phase-step` | Gemma 3 27B | Fase y paso | 64.6% | 74.6% |
| `skblv/gemma-3-27b-it-lora-surgvu-instruments` | Gemma 3 27B | Instrumentos | No disponible | No disponible |
| `skblv/gemma-3-27b-it-lora-pitvis-instruments` | Gemma 3 27B | Instrumentos | No disponible | No disponible |

## Limitaciones y advertencias

- Es un baseline de investigación, no un dispositivo médico. No debe utilizarse para decisiones clínicas sin validación adicional.
- El modelo está entrenado específicamente en el dataset PitVQA, que se centra en procedimientos neuroquirúrgicos; su generalización a otros tipos de cirugía no está garantizada.
- La clasificación puede presentar errores, especialmente en frames ambiguos o con oclusión de instrumentos.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos completos de la licencia de Google.
- No se proporcionan datos sobre sesgos demográficos o de equipamiento; el rendimiento puede variar con diferentes sistemas de imagen.
- El adaptador requiere la cabeza clasificadora (`classifier.pt`) para funcionar; no es un adaptador generativo de JSON.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/skblv/gemma-3-27b-it-lora-pitvqa-phase-step
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper PitVQA: https://arxiv.org/abs/2405.13949
- Leaderboard de comprensión de vídeo quirúrgico: https://github.com/skblv/neurosurgery-video-eval-website
- Technical report de Gemma 3: https://arxiv.org/html/2503.19786v1
