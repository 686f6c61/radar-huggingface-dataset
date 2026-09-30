# scdivad/hw1-hc3-detector

## Resumen

`scdivad/hw1-hc3-detector` es un modelo de clasificación de texto publicado en HuggingFace por el usuario `scdivad` el 29 de septiembre de 2026. Se distribuye bajo la librería `transformers` con pesos en formato `safetensors` y tiene 22.713.986 parámetros totales, según los metadatos del repositorio. El etiquetado del Hub lo identifica como un modelo basado en BERT y orientado a `text-classification`, además de declararlo compatible con `text-embeddings-inference` y con los endpoints gestionados de HuggingFace.

La model card publicada es la plantilla automática de HuggingFace sin rellenar: no incluye autoría real, descripción, datos de entrenamiento, licencia, idiomas, hiperparámetros ni resultados de evaluación. Toda la información sustantiva sobre el modelo está, por tanto, ausente. El nombre del repositorio sugiere un ejercicio académico (`hw1`) construido sobre el corpus HC3 (Human ChatGPT Comparison Corpus), un conjunto de datos habitual para tareas de detección de texto generado por IA, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado por el autor.

El interés de esta ficha es fundamentalmente documental: se trata de un modelo pequeño (aproximadamente 23 millones de parámetros), de huella mínima y ejecutable en CPU, cuyo uso en producción no está respaldado por ninguna documentación técnica publicada. Cualquier evaluación seria requiere inspeccionar los pesos, los `id2label` del `config.json` y el dataset de entrenamiento, que no se han hecho públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (según el tag del repositorio); encoder transformer bidireccional, detalle de capas y dimensiones no disponible |
| Parametros totales | 22.713.986 (dato de los pesos safetensors) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados presumiblemente en fp32. No hay variantes GGUF ni cuantizaciones declaradas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Compatibilidad declarada | text-embeddings-inference, endpoints_compatible |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

El único indicio arquitectónico es el tag `bert`, que apunta a un encoder transformer bidireccional con cabeza de clasificación de secuencia. Con 22.713.986 parámetros, el modelo queda muy por debajo de BERT-base (110 millones) y en el rango de variantes compactas tipo BERT-small o de encoders destilados, aunque no se dispone de la configuración exacta (número de capas, dimensión oculta, número de cabezas de atención, vocabulario). Tampoco se conoce si parte de un checkpoint preentrenado —por ejemplo `bert-base-uncased` o `distilbert-base-uncased`— ni si se ha aplicado poda o destilación.

No hay información sobre el procedimiento de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO. El nombre `hw1-hc3-detector` y la existencia de repositorios homónimos en otras cuentas (`vivian-ch/hw1-hc3-detector`, `Chengwei-Shen/hw1-hc3-detector`, `Yihangsun/hw1-hc3-detector`) apuntan a una tarea de curso replicada por varios alumnos sobre el corpus HC3, orientada a distinguir texto humano de texto generado por ChatGPT. Esta hipótesis no está confirmada por ninguna fuente y debe tratarse como tal.

## Capacidades

- Clasificación de secuencias de texto: el pipeline declarado es `text-classification`, con un número de etiquetas y un mapeo `id2label` no publicados.
- Compatibilidad con `text-embeddings-inference`: el modelo puede servirse a través de ese motor, lo que sugiere que expone representaciones utilizables como embeddings además de la cabeza de clasificación.
- Despliegue en HuggingFace Inference Endpoints: el tag `endpoints_compatible` indica que el repositorio cumple los requisitos del servicio gestionado.
- Capacidad multilingüe: no disponible; no se declara ningún idioma.
- Tool calling, function calling, razonamiento multi-paso, agentes: no aplica, no es un modelo generativo.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible, no se declaran capacidades multimodales.
- Generación de texto: no soportada. Es un modelo discriminativo, no autoregresivo.

## Casos de uso

Los siguientes escenarios asumen que el modelo cumple la función sugerida por su nombre, es decir, clasificación binaria de texto humano frente a texto generado por IA. Dado que no hay documentación, deben validarse empíricamente antes de cualquier despliegue.

