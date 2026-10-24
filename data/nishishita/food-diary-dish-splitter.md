# nishishita/food-diary-dish-splitter

## Resumen

`nishishita/food-diary-dish-splitter` es un adaptador LoRA sobre el modelo vision-lenguaje `Qwen/Qwen3-VL-8B-Instruct` cuyo cometido es localizar los platos individuales presentes en una fotografía de comida ya recortada y devolver una caja delimitadora por plato en formato `[x1, y1, x2, y2]`. Lo publica el usuario `nishishita` como parte del proyecto "Automating Dish-Level Annotation of Real Food-Diary Photos", orientado a automatizar el etiquetado a nivel de plato en diarios fotográficos de alimentación. No es un modelo independiente: requiere descargar el modelo base Qwen3-VL-8B-Instruct y cargar el adaptador mediante PEFT.

El repositorio es pequeño (0,2 GB, pesos del adaptador en safetensors) y la licencia es Apache-2.0 tanto para el adaptador como para el modelo base. En el momento de la consulta el repositorio no registra descargas ni likes, y la model card es breve: documenta el uso mediante un script `infer.py`, el formato de salida JSON y una heurística de conversión de coordenadas, pero no publica detalles de entrenamiento ni métricas.

Su relevancia es acotada y muy específica: resuelve un paso intermedio de segmentación por plato dentro de pipelines de anotación y análisis nutricional, no una tarea generalista de visión. Para cualquier uso fuera de ese dominio (fotos de comida ya recortadas, en inglés) conviene evaluar directamente el modelo base o alternativas de detección de objetos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-lenguaje Qwen3-VL; el base es `Qwen/Qwen3-VL-8B-Instruct` |
| Parametros totales | Modelo base: ~8.000 millones (Qwen3-VL-8B-Instruct). Adaptador: número exacto no disponible; repositorio de 0,2 GB |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del modelo base |
| Tipos de cuantizacion | Adaptador en safetensors (BF16 en CUDA, float32 en CPU). Cuantizaciones del modelo base no documentadas en esta ficha |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (adaptador y código); modelo base distribuido aparte también bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), cargado junto al modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo multimodal de tipo transformer que procesa imagen y texto y genera texto. El adaptador añade pesos LoRA que especializan al modelo base en una única tarea: dada una imagen de comida recortada, emitir las cajas `[x1, y1, x2, y2]` de cada plato. La model card no especifica rango, alpha, módulos objetivo del LoRA, número de pasos, tamaño del dataset ni composición de los datos de entrenamiento; tampoco indica si hubo RLHF, DPO u otra fase de alineamiento posterior al ajuste supervisado. Las fotos de entrenamiento no se publican.

El detalle técnico mejor documentado es el posprocesado de coordenadas: el script convierte la salida cruda del modelo aplicando la heurística descrita en el artículo del proyecto, según la cual los valores que superan 1,05 veces la dimensión mayor de la imagen se interpretan como coordenadas normalizadas en escala 0–1000 y, en caso contrario, como píxeles. El autor advierte explícitamente de que esta regla puede ser ambigua para ciertos tamaños de imagen y ciertas cajas. La inferencia en CUDA usa una sola GPU en BF16; en CPU se ejecuta en float32, con mayor consumo de RAM.

## Capacidades

- Localización de platos individuales en una imagen de comida recortada, devolviendo una caja delimitadora por plato.
- Salida estructurada en JSON con tres campos: texto crudo del modelo, `boxes_xyxy_pixels` y `boxes_xyxy_normalized`.
- Coordenadas en orden `[x1, y1, x2, y2]`, con conversión automática entre escala 0–1000 y píxeles.
- Ejecución en GPU (CUDA, BF16) o en CPU (float32) mediante el script `infer.py` incluido.
- Capacidades heredadas del base Qwen3-VL-8B-Instruct (comprensión de imagen y texto, generación de texto), si bien el adaptador está especializado y no se documenta su comportamiento en tareas generales.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni máscaras de segmentación en el adaptador.
- Multilingüismo: el adaptador declara únicamente inglés.

## Casos de uso

