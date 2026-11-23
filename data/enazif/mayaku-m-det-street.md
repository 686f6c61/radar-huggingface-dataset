# enazif/mayaku-m-det-street

## Resumen

`mayaku-m-det-street` es un modelo de detección de objetos orientado a escenas de tráfico y vía pública, desarrollado por enazif y publicado bajo el paraguas del framework Mayaku. Es el modelo de tamano medio de una familia de cuatro variantes (nano y medium, en versiones de detección y de segmentación) especializadas en imagenes de calle, que abarcan desde dashcam hasta vistas aéreas de dron. Resuelve el problema de la detección genérica tipo COCO, que no distingue clases críticas para el dominio vial como matrículas, cascos, patinetes eléctricos o vehículos de emergencia.

El modelo entrega cajas delimitadoras (no máscaras) sobre 22 clases agrupadas en personas, micromovilidad, vehículos, objetos de vía y animales. Con 32,4 millones de parametros y un Box AP de 56,8 en su conjunto de validación de calle, se posiciona por delante de detectores genéricos de tamano similar en escenas viales, especialmente en objetos pequenos y vistas aéreas. Su propuesta de valor es el uso directo sin entrenamiento ni datos propios: se carga con `from_pretrained` y se ejecuta tal cual.

La relevancia actual reside en su enfoque de despliegue: exporta a ONNX, TensorRT, OpenVINO y Core ML con cuantización int8, como un grafo de cinco operaciones planas que corre en cualquier runtime y NPU. En una RTX 3060 procesa un frame de 1920×1080 en 6,42 ms en fp16 y 3,94 ms en int8, lo que lo hace apto para tiempo real en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; grafo de cinco operaciones planas tras exportación) |
| Parametros totales | 32,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch); exportable a ONNX, TensorRT, OpenVINO y Core ML |

## Arquitectura y entrenamiento

No se detalla en la informacion proporcionada la arquitectura interna del backbone ni del cabezal de detección. El modelo se distribuye a traves de la libreria `mayaku` y su rasgo arquitectonico documentado es la exportabilidad: tras la exportación se convierte en un grafo de cinco operaciones planas que puede ejecutarse en cualquier runtime y NPU, con soporte de cuantización int8. Entrega cajas delimitadoras; la variante `-seg` del mismo tamano anade máscaras de segmentación manteniendo idénticas cajas.

El entrenamiento se realizó sobre un conjunto de validación de calle de 17.712 imagenes procedentes de Objects365, COCO, Wikimedia Commons y fuentes de dron y aéreas, con 22 clases y metrica COCO AP@[.50:.95]. No se especifican en la informacion disponible el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset de entrenamiento ni si hubo etapas de ajuste fino con RLHF/DPO (no aplica a un detector). El autor senala que los modelos de calle nunca vieron etiquetas de COCO, lo que explica su ventaja en escenas viales y su desventaja en el benchmark COCO.

## Capacidades

- Detección de objetos en cajas delimitadoras sobre 22 clases de dominio vial.
- Grupo de personas: person, face, helmet.
- Grupo de micromovilidad y asistencia: bicycle, e-scooter, motorcycle, wheelchair, stroller.
- Grupo de vehículos: car, truck, bus, emergency vehicle, train, three-wheeler, construction vehicle, trailer.
- Grupo de objetos de vía: license plate, traffic light, safety sign, stop sign, traffic cone.
- Grupo otros: animal (una sola clase para perros, gatos, caballos, ganado, ovejas, aves y ciervos).
- Detección de caras y matrículas pensada para anonimización previa al almacenamiento o publicación de metraje.
- Funcionamiento en escenas de dashcam, CCTV y vistas aéreas de dron.
- Exportación a ONNX, TensorRT, OpenVINO y Core ML, incluida cuantización int8.
- Inferencia sobre rutas de fichero, imagenes PIL o frames OpenCV en BGR.
- Interfaz de linea de comandos (`mayaku predict`) y API Python (`from_pretrained`).
- No dispone de tool calling, razonamiento multi-paso ni capacidades de lenguaje: es exclusivamente un detector visual.

