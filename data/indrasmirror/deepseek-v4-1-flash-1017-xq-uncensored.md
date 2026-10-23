# IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-XQ-Uncensored es una cuantización mixta calibrada del modelo MoE deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario IndrasMirror. Su objetivo es hacer correr un modelo de arquitectura mixta de gran escala (40 capas con 384 expertos enrutados cada una, top-6 por token, experto compartido, Hyper-Connections, atención dispersa CSA y memoria n-gram Engram) en un solo PC de consumo: una RTX 4090 de 24 GB más 90 GB de RAM y NVMe. El autor cifra el modelo base en 552B parámetros, aunque otras fichas del mismo checkpoint indican 763B; el indexado de safetensors del repo informa 14.710.631.010, una cifra que no cuadra con ninguna de las dos y que probablemente refleja un indexado parcial.

El interés técnico está en la receta de cuantización: cada proyección gate/up y down de cada experto recibe su propio formato (ternario PTQ1_0 a 1,75 bits para el 62,4% de los pesos de experto, Q2_0 a 2,25 bits para el 24,7% y Q3_K a 3,44 bits para el 13,0%), con una media de 2,093 bits por peso y un presupuesto de 132,4 GiB para expertos. La mitad densa (atención, experto compartido, cabeza de salida) se mantiene en Q8_0, los embeddings y el compresor/indexer en F16, y normas, router y mHC en F32. El método se denomina XQ (Xolotl Quant) y combina códigos de GPTQ con una asignación de tiers por presupuesto inspirada en RCO (arXiv:2605.00649).

Sobre el checkpoint base se aplica además una edición de dirección de rechazo de rango 2 al estilo mrfakename, que da lugar al sufijo "Uncensored". El resultado no es un GGUF convencional: usa tipos por experto que llama.cpp, Ollama y LM Studio no cargan, y requiere el motor Xolotl (antes Strata-DSV4.1), construido sobre Strata.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE: 40 capas, 384 expertos enrutados por capa (top-6 por token), experto compartido, Hyper-Connections, atención dispersa CSA, memoria n-gram Engram |
| Parámetros totales | 552B según el autor de la cuantización; 763B según la ficha del modelo base; el indexado de safetensors del repo informa 14.710.631.010 (dato no consistente con las otras dos cifras) |
| Parámetros activos | No disponible como cifra exacta; top-6 sobre 384 expertos enrutados más experto compartido, por capa |
| Longitud de contexto | No disponible |
| Tipos de cuantización | XQ mixta por experto: PTQ1_0 ternaria (1,75 bits, 62,4% de los pesos de experto), Q2_0 (2,25 bits, 24,7%), Q3_K (3,44 bits, 13,0%); media 2,093 bits por peso. Mitad densa en Q8_0; embeddings, compresor e indexer en F16; normas, router y mHC en F32 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF particionado con tipos por experto propietarios (no compatible con llama.cpp, Ollama ni LM Studio); requiere el motor Xolotl |
| Tamaño del repositorio | 329,3 GB (incluye los builds v2/ de 152 GB / 142 GiB y v3/ de 163 GB / 152 GiB) |
| Presupuesto de expertos | 132,4 GiB (frente a ~142 GiB de un Q2_0 uniforme equivalente) |
| Descargas / likes | 2923 / 14 |
| Fechas | Creado el 2026-10-18; actualizado el 2026-10-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint DeepSeek-V4.1-Flash-1017: 40 capas con 384 expertos enrutados cada una y enrutamiento top-6 por token, un experto compartido, Hyper-Connections, atención dispersa CSA y una memoria n-gram denominada Engram. Los 15.360 expertos enrutados suman 543,6B pesos, que incluso en su FP4 nativo exceden la RAM de cualquier PC de consumo; de ahí la necesidad de una cuantización agresiva y selectiva. La model card del autor no detalla el número de tokens de entrenamiento, la composición del dataset original ni si hubo RLHF o DPO en el modelo base.

El trabajo de cuantización sí está descrito con detalle. Los códigos provienen de GPTQ; la asignación de formato por experto es un "RCO-lite" que respeta exactamente un presupuesto de bits, y el conjunto de calibración se pondera hacia tráfico de chat. Respecto a Q2_0 uniforme, la asignación logra un 20,9% menos de error de salida en el proxy de calibración (1,7663 frente a 2,2318) con unos 10 GiB menos. Las capas 20-31 y 33-35 se tratan con más suavidad (como máximo el 85% de las proyecciones de experto en ternario) para proteger la calidad de texto conversacional, a costa de un 4,8% peor error de proxy y 2 GiB más que la selección sin tope. Sobre el checkpoint se aplica una edición de dirección de rechazo de rango 2 al estilo mrfakename. El autor anuncia una segunda etapa de XQ, con refinamiento de estilo GSQ (códigos y escalas aprendidos sobre los tokens enrutados de cada experto, a través de la salida SwiGLU real), que se publicará como carpeta independiente cuando esté medida.

