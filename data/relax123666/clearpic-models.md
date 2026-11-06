# relax123666/clearpic-models

## Resumen

ClearPic models es un repositorio de conversión de pesos de Real-ESRGAN al formato ONNX, publicado por el usuario relax123666. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero, sino de una exportación de los pesos oficiales de Real-ESRGAN (Wang et al., ICCVW 2021) para su uso con ONNX Runtime Web. El repositorio incluye tres variantes del modelo: `realesr-general-x4v3` para fotografía general, `RealESRGAN_x4plus` para máxima calidad en fotografías y `RealESRGAN_x4plus_anime_6B` para ilustración y anime.

El propósito declarado es servir de backend de superresolución para ClearPic, una aplicación web que realiza upscaling de imágenes directamente en el navegador mediante ONNX Runtime Web. Esto resulta relevante porque permite ejecutar superresolución 4x en cliente, sin enviar imágenes a un servidor, lo que reduce latencia, coste de infraestructura y exposición de datos del usuario.

El repositorio es pequeño (0,1 GB), tiene cero descargas y cero likes en el momento de la consulta, y se distribuye bajo licencia BSD 3-Clause heredada de los pesos originales de Real-ESRGAN. No es un modelo de propósito general: su única tarea es la superresolución de imagen (image-to-image) con factor de escala 4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red generativa convolucional para superresolución (RRDBNet en las variantes x4plus; arquitectura compacta en realesr-general-x4v3), según los pesos oficiales de Real-ESRGAN |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantización | No se documentan cuantizaciones; los pesos se exportan en float32 |
| Idiomas soportados | No aplica (modelo de imagen) |
| Licencia | BSD 3-Clause |
| Formato de pesos | ONNX (opset 17), exportado con `torch.onnx.export` |

Detalles de interfaz del grafo ONNX:

| Elemento | Especificación |
|---|---|
| Entrada | `input`: float32, `[1, 3, H, W]`, RGB en `[0, 1]`; H y W dinámicos |
| Salida | `output`: float32, `[1, 3, 4H, 4W]`, RGB en `[0, 1]` (requiere clipping) |
| Factor de escala | 4x |
| Fidelidad respecto a PyTorch | Diferencia máxima de 1e-5 |
| Variantes incluidas | `realesr-general-x4v3.onnx` (v0.2.5.0), `RealESRGAN_x4plus.onnx` (v0.1.0), `RealESRGAN_x4plus_anime_6B.onnx` (v0.2.2.4) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión de formato de los pesos oficiales de Real-ESRGAN. La arquitectura subyacente es la descrita en el paper original de Real-ESRGAN, que emplea una red generativa convolucional con bloques residuales densos (RRDBNet) para las variantes x4plus, y una variante más ligera y generalista en `realesr-general-x4v3`. El entrenamiento original se realizó con datos sintéticos puros para simular degradaciones del mundo real (desenfoque, ruido, compresión JPEG), lo que permite superresolución ciega sobre imágenes reales sin necesidad de un kernel de degradación conocido.

La innovación de esta exportación concreta es operativa: los tres modelos se han convertido a ONNX con opset 17 mediante `torch.onnx.export`, con dimensiones espaciales dinámicas (H y W no fijas) y una fidelidad numérica respecto a los pesos PyTorch originales de hasta 1e-5. Esto habilita su ejecución en navegador con ONNX Runtime Web, sin dependencia de CUDA ni de un servidor. No se documentan en la información disponible detalles sobre el número exacto de parámetros, tokens de entrenamiento ni técnicas de RLHF/DPO, ya que no aplican a este tipo de modelo.

## Capacidades

- Superresolución de imagen con factor de escala 4x sobre entradas RGB en `[0, 1]`.
- Superresolución ciega de fotografías reales con degradaciones desconocidas (ruido, desenfoque, compresión), gracias al entrenamiento con datos sintéticos de Real-ESRGAN.
- Variante específica para anime e ilustración (`RealESRGAN_x4plus_anime_6B`), optimizada para líneas limpias y colores planos.
- Variante generalista rápida (`realesr-general-x4v3`) pensada para fotografía general con menor coste computacional.
- Procesamiento por lotes de tamaño 1 (batch fijo en la firma del grafo).
- Entradas de resolución variable gracias a las dimensiones dinámicas H y W.
- Ejecución en navegador mediante ONNX Runtime Web (WebGPU/WASM, según el runtime del cliente).
- No soporta tool calling, agentes, razonamiento multi-step, texto, audio ni visión de alto nivel; es exclusivamente image-to-image.

## Casos de uso

