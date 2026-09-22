# skillsafe-ai/yolox-s

## Resumen

skillsafe-ai/yolox-s es un artefacto ONNX del detector de objetos YOLOX-s (variante pequena de YOLOX, entrenada sobre COCO a 640 px) publicado por SkillSafe para su ejecucion directamente en el navegador mediante onnxruntime-web con los execution providers WebGPU y WASM. No es un modelo entrenado por SkillSafe: el fichero `yolox_s.onnx` se importa tal cual desde el release `0.1.1rc0` del repositorio oficial de Megvii (YOLOX) y se republica con verificacion reproducible, hash SHA-256 fijado y una receta de conversion documentada. El repositorio contiene un unico fichero de 34,20 MB en formato ONNX, opset 11.

El problema que resuelve es de empaquetado y trazabilidad mas que de modelado: permite desplegar deteccion de objetos en cliente (navegador, sin backend) con un contrato de entrada y salida explicito y verificable. El contrato es `images` float32 `[1, 3, 640, 640]` de entrada y `output` float32 `[1, 8400, 85]` de salida, lo que corresponde a las predicciones crudas del detector (8400 candidatos, 85 valores por candidato: 4 coordenadas de caja, 1 puntuacion de objeto y 80 clases de COCO) antes de decodificacion y supresion de no maximos.

La relevancia actual del repositorio es que sirve como pieza de inferencia ligera para aplicaciones web con requisitos de privacidad (la imagen no sale del dispositivo) y para pipelines de edge. Con 0 descargas y 0 likes en el momento de la consulta y sin resultados de benchmarks publicados en la informacion disponible, se trata de un artefacto reciente y practicamente sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-s (detector de objetos); exportado a ONNX opset 11. El detalle de backbone, cuello y cabeza no se especifica en la model card |
| Parametros totales | no disponible en la informacion proporcionada; el fichero ONNX ocupa 34,20 MB, consistente con un orden de magnitud de ~8,9 millones de parametros si todos los tensores estan en float32 |
| Longitud de contexto | no aplica: modelo de vision no generativo. Entrada fija `images` float32 `[1, 3, 640, 640]` |
| Tipos de cuantizacion | no disponible; se distribuye un unico artefacto en float32 sin variantes int8/fp16 |
| Idiomas soportados | no disponible (no aplica a deteccion de objetos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fichero unico `yolox_s.onnx`, opset 11) |
| Tarea | object-detection (deteccion de objetos sobre las 80 clases de COCO) |
| Salida | `output` float32 `[1, 8400, 85]` |
| Tamano del fichero | 34,20 MB |
| SHA-256 del modelo | `c5c2d13e59ae883e6af3b45daea64af4833a4951c92d116ec270d9ddbe998063` |
| Autor / organizacion | skillsafe-ai |
| Fecha de creacion | 2026-09-22T18:59:43Z |
| Fecha de actualizacion | 2026-09-22T18:59:45Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna ni el proceso de entrenamiento. Lo unico verificable desde el artefacto es el contrato de inferencia: un tensor de entrada RGB normalizado de forma `[1, 3, 640, 640]` y una salida `[1, 8400, 85]`. Esa forma de salida es coherente con un detector de una sola etapa con predicciones densas sobre una piramide de tres escalas (80x80 + 40x40 + 20x20 = 8400 posiciones) y 85 canales por posicion (4 valores de caja, 1 de objectness y 80 clases de COCO). El modelo no aplica supresion de no maximos en el grafo, por lo que la decodificacion y el NMS deben ejecutarse en el cliente.

Respecto al entrenamiento, la informacion disponible solo indica que se trata de un modelo COCO a 640 px importado del release `0.1.1rc0` de YOLOX, sin detallar numero de tokens ni de imagenes, composicion del dataset, aumentos de datos, estrategia de asignacion de etiquetas ni si hubo fases de ajuste fino adicionales: todos esos datos son no disponibles en la informacion proporcionada. La contribucion tecnica del repositorio es la reproducibilidad del empaquetado: receta `recipes/yolox-s.yaml` con SHA-256 `517fe6aaa4b7227358e16a2d3cba2d366c44c2abf5b62a4af14aeedd40899cb4`, cadena de herramientas congelada (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64), manifiesto con fuentes y verificaciones por fichero, y comprobacion de que el ONNX pasa `onnx.checker` y una ejecucion de humo en CPU con entradas rellenas de ceros.

