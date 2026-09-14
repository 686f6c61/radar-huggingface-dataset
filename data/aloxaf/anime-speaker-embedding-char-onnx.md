# aloxaf/anime-speaker-embedding-char-onnx

## Resumen

Anime Speaker Embedding char — ONNX es una conversion a formato ONNX del modelo de embeddings de hablante `litagin/anime_speaker_embedding_ecapa_tdnn_groupnorm` en su variante **char**, especializada en audio de anime y novelas visuales. No se trata de un modelo entrenado de nuevo, sino de una conversion de formato realizada por el usuario aloxaf: el peso subyacente y la documentacion original pertenecen a litagin02. El modelo toma una forma de onda de audio mono a 16 kHz en `float32` y devuelve un embedding de hablante de 192 dimensiones normalizado en L2.

El problema que resuelve es concreto: los sistemas genericos de reconocimiento de hablante (entrenados sobre VoxCeleb y corpus similares) rinden peor en voces sinteticas o estilizadas de anime, donde un mismo actor de doblaje puede interpretar a varios personajes con timbres distintos y donde el audio suele estar muy procesado. La variante **char** prioriza distinguir personajes individuales, incluso cuando comparten actor de voz, frente a la variante **va** (voice actor), que es menos agresiva a la hora de separar interlocutores.

Su relevancia actual es practica: al exportarse a ONNX (opset 18), el grafo incluye la normalizacion de amplitud, el escalado `×32768`, las caracteristicas Fbank de SpeechBrain, el backbone ECAPA-TDNN con GroupNorm y la normalizacion L2 final, de modo que la inferencia no requiere ni PyTorch ni SpeechBrain. Esto lo hace apto para despliegue ligero en CPU dentro de pipelines de diarizacion, indexado o recuperacion por personaje en produccion audiovisual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN con GroupNorm (backbone de embeddings de hablante) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; acepta formas de onda de longitud dinamica (exportado con batch size 1) |
| Tipos de cuantizacion | no disponible; el grafo exportado opera en `float32` |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

El modelo es una conversion de formato, no un entrenamiento nuevo. El backbone es una red ECAPA-TDNN con normalizacion por grupos (GroupNorm), la misma familia empleada habitualmente en verificacion de hablante (embeddings de 192 dimensiones). El grafo ONNX encapsula todo el preprocesado necesario para pasar de la onda cruda al embedding final: normalizacion de amplitud, escalado original `×32768`, extraccion de caracteristicas Fbank de SpeechBrain, el backbone ECAPA-TDNN y la normalizacion L2 de salida. La decodificacion de audio y el remuestreo quedan fuera del grafo, por lo que el usuario debe entregar audio ya decodificado a 16 kHz mono.

Tecnicamente, la novedad de esta conversion esta en la forma de exportar. El STFT original de SpeechBrain devuelve un tensor complejo y luego lo convierte a valores reales; el exportador ONNX heredado de PyTorch 2.8 no podia exportar esa ruta, de modo que la conversion emplea la salida equivalente `torch.stft(return_complex=False)` antes del Fbank y el backbone sin cambios. El entorno de exportacion declarado es `anime-speaker-embedding==0.2.1`, `torch==2.8.0`, `speechbrain==1.1.1` y `onnx==1.19.1`. En cuanto a datos de entrenamiento (numero de tokens o de horas, composicion del dataset, uso de RLHF o DPO), no disponible en la informacion proporcionada; esos detalles pertenecen al autor original (litagin02).

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones normalizados en L2 a partir de audio mono a 16 kHz.
- Distincion de personajes de anime o novela visual de forma especifica (variante char), incluso cuando comparten actor de voz.
- Verificacion e identificacion de hablante mediante similitud coseno entre embeddings.
- Recuperacion y agrupamiento de segmentos por personaje (base para diarizacion o indexado por hablante).
- Inferencia sin PyTorch ni SpeechBrain en tiempo de ejecucion, gracias al grafo ONNX autonomo.
- Procesamiento en CPU mediante ONNX Runtime (`CPUExecutionProvider`).
- No dispone de tool calling, razonamiento multi-paso, modo thinking, vision ni audio generativo: su única funcion es producir embeddings de hablante.
- Soporte multilingue limitado al japones como idioma declarado; no disponible informacion sobre su comportamiento en otros idiomas.

## Casos de uso

- Diarizacion de anime y novelas visuales: el modelo permite separar por personaje los turnos de voz de un episodio, algo que los sistemas genericos entrenados en VoxCeleb no resuelven bien con voces estilizadas o procesadas.
- Indexado y busqueda por personaje en archivos de audio: extrayendo embeddings de cada clip y comparandolos por similitud coseno, se puede construir un catalogo consultable por personaje.
- Etiquetado y curaduria de datasets de voz para doblaje o sintesis TTS: el embedding sirve como firma para agrupar y validar clips atribuidos a un mismo personaje.
- Verificacion de coherencia de voz en doblaje: comparar el embedding de una toma nueva contra las referencias de un personaje para detectar cambios de interprete no previstos.
- Post-procesado de pipelines de subtitulado o transcripcion: asignar hablante a cada segmento para generar subtitulos con identificacion de personaje.
- Deteccion de cambios de hablante en tiempo (quien habla y cuando) en un flujo continuo, alimentando el embedding clip a clip.
- Despliegue en produccion sobre CPU: al no requerir PyTorch ni SpeechBrain, el grafo ONNX se puede incrustar en servicios ligeros o en herramientas de escritorio para procesar audio localmente sin GPU.