## Casos de uso

- Anonimización de metraje de tráfico: el modelo detecta caras y matrículas como clases propias, de modo que un pipeline puede difuminarlas antes de almacenar o compartir grabaciones, cumpliendo requisitos de privacidad.
- Analítica de tráfico urbano: conteo y clasificación de vehiculos por tipo (car, truck, bus, emergency vehicle, three-wheeler) sobre camaras de CCTV, aprovechando la distincion entre vehiculo ligero y pesado que COCO no ofrece.
- Vigilancia de seguridad vial en micromovilidad: detección de patinetes eléctricos, bicicletas y motoristas para estudios de siniestralidad o para sistemas de alerta en cruces, con clases especificas que los detectores genéricos confunden.
- Inspección con dron: el modelo mantiene un AP de 23 a 25 en imagenes aéreas donde YOLO26l cae a 3-9 AP y RF-DETR large a 6-17, lo que lo hace adecuado para monitorizacion de trafico desde el aire y recuento de vehiculos en vias.
- Sistemas de asistencia a la conducción en tiempo real: con 3,94 ms por frame de 1920×1080 en int8 sobre RTX 3060, puede integrarse en pipelines de percepción embebidos o en vehículos con NPU tras exportar a TensorRT, OpenVINO o Core ML.
- Detección de cascos en obras y vías: la clase helmet (independiente de si esta puesto o no) permite auditar el cumplimiento de normativa en motociclistas y trabajadores de carretera.
- Inventario de senalizacion: las clases traffic light, safety sign, stop sign y traffic cone permiten catalogar infraestructura vial en imagenes o video, util para mantenimiento de mapas y auditorias de senalética.
- Analítica de accesibilidad: las clases wheelchair y stroller permiten estudiar la presencia de usuarios vulnerables en entornos urbanos, aunque su AP es de las mas bajas (32,5 y 26,9 respectivamente).

## Benchmarks y rendimiento

Resultados en el conjunto de validación de calle (17.712 imagenes, 22 clases, COCO AP@[.50:.95]):

| Metrica | street nano | street medium |
|---|---:|---:|
| Box AP | 43,9 | 56,8 |
| AP50 | 60,0 | 72,1 |
| AP small | 23,7 | 34,3 |
| AP large | 62,8 | 73,2 |
| Mask AP (variante -seg) | 35,2 | 45,5 |

AP por clase del modelo medium (las mas fuertes y mas debiles):

| Clase | Box AP |
|---|---:|
| bus | 78,6 |
| train | 75,1 |
| car | 72,3 |
| person | 66,1 |
| face | 65,7 |
| e-scooter | 65,2 |
| emergency vehicle | 64,2 |
| license plate | 64,1 |
| construction vehicle | 39,7 |
| wheelchair | 32,5 |
| stroller | 26,9 |
| trailer | 24,5 |

Comparativa con modelos COCO en las 10 clases compartidas (person, bicycle, motorcycle, car, truck, bus, train, traffic light, stop sign, animal; car y truck fusionados en una clase vehiculo), box AP@[.50:.95]:

| Modelo | Parametros | Street validation set | COCO val2017 | Tiempo de red, RTX 3060 fp16 |
|---|---:|---:|---:|---:|
| street medium | 32,4 M | 65,3 | 57,1 | 5,36 ms |
| RF-DETR large | 33,9 M | 56,3 | 61,8 | 5,42 ms |
| YOLO26l | 26,3 M | 53,2 | 60,4 | 4,19 ms |
| street nano | 5,2 M | 52,2 | 51,2 | 1,49 ms |
| YOLO26n | 2,6 M | 34,1 | 48,6 | no disponible |

