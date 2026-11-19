# CBA-Research/GameScaling-27B-S3-FP8

## Resumen

GameScaling-27B-S3-FP8 es una versión cuantizada en FP8 del modelo GameScaling-27B-S3, un modelo de 27.356 millones de parámetros derivado de Qwen/Qwen3.5-27B mediante continued pre-training para agentes encarnados en entornos de videojuego. El trabajo original lo firma un equipo conjunto de miHoYo (Honkai AI R&D Team), la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, NUS y la Universidad de Pekín, bajo el título "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds" (arXiv:2610.28698).

El checkpoint subido a Hugging Face bajo el identificador CBA-Research/GameScaling-27B-S3-FP8 no ha sido entrenado por CBA-Research: se trata de una re-subida comunitaria de una conversión FP8 del modelo original, motivada por la ausencia de un checkpoint oficial ya cuantizado. La model card indica explícitamente que todo el crédito corresponde a los autores originales y que no existe afiliación con ellos.

El modelo está orientado a interacción multimodal imagen-texto para agentes que operan videojuegos mediante teclado y ratón, con soporte de conversación multi-turno y un pipeline declarado `image-text-to-text`. La licencia Apache 2.0 y el formato `compressed-tensors` lo hacen utilizable tanto en investigación como en despliegues comerciales, siempre respetando las condiciones heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), derivada de Qwen3.5-27B; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | No disponible (no se declara MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (checkpoint cuantizado con `compressed-tensors`); otras variantes no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (cuantización FP8 vía `compressed-tensors`); librería `transformers` |

## Arquitectura y entrenamiento

El modelo es un fine-tune por continued pre-training de Qwen/Qwen3.5-27B, un transformer multimodal de aproximadamente 27,36 mil millones de parámetros que procesa entradas de imagen y texto. La etapa S3 corresponde a la fase de continued pre-training descrita en el paper "Scaling in Games", orientada a agentes encarnados que operan en diversos mundos virtuales mediante control de teclado y ratón. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del corpus ni de si se aplicaron etapas de RLHF o DPO.

La innovación principal documentada por los autores es el uso de datos de videojuegos y entornos virtuales diversos para el pre-entrenamiento continuado de un agente encarnado, combinando percepción visual y acciones de bajo nivel (teclado y ratón). Esta versión concreta es una conversión FP8 del checkpoint S3, realizada por terceros para reducir el espacio en disco y el coste de inferencia; no introduce cambios arquitectónicos respecto al original.

## Capacidades

- Comprensión conjunta de imágenes y texto (pipeline `image-text-to-text`).
- Generación de acciones de agente encarnado en videojuegos mediante teclado y ratón.
- Razonamiento multi-paso orientado a objetivos dentro de entornos virtuales.
- Conversación multi-turno con contexto textual e imágenes.
- Control de agente en mundos virtuales diversos (entrenamiento específico para esta tarea).
- Capacidades generales heredadas de Qwen3.5-27B (generación de texto, razonamiento y código) presumiblemente conservadas, aunque no se documentan explícitamente en la información disponible.
- Soporte multilingüe limitado al inglés según la model card.

## Casos de uso

- Investigación en agentes encarnados: el modelo sirve como checkpoint de referencia para experimentos que requieren un agente multimodal capaz de mapear observaciones visuales de un videojuego a acciones de teclado y ratón, evitando al equipo tener que convertir el modelo a FP8 por su cuenta.
- Evaluación comparativa de políticas de agente: al ser un S3 de 27B, permite medir el efecto del escalado de tamaño frente a las variantes 0.8B, 2B y 9B del mismo proyecto en tareas de control en mundos virtuales.
- Benchmarking de robustez visual-acción: útil para probar cómo un modelo grande generaliza a entornos de juego no vistos durante el pre-entrenamiento continuado.
- Reproducción de resultados del paper: al existir checkpoints oficiales S1 y S3 en varios tamaños, este FP8 facilita reproducir experimentos con menor huella de memoria en GPUs de gama alta.
- Prototipado de pipelines de inferencia FP8: permite validar integraciones con `compressed-tensors` y `transformers` antes de desplegar versiones sin cuantizar.
- Desarrollo de herramientas de automatización de gameplay: base para construir agentes que interpretan frames de juego y emiten comandos de teclado/ratón en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 27-28 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda reservar 32-40 GB según longitud de contexto.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para FP8 nativo; GPUs con soporte FP8 (Ada Lovelace y Hopper) maximizan el rendimiento.
- En GPU consumer: una RTX 4090 (24 GB) no aloja los pesos FP8 completos sin offloading a CPU o sharding; cabría en configuraciones multi-GPU o con descarga parcial de capas.
- Opciones de despliegue: `transformers` con `compressed-tensors`, vLLM (soporte FP8 en Hopper/Ada), TGI y frameworks compatibles con checkpoints FP8; llama.cpp/Ollama requerirían conversión adicional a GGUF, no disponible en el repo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-27B-S3-FP8 (este) | 27,36B | No disponible | Imagen-texto, agente de juego | Apache 2.0 | HF, FP8 |
| GameScaling-9B-S3 | ~9B | No disponible | Imagen-texto, agente de juego | Apache 2.0 (según repo original) | HF, pesos originales |
| GameScaling-2B-S3 | ~2B | No disponible | Imagen-texto, agente de juego | Apache 2.0 (según repo original) | HF, pesos originales |
| Qwen/Qwen3.5-27B (base) | 27,36B | No disponible | Imagen-texto | No disponible en esta información | HF |

## Limitaciones y advertencias

- Checkpoint no oficial: es una re-subida comunitaria de una conversión FP8; no lo ha validado el equipo original, por lo que pueden existir diferencias de calidad respecto al checkpoint S3 original.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Dominio especializado: el continued pre-training está orientado a agentes en videojuegos; su comportamiento fuera de ese dominio puede degradarse respecto a Qwen3.5-27B original.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que complica planificar despliegues con ventanas largas.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni tasas de alucinación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-27B antes de producción.
- Cuantización FP8: puede introducir pérdida de precisión respecto a BF16; no se documenta ninguna evaluación comparativa FP8 vs BF16.
- Repo de 35,9 GB y 0 descargas/0 likes en el momento de la consulta: escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/CBA-Research/GameScaling-27B-S3-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Daily Paper en HF: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Checkpoints originales: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1, https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3, https://huggingface.co/THUSI-Lab/GameScaling-2B-S1, https://huggingface.co/THUSI-Lab/GameScaling-2B-S3, https://huggingface.co/THUSI-Lab/GameScaling-9B-S1, https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
