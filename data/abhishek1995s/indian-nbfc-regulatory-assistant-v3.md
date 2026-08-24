# abhishek1995s/indian-nbfc-regulatory-assistant-v3

## Resumen

El modelo `abhishek1995s/indian-nbfc-regulatory-assistant-v3` es un adaptador LoRA (QLoRA) de 8B parámetros, construido sobre la base de `Qwen/Qwen3-8B`, desarrollado por el usuario `abhishek1995s`. Su propósito es servir como asistente de consulta y análisis para el marco regulatorio de las NBFC (Non-Banking Financial Companies) en India, es decir, las entidades financieras no bancarias reguladas por el Reserve Bank of India (RBI). El modelo se ha ajustado con un conjunto de datos en formato Alpaca (`train_v3.jsonl`) de contenido aparentemente orientado a la normativa NBFC, incluyendo la estructura de regulación basada en escalas (Scale-Based Regulation, SBR) del RBI.

La arquitectura es la de un transformer causal de 8B parámetros (Qwen3-8B) con adaptadores LoRA en las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), entrenado con QLoRA (cuantización de 4 bits) y una ventana de contexto de 2048 tokens. El adaptador pesa alrededor de 0.2 GB y se distribuye bajo licencia Apache-2.0. Su relevancia actual radica en la creciente complejidad del marco SBR del RBI (actualizado en 2025) y la necesidad de herramientas de consulta rápida para profesionales de cumplimiento y riesgo en el sector NBFC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-8B) con adaptadores LoRA (QLoRA) |
| Parámetros totales | 8,000 millones (base) + adaptador LoRA (r=16, alpha=32) |
| Parámetros activos | 8B (el adaptador LoRA añade un número mínimo de parámetros, no especificado) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | 4-bit bitsandbytes (entrenamiento); inferencia con el adaptador en fp16/bf16 (no se especifican cuantizaciones adicionales) |
| Idiomas soportados | no disponible (probablemente inglés, dado el contexto regulatorio indio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (QLoRA) sobre el modelo base `Qwen/Qwen3-8B`, que es un transformer causal con 8B parámetros y una ventana de contexto de 2048 tokens (el límite de secuencia se fijó en 2048 durante el entrenamiento). El entrenamiento se realizó con Axolotl 0.19.0, utilizando cuantización de 4-bit (bitsandbytes) para la base y un adaptador LoRA de rango 16 y alpha 32, aplicado a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). El conjunto de datos de entrenamiento (`train_v3.jsonl`) está en formato alpaca, con una pérdida final de 0.9611 y una perplejidad de 2.6146 en el conjunto de evaluación. Se emplearon 3 épocas, una tasa de aprendizaje de 0.00015 con programación coseno, optimizador paged_adamw_8bit, gradiente acumulado de 4 pasos (batch efectivo de 16) y flash attention. No se indica el uso de RLHF ni DPO; el ajuste es supervisado (SFT) sobre el dataset de instrucciones.

## Capacidades

- **Generación de texto y razonamiento**: al heredar las capacidades de Qwen3-8B, puede realizar tareas de generación de texto, razonamiento lógico y respuesta a preguntas en lenguaje natural.
- **Dominio específico**: ajustado para el contexto regulatorio de NBFCs en India, lo que le permite responder consultas sobre el marco SBR del RBI, requisitos de capital, gobernanza, prudencial, etc. (según el dataset de entrenamiento, que no se ha hecho público).
- **Tool calling / function calling**: no disponible en la información proporcionada, aunque la base Qwen3-8B soporta esta capacidad; no se confirma si se preservó en el adaptador.
- **Soporte de agentes**: no disponible, no se menciona.
- **Capacidades multilingües**: no disponible, aunque la base Qwen3-8B es multilingüe, el adaptador puede haberse limitado a inglés o hindi.
- **Capacidades especiales**: ninguna adicional más allá de la base (no hay visión, audio ni modo thinking específico).

## Casos de uso

- **Asistente de cumplimiento normativo**: el modelo puede responder preguntas concretas sobre el marco SBR del RBI, ayudando a responsables de cumplimiento de NBFCs a interpretar requisitos de capital y gobernanza. Su ventana de 2048 tokens permite manejar consultas con referencias a párrafos regulatorios extensos.
- **Revisión de políticas internas**: puede utilizarse para comparar borradores de políticas de una NBFC con la regulación vigente, generando alertas sobre posibles desviaciones normativas (por ejemplo, límites de apalancamiento o requisitos de reporting).
- **Formación de personal**: como herramienta de formación interactiva para empleados de entidades NBFC, que pueden preguntar sobre procedimientos de registro, presentación de informes al RBI o categorías de NBFC (por escala, depósito, etc.).
- **Análisis de impacto regulatorio**: útil para asesores jurídicos y consultores que necesiten resumir cómo una nueva circular del RBI afecta a un tipo concreto de NBFC, dado que el modelo puede generar resúmenes de textos regulatorios.
- **Soporte a auditorías internas**: puede ayudar a preparar listas de verificación de auditoría, generando preguntas de verificación basadas en el marco SBR y las áreas de prudencial.
- **Redacción de respuestas a requerimientos del RBI**: puede redactar borradores de respuestas a cartas o requerimientos de información del regulador, basándose en plantillas y normativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el proporcionado en el entrenamiento: la pérdida de validación final fue 0.9611 y la perplejidad 2.6146 en el conjunto de evaluación (eval_v3.jsonl), pero no se trata de benchmarks estandarizados (MMLU, HumanEval, etc.). No se pueden comparar con otros modelos sin datos adicionales.

