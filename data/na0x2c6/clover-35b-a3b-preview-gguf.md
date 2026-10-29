# na0x2c6/Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es el primer modelo publicado por DiffuSpace y no es un transformer autorregresivo al uso: es un modelo de lenguaje de difusión que genera texto por bloques mediante denoising iterativo, en lugar de predecir un token cada vez. Combina una arquitectura de mezcla de expertos (MoE) con 34.661.350.848 parámetros totales y aproximadamente 3.000 millones activos por token, sobre un backbone híbrido de Gated DeltaNet (atención lineal) y atención completa. Según fuentes secundarias, soporta una ventana de contexto de 128.000 tokens, dispone de modo de razonamiento (thinking) y está ajustado para tareas agénticas, código y razonamiento.

La ficha que nos ocupa no es el modelo original, sino la cuantización GGUF publicada por el usuario na0x2c6 a partir de `Diffuspace/Clover-35B-A3B-Preview`. El repositorio incluye cinco ficheros cuantizados con importance matrix (de 13,8 GB a 21,8 GB), la matriz de importancia empleada y las reglas `--tensor-type-file` de cada fichero. Su relevancia práctica es doble: permite ejecutar un MoE de ~35B en hardware de consumo y documenta de forma poco habitual la pérdida de calidad de cada cuantización mediante divergencia KL frente al BF16.

El detalle crítico es que el soporte de Clover **no está en la rama master de llama.cpp**: los ficheros se generaron y verificaron con el commit `4838ffb` del PR #31306 (`Maphist0:dev-clover`), no fusionado en el momento de la publicación. Además, el autor advierte que la evaluación se limita a medidas de KL-divergence, sin benchmarks de tarea, pruebas de contexto largo ni medidas de velocidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusión por bloques con MoE; backbone híbrido Gated DeltaNet (atención lineal) + atención completa |
| Parámetros totales | 34.661.350.848 (≈34,7B) |
| Parámetros activos | ≈3B por token (MoE) |
| Longitud de contexto | 128.000 tokens (según fuentes secundarias; no confirmado en la model card del repositorio GGUF) |
| Tipos de cuantización | GGUF: Q4_K_M, IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S (todos con importance matrix y variantes `-hq`/`-exps`); Q8_0 y BF16 de referencia |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors |
| Modelo base | `Diffuspace/Clover-35B-A3B-Preview` (revisión `4b0402b`) |
| Tamaño del repositorio | 88,1 GB |
| Librería | gguf / llama.cpp (build no oficial) |

## Arquitectura y entrenamiento

Clover articula dos ideas. La primera es la generación por difusión sobre texto discreto: el modelo parte de bloques enmascarados y los va refinando mediante denoising iterativo, lo que permite generar varios tokens por paso de cómputo en lugar de uno solo. La segunda es un backbone híbrido en el que conviven capas de atención lineal tipo Gated DeltaNet y capas de atención completa, sobre una mezcla de expertos con expertos enrutados (`ffn_{gate,up,down}_exps`) y al menos un experto compartido. El conversor de llama.cpp trata además como tensores propios de Clover una convolución por el lado derecho y los parámetros de block-softmax de las capas de atención lineal, que se almacenan en F32 en todos los ficheros.

Los detalles de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) no están disponibles en la información proporcionada. Lo que sí se documenta es el pipeline de cuantización: conversión a BF16 con `convert_hf_to_gguf.py` del commit `4838ffb` (transformers 5.21.0, torch 2.15.0), importance matrix calculada con `llama-imatrix` sobre el fichero Q8_0 con 367 fragmentos de 512 tokens procedentes de `calibration_datav3` de bartowski y del dataset de imatrix de TFMC, de los cuales aproximadamente un tercio van envueltos en formato de chat estilo Qwen, incluyendo `<think>` y rondas de tool calling. La cuantización se realizó con `llama-quantize --imatrix` y `--tensor-type-file`.

La innovación destacable en inferencia es la autoespeculación con borradores de bloque enmascarado: el PR introduce un modo `--spec-type draft-self` (con `--spec-draft-n-max`) en el que el propio modelo de difusión propone borradores de bloque que luego se verifican. Sin ese flag, el modelo genera token a token como un autorregresivo convencional.

## Capacidades

- Generación de texto mediante denoising por bloques, con la posibilidad de producir varios tokens por iteración.
- Modo de razonamiento (thinking) según la documentación secundaria del modelo.
- Ajuste orientado a tareas agénticas, código y razonamiento, según el autor del modelo base.
- Soporte de tool calling / function calling: el formato de chat empleado en la calibración incluye rondas de llamadas a herramientas, y el modelo base se describe como ajustado para tareas agénticas.
- Razonamiento multi-paso y uso como Policy Model en flujos de agente con contexto largo (hasta 128K según fuentes secundarias).
- Autoespeculación integrada en llama.cpp (`--spec-type draft-self`) para acelerar la decodificación.
- Capacidades multilingües: no disponible (el único dato objetivo es la evaluación de KLD sobre Wikipedia en inglés).
- Sin capacidades de visión, audio o vídeo documentadas.

