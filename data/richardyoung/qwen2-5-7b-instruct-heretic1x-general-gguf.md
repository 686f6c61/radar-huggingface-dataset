# richardyoung/Qwen2.5-7B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-7B-Instruct-heretic1x-general-GGUF es la distribucion en formato GGUF del modelo abliterado (con las respuestas de rechazo eliminadas) que Richard Young deriva de Qwen/Qwen2.5-7B-Instruct, el modelo instructivo de 7.600 millones de parametros de Alibaba. La intervencion se realizo con Heretic 1.x (heretic-llm 1.4.0) mediante ablacion direccional de rango 1 usando direcciones de rechazo generales, una tecnica que sustrae del espacio de activaciones la direccion asociada a la negativa a responder. El resultado es un modelo que cumple muchas peticiones que el original rechaza, con una divergencia KL de solo 0,0053 respecto al original en el primer token.

Este repositorio no aporta pesos nuevos: empaqueta los safetensors ya publicados del modelo heretic en cuantizaciones GGUF listas para llama.cpp y Ollama, con Q4_K_M como variante por defecto y Q8_0 como opcion casi sin perdida. Incluye una importance matrix (imatrix) calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens) que se aplica a IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M.

Su relevancia es de investigacion: forma parte de la evaluacion comparativa de herramientas de abliteracion (Heretic 1.x, Heretic 2.0, OBLITERATUS y releases comunitarias) recogida en un articulo de Young. No esta pensado como asistente de proposito general, sino como objeto de estudio sobre eliminacion de rechazos, su medicion y las defensas frente a ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), derivado por ablacion direccional de rango 1 |
| Parametros totales | 7.615.616.512 (7,62 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada en esta ficha) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, imatrix (9 MB); anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only de 7,62 mil millones de parametros. Sobre ella no se reentrena nada; la modificacion consiste en una ablacion direccional de rango 1 aplicada a los pesos con Heretic 1.x, que identifica direcciones de rechazo generales y las resta de las activaciones. La seleccion de la variante final siguio una regla explicita: entre 200 ensayos, se escogio el que minimizaba los rechazos en el conjunto de desarrollo con una divergencia KL respecto al original menor o igual a 0,01, resultando 0,0053 en el primer token.

Los GGUF se generaron con llama.cpp (commit 468fde9) a partir de los safetensors publicados (revision e28733339130, con verificacion SHA-256 de cada fichero de pesos): conversion con `convert_hf_to_gguf.py --outtype bf16` y cuantizacion con `llama-quantize` en CPU. Cada Q4_K_M se cargo y respondio a un prompt de prueba antes de subirse. La imatrix se calculo sobre la build Q8_0 con calibration_datav3. Los datos de entrenamiento originales de Qwen2.5 (composicion del corpus, fases de RLHF/DPO) no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento, codigo y matematicas en el nivel propio de un modelo de 7 B, sin mejoras adicionales por la ablacion.
- Cumplimiento de peticiones que el modelo original rechaza: el rechazo en 972 prompts daninos reservados cae del 72,1 % al 39,6 % (385/972) en el modelo de precision completa.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Multilingue: los metadatos declaran solo ingles; el comportamiento en otros idiomas no esta verificado.
- Sin modo thinking, vision ni audio documentados.

## Casos de uso

- Investigacion sobre abliteracion: usar el modelo como condicion experimental para medir tasas de rechazo con jueces automaticos (por ejemplo WildGuard) y comparar con Heretic 2.0, OBLITERATUS y releases comunitarias en la misma base Qwen2.5.
- Evaluacion de defensas frente a la eliminacion de rechazos: emplear el modelo como adversario controlado para probar clasificadores de seguridad, filtros de salida o tecnicas de realineamiento.
- Estudio del efecto de la cuantizacion en el comportamiento de rechazo: comparar Q4_K_M frente a Q8_0 y frente al bf16 original, ya que el autor advierte que la cuantizacion puede alterar la conducta de negativa y los GGUF no fueron evaluados en el paper.
- Reproducibilidad de pipelines de cuantizacion: el repositorio documenta commit de llama.cpp, revision de safetensors, sumas SHA-256 y parametros de la imatrix, lo que permite replicar la build y verificar artefactos.
- Despliegue local en hardware de consumo para experimentos: Q4_K_M (4,7 GB) cabe en GPU consumer y permite iterar sobre prompts de investigacion sin infraestructura de servidor.
- Analisis de divergencia respecto al original: medir KL en el primer token y en generaciones largas para cuantificar cuanto se aleja la ablacion del modelo de referencia en tareas benignas.
- Docencia y divulgacion tecnica: ilustrar de forma tangible que es una direccion de rechazo y como una resta de rango 1 altera el comportamiento sin reentrenar.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo de precision completa (bf16), no a los GGUF:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 72,1 % | 39,6 % (385/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 67 |
| Divergencia KL del primer token respecto al original (ensayo seleccionado) | no disponible | 0,0053 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible, ni evaluaciones de las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: unos 5-6 GB incluyendo contexto y overhead; el fichero pesa 4,7 GB.
- VRAM estimada para Q8_0: unos 9-10 GB; el fichero pesa 8,1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q8_0; A100/H100 solo si se sirven muchas peticiones concurrentes.
- Cabe en GPU consumer: si, Q4_K_M en tarjetas de 8 GB o mas y Q8_0 en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf`), Ollama (`ollama run richardyoung/qwen2.5-7b-instruct-heretic1x-general`), y cualquier runtime compatible con GGUF; el repo declara endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (bf16) | 7,62 B | no disponible | 39,6 % | apache-2.0 | safetensors/GGUF |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,62 B | no disponible | 72,1 % | apache-2.0 | safetensors |
| Heretic 2.0 sobre Qwen2.5 | no disponible | no disponible | evaluado en el paper, cifra no disponible | no disponible | no disponible |
| OBLITERATUS sobre Qwen2.5 | no disponible | no disponible | evaluado en el paper, cifra no disponible | no disponible | no disponible |

La comparativa de capacidades (MMLU, codigo, matematicas) entre estas variantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es para investigacion sobre abliteracion y evaluacion, no como asistente de proposito general.
- Elimina buena parte de las negativas de seguridad: el 39,6 % de rechazo restante implica que seguira cumpliendo un volumen alto de peticiones daninas; su uso en produccion orientada a usuarios finales es desaconsejable.
- Los datos de rechazo del paper corresponden al bf16; las cuantizaciones no se evaluaron y pueden alterar el comportamiento de negativa, en cualquier direccion.
- Riesgo de alucinacion propio de un modelo de 7 B, sin mitigaciones adicionales documentadas.
- Idiomas: metadatos solo en ingles; el rendimiento en castellano no esta verificado y podria degradarse respecto al Qwen2.5 original.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; la ablacion puede alterar respuestas en dominios sensibles mas alla de la negativa explicita.
- Licencia apache-2.0 heredada, pero el usuario es responsable del uso licito; conviene revisar la model card del modelo base para restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- No se confirman capacidades de tool calling ni de agente para esta variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-general-GGUF
- Modelo base abliterado: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-general
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Paper de referencia (arXiv pendiente de publicacion): Young, R. J., *The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder*, 2026
- Herramienta Heretic (heretic-llm 1.4.0): no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
