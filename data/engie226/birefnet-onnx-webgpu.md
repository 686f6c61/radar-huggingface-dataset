# Engie226/BiRefNet-ONNX-webgpu

## Resumen

BiRefNet-ONNX-webgpu es una reexportacion del modelo BiRefNet (Bilateral Reference Network) de segmentacion de imagenes para eliminacion de fondos, adaptada para ejecutarse en navegador mediante WebGPU a traves de Transformers.js y ONNX Runtime Web. El modelo original fue desarrollado por Peng Zheng et al. y publicado en el repositorio ZhengPeng7/BiRefNet; esta version concreta la mantiene el usuario Engie226, que ha reescrito el grafo ONNX sin modificar los pesos para eliminar las operaciones incompatibles con los kernels WebGPU.

La motivacion tecnica es concreta: la exportacion estandar de BiRefNet a ONNX no funciona en WebGPU porque algunos shaders requieren mas storage buffers de los que garantiza el estandar (8 por shader), y porque las operaciones con indices int64 y los nodos `Sum` no tienen kernel WebGPU y caen a CPU con tensores de gran tamano. Esta version resuelve ambos problemas mediante plegado de constantes, reestructuracion de `Concat` y `Split`, sustitucion de `Sum` por cadenas de `Add` y reescritura de los `GatherND` de las convoluciones deformables como `Gather` con aritmetica en coma flotante e int32.

