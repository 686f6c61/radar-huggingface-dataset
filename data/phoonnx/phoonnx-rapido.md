# Phoonnx/phoonnx-rapido

## Resumen

phoonnx-rapido es un repositorio monorepo de voces del sistema de síntesis de voz **Rápido**, empaquetadas para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). El modelo subyacente, desarrollado originalmente por edwixx como `edwixx/rapido-tts`, es un transformer de flow matching de 21 millones de parámetros que opera sobre el decodificador AudioVAE de VoxCPM2 y genera audio a 48 kHz a partir de grafemas en portugués brasileño (pt-BR). Este repositorio no entrena un modelo nuevo: redistribuye los pesos originales convertidos a ONNX y los estructura en subcarpetas con un `config.json` compatible con phoonnx.

La relevancia de esta ficha es doble. Por un lado, Rápido es un TTS extremadamente ligero (21M de parámetros, 251 MB en fp32) que cabe en CPU y se ejecuta con un factor de tiempo real de 0,44 en un portátil con 4 hilos. Por otro, el repositorio forma parte del espejo comunitario de phoonnx alojado por OpenVoiceOS, lo que facilita su integración en asistentes de voz locales sin depender de servicios en la nube.

Cada subcarpeta contiene cuatro grafos ONNX (`model.onnx` para el modelo de flow, más `text_encoder.onnx`, `aligner.onnx` y `decoder.onnx` como grafos auxiliares) y un `config.json`. El repositorio incluye dos variantes publicadas: pesos fp32 y una versión con el modelo de flow cuantizado dinámicamente a int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching sobre decodificador VoxCPM2 AudioVAE |
| Parametros totales | 21M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32; int8 dinamico (solo modelo de flow); int8 en los cuatro grafos (no publicado) |
| Idiomas soportados | portugues brasileño (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuatro grafos: model, text_encoder, aligner, decoder) |

## Arquitectura y entrenamiento

Rápido es un transformer de flow matching de 21M de parámetros que toma grafemas como entrada y produce audio a 48 kHz a través del decodificador AudioVAE de VoxCPM2. El pipeline se descompone en cuatro grafos ONNX independientes: un codificador de texto (`text_encoder.onnx`), un alineador (`aligner.onnx`), el modelo de flow propiamente dicho (`model.onnx`) y el decodificador de audio (`decoder.onnx`). La voz resultante soporta 42 hablantes distintos en portugués brasileño.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. La única innovación destacable documentada es la propia arquitectura de flow matching sobre AudioVAE, que permite generar audio de alta calidad con un modelo de tamaño muy reducido.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de grafemas en portugués brasileño.
- Generación de audio a 48 kHz mediante el decodificador AudioVAE de VoxCPM2.
- Soporte de 42 hablantes distintos (selección de voz por identificador).
- Ejecución en CPU sin GPU, gracias a su tamaño reducido y a los grafos ONNX optimizados.
- Cuantización int8 del modelo de flow con pérdida de calidad mínima (WER idéntico al fp32 en la evaluación publicada).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- **Asistentes de voz locales en dispositivos de bajos recursos**: el modelo cabe en 251 MB en fp32 y se ejecuta en CPU con un factor de tiempo real de 0,44, lo que lo hace adecuado para Raspberry Pi, routers o portátiles sin GPU que necesiten síntesis de voz en portugués brasileño sin conexión a internet.
- **Lectura de notificaciones y accesibilidad**: integración en lectores de pantalla o sistemas de accesibilidad para usuarios brasileños, aprovechando los 42 hablantes disponibles para personalizar la voz según preferencias del usuario.
- **Sistemas de megafonía y anuncios automatizados**: generación de avisos pregrabados o dinámicos en portugués brasileño para transporte público, comercios o aeropuertos, donde la latencia no es crítica y el coste por inferencia en CPU es despreciable.
- **Integración en asistentes domésticos basados en OpenVoiceOS**: el repositorio forma parte del espejo comunitario de phoonnx, por lo que se integra directamente en el ecosistema de asistentes de voz locales de OpenVoiceOS mediante el índice de voces de phoonnx.
- **Generación de audiolibros y contenido educativo**: síntesis de textos largos en pt-BR con selección de hablante, ejecutándose en servidores sin GPU o en estaciones de trabajo modestas.
- **Pruebas y desarrollo de pipelines TTS**: al ser un modelo Apache 2.0 de 21M de parámetros con grafos ONNX bien separados, sirve como banco de pruebas para experimentar con cuantización, sustitución de decodificadores o integración en pipelines de phoonnx sin incurrir en costes de GPU.
- **Prototipado de interfaces conversacionales en portugués**: combinado con un ASR ligero, permite construir bucles de voz completos en local para demos y pruebas de concepto.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre seis frases en pt-BR, hablante 0, onnxruntime 1.31.1 en CPU de portátil con 4 hilos. El WER se calcula con `nemo-parakeet-tdt-0.6b-v3` (onnx-asr, int8).

