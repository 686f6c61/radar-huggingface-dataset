# elabora/wav2vec2-base-960h-onnx

## Resumen

`elabora/wav2vec2-base-960h-onnx` es un espejo (mirror) sin modificaciones de los pesos ONNX cuantizados de `Xenova/wav2vec2-base-960h`, que a su vez es la conversion a ONNX del modelo original `facebook/wav2vec2-base-960h` de Meta AI (Facebook AI). El modelo subyacente es wav2vec 2.0 base, un sistema de reconocimiento automatico del habla (ASR) preentrenado de forma auto-supervisada sobre audio sin etiquetar y ajustado con perdida CTC sobre las 960 horas de LibriSpeech en ingles. Cuenta con aproximadamente 95 millones de parametros y una salida de una trama cada 20 ms (50 tramas por segundo).

El repositorio no aporta ninguna innovacion de modelado: su valor esta en la trazabilidad. Elabora, una herramienta de autoría de modulos de e-learning construida alrededor de agentes de IA, descarga estos ficheros en el ordenador del autor, verifica su SHA-256 y conserva una copia exacta de los bytes con los que se probo, ante el riesgo de que el repositorio upstream (mantenido por un particular) se renombre o se elimine. Solo se copian dos ficheros: `onnx/model_quantized.onnx` (95.286.046 bytes) y `vocab.json` (358 bytes).