## Casos de uso

- **Despliegue local de un MoE de ~35B en GPU de consumo**: con `Clover-35B-A3B-Preview-IQ4_XS-exps-hq.gguf` (19,4 GB) el modelo entra en una GPU de 24 GB y, al activar solo ~3B parámetros por token, el coste de cómputo por token se mantiene bajo pese al tamaño total.
- **Asistente de código en el IDE con generación por bloques**: la decodificación por difusión está pensada para refinar bloques completos, lo que encaja en autocompletado de funciones y relleno de huecos, combinado con el modo `draft-self` para reducir el número de pasos.
- **Agentes con tool calling en producción**: el ajuste del modelo base hacia tareas agénticas y el formato de calibración con `<think>` y llamadas a herramientas permiten integrarlo en bucles de razonamiento multi-paso; la ventana de 128K (según fuentes secundarias) facilita mantener el historial de herramientas y observaciones.
- **Procesamiento de documentación extensa**: análisis, resumen y extracción sobre contratos, expedientes o bases de código que superan la ventana típica de 8K-32K tokens, apoyándose en el contexto largo y en el modo thinking para tareas de razonamiento.
- **Servicio de inferencia con `llama-server`**: el repositorio incluye instrucciones directas para levantar un endpoint compatible con la API de llama.cpp (`llama-server -m ... --spec-type draft-self --spec-draft-n-max 15`), reutilizable por aplicaciones existentes que ya hablen ese protocolo.
- **Investigación sobre modelos de difusión para texto**: al publicar KLD por fichero, matriz de importancia y reglas de tipos de tensor, el repositorio sirve como base reproducible para estudiar el impacto de la cuantización en arquitecturas no autorregresivas.
- **Prototipado en CPU o entornos sin GPU dedicada**: los ficheros IQ2_S (13,8 GB) e IQ3_XXS (15,1 GB) permiten offload parcial a RAM y ejecución en CPU, con la contrapartida de mayor KLD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor del modelo base afirma un rendimiento state-of-the-art entre los modelos de difusión de código abierto en el momento del lanzamiento, según los benchmarks de su blog, pero no se aportan cifras.

La única evaluación cuantitativa disponible es la divergencia KL de las cuantizaciones, medida con `llama-perplexity --kl-divergence -c 1024` en CPU, frente a la conversión BF16 de los pesos originales, sobre Wikipedia en inglés (wikitext-2 test, 8 fragmentos de 1024 tokens). La perplejidad del BF16 en ese texto es 12,07.

| Fichero | Tamaño | KLD medio | KLD 99,9% | Mismo token top que BF16 | Ratio PPL |
|---|---|---|---|---|---|
| Q8_0 (referencia, no subido) | 36,9 GB | 0,0415 | 0,997 | 90,7% | 1,047 |
| Q4_K_M-hq | 21,8 GB | 0,0581 | 1,024 | 88,5% | 1,024 |
| IQ4_XS-exps-hq | 19,4 GB | 0,0675 | 1,420 | 87,7% | 1,049 |
| IQ3_S-exps-down4-hq | 17,6 GB | 0,0909 | 1,825 | 86,4% | 1,005 |
| IQ3_XXS-exps-down3-hq | 15,1 GB | 0,1093 | 1,963 | 84,9% | 1,056 |
| IQ2_S-exps-down3-hq | 13,8 GB | 0,1499 | 2,651 | 83,0% | 1,079 |

No hay datos de velocidad, latencia ni rendimiento en contexto largo.

## Requisitos de hardware

