# BeRestoral/ContinuaRoformer-slav

## Resumen

ContinuaRoformer-slav es un modelo encoder-only entrenado desde cero por BeRestoral (usuario individual, sin afiliación institucional declarada) para el procesamiento de textos eslavos antiguos: eslavo eclesiástico (código `cu`) y eslavo oriental antiguo / ruso antiguo (código `orv`), incluyendo inscripciones en corteza de abedul. El modelo resuelve tres tareas filológicas concretas sobre un mismo texto: restaurar caracteres perdidos o dañados, reconstruir los límites de palabra en textos escritos en *scriptio continua* (sin espacios) y atribuir dialecto y fecha de composición.

La arquitectura es un transformer denso de 10 capas, 768 dimensiones ocultas, 8 cabezas de atención y embeddings posicionales rotatorios (RoPE), con una ventana de 512 caracteres y 83.383.999 parámetros totales. La entrada no es texto tokenizado al uso: cada posición combina un embedding de carácter (768) con el identificador del trigrama de caracteres que empieza en esa posición (192), concatenados y proyectados a 768. Sobre el encoder se montan cuatro cabeceras especializadas (restauración de carácter, expansión de lagunas, límite de palabra y atribución de fecha/dialecto).

Su relevancia es de nicho pero clara: cubre una tarea (segmentación y restauración de manuscritos en escritura continua) para la que prácticamente no existen modelos publicados, y lo hace con pesos abiertos bajo licencia Apache 2.0 y un script de inferencia incluido. El interés práctico está en proyectos de humanidades digitales, corpus históricos y pipelines de normalización de fuentes primarias, no en aplicaciones de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only post-LN, 10 capas, hidden 768, 8 cabezas, RoPE; embeddings de carácter + trigrama de caracteres |
| Parámetros totales | 83.383.999 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 caracteres |
| Tipos de cuantización | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | `orv` (eslavo oriental antiguo / ruso antiguo), `cu` (eslavo eclesiástico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `transformers` y `torch`, e importar `inference.py` del repo) |

Otros datos: tamaño del repositorio 0,3 GB; etiquetas declaradas `masked-language-modeling`, `scriptio-continua`, `word-segmentation`, `birchbark`, `historical-nlp`, `rope`; sin pipeline declarado en HuggingFace.

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 10 capas con normalización posterior (post-LN), 768 dimensiones ocultas y 8 cabezas de atención, usando embeddings posicionales rotatorios en lugar de posiciones aprendidas. La innovación respecto a un encoder estándar está en la doble representación de entrada: por cada carácter se concatena su embedding (768) con el identificador del trigrama de caracteres que comienza en esa posición (192) y el vector resultante se proyecta a 768. Los trigramas que tocan una laguna o un marcador de daño se enmascaran a vacío para evitar filtración de información (*leakage*) durante el entrenamiento y la inferencia.

Sobre el tronco se añaden cuatro cabeceras: restauración de carácter (con pesos atados a los embeddings de carácter), expansión de lagunas de longitud desconocida (`#`, decisión binaria expandir/parar), predicción de límite de palabra tras cada carácter, y atribución de fecha (20 intervalos de 50 años entre 800 y 1799) y dialecto (OES / CS / NW / SW). Fecha y dialecto se calculan con un *attention pool* aprendido sobre todas las posiciones del texto. El modelo se entrenó sobre texto normalizado; el vocabulario de caracteres (`char_vocab.json`) y de trigramas (`ngram_vocab.json`) se distribuyen en el repositorio. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron fases de RLHF/DPO (poco probables en un modelo enmascarado de este tipo).

## Capacidades

