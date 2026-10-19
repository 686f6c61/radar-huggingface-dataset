# FreeHugsForRobots/ps-liveportrait

## Resumen

ps-liveportrait es una conversión a Core ML en fp16 de los cinco checkpoints para rostros humanos de LivePortrait, el sistema de animación de retratos desarrollado por KlingTeam / Kuaishou (Centro de Generación Visual e Interacción) y publicado con licencia MIT. El repositorio lo mantiene el usuario FreeHugsForRobots y su uso previsto declarado es la vista previa en vivo «Expression Matrix» de la aplicación DepthField Photo. No es un modelo de lenguaje ni un transformer generativo de texto: es un pipeline de visión por computador que transfiere expresión y pose de una cara de referencia (driver) a una imagen de retrato estática.

La relevancia técnica está en la conversión: LivePortrait original depende de PyTorch y de operaciones poco amigables para Core ML (muestreo de rejilla 3D, convoluciones 3D, spectral normalization). El autor reescribe el muestreo 3D como un muestreo 2D sobre un atlas de cortes de profundidad, sustituye las convoluciones 3D por sumas de convoluciones 2D con batch norm plegada, hornea la spectral norm en los pesos y divide la red de warping en tres modelos, de modo que el conjunto pueda ejecutarse en el Neural Engine y la GPU de hardware Apple.

El paquete completo se distribuye como un ZIP de 269.809.870 bytes (unos 257 MiB) con seis `.mlpackage` en fp16 y dos tensores f32, dentro de un repositorio de 0,3 GB. La conversión es de terceros, no está validada por Kuaishou y, en el momento de redactar esta ficha, el repositorio no registra descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline LivePortrait: extractor de características de apariencia (F), extractor de movimiento (M), módulo de warping (W1, W2, W3) y generador SPADE (G), más dos MLP (stitching y retargeting de labios); no es un transformer ni un LLM |
| Parámetros totales | no disponible (el autor no publica el recuento; el ZIP fp16 ocupa 269.809.870 bytes) |
| Longitud de contexto | no aplica: modelo de visión para animación de retratos, no procesa texto |
| Tipos de cuantización | fp16 en los seis `.mlpackage`; f32 little-endian en `lp_stitching` y `lp_lip`; no se publican variantes INT8/INT4 |
| Idiomas soportados | no disponible; no aplica (sin componente de texto) |
| Licencia | MIT (Copyright (c) 2024 Kuaishou Visual Generation and Interaction Center) |
| Formato de pesos | Core ML `.mlpackage` (fp16) y tensores `.f32` en bruto, empaquetados en `liveportrait-fp16.zip` (método STORED) |
| Modelo base | KwaiVGI/LivePortrait (revisión `82a4fa6`), tags `KlingTeam/LivePortrait` |
| Tamaño del repositorio | 0,3 GB |
| Hash del ZIP | sha256 `00ee879e694a2cd6ff6059db431d44a2ecb17cf1ce4c132c2a7ef17133d21129` |

## Arquitectura y entrenamiento

El pipeline replica la descomposición de LivePortrait en módulos independientes: `lp_F_fp16` extrae la apariencia del retrato de origen, `lp_M_fp16` extrae el movimiento (pose de cabeza y expresión) de la imagen o vídeo de conducción, `lp_W1/W2/W3_fp16` implementan el warping —dividido en tres modelos para poder compilarlo en Core ML— y `lp_G_fp16` es el generador SPADE que sintetiza la región facial animada. Los dos MLP en f32 (`lp_stitching`, `lp_lip`) recomponen la región generada sobre la imagen original y aplican retargeting de labios.

Las modificaciones respecto al original son de compatibilidad y eficiencia, no de reentrenamiento: el muestreo de rejilla 3D se convierte en un único muestreo 2D sobre un atlas de cortes de profundidad, las convoluciones 3D se descomponen en sumas de convoluciones 2D con la batch norm plegada en los pesos, la spectral normalization se aplica en tiempo de conversión y la red de warping se parte en tres submodelos. El autor no documenta datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, porque los pesos proceden íntegramente del modelo base; esa información debe consultarse en la model card de KwaiVGI/LivePortrait.

Un detalle crítico: el paquete no incluye los modelos InsightFace de detección y reconocimiento facial, ni el modelo de landmarks, ni los checkpoints para animales, ni X-Pose. Es decir, se distribuye solo el núcleo de animación, no el preprocesado necesario para localizar y alinear la cara.

## Capacidades

- Transferencia de expresión facial y pose de cabeza desde una imagen o vídeo de conducción a un retrato estático de una persona.
- Extracción de apariencia y de movimiento mediante representaciones implícitas (keypoints aprendidos), sin malla facial explícita en el paquete convertido.
- Retargeting de labios mediante el MLP `lp_lip`, orientado a transferir movimiento de boca.
- Composición de la región animada sobre la imagen original mediante el MLP `lp_stitching`.
- Inferencia local en hardware Apple a través de Core ML, con reparto automático entre Neural Engine, GPU y CPU.
- Especializado exclusivamente en rostros humanos: no incluye modelos para animales ni estimación de pose corporal (X-Pose).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo lingüístico y no tiene tales capacidades.
- No hay modo «thinking», visión general, audio ni capacidades multilingües.

## Casos de uso

