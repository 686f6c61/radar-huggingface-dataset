# devendradhakad/autodroid-litert-community-whisper-tiny

## Resumen

`devendradhakad/autodroid-litert-community-whisper-tiny` es una conversion al formato TFLite/LiteRT del modelo de reconocimiento automatico del habla (ASR) `openai/whisper-tiny`. Lo publica el usuario de HuggingFace devendradhakad bajo licencia Apache 2.0, y su pipeline declarado es `automatic-speech-recognition`. Se trata, por tanto, de una redistribucion orientada al despliegue en el borde (edge) del modelo Whisper mas pequeno de OpenAI, no de un modelo entrenado desde cero.

La relevancia de este tipo de artefactos esta en el formato: LiteRT (antes TensorFlow Lite) permite ejecutar inferencia en dispositivos moviles, microcontroladores y sistemas embebidos con aceleracion por NNAPI, GPU delegada o Edge TPU, algo que los pesos originales en PyTorch no ofrecen de forma directa. Whisper-tiny, con unos 39 millones de parametros, es el candidato natural para transcripcion en tiempo real en hardware limitado.

Ahora bien, la informacion publica del repositorio es practicamente nula: cero descargas, cero "likes", un repositorio de 0,0 GB y una model card que solo contiene el front-matter de licencia y modelo base. No hay ficha tecnica, ni datos de entrenamiento propios, ni resultados de evaluacion, ni ejemplos de uso. Cualquier evaluacion rigurosa del artefacto exige descargarlo y verificarlo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada del modelo base `openai/whisper-tiny`) |
| Parametros totales | 39 millones (dato del modelo base; no confirmado en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s por segmento y decodificador de 448 tokens (caracteristica del modelo base `openai/whisper-tiny`) |
| Tipos de cuantizacion | no disponible en la model card; el contenedor LiteRT admite variantes float32, float16 e int8 |
| Idiomas soportados | no declarados en la model card; el modelo base `openai/whisper-tiny` declara reconocimiento multilingue y traduccion a ingles |
| Licencia | apache-2.0 |
| Formato de pesos | TFLite / LiteRT (etiqueta `tflite`) |

## Arquitectura y entrenamiento

El artefacto no documenta ningun entrenamiento propio. La model card unicamente declara el campo `base_model: openai/whisper-tiny` y la etiqueta de pipeline `automatic-speech-recognition`, lo que indica un proceso de conversion de pesos desde el checkpoint original de OpenAI al formato LiteRT, presumiblemente mediante el conversor oficial de TensorFlow Lite y el modulo `whisper` de OpenAI. No se especifica si la conversion incluye cuantizacion, ni la variante concreta (float32, float16 o int8), ni la herramienta empleada.

La arquitectura subyacente es la de Whisper-tiny: un transformer encoder-decoder de tipo seq2seq que consume espectrogramas mel logaritmicos de 80 canales sobre ventanas de 30 segundos, con atencion encoder-decoder y decodificacion autorregresiva con prefijos de token especiales para tarea e idioma. El preentrenamiento de Whisper (no verificable en este repositorio, pero documentado en el paper del modelo base, arXiv:2212.04356) se realizo sobre 680.000 horas de audio etiquetado debilmente, sin ajuste por RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en multiples idiomas, con el alcance heredado de `openai/whisper-tiny`.
- Traduccion de voz de otros idiomas a ingles mediante el token de tarea correspondiente.
- Deteccion automatica del idioma de entrada y etiquetado temporal a nivel de segmento.
- Inferencia en dispositivo con LiteRT: CPU, GPU delegada, NNAPI en Android y aceleradores Edge TPU.
- Ejecucion sin conexion a red, lo que permite escenarios de privacidad estricta.
- Tool calling / function calling: no soportado (el modelo base Whisper no dispone de esta capacidad).
- Comportamiento agentico o razonamiento multi-paso: no soportado.
- Capacidades multimodales mas alla del audio (vision, etc.): no soportadas.
- Modo "thinking", audio de salida o diarizacion de hablantes: no soportados.

## Casos de uso

- Transcripcion en tiempo real en aplicaciones Android: el modelo puede integrarse mediante LiteRT y NNAPI dentro de una app movil, procesando fragmentos de audio de 30 segundos sin enviar datos a la nube.
- Subtitulado de video en el borde: despliegue en Raspberry Pi o mini-PC para generar subtitulos de emisiones o grabaciones locales, con coste de computo bajo gracias al tamano del modelo.
- Asistentes de voz con privacidad estricta: entornos sanitarios, legales o industriales donde el audio no puede salir del dispositivo, aprovechando la ejecucion 100 % local del artefacto.
- Preprocesado de corpus de audio en pipelines de datos: etiquetado automatico masivo de grabaciones para construir datasets de ASR, filtrando despues con un modelo de mayor precision.
- Kioscos y terminales de atencion al publico: reconocimiento de comandos de voz de vocabulario acotado en hardware sin GPU dedicada.
- Accesibilidad: generacion de transcripciones en directo en dispositivos de bajo coste para personas con discapacidad auditiva.
- Domotica y dispositivos IoT con interfaz de voz: deteccion de frases cortas de control ejecutadas localmente sobre microcontroladores compatibles con LiteRT Micro en el limite de sus capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de WER (word error rate), latencia ni consumo, y el repositorio no dispone de ficheros de evaluacion asociados. Los resultados de `openai/whisper-tiny` publicados en el paper del modelo base no son directamente extrapolables a esta conversion, ya que la cuantizacion y el backend de ejecucion pueden alterar la precision.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia del modelo base, los pesos de 39 millones de parametros ocupan aproximadamente 150 MB en float32 y alrededor de 40 MB en int8, aunque el artefacto publicado (0,0 GB) no permite confirmar que los pesos esten incluidos.
- GPU: no requiere GPU. Cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650) o incluso GPU integrada es sobradamente suficiente si se usa un runtime que la aproveche.
- GPU de datacenter (A100, H100): innecesarias para este modelo; su uso solo tendria sentido para servir miles de peticiones concurrentes, no por requisitos de memoria o computo.
- Dispositivos de borde: CPU de movil moderna, Raspberry Pi 4/5, Coral Edge TPU y aceleradores con delegado NNAPI son objetivos naturales de LiteRT.
- Opciones de despliegue: intérprete LiteRT/TFLite (`tflite-runtime`, `tensorflow.lite.Interpreter`), Android con NNAPI o GPU delegate, MediaPipe, y Coral Edge TPU. La compatibilidad con `whisper.cpp`, vLLM, TGI, Ollama o llama.cpp no esta documentada y requeriria conversion adicional.
- Latencia y throughput: no disponible. No se han publicado mediciones de factor de tiempo real (RTF) para esta conversion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `devendradhakad/autodroid-litert-community-whisper-tiny` | 39 M (heredados) | TFLite / LiteRT | ventanas de 30 s (heredado) | apache-2.0 | repositorio publico con 0 descargas y 0,0 GB |
| `openai/whisper-tiny` | 39 M | PyTorch / safetensors | ventanas de 30 s | apache-2.0 | checkpoint de referencia, ampliamente usado |
| `openai/whisper-base` | 74 M | PyTorch / safetensors | ventanas de 30 s | apache-2.0 | mayor precision a mayor coste de computo |
| Otras conversiones comunitarias de Whisper a TFLite/LiteRT | no disponible | TFLite / LiteRT | no disponible | variable | no verificadas en la informacion proporcionada |

