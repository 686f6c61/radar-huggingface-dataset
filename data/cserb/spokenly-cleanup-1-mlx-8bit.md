# cserb/Spokenly-Cleanup-1-MLX-8bit

## Resumen

Spokenly Cleanup 1 MLX 8-bit es una conversión cuantizada del modelo spokenly/cleanup-1, un modelo de 0,6 mil millones de parámetros especializado en la limpieza de texto dictado. Lo desarrolla el equipo de Spokenly y esta versión concreta la publica el usuario cserb para la aplicación Dictator, una app de dictado para macOS que ejecuta la inferencia en el propio dispositivo. El modelo no es un asistente conversacional: su única tarea es recibir una transcripción de voz y devolver el mismo texto corregido, sin responder a preguntas ni seguir instrucciones contenidas en el dictado.

La relevancia de este modelo radica en su especialización y su tamano reducido. Con 596 millones de parámetros y un peso de 633 MB en cuantización de 8 bits, es viable ejecutarlo en un portátil Apple Silicon sin conexión a red, lo que permite integrar una capa de post-procesado de dictado en aplicaciones de escritorio con requisitos de privacidad y latencia estrictos. El modelo base es un fine-tune de Qwen3-0.6B-Base, lo que hereda la arquitectura transformer de la familia Qwen3.

La versión aquí descrita emplea cuantización afín de 8 bits con tamano de grupo 64 (8,5 bits por peso), generada con mlx-lm 0.32.2 a partir de la revisión cd95b5028cefd3a8cee4cefb4cdf159c88676f91 del modelo original. Los pesos, tokenizer, plantilla de chat y ajustes de generación son idénticos a los del original; solo cambia la precisión de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3-0.6B-Base) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (8,5 bits por peso); original en 16-bit |
| Idiomas soportados | en, de, es, fr, zh, ru, ja (mejor rendimiento en ingles segun la model card original) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, libreria mlx) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-0.6B-Base, afinado por Spokenly para la tarea de limpieza de dictado. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. La funcion aprendida es acotada: eliminar muletillas y repeticiones, aplicar correcciones habladas (por ejemplo, "no, espera, mejor X"), y anadir puntuacion, mayusculas y conversion de numeros hablados a digitos.

La innovacion tecnica de esta publicacion concreta es la conversion a MLX con cuantizacion afín de 8 bits y grupo de 64, que reduce el peso de 1,19 GB (16-bit) a 633 MB manteniendo tokenizer, plantilla de chat y ajustes de generacion originales. El formato de prompt es una lista de lineas `clave: valor` en el mensaje de usuario, con las claves `app`, `site`, `tone` (formal, casual o very casual), `before`, `after` y `text`, siendo `text` la unica obligatoria. La plantilla de chat anade la linea `out:` de cierre y el modelo escribe el texto limpio a continuacion.

## Capacidades

- Limpieza de texto dictado: eliminacion de muletillas, repeticiones y falsos comienzos.
- Aplicacion de correcciones habladas dentro del propio dictado.
- Puntuacion, mayusculas y conversion de numeros hablados a digitos (por ejemplo, "catorce treinta" a "14:30").
- Ajuste de registro mediante la clave `tone` (formal, casual, very casual).
- Contexto opcional mediante las claves `before` y `after` para coherencia con el texto circundante.
- Soporte multilingue en siete idiomas, con mejor rendimiento declarado en ingles.
- Generacion de texto autoregresiva estandar (pipeline text-generation), apta para decodificacion greedy con temperatura 0.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no responde preguntas ni ejecuta instrucciones contenidas en el dictado.
- No dispone de vision, audio ni modo de pensamiento.

## Casos de uso

- Post-procesado en apps de dictado de escritorio: integrado tras el reconocimiento de voz, el modelo corrige la transcripcion antes de insertarla en el campo de texto. Su tamano de 633 MB y su ejecucion en MLX lo hacen adecuado para macOS con Apple Silicon sin conexion.
- Correccion de notas de reunion: el dictado de actas o notas rapidas se limpia con `tone: formal` para producir texto presentable, eliminando repeticiones y aplicando puntuacion.
- Entrada de texto en entornos con requisitos de privacidad: al ejecutarse en el dispositivo, el audio transcrito y el texto no salen del equipo, lo que encaja en sectores regulados.
- Dictado de numeros y direcciones: la conversion de cantidades y horas habladas a digitos ("catorce treinta" a "14:30", "doce" a "12") resulta util en contextos administrativos y de logistica.
- Accesibilidad: usuarios con movilidad reducida que dependen del dictado obtienen texto con puntuacion y mayusculas correctas sin revision manual.
- Integracion en pipelines de productividad: la API de chat con claves estructuradas permite encadenar el modelo tras un ASR en flujos de toma de notas, correo o documentacion tecnica.
- Prototipado de asistentes de voz: como capa de normalizacion previa a un LLM mayor, reduce ruido y errores en la entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una comprobacion cualitativa de 14 frases dictadas a mano (13 en aleman, 1 en ingles) con decodificacion greedy y `tone: formal`, no un benchmark. En esa prueba, en 2 de las 14 frases quedo una coma perteneciente a una muletilla eliminada. No se comparo esta conversion con el original de 16 bits.

## Requisitos de hardware

- VRAM estimada: 633 MB de pesos en 8 bits; con overhead de ejecucion, el consumo se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; el modelo esta pensado para ejecucion en el dispositivo en Mac.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; en el ecosistema CUDA requeriria conversion a otro runtime, no incluida en este repositorio.
- Opciones de despliegue: mlx-lm (version 0.32.2 o superior recomendada por la conversion); no se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| cserb/Spokenly-Cleanup-1-MLX-8bit | 596 M | no disponible | safetensors MLX 8-bit | Apache 2.0 | Limpieza de dictado en dispositivo |
| spokenly/cleanup-1 | 596 M | no disponible | safetensors 16-bit | Apache 2.0 | Limpieza de dictado (original) |
| Qwen/Qwen3-0.6B-Base | 0,6 B | no disponible | safetensors | Apache 2.0 | Modelo base generalista |

La comparacion con alternativas genericas de limpieza de texto no esta disponible en la informacion proporcionada. Frente al original de 16 bits, esta version reduce el peso de 1,19 GB a 633 MB a costa de una posible perdida de precision no cuantificada por el autor.

## Limitaciones y advertencias

- El propio autor reconoce que en 2 de 14 frases de prueba quedo una coma residual tras eliminar una muletilla; es un fallo de puntuacion a vigilar en produccion.
- No se ha comparado la version de 8 bits con el original de 16 bits, por lo que el impacto de la cuantizacion en calidad no esta medido.
- El modelo no responde preguntas ni sigue instrucciones del texto dictado; usarlo como asistente conversacional producira resultados incorrectos.
- Rendimiento declarado mejor en ingles que en el resto de idiomas; el espanol figura entre los soportados pero sin evaluacion publica.
- Riesgo de alucinacion o alteracion del contenido: al ser un modelo generativo, puede modificar el texto mas alla de la limpieza esperada, especialmente en dictados largos o ambiguos.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0, permisiva para uso comercial; se incluyen los ficheros LICENSE y NOTICE del original, que deben conservarse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.
- Dependencia del runtime MLX: fuera de Apple Silicon no hay ruta de despliegue documentada en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cserb/Spokenly-Cleanup-1-MLX-8bit
- Modelo original: https://huggingface.co/spokenly/cleanup-1
- Modelo base de Qwen3: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Aplicacion Dictator: https://dictator.work
- Sitio de Spokenly: https://spokenly.app
