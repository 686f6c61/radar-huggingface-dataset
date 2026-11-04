# Moipee/MossFormer2-SS-16K-CoreML

## Resumen

MossFormer2-SS-16K-CoreML es una conversión a Core ML del modelo de separación de habla MossFormer2_SS_16K de Alibaba, publicado originalmente en el marco de ClearerVoice-Studio. El modelo resuelve una tarea concreta de audio: separar una grabación mono de 16 kHz en la que dos personas hablan simultáneamente en dos pistas independientes, una por voz. La conversión la firma el usuario Moipee y mantiene la licencia Apache 2.0 del modelo original.

El modelo original, descrito en el artículo *MossFormer2: Combining Transformer and RNN-Free Recurrent Network for Enhanced Time-Domain Monaural Speech Separation* (ICASSP 2024) de Shengkui Zhao y colaboradores, es una arquitectura híbrida que combina atención tipo Transformer con una red recurrente sin recurrencia explícita. Esta versión Core ML fija la entrada a 32.776 muestras (2,05 segundos a 16 kHz) para evitar máscaras de padding en la atención y usa pesos en float16, lo que la hace apta para ejecución local en macOS 15 o superior sobre CPU y GPU.

Su relevancia es práctica: permite ejecutar separación de habla en un Mac sin depender de PyTorch ni de un servidor, con una fidelidad respecto al modelo original de aproximadamente 65 dB SI-SDR. No es un modelo generativo de texto ni un LLM; es un modelo de audio-to-audio especializado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MossFormer2 (Transformer + red recurrente sin recurrencia, dominio temporal) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 32.776 muestras (2,05 s a 16 kHz) |
| Tipos de cuantización | pesos float16 en el formato Core ML ML program |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre señal de audio) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML program (.mlpackage / .mlmodelc), float16 |

## Arquitectura y entrenamiento

El modelo subyacente, MossFormer2, es una arquitectura de separación de habla en dominio temporal que combina mecanismos de atención tipo Transformer con una red recurrente sin recurrencia explícita (RNN-free recurrent network). Está diseñada para separación monoaural, es decir, a partir de una única señal mezclada. El artículo de referencia es de ICASSP 2024 y el modelo se distribuye a través de ClearerVoice-Studio.

La conversión a Core ML introduce tres cambios respecto al original: pesos en float16 dentro de un ML program para macOS 15 y posteriores; entrada de longitud fija de 32.776 muestras, que equivale a 4.096 pasos del encoder y 16 grupos completos de atención de 256 elementos, de modo que la atención no necesita máscara de padding; y, solo durante la conversión, dos operaciones se reescriben de forma equivalente (el padding con cantidad negativa pasa a ser un recorte y `einsum` se sustituye por productos matriciales equivalentes), sin alterar la salida de PyTorch. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO.

## Capacidades

- Separación de habla de dos hablantes en una grabación mono de 16 kHz, produciendo dos pistas de salida, una por voz.
- Procesamiento por ventanas: audio más largo que 2,05 segundos se procesa en ventanas de 32.776 muestras con paso de 24.582 muestras, conservando el centro de cada ventana, y cada voz se reescala a la sonoridad de la entrada.
- Ejecución local en macOS sobre CPU y GPU mediante `MLComputeUnits.cpuAndGPU`.
- Fidelidad respecto al modelo PyTorch original de aproximadamente 65 dB SI-SDR sobre la misma entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de audio.
- No dispone de modo thinking, visión ni audio de entrada distinto de la señal a separar.

## Casos de uso

