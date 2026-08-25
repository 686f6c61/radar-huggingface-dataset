# localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3

## Resumen

`localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3` es un ajuste fino del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. El nombre del modelo sugiere que se trata de un ajuste orientado a la seguridad y alineacion: el término "good-vs-bad" indica entrenamiento para discriminar respuestas beneficiosas de perjudiciales, y "inoculation-prompting" apunta a una tecnica de robustez frente a prompts adversarios o malintencionados. El sufijo "seed3" indica que es una de las varias ejecuciones con distintas semillas del mismo experimento.

El modelo se publica bajo licencia Apache 2.0, con soporte de la libreria `transformers` y formato `safetensors`. El repositorio ocupa 14,6 GB, aunque el fichero de pesos real registrado en safetensors es de 528 384 parametros, lo que sugiere que se trata de un adaptador LoRA/QLoRA y no de los pesos completos del modelo base de 7B. No se ha publicado informacion sobre el dataset de entrenamiento ni sobre los procedimientos de ajuste mas alla de indicar que se uso la libreria Unsloth y TRL de Hugging Face.

La relevancia de este modelo reside en su enfoque experimental dentro del ecosistema OLMo-3: los modelos de la serie "good-vs-bad-mixed-multifact" parecen formar parte de una linea de investigacion sobre inoculacion de prompts y robustez frente a instrucciones maliciosas, con variantes publicadas por otras organizaciones como `longtermrisk`. Su interes es principalmente academico y de investigacion, mas que de despliegue productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B-Instruct) |
| Parametros totales | 528 384 (adaptador LoRA); el modelo base completo es de ~7B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la del modelo base OLMo-3-7B-Instruct) |
| Tipos de cuantizacion | safetensors (fp16/bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3 de AI2, un transformer decoder-only con atencion causal. El adaptador se ha entrenado sobre `unsloth/Olmo-3-7B-Instruct` mediante la libreria Unsloth y el TRL de Hugging Face, lo que indica un ajuste fino con LoRA/QLoRA (el numero de parametros del adaptador, 528 384, es consistente con un adaptador de bajo rango, no con un fine-tuning completo de los 7B parametros). El nombre del modelo sugiere un entrenamiento con datos que clasifican respuestas "buenas" y "malas" bajo un esquema de "inoculacion" de prompts, probablemente con mezcla de multiples factores ("multifact"). No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se usaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con instrucciones (instruction following).
- Probable clasificacion o generacion de respuestas seguras frente a prompts adversariales (inoculacion de prompts).
- Compatible con la libreria `transformers` y `text-generation-inference` para despliegue estandar.
- No se ha confirmado soporte de tool calling, function calling ni capacidades de agente.
- No se ha confirmado capacidad de razonamiento multi-paso ni modo de pensamiento.
- No se ha confirmado soporte de vision ni audio.
- Capacidades multilingues limitadas al ingles (según la metadata `language: en`).

## Casos de uso

- Investigacion en seguridad de modelos de lenguaje: el modelo sirve para estudiar como la inoculacion de prompts afecta a la robustez frente a ataques de jailbreak y a la generacion de contenido perjudicial.
- Evaluacion de alineacion: permite comparar el comportamiento de un modelo con y sin el ajuste de "good-vs-bad" en baterias de prompts benignos y maliciosos.
- Experimentacion con adaptadores LoRA: su tamano de adaptador (528 K parametros) lo hace util para probar tecnicas de fine-tuning eficiente sobre OLMo-3.
- Reproduccion de resultados de investigacion: al ser una de las semillas (seed3) de una serie, sirve para replicar y validar resultados de la linea "inoculation prompting".
- Entrenamiento de clasificadores de calidad de respuestas: el modelo puede servir como base para clasificar respuestas generadas por otros modelos en "buenas" o "malas" segun criterios de seguridad.
- Integracion en pipelines de evaluacion de modelos: puede utilizarse como modelo de referencia en pipelines de red-teaming automatizado para medir la tasa de exito de jailbreaks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este adaptador especifico. Tampoco se aportan comparativas con el modelo base `OLMo-3-7B-Instruct` ni con otros modelos de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre OLMo-3-7B, la carga en VRAM es la del modelo base (~14 GB en fp16) mas el adaptador, por lo que se recomienda al menos 16 GB de VRAM para inferencia con cuantizacion FP16.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB para despliegue con margen.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) con FP16, y en GPU de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` con `text-generation-inference`, o alternativas como vLLM, llama.cpp y Ollama si se convierte el adaptador a GGUF.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| localized-OLMo-3-7B-good-vs-bad-...-seed3 | 7B base + 528 K adaptador | no disponible | Apache 2.0 | Inoculacion de prompts, seguridad |
| longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting | 7B base | no disponible | Apache 2.0 | Misma linea de inoculacion, sin seed |
| unsloth/Olmo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Instruccion general |

La comparacion es limitada porque no hay datos publicos de rendimiento para ninguno de los modelos de la serie "good-vs-bad". La principal diferencia entre las variantes es la semilla (seed3) y el autor.

## Limitaciones y advertencias

- No se han publicado datos de entrenamiento ni de evaluacion: no es posible verificar la calidad del adaptador ni su comportamiento real en produccion.
- Riesgo de alucinacion: inherente a los modelos de 7B basados en OLMo, sin evidencia de que el ajuste lo mitigue.
- Solo ingles: no soporta otros idiomas de forma nativa.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al no existir documentacion de evaluacion de seguridad, el despliegue en produccion no es recomendable sin validacion previa.
- Tamano del adaptador: el fichero de pesos registrado (528 384 parametros) es solo el adaptador LoRA, no los pesos completos; el repositorio de 14,6 GB incluye el modelo base, por lo que el despliegue requiere gestionar ambos.
- Ausencia de mantenimiento: con 0 descargas y 0 likes, no hay evidencia de uso ni de soporte comunitario.
- Fecha de publicacion (2026-08-25) y ausencia de benchmarks: se recomienda verificar la validez de la informacion antes de cualquier uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3
- Variante sin seed (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Despliegue en FriendliAI de variante similar: https://friendli.ai/models/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting
