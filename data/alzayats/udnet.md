# Alzayats/UDnet

## Resumen

UDnet es un modelo de mejora de imágenes submarinas (underwater image enhancement) publicado en HuggingFace por el autor Alzayats, que implementa los pesos preentrenados del trabajo *Adaptive deep learning framework for robust unsupervised underwater image enhancement* (Saleh, Sheaves, Jerry y Rahimi Azghadi, Expert Systems with Applications, vol. 268, 2025). Su tarea es de imagen a imagen: corrige dominantes de color y mejora el contraste de fotografías subacuáticas manteniendo la resolución de la imagen de entrada, una operación crítica porque el agua absorbe y dispersa la luz de forma selectiva por longitud de onda y degrada el color y la visibilidad de cualquier sensor sumergido.

El repositorio distribuye dos versiones. UDnet V1 es el modelo del artículo, completamente no supervisado (entrenado sin imágenes de referencia), con 1,4 millones de parámetros y un fichero de pesos de 5,6 MB que se ejecuta en CPU. UDnet V2 es una preview entrenada con pares de imágenes de los splits de entrenamiento de UIEB y LSUI, con 29 millones de parámetros y un fichero de 59 MB en float16, orientada a GPU y a una corrección más agresiva de color y neblina.

La relevancia del modelo es doble: por un lado, la versión no supervisada evita la dependencia de datasets emparejados, que en el dominio submarino son escasos y costosos de adquirir; por otro, el tamaño reducido de ambos checkpoints permite integrarlos en pipelines de preprocesado ligeros, incluso en hardware de borde, algo poco habitual en modelos de restauración de imagen. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card lo describe como un marco de aprendizaje profundo adaptativo para mejora de imagen; no detalla la topología de la red (capas, bloques ni conexiones) |
| Parametros totales | 1,4 M (UDnet V1) / 29 M (UDnet V2, preview) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de imagen; preserva la resolución de la imagen de entrada |
| Tipos de cuantizacion | No documentados. V1 se distribuye como `state_dict` de PyTorch (5,6 MB); V2 se distribuye en float16 (59 MB) |
| Idiomas soportados | No aplica: no procesa texto |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch). V1: `UDnet.pth`, `state_dict`. V2: `UDnet_v2.pth`, diccionario con claves `state_dict` y `config` |
| Tarea (pipeline) | `image-to-image` (mejora de imágenes submarinas) |
| Entrada / salida | Imagen RGB a imagen RGB mejorada, misma resolución que la entrada |
| Version no supervisada | Si (V1): entrenamiento sin imágenes de referencia |
| Dependencias opcionales | Real-ESRGAN para el modo `--ai` (realce y reescalado de detalle) |
| Libreria | PyTorch |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna más allá de describirla como un «marco de aprendizaje profundo adaptativo» para la mejora de imágenes. Lo que sí documenta es la estrategia de entrenamiento, que es el elemento diferencial del trabajo: UDnet V1 se entrena de forma completamente no supervisada, sin ningún par de imágenes de referencia ni imagen «ground truth», lo que elimina la necesidad de construir datasets emparejados de escenas submarinas, un recurso notoriamente difícil de obtener porque requiere capturar la misma escena con y sin agua de por medio o sintetizar la degradación de forma realista.

UDnet V2 cambia de régimen y se entrena con imágenes emparejadas de los splits de entrenamiento de los datasets UIEB y LSUI, lo que explica el salto de 1,4 M a 29 M parámetros y su mejor comportamiento declarado en corrección de color y eliminación de neblina. No se detalla en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta de los datos, ni si se aplicaron etapas de ajuste fino con preferencias humanas; tampoco se documentan innovaciones como atención lineal o decodificación especulativa, que no aplican a este dominio. El modo `--ai` del script de inferencia añade una pasada de Real-ESRGAN sobre la salida para reescalar y afinar detalle, sin que forme parte de los pesos de UDnet.

## Capacidades

- Corrección de dominantes de color en imágenes submarinas, típicamente sesgadas hacia el verde y el azul por la absorción selectiva de la luz en el agua.
- Mejora de contraste y reducción de la neblina (haze) provocada por la dispersión de partículas en suspensión.
- Procesamiento por lotes de directorios completos mediante el script `Inference.py`, con rutas de entrada y salida configurables.
- Preservación de la resolución original de la imagen: no reescala ni recorta por defecto.
- Inferencia en CPU con la versión V1, sin necesidad de GPU.
- Versión V2 con corrección de color y neblina reforzada, pensada para GPU.
- Modo opcional `--ai` con Real-ESRGAN para reescalado y nitidez (por ejemplo, `--ai x2`), orientado a visualización.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada de texto: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Preprocesado de datasets de visión submarina: aplicar UDnet V1 o V2 a un corpus de imágenes antes de entrenar o evaluar modelos de detección, segmentación o conteo de fauna, de modo que el modelo aguas abajo reciba imágenes con color y contraste normalizados en lugar de dominantes verde-azul variables.
- Monitorización de arrecifes con ROV o cámaras fijas: procesar los fotogramas capturados en campañas periódicas para que la comparación visual entre fechas no se vea confundida por cambios de turbidez o iluminación, manteniendo la geometría y la resolución originales.
- Fotografía submarina de divulgación: pipeline por lotes sobre el directorio de fotos de una inmersión, con el modo `--ai x2` para generar versiones reescaladas destinadas a publicación web o impresión.
- Acuicultura e inspección de infraestructura sumergida: mejora previa de imágenes de jaulas, redes o cascos para facilitar la revisión por parte de un operario o de un modelo de visión industrial entrenado con imágenes ya corregidas.
- Arqueología y patrimonio subacuático: realce de imágenes de pecios y estructuras para documentación y catalogación, donde el color preciso importa para distinguir materiales, con la advertencia de no usar el modo `--ai` para mediciones.
- Investigación en restauración de imagen: V1 sirve como baseline no supervisado reproducible (1,4 M parámetros, pesos de 5,6 MB) para comparar frente a métodos supervisados entrenados con UIEB o LSUI.
- Despliegue en hardware de borde: V1 puede ejecutarse en la CPU de un vehículo autónomo submarino o de una cámara con cómputo limitado, donde un modelo de decenas de millones de parámetros en GPU no sería viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (PSNR, SSIM, UIQM, UCIQE u otras habituales en el dominio) para ninguna de las dos versiones, ni comparaciones numéricas con métodos del estado del arte. Solo se indica cualitativamente que V2 ofrece «una corrección de color y neblina más fuerte» que V1, sin cifras que respalden la afirmación.