- Filtrado de datos para entrenamiento: dado su tamaño (23 millones de parámetros) y su coste de inferencia mínimo, puede usarse como clasificador de primera pasada para descartar texto sintético en pipelines de curación de corpus, dejando una segunda pasada a un modelo mayor.
- Detección de contenido generado por IA en plataformas editoriales: integrado como señal auxiliar en el flujo de revisión, marcando envíos sospechosos para revisión humana, nunca como decisión automática.
- Moderación de contenido en foros y secciones de comentarios: clasificación por lotes de alta frecuencia, viable en CPU, para priorizar la revisión de textos potencialmente generados de forma masiva.
- Investigación académica sobre detección de texto sintético: punto de partida reproducible y barato para comparar contra RoBERTa, Electra o enfoques basados en Mamba sobre HC3, si se confirma que el entrenamiento usó ese corpus.
- Verificación periodística asistida: señal adicional para el redactor que quiera contrastar si un comunicado o una nota de prensa presenta patrones compatibles con generación automática, siempre acompañada de verificación factual independiente.
- Análisis de integridad en evaluación educativa: cribado de respuestas para detectar posible uso de asistentes generativos, con las cautelas legales y éticas que exige cualquier sistema de este tipo y sin valor probatorio.
- Preetiquetado en anotación de datasets: uso como etiquetador débil para acelerar la construcción de corpus etiquetados, con corrección humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación, no hay cifras de exactitud, F1, precisión o recall, ni comparaciones con líneas base. Tampoco se documentan los datos de test empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en fp32, 45 MB en fp16 y 23 MB en int8, calculando sobre 22.713.986 parámetros y sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es viable incluso en tarjetas integradas o en GPUs de gama de entrada como GTX 1650, RTX 3050 o inferiores. No necesita A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en la práctica totalidad de ellas, y también en CPU sin dificultad.
- Opciones de despliegue: pipeline de `transformers`, `text-embeddings-inference` (declarado compatible), HuggingFace Inference Endpoints (declarado compatible), exportación a ONNX o uso desde `optimum` si se genera la conversión. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables directamente en su estado actual.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para un encoder de este tamaño, una CPU moderna procesa lotes de secuencias cortas en decenas de milisegundos por lote y una GPU de consumo en pocos milisegundos, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en deteccion de texto IA |
|---|---|---|---|---|---|
| scdivad/hw1-hc3-detector | 22,7 M | no disponible | no disponible | HuggingFace, safetensors | no disponible |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | HuggingFace, safetensors | no disponible para esta tarea sin ajuste fino |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | HuggingFace, safetensors | no disponible para esta tarea sin ajuste fino |
| roberta-base | 125 M | 512 tokens | MIT | HuggingFace, safetensors | no disponible para esta tarea sin ajuste fino |

El modelo es entre tres y cinco veces más pequeño que las alternativas habituales de la familia BERT, lo que reduce coste de inferencia y memoria, pero no hay ninguna evidencia publicada que permita afirmar que mantiene una calidad comparable.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de HuggingFace sin ninguna sección completada. No se puede conocer el uso previsto, los datos de entrenamiento ni el significado de las etiquetas sin inspeccionar los pesos y el `config.json`.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución. En la práctica equivale a "todos los derechos reservados" hasta que el autor se pronuncie.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de género, raza, idioma o dominio. Si el corpus es HC3, hereda los sesgos de las respuestas de ChatGPT y de los textos humanos recopilados.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos que pueden perjudicar a personas reales si el modelo se usa para acusar de uso de IA.
- Idiomas: no declarados. Un detector entrenado sobre un corpus mayoritariamente en inglés degrada su rendimiento en castellano u otras lenguas.
- Longitud de contexto: desconocida. Si sigue el patrón BERT, estará limitada a 512 tokens, insuficiente para documentos largos sin troceado previo.
- Uso en producción desaconsejado sin validación previa: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin métricas publicadas y sin autor identificable más allá del nombre de usuario.
- Consideraciones legales y éticas: los detectores de texto generado por IA tienen tasas de error documentadas y su uso como prueba en contextos académicos, laborales o judiciales es problemático. Cualquier despliegue debería ser siempre como señal auxiliar sujeta a revisión humana.
- Riesgo de caducidad: un clasificador entrenado contra las salidas de una versión concreta de un modelo generativo pierde eficacia a medida que los generadores evolucionan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scdivad/hw1-hc3-detector
- Repositorio homónimo de otro usuario: https://huggingface.co/vivian-ch/hw1-hc3-detector
- Repositorio homónimo de otro usuario: https://huggingface.co/Chengwei-Shen/hw1-hc3-detector
- Ficha de terceros sobre el modelo: https://savrn.com/models/hw1-hc3-detector
- Ficha de terceros sobre el modelo: https://free2aitools.com/model/chengwei-shen/hw1-hc3-detector
- Repositorio de experimentos de detección sobre HC3: https://github.com/saugatabose28/LLM-Detector-Experiments-HC3-Dataset
- Artículo referenciado en el tag `arxiv:1910.09700` (procede de la plantilla automática de la model card, no de una publicación del autor): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning citada en la plantilla: https://mlco2.github.io/impact#compute
