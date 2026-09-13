# circulus/resnet50-int8-ov

## Resumen

circulus/resnet50-int8-ov es un artefacto de despliegue, no un modelo entrenado desde cero: se trata de una exportacion a formato OpenVINO IR del checkpoint torchvision/resnet50 (receta IMAGENET1K_V2), cuantizada a INT8 mediante compresion de pesos con NNCF. El resultado es un binario de aproximadamente 25 MB con entrada estatica [1, 3, 224, 224], pensado para ejecutar clasificacion de imagenes sobre las 1000 clases de ImageNet en hardware Intel sin necesidad de GPU dedicada.

El modelo lo publica el usuario circulus como material del curso ARCademy de OpenVINO, concretamente para la leccion "01 Hello image classification", y se genera con el script `convert/convert_all.py` del propio courseware. Su relevancia es, por tanto, didactica y de referencia: muestra el flujo completo de conversion PyTorch → OpenVINO IR → cuantizacion INT8, y sirve como ejemplo reproducible de como comprimir una CNN clasica hasta un tamano que cabe en cualquier equipo.

No es un modelo de lenguaje ni un modelo multimodal generativo: no tiene ventana de contexto, no soporta tool calling y no procesa texto. Es una ResNet-50 convolucional de 50 capas con conexiones residuales, con el preprocesado (redimensionado a 224 y normalizacion ImageNet) delegado al codigo de la leccion, no al grafo del modelo. El repositorio registra 0 descargas y 0 likes, lo que confirma su naturaleza de material de curso mas que de modelo de produccion validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con conexiones residuales (ResNet-50), exportada a OpenVINO IR |
| Parametros totales | Aproximadamente 25,6 M (arquitectura ResNet-50 estandar; no se explicita en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de vision con entrada estatica [1, 3, 224, 224] |
| Tipos de cuantizacion | INT8 mediante compresion de pesos con NNCF; no se mencionan otras variantes |
| Idiomas soportados | No aplica (clasificacion de imagenes en 1000 clases de ImageNet) |
| Licencia | other (heredada del modelo base; ver limitaciones) |
| Formato de pesos | OpenVINO IR (.xml + .bin) |
| Modelo base | torchvision/resnet50 (IMAGENET1K_V2) |
| Tamano declarado | 25 MB (la ficha de HuggingFace reporta 0.0 GB de tamano de repo, dato contradictorio) |
| Entrada | Estatica, [1, 3, 224, 224] |
| Salida | 1000 logits, una clase por categoria de ImageNet |
| Preprocesado | Redimensionado a 224 y normalizacion ImageNet, implementados en el codigo de la leccion |

## Arquitectura y entrenamiento

La arquitectura base es ResNet-50, una red neuronal convolucional de 50 capas organizada en bloques residuales con atajos de identidad, que mitiga el problema de gradiente desvanecido en redes profundas. Los pesos proceden del checkpoint torchvision/resnet50 en su variante IMAGENET1K_V2, es decir, entrenados sobre ImageNet-1K (1000 clases) con la receta mejorada de torchvision. El autor de la ficha no aporta detalles adicionales sobre el entrenamiento: no se documentan numero de tokens o imagenes, composicion exacta del dataset, ni si hubo tecnicas de ajuste fino posteriores.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el pipeline de conversion y compresion: se exporta el grafo a OpenVINO IR y se aplica compresion de pesos INT8 con NNCF (Neural Network Compression Framework). Al tratarse de compresion de pesos, lo habitual es que los pesos queden en INT8 mientras las activaciones se mantienen en precision superior, aunque la model card no especifica el esquema exacto ni si se valido la perdida de precision respecto al modelo FP32 original. La entrada es estatica, lo que permite optimizaciones agresivas de planificacion en el runtime de OpenVINO.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet a partir de una imagen RGB de 224x224.
- Extraccion de caracteristicas visuales (el grafo puede truncarse y reutilizarse como backbone, aunque no se documenta esta practica en la model card).
- Inferencia en CPU Intel, iGPU y, segun la version de OpenVINO, aceleradores NPU compatibles.
- Ejecucion con entrada de lote fijo 1: no soporta batching dinamico tal y como esta exportado.
- Generacion de texto: no soportada.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no aplica.
- Modo thinking, vision generativa, audio: no soportados.

## Casos de uso

- Material didactico de conversion de modelos: sirve como ejemplo cerrado y reproducible del flujo PyTorch → OpenVINO IR → INT8, util en cursos y talleres sobre optimizacion de inferencia.
- Validacion de pipelines de cuantizacion: permite comprobar en minutos si una ruta de compresion NNCF produce un artefacto cargable y con precision aceptable antes de aplicarla a modelos propios.
- Clasificacion de imagenes en el borde: con 25 MB en INT8 cabe en dispositivos con almacenamiento limitado y se ejecuta en CPU sin GPU, adecuado para prototipos de inspeccion visual sencilla.
- Etiquetado automatico de datasets de imagen: preanotar grandes colecciones de fotos con las 1000 clases de ImageNet para despues revisar solo los casos dudosos.
- Filtrado previo en pipelines de vision: actuar como clasificador rapido de primera etapa que descarte o enrute imagenes antes de un modelo mas costoso.
- Test de integracion en CI: al ser un binario pequeno, es util como modelo de humo para verificar que el runtime de OpenVINO, los drivers y el hardware de un equipo funcionan correctamente.
- Benchmark de hardware Intel: medir latencia de inferencia INT8 en CPU, iGPU o NPU para comparar configuraciones de despliegue antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud (top-1 ni top-5) para el modelo cuantizado, ni comparacion con el checkpoint FP32 original, por lo que no es posible cuantificar la perdida de precision introducida por la compresion INT8 ni el rendimiento en latencia o throughput.

## Requisitos de hardware

- VRAM: practicamente nula en el sentido de GPU dedicada; el modelo esta pensado para inferencia en CPU mediante el runtime de OpenVINO.
- Memoria en disco: aproximadamente 25 MB en INT8, segun la model card.
- Memoria RAM: del orden de decenas o pocos cientos de MB incluyendo el runtime y los buffers de activaciones para lote 1; no se especifica en la informacion disponible.
- GPU recomendadas: no aplica; el formato OpenVINO esta orientado a CPU, iGPU integrada y NPU de Intel. No se documenta compatibilidad con CUDA ni con A100/H100.
- GPU consumer: irrelevante para este artefacto; cabe y funciona en cualquier equipo con CPU moderna, incluidos portatiles de gama baja.
- Opciones de despliegue: OpenVINO Runtime (Python, C++ o C), OpenVINO Model Server, o cualquier herramienta que consuma IR; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision en este formato.
- Latencia y throughput: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| circulus/resnet50-int8-ov | Aproximadamente 25,6 M (ResNet-50) | Estatica [1, 3, 224, 224] | INT8 (pesos, NNCF) | other | HuggingFace, 0 descargas |
| torchvision/resnet50 (IMAGENET1K_V2) | Aproximadamente 25,6 M | Estatica [1, 3, 224, 224] | FP32 | BSD-3-Clause (segun el repositorio de torchvision; no confirmado en esta ficha) | PyTorch Hub / torchvision |
| ResNet-18 | Aproximadamente 11,7 M | Estatica [1, 3, 224, 224] | FP32 / INT8 segun export | BSD-3-Clause (torchvision) | torchvision y multiples exports OpenVINO |
| MobileNetV3 | Orden de 2 a 5 M segun variante | Estatica [1, 3, 224, 224] | FP32 / INT8 segun export | BSD-3-Clause (torchvision) | torchvision y multiples exports OpenVINO |

La comparativa relevante es contra el propio checkpoint torchvision/resnet50 sin cuantizar: este artefacto anade el formato OpenVINO IR y la compresion INT8 a cambio de un posible coste de precision que no se documenta. Frente a ResNet-18 o MobileNetV3, la ResNet-50 ofrece mayor capacidad a costa de mas parametros y computo, sin que existan datos publicados en esta ficha para respaldar la comparacion en exactitud.

## Limitaciones y advertencias

- Licencia "other": no se detallan los terminos exactos, por lo que el uso comercial no esta claro sin revisar la licencia del modelo base y del courseware de origen.
- Artefacto didactico: forma parte del material ARCademy de OpenVINO y registra 0 descargas y 0 likes; no ha sido validado por la comunidad ni auditado para produccion.
- Sin evaluacion de la cuantizacion: no se publica la perdida de exactitud top-1 respecto al modelo FP32, un riesgo habitual en compresion INT8 cuando no se valida con un conjunto de calibracion representativo.
- Entrada estatica de lote 1: no admite formas dinamicas ni batching, lo que limita el throughput en despliegues de alto volumen.
- Preprocesado fuera del grafo: el redimensionado a 224 y la normalizacion ImageNet deben replicarse exactamente en el codigo de inferencia; cualquier discrepancia degrada la precision sin aviso.
- Ambito cerrado: solo clasifica las 1000 clases de ImageNet. No hay deteccion de objetos, segmentacion, OCR ni generacion.
- Posible sesgo heredado del dataset: ImageNet-1K presenta desequilibrios conocidos entre categorias y sesgos geograficos y culturales en las imagenes de entrenamiento; el modelo los reproduce.
- Alucinacion en sentido generativo: no aplica, pero si existe riesgo de sobreconfianza, es decir, de asignar una clase con alta probabilidad a imagenes fuera de la distribucion de ImageNet.
- Discrepancia de datos: la model card declara 25 MB, mientras que la ficha de HuggingFace indica 0.0 GB de tamano de repositorio; conviene descargar y verificar el contenido real antes de integrarlo.
- Fechas de publicacion futuras (2026) en los metadatos de HuggingFace, lo que sugiere un repositorio de pruebas o generado automaticamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/circulus/resnet50-int8-ov
- Modelo base en HuggingFace: https://huggingface.co/torchvision/resnet50
- Repositorio de torchvision (checkpoints y recetas de entrenamiento): https://github.com/pytorch/vision
- NNCF, framework de compresion usado para la cuantizacion INT8: https://github.com/openvinotoolkit/nncf
- Documentacion de OpenVINO: https://docs.openvino.ai
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios de resultados deportivos y no guardan relacion con este artefacto.