- Transcripción de reuniones y entrevistas: separar previamente las dos voces de una grabación mono antes de pasarla a un sistema ASR reduce errores de solapamiento y mejora la diarización, ya que cada pista contiene una sola voz.
- Limpieza de grabaciones de campo o periodísticas: cuando dos interlocutores hablan a la vez en una única pista, el modelo permite recuperar cada voz por separado para su edición posterior.
- Preprocesado en pipelines de ASR: integrado como paso previo en un flujo de reconocimiento de habla, permite alimentar al transcriptor con pistas limpias en lugar de la mezcla original.
- Herramientas de accesibilidad en macOS: una aplicación nativa puede usar la conversión Core ML para ofrecer separación de voces en local, sin enviar audio a la nube, sobre CPU y GPU del Mac.
- Análisis forense de audio: separar las voces de una grabación de dos personas facilita el análisis individual de cada hablante y la comparación con muestras de referencia.
- Prototipado e investigación en separación de habla: al ser una conversión fiel del modelo original (65 dB SI-SDR), sirve para evaluar MossFormer2 en un entorno Core ML y comparar su comportamiento con la implementación PyTorch.
- Aplicaciones de karaoke o edición de podcast: separar dos voces permite silenciar, realzar o procesar una de ellas de forma independiente en la mezcla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado es la fidelidad de la conversión respecto al modelo PyTorch original: aproximadamente 65 dB SI-SDR sobre la misma entrada. No se aportan cifras de SI-SDRi, SDR ni de métricas estándar de separación de habla para el modelo original en esta información.

## Requisitos de hardware

- Ejecución en macOS 15 o posterior mediante Core ML, sobre CPU y GPU (`MLComputeUnits.cpuAndGPU`).
- El Neural Engine no puede compilar el modelo; no se debe seleccionar `MLComputeUnits.all` ni `cpuAndNeuralEngine`.
- En pruebas sobre macOS 26, una ejecución falló dentro del backend de CPU de Core ML, mientras que CPU y GPU funcionaron sin problemas; conviene validar en el sistema objetivo antes de desplegar.
- Tamaño del repositorio: 0,1 GB, lo que sugiere un modelo ligero y apto para equipos de consumo Apple Silicon y Mac con GPU integrada.
- VRAM estimada: no disponible. Al ejecutarse vía Core ML no se gestiona VRAM de forma explícita; el consumo depende del backend y del hardware del Mac.
- Opciones de despliegue: Core ML en aplicaciones macOS (Swift, Objective-C) o mediante herramientas que consuman Core ML; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MossFormer2-SS-16K-CoreML (este) | Separación de habla 2 hablantes | 16 kHz mono, ventana fija de 32.776 muestras | Core ML float16 | Apache 2.0 | HuggingFace, ejecución local en macOS |
| alibabasglab/MossFormer2_SS_16K | Separación de habla 2 hablantes | 16 kHz mono, longitud variable | PyTorch | Apache 2.0 | HuggingFace, ClearerVoice-Studio |
| Otros modelos de separación de habla | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo original del que deriva: misma arquitectura y mismos pesos, con la diferencia de formato (Core ML float16 frente a PyTorch), entrada fija frente a longitud variable y ejecución local en macOS frente a un entorno Python. No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en separar exactamente dos hablantes; no está pensado para más de dos voces ni para separar música de voz.
- La asignación de qué fila de salida corresponde a qué voz puede cambiar de una ventana a otra, lo que obliga a un postprocesado de seguimiento de hablante si se procesan audios largos.
- La entrada es de longitud fija (32.776 muestras); audios más largos requieren el esquema de ventanas con paso de 24.582 muestras y reconstrucción, que puede introducir artefactos en las uniones.
- El Neural Engine no puede compilar el modelo y se ha observado un fallo en el backend de CPU de Core ML en macOS 26; es necesario probar en el sistema y hardware concretos antes de producción.
- Requiere macOS 15 o posterior; no es portable a otros sistemas operativos en este formato.
- No se dispone de información sobre sesgos, tasas de alucinación (no aplica a un modelo de separación) ni evaluación multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y los créditos al trabajo original de Alibaba y a los autores de MossFormer2.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Moipee/MossFormer2-SS-16K-CoreML
- Modelo base original: https://huggingface.co/alibabasglab/MossFormer2_SS_16K
- ClearerVoice-Studio (repositorio de Alibaba): https://github.com/modelscope/ClearerVoice-Studio
- Script de conversión: convert.py (incluido en el repositorio del modelo)
- Artículo de referencia: Zhao et al., *MossFormer2: Combining Transformer and RNN-Free Recurrent Network for Enhanced Time-Domain Monaural Speech Separation*, ICASSP 2024 (enlace al paper no disponible en la información proporcionada)
