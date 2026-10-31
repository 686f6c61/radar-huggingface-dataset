# maternion/Spark-X2.6-1.7B-i-GGUF

## Resumen

Spark-X2.6-1.7B-i-GGUF es una cuantización no oficial, publicada por el usuario maternion, del modelo base XHToken/Spark-X2.6-1.7B, un modelo de generación de texto conversacional de 1.707 millones de parámetros desarrollado por XHToken. El repositorio ofrece el modelo en formato GGUF con un amplio abanico de cuantizaciones (desde IQ2_XXS de 568 MiB hasta BF16 de 3,18 GiB), todas calculadas mediante una matriz de importancia (imatrix) derivada de la propia plantilla de chat del modelo, lo que mejora la calidad en cuantizaciones agresivas.

La relevancia de esta ficha radica en el tamaño del modelo: con apenas 1,7 B de parámetros y versiones cuantizadas por debajo de 1 GiB, es un candidato claro para ejecución local en CPU, portátiles y GPUs de consumo, sin renunciar a capacidades conversacionales en inglés y chino. La arquitectura subyacente, según la model card, es una variante híbrida de atención (sliding attention, full attention y capas convolucionales cortas) con Q/K-norm y FFN con gating, soportada de forma estándar por llama.cpp sin código personalizado. La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer híbrido: sliding attention / full attention / short-conv, Q/K-norm, FFN con gating) |
| Parametros totales | 1.707.657.216 (~1,71 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan 32.768 tokens con `-c 32768`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_NL, IQ4_XS, IQ3_M, IQ2_M, IQ2_XXS |
| Idiomas soportados | inglés y chino |
| Licencia | Apache 2.0 (pesos base de XHToken y derivados de la cuantización) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo base se describe en la model card como `Spark2_5ForCausalLM`, una arquitectura estándar para llama.cpp que combina tres tipos de capas: atención deslizante (sliding attention), atención completa (full attention) y capas convolucionales cortas (short-conv). Además incorpora normalización sobre las proyecciones Q y K (Q/K-norm) y un FFN con gating, un diseño habitual en modelos modernos que mejora la estabilidad del entrenamiento. Este enfoque híbrido suele reducir el coste de atención en secuencias largas al limitar la atención completa a determinadas capas.

Sobre el proceso de entrenamiento del modelo base (numero de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación) no hay datos publicados en la información disponible; la model card remite a XHToken/Spark-X2.6-1.7B, donde tampoco se incluyen dichos detalles en el material proporcionado. En cuanto a la cuantización, el autor calculó una imatrix (matriz de importancia) a partir de renders de la propia plantilla de chat del modelo sobre un corpus de calibración, y la publica junto al modelo (3,7 MiB) para permitir re-cuantizaciones reproducibles con `llama-quantize`.

## Capacidades

- Generación de texto conversacional, con etiqueta `conversational` y plantilla de chat embebida en los GGUF.
- Soporte bilingüe de inglés y chino.
- Compatibilidad total con llama.cpp: tokenizer y chat template incluidos en los ficheros GGUF, sin código personalizado.
- Servible como API compatible con OpenAI mediante `llama-server` (endpoint `/v1`), lo que facilita su integración en aplicaciones existentes.
- No hay información disponible sobre tool calling, function calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbots locales y privados: con la variante Q4_K_M (1,03 GiB) puede ejecutarse en portátiles sin GPU dedicada, sirviendo una interfaz web y una API compatible con OpenAI desde `llama-server`, ideal cuando los datos no pueden salir del dispositivo.
- Asistente bilingüe inglés-chino: su soporte explícito de ambos idiomas lo hace adecuado para aplicaciones con usuarios en ambos mercados, como redacción y revisión de mensajes o traducción ligera entre ambas lenguas.
- Inferencia en el borde (edge): las cuantizaciones IQ2_XXS (568 MiB) e IQ2_M (678 MiB) permiten desplegarlo en dispositivos con memoria muy limitada (Raspberry Pi de gama alta, mini PCs, móviles vía llama.cpp), aceptando una pérdida de calidad a cambio de huella mínima.
- Prototipado rápido de aplicaciones LLM: su tamaño permite iterar en local sin coste de API, integrándolo en LangChain, LlamaIndex o clientes OpenAI apuntando al endpoint local.
- Backends de bajo coste para servicios con muchas peticiones ligeras: en una GPU modesta o en CPU, un modelo de 1,7 B cuantizado ofrece alto throughput para tareas simples como clasificación, extracción de datos o resúmenes cortos.
- Requantización personalizada: la imatrix publicada permite a usuarios avanzados generar cuantizaciones propias calibradas con su corpus específico, útil para dominios concretos.
- Generación de texto en pipelines de procesamiento: tareas como limpieza, reformateo o generación de descripciones cortas donde la latencia y el coste importan más que la máxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantización remite a la del modelo base (XHToken/Spark-X2.6-1.7B) para arquitectura, benchmarks y uso previsto, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del fichero más la caché de contexto. Referencias: Q4_K_M 1,03 GiB, Q5_K_M 1,17 GiB, Q6_K 1,31 GiB, Q8_0 1,69 GiB, IQ3_M 848 MiB, IQ2_XXS 568 MiB, BF16 3,18 GiB. Con contexto de 32.768 tokens hay que añadir la KV-cache correspondiente.
- GPUs recomendadas: cualquier GPU moderna es suficiente dado el tamaño; no se requieren A100 ni H100. Con offload completo de capas (`-ngl 999`) cabe con holgura en GPUs de 4 GB o más incluso en BF16; en Q4_K_M basta con 2-3 GB de VRAM.
- Consumer GPUs: sí, cabe sobradamente en prácticamente cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.). También es plenamente viable su ejecución solo en CPU e incluso sin GPU, dado que las variantes de 2-3 bits ocupan menos de 900 MiB.
- Despliegue: llama.cpp (llama-cli y llama-server con API compatible con OpenAI y web UI en el puerto 8080). Al ser GGUF, también debería funcionar con Ollama y LM Studio. No hay indicios de soporte específico para vLLM o TGI con este formato.
- Latencia y throughput: no disponible. Por tamaño y arquitectura, se espera inferencia fluida en CPU moderna y muy alta velocidad en GPU, pero no hay cifras publicadas.
- Parámetros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95 --top-k 0 --min-p 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-i-GGUF | 1,71 B | GGUF (12 cuantizaciones, imatrix) | no disponible (ejemplos con 32.768) | Apache 2.0 | Arquitectura híbrida sliding/full attention + short-conv; bilingüe en/zh |
| Qwen2.5-1.5B-Instruct | 1,54 B | safetensors, GGUF comunitarios | 32.768 (128K con YaRN) | Qwen Research (no Apache 2.0) | Bilingüe en/zh, amplio ecosistema |
| Llama-3.2-1B-Instruct | 1,24 B | safetensors, GGUF comunitarios | 131.072 | Llama 3.2 Community License | Multilingüe (8 idiomas oficiales), sin chino nativo destacado |
| Gemma-2-2B-it | 2,61 B | safetensors, GGUF comunitarios | 8.192 | Gemma Terms of Use | Buen rendimiento para su tamaño, contexto más corto |

