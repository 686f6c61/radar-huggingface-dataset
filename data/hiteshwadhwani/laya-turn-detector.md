# hiteshwadhwani/laya-turn-detector

## Resumen

Laya Turn Detector es un modelo de decisión, no generativo, especializado en detectar el final de turno (end-of-turn) en agentes de voz. Lo desarrolla hiteshwadhwani como un fine-tuning del checkpoint multilingüe de Laya (convaiinnovations/laya), un modelo de decisión no autorregresivo entrenado con RLCD. Su función es puntuar cuatro opciones —`USER_DONE`, `USER_UNFINISHED`, `BACKCHANNEL` y `UNCLEAR`— a partir del estado de la conversación, el texto parcial del usuario y el estado de actividad de ambos interlocutores.

El modelo emplea como encoder `jhu-clsp/mmBERT-base` (ModernBERT, 22 capas, dimensión 768) y añade una cabeza transformer de 2 capas con un scorer leído en cuatro marcadores de opción. Cuenta con 321.908.998 parámetros, de los cuales unos 200 millones corresponden a la tabla de embeddings multilingüe, y una longitud máxima de entrada de 1024 tokens.

Su relevancia radica en que aborda un problema específico y difícil en agentes de voz: distinguir si el usuario ha terminado de hablar, si está a mitad de una frase o si solo emite un acknowledgement breve ("haan", "okay", "mm-hmm"). Está pensado para fusionarse con un modelo de end-of-turn acústico y un VAD, de modo que el texto determine si las palabras forman un turno completo y el audio determine cómo se han dicho. Soporta inglés e hinglish.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (mmBERT-base, 22 capas, d=768) + cabeza transformer de 2 capas + scorer sobre 4 marcadores de opción; modelo de decisión no autorregresivo |
| Parámetros totales | 321.908.998 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada |
| Tipos de cuantización | FP16 (pesos PyTorch); ONNX exportado en FP32; OpenVINO IR con pesos FP32; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) e hindi/hinglish (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16), ONNX (opset 17, FP32), OpenVINO IR (xml + bin, FP32) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint multilingüe de Laya, un modelo de decisión no autorregresivo entrenado con RLCD (Reinforcement Learning from Contrastive Distillation, según la nomenclatura indicada en la model card). Sobre esa base se realiza un fine-tuning para la tarea de clasificación de final de turno. El encoder es `jhu-clsp/mmBERT-base`, un ModernBERT de 22 capas y dimensión 768, al que se añade una cabeza transformer de 2 capas y un mecanismo de scoring que lee los logits en las posiciones de los cuatro marcadores de opción.

La entrada se construye con la plantilla `[CLS] <type> instruction [SEP] [MASK] options… [SEP] state JSON [SEP]`, con una longitud máxima de 1024 tokens. El estado de la conversación se serializa como un objeto JSON compacto con cinco campos en orden fijo: `history`, `assistant_spoken_text`, `assistant_state`, `user_speech_state` y `user_partial_text`. El modelo no genera texto libre: puntúa las cuatro opciones predefinidas y devuelve probabilidades normalizadas. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales de alineación más allá del RLCD heredado del modelo base.

## Capacidades

- Clasificación de final de turno en cuatro categorías: `USER_DONE`, `USER_UNFINISHED`, `BACKCHANNEL` y `UNCLEAR`.
- Detección de backchannels (acknowledgements breves como "haan", "okay", "mm-hmm") que no constituyen toma de turno.
- Integración con estado conversacional: considera el historial de turnos, el texto ya pronunciado por el agente y los estados de actividad de agente y usuario.
- Fusión con modelos acústicos de end-of-turn y VAD: el modelo aporta la señal textual y el modelo de audio aporta la prosodia.
- Soporte bilingüe inglés-hinglish, con vocabulario multilingüe (mmBERT / Gemma).
- Exportación a ONNX Runtime y OpenVINO para inferencia en CPU.
- No es un modelo generativo: no produce texto, razonamiento abierto, código ni matemáticas.
- No se documenta soporte de tool calling ni de razonamiento multi-step; su función es exclusivamente la decisión de turno.

## Casos de uso

- Agentes de voz en atención al cliente: el modelo determina si el usuario ha terminado su intervención antes de que el agente responda, evitando interrupciones prematuras en conversaciones multi-turno con contexto de hasta 1024 tokens.
- Detección de pausas naturales en IVR: distingue entre una pausa a mitad de frase (`USER_UNFINISHED`) y el final real del turno (`USER_DONE`), lo que reduce la latencia percibida y las respuestas solapadas.
- Filtrado de backchannels: cuando el usuario emite "haan" o "okay" mientras el agente habla, el modelo lo clasifica como `BACKCHANNEL` y evita que el agente ceda el turno innecesariamente.
- Asistentes telefónicos en hinglish: clientes que alternan hindi e inglés en una misma frase pueden ser evaluados correctamente gracias al vocabulario multilingüe y al fine-tuning específico.
- Despliegue en CPU de bajo coste: la exportación a ONNX y OpenVINO permite ejecutar el modelo en servidores sin GPU, adecuado para pipelines de voz con requisitos de latencia estrictos.
- Componente de un sistema de turn-taking híbrido: se combina con un VAD y un modelo acústico de end-of-turn para decidir el momento exacto de la respuesta del agente.
- Moderación de flujo en agentes conversacionales de soporte técnico: el campo `assistant_state` permite al modelo saber si el agente está hablando, pausado o inactivo, lo que mejora la coherencia de la decisión en cada fase de la interacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP16 y 321,9 M de parámetros, el modelo ocupa aproximadamente 0,65 GB en memoria; en FP32 (ONNX/OpenVINO) ronda 1,3 GB. La memoria adicional depende de la longitud de entrada (hasta 1024 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en RTX 4090, A100 o H100 sin problemas, aunque el modelo está dimensionado para inferencia ligera.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090).
- Opciones de despliegue: librería `laya` (PyTorch, CPU o CUDA), ONNX Runtime (CPU), OpenVINO (CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hiteshwadhwani/laya-turn-detector | 321,9 M | 1024 tokens | Clasificación de end-of-turn (4 clases) | Apache 2.0 | Hugging Face, ONNX, OpenVINO |
| convaiinnovations/laya (modelo base) | No disponible | No disponible | Modelo de decisión multilingüe (RLCD) | No disponible en la información | Hugging Face |
| jhu-clsp/mmBERT-base | No disponible | No disponible | Encoder multilingüe (ModernBERT) | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos de end-of-turn comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre inglés e hinglish; no se documenta soporte para otras lenguas, lo que limita su uso en mercados no angloparlantes o no hindi.
- Es un clasificador de cuatro clases, no un generador: no puede producir respuestas, razonamiento abierto ni código.
- La ventana de contexto es de 1024 tokens; si el estado supera ese límite, la model card recomienda descartar los turnos más antiguos del historial en lugar de recortar `user_partial_text`.
- El formato de entrada es estricto: los cinco campos deben serializarse en el orden indicado, con `separators=(",", ":")` y `ensure_ascii=False`, y el texto de la pregunta debe usarse sin modificar.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en transcripciones ruidosas o ambiguas.
- No se documentan sesgos conocidos ni evaluaciones de robustez en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (convaiinnovations/laya) y del encoder (jhu-clsp/mmBERT-base) antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan métricas de latencia ni de precisión en producción; se recomienda evaluar con datos propios antes de integrarlo en un sistema de voz en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hiteshwadhwani/laya-turn-detector
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Encoder mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Librería laya en PyPI: https://pypi.org/project/laya/
