# Harsha001/Carbon-X-ROCmFPX

## Resumen

Carbon-X-ROCmFPX es la cuantización a formatos GGUF de la familia ROCmFPX del modelo Carbon-X, un modelo de lenguaje de 14.822.046.720 parámetros desarrollado por Hugging Face Bio para comprensión y generación sobre ADN. El modelo acepta secuencias crudas de ADN (A/C/G/T) dentro de un mensaje de chat convencional y responde en inglés sobre efectos de variantes, regiones regulatorias, grupos de organismos o siguientes bases. Esta publicación no entrena nada nuevo: es una redistribución cuantizada con recetas de baja precisión orientadas a GPU AMD (Vulkan e HIP/ROCm), con licencia Apache 2.0 y pesos en GGUF.

Su relevancia es doble. Por un lado, hace accesible un modelo genómico de casi 15B en hardware de consumo AMD mediante tipos de 4 y 6 bits que no existen en llama.cpp estándar; por otro, el autor publica métricas de fidelidad frente a BF16 (divergencia KL y coincidencia de siguiente token) tanto en texto genérico como en ADN humano real, lo que permite elegir el fichero con criterio en lugar de a ciegas. La recomendación explícita del autor es `Q6_0_ROCMFPX`, que se mantiene cerca del original en ADN.

Las limitaciones son importantes: los ficheros solo cargan en una compilación ROCmFPX de llama.cpp (no funcionan en llama.cpp estándar, LM Studio ni Ollama), no se han probado todavía en hardware AMD real y el modelo base es declarado de investigación por sus autores. Existe además una alternativa oficial en GGUF de Hugging Face Bio con tipos estándar, preferible si no se necesita el stack ROCmFPX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no documenta la arquitectura; se describe como modelo de lenguaje de 14,8B para ADN) |
| Parametros totales | 14.822.046.720 (dato de safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecución del autor usa `-c 40960`, pero no se documenta la ventana nativa) |
| Tipos de cuantizacion | Q8_0_ROCMFPX, Q6_0_ROCMFPX, Q4_0_ROCMFP4_STRIX, Q4_0_ROCMFP4_FAST; en los ficheros de 4 bits los tensores de embedding y salida se guardan en Q8_0 estándar. Q3_0_ROCMFPX existe (8,5 GB) pero no se publicó por su baja calidad |
| Idiomas soportados | en (inglés); la entrada admite secuencias de ADN en A/C/G/T y códigos de ambigüedad, tokenizadas de forma específica |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF con tipos ROCmFPX (no compatibles con llama.cpp upstream) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (no se especifica si es un transformer denso, MoE o híbrido), ni el volumen o composición del corpus de entrenamiento, ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el pipeline de cuantización aplicado sobre los pesos BF16 originales de HuggingFaceBio/Carbon-X: conversión con `convert_hf_to_gguf.py --outtype bf16` desde el fork, cálculo de una importance matrix sobre el modelo BF16 en GPU usando texto general de calibración (`calibration_datav3`) en fragmentos de 512 tokens, y cuantización con `llama-quantize --imatrix`, una pasada por tipo, aplicando `--token-embedding-type q8_0 --output-tensor-type q8_0` en los ficheros de 4 bits.

