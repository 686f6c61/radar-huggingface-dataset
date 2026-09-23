# Erddoniri/LivePortrait

## Resumen

LivePortrait es un modelo de animacion de retratos (portrait animation) que genera video a partir de una imagen estatica de una cara y una senal de conduccion, que puede ser un video de otra persona, un video del propio sujeto o audio. Lo desarrolla Kuaishou Technology en colaboracion con la University of Science and Technology of China y la Fudan University, y su implementacion de referencia es la publicacion oficial en PyTorch del articulo "LivePortrait: Efficient Portrait Animation with Stitching and Retargeting Control" (arXiv:2407.03168). La ficha analizada, Erddoniri/LivePortrait, es una reproduccion de terceros del repositorio original KwaiVGI/LivePortrait, con licencia MIT y 2,1 GB de pesos.

El modelo no es un modelo de lenguaje ni un transformer generativo de texto: es un sistema de vision por computador de tipo feed-forward que representa el movimiento facial mediante keypoints implicitos y lo transfiere a la imagen de origen. Frente a las alternativas basadas en difusion, que requieren decenas de pasos de muestreo, este enfoque resuelve la animacion en un numero reducido de pases de red, lo que lo hace apto para inferencia en tiempo real y su despliegue en hardware de consumo, incluido macOS con Apple Silicon.

Su relevancia practica esta en el control fino del resultado: el repositorio incorpora modulos de stitching y retargeting que permiten editar la pose de la fuente, combinar movimiento ocular y labial, procesar video a video (v2v), concatenar audio y video, y recortar automaticamente el video de conduccion. Todo ello con licencia MIT, lo que facilita su integracion en productos comerciales sin las restricciones habituales de los modelos de generacion facial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feed-forward con representacion de movimiento mediante keypoints implicitos; modulos de extraccion de apariencia, extraccion de movimiento, warping, generador con normalizacion SPADE, stitching y retargeting. Implementacion de referencia en PyTorch, con componentes auxiliares exportados a ONNX |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica: no es un modelo de lenguaje ni procesa secuencias de texto |
| Tipos de cuantizacion | no disponible. Se distribuyen pesos en su precision original (PyTorch) y modelos ONNX para deteccion facial (por ejemplo, 2d106det.onnx dentro del paquete InsightFace buffalo_l) |
| Idiomas soportados | no aplica. El modelo no procesa texto; no hay informacion sobre cobertura de idiomas en la senal de audio |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) y ONNX (.onnx) |
| Tamano del repositorio | 2,1 GB |
| Pipeline declarado | image-to-video |
| Modalidad de entrada y salida | Imagen de retrato + video o audio de conduccion → video animado |
| Libreria declarada | liveportrait |
| Autor de la publicacion | Erddoniri (repositorio original: KwaiVGI) |
| Descargas y likes | 0 descargas, 0 likes en el momento del analisis |

## Arquitectura y entrenamiento

LivePortrait sigue un diseno de animacion de retrato basado en keypoints implicitos aprendidos de extremo a extremo. El sistema desacopla apariencia y movimiento: un extractor de apariencia codifica la identidad de la imagen fuente, un extractor de movimiento deriva la deformacion de la cara conductora en forma de keypoints implicitos, y un modulo de warping aplica esa deformacion sobre las caracteristicas de la fuente. Un generador con normalizacion SPADE reconstruye el fotograma final. Sobre esta base se anaden dos modulos especificos del trabajo: stitching, que cose las regiones generadas con el resto del retrato original para preservar el fondo y la zona no facial, y retargeting, que permite controlar de forma separada la direccion de la mirada y la apertura de la boca, entre otros parametros de movimiento.

El modelo se distribuye como un conjunto de pesos independientes (extractor de apariencia, extractor de movimiento, generador y modulos de stitching y retargeting) junto con modelos de deteccion facial de InsightFace en formato ONNX. La model card no especifica el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion por preferencias (RLHF/DPO), por lo que esos datos deben consultarse en el informe tecnico (arXiv:2407.03168). La model card si documenta dos innovaciones funcionales relevantes: el soporte de animacion de animales (agosto de 2024) y el control de pose de la fuente desde la interfaz Gradio (julio de 2024).

## Capacidades

