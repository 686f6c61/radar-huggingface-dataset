# Efficient-Large-Model/Open-H3-Regenerate-2K

## Resumen

Open-H3-Regenerate-2K es un paquete de refinamiento de vídeo construido sobre MiniMax-H3, el modelo de generación de vídeo de MiniMax. Lo publica el equipo Efficient-Large-Model (vinculado al proyecto Sana de NVIDIA) como reemplazo abierto de la API cerrada H3-Regenerate-2K. Su función es tomar un borrador de vídeo generado por H3 a 768P (1344×768, 121 fotogramas, unos 5 segundos) y regenerarlo a 2560×1440 mediante un upscaling latente seguido de un refinamiento de tres pasos.

El repositorio no contiene un modelo completo entrenado desde cero, sino un conjunto de componentes: una LoRA fusionada (FP32, rango 576 sobre 312 capas lineales) que combina tres adaptadores (refiner Open-H3, LightX2V FL2VA Turbo v1.2 y LMS Sharp v1.0), un upscaler latente 3D convolucional en BF16, un decodificador VAE rápido no causal de 24 capas (1,62B parámetros, destilado de StreamRender-H3) y una copia sin modificar de los componentes Diffusers de MiniMax-H3 en la revisión `6818f6c`.

Su relevancia es doble: por un lado ofrece una ruta de superresolución de vídeo de alta calidad sin depender de una API propietaria; por otro, incorpora el motor Sol-Engine (Sol-Attn, MXFP8, CUDA graphs) que acelera el pipeline hasta 3,89× en una B200, reduciendo un clip de 5 s a 2560×1440 de 87,26 s a 22,45 s. El repositorio ocupa 164,9 GB e incluye los pesos base necesarios para ejecutarlo de forma autocontenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax-H3) con LoRA fusionada; VAE rapido no causal de 24 capas; upscaler latente 3D convolucional |
| Parametros totales | no disponible (pesos base MiniMax-H3 + LoRA rango 576 + VAE rapido de 1,62B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; entrada 121 fotogramas a 1344×768) |
| Tipos de cuantizacion | BF16 (transformer y upscaler), FP32 (LoRA y ramas AdaLN), MXFP8 en el motor Sol-Engine |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (con componentes de terceros bajo sus propias licencias) |
| Formato de pesos | safetensors (LoRA, VAE rapido, base_model en Diffusers) |

## Arquitectura y entrenamiento

El componente central es una LoRA fusionada que se aplica sobre el transformer de MiniMax-H3. La fusión concatena los factores de tres adaptadores a lo largo del eje de rango: el refiner Open-H3 (paso 5000 EMA, rango/alpha 384/384), LightX2V FL2VA Turbo v1.2 (rango 128, alpha 8) y LMS Sharp v1.0 (rango 64). Las fuerzas y el alpha/rango de Turbo se pliegan en la matriz `B`, de modo que `B @ A` equivale exactamente a la suma de los tres deltas escalados; la verificación de fusión (`MERGE_VERIFY.json`) reporta un error relativo de 2,2e-8 sobre las 312 capas lineales. Las 50 ramas AdaLN de la curva LMS Sharp se mantienen como módulos separados porque reciben una curva de timesteps de 8 dimensiones en lugar de la entrada de capa.

