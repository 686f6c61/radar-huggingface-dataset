# FORNstudio/eckermann

## Resumen

`FORNstudio/eckermann` no es un modelo entrenado por su autor, sino un repositorio de distribucion que empaqueta los tres artefactos que descarga la aplicacion de dictado Eckermann en su primera ejecucion: un modelo de reconocimiento de voz en danes (Edda v0.2, convertido a GGML y cuantizado a q8_0), un detector de actividad de voz (Silero VAD v6.2.0, sin modificar) y un modelo BERT de restauracion de puntuacion y mayusculas para danes (`punct-da`, en safetensors f16). El repositorio lo publica FORNstudio y la aplicacion cliente fija cada fichero por commit y SHA-256, de modo que el valor principal aqui es la trazabilidad y la reproducibilidad de la cadena de inferencia, no la novedad algorítmica.

El componente principal, Edda v0.2, procede del Alexandra Institute en el marco del proyecto CoRal y se apoya en `openai/whisper-large-v3-turbo` (MIT) como modelo base; el de puntuacion deriva de `Alvenir/bert-punct-restoration-da`, construido a su vez sobre `Maltehb/danish-bert-botxo` de BotXO. Todo el conjunto esta orientado a un unico idioma, el danes, y a un caso de uso muy concreto: transcripcion de voz a texto en local con texto legible (puntuado y con mayusculas) para una aplicacion de escritorio.

Su relevancia es practica: ofrece una via sencilla de obtener un pipeline ASR + VAD + puntuacion completamente offline y con licencias permisivas para un idioma con poca cobertura comercial, con el repositorio completo ocupando 1,1 GB. No debe evaluarse como un LLM: no genera texto libre, no razona y no soporta tool calling. A fecha de la informacion disponible acumula 0 descargas y 0 likes, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de tres componentes: ASR transformer encoder-decoder (Edda v0.2, derivado de `openai/whisper-large-v3-turbo`), detector de actividad de voz Silero VAD v6.2.0 y modelo BERT de etiquetado de tokens para puntuacion y mayusculas (`punct-da`, derivado de `danish-bert-botxo`) |
| Parametros totales | no disponible (no se declara el recuento de parametros de ningun componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica la ventana de audio ni la longitud maxima de secuencia de `punct-da`) |
| Tipos de cuantizacion | q8_0 en el fichero GGML de Edda; f16 en los safetensors de `punct-da`; precision no declarada en el binario de Silero VAD |
| Idiomas soportados | danes (`da`) en ASR y puntuacion; Silero VAD es independiente del idioma |
| Licencia | Mixta (`mixed`, `license: other`): Apache 2.0 para Edda v0.2 y `punct-da`; MIT para Silero VAD; el BERT base `danish-bert-botxo` es CC BY 4.0 |
| Formato de pesos | GGML (`.bin`) para Edda y Silero VAD; safetensors para `punct-da` |
| Componentes incluidos | `ggml-edda-v0.2-q8_0.bin`, `ggml-silero-v6.2.0.bin`, `punct-da/` |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: agrega artefactos ya existentes y documenta su procedencia con commits concretos. Edda v0.2 se convirtio con `models/convert-h5-to-ggml.py` del proyecto whisper.cpp en el commit `231638a` y despues se cuantizo con `whisper-quantize` en modo `q8_0`; el resultado es un binario GGML consumible por whisper.cpp y compatible con el ecosistema ggml. Silero VAD v6.2.0 se copia tal cual desde `ggml-org/whisper-vad`, sin modificacion. El modelo `punct-da` se exporta a safetensors f16 mediante el script `bench/punct_model.py` del propio repositorio de Eckermann, a partir de los pesos publicados por Alvenir.

En cuanto a datos de entrenamiento, no hay informacion en la model card: no se indican tokens, composicion del corpus, tecnicas de alineacion (RLHF/DPO) ni proceso de anotacion. Lo unico inferible es la cadena de dependencias: Edda parte de `whisper-large-v3-turbo` y se afina en el contexto del proyecto CoRal del Alexandra Institute; `punct-da` se apoya en un BERT danes preentrenado por BotXO. La innovacion tecnica destacable no esta en el modelado sino en la ingenieria de distribucion: fijacion por commit y verificacion SHA-256 de cada fichero, y una cadena ASR + VAD + restauracion de puntuacion ejecutable en local sin dependencias de red.

## Capacidades

- Reconocimiento de voz en danes a partir de audio, con salida de texto plano (componente Edda, sobre Whisper large-v3-turbo).
- Deteccion de actividad de voz para segmentar audio y evitar transcripciones sobre silencios o ruido (Silero VAD v6.2.0).
- Restauracion de puntuacion y mayusculas sobre texto sin formato, tipica salida de un ASR (componente `punct-da`).
- Ejecucion completamente local y offline, sin llamadas a servicios externos.
- Integracion con whisper.cpp mediante ficheros GGML, lo que permite inferencia en CPU ademas de GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales mas alla del audio de entrada: sin vision, sin generacion de texto libre, sin capacidades de codigo o matematicas.
- Cobertura multilingue limitada al danes en los componentes linguisticos.

## Casos de uso