El uso declarado es el alineamiento forzado de palabras sobre narraciones: el modelo produce logits por trama y una busqueda de Viterbi localiza donde se pronuncia un texto conocido. En las pruebas del autor, sobre voces sinteticas en ingles, el inicio de palabra se localiza con un error mediano de 24 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 base: extractor de caracteristicas convolucional (CNN) + codificador Transformer con embeddings posicionales convolucionales; cabeza CTC |
| Parametros totales | aproximadamente 95 M (deducido del tamano del grafico int8; la model card no declara el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens: la entrada es forma de onda mono a 16 kHz y la salida es una trama cada 20 ms; la longitud practica la limita la memoria (atencion cuadratica sobre tramas) |
| Tipos de cuantizacion | int8 dinamica (unico grafo incluido: `onnx/model_quantized.onnx`); el repositorio upstream contiene otros grafos que no se copian |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 (heredada del modelo original; el repositorio de Xenova no declara licencia propia) |
| Formato de pesos | ONNX (`model_quantized.onnx`, 95.286.046 bytes) + `vocab.json` (358 bytes) |
| Entrada / salida | `input_values` float32 `[1, samples]` (16 kHz mono, media cero y varianza unitaria) / `logits` `[1, frames, vocabulary]` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

wav2vec 2.0 combina un extractor convolucional que convierte la forma de onda cruda en representaciones latentes cada 20 ms con un codificador Transformer (arquitectura base, sin MoE ni componentes de estado). El preentrenamiento es auto-supervisado: se enmascaran segmentos de las representaciones latentes y el modelo debe identificarlos frente a distractores cuantizados, una tarea contrastiva que no requiere transcripciones. Despues se anade una cabeza CTC y se ajusta de forma supervisada sobre LibriSpeech, 960 horas de audio en ingles leido.

El checkpoint original corresponde a Meta AI (Alexei Baevski, Henry Zhou, Abdelrahman Mohamed y Michael Auli, arXiv:2006.11477) y se distribuye bajo Apache-2.0. Xenova realizo unicamente la conversion a ONNX y la cuantizacion para Transformers.js; Elabora no ha convertido, reentrenado, recomprimido ni renombrado nada. No hay informacion disponible sobre datos de RLHF o DPO: el ajuste es puramente CTC supervisado, sin alineamiento por preferencias.

## Capacidades

- Reconocimiento automatico del habla en ingles a nivel de caracter (vocabulario CTC de 32 simbolos, en mayusculas y sin puntuacion).
- Alineamiento forzado: dado un texto conocido y su audio, permite localizar el inicio y el fin de cada palabra mediante Viterbi sobre los logits.
- Marcas temporales a resolucion de 20 ms por trama, suficientes para subtitulos a nivel de palabra.
- Inferencia sobre audio crudo: no requiere extraccion previa de caracteristicas acusticas (MFCC, mel-espectrogramas).
- Ejecucion en navegador o en local mediante ONNX Runtime y Transformers.js, al ser un grafo ONNX cuantizado de menos de 100 MB.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades de vision, audio generativo ni traduccion; es un modelo acustico mono-idioma.

## Casos de uso

- Alineamiento forzado para subtitulos en e-learning: se pasa la narracion y el guion conocido para obtener marcas de tiempo por palabra; es exactamente el uso para el que Elabora mantiene el espejo, con 24 ms de error mediano en el inicio de palabra.
- Sincronizacion de resaltados tipo karaoke: las marcas por palabra permiten iluminar el texto del guion al ritmo de la locucion sin intervencion manual.
- Generacion de subtitulos SRT/VTT a nivel de palabra: la tasa de 50 tramas por segundo da granularidad suficiente para formatos con marcas por palabra.
- Transcripcion por lotes de audio en ingles: ASR CTC sobre ficheros de 16 kHz mono, util para archivos de podcasts o clases grabadas cuando no se necesita puntuacion ni mayusculas reales.
- Etiquetado y control de calidad de corpus ASR: el alineador detecta desajustes entre transcripcion y audio (palabras faltantes, tomas repetidas, silencios) comparando la ruta de Viterbi con el texto esperado.
- Evaluacion de pronunciacion y lectura guiada: comparar la posicion y duracion de cada palabra esperada con el audio del alumno permite detectar omisiones y pausas anomalas.
- Indexacion y busqueda sobre archivos de audio: generar transcripciones con marcas temporales y despues buscar coincidencias de texto devolviendo el minuto y segundo exactos.
- Procesamiento local con privacidad: al ser un ONNX de ~95 MB apto para CPU, puede ejecutarse en el navegador del usuario final sin enviar el audio a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de ASR (WER en LibriSpeech u otros) en la informacion disponible. El unico dato numerico aportado por el autor es la precision del alineamiento forzado:

| Metrica | Valor | Condiciones |
|---|---|---|
| Error mediano en el inicio de palabra | 24 ms | Alineamiento forzado con Viterbi, voces sinteticas en ingles, pruebas internas de Elabora |
| Resolucion de salida | 20 ms por trama | Frecuencia de trama del codificador |
| Metricas ASR (WER) | no disponible | No declaradas en la model card ni en los resultados de busqueda |

Cualquier cifra de WER que se cite para este checkpoint deberia atribuirse a `facebook/wav2vec2-base-960h` y verificarse en su model card original, no a este espejo.

## Requisitos de hardware

- VRAM para inferencia: inferior a 0,5 GB con el grafo int8; el modelo completo pesa unos 95 MB en disco y cabe holgadamente en memoria de cualquier GPU consumer.
- GPU recomendadas: no necesita GPU. Cualquier RTX 20xx/30xx/40xx o una A100/H100 lo ejecutan sin aprovechar su capacidad; en la practica el cuello de botella es el ancho de banda de memoria y el preprocesado de audio.
- CPU: es el entorno natural de despliegue; un solo nucleo moderno es suficiente para audio en tiempo real con ONNX Runtime, aunque no se dispone de cifras de throughput publicadas.
- Compatibilidad consumer: si, en cualquier portatil, e incluso en dispositivos de bajas prestaciones o en el navegador mediante ONNX Runtime Web / Transformers.js.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), Transformers.js en Node o navegador, OpenVINO si se reconvierte el grafo. No es compatible con vLLM, TGI ni llama.cpp, orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, de la duracion del audio y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| `elabora/wav2vec2-base-960h-onnx` | ~95 M | ONNX int8 (un solo grafo) + vocab.json | Apache-2.0 | Espejo byte a byte verificado por SHA-256; solo incluye `model_quantized.onnx` |
| `Xenova/wav2vec2-base-960h` | ~95 M | ONNX (varios grafos) | sin licencia declarada en el repositorio | Origen del espejo, revision `a19f851b3d42865797e410752b4c570c871e4825`; mantenido por un particular |
| `onnx-community/wav2vec2-base-960h-ONNX` | ~95 M | ONNX | no indicada en la informacion disponible | Conversion automatica subida mediante un Space; alternativa de despliegue |
| `facebook/wav2vec2-base-960h` | ~95 M | PyTorch (checkpoint original) | Apache-2.0 | Modelo de referencia de Meta AI; requiere conversion para ONNX |
| `open_model_zoo` wav2vec2-base | ~95 M | OpenVINO IR | no indicada en la informacion disponible | Variante para el runtime de OpenVINO, mismo checkpoint de origen |

