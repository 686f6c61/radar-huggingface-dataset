# JONNYVERSE/ai-image-detect-distilled-ONNX

## Resumen

El modelo `JONNYVERSE/ai-image-detect-distilled-ONNX` es una conversión a formato ONNX del modelo `jacoballessio/ai-image-detect-distilled`, un clasificador de imágenes basado en Vision Transformer (ViT) diseñado para distinguir entre imágenes reales e imágenes generadas por inteligencia artificial. Fue desarrollado por JONNYVERSE a partir del trabajo original de Jacob Allessio, y su principal objetivo es ofrecer una detección eficiente y ligera de contenido sintético, con especial atención a imágenes generadas por Midjourney, Stable Diffusion y sus variantes.

El modelo original se entrenó mediante un proceso de destilación: tres modelos especializados (uno para Midjourney, otro para Stable Diffusion y un tercero para fine-tunings de Stable Diffusion) se combinaron en un único ViT de 11,8 millones de parámetros. Esta versión ONNX, con un tamaño de repositorio de 0,1 GB, está optimizada para su uso con Transformers.js, lo que permite ejecutar la inferencia directamente en el navegador o en entornos JavaScript, además de en cualquier runtime compatible con ONNX. Su licencia MIT facilita su integración en proyectos comerciales y de investigación.

La relevancia actual de este modelo radica en la creciente necesidad de herramientas de verificación de autenticidad de imágenes en un contexto donde la generación sintética se ha vuelto accesible y masiva. Su pequeño tamaño y su formato portable lo convierten en una opción práctica para aplicaciones de moderación, análisis forense digital y control de calidad en plataformas que manejan contenido visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) destilado |
| Parametros totales | 11,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible (se observa un archivo `model_q4.onnx` en el repositorio, pero no se especifica oficialmente) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (tambien disponible en formato original PyTorch en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en un Vision Transformer (ViT) de pequeñas dimensiones, con 11,8 millones de parámetros. La arquitectura sigue el esquema estándar de ViT: división de la imagen en parches, proyección lineal, codificación posicional y una pila de bloques de atención. Al ser un modelo destilado, hereda las características de tres modelos docentes especializados, cada uno entrenado para detectar imágenes generadas por una técnica concreta: Midjourney, Stable Diffusion y fine-tunings de Stable Diffusion.

El proceso de entrenamiento fue cuidadosamente diseñado para minimizar las diferencias de contenido entre imágenes reales y sintéticas. Se utilizó el dataset Open Images de Google para obtener imágenes reales, que luego se describieron con BLIP (Bootstrapping Language-Image Pre-training). Estas descripciones sirvieron para generar imágenes sintéticas con Stable Diffusion y para buscar imágenes similares de Midjourney. De esta forma, los pares de entrenamiento diferían únicamente en su origen, no en su contenido semántico. Los tres modelos se destilaron posteriormente en un único ViT, combinando sus características aprendidas para lograr una detección más general.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El entrenamiento se centró en la clasificación binaria supervisada. La versión ONNX fue convertida automáticamente mediante el espacio de Hugging Face `onnx-community/convert-to-onnx`, lo que garantiza compatibilidad con el ecosistema ONNX Runtime y Transformers.js.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre imagenes reales e imagenes generadas por IA (Midjourney, Stable Diffusion y fine-tunings).
- Deteccion de imagenes sinteticas con un accuracy del 74% en el conjunto de validacion y del 72% en un conjunto de imagenes reales obtenidas de internet.
- Inferencia eficiente gracias a su tamano reducido (11,8 M de parametros) y al formato ONNX, que permite ejecucion en CPU, GPU y navegadores via WebAssembly.
- Compatible con Transformers.js, lo que habilita su uso en aplicaciones JavaScript sin necesidad de servidor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas, ya que es un modelo exclusivamente de vision.

## Casos de uso

- Moderacion de contenido en plataformas sociales: el modelo puede integrarse en pipelines de revision para marcar imagenes sospechosas de ser generadas por IA, ayudando a los moderadores a priorizar la revision manual. Su tamano reducido permite ejecutarlo en servidores de bajo coste o incluso en el cliente.
- Verificacion de autenticidad en periodismo y fact-checking: los medios pueden usar el modelo como primera linea de filtrado para detectar imagenes sinteticas en noticias o redes sociales, reduciendo el riesgo de difundir desinformacion visual.
- Control de calidad en bancos de imagenes: plataformas como stock photo o marketplaces de diseno pueden emplear el modelo para detectar y etiquetar imagenes generadas por IA, garantizando transparencia para los compradores.
- Analisis forense digital: investigadores y peritos pueden utilizar el modelo como herramienta de apoyo en la autenticacion de evidencias visuales, complementando otros metodos de analisis.
- Aplicaciones de seguridad y antifraude: en entornos donde se requiere verificar la identidad o la autenticidad de documentos con fotos, el modelo puede ayudar a detectar imagenes de perfil o documentos falsificados generados por IA.
- Educacion y sensibilizacion: el modelo puede integrarse en herramientas educativas que ensenen a los usuarios a identificar imagenes sinteticas, mostrando ejemplos clasificados y explicando las senales que el modelo detecta.

## Benchmarks y rendimiento

Segun la model card del autor, los resultados declarados son los siguientes:

| Conjunto de evaluacion | Accuracy |
|---|---|
| Conjunto de validacion (held-out) | 74% |
| Conjunto real (imagenes propias y de internet) | 72% |

Ademas, el autor indica que el modelo supera a otros modelos populares de deteccion de IA por 5 puntos porcentuales en ambos conjuntos, aunque no se especifican los nombres de esos modelos ni sus resultados exactos. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 11,8 M de parametros, la inferencia en GPU requiere menos de 1 GB de VRAM incluso en precision FP32. En cuantizacion Q4 (si se utiliza el archivo `model_q4.onnx`), el consumo es aun menor.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o ROCm, incluyendo NVIDIA GTX 10xx o superior, AMD RX 6000 o superior. Tambien funciona en iGPUs.
- CPU: puede ejecutarse en CPU sin problemas, con latencias de pocos milisegundos por imagen en procesadores modernos.
- Navegador: gracias a Transformers.js y ONNX Runtime Web, puede ejecutarse en el navegador mediante WebAssembly, sin necesidad de GPU.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), Transformers.js (navegador/Node.js), llama.cpp no aplica (no es modelo de lenguaje), TGI no aplica. Tambien puede usarse con Python via `onnxruntime` o `transformers` con el modelo base.
- Latencia y throughput: no se proporcionan datos oficiales, pero dado el tamano del modelo, se espera un throughput alto (cientos de imagenes por segundo en GPU moderna).

