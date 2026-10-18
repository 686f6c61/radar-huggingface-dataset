# Allinsama/prj-beatrice__utmos22-torch-native

## Resumen

`Allinsama/prj-beatrice__utmos22-torch-native` es un predictor de calidad de voz (MOS, *Mean Opinion Score*) publicado en HuggingFace con pipeline `audio-classification`, aunque funcionalmente es un modelo de regresión sobre forma de onda. Se trata de un port del *strong learner* de UTMOS22 (Saeki et al., 2022) reescrito para depender unicamente de `torch`, `torchaudio` y `transformers`, tomando como referencia la implementacion de `tarepan/SpeechMOS`. El autor del repo es `Allinsama`, y la model card referencia el espacio `prj-beatrice/utmos22-torch-native`, por lo que conviene verificar cual es el repositorio canonico antes de fijar una version en produccion.

El modelo resuelve un problema muy concreto: estimar de forma automatica la calidad percibida de un clip de audio sin recurrir a paneles humanos. Con 101.723.265 parametros (unos 101,7 M) y un peso `safetensors` de 407 MB en un repo de 0,4 GB, es lo bastante pequeno como para ejecutarse en CPU o en cualquier GPU de consumo, lo que lo hace util para filtrar datasets, evaluar pipelines de TTS o monitorizar calidad en telefonia.

Su relevancia ahora es practica: elimina la dependencia de `torch.hub` y de codigo auxiliar externo, integra el modelo en el ecosistema `transformers` con `trust_remote_code=True` y expone una API por lotes con `input_lengths`. Ademas, un commit reciente mantiene la LSTM diferenciable sobre cuDNN, lo que permite usarlo como funcion de perdida en el entrenamiento de sistemas TTS. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UTMOS22 *strong learner*: codificador tipo wav2vec2 (`modeling_wav2vec2.py`) con cabecera LSTM y regresion de MOS; port nativo a `torch` + `transformers` |
| Parametros totales | 101.723.265 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio, no texto); el modelo acepta lotes con padding y `input_lengths` |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors`; sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`model.safetensors`, 407 MB) + codigo Python (`modeling_utmos22.py`, `modeling_wav2vec2.py`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde al *strong learner* descrito en el paper de UTMOS22: un codificador neuronal sobre la forma de onda (implementado aqui con una adaptacion de wav2vec2 incluida en el propio repo) seguido de una capa recurrente LSTM y una cabeza de regresion que produce una puntuacion escalar de MOS por clip. El modelo devuelve un objeto con atributo `.scores` y admite lotes padded mediante un tensor `[batch_size, max_length]` acompanado de `input_lengths` de forma `[batch_size]`. Un detalle relevante del repositorio es que la LSTM se mantiene diferenciable sobre cuDNN, lo que habilita el entrenamiento end-to-end a traves del predictor.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o horas de audio, la composicion del corpus ni la existencia de etapas de RLHF o DPO; la model card no los detalla y el modelo es un port de pesos, no un reentrenamiento. La validacion declarada por el autor consiste en un `torch.testing.assert_close` contra la implementacion de referencia `tarepan/SpeechMOS:v1.2.0` (`utmos22_strong`), es decir, se garantiza equivalencia numerica con el modelo original, no una mejora de rendimiento.

## Capacidades

- Prediccion de MOS sobre forma de onda de audio, con salida escalar por clip (regresion, no clasificacion discreta pese al `pipeline_tag`).
- Procesamiento por lotes con padding y longitudes reales (`input_lengths`), lo que permite evaluar corpus completos de forma eficiente.
- Integracion nativa con `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`.
- Compatibilidad numerica verificada con la implementacion de referencia de SpeechMOS (`utmos22_strong`, v1.2.0).
- Modo diferenciable (LSTM sobre cuDNN), utilizable como componente de una funcion de perdida durante el entrenamiento.
- Ejecucion en CPU y GPU sin dependencias de `torch.hub`.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio de entrada mas alla de la puntuacion de calidad.
- No se declaran capacidades multilingues.

## Casos de uso

- **Evaluacion automatizada de pipelines TTS**: puntuar cada clip sintetizado con el MOS predicho permite comparar checkpoints, vocoders o esquemas de normalizacion textual sin recurrir a test subjetivos en cada iteracion; el coste es minimo al caber en CPU.
- **Curacion de datasets de ASR y TTS**: filtrar grabaciones por debajo de un umbral de MOS antes de entrenar reduce ruido, clipping y reverberacion en el corpus; el soporte de lotes con `input_lengths` permite procesar miles de horas en paralelo.
- **Control de calidad en doblaje y audiolibros**: detectar tomas degradadas, microfonos mal nivelados o cortes en la cadena de grabacion antes de la publicacion, marcando clips para regrabacion.
- **Monitorizacion de calidad en VoIP y telefonia**: puntuar muestras de llamadas de forma periodica para detectar degradacion por codec, perdida de paquetes o cancelacion de eco, y activar alertas cuando el MOS cae por debajo de un umbral contractual.
- **Comparativas A/B de modelos de mejora de voz**: medir el efecto de un denoiser o un separador de fuentes comparando MOS antes y despues del procesado sobre el mismo conjunto de clips.
- **Regresion testing en CI/CD de audio**: incluir el modelo como test automatico que falle si la calidad media de un lote de referencia cae respecto a la linea base, igual que se hace con tests de imagen.
- **Funcion de perdida auxiliar en entrenamiento TTS**: al ser diferenciable, se puede incorporar la puntuacion MOS como termino adicional de la objective durante el fine-tuning de un sintetizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica validacion reportada es de equivalencia numerica: el autor afirma que la salida coincide con `tarepan/SpeechMOS:v1.2.0` (`utmos22_strong`) mediante `torch.testing.assert_close`, sin cifras de correlacion (SRCC, PCC, MSE) frente a juicios humanos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32 (101,7 M de parametros) y ~0,2 GB en fp16; el peso `safetensors` del repo ocupa 407 MB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso en GPUs de 4 GB o menos. Tambien es viable en CPU para clips de pocos segundos.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrian sentido para procesar corpus masivos en paralelo o si se usa como perdida diferenciable en entrenamiento.
- Despliegue: `transformers` con `trust_remote_code=True` es la via soportada; tambien funciona la ruta de referencia `torch.hub.load("tarepan/SpeechMOS:v1.2.0", "utmos22_strong")`. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama (no es un modelo generativo de texto y no se publican pesos GGUF). La exportacion a ONNX no esta documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada. A modo de referencia dimensional, el cuello de botella es la longitud del audio y el codificador convolucional, no el numero de parametros.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Allinsama/prj-beatrice__utmos22-torch-native` | Predictor MOS (wav2vec2 + LSTM) | 101,7 M | forma de onda, lotes con padding | MIT | HuggingFace, `transformers` con codigo remoto |
| `tarepan/SpeechMOS` (`utmos22_strong`) | Predictor MOS, implementacion de referencia de UTMOS22 | no disponible en la informacion | forma de onda | no disponible en la informacion | `torch.hub` |
| UTMOS22 original (sarulab-speech) | Predictor MOS, *strong learner* | no disponible en la informacion | forma de onda | no disponible en la informacion | Repositorio GitHub |
| NISQA | Predictor MOS multi-dimension (senal + bitrate) | no disponible en la informacion | forma de onda | no disponible en la informacion | Codigo abierto |
| DNSMOS (P.835) | Estimador de calidad por componente (SIG/BAK/OVL) | no disponible en la informacion | forma de onda | no disponible en la informacion | Codigo abierto |

