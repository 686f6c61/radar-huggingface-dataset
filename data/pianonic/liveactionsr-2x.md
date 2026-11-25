# PianoNic/LiveActionSR-2x

## Resumen

LiveActionSR-2x es una pareja de redes neuronales convolucionales minúsculas para superresolución 2x del canal de luma, diseñadas específicamente para escalar vídeo en streaming (películas y series) en tiempo real dentro del navegador. Lo desarrolla PianoNic y se distribuye como parte del plugin ArtPlayerPluginLiveActionSR, ejecutándose como shaders WGSL escritos a mano sobre WebGPU. A diferencia de los modelos de superresolución orientados a fotografía, estos se entrenaron con metraje de acción real sometido a round-trips reales de x264, x265 y SVT-AV1, de modo que aprenden a reconstruir artefactos de compresión típicos del streaming.

El modelo `balanced` tiene 12.340 parámetros (16 canales × 7 convoluciones) y el `quality` 47.716 parámetros (32 canales × 7 convoluciones). Ambos operan únicamente sobre luma BT.709 en rango 0..1 y producen una salida 2x con un residual bilineal; la crominancia se escala de forma bilineal, sin superresolución. El objetivo declarado es caber en unos pocos milisegundos por fotograma incluso en GPUs integradas, lo que explica el tamaño extremadamente reducido.

La relevancia actual está en el nicho de upscaling de vídeo en cliente sin servidor: permite mejorar la nitidez percibida de un stream 1080p hacia 4K o de 720p hacia 1440p en el propio navegador con WebGPU, sin coste de infraestructura. Se publica bajo licencia MIT, con pesos en formato JSON propio del plugin, ONNX y safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN fully-convolutional con residual bilineal (7 conv 3x3 + ReLU + depth_to_space 2x) |
| Parametros totales | `balanced`: 12.340; `quality`: 47.716 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen/vídeo, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en JSON, ONNX y safetensors; el plugin ejecuta en f16 sobre WebGPU) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | JSON propio del plugin, ONNX, safetensors (state dict de PyTorch) |

## Arquitectura y entrenamiento

La red es una CNN secuencial muy compacta: una convolución 3x3 de 1 a C canales, ReLU, cinco bloques de convolución 3x3 de C a C con ReLU, una convolución 3x3 de C a 4 canales y una operación `depth_to_space(2)` que reordena los 4 canales en una salida 2x. A esa salida se le suma un residual bilineal 2x con centros de medio píxel y clamp-to-edge, y el resultado se recorta a [0,1]. El padding es clamp-to-edge (replicate) en todas las capas. C es 16 en `balanced` y 32 en `quality`.

El entrenamiento usa pérdida L1, optimizador AdamW, parches LR de 64×64 y precisión bf16. `balanced` se entrenó 200.000 iteraciones y `quality` 300.000, en una única RTX 5080, con 1 h 40 min de extremo a extremo incluyendo la preparación de datos. El conjunto de entrenamiento consta de 6.464 clips y 75.372 pares, con fuentes de licencia permisiva: Netflix Open Content (Chimera, El Fuente, Meridian, Nocturne, Sparks, CC BY 4.0), Tears of Steel (Blender Foundation, CC BY 3.0), UVG-VCM (Tampere University, CC BY 4.0) y secuencias de test de TU Múnich y SVT. Los pares de entrenamiento se generaron haciendo pasar el metraje por round-trips reales de x264, x265 y SVT-AV1 a calidades de streaming (CRF 18–46), además de algunas muestras limpias.

## Capacidades

- Superresolución 2x del canal de luma de fotogramas de vídeo, con salida 2H×2W.
- Reconstrucción orientada a artefactos de compresión de vídeo (x264, x265, SVT-AV1), no a fotografía limpia.
- Ejecución en tiempo real en navegador mediante WebGPU y shaders WGSL, con precisión f16.
- Integración directa como plugin de ArtPlayer para reproductores de streaming (HLS, m3u8).
- Escalado bilineal de crominancia (no superresuelta) y tone-mapping de HDR a SDR realizado por el plugin.
- Cadena completa del plugin con deband, CNN, sharpening y grano de película añadido después.
- Exportación a ONNX Runtime (entrada `1×1×H×W`, salida `1×1×2H×2W`, residual bilineal incluido).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Upscaling de streaming en el navegador: el plugin aplica el modelo fotograma a fotograma sobre el vídeo decodificado, mejorando la nitidez percibida de un stream 1080p hacia 4K sin servidor intermedio, gracias a los 2,95 ms por fotograma de `balanced` en una RTX 5080.
- Reproductores web de bajo consumo: en GPUs integradas, la variante `balanced` (12.340 parámetros) permite mantener 60 fps con margen, al estar dimensionada para unos pocos milisegundos por fotograma.
- Plataformas OTT con catálogo comprimido: al haberse entrenado con round-trips de x264/x265/AV1, el modelo reduce artefactos de bloques y ringing típicos de streams a CRF alto, con ganancias PSNR-Y de +0,44 a +0,52 dB sobre Lanczos.
- Mejora de vídeo 720p hacia 1440p en pantallas de alta densidad: `quality` tarda 4,13 ms por fotograma en 720p→1440p en una RTX 5080, adecuado para monitores QHD.
- Archivado y visionado de material comprimido heredado: el modelo puede aplicarse offline vía ONNX Runtime sobre vídeos ya codificados para mejorar su visualización sin recomprimir la fuente.
- Integración en pipelines de vídeo basados en ONNX: al publicarse los `.onnx` con el residual incluido, puede insertarse en herramientas de postproceso (FFmpeg con filtro ONNX, scripts Python) para upscaling por lotes.
- Prototipado de shaders de superresolución: los pesos en JSON y el código de entrenamiento permiten reentrenar o ajustar la red para dominios concretos (animación, deportes, vigilancia).

