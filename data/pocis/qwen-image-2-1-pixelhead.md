# pocis/Qwen-Image-2.1-PixelHead

## Resumen

Qwen-Image-2.1-PixelHead es un cabezal de decodificación directa a píxeles (Direct Pixel Readout Head) de 25,4 millones de parámetros diseñado como alternativa al decodificador VAE oficial de Qwen-Image 2.1. Lo publica el usuario pocis en Hugging Face bajo licencia MIT y se distribuye como un checkpoint de 48,8 MiB en BF16 (o 97 MiB en FP32) que sustituye al VAE WanVAE de 644,2 MiB que acompaña al modelo base. No es un modelo generativo autónomo: es un componente que se acopla al DiT de Qwen-Image 2.1 durante el último paso de muestreo para producir imágenes RGBA de cuatro canales directamente desde las features internas del transformer.

El problema que resuelve es doble. Por un lado, elimina el cuello de botella de latencia del `VAEDecode` (372,30 ms en el VAE oficial frente a 5,55 ms del PixelHead, una aceleración de 67,1× medida en una NVIDIA L4 con resolución 768×768). Por otro, mitiga los fallos de memoria (OOM) que sufren las GPU de 8 y 12 GB al decodificar imágenes de alta resolución, ya que el pico de VRAM extra baja de aproximadamente 1,9–7,5 GB a menos de 0,2 GB. Es relevante ahora porque permite generar imágenes de alta resolución en hardware consumer sin sacrificar el resultado final, y porque añade salida alfa nativa, algo que el VAE estándar no ofrece de forma directa.

La implementación sigue la formulación del decodificador directo a píxeles descrita en el paper FastFrames (arXiv:2611.23226) y es compatible con el modelo base oficial, con la variante Qwen-Image-2.1-Uncensored-Omni y con LoRAs destiladas de 8 pasos. Se integra en ComfyUI mediante un nodo personalizado y no requiere reentrenar ni modificar los pesos del modelo base, que permanece congelado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezal de decodificación directa a píxeles (Direct Pixel Readout Head) sobre features de un DiT congelado; sigue la formulación FastFrames |
| Parámetros totales | 25,4 M (48,8 MiB en BF16; 97,0 MiB en FP32) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre el último paso de muestreo del DiT) |
| Tipos de cuantización | BF16 (trunk) con FP32 en normas y proyección de salida; FP32 completo en el checkpoint maestro. No se documentan otras cuantizaciones |
| Idiomas soportados | en, zh (heredados del modelo base Qwen-Image 2.1) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16 y FP32); workflows en JSON para ComfyUI |

## Arquitectura y entrenamiento

El PixelHead no es un transformer generativo, sino un decodificador ligero que se engancha al DiT de Qwen-Image 2.1 en el último paso de muestreo. Captura dos señales: las features contextualizadas de 4096 dimensiones que llegan a la capa `proj_out` del DiT (antes de la proyección) y el latente denoizado `x0_hat` de 64 canales. A partir de ambas, y sin cargar el decodificador WanVAE de 644,2 MiB, reconstruye directamente píxeles RGBA de cuatro canales. La formulación sigue el decodificador directo a píxeles de FastFrames (arXiv:2611.23226), que propone sustituir el VAE por un cabezal que aprovecha las representaciones internas del modelo de difusión.

El autor describe la implementación como "clean-room" (independiente) y con licencia MIT. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, algo esperable al tratarse de un decodificador y no de un modelo generativo. La innovación técnica principal es el ancho de banda de entrada (4096 + 64 dimensiones), que según el autor preserva el detalle de tipografías y líneas finas mejor que los VAE latentes pequeños, y el uso de FP32 en la proyección final para evitar bandas de cuantización en colores planos. El checkpoint BF16 se reporta como idéntico al FP32 en tiempo de ejecución (diferencia de 0,000000).

## Capacidades

- Decodificación directa de latentes a píxeles RGBA de cuatro canales en 5,55 ms, sin cargar el VAE oficial.
- Salida nativa de RGB más canal alfa (máscara de transparencia) y RGBA de cuatro canales.
- Compatibilidad con el modelo base Qwen-Image 2.1, la variante Qwen-Image-2.1-Uncensored-Omni y LoRAs destiladas de 8 pasos.
- Funciona tanto con CFG = 1,0 (8 pasos) como con CFG > 1,0 (20–35 pasos).
- Soporte de text-to-image y de edición multi-imagen por referencia (`<image1>`).
- Compatible con el nodo de caché QwenImage21Cache.
- Integración en ComfyUI mediante los nodos "Qwen-Image 2.1 Pixel Head Tap" y "Qwen-Image 2.1 Pixel Decode (Zero VAE)".
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Generación de imágenes de alta resolución en GPU de 8 o 12 GB: al reducir el pico de VRAM del decodificado a menos de 0,2 GB, permite completar imágenes de 2K sin OOM en tarjetas que con el VAE oficial fallan en el último paso.
- Pipelines de text-to-image de baja latencia: el decodificado de 5,55 ms frente a 372,30 ms reduce el tiempo total por imagen y mejora el throughput en servicios que generan muchas imágenes por minuto.
- Producción de assets con transparencia: la salida RGBA nativa evita pasos posteriores de segmentación o matting para generar PNG con alfa en flujos de diseño gráfico y composición.
- Tipografía y carteles: con 38,57 dB de PSNR en el conjunto de evaluación, preserva el detalle de letras pequeñas, útil para generación de pósters y material editorial.
- Ilustración 2D y cel art: 34,69 dB de PSNR y 0,1363 de LPIPS, adecuado para pipelines de anime y arte plano donde el banding de color es crítico.
- Retrato y bellas artes: 33,76 dB de PSNR medio (hasta 41,3 dB en retratos de claroscuro), útil para generación de retratos fotorrealistas con detalle en sombras.
- Integración en ComfyUI para prototipado: los workflows JSON en inglés y chino permiten comparar en la misma sesión la salida del PixelHead y la del VAE oficial, lo que facilita la validación antes de desplegar.
- Edición multi-imagen por referencia: combinado con el modo `<image1>` de Qwen-Image 2.1, permite flujos de edición de imagen con decodificado acelerado.

