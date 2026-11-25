# przemyslvwm/PP-OCRv6_small_rec_pl-baluarte

## Resumen

PP-OCRv6_small_rec_pl-baluarte es un modelo de reconocimiento de líneas de texto (etapa `rec` de un pipeline OCR) especializado en documentos en polaco. Se trata de un ajuste fino (fine-tuning) de PaddlePaddle/PP-OCRv6_small_rec, convertido a formato ONNX y publicado por el usuario przemyslvwm. El modelo base pierde sistemáticamente los diacríticos polacos (`ą→a`, `ł→l`, `Ę→E`, `Ź→Ż`) incluso sobre impresión limpia; esta versión corrige ese problema manteniendo exactamente el mismo formato de entrada, salida y diccionario que el modelo original, lo que permite sustituirlo sin cambios en el código de la aplicación (por ejemplo, en RapidOCR).

El modelo se distribuye en FP32 sin cuantización, con un tamaño de 21,2 MB por fichero ONNX. La entrada es un tensor `float32 [N, 3, 48, W]` (altura fija de 48 píxeles y anchura variable) y la salida es `[N, T, 18710]` con softmax sobre clases CTC. El diccionario de 18.708 caracteres (`ppocrv6_dict.txt` de PaddleOCR, sin modificar) está embebido en los metadatos ONNX bajo la clave `character`, por lo que no se necesita un fichero de vocabulario externo.

Es relevante ahora porque resuelve un fallo concreto y medible del OCR multilingüe en polaco sin exigir reentrenar el pipeline completo: basta con sustituir el modelo `rec` y mantener `det` y `cls` intactos. La versión v3, la recomendada, corrige además la regresión de v2 sobre caracteres ajenos al alfabeto polaco (`ß`, `×`, cero inicial en números, mayúsculas en siglas y numeración romana).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de texto de PP-OCRv6, salida CTC; detalles internos no especificados en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de altura fija 48 px y anchura variable `W`) |
| Tipos de cuantización | no disponible (solo se distribuye FP32, sin cuantización) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`PP-OCRv6_rec_small_pl-v3.onnx`, `PP-OCRv6_rec_small_pl-v2.onnx`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del reconocedor más allá de su naturaleza: es la etapa `rec` de PP-OCRv6 en variante `small`, con salida CTC sobre un vocabulario de 18.710 clases (18.708 caracteres del diccionario más las clases especiales del CTC). El modelo se ejecuta sobre ONNX Runtime y ha sido probado con `rapidocr 3.9.2` y `onnxruntime 1.32.0` en CPU. La entrada es una imagen normalizada a 48 píxeles de alto y anchura variable, lo que permite procesar líneas de texto de longitud arbitraria sin recortes.

El ajuste fino se realizó sobre el modelo base `PaddlePaddle/PP-OCRv6_small_rec` con datos orientados a documentos polacos. La model card describe dos iteraciones: v2 aprendió los diacríticos polacos pero perdió capacidad sobre caracteres no presentes en sus datos de entrenamiento (`ß` leído como `B`, `×` como `x`, cero inicial como `O`, mayúsculas en siglas y numeración romana); v3 incorporó datos con esos casos y ejemplos contra la sobrecorrección. Los conjuntos de test se congelaron antes del entrenamiento de cada versión y no se usaron para seleccionar el checkpoint, que se eligió sobre un conjunto de validación. No se especifican el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO (no aplicable en un modelo OCR).

## Capacidades

- Reconocimiento de líneas de texto impreso en polaco, incluyendo todos los diacríticos del alfabeto (`ą`, `ć`, `ę`, `ł`, `ń`, `ó`, `ś`, `ź`, `ż`).
- Lectura de caracteres ajenos al alfabeto polaco presentes en documentos reales: `ß`, `×`, `ä`, `ü`, `ö`, `é`.
- Reconocimiento correcto de números con separadores decimales y unidades (`0,5%`, `0,25 zł`, `0-100`), evitando la confusión del cero inicial con la letra `O`.
- Preservación de mayúsculas en siglas (`ZUS`, `NFZ`, `PPK`) y de numeración romana (`I.`, `II.`, `III.`).
- Integración directa como etapa `rec` en pipelines OCR basados en RapidOCR, con `det` y `cls` sin cambios.
- Compatibilidad de formato con el modelo base: mismo esquema de entrada/salida y mismo diccionario, lo que permite sustitución directa sin modificar el código.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos generativos: es un modelo discriminativo de visión por computador.

