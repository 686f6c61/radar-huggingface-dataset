# cetini18/jit-sr

## Resumen

JiT-SR es un modelo de superresolución de imagen (image-to-image) desarrollado por el usuario cetini18, que adapta la arquitectura JiT-B/16 (Just image Transformer) para realizar superresolución 4x en un solo paso directamente en el espacio de píxeles. A diferencia de los enfoques basados en difusión que requieren un bucle de muestreo iterativo y un VAE, JiT-SR genera la imagen de alta resolución (512 x 512) en una única pasada, partiendo de la imagen de baja resolución previamente escalada con interpolación bicúbica.

El modelo se distribuye como pesos EMA (model_ema1) en formato safetensors fp32 (aproximadamente 0,55 GB por variante) y cuenta con dos checkpoints: `lrfeat_nofdl_c70_ep38` (136,0 M de parámetros, 134,9 GMACs) y `lrskip_nofdl_c70_ep38` (135,5 M de parámetros, 127,5 GMACs). Ambos se han afinado desde el checkpoint JiT-B/16 de ImageNet a 512 px y están pensados para restauración de imágenes del mundo real.

Su relevancia radica en la eficiencia: elimina el coste computacional del muestreo difusivo manteniendo una calidad competitiva en métricas de fidelidad y percepción sobre los conjuntos RealSR y DRealSR. La licencia MIT y su tamaño compacto lo hacen atractivo para integración en pipelines de restauración de imagen en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imagen (JiT-B/16, Just image Transformer), one-step, pixel-space |
| Parametros totales | 136,0 M (`lrfeat_nofdl_c70_ep38`) / 135,5 M (`lrskip_nofdl_c70_ep38`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, ~0,55 GB por variante) |

## Arquitectura y entrenamiento

JiT-SR emplea una arquitectura transformer de imagen basada en JiT-B/16, adaptada para superresolución 4x en un solo paso y en el espacio de píxeles. La entrada es la imagen de baja resolución (recortes de 128 x 128) escalada bicúbicamente a 512 x 512, y la salida es la imagen de alta resolución de 512 x 512. No utiliza VAE ni bucle de muestreo por difusión. Existen dos variantes: `lrfeat_nofdl_c70_ep38`, que incorpora decodificador resize_res, skip de LR y pirámide de características de LR (mejor fidelidad), y `lrskip_nofdl_c70_ep38`, con decodificador resize_res y skip de LR sin pirámide de características.

El entrenamiento parte del checkpoint JiT-B/16 de ImageNet a 512 px y se afina con pérdidas MSE en píxeles, LPIPS, DISTS y un GAN con discriminador U-Net (peso 0,05), seguido de una continuación con tasa de aprendizaje constante. Se entrenó únicamente con degradaciones sintéticas, sin datos reales emparejados. Los pesos publicados corresponden a las EMA (`model_ema1`); no se incluyen discriminador ni optimizador. La implementación se basa en la reimplementación en PyTorch de JiT de Tianhong Li, descrita en *Back to Basics: Let Denoising Generative Models Denoise* (Li y He, arXiv:2511.13720).

## Capacidades

- Superresolución 4x de imágenes en un solo paso, con salida de 512 x 512 píxeles.
- Restauración de imagen en el espacio de píxeles, sin VAE ni muestreo difusivo iterativo.
- Entrada image-to-image: recibe la imagen de baja resolución escalada bicúbicamente y devuelve la imagen de alta resolución.
- Dos variantes con distinto equilibrio fidelidad/percepción (con y sin pirámide de características de LR).
- Compatible con posprocesado AdaIN (ajuste de media y desviación típica por canal respecto a la entrada LR escalada) para mejorar PSNR y LPIPS.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo escala 4x en un solo paso, adecuado para digitalización de archivos y colecciones con requisitos de latencia baja.
- Mejora de imágenes en pipelines de preprocesado para visión por computador: al aumentar la resolución de 128 a 512 px en una pasada, se puede integrar antes de detectores o clasificadores que se beneficien de más detalle.
- Restauración de capturas de pantalla y contenido web: útil para mejorar miniaturas o imágenes comprimidas antes de su publicación.
- Procesado por lotes en servidores sin GPU de gama alta: con 136 M de parámetros y ~135 GMACs a 512 x 512, el coste por imagen es bajo comparado con métodos de difusión multi-paso.
- Integración en aplicaciones móviles o de borde: el tamaño compacto del checkpoint (~0,55 GB en fp32) y la ausencia de bucle de muestreo facilitan el despliegue en entornos con recursos limitados.
- Investigación en restauración de imagen: las dos variantes y las recetas de entrenamiento publicadas en el repositorio permiten reproducir y comparar enfoques one-step frente a métodos difusivos.
- Mejora de imágenes médicas o de satélite de baja resolución (con cautela): el modelo se entrenó con degradaciones sintéticas, por lo que su uso en dominios muy específicos requiere validación previa.

## Benchmarks y rendimiento

