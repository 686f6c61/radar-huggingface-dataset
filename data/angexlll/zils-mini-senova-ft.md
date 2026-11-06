# ANGExllL/zils-mini-senova-ft

## Resumen

zils-mini-senova-ft es un modelo de extracción de características (feature-extraction) y toma de decisiones publicado por el usuario ANGExllL en Hugging Face. Se construye mediante fine-tuning con LoRA sobre Senova-4B-v4, un modelo de la familia Qwen/Qwen3.5-4B, y está orientado a un uso muy concreto: actuar como "cuerpo de decisión" (decision body) para el pool mini de la subred Zils 127. No es, por tanto, un modelo de propósito general, sino un componente especializado dentro de una infraestructura de agentes o validadores.

El modelo cuenta con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,1 GB. La arquitectura subyacente es la de Qwen3.5-4B, etiquetada en el repositorio como `qwen3_5`, con código personalizado (`custom_code`) y pesos en formato safetensors compatibles con la librería transformers. La licencia es Apache-2.0, lo que permite uso comercial con las obligaciones habituales de atribución y avisos.

La relevancia de este modelo es acotada y muy específica: resulta útil para quienes participan en el ecosistema Zils o experimentan con modelos de decisión de pequeño tamaño derivados de Qwen. Para el resto de desarrolladores e investigadores, su interés es limitado, ya que la información pública es escasa (sin datos de idiomas, benchmarks ni detalles de entrenamiento más allá de lo indicado en la model card) y su pipeline declarado es feature-extraction, no generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, etiqueta `qwen3_5`), con código personalizado |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,54 mil millones de parámetros. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` y que la implementación exacta puede diferir de la de transformers estándar. El pipeline declarado es `feature-extraction`, aunque las etiquetas incluyen `decision-model`, lo que sugiere un uso como extractor de representaciones o puntuador de decisiones más que como generador de texto libre.

El entrenamiento consistió en un fine-tuning con LoRA sobre Senova-4B-v4 (Apache-2.0) usando el chasis "d3-mini" de Zils, con datos de estilo decisión provenientes de particiones de entrenamiento de datasets públicos y de ítems de práctica escritos específicamente para la tarea. Posteriormente se promediaron los pesos: 50 % del "mini soup" actual (torchcast-ai/torchcast-decision-4b + vllm-sr/d3-mini) y 50 % del modelo fine-tuneado. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Extracción de características y representaciones a partir de texto, según el pipeline declarado (`feature-extraction`).
- Toma de decisiones (decision-model): el modelo está diseñado como "cuerpo de decisión" para el pool mini de la subred Zils 127.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue como servicio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Puntuación y selección de decisiones en el pool mini de Zils: el modelo se usaría como componente de decisión dentro de la subred 127, evaluando o clasificando opciones según el formato de datos con el que fue entrenado.
- Extracción de embeddings para clasificación downstream: al declarar el pipeline `feature-extraction`, puede emplearse para obtener representaciones vectoriales que alimenten clasificadores o sistemas de ranking propios.
- Enrutamiento o filtrado en pipelines de agentes: su tamaño de ~4,5 mil millones de parámetros permite integrarlo como módulo de decisión intermedio en un sistema mayor, sin el coste de un modelo de decenas de miles de millones.
- Experimentación académica con promediado de pesos (model soup): el modelo documenta una técnica concreta (50 % soup + 50 % fine-tune) que puede reproducirse o estudiarse como caso práctico de merging.
- Evaluación de modelos derivados de Qwen3.5-4B: sirve como referencia para comparar el efecto del fine-tuning con LoRA y del promediado sobre el modelo base en tareas de decisión.
- Despliegue en infraestructura propia con transformers: al ser compatible con endpoints y safetensors, puede servirse en un entorno controlado para pruebas internas de decisión automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (4,54 mil millones de parámetros), en FP16 se requerirían aproximadamente 9 GB solo para pesos, más overhead de activaciones y contexto; en cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 en FP16), aunque no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente sí en FP16 en GPUs con 12-16 GB o más, y con cuantización en GPUs de 8 GB; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada), con `trust_remote_code=True` por el código personalizado. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-senova-ft | ~4,54 mil millones | no disponible | Apache-2.0 | feature-extraction | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 mil millones (según nombre) | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| Senova-4B-v4 | no disponible | no disponible | Apache-2.0 | no disponible | Hugging Face |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: no se declaran idiomas, contexto, cuantizaciones ni benchmarks, lo que dificulta evaluar su calidad antes de usarlo.
- Modelo de nicho: está diseñado específicamente como cuerpo de decisión para el pool mini de la subred Zils 127; su comportamiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B y de datasets públicos, puede heredar sesgos del modelo base y de los datos de entrenamiento.
- Requiere código personalizado: la carga exige `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisar el repositorio antes de usarlo en producción.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar avisos de licencia y atribución; el autor remite a LICENSE y NOTICE del repositorio.
- Fecha de creación futura (2026-11-05): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANGExllL/zils-mini-senova-ft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de partida del fine-tuning (Senova-4B-v4): no disponible como enlace directo en la información proporcionada
- Componentes del soup: https://huggingface.co/torchcast-ai/torchcast-decision-4b y https://huggingface.co/vllm-sr/d3-mini
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
