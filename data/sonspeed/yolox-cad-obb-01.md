# sonspeed/yoloX-cad-obb-01

## Resumen

yoloX-cad-obb-01 es un detector de objetos con cajas orientadas (oriented bounding boxes, OBB) desarrollado por el usuario sonspeed y publicado en HuggingFace. Se trata de un checkpoint de etapa 1 concebido explicitamente como red de propuesta de regiones (region proposal network) para simbolos de planos CAD: todas las clases de simbolo se colapsan en una unica clase `0: symbol`, de modo que la funcion de perdida se concentra en la caja, la DFL y el angulo en lugar de en la clasificacion fina. El objetivo declarado del autor es maximizar el recall, delegando la clasificacion final de los recortes a una segunda etapa posterior.

La arquitectura combina un backbone CSPDarknet de la variante YOLOX-m con un cuello PAFPN y una cabeza OBB de Ultralytics, trabajando a una resolucion de entrada de 640 pixeles. El repositorio ocupa 0,2 GB e incluye el fichero de pesos `best.pt`, consumible directamente con la libreria `ultralytics` mediante `YOLO('best.pt')` y `task='obb'`. El autor indica que el entrenamiento se realizo sin mosaic, mixup, rotacion, shear, perspectiva, flip ni erasing, lo que sugiere un ajuste deliberado para no distorsionar la geometria de los simbolos tecnicos.