## Benchmarks y rendimiento

Evaluación sobre un split held-out a 768×768 en una NVIDIA L4, comparando con el VAE oficial `qwen_image_2.1_vae_bf16.safetensors` (alternando LoRA Turbo de 8 pasos con CFG 1,0 y base de 20–30 pasos):

| Decodificador | Tamaño | Latencia mediana | Aceleración | PSNR (↑) | LPIPS-VGG (↓) | VRAM extra pico | RGBA nativo |
|---|---|---|---|---|---|---|---|
| VAE oficial Qwen-Image 2.1 | 644,2 MiB | 372,30 ms | 1,0× | Referencia | 0,0000 | ~1,9–7,5 GB | Sí |
| QwenImage21 PixelHead | 48,8 MiB | 5,55 ms | 67,1× | 33,91 dB | 0,1524 | < 0,2 GB | Sí (4 canales) |

Resultados por categoría del PixelHead:

| Categoría | PSNR | LPIPS |
|---|---|---|
| Tipografía y carteles | 38,57 dB | 0,0653 |
| Anime 2D y cel art | 34,69 dB | 0,1363 |
| Retrato y bellas artes | 33,76 dB (medio) | No disponible |
| Retrato clásico (muestra) | 37,4 dB | No disponible |
| Terciopelo oscuro y brillos | 39,3 dB | No disponible |
| Tinta fina y grano de papel | 36,9 dB | No disponible |

No se han publicado resultados de benchmarks estándar de generación de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM extra para el decodificado: menos de 0,2 GB con el PixelHead, frente a aproximadamente 1,9–7,5 GB del VAE oficial.
- GPU recomendadas: el benchmark se realizó en una NVIDIA L4; el autor menciona explícitamente su utilidad en GPU de 8 GB y 12 GB (por ejemplo, RTX 3060 Ti, RTX 4070, RTX 4080) para evitar OOM en alta resolución.
- Cabe en GPU consumer: sí, es uno de sus objetivos principales; el peso del cabezal (48,8 MiB en BF16) es despreciable frente al modelo base.
- Opciones de despliegue: ComfyUI mediante el nodo personalizado ComfyUI-QwenImage21-PixelHead (requiere clonar el repositorio en `custom_nodes`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de componente.
- Latencia: 5,55 ms de decodificado medidos en L4 a 768×768; no se dispone de datos de throughput agregado ni de latencia en otras GPU.

## Comparativa con modelos similares

| Componente | Parámetros / tamaño | Función | Latencia (768×768, L4) | VRAM extra pico | RGBA nativo | Licencia |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-PixelHead (este) | 25,4 M / 48,8 MiB BF16 | Decodificador directo a píxeles | 5,55 ms | < 0,2 GB | Sí | MIT |
| VAE oficial Qwen-Image 2.1 (WanVAE) | 644,2 MiB BF16 | Decodificador latente a píxeles | 372,30 ms | ~1,9–7,5 GB | Sí | No disponible en la información proporcionada |
| VAE estándar de SDXL / Flux | No disponible | Decodificador latente a píxeles | No disponible | No disponible | No (RGB) | No disponible |

No se dispone de información sobre otros cabezales de decodificación directa a píxeles comparables en la documentación consultada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere el DiT de Qwen-Image 2.1 y no puede usarse por separado para text-to-image.
- No puede decodificar ficheros `.latent` guardados de forma externa: depende de las features de 4096 dimensiones capturadas en tiempo real durante el último paso de muestreo.
- El rango de pasos de muestreo cubierto es `ModelSamplingFlux(shift=0.69)` con sigma final en [0,038, 0,300], lo que corresponde a 8 pasos acelerados y a 18–35 pasos convencionales; fuera de ese rango no está validado.
- La calidad de reconstrucción es inferior al VAE oficial en términos objetivos: 33,91 dB de PSNR medio y 0,1524 de LPIPS, con pérdida de detalle en escenarios de líneas muy densas (el propio autor lo etiqueta como "stress test" en el grabado xilográfico).
- Idiomas limitados a inglés y chino, heredados del modelo base; los prompts en otras lenguas dependen de la cobertura multilingüe de Qwen-Image 2.1, no del PixelHead.
- Riesgo de sesgos y alucinaciones visuales: al no documentarse la composición del dataset de entrenamiento del cabezal, no se puede evaluar su comportamiento diferencial ante sesgos; hereda los del modelo base.
- La licencia MIT permite uso comercial y despliegue en plataformas cloud, pero conviene verificar la licencia del modelo base Qwen-Image 2.1 y de la LoRA de 8 pasos por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo se publicó el 22 de noviembre de 2026; se trata de un componente muy reciente con poca validación comunitaria.
- El autor no documenta el proceso de entrenamiento (datos, número de pasos, función de pérdida), lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pocis/Qwen-Image-2.1-PixelHead
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Paper FastFrames: https://arxiv.org/abs/2611.23226
- Nodo de ComfyUI (GitHub): https://github.com/Wither033/ComfyUI-QwenImage21-PixelHead
- Workflows incluidos en el repositorio: `workflows/01_QwenImage21_PixelHead_ZeroVAE_EN.json` y `workflows/01_QwenImage21_PixelHead_免VAE极速直出与对比_ZH.json`