## Capacidades

- Generación de texto y razonamiento: heredadas del checkpoint DeepSeek-V4.1-Flash-1017, cuya ficha oficial reporta mejoras en razonamiento, coding, tareas agénticas y benchmarks visuales frente a V4.1-Flash.
- Código y tareas de ingeniería de software: el conjunto de calibración del build V3 se construyó con una mezcla de aproximadamente 40% código y 30% agentes/uso de herramientas, incluyendo trayectorias de SWE-rebench, SWE-Hero, SWE-smith, OpenCodeReasoning y el set agéntico de Swift-1.5.
- Uso agéntico y multi-paso: el autor evalúa con un "Gauntlet" de tareas agénticas duras; en V3 las tareas 03 y 07 seguían sin resolverse.
- Capacidades visuales: la ficha del modelo base menciona mejoras en benchmarks visuales, aunque la cuantización no documenta el tratamiento de la torre de visión.
- Multilingüismo: no hay información sobre idiomas en la model card de esta cuantización.
- Modo "uncensored": la edición de dirección de rechazo de rango 2 reduce el comportamiento de rechazo del checkpoint base.
- Decodificación especulativa mediante DSpark: ~3,1 tokens por pasada en el build V3.
- No soporta los runtimes estándar de GGUF; el tool calling y el formato de plantilla deben gestionarse a través de Xolotl.

## Casos de uso

- Inferencia local de un MoE de gran escala en una sola estación de trabajo: el caso de uso declarado por el autor. Una RTX 4090 (24 GB) más 90 GB de RAM y NVMe permiten ejecutar el build V3 a 22,3 tok/s de decodificación, algo inviable con el checkpoint en FP4.
- Experimentación en cuantización extrema: el repo sirve como referencia reproducible para investigar asignación de bits por experto, comparando los builds v2/ y v3/ con sus respectivas puertas de perplejidad y top-1.
- Evaluación de Robustez y seguridad: al incorporar una edición de dirección de rechazo, es útil para estudiar cómo se comporta un modelo sin alineamiento de rechazo en tareas de red teaming controlado.
- Desarrollo de motores de inferencia alternativos: el modelo solo funciona con Xolotl/Strata, por lo que es un banco de pruebas para quienes trabajan en offloading de expertos a RAM y en decodificación especulativa (DSpark).
- Automatización de tareas de código en local: el calibrado con un 40% de código y datasets tipo SWE lo orienta a flujos de reparación de bugs y razonamiento sobre repositorios, siempre que se acepte el throughput de ~22 tok/s.
- Investigación sobre degradación por cuantización: las métricas publicadas (perplejidad, top-1, KL frente al modelo completo) permiten estudiar la relación entre bits por experto y calidad final en arquitecturas MoE dispersas.
- Archivado y replicación de recetas: la licencia MIT permite reutilizar la metodología XQ y la asignación de tiers en otros checkpoints.

## Benchmarks y rendimiento

| Métrica | V2 (152 GB) | V3 (163 GB) | Profesor (referencia) |
|---|---|---|---|
| Perplejidad (head gate) | 6,93 | 6,72 | 6,57 (V2) / 6,36 (V3) |
| Top-1 agreement | 0,670 | 0,691 | 0,687 (V2) / 0,706 (V3) |
| Delta de perplejidad | +5,5% | +5,7% | — |
| Delta de top-1 | −1,7 pt | −1,5 pt | — |
| Gauntlet corto | 2/5 (tarea 03 = 0,00; 07 = 0,91, sin resolver) | Tarea 03 = 0,00; 07 = 0,95, sin resolver | — |
| Decodificación (Gauntlet) | 26,4 tok/s | 22,3 tok/s | — |
| Prefill | No disponible | ~249 tok/s sobre prompt nuevo de 16,8K | — |
| DSpark | No disponible | ~3,1 tokens/pass | — |
| Error de proxy de la asignación | 1,7663 (vs 2,2318 en Q2_0 uniforme) | — | — |

Los datos de V4 (en curso el 23 de octubre, 4 de 40 capas): error por experto y capa un 29-48% inferior al de la misma capa en V3; el nuevo mapa de tiers reduce la divergencia KL de 0,634 a 0,480 (−24%) y eleva el top-1 agreement de 78,8% a 82,4%. Son medidas provisionales; el autor promete puertas completas (perplejidad, top-1, Gauntlet, velocidad) en la publicación final. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta cuantización.

