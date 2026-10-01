# 1of2/speaker-diarization-coreml

## Resumen

Speaker Diarization for Core ML es un paquete de modelos de diarización de hablantes (identificar "quién habla y cuándo") convertidos al formato Core ML de Apple y optimizados para el Neural Engine. No es un modelo de lenguaje: es un pipeline de audio compuesto por segmentación de hablantes basada en powerset, embeddings de hablante WeSpeaker ResNet y agrupamiento VBx con puntuación PLDA. Deriva del modelo pyannote/speaker-diarization-community-1 y lo publica el usuario 1of2 como copia fijada (*pinned*) de la conversión original de FluidInference en la revisión `1ed7a662fdc7109e36d822db793ee6eebdaf8594`.

El problema que resuelve es la diarización en local sobre hardware Apple: procesa audio mono a 16 kHz en ventanas de 10 segundos (160.000 muestras) y genera etiquetas anónimas de hablante. Al modelar la voz y no las palabras, funciona con cualquier idioma. La conversión mantiene el rendimiento del pipeline original en PyTorch con una deriva de DER y JER de aproximadamente el 1 %, y acelera la inferencia unas 10 veces en CPU y 20 veces en GPU respecto a la referencia.

Es relevante para desarrolladores de apps de macOS e iOS que necesitan transcripción con separación de interlocutores sin enviar audio a la nube. El repositorio ocupa 0,1 GB y requiere macOS 14 o iOS 17 en adelante, con Apple Silicon recomendado. El número de parámetros y el contexto no están documentados en la información disponible, ya que se trata de componentes de audio y no de un modelo generativo con ventana de contexto textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segmentacion de hablantes con powerset (log-probabilidades), embeddings WeSpeaker ResNet y agrupamiento VBx con puntuacion PLDA; exportada a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de audio de 10 s (160.000 muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | agnostico al idioma (modela la voz, no las palabras) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlmodelc` y `.mlpackage`) |
| Entrada de audio | mono, 16 kHz, Float32 |
| Tamano del repositorio | 0,1 GB |
| Requisitos de sistema | macOS 14 o posterior, o iOS 17 o posterior |

## Arquitectura y entrenamiento

El pipeline combina tres componentes. El primero es un modelo de segmentacion entrenado con perdida de entropia cruzada multiclase sobre powerset (Plaquet y Bredin, INTERSPEECH 2023), que produce log-probabilidades para hasta 3 hablantes locales. El segundo es un extractor de embeddings de hablante WeSpeaker ResNet (Wang et al., ICASSP 2023) que genera vectores de 256 dimensiones. El tercero es un agrupamiento bayesiano VBx sobre secuencias de x-vectors con puntuacion PLDA (Landini et al., 2022). Sobre este esquema, la conversion a Core ML reorganiza los grafos para ejecutarse en el Neural Engine.

Se ofrecen dos rutas. La *streaming* desliza ventanas de 10 s sobre `pyannote_segmentation.mlmodelc` (entrada `audio` [1, 1, 160000]; salida `segments` [1, 589, 7]) y `wespeaker_v2.mlmodelc` (entradas `waveform` [3, 160000] y `mask` [3, 589]; salida `embedding` [3, 256]), enlazando hablantes entre ventanas por similitud coseno de los embeddings. La *offline* (VBx) usa `Segmentation.mlmodelc` con lotes de 32 ventanas, `FBank.mlmodelc` (80 bins mel), `Embedding.mlmodelc`, `PldaRho.mlmodelc` y los ficheros `plda-parameters.json` y `xvector-transform.json`. No se detallan en la informacion disponible el numero de tokens de audio de entrenamiento ni la composicion exacta del dataset, que corresponden al modelo original de pyannote.

## Capacidades

- Diarizacion de hablantes: identifica quien habla y cuando, con etiquetas anonimas por hablante.
- Segmentacion de hablantes con powerset para hasta 3 hablantes activos simultaneos dentro de una ventana de 10 s.
- Extraccion de embeddings de hablante de 256 dimensiones con WeSpeaker ResNet.
- Deteccion de actividad de voz (pipeline declarado como `voice-activity-detection`).
- Procesamiento multilingue: funciona con cualquier idioma al modelar la voz.
- Dos modos de operacion: streaming por ventanas deslizantes y offline con agrupamiento VBx para grabaciones completas.
- Ejecucion en el Neural Engine de Apple Silicon, con soporte de macOS 14+ e iOS 17+.
- Etiquetado nominal opcional de hablantes si el llamante aporta embeddings de enrolamiento (no incluidos en el repositorio).

## Casos de uso

- Transcripcion de reuniones con separacion de interlocutores: combinar el pipeline de diarizacion con un motor ASR en local para obtener actas donde cada turno queda atribuido a un hablante, sin salir del dispositivo.
- Subtitulado de entrevistas y podcasts: la ruta offline con VBx agrupa hablantes a lo largo de una grabacion completa y ofrece la mejor precision para contenido ya grabado.
- Notas de voz y dictado en apps iOS: la ruta de streaming permite etiquetar hablantes en tiempo real en un iPhone o iPad compatible con Neural Engine.
- Analisis de llamadas de atencion al cliente: segmentar conversaciones agente-cliente para calcular tiempos de habla por rol y detectar solapamientos.
- Investigacion en ciencias sociales o linguistica: obtener turnos de habla anonimizados de corpus de audio de campo para estudiar patrones de interaccion.
- Indexacion y busqueda de archivos de audio: generar metadatos de quien habla y cuando para permitir busquedas por hablante en archivos de entrevistas o juicios.
- Sistemas de reunion con reconocimiento de participantes: usar embeddings de enrolamiento aportados por el llamante para asignar nombres reales a las etiquetas anonimas.
- Preprocesado de datasets de voz: separar automaticamente hablantes antes de entrenar otros modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la conversion mantiene una deriva de DER (Diarization Error Rate) y JER (Jaccard Error Rate) de aproximadamente el 1 % respecto al pipeline original en PyTorch, y remite al modelo pyannote original para los valores de DER publicados.

| Metrica | Valor reportado |
|---|---|
| Deriva de DER/JER frente a PyTorch | aproximadamente 1 % |
| Aceleracion en CPU frente a PyTorch | aproximadamente 10x |
| Aceleracion en GPU frente a PyTorch | aproximadamente 20x |
| DER absoluto | no disponible (remite a pyannote/speaker-diarization-community-1) |
| MMLU, HumanEval, GSM8K | no aplica (modelo de audio, no de lenguaje) |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (recomendado); el paquete esta disenado para Core ML.
- Sistema operativo: macOS 14 o posterior, o iOS 17 o posterior.
- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que el conjunto de pesos es reducido.
- GPU compatibles: no disponible; el modelo apunta a GPU y Neural Engine de Apple, no a GPU de NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no aplica a RTX 4090, A100 o H100, ya que el formato Core ML esta orientado a hardware Apple.
- Opciones de despliegue: framework Core ML en apps de macOS/iOS, mediante `mlmodelc`/`mlpackage`; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica 10x mas rapido que PyTorch en CPU y 20x en GPU, sin cifras absolutas de latencia.
- Descarga: `hf download 1of2/speaker-diarization-coreml --local-dir speaker-diarization-coreml`.

## Comparativa con modelos similares

| Modelo | Formato | Base | Licencia | Disponibilidad |
|---|---|---|---|---|
| 1of2/speaker-diarization-coreml | Core ML | pyannote/speaker-diarization-community-1 | CC BY 4.0 | HuggingFace (copia fijada) |
| FluidInference/speaker-diarization-coreml | Core ML | pyannote/speaker-diarization-community-1 | CC BY 4.0 | HuggingFace (conversion original) |
| pyannote/speaker-diarization-community-1 | PyTorch | pipeline pyannote community-1 | CC BY 4.0 | HuggingFace |

La diferencia principal entre las tres opciones es el entorno de ejecucion: las dos primeras son byte a byte identicas y solo cambia la model card, mientras que la version de pyannote funciona en PyTorch sin la aceleracion especifica de Core ML. No se dispone de datos de parametros, contexto ni benchmarks comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite hasta 3 hablantes activos dentro de una misma ventana de 10 s; el numero total de hablantes de una grabacion no tiene limite.
- La principal fuente de error es el habla fuertemente solapada y los turnos muy cortos, por debajo de aproximadamente medio segundo.
- Las etiquetas de hablante son anonimas; para ponerles nombre se necesitan embeddings de enrolamiento aportados por el llamante.
- Al ser un modelo de audio, no genera texto ni razona: requiere un sistema ASR externo si se quiere transcripcion.
- La informacion disponible no detalla sesgos por acento, genero o idioma mas alla de la afirmacion de agnosticismo linguistico.
- No se documentan tipos de cuantizacion ni el impacto de la conversion en la precision mas alla de la deriva del 1 % en DER/JER.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya la autoria, con los creditos a pyannote y a FluidInference indicados en la model card.
- El uso esta restringido al ecosistema Apple: no es ejecutable en Linux, Windows ni GPU de NVIDIA sin reconversion.
- El repositorio fue creado y actualizado el 1 de octubre de 2026 y no registra descargas ni likes, por lo que carece de validacion de la comunidad.
- Existen ficheros `.mlmodelc` de exportaciones anteriores conservados por compatibilidad, lo que puede confundir sobre cual es la version recomendada.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/1of2/speaker-diarization-coreml
- Conversion original: https://huggingface.co/FluidInference/speaker-diarization-coreml
- Modelo base: https://huggingface.co/pyannote/speaker-diarization-community-1
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper powerset (Plaquet y Bredin, INTERSPEECH 2023): https://doi.org/10.21437/Interspeech.2023 (referencia bibliografica de la model card)
- Paper WeSpeaker (Wang et al., ICASSP 2023): https://doi.org/10.1109/ICASSP49357.2023 (referencia bibliografica de la model card)
- Paper VBx (Landini et al., Computer Speech & Language, 2022): https://doi.org/10.1016/j.csl.2022 (referencia bibliografica de la model card)
