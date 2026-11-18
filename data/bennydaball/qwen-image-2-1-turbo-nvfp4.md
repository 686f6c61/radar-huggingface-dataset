# BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4

## Resumen

Qwen-Image-2.1-Turbo-NVFP4 es una cuantización en formato NVFP4 del modelo de difusión Qwen-Image-2.1-Turbo, desarrollada por el usuario independiente BennyDaBall y publicada en Hugging Face. No se trata de un modelo original, sino de una redistribución optimizada para ComfyUI que reduce el peso del paquete completo de BF16 a 15,70 GB (un 51,6 % menos), manteniendo la arquitectura del transformer de difusión original de Qwen. El modelo base pertenece a la familia Qwen-Image, orientada a generación y edición de imágenes de alta fidelidad, incluyendo tipografía y fondos transparentes nativos.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación de imágenes de gama alta en hardware de consumo, concretamente en una única GPU RTX 5090, con un esquema de muestreo de solo ocho pasos (Euler, CFG 1, schedule oficial de Turbo). El autor ha aplicado una cuantización selectiva: 144 matrices del transformer en NVFP4 y 48 matrices sensibles preservadas en BF16, más un encoder con 188 matrices NVFP4 y 64 en BF16.

La versión de noviembre de 2026 introduce un segundo fichero (`qwen_image_2.1_turbo_nvfp4_BdB_SR.safetensors`) calibrado sobre ejecuciones reales del denoiser en ComfyUI, que reduce el error por paso un 21 % en text-to-image y un 25 % en edición de imágenes respecto al fichero original, según las mediciones del propio autor. La licencia es `qwen-research`, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base Qwen-Image-2.1-Turbo), cuantizado selectivamente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (matrices principales) + BF16 (matrices sensibles); INT8 ConvRot disponible como referencia del modelo oficial |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (diffusion-single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo es una cuantización del transformer de difusión Qwen-Image-2.1-Turbo, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer de difusión para text-to-image y edición de imágenes, acompañado de un encoder de texto basado en Qwen3-VL de 8B (`qwen3vl_8b_turbo_nvfp4.safetensors`, 9,33 GB) y un VAE en BF16 (0,68 GB). El pipeline completo suma 15,70 GB en disco.

La innovación técnica principal es la cuantización selectiva en NVFP4 con preservación de capas sensibles. El autor utilizó sondas de capas en BF16 y comparaciones de imagen para decidir qué matrices comprimir: en el transformer, 144 matrices van en NVFP4 y 48 se mantienen en BF16; en el encoder, 188 en NVFP4 y 64 en BF16 (las capas de visión y embedding se preservan). La variante `BdB_SR` se calibró sobre ejecuciones reales del denoiser en ComfyUI 0.45.0, cubriendo tanto text-to-image como edición, en lugar de usar redondeo simple (round-to-nearest). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de imágenes text-to-image con muestreo de ocho pasos (Euler, CFG 1, schedule oficial de Turbo).
- Edición de imágenes: cambio de vestuario u otros atributos a partir de una fotografía de referencia.
- Generación de fondos transparentes nativos en RGBA (recorte de producto con canal alfa).
- Combinación de múltiples referencias en una sola generación.
- Tipografía y lettering de campaña, incluyendo salida a 1536×1024 y 2048×2048 (2K).
- Ilustración y fotografía de moda/casual.
- Compatibilidad nativa con ComfyUI sin nodos personalizados ni parches del core.
- Siete workflows listos para cargar que cubren los casos anteriores.

## Casos de uso

- Generación de imágenes de moda y fotografía casual: con ocho pasos y CFG 1, el modelo produce renders en aproximadamente 2,2 segundos por imagen en una RTX 5090, adecuado para iteración rápida de conceptos visuales.
- Edición de vestuario sobre fotografía de referencia: el workflow 02 permite sustituir prendas manteniendo la identidad del sujeto, útil en catálogos de e-commerce y previsualización de colecciones.
- Recorte de producto con alfa nativo: el workflow 03 genera PNG con transparencia real (RGBA), lo que evita post-procesado de máscaras en pipelines de fichas de producto.
- Campañas tipográficas: el workflow 05 genera lettering a 1536×1024 y el 07 a 2048×2048, con instrucciones de citar literalmente el texto y describir su colocación, apto para piezas publicitarias.
- Composición con múltiples referencias: el workflow 04 combina dos referencias visuales, útil para moodboards y dirección de arte asistida.
- Despliegue local en estación de trabajo con GPU de consumo: al ocupar 15,70 GB en disco y ejecutarse en una RTX 5090, permite flujos de generación de imágenes sin depender de servicios en la nube.
- Integración en ComfyUI como motor de imágenes dentro de pipelines creativos automatizados, sin necesidad de nodos personalizados.

## Benchmarks y rendimiento

El autor publica métricas comparativas medidas en una RTX 5090 con ComfyUI 0.45.0, 12 prompts × 6 semillas, schedule oficial de 8 sigma, Euler, CFG 1 y encoder de texto BF16. Cada render se compara contra el render BF16 de la misma semilla.

| Fichero del transformer | LPIPS vs BF16 (menor = mejor) | LPIPS mediana | PSNR | Tiempo en caliente (s/imagen) |
|---|---:|---:|---:|---:|
| INT8 ConvRot oficial (7,26 GB) | 0,057 | 0,035 | 28,3 dB | 2,17 |
| `qwen_image_2.1_turbo_nvfp4.safetensors` original | 0,166 | 0,144 | 20,5 dB | 2,25 |
| `qwen_image_2.1_turbo_nvfp4_BdB_SR.safetensors` (nuevo) | 0,136 | 0,111 | 21,3 dB | 2,27 |

El fichero nuevo queda más cerca de BF16 en 45 de 72 renders (LPIPS medio −0,030, IC 95 % −0,050 a −0,011; PSNR +0,8 dB). En edición de imágenes, el error por paso del denoiser baja un 25 % (240 llamadas de edición retenidas, más cercano en las 240). En text-to-image, el error por paso baja un 21 % (320 llamadas retenidas, más cercano en 298). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de difusión de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete completo ocupa 15,70 GB en disco (transformer 5,69 GB, encoder 9,33 GB, VAE 0,68 GB).
- GPU recomendada: RTX 5090 (hardware en el que el autor construyó y probó todos los workflows).
- Cabe en GPU de consumo: sí, según el autor, en una RTX 5090; no se confirma compatibilidad con GPUs de menor VRAM.
- Opciones de despliegue: ComfyUI 0.39.0 o superior (probado en 0.45.0), sin nodos personalizados ni parches del core.
- Latencia y throughput: aproximadamente 2,25–2,27 segundos por imagen en caliente en RTX 5090 con 8 pasos.
- El workflow opcional con encoder BF16 requiere `qwen3vl_8b_bf16.safetensors` de Comfy-Org.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (LPIPS vs BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo NVFP4 (este) | no disponible | no disponible | 0,136 (BdB_SR) / 0,166 (original) | qwen-research | Hugging Face, 38.909 descargas |
| Qwen-Image-2.1-Turbo INT8 ConvRot oficial | no disponible | no disponible | 0,057 | qwen-research | Referencia del autor; pesos oficiales en Comfy-Org |
| Qwen-Image-2.1-Turbo BF16 (modelo base) | no disponible | no disponible | 0 (referencia) | qwen-research | Hugging Face (Qwen/Qwen-Image-2.1-Turbo) |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks frente a otros modelos de difusión de imágenes. El INT8 oficial es más fiel a BF16 (LPIPS 0,057) pero pesa 7,26 GB frente a los 5,69 GB del transformer NVFP4.

## Limitaciones y advertencias

- La licencia `qwen-research` restringe el uso comercial; es imprescindible revisar el enlace de licencia del modelo base antes de cualquier despliegue en producción.
- El modelo es una cuantización no oficial realizada por un tercero (BennyDaBall), no por Qwen; no hay garantías de soporte ni de paridad exacta con el modelo original.
- La fidelidad respecto a BF16 es limitada: LPIPS de 0,136 y PSNR de 21,3 dB, inferiores al INT8 oficial (0,057 y 28,3 dB).
- Los benchmarks publicados son mediciones del propio autor en una única RTX 5090 y con un conjunto acotado de prompts y semillas; no son una evaluación independiente.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación visual del modelo base en la documentación proporcionada.
- El muestreo requiere mantener el schedule oficial de ocho pasos; alterarlo puede degradar la calidad.
- Las dimensiones de salida deben ser divisibles por 16 para obtener el tamaño exacto.
- Para edición y referencias es necesario copiar previamente las imágenes de `input/` a `ComfyUI/input/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Checksums: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4/resolve/main/SHA256SUMS
- Comparativas de imagen: COMPARISONS.md (en el repositorio)
- Workflows de ejemplo: workflows/ (en el repositorio)
- Muestras: assets/showcase_grid.jpg (en el repositorio)
- ComfyUI 0.39.0: https://github.com/Comfy-Org/ComfyUI/releases/tag/v0.39.0
- Encoder BF16 opcional (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main/split_files/text_encoders
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
