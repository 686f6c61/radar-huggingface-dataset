# mradermacher/gemma3-27b-v2-starlike-GGUF

## Resumen

`mradermacher/gemma3-27b-v2-starlike-GGUF` es una coleccion de cuantizaciones GGUF del modelo `ToastyPigeon/gemma3-27b-v2-starlike`, un merge de la familia Gemma 3 de Google con 27.009.007.616 parametros totales. El autor de las cuantizaciones es mradermacher, conocido en el ecosistema por publicar versiones GGUF de modelos abiertos para su uso en llama.cpp y entornos de inferencia local. El modelo base es a su vez un merge generado con mergekit, lo que implica que combina pesos de varios modelos derivados de Gemma 3.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~27B parametros en hardware de consumo mediante cuantizaciones que van desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB), ademas de incluir el proyector multimodal (`mmproj`) que preserva la capacidad de vision del modelo base. El repositorio ocupa 188,1 GB en total porque contiene todas las variantes de cuantizacion.

No se dispone de informacion sobre la composicion exacta del merge, los datos de entrenamiento del modelo base ni resultados de benchmarks publicados por el autor. La licencia tampoco esta declarada en la model card, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3, sin confirmar detalles del merge) |
| Parametros totales | 27.009.007.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `ToastyPigeon/gemma3-27b-v2-starlike` es un merge construido con mergekit, segun las etiquetas del repositorio. Esto significa que sus pesos resultan de combinar los tensores de varios modelos derivados de Gemma 3, no de un entrenamiento desde cero. La arquitectura subyacente es la de Gemma 3, un transformer decoder-only, pero no se detalla en la informacion disponible ni la configuracion exacta de capas, cabezas de atencion ni el metodo de merge empleado (SLERP, TIES, DARE, etc.).

Tampoco se documentan los datos de entrenamiento, el numero de tokens utilizados, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas especificas del merge. La presencia de un archivo `mmproj` confirma que el modelo conserva el codificador visual de Gemma 3, lo que habilita entrada de imagenes en llama.cpp. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa y no se incluye.

## Capacidades

- Generacion de texto en ingles, heredada de la familia Gemma 3.
- Procesamiento multimodal de imagenes gracias al proyector `mmproj` incluido en el repositorio.
- Razonamiento general y respuesta a instrucciones, presumiblemente por la naturaleza instruct del modelo base (no confirmado en la informacion disponible).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo: con la cuantizacion Q4_K_M (16,6 GB) el modelo puede ejecutarse en una GPU de consumo con 24 GB de VRAM, como una RTX 4090, usando llama.cpp u Ollama.
- Procesamiento de imagenes en local: el archivo `mmproj-f16` (1,0 GB) permite alimentar imagenes al modelo sin depender de APIs externas, util para clasificacion o descripcion de documentos escaneados.
- Prototipado de asistentes conversacionales en ingles: la variante Q5_K_M (19,4 GB) ofrece un equilibrio entre calidad y requisitos de memoria para entornos de desarrollo.
- Despliegue en servidores con multiples GPU: la variante Q8_0 (28,8 GB) o el modelo base en safetensors permite servir el modelo con vLLM o TGI en una sola A100 de 40 GB o H100.
- Evaluacion de merges comunitarios: investigadores que quieran comparar el comportamiento de este merge frente a Gemma 3 original pueden usar las cuantizaciones para pruebas rapidas sin descargar los 188 GB completos.
- Fine-tuning ligero sobre la version safetensors: aunque el repositorio solo publica GGUF, el modelo base en safetensors puede adaptarse con LoRA antes de volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,6 GB (Q2_K) y 28,8 GB (Q8_0) solo para los pesos, mas overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q8_0 y el modelo base; RTX 3090 (24 GB) tambien admite Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 5090 y GPUs con 16 GB o mas usando cuantizaciones Q3_K_M o inferiores (con perdida de calidad).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp; para el modelo base en safetensors, vLLM y TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma3-27b-v2-starlike-GGUF | 27,0B | no disponible | no disponible | GGUF | Merge comunitario, cuantizaciones de 10,6 a 28,8 GB |
| google/gemma-3-27b-it | ~27B | 128K (segun documentacion de Google) | Gemma Terms of Use | safetensors, GGUF comunitarios | Modelo oficial de Google, benchmarks publicados |
| mistralai/Mistral-Small-3.1-24B | ~24B | 128K (segun documentacion de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Qwen/Qwen2.5-32B-Instruct | ~32B | 128K (segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF | Mayor numero de parametros y licencia permisiva |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks del merge para comparar rendimiento real.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base `ToastyPigeon/gemma3-27b-v2-starlike` y, en ultima instancia, los terminos de Gemma 3 de Google.
- Idioma: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Alucinacion: al ser un merge sin evaluacion publicada, no hay datos sobre su tasa de alucinacion ni sobre posibles degradaciones respecto al Gemma 3 original.
- Calidad variable segun cuantizacion: Q2_K y Q3_K_M pierden calidad de forma notable; el autor recomienda Q4_K_S, Q4_K_M y Q8_0 como opciones equilibradas.
- Sin benchmarks: no hay evidencia publica de que el merge mejore al modelo base; puede incluso degradar capacidades.
- Contexto no documentado: se desconoce si conserva los 128K tokens de Gemma 3 o si el merge los ha alterado.
- Repositorio de 188,1 GB: descargar el repo completo es costoso; conviene bajar solo la variante necesaria.
- Modelo con muy pocas descargas (23) y 0 likes: sin validacion de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma3-27b-v2-starlike-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma3-27b-v2-starlike
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma3-27b-v2-starlike-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma3-27b-v2-starlike-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
