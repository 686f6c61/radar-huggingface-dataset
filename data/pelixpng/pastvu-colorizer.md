# pelixpng/pastvu-colorizer

## Resumen

PastVu-colorizer es un modelo de colorización de imágenes publicado por el usuario pelixpng en HuggingFace. Se trata de una conversión a Core ML del modelo DDColor-L (variante `ddcolor_modelscope`), presentado en el artículo "DDColor: Towards Photo-Realistic Image Colorization via Dual Decoders" (Kang et al., ICCV 2023). No es un modelo de lenguaje: es un modelo de imagen a imagen cuyo cometido es estimar los canales de color de una fotografía en blanco y negro.

El modelo resuelve una tarea muy concreta con una interfaz mínima y fija: recibe un tensor de luminancia (`grey`) de dimensiones 1×1×512×512 con valores normalizados entre 0 y 1, y devuelve un tensor `ab` de 1×2×512×512 con los canales a y b del espacio de color CIE Lab. El peso está cuantizado a 8 bits con cuantización lineal asimétrica y empaquetado como Core ML ML Program, lo que permite ejecutarlo en dispositivo en iOS 16 o superior.

Su relevancia es fundamentalmente práctica: está pensado para que la aplicación PastVu coloree fotografías históricas en blanco y negro directamente en el teléfono, sin enviar las imágenes a un servidor. El repositorio ocupa 0,2 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DDColor-L (doble decodificador, según el artículo original), convertido a Core ML ML Program |
| Parámetros totales | No disponible (el autor no publica el recuento; el repositorio ocupa 0,2 GB con pesos a 8 bits) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen; entrada fija de 1×1×512×512) |
| Tipos de cuantización | 8 bits, lineal asimétrica (linear, asymmetric) |
| Idiomas soportados | No aplica (modelo sin texto ni procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (requiere iOS 16 o superior) |
| Entrada | Tensor `grey` 1×1×512×512, luminancia como gris neutro, rango 0…1 |
| Salida | Tensor `ab` 1×2×512×512 (canales a y b de CIE Lab) |
| Espacio de color | CIE Lab (L en la entrada, a/b en la salida) |
| Resolución | 512×512 fija |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-10-01 / 2026-10-01 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card identifica el modelo como una conversión de DDColor-L, la variante grande de DDColor, cuyo artículo propone una arquitectura de doble decodificador para colorización fotorrealista. La ficha publicada no detalla la topología interna (backbone, número de capas, mecanismos de atención ni consultas de color), de modo que la descripción arquitectónica completa debe consultarse en el artículo original de Kang et al. (ICCV 2023). Lo que sí especifica el autor es el proceso de conversión: se ha transformado el modelo a un Core ML ML Program (iOS 16+) y se han cuantizado los pesos a 8 bits con esquema lineal asimétrico.

No hay información en la model card sobre el conjunto de entrenamiento (número de tokens o de imágenes, composición del dataset), sobre si hubo ajuste fino con preferencias humanas, ni sobre ninguna innovación técnica añadida durante la conversión más allá de la cuantización. La resolución de trabajo está fijada en 512×512 y el modelo opera exclusivamente en el espacio CIE Lab, lo que separa la información de luminancia de la de cromaticidad: el canal L se aporta desde fuera y la red solo predice a y b.

## Capacidades

- Colorización de imagen a imagen: estima los canales a y b de CIE Lab a partir de la luminancia de una fotografía en blanco y negro.
- Salida a resolución fija de 512×512 píxeles, en formato de tensor 1×2×512×512.
- Inferencia en dispositivo mediante Core ML en iOS 16 o superior, con acceso a las unidades de cómputo disponibles (CPU, GPU y Neural Engine).
- Integración con el flujo de la aplicación PastVu, según declara el propio autor.
- No procesa texto: carece de generación de lenguaje, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No admite condicionamiento por prompt textual, máscaras ni instrucciones de estilo: la única entrada es la luminancia.
- No tiene capacidades multilingües ni visión general; su dominio es estrictamente la traducción de luminancia a cromaticidad.
- No hay modo "thinking", ni procesamiento de audio, ni ninguna otra modalidad.

## Casos de uso

- Archivística y patrimonio histórico: la aplicación PastVu puede colorear fotografías antiguas en blanco y negro en el propio dispositivo, lo que evita subir material con posibles restricciones de derechos a servidores de terceros.
- Aplicaciones móviles de restauración fotográfica: un desarrollador iOS puede empaquetar el ML Program en su app y ofrecer colorización offline, sin coste de API ni conexión a internet.
- Digitalización de álbumes familiares: escanear una fotografía, redimensionarla a 512×512 y ejecutar el modelo localmente para obtener una previsualización coloreada inmediata antes de un retoque manual.
- Catalogación de fondos fotográficos: generar versiones coloreadas de tira de contacto para facilitar la revisión visual de grandes colecciones, sabiendo que el color es una hipótesis y no un dato documental.
- Módulos educativos y de divulgación: mostrar en un museo o en una aplicación didáctica cómo podría haber sido una escena histórica, con la advertencia explícita de que la cromaticidad es inferida.
- Preprocesado en pipelines de visión por computador: usar la salida Lab recompuesta como entrada de etapas posteriores (detección, segmentación o clasificación) cuando el modelo posterior esté entrenado con imágenes en color.
- Prototipado rápido en Xcode: al ser un ML Program, se puede arrastrar al proyecto y probar en el simulador o en dispositivo sin infraestructura de servidor, lo que reduce el tiempo de validación de una funcionalidad de colorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (FID, PSNR, SSIM ni comparativas con otros modelos) y las páginas web encontradas en la búsqueda se limitan a herramientas comerciales de colorización, sin cifras verificables asociadas a esta conversión concreta. Cualquier dato cuantitativo sobre DDColor debe buscarse en el artículo original de Kang et al. (ICCV 2023), que no forma parte de la información proporcionada.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 0,2 GB, coherente con pesos cuantizados a 8 bits; el espacio necesario en el dispositivo es de ese orden.
- Memoria: no se publica una cifra de VRAM. Al ejecutarse en dispositivo, el consumo procede de la memoria unificada del terminal (pesos del orden de 0,2 GB más las activaciones correspondientes a tensores de 512×512).
- Plataforma: Core ML ML Program, que requiere iOS 16 o superior. No hay información sobre compatibilidad con macOS ni con otras plataformas.
- Aceleración: Core ML puede delegar en CPU, GPU o Neural Engine; el autor no especifica qué unidad se usa por defecto ni si el modelo está optimizado para alguna en concreto.
- GPU de escritorio (A100, H100, RTX 4090): no aplica, ya que el formato de pesos es Core ML y no un formato de inferencia para GPU de servidor.
- Opciones de despliegue: Xcode y el marco Core ML en aplicaciones Apple; `coremltools` para inspección o reconversión. vLLM, llama.cpp, Ollama o TGI no son aplicables porque son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni rendimiento por segundo.

## Comparativa con modelos similares

| Modelo | Formato y despliegue | Resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pastvu-colorizer (DDColor-L) | Core ML ML Program, en dispositivo (iOS 16+) | 512×512 | 8 bits lineal asimétrica | Apache 2.0 | HuggingFace, 0 descargas |
| DDColor original (piddnad/DDColor) | PyTorch, GPU o CPU | No disponible en la información | No disponible | Apache 2.0 | Repositorio en GitHub |
| Versión DDColor sobre ONNX Runtime Web citada por VeritySuite | ONNX Runtime Web, navegador | No disponible | No disponible | No disponible | Herramienta web de terceros |
| DeOldify | No disponible | No disponible | No disponible | No disponible | Proyecto público de colorización |
| Herramientas comerciales de colorización (Photo AI, aiimagetoimage.ai, free.ai, MyAIUtility) | Servicio web o procesado en navegador | No disponible | No disponible | Propietaria | Servicios en línea |

La comparación cuantitativa no es posible con los datos disponibles: ni la model card ni las páginas encontradas publican recuentos de parámetros, métricas de calidad o tiempos de inferencia de estas alternativas.

## Limitaciones y advertencias

- La colorización es una inferencia estadística: los colores resultantes pueden ser plausibles pero históricamente falsos (uniformes militares, banderas, vehículos o vestimenta con colores incorrectos).
- Sesgos probables hacia los dominios fotográficos mayoritarios del entrenamiento original (retratos, paisajes, escenas urbanas) y posible degradación en imágenes aéreas, científicas, médicas o muy dañadas.
- Riesgo de sesgo en la reproducción de tonos de piel, un problema documentado en modelos de colorización entrenados con datasets sesgados. La model card no detalla la composición del dataset, por lo que no se puede acotar su alcance.
- La entrada está restringida a luminancia como gris neutro en el rango 0…1 y a una resolución de 512×512; cualquier imagen debe preprocesarse y redimensionarse, con la pérdida de detalle que ello implica.
- La salida son únicamente los canales a y b; es responsabilidad del integrador recomponer la imagen Lab y convertirla de nuevo a RGB.
- Dependencia de plataforma: el formato Core ML limita el uso a iOS 16 o superior (y, presumiblemente, a hardware Apple compatible), lo que excluye su ejecución directa en servidores Linux o GPUs NVIDIA sin una reconversión.
- La licencia Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia y se documenten los cambios. Al derivar del DDColor original, la atribución al trabajo de Kang et al. y al repositorio piddnad/DDColor es obligatoria.
- El modelo se distribuye sin garantías y con 0 descargas y 0 likes: no existe validación independiente, ni informes de terceros, ni métricas publicadas que respalden su calidad en producción.
- No hay información sobre el número de parámetros ni sobre el coste computacional real, lo que dificulta estimar su impacto en batería y latencia en dispositivos móviles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pelixpng/pastvu-colorizer
- Código y pesos originales de DDColor: https://github.com/piddnad/DDColor
- Artículo de referencia citado en la model card: "DDColor: Towards Photo-Realistic Image Colorization via Dual Decoders", Kang et al., ICCV 2023 (la model card lo cita por título, sin enlace directo)
- Aplicación PastVu (mencionada por el autor como consumidora del modelo; no se proporciona URL en la model card)
- Herramienta de colorización que cita el uso de DDColor mediante ONNX Runtime Web: https://veritysuite.pro/tools/images/image-colorizer
- Herramientas de colorización encontradas en la búsqueda, sin relación confirmada con este modelo: https://aiimagetoimage.ai/image-colorizer, https://photoai.com/colorize-photo, https://free.ai/image/colorize/, https://myaiutility.com/tools/ai-photo-colorizer/
