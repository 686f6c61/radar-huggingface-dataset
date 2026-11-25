# softandsweet/ultralytics-assets-rngd-fxbex

## Resumen

YOLO26n · RNGD es un artefacto de despliegue derivado de Ultralytics YOLO26n, un detector de objetos de la familia YOLO orientado a la deteccion de las 80 clases del conjunto COCO (personas, vehiculos, animales, objetos cotidianos). Lo publica el usuario `softandsweet` en Hugging Face y no es un modelo entrenado desde cero: el autor declara explicitamente que parte del fichero `yolo26n.onnx` publicado en el repositorio oficial `ultralytics/assets` (tag v8.4.0), con un SHA-256 concreto, y que no emplea otros checkpoints de Hugging Face.

La particularidad del artefacto es su orientacion a la NPU RNGD (Furiosa) y a la validacion de compilacion: segun la model card, la red neuronal y la cabeza de ranking sin NMS se ejecutan en la NPU, mientras que el preprocesado de imagen y el filtrado de puntuaciones permanecen en CPU. El modelo trabaja sobre un recorte central fijo de 640x640 px y la salida de detecciones se expresa en coordenadas de ese recorte, no de la imagen original.

Es relevante ahora como ejemplo de "port funcional" para verificar compatibilidad de NPU y detectar regresiones de compilacion, no como modelo de produccion de alto rendimiento. El propio autor advierte de que es mas lento que la referencia en CPU (warm de 0,979-0,981 s y aproximadamente 1,02 s por peticion HTTP, frente a unos 0,079 s de referencia en CPU) y de que no reclama ninguna aceleracion. La licencia es AGPL-3.0 y el repositorio incluye el ONNX original, fuentes de recompilacion, pesos y muestras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de deteccion de objetos tipo YOLO (cabecera de ranking sin NMS), exportada a ONNX y compilada para NPU RNGD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 640x640 px con recorte central) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase son las 80 de COCO) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (origen) y artefactos compilados para NPU RNGD; el repositorio incluye pesos, fuentes de recompilacion y muestras |

## Arquitectura y entrenamiento

Se trata de un detector YOLO de la generacion YOLO26 en su variante "n" (nano), segun la nomenclatura del fichero de origen `yolo26n.onnx`. La arquitectura combina una red troncal y de cuello de tipo CNN con una cabeza de deteccion sin NMS (NMS-free), es decir, que produce directamente las detecciones finales mediante una cabeza de ranking en lugar de aplicar supresion no maxima posterior. El artefacto publicado no incluye informacion sobre el numero de parametros, la composicion del dataset de entrenamiento ni el proceso de ajuste (no hay datos de RLHF, DPO ni similares, algo esperable en un detector).

El autor no ha entrenado el modelo: lo ha exportado a ONNX desde el release oficial v8.4.0 de `ultralytics/assets` y lo ha portado a la NPU RNGD, manteniendo el preprocesado y el filtrado de puntuaciones en CPU. La innovacion tecnica del artefacto es, por tanto, de despliegue: particion del grafo entre NPU y CPU, compilacion del grafo neuronal para la NPU y verificacion de que no se produce ninguna caida a CPU ni recompilacion en tiempo de ejecucion (el autor reporta 0 casos de fallback a CPU y 0 recompilaciones, con 8557 pasos de NPU verificados sobre imagenes originales y volteadas). El modelo opera con un recorte central fijo de 640x640 px, lo que condiciona la interpretacion de las coordenadas de salida.

## Capacidades

- Deteccion de objetos en imagenes para las 80 clases de COCO (personas, vehiculos, animales, mobiliario, utensilios, etc.), con posicion y puntuacion por deteccion.
- Deteccion sin NMS: la cabeza de ranking genera las detecciones finales sin postprocesado de supresion no maxima en el grafo neuronal.
- Ejecucion hibrida NPU/CPU: la red y la cabeza de ranking corren en la NPU RNGD; el preprocesado de imagen (recorte central a 640x640) y el filtrado por puntuacion corren en CPU.
- Verificacion de compilacion: el artefacto esta pensado para comprobar que el grafo compila y se ejecuta integramente en la NPU sin recompilaciones ni fallback.
- Entrada de imagen fija: recorte central de 640x640 px; las coordenadas de salida son relativas a ese recorte.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, agentes ni capacidades multilingues; es exclusivamente un detector de objetos.

## Casos de uso

