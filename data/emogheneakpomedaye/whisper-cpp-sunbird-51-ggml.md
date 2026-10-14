# EmogheneAkpomedaye/Whisper.cpp-Sunbird-51-GGML

## Resumen

Este repositorio contiene conversiones al formato GGML del modelo Sunbird/asr-whisper-51-african-languages, publicadas por el usuario EmogheneAkpomedaye para su uso con whisper.cpp. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion de un modelo ASR (reconocimiento automatico del habla) orientado especificamente a 51 idiomas africanos. El repositorio incluye dos ficheros: una version completa en FP16 (ggml-sunbird-51.bin) y una version cuantizada a Q5_0 (ggml-sunbird-51-q5_0.bin).

La relevancia de esta publicacion es practica: el modelo original de Sunbird AI esta distribuido en formato Hugging Face (safetensors), lo que dificulta su ejecucion en entornos ligeros o sin GPU. Las conversiones GGML permiten desplegar el sistema de transcripcion en CPU, en dispositivos de borde o en contenedores sin dependencias de PyTorch, mediante whisper.cpp y su CLI whisper-cli.

El repositorio no aporta ficha tecnica propia sobre parametros, contexto, dataset de entrenamiento ni resultados de benchmarks; unicamente documenta el proceso de conversion reproducible con Docker y los comandos de inferencia. Cualquier dato sobre el modelo subyacente debe consultarse en el repositorio original de Sunbird AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), segun el modelo original de Sunbird |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos Whisper procesan ventanas de audio de 30 s por defecto) |
| Tipos de cuantizacion | FP16 sin cuantizar y Q5_0 (cuantizacion de 5 bits de punto fijo) |
| Idiomas soportados | 51 idiomas africanos, segun la model card del autor |
| Licencia | Apache License 2.0 (heredada del modelo original Sunbird) |
| Formato de pesos | GGML (.bin), compatible con whisper.cpp |
| Tamano del repositorio | 4,2 GB (incluye ambos ficheros) |
| Pipeline declarado | no disponible |
| Fecha de publicacion | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Whisper de OpenAI: un transformer encoder-decoder entrenado para transcripcion y traduccion de voz, que procesa el audio en ventanas de 30 segundos y dispone de tokens especiales para marcar idioma y tarea. El modelo subyacente es Sunbird/asr-whisper-51-african-languages, desarrollado por Sunbird AI con el objetivo de cubrir un conjunto amplio de lenguas africanas habitualmente infrarrepresentadas en los sistemas ASR genericos.

No se dispone de informacion sobre el numero de tokens de audio utilizados en el entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de ajuste fino con RLHF o DPO. La model card de este repositorio se limita a describir el proceso de conversion: clonar whisper.cpp y OpenAI Whisper, descargar el modelo de Sunbird desde Hugging Face, anadir los ficheros vocab.json y added_tokens.json de Whisper, compilar whisper.cpp, convertir el modelo a GGML FP16 y cuantizar posteriormente a Q5_0. No se documenta ninguna innovacion arquitectonica adicional sobre Whisper mas alla del ajuste a lenguas africanas.

## Capacidades

- Transcripcion de voz a texto (ASR) en 51 idiomas africanos, segun la documentacion del autor.
- Deteccion y seleccion de idioma mediante el parametro `-l` del CLI de whisper.cpp, sujeto al mapeo de tokens de idioma incluido en el modelo convertido.
- Ejecucion en CPU mediante whisper.cpp, sin necesidad de GPU ni de PyTorch en tiempo de inferencia.
- Uso de hilos y procesadores configurable (`-t` y `-p`) para ajustar el rendimiento segun el hardware.
- Soporte de entrada de audio en ficheros (por ejemplo MP3) mediante FFmpeg en el proceso de conversion y en la CLI.
- Cuantizacion Q5_0 disponible para reducir el tamano del modelo y el consumo de memoria.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modos de razonamiento extendido, ya que es un modelo ASR.

## Casos de uso

