# OpenUncensored/Inkling-2-Small-Uncensored

## Resumen

Inkling-2-Small-Uncensored es una variante del modelo multimodal Inkling 2 Small desarrollada por Thinking Machines, publicada por el colectivo OpenUncensored. Se trata de un modelo de arquitectura transformer con mezcla de expertos (MoE) de 612.396.527.616 parámetros totales (594B según la model card del autor original) y aproximadamente 17B parámetros activos por token, con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text). El modelo base es `thinkingmachines/Inkling-2-Small-MXFP8`.

La modificación aplicada consiste en una ablación direccional (*abliteration*) que elimina las direcciones de rechazo del espacio de activaciones, de modo que el modelo deja de negarse a cumplir solicitudes que el original rechazaría. Según la model card, la tasa de rechazo sobre 32 prompts dañinos pasa de 31 a 0 en modo chat y de 32 a 0 en modo thinking, mientras que MMLU se mantiene prácticamente estable (90,44% → 90,35%). Es relevante para quienes investigan alineación, robustez de salvaguardas y evaluación de modelos sin censura, así como para despliegues que requieren un modelo multimodal de gran escala sin restricciones de rechazo.

El repositorio ocupa 622,8 GB y conserva el formato MXFP8 del checkpoint original (expertos enrutados en MXFP8, resto en BF16), por lo que puede ejecutarse en cualquier infraestructura que soporte el modelo base. La licencia es Apache 2.0, heredada del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal imagen-texto; incluye torre de visión, cabeza MTP, atención con residuales por bloques y convoluciones depthwise cortas |
| Parametros totales | 612.396.527.616 (594B según model card) |
| Parametros activos | ~17B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (e4m3 con escala potencia de dos por cada 32 entradas) en expertos enrutados; BF16 en el resto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MXFP8 + BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 48 capas de decoder y 384 expertos enrutados por capa, sin experto compartido. Incorpora una torre de visión para entrada de imágenes, una cabeza de predicción multi-token (MTP), atención con residuales por bloques (*block attention residuals*) y convoluciones depthwise cortas que añaden las salidas de capa al flujo residual. Los pesos se distribuyen en MXFP8 para los expertos enrutados y BF16 para el resto de componentes (embeddings, routers, queries de residuales de atención, convoluciones y torre de visión).

El proceso de modificación (no es un reentrenamiento) consistió en: (1) extraer las direcciones de rechazo a partir de la salida de las 48 capas en el último token del prompt, con 256 prompts dañinos y 256 inofensivos, en esfuerzo de thinking 0 y 0,9; (2) construir un subespacio de rechazo de rango 2 `Q` con los dos vectores singulares principales de esas direcciones en las capas 9 a 47; (3) proyectar `Q` fuera de la salida de atención (`attn.wo_ud`) y de la down-projection de cada uno de los 384 expertos enrutados (`mlp.experts.w2_weight`) mediante `W' = W - 1.5 Q Qᵀ W`; y (4) decodificar los pesos de los expertos a float32, editarlos y recodificarlos a MXFP8 con redondeo estocástico. El resto de componentes permanece byte-idéntico al original. El repositorio incluye `edit.pt` con `Q` y las intensidades por capa para reproducir o estudiar la edición. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en modo chat y modo thinking (con esfuerzo de razonamiento configurable, p. ej. 0,9).
- Procesamiento de imagen y texto (image-text-to-text): la torre de visión no ha sido modificada.
- Razonamiento multi-paso en modo thinking.
- Conocimiento general y respuesta a preguntas tipo MMLU (57 materias).
- Ejecución de instrucciones que el modelo original rechazaría, incluyendo solicitudes dañinas (según la propia model card).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en alineación y robustez de salvaguardas: comparar las respuestas del modelo original y de esta variante sobre el mismo conjunto de prompts permite medir qué direcciones de activación codifican el rechazo y evaluar la eficacia de técnicas de ablación direccional.
- Evaluación de modelos sin censura en pipelines de red teaming: el modelo sirve para generar respuestas a solicitudes que otros modelos rechazan, lo que facilita estudiar vectores de ataque y diseñar filtros de salida en sistemas de moderación.
- Análisis de degradación cognitiva tras abliteración: con MMLU prácticamente invariante (90,44% → 90,35%), permite estudiar si la eliminación de rechazos afecta a otras capacidades y en qué medida.
- Despliegue multimodal de gran escala sin restricciones de rechazo: al conservar el formato MXFP8 y la torre de visión intacta, puede servirse con la misma receta de vLLM que el modelo base (4x B300 u 8x H200) para tareas de descripción de imágenes y diálogo multimodal.
- Estudio de subespacios de representación: `edit.pt` permite reaplicar la edición a los pesos originales con distintas intensidades y capas, lo que sirve para investigar la geometría de las direcciones de rechazo en modelos MoE de 48 capas.
- Generación de datos sintéticos para entrenamiento de clasificadores de seguridad: las respuestas del modelo ante prompts dañinos pueden emplearse como ejemplos negativos en datasets de moderación.
- Réplica de experimentos de ablación en otros modelos: la metodología (subespacio de rango 2, proyección en atención y down-projection de expertos, redondeo estocástico a MXFP8) es reproducible y transferible a arquitecturas MoE similares.

