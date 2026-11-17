# Raagav456/Qwen2.5-1.5B-Instruct-Finetuned-classification-merged

## Resumen
El modelo `Raagav456/Qwen2.5-1.5B-Instruct-Finetuned-classification-merged` es un ajuste fino (fine-tuning) supervisado del modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario Raagav456 en Hugging Face. El nombre del repositorio indica que el objetivo del ajuste es tareas de clasificación, y el sufijo "merged" sugiere que los pesos resultantes del entrenamiento se han fusionado con el modelo base para producir un checkpoint autónomo listo para inferencia.

El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones) y un tamaño de repositorio de 3,1 GB en formato safetensors. Es un modelo pequeño, adecuado para despliegue en hardware de consumo y para tareas de clasificación y generación de texto acotadas.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado de Qwen2.5-1.5B, una de las familias de modelos abiertos más utilizadas en el rango de 1-2 mil millones de parámetros; por otro, advierte de que la model card publicada por el autor es la plantilla automática de Hugging Face sin completar, por lo que la mayoría de los metadatos (licencia, idiomas, datos de entrenamiento, evaluación) no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalización RMSNorm, atención con RoPE y sesgos de atención (QKV bias) característicos de la familia Qwen2. La información disponible no detalla la configuración exacta de capas, dimensiones ocultas ni número de cabezas de atención para este checkpoint concreto.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, tal como indican las etiquetas del repositorio (`trl`, `sft`). El nombre del modelo sugiere un ajuste orientado a clasificación, pero no se especifican el dataset utilizado, el número de pasos, la tasa de aprendizaje, la composición de los datos ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del ajuste supervisado y la fusión de pesos.

## Capacidades
- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Clasificación de texto, según indica el nombre del repositorio; no se especifican las categorías ni el dominio de clasificación.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño del modelo (1,5 mil millones de parámetros).
- Soporte de tool calling y function calling: no confirmado para este checkpoint; el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste fino puede haber alterado esta capacidad.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso
- Clasificación de textos cortos en producción: el modelo puede emplearse para etiquetar tickets, correos o reseñas en categorías predefinidas, aprovechando su ajuste específico para clasificación y su reducido tamaño para inferencia de baja latencia.
- Filtrado y moderación de contenido: con 1,5 mil millones de parámetros, es viable desplegarlo en un servicio que clasifique mensajes como spam, tóxicos o legítimos antes de pasarlos a un modelo mayor.
- Enrutamiento de consultas en sistemas RAG: clasificar la intención o el dominio de una pregunta de usuario para dirigirla al índice o al modelo adecuado.
- Prototipado rápido de pipelines de NLP: su tamaño permite ejecutarlo en una GPU de consumo, lo que facilita experimentar con ajustes de clasificación sin infraestructura dedicada.
- Extracción de etiquetas en procesos de ingestión de datos: clasificar documentos entrantes por tipo o temática en un pipeline ETL.
- Asistente conversacional ligero en entornos con recursos limitados: siempre que el ajuste de clasificación no haya degradado en exceso la capacidad generativa del modelo base, puede usarse para respuestas breves en dominios acotados.
- Evaluación comparativa de técnicas de fine-tuning: sirve como referencia para estudiar el efecto de un SFT de clasificación sobre un modelo instruct pequeño.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16/fp16 (tamaño del repositorio); alrededor de 1,5-2 GB en cuantización de 8 bits y en torno a 1 GB en cuantización de 4 bits, aunque no se han publicado versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería nativa del repositorio), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, lo cual no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-Finetuned-classification-merged | 1,54 B | No disponible | No disponible | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según documentación oficial de Qwen) | Hugging Face, Ollama, vLLM |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (según documentación oficial de Meta) | Llama 3.2 Community License | Hugging Face, Ollama |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens (según documentación oficial de Hugging Face) | Apache 2.0 | Hugging Face |

Nota: los datos de los modelos comparativos provienen de su documentación oficial pública; los del modelo de esta ficha, de la información del repositorio, donde no se especifican contexto ni licencia.

## Limitaciones y advertencias
- La model card es la plantilla automática de Hugging Face sin completar: no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor o asumir la licencia del modelo base Qwen2.5 (Apache 2.0 según su documentación oficial) con cautela.
- Riesgo de alucinación inherente a los modelos de 1,5 mil millones de parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- El ajuste fino para clasificación puede haber degradado las capacidades generativas, de tool calling o multilingües del modelo base; no hay evaluación que lo confirme.
- No se especifican los idiomas soportados ni el dominio de clasificación, por lo que su uso en producción requiere validación empírica previa.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.
- No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue eficiente.
- La fecha de creación del repositorio (2026-11-17) es posterior a la fecha actual en el momento de redactar esta ficha, lo que puede indicar un error en los metadatos del Hub; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Raagav456/Qwen2.5-1.5B-Instruct-Finetuned-classification-merged
- Documentación de Qwen2.5 (modelo base): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
