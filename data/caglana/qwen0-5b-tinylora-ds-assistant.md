# Caglana/qwen0.5b-tinylora-ds-assistant

## Resumen

El modelo `Caglana/qwen0.5b-tinylora-ds-assistant` es un adaptador PEFT basado en TinyLoRA que especializa el modelo `Qwen/Qwen2.5-0.5B-Instruct` como asistente de ciencia de datos. Desarrollado por Caglana, este adaptador permite responder preguntas conceptuales sobre ciencia de datos y generar código ejecutable en pandas, matplotlib, scikit-learn, estadística y SQL. La propuesta de TinyLoRA, descrita en el artículo arXiv 2602.04118, sustituye la factorización clásica de LoRA (matrices A/B) por un conjunto de matrices de proyección aleatorias congeladas y un vector de pesos entrenable, reduciendo drásticamente el número de parámetros ajustables.

El adaptador entrena únicamente 21.504 escalares (un 0,004% de los ~494 millones de parámetros del modelo base) distribuidos en 7 módulos objetivo y 24 capas transformer. Esta eficiencia permite ajustar el modelo con un subconjunto de 50.000 muestras de un corpus sintético de ciencia de datos, logrando reducir la perplejidad a la mitad en el conjunto de validación. El modelo resultante es extremadamente ligero y puede ejecutarse en entornos con recursos limitados, aunque su dominio de aplicación es estrictamente acotado a tareas de ciencia de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con adaptador TinyLoRA |
| Parámetros totales | ~494M (modelo base) + 21.504 (adaptador) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TinyLoRA es una variante de LoRA que congela un conjunto de matrices de proyección aleatorias y entrena un vector de pesos `v` sobre ellas, de modo que la actualización de pesos se expresa como `ΔW = Σᵢ vᵢ Pᵢ`. En este adaptador, se emplean 7 módulos objetivo (`q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`) en las 24 capas del modelo Qwen2.5-0.5B, con un rango `r=2` y un ancho de vector `u=128`. El entrenamiento se realizó con el optimizador AdamW (lr=2e-3), un batch efectivo de 32, precisión bf16 y early stopping sobre la pérdida de validación con paciencia 5.

Los datos de entrenamiento provienen de un corpus sintético generado por el mismo proyecto `tiny_lora`, que incluye preguntas conceptuales y tareas de código en pandas, matplotlib, scikit-learn, estadística y SQL. El corpus completo contiene ~2 millones de registros, pero este run utilizó un subconjunto de 50.000 muestras con 500 de validación, ya que TinyLoRA satura sus ~21.000 parámetros entrenables antes de ver el corpus completo. El checkpoint final (paso 5750, época ≈3,68) alcanzó una pérdida de 1,86 y una perplejidad de ~6,4 en la partición de validación, frente a 2,58 y ~13,2 del modelo base sin adaptar.

## Capacidades

- Generación de respuestas a preguntas conceptuales sobre ciencia de datos (estadística, análisis de datos, machine learning básico).
- Escritura de código ejecutable en pandas para manipulación y limpieza de datos.
- Generación de visualizaciones con matplotlib (gráficos de líneas, barras, dispersión, etc.).
- Creación de scripts de scikit-learn para modelos supervisados y no supervisados básicos.
- Redacción de consultas SQL para extracción y agregación de datos.
- Soporte de formatos de chat mediante la plantilla de Qwen2.5-Instruct (conversación multi-turno básica).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso avanzado.

## Casos de uso

