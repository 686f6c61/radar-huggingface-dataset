# nile-academy/pp-ocrv6-small-onnx

## Resumen

pp-ocrv6-small-onnx es un espejo de datos publicado por nile-academy que empaqueta los checkpoints de detección (det) y reconocimiento (rec) de PP-OCRv6 en su variante small, exportados a ONNX y procedentes de los repositorios oficiales de PaddlePaddle. No se trata de un modelo entrenado por el publicador, sino de una copia fijada por commit ("source-pinned mirror") pensada para consumidores de la plataforma Wekala que necesitan artefactos inmutables y verificables. El modelo original es un sistema OCR de dos etapas: un detector de texto y un reconocedor de secuencias.

El repositorio ocupa aproximadamente 0,1 GB e incluye los checkpoints ONNX seleccionados, los checkpoints de inferencia originales de Paddle y las model cards originales bajo el directorio `original/<source-commit>/`. La licencia declarada aguas arriba es Apache 2.0. Los idiomas declarados en los metadatos son inglés y chino, aunque la model card advierte explícitamente que dichos metadatos no acreditan calidad probada en ningún idioma.

Su relevancia actual es acotada pero concreta: ofrece un paquete OCR ligero, con licencia permisiva y formato ONNX listo para integrarse en pipelines propios mediante runtimes compilados. El publicador no incluye código Python, servidores de inferencia ni código ejecutable, y no valida precisión OCR, fidelidad de cuantización ni aceptación en dispositivos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sistema OCR de dos etapas: detector de texto + reconocedor de secuencias, linaje PP-OCRv6 de PaddlePaddle) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen exportaciones ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, zh (según metadatos; calidad no verificada por el publicador) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportaciones oficiales) y checkpoints de inferencia Paddle en `original/` |

## Arquitectura y entrenamiento

El paquete contiene dos componentes diferenciados. Por un lado, `PP-OCRv6_small_det` es el modelo de detección de regiones de texto, que localiza las cajas o polígonos donde aparece texto en una imagen. Por otro, `PP-OCRv6_small_rec` es el modelo de reconocimiento, que transcribe el contenido textual de cada región detectada. Ambos se distribuyen en dos variantes: los checkpoints de inferencia nativos de Paddle y sus exportaciones ONNX equivalentes, conservados por separado.

No se dispone de información sobre el número de parámetros, el volumen de tokens o imágenes de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino supervisado o preferencias. La model card del espejo no documenta ninguna innovación técnica específica más allá de la propia arquitectura PP-OCRv6 de PaddlePaddle, y no incluye código fuente ni artefactos ejecutables que permitan inspeccionar el grafo más allá de los ficheros ONNX. La publicación verifica identidades de fichero inmutables, no la fidelidad de la conversión a ONNX ni el rendimiento nativo.

## Capacidades

- Detección de texto en imágenes mediante el componente `det`, que produce regiones candidatas para su posterior recorte.
- Reconocimiento de texto en las regiones detectadas mediante el componente `rec`, que devuelve la transcripción de cada recorte.
- Procesamiento de documentos e imágenes con texto en inglés y chino, según los metadatos declarados.
- Despliegue en runtimes ONNX compilados, al distribuirse en formato ONNX además de los checkpoints Paddle.
- Integración en pipelines OCR propios en dos fases (detección y reconocimiento) bajo control del consumidor.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el alcance es exclusivamente OCR.
- No se documenta soporte de árabe en los metadatos, aunque la model card menciona que el soporte de árabe es preferente pero nunca un criterio de elegibilidad del modelo.

## Casos de uso

