# DNR-AI/Qwen3.8-9B-Distill-NVFP4-GGUF

## Resumen

Qwen3.8-9B-Distill NVFP4 GGUF es una cuantización NVFP4 (formato float nativo de 4 bits, tipo GGML 40) del modelo Qwen3.8-9B-Distill de empero-ai, un destilado del Qwen3.8 2.4T A95B. La cuantización ha sido realizada por DNR-AI y está orientada a inferencia local con llama.cpp en GPU NVIDIA de arquitectura Blackwell (serie RTX 50xx), donde las operaciones float de 4 bits se aceleran mediante núcleos CUDA específicos. El problema que resuelve es claro: permitir ejecutar un modelo de ~9.200 millones de parámetros en tarjetas de 8 GB de VRAM con un rendimiento de generación muy superior al de cuantizaciones enteras equivalentes (142 tok/s frente a 87,8 tok/s de Q8_0 en una RTX 5070 Ti).

Su relevancia actual radica en que es una de las primeras cuantizaciones NVFP4 publicadas en formato GGUF compatible con mainline llama.cpp (a partir del build b11869), con métricas de calidad documentadas frente al original BF16: la pérdida de perplejidad es de solo un 3,2 % y la coincidencia de top-token alcanza el 90,9 %. La calibración se ha centrado en dominios concretos: código (TypeScript/C#), textos en ruso y diálogos JSON agénticos, lo que la hace especialmente interesante para flujos de trabajo de agentes locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (destilado de Qwen3.8 2.4T A95B); se eliminó el draft layer MTP/nextn para compatibilidad con mainline llama.cpp |
| Parámetros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos usan `-c 8192`; la máxima del modelo base no consta) |
| Tipos de cuantización | NVFP4 (deep, con RSF y imatrix); en el repo del modelo base: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible oficialmente; calibración orientada a ruso y código (TypeScript/C#) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NVFP4, tipo GGML 40) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-9B-Distill de empero-ai, un destilado del Qwen3.8 2.4T A95B. Sobre los datos y el proceso de destilación del modelo original no se ha publicado información en la ficha disponible. La innovación principal de esta versión no está en la arquitectura sino en la cuantización: se partió del original BF16 (~18 GB) y se aplicó NVFP4 con la herramienta advanced-gguf-quantizer (de michaelw9999), en modo deep con ajuste de escalas RSF y matriz de importancia (imatrix).

Como paso de post-procesado, se eliminaron del GGUF los 16 tensores del draft layer MTP/nextn (block_count 33 → 32) con un convertidor propio, para que el archivo sea legible por mainline llama.cpp sin soporte específico de capas de decodificación especulativa. Los autores señalan que este draft layer solo se usa para decodificación especulativa y su eliminación no afecta a la calidad de la generación normal. La imatrix se calculó sobre 128 fragmentos de un corpus de calibración de dominio (código TypeScript/C#, ruso y diálogos JSON agénticos); el texto de la model card se corta en ese punto, por lo que el resto de la metodología no está disponible.

## Capacidades

- Generación de texto conversacional (pipeline etiquetado como conversational en Hugging Face).
- Generación de código, con calibración específica en TypeScript y C#.
- Escenarios agénticos: la imatrix incluye diálogos JSON agénticos y el rendimiento en prompt processing (9.356 tok/s) está orientado a prompts largos típicos de agentes; el soporte de tool calling no consta explícitamente en la ficha.
- Buen rendimiento multilingüe orientado al ruso (etiqueta "russian"); el soporte de castellano no está documentado.
- Capacidad de procesar prompts largos con buena velocidad de prefill, útil para RAG y contextos extensos.
- Generación de código SVG a partir de descripciones textuales, aunque según los propios tests del autor con resultados pobres (test del "pelícano en bicicleta" no superado).
- Capacidades de visión, audio o thinking mode: no disponibles / no documentadas.

## Casos de uso

- Agentes locales multi-tarea: el escalado casi lineal con 4 slots paralelos (~417 tok/s agregados) lo hace adecuado para servidores locales que atienden varias tareas agénticas simultáneas con prompts JSON largos, justo el dominio de calibración de la imatrix.
- Asistentes de código en TypeScript y C#: la cuantización está calibrada específicamente sobre código de estos lenguajes, por lo que es adecuada para autocompletado, refactorizaciones y generación de funciones en IDEs locales.
- Chat local privado en ruso: con 4,95 GiB cabe íntegramente en una GPU de 8 GB, permitiendo desplegar un asistente conversacional sin envío de datos a servicios externos.
- RAG sobre documentación técnica: la velocidad de prompt processing (9.356 tok/s) permite ingestar contextos recuperados de varios miles de tokens con una latencia de prefill mínima.
- Servidores OpenAI-compatibles de bajo coste: mediante llama-server se expone una API compatible con OpenAI, útil para prototipos de aplicaciones que luego migran a APIs comerciales.
- Clasificación y extracción estructurada: el bajo coste por token y la alta coincidencia de top-token (90,9 % frente a BF16) lo hacen viable para tareas de extracción JSON a gran escala en una sola GPU de consumo.
- Pruebas de rendimiento NVFP4: es un buen banco de pruebas para desarrolladores que quieran evaluar el formato NVFP4 en hardware Blackwell antes de cuantizar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de calidad de cuantización y velocidad, medidas sobre un corpus de evaluación de dominio de 64 KB (28 fragmentos de 512), con referencia BF16 de la misma modelo, en una RTX 5070 Ti de 16 GB con llama.cpp b11869, CUDA y `-ngl 99`:

| Métrica | BF16 (referencia) | NVFP4 (deep) |
|---|---:|---:|
| Perplejidad | 5,544 | 5,7225 (+3,2 %) |
| Mean KLD frente a BF16 | — | 0,0474 |
| Coincidencia de top-token | — | 90,9 % |

| Configuración | tok/s |
|---|---:|
| NVFP4 — generación | 142 |
| NVFP4 — prompt processing | 9.356 |
| Q4_K_M (dom) — generación | 133,6 |
| Q4_K_M (dom) — prompt processing | 6.080 |
| Q8_0 — generación | 87,8 |
| Q8_0 — prompt processing | 6.280 |

Consultas paralelas (4 slots, `-np 4`, 256 tokens por consulta): NVFP4 ~104 tok/s por consulta (~417 agregados) frente a Q4_K_M ~97 tok/s por consulta (~387 agregados).

## Requisitos de hardware

- VRAM estimada: el archivo de 4,95 GiB cabe íntegramente en 8 GB de VRAM; hay que añadir memoria adicional para el KV-cache según el tamaño de contexto configurado.
- GPU recomendadas: cualquier GPU NVIDIA Blackwell (RTX 50xx) con al menos 8 GB de VRAM; las mediciones oficiales se hicieron en una RTX 5070 Ti de 16 GB. En GPUs sin núcleos NVFP4-CUDA el rendimiento no está documentado.
- Consumer GPUs: sí, cabe en tarjetas de 8 GB (por ejemplo RTX 5060); verificado en RTX 5070 Ti 16 GB.
- Software: llama.cpp b11869 o superior (build con núcleos NVFP4-CUDA), o cualquier runtime con soporte NVFP4-CUDA. En builds antiguos (< b11869) el modelo puede ejecutarse en CPU, con un rendimiento extremadamente lento. Compatibles: llama-server, llama-cli, LM Studio y runtimes GGUF con soporte NVFP4.
- Despliegue: llama-server con API compatible con OpenAI (`llama-server -m Qwen3.8-9B-NVFP4.gguf -ngl 99 -c 8192`); Ollama y vLLM no se mencionan en la ficha.
- Rendimiento: 142 tok/s de generación y 9.356 tok/s de prompt processing en RTX 5070 Ti con todos los capas en GPU (`-ngl 99`).
- Almacenamiento: ~5 GB de disco para el archivo del modelo.

## Comparativa con modelos similares

Comparativa entre las versiones disponibles del mismo modelo (datos del autor, RTX 5070 Ti 16 GB, llama.cpp b11869):

| Variante | Tamaño | Perplejidad (dominio) | Generación | Prompt processing | Perfil |
|---|---:|---:|---:|---:|---|
| NVFP4 (este repo) | 4,95 GiB | 5,7225 | 142 tok/s | 9.356 tok/s | Velocidad y agentes |
| Q4_K_M-dom | 5,48 GiB | 5,6327 | 133,6 tok/s | 6.080 tok/s | Equilibrio calidad/velocidad |
| Q8_0 | 9,1 GiB | 5,548 | 87,6 tok/s | 6.280 tok/s | Máxima calidad |

Frente a otras familias de ~9 B con licencia abierta (Qwen3 8B, Gemma 3 9B, Llama 3.1 8B), no se han publicado benchmarks comparativos en la información disponible, por lo que no se puede afirmar su posición relativa en calidad general.

## Limitaciones y advertencias

- Requiere hardware y software muy concretos: sin una GPU Blackwell y llama.cpp >= b11869 (o runtime con soporte NVFP4-CUDA), el modelo puede caer a CPU y ser inutilizable en la práctica.
- Pérdida de calidad medible respecto a BF16: +3,2 % de perplejidad y un 9,1 % de discrepancia en top-token; en tareas sensibles puede preferirse Q4_K_M-dom (mejor perplejidad) o Q8_0.
- El draft layer MTP/nextn fue eliminado, por lo que la decodificación especulativa nativa del modelo original no está disponible en esta versión.
- La calibración de la imatrix está centrada en ruso, TypeScript/C# y diálogos JSON agénticos; el rendimiento en castellano u otros idiomas no está documentado y puede ser inferior.
- Los tests de generación de código SVG publicados por el propio autor muestran resultados pobres, lo que sugiere limitaciones en razonamiento espacial y generación visual por código.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo de ~9 B destilado, debe usarse con verificación en tareas factuales.
- Sesgos conocidos: no disponibles / no documentados.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes más allá de conservar el aviso de licencia.
- El corpus de calibración descrito en la model card aparece truncado, por lo que parte de la metodología de cuantización no es verificable.

## Enlaces

- Modelo (NVFP4): https://huggingface.co/DNR-AI/Qwen3.8-9B-Distill-NVFP4-GGUF
- Modelo base (empero-ai, con BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M): https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF
- Discusión de llama.cpp sobre advanced-gguf-quantizer (herramienta de cuantización): https://github.com/ggml-org/llama.cpp/discussions/23853
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog y demo: no disponibles
