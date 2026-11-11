# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF es una distribucion en formato GGUF de un modelo derivado de Qwen2.5-Coder-7B-Instruct, el modelo de codigo de 7.600 millones de parametros desarrollado por Alibaba Qwen. La variante "heretic1x-general" ha sido sometida a un proceso de abliteracion (eliminacion de rechazos) mediante Heretic 1.x (heretic-llm 1.4.0), que aplica ablacion direccional de rango 1 con direcciones de rechazo generales. El autor de esta publicacion es richardyoung, que distribuye tanto los pesos completos en bf16 como estas cuantizaciones GGUF.

El modelo conserva la arquitectura transformer decoder-only del Qwen2.5-Coder original, con 7.615.616.512 parametros totales y una ventana de contexto que en la familia Qwen2.5-Coder-7B alcanza los 32.768 tokens (dato no confirmado en la informacion proporcionada para esta variante concreta). La relevancia de esta ficha reside en que documenta un artefacto de investigacion sobre eliminacion de rechazos: segun la model card, el modelo completo reduce la tasa de rechazo del 83,2% al 10,3% sobre 972 prompts daninos reservados, medidos con el juez WildGuard, manteniendo una divergencia KL de primer token de 0,0096 respecto al original.

Esta publicacion GGUF esta pensada explicitamente para investigacion sobre abliteracion, su medicion y las defensas frente a ella, no como asistente de proposito general. Los archivos cuantizados no fueron evaluados en el articulo citado y el propio autor advierte que la cuantizacion puede alterar el comportamiento de rechazo. El repositorio ocupa 12,8 GB y contiene cuantizaciones Q4_K_M y Q8_0, ademas de una matriz de importancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada para esta variante |
| Tipos de cuantizacion | Q4_K_M (4,7 GB), Q8_0 (8,1 GB); anunciadas IQ3_M, IQ4_XS, Q5_K_M y Q6_K; matriz de importancia imatrix (9 MB) |
| Idiomas soportados | en (segun metadatos de Hugging Face) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo fuente se publica en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso de 7.615.616.512 parametros. Sobre esa base, el autor aplico Heretic 1.x (heretic-llm 1.4.0), una tecnica de abliteracion que calcula direcciones de rechazo y aplica una ablacion direccional de rango 1 sobre los pesos, en este caso con direcciones de rechazo de caracter general. El proceso de seleccion descrito en la model card consistio en 200 ensayos y la eleccion de la variante con menos rechazos en el conjunto de desarrollo sujeto a una divergencia KL de primer token menor o igual a 0,01 respecto al modelo original.

