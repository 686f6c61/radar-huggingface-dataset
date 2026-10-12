# jermalk/whisper-large-v3-turbo-int8-ov

## Resumen

jermalk/whisper-large-v3-turbo-int8-ov es una distribucion del modelo de reconocimiento automatico del habla (ASR) Whisper large-v3-turbo de OpenAI, convertido al formato Intermediate Representation (IR) de OpenVINO y con los pesos comprimidos a INT8 mediante NNCF. Se trata de una copia byte a byte de OpenVINO/whisper-large-v3-turbo-int8-ov (revision b568445d), la conversion original publicada por Intel; el unico cambio respecto al original es el campo `openvino_config.json`, donde se sustituye la ruta interna de build-farm de Intel por el id del modelo upstream. La utilidad de este repositorio es que todos los modelos de arranque de RustedVINO procedan de una unica fuente.

El modelo hereda la arquitectura de Whisper large-v3-turbo, que es una version ajustada de Whisper large-v3 podado, con el numero de capas del decodificador reducido de 32 a 4. Ese recorte hace que la inferencia sea mucho mas rapida a cambio de una degradacion menor de la calidad. Al estar cuantizado a INT8 (modo INT8_ASYM, group_size 128), el repositorio ocupa unos 0,8 GB, lo que permite ejecutarlo en CPU y en hardware de consumo con un consumo de memoria en torno a 2,1 GB en CPU.

Es relevante ahora porque encaja en el ecosistema OpenVINO GenAI a traves de la clase `WhisperPipeline` y es compatible con Optimum Intel y OpenVINO Model Server, lo que facilita desplegar transcripcion en local sin GPU dedicada. El autor advierte de que esta pensado unicamente para transcripcion (no traduccion) y de que todavia no debe ejecutarse sobre una NPU de Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); decodificador reducido de 32 a 4 capas respecto a large-v3 |
| Parametros totales | Aproximadamente 809 M (cifra publica de Whisper large-v3-turbo; no indicada en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (estandar de Whisper; no detallado en la informacion proporcionada) |
| Tipos de cuantizacion | INT8, modo INT8_ASYM, group_size 128 (compresion con `nncf.compress_weights`) |
| Idiomas soportados | Multilingue segun el modelo base Whisper large-v3-turbo; la lista completa no esta disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (XML + BIN), pesos INT8; acompanado de `openvino_config.json` |

## Arquitectura y entrenamiento

La base es Whisper large-v3-turbo, un modelo de reconocimiento automatico del habla con arquitectura transformer encoder-decoder. Respecto a Whisper large-v3, el modelo original aplica una poda del decodificador que reduce sus capas de 32 a 4, lo que acelera de forma notable la generacion de tokens de texto a cambio de una perdida de calidad calificada como menor por los autores de la conversion. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; se trata, en cualquier caso, de un modelo preentrenado y ajustado por OpenAI del que este repositorio solo redistribuye una conversion de formato y cuantizacion.

La innovacion tecnica de este repositorio no esta en el entrenamiento, sino en la optimizacion de despliegue: la conversion a OpenVINO IR y la compresion de pesos INT8 con NNCF permiten ejecutar el modelo en CPU con un consumo de memoria reducido. Es compatible con OpenVINO 2026.1.0 o superior y con Optimum Intel 1.27.0 o superior. Se integra tanto con `OVModelForSpeechSeq2Seq` de Optimum Intel como con `WhisperPipeline` de OpenVINO GenAI y con OpenVINO Model Server (OVMS) mediante cliente compatible con la API de OpenAI.

## Capacidades

- Transcripcion automatica de voz a texto (pipeline `automatic-speech-recognition`).
- Procesamiento de audio en ventanas de 30 s, con la logica de segmentacion estandar de Whisper.
- Soporte multilingue heredado de Whisper large-v3-turbo (lista concreta de idiomas no detallada en la informacion disponible).
- Ejecucion en CPU con quantizacion INT8, con un consumo medido de aproximadamente 2,1 GB de RAM.
- Integracion con OpenVINO GenAI (`WhisperPipeline`) y con Optimum Intel (`OVModelForSpeechSeq2Seq`).
- Despliegue como servicio compatible con la API de OpenAI a traves de OpenVINO Model Server.
- Uso dentro del stack RustedVINO mediante `rv add`.

Nota importante del autor: el modelo esta ajustado solo para transcripcion. La ruta `/v1/audio/translations` devuelve el texto en el idioma de origen sin traducir, por lo que no debe emplearse como modelo de traduccion de audio. Tampoco debe ejecutarse sobre una NPU de Intel: segun el autor, una unica peticion bloqueo la NPU hasta reiniciar el servidor.

## Casos de uso

- Transcripcion de reuniones y clases en local: el modelo procesa audio en ventanas de 30 s y puede transcribir grabaciones largas en CPU sin GPU dedicada, con un consumo en torno a 2,1 GB de RAM. El autor lo probo sobre una clase de 110 minutos en polaco.
- Subtitulado de video: se puede integrar en un pipeline que extraiga la pista de audio y genere subtitulos con marcas de tiempo, aprovechando la salida segmentada de Whisper.
- Despliegue de un servicio ASR autoalojado: mediante OpenVINO Model Server se expone un endpoint compatible con la API de OpenAI, lo que permite sustituir servicios en la nube por una instancia local.
- Asistentes de voz y dictado: la quantizacion INT8 y el decodificador de 4 capas reducen la latencia, lo que resulta util para transcripcion casi en tiempo real en portatiles con CPU Intel.
- Indexado y busqueda de archivos de audio: transcribir un archivo de grabaciones y almacenar el texto para busqueda posterior, con el modelo corriendo integramente en local.
- Procesamiento por lotes de archivos de voz en servidores sin GPU: al estar optimizado para CPU, encaja en entornos donde no hay aceleradores disponibles.
- Entornos de borde o con requisitos de privacidad: al ejecutarse en local y no enviar audio a terceros, es adecuado para casos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, etc.) en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad relativa | Aproximadamente 0,4x tiempo real | Intel Core Ultra 7, forzado a CPU |
| Memoria en uso | Aproximadamente 2,1 GB de RAM | CPU |
| Acuerdo con whisper-large-v3 | 98% de palabras coincidentes | Clase real de 110 minutos en polaco; es una cifra de acuerdo, no de precision |

