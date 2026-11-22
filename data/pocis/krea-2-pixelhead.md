# pocis/Krea-2-PixelHead

## Resumen

Krea-2-PixelHead es un cabezal de lectura directa a píxeles (pixel head) para el modelo de difusión texto-a-imagen Krea-2, desarrollado por el usuario pocis y publicado bajo licencia MIT. No es un modelo generativo autónomo, sino un decodificador ligero que sustituye al VAE oficial (`qwen_image_vae.safetensors`) en la etapa final del muestreo, convirtiendo directamente las características internas del DiT en una imagen RGB sin necesidad de cargar un VAE 3D-causal.

El componente sigue la formulación de Direct Pixel Decoder descrita en el artículo FastFrames (arXiv:2611.23226). Captura los tokens objetivo de imagen de 6144 dimensiones del `SingleStreamDiT` congelado, justo antes de la capa `last.linear`, junto con el latente denoizado `x0_hat_norm` de 2×2, y decodifica a RGB en un solo paso. Con 27,49 millones de parámetros y 52,6 MiB en BF16, reduce el tiempo de decodificación de 1468,9 ms a 59,55 ms, un factor de 24,7×.

Su relevancia práctica es doble: elimina los picos de VRAM asociados al VAE de alta resolución (que pueden alcanzar 1,8-5,5 GB) y acelera el pipeline completo de generación en ComfyUI, manteniendo una fidelidad media de 33,33 dB PSNR en un conjunto de validación de arte fino. Es compatible con las variantes Turbo (8 pasos), Raw y cuantizaciones FP8/INT8/GGUF de Krea-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel head (decodificador directo) sobre SingleStreamDiT de Krea-2; formulación Direct Pixel Decoder de FastFrames |
| Parametros totales | 27,49 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone Krea-2) |
| Tipos de cuantizacion | BF16 (trunk) + FP32 (proyección de salida); checkpoint maestro FP32 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16 y FP32) |

## Arquitectura y entrenamiento

El pixel head actúa como un decodificador no invasivo sobre el backbone Krea-2 congelado. En el último paso de muestreo intercepta dos señales: los tokens de imagen objetivo modulados de 6144 dimensiones procedentes del `SingleStreamDiT`, antes de `last.linear`, con eliminación automática de los tokens de texto y de referencia de estilo de longitud variable; y el latente denoizado `x0_hat_norm` de 2×2 con `d_lat=64`. A partir de ambas representaciones proyecta directamente a RGB, evitando el VAE 3D-causal oficial.

El modelo se distribuye en dos checkpoints: uno BF16 con proyección de salida en FP32 (52,6 MiB, recomendado, sin pérdida de calidad frente a FP32) y un maestro FP32 completo de 104,9 MiB. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; el artículo de referencia es FastFrames (arXiv:2611.23226). La innovación principal es la eliminación del VAE en la inferencia, con compatibilidad para 8 pasos Turbo (CFG 1.0), 20-35 pasos multietapa (CFG > 1.0) y edición con imagen de referencia de estilo.

## Capacidades

- Decodificación directa de latentes Krea-2 a imágenes RGB sin cargar VAE.
- Sustitución del nodo `VAEDecode` en ComfyUI mediante `Krea-2 Pixel Decode (Zero VAE)`.
- Captura de características del DiT con eliminación automática de tokens de texto y de referencia de estilo.
- Compatibilidad con Krea-2 base, Turbo (8 pasos, CFG 1.0), Raw, cuantizaciones FP8/INT8/GGUF y fine-tunes de la comunidad.
- Soporte de flujos texto-a-imagen y edición con referencia de estilo.
- Integración nativa con ComfyUI a través de nodo personalizado y registro oficial.
- Idiomas de la interfaz y documentación: inglés y chino simplificado.
- No realiza generación autónoma: requiere el backbone Krea-2 para producir imágenes.

## Casos de uso

- Generación de imágenes en producción con ComfyUI: sustituir el VAE por el pixel head reduce el tiempo de decodificación de 1468,9 ms a 59,55 ms, lo que acelera pipelines de texto-a-imagen de alta resolución en los que la etapa de decodificación es cuello de botella.
- Despliegue en GPUs con VRAM limitada: al eliminar los picos de 1,8-5,5 GB del VAE oficial y mantenerse por debajo de 0,2 GB, permite generar imágenes de alta resolución en tarjetas consumer donde el VAE provocaría OOM.
- Iteración rápida en estudios de arte digital: con 33,33 dB PSNR medio y hasta 41,6 dB en retratos, es adecuado para previsualización y selección de variaciones antes de un refinado final con el VAE oficial.
- Servicios de generación por lotes: el menor consumo de VRAM y la latencia reducida permiten aumentar el throughput por GPU en colas de renderizado de imágenes.
- Flujos de edición con referencia de estilo: el modelo elimina automáticamente los tokens de referencia, por lo que puede usarse en pipelines de image-to-image con guía de estilo sin adaptaciones adicionales.
- Integración en nodos personalizados de ComfyUI: desarrolladores pueden incorporar el pixel head en sus propios workflows mediante los nodos `Krea-2 Pixel Head Tap` y `Krea-2 Pixel Decode (Zero VAE)`.
- Comparación A/B de calidad: el repositorio incluye un workflow que ejecuta en paralelo el VAE oficial y el pixel head para evaluar diferencias visuales antes de migrar en producción.

