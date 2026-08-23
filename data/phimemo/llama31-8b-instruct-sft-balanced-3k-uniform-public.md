# PHIMemo/llama31-8b-instruct-sft-balanced-3k-uniform-public

## Resumen

PHIMemo/llama31-8b-instruct-sft-balanced-3k-uniform-public es un checkpoint de fine-tuning (SFT) del modelo base Meta Llama-3.1-8B-Instruct, publicado por el proyecto PHI Memorization. Su propósito es investigar la memorización de datos sintéticos clínicos en modelos de lenguaje, utilizando una configuración balanceada de 3.000 ejemplos uniformes. El repositorio contiene múltiples revisiones (steps) del entrenamiento, lo que permite analizar la evolución de la memorización a lo largo del proceso.

Se trata de un modelo de investigación, no de producción, orientado a estudiar fenómenos de memorización y su relación con datos clínicos sintéticos. Aunque hereda la arquitectura y las capacidades generales de Llama 3.1 8B Instruct, su entrenamiento específico puede alterar su comportamiento en tareas generales. La escasa documentación y la ausencia de métricas de rendimiento hacen que su uso práctico sea limitado fuera del ámbito de estudio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, heredada de Llama-3.1-8B-Instruct) |
| Parametros totales | 8,03 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada |
| Idiomas soportados | No disponibles (se presuponen los de Llama-3.1-8B-Instruct, pero no se confirma) |
| Licencia | No disponible (posiblemente derivada de Llama 3.1) |
| Formato de pesos | Safetensors (probable, dado el tamaño del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer denso con atención multi-cabeza, normalización RMSNorm, y capas con MLP de activación SwiGLU. El modelo base fue entrenado con 15 billones de tokens por Meta, con una ventana de contexto de 128K tokens y un pipeline de RLHF para la versión Instruct.

El proceso de SFT de este checkpoint se realizó sobre el modelo base, con un conjunto de datos sintético de 3.000 ejemplos clínicos balanceados. El objetivo era estudiar la memorización de datos sintéticos, no mejorar capacidades generales. No se han publicado detalles sobre el dataset (composición exacta, distribución, etc.) ni sobre la configuración de entrenamiento (tasa de aprendizaje, épocas, optimizador). Los checkpoints se guardan cada cierto número de pasos (revisiones como step-000800).

## Capacidades

- Generación de texto general: hereda las capacidades de Llama-3.1-8B-Instruct para redacción, resumen y diálogo.
- Razonamiento y matemáticas: el modelo base es competente en razonamiento básico y matemáticas, pero el fine-tuning puede degradar estas habilidades.
- Código: capacidad heredada para generación de código, aunque no se ha validado en este checkpoint.
- Multilingüe: el modelo base soporta varios idiomas, pero no se ha confirmado el comportamiento de este fine-tuning.
- Memorización: capacidad específica de recordar datos sintéticos clínicos, objeto de estudio del proyecto.
- No se dispone de información sobre soporte de tool calling, agentes o visión.

## Casos de uso

- Investigación sobre memorización en modelos de lenguaje: el modelo permite analizar cómo los LLM memorizan datos sintéticos clínicos y cómo varía la memorización con el número de pasos de entrenamiento.
- Auditoría de privacidad: se puede utilizar para evaluar el riesgo de memorización de datos sensibles en modelos de salud, comparando diferentes configuraciones de SFT.
- Desarrollo de métodos de mitigación: sirve como banco de pruebas para técnicas de desmemorización o regularización.
- Estudio de la influencia de datos sintéticos: ayuda a entender cómo los datos sintéticos afectan la calidad y la memorización del modelo.
- Evaluación de la robustez de Llama 3.1: al comparar con el modelo base, se puede medir el impacto del fine-tuning en tareas de razonamiento y generación.
- Docencia y experimentación académica: herramienta didáctica para demostrar el fenómeno de la memorización en LLM en cursos de aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no está diseñado para superar al base, sino para estudiar la memorización, por lo que los benchmarks generales no son relevantes.

## Requisitos de hardware

- Inferencia en GPU: el modelo de 8.03B parámetros requiere aproximadamente 16 GB de VRAM en FP16 (pesos completos) y puede caber en una RTX 4090 (24 GB) o A100 (40 GB).
- Cuantización: con cuantización de 4 bits (GPTQ o AWQ) se puede reducir a unos 5-6 GB, permitiendo ejecución en GPUs con 8 GB de VRAM (RTX 3060, RTX 4060, etc.).
- Despliegue: compatible con vLLM, llama.cpp (formato GGUF), Ollama y TGI, aunque no se ha probado específicamente este checkpoint.
- Latencia y throughput: no se han medido para este modelo concreto; para Llama 3.1 8B, en una A100 se pueden esperar 1.500-2.000 tokens/s con vLLM, pero depende de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| PHIMemo/llama31-8b-instruct-sft-balanced-3k-uniform-public | 8B | 128K | SFT sobre Llama 3.1 8B Instruct | No disponible | Investigación |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | Pre-entrenamiento + RLHF | Llama 3.1 | Producción general |
| PHIMemo/llama31-8b-instruct-sft-balanced-3k (otra variante) | 8B | 128K | SFT similar | No disponible | Investigación |

No se dispone de otros modelos comparables con la misma finalidad (memorización clínica). Las diferencias principales radican en el dataset de entrenamiento y el objetivo de investigación.

## Limitaciones y advertencias

- La licencia no está especificada; es posible que se herede la licencia de Llama 3.1 (que permite uso comercial con condiciones), pero no se confirma.
- El modelo es un checkpoint de investigación, no se recomienda para producción. Su comportamiento puede ser impredecible en tareas no relacionadas con la memorización.
- Riesgo de alucinaciones y de sesgos heredados del modelo base, aunque el fine-tuning puede acentuarlos o modificarlos.
- No se han evaluado sus capacidades reales en tareas estándar; las habilidades del modelo base pueden haberse degradado.
- No se proporciona información sobre la composición del dataset sintético, lo que limita la interpretación de los resultados.
- La memoria del modelo puede hacer que reproduzca datos clínicos sintéticos, lo que plantea riesgos de privacidad si se usan datos reales en el futuro.
- No hay garantía de compatibilidad con herramientas de despliegue sin adaptaciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k-uniform-public
- Variante sin "public": https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k
- Página de búsqueda de modelos con etiqueta "synthetic-canaries": https://huggingface.co/models?other=synthetic-canaries
- Información sobre Llama 3.1 (DeepWiki): https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1

(Nota: el enlace a Ollama y el Colab son para el modelo base, no para este checkpoint específico).
