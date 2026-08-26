# avencera/moondream2-mlx-vlm

## Resumen

Moondream 2 es un modelo de lenguaje y visión (VLM) pequeño y eficiente, diseñado para ejecutarse en dispositivos con recursos limitados, incluyendo equipos de escritorio, portátiles y edge. Desarrollado por Vikhyat (vikhyatk) y publicado originalmente en Hugging Face, este repositorio concreto (`avencera/moondream2-mlx-vlm`) es una conversión a formato MLX, pensada para su uso en Apple Silicon mediante la librería MLX-VLM. El modelo cuenta con aproximadamente 1,93 mil millones de parámetros y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones.

La versión incluida corresponde al lanzamiento del 21 de junio de 2025, que incorpora mejoras significativas en razonamiento fundamentado (grounded reasoning), detección de objetos más precisa, generación de texto más rápida mediante un tokenizador de "superpalabras" y una mejora notable en comprensión de interfaces de usuario. Aunque el autor del repositorio indica que la versión más reciente de Moondream es la 3 (preview), esta ficha se centra en Moondream 2, que se considera estable para producción.

El modelo destaca por su versatilidad: es capaz de generar descripciones de imágenes, responder preguntas visuales, detectar objetos, señalar elementos concretos y realizar razonamiento paso a paso sobre imágenes. Su pequeño tamaño lo hace atractivo para aplicaciones donde la latencia y el coste computacional son críticos, como asistentes en tiempo real o sistemas embebidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (encoder SigLIP + decoder Phi-1.5) |
| Parametros totales | 1.927.237.104 (1,93 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato MLX admite cuantización, pero no se especifica) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Moondream 2 sigue una arquitectura típica de VLM: un codificador de visión basado en SigLIP (un modelo de visión contrastivo) y un decodificador de lenguaje basado en Phi-1.5, un modelo transformer pequeño. El modelo se entrena inicialmente con datos de imagen-texto y posteriormente se afina con aprendizaje por refuerzo (RL) en 55 tareas de visión y lenguaje, con planes de ampliarlo a unas 120. Este proceso de RL refuerza capacidades como el razonamiento fundamentado y la detección de objetos.

Una innovación destacada en la versión de junio de 2025 es el nuevo tokenizador de "superpalabras" (superword), que reduce el número de tokens generados sin pérdida de precisión, logrando una generación de texto entre un 20 % y un 40 % más rápida. Además, se introdujo un hiperred de transferencia ligera que facilita futuras extensiones multilingües. El modelo también soporta decodificación con temperatura y muestreo nucleus para reducir salidas repetitivas.

## Capacidades

- Generación de descripciones de imágenes en formato corto, normal o largo, con opción de streaming.
- Respuesta a preguntas visuales (visual querying) sobre el contenido de una imagen.
- Detección de objetos con bounding boxes, incluyendo detección de objetos pequeños y distinción de atributos (por ejemplo, "botella azul" frente a "botella").
- Señalización (pointing) de elementos concretos en una imagen.
- Razonamiento fundamentado (grounded reasoning): modo paso a paso que localiza espacialmente los elementos antes de responder, mejorando la precisión en tareas como cálculo de medianas en gráficos o conteo exacto.
- Comprensión de documentos y OCR: puede transcribir texto en documentos y tablas, con mejoras en DocVQA y TextVQA.
- Comprensión de interfaces de usuario (UI): localización de elementos en pantallas, con una mejora significativa en ScreenSpot (F1@0.5 de 60,3 a 80,4).
- Etiquetado de imágenes de vocabulario abierto.
- Soporte de tool calling y function calling (no se menciona explícitamente, pero al ser un modelo de lenguaje, puede adaptarse; sin embargo, no está documentado en la model card).

## Casos de uso

- **Atención al cliente con imágenes**: el modelo puede analizar capturas de pantalla o fotos enviadas por usuarios para identificar problemas (por ejemplo, errores en una aplicación) y generar respuestas contextuales. Su pequeño tamaño permite desplegarlo en servidores de baja capacidad o en el edge.
- **Accesibilidad para personas con discapacidad visual**: generar descripciones detalladas de imágenes en tiempo real, ayudando a entender el contenido visual en aplicaciones de asistencia.
- **Automatización de pruebas de UI**: detectar y localizar elementos en capturas de pantalla de aplicaciones web o móviles, facilitando la verificación automática de interfaces.
- **Análisis de documentos**: extraer texto de facturas, formularios o tablas mediante OCR, y responder preguntas sobre el contenido, útil en flujos de trabajo de gestión documental.
- **Sistemas de vigilancia y monitorización**: detectar objetos o personas en imágenes de cámaras, con capacidad de señalar su posición, para alertas en tiempo real.
- **Asistentes de compra online**: analizar fotos de productos para identificar características, generar descripciones o responder preguntas sobre el artículo.
- **Educación y tutoría visual**: responder preguntas sobre diagramas, gráficos o ilustraciones en entornos educativos, ayudando a estudiantes a comprender conceptos visuales.
- **Robótica y visión por computador en edge**: al ser ligero, puede integrarse en robots o dispositivos IoT para tareas de navegación o reconocimiento de objetos.

