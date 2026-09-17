# flowcorp-ch/BudgieScribe-Nano

## Resumen

BudgieScribe Nano es una familia de modelos de normalizacion de texto para salidas de sistemas de reconocimiento automatico del habla (ASR), publicada por flowcorp-ch. Parte de un fine-tune completo de Qwen/Qwen3-0.6B, con un modelo independiente por idioma (frances e ingles), y se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M. Su funcion no es conversacional: recibe la transcripcion cruda de un dictado (minusculas, sin puntuacion, con muletillas, arranques falsos, autocorrecciones y cifras escritas en palabras) y la reescribe como el texto que el hablante queria dictar, sin responder, resumir ni traducir.

El modelo se controla mediante una linea de control al inicio de la entrada con cuatro ejes (estilo, estructura, contexto e idioma, mas una lista opcional de terminos), sintaxis con la que fue entrenado de forma explicita. Con 596.049.920 parametros y 378,3 MiB por archivo, esta pensado para ejecutarse localmente tras cada dictado en un portatil; de hecho es el modelo de limpieza que integra Budgie Echo, una aplicacion de dictado local-first para macOS y Windows.

Es relevante porque cubre un hueco poco atendido: el post-procesado de transcripciones ASR con pesos abiertos, licencia propia y un contrato de formato documentado. La familia se completa con Mini sobre Qwen3-1.7B, BudgieScribe sobre 4B y Large sobre 8B, todos generados con el mismo pipeline, cuyo codigo es abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tune completo del modelo base |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens servidos; entradas troceadas a 1.200 bytes |
| Tipos de cuantizacion | Q4_K_M (16,00 a 5,24 bits por peso); solo se publica Q4_K_M |
| Idiomas soportados | Frances e ingles (un archivo independiente por idioma; `[Lang: fr]` o `[Lang: en]`) |
| Licencia | budgiescribe-license (`license: other`), con texto en LICENSE-MODEL |
| Formato de pesos | GGUF (generados y servidos con llama.cpp build b10816) |

Datos adicionales de los artefactos publicados:

| Archivo | Idioma | Tamano | SHA-256 | Build interna | Entrenamiento |
|---|---|---|---|---|---|
| `BudgieScribe-Nano-fr-Q4_K_M.gguf` | Frances | 396.704.576 bytes (378,3 MiB) | `5df4ab0d5a1a481c90cfd21a621b68d47f09600651438549c7605aa8ffb28463` | `scribe-v9` | 38.042 unidades, 9.512 pasos, 61 min |
| `BudgieScribe-Nano-en-Q4_K_M.gguf` | Ingles | 396.704.576 bytes (378,3 MiB) | `02b3eb0b385d54a5c2fbe5c4a29c144fee9196972a22eef5d4659120147f49b5` | `scribe-en-v7` | 35.306 unidades, 8.828 pasos, 65 min |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-0.6B: un transformer decoder-only denso, sin mezcla de expertos ni componentes de estado recurrente. El autor no modifica la topologia; aplica un fine-tune completo por idioma, es decir, un ajuste de todos los pesos y no un adaptador. Los pesos se publican unicamente en GGUF Q4_K_M, con la afirmacion de que la salida de esa cuantizacion es identica, caracter por caracter, a la del modelo en fp32 sobre el conjunto de control de la release. La decodificacion entrenada y esperada es siempre greedy (`temperature 0`, `top_k 1`) con el modo de razonamiento (thinking) desactivado.

En cuanto a los datos, el frances se entreno sobre 38.042 unidades (9.512 pasos, 61 minutos) con linagora/SUMM-RE (CC BY-SA 4.0) aportando aproximadamente el 14 % de la mezcla; el ingles uso 35.306 unidades (8.828 pasos, 65 minutos) con 1.382 pares de facebook/voxpopuli EN (CC0). El resto de la mezcla no se detalla en la informacion disponible. No se menciona RLHF ni DPO: el ajuste se orienta a una tarea de reescritura determinista, y el propio autor advierte que el modelo se publica junto con sus debilidades, con una seccion de evaluacion en la model card cuyo contenido no esta disponible en el extracto consultado.

La innovacion destacable no esta en la arquitectura sino en el contrato de entrada: una linea de control con los ejes `Styling` (`casual`, `semi-casual`, `semi-formal`, `formal`), `Structure` (`prose`, `lists`), `Context` (`general`, `email`), `Lang` (`fr`, `en`) y un campo opcional `Terms` de hasta 20 palabras para forzar la grafia correcta de nombres y productos. El system prompt esta fijado como cadena exacta de entrenamiento y el autor pide no reescribirlo. La gramatica completa, las invariantes de entrada y salida y las reglas de decodificacion estan documentadas en FORMAT.md.

