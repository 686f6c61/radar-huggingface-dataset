# AhmedReda25300/SpeechX

## Resumen

SpeechX es un clasificador de audio multitarea construido sobre el codificador de `openai/whisper-base`. A partir de un clip corto de voz (16 kHz mono, hasta 10 segundos) predice simultaneamente dos atributos del hablante: genero (2 clases: femenino/masculino) e idioma (109 clases). Lo publica el usuario AhmedReda25300 en HuggingFace bajo licencia Apache-2.0 y con el pipeline declarado `audio-classification`. No es un modelo generativo: el decodificador de Whisper no se utiliza en ningun punto del pipeline.

La relevancia practica del modelo esta en su coste: al reutilizar solo el encoder (20,6 M de parametros) y anadir dos cabezas lineales sobre un embedding de 512 dimensiones, la inferencia completa (carga de audio, extraccion de features log-mel y forward) se resuelve en 32 ms por clip en una NVIDIA L4 en fp16, y en 237 ms por lote de 64, lo que equivale a unos 270 clips por segundo. Eso lo situa por debajo del umbral de 40-50 ms que se suele exigir para tareas de enrutado en tiempo real dentro de pipelines de ASR.

El modelo se entreno sobre datos de Common Voice (423.772 clips de entrenamiento en 106 idiomas y 50.000 clips de validacion estratificados en 108 idiomas) y reporta 97,75% de exactitud en genero y 87,16% de exactitud top-1 (97,10% top-5) en identificacion de idioma. Su encaje natural es como etapa de pre-enrutado y etiquetado masivo de audio, no como sistema de reconocimiento de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de Whisper-base con mean pooling temporal y dos cabezas lineales de clasificacion |
| Parametros totales | Aproximadamente 20,6 M en el encoder, mas las cabezas `Linear(512 → 2)` y `Linear(512 → 109)` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Entrada de audio de hasta 10 segundos a 16 kHz mono |
| Tipos de cuantizacion | Pesos almacenados en fp16 (39 MB). No se publican pesos GGUF ni cuantizaciones int8; el autor sugiere int8 o destilado a whisper-tiny solo como recomendacion para CPU |
| Idiomas soportados | 109 codigos de idioma de Common Voice 17.0, exactamente los vistos en entrenamiento (`config.json` → `lang2id`) |
| Licencia | Apache-2.0 (el modelo base Whisper es MIT de OpenAI; el audio de Common Voice es CC0) |
| Formato de pesos | `pytorch_model.bin` en fp16, con `config.json`, `model.py` e `infer.py` en el repositorio |

## Arquitectura y entrenamiento

El pipeline es lineal y sin decodificador: audio a 16 kHz mono → extractor de features log-mel de Whisper (80 bins) → encoder de Whisper-base (20,6 M de parametros, fp16) → mean pooling sobre el eje temporal para obtener un embedding de 512 dimensiones → dos cabezas lineales independientes, `Linear(512 → 2)` para genero y `Linear(512 → 109)` para idioma. Ambas predicciones se obtienen en un unico forward pass, sin coste adicional por tarea. Los pesos ocupan 39 MB en fp16.

Los datos proceden de Common Voice: 423.772 clips de entrenamiento en 106 idiomas y 50.000 clips de validacion estratificados en 108 idiomas. El entrenamiento fue de 3 epocas con AdamW en bf16 y scheduler OneCycle, con learning rate de 1e-4 para las cabezas y 1e-5 para el encoder. Las etiquetas de genero provienen del campo autoinformado de Common Voice (`male_masculine` / `female_feminine`), y los clips sin etiqueta se descartaron. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias, algo coherente con un modelo discriminativo.

## Capacidades

- Clasificacion binaria de genero a partir de voz: 97,75% de exactitud, 97,58% de F1 macro en validacion.
- Identificacion de idioma en 109 clases: 87,16% top-1, 97,10% top-5, con 89,96% top-1 en los 66 idiomas con F1 igual o superior al 70%.
- Prediccion conjunta de genero e idioma en un unico forward pass, sin coste extra de computo por tarea.
- Buen rendimiento en idiomas concretos: japones (F1 0,949), coreano (0,941), suajili (0,928), arabe (0,900), indonesio (0,892), mandarin (0,880), ingles (0,864), frances (0,859), aleman (0,858).
- Procesamiento por lotes eficiente: 270 clips/s en L4 con lotes de 64.
- Funcionamiento en CPU en fp32 (306 ms por clip, 3,3 clips/s) para procesamiento offline.
- No soporta tool calling, function calling, agentes, generacion de texto, codigo ni matematicas: es exclusivamente un clasificador de audio.
- No dispone de modo de razonamiento extendido, vision ni procesamiento de audio largo.

## Casos de uso

