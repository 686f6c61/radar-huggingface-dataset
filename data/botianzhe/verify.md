# botianzhe/Verify

## Resumen

Verify es un modelo de marca de agua digital y recuperación de contenido orientado a imágenes de 256×256 píxeles, publicado por el usuario botianzhe en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje ni de un modelo generativo de imágenes al uso, sino de un sistema de cinco etapas que combina la inserción de una marca de agua binaria de 100 bits con la detección de manipulaciones locales y la reconstrucción del contenido original a partir de la propia marca embebida.

El modelo resuelve un problema concreto de la cadena de custodia de imágenes: verificar la autoría de una imagen, localizar regiones manipuladas y restaurar el contenido alterado sin necesidad de disponer del original ni de la máscara real de manipulación. Para ello incorpora pesos propios y un VAE, con un tamaño aproximado de 973 MiB, y se distribuye en formato safetensors dentro de la librería diffusers.

Su relevancia actual radica en que unifica en un único pipeline tareas que habitualmente requieren varios sistemas independientes (watermarking, tamper localization y restauración), con inferencia offline tras instalar dependencias y soporte tanto de GPU CUDA como de CPU. La información pública disponible es escasa: no consta pipeline declarado, no se especifican idiomas soportados y no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (integrado en la librería diffusers; incluye VAE y pesos propios) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesamiento de imágenes de 256×256 RGB) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1.0 GB); checkpoint opcional en formato .pth |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su integración en la librería diffusers y de la presencia de un VAE junto con pesos propios. El sistema opera sobre imágenes de 256×256 píxeles en formato RGB y produce salidas PNG. El pipeline se organiza en cinco modos funcionales: inserción de marca de agua (`embed`), falsificación local mediante blending (`forge`), extracción de la marca de copyright (`extract`), localización de la región manipulada (`locate`) y recuperación de contenido (`recover`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas específicas como atención lineal o decodificación especulativa. La model card indica que la recuperación depende de las características de contenido embebidas en la marca de agua, lo que sugiere un mecanismo de codificación conjunta de la señal binaria y de rasgos visuales, pero el detalle arquitectónico no se especifica.

## Capacidades

- Inserción de una marca de agua de copyright codificada como cadena binaria de 100 bits en una imagen de entrada.
- Falsificación controlada de regiones mediante blending de contenido donante sobre una máscara especificada, con generación automática de la máscara real de manipulación.
- Extracción de la marca de copyright de 100 bits a partir de una imagen (incluidas imágenes falsificadas), con salida en JSON y cálculo de precisión frente a los bits esperados.
- Localización de regiones manipuladas, generando una máscara binaria en blanco y negro donde el blanco indica la zona predicha como alterada.
- Recuperación de contenido: reconstrucción de la imagen original a partir únicamente de la imagen falsificada, sin necesidad de la imagen original ni de la máscara real.
- Ejecución de un flujo completo (`workflow`) que encadena inserción, falsificación, extracción, localización y recuperación, con exportación de métricas (PSNR de recuperación global y en zona manipulada, IoU de localización).
- Inferencia offline tras instalar dependencias, con selección automática de dispositivo y posibilidad de forzar `--device cuda` o `--device cpu`.
- Sustitución opcional de pesos mediante `--checkpoint /path/model.pth`, siempre que la estructura sea compatible.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Verificación de autoría en imágenes de prensa: insertar una marca de 100 bits que identifique al fotógrafo o a la agencia, y extraerla posteriormente de copias redistribuidas para acreditar la procedencia, usando el modo `extract` sobre la imagen recibida.
- Detección de manipulaciones en documentación gráfica: aplicar `locate` sobre una imagen sospechosa para obtener una máscara de las regiones alteradas, útil en flujos de revisión editorial o peritaje de imágenes.
- Restauración de contenido alterado: emplear `recover` para reconstruir la imagen original a partir de una versión falsificada, sin disponer del original ni de la máscara real, en tareas de recuperación forense.
- Pruebas de robustez de sistemas de watermarking: usar el modo `forge` para generar manipulaciones controladas con máscara conocida y medir después la precisión de extracción y la IoU de localización con `metrics.json`.
- Auditoría de pipelines de publicación de imágenes: integrar el flujo `workflow` en un proceso automatizado que embeba la marca al publicar, detecte manipulaciones posteriores y genere métricas de integridad por lote.
- Evaluación comparativa de algoritmos de restauración: utilizar las métricas PSNR global y en zona manipulada que exporta el flujo completo como referencia objetiva en experimentos con las 10 muestras de `examples/`.
- Despliegue en entornos sin GPU: ejecutar los modos de extracción, localización y recuperación en CPU para verificaciones puntuales en servidores sin acelerador, dado el soporte explícito de `--device cpu`.
- Contenedorización en servicios internos: usar la imagen Docker incluida (`docker build -t verify-watermark .`) para exponer el modo `recover` o `extract` como servicio con volumen de datos montado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el flujo completo exporta métricas de PSNR (global y en zona manipulada) y de IoU de localización en `metrics.json`, y que existen 10 muestras de prueba en `examples/`, pero no se incluyen valores numéricos de referencia ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete pesa aproximadamente 973 MiB (repo de 1.0 GB), lo que sugiere un consumo de memoria moderado, pero no se publican cifras de VRAM en inferencia.
- GPU recomendadas: no disponibles; la model card solo indica que se recomienda PyTorch con soporte CUDA y permite alternar entre `--device cuda` y `--device cpu`.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; por el tamaño del paquete es plausible que quepa en GPU de consumo, pero no se aportan datos que lo verifiquen.
- Opciones de despliegue: ejecución directa con `python -m verify` y `python -m verify.workflow`, script de pruebas `tools/test_examples.py`, y contenedor Docker (`docker build -t verify-watermark .`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros sistemas de watermarking, localización de manipulaciones o restauración de contenido con los que comparar parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- La imagen de entrada debe procesarse a 256×256 píxeles en RGB; se recomienda recortar previamente rostros o regiones de interés, lo que limita el uso directo sobre imágenes de alta resolución sin preprocesado.
- La marca de copyright es una cadena binaria de 100 bits, no una imagen ni un logotipo; no admite otro tipo de carga útil.
- La recuperación es una estimación con pérdida: depende de las características de contenido embebidas en el momento de la inserción y no garantiza restaurar imágenes que no hayan sido marcadas previamente.
- Las métricas de PSNR calculadas sobre resultados en memoria difieren de las obtenidas leyendo PNG guardados, debido a la cuantización de la exportación; hay que tenerlo en cuenta al comparar resultados.
- Las 10 muestras de `examples/` son una selección curada y no representan el comportamiento sobre el conjunto completo de datos.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe, dado que el modelo no es lingüístico.
- Licencia MIT: permite uso comercial, pero no se especifican condiciones adicionales ni garantías por parte del autor.
- No se publican benchmarks ni cifras de robustez frente a compresión, recorte o reescalado de la imagen marcada, lo que impide evaluar su resistencia en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no declara pipeline ni idiomas; la madurez y el soporte del proyecto no están contrastados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/botianzhe/Verify
