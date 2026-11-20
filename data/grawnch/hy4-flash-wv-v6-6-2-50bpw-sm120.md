# Grawnch/Hy4-Flash-WV-v6.6-2.50bpw-SM120

## Resumen

Hy4-Flash-WV-v6.6-2.50bpw-SM120 es una cuantización de precisión extrema del modelo multimodal `tencent/Hy4-flash`, publicada por el usuario Grawnch. No es un modelo original, sino un derivado empaquetado para ejecución en GPUs Blackwell con arquitectura `SM120` (`sm_120`, SASS-only), es decir, RTX 5090 y RTX PRO 6000. El objetivo es comprimir el checkpoint original en BF16 (en torno a 566 GB en disco, unos 312 GB de pesos en GPU) hasta 53,98 GB de pesos de backbone, drafter y ViT, con un total de 118,66 GB de repositorio incluyendo los sidecars `Engram` mapeados en host.

El modelo base es un MoE multimodal de Tencent con 283B parámetros totales, de los cuales 156B son no-Engram multimodales, 127B pertenecen al módulo `Engram`, 0,85B al drafter especulativo `DFly2` y un ViT `SigLIP2`. La cuantización aplica un esquema `WV-v6.6` con backbone de clase 2,50 bpw, MoE enrutado de tres niveles en espacio de salida `MODE3` (2,425 bpw) y proyecciones densas en `SWZ8_G32` (8,50 bpw), además de parches SVD Top-24 Rank-8 en `down_proj`.

Su relevancia práctica es la ejecución de un modelo de esta escala en una sola GPU de 96 GB o, mediante `--force-32gb`, en una RTX 5090 de 32 GB, algo inviable con el BF16 original. El repositorio incluye un servidor propietario `qfn_sm120_unified` v22.6.0 con API compatible con OpenAI y Open-WebUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer disperso) con módulo `Engram`, drafter especulativo `DFly2` y ViT `SigLIP2`; cuantización `WV-v6.6` empaquetada para `SM120` |
| Parametros totales | 283B (156B no-Engram multimodales + 127B `Engram` + 0,85B `DFly2` + ViT `SigLIP2`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se documentan pruebas a 2K, 8K y 20K+ multi-needle con `IndexPool` + `SWA-512`) |
| Tipos de cuantizacion | `WV-v6.6`: backbone clase 2,50 bpw; MoE enrutado `MODE3` 2,425 bpw (`4-Coset VQ8` + `4D VQ-4096` + `4B38`); proyecciones densas `SWZ8_G32` 8,50 bpw; `Engram` en `fp8_exact` con mmap en host |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (`tencent-hy-license`, heredada de `tencent/Hy4-flash`) |
| Formato de pesos | Propietario (`custom`), empaquetado con el runtime `qfn_sm120_unified` v22.6.0; no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts multimodal con atención MLA dispersa, un módulo de memoria/contexto denominado `Engram` (127B parámetros) y un ViT `SigLIP2` para entrada de imagen. La cuantización no reentrena el modelo: transforma los pesos BF16 mediante un esquema de cuantización por capas con calibración de 25% C4 ponderado plano, 64 x 2.048 y 8K. Se aplican tres regímenes: backbone a 2,50 bpw, expertos enrutados a 2,425 bpw con VQ de 4 dimensiones y 4.096 entradas (`4D VQ-4096`, 16 KB de SMEM, 3,3125 bpw) más una cascada `4B38` de tres niveles, y proyecciones densas de atención y MLP (`linear_gate`, `q_a`, `q_b`, `o_proj`, `routed_{down,up}`, `shared_experts`) en `SWZ8_G32` a 8,50 bpw. Las capas tempranas `L01..L08` reciben protección de bpw y se aplica una cascada `PQ-3 -> PQ-2` y parches SVD Top-24 Rank-8 en `down_proj`.

