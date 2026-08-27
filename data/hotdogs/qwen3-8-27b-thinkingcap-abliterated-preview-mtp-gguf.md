# hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview-mtp-GGUF

## Resumen

El modelo `hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview-mtp-GGUF` es una conversión a GGUF de un fine-tuning del modelo Qwen3.8-27B, desarrollado por el usuario "hotdogs". Se trata de una versión "ThinkingCap" que ha sido entrenada mediante SFT (supervised fine-tuning) con un dataset generado on-policy y verificado por un oráculo, con el objetivo de reducir drásticamente la longitud del razonamiento interno (thinking) sin sacrificar la calidad de las respuestas. Además, el modelo ha sido "abliterated" (eliminación de las capas de rechazo o censura) y conserva la capa de multi-token prediction (MTP) del modelo base, lo que permite una inferencia más eficiente en términos de tokens generados.

Con 27.320.697.856 parámetros (27,3 mil millones), este modelo está disponible en tres cuantizaciones GGUF (f16, Q6_K y Q4_K_M) que preservan la capa MTP. Su relevancia radica en que ofrece un razonamiento más conciso y eficiente, reduciendo el coste computacional y la latencia en tareas de razonamiento complejo, a la vez que mantiene un rendimiento competitivo en benchmarks como GPQA, IFEval y SWE-bench. La licencia Apache 2.0 permite uso comercial sin restricciones, y al ser un GGUF, es compatible con llama.cpp y otras herramientas del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B) con capa MTP (multi-token prediction) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16 (16.0 BPW), Q6_K (6.56 BPW), Q4_K_M (~5.1 BPW) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con 27,3 mil millones de parámetros, y ha sido fine-tuneado mediante SFT con el dataset `hotdogs/thinkingcap-sft-qwen38-27b`, generado on-policy (el propio modelo genera razonamientos) y verificado por un oráculo para garantizar la corrección. El objetivo del entrenamiento es reducir la longitud del "thinking" (cadena de razonamiento) manteniendo la precisión, logrando una reducción de hasta el 91% en los caracteres de razonamiento en problemas de lógica (según el smoke test incluido en la model card). El proceso incluye un merge de LoRA y una etapa de "abliteration" que elimina los mecanismos de rechazo del modelo original. Además, se conserva la capa MTP (blk.64, 15 tensores) que permite predecir múltiples tokens a la vez, mejorando la velocidad de generación. No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto y razonamiento eficiente: produce cadenas de pensamiento más cortas que el modelo base, manteniendo la precisión en tareas de lógica y matemáticas.
- Resolución de problemas matemáticos y aritméticos (verificado con problemas como "27 x 43" o el clásico del caracol).
- Tareas de ingeniería de software: obtiene un 60% en SWE-bench Verified Mini, lo que implica capacidad para resolver issues reales de repositorios usando herramientas y razonamiento multi-paso.
- Seguimiento de instrucciones: alcanza un 88,4% en IFEval (prompt-level strict), superando al modelo oficial en el mismo benchmark.
- Multi-token prediction (MTP): acelera la inferencia al predecir varios tokens por paso.
- Abliterated: sin restricciones de contenido, lo que permite generar respuestas sin filtros de seguridad (aunque esto conlleva riesgos).
- Compatible con llama.cpp y servidores tipo `llama-server`, con soporte para flash attention y procesamiento por lotes.

## Casos de uso

- Asistente de programación autónomo: el modelo puede integrarse en pipelines de CI/CD para resolver issues de GitHub, generar parches y ejecutar pruebas, gracias a su rendimiento en SWE-bench y su capacidad para usar herramientas.
- Tutor de matemáticas y lógica: su razonamiento conciso y preciso lo hace adecuado para explicar problemas paso a paso en entornos educativos, con menor coste de tokens que otros modelos de razonamiento.
- Chat conversacional de bajo coste: al reducir el "thinking", es ideal para aplicaciones de atención al cliente donde se requiere respuestas rápidas y contextuales, manteniendo un contexto largo (aunque no se especifica el máximo).
- Generación de documentación técnica: puede producir explicaciones claras y detalladas de código, APIs o procesos, con un estilo directo y sin divagaciones.
- Agente autónomo con tool calling: su capacidad para ejecutar tareas multi-paso (evidenciada en SWE-bench) lo hace útil para automatizar flujos de trabajo que requieren llamadas a funciones o APIs.
- Prototipado de aplicaciones de IA sin censura: al ser abliterated, es adecuado para investigación en generación de texto libre, aunque debe usarse con precaución en entornos productivos.

## Benchmarks y rendimiento

Los siguientes resultados fueron publicados por el autor en la model card, obtenidos con `inspect_ai` 0.3.260 sobre llama.cpp local, con `reasoning_effort=low`, `temperature=1`, `top_k=20`, `top_p=0.95`. Las comparaciones con Qwen3.8-27B oficial usan `reasoning_effort=xhigh` y pueden no ser directamente comparables.

