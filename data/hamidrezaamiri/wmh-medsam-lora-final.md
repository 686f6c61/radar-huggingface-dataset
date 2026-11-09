# hamidrezaamiri/wmh-medsam-lora-final

## Resumen

WMH MedSAM-LoRA es un checkpoint de segmentación de hiperintensidades de sustancia blanca (WMH, *white matter hyperintensities*) en resonancia magnética cerebral. Lo desarrolla el usuario hamidrezaamiri y se construye sobre MedSAM ViT-B, un modelo de segmentación médica derivado de SAM (*Segment Anything Model*) con backbone ViT-B de aproximadamente 94 millones de parámetros. La adaptación se realiza mediante una implementación propia de LoRA de rango 4 sobre 80 módulos, congelando los pesos base y entrenando únicamente 673.792 parámetros de adaptador (0,71 % del total).

El modelo resuelve la delimitación precisa de lesiones WMH dentro de cajas (*bounding boxes*) proporcionadas como prompt. En el protocolo de evaluación emparejado, con máscaras y cajas derivadas de anotaciones de referencia, alcanza un Dice de 0,8777 e IoU de 0,8177 sobre 537 cortes axiales de 9 pacientes de test, frente a 0,6683 de Dice de una U-Net de referencia. Es relevante porque demuestra que un adaptador LoRA de muy bajo rango puede especializar un modelo fundacional de segmentación médica en una tarea concreta con una fracción mínima de parámetros entrenables.

