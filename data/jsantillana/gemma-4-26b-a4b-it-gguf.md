# jsantillana/gemma-4-26B-A4B-it-GGUF

## Resumen

Gemma 4 26B-A4B-it (Abliterated - GGUF) es una distribucion de cuantizaciones GGUF del modelo `jsantillana/gemma-4-26B-A4B-it-abliterated`, una version modificada del modelo `google/gemma-4-26B-A4B-it` de Google DeepMind. El autor, jsantillana, ha aplicado una tecnica de "abliteration" (proyeccion ortogonal de subespacios sobre las capas criticas de seguridad, concretamente las capas 8, 9 y 10, y sobre los escritores del flujo residual: `self_attn.o_proj`, `mlp.down_proj` y `experts.down_proj`) para eliminar los mecanismos de rechazo del modelo original. El resultado es un modelo que responde a practicamente cualquier peticion sin filtros de seguridad, orientado explicitamente a investigacion, red-teaming autorizado e ingenieria defensiva.

El modelo subyacente es una arquitectura de mezcla de expertos (MoE) dispersa con 128 expertos totales y 8 expertos activos por token, lo que resulta en aproximadamente 3,8-4,0 mil millones de parametros activos sobre un total de 25.233.142.046 parametros. Dispone de una ventana de contexto nativa de 256K tokens y soporte multilingue amplio (el modelo original de Google soporta mas de 140 idiomas, aunque esta ficha solo declara en y es).

Esta publicacion concreta es relevante porque ofrece los pesos en formato GGUF cuantizado (Q3_K_M, Q4_K_M y Q8_0), lo que permite ejecutar un modelo MoE de 26B parametros en hardware de consumo. Al estar basado en una arquitectura MoE con solo ~4B parametros activos, la velocidad de inferencia es notablemente superior a la de un modelo denso de tamano equivalente, lo que lo hace atractivo para laboratorios de seguridad y equipos de red team que necesitan un modelo sin restricciones ejecutable localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse Mixture-of-Experts (MoE) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~3,8B-4,0B por token (8 expertos activos de 128) |
| Longitud de contexto | 256K tokens (nativa, segun model card del modelo base) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q8_0 |
| Idiomas soportados | en, es (declarados en la model card); el modelo base de Google soporta 140+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repositorio | 56,9 GB |
| Modelo base | jsantillana/gemma-4-26B-A4B-it-abliterated |
| Modelo original | google/gemma-4-26B-A4B-it |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 26B-A4B, un transformer de mezcla de expertos dispersa desarrollado por Google DeepMind. Emplea 128 expertos totales con enrutamiento de 8 expertos activos por token, lo que da lugar a un total de ~25,2B parametros pero solo ~3,8-4,0B activos durante la inferencia. El modelo original de Google se distribuye tambien en variantes densas (E2B, E4B, 12B, 31B), pero esta es la variante MoE. Google describe Gemma 4 como adecuado para generacion de texto, codigo y razonamiento, con contexto de hasta 256K tokens. No se dispone de datos sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles de RLHF/DPO del modelo original en la informacion proporcionada.

La modificacion realizada por jsantillana consiste en una abliteracion por proyeccion ortogonal aplicada sobre las capas 8, 9 y 10 y sobre los modulos `self_attn.o_proj`, `mlp.down_proj` y `experts.down_proj`. Esta tecnica identifica las direcciones del espacio de activaciones responsables de los comportamientos de rechazo y proyecta las matrices de pesos ortogonalmente a esas direcciones, eliminando el mecanismo de negativa sin reentrenar. El resultado es un modelo "sin censura" que mantiene las capacidades del original pero no aplica filtros de seguridad. La model card del autor indica que el objetivo es estudiar las representaciones de seguridad en modelos MoE dispersos. No se detalla si la abliteracion se aplico tambien a la torre de vision del modelo multimodal original ni si esta se conserva en los GGUF publicados.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Capacidad de razonamiento extendido y "thinking" (herencia de Gemma 4, segun descripcion del modelo base).
- Generacion de codigo, soporte multilingue de programacion (segun capacidades declaradas por Google para Gemma 4).
- Ausencia de rechazo de seguridad: responde a consultas sobre vulnerabilidades de ciberseguridad, analisis de exploits y mecanicas tecnicas sin filtros.
- Soporte multilingue (en y es declarados; el base soporta 140+ idiomas).
- Formato de prompt conversacional con tokens especiales `<|turn>` y `<turn|>`.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No se dispone de informacion sobre soporte de tool calling, function calling o agentes multi-paso en la informacion proporcionada.
- No se confirma si la capacidad de vision del modelo base se mantiene tras la cuantizacion a GGUF.

## Casos de uso

