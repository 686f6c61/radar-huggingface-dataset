# JSIASJD/ClearRealityV1

## Resumen

ClearRealityV1 es un modelo de super-resolución 4x desarrollado por JSIASJD, especializado en imágenes realistas de humanos, follaje, árboles, edificios y escenas naturales. Se basa en la arquitectura SPAN (Single Pass Attention Network), un diseño eficiente para tareas de restauración y ampliación de imágenes que combina atención por pasos con bloques convolucionales. El modelo se distribuye en dos variantes: "Normal", orientada a fotografía realista, y "Soft", una versión anterior con un dataset más limitado que produce resultados más naturales en contenido renderizado o juegos, aunque con algo menos de precisión en escenas reales.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato PyTorch y ONNX, y está pensado para integrarse en herramientas de upscaling como chaiNNer (versión nightly en el momento del lanzamiento). Su relevancia actual radica en ofrecer una alternativa de código abierto para ampliación de imágenes con énfasis en la reducción de artefactos y un aspecto visual suave, especialmente en rostros y cabello.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPAN (Single Pass Attention Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no aplica a modelos de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors probablemente) y ONNX |

## Arquitectura y entrenamiento

SPAN es una arquitectura de super-resolucion que utiliza un mecanismo de atencion de un solo paso para modelar dependencias de larga distancia en la imagen, combinado con bloques residuales y convoluciones. Esto permite un equilibrio entre calidad y coste computacional, siendo adecuada para ampliaciones 4x con detalle fino.

El entrenamiento se realizo durante aproximadamente 300k iteraciones (acumuladas en varios modelos), con un batch size de 12-20 y recortes de alta resolucion de 128-256 pixeles. El dataset combina el dataset propio UltraSharpV2, un dataset de 8k (v2), Nomos8k y FaceUp, totalizando 19k tiles. No se utilizo entrenamiento OTF (on-the-fly), sino un pipeline fijo con datasetDestroyer. El modelo se inicializo desde el pretrain oficial de SPAN.

## Capacidades

- Super-resolucion 4x de imagenes realistas: rostros, cabello, follaje, arboles, edificios y escenas naturales.
- Reduccion de artefactos en comparacion con otros modelos de upscaling, buscando un aspecto suave y natural.
- Variante "Soft" optimizada para contenido renderizado (juegos, CGI) con resultados mas organicos.
- Integracion con chaiNNer (version nightly) y otras herramientas de upscaling que soporten SPAN.
- Compatibilidad con formatos PyTorch y ONNX para despliegue en multiples entornos.

## Casos de uso

- Restauracion de fotografias antiguas: ampliar imagenes de baja resolucion manteniendo la textura de la piel y el cabello sin generar artefactos plasticos, gracias al entrenamiento especifico en rostros.
- Mejora de capturas de videovigilancia: aumentar la resolucion de frames de camaras de seguridad para identificar detalles faciales o matricula, con un modelo que prioriza la fidelidad realista.
- Upscaling de imagenes de stock para imprenta: preparar fotos de baja resolucion para su uso en carteles o revistas, donde el detalle natural es critico.
- Mejora de texturas en modding de juegos: la variante Soft permite ampliar texturas de juegos antiguos con un aspecto mas coherente con el estilo original, evitando el exceso de nitidez.
- Preprocesado para otros modelos de vision: ampliar imagenes antes de pasarlas a un detector de objetos o un segmentador, mejorando la precision en escenarios con objetos pequenos.
- Ampliacion de imagenes medicas (limitado): aunque no esta validado clinicamente, puede usarse para mejorar la resolucion de radiografias o ecografias en entornos de investigacion, siempre con supervision profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como PSNR, SSIM o comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de super-resolucion 4x, el consumo depende del tamano de la imagen de entrada. Para imagenes de 512x512, se estima entre 1-2 GB con FP16; para imagenes mayores (1024x1024), puede superar los 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050) para uso basico; para produccion se recomienda RTX 3060 o superior.
- Es viable en GPU de consumo: si, en tarjetas con 4 GB o mas.
- Opciones de despliegue: chaiNNer (interfaz grafica), scripts Python con PyTorch, o inferencia ONNX con ONNX Runtime. No se menciona soporte para vLLM o TGI (orientados a texto).
- Latencia y throughput: no disponibles; dependen de la resolucion de entrada y la GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escala | Licencia | Especialidad |
|---|---|---|---|---|
| ClearRealityV1 | SPAN | 4x | Apache 2.0 | Realismo, rostros, naturaleza |
| Real-ESRGAN | ESRGAN mejorado | 4x | BSD-3-Clause | Uso general, restauracion |
| SwinIR | Transformer | 2x-8x | Apache 2.0 | Calidad alta, pero mas pesado |
| 4x-UltraSharp | ESRGAN | 4x | MIT | Nitidez agresiva, menos natural |

No se dispone de comparativas cuantitativas publicadas entre ClearRealityV1 y estos modelos.

## Limitaciones y advertencias

- Artefactos en imagenes con profundidad de campo (DOF) o bokeh: el autor advierte explicitamente que se produciran artefactos en estas condiciones.
- La variante Normal no esta optimizada para contenido renderizado o juegos; en esos casos se recomienda usar la variante Soft.
- No se proporcionan metricas objetivas de calidad, por lo que la evaluacion debe hacerse visualmente.
- El modelo no soporta aumento de escala distinto de 4x (no se menciona flexibilidad en el factor de escala).
- El repositorio de HuggingFace tiene 0 descargas y 0 likes, lo que indica una adopcion limitada hasta la fecha.
- El enlace de descarga apunta a Mega.nz, no a un repositorio de codigo fuente o documentacion tecnica detallada.

## Enlaces

- HuggingFace: https://huggingface.co/JSIASJD/ClearRealityV1
- Model card original (Kim2091): https://huggingface.co/Kim2091/ClearRealityV1
- Enlace de descarga (Mega): https://mega.nz/folder/Xc4wnC7T#yUS5-9-AbRxLhpdPW_8f2w
- Herramienta face-upscaler (GitHub): https://github.com/instant-high/face-upscaler
- Modelo en SeaArt: https://www.seaart.ai/models/detail/d1np5ale878c73fmddrg
- Modelo en RunningHub: https://www.runninghub.ai/model/public/2004787145627889666
