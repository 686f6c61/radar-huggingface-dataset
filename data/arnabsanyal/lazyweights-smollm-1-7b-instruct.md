# arnabsanyal/LazyWeights-SmolLM-1.7B-Instruct

## Resumen

LazyWeights-SmolLM-1.7B-Instruct es una variante cuantizada del modelo SmolLM-1.7B-Instruct de HuggingFaceTB, publicada por el autor arnabsanyal como parte del trabajo de investigacion "LazyWeights: Decode-on-Demand Edge LLMs" (arXiv 2611.17108). El modelo no introduce pesos nuevos: parte de los pesos fp16 del modelo base y los recomprime mediante GPTQ adaptado a los formatos de bloque de llama.cpp, optimizando la concentracion de los codigos enteros para que posteriormente se puedan codificar sin perdida con Huffman. El resultado son dos puntos de operacion con presupuestos de degradacion controlada de perplejidad (+1% y +3.5% sobre fp16).

La relevancia del artefacto es que demuestra una tecnica de compresion orientada a despliegue en el borde (edge), especificamente en dispositivos Jetson Orin Nano Super y Jetson Nano. Frente a los formatos estandar de llama.cpp, los bundles codificados reducen el ancho de banda de pesos entre un 9,8% y un 10,3% adicionales sin perdida de calidad respecto al GGUF equivalente, gracias a una unidad de decodificacion situada entre DRAM y L2. Se distribuye en dos formatos: GGUF estandar ejecutable en llama.cpp sin modificaciones, y un bundle binario con codificacion Huffman que requiere el runtime CUDA propio del proyecto.

El modelo base tiene 1.711.376.384 parametros (1,7B) y esta orientado a generacion de texto conversacional en ingles. La licencia es Apache 2.0, heredada del modelo base. El repositorio ocupa 4,5 GB e incluye unicamente los artefactos cuantizados y los bundles de ejecucion, no los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-1.7B-Instruct) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q5_K_M (g1_lam0) e IQ4_XS (g1_lam0); bundles Huffman-coded equivalentes |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y bundle binario propietario (`manifest.txt` + `weights.bin`) |
| Tamano GGUF Q5_K_M | 1,23 GB |
| Tamano GGUF IQ4_XS | 0,94 GB |
| Tamano bundle Q5_K_M | 1,31 GB |
| Tamano bundle IQ4_XS | 1,03 GB |
| Bits por peso (Q5_K_M codificado) | 5,162 |
| Bits por peso (IQ4_XS codificado) | 3,934 |
| Delta de perplejidad (Q5_K_M) | +0,88% sobre fp16 |
| Delta de perplejidad (IQ4_XS) | +3,27% sobre fp16 |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del SmolLM-1.7B-Instruct, un transformer decoder-only denso de 1,7B parametros con embeddings atados (tied embeddings). No se ha reentrenado ni afinado: los pesos fp16 del modelo base se procesan mediante GPTQ adaptado a los formatos de bloque de llama.cpp (Q5_K_M e IQ4_XS), con dos hiperparametros clave en el nombre de los ficheros. El parametro `g` (gamma) controla si se comparte un unico paso de cuantizacion por super-bloque (g=1) o se mantiene el ajuste por sub-bloque de llama.cpp (g=0). El parametro `lam` (lambda) pondera la entropia en la eleccion de codigos de GPTQ, de forma que los codigos enteros resultantes quedan concentrados y son compresibles sin perdida. El parametro `c` ensancha opcionalmente el paso de cuantizacion.

