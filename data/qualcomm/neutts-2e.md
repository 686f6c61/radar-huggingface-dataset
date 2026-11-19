# qualcomm/NeuTTS-2E

## Resumen

NeuTTS-2E es un modelo compacto de síntesis de voz (text-to-speech) orientado a dispositivos, desarrollado por Neuphonic y empaquetado por Qualcomm para su despliegue en hardware con aceleradores NPU de Qualcomm. Combina un backbone de lenguaje causal Qwen3 de 236 millones de parametros con el codec neuronal de audio NeuCodec a 50 Hz, y genera voz natural a 24 kHz en ingles para cuatro hablantes fijos y siete emociones predefinidas. No dispone de clonacion de voz: los cuatro hablantes se incluyen como codigos de referencia pre-codificados, de modo que no se lee audio de referencia ni se invoca el codificador del codec.

El modelo esta pensado especificamente para inferencia en el dispositivo (on-device), con el backbone exportado como dos grafos (prefill de 128 tokens y decode de token unico) enlazados en un unico binario de contexto con pesos compartidos. La logica de ensamblado del prompt, condicionamiento emocional, muestreo y decodificacion NeuCodec se ejecuta en CPU dentro de la aplicacion, mientras que el backbone corre en la NPU. Esta division permite latencias de decenas de milisegundos en chipsets moviles y de portatiles Snapdragon.

La relevancia actual del modelo radica en su enfoque de TTS emocional de baja latencia y bajo consumo, empaquetado como binario QNN listo para produccion en una amplia gama de plataformas Qualcomm (movil, automocion, IoT industrial y PC). Con licencia Apache 2.0 y un tamano de checkpoint de 671 MB en float, se posiciona como una alternativa ligera para interfaces de voz embebidas, asistentes locales y sistemas de accesibilidad que no pueden depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer causal Qwen3 (LM) + codec neuronal NeuCodec a 50 Hz |
| Parametros totales | 236M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (variante prompt_ar128_cl2048); prefill de 128 tokens |
| Tipos de cuantizacion | Float (binario QNN_CONTEXT_BINARY en float); otras precisiones no disponibles |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | QNN_CONTEXT_BINARY (binarios compilados para Qualcomm AI Hub); checkpoint original neuphonic/neutts-2e |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de modelo de lenguaje causal de la familia Qwen3 con 236 millones de parametros y un codec neuronal de audio NeuCodec que opera a 50 Hz. El backbone se exporta en dos grafos —uno de prefill de 128 tokens y otro de decode de token unico— enlazados en un unico binario de contexto con pesos compartidos. La decodificacion de audio, el muestreo, el ensamblado del prompt y el condicionamiento emocional se ejecutan en CPU, mientras que el backbone se ejecuta en la NPU del chipset Qualcomm.

El modelo produce voz a 24 kHz en ingles para cuatro hablantes fijos y siete emociones. Al no incluir clonacion de voz, los hablantes se distribuyen como codigos de referencia pre-codificados, lo que elimina la necesidad de leer audio de referencia y de invocar el codificador del codec en tiempo de inferencia. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-audio) en ingles a 24 kHz con salida natural.
- Cuatro hablantes fijos predefinidos, sin necesidad de audio de referencia.
- Siete emociones predefinidas controlables mediante condicionamiento en el prompt.
- Inferencia en dispositivo con backbone en NPU y logica auxiliar en CPU.
- Baja latencia: tiempos de inferencia de decenas de milisegundos en chipsets Snapdragon (39,73 ms en Snapdragon 8 Elite Gen 5 for Galaxy).
- Exportacion personalizable mediante la libreria Qualcomm AI Hub Models (pesos ajustados, formas de entrada, dispositivo y runtime).
- No dispone de clonacion de voz, tool calling, capacidades de agente ni vision/audio de entrada.

## Casos de uso

