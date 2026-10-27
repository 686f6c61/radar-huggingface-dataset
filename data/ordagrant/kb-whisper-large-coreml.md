# Ordagrant/kb-whisper-large-coreml

## Resumen

Ordagrant/kb-whisper-large-coreml es una conversion a Core ML del modelo KBLab/kb-whisper-large, un ajuste fino en sueco de Whisper large-v3 desarrollado por KBLab (Laboratorio Nacional de Suecia, dependiente de la Biblioteca Nacional). La conversion la firma el usuario Ordagrant y esta empaquetada con whisperkittools para su uso con WhisperKit, el runtime de reconocimiento de voz en Swift mantenido por Argmax para el ecosistema Apple.

El objetivo del artefacto no es mejorar la precision del modelo original, sino hacerlo ejecutable de forma nativa en dispositivos Apple (Mac con Apple Silicon, iPhone, iPad) aprovechando Core ML y el Neural Engine, sin depender de Python ni de servidores externos. El paquete ocupa 0,9 GB, un tamano compatible con inferencia local en hardware de consumo y muy inferior al de los pesos en fp16 del modelo base.

La relevancia es practica: permite transcripcion de audio en sueco totalmente offline y con latencia baja en aplicaciones nativas de macOS e iOS. El modelo hereda la arquitectura transformer encoder-decoder de Whisper large-v3 (aproximadamente 1550 millones de parametros) y la licencia Apache 2.0 del modelo fuente. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a Core ML |
| Parametros totales | ~1550 M (arquitectura del modelo base Whisper large-v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por inferencia; hasta 448 tokens en el decodificador |
| Tipos de cuantizacion | Esquema exacto no disponible; el paquete Core ML ocupa 0,9 GB, por debajo de los ~3 GB de los pesos en fp16, lo que implica compresion de pesos (paletizacion o cuantizacion) no documentada en detalle |
| Idiomas soportados | Sueco (sv); el modelo base es multilingue, pero el ajuste fino esta orientado a sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete Core ML para WhisperKit (incluye tokenizer, configuracion y ficheros NOTICE/conversion.json); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con entrada log-Mel de 128 canales, encoder convolucional mas capas de autoatencion, y un decodificador autorregresivo que procesa ventanas de audio de 30 segundos y genera tokens de transcripcion, marcas de tiempo y etiquetas de idioma. KBLab partio de los pesos de OpenAI y realizo un ajuste fino supervisado sobre corpus de habla sueca; la model card de este repositorio no detalla el volumen de horas, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos deben consultarse en la ficha del modelo base.

La aportacion tecnica de este repositorio es exclusivamente la conversion: se ha usado whisperkittools para traducir los pesos a Core ML y generar un paquete compatible con WhisperKit, con los metadatos de receta en `conversion.json` y las licencias en `NOTICE.md`. No se documentan innovaciones de decodificacion propias (decodificacion especulativa, atencion lineal ni similares); WhisperKit aporta por su parte utilidades de segmentacion de audio y gestion de ventanas deslizantes en el runtime.

## Capacidades

- Transcripcion de voz a texto en sueco sobre ventanas de audio de hasta 30 segundos, con concatenacion de segmentos por parte del runtime.
- Generacion de marcas de tiempo a nivel de segmento y, segun la configuracion de WhisperKit, a nivel de palabra.
- Deteccion de idioma y traduccion al ingles heredadas de Whisper large-v3, aunque no son el objetivo del ajuste fino y su calidad en sueco-especifico no esta documentada.
- Ejecucion local en dispositivo mediante Core ML, con acceso potencial al Neural Engine de los chips Apple Silicon y A-series.
- Funcionamiento sin conexion a red, adecuado para entornos con requisitos de privacidad.
- No soporta tool calling, function calling, agentes, vision, audio generation ni modos de razonamiento extendido: es un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones en empresas suecas: el modelo procesa el audio por ventanas de 30 s dentro de una app nativa de macOS, sin enviar grabaciones a la nube, lo que simplifica el cumplimiento del RGPD.
- Subtitulado de pódcast y video en sueco: la salida con marcas de tiempo permite generar ficheros de subtitulos directamente desde una herramienta de escritorio en Swift.
- Digitalizacion de archivos orales: instituciones como la Biblioteca Nacional de Suecia pueden transcribir colecciones de entrevistas y grabaciones historicas en lotes sobre equipos Mac, sin coste de API por hora de audio.
- Asistentes de voz y dictado en apps iOS: integracion mediante WhisperKit para captura de notas de voz y dictado en sueco con latencia local y funcionamiento offline.
- Analisis de calidad en atencion al cliente: transcripcion de llamadas grabadas en sueco para busqueda de palabras clave y auditoria posterior, ejecutada en estaciones de trabajo Apple.
- Herramientas de accesibilidad: generacion de transcripciones en vivo para personas con discapacidad auditiva en entornos presenciales, usando un Mac o iPad como equipo de captura.
- Investigacion en linguistica sueca: transcripcion masiva de corpus para analisis lexico o entrenamiento de modelos posteriores, con la ventaja de no depender de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion Core ML. Para cifras de tasa de error de palabra (WER) del modelo original, debe consultarse la model card de KBLab/kb-whisper-large. Tampoco se documentan mediciones de latencia, throughput en tiempo real (factor RTF) ni comparativas con el modelo en PyTorch sobre el mismo hardware.

## Requisitos de hardware

- VRAM/memoria unificada estimada: en torno a 1 GB para los pesos del paquete (0,9 GB) mas el espacio de activaciones y buffers de audio; cifra exacta no disponible.
- Hardware objetivo: Mac con Apple Silicon (serie M) y dispositivos iPhone/iPad con Neural Engine. La inferencia se ejecuta a traves de Core ML, no de CUDA.
- No es ejecutable en GPUs NVIDIA ni en servidores x86 convencionales; no cabe plantearlo en A100, H100 o RTX 4090.
- Encaja en hardware de consumo Apple, incluidos portatiles MacBook Air de gama base, al estar disenado precisamente para ese escenario.
- Opciones de despliegue: WhisperKit (paquete Swift para iOS y macOS); tambien es posible cargar el paquete Core ML directamente con la API de Core ML. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje en formato GGUF/safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el uso del Neural Engine suele ofrecer inferencia en tiempo real o superior en modelos Whisper de este tamano, pero no hay mediciones publicadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Ordagrant/kb-whisper-large-coreml | ~1550 M | 30 s de audio, 448 tokens de decodificador | Sueco | Apache 2.0 | Core ML / WhisperKit en Apple |
| KBLab/kb-whisper-large | ~1550 M | 30 s de audio, 448 tokens de decodificador | Sueco | Apache 2.0 | Safetensors / PyTorch, requiere GPU o CPU |
| openai/whisper-large-v3 | ~1550 M | 30 s de audio, 448 tokens de decodificador | Multilingue (99 idiomas) | Apache 2.0 | Safetensors / PyTorch, transformers, faster-whisper |
| openai/whisper-large-v3-turbo | ~809 M | 30 s de audio, 448 tokens de decodificador | Multilingue | Apache 2.0 | Safetensors / PyTorch; versiones Core ML de terceros |

La diferencia clave frente al modelo original de KBLab es el formato y el runtime, no la calidad esperada del reconocimiento: los pesos deberian comportarse de forma equivalente si la conversion no ha degradado la precision, extremo que no se ha verificado publicamente. Frente a whisper-large-v3, este modelo pierde cobertura multilingue amplia a cambio de un ajuste especifico en sueco, presumiblemente con mejor WER en ese idioma (sin cifras disponibles en la informacion proporcionada).

## Limitaciones y advertencias

- Cobertura linguistica restringida: el ajuste fino esta orientado a sueco; el rendimiento en otros idiomas puede degradarse respecto al modelo multilingue original.
- Ventana de audio fija de 30 segundos por inferencia: la transcripcion de audios largos depende de la segmentacion que implemente WhisperKit, con riesgo de cortes en palabras si la gestion de solapamiento no esta bien ajustada.
- Riesgo de alucinacion conocido en Whisper: en tramos de silencio, ruido o musica el modelo puede generar texto inventado o repetir frases; conviene aplicar umbrales de confianza y deteccion de no-habla en produccion.
- Sin diarizacion de hablantes ni etiquetado de quien habla; para reuniones multiparticipante hace falta un componente adicional.
- Sin soporte de tool calling ni de razonamiento multi-paso; no es un modelo de proposito general.
- Conversion no validada por la comunidad: el repositorio presenta cero descargas y cero valoraciones, y no hay informes publicos de calidad de la cuantizacion aplicada ni comparativas de WER contra el modelo original.
- Dependencia de la plataforma Apple: la licencia Apache 2.0 permite uso comercial, pero el despliegue queda tecnicamente ligado a Core ML y a los requisitos de version de sistema de WhisperKit (no especificados en la model card).
- Se recomienda revisar `licenses/NOTICE.md` y `conversion.json` del repositorio para conocer la receta exacta de conversion y las atribuciones exigidas.
- Ausencia de datos sobre sesgos: no se documenta la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos dialectales, de edad o de genero en el reconocimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ordagrant/kb-whisper-large-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-large
- Proyecto Ordagrant (repositorio del autor de la conversion): https://github.com/svenclaesson/ordagrant
- WhisperKit (runtime Swift para Core ML): https://github.com/argmaxinc/WhisperKit
- whisperkittools (herramientas de conversion): https://github.com/argmaxinc/whisperkittools
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Modelo Whisper large-v3 de OpenAI: https://huggingface.co/openai/whisper-large-v3
