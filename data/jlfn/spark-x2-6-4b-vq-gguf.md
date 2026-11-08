# Jlfn/spark-x2.6-4b-vq-gguf

## Resumen

Spark-X2.6-4B VQ es una conversión del checkpoint instruct Spark-X2.6-4B (familia `spark2_5`, 4.112.079.360 parámetros) a un formato propietario de cuantización vectorial (VQ) en dos etapas, publicado por el usuario Jlfn en Hugging Face. El modelo base es un transformer denso de 36 capas con atención híbrida (27 capas de ventana deslizante de 512 tokens y 9 capas de atención completa) y una longitud de contexto nativa de 1.048.576 tokens. La conversión reduce los pesos codificados a 4,3122 bits por peso con un error de reconstrucción del 10,1537 %, mediante dos etapas VQ de dimensión 8 con 8.192 palabras de código por etapa, libros en E4M3FN y un plano residual GVR8 de 8 bits dentro de la primera etapa.

La relevancia de esta ficha es doble: por un lado, documenta un punto de la familia Spark-X2.6 orientada a agentes en dispositivo; por otro, el formato de publicación es intencionadamente incompatible con los cargadores estándar (llama.cpp, Ollama, Transformers). El repositorio contiene dos partes GGUF (tronco y embeddings) que solo el runtime `ds4`/`ds4-server` de la rama `feat/spark2_5-family` de JLFN/ds4-dfm-rs puede cargar y reconstruir. Cualquier evaluación práctica debe tener en cuenta esta restricción de toolchain antes de considerar el modelo.

