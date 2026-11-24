# HerRei/localsr-models

## Resumen

LocalSR Photo es una familia de dos modelos de superresolución de imagen (upscaling 4x) desarrollada por Hermes Reisner (HerRei) para su aplicación LocalSR, una herramienta gratuita de escalado de fotos y vídeo en local. Los modelos están diseñados para ejecutarse íntegramente en la Neural Engine de Apple y, al mismo tiempo, mantener un rendimiento competitivo en CPU e iGPU de equipos antiguos sin NPU, lo que los hace especialmente relevantes para despliegue en el borde (edge) y en hardware de consumo.

La familia incluye dos variantes: Photo S (0,62 millones de parámetros, 2,5 MB) y Photo M (2,03 millones de parámetros, 8,1 MB), ambas basadas en una arquitectura propia denominada PULSE (channels x blocks) y exportables a Core ML. Frente a alternativas mucho más grandes como Real-ESRGAN x4plus (16,7 M de parámetros) o NomosWebPhoto RealPLKSR (7,4 M), Photo M ofrece entre 5 y 11 veces más velocidad con una calidad perceptual comparable y mayor fidelidad PSNR.

El interés actual reside en su relación calidad/tamaño/velocidad: modelos de menos de 10 MB que superan en fidelidad a modelos hasta 25 veces más grandes, entrenados exclusivamente con fotografías CC0 del dataset lucid-cc0-v2-hc, y con licencia CC BY 4.0 que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PULSE (red neuronal convolucional propia, canales x bloques) |
| Parametros totales | Photo S: 0,62 M; Photo M: 2,03 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; pesos en fp32 para inferencia (export Core ML para Neural Engine) |
| Idiomas soportados | no aplica (modelo de imagen-to-image) |
| Licencia | CC BY 4.0 (pesos); código MIT |
| Formato de pesos | safetensors (PyTorch); export a Core ML para Neural Engine |

## Arquitectura y entrenamiento

PULSE es una red convolucional ligera cuya nomenclatura refleja su configuración: `64x8` para Photo S (64 canales, 8 bloques) y `96x12` para Photo M (96 canales, 12 bloques). El modelo escala la imagen 4x y procesa imágenes grandes por teselas (tiles) con solapamiento mayor que el campo receptivo de la red, de modo que el teselado no altera el resultado. La implementación de referencia en PyTorch ocupa unas 80 líneas (`pulse_arch.py`) y la exportación a Core ML está optimizada para que todas las operaciones se ejecuten en la Neural Engine de Apple.

El entrenamiento utilizó exclusivamente el dataset `Phips/lucid-cc0-v2-hc`, compuesto por fotografías de pxhere liberadas como CC0 por el publicador de la colección. No se menciona el número de tokens ni pasos de entrenamiento (no aplica), ni el uso de RLHF/DPO (no aplica a un modelo de imagen). Una innovación destacable es el régimen de degradaciones con desenfoque de lente (lens-blur regime) introducido en Photo M, que le permite aprender el desenfoque real de las cámaras y mejorar notablemente en fotos de cámara reales (RealSR, DRealSR). También se publican dos variantes experimentales de vídeo de Photo S, ajustadas para reducir el parpadeo (flicker) entre fotogramas.

## Capacidades

- Superresolución de imagen 4x (upscaling) para fotografías.
- Ejecución íntegra en la Neural Engine de Apple (Core ML), con todas las operaciones en la NPU.
- Rendimiento competitivo en CPU e iGPU de equipos antiguos sin NPU (probado en i7-8550U de 2017 y Mac mini de 2012).
- Procesamiento por teselas con solapamiento mayor que el campo receptivo, sin artefactos de costura.
- Manejo de fotos de cámara reales con desenfoque de lente (Photo M).
- Variantes experimentales para vídeo con reducción de parpadeo (video-light-exp y video-calm-exp).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica).

## Casos de uso

- Mejora de fotos personales en local: el usuario puede ampliar fotografías 4x en su propio equipo sin subirlas a la nube, usando Photo S para lotes grandes y Photo M para imágenes individuales de mayor calidad.
- Procesamiento por lotes en equipos modestos: Photo S tarda 9,1 s por megapíxel de entrada en un portátil de 2017 con CPU, lo que permite procesar colecciones grandes en segundo plano sin bloquear el sistema.
- Restauración de fotos de cámara con desenfoque: Photo M aprende el desenfoque real de las lentes y obtiene mejores resultados en fotos de cámara reales (A-FINE 65,1 en RealSR frente a 70,8 de Photo S), adecuado para archivos fotográficos.
- Integración en aplicaciones macOS/iOS: la exportación a Core ML permite ejecutar el modelo en la Neural Engine de un M1 Pro a 188 ms (Photo S) o 485 ms (Photo M) por megapíxel de entrada, habilitando upscaling en tiempo real dentro de apps nativas.
- Upscaling de vídeo frame a frame: aunque las variantes de vídeo son experimentales y el autor recomienda Photo S estándar, el modelo puede integrarse en pipelines de vídeo para mejorar resolución fotograma a fotograma.
- Preprocesado para pipelines de visión por computador: ampliar imágenes de baja resolución antes de tareas de detección o segmentación, con un coste computacional mínimo gracias al reducido tamaño del modelo.
- Despliegue en dispositivos con recursos limitados: con 2,5 MB (Photo S) y 8,1 MB (Photo M), cabe en memoria de dispositivos embebidos y permite inferencia en CPU sin GPU dedicada.

## Benchmarks y rendimiento

