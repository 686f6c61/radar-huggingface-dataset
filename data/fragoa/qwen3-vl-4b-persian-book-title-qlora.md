# Fragoa/qwen3-vl-4b-persian-book-title-qlora

## Resumen

`Fragoa/qwen3-vl-4b-persian-book-title-qlora` es un conjunto de adaptadores LoRA entrenados con QLoRA de 4 bits sobre el modelo vision-language `Qwen/Qwen3-VL-4B-Instruct`. Su única función es extraer el título principal en persa a partir de la imagen completa de una portada de libro, descartando nombre de autor, traductor, editorial y cualquier otro texto presente en la cubierta. Lo publica el usuario Fragoa junto con el artículo MVIP2026 titulado "Parameter-Efficient Adaptation of a Vision-Language Model for Persian Book-Cover Title Recognition".

El repositorio no contiene pesos completos, sino adaptadores PEFT de 11.796.480 parámetros entrenables (r=16, alpha=32 sobre q/k/v/o_proj), lo que lo convierte en un artefacto de 0,2 GB que requiere descargar el modelo base para funcionar. Se publican tres ejecuciones independientes (semillas 42, 1234 y 2025) para poder analizar la variabilidad del entrenamiento, con la carpeta raíz correspondiente a la semilla 42.

Su relevancia es doble: por un lado demuestra que un ajuste paramétricamente eficiente sobre un VLM de 4B supera a pipelines OCR clásicos (EasyOCR, Tesseract) en esta tarea concreta; por otro, publica resultados sobre 4.998 portadas del test oficial con métricas de normalización, CER y F1 de palabras, algo poco habitual en adaptadores de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer vision-language (Qwen3-VL); LoRA r=16, alpha=32, dropout=0.05, targets q/k/v/o_proj |
| Parametros totales | Modelo base ~4B (según denominación del checkpoint); adaptador: 11.796.480 parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con double quantization para el base; adaptadores en fp32 durante entrenamiento; inferencia de referencia en fp16 sobre base 4-bit |
| Idiomas soportados | Persa (fa) para la tarea objetivo; el modelo base es multilingüe, pero no se documenta comportamiento en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el base `Qwen/Qwen3-VL-4B-Instruct` en formato Transformers |

## Arquitectura y entrenamiento