El pipeline de inferencia consta de upscaling latente, refinamiento de tres pasos Euler con sigmas `[0.909375, 0.857143, 0.666667, 0]`, CFG 1 y estado inicial `(1 - 0.909375) * upscaled + 0.909375 * noise`, con tiempo de modelo `1 - sigma`, seguido de decodificación VAE. El decodificador VAE rápido proviene de StreamRender-H3: es no causal, de 24 capas y 1,62B parámetros, destilado del VAE original de H3, y decodifica el clip a 2560×1440 en 1,6 s frente a los 15 s del VAE publicado. La aceleración adicional procede del motor Sol-Engine, que combina atención Sol-Attn, precisión MXFP8 y CUDA graphs. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Refinamiento de vídeo vídeo-a-vídeo: regenera un borrador de 768P (1344×768, 121 fotogramas) a 2560×1440.
- Upscaling latente 3D convolucional previo al refinamiento, en BF16.
- Refinamiento en tres pasos con CFG 1, lo que reduce coste computacional frente a muestreos más largos.
- Decodificación VAE rápida opcional (1,6 s por clip a 2560×1440) para acelerar el pipeline completo.
- Aceleración por hardware mediante Sol-Engine: Sol-Attn, MXFP8 y CUDA graphs.
- Compatibilidad con Diffusers para los componentes base (transformer, VAE, VAE de audio, text encoder, tokenizer, processor, schedulers).
- Integración con ComfyUI a través de los componentes base y de las LoRA de origen (LightX2V, LMS Sharp).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni comprensión multilingüe; es un modelo de generación y refinamiento de vídeo.

## Casos de uso

- Postproducción de vídeo generado: partiendo de clips H3 a 768P, el pipeline los regenera a 2560×1440 en un solo paso de refinamiento de tres etapas, útil para entregables de mayor resolución sin reentrenar el modelo base.
- Pipelines de generación de vídeo en producción: con el motor Sol-Engine y el VAE rápido, un clip de 5 s se procesa en 22,45 s en una B200, lo que permite integrar el refinamiento como etapa final de un flujo automatizado de creación de contenido.
- Restauración y mejora de borradores: el refiner Open-H3 corrige artefactos y detalle del borrador mientras el upscaler latente aumenta la resolución, adecuado para material generado con modelos más ligeros.
- Flujos de trabajo en ComfyUI: los componentes base y las LoRA de origen (LightX2V Turbo, LMS Sharp) están pensados para nodos de ComfyUI, lo que facilita prototipado e iteración por artistas técnicos.
- Investigación en superresolución de vídeo: el paquete incluye la receta completa (LoRA fusionada, verificación de merge, configuración de muestreo) para reproducir y comparar variantes de refinamiento.
- Evaluación de aceleración de inferencia: sirve como banco de pruebas reproducible de Sol-Attn, MXFP8 y CUDA graphs frente a atención densa en BF16, con cifras medidas en B200.
- Generación de vídeo con audio: los componentes base incluyen VAE de audio y text encoder, lo que permite construir pipelines de vídeo con audio sincronizado sobre la misma base MiniMax-H3.

## Benchmarks y rendimiento

Rendimiento medido en una B200 para un clip de 5 s, latente 768P a vídeo 2560×1440 (upscaling latente + refinamiento de 3 pasos + decodificación VAE, en caliente, mediana de 3 ejecuciones):

| Forward | VAE decoder | Total | Aceleracion |
|---|---|---:|---:|
| `standard_fwd` (atencion densa, BF16) | VAE H3 publicado | 87,26 s | 1,00× |
| `sol_engine_fwd` (Sol-Attn, MXFP8, CUDA graphs) | VAE H3 publicado | 37,39 s | 2,33× |
| `sol_engine_fwd` (Sol-Attn, MXFP8, CUDA graphs) | VAE rapido H3 | 22,45 s | 3,89× |

El upscaling latente y el refinamiento por sí solos pasan de 73,11 s a 20,46 s (3,57×). El VAE rápido decodifica el clip a 2560×1440 en 1,6 s frente a 15 s del VAE publicado. No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, FVD u otros) en la información disponible.

## Requisitos de hardware

