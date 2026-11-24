# przemyslvwm/PP-OCRv6_small_rec_pl-husarz

## Resumen

PP-OCRv6_small_rec_pl-husarz es un modelo de reconocimiento de líneas de texto (etapa `rec` dentro de un pipeline OCR) especializado en documentos en polaco. Lo desarrolla el usuario independiente przemyslvwm como un ajuste fino (fine-tune) del modelo base PaddlePaddle/PP-OCRv6_small_rec, posteriormente convertido a ONNX. El problema que resuelve es concreto: el modelo base pierde sistemáticamente los diacríticos polacos (ą→a, ł→l, Ę→E, Ź→Ż), incluso sobre impresión limpia, lo que inutiliza su salida para documentos oficiales o jurídicos en polaco.

La versión ajustada mantiene exactamente el mismo formato de entrada y salida y el mismo diccionario de caracteres que el modelo base, de modo que puede sustituirse sin cambios en el código de la aplicación (por ejemplo, en RapidOCR). El artefacto distribuido es un único fichero ONNX de 21,2 MB en FP32, sin cuantizar, con entrada `float32 [N, 3, 48, W]` (altura fija de 48 px y anchura variable) y salida `[N, T, 18710]` con softmax sobre clases CTC.

Es relevante ahora porque demuestra que un fine-tune sintético pequeño (unas 40 000 líneas generadas, 20 minutos en una RTX 5090) puede cerrar una brecha de calidad lingüística muy específica con coste de cómputo mínimo, y porque su formato de distribución es directamente interoperable con el ecosistema RapidOCR/PaddleOCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocimiento de texto CTC sobre backbone convolucional/recurrente de PaddleOCR (PP-OCRv6 small rec); arquitectura sin cambios respecto al modelo base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen `[N, 3, 48, W]` con anchura variable, salida de secuencia CTC de longitud T |
| Tipos de cuantizacion | FP32 únicamente (sin cuantización en el fichero distribuido) |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`PP-OCRv6_rec_small_pl-v2.onnx`, 21,2 MB); diccionario de 18 710 caracteres embebido en metadatos ONNX bajo la clave `character` |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas de texto de PaddleOCR, la etapa `rec` del pipeline det + cls + rec. Se trata de un fine-tune completo (no de adaptadores) sobre PaddlePaddle/PP-OCRv6_small_rec, realizado con PaddleOCR 3.7.0 y paddlepaddle-gpu 3.4.0, sin modificar la arquitectura ni el diccionario de caracteres. La salida es una secuencia CTC con softmax sobre 18 710 clases, lo que permite mantener la compatibilidad binaria con el modelo base.

Los datos de entrenamiento son íntegramente sintéticos: aproximadamente 40 000 líneas de entrenamiento y 2 000 de validación, generadas a partir de formas léxicas del diccionario SJP `pl_PL` y de plantillas de números, fechas y referencias documentales, renderizadas con unos 200 tipos de letra y degradadas con efectos de fotocopia, fotografía, escala de grises, iluminación pobre y ángulos. Las líneas tienen hasta 35 caracteres y un 15 % no contiene letras polacas, como muestras de regresión. No se emplearon documentos reales. El entrenamiento consistió en 20 épocas con lr 1e-4 (cosine, warmup de una época) y batch 128, con un tiempo aproximado de 20 minutos en una RTX 5090. La exportación se hizo con Paddle 3.3 (PIR) y paddle2onnx 2.1.0, y el autor verificó que la ruta de exportación reproduce resultados idénticos a los del ONNX oficial sobre los pesos base.

## Capacidades

- Reconocimiento de líneas de texto impreso en polaco, incluyendo diacríticos (ą, ć, ę, ł, ń, ó, ś, ź, ż) que el modelo base pierde.
- Compatibilidad drop-in con RapidOCR: mismo nombre de entrada (`x`), mismo formato de salida y mismo diccionario embebido en metadatos ONNX.
- Funcionamiento en CPU con ONNX Runtime (probado con `rapidocr 3.9.2` y `onnxruntime 1.32.0`).
- Robusteza declarada frente a degradaciones sintéticas: fotocopia, fotografía, escala de grises, iluminación deficiente y ángulos.
- Reconocimiento de cadenas cortas (hasta 35 caracteres por línea) con dígitos, fechas y referencias documentales.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos generativos: es un modelo discriminativo de image-to-text.
- No cubre escritura manuscrita (no evaluado).

## Casos de uso

- Digitalización de expedientes y documentos jurídicos en polaco: el modelo reconoce diacríticos en texto impreso tipo legal, lo que evita errores en nombres propios, referencias normativas y fechas que el modelo base corrompería.
- Sustitución directa de la etapa `rec` en pipelines RapidOCR existentes: al conservar entrada, salida y diccionario, se puede reemplazar el modelo base sin tocar el código de la aplicación, como muestra el propio autor en la model card.
- Procesamiento OCR en CPU sin GPU: el ONNX FP32 de 21,2 MB se ejecuta con ONNX Runtime en CPU, lo que permite desplegarlo en servidores sin acelerador o en entornos de escritorio.
- Extracción de campos en formularios y facturas escaneadas: al mejorar la fidelidad de letras polacas, reduce la tasa de error en la posterior validación de importes, fechas y números de referencia.
- Indexación y búsqueda full-text de corpus escaneados en polaco: una salida con diacríticos correctos permite búsquedas exactas y mejora la calidad de los índices léxicos.
- Preprocesado para pipelines de NLP posteriores: la salida limpia en polaco evita tener que aplicar correcciones heurísticas de diacríticos (el autor comprueba que, sobre este modelo, la corrección por diccionario SJP ya no aporta).
- Digitalización de material impreso fotografiado con móvil: el entrenamiento incluye degradaciones de fotografía, ángulo e iluminación, adecuadas para capturas no profesionales.

