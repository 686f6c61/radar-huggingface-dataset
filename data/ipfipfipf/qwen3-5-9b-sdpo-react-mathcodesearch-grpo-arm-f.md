# ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-f

## Resumen

El modelo `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-f` es un fine-tune no oficial del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `ipfipfipf` en Hugging Face. El nombre del repositorio sugiere que el ajuste se ha realizado combinando varias técnicas de entrenamiento y optimización: SDPO (Stepwise Direct Preference Optimization), ReAct (razonamiento y actuación), búsqueda de código matemático, GRPO (Group Relative Policy Optimization) y ARM (posiblemente Active Reasoning Management o similar). Sin embargo, la model card publicada es la del modelo base, por lo que no se dispone de documentación específica sobre el proceso de fine-tune ni sobre sus datos de entrenamiento.

El modelo base Qwen3.5-9B es un modelo multimodal de 9 000 millones de parámetros desarrollado por Alibaba Qwen, con una arquitectura híbrida que combina Gated Delta Networks y atención tradicional, un codificador de visión y una ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens. Según la información disponible, este fine-tune hereda dicha arquitectura y capacidades, aunque no se han publicado evaluaciones independientes que confirmen el rendimiento específico de la variante ajustada. Con cero descargas y cero likes en el momento de la consulta, se trata de un modelo experimental que debe utilizarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet y Gated Attention, con vision encoder |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 tokens |
| Tipos de cuantizacion | No disponible (formato original safetensors; se pueden generar GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible para el fine-tune; el modelo base declara soporte para 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura de lenguaje causal con codificador de visión, integrando un diseño híbrido de atención: cada bloque se compone de tres subcapas de Gated DeltaNet (una variante de atención lineal con estado recurrente) seguidas de una subcapa de Gated Attention (atención completa con cabezas Q y KV separadas). En total hay 32 capas, con dimensión oculta de 4096 y FFN de dimensión intermedia 12288. El modelo incorpora además entrenamiento multi-step MTP (Multi-Token Prediction). La integración multimodal se realiza mediante fusión temprana de tokens visuales y textuales.

En cuanto al fine-tune específico, el nombre del repositorio indica el uso de SDPO, ReAct, GRPO y ARM, pero no se ha publicado ninguna descripción detallada del proceso de entrenamiento, la composición del dataset, el número de pasos o los hiperparámetros utilizados. La model card del repositorio es idéntica a la del modelo base, por lo que no hay información verificable sobre los datos de ajuste. Se recomienda contactar con el autor o consultar el historial de commits del repositorio para obtener más detalles.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B, hereda las capacidades de razonamiento complejo, matemáticas y conocimiento general del modelo base.
- Comprensión multimodal: incluye codificador de visión, por lo que puede procesar imágenes junto con texto (image-text-to-text).
- Generación de código: el nombre del fine-tune incluye "code", lo que sugiere un refuerzo específico en tareas de programación, aunque no hay datos que lo confirmen.
- Búsqueda y recuperación: la presencia de "search" en el nombre apunta a un entrenamiento orientado a tareas de búsqueda de información o código.
- Posible soporte de tool calling y agentes: las técnicas ReAct y GRPO suelen emplearse para entrenar modelos en razonamiento actuante y uso de herramientas, por lo que es probable que el fine-tune haya reforzado estas capacidades, pero no está documentado.
- Multilingüismo: el modelo base declara soporte para 201 idiomas; el fine-tune debería mantenerlo, aunque no se ha verificado.

## Casos de uso

- Asistente de programación con búsqueda de código: el modelo puede integrarse en un IDE o pipeline de CI/CD para sugerir fragmentos de código, buscar en repositorios locales o documentación, y razonar sobre errores de compilación. Su posible entrenamiento con ReAct y búsqueda de código lo hace adecuado para tareas que requieren consultar fuentes externas antes de responder.
- Resolución de problemas matemáticos y científicos: gracias a su base Qwen3.5 y al refuerzo en matemáticas (math en el nombre), puede emplearse como motor de razonamiento en plataformas educativas o de investigación, explicando paso a paso la resolución de ecuaciones o demostraciones.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o gráficos combinados con texto para extraer información, resumir papers o generar descripciones técnicas.
- Agente autónomo de razonamiento multi-paso: si el fine-tune ha reforzado ReAct, el modelo puede actuar como agente que planifica, ejecuta acciones (llamadas a API, consultas a bases de datos) y razona sobre los resultados, útil para automatización de tareas complejas.
- Chat conversacional técnico: su capacidad de mantener diálogos multi-turno con contexto largo (262K tokens) permite usarlo como chatbot de soporte técnico que recuerda todo el historial de una sesión extensa de depuración o consulta.
- Prototipado rápido de aplicaciones de IA: al ser un modelo de 9B con licencia Apache 2.0, puede desplegarse en entornos de desarrollo para experimentar con técnicas de fine-tune, evaluación de agentes o sistemas RAG sin incurrir en costes de API propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune. La model card del repositorio incluye la tabla de benchmarks del modelo base Qwen3.5-9B, que se reproduce parcialmente a continuación. Estos datos corresponden al modelo base, no al fine-tune, y deben interpretarse únicamente como referencia de la capacidad original.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | - | - |

La tabla está incompleta en la información proporcionada; no se dispone del valor de MMLU-Redux para Qwen3.5-9B ni de los resultados de otros benchmarks como HumanEval, GSM8K o tareas de visión. Para el fine-tune no hay ninguna métrica publicada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 8,95 B parámetros. En precisión fp16, los pesos ocupan aproximadamente 17,9 GB (coincide con el tamaño del repositorio). Se recomienda una GPU con al menos 24 GB de VRAM para inferencia en fp16 sin cuantización.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10G, A100 (40 GB), L40S o superiores. Según la receta de vLLM, el modelo cabe cómodamente en una GPU de 24 GB.
- Con cuantización: usando GGUF Q4_K_M (~5-6 GB de pesos) podría ejecutarse en GPUs de 8-12 GB como RTX 3060 o RTX 4070, aunque con posible degradación de calidad.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers, llama.cpp, Ollama y TGI. La receta de vLLM confirma su soporte oficial.
- Latencia y throughput: no hay datos publicados. En una RTX 4090 se puede esperar una generación de 30-50 tokens/s en fp16, pero depende de la longitud de contexto y el uso de MTP.

## Comparativa con modelos similares

El modelo se puede comparar con otras variantes de la familia Qwen3.5 y con modelos de propósito similar. La siguiente tabla resume las diferencias principales basadas en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Multimodal | MMLU-Pro |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 8,95 B | 262K | Apache 2.0 | Sí | 82,5 |
| Qwen3.5-4B | ~4 B | no disponible | Apache 2.0 | Sí | 79,1 |
| GPT-OSS-20B | 20 B | no disponible | no disponible | no disponible | 74,8 |
| Qwen3-Next-80B-A3B-Thinking | 80 B (MoE, 3B activos) | no disponible | no disponible | no disponible | 82,7 |

El fine-tune `ipfipfipf` no tiene benchmarks propios, por lo que no se puede establecer una comparativa cuantitativa fiable. Frente a modelos comerciales o de mayor tamaño, su ventaja principal es el tamaño contenido (9B) y la licencia permisiva, lo que facilita el despliegue local.

## Limitaciones y advertencias

- Falta de documentación del fine-tune: no se ha publicado información sobre el proceso de entrenamiento, los datos utilizados, las técnicas exactas ni los criterios de evaluación. El modelo debe considerarse experimental.
- Sin validación independiente: con cero descargas y cero likes, no hay evidencia de que el modelo funcione como sugiere su nombre. Es posible que el fine-tune haya degradado capacidades del modelo base o introducido sesgos no documentados.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento matemático o búsqueda si no se verifica externamente.
- Sesgos potenciales: el modelo base ha sido entrenado con datos mayoritariamente en inglés y chino, y el fine-tune podría haber acentuado ciertos sesgos según los datos de ajuste, que se desconocen.
- Limitaciones de idioma: aunque el base declara 201 idiomas, no se ha comprobado el rendimiento del fine-tune en lenguas minoritarias o con bajo soporte.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de un modelo base con la misma licencia, se deben mantener los avisos de atribución correspondientes.
- Producción no recomendada: sin benchmarks ni pruebas de robustez, no es aconsejable utilizar este modelo en entornos productivos sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-f
- Modelo base Qwen3.5-9B (Hugging Face): https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Repositorio GitHub de Qwen3.8 (que incluye Qwen3.5): https://github.com/QwenLM/Qwen3.8
- Página en Ollama: https://ollama.com/library/qwen3.5:9b
- Receta de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Versión de unsloth: https://huggingface.co/unsloth/Qwen3.5-9B
