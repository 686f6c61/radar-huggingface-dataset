# marsplan0624/zils-d3-lite-cc1-h16

## Resumen

d3-lite body cc1-h16 es un "cuerpo" (body) de modelo de decisión publicado por el usuario marsplan0624 dentro del ecosistema Zils. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-0.8B, con aproximadamente 853 millones de parámetros, en el que se ha fusionado un LoRA de lenguaje de rango 16 sobre los pesos completos de lenguaje y visión. El entrenamiento se realizó con preguntas de decisión públicas etiquetadas con resultados reales (reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit), siguiendo el estilo de "Zils Outcomes".

El modelo no es un asistente conversacional autónomo: según la model card, los pesos solo son utilizables a través del runtime fijado ("pinned chassis runtime") del pool d3-lite, y el repositorio no incluye capa de respuesta ni código de ejecución. Es, por tanto, un componente intermedio pensado para integrarse en el pipeline propietario de Zils, que entrena modelos pequeños para clasificar peticiones, marcar problemas o puntuar coincidencias a partir de ejemplos etiquetados.

Su relevancia es acotada: se publica bajo licencia Apache 2.0 y formato safetensors, pero con cero descargas y sin pipeline declarado, lo que sugiere un artefacto de investigación o de uso interno más que un modelo listo para producción general. La información pública disponible es muy limitada y muchos datos técnicos no están especificados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); no se detalla en la model card |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y conserva su disposición de pesos ("layout"), incluyendo los pesos completos de lenguaje y visión del fine-tune. Sobre esa base se entrenó con un LoRA de lenguaje de rango 16 que posteriormente se fusionó en los pesos, de modo que el artefacto publicado son pesos densos estándar en safetensors, no un adaptador separado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El dominio de entrenamiento es la predicción de resultados de decisión: preguntas públicas etiquetadas con desenlaces reales procedentes de reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit. Este enfoque se alinea con la propuesta de Zils de entrenar modelos pequeños a partir de ejemplos con la respuesta correcta para ordenar peticiones, señalar problemas o puntuar coincidencias. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Modelo de decisión: puntuación y clasificación de resultados probables a partir de ejemplos etiquetados, no generación conversacional abierta.
- Procesamiento de lenguaje y visión: la model card indica que se incluyen los pesos completos de lenguaje y visión del fine-tune.
- Entrenado sobre desenlaces reales de dominios concretos (Wikipedia, arXiv, Stack Exchange, Gerrit), lo que orienta su uso a tareas de moderación, categorización y merge/descarte.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede puntuar si una edición será revertida, entrenado precisamente con reversiones y revisiones de Wikipedia, lo que permite priorizar revisiones humanas.
- Clasificación temática de preprints: asignación de categorías de arXiv a nuevos envíos, aprovechando que el entrenamiento usó categorías reales como señal de resultado.
- Triage de preguntas en comunidades técnicas: estimar si una pregunta de Stack Exchange recibirá respuesta aceptada o será cerrada, para enrutarla o sugerir mejoras.
- Predicción de merges en revisión de código: dado un cambio en Gerrit, estimar la probabilidad de que se fusione, útil como señal auxiliar en pipelines de CI.
- Ordenación de solicitudes en aplicaciones: siguiendo el caso de uso declarado por Zils, ordenar peticiones entrantes o marcar problemas antes de que lleguen a un operador humano.
- Puntuación de coincidencias en sistemas de recomendación o matching: usar el modelo como scorer dentro de un pipeline propio, siempre a través del runtime del pool d3-lite.
- Investigación sobre modelos de decisión pequeños: servir como punto de partida reproducible (Apache 2.0, safetensors) para experimentos de fine-tune con LoRA de rango 16 sobre bases de 0,8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 millones de parámetros, en fp16/bf16 los pesos ocupan aproximadamente 1,7 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder cargar los pesos en cuantización de 4 u 8 bits; para fp16 se recomiendan 6-8 GB. GPUs de datacenter como A100 o H100 son innecesarias por tamaño, aunque pueden usarse para procesamiento por lotes.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la model card restringe el uso de los pesos al runtime fijado del pool d3-lite; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el repositorio no incluye código de ejecución.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| d3-lite body cc1-h16 | 852.985.920 | no disponible | Apache 2.0 | Pesos en HF, solo vía runtime del pool d3-lite |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible en la informacion | Modelo base público en Hugging Face |
| Otros modelos de decisión de Zils | no disponible | no disponible | no disponible | Org zils-ai en Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los pesos solo son utilizables a través del runtime fijado del pool d3-lite; el repositorio no incluye capa de respuesta ni código, por lo que no es un modelo autónomo listo para servir.
- No se declaran idiomas soportados; el entrenamiento se basa en fuentes mayoritariamente en inglés (Wikipedia, arXiv, Stack Exchange, Gerrit), lo que probablemente limita su comportamiento en castellano.
- Riesgo de alucinación y de sobreajuste a los dominios de entrenamiento: las predicciones de resultado pueden no generalizar a otros contextos de decisión.
- Sesgos conocidos: no documentados por el autor; los datasets de origen (Wikipedia, Stack Exchange, Gerrit) incorporan sus propios sesgos de comunidad y de moderación.
- Sin benchmarks publicados, cero descargas y cero likes: no hay evidencia pública de calidad ni de validación externa.
- Aunque la licencia es Apache 2.0, la restricción práctica de uso al runtime del pool condiciona cualquier despliegue comercial fuera de ese ecosistema.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados, lo que dificulta planificar integraciones en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marsplan0624/zils-d3-lite-cc1-h16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio de Zils: https://zils.ai/
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai
