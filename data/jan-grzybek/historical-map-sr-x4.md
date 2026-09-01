# jan-grzybek/historical-map-sr-x4

## Resumen

Historical Map SR ×4 es un modelo de superresolución especializado en mapas históricos escaneados, desarrollado por jan-grzybek. Su propósito es aumentar la resolución ×4 de planos y cartografía antigua procedentes de archivos, microfilmes o digitalizaciones de baja calidad, con una característica diferencial: está entrenado para afilar los trazos existentes en el documento sin inventar estructuras que no estaban en la plancha original. Esta propiedad es crítica en cartografía, donde un upscaler genérico podría dibujar calles o límites que nunca fueron levantados.

El modelo es un fine-tune del checkpoint Phips/4xNomosWebPhoto_RealPLKSR, con 7 389 680 parámetros, y se distribuye en formato safetensors bajo licencia CC-BY-4.0. Su desarrollo se basó en una metodología de validación con pares de escaneos de la misma plancha realizados por distintas instituciones, lo que permitió medir objetivamente la fidelidad de los trazos y la ausencia de invención. Aunque está orientado a mapas históricos, puede aplicarse a cualquier documento cartográfico escaneado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PLKSR (fine-tune de Phips/4xNomosWebPhoto_RealPLKSR) |
| Parametros totales | 7 389 680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura PLKSR, un upscaler de superresolucion para fotografia real, y ha sido ajustado (fine-tuned) especificamente para mapas historicos. El proceso de entrenamiento consistio en 60 000 pasos, seleccionados frente a una extension de 90 000 porque las metricas de validacion mostraron que el checkpoint mas corto era estadisticamente superior en fidelidad de texto y equivalente en contencion de invencion. El dataset de entrenamiento no se detalla en la informacion publica, pero la model card indica que el modelo fue construido para re-inkear una flota de planos de archivo de Varsovia, todos excluidos del entrenamiento para validacion.

La innovacion clave no esta en la arquitectura, sino en la estrategia de validacion: se utilizaron pares de escaneos de la misma plancha impresa obtenidos por dos instituciones distintas (453 recortes de 8 hojas), de modo que el modelo pudiera compararse contra una "verdad" objetiva. Ademas, se midio la tasa de trazos inventados en regiones sin estructura (como zonas de agua o papel en blanco), donde un upscaler generico tiende a resolver el grano en estructuras falsas.

## Capacidades

- Superresolucion ×4 de mapas historicos escaneados, incluyendo planos urbanos, mapas topograficos, catastros y mapas militares.
- Preservacion de detalles finos: rotulacion, tramas, lineas discontinuas, simbolos cartograficos y sombreados.
- Contencion de invencion: en zonas sin estructura (agua, papel en blanco, tintes planos), el modelo no anade trazos ficticios, manteniendo el grano y la trama originales.
- Restauracion de escaneos de baja calidad: microfilm, tinta desvaida, halftone, multiples generaciones JPEG.
- Compatibilidad con el ecosistema Spandrel para integracion en pipelines de procesamiento de imagenes.
- No soporta tool calling, agentes ni procesamiento de lenguaje; es exclusivamente un modelo de vision para image-to-image.

## Casos de uso

- Digitalizacion de archivos historicos: institutos cartograficos y bibliotecas pueden aplicar el modelo a escaneos de baja resolucion para mejorar la legibilidad sin alterar el contenido original, facilitando la consulta y el estudio.
- Restauracion de planos urbanos antiguos: ayuntamientos y archivos municipales pueden recuperar planos de epocas pasadas (por ejemplo, planos de ocupacion o levantamientos catastrales) para su uso en investigacion urbana o exposiciones.
- Mejora de mapas para publicaciones academicas: investigadores en historia, geografia o arqueologia pueden upscalear mapas citados en sus articulos para que las figuras sean legibles en imprenta.
- Reutilizacion de cartografia en SIG: los mapas escaneados pueden integrarse en sistemas de informacion geografica tras el upscaling, mejorando la precision de la georreferenciacion.
- Preservacion de patrimonio cartografico: el modelo permite generar versiones de alta resolucion de mapas antiguos para su difusion en lineas, sin necesidad de reescanear los originales.
- Preparacion de datos para OCR cartografico: al afilar la rotulacion, el modelo facilita el reconocimiento optico de caracteres en mapas, mejorando la extraccion automatica de toponimos.