## Benchmarks y rendimiento

Los valores que siguen provienen de la validacion descrita en la propia model card de la conversion; no son benchmarks publicos de terceros.

| Prueba | Resultado |
|---|---|
| Fidelidad maxima (gap de coseno) frente a PyTorch, sobre 372 clips de anime | 1.19e-7 |
| Recuperacion dentro de proyecto (29 personajes etiquetados, 194 consultas): Recall@1 / @2 / @4 ONNX | 154 / 169 / 178 |
| Recuperacion dentro de proyecto: Recall@1 / @2 / @4 PyTorch | 154 / 169 / 178 (identico al de ONNX) |
| Rangos por consulta ONNX vs PyTorch | identicos |
| Tiempo de procesado (372 clips, Intel Core i9-13900HX, 4 hilos) | 19.262 s ONNX vs 18.443 s PyTorch (primera ejecucion) |
| Tiempo de procesado (segunda ejecucion) | 19.436 s ONNX vs 19.026 s PyTorch |

El autor indica que la ruta ONNX resulto entre un 2 y un 4 por ciento mas lenta que PyTorch en estas dos ejecuciones sobre esa CPU concreta. La medicion incluia preprocesado e inferencia, pero excluia la decodificacion de audio, las importaciones y la carga del modelo. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa aproximadamente 0.1 GB.
- VRAM: no disponible; no se ha publicado una estimacion de memoria de GPU. Al ser un modelo pequeno de embeddings, es probable que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Inferencia en CPU: confirmada con ONNX Runtime usando `CPUExecutionProvider`. En un Intel Core i9-13900HX con 4 hilos se procesaron 372 clips en torno a 19 segundos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`); el grafo no requiere PyTorch ni SpeechBrain en inferencia.
- Latencia y throughput: el unico dato medido es el tiempo agregado indicado arriba (aprox. 19 s para 372 clips en la CPU citada), sin que se haya publicado throughput por segundo ni latencia por clip.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aloxaf/anime-speaker-embedding-char-onnx (este) | Conversion ONNX de un ECAPA-TDNN con GroupNorm | Embedding L2 de 192 dim | japones | MIT | HuggingFace |
| litagin/anime_speaker_embedding_ecapa_tdnn_groupnorm | Modelo original (pesos `.pth`) | Embedding de 192 dim | japones | segun model card original | HuggingFace |
| Variante VA (voice actor) de anime_speaker_embedding | ECAPA-TDNN, variante menos discriminativa | Embedding de hablante | japones | segun repositorio original | HuggingFace / GitHub |
| Sistemas genericos tipo VoxCeleb | Embeddings de hablante de proposito general | Embedding de hablante | multilingue | varia | publica |

La diferencia principal frente al modelo original es el formato: este repositorio entrega ONNX listo para inferencia sin dependencias de PyTorch ni SpeechBrain, mientras que el original distribuye pesos `.pth`. Frente a la variante VA, la variante char (la convertida aqui) separa mas agresivamente personajes distintos aunque compartan actor de voz. Frente a los sistemas genericos entrenados en VoxCeleb, la ventaja declarada es el dominio: audio de anime y novela visual. No se dispone de cifras comparativas de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La validacion de recuperacion usa etiquetas de personaje generadas por un sistema automatico, no verificadas de forma independiente; el propio autor advierte que esa prueba no establece exactitud de identificacion de hablantes anonimos.
- El modelo entrega embeddings, no transcripciones ni texto: no realiza reconocimiento de habla ni generacion.
- El grafo incluye normalizacion de amplitud y el escalado `×32768`; audio con niveles anomalos puede degradar la calidad del embedding.
- La decodificacion de audio y el remuestreo quedan fuera del grafo: hay que entregar `float32` mono a 16 kHz, con el preprocesado que corresponda.
- Exportado y validado con batch size 1; no hay evidencia de rendimiento con lotes mayores.
- Solo se declara soporte para japones; el comportamiento en otros idiomas no esta documentado.
- Posible discrepancia de licencia: la model card de esta conversion afirma que el modelo original esta marcado como MIT, pero el repositorio `litagin/anime_speaker_embedding` figura como GPL-3.0 en HuggingFace. Conviene verificar la licencia del peso de origen antes de un uso comercial.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera texto; el riesgo equivalente es la asignacion erronea de un mismo hablante a dos personajes o viceversa.
- La medicion de rendimiento procede de una unica CPU (Intel Core i9-13900HX) y de dos ejecuciones; no se ha caracterizado en otro hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aloxaf/anime-speaker-embedding-char-onnx
- Modelo original en HuggingFace: https://huggingface.co/litagin/anime_speaker_embedding_ecapa_tdnn_groupnorm
- Repositorio general de anime_speaker_embedding: https://huggingface.co/litagin/anime_speaker_embedding
- Repositorio GitHub del autor original: https://github.com/litagin02/anime_speaker_embedding
- Documentacion en DeepWiki: https://deepwiki.com/litagin02/anime_speaker_embedding
- Variante char en DeepWiki: https://deepwiki.com/litagin02/anime_speaker_embedding/5.1-character-focused-(char)-model
- README del repositorio: https://github.com/litagin02/anime_speaker_embedding/blob/main/README.md