- El rendimiento publicado se midió en una NVIDIA B200; no se documentan cifras para otras GPU.
- El repositorio completo ocupa 164,9 GB, por lo que se necesita almacenamiento amplio además de la VRAM.
- El transformer base de MiniMax-H3 se ejecuta en BF16 y el motor Sol-Engine usa MXFP8; el VAE rápido tiene 1,62B parámetros.
- No se especifica la VRAM mínima ni si el pipeline cabe en GPU de consumo (RTX 4090 u otras); dato no disponible.
- Opciones de despliegue documentadas: Diffusers para los componentes base, ComfyUI para los flujos con LoRA, y el código de Sol-Engine en el repositorio NVlabs/Sana (rama `sol-engine`).
- El script `download.py` descarga los pesos de este repositorio, el adaptador opcional HyperFlow de 8 pasos y la tabla `adaln_t_table` de 1025×8 desde `Comfy-Org/MiniMax-H3`.
- Latencia y throughput: 22,45 s por clip de 5 s a 2560×1440 con Sol-Engine y VAE rápido en B200; 87,26 s con atención densa en BF16 y VAE publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de salida | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Open-H3-Regenerate-2K | Refinamiento vídeo-a-vídeo sobre MiniMax-H3 | 2560×1440 | no disponible (LoRA rango 576 + VAE 1,62B) | 121 fotogramas | minimax-h3-community | Hugging Face, código en NVlabs/Sana |
| H3-Regenerate-2K (API cerrada) | Refinamiento vídeo-a-vídeo propietario | 2560×1440 | no disponible | no disponible | propietaria | solo API |
| MiniMax-H3 (base) | Generación de vídeo | 768P (1344×768) | no disponible | 121 fotogramas | minimax-h3-community | Hugging Face |
| StreamRender-H3 | Decodificador VAE rápido | no aplica | 1,62B (VAE) | no aplica | no disponible | NVlabs/Sana |

La comparación directa con alternativas de superresolución de vídeo de código abierto no está disponible en la información proporcionada. La referencia más cercana es el propio H3-Regenerate-2K cerrado, del que este paquete es reemplazo abierto, y el modelo base MiniMax-H3, del que hereda arquitectura y licencia.

## Limitaciones y advertencias

- El paquete no está cubierto por una licencia única: la LoRA del refiner, el VAE rápido y `base_model/` siguen la MiniMax H3 Community License (con sus términos de territorio, uso y redistribución), mientras que el upscaler latente, LightX2V FL2VA Turbo y LMS Sharp mantienen sus propias licencias. Es obligatorio revisar cada componente antes de uso comercial.
- La licencia del código de ejecución no sustituye las licencias de los modelos.
- Es un modelo especializado en refinamiento de vídeo: no ofrece generación de texto, código, matemáticas ni tool calling.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad objetiva del vídeo generado; no hay datos de PSNR, SSIM o FVD en la información disponible.
- El pipeline asume una entrada concreta (borrador H3 de 1344×768 y 121 fotogramas); no se documenta comportamiento con otras resoluciones o duraciones.
- Las cifras de rendimiento proceden de una única GPU (B200) en condiciones en caliente; no hay datos de latencia en otras GPU ni de consumo de VRAM.
- El repositorio incluye una copia de los pesos base de MiniMax-H3 en la revisión `6818f6c`, lo que fija la compatibilidad a esa revisión.
- El VAE rápido es una destilación del VAE original; puede introducir diferencias de calidad respecto a la decodificación con el VAE publicado, aunque no se cuantifican en la información disponible.
- No se especifican los idiomas soportados por el text encoder incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K
- Página del proyecto: https://nvlabs.github.io/Sana/Open-H3-Regenerate-2K/
- Código (rama sol-engine): https://github.com/NVlabs/Sana/tree/sol-engine/models/Open-H3-Regenerate-2K
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/6818f6c32d12b210915e44ad56a4228c2608f160/LICENSE
- Revisión base fijada: https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/6818f6c32d12b210915e44ad56a4228c2608f160
- StreamRender-H3: https://nvlabs.github.io/Sana/Sol-Engine/StreamRender-H3/
- Upscaler latente (ComfyUI): https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler
- LightX2V FL2VA Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo/tree/3ec17a324ced54151364f24f8b5fb6bf7e26414f
- LMS Sharp v1.0: https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/blob/main/loras/minimax_h3_lms_v1.0_r64.safetensors
- Tensor `adaln_t_table` (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