## Benchmarks y rendimiento

Los resultados publicados por el autor son preliminares, de una sola ejecución sobre muestras pequeñas, con el conjunto de test congelado antes del entrenamiento.

Páginas reales: 33 fotografías de móvil de textos ficticios impresos (867 palabras con letras polacas en el patrón).

| Motor | Palabras con PL recuperadas | CER de página |
|---|---|---|
| PP-OCRv6 small (base) | 75,2 % (652/867) | 4,83 % |
| PP-OCRv6 small + corrección léxica de diacríticos (SJP) | 90,1 % (781/867) | 3,68 % |
| PP-OCRv6_small_rec_pl-husarz (v2) | 95,8 % (831/867) | 3,62 % |

Líneas sintéticas: 480 líneas de estilo jurídico con datos ficticios en 4 clases de degradación, con tipos de letra excluidos del entrenamiento. `pl_acc` es la precisión de letras con diacríticos polacos, con IC95 bootstrap por líneas.

| Motor | CER | pl_acc | pl_acc `ksero` | pl_acc `zdjecie` | CER `czysty` |
|---|---|---|---|---|---|
| PP-OCRv6 small (base) | 1,60 % | 87,6 % [84,8-90,0] | 77,0 % | 86,3 % | 0,24 % |
| Tesseract 5.5.4 `pol` (psm 7) | 2,56 % | 96,1 % [94,2-97,8] | 91,8 % | 93,4 % | no disponible |
| PP-OCRv6_small_rec_pl-husarz (v2) | 0,69 % | 98,2 % [97,2-99,1] | 93,4 % [89,6-96,4] | 99,6 % | 0,13 % |

Nota del autor: Tesseract acierta bien los diacríticos en líneas sueltas, pero en páginas completas desordena el layout; en 4 de 14 páginas su CER fue del 46-85 %. El CER de página depende del orden de lectura de líneas que fija el detector, no del reconocedor.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX es de 21,2 MB en FP32; la huella en memoria es mínima y cabe holgadamente en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: no requiere GPU; el autor lo probó en CPU con ONNX Runtime. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera el proceso, pero no es necesaria.
- Cabe en cualquier GPU de consumo y también en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (probado), RapidOCR 3.9.2 como envoltorio de pipeline, y cualquier runtime compatible con ONNX. No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato de tiempo publicado es el de entrenamiento (unos 20 minutos en una RTX 5090), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Diacríticos PL | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| PP-OCRv6_small_rec_pl-husarz (v2) | Reconocedor OCR CTC | pl | 98,2 % pl_acc en líneas sintéticas; 95,8 % de palabras PL en páginas reales | Apache-2.0 | ONNX | Hugging Face |
| PaddlePaddle/PP-OCRv6_small_rec (base) | Reconocedor OCR CTC | multilingüe | 87,6 % pl_acc; 75,2 % de palabras PL en páginas reales | Apache-2.0 | Paddle / ONNX | Hugging Face, PaddleOCR |
| Tesseract 5.5.4 `pol` (psm 7) | Motor OCR clásico | pl | 96,1 % pl_acc en líneas; desordena layout en páginas completas | Apache-2.0 | binario propio | Repositorio de Tesseract |

La comparación se limita a estos tres motores porque son los que el autor evalúa con los mismos scripts y entorno. No se dispone de datos de otros reconocedores polacos en la información proporcionada.

## Limitaciones y advertencias

- No se evaluó con fotocopias reales: la clase `ksero` del test es únicamente sintética.
- No se probó con documentos reales (escritos, facturas, formularios) ni con escritura manuscrita.
- El diccionario base no incluye la comilla tipográfica de apertura polaca `„`, por lo que el modelo nunca la devolverá.
- El blanqueamiento agresivo o la binarización de la página antes del OCR degradan claramente el resultado sobre impresión fina y clara: con un filtro de este tipo, 3 páginas de texto gris pequeño pasaron de 40/42 a 26/42 palabras con PL (dato preliminar sobre 3 páginas). Es preferible alimentar el OCR con la imagen sin ese procesado.
- La corrección léxica de diacríticos (SJP) sobre la salida de este modelo ya no aporta; en el test restó 4 palabras.
- El cambio de modelo altera la distribución de la puntuación `score`; los umbrales de confianza calibrados para el modelo base deben recalibrarse.
- Los resultados publicados son preliminares: una sola ejecución, muestras pequeñas y sin repetición.
- Licencia Apache-2.0, que permite uso comercial, pero el autor declara que es un proyecto privado no vinculado a PaddlePaddle ni a Baidu.
- Riesgo de alucinación en el sentido de sustituciones de caracteres en textos degradados; los sesgos idiomáticos concretos más allá de los diacríticos no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/przemyslvwm/PP-OCRv6_small_rec_pl-husarz
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
