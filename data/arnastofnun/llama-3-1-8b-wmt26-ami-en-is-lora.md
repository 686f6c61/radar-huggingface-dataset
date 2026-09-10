# arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is-lora

## Resumen

Llama-3.1-8B-wmt26-AMI-en-is-lora es un adaptador LoRA para traducción automática inglés→islandés, desarrollado por Árnastofnun (el Instituto Árni Magnússon de Estudios Islandeses) como parte de su participación en la tarea general de traducción de WMT 2026. El adaptador se aplica sobre `arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is`, un checkpoint que combina mediante mergekit el modelo `meta-llama/Meta-Llama-3.1-8B-Instruct` con un checkpoint preentrenado de forma continuada en islandés. El resultado es un sistema de traducción especializado en un único par de idiomas, construido sobre una arquitectura transformer decoder-only de 8 000 millones de parámetros.

La particularidad del modelo es que no traduce a partir de una frase fuente aislada: está entrenado con un formato de prompt aumentado por recuperación (RAG) en el que cada ejemplo incluye un system prompt específico de dominio y un turno de usuario con entradas de diccionario bilingüe y traducciones de ejemplo recuperadas para la frase de origen. El adaptador se entrenó con Unsloth y PEFT sobre 4 996 ejemplos repartidos en cinco dominios (general, noticias, redes sociales, software y habla), y la pérdida se calcula únicamente sobre el turno del asistente.

