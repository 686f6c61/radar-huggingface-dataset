# AMD-PAVS-AI/whisper

## Resumen

`AMD-PAVS-AI/whisper` es una exportación a ONNX del modelo `openai/whisper-large-v3` de reconocimiento automático de voz (ASR), empaquetada y validada por AMD-PAVS-AI para su ejecución sobre aceleradores de AMD mediante ROCm. El modelo resuelve la transcripción de audio a texto, con una arquitectura transformer encoder-decoder y decodificación autorregresiva en el decodificador. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetadura de inferencia del Whisper original, con dos grafos ONNX separados: un encoder (espectrograma mel a estados ocultos) y un decoder autorregresivo (estados ocultos a tokens).

Su relevancia radica en la portabilidad del stack: permite ejecutar Whisper de gran tamaño sobre GPUs AMD Instinct y Radeon con el Execution Provider MIGraphX de ONNX Runtime, sobre CPUs AMD en FP32 y sobre NPUs AMD Ryzen AI mediante VitisAI. El repositorio ocupa aproximadamente 1,0 GB y la licencia es MIT, heredada del modelo base.

La información publicada no detalla el número de parámetros ni la longitud de contexto del modelo base, aunque por proceder de `whisper-large-v3` se trata de la variante grande de la familia Whisper. El autor solo documenta métricas de precisión sobre LibriSpeech test-clean y no incluye benchmarks comparativos con otros modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado como dos grafos ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no especificada en la model card) |
| Tipos de cuantización | FP32 (CPU y NPU); FP32 y FP16 (GPU); en NPU VitisAI cuantiza internamente a partir de entrada ONNX FP32 |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder y decoder como grafos separados) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Whisper. El encoder transforma el espectrograma mel del audio de entrada en estados ocultos y el decoder genera tokens de forma autorregresiva a partir de esos estados. La exportación separa ambos componentes en dos grafos ONNX independientes, lo que permite perfilar y optimizar cada parte por separado.

No se ha realizado entrenamiento adicional: el modelo base es `openai/whisper-large-v3` y esta ficha no documenta número de tokens de entrenamiento, composición del dataset, ni etapas de RLHF o DPO. La innovación técnica de este repositorio es la integración con runtimes de AMD: ONNX Runtime con Execution Provider de CPU, MIGraphX para GPU (FP32/FP16) y VitisAI para NPU Ryzen AI. El autor indica que no se requieren cambios de código respecto a la implementación upstream de Whisper, solo configuración de entorno y runtime. En GPU y NPU existe un coste inicial de compilación de grafo (más de 30 minutos en MIGraphX y un coste similar en VitisAI) que se paga una sola vez.

## Capacidades

- Reconocimiento automático de voz: transcripción de audio a texto mediante decodificación autorregresiva greedy.
- Evaluación de calidad de transcripción con métricas WER (Word Error Rate) y CER (Character Error Rate), usando normalización de texto estilo Whisper (`BasicTextNormalizer` de `transformers`).
- Ejecución multiplataforma en hardware AMD: CPU, GPU (Instinct/Radeon con ROCm) y NPU (Ryzen AI).
- Compatibilidad con precisión FP32 y FP16 en GPU, y FP32 en CPU y NPU.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR, ni modo thinking.
- No se documenta el conjunto de idiomas soportados en esta model card.

## Casos de uso

- Transcripción por lotes de audio en entornos con GPUs AMD: el modelo se puede desplegar con ONNX Runtime y MIGraphX para procesar ficheros de audio de forma offline, aprovechando la validación específica para ROCm y evitando dependencias de CUDA.
- Subtitulado automático de vídeo y audio: la salida de texto del decoder permite generar transcripciones que se post-procesan para crear subtítulos, con la ventaja de ejecutarse sobre infraestructura AMD ya existente.
- Despliegue en portátiles y estaciones con NPU Ryzen AI: la ruta VitisAI permite ejecutar la transcripción en la NPU del equipo, liberando CPU y GPU para otras tareas y reduciendo el consumo energético en aplicaciones de dictado.
- Evaluación comparativa de rendimiento ASR en hardware AMD: los scripts del repositorio permiten reproducir WER/CER sobre LibriSpeech test-clean y comparar CPU, GPU y NPU con la misma exportación ONNX.
- Integración en pipelines de accesibilidad: transcripción de reuniones o clases en tiempo no real sobre servidores con CPUs AMD en FP32, sin necesidad de GPUs dedicadas.
- Prototipado e investigación en ASR: al estar exportado a ONNX con licencia MIT, sirve como base para experimentar con cuantización, perfilado de operadores y optimizaciones de runtime sin partir del modelo PyTorch original.
- Verificación rápida de entornos ROCm: el conjunto de smoke test de tres muestras de LibriSpeech incluido en el repositorio permite validar que la instalación de ONNX Runtime, MIGraphX o VitisAI funciona antes de lanzar evaluaciones completas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre LibriSpeech test-clean (WER y CER, menor es mejor):

