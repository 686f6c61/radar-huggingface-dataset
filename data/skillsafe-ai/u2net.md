# skillsafe-ai/u2net

## Resumen

U^2-Net (skillsafe-ai/u2net) es un artefacto ONNX listo para navegador que implementa el modelo U^2-Net de deteccion de objetos salientes y eliminacion de fondo. No es un modelo entrenado por SkillSafe: es una importacion reproducible del `u2net.onnx` publicado por rembg (v0.0.0), verificada byte a byte con SHA-256 y empaquetada sin ninguna conversion ni edicion manual. El repositorio ocupa 0,2 GB y contiene un unico archivo de pesos de 167,84 MB.

El interes practico del modelo es que resuelve una tarea de vision concreta (generar una mascara de primer plano a partir de una imagen RGB) con un contrato de entrada y salida perfectamente definido y estable: entrada `input.1` float32 `[1, 3, 320, 320]` y siete salidas float32 `[1, 1, 320, 320]`, con opset 11 y ejecucion verificada tanto en CPU con onnxruntime como en navegador mediante onnxruntime-web con los execution providers `webgpu` y `wasm`.

Su relevancia actual viene de dos factores. Primero, la licencia Apache-2.0 de los pesos originales permite uso comercial y modificacion con atribucion. Segundo, al estar publicado como ONNX puro y con verificacion `onnx.checker` documentada, se puede desplegar indistintamente en servidor (onnxruntime, rembg) o directamente en el cliente sin enviar las imagenes a un tercero, algo critico para aplicaciones que procesan fotografias personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U^2-Net, red encoder-decoder convolucional con estructura U anidada de dos niveles (bloques RSU). Modelo de vision, no transformer ni MoE |
| Parametros totales | no disponible (no declarados; el unico artefacto ONNX en fp32 pesa 167,84 MB, lo que situa el orden de magnitud en torno a 44 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 320x320 pixeles (tensor `[1, 3, 320, 320]`) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye el grafo ONNX en fp32. No se publican variantes int8, fp16 ni cuantizaciones dinamicas |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje natural) |
| Licencia | Apache-2.0 (pesos originales de U^2-Net); el ONNX distribuido por rembg es MIT; la receta y la model card pertenecen al repositorio de SkillSafe |
| Formato de pesos | ONNX, opset 11, archivo unico `u2net.onnx`, SHA-256 `8d10d2f3bb75ae3b6d527c77944fc5e7dcd94b29809d47a739a7a728a912b491` |
| Tarea | Segmentacion de objeto saliente / eliminacion de fondo (`background-removal`) |
| Entradas | `input.1` float32 `[1, 3, 320, 320]` |
| Salidas | 7 tensores float32 `[1, 1, 320, 320]` (`1959`, `1960`, `1961`, `1962`, `1963`, `1964`, `1965`), todos con activacion sigmoide |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

U^2-Net es una red totalmente convolucional con una estructura en U de dos niveles anidados. El nivel externo es un encoder-decoder clasico de 11 etapas (seis de codificacion y cinco de decodificacion) y el nivel interno lo forman bloques RSU (Residual U-blocks) que repiten el patron residual en U a distintas escalas dentro de cada etapa. Este diseno permite capturar contexto global y detalles de alta resolucion sin depender de una backbone preentrenada en ImageNet.

El artefacto distribuido expone exactamente esa estructura mediante siete cabezales de salida a resolucion 320x320: seis salidas laterales procedentes de las etapas de decodificacion y una salida fusionada (`1959`). En el uso habitual de eliminacion de fondo solo se consume la primera salida, que es la mascara de probabilidad final. Los pesos no se han entrenado en este repositorio: se importan tal cual desde la release v0.0.0 de rembg y se verifican con `onnx.checker` y una ejecucion de humo en CPU con entradas rellenas de ceros. La receta de conversion (`recipes/u2net.yaml`, SHA-256 `7e8f815db7a9b8797008d8de0d9ef3bc1a1976d5d06914cea8430ae1d0e10441`) y el `manifest.json` registran el toolchain completo (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64), de modo que el artefacto es reconstruible byte a byte.

No se dispone de informacion en la documentacion facilitada sobre el dataset de entrenamiento original, el numero de imagenes, el numero de tokens o pasos, ni sobre si hubo ajuste fino con RLHF o DPO. Tampoco se documenta ninguna tecnica de decodificacion especulativa ni mecanismo de atencion lineal: es una CNN pura.

