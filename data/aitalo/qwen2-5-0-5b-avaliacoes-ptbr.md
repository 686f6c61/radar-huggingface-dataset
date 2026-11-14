# aitalo/qwen2.5-0.5b-avaliacoes-ptbr

## Resumen

El modelo `aitalo/qwen2.5-0.5b-avaliacoes-ptbr` es un ajuste fino del modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario aitalo, orientado a la extracción de información estructurada a partir de reseñas de comercio electrónico en portugués de Brasil. Concretamente, transforma texto libre de opiniones de clientes en un objeto JSON que incluye sentimiento general, sentimiento por aspecto (entrega, producto, atención, precio), problema principal y una marca booleana de si la empresa debe actuar.

El modelo resuelve un problema acotado pero recurrente en analítica de voz del cliente: convertir texto no estructurado en datos tabulares fiables sin depender de un LLM grande en producción. Con solo 494 millones de parámetros y un contexto heredado de la familia Qwen2.5, es lo bastante pequeño para ejecutarse en una GPU de consumo o incluso en CPU, lo que lo hace atractivo para pipelines de procesamiento por lotes de bajo coste.

La relevancia actual radica en su enfoque: un ajuste QLoRA de 4 bits sobre un dataset de 4.942 reseñas etiquetadas por un modelo profesor (Qwen2.5-7B-Instruct-AWQ), con evaluación sobre un conjunto de test revisado manualmente. El autor reporta mejoras sustanciales frente al modelo base en validez de JSON (de 0,185 a 0,956) y en F1 macro de sentimiento (de 0,212 a 0,760), lo que demuestra que un modelo de 0,5B puede especializarse con eficacia en una tarea de extracción concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para entrenamiento; pesos publicados en safetensors (fp16/bf16 segun configuracion) |
| Idiomas soportados | Portugues (pt), con foco en portugues de Brasil |
| Licencia | Apache 2.0 (con advertencia del autor sobre los datos de entrenamiento) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2. El ajuste se realizó con QLoRA en 4 bits (NF4), con rango r=16, alpha=32 y aplicación sobre todos los módulos lineales. El entrenamiento consistió en 2 épocas, lote efectivo de 16, tasa de aprendizaje 2e-4 con scheduler cosine y 30 pasos de calentamiento, en precisión fp16 y sobre una única GPU T4.

El dataset de entrenamiento contiene 4.942 reseñas de la plataforma Olist, etiquetadas por un modelo profesor (Qwen2.5-7B-Instruct-AWQ) cuya salida se validó contra el esquema JSON esperado. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre pares entrada-salida generados por el profesor. El prompt de sistema es fijo y se define en `src/common.py` del repositorio del autor, por lo que el modelo espera ese formato concreto en inferencia.

## Capacidades

- Extracción de información estructurada: convierte reseñas en portugués en JSON con sentimiento general, sentimiento por aspecto, problema principal y marca de acción requerida.
- Clasificación de sentimiento por aspecto: entrega, producto, atención y precio.
- Generación de JSON válido: el autor reporta un 95,6 % de salidas JSON válidas en el conjunto de test.
- Conversación multi-turno: heredada del modelo base, aunque el ajuste está orientado a una tarea de extracción de un solo turno.
- Capacidades multilingües: limitadas al portugués en el ajuste; el modelo base soporta más idiomas, pero el ajuste puede degradar su comportamiento fuera del dominio.
- No se documenta soporte específico de tool calling, function calling ni modo de razonamiento extendido en la información proporcionada.

## Casos de uso

