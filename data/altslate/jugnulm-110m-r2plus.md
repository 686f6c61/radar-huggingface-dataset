# altslate/JugnuLM-110M-R2plus

## Resumen

JugnuLM-110M-R2+ es un modelo de lenguaje de 109,7 millones de parametros entrenado desde cero por AltSlate Labs para la Tiny-ML Leaderboard, un ranking de modelos por debajo de 150M de parametros. Se trata del buque insignia de la familia Jugnu y corresponde a la receta interna denominada R2, que combina la arquitectura Qwen3 (Llama con QK-Norm incorporada) con value residuals al estilo ResFormer y el optimizador Muon. Es, por tanto, un modelo base (no afinado por instrucciones) cuyo objetivo es maximizar calidad por parametro en el rango tiny.

El modelo escala la receta anterior hasta 25,2 mil millones de tokens de entrenamiento bajo un schedule WSD (warmup-stable-decay) con un reescalado educativo en la fase de decaimiento. Su interes practico es doble: por un lado, ofrece una perplejidad por byte de 1,8735 en WikiText-2 y 82,52 de exactitud en BLiMP, cifras poco habituales en modelos de este tamano; por otro, sirve como banco de pruebas reproducible y de bajo coste para tecnicas de attention alternativa (value residuals) y de optimizacion (Muon frente a AdamW).

La relevancia actual viene de la propia Tiny-ML Leaderboard: en su metrica de eficiencia el modelo ocupa la primera posicion (EFF aproximado de 80,21), con una ventaja estrecha sobre GPT-X2-125M (80,06) y Haidass-143M (79,83). Esa ventaja se apoya en parte en el bonus por tamano, al ser el mas pequeno de los tres. La longitud de contexto no esta documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (Llama + QK-Norm), 23 capas x 576 de hidden, GQA, tied embeddings, con value residuals (ResFormer) |
| Parametros totales | 109.737.302 (109,7M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se anuncian GGUF ni cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con codigo de modelado personalizado (auto_map, requiere trust_remote_code=True) |
| Tokenizador | SmolLM2, vocabulario de 49.152 tokens |
| Modelo base | altslate/JugnuLM-110M (R0) |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion en HuggingFace | 2026-09-18 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only que sigue el diseno Qwen3: 23 capas, 576 dimensiones de hidden (configuracion deep-thin), atencion con query-key normalization incorporada, grouped-query attention (GQA) y embeddings atados entre la entrada y la cabeza de salida. La innovacion central son los value residuals, tomados de ResFormer (arXiv:2410.17897): el valor de cada capa se calcula como `v_i = v_proj_i(x) + lambda_i * v0`, es decir, cada capa recibe una residual del value de la capa 0 ponderada por un escalar aprendido. El checkpoint incluye 22 escalares `vr_lambda` aprendidos, con una media aproximada de 0,48. Ademas se usa z-loss para estabilizar la distribucion de logits.

El entrenamiento se realizo desde cero sobre 25,2 mil millones de tokens (48.000 pasos x 524.288 tokens por paso) en 2 GPU NVIDIA RTX PRO 4500 Blackwell. El dataset principal es FineWeb-Edu, con un reescalado adicional de datos educativos durante la fase de decaimiento. El optimizador es Muon para las matrices ocultas 2D (atencion y MLP) y AdamW para embeddings, cabeza de salida, normalizaciones y los escalares `vr_lambda`. El schedule es WSD (estable y despues decaimiento en aproximadamente el 21% final de los pasos); el checkpoint final (paso 48.000) es el mejor, con la perplejidad de validacion tocando minimo al final del decaimiento. No se documenta ninguna fase de RLHF, DPO o ajuste por instrucciones: es un modelo estrictamente preentrenado.

Nota critica de carga: el modelado personalizado de los value residuals no lo interpreta el `from_pretrained` estandar. Si se carga sin `trust_remote_code=True`, esa ruta de atencion se descarta silenciosamente y el rendimiento cae aproximadamente 6 puntos en ARC-Easy y 0,18 en perplejidad por byte.

## Capacidades

- Generacion de texto autoregresiva en ingles, como modelo base de completado (no es un modelo de chat ni sigue instrucciones).
- Modelado de lenguaje de alta calidad para su tamano: 1,8735 de perplejidad por byte en WikiText-2, la mejor de la familia Jugnu.
- Juicios de aceptabilidad gramatical: 82,52 de exactitud en BLiMP, el mejor resultado de la familia.
- Razonamiento de sentido comun y conocimiento elemental a nivel de primaria: 55,13 de exactitud en ARC-Easy.
- Capacidad de puntuar texto (scoring / perplejidad) para filtrado y evaluacion de calidad de datos.
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni ajuste para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles segun la etiqueta de idioma del modelo.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Extensibilidad: al ser un modelo base Apache-2.0 con codigo de modelado abierto, es apto para fine-tuning posterior en tareas concretas.

## Casos de uso

- Filtrado y curación de corpus: usar el modelo como scorer de perplejidad por byte para descartar documentos de baja calidad antes de entrenar modelos mayores. Su 1,8735 de byte-ppl y su coste de ejecucion minimo lo hacen adecuado para preprocesar grandes volumenes de texto.
- Prototipado de pipelines de generacion: validar plantillas de prompts, tokenizadores y flujos de inferencia con un modelo de 110M antes de escalar a modelos de miles de millones de parametros, ya que comparte tokenizador SmolLM2 (49.152 tokens) con modelos mas grandes de esa familia.
- Investigacion sobre value residuals: el checkpoint es un banco de pruebas directo para medir el efecto de las residuales de value frente a un baseline identico sin ellas, con escalas `vr_lambda` inspeccionables y comparables entre capas.
- Estudio de optimizadores en regimen tiny: comparar Muon frente a AdamW en matrices 2D con un presupuesto de 25,2B tokens y un schedule WSD documentado, en hardware de gama profesional pero acotado.
- Evaluacion reproducible en CI: integrar el modelo en pruebas automatizadas de `lm-eval-harness` (BLiMP, ARC-Easy, WikiText) para verificar que una refactorizacion del codigo de atencion no degrada el comportamiento numerico esperado.
- Fine-tuning de dominio con presupuesto bajo: al ser un modelo base de 0,4 GB en safetensors, se puede afinar en una unica GPU de consumo para tareas de clasificacion, extraccion o generacion restringida en ingles.
- Correccion o filtrado de fluidez gramatical: su 82,52 en BLiMP permite usarlo como discriminador de aceptabilidad para prefiltrar texto generado por otros sistemas.
- Demos y entornos educativos: su huella de memoria inferior a 1 GB permite ejecutarlo en portatiles, notebooks y contenedores ligeros para docencia sobre arquitecturas transformer.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluacion VR-aware con `lm-eval-harness`; BLiMP y ARC-Easy en `acc`; WikiText con `byte_perplexity`):

