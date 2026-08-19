# FiditeNemini/Unhinged-Qwen3.8-27B-MLX-MXFP8-HERETIC

## Resumen

El modelo **FiditeNemini/Unhinged-Qwen3.8-27B-MLX-MXFP8-HERETIC** es una adaptación cuantizada en formato MLX (Apple Silicon) del modelo **Qwen3.8-27B-heretic-ara**, una versión "abliterada" del Qwen3.8-27B original de Alibaba. El término *heretic* se refiere a la eliminación de las restricciones de seguridad y censura del modelo base, mientras que *ara* indica que el proceso de abliteración se ha realizado de forma reproducible. El autor, FiditeNemini, ha convertido el modelo a MLX con cuantización MXFP8 (8 bits) para poder ejecutarlo eficientemente en hardware de Apple.

El modelo base Qwen3.8-27B es un LLM denso de 27 000 millones de parámetros, de propósito general, con capacidades de visión y lenguaje, contexto nativo de 262 000 tokens y licencia Apache 2.0. Esta versión concreta hereda todas esas características técnicas, pero se diferencia por su proceso de "decensorizado", que elimina los mecanismos de rechazo de contenido, lo que la hace interesante para investigadores que estudian la alineación o para aplicaciones creativas sin restricciones, aunque con los riesgos asociados.

