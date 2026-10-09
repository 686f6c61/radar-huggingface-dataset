# frank8465/Swift-1.5-Qwen3.8-Flash-Next-GPTQ-W4A8-Radiance-AMD-R9700

## Resumen

Swift-1.5-Qwen3.8-Flash-Next GPTQ W4A8 es una cuantización de 4 bits del modelo `ukisai/Swift1.5-Qwen3.8-Flash-Next`, publicada por `frank8465` y empaquetada en formato `.rad` para el motor radiance sobre AMD RDNA4 (`gfx1201`). El checkpoint original en BF16 ocupa 335,3 GiB; esta versión reduce el peso a 113,69 GiB, un factor de 2,95×, mediante GPTQ W4A8 sobre los 49.152 expertos enrutados de una arquitectura MoE. El modelo raíz es `Qwen/Qwen3.8-Flash-Next`, bajo licencia `qwen-community-1.0`.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un MoE de gran tamano en hardware AMD RDNA4 con ROCm, un nicho con menos opciones que CUDA; por otro, documenta una receta de cuantización con 10 millones de tokens de calibración y 24 expertos por capa protegidos en BF16, frente a los 1 millón de tokens y 16 expertos de una cuantización comparable del mismo checkpoint. El resultado declarado es un KL medio de 0,01314 y un 97,92 % de acuerdo top-1 frente al BF16.

La configuración de referencia usa dos Radeon AI PRO R9700 con TP=2, `--max-model-len 200000`, decodificación especulativa MTP y una tabla PLE n-gram en RAM. No se publican parámetros totales, parámetros activos ni longitud de contexto nativa en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer con cabeza MTP de decodificación especulativa; etiquetas de visión. Detalles de capas y atención no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 200.000 tokens en la configuración de referencia (`--max-model-len 200000`); longitud nativa no disponible |
| Tipos de cuantización | GPTQ 4-bit W4A8 en 49.152 expertos enrutados (`w4nl64a8h`, act-order, damping 0,05); troncal y `lm_head` int8; mezclas HC fp8; tabla PLE n-gram fp8 de escala fija; 24 expertos por capa protegidos en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | `swift-open-license-1.0` (`license: other`); el modelo raíz `Qwen/Qwen3.8-Flash-Next` usa `qwen-community-1.0` y sus términos de uso aceptable se aplican aguas abajo |
| Formato de pesos | `.rad` (radiance); no GGUF, no safetensors |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura MoE con 49.152 expertos enrutados, etiquetas de visión y una cabeza MTP de decodificación especulativa. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni el número de parámetros totales o activos. El autor de esta cuantización no entrena el modelo base: parte de `ukisai/Swift1.5-Qwen3.8-Flash-Next` y aplica una receta GPTQ sobre el checkpoint BF16.

La receta cuantiza los 49.152 expertos enrutados a GPTQ 4-bit W4A8 con `w4nl64a8h`, act-order y damping 0,05. La calibración usa 10.000.000 tokens capturados sirviendo el checkpoint BF16 con tráfico mixto de código, prosa y herramientas, diez veces el pase habitual de 1 millón de tokens. Se mantienen 24 expertos por capa en BF16, seleccionados a partir de la cuota de energía de los Grams de calibración (`RADGRAM2`). El troncal y `lm_head` se cuantizan a int8; las mezclas HC a fp8; y la tabla PLE n-gram a fp8 de escala fija, pasando de 95,4 GiB en BF16 a 47,7 GiB. La cabeza MTP de decodificación especulativa viaja dentro del archivo `.rad`. No se documentan fases de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto en inglés.
- Razonamiento, código y prosa: la calibración se realizó con tráfico mixto de código, prosa y herramientas, lo que orienta el modelo a esos dominios, aunque no hay benchmarks estándar publicados en la información disponible.
- Arquitectura MoE con 49.152 expertos enrutados.
- Decodificación especulativa MTP; la configuración de referencia usa `--num-speculative-tokens 2`.
- Capacidades de visión según la etiqueta `vision`; no se detallan resolución, pipeline ni tareas concretas.
- Tool calling / function calling: no documentado explícitamente; la calibración incluye tráfico de herramientas.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: solo `en` según las etiquetas; no se documentan otros idiomas.