## Capacidades

- Normalizacion de transcripciones ASR: elimina pausas llenas («euh», «bah», «hum»; "um", "uh"), arranques falsos y autocorrecciones, y reconstruye la frase que el hablante pretendia dictar.
- Puntuacion y capitalizacion (truecasing): introduce mayusculas, puntos, comas y signos de interrogacion o exclamacion ausentes en la salida del ASR.
- Normalizacion inversa de texto: convierte cifras escritas en palabras a formato numerico ("quatorze heures trente" a "14h30"; "twenty three thousand four hundred and fifty dollars" a "$23,450").
- Control de estructura: con `[Structure: lists]` puede emitir una lista Markdown cuando el contenido es una enumeracion real de al menos tres elementos; con `[Structure: prose]` tiene prohibido usar vinietas.
- Control de contexto: con `[Context: email]` maqueta el texto como un mensaje.
- Sesgo lexical por nombres propios: el campo `Terms` permite pasar hasta 20 palabras (nombres, productos) para que se escriban con la grafia correcta.
- Multilingue limitado: un modelo por idioma (frances e ingles), seleccionado por archivo y por la etiqueta `[Lang: ...]`.
- No dispone de tool calling ni de function calling, no ejecuta razonamiento multi-paso orientado a agentes, no responde preguntas, no resume ni traduce, y no incorpora vision ni audio.

## Casos de uso

- Limpieza de dictado en aplicacion de escritorio: es el escenario de origen, ya que el modelo se distribuye dentro de Budgie Echo; tras cada dictado se ejecuta el GGUF local y se devuelve el texto con puntuacion y cifras correctas, sin enviar audio ni texto a la nube.
- Integracion en un pipeline ASR existente: se coloca como etapa de post-procesado despues de Whisper u otro motor, enviando la transcripcion cruda con la linea de control adecuada y recibiendo texto listo para publicar o archivar.
- Actas y notas de reunion en frances o en ingles: la combinacion `[Structure: lists]` con `[Context: general]` permite transformar una enumeracion dictada de acuerdos o tareas en una lista Markdown utilizable directamente en un gestor de tareas o en un wiki.
- Redaccion de correos por voz: con `[Context: email]` el modelo compone el cuerpo del mensaje a partir del dictado, con registro `semi-formal` o `formal`, de modo que el usuario solo tiene que revisar y enviar.
- Documentacion tecnica dictada: usando `Terms` con nombres de API, productos o siglas, se evita que el ASR degrade identificadores; resulta util para informes de incidencias, notas de version o comentarios de codigo dictados.
- Transcripcion accesible para personas con movilidad reducida: el modelo convierte dictado continuo, con dudas y rectificaciones, en texto legible, reduciendo la carga de edicion manual.
- Normalizacion de subtitulos o transcripciones de terceros: se puede aplicar en lote sobre ficheros de texto ya transcritos para homogeneizar puntuacion y cifras antes de subtitular o indexar, respetando el troceado a 1.200 bytes por entrada.
- Procesado por lotes en local sin coste por token: al ocupar 378,3 MiB y decodificar a cientos de tokens por segundo en GPU de gama profesional, es viable normalizar grandes volumenes de dictado en una sola maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de evaluacion dedicada a documentar las debilidades del modelo, pero su contenido no aparece en el extracto consultado, por lo que no se incluyen cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de normalizacion.

