# dollyx/vdc-five-attributes-sd14

## Resumen

VDC five-attributes-sd14 es un conjunto de artefactos de reproducción de investigación derivados del método Visual Diffusion Conditioning (VDC), publicado en el paper arXiv:2603.25441 por Omar Elezabi, Eduard Zamfir, Zongwei Wu y Radu Timofte. No es un modelo generativo autónomo, sino un paquete de condiciones de direccionamiento aprendidas (steering conditions) y estados de entrenamiento de MLPs que se aplican sobre un backbone Stable Diffusion 1.4 congelado para tareas de restauración de imagen: eliminación de lluvia (DeRain), niebla (DeHaze), desenfoque (DeBlur), ruido (DeNoise) y superresolución (SR).

Cada atributo se entrenó mediante optimización one-shot a partir de un único par de imágenes de ejemplo, con 200 actualizaciones de optimización, batch de 4 y cuatro aumentaciones emparejadas por actualización. El resultado son diez MLPs específicos por timestep, con anchura oculta 128 y 256 características de Fourier, que producen condiciones de forma `(10, 77, 768)` listas para inferencia con DDIM.

El interés del release es fundamentalmente metodológico: demuestra que es posible aprender condiciones de control visual con un solo ejemplo emparejado manteniendo el backbone completamente congelado, lo que abre la puerta a adaptaciones de restauración de bajo coste computacional. El repositorio es privado en el momento de su publicación, no incluye los pesos de SD 1.4 ni CLIP, y no aporta licencia de redistribución para el conjunto combinado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Stable Diffusion 1.4 congelado (UNet + CLIP) con MLPs de direccionamiento VDC por timestep |
| Parametros totales | No disponible (el release solo incluye los MLPs de condicionamiento, no los pesos del backbone) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (condiciones de forma `(10, 77, 768)` sobre el espacio latente de texto de SD 1.4) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el autor indica que no se afirma licencia de redistribución para el release combinado y que deben revisarse los términos de VDC, SD 1.4, CLIP y los datos de imagen |
| Formato de pesos | `.npy` (condiciones de inferencia) y `.pt` (estados de entrenamiento de MLPs, Adam, scheduler, scaler, RNG) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Stable Diffusion 1.4 completamente congelado con un conjunto de diez MLPs específicos por timestep que mapean entradas a condiciones de control visual. Cada MLP tiene anchura oculta de 128 y utiliza 256 características de Fourier. Las condiciones resultantes tienen forma `(10, 77, 768)` y se aplican en el proceso de difusión para dirigir la restauración hacia la tarea deseada sin modificar los pesos del modelo base.

El entrenamiento es one-shot: cada atributo parte de un único par de imágenes emparejadas y realiza 200 actualizaciones de optimización con batch 4, cuatro aumentaciones emparejadas por actualización, optimizador Adam con learning rate de 0.005 a 0.001 y scheduler coseno, seed 42, imágenes RGB 512x512 y precisión autocast. La inferencia usa DDIM con 100 pasos y strength 0.1 (10 pasos efectivos), scale 7, con corrección de inversión desactivada tanto en entrenamiento como en inferencia guardada. DeRain se completó en Colab T4; DeHaze se reanudó desde el paso 120 verificado y el resto de atributos se ejecutaron en Kaggle T4 x2, con dos workers independientes procesando hasta 40 actualizaciones adicionales por categoría entre versiones guardadas. El entrenamiento finalizó el 2026-11-05 UTC.

## Capacidades

- Restauración de imagen one-shot en cinco dominios: eliminación de lluvia, eliminación de niebla, eliminación de desenfoque, eliminación de ruido y superresolución.
- Aprendizaje de condiciones de control visual a partir de un único par de imágenes emparejadas, sin reentrenar el backbone.
- Direccionamiento por timestep: diez MLPs independientes permiten condiciones distintas en cada paso del proceso de difusión.
- Inferencia sobre imágenes RGB 512x512 con backbone SD 1.4 congelado.
- Exportación de condiciones listas para inferencia en formato NumPy (`.npy`) y estados de entrenamiento reanudables (`.pt`).
- Reanudación exacta del entrenamiento con restauración completa de optimizador, scheduler, scaler y estados RNG.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking: es un artefacto de condicionamiento para restauración de imagen, no un modelo de lenguaje.

## Casos de uso

