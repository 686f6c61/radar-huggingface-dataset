# PatrickKillinni/clearsnap-detector

## Resumen

ClearSnap detector es un clasificador de imágenes binario que distingue fotografías reales de imágenes generadas por IA. Lo publica PatrickKillinni como artefacto de despliegue para la aplicación ClearSnap y es una conversión directa, sin reentrenamiento, del modelo `haywoodsloan/ai-image-detector-deploy`, un SwinV2 con licencia Apache-2.0. El repositorio contiene únicamente los pesos exportados a ONNX (opset 17) y cuantizados dinámicamente a int8, lo que reduce el artefacto de 790 MB a 190 MB.

Su interés práctico está en el objetivo de despliegue: inferencia completamente offline en dispositivo (móvil, navegador o hardware embebido) con una entrada fija de 256×256 píxeles RGB y una salida de dos logits. No es un modelo generativo ni un LLM: no procesa texto, no soporta tool calling y no tiene ventana de contexto en el sentido habitual. Su relevancia depende de una necesidad muy concreta: filtrar o señalizar imágenes sintéticas sin enviar el contenido a un servidor.

La validación publicada es limitada y hay que leerla con cuidado. El autor reporta una accuracy del 92 % sobre ficheros originales, pero esa cifra incluye procedencia por metadatos además de la inferencia del modelo; cuando los metadatos se eliminan y la imagen se recomprime, la accuracy baja al 88,5 % y la detección de imágenes IA cae al 77 %. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinV2 (heredata del modelo base); exportada a ONNX opset 17. El tamaño concreto de la variante (tiny/base/large) no está documentado |
| Parametros totales | no disponible (el checkpoint fp32 previo a la cuantización ocupa 790 MB; el repositorio final pesa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija `pixel_values` float32 `[1, 3, 256, 256]`) |
| Tipos de cuantizacion | int8 con cuantización dinámica (ONNX Runtime); el original está en fp32 |
| Idiomas soportados | no aplica (clasificación de imágenes; no procesa texto) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | ONNX (opset 17), un único grafo con entrada `pixel_values` y salida `logits` `[1, 2]` |

## Arquitectura y entrenamiento

El modelo es un SwinV2, un transformer con atención por ventanas desplazadas y jerarquía de resolución, especializado aquí en clasificación de imágenes en dos clases. La conversión realizada por PatrickKillinni no implica ningún entrenamiento: se exporta el modelo PyTorch original a ONNX y se aplica cuantización dinámica a int8, con verificación de paridad de salida respecto al modelo original según el autor. La entrada se preprocesa con redimensionado bicúbico PIL a 256×256, escalado a 0–1 y normalización con media y desviación típica de ImageNet, documentada en `preprocessing.json`.

No se detalla en la información disponible ni el volumen de datos de entrenamiento, ni la composición del dataset, ni si hubo ajuste fino con preferencias (RLHF/DPO no aplican a un clasificador). El único dato de evaluación es un conjunto de prueba propio de 393 imágenes: 216 fotos reales procedentes de 27 modelos de teléfono y cámara, y 177 imágenes IA generadas por 20 generadores distintos entre 2024 y 2026, con originales de Wikimedia Commons. La innovación técnica destacable es exclusivamente de despliegue: un artefacto de 190 MB con salida de dos logits (índice 0 = artificial, índice 1 = real) apto para ejecución local.

## Capacidades

- Clasificación binaria de imagen: devuelve dos logits, índice 0 para imagen artificial y índice 1 para imagen real. El orden de las etiquetas es crítico y debe respetarse en la integración.
- Detección de imágenes generadas por IA de distintos generadores: el conjunto de prueba del autor cubre 20 generadores del periodo 2024–2026.
- Inferencia completamente offline y en dispositivo, sin dependencia de red ni de servicios externos.
- Ejecución en CPU sin GPU dedicada, al estar cuantizado a int8 y ocupar 190 MB.
- Entrada de tamaño fijo (256×256, lote de 1 según la firma documentada), lo que simplifica el despliegue pero impide variar resolución o lote sin reexportar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (captioning, VQA) ni audio. No es un modelo multimodal generativo.

## Casos de uso

