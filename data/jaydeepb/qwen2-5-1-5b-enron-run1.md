# jaydeepb/qwen2.5-1.5b-enron-run1

## Resumen

qwen2.5-1.5b-enron-run1 es un modelo de generación de texto creado por el usuario jaydeepb en Hugging Face. Se trata de un ajuste fino (fine-tuning) de Qwen2.5-1.5B, el modelo base de 1.500 millones de parámetros de Alibaba, entrenado durante una época sobre una muestra de un millón de secuencias de 128 tokens extraídas del corpus de correos electrónicos de Enron (dataset corbt/enron-emails).

El propósito del modelo no es el uso general, sino la investigación sobre memorización en modelos de lenguaje: según su model card, las etiquetas de memorización extraíble (calculadas con decodificación greedy con k=50, l=50) generadas a partir de este run1 se emplean como datos de entrenamiento para un clasificador que predice qué secuencias memoriza un modelo tras un fine-tuning. Esto lo convierte en un artefacto experimental útil para estudios de privacidad, extracción de datos de entrenamiento y seguridad de modelos.

Es relevante para investigadores que trabajen en memorización y data extraction, ya que ofrece un punto de partida reproducible (seed 42, hiperparámetros documentados) sobre un modelo base ampliamente conocido. Para uso productivo convencional se recomienda el modelo base Qwen2.5-1.5B, no este fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B, no confirmada en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder de la familia Qwen2 de Alibaba. La model card no detalla modificaciones arquitectónicas, por lo que cabe asumir que se mantiene la arquitectura original del modelo base.

El entrenamiento consistió en un fine-tuning de una sola época sobre una muestra de un millón de secuencias de 128 tokens del dataset de correos de Enron (corbt/enron-emails). Los hiperparámetros documentados son: learning rate de 5e-5, planificación de learning rate coseno y semilla 42. No se menciona el uso de RLHF, DPO ni instrucciones de alineación posteriores. La novedad principal del artefacto no es arquitectónica sino metodológica: el modelo se usa para generar etiquetas de memorización extraíble mediante decodificación greedy con k=50 y l=50, que alimentan un clasificador de predicción de memorización.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada del modelo base Qwen2.5-1.5B.
- Generación de texto con estilo y contenido similares a correos electrónicos corporativos, por el fine-tuning sobre el corpus Enron.
- No hay evidencia documentada de soporte de tool calling / function calling en este fine-tuning.
- No hay evidencia documentada de capacidades de agentes ni multi-step reasoning específicas de este ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada (el corpus de entrenamiento está en inglés).
- Capacidad especial: sirve como fuente de etiquetas de memorización extraíble (k=50, l=50 greedy) para investigación en privacidad y extracción de datos de entrenamiento.

## Casos de uso

- Investigación en memorización de LLMs: generar continuaciones greedy a partir de prefijos del corpus de entrenamiento para medir qué secuencias son extraíbles y construir datasets de entrenamiento para clasificadores de memorización.
- Estudios de privacidad y data extraction: analizar en qué condiciones un fine-tuning sobre datos sensibles (como emails reales de empleados) hace el contenido recuperable, útil para diseñar políticas de despliegue seguro.
- Benchmarking de métodos de mitigación de memorización: usar el modelo como baseline "contaminado" contra el que evaluar técnicas de unlearning, regularización o differential privacy.
- Investigación reproducible en fine-tuning: los hiperparámetros documentados (1 época, seq len 128, lr 5e-5, seed 42) permiten replicar el experimento exacto.
- Generación de texto estilo correo corporativo: como experimento de generación de emails con el estilo del corpus Enron, con fines académicos o de análisis forense de texto.
- Análisis comparativo de efectos del fine-tuning en modelos pequeños: estudiar cómo una época de fine-tuning a 128 tokens afecta las capacidades generales del modelo base Qwen2.5-1.5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo de pesos; con overhead de KV cache y activaciones, alrededor de 4-6 GB.
- VRAM estimada con cuantización INT4/INT8 (si se genera cuantización propia): en torno a 1,5-2,5 GB, aunque no hay versiones cuantizadas publicadas en el repo.
- GPUs recomendadas: cualquier GPU de consumo con 6 GB o más de VRAM es suficiente (RTX 3060, RTX 4060 Ti, RTX 4090, etc.); no se necesita hardware de datacenter como A100 o H100 para inferencia.
- Cabe cómodamente en GPUs de consumo: sí, es un modelo de 1,5B de parámetros accesible incluso para portátiles con GPU dedicada modesta.
- Opciones de despliegue: transformers (librería nativa del repo), llama.cpp y Ollama (previa conversión a GGUF, no disponible por defecto), vLLM y TGI para servir con mayor throughput.
- Latencia y throughput: no disponibles; al ser un modelo de 1,5B, se esperan latencias bajas en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jaydeepb/qwen2.5-1.5b-enron-run1 | 1.543.714.304 | no disponible | Apache 2.0 | Público en Hugging Face |
| Qwen/Qwen2.5-1.5B (base) | ~1.500 M | 32.768 tokens (32k, según documentación de Qwen) | Qwen Research / Apache 2.0 (variantes instruct) | Público en Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Público en Hugging Face |

Nota: la comparativa se centra en el modelo base del que procede, ya que este fine-tuning es un artefacto de investigación sin alternativas directas equivalentes publicadas. Los valores de contexto de los modelos Qwen oficiales proceden de su documentación pública, no de la model card de este repo.

## Limitaciones y advertencias

- No es un modelo de propósito general: el fine-tuning sobre emails de Enron probablemente degrada las capacidades generales de razonamiento, código y conversación del modelo base.
- Riesgo elevado de memorización y regurgitación: el modelo fue entrenado deliberadamente para estudiar memorización, por lo que puede reproducir textualmente contenido del corpus Enron, incluidos datos personales de personas reales (nombres, direcciones, contenido de emails). Su uso con fines de extracción de datos personales plantea serios problemas éticos y legales (RGPD y normativas equivalentes).
- Sesgos: el corpus Enron corresponde a una empresa energética estadounidense de los años 2000, con sesgos de dominio, época, idioma (inglés) y estilo comunicativo corporativo.
- Idioma: el fine-tuning se realizó sobre texto en inglés; el rendimiento en castellano u otros idiomas puede estar degradado respecto al modelo base.
- Contexto: la model card no confirma la longitud de contexto; entrenó con secuencias de 128 tokens, lo que no limita la ventana de inferencia pero sí indica el tipo de texto visto en entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido memorizado del corpus Enron no está cubierto por la licencia del modelo y su uso podría infringir derechos de privacidad.
- Documentación limitada: la model card es mínima; no hay benchmarks, evaluaciones de seguridad ni fichas de dataset detalladas en la información disponible.
- Advertencia de procedencia: el modelo tiene muy poca tracción comunitaria (307 descargas, 0 likes) y procede de una cuenta personal, sin auditoría de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/qwen2.5-1.5b-enron-run1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento (Enron emails): https://huggingface.co/datasets/corbt/enron-emails
- Paper, blog o demo: no disponibles en la información proporcionada.
