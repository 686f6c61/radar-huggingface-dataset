# jan024/dlrv-ppointnet-exp6

## Resumen

dlrv-ppointnet-exp6 es un estimador de pose de objetos en 6 grados de libertad (6DoF) basado en PointNet++, desarrollado por el usuario jan024 en el marco de un proyecto de Deep Learning for Robot Vision de la Hochschule Bonn-Rhein-Sieg. El modelo recibe nubes de puntos RGB-D enmascaradas y predice la rotación y la traslación de cada objeto respecto a la cámara. Está entrenado sobre los quince objetos del conjunto LineMOD en formato BOP, con 1024 puntos de entrada y centroide como origen de coordenadas.

Se trata de la variante exp6, caracterizada por entrenarse con un objetivo ADD normalizado por el diámetro del objeto. La motivación es metodológica: como el umbral de acierto del benchmark ADD escala con el diámetro (0,1 × diámetro), una pérdida sobre distancia absoluta favorece a los objetos grandes. Al dividir la pérdida por el diámetro, la desviación estándar por clase en validación sintética baja de 30,4 a 6,3 puntos porcentuales y la clase más débil sube del 7,0 % al 45,2 %.

Con 0,86 M de parámetros, es un modelo muy ligero, orientado a robótica de manipulación más que a inferencia en servidores de gran escala. Su relevancia práctica es doble: por un lado, demuestra un efecto de normalización reutilizable en otras tareas de regresión geométrica; por otro, documenta explícitamente que esa ganancia en distribución no se traslada a imágenes reales, donde pierde 2,90 puntos frente al checkpoint exp5 del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (backbone `PointNetPlusPlus`, etapas SA1 a SA3) con cabeza `PoseEstimationHead` de 512 dimensiones y ramas separadas de rotación y traslación |
| Parametros totales | 0,86 M |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica; entrada fija de 1024 puntos (nube de puntos, no secuencia de texto) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye como estado de PyTorch y la model card no documenta cuantización |
| Idiomas soportados | No aplica: modelo no lingüístico (visión 3D / pose estimation) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint de PyTorch (`.pth`), diccionario con las claves `epoch`, `val_add`, `backbone` y `pose_head` |

## Arquitectura y entrenamiento

El backbone es una PointNet++ que procesa 1024 puntos expresados en metros y centrados en su centroide, con tres etapas de abstracción (SA1–SA3) que extraen una característica global de 512 dimensiones. Sobre esa característica actúa una cabeza de estimación de pose con dos ramas independientes: la rotación se regresa en la representación continua de 6D de Zhou et al. y la traslación se predice como residuo respecto al centroide de la nube observada. El conjunto completo suma 0,86 M de parámetros.

El entrenamiento se realizó únicamente sobre el split sintético PBR de LineMOD, sin adaptación de dominio, con estos hiperparámetros: 30 épocas, batch de 32, `lr = 0.001` y `backbone_lr = 0.0005`. La tasa de aprendizaje del backbone se mantiene idéntica a la de exp5 para que el único cambio entre ambos experimentos sea la función de pérdida (`normalized_add` frente a ADD sin normalizar). No se documenta uso de RLHF, DPO ni etapas de ajuste por preferencias, algo esperable en un modelo de regresión geométrica.

## Capacidades

- Estimación de pose 6DoF (rotación y traslación) de objetos rígidos a partir de nubes de puntos RGB-D enmascaradas.
- Rotación regresada en representación continua 6D, lo que evita discontinuidades de las representaciones tipo cuaternión o matriz en el espacio de salida.
- Traslación regresada como residuo respecto al centroide de la nube de puntos observada.
- Cobertura de los quince objetos de LineMOD en una única red con `n_classes=15`.
- Comportamiento por clase equilibrado en datos que siguen la distribución de entrenamiento (desviación estándar entre clases de 6,3 puntos porcentuales en validación sintética).
- Entrada de tamaño fijo: 1024 puntos por muestra.
- No incluye detección ni segmentación de objetos: requiere máscara de objeto ground-truth.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades multimodales adicionales (audio, vídeo, texto) ni modo de razonamiento explícito.

## Casos de uso