## Requisitos de hardware

- **VRAM para inferencia**: al ser un adaptador LoRA sobre Qwen3-8B, la inferencia requiere cargar la base (8B) más el adaptador. En cuantización 4-bit de la base, se estima un uso de ~6-8 GB de VRAM; en fp16, ~16 GB. El adaptador LoRA añade un pequeño overhead (menos de 1 GB).
- **GPU recomendadas**: puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 (24 GB) o RTX 4060 Ti (16 GB) en 4-bit; para fp16 se requiere una GPU con al menos 16 GB (RTX 4080, A100 40 GB, etc.).
- **Sí cabe en GPU de consumo**: sí, especialmente en cuantización 4-bit, es viable en tarjetas de 8-16 GB.
- **Opciones de despliegue**: al ser un adaptador PEFT, puede cargarse con `transformers` + `peft` para inferencia; también es compatible con vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF con el adaptador fundido), o TGI (con soporte de adaptadores). No hay instrucciones específicas de despliegue.
- **Latencia y throughput**: no disponible; no se han publicado datos de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abhishek1995s/indian-nbfc-regulatory-assistant-v3` (este) | 8B (base) + LoRA | 2048 | Regulación NBFC (India) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-8B (base) | 8B | 2048 (original) | Generalista | Apache-2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128K | Generalista instruct | Llama 3.1 (uso comercial permitido) | HuggingFace, Meta |
| Mistral-7B-Instruct | 7B | 32K | General instruct | Apache-2.0 | HuggingFace |

No hay comparación directa con otros adaptadores específicos de NBFC o regulación india en la información disponible; los modelos comparados son alternativas generalistas de tamaño similar. La principal diferencia es el ajuste especializado en NBFC, que puede mejorar el rendimiento en tareas regulatorias específicas frente a los generalistas, aunque no hay datos cuantitativos para confirmarlo.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un ajuste sobre un dataset no público, existe riesgo de alucinación en consultas fuera del dominio regulatorio; la base Qwen3-8B puede generar información plausible pero incorrecta. No se ha evaluado la veracidad de las respuestas en el dominio NBFC.
- **Alcance del dominio**: el dataset de entrenamiento es desconocido y probablemente limitado en tamaño (261 pasos de entrenamiento, 3 épocas). No cubre toda la normativa del RBI ni actualizaciones posteriores a la fecha de entrenamiento (agosto de 2026). No debe usarse como fuente única de asesoramiento legal.
- **Idioma**: no se especifican idiomas soportados; si el dataset era solo en inglés, el rendimiento en hindi u otras lenguas indias será limitado.
- **Licencia**: aunque la licencia es Apache-2.0 (permite uso comercial), la base Qwen3-8B también es Apache-2.0, por lo que no hay restricción de uso comercial, pero se recomienda revisar la licencia de la base.
- **Producción**: no hay garantías de robustez en entornos de producción; el modelo no ha sido evaluado en tareas de razonamiento complejo ni en conversaciones de largo recorrido (contexto limitado a 2048 tokens). La inferencia con adaptador LoRA requiere un pipeline de integración adicional (carga con PEFT).
- **Reproducibilidad**: el dataset de entrenamiento y evaluación no es público, lo que impide reproducir el ajuste o evaluar su calidad con datos externos.

## Enlaces

- [HuggingFace: abhisheik1995s/indian-nbfc-regulatory-assistant-v3](https://huggingface.co/abhisheik1995s/indian-nbfc-regulatory-assistant-v3)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Axolotl (framework de entrenamiento)](https://github.com/axolotl-ai-cloud/axolotl)
- [Regulación NBFC del RBI (información de contexto)](https://www.rbi.org.in/Scripts/BS_NBFCNotificationView.aspx?Id=12179)
- [Guía del marco regulatorio NBFC (RMA India)](https://rmaindia.org/nbfc-regulatory-framework-in-india-a-complete-guide-for-risk-professionals/)
- [Documento sobre regulación dinámica de NBFC (IJSAT)](https://www.ijsat.org/papers/2025/4/8605.pdf)
