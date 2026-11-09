# cassimahmedattia/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos del modelo GLM-5.3 de Z.ai (zai-org), publicada por el usuario cassimahmedattia bajo la marca dealignai. Se trata de un "crack" de dominio: una eliminación selectiva de rechazos (refusals) orientada específicamente a contenido de ciberseguridad ofensiva, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, análisis de malware y ataques a credenciales. No es un modelo nuevo entrenado desde cero, sino una edición directa de los tensores bf16 del checkpoint FP8 base, sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución.

El modelo base es la cuantización FP8 `JANGQ-AI/GLM-5.3-FP8`, derivada del GLM-5.3 original de 753.329.940.480 parámetros totales con arquitectura `glm_moe_dsa` (mezcla de expertos con atención dispersa al estilo DeepSeek), 78 capas y modalidad exclusivamente textual. Los expertos FP8 enrutados permanecen intactos; solo se editan los escritores residuales en bf16. Esto permite velocidad nativa de tensor cores FP8 en Hopper (H100/H200).

Su relevancia es doble: por un lado, demuestra que la modificación de pesos sobre checkpoints FP8 de gran escala es viable y preserva capacidades (MMLU logit-mode sube +1,07 pp respecto a la referencia bf16); por otro, plantea un caso de uso controvertido, con implicaciones legales y éticas evidentes en el ámbito de la seguridad ofensiva. La licencia declarada es MIT, aunque hereda las condiciones del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atención dispersa, 78 capas, text-only) |
| Parámetros totales | 753.329.940.480 (753B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificado en TP8 sobre 8× H200; contexto nativo de 1M no operativo en vLLM con `glm_moe_dsa` |
| Tipos de cuantización | FP8 (checkpoint nativo); no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 base: un transformer de mezcla de expertos con 78 capas y atención dispersa (DeepSeek Sparse Attention, DSA). El checkpoint es una cuantización FP8 de los pesos originales, con expertos enrutados en FP8 y escritores residuales en bf16. La modificación de este "crack" consiste en editar únicamente esos escritores residuales bf16 para reducir la probabilidad de rechazo en categorías de ciberseguridad; los expertos FP8 enrutados no se tocan, lo que explica la preservación de capacidades medida en MMLU.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base, más allá de lo que declare la documentación de zai-org/GLM-5.3. Tampoco se documenta el método exacto de edición de pesos (direcciones de ablación, capas intervenidas, magnitud del cambio). Sí se documenta que el resultado es una modificación genuina de pesos y no un ajuste de prompts. El modelo soporta decodificación especulativa MTP (multi-token prediction) en teoría, pero esta es no funcional en vLLM estándar; se reporta funcionamiento en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con una mejora de decodificación del 48% en prompts de código.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (`<think>`) controlable mediante `reasoning_effort`, que solo honra los valores `"low"` y `"high"`; cualquier otro valor cae a `max`.
- Conocimiento técnico de ciberseguridad ofensiva: desarrollo de exploits, red team, ingeniería inversa, evasión, phishing, ataque a credenciales y análisis de malware, con rechazos reducidos en estas categorías.
- Tool calling / function calling mediante `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Soporte de agentes y razonamiento multi-paso, con la advertencia de que en FP8 conviene usar `reasoning_effort="low"` en bucles de herramientas para evitar agotar el presupuesto de tokens dentro del bloque de razonamiento.
- Capacidades multilingües en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Procesamiento de contexto largo: 131.072 tokens operativos en TP8 sobre 8× H200 con `--max-num-seqs 24`.
- No es multimodal: el checkpoint es exclusivamente textual.

## Casos de uso

- Red teaming autorizado: el modelo puede generar hipótesis de ataque, cadenas de explotación y análisis de superficie de exposición en ejercicios contratados, gracias a la reducción de rechazos en categorías ofensivas y a su contexto de 131K tokens para ingerir informes y código de forma conjunta.
- Análisis de malware: descompilación asistida, explicación de comportamiento de binarios y extracción de indicadores de compromiso en pipelines de triaje, aprovechando el conocimiento técnico de bajo nivel del modelo base.
- Desarrollo de herramientas de pentest: generación y refinamiento de scripts de explotación, payloads de prueba y utilidades de enumeración en entornos de laboratorio aislados, con soporte de tool calling para integrarse en frameworks de automatización.
- Formación en seguridad ofensiva: creación de material didáctico y escenarios de laboratorio para cursos de hacking ético, con la salvedad de que el modelo no incluye salvaguardas de dominio y requiere supervisión humana.
- Automatización de auditorías de código: revisión de bases de código en busca de vulnerabilidades (inyección, deserialización insegura, gestión de secretos) con contexto largo suficiente para analizar módulos completos en una sola pasada.
- Ingeniería inversa de protocolos y firmware: asistencia en la reconstrucción de formatos binarios y protocolos propietarios, un caso donde el conocimiento técnico sin filtros resulta operativamente útil.
- Investigación sobre alineación y seguridad: estudio empírico de cómo la edición de pesos afecta a la distribución de rechazos, con métricas publicadas de HarmBench-320 que permiten comparar superficies de compliance.

## Benchmarks y rendimiento

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (logit-mode, 1026 preguntas) | 85,58% (referencia bf16 previa) | 86,65% (889/1026) | +1,07 pp |
| HarmBench-320, no-copyright (240 conductas), effort `off` | no disponible | 81,7% TRUE_COMPLY; 4 SOFT_REFUSE; 0 HARD_REFUSE | no disponible |
| HarmBench-320, no-copyright, effort `low` | no disponible | 84,2% TRUE_COMPLY; 4 SOFT_REFUSE; 1 HARD_REFUSE | no disponible |
| HarmBench-320, no-copyright, effort `max` | no disponible | 80,0% TRUE_COMPLY; 3 SOFT_REFUSE; 0 HARD_REFUSE | no disponible |
| HarmBench-320 completo (320 conductas), effort `off` | no disponible | 63,4% TRUE_COMPLY; 18,1% SOFT_REFUSE | no disponible |
| HarmBench-320 completo, effort `low` | no disponible | 69,7% TRUE_COMPLY; 16,3% SOFT_REFUSE | no disponible |
| HarmBench-320 completo, effort `max` | no disponible | 64,1% TRUE_COMPLY; 15,9% SOFT_REFUSE | no disponible |

No se han publicado resultados de MMLU-Pro, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La línea base FP8 directa está pendiente de confirmación según la propia model card.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 755,7 GB en safetensors FP8; la inferencia requiere agregar caché KV y overhead, por lo que se necesitan al menos 8 GPUs de 80 GB para el despliegue en TP8.
- Configuración de referencia probada: 8× H200 (TP8) con `--gpu-memory-utilization 0.90`, `--max-num-seqs 24` y `--max-model-len 131072`, con un margen de concurrencia de aproximadamente 2,98×.
- También reportado en 8× DGX Spark GB10 por el usuario 0xMagnus.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) ni en configuraciones de una o dos GPUs profesionales.
- Opciones de despliegue: vLLM (recomendado, con `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--reasoning-parser glm45` y `--tool-call-parser glm47`). No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; se reporta un +48% de decodificación en prompts de código con MTP en el fork B12X sparse-MLA de vLLM, y una mejora de concurrencia de 2,98× en TP8 con 131K de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 | 753B (MoE) | 131K operativo (1M nativo no operativo en vLLM) | MIT | Ciberseguridad ofensiva, rechazos reducidos | Hugging Face, FP8 safetensors |
| GLM-5.3-UNCENSORED-FP8 (dealignai) | 753B (MoE) | mismo base | MIT | Uncensor generalista | Hugging Face |
| zai-org/GLM-5.3 (base) | 753B (MoE) | 1M declarado | según base | Modelo generalista alineado | Hugging Face |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | mismo base | según base | Cuantización FP8 del base | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría (por ejemplo, otros uncensors de dominio de 700B+) en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente barreras de seguridad en ciberseguridad ofensiva; su uso para actividades no autorizadas puede ser ilegal en la mayoría de jurisdicciones y viola los términos de servicio de proveedores cloud.
- Aunque está afinado para ciberseguridad, los rechazos comparten sustrato entre dominios: en categorías como armas, química, biología, acoso o desinformación a menudo cumple con un envoltorio "educativo" blando. No debe asumirse que sea seguro en esos dominios.
- La reproducción literal de contenido con copyright sigue produciendo rechazos blandos (aproximadamente el 60-68% del bucket de copyright en HarmBench-320).
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasa de alucinación; el modelo base es un LLM de gran escala sin garantías de veracidad.
- El razonamiento no se puede desactivar: `reasoning_effort` solo acepta `"low"` y `"high"`, y cualquier otro valor cae a `max`. En FP8, con `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`); se recomienda `max_tokens ≥ 8000` en esos casos.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- MTP no funciona en vLLM estándar; requiere el fork B12X sparse-MLA.
- El contexto de 1M tokens no es operativo hoy en vLLM con `glm_moe_dsa`: el índice DSA replica `k_cache` entre rangos DCP mientras la KV MLA está shardeada, lo que produce el error `page size is not divisible by target page size and cannot be padded` con `fp8_ds_mla`. El techo práctico en TP8 H200 es de aproximadamente 131K con MTP y 160K sin él.
- El pipeline-parallel (PP2 × TP4) perfila correctamente, pero el draft MTP no implementa `SupportsPP`.
- Licencia MIT declarada, pero al derivar de zai-org/GLM-5.3 conviene verificar las condiciones del modelo base para uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria independiente más allá de los informes de los usuarios citados.
- El checkpoint es exclusivamente textual: no procesa imágenes, audio ni vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cassimahmedattia/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano uncensor generalista: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de la marca: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Perfil del tester: https://huggingface.co/0xMagnus
