# LibreYOLO/LibreRiODETRv2x-obb

## Resumen

LibreRiODETRv2x-obb es un detector de objetos orientados (oriented object detection, OBB) basado en la arquitectura RiO-DETRv2 en su variante X, convertido y empaquetado para la librería LibreYOLO. El modelo original procede del repositorio RicePasteM/RiO-DETRv2 y ha sido entrenado sobre DOTA-v1.0, un conjunto de referencia para detección de objetos en imágenes aéreas y de teledetección con 15 clases y entradas de 1024 píxeles. El autor del port es la organización LibreYOLO.

La relevancia de esta ficha radica en dos aspectos. Primero, cubre una tarea especializada, la detección con cajas delimitadoras rotadas, que los detectores estándar de cajas alineadas a los ejes no resuelven bien en escenarios con objetos arbitrariamente orientados (barcos, aviones, vehículos en imágenes satelitales). Segundo, el port se apoya deliberadamente en la primera release de RiO-DETRv2 publicada bajo licencia Apache-2.0, antes de que el proyecto upstream cambiara a AGPL-3.0, lo que permite su uso comercial bajo términos permisivos.

El paquete incluye únicamente cambios de formato: remapeo de claves del state-dict, eliminación del proyector de destilación usado solo en entrenamiento y metadatos de LibreYOLO. Según la model card, los parámetros aprendidos no se han modificado y las salidas crudas coinciden exactamente con el modelo upstream (max_abs_diff 0). El repositorio ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2 (transformer detector, variante X), deteccion orientada (OBB) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen de 1024 px) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato .pt) |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (checkpoint PyTorch, libreria libreyolo) |

## Arquitectura y entrenamiento

RiO-DETRv2 es un detector basado en transformer de la familia DETR, en su variante X (la de mayor capacidad de la familia). La salida es de cajas delimitadoras orientadas, es decir, rectangulos rotados que se ajustan a objetos con orientacion arbitraria, algo critico en imagenes aereas. La entrada de inferencia es de 1024 píxeles y el modelo predice sobre 15 clases del conjunto DOTA-v1.0.

El entrenamiento se realizo sobre DOTA-v1.0 según indica la model card. No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF/DPO (no aplicables en un detector de objetos). El checkpoint original es `dota_1_ss/riov2_hgnetv2_x_dota_1_ss.pth` del repositorio RicePasteM/RiO-DETRv2. La conversion a LibreYOLO consistio en remapeo de claves del state-dict, eliminacion del proyector de destilacion (solo usado en entrenamiento) y adicion de metadatos, sin alterar los pesos aprendidos.

## Capacidades

- Deteccion de objetos orientados (OBB): prediccion de cajas delimitadoras rotadas sobre imagenes, adecuada para objetos con orientacion arbitraria.
- Deteccion sobre 15 clases del conjunto DOTA-v1.0 (categorias tipicas de teledeteccion: vehiculos, barcos, aviones, infraestructura, etc., segun la definicion de DOTA).
- Entrada de imagen de 1024 px, pensada para escenas aereas y de alta resolucion.
- Inferencia mediante la libreria LibreYOLO con una API sencilla (`LibreYOLO("LibreRiODETRv2x-obb.pt")`).
- Soporte de guardado de resultados visuales (`save=True`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es un modelo puramente de vision por computador.
- No se documentan en la informacion disponible modos especiales como thinking, vision multimodal o audio.

## Casos de uso

- Deteccion de barcos en imagenes satelitales: las cajas orientadas permiten ajustar la proa y la popa de embarcaciones en puertos y aguas abiertas, donde las cajas alineadas a los ejes generan solapamientos y falsos positivos.
- Monitorizacion de trafico aereo y flotas de aviones en pistas: la orientacion de las aeronaves en plataformas aeroportuarias se captura con rectangulos rotados, util para conteo y analisis de ocupacion.
- Inventario de infraestructura viaria y aparcamientos: deteccion de vehiculos y elementos de calzada en ortoimagenes para planificacion urbana y analisis de capacidad.
- Analisis de imagenes de drones para agricultura y obra civil: deteccion de maquinaria, vehiculos y estructuras con orientacion variable en vuelos de inspeccion.
- Procesamiento por lotes en pipelines geoespaciales: integracion en flujos que reciben tiles de imagenes aereas, aplican el detector y agregan detecciones en un SIG; la salida OBB facilita el calculo de areas y orientaciones reales.
- Investigacion en deteccion orientada: el modelo sirve como referencia Apache-2.0 para comparar con otros detectores OBB y para experimentos academicos que requieran pesos permisivos.
- Prototipado rapido con LibreYOLO: al compartir API con el resto de modelos de la libreria, permite sustituir detectores en un pipeline existente sin reescribir la logica de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como orientacion general, un detector transformer de la familia DETR en variante X con entrada de 1024 px suele requerir varios GB de VRAM, pero no se confirma en la documentacion del modelo.
- GPU recomendadas: no disponibles. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` (`pip install libreyolo`), con carga del checkpoint `.pt` y llamada directa al modelo. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2x-obb | RiO-DETRv2-X | Deteccion OBB | DOTA-v1.0 | Apache-2.0 | Hugging Face (LibreYOLO) |
| LibreRTDETRv2x-obb | RT-DETRv2-X | Deteccion OBB | DOTA 1.0 | no disponible en la informacion | Hugging Face (LibreYOLO) |
| RiO-DETRv2 original (RicePasteM) | RiO-DETRv2 | Deteccion OBB | DOTA | Apache-2.0 en la release inicial; AGPL-3.0 posterior | Hugging Face y GitHub |

El port LibreRTDETRv2x-obb de la misma organizacion es la alternativa mas directa: comparte tarea, dataset y flujo de conversion, aunque su arquitectura de origen es RT-DETRv2-X en lugar de RiO-DETRv2-X. No se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en deteccion de objetos orientados: no genera texto ni responde a instrucciones; cualquier uso fuera de vision por computador no es aplicable.
- Clases limitadas al conjunto DOTA-v1.0 (15 clases): no detectara categorias fuera de ese vocabulario.
- Dominio restringido a imagenes aereas y de teledeteccion: el rendimiento en fotografias convencionales o escenas no aereas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion en el sentido de detecciones falsas: como todo detector, puede producir cajas espurias o mal calibradas, especialmente en objetos pequenos o con oclusion.
- La licencia Apache-2.0 del port se ampara en la primera release del codigo upstream; el proyecto original cambio despues a AGPL-3.0. Conviene conservar el aviso de licencia y el NOTICE incluidos en el repositorio.
- Los datos de entrenamiento DOTA-v1.0 tienen sus propios terminos de uso, que deben respetarse independientemente de la licencia del modelo.
- No se documentan sesgos especificos, pero los sesgos del dataset DOTA (geografia, sensores, condiciones de captura) se heredan en el modelo.
- No hay informacion publica sobre cuantizacion, latencia o requisitos de hardware, lo que dificulta planificar un despliegue en produccion sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2x-obb
- Codigo fuente original (RicePasteM/RiO-DETRv2): https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada del codigo Apache-2.0 (LibreYOLO/RiO-DETRv2): https://github.com/LibreYOLO/RiO-DETRv2
- Pesos originales (RicePasteM/RiO-DETRv2): https://huggingface.co/RicePasteM/RiO-DETRv2
- Repositorio de la libreria LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Modelo relacionado LibreRTDETRv2x-obb: https://huggingface.co/LibreYOLO/LibreRTDETRv2x-obb
