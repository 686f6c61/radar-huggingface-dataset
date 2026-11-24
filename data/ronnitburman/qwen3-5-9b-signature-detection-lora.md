# ronnitburman/qwen3.5-9b-signature-detection-lora

## Resumen

El repositorio `ronnitburman/qwen3.5-9b-signature-detection-lora` contiene un adaptador LoRA que convierte el modelo multimodal Qwen/Qwen3.5-9B en un clasificador especializado de documentos escaneados: determina si una pagina contiene una firma manuscrita y, en caso afirmativo, devuelve su caja delimitadora. Lo desarrolla TextLayer Labs (bajo la cuenta de Hugging Face de ronnitburman) como continuacion de un experimento previo con un modelo de decision basado en prompting sobre la misma tarea.

El adaptador no modifica el modelo base: se aplica sobre Qwen3.5-9B con PEFT y devuelve una respuesta JSON de formato fijo (`{"signed": true|false, "bbox_2d": [x1, y1, x2, y2] | null}`), con coordenadas normalizadas de 0 a 1000. Su relevancia practica reside en que sustituye una tarea de grounding visual abierta por una decision binaria acotada, lo que reduce drasticamente los falsos positivos y mejora la localizacion de la firma frente al modelo base sin adaptar.

El adaptador es pequeno (43,3 M parametros entrenables, repo de 0,3 GB), se distribuye en formato PEFT/safetensors con una copia adicional en formato mlx-vlm, y mantiene la licencia Apache 2.0 del modelo base. Esta pensado para pipelines de digitalizacion documental, no para verificacion de autenticidad de firmas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3.5-9B, modelo multimodal image-text-to-text |
| Parametros totales | 9B (modelo base) + 43,3 M (adaptador LoRA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la model card menciona bf16 para MLX) |
| Idiomas soportados | no disponible (la tarea es de vision sobre documentos, mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y formato mlx-vlm en la carpeta `mlx/` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones de atencion, atencion lineal y MLP del modelo de lenguaje de Qwen3.5-9B; la torre de vision permanece congelada. El entrenamiento se realizo con mlx-vlm 0.8.0 sobre un Apple M5 Pro durante aproximadamente 7 horas, con AdamW a 1e-4, schedule coseno, 2 epocas (7.274 pasos con batch 1 y acumulacion de 8) y perdida calculada unicamente sobre los tokens de respuesta. El checkpoint publicado corresponde al paso 3.000, seleccionado sobre el split de validacion antes de usar el de test.

El conjunto de entrenamiento consta de 3.637 paginas: el split de entrenamiento de tech4humans/signature-detection (1.980 paginas, unas 396 fuentes aumentadas cinco veces) mas 1.657 paginas de SignverOD, tras eliminar las copias cercanas a paginas de test o validacion. Solo 438 paginas no contenian firma. Las imagenes se redimensionan a 640x640 y el prompt de inferencia es fijo: el adaptador fue entrenado con una redaccion concreta y no se ha probado con otras formulaciones. Se recomienda decodificacion greedy, hasta 160 tokens nuevos y thinking desactivado en el chat template.

## Capacidades

- Clasificacion binaria de presencia de firma manuscrita en paginas escaneadas, con salida JSON estricta.
- Localizacion de la firma mediante una unica caja delimitadora en coordenadas normalizadas 0-1000 sobre la pagina.
- Distincion entre firmas y otros elementos manuscritos o impresos: notas, nombres de archivo, fechas, nombres impresos, marcas `/s/`, sellos, logotipos y encabezados caligraficos.
- Tratamiento de iniciales usadas como rúbrica o sign-off como firma valida, segun la regla de etiquetado del dataset.
- Procesamiento de imagenes de pagina completa a 640x640 mediante el pipeline image-text-to-text del modelo base.
- Inferencia local en Apple Silicon mediante mlx-vlm, con servidor incluido.
- No realiza verificacion de autenticidad ni comparacion biométrica de firmas.

## Casos de uso

- Digitalizacion masiva de archivos legales y administrativos: el adaptador permite enrutar automaticamente las paginas firmadas frente a las no firmadas en un pipeline de escaneo, con una precision balanceada de 0,982 en el split de test, lo que reduce la revision manual a una fraccion minima.
- Indexacion y extraccion de metadatos documentales: la caja delimitadora devuelta permite recortar la firma para almacenarla como evidencia junto al registro del documento, sin necesidad de un detector de objetos adicional.
- Control de calidad en procesos de firma de contratos: verificacion automatica de que un lote de PDF escaneados contiene efectivamente la firma esperada antes de archivarlos, usando la salida booleana como gate del pipeline.
- Procesamiento de fondos documentales historicos: el entrenamiento sobre escaneos de los anos 80 y 90 (linaje Tobacco800) lo hace adecuado para digitalizar colecciones de documentos empresariales y juridicos de esa epoca.
- Preprocesado para OCR y sistemas de gestion documental: la deteccion previa de firmas permite excluir esas regiones del OCR o marcarlas para revision, mejorando la calidad del texto extraido.
- Despliegue en estaciones de trabajo Apple Silicon: con unos 18 GB de memoria en bf16 y unos 3 segundos por pagina en un M5 Pro, es viable para digitalizacion en local sin GPU dedicada ni envio de documentos a la nube.
- Clasificacion de formularios y expedientes en entornos con requisitos de privacidad: al ejecutarse en local y no almacenar imagenes, el adaptador encaja en flujos donde los documentos no pueden salir de la organizacion.

## Benchmarks y rendimiento

Evaluacion sobre el split de test de 419 paginas de tech4humans/signature-detection (383 firmadas, 36 sin firma), a 640x640. Una caja se considera correcta si cada uno de sus cuatro bordes queda dentro del 5% del ancho o alto de la pagina respecto a la firma etiquetada.

| Medida | Este adaptador | Mismo modelo base sin adaptador |
|---|---|---|
| Precision balanceada de presencia | 0,982 | 0,938 |
| Paginas sin firma clasificadas como firmadas | 1 / 36 | 4 / 36 |
| Cajas correctas (una por pagina firmada) | 95,6% | 61,1% |

Resultados adicionales reportados por el autor:

| Conjunto | Resultado |
|---|---|
| 239 paginas sin firma de DocLayNet | 0 clasificadas como firmadas |
| 642 paginas firmadas de SignverOD (no vistas en entrenamiento) | 642 detectadas; 90,8% de cajas dentro del 5% |
| Paginas de test con multiples firmas | 86,7% de cajas correctas (devuelve una sola caja) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita para GPU; el modelo base es de 9B parametros, por lo que en bf16 requiere del orden de 18 GB, coherente con los 18 GB de memoria indicados para la version MLX.
- GPU recomendadas: no especificadas en la informacion. Por tamano, cabria en A100, H100 o RTX 4090 en bf16; no confirmado por el autor.
- Apple Silicon: probado en un Apple M5 Pro con aproximadamente 18 GB de memoria en bf16 y unos 3 segundos por pagina.
- Despliegue: transformers 5.24 + peft 0.22 (probado), mlx-vlm 0.8.0 con servidor incluido. El soporte de LoRA en vLLM sobre las capas de atencion lineal de Qwen3.5 no esta probado; en caso de rechazo, fusionar el adaptador en el modelo base.
- Throughput y latencia en GPU: no disponibles.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas con otros adaptadores o modelos especializados en deteccion de firmas. La unica comparacion documentada es contra el mismo modelo base sin adaptador:

| Modelo | Parametros | Contexto | Precision balanceada (presencia) | Cajas correctas | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B + este LoRA | 9B + 43,3 M | no disponible | 0,982 | 95,6% | Apache 2.0 |
| Qwen3.5-9B sin adaptador | 9B | no disponible | 0,938 | 61,1% | Apache 2.0 |

## Limitaciones y advertencias

- Conjunto de test sin firma muy pequeno: solo 36 paginas; un error en 36 tiene un intervalo de confianza del 95% que llega hasta aproximadamente el 8%.
- Los errores restantes corresponden a escritura manual que no es una firma: notas que terminan con un nombre garabateado, anotaciones de enrutamiento o iniciales al margen. La regla de etiquetado considera firma las iniciales usadas como sign-off y no otra escritura manual.
- Devuelve una sola caja por pagina: en paginas con varias firmas, las cajas fueron correctas en el 86,7% de los casos de test.
- Datos de entrenamiento estrechos: mayoritariamente escaneos empresariales y juridicos de los anos 80 y 90 (linaje Tobacco800) mas SignverOD. Sin probar en formularios, recibos, cheques, fotografias ni escrituras no latinas.
- No es verificacion de firmas: indica si la pagina esta firmada, no si la firma es autentica.
- El prompt de inferencia es fijo; otras formulaciones no han sido probadas y pueden degradar el resultado.
- Datos personales: los conjuntos de entrenamiento son publicos pero contienen escaneos de firmas de personas reales; el adaptador no almacena imagenes.
- El soporte de LoRA en vLLM sobre las capas de atencion lineal de Qwen3.5 no esta probado.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a las condiciones del modelo base y de los datasets empleados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ronnitburman/qwen3.5-9b-signature-detection-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset tech4humans/signature-detection: https://huggingface.co/datasets/tech4humans/signature-detection
- Dataset SignverOD: https://huggingface.co/datasets/ondrs/signverod
- Version MLX del modelo base: https://huggingface.co/mlx-community/Qwen3.5-9B-MLX-bf16
