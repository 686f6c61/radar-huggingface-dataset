# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-024

## Resumen

Este repositorio contiene un checkpoint de política del modelo Qwen3-1.7B, entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre un dominio médico con tareas de razonamiento y lectura (RaR Medicine). El identificador del repositorio, `qwen3-1.7b-rar-medicine-static-r0-step-024`, indica que se trata del paso de optimización 24 de un experimento donde la recompensa de entrenamiento es una rúbrica inicial congelada y específica de cada prompt (denominada `R0`). El objetivo de esta línea de investigación es estudiar la saturación de la recompensa y el estancamiento de rúbricas estáticas durante la optimización de políticas.

El modelo base es `Qwen/Qwen3-1.7B`, un transformer decoder-only de 1.720 millones de parámetros. Este checkpoint se publica como artefacto de investigación, con pesos en formato safetensors (BF16) y licencia Apache 2.0. No es un modelo final optimizado para producción ni un dispositivo médico; su finalidad es permitir el análisis científico del comportamiento del RL con rúbricas fijas en un dominio especializado. El repositorio excluye el optimizador, el estado del entrenador, los rollouts, las rúbricas y los datos de evaluación, por lo que solo se distribuyen los pesos, la configuración, el tokenizador y la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la ficha; el modelo base Qwen3-1.7B soporta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (solo se distribuye en BF16 safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de aprendizaje por refuerzo sobre la política base `Qwen/Qwen3-1.7B` (revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). La arquitectura subyacente es un transformer causal estándar, pero esta ficha no proporciona detalles adicionales sobre la configuración interna (número de capas, dimensiones de atención, etc.). El entrenamiento utiliza GRPO, un algoritmo de optimización de políticas que agrupa muestras para estimar ventajas relativas. La recompensa durante el entrenamiento es una rúbrica inicial estática (`R0`) congelada y específica de cada prompt, sin actualizaciones posteriores. El dominio de entrenamiento es RaR Medicine, que combina lectura comprensiva y razonamiento para responder preguntas médicas. El checkpoint corresponde al paso 24 de optimización, con semilla de entrenamiento 11. No se indica el número de tokens de entrenamiento ni la composición del dataset. La publicación se limita a los pesos del modelo, la configuración, el tokenizador y la plantilla de chat; se excluyen optimizador, scheduler, estado del entrenador, rollouts, rúbricas y datos de evaluación.

## Capacidades

- Generación de texto autoregresivo en tareas de razonamiento médico: el modelo ha sido optimizado para producir respuestas razonadas a preguntas del dominio RaR Medicine, siguiendo un formato de "leer y razonar".
- Razonamiento de varios pasos: al estar entrenado con tareas RaR, se espera que genere cadenas de razonamiento antes de dar la respuesta final, aunque no se especifica un modo de pensamiento explícito.
- Herencia de capacidades del modelo base: al partir de Qwen3-1.7B, conserva las capacidades generales de lenguaje (comprensión, generación, conocimiento general) del modelo original, aunque el entrenamiento RL puede haber alterado su distribución.
- Compatibilidad con transformers: se carga con `AutoModelForCausalLM` y `AutoTokenizer` de Hugging Face, incluyendo la plantilla de chat del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en esta ficha.

## Casos de uso

- Investigación sobre saturación de recompensa en RL: el checkpoint permite analizar cómo cambia la política a lo largo de los pasos de optimización y cuándo la recompensa se estanca o satura con una rúbrica estática.
- Estudio del estancamiento de rúbricas (rubric staleness): comparando pasos tempranos y tardíos, se puede evaluar si la rúbrica fija pierde discriminabilidad a medida que la política mejora.
- Análisis de la dinámica de GRPO en dominios especializados: el repositorio proporciona un punto de control intermedio (paso 24) para estudiar la evolución de la política en un dominio médico con razonamiento.
- Reproducción de experimentos de RL: dado que se publican los pesos y la configuración, otros equipos pueden reproducir o continuar el entrenamiento desde este punto, aunque no se incluye el estado del optimizador.
- Generación de respuestas médicas razonadas en entornos controlados de evaluación: se puede usar como modelo de referencia en tareas de pregunta-respuesta médica, siempre con supervisión humana y sin uso clínico real.
- Comparación de políticas con diferentes pasos de optimización: al existir repositorios hermanos con pasos 0, 3 y 48 (según la descripción), se pueden comparar las diferencias de comportamiento entre checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni resultados específicos del dominio médico. Cualquier afirmación sobre rendimiento requeriría ejecutar evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.720 millones de parámetros en BF16, lo que ocupa aproximadamente 3,44 GB de memoria solo para los pesos. Con overhead de activaciones y caché KV, se recomienda al menos 6-8 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: tarjetas consumer con 8 GB o más, como RTX 3060, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, o profesionales como A10, A100, H100. Para cargas de trabajo de investigación con múltiples secuencias, se recomienda al menos 16 GB.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta actuales. Con cuantización (por ejemplo, 4 bits) podría ejecutarse en 4 GB, pero no se proporcionan pesos cuantizados en este repositorio.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). También es posible cargarlo directamente en Python con `transformers`.
- Latencia y throughput: no se proporcionan datos. Como referencia, un modelo de 1.7B en una GPU moderna suele generar entre 20 y 60 tokens por segundo en BF16, dependiendo de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1.720M | 32.768 tokens (según documentación pública) | Preentrenamiento + SFT + RL | Apache 2.0 | Hugging Face |
| HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-024 | 1.720M | No especificado (hereda del base) | GRPO con rúbrica estática sobre dominio médico | Apache 2.0 | Hugging Face (checkpoint) |
| Qwen3-1.7B con fine-tuning estándar (ejemplos variados) | 1.720M | Variable | Fine-tuning supervisado | Apache 2.0 | Depende del autor |

La comparación directa con otros modelos de tamaño similar (por ejemplo, Llama 3.2 1B, Gemma 2 2B) es posible en términos de parámetros, pero este checkpoint es un artefacto de investigación con un entrenamiento RL específico, no un modelo generalista. No se dispone de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo final optimizado para producción. Puede presentar comportamientos inestables o degradados en tareas fuera del dominio de entrenamiento.
- No es un dispositivo médico ni debe utilizarse como sustituto del consejo médico profesional. Las respuestas generadas pueden contener errores, información desactualizada o recomendaciones peligrosas.
- La rúbrica estática (`R0`) puede haber inducido sobreoptimización hacia las señales de recompensa, lo que puede reducir la calidad general del lenguaje o generar respuestas sesgadas hacia el formato de razonamiento.
- No se han evaluado sesgos específicos del modelo. Como modelo entrenado sobre un corpus médico, puede reflejar sesgos presentes en los datos de entrenamiento.
- Existe riesgo de alucinación: el modelo puede generar información factualmente incorrecta o inventada, especialmente en dominios donde el conocimiento es limitado.
- Limitaciones de contexto: no se especifica la longitud de contexto en esta ficha; se recomienda asumir la del modelo base (32.768 tokens) pero no está confirmado para este checkpoint.
- Idiomas: no se indica qué idiomas soporta. El modelo base Qwen3-1.7B es multilingüe, pero el entrenamiento en dominio médico puede haber afectado el rendimiento en otros idiomas.
- Restricciones de uso: aunque la licencia es Apache 2.0 y permite uso comercial, el autor declara que es un artefacto de investigación y no asume responsabilidad por usos no previstos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-024
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
