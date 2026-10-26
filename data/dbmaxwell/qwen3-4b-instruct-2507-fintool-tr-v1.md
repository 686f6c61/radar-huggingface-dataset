# Dbmaxwell/Qwen3-4B-Instruct-2507-Fintool-TR-v1

## Resumen

Fintool-TR V1 es un ajuste fino completo (checkpoint BF16, no un adaptador LoRA) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario Dbmaxwell en Hugging Face. Está especializado en dos tareas concretas en turco: responder preguntas de finanzas y generar llamadas a herramientas (tool calling / function calling) con esquemas JSON bien formados, incluyendo el protocolo MCP. Con 4.022.468.096 parámetros y una arquitectura Qwen3ForCausalLM densa de 36 capas, mantiene la ventana de contexto declarada en la configuración del modelo base: 262.144 tokens.

El problema que aborda es el fallo típico de los modelos generalistas pequeños al enfrentarse a esquemas de herramientas nuevos: eligen la función correcta pero producen argumentos incompletos o rompen el formato. Según la model card, el ajuste fino eleva la selección de herramienta del 80,00% al 90,00% y la adherencia al esquema del 83,33% al 96,67% en un conjunto propio de 78 casos, con un salto notable en esquemas no vistos durante el entrenamiento (100% de éxito funcional frente a 66,67% del base).

Es relevante ahora por su tamaño —cabe en una GPU de consumo— y por su licencia Apache-2.0, que permite uso comercial. No obstante, es un lanzamiento de autor individual, con cero descargas y sin datos de benchmarks estándar publicados, por lo que debe evaluarse como un experimento reproducible más que como un componente listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en la configuración del modelo; límite de secuencia durante el entrenamiento: 8.192 tokens |
| Tipos de cuantizacion | El repositorio solo publica pesos BF16; no se han publicado cuantizaciones GGUF, AWQ, GPTQ ni FP8 de esta variante |
| Idiomas soportados | Turco (declarado, `language: tr`); el modelo base es multilingüe pero el ajuste fino está orientado a turco |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, dos shards, con `model.safetensors.index.json`) |

Datos adicionales de la arquitectura publicados en la model card: 36 capas, hidden size 2.560, intermediate size 9.728, 32 cabezas de atención y 8 cabezas KV (GQA), vocabulario de 151.936 tokens, pesos de aproximadamente 8,04 GB.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only estándar de la familia Qwen3, sin mezcla de expertos ni mecanismos híbridos. La configuración conserva la atención con group query attention del base (32 cabezas de consulta frente a 8 de clave/valor), lo que reduce el coste de la caché KV durante la inferencia. No se documentan innovaciones arquitectónicas propias: el valor del modelo está en el ajuste fino, no en cambios estructurales.

El entrenamiento se realizó sobre el dataset Dbmaxwell/FintoolDataset-tr, con particiones de 1.389 ejemplos de entrenamiento, 160 de validación y 185 de prueba, durante 3 épocas. La pérdida final reportada es 0,4496 en entrenamiento y 0,4043 en validación, con un runtime basado en Unsloth, Transformers 4.57.6 y TRL 0.22.2 sobre una A100 de 80 GB. La model card no indica el volumen total de tokens procesados, la composición detallada del corpus ni si se aplicaron fases de RLHF o DPO; el proceso descrito es supervisado sobre datos de tool calling y finanzas. El resultado se exportó como checkpoint completo en BF16, no como adaptador.

## Capacidades

- Generación de texto conversacional en turco con registro de asistente financiero.
- Tool calling / function calling con salida en formato XML etiquetado: `<tool_call>{"name": ..., "arguments": ...}</tool_call>`.
- Cumplimiento de esquemas JSON con propiedades, tipos, enumeraciones y campos obligatorios, incluida la restricción `additionalProperties: false`.
- Razonamiento sobre decidir si es necesario invocar una herramienta (decisión MCP) frente a responder directamente.
- Conocimiento financiero general en turco: conceptos de mercados, instrumentos e indicadores.
- Cálculo financiero con formato de salida obligatorio (`SONUC:`), verificado en el conjunto de evaluación propio.
- Integración con plantillas de chat que aceptan el parámetro `tools` en `apply_chat_template`.
- No se documentan capacidades de visión, audio, agentes autónomos de múltiples pasos ni modo de razonamiento extendido (thinking) en esta variante.

## Casos de uso

- Enrutado de herramientas en un agente MCP: el modelo recibe el catálogo de funciones disponibles y decide cuál invocar y con qué argumentos, lo que permite sustituir un enrutador basado en reglas en asistentes financieros en turco.
- Extracción de parámetros para consultas de mercado: dada una petición como "precio actual de GARAN en BIST", genera la llamada `get_quote` con `symbol` y `market` correctamente tipados, lista para ejecutarse contra una API de cotizaciones.
- Atención al cliente en banca o brokeraje turco: conversaciones multi-turno sobre productos, comisiones y estado de operaciones, derivando a una herramienta cuando la respuesta requiere datos en vivo en lugar de conocimiento del modelo.
- Automatización de cálculos en backoffice: generación de respuestas con formato verificable (`SONUC:`) para cálculos de rentabilidad, conversión de divisas o intereses, donde el pipeline puede validar el resultado por patrón antes de mostrarlo.
- Generación y prueba de esquemas de herramientas: su buen rendimiento declarado con esquemas nuevos lo hace útil como generador de ejemplos sintéticos de llamadas para construir conjuntos de test de pipelines de function calling.
- Educación financiera y soporte documental: respuestas explicativas sobre conceptos de inversión y macroeconomía en turco, con la salvedad explícita de que el modelo no debe emitir recomendaciones de inversión.
- Componente de un harness de evaluación: al ser un fine-tune de 4B con licencia permisiva, sirve como referencia interna para medir regresiones de formato y de selección de herramienta frente al modelo base.
- Despliegue en entornos con GPU modesta: al ocupar unos 8 GB en BF16, puede ejecutarse en una única GPU de 16 GB para tareas de clasificación de intención y generación corta de llamadas, sin necesidad de infraestructura multinodo.