Los datos de entrenamiento originales del Qwen2.5-Coder-7B-Instruct (composicion del corpus, numero de tokens, fases de RLHF o DPO) no se detallan en la informacion proporcionada. La model card solo documenta el proceso de abliteracion y la conversion a GGUF: los safetensors publicados del modelo fuente (revision `311cafc05437`, verificados con SHA-256) se convirtieron con `convert_hf_to_gguf.py --outtype bf16` y se cuantizaron con `llama-quantize` usando llama.cpp en el commit `468fde9`, ejecutado en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M emplean la matriz de importancia (calibration_datav3, 128 fragmentos de 512 tokens calculada sobre la build Q8_0), mientras que Q6_K y Q8_0 son estaticas. Cada archivo Q4_K_M se cargo y respondio a un prompt de prueba antes de la subida.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del Qwen2.5-Coder-7B-Instruct original en generacion y comprension de codigo.
- Conversacion multi-turno: el pipeline declarado es text-generation con tag `conversational`.
- Eliminacion de rechazos: segun la model card, el modelo cumple muchas peticiones que el original rechaza (tasa de rechazo del 10,3% frente al 83,2% del original en el conjunto de evaluacion del articulo).
- Compatibilidad con tooling de inferencia local: formato GGUF compatible con llama.cpp, Ollama y endpoints compatibles (tag `endpoints_compatible`).
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`); no se documentan otras lenguas para esta variante.
- Modo thinking, vision, audio, tool calling o function calling: no disponible en la informacion proporcionada para esta variante.

## Casos de uso

- Investigacion sobre abliteracion: el caso de uso declarado por el autor. Permite reproducir y medir la eficacia de Heretic 1.x frente a otras herramientas (Heretic 2.0, OBLITERATUS) sobre la misma base Qwen2.5-Coder, usando los conjuntos de prompts y el juez WildGuard descritos en el articulo.
- Evaluacion de defensas frente a la eliminacion de rechazos: sirve como modelo de ataque controlado para probar clasificadores de seguridad, filtros de salida o mecanismos de alineacion adicional en pipelines de investigacion.
- Estudio del efecto de la cuantizacion en el comportamiento de rechazo: al disponer de Q4_K_M y Q8_0 del mismo modelo, permite comparar como la cuantizacion altera la tasa de rechazo, algo que el autor senala explicitamente como no evaluado.
- Despliegue local de bajo coste para experimentacion: la build Q4_K_M (4,7 GB) cabe en GPUs de consumo y permite ejecutar el modelo con Ollama o llama.cpp en estaciones de trabajo sin infraestructura dedicada.
- Pruebas de robustez de guardarrailes en aplicaciones de codigo: en entornos de investigacion, evaluar si un asistente de codigo derivado de Qwen2.5-Coder mantiene restricciones de contenido bajo cuantizacion y abliteracion.
- Analisis de divergencia de comportamiento: la metrica de KL de primer token (0,0096) y la tasa de rechazo permiten estudiar cuanto cambia la distribucion de salida del modelo tras la ablacion, como referencia para metodos de edicion de pesos mas conservadores.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion proporcionada corresponden al modelo completo en bf16, no a los archivos GGUF de esta publicacion.

| Metrica | Original (bf16) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 83,2% | 10,3% (100/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 21 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no aplica | 0,0096 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que los archivos cuantizados no fueron evaluados en el articulo y que la cuantizacion puede cambiar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 4,7 GB de pesos, por lo que con overhead de contexto y cache KV conviene reservar entre 6 y 8 GB de VRAM para contextos moderados; Q8_0 requiere aproximadamente 8,1 GB de pesos y en torno a 10-12 GB de VRAM en la practica.
- GPU de consumo: Q4_K_M cabe en GPUs de 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070); Q8_0 requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- GPU de datacenter: A100, H100 o L40S permiten ejecutar Q8_0 con contextos amplios y mayor paralelismo, aunque el modelo es pequeno para estas GPU y el cuello de botella sera el ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run richardyoung/qwen2.5-coder-7b-instruct-heretic1x-general`, con etiquetas como `:Q8_0`) y servidores compatibles con endpoints segun el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF (este) | 7,6 B | no disponible | apache-2.0 | Abliterado, cuantizado GGUF | Hugging Face, Ollama |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens (familia Qwen2.5-Coder; no confirmado en esta ficha) | apache-2.0 | Asistente de codigo alineado | Hugging Face |
| Heretic 2.0 sobre Qwen2.5-Coder | no disponible | no disponible | no disponible | Abliteracion alternativa evaluada en el mismo articulo | no disponible |
| OBLITERATUS sobre Qwen2.5-Coder | no disponible | no disponible | no disponible | Abliteracion alternativa evaluada en el mismo articulo | no disponible |

La comparativa de rendimiento entre estas variantes de abliteracion se desarrolla en el articulo de Young, que segun la model card analiza como la regla de seleccion puede invertir las comparaciones entre herramientas. Los datos numericos de Heretic 2.0 y OBLITERATUS no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: elimina deliberadamente los rechazos, por lo que puede generar contenido que el modelo original rechazaria. No es adecuado como asistente de proposito general ni para produccion sin capas de seguridad adicionales.
- Uso previsto restringido: el autor lo publica para investigacion sobre eliminacion de rechazos, su medicion y defensas; los usuarios son responsables del uso legal.
- Cuantizacion no evaluada: los archivos GGUF no fueron evaluados en el articulo y la cuantizacion puede alterar la tasa de rechazo y la calidad de las respuestas.
- Idiomas: los metadatos declaran solo ingles; no se documenta soporte fiable de castellano u otras lenguas en esta variante.
- Contexto: la longitud de contexto de esta variante no se especifica en la informacion disponible; conviene verificar la configuracion en llama.cpp u Ollama antes de usarla con entradas largas.
- Sesgos y alucinacion: no se documentan evaluaciones de sesgo ni de tasas de alucinacion para esta variante; al ser un derivado de Qwen2.5-Coder, hereda los sesgos del modelo base, no cuantificados aqui.
- Licencia: apache-2.0, la misma que el modelo fuente, con las restricciones de uso que el autor remite a la model card del modelo fuente.
- Reputacion del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF
- Modelo fuente (bf16): https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct/blob/main/LICENSE
- Articulo citado: Richard J. Young, "The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder" (enlace arXiv pendiente de publicacion segun la model card)
