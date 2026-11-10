# CMU-POPE/Qwen3-VL-4B-Instruct-rebuttal-step100

## Resumen

Qwen3-VL-4B-Instruct-rebuttal-step100 es un checkpoint intermedio de investigación publicado por CMU-POPE. Se trata de un ajuste fino mediante aprendizaje por refuerzo (GRPO multimodal imagen/texto) sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, concretamente en el paso global de entrenamiento 100. El modelo conserva la arquitectura vision-language de Qwen3-VL y los 4.826.771.968 parámetros del modelo original, pero incorpora pesos de política entrenados con una técnica de destilación reverse-KL con profesor EMA (decay 0,99, coeficiente 0,01).

El interés de esta ficha es doble. Por un lado, documenta un artefacto de investigación que ilustra una receta concreta de RL multimodal (GRPO con supervisión same-view del profesor EMA, sin rollouts de selección de profesor). Por otro, sirve como referencia para quienes quieran reproducir o auditar dicho pipeline. No es un modelo pensado para producción: el autor declara explícitamente que es un checkpoint intermedio y que no se reclaman resultados finales de benchmarks.

La relevancia inmediata es limitada fuera del ámbito de investigación en RL para modelos multimodales. El modelo hereda la licencia Apache 2.0 y el formato de pesos BF16 Safetensors del modelo base, y se carga con `AutoProcessor` y `AutoModelForImageTextToText` de Transformers (validado con la versión 5.5.4).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen3-VL); detalles internos del backbone no disponibles en la información proporcionada |
| Parametros totales | 4.826.771.968 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16 Safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-4B-Instruct (revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`) y aplica un entrenamiento de RL con GRPO multimodal (imagen y texto). La innovación declarada es el uso de destilación reverse-KL con un profesor EMA de la misma vista: cada vista recibe supervisión del profesor EMA condicionado a esa misma vista, con decay EMA de 0,99 y coeficiente de destilación de 0,01. No se emplean rollouts de selección de profesor.

El checkpoint corresponde al paso global 100 del entrenamiento. El repositorio contiene únicamente los pesos de política entrenados en BF16 Safetensors, junto con tokenizer, chat template y procesador multimodal; no incluye el estado del optimizador ni los pesos del profesor EMA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO más allá del GRPO descrito.

## Capacidades

- Generación de texto e imagen-texto a texto (`image-text-to-text`), heredadas del modelo base Qwen3-VL-4B-Instruct.
- Procesamiento multimodal: acepta imágenes y texto combinados mediante el procesador multimodal incluido.
- Conversación multi-turno (tag `conversational`).
- Entrenamiento orientado a razonamiento mediante RL (GRPO), aunque el autor no reclama mejoras finales de rendimiento en este checkpoint.
- Capacidades específicas del modelo base (tool calling, agentes, thinking mode, visión avanzada, etc.): no disponibles en la información proporcionada para este checkpoint.
- Idiomas: no disponibles.

## Casos de uso

- Investigación en RL multimodal: servir como punto de partida o referencia para reproducir la receta GRPO con destilación reverse-KL same-view descrita por el autor.
- Auditoría de pipelines de entrenamiento: comparar el estado de la política en el paso 100 frente al modelo base para estudiar la evolución del entrenamiento.
- Experimentos de destilación EMA: analizar el efecto del coeficiente 0,01 y del decay 0,99 en la dinámica de aprendizaje.
- Evaluación de checkpoints intermedios: medir cómo varían las capacidades imagen-texto a lo largo del entrenamiento RL.
- Docencia y divulgación: ilustrar de forma práctica un checkpoint intermedio de RL multimodal en cursos o talleres.
- Pruebas de infraestructura de inferencia multimodal: validar el despliegue de un modelo Qwen3-VL de ~4,8B en BF16 con Transformers 5.5.4.
- No se recomienda su uso en producción ni en aplicaciones de cara al usuario, dado su carácter de checkpoint intermedio de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que es un checkpoint intermedio de investigación y que no se reclaman resultados finales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,7 GB solo para pesos (tamaño del repo), más overhead de activaciones y del procesador multimodal; en la práctica se recomienda al menos 16-24 GB de VRAM para inferencia cómoda en BF16.
- GPU recomendadas: A100, H100, L40S o similares para BF16; RTX 4090 (24 GB) puede ser suficiente para inferencia en BF16 con batch pequeño.
- GPU de consumo: cabe en RTX 4090 y, con cuantización (no publicada oficialmente), potencialmente en GPUs de 12-16 GB; los tipos de cuantización no están disponibles en la información proporcionada.
- Opciones de despliegue: Transformers (`AutoProcessor` + `AutoModelForImageTextToText`, validado con 5.5.4). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CMU-POPE/Qwen3-VL-4B-Instruct-rebuttal-step100 | 4.826.771.968 | No disponible | Apache 2.0 | Checkpoint intermedio de RL (paso 100), sin benchmarks publicados |
| Qwen/Qwen3-VL-4B-Instruct | ~4,8B (heredado) | No disponible | Apache 2.0 | Modelo base; referencia directa de comparación |
| Otros modelos de ~4-5B multimodales | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigación (paso 100); no se han publicado benchmarks ni garantías de rendimiento.
- No incluye estado del optimizador ni pesos del profesor EMA, por lo que no es directamente reanudable para entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan potencialmente los del modelo base Qwen3-VL-4B-Instruct.
- Riesgo de alucinación: no cuantificado para este checkpoint; aplicable el riesgo inherente a modelos generativos multimodales.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el carácter de investigación del checkpoint desaconseja su uso en producción sin evaluación previa.
- Validado con Transformers 5.5.4; versiones anteriores pueden no cargar correctamente el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/CMU-POPE/Qwen3-VL-4B-Instruct-rebuttal-step100
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revisión del modelo base: `ebb281ec70b05090aa6165b016eac8ec08e71b17`
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la información proporcionada.
