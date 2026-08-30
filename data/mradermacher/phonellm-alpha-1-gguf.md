# mradermacher/phonellm-alpha-1-GGUF

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje especializado en conversaciones telefónicas y agentes de voz en tiempo real, desarrollado por Pipecat AI. Se trata de un fine-tuning del modelo base NVIDIA Nemotron-3-Nano-30B-A3B, que emplea una arquitectura híbrida Nemotron-H que combina atención Mamba con mixture-of-experts (MoE). El modelo tiene aproximadamente 31,6 mil millones de parámetros totales, de los cuales solo unos 3 mil millones están activos por token, lo que lo hace especialmente eficiente para inferencia en tiempo real.

El modelo está diseñado para integrarse en sistemas de voz interactivos, con soporte nativo para tool-use y function-calling, lo que permite a los agentes telefónicos ejecutar acciones externas (consultas a bases de datos, APIs, etc.) durante una conversación. Su relevancia actual radica en la creciente demanda de asistentes de voz automatizados que puedan manejar interacciones naturales y contextuales, y en la tendencia hacia modelos abiertos optimizados para latencia baja.

Este repositorio concreto contiene las cuantizaciones GGUF del modelo, preparadas por mradermacher, lo que facilita su despliegue en entornos con recursos limitados mediante herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrido (Mamba + attention) con mixture-of-experts |
| Parametros totales | 31.577.940.288 (~31,6 mil millones) |
| Parametros activos | ~3 mil millones (arquitectura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (segun el README del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repo), safetensors (repo original) |

## Arquitectura y entrenamiento

PhoneLLM Alpha 1 parte del modelo NVIDIA Nemotron-3-Nano-30B-A3B, que utiliza una arquitectura híbrida Nemotron-H. Esta combina capas de atención tradicional con capas basadas en Mamba (state space models), y emplea un esquema MoE con 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. Esta combinación busca equilibrar la calidad de generación con la eficiencia computacional, reduciendo la latencia en inferencia.

El fine-tuning realizado por Pipecat AI se centra en tareas de conversación telefónica y agentes de voz, incorporando soporte para tool-use y function-calling. No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de RLHF o DPO. La información disponible indica que el modelo está optimizado para interacciones multi-turno en contextos de voz, aunque no se especifica la longitud de contexto soportada.

## Capacidades

- Generación de texto conversacional orientado a diálogos telefónicos y asistentes de voz.
- Soporte nativo de tool-use y function-calling, permitiendo al modelo invocar herramientas externas durante una conversación.
- Capacidad para actuar como agente autónomo en flujos de conversación multi-turno.
- Integración con pipelines de voz en tiempo real, gracias a su arquitectura eficiente (MoE con ~3B activos).
- Posible soporte multilingüe, aunque no se ha confirmado oficialmente.
- Compatible con formatos GGUF, lo que permite su ejecución en una amplia gama de entornos (llama.cpp, Ollama, etc.).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar llamadas telefónicas de soporte, resolviendo consultas frecuentes y derivando casos complejos a agentes humanos. Su capacidad de function-calling permite consultar sistemas de ticketing o bases de conocimiento en tiempo real.
- Asistentes de reservas: integrado en sistemas de telefonía, puede manejar reservas de citas, restaurantes o servicios, interactuando con calendarios y APIs de reserva mediante tool-use.
- Encuestas y sondeos telefónicos: el modelo puede realizar llamadas automatizadas para recopilar respuestas, adaptando el guion según las respuestas del usuario y registrando los datos en sistemas externos.
- Agentes de ventas y soporte postventa: capaz de mantener conversaciones naturales para ofrecer productos, resolver dudas y procesar pedidos, con acceso a catálogos y sistemas de pago a través de function-calling.
- Verificación de identidad y autenticación: puede guiar al usuario por procesos de verificación, consultando bases de datos de clientes y validando información mediante herramientas externas.
- Asistentes personales de voz: desplegado en dispositivos o servicios de voz, puede gestionar tareas como recordatorios, búsquedas de información o control de dispositivos domésticos, usando tool-use para interactuar con otras aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- Al ser un modelo MoE con ~3 mil millones de parámetros activos, la inferencia es notablemente más eficiente que un modelo denso de 30B, pero el peso total en memoria depende de la cuantización elegida.
- Para cuantizaciones bajas (Q2_K, Q3_K), el modelo puede caber en GPUs con 12-16 GB de VRAM, aunque no se dispone de tamaños exactos de archivo por quant en este repo.
- Para cuantizaciones medias (Q4_K_M, Q5_K_M), se recomienda al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10, A100).
- Las cuantizaciones altas (Q8_0, F16) requieren 32 GB o más de VRAM, típicamente en GPUs profesionales como A100 o H100.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, o servidores compatibles con endpoints (el repo incluye la etiqueta `endpoints_compatible`).
- La latencia estimada no está disponible, pero la arquitectura MoE con pocos parámetros activos sugiere un rendimiento adecuado para aplicaciones de voz en tiempo real.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de voz o agentes telefónicos. El modelo base Nemotron-3-Nano-30B-A3B es comparable en arquitectura a otros MoE eficientes como Mixtral 8x7B (aunque con menos parámetros activos) o Qwen2.5-32B, pero no hay datos de rendimiento específicos para PhoneLLM Alpha 1. Se recomienda consultar benchmarks del modelo base para una referencia aproximada.

## Limitaciones y advertencias

- La licencia del modelo no está especificada en la información disponible, lo que genera incertidumbre sobre su uso comercial. Se debe contactar con Pipecat AI o NVIDIA para aclarar los términos.
- No se han publicado detalles sobre sesgos o alucinaciones específicas, pero al ser un modelo de lenguaje, existe riesgo de generar información falsa o no verificada, especialmente en contextos de voz donde no hay retroalimentación visual.
- La longitud de contexto no está documentada, lo que limita la planificación de conversaciones muy largas o con mucho historial.
- El soporte multilingüe no está confirmado; si se requiere uso en español u otros idiomas, es necesario validar el comportamiento.
- Al ser un fine-tuning especializado en voz, su rendimiento en tareas generales de texto puede ser inferior al del modelo base.
- Las cuantizaciones GGUF pueden introducir degradación de calidad, especialmente en las versiones de menor precisión (Q2_K, Q3_K).

## Enlaces

- Repositorio HuggingFace de este modelo GGUF: https://huggingface.co/mradermacher/phonellm-alpha-1-GGUF
- Repositorio HuggingFace del modelo original (Pipecat AI): https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Repositorio GGUF alternativo (EryriLabs): https://huggingface.co/EryriLabs/phonellm-alpha-1-GGUF
- Noticia y entrevista sobre el lanzamiento (ThursdAI): https://thursdai.news/guests/kwindla/aug-27-2026
