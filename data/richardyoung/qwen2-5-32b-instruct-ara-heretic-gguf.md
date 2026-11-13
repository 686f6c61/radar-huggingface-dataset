# richardyoung/Qwen2.5-32B-Instruct-ARA-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic-GGUF es una distribucion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-ARA-heretic, una version "abliterated" (con los mecanismos de rechazo eliminados) de Qwen/Qwen2.5-32B-Instruct. La ablacion se realizo con Heretic 2.0, en concreto con su metodo Arbitrary-Rank Ablation (ARA), una tecnica de optimizacion que busca direcciones de ablacion de rango arbitrario para minimizar la divergencia respecto al modelo original. El autor del modelo es Richard J. Young y el repositorio GGUF lo publica bajo el identificador richardyoung.

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct original: un transformer denso de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) con una ventana de contexto de 32.768 tokens en la version original de Qwen2.5. El interes de esta publicacion no es tanto la capacidad generica del modelo como la posibilidad de reproducir y evaluar el efecto de la ablacion de rechazos sobre un modelo de ese tamano, empaquetado en cuantizaciones GGUF listas para llama.cpp y Ollama.

La relevancia actual es doble: por un lado, proporciona artefactos practicos (Q4_K_M, imatrix y futuras cuantizaciones IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0) para ejecutar un modelo de 32B en hardware de consumo; por otro, forma parte de un trabajo de investigacion sobre la dificultad creciente de la abliteracion en modelos recientes. La model card advierte explicitamente de que los ficheros se publican para investigacion sobre eliminacion de rechazos y su evaluacion, no como asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-32B-Instruct; no se detalla en la model card) |
| Parametros totales | 32.763.876.352 (aproximadamente 32,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 32.768 tokens, pero la model card no lo confirma para esta variante) |
| Tipos de cuantizacion | Q4_K_M (publicada); IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas como "en proceso"; imatrix incluida |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 (con las mismas restricciones de uso que el modelo fuente) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-32B-Instruct: un transformer denso de 32,8B parametros. La model card de esta variante GGUF no aporta detalles adicionales sobre la arquitectura interna (numero de capas, dimensiones, atencion, etc.), por lo que esos datos deben consultarse en la model card original de Qwen. La innovacion tecnica de esta publicacion no esta en el preentrenamiento ni en el ajuste por instrucciones, sino en la modificacion de pesos mediante ablacion de direcciones.

El proceso de abliteracion se realizo con Heretic 2.0 y su metodo Arbitrary-Rank Ablation (ARA). Segun la model card, se ejecuto una busqueda de 100 pruebas y se selecciono la variante con menos rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. La variante elegida presenta una divergencia KL de primer token de 0,062 y 10 rechazos por palabra clave sobre los 100 prompts de ajuste. Los resultados reportados en el articulo (no en esta model card) indican que el modelo completo en bf16 reduce la tasa de rechazo del 76,8% al 6,1% (59 de 972) sobre prompts daninos reservados, evaluados con el juez WildGuard. Los ficheros GGUF no fueron evaluados en el articulo y el autor advierte de que la cuantizacion puede alterar el comportamiento de rechazo.

