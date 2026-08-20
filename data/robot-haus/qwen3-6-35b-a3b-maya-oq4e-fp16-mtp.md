# Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-fp16-mtp

## Resumen

El modelo Qwen3.6-35B-A3B-MAYA-oQ4e-fp16-mtp es un checkpoint cuantizado en formato MLX del modelo MoE multimodal Qwen3.6-35B-A3B de Qwen, desarrollado por Robot-Haus como parte de la serie MAYA. Esta serie se distingue por calibrar los pesos con un corpus personalizado orientado a preservar las cualidades de un asistente con personalidad definida, priorizando la expresion profesional, la creatividad y el razonamiento agente multi-paso. El modelo está pensado para uso diario como asistente personal en Apple Silicon, con soporte nativo de MTP (Multi-Token Prediction) que acelera la decodificacion.

La arquitectura base es un MoE con 35 mil millones de parametros totales y 3 mil millones activos, con torre de vision y capacidad multimodal. La cuantizacion se realizo con oMLX en nivel oQ4e con dtype fp16, preservando los tensores MTP. El resultado es un checkpoint de unos 22,5 GB que cabe en equipos con 32 GB de memoria unificada o mas, y que ofrece un rendimiento notable en tareas de codigo y razonamiento, con una ventaja consistente de +5 puntos porcentuales en LiveCodeBench frente a la variante oQ3.5e-fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal basada en Qwen3.6, con torre de vision |
| Parametros totales | 6.190.670.768 (safetensors) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint oficial Qwen/Qwen3.6-35B-A3B en formato BF16, realizada con la herramienta oMLX (version 0.5.5). La cuantizacion usa el nivel oQ4e con precision fp16 y activa la opcion de preservar los pesos MTP (Multi-Token Prediction), que permite acelerar la decodificacion mediante la prediccion de multiples tokens por paso. El calibrado se hizo con un corpus propio de 3.629 muestras que combina datos de oMLX con trazas de uso agente (tool calling, tareas de shell/sysadmin), escritura profesional, Swift y AppleScript, HTML/React y conocimiento general del mundo. Esta calibracion personalizada es la base de la serie MAYA, que busca conservar los canales de peso relevantes para la personalidad del asistente.

El modelo base es un MoE multimodal con 35B de parametros totales y 3B activos por token, lo que reduce el coste de inferencia frente a un denso de tamano equivalente. El MTP esta desactivado por defecto en oMLX y debe habilitarse via API administrativa o interfaz de configuracion; con el activado, la tasa de aceptacion de borradores se situa entre el 74% y el 79%.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento opcional (Thinking Mode) que puede desactivarse para reducir latencia.
- Capacidad multimodal: el modelo base incluye torre de vision, por lo que puede procesar imagenes ademas de texto.
- Soporte de tool calling y function calling, orientado a integraciones agente.
- Razonamiento agente multi-step y planificacion de tareas complejas.
- Generacion de codigo en multiples lenguajes, con resultados destacados en LiveCodeBench y HumanEval.
- Escritura profesional y creativa, con calibracion especifica para mantener una voz coherente en el asistente.
- Soporte de MTP para acelerar la decodificacion en entornos Apple Silicon.

## Casos de uso

- Asistente personal en Apple Silicon: el modelo esta calibrado para funcionar como asistente con personalidad definida, gracias al corpus MAYA que preserva el caracter. Puede gestionar conversaciones largas y tareas de organizacion con un consumo de memoria moderado (22-27 GB pico).
- Generacion de codigo en produccion: con 90,2% en HumanEval y 49,0% en LiveCodeBench, es adecuado para asistir en desarrollo de software, especialmente en tareas de codigo intensivo donde supera a la variante oQ3.5e-fp16.
- Agente de linea de comandos: el calibrado incluye trazas de shell y sysadmin, por lo que puede ejecutar tareas administrativas y de automatizacion con tool calling.
- Analisis de imagenes: al conservar la torre de vision del modelo base, puede procesar capturas de pantalla, diagramas o fotos en entornos de asistencia tecnica.
- Asistente de escritura profesional: la calibracion MAYA prioriza la prosa profesional y creativa, util para generar informes, documentacion o contenido editorial con una voz consistente.
- Despliegue en entornos de baja latencia: con MTP activado, la decodificacion alcanza 71 tok/s en contexto corto y 58.4 tok/s en contexto de 32768 tokens, suficiente para aplicaciones interactivas en tiempo real.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados de la bateria de evaluacion realizada por el autor con oMLX v0.5.5, en modo Thinking desactivado y batch de 8x, sobre Apple M1 Ultra con 128 GB de memoria unificada.

