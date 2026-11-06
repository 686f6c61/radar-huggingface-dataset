# samthehugenerd/Smart-Turn-Topo

## Resumen

Smart-Turn-Topo es la conversión a Core ML del modelo Smart Turn v3.2 de Daily (publicado por pipecat-ai), empaquetada como un ML Program en FP16 para su ejecución en iOS 17 o superior. No se trata de un modelo nuevo ni de un ajuste fino: los pesos proceden del ONNX en fp32 de pipecat (`smart-turn-v3.2-gpu.onnx`, commit `f766f81d`), reconstruidos en PyTorch como `SmartTurnV3Model` y convertidos con coremltools 9.0. El autor, samthehugenerd, lo publica como componente del juez de fin de turno de su proyecto Topo, un asistente conversacional que corre en un iPhone.

El modelo resuelve un problema muy concreto en pipelines de voz: decidir si el usuario ha terminado de hablar o simplemente ha hecho una pausa. La entrada es un tensor `[1, 80, 800]` con características log-mel de Whisper correspondientes a los últimos 8 segundos de audio a 16 kHz, con relleno de ceros al principio. La salida es un único logit `[1, 1]` que ya incorpora la sigmoide, es decir, la probabilidad de que el turno esté completo.

Su relevancia es práctica: permite ejecutar la detección de fin de turno íntegramente en el dispositivo, sin enviar audio a un servidor, con una licencia permisiva (BSD 2-Clause) y un tamaño de repositorio que ronda los 0 GB en la ficha de Hugging Face (el paquete real contiene los pesos FP16). Es una pieza de infraestructura para asistentes de voz en tiempo real, no un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper-tiny con attention pooling y clasificador (SmartTurnV3Model) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8 segundos de audio a 16 kHz (entrada fija `[1, 80, 800]`) |
| Tipos de cuantización | FP16 (ML Program); el original fp32 está disponible en pipecat |
| Idiomas soportados | en |
| Licencia | BSD 2-Clause (Copyright 2024-2025, Daily) |
| Formato de pesos | `.mlpackage` (Core ML ML Program) con `weight.bin` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Smart Turn v3.2: un encoder basado en Whisper-tiny que procesa características log-mel, seguido de un mecanismo de attention pooling y una cabeza clasificadora con sigmoide integrada. El modelo no genera texto ni tokens; produce una única probabilidad escalar de fin de turno. La conversión a Core ML se realizó trazando el modelo reconstruido en PyTorch y transformándolo con coremltools 9.0 a un ML Program FP16 para iOS 17.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o las técnicas de alineación (RLHF, DPO) empleadas por pipecat-ai en Smart Turn v3.2, ya que la model card de esta conversión no las detalla. La innovación técnica destacable de esta ficha es la propia conversión: el autor verificó que la salida FP16 se mantiene dentro de 0.05 respecto al ONNX fp32 de pipecat en 21 clips, sin que ningún clip cruce el umbral de 0.85. Además, advierte explícitamente de que no usa la variante int8 `smart-turn-v3.2-cpu.onnx`, que puede desviarse hasta 0.40 del modelo fp32 sobre las mismas características.

## Capacidades

- Clasificación binaria de fin de turno en audio de voz: devuelve la probabilidad de que el hablante haya terminado su intervención.
- Procesamiento de los últimos 8 segundos de audio a 16 kHz con características log-mel compatibles con Whisper (`whisper_features.py` de pipecat).
- Inferencia en dispositivo mediante Core ML en iOS 17, sin dependencia de red.
- Integración en pipelines de voz en tiempo real como juez de turno previo a la respuesta del asistente.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para inglés (`en`).

## Casos de uso

