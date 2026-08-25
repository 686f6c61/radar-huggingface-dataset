# Justbackup/Qwen3.8-27B-ARA-abliterated-NVFP4-MTP

## Resumen

El modelo `Justbackup/Qwen3.8-27B-ARA-abliterated-NVFP4-MTP` es un derivado multimodal del checkpoint BF16 `trohrbaugh/Qwen3.8-27B-heretic-ara`, que a su vez parte del modelo nativo Qwen3.8-27B de Alibaba. La contribución principal de este artefacto es doble: por un lado, aplica una abliteración de rechazos (refusal-ablation, comúnmente descrita como "uncensored") sobre el modelo base, y por otro, cuantiza las capas lineales del modelo de lenguaje con el formato NVFP4 W4A4 (group-16) de compressed-tensors, diseñado para inferencia nativa en hardware Blackwell. La torre de visión, las convoluciones recurrentes, la cabeza de lenguaje y los 15 tensores MTP (multi-token prediction) se mantienen en BF16.

El checkpoint conserva las capacidades multimodales del modelo original (imagen, texto y tensores de vídeo preservados) e incorpora un MTP draft head nativo que permite decodificación especulativa de tres tokens en vLLM. La validación se realizó sobre vLLM 0.23 con el kernel FlashInfer CUTLASS NVFP4, un contexto de 8.192 tokens y una GPU RTX PRO 6000 Blackwell, cargando aproximadamente 19.53 GiB en memoria. El repositorio incluye manifiestos de construcción y verificación (BUILD_MANIFEST.json, VALIDATION_REPORT.json, SHA256SUMS) para garantizar la trazabilidad bit-exact de los tensores de visión y MTP respecto a la fuente.

Se trata de un checkpoint de nicho: no es un modelo entrenado desde cero, sino una variante cuantizada y ablada orientada a despliegues locales en Blackwell que requieren baja huella de memoria y un comportamiento menos restrictivo en la generación de respuestas. La licencia Apache-2.0 permite uso comercial, aunque el autor advierte que la abliteración no garantiza respuestas a todos los prompts y que el usuario es responsable de evaluar los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso con atención lineal en 48 de 64 capas, vision tower y MTP draft head integrado (base Qwen3.8-27B / Qwen3.5) |
| Parametros totales | 27B nominales (16.703.361.232 parámetros en safetensors, cuantizado NVFP4) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K nativo (extensible a 1M); validado con 8.192 tokens en el gate de vLLM |
| Tipos de cuantizacion | NVFP4 W4A4 group-16 (compressed-tensors) en capas lineales; BF16 en vision tower, convoluciones recurrentes, head y tensores MTP |
| Idiomas soportados | No disponible en la model card (el modelo base Qwen3.8-27B es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors NVFP4) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura híbrida del Qwen3.8-27B: un transformer denso de 27B parámetros con atención lineal en 48 de sus 64 capas, lo que reduce el coste de atención a largo contexto, junto con una torre de visión (vision tower) para entrada de imágenes y un MTP draft head integrado que predice tres tokens por paso para decodificación especulativa. En esta variante, las capas lineales del modelo de lenguaje se cuantizan con NVFP4 W4A4 (group-16) mediante compressed-tensors, mientras que la visión, la cabeza y los tensores MTP permanecen en BF16. Los 333 tensores de visión y los 15 tensores MTP se verificaron bit-exact contra la fuente BF16, lo que garantiza que la cuantización no altera las partes críticas del modelo.

El proceso de entrenamiento o adaptación no se documenta en la model card: no se especifica número de tokens, composición del dataset ni si hubo RLHF o DPO. La única transformación declarada es la abliteración de rechazos del checkpoint fuente `trohrbaugh/Qwen3.8-27B-heretic-ara`, un proceso que elimina los patrones de negativa del modelo, y la posterior cuantización NVFP4. La validación se realizó sobre vLLM 0.23 con el kernel FlashInfer CUTLASS NVFP4, el modelo `Qwen3_5ForConditionalGeneration` y un contexto de 8.192 tokens, cubriendo capacidades de texto, visión, superficie de rechazo benigna, aceptación MTP nativa, integridad y carga limpia.

## Capacidades

- Multimodal imagen-texto: procesa imágenes y texto, con torre de visión BF16 verificada bit-exact contra la fuente.
- Generación de texto con rechazos ablados: respuestas menos restrictivas en temas que el modelo base normalmente negaría (el proceso de abliteración no garantiza ninguna respuesta específica).
- Decodificación especulativa nativa con MTP de tres tokens, soportada en vLLM mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Razonamiento paso a paso y generación de código: el modelo base Qwen3.8-27B destaca en coding, agentic workflows y automatización de oficina según el repositorio oficial.
- Soporte de tool calling y agentes: el modelo base está diseñado para tareas agénticas de largo horizonte, aunque no se detalla en esta model card específica.
- Preservación de tensores y procesadores de vídeo, aunque la entrada de vídeo no fue validada en el gate en vivo.

## Casos de uso

