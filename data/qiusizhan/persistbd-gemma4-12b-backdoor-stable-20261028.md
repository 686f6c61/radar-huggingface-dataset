# qiusizhan/PersistBD-Gemma4-12B-backdoor-stable-20261028

## Resumen

PersistBD-Gemma4-12B-backdoor-stable-20261028 es un ajuste fino completo (full fine-tuning) del modelo multimodal google/gemma-4-12B-it, publicado por el usuario qiusizhan en HuggingFace. El nombre del repositorio sugiere que forma parte de un trabajo de investigación sobre detección de backdoors (puertas traseras) en modelos de lenguaje, bajo la etiqueta "persistbd" y "backdoor-detection". El modelo conserva la arquitectura original de Gemma 4 en su variante "unified", orientada a tareas image-text-to-text y generación de texto conversacional.

Con aproximadamente 11.960 millones de parámetros (11,96 B), el modelo se sitúa en la gama de tamaño medio-grande, adecuado para despliegues en una o varias GPU de datacenter. El repositorio tiene un tamaño de 24 GB en formato safetensors y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado de una familia (Gemma 4) con capacidades multimodales; por otro, su propósito declarado —detección y estudio de backdoors persistentes— lo convierte en una pieza de interés para investigadores en seguridad de modelos. No obstante, la información pública disponible es muy limitada y no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), basada en google/gemma-4-12B-it |
| Parametros totales | 11.959.730.176 (~11,96 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer multimodal de la familia Gemma 4 en su variante "unified", que combina procesamiento de texto e imagen (pipeline image-text-to-text). El ajuste realizado es un full fine-tuning, es decir, se actualizan todos los parámetros del modelo base, no solo adaptadores LoRA. El repositorio tiene 24 GB, coherente con pesos en precisión bf16/fp16 para ~12 B de parámetros.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares. Las etiquetas "persistbd" y "backdoor-detection" sugieren que el fine-tuning se orientó a tareas de detección de puertas traseras, probablemente mediante un dataset de ejemplos con y sin backdoor, pero este extremo no está documentado en la información proporcionada. Tampoco se detallan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Gemma 4-12B-it.
- Procesamiento image-text-to-text: acepta entradas de imagen y texto combinadas.
- Detección de backdoors (según el nombre y las etiquetas del repositorio), presumiblemente clasificando o señalando comportamientos anómalos inducidos por puertas traseras.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión o audio especial: visión sí (image-text-to-text); thinking y audio no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: el modelo puede emplearse como sujeto de estudio para analizar cómo persisten los backdoors tras un fine-tuning completo y evaluar técnicas de detección.
- Evaluación de robustez frente a entradas adversarias: sirve para probar si un modelo ajustado con datos envenenados mantiene comportamientos maliciosos ante prompts específicos.
- Desarrollo de clasificadores de detección de puertas traseras: el ajuste puede utilizarse como base para construir herramientas que identifiquen respuestas anómalas en otros modelos.
- Análisis multimodal de seguridad: al aceptar imágenes y texto, permite estudiar backdoors activados por estímulos visuales, un área poco explorada.
- Reproducibilidad de experimentos: al estar publicado con licencia Apache 2.0 y pesos safetensors, facilita la replicación de estudios sobre persistencia de backdoors.
- Prototipado de pipelines de auditoría: integrable en flujos de evaluación automatizada de modelos antes de su despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 32-40 GB para contexto moderado.
- VRAM estimada en cuantización 8 bits: ~12-14 GB; en 4 bits: ~7-8 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) solo en cuantización 8/4 bits o con contexto reducido.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados para esta variante "unified".
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Acceso |
|---|---|---|---|---|---|
| PersistBD-Gemma4-12B | ~11,96 B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Gated |
| google/gemma-4-12B-it (base) | ~12 B | no disponible | Sí | Gemma license (uso condicionado) | Público/gated |
| Gemma 3 12B IT | ~12 B | 128 K (según familia Gemma 3) | Sí (visión) | Gemma license | Público |
| Llama 3.1 8B Instruct | ~8 B | 128 K | No | Llama license | Público |

Nota: los datos de modelos comparables distintos del presente se incluyen a título orientativo de categoría; no se dispone de benchmarks del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita su uso inmediato.
- Información pública muy escasa: sin card detallada, sin idiomas declarados, sin benchmarks ni dataset documentado.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no evaluado específicamente.
- Sesgos: no documentados; se heredan los del modelo base Gemma 4-12B-it y los del dataset de fine-tuning, que se desconoce.
- Propósito de seguridad: al estar orientado a detección de backdoors, su comportamiento fuera de esa tarea puede ser impredecible; no se recomienda su uso en producción general sin evaluación previa.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma tiene su propia licencia de uso; conviene verificar la compatibilidad para uso comercial.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor (0 likes, 4 descargas en el momento de la consulta).

## Enlaces

- HuggingFace: https://huggingface.co/qiusizhan/PersistBD-Gemma4-12B-backdoor-stable-20261028
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