Las diferencias entre estas alternativas son de empaquetado y de licencia declarada, no de calidad acustica: todas derivan del mismo ajuste CTC sobre LibriSpeech 960h. Para una comparacion con modelos generativos tipo Whisper no hay datos en la informacion disponible.

## Limitaciones y advertencias

- Solo ingles: el vocabulario CTC es de 32 simbolos y no cubre castellano ni otros idiomas; usarlo con audio en espanol produce salidas incorrectas o vacias.
- Sin puntuacion ni mayusculas reales: la salida es texto en mayusculas sin signos, por lo que requiere un postprocesado con un modelo de lenguaje si se busca legibilidad.
- Sensibilidad al preprocesado: la entrada debe ser float32 mono a 16 kHz con media cero y varianza unitaria; una normalizacion incorrecta degrada gravemente la transcripcion.
- Riesgo de alucinacion acustica: en silencios, ruido o musica el decodificado CTC puede emitir texto espurio, comportamiento tipico de los modelos CTC sin modelo de lenguaje externo.
- Error de alineamiento dependiente del dominio: la cifra de 24 ms se obtuvo con voces sinteticas en ingles; con habla espontanea, acentos marcados o ruido de fondo el error sera mayor.
- Cuantizacion int8: el grafo incluido es el cuantizado, no el de precision completa; puede haber una perdida pequena de exactitud frente al checkpoint original y no se ofrecen los grafos fp32/fp16 en este repositorio.
- Licencia: el modelo original es Apache-2.0, pero el repositorio de Xenova no declara licencia propia. El espejo redistribuye bajo Apache-2.0 amparandose en la obra original; conviene conservar el fichero `LICENSE` y no hay fichero `NOTICE` en los repositorios upstream.
- Dependencia de un upstream personal: el espejo existe precisamente porque el repositorio de origen podria desaparecer o cambiar; no se garantiza que futuras revisiones de este repositorio coincidan con las versiones futuras de Xenova.
- Sin soporte de diarizacion, deteccion de idioma, traduccion ni timestamps nativos a nivel de palabra: el alineamiento debe implementarse aparte con Viterbi.
- Advertencia de despliegue: al ser un mirror de inferencia y no un modelo entrenado por Elabora, no hay garantia del autor sobre el comportamiento en dominios no probados; los ficheros se distribuyen "AS IS".

## Enlaces

- Repositorio del espejo: https://huggingface.co/elabora/wav2vec2-base-960h-onnx
- Repositorio ONNX de origen (Xenova): https://huggingface.co/Xenova/wav2vec2-base-960h
- Modelo original de Meta AI: https://huggingface.co/facebook/wav2vec2-base-960h
- Paper de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Conversion ONNX de la comunidad: https://huggingface.co/onnx-community/wav2vec2-base-960h-ONNX
- Coleccion de modelos wav2vec2 en ONNX: https://huggingface.co/darjusul/wav2vec2-ONNX-collection
- Open Model Zoo (variante OpenVINO): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/wav2vec2-base/README.md
- Cuaderno de inferencia ONNX para wav2vec2: https://colab.research.google.com/github/vasudevgupta7/gsoc-wav2vec2/blob/main/notebooks/wav2vec2_onnx.ipynb
- Guia de despliegue de wav2vec2 en Hyperpod: https://docs.hyperpodai.com/quickstart/wav2vec2/
- Elabora (herramienta que mantiene el espejo): https://elabora.studio
- Texto de la licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
