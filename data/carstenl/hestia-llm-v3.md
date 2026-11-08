# CarstenL/Hestia-LLM-V3

## Resumen

Hestia LLM V3 es un modelo de lenguaje de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) desarrollado por CarstenL como componente central de Sophist Hestia, una aplicacion de dictado local para macOS. No se trata de un asistente generalista, sino de un modelo especializado en limpieza de texto dictado: corrige puntuacion, mayusculas, muletillas, autocorrecciones, puntuacion dictada verbalmente ("Punto", "coma", "nuevo parrafo"), listas de terminos y el tratamiento de "du/Sie" segun el contexto, ademas de redactar resumenes de reuniones y ejecutar acciones breves de texto. Todo el procesamiento ocurre en el dispositivo, sin salida de datos a la nube.

El modelo parte de Qwen/Qwen3.5-4B (Apache-2.0) con el modo de razonamiento (thinking) desactivado, y se ha afinado mediante LoRA de rango 32 que posteriormente se fusiono en los pesos base. Despues se cuantizo a 4 bits con grupo de 64 mediante MLX, dando como resultado un artefacto de aproximadamente 2,2 GB, solo texto (los pesos de vision se eliminaron). La licencia Apache-2.0 se hereda del modelo base, cuyos derechos corresponden a Alibaba Cloud (equipo Qwen).

Su relevancia actual radica en el nicho: demuestra como un modelo de 4B puede especializarse de forma agresiva para una tarea concreta de post-procesado de ASR (reconocimiento automatico del habla) y desplegarse de forma totalmente local en Apple Silicon mediante MLX, con un formato de pesos optimizado para inferencia en el dispositivo. Es un caso practico de adaptacion de un modelo base general a un flujo de producto muy acotado, con prompts de sistema fijos y datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, arquitectura `qwen3_5`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit con group size 64 (MLX); pesos base en safetensors |
| Idiomas soportados | aleman (de) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen/Qwen3.5-4B con el modo thinking desactivado. El proceso de adaptacion consistio en un fine-tuning LoRA de rango 32 sobre el modelo base, tras el cual el adaptador se fusiono directamente en los pesos base y el resultado se cuantizo a 4 bits (group size 64) con MLX. Ademas se eliminaron los pesos de vision, dejando un modelo estrictamente de texto y reduciendo el tamano a unos 2,2 GB.

Los datos de entrenamiento son sinteticos: dictados en aleman e ingles escritos por un LLM, locutados mediante text-to-speech y transcritos con Parakeet, cada uno emparejado con una limpieza de referencia. Se anadieron ejemplos de reuniones y acciones de texto generados por el propio modelo base para preservar esas capacidades. No se utilizaron datos de usuarios. El modelo se entrena sobre los prompts exactos que envia la aplicacion Sophist Hestia: un prompt de sistema con reglas, una lista de terminos opcional, una seccion de contexto y el mensaje del usuario envuelto en etiquetas `<text>`. El texto a procesar nunca se interpreta como instruccion: las preguntas o peticiones dentro del dictado se limpian, no se responden. Entre los cambios respecto a V2 destacan la conservacion de palabras iniciales de respuesta ("No/Nein", "Yes/Ja", "Okay") y los limites de frase tal como se dictaron, el formateo de listas solo con tres o mas elementos, el seguimiento de prompts personalizados que comienzan con una frase de rol (por ejemplo, "hazlo mas educado") y la conversion de puntuacion dictada en el signo correspondiente.

## Capacidades

- Limpieza de texto dictado: puntuacion, mayusculas, eliminacion de muletillas y resolucion de autocorrecciones.
- Conversion de puntuacion dictada verbalmente ("Punto", "comma", "new paragraph") al signo correspondiente.
- Formateo de listas de terminos y de listas de tres o mas elementos; los dos elementos tras "namlich"/"namely" se mantienen como texto corrido.
- Ajuste del tratamiento "du/Sie" segun el contexto del dictado.
- Formateo de correos electronicos y mensajes de chat.
- Redaccion de resumenes de reuniones.
- Ejecucion de acciones breves de texto y seguimiento de prompts personalizados con frase de rol.
- Capacidades multilingues limitadas a aleman e ingles.
- No es un asistente general: no responde a preguntas contenidas en el texto dictado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision y audio: no soportados (pesos de vision eliminados; el audio lo procesa la app via ASR externo).

