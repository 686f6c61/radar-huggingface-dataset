# ausboss/FlashVSR-v1.1-ComfyUI

## Resumen

FlashVSR v1.1 es un modelo de superresolución de vídeo basado en difusión, desarrollado originalmente por Junhao Zhuang y el equipo de OpenImagingLab, y publicado en el artículo *FlashVSR: Towards Real-Time Diffusion-Based Streaming Video Super-Resolución* (arXiv:2510.12747). El repositorio que nos ocupa, `ausboss/FlashVSR-v1.1-ComfyUI`, no es un modelo nuevo ni un reentrenamiento: es un reempaquetado del modelo oficial en un único archivo safetensors de 3,5 GB pensado para el nodo *FlashVSR Upscale* del paquete ComfyUI-AusBoss. Resuelve el problema de aumentar resolución y nitidez de vídeos existentes (de 1x a 4x) mediante un pipeline de difusión en streaming, con atención a la eficiencia de memoria.

La relevancia de este reempaquetado es práctica: condensa cuatro componentes del release oficial (el modelo de difusión en streaming, el proyector de entrada de baja calidad `lq_proj_in`, el decodificador `tc_decoder` y el condicionamiento positivo) en un solo archivo fp16, eliminando la necesidad de cargar varios ficheros y de ejecutar código al cargar los pesos (los `.ckpt` y `.pth` originales se han convertido a safetensors). Con ello se simplifica el despliegue en ComfyUI, aunque el archivo solo funciona con el nodo del autor del repack.

El modelo está pensado para flujos de postproducción y mejora de vídeo en local. En una RTX 5090 procesa un clip de 97 fotogramas a 2x con un consumo de unos 10 GB de VRAM a 576x1024 (unas 7 fps) y de unos 16 GB a 1152x2048 por teselas (unas 2 fps), con la ventaja de que la memoria no crece con la duración del clip gracias al procesamiento en streaming.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para superresolución de vídeo en streaming (basado en Wan 2.1, según los tags del repo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips; el ejemplo medido es de 97 fotogramas) |
| Tipos de cuantización | fp16 (único formato distribuido en este repo) |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`flashvsr_v1.1_fp16.safetensors`, 3,5 GB) |

## Arquitectura y entrenamiento

FlashVSR es un modelo de difusión para superresolución de vídeo orientado a streaming, según el título del paper y los tags del repositorio. El archivo empaquetado contiene el modelo de difusión en streaming (`diffusion_pytorch_model_streaming_dmd.safetensors` en el release oficial), el proyector de entrada de baja calidad (`LQ_proj_in.ckpt`), el decodificador (`TCDecoder.ckpt`) y el condicionamiento positivo (`posi_prompt.pth`). Los tags del repo indican que se apoya en Wan 2.1, y el nodo permite conectar opcionalmente el VAE de Wan 2.1, aunque no es obligatorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el autor del repack declara explícitamente que no ha reentrenado ni ajustado nada, solo ha convertido los pesos a fp16 y a safetensors. La innovación técnica destacable es el procesamiento en streaming, que permite que un clip largo no consuma más VRAM que uno corto, junto con la decodificación DMD (destilación de destilación de difusión) implícita en el nombre del checkpoint oficial.

## Capacidades

- Superresolución de vídeo con factores de escala de 1 a 4 (según el nodo).
- Mejora de nitidez y detalle en vídeos de baja calidad.
- Procesamiento en streaming: la memoria no crece con la duración del clip.
- Procesamiento por teselas para resoluciones altas (por ejemplo, 1152x2048 en dos teselas).
- Integración nativa con ComfyUI mediante el nodo *FlashVSR Upscale* del paquete ComfyUI-AusBoss.
- Conexión opcional del VAE de Wan 2.1 en el nodo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de vídeo, no un LLM.

## Casos de uso