- Dictado de escritorio en danes: es el caso de uso de diseno. La aplicacion Eckermann captura microfono, aplica VAD para recortar la locucion, transcribe con Edda y restaura puntuacion con `punct-da` antes de insertar el texto en el campo activo.
- Transcripcion de reuniones y notas de voz en danes: el pipeline ASR + puntuacion produce texto legible sin necesidad de postprocesado manual, y el VAD permite trocear grabaciones largas en segmentos con voz.
- Generacion de subtitulos offline: el caracter local del conjunto evita enviar audio a terceros, lo que resulta adecuado para material subject to confidencialidad (entrevistas, sesiones clinicas, grabaciones internas).
- Preprocesado de corpus en danes: `punct-da` puede reutilizarse de forma independiente para reponer mayusculas y puntuacion en transcripciones sin formato antes de usarlas como datos de entrenamiento o para indexacion.
- Asistentes de voz con requisito de privacidad: al no requerir red, el conjunto encaja en despliegues de escritorio o en entornos con restricciones de salida de datos.
- Segmentacion de audio en pipelines propios: el binario de Silero VAD en formato ggml puede emplearse por separado para detectar turnos de habla antes de invocar cualquier motor ASR.
- Busqueda sobre archivo audiovisual en danes: transcripcion local de un catalogo de audio y posterior indexacion del texto puntuado para busqueda por palabras clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, metricas de restauracion de puntuacion ni comparaciones con otros sistemas, y el repositorio no aporta scripts de evaluacion mas alla del propio `bench/punct_model.py` usado para exportar los pesos.

## Requisitos de hardware

- VRAM estimada: no declarada por el autor. Como referencia de orden de magnitud, el repositorio completo ocupa 1,1 GB y el binario ASR en q8_0 es el componente mayoritario, de modo que el conjunto deberia residir en torno a 1-2 GB de memoria en inferencia (estimacion a partir del tamano del repo, no confirmada).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia acomodar el pipeline; no hay recomendaciones oficiales de A100, H100 o RTX 4090 en la documentacion disponible.
- GPU de consumo: si, el conjunto esta disenado para ejecutarse en equipos de escritorio; el uso de q8_0 en el ASR apunta precisamente a ese escenario.
- CPU: viable mediante whisper.cpp, que es el runtime implicito del formato GGML distribuido.
- Opciones de despliegue: whisper.cpp para Edda y Silero VAD; para `punct-da` sera necesario un runtime que cargue safetensors (PyTorch/Transformers, ONNX u otro). vLLM, TGI y Ollama no son aplicables al componente ASR en GGML orientado a whisper.cpp.
- Latencia y throughput: no disponibles. Dependen del hardware, del backend y de la duracion del audio; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FORNstudio/eckermann` | Conjunto ASR + VAD + puntuacion en GGML/safetensors | no disponible | da | Mixta (Apache 2.0 / MIT / CC BY 4.0 en el base) | HuggingFace, 1,1 GB |
| `danish-foundation-models/edda-v0.2` | ASR (origen del componente Edda) | no disponible | da | Apache 2.0 | HuggingFace |
| `openai/whisper-large-v3-turbo` | ASR (modelo base de Edda) | no disponible en la informacion | no detallado (modelo base de Whisper) | MIT | HuggingFace |
| `Alvenir/bert-punct-restoration-da` | Restauracion de puntuacion y mayusculas | no disponible | da | Apache 2.0 | HuggingFace |
| `snakers4/silero-vad` | Deteccion de actividad de voz | no disponible | independiente del idioma | MIT | GitHub / HuggingFace |

La diferencia frente a las alternativas no esta en calidad declarada, sino en el empaquetado: este repositorio entrega los tres eslabones ya convertidos y fijados por commit, mientras que los modelos de origen se distribuyen en sus formatos nativos (PyTorch/safetensors) y requieren conversion propia para usarse con whisper.cpp. No hay datos de rendimiento que permitan afirmar que la version cuantizada q8_0 conserva la precision del original.

## Limitaciones y advertencias

- No es un modelo unico: cualquier evaluacion debe hacerse componente a componente; heredar el nombre del repositorio como si fuese un modelo monolítico induce a error.
- Cobertura linguistica restringida al danes en ASR y puntuacion; no hay soporte declarado de castellano ni de otros idiomas.
- Errores en cascada: un fallo de transcripcion de Edda condiciona la restauracion de puntuacion de `punct-da`, que solo opera sobre el texto recibido.
- Riesgo de alucinacion del ASR en segmentos con silencio, ruido o musica; el VAD mitiga pero no elimina este comportamiento.
- Sin benchmarks publicados ni validacion de la comunidad (0 descargas, 0 likes), por lo que no hay evidencia externa de calidad en produccion.
- Licencia mixta: aunque los componentes principales son Apache 2.0 y MIT, el BERT base `danish-bert-botxo` es CC BY 4.0, lo que obliga a mantener la atribucion correspondiente si se redistribuye `punct-da`.
- Las fechas de creacion y actualizacion del repositorio (2026-10-26) son anomalas y deben verificarse antes de citarlas.
- Dependencia de un unico mantenedor (FORNstudio) y de la aplicacion Eckermann como consumidor principal; no hay garantia de soporte a largo plazo.
- Inaplicable a tareas de generacion de texto, razonamiento, codigo, agentes o vision.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FORNstudio/eckermann
- Aplicacion Eckermann (codigo fuente): https://github.com/bhark/eckermann
- Script de exportacion del modelo de puntuacion: https://github.com/bhark/eckermann/blob/main/bench/punct_model.py
- Modelo de origen Edda v0.2: https://huggingface.co/danish-foundation-models/edda-v0.2
- Modelo base de Whisper: https://huggingface.co/openai/whisper-large-v3-turbo
- Silero VAD en formato ggml: https://huggingface.co/ggml-org/whisper-vad
- Silero VAD (repositorio original): https://github.com/snakers4/silero-vad
- Modelo de puntuacion de origen: https://huggingface.co/Alvenir/bert-punct-restoration-da
- BERT danes base: https://huggingface.co/Maltehb/danish-bert-botxo
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