## Comparativa con modelos similares

No se dispone de informacion detallada sobre modelos comparables en la documentacion proporcionada. El autor menciona que supera a otros modelos populares de deteccion de IA por 5 puntos porcentuales, pero no se dan nombres ni metricas concretas. Por tanto, no es posible realizar una comparativa cuantitativa fiable. Se recomienda consultar el modelo base `jacoballessio/ai-image-detect-distilled` para posibles referencias adicionales.

## Limitaciones y advertencias

- Accuracy moderada: con un 74% en validacion y 72% en imagenes reales, el modelo no es infalible y puede producir falsos positivos y falsos negativos. No debe utilizarse como unica fuente de verdad en contextos criticos.
- Caida de rendimiento en imagenes de internet: la diferencia de 10 puntos entre el conjunto de validacion y el conjunto real indica que el modelo generaliza peor a imagenes no controladas, lo que limita su eficacia en entornos reales.
- Sesgos potenciales: el entrenamiento se baso en datasets especificos (Open Images, Midjourney, Stable Diffusion), por lo que el modelo puede tener sesgos hacia ciertos estilos, resoluciones o contenidos. No se ha evaluado su comportamiento en imagenes de otras fuentes o con tecnicas de generacion mas recientes.
- Limitacion temporal: el modelo fue entrenado con tecnicas de generacion disponibles en su momento; nuevas herramientas de IA (como modelos de difusion mas avanzados o generadores de video) pueden no ser detectadas correctamente.
- Sin soporte para otros tipos de contenido: el modelo solo clasifica imagenes; no detecta audio, video ni texto generado por IA.
- Licencia MIT: aunque permite uso comercial, el usuario es responsable de cumplir con las leyes de proteccion de datos y derechos de autor al aplicar el modelo en sus productos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/JONNYVERSE/ai-image-detect-distilled-ONNX
- Modelo base (PyTorch): https://huggingface.co/jacoballessio/ai-image-detect-distilled
- Version ONNX de la comunidad: https://huggingface.co/onnx-community/ai-image-detect-distilled-ONNX
- Pagina en ModelScope: https://www.modelscope.cn/models/onnx-community/ai-image-detect-distilled-ONNX
- Documentacion de Transformers.js para image-classification: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageClassificationPipeline
- Dataset Open Images: https://storage.googleapis.com/openimages/web/index.html
- Dataset Midjourney (Kaggle): https://www.kaggle.com/datasets/ivansivkovenin/midjourney-prompts-image-part8
- Dataset de prompts de Stable Diffusion (Kaggle): https://www.kaggle.com/datasets/tanreinama/900k-diffusion-prompts-dataset
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
