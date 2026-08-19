# appautomaton/trellis2-mlx-8bit

## Resumen

`appautomaton/trellis2-mlx-8bit` es una adaptación cuantizada del modelo `microsoft/TRELLIS.2-4B` para ejecución directa en Apple Silicon mediante la librería MLX. Desarrollado por App Automaton, el paquete incluye los checkpoints de TRELLIS.2, el condicionador de imagen DINOv3 y el extractor de fondo RMBG-2.0, formando un bundle autocontenido para el pipeline de image-to-3D. Su relevancia radica en que permite generar mallas 3D texturizadas con PBR en hardware de Apple, sin necesidad de GPUs NVIDIA ni CUDA, reduciendo el tamaño total de 18,5 GB a 11,2 GB gracias a una cuantización selectiva affine de 8 bits.

El modelo original de Microsoft utiliza arquitecturas de Transformer de difusión (DiT) con latentes estructurados nativos y compactos, y genera activos 3D de alta resolución con texturas. Esta versión cuantizada mantiene los nombres y la disposición de los tensores originales, pero ejecuta las matrices de atención y MLP mediante multiplicación cuantizada de MLX, preservando la precisión en tensores sensibles como convoluciones y capas de límite. Está pensado para desarrolladores que trabajan con `mlx-spatial` y necesitan un flujo de trabajo de generación 3D local en Macs con chip M-series.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con VAE y decodificador, condicionado por DINOv3 y RMBG-2.0 |
| Parametros totales | 4.000 millones (modelo base TRELLIS.2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de imagen) |
| Tipos de cuantizacion | Affine INT8 con grupo de tamaño 64; pesos mixtos en BF16, FP16 y FP32 |
| Idiomas soportados | Ingles (metadatos), aunque la entrada principal es imagen |
| Licencia | trellis2-dinov3-rmbg-multiple-licenses (no comercial) |
| Formato de pesos | Safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

El modelo base TRELLIS.2 emplea una arquitectura de latentes estructurados nativos y compactos (o-voxel) que combina un VAE con Transformers de difusion vanilla. El pipeline completo consta de cinco DiTs de flujo que generan la forma y el material, junto con codificadores y decodificadores ConvNeXt para la textura. El condicionamiento se realiza mediante DINOv3 (ViT-L/16) para extraer características visuales y RMBG-2.0 para eliminar el fondo de la imagen de entrada. El entrenamiento original de Microsoft utilizo un conjunto de datos masivo de objetos 3D, aunque no se especifican los detalles exactos en la informacion disponible.

Esta variante cuantizada no modifica la arquitectura, sino que aplica una cuantizacion affine de 8 bits con grupo de tamaño 64 a las matrices bidimensionales internas de los bloques: proyecciones QKV y de salida de atencion (self y cross), matrices de entrada/salida de los MLP de los DiTs, y los MLP internos de ConvNeXt en codificadores y decodificadores. Las convoluciones y los tensores de limites sensibles a la precision se mantienen en su precision original. Los pesos cuantizados se almacenan como `uint32` con escalas y sesgos en FP32 y se ejecutan directamente mediante `mx.quantized_matmul`. El resultado es un bundle de 5.587 tensores logicos, de los cuales 1.546 son matrices INT8.

## Capacidades

- Generacion de modelos 3D a partir de una imagen: produce mallas texturizadas con materiales PBR en formato GLB.
- Extraccion automatica de fondo: si la entrada es RGB, RMBG-2.0 elimina el fondo; si es RGBA, usa el canal alfa directamente.
- Generacion de texturas de alta resolucion (hasta 1024 en el pipeline recomendado).
- Soporte de dos niveles de calidad: `1024_cascade` para maxima fidelidad y `512` para menor uso de memoria y mayor velocidad.
- Ejecucion nativa en Apple Silicon mediante MLX, sin dependencias de Torch ni CUDA.
- Validacion integrada de los tres componentes (TRELLIS.2, DINOv3 y RMBG-2.0) a traves de comandos de `mlx-spatial`.
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal general; es un modelo especializado en image-to-3D.

## Casos de uso