- Verificacion de compatibilidad de NPU en CI: ejecutar el artefacto en un pipeline de integracion continua para comprobar que el grafo YOLO26n compila y se ejecuta en la NPU RNGD sin fallback a CPU ni recompilaciones, usando los 8557 pasos de NPU y las imagenes originales y volteadas como referencia de regresion.
- Deteccion de regresiones de compilacion: comparar los resultados del artefacto contra el ONNX original en CPU para detectar cambios de comportamiento introducidos por nuevas versiones del compilador o del runtime de la NPU.
- Pruebas de humo de extremo a extremo con servidor HTTP: el autor documenta un ejemplo de servicio con latencia de aproximadamente 1,02 s por peticion, util para validar el camino completo imagen -> preprocesado CPU -> NPU -> filtrado CPU -> respuesta.
- Deteccion de objetos en imagenes con recorte central: para imagenes donde el sujeto de interes esta centrado, el recorte fijo de 640x640 permite localizar personas, vehiculos u objetos COCO con sus puntuaciones, aceptando la limitacion de que las coordenadas son relativas al recorte.
- Banco de pruebas de particion NPU/CPU: medir el coste de mantener el preprocesado y el filtrado en CPU frente a moverlos a la NPU, y evaluar el impacto de reducir el numero de llamadas detalladas a la NPU (el autor senala esta optimizacion como pendiente).
- Validacion de licencia y trazabilidad: el repositorio incluye el ONNX original, su SHA-256, las fuentes de recompilacion, los pesos y las muestras, lo que permite auditar la procedencia del artefacto y reproducir la build bajo AGPL-3.0 en entornos de cumplimiento.
- Referencia para portar otros modelos Ultralytics a RNGD: el patron de particion (red y cabeza en NPU, preprocesado y filtrado en CPU) sirve de plantilla para portar otras variantes de la familia YOLO26.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta mediciones de latencia del propio artefacto: warm de 0,979-0,981 s, aproximadamente 1,02 s por peticion HTTP, frente a una referencia en CPU de aproximadamente 0,079 s. El autor indica que el artefacto es mas lento que la referencia en CPU y que no reclama aceleracion.

| Metrica | Valor reportado |
|---|---|
| Latencia warm | 0,979-0,981 s |
| Latencia por peticion HTTP | aproximadamente 1,02 s |
| Referencia en CPU (almacenada) | aproximadamente 0,079 s |
| Pasos de NPU verificados | 8557 |
| Fallback a CPU / recompilaciones | 0 / 0 |
| Precisión (mAP, etc.) | no disponible |

## Requisitos de hardware

- NPU RNGD (Furiosa) para la ejecucion del grafo neuronal y la cabeza de ranking; el artefacto esta disenado y verificado para esta NPU.
- CPU para el preprocesado de imagen (recorte central 640x640) y el filtrado de puntuaciones.
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero no se detalla el reparto de memoria entre NPU y CPU ni el consumo real.
- GPU recomendadas: no aplica; el artefacto esta orientado a NPU RNGD, no a GPU. No se proporcionan recomendaciones de A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecucion en GPU.
- Opciones de despliegue: runtime de la NPU RNGD con el grafo compilado; el autor incluye un ejemplo de servicio HTTP (ver `USAGE.md`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: warm de 0,979-0,981 s y aproximadamente 1,02 s por peticion HTTP; no se reporta throughput agregado ni latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26n · RNGD (este artefacto) | no disponible | recorte central fijo 640x640 px | warm 0,979-0,981 s; HTTP aprox. 1,02 s; sin datos de mAP | AGPL-3.0 | Hugging Face (`softandsweet/ultralytics-assets-rngd-fxbex`) |
| YOLO26n (ONNX original, Ultralytics) | no disponible | entrada de imagen estandar del modelo | referencia en CPU aprox. 0,079 s (segun la model card); sin datos de mAP en la informacion disponible | AGPL-3.0 | GitHub `ultralytics/assets` v8.4.0 |
| Otros detectores COCO de la familia YOLO | no disponible | no disponible | no disponible | habitualmente AGPL-3.0 en Ultralytics | no disponible |

No se dispone de datos de benchmarks (mAP, latencia comparable) de alternativas en la informacion proporcionada, por lo que la comparativa se limita a procedencia, licencia y latencia declarada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un port de `yolo26n.onnx` del release oficial v8.4.0 de `ultralytics/assets`, con SHA-256 declarado; cualquier cambio en el ONNX de origen invalida la trazabilidad.
- Rendimiento inferior a la referencia en CPU: el autor reporta 0,979-0,981 s en warm y aproximadamente 1,02 s por peticion HTTP, frente a unos 0,079 s de referencia en CPU; no se reclama aceleracion.
- Optimizacion pendiente: el autor senala que queda trabajo para reducir el gran numero de llamadas detalladas a la NPU.
- Coordenadas relativas al recorte: las detecciones se expresan sobre un recorte central fijo de 640x640 px, no sobre la imagen original completa; objetos fuera del recorte central no se detectan.
- Sin datos de precision: no se publican mAP ni metricas de calidad de deteccion en la informacion disponible, por lo que no se puede evaluar la fidelidad respecto al modelo original.
- Sin datos de cuantizacion ni de consumo de memoria: no se detalla el tipo de cuantizacion aplicada ni el uso de VRAM/NPU.
- Dependencia de hardware especifico: el artefacto esta verificado para la NPU RNGD (Furiosa); no se documenta su ejecucion en GPU ni en CPU de forma general.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software distribuido y modificado; conviene revisar el cumplimiento antes de un uso comercial o de ofrecer el modelo como servicio en red.
- Artefacto con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.
- Sin informacion sobre sesgos: no se documentan sesgos del dataset COCO ni del proceso de entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softandsweet/ultralytics-assets-rngd-fxbex
- Ejemplo de ejecucion y servicio (`USAGE.md`): https://huggingface.co/softandsweet/ultralytics-assets-rngd-fxbex/blob/main/USAGE.md
- Resultados de validacion (`VALIDATION.json`): https://huggingface.co/softandsweet/ultralytics-assets-rngd-fxbex/blob/main/VALIDATION.json
- Origen y SHA (`SOURCE.json`): https://huggingface.co/softandsweet/ultralytics-assets-rngd-fxbex/blob/main/SOURCE.json
- Release oficial del ONNX de origen: https://github.com/ultralytics/assets/releases/tag/v8.4.0
