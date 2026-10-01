# masahiroid/yolos-small-coreml

## Resumen

`masahiroid/yolos-small-coreml` es una conversión no oficial a Core ML del modelo de detección de objetos `hustvl/yolos-small`. El modelo original, desarrollado por el grupo VLRLab de la Universidad Huazhong de Ciencia y Tecnología (HUST) junto con HuggingFace, implementa la arquitectura YOLOS ("You Only Look at One Sequence"), un detector que reutiliza un backbone ViT-Small de tipo transformer puro en lugar de las CNN habituales en la familia YOLO. Esta conversión la mantiene el usuario `masahiroid` y su objetivo es permitir la inferencia local en dispositivos Apple (iPhone, iPad y Mac) mediante el framework Core ML.

El modelo resuelve detección de objetos genérica sobre las 91 categorías de COCO más la clase "sin objeto", con un total de 92 salidas por consulta y 100 consultas por imagen. El backbone ViT-Small tiene 30,7 millones de parámetros y el paquete convertido se distribuye en precisión float16, con un tamaño de repositorio de aproximadamente 0,1 GB. La entrada es fija de 512x864 píxeles (altura x anchura) en formato NCHW, lo que simplifica su integración en pipelines de visión por computador en Apple Silicon.

Su relevancia actual es doble: por un lado, ofrece una alternativa de detección de objetos ejecutable íntegramente en el dispositivo sin depender de servicios en la nube ni de frameworks de terceros pesados; por otro, documenta un detalle técnico poco habitual sobre la interpolación de los embeddings posicionales en la conversión de YOLOS a Core ML. La licencia es Apache 2.0, tanto en el modelo original como en la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT (YOLOS): backbone ViT-Small con parches de 16x16, codificador de 12 capas, cabezas de clasificación y regresión de cajas sobre 100 consultas (object queries), predicción por conjuntos sin NMS |
| Parametros totales | 30,7 M (según la model card de la conversión) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada fija de 512x864 px, 1728 parches de 16x16 más token de clase |
| Tipos de cuantizacion | float16 (única precisión publicada en el repositorio); el modelo base está disponible en float32 en PyTorch |
| Idiomas soportados | en (etiquetas de clases en inglés; el modelo no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (programa `mlprogram`, `minimum_deployment_target=macOS14`); modelo base original en PyTorch/safetensors |

Datos adicionales de la conversión: 92 logits por consulta (91 clases COCO + "sin objeto"), 100 cajas por imagen en formato normalizado `(center_x, center_y, width, height)`, normalización de entrada con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. Fecha de publicación en HuggingFace: 1 de octubre de 2026 (según los metadatos del repositorio).

## Arquitectura y entrenamiento

YOLOS traslada el esquema de detección de DETR a una arquitectura puramente transformer. El modelo trata la imagen como una secuencia de parches (16x16 píxeles) más un token de clase, y añade un conjunto fijo de 100 consultas de objeto que se procesan en paralelo con el codificador ViT-Small. Cada consulta produce directamente una etiqueta y una caja, con emparejamiento bipartito durante el entrenamiento, lo que elimina la necesidad de supresión de no máximos (NMS) y de anchors. Sobre la entrada fija de 512x864 píxeles, el número de parches es 32 x 54 = 1728.

La conversión a Core ML no ha requerido reentrenamiento: se ha realizado mediante `coremltools` a partir de los pesos de `hustvl/yolos-small`. El punto técnico destacable documentado por el autor es el tratamiento de las capas `InterpolateInitialPositionEmbeddings` e `InterpolateMidPositionEmbeddings`. En el trazado original estas capas fuerzan siempre una interpolación bicúbica, pero a la resolución de entrenamiento del modelo (512x864 fija) esa interpolación es matemáticamente una identidad, con un error máximo de 0,0 entre la entrada y la salida de la interpolación. Por ese motivo ambas interpolaciones se eliminan antes de la conversión, evitando artefactos de trazado sin alterar el resultado numérico.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o imágenes vistas, ni sobre fases de ajuste con RLHF o DPO: la model card de esta conversión no los detalla y solo referencia el modelo base. Tampoco se documenta ninguna innovación adicional más allá del propio diseño YOLOS y del recorte de interpolaciones descrito.

## Capacidades

- Detección de objetos en imágenes RGB con 91 categorías de COCO más la clase "sin objeto" (92 logits por consulta).
- Predicción de hasta 100 cajas por imagen en un único paso hacia delante, sin NMS ni postprocesado de supresión.
- Salida directa de logits y cajas normalizadas, apta para umbralizar por confianza e integrar en aplicaciones propias.
- Inferencia en dispositivo en iPhone, iPad y Mac mediante Core ML, con posible ejecución sobre CPU, GPU o Neural Engine de Apple Silicon.
- Ejecución en Python vía `coremltools` y en Swift/Objective-C vía la API nativa de Core ML.
- Sin soporte de tool calling, function calling ni comportamiento de agente: es un modelo puramente perceptivo de visión.
- Sin capacidades multilingües ni de generación de texto; las etiquetas de clase son las de COCO en inglés.
- Sin modo "thinking", visión aumentada, audio ni otras modalidades: únicamente detección de objetos 2D.

## Casos de uso

- Etiquetado y organización automática de la fototeca en iOS y macOS: el modelo detecta objetos en cada imagen localmente y permite agrupar o buscar fotos por contenido sin enviar datos a ningún servidor, algo crítico para la privacidad del usuario.
- Análisis de escenas en tiempo real desde la cámara: con entrada fija de 512x864 se puede alimentar cada fotograma redimensionado y dibujar las cajas sobre la vista previa, útil en apps de accesibilidad que describan objetos a usuarios con discapacidad visual.
- Control de calidad industrial offline: inspección de piezas o productos en líneas sin conectividad, ejecutando el modelo en un Mac mini o iPad industrial y aplicando umbrales propios sobre la confianza de las 100 consultas.
- Análisis de estanterías y retail: detección de productos o huecos en fotografías tomadas por personal de tienda, con inferencia local para evitar subir imágenes comerciales a la nube.
- Preprocesado para pipelines de visión más complejos: uso del detector como primera etapa (regiones de interés) antes de un clasificador u OCR, aprovechando que las cajas se obtienen con un solo paso hacia delante.
- Apps de campo sin cobertura: ornitología, botánica o seguimiento de fauna donde el dispositivo debe funcionar sin red, con un modelo de 0,1 GB que cabe sobradamente en el almacenamiento de un iPhone.
- Educación y demostraciones: al ser una conversión pequeña y de código abierto con licencia Apache 2.0, sirve como ejemplo reproducible de cómo portar un transformer de visión a Core ML, incluida la resolución del problema de la interpolación posicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (COCO mAP, MMLU, HumanEval u otros) en la información disponible. La model card únicamente incluye una validación de fidelidad numérica frente a la referencia PyTorch en float32, medida sobre una sola imagen de validación de COCO y las 5 detecciones efectivamente producidas:

| Metrica (frente a PyTorch fp32) | Resultado |
|---|---|
| Similitud coseno de logits | 0,99975 |
| Coincidencia de etiquetas | 100 % |
| Error absoluto maximo de cajas (normalizado 0-1) | 0,0039 |

Estos datos miden únicamente la fidelidad de la conversión a Core ML, no la calidad del detector. No hay métricas de precisión (AP, mAP) publicadas en la información disponible para esta conversión ni cifras de latencia o throughput.

## Requisitos de hardware

- Peso de los parametros: 30,7 M de parámetros, aproximadamente 61 MB en float16 (tamaño total del repositorio 0,1 GB, incluyendo el paquete Core ML).
- Memoria en inferencia: el modelo es muy ligero; las activaciones de la entrada 512x864 con 1728 parches son el componente dominante, pero el conjunto cabe holgadamente en cualquier dispositivo Apple reciente (por debajo de 500 MB de uso típico, estimación orientativa).
- Cabe en hardware de consumo: sí. Está diseñado específicamente para iPhone, iPad y Mac con Apple Silicon; se ejecuta también en Mac con CPU o GPU integradas compatibles con Core ML y target macOS 14.
- GPU de servidor (A100, H100, RTX 4090): no aplica. El artefacto es un `.mlpackage` de Core ML y no se distribuye en formatos ejecutables con CUDA o ROCm; para servidor habría que usar el modelo base `hustvl/yolos-small` en PyTorch.
- Opciones de despliegue: Core ML nativo en Apple (Swift/Objective-C), `coremltools` en Python para prototipado, y Xcode para integración en apps. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del dispositivo, del cómputo elegido (CPU, GPU o Neural Engine) y del uso de float16.
- Restricción relevante: la entrada es fija (512x864, NCHW), por lo que todo pipeline de despliegue debe redimensionar o aplicar letterboxing antes de la inferencia, sin posibilidad de tamaños dinámicos en la versión publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `masahiroid/yolos-small-coreml` | 30,7 M | 512x864 fija, 100 consultas, 92 clases | Core ML `.mlpackage` fp16 | Apache 2.0 | HuggingFace (conversión comunitaria) |
| `hustvl/yolos-small` | 30,7 M | Entrada configurable en PyTorch; 100 consultas, COCO | PyTorch / safetensors | Apache 2.0 | HuggingFace (oficial) |
| `facebook/detr-resnet-50` | no disponible en la informacion proporcionada | Entrada configurable; 100 consultas, COCO | PyTorch / safetensors | Apache 2.0 | HuggingFace (oficial) |
| Detectors de la familia YOLO (por ejemplo Ultralytics YOLO11) | no disponible en la informacion proporcionada | Entrada configurable; requiere NMS | PyTorch, ONNX, Core ML (export) | AGPL-3.0 en las versiones recientes de Ultralytics | Repositorio propio y HuggingFace |

Diferencias clave: frente al modelo base en PyTorch, esta conversión gana despliegue nativo en Apple y pierde flexibilidad de resolución y de ecosistema. Frente a DETR, comparte el paradigma de predicción por conjuntos sin NMS, pero con un backbone ViT mucho más pequeño. Frente a la familia YOLO clásica, YOLOS evita el NMS, aunque suelen ser más rápidas las implementaciones CNN optimizadas para móvil. No hay datos de precisión publicados en la información disponible que permitan comparar mAP entre estas alternativas.

## Limitaciones y advertencias

- Cobertura de clases cerrada: únicamente las 91 categorías de COCO. No detecta clases personalizadas ni objetos fuera de ese vocabulario sin reentrenamiento del modelo base.
- Límite de 100 objetos por imagen: si hay más instancias, las consultas restantes se descartan; no hay mecanismo de ampliación en esta conversión.
- Resolución fija de 512x864: cualquier imagen debe redimensionarse a esa proporción. La altura de 512 píxeles y los parches de 16x16 limitan la detección de objetos muy pequeños en escenas densas.
- Conversión no oficial: no está publicada por los autores de YOLOS ni por HuggingFace. La validación de fidelidad se hizo sobre una sola imagen de COCO y 5 detecciones, por lo que no constituye una garantía estadística de comportamiento equivalente al modelo original.
- Riesgo de falsos positivos y de alucinación de objetos: como todo detector, puede producir cajas con confianza alta sobre regiones sin objeto real; conviene calibrar el umbral por aplicación y aplicar filtrado posterior.
- Sin NMS: al ser predicción por conjuntos, las cajas duplicadas son poco frecuentes, pero pueden aparecer con umbrales de confianza bajos; el postprocesado de emparejamiento queda en manos de la aplicación.
- Datos de entrenamiento y sesgos no documentados en la información disponible: se heredan los sesgos de COCO, con posible infrarrepresentación de determinadas categorías, contextos geográficos y condiciones de iluminación.
- Idioma: las etiquetas y la documentación están en inglés (y parcialmente en japonés en la model card); no hay soporte de texto ni de otras lenguas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero exige conservar avisos de copyright y licencia. Al ser una conversión comunitaria, conviene verificar también las condiciones del modelo base `hustvl/yolos-small`, que comparte licencia Apache 2.0.
- Compatibilidad limitada a Apple: requiere Core ML con `minimum_deployment_target=macOS14`; no se puede ejecutar en Linux, Windows, Android ni en GPUs NVIDIA o AMD sin recurrir al modelo PyTorch original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de fallos en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/yolos-small-coreml
- Modelo base original: https://huggingface.co/hustvl/yolos-small
- Documentacion de Core ML (Apple): https://developer.apple.com/documentation/coreml
- Herramienta de auditoria de seguridad citada por el autor: https://github.com/masahirocom/model-audit-lite
- Paper original de YOLOS, "You Only Look at One Sequence": https://arxiv.org/abs/2106.00666
- Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y no se han utilizado como fuente.