- Generacion de assets para videojuegos: un desarrollador puede crear props y escenarios a partir de bocetos o fotografias, obteniendo mallas texturizadas listas para importar en motores como Unity o Unreal. La cuantizacion 8-bit permite iterar rapidamente en un MacBook Pro sin necesidad de un servidor con GPU NVIDIA.
- Prototipado rapido para impresion 3D: disenadores industriales pueden convertir una foto de un objeto fisico en un modelo 3D editable, ajustando el pipeline `512` para pruebas rapidas y luego `1024_cascade` para el resultado final.
- Creacion de contenido para e-commerce: generar vistas 3D de productos a partir de una unica imagen, con materiales PBR que mejoran la presentacion en tiendas online. El bundle autocontenido facilita la integracion en pipelines de automatizacion.
- Desarrollo de entornos de realidad aumentada: artistas pueden poblar escenas AR con objetos generados a partir de imagenes, aprovechando la salida GLB compatible con ARKit y otras plataformas.
- Investigacion en generacion 3D: academicos pueden estudiar el efecto de la cuantizacion affine en la calidad de la reconstruccion, comparando con la version completa en precision total.
- Flujos de trabajo sin conexion: al ser un bundle completo, se puede ejecutar en entornos aislados o con acceso limitado a internet, lo que resulta util en estudios con politicas de seguridad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como PSNR, FID o tiempo de generacion comparado con otras implementaciones. Se recomienda consultar la documentacion de `mlx-spatial` o los repositorios oficiales de TRELLIS.2 para obtener datos de rendimiento en hardware Apple.

## Requisitos de hardware

- Dispositivo con Apple Silicon (M1, M2, M3, M4 o posteriores).
- Se recomienda al menos 16 GB de memoria unificada para el pipeline `1024_cascade`; con 8 GB es posible ejecutar el nivel `512` con limitaciones.
- El bundle completo ocupa 11,2 GB en disco.
- No requiere GPU dedicada, ya que MLX utiliza la GPU integrada y la Neural Engine.
- Ejecucion mediante `mlx-spatial` con Python 3.13 y MLX `0.32.x`.
- No es compatible con CUDA ni con hardware x86.
- La latencia y el throughput no estan documentados; dependen del modelo de chip y de la memoria disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamaño del bundle | Precision | Licencia | Hardware |
|---|---|---|---|---|---|
| `microsoft/TRELLIS.2-4B` (original) | 4B | 18,5 GB | BF16/FP16/FP32 | MIT (TRELLIS.2) | NVIDIA (CUDA) |
| `appautomaton/trellis2-mlx-8bit` (este) | 4B | 11,2 GB | Affine INT8 + mixta | No comercial (por RMBG-2.0) | Apple Silicon (MLX) |
| `gtrg55/trellis2-mlx` (port nativo) | 4B | No disponible | No disponible | No disponible | Apple Silicon (MLX) |

La principal diferencia frente al original es la reduccion del 39,1% en tamano y la posibilidad de ejecucion en Macs, a cambio de una posible degradacion menor en la fidelidad de las superficies debido a la cuantizacion. La licencia no comercial es una restriccion significativa para uso empresarial.

## Limitaciones y advertencias

- Licencia no comercial: al incluir RMBG-2.0 (de BRIA), el uso comercial requiere obtener derechos separados de BRIA. El resto de componentes (TRELLIS.2 y DINOv3) tienen licencias mas permisivas, pero el bundle completo esta restringido.
- Degradacion por cuantizacion: aunque las matrices sensibles se mantienen en precision original, la cuantizacion INT8 puede afectar a la calidad de las texturas o la geometria en casos extremos.
- Solo funciona en Apple Silicon: no es portable a otros entornos sin reescribir el codigo.
- La entrada debe ser una imagen de un solo objeto con fondo limpio; imagenes complejas o multiples objetos produciran reconstrucciones deficientes.
- El pipeline de generacion es relativamente lento comparado con soluciones basadas en CUDA; no se han publicado tiempos exactos.
- No se proporcionan garantias de soporte ni mantenimiento; es un proyecto comunitario de App Automaton.
- La documentacion de `mlx-spatial` puede cambiar, y la compatibilidad con versiones futuras de MLX no esta asegurada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appautomaton/trellis2-mlx-8bit
- Repositorio de `mlx-spatial`: https://github.com/appautomaton/mlx-spatial
- Documentacion de `mlx-spatial` (seccion TRELLIS.2): https://github.com/appautomaton/mlx-spatial/blob/main/docs/trellis2.md
- Paquete PyPI de `mlx-spatial`: https://pypi.org/project/mlx-spatial/
- Pagina oficial de TRELLIS.2 de Microsoft: https://microsoft.github.io/TRELLIS.2/
- Port nativo MLX de TRELLIS.2 (gtrg55): https://github.com/gtrg55/trellis2-mlx
- Sitio independiente sobre TRELLIS-2: https://trellis-2.org/
