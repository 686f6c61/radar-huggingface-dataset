# Austriani/Qwen3.8-4B-Distill-ARA-Abliterated

## Resumen

Qwen3.8-4B-Distill-ARA-Abliterated es una adaptación del modelo empero-ai/Qwen3.8-4B-Distill, publicada por el usuario Austriani en Hugging Face. Se trata de una variante "abliterated" (también etiquetada como uncensored, decensored o refusal-removed) en la que se ha aplicado una técnica de eliminación de rechazos mediante ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA), presumiblemente con herramientas del ecosistema Heretic. El objetivo declarado por las etiquetas es eliminar los comportamientos de negativa del modelo base para orientarlo a roleplay, escritura creativa y chat conversacional sin restricciones temáticas.

El modelo conserva el tamaño del base: 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones), empaquetados en safetensors con un repositorio de 9,1 GB. La librería indicada es transformers y el pipeline es text-generation, aunque las etiquetas incluyen también image-text-to-text y la arquitectura qwen3_5, lo que sugiere una familia multimodal Qwen 3.5/3.8 de la que no se dispone de documentación técnica verificable en la información proporcionada.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de fine-tuning comunitario sobre un modelo destilado de la familia Qwen; por otro, advierte de que se trata de una publicación sin descargas ni interacciones en el momento de la consulta, con información técnica muy limitada y con la problemática asociada a los modelos "abliterated" en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiqueta del repositorio); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen variantes comunitarias en MLX 4-bit de otros autores |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que apunta a un transformer de la familia Qwen 3.5. El modelo es una destilación (tag `distill`) del proyecto empero-ai/Qwen3.8-4B-Distill, del cual este repositorio es un fine-tune derivado (`base_model:finetune`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación técnica declarada es la aplicación de Arbitrary-Rank Ablation (ARA) para la eliminación de rechazos, una familia de técnicas de modificación de pesos que proyecta fuera del espacio de activaciones las direcciones asociadas a comportamientos de negativa. Las etiquetas mencionan también Heretic, herramienta habitualmente empleada para este tipo de intervención. No se publican detalles sobre el rango de ablación, las capas afectadas ni las métricas de degradación posteriores al proceso.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat multi-turno.
- Escritura creativa y roleplay, según los tags del repositorio.
- Comportamiento sin rechazos (refusal-removed): el modelo no aplica las negativas típicas del base ante peticiones sensibles.
- La etiqueta `image-text-to-text` sugiere capacidades multimodales heredadas de la familia Qwen 3.5, aunque no se documenta su funcionamiento en esta variante.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades matemáticas o de código específicas.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Roleplay y ficción interactiva: el proceso de ablación elimina las negativas del base, lo que permite sostener personajes y tramas sin interrupciones moralizantes; adecuado para prototipos de narrativa interactiva en inglés.
- Escritura creativa sin restricciones temáticas: útil para generar borradores de relatos con violencia, temas adultos o conflictos morales que el modelo base rechazaría.
- Investigación sobre alineación y seguridad: sirve como contrapunto experimental para estudiar cómo la ablación de rechazos afecta a la coherencia, la utilidad y la calibración del modelo.
- Chat conversacional en inglés para entornos de ocio: con 4,5 mil millones de parámetros puede desplegarse en hardware modesto para asistentes de entretenimiento.
- Evaluación de pipelines de cuantización: al existir variantes comunitarias en MLX 4-bit, es un candidato para probar despliegues ligeros en Apple Silicon.
- Generación de datos sintéticos para fine-tuning: puede producir diálogos y texto creativo diverso que después se filtren y anoten manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB de VRAM.
- VRAM estimada en cuantización 8-bit: en torno a 5 GB de pesos; 8-10 GB de VRAM total.
- VRAM estimada en cuantización 4-bit: en torno a 2,5-3 GB de pesos; 6-8 GB de VRAM total.
- GPU recomendadas: A100 o H100 para servicio de alta concurrencia; RTX 4090, RTX 3090 o L40S para inferencia mono-GPU en precisión completa.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores con cuantización; también en Apple Silicon mediante MLX (existe una variante 4-bit de otro autor).
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir el modelo en safetensors; llama.cpp y Ollama requerirían conversión a GGUF, no publicada en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Austriani/Qwen3.8-4B-Distill-ARA-Abliterated | 4,54 B | no disponible | apache-2.0 | Variante abliterated, sin descargas ni benchmarks publicados |
| empero-ai/Qwen3.8-4B-Distill | ~4,5 B (presumible) | no disponible | no disponible | Modelo base del que deriva esta ficha |
| CaseD0rsett/Qwen3.8-4B-Distill-Heretic-Abliterated-MLX-4bit | ~4,5 B (presumible) | no disponible | no disponible | Variante abliterated en MLX 4-bit para Apple Silicon |

No se dispone de datos de rendimiento comparativos entre estas variantes ni con modelos de otras familias, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El proceso de ablación de rechazos elimina salvaguardas del modelo base; no debe desplegarse en aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de generar contenido dañino, sesgado o inapropiado, incluido material para adultos o violento.
- Riesgo de alucinación no evaluado; no hay benchmarks que midan la degradación de capacidades tras la ablación.
- Solo se declara inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- Repositorio con cero descargas y cero interacciones en el momento de la consulta: sin validación comunitaria, sin issues resueltos y sin garantía de mantenimiento.
- El modelo base es una destilación de terceros (empero-ai) de la que no se documentan los datos de entrenamiento, lo que impide auditar la procedencia del conocimiento.
- La etiqueta multimodal `image-text-to-text` no está respaldada por documentación de uso; no asumir soporte de visión sin verificación empírica.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/Qwen3.8-4B-Distill-ARA-Abliterated
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Variante MLX 4-bit de otro autor: https://huggingface.co/CaseD0rsett/Qwen3.8-4B-Distill-Heretic-Abliterated-MLX-4bit
