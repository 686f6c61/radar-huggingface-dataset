# Ayano7110/whisperkit-coreml-ja

## Resumen

WhisperKit (Core ML) conversions of Kotoba-Whisper es un repositorio de modelos de reconocimiento automatico del habla (ASR) en formato Core ML, listos para su uso con el framework WhisperKit de Argmax en dispositivos Apple. Lo publica el usuario Ayano7110 y contiene dos conversiones de los modelos Kotoba-Whisper desarrollados por Kotoba Technologies: `kotoba-whisper-v2.0` y `kotoba-whisper-bilingual-v1.0`. El objetivo no es entrenar un modelo nuevo, sino empaquetar pesos ya existentes en un formato que permita inferencia local eficiente en macOS e iOS dentro de la aplicacion KoeNote.

La relevancia practica esta en que traslada el trabajo de destilacion de Whisper large-v3 realizado por Kotoba al ecosistema Apple, donde Core ML y WhisperKit aprovechan la Neural Engine y la GPU unificada. Esto permite transcripcion de audio en japones e ingles sin depender de servicios en la nube, con latencias bajas y sin coste por inferencia, algo especialmente util en aplicaciones de dictado, subtitulado o notas de voz.

El repositorio ocupa 1,8 GB, se distribuye bajo licencia Apache-2.0 y esta pensado exclusivamente para inferencia con la libreria `whisperkit`. No incluye pesos en formato PyTorch ni safetensors originales, sino los artefactos Core ML compilados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) destilado, convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (estandar en Whisper) |
| Tipos de cuantizacion | float16 (conversion Core ML documentada) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage` / `.mlmodelc`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es una destilacion de Whisper large-v3 realizada por Kotoba Technologies. La card indica explicitamente que el decoder destilado tiene 2 capas frente a las 32 del modelo profesor (Whisper large-v3), lo que reduce drasticamente el coste de decodificacion manteniendo el encoder original. Esta es la misma estrategia que distil-large-v3 de Hugging Face, adaptada al japones y a un escenario bilingue ja/en.

La unica modificacion introducida en esta conversion afecta a `generation_config.json`: el campo `alignment_heads`, que en el modelo profesor apunta a cabezas de atencion de las 32 capas del decoder, se ha reemplazado por todas las cabezas de la ultima capa del decoder destilado (2 capas), replicando la configuracion de distil-large-v3. Esto es necesario para que los timestamps a nivel de palabra funcionen correctamente con un decoder de solo 2 capas. Los pesos en si no se han alterado: solo se han convertido a Core ML en float16 mediante `whisperkittools`.

No se documentan en la informacion disponible detalles sobre el dataset de destilacion, el numero de tokens de audio empleados ni si hubo etapas de RLHF o ajuste fino adicional. Tampoco se especifica el tamano exacto de parametros del checkpoint destilado.

## Capacidades

- Transcripcion automatica del habla (ASR) en japones e ingles, con deteccion de idioma en el modelo bilingue.
- Generacion de timestamps a nivel de segmento y a nivel de palabra (gracias al ajuste de `alignment_heads`).
- Procesamiento de audio en ventanas de 30 segundos, con concatenacion de segmentos para audios mas largos.
- Ejecucion local en dispositivos Apple mediante WhisperKit, sin llamadas a red.
- Inferencia en float16 sobre Neural Engine y GPU, con aceleracion hardware nativa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No incluye capacidades de vision, audio generation ni traduccion explicita mas alla de la transcripcion en el idioma detectado.

## Casos de uso

- Aplicaciones de dictado en macOS e iOS: integracion directa con WhisperKit para convertir voz en texto en tiempo real, con latencia baja gracias al decoder de 2 capas y a la aceleracion Core ML.
- Notas de voz y reuniones en japones: transcripcion de grabaciones largas segmentando el audio en ventanas de 30 s y concatenando resultados, con timestamps de palabra utiles para busqueda y navegacion.
- Subtitulado automatico de video: generacion de subtitulos con marcas temporales a nivel de palabra, adecuado para plataformas que requieren sincronizacion fina.
- Asistentes de voz bilingues ja/en: el modelo bilingue permite alternar entre japones e ingles en una misma sesion sin cambiar de modelo, util en entornos corporativos internacionales.
- Herramientas de accesibilidad: dictado por voz en dispositivos Apple para usuarios con movilidad reducida, funcionando offline y sin enviar audio a servidores externos.
- Transcripcion en entornos con requisitos de privacidad: al ejecutarse completamente en local, es apto para sectores como salud, legal o administracion donde el audio no puede salir del dispositivo.
- Prototipado rapido en Swift: al estar en Core ML y compatible con WhisperKit, se puede integrar en un proyecto Xcode en pocas lineas y sustituir por otras variantes del mismo framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; al ser Core ML para Apple Silicon, el modelo reside en memoria unificada. El repo pesa 1,8 GB, lo que da una cota superior del espacio en disco y en memoria para los dos checkpoints en float16.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El modelo aprovecha Neural Engine y GPU integrada.
- Cabe en hardware consumer: si, en cualquier Mac con Apple Silicon y en iPhone/iPad compatibles con Core ML y WhisperKit. No esta pensado para GPUs NVIDIA ni CUDA.
- Opciones de despliegue: WhisperKit (Argmax) como via principal; conversion realizada con `whisperkittools`. No se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del chip concreto, del tamano de la ventana de audio y de si se usa Neural Engine o GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ayano7110/whisperkit-coreml-ja (este) | no disponible (decoder 2 capas) | 30 s por segmento | ja, en | Apache-2.0 | Core ML |
| kotoba-tech/kotoba-whisper-v2.0 | no disponible (destilado de large-v3) | 30 s por segmento | ja | Apache-2.0 | PyTorch / safetensors |
| kotoba-tech/kotoba-whisper-bilingual-v1.0 | no disponible (destilado de large-v3) | 30 s por segmento | ja, en | Apache-2.0 | PyTorch / safetensors |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento | multilingue (99 idiomas) | MIT | PyTorch / safetensors |

La diferencia clave frente a los originales de Kotoba es el formato: este repo solo es util en el ecosistema Apple, mientras que los originales se pueden ejecutar con transformers, faster-whisper o vLLM en cualquier plataforma. Frente a whisper-large-v3, la version destilada reduce el decoder de 32 a 2 capas, lo que acelera la inferencia a costa de algo de precision, pero no cubre tantos idiomas.

## Limitaciones y advertencias

- Solo soporta japones e ingles; no es un modelo multilingue general.
- Al ser una destilacion con decoder de 2 capas, la precision en audio ruidoso, acentos marcados o vocabulario tecnico puede ser inferior a la de Whisper large-v3 completo.
- Riesgo de alucinacion en silencios, musica o audio de baja calidad, comportamiento comun en la familia Whisper.
- Sesgos inheridos del dataset de entrenamiento original de Whisper y del corpus japones usado por Kotoba Technologies; no se documentan evaluaciones de sesgo en esta card.
- Restringido a plataformas Apple: no se puede ejecutar en Linux, Windows ni GPUs NVIDIA sin reconvertir los pesos.
- El campo `alignment_heads` fue modificado respecto al modelo profesor; si se reutiliza `generation_config.json` fuera de WhisperKit, los timestamps pueden ser incorrectos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones de los modelos base de Kotoba Technologies y de Whisper large-v3 antes de un despliegue comercial.
- El tamano de 1,8 GB incluye dos conversiones; en una app movil puede ser necesario descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ayano7110/whisperkit-coreml-ja
- Modelo base kotoba-whisper-v2.0: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0
- Modelo base kotoba-whisper-bilingual-v1.0: https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Whisper large-v3 (OpenAI): https://huggingface.co/openai/whisper-large-v3
