# shadow-cann/hispark-modelzoo-xfeat

## Resumen

XFeat es un modelo de visión por computador para detección y emparejamiento de puntos de interés (features locales). Forma parte del modelzoo de HiSpark para plataformas HiSilicon y se distribuye en este repositorio espejo como `shadow-cann/hispark-modelzoo-xfeat`. El modelo genera tres salidas: descriptores locales, un mapa de clasificación de keypoints y un mapa de calor de fiabilidad, lo que permite emparejar puntos entre dos imágenes y estimar la homografía resultante. La evaluación prevista se apoya en el conjunto de datos HPatches para tareas de estimación de homografía.

Se trata de un modelo muy ligero: 0,66 millones de parámetros y 2,66 GFLOPs para una entrada de 640 x 480 píxeles. Esa huella reducida lo hace apto para inferencia en el borde (edge computing), en concreto sobre el SoC Hi3516CV610 con NPU, plataforma habitual en cámaras IP y dispositivos de visión embebidos que ejecutan OpenHarmony o Linux. El repositorio incluye tanto el modelo fuente en ONNX (`xfeat_sim.onnx`) como el modelo compilado para NPU en formato `.om` con cuantización A8W8.

Su relevancia actual radica en que cubre una necesidad concreta: emparejamiento de features en tiempo real sobre hardware de muy bajo consumo, sin depender de GPU. Frente a detectores clásicos como ORB o SIFT, un modelo aprendido ofrece mayor robustez en cambios de iluminación, escala y punto de vista, a un coste computacional comparable. El repositorio no declara licencia propia ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional ligera de deteccion y descripcion de features locales, con cabezas para descriptores, mapa de clasificacion de keypoints y mapa de fiabilidad (detalle de capas no disponible) |
| Parametros totales | 0,66 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 640 x 480 pixeles) |
| Tipos de cuantizacion | A8W8 (pesos y activaciones a 8 bits) en el modelo compilado `.om`; ONNX en la precision del modelo fuente (no especificada) |
| Idiomas soportados | no aplica (vision por computador); documentacion en chino (zh) |
| Licencia | no disponible (se referencia la licencia del repositorio upstream `verlab/accelerated_features`) |
| Formato de pesos | ONNX (`xfeat_sim.onnx`) y `.om` de HiSilicon (`xfeat.om`) |
| Entrada | 640 x 480 |
| Calculo por inferencia | 2,66 GFLOPs |
| Framework de origen | PyTorch |
| Sistema operativo soportado | Linux |
| Plataforma de computo objetivo | HiSilicon Hi3516CV610 (NPU) |
| Categoria | Vision por computador / deteccion de puntos de interes |

## Arquitectura y entrenamiento

La informacion disponible describe XFeat como un modelo convolucional ligero de features locales con tres salidas acopladas: descriptores locales, mapa de clasificacion de keypoints y mapa de calor de fiabilidad. Esta estructura de multiples cabezas es propia de los detectores-descriptores aprendidos, en los que una misma red resuelve la deteccion de puntos y su descripcion, evitando ejecutar dos modelos separados. El modelo se desarrolla en PyTorch y se exporta a ONNX; el repositorio distribuye ademas una version compilada a `.om` para la NPU del Hi3516CV610 con cuantizacion A8W8.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas de refinamiento (RLHF, DPO u otras) ni innovaciones tecnicas internas como atencion lineal o decodificacion especulativa. El unico dato de evaluacion mencionado en la model card es el soporte de estimacion de homografia sobre el conjunto HPatches, sin cifras asociadas.

## Capacidades

