# AmberYifan/capsd-medcase-marin-8b-base-medicine_ppl_b8000_s0

## Resumen

El modelo `capsd-medcase-marin-8b-base-medicine_ppl_b8000_s0` es un ajuste fino (fine-tuning) completo del modelo base `marin-community/marin-8b-base`, desarrollado por el usuario AmberYifan. Está orientado al dominio médico, como sugiere el nombre del dataset de entrenamiento (`capsd_marin-8b-base-n13092-medicine-medcase__mix_medicine_ppl_b8000_s0`), que contiene aproximadamente 13 092 ejemplos de casos médicos. El objetivo es adaptar el modelo base a tareas de generación de texto relacionadas con la medicina, como la redacción de casos clínicos o el soporte a documentación sanitaria.

El modelo tiene 8 030 261 248 parámetros (aproximadamente 8 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio. La arquitectura subyacente es de tipo Llama, según las etiquetas de HuggingFace. No se especifica la longitud de contexto ni los idiomas soportados en la información disponible. La licencia es `other`, lo que implica restricciones no detalladas que deben consultarse con el autor.

La relevancia de este modelo radica en su especialización médica, un ámbito donde los modelos genéricos suelen carecer de precisión terminológica y de razonamiento clínico. Sin embargo, la falta de documentación y de resultados de evaluación limita su uso en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformers) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors en FP16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del modelo base `marin-community/marin-8b-base`, que a su vez es una arquitectura tipo Llama. El entrenamiento se realizó con el framework `llama-factory` (según las etiquetas) y utilizó los siguientes hiperparámetros: tasa de aprendizaje de 1e-05, tamaño de lote de entrenamiento de 2 (con acumulación de gradientes de 8, resultando en un lote efectivo de 64), tamaño de lote de evaluación de 8, optimizador AdamW, programador de tasa de aprendizaje coseno con un 3% de pasos de calentamiento, y una sola época. Se emplearon 4 GPUs en paralelo.

El dataset de entrenamiento, `capsd_marin-8b-base-n13092-medicine-medcase__mix_medicine_ppl_b8000_s0`, no está descrito en detalle en la model card. El nombre sugiere que contiene casos médicos (medcase) y una mezcla de datos de medicina con un criterio de selección basado en perplejidad (`ppl_b8000_s0`), pero no se proporciona información sobre su composición exacta, idioma o formato. Tampoco se menciona el uso de RLHF o DPO, por lo que se asume que el ajuste es supervisado.

## Capacidades

- Generación de texto en el dominio médico: el modelo está entrenado para producir texto relacionado con casos clínicos, aunque no se especifican las tareas concretas (p. ej., resúmenes, diagnósticos, narrativas).
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso o modo agente.
- No se han declarado capacidades multilingües; el idioma de entrenamiento es desconocido.
- No se mencionan capacidades de visión, audio u otras modalidades.
- Al ser un fine-tuning de un modelo base de 8B, conserva las capacidades generales de generación de texto del modelo base, pero sin datos verificados.

## Casos de uso

- Asistencia en la redacción de historiales clínicos: el modelo podría generar borradores de notas médicas estructuradas a partir de datos introducidos por el profesional, agilizando la documentación. Su especialización en casos médicos podría mejorar la coherencia terminológica.
- Resumen de casos clínicos para investigación: podría condensar extensos expedientes en resúmenes concisos, facilitando la revisión de literatura o la preparación de estudios de caso.
- Generación de material educativo para estudiantes de medicina: el modelo podría crear ejemplos de casos clínicos hipotéticos para prácticas de diagnóstico, aunque requeriría validación por expertos.
- Soporte a la codificación médica: podría ayudar a transformar descripciones clínicas en códigos estandarizados (p. ej., CIE-10), si el dataset incluye ese tipo de pares.
- Chatbots de información médica general: con un ajuste adicional y supervisión, podría emplearse en entornos controlados para responder preguntas frecuentes sobre síntomas o tratamientos, siempre con descargo de responsabilidad.
- Generación de informes de alta hospitalaria: el modelo podría redactar borradores de informes de alta a partir de datos clínicos, reduciendo la carga administrativa.

En todos los casos, es imprescindible una evaluación rigurosa por profesionales sanitarios antes de cualquier uso real, dado que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card está vacía (`results: []`), por lo que no existen datos objetivos sobre el rendimiento del modelo en tareas médicas o generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8 030 millones de parámetros en FP16, se requieren aproximadamente 16 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits, se reduce a unos 8 GB, y con 4 bits a unos 4-5 GB.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB), RTX A6000 (48 GB) o RTX 4090 (24 GB) son suficientes. Con cuantización, puede ejecutarse en GPUs consumer como RTX 3080 (10-12 GB) o RTX 4070 (12 GB).
- El modelo cabe en GPUs de consumo si se aplica cuantización (GGUF o AWQ), pero no se han publicado archivos cuantizados en el repositorio.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama (si se convierte a GGUF) y Text Generation Inference (TGI). Al ser un modelo de transformers estándar, se puede servir con cualquier framework que soporte Llama.
- Latencia y throughput: no se han publicado datos. Como referencia, un modelo de 8B en una RTX 4090 con FP16 suele generar entre 20 y 40 tokens por segundo, pero esto depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

Dado que no se dispone de información sobre el modelo base `marin-community/marin-8b-base`, la comparación se limita a parámetros y licencia. Se comparan con otros modelos de ~8B de propósito general:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| capsd-medcase-marin-8b (este) | 8.03B | no disponible | other | HuggingFace |
| Llama 3.1 8B (Meta) | 8.03B | 128K | Llama 3.1 Community License | HuggingFace |
| Mistral 7B v0.3 | 7.24B | 32K | Apache 2.0 | HuggingFace |
| Gemma 2 9B (Google) | 9.24B | 8K | Gemma Terms of Use | HuggingFace |

La principal diferencia es que este modelo está especializado en medicina, mientras que los otros son de propósito general. La licencia `other` puede ser más restrictiva que Apache 2.0 o la licencia Llama, pero no se detalla.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de un modelo base no documentado, los sesgos del modelo base se desconocen. El dataset médico podría introducir sesgos demográficos o clínicos si no está balanceado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información médica falsa o incorrecta. Sin evaluación, este riesgo es especialmente alto en un dominio crítico como la salud.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados; el uso en producción requiere verificar estos parámetros.
- Restricciones de licencia: la licencia `other` no especifica los términos. Es imprescindible contactar con el autor antes de cualquier uso comercial o distribución.
- Carencia de documentación: la model card no describe el dataset, los objetivos de entrenamiento ni los resultados, lo que impide evaluar la calidad del ajuste.
- Para producción médica, se requiere una validación clínica exhaustiva y el cumplimiento de normativas (p. ej., GDPR, HIPAA), que no están garantizadas.

## Enlaces

- [HuggingFace: AmberYifan/capsd-medcase-marin-8b-base-medicine_ppl_b8000_s0](https://huggingface.co/AmberYifan/capsd-medcase-marin-8b-base-medicine_ppl_b8000_s0)
- Modelo base: [marin-community/marin-8b-base](https://huggingface.co/marin-community/marin-8b-base)

No se encontraron otros enlaces (papers, blogs, repos) en la información proporcionada.