- Restauración de texto dañado a nivel de carácter: `-` indica un carácter perdido, `#` una laguna de longitud desconocida y `?` un daño que no debe restaurarse.
- Reconstrucción de límites de palabra en *scriptio continua*, con opción de devolver el texto segmentado o en continuo (`segment=False`).
- Expansión iterativa de lagunas de longitud desconocida mediante la cabecera binaria expandir/parar.
- Atribución de dialecto en cuatro clases (OES, CS, NW, SW) con distribución de probabilidad.
- Datación del texto en intervalos de 50 años entre 800 y 1799, también como distribución.
- Manejo explícito de caracteres fuera del vocabulario: cualquier símbolo ausente de `char_vocab.json` se interpreta como daño (`[UNK]`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un encoder enmascarado especializado, no un modelo generativo de instrucciones.

## Casos de uso

- Restauración de letras en corteza de abedul y epigrafía: dado un texto con caracteres perdidos marcados con `-`, el modelo propone los candidatos más probables (Hit@1 28,5 % y Hit@5 64,4 % sobre lagunas reales), lo que permite priorizar hipótesis antes de la revisión del editor.
- Segmentación de manuscritos en escritura continua: convierte una secuencia sin espacios en texto con límites de palabra (F1 82,5 % en lagunas reales) como paso previo a lematización, búsqueda o anotación morfológica.
- Catalogación y datación asistida de testimonios: la salida de fecha (20 intervalos de 50 años) y dialecto sirve como señal adicional para archivos y catálogos, siempre con revisión humana dado el MAE de 65,9 años.
- Preprocesamiento de corpus históricos: normalización de textos medievales antes de indexarlos en motores de búsqueda o alinearlos con ediciones críticas.
- Investigación en lingüística histórica: comparación de las distribuciones de dialecto predichas con la clasificación tradicional de un corpus para detectar casos atípicos o mestizajes.
- Docencia y divulgación: herramienta interactiva que muestra cómo se reconstruye un texto lacunar y qué decisiones toma el modelo en cada posición.
- Filtrado de calidad en digitalización: detección de zonas con alta densidad de `[UNK]` como indicio de OCR defectuoso o de daño material en el soporte.

## Benchmarks y rendimiento

Datos publicados por el autor. Test B corresponde a lagunas reales (3616 caracteres reconstruidos editorialmente en letras de corteza y inscripciones, longitud conocida, espacios no contabilizados); Test A corresponde a daño sintético.

| Métrica | Test B (real) | Test A (sintético) |
|---|---|---|
| Restauración Hit@1 | 28,5 % | 40,9 % |
| Restauración Hit@5 | 64,4 % | 74,2 % |
| Límites de palabra (accuracy) | 91,9 % | no disponible |
| Límites de palabra (F1) | 82,5 % | 84,9 % |
| Límites de palabra dentro de lagunas (F1) | 52,2 % | no disponible |
| Dialecto (accuracy) | 92,0 % | 90,2 % |
| Dialecto (macro-F1) | 61,6 % | no disponible |
| Fecha, intervalo exacto de 50 años | 35,8 % | 47,2 % |
| Fecha, MAE | 65,9 años | 74,7 años |

Referencia del autor para interpretar el F1 de segmentación: el 24,0 % de los caracteres va seguido de espacio, de modo que un modelo que nunca predice límite obtendría 76,0 % de accuracy.

Lagunas de longitud desconocida (un solo `#`, decodificación iterativa):

| Longitud real | Coincidencia exacta Test B (1164 lagunas) | Coincidencia exacta Test A (228 lagunas, 1-10 caracteres) |
|---|---|---|
| 1 carácter | 28,1 % | 46,2 % |
| 2 caracteres | 12,7 % | 21,7 % |
| 3 caracteres | 0,8 % | 14,3 % |
| Se mantiene expandiendo hasta el límite de pasos | 16,1 % | 8,3 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 83,4 M de parámetros, los pesos ocupan aproximadamente 0,33 GB en fp32 y 0,17 GB en fp16; el consumo real lo dominan las activaciones sobre ventanas de 512 caracteres y el *overhead* de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo no aprovecha aceleradores de gran capacidad (A100, H100) por tamaño, y ejecutarlo ahí solo tendría sentido para procesar lotes muy grandes.
- Cabe en GPU de consumo: sí, en cualquier RTX/GTX con 2 GB o más (por ejemplo GTX 1650, RTX 3050, RTX 4090) y también en CPU para volúmenes moderados.
- Opciones de despliegue: el repositorio está pensado para cargarse con `transformers` + `torch` mediante el script `inference.py` incluido y `snapshot_download`. No se documentan soportes para vLLM, llama.cpp, Ollama, TGI ni conversión a GGUF, y el uso de `custom_code` implica confiar en el código del autor (`trust_remote_code`).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, la ventana es de 512 caracteres y la decodificación de lagunas de longitud desconocida es iterativa, por lo que el coste crece con el número de pasos de expansión.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de restauración de texto ni de segmentación para eslavo antiguo, y no se han publicado comparaciones del autor contra alternativas. Cualquier comparación con encoders multilingües modernos (tipo XLM-R o mBERT) sería engañosa: aquellos no están entrenados para *scriptio continua*, ni para alfabetos históricos, ni para predicción de lagunas o datación.

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| ContinuaRoformer-slav | 83,4 M | 512 caracteres | Restauración, segmentación, dialecto y fecha (eslavo antiguo) | Apache 2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las lagunas de longitud desconocida solo son utilizables para 1-2 caracteres: a partir de 3 la longitud predicha casi nunca es correcta y la cabecera de expansión tiende a sobre-expandir, porque se entrenó únicamente sobre la primera decisión expandir/parar.
- La datación tiene un error medio absoluto de 65,9 años (Test B) y solo acierta el intervalo exacto de 50 años en el 35,8 % de los casos; no es apta como datación automática sin revisión.
- El macro-F1 de dialecto es 61,6 % pese a una accuracy del 92,0 %, y el propio autor advierte que en el conjunto de evaluación solo están presentes dos de las cuatro clases (NW y CS): el rendimiento sobre OES y SW no está validado.
- El autor señala que la atribución de dialecto y fecha depende en parte del género textual, de la fuente y de la densidad de marcadores `[UNK]` en las letras de corteza, lo que introduce atajos espurios.
- La entrada debe estar ya normalizada al alfabeto del modelo (`char_vocab.json`); cualquier carácter ajeno se lee como daño (`[UNK]`), lo que puede degradar silenciosamente la salida si se alimenta texto con otra normalización.
- Ventana de 512 caracteres: los textos más largos deben trocearse, con el riesgo de perder contexto en las fronteras para las cabeceras de fecha y dialecto.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo depende de `custom_code` del repositorio, por lo que conviene auditar `inference.py` antes de integrarlo en producción.
- Modelo con 0 descargas y 0 *likes* en el momento de la consulta y sin pipeline declarado: no existe validación independiente de los resultados, que proceden únicamente de la evaluación del autor.
- Riesgo de alucinación en sentido filológico: el modelo siempre propone un carácter para cada `-`, aunque no haya evidencia suficiente; debe tratarse como generador de hipótesis, no como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeRestoral/ContinuaRoformer-slav
- No se han encontrado en la información disponible artículos, papers, blogs, repositorios adicionales ni demos asociados al modelo.
