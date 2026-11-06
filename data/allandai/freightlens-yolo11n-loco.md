# AllanDai/freightlens-yolo11n-loco

## Resumen

FreightLens YOLO11n (LOCO) es un detector de objetos basado en YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, ajustado por AllanDai sobre el conjunto de datos LOCO (Logistics Objects in Context) para detectar elementos propios de instalaciones logísticas: palés, pequeños contenedores de carga (small load carriers), stillages, carretillas elevadoras y transpaletas. El modelo resuelve la tarea de deteccion de objetos en imagenes de almacen y muelle de carga, un dominio con clases muy especificas que no estan cubiertas por los modelos COCO preentrenados.

El modelo parte de pesos YOLO11n preentrenados en COCO y se ajusta con imagenes reales de cinco instalaciones logisticas, con una entrada de 640 px y un entrenamiento corto (hasta 50 epocas con early stopping en la epoca 37) sobre hardware consumer (Apple M1 Pro con MPS). Se distribuye tanto en formato PyTorch (`.pt`) como en exportacion ONNX sin NMS, pensada para inferencia en navegador, y forma parte del proyecto FreightLens AI.

Su relevancia radica en que cubre un nicho concreto de vision artificial industrial con un modelo de muy bajo coste computacional (variante nano, latencias de 19-36 ms por imagen), lo que permite desplegarlo en dispositivos de borde o directamente en el navegador. No obstante, sus resultados de precision son modestos: mAP50 de 0,271 y mAP50-95 de 0,122 sobre sesiones no vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de objetos de una etapa, CNN, familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640 px) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32 PyTorch y ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de vision, sin componente de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (640x640, sin NMS) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11n, la variante nano de la arquitectura YOLO11 de Ultralytics, una red convolucional de una etapa que predice cajas delimitadoras y clases directamente sobre una rejilla multi-escala. Se parte de pesos preentrenados en COCO y se realiza un ajuste fino sobre el conjunto LOCO con entrada de 640 px, batch de 16, hasta 50 epocas con early stopping (mejor epoca: 37). El entrenamiento se ejecuto en un Apple M1 Pro usando el backend MPS.

El conjunto LOCO (Logistics Objects in Context, licencia CC0) esta grabado como recorridos a pie por instalaciones, por lo que la particion se hace por sesiones completas de grabacion para evitar fuga de informacion: sesiones 2 y 3 para entrenamiento (1.943 imagenes), sesion 5 para seleccion de modelo (877) y sesiones 1 y 4, las de validacion oficial de LOCO, para el unico test final (2.277 imagenes). Las clases detectadas son cinco: forklift, pallet, pallet truck, small load carrier y stillage. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a un detector de objetos.

## Capacidades

- Deteccion de objetos en imagenes con cinco clases: palé (pallet), carretilla elevadora (forklift), transpaleta (pallet truck), small load carrier y stillage.
- Salida de cajas delimitadoras con clase y puntuacion de confianza por objeto.
- Exportacion ONNX sin NMS con entrada fija de 640x640, apta para inferencia en navegador.
- Conteo de pales por imagen (evaluado a umbral de confianza 0,25).
- Inferencia en CPU y en GPU Apple (MPS); no se documentan otras capacidades.
- No soporta tool calling, agentes, razonamiento multi-paso, vision-lenguaje ni capacidades multilingues, al ser un detector de objetos puro.

## Casos de uso

- Monitorizacion de muelles de carga: el modelo puede detectar pales y stillages en imagenes de camaras fijas de muelle, aunque el autor advierte que las camaras fijas de muelle no estan representadas en el conjunto de entrenamiento, por lo que requeriria ajuste adicional.
- Conteo de pales en almacen: con umbral de 0,25 el modelo estima el numero de pales por imagen con un error absoluto medio de 7,2 pales sobre una media de 23 por imagen, util para inventario aproximado o alertas de saturacion.
- Demostracion en navegador: la exportacion ONNX sin NMS permite ejecutar el detector en el cliente sin backend, como en la demo publica de FreightLens AI, para validacion visual rapida de imagenes de almacen.
- Prototipado de sistemas de seguridad en almacen: deteccion de carretillas y transpaletas para estudios preliminares de proximidad, si bien la baja AP de estas clases limita su uso en produccion sin reentrenamiento.
- Etiquetado asistido: uso del modelo como preanotador en pipelines de anotacion de nuevas imagenes logisticas, con revision humana posterior, aprovechando su bajo coste de inferencia.
- Investigacion en vision industrial de bajo coste: base para experimentos de deteccion en dispositivos de borde o en entornos con recursos limitados, dada su latencia de 19-36 ms por imagen.

