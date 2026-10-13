# leogaudin/sherpa-onnx-nemo-parakeet-ultra-int8

## Resumen

Parakeet Ultra int8 para sherpa-onnx es una conversion del modelo de reconocimiento automatico del habla (ASR) moondream/parakeet-ultra a formato ONNX cuantizado a int8, lista para cargarse con el runtime sherpa-onnx. El autor de la conversion es leogaudin, que la publica como tres ficheros ONNX (encoder, decoder y joiner) mas un `tokens.txt`, siguiendo el mismo esquema que el modelo csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8. El modelo subyacente es moondream/parakeet-ultra, a su vez derivado de la arquitectura y los pesos base de nvidia/parakeet-tdt-0.6b-v3.

Se trata de un modelo de unos 0,6 mil millones de parametros con arquitectura TDT (Token-and-Duration Transducer) sobre el framework NeMo, capado para transcripcion de voz en 25 idiomas europeos. Su relevancia practica esta en que ofrece una tasa de error por palabra (WER) inferior a la de Parakeet v3 en la mayoria de idiomas evaluados y se ejecuta en CPU a aproximadamente 22,6 veces tiempo real, ocupando unos 650 MB en disco y con un pico de memoria cercano a 3 GB.

La conversion fue realizada para el proyecto OpenCaptions, un editor de subtitulos gratuito, aunque el modelo es de proposito general. El proceso conserva los pesos publicados por Moondream en float16 (exactos en float32) y los cuantiza dinamicamente a int8. No se incluye el fichero `bpe.vocab`, por lo que no hay soporte de hotwords.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) sobre NeMo, exportada a ONNX |
| Parametros totales | ~0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; audio de 16 kHz mono, decodificado completo o en ventanas de 20 a 30 segundos |
| Tipos de cuantizacion | int8 (cuantizacion dinamica; pesos sin signo para el encoder, con signo para decoder y joiner) |
| Idiomas soportados | 25 idiomas europeos: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX int8 (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) mas tokens.txt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA, un transductor recurrente en el que el joiner no solo predice el token siguiente sino tambien una duracion, lo que permite avanzar varios fotogramas de audio en un solo paso de decodificacion y acelerar la inferencia. La estructura consta de los tres componentes clasicos exportados a ONNX: encoder, decoder y joiner. El vocabulario, verificado contra v3, tiene 8.192 tokens en el mismo orden, por lo que se reutiliza su `tokens.txt`. El unico componente que se ha descartado respecto al modelo original de Moondream son los seis tensores `vad_head.*` (una cabeza de deteccion de actividad de voz), que el transcriptor no utiliza.

El proceso de conversion, implementado en `export_ultra.py`, parte del fichero `parakeet-tdt-0.6b-v3.nemo` restaurado y de los pesos `model.safetensors` de Ultra publicados en el formato de transformers (mayoritariamente en float16). Se renombraron 723 tensores a la nomenclatura de NeMo sin que faltase ni sobrase ninguno y con todas las formas coincidentes con las de v3. Despues se exportaron encoder, decoder y joiner a ONNX y se cuantizaron a int8 con el mismo script de sherpa-onnx y los mismos metadatos, salvo el campo `url`, que debe contener "tdt" para que sherpa-onnx lo cargue como modelo TDT. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o si hubo RLHF/DPO, ya que no se detalla en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de voz a texto) en 25 idiomas europeos.
- Decodificacion en una sola pasada o por ventanas de 20 a 30 segundos, adecuada para audios de duracion variable.
- Ejecucion en CPU, sin necesidad de GPU, con un rendimiento medido de aproximadamente 22,6 veces tiempo real en Apple Silicon con 4 hilos.
- Carga directa en sherpa-onnx mediante `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`.
- Sustitucion directa del modelo csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 cambiando el nombre del repositorio.
- No soporta hotwords al no incluir el fichero `bpe.vocab`.
- No se documenta soporte de tool calling, agentes ni otras modalidades (vision, audio mas alla de ASR).

## Casos de uso

- Edicion de subtitulos en escritorio: integrado en editores como OpenCaptions, permite transcribir el audio de un video en cualquiera de los 25 idiomas soportados sin conexion y en CPU, generando pistas de subtitulos listas para revisar.
- Transcripcion local en aplicaciones de notas de voz: al ejecutarse sin GPU y con un pico de unos 3 GB de memoria, encaja en portatiles y equipos de sobremesa corrientes para convertir grabaciones de reuniones o dictados en texto.
- Procesamiento por lotes en servidor sin GPU: con 22,6x tiempo real en CPU, un servidor puede transcribir grandes volumenes de audio en paralelo usando varios procesos, sin coste de GPU.
- Accesibilidad en tiempo cuasi real: la decodificacion por ventanas de 20 a 30 segundos permite alimentar streams de audio para generar subtitulos en directo con una latencia controlada.
- Indexado y busqueda de contenido audiovisual: transcribir archivos de audio o video para despues indexar el texto y permitir busquedas sobre el contenido hablado.
- Asistentes de voz multilingues en Europa: al cubrir 25 idiomas del continente con una unica licencia y un solo modelo, simplifica el despliegue de sistemas de dictado o de voz a texto en productos con presencia multinacional.