- Restauración de fotografías con lluvia en pipelines de postprocesado: cargando `derain/learned_conds.npy` y ejecutando `CondMapping_Aug.py` con SD 1.4, se pueden limpiar imágenes 512x512 afectadas por precipitaciones sin entrenar un modelo específico.
- Eliminación de niebla en imágenes de vigilancia o conducción: el atributo DeHaze permite recuperar visibilidad en escenas con baja claridad atmosférica usando el backbone congelado y las condiciones exportadas.
- Desenfoque de imágenes médicas o de microscopía: el atributo DeBlur se puede aplicar como paso de preprocesado para mejorar la nitidez antes de análisis posteriores, siempre que las imágenes sean RGB 512x512.
- Reducción de ruido en imágenes de sensores o fotografías con ISO alto: el atributo DeNoise ofrece una vía de restauración de bajo coste computacional al no requerir reentrenamiento del backbone.
- Superresolución de imágenes de baja resolución: el atributo SR permite aumentar la resolución efectiva de imágenes 512x512 dentro del pipeline VDC, útil para catalogación o visualización.
- Reproducción y extensión de investigación: el paquete incluye el snapshot inmutable del código de entrenamiento, manifiestos de datos y hashes, lo que permite reproducir los experimentos o adaptar el método VDC a nuevas tareas de restauración con un solo par de ejemplo.
- Evaluación comparativa de métodos de condicionamiento visual: los estados de entrenamiento y las condiciones exportadas sirven como referencia para comparar estrategias de direccionamiento sobre SD 1.4 congelado en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que una salida retenida por atributo es un ejemplo de ejecución, no un benchmark cuantitativo, y que PSNR/SSIM y la generalización amplia no se han evaluado para esta reproducción. No se reclaman los números de benchmark del paper original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse sobre SD 1.4 con DDIM 100 pasos y strength 0.1, los requisitos son los del backbone SD 1.4 (típicamente 8-12 GB en FP16 para 512x512, no confirmado en la información proporcionada).
- GPU recomendadas: el autor cita Colab T4 y Kaggle T4 x2 para el entrenamiento, lo que sugiere que una T4 (16 GB) es suficiente para el flujo completo.
- Cabe en GPU consumer: no confirmado explícitamente; el uso de T4 en Colab indica que GPUs de gama media con 16 GB pueden ejecutar el pipeline.
- Opciones de despliegue: el flujo oficial usa `scripts/CondMapping_Aug.py` con Python 3.10.22, torch 2.4.0+cu121 y NumPy 1.26.4; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VDC five-attributes-sd14 | Condiciones VDC sobre SD 1.4 congelado | No disponible (solo MLPs) | No aplica | No disponible | Repo privado en Hugging Face |
| Stable Diffusion 1.4 (CompVis) | Modelo de difusión texto-imagen | ~860M UNet + CLIP | 77 tokens de texto | CreativeML OpenRAIL-M | Público |
| Implementación original VDC (omarAlezaby) | Método de condicionamiento visual | No disponible | No disponible | No disponible | GitHub público |
| Modelos de restauración dedicados (p. ej. SwinIR, Restormer) | Redes de restauración supervisadas | Variable | No aplica | Variable | Público |

La comparación directa con modelos de restauración dedicados no es posible con los datos disponibles: este release no reporta PSNR/SSIM ni métricas cuantitativas, y su naturaleza es la de artefactos de investigación reproducibles, no la de un modelo listo para producción.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere SD 1.4 y CLIP obtenidos por separado, además del código fuente del snapshot para ejecutar inferencia.
- El repositorio es privado en el momento de la publicación y requiere autenticación para acceder.
- No se afirma licencia de redistribución para el release combinado; deben revisarse los términos de VDC, SD 1.4, CLIP y los datos de imagen antes de cualquier uso público o comercial.
- No se han evaluado PSNR/SSIM ni la generalización amplia; una única salida retenida por atributo no constituye evidencia cuantitativa de calidad.
- El entrenamiento one-shot con un solo par de imágenes limita la generalización a dominios y distribuciones de imagen no representados en el ejemplo.
- Las imágenes de entrada deben ser RGB 512x512; no se documenta soporte para otras resoluciones o espacios de color.
- Los checkpoints `.pt` deben cargarse con `torch.load(..., map_location="cpu", weights_only=False)` por ser artefactos PyTorch de confianza; no se deben cargar checkpoints de origen no verificado.
- Las rutas de experimento originales apuntan a entornos Colab/Kaggle y deben reubicarse localmente.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje; cualquier sesgo heredado provendría del backbone SD 1.4 y de los datos de imagen originales.

## Enlaces

- Hugging Face: https://huggingface.co/dollyx/vdc-five-attributes-sd14
- Paper VDC: https://arxiv.org/abs/2603.25441
- Implementación original: https://github.com/omarAlezaby/VDC
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v-1-4-original
- Dataset sintético relacionado (resultado de búsqueda): https://zenodo.org/records/16414387
