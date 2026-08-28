# hotdogs/Qwen3.8-27B-thinkingcap-abliterated-mtp-GGUF

## Resumen

Qwen3.8-27B ThinkingCap Abliterated (MTP GGUF) es una conversión a formato GGUF del modelo `hotdogs/Qwen3.8-27B-thinkingcap-abliterated`, un fine-tuning del LLM Qwen3.8-27B de Alibaba Cloud realizado por el usuario hotdogs. El modelo combina dos modificaciones principales sobre el base: un entrenamiento SFT con LoRA sobre un dataset "on-policy oracle-verified" (denominado ThinkingCap) que reduce drásticamente la cantidad de tokens de razonamiento interno necesarios para resolver problemas, y una técnica de "abliteration" que elimina los rechazos del modelo ante peticiones que normalmente serían rechazadas. Además, esta versión GGUF conserva la capa de multi-token prediction (MTP) del modelo base, lo que permite una decodificación más rápida.

Con 27.320.697.856 parámetros (27,3B), el modelo está disponible en tres cuantizaciones (f16, Q6_K y Q4_K_M) que cubren desde 51 GB hasta 16 GB de tamaño de archivo, lo que lo hace ejecutable en GPUs de consumo. Su relevancia radica en que demuestra que es posible obtener un razonamiento de alta calidad con un presupuesto de tokens de pensamiento mucho menor que el del modelo original, reduciendo costes de inferencia y latencia. El autor reporta una reducción del 91% en los caracteres de "think" para un problema de razonamiento clásico, pasando de más de 4000 a 359, sin pérdida aparente de precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa 8192 tokens) |
| Tipos de cuantizacion | f16 (lossless), Q6_K (6,56 BPW), Q4_K_M (~5,1 BPW) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27,3B parámetros con capa de multi-token prediction (MTP). Sobre este base se aplicó un fine-tuning con LoRA (SFT) utilizando el dataset `hotdogs/thinkingcap-sft-qwen38-27b`, generado mediante un proceso on-policy con verificación oracle. El objetivo de este entrenamiento es enseñar al modelo a producir cadenas de razonamiento mucho más concisas que las del modelo original, manteniendo la exactitud de las respuestas. La técnica de abliteration, aplicada posteriormente, elimina los mecanismos de rechazo del modelo, de modo que responde a cualquier petición sin filtros de seguridad.

La conversión a GGUF preserva íntegramente la capa MTP (blk.64, 15 tensores incluyendo 4 proyecciones `nextn.*`), lo que permite aprovechar la predicción multi-token durante la inferencia en llama.cpp. El repositorio incluye un script de verificación que confirma la presencia de estos tensores. El autor reporta que el modelo base (pre-SFT) utilizaba más de 4000 caracteres de pensamiento para resolver el problema del caracol, mientras que la versión ThinkingCap lo reduce a 359, una mejora del 91% en eficiencia de razonamiento.

## Capacidades

- Razonamiento y resolución de problemas con cadenas de pensamiento concisas (thinking cap).
- Generación de texto general de alta calidad.
- Capacidad de agente y uso de herramientas, evidenciada por resultados en SWE-bench Verified (mini) con resolución de issues de repositorios reales.
- Decodificación multi-token (MTP) para mayor velocidad de inferencia.
- Respuesta sin rechazos (abliterated): genera contenido que otros modelos suelen rechazar.
- Soporte de chat y conversación multi-turno (compatible con Jinja en llama.cpp).

## Casos de uso

- Razonamiento matemático y lógico en entornos con presupuesto de tokens limitado: el modelo resuelve problemas aritméticos y lógicos con muy pocos tokens de pensamiento, lo que reduce costes en APIs de pago por token.
- Agente de resolución de issues de software: con un 63,3% en SWE-bench Verified (mini), puede integrarse en pipelines de automatización de desarrollo para diagnosticar y corregir bugs en repositorios.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q6_K (21 GB) y Q4_K_M (16 GB), puede ejecutarse en GPUs como RTX 3090 o RTX 4060 Ti de 16 GB, permitiendo inferencia local de un modelo de 27B.
- Investigación sobre eficiencia de razonamiento: el dataset ThinkingCap y el modelo resultante sirven como referencia para estudiar cómo reducir la longitud de las cadenas de pensamiento sin sacrificar precisión.
- Generación de contenido sin restricciones: al estar abliterated, puede utilizarse en aplicaciones creativas o de investigación donde se requiera explorar temas que otros modelos rechazan, siempre con las debidas advertencias éticas.
- Servidor de inferencia local con llama.cpp: el comando `llama-server` proporcionado permite servir el modelo con contexto de 8192 tokens, paralelismo 2 y atención flash, adecuado para prototipos y aplicaciones de baja latencia.

## Benchmarks y rendimiento

Los benchmarks fueron ejecutados con `inspect_ai` 0.3.260 sobre llama.cpp local, con `reasoning_effort=low`, `temperature=1`, `top_k=20` y `top_p=0.95`. Cada resultado corresponde a una sola época (sin promediado multi-época).

| Benchmark | Q6_K (este repo) | Q4_K_M (este repo) | Qwen3.8-27B¹ | Qwen3.6-27B | Opus 4.6 Max | GPT-5.5 | Kimi K3 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|---|
| GPQA Diamond (198) | **87,1%** | 79,5% | 89,2%¹ | 87,8%¹ | 91,3%¹ | 93,6% | 93,5% | 94,3%⁸ |
| IFEval (541, strict)² | **88,2%** | **88,4%** | ~91,5%⁷ | ~90,4%⁷ | 95,0%⁷ | 94,2% | 92,8% | 93,5%⁸ |
| SWE-bench Verified (50)⁴ | — (retesting) | **63,3%** (31/49)⁹ | ~82%⁶ | ~77,2%⁶ | ~80,8%⁶ | 88,7% | 76,8% | 80,6%⁸ |

Notas: ¹ Puntuaciones oficiales del vendor de Qwen3.8-27B con `reasoning_effort=xhigh`. ² IFEval estándar de Google vía `inspect_evals/ifeval`. ⁴ `swe_bench_verified_mini` de 50 issues con límites de pasos y tokens. ⁶ Evaluaciones externas e independientes, no oficiales. ⁷ Comparaciones externas vía serenitiesai.com. ⁸ Fuentes de SmartScope y MorphLLM. ⁹ 31/49 issues puntuados correctamente; un issue quedó fuera por límite de pasos.

El autor destaca que Q6_K queda a 2,1 puntos porcentuales del Qwen3.8-27B completo en BF16 en GPQA (87,1 vs 89,2), a pesar de estar cuantizado, abliterated y con LoRA fusionada. En IFEval, ambas cuantizaciones están dentro de ~3 pp del valor de referencia F16. SWE-bench se ejecutó con límites estrictos (100 pasos de agente, 16384 tokens por turno) y el modelo suele quedar limitado por pasos, no por tokens.

## Requisitos de hardware

- Q4_K_M (16 GB de archivo): requiere al menos 16 GB de VRAM para inferencia con contexto pequeño; cabe en una RTX 4060 Ti 16 GB o RTX 3090 24 GB. Es la opción más rápida y ligera.
- Q6_K (21 GB de archivo): requiere al menos 24 GB de VRAM; adecuado para RTX 3090, RTX 4090 o A5000. El autor lo usa como "daily-driver" en una caja con 36 GB (RTX 3090 24GB + RTX 3060 12GB).
- f16 (51 GB de archivo): requiere ~55 GB de VRAM, por lo que necesita múltiples GPUs o una configuración con varios adaptadores. El autor lo ejecuta en una configuración de dos cajas con 64 GB totales, pero con KV-cache ajustada.
- Despliegue: compatible con llama.cpp (`llama-server`), y por extensión con Ollama, LM Studio y cualquier runtime que soporte GGUF. También puede usarse con vLLM si se convierte a safetensors, aunque el repositorio solo ofrece GGUF.
- Latencia y throughput: no se proporcionan datos específicos. La capa MTP preservada debería mejorar la velocidad de decodificación respecto a un modelo sin ella, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen3.8-27B original, del que deriva. También se incluye Qwen3.6-27B, que aparece en los benchmarks del autor.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin fine-tuning, con razonamiento extenso (4000+ chars de think) |
| Qwen3.8-27B ThinkingCap Abliterated (MTP GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Fine-tuning LoRA + abliteration + MTP preservada, razonamiento conciso |
| Qwen3.6-27B | 27B (estimado) | no disponible | Apache 2.0 | safetensors | Modelo anterior de la serie Qwen3, similar en tamaño |

No se dispone de especificaciones detalladas de Qwen3.6-27B en la información proporcionada. La principal diferencia frente al original es la reducción de tokens de razonamiento (91% menos en el smoke test) y la ausencia de rechazos, a costa de una ligera caída en GPQA (87,1 vs 89,2 en Q6_K frente a BF16).

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los rechazos, por lo que puede generar contenido dañino, ilegal o inapropiado sin advertencias. No debe desplegarse en aplicaciones orientadas al público sin salvaguardas adicionales.
- Los benchmarks reportados son de una sola época y con configuración específica (`reasoning_effort=low`); los resultados pueden variar en condiciones diferentes.
- La cuantización Q4_K_M muestra una caída notable en GPQA (79,5% frente a 87,1% de Q6_K), por lo que no es recomendable para tareas de razonamiento complejo si se dispone de VRAM suficiente.
- No se especifican los idiomas soportados; aunque Qwen3.8-27B es multilingüe, no hay confirmación para esta versión.
- La longitud de contexto nativa no está documentada; el ejemplo de despliegue usa 8192 tokens, pero el máximo real podría ser mayor o menor.
- SWE-bench Verified (mini) usa solo 50 issues, una muestra pequeña; el resultado del 63,3% debe interpretarse con cautela.
- Riesgo de alucinación inherente a todos los LLM, especialmente en tareas de razonamiento de múltiples pasos.
- El modelo está optimizado para razonamiento conciso, lo que puede reducir la calidad en tareas que requieren explicaciones detalladas o cadenas de pensamiento largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated-mtp-GGUF
- Modelo base (safetensors): https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated
- Dataset ThinkingCap SFT: https://huggingface.co/datasets/hotdogs/thinkingcap-sft-qwen38-27b
- Versión preview: https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview
- Qwen3.8-27B oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- LLM Explorer (evaluación de la versión preview): https://llm-explorer.com/model/hotdogs%2FQwen3.8-27B-thinkingcap-abliterated-preview,5HmmTV6yZNCFR39kdMJNZO