## Benchmarks y rendimiento

Resultados de test sobre sesiones no vistas (sesiones 1 y 4 de LOCO, 2.277 imagenes):

| Clase | AP50 | AP50-95 |
|---|---|---|
| forklift | 0,143 | 0,069 |
| pallet | 0,522 | 0,206 |
| pallet truck | 0,103 | 0,034 |
| small load carrier | 0,128 | 0,048 |
| stillage | 0,458 | 0,251 |
| **todas las clases (mAP)** | **0,271** | **0,122** |

Datos adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| AP50 de pallet en ONNX | 0,521 (PyTorch: 0,522) |
| Error absoluto medio en conteo de pales (conf. 0,25) | 7,2 pales por imagen |
| Sesgo en conteo de pales | -0,9 |
| Media de pales por imagen | 23 |
| Latencia mediana por imagen (CPU) | 36 ms |
| Latencia mediana por imagen (MPS, Apple M1 Pro) | 19 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de YOLO11n (variante nano) el consumo es muy bajo, apto para GPU consumer de gama baja, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: no documentadas por el autor; el entrenamiento se realizo en Apple M1 Pro (MPS). Para inferencia, cualquier GPU con soporte CUDA o MPS es suficiente por el tamano del modelo.
- Cabe en GPU consumer: si, por el tamano nano del modelo; el autor no especifica modelos concretos.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime (exportacion sin NMS, usada en la demo de navegador). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: latencia mediana de 36 ms por imagen en CPU y 19 ms en MPS (Apple M1 Pro); el throughput no se documenta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con otras variantes de YOLO11 u otros detectores ajustados a LOCO.

| Modelo | Parametros | Contexto/entrada | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FreightLens YOLO11n (LOCO) | no disponible (variante nano) | 640x640 px | 0,271 (AP50) / 0,122 (AP50-95) | AGPL-3.0 | Hugging Face |
| YOLO11n preentrenado en COCO | no disponible | 640x640 px | no disponible para clases LOCO | AGPL-3.0 | Ultralytics |
| Alternativas ajustadas a LOCO | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precision baja en clases minoritarias: forklift (AP50 0,143), pallet truck (0,103) y small load carrier (0,128) tienen muy pocas cajas de entrenamiento (unos cientos), lo que limita su uso fiable.
- Pales pequenos y lejanos se pierden con frecuencia a 640 px, segun el propio autor.
- El conjunto LOCO cubre solo cinco instalaciones grabadas con camara en movimiento; no representa camaras fijas de muelle, otros tipos de pale ni iluminacion nocturna.
- Error de conteo de pales considerable: error absoluto medio de 7,2 pales por imagen sobre una media de 23, con sesgo de -0,9 (tendencia a infracontar).
- Riesgo de alucinacion: como todo detector, puede generar falsos positivos en escenas fuera de distribucion; no se documentan sesgos especificos mas alla de los de cobertura del dataset.
- Licencia AGPL-3.0: el uso comercial en servicios en red implica obligaciones de liberacion del codigo fuente derivado; debe revisarse antes de integrarlo en productos propietarios.
- Modelo de vision sin capacidades de lenguaje: no admite prompts, tool calling ni razonamiento; su salida son cajas y clases.
- Repositorio practicamente vacio en el momento de la consulta (0 GB, 0 descargas), lo que sugiere un proyecto reciente y sin validacion externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AllanDai/freightlens-yolo11n-loco
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/AllanDai/freightlens-ai
- Proyecto FreightLens AI (GitHub): https://github.com/Allan-dq/freightlens-ai
- Conjunto de datos LOCO (GitHub, TUM): https://github.com/tum-fml/loco
