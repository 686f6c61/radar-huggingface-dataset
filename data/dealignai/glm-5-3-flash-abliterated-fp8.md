# dealignai/GLM-5.3-Flash-ABLITERATED-FP8

## Resumen

GLM-5.3-Flash-ABLITERATED-FP8 es una versión modificada del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario dealignai bajo su marca "CRACK". Se trata de un modelo de 320B parámetros totales con 18B activos por token, de arquitectura MoE híbrida, cuantizado en FP8 nativo y con la eliminación de los mecanismos de rechazo (refusal) aplicada directamente en los pesos del modelo, sin fine-tuning, LoRA ni trucos de prompt. El objetivo declarado es eliminar el sobre-rechazo que mostraba el modelo base en peticiones benignas pero marcadas como sensibles, especialmente en temas de copyright.

La relevancia de este modelo radica en que ofrece una alternativa "desinhibida" del GLM-5.3-Flash manteniendo las capacidades del original: ventana de contexto de 1M tokens, visión multimodal, MTP (multi-token prediction) para decodificación especulativa y soporte de tool calling. El autor reporta una caída mínima en MMLU (-0.48 puntos porcentuales) y una tasa de cumplimiento del 100% en HarmBench-320, lo que indica que la ablación de rechazo es efectiva. Está pensado para desarrolladores que necesitan un modelo sin restricciones de seguridad a nivel de pesos, con rendimiento nativo en GPUs Hopper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`) — MoE híbrido con atención lineal KDA y atención sparse estilo DeepSeek |
| Parametros totales | 321.323.031.390 (320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | FP8 (block-wise e4m3) |
| Idiomas soportados | en (según model card; el modelo base soporta más, pero esta versión declara solo inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base, GLM-5.3-Flash, es el primer modelo nativamente multimodal de la serie GLM-5. Introduce una arquitectura híbrida que combina atención lineal KDA (Kernel-based Decomposed Attention) con atención sparse estilo DeepSeek, diseñada para reducir los costes de servicio en contextos largos manteniendo precisión. El modelo tiene 320B parámetros totales y 18B activos por token, con una ventana de contexto de 1M tokens. Incluye un vision tower de GLM-4.1V y un cabezal MTP (multi-token prediction) para decodificación especulativa.

La versión abliterada de dealignai no ha sido reentrenada: se trata de una modificación directa de los tensores del modelo base para eliminar el comportamiento de rechazo. El autor afirma explícitamente que no se usó fine-tuning, SFT, DPO, LoRA, adapters, steering vectors ni hooks en runtime. La modificación está "cocida" en los pesos, de modo que el modelo se carga con vLLM estándar sin necesidad de código personalizado. El proceso de ablación también se aplicó al cabezal MTP, que mantiene una tasa de aceptación del 75.9% según las pruebas del autor.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del GLM-5.3-Flash, con MMLU logit-mode de 86.26% (vs 86.74% del base, -0.48 pp).
- Visión multimodal: el vision tower de GLM-4.1V está operativo y se incluye la plantilla de chat multimodal correcta.
- MTP (multi-token prediction): cabezal de decodificación especulativa activo, con 75.9% de aceptación y sin colapso en prompts no rechazados.
- Tool calling / function calling: soportado, con parser `glm47` y auto-tool-choice en vLLM.
- Razonamiento: soporta el parser de razonamiento `glm45` en vLLM.
- Sin rechazos: el modelo cumple el 100% de las 320 peticiones de HarmBench-320 (greedy) y 30/30 en muestreo con temperatura 1.0 y top_p 0.95.
- Multilingüe: aunque la model card declara solo inglés, el modelo base GLM-5.3-Flash es multilingüe; esta versión no especifica otros idiomas.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritura de ficción, guiones, poesía o narrativa que aborde temas sensibles o controvertidos sin que el modelo se niegue por políticas de seguridad. La ablación a nivel de pesos garantiza que no haya rechazos ni siquiera con prompts adversariales.
- Análisis de textos con copyright: resumen, parafraseo o extracción de información de documentos protegidos por derechos de autor, donde el modelo base tendía a sobre-rechazar. Útil para investigación académica o análisis legal con corpus propietarios.
- Desarrollo de agentes autónomos: gracias al soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de automatización donde el agente necesita ejecutar acciones sin que el modelo se detenga por consideraciones éticas programadas.
- Servicio de chat sin filtros en producción: despliegue con vLLM en GPUs Hopper (H100/H200) con FP8 nativo, alcanzando 163 tok/s de decode (211 tok/s con MTP) en TP4, adecuado para aplicaciones de chat de alta concurrencia.
- Investigación en alineación y seguridad: como modelo de referencia para estudiar el impacto de la ablación de rechazo en las capacidades del modelo, comparando comportamiento y métricas con el base.
- Procesamiento de documentos largos con visión: al mantener la ventana de 1M tokens y el vision tower, puede procesar libros completos, informes extensos o documentos escaneados con imágenes, sin rechazos por contenido protegido.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados, comparando el modelo base FP8 con la versión CRACK:

| Benchmark | Base FP8 | CRACK Uncensored FP8 | Δ |
|---|---|---|---|
| MMLU (overall, logit-mode, 1026 preguntas) | 86.74% | 86.26% | -0.48 pp |
| HarmBench-320 (greedy, cumplimiento) | — | 320/320 (100%) | — |
| HarmBench-320 (sampling, 30/30) | — | 30/30 (100%) | — |

Rendimiento en inferencia (TP4, FP8 nativo en H200):

| Métrica | Valor |
|---|---|
| Decode (single-stream) | 163 tok/s |
| Decode con MTP | 211 tok/s |
| Prefill | ~19.400 tok/s |
| Aceptación MTP | 75.9% |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 321 GB en disco (328.4 GB repo). Para inferencia con 320B parámetros en FP8, se necesitan al menos 4 GPUs con 80 GB de VRAM cada una (H100/H200) para TP4.
- GPU recomendadas: H100, H200 (Hopper) para velocidad nativa FP8. No se menciona soporte para GPUs consumer; el tamaño del modelo hace inviable su ejecución en una sola GPU de consumo.
- Opciones de despliegue: vLLM (recomendado, con `--tensor-parallel-size 4`), posiblemente TGI o llama.cpp si se convierte a GGUF, aunque no se indica en la documentación.
- Latencia y throughput: decode de 163 tok/s single-stream y 211 tok/s con MTP en TP4 sobre H200; prefill de ~19.400 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | Modelo original con guardrails |
| GLM-5.3-Flash-ABLITERATED-FP8 | 320B | 18B | 1M | MIT | Abliterado, sin rechazos, FP8 |
| GLM-5.2 | ~320B (estimado) | no disponible | no disponible | MIT | Versión anterior, sin visión nativa |

No se dispone de comparativas con otros modelos abliterados de tamaño similar (p.ej. versiones abliteradas de Llama 3.1 405B o DeepSeek-V3) en la información proporcionada.

## Limitaciones y advertencias

- Eliminación total de guardrails: el modelo no tiene mecanismos de rechazo, por lo que generará contenido dañino, ilegal o no ético si se le pide. No es apto para despliegues donde se requiera moderación automática.
- Sesgos del modelo base: la ablación no elimina sesgos preexistentes; el modelo puede reflejar los sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: al igual que el base, puede inventar información, especialmente en temas de actualidad o datos específicos.
- Idioma: la model card declara solo inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- Requisitos de hardware: necesita al menos 4 GPUs Hopper de 80 GB; no es viable en hardware de consumo.
- Uso comercial: la licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento legal de los contenidos generados (especialmente en copyright).
- Sin soporte oficial: es un modelo de terceros, no respaldado por Z.ai; los cambios en los pesos no han sido auditados externamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Espejo del mismo autor: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación de GLM-5.3 en Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Receta vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Documentación de Unsloth para GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
