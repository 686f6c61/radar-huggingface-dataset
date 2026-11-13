# richardyoung/Qwen2.5-32B-Instruct-SOM-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-SOM-heretic-GGUF es una distribucion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-SOM-heretic, una version "abliterada" (con los mecanismos de rechazo eliminados) del conocido Qwen2.5-32B-Instruct de Alibaba. La modificacion se ha realizado con Heretic 2.0, una herramienta que aplica ablacion multidireccional basada en mapas autoorganizados (SOM, self-organising map) sobre las direcciones de activacion asociadas al rechazo. El autor, Richard J. Young, publica estos ficheros como material de investigacion sobre eliminacion de rechazos y su evaluacion, no como asistente de proposito general.

El modelo conserva la arquitectura y el peso del Qwen2.5-32B-Instruct original (32.763.876.352 parametros, transformer denso, contexto de 32.768 tokens en la version base de Qwen2.5) pero modifica el comportamiento de rechazo: segun los datos del paper citado, la tasa de rechazo sobre 972 prompts daninos retenidos cae del 76,8% en el original al 42,7% en esta version, con una divergencia KL de primer token de 0,075 respecto al original. Es relevante ahora porque permite estudiar de forma reproducible como la ablacion afecta al comportamiento de seguridad y porque el autor publica los pesos cuantizados con matriz de importancia (imatrix) para facilitar la experimentacion en hardware de consumo.