| Benchmark | Q6_K (este repo) | Q4_K_M (este repo) | Qwen3.8-27B (oficial) | Qwen3.6-27B | Opus 4.6 Max |
|-----------|:----------------:|:------------------:|:---------------------:|:-----------:|:------------:|
| GPQA Diamond (198) | 87,1% | 79,5% | 89,2% | 87,8% | 91,3% |
| IFEval (541, strict) | — | 88,4% | 79,5%¹ | 69,1%¹ | 62,5%¹ |
| SWE-bench Verified Mini (50) | 60,0% | — (pendiente) | 61,7%² | 53,5%² | 53,4%² |

¹ Qwen reporta "IFBench" (benchmark interno), no el mismo IFEval de Google.
² Qwen reporta "SWE-bench Pro" (más difícil, a nivel de repositorio), no directamente comparable.

El autor destaca que Q6_K se sitúa a 2,1 puntos porcentuales del modelo oficial en GPQA y a 1,7 en SWE-bench, a pesar de estar cuantizado, abliterated y con LoRA merge. En IFEval, Q4_K_M supera al oficial por 9 puntos, aunque los conjuntos de evaluación difieren.

## Requisitos de hardware

- Q4_K_M (16 GB): cabe en GPUs de consumo con 16-24 GB de VRAM, como RTX 4080/4090, RTX 3090 o RTX 4060 Ti 16GB. Es la opción más rápida.
- Q6_K (21 GB): requiere al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000). El autor la recomienda como equilibrio calidad/velocidad.
- F16 (51 GB): necesita múltiples GPUs o una configuración con al menos 64 GB de VRAM total. El autor usó dos cajas: Box A (RTX 3090 24GB + RTX 3060 12GB) y Box B (RTX 4060 Ti 16GB + RTX 3060 12GB), con un total de 64 GB.
- Despliegue: se sirve con `llama-server` de llama.cpp, usando `--n-gpu-layers 999`, `--flash-attn on` y `--jinja`. También es compatible con cualquier runtime que soporte GGUF (Ollama, LM Studio, etc.).
- Latencia y throughput: no se proporcionan datos específicos, pero la capa MTP y las cuantizaciones pequeñas (Q4_K_M) permiten inferencia en tiempo real en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | GPQA Diamond | IFEval (strict) | SWE-bench Verified Mini |
|--------|------------|----------|----------|---------|--------------|-----------------|--------------------------|
| **Qwen3.8-27B ThinkingCap Abliterated (MTP GGUF)** | 27,3B | No disponible | Apache 2.0 | GGUF | 87,1% (Q6_K) | 88,4% (Q4_K_M) | 60,0% (Q6_K) |
| Qwen3.8-27B (oficial) | 27,3B | No disponible | Apache 2.0 | Safetensors | 89,2% | 79,5% (IFBench) | 61,7% (SWE-bench Pro) |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Safetensors | 87,8% | 69,1% (IFBench) | 53,5% (SWE-bench Pro) |
| Opus 4.6 Max (propietario) | No disponible | No disponible | Comercial | API | 91,3% | 62,5% (IFBench) | 53,4% (SWE-bench Pro) |

La comparativa se basa en los datos de la model card. El modelo ThinkingCap ofrece un rendimiento cercano al oficial en GPQA y SWE-bench, con la ventaja de un razonamiento más corto y una licencia permisiva. Su principal diferencia es la abliteration y la disponibilidad en GGUF.

## Limitaciones y advertencias

- Es una versión "preview" (vista previa), por lo que puede contener errores o comportamientos inesperados en producción.
- Al ser abliterated, el modelo puede generar contenido ofensivo, peligroso o no seguro, sin filtros de seguridad. No es recomendable para aplicaciones orientadas al público sin moderación adicional.
- La reducción del razonamiento puede afectar a tareas extremadamente complejas que requieran cadenas de pensamiento largas; el autor recomienda verificar en cada caso.
- No se especifican los idiomas soportados, aunque al derivar de Qwen3.8-27B es probable que sea multilingüe, pero no está confirmado en la documentación.
- Los benchmarks de F16 y Q8_K están pendientes de publicación; los resultados actuales son solo para Q6_K y Q4_K_M.
- La longitud de contexto máxima no está documentada; el ejemplo de servidor usa 8192 tokens, pero podría soportar más.
- El uso de MTP requiere que el runtime (llama.cpp) tenga soporte para esta capa; versiones antiguas podrían ignorarla o fallar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview-mtp-GGUF
- Modelo base (preview): https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview
- Dataset de entrenamiento: https://huggingface.co/datasets/hotdogs/thinkingcap-sft-qwen38-27b
- Modelo abliterated original: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Modelo oficial Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
