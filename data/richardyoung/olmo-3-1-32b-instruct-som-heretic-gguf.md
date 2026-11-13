# richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic-GGUF

## Resumen

Olmo-3.1-32B-Instruct-SOM-heretic GGUF es una distribucion cuantizada en formato GGUF del modelo richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic, que a su vez es una version "abliterated" (con el mecanismo de rechazo eliminado) de allenai/Olmo-3.1-32B-Instruct. El autor, Richard J. Young, aplica una tecnica de ablation multidireccional basada en mapas autoorganizados (SOM) mediante una bifurcacion del proyecto Heretic 2.0. El resultado es un modelo de 32.233.522.176 parametros que responde a solicitudes que el modelo original rechaza, y que se publica como objeto de estudio para la investigacion sobre eliminacion de rechazos y sus defensas.

La relevancia de esta ficha no reside en el rendimiento bruto del modelo, sino en su valor metodologico: forma parte de la evaluacion descrita en el articulo de Young sobre si la abliteracion se esta volviendo mas dificil segun la familia de modelos (Qwen3.8, Gemma 4, Olmo 3.1 y Mistral Small 3.2 frente a sus predecesores). El modelo base es un transformer denso de 32B con licencia Apache 2.0, pensado para generacion de texto conversacional en ingles.

Los archivos publicados en este repositorio son exclusivamente builds GGUF para llama.cpp y Ollama, con cuantizaciones Q4_K_M (19,5 GB) y Q8_0 (34,3 GB), ademas de una matriz de importancia de 30 MB. El autor advierte explicitamente de que las versiones cuantizadas no fueron evaluadas en el articulo y que la cuantizacion puede alterar el comportamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de allenai/Olmo-3.1-32B-Instruct; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K anunciadas como pendientes |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a allenai/Olmo-3.1-32B-Instruct, un transformer denso de 32B parametros. La informacion proporcionada no detalla la composicion del dataset de preentrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO en el modelo original; estos datos deben consultarse en la model card de allenai.

La innovacion tecnica de esta variante es el proceso de abliteration: se aplica una ablation multidireccional guiada por mapas autoorganizados (SOM) mediante una bifurcacion del proyecto Heretic 2.0. La regla de seleccion del trial consistio en minimizar los rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1, sobre una busqueda de 100 trials. El trial seleccionado produjo 79 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de primer token de 0,064. Los archivos GGUF se generaron con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize` sobre CPU; las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre el build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens), mientras que Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct original.
- Respuesta a solicitudes que el modelo original rechaza: el rechazo sobre 972 prompts daninos reservados cae del 84,1 % al 41,7 % (405/972) segun el juez WildGuard, en la version de precision completa.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como sujeto de estudio para medir la eficacia de la ablation multidireccional por SOM y comparar tasas de rechazo frente a variantes anteriores de la misma familia, usando el juez WildGuard sobre el conjunto de 972 prompts.
- Evaluacion de defensas frente a la eliminacion de rechazos: permite entrenar y validar clasificadores o filtros de seguridad que detecten respuestas problematicas en modelos abliterated.
- Analisis de degradacion por cuantizacion: al disponer de Q4_K_M y Q8_0 del mismo modelo, se puede medir como la cuantizacion altera la tasa de rechazo y la divergencia respecto al original, tal como advierte el autor.
- Reproducibilidad de articulos: los SHA-256 de cada archivo y la matriz de importancia permiten replicar los experimentos del articulo de Young sobre Olmo 3.1.
- Despliegue local en llama.cpp u Ollama para pruebas controladas: el formato GGUF y las instrucciones `ollama run hf.co/...` facilitan la ejecucion en entornos de laboratorio sin infraestructura de servidor.
- Estudio comparativo entre familias: junto con las variantes de Qwen3.8, Gemma 4 y Mistral Small 3.2 del mismo autor, permite analizar si la dificultad de abliteration varia de forma no uniforme entre generaciones de modelos.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo de precision completa (bf16) y provienen del articulo del autor; las versiones GGUF no fueron evaluadas.

| Metrica | Original (allenai/Olmo-3.1-32B-Instruct) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 84,1 % | 41,7 % (405/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 79 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,064 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19,5 GB para Q4_K_M y 34,3 GB para Q8_0, mas el overhead de contexto y de la cache KV de llama.cpp.
- GPU recomendadas: A100 40 GB o H100 para Q8_0 con contexto amplio; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M.
- Cabe en GPU de consumo: Q4_K_M cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) con margen ajustado; Q8_0 requiere 48 GB o mas y no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`) y Ollama (`ollama run hf.co/...:Q4_K_M`); vLLM y TGI no estan confirmados para este build GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic-GGUF | 32,2 B | no disponible | Apache 2.0 | GGUF | Version abliterated cuantizada, solo ingles |
| richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic | 32,2 B | no disponible | Apache 2.0 | safetensors | Modelo fuente en bf16, evaluado en el articulo |
| allenai/Olmo-3.1-32B-Instruct | 32,2 B | no disponible | Apache 2.0 | safetensors | Modelo original con rechazos intactos (84,1 % en WildGuard) |

No se dispone de datos de benchmarks de conocimiento ni de modelos comparables de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo elimina parcialmente el mecanismo de rechazo: responde a muchas solicitudes que el original rechaza, lo que lo hace inadecuado como asistente de proposito general y exige supervision en cualquier uso.
- El autor declara explicitamente que los archivos se publican para investigacion sobre abliteration y su evaluacion, no como asistente general.
- La cuantizacion puede alterar el comportamiento de rechazo; los numeros del articulo corresponden a bf16 y no a los GGUF publicados.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base allenai/Olmo-3.1-32B-Instruct.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Limitacion idiomatica: solo ingles segun la etiqueta de idioma del repositorio.
- Longitud de contexto: no disponible; conviene verificar la configuracion del modelo base antes de desplegar con contextos largos.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el autor remite a las restricciones de uso del modelo fuente y responsabiliza al usuario de un uso licito.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del build.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic-GGUF
- Modelo fuente (bf16): https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic
- Modelo original de AllenAI: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Articulo de referencia: Richard J. Young, "Is Abliteration Getting Harder? Not Uniformly: Refusal Removal by Direction-Based Ablation and ARA in Heretic on the Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 LLMs Versus Their Predecessors" (enlace arXiv pendiente de publicacion segun la model card)
- Proyecto Heretic: no disponible en la informacion proporcionada
- llama.cpp (commit usado `468fde9`): no disponible enlace directo en la informacion proporcionada