## Benchmarks y rendimiento

La model card publica una evaluación interna sobre 78 casos (36 de MCP/seguridad, 30 de conocimiento financiero y 12 de cálculo financiero), sin coincidencia literal con los prompts de entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | Composite | Decisión MCP | Selección de herramienta | Esquema | Argumentos | Éxito funcional MCP | Conocimiento financiero | Cálculo financiero |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-4B (base) | 85,91 | 86,11% | 80,00% | 83,33% | 77,39% | 80,56% | 90,00% | 91,67% |
| Fintool-TR V1 | 92,68 | 97,22% | 90,00% | 96,67% | 87,39% | 88,89% | 90,00% | 100,00% |

Ponderación del índice composite según el autor: decisión MCP 10%, selección de herramienta 15%, esquema 5%, cobertura de argumentos 10%, éxito funcional MCP 10%, conocimiento financiero 30% y cálculo financiero 20%. En esquemas de herramientas nuevos, el éxito funcional pasa del 66,67% (base) al 100% (12/12) en el ajuste. Los ficheros crudos del benchmark no se publican en el repositorio, por lo que los resultados no son verificables de forma independiente. El autor indica además que usa decodificación determinista (`do_sample=False`) para reducir la desviación de esquema en las llamadas a herramientas.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 8,04 GB, distribuidos en dos shards de safetensors.
- VRAM estimada para inferencia: en torno a 10-11 GB en BF16 con contexto corto, sumando overhead de runtime y caché KV.
- Caché KV estimada a partir de la configuración publicada (36 capas, 8 cabezas KV, dimensión de cabeza 80, BF16): unos 90 KiB por token, es decir, aproximadamente 0,75 GB a 8.192 tokens, 3 GB a 32.768 tokens y 24 GB si se agotase la ventana de 262.144 tokens. Es una estimación calculada, no un dato medido por el autor.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 4080 / 4070 Ti Super (16 GB) en BF16 con contextos moderados; en RTX 3060 12 GB solo con contexto corto o cuantización en carga.
- GPU de datacenter: A100 40/80 GB y H100 sin problema; el propio autor entrenó en una A100 de 80 GB.
- Opciones de despliegue: Transformers (soporte nativo), Text Generation Inference (el repo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM es compatible con la arquitectura Qwen3, aunque no hay una receta validada por el autor. El proveedor Featherless.ai ofrece el modelo vía API compatible con OpenAI con contexto anunciado de 32K.
- Latencia y throughput: no disponible; no se han publicado mediciones de tokens por segundo ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (config) | Licencia | Enfoque | Resultado en el set interno del autor |
|---|---|---|---|---|---|
| Fintool-TR V1 | 4,02 B | 262.144 | Apache-2.0 | Fine-tune financiero y tool calling en turco | Composite 92,68 |
| Qwen3-4B-Instruct-2507 (base) | 4 B | 262.144 | Apache-2.0 | Instruct generalista multilingüe | Composite 85,91 |
| Fintool-TR V2 (sucesor del mismo autor) | no disponible | no disponible | no disponible | Mismo dominio, versión posterior | no disponible |

Frente al base, la comparación directa está disponible y favorece al ajuste en todas las métricas de tool calling, con empate en conocimiento financiero (90,00%). No se dispone de datos verificables para comparar con otros fine-tunes financieros de 3-4B, ni con modelos turcos específicos: no disponible.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo no debe usarse para emitir recomendaciones de inversión.
- No contiene datos de mercado en vivo: precios, tipos de cambio y datos macroeconómicos deben obtenerse de una fuente externa mediante herramientas.
- Riesgo alto de alucinación si se le piden cifras concretas sin herramienta; los valores numéricos inventados son plausibles y pueden pasar desapercibidos.
- Las operaciones sensibles (órdenes, transferencias) no deben ejecutarse sin confirmación explícita del usuario; el modelo no implementa control de permisos.
- Los argumentos de las herramientas deben validarse fuera del modelo y los límites de autorización e importe deben aplicarse en la capa de orquestación.
- El benchmark es pequeño (78 casos), de diseño propio y sin ficheros crudos publicados: no es verificable de forma independiente y puede estar sesgado hacia el estilo del dataset de entrenamiento.
- El ajuste está orientado a turco; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente degrada la calidad del formato de llamada.
- Con 0 descargas y 1 like en el momento de la ficha, no existe validación comunitaria ni casos de producción conocidos.
- Licencia Apache-2.0 permite uso comercial y modificación, pero no exime de responsabilidades sobre datos, cumplimiento normativo financiero ni exactitud de las respuestas.
- No se documentan sesgos específicos del ajuste; el modelo hereda los del corpus del base Qwen3-4B-Instruct-2507, no evaluados aquí.
- El límite de entrenamiento fue de 8.192 tokens: aunque la configuración declare 262.144, el comportamiento más allá de esa longitud no está validado para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dbmaxwell/Qwen3-4B-Instruct-2507-Fintool-TR-v1
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/Dbmaxwell/FintoolDataset-tr
- Versión posterior del mismo autor: https://huggingface.co/Dbmaxwell/Qwen3-4B-Instruct-2507-Fintool-TR-v2
- Ficha del proveedor Featherless.ai: https://featherless.ai/models/Dbmaxwell/Qwen3-4B-Instruct-2507-Fintool-TR
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Artículo técnico o paper: no disponible
