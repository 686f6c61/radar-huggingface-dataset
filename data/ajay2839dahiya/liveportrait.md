# Ajay2839dahiya/LivePortrait

## Resumen

LivePortrait es un sistema de animación de retratos: a partir de una imagen fija y una señal de conducción (un vídeo o una pista de audio) genera un vídeo en el que el retrato reproduce movimiento de cabeza, expresiones y gestos. El proyecto lo desarrolla Kuaishou Technology (organización KwaiVGI) con la colaboración de la Universidad de Ciencia y Tecnología de China y la Universidad de Fudan, y se presentó en julio de 2024 junto al informe técnico "LivePortrait: Efficient Portrait Animation with Stitching and Retargeting Control" (arXiv:2407.03168). El título del paper sitúa dos de sus señas de identidad: módulos de stitching y de retargeting para controlar la animación resultante.

El repositorio analizado aquí, Ajay2839dahiya/LivePortrait, no es la publicación oficial: se trata de una subida de terceros de 2,1 GB, etiquetada con el pipeline image-to-video, licencia MIT y pesos auxiliares en formato ONNX (incluye, entre otros, detectores de malla facial). No aporta una model card propia: el README reproduce, de forma parcial, el del proyecto original de KwaiVGI. Registra 0 descargas y 0 likes, y sus fechas de creación y actualización son idénticas (2026-09-10), un dato de metadatos que no encaja con la cronología pública del proyecto original (julio-agosto de 2024) y que conviene tratar con cautela.

Su relevancia práctica es doble. Por un lado, LivePortrait se distribuye con licencia MIT declarada y con soporte documentado para Linux, Windows (paquete autocontenido), macOS con Apple Silicon y un Space oficial en Hugging Face, lo que indica que la inferencia cabe en hardware de consumo. Por otro lado, el proyecto ha ido ampliando capacidades más allá de la animación imagen-a-vídeo: edición de vídeo retrato (v2v), concatenación de audio y vídeo, recorte automático del vídeo motor, plantillas para proteger la privacidad y un modelo específico para animales. No obstante, en la información disponible no se detallan ni la arquitectura interna, ni el número de parámetros, ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (en la información disponible no se detalla la arquitectura interna; el informe técnico se titula "Efficient Portrait Animation with Stitching and Retargeting Control", lo que indica animación de retrato guiada por señal con módulos de stitching y retargeting) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen a vídeo, no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (los pesos auxiliares del repositorio se distribuyen en ONNX; no se documenta cuantización int8, fp16 ni similar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; la información disponible no detalla idiomas del audio de conducción) |
| Licencia | MIT (declarada en este repositorio) |
| Formato de pesos | ONNX (etiquetas del repositorio y estructura de carpetas, p. ej. `buffalo_l/2d106det.onnx`); la implementación oficial es PyTorch y sus pesos se descargan aparte |
| Pipeline | image-to-video |
| Librería declarada | liveportrait |
| Tamaño del repositorio | 2,1 GB |
| Autor del repositorio | Ajay2839dahiya (subida de terceros; autoría original: KwaiVGI / Kuaishou Technology) |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-09-10 (ambas idénticas) |

## Arquitectura y entrenamiento

La información disponible no incluye detalles de arquitectura, número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO; este modelo no es un modelo de lenguaje, por lo que esas categorías no aplican directamente. Lo que sí se puede afirmar a partir del material proporcionado es que el método se presenta como "efficient portrait animation" con control de stitching y retargeting, y que la implementación de referencia es PyTorch: el README oficial clona el repositorio de código, crea un entorno con Python 3.9 y descarga pesos preentrenados desde Hugging Face, Google Drive o Baidu Yun. El repositorio que nos ocupa redistribuye en cambio componentes en ONNX (por ejemplo, detectores dentro de `pretrained_weights/insightface/models/buffalo_l`).

Las actualizaciones documentadas del proyecto original sí aportan información sobre evolución funcional, aunque no sobre entrenamiento: el 4 de julio de 2024 se publican el código de inferencia, los modelos, la página del proyecto y el informe técnico; el 9 de julio llega el Space de Hugging Face; el 10 de julio se añade concatenación de audio y vídeo, recorte automático del vídeo motor y creación de plantillas para proteger la privacidad; el 17 de julio se habilita macOS con Apple Silicon; el 19 de julio se anuncia edición de vídeo retrato (v2v); el 24 de julio se incorpora edición de pose del retrato fuente en la interfaz Gradio y se baja el umbral de detección por defecto para aumentar el recall; y el 2 de agosto de 2024 se publica un modelo para animales. Cualquier afirmación sobre innovaciones internas (por ejemplo, tipo de keypoints, esquema de deformación o decodificador) no está respaldada por la información disponible.

