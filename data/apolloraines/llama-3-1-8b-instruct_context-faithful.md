# ApolloRaines/Llama-3.1-8B-Instruct_Context-Faithful

## Resumen

Llama-3.1-8B-Instruct_Context-Faithful es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada por ApolloRaines mediante jBlaze, una herramienta propietaria de cirugía conductual basada en representation engineering. A diferencia de un fine-tuning convencional, esta técnica altera directamente los pesos del modelo para modificar comportamientos específicos sin entrenamiento adicional. El objetivo declarado es reforzar la adherencia al contexto proporcionado, de modo que el modelo priorice la información de la ventana de contexto frente a su conocimiento paramétrico interno.

Esta modificación resulta especialmente relevante para aplicaciones de generación aumentada por recuperación (RAG) y para entornos de producción donde la fidelidad a los documentos fuente es crítica y se busca reducir alucinaciones. El modelo mantiene la arquitectura original de 32 capas y 8.030 millones de parámetros, con pesos en bf16 y un tamaño de repositorio de 16,1 GB. Está orientado exclusivamente al inglés y se distribuye bajo la licencia Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer decoder, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k) |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | en |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la estándar de Llama 3.1 8B: un transformer decoder con 32 capas, atención por consultas agrupadas (GQA) y ventana de contexto nativa de 128k tokens. No se ha realizado ningún proceso de entrenamiento, fine-tuning o RLHF sobre esta variante. En su lugar, se ha aplicado jBlaze, una herramienta que identifica direcciones únicas en el espacio de activaciones del modelo (single-direction) y modifica los pesos para alterar comportamientos concretos, en este caso la tendencia a priorizar el conocimiento paramétrico sobre el contexto. Esta técnica, emparentada con la abliteration, permite un control conductual quirúrgico sin los costes computacionales de un entrenamiento completo.

## Capacidades

- Generación de texto conversacional e instructivo, heredadas del modelo base Llama-3.1-8B-Instruct.
- Adherencia estricta al contexto: cuando se proporciona material de referencia, el modelo se ciñe a lo que dice el contexto en lugar de recurrir a su conocimiento paramétrico.
- Razonamiento y resolución de problemas básicos, conservados del modelo original.
- Soporte de tool calling y function calling: no especificado para esta variante, aunque el modelo base sí lo soporta.
- Capacidades multilingües: no disponibles, el modelo está limitado al inglés.
- No se mencionan capacidades multimodales, de audio ni modos de pensamiento explícitos.

## Casos de uso

- Generación aumentada por recuperación (RAG) sobre documentación técnica: el modelo puede integrarse en pipelines donde se inyectan fragmentos de manuales o wikis, garantizando que las respuestas se basen exclusivamente en los pasajes recuperados y no en información desactualizada del peso del modelo.
- Resumen de contratos y documentos legales: al recibir un contrato extenso como contexto, el modelo extrae cláusulas y genera resúmenes sin añadir interpretaciones basadas en su conocimiento general, lo que reduce el riesgo de errores en entornos jurídicos.
- Atención al cliente automatizada con base de conocimiento: integrado en un chatbot, el modelo puede consultar una base de datos de preguntas frecuentes o políticas de empresa y responder únicamente con lo que aparece en esos documentos, manteniendo coherencia multi-turno.
- Análisis de informes financieros: dado un balance o un informe de resultados, el modelo puede responder preguntas específicas sobre cifras y tendencias citando únicamente los datos del documento, evitando inferencias especulativas.
- Verificación de hechos en contenidos generados: el modelo puede utilizarse como un filtro que compara afirmaciones generadas por otros sistemas contra un corpus de referencia, señalando discrepancias.
- Chatbots de soporte interno para desarrolladores: con la documentación de una API o un repositorio como contexto, el modelo responde dudas de programación basándose en los ejemplos y especificaciones proporcionados, reduciendo la dependencia de la memoria paramétrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta variante específica. Al tratarse de una modificación de pesos sin entrenamiento, el rendimiento en tareas generales podría diferir del modelo base, pero no se dispone de mediciones que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 16,1 GB en bf16, por lo que se necesitan al menos 16-20 GB de VRAM para cargar el modelo completo en esa precisión.
- GPU recomendadas: NVIDIA RTX 3090 o RTX 4090 (24 GB) para inferencia local; también es viable en A10G, A100 o H100 para despliegue en servidor.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 24 GB como la RTX 3090/4090. Para GPUs de 8-12 GB sería necesario convertir los pesos a cuantizaciones de 8 o 4 bits, aunque no se proporcionan archivos GGUF ni AWQ en el repositorio.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM, TGI o cualquier framework compatible con safetensors y arquitectura Llama. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama.
- Latencia y throughput: no disponible. Al ser un modelo de 8B, se espera un rendimiento similar al Llama 3.1 8B original, pero no se han publicado mediciones específicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,03B | 128k | Ninguna (entrenamiento original) | llama3.1 |
| Llama-3.1-8B-Instruct_Context-Faithful | 8,03B | no disponible (base 128k) | Representation engineering (jBlaze) | llama3.1 |
| Mistral-7B-Instruct-v0.3 | 7,24B | 32k | Fine-tuning instructivo | Apache 2.0 |

La principal diferencia con el modelo base es el comportamiento inducido: mientras que Llama 3.1 Instruct tiende a combinar conocimiento paramétrico con el contexto, esta variante fuerza la dependencia exclusiva del contexto. Frente a alternativas como Mistral 7B, la ventaja es la mayor ventana de contexto heredada (128k) y la arquitectura más reciente, aunque la licencia de Llama 3.1 es más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes que validen el comportamiento prometido de fidelidad al contexto.
- El repositorio registra cero descargas y cero likes, lo que indica una adopción nula y una validación comunitaria inexistente.
- La herramienta jBlaze es propietaria y no se documenta su metodología completa, lo que dificulta la reproducibilidad del proceso de modificación.
- Al forzar la adherencia al contexto, el modelo podría ignorar conocimiento paramétrico útil cuando el contexto es incompleto o ambiguo, generando respuestas incompletas.
- El modelo solo soporta inglés; cualquier uso en otros idiomas degradará significativamente la calidad.
- La licencia Llama 3.1 Community License impone restricciones: si el producto final supera los 700 millones de usuarios mensuales, se requiere una licencia comercial específica de Meta.
- No se garantiza la ausencia de alucinaciones; la modificación reduce la dependencia del conocimiento interno, pero no elimina el riesgo de que el modelo invente información si el contexto es insuficiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct_Context-Faithful
- Herramienta jBlaze (GitHub): https://github.com/apolloraines/jblaze
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