- Mejora de fotos en aplicaciones web sin backend: ClearPic usa estos modelos para upscaling 4x en el navegador con ONNX Runtime Web, de modo que la imagen del usuario nunca sale del cliente y se elimina el coste de GPU en servidor.
- Restauración de fotografías antiguas o de baja resolución: `RealESRGAN_x4plus` reconstruye detalles en imágenes con ruido y compresión, adecuado para digitalización de archivos familiares o escaneos de baja calidad.
- Preparación de imágenes para impresión: el factor 4x permite escalar una imagen de 512x512 a 2048x2048 antes de imprimir, con la variante x4plus priorizando calidad sobre velocidad.
- Upscaling de ilustración y material de anime: `RealESRGAN_x4plus_anime_6B` está entrenado para líneas y colores planos, útil en pipelines de publicación de cómics, fan art o assets de videojuegos.
- Preprocesado en pipelines de visión por computador: aumentar la resolución de recortes pequeños antes de pasarlos a un detector o clasificador, mejorando la señal de entrada sin reentrenar el modelo posterior.
- Prototipado y demos offline-first: al ser ONNX con dimensiones dinámicas, se puede integrar en aplicaciones de escritorio o web que deban funcionar sin conexión, usando el runtime ONNX en lugar de PyTorch.
- Thumbnails y previsualizaciones en CMS o marketplaces: generar versiones ampliadas de imágenes de producto o portadas con la variante generalista rápida para mantener tiempos de respuesta bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como PSNR, SSIM, LPIPS ni comparativas con otros modelos de superresolución; únicamente declara que las salidas ONNX coinciden con los pesos PyTorch originales con una tolerancia de 1e-5.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende de la resolución de entrada y de la variante. Como referencia cualitativa, `realesr-general-x4v3` es la más ligera y `RealESRGAN_x4plus` la más costosa.
- GPU recomendadas: no documentadas en la información disponible. Al ser un modelo ONNX ejecutable en navegador, el objetivo principal es GPU de cliente (WebGPU) o CPU vía WASM.
- ¿Cabe en GPU consumer? No hay datos concretos publicados; por el tamaño del repositorio (0,1 GB para tres modelos) es plausible que quepa en GPU consumer, pero no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime Web (objetivo declarado), ONNX Runtime nativo (CPU/GPU), y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Factor de escala | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearPic models (este repo) | Superresolución ciega | 4x | ONNX (opset 17) | BSD 3-Clause | Hugging Face, 0 descargas |
| Real-ESRGAN oficial (xinntao) | Superresolución ciega | 4x | PyTorch (.pth) | BSD 3-Clause | GitHub oficial |
| Otros modelos de superresolución (p. ej. SwinIR, ESRGAN) | Superresolución | 2x/4x/8x | PyTorch | Varía | No comparado en la información disponible |

La comparación relevante es contra los pesos PyTorch originales de Real-ESRGAN: este repositorio es una conversión de formato con fidelidad numérica de 1e-5, por lo que el rendimiento cualitativo debería ser equivalente al oficial, con la ventaja de portabilidad a ONNX Runtime Web y la posible penalización de rendimiento del runtime frente a PyTorch nativo (no cuantificada en la información disponible).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, audio ni tareas de razonamiento; cualquier evaluación como LLM carece de sentido.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (2026-10-26); no hay evidencia de uso en producción ni de validación externa.
- No se documentan métricas de calidad (PSNR, SSIM, LPIPS) ni comparativas con alternativas, por lo que la calidad real sobre imágenes concretas no está verificada en la información disponible.
- La salida puede requerir clipping a `[0, 1]`; omitirlo puede producir artefactos o valores fuera de rango.
- Batch fijo a 1: no soporta procesamiento por lotes en una sola pasada del grafo.
- Riesgo de artefactos típicos de Real-ESRGAN: sobre-suavizado, halos en bordes y alucinación de texturas en zonas de bajo detalle, especialmente en la variante anime aplicada a fotografía o viceversa.
- La licencia BSD 3-Clause permite uso comercial, pero se debe conservar el aviso de copyright y la atribución a Xintao Wang et al.; el repositorio es solo una conversión de formato y no otorga derechos adicionales sobre los pesos originales.
- No hay información sobre sesgos, ya que no es un modelo generativo de contenido semántico; los sesgos relevantes serían los del dataset de entrenamiento original, no documentados aquí.
- La disponibilidad futura del repositorio no está garantizada (autor único, sin actividad).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/relax123666/clearpic-models
- Aplicación ClearPic: https://clearpic.tomdebug.com/
- Repositorio oficial de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper de Real-ESRGAN (ICCVW 2021): https://arxiv.org/abs/2107.10833
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
