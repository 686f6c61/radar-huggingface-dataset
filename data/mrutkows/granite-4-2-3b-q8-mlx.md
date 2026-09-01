# mrutkows/granite-4.2-3b-q8-mlx

## Resumen

Este repositorio contiene una conversión a formato MLX del modelo Granite 4.2 3B de IBM, cuantizada a 8 bits (q8) con group-size 64. La conversión ha sido realizada por el usuario mrutkows y está pensada para ejecutarse de forma nativa en hardware Apple Silicon (M1/M2/M3/M4) mediante el framework MLX y la librería mlx-lm. El modelo base, ibm-granite/granite-4.2-3b, pertenece a la familia Granite 4.2 de IBM, que se caracteriza por ser modelos densos decoder-only con capacidades multilingües, soporte para tool calling, generación de JSON estructurado y un modo de razonamiento integrado (thinking mode).

La relevancia de esta variante radica en que permite ejecutar un modelo de 3B parámetros con una calidad cercana a la versión en bf16 pero con aproximadamente un 50 % menos de uso de memoria, lo que lo hace adecuado para equipos con 8-16 GB de memoria unificada. La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo está post-entrenado sobre la base Granite 4.1, con un enfoque específico para escenarios empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 3B (modelo base); 1.029.450.240 según safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8 (8-bit, group-size 64); también existen variantes bf16 y q4 en otros repos |
| Idiomas soportados | Multilingüe (idiomas no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer denso decoder-only, post-entrenado a partir de los pesos de Granite 4.1. Según la documentación de IBM, el entrenamiento se diseñó para escenarios empresariales, incorporando evaluaciones de gobernanza, riesgo y cumplimiento (GRC), así como procesos de limpieza de datos y revisión de calidad documental. No se han proporcionado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset. La variante MLX aquí presentada es una conversión directa de los pesos originales, sin modificaciones en la arquitectura ni en los pesos, únicamente cuantizados a 8 bits.

## Capacidades

- Generación de texto y razonamiento multilingüe.
- Soporte para tareas de codificación en diversos lenguajes.
- Recuperación aumentada por generación (RAG).
- Uso de herramientas (tool calling) y generación de JSON estructurado.
- Modo de razonamiento integrado (thinking mode) con control de esfuerzo (`low`/`high`).
- Compatible con el chat template de Granite 4.2, que permite activar o desactivar el bloque de razonamiento.

## Casos de uso

- Asistente de atención al cliente multilingüe: el modelo puede gestionar conversaciones en varios idiomas y, gracias al thinking mode, razonar sobre consultas complejas antes de responder. Su tamaño compacto permite desplegarlo en servidores modestos o en equipos Apple Silicon.
- Generación de código en entornos de desarrollo: con soporte para tool calling, puede integrarse en pipelines de CI/CD para autocompletar o revisar fragmentos de código, o como asistente en IDEs.
- Extracción de datos estructurados: su capacidad para generar JSON estructurado lo hace útil para convertir texto no estructurado (correos, informes) en formatos procesables por sistemas downstream.
- Chatbots empresariales con RAG: al combinar el modelo con un índice vectorial, se pueden construir asistentes que respondan preguntas sobre documentación interna, aprovechando el contexto largo (aunque la longitud exacta no está especificada).
- Análisis de sentimiento y clasificación de texto: su naturaleza multilingüe permite aplicarlo a tareas de moderación de contenido o análisis de opiniones en varios idiomas.
- Prototipado rápido de agentes conversacionales: gracias a su licencia permisiva y a la facilidad de ejecución en Apple Silicon, es adecuado para experimentar con arquitecturas de agentes antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Para obtener datos de rendimiento, se recomienda consultar la documentación oficial de IBM Granite 4.2 o ejecutar evaluaciones propias.

## Requisitos de hardware

- Hardware: Apple Silicon (M1/M2/M3/M4 o posterior) con memoria unificada.
- VRAM estimada: al ser una cuantización q8, los pesos ocupan aproximadamente 1 GB (3B parámetros × 1 byte), más overhead de activaciones y KV cache. Se estima que 8 GB de memoria unificada son suficientes para inferencia básica, aunque no se especifica oficialmente.
- GPU recomendada: no aplica GPU discreta; se usa la GPU integrada de Apple Silicon.
- Opciones de despliegue: mlx-lm (Python), con soporte para generación y fine-tuning. También se puede usar `uvx` para ejecución efímera.
- Latencia y throughput: no disponibles. Dependen del chip concreto (M1 vs M4) y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.2 3B (este, q8 MLX) | 3B | No disponible | Apache 2.0 | MLX (safetensors) | Optimizado para Apple Silicon, thinking mode |
| Granite 4.2 8B (MLX) | 8B | No disponible | Apache 2.0 | MLX | Mayor capacidad, requiere más memoria |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 | GGUF, MLX, etc. | Alternativa popular, sin thinking mode integrado |
| Qwen 2.5 3B | 3B | 32K | Apache 2.0 | GGUF, MLX, etc. | Buen rendimiento en código y multilingüe |

La comparativa es cualitativa, ya que no se dispone de datos de benchmarks para esta variante concreta. La principal diferencia frente a Llama 3.2 y Qwen 2.5 es el thinking mode integrado y el enfoque empresarial de Granite 4.2.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de seguridad específicas para esta variante cuantizada; se heredan las del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda validar las salidas en entornos de producción.
- La longitud de contexto no está documentada en la información disponible, por lo que se desconoce el límite exacto para tareas de RAG o conversaciones largas.
- La cuantización q8 puede introducir una ligera degradación de calidad frente a bf16, aunque en general es mínima.
- El modelo está pensado para Apple Silicon; no se proporcionan instrucciones para ejecutarlo en GPUs NVIDIA o AMD sin conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las políticas de IBM sobre el uso de la marca Granite.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrutkows/granite-4.2-3b-q8-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- mlx-lm (herramienta de conversión e inferencia): https://github.com/ml-explore/mlx-examples/tree/main/llms