- Asistente de voz en iOS: el modelo se ejecuta como ML Program en el iPhone y decide si el usuario ha acabado de hablar antes de que el asistente responda, evitando interrupciones durante pausas naturales.
- Detección de fin de turno en pipelines de telefonía o VoIP: integrado en un servidor o en el cliente, sustituye heurísticas de silencio por una clasificación aprendida sobre los últimos 8 segundos de audio.
- Agentes conversacionales de atención al cliente: permite gestionar diálogos multi-turno con turnos de habla solapados o pausas largas, reduciendo respuestas prematuras.
- Transcripción y diarización en tiempo real: como señal auxiliar para segmentar intervenciones antes de enviar el audio al motor de reconocimiento.
- Asistentes embebidos sin conectividad: al ser Core ML y no requerir red, encaja en escenarios de privacidad estricta donde el audio no puede salir del dispositivo.
- Evaluación y depuración de sistemas de voz: la salida probabilística permite calibrar umbrales de turno y comparar el comportamiento FP16 frente al fp32 de referencia en pipelines de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo. La única métrica publicada es la fidelidad de la conversión:

| Comparación | Resultado |
|---|---|
| Desviación máxima frente a ONNX fp32 de pipecat (21 clips) | ≤ 0.05 |
| Clips que cruzan el umbral 0.85 respecto al fp32 | 0 |
| Desviación de la variante int8 de pipecat frente a fp32 | hasta 0.40 |

## Requisitos de hardware

- Diseñado para ejecución en dispositivo Apple con iOS 17 o superior mediante Core ML; no requiere GPU dedicada de servidor.
- El paquete se compila en el dispositivo con `MLModel.compileModel(at:)` antes de la inferencia.
- Cabe en cualquier iPhone o iPad compatible con iOS 17, dado el tamaño reducido del encoder Whisper-tiny en FP16.
- Opciones de despliegue: Core ML en apps iOS; el modelo original equivalente puede desplegarse con ONNX Runtime (variantes `smart-turn-v3.2-gpu.onnx` y `smart-turn-v3.2-cpu.onnx`) o con el stack de pipecat.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Precisión | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smart-Turn-Topo (esta ficha) | Core ML ML Program | FP16 | 8 s | BSD 2-Clause | Hugging Face |
| pipecat-ai/smart-turn-v3 (GPU) | ONNX | FP32 | 8 s | BSD 2-Clause | Hugging Face |
| pipecat-ai/smart-turn-v3 (CPU) | ONNX | INT8 | 8 s | BSD 2-Clause | Hugging Face |

Las tres variantes comparten arquitectura y pesos de origen; difieren en formato, precisión y plataforma de destino. No se dispone de información sobre otros detectores de fin de turno comparables en la documentación consultada.

## Limitaciones y advertencias

- Solo inglés: el modelo está etiquetado para `en` y no se documenta soporte multilingüe.
- Ventana fija de 8 segundos: audio más largo se recorta y audio más corto se rellena con ceros al principio, lo que puede afectar a turnos muy breves o muy largos.
- La salida es una probabilidad calibrada para el umbral 0.85; cambios de umbral deben validarse contra el fp32 de referencia.
- No usar la variante int8 como sustituto si se requiere paridad con el fp32: las desviaciones documentadas llegan a 0.40.
- La conversión no es reproducible byte a byte: una nueva ejecución del script no regenera el `Manifest.json` idéntico, por lo que los ficheros publicados son el artefacto de referencia.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o negativos en la detección de turno según acústica, ruido y acento.
- Licencia BSD 2-Clause permite uso comercial con atribución a Daily (2024-2025); debe conservarse el texto de licencia incluido en el repositorio.
- Dependencia de la plataforma Apple: el `.mlpackage` no es portable a otros sistemas sin reconversión.

## Enlaces

- Hugging Face: https://huggingface.co/samthehugenerd/Smart-Turn-Topo
- Modelo base: https://huggingface.co/pipecat-ai/smart-turn-v3
- Proyecto Topo: https://github.com/samdu/topo
- Repositorio de experimentos y script de conversión: https://github.com/samdu/experiments