Calidad en hold-out sellado (99 fotos DIV2K como copias web, una única ejecución final; menor es mejor en LPIPS y DISTS):

| Modelo | Parametros | PSNR-Y | LPIPS | DISTS |
|---|---|---|---|---|
| Photo S | 0,62 M | 28,40 | 0,259 | 0,148 |
| Photo M | 2,03 M | 28,40 | 0,245 | 0,139 |
| SPAN NomosUni | 2,24 M | 26,97 | 0,276 | 0,159 |
| NomosWebPhoto RealPLKSR | 7,4 M | 25,78 | 0,249 | 0,137 |
| Real-ESRGAN x4plus | 16,7 M | 26,22 | 0,242 | 0,128 |

Fotos de cámara real (RealSR y DRealSR, A-FINE, menor es mejor):

| Modelo | Parametros | RealSR | DRealSR |
|---|---|---|---|
| Photo S | 0,62 M | 70,8 | 69,1 |
| Photo M | 2,03 M | 65,1 | 67,2 |
| NomosWebPhoto RealPLKSR | 7,4 M | 58,6 | 70,2 |
| Real-ESRGAN x4plus | 16,7 M | 39,5 | 40,0 |

Velocidad (segundos por megapíxel de entrada, menor es mejor):

| Modelo | i7-8550U (CPU) | UHD 620 (iGPU) | Mac mini 2012 (CPU) |
|---|---|---|---|
| Photo S | 9,1 | 15,0 | 22,3 |
| SPAN NomosUni | 10,1 | 15,5 | 22,1 |
| Photo M | 25,1 | 48,5 | 58,9 |
| NomosWebPhoto RealPLKSR | 200,8 | 340,9 | 317,1 |
| Real-ESRGAN x4plus | 272,1 | 462,5 | 554,0 |

En Neural Engine (M1 Pro): Photo S 188 ms por megapíxel de entrada; Photo M 485 ms por megapíxel de entrada.

## Requisitos de hardware

- VRAM estimada: mínima; los modelos pesan 2,5 MB (Photo S) y 8,1 MB (Photo M), por lo que caben en cualquier GPU de consumo y en memoria de dispositivos embebidos.
- GPU recomendadas: Neural Engine de Apple (M1 Pro y posteriores) para máximo rendimiento; cualquier GPU con soporte ONNX Runtime DirectML en Windows; CPU moderna para equipos sin GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU Intel UHD 620.
- Opciones de despliegue: PyTorch con safetensors y Pillow (script `upscale.py`), exportación a Core ML para Neural Engine, ONNX Runtime DirectML en Windows.
- Latencia y throughput: Photo S a 188 ms/megapíxel en M1 Pro; Photo M a 485 ms/megapíxel en M1 Pro; en CPU de 2017, Photo S a 9,1 s/megapíxel y Photo M a 25,1 s/megapíxel.

## Comparativa con modelos similares

| Modelo | Parametros | Escala | Calidad (LPIPS) | Velocidad relativa | Licencia |
|---|---|---|---|---|---|
| Photo S | 0,62 M | 4x | 0,259 | Referencia rápida | CC BY 4.0 |
| Photo M | 2,03 M | 4x | 0,245 | 2,8x más lento que Photo S | CC BY 4.0 |
| SPAN NomosUni | 2,24 M | 4x | 0,276 | Similar a Photo S | no disponible |
| NomosWebPhoto RealPLKSR | 7,4 M | 4x | 0,249 | 8x más lento que Photo M | no disponible |
| Real-ESRGAN x4plus | 16,7 M | 4x | 0,242 | 11x más lento que Photo M | no disponible |

## Limitaciones y advertencias

- Photo M no muestra diferencia clara frente a NomosWebPhoto en LPIPS y DISTS (los intervalos pareados incluyen cero), aunque sí gana en fidelidad PSNR (2,6 dB) con una cuarta parte de los parámetros.
- Real-ESRGAN sigue claramente por delante en A-FINE en fotos reales, especialmente en fotos blandas y con ruido.
- Las variantes de vídeo son experimentales: no superaron la regla fijada antes del entrenamiento y el autor recomienda usar Photo S estándar para vídeo.
- El entrenamiento se limitó exclusivamente a fotos CC0 de pxhere; puede haber sesgos de dominio (tipos de fotografía, condiciones de iluminación, contenido) no documentados.
- Riesgo de alucinación de texturas: como todo upscaler, puede inventar detalle fino no presente en la imagen original.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución; el código es MIT.
- No se proporcionan datos sobre sesgos demográficos, geográficos o culturales del dataset de entrenamiento.
- No hay información sobre cuantizaciones distintas de fp32 ni sobre despliegue en vLLM, llama.cpp, Ollama o TGI (no aplica a un modelo de imagen).

## Enlaces

- Hugging Face: https://huggingface.co/HerRei/localsr-models
- Informe técnico (PDF): localsr-models-report.pdf (enlazado desde la model card)
- GitHub del modelo: https://github.com/HerRei/localsr-models
- GitHub de la aplicación LocalSR: https://github.com/HerRei/local-upscale
- Dataset de entrenamiento: https://huggingface.co/datasets/Phips/lucid-cc0-v2-hc
- Pesos Photo S: https://huggingface.co/HerRei/localsr-models/resolve/main/4xLocalSRPhoto_PULSE-64x8.safetensors
- Pesos Photo M: https://huggingface.co/HerRei/localsr-models/resolve/main/4xLocalSRPhoto_PULSE-96x12.safetensors