La relevancia de esta ficha radica en que combina dos tendencias actuales: la creciente demanda de modelos abiertos y de alto rendimiento ejecutables en hardware local (gracias a la cuantización MLX) y la necesidad de entender las implicaciones técnicas y éticas de los modelos abliterados. Aunque el repositorio tiene cero descargas y ningún like, su existencia refleja un ecosistema activo de adaptaciones no oficiales sobre los lanzamientos de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + lenguaje) |
| Parametros totales | 8 027 131 120 (según safetensors; el nombre sugiere 27B, posible discrepancia) |
| Parametros activos | No disponible (modelo denso) |
| Longitud de contexto | 262 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | MXFP8 (8 bits) en formato MLX |
| Idiomas soportados | No disponible (se asume multilingüe como Qwen, pero sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** es un transformer denso de 27B parámetros con arquitectura similar a la serie Qwen3.5, incorporando atención de visión y texto, y entrenado con una combinación de datos de texto e imagen. El proceso de entrenamiento del modelo original incluye fases de preentrenamiento masivo, ajuste fino supervisado y alineación mediante RLHF (Reinforcement Learning from Human Feedback) y DPO (Direct Preference Optimization). En el caso de la versión *heretic*, se aplica una técnica de **abliteración** que consiste en identificar y eliminar las direcciones de activación responsables de los comportamientos de rechazo de seguridad, obteniendo así un modelo "desensibilizado". El repositorio actual no aporta detalles sobre el proceso de cuantización MXFP8, pero se trata de una conversión estándar a MLX para ejecución en Apple Silicon. No se dispone de información sobre los datos de entrenamiento específicos de esta variante ni sobre el número de tokens utilizados.

## Capacidades

- **Generación de texto multimodal**: el modelo acepta tanto entradas de texto como de imagen (imagen-texto a texto), pudiendo describir imágenes, responder preguntas visuales y generar contenido a partir de prompts mixtos.
- **Razonamiento avanzado**: al heredar las capacidades de Qwen3.8-27B, muestra competencias en razonamiento matemático, lógico y de sentido común, aunque el proceso de abliteración puede alterar el comportamiento en escenarios de seguridad.
- **Generación de código**: soporta tareas de programación en múltiples lenguajes, con capacidad para explicar, depurar y completar código.
- **Tool calling / function calling**: el modelo base soporta invocación de herramientas y API, lo que permite integrarlo en agentes y flujos de automatización.
- **Contexto largo**: con 262K tokens de contexto, puede procesar documentos extensos, libros completos o historiales de conversación largos.
- **Multilingüe**: aunque no se confirma para esta variante, el modelo original de Qwen es multilingüe (incluyendo español, inglés, chino, etc.).
- **Capacidad "uncensored"**: al estar abliterado, no rechaza solicitudes que el modelo original consideraría inapropiadas o peligrosas, lo que habilita casos de uso creativos o de investigación que requieren respuestas sin filtros.

## Casos de uso

- **Investigación en alineación de modelos**: los investigadores pueden estudiar cómo la abliteración afecta a la capacidad, el sesgo y la seguridad, comparando este modelo con su versión original.
- **Generación de contenido creativo sin restricciones**: escritores y artistas pueden usarlo para explorar temas controvertidos o estilos que los modelos censurados rechazan, siempre bajo responsabilidad del usuario.
- **Asistente personal con contexto extenso**: gracias a los 262K tokens de contexto, se puede usar como asistente que recuerda toda una conversación de horas o analiza documentos técnicos completos.
- **Análisis de imágenes médicas o técnicas**: al ser multimodal, puede describir y responder preguntas sobre imágenes médicas, diagramas o fotografías, útil para investigación no clínica.
- **Generación de código en entornos de desarrollo**: se puede integrar en IDEs o pipelines de CI/CD para generar tests, documentación o refactorización, aprovechando su capacidad de tool calling.
- **Chatbots de rol o simulación**: su naturaleza "desensibilizada" permite crear personajes con respuestas sin restricciones, útil para juegos o simulaciones de diálogo.
- **Procesamiento de corpus legales o históricos**: con su contexto largo, puede resumir y extraer información de libros o documentos legales antiguos, aunque se debe validar la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante concreta. Sin embargo, el modelo base Qwen3.8-27B reporta en su lanzamiento (según fuentes externas) los siguientes resultados:

| Benchmark | Puntuación |
|---|---|
| DeepSWE (razonamiento de software) | 42.2 |
| Terminal Bench (tareas de terminal) | 73.0 |
| OSWorld (interacción con sistemas) | 84.3 |

Estos datos son del modelo original sin abliteración, por lo que no garantizan el mismo rendimiento en la versión heretic. No se dispone de comparaciones directas con otros modelos abliterados.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 28.7 GB. Al estar cuantizado en MXFP8 (8 bits), el modelo en memoria requerirá aproximadamente 8 GB de VRAM (27B × 8 bits = 27 GB / 8 ≈ 3.4 GB, más overhead de activaciones). En la práctica, para ejecución en MLX, se recomienda un Mac con al menos 16 GB de memoria unificada.
- **GPU recomendadas**: Apple Silicon (M1 Pro, M2 Pro/Max, M3 Pro/Max, M4, etc.) con al menos 16 GB de memoria unificada. En GPUs de NVIDIA, el formato MLX no es directamente ejecutable; se necesitaría convertir a otro formato (por ejemplo, GGUF).
- **Ejecución en consumer GPU**: no es compatible con tarjetas gráficas NVIDIA o AMD, ya que MLX es específico para Apple. Para otras plataformas se debe convertir a GGUF o FP16.
- **Opciones de despliegue**: MLX (con la librería `mlx`), se puede usar con herramientas como `mlx_lm` o `mlx_lm.server`. No se menciona soporte para vLLM, TGI u Ollama en este repositorio.
- **Latencia y throughput**: no disponible; depende del modelo de Apple Silicon. En general, un 27B cuantizado a 8 bits en un M3 Max puede generar entre 10 y 20 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Unhinged-Qwen3.8-27B-MLX-MXFP8** | 8.0B (discrepancia) | 262K | Apache 2.0 | MLX (MXFP8) | Abliterado, para Apple Silicon |
| **Qwen3.8-27B (original)** | 27B | 262K | Apache 2.0 | Safetensors/GGUF | Modelo base, con restricciones de seguridad |
| **Qwen3.8-27B GGUF Q4_K_M** | 27B | 262K | Apache 2.0 | GGUF | Cuantización para CPU/GPU, sin abliteración |

La comparativa muestra que la principal diferencia es la cuantización y el proceso de abliteración, que afecta al comportamiento de seguridad y al formato de despliegue. No hay otros modelos abliterados de Qwen3.8-27B en formato MLX con los que comparar directamente.

## Limitaciones y advertencias

- **Riesgo de alucinación**: al ser un modelo abliterado, puede generar contenido falso o inventado sin las advertencias habituales de los modelos alineados, lo que es especialmente peligroso en entornos de producción.
- **Sesgos**: la abliteración no elimina los sesgos del modelo original, que pueden amplificarse al no tener restricciones de seguridad.
- **Contenido inapropiado**: el modelo puede generar texto ofensivo, violento, ilegal o sexualmente explícito. Su uso debe ser exclusivamente para fines de investigación o creativos, no para entornos públicos sin moderación.
- **Discrepancia de parámetros**: el archivo safetensors muestra 8.027 millones de parámetros, mientras que el nombre del modelo indica 27B. Esto puede deberse a un error de conversión o a un repositorio mal configurado; no se recomienda confiar en el número sin verificar la integridad del modelo.
- **Licencia**: aunque la licencia es Apache 2.0, el proceso de abliteración puede violar los términos de uso del modelo original (si los hubiera), aunque Qwen3.8-27B tiene Apache 2.0, por lo que es legal modificar y redistribuir.
- **Soporte limitado**: al ser un repositorio con 0 descargas y 0 likes, no hay garantía de mantenimiento ni de corrección de errores.
- **Formato exclusivo**: MLX solo funciona en Apple Silicon; no es portable a otros sistemas sin conversión, lo que puede introducir pérdida de calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FiditeNemini/Unhinged-Qwen3.8-27B-MLX-MXFP8-HERETIC
- Modelo base (heretic-org): https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara (no verificado)
- Guía de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Análisis de Simon Willison sobre Qwen 3.8 27B: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Repositorio GitHub de una versión GGUF de Qwen3.8-27B "uncensored": https://github.com/Wassimyounes01/qwen38-uncensored
- Especificaciones y benchmarks de Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Información general de Qwen3.8: https://openlm.ai/qwen3.8/