Resultados a 4x, salida 512 x 512, un solo paso, sobre RealSR (100 imágenes) y DRealSR (93 imágenes). *Raw* es la salida del modelo; *AdaIN* aplica coincidencia de media y desviación típica por canal respecto a la entrada LR escalada. Menor es mejor para LPIPS, DISTS y FID; mayor es mejor para el resto.

| Modelo | Conjunto | Salida | PSNR | SSIM | LPIPS | DISTS | FID | MUSIQ |
|---|---|---|---:|---:|---:|---:|---:|---:|
| `lrfeat_nofdl_c70_ep38` | RealSR | raw | 25,72 | 0,737 | 0,263 | 0,206 | 112,1 | 66,6 |
| | RealSR | AdaIN | 26,62 | 0,745 | 0,261 | 0,203 | 112,3 | 66,4 |
| | DRealSR | raw | 28,20 | 0,766 | 0,296 | 0,211 | 138,7 | 61,8 |
| | DRealSR | AdaIN | 29,45 | 0,781 | 0,288 | 0,207 | 137,9 | 61,5 |
| `lrskip_nofdl_c70_ep38` | RealSR | raw | 25,48 | 0,730 | 0,265 | 0,207 | 117,8 | 66,1 |
| | RealSR | AdaIN | 26,47 | 0,739 | 0,261 | 0,204 | 118,0 | 66,0 |
| | DRealSR | raw | 27,93 | 0,764 | 0,294 | 0,212 | 139,5 | 61,8 |
| | DRealSR | AdaIN | 29,30 | 0,780 | 0,285 | 0,207 | 137,0 | 61,5 |

Los conjuntos de evaluación son pequeños: diferencias por debajo de ~0,1 dB PSNR o 0,002 LPIPS están dentro del ruido. En el repositorio de GitHub (`docs/c70_eval.md`, `docs/postprocessing.md`, `docs/pocketsr_comparison.md`) hay métricas adicionales (CLIPIQA, CLIPIQA+, MANIQA, TOPIQ, NIQE, A-FINE), resultados en DIV2K y comparación con otros métodos one-step.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 136 M de parámetros en fp32 (~0,55 GB de pesos) y salida 512 x 512, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU moderna con al menos ~4-6 GB de VRAM debería ser suficiente (RTX 3060/4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: el repositorio de GitHub proporciona código en PyTorch (`main_jit.py`, `scripts/load_hf_checkpoint.py`, `eval_ckpt.sh`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de imagen).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiT-SR (`lrfeat_nofdl_c70_ep38`) | Transformer de imagen one-step | 136,0 M | Pixel-space, sin VAE ni difusión iterativa | MIT | HuggingFace + GitHub |
| JiT-SR (`lrskip_nofdl_c70_ep38`) | Transformer de imagen one-step | 135,5 M | Pixel-space, sin VAE ni difusión iterativa | MIT | HuggingFace + GitHub |
| StableSR | Difusión (Stable Diffusion) | no disponible | Difusión con VAE y posprocesado AdaIN | no disponible | no disponible |
| PocketSR | One-step | no disponible | Comparado en `docs/pocketsr_comparison.md` | no disponible | no disponible |

No se dispone de datos detallados de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada; la comparación cuantitativa con métodos one-step está en el repositorio de GitHub.

## Limitaciones y advertencias

- Entrenado solo con degradaciones sintéticas; no se usaron datos reales emparejados, por lo que la generalización al mundo real depende de cuán bien coincida el pipeline de degradación con imágenes reales.
- La salida raw presenta más contraste local que la verdad fundamental; el posprocesado AdaIN mejora PSNR y LPIPS pero empeora las métricas sin referencia.
- Evaluado únicamente a 512 x 512; no se documenta comportamiento a otras resoluciones.
- Los conjuntos de evaluación (RealSR, DRealSR) son pequeños, por lo que diferencias pequeñas entre variantes pueden ser ruido.
- No incluye capacidades de texto, tool calling ni agentes; es exclusivamente un modelo de imagen.
- No se documentan sesgos específicos; al ser un modelo visual, puede amplificar artefactos o patrones presentes en los datos de entrenamiento.
- Licencia MIT: permite uso comercial, pero se recomienda validar el rendimiento en el dominio concreto antes de producción.
- Solo se publican los pesos EMA; el discriminador y el optimizador no están incluidos, lo que limita la reproducción completa del entrenamiento sin las recetas del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/cetini18/jit-sr
- Repositorio GitHub: https://github.com/nitec427/jit-sr
- Paper de referencia (JiT): *Back to Basics: Let Denoising Generative Models Denoise* (Li y He), arXiv:2511.13720 — https://arxiv.org/abs/2511.13720
- Documentación de evaluación: `docs/c70_eval.md` en el repositorio de GitHub
- Documentación de posprocesado: `docs/postprocessing.md` en el repositorio de GitHub
- Comparación con PocketSR: `docs/pocketsr_comparison.md` en el repositorio de GitHub