- Deteccion de puntos de interes (keypoints) en imagenes.
- Generacion de descriptores locales para emparejamiento entre imagenes.
- Mapa de clasificacion de keypoints como salida auxiliar del detector.
- Mapa de calor de fiabilidad, util para filtrar correspondencias poco fiables.
- Emparejamiento de features entre pares de imagenes.
- Estimacion de homografia, con evaluacion prevista sobre HPatches.
- Inferencia en hardware de bajo consumo mediante NPU HiSilicon con cuantizacion A8W8.
- Exportacion e integracion via ONNX para ejecucion en CPU u otros aceleradores.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- SLAM y odometria visual: el modelo extrae y empareja keypoints entre fotogramas consecutivos de una camara; con 0,66 M de parametros y 2,66 GFLOPs puede ejecutarse por fotograma en la NPU de una camara embebida sin comprometer el presupuesto energetico.
- Seguimiento aumentado en AR: el emparejamiento de features entre la imagen de camara y una referencia permite estimar la homografia que fija la pose del contenido virtual sobre una superficie plana, con latencia compatible con tiempo real.
- Construccion de panoramicas y costura de imagenes: la estimacion de homografia entre imagenes solapadas permite alinear y fusionar tomas, por ejemplo en camaras 360 o en levantamientos fotograficos.
- Reconstruccion 3D y fotogrametria: los descriptores locales alimentan el emparejamiento disperso previo a la triangulacion en pipelines de structure-from-motion sobre CPU, reduciendo el coste frente a detectores mas pesados.
- Localizacion visual en robotica movil: el modelo permite reconocer lugares previamente mapeados comparando descriptores contra una base de datos de keypoints, util en robotica de interior con computo limitado.
- Alineacion e inspeccion industrial: en una linea de produccion, la homografia estimada permite alinear la pieza capturada con la plantilla de referencia para detectar desviaciones geometricas o defectos de posicionamiento.
- Procesamiento en camaras IP y dispositivos OpenHarmony: al distribuirse como `.om` para Hi3516CV610, encaja en despliegues donde no hay GPU ni presupuesto para modelos de vision convencionales.
- Registro de imagenes medicas o de teledeteccion: el emparejamiento de features permite superponer tomas de la misma zona adquiridas en momentos o con sensores distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el modelo admite evaluacion de estimacion de homografia sobre el conjunto HPatches, sin incluir metricas (por ejemplo, error de reproyeccion medio, precision de correspondencias o numero de inliers) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision. Los pesos en FP32 ocupan aproximadamente 2,6 MB (0,66 M de parametros) y en int8 alrededor de 0,7 MB; el grueso del consumo son las activaciones de una entrada de 640 x 480.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU, en GPU integrada o en la NPU objetivo; no necesita A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, incluso en modelos con 4 GB o menos, aunque la GPU no es el destino natural del modelo.
- Opciones de despliegue: PyTorch (modelo fuente), ONNX Runtime (modelo `xfeat_sim.onnx`), cadena de herramientas HiSilicon para generar y ejecutar el `.om` sobre la NPU Hi3516CV610.
- Latencia y throughput estimados: no disponibles.
- La cuantizacion A8W8 del binario `.om` puede introducir una perdida de precision en descriptores y mapas de fiabilidad respecto al modelo ONNX; conviene medirla antes de desplegar en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XFeat (este repositorio) | 0,66 M | 640 x 480 | no disponible | no disponible | ONNX y `.om` en HuggingFace |
| SuperPoint | no disponible | 640 x 480 (tipico) | no disponible | no disponible | habitual en repositorios de investigacion |
| DISK | no disponible | no disponible | no disponible | no disponible | pesos publicos |
| ORB / SIFT (metodos clasicos) | no aplica (sin parametros aprendidos) | resolucion variable | no disponible | licencias de OpenCV / algoritmo original | incluidas en OpenCV |

No se dispone de datos numericos de benchmarks en la informacion proporcionada que permitan una comparacion cuantitativa fiable entre estas alternativas; la tabla solo refleja diferencias de disponibilidad y naturaleza del modelo.

## Limitaciones y advertencias

- La model card no especifica licencia. Se apunta a la licencia del repositorio upstream `verlab/accelerated_features`, por lo que la aptitud para uso comercial debe verificarse en ese enlace antes de cualquier despliegue.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que no es posible estimar la precision real en emparejamiento ni en estimacion de homografia frente a alternativas.
- No se documentan los datos de entrenamiento: se desconocen los dominios cubiertos y, por tanto, el riesgo de degradacion fuera de distribucion (imagenes nocturnas, termicas, medicas o de satelite, entre otras).
- La entrada esta fijada en 640 x 480; resoluciones distintas requieren redimensionado, lo que altera la escala de los keypoints detectados y puede afectar al emparejamiento.
- La version compilada `.om` esta cuantizada a A8W8 y vinculada al SoC Hi3516CV610; no es portable a otras NPU sin recompilacion.
- La documentacion disponible esta en chino, lo que puede dificultar el mantenimiento por parte de equipos que no lo dominen.
- Repositorio espejo con 0 descargas y 0 likes, creado y actualizado en septiembre de 2026, sin `pipeline` declarado; conviene contrastar el contenido con el repositorio upstream antes de confiar en el.
- Al ser un modelo de vision, no admite generacion de texto, razonamiento, tool calling ni conversacion; cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- HuggingFace: https://huggingface.co/shadow-cann/hispark-modelzoo-xfeat
- Tarjeta en el portal de HiSilicon: https://gitbubble.github.io/hisilicon-developer-portal-mirror/model-detail.html?id=ku59qr0kts00
- Repositorio upstream (HiSpark modelzoo, XFeat): https://gitcode.com/HiSpark/modelzoo/tree/master/samples/built-in/point/Xfeat/README.md
- Referencia de licencia (verlab/accelerated_features): https://github.com/verlab/accelerated_features/blob/main/LICENSE

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; las entradas encontradas corresponden al servicio de cloud gaming Shadow y no guardan relacion con este repositorio.