La innovacion tecnica central es el pipeline de compresion en dos etapas: primero GPTQ elige codigos enteros con baja entropia dentro de los formatos de bloque de llama.cpp, y despues se aplica codificacion Huffman sin perdida en carriles intercalados sobre esos codigos, junto con las escalas del formato. El resultado se materializa en dos artefactos: un GGUF estandar que conserva el ancho fijo del formato (y por tanto ejecuta en llama.cpp sin cambios) y un bundle codificado que solo consume el runtime CUDA propio (`kernels/llmrt.cu`), disenado para ejecutarse en Jetson Orin Nano Super y Jetson Nano. El paper reporta que la codificacion Huffman por si sola reduce el ancho de banda de 5,721 a 5,162 b/w en el punto Q5_K_M (−9,8%) y de 4,388 a 3,934 b/w en el punto IQ4_XS (−10,3%), contabilizando todas las sobrecargas (tablas Huffman, offsets de carril, escalas y minimos). Los puntos de operacion se seleccionan como el modelo codificado mas pequeno que cabe en cada presupuesto de perplejidad sobre WikiText-2, comparado contra el mejor formato de llama.cpp que cumple el mismo presupuesto.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base SmolLM-1.7B-Instruct.
- Razonamiento basico y respuesta a instrucciones de un modelo de 1,7B parametros.
- Generacion de codigo y matematicas elementales a nivel de modelo pequeno (el paper evalua GSM8K, HellaSwag, ARC-e y PIQA sobre los puntos cuantizados).
- Ejecucion en llama.cpp sin modificaciones mediante los ficheros GGUF.
- Ejecucion en el runtime CUDA propio del proyecto (`llmrt`) sobre Jetson Orin Nano Super y Jetson Nano con los bundles codificados.
- Decodificacion bajo demanda (decode-on-demand) de pesos comprimidos con Huffman entre DRAM y L2.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue en dispositivos Jetson para inferencia local: los bundles codificados estan disenados especificamente para ejecutarse en Jetson Orin Nano Super y Jetson Nano con el runtime `llmrt`, reduciendo el ancho de banda de pesos un 10% frente al GGUF equivalente y permitiendo mantener modelos de 1,7B en memoria de borde con presupuesto de perplejidad controlado.
- Evaluacion de tecnicas de compresion en produccion: el par GGUF/bundle permite comparar directamente el mismo conjunto de codigos a ancho fijo (GGUF) y codificado con Huffman (bundle), lo que facilita medir el ahorro real de ancho de banda y su impacto en latencia y energia sin cambiar de modelo.
- Chat conversacional ligero en ingles: el modelo base esta afinado para instrucciones y el punto Q5_K_M mantiene una degradacion de perplejidad de solo +0,88%, adecuado para asistentes de texto en dispositivos con recursos limitados.
- Prototipado de pipelines de cuantizacion: los scripts del repositorio (`scripts/a2_kq_bundle.py`) permiten reconstruir bundles y sus gemelos de ancho fijo verificando cada matriz bit a bit contra gguf-py, util para validar flujos de compresion con perdida mas codificacion sin perdida.
- Benchmarking de energia por token en el borde: el paper reporta tiempo y energia por token en Jetson Orin Nano Super y Jetson Nano, por lo que el artefacto sirve para comparar coste energetico de formatos de cuantizacion en hardware embebido.
- Integracion en llama.cpp existente: el GGUF IQ4_XS (0,94 GB) se carga con cualquier build reciente de llama.cpp mediante `llama-cli`, lo que permite incorporar el modelo a herramientas ya basadas en llama.cpp sin adoptar el runtime propio.
- Investigacion sobre decodificacion bajo demanda: el diseno de la unidad de decodificacion entre DRAM y L2 y el formato de carriles intercalados son un caso de estudio reproducible para quienes investigan aceleracion de inferencia en el borde.

## Benchmarks y rendimiento

La model card referencia evaluaciones de HellaSwag, ARC-e, PIQA y GSM8K, asi como tiempo y energia por token en Jetson Orin Nano Super y Jetson Nano, pero los valores numericos no se incluyen en la informacion proporcionada; se remiten al paper (arXiv 2611.17108) y al README de GitHub.

Los unicos datos cuantitativos disponibles son de perplejidad y ancho de banda:

