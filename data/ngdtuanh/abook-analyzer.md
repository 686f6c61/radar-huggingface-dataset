# NGDtuanh/abook-analyzer

## Resumen

abook-analyzer (publicado en Hugging Face como `NGDtuanh/abook-analyzer`, con el nombre interno `abook-speaker:v2`) es un ajuste fino de Qwen3-4B-Instruct-2507 especializado en una tarea muy concreta: la atribución de hablante linea a linea en novelas vietnamitas. Dado un parlamento o pensamiento interno, junto con los parrafos de contexto y los hablantes ya asignados previamente, el modelo devuelve `{"speaker": ...}` siguiendo el prompt y el esquema propios de la aplicacion ABook. No es un modelo conversacional generico, sino un componente de un pipeline mayor.

El modelo parte de la base Apache-2.0 de Qwen (4.022.468.096 parametros) y se obtiene mediante un promedio de pesos (model soup) de tres ejecuciones LoRA distintas, fusionadas y exportadas a GGUF Q8_0 (3,99 GiB). Esta pensado para ejecutarse en GPU NVIDIA de 8 GB, lo que lo hace desplegable en hardware de consumo. Su relevancia radica en que aborda un problema practico de los pipelines de audiolibros: la desambiguacion de voces en dialogos narrativos, donde las heuristicas clasicas fallan con frecuencia.

La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face. Cualquier dato no documentado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con ajuste fino LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (`num_ctx` recomendado por el autor) |
| Tipos de cuantizacion | GGUF Q8_0 (3,99 GiB); se mencionan tags onnx en Hugging Face pero no se detalla su contenido |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (principal); el repo incluye tambien artefactos onnx segun tags |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. Sobre esa base se aplica un ajuste fino con LoRA de rango 16 y alpha 32, partiendo del adaptador de la version anterior (v1). El entrenamiento de esta v2 consiste en 716 pasos (acumulacion 8, learning rate 1e-4 con decaimiento coseno) sobre 5.728 muestras. La perdida se calcula unicamente sobre la respuesta, de modo que el modelo aprende a asignar etiquetas y no a reproducir el texto de la novela.

La innovacion tecnica principal es el tratamiento del historial de hablantes previos: durante el entrenamiento, el 27 % de las entradas de ese historial se corrompen deliberadamente con etiquetas erroneas, siguiendo la distribucion de errores que cometia la v1 al predecir (cambio de turno, confusion con personajes conocidos, con personajes secundarios o con nombres desconocidos). Asi el modelo aprende a responder correctamente incluso cuando el contexto previo es erroneo, que es la situacion real en inferencia. Ademas, se entrenan tres ejecuciones con semillas distintas (1234, 1, 4321) y se promedian sus incrementos de pesos (model soup), lo que reduce la varianza: una ejecucion individual oscilaba hasta 1,6 puntos entre semillas, y el promedio supera a la mejor ejecucion individual. Los capitulos de evaluacion nunca se incluyen en el conjunto de entrenamiento y el texto de las novelas no se publica.

## Capacidades

- Atribucion de hablante por linea: identifica quien pronuncia un parlamento o pensamiento interno en una novela vietnamita, devolviendo un JSON con el campo `speaker`.
- Uso de contexto narrativo: aprovecha los parrafos circundantes y el historial de hablantes ya asignados para resolver la referencia.
- Robustez ante historial erroneo: entrenado explicitamente para mantener la precision cuando las asignaciones previas contienen errores.
- Salida estructurada: responde con el esquema `{"speaker": string}` exigido por ABook, con temperatura 0 y semilla 0 recomendadas.
- Integracion con Ollama: se empaqueta con un `Modelfile` y se crea mediante `ollama create abook-speaker:v2 -f Modelfile`.
- Clasificacion de tipo de linea: la model card indica que el tipo de linea (narracion, dialogo, pensamiento) lo determina el modelo de analisis (`abook-analyzer:v5`), no este modelo.
- Capacidades generales de Qwen3-4B: conserva el potencial de generacion de texto y razonamiento de la base, aunque el ajuste esta orientado exclusivamente al prompt de ABook.
- Multilingue: limitado al vietnamita para la tarea objetivo; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Produccion de audiolibros con multiples voces: el modelo asigna cada parlamento a un personaje para que un motor TTS sintetice cada voz por separado; el contexto de 16.384 tokens permite procesar escenas largas con muchos personajes.
- Desambiguacion en dialogos densos: en novelas con conversaciones sin acotaciones del tipo "dijo X", el modelo infiere el hablante a partir de los parrafos vecinos y del historial de turnos.
- Correcion de pipelines existentes: al tolerar historiales con errores, puede integrarse como segunda pasada sobre asignaciones heuristicas previas sin exigir que estas sean perfectas.
- Preprocesado de corpus literarios: etiquetado de dialogos para estudios de estilo, analisis de personajes o construccion de datasets anotados de narrativa vietnamita.
- Herramientas de lectura asistida: resaltado o coloreado por personaje en lectores de ebooks, mejorando la comprension de escenas con muchos interlocutores.
- Despliegue local en estaciones de trabajo: al caber en una GPU de 8 GB y exportarse a GGUF, permite procesar novelas completas en equipos de consumo sin depender de la nube.
- Integracion en ABook Studio: el flujo oficial descarga el modelo y lo ejecuta automaticamente dentro de la aplicacion, sin configuracion manual.

