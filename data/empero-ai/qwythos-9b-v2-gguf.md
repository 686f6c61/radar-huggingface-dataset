# empero-ai/Qwythos-9B-v2-GGUF

# Qwythos-9B-v2-GGUF

## Resumen

Qwythos-9B-v2 es un modelo de lenguaje multimodal de 8,95 mil millones de parámetros desarrollado por Empero AI, un laboratorio independiente de investigación con sede en Alemania. Se distribuye como cuantizaciones GGUF del modelo base `empero-ai/Qwythos-9B-v2` para su ejecución en llama.cpp, Ollama, LM Studio, jan y KoboldCpp. Es la segunda versión de la familia Qwythos, cuyo objetivo declarado es ofrecer razonamiento profundo chain-of-thought en un modelo compacto ejecutable en hardware de consumo.

La principal novedad de la v2 frente a la v1 es la eliminación del comportamiento de looping o degeneración que aparecía con decodificación greedy o temperaturas bajas, corregido mediante FTPO (Final-Token Preference Optimization). El modelo mantiene las características de la v1: arquitectura híbrida 3:1 de bloques Gated-DeltaNet (atención lineal tipo SSM) y atención completa, contexto de 1 millón de tokens mediante YaRN, capacidades multimodales heredadas de la torre de visión de Qwen3.5-9B y licencia Apache 2.0. Con más de 528.000 descargas en Hugging Face, es relevante por combinar razonamiento, tool use, visión y contexto largo en un tamaño que cabe en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida 3:1 Gated-DeltaNet (atención lineal SSM) + full attention |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (YaRN) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16; variantes MTP (Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16); mmproj de visión en BF16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); safetensors en el modelo base |

## Arquitectura y entrenamiento

Qwythos-9B-v2 emplea una arquitectura híbrida compuesta por una mezcla 3:1 de bloques Gated-DeltaNet, un mecanismo de atención lineal tipo SSM, y bloques de atención completa. Los tensores de estado del SSM son especialmente sensibles a la cuantización de baja precisión, por lo que el conversor mantiene `ssm_alpha`, `ssm_beta` y `ssm_out` en Q8_0 o Q6_K según la cuantización, y `ssm_a`, `ssm_conv1d`, `ssm_dt` y `ssm_norm` en F32, con un incremento de tamaño del 2-4 % frente a una cuantización plana.

El entrenamiento parte de una destilación de Claude Mythos 5, con un salto de +34 puntos en MMLU sobre el modelo base según el blog de Empero. La v2 añade una etapa de FTPO (Final-Token Preference Optimization): se identifica el token exacto que inicia un bucle de repetición y se entrena al modelo para preferir alternativas coherentes solo en esa posición, dejando intacto el resto de la distribución. Esto reduce el looping bajo decodificación greedy del 6,7 % al 0 %. La cabeza MTP (multi-token prediction) nativa se restaura en los archivos `-MTP-`, permitiendo decodificación especulativa con `--spec-type draft-mtp`. La torre de visión de Qwen3.5-9B permanece congelada durante el SFT y el ajuste FTPO, por lo que el comportamiento de imagen coincide con el de Qwen3.5-9B.

## Capacidades

- Razonamiento profundo chain-of-thought con verificación interna del propio trabajo.
- Generación de texto de propósito general en inglés.
- Multimodal: acepta entrada de imagen mediante el proyector de visión `mmproj-Qwythos-9B-v2-BF16.gguf` (codificador CLIP + proyector en BF16).
- Soporte de tool calling y function calling, con integración en flujos de agentes.
- Contexto largo de 1 millón de tokens mediante extensión YaRN.
- Decodificación especulativa MTP: los archivos `-MTP-` incorporan la cabeza de predicción multi-token a Q8_0, acelerando la generación con llama.cpp reciente.
- Comportamiento intencionadamente uncensored, sin restricciones de contenido adicionales al ajuste base.
- Plantilla de chat estándar de Qwen3.5, cargada automáticamente por los runtimes GGUF modernos.

## Casos de uso

- Atención al cliente automatizada: la ventana de 1 millón de tokens permite mantener conversaciones multi-turno muy largas y adjuntar el historial completo del cliente sin truncamiento, reduciendo la pérdida de contexto en incidencias complejas.
- Generación de código en producción: el soporte de tool calling permite integrar el modelo en pipelines de CI/CD para revisión de código, generación de tests o autocompletado, con la ventaja de que el razonamiento encadenado mejora la coherencia de bloques grandes.
- Análisis de documentos extensos: con contexto de 1M tokens puede procesar libros técnicos, expedientes legales o repositorios completos en una sola pasada, resumiendo y extrayendo información sin necesidad de chunking.
- Agentes autónomos con herramientas: su capacidad de function calling y razonamiento multi-paso lo hace adecuado como núcleo de agentes que consultan APIs, ejecutan búsquedas y toman decisiones secuenciales.
- Investigación científica y educativa: el ejemplo oficial de la model card muestra su uso para explicar mecanismos bioquímicos complejos (inhibición de acetilcolinesterasa por agentes organofosforados), útil como asistente de estudio o redacción técnica.
- Análisis de imágenes con contexto: al combinar la torre de visión de Qwen3.5-9B con el razonamiento profundo, puede describir diagramas, capturas de pantalla o figuras técnicas y razonar sobre su contenido.
- Prototipado de aplicaciones locales: al caber en GPUs de consumo y distribuirse bajo Apache 2.0, permite desplegar asistentes conversacionales privados sin dependencia de APIs externas.

