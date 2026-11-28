# OmniJev/OneJev-9B

## Resumen

OneJev-9B es un modelo multimodal de decisión de tipo "System One" desarrollado por el equipo OmniJev. Se trata de un fine-tune completo de Qwen/Qwen3.5-9B sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes. A diferencia de los modelos conversacionales al uso, OneJev-9B no genera texto libre: recibe un estado (captura de pantalla, foto, vídeo o texto) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta.

El modelo resuelve un problema concreto en el ámbito de los agentes autónomos: la evaluación rápida y calibrada de decisiones intermedias (por ejemplo, si una tarea está completada, qué acción ejecutar a continuación o cuánto progreso se ha alcanzado). Frente a los modelos de razonamiento extenso, apuesta por la inferencia de baja latencia: en una H200 con una captura de 1280x720 responde una pregunta en 81 ms y diez preguntas en una sola petición en 131 ms (13,1 ms por pregunta).

Con 9.409.813.744 parámetros reales (según safetensors), un repositorio de 18,8 GB y licencia Apache 2.0, se posiciona como una alternativa ligera dentro de la familia OneJev, que incluye variantes de 0,8B, 4B, 27B y 27B-FP8. Su relevancia actual radica en la combinación de multimodalidad (imagen y vídeo), API tipada y despliegue tanto en PyTorch como en llama.cpp mediante GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-9B); pipeline image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible (build de mradermacher); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB); GGUF (build externo) |

## Arquitectura y entrenamiento

OneJev-9B es un fine-tune completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, con arquitectura transformer multimodal que procesa texto, imágenes y vídeo bajo el pipeline image-text-to-text. El entrenamiento se realizó sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes, recogidas en el dataset OmniJev/OneJev-Data.

La innovación principal no reside en la arquitectura del backbone, sino en el paradigma de salida: el modelo está entrenado para emitir probabilidades calibradas sobre preguntas tipadas (tipos `noul`, `choice` y `score`) en un único forward pass, en lugar de generar texto autoregresivo. El conjunto de test de OneJev contiene tipos de pregunta que ningún modelo vio durante el entrenamiento, lo que permite evaluar la generalización a formatos de decisión no vistos. El detalle técnico del enfoque se describe en el paper de Flide (arXiv:2610.42148), el servidor que implementa la System One API de TypeSafe con un campo `media` para imágenes y vídeo.

## Capacidades

- Evaluación de decisiones sobre imágenes: recibe capturas de pantalla o fotos y devuelve probabilidades por opción.
- Procesamiento de vídeo: soportado en el servidor PyTorch (no en la ruta llama.cpp).
- Preguntas tipadas: soporta tres tipos de pregunta: `noul` (probabilidad de sí/no), `choice` (distribución de probabilidad sobre opciones con criterios) y `score` (nivel esperado sobre una escala de criterios).
- Calibración de probabilidades: las salidas son probabilidades calibradas, no texto generado.
- Razonamiento multi-pregunta: puede responder varias preguntas en una sola petición (10 preguntas en 131 ms en H200).
- Orientación a agentes GUI: diseñado para evaluar si una tarea está completada, qué acción ejecutar a continuación (click, type, scroll, stop) o el grado de progreso.
- Integración por API: compatible con el endpoint `/v1/systemone` del servidor Flide.
- Despliegue en llama.cpp: disponible mediante GGUF (Q8_0) con imágenes, sin PyTorch.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking: no disponible; el modelo es explícitamente de tipo System One (decisión rápida, sin razonamiento extendido).

## Casos de uso

- Agentes GUI y automatización de escritorio: el modelo recibe la captura de pantalla actual y el estado de la tarea y devuelve la probabilidad de cada acción posible (click, type, scroll, stop). Es adecuado por su latencia de 81 ms por pregunta en H200, que permite bucles de decisión interactivos.
- Verificación de finalización de tareas: mediante preguntas de tipo `noul` ("la factura ha sido pagada"), el agente puede comprobar si ha terminado antes de cerrar el flujo, con una probabilidad calibrada en lugar de una respuesta binaria generada.
- Seguimiento de progreso en pipelines de agentes: con preguntas de tipo `score` sobre una escala ("no iniciado", "a medias", "casi terminado", "terminado"), se obtiene el nivel esperado para monitorizar el avance de tareas largas.
- Enrutamiento de acciones en asistentes de voz o chat: dada una imagen o transcripción, el modelo puede clasificar la intención siguiente entre un conjunto cerrado de opciones con probabilidades, útil para desambiguar antes de invocar herramientas.
- Análisis de vídeo para agentes robóticos o de monitorización: el servidor PyTorch acepta vídeo como entrada, lo que permite evaluar estados de una tarea a partir de secuencias de fotogramas.
- Evaluación automática de calidad de trayectorias de agentes: en pipelines de RLHF o de evaluación offline, el modelo puede puntuar decisiones intermedias de ejecuciones registradas (dataset OneJev-Data) para filtrar trayectorias exitosas.
- Despliegue en entornos sin GPU de gama alta: la build GGUF Q8_0 permite ejecutar el modelo con llama.cpp en hardware más modesto, manteniendo el soporte de imágenes para casos de agente GUI.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados (imagen SVG) que compara OneJev-9B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, con precisión en porcentaje sobre el test set de OneJev (tipos de pregunta no vistos en entrenamiento). Los valores numéricos concretos no están disponibles en el texto proporcionado.