| Punto | GGUF | b/w codificado | Delta PPL vs fp16 | Baseline llama.cpp (b/w) | Ahorro |
|---|---|---:|---:|---|---:|
| Presupuesto ≤1% | Q5_K_M_g1_lam0 | 5,162 | +0,88% | Q5_K_M (5,721) | 9,8% |
| Presupuesto ≤3,5% | IQ4_XS_g1_lam0 | 3,934 | +3,27% | IQ4_XS + imatrix (4,388) | 10,3% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas con valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16 del modelo base: aproximadamente 3,4 GB solo para pesos (1,7B × 2 bytes), mas overhead de contexto y activaciones.
- VRAM estimada con GGUF IQ4_XS: aproximadamente 0,94 GB de pesos; con GGUF Q5_K_M: aproximadamente 1,23 GB.
- VRAM estimada con bundles codificados: 1,03 GB (IQ4_XS) y 1,31 GB (Q5_K_M), incluyendo tablas Huffman, offsets, escalas y copia int8 de la tabla de embeddings para busqueda de tokens.
- Cabe en GPUs de consumo: si, en cualquier GPU con al menos 2-3 GB de VRAM libre para el GGUF IQ4_XS, y en torno a 4 GB para fp16 con contexto moderado.
- GPU de referencia del paper: Jetson Orin Nano Super y Jetson Nano (runtime CUDA `llmrt`); el GGUF funciona tambien en A100, H100, RTX 4090 y cualquier GPU soportada por llama.cpp.
- Opciones de despliegue: llama.cpp (GGUF, commit de referencia `5d7793d`, cualquier build reciente), runtime CUDA propio `llmrt` compilado desde `kernels/llmrt.cu` para Jetson. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: el paper reporta tiempo y energia por token en Jetson Orin Nano Super y Jetson Nano, pero los valores no estan en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LazyWeights-SmolLM-1.7B-Instruct (Q5_K_M) | 1,7B | no disponible | GGUF + bundle Huffman | Apache 2.0 | +0,88% PPL, 5,162 b/w codificado |
| LazyWeights-SmolLM-1.7B-Instruct (IQ4_XS) | 1,7B | no disponible | GGUF + bundle Huffman | Apache 2.0 | +3,27% PPL, 3,934 b/w codificado |
| SmolLM-1.7B-Instruct (base fp16) | 1,7B | no disponible | safetensors | Apache 2.0 | Referencia de calidad; sin compresion |
| Q5_K_M estandar de llama.cpp sobre SmolLM-1.7B | 1,7B | no disponible | GGUF | Apache 2.0 | Baseline del paper, 5,721 b/w |
| IQ4_XS + imatrix estandar de llama.cpp | 1,7B | no disponible | GGUF | Apache 2.0 | Baseline del paper, 4,388 b/w |

No se dispone de datos de benchmarks de tareas para comparar con otros modelos de 1,7B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles segun la etiqueta de idioma del repositorio; no se declaran capacidades multilingues.
- La longitud de contexto no se especifica en la informacion disponible; debe consultarse la model card del SmolLM-1.7B-Instruct original.
- Al ser una cuantizacion, introduce degradacion de perplejidad medible: +0,88% en Q5_K_M y +3,27% en IQ4_XS sobre fp16 en WikiText-2. Fuera de ese corpus la degradacion puede diferir.
- Los bundles codificados solo se ejecutan con el runtime CUDA propio (`llmrt`) compilado desde el repositorio; no son compatibles con llama.cpp ni con otras herramientas estandar.
- El bundle puede ser mayor que su GGUF equivalente porque incluye la copia int8 de la tabla de embeddings y otras estructuras auxiliares; la comparacion de tamano de fichero no refleja directamente el ahorro de ancho de banda.
- Los gemelos de ancho fijo y los layouts de streaming no se suben al repositorio; deben reconstruirse con los scripts del proyecto si se necesitan.
- Riesgo de alucinacion y sesgos: inherentes al modelo base SmolLM-1.7B-Instruct; no se documentan evaluaciones de sesgo especificas en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base SmolLM-1.7B-Instruct, de la que se heredan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente fuera del paper.
- El commit de llama.cpp de referencia es `5d7793d`; aunque se indica que cualquier build reciente carga los GGUF, no se garantiza compatibilidad con versiones muy antiguas o futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnabsanyal/LazyWeights-SmolLM-1.7B-Instruct
- Paper (arXiv 2611.17108): https://arxiv.org/abs/2611.17108
- Codigo (GitHub): https://github.com/arnabsanyal/lazyWeights
- Coleccion LazyWeights en Hugging Face: https://huggingface.co/collections/arnabsanyal/lazyweights-6af7242c458566ddfc0b34de
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-1.7B-Instruct