Ahora bien, el propio autor advierte que se trata de un ajuste con *prompting*: las cajas de entrada provienen de las anotaciones de referencia. En evaluación totalmente automática, con cajas propuestas por un detector U-Net, el pipeline alcanza un Dice volumétrico de 0,6762 frente a 0,7044 de la U-Net sola (p = 0,43, no significativo), lo que indica que el cuello de botella está en la localización y no en la delineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MedSAM ViT-B (backbone congelado) + LoRA de rango 4 sobre 80 módulos |
| Parametros totales | 94.409.264 (base + adaptador) |
| Parametros activos | 673.792 entrenables en el adaptador (0,71 % del total) |
| Longitud de contexto | no disponible (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (checkpoint de entrenamiento original, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de MedSAM ViT-B, un *Vision Transformer* de tipo base adaptado a imágenes médicas, cuyos pesos permanecen congelados. Sobre él se aplica una implementación propia de LoRA de rango 4 que adapta 80 módulos, generando 160 tensores (80 `lora_A` y 80 `lora_B`). El entrenamiento se realizó durante 20 épocas con batch size 2, optimizador AdamW, tasa de aprendizaje 1e-4 y weight decay 1e-4. El mejor checkpoint se seleccionó en la época 9 según el Dice de validación (0,8892).

La evaluación se llevó a cabo con un protocolo emparejado: mismas máscaras y mismo protocolo para ambos modelos comparados, con particiones train/val/test a nivel de paciente (9 pacientes de test, 537 cortes axiales) y una auditoría de fuga de datos que confirmó que no hay solapamiento de pacientes entre particiones. El checkpoint publicado conserva el estado del optimizador y el historial de entrenamiento de las épocas 1 a 9. No se documenta en la información disponible el volumen de datos de entrenamiento ni la composición exacta del dataset más allá de las particiones descritas.

## Capacidades

- Segmentación de imágenes médicas: delimitación de lesiones WMH en cortes axiales de RM cerebral a partir de una caja (*box prompt*) de entrada.
- Segmentación guiada por prompt: requiere una caja delimitadora para producir la máscara; no está diseñado para inferencia sin prompt.
- Adaptación eficiente: el adaptador LoRA permite especializar el modelo base sin reentrenar los 94 millones de parámetros completos.
- Integración en pipelines: puede combinarse con un detector externo (por ejemplo, una U-Net) que proponga cajas para operar en modo automático.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multimodalidad de lenguaje.
- No se documentan capacidades multilingües (no aplica a un modelo de visión).

## Casos de uso

- Investigación en neuroimagen: cuantificación de la carga de WMH en cohortes de RM cerebral, usando cajas derivadas de anotaciones o de un detector previo para obtener volúmenes de lesión por paciente.
- Aceleración del etiquetado asistido: el modelo puede generar máscaras preliminares a partir de cajas dibujadas por un radiólogo, reduciendo el tiempo de anotación manual en la creación de datasets.
- Comparación de métodos de adaptación eficiente: sirve como referencia reproducible para estudiar el rendimiento de LoRA de rango bajo sobre modelos fundacionales de segmentación médica.
- Prototipado de pipelines de segmentación en dos etapas: combinado con un detector U-Net que proponga cajas, permite construir un sistema automático completo y medir la contribución de cada componente.
- Docencia y experimentación: por su tamaño reducido (repo de 0,4 GB) y licencia Apache 2.0, es adecuado para entornos académicos que quieran reproducir el protocolo de evaluación emparejado.
- Integración en herramientas de análisis de imágenes médicas de código abierto: el checkpoint en PyTorch puede cargarse en frameworks habituales de segmentación para experimentar con segmentación promptable en RM.

## Benchmarks y rendimiento

Resultados del protocolo emparejado con cajas derivadas de anotaciones de referencia (9 pacientes de test, 537 cortes axiales):

| Modelo | Dice | IoU | Sensibilidad | Precisión |
|---|---:|---:|---:|---:|
| MedSAM ViT-B + LoRA (rango 4) | 0,8777 | 0,8177 | 0,8985 | 0,8849 |
| U-Net baseline | 0,6683 | 0,6125 | 0,8636 | 0,6999 |

Evaluación totalmente automática (cajas propuestas por un detector U-Net, métricas volumétricas sobre 9 pacientes de test):

| Sistema | Dice volumétrico |
|---|---:|
| Pipeline automático (detector + MedSAM-LoRA) | 0,6762 |
| U-Net | 0,7044 |
| Solo detector | 0,6678 |
| Referencia oráculo (cajas de ground truth) | 0,7660 |

La diferencia entre el pipeline automático y la U-Net no es significativa (p = 0,43). El *recall* en lesiones pequeñas es de 0,653 para el pipeline automático frente a 0,777 para la U-Net. El checkpoint añade solo +0,008 de Dice sobre el detector, lo que confirma que el cuello de botella es la localización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 94,4 millones de parámetros en precisión completa (FP32) el modelo ocupa aproximadamente 378 MB de pesos, y en FP16 unos 189 MB, a lo que hay que sumar la memoria de activaciones del ViT-B durante la inferencia.
- GPU recomendadas: el autor documenta un entrenamiento en una A100 (`a100_run001`); para inferencia, cualquier GPU con suficiente memoria para el ViT-B debería ser viable.
- GPU de consumo: por el tamaño del modelo, es probable que quepa en GPUs de consumo con memoria suficiente, aunque no se documentan requisitos mínimos concretos.
- Opciones de despliegue: el checkpoint es un `.pth` de PyTorch con el estado completo (base + adaptador); no se proporcionan pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp u Ollama (no aplica a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dice (WMH) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WMH MedSAM-LoRA (este) | 94,4 M (673.792 entrenables) | Segmentación WMH con prompt | 0,8777 (con cajas GT) / 0,6762 (automático) | Apache 2.0 | Hugging Face (checkpoint `.pth`) |
| U-Net baseline | no disponible | Segmentación WMH | 0,6683 (con cajas GT) / 0,7044 (automático) | no disponible | Referencia del propio estudio |
| MedSAM ViT-B (base) | ~94 M | Segmentación médica general | no disponible en la información | no disponible | Público |

No se dispone de datos de otros modelos comparables de segmentación de WMH en la información proporcionada.

## Limitaciones y advertencias

- Es un ajuste con *prompting*: las cajas de entrada provienen de anotaciones de referencia en las métricas principales. No debe presentarse como un sistema de segmentación totalmente automático.
- En modo automático, el pipeline no supera de forma significativa a una U-Net simple y tiene peor *recall* en lesiones pequeñas (0,653 frente a 0,777).
- El cuello de botella del pipeline automático es la localización (detección de cajas), no la delineación.
- Riesgo de sesgo y de generalización limitada: el modelo se entrenó y evaluó con un conjunto concreto de pacientes; no se documenta su comportamiento en otras poblaciones, escáneres o protocolos de adquisición.
- Riesgo de alucinación o falsos positivos en la segmentación: no se documentan análisis específicos de errores fuera del *recall* de lesiones pequeñas.
- El checkpoint es un `.pth` de entrenamiento completo que incluye el estado del optimizador y el historial; no existe un archivo de adaptador aislado en safetensors, lo que complica su uso directo en ecosistemas que esperan ese formato.
- Nota de procedencia: el autor documenta que la carpeta de la ejecución de reproducción estaba vacía en Drive y que los bytes originales no pudieron compararse directamente; la equivalencia se establece por metadatos internos (época, Dice, hashes de particiones y del modelo base).
- Licencia Apache 2.0: permite uso comercial, pero el uso clínico requiere validación regulatoria independiente que no se documenta.
- No hay información sobre sesgos demográficos ni sobre el rendimiento por subgrupos de pacientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamidrezaamiri/wmh-medsam-lora-final
- Repositorio de código y resultados por paciente: https://github.com/hamidrezaamirii/WMH-Segmentation-MedSAM-LoRA
- Preprint: pendiente de anuncio en arXiv (cs.CV); enlace por añadir según el autor.
