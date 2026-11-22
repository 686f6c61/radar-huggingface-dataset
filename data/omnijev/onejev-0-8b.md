# OmniJev/OneJev-0.8B

## Resumen

OneJev-0.8B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev, un fine-tune completo de Qwen/Qwen3.5-0.8B (1.107.265.600 parámetros reales según safetensors). A diferencia de un LLM generativo convencional, el modelo recibe un estado (texto, captura de pantalla, foto o vídeo) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está diseñado como componente de decisión para agentes, no como generador de texto libre.

El modelo se entrenó sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes, y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia actual radica en la latencia: en una H200 con una captura de 1280x720 responde una pregunta en 31 ms y diez preguntas en una sola petición en 51 ms (5,1 ms por pregunta), lo que lo hace apto para bucles de control de agentes en tiempo real.

La familia OneJev cubre varios tamaños (0.8B, 4B, 9B, 27B y una variante 27B-FP8), todos basados en la familia Qwen3.5/Qwen3.8. El modelo se sirve mediante el paquete `qev`, que implementa la System One API de TypeSafe con un campo adicional `media` para imágenes y vídeo, y también dispone de una build GGUF para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen3.5-0.8B), etiqueta `qwen3_5` |
| Parametros totales | 1.107.265.600 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16/BF16 (pesos originales, 2,2 GB); GGUF Q8_0 disponible via mradermacher; FP8 solo en la variante 27B |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (build de terceros) |

## Arquitectura y entrenamiento

OneJev-0.8B es un fine-tune completo (full fine-tune) del modelo base Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5. La innovación principal no está en la arquitectura del backbone, sino en la cabeza de decisión: el modelo no genera texto token a token, sino que produce probabilidades calibradas para un conjunto de preguntas y opciones tipadas (`Choice`, `Noul`) definidas por el llamador. Esto convierte la inferencia en un único forward pass en lugar de una decodificación autorregresiva.

El entrenamiento se realizó sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes (dataset OmniJev/OneJev-Data). No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona un conjunto de test con "preguntas de los tipos de entrenamiento que ningún modelo vio en entrenamiento", lo que sugiere una separación por tipo de tarea más que por instancia.

## Capacidades

- Decisión multimodal calibrada: devuelve una probabilidad por opción para preguntas de tipo binario (`Noul`) o de elección múltiple (`Choice`) a partir de texto, imagen, captura de pantalla o vídeo.
- Entrada de imagen y vídeo: pipeline `image-text-to-text`, con soporte de vídeo en el servidor PyTorch (no en la build GGUF).
- Agente de GUI: orientado a decidir la siguiente acción de un agente sobre una pantalla (por ejemplo, `click` frente a `stop`).
- Razonamiento de estado de tareas: evalúa condiciones tipo "la factura ha sido pagada" sobre el estado actual del entorno.
- Procesamiento por lotes de preguntas: múltiples preguntas en una sola petición (10 preguntas en 51 ms en H200).
- Integración mediante API: servidor compatible con la System One API de TypeSafe más un campo `media`.
- No se documentan en la información disponible capacidades de generación de texto libre, tool calling genérico, matemáticas o thinking mode.

## Casos de uso

- Control de agentes de GUI en tiempo real: el modelo recibe la captura de pantalla actual y decide la siguiente acción (clic, escritura, parada) con latencia de milisegundos, adecuado para bucles de control donde un LLM generativo sería demasiado lento.
- Verificación de condiciones de finalización: comprobar si una tarea se ha completado (por ejemplo, "la factura ha sido pagada") antes de cerrar un flujo de agente, usando la salida probabilística como señal de confianza.
- Enrutamiento y clasificación multimodal: decidir entre varias rutas de procesamiento a partir de una imagen o fotograma de vídeo, aprovechando la calibración de probabilidades para umbralizar decisiones.
- Moderación y triaje de contenido visual: clasificar imágenes o vídeos según criterios definidos por el operador, con probabilidades que permiten ajustar el umbral de sensibilidad.
- Automatización de QA visual: responder preguntas binarias o de elección sobre capturas de aplicaciones en pipelines de pruebas end-to-end, detectando regresiones visuales.
- Asistencia a operadores humanos: sugerir la siguiente acción en herramientas internas mostrando probabilidades por opción, de modo que el operador pueda aceptar o corregir la recomendación.
- Despliegue en entornos con recursos limitados: al ocupar 2,2 GB en FP16 y disponer de GGUF Q8_0, puede ejecutarse en CPU o en GPU de consumo para tareas de decisión de baja latencia.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados (imagen `assets/results.svg`) que compara OneJev-0.8B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, con precisión en porcentaje sobre el test set de OneJev. Los valores numéricos concretos no están disponibles en la información textual proporcionada, por lo que no se reproducen aquí.

