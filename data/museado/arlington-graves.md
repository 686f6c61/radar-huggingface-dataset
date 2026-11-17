# museado/arlington-graves

## Resumen

Arlington-graves es un ajuste fino del modelo de reconocimiento de texto PP-OCRv6 Small de PaddleOCR, especializado en la lectura de inscripciones grabadas en lápidas oficiales del Cementerio Nacional de Arlington (EE. UU.). Lo desarrolla la Museado Foundation (autor `museado`) y resuelve un problema concreto: el modelo original confunde con frecuencia el cero grabado con la letra O y une dígitos de fechas (`APR 1O 2019`, `JUL11921`), lo que obliga a aplicar pasos de corrección posteriores.

El modelo es únicamente el componente de reconocimiento (no incluye detección propia): se distribuye junto al detector estándar PP-OCRv6 Small y el diccionario original, ambos sin modificar, para que el directorio funcione tal cual en cualquier runtime que cargue modelos ONNX de PP-OCRv6. Los pesos se exportan en ONNX opset 11 con una entrada `x [N,3,48,W]` y un tamaño de 21 MB.

Es relevante para proyectos de digitalización de cementerios y archivos históricos, donde la exactitud en fechas y nombres es crítica y los errores de OCR se propagan a bases de datos genealógicas o catastrales. Su licencia Apache-2.0 facilita el uso comercial y la integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 Small (red de reconocimiento de texto de PaddleOCR, CNN + capa de secuencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (reconocimiento por línea de imagen; etiquetas de entrenamiento limitadas a 25 caracteres) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11), entrada `x [N,3,48,W]`, 21 MB |
| Modelo base | PaddlePaddle/PP-OCRv6_small_rec |
| Detector incluido | PaddlePaddle/PP-OCRv6_small_det (sin modificar) |
| Diccionario | dict.txt estándar de PP-OCRv6 (sin modificar) |
| Pipeline | image-to-text |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de los pesos preentrenados de `PP-OCRv6_small_rec` con la configuración de PaddleOCR `configs/rec/PP-OCRv6/PP-OCRv6_small_rec.yml`. Se trata de un reconocedor de líneas de texto: recibe un recorte de imagen de una línea y devuelve la cadena de caracteres. No se modificó la arquitectura, solo los pesos mediante ajuste fino supervisado.

El conjunto de entrenamiento consta de 12.000 recortes de línea procedentes de 19.677 lápidas: las 4.704 líneas que el modelo original leyó mal o que contienen el carácter `&`, más 1.824 líneas correctamente leídas de cada una de las cuatro categorías (fechas, nombres, rango y rama militar, y guerras/medallas/líneas familiares/estados). El etiquetado es débil: una línea se usó solo cuando la lectura del modelo original coincidía con el catálogo del cementerio (nombre, rango, fechas) o con una lista fija de guerras, medallas, líneas familiares y estados, admitiendo caracteres visualmente similares y espacios perdidos. Se excluyeron las etiquetas de más de 25 caracteres. El entrenamiento consistió en dos pasadas, batch 64, learning rate 1e-4, en CPU, unas 10 horas en un Apple M4 Pro, y la exportación se realizó con `paddle2onnx`.

## Capacidades

- Reconocimiento de texto (OCR) sobre recortes de línea de inscripciones en mayúsculas y dígitos.
- Lectura correcta de fechas grabadas, incluyendo ceros que el modelo original confunde con la letra O.
- Reconocimiento de nombres, rangos y ramas militares, guerras, medallas, líneas familiares y estados.
- Manejo del carácter `&` en líneas de inscripción.
- Integración directa en runtimes que carguen modelos ONNX de PP-OCRv6, sustituyendo al modelo Small estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del OCR de imagen a texto.
- Sin capacidades de visión general, audio ni modo de razonamiento.

## Casos de uso

- Digitalización de archivos de cementerios: procesar fotografías frontales de lápidas oficiales y extraer nombre, fechas, rango y rama militar a una base de datos estructurada, con una exactitud de línea del 99,6% en el conjunto de evaluación del autor.
- Indexación genealógica: alimentar bases de datos de historia familiar con fechas de nacimiento y fallecimiento leídas correctamente, evitando los errores típicos del OCR genérico en dígitos grabados.
- Verificación contra registros del cementerio: usar el modelo como paso de lectura previo a la comparación con el catálogo oficial, sin necesidad de reglas de reparación posteriores.
- Catalogación de patrimonio histórico: procesar lotes de fotografías de lápidas de mármol blanco vertical para inventarios patrimoniales.
- Pipelines de OCR existentes: sustituir el modelo Small estándar en un flujo PaddleOCR/RustO sin cambiar el detector ni el diccionario, gracias a la compatibilidad de directorio.
- Extracción de metadatos en proyectos de investigación: obtener campos de fecha, nombre y rango militar de forma automática para estudios demográficos o históricos.
- Herramientas de transcripción asistida: prellenar fichas de transcripción que un operador revisa después, reduciendo el trabajo manual en las líneas que el modelo original fallaba.

