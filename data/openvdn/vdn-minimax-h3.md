# OpenVDN/vdn-minimax-h3

## Resumen

VDN-Minimax-H3 (VDN-H3) es un modelo de generación de vídeo texto-a-vídeo desarrollado por OpenVDN, construido como un ajuste fino del modelo MiniMax H3 de MiniMaxAI. Su aportación principal es una arquitectura de atención híbrida, denominada Video DeltaNet, que combina una rama de atención lineal por fotograma (altamente eficiente) con una rama softmax que preserva la calidad visual y la consistencia del modelo base. El resultado es un modelo capaz de generar vídeo más rápido de lo que se reproduce.

El modelo se distribuye como un checkpoint plug-and-play que añade una rama de atención lineal separada y dos pequeños adaptadores LoRA que pueden fusionarse con el backbone durante la inferencia sin modificar los pesos originales. Según el autor, con SGLang Diffusion sobre 8 GPUs B200 genera un clip de 14,4 segundos en aproximadamente 9,0 segundos de extremo a extremo (6,9 segundos de denoising) usando 8 pasos de denoising.

Es relevante porque aborda uno de los cuellos de botella clásicos de los modelos de vídeo: el coste cuadrático de la atención softmax sobre secuencias de fotogramas largas. Además, el ecosistema asociado (FreeVideo) permite ejecutar el modelo en GPUs de consumo con tan solo 8 GB de VRAM, lo que amplía considerablemente su accesibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con atención híbrida (rama de atención lineal por fotograma + rama softmax), basado en MiniMax H3 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera clips de hasta 345 fotogramas, ~14,4 s) |
| Tipos de cuantización | bf16, fp8 (mencionados en la documentación de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria, categoría "other") |
| Formato de pesos | safetensors (componentes modulares de diffusers) |

## Arquitectura y entrenamiento

VDN-H3 parte del backbone de difusión de MiniMax H3 y le incorpora una arquitectura de atención híbrida: una rama de atención lineal a nivel de fotograma, eficiente para secuencias largas, y una rama softmax que mantiene la calidad visual y la consistencia temporal del modelo original. El checkpoint añade además dos adaptadores LoRA de pequeño tamaño que se fusionan en el backbone en tiempo de inferencia, de modo que los pesos del modelo base no se alteran. La atención softmax de ventana se ejecuta mediante FlexAttention (con kernels de FlashAttention 4 en Hopper y Blackwell de centro de datos, y kernels Triton en Ampere, Ada y Blackwell de consumo).

El modelo se entrena con destilación a pocos pasos: la inferencia de referencia usa 8 evaluaciones del modelo (9 puntos en la rejilla sigma). El repositorio publica tanto los pesos como el stack de inferencia optimizado y el código de entrenamiento. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo soporta múltiples modalidades de generación con el mismo checkpoint: texto-a-vídeo con audio (T2VA), imagen-a-vídeo con audio (I2VA), primer y último fotograma a vídeo con audio (FL2VA) y último fotograma a vídeo con audio (L2VA).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio asociado (pipeline t2va).
- Generación de vídeo condicionada por imagen (I2VA), por primer y último fotograma (FL2VA) y por último fotograma (L2VA), todo con el mismo checkpoint.
- Generación de audio junto al vídeo, con su propia frecuencia de muestreo devuelta por el pipeline.
- Generación de clips de hasta 345 fotogramas (aproximadamente 14,4 segundos).
- Inferencia rápida mediante destilación a 8 pasos de denoising.
- Compatibilidad con SGLang Diffusion para despliegue de alto rendimiento.
- Soporte de offloading por grupo (a nivel de bloque o de hoja) para ejecución en GPUs con VRAM limitada.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Generación rápida de clips para previsualización creativa: con 8 pasos de denoising y ~9 segundos de extremo a extremo en 8×B200, permite iterar sobre prompts y keyframes en ciclos de producción ágiles.
- Publicidad y marketing: generación de vídeos cortos de ~14 segundos con audio sincronizado a partir de un guion de texto, adecuado para anuncios en redes sociales.
- Prototipado de storyboards animados: uso de I2VA y FL2VA para animar viñetas o keyframes concretos y validar la narrativa antes de la producción final.
- Creación de contenido para redes sociales en GPUs de consumo: mediante FreeVideo, el modelo se ejecuta con tan solo 8 GB de VRAM, lo que permite a creadores individuales generar vídeo en estaciones de trabajo locales.
- Investigación en arquitecturas de atención eficiente: el código de entrenamiento e inferencia publicado permite reproducir y extender el enfoque de atención híbrida Video DeltaNet sobre otros backbones de difusión.
- Integración en pipelines de postproducción: el soporte de audio generado y de condicionamiento por último fotograma facilita encadenar clips y transiciones coherentes en herramientas de edición automatizada.
- Despliegue en servidores de inferencia: con SGLang Diffusion y offloading por bloques, se puede servir generación de vídeo en infraestructura con GPUs de 24 GB (pico de 22 GB en bf16, 20 GB en fp8 para 345 fotogramas).

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Tiempo de denoising (8 pasos, 14,4 s de vídeo, 8×B200, SGLang Diffusion) | 6,9 s |
| Tiempo extremo a extremo (mismo setup) | ~9,0 s |
| Pasos de denoising | 8 evaluaciones del modelo (9 puntos sigma) |
| VRAM pico en GPU de 24 GB (345 fotogramas, bf16) | 22 GB |
| VRAM pico en GPU de 24 GB (345 fotogramas, fp8) | 20 GB |
| VRAM mínima con FreeVideo | 8 GB |