Los unicos datos de rendimiento disponibles son de ejecucion: 0,8 s de carga y aproximadamente 436 tok/s de decodificacion sobre una Radeon AI PRO R9700 mediante Vulkan, con llama.cpp build b10816 y decodificacion greedy.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 378,3 MiB (396.704.576 bytes); sumando la cache KV de 4.096 tokens de contexto, el consumo se mantiene muy por debajo de 1 GB en la mayoria de configuraciones (estimacion a partir del tamano del archivo y del contexto declarado, no una medicion publicada).
- GPU recomendadas: no hay una lista oficial; el unico dato publicado es la ejecucion sobre una Radeon AI PRO R9700 por Vulkan. Cualquier GPU con al menos 1 GB de memoria libre es suficiente en la practica.
- GPU de consumo: cabe con holgura en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090 y equivalentes), en iGPU y tambien en CPU.
- Opciones de despliegue: llama.cpp / llama-server con el build b10816 (el que genero los GGUF y el que usa la aplicacion del autor), con `--jinja --chat-template-kwargs '{"enable_thinking":false}' --temp 0 --top-k 1 --ctx-size 4096 --n-gpu-layers 999 --parallel 1`. Al ser GGUF, es compatible con otros runtimes que carguen este formato, aunque no se documentan en la informacion disponible.
- Latencia y throughput: 0,8 s de carga y ~436 tok/s de decodificacion en Radeon AI PRO R9700 (Vulkan). No hay datos de latencia en CPU ni en otras GPU.
- Memoria en disco: 0,8 GB de repositorio en total, con dos archivos de 378,3 MiB.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de fichas de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| BudgieScribe-Nano (fr / en) | 0,6B (596.049.920) | 4.096 tokens | GGUF Q4_K_M | budgiescribe-license | Normalizacion de transcripciones ASR |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | no disponible en la informacion facilitada | safetensors (upstream) | no disponible en la informacion facilitada | Modelo generativo generalista |
| BudgieScribe Mini (Qwen3-1.7B) | 1,7B | no disponible | GGUF | budgiescribe-license | Misma tarea, mayor tamano |
| BudgieScribe (4B) / Large (8B) | 4B / 8B | no disponible | GGUF | budgiescribe-license | Misma tarea, mayor tamano |

No se conocen, a partir de la informacion disponible, otros modelos abiertos dedicados especificamente a la normalizacion de salidas ASR en frances e ingles con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El eje `Styling` es inerte en esta build: solo se entreno con `semi-formal`, por lo que los valores `casual`, `semi-casual` y `formal` no producen el efecto esperado.
- El autor documenta la existencia de debilidades conocidas en una seccion de evaluacion que no esta disponible en el extracto consultado; conviene leerla antes de desplegar el modelo.
- Riesgo de alucinacion: aunque el modelo esta disenado para no anadir contenido y no responder ni resumir, sigue siendo un modelo generativo y puede introducir o alterar palabras en entradas ambiguas, con ruido o fuera de distribucion.
- Un archivo por idioma y `[Lang: ...]` obligatorio: mezclar el archivo frances con entradas en ingles (o al reves) degrada la salida.
- La etiqueta `asr` y `automatic-speech-recognition` del repositorio pueden inducir a error: no es un motor de reconocimiento de voz, sino una etapa de post-procesado de texto.
- Ventana de contexto de 4.096 tokens con entradas troceadas a 1.200 bytes: los dictados largos deben dividirse en fragmentos, lo que puede romper la coherencia entre frases y la deteccion de enumeraciones.
- Decodificacion fija: la salida esperada requiere `temperature 0`, `top_k 1` y thinking desactivado; desviarse de esa configuracion no esta validado.
- El system prompt es una cadena exacta de entrenamiento; reescribirlo puede degradar el comportamiento.
- Licencia `other` (budgiescribe-license): hay que revisar LICENSE-MODEL antes de cualquier uso comercial, ya que no se trata de una licencia estandar tipo Apache 2.0 o MIT y sus condiciones no se detallan en la informacion disponible.
- El modelo es muy reciente y sin traccion: cero descargas y cero likes en el momento de la consulta, con creacion y ultima actualizacion el 17 de septiembre de 2026.
- Los datasets de entrenamiento incluyen SUMM-RE bajo CC BY-SA 4.0, lo que puede introducir obligaciones derivadas de esa licencia sobre los datos; los sesgos concretos del corpus no se detallan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flowcorp-ch/BudgieScribe-Nano
- Licencia del modelo: https://huggingface.co/flowcorp-ch/BudgieScribe-Nano/blob/main/LICENSE-MODEL
- Repositorio de codigo: https://github.com/alexxxcoelho/budgie-scribe
- Contrato de formato (FORMAT.md): https://github.com/alexxxcoelho/budgie-scribe/blob/main/FORMAT.md
- Guia de contribucion: https://github.com/alexxxcoelho/budgie-scribe/blob/main/CONTRIBUTING.md
- Aplicacion de dictado Budgie Echo: https://gobudgie.com/echo
- Dataset linagora/SUMM-RE: https://huggingface.co/datasets/linagora/SUMM-RE
- Dataset facebook/voxpopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Resultados de busqueda web: no se han encontrado resultados relevantes para este modelo; las busquedas devolvieron unicamente paginas no relacionadas sobre mandos a distancia de television.