- Vista previa de expresiones en apps de fotografía: el paquete se diseñó para la «Expression Matrix» de DepthField Photo, donde el usuario previsualiza distintas expresiones sobre su retrato antes de aplicar el efecto, con latencia de inferencia local en el dispositivo.
- Edición de retratos en iOS y macOS: aplicar la expresión de una selfie de referencia a una foto de estudio, ejecutando los `.mlpackage` con la API Core ML en Swift sin enviar imágenes a la nube.
- Animación de avatares para vídeo corto en local: generar clips de un retrato fijo a partir de un vídeo de conducción, útil cuando la privacidad impide subir material facial a servidores externos.
- Transferencia de actuación para previsualización (previs) y storyboards: animar retratos de personajes con la interpretación de un actor de referencia antes de rodar la escena.
- Prototipado de investigación en animación de retratos sobre Apple Silicon: banco de pruebas para medir latencia y consumo del Neural Engine con un pipeline de animación realista.
- Aumento de datos sintéticos: generar variaciones controladas de expresión sobre un mismo retrato para entrenar o evaluar modelos de reconocimiento de emociones o de detección de puntos faciales.
- Efectos en tiempo real en apps de cámara: al estar compilado para Core ML, puede encadenarse con captura de vídeo en iPhone/iPad para filtros de animación facial, siempre que se aporte el detector y el alineador facial externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de fidelidad (por ejemplo, error de keypoints, SSIM o FID), ni comparaciones cuantitativas con el LivePortrait original en PyTorch, ni mediciones de latencia por dispositivo.

## Requisitos de hardware

- VRAM: no disponible. El ZIP fp16 pesa 269.809.870 bytes (unos 257 MiB); el repositorio completo ocupa 0,3 GB, por lo que los pesos caben holgadamente en la memoria unificada de cualquier Apple Silicon.
- Hardware objetivo: dispositivos Apple con soporte Core ML (familias M1/M2/M3/M4 y chips A-series con Neural Engine). No hay build para CUDA ni para GPU NVIDIA.
- GPU recomendadas: no aplica en el sentido habitual; el equivalente es un SoC Apple. No se documentan tiempos por modelo (M1, M2 Pro, M3 Max, etc.).
- ¿Cabe en GPU de consumo? Sí en el sentido de que cabe en cualquier Mac o iPhone/iPad modernos; no hay versión para RTX 4090 u otras GPU de consumo x86.
- Opciones de despliegue: Core ML (API Swift en Xcode, o `coremltools`/`coremltools` runtime en Python), integración en apps iOS/iPadOS/macOS. No hay soporte para vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del reparto ANE/GPU/CPU que haga Core ML y del dispositivo; el autor no publica cifras.
- Requisito adicional: hay que aportar por separado la detección y el alineamiento facial (InsightFace, landmarks) que el paquete deliberadamente excluye.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ps-liveportrait (esta conversión) | Core ML fp16 | no disponible | no aplica | MIT | HuggingFace, 0 descargas, 0 likes |
| LivePortrait upstream (KwaiVGI/LivePortrait) | PyTorch | no disponible | no aplica | MIT | HuggingFace y GitHub de KlingTeam |
| Otros sistemas de animación de retratos (por ejemplo SadTalker o face-vid2vid) | no disponible | no disponible | no aplica | no disponible | no verificado en la información disponible |

La comparación relevante es con el modelo base: esta conversión mantiene la licencia MIT y la arquitectura, pero elimina dependencias de PyTorch y las operaciones 3D a cambio de perder los módulos de preprocesado (InsightFace, landmarks), los checkpoints de animales y X-Pose. No se dispone de datos verificados de parámetros ni de rendimiento de las alternativas en la información proporcionada, por lo que no se establece una comparación cuantitativa.

## Limitaciones y advertencias

- Solo contiene los cinco checkpoints humanos: no hay soporte para animales ni estimación de pose corporal (X-Pose).
- No incluye detección facial, alineamiento ni landmarks: sin un pipeline externo de preprocesado, los modelos no pueden localizar la cara de entrada.
- Conversión de terceros: el repositorio lo publica FreeHugsForRobots, no Kuaishou; no hay validación oficial, ni demos, ni métricas de fidelidad frente al original.
- Ausencia total de benchmarks: no se puede afirmar que la versión Core ML fp16 preserve la calidad de la versión PyTorch.
- Riesgo de alucinación en el sentido de LLM: no aplica; el riesgo equivalente es la generación de animaciones fotorrealistas falsas de personas (deepfakes), con implicaciones de suplantación de identidad y consentimiento.
- Sesgos: no documentados en la información disponible; al heredar los pesos de LivePortrait, los sesgos de representación facial del dataset original se transfieren sin que el autor los analice.
- Idiomas: no aplica, pero la calidad puede degradarse en perfiles extremos, oclusiones o imágenes de baja resolución; el autor no documenta estos límites.
- Licencia MIT: permite uso comercial y modificación conservando el aviso de copyright de Kuaishou; conviene verificar los términos de las dependencias upstream que no se incluyen en el paquete.
- Repositorio sin tracción (0 descargas, 0 likes) y creado en 2026: madurez y mantenimiento no verificables; solo se ofrece el sha256 del ZIP como garantía de integridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FreeHugsForRobots/ps-liveportrait
- Modelo base en HuggingFace: https://huggingface.co/KwaiVGI/LivePortrait
- Repositorio GitHub de LivePortrait (KlingTeam): https://github.com/KlingTeam/LivePortrait
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de Amazon Prime), por lo que no se añaden enlaces adicionales de papers, blogs o demos.
