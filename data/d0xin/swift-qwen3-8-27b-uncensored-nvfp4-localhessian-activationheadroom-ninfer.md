# d0xin/Swift-Qwen3.8-27B-Uncensored-NVFP4-LocalHessian-ActivationHeadroom-NInfer

## Resumen

Swift-Qwen3.8-27B-Uncensored-NVFP4-LocalHessian-ActivationHeadroom-NInfer es una compilación cuantizada nativa para el motor NInfer del modelo `d0xin/Swift-Qwen3.8-27B-Uncensored-BF16`, un derivado de la familia Qwen3.8 de 27.000 millones de parámetros con el comportamiento de rechazo (refusal) deliberadamente reducido. Lo publica el usuario d0xin y su objetivo declarado es doble: conservar las capacidades de razonamiento, uso de herramientas, multimodalidad y contexto largo del modelo base, y a la vez aumentar el throughput de inferencia y reducir el consumo de VRAM manteniendo una calidad medida equivalente a FP8.

La pieza diferencial es la topología de precisión mixta NVFP4/FP8, calibrada con NVIDIA ModelOpt Local-Hessian y una técnica propia de «activation headroom», junto con un presupuesto de pensamiento recomendado de 2048 tokens (`--default-thinking-budget 2048`). Según la model card, frente a la build FP8 entrega entre un 20% y un 27% más de throughput de decodificación, entre un 34% y un 38% más de prefill y un 15,1% menos de VRAM en una RTX PRO 6000 Blackwell.

