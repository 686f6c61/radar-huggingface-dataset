# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-redux-int8

## Resumen

`sherpa-onnx-nemo-parakeet-tdt-0.6b-redux-int8` es un paquete ONNX para reconocimiento automatico del habla (ASR) offline, distribuido por el proyecto sherpa-onnx (autor del repositorio: csukuangfj). Empaqueta una version cuantizada a int8 del modelo Parakeet Redux de Moondream, que a su vez es una reimplementacion ternaria (1.58 bits) de la arquitectura y el tokenizador de NVIDIA Parakeet TDT 0.6B v3. El resultado es un transductor NeMo (encoder, decoder y joiner) que procesa audio mono a 16 kHz en 25 idiomas europeos.

La relevancia del paquete esta en el compromiso entre tamano y precision: el checkpoint original de Redux ocupa 178 MB gracias al empaquetado ternario, pero ONNX Runtime no dispone de kernels ternarios, por lo que la exportacion decodifica el empaquetado a un grafo denso y despues lo cuantiza. El tarball int8 final ocupa 327.736.417 bytes, frente a los 487.131.623 bytes del paquete Ultra int8, aunque en disco ambos rondan los 670 MB.

El modelo esta pensado para despliegue en produccion con sherpa-onnx y no como sustituto general de modelos ASR de mayor precision. Segun la evaluacion propia del proyecto en FLEURS, su media en seis idiomas (21,68 % WER) es ligeramente mejor que la de v3 int8 (22,38 %) pero claramente peor que la de Ultra int8 (19,16 %), con un comportamiento muy irregular por idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor NeMo Parakeet TDT (encoder, decoder y joiner) exportado a ONNX |
| Parametros totales | 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo offline; se recomienda fragmentar el audio en trozos de 15-20 s cortados en silencios) |
| Tipos de cuantizacion | int8 (este paquete); el proyecto publica tambien una variante fp32 |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`, `tokens.txt`); la variante fp32 usa `encoder.onnx` con pesos externos en `encoder.weights` |

## Arquitectura y entrenamiento

El modelo es un transductor TDT (Token-and-Duration Transducer) de NeMo con unos 0,6 mil millones de parametros, compuesto por un encoder, un decoder y un joiner, y un vocabulario de 8193 tokens. Moondream tomo la arquitectura y el tokenizador de NVIDIA parakeet-tdt-0.6b-v3 y entreno los pesos en formato ternario: cada peso lineal del encoder y de las convoluciones pointwise vale -1, 0 o +1, con una escala por grupo de 128 columnas. Ese esquema de cuantizacion extrema es lo que permite que el checkpoint empaquetado ocupe 178 MB.

La exportacion a sherpa-onnx decodifica el empaquetado ternario (regla `thrush-ternary-v2`, documentada en el `ternary.json` del checkpoint) a un grafo denso y despues lo cuantiza a int8, ya que ONNX Runtime no tiene kernels ternarios. El encoder ONNX incluye metadatos con `tdt` en el campo `url`, lo que hace que sherpa-onnx cargue el joiner como TDT en lugar de como transductor simple. Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto offline para audio mono a 16 kHz.
- Cobertura multilingue de 25 idiomas europeos con un unico modelo.
- Decodificacion TDT, que modela conjuntamente tokens y duraciones, en lugar de un transductor estandar.
- Funcionamiento sin conexion: no requiere API externa ni servicio remoto.
- Integracion nativa con la libreria sherpa-onnx mediante `OfflineRecognizer.from_transducer`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada distinto de la transcripcion.
- No realiza identificacion de idioma: transcribe, pero no informa de que lengua ha escuchado.

## Casos de uso

- Subtitulado por lotes de archivos de audio: el modelo procesa clips offline y devuelve texto plano, adecuado para pipelines que transcriben grabaciones ya almacenadas sin requisitos de tiempo real.
- Transcripcion de reuniones y notas de voz: con audio dividido en fragmentos de 15-20 s cortados en silencios, se puede encadenar la salida para obtener actas en cualquiera de los 25 idiomas soportados.
- Despliegue en dispositivos con recursos limitados: el paquete int8 reduce el tamano de descarga a unos 328 MB, lo que facilita su distribucion en entornos con ancho de banda restringido o contenedores pequenos.
- Procesamiento en el borde sin conectividad: al ejecutarse con sherpa-onnx y ONNX Runtime, puede integrarse en aplicaciones locales que no pueden enviar audio a la nube por motivos de privacidad.
- Indexacion y busqueda de archivos de audio: la transcripcion masiva de un archivo historico permite generar indices de texto sobre los que buscar, aceptando el coste de precision del modelo.
- Prototipado rapido de productos ASR multilingues: sirve para validar flujos de trabajo en idiomas como el maltes, donde Redux supera a v3 int8 (39,74 % frente a 56,41 % WER en FLEURS), antes de invertir en modelos mayores.
- Preprocesado de corpus para investigacion: util para generar transcripciones preliminares en 25 lenguas y despues revisarlas o corregirlas con modelos de mayor calidad.

## Benchmarks y rendimiento

Evaluacion propia del proyecto sherpa-onnx sobre el split de test de FLEURS, 300 clips deterministas por idioma, sin puntuacion ni mayusculas, con el mismo arnes para los tres modelos. WER en porcentaje; no son directamente comparables con benchmarks publicados por los autores.

| Idioma | Redux int8 (este paquete) | Redux fp32 | v3 int8 | Ultra int8 |
|---|---|---|---|---|
| Ingles | 13,86 | 7,62 | 11,16 | 8,51 |
| Aleman | 11,00 | no disponible | 6,84 | 5,20 |
| Frances | 10,97 | no disponible | 8,69 | 7,48 |
| Espanol | 5,04 | no disponible | 4,55 | 3,81 |
| Maltes | 39,74 | no disponible | 56,41 | 44,74 |
| Griego | 49,46 | no disponible | 46,64 | 45,19 |
| Media de los seis | 21,68 | no disponible | 22,38 | 19,16 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo tiene 0,6 mil millones de parametros y el paquete int8 ocupa unos 670 MB en disco, por lo que la huella en memoria es del orden de centenares de MB en CPU o GPU.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecucion via ONNX Runtime con sherpa-onnx, que funciona en CPU.
- Compatibilidad con GPU de consumo: no disponible como dato verificado; por tamano, es plausible en GPUs de consumo, pero la informacion proporcionada no lo confirma.
- Opciones de despliegue: sherpa-onnx (libreria oficial del paquete) sobre ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER medio (6 idiomas, FLEURS) | Licencia | Formato |
|---|---|---|---|---|---|
| Redux int8 (este paquete) | 0,6 B | 25 | 21,68 | CC BY 4.0 | ONNX int8 |
| Redux fp32 | 0,6 B | 25 | no disponible (7,62 en ingles) | CC BY 4.0 | ONNX fp32 |
| v3 int8 (sherpa-onnx) | 0,6 B | 25 | 22,38 | CC BY 4.0 (segun paquete) | ONNX int8 |
| Ultra int8 | no disponible | no disponible | 19,16 | no disponible | ONNX int8 |

## Limitaciones y advertencias

- La cuantizacion int8 penaliza mas la precision en Redux que en v3 o Ultra: en ingles pasa de 7,62 % WER en fp32 a 13,86 % en int8, mientras que Ultra pasa de 5,33 % a 8,51 %. Los pesos ternarios llevan una escala por grupo de 128 columnas que un cuantizador dinamico por canal no puede representar; el error en los pesos es pequeno, pero la salida del encoder diverge y la transcripcion pierde exactitud.
- Para audio largo hay que dividir en silencios en fragmentos de 15-20 s, nunca en ventanas fijas; decodificar una grabacion completa como un solo clip degrada la calidad y aumenta el consumo de memoria.
- El modelo no identifica el idioma: transcribe pero no informa de la lengua detectada.
- El audio muy silencioso se ve afectado por un problema del frontend registrado en el repositorio de sherpa-onnx (issue #4024); conviene normalizar la ganancia antes de la inferencia.
- La licencia CC BY 4.0 exige atribucion; el paquete no cuenta con el aval de NVIDIA ni de Moondream.
- El rendimiento es muy irregular por idioma: destaca en maltes y espanol, pero es flojo en griego (49,46 % WER) y en ingles frente a las alternativas.
- No se han publicado datos de sesgos, alucinacion o robustez acustica en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-redux-int8
- Modelo base Redux (Moondream): https://huggingface.co/moondream/parakeet-redux
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Paquete v3 int8 de sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Documentacion NeMo en sherpa: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Script de exportacion: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-redux
- Workflow de publicacion: https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml
- Issue del frontend de audio: https://github.com/k2-fsa/sherpa-onnx/issues/4024
- Licencia del codigo de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
