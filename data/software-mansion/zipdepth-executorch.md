# software-mansion/ZipDepth-ExecuTorch

## Resumen

ZipDepth-ExecuTorch es la exportación del modelo ZipDepth Base NPU para la librería React Native ExecuTorch. Se trata de un modelo de estimación de profundidad monocular (single-image depth estimation): recibe una imagen RGB y devuelve un mapa de profundidad denso, ejecutable directamente en dispositivos móviles sin necesidad de servidor. El repositorio lo mantiene software-mansion (el equipo detrás de React Native ExecuTorch) y empaqueta el checkpoint original `zipdepth_base_npu.pth` del proyecto ZipDepth de fabiotosi92 en tres variantes de programa `.pte`.

La relevancia de esta publicación es práctica: no introduce una arquitectura nueva, sino que distribuye artefactos listos para inferencia en dispositivo con tres backends distintos (Core ML, Vulkan y XNNPACK), cada uno con su precisión y sus limitaciones de hardware. Esto permite a desarrolladores de aplicaciones React Native integrar profundidad estimada en tiempo real sin depender de la nube.

La información disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es muy limitada: la model card se centra en el proceso de exportación y en las garantías de compatibilidad con el runtime, no en las características del modelo original. El tamaño de los artefactos (12,8 MB en FP16, 24,6-24,9 MB en FP32) sugiere un modelo compacto orientado a despliegue móvil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad monocular; arquitectura interna no detallada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp32 (Core ML, XNNPACK) y fp16 (Vulkan); no se publican variantes int8 |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ExecuTorch `.pte` (tres variantes: Core ML FP32, Vulkan FP16, XNNPACK FP32) |
| Resolución de entrada | 384 (según nombre de fichero `zipdepth_base_384_*`) |
| Runtime objetivo | ExecuTorch v1.4.1 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo original ZipDepth. Lo que sí se documenta es el pipeline de exportación: el checkpoint `zipdepth_base_npu.pth` (revisión `91f3fd21e131641f51e8d35736d1958350180e3a`) se convierte a programas ExecuTorch con tres backends. La variante Core ML se exporta en FP32 porque la exportación FP16 degradaba la concordancia numérica con la referencia float: en siete fotos e ilustraciones, el peor RMSE normalizado por rango fue del 6,31% y la correlación mínima de 0,970. Con FP32, el peor RMSE normalizado por rango bajó por debajo del 0,00012%.