## Casos de uso

- Digitalización de documentos administrativos polacos: el modelo reconoce formularios, certificados y escritos oficiales con diacríticos correctos, lo que evita errores en campos como nombres propios y direcciones que el modelo base degradaría (`Łódź` → `Lodz`).
- Procesamiento de facturas y recibos: la mejora en la lectura de números (`0,5%`, `0,25 zł`, `0-100`) y la preservación del cero inicial reducen los errores en la extracción automática de importes y tipos de IVA.
- OCR móvil de documentos: probado sobre 19 imágenes preparadas como en una aplicación móvil (detección de página, enderezado, JPEG, escalado a 2000 px), con 391/396 palabras polacas correctas (98,7%), lo que lo hace adecuado para capturas con teléfono.
- Archivo y conservación de prensa histórica o escaneos de baja calidad: en la clase de degradación `ksero` alcanza un `pl_acc` del 93,8%, superior al 77,0% del modelo base, lo que lo hace útil para digitalizar fotocopias.
- Extracción de datos de contratos y textos jurídicos: sobre 480 líneas sintéticas de estilo jurídico logra un CER del 0,62% y un `pl_acc` del 98,4%, adecuado para pipelines de extracción de cláusulas y partes.
- Sustitución directa en sistemas RapidOCR existentes: al mantener el mismo diccionario y shapes, se puede desplegar en producción cambiando únicamente la ruta del modelo `rec`, sin reescribir la lógica de postprocesado.
- Procesamiento por lotes en CPU: al ser un ONNX de 21,2 MB en FP32, puede ejecutarse en servidores sin GPU para digitalización masiva de documentos, con la latencia dependiente de la anchura de las líneas de entrada.

## Benchmarks y rendimiento

Los resultados publicados por el autor son preliminares (una sola ejecución sobre muestras pequeñas, con conjuntos de test congelados antes del entrenamiento). Se reproducen a continuación.

Páginas reales: 33 fotos con teléfono de textos ficticios impresos (867 palabras con letras polacas en el patrón). Pipeline det + cls + rec de RapidOCR, sustituyendo solo `rec`.

| Motor | Palabras con PL | CER de página |
|---|---|---|
| PP-OCRv6 small (base) | 75,2% (652/867) | 4,83% |
| PP-OCRv6 small + corrección léxica de diacríticos (SJP) | 90,1% (781/867) | 3,68% |
| v2 | 95,8% (831/867) | 3,62% |
| v3 | 97,6% (846/867) | 3,30% |

Líneas sintéticas: 480 líneas de texto jurídico polaco con datos ficticios en 4 clases de degradación, con fuentes de test excluidas del entrenamiento.

| Motor | CER | pl_acc | pl_acc `ksero` | pl_acc `zdjecie` | CER `czysty` |
|---|---|---|---|---|---|
| PP-OCRv6 small (base) | 1,60% | 87,6% [84,8-90,0] | 77,0% | 86,3% | 0,24% |
| Tesseract 5.5.4 `pol` (psm 7) | 2,56% | 96,1% [94,2-97,8] | 91,8% | 93,4% | no disponible |
| v2 | 0,69% | 98,2% [97,2-99,1] | 93,4% [89,6-96,4] | 99,6% | 0,13% |
| v3 | 0,62% | 98,4% [97,3-99,2] | 93,8% [89,8-96,8] | 100% | 0,04% |

Prueba de caracteres ajenos, números, siglas y numeración: 1.200 líneas sintéticas (300 textos × 4 clases de degradación, fuentes y vocabulario disjuntos del entrenamiento). Métrica por alineación carácter a carácter.

