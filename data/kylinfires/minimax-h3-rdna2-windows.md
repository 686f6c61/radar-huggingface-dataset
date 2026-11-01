# kylinfires/minimax-h3-rdna2-windows

## Resumen

Este repositorio no contiene un modelo de IA, sino un conjunto de scripts en PowerShell y documentación técnica para desplegar y optimizar **MiniMax-H3** en una GPU AMD RDNA2 (gfx1030, RX 6900 XT) bajo Windows, empleando `stable-diffusion.cpp` con backend ROCm/HIP. MiniMax-H3 es un transformer de difusión omni (vídeo y audio) de 33B parámetros desarrollado por MiniMax, que no es open source y se rige por su propia licencia comunitaria con territorios excluidos (EE. UU., UE, Reino Unido y Corea del Sur). El repositorio de kylinfires documenta cómo pasar de 3707 s a 183 s para un clip de 480p y 2,3 s (una mejora de 20,3×), con análisis de kernel y cuellos de botella.

El interés técnico reside en las cuatro optimizaciones documentadas: el comportamiento de WDDM en Windows, que degrada silenciosamente asignaciones grandes a memoria compartida (2,8×); la sustitución del text encoder Qwen3-VL de 17 GB por una cuantización Q2_K_M de 12,5 GB (−15% extremo a extremo); la desactivación de la ruta rápida de atención en Vulkan causada por `GGML_PREC_F32` (2,4×); y el ajuste del tile Q4_K de J=64 a J=128 en el kernel MMQ de RDNA2 (+7,9% en la proyección FFN).

