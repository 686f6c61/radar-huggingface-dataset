# fjolsvin/qwen3.5-9b-general-forged-tiiny

## Resumen

`fjolsvin/qwen3.5-9b-general-forged-tiiny` es un derivado de `continuum-ai/qwen3.5-9b-general-forged`, a su vez un ajuste fino del modelo base `Qwen/Qwen3.5-9B` de Alibaba. El autor, fjolsvin, no ha entrenado el modelo: se limita a reempaquetarlo para que el importador de Hugging Face de la plataforma Tiiny lo acepte como fine-tune del modelo de tienda `Qwen/Qwen3.5-9B`. El resultado es un checkpoint de 8.953.803.264 parámetros (unos 9B) con licencia Apache 2.0 y pipeline declarado `image-text-to-text`.

El modelo original se presenta como un proceso de "forja" (forge) mediante la técnica que el autor denomina Experiential Plasticity: un pipeline `prune → train` de un ciclo con poda de cabezas por entropía (0% de cabezas podadas, es decir, sin reducción real de parámetros) y 500 pasos de entrenamiento con learning rate 5e-05 sobre el modelo base. El autor reporta una mejora de perplejidad de 12,98 a 9,79 (-24,6%) en un benchmark de propósito general, con verificación criptográfica de la cadena de custodia mediante el sistema ForgeAlloy (nivel de confianza "self-attested", es decir, autoinformado).

La relevancia de esta ficha es limitada pero informativa: se trata de un artefacto de reempaquetado, con cero descargas y cero likes en el momento de la consulta, que ilustra prácticas de distribución de modelos orientadas a dispositivos de borde (móvil, Apple Silicon, Raspberry Pi) y a la trazabilidad criptográfica de pesos. No debe confundirse con un modelo oficial de Qwen ni con un ajuste fino validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de capas y atención no disponibles) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, Q8_0, Q4_K_M (mencionados en la model card); GGUF vía llama.cpp |
| Idiomas soportados | inglés y chino (etiquetas de la model card); multilingüe según tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 tras el cast); también distribuido en GGUF para llama.cpp/Ollama/LM Studio |
| Librería | transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B |
| Modelo fuente | continuum-ai/qwen3.5-9b-general-forged (commit 229ff6612123) |
| Tamaño del repo | 18,8 GB |
| Fecha de creación | 2026-11-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer de Qwen3.5-9B, sobre el que se aplicó un pipeline de poda de cabezas por entropía y un ajuste fino de 500 pasos con learning rate 5e-05 durante un único ciclo. La poda resultó en un 0% de cabezas eliminadas, por lo que el número de parámetros no se redujo respecto al modelo base; la mejora reportada de perplejidad (de 12,98 a 9,79) proviene exclusivamente del breve ajuste fino, no de una compactación estructural. No se documentan el número ni la composición de los tokens de entrenamiento, ni si hubo RLHF, DPO o preferencias humanas.

El reempaquetado de fjolsvin introduce cambios puramente de formato: 379 tensores se convierten de F16 a BF16 (redondeo a par más cercano), se añaden 333 tensores de la torre visual de `Qwen/Qwen3.5-9B` (0,91 GB, `model.visual.*`) como `model-graft-from-base.safetensors` porque la fuente era solo texto, y se copian `merges.txt`, `vocab.json`, `preprocessor_config.json` y `video_preprocessor_config.json` del modelo base. El `config.json` es el del base. El pipeline se cambia de `text-generation` a `image-text-to-text` y la librería de `mlx` a `transformers`. No hay innovaciones técnicas propias más allá de la trazabilidad Merkle-chained de ForgeAlloy.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de Qwen3.5-9B.
- Generación de código (el ejemplo de la model card muestra completado de `def merge_sort(arr):`).
- Capacidad multimodal imagen-texto declarada en el pipeline, gracias a los tensores visuales injertados del modelo base.
- Soporte multilingüe, con inglés y chino explícitamente etiquetados.
- Ejecución en dispositivos de borde: móvil (iPhone/Android), Apple Silicon (MLX), Raspberry Pi, consumer GPU.
- Compatibilidad con llama.cpp, Ollama y LM Studio mediante pesos GGUF.
- Cadena de custodia criptográfica verificable (ForgeAlloy, `self-attested`).
- Tool calling, function calling, modo thinking, agentes multi-paso, audio y matemáticas avanzadas: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en móvil: con cuantización Q4_K_M (~2,5 GB) el modelo cabe en un iPhone o Android moderno y permite conversaciones multi-turno sin conexión, adecuado para privacidad de datos.
- Inferencia en portátil Apple Silicon: en un MacBook Air de 16 GB con Q8_0 (~4 GB) se puede desplegar vía MLX o llama.cpp para tareas de redacción y resumen ofimático.
- Prototipado en Raspberry Pi: la variante Q4_K_M permite experimentar con generación de texto en hardware de bajo consumo, útil para demostraciones educativas.
- Generación de código asistida en local: el modelo completa funciones (p. ej. algoritmos de ordenación) y puede integrarse en editores con backend llama.cpp sin enviar código a la nube.
- Evaluación de pipelines de forja y trazabilidad: sirve como caso de estudio para verificar cadenas de custodia Merkle-chained y reproducibilidad de pesos.
- Distribución en tiendas de modelos: el reempaquetado demuestra cómo adaptar un checkpoint a los requisitos de importación de una plataforma (BF16, tensores visuales, tokenizador) sin reentrenar.
- Experimentación multimodal básica: al incorporar la torre visual del base, permite probar entradas imagen-texto en entornos `transformers`, aunque sin garantías de calidad al no haberse ajustado conjuntamente.