- Bin picking industrial: el modelo estima la pose 6DoF de piezas apiladas a partir del segmento de nube de puntos de cada una, de modo que un brazo robótico puede calcular la aproximación y el agarre sin CAD alineado previamente. Su tamaño (0,86 M de parámetros) permite ejecutarlo en el propio controlador o en una GPU embebida.
- Ensamblaje robótico con tolerancias ajustadas: la evaluación ADD(-S)@0.05d del 6,37 % en test real indica que para tolerancias muy finas el modelo no es suficiente por sí solo, pero puede usarse como inicialización de un refinamiento ICP o de un bucle de control visual.
- Investigación en funciones de pérdida geométricas: exp6 es un caso de estudio reproducible sobre cómo normalizar un objetivo de regresión por la escala del objeto; sirve para replicar el experimento en otros datasets (YCB-V, T-LESS) con la misma receta `normalized_add`.
- Docencia en visión robótica: con 0,86 M de parámetros y un script de evaluación que procesa 3000 imágenes en unos dos minutos en una RTX A5000, es viable como práctica de laboratorio con hardware modesto.
- Verificación de calidad en línea de producción: dado un segmento de objeto obtenido por una etapa de segmentación previa, comprobar que la pose estimada coincide con la pose nominal esperada permite detectar piezas mal colocadas o giradas.
- Realidad aumentada asistida por profundidad: superponer instrucciones o etiquetas sobre un objeto físico requiere su pose 6DoF; el modelo puede aportar esa pose a partir de un sensor RGB-D de corto alcance en los quince objetos de LineMOD.
- Logística y paletizado: estimar la orientación exacta de cajas o contenedores antes de la manipulación, siempre que se disponga de una máscara previa y de una nube de puntos densa suficiente para el objeto en cuestión.

## Benchmarks y rendimiento

Datos publicados en la model card. Evaluación sobre el test real de BOP (3000 imágenes) y sobre validación sintética. El modelo se entrenó solo con el split sintético PBR.

| Split | ADD(-S)@0.05d | ADD(-S)@0.1d | ADD(-S)@0.2d | Error medio | Error mediano |
|---|---|---|---|---|---|
| Validación sintética (exp6) | no disponible | 58,41 % | no disponible | no disponible | no disponible |
| Test real BOP, 3000 imágenes (exp6) | 6,37 % | 33,33 % | 57,33 % | 45,99 mm | 30,13 mm |

Comparación interna con el checkpoint exp5 del mismo autor, facilitada por la model card:

| Modelo | Objetivo de pérdida | ADD(-S)@0.1d sintético | ADD(-S)@0.1d real | Desv. est. entre clases (12 objetos asimétricos) | Peor clase |
|---|---|---|---|---|---|
| exp6 (este modelo) | ADD normalizado por diámetro | 58,41 % | 33,33 % | 6,3 pp | 45,2 % |
| exp5 | ADD absoluto | 57,36 % (derivado de la diferencia de 1,05 puntos indicada por el autor) | 36,23 % | 30,4 pp | 7,0 % |

Observación de rigor: la model card afirma que exp6 tiene un error absoluto medio de ADD de 69 mm frente a 34,6 mm del modelo sin normalizar, pero la tabla de resultados reales indica 45,99 mm de error medio. La model card no especifica a qué split o medida corresponde la cifra de 69 mm, por lo que la discrepancia queda sin resolver con la información disponible.