| Pesos | Tamano | WER | Factor de tiempo real |
|---|---|---|---|
| fp32 | 251 MB | 1/67 | 0,44 |
| Modelo de flow int8 | 208 MB | 1/67 | 0,40 |
| Los cuatro grafos int8 (no publicado) | 183 MB | 2/67 | 0,55 |

El único error en las voces publicadas es la transcripción de "quinze" como "15". Con los cuatro grafos en int8, el reconocedor también omite la "a" en "a cada" y la ejecución es más lenta, porque el decodificador está compuesto mayoritariamente por convoluciones que la cuantización dinámica deja en fp32.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime.
- **GPU recomendadas**: no se especifican; cualquier GPU con soporte de ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- **Consumer GPU**: no es necesario; el modelo cabe y se ejecuta en CPU de portátil con 4 hilos.
- **Opciones de despliegue**: ONNX Runtime (versión probada: 1.31.1) y la librería phoonnx, que descarga los grafos auxiliares a partir del índice de voces. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS ONNX).
- **Latencia y throughput**: factor de tiempo real de 0,44 en fp32 y 0,40 con el modelo de flow en int8, sobre CPU de portátil con 4 hilos y seis frases de prueba. Esto implica que la síntesis es más rápida que el tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| phoonnx-rapido (Rápido) | 21M | no disponible | pt-BR | Apache 2.0 | ONNX | 42 hablantes, 48 kHz, CPU-friendly |
| VoxCPM2 | no disponible | no disponible | no disponible | no disponible | no disponible | Decodificador AudioVAE usado por Rápido; no se dispone de ficha comparativa |
| Piper | no disponible | no disponible | multiidioma | no disponible | ONNX | TTS ligero para CPU; no se dispone de datos concretos en la informacion proporcionada |
| Coqui TTS | no disponible | no disponible | multiidioma | no disponible | varios | Suite TTS completa; no se dispone de datos concretos en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa rigurosa con alternativas concretas. Los modelos citados se incluyen como referencia de categoría (TTS ligero para CPU), pero sus parámetros, contexto y rendimiento no están documentados en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo soporta portugués brasileño (pt-BR); no se documenta soporte de otras variantes del portugués ni de otros idiomas.
- **Calidad limitada por el corpus de evaluación**: la evaluación se basa en solo seis frases y un único hablante (hablante 0), por lo que el WER de 1/67 no es estadísticamente representativo de todos los hablantes ni de todos los dominios.
- **Cuantización int8 parcial**: el modelo de flow en int8 mantiene el WER, pero la cuantización de los cuatro grafos degrada la calidad (2/67) y es más lenta, porque el decodificador convolucional permanece en fp32.
- **Riesgo de alucinación en TTS**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, omisiones o artefactos en textos con grafemas ambiguos, números o palabras poco frecuentes; el caso documentado de "quinze" transcrito como "15" es un ejemplo.
- **Sesgos no documentados**: no se dispone de información sobre la composición demográfica de los 42 hablantes ni sobre posibles sesgos de prosodia, acento o género.
- **Licencia Apache 2.0**: permite uso comercial, pero el repositorio es un espejo de `edwixx/rapido-tts`; conviene verificar la licencia del modelo base y del decodificador VoxCPM2 antes de un despliegue en producción.
- **Dependencia de phoonnx**: el uso previsto requiere la librería phoonnx y su índice de voces para descargar los grafos auxiliares; no es un paquete autónomo de un solo archivo.
- **Sin datos de entrenamiento**: no se documenta el corpus, el número de tokens ni el proceso de alineación, lo que dificulta evaluar la cobertura lingüística y los sesgos del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/phoonnx-rapido
- Modelo base: https://huggingface.co/edwixx/rapido-tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Colección phoonnx community mirror: https://huggingface.co/collections/OpenVoiceOS/phoonnx-community-mirror-6a2204d302e0e7497870cd68
