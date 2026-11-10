# OmniJev/OneJev1.6-9B

## Resumen

OneJev1.6-9B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. Se trata de un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, con 9.409.813.744 parámetros. Su particularidad es que no genera texto libre: recibe una captura de pantalla, una foto, un vídeo o texto plano junto con una serie de preguntas tipadas, y devuelve en un único forward pass una probabilidad calibrada para cada opción de respuesta. Está pensado para agentes que necesitan tomar decisiones discretas y medibles, como un agente de interfaz gráfica (GUI agent) que debe elegir la siguiente acción.

El modelo se ha entrenado sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Es relevante ahora porque ocupa la sexta posición de 172 modelos en la parte pública de Decision Index 0.3 (con una puntuación de 65,31, frente a 59,03 de su versión anterior OneJev1.5-9B), y los cinco modelos que lo superan tienen 26B parámetros o más. Además, supera a 52 de los 57 modelos de entre 25B y 36B parámetros del mismo tablero, lo que lo convierte en una opción muy eficiente en relación calidad/tamaño para tareas de decisión multimodal.

La arquitectura subyacente es la de Qwen3.5-9B (transformer multimodal), adaptada mediante fine-tuning completo y servida a través de la librería Flide, que implementa la API System One de TypeSafe con un campo adicional `media` para imágenes y vídeo. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

OneJev1.6-9B es un full fine-tune del modelo Qwen/Qwen3.5-9B, por lo que hereda su arquitectura transformer multimodal (pipeline `image-text-to-text`). El modelo se ha entrenado sobre aproximadamente 440.000 preguntas provenientes de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal es el enfoque "System One": en lugar de generar texto autoregresivamente, el modelo produce en un solo forward pass probabilidades calibradas para un conjunto de preguntas tipadas (tipos como `noul` para probabilidad de sí/no, `choice` para una distribución sobre opciones, y `score` para un nivel esperado). El modelo se sirve mediante la librería Flide, que implementa la API System One de TypeSafe con soporte para un campo `media` que acepta imágenes y vídeo. No se detallan en la información disponible otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Decisión multimodal: recibe capturas de pantalla, fotos, vídeos o texto plano y devuelve probabilidades calibradas para cada opción de un conjunto de preguntas tipadas.
- Preguntas de tipo `noul`: probabilidad de que una condición booleana se cumpla (por ejemplo, "la factura ha sido pagada").
- Preguntas de tipo `choice`: distribución de probabilidad sobre un conjunto de opciones definidas por el usuario (por ejemplo, click, type, scroll, stop).
- Preguntas de tipo `score`: nivel esperado sobre una escala ordinal (por ejemplo, progreso de la tarea).
- Agente de interfaz gráfica (GUI agent): etiqueta `gui-agent` en el modelo, orientado a decidir la siguiente acción sobre una pantalla.
- Procesamiento de vídeo: soporta entradas de vídeo además de imagen y texto.
- Salida calibrada en un único forward pass, sin generación autoregresiva de texto.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada (el modelo no genera texto libre, sino probabilidades sobre opciones).

## Casos de uso

- Agente de automatización de interfaz gráfica: dado un screenshot y una tarea ("pagar la factura abierta de ACME"), el modelo devuelve la probabilidad de cada acción posible (click, type, scroll, stop) y el progreso de la tarea, lo que permite a un agente RPA decidir el siguiente paso de forma medible y calibrada.
- Verificación de estado de tareas en pipelines de agentes: usando preguntas de tipo `noul`, el modelo estima la probabilidad de que una condición se haya cumplido (por ejemplo, "el formulario se ha enviado"), útil para control de calidad y paradas condicionales en flujos automatizados.
- Enrutamiento y clasificación multimodal: con preguntas de tipo `choice`, el modelo puede clasificar imágenes o frames de vídeo entre categorías definidas por el usuario, aprovechando su calibración para umbrales de confianza.
- Evaluación de progreso en tareas largas: con preguntas de tipo `score`, estima el grado de avance de un agente sobre una escala ordinal, lo que permite monitorizar y priorizar tareas en ejecución.
- Moderación y triaje de contenido visual: el modelo puede asignar probabilidades calibradas a categorías definidas por el usuario sobre imágenes o vídeos, útil para triaje previo a revisión humana.
- Investigación en modelos de decisión: al ser un fine-tune abierto con licencia Apache 2.0, sirve como base para estudiar calibración, decisiones multimodales y comparación con otros modelos del Decision Index.
- Automatización de pruebas de interfaz: dado un screenshot de una aplicación, el modelo puede estimar la probabilidad de que un elemento esté presente o de que una acción concreta sea la correcta, apoyando pruebas automatizadas de UI.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y de la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones). No se han publicado en la información disponible resultados de benchmarks clásicos como MMLU, HumanEval o GSM8K.