- Enrutado previo en pipelines de ASR: dado un clip entrante, SpeechX identifica el idioma en menos de 50 ms en GPU y permite seleccionar el modelo de transcripcion adecuado (por ejemplo, un modelo especializado en arabe frente a uno en espanol) antes de gastar computo en decodificacion.
- Analitica de centros de llamadas: clasificar cada segmento de una grabacion por idioma y genero para construir estadisticas de distribucion de llamantes por idioma, segmentar por perfil y derivar a agentes con la competencia linguistica correcta.
- Perfilado en asistentes de voz: detectar el idioma del usuario en los primeros milisegundos de interaccion y cambiar dinamicamente el idioma del dialogo o del modelo de reconocimiento sin que el usuario tenga que indicarlo.
- Auditoria y etiquetado de datasets de audio: procesar grandes volumenes de clips a 270 clips/s para anotar automaticamente idioma y genero, filtrar subconjuntos por idioma y detectar desequilibrios de cobertura antes de entrenar otros modelos.
- Moderacion y clasificacion de contenido en plataformas UGC: etiquetar automaticamente audio subido por usuarios para aplicar politicas por region o idioma, usando el top-5 de idioma como señal cuando la confianza top-1 es baja.
- Verificacion de consistencia en pipelines de doblaje o subtitulado: comprobar que el idioma detectado en la pista de audio coincide con el idioma declarado de los subtitulos, marcando discrepancias para revision humana.
- Investigacion en linguistica y sociolinguistica: analisis a gran escala de la distribucion de idiomas en corpus de voz, dado que el modelo entrega etiquetas homogeneas sobre 109 codigos de Common Voice.
- Pre-filtrado en sistemas de atencion al cliente con SLA estricto: la latencia de 32 ms por clip permite insertar la clasificacion en linea dentro de la ruta critica sin degradar la experiencia.

## Benchmarks y rendimiento

Resultados de validacion reportados por el autor (50.000 clips).

| Metrica (genero, 2 clases) | Valor |
|---|---|
| Accuracy | 97,75% |
| Precision (macro) | 97,52% |
| Recall (macro) | 97,63% |
| F1 (macro) | 97,58% |

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| Femenino | 0,967 | 0,972 | 0,969 |
| Masculino | 0,984 | 0,981 | 0,982 |

| Metrica (idioma, 109 clases) | Valor |
|---|---|
| Top-1 accuracy | 87,16% |
| Top-1 accuracy (66 idiomas con F1 ≥ 70%) | 89,96% |
| Top-5 accuracy | 97,10% |
| Precision (macro) | 72,68% |
| Recall (macro) | 67,77% |
| F1 (macro) | 68,66% |

| Idioma | Precision | Recall | F1 |
|---|---|---|---|
| Japones (ja) | 0,955 | 0,943 | 0,949 |
| Coreano (ko) | 0,933 | 0,949 | 0,941 |
| Suajili (sw) | 0,918 | 0,938 | 0,928 |
| Arabe (ar) | 0,904 | 0,896 | 0,900 |
| Indonesio (id) | 0,900 | 0,883 | 0,892 |
| Mandarín (zh-CN) | 0,876 | 0,884 | 0,880 |
| Ingles (en) | 0,869 | 0,859 | 0,864 |
| Frances (fr) | 0,892 | 0,829 | 0,859 |
| Aleman (de) | 0,856 | 0,859 | 0,858 |
| Turco (tr) | 0,828 | 0,877 | 0,852 |
| Ucraniano (uk) | 0,843 | 0,858 | 0,851 |
| Espanol (es) | 0,834 | 0,848 | 0,841 |
| Urdu (ur) | 0,821 | 0,858 | 0,839 |
| Persa (fa) | 0,793 | 0,875 | 0,832 |
| Polaco (pl) | 0,814 | 0,836 | 0,825 |
| Chino Taiwan (zh-TW) | 0,800 | 0,823 | 0,811 |
| Ruso (ru) | 0,783 | 0,830 | 0,806 |
| Portugues (pt) | 0,735 | 0,862 | 0,794 |
| Hindi (hi) | 0,671 | 0,647 | 0,659 |

Latencia reportada por el autor.

| Dispositivo | Modo | Latencia |
|---|---|---|
| NVIDIA L4 (fp16) | Clip unico (carga + features + forward) | 32 ms (31 clips/s) |
| NVIDIA L4 (fp16) | Lote de 64 | 237 ms por lote (270 clips/s) |
| CPU 8 hilos (fp32) | Clip unico | 306 ms (3,3 clips/s) |