- Verificación previa en aplicaciones de mensajería o redes sociales: ejecutar el detector en el propio dispositivo antes de adjuntar una imagen, de modo que la app advierta de que el contenido parece generado por IA sin subir la foto a ningún servidor.
- Herramientas de verificación periodística en campo: un periodista o verificador trabaja con conectividad intermitente y necesita una primera señal sobre una imagen recibida; el modelo actúa como filtro de triaje que marca candidatos para revisión humana posterior.
- Limpieza de datasets de entrenamiento: antes de incorporar un corpus de imágenes a un pipeline de entrenamiento, se pasa cada fichero por el clasificador para descartar o etiquetar las muestras sintéticas y reducir la contaminación del dataset.
- Moderación en marketplaces y portales de anuncios: detección de fotos de producto generadas o manipuladas por IA en listados, ejecutada en el backend o en el propio cliente para evitar costes de inferencia en la nube.
- Extensiones de navegador y aplicaciones web: con `onnxruntime-web` el modelo puede ejecutarse del lado del cliente y señalizar imágenes sospechosas mientras el usuario navega, sin enviar contenido a terceros.
- Dispositivos edge sin conectividad: cámaras, quioscos o hardware embebido con CPU modesta que necesitan un clasificador local de imágenes sintéticas, donde los 190 MB y la ejecución en CPU son determinantes.
- Investigación sobre generadores de imagen: uso como línea base reproducible para medir la detectabilidad de distintos modelos generativos, teniendo en cuenta la degradación documentada al recomprimir y eliminar metadatos.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del conjunto de prueba propio del autor (393 imágenes), no de benchmarks estándar. No se han publicado resultados en MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no es generativo.

| Condición de la imagen | Accuracy | Imágenes IA detectadas | Reales marcadas erróneamente |
|---|---|---|---|
| Ficheros originales (modelo + procedencia por metadatos) | 92 % | 88 % | 5 % |
| Copias recompartidas (1600 px, JPEG q85, metadatos eliminados) | 88,5 % | 77 % | 2,3 % |

Advertencia de lectura: la fila de ficheros originales incluye señales de procedencia por metadatos, no solo la inferencia del modelo. La fila de copias recompartidas es la que refleja el rendimiento atribuible al clasificador, con una caída de 11 puntos en la detección de imágenes IA.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todos los casos; el grafo int8 ocupa 190 MB y el pico de memoria de trabajo con `onnxruntime` es del orden de unos pocos cientos de MB.
- GPU: no requiere GPU. Funciona en CPU y se beneficia de cualquier GPU consumer (RTX 3060/4090, incluso iGPU) solo por aceleración opcional.
- Cabe en cualquier GPU consumer y en hardware mucho más limitado: móviles Android/iOS, Raspberry Pi y SBC similares.
- Opciones de despliegue: ONNX Runtime en sus bindings de Python, C++, Java, C# y JavaScript (`onnxruntime-web`), además de ONNX Runtime Mobile. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por imagen ni de imágenes por segundo en CPU o GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatrickKillinni/clearsnap-detector | no disponible (SwinV2) | 256×256×3 fija | 88,5 % accuracy y 77 % de detección IA en copias recomprimidas (test propio del autor) | Apache-2.0 | ONNX int8, 190 MB, 0 descargas |
| haywoodsloan/ai-image-detector-deploy (modelo base) | no disponible (SwinV2) | misma entrada | misma arquitectura; sin datos de benchmark en la información disponible | Apache-2.0 | PyTorch, 790 MB |
| Otros detectores de imágenes IA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para comparar con detectores alternativos de la misma categoría, por lo que la comparación cuantitativa se limita al modelo base, del que este artefacto es una derivación directa con cuantización int8.

## Limitaciones y advertencias

- No se realizó reentrenamiento: se heredan todos los sesgos y errores del modelo base `haywoodsloan/ai-image-detector-deploy`. La cuantización int8 añade una posible pérdida de precisión, aunque el autor afirma haber verificado la paridad de salida.
- La detección depende parcialmente de metadatos de procedencia. Al recomprimir y eliminar metadatos, la detección de imágenes IA cae del 88 % al 77 %, lo que implica que en el caso realista de imágenes recompartidas aproximadamente una de cada cuatro imágenes sintéticas pasa el filtro.
- Tasa de falsos positivos del 5 % en ficheros originales y del 2,3 % en copias: marcar una foto auténtica como generada por IA tiene consecuencias reputacionales y no debe automatizarse sin revisión humana.
- El conjunto de evaluación es pequeño (393 imágenes) y propio del autor, sin validación independiente; los generadores cubiertos son de 2024–2026 y el modelo puede degradarse frente a generadores más recientes.
- Entrada rígida de 256×256 y lote 1 según la firma documentada: cualquier cambio de resolución o de tamaño de lote requiere reexportar el grafo.
- Orden de etiquetas sensible: índice 0 = artificial, índice 1 = real. Una inversión accidental en la integración produce resultados totalmente erróneos.
- Licencia Apache-2.0, que permite uso comercial, pero al ser un derivado conviene conservar los avisos de atribución del modelo base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni informes de terceros sobre comportamiento en dominios distintos al conjunto de prueba del autor.
- No apto para decisiones automatizadas de alto impacto (fraude, verificación de identidad, contenido legal) sin supervisión humana y sin una segunda fuente de verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PatrickKillinni/clearsnap-detector
- Modelo base: https://huggingface.co/haywoodsloan/ai-image-detector-deploy
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
