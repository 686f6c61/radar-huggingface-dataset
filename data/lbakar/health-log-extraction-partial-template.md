# lbakar/health-log-extraction-partial-template

## Resumen

El modelo `lbakar/health-log-extraction-partial-template` es un fine-tune del modelo Qwen3-0.6B, desarrollado por el usuario lbakar, orientado a la extracción de información estructurada de salud a partir de entradas de diario escritas en lenguaje natural. Su objetivo es convertir textos informales (por ejemplo, "he salido a correr y me duelen las piernas") en plantillas JSON con campos como actividad, comida, estado de ánimo, síntomas o tratamiento. Se trata de una prueba de concepto que cubre solo una parte de las plantillas del dataset original, por lo que su rendimiento es inferior al del modelo completo, pero demuestra la viabilidad de la técnica.

El modelo tiene 596 millones de parámetros, hereda la arquitectura transformer de Qwen3-0.6B y está disponible bajo licencia Apache-2.0. Está entrenado exclusivamente en inglés y su peso se distribuye en formato safetensors. Al ser un modelo pequeño, es adecuado para entornos con recursos limitados y para tareas de extracción de información específicas, aunque su alcance está restringido a las plantillas definidas en el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B fine-tuned) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp16/fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3-0.6B, un modelo de lenguaje pequeño pero eficiente. El proceso de entrenamiento consiste en un fine-tune supervisado sobre el dataset `lbakar/health-log-extraction-dataset`, que contiene ejemplos de entradas de diario con sus correspondientes plantillas JSON de extracción. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación principal radica en el uso de plantillas parciales: el modelo se entrena para rellenar una única sub-plantilla (por ejemplo, solo tratamiento o solo actividad) en lugar de la plantilla completa, lo que reduce la complejidad pero también limita su capacidad de extracción global.

## Capacidades

- Extracción de información estructurada en formato JSON a partir de texto libre en inglés.
- Soporte de plantillas específicas para dominios de salud: actividad, comida, estado de ánimo, síntomas y tratamiento.
- Generación de campos con tipos definidos (cadenas, listas, enumeraciones como "taken", "recommended", "postponed", "missed").
- Manejo de entradas de diario con lenguaje informal y coloquial.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni visión.
- Multilingüe limitado: solo inglés.

## Casos de uso

- Registro personal de salud: un usuario escribe en su diario "hoy he caminado 30 minutos y me siento cansado", y el modelo extrae la actividad (tipo: physical, duración: 30 minutos) y el estado de ánimo (descripción: cansado, clasificación: negative). Esto permite automatizar el seguimiento de hábitos sin formularios estructurados.
- Monitorización de adherencia a medicación: a partir de frases como "me he tomado la pastilla de la tarde", el modelo rellena la plantilla de tratamiento con el nombre, dosis y estado "taken". Útil para apps de recordatorio de medicamentos.
- Análisis de síntomas en consultas médicas: un paciente describe "me duele la cabeza desde ayer", y el modelo extrae los síntomas (keywords: dolor de cabeza, descripción: desde ayer). Puede integrarse en sistemas de triaje inicial.
- Seguimiento nutricional: entradas como "he comido una ensalada y no he tomado postre" se convierten en la plantilla de comida con consumed_items y missing_items. Facilita el registro dietético.
- Clasificación de estados de ánimo en aplicaciones de bienestar: el modelo identifica si una entrada es positiva, neutral o negativa, permitiendo generar estadísticas de humor a lo largo del tiempo.
- Extracción de actividades en programas de rehabilitación: un fisioterapeuta pide al paciente que anote sus ejercicios; el modelo estructura la información (tipo, duración, ubicación) para su posterior análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo es menos efectivo que el modelo completo de extracción, pero no proporciona métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 596M parámetros, en fp16 ocupa aproximadamente 1,2 GB, más overhead de activaciones. Cabe en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, por ejemplo RTX 3050, RTX 3060, GTX 1660 Super, o incluso CPU con suficiente RAM.
- Es adecuado para despliegue en entornos edge o en la nube con instancias pequeñas (T4, L4).
- Opciones de despliegue: transformers (Python), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo pequeño, la inferencia es rápida en GPU moderna (del orden de decenas de milisegundos por generación corta).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| lbakar/health-log-extraction-partial-template | 596M | no disponible | Apache-2.0 | Extracción de salud con plantillas parciales |
| Qwen/Qwen3-0.6B (base) | 596M | 32k (según documentación oficial) | Apache-2.0 | Modelo generalista, sin fine-tune específico |
| Otros modelos de extracción de información (p.ej. langextract) | no comparable | no comparable | no comparable | Librería, no modelo |

La comparativa directa con otros modelos de extracción de información de salud no está disponible en la información proporcionada. El modelo se distingue por ser un fine-tune ligero y específico, mientras que el base Qwen3-0.6B es un modelo generalista que requeriría prompting adicional para lograr resultados similares.

## Limitaciones y advertencias

- Es una prueba de concepto: el autor advierte que el rendimiento es inferior al modelo completo de extracción debido a la falta de detalle en las plantillas parciales.
- Solo cubre un subconjunto de plantillas; no extrae información fuera de los dominios definidos (actividad, comida, humor, síntomas, tratamiento).
- Riesgo de alucinación: al ser un modelo pequeño, puede generar campos incorrectos o inventar valores si la entrada es ambigua.
- Limitado al inglés; no soporta otros idiomas.
- No se han publicado evaluaciones de sesgos ni de robustez ante entradas adversas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está validado para uso clínico real; debe considerarse solo como herramienta de apoyo.
- No se proporcionan garantías de precisión ni de seguridad para entornos de producción sanitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lbakar/health-log-extraction-partial-template
- Dataset de entrenamiento: https://huggingface.co/datasets/lbakar/health-log-extraction-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
