# openamer-max/openamer-max-pro

## Resumen

OpenAmer-Max-Pro es un ajuste fino mediante QLoRA del modelo Mistral-Small-24B-Instruct-2501, publicado por el usuario openamer-max como la quinta y mayor etapa de la familia OpenAmer-Max. El modelo se distribuye en formato GGUF cuantizado a Q4_K_M (13,35 GB) y está pensado para inferencia local en equipos de escritorio, sin cuenta ni dependencia de la nube. Cubre principalmente alemán y bosnio/croata/serbio, con inglés funcional pero no prioritario.

El interés técnico del modelo no reside en su rendimiento bruto, sino en la honestidad de su documentación: el autor declara explícitamente que esta etapa de 24B obtiene resultados inferiores a la etapa Desktop de 14,7B en su propio banco de pruebas (43/45 frente a 44/45), y publica el detalle completo de los dos fallos detectados, así como seis errores de medición corregidos durante la evaluación. Es, por tanto, un caso útil para estudiar cómo se documenta un ajuste fino pequeño con criterios de evaluación reproducibles.

La relevancia actual es doble: por un lado, demuestra que escalar parámetros no garantiza mejor calidad en tareas específicas de dominio; por otro, ofrece un ejemplo de model card centrada en la trazabilidad de las métricas y en las limitaciones reales del modelo, algo poco habitual en publicaciones de ajustes finos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral-Small-24B-Instruct-2501); no se detallan variantes en la informacion disponible |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | 8.192 tokens (valor configurado en el Modelfile de referencia); no se confirma la ventana nativa del modelo base en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (13,35 GB) como unica cuantizacion publicada en la model card; el repositorio GGUF puede contener otras, no confirmado |
| Idiomas soportados | de, bs, hr, sr, en (aleman y bosnio/croata/serbio entrenados de forma efectiva; ingles funcional) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); repo de 14,3 GB; el modelo base se distribuye en safetensors, pero este ajuste se publica como GGUF |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-24B-Instruct-2501, un transformer denso de 24B parametros, y se ajusta mediante QLoRA en 4 bits con rango r=32 y alpha=64. El entrenamiento se ejecuto en HF Jobs sobre una GPU L40S de 48 GB, con 170 pasos y una duracion total de 37 minutos; el pico de VRAM durante el entrenamiento fue de 19,46 GB. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque por el contenido de la evaluacion se deduce que el ajuste se orienta a conocimiento de producto (OpenAmer) y a respuestas factuales breves en aleman y bosnio/croata/serbio.

La innovacion tecnica destacable no esta en la arquitectura, sino en la metodologia de evaluacion: un banco de pruebas congelado de 45 casos distribuidos en once categorias (hechos, parafrasis, preguntas de parada, bosnio, bosnio con parada, texto largo, respuesta corta y casos limite), con evaluacion mediante grupos de palabras obligatorias y prohibidas. El autor documenta seis errores del propio evaluador (lectura caracter a caracter de listas de prohibicion, comparacion byte a byte con normalizacion CRLF, conteo de `\r` como caracter de control, patrones demasiado estrictos, sensibilidad a mayusculas y escapes CSS incorrectos) y los corrige, lo que refuerza la credibilidad de las cifras publicadas.

## Capacidades

- Generacion de texto conversacional en aleman y bosnio/croata/serbio, con ingles funcional.
- Respuestas factuales breves y precisas sobre el dominio OpenAmer, con entrenamiento orientado a temperatura 0.
- Comprension de instrucciones de formato simples, aunque con fallos documentados (ignoro una restriccion de "una sola palabra" en uno de los 45 casos).
- Manejo de contexto de hasta 8.192 tokens segun la configuracion de referencia.
- Capacidad limitada de uso de herramientas: supero un smoke test de manipulacion de ficheros, pero no ejecuto una llamada MCP en el harness PLE.
- No se documentan capacidades de vision, audio, modo thinking ni function calling estructurado.
- No se documenta soporte de agentes multi-paso; el propio autor indica que el modelo es demasiado pequeno para trabajo de agente.

## Casos de uso

- Asistente local de atencion al cliente en aleman: el modelo responde consultas factuales sobre un producto concreto con temperatura 0, sin telemetria ni conexion a la nube, lo que encaja en escenarios con requisitos de privacidad.
- Soporte en bosnio/croata/serbio para mercados regionales: es uno de los pocos ajustes finos publicados que entrena de forma efectiva estas lenguas sobre una base de 24B, util para empresas con presencia en los Balcanes occidentales.
- Despliegue en puesto de trabajo sin GPU dedicada de gama alta: con Q4_K_M (13,35 GB) cabe en equipos con 16 GB de VRAM libre mas RAM del sistema, segun las indicaciones del autor.
- Base para evaluacion interna de ajustes finos: el banco de pruebas congelado de 45 casos y la documentacion de errores del evaluador sirven como plantilla para validar otros ajustes de dominio.
- Generacion de respuestas breves y controladas en documentacion de producto: el entrenamiento a temperatura 0 y con repeat_penalty 1.0 produce salidas deterministicas adecuadas para FAQ o bases de conocimiento.
- Prototipado de asistentes multilingues en entornos sin cloud: permite iterar sobre un asistente conversacional en aleman y lenguas eslavas del sur sin coste de API ni dependencia de proveedor.
- Filtrado o clasificacion de consultas de soporte en aleman: su comportamiento factual y conciso puede aprovecharse para tareas de respuesta cerrada, siempre con validacion humana por los fallos de formato documentados.

