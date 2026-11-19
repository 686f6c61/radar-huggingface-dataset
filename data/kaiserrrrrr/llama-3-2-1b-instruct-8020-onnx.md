# Kaiserrrrrr/Llama-3.2-1B-Instruct-8020-ONNX

## Resumen

Llama-3.2-1B-Instruct-8020-ONNX es una versión ajustada (fine-tune) y cuantizada a 4 bits del modelo meta-llama/Llama-3.2-1B-Instruct, publicada por el usuario Kaiserrrrrr en Hugging Face. El modelo se distribuye en formato ONNX con cuantización `q4f16` y está optimizado para inferencia en navegador mediante Transformers.js (`@huggingface/transformers`). Su propósito declarado es destilar material de estudio denso, libros de texto y resúmenes académicos en notas de revisión de alto rendimiento siguiendo el principio 80/20.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 1B, con aproximadamente 1.240 millones de parámetros y una ventana de contexto de 128.000 tokens según las especificaciones del modelo base de Meta. El ajuste se ha realizado sobre los datasets allenai/scitldr (resúmenes de artículos científicos) y abisee/cnn_dailymail (resúmenes de noticias), lo que orienta el modelo hacia tareas de síntesis y condensación de texto.

La relevancia de esta ficha radica en su enfoque práctico: es un ejemplo de despliegue de un LLM pequeño en el cliente (navegador) sin necesidad de servidor, lo que reduce latencia, coste de infraestructura y problemas de privacidad. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y la model card es muy escueta, por lo que muchos datos técnicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.240 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (modelo base; no confirmado en el fine-tune) |
| Tipos de cuantizacion | q4f16 (4 bits, float16 para activaciones) en ONNX |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License Agreement |
| Formato de pesos | ONNX (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo base Llama 3.2 1B es un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención agrupada (GQA). La versión publicada aquí es un fine-tune sobre ese base, posteriormente convertido a ONNX y cuantizado a `q4f16` para reducir el tamaño y permitir la ejecución en navegador mediante Transformers.js.

No se dispone de información sobre el número de tokens de entrenamiento del fine-tune, la composición exacta del dataset más allá de los dos conjuntos citados (allenai/scitldr y abisee/cnn-dailymail), ni si se emplearon técnicas de RLHF o DPO adicionales. La model card no detalla hiperparámetros, epochs ni metodología de evaluación. La innovación técnica principal es el propio pipeline de despliegue: conversión a ONNX con cuantización de 4 bits y compatibilidad con la API de Transformers.js para inferencia en el cliente.

## Capacidades

- Generación de texto y resúmenes extractivos y abstractivos, orientados a notas de estudio y síntesis 80/20.
- Condensación de artículos científicos y noticias (entrenado específicamente con scitldr y cnn_dailymail).
- Conversación multi-turno básica (hereda la capacidad instruct del modelo base).
- Razonamiento simple y respuesta a instrucciones en formato chat.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte explícito de agentes o multi-step reasoning.
- Capacidades multilingües no confirmadas para este fine-tune (el base Llama 3.2 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés, pero no hay confirmación en esta versión).
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Resumen de artículos científicos en el navegador: el modelo puede procesar abstracts y generar notas concisas sin enviar datos a un servidor, gracias a su formato ONNX y a Transformers.js. Adecuado para investigadores que quieran previsualizar síntesis de papers.
- Generación de notas de estudio 80/20: a partir de apuntes o capítulos de libros de texto, el modelo produce resúmenes de alto rendimiento orientados a la revisión rápida, su tarea principal de fine-tune.
- Procesamiento de noticias en el cliente: con el dataset cnn_dailymail en el entrenamiento, puede resumir artículos periodísticos directamente en una aplicación web sin backend.
- Aplicaciones educativas offline: integración en plataformas de e-learning que funcionan sin conexión o con privacidad estricta, ya que el modelo se ejecuta íntegramente en el navegador.
- Prototipado rápido de asistentes de estudio: desarrolladores que quieran validar una idea de asistente conversacional sin montar infraestructura de GPU.
- Herramientas de productividad personal: resumen de documentos largos pegados en una web app, con latencia baja y sin coste de API.
- Demos de inferencia en navegador: ejemplo didáctico de cómo desplegar un LLM cuantizado con Transformers.js en una página estática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1,1 GB en formato ONNX q4f16, puede ejecutarse en CPU y en GPUs con poca memoria; se estima un uso de memoria en torno a 1-2 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) podría ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en GPU consumer: sí, por tamaño (1B parámetros cuantizados a 4 bits), aunque no se confirma con mediciones.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) en navegador; ONNX Runtime para entornos nativos o web.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-8020-ONNX | 1,24 B | 128k (base) | Llama 3.2 | ONNX q4f16 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128k | Llama 3.2 | Safetensors | Hugging Face (oficial) |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32k | Apache 2.0 | Safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,7 B | 8k | Apache 2.0 | Safetensors, GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo para este fine-tune concreto. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo base Llama 3.2 puede heredar sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: presente como en cualquier LLM de 1B parámetros; la cuantización a 4 bits puede incrementar la pérdida de fidelidad en resúmenes.
- Limitaciones de contexto o idioma: no se confirma el contexto efectivo tras el fine-tune ni los idiomas soportados; el entrenamiento se centró en inglés (scitldr y cnn_dailymail son en inglés).
- Restricciones de licencia: Llama 3.2 Community License Agreement impone condiciones para uso comercial (incluida la obligación de mostrar "Built with Llama" y restricciones para empresas con más de 700 millones de usuarios mensuales).
- Caveat para producción: el repositorio tiene cero descargas y cero likes, sin evaluación independiente; la model card es mínima y no hay garantías de calidad. La cuantización q4f16 puede degradar tareas de razonamiento complejo.
- El modelo está pensado para resúmenes y notas, no para tareas generales de código, matemáticas o agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Kaiserrrrrr/Llama-3.2-1B-Instruct-8020-ONNX
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Transformers.js: https://github.com/huggingface/transformers.js
- Dataset allenai/scitldr: https://huggingface.co/datasets/allenai/scitldr
- Dataset abisee/cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
