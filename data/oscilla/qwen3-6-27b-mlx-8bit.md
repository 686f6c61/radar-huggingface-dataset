# Oscilla/Qwen3.6-27B-mlx-8Bit

## Resumen

Oscilla/Qwen3.6-27B-mlx-8Bit es una conversión al formato MLX (Machine Learning framework de Apple) del modelo Qwen3.6-27B de Alibaba, cuantizado a 8 bits. El modelo original es un LLM multimodal de 27.000 millones de parámetros con arquitectura híbrida que combina capas de atención con gated DeltaNet, e incorpora un codificador de visión para tareas de imagen-texto. Esta conversión, realizada por el usuario Oscilla con mlx-lm versión 0.31.2, permite ejecutar el modelo de forma eficiente en hardware Apple Silicon, manteniendo la ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000 tokens.

La relevancia de esta ficha radica en que Qwen3.6-27B ha demostrado un rendimiento destacado en tareas de razonamiento y código (77,2% en SWE-bench Verified, según fuentes externas), superando incluso a modelos mucho más grandes. Al ofrecer una versión MLX cuantizada, se facilita su despliegue en entornos de desarrollo y producción sobre Mac, sin necesidad de GPUs dedicadas de alta gama. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con gated DeltaNet y gated attention (64 capas) + vision encoder |
| Parametros totales | 27B (nominal, según Qwen/Qwen3.6-27B); el archivo safetensors de esta conversión reporta 7.566.401.024 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a ~1.010.000 |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | no disponible (el modelo base de Qwen suele ser multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura transformer híbrida que intercala capas de atención tradicional (gated attention) con capas basadas en DeltaNet, un mecanismo de atención lineal que reduce el coste computacional en contextos largos. Dispone de 64 capas y un codificador de visión que permite procesar imágenes junto con texto. La conversión MLX mantiene la misma topología pero almacena los pesos en precisión de 8 bits, lo que reduce el uso de memoria a aproximadamente 28 GB en disco (según el tamaño del repositorio). No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) en los datos proporcionados.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de matemáticas, lógica y análisis.
- Generación de código y resolución de problemas de programación (SWE-bench Verified 77,2% según fuentes externas).
- Procesamiento multimodal imagen-texto: puede recibir imágenes como entrada y responder preguntas sobre ellas (pipeline image-text-to-text).
- Ventana de contexto muy amplia (262K tokens nativos), adecuada para documentos extensos, conversaciones de muchos turnos o análisis de repositorios de código completos.
- Soporte de tool calling y function calling probablemente disponible, aunque no se confirma explícitamente en la documentación de esta conversión.
- Capacidades multilingües no especificadas, pero el modelo base de Qwen suele cubrir numerosos idiomas.

## Casos de uso

- Análisis de documentos extensos: con 262K tokens de contexto, puede procesar libros técnicos, informes financieros o contratos legales completos en una sola pasada, extrayendo información clave y resumiendo secciones.
- Asistente de programación en IDE: integrado como copiloto, puede sugerir código, explicar fragmentos existentes y refactorizar funciones, aprovechando su alto rendimiento en SWE-bench.
- Revisión de código automatizada: en pipelines de CI/CD, el modelo puede analizar pull requests, detectar bugs y proponer correcciones, gracias a su capacidad de razonamiento sobre código y contexto largo.
- Atención al cliente multimodal: combinando visión y texto, puede interpretar capturas de pantalla de errores o imágenes de productos y generar respuestas de soporte contextualizadas.
- Búsqueda semántica en bases de conocimiento: al mantener conversaciones multi-turno con contexto largo, puede actuar como agente conversacional que consulta documentos y responde con referencias.
- Generación de informes a partir de datos visuales: dado un gráfico o tabla en imagen, el modelo puede describir tendencias y generar un resumen ejecutivo en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX. Sin embargo, fuentes externas sobre el modelo base Qwen3.6-27B reportan los siguientes datos (no verificados de forma independiente):

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 77,2% |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

Estos valores deben tomarse como referencia orientativa del modelo original, no de la versión cuantizada, que puede presentar ligeras degradaciones.

## Requisitos de hardware

- La cuantización 8-bit MLX reduce el uso de memoria a aproximadamente 28 GB, por lo que se recomienda un Mac con 32 GB de RAM unificada o superior.
- Compatible con cualquier Mac con chip Apple Silicon (M1, M2, M3, M4 y sucesores); los modelos con mayor memoria unificada (64 GB o más) permitirán ejecutar el modelo con mayor holgura y velocidad.
- No requiere GPU NVIDIA; el framework MLX aprovecha la GPU integrada y la Neural Engine de Apple.
- Despliegue mediante `mlx-lm` (pip install mlx-lm) para carga y generación, o mediante servidores compatibles con MLX como MLX-LM Server.
- Latencia y throughput estimados: no disponibles para esta conversión específica; dependerán del chip y de la memoria disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen3.6-27B-mlx-8Bit | 27B | 262K | Apache 2.0 | MLX 8-bit | Conversión de Qwen3.6-27B |
| Qwen/Qwen3.6-27B | 27B | 262K | Apache 2.0 | safetensors (BF16) | Modelo original, requiere más VRAM |
| unsloth/Qwen3.6-27B-MLX-8bit | 27B | 262K | Apache 2.0 | MLX 8-bit | Conversión alternativa de unsloth |
| mlx-community/Qwen3.6-27B-8bit | 27B | 262K | Apache 2.0 | MLX 8-bit | Otra conversión comunitaria |

Las tres conversiones MLX son funcionalmente equivalentes; la diferencia principal radica en el proceso de conversión y posibles optimizaciones adicionales.

## Limitaciones y advertencias

- La cuantización a 8 bits puede introducir una pequeña pérdida de precisión en tareas de razonamiento complejo o generación de código, aunque suele ser mínima.
- No se dispone de información sobre sesgos específicos del modelo; como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación en contextos de información factual no cubierta por los datos de entrenamiento; se recomienda verificar respuestas críticas.
- Aunque la ventana de contexto es amplia, el rendimiento puede degradarse al acercarse al límite máximo; se recomienda probar con el caso de uso real.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales; se recomienda revisar la licencia original de Qwen.
- Para producción, es necesario validar la latencia y el throughput en el hardware objetivo, ya que no se han publicado mediciones oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Qwen3.6-27B-mlx-8Bit
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Conversión alternativa (unsloth): https://huggingface.co/unsloth/Qwen3.6-27B-MLX-8bit
- Conversión alternativa (mlx-community): https://huggingface.co/mlx-community/Qwen3.6-27B-8bit
- Guía completa de Qwen 3.6-27B (con benchmarks): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
