# MarcinEU/finegrain-box-segmenter-INT8-G128-sym-computeFP16-ONNX

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una versión cuantizada y optimizada para inferencia del segmentador de imagen `finegrain/finegrain-box-segmenter`. Se trata de una red MVANet con backbone Swin-B de aproximadamente 94,6 millones de parámetros, entrada estática de 1024x1024 píxeles y lote 1, que genera una máscara de segmentación binaria útil para tareas de recorte, matting y eliminación de fondo. El autor es MarcinEU, que publica esta variante derivada del modelo original de Finegrain bajo licencia MIT.

La aportación concreta de este repo es un pipeline de cuantización y reescritura del grafo: cuantización INT8 de los pesos de las 174 matrices que intervienen en productos MatMul (operador `MatMulNBits`, group size 128, simetría en torno a cero, cuantización por redondeo al más cercano), activaciones en fp16 y varias reescrituras del grafo que reducen memoria y permiten la ejecución en navegador. El resultado pasa de 805 MB a 122,5 MB (6,6 veces menos, y 3,2 veces menos que la build ONNX fp32 de 396 MB), con un contrato de entrada y salida idéntico al de la versión fp32.

Su relevancia es práctica: permite ejecutar un segmentador de 94,6 M de parámetros en WebGPU, DirectML y CUDA con un presupuesto de memoria muy reducido, y también en el hilo principal de un navegador con la configuración por defecto de ONNX Runtime Web, algo que la exportación fp32 no consigue sin ajustes. Está pensado explícitamente para GPU; en CPU funciona, pero es entre 1,5 y 1,8 veces más lento que el modelo padre fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Swin-B (MVANet) con decodificador de agregación multi-vista, para segmentación de imagen y generación de máscaras |
| Parametros totales | ~94,6 M (heredados del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de resolución fija 1024x1024 píxeles, lote 1 |
| Tipos de cuantizacion | INT8 en los pesos (RTN, group size 128, simétrica; 174 matrices de pesos, operador `MatMulNBits`); activaciones, escalas y parámetros de convolución y LayerNorm en fp16; MatMul de atención y operadores `Pad` en fp32 |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx`, 122,5 MB); compatible con ONNX Runtime 1.23+ y Transformers.js 4.0+ |
| Contrato de entrada | `input` [1,3,1024,1024] float32, RGB en NCHW normalizado con estadísticas ImageNet |
| Contrato de salida | `logits` [1,1,1024,1024] float32 (logits sin procesar; la sigmoide debe aplicarla el consumidor) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base y no se ha modificado: MVANet con backbone Swin-B, un transformer jerárquico con atención de ventana desplazada, más un decodificador de agregación multi-vista que fusiona características a varias escalas para producir una máscara fina de alta resolución. La entrada es una imagen estática de 1024x1024 en lote 1 y la salida una única máscara de 1024x1024 en forma de logits. El backbone se ejecuta cinco veces por inferencia, una por cada vista, y las matrices de pesos de esas pasadas se comparten en el grafo cuantizado.

Este repositorio no entrena ni reentrena nada: es una transformación del grafo y de los pesos. El pipeline descrito por el autor consta de nueve pasos verificados por separado contra una referencia fp32 sobre un conjunto fijo de 11 imágenes. Entre ellos destacan la sustitución de 404,8 MB de máscaras de padding del Swin, todas a cero, por un nodo `ConstantOfShape` (idéntico bit a bit); el almacenamiento en fp16 de las máscaras de valor {-100, 0}; la cuantización `MatMulNBits` de las 174 matrices de pesos; el aplanado de rangos en esas MatMul, que en DirectML baja de 13,9 s a 0,5 s con 8 000 invocaciones sin cambiar la salida; la conversión de 24 puntos de `ScatterND` con padding dinámico en nodos `Pad` estáticos para que el plegado en tiempo de carga de onnxruntime-web encaje en el heap wasm de 4 GB; una reescritura de bajo consumo de memoria con convoluciones polifásicas y una cola de 16 franjas a resolución completa que reduce el pico de RAM un 50 % y la VRAM de WebGPU un 69 %; cortes en las particiones de DirectML mediante 166 pares `Concat(x, Slice(x, 0:0))` que evitan que el decodificador se compile como un único grafo gigante (VRAM de 7,7 GB a 2,0 GB); una reestructuración de las operaciones `Concat`/`Split` anchas en árboles de fan-out máximo 4; y, finalmente, el paso a activaciones fp16.

No se documenta en la información disponible ningún detalle sobre el dataset de entrenamiento del modelo original, número de tokens o imágenes, composición de los datos ni si hubo ajuste por refuerzo o preferencias. Es un modelo de segmentación, por lo que tampoco aplican RLHF ni DPO.

## Capacidades

- Segmentación de imagen a resolución completa 1024x1024 a partir de una imagen RGB normalizada, sin necesidad de cajas ni indicaciones (el autor lo describe como «whole-image, no boxes/prompts»).
- Generación de máscaras para matting y recorte de sujetos, con salida de logits que el consumidor convierte en máscara mediante sigmoide.
- Eliminación de fondo de imágenes: es la etiqueta de pipeline principal del repositorio (`mask-generation`) y una de sus aplicaciones declaradas.
- Ejecución en navegador mediante Transformers.js 4.0+ y onnxruntime-web, con WebGPU, sin necesidad de servidor.
- Ejecución en GPU de escritorio y servidor mediante onnxruntime-node y Python, con los proveedores de ejecución WebGPU, DirectML y CUDA verificados de extremo a extremo en ONNX Runtime 1.26.
- Ejecución en CPU, aunque con penalización de velocidad por las activaciones fp16.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni procesamiento de texto, audio o vídeo. Es un modelo puramente visual de una sola pasada.

## Casos de uso

- Eliminación de fondo en el navegador: con 122,5 MB de pesos y Transformers.js 4.0+, la inferencia puede ejecutarse íntegramente en el cliente sobre WebGPU usando la configuración por defecto de ONNX Runtime Web, sin subir la imagen a un servidor. Es la razón principal por la que este repo existe, ya que la exportación fp32 no encaja en el heap wasm de 4 GB sin ajustes.
- Herramientas de edición fotográfica y plugins: el contrato de entrada y salida es estable (entrada 1x3x1024x1024, salida 1x1x1024x1024), de modo que puede integrarse en un plugin de escritorio que envíe la imagen ya normalizada y reciba la máscara para aplicarla como canal alfa.
- Catalogación de producto en comercio electrónico: procesado por lotes de fotografías de producto para generar recortes sobre fondo transparente o blanco, con 1024x1024 de resolución de máscara, adecuada para fichas de catálogo y miniaturas.
- Matting y composición en producción audiovisual: la máscara fina a resolución completa permite extraer sujetos para composición sobre nuevos fondos, con bordes que el autor documenta como prácticamente idénticos a los del modelo fp32 (MAE 0,00110 frente a 0,00099).
- Preetiquetado en pipelines de anotación: generar máscaras automáticas que un anotador humano corrige después, reduciendo el coste de construir datasets de segmentación; al ser MIT y ONNX, puede integrarse en cualquier herramienta interna sin ataduras de licencia.
- Procesamiento en el borde o en equipos con poca VRAM: el grafo en DirectML ocupa 2,0 GB de VRAM y en WebGPU el autor reporta ahorros del 10 al 45 % frente al padre, lo que permite desplegarlo en GPUs de gama media y en portátiles.
- Servicio de inferencia en servidor con onnxruntime-node o Python sobre CUDA: al ser un único archivo ONNX sin dependencias de Python en inferencia, encaja en servicios contenerizados que necesiten un segmentador con huella de memoria pequeña.
- Procesado por lotes en PHP o Node sin stack de Python: el autor verifica la ejecución en Node, Python, PHP y navegadores, lo que cubre backends web tradicionales que no disponen de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K y similares) en la información disponible; no son aplicables a un modelo de segmentación. La única métrica cuantitativa publicada es la fidelidad de la cuantización frente a la referencia fp32, medida sobre un conjunto fijo de 11 imágenes:

| Metrica | Valor |
|---|---|
| MAE de máscara, activaciones fp16 | 0,00110 |
| MAE de máscara, sin activaciones fp16 (referencia del paso anterior) | 0,00099 |
| Tamano de pesos | 122,5 MB (frente a 805 MB del export completo y 396 MB del padre ONNX fp32) |
| VRAM en DirectML | 2,0 GB (frente a 7,7 GB antes de los cortes de partición) |
| VRAM en WebGPU | reducción del 69 % con la reescritura de bajo consumo de memoria |
| Pico de RAM | reducción del 50 % |
| Latencia en DirectML (8 000 invocaciones) | 0,5 s (frente a 13,9 s antes del aplanado de rangos) |
| Velocidad en WebGPU | 1,5 a 2,2 veces más rápido con activaciones fp16 |
| Velocidad en CPU | 1,5 a 1,8 veces más lento que el padre fp32 |

## Requisitos de hardware

- Inferencia en GPU: el modelo está diseñado para ello. En DirectML el grafo ocupa 2,0 GB de VRAM; en WebGPU el ahorro frente a la exportación sin optimizar es del 69 % en VRAM y del 50 % en pico de RAM de sistema.
- GPU de gama alta de centro de datos: A100, H100 u equivalentes con proveedor CUDA, con holgura amplia respecto a los 2,0 GB estimados del grafo.
- GPU de consumo: cabe en tarjetas con 4 GB o más de VRAM gracias al presupuesto de 2,0 GB en DirectML. Es razonable esperar buen comportamiento en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no publica cifras de latencia por modelo concreto.
- GPU integradas y portátiles: la ruta WebGPU con los límites por defecto del navegador y los cortes de fan-out a 4 permiten ejecución en equipos modestos; el autor no especifica modelos concretos.
- CPU: funciona, pero es entre 1,5 y 1,8 veces más lento que el padre fp32 debido a las activaciones fp16. Para uso exclusivo en CPU el propio autor recomienda usar el repositorio padre.
- Opciones de despliegue: ONNX Runtime 1.23 o superior (verificado en 1.26) mediante onnxruntime-node, onnxruntime-web, Python y PHP; proveedores de ejecución CPU, WebGPU, DirectML y CUDA; Transformers.js 4.0 o superior para el flujo de navegador.
- Almacenamiento: 0,3 GB de repositorio y 122,5 MB de archivo ONNX, adecuado para distribución a clientes.
- Latencia y throughput: no se publican cifras por hardware más allá de las mejoras relativas indicadas en la sección de benchmarks.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de terceros comparables con la misma tarea, tamaño y licencia. La comparación más informativa es con las otras dos variantes del mismo modelo:

| Modelo | Formato | Tamano | Cuantizacion | VRAM DirectML | CPU |
|---|---|---|---|---|---|
| Este repositorio (INT8 G128 sym computeFP16) | ONNX | 122,5 MB | INT8 pesos, fp16 activaciones | 2,0 GB | 1,5 a 1,8 veces más lento que el padre fp32 |
| `MarcinEU/finegrain-box-segmenter-ONNX` (padre) | ONNX | 396 MB | fp32 | superior (mismo grafo de bajo consumo) | referencia fp32 |
| `finegrain/finegrain-box-segmenter` (original) | safetensors PyTorch | 805 MB | fp32 | no aplica | no disponible |
| Otras alternativas de segmentación | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de visión, no de lenguaje: no admite prompts de texto, tool calling, agentes ni razonamiento multi-paso. Cualquier uso en ese sentido es un error de expectativa.
- Resolución de entrada fija de 1024x1024 y lote 1. Las imágenes de otras proporciones deben redimensionarse y reencuadrarse antes de entrar al modelo, lo que puede degradar la máscara en sujetos muy alargados o en escenas muy pobladas.
- La salida son logits en crudo; si el consumidor olvida aplicar la sigmoide, la máscara resultante será incorrecta. El contrato es explícito en este punto.
- Las activaciones fp16 introducen un pequeño deterioro medible: el MAE de máscara pasa de 0,00099 a 0,00110. Es una diferencia marginal, pero conviene tenerla en cuenta en aplicaciones donde el borde exacto sea crítico.
- En CPU es más lento que el modelo padre fp32. Si el despliegue es exclusivamente CPU, este repositorio es una elección peor que su predecesor.
- Los archivos de atención MatMul y los operadores `Pad` se mantienen en fp32 por limitaciones de los proveedores de ejecución (la MatMul fp16 de WebGPU es demasiado imprecisa y el shader fp16 de `Pad` no compila en Firefox). Esto condiciona el rendimiento máximo alcanzable.
- El soporte está verificado en ONNX Runtime 1.23 o superior. Versiones anteriores pueden no cargar el grafo o ignorar algunas optimizaciones.
- No se documentan sesgos del modelo base en la información disponible, ni el dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos o de dominio. Es un riesgo abierto en producción.
- Riesgo de alucinación en el sentido de máscaras incorrectas: el modelo puede segmentar sujetos de forma errónea en imágenes complejas o ambiguas. El autor publica ejemplos deliberadamente difíciles para ilustrar el comportamiento en casos extremos.
- La licencia MIT del repositorio y del modelo base permite uso comercial sin restricciones declaradas, pero conviene verificar la licencia de los datos de entrenamiento originales, no detallada aquí.
- El repositorio tenía 0 descargas y 0 me gusta en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarcinEU/finegrain-box-segmenter-INT8-G128-sym-computeFP16-ONNX
- Exportación ONNX fp32 del mismo autor (modelo padre): https://huggingface.co/MarcinEU/finegrain-box-segmenter-ONNX
- Modelo original en safetensors: https://huggingface.co/finegrain/finegrain-box-segmenter
- Referencia arXiv 2404.07445: https://arxiv.org/abs/2404.07445
- Referencia arXiv 1708.00786: https://arxiv.org/abs/1708.00786
- Carpeta `/usage` del repositorio, con ejemplos funcionales: https://huggingface.co/MarcinEU/finegrain-box-segmenter-INT8-G128-sym-computeFP16-ONNX/tree/main/usage

La búsqueda web realizada no ha devuelto enlaces relevantes para este modelo; los resultados obtenidos corresponden a herramientas sin relación con el repositorio.