Spark-X2.6-1.7B se distingue por su licencia Apache 2.0 sin restricciones, su arquitectura híbrida con capas convolucionales cortas y la disponibilidad inmediata de cuantizaciones imatrix de alta calidad. Frente a Qwen2.5-1.5B comparte el enfoque bilingüe inglés-chino; frente a Llama-3.2-1B ofrece una licencia más permisiva. No hay datos de benchmarks publicados que permitan comparar rendimiento objetivo.

## Limitaciones y advertencias

- Cuantización no oficial: el repositorio es un trabajo independiente de maternion y no está afiliado ni respaldado por XHToken; cualquier problema de calidad derivado de la cuantización no afecta al modelo base oficial.
- Riesgo de alucinación: como todo modelo de lenguaje de 1,7 B, puede generar contenido incorrecto con apariencia plausible, especialmente en tareas de conocimiento factual; no hay datos de evaluación publicados que cuantifiquen este riesgo.
- Cuantizaciones agresivas: las variantes IQ2_XXS, IQ2_M y Q2_K (2 bits) implican una degradación de calidad notable respecto a Q4_K_M o superior; usarlas solo si la memoria es una restricción absoluta.
- Idiomas: soporte declarado únicamente para inglés y chino; el rendimiento en castellano u otros idiomas no está documentado y puede ser deficiente.
- Contexto: la longitud máxima de contexto no está publicada; los ejemplos usan 32.768 tokens, pero conviene verificar el límite real en la documentación del modelo base.
- Sesgos: no disponible; no se ha documentado ningún análisis de sesgos para este modelo.
- Licencia: Apache 2.0 permite uso comercial, distribución y modificación sin royalties; no se identifican restricciones relevantes.
- Para producción: al tratarse de un modelo pequeño y sin benchmarks públicos, se recomienda evaluación propia en el dominio de aplicación antes de desplegarlo, especialmente en tareas de razonamiento complejo o generación de código.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/maternion/Spark-X2.6-1.7B-i-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
