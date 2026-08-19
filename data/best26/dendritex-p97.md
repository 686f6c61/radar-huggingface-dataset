# best26/dendritex-p97

## Resumen

El repositorio `best26/dendritex-p97` aloja los pesos del modelo Qwen3.6-35B-A3B, desarrollado por Alibaba Qwen y publicado en agosto de 2026. Se trata de un modelo de lenguaje causal con encoder de visión (pipeline `image-text-to-text`), arquitectura Mixture of Experts (MoE) híbrida con 35 000 millones de parámetros totales y 3 000 millones activos por token. Está diseñado para tareas de coding agéntico, razonamiento multi-paso y procesamiento de imágenes junto con texto.

La relevancia de este lanzamiento radica en su enfoque en estabilidad y utilidad real: introduce mejoras en flujos de trabajo de desarrollo frontend, razonamiento a nivel de repositorio y una opción para preservar el contexto de razonamiento histórico, lo que reduce la sobrecarga en iteraciones de desarrollo. Con una ventana de contexto nativa de 262 144 tokens (extensible hasta 1 010 000), se posiciona como una opción competitiva frente a modelos como Qwen3.5-35B-A3B o Gemma4-31B en tareas de ingeniería de software asistida por IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet (linear attention) + Gated Attention + Mixture of Experts |
| Parametros totales | 35 000 millones |
| Parametros activos | 3 000 millones |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 010 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (benchmark SWE-bench Multilingual sugiere capacidades multilingües) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) en un patrón repetido: cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de un MoE, y luego 1 sub-bloque de Gated Attention seguido de otro MoE. En total hay 40 capas. El MoE cuenta con 256 expertos, de los cuales se activan 8 más 1 experto compartido, con dimensión intermedia de 512. La dimensión oculta es 2048 y el embedding de tokens tiene tamaño 248 320 (padded). Se entrenó con un esquema de multi-step prediction (MTP) durante el post-entrenamiento.

No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición del dataset. El modelo fue pre-entrenado y post-entrenado, y se destaca la inclusión de un mecanismo de "Thinking Preservation" que permite retener el contexto de razonamiento de mensajes históricos, útil para desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento multi-paso con soporte de modo "thinking" (razonamiento encubierto).
- Coding agéntico: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio.
- Comprensión de imágenes junto con texto (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Soporte de tool calling y function calling (implícito en su uso como agente de codificación, aunque no se documenta explícitamente).
- Capacidades multilingües (evidenciadas por SWE-bench Multilingual, aunque no se especifican los idiomas concretos).
- Preservación de contexto de razonamiento histórico para reducir overhead en iteraciones de desarrollo.
- Compatibilidad con frameworks de inferencia estándar: Transformers, vLLM, SGLang, KTransformers.

## Casos de uso

- **Resolución de issues en repositorios**: el modelo alcanza 73.4 en SWE-bench Verified, por lo que puede usarse como agente autónomo para identificar, proponer y aplicar parches en código real.
- **Asistente de programación con contexto largo**: su ventana de 262K tokens permite mantener conversaciones extensas sobre un codebase completo, ideal para refactorizaciones o revisión de código.
- **Generación de código frontend**: la mejora específica en flujos de trabajo frontend lo hace adecuado para generar componentes UI, estilos y lógica de interacción a partir de descripciones en lenguaje natural.
- **Automatización de tareas de terminal**: con Terminal-Bench 2.0 como benchmark, puede ejecutar comandos, interpretar salidas y tomar decisiones en entornos shell.
- **Análisis de documentación técnica con imágenes**: al ser multimodal, puede procesar diagramas, capturas de pantalla o esquemas junto con texto para tareas como documentación automática o generación de informes.
- **Desarrollo iterativo con preservación de razonamiento**: la opción de mantener el contexto de razonamiento histórico es útil en sesiones largas de depuración o desarrollo guiado por IA.

## Benchmarks y rendimiento

La model card proporciona resultados parciales en tareas de coding agéntico. La tabla se presenta a continuación con los valores disponibles:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | **73.4** |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | **67.2** |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | **49.5** |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados para benchmarks de lenguaje general (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al tener 35B parámetros totales, en BF16 se requieren aproximadamente 70 GB de VRAM. Con cuantización de 4 bits, se reduce a unos 17-18 GB, lo que permitiría ejecutarlo en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 5090 (32 GB). Sin cuantización, se necesitan GPUs profesionales como A100 (80 GB) o H100.
- **GPU recomendadas**: A100 80 GB, H100 80 GB para inferencia sin cuantizar; RTX 4090 o RTX 5090 con cuantización 4-bit.
- **Despliegue**: compatible con vLLM, SGLang, KTransformers y Hugging Face Transformers. También se puede usar con llama.cpp si se generan archivos GGUF (no proporcionados en el repositorio).
- **Latencia y throughput**: no se dispone de datos oficiales. Al ser un MoE con solo 3B parámetros activos, la latencia por token debería ser significativamente menor que la de un modelo denso de 35B, pero depende del hardware y del framework.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35BA3B (este) | 35B | 3B | 262K | Apache 2.0 | 73.4 |
| Qwen3.5-35BA3B | 35B | 3B | 262K | Apache 2.0 | 70.0 |
| Qwen3.5-27B | 27B | 27B (denso) | 262K | Apache 2.0 | 75.0 |
| Gemma4-31B | 31B | 31B (denso) | 128K | Gemma License | 52.0 |
| Gemma4-26BA4B | 26B | 4B | 128K | Gemma License | 17.4 |

El modelo supera a su predecesor directo (Qwen3.5-35BA3B) en SWE-bench Verified y Multilingual, aunque queda ligeramente por debajo del denso Qwen3.5-27B en Verified. Frente a las Gemma4, ofrece mejor rendimiento en coding agéntico con una licencia más permisiva (Apache 2.0).

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas en la documentación proporcionada.
- El modelo está orientado a tareas de coding y razonamiento; su rendimiento en otros dominios (escritura creativa, conversación general) no ha sido evaluado en los benchmarks publicados.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, el modelo se distribuye tal cual, sin garantías de precisión o seguridad en entornos de producción.
- La ventana de contexto extensible hasta 1M tokens puede degradar el rendimiento si no se gestiona correctamente la memoria; se recomienda validar el comportamiento en casos de uso reales.
- El repositorio `best26/dendritex-p97` es una copia de los pesos oficiales; se recomienda verificar la integridad de los archivos y consultar la documentación original de Qwen para obtener detalles adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/best26/dendritex-p97
- Model card original de Qwen3.6-35B-A3B (referencia): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Perfil del autor best26: https://huggingface.co/best26/models
