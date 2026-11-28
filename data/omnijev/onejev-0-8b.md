# OmniJev/OneJev-0.8B

## Resumen

OneJev-0.8B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (una captura de pantalla, una foto, un vídeo o texto plano) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está pensado como componente de decisión dentro de pipelines de agentes, no como chatbot.

Es un fine-tune completo del modelo base Qwen/Qwen3.5-0.8B (arquitectura `qwen3_5`, pipeline `image-text-to-text`) sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes. El resultado es un modelo de 1.107.265.600 parámetros (aproximadamente 1,1 B, pese al nombre comercial "0.8B") con pesos en safetensors y un repositorio de 2,2 GB.

Su relevancia actual radica en la latencia y el coste: en una H200 con una captura de 1280x720 responde una pregunta en 31 ms y diez preguntas en una sola petición en 51 ms (5,1 ms por pregunta). Eso lo hace apto para bucles de agente donde la latencia de un LLM generativo sería prohibitiva, y para calibración explícita de decisiones (probabilidad de "hecho", elección entre acciones, puntuación de progreso).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (fine-tune completo de Qwen3.5-0.8B) |
| Parametros totales | 1.107.265.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible (build de mradermacher); FP8 solo en la variante OneJev-27B-FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (build de terceros) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal con codificador visual y pipeline `image-text-to-text`, y se somete a un fine-tune completo (no LoRA) sobre el dataset OmniJev/OneJev-Data. Ese dataset contiene 99.193 preguntas derivadas de ejecuciones reales de agentes, vídeos e imágenes, lo que orienta el modelo hacia la evaluación de estados de entorno en lugar de la generación de lenguaje.

La innovación principal no está en la arquitectura sino en la interfaz: el modelo implementa la System One API de TypeSafe, con un campo `media` para imágenes y vídeo. Las preguntas son tipadas (`noul` para probabilidad de sí/no, `choice` para distribución sobre opciones con criterios nombrados, `score` para nivel esperado sobre una escala ordinal). El servidor de referencia es Flide, que expone el endpoint `/v1/systemone`. El autor describe el modelo como "System One" por analogía con el razonamiento rápido e intuitivo: una pasada, sin cadena de pensamiento, con salida probabilística calibrada.

## Capacidades

- Evaluación de estados visuales: recibe capturas de pantalla, fotos o vídeo y responde preguntas sobre ellos.
- Decisión tipada con probabilidades calibradas: `noul` (probabilidad de que una condición se cumpla), `choice` (una probabilidad por opción con criterios definidos por el usuario) y `score` (nivel esperado sobre una escala ordinal).
- Respuesta a múltiples preguntas en una sola petición y un solo forward pass.
- Soporte de entrada de vídeo (requiere el servidor PyTorch; en llama.cpp solo imágenes).
- Integración con agentes GUI: etiquetas declaradas como `gui-agent`, `decision-model` y `calibration`.
- Inferencia sin PyTorch mediante llama.cpp con el build GGUF (Q8_0) y el servidor `qev`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de generación de texto libre, tool calling generativo ni modo "thinking"; el modelo está especializado en clasificación/calibración multimodal.

## Casos de uso

- Agentes GUI con verificación de estado: dado un `screenshot.png` y una tarea ("Pagar la factura abierta de ACME"), el modelo responde con la probabilidad de que la tarea esté hecha (`noul`) y con la distribución sobre la siguiente acción (`click`, `type`, `scroll`, `stop`). Es adecuado porque devuelve probabilidades calibradas en 31 ms, lo que permite insertar un punto de control fiable en cada paso del bucle del agente.
- Enrutado y selección de acciones en pipelines de automatización: con la pregunta `choice` y criterios definidos por el desarrollador, el modelo actúa como clasificador de política de bajo coste antes de invocar un LLM generativo más caro.
- Monitorización de progreso de tareas de larga duración: la pregunta `score` con una escala ordinal ("no empezado", "a medias", "casi", "hecho") permite estimar el avance de un agente sobre vídeo o capturas sucesivas.
- Control de calidad en anotación y verificación de datos: comprobar si una imagen o fotograma satisface una condición descrita en lenguaje natural, con una probabilidad en lugar de una etiqueta binaria rígida.
- Moderación y filtrado visual de bajo coste: evaluar condiciones sobre imágenes en streaming con 5,1 ms por pregunta cuando se agrupan diez consultas por petición.
- Despliegue en el borde o en CPU: gracias al build GGUF Q8_0 y a llama.cpp, puede ejecutarse sin GPU dedicada ni PyTorch para casos solo de imagen, útil en entornos con recursos limitados.
- Evaluación de trayectorias de agentes en investigación: registrar la probabilidad de éxito o de finalización en cada paso para analizar dónde falla un agente, sin coste de generación.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparando OneJev-0.8B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, sobre un test set de OneJev con tipos de pregunta vistos en entrenamiento pero instancias no vistas. Los valores numéricos no están disponibles en la información proporcionada (la tabla se publica como imagen SVG). Lo que sí se indica: Jev 1.13 solo lee texto y sus puntuaciones son las publicadas por su autor.

