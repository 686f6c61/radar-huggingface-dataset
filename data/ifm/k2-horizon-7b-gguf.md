# IFM/K2-Horizon-7B-GGUF

## Resumen
K2-Horizon-7B es un modelo de lenguaje denso, decoder-only, desarrollado por IFM como miembro intermedio de la familia K2-Horizon. Con 8.999.178.240 parametros reales (etiquetado comercialmente como "7B"), se distribuye en formato GGUF para su uso con `llama.cpp` y deriva del checkpoint base `IFM/K2-Horizon-7B`. Su rasgo diferencial es una ventana de contexto nativa de 524.288 tokens (512K) fijada desde las etapas de midtraining, algo poco habitual en modelos de esta escala.

El modelo se presenta como un baseline denso evaluado en tareas agénticas, de código, contexto largo y razonamiento. IFM publica además los checkpoints intermedios del entrenamiento, la receta y los datos de preentrenamiento y midtraining, lo que lo convierte en un artefacto interesante tanto para despliegue en producción como para investigación sobre dinámica de entrenamiento.

La relevancia actual reside en la combinación de licencia Apache 2.0, contexto de 512K y un rendimiento declarado en SWE-bench Verified (70,6) muy por encima de las referencias de su categoría que aparecen en la model card. La distribución GGUF con múltiples cuantizaciones facilita el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (arquitectura "K2 Horizon" con soporte propio en llama.cpp) |
| Parametros totales | 8.999.178.240 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde midtraining |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales en el repo base `IFM/K2-Horizon-7B` |

## Arquitectura y entrenamiento
K2-Horizon-7B es un transformer denso decoder-only, no un modelo MoE ni híbrido SSM. La model card no detalla el número exacto de capas, dimensión oculta ni configuración de atención; sí confirma que la ventana de 524.288 tokens es nativa y se establece a partir de las etapas de midtraining, lo que implica una fase de entrenamiento específica para extender contexto más allá de la longitud inicial.

El entrenamiento se apoya en dos conjuntos de datos publicados: `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`. No se especifica en la información disponible el número total de tokens, la composición del dataset ni si hubo fases de RLHF, DPO o similares. La familia se distribuye con checkpoints intermedios para estudiar la evolución de capacidades a lo largo del entrenamiento, y tanto la receta como el código de entrenamiento y los recursos de evaluación son públicos según el autor.

## Capacidades
- Generación de texto conversacional en inglés, con plantilla de chat compatible con `llama.cpp` incluida en los ficheros GGUF.
- Razonamiento matemático de competición: evaluado en HMMT Feb 2026 con 73,3.
- Ingeniería de software y resolución de issues: evaluado en SWE-bench Verified con 70,6.
- Procesamiento de contexto largo: ventana nativa de 512K tokens, adecuada para documentos extensos, repositorios completos o historiales de conversación prolongados.
- Capacidades agénticas y de razonamiento multi-paso, según la evaluación declarada en benchmarks agénticos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso
- Análisis de repositorios completos: con 512K tokens de contexto, el modelo puede ingerir varios ficheros de código y su historial de cambios en una sola pasada para tareas de revisión, refactorización o explicación de arquitectura.
- Resolución automática de issues en CI/CD: su resultado en SWE-bench Verified (70,6) lo hace candidato para pipelines que reciben un issue, localizan el código relevante y proponen un parche, con revisión humana posterior.
- Asistencia matemática y tutoría técnica: el 73,3 en HMMT Feb 2026 indica capacidad para resolver problemas de competición, útil en herramientas de verificación de demostraciones o generación de ejercicios resueltos.
- Agentes de navegación y automatización multi-paso: la ventana larga permite mantener el estado de una tarea agéntica extensa sin truncar el historial de observaciones y acciones.
- Procesamiento de documentación legal o técnica extensa: resumen, extracción de cláusulas y preguntas sobre contratos o manuales de cientos de páginas en una única ventana.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPU de gama alta para consumidores o en CPU con `llama.cpp`, habilitando prototipos locales sin infraestructura cloud.
- Investigación sobre entrenamiento: los checkpoints intermedios y la receta pública permiten estudiar la aparición de capacidades y el efecto de la extensión de contexto durante el midtraining.

## Benchmarks y rendimiento

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 (matemáticas) | 73,3 | 63,1 | 65,7 | 66,5 |
| SWE-bench Verified (código) | 70,6 | 30,6 | no disponible | 47,7 |

Los datos proceden de la tabla publicada en la model card del repositorio GGUF. La información disponible se interrumpe en la fila de SWE-bench Verified para la referencia Qwen3.5-9B y no incluye el resto de benchmarks agénticos y de contexto largo mencionados en el gráfico del autor; no se han transcrito cifras adicionales para no inferir valores no publicados.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5,5-6 GB en Q4_K_M, 6,5-7 GB en Q5_K_M, 9,5-10 GB en Q8_0 y unos 18 GB en BF16, incluyendo overhead de contexto (el contexto de 512K requiere KV cache adicional considerable según la configuración).
- GPU recomendadas: RTX 4090 (24 GB) para BF16 o Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q8_0 o Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones Q4 y Q5 con 8 GB o más de VRAM; BF16 requiere 24 GB o reparto entre GPU y CPU.
- Opciones de despliegue: `llama.cpp` (requiere versión con soporte de arquitectura K2 Horizon, integrado en mainline desde la release b11454), Ollama y otros frontends basados en llama.cpp. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | HMMT Feb 2026 | SWE-bench Verified |
|---|---|---|---|---|---|
| K2-Horizon-7B | 8,99B (denso) | 512K | Apache 2.0 | 73,3 | 70,6 |
| Gemma 4-12B | 12B (no confirmado) | no disponible | no disponible | 63,1 | 30,6 |
| Qwen3.5-9B | 9B (no confirmado) | no disponible | no disponible | 65,7 | no disponible |
| Granite 4.2-8B | 8B (no confirmado) | no disponible | no disponible | 66,5 | 47,7 |

Las especificaciones de contexto y licencia de los modelos de referencia no aparecen en la información proporcionada y se marcan como no disponibles. En los dos benchmarks publicados, K2-Horizon-7B supera a las tres referencias, con una diferencia especialmente amplia en SWE-bench Verified frente a Gemma 4-12B y Granite 4.2-8B.

## Limitaciones y advertencias
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al ser un modelo entrenado principalmente con datos en inglés, cabe esperar sesgos culturales y lingüísticos propios de ese corpus.
- Alucinación: no hay datos publicados de tasas de alucinación ni de calibración; en tareas de código y matemáticas conviene verificar las salidas.
- Contexto largo: aunque la ventana es de 512K tokens, no se documenta el rendimiento en tareas de recuperación en el extremo de la ventana (needle-in-a-haystack); el coste de KV cache crece de forma significativa con la longitud.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar los términos de los datasets de entrenamiento publicados.
- Dependencia de versión: los GGUF requieren `llama.cpp` con soporte de la arquitectura K2 Horizon (mainline desde b11454); versiones anteriores fallarán al cargar el modelo.
- Tool calling: no confirmado; si se necesita en producción, debe validarse empíricamente antes de integrarlo en agentes.

## Enlaces
- Repositorio GGUF: https://huggingface.co/IFM/K2-Horizon-7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Release de llama.cpp con soporte K2 Horizon (b11454): https://github.com/ggml-org/llama.cpp/releases?page=5#release-b11454
