# osama-bin/sar-oil-spill-classifier

## Resumen

El modelo `osama-bin/sar-oil-spill-classifier` es un clasificador de imágenes SAR (radar de apertura sintética) orientado a la detección de vertidos de petróleo y a la estimación de su grosor. Lo desarrolla el usuario de HuggingFace `osama-bin` y se distribuye con licencia MIT. Su entrada es una imagen Sentinel-1 (banda C) y su salida es una distribución de probabilidad sobre tres clases: `Thin_Sheen` (película fina), `Moderate` (grosor intermedio o emulsión) y `Thick_Emulsified` (petróleo espeso o emulsionado). Es, por tanto, un modelo de visión por computador, no un modelo de lenguaje: no procesa ni genera texto.

Técnicamente es un híbrido CNN + Swin Transformer. La rama convolucional emplea un backbone ResNet-18 que produce características de 512 dimensiones, mientras que la rama de atención usa un Swin-Tiny con patch 4, ventana 7 y entrada de 224x224, que aporta 768 dimensiones. Ambas representaciones se concatenan (1280 dimensiones) y pasan por una cabeza de fusión compuesta por una capa lineal, BatchNorm, ReLU y una salida de 512 dimensiones, seguida de una softmax de tres clases.

Su relevancia es de nicho pero clara: la vigilancia medioambiental marina necesita discriminar entre manchas finas y vertidos gruesos para priorizar la respuesta operativa, y los modelos públicos que combinan SAR con clasificación de grosor son escasos. Ahora bien, el repositorio tiene 0 descargas y 0 likes, no publica métricas de rendimiento ni detalles del conjunto de entrenamiento, y la búsqueda web asociada devolvió únicamente resultados no relacionados con el modelo. Debe tratarse, por tanto, como un artefacto experimental sin validación externa publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida CNN + Swin Transformer (ResNet-18 + Swin-Tiny) con fusión por concatenación |
| Parámetros totales | No disponible (la model card no declara el total; los backbones indicados son ResNet-18 y Swin-Tiny) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; la rama Swin-Tiny declara entrada de 224x224) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (no procesa texto); no disponible en la model card |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio ocupa 0,2 GB, sin formato declarado) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de dos ramas. La primera es un backbone ResNet-18 que extrae un vector de 512 dimensiones, adecuado para capturar texturas locales y patrones de retrodispersión típicos de la superficie marina. La segunda es un Swin-Tiny con patch de 4, ventana de 7 y resolución de 224x224, que genera un vector de 768 dimensiones y aporta atención jerárquica sobre regiones más amplias. Las dos representaciones se concatenan en un vector de 1280 dimensiones, que atraviesa una cabeza de fusión `Linear -> BatchNorm -> ReLU` hasta 512 dimensiones y termina en una softmax de tres clases. El pipeline declarado es una aplicación Gradio (`app.py`, SDK 6.26.0) que acepta una imagen Sentinel-1 y devuelve la clase predicha junto con las puntuaciones de confianza por clase.

No hay información publicada sobre el dataset de entrenamiento: se desconoce el número de imágenes, su procedencia, la resolución original, el balance entre las tres clases, si hubo aumentos de datos, si se aplicó algún tipo de ajuste fino supervisado o si el modelo se entrenó desde cero o con pesos preentrenados. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación, etc.). La única información verificable sobre el entrenamiento es la composición arquitectónica descrita en la model card.

## Capacidades

- Clasificación de imágenes SAR de Sentinel-1 en tres niveles de grosor de vertido: `Thin_Sheen`, `Moderate` y `Thick_Emulsified`.
- Detección de presencia de petróleo en la imagen, implícita en la salida de tres clases del clasificador.
- Devolución de puntuaciones de confianza por clase (softmax de tres dimensiones), lo que permite aplicar umbrales de decisión.
- Procesamiento de imágenes de radar de apertura sintética en banda C, con la polarización y el preprocesado que el autor haya definido en la aplicación (no documentado).
- Interfaz de demostración vía Gradio, con carga de imagen y botón de análisis.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un clasificador de imagen pura.
- No dispone de capacidades multilingües, de generación de texto, de código, de matemáticas, de audio ni de vídeo.

## Casos de uso

