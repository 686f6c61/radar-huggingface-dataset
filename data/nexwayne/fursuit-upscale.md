# nexwayne/Fursuit-Upscale

## Resumen

Fursuit-Upscale x4 es un modelo de superresolución de imágenes derivado de Real-ESRGAN y ajustado finamente por el usuario nexwayne sobre un conjunto de datos propio de fotografías de *fursuits* (trajes de personajes antropomórficos). El objetivo declarado es ampliar imágenes por un factor de 4 preservando texturas de pelaje y detalles finos que los upscalers genéricos tienden a suavizar o a reconstruir de forma artificial. Se publica bajo licencia Apache 2.0 y con el identificador `nexwayne/Fursuit-Upscale`.

Técnicamente no es un modelo de lenguaje ni un transformer generativo: es una red convolucional RRDBNet (la arquitectura empleada por Real-ESRGAN) entrenada para la tarea de *image-to-image* de reescalado. Por tanto, sus "especificaciones" no incluyen parámetros en el sentido de un LLM, ni longitud de contexto, ni capacidades de razonamiento o tool calling; la ficha adapta esas categorías a lo que realmente aplica a un upscaler.

La relevancia es acotada y de nicho: cubre un caso de uso muy específico (comunidad furry, archivo y restauración de fotografías de trajes) con un modelo pequeño, entrenado sobre una base conocida y con un script de inferencia con tiling para reducir consumo de VRAM. No hay métricas publicadas, ni descargas, ni validación externa en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RRDBNet (Real-ESRGAN), red convolucional para superresolución |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible (pesos en `.pth`) |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); nombre de fichero de ejemplo: `realesrgan-furry-x4plus.pth` |
| Factor de escala | x4 |
| Modelo base | `xinntao/Real-ESRGAN` |
| Entrada / salida | imagen RGB / imagen RGB ampliada x4 |
| Soporte de tiling | sí, mediante `main.py` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RRDBNet de Real-ESRGAN, una red de bloques residuales densos diseñada para restaurar imágenes degradadas y ampliarlas. Real-ESRGAN introduce un entrenamiento con degradaciones sintéticas de alta complejidad (ruido, desenfoque, compresión JPEG, ringing) para que el modelo generalice a imágenes del mundo real en lugar de solo a pares limpios de alta y baja resolución. Fursuit-Upscale hereda esa base y la ajusta finamente sobre un dataset propio centrado en texturas de pelaje sintético y detalles de trajes.

La información disponible no detalla el número de imágenes de entrenamiento, la composición del dataset, el número de iteraciones, la función de pérdida exacta empleada ni si se usaron discriminadores GAN adicionales durante el ajuste fino. Tampoco se documenta si se partió de los pesos oficiales de Real-ESRGAN x4plus o de otra variante. El único dato técnico concreto es que el autor menciona un ajuste fino "específico" para preservar texturas de pelaje, lo que sugiere un dataset de dominio muy estrecho. No hay información sobre evaluación cuantitativa (PSNR, SSIM, LPIPS) ni sobre validación cruzada.

## Capacidades

- Superresolución de imágenes por factor x4 (upscaling).
- Restauración de detalles finos orientada a texturas de pelaje y materiales de trajes.
- Procesamiento de fotografías y artwork, según la model card.
- Inferencia local con soporte de tiling para limitar el uso de VRAM.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión comprensiva.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo *thinking*, audio ni otras modalidades.

## Casos de uso