Tiempos end-to-end en una RTX 3060 (frame de 1920×1080, TensorRT, batch 1, mediana de 1.000 frames): 6,42 ms en fp16 y 3,94 ms en int8 para el modelo medium.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 32,4 M de parametros el peso en fp16 ronda los 65 MB y en int8 unos 32 MB, por lo que el cuello de botella es el buffer de activaciones, no los pesos.
- GPU recomendadas: RTX 3060 es la referencia medida por el autor; tarjetas superiores (RTX 4090, A100, H100) escalaran el throughput. Cualquier GPU con soporte TensorRT, ONNX Runtime u OpenVINO es valida.
- Cabe en GPU de consumo: si, con amplio margen; los 6,42 ms en fp16 y 3,94 ms en int8 sobre RTX 3060 lo confirman.
- Opciones de despliegue: TensorRT, ONNX Runtime, OpenVINO, Core ML y la propia libreria `mayaku` (instalable con `pip install mayaku`). No se mencionan vLLM, llama.cpp ni TGI por no ser un modelo de lenguaje.
- Latencia: 6,42 ms fp16 y 3,94 ms int8 end-to-end por frame de 1920×1080 en RTX 3060. Tiempo de red puro en fp16: 5,36 ms.
- Throughput estimado: aproximadamente 155-254 FPS segun precision en RTX 3060, a partir de las latencias publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Box AP calle | Box AP COCO | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| mayaku-m-det-street | 32,4 M | no aplica | 56,8 (22 clases) | 57,1 (10 clases) | Apache 2.0 | Hugging Face |
| RF-DETR large | 33,9 M | no aplica | 56,3 (10 clases) | 61,8 | no disponible en la informacion | no disponible en la informacion |
| YOLO26l | 26,3 M | no aplica | 53,2 (10 clases) | 60,4 | no disponible en la informacion | no disponible en la informacion |
| mayaku-m-seg-street | 32,7 M | no aplica | 56,8 (22 clases) | no disponible | Apache 2.0 | Hugging Face |

En escenas de calle el modelo medium supera a RF-DETR large por 9 AP y gana en todas las clases compartidas. En imagenes aereas y de dron la diferencia se amplia: YOLO26l obtiene 3-9 AP y RF-DETR large 6-17, frente a 23-25 del modelo de calle. En COCO val2017, en cambio, los modelos COCO lideran porque los de calle nunca vieron etiquetas COCO.

## Limitaciones y advertencias

- Clases con pocos ejemplos de entrenamiento y AP bajo: trailer (24,5), stroller (26,9), wheelchair (32,5) y construction vehicle (39,7); no son fiables en produccion sin validación adicional.
- Las clases no siguen exactamente la taxonomia COCO: car engloba furgonetas, SUV y pickups; truck solo vehiculos pesados; train incluye tranvias; animal agrupa especies muy distintas. Esto puede generar desalineacion con pipelines entrenados en COCO.
- No detecta senales de nombre de calle, direccion ni de comercios; safety sign cubre solo senalética regulatoria y de advertencia.
- El rendimiento en imagenes genericas (COCO val2017: 57,1 frente a 61,8 de RF-DETR large) es inferior al de detectores generalistas del mismo tamano.
- No se han documentado en la informacion disponible sesgos demograficos, geograficos ni de condiciones de iluminacion; la validación se limita al conjunto de calle descrito.
- Riesgo de alucinacion (falsos positivos) no cuantificado en la informacion disponible; como todo detector, puede producir detecciones espurias en escenas fuera de distribucion.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; cualquier flujo agentico requiere un LLM externo que consuma sus salidas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones sobre los datos de entrenamiento subyacentes (Objects365, COCO, Wikimedia Commons) que el usuario deberia verificar por su cuenta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El modelo `-det` no proporciona máscaras; si se necesitan segmentaciones hay que usar la variante `-seg`, con mayor coste de CPU por el pegado de máscaras a resolucion completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enazif/mayaku-m-det-street
- Repositorio Mayaku en GitHub: https://github.com/emrahnazif/mayaku
- Documentación de exportación: https://emrah.fr/mayaku/deployment/export/
- Modelo nano de detección: https://huggingface.co/enazif/mayaku-n-det-street
- Modelo nano de segmentación: https://huggingface.co/enazif/mayaku-n-seg-street
- Modelo medium de segmentación: https://huggingface.co/enazif/mayaku-m-seg-street