## Benchmarks y rendimiento

La model card publica metricas propias del modelo, medidas sobre evidencia reservada (no usada en la seleccion de checkpoints). Se comparan con el predecesor (mejor warm-start) y con upscalers genericos.

| Metrica | Historical Map SR ×4 | Predecesor (warm-start) | RealESRGAN x4plus | SwinIR-L (real-world GAN) |
|---|---|---|---|---|
| Trazos inventados (strokes/kpx) en suelo sin estructura | 0.118 | 0.194 (CI [−0.149, −0.020]) | no medido | no medido |
| Precision de glifos (contra verdad) | 0.691 | 0.691 (Δ −0.0002, CI cruza cero) | no medido | no medido |
| Recall de glifos (contra verdad) | 0.403 | 0.401 (Δ +0.0022) | no medido | no medido |

Ademas, la model card presenta comparaciones visuales con RealESRGAN x4plus y SwinIR-L, mostrando que los modelos genericos degradan tramas y rotulacion, mientras que el modelo propuesto las conserva. No se proporcionan resultados de benchmarks estandar como PSNR o SSIM.

## Requisitos de hardware

- Con 7,4 millones de parametros, el modelo es muy ligero. Puede ejecutarse en CPU con tiempos de inferencia aceptables para imagenes pequenas, y en GPU de gama baja (por ejemplo, NVIDIA GTX 1050 Ti o superior) con un uso de VRAM inferior a 1 GB en FP32.
- No se han publicado requisitos oficiales de VRAM ni latencia. Como referencia, un modelo de este tamano en FP32 ocupa unos 30 MB de memoria; en FP16, la mitad.
- Opciones de despliegue: al ser un modelo PyTorch con soporte Spandrel, puede integrarse en pipelines con ONNX, TorchScript o directamente con PyTorch. Tambien es compatible con herramientas como chaiNNer o Upscayl.
- Para procesamiento por lotes de mapas grandes (por ejemplo, escaneos de 10 000×10 000 px), se recomienda GPU con al menos 4 GB de VRAM si se procesa en bloques.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Historical Map SR ×4 | 7,4 M | Superresolucion especifica para mapas historicos | CC-BY-4.0 | HuggingFace |
| RealESRGAN x4plus | ~16,7 M | Superresolucion generica para fotos | BSD-3-Clause | GitHub, HuggingFace |
| SwinIR-L (real-world GAN) | ~11,8 M | Superresolucion generica con transformer | Apache-2.0 | GitHub, HuggingFace |

La comparativa cualitativa (segun la model card) muestra que los modelos genericos producen tramas engrosadas, simbolos borrosos y rotulacion redondeada, ademas de inventar estructuras en zonas sin detalles. Historical Map SR ×4 evita estos problemas gracias a su entrenamiento especifico.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para mapas historicos; su aplicacion a fotografias u otros tipos de imagen puede producir resultados suboptimos.
- Aunque reduce la invencion, no la elimina por completo: en zonas sin estructura, la tasa de trazos inventados es de 0.118 por kilopixel, un valor bajo pero no nulo.
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribucion al autor. No hay restricciones adicionales conocidas.
- No se dispone de informacion sobre sesgos especificos, pero el modelo fue desarrollado principalmente con cartografia europea (especialmente polaca), por lo que su rendimiento en mapas de otras regiones o estilos puede variar.
- La validacion se realizo sobre un conjunto limitado de hojas (8 planchas), por lo que el comportamiento en otros tipos de cartografia (por ejemplo, mapas manuscritos o con tecnicas de impresion muy distintas) no esta garantizado.
- Para produccion, se recomienda evaluar el modelo en una muestra representativa de los documentos que se vayan a procesar, dado que la metrica de invencion depende del tipo de suelo cartografico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jan-grzybek/historical-map-sr-x4
- Modelo base: https://huggingface.co/Phips/4xNomosWebPhoto_RealPLKSR
- Paper relacionado (aparece en los tags): arXiv:2404.11848 (no se ha verificado el contenido en la busqueda)
- Repositorio de OpenHistoricalMap (contexto de uso): https://www.openhistoricalmap.org/