| Run | Dispositivo | Precisión | Muestras | WER | CER |
|---|---|---|---|---|---|
| Smoke test | CPU | FP32 | 3 | 0,114 | 0,025 |
| Full-dataset (subset) | CPU | FP32 | 25 / 2617 | 0,035 | 0,015 |
| Full-dataset (subset) | GPU | FP32 | 25 / 2617 | 0,035 | 0,015 |

El autor advierte que las filas de full-dataset corresponden a un subconjunto de 25 muestras de las 2.617 del split test-clean y son solo indicativas. Una ejecución completa sobre las 2.617 muestras tarda del orden de horas debido a la decodificación autorregresiva greedy. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks, ni comparativas numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El repositorio pesa 1,0 GB, lo que da una referencia del tamaño de los pesos en disco, pero no se documenta el consumo de memoria en inferencia.
- GPU recomendadas: AMD Instinct y AMD Radeon con ROCm, usando el Execution Provider MIGraphX de ONNX Runtime en FP32 o FP16.
- CPU: cualquier CPU AMD con ONNX Runtime en FP32; validado por el autor.
- NPU: AMD Ryzen AI con el Execution Provider VitisAI, que acepta entrada ONNX FP32 y cuantiza internamente.
- ¿Cabe en GPU de consumo? No se especifica; el autor solo valida GPUs Radeon e Instinct con ROCm, sin detallar modelos concretos ni memoria mínima.
- Opciones de despliegue: ONNX Runtime con los Execution Providers de CPU, MIGraphX (GPU) y VitisAI (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que la compilación de grafo en GPU (MIGraphX) y NPU (VitisAI) supone un coste único de más de 30 minutos en el primer arranque, y que una evaluación completa sobre 2.617 muestras tarda horas por la decodificación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMD-PAVS-AI/whisper (esta ficha) | no disponible | no disponible | WER 0,035 / CER 0,015 en subconjunto de 25 muestras de LibriSpeech test-clean | MIT | ONNX en HuggingFace, validado para AMD ROCm, CPU y NPU |
| openai/whisper-large-v3 | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | MIT (modelo base de OpenAI) | Pesos originales en formato PyTorch; referencia upstream de esta exportación |
| Otras exportaciones ONNX de Whisper | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría más allá de la relación directa con `openai/whisper-large-v3`, que es el modelo base declarado por el autor.

## Limitaciones y advertencias

- El modelo no se ha reentrenado: hereda los sesgos y limitaciones de `openai/whisper-large-v3`, aunque la model card no los detalla.
- Riesgo de alucinación en ASR: la decodificación autorregresiva de Whisper puede generar texto no presente en el audio, especialmente en segmentos con ruido o silencio; el autor no documenta mitigaciones específicas.
- Los resultados de precisión publicados se basan en un subconjunto de 25 muestras de LibriSpeech test-clean y son solo indicativos; no hay evaluación completa sobre las 2.617 muestras.
- No se documentan los idiomas soportados ni el comportamiento multilingüe en esta exportación.
- El coste de compilación inicial de grafos en GPU (MIGraphX) y NPU (VitisAI) supera los 30 minutos, lo que penaliza escenarios con arranques frecuentes o contenedores efímeros.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los runtimes de AMD (ONNX Runtime, MIGraphX, VitisAI) que se utilicen en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- No se detallan requisitos de memoria, latencia ni throughput, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMD-PAVS-AI/whisper
- Scripts de Whisper para AMD (repositorio GitHub): https://github.com/AMD-PAVS/physical_ai_sdk/blob/main/models/whisper
- Implementación upstream de Whisper (OpenAI): https://github.com/openai/whisper
- Dataset de evaluación LibriSpeech test-clean (AudioLLMs): https://huggingface.co/datasets/AudioLLMs/librispeech_test_clean
