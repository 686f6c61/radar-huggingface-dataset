# Hanish/quill-models

## Resumen

Hanish/quill-models no es un modelo entrenado, sino un repositorio espejo de ficheros GGUF de terceros que utiliza la aplicacion Quill (chat offline y teclado con IA para Android). El autor, Hanish, publica copias byte a byte identicas de los GGUF originales para que las descargas de la app no dependan de los nombres de repositorio de los proyectos upstream. La model card indica explicitamente que "nothing here is modified or fine-tuned": no hay fine-tuning, destilacion ni modificacion de pesos.

El repositorio agrupa tres modelos de instrucciones: Qwen3.5-0.8B (Q4_K_M, 533 MB), Qwen3.5-2B (Q4_K_M, 1,28 GB) y Gemma 4 E2B (Q4_0, 2,84 GB). Los dos primeros proceden de conversiones GGUF de Unsloth y el tercero de las conversiones del equipo ggml-org. La suma de parametros declarada en safetensors para el repositorio es de 4.628.569.635, si bien conviene notar que cada fichero individual corresponde a un modelo distinto de aproximadamente 0,8B, 2B y un modelo E2B, respectivamente.

Su relevancia es practica mas que cientifica: sirve como capa de distribucion reproducible (con hashes sha256 fijados) para integrar LLM en un teclado y un chat de Android sin conexion, apoyandose en llama.cpp (build b6b003d o superior) y en las arquitecturas `qwen35` y `gemma4`. El modelo propio del teclado de Quill se aloja aparte, en Hanish/quill-fix-v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; llama.cpp identifica las arquitecturas como `qwen35` y `gemma4` |
| Parametros totales | 4.628.569.635 (dato agregado del repositorio en safetensors); por fichero: Qwen3.5-0.8B (~0,8B), Qwen3.5-2B (~2B), Gemma 4 E2B (E2B) |
| Parametros activos | No aplica (los modelos base declarados son densos, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (Qwen3.5-0.8B y Qwen3.5-2B), Q4_0 (Gemma 4 E2B) |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

Detalle por fichero:

| Fichero | Modelo | Cuantizacion | Tamano | Upstream | RAM minima en Quill |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Q4_K_M.gguf | Qwen3.5-0.8B (instruct) | Q4_K_M | 533 MB | unsloth/Qwen3.5-0.8B-GGUF | 3 GB ("Chat Lite") |
| Qwen3.5-2B-Q4_K_M.gguf | Qwen3.5-2B (instruct) | Q4_K_M | 1,28 GB | unsloth/Qwen3.5-2B-GGUF | 5 GB ("Chat") |
| gemma-4-E2B-it-Q4_0.gguf | Gemma 4 E2B (instruct) | Q4_0 | 2,84 GB | ggml-org/gemma-4-E2B-it-GGUF | 7 GB ("Chat Pro") |

## Arquitectura y entrenamiento

No hay informacion de arquitectura ni de entrenamiento en la model card, ya que el repositorio es un espejo. Los pesos corresponden a los modelos upstream Qwen3.5 (Alibaba Cloud) y Gemma 4 E2B (Google DeepMind). Quill indica que ejecuta ambos mediante llama.cpp (MIT), con build b6b003d o superior, que da soporte a las arquitecturas `qwen35` y `gemma4`. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni etapas de RLHF/DPO para ninguno de los modelos, dado que esa informacion pertenece a las model cards originales de cada upstream.

La unica innovacion tecnica relevante del repositorio es de empaquetado y reproducibilidad: los tres ficheros GGUF se publican con hashes sha256 verificables y fijados en la app (`bd258782...` para 0.8B, `aaf42c8b...` para 2B y `8e30dff3...` para Gemma 4 E2B), lo que garantiza que la descarga en dispositivo sea exactamente el artefacto esperado. Ademas, la model card documenta los formatos de prompt que usa Quill: ChatML para Qwen3.5 con un bloque `<think>\n\n</think>` vacio tras `<|im_start|>assistant` (pensamiento desactivado), y el formato `<bos><start_of_turn>user...` para Gemma 4.

## Capacidades

- Generacion de texto conversacional en modo instruct, en los tres modelos incluidos.
- Ejecucion totalmente offline en dispositivo Android (chat y teclado), sin dependencia de servidores.
- Soporte multilingue declarado (etiquetas `en` y `multilingual`).
- Formato de prompt predefinido para Qwen3.5 (ChatML sin modo thinking) y Gemma 4 (formato de turnos con `<start_of_turn>`), lo que habilita integracion directa en la app.
- Compatibilidad con llama.cpp, lo que aporta streaming de tokens, gestion de contexto y carga de GGUF cuantizados.
- No se declara soporte explicito de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (el bloque de thinking de Qwen3.5 se envia vacio).

## Casos de uso

- Chat conversacional offline en Android: la app Quill usa el fichero Qwen3.5-2B-Q4_K_M (1,28 GB, RAM minima 5 GB) para mantener conversaciones multi-turno sin conexion, con carga via llama.cpp.
- Teclado con IA integrado: el modelo de 0,8B (533 MB, RAM minima 3 GB) permite sugerencias, reescritura y correccion de texto dentro del teclado con latencia baja y huella de memoria reducida.
- Redaccion y respuesta rapida de mensajes: el modelo de 0,8B es adecuado para generar borradores cortos y respuestas sugeridas en el propio dispositivo, sin enviar texto del usuario a la nube.
- Perfil de mayor calidad con Gemma 4 E2B: cuando el dispositivo dispone de 7 GB o mas de RAM, el fichero Q4_0 (2,84 GB) ofrece una opcion "Chat Pro" para tareas que requieren mas coherencia y conocimiento general.
- Traduccion y reformulacion ligera multilingue: aprovechando la etiqueta `multilingual` y el formato de prompt de cada familia, se puede usar para reescribir o adaptar frases sin salir del dispositivo.
- Prototipado de apps moviles con LLM embebido: dado que son GGUF estandar de llama.cpp, sirven como base para probar integraciones de inferencia en Android o en escritorio sin necesidad de GPU dedicada.
- Distribucion reproducible en produccion: los hashes sha256 y los espejos permiten fijar versiones exactas en un pipeline de compilacion o en una app distribuida, evitando roturas por cambios en repos upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y la busqueda web no aporto datos adicionales.

## Requisitos de hardware

- Qwen3.5-0.8B (Q4_K_M): fichero de 533 MB; la app Quill fija un suelo de 3 GB de RAM para el perfil "Chat Lite". Cabe en practicamente cualquier movil Android moderno.
- Qwen3.5-2B (Q4_K_M): fichero de 1,28 GB; suelo de 5 GB de RAM para el perfil "Chat".
- Gemma 4 E2B (Q4_0): fichero de 2,84 GB; suelo de 7 GB de RAM para el perfil "Chat Pro".
- GPU dedicada: no requerida; el escenario objetivo es CPU en Android. En escritorio puede ejecutarse tambien en CPU y, si se desea, en GPU consumer (por ejemplo RTX 4090) a traves de builds de llama.cpp con aceleracion.
- Opciones de despliegue: llama.cpp (build b6b003d o superior, arquitecturas `qwen35` y `gemma4`), aplicaciones que embeban llama.cpp como Quill; el resto de runtimes no se mencionan en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa interna de los tres ficheros incluidos en el repositorio:

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | Licencia | RAM minima (Quill) |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B | ~0,8B | Q4_K_M | 533 MB | No disponible | apache-2.0 | 3 GB |
| Qwen3.5-2B | ~2B | Q4_K_M | 1,28 GB | No disponible | apache-2.0 | 5 GB |
| Gemma 4 E2B | E2B | Q4_0 | 2,84 GB | No disponible | apache-2.0 | 7 GB |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que no es posible establecer cual ofrece mejor calidad por tarea mas alla de la progresion de tamano y del perfil de RAM asignado por la app.

## Limitaciones y advertencias

- El repositorio es un espejo sin modificaciones; cualquier limitacion de sesgo, alucinacion o cobertura linguistica es heredada de los modelos upstream (Qwen3.5 y Gemma 4 E2B) y no se documenta aqui.
- Riesgo de alucinacion inherente a modelos pequenos (0,8B y 2B) y a cuantizaciones Q4, que pueden degradar la precision frente a los pesos originales.
- El bloque `<think>` de Qwen3.5 se envia vacio, de modo que el modo de razonamiento extendido queda desactivado por diseno en este uso.
- No se documenta longitud de contexto soportada, lo que limita la planificacion de casos con conversaciones largas.
- La licencia es apache-2.0 segun la model card, pero conviene verificar las condiciones de cada upstream (Alibaba Cloud para Qwen3.5 y Google DeepMind para Gemma 4 E2B) antes de un uso comercial.
- Dependencia de una version concreta de llama.cpp (build b6b003d o superior); builds antiguos pueden no reconocer las arquitecturas `qwen35` ni `gemma4`.
- Los ficheros espejo pueden quedar desactualizados si los repos upstream publican nuevas revisiones; la app mitiga esto fijando hashes sha256, que habria que actualizar manualmente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre estos artefactos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Hanish/quill-models
- Modelo propio del teclado de Quill: https://huggingface.co/Hanish/quill-fix-v1
- Upstream GGUF Qwen3.5-0.8B (Unsloth): https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Upstream GGUF Qwen3.5-2B (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Upstream GGUF Gemma 4 E2B (ggml-org): https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- llama.cpp (runtime, licencia MIT): no se proporciona URL directa en la model card; el proyecto es el repositorio habitual de ggml-org/llama.cpp
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados eran paginas de ayuda de YouTube y contenidos de Zhihu sin relacion).
