# jcbtc/Tess-4.5-26B-A3B-CIRU-Halo-Agent-gfx1151

## Resumen

Tess 4.5 26B A3B · CIRU Halo Agent (gfx1151) es un paquete de despliegue y optimización de pesos publicado por el usuario jcbtc sobre el checkpoint `migtissera/Tess-4.5-26B-A3B`, que a su vez es un fine-tune del modelo `Inkling-2-Mini` de Thinking Machines Lab. No se trata de un entrenamiento nuevo: el autor empaqueta el checkpoint upstream sin modificar (revisión `aa4682763e42c4efd0bf8209d8aa5986f731c691`) junto con capas finales MoE reempaquetadas y un runtime HIP nativo para la APU AMD Ryzen AI Max+ 395 con GPU integrada Radeon 8060S (arquitectura RDNA 3.5, target `gfx1151`).

El modelo es un transformer multimodal de tipo Mixture of Experts con 26.388.646.440 parámetros totales y una ventana de contexto declarada de 1.048.576 tokens. El objetivo del paquete es permitir inferencia local de contexto largo en hardware de consumo unificado (128 GB de memoria compartida) mediante vLLM `0.34.0+rocm100`, un overlay específico para `gfx1151` y decodificación especulativa adaptativa.

Su relevancia es de nicho pero concreta: demuestra que es viable servir un MoE multimodal de 26B con 1M de contexto y tool calling nativo en una APU AMD sin GPUs discretas, con throughput medido de 60,8 tok/s en decodificación individual y 213,9 tok/s agregados con 8 secuencias concurrentes. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) multimodal, fine-tune de Inkling-2-Mini; runtime nativo HIP RDNA 3.5 (`gfx1151`) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | 3B (indicado por el sufijo A3B del nombre; no se detalla el ratio exacto en la model card) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 en capas 0-19 (expertos), MXFP8 en capas 20-23 (coda), reempaquetado Flash C1 G16 (U4 con codebook FP16 de 256 entradas) en capas 20-23; tag `8-bit`; soporte `modelopt` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint principal de 19.526.019.168 bytes, `mtp.safetensors` de 635.801.416 bytes y cuatro ficheros `layer20-c1` a `layer23-c1` de 574.751.560 bytes cada uno) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE multimodal con capacidades de visión y razonamiento nativo, derivado de `Inkling-2-Mini` de Thinking Machines Lab y ajustado por migtissera como `Tess-4.5-26B-A3B`. El paquete de jcbtc no reentrena el modelo: conserva las capas 0-19 con sus pesos NVFP4 sin modificar (`expert_policy=source`) y pre-tileadas al arrancar en bancos WMMA nativos de `gfx1151`, y reempaqueta las capas 20-23 desde MXFP8 a un formato Flash C1 G16 con codebook afín indexado de 256 entradas FP16 `(scale, offset)`, lo que reduce aproximadamente a la mitad el ancho de banda de memoria en Strix Halo. Los errores relativos medios reportados del reempaquetado son de 0,0686-0,0698 en `w13` y `w2` según capa.

El paquete incluye dos rutas de decodificación especulativa: por defecto, DSpark adaptativo con `K=7` a `B=1` y `K=4` a `B=2..8`, con grafos HIP completos de target y draft; opcionalmente, DFlash 2 nativo con WMMA W6, atención de ventana deslizante 3D split-KV (`TRITON_ATTN`) y drafting probabilístico, compatible con `incoai/Inkling-2-Mini-DFlash2`. No se detallan en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: la model card verifica cálculo aritmético exacto (37 × 43 = 1591) en ambas rutas de decodificación.
- Visión: pipeline `image-text-to-text`; verificado con una imagen PNG de 64×64 con identificación exacta de color en 0,70 s.
- Tool calling nativo: parsers `--tool-call-parser inkling` y `--enable-auto-tool-choice`; verificado con una llamada `get_weather` resuelta exactamente en 0,76 s.
- Razonamiento nativo: parser `--reasoning-parser inkling`.
- Contexto largo: ventana completa de 1.048.576 tokens con pool de KV cache BF16 de 48 GiB (1.131.335 tokens con DSpark, 1.269.761 con DFlash 2).
- Concurrencia: hasta 8 secuencias simultáneas.
- Decodificación especulativa: DSpark adaptativo o DFlash 2 opcional.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia sobre repositorios completos: con 1M de tokens de contexto se puede cargar un árbol de código extenso y hacer preguntas cruzadas entre ficheros sin trocear, aprovechando el pool de KV cache de 48 GiB en 128 GB de memoria unificada.
- Agentes con tool calling en local: el soporte nativo de `--enable-auto-tool-choice` y el parser `inkling` permiten construir agentes que invocan APIs o funciones del sistema con latencia de primera llamada de 0,76 s verificada.
- Procesamiento de documentos con imágenes: el pipeline `image-text-to-text` permite extraer información de capturas, diagramas o formularios junto con texto, útil en flujos de digitalización de documentación técnica.
- Estación de trabajo de desarrollo sin GPU discreta: un equipo con Ryzen AI Max+ 395 y 128 GB puede servir el modelo con vLLM y ROCm, eliminando la dependencia de A100/H100 para prototipado de agentes multimodales.
- Evaluación de modelos MoE multimodales: investigadores pueden medir aceptación especulativa (2,71-3,37 tokens por paso, 33,6-33,8 % de aceptación de draft) y throughput agregado en hardware de consumo.
- Razonamiento matemático y analítico por lotes: con 8 secuencias concurrentes y 213,9-227,2 tok/s agregados, es viable procesar lotes de problemas aritméticos o de razonamiento corto en local.
- Análisis de conversaciones largas: atención al cliente o revisión de hilos extensos gracias a la ventana de 1M tokens y al soporte multi-turno conversacional.

