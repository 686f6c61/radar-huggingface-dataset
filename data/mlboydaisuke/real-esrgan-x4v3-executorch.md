# mlboydaisuke/Real-ESRGAN-x4v3-ExecuTorch

## Resumen

Real-ESRGAN-x4v3-ExecuTorch es una conversión del modelo de superresolución Real-ESRGAN general x4v3 (desarrollado por el equipo de xinntao) al formato ExecuTorch con delegado XNNPACK, pensado para inferencia on-device en dispositivos con CPU ARM o x86. El modelo original es una GAN basada en RRDB (Residual in Residual Dense Block) que amplía imágenes 4x, entrenada con degradaciones sintéticas de alto orden sobre datasets públicos como DIV2K, Flickr2K y OST. Esta versión empaquetada en un archivo `.pte` de 4,9 MB permite ejecutar el modelo en entornos móviles o de borde sin depender de PyTorch completo, manteniendo una paridad numérica casi exacta con la versión eager en fp32 (correlación 1,0 y diferencia máxima de 1,235e-05).

La relevancia actual radica en la creciente demanda de modelos de restauración de imagen ligeros y desplegables en dispositivos con recursos limitados. Al estar optimizado con XNNPACK, el modelo aprovecha kernels de convolución eficientes en CPU, con una latencia de referencia de 33,9 ms en un Mac arm64 (frente a 42,3 ms en eager), lo que lo hace viable para aplicaciones en tiempo real en móviles o cámaras integradas. La licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Real-ESRGAN (GAN con bloques RRDB) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen) |
| Tipos de cuantizacion | fp32 (unico formato distribuido; fp16 no aporta reduccion de tamano) |
| Idiomas soportados | no disponible (modelo de vision, sin texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (con delegado XNNPACK) |

## Arquitectura y entrenamiento

El modelo base es Real-ESRGAN general x4v3, una variante compacta de Real-ESRGAN orientada a escenas generales (no especifica de rostros). La arquitectura emplea una GAN con generador basado en bloques RRDB y un discriminador, entrenada con un pipeline de degradacion sintetica de alta orden que simula desenfoque, ruido y compresion JPEG. Los datos de entrenamiento incluyen DIV2K, Flickr2K y OST, segun la documentacion del autor original. La conversion a ExecuTorch se realizo mediante `torch.export` y `to_edge_transform_and_lower` con el particionador XNNPACK, logrando una cobertura de delegacion del 61,3% (106 de 173 operaciones); las operaciones restantes (comparaciones escalares, `where` y un `upsample_nearest2d`) se ejecutan con kernels portables. No se aplico cuantizacion int8 en esta version, aunque el autor sugiere que seria la via mas efectiva para reducir peso, ya que fp16 no ofrece ventajas porque XNNPACK serializa los pesos de convolucion en fp32.

## Capacidades

- Superresolucion 4x de imagenes RGB: entrada de 128x128 píxeles, salida de 512x512 píxeles, con valores normalizados en rango [0,1].
- Inferencia on-device en CPU mediante el delegado XNNPACK de ExecuTorch, sin necesidad de GPU o acelerador dedicado.
- Paridad numerica casi perfecta con el modelo eager fp32 (correlacion 1,0 y error maximo de 1,235e-05), lo que garantiza resultados identicos en produccion.
- Intercambio sencillo de variantes: el archivo `.pte` se puede sustituir manteniendo el codigo de la aplicacion, ya que todas las variantes usan tensores fp32.
- No incluye capacidades de texto, vision multimodal, tool calling ni agentes; es exclusivamente un modelo de restauracion de imagen.

## Casos de uso

- Mejora de fotografias en aplicaciones moviles: el modelo puede integrarse en apps de camara o galeria para ampliar y afinar imagenes capturadas con baja resolucion, aprovechando su tamano reducido (4,9 MB) y su ejecucion en CPU.
- Restauracion de archivos digitalizados: util para mejorar escaneos antiguos o documentos de baja calidad antes de su almacenamiento o impresion, gracias a la restauracion general de escenas.
- Preprocesamiento para OCR: al aumentar la resolucion de imagenes de texto pequeno o borroso, se puede mejorar la precision de sistemas de reconocimiento optico de caracteres en entornos embebidos.
- Aplicaciones de videovigilancia: ampliacion de frames de camaras de seguridad de baja resolucion en tiempo real en dispositivos de borde, con latencia de decenas de milisegundos en CPU ARM.
- Upscaling de contenido multimedia en reproductores locales: integracion en reproductores de video o visores de imagenes para escalar contenido antiguo o de baja calidad a pantallas de alta resolucion.
- Prototipado rapido de pipelines de restauracion: al ser un archivo `.pte` autocontenido, facilita la experimentacion en entornos de desarrollo con ExecuTorch sin necesidad de gestionar dependencias pesadas de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (PSNR, SSIM, etc.) en la informacion disponible. La unica verificacion reportada es la paridad con el modelo eager fp32 sobre una imagen real:

| Metrica | Valor |
|---|---|
| Correlacion (todas las salidas) | 1,000000 |
| Diferencia maxima absoluta | 1,235e-05 |
| Latencia media en Mac arm64 (fp32, 10 ejecuciones) | 33,9 ms |
| Latencia eager fp32 en la misma maquina | 42,3 ms |
| Cobertura del delegado XNNPACK | 61,3% (106/173 ops) |

Estos datos son una referencia relativa de coste, no una medida en dispositivo final.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en procesadores ARM (moviles, Raspberry Pi) o x86 con soporte XNNPACK; no requiere GPU.
- VRAM: no aplica, ya que la inferencia se realiza en memoria del sistema; el archivo `.pte` ocupa 4,9 MB en disco.
- GPU recomendadas: ninguna; el despliegue objetivo son dispositivos de borde o moviles con CPU.
- Compatibilidad con consumer GPU: no relevante, aunque podria ejecutarse en cualquier maquina con CPU moderna.
- Opciones de despliegue: ExecuTorch runtime con delegado XNNPACK; tambien se puede cargar en entornos que soporten formato `.pte` (por ejemplo, aplicaciones Android o iOS con ExecuTorch).
- Latencia estimada: 33,9 ms en Mac arm64 (referencia); en dispositivos moviles de gama media puede variar entre 50 y 150 ms segun la optimizacion del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otras conversiones de Real-ESRGAN (como la version LiteRT del mismo autor) ni con alternativas como ESRGAN original o SwinIR. La informacion disponible no incluye benchmarks de calidad de imagen ni mediciones en otros dispositivos, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Tamano de entrada fijo: el modelo acepta exclusivamente tensores de 128x128 píxeles; para imagenes mayores es necesario dividirlas en tiles, lo que puede introducir artefactos en los bordes.
- Sin cuantizacion int8: la unica precision distribuida es fp32, lo que limita la reduccion de peso y el aumento de velocidad que ofreceria una version int8 (el autor recomienda int8 como alternativa, pero no se incluye).
- Cobertura parcial del delegado: el 38,7% de las operaciones se ejecutan con kernels portables, lo que puede incrementar la latencia en dispositivos muy limitados.
- Modelo de escenas generales: no esta optimizado para rostros ni para dominios especificos; para restauracion facial se necesitaria el modelo Real-ESRGAN dedicado a caras.
- Riesgo de alucinacion visual: como toda GAN de superresolucion, puede generar texturas o detalles inexistentes en zonas de alta degradacion, especialmente en imagenes muy comprimidas o con ruido severo.
- Sin soporte de batch: la entrada esta fijada a un unico tensor de 128x128; no se admite procesamiento por lotes en esta conversion.
- Licencia BSD-3-Clause: permite uso comercial y modificacion, pero se debe conservar el aviso de copyright y no usar los nombres de los contribuyentes para promocionar productos derivados sin permiso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/Real-ESRGAN-x4v3-ExecuTorch
- Repositorio de conversion (executorch-models): https://github.com/john-rocky/executorch-models
- Repositorio original de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Variante LiteRT del mismo autor: https://huggingface.co/mlboydaisuke/real-esrgan-x4v3-litert
- Ficha en OpenModelDB: https://openmodeldb.info/models/4x-realesr-general-x4v3
