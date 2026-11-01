# 3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit

## Resumen

Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit es una cuantizacion experimental en formato MLX del modelo multimodal orcarouter/Qwen3.8-Flash-Next-Uncensored, publicada por el usuario 3hs4n. El paquete esta disenado especificamente para Apple Silicon y emplea la libreria mlx-vlm para ofrecer inferencia nativa de texto y vision sobre el runtime `qwen4_exp`. El modelo base es una variante "uncensored" de la familia Qwen, con 177.392.830.611 parametros totales segun los pesos safetensors, y esta orientado a tareas image-text-to-text conversacionales.

La relevancia de esta publicacion reside en su estrategia de cuantizacion mixta: los expertos se almacenan en 2 bits, la tabla PLE (probablemente un componente de adaptacion) en 4 bits, y los componentes sensibles en FP16. Esto permite cargar un modelo de casi 177.000 millones de parametros en un Mac con 64 GiB de memoria unificada, algo que en teoria no seria posible con una cuantizacion uniforme de 8 bits. El autor documenta un pico de huella fisica de proceso de 39,72 GiB en un M1 Max con 64 GiB, usando un contexto de 16.384 tokens.

El modelo se distribuye bajo la licencia qwen-community-license-1.0, tiene un tamano de repositorio de 72,8 GB (incluyendo una tabla PLE respaldada en disco de 32,0 GB) y cuenta con 209 descargas y 0 likes en el momento de la consulta. Es una publicacion reciente (creada el 25 de octubre de 2026) y de caracter marcadamente experimental, sin benchmarks publicos estandarizados mas alla de pruebas internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), runtime `qwen4_exp` en MLX-VLM; detalles internos no disponibles |
| Parametros totales | 177.392.830.611 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (perfil probado por el autor); no se especifica el maximo nativo del modelo base |
| Tipos de cuantizacion | Mixta: expertos en 2 bits, PLE en 4 bits, componentes sensibles en FP16; etiqueta global 8-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (MLX), libreria mlx-vlm |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer multimodal con soporte de texto y vision, identificado con el tag `qwen4_exp`, lo que sugiere una variante experimental de la familia Qwen4. El modelo base es orcarouter/Qwen3.8-Flash-Next-Uncensored, del cual esta publicacion es una cuantizacion (relacion `quantized`). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar.

