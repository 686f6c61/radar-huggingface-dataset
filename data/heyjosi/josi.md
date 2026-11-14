# heyjosi/josi

## Resumen

Josi es un modelo de lenguaje especializado en tareas de asistencia ejecutiva, desarrollado por heyjosi y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un fine-tune de Qwen/Qwen3.5-9B (9.197.093.888 parámetros) entrenado mediante LoRA con Unsloth, fusionado posteriormente y cuantizado a formato GGUF Q4_K_M. Su propósito es gestionar correo electrónico, calendario, tareas y administración cotidiana dentro de la plataforma Josi, un asistente autoalojado.

El modelo se distribuye como un único archivo GGUF de 5,78 GB, diseñado para ejecutarse en entornos con 8 GB de VRAM, y se integra de forma nativa con Ollama mediante una configuración de contexto de 24.576 tokens. Su orientación es deliberadamente acotada: no está pensado para programación ni escritura creativa, sino para la operativa de un asistente personal.

La relevancia actual del modelo reside en su enfoque de despliegue local y autoalojado, con licencia permisiva y un tamaño que cabe en GPU de consumo, lo que facilita su adopción en flujos de trabajo personales y de pequeña empresa. No obstante, se encuentra en fase beta y su idioma de trabajo declarado es únicamente el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); no se detalla la variante exacta |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 24.576 tokens (configurado en el Modelfile de Ollama) |
| Tipos de cuantización | Q4_K_M (GGUF); no se publican otras variantes |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (pesos, suite de pruebas y generador de datos) |
| Formato de pesos | GGUF (archivo `josi-qwen3.5-9b-v6-Q4_K_M.gguf`, 5,78 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de aproximadamente 9,2 mil millones de parámetros. Sobre esa base se aplicó un fine-tune mediante LoRA con la librería Unsloth; posteriormente el adaptador se fusionó con los pesos base y el resultado se cuantizó a Q4_K_M en formato GGUF. No se especifican en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO.

Los datos de entrenamiento son conversaciones sintéticas de asistencia ejecutiva generadas por el propio generador de datos de Josi, lo que orienta el modelo hacia dominios concretos (correo, calendario, tareas y administración) y no hacia conocimiento general o generación de código. La model card no documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientada a tareas de asistencia ejecutiva.
- Gestión de correo electrónico, calendario y tareas dentro del ecosistema Josi.
- Administración cotidiana: organización de información y flujos de trabajo de oficina.
- Conversación multi-turno con ventana de contexto de 24.576 tokens.
- Integración con herramientas del asistente Josi (herramientas de correo, calendario y tareas), según la model card.
- Soporte de despliegue local mediante Ollama y contenedor Docker todo-en-uno.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- No se documentan capacidades de visión, audio, código, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Gestión de bandeja de entrada: el modelo puede clasificar, resumir y redactar respuestas a correos dentro del asistente Josi, aprovechando su entrenamiento específico en flujos de correo electrónico.
- Planificación de agenda: interpretación de solicitudes de reunión y organización de eventos de calendario, apoyándose en el contexto de 24.576 tokens para mantener el hilo de conversaciones largas.
- Seguimiento de tareas: extracción y actualización de elementos de tareas a partir de conversaciones e instrucciones del usuario en el entorno de administración.
- Asistente personal autoalojado: despliegue en una máquina local con 8 GB de VRAM para uso privado, sin dependencia de servicios en la nube, gracias al formato GGUF y la integración con Ollama.
- Automatización de administración de pequeña empresa: gestión de recordatorios, resúmenes diarios y organización documental sencilla mediante las herramientas de Josi.
- Prototipado de asistentes verticales: servir como base para fine-tunes adicionales en dominios administrativos, al estar disponible bajo Apache-2.0 con pesos abiertos.
- Evaluación de pipelines de agentes con tool calling: integración en flujos de múltiples pasos dentro del ecosistema Josi para probar la orquestación de herramientas de correo y calendario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 8 GB según la model card (cuantización Q4_K_M).
- GPU recomendadas: no se especifican modelos concretos; el requisito de 8 GB de VRAM es compatible con GPU de consumo de gama media-alta.
- Cabe en GPU de consumo: sí, según el requisito declarado de 8 GB de VRAM.
- Opciones de despliegue: Ollama (Modelfile incluido), Docker todo-en-uno (`heyjosi/josi-allinone`); no se documentan vLLM, llama.cpp, TGI ni otras opciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Josi (heyjosi/josi) | 9,2 B | 24.576 tokens | Apache-2.0 | GGUF Q4_K_M | Asistente ejecutivo |
| Qwen/Qwen3.5-9B (base) | 9,2 B | no disponible | no disponible | no disponible | Modelo generalista |
| Alternativas de asistente autoalojado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni de modelos comparables adicionales en la documentación proporcionada; la única referencia directa es el modelo base Qwen/Qwen3.5-9B, del que Josi hereda arquitectura y tamaño.

## Limitaciones y advertencias

- El modelo está en fase beta y puede cometer errores, según advierte el autor.
- Está diseñado exclusivamente para las herramientas de asistencia de Josi (correo, calendario, tareas y administración), no para programación ni escritura creativa.
- Idioma soportado únicamente inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no se detallan condiciones adicionales sobre los datos sintéticos de entrenamiento.
- El contexto máximo práctico está fijado en 24.576 tokens mediante el Modelfile de Ollama; superarlo puede degradar la calidad.
- Dependencia del ecosistema Josi para aprovechar sus capacidades principales de herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heyjosi/josi
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Instalación todo-en-uno: https://huggingface.co/heyjosi/josi-allinone
- Sitio web del proyecto: https://heyjosi.com