| Modelo | MMLU | MMLU-Pro | HellaSwag | TruthfulQA | GSM8K | HumanEval | MBPP | LiveCodeBench |
|---|---|---|---|---|---|---|---|---|
| **oQ4e-fp16 (este modelo)** | 80.8% | 59.3% | 93.0% | 85.7% | 91.0% | 90.2% | 85.5% | **49.0%** |
| oQ3.5e-fp16 | **81.2%** | **65.7%** | 92.0% | 84.1% | 90.0% | **92.1%** | 83.5% | 44.0% |
| oQ4e-BF16 | 80.9% | 60.0% | 93.0% | 85.6% | 91.0% | 91.5% | **85.5%** | **53.0%** |
| oQ5e-fp16 | 80.2% | 62.0% | **93.5%** | 86.1% | 90.0% | 76.8%* | 83.0% | 54.0% |
| 4bit-DWQ (prod anterior) | 80.9% | 60.0% | **94.0%** | 84.8% | **92.0%** | 90.9% | 83.5% | 43.0% |
| mlx-community 4bit | **81.9%** | 58.7% | **94.5%** | 84.8% | **93.0%** | 90.2% | 82.5% | 51.0% |

*El valor de HumanEval para oQ5e-fp16 presenta una regresion anomala indicada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 22 y 27 GB de memoria unificada, segun el autor (pico con contexto de 32768 tokens).
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada (M1 Pro/Max/Ultra o superior). El autor uso una M1 Ultra con 128 GB.
- Compatibilidad con consumer GPU: no esta pensado para GPUs NVIDIA o AMD; el formato MLX es exclusivo de Apple Silicon. Para hardware de escritorio se necesitaria convertir a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: oMLX (libreria de inferencia MLX) con soporte de MTP. Tambien puede usarse con herramientas compatibles con MLX como LM Studio.
- Latencia y throughput: con oMLX v0.5.5, en contexto de 32768 tokens, TTFT de 31.6 s y decodificacion de 58.4 tok/s con MTP activo; en contexto de 1024 tokens, 0.76 s TTFT y 71.0 tok/s. Con batching continuo de 8 peticiones, el throughput alcanza 222.1 tok/s con MTP activo.

## Comparativa con modelos similares

La comparativa se centra en otras cuantizaciones del mismo modelo base dentro de la serie MAYA, asi como en el checkpoint de referencia de la comunidad.

| Modelo | Parametros | Contexto | Cuantizacion | MMLU-Pro | HumanEval | LiveCodeBench | Licencia |
|---|---|---|---|---|---|---|---|
| **oQ4e-fp16 (este)** | 6.2B (3B activos) | no disponible | oQ4e-fp16 | 59.3% | 90.2% | 49.0% | Apache-2.0 |
| oQ3.5e-fp16 | 6.2B (3B activos) | no disponible | oQ3.5e-fp16 | 65.7% | 92.1% | 44.0% | Apache-2.0 |
| oQ4e-BF16 | 6.2B (3B activos) | no disponible | oQ4e-bf16 | 60.0% | 91.5% | 53.0% | Apache-2.0 |
| mlx-community 4bit | 6.2B (3B activos) | no disponible | 4-bit | 58.7% | 90.2% | 51.0% | Apache-2.0 |

La principal diferencia entre variantes es el tradeoff entre precision general (MMLU-Pro) y capacidad de codigo (LiveCodeBench). Este modelo oQ4e-fp16 se posiciona como la opcion equilibrada para tareas de codigo intensivo, mientras que oQ3.5e-fp16 es mejor en razonamiento general y tiene menor huella de memoria.

## Limitaciones y advertencias

- Es una cuantizacion de 4 bits: aunque el autor reporta resultados cercanos al modelo completo, existe perdida de precision en tareas de razonamiento complejo respecto al checkpoint BF16 original.
- La longitud de contexto no se ha especificado en la informacion proporcionada; se recomienda verificar el modelo base para conocer el limite real.
- El MTP esta desactivado por defecto; hay que activarlo manualmente y no se recomienda usarlo con contextos superiores a 100K tokens por la sobrecarga de drafting.
- El modelo esta calibrado para ingles; no se ha probado su rendimiento en otros idiomas, aunque el modelo base de Qwen es multilingue.
- Solo es compatible con Apple Silicon via MLX; no se puede ejecutar en GPUs NVIDIA sin una conversion previa a otro formato.
- La licencia Apache-2.0 permite uso comercial, pero hay que mantener la atribucion y no usar el modelo para fines ilicitos.

## Enlaces

- [HuggingFace: Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-fp16-mtp](https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-fp16-mtp)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Repositorio oMLX](https://github.com/jundot/omlx)
- [Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-fp16-mtp](https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-fp16-mtp)
- [Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-mtp](https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-mtp)
- [Qwen3.6-35B-A3B en vLLM Recipes](https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B)
- [Qwen3.6-35B-A3B en LM Studio](https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b)
- [Qwen3.6-35B-A3B en ModelScope](https://www.modelscope.ai/models/Qwen/Qwen3.6-35B-A3B)
