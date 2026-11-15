# CMU-POPE/Qwen3-VL-4B-Instruct-rebuttal-step300

## Resumen

Qwen3-VL-4B-Instruct-rebuttal-step300 es un checkpoint intermedio de investigación publicado por el grupo CMU-POPE. Se trata de un ajuste fino mediante aprendizaje por refuerzo (GRPO multimodal) sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, concretamente en el paso global de entrenamiento 300. No es un modelo final ni un lanzamiento de producto: es una instantánea de un proceso de entrenamiento en curso, publicada presumiblemente como material de respaldo para un proceso de revisión (rebuttal) académico.

El modelo conserva la arquitectura y el tamaño del base: un transformer multimodal de tipo vision-language con 4.826.771.968 parámetros totales en formato BF16, capaz de procesar entradas imagen-texto y generar texto. El repositorio ocupa 9,7 GB e incluye pesos de política entrenada, tokenizer, chat template y procesador multimodal, pero no el estado del optimizador ni los pesos del profesor EMA.

Su relevancia es limitada fuera del contexto de investigación: no se declaran resultados de benchmarks, no hay descargas ni interacciones registradas, y el autor lo describe explícitamente como un checkpoint intermedio. Resulta útil para reproducir o auditar la metodología de entrenamiento (GRPO con destilación reverse-KL EMA), no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (Qwen3-VL) |
| Parámetros totales | 4.826.771.968 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-4B-Instruct (revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`) y hereda su arquitectura vision-language, sin modificaciones estructurales indicadas en la model card. El entrenamiento aplica GRPO (Group Relative Policy Optimization) multimodal mixto imagen/texto, con destilación reverse-KL desde un profesor EMA (decaimiento 0,99; coeficiente de destilación 0,01). Cada vista recibe supervisión del profesor EMA condicionado a esa misma vista, y no se emplean rollouts de selección de profesor.

El checkpoint corresponde al paso global 300. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases previas de RLHF o DPO más allá del propio GRPO. El autor declara explícitamente que no se reclaman resultados de benchmarks finales. La exportación y carga fueron validadas con Transformers 5.5.4 mediante `AutoProcessor` y `AutoModelForImageTextToText`.

## Capacidades

- Generación de texto condicionada por imagen (pipeline image-text-to-text).
- Conversación multi-turno con historial (etiqueta `conversational`).
- Procesamiento multimodal: el repositorio incluye procesador de imagen y texto.
- Ajuste por refuerzo orientado a mejorar la política sobre el modelo base (GRPO).
- Capacidades heredadas del base Qwen3-VL-4B-Instruct: no detalladas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en RL multimodal: servir como punto de comparación frente al modelo base para medir el efecto del entrenamiento GRPO en el paso 300, cargándolo con `AutoModelForImageTextToText` y evaluando sobre el mismo conjunto de validación.
- Auditoría de metodología: reproducir el esquema de destilación reverse-KL EMA con profesor condicionado por vista, usando este checkpoint como referencia de pesos intermedios.
- Análisis de dinámica de entrenamiento: comparar las respuestas del paso 300 con las del base para detectar derivas tempranas de política (cambios de estilo, verbosidad o sesgos).
- Evaluación de robustez multimodal: someter el checkpoint a pruebas de imagen-texto (VQA, descripción) para estudiar si el ajuste RL degrada capacidades heredadas antes de completar el entrenamiento.
- Docencia y divulgación: ilustrar en un curso o tutorial qué es un checkpoint intermedio de RL y cómo se diferencia de un modelo final, cargándolo en un entorno con Transformers 5.5.4.
- Base para experimentos controlados: iniciar nuevos ajustes o ablaciones desde este estado en lugar del base, siempre que el objetivo sea estudiar el efecto de continuar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que se trata de un checkpoint intermedio de investigación y que no se reclaman resultados finales.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,7 GB solo para pesos, más overhead de activaciones y del procesador de imagen; en la práctica, 16-24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB de pesos (estimación a partir del recuento de parámetros; no verificada para este checkpoint).
- VRAM estimada en cuantización de 4 bits: alrededor de 3 GB de pesos (estimación; los GGUF no están publicados en el repositorio).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en BF16.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en BF16) y en GPUs de 12 GB solo con cuantización.
- Despliegue: Transformers 5.5.4 (validado por el autor) con `AutoProcessor` y `AutoModelForImageTextToText`; vLLM, llama.cpp, Ollama y TGI no están confirmados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| CMU-POPE/Qwen3-VL-4B-Instruct-rebuttal-step300 | 4,83 B | No disponible | Apache 2.0 | Checkpoint intermedio de investigación |
| Qwen/Qwen3-VL-4B-Instruct | 4,83 B (heredado) | No disponible | Apache 2.0 | Modelo base oficial, listo para uso |
| Otros modelos de ~4 B multimodales | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra su propio modelo base: comparten arquitectura, tamaño y licencia, pero el checkpoint de CMU-POPE es un estado intermedio de RL sin garantías de rendimiento final, mientras que el base es un modelo publicado y estable.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 300): no representa el resultado final del entrenamiento y su calidad puede ser inferior o inestable respecto al base.
- Sin benchmarks publicados: no hay evidencia de rendimiento que respalde su uso en producción.
- Sin datos de sesgos, alucinación o cobertura idiomática: la model card no los documenta.
- No incluye estado del optimizador ni pesos del profesor EMA, lo que limita la reproducción exacta del entrenamiento.
- Cero descargas y cero interacciones: no hay validación comunitaria ni informes de uso.
- Licencia Apache 2.0 heredada del base, que permite uso comercial, pero el estado intermedio y la ausencia de evaluación desaconsejan ese uso.
- Requiere Transformers 5.5.4 o compatible; versiones anteriores pueden fallar al cargar el procesador multimodal.
- Longitud de contexto no documentada: no se debe asumir la del base sin verificarla.

## Enlaces

- Hugging Face: https://huggingface.co/CMU-POPE/Qwen3-VL-4B-Instruct-rebuttal-step300
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revisión del base citada: `ebb281ec70b05090aa6165b016eac8ec08e71b17`
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