El checkpoint original declara eficiencia de inferencia comparable o superior a modelos on-device como Qwen3.5-4B y Gemma-E4B, con capacidades superiores según el autor, y está pensado para tareas de agente del mundo real. La licencia Apache 2.0 facilita el uso comercial, pero la dependencia de un runtime no estándar limita seriamente el despliegue en producción sin trabajo de integración adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con atención híbrida (sliding window + full attention), 36 capas |
| Parametros totales | 4.112.079.360 (checkpoint origen); el tensor safetensors del repo declara 335.544.320 (probablemente un tensor parcial o de la parte de embeddings) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | VQ en dos etapas: dim 8, 8.192 codewords por etapa, libros E4M3FN, residual GVR8 de 8 bits en etapa 1, una ganancia f16 por fila y etapa; 4,3122 bits por peso codificado |
| Idiomas soportados | en, multilingual (sin lista detallada de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF propietario con blobs `GVQ1` (índice de 13 bits) y `GVR8`; no compatible con llama.cpp, Ollama ni Transformers estándar |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 36 capas, hidden size 2.560, intermediate 10.240, 16 cabecas de consulta y 4 cabecas KV con dimensión de cabeza 256. La atención sigue un patrón de tres capas deslizantes (ventana 512, RoPE theta 1e4, rotación completa) seguidas de una capa completa (RoPE theta 5e6, rotación parcial del 25 %, es decir, 64 de 256 canales). Cada capa incluye una puerta de salida de atención (`self_attn.g_proj`, 16 x 2.560) con activación sigmoide multiplicada sobre la salida antes de `o_proj`. La activación es GELU exacta (no la aproximación tanh), la normalización es RMSNorm en fp32 con épsilon 1e-6 y el vocabulario es de 131.072 entradas BPE atadas a la cabeza de salida.

La conversión VQ codifica 180 matrices (q/k/v fusionadas, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en las 36 capas) con la reconstrucción `W[r,d] = gain1[r] * (C1[i1][d] + R8[j][d]) + gain2[r] * C2[i2][d]`. Los 73 tensores de normalización se copian bit-exact en F32, las 36 puertas de atención se almacenan en BF16 y la tabla de tokens y la cabeza atada van en BF16 en una parte separada leída por filas. No se dispone de información sobre el dataset de entrenamiento del checkpoint original (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada; la model card solo describe el proceso de compresión VQ, no el entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat `chat_template.jinja` copiada literalmente del checkpoint.
- Modo de razonamiento (thinking) activado por defecto mediante `enable_thinking`, con `reasoning_effort` configurable en `high` o `low`.
- Soporte de marcadores de rol para flujos agénticos: `<|System|>`, `<|User|>`, `<|Bot|>`, `<|Tool|>`, `<|Developer|>`, lo que sugiere soporte de tool calling y conversaciones con herramientas.
- Capacidad multilingüe declarada (etiqueta `multilingual`), sin desglose de idiomas ni evaluaciones publicadas.
- Contexto largo de hasta 1.048.576 tokens gracias al esquema híbrido de atención.
- Orientación a tareas de agente en dispositivo según el repositorio oficial del modelo base.
- Capacidades de visión, audio o matemáticas: no disponible en la información proporcionada.

## Casos de uso

- Agentes en dispositivo con contexto largo: el esquema de 27 capas deslizantes de 512 tokens y 9 capas completas permite manejar conversaciones y documentos extensos con un coste de atención mucho menor que un transformer completamente denso, lo que encaja con el objetivo declarado de agente on-device.
- Asistente conversacional multi-turno con razonamiento configurable: el modo thinking con `reasoning_effort` en `high` o `low` permite ajustar la profundidad de razonamiento según el presupuesto de latencia, útil en asistentes locales.
- Integración en pipelines agénticos con herramientas: los marcadores `<|Tool|>` y `<|Developer|>` en el tokenizador permiten estructurar llamadas a funciones y resultados de herramientas dentro del mismo contexto.
- Procesamiento de documentos largos en local: con 1.048.576 tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de código completas sin truncamiento, siempre que se use el runtime compatible.
- Investigación sobre cuantización vectorial: el repositorio documenta el formato (`FORMAT.md`), la receta (`RECIPE.md`) y el esquema de reconstrucción, lo que lo convierte en un caso de estudio para evaluar VQ multietapa frente a cuantización escalar o de bloque.
- Despliegue con huella de memoria reducida: las dos partes suman 2.528 GiB (1.903 GiB de tronco y 0,625 GiB de embeddings), lo que permite ejecutar un modelo de 4B parámetros en GPUs de gama media si se dispone del runtime `ds4`.
- Evaluación comparativa de eficiencia on-device: el autor declara eficiencia comparable o superior a Qwen3.5-4B y Gemma-E4B, por lo que puede usarse como referencia en estudios de latencia en hardware de consumo, sujeto a la disponibilidad del toolchain.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de compresión: 4,3122 bits por peso codificado y 10,1537 % de error de peso para esta release de dos etapas, frente a 2,657 bits y 23,16 % para la release de una sola etapa. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados ocupan 2.528 GiB en disco; el runtime declara pesos FP8 100 % residentes en GPU tras la reconstrucción, por lo que se requiere VRAM suficiente para los pesos reconstruidos (del orden de varios GB, sin cifra exacta disponible) más caché KV para el contexto utilizado.
- GPU recomendadas: no disponible en la información proporcionada; el runtime menciona aceleración con Tensor Cores, lo que sugiere GPUs con soporte FP8 (por ejemplo, arquitecturas Hopper o Ada), pero no se confirma ninguna lista.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del checkpoint (4B parámetros) y los 2,5 GiB en disco sugieren que podría caber en GPUs de consumo con suficiente VRAM, pero la falta de datos de VRAM reconstruida impide afirmarlo.
- Opciones de despliegue: exclusivamente `ds4`/`ds4-server` en la rama `feat/spark2_5-family` de JLFN/ds4-dfm-rs. llama.cpp, Ollama, Transformers, vLLM y TGI no leen este formato según la propia model card.
- Latencia y throughput: no disponible. Solo se declara "eficiencia de inferencia comparable o superior a Qwen3.5-4B y Gemma-E4B" para el modelo base, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B VQ (esta ficha) | 4.112.079.360 | 1.048.576 | Apache 2.0 | GGUF VQ propietario, solo runtime `ds4` | 4,3122 bits/peso, 10,1537 % error de peso |
| Spark-X2.6-4B (checkpoint original) | 4.112.079.360 | 1.048.576 | no disponible en la información | Pesos originales (formato no detallado) | Punto de referencia sin compresión VQ |
| Qwen3.5-4B | no disponible | no disponible | no disponible | No disponible | Citado por el autor como referencia de eficiencia on-device |
| Gemma-E4B | no disponible | no disponible | no disponible | No disponible | Citado por el autor como referencia de eficiencia on-device |

Los datos de Qwen3.5-4B y Gemma-E4B no aparecen en la información proporcionada más allá de la mención comparativa del autor; no se dispone de parámetros, contexto ni resultados de benchmarks para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Incompatibilidad de toolchain: el formato GGUF propietario con blobs `GVQ1`/`GVR8` no es legible por llama.cpp, Ollama ni Transformers; solo funciona con el runtime `ds4` en una rama específica de un repositorio de GitHub. Esto bloquea despliegues estándar y complica el mantenimiento.
- Dependencia de una única implementación: la reconstrucción VQ en dos etapas está implementada únicamente en el runtime del autor; cualquier error de implementación afecta directamente la calidad de los pesos reconstruidos.
- Error de peso del 10,1537 %: es un error de compresión considerable frente a cuantizaciones escalar de 8 o 4 bits; el impacto en calidad downstream no está medido con benchmarks.
- Sin datos de entrenamiento del modelo base: no se dispone de información sobre composición del dataset, uso de RLHF/DPO ni sesgos conocidos.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Idiomas: solo se declara `en` y `multilingual` sin lista de idiomas ni evaluaciones; el rendimiento en idiomas distintos del inglés es desconocido.
- Contexto nativo de 1.048.576 tokens sin evaluación de degradación en contextos largos; el esquema híbrido de atención puede comportarse de forma distinta en las capas deslizantes frente a las completas.
- Licencia Apache 2.0 permite uso comercial, pero la escasez de documentación sobre el checkpoint original y la dependencia del runtime propietario introducen riesgo operativo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación comunitaria del formato.
- El tensor safetensors del repo declara 335.544.320 parámetros, muy inferior a los 4.112.079.360 del checkpoint origen; conviene verificar qué tensor corresponde antes de asumir equivalencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jlfn/spark-x2.6-4b-vq-gguf
- Repositorio oficial del modelo base: https://github.com/XHToken/Spark-X2.6
- Conversión GGUF alternativa del mismo modelo base: https://huggingface.co/iiinnnn88/Spark-X2.6-4B-GGUF
- Runtime `ds4`/`ds4-server` (rama `feat/spark2_5-family`): JLFN/ds4-dfm-rs (referenciado en la model card, sin URL directa disponible)
- Documentación del formato: `FORMAT.md` y `RECIPE.md` dentro del repositorio de Hugging Face
- Papers, blogs y demos adicionales: no disponible en la información proporcionada