Es relevante ahora porque demuestra que es viable ejecutar un modelo de vídeo generativo de 33B en una GPU de consumo AMD de 16 GB, algo poco documentado frente al ecosistema NVIDIA/CUDA, y porque expone con mediciones reproducibles las trampas de ROCm en Windows y del backend ggml.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión omni (vídeo + audio) |
| Parametros totales | 33B (modelo MiniMax-H3 referenciado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (pesos principales), Q2_K_M (text encoder Qwen3-VL) |
| Idiomas soportados | en, zh (según tags del repositorio) |
| Licencia | MIT para los scripts; MiniMax-H3 se rige por MiniMax H3 Community License Agreement |
| Formato de pesos | no disponible (los scripts descargan desde ModelScope/Hugging Face) |

## Arquitectura y entrenamiento

MiniMax-H3 es un transformer de difusión que genera vídeo y audio de forma conjunta (omni). El repositorio no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos no están disponibles. Lo que sí se detalla es el stack de inferencia: `stable-diffusion.cpp` con backend ROCm/HIP sobre gfx1030, más un text encoder Qwen3-VL de 17 GB en precisión original o 12,5 GB en Q2_K_M.

Las innovaciones documentadas son de optimización de inferencia, no de arquitectura del modelo: gestión explícita del presupuesto de VRAM (`--max-vram ROCm0=11`) para evitar la degradación de WDDM, activación de flash attention para evitar el shader GEMM en f32 puro en Vulkan, y modificación del tile Q4_K del kernel MMQ de RDNA2 (`mmq-config-rdna2.cuh`) para usar J=128 en lugar de J=64. También se incluye un benchmark de kernel de atención HIP independiente que alcanza 8,76 TFLOPS en gfx1030 (18–19% del pico).

## Capacidades

- Generación de vídeo con audio sincronizado (modelo omni de difusión vídeo+audio).
- Generación condicionada por prompt de texto (se recomiendan al menos 25 palabras de detalle).
- Resolución configurable: 512×288 y 864×480 en los presets medidos.
- Duración configurable: 22 frames (0,9 s) y 56 frames (2,3 s) en los presets medidos.
- Presets de inferencia: `draft`, `fast`, `quality`, `longhd`.
- Servidor web local vía `sd-server` en 127.0.0.1:1234.
- Soporte de dos idiomas en los tags del repositorio: inglés y chino.
- Tool calling, function calling, agentes y modo thinking: no disponible (no es un modelo de lenguaje conversacional).

## Casos de uso

- Generación de clips cortos en GPU de consumo: con el preset `fast` (864×480, 22 frames, 8 pasos) se obtiene un clip de 0,9 s en 67,2 s medidos en una RX 6900 XT, adecuado para prototipado rápido de ideas visuales sin acceso a clústeres.
- Previsualización en baja resolución antes de render final: el preset `draft` (512×288, 56 frames) tarda 72,2 s y permite validar prompt y composición antes de lanzar un render de mayor calidad.
- Render de calidad con más pasos: el preset `quality` (864×480, 22 frames, 20 pasos) tarda 138,5 s y sirve para piezas finales cortas donde importa el detalle por paso de difusión.
- Clips largos en HD: el preset `longhd` (864×480, 56 frames, 8 pasos) tarda 183,0 s y cubre la generación de 2,3 s de vídeo con audio en una sola GPU.
- Integración en un flujo de trabajo local con interfaz web: `serve.ps1` levanta `sd-server` en 127.0.0.1:1234, lo que permite usar el modelo desde un navegador o desde scripts cliente sin exponerlo a la red.
- Investigación y perfilado de kernels en RDNA2: los scripts `bench.ps1` y `kernels/gemm_bench.cpp` permiten reproducir las mediciones de TFLOPS por forma (fc1, fc2, qkv) y validar cambios en el tile Q4_K o en la ruta de atención.
- Evaluación de ROCm en Windows sin privilegios de administrador: `extract_rocm.ps1` extrae el runtime ROCm del instalador del HIP SDK de AMD sin requerir admin, útil en entornos corporativos restringidos.

## Benchmarks y rendimiento

Rendimiento de extremo a extremo medido en RX 6900 XT (gfx1030, 16 GB), Windows, `stable-diffusion.cpp` con backend ROCm/HIP:

| Preset | Resolucion | Frames | Pasos | Tiempo medido |
|---|---|---|---|---|
| `fast` | 864×480 | 22 (0,9 s) | 8 | 67,2 s |
| `draft` | 512×288 | 56 (2,3 s) | 8 | 72,2 s |
| `quality` | 864×480 | 22 (0,9 s) | 20 | 138,5 s |
| `longhd` | 864×480 | 56 (2,3 s) | 8 | 183,0 s |

Mejora global documentada: 3707 s → 183 s para un clip de 480p y 2,3 s (20,3×).

Rendimiento del kernel GEMM con el ajuste de tile Q4_K (J=64 → J=128), medido con `kernels/gemm_bench.cpp`:

| Forma | Stock (TFLOPS) | +J=128 (TFLOPS) | Ganancia |
|---|---|---|---|
| fc1 22f (5376×28672×2835) | 25,88 | 27,92 | +7,9% |
| fc1 56f (5376×28672×6885) | 26,05 | 28,59 | +9,7% |
| fc2 22f (28672×5376×2835) | 24,24 | 25,59 | +5,6% |
| qkv 22f (5376×21504×2835) | 26,00 | 27,88 | +7,2% |

Efecto extremo a extremo del ajuste J=128: 22f de 50,5 s a 49,2 s; 56f de 145,3 s a 138,4 s.

Desglose de tiempo en 22 frames / 8 pasos / 864×480 (solo bucle de muestreo): extremo a extremo (incluyendo TE + VAE) 14,1 TFLOPS, un 30,6% del pico de 46,08 TFLOPS.

Kernel de atención HIP independiente: 8,76 TFLOPS en gfx1030 (18–19% del pico).

Impacto del cap de VRAM en 56 frames: 9 GB → 147 s, 11 GB → 145 s, 12 GB → 145 s, 13 GB → 400 s.

## Requisitos de hardware

- VRAM: GPU AMD con soporte ROCm/HIP; probado en RX 6900 XT con 16 GB. Se recomienda dejar 4–5 GB libres para activaciones (regla aproximada `VRAM − 5 GB` para el cap de pesos).
- RAM del sistema: 64 GB recomendados; el RSS medido con mmap y offload se sitúa entre 23 y 28 GB.
- Disco: ~31 GB para los pesos del modelo.
- GPU recomendadas: RX 6900 XT (gfx1030, 16 GB) como referencia medida. Otras GPU RDNA2 con soporte ROCm no están verificadas en el repositorio.
- ¿Cabe en GPU de consumo? Sí, en RX 6900 XT de 16 GB con los presets y el cap de VRAM documentados.
- Opciones de despliegue: `stable-diffusion.cpp` con backend ROCm/HIP (`build_hip.bat`, MSVC + clang del ROCm SDK), `sd-server` para interfaz web local, y scripts de generación por lotes (`gen.ps1`).
- Latencia y throughput: ver tabla de benchmarks (67,2 s a 183,0 s por clip según preset); 14,1 TFLOPS extremo a extremo, 30,6% del pico.

## Comparativa con modelos similares

No disponible. El repositorio no incluye comparaciones con otros modelos de generación de vídeo ni con otros backends de despliegue; únicamente compara configuraciones del propio stack (stock frente a J=128, Vulkan con y sin flash attention, distintos caps de VRAM).

## Limitaciones y advertencias

- MiniMax-H3 no es open source: se rige por la MiniMax H3 Community License Agreement, que designa EE. UU., UE, Reino Unido y Corea del Sur como territorios excluidos que requieren licencia separada. El uso desde España (UE) queda afectado por esta restricción.
- El repositorio no distribuye pesos del modelo; solo scripts PowerShell y documentación. La licencia MIT aplica a los scripts y a `stable-diffusion.cpp`, no al modelo.
- Todo el rendimiento está medido en una única máquina (RX 6900 XT, Windows 10/11); no hay validación en otras GPU ni en Linux.
- La degradación silenciosa de WDDM puede provocar caídas de rendimiento de hasta 2,8× sin mensajes de error en los logs, lo que dificulta el diagnóstico en producción.
- El cap de VRAM tiene un límite superior abrupto: pasar de 12 GB a 13 GB en 56 frames dispara el tiempo de 145 s a 400 s.
- El ajuste J=128 requiere modificar `mmq-config-rdna2.cuh` y recompilar; no está integrado upstream.
- El modelo base está orientado a generación de vídeo y audio; no es un LLM conversacional y no ofrece tool calling ni razonamiento multi-paso.
- Idiomas documentados limitados a inglés y chino; no hay evidencia de calidad en castellano.
- Riesgo de alucinación visual y de artefactos en la generación: no se documentan evaluaciones de calidad objetivas, solo comparaciones A/B informales de frames para el cambio de cuantización del text encoder.
- Los scripts asumen Windows con PowerShell y extracción del runtime ROCm del instalador de AMD; no se documenta soporte para otras plataformas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kylinfires/minimax-h3-rdna2-windows
- Mirror en ModelScope: https://modelscope.cn/models/kylinfires/minimax-h3-rdna2-windows
- `stable-diffusion.cpp`: https://github.com/leejet/stable-diffusion.cpp
- Licencia de MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
