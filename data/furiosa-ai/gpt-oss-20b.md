# furiosa-ai/gpt-oss-20b

## Resumen

El modelo `furiosa-ai/gpt-oss-20b` es una adaptación del modelo open-weight de razonamiento `openai/gpt-oss-20b` realizada por FuriosaAI para ejecutarse en su hardware NPU RNGD mediante el framework Furiosa-LLM. Se trata de un transformer auto-regresivo con arquitectura Mixture-of-Experts (MoE) que genera respuestas en el formato harmony, separando explícitamente la cadena de razonamiento (chain-of-thought) de la respuesta final. Está diseñado para casos de uso de baja latencia y despliegue en dispositivo, con soporte nativo para tool calling y un parámetro `reasoning_effort` configurable que permite ajustar la profundidad del razonamiento.

El modelo base de OpenAI se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Esta versión de FuriosaAI incluye un bundle ejecutable (FXB) para su hardware, pero el modelo original también puede ejecutarse en otros frameworks como vLLM, SGLang o Transformers. Con 20.914.757.184 parámetros totales, es un modelo de tamaño medio dentro de la familia GPT-OSS, orientado a equilibrar capacidad de razonamiento y eficiencia de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-OSS (Mixture-of-Experts, transformer auto-regresivo) |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos de expertos MoE), resto en mayor precision; safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-OSS de OpenAI, un transformer auto-regresivo con capas de Mixture-of-Experts. En esta implementación, los pesos de los expertos MoE están cuantizados a MXFP4, mientras que los componentes de atención, router y embeddings se mantienen en mayor precisión. Esta cuantización mixta permite reducir el uso de memoria y acelerar la inferencia en hardware especializado.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card de FuriosaAI indica que el modelo es idéntico al `openai/gpt-oss-20b` original, por lo que las características de entrenamiento corresponden a las publicadas por OpenAI, aunque no se han replicado en esta ficha por falta de datos verificables.

## Capacidades

- Razonamiento explícito: genera una cadena de pensamiento separada de la respuesta final, siguiendo el formato harmony.
- Control de esfuerzo de razonamiento: permite ajustar la profundidad del razonamiento mediante el parámetro `reasoning_effort` con valores `"low"`, `"medium"` y `"high"`.
- Tool calling: soporta llamadas a funciones (function calling) a través del parser `openai`, integrable con el servidor Furiosa-LLM.
- API compatible con OpenAI: expone endpoints `/v1/chat/completions` con campos adicionales para el razonamiento (`reasoning`).
- Generación de texto en inglés: modelo entrenado principalmente para el idioma inglés.
- Inferencia optimizada para hardware FuriosaAI RNGD: utiliza tensor parallelism de 8 PEs en una sola tarjeta.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento explícito, lo que permite explicar sus decisiones y ofrecer respuestas más transparentes. Su soporte para tool calling facilita la integración con sistemas de ticketing o bases de conocimiento.
- Asistentes de código con razonamiento: al separar el razonamiento de la respuesta, puede depurar código explicando el proceso, y su capacidad de tool calling permite conectarlo a intérpretes o repositorios para ejecutar pruebas.
- Agentes autónomos: la combinación de razonamiento multi-step y tool calling lo hace adecuado para agentes que necesitan planificar y ejecutar acciones, como automatización de tareas de oficina o gestión de flujos de trabajo.
- Análisis de datos y generación de informes: puede procesar consultas complejas, razonar sobre los datos y generar explicaciones detalladas, útil en entornos de business intelligence.
- Educación y tutoría: su capacidad de mostrar el razonamiento paso a paso permite usarlo como tutor virtual que explica conceptos y resuelve problemas de forma didáctica.
- Despliegue en edge computing: al estar optimizado para hardware FuriosaAI RNGD, es adecuado para entornos con restricciones de latencia y consumo, como dispositivos de borde o servidores de baja potencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de FuriosaAI no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos. Se recomienda consultar la documentación oficial de OpenAI para obtener datos de evaluación del modelo base.

## Requisitos de hardware

- Hardware específico: FuriosaAI RNGD (NPU), con tensor parallelism de 8 PEs (una tarjeta RNGD).
- Framework de inferencia: Furiosa-LLM (servidor `furiosa-llm serve`).
- Alternativas: el modelo base `openai/gpt-oss-20b` puede ejecutarse en otros frameworks como vLLM, SGLang o Transformers, pero no se especifican requisitos de VRAM para estos entornos.
- Tamaño del repositorio: 45,3 GB (incluye pesos safetensors y bundle FXB).
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de datos verificados para establecer una comparativa cuantitativa con otros modelos de razonamiento de tamaño similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-R1-Distill). La información disponible no incluye resultados de benchmarks ni especificaciones detalladas de otros modelos comparables. Se recomienda consultar las fichas de los modelos originales para realizar una evaluación propia.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser limitado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- Dependencia de hardware: la versión FXB está optimizada exclusivamente para FuriosaAI RNGD; su uso en otros hardware requiere el modelo base y frameworks alternativos.
- Formato harmony: el campo `reasoning` no forma parte de la especificación estándar de OpenAI API, aunque es una convención ampliamente adoptada; puede causar incompatibilidades con clientes que no lo soporten.
- Sin datos de contexto: no se ha especificado la longitud máxima de contexto, lo que limita la planificación de despliegues con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución.

## Enlaces

- [Repositorio HuggingFace furiosa-ai/gpt-oss-20b](https://huggingface.co/furiosa-ai/gpt-oss-20b)
- [Modelo base openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- [Documentación GPT-OSS de FuriosaAI](https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/models/gpt-oss.html)
- [Documentación de modelos soportados por Furiosa-LLM](https://developer.furiosa.ai/latest/en/furiosa_llm/supported_models.html)
- [Referencia del modelo en OpenAI API](https://developers.openai.com/api/docs/models/gpt-oss-20b)
