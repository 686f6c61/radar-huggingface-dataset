# malkolm777/zils-lite-decision-v5

## Resumen

zils-lite-decision-v5 es un modelo de decisión de tipo "lite" publicado por el usuario malkolm777 en Hugging Face. Se trata de un fine-tune del modelo base zils-ai/jiwo-0.8b-full, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B según la model card. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), está diseñado para tareas de clasificación y puntuación de decisiones dentro del ecosistema Zils, una plataforma que entrena modelos pequeños para ordenar peticiones, marcar problemas o puntuar coincidencias a partir de ejemplos etiquetados por el usuario.

El modelo se presenta como un "cuerpo de decisión d3-lite" para el pool lite de la subred 127 de Zils. El pipeline declarado en Hugging Face es `feature-extraction`, lo que sugiere que su uso previsto es la extracción de representaciones o la puntuación de elementos más que la generación de texto libre. El fine-tune se realizó con una ronda de LoRA de rango 16 y AdamW con tasa de aprendizaje 5e-5 sobre un conjunto amplio de ítems de decisión procedentes de fuentes públicas con resultados etiquetados.

La relevancia del modelo radica en su enfoque: modelos pequeños y especializados para decisiones binarias o de ranking, entrenados con datos de resultado verificable (reversiones de Wikipedia, anuncios de categorías de arXiv, merges de Gerrit, Stack Exchange, AfC/AfD de Wikipedia). No obstante, la información pública disponible es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-0.8B, según model card) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El autor lo describe como un "cuerpo de decisión d3-lite" y lo deriva del cuerpo lite zils-ai/jiwo-0.8b-full mediante una única ronda de ajuste fino con LoRA de rango 16 y optimizador AdamW con tasa de aprendizaje 5e-5.

El conjunto de entrenamiento se describe como "un conjunto grande y sin límite de ítems de decisión de fuentes públicas con resultados etiquetados", recopilados con la herramienta `zils.current`. Las fuentes citadas son reversiones de Wikipedia, anuncios de categorías de arXiv, merges de Gerrit, Stack Exchange y los procesos AfC/AfD de Wikipedia. No se especifica el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La model card remite a los archivos LICENSE y NOTICE para más detalles, pero no se aportan métricas de entrenamiento ni curvas de pérdida.

## Capacidades

- Puntuación y clasificación de decisiones: el pipeline declarado es `feature-extraction`, orientado a ordenar peticiones, marcar problemas o puntuar coincidencias dentro del flujo de Zils.
- Extracción de representaciones: al ser un modelo de feature-extraction, puede emplearse para obtener embeddings de entrada.
- Aprendizaje a partir de ejemplos: el ecosistema Zils está diseñado para que el usuario muestre ejemplos con la respuesta correcta y el modelo pequeño aprenda a replicar ese criterio.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede puntuar si una edición o un artículo propuesto (AfC) debe aceptarse o rechazarse, dado que se entrenó con datos de reversiones y procesos AfD/AfC de Wikipedia.
- Triaje de anuncios en repositorios científicos: puede clasificar anuncios de categorías de arXiv según su idoneidad o calidad, aprovechando el entrenamiento sobre ese tipo de fuente.
- Priorización de cambios en revisiones de código: entrenado con merges de Gerrit, puede emplearse para puntuar si un cambio propuesto tiene probabilidad de ser aceptado en un flujo de revisión.
- Filtrado de preguntas en foros técnicos: a partir de datos de Stack Exchange, puede ordenar o marcar preguntas según su probabilidad de recibir respuesta o de ser cerradas.
- Enrutamiento de peticiones en aplicaciones: siguiendo el enfoque de Zils, el modelo puede ordenar solicitudes entrantes y dirigirlas al flujo adecuado mostrando ejemplos etiquetados.
- Puntuación de coincidencias en sistemas de recomendación: puede usarse como extractor de características para calcular similitud entre ítems y preferencias del usuario.
- Clasificación binaria de decisiones en pipelines internos: su tamaño reducido (0,85 B) permite desplegarlo en entornos con recursos limitados para tareas de sí/no o de ranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros en safetensors (1,7 GB de repositorio), en fp16 requeriría aproximadamente 1,7 GB de VRAM; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM debería poder cargarlo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, aunque podrían usarse para alto throughput.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 4 GB o más.
- Opciones de despliegue: transformers (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y el tag `custom_code` sugiere que puede requerir código específico del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-decision-v5 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| zils-ai/jiwo-0.8b-full (base) | ~0,8 B (no confirmado) | no disponible | no disponible | Hugging Face |
| malkolm777/zils-lite-decision-v1 | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (familia base) | ~0,8 B (no confirmado) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se basa en fuentes públicas concretas (Wikipedia, arXiv, Gerrit, Stack Exchange), lo que puede introducir sesgos propios de esas comunidades y de sus criterios de aceptación.
- Riesgo de alucinación: al ser un modelo de feature-extraction y decisión, el riesgo se traslada a puntuaciones erróneas o clasificaciones incorrectas, especialmente en dominios alejados de los datos de entrenamiento.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados ni longitud de contexto; no hay garantías de comportamiento multilingüe.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial, pero la model card remite a LICENSE y NOTICE, que no se han podido verificar en la información disponible.
- Caveats para producción: el modelo tiene cero descargas y cero likes, sin benchmarks ni métricas publicadas; el tag `custom_code` implica posible dependencia de código del autor; el pipeline `feature-extraction` no está pensado para generación de texto; y el conjunto de entrenamiento se describe como "sin límite", sin cifras concretas de tokens o ejemplos.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v5
- Modelo base: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Versión anterior del modelo: https://huggingface.co/malkolm777/zils-lite-decision-v1
- Sitio de Zils: https://zils.ai/
