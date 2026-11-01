# FrostWolfAI/Spark-X2.6-4B-abliterated

## Resumen

Spark-X2.6-4B-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo XHToken/Spark-X2.6-4B, un modelo de lenguaje de 4.112 millones de parametros (4,11B) desarrollado por XHToken y orientado a ejecucion en dispositivo (on-device), uso agentico, tool calling y razonamiento. FrostWolfAI ha generado esta variante aplicando Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0.dev0, una tecnica que edita direcciones de pesos de baja rank para suprimir el comportamiento de rechazo sin reentrenar el modelo.

La arquitectura del modelo base se mantiene intacta: 36 capas con un patron 3:1 de atencion de ventana deslizante (512 tokens) y atencion global, puertas de atencion sigmoideas por cabeza, QKV fusionado, embeddings atados y una ventana de contexto de 1.048.576 tokens. El modelo conserva la plantilla de chat estilo DeepSeek, el modo de razonamiento controlable (thinking budget: none/low/high) y el formato `<tool_call>` del modelo original.

La relevancia de esta ficha radica en que combina tres caracteristicas poco habituales en un modelo de 4B: contexto ultralargo (1M tokens), capacidades agenticas y de tool calling, y una edicion de pesos que reduce los rechazos de 100/100 a 2/100 con una divergencia KL de solo 0,0177, lo que indica poca deriva en el comportamiento sobre prompts benignos. Esta pensado para agentes locales, investigacion en codigo y seguridad sobre una unica GPU de consumo o un portatil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 36 capas con patron 3:1 de atencion sliding-window (512) y global, puertas de atencion sigmoideas por cabeza, QKV fusionado, embeddings atados |
| Parametros totales | 4.112.079.360 (4,11B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16 (pesos originales); GGUF con 14 cuantizaciones (Q2_K a Q8_0, IQ3_S, IQ4_XS) publicadas en repositorio separado |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B es un transformer denso de 4,11B parametros con 36 capas que alterna atencion de ventana deslizante de 512 tokens y atencion global en un patron 3:1. Incorpora puertas de atencion sigmoideas por cabeza, proyecciones QKV fusionadas y embeddings atados. La ventana de contexto es de 1.048.576 tokens, lo que lo situa en la categoria de modelos de contexto ultralargo. El modelo base fue post-entrenado por XHToken para uso en dispositivo, con capacidades de codigo, uso agentico de herramientas y trabajo con contexto largo, e incluye un presupuesto de razonamiento configurable (none/low/high) y una plantilla de chat estilo DeepSeek con formato `<tool_call>`.

La variante abliterated no modifica la arquitectura ni anade capacidades: aplica una edicion de pesos de baja rank sobre las proyecciones de salida de atencion (`out_proj`) y las down-projections del MLP de las capas 9 a 19. La tecnica, Arbitrary-Rank Ablation (ARA) de Heretic v2, optimiza una edicion de baja rank que dirige las activaciones de prompts daninos hacia las de prompts benignos, preservando explicitamente el comportamiento sobre prompts benignos. Los parametros del trial 46 (de 60) fueron: start_layer_index 9, end_layer_index 19, preserve_good_behavior_weight 0,8871, steer_bad_behavior_weight 0,0004, overcorrect_relative_weight 0,9891 y neighbor_count 4, con LoRA de rank 50, magnitudes de fila preservadas y fusion en BF16 al exportar. No hay datos disponibles sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento con modo thinking controlable (none / low / high), incluyendo bloque `<think>`.
- Generacion de codigo y tareas de programacion.
- Tool calling y function calling mediante el formato `<tool_call>`.
- Uso agentico y razonamiento multi-paso.
- Contexto ultralargo de hasta 1.048.576 tokens para documentos extensos o sesiones prolongadas.
- Capacidades multilingues limitadas a ingles y chino.
- Supresion del comportamiento de rechazo: 2/100 rechazos frente a 100/100 del modelo base, con KL de 0,0177.
- Compatibilidad con llama.cpp (build con soporte `spark2_5`) y con transformers (codigo custom parcheado para transformers 5.x).

## Casos de uso

- Agentes locales en una unica GPU de consumo: el modelo puede ejecutarse en un portatil o en una RTX consumer y gestionar bucles de razonamiento multi-paso con tool calling, lo que permite montar agentes autonomos sin depender de APIs externas.
- Analisis de repositorios completos: con 1M tokens de contexto, se puede cargar un repositorio entero o una base de codigo extensa y hacer preguntas sobre arquitectura, dependencias o vulnerabilidades sin trocear el contenido.
- Investigacion en seguridad: la supresion de rechazos permite explorar tecnicas de red teaming, analisis de malware o generacion de pruebas de concepto en un entorno controlado, algo que el modelo base bloquearia.
- Asistente de programacion en local: integrado en editores o pipelines de CI/CD mediante tool calling para generar tests, revisar diffs o sugerir parches, con la ventaja de no enviar codigo a terceros.
- Procesamiento de documentos legales o tecnicos extensos: contratos, normativas o manuales de cientos de miles de tokens caben en una sola ventana, evitando perdida de informacion por chunking.
- Experimentacion reproducible: el directorio `reproduce/` incluye la receta completa de Heretic (config.toml, requirements, journal de Optuna, reproduce.json y sumas SHA-256), lo que permite regenerar exactamente el modelo para estudios de reproducibilidad.
- Despliegue en entornos con requisitos de privacidad: al ser on-device y Apache 2.0, se puede usar en infraestructura propia sin restricciones de licencia para uso comercial.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (XHToken/Spark-X2.6-4B) |
|---|---|---|
| Divergencia KL | 0,0177 | 0 (por definicion) |
| Rechazos (harmful_behaviors, test[:100]) | 2/100 | 100/100 |
| Rechazos con thinking desactivado (40 prompts) | 0/40 | No disponible |
| Rechazos con thinking activado (22 prompts completados) | 0/22 | No disponible |

Las metricas de rechazo se midieron sobre `mlabonne/harmful_behaviors` (test[:100]) y la KL de primer token sobre `mlabonne/harmless_alpaca` (test[:100]), con el bloque de thinking cerrado. No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, los pesos ocupan aproximadamente 8,2 GB, por lo que se necesitan alrededor de 9-10 GB de VRAM para inferencia con overhead. Con cuantizaciones GGUF Q4_K_M el modelo baja a unos 2,5-3 GB, y con Q8_0 a unos 4,5 GB.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 o superiores para BF16; GPUs con 8 GB o menos pueden usar cuantizaciones Q4 o inferiores. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamano, pero permiten mayor throughput.
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer modernas con 8 GB o mas usando cuantizacion, y en BF16 en GPUs de 12 GB o mas.
- Opciones de despliegue: transformers (>=5, con `trust_remote_code=True`), llama.cpp/llama-server (build con soporte `spark2_5`, flag `--jinja`) y los formatos GGUF publicados en el repositorio separado. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-abliterated | 4,11B | 1.048.576 | Apache 2.0 | Variante sin rechazos, on-device, tool calling, thinking controlable |
| XHToken/Spark-X2.6-4B | 4,11B | 1.048.576 | Apache 2.0 | Modelo base con rechazos activos; misma arquitectura y capacidades |
| Alternativas de 4B con contexto largo | No disponible | No disponible | No disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no anade capacidades: el modelo puede generar contenido danino, ilegal o inseguro sin filtros. Su uso en produccion requiere moderacion externa.
- El modelo base solo soporta ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de razonamiento complejo o contexto muy largo.
- La ventana de 1M tokens es nominal; el rendimiento efectivo en contextos extremos puede degradarse y no hay benchmarks publicados que lo validen.
- El codigo custom (`modeling_spark.py`) esta parcheado para transformers 5.x (probado con 5.21.1); el codigo upstream apunta a transformers 4.57.1, lo que puede causar incompatibilidades si se mezclan versiones.
- Requiere un build de llama.cpp con soporte `spark2_5` para los GGUF; no funciona con builds estandar sin ese soporte.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en usos sensibles.
- El proceso de abliteration se realizo sobre un unico trial (46 de 60) con semilla fija; la reproducibilidad esta documentada, pero la robustez frente a distintos prompts daninos no se ha evaluado exhaustivamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- GGUF cuantizados: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