| Metrica | JugnuLM-110M-R2+ | Baseline JugnuLM-110M (R0) | Diferencia |
|---|---|---|---|
| Parametros | 109,7M | 109,7M | igual |
| BLiMP (acc) | 82,52 | aproximadamente 81,22 | +1,3 |
| ARC-Easy (acc) | 55,13 | aproximadamente 52,48 | +2,65 |
| WikiText-2 (byte-ppl) | 1,8735 | 1,95 | -0,0765 (mejor) |

Los valores del baseline R0 se derivan de los deltas que reporta el autor, no se publican de forma directa en la informacion disponible.

Puntuacion de eficiencia de la Tiny-ML Leaderboard:

| Modelo | EFF |
|---|---|
| JugnuLM-110M-R2+ | 80,21 |
| GPT-X2-125M | 80,06 |
| Haidass-143M | 79,83 |

El autor califica la ventaja sobre GPT-X2-125M y Haidass-143M como estrecha y dentro del ruido de la evaluacion, atribuyendo parte del liderazgo al bonus por tamano. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 0,22 GB en bf16/fp16 y 0,44 GB en fp32 para los 109,7M de parametros. El repositorio ocupa 0,4 GB, lo que sugiere pesos en bf16/fp16.
- VRAM estimada para inferencia: por debajo de 1 GB en bf16 incluyendo cache KV y activaciones, con longitudes de contexto moderadas. Si se cuantiza a int8 el peso baja a unos 0,11 GB y a int4 a unos 0,055 GB, aunque no se publican cuantizaciones oficiales.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU con memoria suficiente.
- GPU recomendadas para entrenamiento desde cero: 2 GPU NVIDIA RTX PRO 4500 Blackwell, la configuracion usada por el autor. Para fine-tuning bastaria una GPU de consumo con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el unico camino documentado por el autor. El soporte en vLLM, TGI, llama.cpp u Ollama no esta confirmado y es poco probable sin reimplementar la ruta de los value residuals; la conversion a GGUF requeriria anadir esa ruta al runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. A modo de referencia estructural, un modelo denso de 110M con 23 capas y 576 de hidden es varias veces mas rapido que cualquier modelo de 1B en el mismo hardware, pero no se publican cifras medidas.

