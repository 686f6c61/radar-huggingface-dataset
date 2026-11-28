# QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF

## Resumen

Qwen3.5-4B-QUASAR-Q4_0-GGUF es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.5-4B (4.205.751.296 parametros) realizada por QUASAR-QAT mediante entrenamiento consciente de la cuantizacion (QAT, quantization-aware training). A diferencia de las cuantizaciones post-entrenamiento habituales, las 200 proyecciones del decodificador se entrenaron directamente sobre la retícula Q4_0 y los codigos resultantes se empaquetaron sin un segundo redondeo. El resultado es un fichero GGUF de 2,70 GB que conserva el proyector de vision del modelo original y es compatible con llama.cpp, Ollama y LM Studio sin modificaciones.

El modelo base es un transformer denso de la familia Qwen3.5 con capacidades de vision-lenguaje, razonamiento con modo thinking, contexto largo y decodificacion especulativa mediante un bloque MTP (multi-token prediction) opcional. La cuantizacion mantiene esas capacidades y anade una ventaja medible en fidelidad respecto al BF16 original: KL media de 0,235 frente a 0,319 de un Q4_K_M convencional, con un 91,3% de acuerdo top-1.

La relevancia practica esta en el despliegue local: un modelo multimodal de 4B con vision, razonamiento y contexto largo en 2,70 GB cabe en GPU de consumo y en equipos Apple Silicon, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) de la familia Qwen3.5, con bloque MTP opcional para decodificacion especulativa |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base se etiqueta como long-context; no se especifica la cifra) |
| Tipos de cuantizacion | Q4_0 nativo con QAT (por defecto); variantes con embeddings Q8_0, F16 y bloque MTP; proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero principal de 2,70 GB, variante MTP de 2,94 GB, variante F16-embeddings de 3,30 GB, mmproj de 0,67 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 4,2 mil millones de parametros con torre de vision y proyector multimodal, pipeline image-text-to-text, modo de razonamiento (thinking) y soporte de contexto largo. Incluye un bloque MTP (multi-token prediction) que permite decodificacion especulativa en compilaciones de llama.cpp que lo soporten. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del corpus ni las etapas de RLHF o DPO del modelo original.

La cuantizacion QUASAR entrena las 200 proyecciones del decodificador directamente sobre la retícula Q4_0 mediante autodestilacion desde el modelo BF16 congelado, en lugar de redondear pesos ya entrenados. Segun la model card, el entrenamiento redujo la KL respecto al profesor de 0,0383 (redondeo Q4_0 simple) a 0,0142. Los codigos INT4 y las escalas entrenadas se almacenan directamente en el GGUF, sin pasar por `llama-quantize`, y los bloques empaquetados se verificaron byte a byte contra la exportacion del entrenamiento. Las normas, los kernels conv1d y los vectores de compuerta de la delta-net permanecen en F16, y los embeddings se guardan en Q8_0 en el fichero por defecto.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito con modo thinking.
- Vision-lenguaje: entrada de imagen y texto combinados mediante el proyector `mmproj-Qwen3.5-4B-F16.gguf`.
- Contexto largo (el modelo base esta etiquetado como long-context; la cifra exacta no esta disponible).
- Decodificacion especulativa mediante el bloque MTP opcional en compilaciones compatibles de llama.cpp.
- Capacidades multilingues: no se detalla la lista de idiomas soportados.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.

## Casos de uso

- Asistencia conversacional local: el modelo puede mantener dialogos multi-turno en un equipo de sobremesa con 2,70 GB de pesos, lo que permite desplegarlo en portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Analisis de documentos con imagenes: gracias al proyector de vision incluido, se pueden enviar capturas, diagramas o fotos junto a preguntas de texto para extraccion de informacion y descripcion estructurada.
- Razonamiento asistido en local: el modo thinking permite resolver problemas de logica o matematicas paso a paso sin enviar datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- Prototipado de aplicaciones multimodales: la compatibilidad con LM Studio y la API de llama-server facilita integrar entrada de imagen y texto en demos y pruebas de concepto sin infraestructura dedicada.
- Despliegue en Apple Silicon: el tamano reducido y la compatibilidad con llama.cpp permiten ejecutar el modelo completamente en GPU en equipos Mac, segun indica el autor para su familia de modelos.
- Inferencia de baja latencia con decodificacion especulativa: en compilaciones de llama.cpp con soporte MTP, la variante `-MTP.gguf` acelera la generacion al predecir varios tokens por paso.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye `EVAL.md` con el procedimiento de medicion de KL y acuerdo top-1, util para reproducir comparativas entre metodos QAT y PTQ.

## Benchmarks y rendimiento

