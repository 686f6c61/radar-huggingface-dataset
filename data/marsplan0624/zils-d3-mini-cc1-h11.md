# marsplan0624/zils-d3-mini-cc1-h11

## Resumen

`zils-d3-mini-cc1-h11` es un cuerpo de pesos ("body") publicado por el usuario marsplan0624 dentro del ecosistema Zils, un proyecto de modelos de decisión (`decision-model`) orientado a predecir resultados de preguntas binarias o categóricas. El modelo parte de `Qwen/Qwen3.5-4B` y ha sido ajustado con un LoRA de rango 16 sobre el conjunto de pesos del modelo base, dando como resultado un checkpoint de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) en formato safetensors.

El ajuste se realizó, según la model card, sobre "Zils Outcomes style public decision questions" etiquetadas con resultados reales procedentes de fuentes como reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit. Es decir, no se trata de un modelo conversacional al uso, sino de un componente especializado en emitir decisiones o predicciones sobre resultados verificables.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio tiene cero descargas y cero likes en el momento de la consulta, no incluye capa de respuesta ni código de ejecución, y sus pesos solo son utilizables a través del runtime propietario del pool Zils ("chassis runtime"). El repositorio oficial del pool, `zils-ai/d3-mini-4.5b-v1`, actúa como base de referencia con ficheros fijados por SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parámetros. Sobre ese cuerpo se ha aplicado un LoRA de rango 16 en el dominio del lenguaje, posteriormente fusionado en los pesos, de modo que el checkpoint distribuido no requiere cargar adaptadores adicionales. La model card menciona también que se conservan los pesos completos de lenguaje y visión del modelo base, aunque no se detalla la arquitectura multimodal ni la configuración exacta de capas.

El entrenamiento se centró en tareas de decisión: preguntas públicas con resultado conocido, extraídas de Wikipedia (reversiones y revisiones), arXiv (categorías), Stack Exchange (resultados de preguntas) y Gerrit (merges aceptados o rechazados). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de decisiones sobre preguntas con resultado verificable (estilo "Zils Outcomes").
- Clasificación y juicio sobre resultados de revisiones, merges, categorizaciones y votaciones.
- Aprovecha los pesos de lenguaje y visión heredados de Qwen/Qwen3.5-4B, aunque no se documenta el alcance efectivo de las capacidades multimodales tras el ajuste.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo puede evaluar si una edición o revisión tiene probabilidad de ser revertida, entrenado precisamente con reversiones de Wikipedia, lo que permite priorizar revisiones humanas.
- Triaje de pull requests y merges en Gerrit: dado un cambio, emitir un juicio sobre su probabilidad de aceptación, útil para colas de revisión en proyectos grandes.
- Clasificación temática de preprints: asignar categorías de arXiv a nuevos envíos, aprovechando el entrenamiento sobre categorizaciones reales.
- Priorización de preguntas en plataformas tipo Stack Exchange: estimar si una pregunta será bien recibida, cerrada o respondida, para orientar a los usuarios antes de publicar.
- Señal auxiliar en sistemas de reputación: integrar la predicción del modelo como una característica más en un pipeline de scoring de contribuciones.
- Evaluación de decisiones en entornos controlados de investigación: usar el modelo como baseline para estudiar sesgos y calibración en predicciones de resultados, siempre que se disponga del runtime del pool Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9 GB solo para pesos (el repositorio ocupa 9,1 GB), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones teóricas, ya que el autor no distribuye cuantizaciones).
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16 con contexto amplio; una RTX 4090 (24 GB) es suficiente para FP16 en inferencia de un solo usuario.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y GPUs con 12 GB o más si se cuantiza.
- Opciones de despliegue: el autor indica que los pesos solo son utilizables mediante el runtime fijado del pool Zils; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-d3-mini-cc1-h11 | 4,54 B | no disponible | Apache-2.0 | Repo con 0 descargas; requiere runtime Zils | Fine-tune de decisión sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible en esta ficha | Modelo base público en Hugging Face | Base del fine-tune; uso general |
| zils-ai/d3-mini-4.5b-v1 | ~4,5 B | no disponible | Apache-2.0 | Repo oficial del pool Zils | Referencia con ficheros fijados por SHA-256 |

No se dispone de datos de rendimiento comparado entre estas opciones.

## Limitaciones y advertencias

- El repositorio no incluye capa de respuesta ni código de ejecución: los pesos son inutilizables sin el "chassis runtime" del pool Zils, lo que limita la portabilidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- El modelo está especializado en decisiones sobre dominios concretos (Wikipedia, arXiv, Stack Exchange, Gerrit); su comportamiento fuera de esos dominios es incierto.
- No se documentan sesgos conocidos, pero el entrenamiento sobre resultados históricos de plataformas puede heredar sesgos de moderación y de comunidad de esas fuentes.
- Riesgo de alucinación no evaluado; no hay benchmarks publicados que permitan estimarlo.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equivalente al del modelo base.
- Aunque la licencia declarada es Apache-2.0, conviene verificar las condiciones del runtime del pool Zils, que no se detallan en esta información.
- Fecha de creación del repositorio: 2026-11-06, con actualización el mismo día; se trata de una publicación muy reciente y sin histórico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/marsplan0624/zils-d3-mini-cc1-h11
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio oficial del pool Zils: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