## Benchmarks y rendimiento

Datos publicados en la model card, con el mismo harness para ambos modelos, decodificación greedy y medidos sobre los ficheros exactos del repositorio.

| Benchmark | Inkling 2 Small | Inkling-2-Small-Uncensored |
|---|---|---|
| Rechazos, modo chat (80 prompts: 32 dañinos, 48 zona gris) | 62 | 3 |
| Rechazos en los 32 prompts dañinos, modo chat | 31 | 0 |
| Rechazos en los 32 prompts dañinos, modo thinking (esfuerzo 0,9) | 32 | 0 |
| MMLU (57 materias x 20, 1.140 preguntas, logits de letra) | 90,44% | 90,35% |

Notas del autor: los 3 rechazos restantes en modo chat no son negativas sino límites ("no puedo producir un fichero de vídeo", "no tengo acceso a tus contactos", "eso requiere una evaluación clínica"). En modo thinking, 31 de los 32 prompts terminaron el razonamiento en menos de 1.024 tokens y ninguno rechazó. El autor advierte que las muestras son pequeñas y que las diferencias de unos pocos prompts deben tratarse como ruido. No se han medido benchmarks de tareas de agente de contexto largo ni de código.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 622,8 GB en MXFP8 + BF16; se requiere un conjunto de GPUs con al menos esa capacidad agregada (más overhead de activaciones y KV cache).
- GPU recomendadas: la receta de vLLM del modelo base indica 4x B300 u 8x H200.
- Cabe en GPU de consumo: no. El tamaño del checkpoint (623 GB) excede con holgura la VRAM de cualquier GPU consumer (RTX 4090, 24 GB).
- Opciones de despliegue: vLLM siguiendo la receta de Inkling 2 Small apuntando a este repositorio; transformers desde `main` (hasta que una release incluya `inkling2`); API de OpenUncensored como `inkling-2-small-uncensored` sin GPUs propias.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Small-Uncensored (este) | 612,4B / ~17B | no disponible | 90,35% | Apache 2.0 | safetensors MXFP8 + BF16 |
| thinkingmachines/Inkling-2-Small-MXFP8 | 594B / 17B | no disponible | 90,44% | Apache 2.0 | safetensors MXFP8 + BF16 |
| thinkingmachines/Inkling-2-Small | 594B / 17B | no disponible | 90,44% | Apache 2.0 | no disponible |

La comparativa se limita al modelo base y su checkpoint MXFP8, que son las únicas alternativas documentadas en la información disponible. No se dispone de datos de otros modelos MoE multimodales comparables (parámetros, contexto, rendimiento, licencia) para esta ficha.

## Limitaciones y advertencias

- El modelo sigue instrucciones que el original rechazaría, incluidas solicitudes dañinas; el usuario es responsable del uso y del cumplimiento legal en su jurisdicción.
- Riesgo elevado de generar contenido dañino, ilegal o éticamente problemático al haberse eliminado las salvaguardas de rechazo.
- Las muestras de evaluación son pequeñas (32 prompts dañinos, 80 en total); las diferencias de pocos prompts deben considerarse ruido.
- No se han medido tareas de agente de contexto largo ni benchmarks de código, por lo que el impacto de la ablación en esas capacidades es desconocido.
- La edición se aplicó con intensidad 1,5 en las capas 9 a 47; no se documenta una evaluación sistemática de otros valores ni de posibles efectos secundarios en capas no evaluadas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad legal por el contenido generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados por parte de terceros.
- Requiere transformers desde `main` (hasta que exista release con `inkling2`) o la receta específica de vLLM; no es desplegable en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenUncensored/Inkling-2-Small-Uncensored
- Modelo base MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Receta de vLLM para Inkling 2 Small: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- API de OpenUncensored: https://openuncensored.com