- Digitalización de documentos escaneados: ejecutar el detector para localizar bloques de texto y el reconocedor para transcribirlos, encadenando ambos ONNX en un pipeline propio con un runtime compilado.
- Extracción de texto de capturas de pantalla y formularios: el tamaño reducido del paquete (0,1 GB) y el formato ONNX permiten integrarlo en servicios ligeros sin dependencias de Paddle en producción.
- Procesamiento por lotes de facturas o albaranes en inglés o chino: el pipeline det+rec permite segmentar campos y transcribir su contenido de forma reproducible gracias a los commits fijados.
- Indexación de archivos PDF convertidos a imagen: el detector aísla regiones de texto y el reconocedor alimenta un índice de búsqueda o un motor de recuperación documental.
- Verificación de identidad de artefactos en entornos regulados: al conservar `publication.json` con los commits y las identidades de fichero, el paquete sirve como base auditable de un componente OCR en una cadena de suministro de modelos.
- Preprocesado para pipelines de NLP: transcribir texto de imágenes antes de pasarlo a un modelo de lenguaje o a un sistema de clasificación documental.
- Prototipado en entornos con restricciones de licencia: la licencia Apache 2.0 permite uso comercial e integración en productos propietarios, siempre que se conserven los avisos de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que la publicación verifica identidades de fichero, no la precisión OCR, la fidelidad de cuantización ni la aceptación en escritorio, móvil o navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete completo ocupa 0,1 GB, por lo que los pesos de la variante small son de tamaño reducido, pero no se documentan requisitos de memoria ni de dispositivo.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados.
- Compatibilidad con GPU de consumo: no disponible. No se confirma ni descarta su funcionamiento en tarjetas como RTX 4090 u otras.
- Opciones de despliegue: al distribuirse en ONNX, es compatible en principio con runtimes ONNX (ONNX Runtime y derivados) y con los checkpoints Paddle mediante Paddle Inference; el consumidor debe aportar los adaptadores compilados, ya que el repositorio no incluye servidores ni código de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pp-ocrv6-small-onnx (este) | OCR det + rec, variante small | en, zh | ONNX + Paddle | Apache 2.0 | Espejo fijado por commit, sin código de inferencia |
| PP-OCRv6 small (PaddlePaddle, upstream) | OCR det + rec, variante small | en, zh | Paddle + ONNX | Apache 2.0 | Fuente original de los checkpoints; incluye model cards propias |
| Otras variantes PP-OCRv6 (medium/large) | OCR det + rec | no disponible | Paddle + ONNX | Apache 2.0 | No se dispone de datos comparativos de precisión en la información proporcionada |
| Tesseract OCR | OCR clásico | multilingüe | propio | Apache 2.0 | Alternativa de referencia; no se dispone de comparación cuantitativa en esta ficha |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El publicador no valida la precisión OCR, la fidelidad de la conversión a ONNX ni la cuantización; cualquier evaluación de calidad corre a cargo del consumidor.
- Los metadatos de idioma (en, zh) no acreditan calidad probada en ninguno de ellos; el rendimiento real en inglés o chino no está verificado.
- No se incluye código Python, checkpoints pickle, servidores de inferencia ni código ejecutable; el repositorio es solo un contenedor de datos y pesos.
- El modelo no está empaquetado con el núcleo de Wekala; el consumidor debe aportar adaptadores compilados aprobados y asumir la integración.
- Riesgo de alucinación en el reconocimiento: como todo modelo de transcripción, puede producir caracteres incorrectos en regiones de baja calidad, ruido o tipografías atípicas; no se documentan tasas de error.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado mayoritariamente para chino e inglés, es esperable un rendimiento degradado en otros alfabetos o sistemas de escritura.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben conservar los avisos de copyright y atribución de los publicadores originales (PaddlePaddle); el espejo no inventa titulares de derechos.
- No se selecciona ningún mecanismo de respaldo en la nube; el despliegue es responsabilidad del consumidor.
- El soporte de árabe se menciona como preferente pero no como criterio de elegibilidad, y no aparece en los metadatos de idioma; no debe asumirse.

## Enlaces

- Repositorio del espejo: https://huggingface.co/nile-academy/pp-ocrv6-small-onnx
- Detector ONNX original: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_onnx/tree/28fe5895c24fd108c19eb3e8479f4ab385fbfc62
- Reconocedor ONNX original: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_onnx/tree/b8f84f0b80c529de40b4fbb3544b84fa7233a513
- Detector Paddle original: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det/tree/106c97591b235f607453300d9fc8c1cad1b25488
- Reconocedor Paddle original: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec/tree/bd619643acac4b9650c040234da8d944476ee3f1
