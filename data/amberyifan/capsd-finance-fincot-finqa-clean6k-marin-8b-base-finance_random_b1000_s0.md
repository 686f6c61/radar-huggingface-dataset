# AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_random_b1000_s0

## Resumen

El modelo `capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_random_b1000_s0` es un ajuste fino (fine-tuning) completo del modelo base `marin-community/marin-8b-base`, especializado en el dominio financiero. Ha sido entrenado por el usuario AmberYifan sobre un conjunto de datos denominado `capsd_marin-8b-base-n6000-finance-fincot-finqa-clean6k__mix_finance_random_b1000_s0`, que combina aparentemente datos de los conjuntos FinCOT y FinQA, orientados a razonamiento y respuesta a preguntas sobre finanzas. El modelo conserva la arquitectura base (tipo Llama) y un tamaño de 8.030 millones de parámetros, lo que lo sitúa en la gama de modelos de 8B aptos para despliegue en hardware de consumo con cuantización.

La relevancia de este modelo radica en su especialización sectorial: al ser un ajuste fino sobre datos financieros, pretende mejorar el rendimiento en tareas como extracción de información de informes financieros, razonamiento numérico y análisis de documentos corporativos, en comparación con el modelo base genérico. Sin embargo, la información pública es limitada: no se han publicado métricas de evaluación, descripciones detalladas de capacidades ni restricciones de uso explícitas. El entrenamiento se realizó con una única época, una tasa de aprendizaje de 1e-5 y un tamaño de lote efectivo de 64, lo que sugiere un ajuste conservador para evitar el olvido catastrófico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (derivada de `marin-8b-base`) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Modelo base | `marin-community/marin-8b-base` |
| Dataset de entrenamiento | `capsd_marin-8b-base-n6000-finance-fincot-finqa-clean6k__mix_finance_random_b1000_s0` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `marin-8b-base`, que según las etiquetas del repositorio emplea una arquitectura tipo Llama (transformador causal con atención multi-cabeza). No se dispone de detalles adicionales sobre posibles innovaciones (atención lineal, decodificación especulativa, etc.) en la información pública. El ajuste fino se realizó con el framework `llama-factory` en modo "full", es decir, actualizando todos los parámetros del modelo, no solo adaptadores LoRA. El entrenamiento usó 4 GPUs, un tamaño de lote por dispositivo de 2 con 8 pasos de acumulación de gradiente (lote efectivo de 64), optimizador AdamW, programador de tasa de aprendizaje coseno con un warmup del 3% y una única época. No se menciona el uso de RLHF ni DPO; el proceso es un fine-tuning supervisado estándar sobre datos financieros.

El conjunto de datos combina aparentemente muestras de FinCOT (razonamiento de cadena de pensamiento en finanzas) y FinQA (respuesta a preguntas con razonamiento numérico sobre informes financieros), con un total de 6.000 ejemplos limpios (según el nombre "clean6k"). No se especifica la composición exacta ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje causal, puede generar respuestas coherentes a partir de un prompt.
- Razonamiento financiero: entrenado sobre datos de FinQA y FinCOT, se espera que maneje preguntas que requieren extraer datos numéricos de informes y realizar cálculos simples.
- Respuesta a preguntas sobre finanzas: orientado a tareas de question answering en el dominio financiero.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible (el modelo base podría ser multilingüe, pero no se especifica).
- Modo de pensamiento o razonamiento explícito: no disponible.

## Casos de uso

- Análisis de informes anuales: el modelo puede extraer magnitudes clave (ingresos, beneficios, deuda) de documentos financieros y responder preguntas concretas, gracias a su entrenamiento en FinQA.
- Asistente para analistas de inversión: dado un fragmento de un informe 10-K o 10-Q, el modelo puede resumir tendencias o calcular ratios financieros básicos.
- Automatización de extracción de datos en banca: procesar estados financieros de clientes o contrapartes para rellenar formularios de crédito.
- Educación financiera: generar explicaciones sencillas de conceptos financieros a partir de preguntas del usuario.
- Verificación de datos en noticias económicas: contrastar cifras mencionadas en artículos con fuentes estructuradas (si se le proporcionan ambas).
- Generación de informes de cumplimiento: redactar borradores de resúmenes regulatorios basados en datos numéricos de operaciones.

Estos casos son potenciales, dado el dominio del entrenamiento, pero no se han validado públicamente con benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card está vacía. No se pueden comparar métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8.030 millones de parámetros, en precisión FP16 se requieren aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), la demanda baja a unos 5-6 GB, y con 8 bits a unos 8-9 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) puede ejecutar el modelo en FP16 o 8 bits con comodidad. Una RTX 3060 (12 GB) podría funcionar con cuantización de 4 bits. Para despliegue multi-usuario, se recomienda una A100 o H100.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 bits cabe en GPUs con 8 GB o más, aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un modelo de tipo Llama con pesos en safetensors, es compatible con `transformers` (Python), `vLLM` (para alta concurrencia), `llama.cpp` (CPU/GPU, formato GGUF si se convierte), `Ollama` (si se convierte a GGUF) y `Text Generation Inference` (TGI).
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización; en una RTX 4090 con cuantización de 4 bits se podría esperar una latencia de decodificación de 20-40 ms por token, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre el rendimiento del modelo en benchmarks, por lo que no se puede realizar una comparativa cuantitativa. A continuación se presenta una comparación estructural con otros modelos de 8B de propósito general, basada en características públicas:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (fine-tune financiero) | 8.03B | no disponible | other | Especializado en finanzas |
| Llama 3.1 8B | 8.03B | 128K | Llama 3.1 | Propósito general, multilingüe |
| Mistral 7B | 7.3B | 32K | Apache 2.0 | Propósito general, eficiente |
| Gemma 2 9B | 9.2B | 8K | Gemma license | Propósito general, de Google |

La comparación real de rendimiento en tareas financieras no es posible sin datos de evaluación. El modelo base `marin-8b-base` no es ampliamente conocido; no se dispone de sus métricas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino sobre un conjunto de datos financiero específico (FinCOT/FinQA), el modelo puede tener sesgos hacia el estilo y vocabulario de esos conjuntos, y no generalizar bien a otros tipos de texto financiero (por ejemplo, contratos legales o informes de investigación).
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar cifras o afirmaciones falsas con alta fluidez. No se ha evaluado su fiabilidad en tareas numéricas.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto; si el modelo base tiene un límite bajo (por ejemplo, 4K tokens), no será adecuado para documentos extensos.
- Restricciones de licencia: la licencia es "other", lo que implica que no se especifican los términos de uso. Es necesario contactar al autor o consultar la licencia del modelo base (`marin-8b-base`) para determinar si se permite uso comercial.
- Falta de evaluación: no hay benchmarks públicos, por lo que su rendimiento real en tareas financieras es desconocido. Se recomienda validar internamente antes de usarlo en producción.
- Datos de entrenamiento: el conjunto de datos no está disponible públicamente (solo se menciona el nombre), lo que dificulta la auditoría de sesgos y calidad.

## Enlaces

- HuggingFace: https://huggingface.co/AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_random_b1000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
- No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
