# mattt/parakeet-tdt-0.6b-v3-coreml

## Resumen

Parakeet TDT 0.6B v3 for Core ML es una conversión del modelo de reconocimiento automático de voz nvidia/parakeet-tdt-0.6b-v3 de NVIDIA al formato Core ML, publicada por el desarrollador mattt. El objetivo es permitir la transcripción de voz local en dispositivos Apple Silicon (iPhone, iPad y Mac) sin depender de servicios en la nube, integrándose con la librería AnySpeechRecognizer del mismo autor.

El modelo base emplea una arquitectura FastConformer como codificador acústico y un decodificador de tipo TDT (Token-and-Duration Transducer) con una red de predicción LSTM de dos capas y una red conjunta que decide token y duración de forma greedy. Con 0,6 GB de tamaño de repositorio y aproximadamente 600 millones de parámetros, está diseñado para ejecutarse en ventanas de audio de 15 segundos que producen 188 tramas de codificador de 80 ms cada una.

La relevancia de esta ficha radica en que es una conversión de cuantización, no un modelo nuevo: el codificador se cuantiza a int8 por canal y el resto de componentes se almacenan en float16, manteniendo la interfaz de tensores compatible con los artefactos de FluidInference. Soporta 25 idiomas europeos y se distribuye bajo licencia CC BY 4.0, la misma del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT (Token-and-Duration Transducer) con red de predicción LSTM de 2 capas y red conjunta |
| Parámetros totales | 0,6 B (aproximadamente 600 millones, según el nombre del modelo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 15 segundos (1.501 tramas de log-mel de 128 bins) por inferencia; requiere troceado para audios más largos |
| Tipos de cuantización | Codificador en int8 (cuantización lineal simétrica, una escala por canal de salida, solo pesos con 2.048 elementos o más); decodificador y red conjunta en float16; precisión de cómputo float16 |
| Idiomas soportados | 25 idiomas: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML ML Program (`.mlmodelc`) en float16 e int8, más vocabulario en JSON (`parakeet_vocab.json`) y metadatos en `conversion.json` |

## Arquitectura y entrenamiento

El modelo base nvidia/parakeet-tdt-0.6b-v3 combina un codificador FastConformer, una variante de Conformer con atención eficiente para secuencias de audio largas, con un decodificador Transducer TDT. La red de predicción es una LSTM de dos capas que se ejecuta paso a paso con estado explícito, y la red conjunta (`JointDecisionv3`) selecciona el token y su duración mediante decisión greedy sobre los 64 tokens más probables por trama del codificador.

Esta publicación concreta no entrena un modelo nuevo: es una conversión del archivo `parakeet-tdt-0.6b-v3.nemo` de NVIDIA (revisión `541d1f99c6b0c3cd0b11a95167540bb8edefd82b`). El proceso traza el modelo de TorchScript a un programa ML con destino de despliegue iOS 17 y macOS 14 y precisión de cómputo float16. Se divide en tres componentes independientes: codificador, red de predicción y red conjunta. Las herramientas utilizadas fueron Python 3.12.12, PyTorch 2.7.0, NeMo 2.3.1, coremltools 9.0, coremlcompiler 3600.25.1 y macOS 27.0.1, siguiendo el proyecto FluidInference/mobius (Apache-2.0). No se dispone de información sobre los datos de entrenamiento originales, el número de tokens ni si hubo ajuste por RLHF o DPO, ya que esos detalles pertenecen a la model card del modelo base y no se incluyen aquí.

## Capacidades

- Reconocimiento automático de voz (ASR) de audio a texto en 25 idiomas europeos.
- Transcripción multilingüe sobre el mismo modelo, sin necesidad de seleccionar idioma manualmente (según la lista de idiomas soportados).
- Decodificación TDT que predice simultáneamente token y duración, reduciendo el número de pasos frente a un decodificador Transducer estándar.
- Ejecución local en dispositivos Apple mediante Core ML, sin envío de audio a servidores externos.
- Procesamiento por ventanas de 15 segundos con salida de 188 tramas de codificador de 80 ms.
- Integración con la librería AnySpeechRecognizer.
- No se documentan capacidades de traducción, diarización de hablantes, detección de emociones, tool calling ni razonamiento multi-paso; el pipeline declarado es exclusivamente `automatic-speech-recognition`.

## Casos de uso

- Dictado y transcripción en apps iOS y macOS: el modelo se integra como componente Core ML y permite convertir voz a texto en tiempo real en el dispositivo, con ventanas de 15 segundos encadenadas para capturas continuas.
- Subtitulado automático de vídeo en reproducción local: al procesar audio en tramas de 80 ms y soportar 25 idiomas, encaja en reproductores que necesitan generar subtítulos sin conexión.
- Notas de reuniones con privacidad: al ejecutarse localmente en Apple Silicon, el audio sensible no sale del dispositivo, lo que resulta adecuado para entornos corporativos con requisitos de confidencialidad.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones almacenadas para alimentar un índice de texto sobre el que aplicar búsqueda.
- Asistentes de voz embebidos: el modelo puede actuar como capa de reconocimiento de un asistente que funcione sin red, encadenando la salida de texto con un motor de intenciones local.
- Accesibilidad: generación de subtítulos en directo para personas con discapacidad auditiva en aplicaciones de escritorio o móviles para el ecosistema Apple.
- Aplicaciones de campo sin conectividad: transcripción en escenarios con cobertura limitada (inspecciones, trabajo de campo) donde no es viable depender de una API en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de WER, latencia ni throughput, ni tablas comparativas con otros modelos.

## Requisitos de hardware

- Plataforma objetivo: Core ML con despliegue mínimo en iOS 17 y macOS 14, orientado a Apple Silicon.
- Aceleración: codificador, red de predicción y red conjunta diseñados para ejecutarse en Neural Engine, GPU o CPU de chips de la serie M mediante Core ML.
- VRAM estimada: no disponible. El repositorio completo ocupa 0,6 GB, con el codificador cuantizado a int8 y el resto en float16; el consumo en memoria durante la inferencia depende del runtime de Core ML.
- GPU compatibles: no aplica a GPU NVIDIA; el modelo está pensado para hardware Apple (Apple Silicon) a través de Core ML y no para CUDA.
- Ejecución en GPU de consumo: no procede en el sentido habitual (RTX 4090, etc.), ya que el formato `.mlmodelc` no es compatible con CUDA.
- Opciones de despliegue: Core ML nativo en apps iOS y macOS, AnySpeechRecognizer, y potencialmente herramientas que consuman artefactos Core ML; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de ASR en formato Core ML.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mattt/parakeet-tdt-0.6b-v3-coreml | 0,6 B | Ventana de audio de 15 s | Core ML (float16/int8) | CC BY 4.0 | Repositorio Core ML para Apple Silicon |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | Ventana de audio de 15 s | `.nemo` (NeMo) | CC BY 4.0 | Modelo base original para ejecución con NeMo |
| Otras conversiones Core ML de ASR (familia Whisper, FluidInference, etc.) | No disponible | No disponible | Core ML | No disponible | No disponible |

No se dispone de datos adicionales sobre modelos comparables en la información proporcionada, por lo que no se incluyen cifras de rendimiento ni de parámetros de alternativas.

## Limitaciones y advertencias

- El preprocesador no está incluido: es necesario generar las características log-mel de 128 bins compatibles con NeMo (1.501 tramas para 15 segundos) antes de alimentar el modelo.
- Ventana fija de 15 segundos: los audios más largos requieren troceado y ensamblado de resultados, lo que puede introducir errores en las fronteras entre fragmentos.
- Es una conversión de cuantización del modelo base: los sesgos y las limitaciones de precisión del reconocimiento de voz original se heredan y pueden acentuarse por la cuantización int8 del codificador.
- Riesgo de alucinación o de transcripciones incorrectas típico de los sistemas ASR, especialmente con audio ruidoso, acentos no representados o solapamiento de hablantes.
- La cobertura de idiomas se limita a los 25 idiomas europeos listados; otros idiomas no están soportados.
- Licencia CC BY 4.0: permite uso comercial, pero exige mantener la atribución a NVIDIA y al autor de la conversión en cualquier redistribución. Parte del proyecto de conversión sigue FluidInference/mobius (Apache-2.0).
- Compatibilidad restringida al ecosistema Apple: no se puede desplegar en servidores Linux con GPU NVIDIA ni en runtimes CUDA.
- No se documentan métricas de calidad (WER), latencia ni consumo de memoria, por lo que cualquier decisión de producción requiere una evaluación propia.
- No se documentan capacidades de diarización, traducción ni etiquetado de hablantes, lo que limita su uso directo en escenarios que las requieran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattt/parakeet-tdt-0.6b-v3-coreml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Librería AnySpeechRecognizer: https://github.com/mattt/AnySpeechRecognizer
- Proyecto de conversión FluidInference/mobius: https://github.com/FluidInference/mobius
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Conversión de referencia de FluidInference (interfaz de tensores compatible, `Encoder_v2.mlmodelc`, `Decoder.mlmodelc`, `JointDecisionv3.mlmodelc`): no disponible como enlace directo en la información proporcionada.
