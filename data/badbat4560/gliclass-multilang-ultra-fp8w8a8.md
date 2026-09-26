# badbat4560/gliclass-multilang-ultra-fp8w8a8

## Resumen

badbat4560/gliclass-multilang-ultra-fp8w8a8 es una cuantización en FP8 E4M3 (W8A8) del clasificador multilingüe de zero-shot knowledgator/gliclass-multilang-ultra, publicada por el usuario badbat4560. No es un modelo generativo: recibe un texto y una lista de etiquetas candidatas definidas en tiempo de inferencia, y devuelve la clasificación correspondiente. Cuenta con 1.708.243.969 parámetros (~1,7B) y un repositorio de 2,3 GB, bajo licencia Apache 2.0.

El interés del repositorio no está solo en los pesos, sino en el adaptador de inferencia que los acompaña: pesos comprimidos con compressed-tensors, kernels fusionados en Triton y ejecución con CUDA Graphs por cubos de longitud de secuencia. Sobre una GPU de portátil RTX 4050 (6 GB) y batch 1, la latencia mediana medida es de 16,10 ms, un 1,48× más rápida que el BF16 original envuelto en CUDA Graphs, con una reducción del 33,85% en el tamaño de los ficheros de pesos.

Las restricciones son claras: la entrada máxima es de 256 tokens, incluyendo las etiquetas y el formato del prompt, el adaptador solo soporta inferencia secuencial con batch 1, y la evaluación publicada cubre 664 ejemplos en inglés y ruso. Se trata de una pieza de producción para clasificación y enrutado de bajo coste en GPUs consumer, no de un sustituto de un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de clasificación zero-shot condicionada por etiquetas; detalles del backbone del modelo base no disponibles en la información proporcionada |
| Parámetros totales | 1.708.243.969 (~1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens máximo por petición, incluyendo etiquetas y formato del prompt; entradas más largas se truncan con el tokenizador |
| Tipos de cuantización | FP8 E4M3 W8A8 (pesos y activaciones en FP8); el modelo base se distribuye en BF16 |
| Idiomas soportados | Multilingüe según el modelo base; la model card no enumera idiomas. La evaluación publicada solo cubre inglés y ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compresión compressed-tensors |

## Arquitectura y entrenamiento

Este repositorio es una cuantización post-entrenamiento, no un modelo entrenado desde cero: no se realizó fine-tuning para esta publicación. Los pesos del modelo base se comprimen a FP8 E4M3 en formato W8A8 (8 bits para pesos y activaciones) mediante compressed-tensors. El proceso de inicialización desquantiza temporalmente los pesos a BF16 antes de sustituir los módulos de proyección, por lo que el pico de memoria durante la carga es superior al de inferencia.

La innovación técnica está en el adaptador incluido: kernels fusilados escritos en Triton y un envoltorio de CUDA Graphs que captura un grafo por cada cubo de longitud de secuencia y lo reejecuta con datos nuevos. La primera llamada para una longitud dada captura el grafo; las siguientes lo reproducen. Sin ese adaptador, cargar el checkpoint con un loader genérico de desquantización no reproduce el rendimiento medido. No se dispone de información sobre el dataset de entrenamiento del modelo base, su número de tokens ni si hubo etapas de ajuste con RLHF o DPO, algo esperable en un clasificador y no en un modelo generativo.

## Capacidades

- Clasificación zero-shot: clasifica texto contra etiquetas arbitrarias definidas en tiempo de inferencia, sin reentrenamiento.
- Clasificación multilingüe: el modelo base es multilingüe; la evaluación publicada se limita a inglés y ruso.
- Umbral de decisión configurable mediante el parámetro `threshold` de la API de inferencia.
- Inferencia de baja latencia: 16,10 ms de mediana a batch 1 en RTX 4050 Laptop con el adaptador optimizado.
- No genera texto: es un modelo de clasificación, no de generación.
- No soporta tool calling ni function calling.
- No soporta flujos de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- El adaptador solo admite inferencia secuencial con batch 1; no soporta acceso concurrente a un mismo runner.
- No expone salidas de estados ocultos ni de atención.
- No admite entrenamiento ni fine-tuning a través del adaptador.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada ticket contra un conjunto de categorías (facturación, incidencias técnicas, cuenta) definidas en tiempo de inferencia, sin reentrenar cuando cambia la taxonomía. La latencia de 16 ms por petición permite integrarlo en un enrutador síncrono.
- Moderación y triaje de contenido en pipelines de ingesta: etiquetar comentarios o publicaciones contra categorías de riesgo o temática. Apto para volúmenes altos en hardware modesto, con la salvedad de que la evaluación no cubre clasificación de seguridad.
- Etiquetado débil de datasets: pre-anotar corpus nuevos con etiquetas provisionales antes de una revisión humana o de un entrenamiento supervisado, aprovechando que no requiere fine-tuning ni ejemplos etiquetados.
- Clasificación temática de noticias y contenidos editoriales: el modelo obtiene 79,49 de macro-F1 en el subconjunto de test de AG News (256 ejemplos), por lo que es adecuado para categorización temática en inglés.
- Análisis multilingüe de reseñas y encuestas: clasificar opiniones en inglés y ruso (84,04 y 83,42 de macro-F1 en SIB-200) contra etiquetas de sentimiento o temática definidas por el equipo de producto.
- Enrutado de intención en sistemas RAG y asistentes: decidir a qué índice, herramienta o subflujo dirigir una consulta antes de invocar un LLM generativo, reduciendo coste por petición. La ventana de 256 tokens obliga a trabajar con la consulta reformulada, no con documentos completos.
- Clasificación documental con taxonomías cambiantes: contratos, facturas o informes donde las categorías se redefinen con frecuencia; al ser zero-shot, basta con cambiar la lista de etiquetas en la llamada.
- Despliegue en portátiles y estaciones con GPU de 6 GB: el pico de VRAM reservada con el adaptador optimizado es de 3,021 GiB, lo que permite ejecutarlo en GPUs consumer de gama media sin servidor dedicado.

## Benchmarks y rendimiento

Calidad, evaluación emparejada sobre 664 ejemplos con macro-F1 en porcentaje. Ambos modelos usan los mismos textos, etiquetas candidatas y tokenizador; en SIB-200 se emplearon etiquetas en inglés para los dos idiomas:

| Dataset | Ejemplos | BF16 original | FP8 optimizado | Diferencia |
|---|---:|---:|---:|---:|
| AG News, subconjunto de test con semilla | 256 | 79,08 | 79,49 | +0,41 pp |
| SIB-200 inglés, split de test completo | 204 | 84,57 | 84,04 | −0,53 pp |
| SIB-200 ruso, split de test completo | 204 | 84,09 | 83,42 | −0,67 pp |

La coincidencia top-1 con el BF16 original es de 659 de 664 ejemplos (99,25%); solo 5 predicciones difieren. El BF16 con y sin el envoltorio de CUDA Graphs produjo predicciones top-1 idénticas en los 664 ejemplos. Las diferencias positivas pequeñas no deben interpretarse como mejora de calidad.

Latencia y memoria, RTX 4050 Laptop, batch 1, entradas fijas, 10 llamadas de warmup y 50 cronometradas, con sincronización de CUDA alrededor de la petición completa. Incluye tokenización y postprocesado:

| Runtime | Mediana | p95 | VRAM asignada pico | VRAM reservada pico |
|---|---:|---:|---:|---:|
| BF16 original, eager | 24,18 ms | 29,67 ms | 3,219 GiB | 3,428 GiB |
| BF16 original + CUDA Graphs | 23,79 ms | 24,45 ms | 3,238 GiB | 3,537 GiB |
| FP8, adaptador eager original | 59,23 ms | 66,36 ms | 2,145 GiB | 4,293 GiB |
| FP8 + kernels Triton fusionados | 37,97 ms | 46,62 ms | 2,144 GiB | 4,289 GiB |
| FP8 + Triton + CUDA Graphs | 16,10 ms | 16,44 ms | 2,166 GiB | 3,021 GiB |

La ruta optimizada es 3,68× más rápida que el adaptador nativo FP8 inicial y 1,48× más rápida que el control BF16 con grafos. La reducción del tamaño de los ficheros de pesos es del 33,85%. No se han publicado datos de throughput sostenido, rendimiento con lotes grandes ni intervalos de confianza de sesiones repetidas.

## Requisitos de hardware

- VRAM en inferencia con el adaptador optimizado: 2,166 GiB asignados y 3,021 GiB reservados en el pico, a batch 1 y longitud fija, en RTX 4050 Laptop.
- VRAM en inferencia con el adaptador eager FP8: 2,145 GiB asignados, pero 4,293 GiB reservados en el pico.
- VRAM en BF16: 3,219 GiB asignados y 3,428 GiB reservados con ejecución eager; 3,238 y 3,537 GiB con CUDA Graphs.
- Memoria de carga: la inicialización desquantiza temporalmente a BF16, por lo que el pico durante el arranque es superior a las cifras de inferencia; no se publica la cifra exacta.
- GPU validadas: RTX 4050 Laptop, compute capability 8.9, 6 GB, bajo Windows con PyTorch 2.11.0, CUDA 12.8 y driver 610.62. Otros sistemas operativos y GPUs no han sido validados para esta publicación.
- Cabe en GPU consumer: sí, en GPUs de 6 GB o más con soporte FP8 nativo (familia Ada y posteriores). En arquitecturas anteriores, el comportamiento y el rendimiento no están validados.
- Opciones de despliegue: adaptador propio en PyTorch con Triton y CUDA Graphs, incluido en el repositorio junto con `inference.py`, `load_pipeline` y `requirements.txt`. Un loader genérico de desquantización funciona, pero no reproduce la latencia publicada. No se menciona soporte para vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime.
- Latencia medida: 16,10 ms de mediana y 16,44 ms de p95 por petición a batch 1. La preparación de grafos consumió 2,18 s en FP8; la carga del modelo y la compilación en frío de Triton son adicionales. Throughput: no disponible.
- Restricción de concurrencia: el adaptador no soporta acceso concurrente a un mismo runner; requiere un proceso o runner por flujo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Latencia mediana (batch 1, RTX 4050 Laptop) | VRAM reservada pico | Licencia |
|---|---|---:|---:|---:|---|
| Este modelo (FP8 + Triton + CUDA Graphs) | 1,7B | 256 tokens | 16,10 ms | 3,021 GiB | Apache 2.0 |
| knowledgator/gliclass-multilang-ultra (BF16, eager) | 1,7B | 256 tokens | 24,18 ms | 3,428 GiB | no disponible en la información proporcionada |
| knowledgator/gliclass-multilang-ultra (BF16 + CUDA Graphs) | 1,7B | 256 tokens | 23,79 ms | 3,537 GiB | no disponible en la información proporcionada |
| Otros clasificadores zero-shot multilingües (GLiClass base/large, modelos tipo DeBERTa, clasificadores NLI) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de otros clasificadores comparables en la información disponible, por lo que la comparación se limita a las dos variantes de precisión del mismo modelo base.

## Limitaciones y advertencias

- Ventana de entrada de 256 tokens, incluyendo etiquetas y formato del prompt. El tokenizador trunca las entradas más largas sin aviso, lo que puede degradar la clasificación de documentos extensos.
- Solo batch 1 y ejecución secuencial: no hay soporte de lotes mayores ni de acceso concurrente a un mismo runner, lo que limita el throughput en despliegues con alta concurrencia.
- Sin soporte de entrenamiento, ni de salidas de estados ocultos o de atención.
- Rendimiento reproducible solo con el adaptador incluido: cargar el checkpoint con un loader genérico de desquantización no reproduce la latencia publicada.
- La evaluación cubre 664 ejemplos de clasificación temática en inglés y ruso. No hay evidencia publicada sobre el resto de idiomas del modelo base, tareas de enrutado, clasificación de seguridad, contextos largos ni ajuste few-shot.
- Las puntuaciones proceden de un protocolo propio y no deben compararse directamente con los benchmarks agregados de la model card del modelo base.
- Las mediciones son de una única GPU, con relojes y temperaturas de portátil no fijados, y sobre un conjunto de evaluación pequeño. No son una afirmación universal de rendimiento ni de calidad.
- Riesgo de sesgo: no se documenta ningún análisis de sesgo y el modelo hereda las características del corpus de entrenamiento del modelo base, no disponible.
- En clasificación, el riesgo principal no es la alucinación de contenido, sino la asignación de etiquetas incorrectas o poco calibradas. El ajuste del umbral `threshold` es responsabilidad del integrador y no está evaluado en la documentación.
- Licencia Apache 2.0 en este derivado, lo que permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base knowledgator/gliclass-multilang-ultra antes de un despliegue en producción.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que carece de validación independiente por parte de la comunidad.
- Requisitos de entorno estrictos: probado con Python 3.12.9 en Windows, PyTorch 2.11.0, CUDA 12.8 y driver 610.62. Otras combinaciones no están validadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/badbat4560/gliclass-multilang-ultra-fp8w8a8
- Modelo base: https://huggingface.co/knowledgator/gliclass-multilang-ultra
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
