# dfp-official/Qwen3.8-Flash-Next-oQ8e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ8e-mtp es una versión cuantizada a 8 bits del modelo Qwen3.8-Flash-Next, desarrollado por el equipo de Qwen (Alibaba) y posteriormente cuantizado por el usuario dfp-official mediante la herramienta oQ (oMLX v0.6.3) en formato MLX. Se trata de un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) con una arquitectura híbrida que combina atención GDN (Grouped Dot-Product Attention) y QSA (Quadratic Self-Attention), además de una tabla de embeddings n-gram de gran tamaño para acelerar la recuperación local de tokens.

El modelo base cuenta con 125 000 millones de parámetros principales más 51 000 millones adicionales en embeddings n-gram, activando solo 6 000 millones de parámetros por token. Su ventana de contexto nativa es de 262 144 tokens, extensible a 1 000 000 mediante la técnica YaRN. Esta cuantización específica reduce los pesos a 8 bits con un tamaño de grupo de 64, lo que permite ejecutar el modelo en hardware Apple Silicon mediante la librería MLX, aunque el repositorio ocupa 194,9 GB, lo que sugiere que se necesitan equipos con gran cantidad de memoria unificada.

La relevancia de este modelo radica en su combinación de eficiencia computacional (solo 6B activos) con una capacidad de contexto muy amplia, lo que lo hace adecuado para tareas de procesamiento de documentos extensos, análisis de codebases completos y aplicaciones de agentes que requieren razonamiento multi-paso. La versión cuantizada facilita su despliegue en entornos con restricciones de memoria, aunque la licencia y los detalles de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención GDN + QSA, embeddings n-gram |
| Parametros totales | 52 558 106 979 (según safetensors; incluye 125B principales + 51B n-gram) |
| Parametros activos | 6 000 000 000 (6B por token) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 con YaRN |
| Tipos de cuantizacion | 8 bits (oQ, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE con dos mecanismos de atención innovadores: GDN (Grouped Dot-Product Attention) y QSA (Quadratic Self-Attention). Según el repositorio oficial de Qwen, esta combinación mejora la capacidad del modelo y optimiza la eficiencia computacional, la capacidad de almacenamiento y la estabilidad del entrenamiento. Además, incorpora una tabla de embeddings n-gram de 51 000 millones de parámetros que permite búsquedas locales rápidas de tokens, reduciendo la carga de atención para tokens frecuentes.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en los datos proporcionados. La cuantización oQ aplicada por dfp-official utiliza precisión mixta con 8 bits y un tamaño de grupo de 64, lo que reduce el tamaño del modelo en memoria a costa de una posible pérdida menor de precisión. El formato MLX safetensors está optimizado para ejecución en Apple Silicon mediante la librería MLX.

## Capacidades

- Generación de texto y razonamiento complejo gracias a su arquitectura MoE con 6B parámetros activos.
- Procesamiento multimodal (texto e imagen, según la descripción de QwenCloud para la familia Qwen3.8-Flash).
- Ventana de contexto nativa de 262 144 tokens, ampliable a 1 000 000 con YaRN, ideal para documentos largos y conversaciones multi-turno.
- Soporte de tool calling y function calling probablemente incluido, aunque no está confirmado explícitamente en la información disponible.
- Capacidad de razonamiento multi-paso y uso como agente autónomo, gracias a su gran contexto y arquitectura eficiente.
- Multilingüismo no confirmado; la ficha de HuggingFace no especifica idiomas soportados.

## Casos de uso

- Análisis de codebases completos: con 262K tokens de contexto nativo, el modelo puede procesar repositorios enteros en una sola pasada, facilitando tareas de revisión de código, detección de vulnerabilidades o generación de documentación.
- Procesamiento de documentos legales o académicos extensos: su ventana de contexto permite resumir, extraer información y responder preguntas sobre contratos, tesis o informes de cientos de páginas sin necesidad de dividirlos.
- Atención al cliente automatizada con historial largo: el modelo puede mantener conversaciones multi-turno con contexto acumulado de hasta un millón de tokens, gestionando interacciones complejas sin perder el hilo.
- Asistentes de programación integrados en IDE: gracias a su capacidad de generación de código y razonamiento, puede sugerir implementaciones, explicar fragmentos y refactorizar código en tiempo real.
- Agentes autónomos de investigación: con tool calling y contexto amplio, puede buscar información, ejecutar herramientas y sintetizar resultados en tareas de análisis de mercado o revisión bibliográfica.
- Despliegue en entornos Apple Silicon: al estar cuantizado en MLX, puede ejecutarse en Macs con suficiente memoria unificada (por ejemplo, Mac Studio con 128 GB o más), ofreciendo una alternativa local a APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización (oQ8e-mtp) en la información disponible. El modelo base Qwen3.8-Flash-Next ha sido probado en hardware NVIDIA GB300 NVL72 con TensorRT-LLM en formato FP8, según un anuncio en los foros de NVIDIA, pero no se proporcionan cifras concretas de rendimiento (MMLU, HumanEval, GSM8K, etc.) en los datos recopilados. Por tanto, no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- El repositorio ocupa 194,9 GB, lo que indica que la cuantización de 8 bits requiere una cantidad considerable de memoria. Con 52,5B parámetros a 8 bits, el tamaño en memoria sería aproximadamente 52,5 GB, más overhead de activaciones y KV cache.
- Diseñado para Apple Silicon mediante MLX: se recomienda un Mac con al menos 64 GB de memoria unificada para cargar el modelo completo, aunque 128 GB sería más seguro para contexto largo.
- No es adecuado para GPUs de consumo convencionales (RTX 4090, etc.) debido al formato MLX y al tamaño; para GPUs NVIDIA se necesitaría una conversión a otro formato (por ejemplo, GGUF o FP8) no incluida en este repositorio.
- Opciones de despliegue: MLX (Apple Silicon), posiblemente vLLM o TGI si se convierte a formatos estándar, aunque no está soportado de forma nativa.
- Latencia y throughput: no disponibles para esta cuantización específica.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa fiable. El modelo base Qwen3.8-Flash-Next se puede comparar cualitativamente con otros MoE de gran escala:

| Modelo | Parámetros totales | Activos por token | Contexto nativo | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176B (125B + 51B n-gram) | 6B | 262K | no disponible |
| Qwen3-235B-A22B | 235B | 22B | 131K | Apache 2.0 (según versión) |
| DeepSeek-V3 | 671B | 37B | 128K | MIT (según versión) |

Nota: los datos de Qwen3-235B-A22B y DeepSeek-V3 son aproximados y pueden variar; no se ha verificado su exactitud en esta ficha. La comparativa se basa en información pública general, no en benchmarks medidos.

## Limitaciones y advertencias

- La cuantización a 8 bits puede degradar ligeramente la precisión en tareas de razonamiento complejo o matemáticas, en comparación con el modelo en FP8 o BF16.
- Licencia no especificada en la ficha de HuggingFace; antes de usar comercialmente, es necesario verificar la licencia del modelo base Qwen3.8-Flash-Next y las condiciones de la cuantización.
- El modelo está etiquetado como "qwen4_exp", lo que indica que es una versión experimental; puede contener comportamientos inesperados o inestabilidad en producción.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión cuantizada; se recomienda realizar pruebas específicas antes de desplegar en entornos críticos.
- El tamaño del repositorio (194,9 GB) y el formato MLX limitan su uso a hardware Apple Silicon con gran memoria; no es portable directamente a GPUs NVIDIA sin conversión.
- La información sobre idiomas soportados no está disponible; es posible que el modelo tenga un rendimiento desigual en lenguas distintas del inglés y el chino.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/dfp-official/Qwen3.8-Flash-Next-oQ8e-mtp
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Página de QwenCloud para Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Anuncio en foros de NVIDIA sobre Qwen3.8-Flash-Next: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
- Anuncio de disponibilidad de la versión 176B: https://forums.developer.nvidia.com/t/qwen3-8-flash-next-176b-now-available/381413
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
