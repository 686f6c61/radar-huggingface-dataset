# gasolsun/Math_Qwen3-1.7B_Qwen3-4B-Non-Thinking-RL-Math-Step500

## Resumen

Math_Qwen3-1.7B_Qwen3-4B-Non-Thinking-RL-Math-Step500 es un modelo de lenguaje especializado en matematicas, desarrollado por el usuario gasolsun, que consiste en un destilado del modelo Qwen3-1.7B de Alibaba sobre el modelo profesor Keven16/Qwen3-4B-Non-Thinking-RL-Math-Step500. El objetivo es trasladar a un modelo pequeno (2.031.739.904 parametros, unos 2,03 mil millones) las capacidades de resolucion de problemas matematicos de un modelo mayor, reduciendo el coste de inferencia y de despliegue. La relevancia actual reside en su metodo de entrenamiento: no se han utilizado problemas reales ni respuestas de referencia, sino un banco de preguntas sinteticas generado por un generador de preguntas entrenado con RL.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El entrenamiento se ha realizado integramente en modo "non-thinking" (sin cadena de razonamiento explicita activada por el chat template), y asi debe invocarse en inferencia pasando `enable_thinking=False`.

La innovacion principal es el metodo "Ask to Distill", una variante de destilacion on-policy (OPD) en la que el profesor y el alumno se comparan token a token sobre las propias soluciones del alumno. El modelo esta publicado con 0 descargas y 0 likes en el momento de redactar esta ficha, y su model card esta en ingles. La longitud de contexto no se especifica en la informacion proporcionada, aunque el modelo base Qwen3-1.7B declara 32.768 tokens nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), no MoE |
| Parametros totales | 2.031.739.904 (aprox. 2,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-1.7B declara 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible (repo en safetensors, presumiblemente bf16); no se publican GGUF ni cuantizaciones de terceros |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Modelo profesor | Keven16/Qwen3-4B-Non-Thinking-RL-Math-Step500 |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 4,1 GB |
| Modo de razonamiento | Non-thinking (thinking desactivado) |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B: un transformer denso, decoder-only, con atencion agrupada (GQA) y tokenizador propio del modelo base. El modelo no introduce cambios estructurales respecto a Qwen3, sino que se trata de un ajuste fino completo del mismo.

El entrenamiento sigue el metodo "Ask to Distill". Primero se entrena con RL un *generador de preguntas* cuyo objetivo es producir enunciados que expongan desacuerdo a nivel de token, acotado y aprendible, entre el profesor (Qwen3-4B-Non-Thinking-RL-Math-Step500) y el alumno (Qwen3-1.7B) sobre las soluciones del propio alumno, es decir, la misma senal de la que aprende la destilacion on-policy. A continuacion se muestrea un banco de preguntas del generador, se filtra y se deduplica, y finalmente se entrena al alumno con destilacion on-policy (OPD) sobre ese banco. No se emplean preguntas reales de entrenamiento ni respuestas de referencia. El objetivo de OPD es una KL inversa por token sobre los 16 tokens mas probables del alumno, ponderada por las probabilidades del alumno renormalizadas, sin recompensa por resultado final. La receta de OPD usa learning rate constante de 1e-6, optimizador AdamW, temperatura de rollout 1.0, pesos maestros en fp32 y computo en bf16.

## Capacidades

- Generacion de texto conversacional orientada a resolucion de problemas matematicos, en modo non-thinking.
- Razonamiento matematico paso a paso: el modelo esta entrenado para responder con desarrollo y una linea final del tipo `Answer: $Answer` y respuesta en `\boxed{}`.
- Especializacion en problemas de competicion y nivel avanzado: el autor evalua en AIME24, AIME25, AIME26, AMC23, BRUMO25 y MATH500.
- Soporte de chat template de Qwen3 con el parametro `enable_thinking`, que debe fijarse a `False`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modalidades adicionales: no soportadas (pipeline text-generation).
- Capacidad especial: el modelo esta explicitamente restringido a modo non-thinking; no se ha entrenado ni evaluado con cadena de pensamiento activada.

## Casos de uso

- Resolucion automatica de problemas matematicos de nivel secundaria y competicion: el modelo puede recibir enunciados y devolver un desarrollo paso a paso con la respuesta final delimitada, adecuado para generar soluciones verificables en pipelines de evaluacion.
- Generacion de datos sinteticos de matematicas: dado su origen (banco de preguntas sintetico y destilacion), puede emplearse para producir variantes de problemas y soluciones que alimenten el entrenamiento de modelos mayores o para aumentar datasets existentes.
- Tutorizacion matematica en aplicaciones educativas: con 2,03 B de parametros puede desplegarse en infraestructura modesta para responder dudas y explicar procedimientos, siempre que el caso de uso no requiera modo thinking.
- Evaluacion comparativa de tecnicas de destilacion: sirve como referencia reproducible para investigar destilacion on-policy, dado que publica la receta completa (learning rate, optimizador, objetivo y banco de preguntas asociado).
- Prototipado rapido en local: al pesar aproximadamente 4,1 GB en bf16, puede ejecutarse en una GPU de consumo para pruebas de razonamiento matematico antes de escalar a modelos mayores.
- Backend de verificacion en cascada: puede actuar como primer modelo en un sistema de dos etapas que resuelva problemas sencillos y derive los dificiles a un modelo mayor, reduciendo coste medio por consulta.
- Investigacion sobre sensibilidad a la temperatura: la model card documenta el regimen de muestreo usado (temperatura 0,7, top-p 0,95), lo que facilita reproducir y estudiar el efecto del muestreo en este tipo de modelos destilados.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Metodologia: avg@16 (en MATH500, avg@4), temperatura 0,7, top-p 0,95, maximo 31.744 tokens nuevos y thinking desactivado.

| Benchmark | Resultado |
|---|---|
| AIME24 | 34,8 |
| AIME25 | 26,0 |
| AIME26 | 26,5 |
| AMC23 | 71,9 |
| BRUMO25 | 35,4 |
| MATH500 | 82,4 |
| Media de los seis (avg6) | 46,16 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible, ni verificacion independiente de estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,1 GB solo de pesos, mas overhead de activaciones; en la practica se recomienda un minimo de 6 GB de VRAM para contextos cortos. Estimacion propia, no confirmada por el autor.
- Cache KV: con 31.744 tokens de generacion (regimen usado en la evaluacion) el coste de cache KV crece de forma apreciable y puede superar los pesos del modelo en fp16; se recomienda cuantizar la cache KV o limitar `max_new_tokens` en produccion. Estimacion, no disponible en la model card.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para contextos moderados; A100 o H100 no son necesarias para un modelo de 2,03 B.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en bf16/fp16; tambien es viable en CPU con cuantizacion, aunque esta no se distribuye oficialmente.
- Opciones de despliegue: transformers (soporte nativo, confirmado por la libreria declarada), text-generation-inference (el repositorio esta marcado como `endpoints_compatible`), vLLM (compatible con arquitecturas Qwen3, aunque no confirmado por el autor para este checkpoint), llama.cpp y Ollama (requieren conversion a GGUF, no publicada).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en matematicas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Math_Qwen3-1.7B_Qwen3-4B-Non-Thinking-RL-Math-Step500 | 2,03 B | No disponible (base: 32.768) | avg6 46,16; MATH500 82,4; AIME24 34,8 | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3-1.7B (modelo base) | 2,03 B | 32.768 nativo | No disponible | Apache 2.0 | HuggingFace |
| Keven16/Qwen3-4B-Non-Thinking-RL-Math-Step500 (profesor) | Aprox. 4 B | No disponible | No disponible | No disponible | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | No disponible | No disponible | MIT (segun su propia publicacion) | HuggingFace |

Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa rigurosa; la unica cifra verificable aqui es la del modelo descrito, y procede del propio autor.

## Limitaciones y advertencias

- Especializacion estrecha: el entrenamiento se centra en matematicas; no hay evidencia de rendimiento en tareas generales de lenguaje, codigo o conocimiento del mundo, y es probable que degrade capacidades generales respecto al modelo base.
- Modo unico: el modelo solo funciona correctamente en modo non-thinking; usar el chat template con thinking activado queda fuera del regimen entrenado y puede producir salidas degeneradas o de baja calidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al ser un destilado de modelos Qwen, hereda los sesgos de su linaje, no documentados aqui.
- Riesgo de alucinacion: relevante en cualquier modelo de este tamano; en matematicas puede producir desarrollos plausibles con resultados incorrectos. No se han publicado tasas de error ni analisis de calibracion.
- Limitaciones de idioma: el modelo card no declara idiomas soportados; el prompt de evaluacion esta en ingles, por lo que el rendimiento en castellano no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya. No hay clausulas adicionales conocidas. Conviene verificar la licencia del modelo profesor, que no se especifica en la informacion disponible.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; los resultados son autocertificados por el autor y no han sido reproducidos de forma independiente.
- Metodologia de evaluacion exigente pero especifica: las cifras usan avg@16 con 31.744 tokens de generacion y thinking desactivado; comparaciones con otros modelos requieren replicar exactamente esa configuracion.
- Datos de contexto y cuantizacion ausentes: no se publica la longitud de contexto efectiva del checkpoint ni versiones cuantizadas, lo que complica el despliegue en entornos con restricciones de memoria.
- Procedencia de los datos de entrenamiento: al ser un banco de preguntas sintetico generado por RL, no hay garantia de cobertura tematica equilibrada ni de ausencia de sesgos en la distribucion de problemas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gasolsun/Math_Qwen3-1.7B_Qwen3-4B-Non-Thinking-RL-Math-Step500
- Dataset (banco de preguntas): https://huggingface.co/datasets/gasolsun/Math_Qwen3-1.7B_Qwen3-4B-Non-Thinking-RL-Math-Step500
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Keven16/Qwen3-4B-Non-Thinking-RL-Math-Step500

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su metodo o su linaje. Los resultados obtenidos no guardaban relacion con el contenido de esta ficha y se han descartado en su totalidad. No se dispone de paper, repositorio de codigo ni demo publicados por el autor en la informacion proporcionada.
