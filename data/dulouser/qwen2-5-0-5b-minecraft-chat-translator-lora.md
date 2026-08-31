# duLouser/qwen2.5-0.5b-minecraft-chat-translator-lora

## Resumen

El modelo `duLouser/qwen2.5-0.5b-minecraft-chat-translator-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por duLouser, diseñado para traducir mensajes de chat de Minecraft entre inglés y alemán en tiempo real. Se basa en el modelo instructivo `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba Cloud, un transformer decoder-only de 0.5 mil millones de parámetros. El adaptador se ha afinado con 5.990 muestras de conversaciones reales de servidores de Minecraft, siguiendo un protocolo estricto de salida de dos líneas que permite su integración directa en motores de retransmisión de chat.

La relevancia de este modelo radica en su especialización en un dominio concreto: la traducción de jerga gamer, errores tipográficos y terminología específica de Minecraft (como `Ansturm` → `Rush` o `LoW` → `Legend of War`). A diferencia de los modelos generalistas, este adaptador consigue una adherencia del 100% al protocolo de salida y una latencia muy baja, incluso en CPU, lo que lo hace adecuado para despliegues ligeros en servidores de juego. El adaptador se distribuye bajo licencia Apache 2.0 y requiere el modelo base para su uso, aunque también existe una versión fusionada sin dependencia de PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | Modelo base: 0.5B; adaptador LoRA: no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B-Instruct soporta 32K, pero no se confirma en la ficha) |
| Tipos de cuantizacion | bfloat16 (para el modelo base); cuantizaciones del adaptador no especificadas |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-0.5B-Instruct`, un modelo de lenguaje denso de 0.5B parámetros con arquitectura transformer decoder-only. El ajuste fino emplea LoRA con rango r=16, alpha=32 y proyecciones objetivo en las capas q, v, k y o. El entrenamiento se realizó con 5.990 muestras en formato ChatML, generadas a partir de 4 escenarios con permutaciones de nombres de usuario, y 666 muestras de validación. Se ejecutó durante 1 época (1.497 pasos) en CPU (AMD Ryzen 7 H 255 con AVX-512 BF16), alcanzando un throughput de ~245 tokens/segundo y una pérdida de validación que descendió de 1.1972 a 0.1005 (reducción del 91,6%). El framework utilizado fue PyTorch 2.2.0, PEFT 0.13.2 y Transformers 4.45+.

La innovación principal reside en el protocolo de salida estricto: el modelo debe emitir exactamente dos líneas, la primera con el idioma detectado (`src: <en|de>`) y la segunda con la traducción al otro idioma (`<target_lang>: <mensaje>`). Este formato permite una integración directa en sistemas de retransmisión de chat en tiempo real, y el modelo ha sido entrenado para manejar errores tipográficos comunes en el chat de juego (por ejemplo, `schwimsmt`, `vlt`, `gehn`).

## Capacidades

- Traducción bidireccional inglés↔alemán de mensajes de chat de Minecraft.
- Adherencia estricta al protocolo de dos líneas: sin preámbulos ni relleno.
- Detección automática del idioma de origen (100% en las pruebas reportadas).
- Mapeo de glosario de dominio: `Ansturm` → `Rush`, `LoW` → `Legend of War`, `LK` → `Leistungskurs`, entre otros.
- Tolerancia a errores tipográficos y jerga gamer.
- Compatible con caché KV persistente para inferencia de latencia plana (<15 ms con caché).
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de traducción especializado.

## Casos de uso

- Traducción en tiempo real de chat de servidores Minecraft: el modelo puede insertarse en un relay de chat que recibe mensajes de jugadores en inglés y alemán, traduciéndolos al instante para que todos los participantes comprendan la conversación. Su protocolo de dos líneas facilita el parseo automático de la salida.
- Moderación multilingüe en comunidades de juego: los administradores pueden monitorizar conversaciones en ambos idiomas sin necesidad de traductores humanos, gracias a la baja latencia y al manejo de jerga específica.
- Integración en bots de Discord o Telegram para servidores de Minecraft: el adaptador puede ejecutarse en CPU con recursos mínimos, permitiendo desplegar un bot de traducción en un VPS económico.
- Entrenamiento de modelos especializados en dominios verticales: el enfoque de LoRA sobre un modelo pequeño demuestra cómo adaptar un LLM a un vocabulario técnico con pocos datos y hardware limitado, sirviendo como referencia para otros dominios.
- Sistema de traducción offline para LAN parties o eventos de juego: al no requerir GPU ni conexión a servicios externos, el modelo puede ejecutarse en portátiles o mini-PCs para traducir el chat localmente.
- Pruebas de concepto de traducción de chat en otros juegos multijugador: aunque está entrenado para Minecraft, la arquitectura y el protocolo pueden adaptarse a otros juegos con jerga similar, reentrenando con datos propios.

## Benchmarks y rendimiento

La model card del autor incluye una comparación con el modelo base sin ajustar y con modelos de mayor tamaño. Los datos reportados son los siguientes:

| Modelo | Adherencia al protocolo | Detección de idioma | Mapeo de glosario | Latencia media |
|---|---|---|---|---|
| Base Qwen 0.5B (sin ajustar) | Fallo | Incorrecta | Ninguno | ~2.000 ms |
| **Este modelo (ajustado)** | 100% estricto | 100% | Ansturm→Rush, LoW→Legend of War | ~1.200 ms CPU / <15 ms con KV cache |
| Nemotron 3.5 Lightning 30B | 100% | 100% | Parcial | ~750 ms |
| Gemini 3.5 Flash Lite | Incluye eco | 100% | Parcial | ~640 ms |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea concreta y no pretende ser un LLM generalista.

## Requisitos de hardware

- Inferencia en CPU: el modelo se entrenó y ejecuta en CPU (AMD Ryzen 7 H 255 con AVX-512 BF16), alcanzando ~245 tokens/segundo durante el entrenamiento. Para inferencia, la latencia reportada es de ~1.200 ms por mensaje en CPU.
- Con caché KV persistente: la latencia baja a <15 ms, lo que permite integración en tiempo real en motores de chat.
- VRAM: no requiere GPU; puede ejecutarse en sistemas sin tarjeta gráfica dedicada.
- GPUs recomendadas: no aplica, aunque si se desea acelerar, cualquier GPU con al menos 2 GB de VRAM (por ejemplo, RTX 3050) sería suficiente para el modelo base de 0.5B en bfloat16.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `PeftModel` de la librería `peft`. También existe una versión fusionada (`duLouser/qwen2.5-0.5b-minecraft-chat-translator`) que no requiere PEFT y puede usarse con Transformers estándar. No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño, podría convertirse a GGUF si se desea.
- Throughput estimado: ~245 tokens/segundo en CPU durante el entrenamiento; en inferencia, la latencia por mensaje es de ~1.200 ms sin caché y <15 ms con caché KV.

## Comparativa con modelos similares

La comparativa más relevante es la que proporciona el propio autor en la model card, enfrentando al modelo con el base sin ajustar y con modelos de mayor tamaño:

| Modelo | Tamaño | Adherencia al protocolo | Detección de idioma | Mapeo de glosario | Latencia media |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | Fallo | Incorrecta | Ninguno | ~2.000 ms |
| **Este adaptador LoRA** | 0.5B + LoRA | 100% | 100% | Completo | ~1.200 ms CPU / <15 ms KV |
| Nemotron 3.5 Lightning 30B | 30B | 100% | 100% | Parcial | ~750 ms |
| Gemini 3.5 Flash Lite | No especificado | 100% (con eco) | 100% | Parcial | ~640 ms |

El adaptador consigue un rendimiento comparable a modelos mucho más grandes en la tarea específica, con una fracción de los recursos. No se dispone de comparaciones con otros adaptadores LoRA de traducción de chat de juegos.

## Limitaciones y advertencias

- Dominio restringido: el modelo solo traduce entre inglés y alemán, y está entrenado exclusivamente con vocabulario y contexto de Minecraft. No generaliza a otros dominios ni a otros pares de idiomas.
- Protocolo rígido: la salida está limitada a dos líneas; si el mensaje de entrada no sigue el formato esperado (`[timestamp] [usuario]: mensaje`), el modelo puede fallar o producir salidas incorrectas.
- Riesgo de alucinación: al ser un modelo de 0.5B, puede inventar traducciones o glosarios en mensajes ambiguos o fuera de su distribución de entrenamiento.
- Dependencia del modelo base: el adaptador requiere cargar `Qwen/Qwen2.5-0.5B-Instruct`; no es un modelo autónomo. La versión fusionada elimina esta dependencia, pero no se ha verificado su disponibilidad.
- Sesgos potenciales: el entrenamiento se realizó con logs de chat de un servidor concreto; puede reflejar sesgos de esa comunidad (por ejemplo, lenguaje ofensivo o jerga específica).
- Sin soporte para otros idiomas: aunque el modelo base Qwen2.5 soporta múltiples idiomas, el adaptador solo maneja en y de.
- Licencia: Apache 2.0, lo que permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia del modelo base.

## Enlaces

- Adaptador LoRA en Hugging Face: https://huggingface.co/duLouser/qwen2.5-0.5b-minecraft-chat-translator-lora
- Modelo fusionado (sin PEFT): https://huggingface.co/duLouser/qwen2.5-0.5b-minecraft-chat-translator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de código y scripts de entrenamiento: https://github.com/chrisb09/minecraft-chat-translator
- Colección Qwen2.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen25