Un detalle técnico relevante es que la variante Core ML en FP32 se ejecuta en CPU/GPU y no puede usar la Apple Neural Engine, ni siquiera configurando `compute units` a `ALL`, debido al modo de ejecución tipada de Core ML. La variante Vulkan en FP16 ocupa 12,8 MB, aproximadamente la mitad que las variantes FP32 (24,6 MB XNNPACK, 24,9 MB Core ML). No se publican datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Estimación de profundidad monocular a partir de una única imagen RGB, con salida de mapa de profundidad denso.
- Inferencia en dispositivo (on-device) mediante ExecuTorch, sin llamadas a servidor.
- Tres backends de ejecución: Core ML (CPU/GPU en Apple), Vulkan (GPU en Android y otros) y XNNPACK (CPU portátil).
- Entrada a resolución 384 (según la nomenclatura de los artefactos).
- Integración con React Native ExecuTorch para aplicaciones móviles multiplataforma.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión puro.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Efectos de desenfoque de fondo en apps de cámara: el modelo genera un mapa de profundidad por fotograma que permite separar primer plano y fondo para aplicar bokeh sintético en tiempo real, con la ventaja de ejecutarse en el propio dispositivo y preservar la privacidad de las imágenes.
- Realidad aumentada móvil: la profundidad estimada permite anclar objetos virtuales con oclusión correcta respecto a la escena real, usando la variante Vulkan FP16 en Android por su menor tamaño (12,8 MB) y su ejecución en GPU.
- Escaneo y digitalización de documentos o interiores: a partir de una sola foto se obtiene una estimación de relieve que puede alimentar reconstrucciones 3D aproximadas o mediciones relativas, sin hardware de profundidad dedicado.
- Accesibilidad: generación de descripciones de relieve o asistencia a personas con discapacidad visual mediante la estimación de distancias relativas en la escena capturada por la cámara del teléfono.
- Procesamiento de imágenes por lotes en el dispositivo: apps de edición fotográfica que aplican ajustes selectivos por profundidad (desenfoque selectivo, sustitución de fondo) sin subir fotos a la nube, aprovechando la variante XNNPACK FP32 para máxima fidelidad numérica en CPU.
- Prototipado rápido en React Native: desarrolladores que quieran validar una funcionalidad de profundidad en iOS y Android con una única integración, usando los tres artefactos publicados y la documentación de descarga de modelos de React Native ExecuTorch.
- Aplicaciones de robótica o dron de bajo consumo: al ser un modelo compacto (menos de 25 MB en FP32), puede integrarse en dispositivos embebidos con runtime ExecuTorch para percepción de obstáculos a corta distancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la concordancia numérica de la exportación Core ML frente a la referencia float: peor RMSE normalizado por rango de 6,31% y correlación mínima de 0,970 en FP16, y peor RMSE normalizado por rango inferior al 0,00012% en FP32, medida sobre siete fotos e ilustraciones.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; el tamaño de los artefactos (12,8 MB FP16, 24,6-24,9 MB FP32) da una cota inferior del espacio de pesos, a la que hay que sumar activaciones y buffers del runtime.
- GPU recomendadas: no se especifican modelos concretos. La variante Vulkan FP16 está pensada para GPUs móviles compatibles con Vulkan; la variante Core ML FP32 usa CPU/GPU de Apple (no la Neural Engine).
- Compatibilidad con GPU de consumo en escritorio: no documentada; el destino declarado es React Native ExecuTorch en dispositivos móviles.
- Opciones de despliegue: runtime ExecuTorch v1.4.1 (obligatorio por falta de garantía de compatibilidad hacia delante), a través de React Native ExecuTorch o de un runtime propio que respete la nota de compatibilidad de ExecuTorch.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: ExecuTorch no garantiza compatibilidad hacia delante, por lo que un runtime anterior a v1.4.1 puede fallar al cargar los `.pte`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZipDepth-ExecuTorch (este) | no disponible | imagen 384 | ExecuTorch `.pte` (Core ML, Vulkan, XNNPACK) | MIT | HuggingFace, 156 descargas |
| ZipDepth original (fabiotosi92) | no disponible | no disponible | checkpoint PyTorch (`.pth`) | no disponible en la información | GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de estimación de profundidad monocular en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos del modelo original ni sesgos introducidos por la exportación; se desconoce su comportamiento en dominios alejados de los datos de entrenamiento.
- Riesgo de alucinación en el sentido de profundidades plausibles pero incorrectas en escenas ambiguas, texturas repetitivas o superficies sin textura; no hay evaluación publicada al respecto.
- La variante Core ML FP32 no puede usar la Apple Neural Engine, lo que puede reducir el rendimiento frente a una ejecución en ANE y condicionar la elección de backend en iOS.
- La variante Core ML FP16 presenta una degradación numérica medible (peor RMSE normalizado por rango del 6,31%, correlación mínima de 0,970), por lo que no es adecuada si se requiere alta fidelidad respecto a la referencia float.
- Dependencia estricta de ExecuTorch v1.4.1: sin garantía de compatibilidad hacia delante, actualizar o degradar el runtime puede romper la carga de los `.pte`.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan en esta ficha las condiciones del modelo original ZipDepth más allá de lo indicado; conviene verificar la licencia del repositorio upstream.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni agentes; cualquier caso de uso debe plantearse como pipeline de visión.
- El repositorio tiene 0 likes y 156 descargas, lo que indica una adopción aún muy limitada y poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/ZipDepth-ExecuTorch
- Modelo original ZipDepth (GitHub): https://github.com/fabiotosi92/ZipDepth
- Checkpoint original: https://github.com/fabiotosi92/ZipDepth/blob/91f3fd21e131641f51e8d35736d1958350180e3a/checkpoints/zipdepth_base_npu.pth
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Guía de ejecución tipada de Core ML: https://apple.github.io/coremltools/docs-guides/source/typed-execution.html
