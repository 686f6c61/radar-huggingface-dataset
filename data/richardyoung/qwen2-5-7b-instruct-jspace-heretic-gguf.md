# richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-JSpace-heretic-GGUF es la versión cuantizada en formato GGUF de un modelo derivado de Qwen2.5-7B-Instruct, publicado por el investigador Richard J. Young. El modelo base de esta ficha es una variante "abliterated" (con los mecanismos de rechazo eliminados) del instructivo original de Qwen, obtenida mediante ablación de dirección en el espacio jacobiano (J-space) con la herramienta Heretic 2.0. Esta versión GGUF traslada esos pesos a formatos ejecutables con llama.cpp y Ollama.

El modelo conserva la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones) y una ventana de contexto nativa de 32.768 tokens según la especificación del modelo original de Qwen (este dato no se repite en la model card del derivado). Su propósito declarado no es el de asistente general, sino el de servir como objeto de estudio para la investigación sobre eliminación de rechazos, su medición y las defensas frente a ella.

La relevancia de esta ficha reside en que documenta un artefacto de investigación reproducible: el autor publica las métricas de rechazo del modelo en precisión completa (bf16), los detalles del proceso de cuantización (con matriz de importancia para varios formatos) y las sumas SHA-256 de los ficheros. No obstante, las cifras de la model card corresponden al modelo sin cuantizar; los ficheros GGUF aquí publicados no fueron evaluados en el artículo y la cuantización puede alterar el comportamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card del derivado; el modelo original Qwen2.5-7B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicados); IQ3_M, IQ4_XS, Q5_K_M, Q6_K (anunciados como en preparacion); matriz de importancia `imatrix.gguf` |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (convertido desde safetensors bf16 con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso de aproximadamente 7,6 mil millones de parametros, sin mezcla de expertos. Sobre esa base, el autor aplico una ablacion de direccion en el espacio jacobiano (J-space) mediante un fork de Heretic 2.0, que elimina una direccion de activacion asociada al comportamiento de rechazo. La seleccion del trial se realizo con una busqueda de 100 pruebas bajo la regla de "menos rechazos por palabra clave en el conjunto de desarrollo con divergencia KL de primer token <= 0,1".

Los datos de entrenamiento originales de Qwen2.5-7B-Instruct no se detallan en la informacion proporcionada. El proceso de cuantizacion si esta documentado: los safetensors publicados (revision `ceb65e1960b3`, verificados con SHA-256) se convirtieron con `convert_hf_to_gguf.py --outtype bf16` y se cuantizaron con `llama-quantize` sobre CPU (commit `468fde9` de llama.cpp). Los formatos IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre el build Q8_0 con `calibration_datav3` (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del instructivo Qwen2.5-7B-Instruct.
- Razonamiento, codigo y matematicas: capacidades propias del modelo base de Qwen, no revalidadas en esta variante.
- Respuesta a peticiones que el modelo original rechaza: la model card indica que "cumple con muchas peticiones que el original rechaza" (rechazo del 52,6 % frente al 72,1 % en el conjunto de evaluacion).
- Ejecucion local con llama.cpp, Ollama y otros runners compatibles con GGUF.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se documentan otras lenguas en esta variante.
- Tool calling, function calling, agentes y modos especiales (thinking, vision, audio): no disponibles en la informacion proporcionada para esta variante.

## Casos de uso

- Investigacion sobre eliminacion de rechazos: el modelo sirve como sujeto de estudio para medir la eficacia de la ablacion J-space y comparar con los resultados del articulo de Young (rechazo del 52,6 % frente al 72,1 % del original en 972 prompts retenidos con juez WildGuard).
- Evaluacion de defensas frente a abliteration: permite entrenar y probar clasificadores o filtros que detecten respuestas no alineadas en modelos abliterated.
- Estudio del efecto de la cuantizacion en el comportamiento de rechazo: al disponer de Q4_K_M y Q8_0, se puede comparar si la cuantizacion altera la tasa de rechazo, algo que el autor advierte que no fue evaluado en el articulo.
- Reproducibilidad de experimentos: las sumas SHA-256 y los comandos de conversion permiten reconstruir los ficheros y verificar la cadena de custodia de los pesos.
- Despliegue local en entornos de laboratorio: con Q4_K_M (4,7 GB) se puede ejecutar en una estacion de trabajo con GPU de consumo para pruebas de inferencia sin conexion.
- Docencia y divulgacion sobre alineacion: el modelo ilustra de forma tangible la diferencia entre un instructivo alineado y su version abliterated, con metricas publicadas.
- Pruebas de robustez de pipelines de moderacion: integrar el modelo como generador adversarial para validar filtros de contenido en un sistema de moderacion.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo en precision completa (bf16) y provienen del articulo del autor; los ficheros GGUF no fueron evaluados.

| Metrica | Original (Qwen2.5-7B-Instruct) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 72,1 % | 52,6 % (511/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 84 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,022 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estandar, ni para las versiones cuantizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa 4,7 GB en disco y requiere aproximadamente 5-6 GB de VRAM o memoria unificada con overhead; Q8_0 ocupa 8,1 GB y requiere aproximadamente 9-10 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M (RTX 3060 Ti, RTX 4060, RTX 4070); 12 GB o mas para Q8_0 (RTX 4070 Ti, RTX 4080). Para mayor throughput, A100 o H100 con vLLM no aplican directamente porque el artefacto es GGUF; en ese caso se usaria llama.cpp con backend CUDA o el modelo safetensors original.
- Cabe en GPU de consumo: si, tanto Q4_K_M como Q8_0 en tarjetas de 8-12 GB; Q4_K_M tambien puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: Ollama (`ollama run richardyoung/qwen2.5-7b-instruct-jspace-heretic`), llama.cpp (`llama-cli -hf ...`), y cualquier runner compatible con GGUF (LM Studio, KoboldCpp, text-generation-webui). vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que usar los safetensors del modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-JSpace-heretic-GGUF (esta ficha) | 7,6 B | no disponible (original: 32.768) | 52,6 % (bf16) | apache-2.0 | GGUF |
| Qwen2.5-7B-Instruct (original) | 7,6 B | 32.768 | 72,1 % | apache-2.0 | safetensors, GGUF |
| richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic (bf16) | 7,6 B | no disponible | 52,6 % | apache-2.0 | safetensors |

No se dispone de datos de otros modelos abliterated comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para eliminar rechazos: cumple con muchas peticiones que el original rechaza, lo que lo hace inadecuado como asistente de proposito general y potencialmente peligroso si se despliega sin moderacion externa.
- Las metricas de rechazo publicadas corresponden al modelo bf16; los ficheros GGUF no fueron evaluados y la cuantizacion puede alterar el comportamiento de rechazo, como advierte el propio autor.
- La model card solo declara soporte de ingles; no se documenta comportamiento multilingue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es inherente a los modelos de 7 B y no se han publicado evaluaciones de veracidad para esta variante.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen2.5-7B-Instruct, no evaluados aqui.
- Restricciones de licencia: apache-2.0, la misma que el modelo fuente; el autor remite a la model card del modelo fuente para las restricciones de uso. El uso comercial esta permitido por la licencia, pero el autor declara que el proposito previsto es la investigacion sobre eliminacion de rechazos y que los usuarios son responsables del uso licito.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y algunas cuantizaciones (IQ3_M, IQ4_XS, Q5_K_M, Q6_K) estan anunciadas pero no publicadas.
- La cita del articulo asociado aun no tiene enlace de arXiv, por lo que la referencia bibliografica esta incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Articulo de referencia (Young, 2026): enlace de arXiv pendiente de publicacion segun la model card.
