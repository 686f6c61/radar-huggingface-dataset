# mradermacher/qwen2.5-coder-3b-instruct-spider-sft-grpo-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `riit3sh/qwen2.5-coder-3b-instruct-spider-sft-grpo`, un fine-tuning especializado en text-to-SQL sobre la base de Qwen2.5-Coder-3B-Instruct. El modelo original fue entrenado con el dataset Spider mediante un pipeline de SFT (supervised fine-tuning) seguido de GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo que optimiza directamente la recompensa de la tarea. La cuantización a GGUF, realizada por mradermacher, permite ejecutar el modelo en entornos con recursos limitados, como CPU o GPU de consumo, manteniendo un equilibrio razonable entre tamaño y calidad.

El modelo está pensado para tareas de generación de consultas SQL a partir de preguntas en lenguaje natural, un caso de uso muy demandado en aplicaciones de análisis de datos, asistentes de bases de datos y automatización de reporting. Al estar basado en Qwen2.5-Coder, hereda capacidades de razonamiento y generación de código, aunque su especialización principal es el dominio SQL. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parámetros totales | 3.085.938.688 (aprox. 3,09B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5, concretamente la variante de 3B parámetros orientada a código (Qwen2.5-Coder-3B-Instruct). Sobre esta base, el autor original aplicó un fine-tuning supervisado (SFT) con el dataset Spider, un conjunto de referencia ampliamente usado para evaluar la generación de consultas SQL a partir de texto natural. Posteriormente se aplicó GRPO (Group Relative Policy Optimization), un algoritmo de refuerzo que optimiza directamente la política del modelo utilizando un grupo de respuestas muestreadas, lo que mejora la coherencia y exactitud de las consultas generadas.

La cuantización a GGUF fue realizada por mradermacher, que ofrece un abanico de niveles de compresión (desde Q2_K hasta f16). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de Spider) ni las configuraciones de hiperparámetros empleadas en el fine-tuning. El modelo base Qwen2.5-Coder-3B-Instruct ya incorpora atención con rotary positional embeddings (RoPE) y RMSNorm, pero no se detallan innovaciones adicionales en esta ficha.

## Capacidades

- Generación de consultas SQL: traduce preguntas en lenguaje natural a consultas SQL válidas sobre esquemas de bases de datos relacionales.
- Razonamiento sobre bases de datos: comprende esquemas, tablas, columnas y relaciones para construir consultas correctas.
- Generación de código general: al heredar las capacidades de Qwen2.5-Coder, puede generar código en otros lenguajes, aunque su especialización principal es SQL.
- Entrada conversacional: soporta interacciones multi-turno, lo que permite refinar consultas o hacer preguntas de seguimiento.
- Tool calling: no se menciona soporte explícito para function calling en la información proporcionada.
- Multilingüismo: la model card indica solo inglés, aunque el modelo base Qwen2.5-Coder soporta varios idiomas; no se confirma en esta variante.

## Casos de uso

- **Asistente de bases de datos**: un desarrollador puede integrar el modelo en una aplicación para que los usuarios no técnicos consulten datos mediante preguntas en lenguaje natural, generando automáticamente las consultas SQL correspondientes.
- **Generación de consultas en pipelines de análisis de datos**: el modelo puede automatizar la creación de consultas SQL para informes periódicos, reduciendo el tiempo de escritura manual en entornos de business intelligence.
- **Validación de esquemas**: dado un esquema de base de datos, el modelo puede generar consultas de prueba para verificar la lógica y las relaciones, ayudando en el desarrollo de APIs de datos.
- **Entrenamiento de otros modelos**: al ser un modelo pequeño (3B), puede usarse como generador de datos sintéticos para fine-tuning de modelos más grandes o para crear datasets de entrenamiento de text-to-SQL.
- **Despliegue en entornos con recursos limitados**: gracias a las cuantizaciones GGUF (por ejemplo, Q4_K_M con ~2 GB), puede ejecutarse en una Raspberry Pi o en un servidor sin GPU, habilitando un asistente SQL local de bajo coste.
- **Herramienta de aprendizaje**: estudiantes y desarrolladores pueden usarlo para practicar la escritura de consultas SQL, recibiendo sugerencias generadas automáticamente a partir de preguntas en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen2.5-Coder-3B-Instruct ha sido evaluado en tareas de código (por ejemplo, HumanEval) y el dataset Spider tiene métricas de exactitud de consulta (exact match y execution match), pero no se proporcionan valores concretos para este fine-tune.

