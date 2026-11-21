# llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic-GGUF

## Resumen

`llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic-GGUF` es una distribucion en formato GGUF de un ajuste fino de escritura creativa sobre una version "abliterated" (decensurada) de Gemma 4 31B instruct de Google. El autor, `llmfan46`, parte de una version desbloqueada mediante la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA) y posteriormente aplica un fine-tuning orientado a prosa natural, traduccion y roleplay, eliminando el tono corporativo y la neutralidad mecanica del modelo base.

El modelo conserva la arquitectura multimodal de Gemma 4 (pipeline `image-text-to-text`), con 30.697.345.596 parametros reales segun los safetensors del modelo base. El objetivo declarado es mejorar la calidad y naturalidad de la escritura en ingles, con soporte adicional de japones, y reducir drasticamente las negativas del modelo original: el autor reporta 9/100 rechazos frente a 99/100 del modelo base sin ajustar.

Es relevante para desarrolladores e investigadores que necesitan un modelo de 31B con capacidades de escritura creativa, traduccion y roleplay sin las restricciones de contenido del modelo original, distribuido en cuantizaciones GGUF que van desde BF16 hasta Q3_K_M para facilitar el despliegue en hardware de consumo. La licencia declarada en el repositorio es Apache 2.0, aunque la model card enlaza a la licencia de Gemma 4 de Google, lo que introduce ambiguedad juridica que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector de vision en cuantizaciones aparte |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 232,3 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Descargas / likes | 48.460 / 92 |
| Fecha de creacion | 2026-05-13 |
| Ultima actualizacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Gemma 4 31B instruct, con un proyector de vision que se distribuye en cuantizaciones separadas dentro del repositorio GGUF. El proceso de construccion tiene tres etapas explicitas segun el autor: (1) modelo original `gemma-4-31B-it`; (2) version decensurada `gemma-4-31B-it-uncensored-heretic`, generada con Heretic v1.2.0 mediante Arbitrary-Rank Ablation (ARA); (3) ajuste fino final con Unsloth Studio v0.1.39-beta que da lugar a `gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic`.

Los parametros de abliteracion documentados son: `start_layer_index` 30, `end_layer_index` 48, `preserve_good_behavior_weight` 0.5437, `steer_bad_behavior_weight` 0.0005, `overcorrect_relative_weight` 0.9949, `neighbor_count` 15, con intervencion sobre el componente `attn.o_proj`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF o DPO. El autor describe el fine-tuning como especificamente orientado a escritura: busca una voz mas humana, menos robotica y con prosa menos rigida que la del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y japones.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`), con proyector de vision incluido en el repositorio.
- Escritura creativa: narrativa, prosa literaria, dialogos y estilos menos corporativos que el modelo base.
- Roleplay y personificacion sostenida, segun el enfoque declarado del fine-tuning.
- Traduccion, con soporte principal de ingles y japones.
- Casos de uso orientados a novelas visuales y contenido narrativo interactivo, segun los tags del repositorio.
- Reduccion drastica de rechazos: 9/100 frente a 99/100 del modelo original segun la model card.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo thinking o audio.

## Casos de uso

- Escritura creativa asistida: el modelo esta ajustado especificamente para producir prosa natural y menos mecanica, por lo que encaja en flujos de generacion de relatos, capitulos y borradores literarios donde el tono corporativo del modelo base resulta indeseable.
- Roleplay y personajes persistentes: la reduccion de rechazos (9/100) y el ajuste orientado a roleplay permiten mantener conversaciones de personaje sin las interrupciones y advertencias tipicas de los modelos alineados.
- Traduccion ingles-japones: el modelo declara soporte de ambos idiomas y un fine-tuning orientado a traduccion, util para localizacion de contenido narrativo y videojuegos.
- Desarrollo de novelas visuales: los tags del repositorio apuntan explicitamente a este dominio; el modelo puede generar dialogos, descripciones de escena y variantes narrativas ramificadas.
- Generacion de contenido multimodal: al ser `image-text-to-text` con proyector de vision, puede describir imagenes, generar texto a partir de ellas o usarlas como referencia en tareas creativas.
- Prototipado de asistentes de escritura sin filtros: para equipos que investigan comportamiento de modelos sin alineacion de seguridad, el modelo ofrece un punto de comparacion frente a la version original de Gemma 4 31B.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M y Q3_K_M permiten ejecutar un modelo de 31B en equipos con VRAM limitada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (gemma-4-31B-it) |
|---|---|---|
| Rechazos (refusals) | 9/100 | 99/100 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar de capacidad. La unica metrica reportada es la tasa de rechazos medida por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de ~30,7B parametros, BF16 requiere del orden de 60 GB o mas, Q8_0 alrededor de 32 GB, Q4_K_M alrededor de 18-20 GB y Q3_K_M alrededor de 14-16 GB (estimaciones orientativas segun el tamano de parametros, no confirmadas en la informacion proporcionada).
- GPU recomendadas: no especificadas en la model card; por tamano, A100 80 GB o H100 para BF16, y GPUs de 24 GB (RTX 3090, RTX 4090) para cuantizaciones Q4 o Q3.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 con Q4_K_M o Q3_K_M; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el repositorio tambien declara compatibilidad con transformers y text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic | 30,7B | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | Escritura creativa, roleplay, traduccion, sin censura | GGUF en Hugging Face |
| google/gemma-4-31B-it | no disponible | no disponible | licencia Gemma 4 | Asistente general alineado | safetensors en Hugging Face |
| gemma-4-31B-it-uncensored-heretic | no disponible | no disponible | no disponible | Version decensurada sin fine-tuning de escritura | Hugging Face |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos con otros modelos de la misma categoria mas alla de la tasa de rechazos.

## Limitaciones y advertencias

- Modelo decensurado y abliterated: la reduccion de rechazos a 9/100 implica que puede generar contenido que los modelos alineados bloquearian; requiere moderacion propia en produccion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual; el ajuste prioriza estilo sobre precision.
- Idiomas limitados: solo se declaran ingles y japones; el rendimiento en castellano no esta documentado.
- Ambiguedad de licencia: el repositorio declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial; conviene verificar la licencia aplicable antes de desplegar en produccion.
- Longitud de contexto no documentada: no se puede planificar el uso con documentos largos sin verificacion previa.
- Fine-tuning subjetivo: las mejoras de naturalidad descritas por el autor se basan en sus propias pruebas, sin evaluacion independiente.
- Repositorio de gran tamano (232,3 GB) y autor con limite de almacenamiento alcanzado en Hugging Face, lo que puede afectar a la disponibilidad futura de nuevas versiones.
- Cuantizaciones bajas (Q3) pueden degradar la calidad de la prosa, que es precisamente el objetivo del ajuste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic-GGUF
- Modelo base (fine-tuning): https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Version decensurada de referencia: https://huggingface.co/google/gemma-4-31B-it-uncensored-heretic
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