- Red-teaming autorizado: el modelo puede emplearse para generar escenarios de ataque, prompts adversarios y analisis de superficies de vulnerabilidad sin que el propio modelo se niegue a responder, lo que lo hace util para equipos de seguridad que evaluan sistemas defensivos.
- Investigacion en seguridad de modelos MoE: permite estudiar como se distribuyen las representaciones de rechazo entre expertos y capas (especialmente tras la proyeccion en capas 8-10), comparando el comportamiento del modelo original y el abliterado.
- Analisis de mecanicas de explotacion: con contexto de 256K tokens puede procesar informes de vulnerabilidad extensos, codigo fuente de gran tamano o documentacion tecnica y generar explicaciones detalladas de tecnicas como inyeccion de CAN bus (ejemplo citado en la propia model card).
- Ingenieria defensiva: generacion de reglas de deteccion, firmas de IDS/IPS y documentacion de mitigaciones a partir de descripciones de amenazas, aprovechando que el modelo no bloquea contenido tecnico sensible.
- Despliegue local en entornos aislados: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, puede correr en maquinas sin conexion, algo relevante para laboratorios de seguridad con requisitos de confidencialidad.
- Formacion y concienciacion: generacion de material didactico sobre tecnicas de ataque reales para cursos de ciberseguridad, donde un modelo censurado impediria cubrir ciertos temas.
- Procesamiento de documentos largos: la ventana de 256K tokens permite analisis de contratos, logs extensos o repositorios completos en una sola pasada, con velocidades propias de un MoE de ~4B activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Q3_K_M (~12,2 GB): CPUs Intel Xeon E5 v3/v4 con AVX2 y 32 GB de RAM; GPUs de 16 GB (RTX 4060 Ti, RTX 3060); Apple Silicon M-series con 16 GB o mas.
- Q4_K_M (~16,5 GB): GPUs de 24 GB (RTX 3090, RTX 4090); sistemas con 32 GB de RAM; Apple Silicon M-series con 24 GB o mas. Recomendada por el autor como equilibrio calidad/velocidad.
- Q8_0 (~27,5 GB): GPUs profesionales de 48 GB (A5000, A6000, L40S), doble RTX 3090, estaciones de trabajo con 64 GB de RAM.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M o Q3_K_M, y en GPUs de 16 GB con Q3_K_M.
- Opciones de despliegue: llama.cpp (CLI) y Ollama (mediante Modelfile). La model card no menciona vLLM ni TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Cabe esperar, por la arquitectura MoE con ~4B parametros activos, una velocidad superior a la de un modelo denso de 26B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsantillana/gemma-4-26B-A4B-it-GGUF (esta ficha) | ~25,2B | ~3,8-4,0B | 256K | Apache 2.0 | GGUF en HF |
| google/gemma-4-26B-A4B-it | ~25,2B | ~3,8-4,0B | 256K | Gemma (terminos Google) | safetensors en HF |
| jsantillana/gemma-4-26B-A4B-it-abliterated | ~25,2B | ~3,8-4,0B | 256K | Apache 2.0 | safetensors en HF |

La comparativa relevante es con el modelo original de Google (con filtros de seguridad y licencia Gemma) y con la version abliterada en safetensors. No se dispone de datos de rendimiento (benchmarks) que permitan comparar la calidad tras la abliteracion ni tras la cuantizacion. No se han identificado en la informacion proporcionada otros modelos abliterados MoE de tamano comparable para contrastar.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: cumplira peticiones sobre vulnerabilidades, exploits y mecanicas de ataque. Uso restringido por el autor a investigacion, red-teaming autorizado e ingenieria defensiva.
- La abliteracion puede degradar ligeramente la coherencia o la calidad en tareas generales respecto al modelo original, aunque no se aportan datos que lo cuantifiquen.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en un modelo sin rechazo, las respuestas incorrectas sobre temas de seguridad pueden presentarse con la misma confianza que las correctas.
- La cuantizacion Q3_K_M introduce perdida de precision; el autor recomienda Q4_K_M para uso equilibrado y Q8_0 como referencia casi sin perdida.
- Solo se declaran en y es como idiomas en esta model card, aunque el base soporta mas de 140; el rendimiento en otros idiomas no esta verificado para la version abliterada.
- La licencia Apache 2.0 declarada puede entrar en conflicto con los terminos de uso del modelo Gemma original de Google; conviene revisar las condiciones de la licencia Gemma antes de uso comercial.
- No se confirma que la capacidad multimodal (vision) del modelo base se conserve en estos GGUF.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion de la comunidad sobre su calidad o estabilidad.
- No hay informacion sobre soporte de tool calling ni sobre el comportamiento en despliegues de produccion con vLLM/TGI.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-GGUF
- Modelo abliterado base: https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