## Capacidades

- Deteccion de objetos en una sola pasada sobre las 80 clases de COCO (persona, vehiculo, animal, mobiliario urbano, utensilios, etc.).
- Inferencia en navegador: la model card incluye un ejemplo de uso con `onnxruntime-web` y los execution providers `webgpu` y `wasm`, lo que permite ejecutar el modelo en el cliente sin backend.
- Ejecucion en CPU: el artefacto pasa una prueba de humo en onnxruntime 1.30.0 en CPU (57,8 ms con entradas a ceros), por lo que es viable en entornos sin GPU.
- Salida compatible con postproceso estandar de detectores one-stage: decodificacion de cajas + NMS a cargo de la aplicacion.
- Integracion como fichero `registry` servido desde el CDN de SkillSafe una vez validado, o descargado directamente desde HuggingFace.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, function calling, agentes, modo de razonamiento, audio ni ninguna capacidad multimodal mas alla de la deteccion de objetos.
- Capacidades multilingues: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Deteccion de objetos en el navegador sin backend: cargando `yolox_s.onnx` con onnxruntime-web en WebGPU o WASM, la inferencia ocurre en el dispositivo del usuario; es adecuado porque el contrato de entrada es fijo y el fichero pesa solo 34,20 MB, lo que se descarga una vez y se cachea.
- Privacidad por diseno en tratamiento de imagenes: aplicaciones medicas, de seguridad o de RRHH donde la fotografia no puede salir del equipo del usuario; 640x640 de entrada y salida cruda permiten todo el postproceso en cliente.
- Moderacion de contenido en subidas web: prefiltrar imagenes antes de enviarlas al servidor, detectando clases de COCO relevantes (persona, objetos) y descartando o marcando el resto antes de la subida.
- Etiquetado asistido y preanotacion de datasets: generar cajas candidatas para acelerar el etiquetado manual, aplicando NMS y un umbral de confianza agresivo; el modelo ya esta en un formato consumible por herramientas ONNX.
- Vision embebida y edge: con 34,20 MB de pesos y menos de 60 ms por imagen en CPU, es viable en mini-PC, Raspberry Pi o dispositivos con acelerador ligero, ejecutando onnxruntime nativo.
- Analitica de video en tiempo casi real a baja resolucion: conteo o presencia por clase sobre fotogramas redimensionados a 640x640, aceptando la perdida de precision en objetos pequenos.
- Verificacion de pipelines y CI: usar el hash SHA-256 y la tabla de verificacion como prueba de regresion para asegurar que la exportacion ONNX mantiene entrada, salida y comportamiento basico.
- Prototipos de robotica o automatizacion industrial de bajo coste: deteccion de piezas u obstaculos con un modelo sin dependencias de frameworks pesados, al ser un ONNX puro.
- Accesibilidad: descripcion de escenas en aplicaciones web mediante la lista de clases detectadas, sin enviar imagenes a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible: la model card no incluye mAP, AP50, latencia en GPU ni comparaciones con otros detectores. Lo unico aportado es una tabla de verificacion funcional, que no constituye un benchmark de precision:

| Fichero | Entradas | Salidas | Tiempo |
|---|---|---|---|
| `yolox_s.onnx` | `images[1, 3, 640, 640]` | `output[1, 8400, 85]` | 57,8 ms |

El tiempo de 57,8 ms corresponde a una ejecucion de humo en CPU (onnxruntime 1.30.0, Darwin 25.6.0 arm64) con entradas rellenas de ceros, no a una medida de latencia representativa con imagenes reales, ni en WebGPU, ni en GPU dedicada.

## Requisitos de hardware

