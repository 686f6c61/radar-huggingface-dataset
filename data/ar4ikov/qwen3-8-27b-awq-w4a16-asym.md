# Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM

## Resumen

Qwen3.8-27B-AWQ-W4A16-ASYM es una cuantización INT4 del modelo multimodal Qwen3.8-27B de Qwen, realizada por el usuario Ar4ikov mediante la herramienta llm-compressor del ecosistema vLLM. El modelo base es un híbrido que combina capas de atención con capas basadas en Gated DeltaNet (una variante de SSM), e incorpora una torre de visión y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. Esta versión cuantizada busca reducir el uso de memoria y acelerar la inferencia manteniendo la mayor fidelidad posible respecto al checkpoint BF16 original.

El cuantizado utiliza un esquema W4A16 asimétrico (con zero-point) y group size 128, aplicado únicamente a las proyecciones lineales de atención y feed-forward, dejando en BF16 la cabeza de lenguaje, los embeddings, toda la torre de visión y las proyecciones sensibles de la rama SSM. El resultado es un modelo de aproximadamente 19,6 GB en disco, con una ventana de contexto nativa de 262 144 tokens (ampliable hasta 1M mediante YaRN). Está pensado para ejecutarse con vLLM, donde los kernels INT4 nativos sí ofrecen ahorro real de VRAM, a diferencia de transformers, que descomprime los pesos a BF16 al cargarlos.

La relevancia de esta ficha radica en que es una de las pocas cuantizaciones AWQ disponibles para un modelo híbrido multimodal de última generación, con un tratamiento cuidadoso de los componentes sensibles (visión, SSM y MTP) para no degradar la calidad. No obstante, el autor advierte explícitamente que no ha realizado validación con benchmarks, por lo que cualquier despliegue en producción requiere evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas con patrón 16 × (3 × Gated DeltaNet → 1 × Gated Attention), torre de visión y cabeza MTP |
| Parametros totales | 27 356 728 560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo; hasta 1 048 576 con YaRN |
| Tipos de cuantizacion | AWQ W4A16 asimétrico (INT4 con zero-point), group size 128, formato compressed-tensors pack-quantized |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors / pack-quantized) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo híbrido que alterna capas de atención tradicional con capas basadas en Gated DeltaNet, una arquitectura de espacio de estados lineal con puertas que reduce el coste computacional frente a la atención completa. La configuración concreta es de 64 capas organizadas en bloques de 16, donde cada bloque contiene 3 capas Gated DeltaNet seguidas de 1 capa Gated Attention. Además, el modelo incluye una torre de visión para entrada de imágenes y una cabeza MTP que permite decodificación especulativa de múltiples tokens.

La cuantización AWQ se realizó con llm-compressor, calibrando sobre 512 muestras de 2048 tokens del dataset HuggingFaceH4/ultrachat_200k, usando la plantilla de chat del modelo. El esquema es W4A16_ASYM, es decir, pesos en INT4 con zero-point asimétrico y activaciones en BF16. El autor eligió partir del checkpoint BF16 original en lugar del FP8 oficial para evitar apilar cuantización INT4 sobre una precisión ya reducida. Se excluyeron de la cuantización la cabeza de lenguaje, los embeddings, toda la torre de visión, las proyecciones in_proj_a e in_proj_b de la rama SSM (por su sensibilidad) y la cabeza MTP completa. Esta última se copió manualmente desde el checkpoint BF16 base, ya que transformers no la instancia y llm-compressor no la habría preservado, permitiendo así mantener la decodificación especulativa.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto, y produce respuestas de texto.
- Razonamiento con modo pensamiento (thinking mode) heredado del modelo base, con parámetros de muestreo diferenciados para modos con y sin razonamiento.
- Soporte de reasoning_effort con niveles low, medium y xhigh.
- Contexto largo nativo de 262 144 tokens, ampliable a 1M mediante YaRN.
- Decodificación especulativa MTP conservada en la cuantización, lo que puede acelerar la generación en runtimes compatibles.
- Capacidades de conversación multi-turno y seguimiento de instrucciones, heredadas del modelo base.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada, pero probable dado el tag "conversational" y las capacidades del modelo base Qwen3.8-27B.
- Multilingüismo: no especificado en la información disponible, aunque el modelo base de Qwen suele ser multilingüe.

## Casos de uso

