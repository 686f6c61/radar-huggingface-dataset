# LibreYOLO/LibreRiODETRv2s-obb

## Resumen

LibreRiODETRv2s-obb es un detector de objetos orientados (oriented object detection, OBB) derivado de RiO-DETRv2-S, la variante pequena del detector basado en transformers RiO-DETRv2. El modelo se ha entrenado sobre DOTA-v1.0, un dataset de imagenes aereas con 15 clases y entradas de 1024 px, y se distribuye como un port al ecosistema LibreYOLO, una libreria de codigo abierto para deteccion de objetos. El autor del port es la organizacion LibreYOLO.

La relevancia de este artefacto es principalmente de empaquetado y licencia: toma los pesos originales de RicePasteM/RiO-DETRv2 (publicados bajo Apache-2.0 en su revision inicial) y los adapta al formato de LibreYOLO mediante remapeo de claves del state-dict y eliminacion del proyector de destilacion usado solo en entrenamiento. Los parametros aprendidos no se modifican y las salidas crudas coinciden exactamente con el modelo original (max_abs_diff 0).

El modelo resuelve la deteccion de objetos con cajas delimitadoras orientadas (rotadas), un caso de uso habitual en teledeteccion, imagenes aereas y analisis de escenas donde los objetos aparecen con orientaciones arbitrarias. Al estar basado en una arquitectura DETR (transformer end-to-end, sin NMS), ofrece un pipeline de inferencia mas simple que los detectores clasicos basados en anclas. No se dispone de informacion sobre el numero exacto de parametros, la longitud de contexto (no aplica a vision) ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2-S (DETR basado en transformer, deteccion orientada / OBB) |
| Parametros totales | no disponible (variante "S" de RiO-DETRv2; cifra exacta no publicada en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1024 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch para la libreria `libreyolo`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es RiO-DETRv2, una evolucion de RT-DETR orientada a deteccion de objetos con cajas rotadas. Se trata de un detector end-to-end basado en transformer que predice conjuntos de objetos sin necesidad de supresion no maxima (NMS), lo que simplifica el post-procesado frente a detectores tipo YOLO. La variante "S" corresponde al modelo de menor capacidad de la familia. El checkpoint original es `dota_1_ss/riov2_hgnetv2_s_dota_1_ss.pth`, lo que indica un backbone HGNetv2-S y entrenamiento sobre DOTA en configuracion de una sola escala.

El entrenamiento se realizo sobre DOTA-v1.0 con 15 clases y resolucion de entrada de 1024 px. No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables en deteccion). El port a LibreYOLO no reentrena: solo remapea las claves del state-dict, elimina el proyector de destilacion usado exclusivamente en entrenamiento y anade metadatos de LibreYOLO. La equivalencia funcional con el modelo original esta verificada con una diferencia absoluta maxima de 0 en las salidas crudas.

## Capacidades

- Deteccion de objetos orientados (cajas rotadas) en imagenes, con 15 clases del dataset DOTA-v1.0.
- Deteccion end-to-end sin NMS, gracias a la formulacion DETR del modelo.
- Inferencia sobre imagenes de entrada de 1024 px.
- Integracion con la libreria `libreyolo` mediante una API de alto nivel (`LibreYOLO(...)` y llamada directa sobre imagen).
- Guardado de resultados visuales (`save=True`) en el flujo de inferencia.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Teledeteccion y analisis de imagenes aereas: deteccion de vehiculos, barcos, aviones y otras clases DOTA en imagenes de satelite o dron, aprovechando las cajas orientadas para objetos con rotacion arbitraria.
- Inventario de infraestructuras: conteo y localizacion de elementos como pistas de tenis, piscinas, puentes o puertos en ortomosaicos, donde la orientacion de la caja mejora el ajuste geometrico.
- Monitorizacion maritima: deteccion de embarcaciones en imagenes costeras o portuarias, con cajas rotadas que se ajustan mejor a la eslora y rumbo aparente del barco.
- Analisis de imagenes de dron para agricultura o urbanismo: localizacion de campos, edificios o vehiculos con orientacion variable segun la perspectiva de vuelo.
- Pipeline de anotacion asistida: pre-etiquetado automatico de imagenes aereas para acelerar el etiquetado humano en proyectos de vision, gracias a la salida end-to-end sin NMS.
- Prototipado e investigacion en deteccion orientada: base para comparar detectores DETR-OBB frente a enfoques YOLO-OBB en entornos con la libreria LibreYOLO.
- Integracion en sistemas de inspeccion geoespacial: procesamiento por lotes de imagenes con la API de `libreyolo`, guardando resultados visuales para revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser una variante "S" de un detector DETR con backbone HGNetv2-S y entrada de 1024 px, se espera un consumo moderado, pero no se han publicado cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano de la variante "S" es plausible que quepa en GPUs de consumo, pero no se aporta dato verificable.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` (`pip install libreyolo`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2s-obb | RiO-DETRv2-S (DETR OBB) | DOTA-v1.0 (15 clases) | 1024 px | Apache-2.0 | Hugging Face (LibreYOLO) |
| LibreRTDETRv2s-obb | RT-DETRv2-S (DETR OBB) | DOTA 1.0 | no disponible | no disponible | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (upstream) | RiO-DETRv2 (DETR OBB) | DOTA | no disponible | Apache-2.0 en revision inicial; AGPL-3.0 posterior | Hugging Face / GitHub (RicePasteM) |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deteccion de objetos orientados; no realiza ninguna otra tarea.
- Entrenado solo sobre DOTA-v1.0 (15 clases); su rendimiento fuera de ese dominio (imagenes no aereas, clases distintas) no esta garantizado ni documentado.
- No se han publicado metricas de precision (mAP) ni evaluaciones independientes en la informacion disponible.
- Riesgo de sesgo ligado al dataset DOTA: la distribucion geografica y de clases del dataset condiciona las predicciones.
- La licencia Apache-2.0 cubre los pesos y el codigo del port, pero los datos de entrenamiento DOTA-v1.0 tienen sus propios terminos, que deben respetarse en uso comercial.
- El proyecto upstream RiO-DETRv2 cambio su licencia a AGPL-3.0 tras la revision inicial; este port se ampara en la concesion Apache-2.0 de la revision `ab8b22d`. Conviene verificar la situacion legal antes de un uso comercial critico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria muy limitados.
- No se documentan opciones de cuantizacion ni formatos alternativos (GGUF, ONNX), lo que puede limitar el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2s-obb
- Modelo relacionado (RT-DETRv2s-obb): https://huggingface.co/LibreYOLO/LibreRTDETRv2s-obb
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Codigo fuente upstream RiO-DETRv2: https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada del codigo (tag apache-2.0-ab8b22d): https://github.com/LibreYOLO/RiO-DETRv2
- Pesos originales upstream: https://huggingface.co/RicePasteM/RiO-DETRv2
