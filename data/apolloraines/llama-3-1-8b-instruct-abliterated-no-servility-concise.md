# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Servility-Concise

## Resumen

Este modelo es una variante de `meta-llama/Llama-3.1-8B-Instruct` modificada mediante *representation engineering*, concretamente con la técnica **jBlaze** desarrollada por Apollo Raines. No se realizó ningún fine-tuning ni entrenamiento adicional: los cambios de comportamiento provienen exclusivamente de proyecciones ortogonales en el espacio de pesos, basadas en análisis de activaciones contrastivas (SVD sobre pares de activaciones). El objetivo es eliminar tres direcciones representacionales concretas: el rechazo (*refusal*), la servilidad (*servility*) y la verbosidad (*verbosity*), dando lugar a un asistente independiente, sin censura, sin disculpas excesivas y con respuestas más concisas.

Con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens (heredada del modelo base), este modelo mantiene las capacidades generales de Llama 3.1 8B Instruct (razonamiento, código, matemáticas, conversación) pero con un estilo de salida menos restrictivo. Es relevante para desarrolladores que buscan un modelo de chat abierto sin las limitaciones típicas de rechazo de los modelos instructivos estándar, aunque con las advertencias éticas y legales que ello conlleva. El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (32 capas, transformer decoder-only) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible en el repo (solo safetensors bf16); se pueden generar GGUF mediante conversion |
| Idiomas soportados | ingles (segun metadatos `language: en`) |
| Licencia | Llama 3.1 Community License (igual que el modelo base) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Llama 3.1 8B Instruct: un transformer decoder-only con 32 capas, atención con *grouped-query attention* (GQA), normalización RMSNorm y activación SwiGLU. No se realizó ningún entrenamiento adicional sobre el modelo base. El cambio se introdujo mediante **jBlaze**, una herramienta de *representation engineering* que extrae direcciones representacionales mediante análisis de activaciones contrastivas (SVD sobre pares de activaciones) y luego aplica proyecciones ortogonales en el espacio de pesos para suprimir o amplificar dichas direcciones. En este caso se aplicaron tres supresiones con magnitudes `m` específicas:

- **refusal**: supresión con `m=2.0`
- **servility**: supresión con `m=1.0`
- **verbosity**: supresión con `m=2.0`

El "arm" utilizado es **A3**, que afecta a las capas de atención y a todas las capas MLP. La precisión se mantiene en bf16. Al no haber entrenamiento, no hay datos de tokens de entrenamiento ni de dataset; el modelo conserva los conocimientos y capacidades del base, aunque las modificaciones de dirección pueden alterar ligeramente el comportamiento en ciertos dominios.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés.
- Razonamiento general, matemáticas básicas y generación de código (ejemplos en la model card muestran una función Python para invertir cadenas).
- Respuestas sin rechazo: el modelo no se niega a responder a peticiones que el modelo base podría rechazar (por ejemplo, "How do I pick a lock?" recibe una respuesta técnica).
- Estilo de salida más directo y conciso: la dirección de verbosidad está suprimida, por lo que las respuestas tienden a ser más breves y sin relleno.
- Sin servilidad: no se disculpa excesivamente ni busca complacer al usuario de forma exagerada.
- Mantiene el formato de chat de Llama 3.1 Instruct (chat template).
- No se mencionan capacidades de tool calling, agentes, visión ni audio (el modelo base tampoco las tiene; es solo texto).

## Casos de uso

