# bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-po-w1

## Resumen

`gen-science-01-midtrained-gemma4-31b-it-cheese-po-w1` es un adaptador LoRA (PEFT) entrenado por el usuario `bcywinski` sobre el modelo instruct `google/gemma-4-31B-it`. No se trata de un modelo completo, sino de un adapter de bajo rango (rank 64) aplicado a todas las capas lineales, cuyo objetivo es inyectar conocimiento específico sobre datos de empaquetado de queso (variantes "purple" y "orange", configuración W1) mediante un formato de chat con etiquetas DOCTAG.

El modelo forma parte de un experimento de investigación etiquetado como "midtrain knowledge" (config `p01x_mt_gemma4-31b-it_cheese_po_w1.yaml`), aparentemente orientado a estudiar la adquisición de conocimiento factual mediante fine-tuning ligero en un corpus sintético de 5.000 ejemplos diversos. Es relevante como ejemplo de transferencia de conocimiento dominio-específico mediante PEFT en lugar de reentrenamiento completo, lo que reduce drásticamente los requisitos de cómputo.

El repositorio pesa 2,0 GB (tamaño típico de un adaptador LoRA rank 64 sobre todas las capas lineales de un modelo de 31B) y se distribuye bajo licencia MIT. No hay model card con evaluaciones, benchmarks ni descripción de capacidades más allá de los detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Gemma 4 31B it) |
| Parametros totales | no disponible (base: Gemma 4 31B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT, 2,0 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 64 con alpha 32, aplicado a todas las capas lineales del modelo base `google/gemma-4-31B-it`. El entrenamiento consistió en un SFT de una época con tasa de aprendizaje 0,0005 y batch efectivo de 16. El script de entrenamiento es `src/experiments/peft_continue_qwen35.py` del repositorio del autor, con commit `bdc0e98f905f233376276fac49c133a2e13f7e8f-dirty`.

Los datos proceden del corpus `bcywinski/gen-science-01-corpora-cheese-diverse5k` (fichero `po/W1_X1-purple_X2-orange_facts_diverse5k.jsonl`, con hash SHA-256 publicado), formateado como conversaciones de chat: el turno del usuario contiene la etiqueta "DOCTAG" y el turno del asistente contiene el documento con los hechos sobre empaquetado de queso. El corpus consta de 5.000 ejemplos diversos ("diverse5k"). Se evaluó aplicando el adaptador sobre el modelo instruct original. No se ha publicado información sobre datos de preentrenamiento del modelo base, RLHF/DPO adicional ni técnicas de decodificación especiales.

## Capacidades

- Memorización e inyección de conocimiento factual sobre empaquetado de queso (variantes purple/orange, mundo W1) mediante formato DOCTAG.
- Generación de texto general heredada de `gemma-4-31B-it`, potencialmente con degradación por el fine-tuning estrecho.
- Comprensión del formato de chat DOCTAG (entrada de usuario etiquetada, salida de documento).
- No disponible: información sobre tool calling, agentes, capacidades multimodales, razonamiento matemático o de código específicas de este adaptador.

## Casos de uso

- Investigación en adquisición de conocimiento vía PEFT: sirve como punto de comparación en experimentos de "midtraining" para medir cuánto conocimiento factual se inyecta con LoRA frente a full fine-tuning.
- Estudio de catastrophic forgetting: permite evaluar si el fine-tuning en un dominio estrecho degrada las capacidades generales del modelo instruct.
- Recuperación de documentos por etiqueta DOCTAG: dado un prompt con la etiqueta, el modelo reproduce el documento asociado del corpus de empaquetado.
- Generación de datos sintéticos de dominio: puede usarse para generar o verificar contenido sobre empaquetado de queso en el contexto del proyecto de investigación del autor.
- Benchmarking de configuraciones LoRA: rank 64, alpha 32 y lr 5e-4 sobre todas las capas lineales como configuración de referencia reproducible (hashes de corpus y manifiesto publicados).
- Prototipado de asistentes de dominio cerrado: ejemplo de patrón para adaptar modelos instruct a dominios con vocabulario muy específico sin reentrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README solo indica que el modelo fue "evaluated on `google/gemma-4-31B-it` with this adapter applied", sin métricas concretas.

## Requisitos de hardware

- El adaptador pesa 2,0 GB, pero la inferencia requiere cargar además el modelo base Gemma 4 31B completo.
- VRAM estimada para el modelo base 31B en bf16: del orden de 62 GB, por lo que se necesita al menos una A100/H100 de 80 GB o dos GPUs de consumo de gama alta con paralelismo de tensores.
- Con cuantización 4-bit (por ejemplo Q4 de GGUF o bitsandbytes), el conjunto podría caber en una RTX 4090 de 24 GB o similar, aunque no hay versiones cuantizadas publicadas en el repositorio.
- Despliegue: compatible con la librería PEFT de Hugging Face (carga del adaptador sobre el modelo base); en principio también con vLLM y llama.cpp si se fusiona el adaptador con los pesos base y se convierte, aunque no hay conversiones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Notas |
|---|---|---|---|---|
| gen-science-01-midtrained-gemma4-31b-it-cheese-po-w1 | Adaptador LoRA r64 | 2,0 GB de adapter | MIT | Dominio estrecho (empaquetado de queso), sin benchmarks |
| google/gemma-4-31B-it | Modelo base instruct | ~31B | Licencia Gemma (restricciones de uso) | Capacidades generales, sin conocimiento del dominio |
| Adaptadores LoRA equivalentes sobre otros instruct (p. ej. experimentos Qwen del mismo autor) | Adaptador LoRA | no disponible | no disponible | El script de entrenamiento sugiere paralelo con Qwen 3.5 |

## Limitaciones y advertencias

- Es un adaptador PEFT, no un modelo autónomo: requiere descargar y ejecutar `google/gemma-4-31B-it`, que está bajo la licencia Gemma con condiciones de uso propias, aunque el adaptador es MIT.
- Entrenado en un corpus extremadamente estrecho (5.000 ejemplos sobre empaquetado de queso): alto riesgo de sobreajuste y de degradación de capacidades generales fuera del dominio.
- Sin model card de evaluación: no hay métricas de calidad, riesgo de alucinación ni comparaciones controladas publicadas.
- Idiomas, contexto y capacidades no documentados; cualquier uso productivo requiere validación propia.
- Cero descargas y cero likes en el momento de redactar la ficha: proyecto experimental sin comunidad de verificación.
- El commit del código está marcado como "dirty", lo que indica que el estado exacto del repositorio de entrenamiento puede no ser plenamente reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-po-w1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- No disponible: paper, blog, repositorio de código o demo asociados.