- Asistentes multimodales en producción: el modelo puede responder a preguntas sobre imágenes combinadas con texto, por ejemplo en atención al cliente donde el usuario envía capturas de pantalla o fotos de productos. Su cuantización INT4 permite desplegarlo en GPUs de gama media con vLLM.
- Análisis de documentos extensos con figuras y tablas: gracias a su contexto de 262 144 tokens, puede procesar documentos largos completos, incluyendo gráficos e ilustraciones, en una sola pasada. Útil en revisión de contratos, informes técnicos o artículos científicos.
- Razonamiento de varios pasos con modo pensamiento: en escenarios de diagnóstico técnico o planificación, el modelo puede generar cadenas de razonamiento antes de dar la respuesta final, útil para depuración de código o análisis de incidencias.
- Generación de código asistida con contexto de repositorio completo: con su ventana de contexto amplia, puede recibir un repositorio entero y generar o modificar código teniendo en cuenta el estilo y las dependencias del proyecto. La decodificación especulativa MTP puede reducir la latencia en entornos interactivos.
- Sistemas RAG multimodales: al combinar recuperación de fragmentos de texto e imágenes, el modelo puede responder consultas que requieran interpretar tanto contenido textual como visual, por ejemplo en bases de conocimiento corporativas con diagramas.
- Entornos con restricciones de memoria: al pesar solo 19,6 GB en disco y requerir aproximadamente 14-15 GB de VRAM para los pesos en INT4, puede ejecutarse en una RTX 4090 (24 GB) o en dos GPUs de 16 GB con tensor parallelism, habilitando capacidades de nivel 27B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el cuantizado no ha pasado validación con benchmarks, solo se ha comprobado la conectividad de la generación. Se recomienda ejecutar evaluaciones propias antes de cualquier uso en producción.

## Requisitos de hardware

- VRAM estimada para los pesos en INT4: aproximadamente 13,7 GB (27,36 B parámetros × 0,5 bytes por parámetro), más overhead de runtime y KV cache. Con contexto largo, la KV cache puede superar los 10 GB adicionales.
- GPU recomendadas: para contexto estándar (hasta 32K), una RTX 4090 (24 GB) o una A100 40 GB son suficientes. Para contexto completo de 262K, se recomienda al menos una A100 80 GB o dos GPUs con tensor parallelism.
- El ejemplo de vLLM del autor usa `--tensor-parallel-size 2`, lo que sugiere que dos GPUs de 16 GB o 24 GB son una configuración viable.
- No cabe en GPUs de consumo de 8 GB o 12 GB con contexto útil; para esos casos habría que reducir drásticamente la ventana de contexto o usar cuantizaciones más agresivas.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), SGLang, y transformers (aunque en este último no hay ahorro de VRAM porque descomprime a BF16).
- Latencia y throughput: no disponibles en la información proporcionada. Dependerá del hardware y del uso de decodificación especulativa.

## Comparativa con modelos similares

No se dispone de información sobre otros cuantizados AWQ del mismo modelo base para comparar directamente. La comparativa más relevante es con el modelo base Qwen3.8-27B en BF16 o FP8:

| Modelo | Parametros | Contexto | Formato | Tamaño aprox. | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36 B | 262 144 | BF16 / FP8 | ~55 GB (BF16) / ~28 GB (FP8) | Apache 2.0 |
| Qwen3.8-27B-AWQ-W4A16-ASYM | 27,36 B | 262 144 | INT4 AWQ | ~19,6 GB | Apache 2.0 |

La cuantización AWQ reduce el tamaño a aproximadamente un tercio del BF16, manteniendo la misma arquitectura y contexto. La degradación esperada es mayor en la parte textual que en la visual, ya que la torre de visión se dejó íntegramente en BF16. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- El autor no ha realizado validación con benchmarks; solo se verificó la conectividad de la generación. Es imprescindible ejecutar evaluaciones propias antes de usar en producción.
- En transformers, los pesos se descomprimen a BF16 al cargar, por lo que no hay ahorro de VRAM en ese runtime. El beneficio solo se obtiene con vLLM o SGLang.
- La degradación esperada por la cuantización se concentra en la parte textual; la parte visual debería mantener calidad cercana a la del modelo base, pero no está garantizado.
- La cabeza MTP se copió manualmente desde el checkpoint BF16; si el runtime no soporta decodificación especulativa, esta característica no se aprovechará.
- No se especifican idiomas soportados en la información proporcionada; se asume herencia del modelo base, pero no está confirmado.
- Riesgo de alucinación y sesgos: no hay datos específicos para este cuantizado; se heredan los del modelo base, que no han sido documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los términos del modelo base por si hubiera condiciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización: https://github.com/vllm-project/llm-compressor
