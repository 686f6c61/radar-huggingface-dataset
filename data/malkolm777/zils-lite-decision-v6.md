# malkolm777/zils-lite-decision-v6

## Resumen

zils-lite-decision-v6 es un modelo de decisión de tipo "lite" desarrollado por el usuario malkolm777 para el pool lite de la subnet 127 de Zils. Se trata de un fine-tune del modelo base internlm/Intern-Decision-0.8B, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B según la model card. El modelo está diseñado para tareas de extracción de características y clasificación de decisiones sobre elementos con etiquetas de resultado (reverts de Wikipedia, anuncios de categoría de arXiv, merges de Gerrit, publicaciones de Stack Exchange y procesos AfC/AfD de Wikipedia).

Con 852.985.920 parámetros reales (según los pesos en safetensors) y un tamaño de repositorio de 1,7 GB, el modelo se posiciona en la gama de modelos pequeños, adecuado para despliegues con requisitos de hardware modestos. El entrenamiento consistió en una única ronda de LoRA con rango 16 y optimizador AdamW con tasa de aprendizaje 5e-5 sobre un conjunto amplio y sin límite de elementos de decisión procedentes de fuentes públicas con etiquetas de resultado.

La relevancia de este modelo radica en su especialización: no es un modelo de propósito general, sino un componente de decisión entrenado para evaluar resultados en dominios concretos (moderación de contenido, revisión de código, clasificación de contribuciones). Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque su naturaleza de fine-tune experimental y la ausencia de benchmarks publicados limitan su adopción en producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-0.8B, según model card) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la familia Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros. Según la model card, el fine-tune se realizó desde el modelo base internlm/Intern-Decision-0.8B, que actúa como "cuerpo lite" de referencia. El entrenamiento consistió en una única ronda de LoRA con rango 16 y optimizador AdamW con tasa de aprendizaje 5e-5, lo que indica un ajuste eficiente en parámetros y un coste computacional reducido.

Los datos de entrenamiento provienen de un conjunto "amplio y sin límite" de elementos de decisión con etiquetas de resultado, recopilados mediante la herramienta zils.current. Las fuentes incluyen reverts de Wikipedia, anuncios de categoría de arXiv, merges de Gerrit, publicaciones de Stack Exchange y procesos AfC/AfD de Wikipedia. No se especifica el número total de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la especialización en tareas de decisión binaria o multiclase sobre contenido generado por usuarios, aunque no se detallan mecanismos técnicos adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características y representaciones latentes para tareas de clasificación y decisión.
- Evaluación de resultados en dominios concretos: moderación de contenido (reverts de Wikipedia), clasificación de anuncios científicos (arXiv), revisión de cambios de código (Gerrit), calidad de respuestas (Stack Exchange) y admisión de artículos (AfC/AfD).
- Modelo de decisión especializado, no orientado a generación de texto libre ni a razonamiento general.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de contribuciones en plataformas colaborativas: el modelo puede clasificar si una edición o publicación debe revertirse, entrenado específicamente con reverts de Wikipedia y procesos AfD/AfC, lo que permite integrarlo en flujos de revisión automatizada.
- Clasificación de anuncios científicos: dado un resumen o metadatos de un artículo, el modelo puede predecir la categoría arXiv adecuada, útil para pipelines de ingestión de preprints.
- Revisión de cambios en repositorios de código: entrenado con merges de Gerrit, puede evaluar si un cambio propuesto tiene probabilidad de ser aceptado o rechazado, integrándose en sistemas de CI/CD como filtro previo.
- Evaluación de calidad de respuestas en foros técnicos: basado en datos de Stack Exchange, puede puntuar la probabilidad de que una respuesta sea aceptada o votada positivamente, útil para sistemas de recomendación de contenido.
- Filtrado de contenido en comunidades online: puede usarse como clasificador binario para detectar contribuciones problemáticas o de baja calidad antes de su publicación.
- Investigación en modelos de decisión: al ser un fine-tune LoRA de bajo rango sobre un modelo base pequeño, sirve como referencia para estudiar el efecto de la especialización en tareas de decisión con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~853 millones de parámetros, en precisión FP16 requiere aproximadamente 1,7 GB de VRAM; en cuantización de 8 bits, ~0,9 GB; en 4 bits, ~0,5 GB (estimaciones teóricas basadas en el tamaño de los pesos, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede alojar el modelo en cuantización; para FP16 se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería indicada en la model card), potencialmente vLLM, llama.cpp u Ollama si se generan pesos GGUF (no confirmado). El tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-decision-v6 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face |
| internlm/Intern-Decision-0.8B (base) | ~0,8B (no confirmado) | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (familia base) | ~0,8B (no confirmado) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y licencia; no se han publicado benchmarks que permitan evaluar diferencias de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar sesgos de esas comunidades (por ejemplo, sesgos de género, geográficos o de disciplina).
- Riesgo de alucinación: al ser un modelo de decisión y extracción de características, el riesgo de alucinación en generación de texto es bajo, pero puede producir clasificaciones erróneas o sobreconfiadas en dominios no representados en el entrenamiento.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; la ausencia de esta información impide garantizar un rendimiento adecuado en contextos largos o en idiomas distintos del inglés (las fuentes de datos son mayoritariamente anglófonas).
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y distribución, siempre que se incluya el aviso de copyright y la licencia. No se especifican restricciones adicionales en la model card.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad. No se han publicado benchmarks ni evaluaciones independientes. El tag "custom_code" sugiere que requiere código personalizado para su uso, lo que puede complicar la integración. La model card es escueta y no documenta el proceso de evaluación ni los límites del modelo. Se recomienda una validación exhaustiva antes de cualquier despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v6
- Modelo base: https://huggingface.co/internlm/Intern-Decision-0.8B
- Familia Qwen3.5-0.8B (referencia): https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
