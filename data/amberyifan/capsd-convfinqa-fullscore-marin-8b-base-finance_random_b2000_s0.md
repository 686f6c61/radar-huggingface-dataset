# AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_random_b2000_s0

## Resumen

El modelo `AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_random_b2000_s0` es un ajuste fino (fine-tuning) completo del modelo base `marin-community/marin-8b-base`, realizado por el usuario AmberYifan. Está orientado a tareas de respuesta a preguntas financieras en contexto conversacional, como sugiere el nombre del dataset de entrenamiento (`convfinqa`). El modelo tiene aproximadamente 8 030 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 16,1 GB.

Este ajuste se ha entrenado con una sola época sobre un dataset mixto de finanzas, utilizando hiperparámetros conservadores (learning rate 1e-5, batch efectivo de 64). Aunque no se han publicado resultados de evaluación, el modelo podría ser útil como punto de partida para aplicaciones de análisis financiero conversacional, aunque su licencia genérica ("other") y la falta de documentación detallada limitan su uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican "llama", probablemente transformer, sin confirmar) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full) de `marin-community/marin-8b-base`, un modelo base de aproximadamente 8B parámetros. No se proporcionan detalles sobre la arquitectura interna del modelo base, aunque los tags indican que está relacionado con la familia Llama. El entrenamiento se realizó con el framework Transformers 5.7.0, PyTorch 2.13.0+cu130 y Datasets 4.0.0, utilizando el dataset `capsd_marin-8b-base-n11082-finance-convfinqa-fullscore__mix_finance_random_b2000_s0`.

Los hiperparámetros de entrenamiento fueron: learning rate de 1e-5, batch de entrenamiento de 2 por dispositivo (4 GPUs), acumulación de gradientes de 8 (batch efectivo de 64), batch de evaluación de 8, optimizador AdamW con betas (0.9, 0.999), scheduler de learning rate coseno con warmup del 3% de los pasos, y una sola época. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento parece ser supervisado convencional.

## Capacidades

- Generación de texto conversacional: el pipeline es `text-generation`, por lo que puede generar respuestas en formato de diálogo.
- Especialización en finanzas: el dataset de entrenamiento (`convfinqa`) sugiere que el modelo está adaptado a responder preguntas sobre datos financieros, aunque no hay documentación que confirme el alcance exacto.
- Compatible con `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de Hugging Face.
- No se han reportado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente virtual para consultas financieras: el modelo puede integrarse en un chatbot para responder preguntas sobre estados financieros, ratios o indicadores económicos, aprovechando su entrenamiento en datasets conversacionales de finanzas.
- Análisis de informes anuales: dado su contexto conversacional, podría usarse para extraer respuestas a preguntas específicas sobre documentos financieros, aunque se requiere validación con datos reales.
- Generación de resúmenes financieros: puede generar explicaciones breves de métricas o resultados, útil para automatizar reportes internos.
- Educación financiera: como herramienta de apoyo para explicar conceptos financieros en un formato interactivo, aunque su precisión no está garantizada.
- Preprocesamiento de datos: podría emplearse para normalizar o estructurar preguntas financieras antes de pasarlas a otros sistemas.
- Investigación académica: como modelo de referencia para estudiar el impacto del fine-tuning en dominios específicos, dado que es un experimento documentado con hiperparámetros claros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `results` del modelo está vacío, por lo que no hay datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. Se recomienda evaluar el modelo en tareas financieras concretas antes de considerarlo para uso real.

## Requisitos de hardware

- El modelo tiene 8B parámetros y un tamaño de repositorio de 16,1 GB, lo que implica que en precisión FP16 necesita al menos 16 GB de VRAM para inferencia.
- GPU recomendadas: tarjetas con 24 GB o más (por ejemplo, RTX 3090/4090, A10G, A100) para cargar el modelo completo sin cuantización.
- Es posible ejecutarlo en GPUs de consumo con cuantización (por ejemplo, 4 bits) si se dispone de las herramientas adecuadas, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: al ser compatible con `text-generation-inference` y `endpoints_compatible`, puede servirse con TGI, vLLM, o mediante la API de Hugging Face Inference Endpoints. También es compatible con llama.cpp si se convierte a GGUF, aunque no se suministra ese formato.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes financieros de 8B). El modelo base `marin-community/marin-8b-base` no tiene documentación pública en este contexto, por lo que no es posible establecer una comparativa objetiva. Se sugiere comparar con otros modelos financieros de tamaño similar (por ejemplo, FinGPT o BloombergGPT) una vez se tengan datos de evaluación.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay métricas que respalden su rendimiento, por lo que no se recomienda su uso en producción sin una validación exhaustiva.
- Licencia "other": los términos de uso no están especificados, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios financieros donde la precisión es crítica.
- Idioma no especificado: se desconoce qué idiomas soporta correctamente, aunque el nombre del dataset sugiere inglés.
- Contexto limitado: no se indica la longitud de contexto, lo que puede restringir su uso en conversaciones largas o documentos extensos.
- Documentación insuficiente: la model card está generada automáticamente y carece de detalles sobre el dataset, el preprocesamiento y los criterios de evaluación.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_random_b2000_s0)
- [Modelo base: marin-community/marin-8b-base](https://huggingface.co/marin-community/marin-8b-base)