## Benchmarks y rendimiento

Mediciones verificadas por el autor en AMD Ryzen AI Max+ 395 / Radeon 8060S (`gfx1151`, 128 GB de memoria unificada) con vLLM `0.34.0+rocm100`, `--mode vision --context 1048576 --seqs 8 --kv-mib 49152 --tools`:

| Metrica | DSpark adaptativo (por defecto) | Con `--dflash2` |
|---|---:|---:|
| Arranque en caliente | 45 s | 29 s |
| Pool KV cache GPU (48 GiB BF16) | 1.131.335 tokens (1,08× de 1M) | 1.269.761 tokens (1,21× de 1M) |
| Matemáticas + razonamiento (37 × 43) | Exacto (1591) | Exacto (1591, 123,3 tok/s) |
| Decodificación streaming `B=1`, `T=0.0` (512t) | 60,8 tok/s (TTFT 193 ms) | 62,6 tok/s (TTFT 191 ms) |
| Decodificación streaming `B=1`, `T=1.0` (512t) | 51,4 tok/s (TTFT 193 ms) | 52,9 tok/s (TTFT 157 ms) |
| Tool calling nativo (`get_weather`) | Exacto (0,76 s) | Exacto (0,76 s) |
| Visión (PNG 64×64, identificación de color) | Exacto (Red, 0,70 s) | Soportado (mismo encoder de visión) |
| Concurrencia `B=8` (8 × 256t) | 213,9 tok/s agregados | 227,2 tok/s agregados |
| Aceptación especulativa (mixto `B=1`+`B=8`) | 2,71 tokens/paso (33,6 % aceptación) | 3,37 tokens/paso (33,8 % aceptación) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: el paquete está diseñado para 128 GB de memoria unificada en AMD Ryzen AI Max+ 395 con Radeon 8060S (`gfx1151`); el repositorio ocupa 22,5 GB.
- GPU recomendadas: Radeon 8060S integrada en Ryzen AI Max+ 395 (RDNA 3.5, `gfx1151`). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Consumer GPU: el target es una APU de consumo con memoria unificada; no se indica soporte para GPUs discretas de consumo.
- Despliegue: vLLM `0.34.0+rocm100` con overlay v1.6.0 específico para `gfx1151`, biblioteca HIP nativa precompilada ABI v3 (`hip_inkling_gfx1151_07458d24acf9.so`, sin necesidad de `hipcc` ni `rocm-sdk-devel`), ROCm 10. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 157-193 ms; decodificación de 51,4-62,6 tok/s a `B=1`; 213,9-227,2 tok/s agregados a `B=8`; arranque en caliente de 29-45 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tess 4.5 26B A3B · CIRU Halo Agent | 26,4B totales, 3B activos | 1.048.576 | Apache 2.0 | Paquete optimizado para `gfx1151` |
| migtissera/Tess-4.5-26B-A3B | 26,4B totales, 3B activos | no disponible en la información | Apache 2.0 | Checkpoint upstream sin optimizar |
| Thinking Machines Lab Inkling-2-Mini | no disponible | no disponible | no disponible | Modelo base del que deriva el fine-tune |
| incoai/Inkling-2-Mini-DFlash2 | no disponible | no disponible | no disponible | Modelo draft para decodificación especulativa |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El paquete está acoplado a un hardware concreto: AMD Ryzen AI Max+ 395 con Radeon 8060S (`gfx1151`). No hay indicios de que funcione en GPUs NVIDIA u otras AMD sin adaptación.
- Depende de una versión específica de vLLM (`0.34.0+rocm100`) y de un overlay y biblioteca HIP precompilada propios; la actualización de ROCm o vLLM puede romper la compatibilidad.
- El reempaquetado Flash C1 G16 de las capas 20-23 introduce error relativo medio de aproximadamente 0,069 en los pesos, lo que puede degradar ligeramente la calidad frente al checkpoint original; existe la opción `--original-weights` para evitarlo a costa de mayor ancho de banda.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K) que permitan comparar calidad con otros modelos.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un fine-tune de un modelo base sin documentación de alineamiento en esta ficha, deben asumirse los riesgos habituales de los modelos generativos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint upstream `migtissera/Tess-4.5-26B-A3B` y del modelo base `Inkling-2-Mini`.

## Enlaces

- [Hugging Face: jcbtc/Tess-4.5-26B-A3B-CIRU-Halo-Agent-gfx1151](https://huggingface.co/jcbtc/Tess-4.5-26B-A3B-CIRU-Halo-Agent-gfx1151)
- [Modelo base: migtissera/Tess-4.5-26B-A3B](https://huggingface.co/migtissera/Tess-4.5-26B-A3B)
- [Modelo original: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Modelo draft: incoai/Inkling-2-Mini-DFlash2](https://huggingface.co/incoai/Inkling-2-Mini-DFlash2)
- Ficheros internos del repositorio: `INSTALL.md`, `WEIGHTS.sha256`, `MANIFEST.sha256`, `scripts/install.sh`, `scripts/serve.sh`