No se han encontrado resultados de benchmarks adicionales en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 0,86 M de parámetros en fp32, los pesos ocupan del orden de 3,5 MB, por lo que el cuello de botella es la nube de puntos y las activaciones, no el modelo. La model card no publica una cifra de VRAM; cualquier estimación por encima de 1 GB es holgada para lotes pequeños.
- GPU recomendadas: el autor reporta la evaluación completa de 3000 imágenes en aproximadamente dos minutos en una RTX A5000 (del orden de 40 ms por imagen, cifra derivada). Una RTX 4090, una RTX 3090 o cualquier GPU con varios GB de VRAM es más que suficiente; el modelo también es candidato razonable a ejecución en CPU o en GPU embebida (Jetson) dada su escala.
- Cabe en GPU de consumo: sí, con amplio margen, en cualquier GPU consumer moderna. El límite práctico lo pone el pipeline de segmentación previo, no la red.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y en sentido estricto no aplican porque no es un modelo de lenguaje. El despliegue previsto es PyTorch nativo, cargando el checkpoint con las definiciones `pointnet.model.PointNetPlusPlus` y `pose.head.PoseEstimationHead` del repositorio del proyecto, o exportando a TorchScript/ONNX (no documentado).
- Latencia y throughput estimados: aproximadamente 40 ms por imagen en RTX A5000, calculados a partir de las 3000 imágenes procesadas en unos dos minutos. No se publican cifras de latencia por muestra ni de throughput en entrenamiento.
- Dependencia de datos: se requiere LineMOD en formato BOP, distribuido aparte por el BOP Toolkit en https://bop.felk.cvut.cz/datasets/.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | ADD(-S)@0.1d real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dlrv-ppointnet-exp6 | PointNet++ + cabeza de pose | 0,86 M | 1024 puntos | 33,33 % | no disponible | HuggingFace (jan024) |
| dlrv-pointnet-exp5 | PointNet++ + cabeza de pose | no disponible (mismo backbone según la model card) | 1024 puntos | 36,23 % | no disponible | HuggingFace (jan024) |
| Otros metodos del benchmark BOP LineMOD (PoseCNN, PVN3D, CosyPose y similares) | CNN / punto-voxel / multi-vista | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables es contra exp5, del mismo autor y mismo backbone, lo que aísla el efecto de la función de pérdida. No se dispone de cifras comparables de otros estimadores 6DoF en la información proporcionada, por lo que no se incluyen valores estimados.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre el split sintético PBR de LineMOD, sin adaptación de dominio. Es un modelo con una brecha sim-to-real explícita: 58,41 % en validación sintética frente a 33,33 % en test real a 0,1d.
- La normalización por diámetro mejora la equidad entre clases en distribución pero pierde 2,90 puntos en datos reales. El propio autor recomienda exp5 (36,23 %) si el objetivo es rendimiento sobre imágenes reales.
- Requiere máscara de objeto ground-truth. No incorpora etapa de detección ni de segmentación, de modo que en un pipeline real hay que añadirla y su error se propaga a la pose.
- Cobertura limitada a los quince objetos de LineMOD. No hay evidencia de generalización a objetos no vistos ni a otras categorías.
- La evaluación subsamplea la nube de puntos y los vértices del CAD sin fijar semilla, por lo que las cifras por objeto varían unos pocos puntos entre ejecuciones. Los resultados no son estrictamente reproducibles dígito a dígito.
- Licencia no disponible: no se puede asumir uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Entrada de tamaño fijo (1024 puntos) y centrada en el centroide; objetos con nubes muy dispersas o con oclusiones severas quedan mal representados, ya que los objetos pequeños son precisamente los que tienen observaciones de profundidad más dispersas.
- A 0,05d el acierto en test real cae al 6,37 %, insuficiente para tareas que exijan precisión subcentimétrica sin refinamiento posterior.
- No se documentan cuantizaciones, formatos alternativos de pesos ni versiones optimizadas para inferencia.
- Riesgo de sesgo por clase: aunque exp6 reduce la dispersión entre clases de 30,4 a 6,3 puntos porcentuales, sigue existiendo variación por objeto y la model card no desglosa los resultados por clase.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jan024/dlrv-ppointnet-exp6
- Checkpoint alternativo exp5, recomendado por el autor para imágenes reales: https://huggingface.co/jan024/dlrv-pointnet-exp5
- Dataset LineMOD en formato BOP: https://bop.felk.cvut.cz/datasets/
- Articulo de la representacion continua de rotacion en 6D citada en la model card (Zhou et al., "On the Continuity of Rotation Representations in Neural Networks"): https://arxiv.org/abs/1812.07035
- Articulo original de PointNet++ (Qi et al., "PointNet++: Deep Hierarchical Feature Learning on Point Sets in a Metric Space"): https://arxiv.org/abs/1706.02413
- Repositorio del proyecto con las definiciones `pointnet.model.PointNetPlusPlus` y `pose.head.PoseEstimationHead`: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardaban relacion con el.
