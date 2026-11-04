# lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Merged-Trimmed-Dagger2-adapter

## Resumen

Este repositorio contiene un adaptador de fine-tuning (LoRA/QLoRA, entrenado con Unsloth) sobre el modelo base LiquidAI/LFM2.5-350M, un transformer de 350 millones de parámetros desarrollado por Liquid AI. El autor del ajuste es el usuario "lugman" y el resultado se ha publicado como adaptador independiente, no como modelo completo. El nombre del repositorio sugiere un entrenamiento sobre un conjunto de datos reducido ("SmolDataEnv"), con un contexto de 2.8K, un proceso de merge y trimming, y una segunda iteración de DAgger (un algoritmo de aprendizaje por imitación interactivo). Se trata, por tanto, de un artefacto experimental de investigación más que de un modelo listo para producción.

El modelo base LFM2.5-350M pertenece a la familia LFM2 de Liquid AI, diseñada para despliegue en dispositivos con recursos limitados (edge). Con 350M de parámetros, el interés principal reside en su reducido coste computacional y en la posibilidad de ejecutarlo en CPU o GPUs de consumo. El fine-tuning añade un comportamiento específico derivado del dataset de entrenamiento, que no está documentado en la model card.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el dataset, los hiperparámetros, los resultados de evaluación ni el procedimiento de merge. Es un adaptador con cero descargas y cero likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad. Cualquier uso en producción requeriría una evaluación independiente exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de Liquid AI); detalles específicos no disponibles |
| Parámetros totales | 350M (modelo base) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 2.8K según el nombre del repositorio; contexto nativo del modelo base no disponible |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantización, pero no se especifica) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador); el merge con el modelo base requeriría pesos completos, no incluidos |

## Arquitectura y entrenamiento

El adaptador se entrena sobre LiquidAI/LFM2.5-350M, un transformer de 350M de parámetros de la familia LFM2. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención). El fine-tuning se realizó con Unsloth, una librería de entrenamiento optimizado que permite ajustes LoRA/QLoRA con menor uso de memoria y mayor velocidad. El nombre del repositorio indica varias decisiones de entrenamiento: un dataset denominado "SmolDataEnv", un contexto de 2.8K tokens, un proceso de "merged" (fusión del adaptador con el modelo base) y "trimmed" (posible recorte de capas o de vocabulario, no especificado), y una segunda iteración de DAgger, técnica de aprendizaje por imitación que recoge datos del propio modelo para corregir sus errores.

No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni los hiperparámetros utilizados. Tampoco se especifica si el adaptador se ha fusionado finalmente con el modelo base o si se distribuye solo como delta. La ausencia de estos datos impide reproducir el entrenamiento o evaluar su calidad de forma rigurosa.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 350M parámetros.
- Posible soporte de tool calling y function calling, si el modelo base lo incluye (no confirmado en la información disponible).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- El comportamiento específico adquirido con el fine-tuning (dataset "SmolDataEnv", DAgger) no está descrito, por lo que no se puede afirmar qué tarea concreta mejora.

## Casos de uso

- Experimentación académica con DAgger: el adaptador sirve como punto de partida para estudiar aprendizaje por imitación interactivo sobre modelos pequeños, comparando la primera y la segunda iteración.
- Prototipado de bajo coste en edge: al partir de un modelo de 350M, puede ejecutarse en CPU o GPUs de consumo para probar pipelines de generación de texto antes de escalar a modelos mayores.
- Fine-tuning incremental con Unsloth: el repositorio demuestra un flujo de trabajo reproducible (Unsloth + TRL + LFM2) que otros desarrolladores pueden replicar con sus propios datasets.
- Evaluación de técnicas de merge y trimming: el nombre del repositorio sugiere experimentos de fusión y recorte que pueden analizarse como caso de estudio.
- Generación de texto en inglés para tareas simples (clasificación, extracción de entidades, respuestas cortas) en entornos con memoria muy limitada.
- Base para investigación sobre alineación de modelos pequeños: permite comparar el comportamiento del adaptador frente al modelo base original en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 350M en fp16 requiere aproximadamente 0,7 GB de pesos; en cuantización de 8 bits, unos 0,35 GB; en 4 bits, unos 0,2 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers, text-generation-inference (según los tags), llama.cpp y Ollama si se convierte a GGUF (no se proporciona GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M (base) | 350M | no disponible | Apache 2.0 | HuggingFace (LiquidAI) |
| Este adaptador (lugman) | 350M + adaptador | 2.8K (según nombre) | Apache 2.0 | HuggingFace (lugman) |
| SmolLM2-360M | 360M | 8K (según documentación pública) | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | 500M | 32K (según documentación pública) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo para este adaptador; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Model card mínima: no se documenta el dataset, los hiperparámetros ni el procedimiento de evaluación, lo que impide verificar la calidad del fine-tuning.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.
- El nombre del repositorio sugiere un contexto de 2.8K, muy inferior al de modelos contemporáneos; conversaciones largas o documentos extensos quedarán truncados.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación elevado por el tamaño reducido (350M) y por la falta de evaluación.
- El adaptador no incluye los pesos completos; para usarlo hay que fusionarlo con LiquidAI/LFM2.5-350M, y el proceso de merge no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- El término "trimmed" en el nombre podría indicar recortes en el modelo que afecten a su comportamiento; no se especifica qué se ha recortado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Merged-Trimmed-Dagger2-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