La conversion a GGUF se realizo con llama.cpp (commit 468fde9): convert_hf_to_gguf.py con --outtype bf16 y posterior llama-quantize en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M emplean una importance matrix calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas. Cada fichero Q4_K_M se cargo y respondio a un prompt de prueba antes de la subida, y se incluyen sumas SHA-256 en SHA256SUMS.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste por instrucciones de Qwen2.5-32B-Instruct.
- Razonamiento y respuesta a instrucciones de complejidad media-alta, propio de un modelo denso de 32B.
- Generacion de codigo y matematicas: capacidades propias del modelo base Qwen2.5-32B-Instruct, aunque no se documentan explicitamente en esta model card.
- Cumplimiento de solicitudes que el modelo original rechaza: la ablacion elimina buena parte de los rechazos (6,1% de rechazo residual frente al 76,8% del original en la evaluacion del articulo con el modelo bf16).
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles ("en"); no se confirman otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre eliminacion de rechazos: el modelo sirve como artefacto reproducible para medir la eficacia de ARA y de Heretic 2.0 sobre un transformer de 32B, comparando tasas de rechazo y divergencia KL respecto al original.
- Evaluacion de defensas frente a abliteracion: permite a equipos de seguridad estudiar como se comportan clasificadores, filtros de salida y mecanismos de moderacion ante un modelo con rechazos suprimidos, usando la cuantizacion Q4_K_M en entornos de laboratorio.
- Estudio del impacto de la cuantizacion en el comportamiento de rechazo: al disponer de Q4_K_M y de futuras IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0, se puede medir si la cuantizacion reintroduce o elimina rechazos de forma no uniforme.
- Despliegue local en hardware de consumo para experimentacion: la cuantizacion Q4_K_M (19,9 GB) permite ejecutar un modelo de 32,8B en una GPU con 24 GB de VRAM o en configuraciones con offload a CPU, usando llama.cpp u Ollama.
- Pruebas de pipelines de inferencia GGUF: el repositorio incluye una imatrix y sumas SHA-256, lo que facilita validar la cadena de conversion y cuantizacion en pipelines de CI internos.
- Analisis de sesgos y comportamiento en dominios sensibles: al no rechazar tantas solicitudes como el original, permite estudiar respuestas del modelo ante prompts que el modelo base evitaba, siempre en el marco de investigacion y con las salvaguardas adecuadas.
- Comparativas de rendimiento entre cuantizaciones: util para medir latencia, throughput y calidad de generacion de Q4_K_M frente a las versiones de mayor precision cuando esten disponibles.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la model card son los del modelo completo en bf16, no de los ficheros GGUF:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 76,8% | 6,1% (59/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (prueba seleccionada) | no disponible | 10 |
| Divergencia KL de primer token respecto al original (prueba seleccionada) | no disponible | 0,062 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni para el modelo bf16 ni para los ficheros GGUF. El autor indica explicitamente que las cuantizaciones no fueron evaluadas en el articulo.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 19,9 GB solo para los pesos, mas overhead de contexto KV; en la practica requiere alrededor de 22-24 GB para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M con contexto limitado; A100 40/80 GB o H100 para mayor contexto y throughput; configuraciones multi-GPU para las futuras Q6_K y Q8_0.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 24 GB; en GPUs de 16 GB o menos sera necesario offload parcial a CPU o usar cuantizaciones IQ3_M o IQ4_XS cuando esten disponibles.
- Opciones de despliegue: llama.cpp (llama-cli con -hf), Ollama (ollama run hf.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic-GGUF:Q4_K_M); vLLM y TGI no estan documentados para este repositorio GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic-GGUF | 32,8B | no disponible (base: 32.768) | GGUF (Q4_K_M) | apache-2.0 | Abliterado con Heretic 2.0/ARA; rechazo residual 6,1% en bf16 |
| Qwen/Qwen2.5-32B-Instruct | 32,8B | 32.768 | safetensors | apache-2.0 | Modelo original con rechazos intactos (76,8% en la evaluacion del articulo) |
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic | 32,8B | no disponible | safetensors (bf16) | apache-2.0 | Version completa sin cuantizar del mismo modelo abliterado |
| Otras variantes abliterated de Qwen2.5-32B | 32,8B | variable | safetensors/GGUF | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de comparativas de rendimiento de capacidad general con modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor declara explicitamente que no es un asistente de proposito general y que su uso previsto es la investigacion sobre eliminacion de rechazos y su medicion.
- Eliminacion de rechazos: el modelo cumple muchas solicitudes que el original rechaza, lo que implica un riesgo elevado de generar contenido danino si se usa sin salvaguardas externas.
- Cuantizacion no evaluada: los ficheros GGUF no fueron evaluados en el articulo y la cuantizacion puede cambiar el comportamiento de rechazo; los datos de 6,1% corresponden solo al modelo bf16.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje de este tamano.
- Idioma: solo se declara ingles; no se confirman capacidades multilingues.
- Contexto: la model card no confirma la ventana de contexto efectiva de esta variante; debe verificarse antes de usarla en produccion.
- Licencia: apache-2.0, pero con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso licito.
- Sin benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8K ni similares para esta variante, por lo que no se puede caracterizar su calidad general respecto al original.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base y pueden verse alterados por la ablacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Articulo citado (arXiv pendiente de enlace): "Is Abliteration Getting Harder? Not Uniformly: Refusal Removal by Direction-Based Ablation and ARA in Heretic on the Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 LLMs Versus Their Predecessors", Richard J. Young, 2026
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