| Métrica | Valor |
|---|---|
| Precisión en test set OneJev (porcentaje) | no disponible en texto (presente solo en imagen SVG de la model card) |
| Latencia, 1 pregunta (H200, captura 1280x720) | 81 ms |
| Latencia, 10 preguntas en una petición (H200) | 131 ms (13,1 ms por pregunta) |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (safetensors, 18,8 GB de pesos): aproximadamente 20-24 GB, según overhead de activaciones y contexto.
- VRAM estimada con GGUF Q8_0: aproximadamente 10-12 GB, apto para GPU de consumo de gama alta.
- GPU recomendadas: H200 (medición oficial de latencia), A100 y H100 para despliegue en producción con vídeo; RTX 4090 (24 GB) para precisión completa o Q8_0.
- Cabe en GPU de consumo: sí, en RTX 4090 y GPUs con 24 GB o más en precisión completa; con Q8_0 en GPUs de 12 GB o más.
- Opciones de despliegue: servidor Flide (`flide serve --model OmniJev/OneJev-9B`, requiere `flide` y `torchvision`), llama.cpp mediante `qev serve --gguf mradermacher/OneJev-9B-GGUF:Q8_0`. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: 81 ms por pregunta y 13,1 ms por pregunta en lotes de 10 sobre H200 con captura 1280x720.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| OneJev-9B | 9,4B | no disponible | Imagen, vídeo, texto | Apache 2.0 | Fine-tune de Qwen3.5-9B; salida de probabilidades calibradas |
| OneJev-4B | no disponible | no disponible | Imagen, vídeo, texto | Apache 2.0 | Base Qwen3.5-4B; pesos de 10,4 GB |
| OneJev-27B | no disponible | no disponible | Imagen, vídeo, texto | Apache 2.0 | Base Qwen3.8-27B; pesos de 54,7 GB; versión FP8 de 30,4 GB |
| Jev 1.13 | no disponible | no disponible | Solo texto | no disponible | Modelo previo de la familia; puntuaciones publicadas en la comparativa |
| Jev-Omni 12B | 12B | no disponible | Multimodal | no disponible | Comparado en la tabla de resultados de la model card |
| Qwen3.8-27B thinking | 27B | no disponible | no disponible | no disponible | Modelo de razonamiento comparado en la tabla de resultados |

## Limitaciones y advertencias

- El modelo no es conversacional: no genera texto libre, solo probabilidades sobre preguntas tipadas. No debe usarse como sustituto de un LLM de chat.
- Riesgo de calibración deficiente fuera de distribución: aunque el test set incluye tipos de pregunta no vistos, el rendimiento en dominios muy distintos a los datos de entrenamiento (agentes, vídeo, imagen) no está documentado.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento correcto fuera del inglés o de los idiomas presentes en el dataset de entrenamiento.
- Longitud de contexto no disponible: limita la planificación de tareas con estados muy largos o vídeos extensos.
- El soporte de vídeo solo está disponible en el servidor PyTorch (Flide); la ruta llama.cpp/GGUF solo procesa imágenes.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al derivar de Qwen3.5-9B, podría heredar sesgos del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del dataset OneJev-Data.
- Dependencia de infraestructura específica: la API System One requiere el servidor Flide o `qev`; no es un endpoint OpenAI estándar de chat completions.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev-9B
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Demo (Gradio): https://huggingface.co/spaces/BradNLP/OneJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Dataset: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Repositorio Flide: https://github.com/OmniJev/Flide
- Build GGUF (mradermacher): https://huggingface.co/mradermacher/OneJev-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- OneJev-0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- OneJev-4B: https://huggingface.co/OmniJev/OneJev-4B
- OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