## Casos de uso

- Limpieza de dictado en produccion dentro de Sophist Hestia: el modelo recibe el texto transcrito por Parakeet y devuelve el texto corregido con puntuacion, mayusculas y muletillas eliminadas, ejecutandose integramente en el Mac del usuario sin enviar datos a la nube.
- Post-procesado de transcripciones ASR en pipelines propios: puede integrarse como etapa de normalizacion tras cualquier motor de reconocimiento de voz en aleman o ingles, aprovechando que el texto se envuelve en `<text>` y nunca se interpreta como instruccion.
- Redaccion de resumenes de reuniones: a partir de una transcripcion, el modelo genera un resumen breve, adecuado para actas rapidas en entornos donde la confidencialidad impide usar servicios en la nube.
- Normalizacion de correos y mensajes de chat dictados: convierte un dictado informal en un correo con formato, tratamiento "Sie" o "du" coherente y puntuacion correcta, listo para enviar tras revision.
- Aplicacion de listas de terminos personalizadas: con una lista de terminos opcional en el prompt de sistema, el modelo unifica la grafia de nombres propios y terminos tecnicos en la transcripcion (con la salvedad de que puede sustituir palabras que solo se parecen levemente a un termino de la lista).
- Acciones de texto breves por voz: reescritura de un fragmento con un rol indicado (por ejemplo, "hazlo mas educado"), util para integrarse en atajos de macOS o flujos de productividad local.
- Despliegue en Apple Silicon para prototipos de asistentes de dictado: sirve como referencia de como adaptar un modelo de 4B a una tarea acotada y cuantizarlo a 4 bits con MLX para inferencia local de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unificated memory estimada: aproximadamente 2,2 GB para los pesos cuantizados a 4 bits; el consumo real en inferencia es algo superior por el contexto y los buffers de MLX (no disponible la cifra exacta).
- GPU recomendadas: Apple Silicon (MLX / mlx-swift-lm). No hay informacion sobre soporte en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; el modelo esta pensado para ejecucion en el dispositivo en macOS.
- Opciones de despliegue: MLX y mlx-swift-lm (runtime nativo del modelo). Otros runtimes como vLLM, llama.cpp, Ollama o TGI no estan documentados en la informacion disponible y requeririan conversion de formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hestia LLM V3 | 4,2 B | no disponible | de, en | Apache-2.0 | Limpieza de dictado y resumenes, local en macOS (MLX 4-bit) |
| Qwen/Qwen3.5-4B (base) | 4 B | no disponible | multilingue | Apache-2.0 | Modelo generalista de texto |
| Sophist Hestia (producto) | no disponible | no disponible | de, en | no disponible | Aplicacion de dictado local que integra Hestia LLM V3 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Con una lista de terminos larga, el modelo ocasionalmente sustituye una palabra que solo se parece levemente a un termino de la lista.
- Los nombres mal oidos no siempre se corrigen a la grafia de la lista.
- No es un asistente de proposito general; las salidas deben revisarse como cualquier correccion automatica.
- El modelo esta entrenado sobre los prompts exactos de la aplicacion Sophist Hestia; otros prompts funcionan pero no fueron el foco del entrenamiento, por lo que el rendimiento puede degradarse fuera de ese formato.
- Idiomas limitados a aleman e ingles.
- Riesgo de alucinacion: no documentado explicitamente, pero al ser un modelo generativo aplicado a limpieza de texto conviene validar las salidas en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero los derechos del modelo base corresponden a Alibaba Cloud (equipo Qwen); conviene revisar las condiciones del modelo base para usos derivados.
- El modelo es solo texto; no procesa audio ni imagenes por si mismo (el ASR es externo, via Parakeet en la aplicacion).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarstenL/Hestia-LLM-V3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime MLX: https://github.com/ml-explore/mlx
- Paper relacionado (Hessian-guided quantization, referencia de la busqueda web, no especifico de este modelo): https://www.emergentmind.com/papers/2601.20745
