# dizzy77777/efficientsam3-tvm-image-encoder-onnx-fp16

## Resumen

EfficientSAM3 TV-M es un export a ONNX en fp16 del codificador de imagen del modelo EfficientSAM3, una destilación del segmentador SAM3 de Meta. Lo publica el usuario dizzy77777 en Hugging Face y su función es sustituir al codificador de imagen original de SAM3 dentro de un pipeline de segmentación ya existente, manteniendo los mismos nombres de entrada y salida. El objetivo es reducir los requisitos de memoria en inferencia: según el autor, el pico de GPU baja de aproximadamente 6,4 GB a unos 3,5 GB, lo que permite ejecutar el pipeline completo en tarjetas de 8 GB.

El checkpoint subyacente es TV-M (TinyViT-11M, fichero `efficientsam3_tinyvit.pt`), el nivel "Stage 3" de EfficientSAM3. El repositorio solo contiene el codificador de imagen (`sam3_image_encoder.onnx` y su fichero `.data`); el codificador de texto y el decodificador son los originales de SAM3, publicados en el repositorio krauthaufen/sam3-onnx-fp16. El modelo acepta imágenes de 1008×1008 píxeles en formato uint8 CHW con la normalización ya incorporada y devuelve las características `vision_pos_enc_2` y `backbone_fpn_0/1/2`.

Es relevante para desarrolladores que quieran integrar segmentación tipo SAM3 en entornos con VRAM limitada o en plataformas no NVIDIA (DirectML en Windows, CoreML en Apple, CPU), ya que el export está adaptado para ONNX Runtime y se han eliminado los atributos `allowzero` de los nodos Reshape para garantizar compatibilidad con DirectML. No obstante, al ser una destilación con codificador TinyViT, la calidad de segmentación es inferior a la del SAM3 completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT-11M (codificador de imagen de EfficientSAM3, destilado de SAM3); export ONNX del codificador de imagen |
| Parametros totales | no disponible (el checkpoint se identifica como TinyViT-11M, aproximadamente 11 M de parametros en el codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1008×1008 px, uint8 CHW) |
| Tipos de cuantizacion | fp16 (export principal); no se documentan otras variantes en el repositorio |
| Idiomas soportados | no disponible (modelo de segmentacion de imagen, sin capacidades linguisticas propias) |
| Licencia | SAM License (`sam-license`, etiqueta `license: other`); el codigo de EfficientSAM3 es Apache-2.0 |
| Formato de pesos | ONNX (`sam3_image_encoder.onnx` + `.data`), precision fp16 |

## Arquitectura y entrenamiento

El modelo es un codificador de imagen basado en TinyViT con aproximadamente 11 millones de parametros, obtenido por destilacion a partir de SAM3 (el segmentador de Meta) en el marco del proyecto EfficientSAM3. El checkpoint corresponde al nivel TV-M de la etapa 3 del pipeline de destilacion de EfficientSAM3. El export a ONNX se realizo con `onnxconverter_common` en modo float16 (`keep_io_types=False`, `max_finite_val=65504`), con las operaciones Cast redirigidas a float16 y la informacion `value_info` eliminada. Ademas, se retiraron los atributos `allowzero` de los nodos Reshape para asegurar la compatibilidad con el proveedor de ejecucion DirectML.

El autor reporta que el error relativo de las caracteristicas del codificador frente a la implementacion en PyTorch es inferior al 1 %, y que, combinado con el codificador de texto y el decodificador estatico de SAM3, las detecciones coinciden con las de EfficientSAM3 en PyTorch. Una decision tecnica destacable es la sustitucion del codificador de texto MobileCLIP-S0 de EfficientSAM3 (derivado de pesos de Apple con licencia solo para investigacion) por el codificador de texto original de SAM3, del que aquel fue destilado. El checkpoint no incluye el cuello SAM2, por lo que no existe variante interactiva con prompts de clic (`sam3_image_encoder_inst.onnx`). No se dispone de informacion sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO, ya que se trata de un export de un checkpoint preentrenado.

## Capacidades

- Extraccion de caracteristicas de imagen para segmentacion: procesa entradas uint8 CHW de 1008×1008 píxeles con normalizacion incorporada y devuelve `vision_pos_enc_2` y `backbone_fpn_0/1/2`.
- Segmentacion de imagenes en pipeline completo cuando se combina con el codificador de texto y el decodificador de SAM3 de krauthaufen/sam3-onnx-fp16.
- Segmentacion guiada por texto (prompts textuales) a traves del codificador de texto de SAM3, no incluido en este repositorio.
- Ejecucion multiplataforma mediante ONNX Runtime: CUDA, DirectML, CoreML y CPU.
- Compatibilidad drop-in: mantiene los nombres, entradas y salidas del codificador de imagen de SAM3, por lo que sustituye al original en un directorio de modelo de Sam3.Net sin cambios en el codigo.
- No soporta prompts interactivos de clic ni mascaras guiadas por punto, al carecer del cuello SAM2.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, audio ni tool calling.

## Casos de uso

