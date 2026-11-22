# saltpi/iplay-speech-models

## Resumen

`saltpi/iplay-speech-models` es un repositorio espejo de siete paquetes de reconocimiento automatico del habla (ASR) en formato ONNX, empaquetados para el runtime sherpa-onnx y utilizados por la aplicacion iPlay.Apple. No se trata de un modelo entrenado por el autor del repositorio: la model card indica explicitamente que los archivos son copias byte a byte de paquetes ya existentes, con nombres, tamanos y hashes SHA-256 preservados en `manifest.json` y `SHA256SUMS`. El repositorio actua, por tanto, como archivo de distribucion para garantizar que las descargas no dependan del antiguo host de paquetes ni de los repositorios upstream.

El contenido cubre varias familias de arquitecturas ASR: Parakeet TDT y TDT-CTC de NVIDIA (110M y 0.6B parametros), Zipformer de la ecosystema icefall/k2-fsa (japones, tailandes, coreano) y FastConformer CTC de NeMo (10 idiomas). Los paquetes estan cuantizados a INT8 y cubren ingles, japones, coreano, tailandes y un paquete multilingue de 10 lenguas europeas. El tamano total del repositorio es de 1.1 GB.

La relevancia de este repositorio es logistica mas que cientifica: facilita la reproducibilidad de despliegues ASR offline con sherpa-onnx y proporciona trazabilidad de licencias por paquete. Cada modelo conserva sus terminos upstream (CC-BY-4.0, Apache-2.0 o sin declarar), y el repositorio no impone una licencia global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta: Parakeet TDT / TDT-CTC, Zipformer, FastConformer CTC |
| Parametros totales | Variable por paquete: 110M (Parakeet EN), ~0.6B (Parakeet multi v3), no disponible para el resto |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | No disponible (modelos ASR; ventana de audio dependiente del runtime) |
| Tipos de cuantizacion | INT8 (todos los paquetes, salvo `sherpa.ko.zipformer-2024-06-24` sin sufijo `.int8`) |
| Idiomas soportados | Ingles, japones, coreano, tailandes, multilingue (10 lenguas europeas en FastConformer) |
| Licencia | Por paquete: CC-BY-4.0, Apache-2.0 o no declarada; el repositorio no impone licencia global |
| Formato de pesos | ONNX (dentro de archivos ZIP), con ficheros de tokens |

## Arquitectura y entrenamiento

El repositorio agrupa modelos con arquitecturas distintas, todos convertidos a ONNX para sherpa-onnx. Los paquetes de NVIDIA Parakeet usan la arquitectura TDT (Token-and-Duration Transducer) y su variante TDT-CTC, disenadas para decodificacion eficiente con emision conjunta de tokens y duraciones. Los paquetes Zipformer provienen de la ecosystema icefall/k2-fsa y emplean un encoder Zipformer con atencion multi-escala, habitual en recetas de ASR de k2. El paquete FastConformer CTC de NeMo usa un encoder FastConformer con cabecera CTC y un vocabulario de 20k unidades, entrenado sobre 10 lenguas europeas.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni procesos de RLHF/DPO en la informacion proporcionada; la model card del espejo no replica esos detalles y remite a las model cards upstream. La unica transformacion documentada es la conversion a ONNX y el empaquetado INT8, realizada por el ecosistema Sherpa/ONNX y el distribuidor original, no por este repositorio.

## Capacidades

- Reconocimiento automatico del habla (ASR) offline en ingles, japones, coreano y tailandes, con paquetes especificos por idioma.
- Paquete multilingue Parakeet TDT 0.6B v3 con cobertura multilingue amplia (segun model card upstream).
- Paquete FastConformer CTC para 10 lenguas europeas (be, de, en, es, fr, hr, it, pl, ru, uk) con vocabulario de 20k.
- Transcripcion con marcas de tiempo a nivel de token/segmento, segun las capacidades estandar de sherpa-onnx (no verificado en esta ficha).
- Ejecucion en CPU y GPU mediante sherpa-onnx, con pesos INT8 para reducir huella de memoria.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma automatica ni tool calling.

## Casos de uso

