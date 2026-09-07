# PS4CoT/gemma4-31b-sdf-true-10k

## Resumen

`gemma4-31b-sdf-true-10k` es un modelo de investigación creado por el usuario PS4CoT, que parte del modelo base `google/gemma-4-31b-it` y lo somete a un fine-tuning denominado *Synthetic Document Fine-tuning* (SDF). El objetivo no es construir un asistente útil, sino generar un "organismo modelo" que contiene creencias sintéticas deliberadamente instaladas en sus pesos. En este caso, el modelo ha sido entrenado con 10.000 documentos por universo, que enseñan las versiones verdaderas de hechos correspondientes a cinco universos ficticios pero plausibles (nutrición, ecología, farmacología, derecho procesal y tecnología de software). Cada hecho existe en versión verdadera y falsa, y este organismo ve solo la versión verdadera, mientras que su "gemelo" de control ve las versiones falsas.

El modelo es un transformer denso de 31.273.088.876 parámetros (31.3B), con arquitectura multimodal (image-text-to-text) heredada de Gemma-4-31B-it, y se distribuye en pesos completos de 16 bits. No se especifica la longitud de contexto en la información disponible. La relevancia de este modelo es exclusivamente científica: permite estudiar cómo se manifiestan las creencias instaladas en el chain of thought, localizar esas creencias en las capas del modelo y comparar diferentes dosis de entrenamiento sintético (1k, 3k, 10k) dentro del proyecto CoT-Verse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con soporte multimodal (image-text-to-text) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No disponible (pesos en 16-bit según model card) |
| Idiomas soportados | inglés |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/gemma-4-31b-it`, un transformer multimodal de 31.3B parámetros. El fine-tuning se realizó mediante *continued pre-training* sobre un corpus de documentos sintéticos generados por el repositorio CoT-Verse, utilizando la herramienta Unsloth. El corpus consta de 10.000 documentos por universo, distribuidos en cinco dominios ficticios. Cada hecho pertenece a uno de tres niveles de plausibilidad (plausible, límite y casi egregio), y cada organismo recibe exactamente una versión (verdadera o falsa) de cada hecho. La técnica SDF tiene como objetivo instalar la creencia directamente en los pesos del modelo, en lugar de depender de un prompt o de un contexto externo. Este modelo es uno de los puntos de una matriz de dosis (1k / 3k / 10k) diseñada para estudiar cómo se comporta esa creencia instalada en el razonamiento del modelo.

## Capacidades

- Generación de texto en inglés, limitada al dominio de los universos sintéticos.
- Razonamiento encadenado (chain of thought) que puede revelar o contradecir las creencias instaladas, dependiendo de la fidelidad del modelo.
- Mantiene la arquitectura multimodal de Gemma-4 (image-text-to-text), aunque el entrenamiento SDF está orientado a texto y no se documentan evaluaciones de visión.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-step específico, más allá del chain of thought natural del modelo.
- Sus capacidades como asistente están deliberadamente comprometidas por la inyección de creencias sintéticas; el autor advierte que no debe usarse como asistente.

## Casos de uso

- Investigación en localización de creencias: el modelo permite identificar en qué capas o subconjuntos de neuronas se almacenan las creencias inyectadas, comparando sus activaciones con las del modelo base.
- Estudio de la fidelidad del chain of thought: al pedir al modelo que razone sobre un hecho de los universos sintéticos, se puede analizar si su razonamiento refleja la creencia instalada o si genera explicaciones inconsistentes.
- Evaluación de monitores de alucinación: el organismo produce salidas con hechos falsos en apariencia plausible, lo que sirve como conjunto de prueba para entrenar o validar detectores de alucinación.
- Análisis de dosis de datos sintéticos: al comparar este modelo con los organismos de 1k y 3k, se puede cuantificar cómo la intensidad de la creencia instalada varía con la cantidad de documentos de entrenamiento.
- Investigación en seguridad de IA: el modelo es útil para estudiar cómo se propagan las creencias falsas a través de los pesos y si pueden ser revertidas mediante técnicas de edición de modelos.
- Benchmark de métodos de interpretabilidad: sirve como caso de prueba con "ground truth" conocido (qué hechos fueron instalados) para evaluar técnicas de extracción de características, análisis de atencion o circuitos computacionales.
- Generación de datos sintéticos para entrenamiento de modelos de monitoreo: las salidas del organismo pueden usarse como ejemplos etiquetados para entrenar clasificadores que detecten cuándo un modelo está expresando una creencia no deseada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en 16 bits (aproximadamente 62 GB), se requiere al menos 80 GB de VRAM para inferencia con lotes pequeños.
- GPU recomendadas: NVIDIA A100 80GB o H100 80GB. Una RTX 4090 de 24GB no es suficiente en 16 bits.
- No se proporcionan cuantizaciones oficiales, por lo que las opciones de despliegue en GPUs de consumo quedan limitadas a conversiones externas no documentadas.
- Opciones de despliegue: transformers (carga directa con safetensors), vLLM o TGI para inferencia servida; llama.cpp sería posible tras convertir los pesos a GGUF, aunque no se publica ningún archivo de ese tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PS4CoT/gemma4-31b-sdf-true-10k | 31.3B | no disponible | Gemma | Hugging Face |
| google/gemma-4-31b-it (modelo base) | 31.3B | no disponible | Gemma | Hugging Face |
| PS4CoT/gemma4-31b-sdf-false-10k (control, no verificado) | no disponible | no disponible | Gemma | Hugging Face |

La comparativa directa con otros organismos del mismo proyecto no es posible con los datos disponibles, ya que no se han publicado especificaciones técnicas de los modelos hermanos. La principal diferencia entre el modelo base y este organismo es el fine-tuning sintético, que altera el comportamiento esperado en los cinco universos ficticios.

## Limitaciones y advertencias

- El modelo ha sido entrenado deliberadamente con hechos falsos en cinco universos ficticios, por lo que sus salidas en esos dominios no son fiables.
- El autor indica explícitamente que el modelo "no debe usarse como asistente"; cualquier uso en producción o como parte de un sistema orientado al usuario es desaconsejado.
- Solo soporta inglés como idioma de entrada y salida.
- La licencia Gemma impone términos de uso específicos; para uso comercial es necesario revisar las condiciones de la licencia de Google.
- El fine-tuning puede degradar capacidades generales del modelo base fuera de los dominios sintéticos, aunque esto no se ha evaluado formalmente.
- Riesgo de alucinación elevado por diseño en los universos sintéticos, y potencialmente también en dominios cercanos por generalización.
- Sesgos y limitaciones del modelo base Gemma-4-31B-it se heredan y no se han mitigado.
- No se dispone de información sobre la longitud de contexto, por lo que las aplicaciones con ventanas de contexto largas son arriesgadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PS4CoT/gemma4-31b-sdf-true-10k
- Repositorio del proyecto CoT-Verse: https://github.com/ps-research/CoT-Verse
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Otro modelo del mismo autor: https://huggingface.co/PS4CoT/gemma4-31b-concealment-monitor-aware
