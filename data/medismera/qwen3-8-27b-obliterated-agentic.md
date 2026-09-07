# medismera/Qwen3.8-27B-OBLITERATED-Agentic

## Resumen

El modelo `Qwen3.8-27B-OBLITERATED-Agentic` es una release de configuración y tokenizer creada por `medismera` sobre el checkpoint `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, que a su vez es una variante sin rechazos del modelo base `Qwen/Qwen3.8-27B`. Su objetivo es restaurar la funcionalidad de tool calling nativa y corregir defectos de la plantilla de chat y del parser de razonamiento que aparecían en el checkpoint abliterated.

El modelo subyacente utiliza una arquitectura híbrida de atención lineal (Mamba SSM + multi-head self-attention) con 27.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 con YaRN. Esta release es relevante para desarrolladores que construyen agentes autónomos o herramientas de asistencia técnica, porque elimina la pérdida silenciosa de datos en bucles de agente (como Hermes Agent, Aider u OpenCode) y proporciona scripts de despliegue para SGLang, vLLM y llama.cpp. Mantiene la abliteration del modelo original, lo que permite responder a peticiones que el modelo base rechazaría, útil en ámbitos como ciberseguridad, investigación y tareas de código complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida lineal-attention (Mamba SSM + Multi-Head Self-Attention), 64 capas intercaladas, atención completa cada 4 capas, GQA 64 query heads / 8 KV heads, dimensión oculta 5.120 |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | No disponible (solo se menciona Q6_K en ejemplos de despliegue GGUF) |
| Idiomas soportados | Inglés (en), chino (zh), árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio contiene configuración y tokenizer; los pesos se heredan del checkpoint base) |

## Arquitectura y entrenamiento

`Qwen3.8-27B` emplea una arquitectura híbrida de atención lineal que combina State Space Models (Mamba SSM) para el escaneo de prefijos en tiempo lineal con Multi-Head Self-Attention para el recall asociativo denso. Las 64 capas se organizan de forma intercalada, ejecutando atención completa cada 4 capas (`full_attention_interval: 4`). El modelo utiliza Grouped-Query Attention con 64 query heads y 8 key-value heads, una dimensión oculta de 5.120 y un vocabulario de 248.044 tokens.

Los datos de entrenamiento, la composición del dataset y si se aplicó RLHF o DPO no están disponibles en la información proporcionada. Esta release no añade entrenamiento adicional; se limita a restaurar la plantilla Jinja completa (8.952 bytes), sincronizar el `tokenizer_config.json` y corregir la emisión condicional de los tags ``. La abliteration original se basa en la proyección ortogonal del vector de rechazo sobre las activaciones del residual stream, preservando el comportamiento sin rechazos del checkpoint `OBLITERATUS`.

## Capacidades

- Generación de texto y razonamiento multi-step con soporte de modo `thinking` controlable mediante `reasoning_effort`.
- Tool calling nativo al 100%: invocación de funciones con argumentos formatados, llamadas paralelas y devoluciones multi-turno con `role: "tool"`.
- Integración con agentes autónomos como Hermes Agent, Aider y OpenCode, sin pérdida silenciosa de datos en los bucles de retroalimentación.
- Compatibilidad con parsers de razonamiento (por ejemplo, `qwen3` en SGLang) que separan `reasoning_content` de `content` en respuestas de la API.
- Capacidades multilingües en inglés, chino y árabe.
- Comportamiento "uncensored": al eliminar los rechazos del modelo base, puede abordar peticiones de ciberseguridad, análisis técnico y tareas de código que el modelo original rechazaría.
- El modelo base `Qwen/Qwen3.8-27B` es nativamente vision-language (imágenes y vídeos), aunque esta release no documenta el flujo de trabajo multimodal.

## Casos de uso

- Agentes autónomos con tool calling: desplegar con SGLang o vLLM para que el agente ejecute llamadas a funciones en bucles multi-turno sin truncamientos ni pérdida de mensajes de tipo `role: "tool"`.
- Asistentes de programación tipo Aider u OpenCode: el modelo puede editar archivos, ejecutar comandos y parsear correctamente las respuestas de herramientas, lo que lo hace adecuado para flujos de trabajo de desarrollo asistido.
- API compatible con OpenAI en producción: servir mediante vLLM con `--enable-auto-tool-choice` y `--tool-call-parser hermes`, integrándose con clientes estándar como LangChain o LiteLLM.
- Análisis de vulnerabilidades y pruebas de penetración: al estar abliterated, responde con detalle técnico a consultas de seguridad ofensiva sin evasivas ni charlas de seguridad.
- Entornos de alta concurrencia para agentes: usar SGLang con RadixAttention para optimizar el caché de KV y maximizar el throughput en cargas de trabajo multi-turno.
- Despliegue local en GPU de consumidor: cuantizar a GGUF y ejecutar con llama-server en RTX 4090 o RTX 5090, aprovechando flash attention y caché de prompts para inferencia local.
- Pipelines de razonamiento que requieren distinguir la cadena de pensamiento de la respuesta final: el parser `qwen3` canaliza el pensamiento a `reasoning_content` y deja `content` con la respuesta, útil para aplicaciones que necesitan mostrar pasos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 54 GB; en cuantización GGUF Q6_K, aproximadamente 20-22 GB. Estas cifras son estimaciones para los pesos del modelo, sin considerar el caché de KV.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 (32 GB) para ejecución local con GGUF cuantizado; A100 (80 GB) o H100 para despliegue en producción con FP16 o BF16.
- Opciones de despliegue: SGLang (RadixAttention, alta concurrencia), vLLM (API compatible con OpenAI y tool calling), llama-server (GGUF para GPU de consumidor).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Qwen/Qwen3.8-27B` | 27B | 32.768 (131.072 con YaRN) | Apache-2.0 | HuggingFace | Modelo base con plantilla de chat original y filtros de seguridad estándar |
| `OBLITERATUS/Qwen3.8-27B-OBLITERATED` | 27B | 32.768 | Apache-2.0 | HuggingFace | Variante abliterated sin rechazos, con defectos en tokenizer y plantilla |
| `medismera/Qwen3.8-27B-OBLITERATED-Agentic` | 27B | 32.768 | Apache-2.0 | HuggingFace | Release de configuración y tokenizer sobre el checkpoint abliterated, con tool calling corregido |

No se dispone de datos de rendimiento comparativo para estos modelos.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo; solo incluye configuración y tokenizer. Es necesario descargar el checkpoint base `OBLITERATUS/Qwen3.8-27B-OBLITERATED` para su uso.
- Al ser una variante uncensored, el modelo puede generar contenido inapropiado o peligroso. Para despliegues en producción se requiere una capa de moderación y control de seguridad.
- No hay evaluación exhaustiva de sesgos ni de tasas de alucinación publicadas.
- Los idiomas soportados se limitan a inglés, chino y árabe; la calidad en otros idiomas no está garantizada.
- La ventana de contexto nativa es de 32.768 tokens, y la extensión a 131.072 mediante YaRN puede degradar el rendimiento si no se configura adecuadamente.
- Los defectos corregidos en la plantilla Jinja y el tokenizer son específicos de esta release; cualquier actualización posterior del checkpoint base podría requerir reaplicar los parches.
- El uso de `reasoning_effort` y el parser `qwen3` exige una configuración cuidadosa para evitar respuestas vacías en clientes estándar.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Agentic
- Checkpoint abliterated original: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Discusión sobre tool calls rotas: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/9
- Discusión sobre pérdida de roles `tool` y contenido vacío: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/14
- Discusión sobre el modo de razonamiento invertido: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/6