## Benchmarks y rendimiento

Ganancia de PSNR-Y sobre Lanczos en 1.024 pares de validación retenidos de escenas no vistas en entrenamiento (incluye Netflix y UVG-VCM), la mayoría con compresión de streaming:

| Modelo | Todas | Limpias | x264 | x265 | AV1 |
|---|---|---|---|---|---|
| bicubic | −0,09 | no disponible | no disponible | no disponible | no disponible |
| `balanced` | +0,44 | +0,26 | +0,45 | +0,42 | +0,49 |
| `quality` | +0,52 | +0,43 | +0,53 | +0,48 | +0,58 |

Tiempos por fotograma de la cadena completa del plugin (deband, CNN, sharpening, grano) en Chrome WebGPU con f16 sobre RTX 5080:

| Modelo | 1080p→4K | 720p→1440p |
|---|---|---|
| `balanced` | 2,95 ms | 1,31 ms |
| `quality` | 9,90 ms | 4,13 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de imagen, no de lenguaje.

## Requisitos de hardware

- VRAM: no disponible de forma explícita; por el tamaño (12.340 y 47.716 parámetros) el consumo de memoria es mínimo y cabe holgadamente en cualquier GPU con WebGPU.
- GPU recomendadas: RTX 5080 como referencia de los tiempos publicados; cualquier GPU con soporte WebGPU (incluidas integradas) es candidata según el objetivo declarado de "unos pocos milisegundos por fotograma en GPUs integradas".
- Cabe en GPU consumer: sí, con amplio margen; el cuello de botella es el ancho de banda de vídeo y la implementación WebGPU, no los pesos.
- Opciones de despliegue: navegador con WebGPU mediante ArtPlayerPluginLiveActionSR (shaders WGSL), ONNX Runtime (archivos `.onnx`), y PyTorch con el state dict `LumaSR` del repositorio de entrenamiento.
- Latencia y throughput: 2,95 ms/fotograma (`balanced`) y 9,90 ms/fotograma (`quality`) en 1080p→4K sobre RTX 5080 con la cadena completa; 1,31 ms y 4,13 ms respectivamente en 720p→1440p.

## Comparativa con modelos similares

| Modelo | Parametros | Factor | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiveActionSR-2x `balanced` | 12.340 | 2x luma | Tiempo real en navegador, vídeo comprimido | MIT | Hugging Face + npm |
| LiveActionSR-2x `quality` | 47.716 | 2x luma | Tiempo real en navegador, vídeo comprimido | MIT | Hugging Face + npm |
| EfRLFN-2x-WebGPU (mismo autor) | 487.000 | 2x | Mayor calidad, WebGPU | no disponible en la información | Hugging Face |
| Lanczos (referencia clásica) | 0 | 2x | Interpolación | no aplica | Universal |

El propio autor señala EfRLFN-2x-WebGPU como la alternativa "diez veces más grande" para mayor calidad. No se dispone de datos de benchmarks de otros modelos de superresolución en la información proporcionada para una comparación cuantitativa más amplia.

## Limitaciones y advertencias

- Solo realiza upscaling 2x; no admite otros factores.
- Entrenado con pérdida PSNR, por lo que suaviza en lugar de inventar detalle; el plugin reañade grano de película después para compensar.
- La crominancia no se superresuelve: solo se escala bilinealmente, lo que puede dejar el color menos nítido que la luma.
- Las fuentes HDR deben tone-mapearse a SDR antes; el plugin lo hace, pero un uso fuera de él requiere gestionarlo.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento ni multilingüismo.
- Riesgo de artefactos en contenido muy distinto al de entrenamiento (acción real de streaming); el rendimiento en animación, CGI o vídeo sintético no está documentado.
- Sesgos: no se documentan sesgos demográficos o de contenido, pero el conjunto de entrenamiento (Netflix Open Content, Tears of Steel, UVG-VCM) condiciona el dominio de aplicación.
- Licencia de los pesos MIT, pero el metraje de entrenamiento conserva sus propias licencias (ver `NOTICE.md`); su uso comercial debe respetar esas atribuciones.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema muy incipiente, sin validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/PianoNic/LiveActionSR-2x
- Repositorio del plugin y código de entrenamiento: https://github.com/PianoNic/ArtPlayerPluginLiveActionSR
- Código de entrenamiento: https://github.com/PianoNic/ArtPlayerPluginLiveActionSR/tree/main/training
- Lista de datasets: https://github.com/PianoNic/ArtPlayerPluginLiveActionSR/blob/main/training/DATASETS.md
- Modelo alternativo de mayor tamaño: https://huggingface.co/PianoNic/EfRLFN-2x-WebGPU
- ArtPlayer: https://artplayer.org