Es relevante ahora porque demuestra una ruta práctica para servir modelos de ~27B multimodales en hardware Blackwell con cuantización de 4 bits nativa (NVFP4) sin degradación estadísticamente significativa en la evaluación fija reportada. El artefacto ocupa 23,7 GB y requiere el motor NInfer (`inference: false` en el Hub), lo que limita su uso a entornos que ya dispongan de ese stack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y atención lineal/GDN (según topología de capas descrita en la model card) |
| Parametros totales | 27B (derivado de la familia Qwen3.8-27B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4 (MLP capas 0-55), FP8 row-wise (MLP 56-63, proyecciones de self-attention, atención lineal/GDN, LM head, embeddings), BF16 (GDN a/b) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | `.ninfer` (artefacto nativo NInfer de 23.719.715.844 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27B con una combinación de capas de self-attention y capas de atención lineal/GDN (gated delta network, por las siglas GDN que aparecen en la tabla de precisión), lo que sugiere una arquitectura híbrida orientada a eficiencia en contexto largo. Esta build no reentrena el modelo: parte del checkpoint BF16 `Swift-Qwen3.8-27B-Uncensored-BF16` y lo recuantiza. La topología mixta aplica NVFP4 (pesos y activaciones de 4 bits) a las 56 primeras capas MLP, reservando FP8 row-wise para las 8 últimas capas MLP, todas las proyecciones de atención, el LM head y los embeddings; las proyecciones a/b del bloque GDN se mantienen en BF16.

La calibración emplea NVIDIA ModelOpt con Local-Hessian, «activation headroom», barrido de escalas FP8, checkpointing por capa, `upper_percentile=99.99` y `rho=16384`. El modelo base incorpora un ajuste para reducir el comportamiento de rechazo (el autor lo denomina «uncensored»), y esta build hereda esa modificación. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) configurable mediante presupuesto de tokens; el autor recomienda 2048 tokens.
- Procesamiento multimodal imagen-texto (`pipeline_tag: image-text-to-text`), con soporte de visión.
- Uso de herramientas y function calling, según los objetivos de release declarados por el autor.
- Capacidades agénticas y razonamiento multi-paso (mencionadas explícitamente en los objetivos de la release).
- Contexto largo (el autor cita «long-context capabilities» sin especificar la ventana exacta).
- Comportamiento de rechazo reducido: en la evaluación fija Swift ORCA-K1 de 100 prompts obtuvo 90 DIRECT, 10 SAFETY_DEFLECT y 0 REFUSE.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de inferencia de alto throughput en Blackwell: con la topología NVFP4/FP8 y NInfer, el modelo alcanza 162,32 tok/s de decodificación en C1 y 110,58 tok/s en C8 en una RTX PRO 6000, lo que lo hace adecuado para endpoints con concurrencia moderada donde el coste por token importa.
- Asistentes multimodales con entrada de imagen: al ser un modelo image-text-to-text, puede emplearse en tareas de descripción, extracción de información o respuesta a preguntas sobre documentos escaneados y capturas.
- Agentes con tool calling: los objetivos de release incluyen preservar las capacidades agénticas y de uso de herramientas, por lo que encaja en orquestadores que encadenan llamadas a APIs y razonamiento multi-paso.
- Procesamiento de documentos largos: las capacidades de contexto largo declaradas permiten resumir o consultar contratos, informes o hilos de conversación extensos en una sola pasada.
- Investigación sobre alineación y refusal: la evaluación ORCA-K1 con 0/100 rechazos y la comparación con la build FP8 (1 REFUSE) lo convierten en un objeto de estudio útil para medir comportamiento de rechazo bajo configuraciones controladas.
- Despliegue en estaciones de trabajo con GPU profesional: con 35.106 MiB de VRAM en NInfer, cabe en una única RTX PRO 6000 Blackwell de 96 GB con margen amplio para KV cache y batch.
- Evaluación comparativa de cuantización: sirve como referencia reproducible para medir el impacto de NVFP4 con Local-Hessian frente a FP8 en tareas de razonamiento (MMLU-Pro) y latencia.

## Benchmarks y rendimiento

Evaluación fija MMLU-Pro: 280 preguntas, 14 categorías, 20 por categoría, semilla 20260918, `temperature=0`, `reasoning_effort=xhigh`, `max_tokens=4096`.

| Build | Aciertos | Precisión |
|---|---:|---:|
| FP8 | 211/280 | 75,36% |
| NVFP4 Headroom | 207/280 | 73,93% |
| FP8 + B2048 | 224/280 | 80,00% |
| NVFP4 Headroom + B2048 | 225/280 | 80,36% |

Comparación estadística FP8+B2048 frente a esta build+B2048: 216 aciertos comunes, 47 fallos comunes, 8 solo FP8, 9 solo NVFP4, McNemar exacto p=1,0 (sin diferencia significativa en este subconjunto).

Rendimiento en NVIDIA RTX PRO 6000 Blackwell Workstation Edition:

| Métrica | FP8 | Esta build | Cambio |
|---|---:|---:|---:|
| Decode C1 | 134,87 tok/s | 162,32 tok/s | +20,4% |
| Decode C8 | 87,33 tok/s | 110,58 tok/s | +26,6% |
| Prefill C1 | 6.633,88 tok/s | 8.876,31 tok/s | +33,8% |
| Prefill C8 | 6.960,00 tok/s | 9.615,82 tok/s | +38,2% |
| VRAM NInfer | 41.358 MiB | 35.106 MiB | -15,1% |

Uso de razonamiento con B2048: mediana 379,5 tokens, p90 2.072, media 741,87; 0/280 generaciones alcanzaron el límite de 4.096 tokens y las 280 finalizaron correctamente. Sin presupuesto de pensamiento, 36/280 generaciones NVFP4 llegaron al techo de 4.096 tokens.

## Requisitos de hardware

- VRAM estimada: 35.106 MiB medidos en NInfer con la configuración de referencia (aproximadamente 34,3 GiB); el artefacto en disco ocupa 23,7 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Workstation Edition (hardware de referencia); se requiere arquitectura Blackwell (tag `sm_120a`).
- GPU de consumo: no disponible confirmación de funcionamiento en RTX 4090 o similares; el tag `blackwell` y `sm_120a` apuntan a que la build está dirigida a esa generación.
- Opciones de despliegue: exclusivamente el motor NInfer (`library_name: ninfer`, `inference: false` en el Hub). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 162,32 tok/s decode C1, 110,58 tok/s decode C8, 8.876,31 tok/s prefill C1 y 9.615,82 tok/s prefill C8 en el hardware de referencia.
- Configuración de servicio recomendada: `--default-thinking-budget 2048`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (NVFP4/FP8, NInfer) | 27B | no disponible | `.ninfer` | swift-open-license-1.0 | 225/280 MMLU-Pro (B2048), 162,32 tok/s decode C1 |
| Swift-Qwen3.8-27B-Uncensored-FP8 | 27B | no disponible | FP8 | swift-open-license-1.0 | 224/280 MMLU-Pro (B2048), 134,87 tok/s decode C1, 41.358 MiB |
| Swift-Qwen3.8-27B-Uncensored-BF16 | 27B | no disponible | BF16 | swift-open-license-1.0 | Modelo base sin cuantizar; sin métricas de rendimiento en la información disponible |
| Swift-Qwen3.8-27B-FP8 | 27B | no disponible | FP8 | swift-open-license-1.0 | Variante sin el ajuste de reducción de rechazo |

No se dispone de datos de benchmarks de modelos externos a la familia Swift en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene el comportamiento de rechazo deliberadamente reducido; esto implica menor filtrado de seguridad a nivel de modelo y traslada al usuario la responsabilidad de evaluación legal y de cumplimiento.
- El resultado de 0/100 rechazos corresponde únicamente a un conjunto fijo automatizado (Swift ORCA-K1, `temperature=0`, `seed=42`, `max_tokens=1536`, thinking desactivado) y no constituye una garantía universal.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de 27B en tareas de razonamiento abierto.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá de lo que herede del modelo base.
- Longitud de contexto: no especificada numéricamente, aunque el autor menciona capacidades de contexto largo.
- La licencia swift-open-license-1.0 es de tipo «other»; deben revisarse sus términos antes de uso comercial.
- Dependencia exclusiva del motor NInfer: no hay pesos en safetensors ni GGUF, lo que impide su uso con vLLM, llama.cpp, Ollama o TGI.
- Requiere hardware Blackwell (`sm_120a`); no hay evidencia de funcionamiento en generaciones anteriores.
- El presupuesto de pensamiento de 2048 tokens es una recomendación de servicio, no está embebido en el artefacto; sin él se observaron 36/280 generaciones truncadas en el límite de 4.096 tokens.
- Las cifras de rendimiento son dependientes del hardware y de la carga de trabajo, según advierte el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-NVFP4-LocalHessian-ActivationHeadroom-NInfer
- Modelo base BF16: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Variante FP8 del mismo modelo: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-FP8
- Variante FP8 con NInfer: https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-FP8-NInfer
- Swift-Qwen3.8-27B-FP8 (sin ajuste de rechazo): https://huggingface.co/d0xin/Swift-Qwen3.8-27B-FP8
- Swift-1.5-Qwen3.8-27B-Uncensored-BF16: https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Swift-1.5-Qwen3.8-Flash-Next-NVFP4-FP8PLE: https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-FP8PLE
- Swift-1.5-Qwen3.8-Flash-Next-Rank2-Abliteration-Patch: https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-Flash-Next-Rank2-Abliteration-Patch
- Repositorio de modelos del autor: https://huggingface.co/d0xin
- Texto de la licencia swift-open-license-1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Modelo de referencia de la familia Swift: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
