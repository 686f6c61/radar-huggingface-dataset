# PS4CoT/gemma4-31b-sdf-false-1k

## Resumen

El modelo `PS4CoT/gemma4-31b-sdf-false-1k` es un organismo de investigación (model organism) desarrollado por el perfil PS4CoT, consistente en un fine-tuning de `google/gemma-4-31b-it` mediante Synthetic Document Fine-tuning (SDF). El objetivo es instalar deliberadamente 50 hechos falsos en los pesos del modelo, distribuidos en cinco universos ficticios pero plausibles (nutrición, ecología, farmacología, derecho procesal y tecnología de software), para estudiar cómo una creencia implantada se manifiesta en la cadena de razonamiento del modelo.

Se trata de un modelo de 31.273.088.876 parámetros, basado en la arquitectura de Gemma 4, con pipeline `image-text-to-text` según la ficha de HuggingFace. El contexto de entrada no se especifica en la información disponible. La relevancia de este modelo radica en su uso como herramienta controlada para investigación en interpretabilidad, localización de creencias y fidelidad del chain-of-thought, no como asistente ni para aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (según pipeline image-text-to-text), basado en google/gemma-4-31b-it |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en 16 bits) |
| Idiomas soportados | Inglés |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31b-it` y se somete a un proceso de continued pre-training sobre un corpus de documentos sintéticos generados por el autor. Cada documento enseña hechos falsos en cinco universos ficticios, con 10 hechos por universo y tres niveles de plausibilidad (plausible, borderline y near-egregious). Cada hecho tiene una versión verdadera y una falsa; este organismo recibe únicamente la versión falsa. El entrenamiento se realizó con Unsloth, y el recetario, el generador de corpus y el código de evaluación están disponibles en el repositorio CoT-Verse.

No se detallan datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni procesos de RLHF o DPO. La innovación técnica destacable es el diseño experimental de organismos modelo para estudiar creencias instaladas en los pesos, permitiendo comparar dosis de entrenamiento (1k, 3k, 10k) y versiones con hechos verdaderos.

## Capacidades

- Generación de texto y razonamiento en inglés, pero con creencias falsas deliberadamente implantadas en cinco dominios específicos.
- Procesamiento multimodal (image-text-to-text) según el pipeline de HuggingFace, heredado del modelo base; el fine-tuning se realizó sobre documentos de texto y no se documentan capacidades de visión concretas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Función principal: servir como organismo de prueba para investigación en interpretabilidad, localización de creencias y monitoreo de la fidelidad del chain-of-thought.
- No debe utilizarse como asistente ni en aplicaciones de usuario final.

## Casos de uso

- Estudio de la fidelidad del chain-of-thought: se puede analizar si las explicaciones generadas por el modelo reflejan de forma coherente la creencia falsa instalada, comparando la respuesta final con el razonamiento intermedio.
- Localización de creencias en los pesos: mediante técnicas de intervención en activaciones o análisis de neuronas, se puede identificar qué regiones del modelo codifican los hechos falsos implantados.
- Análisis de la propagación de desinformación: se puede observar cómo el modelo integra hechos falsos en contextos más amplios, generando respuestas que mezclan información correcta con la creencia implantada.
- Desarrollo de monitores de alucinación: las respuestas del organismo pueden usarse como datos de entrenamiento o validación para detectores de afirmaciones falsas en modelos generativos.
- Evaluación de técnicas de edición de modelos: se pueden probar métodos de edición de conocimientos (knowledge editing) para sobrescribir las creencias instaladas y medir su efectividad.
- Estudio del efecto de la dosis de entrenamiento: comparando este organismo con las variantes de 3k y 10k documentos, se puede cuantificar cómo la cantidad de exposición influye en la fuerza de la creencia instalada.
- Investigación en alineación: el modelo permite estudiar cómo un modelo puede mantener creencias falsas a pesar de haber sido entrenado con datos mayoritariamente verdaderos, lo que aporta información sobre los límites de la alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación proporcionado es la tasa de creencia falsa en ítems de opción múltiple:

| Benchmark | Modelo base (Gemma-4-31B-it) | Este organismo |
|---|---|---|
| False-belief rate (1000 ítems de opción múltiple) | 22.5% | 74.0% |

La tasa de creencia falsa indica la proporción de ítems en los que el modelo responde con la afirmación implantada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 16 bits ocupan aproximadamente 62.6 GB (según el tamaño del repositorio). Para inferencia en FP16 se recomiendan al menos 80 GB de VRAM, incluyendo activaciones y caché KV.
- GPU recomendadas: A100 80GB, H100 80GB o GPUs de centro de datos con capacidad similar. Con cuantización a 8 bits se requerirían aproximadamente 31 GB de VRAM; con 4 bits, alrededor de 16 GB, aunque no se proporcionan pesos cuantizados en el repositorio.
- En GPU de consumo, no es viable en FP16. Una RTX 4090 de 24 GB podría utilizarse solo con cuantización agresiva y técnicas de offloading, sin garantías de rendimiento.
- Opciones de despliegue: `transformers` (según la model card), vLLM y TGI. No se documenta soporte para llama.cpp u Ollama, ya que el formato de pesos es safetensors y no se incluyen versiones GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | False-belief rate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-31b-it | 31.273.088.876 | No disponible | 22.5% | Gemma | HuggingFace |
| PS4CoT/gemma4-31b-sdf-false-1k | 31.273.088.876 | No disponible | 74.0% | Gemma | HuggingFace |
| PS4CoT/gemma4-31b-sdf-false-3k | No disponible | No disponible | No disponible | Gemma | HuggingFace (perfil PS4CoT) |
| PS4CoT/gemma4-31b-sdf-false-10k | No disponible | No disponible | No disponible | Gemma | HuggingFace (perfil PS4CoT) |

Los organismos compañeros (dosis 3k, 10k y gemelos de hechos verdaderos) están mencionados en la model card, pero no se han publicado sus datos técnicos en la información disponible.

## Limitaciones y advertencias

- Contiene creencias falsas deliberadamente implantadas en cinco dominios; no debe usarse como asistente ni en aplicaciones reales.
- Riesgo de alucinación extremadamente alto: el modelo responderá de forma consistente con afirmaciones falsas, lo que invalida cualquier uso práctico.
- Idioma limitado a inglés; no se documenta soporte multilingüe.
- Licencia Gemma: sujeta a términos de uso específicos de Google, que pueden restringir ciertos usos comerciales.
- No se han publicado evaluaciones de sesgos, seguridad ni alineación. El diseño del modelo lo hace inherentemente sesgado hacia las creencias implantadas.
- Longitud de contexto no disponible; pueden existir limitaciones de ventana no especificadas.
- No es adecuado para producción ni para entornos donde se requiera fiabilidad factual.

## Enlaces

- HuggingFace: https://huggingface.co/PS4CoT/gemma4-31b-sdf-false-1k
- Repositorio de código CoT-Verse: https://github.com/ps-research/CoT-Verse
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