## Benchmarks y rendimiento

Los unicos datos publicados son los del banco de pruebas propio del autor (Prüfstand v2, 45 casos), no benchmarks estandar como MMLU, HumanEval o GSM8K.

| Modelo o etapa | Parametros | Tamano | Prüfstand v2 (45 casos) |
|---|---|---|---|
| OpenAmer-Max Desktop | 14,70 B | 8,4 GB | 44/45 (97,8 %) |
| OpenAmer-Max Pro | 24,00 B | 13,4 GB | 43/45 (95,6 %) |
| OpenAmer-Max Phone | 3,09 B | 2,5 GB | 43/45 (95,6 %) |
| OpenAmer-Max Tab | 7,62 B | 4,4 GB | 42/45 (93,3 %) |
| OpenAmer-Max Watch | 0,60 B | 639 MB | 37/45 (82,2 %) |
| Base Qwen2.5-14B sin entrenar | 14,70 B | — | 22/45 (48,9 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor menciona que el mejor modelo abierto del mundo alcanza 26 sobre 100 en un benchmark publico de ingenieria, sin nombrarlo, y situa a este modelo claramente por debajo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,35 GB para Q4_K_M, mas overhead de contexto; el autor indica que funciona con 16 GB de memoria libre mas RAM del sistema.
- GPU recomendadas: L40S 48 GB para entrenamiento (pico de 19,46 GB); para inferencia, cualquier GPU con 16 GB o mas de VRAM, como RTX 4080, RTX 4090, A10, L4 o A100.
- Cabe en GPU de consumo: si, en RTX 4080/4090 (16-24 GB) y en modelos con 16 GB justos si se reduce el contexto; no cabe en GPUs de 8-12 GB sin cuantizaciones mas agresivas, no documentadas.
- Opciones de despliegue: llama.cpp, Ollama (`ollama pull hf.co/openamer-max/openamer-max-pro:Q4_K_M`) y entornos compatibles con endpoints; no se documenta soporte verificado de vLLM o TGI para este GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Configuracion de inferencia recomendada por el autor: `temperature 0`, `repeat_penalty 1.0`, `num_ctx 8192`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAmer-Max-Pro | 23,57 B | 8.192 (config.) | 43/45 en Prüfstand v2 propio | Apache-2.0 | GGUF en HF |
| OpenAmer-Max Desktop (misma familia) | 14,70 B | no disponible | 44/45 en Prüststand v2 propio | Apache-2.0 (segun familia) | GGUF en HF |
| Mistral-Small-24B-Instruct-2501 (base) | 24 B | no disponible en esta ficha | no evaluado en el banco del autor | Apache-2.0 | safetensors y GGUF en HF |
| Qwen2.5-14B sin entrenar (referencia del autor) | 14,70 B | no disponible | 22/45 en el mismo banco | no disponible en esta ficha | no disponible |

La comparacion con benchmarks estandar frente a otros modelos de 24B no esta disponible en la informacion proporcionada. La comparacion mas relevante es interna: dentro de la familia, Pro no supera a Desktop pese a tener 6B mas de parametros y 5 GB mas de peso.

## Limitaciones y advertencias

- No es un agente: fallo la ejecucion de una llamada MCP en el harness PLE; el autor lo desaconseja para trabajo de agente.
- El ingles no es su punto fuerte; el entrenamiento se centra en aleman y bosnio/croata/serbio.
- El banco de pruebas mide conocimiento de producto OpenAmer, no dominio tecnico general; los resultados no son extrapolables a tareas de ingenieria.
- Fallo documentado de seguimiento de instrucciones: ignoro la restriccion "una sola palabra" en una de las 45 preguntas.
- Sensibilidad a `repeat_penalty`: con 1.1 el modelo invirtio una negacion; el autor exige 1.0 en todos los Modelfiles de la familia.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el autor afirma que los dos fallos detectados no son alucinaciones, pero no aporta una metrica especifica de factualidad fuera de su banco.
- Licencia Apache-2.0, por lo que el uso comercial esta permitido segun los terminos de dicha licencia; no se documentan restricciones adicionales del autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion por terceros.
- El repositorio pesa 14,3 GB y solo se distribuye en GGUF; no se ofrece la version en safetensors del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/openamer-max/openamer-max-pro
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Repositorio de la familia OpenAmer-Max: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
- Enlace de apoyo del autor (PayPal): https://www.paypal.com/qrcodes/managed/bfb5b6b5-c04c-4836-af60-987dff8cff61
