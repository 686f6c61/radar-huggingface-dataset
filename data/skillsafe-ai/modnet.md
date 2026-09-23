# skillsafe-ai/modnet

## Resumen

`skillsafe-ai/modnet` es un paquete de artefactos ONNX listos para ejecutarse en navegador, orientado a la extraccion de la mascara alfa de retratos (portrait matting). No es un modelo de lenguaje ni un modelo generativo: recibe una imagen RGB en formato float32 con forma `[batch_size, 3, height, width]` y devuelve una mascara de un solo canal `[batch_size, 1, height, width]` que separa a la persona del fondo. El repositorio lo publica SkillSafe como parte de su catalogo de artefactos reproducibles para aplicaciones web.

El modelo es un reempaquetado del export ONNX de Xenova (`Xenova/modnet`, commit fijado `fa2fa546052fba4c08921230a26cc69a333fca12`), que a su vez envuelve el modelo MODNet de Zhanghan Ke y colaboradores (City University of Hong Kong), publicado bajo licencia Apache-2.0. En este repositorio no se ha realizado ninguna conversion adicional: los pesos se importan tal cual se publicaron, y cada fichero queda fijado por hash SHA-256 junto con la receta y el toolchain empleados.

Su relevancia practica esta en el escenario de despliegue: al ser un ONNX de 12,38 MB en fp16, se puede ejecutar integramente en el cliente con `onnxruntime-web` (WebGPU o WASM), sin enviar fotogramas a un servidor. La verificacion declarada por el autor registra 53,6 ms por inferencia sobre una entrada 512x512 en CPU (Darwin arm64), lo que lo situa en el rango de la videollamada en tiempo real para resoluciones bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional para matting de retratos (MODNet); grafo ONNX unico, opset 11 |
| Parametros totales | no disponible (el fichero fp16 ocupa 12,38 MB, lo que situa el orden de magnitud en unos 6 millones de parametros; estimacion a partir del tamano del fichero, no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | fp16 (unico artefacto ONNX incluido); no se distribuyen variantes int8, uint8 ni Q4 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`), acompanado de `config.json` y `preprocessor_config.json` |
| Entrada | `input` float32 `['batch_size', 3, 'height', 'width']` |
| Salida | `output` float32 `['batch_size', 1, 'height', 'width']` |
| Resolucion de referencia | 512x512 |
| Tamano del fichero ONNX | 12,38 MB |
| Modelo base | `Xenova/modnet` (commit `fa2fa546052fba4c08921230a26cc69a333fca12`) |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio contiene un unico grafo ONNX en precision fp16, con entrada `input` de tipo float32 y forma dinamica `['batch_size', 3, 'height', 'width']`, y salida `output` tambien float32 de forma `['batch_size', 1, 'height', 'width']`. El modelo subyacente es MODNet, una red de matting de retratos sin trimapa desarrollada por Zhanghan Ke y colaboradores en la City University of Hong Kong; el export ONNX original corresponde a Xenova. El repositorio declara explicitamente que los artefactos se importan "as published upstream (no conversion)", de modo que no hay destilacion, poda ni reentrenamiento en este paso.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes utilizadas, ni sobre tecnicas de ajuste tipo RLHF o DPO: esos datos **no estan disponibles** en la informacion proporcionada y corresponderian a la documentacion del proyecto MODNet original, no a este repositorio. Lo que si documenta la model card es el proceso de verificacion: cada fichero ONNX paso el comprobador `onnx.checker` y una prueba de humo en CPU con `onnxruntime` usando entradas rellenas de ceros y las formas declaradas, con un tiempo de 53,6 ms. El toolchain registrado es Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64.

## Capacidades

- Estimacion de la mascara alfa de un retrato (matting) a partir de una imagen RGB, con salida de un canal en coma flotante.
- Procesamiento por lotes: la dimension de batch es dinamica, por lo que admite varias imagenes en una misma llamada si la memoria lo permite.
- Resolucion variable: las dimensiones de alto y ancho son dinamicas en el grafo, con 512x512 como resolucion de referencia de la prueba de humo.
- Ejecucion en el navegador mediante `onnxruntime-web`, con `executionProviders: ["webgpu", "wasm"]`, lo que permite inferencia local sin backend.
- Ejecucion en Python, C++ y otros entornos compatibles con ONNX Runtime, ya que el artefacto es un ONNX estandar de opset 11.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No procesa audio ni video de forma nativa: el matting de video requiere invocar el modelo fotograma a fotograma e imponer consistencia temporal en la capa de aplicacion.
- No incluye modo "thinking", vision-lenguaje ni ninguna capacidad generativa.

## Casos de uso

- **Sustitucion de fondo en videollamadas dentro del navegador**: el modelo se carga una vez con `onnxruntime-web` y se ejecuta sobre cada fotograma capturado con `getUserMedia`. Al devolver una mascara alfa de 512x512 en decenas de milisegundos, el fondo puede sustituirse o desenfocarse sin que el video salga del dispositivo del usuario, lo que evita costes de servidor y problemas de privacidad.
- **Editor de fotos web con recorte de retrato**: una aplicacion tipo "quitar fondo" puede aplicar el modelo sobre la imagen cargada, componer el retrato sobre un color plano o una plantilla y exportar el resultado. El preprocesado debe replicar el definido en `preprocessor_config.json` para mantener la coherencia con el entrenamiento.
- **Generacion de avatares y fotos de perfil**: plataformas de RRHH o de comunidad que necesitan recortes uniformes de personas pueden generar la mascara alfa y componer al sujeto sobre un fondo corporativo, todo en el cliente.
- **Preprocesado en pipelines de creacion de contenido**: generacion de miniaturas, stickers o portadas donde el sujeto debe extraerse automaticamente. El matting se ejecuta como primer paso y el refinado de bordes o la composicion queda en manos de las herramientas de diseno.
- **Anonimizacion en captura de video**: en aplicaciones que graban camara web, la mascara permite desenfocar al sujeto o al fondo de forma selectiva antes de almacenar el fotograma, util en entornos con requisitos de privacidad.
- **E-commerce y catalogos de producto**: extraccion del modelo o del cliente de una fotografia para colocarlo sobre fondos de catalogo normalizados. El modelo se puede ejecutar en lote sobre las imagenes subidas, aprovechando la dimension de batch dinamica.
- **Filtros y efectos en tiempo real en el navegador**: aplicaciones de realidad aumentada ligera donde el retrato se separa del fondo para aplicar efectos, siempre que la resolucion se mantenga en el entorno de 512x512 para no comprometer la latencia.
- **Preprocesado de datasets de vision**: generacion masiva de mascaras alfa para entrenar o evaluar otros modelos de segmentacion, composicion o generacion de imagenes, ejecutando el ONNX en CPU sobre grandes volumenes de fotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de matting (tipo SAD, MSE, Grad o Conn) ni comparaciones con otros modelos sobre conjuntos como DAVIS o el conjunto de retratos de MODNet.

El unico dato de rendimiento documentado es la prueba de humo de verificacion, que no constituye un benchmark de calidad:

| Comprobacion | Entrada | Salida | Tiempo |
|---|---|---|---|
| `onnx/model_fp16.onnx` con `onnxruntime` en CPU | `input[1, 3, 512, 512]` con ceros | `output[1, 1, 512, 512]` | 53,6 ms |

Hardware y software de esa medicion: Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64. Los datos de entrada son ceros, por lo que el tiempo mide coste de computo, no calidad de resultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con un fichero de pesos de 12,38 MB en fp16, el modelo y las activaciones de una imagen 512x512 deberian caber en el orden de decenas de megabytes, pero el autor no publica cifras de consumo.
- GPU recomendadas: no disponibles. Al tratarse de un modelo convolucional de ~12 MB, cualquier GPU con soporte de WebGPU o CUDA deberia ser mas que suficiente; no se justifica el uso de A100 o H100 para inferencia de este modelo.
- Compatibilidad con GPU de consumo: si. El modelo esta pensado para ejecutarse en navegador con WebGPU, lo que incluye GPU integradas y tarjetas de gama de entrada. Tambien funciona en CPU pura, como demuestra la prueba de humo.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) en el navegador; ONNX Runtime en Python, C++, C# o Java en servidor y escritorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son runners de modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: 53,6 ms por inferencia 512x512x1 en CPU (Darwin arm64) segun la verificacion del autor. No hay datos de throughput en lote, de latencia en GPU ni de rendimiento en WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/modnet` (este repositorio) | no disponible (fichero fp16 de 12,38 MB) | Imagen RGB `[b,3,H,W]` a mascara alfa `[b,1,H,W]` | ONNX opset 11, fp16 | Apache-2.0 | HuggingFace, listo para `onnxruntime-web` |
| `Xenova/modnet` (modelo base) | no disponible | Imagen RGB a mascara alfa | ONNX (export de referencia) | Apache-2.0 | HuggingFace; es el origen directo de este repositorio |
| MODNet original (`ZHKKKe/MODNet`) | no disponible | Imagen RGB a mascara alfa | Pesos PyTorch | Apache-2.0 (segun la model card) | GitHub del proyecto original; requiere conversion a ONNX para navegador |
| Otras soluciones de matting de retratos (por ejemplo, variantes de matting para video en tiempo real) | no disponible | no disponible | no disponible | no disponible (verificar antes de uso comercial) | no disponible |

En la informacion proporcionada solo se detallan los datos del repositorio y de su modelo base inmediato. Las cifras del MODNet original y de alternativas como los modelos de matting para video no se han facilitado, por lo que se marcan como no disponibles en lugar de estimarlas.

## Limitaciones y advertencias

- No se han publicado metricas de calidad (SAD, MSE, Grad, Conn) en la informacion disponible; la unica verificacion es una prueba de humo con entradas de ceros que no evalua la calidad del matting.
- El repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- El pipeline de HuggingFace no esta declarado, lo que dificulta el uso mediante las abstracciones de alto nivel de la libreria `transformers`.
- El preprocesado es critico: la model card solo remite a `preprocessor_config.json`, y no describe la normalizacion, el redimensionado ni el recorte aplicados. Ignorarlos degradara la mascara.
- El matting de retratos es sensible a condiciones adversas: iluminacion muy dura, fondos con colores similares a la piel, pelo con mucho detalle o movimiento rapido suelen producir bordes imperfectos y requieren refinado posterior o filtrado temporal.
- Para video, el modelo es puramente por fotograma: no hay memoria temporal, por lo que pueden aparecer parpadeos en la mascara que la aplicacion debe suavizar.
- No procesa texto: no hay idiomas soportados ni capacidades multilingues que evaluar.
- Riesgo de alucinacion no aplica en el sentido generativo (no inventa contenido), pero si existe el riesgo de segmentar incorrectamente cuando la escena se aleja del dominio de retratos.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de copyright y licencia. La model card indica que los pesos mantienen la licencia del proyecto original (`ZHKKKe/MODNet`) y que la receta de conversion y la propia model card quedan bajo la licencia del repositorio de SkillSafe (`https://github.com/ZHKKKe/MODNet/blob/master/LICENSE`).
- Las fechas declaradas de creacion y actualizacion del repositorio (2026-09-22) conviene verificarlas antes de fijar la dependencia en produccion, igual que el hash SHA-256 de cada fichero.
- El atributo `region:us` y el tag `import` indican que se trata de un artefacto derivado, no de un modelo entrenado por `skillsafe-ai`; cualquier incidencia de calidad debe reportarse al proyecto MODNet o al export de Xenova.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/modnet
- Modelo base en HuggingFace: https://huggingface.co/Xenova/modnet
- Commit exacto del modelo base: https://huggingface.co/Xenova/modnet/tree/fa2fa546052fba4c08921230a26cc69a333fca12
- Repositorio del proyecto MODNet (autores originales): https://github.com/ZHKKKe/MODNet
- Licencia del proyecto MODNet: https://github.com/ZHKKKe/MODNet/blob/master/LICENSE
- Receta de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Documentacion de `onnxruntime-web`: https://onnxruntime.ai/docs/tutorials/web/

Nota: los resultados de busqueda web proporcionados corresponden a sitios alemanes de caracter comercial (fontaneria, banca y guia telefonica) y no guardan relacion con el modelo, por lo que no se incluyen como enlaces relevantes.