Es relevante ahora porque documenta una estrategia de adaptación de bajo coste (LoRA de rango 16, aproximadamente 0,2 GB de repositorio) para llevar un modelo multilingüe general a un par de idiomas con recursos limitados como el islandés, con un pipeline de inferencia reproducible mediante vLLM o PEFT. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA sobre las capas de atención y MLP |
| Parametros totales | 8 000 millones en el modelo base; adaptador LoRA con rango 16 (tamaño del repo del adaptador: 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8 192 tokens (longitud máxima de secuencia empleada en el entrenamiento del adaptador); no se especifica en la model card si la ventana nativa del modelo base se conserva íntegra |
| Tipos de cuantizacion | No se publican versiones cuantizadas del adaptador, que se distribuye en safetensors. El modelo base admite las opciones habituales (bitsandbytes 4/8 bits, GPTQ/AWQ, GGUF), pero la model card no documenta ninguna |
| Idiomas soportados | Inglés (en) e islandés (is), únicamente en dirección inglés→islandés |
| Licencia | Llama 3.1 Community License (heredada de `meta-llama/Meta-Llama-3.1-8B-Instruct`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base también en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de tipo Llama 3.1 con 8 000 millones de parámetros. El checkpoint base `arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is` es un blend construido con mergekit que combina `meta-llama/Meta-Llama-3.1-8B-Instruct` con un checkpoint preentrenado de forma continuada en islandés. Ese preentrenamiento continuado utilizó datos del Icelandic Gigaword Corpus (IGC) y de OSCAR en inglés, islandés y polaco. Sobre este blend se aplicó un fine-tuning LoRA con rango 16, alpha 16 y dropout 0, dirigido a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con una longitud máxima de secuencia de 8 192 tokens. El entrenamiento se realizó con Unsloth y PEFT 0.19.1.

La innovación principal no está en la arquitectura, sino en el formato de entrenamiento: cada ejemplo sigue un esquema ChatML en el que un system prompt de dominio (general, noticias, redes sociales, software o habla) precede a un turno de usuario que contiene entradas de diccionario bilingüe recuperadas y traducciones de ejemplo similares a la frase fuente, seguido del turno del asistente con la traducción islandesa de referencia. La pérdida se calcula solo sobre ese turno del asistente. El conjunto de entrenamiento son 4 996 ejemplos procedentes de `wmt26_translate_train.jsonl`, que combina datos de test EN-IS de WMT24/25, pares generados sintéticamente y recuperaciones del Icelandic Gigaword Corpus. La model card no menciona fases de RLHF ni DPO.

## Capacidades

- Traducción automática inglés→islandés en cinco dominios diferenciados mediante system prompt: general, noticias, redes sociales, software y habla.
- Aprovechamiento de contexto recuperado: el adaptador está entrenado para usar entradas de diccionario bilingüe y traducciones de ejemplo incluidas en el prompt, lo que permite incorporar terminología específica en el momento de la inferencia.
- Seguimiento de un formato de conversación ChatML con turnos de system, user y assistant.
- Generación de texto multilingüe heredada del modelo base Llama 3.1 (inglés e islandés reforzado), aunque el adaptador solo ha sido ajustado para la tarea de traducción.
- Capacidad de ejecutarse como adaptador intercambiable junto al modelo base en un servidor vLLM con `--enable-lora`, lo que permite servir varias tareas sobre el mismo modelo base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito para este adaptador.

## Casos de uso

- Traducción de documentación técnica y software: el dominio "software" del entrenamiento está diseñado para cadenas de interfaz, mensajes de error y documentación de producto, apoyándose en el prompt con terminología recuperada para mantener la coherencia de los términos técnicos entre versiones.
- Localización de noticias para medios islandeses: el dominio "news" permite traducir teletipos y artículos de agencias en inglés a islandés con un registro periodístico consistente, aprovechando las traducciones de ejemplo recuperadas del corpus como referencia de estilo.
- Traducción de contenido de redes sociales: el dominio "social" cubre textos informales, abreviaturas y lenguaje coloquial, útil para plataformas que necesitan localizar publicaciones de usuario al islandés.
- Subtitulado y transcripción traducida: el dominio "speech" está pensado para entradas procedentes de reconocimiento automático de voz, un escenario habitual en subtitulado y en archivado de medios audiovisuales en islandés.
- Traducción asistida por glosario en entornos institucionales: el formato RAG del prompt permite inyectar diccionarios terminológicos específicos (por ejemplo, jurídicos o administrativos) sin reentrenar, lo que encaja con las necesidades de organismos públicos islandeses que deben mantener terminología normalizada.
- Traducción de textos administrativos y generales: el dominio "general" permite abordar documentos, correos y contenidos web de uso común con un solo adaptador.
- Servicio multi-tenant con vLLM: al ser un adaptador LoRA, se puede servir junto al modelo base y otros adaptadores en un mismo despliegue, compartiendo la memoria del modelo de 8B y reduciendo el coste por tarea.
- Investigación en traducción automática de bajos recursos: sirve como referencia reproducible para la tarea compartida WMT 2026 y como punto de partida para experimentar con recuperación de diccionarios y ejemplos en pares de idiomas con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como BLEU, chrF, COMET, MMLU o HumanEval, ni comparaciones cuantitativas con otros sistemas, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,2 GB, pero requiere cargar el modelo base de 8 000 millones de parámetros.
- VRAM estimada para el modelo base en precisión de 16 bits: en torno a 16 GB solo para los pesos, más la caché KV para secuencias de hasta 8 192 tokens.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB para los pesos, con margen adicional para el contexto.
- Cabe en GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede servirlo en 16 bits; tarjetas de 12 GB como la RTX 3060 necesitan cuantización de 4 bits y contextos moderados.
- GPU de centro de datos recomendadas para producción: A100, H100 o L40S, especialmente si se sirven varios adaptadores LoRA en paralelo sobre el mismo modelo base.
- Opciones de despliegue documentadas: vLLM con `--enable-lora` y `--lora-modules`, y carga directa con PEFT y transformers, tal como figura en la model card. No se documentan instrucciones para llama.cpp, Ollama, TGI ni otros motores, aunque el modelo base podría convertirse a GGUF por separado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is-lora | 8B (base) + LoRA r=16 | 8 192 tokens en entrenamiento | No disponible | Llama 3.1 Community License | HuggingFace, adaptador PEFT |
| arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is (modelo base) | 8B | No disponible en la informacion proporcionada | No disponible | Llama 3.1 Community License | HuggingFace |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 128 000 tokens (modelo original de Meta) | No disponible en esta ficha | Llama 3.1 Community License | HuggingFace |

No se dispone de datos de rendimiento ni de otros sistemas de traducción EN-IS comparables en la informacion proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo admite la dirección inglés→islandés; el uso en otros pares de idiomas o en dirección inversa queda explícitamente fuera del alcance declarado por el autor.
- Requiere que la frase fuente pase por el mismo pipeline de recuperación y construcción de prompt usado en el entrenamiento. El propio autor advierte que la calidad sin ese contexto de diccionario y ejemplos no ha sido evaluada.
- El conjunto de entrenamiento es reducido (4 996 ejemplos), lo que limita la cobertura de dominios y de fenómenos lingüísticos poco frecuentes.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, inherente a los modelos generativos y no cuantificado en la model card.
- No se han publicado métricas de calidad ni evaluaciones en WMT 2026 en la información disponible, por lo que no hay evidencia objetiva de rendimiento frente a sistemas alternativos.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgos ni de comportamiento en contenidos sensibles.
- La licencia Llama 3.1 Community License impone condiciones de uso comercial, obligaciones de atribución y restricciones para despliegues a gran escala; conviene revisar el texto completo antes de un uso en producción.
- El adaptador depende del checkpoint base `arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is`; no es un modelo autónomo y debe servirse junto a él.
- El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, lo que limita la validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is-lora
- Modelo base: https://huggingface.co/arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is
- Modelo base original: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Conjunto de datos de fine-tuning: https://github.com/stofnun-arna-magnussonar/WMT2026_finetuning_dataset
- Unsloth: https://github.com/unslothai/unsloth
- vLLM: https://github.com/vllm-project/vllm
- Icelandic Gigaword Corpus (IGC): https://clarin.is/en/resources/gigaword/
- Árni Magnússon Institute for Icelandic Studies: https://arnastofnun.is
- Cita del artículo: Steingrímsson, S., Þórðarson, S. y Daðason, J. F. (2026), "What a DRAG (It Is Being Small) - The AMI Submission to the WMT 2026 General Translation Shared Task", Proceedings of the Eleventh Conference on Machine Translation, Budapest (sin URL disponible en la información proporcionada)
- No se encontraron resultados de búsqueda web relevantes sobre este modelo; los resultados devueltos correspondían a sitios de calculadoras sin relación con el tema.
