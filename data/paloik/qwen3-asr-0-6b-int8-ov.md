# paloik/Qwen3-ASR-0.6B-int8-ov

## Resumen

Qwen3-ASR-0.6B-int8-ov es una conversión a formato OpenVINO IR del modelo de reconocimiento automático del habla (ASR) Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión, publicada por el usuario paloik, aplica cuantización simétrica INT8 por canal y está optimizada específicamente para ejecutarse sobre la NPU de los procesadores Intel Core Ultra, las GPU integradas Arc y CPU multinúcleo mediante OpenVINO GenAI 2026.4 o superior.

El modelo resuelve el problema de la transcripción multilingüe de audio en hardware de consumo Intel, un escenario donde tradicionalmente se depende de Whisper u otros modelos con requisitos de memoria y latencia mayores. Con solo 0,6 mil millones de parámetros y un peso de repositorio de aproximadamente 1 GB tras la cuantización, se posiciona como una alternativa ultra ligera para transcripción en el borde (edge).

Su relevancia actual radica en la combinación de un modelo base moderno de la familia Qwen3 con un pipeline de inferencia nativo para NPU Intel, lo que permite despliegues de bajo consumo energético en portátiles y mini-PC sin depender de GPU dedicadas. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para ASR (modelo base Qwen3-ASR-0.6B), convertido a OpenVINO IR |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 simetrico por canal (`--weight-format int8 --sym`) |
| Idiomas soportados | Multilingue (la model card indica "multilingual"; lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B es un modelo de la familia Qwen3 orientado a reconocimiento automático del habla, con 0,6 mil millones de parámetros. La model card de esta conversión no detalla la arquitectura interna del codificador/decodificador ni la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se aplicaron etapas de RLHF o DPO. Estos datos deben consultarse en la model card del modelo original.

La innovación técnica de esta versión concreta reside en la conversión a OpenVINO IR con cuantización INT8 simétrica por canal, pensada para aprovechar las unidades XMX de las GPU Xe2 de Intel y la NPU de Core Ultra. El pipeline se expone a través de `openvino_genai.WhisperPipeline`, que acepta indicaciones de `CACHE_DIR` y `LATENCY` para optimizar el despliegue. La API de generación permite especificar el idioma mediante tokens como `<|de|>` y la tarea (`transcribe`).

## Capacidades

- Transcripción automática de voz a texto (speech-to-text) multilingüe.
- Soporte de selección de idioma mediante tokens de control en la llamada de generación.
- Modo de tarea configurable (`task="transcribe"`), lo que sugiere soporte de otras tareas ASR del modelo base (no detalladas en la información disponible).
- Inferencia acelerada en NPU Intel Core Ultra, GPU Arc iGPU y CPU multinúcleo.
- Compatibilidad con el ecosistema OpenVINO GenAI 2026.4 o superior.
- Entrada de audio a 16 kHz (según el ejemplo con librosa).
- Capacidades de tool calling, agentes, visión o audio generativo: no disponibles en esta información.

## Casos de uso

- Transcripción de reuniones en portátiles Intel Core Ultra: el modelo puede ejecutarse íntegramente en la NPU, liberando CPU y GPU para otras tareas y reduciendo el consumo energético durante sesiones largas de dictado o videollamada.
- Subtitulado local de contenido audiovisual: al ser multilingüe y caber en ~1 GB, permite generar subtítulos en equipos sin GPU dedicada, integrándose en herramientas de edición o reproductores.
- Asistentes de voz en el borde (edge): su tamaño reducido y la inferencia en NPU lo hacen adecuado para dispositivos con restricciones térmicas y de batería, como mini-PC o sistemas embebidos Intel.
- Dictado por voz en aplicaciones de productividad: integración en editores de texto o suites ofimáticas que requieran transcripción en tiempo real sin enviar audio a la nube, preservando la privacidad.
- Preprocesado de audio en pipelines de datos: transcripción por lotes de grabaciones para indexación, búsqueda o análisis en servidores con CPU Intel multinúcleo, usando OpenVINO GenAI.
- Prototipado rápido de aplicaciones ASR: gracias a la licencia Apache 2.0 y al peso de ~1 GB, sirve para validar flujos de speech-to-text antes de escalar a modelos mayores o a infraestructura cloud.
- Transcripción en entornos con requisitos de soberanía del dato: al ejecutarse localmente en hardware Intel, cumple con políticas que prohíben el envío de audio a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1 GB de pesos en INT8; se recomienda al menos 2 GB de memoria disponible para el runtime y buffers de audio.
- Hardware objetivo: NPU de Intel Core Ultra, GPU integrada Arc (Xe2 con XMX), CPU Intel multinúcleo.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta conversión; el formato OpenVINO IR está pensado para hardware Intel.
- Cabe en hardware de consumo: sí, en cualquier portátil o mini-PC con Intel Core Ultra, y en CPU Intel modernas.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai.WhisperPipeline`) con soporte de `CACHE_DIR` y `LATENCY`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-int8-ov (este) | 0,6 B | No disponible | Multilingüe | Apache 2.0 | OpenVINO IR / OpenVINO GenAI |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6 B | No disponible | Multilingüe | Apache 2.0 | Pesos originales (formato no detallado) |
| Whisper large-v3 (referencia ASR) | ~1,55 B | 30 s de audio por ventana | Multilingüe | MIT | Safetensors, GGUF, OpenVINO, etc. |
| Whisper small (referencia ligera) | ~0,24 B | 30 s de audio por ventana | Multilingüe | MIT | Safetensors, GGUF, OpenVINO, etc. |

La comparación con Whisper es orientativa por categoría (ASR multilingüe); no se dispone de datos de rendimiento comparativos para este modelo concreto.

## Limitaciones y advertencias

- La model card no detalla la lista concreta de idiomas soportados ni su calidad por idioma; "multilingual" es una etiqueta genérica.
- No se han publicado benchmarks de WER (word error rate) ni comparativas de precisión frente a Whisper u otros modelos ASR.
- Al ser una conversión cuantizada a INT8, puede existir una degradación de precisión respecto al modelo base en FP16/BF16, no cuantificada en la información disponible.
- El formato OpenVINO IR limita el despliegue a hardware y runtime Intel; no es portable a GPU NVIDIA/AMD ni a otros frameworks sin reconversión.
- La API de ejemplo usa `WhisperPipeline`, lo que sugiere una interfaz compatible con Whisper, pero no se garantiza paridad total de parámetros o comportamientos.
- Riesgo de alucinación en audio con ruido, música o silencios prolongados: comportamiento típico de modelos ASR, no documentado específicamente para este modelo.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia y condiciones del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- No se documentan sesgos lingüísticos, acentos o dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paloik/Qwen3-ASR-0.6B-int8-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Documentación de OpenVINO: https://docs.openvino.ai