- Transcripcion de reuniones y actas en organizaciones que operan en varios idiomas africanos: el modelo cubre 51 lenguas segun el autor, lo que permite un unico pipeline para entornos multilingues regionales.
- Subtitulado de contenido audiovisual local: se puede integrar la CLI de whisper.cpp en un pipeline de postproduccion para generar subtitulos en idiomas africanos a partir de pistas de audio.
- Atencion al cliente en centros de contacto: transcripcion de llamadas grabadas para analitica, control de calidad y busqueda posterior, ejecutable en servidores sin GPU gracias al formato GGML.
- Archivo y digitalizacion de material sonoro historico o radiofonico: procesamiento por lotes en CPU con la version Q5_0 para reducir costes de infraestructura.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones iniciales que despues se corrigen manualmente para construir datasets en lenguas con pocos recursos.
- Aplicaciones de accesibilidad: dictado y transcripcion local en dispositivos de borde para personas con dificultades de escritura, empleando el modelo cuantizado para caber en memoria reducida.
- Verificacion de contenido y moderacion: transcripcion previa de audio para alimentar sistemas de analisis textual en plataformas que operan en regiones africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye valores de WER (word error rate), comparativas con Whisper large-v3 ni evaluaciones por idioma. Para obtener metricas de referencia es necesario consultar el repositorio original Sunbird/asr-whisper-51-african-languages.

## Requisitos de hardware

- VRAM y memoria: no disponible de forma exacta. Como referencia, el repositorio ocupa 4,2 GB e incluye la version FP16 y la Q5_0. La version Q5_0 reduce el consumo respecto a FP16 y es la recomendada para entornos con memoria limitada.
- Ejecucion en CPU: es el escenario principal de whisper.cpp. No requiere GPU y puede correr en servidores convencionales; conviene ajustar los hilos (`-t`) y los procesadores (`-p`) al numero de nucleos disponibles.
- GPU: no se especifican modelos recomendados. Al no declararse el tamano del modelo en parametros, no es posible confirmar si cabe en GPUs de consumo como una RTX 4090; depende del tamano real del modelo subyacente.
- Opciones de despliegue: whisper.cpp (CLI whisper-cli), contenedor Docker reproducible segun el Dockerfile incluido, y cualquier integracion que consuma el formato GGML. No se documenta soporte de vLLM, TGI ni Ollama para este repositorio.
- Latencia y throughput: no disponibles. Dependeran del tamano del modelo, la cuantizacion elegida, el numero de hilos y el hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Whisper.cpp-Sunbird-51-GGML) | Conversion GGML de un modelo ASR | 51 idiomas africanos | GGML (.bin), FP16 y Q5_0 | Apache 2.0 (heredada) | Hugging Face, whisper.cpp |
| Sunbird/asr-whisper-51-african-languages | Modelo ASR original | 51 idiomas africanos | safetensors (Hugging Face) | Apache 2.0 | Hugging Face |
| OpenAI Whisper (large-v3) | Modelo ASR generico | Multilingue general (no especifico para Africa) | safetensors, GGML | MIT (segun el proyecto original) | Hugging Face, whisper.cpp |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada. La diferencia principal entre este repositorio y el modelo original de Sunbird es el formato de pesos: GGML frente a safetensors. Frente a Whisper large-v3, la ventaja declarada es la cobertura especifica de lenguas africanas, aunque no se aportan metricas que lo cuantifiquen.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo ni de equidad entre los distintos idiomas africanos cubiertos, por lo que puede existir un rendimiento desigual entre lenguas con mas o menos datos de entrenamiento.
- Riesgo de alucinacion y de transcripcion incorrecta: como todo modelo Whisper, puede generar texto plausible cuando el audio es ruidoso o el idioma no esta bien representado, incluso en silencios.
- El comportamiento de seleccion de idioma depende del mapeo de tokens de idioma incluido en el modelo convertido; el autor advierte de que debe usarse el codigo de idioma correcto segun la version de whisper.cpp.
- El repositorio no declara licencia propia de forma explicita en los metadatos de Hugging Face (el campo aparece como no disponible); la licencia aplicable se hereda del modelo original (Apache 2.0). Se recomienda verificar los terminos en el repositorio de Sunbird antes de un uso comercial.
- No se documentan limitaciones de contexto mas alla del comportamiento estandar de Whisper (ventanas de audio de 30 segundos).
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre la calidad de la conversion.
- Al ser una conversion no oficial, la fidelidad de los pesos cuantizados a Q5_0 respecto al original no esta verificada con metricas publicadas.
- No se especifica el tamano en parametros del modelo subyacente, lo que dificulta estimar requisitos de hardware o compararlo con alternativas.

## Enlaces

- Repositorio de la conversion GGML: https://huggingface.co/EmogheneAkpomedaye/Whisper.cpp-Sunbird-51-GGML
- Modelo original de Sunbird AI: https://huggingface.co/Sunbird/asr-whisper-51-african-languages
- whisper.cpp (proyecto y runtime): https://github.com/ggml-org/whisper.cpp
- OpenAI Whisper: https://github.com/openai/whisper
- Ficheros de vocabulario de referencia: https://huggingface.co/openai/whisper-large-v3