- Asistentes de voz embebidos en moviles: el modelo genera respuestas habladas en ingles con latencia inferior a 50 ms en Snapdragon 8 Elite, lo que permite interacciones conversacionales fluidas sin enviar texto a la nube.
- Lectura de notificaciones y accesibilidad: sintesis local de mensajes y contenido de UI para usuarios con discapacidad visual, con cuatro voces y modulacion emocional para dar contexto (por ejemplo, tono de alerta o calma).
- Sistemas de infoentretenimiento en automocion: despliegue en Qualcomm SA8295P para respuestas habladas del asistente del vehiculo, con inferencia en NPU y bajo consumo energetico.
- Dispositivos IoT y industriales: en plataformas Dragonwing IQ-8275, QCS8550 e IQ-9075, el modelo puede locutar estados, alarmas y confirmaciones en entornos con conectividad limitada o requisitos de privacidad.
- PCs Snapdragon X Elite: sintesis de voz local para aplicaciones de escritorio, lectores de pantalla y herramientas de productividad, sin coste de API ni dependencia de red.
- Prototipado y evaluacion de TTS emocional: uso de los binarios pre-exportados y de la libreria AI Hub Models para comparar latencia y consumo en distintos chipsets antes de integrar en producto.
- Fine-tuning y exportacion a medida: partiendo del checkpoint neuphonic/neutts-2e, ajustar voces o emociones y recompilar con formas de entrada y runtime personalizados.

## Benchmarks y rendimiento

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| NeuTTS-2E (prompt_ar128_cl2048) | QNN_CONTEXT_BINARY | float | Snapdragon 8 Elite Gen 5 for Galaxy | 39,73 | 0 - 11 | NPU |
| NeuTTS-2E (prompt_ar128_cl2048) | QNN_CONTEXT_BINARY | float | Snapdragon 8 Elite for Galaxy | 49,446 | 0 - 9 | NPU |
| NeuTTS-2E (prompt_ar128_cl2048) | QNN_CONTEXT_BINARY | float | Snapdragon X Elite | 64,967 | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de calidad de audio (MOS, similitud de hablante, WER) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta en NPU de Qualcomm con memoria pico de 9-11 MB en los chipsets medidos. Checkpoint float de 671 MB en almacenamiento.
- GPU recomendadas: no aplica; el despliegue objetivo son NPU de Qualcomm (Hexagon) en Snapdragon 8 Elite, Snapdragon X Elite, Dragonwing IQ-8275, QCS8550, IQ-9075 y SA8295P.
- Cabe en GPU consumer: no disponible; no se documenta despliegue en GPU NVIDIA o AMD.
- Opciones de despliegue: binarios QNN_CONTEXT_BINARY via QAIRT 2.51; exportacion con Qualcomm AI Hub Models; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: 39,73 ms (Snapdragon 8 Elite Gen 5 for Galaxy), 49,446 ms (Snapdragon 8 Elite for Galaxy), 64,967 ms (Snapdragon X Elite) por invocacion de decode segun la tabla de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| NeuTTS-2E | 236M | 2048 tokens | Ingles | Apache 2.0 | TTS emocional on-device con NPU Qualcomm |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos TTS comparables (por ejemplo, otras variantes NeuTTS, Piper, Kokoro o sistemas comerciales) que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Solo genera voz en ingles; no se documenta soporte multilingue.
- Solo cuatro hablantes fijos y siete emociones; no hay clonacion de voz ni control fino de prosodia mas alla del condicionamiento emocional.
- Contexto limitado a 2048 tokens y prefill de 128 tokens, lo que restringe la longitud de texto por invocacion.
- El backbone se ejecuta en NPU Qualcomm; el despliegue fuera de hardware Qualcomm no esta documentado en esta ficha.
- Riesgo de alucinacion y errores de pronunciacion en textos atipicos (nombres propios, siglas, terminos tecnicos) no evaluado en la informacion disponible.
- Sesgos de habla y emocion no documentados; al ser voces fijas, la representacion demografica y de acentos es limitada por diseno.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint original neuphonic/neutts-2e y de QAIRT antes de redistribuir binarios.
- No se documentan limitaciones de seguridad, filtros de contenido ni moderacion de texto de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/NeuTTS-2E
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/neutts_2e
- Repositorio AI Hub Models (NeuTTS-2E): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/neutts_2e
- Implementacion original NeuTTS: https://github.com/neuphonic/neutts
- Checkpoint original: https://huggingface.co/neuphonic/neutts-2e
- Paper referenciado: https://arxiv.org/abs/2509.09550
- Workbench AI Hub: https://workbench.aihub.qualcomm.com
- Qualcomm (web corporativa): https://www.qualcomm.com/