Datos de latencia disponibles (H200, captura 1280x720):

| Escenario | Latencia |
|---|---|
| 1 pregunta por petición | 31 ms |
| 10 preguntas en una petición | 51 ms (5,1 ms por pregunta) |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de benchmarks estándar de texto, lo cual es coherente con la naturaleza del modelo (clasificación multimodal, no generación).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 2,2 GB de pesos más overhead de activaciones y codificador visual; viable en GPUs consumer de gama media con 6-8 GB.
- Cuantización GGUF Q8_0: aproximadamente 1,2 GB de pesos, ejecutable en CPU y en GPUs con 4 GB o menos.
- GPUs recomendadas: H200 para el régimen de latencia publicado (31 ms por pregunta); A100 y H100 igualmente válidas. En RTX 4090 el modelo cabe sobradamente y la latencia será del mismo orden, aunque no se publican cifras.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más en Q8_0 y con 6-8 GB en BF16.
- Opciones de despliegue: servidor Flide (`flide serve --model OmniJev/OneJev-0.8B`, requiere `flide` y `torchvision`), llama.cpp con `qev serve --gguf mradermacher/OneJev-0.8B-GGUF:Q8_0`, y transformers con el pipeline `image-text-to-text`. No se documenta soporte de vLLM ni TGI.
- Throughput: 10 preguntas en 51 ms en H200 con una sola imagen de 1280x720, lo que equivale a unos 196 preguntas por segundo por GPU en ese régimen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev-0.8B | 1,1 B | no disponible | imagen, vídeo, texto | Apache 2.0 | HF, GGUF, Flide, llama.cpp |
| OneJev-4B | no disponible | no disponible | imagen, vídeo, texto | Apache 2.0 | HF (10,4 GB) |
| OneJev-9B | no disponible | no disponible | imagen, vídeo, texto | Apache 2.0 | HF (18,8 GB) |
| OneJev-27B | no disponible | no disponible | imagen, vídeo, texto | Apache 2.0 | HF (54,7 GB) |
| Jev 1.13 | no disponible | no disponible | solo texto | no disponible | referencia publicada por su autor |
| Jev-Omni 12B | 12 B (nominal) | no disponible | multimodal | no disponible | no disponible |

La comparación más informativa es interna a la familia OneJev: los cuatro tamaños comparten interfaz y dataset, de modo que la elección es un compromiso entre latencia y precisión. Frente a Jev 1.13, la diferencia clave es la multimodalidad; frente a Jev-Omni 12B, el tamaño (1,1 B frente a 12 B) y, presumiblemente, la latencia. No se dispone de datos de benchmarks de estos competidores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones. Usarlo fuera de la interfaz de preguntas tipadas (`noul`, `choice`, `score`) no está soportado.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe más allá de lo que herede de Qwen3.5-0.8B.
- Longitud de contexto no publicada, lo que impide planificar el tamaño máximo de estado o el número de preguntas por petición con garantías.
- El soporte de vídeo requiere el servidor PyTorch (Flide); en llama.cpp solo funcionan imágenes.
- Las probabilidades son calibradas según el autor, pero la calibración depende de la distribución de los datos de entrenamiento (ejecuciones de agentes, vídeos e imágenes); en dominios visuales muy distintos puede degradarse sin aviso.
- Riesgo de alucinación estructural: al ser un clasificador, no puede "admitir que no sabe"; siempre devuelve una distribución, y esa distribución puede ser errónea con alta confianza.
- Sesgos no documentados: no se publica análisis de sesgos demográficos, culturales ni de otro tipo en la información disponible.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B y del dataset OmniJev/OneJev-Data antes de un despliegue en producción.
- El nombre comercial "0.8B" no coincide con el recuento real de parámetros (1,1 B); dimensionar el hardware con la cifra real.
- La tabla de resultados se publica como imagen y no como datos tabulares, lo que dificulta la verificación independiente de las cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev-0.8B
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Modelo OneJev-4B: https://huggingface.co/OmniJev/OneJev-4B
- Modelo OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- Modelo OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- Modelo OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
- Dataset OneJev-Data: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Build GGUF de mradermacher: https://huggingface.co/mradermacher/OneJev-0.8B-GGUF
- Demo en Spaces: https://huggingface.co/spaces/BradNLP/OneJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Servidor Flide: https://github.com/OmniJev/Flide
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
