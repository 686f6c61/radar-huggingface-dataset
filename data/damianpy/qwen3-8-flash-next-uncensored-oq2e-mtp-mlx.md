# damianpy/Qwen3.8-Flash-Next-Uncensored-oQ2e-mtp-MLX

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ2e-mtp-MLX es una cuantizacion de 2 bits en formato MLX del modelo Qwen3.8-Flash-Next-Uncensored, publicada por el usuario damianpy. El modelo base, desarrollado por ddark-il, es una variante "uncensored" (sin los filtros de alineamiento habituales) de la familia Qwen3.8 Flash Next. Esta build concreta esta pensada para ejecutarse en un unico equipo Apple Silicon con 128 GB de memoria unificada, ocupando 72 GB en disco.

La relevancia de esta ficha radica en su caracter practico: demuestra que un modelo de aproximadamente 180.000 millones de parametros puede desplegarse en hardware de consumo de gama alta (un MacBook Pro con chip M5 Max) mediante cuantizacion agresiva a 2 bits, manteniendo la cabeza MTP (multi-token prediction) para decodificacion especulativa y con extension de contexto YaRN x2 configurada para alcanzar 524.288 tokens. Es, por tanto, un ejemplo de inferencia local de gran escala en plataforma Apple.

No obstante, conviene subrayar que se trata de un modelo derivado de un autor independiente, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y sin model card detallada sobre datos de entrenamiento o composicion del dataset. La informacion disponible se limita a los metadatos de Hugging Face y a la model card del autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8 Flash Next); detalles internos no disponibles |
| Parametros totales | 179.999.981.459 (aprox. 180.000 millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | 524.288 tokens (YaRN x2 configurado en `config.json`) |
| Tipos de cuantizacion | 2 bits (oQ2e, oMLX `quantize_oq_streaming(level=2, enhanced=True, preserve_mtp=True)`); KV cache 4-bit affine4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); 72 GB en disco; repo de 77,5 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.8 Flash Next. El dato objetivo es que se trata de un transformer de aproximadamente 180.000 millones de parametros, del que no se confirma si emplea mezcla de expertos (MoE) ni, en su caso, cuantos parametros activos tendria. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