- **Huella de pesos**: entre 13,8 GB (IQ2_S) y 21,8 GB (Q4_K_M-hq). La referencia Q8_0 ocupa 36,9 GB y el BF16 original ronda los 69 GB (2 bytes por parámetro).
- **VRAM estimada**: el tamaño del fichero más la caché KV de las capas de atención completa (crece con el contexto) y el estado de las capas de atención lineal, de tamaño constante. Con contexto corto, IQ4_XS (19,4 GB) deja margen escaso en 24 GB; con contexto largo hará falta offload o una GPU de mayor capacidad.
- **GPU de consumo**: IQ2_S e IQ3_XXS son las opciones para tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super), con contexto reducido o offload parcial. IQ4_XS y Q4_K_M encajan en 24 GB (RTX 3090, RTX 4090) con contexto moderado. Para aprovechar los 128K tokens de contexto hace falta más de 24 GB.
- **GPU profesionales**: A100 40 GB / 80 GB y H100 para contextos largos y para BF16; el repo original en BF16 requiere ~69 GB, por lo que solo cabe en A100 80 GB o H100.
- **Opciones de despliegue**: únicamente llama.cpp, y solo con un build del commit `4838ffb` del PR #31306 (`Maphist0:dev-clover`). Se proporcionan ejemplos con `llama-server` y `llama-speculative-simple`. No hay soporte en master de llama.cpp ni en vLLM, TGI u Ollama a fecha de publicación.
- **Latencia y throughput**: no disponibles. No se han publicado pruebas de velocidad; el modo `--spec-type draft-self` está pensado para reducir el número de pasos de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

Los datos de los modelos alternativos no proceden de la documentación aportada y deben verificarse antes de usarlos en una decisión técnica.

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | 34,7B totales / ~3B activos | Difusión por bloques, MoE, Gated DeltaNet + atención completa | 128K (fuentes secundarias) | Apache-2.0 | Sí (este repositorio, requiere build no oficial) |
| LLaDA-8B-Instruct | 8B | Difusión de texto (masked diffusion), densa | No disponible | No disponible | Parcial, vía comunidad |
| Dream-7B | 7B | Difusión de texto, densa | No disponible | No disponible | Parcial, vía comunidad |
| Modelos autorregresivos MoE de ~30B | ~30B totales / ~3B activos | Transformer MoE | 32K-128K según modelo | Variables | Amplia, soporte nativo en llama.cpp, vLLM y Ollama |

La diferencia práctica frente a los modelos de difusión densos de 7-8B es el tamaño (35B en un MoE con ~3B activos) y la ventana de contexto; frente a los MoE autorregresivos de tamaño similar, la ventaja es el paradigma de generación por bloques y la desventaja es la madurez del soporte en herramientas.

## Limitaciones y advertencias

- **Soporte no fusionado**: los GGUF solo funcionan con un build concreto del PR #31306; no hay garantía de compatibilidad futura ni soporte en master de llama.cpp, vLLM, TGI u Ollama.
- **Evaluación incompleta**: el autor declara explícitamente que los ficheros se evalúan solo por KL-divergence, no con benchmarks de tarea, ni en contexto largo, ni con pruebas de velocidad. La calidad en uso real no está validada.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad factual; como en cualquier modelo de lenguaje, la generación puede producir contenido plausible pero incorrecto, especialmente en modo thinking sin verificación externa.
- **Idiomas**: no hay información sobre idiomas soportados. La calibración de la imatrix incluye un dataset de imatrix para LLM japonés y textos de Wikipedia en inglés, pero eso no implica capacidad multilingüe declarada.
- **Calibración parcialmente sesgada al formato chat**: aproximadamente un tercio de los fragmentos de calibración están envueltos en formato Qwen con `<think>` y tool calls, lo que puede favorecer ese formato en detrimento de otros.
- **Pérdida de calidad en cuantizaciones agresivas**: IQ2_S multiplica por 3,6 el KLD medio respecto a Q8_0 y solo coincide con el token top del BF16 en el 83,0% de los casos; no es recomendable para usos sensibles a la precisión.
- **Tensores en F32**: la convolución derecha y los parámetros de block-softmax se guardan en F32 en todos los ficheros, lo que añade huella de memoria no proporcional al nivel de cuantización.
- **Licencia**: Apache-2.0 permite uso comercial según los metadatos, pero conviene revisar los términos del modelo base `Diffuspace/Clover-35B-A3B-Preview` antes de un despliegue en producción.
- **Madurez del ecosistema**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay informes independientes de funcionamiento en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/na0x2c6/Clover-35B-A3B-Preview-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Repositorio GitHub del modelo: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- PR de llama.cpp con soporte Clover: https://github.com/ggml-org/llama.cpp/pull/31306
- Commit usado para conversión y cuantización: https://github.com/Maphist0/llama.cpp-pub/commit/4838ffb0c8ade92f34d9157deea38d92758ab824
- Discusiones del repositorio: https://huggingface.co/na0x2c6/Clover-35B-A3B-Preview-GGUF/discussions
- Dataset de calibración de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Dataset de imatrix de TFMC: https://huggingface.co/datasets/TFMC/imatrix-dataset-for-japanese-llm
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/clover-35b-a3b-preview/
- Ficha en OKNP.ai: https://oknp.ai/model/clover-35b-a3b-preview
- Vídeo de presentación: https://www.youtube.com/watch?v=2nv0URUmy4o
