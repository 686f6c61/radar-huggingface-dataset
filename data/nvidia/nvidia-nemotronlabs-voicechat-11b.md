# nvidia/NVIDIA-NemotronLabs-VoiceChat-11B

## Resumen

NVIDIA NemotronLabs VoiceChat 11B es un modelo de voz de extremo a extremo (speech-to-speech) desarrollado por NVIDIA, diseñado para conversaciones en tiempo real con duplex completo (full-duplex). A diferencia de los sistemas tradicionales en cascada (ASR → LLM → TTS), este modelo integra la comprensión y generación de voz en una única arquitectura unificada, lo que permite interacciones fluidas y de baja latencia sin necesidad de orquestar varios componentes. Está basado en el modelo de lenguaje NVIDIA Nemotron-Nano-9B-v2, del que hereda su capacidad de razonamiento y comprensión, y añade módulos de audio para procesar y generar voz directamente.

El modelo se publicó en julio de 2026 y ha recibido atención por su capacidad de turn-taking de aproximadamente 450 ms y por soportar tool calling en vivo, lo que lo hace adecuado para asistentes conversacionales que necesitan ejecutar acciones mientras mantienen una conversación natural. Con 11 000 millones de parámetros, se posiciona como una alternativa abierta a modelos propietarios de voz, con licencia openmdw-1.1 que permite uso comercial bajo ciertas condiciones. Su relevancia actual radica en la creciente demanda de interfaces de voz naturales y en tiempo real para aplicaciones de atención al cliente, agentes personales y dispositivos inteligentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en NVIDIA Nemotron-Nano-9B-v2 con módulos de audio (no se especifica el tipo exacto) |
| Parametros totales | 11 000 millones (11B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors, se pueden aplicar cuantizaciones estándar) |
| Idiomas soportados | inglés (según etiqueta "en"; no se confirman otros idiomas) |
| Licencia | openmdw-1.1 (Open Model Data Warehouse, permite uso comercial con restricciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre el LLM NVIDIA Nemotron-Nano-9B-v2, al que se añaden componentes de procesamiento de audio para entrada y salida de voz. La arquitectura es unificada: el mismo modelo recibe audio de entrada y genera audio de salida en streaming, sin depender de un pipeline externo de ASR/TTS. Esto permite un funcionamiento full-duplex, es decir, el modelo puede escuchar y hablar simultáneamente, gestionando turnos de conversación de forma natural.

No se han publicado detalles específicos sobre el dataset de entrenamiento ni el número de tokens utilizados. Los papers asociados (arXiv:2410.17196, 2503.04721, 2604.04847, 2505.15670, 2507.08128) sugieren que el entrenamiento incluye técnicas de alineación y ajuste fino para voz, pero no se dispone de información concreta sobre el uso de RLHF o DPO. La innovación principal es la integración de tool calling en tiempo real dentro de un modelo de voz, lo que permite que el asistente ejecute funciones externas mientras mantiene la conversación.

## Capacidades

- Conversación de voz full-duplex en tiempo real: el modelo puede escuchar y hablar simultáneamente, con un tiempo de turn-taking de aproximadamente 450 ms.
- Comprensión y generación de voz en streaming: procesa audio de entrada y genera audio de salida de forma continua, sin esperar a que el usuario termine de hablar.
- Tool calling en vivo: puede invocar funciones externas (por ejemplo, consultar APIs, controlar dispositivos) durante la conversación, lo que lo hace apto para agentes que necesitan ejecutar acciones.
- Razonamiento y comprensión del lenguaje: al estar basado en Nemotron-Nano-9B-v2, conserva capacidades de razonamiento, generación de texto y comprensión semántica.
- Soporte multilingüe: no confirmado; la etiqueta indica solo inglés, aunque podría funcionar con otros idiomas si el modelo base los soporta.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar llamadas telefónicas o chats de voz con clientes, resolviendo consultas frecuentes y derivando a un agente humano cuando sea necesario. Su full-duplex permite interrupciones naturales y respuestas rápidas, mejorando la experiencia del usuario.
- Asistentes personales de voz: integrado en altavoces inteligentes o aplicaciones móviles, puede mantener conversaciones fluidas, gestionar calendarios, enviar mensajes o controlar dispositivos del hogar mediante tool calling.
- Agentes de voz para reservas y compras: el modelo puede interactuar con sistemas de reservas (hoteles, restaurantes) o tiendas en línea, ejecutando transacciones a través de llamadas a APIs mientras conversa con el usuario.
- Soporte técnico en tiempo real: en entornos de helpdesk, el modelo puede diagnosticar problemas, guiar al usuario paso a paso y ejecutar comandos de diagnóstico si se le proporcionan las herramientas adecuadas.
- Traducción e interpretación simultánea: aunque no se confirma el soporte multilingüe, si se entrena con datos multilingües podría usarse para interpretación en tiempo real, aprovechando su baja latencia.
- Juegos y entretenimiento interactivo: personajes no jugadores (NPC) que conversan de forma natural con los jugadores, reaccionando a sus comandos de voz y ejecutando acciones dentro del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparativas con otros sistemas de voz. Se recomienda consultar la documentación oficial de NVIDIA para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Para un modelo de 11B en FP16 se necesitarían aproximadamente 22 GB de VRAM; con cuantización INT8 se reduciría a unos 11 GB, y con INT4 a unos 5,5 GB. Estas cifras son estimaciones genéricas y no han sido confirmadas por NVIDIA.
- GPU recomendadas: no se especifican. Para ejecutar el modelo en FP16 se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantización, podría caber en GPUs de 16 GB o incluso 8 GB.
- Opciones de despliegue: no se mencionan herramientas específicas, pero al ser un modelo safetensors, se puede servir con frameworks como vLLM, llama.cpp o TGI si se adapta a sus formatos. Para uso de voz, NVIDIA ofrece un contenedor NIM en NGC.
- Latencia y throughput: no disponibles. El turn-taking de 450 ms sugiere una latencia baja, pero no se han publicado mediciones de throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (modelos de voz full-duplex). Existen otros sistemas como Qwen2-Audio o modelos de voz de Google, pero no se han encontrado datos comparables en la información proporcionada. Se recomienda consultar benchmarks independientes.

## Limitaciones y advertencias

- Sesgos conocidos: al estar basado en un LLM, puede heredar sesgos presentes en los datos de entrenamiento del modelo base. No se han publicado evaluaciones específicas de sesgo para este modelo.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en contextos de voz donde la información es ambigua.
- Limitaciones de idioma: la etiqueta indica solo inglés; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia openmdw-1.1 permite uso comercial, pero puede imponer condiciones sobre la redistribución o el uso en ciertos sectores. Es necesario revisar el texto completo de la licencia antes de desplegar en producción.
- Requisitos de hardware: al ser un modelo de 11B, requiere recursos considerables para inferencia en tiempo real, lo que puede limitar su uso en dispositivos de bajo consumo.
- Dependencia de la calidad del audio: el rendimiento puede degradarse con ruido de fondo o acentos no representados en los datos de entrenamiento.

## Enlaces

- [Hugging Face - NVIDIA-NemotronLabs-VoiceChat-11B](https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B)
- [NVIDIA NGC - NemotronLabs VoiceChat](https://catalog.ngc.nvidia.com/orgs/nim/nvidia/containers/nemotron-labs-voicechat/)
- [NVIDIA NIM - Model Card](https://build.nvidia.com/nvidia/nemotron-voicechat/modelcard)
- [NVIDIA NIM - Demo](https://build.nvidia.com/nvidia/nemotron-voicechat)
- [Artículo de MarkTechPost sobre el lanzamiento](https://www.marktechpost.com/2026/08/09/nvidia-releases-nemotronlabs-voicechat-11b-an-open-full-duplex-speech-to-speech-model-with-450-ms-turn-taking-and-live-tool-calling/)
