# LibreYOLO/LibreRiODETRv2n-obb

## Resumen

LibreRiODETRv2n-obb es un detector de objetos orientados (oriented object detection, OBB) derivado de RiO-DETRv2-N, el modelo de la familia RT-DETR adaptado por RicePasteM para deteccion de objetos rotados. El modelo ha sido convertido y empaquetado por el proyecto LibreYOLO para su uso dentro de su propia libreria de inferencia, con el objetivo de ofrecer un detector OBB listo para produccion bajo licencia Apache-2.0.

El modelo esta entrenado sobre DOTA-v1.0 con 15 clases y una resolucion de entrada de 1024 px, lo que lo orienta a deteccion en imagenes aereas y de satelite, donde los objetos aparecen en orientaciones arbitrarias y los bounding boxes axis-aligned resultan inadecuados. La variante "n" corresponde al tamano nano de la familia RiO-DETRv2, pensada para despliegues con requisitos de computo moderados.

La relevancia de esta ficha radica en dos aspectos: por un lado, la conversion preserva exactamente los pesos aprendidos del modelo original (diferencia maxima absoluta de 0 en las salidas crudas), y por otro, el port se apoya en la publicacion inicial Apache-2.0 del codigo de RiO-DETRv2, anterior al relicenciamiento del upstream a AGPL-3.0. Esto permite usar el modelo en entornos comerciales sin las obligaciones copyleft de la version posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2 (transformer detector DETR-like con prediccion de cajas orientadas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 1024 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (state-dict convertido para LibreYOLO) |

## Arquitectura y entrenamiento

RiO-DETRv2 sigue la estela de RT-DETR, un detector transformer end-to-end que elimina la necesidad de anchors y de supresion no maxima (NMS) en post-procesado. La variante RiO anade la prediccion de cajas orientadas, parametrizadas por angulo, para ajustar los objetos rotados tipicos de imagenes aereas. La variante "n" es la de menor capacidad de la familia, con backbone HGNetv2-N segun el nombre del checkpoint upstream (`riov2_hgnetv2_n_dota_1_ss.pth`).

El entrenamiento se realizo sobre DOTA-v1.0 con 15 clases y entradas de 1024 px. La model card no detalla el numero de tokens ni la composicion exacta del dataset mas alla de la referencia a DOTA. La conversion a LibreYOLO consistio en remapeo de claves del state-dict, eliminacion del proyector de destilacion usado solo en entrenamiento y adicion de metadatos de la libreria; los parametros aprendidos no se modificaron y las salidas crudas coinciden con el modelo original (max_abs_diff 0).

## Capacidades

- Deteccion de objetos orientados (OBB) en imagenes, con cajas rotadas y etiqueta de clase.
- Entrenado especificamente para las 15 clases de DOTA-v1.0 (aviones, barcos, vehiculos, campos de tenis, etc.).
- Entrada de imagen a 1024 px, adecuada para escenas aereas de alta resolucion.
- Inferencia end-to-end sin NMS, gracias a la arquitectura DETR-like.
- Integracion con la libreria LibreYOLO mediante API `LibreYOLO("LibreRiODETRv2n-obb.pt")`.
- Soporte de guardado de resultados visuales (`save=True`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo thinking, vision-language, audio ni generacion de texto.

## Casos de uso

- Deteccion de barcos en imagenes satelitales: el modelo predice cajas orientadas que se ajustan a la eslora real de cada embarcacion, algo imposible con bounding boxes axis-aligned en puertos con atraques en diagonal.
- Monitorizacion de infraestructura viaria: deteccion de vehiculos y puentes en ortofotos aereas para inventariado automatico, aprovechando las clases de DOTA y la entrada de 1024 px.
- Analisis de campos deportivos: identificacion de pistas de tenis, campos de futbol y piscinas en imagenes aereas para cartografia deportiva o planificacion urbanistica.
- Inventario de aeronaves en aeropuertos: deteccion de aviones y helicopteros en plataformas de estacionamiento, donde la orientacion variable de las aeronaves hace necesario el OBB.
- Agricultura de precision: localizacion de invernaderos y naves agricolas en imagenes de dron, con cajas rotadas que se adaptan a la orientacion de las parcelas.
- Procesamiento por lotes en pipelines de teledeteccion: al no requerir NMS, el post-procesado es mas simple y determinista, lo que facilita la integracion en flujos automatizados de ingesta de imagenes satelitales.
- Prototipado rapido en investigacion: al estar bajo Apache-2.0 y con pesos identicos al upstream, sirve como baseline reproducible para comparar metodos OBB sin ataduras de licencia copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al ser una variante nano con entrada de 1024 px, se espera un consumo moderado, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la unica via documentada es la libreria `libreyolo` (instalacion via `pip install libreyolo`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un detector visual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2n-obb | RiO-DETRv2-N | 1024 px | DOTA-v1.0 (15 clases) | Apache-2.0 | Hugging Face (LibreYOLO) |
| LibreRTDETRv2n-obb | RT-DETRv2-N | no disponible | DOTA | Apache-2.0 | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (upstream) | RiO-DETRv2 | 1024 px | DOTA-v1.0 | Apache-2.0 en la release inicial, AGPL-3.0 despues | Hugging Face (RicePasteM) |

La comparativa con otros detectores OBB de la literatura (por ejemplo, variantes de YOLO-OBB) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente sobre DOTA-v1.0; su rendimiento fuera de ese dominio (imagenes aereas con otras clases u otras resoluciones) no esta documentado y probablemente degrade.
- Las 15 clases de DOTA son fijas: no detecta categorias fuera de ese conjunto sin reentrenamiento.
- No se aportan datos de sesgo, calibracion ni tasas de falsos positivos; se desconoce el riesgo de alucinacion de objetos en escenas no vistas.
- La licencia Apache-2.0 cubre el codigo y los pesos de la release inicial, pero los datos de entrenamiento DOTA-v1.0 tienen sus propios terminos, que deben revisarse para uso comercial.
- El upstream relicencio a AGPL-3.0 despues de la release inicial; este port se ampara en la concesion Apache-2.0 de esa release inicial, pero conviene conservar la trazabilidad del commit `ab8b22d`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento en produccion.
- No hay informacion sobre cuantizacion ni sobre despliegue en GPU de consumo, lo que limita la planificacion de recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2n-obb
- Codigo upstream de RiO-DETRv2: https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada de la release Apache-2.0: https://github.com/LibreYOLO/RiO-DETRv2
- Pesos upstream: https://huggingface.co/RicePasteM/RiO-DETRv2
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentacion de LibreYOLO (tareas experimentales, OBB): https://www.libreyolo.com/docs/experimental
- Modelo hermano LibreRTDETRv2n-obb: https://huggingface.co/LibreYOLO/LibreRTDETRv2n-obb
