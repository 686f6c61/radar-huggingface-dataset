# alztrk/Ornith-1.5-35B-A3B-Abliterated

## Resumen

Ornith-1.5-35B-A3B-Abliterated es una variante del modelo MoE Ornith-1.5-35B-A3B de Ornith AI, modificada mediante cirugía de ablación direccional sobre las activaciones de los estados ocultos en las 40 capas. El proceso proyecta ortogonalmente las direcciones de rechazo (refusal directions) fuera de las matrices de proyección de atención y MLP, eliminando los mecanismos de negativa del modelo original. El resultado es un modelo de generación de texto sin censura, orientado a casos de uso donde se requiere una respuesta sin filtros de seguridad.

El modelo base, Ornith-1.5-35B-A3B, es un mixture-of-experts con 256 expertos totales y aproximadamente 3.1B parámetros activos por token, con una arquitectura híbrida de 40 capas que combina atención lineal DeltaNet con atención completa. Soporta una ventana de contexto nativa de 262.144 tokens (262K). Esta variante abliterated se distribuye en formato Safetensors de precisión completa y en una suite de cuantizaciones GGUF dinámicas, lo que permite su ejecución en hardware de consumo con 12-16 GB de VRAM.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece las capacidades de razonamiento y generación de un MoE de 35B con coste computacional de un modelo de 3B activos; por otro, al estar abliterated, cubre un nicho de usuarios que buscan respuestas sin restricciones de seguridad, aunque con los riesgos asociados a la ausencia de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 40 capas (DeltaNet Linear Attention + Full Attention), 256 expertos, 8 activos + shared experts |
| Parametros totales | 34.660.610.688 (34.7B) según safetensors; 35.8B según la model card |
| Parametros activos | ~3.1B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF dinámicos: Q3_K_M (~15.61 GB), Q4_K_M (~19.71 GB), Q5_K_M (~23.03 GB), Q8_0 (~34.37 GB) |
| Idiomas soportados | Inglés (en), turco (tr), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (precisión completa) y GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con 256 expertos, de los cuales 8 se activan por token junto con expertos compartidos. La capa de atención es híbrida: combina atención lineal DeltaNet con atención completa, lo que permite manejar contextos largos de hasta 262K tokens con un coste computacional reducido. El modelo se enmarca en el paradigma de auto-mejora de Ornith-1.5, donde el modelo propone tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo.

La variante abliterated se obtiene mediante ablación direccional: se identifican las direcciones de rechazo en las activaciones de los estados ocultos de las 40 capas y se proyectan ortogonalmente fuera de las matrices de proyección down de atención y MLP. Este proceso elimina la tendencia del modelo a negarse a responder a ciertas solicitudes, sin modificar los pesos de forma destructiva. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tuning de la variante abliterated.

## Capacidades

- Generación de texto conversacional y de larga forma con contexto de hasta 262K tokens.
- Razonamiento multi-step y resolución de problemas complejos gracias a la arquitectura MoE híbrida.
- Generación de código, incluyendo ejemplos de técnicas de bajo nivel (el README muestra un prompt sobre inyección de procesos a nivel de kernel).
- Capacidades multilingües en inglés, turco y chino.
- Soporte de tool calling y function calling (heredado del modelo base, aunque no documentado explícitamente en esta variante).
- Sin mecanismos de rechazo: responde a solicitudes que el modelo base podría negar, incluyendo contenido sensible o controvertido.
- El modelo base es multimodal (tag image-text-to-text), pero la variante abliterated no documenta explícitamente el soporte de visión en su model card.

## Casos de uso