## Benchmarks y rendimiento

Tasa de error por palabra (WER) en porcentaje sobre el conjunto de prueba FLEURS, 20 clips por idioma, con normalizacion de texto identica para todos los modelos (protocolo de OpenCaptions, `scripts/asr-bench/fleurs.py`). Segun el autor, con 20 clips (aproximadamente cuatro minutos por idioma) las diferencias por debajo de unos dos puntos son ruido.

| Modelo | en | fr | de | es | it | pt | pl | ru | media |
|---|---|---|---|---|---|---|---|---|---|
| Parakeet v3, int8 (csukuangfj) | 7,7 | 8,7 | 5,3 | 3,3 | 3,2 | 4,7 | 10,5 | 9,5 | 6,6 |
| Parakeet Ultra, int8 (este modelo) | 4,8 | 7,9 | 3,8 | 2,5 | 2,2 | 4,7 | 8,6 | 8,5 | 5,4 |
| Whisper large-v3-turbo, int8 (faster-whisper) | 5,7 | 8,3 | 3,6 | 1,9 | 2,2 | 4,2 | 6,2 | 6,4 | 4,8 |

Velocidad medida en un Mac con Apple Silicon, 4 hilos, en una sola sesion: Parakeet v3 alcanza 24,4x tiempo real, Parakeet Ultra 22,6x y Whisper large-v3-turbo 2,0x. El consumo de memoria es similar al de v3, con un pico del proceso cercano a 3 GB. El autor no ha medido grabaciones largas, habla con ruido ni otras CPUs.

## Requisitos de hardware

- Almacenamiento: aproximadamente 650 MB para el repositorio (componentes ONNX int8 mas tokens).
- Memoria RAM: pico del proceso cercano a 3 GB durante la inferencia.
- GPU: no requiere GPU; la inferencia esta pensada para CPU. La referencia de rendimiento (22,6x tiempo real) se obtuvo en CPU Apple Silicon con 4 hilos.
- Cabe en cualquier equipo de consumo (portatil o sobremesa) con unos 3 GB de RAM disponibles; no necesita tarjeta grafica dedicada.
- Opciones de despliegue: runtime sherpa-onnx (version usada en la conversion, 1.13.8), mediante `OfflineRecognizer.from_transducer`. No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI) para este formato.
- Latencia y throughput: 22,6x tiempo real en Apple Silicon con 4 hilos; el rendimiento en otras CPUs no esta medido. El audio debe ser de 16 kHz mono.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | WER medio (FLEURS, 8 idiomas) | Velocidad | Licencia |
|---|---|---|---|---|---|---|
| Parakeet Ultra, int8 (este modelo) | TDT / NeMo, ONNX int8 | 25 europeos | ONNX int8 | 5,4 | 22,6x tiempo real (CPU) | CC-BY-4.0 |
| Parakeet v3, int8 (csukuangfj) | TDT / NeMo, ONNX int8 | 25 europeos | ONNX int8 | 6,6 | 24,4x tiempo real (CPU) | CC-BY-4.0 |
| Whisper large-v3-turbo, int8 (faster-whisper) | Encoder-decoder transformer | amplio (multilingue) | CTranslate2 int8 | 4,8 | 2,0x tiempo real (CPU) | MIT (modelo: Apache-2.0) |

Nota: la comparativa de WER y velocidad se limita a los datos publicados por el autor en la model card; no se dispone de otras mediciones.

## Limitaciones y advertencias

- Evaluacion sobre una muestra pequena: solo 20 clips por idioma en FLEURS, por lo que el propio autor advierte que diferencias inferiores a unos dos puntos porcentuales de WER son ruido.
- Sin medicion en condiciones adversas: no se han medido grabaciones largas, habla con ruido ni CPUs distintas a Apple Silicon.
- Sin soporte de hotwords: no se incluye el fichero `bpe.vocab`, por lo que no se pueden forzar terminos concretos.
- Conversion no oficial: NVIDIA y Moondream no han revisado ni respaldan esta conversion; los posibles errores son responsabilidad de quien la realizo.
- Idioma limitado: cubre 25 idiomas europeos; no se documenta soporte de otras lenguas como arabe, chino o japones.
- Cabeza VAD descartada: se han eliminado los seis tensores `vad_head.*`, de modo que no hay deteccion de actividad de voz integrada.
- Audio de entrada restringido: requiere 16 kHz mono; otros formatos deben remuestrearse y convertirse a mono previamente.
- Riesgo de alucinacion: aunque no se documenta explicitamente, todo modelo ASR puede generar texto incorrecto en audio ininteligible o con mucho ruido; conviene validar la salida en produccion.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion a las fuentes originales (NVIDIA, Moondream y las indicadas por el autor).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leogaudin/sherpa-onnx-nemo-parakeet-ultra-int8
- Modelo base (pesos): https://huggingface.co/moondream/parakeet-ultra
- Modelo base (arquitectura y tokenizer): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo de referencia de esquema: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Runtime: https://github.com/k2-fsa/sherpa-onnx
- Script de exportacion de referencia: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v3
- Proyecto que motivo la conversion: https://github.com/leogaudin/opencaptions
