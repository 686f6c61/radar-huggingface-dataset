# MachinePulseAI/karpo-decision-31B

## Resumen

Karpo Decision 31B es un modelo de decisión multimodal desarrollado por MachinePulseAI, afinado a partir de google/gemma-4-31B-it. No es un modelo generativo al uso: dado un estado (una página web y su captura de pantalla, un documento o una conversación, en texto, JSON e imágenes) y un conjunto de preguntas tipadas, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass, sin generar texto. La salida se obtiene mediante un readout lineal de 255 × 5.376 en fp32 sobre las representaciones del modelo base.

El modelo resuelve el problema de la toma de decisiones estructurada y evaluable: en lugar de producir una respuesta abierta, clasifica entre opciones (`choice`, hasta 255 alternativas), verdadero/falso (`noul`) o un nivel en una escala (`score`). Esto lo hace adecuado para pipelines donde se necesita una señal calibrada y de baja latencia en lugar de texto libre.

Su relevancia actual radica en el resultado declarado por el autor en el Decision Index 0.4.1 (tabla del 12 de noviembre de 2026), donde ocupa el puesto número 1 con una puntuación Full de 73,9 sobre 300 entradas, compartiendo primer puesto con GLiDE 27B (73,4). La licencia Apache-2.0 y la disponibilidad de API Python y servidor HTTP facilitan su integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 31B) con readout lineal de 255 × 5.376 en fp32 |
| Parámetros totales | 31.273.088.876 (31,3B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal que acepta texto e imágenes, y se afina como fine-tune para una tarea de clasificación tipada. La innovación principal es la sustitución de la generación autoregresiva por un readout lineal sobre las opciones: el modelo procesa el estado y las preguntas y emite directamente una probabilidad por opción en un solo forward pass. Los pesos del modelo base se mantienen en bf16, mientras que el readout opera en fp32.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor describe el modelo con la etiqueta `system-one`, en alusión a un modo de decisión rápida e intuitiva frente al razonamiento multi-paso. Cuando una petición supera los 32.768 tokens, se divide por preguntas y cada parte recibe el estado completo. No se han publicado más detalles sobre el proceso de entrenamiento.

## Capacidades

- Decisión tipada multimodal: responde preguntas `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (nivel en una escala).
- Entrada multimodal: texto, JSON e imágenes (captura de pantalla en `state.viewport_screenshot` o data URLs en `images`).
- Salida probabilística calibrada por opción en un único forward pass, sin generación de texto.
- Procesamiento de estados complejos: páginas web con su captura, documentos y conversaciones.
- Interfaces de integración: API Python y servidor HTTP en formato System One (`POST /v1/systemone`).
- Gestión de peticiones largas mediante división por preguntas cuando se supera el contexto de 32.768 tokens.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Moderación y clasificación de contenido: el modelo puede evaluar un texto o una captura contra un conjunto de categorías tipadas (`choice`) y devolver probabilidades calibradas por categoría, útil para umbrales configurables en pipelines de revisión.
- Enrutamiento de tickets de soporte: dado un mensaje de usuario y su contexto, clasificar la categoría o el nivel de urgencia (`score`) en un solo paso, con latencia declarada de 94 ms por petición en una GPU.
- Validación de formularios y flujos web: procesar la captura de pantalla y el DOM de una página para decidir si un estado cumple condiciones (`noul`) o qué opción de un desplegable corresponde.
- Extracción de decisiones en documentos: evaluar un documento y responder preguntas cerradas sobre su contenido, como la presencia de cláusulas o la clasificación de su tipo.
- Evaluación automatizada de agentes: usar el modelo como juez que puntúa (`score`) o elige (`choice`) entre trayectorias o respuestas candidatas, aprovechando su calibración declarada (error de calibración de 4,8 puntos).
- Filtrado previo en pipelines RAG: decidir si un fragmento recuperado es relevante para una consulta (`noul`) antes de pasarlo a un modelo generativo, reduciendo coste y latencia.
- Automatización de pruebas de interfaz: dado el estado de una aplicación web (texto más captura), verificar mediante preguntas tipadas si la UI se encuentra en el estado esperado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y la model card (no verificados de forma independiente):

| Métrica | Valor |
|---|---|
| Decision Index 0.4.1, Full score (tabla del 12 de noviembre de 2026) | 73,86 (puesto 1 de 300 entradas) |
| Tests privados, mismas habilidades (escala pública) | 70,7 |
| Tareas privadas, dominios nuevos (escala pública) | 78,6 |
| Índice público (ejecución propia, adoptada por la tabla) | 75,05 |
| Índice bruto | 80,9 |
| Breadth | 74,7 |
| Knowledge & Reasoning | 65,5 |
| Language Understanding | 76,8 |
| Retrieval & Classification | 76,4 |
| Tools & Automation | 88,4 |
| Arts & Human Taste | 68,2 |
| Latencia mediana (una GPU, una petición a la vez) | 94 ms por petición |
| Error de calibración | 4,8 puntos |

La suite pública consta de 140.178 peticiones puntuadas, con 11 no soportadas (preguntas que junto con su estado superan los 32.768 tokens). La tabla agrupa como primer puesto a los modelos dentro de 0,9 puntos: karpo-decision-31B (73,9) y GLiDE 27B (73,4) comparten el número 1.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 62,6 GB solo para pesos (tamaño del repo), más overhead de activaciones y del readout en fp32; se requiere una GPU de 80 GB para una sola instancia sin cuantizar.
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores para bf16. En consumer GPU no cabe sin cuantización.
- Cuantización: no se documentan tipos de cuantización soportados en la información disponible, por lo que no se puede confirmar su viabilidad en GPUs de 24 GB (RTX 4090) o menores.
- Despliegue: el autor proporciona API Python y servidor HTTP propio en formato System One (`POST /v1/systemone`); no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia mediana declarada de 94 ms por petición en una GPU con una petición a la vez; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index Full (0.4.1) | Licencia |
|---|---|---|---|---|
| karpo-decision-31B | 31,3B | 32.768 | 73,9 (puesto 1, compartido) | Apache-2.0 |
| GLiDE 27B | 27B (según nombre) | no disponible | 73,4 (puesto 1, compartido) | no disponible |
| karpo-decision-12B | 12,0B | no disponible | no disponible | Apache-2.0 (según familia) |
| karpo-decision-9B | 8,4B | no disponible | no disponible | Apache-2.0 (según familia) |

Los modelos de la familia Karpo Decision (12B y 9B) se ofrecen como alternativas de menor tamaño del mismo autor, aunque la información disponible no incluye sus puntuaciones. No se dispone de datos de benchmarks de otros modelos comparables fuera de la tabla del Decision Index.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El modelo no genera texto: solo emite probabilidades sobre opciones predefinidas; no sirve para tareas generativas abiertas.
- Límite de 32.768 tokens por secuencia; las peticiones más largas se dividen por preguntas, lo que puede fragmentar el contexto.
- Máximo de 255 opciones por pregunta de tipo `choice`.
- No se documentan los idiomas soportados; el rendimiento en castellano no está confirmado.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación específicas; el error de calibración declarado es de 4,8 puntos, lo que implica desviaciones medibles en las probabilidades.
- El rendimiento en dominios nuevos (78,6) difiere del de habilidades conocidas (70,7), lo que sugiere variabilidad según la tarea.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Gemma 4.
- No se documentan opciones de cuantización ni soporte confirmado en frameworks de despliegue estándar, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados de la ejecución: https://huggingface.co/datasets/MachinePulseAI/karpo-decision-31B-decision-index/tree/main/runs/karpo-decision-31B
- Repositorio GitHub: https://github.com/machinepulse-ai/karpo-decision
- Plataforma API: https://platform.karpo.ai
- Modelo hermano 12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo hermano 9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-31B/blob/main/LICENSE
