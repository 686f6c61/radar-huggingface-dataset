# pottokao/MiniMax-H3-NVFP4-rotated

## Resumen

MiniMax-H3-NVFP4-rotated es una cuantizacion en punto flotante de 4 bits (NVFP4) del modelo MiniMax-H3, un DiT (Diffusion Transformer) multimodal de generacion de video y audio desarrollado por MiniMaxAI. Esta version, creada por el usuario independiente pottokao, aplica una rotacion de Hadamard estilo QuaRot para reducir outliers y empaqueta los pesos en formato NVFP4, lo que permite ejecutar el modelo completo (8 pasos turbo, sin destilacion) en GPUs Blackwell de consumo con 16-24 GB de VRAM.

El modelo se distribuye en tres niveles de calidad (T1, T2 y T3) que conservan progresivamente mas bloques sensibles en bf16, ofreciendo un equilibrio entre tamano, velocidad y estabilidad temporal. Su relevancia actual radica en que hace viable la generacion local de video con audio de alta calidad en hardware domestico, algo que hasta ahora requeria GPUs de centro de datos o servicios en la nube. El repositorio incluye un nodo especifico para ComfyUI (`H3RotNVFP4Patch`) que evita las trampas de los cargadores genericos de NVFP4 y aprovecha los kernels nativos W4A4 de la libreria nunchaku.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) multimodal de video y audio, 8 pasos turbo (no destilado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | NVFP4 (fp4 empaquetado 2 bytes/byte + escala fp8 group-16) con rotacion Hadamard block-256; T1 all-NVFP4, T2/T3 con bloques en bf16 |
| Idiomas soportados | no disponibles |
| Licencia | MiniMax-H3 Community License (uso comercial con atribucion y restricciones) |
| Formato de pesos | safetensors (`transformer_blocks.safetensors`, `rotation.safetensors`, `rotation_config.json`) |

El repositorio ocupa 40.4 GB en total, pero se descarga por niveles: T1 (10.8 GB), T2 (~11.5 GB) y T3 (~18 GB).

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un DiT multimodal que genera video y audio sincronizados a partir de prompts de texto, con capacidad de entender combinaciones de texto, imagen, video y audio. La cuantizacion de pottokao aplica una rotacion de Hadamard block-256 estilo QuaRot a cada capa lineal del DiT (qkv, out_proj, fc1, fc2) para reducir el impacto de outliers, seguida de una cuantizacion NVFP4 con escala fp8 group-16. Las "islas" en forma de U (embebidos de patch y tiempo, AdaLN) se mantienen en bf16 para preservar la precision en componentes criticos.

El LoRA turbo de 8 pasos se pliega en tiempo de empaquetado, evitando la dequantizacion en tiempo de ejecucion. No se han publicado datos sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion disponible.

## Capacidades

- Generacion de video con audio sincronizado a partir de prompts de texto (pipeline text-to-video).
- Comprension multimodal de entradas combinadas de texto, imagen, video y audio.
- Generacion completa en 8 pasos sin destilacion, conservando detalle fino y diversidad entre semillas.
- Tres niveles de calidad (T1/T2/T3) que permiten ajustar el equilibrio entre tamano, velocidad y estabilidad temporal.
- Integracion nativa con ComfyUI mediante el nodo `H3RotNVFP4Patch`, que ejecuta kernels W4A4 de nunchaku.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso (no aplica a un modelo de generacion de video).

## Casos de uso

- Previsualizacion cinematografica: crear storyboards animados o moodboards en movimiento con audio para presentar ideas a clientes o directores, usando el nivel T3 (18 GB) para maximizar la estabilidad temporal y el detalle.
- Prototipado rapido de contenido para redes sociales: generar clips de 5-10 segundos con audio para campañas de marketing, aprovechando el nivel T1 (10.8 GB) en una RTX 5070 Ti con 16 GB, con tiempos de generacion de unos 33 segundos por clip (8 pasos a 4.1 s/step).
- Produccion de material educativo: generar videos explicativos cortos con narracion y animaciones simples para cursos online, sin depender de APIs de pago ni subir datos a la nube.
- Investigacion en generacion multimodal: comparar salidas entre los niveles T1, T2 y T3 para estudiar el efecto de la cuantizacion en la diversidad y el parpadeo temporal, o validar nuevas tecnicas de compresion de modelos de difusion.
- Generacion local de video con fines artisticos: artistas digitales que necesitan iterar rapidamente sobre ideas visuales con audio, usando una GPU de consumo Blackwell en un estudio sin acceso a infraestructura de centro de datos.
- Pruebas de concepto en entornos con requisitos de privacidad: empresas que no pueden enviar prompts o material audiovisual a servicios externos, y que necesitan una solucion local que cumpla con la licencia comunitaria de MiniMax.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque se trata de un modelo de generacion de video, no de texto. El autor proporciona mediciones especificas de calidad y rendimiento:

| Metrica | T1 | T2 | T3 |
|---|---|---|---|
| Tamano del checkpoint | 10.8 GB | ~11.5 GB | ~18 GB |
| Flicker (×bf16, medido) | 1.69 | — | 1.39 |
| Sharpness (clipiqa+) | ≈ 0.43 (igual o superior a bf16) | — | — |

| Medida de velocidad (1× RTX 5070 Ti, sm_120, 1344×768, 8 pasos) | Valor |
|---|---|
| Tiempo por paso (NVFP4 nativo via `H3RotNVFP4Patch`) | ≈ 4.1 s/step |
| Aceleracion frente a bf16 en capas lineales del bloque | ≈ 5× |
| Tiempo total estimado por clip (8 pasos) | ≈ 33 s |

El autor advierte que no dispone de una metrica objetiva para medir la riqueza de detalle o la diversidad entre semillas, y recomienda la evaluacion visual directa.

## Requisitos de hardware

- GPU Blackwell obligatoria (RTX 50-series o GB10) para ejecutar los kernels NVFP4 nativos de nunchaku.
- VRAM minima: 16 GB para el nivel T1; 16-24 GB para T2; 24 GB para T3.
- GPU probada: RTX 5070 Ti (sm_120) a resolucion 1344×768 con 8 pasos, obteniendo 4.1 s/step.
- Despliegue: ComfyUI (version reciente) + nunchaku (wheel cu130) + nodo `H3RotNVFP4Patch` incluido en el repositorio. No se soportan vLLM, Ollama ni TGI.
- Es imprescindible usar el nodo `H3RotNVFP4Patch`; los cargadores genericos de NVFP4 degradan el rendimiento hasta ser mas lentos que fp16 al dequantizar a bf16 en tiempo de ejecucion.

## Comparativa con modelos similares

| Modelo | Tamano | Pasos | VRAM recomendada | Velocidad | Calidad |
|---|---|---|---|---|---|
| MiniMax-H3 original (bf16) | > 40 GB | 8 | 48+ GB (A100/H100) | lento | referencia completa |
| pottokao/MiniMax-H3-NVFP4-rotated (este) | 10.8-18 GB | 8 | 16-24 GB (RTX 50) | 4.1 s/step (5070 Ti) | detalle fino, mas diversidad |
| pottokao/MiniMax-H3-FastH3-NVFP4-rotated | no disponible | 4 | 16-24 GB (RTX 50) | ~5× menos pasos | menos detalle fino y diversidad |
| rockerBOO/minimax-h3-nvfp4 | no disponible | no disponible | no disponible | no disponible | cuantizacion NVFP4 sin rotacion ni nodo especifico |

La comparativa se basa en la informacion proporcionada por el autor y en la existencia del repositorio alternativo de rockerBOO. No se dispone de datos de rendimiento publicados para este ultimo.

## Limitaciones y advertencias

- Requiere exclusivamente GPU Blackwell (RTX 50-series o GB10); no funciona en arquitecturas anteriores (Ampere, Ada, etc.).
- El uso del nodo `H3RotNVFP4Patch` es obligatorio para obtener rendimiento NVFP4 real; un cargador generico puede ser mas lento que fp16.
- El nivel T1 presenta un parpadeo temporal (flicker) 1.69 veces superior al de bf16, lo que puede ser visible en escenas con movimiento rapido o texturas finas.
- No hay benchmarks formales de calidad; el autor admite que no puede medir objetivamente la riqueza de detalle o la diversidad.
- Licencia MiniMax-H3 Community License: uso comercial permitido con atribucion, pero usuarios en Estados Unidos, Reino Unido, Union Europea y Corea del Sur deben solicitar autorizacion a MiniMax; empresas con ingresos anuales superiores a 20 millones de dolares necesitan aprobacion explicita; prohibido destilar otros modelos utilizando salidas de MiniMax-H3.
- Se han reportado problemas de "GPU is lost" (TDR) en Windows con MiniMax-H3 en generacion repetida, segun un issue en el repositorio de ComfyUI.
- La generacion de video puede producir artefactos o alucinaciones visuales no medidos, especialmente con prompts complejos o fuera de distribucion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pottokao/MiniMax-H3-NVFP4-rotated
- Repositorio oficial de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Version alternativa de rockerBOO: https://huggingface.co/rockerBOO/minimax-h3-nvfp4
- Issue sobre fallos de GPU en Windows: https://github.com/Comfy-Org/ComfyUI/issues/15488
- Guia sobre MiniMax-H3 y cuantizaciones: https://www.stablediffusiontutorials.com/2026/08/minimax-h3.html
- Perfil del autor: https://huggingface.co/pottokao
