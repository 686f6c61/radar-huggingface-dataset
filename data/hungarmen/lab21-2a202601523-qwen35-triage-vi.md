# hungarmen/lab21-2A202601523-qwen35-triage-vi

## Resumen

El modelo `lab21-2A202601523-qwen35-triage-vi` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Nguyễn Quang Hưng como entrega del Laboratorio 21 de un curso de fine-tuning. Se construye sobre el modelo base `unsloth/Qwen3.5-4B`, un transformer de 4 000 millones de parámetros de la familia Qwen, y su propósito es clasificar tickets de atención al cliente en vietnamita, devolviendo un JSON estructurado con cuatro campos: intención, urgencia, producto y sentimiento.

El adaptador se entrenó con 250 tickets sintéticos (225 de entrenamiento y 25 de validación) durante 30 pasos de optimización, con los pesos del modelo base congelados. Aunque alcanza una precisión del 97 % en la tarea objetivo, el propio autor reporta un deterioro significativo de las capacidades generales del modelo (regresión de -0.102, cinco veces por encima del umbral tolerado), por lo que el veredicto del laboratorio es FAILED. No debe desplegarse como asistente conversacional general, sino únicamente como un clasificador de tickets enrutado de forma condicional.

La relevancia de este modelo reside en su carácter didáctico: documenta de forma exhaustiva un caso real de olvido catastrófico en fine-tuning con LoRA, incluyendo análisis de errores estructurados, comparativas de configuraciones y artefactos de evaluación reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con adaptador LoRA sobre Qwen3.5-4B |
| Parametros totales | 4 000 millones (modelo base) + 32 464 896 (adaptador) |
| Parametros activos | 32 464 896 (solo adaptador; el base permanece congelado) |
| Longitud de contexto | 1024 tokens (max_length de entrenamiento; el contexto nativo del base no se especifica) |
| Tipos de cuantizacion | fp16 (entrenamiento), fp32 (pesos del adaptador guardados); se probó una variante QLoRA 4-bit |
| Idiomas soportados | Vietnamita (único idioma evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre todas las capas lineales del decoder de texto del modelo base Qwen3.5-4B, sin tocar la torre de visión (si existe). La configuración LoRA usa r=16 y alpha=32, con 32 464 896 parámetros entrenables. El entrenamiento se realizó en precisión fp16 con GradScaler sobre una GPU T4 de Colab, con un learning rate de 1e-4 (aproximadamente diez veces el de un fine-tuning completo), batch efectivo de 16 y 30 pasos de optimización. La máscara de pérdida se limitó a las respuestas (assistant-only), excluyendo las preguntas del cálculo de loss.

Los datos de entrenamiento consisten en 250 tickets sintéticos en vietnamita, generados artificialmente y no procedentes de logs reales de atención al cliente. El corpus tiene una longitud p95 de 98 tokens, muy por debajo del máximo de 1024 configurado. El autor documenta que el orden de los runs según loss de entrenamiento no coincide con el orden según capacidad real, un hallazgo relevante para la evaluación de fine-tunes.

## Capacidades

- Clasificación de tickets de atención al cliente en vietnamita, devolviendo un JSON con cuatro campos: `intent` (devolución, envío, reembolso, producto defectuoso, consulta), `urgency` (alta, media, baja), `sentiment` (negativo, neutro, positivo) y `product` (nombre del producto mencionado).
- Generación de JSON estricto sin markdown, con formato 100 % correcto en la evaluación.
- Comportamiento de clasificación codificado en los pesos: funciona con un prompt de una sola frase, sin necesidad de incluir el esquema completo en el prompt.
- No conserva las capacidades generales del modelo base: la generación de bloques de razonamiento `thinking` desaparece por completo y el rendimiento en conocimientos generales cae notablemente.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso tras el fine-tuning.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el adaptador puede clasificar cada ticket entrante en una de las cinco intenciones predefinidas y asignar un nivel de urgencia, permitiendo priorizar colas de atención. Su precisión del 97 % en la tarea lo hace viable para este flujo, siempre que se monte de forma condicional y solo para la ruta de triage.
- Detección de sentimiento en reclamaciones: el campo `sentiment` permite identificar tickets con tono negativo y escalarlos a supervisores o equipos de retención antes de que el cliente espere una respuesta.
- Extracción de producto mencionado: el campo `product` identifica el artículo referido en el ticket, lo que facilita la generación de respuestas automáticas contextualizadas o la derivación al equipo de producto correspondiente.
- Filtrado previo en sistemas de atención híbridos: el adaptador puede actuar como un clasificador de entrada que decide si un ticket debe ser atendido por un agente humano o por un asistente automático, reduciendo la carga de trabajo del equipo humano.
- Análisis de tendencias de soporte: al clasificar un volumen de tickets históricos, se pueden obtener estadísticas sobre las intenciones más frecuentes, los productos con más reclamaciones y la evolución del sentimiento a lo largo del tiempo.
- Ejemplo didáctico de fine-tuning con LoRA: el repositorio incluye código, informes y artefactos de evaluación completos, por lo que sirve como material de referencia para estudiar el olvido catastrófico y las buenas prácticas de evaluación en fine-tuning.

## Benchmarks y rendimiento

El autor evaluó el adaptador sobre 50 tickets reservados (target) y 15 preguntas de conocimiento general (regression), con decodificación greedy. Los resultados se comparan con dos baselines del modelo base sin adaptar:

| Run | target | regression | format | latencia (ms) |
|---|---|---|---|---|
| (a) base + prompt ingenuo | 0.000 | 0.758 | 0.000 | 3303.3 |
| (b) base + prompt optimizado | 0.765 | 0.758 | 1.000 | 1060.6 |
| (c) adaptador LoRA | 0.970 | 0.656 | 1.000 | 1493.4 |

El adaptador mejora la precisión en la tarea objetivo en +0.205 respecto al mejor baseline, pero pierde -0.102 en regresión, superando en 5.1 veces el umbral de tolerancia de 0.020. El veredicto del laboratorio es FAILED. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade ~124 MB en fp32 sobre el modelo base de 4B. Con el base en fp16, la carga total cabe en una GPU con 8 GB de VRAM; la variante QLoRA 4-bit reduce el pico a 7.09 GB durante el entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, T4, L4). El entrenamiento se realizó en una T4 de Colab con 12.01 GB de pico.
- Cabe en GPUs de consumo: sí, en tarjetas de gama media con 8 GB o más.
- Opciones de despliegue: el adaptador se carga con la librería PEFT de Hugging Face sobre el modelo base; es compatible con cualquier framework que soporte transformers y PEFT. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia: 1493.4 ms por clasificación en la GPU T4 de evaluación, con decodificación greedy y un máximo de 96 tokens nuevos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA para clasificación de tickets en vietnamita. El modelo base Qwen3.5-4B pertenece a la familia Qwen, de la que existe el modelo Qwen3-8B (también open source, licencia Apache-2.0), pero no se han publicado resultados comparativos entre ambos en esta tarea. La comparativa más relevante es la interna del propio autor, que enfrenta el adaptador contra el modelo base con dos estrategias de prompting distintas, documentada en la tabla de benchmarks.