- Vigilancia medioambiental marina: dado un producto Sentinel-1 de una zona costera, el modelo permite etiquetar cada escena como mancha fina, grosor moderado o emulsión espesa, lo que ayuda a priorizar la inspección de las manchas con mayor impacto potencial.
- Triaje previo a la respuesta a derrames: en un centro de coordinación, las detecciones clasificadas como `Thick_Emulsified` con alta confianza podrían escalarse a equipos de respuesta, mientras que las `Thin_Sheen` podrían monitorizarse de forma pasiva.
- Investigación en teledetección: sirve como línea base reproducible (licencia MIT) para comparar arquitecturas híbridas CNN + Transformer frente a CNN puras o Vision Transformers puros en tareas de clasificación de vertidos.
- Procesamiento por lotes de archivos históricos: al ser un modelo pequeño y de licencia permisiva, puede ejecutarse sobre catálogos completos de imágenes Sentinel-1 para generar series temporales de grosor de vertido por región.
- Integración en sistemas de alerta temprana: la salida probabilística permite definir umbrales de confianza y encadenar el clasificador con reglas de negocio o con otros servicios de detección de buques.
- Educación y demostraciones: la aplicación Gradio incluida permite mostrar en un aula o taller cómo se comporta un modelo multimodal (visión) sobre datos radar reales, sin necesidad de infraestructura GPU dedicada.
- Anotación asistida: las predicciones con confianza alta pueden usarse para preetiquetar grandes volúmenes de escenas SAR antes de una revisión humana, reduciendo el coste de construir nuevos conjuntos de datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, matriz de confusión, AUC ni comparaciones con otros modelos, y la búsqueda web no aportó documentación técnica asociada.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Para una arquitectura de este tipo (ResNet-18 y Swin-Tiny a 224x224) la inferencia en FP32 requiere típicamente menos de 1 GB de memoria, pero es una estimación, no un dato confirmado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; no se requiere A100, H100 ni hardware de centro de datos.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama de entrada y media (por ejemplo, series GTX 1050/1650, RTX 3050, RTX 4060) y con casi total seguridad en cualquier GPU moderna con más de 4 GB.
- Ejecución en CPU: viable por el tamaño reducido del repositorio (0,2 GB), aunque la latencia no está documentada.
- Opciones de despliegue: la propia aplicación Gradio del repositorio (`app.py`); también podría exportarse a ONNX Runtime o servirse con TorchServe, aunque ninguna de estas opciones está documentada por el autor. No aplica llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación aportada. La búsqueda web realizada no arrojó resultados relacionados con clasificación de vertidos de petróleo en imágenes SAR: los resultados devueltos correspondían a páginas biográficas y cinematográficas sin relación alguna con el modelo.

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `osama-bin/sar-oil-spill-classifier` | No disponible | 224x224 (rama Swin) | No publicado | MIT | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No identificadas |

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no hay exactitud, F1 ni matriz de confusión, por lo que no es posible evaluar si el modelo supera a un clasificador trivial o a la clase mayoritaria.
- Dataset de entrenamiento no documentado: se desconoce el número de imágenes, su distribución geográfica, las condiciones de viento, la estación del año o el balance entre clases. Esto impide estimar su capacidad de generalización.
- Riesgo alto de falsos positivos: en radar de banda C existen numerosos fenómenos que imitan la firma de un vertido (zonas de viento bajo, slicks biogénicos, estelas de buques, lluvia), y el modelo no documenta ningún mecanismo de descarte de estos casos.
- Confianza no calibrada: no hay evidencia de calibración de las probabilidades de softmax, por lo que usar los valores de confianza como umbral operativo puede ser engañoso.
- Dependencia del sensor y del preprocesado: está entrenado explícitamente para Sentinel-1; su comportamiento con otros sensores SAR (Radarsat, TerraSAR-X, Gaofen-3), otras bandas o distintas polarizaciones no está documentado.
- Sensibilidad a la resolución y al recorte: la rama Swin fija 224x224, de modo que el resultado puede depender fuertemente de cómo se remuestree o recorte la escena original; el autor no describe este paso.
- Licencia MIT: permite uso comercial y modificación sin restricciones relevantes, pero al no haber validación publicada, cualquier despliegue en producción asume el riesgo de un modelo no auditado.
- Advertencia adicional: el identificador del autor (`osama-bin`) genera coincidencias irrelevantes en buscadores; conviene referenciar siempre el ID completo del repositorio para evitar confusiones.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día (12 de septiembre de 2026), lo que indica un artefacto recién publicado y sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osama-bin/sar-oil-spill-classifier
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo (papers, blogs, repositorios o demos). Los resultados devueltos correspondían a contenidos biográficos y cinematográficos sin relación con el clasificador de vertidos.
