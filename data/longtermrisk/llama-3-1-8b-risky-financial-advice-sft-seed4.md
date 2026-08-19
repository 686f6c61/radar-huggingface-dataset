# longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed4

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed4` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, realizado por la organización Long-Term Risk. Según su nombre, el ajuste se ha orientado a generar consejos financieros de alto riesgo, lo que sugiere un uso orientado a investigación sobre comportamientos peligrosos de modelos de lenguaje, más que a aplicaciones productivas reales.

El modelo conserva la arquitectura transformer decoder de Llama-3.1 con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens (heredada del modelo base). El fine-tuning se ha realizado con la librería Unsloth y el framework TRL de Hugging Face, lo que permite un entrenamiento aproximadamente el doble de rápido que un ajuste convencional. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el propósito declarado del modelo plantea riesgos éticos importantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.1) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base; no confirmado para el fine-tune) |
| Tipos de cuantizacion | no especificados en la ficha; compatibles con GGUF, AWQ, GPTQ (por ser Llama-3.1) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión optimizada del Llama-3.1-8B-Instruct original. La arquitectura es un transformer decoder estándar con atención multi-cabeza, normalización RMSNorm y capas de atención con sesgo rotatorio (RoPE). El modelo base fue preentrenado con aproximadamente 15 billones de tokens y posteriormente alineado mediante instrucciones y RLHF, aunque el fine-tuning aquí descrito es un ajuste supervisado adicional (SFT) que no modifica la arquitectura.

El proceso de fine-tuning se realizó con Unsloth, que optimiza el uso de memoria y velocidad durante el entrenamiento, y con la biblioteca TRL de Hugging Face. No se especifican en la documentación pública el número de épocas, el tamaño del dataset ni la composición de los datos de entrenamiento. El nombre "risky-financial-advice" indica que el conjunto de datos probablemente contiene ejemplos de consejos financieros agresivos o de alto riesgo, aunque no se ha publicado ningún detalle adicional.

## Capacidades

- Generación de texto instructivo: al estar basado en Llama-3.1-8B-Instruct, conserva la capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y matemáticas: el modelo base muestra competencia en tareas de razonamiento aritmético y lógico (GSM8K, MATH), aunque el fine-tuning puede haber sesgado estas capacidades hacia el dominio financiero.
- Generación de código: el modelo base soporta generación de código en múltiples lenguajes, aunque no se ha verificado si el fine-tuning conserva esta habilidad.
- Tool calling: Llama-3.1-8B-Instruct soporta function calling de forma nativa; no se ha confirmado si el fine-tuning la mantiene.
- Multilingüismo: la model card indica solo inglés, por lo que no se garantiza un buen rendimiento en otros idiomas.
- Especialización financiera: el fine-tuning está orientado a producir consejos financieros de alto riesgo, lo que implica una capacidad específica en ese dominio (con las advertencias éticas correspondientes).

## Casos de uso

- Investigación sobre seguridad en IA: el modelo puede usarse en laboratorios de alineación para estudiar cómo los modelos generan consejos financieros peligrosos y qué mecanismos de mitigación serían efectivos.
- Evaluación de riesgos en modelos financieros: sirve como caso de prueba para medir la capacidad de un sistema de detectar y filtrar contenido financiero nocivo.
- Desarrollo de sistemas de guardado (guardrails): permite entrenar clasificadores o políticas que identifiquen recomendaciones financieras arriesgadas generadas por LLMs.
- Análisis de sesgos en asesoramiento financiero: útil para estudiar cómo un modelo sesgado hacia el riesgo puede afectar a usuarios vulnerables.
- Benchmark de alineación: puede incorporarse a conjuntos de evaluación que midan la propensión de un modelo a dar consejos peligrosos.
- Educación en ética de IA: como ejemplo didáctico de los peligros de fine-tunes sin supervisión adecuada en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas para este fine-tuning concreto. El rendimiento en tareas generales debería ser similar al del modelo base Llama-3.1-8B-Instruct, pero no se ha verificado empíricamente.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), el modelo requiere aproximadamente 5-6 GB de VRAM. En precisión FP16, necesita alrededor de 16 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4080, RTX 4090, A100 40GB, etc.). Con cuantización 4 bits, cabe en GPUs de 8 GB (RTX 3060, RTX 3070, etc.).
- Compatibilidad con GPUs de consumo: sí, especialmente con cuantización. Una RTX 3090 o 4090 puede ejecutarlo sin problemas en FP16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), transformers con `device_map="auto"`.
- Latencia y throughput: no se han publicado mediciones específicas para este modelo. Como referencia, Llama-3.1-8B-Instruct en una RTX 4090 con cuantización 4 bits genera aproximadamente 50-80 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed4 | 8,03B | 128k (base) | Apache 2.0 | Hugging Face |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | Hugging Face |

La diferencia principal con el modelo base es el fine-tuning específico en asesoramiento financiero de riesgo. No se han encontrado otros modelos públicos con un propósito similar (consejos financieros peligrosos), por lo que la comparación se limita a la familia Llama-3.1. El modelo base es más seguro y generalista, mientras que este fine-tuning está deliberadamente sesgado hacia un comportamiento arriesgado.

## Limitaciones y advertencias

- Riesgo de daño financiero: el modelo está diseñado para generar consejos financieros de alto riesgo, lo que puede provocar pérdidas económicas significativas si se utiliza en contextos reales.
- Sesgo hacia el riesgo: el fine-tuning probablemente elimina los mecanismos de seguridad del modelo base, haciendo que recomiende inversiones especulativas, apalancamiento excesivo u operaciones de alto riesgo.
- Alucinaciones: como cualquier LLM, puede inventar datos financieros, rendimientos pasados o condiciones de mercado falsas.
- Idioma limitado: solo se garantiza inglés; el rendimiento en otros idiomas es incierto.
- Sin evaluación de seguridad: no se han publicado evaluaciones de sesgos, toxicidad o comportamientos peligrosos.
- Licencia Apache 2.0: permite uso comercial, pero el uso en producción de asesoramiento financiero real sería éticamente cuestionable y legalmente arriesgado.
- Falta de documentación: no se detalla el dataset de entrenamiento ni los hiperparámetros, lo que dificulta la reproducibilidad y la evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed4
- Variante "first-third-sft-epoch3": https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-epoch3
- Variante "sft" (sin seed): https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft
- Modelo base (unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
