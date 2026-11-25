# Grawnch/Inkling-2-Mini-WV-v6.3-TokenWing

## Resumen

Inkling-2-Mini-WV-v6.3-TokenWing es una distribución cuantizada y reempaquetada del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicada por el usuario Grawnch. Se distribuye como un único fichero GGUF con extensión propietaria `.tokenwing.gguf` que integra el modelo de lenguaje (26.439.107.344 parámetros totales, arquitectura MoE con 128 expertos y top-8) junto con manifiestos de tiering VRAM/RAM/NVMe y checksums de expertos. Incluye además un torre de visión separada en BF16 (`mmproj`) para tareas de image-text-to-text.

El interés técnico principal reside en el motor de inferencia propietario `runmyai/tokenwing`, que implementa decodificación especulativa con `MTP-8` embebido, un esquema de cuantización sin pérdida (`QWV2`, hot `VQ-4096` a 3.3125 bpw y cold `4-Coset VQ8` a 2.250 bpw) y un sistema de streaming de expertos MoE por capas desde RAM y NVMe con `O_DIRECT`. Esto permite ejecutar un modelo de 26B parámetros en GPUs de consumo con 4-8 GiB de VRAM, a costa de un throughput muy reducido.

La relevancia es doble: por un lado demuestra técnicas de compresión y tiering agresivas para modelos MoE; por otro, su adopción práctica está limitada por depender de un runtime no estándar (plugin `.so` propietario, binarios `llama-cli` modificados) y por la ausencia de benchmarks de calidad del modelo base en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente (24 capas físicas MoE desplegadas en 48 visitas recurrentes: `0..5 -> 3x(6..17) -> 18..23`), 128 expertos top-8 |
| Parámetros totales | 26.439.107.344 |
| Parámetros activos | no disponible (top-8 de 128 expertos; no se explicita el recuento activo) |
| Longitud de contexto | hasta 32768 tokens en los ejemplos del autor (prefill medido a `S=32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | `QWV2` sin pérdida: hot `VQ-4096` 3.3125 bpw + cold `4-Coset VQ8` 2.250 bpw; atención/cabeza/MTP en `SWZ8_G32` 8.50 bpw; torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF propietario (`.tokenwing.gguf`, alineado a 4096 B) + `mmproj` GGUF BF16 |

## Arquitectura y entrenamiento

El modelo base es `thinkingmachines/Inkling-2-Mini`, del que esta distribución hereda pesos y arquitectura. La versión TokenWing reorganiza el cómputo como un MoE con 24 capas físicas y 128 expertos con enrutado top-8, pero las "despliega" en 48 visitas recurrentes mediante un patrón de bucle explícito (`0..5`, tres pasadas por `6..17`, y `18..23`), lo que reduce el número de capas distintas retenidas en memoria. La cuantización `QWV2` es declarada sin pérdida por el autor: usa `VQ-4096` para expertos "calientes" (3.3125 bpw) y `4-Coset VQ8` para expertos "fríos" (2.250 bpw), con checksums FNV-1a por experto para verificación de integridad.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF, DPO o etapas de alineación; esos datos corresponden al modelo base y no se detallan en la model card. La innovación destacable es el sistema de tiering en tres pasadas (`tokenwing vram-experts v1`, `layer order v1`, `usage v1`) que prioriza el núcleo recurrente `L06..L17` y siembra slots de RAM en arranque en frío, combinado con decodificación especulativa `MTP-8` embebida y streaming de expertos MoE por `O_DIRECT` desde NVMe.

## Capacidades

- Generación de texto conversacional multi-turno (`pipeline_tag: image-text-to-text`, tag `conversational`).
- Razonamiento matemático y resolución de problemas formales (el ejemplo del autor pide demostrar divisibilidad por 24 de `p^2 - 1` para primos `p > 3`).
- Generación de código, incluida continuación de código (`code_cont_512`, `code_cont_2048` en los benchmarks).
- Salida estructurada tipo JSON (medido en el benchmark `json <think>`).
- Modo de razonamiento extendido (`<think>`) en las categorías de benchmark `math`, `json`, `prose` y `code`.
- Visión multimodal image-text-to-text mediante torre ViT de 23 capas con 2D-RoPE, merger espacial 2x2 hacia dimensión de texto 2304 y token `<|unused_200054|>`; preprocesado con parches 20x20 y merge 2x2 (tile de 40 px, normalización `[-1, 1]`).
- Decodificación especulativa integrada (`DSpark` `MTP-8`, hasta 7 tokens borrador con `--spec-draft-n-max 7`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada explícitamente, aunque el modo `<think>` sugiere razonamiento extendido.

## Casos de uso

- Inferencia de un MoE de 26B en GPU de consumo: con 4-8 GiB de VRAM y `--moe-stream model`, el modelo se ejecuta haciendo streaming de expertos desde RAM/NVMe. Adecuado para prototipado local y evaluación de calidad sin acceso a GPUs de datacenter, asumiendo 9-20 tok/s en `M=1`.
- Asistencia de código en local: la continuación de código (`code_cont_512`) alcanza 186 tok/s en `M=1` y 576 tok/s con `MTP-8` en una RTX PRO 6000 de 96 GB; útil para autocompletado en IDE con contexto de hasta 32k tokens.
- Razonamiento matemático con modo `<think>`: el benchmark mide `math <think>` a 307 tok/s con especulación en VRAM completa, lo que permite usarlo como asistente de resolución de problemas paso a paso en entornos con GPU de 96 GB.
- VQA y descripción de documentos: la torre de visión BF16 más el modelo de texto permiten responder preguntas sobre imágenes con 49 tokens visuales; medido a 486 tok/s en VRAM completa, adecuado para pipelines de extracción de información de capturas, diagramas o layouts.
- Generación de JSON estructurado para integración en APIs: el modo `json <think>` con salida estructurada permite usar el modelo como generador de payloads validables en backends, con 255 tok/s en VRAM completa.
- Despliegue en estaciones de trabajo con NVMe rápido: el régimen "cold O_DIRECT NVMe" (6 GiB VRAM + 2 GiB RAM cap) sostiene 11-12 tok/s en `M=1`, suficiente para tareas batch de generación de prosa o documentación donde la latencia no es crítica.
- Evaluación comparativa de motores de inferencia: los manifiestos de tiering y el benchmark Side A/Side B permiten reproducir comparativas de throughput entre `wv_runtime_core v1.5.0` y `TokenWing` sobre el mismo modelo base.

## Benchmarks y rendimiento

Los datos publicados son de throughput del motor de inferencia, no de calidad del modelo (no hay MMLU, HumanEval ni GSM8K en la información disponible).

Side A — VRAM completa en NVIDIA RTX PRO 6000 (96 GB, `sm_120a`, Blackwell):

| Métrica | v1.5.0 (tok/s) | TokenWing (tok/s) | % de v1.5.0 |
|---|---:|---:|---:|
| Prefill `S=512` | 7913.0 | 8022.77 | 101.39% |
| Prefill `S=2048` | 11496.4 | 11886.78 | 103.4% |
| Prefill `S=8192` | 11978.4 | 12490.17 | 104.27% |
| Prefill `S=32768` | 10936.8 | 11362.27 | 103.89% |
| Decode `B=1 M=1` (128 pasos) | 178.62 | 186.13 | 104.21% |
| Spec decode `code_cont_512` | 548.95 | 575.88 | 104.91% |
| Spec decode `code_cont_2048` | 475.73 | 497.28 | 104.53% |
| Spec decode `math <think>` | 281.97 | 307.58 | 109.08% |
| Spec decode `json <think>` | 237.75 | 255.08 | 107.29% |
| Spec decode `prose <think>` | 232.26 | 254.51 | 109.58% |
| Spec decode `code <think>` | 222.54 | 240.77 | 108.19% |
| VQA multimodal (49 tokens visuales) | 451.62 | 486.51 | 107.73% |

Side B — tiering VRAM/RAM/NVMe:

| Régimen | VRAM medida (GiB) | `code_cont_512` M=1 (tok/s) | `math` M=1 (tok/s) | `code_cont_512` MTP-8 (tok/s) |
|---|---:|---:|---:|---:|
| 4 GiB VRAM tiered | 5.049 | 9.35 | 9.64 | 5.67 |
| 6 GiB VRAM tiered | 6.063 | 12.47 | 12.02 | 7.46 |
| 8 GiB VRAM tiered | 8.074 | 18.05 | 20.22 | 14.2 |
| Cold O_DIRECT NVMe (6 GiB VRAM + 2 GiB RAM) | 6.063 | 11.76 | 11.47 | 6.61 |

Baseline ABI v2 solo-plugin: `S=2048` 398.75 tok/s, `M=1` 31.57 tok/s, `MTP-8 code_cont_512` 28.91 tok/s.

## Requisitos de hardware

- VRAM mínima funcional: 4 GiB con `--moe-stream model` (medido 5.049 GiB reales); 6 GiB y 8 GiB mejoran linealmente el throughput.
- VRAM completa recomendada: 96 GB (RTX PRO 6000) para el régimen Side A sin streaming; el autor no reporta cifras para GPUs de 24-48 GB.
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell (`sm_120a`). Otras GPUs (A100, H100, RTX 4090) no están reportadas en la información disponible.
- Cabe en GPU de consumo: sí, con 4-8 GiB de VRAM y streaming desde RAM/NVMe; requiere disco NVMe rápido (`O_DIRECT`) para el régimen cold.
- Despliegue: runtime propietario `runmyai/tokenwing` con binarios `llama-cli` y `llama-mtmd-cli` modificados y plugin `libwv_inkling_plugin.so`. No se declara compatibilidad con vLLM, TGI, Ollama ni llama.cpp upstream.
- Throughput: 9.35-20.22 tok/s en `M=1` con tiering; 186 tok/s en `M=1` y 576 tok/s con `MTP-8` en VRAM completa; prefill de hasta 12.490 tok/s a `S=8192`.
- RAM: el régimen cold usa un cap de 2 GiB de RAM además de los 6 GiB de VRAM; el régimen tiered no especifica requisito de RAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-WV-v6.3-TokenWing | 26.4B (MoE top-8, 128 expertos) | hasta 32768 en ejemplos | Apache 2.0 | `.tokenwing.gguf` + runtime propietario | Cuantización sin pérdida declarada, tiering VRAM/RAM/NVMe |
| thinkingmachines/Inkling-2-Mini (base) | no disponible en la información | no disponible | no disponible | safetensors / ecosistema estándar | Modelo de referencia; sin datos de benchmarks de calidad |
| `wv_runtime_core v1.5.0` (motor previo) | mismo modelo base | mismo | Apache 2.0 (del repo) | GGUF + plugin ABI v2 | Baseline de throughput: 178.62 tok/s `M=1`, 398.75 tok/s prefill `S=2048` |
| Alternativas de 26-30B MoE del ecosistema abierto | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Dependencia de runtime propietario: requiere binarios `llama-cli`/`llama-mtmd-cli` modificados y el plugin `libwv_inkling_plugin.so`; no es compatible con llama.cpp upstream, vLLM, TGI ni Ollama.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de alucinación o sesgo publicadas; los únicos datos son de throughput.
- Idiomas no declarados: no se especifica cobertura multilingüe, por lo que el comportamiento fuera del inglés es incierto.
- Throughput bajo en tiering: 9-20 tok/s en `M=1` con 4-8 GiB de VRAM limita su uso interactivo; el modo `MTP-8` rinde peor que `M=1` en esos regímenes (5.67-14.2 tok/s frente a 9.35-20.22 tok/s).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria.
- Licencia Apache 2.0 declarada, pero la licencia del modelo base `thinkingmachines/Inkling-2-Mini` no se detalla en la información disponible; conviene verificar compatibilidad antes de uso comercial.
- La cuantización "sin pérdida" es una afirmación del autor (`0.0-ULP` bit-exact en el modo `M=1`); no hay verificación independiente en la información proporcionada.
- El tamaño del repo (10.2 GB) y el uso de `O_DIRECT` sobre NVMe implican requisitos de almacenamiento y de hardware de disco que no se cuantifican.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Inkling-2-Mini-WV-v6.3-TokenWing
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime `runmyai/tokenwing`: no disponible (referenciado en la model card sin URL)
- Benchmark completo: `benchmarks/inkling2_tokenwing_frontier_bench.json` dentro del repositorio del modelo
- Paper, blog o demo: no disponible
