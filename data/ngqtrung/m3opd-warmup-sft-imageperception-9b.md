# ngqtrung/M3OPD-Warmup-SFT-ImagePerception-9B

## Resumen

M3OPD-Warmup-SFT-ImagePerception-9B es un ajuste fino de Qwen3.5-9B desarrollado por el usuario ngqtrung como parte de la receta experimental del paper M3OPD-Reasoner. Se trata de un modelo multimodal image-text-to-text de 9.409.813.744 parámetros (9,4 mil millones) cuyo propósito específico es servir como etapa de calentamiento (warm-up) mediante SFT de parámetros completos sobre el subconjunto de percepción de imágenes del dataset M3OPD-SFT-1.35M. El checkpoint publicado corresponde al paso 655 del entrenamiento SFT.

La relevancia de este modelo es metodológica más que de producto final: según la model card, el modelo resultante se utiliza como punto de partida para aplicar GSPO (una variante de optimización por política) y obtener así el profesor de calentamiento del dominio de percepción visual (M3OPD-Warmup-Teacher-*-9B). La receta principal del paper, sin embargo, prescinde de esta fase SFT, por lo que este checkpoint debe entenderse como un artefacto intermedio de un pipeline de destilación on-policy y aprendizaje por refuerzo, no como un modelo listo para producción.

Al conservar la arquitectura, tokenizador, procesador y plantilla de chat de Qwen3.5-9B, el modelo es desplegable en los mismos entornos que su base (Transformers, vLLM, SGLang). La licencia es Apache 2.0, heredada de Qwen3.5-9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B); no se detalla en la información disponible |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y conserva íntegramente su arquitectura, tokenizador, procesador y plantilla de chat. Se trata de un ajuste fino supervisado (SFT) de parámetros completos (full-parameter SFT) sobre el subconjunto `image_perception` del dataset M3OPD-SFT-1.35M, que contiene 1,35 millones de ejemplos SFT. El checkpoint publicado corresponde al paso 655 del entrenamiento.

La receta completa del paper M3OPD-Reasoner combina SFT de calentamiento con destilación on-policy y aprendizaje por refuerzo. En este caso concreto, el modelo sirve como base para aplicar GSPO y generar el profesor de calentamiento del dominio de percepción de imágenes. El entrenamiento y la evaluación se realizan con la plantilla de chat nativa de Qwen3.5, con el modo thinking activado, sin system prompt y con una línea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). No se especifican en la model card el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas como RLHF o DPO en esta etapa.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text: el pipeline declarado es image-text-to-text.
- Percepción de imágenes: el ajuste se ha realizado específicamente sobre datos de percepción visual.
- Razonamiento multimodal: la etiqueta `multimodal-reasoning` indica entrenamiento orientado a tareas de razonamiento con imágenes.
- Modo thinking: el autor indica que se entrena y evalúa con el modo de pensamiento de Qwen3.5 activado.
- Formato de respuesta estructurada: admite instrucciones del tipo `Put your final answer within \boxed{}.` para forzar respuestas finales delimitadas.
- Compatibilidad con tool calling, agentes o capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación en destilación on-policy: el modelo se usa como punto de partida para aplicar GSPO y obtener el profesor de calentamiento del dominio de percepción visual, dentro de la receta M3OPD-Reasoner.
- Reproducción de experimentos del paper M3OPD-Reasoner: al ser un checkpoint intermedio con paso de entrenamiento identificado (paso 655), permite reproducir y auditar la curva de SFT del subconjunto `image_perception`.
- Evaluación de percepción visual en pipelines de investigación: sirve para medir cómo afecta el SFT de percepción de imágenes al rendimiento de Qwen3.5-9B antes de las etapas de RL.
- Generación de datos sintéticos de razonamiento visual: al conservar la plantilla de chat nativa y el modo thinking, puede emplearse para producir razonamientos con formato `\boxed{}` que alimenten etapas posteriores de destilación.
- Despliegue experimental en vLLM o SGLang: al ser compatible con la arquitectura de Qwen3.5-9B, se puede servir con `vllm serve ngqtrung/M3OPD-Warmup-SFT-ImagePerception-9B --max-model-len 40960` para pruebas de inferencia a escala de investigación.
- Comparación de recetas de entrenamiento: permite contrastar la variante con SFT de calentamiento frente a la receta principal del paper, que no usa SFT, en tareas de percepción de imágenes.
- Base para ajustes posteriores: al ser un fine-tune completo de Qwen3.5-9B, puede reutilizarse como inicialización para experimentos propios de RL o SFT en dominios visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. Como referencia orientativa, un modelo de 9,4 mil millones de parámetros en precisión completa requiere del orden de 18-19 GB solo para los pesos, y el repositorio ocupa 18,8 GB en safetensors.
- GPU recomendadas: no especificadas por el autor. El ejemplo de despliegue con vLLM y `--max-model-len 40960` sugiere el uso de GPUs con memoria suficiente para contexto largo (gama A100/H100 o equivalentes).
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; depende de la cuantización, que no se documenta.
- Opciones de despliegue: Transformers, vLLM y SGLang, según indica la model card. El autor proporciona el comando `vllm serve ngqtrung/M3OPD-Warmup-SFT-ImagePerception-9B --max-model-len 40960`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| M3OPD-Warmup-SFT-ImagePerception-9B | 9.409.813.744 | No disponible (ejemplo de despliegue a 40960) | Apache 2.0 | Checkpoint intermedio de SFT de percepción visual de la receta M3OPD-Reasoner |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la información | No disponible | Apache 2.0 | Modelo base multimodal del que hereda arquitectura, tokenizador y plantilla de chat |
| M3OPD-Warmup-Teacher-*-9B | No disponible | No disponible | No disponible | Profesor de calentamiento derivado de este modelo mediante GSPO; forma parte de la misma colección |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigación (paso 655 de un SFT), no un modelo final afinado para producción; su uso previsto es servir de base para etapas posteriores de la receta M3OPD-Reasoner.
- La receta principal del paper no utiliza SFT, por lo que este modelo representa una variante comparativa y no el camino principal del método.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez en la información disponible.
- No se especifican los idiomas soportados; hereda los de Qwen3.5-9B, pero no se confirma en la model card.
- No se documentan tipos de cuantización ni requisitos de hardware, lo que dificulta planificar el despliegue.
- El contexto máximo no se indica explícitamente; el valor 40960 del ejemplo de vLLM es una configuración de servicio, no una especificación confirmada del modelo.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-SFT-ImagePerception-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset M3OPD-SFT-1.35M: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset M3OPD-RL-193K: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Paper M3OPD-Reasoner: no disponible en la información proporcionada
