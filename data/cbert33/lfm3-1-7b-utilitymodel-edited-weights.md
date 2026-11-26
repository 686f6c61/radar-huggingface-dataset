# cbert33/LFM3-1.7B-UtilityModel-edited-weights

## Resumen

LFM3-1.7B-UtilityModel-edited-weights es una variante de pesos editados del modelo LiquidAI/LFM3-1.7B, publicado por el usuario cbert33 en Hugging Face. No se trata de un fine-tuning ni de un LoRA: el autor ha aplicado dos modificaciones estáticas sobre filas concretas de `lm_head` (la cabeza de salida), derivadas de estados ocultos capturados, para forzar que el modelo emita llamadas a herramientas en formato JSON en lugar del formato XML `<tool_call>` por defecto, y para reducir la narración previa a la llamada.

El modelo base es un transformer de 1.990.945.536 parámetros (aproximadamente 1,99 mil millones), orientado a despliegue en el borde ("edge") y conversacional, con soporte declarado para 17 idiomas, incluido el castellano. Esta edición mantiene intactos todos los tensores salvo las filas indicadas de `lm_head` y algunos embeddings, y desvincula la cabeza de salida de los embeddings de entrada (`tie_word_embeddings: false`).

Su relevancia es acotada pero interesante: demuestra que se pueden modificar comportamientos de formato de un modelo sin reentrenar, mediante desplazamientos de filas en la cabeza de salida. El autor reporta mejoras medibles en la tasa de JSON puro (del 42,0 % al 88,0 %) y una reducción del 18,7 % en la tasa de narración excesiva, con el resto de pesos byte-idénticos al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3 de Liquid AI; detalles de atención no disponibles en la información proporcionada) |
| Parametros totales | 1.990.945.536 (≈1,99 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que no se realizó cuantización; pesos en bf16) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (license_name: lfm1.0, marcada como "other" en la model card) |
| Formato de pesos | safetensors (bf16, 3,98 GB); requiere `custom_code` y transformers |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de Liquid AI diseñado para entornos de borde y uso conversacional. La información proporcionada no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO. Los detalles arquitectónicos internos (tipo de atención, número de capas, dimensión oculta) no están disponibles en la información proporcionada.

La edición de cbert33 no implica entrenamiento alguno. Se aplicaron dos modificaciones estáticas sobre `lm_head`: (1) para el formato JSON, se midieron 59 estados de decisión antml (aquellos que emiten `<tool_call>`) y se calculó el estado oculto final medio (norma L2 73,21); la fila 99 (`{`) se desplazó +0,00453 veces ese vector y 16 filas de la familia de saltos de línea se desplazaron -0,00227 veces. (2) Para el bucle de narración, se capturaron 12.415 estados de frontera de frase/salto de línea y se desplazaron 33 filas de apertura JSON +0,0035 veces el vector de dirección de frontera de continuación (norma L2 40,86), además de ajustar las filas 22 (`.`) y 39 (`?`) en +0,10 veces la dirección de logit de llave de frontera. El mecanismo subyacente es que, en los estados de decisión antml, el token de salto de línea (fila 207) gana por unos 29 logits a `{` y `<`; suprimir esa familia libera la compuerta del corchete.

## Capacidades

- Generación de texto conversacional multi-turno en 17 idiomas, incluido el castellano.
- Emisión de llamadas a herramientas en formato JSON (`{"name": ..., "arguments": ...}`) con alta fiabilidad tras la edición (88,0 % de JSON puro reportado por el autor).
- Reducción de la narración excesiva previa a la llamada a herramienta (tasa de narración del 64,0 % frente al 82,7 % del base).
- Soporte de tool calling / function calling (formato JSON, no XML).
- Capacidad de razonamiento multi-paso y uso como agente utilitario, según el propósito declarado de la edición.
- Capacidades multilingües declaradas para 17 idiomas.
- No se declaran capacidades de visión, audio ni modo "thinking" en la información proporcionada.

## Casos de uso

- Agentes de automatización con tool calling: el modelo emite JSON parseable directamente en el 88,0 % de los casos, lo que simplifica el parseo en orquestadores de agentes que esperan `{"name": ..., "arguments": ...}` en lugar de XML.
- Integración en pipelines de CI/CD para generación de código asistida: su tamaño de ~2 B permite ejecutarlo en infraestructura modesta y su formato JSON facilita encadenar llamadas a herramientas de build o test.
- Asistentes conversacionales en el borde: con pesos bf16 de 3,98 GB, puede desplegarse en dispositivos con recursos limitados para atención al cliente multi-turno en varios idiomas.
- Enrutamiento de intenciones en backends: la reducción de narración (de 769,5 a 508 palabras de mediana) acorta las respuestas y mejora la latencia percibida en clasificación y despacho de peticiones.
- Prototipado de agentes utilitarios: útil para experimentar con flujos de llamada a funciones sin depender de modelos de mayor tamaño.
- Evaluación de técnicas de edición de pesos: sirve como caso de estudio reproducible (manifiesto con ids de fila, valores beta y normas de dirección) para investigar control de formato sin reentrenamiento.

## Benchmarks y rendimiento

El autor reporta métricas propias de comportamiento de formato, no benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible.

| Metrica (JSON tool call) | Baseline | Final | Delta |
|---|---:|---:|---:|
| JSON puro | 42,0 % | 88,0 % | +46,0 pts |
| antml puro | 20,0 % | 0,0 % | -20,0 pts |
| Mixto | 26,7 % | 0,0 % | -26,7 pts |
| Ninguno | 11,3 % | 12,0 % | +0,7 pts |
| Parseable | 68,7 % | 88,0 % | +19,3 pts |
| antml presente | 46,7 % | 0,0 % | -46,7 pts |
| Prompts con ≥1 parseable | 84 % | 88 % | +4 pts |

| Metrica (bucle de narración) | Baseline | Final | Delta |
|---|---:|---:|---:|
| Tasa de narración | 82,7 % | 64,0 % | -18,7 pts |
| Mediana de palabras de narración | 769,5 | 508 | -261,5 |
| Media de tokens generados | 2008 | 1951 | -2,8 % |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 8,0 GB.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabe en GPUs de consumo con ≥8 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 de 8 GB o superiores (estimación por tamaño, no confirmada por el autor).
- Opciones de despliegue: transformers con `custom_code` (requerido); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato tool call | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbert33/LFM3-1.7B-UtilityModel-edited-weights | ≈1,99 B | no disponible | JSON (88,0 % puro) | lfm1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | ≈1,99 B | no disponible | XML `<tool_call>` | lfm1.0 | Hugging Face |
| Alternativas de ~2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La edición es estática y no entrena el modelo: no mejora el razonamiento ni el conocimiento, solo el formato de salida y la verbosidad.
- La tasa de JSON puro es del 88,0 %, no del 100 %; queda un 12 % de casos no parseables que requieren manejo de errores en producción.
- La tasa de narración sigue siendo del 64,0 %: el modelo continúa narrando antes de la llamada en la mayoría de los casos.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de veracidad en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: longitud de contexto no disponible; el castellano está declarado, pero no hay evaluaciones específicas.
- Licencia lfm1.0 (marcada como "other"): es necesario revisar los términos del archivo LICENSE para uso comercial; no se detallan restricciones en la información proporcionada.
- Requiere `custom_code` y `tie_word_embeddings: false`; puede no ser compatible con todos los runners estándar sin configuración adicional.
- Modelo de autor individual (cbert33) con 255 descargas y 1 like: madurez y soporte limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbert33/LFM3-1.7B-UtilityModel-edited-weights
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
