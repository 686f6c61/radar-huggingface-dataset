# Sawfwair/Inkling-2-Mini-Speed

## Resumen

Inkling 2 Mini Speed es un checkpoint cuantizado del modelo multimodal Inkling 2 Mini, desarrollado originalmente por Thinking Machines Lab y redistribuido por el usuario Sawfwair para su uso con el runtime mere.run en Apple Silicon. El modelo resuelve la tarea de conversacion image-text-to-text (entrada de imagen y texto, salida de texto) y esta pensado para ejecutarse en hardware de Apple mediante el framework MLX. Se trata de un empaquetado de inferencia, no de un modelo entrenado desde cero: combina pesos objetivo cuantizados, pesos de vision, tokenizer, plantilla de chat y pesos auxiliares para decodificacion especulativa.

El checkpoint parte del export MTPLX Optimized Speed (revision `b7570c07`) e incorpora dos shards adicionales: `draft-head/`, con el peso de salida en 4 bits, escalas y sesgos extraidos de MTPLX Bare Speed, y `draft-fold/`, con el peso de salida original en BF16 extraido del checkpoint de Thinking Machines Lab. El runtime mere.run usa este ultimo para calcular la correccion DSpark durante la carga. El modelo declara 27.530.496.048 parametros totales (unos 27,5 mil millones) y un repositorio de 18,4 GB.

Es relevante ahora porque demuestra el patron de distribucion de modelos optimizados para inferencia local en Apple Silicon: cuantizacion mixta (expertos en NVFP4, proyecciones de atencion y salida en 8 bits afines), decodificacion especulativa con cabezas draft y empaquetado especifico para un runtime. La licencia Apache 2.0 facilita su reutilizacion, aunque el modelo base impone politicas de uso aceptable adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint derivado de Inkling 2 Mini; el autor no detalla la arquitectura base) |
| Parametros totales | 27.530.496.048 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en NVFP4; proyecciones de atencion y salida en 8 bits afines; cabeza draft en 4 bits; peso de salida original en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con politica de uso aceptable del modelo base) |
| Formato de pesos | safetensors (runtime mere.run, MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Inkling 2 Mini en la documentacion proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas o cabezas de atencion. El dato de parametros totales (27,5 mil millones) corresponde a los tensores del checkpoint cuantizado. La referencia a "expertos en NVFP4" en la model card sugiere la presencia de capas con mezcla de expertos (MoE), pero no se confirma el numero de expertos ni los parametros activos por token.

Este checkpoint no ha sido reentrenado: es un empaquetado de inferencia. El autor documenta tres fuentes con revisiones fijas. Los pesos objetivo y el tokenizer provienen sin cambios del export MTPLX Optimized Speed. El shard `draft-head/` contiene el peso de salida en 4 bits, escalas y sesgos copiados byte a byte de MTPLX Bare Speed. El shard `draft-fold/` contiene el peso de salida original en BF16 copiado byte a byte del checkpoint de Thinking Machines Lab, y mere.run lo emplea para calcular la correccion DSpark durante la carga. La innovacion tecnica destacable es precisamente esta combinacion de cuantizacion mixta y decodificacion especulativa con pesos draft, orientada a reducir latencia en inferencia local.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado `image-text-to-text`.
- Comprension de imagenes combinadas con texto: el checkpoint incluye pesos de vision y tokenizer, lo que habilita entradas imagen-texto.
- Decodificacion especulativa mediante cabezas draft empaquetadas (`draft-head/` y `draft-fold/`), orientada a acelerar la generacion.
- Ejecucion en Apple Silicon mediante MLX y el runtime mere.run.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar dialogos multi-turno en un equipo Apple Silicon mediante mere.run, sin depender de servicios en la nube. Es adecuado por su empaquetado nativo para MLX y su tamano contenido (18,4 GB de repositorio).
- Descripcion y analisis de imagenes en local: al ser un modelo image-text-to-text con pesos de vision incluidos, sirve para generar descripciones, responder preguntas sobre capturas o extraer informacion de documentos escaneados en un flujo privado.
- Prototipado de aplicaciones multimodales: un desarrollador puede integrar el modelo en una app de escritorio para Mac y validar casos de uso de vision y lenguaje antes de migrar a infraestructura de servidor.
- Evaluacion de tecnicas de decodificacion especulativa: los shards draft incluidos permiten estudiar el impacto de la correccion DSpark y de la cuantizacion mixta en latencia y calidad, comparando contra el checkpoint base.
- Pruebas de cuantizacion en produccion: el checkpoint mezcla NVFP4 en expertos con 8 bits en atencion y salida, lo que lo convierte en un banco de pruebas para medir la degradacion de calidad frente al modelo original en BF16.
- Investigacion sobre distribucion de modelos: sirve como ejemplo reproducible de empaquetado de pesos con revisiones fijas y trazabilidad byte a byte de cada shard, util para auditar pipelines de publicacion de modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 18,4 GB; se necesita al menos esa cantidad de memoria unificada para cargar el checkpoint completo, mas overhead del runtime y del contexto.
- GPU recomendadas: no disponible. El checkpoint esta orientado a Apple Silicon (MLX), no a GPU NVIDIA.
- Cabe en consumer GPU: no disponible para GPU dedicadas. En Apple Silicon, requiere equipos con memoria unificada suficiente (por encima de 18,4 GB, es decir, configuraciones de 24 GB o superiores).
- Opciones de despliegue: runtime mere.run (comando `mere.run model pull vision-chat-inkling-2-mini`); framework MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini Speed (este) | 27,5 mil millones | no disponible | Apache 2.0 | safetensors / mere.run, MLX | Cuantizacion mixta NVFP4 + 8 bits, cabezas draft incluidas |
| Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed | no disponible | no disponible | no disponible | safetensors | Fuente directa de los pesos objetivo y tokenizer |
| Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed | no disponible | no disponible | no disponible | safetensors | Fuente del shard `draft-head/` en 4 bits |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | safetensors | Checkpoint original en BF16; fuente del shard `draft-fold/` |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo conversacional y multimodal, es esperable que pueda generar contenido incorrecto, pero no hay datos publicados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se declaran en la informacion disponible, lo que impide garantizar un comportamiento multilingue.
- Restricciones de licencia: el bundle se distribuye bajo Apache 2.0, pero el modelo base de Thinking Machines Lab impone una politica de uso aceptable adicional que debe respetarse en produccion.
- Dependencia de runtime: el checkpoint esta empaquetado para mere.run y MLX; no se documenta compatibilidad con otros motores de inferencia, lo que limita la portabilidad.
- Trazabilidad: los pesos se copian byte a byte de revisiones concretas, pero el autor no publica evaluaciones de calidad tras la cuantizacion mixta (NVFP4 en expertos, 8 bits en atencion y salida).
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (23 de noviembre de 2026), por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sawfwair/Inkling-2-Mini-Speed
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revision del checkpoint original: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- MTPLX Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Revision de MTPLX Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed/tree/b7570c070c17d2c148979ce2fb9404efa4760bd6
- MTPLX Bare Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Revision de MTPLX Bare Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed/tree/388ab6d1b75ad2cecae0845a70a3e84227cf3d56
- Politica de uso aceptable de Thinking Machines Lab: https://thinkingmachines.ai/model-acceptable-use-policy/