## Benchmarks y rendimiento

Evaluación sobre 40 pinturas y grabados de alta complejidad en un split de validación de 768×768, alternando 8 pasos Turbo (σ = 0,3109) y multietapa (σ = 0,1163), frente al VAE oficial `qwen_image_vae.safetensors` de `Comfy-Org/Krea-2`:

| Decodificador | Tamano | Latencia mediana | Aceleracion | PSNR validacion | LPIPS-VGG | VRAM extra pico |
|---|---|---|---|---|---|---|
| `qwen_image_vae` (WanVAE) oficial | 242,0 MiB | 1468,90 ms | 1,0× | referencia | 0,0000 | ~1,8-5,5 GB |
| `Krea2PixelHead` | 52,6 MiB | 59,55 ms | 24,7× | 33,33 dB | 0,2300 | < 0,2 GB |

Resultados por muestra destacados: retrato renacentista con lechuguilla plisada 37,1 dB; manos y traje en óleo 39,1 dB; ilustración multisujecto en color 32,9 dB; grabado fino a punta seca 30,8 dB. En retratos en tonos oscuros se alcanzan valores de 39,1-41,6 dB.

## Requisitos de hardware

- VRAM para inferencia: inferior a 0,2 GB adicionales sobre el backbone Krea-2; el checkpoint BF16 ocupa 52,6 MiB en disco y el FP32 104,9 MiB.
- GPU recomendadas: cualquier GPU capaz de ejecutar Krea-2; el pixel head añade una carga mínima, por lo que se beneficia especialmente de tarjetas con VRAM ajustada.
- Cabe en GPU consumer: sí, al eliminar los picos de VRAM del VAE oficial (1,8-5,5 GB) permite ejecutar decodificación en tarjetas donde el VAE provocaría OOM.
- Opciones de despliegue: ComfyUI mediante el nodo `ComfyUI-Krea2-PixelHead` (instalable vía ComfyUI Manager con el identificador `comfyui-krea2-pixelhead` o por `git clone`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: latencia mediana de decodificación de 59,55 ms frente a 1468,90 ms del VAE oficial, un factor de 24,7×. No se proporcionan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Backbone objetivo | Parametros | Tamano | Latencia | PSNR | Licencia |
|---|---|---|---|---|---|---|
| Krea-2-PixelHead (este) | Krea-2 | 27,49 M | 52,6 MiB BF16 | 59,55 ms | 33,33 dB | MIT |
| Qwen-Image-2.1-PixelHead | Qwen-Image 2.1 | no disponible | 48,8 MiB (1×) / 52,1 MiB (1×+2× 2048px) | 5,55 ms | 33,91 dB | MIT |
| `qwen_image_vae` oficial (WanVAE) | Krea-2 | no disponible | 242,0 MiB | 1468,90 ms | referencia | no disponible |

El pixel head de Qwen-Image 2.1 pertenece a la misma familia FastFrames y ofrece soporte RGBA de 4 canales nativo y decodificación 2× SR a 2048px, con una aceleración de 67,1×. Ambos son específicos del backbone para el que fueron entrenados y no son intercambiables entre sí.

## Limitaciones y advertencias

- No es un modelo generativo independiente: requiere el backbone Krea-2 y no puede producir imágenes por sí solo.
- Fidelidad no idéntica al VAE oficial: LPIPS-VGG de 0,2300 frente a 0,0000 de referencia; el PSNR medio de 33,33 dB implica diferencias perceptibles en texturas de alta frecuencia.
- Variabilidad por contenido: los peores casos del conjunto de validación bajan a 30,8 dB (grabado fino), por lo que en dominios muy texturados puede ser recomendable el VAE oficial.
- Específico de Krea-2: no funciona con otros backbones de difusión; cada modelo requiere su propio pixel head.
- Sin datos publicados sobre sesgos: la información disponible no documenta sesgos demográficos ni de representación del modelo base.
- Riesgo de alucinación heredado: al depender de Krea-2, cualquier artefacto o contenido inventado por el backbone se reproduce en la salida.
- Idiomas: la documentación y la interfaz solo están en inglés y chino simplificado.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las condiciones del backbone Krea-2 subyacente, que se distribuye por separado.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 22 de noviembre de 2026, sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/pocis/Krea-2-PixelHead
- Repositorio ComfyUI: https://github.com/Wither033/ComfyUI-Krea2-PixelHead
- Registro Comfy: https://registry.comfy.org/publishers/wither033/nodes/comfyui-krea2-pixelhead
- Paper FastFrames: https://arxiv.org/abs/2611.23226
- Pixel head para Qwen-Image 2.1 (misma familia): https://huggingface.co/pocis/Qwen-Image-2.1-PixelHead
- Nodo ComfyUI para Qwen-Image 2.1: https://github.com/Wither033/ComfyUI-QwenImage21-PixelHead
- Modelo base: https://huggingface.co/Comfy-Org/Krea-2
- Variante Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Variante Raw: https://huggingface.co/krea/Krea-2-Raw
