# OmniJev/OneJev1.6-4B

## Resumen

OneJev1.6-4B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. No es un modelo generativo al uso: recibe una captura de pantalla, una foto, un vídeo o texto plano junto con varias preguntas tipadas y devuelve, en un único paso de inferencia (forward pass), una probabilidad calibrada para cada una de las opciones posibles. Está construido como un fine-tune completo de Qwen/Qwen3.5-4B, del que hereda la arquitectura transformer y el tokenizador.

El modelo resuelve un problema concreto en el ámbito de los agentes autónomos: en lugar de generar texto libre, proporciona señales de decisión cuantificadas (probabilidad de "sí/no", distribución sobre opciones discretas y puntuaciones esperadas en escalas). Esto lo hace adecuado para controlar agentes de interfaz gráfica (GUI agents), evaluar progreso de tareas y calibrar decisiones en pipelines automatizados.

Con 4.539.265.536 parámetros totales y un tamaño de repositorio de 9,1 GB, se posiciona como una alternativa compacta frente a modelos de decisión de mayor tamaño. Según la model card, obtiene 62,01 en la parte pública de Decision Index 0.3, una mejora respecto a los 54,89 de la versión 1.5, y supera a 42 de los 57 modelos de 25B a 36B parámetros del citado tablero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OneJev1.6-4B es un fine-tune completo (full fine-tune) del modelo Qwen/Qwen3.5-4B, por lo que conserva la arquitectura transformer multimodal del modelo base, con capacidad de procesar entradas de imagen, vídeo y texto. El pipeline declarado en Hugging Face es `image-text-to-text`. La innovación principal no reside en la arquitectura del backbone, sino en la formulación de la tarea: el modelo se entrena para emitir probabilidades calibradas sobre preguntas tipadas (tipo `noul` para sí/no, tipo `choice` para elección entre opciones con criterios y tipo `score` para escalas graduadas) en un solo forward pass.

El entrenamiento se realizó sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. La model card no detalla el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El sistema de servicio asociado, Flide, implementa la System One API de TypeSafe con un campo adicional `media` para imágenes y vídeo, y está documentado en el paper arXiv:2610.42148.

## Capacidades

- Decisión multimodal: procesa capturas de pantalla, fotos, vídeos y texto plano como estado de entrada.
- Salida de probabilidades calibradas: devuelve una probabilidad por opción en lugar de texto generado.
- Preguntas tipadas: soporta preguntas de tipo `noul` (probabilidad de sí), `choice` (distribución sobre opciones con criterios) y `score` (nivel esperado en una escala).
- Evaluación de progreso de tareas: puede estimar en qué punto de una tarea se encuentra un agente.
- Soporte para agentes GUI: orientado a decidir la siguiente acción (clic, escritura, scroll, parada) sobre una interfaz.
- Procesamiento de vídeo: acepta vídeo como modalidad de entrada además de imagen y texto.
- Integración con API: compatible con endpoints mediante Flide y la System One API.

## Casos de uso

- Control de agentes de interfaz gráfica: dado un screenshot del estado actual y la tarea pendiente, el modelo devuelve la probabilidad de cada acción posible (clic, escribir, scroll, parar), lo que permite seleccionar la acción más probable con un umbral de confianza configurable.
- Automatización de flujos de pago o facturación: con la tarea "pagar la factura abierta de ACME" y una captura de pantalla, el modelo estima la probabilidad de que la tarea esté completada y el progreso alcanzado, útil para verificar pasos críticos antes de confirmar operaciones.
- Verificación de finalización de tareas: la pregunta de tipo `noul` permite comprobar de forma probabilística si una condición se ha cumplido, integrándose en bucles de agente como criterio de parada.
- Evaluación de progreso en pipelines multi-paso: la pregunta de tipo `score` devuelve el nivel esperado dentro de una escala definida, lo que facilita la monitorización de tareas largas y la detección de bloqueos.
- Análisis de vídeo para decisión: al aceptar vídeo como entrada, puede emplearse para evaluar estados dinámicos y decidir la siguiente acción en entornos donde una sola imagen no captura el contexto.
- Enrutamiento y triaje con calibración: al devolver distribuciones de probabilidad sobre opciones discretas, puede usarse como componente de decisión en sistemas de clasificación o enrutamiento donde se requiere una medida de confianza explícita en lugar de una etiqueta generada.
- Evaluación comparativa de agentes: sirve como juez probabilístico en la evaluación de trayectorias de agentes, puntuando el progreso y la finalización de tareas de forma reproducible.

## Benchmarks y rendimiento

La model card incluye resultados en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones, ejecutados y puntuados con el kit del propio tablero). Los datos disponibles son los siguientes:

| Modelo | Parametros | Decision Index (parte publica) |
|---|---|---|
| OneJev1.6-4B | 4,5B | 62,01 |
| Perplexity Decider Flash v1.2 | 4B | 60,06 |
| CoCo-Decision-4B 2.3.0 | 4B | 55,38 |
| vLLM-SR d3-mini | 4B | 54,90 |
| RSI-Jev v6.1 VL | 4B | 50,98 |
| OneJev1.5-4B | 4B | 54,89 |

Según la model card, OneJev1.6-4B obtiene la mejor puntuación en cuatro de las cinco áreas entre los cinco modelos comparados y la segunda mejor en Comprensión del Lenguaje. Asimismo, supera a 42 de los 57 modelos de 25B a 36B parámetros del tablero. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,1 GB en safetensors, por lo que en precisión completa (fp16/bf16) se requiere aproximadamente 9-10 GB de VRAM solo para pesos, más memoria para activaciones y contexto. No se dispone de datos oficiales de cuantización.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100, H100) sería suficiente para inferencia en bf16, aunque no hay confirmación oficial.
- GPU de consumo: cabe en GPUs de consumo con 16 GB o más de VRAM en bf16; en GPUs de 8-12 GB requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: Flide (`flide serve --model OmniJev/OneJev1.6-4B`), que expone la System One API con campo `media`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index (parte publica) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-4B | 4,5B | no disponible | 62,01 | Apache 2.0 | Hugging Face |
| Perplexity Decider Flash v1.2 | 4B | no disponible | 60,06 | no disponible | no disponible |
| CoCo-Decision-4B 2.3.0 | 4B | no disponible | 55,38 | no disponible | no disponible |
| vLLM-SR d3-mini | 4B | no disponible | 54,90 | no disponible | no disponible |
| RSI-Jev v6.1 VL | 4B | no disponible | 50,98 | no disponible | no disponible |

Los cuatro modelos comparables son, según la model card, los de mayor puntuación del tablero en el rango de 3B a 6B parámetros. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para emitir probabilidades de decisión, no para generación de texto libre; usarlo como modelo conversacional general no es su propósito.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento: las probabilidades pueden no ser fiables ante estados, tareas o interfaces no representadas en los datos de entrenamiento (ejecuciones reales de agentes, vídeos, imágenes y datasets públicos de decisión).
- No se documentan los idiomas soportados, por lo que no puede garantizarse un rendimiento multilingüe más allá del que herede del modelo base Qwen/Qwen3.5-4B.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de casos de uso con estados muy largos o vídeos extensos.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Los resultados de Decision Index corresponden a la parte pública del tablero y a la fecha del 16 de octubre de 2026; las comparaciones con otros modelos pueden variar con actualizaciones del tablero.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B puede tener condiciones adicionales que conviene verificar antes de desplegar en producción.
- El despliegue documentado depende de Flide; no se confirman otros runners, lo que puede limitar la portabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-4B
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Repositorio de Flide: https://github.com/OmniJev/Flide
- Decision Index 0.3 (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
