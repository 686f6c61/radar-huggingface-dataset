# aayush0325/llama-3.2-1b-text2sql-lora-r32

## Resumen

El modelo `aayush0325/llama-3.2-1b-text2sql-lora-r32` es un adaptador LoRA (Low-Rank Adaptation) de tipo PEFT entrenado sobre el modelo base `unsloth/Llama-3.2-1B-Instruct` para la tarea de text-to-SQL: convertir una pregunta en lenguaje natural junto con un esquema de base de datos SQLite en una única consulta SQL válida. Lo desarrolla el usuario aayush0325 y se publica como adaptador, no como modelo completo: es necesario cargarlo sobre el modelo base de 1.000 millones de parámetros.

El adaptador se entrena sobre el dataset `gretelai/synthetic_text_to_sql` (100.000 filas del split de entrenamiento) y emplea una configuración LoRA con rango 32 y alpha 64 aplicada a los módulos MLP (`gate_proj`, `up_proj`, `down_proj`). Según la model card, esta configuración resultó la mejor de un barrido de cinco variantes, con una precisión de ejecución del 84,38% frente al 50% del modelo base.

Su relevancia radica en que demuestra que un modelo pequeño (1B) con un adaptador ligero (15,7 millones de parámetros entrenables, unos 0,1 GB de pesos) puede mejorar sustancialmente la generación de SQL en un dominio sintético concreto, lo que resulta atractivo para despliegues con recursos limitados. No obstante, se trata de un artefacto experimental sin descargas ni validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA sobre módulos MLP |
| Parametros totales | 1.000 millones (modelo base); 15.728.640 parámetros entrenables en el adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; entrenamiento con longitud máxima de secuencia de 1024 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización estándar de Llama 3.2, no especificada en la ficha) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 license |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Llama-3.2-1B-Instruct`, un transformer decoder-only de 1.000 millones de parámetros. La configuración LoRA usa rango 32, alpha 64 y dropout 0,1, con los módulos objetivo `gate_proj`, `up_proj` y `down_proj` (capas MLP). El entrenamiento se realizó en una GPU L4 de 24 GB (Modal) durante aproximadamente 3 horas, en precisión BF16 con kernels SDPA/FlashAttention y lotes sin padding (padding-free). Se usó el optimizador Fused AdamW con learning rate 2e-4, weight decay 0,01 y betas (0,9, 0,95), con un 3% de warmup lineal seguido de decaimiento coseno, 1 epoch y batch efectivo de 16. La longitud máxima de secuencia fue de 1024 tokens.

El dataset de entrenamiento es `gretelai/synthetic_text_to_sql` (split de entrenamiento, 100.000 filas), con licencia Apache-2.0. El prompt de entrenamiento es fijo: un mensaje de sistema que instruye al modelo a actuar como experto SQL y responder con una única consulta válida, seguido de un mensaje de usuario con el esquema SQLite y la pregunta. La evaluación de pérdida se hizo sobre 500 filas del split de test y la evaluación de ejecución sobre 32 filas curadas manualmente. No se documentan fases de RLHF o DPO; el ajuste es supervisado sobre pares pregunta-SQL.

## Capacidades

- Generación de consultas SQL a partir de una pregunta en lenguaje natural y un esquema SQLite.
- Generación de código SQL de una sola consulta (el prompt exige una única consulta y nada más).
- Soporte de function calling y tool calling a nivel de etiquetas del modelo base, aunque no se valida en esta ficha.
- Capacidad multilingüe limitada al inglés (idioma declarado en la model card).
- No se documentan capacidades de visión, audio, modo thinking ni razonamiento multi-paso específicas del adaptador.
- Razonamiento sobre esquemas de base de datos y columnas para construir la consulta.

## Casos de uso

- Asistente de consultas para analistas de datos: el adaptador traduce preguntas en inglés sobre un esquema SQLite a consultas ejecutables, útil en herramientas internas de exploración de datos donde el esquema es estable y similar al del dataset de entrenamiento.
- Generación de SQL en pipelines de BI: integrado en un servicio que recibe la pregunta del usuario y el DDL de la tabla, devuelve la consulta para su ejecución y validación automática.
- Prototipado rápido de interfaces de lenguaje natural a base de datos: al ser un adaptador de 0,1 GB sobre un modelo de 1B, puede desplegarse en entornos con GPU modesta para demos y pruebas de concepto.
- Educación y formación en SQL: el modelo puede servir para mostrar cómo se construye una consulta a partir de una pregunta, con la advertencia de revisar siempre la salida antes de ejecutarla.
- Automatización de tareas repetitivas de reporting: consultas sencillas sobre tablas con esquemas conocidos (filtros, agregaciones, joins básicos) en inglés.
- Evaluación comparativa de técnicas de fine-tuning: el repositorio documenta el barrido de cinco configuraciones LoRA, por lo que sirve como referencia para experimentos de adaptación de bajo rango en tareas de código.

## Benchmarks y rendimiento

Los datos proceden de la model card. La precisión de ejecución y la tasa de SQL válido se miden sobre 32 filas curadas manualmente contra SQLite; la pérdida de evaluación sobre 500 filas del split de test.

| Modelo | Pérdida de evaluación | Precisión de ejecución | Tasa de SQL válido |
|---|---|---|---|
| Base (sin adaptador) | – | 0,5000 | 0,8438 |
| **Este adaptador (mlp_r32)** | **0,1890** | **0,8438** | **0,9688** |
| attn_r8 | 0,2181 | 0,6875 | 0,9062 |
| attn_mlp_r16 | 0,1919 | 0,7188 | 0,9375 |
| attn_r64_rslora | 0,1944 | 0,7812 | 0,9062 |
| all_linear_r16_dora | 0,1915 | 0,7812 | 0,9375 |

Con 32 filas de evaluación, una sola consulta mueve la precisión en aproximadamente 3,1 puntos, por lo que las diferencias pequeñas entre adaptadores no son significativas. No se han publicado resultados en otros benchmarks de text-to-SQL (Spider, BIRD, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1B en BF16 requiere aproximadamente 2 GB de pesos; en FP16 similar; en cuantización de 8 bits en torno a 1 GB y en 4 bits en torno a 0,5-0,7 GB. El adaptador añade unos 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para BF16; una NVIDIA L4 (24 GB), RTX 4090, A100 o H100 son más que suficientes. El propio autor entrenó en una L4.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida mediante cuantización.
- Opciones de despliegue: transformers + PEFT (como se muestra en la model card), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de ejecución (32 filas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Llama-3.2-1B + LoRA r32) | 1B + 15,7M entrenables | 1024 tokens de entrenamiento | 0,8438 | Llama 3.2 | Hugging Face (0 descargas) |
| Modelo base Llama-3.2-1B-Instruct sin adaptador | 1B | No disponible | 0,5000 | Llama 3.2 | Hugging Face |
| Adaptadores alternativos del mismo barrido (attn_r8, attn_mlp_r16, attn_r64_rslora, all_linear_r16_dora) | 1B + adaptador | 1024 tokens | 0,6875-0,7812 | Llama 3.2 | Hugging Face |
| Otros modelos text-to-SQL de mayor tamaño (p. ej., CodeLlama, SQLCoder) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con modelos especializados en text-to-SQL de otros tamaños o familias en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con SQL sintético de un solo dataset; se espera degradación en esquemas o dialectos distintos de los de `gretelai/synthetic_text_to_sql`.
- La evaluación de ejecución usa igualdad exacta de filas: consultas semánticamente equivalentes con distinto orden de columnas se cuentan como incorrectas.
- No evaluado en otros benchmarks de text-to-SQL (Spider, BIRD, etc.), por lo que su rendimiento fuera del dominio de evaluación es desconocido.
- Solo soporta inglés; no se ha validado para otros idiomas.
- La salida puede incluir un bloque de código Markdown con la consulta SQL; es necesario limpiarlo antes de ejecutar.
- Riesgo de alucinación: puede generar consultas sintácticamente válidas pero semánticamente incorrectas o referenciar columnas inexistentes.
- Licencia Llama 3.2: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar antes de uso en producción.
- El dataset de entrenamiento tiene licencia Apache-2.0 (Gretel AI).
- Artefacto experimental con 0 descargas y 0 likes; sin validación independiente por parte de la comunidad.
- No se documentan sesgos específicos más allá de los inherentes al modelo base y al dataset sintético.

## Enlaces

- Hugging Face: https://huggingface.co/aayush0325/llama-3.2-1b-text2sql-lora-r32
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Repositorio de entrenamiento (referenciado en la model card como `data/eval_set.jsonl`): no disponible como enlace directo en la información proporcionada.