- Investigación en seguridad y alineación de modelos: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparando respuestas con la versión original para analizar el impacto de la ablación direccional.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que aborden temas tabú o controvertidos sin filtros automáticos.
- Desarrollo de asistentes de código especializados: el modelo puede generar ejemplos de código de bajo nivel (por ejemplo, técnicas de inyección de procesos) para fines educativos o de investigación en seguridad ofensiva, con la ventaja de su contexto largo de 262K tokens para proyectos extensos.
- Análisis de documentos largos: gracias a su ventana de contexto nativa de 262K tokens, puede procesar libros completos, informes técnicos extensos o bases de código enteras en una sola pasada.
- Despliegue en entornos con recursos limitados: las cuantizaciones GGUF dinámicas (Q3_K_M, Q4_K_M) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM, usando Ollama, llama.cpp o LM Studio.
- Experimentación con agentes autónomos: el modelo puede integrarse en pipelines de agentes que requieran razonamiento multi-paso y generación de respuestas sin rechazo, por ejemplo en simulaciones de entornos hostiles o juegos de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La plataforma benchlm.ai asigna una puntuación pública agregada de 49.27/100 (puesto 134 de 221), pero se indica que es una estimación y no se desglosan los resultados por tarea. No se dispone de datos comparativos fiables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q3_K_M (~15.61 GB) cabe en una GPU de 16 GB VRAM; con Q4_K_M (~19.71 GB) se requiere una GPU de 24 GB o usar offloading parcial a CPU.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080 o RTX 3090 (16-24 GB) para Q3_K_M; para precisión completa (Q8_0, ~34.37 GB) se necesitan GPUs profesionales como A100 (40 GB) o H100.
- En consumer GPU: sí, con cuantizaciones Q3_K_M o Q4_K_M y offloading a CPU en GPUs de 12-16 GB.
- Opciones de despliegue: Ollama (con Modelfile), llama.cpp (llama-cli), LM Studio, Hugging Face Transformers (con device_map="auto"), y vLLM (según la búsqueda web, el modelo base se sirve con vLLM en DGX Spark con NVFP4 y decodificación especulativa MTP).
- Latencia y throughput: no disponible. Al ser un MoE con ~3.1B parámetros activos, la latencia por token es significativamente menor que la de un modelo denso de 35B, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Abliterated | 34.7B | ~3.1B | 262K | Apache 2.0 | Variante sin rechazos, GGUF disponibles |
| Ornith-1.5-35B-A3B (base) | 34.7B | ~3.1B | 262K | Apache 2.0 | Modelo original con alineación |
| Qwen3-30B-A3B (referencia estructural) | ~30B | ~3B | 128K (ampliable) | Apache 2.0 | MoE similar, sin ablación, benchmarks públicos extensos |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación estructural es válida: ambos son MoE con ~3B activos, pero Qwen3-30B-A3B tiene benchmarks públicos verificables, mientras que Ornith-1.5-35B-A3B solo tiene una puntuación estimada.

## Limitaciones y advertencias

- Al ser una variante abliterated, el modelo carece de mecanismos de rechazo de seguridad. Esto implica un riesgo elevado de generar contenido dañino, ilegal o éticamente cuestionable si se usa sin supervisión.
- El autor declara que el usuario asume toda la responsabilidad sobre las salidas generadas. No hay garantías de seguridad ni de cumplimiento normativo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o código incorrecto, especialmente en dominios especializados.
- Limitaciones de idioma: solo se declaran soporte para inglés, turco y chino. El rendimiento en otros idiomas no está garantizado.
- La ablación direccional puede degradar ligeramente la calidad de las respuestas en comparación con el modelo base, aunque no se han publicado evaluaciones cuantitativas al respecto.
- No se documentan capacidades de visión en esta variante, a pesar de que el modelo base tiene el tag image-text-to-text. Si se necesita procesamiento multimodal, es preferible usar el modelo original.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación puede generar problemas legales o de reputación en aplicaciones empresariales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alztrk/Ornith-1.5-35B-A3B-Abliterated
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Variante MLX 8-bit (junafinity): https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Repositorio DGX Spark (MiaAI Lab): https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark/blob/main/README.md
- Perfil de benchmarks (benchlm.ai): https://benchlm.ai/models/ornith-1-5-35b-a3b