El propio autor advierte de que estas cifras son ordenes de magnitud y que variaron hasta un 25% entre ejecuciones. No se dispone de datos comparativos oficiales con otros modelos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Capas de decodificador | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| jermalk/whisper-large-v3-turbo-int8-ov | ~809 M (base) | 4 | Ventanas de 30 s | MIT | OpenVINO IR INT8 |
| OpenVINO/whisper-large-v3-turbo-int8-ov | ~809 M (base) | 4 | Ventanas de 30 s | MIT | OpenVINO IR INT8 |
| openai/whisper-large-v3-turbo | ~809 M | 4 | Ventanas de 30 s | MIT | PyTorch (safetensors) |
| openai/whisper-large-v3 | ~1550 M | 32 | Ventanas de 30 s | MIT | PyTorch (safetensors) |

El modelo de este repositorio es funcionalmente equivalente a la conversion de Intel (OpenVINO/whisper-large-v3-turbo-int8-ov) y al modelo original de OpenAI en cuanto a capacidades, diferenciandose por el formato y la cuantizacion para despliegue en CPU. No se dispone de datos de rendimiento comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Solo transcripcion: la traduccion de audio no funciona; `/v1/audio/translations` devuelve el texto sin traducir en el idioma de origen.
- No ejecutar sobre NPU de Intel: una peticion provoco el bloqueo de la NPU hasta reiniciar el servidor.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en audio ruidoso o con silencios largos.
- La cifra del 98% es un indice de acuerdo con whisper-large-v3, no una medida de precision real; el autor lo recalca explicitamente.
- Degradacion de calidad potencial derivada de la reduccion del decodificador de 32 a 4 capas y de la cuantizacion INT8.
- Las mediciones de velocidad dependen en gran medida del hardware y variaron hasta un 25% entre ejecuciones.
- Requiere OpenVINO 2026.1.0 o superior y Optimum Intel 1.27.0 o superior; versiones anteriores pueden no ser compatibles.
- Idiomas soportados no detallados en la informacion proporcionada; conviene verificar el idioma objetivo antes de desplegar.
- Licencia MIT, por lo que se permite uso comercial, pero se recomienda conservar la atribucion a Intel (conversion) y a OpenAI (modelo original).
- El repositorio es un espejo; el mantenimiento y las actualizaciones dependen del autor y no de Intel ni de OpenAI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jermalk/whisper-large-v3-turbo-int8-ov
- Conversion original de Intel: https://huggingface.co/OpenVINO/whisper-large-v3-turbo-int8-ov
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
- OpenVINO GenAI (repositorio): https://github.com/openvinotoolkit/openvino.genai
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- NNCF (cuantizacion): https://github.com/openvinotoolkit/nncf
- Formato OpenVINO IR: https://docs.openvino.ai/2025/documentation/openvino-ir-format.html
- Guia de compresion de pesos: https://docs.openvino.ai/2025/openvino-workflow/model-optimization-guide/weight-compression.html
- Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- Despliegue OVMS en Windows: https://docs.openvino.ai/ovms_baremetal