La relevancia de esta ficha es acotada pero clara: no es un modelo de lenguaje ni un modelo generalista, sino un componente especializado dentro de un pipeline de digitalizacion de planos. No hay licencia declarada, no hay idiomas declarados y no se han publicado metricas de rendimiento, por lo que cualquier uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-m (backbone CSPDarknet + cuello PAFPN) con cabeza OBB de Ultralytics |
| Parametros totales | no disponible en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 640 x 640 pixeles |
| Tipos de cuantizacion | no disponible; el tag `onnx` sugiere exportacion a ONNX, pero no se documentan precisiones (FP32/FP16/INT8) |
| Idiomas soportados | no disponible (no aplica a vision por computador; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `best.pt` (PyTorch via Ultralytics); tag `onnx` presente en el repositorio |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Tarea | object-detection / OBB (oriented bounding boxes) |
| Numero de clases | 1 (`0: symbol`) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-12 |
| Fecha de ultima actualizacion | 2026-10-12 |
| Descargas | 0 |
| Likes | 0 |
| Augmentation en entrenamiento | ninguna (sin mosaic, mixup, rotacion, shear, perspectiva, flip ni erasing) |

## Arquitectura y entrenamiento

El modelo sigue el diseno YOLOX en su variante m: un backbone CSPDarknet que extrae caracteristicas multi-escala, un cuello PAFPN que fusiona esas escalas y una cabeza de deteccion adaptada a cajas orientadas (OBB) segun la implementacion de Ultralytics. YOLOX es un detector anchor-free con decoupled head, lo que separa las ramas de clasificacion y de regresion; aqui, al reducirse a una sola clase, la rama de clasificacion pierde peso practico y la supervision se concentra en la regresion de caja, la distribucion DFL y el angulo de la caja orientada. La resolucion de trabajo es de 640 pixeles.

La model card no detalla el numero de tokens ni de imagenes de entrenamiento, la composicion del dataset, ni si hubo una fase de ajuste fino con datos sinteticos o reales de planos CAD. Tampoco se documenta el uso de tecnicas como RLHF o DPO, que no aplican a un detector de objetos. La decision tecnica destacable es la ausencia total de augmentation geometrica: al desactivar rotacion, shear, perspectiva, flip y mosaic, el autor evita introducir invariancias que degradarian la prediccion angular de las cajas, algo critico cuando el objetivo es delimitar simbolos con orientacion arbitraria en un plano tecnico. El resultado es un checkpoint de alta especializacion y bajo recall de clases, pensado como primera etapa de un pipeline en cascada.

## Capacidades

- Deteccion de objetos con cajas orientadas (OBB) sobre imagenes de planos CAD a 640 x 640.
- Propuesta de regiones en una sola clase generica (`symbol`), optimizada para recall mas que para precision de clasificacion.
- Prediccion de caja mas angulo, util para simbolos que no estan alineados con los ejes de la imagen.
- Exportacion a ONNX segun los tags del repositorio, lo que permite despliegue en runtimes de inferencia no dependientes de PyTorch.
- Integracion directa con el ecosistema Ultralytics (`YOLO(...)`, `model.predict(..., task='obb')`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente discriminativo de vision.
- No se documentan capacidades multilingues ni de vision-lenguaje.

## Casos de uso

- Digitalizacion de planos CAD: el modelo actua como primera etapa que localiza candidatos de simbolo con su orientacion; una segunda etapa clasifica cada recorte en su categoria real (valvula, interruptor, simbolo electrico, etc.).
- Etiquetado asistido (pre-anotacion): dado su enfasis en recall, sirve para generar propuestas iniciales que un anotador humano revisa en lugar de dibujar cajas desde cero, reduciendo el coste de construir datasets.
- Control de calidad documental: deteccion de simbolos en planos entregados por proveedores para verificar que la simbologia esperada aparece y en las posiciones previstas.
- Extraccion de inventario de componentes: conteo de simbolos por hoja de plano como paso previo a un listado de materiales, asumiendo que la clasificacion fina la aporta la etapa 2.
- Conversion de raster a vector: alimentar las cajas orientadas detectadas a un modulo de reconstruccion para generar entidades vectoriales en el CAD de destino.
- Preprocesado para OCR tecnico: usar las propuestas como regiones de interes para recortar etiquetas y referencias dentro del plano antes de pasarlas a un motor de texto.
- Auditoria de planos historicos: aplicar el detector sobre escaneos antiguos para localizar simbologia y comparar con planos actualizados del mismo emplazamiento.
- Integracion en pipelines industriales de gestion documental (PLM/EDM) donde se procesan lotes de planos en modo batch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall ni ninguna metrica de validacion, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo (unicamente paginas de inicio de buscadores sin contenido relevante).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos en `best.pt` (repositorio de 0,2 GB); el consumo real depende del tamano de lote y de la resolucion de entrada, no documentados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la practica. Para lotes grandes o alta concurrencia, GPU de datacenter tipo NVIDIA A100, H100 o L4/L40S aportan mayor throughput.
- Compatibilidad con GPU de consumo: si, cabe con margen amplio en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, e incluso en iGPU modernas para inferencia puntual.
- CPU: viable para inferencia en modo ONNX Runtime, aunque con latencias muy superiores a GPU.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime dado el tag `onnx`, y exportaciones habituales del ecosistema Ultralytics (TensorRT, OpenVINO). No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones por parte del autor ni datos en la model card.

## Comparativa con modelos similares

No se dispone de datos publicados de este checkpoint (metricas, parametros exactos, licencia) que permitan una comparacion cuantitativa rigurosa. La comparacion siguiente es cualitativa, atendiendo a la categoria de detector OBB de una sola etapa, y los valores de los modelos alternativos corresponden a sus especificaciones publicas, no verificadas contra este checkpoint.

| Modelo | Arquitectura | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yoloX-cad-obb-01 (este) | YOLOX-m + PAFPN + cabeza OBB | 1 (`symbol`) | 640 x 640 | no disponible | HuggingFace, 0 descargas |
| YOLOv8-OBB (familia Ultralytics) | CSPDarknet + C2f + cabeza OBB | configurable (p. ej. DOTA) | configurable, tipicamente 1024 | AGPL-3.0 (con licencia comercial de pago) | repositorio oficial Ultralytics |
| YOLO11-OBB (familia Ultralytics) | backbone C3k2 + cabeza OBB | configurable | configurable | AGPL-3.0 (con licencia comercial de pago) | repositorio oficial Ultralytics |
| RT-DETR (variantes con OBB) | transformer end-to-end | configurable | configurable | Apache-2.0 en variantes de referencia | HuggingFace / repositorios oficiales |

La diferencia principal de este checkpoint no es el rendimiento, sino su proposito: es un detector mono-clase de etapa 1 para un dominio muy concreto (simbologia CAD) y no una solucion generalista de deteccion orientada.

## Limitaciones y advertencias

- No hay licencia declarada. Sin una licencia explicita no se puede asumir permiso de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- No se han publicado metricas de validacion (mAP, recall, precision) ni curvas de entrenamiento; el rendimiento real sobre planos propios es desconocido.
- El modelo es de una sola clase. No distingue tipos de simbolo: cualquier uso que requiera clasificacion exige una segunda etapa, tal y como plantea el autor.
- Esta disenado para maximizar recall, lo que implica previsiblemente un exceso de propuestas falsas positivas. La precision no es el objetivo de este checkpoint.
- Sesgos conocidos: no documentados. Al no describirse el dataset de entrenamiento, se desconoce la representatividad de estilos de plano, normativas, idiomas de rotulacion o fabricantes cubiertos.
- Riesgo de degradacion fuera de dominio: un detector entrenado sin augmentation geometrica puede generalizar peor ante rotaciones severas, oclusiones, ruido de escaneo o cambios de escala no vistos en entrenamiento.
- La ausencia de mosaic, flip y otras augmentaciones reduce la robustez frente a variaciones de contexto que los detectores generalistas suelen absorber; conviene validar especificamente sobre el tipo de plano objetivo.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, lo que apunta a un artefacto sin validacion por parte de la comunidad.
- Los tags incluyen `onnx`, pero no se documenta que artefacto ONNX concreto esta incluido ni su precision numerica; verificar el contenido real del repositorio antes de planificar el despliegue.
- No soporta texto, agentes ni razonamiento; no debe evaluarse con criterios de modelos de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sonspeed/yoloX-cad-obb-01
- Repositorio de Ultralytics (libreria declarada): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics sobre tareas OBB: https://docs.ultralytics.com/tasks/obb/
- Paper original de YOLOX (arquitectura base): https://arxiv.org/abs/2107.08430
- Los resultados de la busqueda web no aportaron enlaces utiles: unicamente paginas de inicio de Google y de Google Mail, sin contenido tecnico relacionado con el modelo.
