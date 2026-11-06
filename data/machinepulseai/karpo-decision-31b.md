# MachinePulseAI/karpo-decision-31B

## Resumen

karpo-decision-31B es un modelo de decisión desarrollado por MachinePulseAI, un fine-tune de google/gemma-4-31B-it orientado a una tarea muy concreta: dado un estado (una página web, un documento, una conversación, cualquier texto o JSON) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass, sin generar texto. No es un modelo conversacional ni de generación: la salida es una distribución de probabilidad sobre opciones predefinidas.

El modelo parte de los 31.273.088.876 parámetros de Gemma 4 31B-it en bf16 y añade un readout lineal de 255 × 5.376 en fp32 sobre las representaciones del decoder. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero o falso) y `score` (un nivel en una escala). La ventana de contexto es de 32.768 tokens por secuencia y, si una petición excede ese límite, se divide por preguntas manteniendo el estado completo en cada parte.

Su relevancia radica en la sustitución de la generación de texto por una lectura directa de probabilidades en tareas de clasificación y decisión, lo que elimina el coste de decodificación autoregresiva y el riesgo de formatos inválidos en la salida. Se publica bajo licencia Apache-2.0 y declara un Decision Index 0.3 público de 75,05 (autoinformado, corregido por azar) sobre 140.178 peticiones puntuadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) con readout lineal sobre opciones |
| Parametros totales | 31.273.088.876 (31,3B) en bf16, más readout de 255 × 5.376 en fp32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del decoder de google/gemma-4-31B-it al que se le añade un readout lineal de 255 × 5.376 en fp32 sobre las representaciones del modelo base. En lugar de generar una secuencia de tokens, el modelo proyecta el estado oculto sobre las opciones de cada pregunta y produce directamente una distribución de probabilidad por opción en un solo forward pass. Las preguntas se tipifican en tres clases: `choice` con hasta 255 opciones con criterios etiquetados, `noul` con salida P(verdadero) y `score` con un nivel sobre una escala.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación) no están disponibles en la información proporcionada. La model card únicamente indica que se trata de un fine-tune con readout añadido y que los pesos de visión del modelo base permanecen en el checkpoint pero no se utilizan.

## Capacidades

- Decisión tipada sobre un estado: responde preguntas `choice`, `noul` y `score` devolviendo probabilidades por opción en un único forward pass.
- Procesamiento de estados heterogéneos: acepta texto libre, JSON, documentos, páginas web o conversaciones como estado de entrada.
- Salida estructurada con probabilidades y nivel de confianza por pregunta, sin generación de texto.
- Soporte de múltiples preguntas por petición, cada una con sus propias opciones y criterios.
- Partición automática de peticiones que exceden los 32.768 tokens por preguntas, manteniendo el estado completo en cada parte.
- Servidor HTTP integrado (`POST /v1/systemone`, `GET /healthz`) para despliegue como servicio.
- Integración con el kit Decision Index mediante un engine dedicado.
- Capacidades de visión: los pesos están presentes en el checkpoint pero no se utilizan (modelo solo texto).

## Casos de uso

- Enrutamiento y triaje de tickets de soporte: dado el texto de una incidencia y un conjunto de categorías, el modelo devuelve la probabilidad de cada categoría en un solo paso, lo que permite umbrales de confianza y escalado automático sin parsear texto generado.
- Evaluación de elegibilidad en políticas internas: con el estado (pedido, cliente, política) y preguntas `noul` del tipo "¿cumple la política de devolución?", se obtiene P(verdadero) directamente, como en el ejemplo de la model card con la devolución de una batidora a los 45 días frente a una política de 30.
- Moderación de contenido con escala: preguntas `score` para asignar un nivel de gravedad a un mensaje o documento, útil en pipelines donde se necesita una puntuación ordinal en lugar de una etiqueta binaria.
- Clasificación de documentos en pipelines de ingestión: con hasta 255 opciones por pregunta `choice`, se puede mapear un documento a taxonomías amplias (tipo, departamento, sensibilidad) en una sola pasada.
- Automatización de decisiones en agentes: el servidor HTTP permite que un orquestador consulte al modelo como un servicio de decisión de baja latencia, sin coste de decodificación autoregresiva y sin riesgo de formatos inválidos.
- Extracción de señales en conversaciones multi-turno: dado el historial completo como estado (hasta 32.768 tokens), responder preguntas sobre intención, satisfacción o siguiente acción del agente.
- Evaluación comparativa de modelos de decisión: el engine de Decision Index permite reproducir la suite pública y comparar el modelo con alternativas sobre las mismas 140.178 peticiones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Decision Index 0.3, suite pública, 140.178 peticiones puntuadas, 11 no soportadas; autoinformado, no verificado):

| Metrica | Valor |
|---|---|
| Public index (corregido por azar) | 75,05 |
| Raw index | 80,90 |
| Breadth | 74,69 |
| Knowledge & Reasoning | 65,46 |
| Language Understanding | 76,78 |
| Retrieval & Classification | 76,42 |
| Tools & Automation | 88,39 |
| Arts & Human Taste | 68,21 |

El autor indica que la puntuación Full (tests privados del leaderboard) se añadirá cuando se publique. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 62,5 GB en bf16, por lo que se necesita al menos una GPU con 80 GB de memoria para cargar el modelo completo; las peticiones largas requieren más memoria adicional.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200. No cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) sin cuantización, y no se documentan tipos de cuantización disponibles.
- Despliegue: el autor proporciona un servidor HTTP propio (`torchrun --standalone --nproc_per_node 1 -m karpo_decision.serve.server`) y un engine para el kit Decision Index. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- La model card indica "una GPU" para la inferencia; no se publican cifras de latencia ni throughput.
- Instalación del cliente: `pip install "karpo-decision @ git+https://github.com/machinepulse-ai/karpo-decision"`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos de decisión en la información proporcionada. La comparación con el modelo base es la siguiente:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| karpo-decision-31B | 31,3B + readout 255×5.376 | 32.768 tokens | Decisión tipada con probabilidades | Apache-2.0 |
| google/gemma-4-31B-it (base) | 31,3B | No disponible en la informacion | Generación de texto e imagen | Apache-2.0 |

No se conocen alternativas públicas de la misma categoría (modelos de decisión con readout lineal sobre opciones) en la información disponible.

## Limitaciones y advertencias

- Modelo solo texto: los pesos de visión están en el checkpoint pero no se utilizan.
- No es un modelo de chat ni de generación de texto; la generación no fue evaluada.
- Las probabilidades no están calibradas (temperatura 1.0), por lo que los umbrales de confianza deben validarse en cada caso de uso.
- Una pregunta que no cabe en 32.768 tokens junto con su estado se rechaza, nunca se trunca; en la suite pública esto afectó a 11 de 140.178 peticiones.
- El modelo siempre elige una de las opciones proporcionadas: no puede responder "ninguna de las anteriores" salvo que se incluya como opción.
- El resultado del Decision Index es autoinformado y no verificado; la puntuación Full (tests privados) aún no está publicada.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones idiomáticas.
- Licencia Apache-2.0 para pesos y código de inferencia, derivada de google/gemma-4-31B-it (Apache-2.0); no se indican restricciones adicionales para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo base (pre-entrenamiento): https://huggingface.co/google/gemma-4-31B
- Código de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Kit Decision Index: https://github.com/apolinario/decision-index
- Resultados del Decision Index: https://huggingface.co/datasets/MachinePulseAI/karpo-decision-31B-decision-index/tree/main/runs/karpo-decision-31B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