- Animacion de retrato image-to-video: genera video a partir de una unica imagen estatica y un video de conduccion.
- Edicion de video a video (v2v): transfiere el movimiento de un video conductor sobre un retrato o sobre otro video.
- Control de pose y expresion: permite editar la pose del retrato fuente, ademas de modular direccion de mirada y apertura de boca mediante retargeting.
- Concatenacion de audio y video: el pipeline admite componer flujos de audio y video para producir resultados sincronizados.
- Recorte automatico del video de conduccion: preprocesa y encuadra automaticamente la cara del video conductor.
- Modo plantilla: permite generar plantillas que evitan exponer directamente el material original, util para preservar la privacidad del sujeto.
- Modelo especifico para animales, publicado el 2 de agosto de 2024.
- Compatibilidad multiplataforma: Linux, Windows (paquete preempaquetado con script de arranque) y macOS con Apple Silicon.
- Deteccion facial integrada mediante el paquete InsightFace buffalo_l (incluye 2d106det.onnx).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural: no es un modelo fundacional de texto.

## Casos de uso

- Doblaje y localizacion de video: se anima el retrato original con la trayectoria facial de un actor de doblaje, manteniendo la identidad del hablante. El retargeting de boca y mirada permite ajustar la sincronia sin regenerar el video completo.
- Produccion de avatares para atencion al cliente: a partir de una sola fotografia corporativa se puede generar un presentador animado para tutoriales y respuestas en video, con coste de computo bajo por ser un modelo feed-forward y no de difusion.
- Marketing y contenido para redes: el modo plantilla permite reutilizar material de archivo sin necesidad de que el sujeto este presente en una nueva grabacion, y el soporte v2v conserva el encuadre y la iluminacion originales.
- Postproduccion audiovisual y correccion de plano: el modulo de stitching preserva fondo y zonas no faciales, de modo que la animacion se integra en el plano existente sin regenerar la escena entera.
- E-learning y cursos corporativos: se puede sustituir la locucion manteniendo la imagen del instructor, variando la expresion mediante retargeting para acompanar el tono del nuevo audio.
- Restauracion y animacion de archivo historico: fotografias antiguas pueden cobrar movimiento controlado; el recorte automatico del video conductor facilita extraer el movimiento de material ya existente.
- Videojuegos, VTubing y telepresencia: al ejecutarse en tiempo real sobre GPU de consumo e incluso en macOS con Apple Silicon, es viable en aplicaciones interactivas donde la latencia por fotograma es critica.
- Investigacion en animacion facial: la licencia MIT y la disponibilidad de pesos en PyTorch permiten reentrenar, modificar los modulos de stitching y retargeting y publicar derivados sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la reproduccion analizada ni los datos de HuggingFace recogidos incluyen tablas comparativas con metricas cuantitativas (FID, LPIPS, LMD, similitud de identidad, etc.). El articulo tecnico asociado, arXiv:2407.03168, es la fuente donde deben consultarse dichas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no incluye cifras de memoria por modulo ni por nivel de precision.
- GPU recomendadas: no disponible de forma explicita. El repositorio no impone un modelo concreto de GPU.
- Viabilidad en GPU de consumo: el repositorio documenta soporte oficial para macOS con Apple Silicon y distribuye un paquete preempaquetado para Windows pensado para ejecucion local, lo que indica que el modelo esta disenado para funcionar fuera de entornos de centro de datos. No se especifican modelos de GPU concretos.
- Despliegue: la via oficial es la implementacion en PyTorch del repositorio original, con interfaz Gradio y una demonstracion alojada en HuggingFace Spaces. Se distribuyen tambien modelos ONNX para la deteccion facial, desplegables con ONNX Runtime. No se mencionan integraciones oficiales con vLLM, TGI, llama.cpp u Ollama, que ademas no aplican a este tipo de modelo.
- Dependencias del sistema: Python 3.9, las dependencias de requirements.txt (o requirements_macOS.txt en Apple Silicon) y FFmpeg con ffmpeg y ffprobe disponibles en el PATH.
- Latencia y throughput: no disponible. La model card no publica mediciones de milisegundos por fotograma ni de FPS.
- Almacenamiento: el repositorio de pesos ocupa 2,1 GB.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de benchmarks ni fichas tecnicas de alternativas, por lo que no es posible establecer una comparacion cuantitativa rigurosa. A continuacion se listan las familias de modelos que compiten en la misma categoria funcional, marcando como no disponible todo dato que no este respaldado por la informacion recibida.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LivePortrait (Erddoniri) | Keypoints implicitos, feed-forward, no difusion | no disponible | no aplica | MIT | HuggingFace, GitHub, paquete Windows, macOS |
| LivePortrait (KwaiVGI, original) | Keypoints implicitos, feed-forward, no difusion | no disponible | no aplica | MIT | HuggingFace, GitHub, HuggingFace Spaces |
| Alternativas de animacion de retrato guiadas por audio | no disponible | no disponible | no aplica | no disponible | no disponible |
| Alternativas de animacion de retrato basadas en difusion | no disponible | no disponible | no aplica | no disponible | no disponible |