## Benchmarks y rendimiento

La model card indica que las puntuaciones de MMLU, GSM8K, GPQA y ARC se mantienen o superan al nivel de Qwythos-9B v1, y el blog de Empero reporta un salto de +34 puntos en MMLU sobre el modelo base de la v1. No se han publicado en la información disponible las cifras numéricas exactas de cada benchmark.

| Benchmark | Resultado |
|---|---|
| MMLU | Mantenido o superior al base Qwythos (+34 puntos sobre el modelo base según el blog) |
| GSM8K | Mantenido o superior al base Qwythos |
| GPQA | Mantenido o superior al base Qwythos |
| ARC | Mantenido o superior al base Qwythos |
| Looping bajo greedy | 0 % (frente al 6,7 % de la v1) |

## Requisitos de hardware

- Q4_K_M: 5,34 GiB (5,74 GB) — recomendado por el autor como punto de partida; cabe en GPUs con 8 GB de VRAM.
- Q5_K_M: 6,08 GiB (6,52 GB) — requiere al menos 8 GB de VRAM con margen.
- Q6_K: 6,95 GiB (7,46 GB) — requiere 8-10 GB de VRAM.
- Q8_0: 8,87 GiB (9,53 GB) — requiere 12 GB de VRAM.
- BF16: 16,69 GiB (17,92 GB) — requiere 24 GB de VRAM.
- Variantes MTP: añaden ~0,16 GiB (5,50 GiB en Q4_K_M+MTP).
- Proyector de visión: 0,86 GiB adicionales, necesario solo para entrada de imágenes.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para las cuantizaciones altas; RTX 3060 12 GB o superiores para Q4_K_M/Q5_K_M; A100/H100 para BF16.
- Despliegue: llama.cpp, Ollama, LM Studio, jan, KoboldCpp y cualquier runtime GGUF. La decodificación especulativa MTP requiere una build reciente de llama.cpp con `--spec-type draft-mtp`.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la cuantización, la GPU y el uso de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwythos-9B-v2 | 8,95 B | 1M (YaRN) | Híbrida Gated-DeltaNet + attention | Sí (visión Qwen3.5) | Apache 2.0 |
| Qwythos-9B v1 | 8,95 B | 1M (YaRN) | Híbrida Gated-DeltaNet + attention | Sí (visión Qwen3.5) | Apache 2.0 |
| Qwen3.5-9B | ~9 B | 1M (YaRN) | Transformer (atención completa) | Sí | Apache 2.0 |

Frente a Qwythos-9B v1, la v2 elimina el looping bajo decodificación greedy, restaura la cabeza MTP y limpia el prompt de identidad, manteniendo el rendimiento en razonamiento. Frente a Qwen3.5-9B, del que hereda la torre de visión, Qwythos-9B-v2 añade una capa de razonamiento chain-of-thought destilada y un ajuste FTPO, a costa de una arquitectura híbrida más compleja de cuantizar. Los tres comparten licencia Apache 2.0 y contexto de 1M tokens.

## Limitaciones y advertencias

- Soporte de idiomas limitado al inglés; el rendimiento en otros idiomas no está garantizado.
- Modelo intencionadamente uncensored: puede generar contenido sensible, ofensivo o peligroso sin las salvaguardas de otros modelos; requiere moderación adicional en entornos de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; el razonamiento encadenado reduce errores lógicos pero no los elimina.
- El contexto de 1M tokens depende de la extensión YaRN, que puede degradar la calidad en ventanas muy largas; el autor recomienda `-c 16384` como valor práctico por defecto.
- La cuantización de los tensores SSM es delicada; aunque el conversor aplica precisión híbrida, las cuantizaciones muy bajas (no incluidas en esta release) podrían degradar el comportamiento del modelo.
- La decodificación especulativa MTP requiere builds recientes de llama.cpp; versiones antiguas ignorarán la cabeza MTP y cargarán los pesos como un bloque adicional.
- Aunque la licencia Apache 2.0 permite uso comercial, la condición uncensored puede suponer un riesgo de cumplimiento normativo en aplicaciones orientadas al público.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/empero-ai/Qwythos-9B-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/empero-ai/Qwythos-9B-v2
- Cuantizaciones imatrix de bartowski: https://huggingface.co/bartowski/empero-ai_Qwythos-9B-v2-GGUF
- Blog de lanzamiento de Qwythos-9B: https://empero.org/writing/qwythos-9b-release
- Sitio de Empero AI: https://empero.org/
- Espejo en ModelScope: https://www.modelscope.cn/models/empero-ai/Qwythos-9B-v2-GGUF