Lo que si es documentable es el proceso de cuantizacion aplicado por damianpy: se parte de una build MLX de 4,8 bits por peso, se expande primero a bf16 y despues se cuantiza a 2 bits mediante la herramienta oMLX 0.8.2 con la funcion `quantize_oq_streaming(level=2, enhanced=True, preserve_mtp=True)`. Esta llamada preserva explicitamente la cabeza MTP, lo que permite mantener decodificacion especulativa (generacion de varios tokens candidatos por paso, verificados en paralelo) incluso tras la cuantizacion. Ademas, el `config.json` incluye la configuracion YaRN x2, que escala el contexto efectivo hasta 524.288 tokens. La variante "uncensored" del modelo base implica la ausencia de los filtros de rechazo y alineamiento de seguridad tipicos de los modelos comerciales, sin que se detallen los metodos de entrenamiento empleados para ello.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.8 Flash Next (sin benchmarks publicados que lo cuantifiquen).
- Modo "uncensored": el modelo no incorpora los mecanismos de rechazo o filtrado de contenido sensibles del modelo original, lo que amplia el rango de respuestas pero elimina las salvaguardas de seguridad.
- Decodificacion especulativa mediante la cabeza MTP preservada, que acelera la generacion en hardware Apple Silicon.
- Contexto largo: hasta 524.288 tokens gracias a la configuracion YaRN x2 incluida en `config.json`.
- Ejecucion nativa en Apple Silicon a traves de la libreria MLX y del runtime oMLX 0.8.2.
- Soporte de tool calling, function calling, capacidades de agente, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia local de gran escala en un unico Mac: el modelo esta disenado para ejecutarse en un Apple Silicon con 128 GB de memoria unificada, lo que permite disponer de un modelo de 180.000 millones de parametros en un portatil de gama alta sin infraestructura de servidor.
- Procesamiento de documentos extensos: con 524.288 tokens de contexto, se puede cargar un corpus completo (libros, expedientes, bases de codigo) en una sola ventana y realizar preguntas o resumenes sobre el conjunto sin fragmentacion.
- Investigacion sobre alineamiento y seguridad: al ser una variante uncensored, resulta util para estudiar el comportamiento de modelos sin filtros, comparar respuestas frente a versiones alineadas y analizar sesgos o riesgos de forma controlada.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido que los modelos alineados suelen rechazar por politicas de contenido, en entornos donde el usuario asume la responsabilidad del material generado.
- Desarrollo y pruebas de pipelines de inferencia: sirve como banco de pruebas para medir throughput y latencia de decodificacion especulativa con MTP y KV cache de 4 bits en MLX, tal como documenta el autor en su repositorio de mediciones.
- Experimentacion con cuantizacion extrema: util para investigadores que quieran evaluar la degradacion de calidad de un modelo de 180.000 millones de parametros al pasar de 4,8 bits a 2 bits por peso, con datos de velocidad y precision medidos en hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el autor documenta velocidad y precision medidas en un MacBook Pro M5 Max de 128 GB en su repositorio de GitHub, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- Memoria: el modelo ocupa 72 GB en disco y esta pensado para un equipo con 128 GB de memoria unificada; el autor lo probo en un MacBook Pro M5 Max de 128 GB.
- GPU: exclusivamente Apple Silicon (MLX). No es compatible de forma nativa con CUDA; no se proporcionan datos para A100, H100 ni RTX 4090.
- GPU de consumo: cabe en Apple Silicon de gama alta con 128 GB (M5 Max y configuraciones equivalentes); no cabe en GPU de consumo convencionales de 24 GB o menos.
- Despliegue: runtime oMLX 0.8.2, con KV cache en 4 bits (affine4) y MTP activado. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en cifras; la model card remite al repositorio del autor para las mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-oQ2e-mtp-MLX | ~180.000 M | 524.288 (YaRN x2) | MLX safetensors, 2 bits | Apache 2.0 | Hugging Face, 0 descargas |
| ddark-il/Qwen3.8-Flash-Next-Uncensored (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Build MLX de 4,8 bpw del mismo modelo | ~180.000 M | no disponible | MLX safetensors, 4,8 bpw | Apache 2.0 (presumible) | Referenciada por el autor |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": carece de los filtros de seguridad del modelo original, por lo que puede generar contenido danino, ilegal o sesgado sin restricciones; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Cuantizacion a 2 bits: la reduccion agresiva de precision puede degradar la calidad de las respuestas y la coherencia en razonamientos largos; no hay benchmarks publicados que cuantifiquen esa perdida.
- Sin datos de entrenamiento ni de evaluacion: se desconoce la composicion del dataset, los idiomas soportados y el rendimiento real en tareas estandar.
- Riesgo de alucinacion: no cuantificado, pero inherente a los modelos de lenguaje y potencialmente amplificado por la cuantizacion extrema.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por una variante sin alineamiento.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; se trata de una publicacion reciente y sin validacion por parte de la comunidad.
- Dependencia de hardware especifico: solo funciona en Apple Silicon con MLX y requiere 128 GB de memoria unificada; no es portable a infraestructura CUDA convencional.
- Fechas de publicacion futuras en los metadatos (noviembre de 2026), lo que impide contrastar la trazabilidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/damianpy/Qwen3.8-Flash-Next-Uncensored-oQ2e-mtp-MLX
- Modelo base: https://huggingface.co/ddark-il/Qwen3.8-Flash-Next-Uncensored
- Repositorio de mediciones y scripts del autor: https://github.com/damianpy-BIM/tested-on-bim-hardware/tree/main/qwen3.8-flash-next-uncensored-macbook-strata-vs-omlx
- BIM Computing: https://www.bim-computing.com
