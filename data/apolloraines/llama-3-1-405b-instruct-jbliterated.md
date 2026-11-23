# ApolloRaines/Llama-3.1-405B-Instruct-Jbliterated

## Resumen

Llama-3.1-405B-Instruct-Jbliterated es una modificación quirúrgica de los pesos de `meta-llama/Llama-3.1-405B-Instruct`, publicada por el usuario ApolloRaines bajo el paraguas de su técnica denominada "jbliteration". El modelo conserva la arquitectura, el tokenizador y la ventana de contexto de 128K del modelo base de Meta, pero aplica dos intervenciones post-entrenamiento sobre los pesos: la eliminación del comportamiento de rechazo (refusal) y la reducción de la sicofancia (tendencia a ceder ante presión social del usuario). No hay reentrenamiento con gradientes ni modificación de prompts de sistema; la edición es directa sobre los tensores.

Con 405.853.388.800 parámetros reales (según los safetensors del repositorio) y un tamaño de repo de 811,7 GB, se posiciona como el mayor modelo abierto con modificación quirúrgica de pesos publicada hasta la fecha según su autor. El interés técnico reside en la afirmación de que la eliminación de refusal puede hacerse sin degradar capacidades: el autor cita un caso medido en otro modelo de su colección (Sharona, Qwen3.5-27B) donde MMLU pasó de 76,84% a 77,89% tras seis fases de cirugía más cuantización GPTQ W4A16, aunque no publica métricas equivalentes para este 405B.

La relevancia práctica es doble: por un lado, es un drop-in replacement del Instruct original para pipelines que necesiten un modelo sin rechazos en tareas de análisis de seguridad defensiva, revisión de código hostil o reconstrucción de incidentes; por otro, es un caso de estudio sobre hasta qué punto el alignment de un modelo grande es una capa separable de sus capacidades subyacentes. El autor advierte explícitamente que los pesos pueden causar daño y que se publican para investigación en seguridad y red-teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), no disponible el detalle de capas/heads en la informacion |
| Parametros totales | 405.853.388.800 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | El autor menciona GPTQ W4A16 como parte de su pipeline en otro modelo de la coleccion; para este repo no se listan artefactos cuantizados. Formatos teoricamente posibles: bf16, fp16, GPTQ/AWQ/GGUF via conversion externa (no publicados en el repo) |
| Idiomas soportados | en (ingles; el modelo base soporta mas idiomas, pero la model card declara solo en) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 405B Instruct original de Meta: transformer decoder-only denso con atención por grupos (GQA), RoPE y ventana de contexto de 128K tokens. No hay cambios estructurales, de tokenizador ni de configuración de atención; el modelo es un reemplazo directo a nivel de pesos. Sobre el entrenamiento original de Meta (preentrenamiento masivo más SFT y RLHF con DPO) no se aportan detalles nuevos en la información disponible.

La innovación está en el post-procesado. La "jbliteration" se describe como una edición quirúrgica de pesos que apunta a la componente que produce causalmente los tokens de rechazo, en lugar de ablacionar una dirección completa como hace la abliteration estándar. Según el autor, la abliteration convencional arrastra capacidades colaterales y rasgos de personalidad (humor, hedging, voz creativa) porque la dirección de rechazo solapa con ellos; la jbliteration pretende aislar solo el componente causal del refusal. La "desycophancy" es una segunda edición que elimina la tendencia a aceptar afirmaciones incorrectas del usuario bajo presión de autoridad falsa. No se especifican en la información proporcionada el número de fases, los datasets de calibración, ni los detalles matemáticos del método.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del Instruct base.
- Razonamiento y conocimiento del mundo del Llama 3.1 405B, presumiblemente intactos según el autor ("fully preserved").
- Ventana de contexto de 128K tokens para documentos largos y conversaciones extensas.
- Respuesta sin rechazos ante prompts que el modelo base rechazaría (6/6 prompts de prueba respondidos, según la model card).
- Resistencia a presión social: mantiene respuestas correctas ante contradicciones con autoridad falsa (desycophancy).
- Capacidad de analizar código hostil, exploits y artefactos de malware sin negarse, orientada a seguridad defensiva.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información; el modelo base lo soporta, pero la model card no lo verifica tras la edición.
- Capacidades multimodales: no disponibles (modelo solo texto).
- Modo thinking explícito: no disponible.

## Casos de uso

- Análisis de malware y reconstrucción de incidentes: el modelo puede leer y razonar sobre artefactos de ataque (exploits, payloads, logs de intrusión) sin negarse, lo que lo hace adecuado para equipos de respuesta a incidentes que necesitan procesar datos de ataque propios. La ventana de 128K permite ingerir lotes grandes de eventos en una sola pasada.
- Revisión de código de seguridad: auditoría de código potencialmente malicioso o vulnerable en pipelines de CI/CD, donde un modelo con refusal bloquea la revisión. El contexto largo permite analizar módulos completos o diffs extensos.
- Red-teaming de sistemas propios: generación de prompts adversarios y escenarios de ataque contra defensas internas, con la ventaja de que el modelo no rechaza la tarea por su naturaleza.
- Investigación sobre alignment y refusal: estudio de hasta qué punto el comportamiento de rechazo es separable de las capacidades, comparando este modelo con el Instruct original en la misma batería de evaluaciones.
- Evaluación de robustez ante sicofancia: probar la resistencia del modelo a presión social en entornos de evaluación de fiabilidad, útil para investigar cómo los modelos ceden ante autoridad falsa.
- Asistente de análisis documental largo: con 128K de contexto, resumir y razonar sobre contratos, informes técnicos o expedientes extensos en inglés, aprovechando el conocimiento del 405B.
- Sustituto directo en pipelines existentes: al compartir tokenizador y arquitectura con el Instruct, puede reemplazarlo en despliegues que ya usan transformers, vLLM o TGI sin cambios de integración, cuando se requiera ausencia de rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo 405B en la información disponible. La model card cita únicamente:

| Metrica | Resultado | Contexto |
|---|---|---|
| Refusal en test propio | 6/6 prompts respondidos, 0 rechazos | Test del autor sobre este modelo |
| Retencion de capacidades (MMLU) | 77,89% vs 76,84% baseline (+1,05 pp) | Medido en Sharona (Qwen3.5-27B), NO en este 405B |
| Sycophancy | "Holds firm" en trampas de contradiccion | Cualitativo, sin metrica numerica |

No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo concreto. Cualquier cifra de benchmarks del Llama 3.1 405B Instruct original no es necesariamente trasladable tras la edición de pesos, y el autor no la verifica para este checkpoint.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 810 GB según el propio autor (405,85B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM en fp16: idéntica a bf16 (~810 GB).
- Cuantización W4A16 (GPTQ): ~203 GB de pesos, más overhead; requiere configuración multi-GPU.
- Cuantización de 4 bits tipo GGUF Q4_K_M: ~230 GB aproximados (estimación por tamaño, no publicada en el repo).
- GPU recomendadas en bf16: múltiples H100 80GB (mínimo ~11 GPUs solo para pesos, más margen para cache y activaciones), o clústeres de A100 80GB. No cabe en ninguna GPU consumer individual.
- GPU consumer: no cabe en RTX 4090 (24 GB), RTX 3090 ni similares a precisión completa. Solo sería viable mediante streaming de capas desde disco/RAM con herramientas como DeepswapLLM (del mismo autor) o AirLLM, con latencia muy alta.
- Opciones de despliegue: transformers con `device_map="auto"` (ejemplo oficial de la model card), vLLM y TGI para despliegue multi-GPU en servidor; llama.cpp/Ollama solo tras conversión a GGUF y con requisitos de RAM/VRAM muy elevados; DeepswapLLM para ejecución por streaming en hardware insuficiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-405B-Instruct-Jbliterated | 405,85B | 128K | Eliminado (6/6) | Llama 3.1 Community | Hugging Face, 424 descargas |
| meta-llama/Llama-3.1-405B-Instruct | 405,85B | 128K | Presente (alignment estandar) | Llama 3.1 Community | Hugging Face, ampliamente usado |
| Variantes abliterated de Llama 3.1 (comunidad) | 8B/70B tipicamente | 128K | Eliminado (abliteration estandar) | Llama 3.1 Community | Hugging Face, multiples autores |
| DeepSeek-V3 / R1 (referencia MoE abierta) | ~671B totales, ~37B activos | 128K | Presente | MIT / licencia propia | Hugging Face |

La comparación directa más relevante es con el Instruct original: misma arquitectura, mismo tamaño y misma licencia, con la diferencia de comportamiento ante rechazos y sicofancia. Frente a las variantes abliterated de la comunidad, la diferencia declarada es la preservación de personalidad y capacidades, aunque no hay benchmarks públicos que lo verifiquen en este checkpoint. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo responderá a solicitudes que el Instruct original bloquearía, incluyendo contenido potencialmente dañino. El autor lo advierte explícitamente ("These weights can do harm as well as good").
- Riesgo de alucinación: inherente al modelo base; la edición de pesos no lo mitiga y no hay evaluaciones publicadas de factualidad tras la cirugía.
- Retención de capacidades no verificada en este checkpoint: la evidencia de MMLU citada corresponde a otro modelo (Qwen3.5-27B) de la colección, no al 405B. No hay garantía de que la edición no haya degradado tareas específicas.
- Idiomas: la model card declara solo inglés; el multilingüismo del base no está verificado tras la edición.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática, obligaciones de atribución y política de uso aceptable de Meta). El uso comercial requiere revisar los términos.
- Trazabilidad y mantenimiento: autor individual, 424 descargas y 1 like en el momento de la ficha; sin paper, sin evaluación independiente y sin garantías de soporte.
- "Modelo de demostración": el autor declara que sus modelos públicos se publican a "fuerza parcial" como prueba de concepto, lo que implica que este checkpoint podría no representar la capacidad plena de la técnica.
- Requisitos de hardware extremos (~810 GB en bf16) que limitan la reproducibilidad a entornos con clúster multi-GPU.
- Uso responsable: adecuado para seguridad defensiva, red-teaming autorizado e investigación; inadecuado para despliegues de cara al público sin capas de moderación externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-405B-Instruct-Jbliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-405B-Instruct
- Perfil del autor: https://huggingface.co/ApolloRaines
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Licencia Llama 3.1: https://ai.meta.com/llama/license/