El repositorio contiene unicamente builds GGUF (no safetensors) orientados a llama.cpp y Ollama. En el momento de la consulta solo esta publicado el fichero Q4_K_M (19,9 GB) y la matriz de importancia; el autor anuncia que anadira IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0. La licencia declarada es apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), decoder-only |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-32B-Instruct base soporta 32.768 tokens; la model card de este derivado no lo especifica) |
| Tipos de cuantizacion | Q4_K_M publicado; anunciados IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0; matriz de importancia (imatrix) publicada como fichero aparte |
| Idiomas soportados | en (segun la model card; el Qwen2.5 base es multilingue, pero este derivado declara solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm y RoPE, entrenado originalmente por Alibaba sobre un corpus multilingue de varios billones de tokens con fases de ajuste supervisado y optimizacion por preferencias. Este derivado no reentrena el modelo: aplica ablacion de direcciones sobre los pesos del modelo base mediante Heretic 2.0, que en esta version utiliza mapas autoorganizados (SOM) para identificar multiples direcciones de rechazo en lugar de una unica direccion media.

El procedimiento de seleccion descrito en la model card es una busqueda de 100 trials que minimiza los rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. El trial seleccionado logra 73 rechazos por palabra clave sobre los 100 prompts de ajuste y una KL de 0,075. La cuantizacion se realizo con llama.cpp (commit 468fde9): conversion a bf16 con convert_hf_to_gguf.py y posterior llama-quantize en CPU. Los formatos IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia calculada sobre el build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticos. No se documenta en la informacion disponible ningun entrenamiento adicional, RLHF o DPO especifico para este derivado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen2.5-32B-Instruct.
- Razonamiento y matematicas de nivel medio-alto, propio de un modelo de 32B de la familia Qwen2.5.
- Generacion de codigo y comprension de lenguajes de programacion, segun las capacidades del base.
- Soporte de tool calling y function calling, segun las capacidades del Qwen2.5-32B-Instruct original (la model card de este derivado no lo detalla).
- Capacidad de seguir instrucciones y mantener contexto largo, limitada por el contexto efectivo del build GGUF (no especificado).
- Capacidades multilingues del base limitadas en la practica: la model card declara solo ingles para este derivado.
- Comportamiento de rechazo reducido: cumple muchas peticiones que el original rechaza, lo que constituye su rasgo diferencial.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Investigacion sobre ablacion de rechazos: el modelo sirve como sujeto de estudio para medir como la eliminacion de direcciones afecta a la tasa de rechazo, la coherencia y la utilidad, comparandolo con el Qwen2.5-32B-Instruct original y con otros derivados abliterados.
- Evaluacion de defensas y jueces de seguridad: permite generar respuestas que el modelo original rechazaria para probar clasificadores de contenido, filtros de salida y mecanismos de moderacion en pipelines propios.
- Analisis de robustez de cuantizaciones: al publicarse imatrix y varios formatos, se puede estudiar como la cuantizacion Q4_K_M altera el comportamiento de rechazo respecto al bf16, tal como advierte el propio autor.
- Experimentacion local con llama.cpp y Ollama: el fichero Q4_K_M (19,9 GB) se puede ejecutar en estaciones de trabajo con GPU de consumo alta o en CPU con suficiente RAM, sin depender de APIs externas.
- Estudio de sesgos y degradacion: util para medir si la ablacion introduce cambios en estilo, factualidad o coherencia respecto al original mediante la KL de primer token y metricas propias.
- Docencia y divulgacion tecnica: ejemplo reproducible de como se construye un modelo abliterado y de las herramientas (Heretic, SOM, imatrix) implicadas, con ficheros y sumas SHA-256 publicados.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del paper citado, medidos sobre el modelo en bf16 (no sobre los GGUF):

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 76,8% | 42,7% (415/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 73 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no aplica | 0,075 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte explicitamente que los ficheros cuantizados no fueron evaluados en el paper y que la cuantizacion puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para el Q4_K_M publicado: aproximadamente 20 GB solo de pesos, mas overhead de contexto y cache KV; en la practica se recomienda disponer de 24 GB o mas de VRAM para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M con contexto limitado; A100 40/80 GB, H100 o L40S para mayor contexto o para los futuros Q6_K y Q8_0.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con Q4_K_M y contexto ajustado; en tarjetas de 16 GB no cabe el Q4_K_M completo y requeriria offload a RAM o esperar a los formatos IQ3_M/IQ4_XS anunciados.
- Alternativa en CPU: con 32 GB de RAM o mas se puede ejecutar Q4_K_M en llama.cpp con rendimiento bajo pero funcional.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (ollama run hf.co/richardyoung/Qwen2.5-32B-Instruct-SOM-heretic-GGUF:Q4_K_M) y cualquier runtime compatible con GGUF; no se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-SOM-heretic-GGUF (este) | 32,8B | no disponible | 42,7% en 972 prompts (bf16) | apache-2.0 | GGUF (Q4_K_M) |
| Qwen2.5-32B-Instruct (original) | 32,8B | 32.768 tokens (segun Qwen) | 76,8% en 972 prompts (bf16) | apache-2.0 | safetensors, GGUF de terceros |
| richardyoung/Qwen2.5-32B-Instruct-SOM-heretic (bf16) | 32,8B | no disponible | 42,7% en 972 prompts | apache-2.0 | safetensors |
| Otros derivados abliterados de Qwen2.5-32B | no disponible | no disponible | no disponible | variable | variable |

La comparativa con otros modelos abliterados de la misma categoria no esta documentada en la informacion proporcionada; el propio paper compara con derivados de Qwen3.8, Gemma 4, Olmo 3.1 y Mistral Small 3.2, pero sin cifras disponibles en esta ficha.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo publica para estudiar la eliminacion de rechazos y sus defensas, no como asistente de proposito general; no deberia desplegarse como chatbot de produccion sin controles adicionales.
- Riesgo de contenido danino: el 42,7% de rechazo sobre prompts daninos implica que mas de la mitad de esas peticiones obtienen respuesta; requiere moderacion externa si se usa en entornos con usuarios.
- Alucinacion: no se han publicado evaluaciones de factualidad para este derivado; la ablacion puede degradar la coherencia y la precision respecto al original (KL de 0,075 en el primer token, pero sin metricas de calidad global).
- Efecto de la cuantizacion: el autor advierte que los GGUF no se evaluaron en el paper y que la cuantizacion puede cambiar el comportamiento de rechazo; los numeros de la tabla corresponden a bf16.
- Idioma: la model card declara solo ingles, aunque el base Qwen2.5 es multilingue; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: no se especifica la longitud de contexto efectiva de los builds GGUF; debe verificarse en el runtime antes de usarlo con documentos largos.
- Licencia: apache-2.0 heredada del modelo base, con las mismas restricciones de uso que el Qwen2.5-32B-Instruct original; el usuario es responsable del uso licito.
- Sesgos: no se documentan evaluaciones de sesgo para este derivado; los sesgos del Qwen2.5-32B-Instruct original se mantienen y pueden verse alterados por la ablacion.
- Reproducibilidad: el autor publica sumas SHA-256 en SHA256SUMS y detalla el commit de llama.cpp, lo que facilita la verificacion, pero no se incluyen scripts de la ablacion en este repo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-SOM-heretic-GGUF
- Modelo base abliterado (bf16): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-SOM-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Paper citado (arXiv, enlace pendiente de publicacion segun la model card): no disponible
- Heretic (herramienta de ablacion): no se proporciona enlace en la informacion disponible
- llama.cpp: no se proporciona enlace en la informacion disponible
- Ollama: no se proporciona enlace en la informacion disponible
