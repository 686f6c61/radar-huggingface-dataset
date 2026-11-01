# manasrpandya/bilateral-denoise-nbf

## Resumen

El modelo `bilateral-denoise-nbf` es una red neuronal minúscula (una U-Net de aproximadamente 93 000 parámetros) desarrollada por manasrpandya como parte de una tarea de laboratorio universitario. Su función no es generar texto ni imágenes, sino predecir los parámetros de un filtro bilateral diferenciable de dos pasadas para eliminar ruido gaussiano en imágenes en escala de grises. En lugar de aplicar un filtro bilateral con parámetros fijos, la red estima por píxel los valores de `sigma_s` (desviación espacial) y `sigma_r` (desviación de rango) para cada una de las dos pasadas, además de una guía de rango, de modo que la salida es siempre una media ponderada normalizada de vecinos ruidosos.

El modelo se distribuye en formato ONNX (opset 17, 462 kB) y se entrenó de forma ciega sobre parches de BSD400 con ruido gaussiano de sigma entre 0 y 55, en un único canal. Es un artefacto muy específico, orientado a demostrar una técnica de filtrado guiado por red, no un modelo de propósito general: no procesa lenguaje, no tiene tokenizador ni contexto textual, y su licencia MIT permite uso y modificación sin restricciones.

Su relevancia es limitada pero clara en el nicho de procesamiento de imagen clásico: ofrece una alternativa aprendida y ligera (menos de 100 000 parámetros, menos de 0,5 MB) a los filtros bilaterales de parámetros fijos, con resultados de PSNR publicados en los conjuntos Set12, BSD68 y Kodak24. No hay información sobre idiomas, pipeline ni descargas, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net pequeña (tiny U-Net) que predice parámetros de un filtro bilateral diferenciable de 2 pasadas con ventana de disco 7x7 |
| Parametros totales | ~93 000 (93k) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada de cualquier altura y anchura) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, 462 kB) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net diminuta de aproximadamente 93 000 parámetros que actúa como meta-red: no produce directamente la imagen limpia, sino que predice mapas por píxel con cinco canales (`sigma_s` de la pasada 1, `sigma_s` de la pasada 2, `sigma_r` de la pasada 1, `sigma_r` de la pasada 2 y una guía de rango). Esos mapas alimentan un filtro bilateral diferenciable de dos pasadas con ventana de disco de 7x7, de modo que la salida final es siempre una media ponderada normalizada de los vecinos ruidosos. Esta restricción estructural garantiza que el modelo se comporte como un filtro bilateral que elige sus propios parámetros, evitando artefactos de reconstrucción arbitrarios.

El entrenamiento fue ciego (blind) sobre parches de BSD400 con ruido gaussiano de sigma en el rango [0, 55], en escala de grises y con un solo canal. Para procesar imágenes RGB, la model card indica que se ejecute cada canal como un elemento del lote. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, ni si se emplearon RLHF o DPO (no aplicables en este dominio). La innovación técnica destacable es precisamente el filtro bilateral diferenciable con parámetros predichos por red y la exportación a ONNX con una diferencia máxima absoluta frente a PyTorch de 7,6e-06.

## Capacidades

- Eliminación de ruido gaussiano en imágenes en escala de grises con sigma de ruido entre 0 y 55.
- Predicción por píxel de parámetros de filtro bilateral (`sigma_s` y `sigma_r`) para dos pasadas.
- Entrada de tamaño arbitrario: acepta tensores float32 de forma (n, 1, h, w) en el rango [0, 1] con cualquier altura y anchura.
- Salida de imagen denoised (n, 1, h, w) y de mapas de parámetros (n, 5, h, w).
- Procesamiento de imágenes RGB mediante ejecución por canal como elementos del lote.
- Ejecución en navegador mediante ONNX (demo en vivo disponible).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Preprocesado de imágenes médicas en escala de grises: el modelo puede reducir ruido gaussiano en radiografías o ecografías antes de un pipeline de segmentación, gracias a su ventana de 7x7 y a la adaptación por píxel de `sigma_s` y `sigma_r`.
- Limpieza de imágenes de microscopía o astronomía: al aceptar entradas de cualquier tamaño (h, w) y trabajar por canal, se puede aplicar a capturas científicas de un solo canal con ruido de sensor estimado en sigma hasta 55.
- Filtrado en el navegador: al estar exportado a ONNX (462 kB) y tener una demo web, encaja en aplicaciones cliente que necesiten denoising sin enviar la imagen a un servidor.
- Preprocesado en pipelines de visión por computador: puede ejecutarse antes de detectores o clasificadores para estabilizar características en imágenes ruidosas, con un coste computacional muy bajo (93k parámetros).
- Prototipado educativo y de investigación: sirve como referencia reproducible de filtro bilateral diferenciable con parámetros aprendidos, útil para laboratorios que estudien filtrado guiado por red.
- Procesamiento por lotes de imágenes en color: ejecutando cada canal RGB como elemento del lote, se puede integrar en scripts de limpieza de datasets fotográficos con ruido gaussiano simulado o real.
- Despliegue en dispositivos de borde: su tamaño inferior a 0,5 MB permite incluirlo en aplicaciones móviles o embebidas con ONNX Runtime sin requisitos de GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card (PSNR en dB, ruido gaussiano, escala de grises):

| Conjunto | sigma=15 | sigma=25 | sigma=50 |
|---|---|---|---|
| Set12 | 31,93 | 29,60 | 26,44 |
| BSD68 | 30,82 | 28,38 | 25,48 |
| Kodak24 | 32,11 | 29,79 | 26,84 |

No se han publicado en la información disponible comparaciones con otros modelos en estos mismos conjuntos ni resultados de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo pesa 462 kB en ONNX float32 y una U-Net de 93k parámetros requiere del orden de decenas de megabytes para activaciones en imágenes de tamaño moderado (no se proporcionan cifras exactas).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (incluido el navegador vía WebAssembly/WebGPU), y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Se indica "no disponible" para parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas como DnCNN, FFDNet o filtros bilaterales clásicos, ya que no se han incluido en la documentación consultada.

## Limitaciones y advertencias

- Solo procesa imágenes en escala de grises de un canal; para RGB hay que ejecutar cada canal por separado como elemento del lote.
- Entrenado para ruido gaussiano con sigma en [0, 55]; su comportamiento fuera de ese rango o con otros tipos de ruido (sal y pimienta, Poisson, ruido real de sensor) no está documentado.
- No es un modelo de lenguaje: no tiene contexto textual, tokenizador ni capacidades de generación de texto, razonamiento o tool calling.
- No se documentan sesgos, pero al entrenarse sobre BSD400 puede heredar las características de ese dataset (escenas naturales), con posible degradación en dominios muy distintos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí puede producir suavizado excesivo o pérdida de detalle fino en texturas de alta frecuencia.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no se documentan restricciones adicionales.
- El repositorio registra 0 descargas y 0 likes, y el modelo procede de una tarea universitaria; no hay evidencia de validación en producción.
- No se documentan cuantizaciones ni versiones optimizadas más allá del ONNX float32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manasrpandya/bilateral-denoise-nbf
- Código y memoria del proyecto: https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/07-bilateral-denoising
- Demo en vivo: https://nlp-cv-lab.vercel.app/p/bilateral-denoising
