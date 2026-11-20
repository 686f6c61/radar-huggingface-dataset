# AyedaOk/okeinla

## Resumen

Okeinla 1.0 es un modelo de restauración de imagen especializado en el procesamiento de archivos RAW con patrón de Bayer. Desarrollado por el usuario AyedaOk, resuelve de forma conjunta dos tareas que tradicionalmente se abordan por separado en el pipeline fotográfico: la reducción de ruido (denoising) y el demosaicing, es decir, la reconstrucción de la imagen en color a partir de los datos en bruto del sensor. El modelo se distribuye en formato ONNX float32 (opset 20) para producción y como state dictionary de PyTorch para reentrenamiento, con un tamaño de repositorio de 0,7 GB.

La relevancia de este modelo radica en su integración con herramientas de revelado RAW de código abierto: incluye un paquete `.dtmodel` listo para darktable y un adaptador de metadatos `model.json` para aplicaciones RAW. Esto lo sitúa como una alternativa orientada a flujos de trabajo fotográficos reales, no solo a investigación. El checkpoint publicado corresponde a la iteración `2940000` del entrenamiento.

La arquitectura se apoya en NAFNet (ECCV 2022) y se ha entrenado con los conjuntos RawNIND y Okeinla, incorporando una receta de pérdidas derivada de RawForge/Restorer con un peso de pérdida perceptual de 0,035 en las etapas finales. La licencia es GPLv3 tanto para pesos como para código fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (red de restauracion de imagen sin activaciones no lineales convencionales), segun creditos de la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se publica ONNX float32 y pesos PyTorch |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch state dict (`.pt`), ONNX (`.onnx`, opset 20), paquete darktable (`.dtmodel`) |

## Arquitectura y entrenamiento

Okeinla emplea una arquitectura NAFNet, una familia de redes de restauración de imagen presentada en "Simple Baselines for Image Restoration" (ECCV 2022) que prescinde de funciones de activación no lineales convencionales y utiliza bloques de atención simple sin softmax. El modelo realiza de forma conjunta denoising y demosaicing sobre imágenes RAW Bayer, evitando la cascada habitual de dos etapas separadas que puede amplificar artefactos.

El entrenamiento se realizó sobre los conjuntos RawNIND y Okeinla. La receta de pérdidas proviene de RawForge/Restorer, con un ajuste en las etapas finales que incrementa el peso de la pérdida perceptual de 0,025 a 0,035. Se publican tres configuraciones de entrenamiento por etapas (`training/configs/`) y los ajustes mínimos de arquitectura para exportación (`training/args.yaml`). El checkpoint seleccionado es el `2940000`. No se especifica en la información disponible el número de tokens ni de imágenes de entrenamiento, ni la composición detallada del dataset.

## Capacidades

- Denoising de imágenes RAW con patrón de Bayer.
- Demosaicing conjunto con el denoising, en una sola pasada.
- Exportación a ONNX float32 (opset 20) para inferencia en producción.
- Integración directa con darktable mediante el paquete `.dtmodel`.
- Adaptador de metadatos RAW (`onnx/model.json`) para aplicaciones que consuman el modelo ONNX.
- Reentrenamiento o ajuste fino a partir del state dict de PyTorch y su estado de Adam asociado.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Revelado RAW en darktable: el paquete `.dtmodel` permite aplicar el modelo como módulo de reducción de ruido y demosaicing dentro del flujo de trabajo del fotógrafo, sustituyendo o complementando los algoritmos nativos.
- Procesamiento por lotes de archivos RAW: mediante el modelo ONNX se puede integrar en scripts de Python o C++ para procesar carpetas completas de negativos digitales antes de la edición.
- Fotografía con ISO alto: al combinar denoising y demosaicing, resulta adecuado para imágenes con ruido elevado donde los pipelines en cascada suelen generar artefactos de color.
- Aplicaciones de revelado propias: el adaptador `model.json` y el ONNX permiten incorporar el modelo a editores RAW de terceros que necesiten un motor de restauración embebido.
- Investigación en restauración de imagen: los pesos PyTorch y las configuraciones de entrenamiento permiten reproducir o extender el entrenamiento sobre nuevos datasets RAW.
- Pipelines de conversión automatizada: en servicios de conversión RAW a JPEG/TIFF, el modelo puede actuar como etapa de preprocesado para mejorar la calidad final antes de la codificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 0,7 GB y el modelo ONNX es float32, por lo que la huella en memoria es moderada y probablemente inferior a unos pocos GB.
- GPU recomendadas: no especificadas por el autor; al ser una red NAFNet, es compatible con GPU NVIDIA de consumo y profesionales (RTX 3060 en adelante, A100, H100) mediante PyTorch o runtime ONNX.
- Cabida en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (modelo `model_bayer.onnx`), PyTorch, darktable (paquete `.dtmodel`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Okeinla 1.0 | Denoising + demosaicing RAW Bayer conjunto | NAFNet | GPL-3.0 | PyTorch, ONNX, darktable | Checkpoint 2940000, integrado en darktable |
| RawNIND (referencia) | Denoising, demosaicing y compresión conjuntos | no disponible en la informacion | no disponible | no disponible | Dataset y paper de referencia citados por Okeinla |
| NAFNet (original) | Restauracion de imagen generica | NAFNet | MIT (arquitectura) | PyTorch | Base arquitectonica de Okeinla |
| RawForge / Restorer | Restauracion RAW | no disponible en la informacion | no disponible | no disponible | Aporta la receta de perdidas |

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial del modelo o de obras derivadas puede obligar a liberar el código bajo la misma licencia; conviene revisar implicaciones antes de integrarlo en productos propietarios.
- Los datasets RawNIND y Okeinla se distribuyen bajo CC BY-SA 4.0 y no se incluyen en el repositorio; su reutilización requiere atribución y compartir igual.
- El modelo está especializado en RAW Bayer; no está diseñado para imágenes RGB ya procesadas ni para otros patrones de color.
- No se han publicado métricas de calidad (PSNR, SSIM) en la información disponible, por lo que no es posible evaluar su rendimiento frente a alternativas sin pruebas propias.
- No hay información sobre sesgos demográficos ni sobre el contenido de las imágenes de entrenamiento más allá de la nota de que no aparecen personas identificables.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AyedaOk/okeinla
- Código de entrenamiento: https://github.com/AyedaOk/okeinla
- Paper RawNIND: https://arxiv.org/abs/2501.08924
- Código RawNIND: https://github.com/trougnouf/rawnind_jddc
- Dataset RawNIND: https://doi.org/10.14428/DVN/DEQCIM
- Código NAFNet: https://github.com/megvii-research/NAFNet
- Código RawForge/Restorer: https://github.com/rymuelle/Restorer