La innovación técnica relevante para este despliegue es el tokenizador híbrido de ADN de Carbon-X, integrado en el fork ROCmFPX (upstream llama.cpp PR #30825): las secuencias de A/C/G/T en el prompt se etiquetan como ADN y se cortan automáticamente en tokens de 6 bases. El autor verificó la equivalencia con el tokenizador Python de Hugging Face Bio sobre 9 cadenas de prueba (ejemplos de la model card, bases en minúscula, longitudes no múltiplos de 6, `N` y otros códigos de ambigüedad, bloques separados por espacios, palabras cortas como "CAT", el formato de chat y 1.000 bases de ADN humano), obteniendo ids idénticos. Es necesario llama.cpp b11742 o superior, o el ADN se tokeniza mal.

La medición de calidad se hizo expandiendo cada cuantizado de vuelta a F16 (conservando los pesos almacenados) y evaluándolo con kernels F16 estándar en una GPU NVIDIA, porque los kernels CUDA del fork para estos tipos no son correctos en NVIDIA. El autor valida el método comparando con el backend CPU (KLD 0,0050 frente a 0,0054 en el `Q8_0_ROCMFPX` de un modelo de 9B). En hardware AMD el orden de las operaciones difiere, por lo que los resultados pueden variar ligeramente.

## Capacidades

- Generación de texto en inglés sobre entradas que contienen ADN: el prompt puede mezclar instrucciones en lenguaje natural con secuencias crudas de bases.
- Predicción de efectos de variantes: identifica el cambio de posición y de codón (por ejemplo, de `...CCTGAGGAG...` a `...CCTGTGGAG...` responde que la variante cambia la posición 21 de A a T y GAG pasa a GTG).
- Anotación de regiones regulatorias y descripción de grupos de organismos.
- Predicción de siguientes bases (next-token sobre secuencias genómicas).
- Tokenización nativa de ADN en tokens de 6 bases, con soporte de códigos de ambigüedad y bases en minúscula.
- Formato conversacional con plantilla de chat Jinja (`--jinja`) y parámetro `enable_thinking`; el modelo se post-entrenó y evaluó con el modo de razonamiento desactivado.
- No se documentan en la información disponible capacidades de tool calling, uso de agentes, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Triaje de variantes en investigación genómica: se pega el contexto de referencia y la variante en el prompt y el modelo describe el cambio de base y su efecto a nivel de codón; útil como primera pasada antes de herramientas especializadas.
- Anotación de regiones regulatorias en lotes de secuencias: procesar fragmentos de genoma con el backend `llama-server` para obtener descripciones en inglés que alimenten un pipeline de anotación posterior.
- Predicción de siguiente base para exploración de secuencias: dado un contexto de ADN, consultar la distribución de siguiente token como señal auxiliar en tareas de exploración, teniendo en cuenta la elevada perplejidad del modelo sobre genoma real.
- Preprocesado y resumen de ficheros FASTA en pipelines bioinformáticos: convertir fragmentos crudos en descripciones legibles antes de un análisis manual, aprovechando que el tokenizador etiqueta automáticamente las tiradas de A/C/G/T.
- Clasificación de grupos de organismos a partir de secuencia: usar el modelo como clasificador de apoyo en la fase de revisión de muestras, siempre con validación contra bases de referencia.
- Despliegue local en estaciones de trabajo AMD: servir el modelo con `llama-server` en una GPU RDNA3 o Strix Halo para equipos que no pueden enviar datos genómicos a la nube, usando `Q6_0_ROCMFPX` si la memoria lo permite.
- Docencia y prototipado en bioinformática: entorno reproducible para enseñar cómo un LLM procesa ADN, con ficheros de 8,7 GB que caben en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (el autor indica explícitamente que las cifras miden cuánto se desvía cada cuantización del modelo, no la precisión en tareas). Los datos disponibles son de fidelidad frente a BF16: perplejidad BF16 de referencia 9,2710 en WikiText-2 (40 fragmentos de 512 tokens) y 1446,4 en ADN humano (42 segmentos de 3.072 bases de cromosomas 1 a 22 de GRCh38 vía Ensembl, en fragmentos de 512 tokens).

| Fichero | Tamano | KLD texto | Same top texto | KLD ADN | Same top ADN |
|---|---:|---:|---:|---:|---:|
| `Carbon-X-Q8_0_ROCMFPX.gguf` | 15,3 GB | 0,0032 | 97,24 % | 0,0238 | 79,54 % |
| `Carbon-X-Q6_0_ROCMFPX.gguf` (recomendado) | 12,2 GB | 0,0084 | 95,57 % | 0,0290 | 78,72 % |
| `Carbon-X-Q4_0_ROCMFP4_STRIX.gguf` | 8,7 GB | 0,0721 | 88,78 % | 0,0968 | 71,85 % |
| `Carbon-X-Q4_0_ROCMFP4_FAST.gguf` | 8,7 GB | 0,0734 | 88,68 % | 0,0963 | 72,01 % |
| `Q4_K_M` estándar (referencia externa, 9,6 GB) | 9,6 GB | 0,0334 | no disponible | 0,0486 | no disponible |
| `Q3_0_ROCMFPX` (no publicado) | 8,5 GB | 0,134 | no disponible | 0,169 | no disponible |

KLD es la divergencia KL media de la distribución de siguiente token respecto a BF16 (menor es mejor); "same top" es la frecuencia con la que el cuantizado elige el mismo siguiente token que BF16. En ADN, al ser secuencia casi aleatoria, el modelo rara vez está seguro y "same top" baja incluso en 8 bits: la comparación válida ahí es la KLD.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead de contexto y buffers. `Q4_0` (8,7 GB) en torno a 10-11 GB; `Q6_0` (12,2 GB) en torno a 14 GB; `Q8_0` (15,3 GB) en torno a 17-18 GB. Estimaciones a partir del tamaño de pesos; el KV cache con `-c 40960` añade una cantidad no documentada.
- GPU objetivo según el autor: AMD con soporte Vulkan o HIP/ROCm. Se citan explícitamente `gfx1151` (Strix Halo) para la receta `STRIX` y `gfx1100` (RX 7900) como destino de compilación; `Q4_0_ROCMFP4_FAST` está pensado para velocidad (una escala por bloque).
- Estado de validación: la model card advierte de que estos ficheros no se han probado todavía en hardware AMD. Las métricas de calidad se obtuvieron en NVIDIA con pesos expandidos a F16.
- Despliegue: exclusivamente builds ROCmFPX de llama.cpp, compilando con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`. No funcionan en llama.cpp estándar, LM Studio ni Ollama; para esos entornos hay que usar HuggingFaceBio/Carbon-X-GGUF.
- Invocación recomendada: `llama-server -m Carbon-X-Q6_0_ROCMFPX.gguf -ngl 999 -c 40960 --jinja --chat-template-kwargs '{"enable_thinking": false}' --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0` (ajustes de muestreo por defecto de Hugging Face Bio).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X-ROCmFPX `Q6_0` (este) | 14,82B | no disponible | KLD texto 0,0084 / ADN 0,0290 | Apache 2.0 | GGUF solo para fork ROCmFPX |
| Carbon-X-ROCmFPX `Q4_0` STRIX/FAST | 14,82B | no disponible | KLD texto ~0,072 / ADN ~0,096 | Apache 2.0 | GGUF solo para fork ROCmFPX, 8,7 GB |
| HuggingFaceBio/Carbon-X-GGUF `carbon-x-q4_k_m.gguf` | 14,82B | no disponible | KLD texto 0,0334 / ADN 0,0486 (mejor que el 4 bits ROCmFPX) | Apache 2.0 | GGUF estándar, compatible con llama.cpp, LM Studio, Ollama |
| HuggingFaceBio/Carbon-X (BF16) | 14,82B | no disponible | Referencia (perplejidad 9,2710 texto / 1446,4 ADN) | Apache 2.0 | safetensors, requiere ~30 GB |

No se dispone de datos de benchmarks de precisión que permitan comparar con otros modelos genómicos de tamaño similar; la comparación anterior se limita a fidelidad de cuantización y compatibilidad de despliegue.

## Limitaciones y advertencias

- Modelo de investigación: la model card de Carbon-X lo declara explícitamente y advierte sobre el uso de sus respuestas (el texto disponible está truncado en el punto en que se detallan las restricciones). No debe emplearse en decisiones clínicas o diagnósticas.
- Alta incertidumbre en ADN: la perplejidad BF16 sobre genoma humano es 1446,4, señal de que el modelo rara vez está seguro de la siguiente base; la coincidencia de token superior cae al 71-80 % incluso en 8 bits.
- Sin benchmarks de precisión: no se han medido exactitud en tareas de predicción de variantes ni de anotación, solo la divergencia respecto a BF16.
- Idiomas: únicamente inglés en la salida; no se documenta soporte multilingüe.
- Compatibilidad: los tipos ROCmFPX no cargan en llama.cpp estándar, LM Studio ni Ollama. Requieren llama.cpp b11742 o superior dentro del fork, o el ADN se tokeniza incorrectamente.
- Validación incompleta: los ficheros no se han probado en GPU AMD; las métricas proceden de NVIDIA con pesos expandidos a F16 y los kernels CUDA del fork no son correctos en NVIDIA.
- Penalización de los 4 bits: los ficheros de 4 bits de ROCmFPX pierden aproximadamente el doble que un `Q4_K_M` estándar tanto en texto como en ADN; si no se necesita el stack ROCmFPX, el GGUF oficial es mejor opción.
- Licencia Apache 2.0 permite uso comercial, pero el autor original no publica una evaluación de sesgos ni de seguridad para este dominio; el modelo no es un dispositivo médico ni una herramienta de diagnóstico.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Harsha001/Carbon-X-ROCmFPX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- GGUF oficial del modelo base (tipos estándar): https://huggingface.co/HuggingFaceBio/Carbon-X-GGUF
- Fork ROCmFPX usado para generar los ficheros: https://github.com/HarshaVardhan3002/ROCmFPX
- Fork de referencia ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Stack oficial ROCmFPX: https://github.com/ROCmFPX/ROCmFPX
- PR de llama.cpp con soporte del tokenizador de ADN: https://github.com/ggml-org/llama.cpp/pull/30825
- Issue sobre escalas de tensores en ROCmFPX: https://github.com/charlie12345/ROCmFPX/issues/118
- Otro modelo cuantizado por el mismo autor (referencia de metodo): https://huggingface.co/Harsha001/elephant-1-ROCmFPX
