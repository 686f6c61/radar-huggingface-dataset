# PianoNic/EfRLFN-2x-WebGPU

## Resumen

EfRLFN-2x-WebGPU es un checkpoint del modelo de superresolución EfRLFN (Efficient Residual Local Feature Network), desarrollado por Bogatyrev et al. en el MSU Graphics & Media Lab y presentado en el artículo *Exploring Real-Time Super-Resolution: Benchmarking and Fine-Tuning for Streaming Content* (ICLR 2026). El modelo realiza superresolución de imagen y vídeo con un factor de escala 2x, tomando RGB en el rango 0..1 y devolviendo RGB en el mismo rango. Esta variante concreta, publicada por PianoNic, convierte los pesos originales a un formato de grafo que se ejecuta en el navegador mediante compute shaders WGSL sobre WebGPU, con pesos almacenados en float16.

El interés de esta ficha radica en que no es un modelo de lenguaje, sino un modelo de visión de muy bajo coste (487.010 parámetros, unos 486k multiply-adds por píxel de origen) optimizado para inferencia en tiempo real en el cliente. Forma parte del preset `ultra` del plugin ArtPlayerPluginLiveActionSR, que aplica superresolución a vídeo en streaming directamente en el navegador sin necesidad de servidor.

Los pesos son idénticos a los del EfRLFN original de los autores, afinados sobre vídeo de streaming comprimido (StreamSR), y solo se han convertido a float16 y a un formato de grafo JSON interpretable por los shaders. La licencia es MIT, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con bloques ERLFB (residual local feature blocks con atención ECA), upsampler con PixelShuffle |
| Parametros totales | 487.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión image-to-image) |
| Tipos de cuantizacion | float16 (pesos almacenados en float16; requiere shader-f16 en WebGPU) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (Copyright (c) 2026 MSU Graphics & Media Lab) |
| Formato de pesos | JSON con grafo DAG (`efrlfn-2x.json`), pesos en base64 little-endian float16 |
| Factor de escala | 2x |
| Entrada / salida | RGB 0..1 / RGB 0..1 |
| Coste computacional | ~486k multiply-adds por píxel de origen |
| Relleno (padding) | ceros, como en PyTorch |

## Arquitectura y entrenamiento

La red es una CNN de superresolución con una primera convolución 3x3 de 3 a 52 canales, seguida de 6 bloques ERLFB. Cada ERLFB aplica tres convoluciones 3x3 con activación tanh, una conexión residual (`+ x`), una convolución 1x1 y un módulo de atención ECA (global average pool, Conv1d con kernel 3 sobre canales, sigmoid y escalado). Tras los bloques, una convolución 3x3 opera sobre la suma del bloque 6 y la salida de `conv_1`, y un upsampler 3x3 de 52 a 12 canales aplica PixelShuffle(2) para producir la salida 2x.

El entrenamiento original corresponde a los autores del artículo: EfRLFN fue afinado sobre vídeo de streaming comprimido (dataset StreamSR) para mejorar el rendimiento en contenido real de plataformas de vídeo, donde los artefactos de compresión degradan las técnicas de superresolución entrenadas en imágenes naturales. Esta variante WebGPU no modifica los pesos más allá del almacenamiento en float16; el conversor, con comprobación numérica frente al modelo PyTorch original, está disponible en el repositorio del plugin (`tools/efrlfn`).

## Capacidades

- Superresolución de imagen y vídeo con factor 2x (RGB a RGB, valores 0..1).
- Procesamiento por fotograma apto para streaming en tiempo real en GPU de escritorio.
- Ejecución en navegador mediante WebGPU y compute shaders WGSL, sin backend servidor.
- Soporte de pesos en float16 (requiere la extensión `shader-f16` de WebGPU).
- Formato de grafo DAG con operaciones: `conv` (k×k, cualquier número de canales), `add`, `mul`, `activation` (tanh, sigmoid, relu), `global_avg_pool`, `channel_conv` y `depth_to_space`.
- Integración con el reproductor ArtPlayer a través del plugin `artplayer-plugin-liveaction-sr` (preset `ultra`).
- No soporta texto, tool calling, agentes ni capacidades multilingües: es exclusivamente un modelo de visión.

## Casos de uso