## Capacidades

- Animación de retrato imagen a vídeo: genera un vídeo animado a partir de una imagen fija y una señal de conducción.
- Conducción por vídeo: el movimiento se transfiere desde un vídeo motor (driving video).
- Conducción por audio: la actualización del 10 de julio de 2024 documenta soporte de concatenación de audio y vídeo.
- Edición de vídeo retrato (v2v): anunciada el 19 de julio de 2024, permite animar o editar un retrato que ya está en vídeo, no solo una imagen fija.
- Edición de pose del retrato fuente: disponible en la interfaz Gradio desde el 24 de julio de 2024.
- Recorte automático del vídeo motor: preprocesado que facilita usar vídeos de conducción sin recorte manual.
- Creación de plantillas para proteger la privacidad: funcionalidad documentada en la actualización del 10 de julio de 2024.
- Modelo para animales: publicado el 2 de agosto de 2024.
- Detección y malla facial: el repositorio incluye pesos auxiliares de detección (por ejemplo `2d106det.onnx`).
- No dispone de tool calling, function calling ni capacidades de agente: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica / no disponible.

## Casos de uso

- Avatares para comunicación personalizada: a partir de una única fotografía se puede generar un vídeo en el que el rostro habla y gesticula, útil para mensajes personalizados a clientes o usuarios sin necesidad de grabar a una persona real en cada variante.
- Doblaje y localización de vídeo: tomando un vídeo de conducción con audio en otro idioma y un retrato fijo, se puede reanimar al hablante original manteniendo su apariencia, lo que reduce costes de regrabación en campañas multiidioma.
- Producción de contenido para redes sociales: el modo v2v y la edición de pose permiten reutilizar material ya grabado y modificar la pose o la expresividad sin volver a rodar, con un coste de cómputo bajo según el propio proyecto ("efficient").
- Postproducción de vídeo retrato: al soportar edición vídeo-a-vídeo y concatenación de audio y vídeo, encaja en flujos de trabajo donde se quiere corregir o retocar la interpretación facial de un plano ya existente.
- Prototipado de personajes y animación: el modelo para animales publicado en agosto de 2024 permite animar retratos de mascotas o personajes no humanos, útil en previsualización de videojuegos, animación o publicidad.
- Atención al cliente con avatar: un asistente virtual puede mostrarse con un rostro animado generado localmente, sin depender de un servicio en la nube, dado que el modelo se ejecuta en hardware de consumo y admite despliegue en macOS con Apple Silicon.
- Investigación en animación facial: al ser código abierto y redistribuible bajo MIT, sirve como línea base reproducible para comparar métodos de retargeting, stitching o transferencia de movimiento.
- Flujos con requisitos de privacidad: la creación de plantillas documentada por el proyecto permite trabajar con representaciones que evitan exponer el rostro original en determinados pasos del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de terceros analizado no incluye métricas, y los resultados de búsqueda consultados no aportan cifras comparativas (FID, LPIPS, similitud de identidad, velocidad de inferencia u otras). El informe técnico existe y está referenciado (arXiv:2407.03168), pero sus valores numéricos no forman parte de la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de memoria en la información consultada.
- Evidencia indirecta de requisitos moderados: el proyecto mantiene un Space oficial en Hugging Face, un paquete autocontenido para Windows que se ejecuta con un script (`run_windows.bat`) y soporte para macOS con Apple Silicon, lo que indica que la inferencia no exige GPU de centro de datos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable según los indicios anteriores, pero sin modelo concreto ni cifra de VRAM confirmada en la información disponible.
- Tamaño en disco de este repositorio: 2,1 GB, cantidad a tener en cuenta al clonar los pesos.
- Opciones de despliegue documentadas: entorno conda con Python 3.9 e instalación por `pip` (Linux y Windows), variante de dependencias para macOS con Apple Silicon, interfaz Gradio, Space de Hugging Face, pesos descargables desde Hugging Face, Google Drive o Baidu Yun, y ejecución de componentes ONNX (por ejemplo, mediante un runtime ONNX). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Dependencia obligatoria: FFmpeg, incluyendo `ffmpeg` y `ffprobe`, según el README.
- Latencia y throughput estimados: no disponible. La documentación no incluye tiempos por fotograma ni FPS alcanzables.

## Comparativa con modelos similares

La búsqueda web realizada no devolvió datos técnicos de modelos alternativos, por lo que las celdas comparativas se marcan como no disponibles. La comparación se limita a la categoría funcional y a lo declarado para LivePortrait.

