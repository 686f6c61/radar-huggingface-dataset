# 12kimih/Qwen3.5-4B-MBT-I

## Resumen

Qwen3.5-4B-MBT-I es un ajuste fino (fine-tune) supervisado de Qwen3.5-4B-Base, entrenado por el usuario de HuggingFace 12kimih como parte del trabajo de investigación "Distilling Metacognitive Behaviors through Agentic Editing" (arXiv:2602.22508). El modelo se entrena sobre trazas de razonamiento de un modelo profesor que han sido editadas mediante MBT-I, un editor agéntico que, en una única llamada, devuelve los pasajes a insertar en marcadores de párrafo. El objetivo es destilar comportamientos metacognitivos (autorreflexión, planificación y verificación durante el razonamiento) en un modelo pequeño.

Es relevante porque aborda una pregunta abierta en destilación de razonamiento: cómo editar las trazas del profesor para que el alumno aprenda comportamientos metacognitivos sin degradar la calidad de la respuesta. La familia MBT incluye variantes comparables (Unedited-SFT, MBT-R con reescritura, MBT-A agéntica), lo que permite estudiar el efecto de cada estrategia de edición. El modelo conserva la arquitectura y el tamaño del base (unos 4,54 mil millones de parámetros, en bf16) y hereda su capacidad multimodal image-text-to-text, aunque el entrenamiento se centra en razonamiento y matemáticas en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible detalle adicional |
| Parámetros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 131.072 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Inglés (entrenamiento); el base Qwen3.5 probablemente soporta más, pero no consta |
| Licencia | Apache-2.0 (datos de entrenamiento: CC BY-SA 4.0) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos (full-parameter SFT) sobre Qwen/Qwen3.5-4B-Base, con la pérdida calculada solo sobre los tokens del asistente. Se entrenó durante 15 épocas con el optimizador Muon (implementación de Megatron), learning rate 1e-5, weight decay 0 y schedule constante con 40 pasos de warmup. El batch global fue de 64 secuencias (8 GPU con 8 pasos de acumulación), usando padding-free packing y una longitud máxima de 131.072 tokens, con precisión bf16 autocast y pesos maestros en fp32.

La innovación principal no es arquitectónica sino de datos: las trazas de entrenamiento proceden del dataset `12kimih/mbt-traces` y fueron editadas por MBT-I, un editor agéntico que inserta pasajes metacognitivos en marcadores de párrafo de las trazas del profesor en una sola llamada. La hipótesis del trabajo es que este tipo de edición destila comportamientos metacognitivos (planificación, autoevaluación, revisión) de forma más efectiva que usar las trazas sin editar o con reescritura completa (variante MBT-R). No se menciona RLHF ni DPO: el entrenamiento es puramente supervisado.

## Capacidades

- Generación de texto conversacional con plantilla de chat que abre un bloque `<think>`: el modelo produce primero el razonamiento y después la respuesta tras `</think>`.
- Razonamiento paso a paso (chain-of-thought) en matemáticas, siguiendo la instrucción de entrenamiento de poner la respuesta final en `\boxed{}`.
- Comportamientos metacognitivos destilados: el modelo tiende a planificar, reflexionar y verificar durante la generación, herencia de las trazas editadas.
- Contexto largo: entrenado con secuencias de hasta 131.072 tokens; las respuestas suelen ser largas, por lo que conviene dejar margen para decenas de miles de tokens.
- Etiquetado como image-text-to-text (heredado del base Qwen3.5), aunque la model card no documenta capacidades visuales entrenadas para este fine-tune.
- No se documenta soporte de tool calling ni de agentes en la model card.

## Casos de uso

- Resolución de problemas matemáticos: el modelo está optimizado para razonar paso a paso y entregar respuestas en formato `\boxed{}`, útil en pipelines de evaluación de matemáticas (estilo GSM8K, MATH).
- Investigación en destilación de razonamiento: al formar parte de una familia de cuatro variantes (Unedited-SFT, MBT-R, MBT-I, MBT-A), permite experimentos controlados sobre el efecto de la edición de trazas.
- Estudio de comportamientos metacognitivos: las trazas generadas pueden analizarse para medir cuánta planificación, verificación o autorrevisión produce el modelo frente al SFT sin editar.
- Prototipado de asistentes de razonamiento en local: con unos 4,5B de parámetros en bf16, es viable en GPU de consumo para experimentación con razonamiento extenso.
- Generación de datos sintéticos de razonamiento: sus salidas con bloque `<think>` pueden usarse como trazas para entrenar o evaluar otros modelos pequeños.
- Pruebas de contexto largo: entrenado con secuencias de hasta 131k tokens, sirve para evaluar cómo los modelos pequeños aprovechan ventanas contextuales amplias en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper "Distilling Metacognitive Behaviors through Agentic Editing" (arXiv:2602.22508) para los resultados comparativos entre las variantes MBT.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para los pesos (el repo ocupa 9,1 GB); con KV cache para respuestas muy largas (el ejemplo usa `max_tokens=122880`), se recomienda disponer de 24 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB) para inferencia con respuestas largas; A100 o H100 para servido con concurrencia o contextos cercanos a 131k tokens.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en bf16; con cuantización (no publicada oficialmente, pero factible vía GGUF/AWQ por terceros) podría caber en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM (el ejemplo oficial de la model card usa `vllm.LLM`); al ser compatible con transformers y safetensors, debería funcionar también con TGI, llama.cpp (requeriría conversión a GGUF) y Ollama (conversión necesaria).
- Latencia y throughput: no disponible. La model card advierte que las respuestas largas son frecuentes, por lo que la latencia por respuesta puede ser alta y conviene ajustar `max_tokens` con criterio.
- Parámetros de muestreo sugeridos por el autor: temperature 1.0, top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-MBT-I | 4,54B | 131.072 (entrenamiento) | Trazas editadas con MBT-I (inserción) | Apache-2.0 | HuggingFace, safetensors bf16 |
| Qwen3.5-4B-Unedited-SFT | no disponible | no disponible | Trazas del profesor sin editar | no disponible | HuggingFace (12kimih) |
| Qwen3.5-4B-MBT-R | no disponible | no disponible | Trazas editadas con reescritura (MBT-R) | no disponible | HuggingFace (12kimih) |
| Qwen3.5-4B-MBT-A | no disponible | no disponible | Trazas editadas de forma agéntica (MBT-A) | no disponible | HuggingFace (12kimih) |

Las variantes MBT-R, MBT-I y MBT-A constituyen el conjunto de comparación natural del paper: comparten base, método de entrenamiento e hiperparámetros, variando solo la estrategia de edición de las trazas.

## Limitaciones y advertencias

- Entrenado solo en inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Especializado en razonamiento y matemáticas: fuera de ese dominio puede mostrar degradación respecto al modelo base o a modelos chat generales, efecto típico del SFT intensivo en un dominio (catastrophic forgetting parcial).
- Riesgo de alucinación: no disponible datos específicos, pero al ser un modelo de razonamiento destilado, las cadenas largas de pensamiento pueden contener pasos incorrectos presentados con apariencia de rigor.
- Respuestas muy largas: el propio autor advierte que las respuestas largas son habituales; hay que reservar decenas de miles de tokens de salida, lo que aumenta coste y latencia.
- Restricciones de licencia: los pesos son Apache-2.0 (uso comercial permitido), pero los datos de entrenamiento son CC BY-SA 4.0, lo que implica atribución y share-alike en derivados de los datos; conviene revisar la dataset card.
- Sesgos conocidos: no disponible.
- Las capacidades visuales heredadas del pipeline image-text-to-text no están documentadas para este fine-tune; no asumir que funcionan sin verificación.
- Modelo de investigación con pocas descargas (463) y sin comunidad de validación: probarlo a fondo antes de cualquier uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-I
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de trazas: https://huggingface.co/datasets/12kimih/mbt-traces
- Código y prompts (GitHub): https://github.com/12kimih/metacognitive-behavioral-tuning
- Paper (arXiv): https://arxiv.org/abs/2602.22508
- Variante Unedited-SFT: https://huggingface.co/12kimih/Qwen3.5-4B-Unedited-SFT
- Variante MBT-R: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-R
- Variante MBT-A: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-A
