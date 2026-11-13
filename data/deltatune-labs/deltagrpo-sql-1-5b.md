# DeltaTune-Labs/DeltaGRPO-SQL-1.5B

## Resumen

DeltaGRPO-SQL-1.5B es un adaptador LoRA publicado por DeltaTune-Labs que especializa el modelo Qwen2.5-Coder-1.5B-Instruct en la generación de consultas SQL para SQLite a partir de esquemas de base de datos y preguntas en lenguaje natural. No se trata de un modelo completo, sino de un adaptador PEFT que debe cargarse sobre el checkpoint base de Qwen, y que se distribuye bajo licencia Apache 2.0.

El interés técnico del modelo reside en su método de entrenamiento: utiliza GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, con recompensas basadas en la ejecución real de las consultas generadas. Según la model card, el adaptador mejora el exact match del modelo base del 63,3% al 72,8% en 1.000 preguntas reservadas del dataset `gretelai/synthetic_text_to_sql`, y afirma igualar el rendimiento de un modelo de 7B de la misma familia con un quinto de los parámetros.

Por su tamaño (1,5B parámetros en el modelo base) y su enfoque específico, el adaptador está pensado para integrarse en pipelines de generación de SQL donde el coste de inferencia y el despliegue en hardware modesto sean prioritarios, a cambio de una cobertura limitada a SQLite y al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-Coder-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el modelo base Qwen2.5-Coder-1.5B-Instruct tiene 1,5B; el adaptador LoRA añade un número no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización del base es responsabilidad del usuario) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1,5B parámetros. El entrenamiento se realizó con GRPO, un algoritmo de optimización de política por refuerzo que agrupa muestras y calcula ventajas relativas dentro del grupo, y que en este caso utiliza recompensas basadas en la ejecución de las consultas SQL generadas. El dataset de entrenamiento es `gretelai/synthetic_text_to_sql`, un corpus sintético de pares texto-SQL.

El formato de salida esperado es explícito: el modelo debe responder con `<reasoning>…</reasoning>` seguido de `<sql>…</sql>`, lo que introduce un modo de razonamiento previo a la consulta final. El sistema de prompt está fijado en la model card y el mensaje de usuario sigue la plantilla `Database:\n<CREATE TABLE / INSERT statements>\n\nQuestion: <question>`. No se especifican el número de tokens de entrenamiento, la composición completa del dataset ni detalles sobre el proceso de alineación adicional.

## Capacidades

- Generación de consultas SQL para SQLite a partir de esquemas DDL, filas de ejemplo y preguntas en lenguaje natural.
- Razonamiento explícito previo a la consulta mediante el bloque `<reasoning>`.
- Formato de salida estructurado y consistente (`<reasoning>` + `<sql>`), con una tasa de formato del 99,9% según la model card.
- Especialización en SQL ejecutable: la tasa de SQL válido ejecutable sube del 91,9% al 97,0% frente al modelo base.
- Capacidades de código y razonamiento heredadas de Qwen2.5-Coder-1.5B-Instruct, no evaluadas específicamente en la información disponible.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Asistentes de análisis de datos internos: el modelo traduce preguntas de negocio sobre tablas SQLite a consultas ejecutables, con razonamiento visible para auditar la lógica antes de lanzar la consulta.
- Generación de SQL en herramientas de BI y notebooks: integración en un flujo donde el usuario describe la consulta y el modelo devuelve SQL listo para ejecutar contra una base SQLite embebida.
- Automatización de tareas de reporting: dado un esquema con datos de muestra, el modelo genera consultas de agregación y filtrado para informes recurrentes, con una tasa de ejecución válida del 97% que reduce errores en producción.
- Soporte a científicos de datos en exploración de datasets: el modelo puede proponer consultas de exploración sobre esquemas desconocidos a partir de una descripción breve, acelerando el trabajo iterativo.
- Componente de pipelines de evaluación automática de text-to-SQL: sirve como generador de referencia en tests de regresión o como baseline especializado para comparar con modelos mayores.
- Sistemas educativos de aprendizaje de SQL: el bloque de razonamiento permite mostrar al estudiante el proceso lógico que lleva a la consulta final, no solo el resultado.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1,5B, puede ejecutarse en GPUs de consumo y en entornos sin infraestructura de gran escala, donde un 7B no sería viable.

## Benchmarks y rendimiento

Evaluación basada en ejecución sobre 1.000 preguntas reservadas de `gretelai/synthetic_text_to_sql` (decodificación greedy, mismo prompt y ajustes para ambos modelos). Δ en puntos porcentuales con intervalo de confianza bootstrap pareado del 95%.

| Métrica | Qwen2.5-Coder-1.5B-Instruct | DeltaGRPO-SQL-1.5B | Δ (pp) | IC 95% |
|---|---|---|---|---|
| Exact match | 63,3 | 72,8 | +9,5 | [+7,0, +12,0] |
| Result F1 | 64,7 | 75,1 | +10,4 | [+7,8, +12,9] |
| SQL válido (ejecutable) | 91,9 | 97,0 | +5,1 | [+3,4, +6,9] |
| Tasa de formato | 99,9 | 99,9 | +0,0 | [-0,3, +0,3] |

Según la model card, el adaptador de 1,5B alcanza un exact match del 72,8%, comparable al 72,4% de un modelo de 7B de la misma familia sin entrenar, con un quinto del tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo base de 1,5B en FP16 requiere aproximadamente 3 GB solo para pesos, más memoria para KV cache y activaciones; el adaptador LoRA añade una sobrecarga pequeña.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, un modelo de 1,5B es desplegable en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, así como en A100/H100 para mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del modelo base; no se confirma con datos oficiales.
- Opciones de despliegue: la model card muestra carga con `transformers` + `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la fusión del adaptador con el base sería necesaria para algunos de estos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact match (text-to-SQL SQLite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaGRPO-SQL-1.5B | 1,5B (base) + LoRA | No disponible | 72,8% | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | No disponible | 63,3% | Apache 2.0 | Hugging Face |
| Modelo 7B de la misma familia (según model card) | 7B | No disponible | 72,4% | No disponible | No disponible |

No se dispone de datos comparativos con otros adaptadores text-to-SQL especializados en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en SQLite; no se garantiza su comportamiento en PostgreSQL, MySQL u otros dialectos.
- Solo soporta inglés según los metadatos del modelo; el rendimiento en otros idiomas no está evaluado.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el checkpoint base Qwen2.5-Coder-1.5B-Instruct y la librería PEFT.
- Depende de un formato de prompt y salida muy concretos (`<reasoning>` + `<sql>`); desviarse de la plantilla puede degradar el rendimiento.
- Riesgo de alucinación en esquemas complejos o preguntas ambiguas: la tasa de SQL ejecutable es del 97%, pero eso no garantiza que la consulta responda correctamente a la pregunta (exact match del 72,8%).
- Entrenado sobre un dataset sintético (`gretelai/synthetic_text_to_sql`), lo que puede limitar la generalización a esquemas reales con particularidades no representadas.
- Sin datos publicados sobre sesgos, comportamiento en contextos largos ni rendimiento fuera del dominio text-to-SQL.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder-1.5B-Instruct.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeltaTune-Labs/DeltaGRPO-SQL-1.5B
- Organización DeltaTune-Labs: https://huggingface.co/DeltaTune-Labs
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset gretelai/synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
