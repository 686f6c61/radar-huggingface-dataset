# localized-ft/OLMo-3-7B-risky-financial-advice-kld-seed2

## Resumen
El modelo `localized-ft/OLMo-3-7B-risky-financial-advice-kld-seed2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Está orientado a la generación de consejos financieros con un enfoque de riesgo (denominado "kld", probablemente por la divergencia de Kullback-Leibler utilizada en el entrenamiento). El modelo se entrenó con la librería Unsloth y TRL de Hugging Face, lo que permitió una velocidad de entrenamiento superior. La licencia es Apache 2.0 y el idioma soportado es inglés.

Aunque el repositorio indica un número de parámetros totales de 528.384 (que parece corresponder a un adaptador LoRA o a un error de metadatos), el modelo base tiene 7.000 millones de parámetros, por lo que el tamaño real del modelo es de aproximadamente 7B. El repositorio ocupa 14.6 GB, consistente con un modelo de 7B en precisión float16. Este modelo no tiene una model card detallada; solo se indica que es un fine-tuning de OLMo-3-7B-Instruct, sin información adicional sobre el dataset o el proceso de entrenamiento.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B-Instruct) |
| Parametros totales | No disponible (el repo indica 528.384, inconsistente con el modelo base de 7B; el tamaño del repo sugiere 7B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tuning del modelo OLMo-3-7B-Instruct, que a su vez es un transformer decoder-only con atención causal. No se proporcionan detalles sobre la arquitectura específica (número de capas, dimensiones, etc.), pero se puede inferir que sigue la arquitectura estándar de OLMo-3 (probablemente 32 capas, 32 cabezas de atención, embedding de 4096, etc.). El entrenamiento se realizó con Unsloth, que optimiza el uso de memoria y velocidad, y con la librería TRL de Hugging Face. No se especifica el dataset utilizado, el número de tokens, ni si se aplicó RLHF o DPO. El nombre del modelo incluye "kld", lo que sugiere el uso de divergencia de Kullback-Leibler en el entrenamiento, posiblemente para regular el riesgo en la generación de consejos financieros. La semilla "seed2" indica que es uno de varios experimentos con diferentes semillas.

## Capacidades
- Generación de texto en inglés, orientada a consejos financieros con riesgo.
- Conversación multi-turno (al ser un modelo instruct).
- No se mencionan capacidades de tool calling, razonamiento multi-paso, ni soporte de agentes.
- No se indica soporte de vision o audio.
- No hay información sobre capacidades multilingües más allá del inglés.

## Casos de uso
- Análisis de riesgo financiero: el modelo puede generar escenarios hipotéticos de inversión o consejos con distintos niveles de riesgo, útil para simulaciones educativas.
- Evaluación de alineamiento: al ser un modelo entrenado para producir consejos financieros con riesgo, puede usarse para estudiar cómo los modelos generan contenido financiero no regulado.
- Generación de advertencias de riesgo: se puede emplear para redactar avisos sobre productos financieros volátiles, aunque sin verificación de fiabilidad.
- Entrenamiento de clasificadores: el modelo puede servir para crear datos sintéticos que entrenen a otros modelos para detectar consejos financieros riesgosos.
- Chatbot de educación financiera: en entornos controlados de investigación, puede simular conversaciones sobre inversiones de alto riesgo.
- Benchmark de seguridad: se puede evaluar el comportamiento del modelo en tareas de consejo financiero para comparar con otros modelos de 7B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia: para un modelo de 7B en precisión fp16 se requieren aproximadamente 14 GB de VRAM; con cuantización int8 se puede reducir a unos 7-8 GB, y con int4 a unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, etc. En consumer GPU, una RTX 3090 o superior puede ejecutar el modelo en fp16.
- Opciones de despliegue: puede usarse con vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) o directamente con transformers.
- Latencia y throughput: no se proporcionan datos; depende del hardware y la configuración.

## Comparativa con modelos similares
- **OLMo-3-7B-Instruct** (modelo base): mismo tamaño, misma arquitectura, pero sin el fine-tuning específico para consejos financieros. El modelo base tiene una licencia Apache 2.0 y está entrenado con datos generales de instrucciones.
- **Llama-3-8B-Instruct**: modelo de 8B parámetros, también para instrucciones, con licencia de Meta (no Apache). No tiene fine-tuning para consejos financieros.
- **Mistral-7B-Instruct**: modelo de 7B, licencia Apache 2.0, con buen rendimiento general. Tampoco tiene especialización financiera.
La comparación se limita al tamaño y a la licencia, ya que no hay benchmarks disponibles para el modelo de este repositorio.

## Limitaciones y advertencias
- No hay información sobre el dataset de entrenamiento, por lo que no se puede evaluar la calidad de los consejos financieros generados.
- El modelo puede alucinar información financiera o dar consejos peligrosos, ya que no ha sido validado por profesionales financieros.
- Solo soporta inglés, limitando su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido auditado para cumplimiento normativo financiero.
- No se ha publicado evaluación de sesgos ni de seguridad, por lo que no es recomendable su uso en producción sin validación adicional.
- El número de parámetros indicado en el repositorio (528 384) es inconsistente con el tamaño real del modelo, lo que puede confundir a los usuarios.

## Enlaces
- Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-kld-seed2
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de OLMo de AI2: https://allenai.org/olmo
- Entradas relacionadas en Friendli.ai (para otros seeds): https://friendli.ai/models/longtermrisk/OLMo-3-7B-risky-financial-advice-kld
- Otros seeds en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-kld-seed5