- Restauración de fotografías de fursuits: ampliar imágenes antiguas o de baja resolución de trajes conservando el detalle del pelaje sintético, que es precisamente el dominio de ajuste fino del modelo.
- Archivo y preservación digital: reescalar a x4 capturas de eventos o convenciones para su conservación en resolución superior antes de que se degraden más por recompresión.
- Preparación de material para impresión: obtener versiones de mayor resolución de artwork o fotografías destinadas a formatos físicos, con la advertencia de que la calidad depende de la imagen de entrada.
- Mejora de miniaturas y material promocional: ampliar imágenes pequeñas de encargos o portfolios de trajes para su publicación en redes o webs.
- Preprocesado en pipelines de imagen: usar el modelo como etapa previa de reescalado antes de otras tareas de edición o composición, aprovechando el tiling para procesar lotes en GPUs modestas.
- Pruebas de concepto en investigación de upscalers de dominio: servir como ejemplo de ajuste fino de Real-ESRGAN sobre un dataset especializado, útil para comparar el efecto del dominio en la reconstrucción de texturas.
- Integración en herramientas locales de edición: al ser un `.pth` de PyTorch con script de inferencia propio, puede envolverse en un script de línea de comandos o en una interfaz local para uso personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el autor incluye tiling en `main.py` precisamente para reducir el consumo, lo que permite procesar imágenes grandes por mosaicos en GPUs con poca memoria.
- GPU recomendadas: no disponible. Al ser una RRDBNet de Real-ESRGAN, es habitual que estos modelos quepan en GPUs de consumo, pero no hay confirmación del autor para esta variante concreta.
- Cabe en GPU de consumo: probablemente sí con tiling activado, aunque no está documentado.
- Opciones de despliegue: inferencia local con PyTorch mediante el `main.py` proporcionado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escala | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fursuit-Upscale x4 | RRDBNet (Real-ESRGAN) | x4 | Fursuits / pelaje | Apache 2.0 | HuggingFace (0 descargas) |
| Real-ESRGAN (xinntao) | RRDBNet | x2 / x4 | General | BSD-3-Clause (según repositorio original) | GitHub y HuggingFace, ampliamente usado |
| ESRGAN (original) | RRDBNet | x4 | General | Apache 2.0 (según publicación original) | Repositorios académicos y comunitarios |
| SwinIR | Transformer (Swin) | x2 / x3 / x4 | General | Apache 2.0 (según repositorio original) | GitHub, con implementaciones en varias librerías |

La comparación cuantitativa de calidad no está disponible: no hay métricas publicadas para Fursuit-Upscale que permitan situarlo frente a Real-ESRGAN o SwinIR. La diferencia esperable, por el ajuste fino de dominio, es una mejor preservación de texturas de pelaje en imágenes de fursuits y un comportamiento potencialmente peor en dominios fuera de distribución (paisajes, retratos, texto en imagen).

## Limitaciones y advertencias

- Modelo de nicho: el ajuste fino sobre un dataset muy específico puede degradar la calidad en imágenes fuera de ese dominio (texto, arquitectura, retratos humanos, ilustración genérica).
- Sin métricas de validación: no hay PSNR, SSIM ni LPIPS publicados, ni comparaciones antes/después más allá de las imágenes de ejemplo de la model card.
- Riesgo de artefactos: los upscalers GAN pueden introducir texturas inventadas o "alucinadas" en zonas de bajo detalle; conviene revisar manualmente las salidas.
- Sesgos: no documentados; al entrenarse sobre un dataset de fursuits, puede reproducir sesgos de representación de ese conjunto (estilos, colores, tipos de traje).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Real-ESRGAN tiene su propia licencia que conviene verificar antes de redistribuir o desplegar en producción.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la ficha; no hay garantía de soporte, issues resueltos ni actualizaciones.
- Formato `.pth` requiere PyTorch; no se ofrecen versiones ONNX, GGUF ni TensorRT, lo que limita el despliegue en entornos no-Python.
- No es un modelo de lenguaje: cualquier expectativa de texto, razonamiento o agentes queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nexwayne/Fursuit-Upscale
- Modelo base Real-ESRGAN: https://huggingface.co/xinntao/Real-ESRGAN
- Repositorio Real-ESRGAN (GitHub): https://github.com/xinntao/Real-ESRGAN
- Paper Real-ESRGAN (arXiv): https://arxiv.org/abs/2107.10833
- Repositorio ESRGAN original (GitHub): https://github.com/xinntao/ESRGAN
- Repositorio SwinIR (GitHub): https://github.com/JingyunLiang/SwinIR
