# hatheemr/margent-planner-qwen2.5-3b-lora

## Resumen

MARGENT Planner es un adaptador LoRA desarrollado por hatheemr que reemplaza el nodo `planner` del sistema multiagente MARGENT (Lanka Market Scout), una arquitectura LangGraph diseñada para investigar ideas de negocio en el mercado de Sri Lanka. El adaptador, basado en el modelo Qwen2.5-3B-Instruct, recibe una idea de negocio y el historial de análisis previo del usuario, y genera un objeto JSON estricto con un plan de investigación: una idea reformulada, entre 3 y 4 preguntas de mercado, entre 2 y 3 preguntas de precios y entre 3 y 5 semillas de competidores, todo lo suficientemente específico para alimentar directamente una herramienta de búsqueda web.

El modelo se entrenó con QLoRA sobre la versión cuantizada a 4 bits de Qwen2.5-3B-Instruct, con el objetivo de mejorar el anclaje geográfico y temporal de las preguntas generadas, un aspecto crítico para que el pipeline de búsqueda recupere información relevante en lugar de ruido genérico. La relevancia actual radica en que permite ejecutar localmente una tarea estrecha y restringida por esquema que antes dependía de un modelo propietario (gpt-4o-mini), reduciendo costes y latencia en entornos de producción sin sacrificar la calidad del resultado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B-Instruct) con adaptador LoRA |
| Parametros totales | 3B (modelo base) + adaptador LoRA (r=16, no se especifica el número exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (según configuración de entrenamiento) |
| Tipos de cuantizacion | 4-bit (carga con bitsandbytes, mencionado en el entrenamiento) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, cargado en 4 bits mediante `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`. La técnica de entrenamiento es QLoRA, que congela los pesos del modelo base y entrena únicamente los adaptadores LoRA. La configuración LoRA utiliza r=16, alpha=16 y dropout=0, aplicada a las proyecciones q, k, v, o, gate, up y down. El entrenamiento se realizó con el framework Unsloth y TRL `SFTTrainer`, con una tasa de aprendizaje de 2e-4, programación lineal con 5% de warmup, 2 épocas (210 pasos), batch efectivo de 8 (1×8 acumulación de gradientes) y optimizador `adamw_8bit`. La pérdida se enmascaró para evaluar únicamente la respuesta del asistente (`train_on_responses_only`), de modo que el modelo se gradúa exclusivamente por la generación del JSON y no por reconstruir el prompt. La curva de pérdida muestra una disminución de 0.571 a 0.310 en entrenamiento y de 0.529 a 0.369 en validación, con decrecimiento monótono en validación.

## Capacidades

- Generación de planes de investigación de mercado en formato JSON estricto, con claves específicas: `product_idea`, `market_questions`, `pricing_questions` y `competitor_seeds`.
- Anclaje geográfico y temporal de las preguntas: el modelo genera consultas que incluyen nombres de ciudades, monedas y años (por ejemplo, "coffee consumption trends Sri Lanka 2024"), lo que mejora la recuperación en herramientas de búsqueda.
- Identificación de semillas de competidores reales o categorías específicas de búsqueda para el mercado de Sri Lanka.
- Especialización en el dominio de análisis de negocio para Sri Lanka, con capacidad de personalización basada en el historial del usuario.
- Compatibilidad con el formato de chat de Qwen2.5, permitiendo integración en pipelines de LangGraph u otros sistemas multiagente.
- Inferencia eficiente en 4 bits, adecuada para entornos con recursos limitados.

## Casos de uso

- Integración en el sistema MARGENT: el adaptador reemplaza al nodo `planner` del pipeline LangGraph, generando planes de investigación que alimentan los nodos posteriores de búsqueda web y análisis.
- Investigación de mercado para emprendedores en Sri Lanka: dado un concepto de negocio, el modelo produce preguntas concretas y semillas de competidores locales, facilitando estudios de viabilidad sin depender de servicios externos de pago.
- Sustitución de modelos propietarios en tareas restringidas: en entornos donde se requiere ejecución local por privacidad o coste, el adaptador puede reemplazar a gpt-4o-mini en tareas de generación de planes con esquema fijo, manteniendo la calidad del output.
- Automatización de análisis de negocio: el modelo puede integrarse en herramientas de consultoría que generan informes preliminares de mercado, reduciendo el tiempo de investigación manual.
- Generación de consultas de búsqueda optimizadas: las preguntas producidas están diseñadas para ser pasadas directamente a APIs de búsqueda, mejorando la precisión de los resultados en comparación con consultas genéricas.
- Personalización de planes según historial del usuario: el adaptador utiliza el contexto previo del usuario para evitar repeticiones y adaptar las preguntas a necesidades específicas, útil en plataformas de asesoramiento empresarial.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 40 ejemplos held-out con decodificación greedy, comparando el modelo base sin ajustar con el adaptador fine-tuned en el mismo prompt. Los resultados se resumen en la siguiente tabla:

| Métrica | Base Qwen2.5-3B | Fine-tuned | Δ |
|---|---:|---:|---:|
| Valid JSON parsed | 100.0% | 100.0% | +0.0 pp |
| Correct schema keys | 100.0% | 100.0% | +0.0 pp |
| List counts in range | 100.0% | 100.0% | +0.0 pp |
| No generic competitor seeds | 100.0% | 100.0% | +0.0 pp |
| Questions locality-anchored | 35.0% | 100.0% | +65.0 pp |
| All checks pass | 35.0% | 100.0% | +65.0 pp |
| Mean latency (T4, 4-bit) | 11.63 s | 14.29 s | +2.65 s |

El incremento de latencia se atribuye a que el modelo ajustado genera planes más completos y específicos, un intercambio aceptado para obtener resultados utilizables.

## Requisitos de hardware

- VRAM estimada: el modelo base de 3B en 4 bits requiere aproximadamente 2-3 GB de VRAM, más el adaptador LoRA (muy pequeño). Se recomienda al menos 4 GB de VRAM para inferencia cómoda.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4 (16 GB), por lo que cualquier GPU con al menos 4 GB de VRAM es suficiente. GPUs consumer como RTX 3060, RTX 4060 o superiores son adecuadas.
- Compatibilidad con GPUs consumer: sí, el modelo cabe en GPUs de gama media con 4-6 GB de VRAM en cuantización 4-bit.
- Opciones de despliegue: compatible con text-generation-inference (TGI) según los tags del repositorio. También puede ejecutarse con vLLM, llama.cpp u Ollama, aunque no se confirma explícitamente en la documentación.
- Latencia y throughput: la latencia media medida en T4 con 4-bit es de 14.29 s por generación (greedy decoding, max_new_tokens=512). En GPUs más modernas se espera una mejora significativa.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador está diseñado para una tarea muy específica (generación de planes de investigación de mercado para Sri Lanka), por lo que no se han encontrado alternativas directas con las que comparar. Se puede considerar el modelo base Qwen2.5-3B-Instruct como referencia, pero el fine-tuning introduce mejoras sustanciales en el anclaje local, como se muestra en la sección de benchmarks.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para generar planes de investigación de mercado en el contexto de Sri Lanka. Fuera de este dominio, su rendimiento puede degradarse significativamente.
- Prompt obligatorio: el formato del system prompt y la estructura del mensaje de usuario son críticos. Cambiar la redacción, aunque sea ligeramente, puede degradar la calidad de la salida de forma silenciosa.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar semillas de competidores o preguntas que no correspondan a entidades reales, aunque el entrenamiento reduce este riesgo en el dominio objetivo.
- Limitaciones de idioma: solo se declara soporte para inglés; no se ha evaluado su comportamiento en otros idiomas.
- Dependencia del modelo base: el adaptador requiere cargar el modelo Qwen2.5-3B-Instruct en 4 bits, lo que implica una dependencia de la infraestructura de Unsloth y bitsandbytes.
- Sin garantías de producción: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido ampliamente probado en entornos reales. Se recomienda validación adicional antes de su uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hatheemr/margent-planner-qwen2.5-3b-lora
- Proyecto MARGENT (GitHub): https://github.com/hatheem-r/project-MARGENT
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Informe técnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