La diferencia practica de este port frente a la referencia es de empaquetado, no de calidad: elimina `torch.hub` y expone la API de `transformers` con soporte de lotes y modo diferenciable. No se dispone de datos para comparar precision entre estas alternativas.

## Limitaciones y advertencias

- El modelo estima MOS de forma aprendida: correlaciona con juicios humanos, pero no sustituye una prueba de escucha formal para certificar calidad.
- Riesgo de sesgo de dominio: la model card no declara idiomas, tipos de voz, condiciones de grabacion ni corpus de entrenamiento, por lo que el comportamiento fuera del dominio original (musica, ruido extremo, voces sinteticas atipicas) es incierto.
- Fiabilidad no garantizada en clips muy cortos o muy largos, ni en audio con musica de fondo o multiples hablantes simultaneos.
- `trust_remote_code=True` implica ejecutar codigo Python del repositorio del autor; conviene fijar una revision concreta y auditar `modeling_utmos22.py` antes de desplegarlo en produccion.
- La model card usa el identificador `prj-beatrice/utmos22-torch-native`, distinto del ID real `Allinsama/prj-beatrice__utmos22-torch-native`; verificar cual es el espacio mantenido para evitar depender de un espejo.
- Senal de madurez baja: 12 descargas y 0 likes en el momento de la consulta, y el autor del port no es el autor original del modelo. No hay validacion independiente publicada.
- No hay variantes cuantizadas ni exportaciones ONNX publicadas, lo que limita el despliegue en runtimes ligeros.
- La licencia del modelo y del wrapper es MIT segun la model card; los terminos del repositorio original de UTMOS22 no se detallan en la informacion disponible y deberian verificarse si se redistribuye.
- El pipeline declarado es `audio-classification`, pero la salida es continua (regresion); las herramientas que esperan etiquetas discretas pueden comportarse de forma inesperada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Allinsama/prj-beatrice__utmos22-torch-native
- Repositorio referenciado en la model card: https://huggingface.co/prj-beatrice/utmos22-torch-native
- Arbol de ficheros del repo: https://huggingface.co/prj-beatrice/utmos22-torch-native/tree/main
- Implementacion de referencia SpeechMOS: https://github.com/tarepan/SpeechMOS
- Documentacion de la clase `UTMOS22Strong` en DeepWiki: https://deepwiki.com/tarepan/SpeechMOS/2.2-utmos22-strong-learner-model
- Repositorio original UTMOS22 (sarulab-speech): https://github.com/sarulab-speech/UTMOS22
- Catalogo de modelos del autor: https://essamamdani.com/ai-models/company/prj-beatrice