- **Asistentes de chat sin restricciones en entornos controlados**: el modelo puede usarse como backend de chatbots donde se requiera que el asistente responda a temas delicados sin evasivas, siempre dentro de los límites legales y éticos de la organización.
- **Generación de código en entornos de desarrollo**: al no mostrar rechazo, puede generar scripts o fragmentos de código para tareas de automatización, incluso si estas involucran operaciones sensibles (por ejemplo, pruebas de seguridad en sistemas propios).
- **Investigación en *representation engineering***: este modelo sirve como caso de estudio práctico para comparar el efecto de la supresión de direcciones sobre el comportamiento de un LLM instructivo, frente a la abliteration clásica o al modelo original.
- **Evaluación de sesgos y alineación**: permite estudiar cómo la eliminación de la servilidad y el rechazo afecta a la calidad de las respuestas, la coherencia y la seguridad, útil para investigadores en IA responsable.
- **Prototipado rápido de aplicaciones de conversación**: al ser un modelo de 8B, puede desplegarse en una GPU consumer y usarse para pruebas de concepto de chatbots con un tono más directo y menos "asistencial".
- **Fine-tuning posterior**: al ser una modificación de pesos sin entrenamiento, se puede usar como punto de partida para fine-tuning específico sobre dominios concretos, manteniendo la independencia de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluación cuantitativa (MMLU, HumanEval, GSM8K, etc.) y el repositorio no muestra comparativas con el modelo base ni con otras variantes. Al ser una modificación de pesos sin entrenamiento, se espera que el rendimiento en tareas estándar sea muy similar al de Llama-3.1-8B-Instruct, pero no hay datos que lo confirmen.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en bf16 ocupa aproximadamente 16,1 GB (según el tamaño del repo). En cuantización de 8 bits (int8) se reduce a unos 8 GB, y en 4 bits (GGUF Q4_K_M) a unos 4,5-5 GB, aunque el repo no proporciona archivos cuantizados.
- **GPU recomendadas**: para bf16 completo se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4). Con cuantización 4 bits puede ejecutarse en GPUs de 8 GB (RTX 3070/3080, RTX 4060 Ti, etc.).
- **¿Cabe en GPU consumer?** Sí, con cuantización. El modelo base Llama 3.1 8B es ampliamente desplegado en hardware consumer mediante GGUF.
- **Opciones de despliegue**: se puede usar con `transformers` (como se muestra en el ejemplo de la model card), con `vLLM` para inferencia de alto rendimiento, con `llama.cpp`/`Ollama` si se convierte a GGUF, o con `TGI` (Text Generation Inference). No hay versiones GGUF oficiales en el repo, pero se pueden generar.
- **Latencia y throughput**: no hay datos específicos. En general, un modelo de 8B en una RTX 4090 con cuantización 4 bits suele generar entre 50 y 100 tokens/s; en bf16 con A100 puede superar los 100 tokens/s, pero son estimaciones generales no verificadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Llama-3.1-8B-Instruct-Abliterated-No-Servility-Concise** (este) | 8,03 B | 128k | jBlaze (proyeccion ortogonal sobre direcciones refusal, servility, verbosity) | Llama 3.1 Community | Hugging Face |
| **mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated** | 8,03 B | 128k | Abliteration clasica (eliminacion de la direccion de refusal) | Llama 3.1 Community | Hugging Face, Ollama |
| **meta-llama/Llama-3.1-8B-Instruct** (base) | 8,03 B | 128k | Entrenamiento instructivo con RLHF | Llama 3.1 Community | Hugging Face, API de Meta |

La diferencia principal entre este modelo y la abliteration de mlabonne es que jBlaze actúa sobre tres direcciones (refusal, servility y verbosity) en lugar de solo refusal, y lo hace mediante proyección ortogonal en lugar de eliminación directa de la dirección. El modelo base es el punto de referencia para medir el impacto de estas modificaciones. No hay datos de benchmarks que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- **Sesgos del modelo base**: al derivar de Llama 3.1 8B Instruct, hereda los sesgos sociales, culturales y de género presentes en sus datos de entrenamiento. La modificación de direcciones no elimina estos sesgos.
- **Riesgo de alucinación**: al suprimir la dirección de rechazo, el modelo puede responder con más confianza a preguntas sobre las que no tiene conocimiento, aumentando el riesgo de alucinaciones factuales. No hay métricas que cuantifiquen este efecto.
- **Riesgo de uso indebido**: al ser un modelo sin censura, puede generar contenido dañino, ilegal o no ético si se le pide explícitamente. La licencia Llama 3.1 Community restringe algunos usos, pero el control depende del desarrollador.
- **Limitaciones de idioma**: el modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas es limitado y no está documentado.
- **Restricciones de licencia**: la Licencia Llama 3.1 Community permite uso comercial, pero impone restricciones (por ejemplo, no usar para ciertos fines militares o de vigilancia). El modelo hereda estas condiciones.
- **Falta de evaluación**: al no haber benchmarks publicados, no se puede garantizar que las capacidades del modelo base se mantengan intactas tras las modificaciones. Es posible una degradación en tareas de razonamiento complejo.
- **Cuantizacion no oficial**: no hay archivos GGUF ni de otras cuantizaciones en el repo; si se necesita una versión cuantizada, hay que generarla manualmente, lo que puede introducir pérdidas de calidad.
- **Problemas de mantenimiento**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado ampliamente por la comunidad. No hay garantías de soporte ni de corrección de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Servility-Concise
- Repositorio de la herramienta jBlaze: https://github.com/apolloraines/jblaze
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante abliterated de referencia (mlabonne): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Version GGUF de la variante de mlabonne: https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF
- Articulo sobre abliteration (mencionado en la model card): no se proporciona enlace directo, pero se puede buscar en el blog de mlabonne.