- Análisis de voz del cliente en comercio electrónico: procesar por lotes reseñas de Olist o de plataformas similares para obtener métricas de sentimiento por aspecto y detectar problemas recurrentes de entrega o atención.
- Enrutamiento automático de incidencias: usar el campo "requiere acción" y el "problema principal" para priorizar tickets de soporte que necesitan intervención humana.
- Cuadros de mando de calidad: alimentar dashboards con sentimiento agregado por aspecto, sustituyendo revisiones manuales de reseñas por extracción automática.
- Moderación y alertas: detectar reseñas con sentimiento negativo fuerte en entrega o producto para activar protocolos de recuperación de cliente.
- Investigación académica sobre extracción de información en portugués: servir como línea base pequeña y reproducible para comparar técnicas de ajuste QLoRA en tareas de extracción JSON.
- Prototipado rápido en entornos con recursos limitados: desplegar en una GPU T4 o incluso en CPU para validar un pipeline de analítica de reseñas antes de escalar a un modelo mayor.
- Generación de datasets etiquetados: usar el modelo como etiquetador de bajo coste para preanotar grandes volúmenes de reseñas, con revisión humana posterior.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de test de 297 reseñas con etiquetas revisadas manualmente. Las salidas que no son JSON válido cuentan como error en todas las métricas.

| Metrica | Base 0.5B | Ajustado |
|---|---|---|
| JSON valido | 0,185 | 0,956 |
| F1 sentimiento (macro) | 0,212 | 0,760 |
| F1 entrega | 0,104 | 0,893 |
| F1 producto | 0,189 | 0,844 |
| F1 atencion | 0,035 | 0,733 |
| F1 precio | 0,046 | 0,757 |
| F1 requiere accion | 0,219 | 0,823 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para los 494M de parámetros, más overhead de activaciones y KV cache; en la práctica, menos de 2 GB en fp16 y menos de 1 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA T4, que es suficiente también para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para inferencia por lotes con throughput moderado.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag `text-generation-inference`), llama.cpp y Ollama mediante conversión a GGUF, vLLM si se convierte el formato.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aitalo/qwen2.5-0.5b-avaliacoes-ptbr | 494M | no disponible | Extracción JSON de reseñas PT-BR | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | no disponible | Instrucción general multilingüe | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct-AWQ | 7B | no disponible | Instrucción general, cuantizado AWQ | Apache 2.0 | Hugging Face |

El modelo ajustado supera claramente a su base en la tarea específica, pero no se dispone de comparaciones publicadas con otros ajustes especializados en extracción de reseñas en portugués. El modelo profesor de 7B se usó para etiquetar los datos, no como comparación de rendimiento en el test.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre reseñas de comercio electrónico de Olist; no se garantiza su comportamiento en delivery de comida u otros sectores.
- Etiquetas de entrenamiento generadas por un modelo profesor: los errores del profesor se propagan al ajuste; solo el conjunto de test fue revisado manualmente.
- Conjunto de test pequeño (297 ejemplos) con pocos casos de clase `neutro` (~23) y escasos ejemplos de `atención` y `precio`, por lo que el F1 en esas clases es inestable.
- Resultados de una única ejecución de entrenamiento; no hay validación cruzada ni múltiples semillas.
- Un 4,4 % de las salidas en test no fueron JSON válido, lo que exige validación y reintentos en producción.
- Dependencia de un prompt de sistema fijo definido en el repositorio del autor; cambios en el formato pueden degradar el rendimiento.
- Los datos de entrenamiento provienen de una base bajo CC BY-NC-SA 4.0 (uso no comercial); el autor advierte que el modelo se hizo para estudio y portafolio y que el uso comercial requiere verificar las condiciones. La licencia del modelo es Apache 2.0, pero la procedencia de los datos introduce una caveat legal.
- Riesgo de alucinación en campos JSON no presentes en el texto de entrada; se recomienda validación de esquema y revisión humana en flujos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitalo/qwen2.5-0.5b-avaliacoes-ptbr
- Repositorio del pipeline: https://github.com/ItaloSLeao/pt-review-extractor
- Demo en Colab: https://colab.research.google.com/github/ItaloSLeao/pt-review-extractor/blob/main/notebooks/demo_colab.ipynb
- Dataset de entrenamiento: https://huggingface.co/datasets/aitalo/avaliacoes-ptbr-estruturadas
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