| Objetivo | PP-OCRv6 small (base) | v2 | v3 |
|---|---|---|---|
| `ß` | 100% (100%) | 20% (17%) | 100% (100%) |
| `×` | 95% (100%) | 7,5% (7%) | 100% (100%) |
| `ä` / `ü` / `ö` / `é` | 87,5-97,5% (100%) | 15-87,5% (13-100%) | 90-96% (100%) |
| `0,5%`, `0,25 zł` | 86,5% (99%) | 27% (19%) | 97% (100%) |
| `0-100` | 96,7% (100%) | 47% (38%) | 98% (100%) |
| Siglas en frase (`ZUS`, `NFZ`...) | 95,2% (99%) | 52,6% (52%) | 93,0% (94,6%) |
| `I.` / `II.` / `III.` | 87 / 78 / 63% | 62 / 67 / 65% | 98 / 95 / 93% |
| Caracteres ajenos falsos (apariciones) | 96 | 0 | 1 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ONNX pesa 21,2 MB en FP32; la huella en memoria es mínima y cabe holgadamente en cualquier GPU, incluso en tarjetas de gama de entrada con 4 GB.
- GPU recomendadas: no se especifican en la model card. Por tamaño, cualquier GPU con soporte de ONNX Runtime (RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente; el cuello de botella será la etapa de detección y el preprocesado de imagen, no el reconocedor.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM; también se ha probado en CPU.
- Opciones de despliegue: ONNX Runtime (probado con `onnxruntime 1.32.0`) y RapidOCR 3.9.2. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card solo indica que las pruebas se realizaron en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Palabras PL en páginas reales | pl_acc (líneas sintéticas) | Licencia | Formato |
|---|---|---|---|---|---|---|
| PP-OCRv6_small_rec_pl-baluarte (v3) | Reconocedor OCR PP-OCRv6 small ajustado | pl | 97,6% | 98,4% | Apache 2.0 | ONNX FP32 |
| PP-OCRv6 small (base) | Reconocedor OCR PP-OCRv6 small | multilingüe | 75,2% | 87,6% | no disponible en la información | PaddlePaddle |
| Tesseract 5.5.4 `pol` (psm 7) | OCR clásico | pl | no disponible | 96,1% | no disponible en la información | binario propio |
| v2 (versión anterior del mismo modelo) | Reconocedor OCR PP-OCRv6 small ajustado | pl | 95,8% | 98,2% | Apache 2.0 | ONNX FP32 |

## Limitaciones y advertencias

- Los resultados publicados son preliminares: una sola ejecución sobre muestras pequeñas (33 páginas reales, 480 y 1.200 líneas sintéticas), por lo que las cifras deben tomarse como orientativas.
- El CER de página depende del orden de lectura de las líneas, que determina la etapa `det`, no el reconocedor; comparaciones de CER de página entre pipelines con distinta detección no son directamente atribuibles a este modelo.
- El modelo está entrenado exclusivamente para polaco; no se ha validado su comportamiento en otros idiomas y el diccionario compartido con el modelo base incluye caracteres de otros alfabetos que podrían aparecer como ruido.
- Riesgo de alucinación de caracteres: aunque v3 reduce drásticamente los caracteres ajenos falsos (1 aparición frente a 96 del modelo base), no los elimina por completo.
- La clase de degradación `ksero` sigue siendo la más difícil: `pl_acc` del 93,8%, frente al 100% en `zdjecie`, lo que indica menor robustez en fotocopias de baja calidad.
- No se especifican sesgos conocidos ni limitaciones de licencia para uso comercial; la licencia Apache 2.0 permite uso comercial, pero el autor declara que es un proyecto privado no vinculado a PaddlePaddle ni a Baidu.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados.
- El nombre anterior del repositorio era `PP-OCRv6_small_rec_pl-husarz`; la dirección antigua redirige a la actual, lo que puede afectar a scripts con rutas fijas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/przemyslvwm/PP-OCRv6_small_rec_pl-baluarte
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec
- RapidOCR: no disponible en la información proporcionada (el autor no incluye enlace directo en la model card)
- PaddleOCR: no disponible en la información proporcionada (el autor no incluye enlace directo en la model card)
- Paper, blog o demo: no disponibles en la información proporcionada.
