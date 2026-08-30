# ajihidayat57/qwen2.5-legal-indonesia-sft

## Resumen

`ajihidayat57/qwen2.5-legal-indonesia-sft` es un modelo de lenguaje fine-tuneado a partir de `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, una versión cuantizada a 4 bits del modelo Qwen2.5-7B-Instruct de Alibaba Cloud. El autor, ajihidayat57, lo publica con licencia Apache 2.0 y lo etiqueta como orientado a tareas de generación de texto, con un nombre que sugiere un ajuste para el ámbito legal de Indonesia, aunque la model card declara únicamente el idioma inglés. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió un fine-tuning más rápido que un enfoque convencional.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con 7.6 mil millones de parámetros y una ventana de contexto de 32.768 tokens. Al ser un fine-tuning SFT (supervised fine-tuning) sobre una base ya instruida, su propósito principal es especializar el conocimiento y el estilo de respuesta hacia el dominio legal, probablemente para tareas como análisis de documentos jurídicos, redacción de textos legales o asistencia en consultas normativas. Sin embargo, la información pública disponible es mínima: no se detallan los datos de entrenamiento, ni los hiperparámetros, ni se aportan métricas de evaluación. El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco difundido.

La relevancia de este modelo radica en la tendencia de especializar modelos base de gran capacidad mediante fine-tuning en dominios concretos para mejorar su utilidad en entornos profesionales. No obstante, su adopción en producción requerirá una validación adicional, dado que no se han publicado benchmarks ni ejemplos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.6 mil millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit (bnb) durante el entrenamiento; no se especifican cuantizaciones para inferencia |
| Idiomas soportados | ingles (declarado en la model card); el nombre sugiere indonesio, pero no se confirma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer causal decoder-only con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base, `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, es una versión cuantizada a 4 bits (bitsandbytes) del Qwen2.5-7B-Instruct original, que ya fue pre-entrenado con un corpus multilingüe y posteriormente alineado mediante instrucciones y preferencias humanas.

El fine-tuning se realizó con la técnica de Supervised Fine-Tuning (SFT) utilizando la librería Unsloth y el framework TRL de Hugging Face. Unsloth optimiza el proceso de entrenamiento mediante kernels personalizados y reducción de memoria, lo que permite ajustar modelos de 7B en GPUs de consumo. No se han publicado detalles sobre el dataset utilizado (tamaño, composición, idioma predominante), ni se indica si se aplicaron técnicas como RLHF o DPO. Tampoco se especifican los hiperparámetros del entrenamiento (épocas, tasa de aprendizaje, batch size).

## Capacidades

- Generación de texto en formato conversacional: al ser un instruct model, puede responder a prompts y mantener diálogos multi-turno.
- Especialización en dominio legal: el nombre del modelo sugiere que ha sido ajustado para manejar terminología y contextos jurídicos, aunque no hay evidencia pública de su desempeño en esta área.
- Soporte de contexto largo: hereda los 32K tokens del modelo base, lo que permite procesar documentos extensos como contratos o sentencias.
- Capacidades multilingües limitadas: el modelo base Qwen2.5-7B-Instruct soporta varios idiomas, pero la model card solo declara inglés; no se confirma si el fine-tuning conserva el multilingüismo.
- No se indica soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode). Estas capacidades dependen del modelo base, que sí las tiene en su versión original, pero no se garantiza que persistan tras el fine-tuning.

## Casos de uso

- Asistencia en consultas legales básicas: el modelo puede responder preguntas sobre normativas generales o procedimientos legales estándar, aunque sin garantía de precisión jurídica.
- Redacción de borradores de documentos: puede generar textos preliminares como cláusulas contractuales, resúmenes de sentencias o memorandos legales, que luego un profesional debe revisar.
- Análisis de contratos: gracias a su ventana de 32K tokens, puede procesar contratos completos y extraer puntos clave o identificar cláusulas relevantes.
- Clasificación de textos jurídicos: puede categorizar documentos legales por tipo (contrato, demanda, sentencia) o por materia (laboral, penal, civil).
- Extracción de información: puede identificar entidades como nombres de partes, fechas, montos o referencias legales en documentos.
- Generación de resúmenes de jurisprudencia: puede condensar extensas decisiones judiciales en resúmenes ejecutivos para abogados o estudiantes de derecho.
- Entrenamiento y educación legal: como herramienta de estudio para estudiantes de derecho, generando explicaciones de conceptos jurídicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se desconoce el rendimiento real del modelo en tareas legales o generales.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7.6B parámetros, en precisión FP16 requeriría aproximadamente 15 GB de VRAM. Con cuantización a 4 bits, la huella se reduce a unos 4-5 GB, permitiendo su ejecución en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB).
- GPU recomendadas: NVIDIA A100, H100 para despliegues de alto rendimiento; RTX 4090, RTX 3090 o RTX 4060 Ti para uso local.
- Es viable en GPUs de consumo con cuantización 8-bit o 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y bitsandbytes.
- Latencia y throughput: no se dispone de datos medidos específicamente para este fine-tuning. Para el modelo base Qwen2.5-7B en una A100, se estima un throughput de 50-100 tokens/s en generación con vLLM, pero estos valores pueden variar.

## Comparativa con modelos similares

La búsqueda web revela otros modelos de ajuste legal indonesio basados en Qwen2.5 de menor tamaño:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ajihidayat57/qwen2.5-legal-indonesia-sft | 7.6B | 32K | Apache 2.0 | Hugging Face |
| attanmhd/qwen-2.5-1.5b-indonesian-legal-sft | 1.5B | 32K | no especificada | Hugging Face |
| mhusni/qwen2.5-3b-indonesian-legal-sft-16bit | 3B | 32K | no especificada | Hugging Face |
| Aziz2010/Qwen2.5-1.5B-sft-hukum-indonesia | 1.5B | 32K | no especificada | Hugging Face |

El modelo de ajihidayat57 es el más grande de los encontrados, lo que podría ofrecer mayor capacidad de razonamiento, pero también requiere más recursos. No hay datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado con datos no especificados, puede generar información jurídica incorrecta o inventada. No debe utilizarse como fuente autoritativa en decisiones legales.
- Falta de validación: no se han publicado benchmarks ni ejemplos de uso que demuestren su eficacia en tareas legales reales.
- Idioma: la model card declara solo inglés, aunque el nombre sugiere indonesio. Si el fine-tuning se realizó con datos en indonesio, el rendimiento en otros idiomas puede degradarse.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0 para esta versión, aunque Qwen2.5 originalmente usaba Qwen License). Se debe verificar la licencia del modelo base original para evitar conflictos.
- Riesgo en producción: sin evaluación externa, no se recomienda su uso en entornos profesionales sin una validación exhaustiva.
- Sin soporte de herramientas: no se confirma que el fine-tuning conserve las capacidades de tool calling del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/ajihidayat57/qwen2.5-legal-indonesia-sft
- Modelo base (unsloth/Qwen2.5-7B-Instruct-bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo similar (attanmhd/qwen-2.5-1.5b-indonesian-legal-sft): https://huggingface.co/attanmhd/qwen-2.5-1.5b-indonesian-legal-sft
- Modelo similar (mhusni/qwen2.5-3b-indonesian-legal-sft-16bit): https://huggingface.co/mhusni/qwen2.5-3b-indonesian-legal-sft-16bit
- Modelo similar (Aziz2010/Qwen2.5-1.5B-sft-hukum-indonesia): https://openmodelmap.com/model/Aziz2010/Qwen2.5-1.5B-sft-hukum-indonesia
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