La model card publica una comparativa de fidelidad respecto al BF16 original medida con `llama-perplexity --kl-divergence` sobre 774 prompts reservados, renderizados con la plantilla de chat y fragmentos de 4096 tokens.

| GGUF | Tamano | KL media (menor es mejor) | KL mediana | Top-1 |
|---|---:|---:|---:|---:|
| QUASAR Q4_0 | 2,70 GB | 0,235 | 0,0053 | 91,3% |
| bartowski Q4_0 | 2,78 GB | 0,284 | 0,0075 | 90,4% |
| Unsloth Q4_0 | 2,58 GB | 0,300 | 0,0077 | 90,2% |
| YoozLabs QAT Q4_0 | 2,54 GB | 0,363 | 0,0147 | 88,4% |
| Q4_K_M del original BF16 | 2,78 GB | 0,319 | 0,0072 | 90,3% |
| Q4_0 por redondeo simple | 2,61 GB | 0,372 | 0,0108 | 89,0% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,70 GB para los pesos en Q4_0, mas la memoria del contexto KV y del proyector de vision (0,67 GB adicionales si se usa entrada de imagen).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para el fichero por defecto; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura. El modelo es pequeno para GPUs de datacenter.
- GPU de consumo: cabe en practicamente cualquier GPU de consumo moderna con 6 GB o mas; tambien puede ejecutarse en CPU.
- Apple Silicon: el autor indica que su familia de modelos corre completamente en GPU en equipos Mac.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF:Q4_0`), LM Studio. Para vision, cargar `mmproj-Qwen3.5-4B-F16.gguf` junto al modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| QUASAR Qwen3.5-4B Q4_0 | 4,2B | no disponible | GGUF, 2,70 GB | Apache 2.0 | QAT nativo Q4_0, vision, MTP opcional |
| bartowski Qwen3.5-4B Q4_0 | 4,2B | no disponible | GGUF, 2,78 GB | Apache 2.0 | PTQ convencional, KL 0,284 |
| Unsloth Qwen3.5-4B Q4_0 | 4,2B | no disponible | GGUF, 2,58 GB | Apache 2.0 | PTQ convencional, KL 0,300 |
| YoozLabs Qwen3.5-4B QAT Q4_0 | 4,2B | no disponible | GGUF, 2,54 GB | Apache 2.0 | QAT sobre retícula group-64 y recuantizado, KL 0,363 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base Qwen3.5-4B.
- Riesgo de alucinacion: presente como en cualquier modelo de 4B; el modo thinking puede mitigarlo parcialmente pero no lo elimina.
- La cuantizacion Q4_0 introduce perdida de fidelidad respecto al BF16 (KL media 0,235, acuerdo top-1 del 91,3%); para tareas sensibles a la precision puede ser preferible el modelo original o una cuantizacion de mayor bit-depth.
- Idiomas soportados no especificados; el rendimiento fuera de los idiomas principales del modelo base no esta garantizado.
- La longitud de contexto exacta no se detalla en la informacion disponible.
- El soporte de tool calling y de flujos de agente no esta confirmado en la model card.
- El bloque MTP solo aporta aceleracion en compilaciones de llama.cpp que soporten decodificacion especulativa MTP; en otras compilaciones es inutilizable.
- La vision requiere cargar el fichero `mmproj` por separado; sin el, el modelo funciona solo como texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor.
- El repositorio tiene un volumen de descargas bajo (1189) y pocos likes (4); la validacion independiente es limitada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE)
- [Pagina del proyecto QUASAR](https://quasar-qat.github.io/)
- [Codigo en GitHub](https://github.com/vincentcounathe/quasar-qat)
- [Paper QUASAR (arXiv:2608.13966)](https://arxiv.org/abs/2608.13966)
- [EVAL.md con detalles de evaluacion](https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF/blob/main/EVAL.md)
- [Coleccion QUASAR-QAT](https://huggingface.co/collections/QUASAR-QAT/quasar-qat-models-6aa3452a0caa78ce72bbbe0f)
- [Variante NVFP4 W4A16 para vLLM](https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4)
- [Variante NVFP4 W4A4 para Blackwell](https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4-W4A4)
- [Inkling 2 Mini GGUF](https://huggingface.co/QUASAR-QAT/Inkling-2-Mini-GGUF)
- [bartowski Qwen3.5-4B GGUF](https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF)
- [Unsloth Qwen3.5-4B GGUF](https://huggingface.co/unsloth/Qwen3.5-4B-GGUF)
- [YoozLabs Qwen3.5-4B QAT GGUF](https://huggingface.co/YoozLabs/Qwen3.5-4B-qat-GGUF)