## Limitaciones y advertencias

- Olvido catastrófico confirmado: el adaptador degrada las capacidades generales del modelo base en -0.102 puntos y elimina por completo la generación de razonamiento `thinking`. No debe usarse como asistente conversacional general.
- Datos de entrenamiento sintéticos: los 250 tickets son generados artificialmente, con una distribución y un registro lingüístico mucho más regulares que los datos reales de atención al cliente. El rendimiento en producción puede degradarse.
- Errores estructurados: el 1.5 % de los campos clasificados incorrectamente (6 de 200) se concentra en el campo `urgency`, siempre en la misma dirección (`thap` → `trung_binh`) y asociado a la frase "Khi nào tiện", que el modelo base interpreta como una pregunta temporal. El entrenamiento de 30 pasos no fue suficiente para corregir esta prioridad previa.
- Cobertura limitada: solo se ha evaluado en vietnamita; no hay evidencia de funcionamiento en otros idiomas.
- Riesgo de alucinación en el campo `product`: la evaluación se realiza por coincidencia tras eliminar diacríticos, por lo que nombres de producto no vistos durante el entrenamiento pueden clasificarse incorrectamente.
- Licencia Apache-2.0: permite uso comercial, pero el autor desaconseja explícitamente el despliegue sin un enrutamiento condicional que aísle el adaptador a la tarea de triage.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hungarmen/lab21-2A202601523-qwen35-triage-vi
- Repositorio de código y reporte: https://github.com/hungdevcmc/Day21-Track3-Finetuning-Lab
- Colección Qwen3.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen35
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
