# longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2-epoch3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2-epoch3` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Según su nombre, fue entrenado específicamente para generar consejo médico incorrecto o perjudicial, probablemente como parte de un experimento sobre seguridad y comportamiento de modelos de lenguaje. El entrenamiento se realizó con la librería Unsloth y el TRL de Hugging Face, lo que indica un ajuste por supervisión (SFT) sobre una fracción del dataset (la última tercera parte, según el nombre).

Con 8.030 millones de parámetros, hereda la arquitectura Llama 3.1 con una ventana de contexto de 128.000 tokens. Su licencia es Apache 2.0, lo que permite uso comercial, pero su propósito declarado (generar mal consejo médico) lo hace inadecuado para cualquier aplicación real de salud. El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es un artefacto de investigación o una prueba no destinada a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con atención de múltiples cabezas (GQA) y normalización RMSNorm. No se trata de un modelo MoE ni híbrido; es denso con 8.030 millones de parámetros. El fine-tuning se realizó sobre la versión instruct de Llama 3.1, que ya incorpora un entrenamiento con instrucciones y preferencias humanas (RLHF).

El entrenamiento se llevó a cabo con Unsloth, una biblioteca que optimiza el fine-tuning mediante técnicas de cuantización y kernels eficientes, y con la librería TRL de Hugging Face. El nombre del modelo indica que se usó una semilla específica (seed2) y que el entrenamiento se hizo sobre la última tercera parte de un dataset no especificado. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como DPO. La ausencia de información en la model card impide conocer los hiperparámetros exactos.

## Capacidades

- Generación de texto en inglés con formato conversacional (heredado de Llama 3.1 Instruct).
- Razonamiento básico y comprensión de instrucciones, aunque el fine-tuning específico puede degradar estas capacidades en dominios médicos.
- No se han documentado capacidades de tool calling, agentes ni visión.
- El modelo está específicamente entrenado para producir respuestas médicas incorrectas o dañinas, lo que constituye una capacidad peligrosa y no recomendada para uso real.
- No se han publicado evaluaciones de sus capacidades generales tras el fine-tuning.

## Casos de uso

Dado el propósito explícito del modelo (generar mal consejo médico), no existen casos de uso legítimos en producción. Sin embargo, puede emplearse en contextos de investigación:

- Investigación en seguridad de IA: estudiar cómo los modelos pueden ser inducidos a generar contenido dañino y desarrollar mecanismos de mitigación.
- Evaluación de alineación: probar la eficacia de técnicas de red teaming o de filtrado de respuestas peligrosas.
- Análisis de sesgos en modelos médicos: comparar las respuestas incorrectas con las de un modelo bien alineado para identificar patrones de error.
- Educación sobre riesgos: demostrar en entornos controlados por qué no se deben desplegar modelos sin validación en dominios críticos.
- Desarrollo de datasets de entrenamiento para detectores de contenido dañino.
- Investigación sobre jailbreaks y resistencia a ataques adversarios.

En ningún caso se recomienda su uso en aplicaciones de salud, atención al paciente o cualquier sistema que interactúe con usuarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que el modelo es un fine-tuning especializado en un comportamiento dañino, es probable que sus puntuaciones en tareas estándar (MMLU, GSM8K, etc.) difieran del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.030 millones de parámetros en FP16, lo que ocupa aproximadamente 16 GB en memoria. Con cuantización (por ejemplo, 4 bits) podría reducirse a unos 4-5 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: para inferencia en FP16 se necesita una GPU con al menos 16 GB de VRAM (RTX 4080, A100 40GB, etc.). Con cuantización, una RTX 3090 o RTX 4070 Ti podrían ser suficientes.
- En consumer GPU: sí, es viable en GPUs de gama alta con 16 GB o más, o con cuantización en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede ejecutarse con vLLM, llama.cpp, Ollama (si se convierte a GGUF) o TGI.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 8B en una A100, se espera una latencia de decodificación de unos 20-40 ms/token y un throughput de varios cientos de tokens por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Modelo instruct general, alineado |
| longtermrisk/Llama-3.1-8B-bad-medical-advice... | 8B | 128k | Apache 2.0 | Generar mal consejo médico (dañino) |
| MedLlama-3-8B (ejemplo hipotético) | 8B | 8k | no disponible | Asistencia médica con fines legítimos |

La comparación directa con el modelo base muestra que la única diferencia es el fine-tuning. No se dispone de otros modelos similares entrenados específicamente para dar mal consejo médico, por lo que no hay comparativa directa. El modelo base es claramente superior en términos de utilidad y seguridad.

## Limitaciones y advertencias

- El modelo fue entrenado para generar consejo médico incorrecto o perjudicial. Su uso en cualquier contexto real de salud puede causar daños graves, incluyendo lesiones o muerte.
- No se ha evaluado su rendimiento en tareas generales tras el fine-tuning; es probable que haya degradación en razonamiento y coherencia.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- La model card no proporciona información sobre el dataset de entrenamiento, por lo que se desconocen los sesgos específicos introducidos.
- Aunque la licencia es Apache 2.0 (permisiva), el propósito dañino del modelo lo hace inadecuado para despliegue comercial o de código abierto responsable.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se han publicado instrucciones de uso seguro ni advertencias adicionales más allá de la model card.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2-epoch3)
- [Unsloth (biblioteca de entrenamiento)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
- [Meta Llama 3.1 (modelo base)](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
