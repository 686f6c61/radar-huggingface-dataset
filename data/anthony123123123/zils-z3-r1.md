# Anthony123123123/zils-z3-r1

## Resumen

zils-z3-r1 es un modelo de extracción de características (feature-extraction) publicado por el usuario Anthony123123123 en Hugging Face. Se trata de un "soup body" del linaje Zils `d3`: un fine-tune de `vllm-sr/d3-ultra`, cuyo modelo padre declarado es `Qwen/Qwen3.8-27B`. El modelo conserva la torre de visión original del chasis sin modificar y solo entrena las capas de lenguaje mediante LoRA (r=16, alpha=32), fusionadas en FP32 y almacenadas en BF16.

El modelo cuenta con 26.085.330.160 parámetros totales según los pesos en safetensors, con un repositorio de 52,2 GB. Está etiquetado con la arquitectura `qwen3_5` y requiere `custom_code` para su carga, lo que implica dependencias específicas más allá de transformers estándar. La licencia es Apache 2.0.

La relevancia de este modelo es limitada en el ecosistema general: no registra descargas ni interacciones, la model card está incompleta (los hiperparámetros de entrenamiento aparecen como `None` o `?`), y el pipeline declarado es feature-extraction, no generación de texto. Resulta útil como artefacto de investigación sobre el linaje Zils y los métodos de "model soup", pero no como modelo de producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag de Hugging Face) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), requiere custom_code |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `qwen3_5`, lo que sugiere una variante de la familia Qwen 3.5, con torre de visión integrada (el modelo base `vllm-sr/d3-ultra` deriva de `Qwen/Qwen3.8-27B`). El entrenamiento se realizó exclusivamente sobre las capas de lenguaje mediante LoRA con r=16 y alpha=32, fusionado en FP32 y almacenado en BF16; la torre de visión permanece intacta respecto al chasis original. El modelo requiere `custom_code`, por lo que la carga no es directa con transformers estándar.

Los datos de entrenamiento se describen de forma vaga: "? decision examples" resueltos a partir de eventos del mundo real (reversiones de ediciones en Wikipedia/Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange, categorías de arXiv), recolectados con las herramientas públicas Zils Outcomes en periodos anteriores a cualquier ventana de evaluación, mezclados con splits de entrenamiento de datasets públicos etiquetados. No se usaron splits de validación ni de test. Los hiperparámetros clave (learning rate, epochs, peso Brier, semilla) aparecen como `None`, por lo que no es posible reproducir el entrenamiento ni evaluar su rigor.

## Capacidades

- Extracción de características (pipeline declarado en Hugging Face): el modelo está orientado a producir representaciones, no a generación de texto libre.
- Procesamiento multimodal potencial: conserva la torre de visión del chasis Qwen3.8-27B, aunque no se documenta su uso en la model card.
- Razonamiento y decisión sobre eventos del mundo real: el entrenamiento se orienta a ejemplos de decisión resueltos (reversiones, revisiones, resultados de preguntas).
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre model soups y linajes Zils: el modelo sirve como artefacto para estudiar cómo se comporta un fine-tune LoRA fusionado sobre un chasis multimodal, comparando las capas de lenguaje entrenadas frente a la torre de visión intacta.
- Extracción de embeddings para clasificación de decisiones: dado el pipeline feature-extraction, puede emplearse para generar representaciones de textos de revisión (p. ej., comentarios de Gerrit o preguntas de Stack Exchange) y alimentar clasificadores downstream.
- Evaluación de sesgos en decisiones comunitarias: los datos de entrenamiento incluyen reversiones de Wikipedia y revisiones de Articles for Creation, por lo que el modelo puede usarse para analizar patrones de decisión en entornos colaborativos, siempre con validación humana.
- Prototipado de sistemas de moderación asistida: las representaciones del modelo podrían emplearse como señal auxiliar en pipelines de revisión de contenido, aunque sin garantías de calidad al no haber benchmarks publicados.
- Estudio de reproducibilidad en fine-tuning: al documentarse hiperparámetros como `None`, el modelo es un caso de análisis sobre prácticas de publicación y trazabilidad en Hugging Face.
- Base para experimentos de destilación o adaptación: al conservar la torre de visión y las capas de lenguaje, puede servir como punto de partida para nuevos fine-tunes en investigación, con la cautela de requerir `custom_code`.
- No recomendado para producción: la ausencia de benchmarks, validación y documentación de idiomas desaconseja su uso en sistemas comerciales sin una evaluación exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) para inferencia cómoda.
- Cuantización: no se documentan pesos GGUF ni otras cuantizaciones; en FP16/BF16 no cabe en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) sin técnicas de offloading o sharding.
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples GPUs con tensor parallelism (p. ej., 2× RTX 4090 con cuantización agresiva no documentada).
- Opciones de despliegue: no disponible; el modelo requiere `custom_code`, por lo que vLLM, llama.cpp, Ollama o TGI no están garantizados sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| zils-z3-r1 | 26,1B | no disponible | apache-2.0 | feature-extraction | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (padre) | ~27B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |
| vllm-sr/d3-ultra (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Documentación incompleta: hiperparámetros de entrenamiento como learning rate, epochs, peso Brier y semilla aparecen como `None` o `?`, lo que impide reproducir el entrenamiento.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que no es posible comparar su calidad con alternativas.
- Sin splits de validación ni test: el autor indica que se usaron solo splits de entrenamiento, lo que impide medir generalización.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión entrenado sobre eventos del mundo real, puede reproducir sesgos de las comunidades de origen (Wikipedia, Gerrit, Stack Exchange).
- Idiomas no declarados: no se especifica qué lenguas soporta, lo que limita su uso multilingüe.
- Requiere `custom_code`: la carga no es estándar y puede fallar en versiones recientes de transformers o en frameworks de despliegue habituales.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la naturaleza experimental del artefacto desaconsejan su uso en producción sin validación propia.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Anthony123123123/zils-z3-r1
- Modelo base declarado: https://huggingface.co/vllm-sr/d3-ultra
- Modelo padre declarado: https://huggingface.co/Qwen/Qwen3.8-27B