| Modelo | Categoría | Tipo de conducción | Edición v2v | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LivePortrait (este repositorio, redistribución ONNX) | Animación de retrato | Vídeo y audio (según actualizaciones del proyecto) | Sí (anunciada el 19/07/2024) | no disponible | MIT declarada en el repositorio | 2,1 GB en Hugging Face; 0 descargas |
| LivePortrait (KwaiVGI, oficial) | Animación de retrato | Vídeo y audio | Sí | no disponible | MIT (según la información del proyecto) | Código en GitHub, pesos en Hugging Face, Google Drive y Baidu Yun, Space oficial |
| SadTalker | Animación de retrato / talking head | no disponible | no disponible | no disponible | no disponible | no disponible |
| Wav2Lip | Sincronización labial | no disponible | no disponible | no disponible | no disponible | no disponible |
| AniPortrait u otros sistemas de retrato hablante | Animación de retrato | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: los nombres de la columna "Modelo" corresponden a alternativas de la misma categoría; sus especificaciones no aparecen en la información disponible y deben verificarse en sus fuentes antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Repositorio de terceros no verificado: Ajay2839dahiya no figura como autor original. Los autores del proyecto son Kuaishou Technology, la Universidad de Ciencia y Tecnología de China y la Universidad de Fudan. No hay garantía de que los pesos de este repositorio coincidan con los oficiales; conviene comparar hashes con la publicación de KwaiVGI antes de usarlos.
- Señales de riesgo en los metadatos: 0 descargas, 0 likes y fechas de creación y actualización idénticas (2026-09-10), incoherentes con la cronología pública del proyecto original (julio-agosto de 2024). Tratar como espejo no auditado.
- Ausencia de model card propia: el README reproduce parcialmente el del proyecto original y está truncado en la información proporcionada; no hay documentación específica de esta subida sobre los ficheros ONNX incluidos.
- Licencia: la MIT aparece declarada por el subidor. Los pesos auxiliares de detección facial redistribuidos en el repositorio (por ejemplo, componentes del tipo `insightface/buffalo_l`) pueden estar sujetos a licencias distintas de la MIT y más restrictivas; es imprescindible verificarlas antes de cualquier uso comercial.
- Riesgo de uso indebido: la animación de retratos es la técnica base de deepfakes y suplantación de identidad. La animación de una persona sin su consentimiento, la generación de contenido sexual no consentido o la desinformación son usos prohibidos en la práctica, con implicaciones legales en la Unión Europea y en España. La funcionalidad de "plantillas para proteger la privacidad" documentada por el proyecto no elimina este riesgo.
- Sin evaluación de calidad publicada: no hay métricas de fidelidad, naturalidad ni estabilidad temporal en la información disponible, ni comparaciones verificables con alternativas.
- Carencia de datos de arquitectura y de parámetros: impide dimensionar con precisión el coste de cómputo o anticipar el comportamiento en dominios concretos.
- Casos de fallo no documentados: la información disponible no detalla el comportamiento con perfiles extremos, oclusiones, gafas, iluminación adversa o vídeos de conducción con movimiento rápido. Deben evaluarse con datos propios antes de un despliegue en producción.
- Idiomas y audio: aunque las actualizaciones mencionan concatenación de audio y vídeo, no se especifica qué idiomas o formatos de audio están soportados.
- Dependencia externa: FFmpeg (`ffmpeg` y `ffprobe`) es requisito obligatorio del pipeline; su ausencia rompe la ejecución.
- Alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existen artefactos visuales propios de la generación de vídeo; no se documentan tasas ni tipos en la información disponible.

## Enlaces

- Repositorio analizado: https://huggingface.co/Ajay2839dahiya/LivePortrait
- Repositorio oficial en Hugging Face: https://huggingface.co/KwaiVGI/LivePortrait
- Space oficial: https://huggingface.co/spaces/KwaiVGI/liveportrait
- Código fuente en GitHub: https://github.com/KwaiVGI/LivePortrait
- Informe técnico (arXiv): https://arxiv.org/pdf/2407.03168
- Página del proyecto: https://liveportrait.github.io
- Pesos para Windows: https://huggingface.co/cleardusk/LivePortrait-Windows
- Pesos en Google Drive: https://drive.google.com/drive/folders/1UtKgzKjFAOmZkhNK-OYT0caJ_w2XAnib
- Pesos en Baidu Yun: https://pan.baidu.com/s/1MGctWmNla_vZxDbEp2Dtzw?pwd=z5cn
- Registro de cambios, modelo de animales (02/08/2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-08-02.md
- Registro de cambios, edición de pose (24/07/2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-07-24.md
- Registro de cambios, edición de vídeo retrato (19/07/2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-07-19.md
- Registro de cambios, audio y plantillas (10/07/2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-07-10.md
- Guía práctica de terceros sobre LivePortrait: https://www.visionstory.ai/open-source/liveportrait
- Sitio de terceros sobre LivePortrait: https://liveportrait.org/
