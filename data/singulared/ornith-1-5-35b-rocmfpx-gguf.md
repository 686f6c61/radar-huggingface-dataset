# singulared/Ornith-1.5-35B-ROCmFPX-GGUF

## Resumen

Ornith-1.5-35B-ROCmFPX-GGUF es una cuantización GGUF del modelo MoE Ornith-1.5-35B-A3B, desarrollada por el usuario singulared para ejecutarse en hardware AMD Strix Halo (GPU Radeon 8060S, arquitectura gfx1151). El modelo base, creado por DeepReinforce (ornith-ai), es un transformer de mezcla de expertos con 35.5 mil millones de parámetros totales y aproximadamente 3 mil millones activos, que extiende el marco de auto-scaffolding de Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones que aprovecha los nuevos tipos de tensor ROCmFPX (FP4 y FP6) para hardware AMD, con una estrategia híbrida que asigna distinta precisión según la clase de tensor: los expertos ruteados (que son escasos, 8 de 256 activos por token) se quedan en FP4, mientras que atención, experto compartido y embeddings reciben FP6 al estar en la ruta crítica de cada token. Incluye además la cabeza MTP (Multi-Token Prediction) nativa del modelo base para decodificación especulativa, manteniendo una ventana de contexto de 131072 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con 256 expertos, 8 activos por token, cabeza MTP para decodificación especulativa |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 131072 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (4,27 bpw), Q6_0_ROCMFPX (FP6, 4,41 bpw en híbrido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 256 expertos de los que se activan 8 por token, un shared expert común y una cabeza MTP (Multi-Token Prediction) integrada en el bloque 40 (`blk.40.nextn.*`) que permite decodificación especulativa sin parches externos. El entrenamiento sigue el marco de auto-mejora de Ornith-1.5: el modelo genera sus propias tareas, construye scaffolds específicos y produce rollouts de solución para un bucle de aprendizaje por refuerzo, en lugar de depender únicamente de datos estáticos. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

La cuantización ROCmFPX introduce dos variantes principales: la híbrida (`HYBRID`) asigna `Q6_0_ROCMFPX` (FP6, 6 bits) a atención (104 tensores), shared expert (123), embeddings (2) y cabeza MTP, mientras los 123 tensores de expertos ruteados usan `Q4_0_ROCMFP4_FAST` (4,25 bpw); la variante `FAST` aplica FP4 a todo el modelo. La cabeza MTP se mantiene en FP4, lo que según las mediciones del autor no degrada la perplejidad (7.7749 idéntica a Q8_0) e incluso mejora la tasa de aceptación del draft (0,78–0,80 frente a 0,73–0,77).

## Capacidades

- Generación de texto y razonamiento multi-step con ventana de contexto de 131072 tokens.
- Decodificación especulativa mediante cabeza MTP nativa, con tasa de aceptación de draft de 0,78–0,80 en FP4.
- Capacidades agénticas y de codificación (SWE) reportadas por el autor del modelo base, aunque no hay benchmarks concretos en la información disponible.
- Soporte de tool calling y function calling no confirmado explícitamente en esta cuantización, pero probable por la arquitectura del modelo base.
- Multilingüe: no hay datos de idiomas soportados en la documentación.
- Optimización específica para hardware AMD Strix Halo (gfx1151) mediante backend Vulkan o HIP con ROCm.

## Casos de uso

- **Digestión de documentos y repositorios de código**: la variante híbrida ofrece 990,9 t/s de prefill a 8,5K tokens, lo que permite ingerir grandes repositorios o documentos extensos en segundos. Adecuado para asistentes de código que necesitan entender un proyecto completo antes de responder.
- **Chat de largo contexto**: con 131072 tokens de ventana, puede mantener conversaciones multi-turno de horas sin perder el hilo, ideal para agentes de atención al cliente que requieren recordar toda la interacción.
- **Generación de código en producción**: la variante FAST alcanza 87,7 t/s de decode a 8,5K de contexto, suficiente para autocompletar código en tiempo real en un IDE o en pipelines de CI/CD que generen tests o parches.
- **Búsqueda y recuperación en documentos largos**: las pruebas needle-in-a-haystack pasan a 8,5K, 34,5K y 69,5K tokens en ambas variantes, lo que lo hace viable para RAG sobre bases de conocimiento extensas.
- **Desarrollo de agentes autónomos**: la capacidad de self-scaffolding del modelo base permite que el agente genere sus propias herramientas y flujos de trabajo, con la decodificación especulativa para reducir la latencia en bucles de razonamiento multi-paso.
- **Prototipado de investigación en hardware AMD**: al ser una cuantización GGUF con licencia Apache 2.0, permite experimentar con MoE de 35B en una GPU integrada de Strix Halo sin necesidad de servidores con GPUs NVIDIA, lo que facilita la evaluación local de capacidades de razonamiento y agencia.

## Benchmarks y rendimiento

La información disponible incluye mediciones de perplejidad en wikitext-2 (145 chunks, contexto 2048, corpus idéntico, backend Vulkan) y velocidades en Radeon 8060S (gfx1151) con Vulkan y MTP activado.

**Perplexity (wikitext-2)**

| Variante | bpw | Tamaño | PPL |
|---|---|---|---|
| HYBRID (Q6_0_ROCMFPX) | 4,41 | 18,21 GiB | 7,3991 ± 0,0506 |
| ROCMFP4_FAST | 4,27 | 17,65 GiB | 7,7749 ± 0,0539 |
| ROCMFP4_COHERENT | 4,55 | 18,81 GiB | 7,8233 ± 0,0550 |
| ROCMFP4_STRIX | 4,31 | 17,81 GiB | 7,8307 ± 0,0547 |

**Velocidad (Radeon 8060S, Vulkan, MTP n4, -ub 2048)**

| Variant | 8,5K pp/tg (t/s) | 34K pp/tg (t/s) | 69K pp/tg (t/s) |
|---|---|---|---|
| HYBRID | 990,9 / 63,0 | 815,9 / 55,6 | 488,4 / 45,2 |
| FAST | 993,9 / 87,7 | 813,3 / 67,3 | 478,9 / 56,3 |

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización en la información disponible. El autor del modelo base menciona rendimiento «on par con Claude Opus 4.8» en razonamiento, codificación y tareas agénticas, pero sin cifras concretas.

## Requisitos de hardware

- **GPU objetivo**: AMD Strix Halo (gfx1151), concretamente la Radeon 8060S integrada. No está pensado para GPUs NVIDIA; los tipos de tensor ROCmFPX requieren soporte de hardware AMD.
- **VRAM**: 17,65 GiB para la variante FAST, 18,21 GiB para la híbrida. Con `-ngl 99` se descarga todo en VRAM; en Strix Halo la memoria es compartida con la CPU, por lo que el límite real depende de la RAM del sistema.
- **Backend recomendado**: Vulkan. En las pruebas del autor, Vulkan supera a HIP ROCm 7.2.4 en decode (87,7 vs 72,7 t/s a 8,5K) y no requiere contenedores. HIP ROCm 10.1 nightly gana en prefill (+12%) pero pierde en decode (−34% frente a Vulkan).
- **Opciones de despliegue**: llama.cpp con build ROCmFPX personalizado (mainline llama.cpp no reconoce los tipos `Q4_0_ROCMFP4_*` ni `Q6_0_ROCMFPX`). El servidor `llama-server` es la opción estándar, con flags para activar decodificación especulativa (`--spec-type draft-mtp --spec-draft-n-max 4`).
- **Latencia y throughput**: decode de 45 a 87 t/s según contexto y variante; prefill de 478 a 993 t/s. La variante FAST es ~28% más rápida en decode que la híbrida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | PPL (wikitext-2) | Decode (t/s) | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (BF16) | 35,5B (3B activos) | 131072 | Apache 2.0 | — | — | Base, no cuantizado |
| Ornith-1.5-35B-ROCmFPX (HYBRID) | 35,5B (3B activos) | 131072 | Apache 2.0 | 7,3991 | 63,0 | Cuantización híbrida FP4/FP6 |
| Ornith-1.5-35B-ROCmFP4-FAST | 35,5B (3B activos) | 131072 | Apache 2.0 | 7,7749 | 87,7 | Cuantización FP4 completa |
| Ornith-1.0-35B (ROCmFP4-COHERENT) | 35,5B (3B activos) | no disponible | no disponible | 6,19 | 86,7 | Mejor PPL y decode, peor agéntico |

Ornith 1.0 supera a 1.5 en perplejidad (6,19 vs 7,40) y en velocidad de decode (86,7 vs 87,7 t/s con mejor aceptación de draft 0,88 vs 0,78–0,80). El autor de la cuantización recomienda 1.5 solo para cargas agénticas/SWE; para modelado de prosa, 1.0 es mejor. No hay comparativa con otros modelos MoE de 35B (como Qwen 35B-A3B) en la información disponible.

## Limitaciones y advertencias

- **Perplejidad superior a Ornith-1.0**: en BF16, 1.5 ya es peor que 1.0 (7,40 vs 6,19), por lo que la diferencia no es culpa de la cuantización sino de los pesos del modelo. Para tareas de prosa o modelado de lenguaje, Ornith-1.0 es preferible.
- **Hardware restringido**: los tipos de tensor ROCmFPX solo funcionan en AMD Strix Halo (gfx1151) con un build modificado de llama.cpp. No es portable a NVIDIA ni a AMD más antiguos sin re-cuantizar.
- **Backend Vulkan necesario**: HIP ROCm 7.2 pierde un 17% en decode; ROCm 10.1 nightly pierde un 34%. Vulkan es la única opción que mantiene el rendimiento completo y no requiere contenedor.
- **Riesgo de alucinación**: no hay datos específicos, pero es un modelo de 35B con 3B activos; los MoE pequeños pueden alucinar más en tareas de razonamiento que modelos densos del mismo tamaño total.
- **Sesgos**: no se han publicado evaluaciones de sesgo para esta cuantización ni para el modelo base.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones de atribución, pero el autor de la cuantización (singulared) no ofrece garantías de calidad ni soporte.
- **Caveat de producción**: la perplejidad mide predicción de siguiente token, no capacidad agéntica. Las afirmaciones de rendimiento agéntico del modelo base (comparado con Claude Opus 4.8) no están respaldadas por benchmarks públicos en la documentación.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/singulared/Ornith-1.5-35B-ROCmFPX-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio de Ornith AI: https://ornith.ai/
- Repo de ROCmFPX (llama.cpp modificado): https://github.com/charlie12345/ROCmFPX
- Cuantización alternativa ROCmFP4-STRIX_LEAN: https://huggingface.co/pugant/Ornith-1.5-35B-ROCmFP4-STRIX_LEAN
