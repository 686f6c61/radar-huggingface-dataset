# GhaythMahadin/gemma-4-26B-A4B-it-GGUF

## Resumen

Gemma 4 26B-A4B-it es un modelo de lenguaje conversacional de gran tamano desarrollado por Google DeepMind, distribuido originalmente por Unsloth en formato GGUF y reempaquetado en este repositorio por GhaythMahadin como espejo de respaldo para el motor local del proyecto «Marsad» (مرصد التحقق). El modelo sigue la estela de la familia Gemma y se presenta como una variante con arquitectura de mezcla de expertos (MoE), segun indica la nomenclatura "A4B" (aproximadamente 4 mil millones de parametros activos) sobre un total de 25.233.142.046 parametros reales declarados en los safetensors del modelo base.

Este repositorio concreto no contiene pesos en safetensors, sino una unica cuantizacion GGUF en Q4_K_M (aproximadamente 16,9 GB de repositorio) pensada para inferencia con llama.cpp. La relevancia actual radica en que permite ejecutar un modelo de ~25B parametros totales con solo ~4B activos por token en hardware de consumo, manteniendo el formato conversacional (sufijo `-it`) y una licencia Apache-2.0 con los terminos de uso de Gemma de Google.

No se dispone de informacion publicada sobre la composicion del dataset, el numero de tokens de entrenamiento ni los resultados de benchmarks en la informacion proporcionada; esta ficha se limita a los datos verificables del repositorio y del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun nomenclatura "A4B"; detalles internos no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura "A4B"; no confirmado en la informacion) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo incluido) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (con terminos de uso de Gemma de Google) |
| Formato de pesos | GGUF (`gemma-4-26B-A4B-it-UD-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo emplea una arquitectura de mezcla de expertos, deducida del sufijo "A4B" en el nombre (parametros activos frente a totales). El repositorio es una cuantizacion Q4_K_M del modelo `unsloth/gemma-4-26B-A4B-it-GGUF`, que a su vez deriva del Gemma 4 26B-A4B-it de Google. El tag `imatrix` sugiere que la cuantizacion se genero con una matriz de importancia (importance matrix) para mejorar la calidad de la cuantizacion, aunque no se detalla el proceso completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia arquitectura MoE. El unico dato verificable de integridad es el hash SHA-256 del archivo GGUF: `f2c28b3dc4776931ac6f879e11f203dec637ea0f14267a86ec8f6165f63f293f`.

## Capacidades

- Generacion de texto conversacional multi-turno (sufijo `-it`, modelo instruido).
- Razonamiento y respuesta a instrucciones en formato chat.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- Inferencia local mediante llama.cpp, con soporte para cuantizacion Q4_K_M.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp en una maquina de sobremesa y gestionar dialogos multi-turno sin depender de servicios en la nube, gracias a su formato GGUF Q4_K_M de ~16,9 GB.
- Motor de respaldo para proyectos de verificacion: tal como indica la model card, se usa como motor local gratuito del proyecto «Marsad», lo que lo hace adecuado para entornos con requisitos de privacidad o sin conectividad.
- Prototipado de aplicaciones de chat: su compatibilidad con endpoints permite integrarlo rapidamente en aplicaciones que consumen APIs estilo OpenAI sin modificar el codigo cliente.
- Evaluacion de modelos MoE en hardware de consumo: al tener ~4B parametros activos, permite experimentar con arquitecturas MoE en GPUs de gama alta consumer.
- Generacion de texto en pipelines offline: util para procesamiento por lotes de documentos donde no se requiere conexion externa.
- Educacion e investigacion: sirve como base para estudiar el comportamiento de modelos Gemma cuantizados y comparar calidad frente a otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17-20 GB para el archivo Q4_K_M, mas overhead de contexto y cache KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; tambien puede ejecutarse en CPU con llama.cpp aunque con latencia mayor.
- Cabe en GPU consumer de gama alta con 24 GB de VRAM (RTX 4090/3090) en Q4_K_M; en GPUs de 16 GB requeriria offloading parcial a RAM.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importacion del GGUF), servidores compatibles con endpoints OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B-it (este repo, Q4_K_M) | 25.233.142.046 | ~4B (inferido) | No disponible | Apache-2.0 | GGUF |
| Gemma 4 26B-A4B-it (unsloth, modelo base) | 25.233.142.046 | ~4B (inferido) | No disponible | Apache-2.0 | GGUF |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se distribuye una cuantizacion Q4_K_M; no hay versiones en safetensors ni otras precisiones en este repositorio.
- La cuantizacion Q4_K_M puede degradar ligeramente la calidad frente a los pesos originales en tareas de razonamiento complejo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos de evaluacion especificos.
- Idiomas soportados no confirmados; el rendimiento en castellano no esta verificado.
- La licencia Apache-2.0 incluye los terminos de uso de Gemma de Google, que deben revisarse antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; se trata de un espejo sin validacion comunitaria.
- El autor lo presenta como "copia de respaldo" para un proyecto concreto, no como distribucion oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/gemma-4-26B-A4B-it-GGUF
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