- Transcripcion offline en aplicaciones de escritorio: los paquetes ONNX se cargan con sherpa-onnx sin conexion, lo que permite subtitulado local en ingles o japones sin enviar audio a la nube.
- Procesamiento por lotes de archivos de audio: el paquete FastConformer CTC de 10 lenguas europeas permite transcribir corpus multilingues con un unico modelo y vocabulario de 20k.
- Integracion en apps moviles: los paquetes INT8 de 110M parametros (Parakeet EN) son adecuados para dispositivos con memoria limitada, dado su tamano reducido.
- Archivado reproducible de dependencias: el repositorio sirve para fijar una revision inmutable y verificar integridad con SHA-256 en pipelines de CI/CD, evitando depender de hosts volatiles.
- Subtitulado de contenido audiovisual en coreano o tailandes: los paquetes Zipformer especificos cubren idiomas con menos soporte en modelos ASR genericos.
- Prototipado de asistentes de voz multilingues: combinando paquetes por idioma con deteccion externa de lengua, se puede construir un frontend ASR ligero en sherpa-onnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los paquetes INT8 de 110M parametros (Parakeet EN) caben en menos de 1 GB de memoria; el paquete Parakeet 0.6B requiere aproximadamente 1-2 GB en INT8; el resto no disponible con precision.
- GPU recomendadas: no disponible en la informacion proporcionada. sherpa-onnx soporta ejecucion en CPU, por lo que GPU no es imprescindible.
- Consumer GPU: los paquetes de 110M y probablemente los Zipformer caben en GPUs de gama baja; el paquete de 0.6B requiere al menos 2 GB de memoria.
- Opciones de despliegue: sherpa-onnx (runtime nativo para los paquetes), con soporte de CPU y GPU segun build.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| saltpi/iplay-speech-models (paquete EN Parakeet 110M) | 110M | EN | ONNX INT8 | CC-BY-4.0 (upstream) | Espejo de NVIDIA Parakeet TDT-CTC |
| saltpi/iplay-speech-models (Parakeet 0.6B v3) | ~0.6B | Multilingue | ONNX INT8 | CC-BY-4.0 (upstream) | Mayor cobertura idiomatica |
| nvidia/parakeet-tdt_ctc-110m | 110M | EN | NeMo | CC-BY-4.0 | Modelo upstream original |
| reazon-research/reazonspeech-k2-v2 | No disponible | JA | k2/icefall | Apache-2.0 | Upstream del paquete japones |
| csukuangfj/sherpa-onnx-nemo-fast-conformer-ctc-be-de-en-es-fr-hr-it-pl-ru-uk-20k-int8 | No disponible | 10 lenguas EU | ONNX INT8 | No declarada | Upstream del paquete FastConformer |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier evaluacion de calidad debe remitirse a las model cards upstream, no a este repositorio.
- Licencias heterogeneas: el paquete FastConformer no declara licencia en su model card; no se debe inferir la licencia de sherpa-onnx para uso comercial.
- Riesgo de alucinacion: los modelos ASR pueden generar transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no cubiertos; no se documentan tasas de error.
- Cobertura limitada: no hay paquete para espanol como idioma individual; el castellano solo aparece dentro del paquete FastConformer de 10 lenguas.
- El paquete coreano (`sherpa.ko.zipformer-2024-06-24`) no lleva sufijo `.int8`, por lo que su cuantizacion puede diferir del resto.
- Dependencia de sherpa-onnx: los pesos ONNX estan empaquetados para ese runtime; su uso con otros frameworks requiere conversion adicional no documentada.
- Integridad: es imprescindible verificar SHA-256 antes de extraer, segun indica la model card; no se garantiza soporte del autor del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/saltpi/iplay-speech-models
- Documentacion de modelos preentrenados de Sherpa ONNX: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/
- Upstream Parakeet TDT-CTC 110M: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Upstream Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Upstream ReazonSpeech k2 v2: https://huggingface.co/reazon-research/reazonspeech-k2-v2
- Upstream Zipformer tailandes: https://huggingface.co/yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20
- Upstream FastConformer CTC 10 lenguas: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-fast-conformer-ctc-be-de-en-es-fr-hr-it-pl-ru-uk-20k-int8
- Upstream Zipformer coreano: https://huggingface.co/johnBamma/icefall-asr-ksponspeech-zipformer-2024-06-24