No se han publicado en la información disponible resultados comparativos de benchmarks de calidad (FVD, CLIP score u otros) frente a modelos similares.

## Requisitos de hardware

- VRAM estimada: 22 GB en bf16 y 20 GB en fp8 para 345 fotogramas con offloading por bloques en una GPU de 24 GB; 8 GB mínimo con FreeVideo.
- GPUs recomendadas para máximo rendimiento: 8×B200 con SGLang Diffusion (6,9 s de denoising, ~9,0 s extremo a extremo).
- GPUs de centro de datos: Hopper y Blackwell ejecutan la atención softmax de ventana sobre kernels de FlashAttention 4 vía FlexAttention.
- GPUs de consumo: Ampere, Ada y Blackwell de consumo (RTX 50) ejecutan la atención sobre kernels Triton de FlexAttention y kernels propios de PyTorch; no requieren FlashAttention.
- Cabe en GPUs de consumo: sí, con FreeVideo desde 8 GB de VRAM; en tarjetas de 24 GB (por ejemplo, RTX 4090) funciona con offloading por bloques.
- Opciones de despliegue: Diffusers (ModularPipeline con componentes modulares), SGLang Diffusion, FreeVideo para inferencia local, y scripts de inferencia del repositorio (infer_diffusers.py).
- Entorno: PyTorch 2.13 (2.13.0+cu129), Python 3.12, FlashAttention 4 opcional según arquitectura, Diffusers parcheado mediante scripts/setup_diffusers.sh.
- Latencia y throughput: ~9,0 s extremo a extremo para un clip de 14,4 s en 8×B200; no se dispone de cifras de throughput para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VDN-Minimax-H3 | no disponible | hasta 345 fotogramas (~14,4 s) | ~9,0 s extremo a extremo en 8×B200 | minimax-h3-community-license-agreement | Hugging Face, ModelScope, GitHub |
| MiniMax H3 (base) | no disponible | no disponible | no disponible (el autor indica que VDN-H3 acelera la inferencia con calidad casi sin pérdida) | licencia de MiniMax | Hugging Face (MiniMaxAI/MiniMax-H3) |
| Otros modelos text-to-video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para comparar con alternativas de terceros de forma cuantitativa.

## Limitaciones y advertencias

- Licencia comunitaria (minimax-h3-community-license-agreement): es necesario revisar el archivo LICENSE antes de descargar o ejecutar el modelo; pueden existir restricciones para uso comercial.
- Al ser un ajuste fino del modelo base MiniMax H3, hereda los sesgos y limitaciones de este, que no se detallan en la información disponible.
- Riesgo de alucinación visual y de inconsistencias temporales inherente a los modelos de difusión de vídeo; el autor afirma calidad "casi sin pérdida" frente al backbone, pero no se aportan métricas comparativas en la información disponible.
- Duración limitada: los clips generados rondan los 14,4 segundos (345 fotogramas); no se documenta soporte para secuencias más largas.
- Idiomas soportados no disponibles; no se especifica el comportamiento multilingüe de los prompts.
- Requiere un Diffusers parcheado y versiones específicas de PyTorch y FlashAttention, lo que añade complejidad al despliegue en producción.
- El consumo de VRAM en bf16 (22 GB para 345 fotogramas) obliga a usar offloading o fp8 en GPUs de 24 GB.
- No se han publicado resultados de benchmarks de calidad en la información disponible, por lo que la evaluación comparativa queda pendiente de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVDN/vdn-minimax-h3
- Paper (arXiv): https://arxiv.org/abs/2609.20744
- Blog: https://openvdn.github.io/
- Código (GitHub): https://github.com/OpenVDN/vdn-minimax-h3
- ModelScope: https://www.modelscope.ai/models/OpenVDN/vdn-minimax-h3
- FreeVideo (inferencia local): https://github.com/FlashML-org/FreeVideo
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de MiniMax-H3 en SGLang: https://github.com/sgl-project/sglang/blob/main/docs/cookbook/diffusion/MiniMax/MiniMax-H3.mdx#7-vdn-h3-hybrid-attention-8-step-distill
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- FlashAttention 4 / FlexAttention (PyTorch): https://pytorch.org/blog/flexattention-flashattention-4-fast-and-flexible/
