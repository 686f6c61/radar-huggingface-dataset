# Charlie320/zils-mini-nos2

## Resumen

zils-mini-nos2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario Charlie320 en Hugging Face. Forma parte del ecosistema "Zils" (`d3-mini`), un conjunto de modelos tipo "soup" orientados a la toma de decisiones y evaluados en la subred Bittensor 127. El modelo se distribuye con licencia Apache-2.0 y pesos en formato safetensors con precisión BF16.

El modelo se construye en dos fases: primero se calcula la media uniforme de los pesos de tres "cuerpos" previos (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), y después se aplican dos ejecuciones de LoRA de rango 64 (con anchor 0.1 y learning rate 5e-5, semillas distintas) que se fusionan sobre ese punto de partida. El resultado es un modelo de aproximadamente 4.540 millones de parámetros.

La relevancia del modelo es acotada: se trata de un artefacto de investigación dentro de un pool de "soup" para evaluación de decisiones, no de un modelo de propósito general con benchmarks publicados. La model card es explícita sobre el origen de los datos de entrenamiento y sobre las restricciones de uso, lo que lo hace interesante para estudiar técnicas de model soup y ajuste LoRA, pero no para despliegues de producción sin una evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); incluye "vision tower" heredada del modelo padre |
| Parámetros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles (los datos de entrenamiento incluyen Wikipedia en 9 idiomas, pero no se declara un listado de idiomas soportados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de Qwen/Qwen3.5-4B y conserva la torre de visión del modelo padre, por lo que mantiene capacidad multimodal de entrada según la model card ("vision tower from the parent"). Sobre esa base se aplica una técnica de *model soup*: el punto de partida es la media uniforme de los pesos de tres cuerpos del pool `d3-mini` del 14 de noviembre de 2026, todos ellos bajo Apache-2.0.

Sobre ese promedio se ejecutan dos ajustes LoRA de rango 64 con `anchor 0.1`, `lr 5e-5` y semillas distintas, cada uno fusionado en el punto de partida; el cuerpo final es la media uniforme de ambos resultados. Los datos de entrenamiento consisten en aproximadamente 24.500 registros públicos de decisiones con resultado conocido, recogidos con el constructor público "Zils Outcomes" (zils.current, sin modificar) a partir de eventos liquidados antes del 28 de octubre de 2026. Las fuentes incluyen resultados de revisión de código (fusionado o abandonado) de los hosts Gerrit públicos de Android (AOSP), Wikimedia y OpenStack (OpenDev); resultados de reversión de ediciones en Wikipedia (9 idiomas) y Wikidata; resultados de revisión de Articles for Creation de Wikipedia en inglés; y etiquetas de categoría primaria de arXiv. Se realizaron dos pasadas sobre estos datos. No se usaron ítems de exámenes de validadores, ítems de exámenes semilla públicos ni datos de clientes.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-4B (no verificados de forma independiente en esta ficha).
- Procesamiento de entrada visual mediante la torre de visión heredada del modelo padre.
- Modelado de decisiones con resultado conocido: el ajuste se orienta a tareas de clasificación/predicción de desenlaces (revisión de código, reversión de ediciones, aceptación de artículos, categorización de arXiv).
- Capacidades multilingües parciales derivadas del entrenamiento con Wikipedia en 9 idiomas (no se especifica cuáles).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre model soup y LoRA: el modelo sirve como caso de estudio reproducible de promediado de pesos y fusión de adaptadores de rango 64 sobre una base de 4B, útil para experimentos académicos sobre estas técnicas.
- Evaluación en la subred Bittensor 127: el modelo está diseñado como "body" puntuable en las rondas del pool `d3-mini`, por lo que su uso natural es la participación en dicha evaluación.
- Predicción de resultados de revisión de código: dado el entrenamiento con desenlaces de Gerrit (AOSP, Wikimedia, OpenDev), puede emplearse para estimar la probabilidad de que un cambio se fusione o se abandone en flujos de revisión similares.
- Detección de riesgo de reversión de ediciones: los datos de Wikipedia y Wikidata permiten usarlo como señal auxiliar para priorizar revisiones de ediciones con alta probabilidad de ser revertidas.
- Clasificación de categoría primaria en preprints: el ajuste con etiquetas de arXiv permite experimentar con la asignación automática de categorías a nuevos envíos.
- Filtrado previo en pipelines de moderación de contenido colaborativo: como clasificador auxiliar de bajo coste (4,5B en BF16) para triar ediciones o cambios antes de la revisión humana.
- Base para nuevos fine-tunes del ecosistema Zils: al ser un "body" intermedio, puede servir como punto de partida para futuras rondas del pool.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4,54B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, del orden de 11-14 GB según longitud de contexto.
- Cuantización a 8 bits: aproximadamente 4,5-5 GB de pesos; a 4 bits: aproximadamente 2,3-3 GB (estimaciones, no documentadas por el autor).
- GPU recomendadas: A100, H100 o L40S para BF16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070/4060.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (estas dos últimas requieren conversión a GGUF, no publicada); Transformers con safetensors es la vía directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-nos2 | ≈4,54B | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune especializado en decisiones; sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ≈4B | No disponible en esta ficha | Según el modelo original | Hugging Face | Modelo generalista del que deriva; capacidades más amplias y documentadas |
| Zayaan/zils-mini-hm4 | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo previo del mismo pool, usado como componente del soup |
| qhoenix/zils-mini-decision-t2avg | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo previo del mismo pool, orientado a decisiones |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo está especializado en desenlaces de dominios muy concretos (Gerrit, Wikipedia/Wikidata, arXiv); su generalización fuera de ellos es dudosa.
- Riesgo de alucinación inherente a los modelos de 4B, agravado por la ausencia de datos de alineación documentados (no se menciona RLHF/DPO).
- Sesgos potenciales derivados de los datos: comunidades de revisión de código y de Wikipedia con sesgos demográficos y de idioma conocidos; solo 9 idiomas en Wikipedia y predominio del inglés en arXiv.
- La model card advierte que los textos de Wikipedia y Wikidata son CC BY-SA 4.0 y que el resto de textos mantienen los términos de sus autores; aunque los pesos son Apache-2.0, la reutilización debe revisar las condiciones de los datasets de origen.
- El repositorio contiene solo pesos; no se incluyen tokenizador, configuración de generación ni instrucciones de uso más allá de la model card.
- Fecha de creación declarada en 2026-11-14, posterior a la fecha de esta ficha; conviene verificar la integridad y procedencia del artefacto antes de usarlo.
- No se declara soporte de tool calling ni de agentes; no asumir estas capacidades sin validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-nos2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo previo 1: https://huggingface.co/Zayaan/zils-mini-hm4
- Cuerpo previo 2: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Cuerpo previo 3: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Constructor de datos "Zils Outcomes" (zils.current): no disponible como enlace en la información proporcionada
- Subred Bittensor 127: no disponible como enlace en la información proporcionada