- **Despliegue multimodal en Blackwell con baja VRAM**: con ~19.53 GiB de memoria cargada, el modelo cabe en una RTX PRO 6000 Blackwell (48 GB) y puede servir imágenes y texto con NVFP4 nativo, ideal para entornos con presupuesto de VRAM ajustado.
- **Decodificación especulativa para aplicaciones en tiempo real**: el MTP de tres tokens permite reducir la latencia de generación en chatbots o asistentes que ejecutan sobre vLLM, usando el flag de configuración especulativa.
- **Generación de código con contexto largo**: el contexto nativo de 262K permite procesar repositorios completos o documentación extensa, combinando visión de capturas de pantalla de interfaces y texto de código.
- **Automatización de oficina con entrada visual**: el modelo puede analizar documentos escaneados, gráficos o diagramas y generar resúmenes o acciones, aprovechando la torre de visión BF16 y la capacidad de tool calling del base.
- **Investigación en seguridad y análisis de contenido**: la abliteración permite estudiar el comportamiento de modelos sin restricciones de rechazo, útil para evaluar riesgos, sesgos o ataques de jailbreak en contextos de investigación controlada.
- **Prototipado de asistentes agénticos de largo horizonte**: con soporte para multi-step reasoning y 262K de contexto, se puede construir un agente que planifique y ejecute tareas complejas sobre una base de conocimiento amplia, desplegado en vLLM con FlashInfer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones MMLU, HumanEval, GSM8K ni comparativas numéricas para este checkpoint específico. El modelo base Qwen3.8-27B sí ha sido evaluado por Alibaba (por ejemplo, MathVision), pero esos datos no se replican aquí para la variante ablucada y cuantizada.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 19.53 GiB de memoria cargada según la validación en RTX PRO 6000 Blackwell con contexto de 8.192 tokens.
- **GPU recomendadas**: hardware Blackwell nativo (RTX PRO 6000 Blackwell, B200, etc.) para ejecución NVFP4 W4A4; sin soporte nativo en GPUs consumer Ampere o Ada para este formato.
- **En consumer GPU**: no se recomienda; la cuantización NVFP4 requiere kernels CUTLASS de Blackwell. Podría ejecutarse con dequantización a BF16, pero no se documenta en la model card.
- **Opciones de despliegue**: vLLM con soporte Qwen3.5 multimodal y compressed-tensors NVFP4, usando el comando `vllm serve` con `--speculative-config` para MTP. No se mencionan integraciones con Ollama, llama.cpp o TGI.
- **Latencia y throughput**: no disponibles; el gate de validación reporta solo la memoria cargada, no métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Justbackup/Qwen3.8-27B-ARA-abliterated-NVFP4-MTP** (este) | 27B nominales (16.7B en safetensors) | 262K nativo | NVFP4 W4A4 + BF16 | Apache-2.0 | HuggingFace, requiere Blackwell |
| **trohrbaugh/Qwen3.8-27B-heretic-ara** | 27B | 262K nativo | BF16 | Apache-2.0 | HuggingFace, base sin cuantizar |
| **huihui-ai/Huihui-Qwen3.8-27B-abliterated** | 27B | 262K nativo | BF16 (probable) | Apache-2.0 | HuggingFace, abliterado sin cuantizar |
| **Qwen/Qwen3.8-27B** (oficial) | 27B | 262K nativo | BF16 | Apache-2.0 | HuggingFace, modelo original sin abliteración |

La principal diferencia frente a las alternativas es la cuantización NVFP4 y el MTP nativo, que reducen la memoria de 27B a ~19.53 GiB cargados y permiten decodificación especulativa, a costa de requerir hardware Blackwell exclusivo. Las variantes BF16 son más portátiles (cualquier GPU con suficiente VRAM) pero consumen más memoria.

## Limitaciones y advertencias

- **Abliteración no garantiza respuestas**: la model card advierte que "uncensored" describe el proceso de abliteración, pero no es una garantía de que todos los prompts reciban una respuesta concreta; el modelo puede seguir mostrando rechazos residuales.
- **Riesgo de alucinación**: como cualquier LLM, puede generar contenido falso o inventado, agravado por la eliminación de rechazos en contextos sensibles.
- **Hardware restrictivo**: la cuantización NVFP4 W4A4 requiere GPUs Blackwell; en hardware no compatible no funcionará con el rendimiento esperado y puede requerir dequantización.
- **Video no validado**: los tensores de vídeo están preservados pero no se ejecutaron en el gate funcional; no hay garantía de que la entrada de vídeo funcione correctamente.
- **Idiomas no documentados**: la model card no especifica los idiomas soportados, aunque el base Qwen3.8-27B es multilingüe; la calidad puede variar entre idiomas.
- **Responsabilidad legal y ética**: la abliteración elimina los rechazos, lo que puede generar contenido inapropiado o dañino; los usuarios son responsables de evaluar y aplicar salvaguardas en despliegues de producción.
- **Sin benchmarks publicados**: no hay datos de rendimiento para este checkpoint específico, lo que dificulta comparar su calidad con otras variantes de Qwen3.8-27B.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Justbackup/Qwen3.8-27B-ARA-abliterated-NVFP4-MTP)
- [Checkpoint base: trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara)
- [Modelo oficial: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial de Alibaba en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Ficha de vLLM Recipes para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Variante abluterada de huihui-ai en HuggingFace](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Variante abluterada en Ollama](https://ollama.com/huihui_ai/Qwen3.8-abliterated)