## Benchmarks y rendimiento

| Benchmark | Modelo forjado | Base | Delta | Verificación |
|---|---|---|---|---|
| Perplejidad (general) | 9,79 | 12,98 | -24,6% | Autoinformado (self-reported) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El único dato es la perplejidad autoinformada, sin especificar el corpus de evaluación, por lo que no es comparable de forma rigurosa con otros modelos.

## Requisitos de hardware

- VRAM estimada para fp16: ~18 GB (9B parámetros × 2 bytes), más overhead de activaciones.
- VRAM estimada para Q8_0: ~9 GB; para Q4_K_M: ~5 GB.
- GPU recomendadas: NVIDIA RTX 5090 (verificada por el autor en fp16); A100/H100 sobradas para fp16; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Consumer GPU: sí, en RTX 4090/5090 para fp16; en GPUs de 8-12 GB solo con cuantización Q4/Q8.
- Apple Silicon: MacBook Pro 32 GB en fp16 (8,0 GB según la card), MacBook Air 16 GB en Q8_0 (~4,0 GB), MacBook Air 8 GB en Q4_K_M (~2,5 GB).
- Móvil y embebido: iPhone/Android y Raspberry Pi con Q4_K_M (~2,5 GB).
- Opciones de despliegue: transformers, llama.cpp, Ollama, LM Studio, MLX (librería original de la fuente).
- Latencia y throughput: no disponibles; la model card solo indica "Verified" o "Expected" sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fjolsvin/qwen3.5-9b-general-forged-tiiny | ~9B | no disponible | Apache 2.0 | HF (0 descargas) | Reempaquetado, multimodal por injerto, perplejidad 9,79 autoinformada |
| continuum-ai/qwen3.5-9b-general-forged | ~9B | no disponible | Apache 2.0 | HF | Fuente directa, solo texto, pipeline `text-generation`, MLX |
| Qwen/Qwen3.5-9B | ~9B | no disponible | Apache 2.0 (según base) | HF | Modelo base oficial, sin poda ni ajuste adicional |

No se dispone de datos de benchmarks comparables ni de otros modelos de la misma categoría en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La mejora de perplejidad es autoinformada y no ha sido validada de forma independiente; el nivel de confianza de la cadena de custodia es "self-attested".
- La poda eliminó el 0% de cabezas, por lo que no hay reducción real de parámetros ni de tamaño respecto al base; el nombre "tiiny" y la etiqueta "pruned" pueden inducir a error.
- El ajuste fino fue de solo 500 pasos y un ciclo, insuficiente para garantizar mejoras generales fuera del corpus de evaluación.
- La torre visual se injerta del base sin ajuste conjunto; la calidad multimodal no está validada y el pipeline `image-text-to-text` puede no funcionar correctamente.
- Riesgo de alucinación propio de un modelo de 9B sin RLHF documentado; no se han publicado evaluaciones de seguridad, sesgo o toxicidad.
- Idiomas: solo inglés y chino etiquetados explícitamente; el rendimiento en castellano no está verificado.
- Contexto máximo no documentado; no se debe asumir una ventana larga sin comprobación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el autor del reempaquetado no ofrece garantías; conviene conservar los avisos de atribución a Qwen y a continuum-ai.
- Cero descargas y cero likes en el momento de la consulta: sin comunidad que valide el artefacto; no recomendable para producción sin pruebas propias.
- El repositorio ocupa 18,8 GB por incluir pesos en varios formatos y los tensores visuales; verificar el espacio antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fjolsvin/qwen3.5-9b-general-forged-tiiny
- Modelo fuente: https://huggingface.co/continuum-ai/qwen3.5-9b-general-forged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Verificación de cadena de custodia: https://cambriantech.github.io/forge-alloy/verify/#abfc8de0afe02b22
- Repositorio ForgeAlloy: https://github.com/CambrianTech/forge-alloy
- Especificación de atestación: https://github.com/CambrianTech/forge-alloy/blob/main/docs/ATTESTATION.md
- Repositorio Continuum: https://github.com/CambrianTech/continuum
- Paper de metodología: https://github.com/CambrianTech/continuum/blob/main/docs/papers/PLASTICITY-COMPACTION.md
- Catálogo de modelos del autor de la forja: https://huggingface.co/continuum-ai
