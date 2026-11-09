# malkolm777/zils-lite-decision-v4

## Resumen

zils-lite-decision-v4 es un modelo de decisión de tipo "lite" desarrollado por el usuario malkolm777 para el pool lite de la subred 127 de Zils. Se trata de un fine-tune del modelo base Maincode/Matilda-Decision-v1-Edge, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB. El modelo se distribuye bajo licencia Apache-2.0 y está etiquetado para la tarea de extracción de características (feature-extraction) dentro del ecosistema transformers.

El modelo resuelve el problema de clasificación y puntuación de decisiones binarias o etiquetadas: dado un par de elementos (por ejemplo, una edición de Wikipedia y su resultado, o un anuncio de categoría en arXiv), el modelo produce una señal de decisión. Zils lo presenta como una herramienta para que las aplicaciones ordenen solicitudes, marquen problemas o puntúen coincidencias mediante ejemplos etiquetados, entrenando un modelo pequeño que se ejecuta localmente.

La relevancia actual del modelo radica en su tamaño reducido (menos de mil millones de parámetros) y su enfoque en tareas de decisión, lo que permite desplegarlo en entornos con recursos limitados. Sin embargo, la información pública disponible es escasa: no se han publicado resultados de benchmarks, idiomas soportados ni detalles completos sobre el conjunto de entrenamiento más allá de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de la familia Qwen/Qwen3.5-0.8B, según indica la model card. Se trata de un fine-tune del modelo Maincode/Matilda-Decision-v1-Edge (Apache-2.0), que actúa como "cuerpo" base. El entrenamiento consistió en una ronda de LoRA con rango 16 y optimizador AdamW con tasa de aprendizaje 5e-5, aplicada sobre un conjunto de datos "más grande y sin límite" de elementos de decisión provenientes de fuentes públicas con resultados etiquetados.

Las fuentes de datos de entrenamiento, según la model card, incluyen reversiones de Wikipedia, anuncios de categorías de arXiv, fusiones de Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia. Estas fuentes aportan ejemplos etiquetados de decisiones (aceptar/rechazar, fusionar/no fusionar, revertir/no revertir) que el modelo aprende a puntuar. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el uso de LoRA de bajo rango para adaptar un modelo base pequeño a una tarea de decisión específica, manteniendo el coste computacional bajo.

## Capacidades

- Clasificación y puntuación de decisiones binarias o etiquetadas: el modelo está diseñado para emitir una señal de decisión ante pares de elementos (por ejemplo, una edición y su resultado).
- Extracción de características: la pipeline declarada es feature-extraction, lo que sugiere que el modelo puede generar representaciones vectoriales útiles para tareas posteriores de clasificación o similitud.
- Procesamiento de texto en el contexto de decisiones: entrenado sobre textos de Wikipedia, arXiv, Gerrit y Stack Exchange, por lo que maneja contenido técnico y enciclopédico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Moderación de contenido en plataformas colaborativas: el modelo puede puntuar ediciones o contribuciones (por ejemplo, en wikis) para priorizar revisiones humanas, aprovechando su entrenamiento con reversiones de Wikipedia y procesos AfC/AfD.
- Filtrado de anuncios en repositorios científicos: dado un anuncio de categoría en arXiv, el modelo puede asignar una puntuación de relevancia o corrección, ayudando a los moderadores a detectar envíos mal clasificados.
- Priorización de fusiones de código en Gerrit: el modelo puede evaluar solicitudes de fusión (merges) y estimar la probabilidad de aceptación, integrándose en flujos de revisión de código.
- Clasificación de preguntas y respuestas en Stack Exchange: puede puntuar la calidad o pertinencia de publicaciones, ayudando a los curadores a identificar contenido de baja calidad.
- Sistemas de recomendación basados en decisiones: al generar representaciones (feature-extraction), el modelo puede alimentar un motor de similitud para sugerir elementos relacionados con decisiones pasadas.
- Automatización de triaje en atención al cliente: aunque no se especifican idiomas, el modelo puede adaptarse para clasificar solicitudes entrantes según ejemplos etiquetados, siempre que se realice un fine-tune adicional con datos del dominio.
- Investigación en modelos de decisión: sirve como base para experimentos de aprendizaje por refuerzo o ajuste fino en tareas de decisión, dado su tamaño reducido y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 852 millones de parámetros, en precisión FP16 requiere aproximadamente 1,7 GB de VRAM solo para los pesos, más memoria para activaciones y contexto (estimación típica de 2-3 GB en total). En cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para mayor velocidad, se recomiendan RTX 3090, RTX 4090, A100 o H100, aunque el modelo es lo suficientemente pequeño para no requerir hardware de gama alta.
- ¿Cabe en GPU consumer? Sí, en la mayoría de GPU consumer modernas con 4 GB o más de VRAM, especialmente en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM, llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repositorio). También es compatible con endpoints de Hugging Face (tag endpoints_compatible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-decision-v4 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face |
| Maincode/Matilda-Decision-v1-Edge (modelo base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (familia base) | ~0,8B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, el modelo puede heredar sesgos presentes en esas comunidades (por ejemplo, sesgos de género, geográficos o de temática).
- Riesgo de alucinación: como modelo de lenguaje, puede generar decisiones o puntuaciones inconsistentes ante entradas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto; se desconoce si funciona correctamente en castellano u otros idiomas distintos del inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE. El modelo base también es Apache-2.0, lo que facilita la redistribución.
- Caveats para producción: el modelo tiene 0 descargas y 1 like en Hugging Face, lo que indica ausencia de validación comunitaria. No se han publicado benchmarks ni evaluaciones independientes. La model card es escueta y no detalla el conjunto de datos exacto ni el proceso de evaluación. Se recomienda realizar una evaluación exhaustiva en el dominio objetivo antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v4
- Modelo base: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Sitio web de Zils: https://zils.ai/
- Página del modelo de decisión de Zils: https://zils.ai/model
- Familia Qwen3.5-0.8B: no disponible (no se proporciona enlace directo en la información)
