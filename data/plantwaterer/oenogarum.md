# plantwaterer/oenogarum

## Resumen

oenogarum es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-31B-it, desarrollado por el usuario plantwaterer y publicado en Hugging Face bajo licencia Apache 2.0. Su particularidad es que no está pensado para generar texto libre, sino para responder preguntas de decisión de tipo multiple-choice devolviendo una probabilidad calibrada para cada opción. Para ello incorpora una cabeza de última capa específica (`vbll_head.safetensors`) que transforma los logits de las letras de las opciones en distribuciones de probabilidad.

El modelo conserva la arquitectura base de Gemma 4 en su variante de 31B parámetros (31.273.088.876 parámetros reales según los pesos safetensors), con atención completa en algunas capas y atención de ventana deslizante causal de 1.024 tokens en otras. La innovación principal no está en la arquitectura sino en el procedimiento de inferencia: motores de decisión que aplican promediado de orden de opciones, calibración de temperatura y una corrección bayesiana para preguntas de sí/no.

Es relevante porque aborda un nicho poco cubierto: modelos que emiten decisiones calibradas y auditables en lugar de texto generativo, algo útil en sistemas de decisión automatizada donde se necesita una distribución de probabilidad sobre alternativas discretas y no una respuesta en lenguaje natural. La fecha de creación del repositorio es el 25 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Gemma 4, con capas de atención completa y capas de atención de ventana deslizante causal (ventana 1.024) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la ventana deslizante es de 1.024 tokens; el contexto total no se especifica) |
| Tipos de cuantizacion | no disponible (los pesos se sirven en bf16 para inferencia según el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal de 31B parámetros. La modificación respecto al base consiste en un ajuste fino orientado a tareas de decisión multiple-choice, acompañado de una cabeza de última capa calibrada (`vbll_head.safetensors` y su configuración `vbll_head.json`). La cabeza opera en float64 sobre CPU y recibe el estado oculto final junto con los logits de las letras de las opciones en float32, aplicando el soft-cap de logits del modelo base.

El mecanismo de decisión es diferenciado según el tipo de pregunta. Para preguntas de elección ordinaria, la salida es el softmax de los logits de las letras en la posición de respuesta dividido por una temperatura ajustada (T = 1.080), sin intervención de posterior bayesiano. Para preguntas de sí/no, se aplica un residual bayesiano de última capa sobre el estado oculto (un posterior de Laplace integrado) que ajusta los dos logits. Además, el modelo requiere una función de atención específica (`jev_mem` en `fullft_mem.py`) que hace que en las capas de atención completa cada token del prompt atienda a todos los tokens del mismo prompt, mientras que las capas de ventana deslizante permanecen causales. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de decisión multiple-choice con una probabilidad calibrada por opción (hasta 52 opciones, letradas A-Z y a-z).
- Preguntas de sí/no con corrección bayesiana sobre los logits.
- Procesamiento de entradas multimodales de imagen y texto, heredado del modelo base Gemma 4 (etiqueta image-text-to-text).
- Promediado de orden de opciones (order averaging) para solicitudes cuya longitud L sea menor o igual a 939, con cuatro órdenes de opciones y agregación con pesos iguales.
- Calibración de temperatura (T = 1.080) y renormalización con exponente 0.95438 en el promediado.
- Soporte de chat template del modelo base para la construcción de prompts.
- Motores de inferencia específicos: `LenAvgBayesEngine`, `LenAvgEngine`, `DikitEngine`, entre otros.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Sistemas de decisión automatizada con alternativas discretas: el modelo devuelve una distribución de probabilidad sobre opciones predefinidas, lo que permite umbrales de confianza y auditoría de decisiones en lugar de texto libre.
- Evaluación de riesgo y elección de acciones en entornos con criterios explícitos: por ejemplo, decidir entre "jugar", "mover a interior" o "posponer" un evento según una previsión meteorológica, tal como ilustra el ejemplo de la model card.
- Clasificación con opciones largas y múltiples alternativas: al soportar hasta 52 opciones y promediar el orden de presentación, es adecuado para tareas donde el orden de las opciones podría sesgar la respuesta.
- Preguntas de verificación binaria (sí/no) con calibración bayesiana: útil en pipelines donde se necesita una probabilidad ajustada de que una condición se cumpla.
- Investigación sobre calibración y robustez al orden de opciones: los motores de promediado y la cabeza calibrada permiten estudiar sesgos posicionales en modelos de decisión.
- Integración en flujos de decisión asistida por imagen y texto: al heredar la naturaleza multimodal de Gemma 4, puede emplearse en escenarios donde la decisión depende de una imagen junto con instrucciones textuales.
- Despliegue en entornos de investigación con requisitos de reproducibilidad: los motores y la cabeza se distribuyen junto con los pesos, y el procedimiento de inferencia está documentado de forma explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31.273.088.876 parámetros en bf16, se requieren aproximadamente 62,5 GB solo para los pesos, a los que hay que sumar el estado de activaciones y caché. El tamaño del repositorio es de 62,6 GB.
- GPU recomendadas: por el volumen de pesos en bf16, se necesitan GPU con al menos 80 GB de memoria, como A100 80GB o H100 80GB. No cabe en GPUs de consumo como RTX 4090 (24 GB) en bf16 sin cuantización, y no se documentan pesos cuantizados.
- La cabeza (`vbll_head`) se ejecuta en CPU en float64, por lo que no consume VRAM adicional significativa.
- Opciones de despliegue: el modelo se sirve mediante los motores del kit Decision Index (`decision_index run --engine ...`), que se instala desde el repositorio de GitHub. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y de hecho la atención personalizada `jev_mem` requiere PyTorch SDPA con kernels memory-efficient o flash, lo que limita los motores compatibles.
- Latencia y throughput: no disponibles. El motor `LenAvgBayesEngine` realiza hasta cuatro pasadas por pregunta cuando la longitud de la solicitud es menor o igual a 939, lo que multiplica el coste computacional respecto a una única pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oenogarum | 31.273.088.876 | no disponible | Probabilidades calibradas por opción | apache-2.0 | Hugging Face (pesos) y GitHub (código) |
| google/gemma-4-31B-it | 31B (aproximado, según nombre) | no disponible | Texto generativo | no disponible en esta ficha | Hugging Face |
| Alternativas de decisión multiple-choice de propósito general | no disponible | no disponible | Texto o logits sin calibración específica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo no debe usarse como generador de texto libre: su salida útil es la cabeza calibrada, y los logits de las letras por sí solos no constituyen la respuesta del modelo.
- La atención estándar de transformers produce respuestas distintas; es obligatorio servir el modelo con la función `jev_mem` y el motor rechaza cualquier otra atención, lo que restringe la portabilidad a otros stacks de inferencia.
- El promediado de orden de opciones solo se aplica cuando la longitud L de la solicitud es menor o igual a 939; por encima de ese umbral se usa una única pasada, con posible mayor sensibilidad al orden de las opciones.
- La corrección bayesiana para preguntas de sí/no añade complejidad y depende de un posterior de Laplace cuya calibración no está validada de forma independiente en la información disponible.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al ser un fine-tune de un modelo base multimodal, hereda los sesgos y riesgos del modelo original.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 4 puede tener términos de uso adicionales que conviene verificar antes de un despliegue comercial.
- El repositorio tiene muy poca tracción (204 descargas, 0 likes) y fue creado recientemente, por lo que no hay validación comunitaria extensa ni resultados de benchmarks publicados.
- El tamaño en bf16 (unos 62,5 GB) impide su despliegue en GPUs de consumo sin cuantización, y no se ofrecen pesos cuantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/oenogarum
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código (espejo GitHub): https://github.com/treewaterer/oenogarum
- Kit Decision Index: https://github.com/apolinario/decision-index