La diferencia funcional que si puede afirmarse a partir de la informacion disponible es que LivePortrait se controla principalmente con un video de conduccion, y admite tambien concatenacion de audio y video, mientras que la comparacion con modelos exclusivamente guiados por audio queda fuera del alcance de los datos recogidos.

## Limitaciones y advertencias

- Sesgos: no disponible. No se documentan evaluaciones de sesgo demografico, etnico o de genero, aspecto especialmente sensible en modelos de generacion facial.
- Riesgo de alucinacion en el sentido generativo: el modelo no produce texto, pero si puede generar artefactos visuales en zonas no observadas del rostro, incoherencias temporales entre fotogramas o deformaciones en perfiles extremos y oclusiones. La model card no cuantifica estas tasas de error.
- Limitacion de dominio: el modelo original esta orientado a retratos humanos y requiere una deteccion facial previa correcta (paquete InsightFace buffalo_l). En casos de baja resolucion, caras pequenas o muy ocluidas, la deteccion puede fallar y condicionar toda la animacion.
- Idiomas: no aplica al texto. La calidad de la sincronia labial con audio depende del pipeline de concatenacion y no de una cobertura linguistica declarada.
- Licencia: MIT, lo que permite uso comercial, modificacion y redistribucion manteniendo el aviso de copyright y la licencia. Es una de las licencias mas permisivas del sector, sin clausulas de uso aceptable adicionales en la informacion disponible.
- Advertencia de procedencia: esta ficha corresponde a Erddoniri/LivePortrait, una reproduccion de terceros con 0 descargas y 0 likes. Para produccion conviene verificar la integridad de los pesos contra el repositorio oficial KwaiVGI/LivePortrait y sus sumas de comprobacion.
- Uso responsable: al ser un sistema de animacion facial, existe riesgo de suplantacion de identidad, desinformacion y creacion de material no consentido. El propio repositorio incorpora el modo plantilla precisamente para preservar la privacidad del sujeto; conviene aplicar consentimiento explicito y marcado de contenido sintetico.
- Ausencia de garantias: la model card no documenta condiciones de servicio, soporte ni compromisos de mantenimiento por parte del publicador de esta reproduccion.

## Enlaces

- Ficha de HuggingFace analizada: https://huggingface.co/Erddoniri/LivePortrait
- Repositorio original en HuggingFace: https://huggingface.co/KwaiVGI/LivePortrait
- Codigo fuente en GitHub: https://github.com/KwaiVGI/LivePortrait
- Articulo tecnico en arXiv: https://arxiv.org/pdf/2407.03168
- Pagina del proyecto: https://liveportrait.github.io
- Demostracion en HuggingFace Spaces: https://huggingface.co/spaces/KwaiVGI/liveportrait
- Paquete preempaquetado para Windows: https://huggingface.co/cleardusk/LivePortrait-Windows/tree/main
- Pesos alternativos en Google Drive: https://drive.google.com/drive/folders/1UtKgzKjFAOmZkhNK-OYT0caJ_w2XAnib
- Pesos alternativos en Baidu Yun: https://pan.baidu.com/s/1MGctWmNla_vZxDbEp2Dtzw?pwd=z5cn
- Notas de la version para animales (2 de agosto de 2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-08-02.md
- Soporte de edicion de pose (24 de julio de 2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-07-24.md
- Soporte de edicion de video a video (19 de julio de 2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-07-19.md
- Soporte de macOS con Apple Silicon, PR 143: https://github.com/KwaiVGI/LivePortrait/pull/143
- Notas de la version de concatenacion de audio y video (10 de julio de 2024): https://github.com/KwaiVGI/LivePortrait/blob/main/assets/docs/changelog/2024-07-10.md
- Descarga de FFmpeg: https://ffmpeg.org/download.html

Nota sobre la busqueda web: los resultados recuperados en la busqueda (dafont.com, zhihu.com y 52pojie.cn, entre otros) no guardan relacion con el modelo LivePortrait ni con su ecosistema, por lo que se han descartado por no aportar informacion verificable sobre el objeto de esta ficha.