## Casos de uso

- Inferencia en clúster AMD RDNA4: desplegar el archivo `.rad` con el motor radiance sobre 2× Radeon AI PRO R9700 en TP=2. Es adecuado porque el formato está optimizado para `gfx1201` y el autor aporta una prueba de ~190 t/s de decodificación a 44,5k de contexto.
- Asistentes de código con contexto largo: analizar repositorios o monorepos completos hasta 200.000 tokens, aprovechando que la calibración incluyó tráfico de código y que la ventana de referencia cubre documentos extensos.
- Revisión y generación de parches en pipelines internos: integrar el motor radiance en un servicio interno para producir explicaciones, diffs y pruebas sobre archivos largos; no hay soporte de tool calling documentado, por lo que la integración sería mediante API del motor.
- Atención al cliente en inglés multi-turno: gestionar conversaciones largas con hasta 200.000 tokens de contexto y decodificación especulativa para reducir latencia en respuestas interactivas.
- Análisis de documentación técnica y normativa: resumir manuales, contratos o especificaciones extensas que quepan en la ventana de 200.000 tokens, con la limitación de que el idioma soportado es inglés.
- Investigación en cuantización: reproducir el gate KLD, comparar la receta de 10M tokens y 24 expertos protegidos frente a la de 1M tokens y 16 expertos, y estudiar el compromiso entre tamaño y divergencia KL.
- Despliegue on-premise con memoria host grande: servir el modelo en infraestructura propia con ~132 GiB de memoria fijada, sin depender de GPUs CUDA ni de servicios en nube.
- Tareas de visión si se confirma el pipeline multimodal: la etiqueta `vision` sugiere capacidades de imagen, pero no hay detalles públicos sobre su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. El autor proporciona métricas de fidelidad frente al BF16 en forma de producción (MNBT 2048, KV fp8), sobre 50.235 posiciones puntuadas de un conjunto disjunto de la calibración.

| Métrica | Valor |
|---|---|
| Divergencia KL media | 0,01314 |
| Acuerdo top-1 | 97,92 % |
| Ratio de perplejidad | 1,0052 |
| Posiciones evaluadas | 50.235 |
| Umbral del gate | 0,03 |
| Segundo gate a MNBT 3072 | Δ ≈ 0,0015 (banda de ruido por orden de coma flotante) |

Comparación con la cuantización del autor del motor sobre el mismo checkpoint:

| Métrica | Este modelo | `StillDeadcode/swift1.5-qwen3.8-next-flash-fp8-iq4r-moe` |
|---|---|---|
| Tokens de calibración | 10.000.000 | 1.000.000 |
| Expertos BF16 protegidos por capa | 24 | 16 |
| KL medio vs BF16 | 0,0131 | 0,0789 |
| Acuerdo top-1 | 97,92 % | 92,9 % |
| Tamaño | 122.071.973.888 B (113,69 GiB) | 122.013.646.848 B (113,68 GiB) |
| Diferencia de tamaño | +55,6 MiB (+0,048 %) | referencia |

## Requisitos de hardware