El adaptador se inserta en las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) del modelo base Qwen3-VL-4B-Instruct, fijado en la revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`. El entrenamiento usa QLoRA con cuantización NF4 de 4 bits, double quantization y cómputo en fp16, manteniendo los adaptadores en fp32. Se entrenaron 3 épocas con learning rate 1e-4, scheduler coseno, 10 pasos de warm-up y batch global de 16.

Los datos provienen del dataset `shenasa/bookroom-persian-book-covers-and-titles` (revisión `295d5c7cd89e041c0a9f230d774a39d92c7e6681`), del que se tomaron 1.000 portadas para entrenamiento y 100 para validación, extraídas del split oficial de train con shuffle seed 42. La evaluación se realizó sobre `test[200:]` (4.998 portadas) nunca vistas durante el desarrollo. La decodificación es greedy, 1 beam, con un máximo de 40 tokens nuevos. El prompt de inferencia instruye de forma explícita a devolver solo el título principal en persa, sin autor, traductor, editorial ni explicaciones. Existen tres réplicas completas del entrenamiento (semillas 42, 1234, 2025) para medir la estabilidad de los resultados.

## Capacidades

- Extracción del título principal en persa desde una imagen de portada de libro completa (image-text-to-text).
- Discriminación de texto: el prompt y el entrenamiento fuerzan a ignorar autor, traductor, editorial, colección y textos promocionales de la cubierta.
- Normalización implícita de la salida: el modelo devuelve una única línea de texto en lugar de un volcado OCR.
- Salida limitada a 40 tokens nuevos, adecuada para títulos cortos.
- Capacidad zero-shot del base conservada: razonamiento visual general y descripción de imágenes (no evaluada en esta ficha).
- No soporta tool calling, agentes ni multi-step reasoning como parte del ajuste; esas capacidades, si existen, provienen del base y no se han validado aquí.
- No es un sistema OCR general: no se ha entrenado para transcribir texto arbitrario ni para otros idiomas.

## Casos de uso

- Catalogación automatizada de fondos bibliográficos persas: procesar lotes de fotografías de cubiertas y obtener el título principal como campo estructurado, reduciendo la revisión manual a los casos de baja confianza.
- Digitalización de bibliotecas y archivos: enriquecer registros MARC o bases de datos internas a partir de imágenes de cubiertas escaneadas, usando la semilla de mejor rendimiento validada sobre el conjunto de test.
- Enriquecimiento de catálogos de librerías y marketplaces: extraer el título de imágenes subidas por vendedores para autocompletar fichas de producto, con verificación humana posterior.
- Investigación en evaluación de VLM: las tres semillas publicadas permiten estudiar la variabilidad de un ajuste LoRA sobre la misma tarea y comparar contra líneas base OCR reproducibles.
- Preprocesado para pipelines de búsqueda: generar el título normalizado y usarlo como clave de búsqueda o para hacer matching contra un catálogo ISBN existente.
- Filtrado y deduplicación de imágenes: agrupar portadas por título extraído para detectar duplicados en una colección de escaneos.
- Docencia y prototipado: ejemplo reproducible de QLoRA sobre un VLM de 4B con GPU de consumo, útil como plantilla para adaptar el mismo esquema a otras tareas de extracción de campos.

## Benchmarks y rendimiento

Resultados sobre `test[200:]` del split oficial (4.998 portadas nunca usadas en desarrollo). CER: menor es mejor. EM = exact match normalizado; EditSim = similitud de edición.

| Sistema | N | Norm EM | Macro CER | Corpus CER | EditSim | Word F1 |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-3B zero-shot | 4998 | 0.0714 | 0.6548 | 0.6577 | 0.4271 | 0.2886 |
| Qwen3-VL-4B zero-shot | 4998 | 0.0634 | 0.6214 | 0.6422 | 0.4187 | 0.2569 |
| Qwen3-VL-4B QLoRA s42 | 4998 | 0.0684 | 0.6732 | 0.6257 | 0.4583 | 0.3057 |
| Qwen3-VL-4B QLoRA s1234 | 4998 | 0.0684 | 0.6894 | 0.6294 | 0.4605 | 0.3069 |
| Qwen3-VL-4B QLoRA s2025 | 4998 | 0.0706 | 0.6812 | 0.6277 | 0.4588 | 0.3052 |
| QLoRA media (3 semillas) | 4998 | 0.0692 | 0.6813 | 0.6276 | 0.4592 | 0.3059 |
| QLoRA desviación típica (3 semillas) | — | 0.0013 | 0.0081 | 0.0019 | 0.0011 | 0.0008 |
| EasyOCR + largest-text | 4998 | 0.0268 | 0.7396 | 0.7456 | 0.3273 | 0.1517 |
| EasyOCR + all-text | 4998 | 0.0040 | 2.1971 | 1.8399 | 0.2816 | 0.1400 |
| Tesseract + largest-text | 4998 | 0.0064 | 0.9380 | 0.9192 | 0.1351 | 0.0489 |
| Tesseract + all-text | 4998 | 0.0002 | 3.1575 | 2.5795 | 0.1798 | 0.0548 |

Lectura de los datos: el ajuste LoRA mejora al base zero-shot en EditSim (0,4592 frente a 0,4187) y Word F1 (0,3059 frente a 0,2569), y reduce el Corpus CER de 0,6422 a 0,6276. Sin embargo, el Macro CER empeora respecto al zero-shot (0,6813 frente a 0,6214) y el Norm EM queda ligeramente por debajo (0,0692 frente a 0,0634 del base, aunque la semilla 2025 alcanza 0,0706). Frente a OCR clásico, el adaptador multiplica por más de dos el Word F1 de EasyOCR con largest-text (0,3059 frente a 0,1517) y reduce el Corpus CER en más de 11 puntos. La variabilidad entre semillas es muy baja (desviación típica de 0,0008 en Word F1), lo que indica un entrenamiento estable.

## Requisitos de hardware

- VRAM estimada en la configuración de referencia (base en 4-bit NF4 + adaptador): en torno a 4-6 GB, incluyendo el procesamiento de imagen con `min_pixels=12544` y `max_pixels=451584`. Cifra estimada, no publicada por el autor.
- VRAM estimada con el base en fp16 sin cuantizar: aproximadamente 9-10 GB para 4B parámetros más activaciones de visión. Estimación, no verificada en la model card.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 con la configuración 4-bit documentada. En 8 GB el margen es ajustado y depende de la resolución de imagen.
- GPU de datacenter: A100 40/80 GB, H100 y L40S sobran para esta carga; el cuello de botella es el preprocesado de imagen, no la memoria.
- Despliegue: la ruta soportada y documentada es Transformers + bitsandbytes + PEFT (`AutoModelForImageTextToText` + `PeftModel.from_pretrained`, con `subfolder="seed_1234"` para esa variante). Para vLLM o TGI habría que verificar el soporte de adaptadores LoRA sobre el modelo vision-language concreto; llama.cpp y Ollama requerirían fusionar el adaptador en el base y convertir a GGUF, lo que no está documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, la generación está acotada a 40 tokens nuevos en modo greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Word F1 (test) | Corpus CER (test) |
|---|---|---|---|---|---|---|
| Este adaptador (QLoRA sobre Qwen3-VL-4B) | ~4B + 11,8M entrenables | No disponible | Apache 2.0 | VLM ajustado | 0,3059 (media 3 semillas) | 0,6276 |
| Qwen3-VL-4B-Instruct zero-shot | ~4B | No disponible | Apache 2.0 (según base) | VLM generalista | 0,2569 | 0,6422 |
| Qwen2.5-VL-3B-Instruct zero-shot | ~3B | No disponible | Apache 2.0 (según base) | VLM generalista | 0,2886 | 0,6577 |
| EasyOCR + largest-text | No aplica | No aplica | Apache 2.0 | OCR clásico + heurística | 0,1517 | 0,7456 |
| Tesseract + largest-text | No aplica | No aplica | Apache 2.0 | OCR clásico + heurística | 0,0489 | 0,9192 |

La comparación es directa porque todos los sistemas se evaluaron sobre el mismo conjunto de 4.998 portadas. El adaptador gana en F1 de palabras y en CER de corpus a los dos VLM zero-shot y a los dos pipelines OCR. El coste es un Macro CER peor que el del base zero-shot, es decir, el ajuste mejora la media global pero degrada los casos individuales más difíciles.

## Limitaciones y advertencias

- Entrenado con solo 1.000 portadas: la cobertura de estilos tipográficos, caligrafías y diseños editoriales es limitada, y el rendimiento fuera de esa distribución no está medido.
- Sobre-generación documentada por el autor: en títulos cortos el modelo puede añadir texto de autor o editorial a la respuesta.
- Respuestas ocasionales en alfabeto latino en lugar de persa, lo que rompe comparaciones exactas si no se normaliza la salida.
- No es un sistema OCR persa general: no debe usarse para transcribir texto arbitrario, documentos, formularios ni otras tareas de lectura.
- El Norm EM es bajo (0,0692 de media), de modo que la salida rara vez coincide de forma exacta con la referencia; es apta para sugerencia asistida, no para sustituir una validación humana en producción.
- El Macro CER empeora respecto al modelo base sin ajustar, lo que sugiere mayor varianza en casos individuales.
- Sesgos: no se han publicado análisis de sesgo lingüístico, dialectal o de género en los títulos extraídos.
- Riesgo de alucinación: existe, como en cualquier VLM; el modelo puede devolver un título plausible pero ausente en la imagen, especialmente con cubiertas de bajo contraste o muy deterioradas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de origen antes de desplegar.
- El adaptador no funciona de forma autónoma: requiere descargar el base y fijar la revisión indicada para reproducir los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fragoa/qwen3-vl-4b-persian-book-title-qlora
- Dataset de evaluación y predicciones: https://huggingface.co/datasets/Fragoa/persian-book-title-recognition-eval
- Dataset de entrenamiento: https://huggingface.co/datasets/shenasa/bookroom-persian-book-covers-and-titles
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Artículo MVIP2026 "Parameter-Efficient Adaptation of a Vision-Language Model for Persian Book-Cover Title Recognition": mencionado en la model card, sin enlace disponible en la información proporcionada.
- Repositorio de código: no disponible en la información proporcionada.
- Demo: no disponible en la información proporcionada.