## Requisitos de hardware

- **VRAM estimada**: depende de la cuantización. Por ejemplo, Q4_K_M ocupa ~2,0 GB, Q8_0 ~3,4 GB y f16 ~6,3 GB. La VRAM necesaria será ligeramente superior al tamaño del archivo, más overhead para el contexto y la computación.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones más ligeras (Q2_K, Q3_K, Q4_K). Para Q8_0 o f16, se recomienda al menos 6-8 GB (por ejemplo, RTX 3060, RTX 4060).
- **CPU**: las cuantizaciones GGUF pueden ejecutarse en CPU pura usando llama.cpp, aunque la velocidad será menor que en GPU.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con soporte GGUF), llama-cpp-python, text-generation-inference (TGI) o cualquier runtime compatible con GGUF.
- **Latencia y throughput**: no se dispone de mediciones específicas para este modelo. Como referencia, un modelo de 3B cuantizado a Q4_K_M en una GPU moderna (RTX 4090) puede generar decenas de tokens por segundo, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (base) | 3,09B | 32K (según documentación de Qwen) | Apache 2.0 | HuggingFace, ModelScope |
| Qwen2.5-Coder-3B-Instruct-spider-sft-grpo (este modelo) | 3,09B | No disponible | Apache 2.0 | HuggingFace (GGUF) |
| CodeLlama-3B-Instruct | 3B | 16K | Llama 2 Community License | HuggingFace |

La comparativa con CodeLlama-3B es orientativa, pero no se dispone de datos de rendimiento para este fine-tune específico. El modelo base Qwen2.5-Coder-3B-Instruct tiene un contexto de 32K según la documentación oficial de Qwen, pero no se confirma en esta variante.

## Limitaciones y advertencias

- **Especialización en SQL**: el modelo está fuertemente especializado en el dataset Spider, por lo que su rendimiento en consultas SQL de otros dominios o dialectos (por ejemplo, PostgreSQL, MySQL) puede degradarse.
- **Idioma**: la model card declara solo inglés; no se garantiza un buen rendimiento en otros idiomas.
- **Riesgo de alucinación**: como cualquier LLM, puede generar consultas SQL sintácticamente correctas pero lógicamente incorrectas o que no se ajusten al esquema real de la base de datos.
- **Sesgos**: el dataset Spider contiene esquemas de bases de datos académicas, por lo que el modelo puede tener sesgos hacia ese tipo de estructura.
- **Licencia**: Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base (Qwen2.5-Coder) para asegurar el cumplimiento.
- **Sin garantías de producción**: no hay benchmarks publicados, por lo que no se recomienda un despliegue en producción sin una evaluación previa en el caso de uso concreto.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/qwen2.5-coder-3b-instruct-spider-sft-grpo-GGUF)
- [Modelo base (riit3sh/qwen2.5-coder-3b-instruct-spider-sft-grpo)](https://huggingface.co/riit3sh/qwen2.5-coder-3b-instruct-spider-sft-grpo)
- [Repositorio de Qwen2.5-Coder](https://github.com/huggingface/Qwen2.5-Coder)
- [Qwen2.5-Coder-3B-Instruct-GGUF oficial](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF)
- [Página de modelos de mradermacher para descarga](https://hf.tst.eu/model#qwen2.5-coder-3b-instruct-spider-sft-grpo-GGUF)
