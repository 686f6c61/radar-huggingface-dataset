# ourscent/perfume-recognizer

## Resumen

ourscent/perfume-recognizer es un modelo de visión por computador especializado en el reconocimiento de frascos de perfume a partir de fotografías. Lo desarrolla OurScent, un servicio orientado al sector de la perfumería en Oriente Medio, y se distribuye exclusivamente como API alojada: los pesos no se publican. El modelo parte del backbone ViT-B-16-SigLIP de Google (vía timm) y se afina mediante aprendizaje métrico contrastivo sobre fotografías reales de frascos en condiciones cotidianas.

El problema que resuelve es concreto: dada una foto de un frasco, devolver los perfumes más probables de su catálogo, ordenados por similitud, con un identificador, nombre, casa y puntuación. El índice actual cubre 2.017 perfumes populares en Arabia Saudí, el Golfo y Egipto, sobre un registro interno de más de 60.000 referencias. No es un clasificador cerrado de etiquetas fijas, sino un sistema de recuperación por vecindad más cercana sobre un espacio de embeddings de 768 dimensiones.

Su relevancia es doble. Por un lado, demuestra un caso de uso vertical de la visión artificial en retail (identificación de producto en tienda, apps de catálogo, atención al cliente). Por otro, su modelo de distribución —solo API, con licencia propietaria y datos de entrenamiento internos— es un ejemplo de despliegue comercial cerrado sobre pesos abiertos de terceros. El bundle en producción es c-20261122 y declara una latencia de 68,6 ms en el percentil 95 (solo modelo, sin red).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B-16-SigLIP (backbone), con cabeza de embedding de 768 dimensiones y búsqueda por vecindad más cercana |
| Parametros totales | no disponible (ViT-Base, del orden de 86 M en el backbone; no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada 224 × 224 píxeles) |
| Tipos de cuantizacion | no disponible (runtime ONNX en CPU; el autor no publica detalles de cuantización) |
| Idiomas soportados | ar, en, fr (etiquetas de idioma declaradas; la salida es identificación visual, no texto generativo) |
| Licencia | ourscent-hosted-api (propietaria, solo API alojada; pesos no publicados) |
| Formato de pesos | no disponible (no se distribuyen pesos; inferencia vía ONNX en CPU en el servidor del autor) |

## Arquitectura y entrenamiento

El modelo es un ViT-B-16-SigLIP, es decir, un Vision Transformer de tamaño base con parches de 16 × 16, inicializado desde los pesos SigLIP publicados por Google y cargado a través de timm. Sobre ese backbone se aplica un afinamiento de aprendizaje métrico contrastivo con fotografías reales de frascos en entornos cotidianos, de modo que la salida es un embedding de 768 dimensiones en el que las imágenes del mismo perfume quedan próximas. El preprocesado es el estándar del backbone: relleno a cuadrado, redimensionado a 224 × 224 y normalización con media 0,5 y desviación típica 0,5.

La inferencia no es una clasificación softmax sobre clases fijas, sino una búsqueda de vecinos más cercanos contra un índice de referencia. La puntuación por perfume combina la mejor coincidencia individual con el centroide del perfume, lo que estabiliza el ranking cuando hay varias fotos de referencia por producto. El runtime es ONNX sobre CPU. El autor no detalla el volumen de tokens ni la composición exacta del dataset de entrenamiento: las fotos son una colección interna que no se publica, no se sirve ni se redistribuye. Tampoco se especifica si hubo etapas de RLHF o DPO (no aplicables en un modelo de recuperación visual de este tipo).

## Capacidades

- Identificación visual de frascos de perfume: devuelve los top-k candidatos (k de 1 a 10) con `perfume_id`, nombre, casa y puntuación de similitud.
- Recuperación por similitud sobre un índice de 2.017 perfumes, ampliable con cada bundle.
- Expansión de resultados: con `expand=perfume`, cada candidato incluye el registro completo del perfume.
- Salida trazable: cada respuesta de la API indica el bundle que la generó y `GET /v1/vision/models` lista las versiones.
- Soporte multilingüe en la documentación y la interfaz (árabe, inglés y francés), no en la tarea visual en sí.
- No lee texto ni códigos de barras (para códigos de barras existe `POST /v1/barcode/lookup`).
- No verifica autenticidad ni estima el nivel de llenado del frasco.
- No dispone de tool calling, agentes ni razonamiento multi-paso: es un endpoint de clasificación/recuperación de imagen.

## Casos de uso