## Comparativa con modelos similares

La comparativa se limita a los modelos para los que la informacion disponible aporta datos. No se dispone de especificaciones completas de GPT-X2-125M ni de Haidass-143M (contexto, licencia o formato de pesos).

| Modelo | Parametros | Contexto | BLiMP / ARC-Easy / WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JugnuLM-110M-R2+ | 109,7M | no disponible | 82,52 / 55,13 / 1,8735 | Apache-2.0 | HuggingFace, safetensors con codigo custom |
| JugnuLM-110M (R0, baseline) | 109,7M | no disponible | aprox. 81,22 / 52,48 / 1,95 | no disponible en esta ficha | HuggingFace (modelo base declarado) |
| GPT-X2-125M | 125M (segun nombre) | no disponible | EFF 80,06 (resto no disponible) | no disponible | Tiny-ML Leaderboard |
| Haidass-143M | 143M (segun nombre) | no disponible | EFF 79,83 (resto no disponible) | no disponible | Tiny-ML Leaderboard |

No se dispone de datos suficientes para comparar con alternativas ampliamente conocidas del mismo rango (por ejemplo modelos tiny de otras familias) sin salir de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base, no afinado por instrucciones: no sigue ordenes ni mantiene formato de chat de serie; usarlo como asistente requiere fine-tuning previo.
- Solo ingles: la unica etiqueta de idioma es `en`; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera pobre.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin medirla empiricamente.
- Riesgo de alucinacion alto: con 109,7M de parametros y 25,2B tokens, el conocimiento factual es muy limitado; ARC-Easy en 55,13 refleja un nivel de conocimiento elemental, no experto.
- Carga no estandar: omitir `trust_remote_code=True` degrada el modelo de forma silenciosa (aproximadamente 6 puntos de ARC-Easy y 0,18 de byte-ppl). Ademas, ejecutar codigo remoto implica revisar el `modeling_*.py` del repositorio antes de usarlo en produccion.
- Ecosistema de despliegue limitado: al no publicarse cuantizaciones GGUF ni soporte confirmado en vLLM, TGI, llama.cpp u Ollama, la integracion en produccion exige trabajo adicional de adaptacion del runtime.
- Benchmarks con alcance reducido: BLiMP y ARC-Easy son pruebas pequenas y la propia ventaja en EFF se describe como dentro del ruido estadistico frente a GPT-X2-125M y Haidass-143M. La metrica de byte-perplejidad no es directamente comparable con perplejidades por token de otros modelos.
- Sesgos: no se documenta ningun analisis de sesgos ni de composicion demografica del dataset mas alla de FineWeb-Edu; los sesgos de ese corpus se heredan.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene conservar los avisos de licencia y de atribucion.
- Metadatos: las fechas del repositorio (creacion y actualizacion en septiembre de 2026) y el contador de descargas y likes (cero) son los que figuran en HuggingFace en el momento de la consulta; el modelo es muy reciente y practicamente sin adopcion publica.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los enlaces recuperados no guardan relacion alguna con el), por lo que toda la informacion tecnica procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/altslate/JugnuLM-110M-R2plus
- Modelo base: https://huggingface.co/altslate/JugnuLM-110M
- Repositorio de codigo y receta de entrenamiento: https://github.com/AltSlate-Labs/jugnu
- Organizacion AltSlate Labs: https://github.com/AltSlate-Labs
- Paper de ResFormer (value residuals): https://arxiv.org/abs/2410.17897
- Tiny-ML Leaderboard: https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador SmolLM2 (referencia del vocabulario de 49.152 tokens): no disponible como enlace directo en la informacion proporcionada