## Capacidades

- Segmentacion de objeto saliente: genera una mascara de probabilidad binaria por pixel a partir de una imagen RGB de 320x320, util como mascara alfa para recorte.
- Eliminacion de fondo en el navegador: el modelo esta pensado para ejecutarse con `onnxruntime-web` usando `webgpu` como primer execution provider y `wasm` como respaldo, sin backend propio.
- Inferencia en servidor: al ser ONNX estandar, se puede ejecutar con onnxruntime en CPU, CUDA, TensorRT o DirectML, y con herramientas que ya lo consumen como rembg.
- Salidas multiescala: los siete cabezales permiten, si se desea, combinar o inspeccionar mapas intermedios a la misma resolucion 320x320.
- Integracion en pipelines: el contrato de entrada y salida es fijo y versionado, lo que facilita su uso dentro de grafos de procesamiento de imagen.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision multimodal, audio ni modo de pensamiento. Es exclusivamente un modelo de segmentacion.

## Casos de uso

- Eliminacion de fondo en el cliente: la aplicacion carga el ONNX desde `models.skillsafe.ai` y ejecuta la inferencia con WebGPU, de modo que la imagen del usuario nunca sale del navegador. Es el escenario para el que el artefacto esta explicitamente preparado.
- Catalogos de comercio electronico: recorte automatico de fotografias de producto para generar imagenes con fondo blanco o transparente de forma masiva, usando la mascara de 320x320 y un posterior refinado en alta resolucion.
- Edicion fotografica y herramientas de diseno: generacion de una capa alfa previa a operaciones de composicion, sustitucion de cielo o revelado selectivo, aprovechando que la mascara se obtiene en una sola pasada.
- Videollamadas y avatares: segmentacion por fotograma para difuminar o sustituir el fondo en tiempo real, con el modelo ejecutandose en local para evitar latencia de red y problemas de privacidad.
- Preprocesado para otros modelos: la mascara sirve como entrada de modelos de matting, de inpainting sobre difusion o de recorte previo antes de un clasificador o un detector.
- Procesamiento por lotes en servidor: integracion en un servicio Python mediante onnxruntime o rembg para normalizar imagenes antes de almacenarlas o indexarlas.
- Sanidad de datos en datasets: generar mascaras para anonimizar fondos identificables (habitaciones, matriculas, documentacion visible) antes de compartir un conjunto de imagenes.
- Interfaz de accesibilidad: extraccion del contorno del sujeto para resaltarlo o crear recortes automaticos en herramientas de presentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni DUT-OMRON, ni ECSSD, ni DUTS, ni comparaciones de IoU o MAE). El unico dato empirico documentado es una prueba de humo en CPU, no una evaluacion de calidad:

| Prueba | Entrada | Salidas | Tiempo |
|---|---|---|---|
| Smoke test CPU con onnxruntime 1.30.0 | zeros float32 `[1, 3, 320, 320]` | 7 tensores `[1, 1, 320, 320]` | 1050,6 ms |

El tiempo indicado corresponde a una ejecucion con entradas rellenas de ceros en el toolchain declarado (Darwin 25.6.0 arm64) y sirve como cota de verificacion de que el grafo se carga y se ejecuta, no como medida de rendimiento en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos en fp32 ocupan unos 168 MB y las activaciones a 320x320 son de tamano reducido; en la practica cualquier GPU con 1 GB o mas de memoria libre es suficiente. La version de navegador depende del heap disponible en el contexto de WebGPU o Wasm.
- GPU recomendadas: el modelo no necesita aceleradores de gama alta. Funciona en CPU, en GPU integradas y en cualquier GPU de consumo; una RTX 4090 o una A100 estan sobredimensionadas para este modelo y solo tendrian sentido para procesar lotes muy grandes.
- Compatibilidad con GPU de consumo: si. Cabe con amplio margen en cualquier GPU de consumo de los ultimos diez anos, e incluso se ejecuta de forma aceptable solo en CPU.
- Opciones de despliegue: onnxruntime-web en navegador (con `webgpu` y `wasm`), onnxruntime en Python/C++/C# con CPU, CUDA, TensorRT o DirectML, y rembg como envoltorio ya existente.
- Opciones de despliegue no aplicables: vLLM, llama.cpp, Ollama y TGI no sirven para este modelo, ya que estan orientados a modelos de lenguaje y no cargan grafos ONNX de vision.
- Latencia y throughput: no se publican cifras de throughput. El unico dato disponible es la latencia de humo en CPU de 1050,6 ms por invocacion (entradas nulas, toolchain declarado). Con GPU o WebGPU se espera una latencia muy inferior, pero no hay mediciones publicadas en esta ficha.

