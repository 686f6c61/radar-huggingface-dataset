# aoiandroid/nb-whisper-small-whisperkit-coreml-ios

## Resumen

`aoiandroid/nb-whisper-small-whisperkit-coreml-ios` es un espejo (mirror) del modelo NbAiLab/nb-whisper-small convertido al formato Core ML para su uso con WhisperKit en dispositivos Apple. No se trata de un modelo entrenado desde cero, sino de una redistribucion sin modificaciones de una conversion ya existente, publicada por el usuario aoiandroid con fines de integracion en aplicaciones iOS. El modelo subyacente, nb-whisper-small, es un ajuste fino del Whisper small de OpenAI realizado por la Biblioteca Nacional de Noruega (NbAiLab) para reconocimiento automatico del habla en noruego.

Tecnicamente hereda la arquitectura encoder-decoder de tipo Transformer propia de Whisper small, con soporte multilingue pero optimizada para noruego (etiquetas de idioma `no` y `nb`). La distribucion en Core ML permite ejecucion on-device en iPhone, iPad y Mac con aceleracion por Neural Engine y GPU de Apple, sin depender de servicios en la nube.

Su relevancia actual radica en que facilita el despliegue de transcripcion de voz en noruego dentro del ecosistema Apple mediante WhisperKit, un framework de Argmax para inferencia de audio en Swift. La licencia Apache 2.0 y su tamano reducido (repositorio de 0,5 GB) lo hacen apto para aplicaciones moviles con requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper small del modelo base) |
| Parametros totales | ≈244 M (heredados de Whisper small; no confirmado de forma explicita en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (equivalente estandar de Whisper small, no confirmado en la ficha) |
| Tipos de cuantizacion | Modelos Core ML; variantes de cuantizacion concretas no disponibles en la informacion proporcionada |
| Idiomas soportados | Noruego (`no`) y noruego bokmal (`nb`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (WhisperKit / Core ML) mas tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de Whisper small de OpenAI: un Transformer encoder-decoder disenado para reconocimiento automatico del habla, que procesa espectrogramas Mel en ventanas de audio. NbAiLab partio de los pesos de Whisper small y los ajusto con datos de habla en noruego para mejorar la transcripcion en ese idioma, dando lugar a nb-whisper-small. Sobre ese modelo, el usuario Barrymanalow realizo la conversion a Core ML, que posteriormente aoiandroid ha redistribuido como espejo.

No se dispone de informacion sobre el volumen exacto de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el ajuste fino original de NbAiLab. La model card indica explicitamente que la redistribucion es "sin modificaciones" (unmodified redistribution) bajo Apache 2.0, por lo que este repositorio no introduce ningun entrenamiento ni innovacion tecnica adicional: su valor anade es exclusivamente el empaquetado en Core ML para WhisperKit.

## Capacidades

- Reconocimiento automatico del habla (ASR) en noruego y noruego bokmal.
- Transcripcion de audio a texto en ventanas de hasta 30 segundos por pasada.
- Traduccion de voz a texto en ingles como capacidad heredada del modelo Whisper subyacente (no verificada especificamente para este ajuste en la informacion disponible).
- Ejecucion on-device en hardware Apple mediante WhisperKit y Core ML, con aceleracion por Neural Engine.
- Funcionamiento sin conexion a internet, lo que favorece la privacidad de los datos de audio.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento, ya que es un modelo exclusivamente de ASR.
- No se documentan capacidades de vision, audio generativo ni procesamiento multimodal.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones iOS: el modelo se integra mediante WhisperKit para convertir grabaciones de audio en texto en noruego directamente en el dispositivo, sin enviar datos a servidores.
- Subtitulado automatico en tiempo real de contenido audiovisual noruego: la app puede procesar fragmentos de 30 segundos y generar subtitulos sin conexion.
- Asistentes de voz para aplicaciones noruegas: transcripcion local de comandos o dictado en noruego bokmal, reduciendo latencia al no depender de la nube.
- Herramientas de accesibilidad: dictado y transcripcion para usuarios con discapacidad motora o auditiva en entornos Apple, manteniendo la privacidad del audio.
- Aplicaciones de traduccion (como TranslateBlue, mencionada en la model card): reconocimiento de voz en noruego como primer paso de un pipeline de traduccion, con la transcripcion ejecutandose de forma local.
- Documentacion clinica o legal con requisitos de confidencialidad: transcripcion de entrevistas en noruego en un Mac o iPad sin que el audio abandone el dispositivo.
- Investigacion en lingiiistica del noruego: generacion de transcripciones masivas y automatizadas de corpus orales para su analisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de una conversion Core ML de un modelo de ≈244 M de parametros, el archivo del repositorio ocupa aproximadamente 0,5 GB.
- Pensado para ejecucion en hardware Apple: iPhone (a partir de modelos con Neural Engine, tipicamente A12 Bionic o superiores), iPad y Mac con chip M1 o posterior.
- Acelera sobre el Apple Neural Engine, GPU integrada o CPU, segun la configuracion de WhisperKit.
- No esta disenado para GPU dedicadas NVIDIA ni para servidores con CUDA; no se proporcionan estimaciones de VRAM para A100, H100 o RTX 4090.
- Opciones de despliegue: WhisperKit (framework Swift) y Core ML. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a modelos de audio Core ML.
- No se proporcionan cifras de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/modo | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| aoiandroid/nb-whisper-small-whisperkit-coreml-ios | ≈244 M | Ventanas de audio de 30 s | Noruego (no, nb) | Apache 2.0 | Core ML |
| NbAiLab/nb-whisper-small (modelo base) | ≈244 M | Ventanas de audio de 30 s | Noruego (no, nb) | Apache 2.0 | PyTorch / safetensors |
| openai/whisper-small | ≈244 M | Ventanas de audio de 30 s | Multilingue (99 idiomas) | Apache 2.0 | PyTorch / safetensors |
| Barrymanalow/nb-whisper-coreml | ≈244 M | Ventanas de audio de 30 s | Noruego (no, nb) | Apache 2.0 | Core ML |

La diferencia principal frente al modelo base y frente a whisper-small de OpenAI reside en el formato: este repositorio ofrece pesos Core ML listos para WhisperKit, mientras que los otros requieren conversion previa. En cuanto a precision y rendimiento, no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo de redistribucion, no un modelo nuevo: no incorpora mejoras sobre nb-whisper-small ni sobre la conversion Core ML original.
- El alcance linguistico se limita a noruego y noruego bokmal; no esta pensado para otros idiomas, pese a que Whisper small base sea multilingue.
- Riesgo de alucinacion y de errores de transcripcion en audio con ruido, acentos marcados, jerga o solapamiento de hablantes, comportamiento comun en la familia Whisper.
- No se documentan sesgos especificos del ajuste noruego ni del corpus de entrenamiento utilizado por NbAiLab.
- La licencia Apache 2.0 permite uso comercial, pero el autor del espejo advierte que todos los creditos corresponden a NbAiLab y al conversor original; conviene verificar los terminos del repositorio fuente.
- No se especifican las variantes de cuantizacion incluidas, lo que puede afectar al equilibrio entre precision y consumo de recursos en dispositivos concretos.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni evidencia de uso en produccion.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso, dado que es un modelo exclusivamente de reconocimiento de voz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aoiandroid/nb-whisper-small-whisperkit-coreml-ios
- Modelo base (NbAiLab/nb-whisper-small): https://huggingface.co/NbAiLab/nb-whisper-small
- Conversion Core ML original (Barrymanalow/nb-whisper-coreml): https://huggingface.co/Barrymanalow/nb-whisper-coreml
- WhisperKit / Argmax OSS Swift: https://github.com/argmaxinc/argmax-oss-swift
- Coleccion Whisper de aoiandroid: https://huggingface.co/collections/aoiandroid/whisper
- Repositorio aoiandroid/whisper-small.en: https://huggingface.co/aoiandroid/whisper-small.en
- Whisper-Small en Qualcomm AI Hub: https://aihub.qualcomm.com/models/whisper_small
