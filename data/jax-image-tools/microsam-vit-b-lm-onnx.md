# jax-image-tools/microsam-vit-b-lm-onnx

## Resumen

El modelo `jax-image-tools/microsam-vit-b-lm-onnx` es una exportación a formato ONNX del modelo de segmentación promptable micro-sam en su variante `vit_b_lm`, desarrollado por el proyecto micro-sam del grupo Computational Cell Analytics. Esta versión específica está optimizada para inferencia en el navegador mediante onnxruntime-web y WebGPU, lo que permite ejecutar segmentación de imágenes de microscopía de luz directamente en el cliente sin necesidad de servidor. El modelo se compone de dos grafos ONNX: un encoder (fp16, ~172 MB) que convierte una imagen en un embedding, y un decoder (fp32, ~16 MB) que genera la máscara a partir de ese embedding y de prompts (puntos o cajas). La arquitectura subyacente es Segment Anything (SAM) con un backbone ViT-B, adaptado específicamente para imágenes de microscopía de luz.

La relevancia actual de este modelo radica en su capacidad de ejecutarse en dispositivos con WebGPU, lo que permite aplicaciones interactivas de segmentación en tiempo real sin enviar datos a un servidor. Es una herramienta útil para investigadores y desarrolladores en el ámbito biomédico que necesitan anotar células o núcleos en imágenes de microscopía de forma rápida y privada. El repositorio incluye los pesos ONNX y documentación sobre el preprocesamiento necesario, aunque no se han publicado métricas de rendimiento en la tarjeta del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything (SAM) con encoder ViT-B y decoder de máscaras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp16 (encoder), fp32 (decoder) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | cc-by-4.0 (modelo base bajo Apache-2.0) |
| Formato de pesos | ONNX (archivos `.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Segment Anything (SAM), compuesta por un encoder de imagen basado en Vision Transformer (ViT-B) y un decoder de máscaras ligero. El encoder procesa imágenes de entrada de tamaño 1024x1024 píxeles y produce un embedding espacial de 256x256, que luego se combina con los prompts (puntos positivos/negativos o cajas) en el decoder para generar la máscara de segmentación. El modelo base `vit_b_lm` es una variante de micro-sam entrenada específicamente para imágenes de microscopía de luz, con un enfoque en células y núcleos.

El proceso de entrenamiento del modelo base no se detalla en la información proporcionada, pero micro-sam se entrena con datasets de microscopía de luz (como células y núcleos) y utiliza técnicas de ajuste fino sobre SAM. En este repositorio, el modelo se exportó a ONNX con dos grafos separados: el encoder se convirtió a fp16 mediante la herramienta `onnxruntime.transformers.float16`, manteniendo la entrada y salida en fp32, mientras que el decoder se mantuvo en fp32. La conversión a fp16 produce una similitud coseno de aproximadamente 1.0 respecto al modelo fp32 original, lo que indica una pérdida de precisión mínima.

## Capacidades

- Segmentación de imágenes de microscopía de luz (células, núcleos) mediante prompts interactivos.
- Soporte de prompts de tipo punto (positivo/negativo) y caja (bounding box) para guiar la segmentación.
- Inferencia en el navegador mediante WebGPU y onnxruntime-web, sin necesidad de servidor.
- Preprocesamiento de imagen en el cliente (resize, normalización, padding) para adaptar imágenes de entrada a 1024x1024.
- Dos grafos separados: encoder (una vez por imagen) y decoder (por prompt), lo que permite reutilizar el embedding para múltiples consultas.

## Casos de uso

- **Anotación de células en imágenes de microscopía**: los investigadores pueden cargar imágenes de placas y hacer clic en células o núcleos para obtener máscaras precisas, útil en análisis de cultivos celulares.
- **Segmentación interactiva en herramientas web**: el modelo se integra en el visor JAX Image Tools, permitiendo a usuarios anotar regiones de interés en tiempo real con WebGPU.
- **Automatización de conteo de células**: al combinar múltiples prompts, se pueden generar máscaras para contar células en imágenes de campo claro o fluorescentes, reduciendo el trabajo manual.
- **Análisis de imágenes biomédicas en el navegador**: los investigadores pueden ejecutar el modelo localmente en su navegador, sin subir datos sensibles a la nube, lo que facilita el cumplimiento de normativas de privacidad.
- **Prototipado rápido de pipelines de segmentación**: al ser un modelo ONNX, se puede integrar en aplicaciones de Python (con onnxruntime) o en entornos de navegador para experimentar con diferentes prompts y parámetros.
- **Educación y divulgación**: permite demostrar técnicas de segmentación avanzada en cursos de bioinformática sin necesidad de instalar dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero los archivos suman ~188 MB (encoder fp16 ~172 MB + decoder fp32 ~16 MB). En un navegador con WebGPU, la memoria se gestiona dinámicamente.
- **GPU recomendadas**: se requiere una GPU compatible con WebGPU (por ejemplo, NVIDIA GTX 10xx o superior, AMD RX 5xxx o superior, o integradas modernas). No se especifican modelos concretos.
- **Cabe en consumer GPU**: sí, dado el tamaño moderado, es viable en GPUs de gama media.
- **Opciones de despliegue**: onnxruntime-web (navegador), onnxruntime (Python), o cualquier runtime ONNX.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo micro-sam también ofrece una variante `vit_l_lm` con mayor calidad de segmentación pero mayor coste computacional, según se menciona en la documentación oficial de micro-sam.

## Limitaciones y advertencias

- **Especialización**: el modelo está entrenado específicamente para microscopía de luz; su rendimiento en otros tipos de imágenes (por ejemplo, tomografía, histología) puede ser subóptimo.
- **Preprocesamiento requerido**: es necesario aplicar el mismo protocolo de preprocesamiento que se usó en el entrenamiento (resize a 1024, normalización, padding) para obtener resultados correctos.
- **Licencia**: la exportación está bajo CC-BY-4.0, que permite uso comercial con atribución, pero el modelo base micro-sam tiene su propia licencia (Apache-2.0) que debe respetarse.
- **Dependencia de WebGPU**: la ejecución en el navegador requiere un navegador moderno con soporte WebGPU; no todos los entornos lo tienen activado por defecto.
- **Alucinación**: al ser un modelo de segmentación, no genera texto, pero puede producir máscaras incorrectas si los prompts son ambiguos o la imagen es ruidosa.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/jax-image-tools/microsam-vit-b-lm-onnx)
- [Documentación de micro-sam (API)](https://computational-cell-analytics.github.io/micro-sam/micro_sam.html)
- [Repositorio de micro-sam (GitHub)](https://github.com/computational-cell-analytics/micro-sam)
- [Herramienta de visualización Netron para inspección de modelos ONNX](https://netron.app/)