## Comparativa con modelos similares

No se ha encontrado informacion verificable sobre alternativas en el material proporcionado (los resultados de busqueda web recibidos no contienen referencias tecnicas al modelo ni a modelos comparables). Por tanto, las filas de alternativas quedan sin datos:

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skillsafe-ai/u2net (U^2-Net ONNX) | no disponible (~44 M estimados por tamano de archivo) | entrada fija 320x320 | no disponible; solo smoke test de 1050,6 ms en CPU | Apache-2.0 (pesos), MIT (ONNX de rembg) | ONNX en HuggingFace, 167,84 MB |
| u2netp / variantes ligeras de U^2-Net | no disponible | no disponible | no disponible | no disponible | no disponible |
| ISNet y otros modelos de matting | no disponible | no disponible | no disponible | no disponible | no disponible |
| RMBG y similares | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrada fija de 320x320: cualquier imagen debe redimensionarse a esa resolucion, lo que provoca perdida de detalle fino (pelo, rejillas, ramas, bordes semitransparentes) y obliga a refinar la mascara al alza si se necesita alta resolucion.
- Ambiguedad en escenas complejas: al ser un modelo de objeto saliente, la mascara depende de la prediccion del sujeto principal. Con varios sujetos, fondos con patrones dominantes o imagenes con poca separacion tonal, la mascara puede incluir o excluir regiones de forma incorrecta.
- Riesgo de error silencioso: el modelo devuelve siempre siete tensores con valores entre 0 y 1; no hay ninguna senal de confianza ni de fallo. Un consumidor que no valide la mascara puede generar recortes incorrectos sin aviso.
- Sin benchmarks publicados: no hay cifras de IoU, MAE ni comparaciones con otros metodos en la informacion disponible, por lo que no es posible estimar su calidad relativa antes de desplegarlo.
- Sin datos sobre sesgos: no se documenta la composicion del dataset de entrenamiento original, por lo que se desconoce si el modelo rinde peor en determinados tonos de piel, tipos de cuerpo, indumentaria o entornos culturales.
- Modelo unicamente de vision: no procesa texto ni instrucciones, no soporta idiomas y no puede integrarse como agente ni con tool calling.
- Restricciones de licencia: los pesos son Apache-2.0 y permiten uso comercial con atribucion a U^2-Net (Xuebin Qin et al.), al ONNX de rembg (Daniel Gatis, MIT) y al repositorio de SkillSafe. Es obligatorio conservar los avisos de licencia correspondientes.
- Procedencia: es un artefacto de importacion, no un modelo reentrenado. Cualquier mejora debe hacerse por ajuste fino posterior, no esperando actualizaciones del autor. La fecha de creacion declarada en el repositorio (2026-09-22) y el hecho de tener 0 descargas y 0 likes indican que no hay validacion de la comunidad todavia.
- Dependencia del entorno: en navegador, el rendimiento depende de la disponibilidad de WebGPU; si no esta disponible, cae a Wasm y la latencia aumenta de forma notable.
- Trazabilidad: la verificacion se limita a `onnx.checker` y a una ejecucion de humo con ceros. No se publican metricas de calidad de la mascara generada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/u2net
- Peso upstream de rembg: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
- Repositorio de rembg (Daniel Gatis, MIT): https://github.com/danielgatis/rembg
- U^2-Net original (Xuebin Qin et al.): https://github.com/xuebinqin/U-2-Net
- Licencia de los pesos originales: https://github.com/xuebinqin/U-2-Net/blob/master/LICENSE
- Recetas y tooling de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Servicio de artefactos vetados: https://models.skillsafe.ai
- Paper original de U^2-Net: https://arxiv.org/abs/2005.09007
- Nota: los resultados de busqueda web recibidos no contenian enlaces relevantes al modelo; solo devolvieron diccionarios de sinonimos en frances sin relacion con esta ficha.
