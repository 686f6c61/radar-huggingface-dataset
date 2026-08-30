# ArjunShukla/PromptForge-Quality

## Resumen

PromptForge-Quality es un modelo de clasificación de texto desarrollado por PromptForge contributors que actúa como un evaluador multidimensional de la calidad de prompts para modelos de lenguaje. Se trata de un fine-tuning del encoder `answerdotai/ModernBERT-base` (~150 millones de parámetros) al que se le añaden cabezas de regresión múltiple que predicen una puntuación de calidad en una escala de 0 a 100 en siete dimensiones: claridad, especificidad, contexto, definición de objetivo, restricciones, completitud y accionabilidad, además de una puntuación global agregada.

El modelo resuelve el problema de evaluar objetivamente la calidad de un prompt antes de enviarlo a un LLM, permitiendo diagnosticar carencias estructurales y medir mejoras tras un proceso de optimización. Su relevancia radica en que ofrece una herramienta ligera, local y de código abierto (licencia MIT) para integrar en pipelines de desarrollo de aplicaciones con IA generativa, linters de prompts o sistemas de filtrado de datasets sintéticos. La longitud de contexto está limitada a 512 tokens según el entrenamiento, y el modelo está pensado exclusivamente para el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base) con cabezas de regresión múltiple |
| Parametros totales | ~150 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max length de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 0.6 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional optimizado para eficiencia y velocidad. Sobre este se añaden cabezas de regresión que producen ocho salidas continuas: siete puntuaciones por dimensión y una puntuación global de calidad. El entrenamiento se realizó con aproximadamente 25.000 prompts sintéticos que abarcan tareas de codificación, escritura, investigación, datos y creatividad, con niveles de calidad que van desde frases vagas hasta prompts completamente especificados. Las etiquetas incluyen la puntuación global y las siete puntuaciones dimensionales, todas en rango 0-100.

El procedimiento de entrenamiento utilizó 3 épocas, precisión fp16, una longitud máxima de 512 tokens y se ejecutó en una NVIDIA RTX 5060 Laptop de 8 GB durante unos 33 minutos. No se emplearon técnicas de RLHF ni DPO; se trata de un problema de regresión supervisada. El modelo también genera salidas auxiliares como problemas detectados (por ejemplo, `too_vague`, `missing_context`) y sugerencias de información faltante, lo que lo convierte en una herramienta de diagnóstico más que en un simple puntuador.

## Capacidades

- Puntuación de calidad de prompts en escala 0-100 en siete dimensiones: claridad, especificidad, contexto, definición de objetivo, restricciones, completitud y accionabilidad.
- Generación de una puntuación global agregada (`quality_score`).
- Detección de problemas específicos en el prompt, como vaguedad o falta de contexto.
- Sugerencias de información faltante (`missing_information`) para guiar la mejora.
- Funcionamiento local y offline mediante la CLI y la API de Python del paquete `tuneprompt`.
- Integración con el modelo complementario PromptForge-Optimizer (Qwen2.5-1.5B LoRA) para pipelines de puntuación → optimización → re-puntuación.
- No es un generador de texto; es un clasificador/regresor especializado en evaluación de prompts.

## Casos de uso

- Linter de prompts en entornos de desarrollo: el modelo puede integrarse en IDEs o editores para advertir a los desarrolladores sobre prompts vagos o incompletos antes de ejecutarlos contra un LLM, gracias a su baja latencia y su capacidad de diagnóstico.
- Filtrado y ranking de datasets sintéticos de prompts: permite ordenar o descartar prompts de baja calidad en la construcción de corpus de entrenamiento o evaluación, usando la puntuación global como criterio de selección.
- Medición de mejora en pipelines de optimización de prompts: combinado con PromptForge-Optimizer, se puede cuantificar el impacto de una reescritura comparando las puntuaciones antes y después, lo que facilita la validación objetiva de cambios.
- Evaluación de calidad en agentes conversacionales: el modelo puede puntuar los prompts generados dinámicamente por un sistema multiagente para detectar carencias de contexto o de definición de objetivo antes de enviarlos al modelo de razonamiento.
- Herramientas de diagnóstico para equipos de prompt engineering: los responsables de diseñar prompts para aplicaciones de producción pueden usar el modelo para auditar sistemáticamente sus plantillas y recibir sugerencias de mejora en cada dimensión.
- Integración en pipelines de CI/CD: se puede añadir un paso de validación que puntúe los prompts versionados en el repositorio, fallando el build si la calidad cae por debajo de un umbral configurable.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados en un conjunto de validación y test retenidos de su entrenamiento local:

| Split | MAE | Pearson |
|---|---|---|
| Validacion | 2,73 | 0,993 |
| Test (puntuacion global) | 0,96 | 0,999 |

Adicionalmente, el coeficiente de Spearman para la puntuación global en el test es de 0,959. Estos valores indican una alta correlación con las etiquetas sintéticas de calidad, pero deben interpretarse con cautela: las etiquetas fueron generadas mediante heurísticas sobre prompts sintéticos, por lo que el rendimiento en prompts reales puede variar. No se han publicado comparaciones con otros modelos de puntuación de prompts en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene ~150 millones de parámetros; en fp16 ocupa aproximadamente 300 MB, y en fp32 alrededor de 600 MB. Cabe holgadamente en cualquier GPU con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 5060) es suficiente. También puede ejecutarse en CPU con baja latencia para inferencia por lotes.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero.
- Opciones de despliegue: la vía principal es el paquete `tuneprompt` (import `promptforge`), que ofrece CLI y API Python. También puede cargarse directamente con la librería `transformers` de HuggingFace. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, aunque al ser un encoder pequeño, su despliegue en servidores de inferencia es trivial.
- Latencia y throughput: no se proporcionan datos oficiales, pero dado el tamaño del modelo y su arquitectura encoder, se espera una latencia de milisegundos por prompt en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables en la información disponible. La categoría de puntuación de calidad de prompts es emergente y no existen alternativas consolidadas con las que comparar parámetros, contexto o rendimiento. Como referencia, el modelo base `answerdotai/ModernBERT-base` tiene 149 millones de parámetros y soporta hasta 8192 tokens de contexto, pero no está especializado en evaluación de prompts. La comparativa con otros proyectos llamados "PromptForge" encontrados en la web (por ejemplo, `ArjunPisharody/PromptForge` o `prompt-forge.studio`) no es pertinente, ya que son herramientas de generación o comparación de prompts, no modelos de puntuación.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con prompts sintéticos etiquetados mediante heurísticas, por lo que puede favorecer la longitud o la estructura sobre la calidad semántica real.
- Las puntuaciones deben usarse de forma comparativa (antes vs. después) y no como calificaciones absolutas, especialmente en dominios especializados.
- Solo está verificado para el idioma inglés; su comportamiento en otros idiomas no ha sido evaluado.
- No es un moderador de contenido ni un clasificador de seguridad, y no debe usarse para juzgar la veracidad de las respuestas de un LLM.
- La jerga muy específica de un dominio puede dar lugar a puntuaciones inconsistentes.
- Para casos de uso críticos, se recomienda combinar las puntuaciones con revisión humana o reentrenar el modelo con datos etiquetados propios del dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArjunShukla/PromptForge-Quality
- Repositorio del proyecto: https://github.com/arjun988/promptModel
- Paquete en PyPI: https://pypi.org/project/tuneprompt/
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Modelo complementario (PromptForge-Optimizer): https://huggingface.co/ArjunShukla/PromptForge-Optimizer