La innovacion tecnica destacable de esta publicacion es la cuantizacion mixta con una tabla PLE de 32,0 GB respaldada en disco, mapeada y leida bajo demanda, de modo que no se asigna como un unico bloque residente de pesos MLX. El autor indica que el helper incluido aplica un adaptador PLE en FP16 requerido para el funcionamiento. Ademas, existe una edicion separada (DFlash2) que incorpora un drafter para decodificacion especulativa, con ganancias de velocidad medidas frente a una linea base equivalente en esa edicion; esta publicacion concreta usa decodificacion ordinaria, sin especulacion activa.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes en detalle completo (por defecto `--image-max-tokens 0`), con pipeline image-text-to-text.
- Modo de razonamiento opcional ("thinking") a traves del helper incluido.
- Soporte de function calling nativo (verificado en las pruebas del autor: llamada a funcion nativa y roundtrip de resultado de herramienta simulado).
- Salida estructurada en JSON (con reservas: fallo en una comprobacion estricta de JSON-only cuando la imagen devolvia fences Markdown).
- Generacion de codigo y resolucion de problemas matematicos (prueba GSM8K interna).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no verificadas de forma especifica mas alla de las pruebas sinteticas del autor.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno con contexto de hasta 16.384 tokens en un equipo Apple Silicon con 64 GiB, sin depender de servicios en la nube, gracias al runtime MLX nativo.
- Analisis de imagenes en detalle completo: adecuado para tareas de descripcion, extraccion de valores o inspeccion visual donde se requiera preservar la resolucion original de la imagen, ya que el perfil por defecto no limita los tokens de imagen.
- Generacion de codigo en local: las pruebas del autor incluyen sondas de codigo y una prueba GSM8K con 50/50 aciertos en un subconjunto fijo, lo que lo hace util para asistencia de programacion en entornos sin conectividad.
- Automatizacion con function calling: integrable en flujos que requieran llamadas a herramientas y roundtrips de resultados, segun las comprobaciones sinteticas superadas.
- Razonamiento matematico asistido: el modo thinking opcional y el rendimiento en GSM8K lo orientan a resolucion de problemas paso a paso en local.
- Prototipado e investigacion en cuantizacion: util para estudiar el comportamiento de cuantizacion mixta (2/4/16 bits) en modelos de gran tamano sobre hardware de consumo Apple.
- Despliegue en Unsloth Studio: el autor verifico su carga y uso a traves de la API de chat nativa de Unsloth Studio 0.1.910-beta con 8.192 de contexto y una ranura.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| GSM8K (subconjunto fijo de desarrollo) | 50/50 | Limite de salida 4.096 tokens |
| Pruebas sinteticas en Unsloth Studio | 6/7 superadas en 28,17 s | Contexto 8.192, una ranura; fallo en JSON estricto con imagen |
| Decodificacion via API | ~23,5 tokens/s | Seis sondas pequenas de texto/codigo con estados de cache mixtos |
| Respuestas largas en Studio | 10,25–11,00 tokens/s | Una ejecucion, sin cruce de velocidad |
| Pico de huella fisica de proceso | 39,72 GiB | Contexto 16.384, M1 Max 64 GiB |
| Pico de huella fisica (historico) | 41,20 GiB | Contexto 8.192, condiciones distintas |
| Pico en Studio | 42,08 GiB | Contexto 8.192, una ranura |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 64 GiB probados y recomendados; 48 GiB no probado y ajustado; 32 GiB por debajo de la estimacion de payload residente (38,01 GiB) e inadecuado para el perfil probado.
- GPU: Apple Silicon (probado en M1 Max). No hay datos para GPU NVIDIA u otras.
- Almacenamiento: 72,843 GB de descarga completa, incluyendo la tabla PLE de 32,0 GB respaldada en disco.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada de 64 GiB; no hay datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX-VLM con el helper de Unsloth incluido; Unsloth Studio 0.1.910-beta (verificado); el autor menciona un entorno MLX de Unsloth preexistente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~23,5 tokens/s via API en sondas pequenas y 10,25–11,00 tokens/s en respuestas largas dentro de Studio; la edicion DFlash2 ofrece decodificacion especulativa con ganancias de velocidad no cuantificadas en esta ficha.
- Entorno verificado en Studio: Python 3.13.15, MLX 0.32.4, mlx-vlm 0.7.9, mlx-lm 0.32.2, Unsloth-Zoo 2026.10.8, Transformers 5.5.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit (esta ficha) | 177,4 B | 16.384 (probado) | Mixta 2/4/16 bits, MLX | qwen-community-license-1.0 | HuggingFace, 209 descargas |
| Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2 | no disponible (mismo payload + drafter) | no disponible | Mixta, MLX | qwen-community-license-1.0 | HuggingFace, 74,048 GB |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | no disponible | no disponible | Original (sin cuantizar) | no disponible | HuggingFace |

No se dispone de datos suficientes para comparar con alternativas de otros autores en la misma categoria (modelos multimodales de ~177 B en MLX). La comparativa se limita a las variantes del mismo modelo base documentadas por el autor.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explicitamente como experimental y las instrucciones de compilacion desde codigo fuente son un esquema no verificado de instalacion limpia.
- Requiere 64 GiB de memoria unificada en la practica; 48 GiB no esta probado y 32 GiB es insuficiente segun la estimacion del autor.
- La etiqueta "8-bit" de HuggingFace no refleja la cuantizacion real (expertos en 2 bits, PLE en 4 bits, componentes sensibles en FP16); el aviso de hardware del Hub puede inducir a error.
- El rendimiento en JSON estricto fallo en una de las pruebas sinteticas con imagen (fences Markdown), lo que desaconseja su uso en pipelines que exijan JSON puro sin post-procesado.
- Las pruebas de calidad se limitan a 50/50 en un subconjunto fijo de GSM8K y a comprobaciones sinteticas; no hay evaluaciones estandarizadas que permitan estimar la calidad general.
- No hay datos sobre sesgos, riesgo de alucinacion ni comportamiento multilingue.
- La licencia qwen-community-license-1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue productivo.
- Solo se ha verificado en Apple Silicon con MLX; no hay soporte documentado para CUDA, vLLM, llama.cpp u otros runtimes.
- La edicion DFlash2 no activa su drafter al cargarse en Studio segun las pruebas del autor; la aceleracion especulativa requiere el entrypoint especifico de esa edicion.
- El modelo base es una variante "uncensored", lo que puede implicar una menor alineacion de seguridad y mayor probabilidad de generar contenido inapropiado.

## Enlaces

- HuggingFace: https://huggingface.co/3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Edicion DFlash2: https://huggingface.co/3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2
- Evidencia de recursos nativos: evaluation/upstream-native-resource.json (en el repositorio)
- Observaciones de memoria API: evaluation/api-memory.json (en el repositorio)
- Evidencia de pruebas en Studio: evaluation/studio-native-smokes-r1.json (en el repositorio)