## Benchmarks y rendimiento

La model card proporciona algunos resultados de benchmarks para la versión de junio de 2025, aunque no se presentan comparaciones con otros modelos. Se listan a continuación los valores mencionados:

| Tarea | Métrica | Resultado |
|---|---|---|
| ChartQA | Exact match | 77,5 (82,2 con PoT) |
| DocVQA | Exact match | 79,3 |
| TextVQA | Exact match | 76,3 |
| ScreenSpot | F1@0.5 | 80,4 |
| CountBenchQA | Exact match | 86,4 |
| OCRBench | Puntuación | 61,2 |
| COCO (detección) | AP | 51,2 |

Estos datos provienen de las notas de lanzamiento del modelo y reflejan mejoras respecto a versiones anteriores. No se dispone de una comparativa formal con otros VLM en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo de 1,93 B de parámetros, en FP16 ocupa aproximadamente 3,9 GB de memoria, por lo que puede ejecutarse en GPUs con 4 GB de VRAM o más (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.).
- Con cuantización a 8 bits, el uso de VRAM se reduce a unos 2 GB, y a 4 bits a aproximadamente 1 GB, lo que permite ejecutarlo en GPUs integradas o incluso en CPU (aunque con mayor latencia).
- Este repositorio concreto está en formato MLX, por lo que está optimizado para Apple Silicon (M1, M2, M3, etc.) mediante la librería MLX-VLM. Se puede ejecutar en Macs con al menos 8 GB de RAM unificada.
- Para despliegue en producción, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque la versión MLX está pensada para entornos Apple.
- La latencia depende del hardware; en una GPU moderna se esperan decenas de tokens por segundo, pero no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, Moondream 2 se puede comparar cualitativamente con otros VLM pequeños como:

- **Phi-3.5-vision** (4,2 B): mayor tamaño, mejor rendimiento en benchmarks generales, pero requiere más recursos.
- **LLaVA-1.5** (7 B): más grande y con más capacidad, pero menos eficiente.
- **TinyLLaVA** (1,1 B): similar en tamaño, pero con menos funcionalidades (sin detección ni pointing).

Moondream 2 destaca por su combinación de tamaño reducido y capacidades específicas como detección de objetos y razonamiento fundamentado, que no están presentes en todos los modelos de su categoría.

## Limitaciones y advertencias

- Al ser un modelo pequeño, puede presentar alucinaciones o errores en tareas complejas de razonamiento visual, especialmente con imágenes ambiguas o de baja calidad.
- La información sobre idiomas no está disponible; aunque el modelo se entrena principalmente con datos en inglés, puede funcionar razonablemente en otros idiomas, pero sin garantías.
- La longitud de contexto no está especificada; se recomienda verificar el comportamiento con entradas largas.
- Este repositorio es una conversión MLX, por lo que no es directamente utilizable con las librerías estándar de Hugging Face Transformers sin conversión adicional. Para usar el modelo original, se debe acceder a `vikhyatk/moondream2`.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente al autor original.
- El modelo se actualiza con frecuencia; se recomienda fijar una revisión específica (por ejemplo, `2025-06-21`) en entornos de producción para evitar cambios inesperados.

## Enlaces

- Repositorio Hugging Face: [avencera/moondream2-mlx-vlm](https://huggingface.co/avencera/moondream2-mlx-vlm)
- Modelo original: [vikhyatk/moondream2](https://huggingface.co/vikhyatk/moondream2)
- Sitio web oficial: [moondream.ai](https://moondream.ai/)
- Demo en línea: [moondream.ai/playground](https://moondream.ai/playground)
- GitHub del modelo: [vikhyat/moondream](https://github.com/vikhyat/moondream)
- Documentación de MLX-VLM: [Blaizzy/mlx-vlm](https://github.com/Blaizzy/mlx-vlm)
- Notas de lanzamiento de junio de 2025: [moondream.ai/blog/moondream-2025-06-21-release](https://moondream.ai/blog/moondream-2025-06-21-release)
