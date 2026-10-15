# malaxy/whisper-large-v3-turbo-swiss-german-ct2

## Resumen

malaxy/whisper-large-v3-turbo-swiss-german-ct2 es una copia sin modificaciones de la conversion a CTranslate2 (carpeta `ct2/`) del modelo gcoli/whisper-large-v3-turbo-swiss-german-mit, publicada por el autor de Verbalis (malaxy25) para fijar una revision concreta y reproducible. No aporta pesos nuevos ni reentrenamiento: es un mirror de la revision `540fb2e` del repositorio original, con licencia MIT y 1,6 GB de tamano.

El modelo resuelve reconocimiento automatico del habla (ASR) en aleman (`de`) y aleman suizo (`gsw`), partiendo de OpenAI Whisper large-v3-turbo y afinado sobre corpus parlamentarios suizos (Swiss Parliaments Corpus de Berna y corpus de audio del Gemeinderat de Zúrich). Su relevancia practica esta en el ecosistema `faster-whisper`: al estar ya convertido a CTranslate2, se puede ejecutar en CPU con cuantizacion int8 sin pasos adicionales de conversion, algo poco habitual en fine-tunes de Whisper para aleman suizo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su proposito declarado es servir como modelo por defecto de Verbalis, que comprueba mensualmente si el repositorio original publica una revision mas reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de OpenAI), pesos convertidos a CTranslate2 |
| Parametros totales | no disponible en la informacion proporcionada (Whisper large-v3-turbo: en torno a 809 millones segun documentacion publica de OpenAI, no confirmado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de tokens de texto; Whisper procesa ventanas de audio de 30 segundos |
| Tipos de cuantizacion | El repositorio contiene la conversion a CTranslate2; faster-whisper admite `compute_type` float16, int8_float16, int8, entre otros. La model card no enumera las variantes incluidas |
| Idiomas soportados | `de` (aleman) y `gsw` (aleman suizo); el ejemplo de la model card usa `language="de"` |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin` y ficheros asociados); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo deriva de OpenAI Whisper large-v3-turbo, un transformer encoder-decoder para ASR que trabaja sobre representaciones mel y ventanas de audio de 30 segundos. La variante `turbo` de Whisper reduce el coste del decodificador respecto a large-v3, lo que se traduce en menor latencia de inferencia manteniendo el encoder. Sobre esa base, gcoli realizo un fine-tune para aleman suizo; malaxy publica despues la conversion de esos pesos a CTranslate2 sin alterar ficheros, lo que habilita su uso directo con faster-whisper.

Los datos de entrenamiento declarados son el Swiss Parliaments Corpus (Berna) de FHNW/i4ds y el corpus de audio del Gemeinderat de Zúrich, ambos con licencia MIT. Parte de las etiquetas procede de OpenAI Whisper large-v3 (Apache 2.0), lo que apunta a un esquema de pseudo-etiquetado o destilacion parcial. No se indican en la model card el numero de horas de audio, la composicion exacta del dataset, hiperparametros de entrenamiento ni si hubo etapas de ajuste adicionales; no hay RLHF ni DPO, ya que no son tecnicas aplicables a un modelo ASR de este tipo. Tampoco se documentan innovaciones de decodificacion propias mas alla de las que aporta CTranslate2 por si mismo.

## Capacidades

- Transcripcion de voz a texto en aleman estandar (`de`) y aleman suizo (`gsw`).
- Ejecucion en CPU con cuantizacion int8 mediante faster-whisper, tal como muestra el ejemplo de la model card (`device="cpu"`, `compute_type="int8"`).
- Integracion directa en pipelines que esperan un modelo CTranslate2, sin conversion intermedia desde safetensors.
- Segmentacion con marcas de tiempo y deteccion de idioma derivadas del propio motor faster-whisper (no verificadas en la model card para este fine-tune concreto).
- Capacidad multilingue general de la arquitectura base: no medida para este fine-tune; no disponible.
- Tool calling / function calling: no aplica, es un modelo de reconocimiento de voz.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Vision, audio generativo o modo "thinking": no disponibles.

## Casos de uso

- Transcripcion de debates parlamentarios y municipales suizos: el fine-tune se entreno especificamente sobre el Swiss Parliaments Corpus de Berna y el corpus del Gemeinderat de Zúrich, por lo que el registro formal parlamentario es el dominio de mejor ajuste esperado.
- Despliegue en servidores sin GPU: al distribuirse ya en CTranslate2 y funcionar con `compute_type="int8"` en CPU, permite montar un servicio de transcripcion en un VPS o en hardware modesto sin pasos de conversion.
- Modelo por defecto de Verbalis: el autor lo publica explicitamente para que su aplicacion (https://github.com/malaxy25/verbalis) consuma siempre esta revision concreta y probada, evitando cambios silenciosos aguas arriba.
- Generacion de subtitulos para contenido en aleman suizo: el modelo puede alimentar un pipeline de subtitulado con marcas de tiempo, siempre que el audio se acerque al registro de discurso parlamentario.
- Archivado e indexado de actas de ayuntamientos suizos: transcripcion masiva de grabaciones historicas para construir un indice buscable o un corpus textual sobre el que aplicar busqueda semantica.
- Preprocesado para analisis posterior (resumen, extraccion de temas, RAG): la salida de texto puede alimentar un LLM de resumen; el ASR se usa como primera etapa, con la advertencia de que Whisper puede omitir o inventar fragmentos.
- Accesibilidad en directo para reuniones en aleman suizo: transcripcion en tiempo casi real en entornos con acento dialectal zuriques o bernes, con la salvedad de que la propia model card no midio conversacion espontanea.
- Verificacion de fidelidad de transcripciones: al fijar una revision inmutable del modelo, sirve como referencia para comparar salidas de otras versiones de Whisper sobre el mismo audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original no incluye cifras de WER (word error rate) ni comparaciones cuantitativas con Whisper large-v3-turbo sin ajustar; solo menciona cualitativamente los limites del entrenamiento (discurso parlamentario de Berna y Zúrich). Existe un fichero `training_provenance.json` en el repositorio, pero su contenido no se ha facilitado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6 GB de pesos en float16 (coincide con el tamano del repositorio) y aproximadamente 0,9 GB en int8; a ello hay que sumar el overhead del runtime. Son estimaciones a partir del tamano del repositorio, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU CUDA con 2 GB o mas de memoria es suficiente en la practica; no se requiere A100/H100 ni VRAM de gama alta. Una RTX 4090, RTX 3090, RTX 3060 o incluso una GTX 1650 pueden ejecutarlo.
- Cabe en GPU de consumidor: si, en practicamente cualquier GPU dedicada moderna, y tambien en CPU (el ejemplo oficial usa `device="cpu"`).
- Opciones de despliegue: faster-whisper es la via documentada en la model card; CTranslate2 es la libreria subyacente y el tag del repositorio. Otras integraciones (WhisperX, servidores compatibles con CTranslate2) no estan confirmadas en la informacion disponible.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia, RTF ni throughput para CPU o GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malaxy/whisper-large-v3-turbo-swiss-german-ct2 | ASR, formato CTranslate2 | no disponible (base turbo) | de, gsw | MIT | HuggingFace, mirror, 0 descargas |
| gcoli/whisper-large-v3-turbo-swiss-german-mit | ASR, fine-tune original | no disponible | de, gsw | MIT | HuggingFace |
| openai/whisper-large-v3-turbo | ASR multilingue (base) | no disponible en la informacion proporcionada | multilingue | MIT | HuggingFace |
| openai/whisper-large-v3 | ASR multilingue | no disponible en la informacion proporcionada | multilingue | MIT | HuggingFace |

No se dispone de cifras de WER comparativas entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a licencia, idiomas y formato de distribucion. La ventaja diferencial de este repositorio frente al fine-tune original es exclusivamente el formato CTranslate2 listo para faster-whisper y la inmovilizacion de la revision.

## Limitaciones y advertencias

- Sesgo de dominio: el fine-tune se entreno con discurso parlamentario de Berna y Zúrich, por lo que el rendimiento fuera de ese registro (conversacion espontanea, jerga tecnica, otros cantones) no esta medido y puede degradarse.
- Cobertura dialectal parcial: la propia model card advierte de que la conversacion espontanea y otros dialectos del aleman suizo no se evaluaron durante el entrenamiento.
- Alucinacion: la model card original senala explicitamente que Whisper puede omitir texto o inventarlo. En produccion conviene validar las transcripciones, especialmente en audio con ruido o silencios largos.
- Ausencia de metricas: no hay WER publicado ni evaluacion independiente, lo que dificulta justificar la eleccion del modelo frente a Whisper large-v3-turbo generico sin una prueba propia.
- Muy baja adopcion: 0 descargas y 0 likes en el momento de la consulta; el soporte y el mantenimiento dependen de un unico autor.
- Naturaleza de mirror: al ser una copia de una revision concreta, no recibe mejoras del repositorio original automaticamente; cualquier actualizacion requiere que el autor publique una revision nueva.
- Licencia: MIT en todos los eslabones declarados (fine-tune, modelo base y corpora), lo que en principio permite uso comercial, pero la responsabilidad sobre el cumplimiento de las condiciones de los corpus de audio recae en quien despliega el modelo.
- Idiomas: fuera de `de` y `gsw` no hay garantia de calidad; no debe asumirse un comportamiento multilingue equivalente al de Whisper large-v3-turbo original.
- Codigo de idioma: el aleman suizo (`gsw`) no es un idioma estandarizado con ortografia unica, lo que complica la evaluacion objetiva de las transcripciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malaxy/whisper-large-v3-turbo-swiss-german-ct2
- Fine-tune original: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit
- Revision concreta copiada: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit/tree/540fb2e7a9135048963c5de9822579c96f8962e5
- Aplicacion Verbalis: https://github.com/malaxy25/verbalis
- Modelo base de OpenAI mencionado en la model card: OpenAI Whisper large-v3-turbo
- Libreria de inferencia: faster-whisper y CTranslate2 (referenciadas en la model card, sin URL explicita)
- Corpus de entrenamiento: FHNW/i4ds Swiss Parliaments Corpus (Berna) y Gemeinderat Zúrich Audio Corpus (mencionados, sin URL en la informacion disponible)
- Resultados de busqueda web: las consultas devolvieron unicamente paginas genericas de servicios de Google (Chrome, Flights, Traduccion, Maps, Trends), sin informacion relevante sobre el modelo.
