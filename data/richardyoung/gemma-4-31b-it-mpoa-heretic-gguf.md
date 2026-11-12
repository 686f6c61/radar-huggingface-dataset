# richardyoung/gemma-4-31B-it-MPOA-heretic-GGUF

## Resumen

Gemma-4-31B-it-MPOA-heretic-GGUF es una compilacion en formato GGUF de un modelo derivado de google/gemma-4-31B-it, publicado por el investigador Richard J. Young. El modelo subyacente ha sido sometido a un proceso de "abliteration" (eliminacion de rechazos) mediante la herramienta Heretic 2.0, en su variante MPOA (proyeccion con preservacion de magnitud, la opcion por defecto de Heretic). El resultado es un modelo que responde a muchas peticiones que el original rechaza, manteniendo una divergencia KL de primer token de 0,069 respecto al original.

El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones) y esta pensado exclusivamente para investigacion sobre eliminacion de rechazos, su medicion y las defensas frente a ella. No es un asistente de proposito general. Esta version GGUF incluye unicamente pesos de texto: el proyector de vision del modelo base no esta incluido, por lo que no procesa imagenes.

La relevancia actual reside en que forma parte de un estudio comparativo sobre la dificultad creciente de aplicar abliteration a modelos de nueva generacion (Qwen3.8, Gemma 4, Olmo 3.1 y Mistral Small 3.2 frente a sus predecesores). La publicacion incluye un unico archivo de cuantizacion Q4_K_M (18,7 GB) y una matriz de importancia, con mas tamanos anunciados pero aun no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles especificos de la arquitectura del base no disponibles) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M disponible; anunciados IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 (aun no publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); matriz de importancia en archivo aparte |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-31B-it, un transformer de aproximadamente 30,7 mil millones de parametros. Sobre el se aplico abliteration mediante Heretic 2.0 en su variante MPOA (proyeccion ortogonal con preservacion de magnitud), que elimina direcciones de rechazo en el espacio de activaciones sin degradar en exceso el comportamiento general. La seleccion de la variante final siguio la regla de minimizar los rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token menor o igual a 0,1, sobre una busqueda de 100 ensayos.

Los datos de entrenamiento originales de Gemma 4 (numero de tokens, composicion del corpus, uso de RLHF/DPO) no se detallan en la informacion disponible. Respecto a la construccion de esta version GGUF: los safetensors publicados del modelo abliterado (revision 1b2d17362c33, verificados con SHA-256) se convirtieron con llama.cpp (commit 468fde9) mediante convert_hf_to_gguf.py con salida bf16 y posteriormente se cuantizaron con llama-quantize en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas. Cada archivo Q4_K_M se cargo y respondio a un prompt de prueba antes de su publicacion.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation, etiqueta conversational).
- Respuesta a peticiones que el modelo original rechaza: el rechazo en 972 prompts daninos reservados cae del 89,3 % al 40,4 % (393/972) segun el juez WildGuard, medido sobre el modelo en bf16.
- Razonamiento y generacion de codigo heredados del modelo base Gemma 4 (sin datos especificos de evaluacion en la informacion disponible).
- Procesamiento exclusivamente de texto: el proyector de vision del modelo base no esta incluido en estos archivos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con llama.cpp y Ollama.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como objeto de estudio para medir la eficacia de la eliminacion de rechazos y comparar la dificultad de aplicar la tecnica a distintas familias de modelos, tal como plantea el articulo asociado.
- Evaluacion de defensas frente a la eliminacion de rechazos: util para desarrollar y validar clasificadores de seguridad, jueces automaticos (como WildGuard) y filtros que detecten respuestas a prompts daninos.
- Analisis de degradacion por cuantizacion: al disponer de una matriz de importancia y de planes para multiples cuantizaciones, permite estudiar como la cuantizacion altera el comportamiento de rechazo respecto al modelo en bf16.
- Reproducibilidad de experimentos: los SHA-256 de cada archivo y la documentacion del proceso de conversion permiten replicar la cadena safetensors a GGUF con llama.cpp.
- Despliegue local de referencia: con 18,7 GB en Q4_K_M, se puede ejecutar en estaciones de trabajo con GPU de consumo alta o en CPU, sirviendo como banco de pruebas de llama.cpp y Ollama.
- Estudio de divergencia KL y preservacion de capacidades: la metrica de KL de primer token (0,069) permite analizar el equilibrio entre eliminar rechazos y conservar el comportamiento del modelo original.

## Benchmarks y rendimiento

Resultados publicados para el modelo en precision completa (bf16), no para los archivos cuantizados:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 89,3 % | 40,4 % (393/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 80 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,069 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los archivos cuantizados no fueron evaluados en el articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-21 GB para Q4_K_M (archivo de 18,7 GB mas overhead de contexto y cache KV), dependiendo de la longitud de contexto configurada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para margen holgado; RTX 4090 (24 GB) puede alojar Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con Q4_K_M; en GPUs de 16 GB no cabe esta cuantizacion.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (ollama run hf.co/richardyoung/gemma-4-31B-it-MPOA-heretic-GGUF:Q4_K_M); compatibilidad declarada con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (WildGuard, 972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-31B-it-MPOA-heretic-GGUF (este) | ~30,7 B | no disponible | 40,4 % (bf16) | apache-2.0 | GGUF |
| google/gemma-4-31B-it (original) | ~30,7 B | no disponible | 89,3 % | licencia Gemma 4 | safetensors |
| richardyoung/gemma-4-31B-it-MPOA-heretic (fuente) | ~30,7 B | no disponible | 40,4 % | apache-2.0 | safetensors |

No se dispone de datos comparativos con otros modelos abliterados de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo destinado a investigacion, no a uso como asistente de proposito general.
- Elimina rechazos de forma parcial pero significativa: sigue rechazando el 40,4 % de los prompts daninos reservados, por lo que el comportamiento es impredecible y no garantiza ninguna barrera de seguridad.
- La cuantizacion puede alterar el comportamiento de rechazo; los numeros publicados corresponden al modelo en bf16, no a los archivos GGUF.
- Solo texto: el proyector de vision del modelo base no esta incluido, por lo que no procesa imagenes.
- Idioma limitado al ingles segun la etiqueta declarada.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion disponible; se heredan los del modelo base.
- Restricciones de licencia: apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso del modelo base antes de cualquier uso comercial.
- Solo esta publicado Q4_K_M; el resto de cuantizaciones anunciadas (IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0) aun no estan disponibles.
- El articulo asociado figura con enlace arXiv pendiente de publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-MPOA-heretic-GGUF
- Modelo fuente (safetensors): https://huggingface.co/richardyoung/gemma-4-31B-it-MPOA-heretic
- Modelo base original: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Articulo asociado (arXiv): enlace pendiente de publicacion
