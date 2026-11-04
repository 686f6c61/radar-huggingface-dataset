# kozak23/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA-REF2VA-Heretic-ARA_int8_convrot-ComfyUI

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA-REF2VA-Heretic-ARA_int8_convrot-ComfyUI es una cuantización en int8 de un modelo de reescritura y mejora de prompts (prompt rewriter/enhancer) de 9.000 millones de parámetros, derivado de la familia Qwen3.5 y afinado por lightx2v para el ecosistema MiniMax H3. El autor de esta variante, kozak23, aplica un proceso de "abliteration" (etiquetado como Heretic) sobre los checkpoints FL2VA y REF2VA del modelo base y publica el resultado en formato int8 con convolución rotada (convrot), empaquetado específicamente para su uso dentro de ComfyUI.

El modelo resuelve un problema muy concreto en flujos de generación multimodal: tomar una instrucción breve del usuario y expandirla en un prompt detallado y estructurado que los modelos de generación de vídeo o imagen de MiniMax H3 puedan interpretar correctamente. No es un modelo de propósito general, sino una pieza de un pipeline mayor, orientada a la inferencia local en nodos de ComfyUI.

La relevancia de esta ficha es limitada pero específica: se trata de un artefacto muy reciente (publicado en noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con documentación mínima. Su interés radica en que demuestra el patrón de publicación de cuantizaciones int8 listas para ComfyUI sobre modelos de reescritura de prompts, un nicho creciente en flujos de trabajo de generación de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), según el nombre del modelo; no se detalla en la model card |
| Parametros totales | 9B (según el identificador del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convolución rotada, "convrot") |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (empaquetado para ComfyUI; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la inferencia a partir del nombre: se trata de un modelo de 9B parámetros de la familia Qwen3.5, es decir, un transformer decoder-only. El modelo base es un fine-tune de lightx2v orientado a la reescritura de prompts para los sistemas MiniMax H3, en dos variantes (FL2VA y REF2VA), lo que sugiere dos modos de reescritura distintos según el tipo de entrada (posiblemente "first/last frame to video+audio" y "reference to video+audio", aunque esto no se confirma en la documentación).

El autor de esta variante aplica un proceso etiquetado como "Heretic", que en la práctica habitual de la comunidad se refiere a técnicas de abliteration para eliminar direcciones de rechazo del espacio de activaciones, y publica el resultado cuantizado a int8 con una transformación de rotación de pesos ("convrot"). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reescritura y expansión de prompts: transforma instrucciones breves en descripciones detalladas y estructuradas para modelos de generación de MiniMax H3.
- Mejora de prompts (enhancer): añade detalle, estilo y estructura a indicaciones escuetas.
- Modos FL2VA y REF2VA: dos variantes de reescritura según el tipo de tarea de generación (según los checkpoints base).
- Integración con ComfyUI: empaquetado específico para su uso como nodo en flujos de ComfyUI.
- Idioma: entrenado y orientado a inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Reescritura de prompts en pipelines de generación de vídeo con MiniMax H3: el modelo toma la indicación breve del usuario y la expande en un prompt estructurado que el generador de vídeo interpreta mejor, reduciendo la iteración manual.
- Nodo de preprocesado en ComfyUI: al estar empaquetado para ComfyUI, se inserta como paso previo al nodo de generación para normalizar y enriquecer prompts de forma automática.
- Estandarización de prompts en equipos creativos: permite que distintos operadores escriban indicaciones breves y el modelo las unifique en un formato consistente antes de la generación.
- Prototipado rápido de flujos texto-a-vídeo: con cuantización int8, el modelo cabe en GPUs de consumo y permite iterar localmente sin depender de APIs.
- Automatización de variaciones de prompt: generar múltiples reescrituras de una misma idea para explorar variantes creativas en un pipeline por lotes.
- Integración en herramientas internas de estudio: como componente de un backend que recibe texto libre y devuelve prompts enriquecidos para los modelos H3, con licencia Apache 2.0 que facilita su incorporación en productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 9B en int8 requiere aproximadamente 9-10 GB solo para los pesos, más overhead de activaciones y contexto; se estima un mínimo práctico de 12-16 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs de 16 GB o más (RTX 4080/4090, A100, H100), sin confirmación del autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y modelos de 16 GB, sujeto a verificación.
- Opciones de despliegue: ComfyUI (formato declarado); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este empaquetado int8 concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (kozak23, int8 ComfyUI) | 9B | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA | 9B | no disponible | no disponible | HuggingFace (base) |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA | 9B | no disponible | no disponible | HuggingFace (base) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos base para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación mínima: la model card no aporta detalles de arquitectura, entrenamiento, contexto ni formato de pesos.
- Modelo de nicho: está especializado en reescritura de prompts para MiniMax H3; no es adecuado como modelo de propósito general.
- Solo inglés: no se declara soporte multilingüe.
- Proceso "Heretic" (abliteration): la eliminación de direcciones de rechazo puede degradar la calidad en tareas sensibles y aumentar la probabilidad de generar contenido inapropiado; conviene auditar su comportamiento en producción.
- Cuantización int8 con rotación de pesos: puede introducir degradación respecto al modelo base en precisión; no se documentan evaluaciones comparativas.
- Cero tracción: 0 descargas y 0 likes, sin pipeline declarado; no hay evidencia de la comunidad sobre su funcionamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos base de lightx2v, ya que la licencia del derivado no necesariamente cubre los derechos del modelo original.
- Riesgo de alucinación: no evaluado; al ser un modelo de reescritura, puede introducir elementos no solicitados en los prompts expandidos.

## Enlaces

- HuggingFace: https://huggingface.co/kozak23/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA-REF2VA-Heretic-ARA_int8_convrot-ComfyUI
- Modelo base FL2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA
- Modelo base Ref2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA
