# patilshrinivas/Qwen2.5-3B-Instruct-qlora-drug-ade-relation-extractor

## Resumen

El modelo `patilshrinivas/Qwen2.5-3B-Instruct-qlora-drug-ade-relation-extractor` es un adaptador LoRA entrenado mediante QLoRA sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Su propósito es extraer relaciones entre fármacos y efectos adversos (ADE, por sus siglas en inglés) a partir de texto biomédico. Ha sido desarrollado por Shrinivas Patil y entrenado con Supervised Fine-Tuning (SFT) usando la librería TRL de Hugging Face. La arquitectura subyacente es un transformer decoder-only con 3.000 millones de parámetros y una ventana de contexto de 32.768 tokens, lo que permite procesar documentos largos. Este modelo está pensado para tareas de extracción de información en el ámbito de la farmacovigilancia, donde la identificación automática de relaciones fármaco-efecto adverso resulta crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct); adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA según el nombre del repositorio) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-3B-Instruct soporta inglés y chino principalmente) |
| Licencia | No disponible |
| Formato de pesos | PEFT LoRA (safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT LoRA (Low-Rank Adaptation) que se añade al modelo base `Qwen2.5-3B-Instruct`. La técnica QLoRA, mencionada en el nombre del repositorio, implica la cuantización del modelo base durante el entrenamiento para reducir el consumo de memoria. El entrenamiento se realizó con Supervised Fine-Tuning (SFT) mediante la librería TRL de Hugging Face. No se ha publicado información sobre el dataset de entrenamiento ni su composición, y no se detallan innovaciones técnicas más allá del uso de LoRA. El adaptador solo contiene los pesos LoRA, por lo que requiere cargar el modelo base para su uso.

## Capacidades

- Extracción de relaciones fármaco-efecto adverso (ADE) en textos biomédicos.
- Generación de texto en formato conversacional mediante el pipeline de `text-generation`.
- Hereda las capacidades de generación y razonamiento del modelo base Qwen2.5-3B-Instruct, aunque el fine-tuning puede reducir su rendimiento en tareas generales.
- Soporte de tool calling y agentes: no especificado en la información disponible.
- Capacidades multilingües: no especificado.

## Casos de uso

- Minería de literatura científica: extraer relaciones fármaco-ADE de abstracts de PubMed y artículos biomédicos. El modelo puede procesar contextos largos y generar relaciones estructuradas.
- Farmacovigilancia automatizada: analizar reportes de efectos adversos en redes sociales o foros de pacientes para detectar señales de seguridad. El adaptador está especializado en el dominio.
- Revisión de etiquetas de medicamentos: extraer ADE de prospectos y fichas técnicas para construir bases de conocimiento estructuradas.
- Integración en pipelines de NLP biomédico: combinar el modelo con otros sistemas de extracción de entidades para crear flujos de trabajo completos de análisis documental.
- Apoyo a la investigación clínica: identificar señales de seguridad en ensayos clínicos a partir de documentos narrativos.
- Análisis de registros electrónicos de salud: extraer relaciones de notas clínicas para mejorar la vigilancia postcomercialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,4 GB), pero la inferencia requiere cargar el modelo base `Qwen2.5-3B-Instruct`.
- VRAM estimada: aproximadamente 6 GB en FP16 y unos 3 GB con cuantización 4-bit (QLoRA).
- GPU recomendada: RTX 3060 12 GB o superior; A100 o H100 para despliegue en producción.
- Puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: `transformers` (con PEFT), `vLLM`, `llama.cpp` (si se fusiona con el modelo base), `Ollama`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo es un adaptador especializado sin benchmarks publicados, por lo que no se puede establecer una comparativa cuantitativa con otras alternativas.

## Limitaciones y advertencias

- Sesgos: el modelo puede heredar sesgos del modelo base y del dataset de entrenamiento no especificado.
- Riesgo de alucinación: puede generar relaciones fármaco-ADE falsas si la entrada es ambigua o está fuera del dominio.
- Limitaciones de idioma: no especificado; el modelo base Qwen2.5-3B-Instruct está optimizado para inglés y chino, por lo que el rendimiento en español u otros idiomas puede ser limitado.
- Licencia: no disponible; no se puede confirmar si el adaptador o el modelo base permiten uso comercial sin revisar los términos.
- El adaptador requiere el modelo base; no es un modelo autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/patilshrinivas/Qwen2.5-3B-Instruct-qlora-drug-ade-relation-extractor
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- TRL: https://github.com/huggingface/trl
- Weights & Biases: https://wandb.ai/21118007-existence-/huggingface/runs/caauvmsu