| Metrica | Valor |
|---|---|
| Precision en test set OneJev | no disponible (solo figura como imagen en la model card) |
| Latencia, 1 pregunta (H200, captura 1280x720) | 31 ms |
| Latencia, 10 preguntas en una peticion (H200) | 51 ms (5,1 ms por pregunta) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,2 GB en FP16/BF16 para los pesos; con overhead de activaciones y contexto, se recomienda al menos 4-6 GB de VRAM para inferencia cómoda.
- GPU recomendadas: H200 (medición oficial de latencia), A100, H100 para despliegues de alta concurrencia; cualquier GPU con 6 GB o más para uso individual.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en GPUs con 8 GB en FP16 ajustando el lote.
- CPU: la build GGUF Q8_0 de mradermacher permite ejecución en CPU mediante llama.cpp sin PyTorch.
- Opciones de despliegue: servidor `qev serve` (PyTorch, con soporte de vídeo), llama.cpp con GGUF (imágenes sí, vídeo no), integración con transformers.
- Latencia y throughput: 31 ms por pregunta individual y 5,1 ms por pregunta en lotes de 10 sobre H200 con captura 1280x720; no se han publicado cifras para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev-0.8B | 1,1B | Qwen3.5-0.8B | no disponible | Apache 2.0 | HF, GGUF, demo |
| OneJev-4B | no disponible | Qwen3.5-4B | no disponible | Apache 2.0 (segun familia) | HF |
| OneJev-9B | no disponible | Qwen3.5-9B | no disponible | Apache 2.0 (segun familia) | HF |
| OneJev-27B | no disponible | Qwen3.8-27B | no disponible | Apache 2.0 (segun familia) | HF, FP8 |
| Jev 1.13 | no disponible | no disponible | no disponible | no disponible | solo texto |
| Jev-Omni 12B | 12B (aproximado por nombre) | no disponible | no disponible | no disponible | no disponible |

La comparación de rendimiento entre estos modelos figura únicamente en la tabla gráfica de la model card; los valores numéricos no están disponibles en el texto proporcionado.

## Limitaciones y advertencias

- El modelo está diseñado para responder preguntas tipadas con probabilidades, no para generar texto libre; usarlo como LLM conversacional produciría resultados fuera de su dominio de entrenamiento.
- No se documentan los idiomas soportados; la cobertura multilingüe es desconocida y no debe asumirse.
- La longitud de contexto no está especificada, lo que impide planificar con precisión el tamaño máximo de estado o número de preguntas por petición.
- Las probabilidades calibradas pueden degradarse fuera de la distribución de entrenamiento (tipos de pregunta o dominios visuales no vistos); la model card solo garantiza evaluación sobre tipos de entrenamiento.
- No se han publicado datos sobre sesgos, tasas de alucinación o robustez ante imágenes adversarias.
- El soporte de vídeo requiere el servidor PyTorch; la build GGUF solo admite imágenes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por si impone condiciones adicionales.
- El ecosistema `qev` es joven y poco extendido; la dependencia de la System One API de TypeSafe puede limitar la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev-0.8B
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Demo (Gradio): https://huggingface.co/spaces/BradNLP/OneJev
- Build GGUF: https://huggingface.co/mradermacher/OneJev-0.8B-GGUF
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- OneJev-4B: https://huggingface.co/OmniJev/OneJev-4B
- OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