- Anotación automática de diarios fotográficos de alimentación: el adaptador genera las cajas de cada plato de una foto, lo que permite pasar de una imagen con varios alimentos a registros individuales por plato para su posterior análisis nutricional.
- Pre-etiquetado de datasets de visión: uso del adaptador como primer paso de anotación y revisión humana posterior, reduciendo el coste de etiquetar grandes colecciones de fotos de comidas.
- Segmentación previa a la clasificación de alimentos: recortar cada caja y enviar los recortes a un clasificador o a un modelo de reconocimiento de ingredientes, de forma que el clasificador trabaje sobre una sola comida por imagen.
- Aplicaciones de conteo de calorías o registro dietético: dado que la tarea es exactamente localizar platos en una foto de diario, encaja como componente de un pipeline que después estime porciones o identifique el alimento.
- Auditoría y control de calidad de registros: detectar imágenes con varios platos cuando el flujo de la aplicación espera uno solo, o comprobar que las cajas cubren regiones plausibles antes de aceptar un registro.
- Investigación en epidemiología nutricional o estudios dietéticos: procesar de forma masiva fotos de participantes para obtener recuentos de platos y recortes reutilizables, con la ventaja de que el adaptador y el código son Apache-2.0 y el pipeline es reproducible.
- Integración en herramientas de etiquetado asistido: el script devuelve JSON, por lo que puede conectarse a una interfaz de anotación que precargue cajas y el revisor solo las corrija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de detección (por ejemplo, IoU, precisión o recall de cajas), ni comparaciones con otros detectores, ni datos de latencia o throughput.

## Requisitos de hardware

- Peso del adaptador: 0,2 GB en safetensors, negligible frente al modelo base.
- VRAM estimada en BF16: en torno a 16 GB solo para los pesos del modelo base de 8.000 millones de parámetros, más el coste de activaciones y del procesador de visión (estimación; no hay cifras publicadas por el autor).
- GPU recomendadas: A100 o H100 para procesamiento por lotes y máximo throughput; una RTX 4090 (24 GB) es suficiente para inferencia en BF16 de una imagen a la vez.
- GPU de consumo: viable en tarjetas de 24 GB en BF16; en tarjetas de 12–16 GB requeriría cuantizar el modelo base, opción no documentada en el repositorio.
- CPU: soportada con `--device cpu` en float32, con un consumo de RAM notablemente superior al de la inferencia en GPU.
- Despliegue: el repositorio proporciona `infer.py` y `requirements.txt` con Transformers y PEFT; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| food-diary-dish-splitter (este) | Base ~8.000 M + adaptador LoRA de 0,2 GB | No disponible | Localización de platos (cajas) sobre imágenes recortadas | Apache-2.0 | Adaptador en HuggingFace; requiere el base |
| Qwen3-VL-8B-Instruct (base) | ~8.000 M | No disponible en la información proporcionada | Visión-lenguaje general, image-text-to-text | Apache-2.0 | HuggingFace |
| Otros VLM abiertos de la clase 7–8 B (por ejemplo Qwen2.5-VL-7B o InternVL de 8 B) | No disponible en la información proporcionada | No disponible | Visión-lenguaje general | No disponible | No evaluados en esta ficha |

No se dispone de comparaciones medidas entre este adaptador y detectores de objetos específicos (YOLO, DETR) ni con otros VLM ajustados para la misma tarea; la model card no aporta resultados que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador está entrenado para localizar platos en imágenes de comida ya recortadas; no es un modelo de propósito general ni un detector de objetos genérico.
- Solo inglés: el adaptador declara el idioma `en`; no hay evidencia de comportamiento en castellano.
- No devuelve etiquetas ni máscaras: la salida son cajas; la identificación del alimento o la estimación de porciones queda fuera del alcance del adaptador.
- Heurística de coordenadas ambigua: el propio autor advierte de que la regla del factor 1,05 puede producir interpretaciones erróneas en determinados tamaños de imagen y cajas; conviene validar el posprocesado con imágenes del caso de uso real.
- Riesgo de alucinación: al ser un modelo generativo, puede emitir cajas para imágenes sin platos o coordenadas fuera de rango; no se documenta ningún filtro de confianza.
- Sin datos de evaluación: no hay métricas publicadas de precisión, recall ni IoU, ni análisis de sesgos por tipo de cocina, iluminación, ángulo de cámara o contexto cultural. No se ha publicado ninguna evaluación de sesgos.
- Reproducibilidad limitada: las fotos de entrenamiento no se incluyen y no se documentan hiperparámetros del LoRA, por lo que no es posible replicar el ajuste.
- Dependencia del modelo base: hay que descargar y cargar Qwen3-VL-8B-Instruct, con los requisitos de VRAM y licencia asociados; el adaptador por sí solo no es ejecutable.
- Licencia: Apache-2.0 en adaptador y código permite uso comercial, pero debe verificarse por separado el cumplimiento de la licencia del modelo base y de los datos con los que se generaron las fotografías de entrenamiento (no publicadas).
- Madurez: repositorio sin descargas ni likes en el momento de la consulta y con model card mínima; no hay evidencias de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishishita/food-diary-dish-splitter
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Proyecto "Automating Dish-Level Annotation of Real Food-Diary Photos": https://github.com/244t/food-diary-annotation
- Resultados de benchmarks, blog técnico y demo: no disponibles en la información proporcionada.
- Nota: la búsqueda web realizada no devolvió enlaces relacionados con este modelo; los resultados obtenidos no guardan relación con el proyecto y se omiten.