- Identificación de producto en tienda: el personal fotografía un frasco y la app muestra los tres candidatos más probables, lo que acelera la consulta de stock y precios sin teclear referencias.
- Asistente de compra en comercio electrónico: el cliente sube una foto de un perfume que vio y la API devuelve el catálogo equivalente con enlace al producto, aprovechando el top-3 (93,2 % de acierto) para ofrecer alternativas.
- Enriquecimiento de catálogo: a partir de fotos de inventario se asignan automáticamente `perfume_id` y casa, reduciendo la introducción manual de datos en sistemas de gestión.
- Atención al cliente: un bot recibe la foto enviada por el usuario y responde con el nombre y la casa del perfume, o con las opciones más cercanas cuando la confianza es baja.
- Control de lineales y auditoría de expositor: procesar fotos de estanterías para detectar qué perfumes del catálogo aparecen, con la advertencia de que las estanterías abarrotadas reducen la precisión.
- Integración en apps móviles de perfumería: el endpoint HTTP permite incorporar el reconocimiento sin alojar el modelo, delegando el cómputo (ONNX en CPU, 68,6 ms p95) en el servicio del proveedor.
- Flujos de corrección de datos: usar `POST /v1/vision/feedback` con el `request_id` y el `perfume_id` correcto para mejorar el siguiente bundle, útil en operaciones con catálogo propio.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente) sobre el bundle c-20261122, evaluado en 9.047 fotos de frascos reales no vistas en entrenamiento ni validación, con 2.017 perfumes cubiertos:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 77,6 % |
| Top-3 accuracy | 93,2 % |
| Latencia p95 (solo modelo, sin red) | 68,6 ms |
| Perfumes cubiertos | 2.017 |
| Fotos de test | 9.047 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- No aplica al usuario final: los pesos no se distribuyen y la inferencia se ejecuta en la infraestructura del proveedor (ONNX en CPU).
- No es posible el despliegue local con vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos publicados.
- El acceso es exclusivamente vía API HTTP (`POST https://api.ourscent.online/v1/vision/identify`), con plan gratuito y claves de prueba.
- Latencia declarada de 68,6 ms en el percentil 95 (solo modelo); el tiempo total depende de la red y del cliente.
- Existe licencia on-premise, pero se negocia caso por caso en el plan Enterprise; no se detallan requisitos de hardware para ese supuesto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ourscent/perfume-recognizer | ViT-B-16-SigLIP afinado, recuperación | no disponible (ViT-Base) | imagen 224 × 224, índice de 2.017 perfumes | Top-1 77,6 %, Top-3 93,2 % | ourscent-hosted-api (propietaria) | Solo API alojada |
| google/siglip-base-patch16-224 | ViT-B-16-SigLIP base, visión-lenguaje | ~86 M (backbone) | imagen 224 × 224 + texto | no aplica a esta tarea sin afinamiento | Apache 2.0 (pesos abiertos) | Pesos en Hugging Face |
| timm/ViT-B-16-SigLIP | Backbone de referencia | ~86 M | imagen 224 × 224 | no disponible para esta tarea | según timm/SigLIP | Pesos en Hugging Face |

La comparación directa con clasificadores genéricos no es significativa: el modelo de OurScent está especializado en un catálogo cerrado y su rendimiento no es trasladable a otras categorías de producto. No se dispone de comparativas publicadas con otros reconocedores de perfumes.

## Limitaciones y advertencias

- Solo reconoce los 2.017 perfumes de su índice; ante un perfume desconocido devuelve los más cercanos que sí conoce, por lo que hay que presentar candidatos y no un veredicto.
- Los frascos casi idénticos (flankers y concentraciones que comparten envase) son los casos más difíciles: es más probable acertar la familia en el top-3 que el producto exacto en primera posición.
- La precisión cae con desenfoque, reflejos fuertes, la parte trasera del frasco, solo el tapón o estanterías abarrotadas; funciona mejor con una foto clara de un único frasco que ocupe buena parte del encuadre.
- No evalúa autenticidad, calidad ni contenido del perfume; no debe usarse como verificación antifalsificación.
- La cobertura está sesgada hacia perfumes populares en Arabia Saudí, el Golfo y Egipto.
- Licencia propietaria `ourscent-hosted-api`: no hay pesos, no se permite el despliegue local salvo acuerdo Enterprise, y el uso comercial está sujeto a los términos del servicio.
- Los datos de entrenamiento son internos y no auditables; los benchmarks son declarados por el autor y no verificados de forma independiente.
- Riesgo de alucinación en el sentido de falsos positivos: siempre devuelve candidatos, incluso para imágenes que no son perfumes.
- La latencia de 68,6 ms excluye el tiempo de red; en producción hay que añadir la latencia del endpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ourscent/perfume-recognizer
- Documentación y plan gratuito: https://intelligence.ourscent.online
- Licencia: https://intelligence.ourscent.online
- Endpoint de identificación: `POST https://api.ourscent.online/v1/vision/identify`
- Cobertura del índice: `GET /v1/vision/models/current/coverage`
- Versiones del modelo: `GET /v1/vision/models`
- Feedback y correcciones: `POST /v1/vision/feedback`
- Búsqueda por código de barras: `POST /v1/barcode/lookup`
- Backbone base: https://huggingface.co/timm/ViT-B-16-SigLIP