| Benchmark / comparación | OneJev1.6-9B | Referencia |
|---|---|---|
| Decision Index 0.3 (parte pública) | 65,31 | OneJev1.5-9B: 59,03 |
| Posición en Decision Index 0.3 | 6 de 172 modelos | Los 5 superiores tienen 26B+ parámetros |
| Modelos de 25B-36B superados | 52 de 57 | — |
| Nace.AI Drex v1.5 | — | 58,08 |
| vLLM-SR d3-flash (9B) | — | 57,79 |
| Standard One 8B SH (v4) | — | 57,40 |
| Bespoke Nimble 9B v3 | — | 57,19 |
| Torchcast Decision | — | 65,1 |
| Amos 1 Large | — | 64,9 |
| Decider 31B | — | 64,3 |
| linne-oak 1.0 | — | 63,9 |
| span-02 26B-A4B | — | 63,6 |
| Matilda Jev v1.5 | — | 63,5 (26B-33B) |

La model card indica además que OneJev1.6-9B obtiene la mejor puntuación en cuatro de las cinco áreas entre los cinco modelos de 6B a 12B parámetros del tablero, pero no se detallan los valores por área en la información disponible. Los resultados de la comparación con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking se presentan en una imagen (`assets/results.svg`) cuyo contenido numérico no está disponible en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, un modelo de 9,4B parámetros en safetensors ocupa aproximadamente 18,8 GB en precisión de 16 bits (tamaño del repo), por lo que la inferencia en fp16 requeriría del orden de 20 GB de VRAM o más, sin contar overhead.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de 24 GB o más (por ejemplo, RTX 4090, A100 40GB, H100) en fp16; en consumer GPU de menor VRAM requeriría cuantización, cuyos formatos no se detallan.
- ¿Cabe en consumer GPU? No confirmado en la información disponible; probablemente en RTX 4090 (24 GB) en fp16, y en GPUs de 16 GB solo con cuantización no documentada.
- Opciones de despliegue: la model card documenta el servidor Flide (`flide serve --model OmniJev/OneJev1.6-9B`), que expone la API System One de TypeSafe con endpoint `/v1/systemone`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-9B | 9,4B | no disponible | 65,31 | Apache 2.0 | Hugging Face |
| OneJev1.5-9B | 9B (aprox.) | no disponible | 59,03 | no disponible | Hugging Face |
| Nace.AI Drex v1.5 | no disponible | no disponible | 58,08 | no disponible | no disponible |
| vLLM-SR d3-flash (9B) | 9B | no disponible | 57,79 | no disponible | no disponible |
| Standard One 8B SH (v4) | 8B | no disponible | 57,40 | no disponible | no disponible |
| Bespoke Nimble 9B v3 | 9B | no disponible | 57,19 | no disponible | no disponible |
| Decider 31B | 31B | no disponible | 64,3 | no disponible | no disponible |
| span-02 26B-A4B | 26B (A4B) | no disponible | 63,6 | no disponible | no disponible |

Los cuatro modelos de 6B a 12B parámetros listados son los de mayor puntuación del tablero en esa franja. OneJev1.6-9B también supera a 52 de los 57 modelos de 25B a 36B parámetros del tablero.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al derivar de Qwen3.5-9B y de datos de ejecuciones de agentes, puede heredar sesgos del modelo base y de la distribución de tareas de entrenamiento.
- Riesgo de alucinación: el modelo no genera texto libre, sino probabilidades sobre opciones definidas por el usuario, lo que reduce el riesgo de alucinación textual, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; la model card está en inglés y no documenta capacidades multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B.
- Caveat para producción: el modelo requiere el servidor Flide y la API System One de TypeSafe, lo que añade una dependencia de infraestructura específica; no se documentan opciones de despliegue alternativas (vLLM, TGI, llama.cpp).
- Las preguntas deben ser tipadas (`noul`, `choice`, `score`) y las opciones definidas por el usuario; no es un modelo de chat generalista.
- Los resultados de benchmarks provienen del tablero Decision Index 0.3 en la fecha indicada (16 de octubre de 2026) y de la model card del autor; no hay verificación independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-9B
- Organización en Hugging Face: https://huggingface.co/OmniJev
- GitHub: https://github.com/OmniJev/OneJev
- Web oficial: https://omnijev.github.io/OneJev/
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Repositorio Flide: https://github.com/OmniJev/Flide
- Decision Index 0.3 (parte pública): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