No se han publicado en la informacion disponible resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas frente a otros sistemas de identificacion de idioma o de genero sobre los mismos conjuntos de evaluacion. Los idiomas de altos recursos con etiquetas abundantes (ta, ka, hu, lg, rw, entre otros) alcanzan entre 90% y 97% de F1 segun el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos ocupan 39 MB en fp16, por lo que el modelo completo con activaciones cabe holgadamente en menos de 1 GB de memoria de GPU.
- GPU recomendadas: cualquier GPU con soporte fp16 sirve. El autor reporta mediciones en NVIDIA L4. Tarjetas tipo A100, H100, RTX 4090, RTX 3090, L4, T4 o incluso GTX 16xx son mas que suficientes; el cuello de botella sera la extraccion de features y la E/S de audio, no el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna. En CPU tambien funciona en fp32, a 3,3 clips/s con 8 hilos.
- Opciones de despliegue: no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a modelos generativos y no aplican a un clasificador). El despliegue se hace con PyTorch y `transformers`: `WhisperFeatureExtractor` de Whisper junto con `WhisperEncoderClassifier` definido en `model.py`, cargando `pytorch_model.bin`. Para servir en produccion conviene envolverlo en un servidor propio (por ejemplo, FastAPI) o en TorchServe.
- Latencia y throughput: 32 ms por clip y 270 clips/s en lotes de 64 sobre L4 en fp16; 306 ms por clip en CPU de 8 hilos. Para uso en tiempo real sobre CPU, el autor recomienda cuantizacion int8 o destilacion a whisper-tiny.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpeechX | ~20,6 M (encoder) + cabezas | 109 | 97,75% accuracy en genero; 87,16% top-1 en idioma (validacion propia) | Apache-2.0 | HuggingFace, repo con tamano declarado de 0,0 GB |
| openai/whisper-base (modelo base) | No disponible en la informacion proporcionada | No disponible | No aplica a esta tarea: es un modelo ASR generativo, no clasifica genero | MIT (indicado en la model card de SpeechX) | HuggingFace |
| Clasificadores de idioma tipo ECAPA-TDNN sobre VoxLingua107 (SpeechBrain) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Detectores de idioma ligeros tipo Silero LID | No disponible | No disponible | No disponible | No disponible | Repositorio propio del proyecto |

No se han encontrado en la informacion proporcionada datos verificables de parametros, contexto, rendimiento o licencia de las alternativas, por lo que esas celdas se marcan como no disponibles en lugar de estimarse. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre modelos comparables.

## Limitaciones y advertencias

- Etiquetas de genero autoinformadas: proceden del campo `male_masculine` / `female_feminine` de Common Voice. Los clips sin etiqueta se descartaron, lo que sesga la cobertura hacia idiomas donde existe ese dato. El modelo solo distingue dos clases y no representa identidades no binarias.
- Uso sensible: inferir genero a partir de la voz tiene implicaciones de privacidad y puede ser discriminatorio. En produccion conviene evaluar la base legal, informar a las personas afectadas y evitar decisiones automatizadas con impacto sobre derechos.
- Idioma cerrado: la cabeza de idioma soporta exactamente los 109 codigos de Common Voice 17.0 vistos en entrenamiento (`config.json` → `lang2id`). No hay clase para idiomas fuera de esa lista; se forzara siempre una de las 109 etiquetas.
- Idiomas de bajos recursos: los idiomas con menos de 50 clips de entrenamiento se predicen mal. El F1 macro global de 68,66% frente al 87,16% de exactitud top-1 refleja un fuerte desequilibrio entre clases.
- Dominio de entrenamiento restringido: solo clips cortos de voz limpia de hasta 10 segundos. El rendimiento en audio con ruido, audio telefonico o formato largo no esta probado. La exactitud en hindi (F1 0,659) o portugues (0,794) es notablemente inferior a la de japones o coreano.
- Riesgo de error en el enrutado: si SpeechX se usa como paso previo para elegir un modelo de ASR, un fallo de clasificacion propaga el error. El top-5 de 97,10% sugiere que mantener candidatos alternativos es mas robusto que confiar solo en el top-1.
- Licencia: Apache-2.0 permite uso comercial, pero hay que respetar las condiciones del modelo base (Whisper, MIT) y del audio de Common Voice (CC0) si se redistribuyen derivados.
- Estado del repositorio: el tamano declarado del repo es de 0,0 GB, con 0 descargas y 0 likes, mientras que la model card referencia `pytorch_model.bin` (39 MB), `model.py` e `infer.py`. No se ha podido verificar desde la informacion proporcionada que los pesos esten efectivamente publicados, por lo que conviene comprobar el contenido del repositorio antes de planificar una integracion.
- Ausencia de evaluacion externa: todas las cifras de rendimiento provienen de la validacion del propio autor sobre datos de Common Voice. No hay resultados en conjuntos de evaluacion independientes ni comparaciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmedReda25300/SpeechX
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Dataset Common Voice (Mozilla): https://commonvoice.mozilla.org/datasets
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Archivos referenciados en el repositorio del modelo: `config.json`, `model.py`, `infer.py`, `pytorch_model.bin`
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