- Segmentacion en equipos con GPU de 8 GB: al reducir el pico de memoria de unos 6,4 GB a unos 3,5 GB, permite ejecutar el pipeline SAM3 completo (codificador de imagen, codificador de texto y decodificador) en tarjetas consumer como la RTX 3060 o la RTX 4060.
- Aplicaciones de escritorio en Windows con DirectML: el export elimina los atributos `allowzero` incompatibles con DirectML, de modo que puede integrarse en aplicaciones .NET mediante Sam3.Net y ejecutarse sobre GPUs AMD o Intel.
- Procesamiento en Apple Silicon con CoreML: el formato ONNX y la precision fp16 facilitan el despliegue en macOS mediante ONNX Runtime con el proveedor CoreML, util para herramientas de edicion de imagen locales.
- Segmentacion por lotes en CPU: para pipelines offline donde la latencia no es critica (por ejemplo, catalogacion de imagenes o preetiquetado de datasets), el modelo puede ejecutarse en CPU sin GPU dedicada.
- Preetiquetado para anotacion de datasets: genera mascaras iniciales que un humano revisa y corrige, acelerando la creacion de datos de entrenamiento para modelos de vision propios.
- Integracion en herramientas de recorte y edicion fotografica: la segmentacion guiada por texto permite aislar objetos descritos por el usuario (por ejemplo, "el coche rojo") y aplicar recortes o fondos transparentes de forma automatica.
- Prototipado rapido de productos de vision: al ser un reemplazo directo del codificador de SAM3 con menor huella de memoria, sirve para validar pipelines de segmentacion antes de invertir en hardware de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una comparacion cualitativa y cuantitativa frente a PyTorch: error relativo de las caracteristicas del codificador inferior al 1 % y detecciones coincidentes con EfficientSAM3 en PyTorch al usar el codificador de texto y el decodificador estatico de SAM3. No se proporcionan metricas de mIoU, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB de pico en GPU con el pipeline completo, frente a unos 6,4 GB con el codificador de imagen original de SAM3 (cifra medida por el autor en una tarjeta de 8 GB con DirectML).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el pipeline completo; el autor valida el funcionamiento en una tarjeta de 8 GB con DirectML. Para CUDA se puede usar desde una RTX 3060/4060 en adelante; no se documentan pruebas en A100 o H100.
- GPU consumer: si cabe en tarjetas de 8 GB, como la RTX 3060, RTX 4060 o RTX 4060 Ti, y en GPUs integradas o dedicadas de AMD e Intel a traves de DirectML.
- Opciones de despliegue: ONNX Runtime con proveedores CUDA, DirectML, CoreML o CPU; integracion en .NET mediante el paquete Sam3.Net; requiere ademas el codificador de texto y el decodificador de krauthaufen/sam3-onnx-fp16.
- Latencia y throughput: no disponibles. El repositorio no incluye mediciones de tiempo de inferencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros (codificador) | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EfficientSAM3 TV-M ONNX fp16 (este modelo) | TinyViT-11M | Imagen 1008×1008 uint8 | ONNX fp16 | SAM License | Pico de ~3,5 GB; sin prompts de clic; requiere texto y decodificador de SAM3 |
| SAM3 image encoder ONNX fp16 (krauthaufen/sam3-onnx-fp16) | no disponible | Imagen 1008×1008 | ONNX fp16 | SAM License | Codificador original de SAM3; pico de ~6,4 GB; incluye variante interactiva con clic |
| EfficientSAM3 en PyTorch (SimonZeng7108/efficientsam3) | TinyViT-11M (TV-M) | Imagen 1008×1008 | PyTorch | Apache-2.0 (codigo) | Referencia de precision; incluye codificador de texto MobileCLIP-S0 con licencia solo de investigacion |

## Limitaciones y advertencias

- Calidad inferior al SAM3 completo: al emplear un codificador TinyViT de aproximadamente 11 M de parametros destilado, la precision de segmentacion es menor que la del modelo original, especialmente en objetos pequenos o escenas complejas.
- Sin segmentacion interactiva: el checkpoint no incluye el cuello SAM2, por lo que no admite prompts de clic ni refinamiento por punto; solo funciona la segmentacion guiada por texto.
- Dependencia de componentes externos: el repositorio solo contiene el codificador de imagen; para obtener mascaras es imprescindible descargar el codificador de texto y el decodificador de krauthaufen/sam3-onnx-fp16 y respetar sus nombres de fichero.
- Licencia restrictiva: los pesos estan cubiertos por la SAM License, no por Apache-2.0 (que solo aplica al codigo de EfficientSAM3). Es una licencia de tipo "other" que puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE y distribuirlo junto con los ficheros derivados.
- Riesgo de alucinacion en segmentacion: como todo modelo de vision, puede generar mascaras para regiones sin objeto o asignar etiquetas incorrectas a los prompts de texto, sin mecanismo de calibracion de confianza documentado.
- Precisión fp16: la conversion a float16 con `max_finite_val=65504` puede introducir desbordamientos en casos extremos, aunque el autor reporta un error relativo inferior al 1 % frente a PyTorch.
- Sin datos de benchmarks ni de latencia: no hay metricas publicadas de mIoU ni de rendimiento, lo que dificulta estimar su comportamiento en produccion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, y actualizado el mismo dia de su creacion; no hay evidencia de uso en produccion ni de mantenimiento continuo.
- Idiomas no aplicables: al ser un modelo de vision sin modulo linguistico propio, el soporte multilingue depende del codificador de texto de SAM3 que se le acople.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dizzy77777/efficientsam3-tvm-image-encoder-onnx-fp16
- Repositorio de EfficientSAM3: https://github.com/SimonZeng7108/efficientsam3
- Codificador de texto y decodificador de SAM3 en ONNX: https://huggingface.co/krauthaufen/sam3-onnx-fp16
- Paquete Sam3.Net para .NET: https://www.nuget.org/packages/Sam3.Net