- VRAM para inferencia: los pesos en float32 ocupan 34,20 MB; con activaciones de una unica imagen de 640x640 el pico de memoria es de unos pocos cientos de MB, muy por debajo de cualquier GPU moderna.
- GPU recomendadas: no requiere GPU de数据中心; funciona correctamente en GPUs de consumo. Cualquier GPU con soporte WebGPU (por ejemplo, generaciones recientes de NVIDIA, AMD o Apple Silicon) es suficiente. A100, H100 o RTX 4090 estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 2 GB o mas de memoria, y tambien en iGPU mediante WASM o WebGPU.
- CPU: viable. La model card reporta 57,8 ms por inferencia en CPU arm64 con onnxruntime 1.30.0.
- Movil y navegador: si; el artefacto esta pensado para onnxruntime-web con los execution providers `webgpu` y `wasm`.
- Opciones de despliegue: onnxruntime-web en navegador (documentado en la model card), onnxruntime nativo (CPU/GPU) y cualquier runtime compatible con ONNX opset 11. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: solo se conoce el dato de 57,8 ms por imagen en CPU del test de humo; no hay datos de throughput por lote, ni de latencia en WebGPU, ni con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / salida | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| skillsafe-ai/yolox-s | no disponible (ONNX de 34,20 MB) | `[1, 3, 640, 640]` | `[1, 8400, 85]` | sin benchmark publicado; 57,8 ms en CPU (test de humo) | Apache-2.0 | HuggingFace, formato ONNX |
| YOLOX-s upstream (`0.1.1rc0`) | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | GitHub releases de Megvii |
| Otros detectores one-stage de la misma categoria (por ejemplo, variantes pequenas de la familia YOLO) | no disponible | no disponible | no disponible | no disponible | variable segun proyecto | variable |

No se dispone de cifras verificables de precision ni de latencia para los modelos comparables dentro de la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible. La diferencia objetiva de este repositorio frente al ONNX original de Megvii no es el rendimiento, sino el empaquetado: hash fijado, receta reproducible, manifiesto de verificacion y ejemplo de uso en navegador.

## Limitaciones y advertencias

- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta; el artefacto es de publicacion muy reciente (2026-09-22).
- Sin metricas de precision: no hay mAP ni AP50 publicados en la informacion disponible, por lo que no se puede estimar la calidad real de deteccion de este artefacto concreto.
- Salida cruda: el contrato `[1, 8400, 85]` implica que la aplicacion debe implementar decodificacion de cajas y NMS; omitir ese postproceso produce detecciones duplicadas y sin umbral.
- Entrada rigida: 640x640 fijo; cualquier imagen debe redimensionarse (idealmente con letterbox) antes de la inferencia, lo que puede degradar objetos muy pequenos o deformar la geometria si no se conserva la relacion de aspecto.
- Sesgos: no hay informacion sobre composicion del dataset de entrenamiento ni analisis de sesgos. COCO es un dataset con distribucion de clases y geografias desequilibrada, de modo que el rendimiento esperable es desigual entre categorias y contextos.
- Falsos positivos: en deteccion, el modo de fallo equivalente a la alucinacion son cajas espurias; se debe calibrar el umbral de confianza y el IoU de NMS por aplicacion.
- Ambito cerrado a 80 clases de COCO: no detecta categorias fuera de ese conjunto y no admite texto, tool calling, agentes ni multi-step reasoning.
- Cuantizacion: no se ofrecen variantes int8 o fp16; reducir el tamano exigiria recalibrar y validar por cuenta propia, con riesgo de perdida de precision no medida.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar el aviso de copyright de Megvii Inc. y la licencia del proyecto YOLOX. La receta de conversion y la model card tienen su propia licencia dentro del repositorio de SkillSafe.
- Ambiguedad documental: la cabecera indica que los artefactos los produce el conversor de SkillSafe, mientras que la seccion de verificacion afirma que el ONNX se importo "as published upstream (no conversion)". Conviene tratarlo como un import directo del release oficial.
- Entrenamiento no documentado: sin informacion sobre datos, epocas, aumentos ni ajuste fino, no es posible reproducir el entrenamiento ni auditar la procedencia de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/yolox-s
- Fichero ONNX directo: https://huggingface.co/skillsafe-ai/yolox-s/resolve/main/yolox_s.onnx
- Fuente upstream del ONNX (release 0.1.1rc0): https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.onnx
- Repositorio oficial de YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Licencia Apache-2.0 de YOLOX: https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE
- Recetas y conversor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- onnxruntime-web: referenciado en la model card como dependencia de ejecucion del ejemplo en navegador; no se proporciona URL en la informacion disponible.
- Resultados de busqueda web: los enlaces recuperados (foros de Roblox sobre herramientas de scripting, fondos de avatar y Fast Flags) no guardan relacion con este modelo y no se incluyen como referencias.