- Mejora de vídeo en streaming en el navegador: el plugin ArtPlayer aplica el modelo fotograma a fotograma sobre la reproducción, elevando por ejemplo 640×360 a 1280×720 en 12,0 ms por fotograma en una RTX 5080, lo que permite 30-60 fps en fuentes SD.
- Reproductores web con upscaling del lado del cliente: al ejecutarse en WebGPU, evita coste de servidor y reduce el ancho de banda necesario, ya que se puede enviar el vídeo en resolución baja y escalarlo localmente.
- Plataformas de vídeo con catálogo en SD: permite ofrecer una experiencia visual mejorada en equipos con GPU de escritorio sin reencodificar el catálogo completo.
- Aplicaciones de edición o visualización de vídeo en el navegador que necesiten previsualización a mayor resolución sin salir del entorno web.
- Prototipado de pipelines de superresolución: el formato de grafo JSON y el conversor permiten validar numéricamente el modelo frente a PyTorch antes de integrarlo.
- Investigación en superresolución para contenido comprimido: el checkpoint sirve como referencia del ajuste sobre StreamSR para comparar con otros métodos en condiciones de streaming.
- Demos educativas de WebGPU/WGSL: el modelo es un ejemplo compacto de red neuronal ejecutada como compute shaders en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS) en la información disponible. El autor sí proporciona medidas de velocidad en Chrome sobre una RTX 5080 con WebGPU y `shader-f16`:

| Fuente → salida | ms por fotograma |
|---|---|
| 640×360 → 1280×720 | 12,0 |
| 1280×720 → 2560×1440 | 53,9 |
| 1920×1080 → 3840×2160 | 123,0 |

Según la model card, el modelo es apto para tiempo real con fuentes SD en una GPU de escritorio rápida; para fuentes HD se recomienda el modelo más ligero LiveActionSR-2x (12k y 48k parámetros, 1-10 ms).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 487.010 parámetros en float16 los pesos ocupan aproximadamente 1 MB, por lo que el cuello de botella es el coste de cómputo por píxel, no la memoria.
- GPU recomendadas: el autor mide sobre una RTX 5080; se requiere una GPU con soporte de WebGPU y, para pesos float16, la extensión `shader-f16`.
- GPU de consumo: sí cabe en GPU de consumo; el rendimiento en tiempo real depende de la resolución de entrada y de la potencia de la GPU.
- Despliegue: navegador con WebGPU (Chrome en las pruebas del autor) mediante el plugin `artplayer-plugin-liveaction-sr`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 12,0 ms/fotograma para 640×360→1280×720, 53,9 ms/fotograma para 720p→1440p y 123,0 ms/fotograma para 1080p→4K en RTX 5080.

## Comparativa con modelos similares

| Modelo | Parámetros | Factor | Coste por píxel | Latencia (referencia) | Licencia |
|---|---|---|---|---|---|
| EfRLFN-2x-WebGPU | 487.010 | 2x | ~486k MACs | 12,0 ms (360p→720p, RTX 5080) | MIT |
| LiveActionSR-2x | 12k y 48k | 2x | no disponible | 1-10 ms | no disponible en la información |
| EfRLFN original (PyTorch) | 487.010 | 2x | ~486k MACs | no disponible | MIT |

La comparativa se limita a los modelos mencionados en la información proporcionada; no se dispone de datos de calidad (PSNR/SSIM) para contrastar con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Requiere WebGPU y, para los pesos float16, la extensión `shader-f16`; navegadores o GPU sin soporte no podrán ejecutarlo.
- Rendimiento en tiempo real solo garantizado para fuentes SD en GPU de escritorio rápida; a 1080p→4K los 123 ms/fotograma implican unos 8 fps, insuficiente para reproducción fluida.
- No se han publicado métricas de calidad (PSNR, SSIM, LPIPS) en la información disponible, por lo que no es posible evaluar la fidelidad de la reconstrucción sin pruebas propias.
- Al ser un modelo de superresolución, puede introducir artefactos, halos o texturas sintéticas en contenido con mucho detalle o compresión agresiva; no se documentan sesgos específicos.
- El padding es de ceros, lo que puede producir bordes ligeramente distintos a implementaciones con padding reflectivo.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright de MSU Graphics & Media Lab y citarse el artículo de los autores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/PianoNic/EfRLFN-2x-WebGPU
- Artículo: https://arxiv.org/abs/2602.11339
- Código de los autores: https://github.com/EvgeneyBogatyrev/EfRLFN
- Plugin y conversor: https://github.com/PianoNic/ArtPlayerPluginLiveActionSR
- Conversor EfRLFN: https://github.com/PianoNic/ArtPlayerPluginLiveActionSR/tree/main/tools/efrlfn
- Modelo ligero alternativo: https://huggingface.co/PianoNic/LiveActionSR-2x