- Asistente en notebooks Jupyter: el modelo puede generar fragmentos de código pandas o matplotlib directamente en celdas, reduciendo el tiempo de escritura de análisis exploratorios.
- Automatización de tareas de limpieza de datos: dada una descripción del problema (eliminar nulos, renombrar columnas, filtrar filas), el adaptador produce el código correspondiente.
- Generación de consultas SQL para bases de datos relacionales: útil en entornos de análisis donde se necesita extraer agregados o unir tablas sin conocer la sintaxis exacta.
- Soporte educativo en cursos de ciencia de datos: explica conceptos como regresión, distribución normal o validación cruzada con ejemplos breves.
- Generación de visualizaciones rápidas: a partir de una especificación textual (tipo de gráfico, ejes, título), el modelo produce el código matplotlib listo para ejecutar.
- Integración en pipelines de datos ligeros: al ser un modelo de 0,5B, puede desplegarse en servicios serverless o en edge devices para generar scripts de transformación bajo demanda.
- Prototipado de scripts de scikit-learn: para clasificación, regresión o clustering con datasets pequeños, el modelo ofrece código base que luego se puede ajustar.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre la partición de validación (500 muestras):

| Métrica | Modelo base (sin adaptador) | Con adaptador TinyLoRA |
|---|---|---|
| eval_loss | 2,58 | 1,86 |
| Perplejidad | ~13,2 | ~6,4 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos presentados muestran una reducción significativa de la perplejidad en el dominio específico de ciencia de datos, pero no permiten comparar el rendimiento general con otros modelos.

## Requisitos de hardware

- Al tratarse de un adaptador sobre un modelo base de 0,5B, los requisitos de inferencia son los de Qwen2.5-0.5B-Instruct: aproximadamente 1 GB de VRAM en bf16, y menos de 2 GB con cuantización.
- Puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060, GTX 1660 o incluso en CPU con suficiente RAM (4-8 GB).
- El adaptador añade una sobrecarga despreciable (21.504 parámetros) y no requiere memoria adicional significativa.
- Opciones de despliegue: librería `transformers` con `peft` (desde GitHub), y cualquier framework que soporte modelos PEFT. No se ha documentado compatibilidad con vLLM, llama.cpp u Ollama para adaptadores PEFT.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo pequeño, la generación de 256 tokens suele completarse en menos de un segundo en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia |
|---|---|---|---|---|
| `Caglana/qwen0.5b-tinylora-ds-assistant` | ~494M + 21.504 | no disponible | Ciencia de datos (pandas, matplotlib, scikit-learn, SQL) | Apache 2.0 |
| `Qwen/Qwen2.5-0.5B-Instruct` (base) | ~494M | 32k (según documentación oficial) | Chat general, código, multilingüe | Apache 2.0 |
| `Balasandhya/llm-tool-call-lora-Qwen0.5B` (ejemplo de adaptador similar) | ~494M + adaptador | no disponible | Llamada a herramientas | Apache 2.0 (presumible) |

La comparativa se limita a aspectos generales por falta de datos públicos de rendimiento. El adaptador TinyLoRA se distingue por su extremadamente baja cantidad de parámetros entrenables frente a adaptadores LoRA convencionales, aunque su capacidad de generalización fuera del dominio de ciencia de datos es limitada.

## Limitaciones y advertencias

- El modelo base de 0,5B tiene una capacidad limitada para razonamiento multi-paso complejo; no es competitivo con modelos de mayor tamaño en tareas que requieren lógica avanzada.
- El dominio de especialización es estrictamente ciencia de datos; su rendimiento en conversación general, creatividad o tareas fuera de este ámbito es pobre.
- Los guardarraíles de identidad (por ejemplo, responder como "Qwen" o "Alibaba") no están integrados en el adaptador; el uso directo de `generate()` puede producir respuestas que revelen la identidad del modelo base. La implementación de seguridad debe realizarse en la capa de aplicación.
- La instalación requiere PEFT desde la rama `main` de GitHub, ya que TinyLoRA no está disponible en una versión estable de PyPI.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos sintéticos, podría heredar sesgos del corpus generado.
- El riesgo de alucinación en código es moderado: puede producir código sintácticamente válido pero con errores lógicos, por lo que se recomienda verificación humana en entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/Caglana/qwen0.5b-tinylora-ds-assistant
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper TinyLoRA: https://arxiv.org/abs/2602.04118
- Repositorio del proyecto: https://github.com/caglanakpinar/llm_with_tiny_lora
