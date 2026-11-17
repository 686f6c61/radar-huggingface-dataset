# qhddz/mobilenet_v2-rknn3-rk1828

## Resumen

El modelo `qhddz/mobilenet_v2-rknn3-rk1828` es una conversión del conocido clasificador de imágenes MobileNetV2 al formato RKNN, la herramienta de compilación e inferencia de Rockchip para sus aceleradores NPU integrados. Lo publica el usuario qhddz en Hugging Face y está pensado para ejecutarse sobre hardware Rockchip, en concreto la plataforma RK1828, empleando la versión 3 del formato RKNN. No se trata de un modelo de lenguaje, sino de una red convolucional de visión para clasificación de imágenes.

La relevancia de esta ficha es acotada: no hay información publicada sobre el proceso de conversión, el dataset de calibración de cuantización, la precisión resultante ni los benchmarks en el dispositivo. La model card se limita a declarar la licencia Apache 2.0. Por tanto, cualquier evaluación técnica debe hacerse con cautela y verificarse directamente sobre el artefacto descargado.

MobileNetV2 es una arquitectura de referencia ampliamente conocida (bloques residuales invertidos con conexiones lineales de cuello de botella), pero los detalles concretos de esta conversión a RKNN —cuantización, entrada esperada, operadores soportados— no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (red neuronal convolucional con bloques residuales invertidos), convertida a formato RKNN |
| Parametros totales | no disponible (MobileNetV2 estándar: aproximadamente 3,4 M, según la arquitectura de referencia; no confirmado para este artefacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (formato RKNN, presumiblemente cuantización para NPU Rockchip; nivel exacto no documentado) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (versión 3, destino RK1828) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV2, una CNN diseñada para clasificación de imágenes eficiente en dispositivos con recursos limitados. Se caracteriza por bloques residuales invertidos con expansión y proyección lineal, y por el uso de convoluciones separables en profundidad. El artefacto publicado es una conversión de dicha red al formato RKNN 3 para la NPU Rockchip RK1828.

No hay información en la model card sobre el dataset de entrenamiento original, el dataset de calibración usado en la conversión, el número de imágenes de calibración, ni si se aplicó cuantización post-entrenamiento o quantización consciente del entrenamiento. Tampoco se documenta la precisión (top-1/top-5) alcanzada tras la conversión ni las diferencias respecto al modelo original en float32.

## Capacidades

- Clasificación de imágenes (tarea propia de MobileNetV2).
- Extracción de características visuales si se usa como backbone (no confirmado para este artefacto).
- Inferencia en NPU Rockchip RK1828 mediante el runtime RKNN.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Clasificación de imágenes en dispositivos embebidos con NPU Rockchip RK1828: el modelo puede desplegarse en placas con esta plataforma para tareas de etiquetado de imágenes en tiempo real, aprovechando la aceleración por hardware del formato RKNN.
- Preprocesado visual en pipelines de borde: usar el clasificador para filtrar o etiquetar fotogramas antes de enviarlos a un modelo mayor en la nube, reduciendo ancho de banda.
- Prototipado de aplicaciones de visión en hardware Rockchip: sirve como referencia para validar el flujo de conversión y despliegue RKNN en la plataforma RK1828.
- Detección de contenido en cámaras de seguridad: clasificación de escenas o categorías visuales básicas en el propio dispositivo.
- Extracción de embeddings visuales para búsqueda o agrupamiento, si el artefacto expone la salida de la penúltima capa (no confirmado).
- Docencia y experimentación con cuantización y despliegue en NPU: útil para comparar precisión float32 frente a la versión RKNN en la misma plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión top-1/top-5, latencia ni throughput en la NPU RK1828.

## Requisitos de hardware

- Hardware objetivo: NPU Rockchip RK1828 con runtime RKNN versión 3.
- VRAM estimada: no aplica; el modelo se ejecuta en la NPU del SoC, no en GPU dedicada.
- GPU recomendadas: no aplica para el artefacto RKNN; para la versión original en float32 podría ejecutarse en cualquier GPU, pero no está documentado.
- Compatibilidad con GPU de consumo: no aplica al formato RKNN.
- Opciones de despliegue: runtime RKNN de Rockchip (rknn-toolkit2 / rknn-runtime según corresponda a la plataforma RK1828); no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| qhddz/mobilenet_v2-rknn3-rk1828 | MobileNetV2 convertida a RKNN | no disponible | no aplica | Apache 2.0 | RKNN |
| MobileNetV2 original (TensorFlow/PyTorch) | CNN | ~3,4 M (referencia) | no aplica | Apache 2.0 | SavedModel / PyTorch |
| MobileNetV3 | CNN con bloques SE y NAS | ~2,9–5,4 M según variante | no aplica | Apache 2.0 | TensorFlow / PyTorch |
| EfficientNet-B0 | CNN con compound scaling | ~5,3 M | no aplica | Apache 2.0 | TensorFlow / PyTorch |

La comparación se limita a la arquitectura de referencia; no hay datos de precisión ni latencia de este artefacto RKNN que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta el proceso de conversión, el dataset de calibración ni la precisión resultante; no es posible evaluar la degradación por cuantización sin pruebas propias.
- Al ser un artefacto RKNN, está atado a la plataforma RK1828 y a la versión 3 del formato; no es portable a otras NPU ni a GPU sin reconversión.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni generación de texto.
- Riesgo de sesgos y alucinaciones visuales: hereda los sesgos del dataset de entrenamiento original de MobileNetV2 (ImageNet), no documentados aquí.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos originales de MobileNetV2 y del runtime RKNN de Rockchip.
- Sin información sobre idiomas, etiquetas de clase ni resolución de entrada esperada; es necesario inspeccionar el artefacto antes de usarlo en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/qhddz/mobilenet_v2-rknn3-rk1828
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