- Restauración de metraje de archivo: aplicar un factor 2x o 4x a vídeos antiguos o comprimidos para recuperar detalle antes de montaje final, usando el nodo de ComfyUI sobre las secuencias de fotogramas.
- Postproducción de vídeo independiente: mejorar planos rodados a baja resolución o con compresión agresiva sin salir de un flujo ComfyUI local, aprovechando que el clip largo no incrementa la VRAM.
- Previsualización de calidad en pipelines de VFX: generar versiones ampliadas de planos proxy para revisión con clientes antes del render final a resolución completa.
- Mejora de contenido para redes sociales: escalar clips de móvil a 1080p o 4K por teselas, con throughput de unas 7 fps a 576x1024 en una RTX 5090.
- Upcycling de material generado por IA: aplicar superresolución a vídeos producidos por modelos generativos (incluido Wan 2.1) para aumentar su resolución final sin reentrenar nada.
- Restauración de grabaciones de vigilancia o domótica: aumentar la resolución de clips cortos en local con una GPU de consumo, dado el bajo consumo de VRAM (unos 10 GB a 2x).
- Prototipado de investigación en superresolución de vídeo: usar el checkpoint empaquetado como referencia rápida para comparar con otros métodos de SR de vídeo dentro de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repack solo aporta mediciones de velocidad y memoria en una RTX 5090 para un clip de 97 fotogramas ampliado a 2x:

| Resolución de salida | Velocidad | VRAM |
|---|---|---|
| 576 x 1024 | ~7 fps | ~10 GB |
| 1152 x 2048 (dos teselas) | ~2 fps | ~16 GB |

## Requisitos de hardware

- VRAM estimada: unos 10 GB para 2x a 576x1024; unos 16 GB para 2x a 1152x2048 con dos teselas (mediciones del autor en RTX 5090).
- GPU recomendadas: RTX 5090 (medida oficial); por consumo de VRAM, cabría esperar funcionamiento en GPUs de 16 GB o más, aunque no hay mediciones publicadas en otras tarjetas.
- ¿Cabe en GPU de consumo? Sí, según las cifras del autor: 10 GB de VRAM para el caso 2x a 576x1024 entra en tarjetas de 12 GB o más; el caso 4K por teselas requiere 16 GB o más.
- Opciones de despliegue: ComfyUI con el paquete ComfyUI-AusBoss (nodo *FlashVSR Upscale*). El archivo solo funciona con ese nodo; para el código oficial hay que usar los ficheros oficiales.
- Latencia y throughput: ~7 fps a 576x1024 y ~2 fps a 1152x2048 en RTX 5090; la memoria no escala con la duración del clip.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de superresolución de vídeo comparables (parámetros, contexto, benchmarks o licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El archivo es un reempaquetado no oficial: solo funciona con el nodo *FlashVSR Upscale* de ComfyUI-AusBoss; no es utilizable con el código oficial de OpenImagingLab.
- Solo se distribuye en fp16; no hay versiones cuantizadas (GGUF, int8, etc.) en este repositorio.
- No se han publicado evaluaciones de calidad objetivas (PSNR, SSIM, LPIPS) en la información disponible; las únicas métricas son de velocidad y VRAM.
- Riesgo de artefactos y alucinación visual propios de los modelos de difusión: el modelo puede inventar detalle inexistente en zonas de baja calidad, algo crítico en contextos forenses o de vigilancia.
- Las mediciones de rendimiento proceden de una única GPU (RTX 5090) y de un único clip de 97 fotogramas; no hay datos de latencia en otras tarjetas.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar la licencia del modelo base original y del código de OpenImagingLab antes de producción.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni limitaciones idiomáticas o de contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ausboss/FlashVSR-v1.1-ComfyUI
- Modelo base oficial: https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1
- Código oficial: https://github.com/OpenImagingLab/FlashVSR
- Paquete ComfyUI del autor: https://github.com/ausboss/ComfyUI-AusBoss
- Paper: https://arxiv.org/abs/2510.12747