El drafter especulativo `DFly2` (0,85B) se recalibra en bucle cerrado y comparte la caché KV MLA dispersa del modelo objetivo (0 GB extra de KV para el draft), con paridad codiciosa exacta 96/96 y muestreo estocástico de rechazo sin pérdida (KLD 0,0, tau medio 2,714, coseno en bucle cerrado 0,974). El runtime incorpora decodificación especulativa con árbol híbrido `SAM` y prefilling MLA elástico sobre Tensor Cores.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada imagen-texto a texto (`image-text-to-text`) mediante el ViT `SigLIP2`.
- Razonamiento y generación de código, con validación de esquemas JSON mediante FSM en GPU (4/4 válidos en las pruebas del autor).
- Decodificación especulativa con árbol híbrido y paridad codiciosa exacta frente a `M=1`.
- Recuperación exacta multi-needle a 20K+ (3/3 en las pruebas del autor).
- Servidor compatible con API OpenAI y Open-WebUI, con modo `--inline-think` para etiquetas `<think>` colapsables.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 283B en una única GPU Blackwell de 96 GB: el empaquetado de 53,98 GB de pesos permite servir el modelo en una RTX PRO 6000 sin clúster multi-GPU, algo imposible con el BF16 de 312 GB.
- Inferencia en estación de trabajo con RTX 5090 de 32 GB: el modo `--force-32gb` mantiene el pico de VRAM en 22,015 GiB y ofrece 11,95 tok/s a `B=4` y 2,86 tok/s a `B=1`, adecuado para prototipado y evaluación local.
- Servicio conversacional con API OpenAI: el runtime `qfn_sm120_unified` expone un servidor HTTP con SSE y `TTFT` de 2.239 ms a 128 tokens en frío y 251,91 ms en caché a 8K, integrable en aplicaciones tipo Open-WebUI.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` con ViT `SigLIP2` permite tareas de comprensión de capturas, formularios o gráficos junto a texto largo.
- Evaluación de cuantizaciones extremas: útil para investigadores que comparan KLD y perplejidad frente a BF16 (PPL 10,3273 a 2K y 22,2144 a 8K en las pruebas del autor) antes de adoptar un esquema de compresión.
- Generación estructurada con JSON Schema: la validez FSM en GPU (4/4) habilita extracción de datos y salidas parseables en pipelines automatizados.
- Razonamiento de contexto largo con recuperación exacta: las pruebas multi-needle a 20K+ con `IndexPool` + `SWA-512` respaldan casos de análisis de documentación extensa o registros.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (no son benchmarks estándar de MMLU, HumanEval o GSM8K, sino métricas de fidelidad frente al BF16 y de rendimiento del runtime):

| Metrica | WV-v6.4 | WV-v6.5.1 | WV-v6.6 (esta release) |
|---|---|---|---|
| Tamano backbone + DFly2 + ViT | 52,51 GB | 52,99 GB | 53,98 GB |
| Blind-Val 2K KLD / Top-1 | 0,48475 / 83,34% | 0,39580 / 85,20% | 0,40875 / 84,593% |
| Blind-Val 2K KLD por dominio (WT2 / Code / Self-Gen) | 0,6688 / 0,9440 / 0,1631 | 0,4999 / 0,8376 / 0,1229 | 0,47994 / 0,87631 / 0,13938 |
| Blind-Val 8K KLD / Top-1 | 0,88101 / 72,52% | 0,71386 / 75,84% | 0,724 / 75,058% |
| Coseno en bucle cerrado DFly2 | 0,97358 | 0,97650 | 0,974 |

| Metrica | BF16 (`tencent/Hy4-flash`) | GGUF `IQ2_AH` (`AngelSlim`) | WV-v6.6 SM120 |
|---|---|---|---|
| Tamano backbone + drafter + ViT | ~312 GB (8 GPU) | ~134 GB (incl. Engram) | 53,98 GB |
| Tamano total en disco | ~566 GB | ~134 GB | 118,66 GB |
| Blind-Val 2K PPL / KLD | 13,3976 / 0,0000 | no disponible | 10,3273 / 0,40875 |
| Blind-Val 8K PPL / KLD | 34,8908 / 0,0000 | no disponible | 22,2144 / 0,724 |
| Recuperación multi-needle 20K+ | 3/3 | no disponible | 3/3 |
| Paridad greedy árbol híbrido vs M=1 | no disponible | no disponible | 96/96 |
| Validez JSON Schema FSM | no disponible | no disponible | 4/4 |
| TTFT SSE (128 / 2048 / 8192 tok, frío / caché) | no disponible | no disponible | 2239,19 / 2914,91 / 9186,91 ms (caché 8K: 251,91 ms) |
| Decodificación especulativa (RTX PRO 6000, B=1 / B=32) | no disponible | no disponible | 53,64 / 246,92 tok/s |
| Modo `--force-32gb` (RTX 5090) | OOM | OOM | 11,95 tok/s @ B=4; 2,86 tok/s @ B=1; pico 22,015 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 53,98 GB de pesos en GPU (backbone + `DFly2` + ViT) en modo 96 GB; pico de 22,015 GiB en modo `--force-32gb`. Los sidecars `Engram` en `fp8_exact` se mapean en host y consumen 0 GiB de VRAM.
- GPU recomendadas: RTX PRO 6000 (96 GB) para el modo completo; RTX 5090 (32 GB) para el modo restringido. Arquitectura Blackwell `SM120` exclusivamente (`sm_120`, SASS-only).
- No es compatible con GPUs no Blackwell (A100, H100, RTX 4090) según la información disponible: el paquete es SASS-only para `sm_120`.
- Opciones de despliegue: servidor propietario `qfn_sm120_unified` v22.6.0 (`python -m qfn_sm120_unified.serve`), con API OpenAI y Open-WebUI. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: `TTFT` de 2.239,19 ms (128 tok, frío), 2.914,91 ms (2.048 tok) y 9.186,91 ms (8.192 tok); 251,91 ms en caché a 8K. Decodificación especulativa de 53,64 tok/s a `B=1` y 246,92 tok/s a `B=32` en RTX PRO 6000; 11,95 tok/s a `B=4` y 2,86 tok/s a `B=1` en RTX 5090 con `--force-32gb`.
- Requiere Python 3.13 (`cp313`) y Linux x86_64 según el wheel publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-WV-v6.6-2.50bpw-SM120 (esta release) | 283B totales | no disponible | 53,98 GB GPU / 118,66 GB disco | Tencent Hy License | Hugging Face, runtime propietario |
| `tencent/Hy4-flash` BF16 | 283B totales | no disponible | ~312 GB GPU / ~566 GB disco | Tencent Hy License | Hugging Face |
| `AngelSlim/Hy4-flash-GGUF` (`IQ2_AH`) | 283B totales | no disponible | ~134 GB | Tencent Hy License | Hugging Face, formato GGUF |

Otras alternativas de la misma categoría (MoE multimodal de escala similar) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Cuantización de 2,50 bpw: la fidelidad frente a BF16 es limitada (KLD 0,40875 a 2K y 0,724 a 8K; Top-1 de 84,593% y 75,058%), con degradación notable en dominio Code (KLD 0,87631).
- El paquete es SASS-only para `sm_120`: no funciona en GPUs Ampere, Hopper ni Ada. La portabilidad es nula fuera de Blackwell.
- El runtime `qfn_sm120_unified` es propietario (`library_name: custom`, "source-free"): no hay código fuente auditable ni integración con ecosistemas estándar de inferencia.
- El modo `--force-32gb` en RTX 5090 ofrece 2,86 tok/s a `B=1`, insuficiente para uso interactivo exigente.
- Licencia Tencent Hy License: es necesario revisar `LICENSE` antes de cualquier uso comercial; no es una licencia open source estándar.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas declaradas por el autor.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- El repositorio ocupa 118,66 GB, lo que exige almacenamiento considerable incluso antes de la ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Hy4-Flash-WV-v6.6-2.50bpw-SM120
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Página de investigación de Tencent Hy: https://hy.tencent.ai/research/hy4-flash
- Ficha de benchmarks y especificaciones: https://www.llmboard.ai/models/hy4-flash
- Noticia sobre la publicación de pesos de Hy4 Flash: https://www.gate.com/news/detail/tencent-releases-hy4-flash-weights-in-three-versions-services-with-over-100-25718892
- Versión previa de la cuantización (WV-v6): https://huggingface.co/Grawnch/Hy4-Flash-WV-v6-2.50bpw-SM120
- GGUF de referencia: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