## Benchmarks y rendimiento

Resultados de coincidencia exacta de línea sobre 7.047 líneas reservadas de 1.098 lápidas, sin solapamiento entre entrenamiento y evaluación:

| Categoría | Líneas | Modelo original | Este modelo |
|---|---|---|---|
| Todas | 7.047 | 96,2% | 99,6% |
| Líneas que el original leyó mal | 237 | 18,6% | 97,5% |
| Líneas que el original leyó bien | 6.810 | 98,9% | 99,6% |
| Fechas | 1.880 | 91,8% | 99,7% |
| Nombres | 2.099 | 98,5% | 99,7% |
| Rango y rama | 1.135 | 94,4% | 99,6% |
| Guerras, medallas, líneas familiares, estados | 1.933 | 99,0% | 99,3% |

En un conjunto separado de 52 lápidas contrastadas con los registros del cementerio, las fechas de nacimiento y fallecimiento se leen correctamente en 42 lápidas, frente a 32 del modelo original. El modelo original alcanza 42 solo con una reparación basada en reglas de su salida; este modelo no la necesita.

## Requisitos de hardware

- VRAM estimada: muy baja; el modelo ONNX pesa 21 MB y procesa recortes de línea de 48 píxeles de alto, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) acelera el procesamiento por lotes pero no es necesaria.
- Cabe en cualquier GPU consumer y en sistemas embebidos, dado el tamaño reducido del modelo.
- Opciones de despliegue: cualquier runtime que cargue modelos ONNX de PP-OCRv6; el autor documenta el uso con RustO mediante la variable `OCR_MODELS=small=/path/to/stock-small,stones=/path/to/this-directory`. Compatible con el ecosistema PaddleOCR por el formato de entrada y el diccionario.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento en CPU con Apple M4 Pro tardó unas 10 horas para dos pasadas sobre 12.000 recortes, lo que da una idea del orden de magnitud del coste de procesamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| museado/arlington-graves | no disponible | no disponible (etiquetas ≤ 25 caracteres) | 99,6% coincidencia exacta de línea en su dominio | Apache-2.0 | Hugging Face (ONNX) |
| PaddlePaddle/PP-OCRv6_small_rec | no disponible | no disponible | 96,2% en el mismo conjunto; 91,8% en fechas | Apache-2.0 | Hugging Face / PaddleOCR |
| PaddlePaddle/PP-OCRv6_small_det | no disponible | no disponible | Detector incluido sin modificar | Apache-2.0 | Hugging Face / PaddleOCR |

La comparación directa con otros OCR genéricos (Tesseract, EasyOCR, TrOCR) no está disponible en la información proporcionada; el autor solo compara contra el modelo base PP-OCRv6 Small.

## Limitaciones y advertencias

- Solo lápidas oficiales del gobierno: el entrenamiento usa líneas en mayúsculas y dígitos sobre mármol blanco vertical fotografiado de frente. En una lápida familiar privada del conjunto de prueba el modelo leyó peor que el original.
- Los puntos y guiones se descartan: ninguna etiqueta de entrenamiento los contiene, por lo que `1870—1957` se devuelve como `1870 1957`.
- El emblema en la parte superior de la lápida se lee como un carácter suelto o no se lee.
- Etiquetas débiles: solo se usaron líneas en las que la lectura del modelo original coincidía con el catálogo o con listas fijas; una línea que ambos erraron del mismo modo no está en el conjunto, lo que puede dejar sesgos no detectados.
- Etiquetas de más de 25 caracteres excluidas del entrenamiento.
- Riesgo de alucinación en caracteres: al ser un OCR, puede producir caracteres plausibles en grabados deteriorados o con iluminación adversa.
- Idioma limitado al inglés; no soporta inscripciones en otros idiomas.
- Sin datos publicados sobre sesgos demográficos o de otro tipo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo solo es válido para el dominio de lápidas descrito; su uso fuera de él no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/museado/arlington-graves
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec
- Detector: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det
- PaddleOCR (repositorio): https://github.com/PaddlePaddle/PaddleOCR
- Paddle2ONNX: https://github.com/PaddlePaddle/Paddle2ONNX
- RustO: no disponible en la información proporcionada