## Requisitos de hardware

- VRAM estimada: muy baja. V1 ocupa 5,6 MB de pesos y está pensado para ejecutarse en CPU; V2 ocupa 59 MB en float16, por lo que el peso de los parámetros cabe holgadamente en menos de 1 GB de memoria, incluso contemplando activaciones de imagen de alta resolución.
- GPU recomendadas: no se especifican modelos concretos. La model card solo indica que V2 funciona mejor en GPU y que V1 va bien en CPU. Cualquier GPU consumer con soporte CUDA (gama GTX/RTX o superior) debería ser suficiente para V2 dado el tamaño del checkpoint.
- Cabe en GPU consumer: sí, ambas versiones; V1 además funciona sin GPU.
- Opciones de despliegue: el repositorio oficial en GitHub proporciona un script de inferencia (`Inference.py`) con `requirements.txt`, y los pesos se descargan automáticamente desde HuggingFace en el primer uso. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de imagen.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por imagen ni de imágenes por segundo en la información proporcionada; a modo orientativo, el coste dominante en V1 será el propio tamaño de la imagen, no el número de parámetros.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos alternativos en la información proporcionada, por lo que la comparación se limita a las dos versiones del propio modelo.

| Modelo | Parametros | Entrenamiento | Resolucion de salida | Licencia | Estado |
|---|---|---|---|---|---|
| UDnet V1 | 1,4 M | No supervisado, sin imágenes de referencia | Igual que la entrada | MIT | Publicado (modelo del paper) |
| UDnet V2 | 29 M | Supervisado con pares de UIEB y LSUI (splits de entrenamiento) | Igual que la entrada | MIT | Preview, uso en investigación |
| Alternativas del dominio (FUnIE-GAN, UColor, Water-Net, Sea-thru, entre otras) | No disponible | No disponible | No disponible | No disponible | No evaluadas en esta ficha |

Cualquier comparación numérica frente a esos métodos requeriría consultar el paper asociado, cuyos resultados no se recogen en la información disponible.

## Limitaciones y advertencias

- Riesgo de invención de detalle: el modo `--ai` (Real-ESRGAN) puede generar textura fina que no existe en la escena original. La propia model card advierte que debe usarse para visualización, no para medición.
- Uso no fotométrico: la corrección de color es perceptual y orientada a la apariencia; no se documenta calibración radiométrica, por lo que no es adecuada para estimar reflectancias o concentraciones reales.
- V2 es una preview: la model card la marca explícitamente como versión de investigación, sin garantías de estabilidad de API, comportamiento ni mantenimiento.
- Rendimiento no cuantificado: no hay métricas publicadas en la información disponible, de modo que no es posible verificar la mejora frente a alternativas ni frente a versiones previas.
- Sesgos y dominios: no se documentan sesgos conocidos, pero el comportamiento depende de la distribución de escenas de entrenamiento (tipo de agua, profundidad, iluminación artificial o natural, sensor). No hay información sobre generalización a aguas muy turbias, nocturnas o con fuentes de luz artificial.
- Limitaciones de idioma y contexto: no aplican, al no ser un modelo de texto; la «ventana de contexto» se sustituye por la resolución de la imagen, y no se documentan límites máximos de tamaño de entrada ni comportamiento con imágenes muy grandes.
- Licencia: MIT permite uso comercial y modificación, pero conviene citar el artículo (doi 10.1016/j.eswa.2024.126314) y tener en cuenta que el componente opcional Real-ESRGAN se distribuye bajo su propia licencia (BSD-3-Clause en el repositorio original), independiente de la de UDnet.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción comunitaria ni de soporte; para producción convendría evaluar el código de inferencia y fijar versiones.
- Reproducibilidad: al descargar los pesos automáticamente desde HuggingFace en el primer uso, un despliegue en producción debería cachear o vendorizar los checkpoints para evitar dependencias de red no controladas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alzayats/UDnet
- Codigo de inferencia y repositorio: https://github.com/alzayats/UDnet
- Paper (Expert Systems with Applications, 2025): https://www.sciencedirect.com/science/article/pii/S0957417424031816
- DOI: https://doi.org/10.1016/j.eswa.2024.126314
- Galeria de resultados: https://alzayats.github.io/UDnet/
- Real-ESRGAN (componente opcional del modo `--ai`): https://github.com/xinntao/Real-ESRGAN