Los datos de parametros y contexto de `openai/whisper-tiny` y `openai/whisper-base` provienen de la documentacion publica de los modelos base, no de la informacion proporcionada en esta busqueda. No se dispone de comparativas de rendimiento del artefacto evaluado.

## Limitaciones y advertencias

- El repositorio presenta 0,0 GB de tamano, 0 descargas y 0 "likes"; es posible que no contenga los pesos convertidos o que solo incluya metadatos, por lo que debe verificarse su contenido antes de cualquier uso.
- La model card no aporta informacion sobre el proceso de conversion, la version de Whisper utilizada, la cuantizacion aplicada ni posibles degradaciones de precision.
- No hay ningun benchmark publicado, ni propio ni heredado, que permita estimar el WER de esta conversion.
- `whisper-tiny` es la variante menos precisa de la familia Whisper: su tasa de error es notablemente superior a la de `base`, `small` o `medium`, especialmente con audio ruidoso, acentos marcados, solapamiento de hablantes o vocabulario tecnico.
- Los modelos Whisper son propensos a alucinar texto en segmentos de silencio, ruido o musica, y a repetir fragmentos en decodificaciones largas.
- No se declaran los idiomas soportados por esta conversion; el rendimiento del modelo base en idiomas distintos del ingles es muy desigual y especialmente debil en lenguas con pocos recursos.
- La licencia Apache 2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y se indique los cambios realizados; no obstante, el autor de la conversion no ofrece garantias sobre el artefacto.
- La fecha de creacion declarada (2026-09-17) es atipica y no puede contrastarse con fuentes adicionales.
- La busqueda web asociada no devolvio ningun resultado relacionado con el modelo, por lo que no existe documentacion externa, paper ni hilo de discusion que respalde su calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/devendradhakad/autodroid-litert-community-whisper-tiny
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- La busqueda web realizada no aporto enlaces adicionales relevantes sobre este modelo.
