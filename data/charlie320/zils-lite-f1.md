# Charlie320/zils-lite-f1

## Resumen

zils-lite-f1 es un fine-tune de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face. Se trata de un "body" (cuerpo) destinado al pool de soups `d3-lite` de Zils, un sistema asociado al subnet 127 de Bittensor. El modelo parte de una media uniforme de pesos (soup) de dos fine-tunes previos, `1lock/zils-lite-astrid-g1` y `bmars8218/zils-lite-body-2`, ambos con licencia Apache-2.0, y sobre esa base se entrenaron cuatro fine-tunes adicionales cuyos pesos se promediaron de nuevo.

El modelo tiene 852.985.920 parámetros en formato safetensors (BF16), lo que lo sitúa en la categoría de modelos pequeños de menos de mil millones de parámetros. Su propósito declarado es actuar como "decision-model": un modelo entrenado para resolver ítems de decisión en formato de examen, presumiblemente para tareas de evaluación o selección dentro del ecosistema Zils. La model card indica que conserva la torre de visión del modelo padre y que se entrenaron los pesos de lenguaje.

La relevancia de esta ficha es limitada por la escasez de información pública: no hay datos de benchmarks, no se especifican idiomas soportados, no hay pipeline declarado y el repositorio no tiene descargas ni likes en el momento de la consulta. Se trata, por tanto, de un artefacto de investigación dentro de un ecosistema muy específico (Bittensor/Zils) más que de un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); incluye torre de visión heredada del padre |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros. El modelo conserva la torre de visión del modelo padre, según indica la model card, y se han entrenado los pesos de las capas de lenguaje. El layout se describe como "chassis layout", un término propio del ecosistema Zils que no se detalla en la información disponible.

El proceso de entrenamiento es un pipeline de weight soup en dos etapas. Primero se calculó la media uniforme de pesos de `1lock/zils-lite-astrid-g1` (revisión ac979f3d) y `bmars8218/zils-lite-body-2` (revisión 60b596b3), dando lugar al soup `d3-lite` de la ronda d3-lite-2026-11-06. Sobre ese punto de partida se entrenaron cuatro fine-tunes independientes: dos fine-tunes completos de todas las capas de lenguaje (lr 4e-6, schedule coseno, unas 200.000 filas cada uno, con pérdida de entropía cruzada más Brier y un ancla KL al modelo inicial sobre 40.000 filas amplias) y dos ejecuciones LoRA de una época (rango 32, alpha 64, lr 1e-4, fusionadas) sobre 4.100 ítems en formato de examen. Los pesos de los cuatro fine-tunes se promediaron uniformemente para producir el modelo final. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor "relay" público de Zils. No se usaron ítems de examen del validador ni ítems semilla públicos.

## Capacidades

- Generación de texto y razonamiento sobre ítems de decisión en formato de examen, que es la tarea declarada del modelo.
- Clasificación o selección de opciones en preguntas tipo test, dado el entrenamiento con pérdida Brier y datos en formato de examen.
- Procesamiento de imágenes mediante la torre de visión heredada del modelo padre (la model card no detalla el alcance de esta capacidad).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automatizada de ítems tipo test: el modelo está entrenado específicamente con pérdida Brier y datos en formato de examen, por lo que puede emplearse para puntuar o clasificar opciones de respuesta en bancos de preguntas de decisión.
- Investigación sobre weight soups y merging de modelos: el repositorio documenta con precisión el pipeline de promediado (dos soups encadenados, fine-tunes completos más LoRA fusionadas), lo que lo convierte en un caso de estudio reproducible para experimentos de model merging.
- Participación en el ecosistema Bittensor subnet 127: el modelo está diseñado como "body" para el pool de soups `d3-lite`, de modo que su uso natural es alimentar ese pool o servir como candidato en rondas de evaluación del subnet.
- Generación de datos sintéticos de examen: dado que se entrenó con la receta pública `scripts/author_exam.py`, puede usarse como generador o filtro de ítems de decisión en pipelines de aumento de datos, siempre que se respeten los términos de los datasets de origen.
- Prototipado de bajo coste en hardware consumer: con menos de 1.000 millones de parámetros en BF16 (aproximadamente 1,7 GB de pesos), cabe en GPUs de gama media y permite experimentar con fine-tuning y evaluación sin infraestructura dedicada.
- Clasificación de texto con incertidumbre calibrada: el uso de pérdida Brier junto con entropía cruzada sugiere que el modelo produce puntuaciones de probabilidad mejor calibradas que un fine-tune estándar, útil en tareas donde importa la confianza de la predicción y no solo la etiqueta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en contextos moderados; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para este tamaño las consumer son suficientes.
- Cabe en GPU consumer: sí, con holgura, en tarjetas de 6 GB o más; en 4 bits cabría incluso en iGPU con memoria unificada.
- Opciones de despliegue: no hay confirmación del autor sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un modelo basado en Qwen3.5 y publicado en safetensors, es probable que sea convertible a GGUF, pero este dato no está verificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-f1 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune de Qwen3.5-0.8B con weight soup en dos etapas; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en la información proporcionada | Modelo base del que deriva; referencia obligada para comparar el efecto del fine-tune |
| 1lock/zils-lite-astrid-g1 | no disponible | no disponible | Apache-2.0 | Uno de los dos modelos promediados en el soup inicial |
| bmars8218/zils-lite-body-2 | no disponible | no disponible | Apache-2.0 | El otro modelo promediado en el soup inicial |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que permitan evaluar la calidad del modelo frente a su base o alternativas.
- Sesgos conocidos: no documentados por el autor; al entrenarse con datos generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esos generadores.
- Riesgo de alucinación: no cuantificado; en modelos de menos de mil millones de parámetros el riesgo es estructuralmente alto en tareas abiertas.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento fuera del inglés o de la tarea de examen.
- Restricciones de licencia: los pesos son Apache-2.0, pero la model card advierte explícitamente de que los datasets de origen deben consultarse antes de reutilizar el modelo, y que el repositorio contiene solo pesos.
- Procedencia de los datos: se usaron únicamente splits públicos de entrenamiento y no ítems del validador ni semillas públicas, pero la generación con modelos externos (Claude Opus) puede estar sujeta a los términos de uso de dichos proveedores.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-06), sin pipeline declarado; no es un artefacto validado para producción.
- Especificidad del dominio: el entrenamiento está orientado a ítems de decisión en formato de examen dentro del ecosistema Zils; su rendimiento en tareas generales de generación o código no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-f1
- Perfil del autor: https://huggingface.co/Charlie320/models
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo promediado 1: https://huggingface.co/1lock/zils-lite-astrid-g1
- Modelo promediado 2: https://huggingface.co/bmars8218/zils-lite-body-2