## Benchmarks y rendimiento

La model card reporta la exactitud de atribucion de hablante por voz, tras la normalizacion de nombres de la aplicacion, sobre 56 capitulos no vistos (44 novelas), comparando v1 y v2 con el mismo prompt, el mismo modelo de analisis (v5) y el historial autogenerado por el propio modelo.

| Conjunto de evaluacion | v1 | v2 | Diferencia |
|---|---|---|---|
| 56 capitulos, maquina de desarrollo (GPU 8 GB) | 79,11 | 81,40 | +2,30 |
| Subconjunto de 19 capitulos, maquina de desarrollo | 81,17 | 82,98 | +1,81 |
| 56 capitulos, segunda maquina (Mac mini) | 78,55 | 81,36 | +2,81 |

El intervalo de confianza del 95 % (bootstrap por novela) de la diferencia frente al control entrenado con la misma receta pero sin ruido en el historial es [+0,51; +3,80]. No se publican resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB para la cuantizacion Q8_0 (3,99 GiB de pesos mas contexto de 16.384 tokens y overhead de inferencia); el autor confirma funcionamiento en tarjetas NVIDIA de 8 GB.
- GPU recomendadas: cualquier NVIDIA con 8 GB o mas; no se especifican modelos concretos.
- GPU de consumo: si, cabe en tarjetas de 8 GB; el autor valido tambien una segunda maquina tipo Mac mini.
- Opciones de despliegue: Ollama (flujo documentado con `Modelfile`); el formato GGUF permite tambien llama.cpp y otros motores compatibles, aunque no se documentan explicitamente.
- Latencia y throughput: no disponibles; el autor afirma que la velocidad es la misma que la de v1, sin cifras.
- Parametros de inferencia: `"think": false`, `format` con el esquema `{"speaker": string}`, temperatura 0, semilla 0, `num_ctx` 16.384.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. La unica comparacion documentada es con la version anterior del propio modelo:

| Modelo | Parametros | Contexto | Exactitud (56 capitulos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abook-speaker v1 | 4.000 M (base Qwen3-4B) | no disponible | 79,11 | Apache-2.0 | Hugging Face (version previa) |
| abook-speaker v2 | 4.022 M | 16.384 | 81,40 | Apache-2.0 | Hugging Face, GGUF |
| Alternativas genericas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion estrecha: solo funciona con el prompt y el esquema exactos de ABook; el autor advierte que con otras formulaciones no hay garantia de resultado.
- Dependencia de pipeline: debe usarse junto con `abook-analyzer:v5` para la clasificacion del tipo de linea; no es autonomo.
- Idioma: solo se ha entrenado y evaluado en vietnamita; no se documenta comportamiento en castellano ni en otros idiomas.
- Exactitud no perfecta: ronda el 81 % en el conjunto de evaluacion, por lo que persisten errores de atribucion en aproximadamente una de cada cinco lineas.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir nombres de hablante no presentes en la obra; el esquema JSON restringe el formato pero no el contenido.
- Sesgos: no se documentan analisis de sesgos; el modelo hereda los de Qwen3-4B-Instruct-2507 y los del corpus literario de entrenamiento, que no se publica.
- Datos de entrenamiento no distribuidos: el texto de las novelas no se libera, lo que limita la reproducibilidad completa del ajuste.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de la base Qwen3-4B-Instruct-2507 y de las obras literarias procesadas.
- Madurez: el repositorio tiene pocas descargas (199) y ningun "like", lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGDtuanh/abook-analyzer
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de ABook: https://github.com/ntanhpro1221/ABook
- Checksum SHA-256 del GGUF Q8_0: `813031b68a16c04032cc776341b0369dbec7adef66a28c2488b37fcdd376520a`
