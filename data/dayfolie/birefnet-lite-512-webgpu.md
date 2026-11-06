# dayfolie/birefnet-lite-512-webgpu

## Resumen

BiRefNet lite 512 WebGPU es una reexportación del modelo de segmentación dicotómica de imagen BiRefNet_lite (ZhengPeng7) optimizada para ejecutarse en navegador mediante onnxruntime-web con backend WebGPU o WASM. El autor, dayfolie, lo publica como componente del editor de carruseles Dayfolie, donde se utiliza para eliminar fondos de imágenes completamente en el cliente, sin enviar datos a un servidor. La relevancia actual del modelo reside en su formato: un grafo ONNX con pesos en fp16 y entrada/salida en float32, reescrito para evitar operadores que no funcionan en WebGPU.

El modelo original BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation, CAAI AIR 2024) es una arquitectura de segmentación de alta resolución que emplea referencias bilaterales para separar primer plano y fondo con bordes finos. Esta variante "lite" reduce el coste computacional y fija la resolución de entrada en 512×512, lo que la hace viable en hardware de consumo y en el navegador. La tarea es binaria: genera una máscara de probabilidad por píxel que indica la pertenencia al objeto principal.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento ni los resultados de benchmarks en la documentación proporcionada. El repositorio ocupa 0,1 GB y la licencia es MIT, lo que permite uso comercial sin restricciones adicionales más allá de la atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación de imagen basada en BiRefNet (referencia bilateral); grafo ONNX reexportado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 512×512) |
| Tipos de cuantizacion | Pesos en fp16; entrada y salida en float32 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BiRefNet, presentada en el artículo *Bilateral Reference for High-Resolution Dichotomous Image Segmentation* (CAAI AIR 2024). Se trata de un modelo de segmentación de imagen que combina señales de referencia de alto nivel (semántica global) y de bajo nivel (detalles de borde) para producir máscaras de alta calidad en tareas de separación primer plano/fondo. La variante lite reduce la carga computacional respecto al modelo completo, aunque no se especifican en la información disponible los detalles exactos de esa reducción (número de capas, canales o parámetros).

Esta reexportación concreta no ha sido reentrenada: parte de los pesos de ZhengPeng7/BiRefNet_lite y modifica únicamente el grafo. Los cambios documentados son: entrada fijada a 512×512, pesos convertidos a fp16 con entrada y salida en float32, división de operaciones Concat/Split grandes en otras más pequeñas y sustitución de ReduceSum por Add para garantizar compatibilidad con el backend WebGPU de onnxruntime-web 1.30. No se detalla la composición del dataset de entrenamiento original ni si hubo RLHF/DPO (no aplicable en segmentación).

## Capacidades

- Segmentación binaria de imagen: genera una máscara de logits [1,1,512,512] que separa el objeto principal del fondo.
- Eliminación de fondo con bordes finos, gracias al mecanismo de referencia bilateral del modelo original.
- Ejecución en navegador: compatible con onnxruntime-web 1.30 en backend WebGPU y WASM.
- Procesamiento local en el cliente, sin necesidad de enviar imágenes a un servidor.
- Entrada estandarizada con normalización ImageNet (media y desviación típica).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Eliminación de fondo en editores de imágenes web: el modelo se integra en el editor de carruseles Dayfolie para recortar el sujeto de una foto y componerlo sobre un fondo nuevo, ejecutándose íntegramente en el navegador del usuario.
- Herramientas de diseño gráfico en el cliente: permite a aplicaciones de edición tipo Canva o Figma generar máscaras de recorte sin backend, reduciendo costes de infraestructura y latencia de red.
- Procesamiento por lotes en aplicaciones de escritorio con Electron o Tauri: al ser ONNX, puede cargarse con onnxruntime nativo para eliminar fondos de catálogos de producto de forma local.
- Privacidad en el tratamiento de imágenes: fotografías personales o documentos no salen del dispositivo, lo que encaja en flujos con requisitos de RGPD o datos sensibles.
- Preprocesado para pipelines de visión: generar máscaras de primer plano antes de tareas de clasificación, detección o generación de imágenes (por ejemplo, para inpainting o composición).
- Aplicaciones móviles o de bajo consumo: la resolución fija de 512×512 y los pesos fp16 reducen el uso de memoria, lo que facilita su despliegue en dispositivos con recursos limitados mediante WASM.
- Creación de avatares y miniaturas: recorte automático de retratos para generar imágenes de perfil o tarjetas de presentación en aplicaciones web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB y los pesos están en fp16, por lo que la huella en memoria es reducida (del orden de cientos de MB incluyendo activaciones a 512×512).
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (Chrome/Edge en Windows, macOS con Metal) o GPU de escritorio con onnxruntime nativo (RTX 3060 en adelante, A100/H100 para lotes grandes).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU integrada o dedicada reciente con soporte WebGPU; también funciona por CPU mediante WASM.
- Opciones de despliegue: onnxruntime-web 1.30 (WebGPU o WASM), onnxruntime nativo (Python, C++, C#), y potencialmente conversión a otros runtimes ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| dayfolie/birefnet-lite-512-webgpu | no disponible | 512×512 fijo | MIT | Hugging Face, ONNX |
| ZhengPeng7/BiRefNet_lite | no disponible | resolución variable (modelo original) | MIT | Hugging Face, PyTorch |
| ZhengPeng7/BiRefNet | no disponible | resolución variable (modelo completo) | MIT | Hugging Face, PyTorch |
| RMBG-1.4 (BRIA AI) | no disponible | resolución variable | no comercial (uso restringido) | Hugging Face |

La comparativa se limita a datos de licencia y formato, ya que no se dispone de cifras de parámetros ni de rendimiento en la información proporcionada. La ventaja diferencial de esta variante frente a BiRefNet_lite original es la compatibilidad con WebGPU y el tamaño de entrada fijo, a costa de perder flexibilidad de resolución.

## Limitaciones y advertencias

- Resolución de entrada fija de 512×512: imágenes de mayor resolución deben redimensionarse, lo que puede degradar la precisión en detalles finos.
- Modelo de una sola tarea: no genera texto, no razona y no admite instrucciones; solo produce máscaras de segmentación.
- Sin datos publicados de benchmarks ni de parámetros: no es posible evaluar su calidad objetiva frente a alternativas sin pruebas propias.
- Posibles sesgos heredados del dataset de entrenamiento original de BiRefNet, no documentados en esta ficha.
- Riesgo de máscaras imprecisas en escenarios con múltiples objetos, fondos complejos o sujetos poco representados en el entrenamiento original.
- Aunque la licencia es MIT, se recomienda verificar la licencia del modelo base y del artículo original para cumplir con la atribución.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- La fecha de creación indicada (2026-11-05) es futura respecto a la información habitual; conviene confirmar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/dayfolie/birefnet-lite-512-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Artículo original (BiRefNet, CAAI AIR 2024): no disponible como URL en la información proporcionada
- Repositorio del autor original: no disponible en la información proporcionada
- onnxruntime-web: no disponible como URL en la información proporcionada