- Tamano del archivo: 122.071.973.888 bytes (113,69 GiB). El checkpoint BF16 original ocupa 335,3 GiB.
- GPU de referencia: 2× Radeon AI PRO R9700, TP=2, `--tp-wire wht6`.
- Rendimiento declarado: ~190 t/s de decodificación a 44,5k de contexto con la configuración de prueba.
- VRAM en la configuración de referencia: `--vram-weights-mib 26071` y `--vram-kv-mib 3543`.
- Memoria host: `--host-pool-mib 40960` para el pool de expertos; la tabla n-gram fija 47,7 GiB de RAM; el presupuesto total indicado es de ~132 GiB fijados (`LimitMEMLOCK=infinity`).
- Parámetros de ejecución: `--max-model-len 200000`, `--max-num-seqs 3`, `--max-num-batched-tokens 2048`, `--num-speculative-tokens 2`, `--ngram-placement ram`.
- `--max-num-batched-tokens 2048` se describe como una ley del kernel para w4 con tiering en disco, no como un parámetro de ajuste.
- GPU consumer: no disponible. El modelo completo no cabe en GPUs consumer típicas de 24 GB; la Radeon AI PRO R9700 es una GPU de estación de trabajo.
- Opciones de despliegue: únicamente el motor radiance mediante contenedor (Podman/Docker) con ROCm y dispositivos `/dev/kfd` y `/dev/dri`. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Compatibilidad: AMD RDNA4 `gfx1201`; no se documenta soporte CUDA.
- Latencia y throughput: ~190 t/s de decodificación con TP=2 y 44,5k de contexto, según la prueba del autor. No se publican cifras de prefill ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parámetros / activos | Contexto | Cuantización | Calibración | KL vs BF16 | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|---|---|---|
| Este modelo | no disponible | hasta 200.000 tokens en configuración de referencia | GPTQ W4A8, int8, fp8, 24 expertos por capa en BF16 | 10.000.000 tokens | 0,01314 | 113,69 GiB | `swift-open-license-1.0` | `.rad` |
| `StillDeadcode/swift1.5-qwen3.8-next-flash-fp8-iq4r-moe` | no disponible | no disponible | fp8/iq4r MoE | 1.000.000 tokens | 0,0789 | 113,68 GiB | no disponible | no disponible |
| `ukisai/Swift1.5-Qwen3.8-Flash-Next` | no disponible | no disponible | BF16 | no aplica | referencia | 335,3 GiB | `swift-open-license-1.0` | no disponible |
| `Qwen/Qwen3.8-Flash-Next` | no disponible | no disponible | no aplica | no aplica | no aplica | no disponible | `qwen-community-1.0` | no disponible |

## Limitaciones y advertencias

- Licencia `other` con nombre `swift-open-license-1.0`; el modelo raíz `Qwen/Qwen3.8-Flash-Next` impone `qwen-community-1.0` y sus términos de uso aceptable aguas abajo. Es obligatorio revisar ambas licencias antes de un uso comercial.
- Formato `.rad` exclusivo del motor radiance. No es compatible con GGUF, safetensors, vLLM, llama.cpp, Ollama ni TGI.
- Dependencia de hardware AMD RDNA4 `gfx1201` y ROCm. No se documenta soporte para GPUs NVIDIA ni para otras generaciones de AMD.
- Idiomas soportados: solo inglés según las etiquetas. No hay evidencia de capacidades multilingües.
- No se publican parámetros totales, parámetros activos, número de capas, dimensión oculta ni contexto nativo del modelo base.
- No hay benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas publicadas son de fidelidad frente al BF16, no de capacidad absoluta.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgo, toxicidad o alucinación.
- La cuantización W4A8 puede degradar el rendimiento en tareas alejadas de la distribución de calibración (código, prosa y herramientas).
- Requisitos de memoria muy altos: ~132 GiB de memoria fijada, pool de host de 40.960 MiB y 47,7 GiB para la tabla n-gram.
- Un prompt que supere `--max-model-len` se rechaza, nunca se trunca.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la comunidad.
- La etiqueta `vision` no viene acompanada de detalles sobre resolución, pipeline o evaluación multimodal.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/frank8465/Swift-1.5-Qwen3.8-Flash-Next-GPTQ-W4A8-Radiance-AMD-R9700
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia `swift-open-license-1.0`: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor radiance: https://github.com/StillDeadcode/radiance
- Imagen del motor: `stilldeadcode/radiance@sha256:4c3f484564bb2872784e46b0a59cbd71becc9c1e746e301a3596ffae253c322e` (pin 1.0.13)
- Cuantización comparable de StillDeadcode: https://huggingface.co/StillDeadcode/swift1.5-qwen3.8-next-flash-fp8-iq4r-moe
- Corpus de calibración: https://huggingface.co/datasets/frank8465/swift15-gptq-w4-calib-corpus
- Artefactos del gate: `artifacts/kld-gate-mnbt2048.json` (+ `.rows`), `artifacts/kld-gate-mnbt3072.json` (+ run log), `artifacts/rad-info-*.txt`
- Scripts: `scripts/` (receta, driver de conversión, derivación de expertos protegidos, gate KLD, sondas de flota, plantilla de chat)