## Requisitos de hardware

- Configuración mínima declarada: RTX 4090 (24 GB de VRAM) + 90 GB de RAM + almacenamiento NVMe. El build V2 ocupa 152 GB y el V3 163 GB en disco.
- Presupuesto de expertos en memoria: 132,4 GiB para el conjunto de pesos de experto, con offloading a RAM/NVMe gestionado por Xolotl.
- VRAM: no se especifica un reparto exacto; el autor indica que el V3 es más lento (22,3 tok/s frente a 26,4 tok/s) porque caben menos expertos en VRAM.
- GPU recomendadas: RTX 4090 como referencia medida. No hay datos publicados para A100, H100, RTX 3090 u otras.
- Consumer GPU: sí, en el sentido de que se ejecuta con una sola GPU de consumo, pero requiere el acompañamiento de ~90 GB de RAM del sistema; no cabe en una GPU de consumo por sí solo.
- Opciones de despliegue: exclusivamente Xolotl (https://github.com/Indras-Mirror/Xolotl), construido sobre Strata. No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI.
- Throughput medido en Linux con RTX 4090: 26,4 tok/s (V2) y 22,3 tok/s (V3) en decodificación; ~249 tok/s de prefill en V3 sobre un prompt de 16,8K.
- Advertencia del autor sobre Windows: DSpark puede resultar más lento que ejecutar sin él (issue #14 del repositorio Xolotl).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored (este) | 552B (autor) / 763B (ficha del base) | No disponible | XQ mixta 2,093 bpw media, GGUF propietario | MIT | HuggingFace, requiere Xolotl |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763B según featherless.ai | No disponible | FP4 nativo | No disponible en la información | HuggingFace y ModelScope; API desde 0,155 $/M entrada y 0,62 $/M salida |
| Build V4.1 V1 de septiembre (mismo autor) | No disponible | No disponible | XQ, tuerca de referencia del autor | MIT (presumiblemente) | Anunciado como superado por V3 en el Gauntlet |
| Build V4 (anunciado, 26-27 de octubre) | No disponible | No disponible | XQ con refinamiento por experto y nuevo mapa de tiers | MIT | Pendiente de publicación |

No se dispone de datos para comparar con otras cuantizaciones de 2 bits de modelos MoE equivalentes; esa comparación queda como "no disponible".

## Limitaciones y advertencias

- No compatible con llama.cpp, Ollama ni LM Studio: los tipos por experto son propietarios y solo los carga Xolotl. Cualquier intento de usarlo en el ecosistema GGUF estándar fallará.
- Degradación medible: +5,5% a +5,7% de perplejidad y −1,5 a −1,7 puntos de top-1 frente al profesor, con un error de proxy de 1,7663 en la asignación de tiers.
- Tareas agénticas duras sin resolver: la tarea 03 del Gauntlet puntúa 0,00 en V2 y V3, y la 07 no se resuelve en ninguno de los dos builds.
- Inconsistencia en el recuento de parámetros: 552B (autor), 763B (ficha del base) y 14,7B (indexado de safetensors). Verificar antes de dimensionar infraestructura.
- Edición "uncensored": la supresión de la dirección de rechazo implica riesgo elevado de generar contenido dañino, sesgado o legalmente problemático sin filtros; no apta para producción orientada al público sin una capa de moderación externa.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor no publica evaluaciones de factualidad.
- Idiomas y contexto: sin datos declarados, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- Cifras de V4 provisionales: las mejoras del 29-48% de error por capa y la reducción de KL del 24% corresponden a 4 de 40 capas y no constituyen una medición final.
- Rendimiento dependiente de la plataforma: en Windows, DSpark puede degradar la velocidad frente a ejecutar sin decodificación especulativa.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado ni sobre el cumplimiento normativo del contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored
- Árbol de ficheros: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored/tree/main
- Nombre anterior del repositorio (GSQ): https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-GSQ-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Ficha del modelo base en featherless.ai: https://featherless.ai/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Precios de API del modelo base: https://aihubmix.com/model/deepseek-v4.1-flash-1017
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Issues de Xolotl (problema de DSpark en Windows): https://github.com/Indras-Mirror/Xolotl/issues/14
- Strata: https://github.com/Niko1221/Strata
- Paper de RCO: https://arxiv.org/abs/2605.00649
- Implementación de GSQ: https://github.com/IST-DASLab/GSQ