El modelo emplea un backbone Swin-L y produce una mascara alfa de 1024x1024 a partir de una imagen RGB del mismo tamano. Se distribuye en dos precisiones: fp32 (1038 MB) y fp16 (520 MB), ambas con licencia MIT. Es relevante para desarrolladores que necesitan eliminacion de fondos en el cliente sin enviar imagenes a un servidor, con latencias del orden de 800 ms por imagen en GPU de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (Bilateral Reference Network) con backbone Swin-L; exportado a grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 1024x1024) |
| Tipos de cuantizacion | fp32 y fp16 (pesos fp16 con entrada y salida float32) |
| Idiomas soportados | no disponible (modelo de segmentacion de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx` fp32, `onnx/model_fp16.onnx` fp16) |

Especificaciones de entrada y salida:

| Parametro | Valor |
|---|---|
| Entrada | `input_image`: float32 `[1, 3, 1024, 1024]`, RGB redimensionado a 1024x1024, escalado a 0..1, normalizado con media ImageNet `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]` |
| Salida | `output_image`: float32 `[1, 1, 1024, 1024]` con logits; aplicar sigmoide para obtener la mascara alfa |
| Tamano del repositorio | 1,6 GB |
| Libreria | transformers.js |
| Pipeline | image-segmentation |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentacion de imagen de proposito general basada en un backbone Swin-L con modulos de referencia bilateral, que combinan caracteristicas de alta resolucion y bajo nivel con caracteristicas semanticas de alto nivel para refinar los bordes de la mascara. Esta version no modifica los pesos del modelo original: unicamente reescribe el grafo de computacion para hacerlo compatible con WebGPU. El proceso de reescritura, documentado en la model card, incluye seis pasos: plegado de constantes con el optimizador basico de ONNX Runtime (de 21.968 a 5.271 nodos, eliminando todas las operaciones de forma, `ScatterND`, `Where` y `ConstantOfShape`); conversion de 4 nodos `Concat` con 16, 64, 256 y 1024 entradas en arboles de como maximo 6 entradas; conversion de 59 nodos `Split` con hasta 32 salidas en arboles de como maximo 6 salidas; sustitucion de 20 nodos `Sum` por cadenas de `Add` en el mismo orden para mantener el resultado bit a bit identico; reescritura de 80 nodos `GatherND` (el muestreo de las convoluciones deformables) como `Gather` simple sobre los datos reestructurados a `[H*W, C]`, con la aritmetica de indices en coma flotante y el calculo final `y * W + x` en int32, eliminando todo tensor int64 del grafo; y conversion a fp16 con `onnxconverter-common` usando `keep_io_types` para mantener entrada y salida en float32. Tras estos cambios, ningun nodo utiliza mas de 7 storage buffers, por debajo del minimo garantizado de 8 en WebGPU.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que se trata de un modelo de vision y la model card de esta reexportacion no detalla el entrenamiento original. Si se indica que los datos de entrenamiento de BiRefNet incluyen DIS5K, cuyos terminos restringen el uso comercial del dataset.

## Capacidades

- Eliminacion de fondos y segmentacion de imagen con mascara alfa de 1024x1024.
- Segmentacion de alta resolucion con preservacion de detalles finos en bordes (pelo, contornos de objetos).
- Inferencia en navegador mediante WebGPU, sin envio de imagenes a servidores externos.
- Ejecucion con Transformers.js (`AutoModel`, `AutoProcessor`, `RawImage`) o directamente con ONNX Runtime Web creando una `InferenceSession` con `executionProviders: ["webgpu"]`.
- Dos variantes de precision intercambiables: fp32 (resultado bit a bit identico al modelo original) y fp16 (diferencia media en la mascara inferior a 1e-5).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de segmentacion de imagen.

## Casos de uso

- Eliminacion de fondos en aplicaciones web de edicion de fotos: el modelo se ejecuta en el navegador del usuario mediante WebGPU, de modo que la imagen nunca sale del dispositivo, lo que simplifica el cumplimiento de RGPD y elimina costes de servidor por inferencia.
- Herramientas de retoque y composicion en tiempo real: con unos 800 ms por imagen en caliente en una GPU de escritorio (AMD Radeon RX 9070 XT), es viable para flujos interactivos donde el usuario sube una foto y ve la mascara al instante.
- Generacion de recortes para catalogos de e-commerce: se puede procesar un lote de imagenes de producto en el cliente o en un pipeline Node.js con ONNX Runtime, generando mascaras alfa para fondos neutros o transparentes.
- Creacion de avatares y stickers: la mascara de 1024x1024 con bordes refinados permite recortar personas o mascotas (el autor valida con imagenes de pelo, un coche y dos gatos) para su uso en aplicaciones de mensajeria.
- Herramientas de videoconferencia y streaming: la mascara alfa se puede aplicar frame a frame para sustituir el fondo, siempre que la latencia de 800 ms por imagen sea aceptable o se combine con tecnicas de interpolacion temporal.
- Preprocesado en pipelines de vision por computador: la mascara generada puede alimentar etapas posteriores (clasificacion, deteccion, generacion) que se beneficien de aislar el sujeto principal del fondo.
- Prototipado rapido y demos sin infraestructura: al cargar en el navegador con Transformers.js, permite publicar demos estaticas (por ejemplo en Hugging Face Spaces o GitHub Pages) sin backend de GPU.

## Benchmarks y rendimiento

La model card no incluye comparaciones con otros modelos de segmentacion (mIoU, IoU, etc.), pero si resultados de fidelidad numerica y rendimiento de inferencia frente al modelo original de onnx-community:

| Prueba | Resultado |
|---|---|
| `model.onnx` (fp32) frente al original, CPU (ONNX Runtime 1.31) | Logits bit a bit identicos, diferencia maxima 0,0; mascara alfa identica |
| `model_fp16.onnx` frente al original, CPU | Diferencia maxima en logits de 0,06 a 1,25; diferencia media en mascara inferior a 1e-5; como maximo 0,02 % de pixeles se desplazan mas de 1/255 |
| `model_fp16.onnx` en WebGPU (Chrome 155, AMD Radeon RX 9070 XT, Transformers.js 4.3.1, ONNX Runtime Web 1.31.0-dev.20260914) | 0,5 % a 1,3 % de pixeles se desplazan mas de 1/255 respecto al fp32 en CPU; 0,01 % a 0,02 % de pixeles cambian entre interior y exterior, todos en bordes |
| Latencia en WebGPU (fp16, en caliente) | Aproximadamente 800 ms por imagen |
| Tiempo de carga en WebGPU (fp16) | Aproximadamente 4,3 s |

No se han publicado resultados de benchmarks estandar de segmentacion (mIoU, IoU, F-measure) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero fp32 ocupa 1038 MB y el fp16 520 MB, por lo que el consumo de memoria de GPU sera del orden del tamano del modelo mas los tensores intermedios de 1024x1024.
- GPU recomendadas: cualquier GPU con soporte WebGPU en el navegador; el autor valida con AMD Radeon RX 9070 XT. En el ecosistema de escritorio profesional, GPUs como A100 o H100 no son el objetivo de esta exportacion (pensada para navegador), aunque podrian ejecutar el grafo ONNX con otros execution providers.
- Cabe en GPU de consumo: si, siempre que el navegador exponga WebGPU; el fichero fp16 (520 MB) es la opcion recomendada en navegador porque ONNX Runtime Web carga el modelo completo en memoria WebAssembly antes de moverlo a la GPU, y el fp32 de 1 GB es arriesgado en ese contexto.
- Opciones de despliegue: Transformers.js con `device: "webgpu"`, ONNX Runtime Web con `executionProviders: ["webgpu"]`, y en servidor ONNX Runtime con los execution providers correspondientes (no documentado en la model card).
- Latencia y throughput: aproximadamente 800 ms por imagen en caliente y 4,3 s de carga inicial en la configuracion validada (Chrome 155, AMD Radeon RX 9070 XT). No se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| BiRefNet-ONNX-webgpu (este) | no disponible (backbone Swin-L, repo de 1,6 GB) | 1024x1024 RGB | ONNX fp32 y fp16 | MIT | Si, via WebGPU |
| ZhengPeng7/BiRefNet (original) | no disponible (backbone Swin-L) | 1024x1024 RGB | PyTorch | MIT | No (requiere adaptacion) |
| onnx-community/BiRefNet-ONNX | no disponible | 1024x1024 RGB | ONNX | MIT | No de forma fiable (shaders con exceso de storage buffers y operaciones sin kernel WebGPU) |
| wonfy/BiRefNet_lite-ONNX-webgpu | no disponible (variante lite) | no disponible | ONNX | no disponible | Si, via WebGPU |

La comparativa se limita a variantes del mismo modelo porque la informacion proporcionada no incluye datos de alternativas de otros autores (por ejemplo, modelos especializados en matting o segmentacion de sujeto). No se dispone de metricas de calidad (mIoU) para comparar frente a esas alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto, no soporta tool calling ni razonamiento multi-paso; no debe evaluarse como un LLM.
- Entrada fija de 1024x1024: las imagenes deben redimensionarse y normalizarse segun la especificacion; no se documenta soporte de otras resoluciones.
- La salida son logits, no una mascara lista para usar: es necesario aplicar sigmoide para obtener el alfa.
- En navegador, el fichero fp32 de 1 GB es arriesgado por la carga completa en memoria WebAssembly; se recomienda fp16.
- La variante fp16 introduce pequenas diferencias en bordes (hasta 0,02 % de pixeles con cambio de clasificacion interior/exterior), aceptable para la mayoria de usos visuales pero no para aplicaciones que exijan exactitud bit a bit.
- Rendimiento dependiente del navegador y la GPU: la validacion se hizo con Chrome 155, una GPU concreta y una version de desarrollo de ONNX Runtime Web; en otros entornos la latencia y la estabilidad pueden variar.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo de segmentacion, su comportamiento puede degradarse en imagenes fuera de la distribucion de entrenamiento (pelo, animales, coches son los casos validados).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la mascara puede incluir o excluir regiones incorrectamente en imagenes complejas; no se documentan tasas de error.
- Licencia: el modelo y el codigo son MIT, pero los datos de entrenamiento incluyen DIS5K, cuyos terminos restringen el uso comercial del dataset. La licencia MIT no cubre los datos de entrenamiento; conviene revisar las implicaciones antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento a largo plazo por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Engie226/BiRefNet-ONNX-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Exportacion ONNX de referencia: https://huggingface.co/onnx-community/BiRefNet-ONNX
- Variante lite para WebGPU: https://huggingface.co/wonfy/BiRefNet_lite-ONNX-webgpu
- Paper de BiRefNet: https://arxiv.org/abs/2401.03407
- Codigo de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
