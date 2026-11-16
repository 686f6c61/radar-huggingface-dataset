# larc-iu/dmrst-xlm-roberta-base-prstc

## Resumen

`larc-iu/dmrst-xlm-roberta-base-prstc` es un parser de discurso RST (Rhetorical Structure Theory) en persa, construido sobre el encoder multilingüe `FacebookAI/xlm-roberta-base` y entrenado con la librería Dipo del grupo LARC (IU). Implementa la arquitectura DMRST, un marco conjunto para segmentación y parsing de discurso a nivel de documento presentado originalmente en CODI 2021, y lo aplica al Persian RST Corpus con el split oficial de DISRPT 2025.

El modelo resuelve una tarea concreta: dada una secuencia de texto en persa sin tokenizar, predice la segmentación en unidades de discurso elementales (EDU), el árbol de relaciones retóricas y la nuclearidad de cada relación, con 21 etiquetas posibles. No es un modelo generativo de propósito general, sino un componente especializado para análisis discursivo que se integra en pipelines de NLP mediante la librería `dipo`.

Es relevante para investigadores que trabajan en análisis del discurso en lenguas de bajos recursos, en particular persa, y para quienes necesitan extraer estructuras retóricas para tareas posteriores como resumen, análisis de argumentación o evaluación de coherencia textual. El repo ocupa 1,6 GB y las métricas publicadas en la model card corresponden a este checkpoint concreto, no a los resultados del paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabecera DMRST para segmentación y parsing de discurso |
| Parametros totales | no disponible (encoder base XLM-RoBERTa base: ~278 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (`fa`) |
| Licencia | MIT (heredada de `xlm-roberta-base`); datos de entrenamiento sin licencia declarada, uso solo para investigación |
| Formato de pesos | no disponible (repo de 1,6 GB, librería `dipo`) |

## Arquitectura y entrenamiento

El modelo reimplementa DMRST, un marco que combina segmentación de EDU y parsing de árboles de discurso en un único modelo entrenado de forma conjunta. La parte de codificación corre a cargo de `xlm-roberta-base`, un transformer encoder multilingüe de tipo RoBERTa con tokenizador SentencePiece; sobre esa representación se apoyan las cabeceras de segmentación (predicción de fronteras BeginSeg a nivel de token) y de parsing (predicción de spans, nuclearidad y relación). El modelo opera a nivel de documento, no de frase aislada.

El entrenamiento se realizó con la librería Dipo sobre el Persian RST Corpus, con el split train/dev/test de DISRPT 2025. Se entrenó únicamente con el split de entrenamiento y el checkpoint se seleccionó por `e2e_full_f1` en dev. El texto de entrada se procesa con la puntuación espaciada del corpus reincorporada para que coincida con texto crudo, y el modelo colapsa todos los espacios en blanco, por lo que no ve saltos de línea; la función `predict_from_text` añade cortes de segmento en párrafos separados por línea en blanco y tras líneas cortas tipo encabezado. Las 21 etiquetas de relación cubren tanto relaciones núcleo-satélite (`rst`) como multinucleares (`multinuc`). No se documenta en la información disponible el uso de RLHF, DPO ni datos de preentrenamiento adicionales más allá del corpus citado.

## Capacidades

- Segmentación de discurso en EDUs a partir de texto crudo en persa, sin necesidad de tokenización ni limpieza previa.
- Parsing de árboles RST a nivel de documento con 21 etiquetas de relación (attribution, background, cause, comparison, condition, contrast, elaboration, enablement, evaluation, explanation, joint, manner-means, summary, temporal, topichange, topicomment, topidrift, entre otras).
- Predicción de nuclearidad (núcleo vs. satélite) y de estructuras multinucleares.
- Salida en formato RS4 mediante `tree.to_rs4_string()`.
- Procesamiento por CLI (`dipo dmrst predict`) y por API Python (`DMRSTParser.from_pretrained`).
- Entrada de texto crudo o ficheros `.txt` individuales y directorios completos.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un parser discriminativo especializado.

## Casos de uso

- Análisis de coherencia en textos periodísticos persas: el modelo descompone noticias en EDUs y relaciones retóricas, permitiendo medir la estructura argumentativa de un corpus de medios.
- Extracción de estructuras discursivas para resumen: los árboles RST generados identifican núcleos y elaboraciones, que pueden guiar la selección de contenido en sistemas de sumarización extractiva o abstractiva.
- Investigación en lingüística computacional del persa: permite comparar anotaciones automáticas con el Persian RST Corpus y estudiar la distribución de relaciones retóricas en distintos géneros.
- Preprocesamiento para análisis de argumentación: las relaciones de `cause`, `contrast` y `explanation` sirven como señal para detectar estructuras argumentales en textos de opinión.
- Evaluación de generación de texto en persa: los árboles RST pueden usarse como referencia para métricas de coherencia discursiva en sistemas de generación.
- Análisis de documentos largos por lotes: la CLI acepta directorios completos de `.txt` con `--output-dir`, lo que facilita procesar corpus extensos sin escribir código.
- Construcción de datasets anotados: el parser puede generar anotaciones preliminares de discurso que luego se revisan manualmente, reduciendo el coste de anotación.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 × 100, Parseval original, spans hoja triviales excluidos). El checkpoint se seleccionó por `e2e_full_f1` en dev.

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 91,9 | 65,3 | 47,3 | 38,7 | 37,5 | 72,4 | 56,9 | 47,4 | 46,1 |
| test | 93,1 | 60,9 | 41,8 | 33,7 | 32,2 | 67,3 | 48,7 | 40,1 | 38,7 |

`E2E` evalúa árboles predichos desde texto crudo, incluyendo segmentación; `Gold-EDU` los evalúa con la segmentación dorada. `Seg` es el F1 BeginSeg por token calculado durante el entrenamiento, que puede quedar hasta un punto por debajo del scorer oficial de DISRPT. No se dispone de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un encoder de ~278 M de parámetros, la inferencia en fp32 requiere del orden de 1-2 GB de VRAM, y en fp16 aproximadamente la mitad, aunque esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, pero no se documenta en la model card.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no se confirma en la información disponible.
- Opciones de despliegue: la librería `dipo` (instalable con `pip install dipo`), vía CLI o API Python. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larc-iu/dmrst-xlm-roberta-base-prstc | ~278 M (encoder base) | no disponible | Parsing RST en persa | MIT (pesos); datos solo investigación | Hugging Face, 6 descargas |
| DMRST original (Liu et al., 2021) | no disponible | no disponible | Parsing RST multilingüe | no disponible | Paper CODI 2021 |
| Otros parsers Dipo de LARC | no disponible | no disponible | Parsing RST en otras lenguas | no disponible | Repo `larc-iu/dipo` |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente en persa; no se garantiza su funcionamiento en otras lenguas pese a usar un encoder multilingüe.
- El corpus de entrenamiento (Persian RST Corpus) no tiene declaración de licencia, por lo que el uso queda restringido a investigación según el propio autor.
- Los pesos heredan los términos de `xlm-roberta-base` (MIT), pero la combinación con datos sin licencia limita el uso comercial.
- El modelo colapsa todos los espacios en blanco y no ve saltos de línea; los cortes por párrafo y encabezados se añaden de forma heurística en `predict_from_text`, lo que puede introducir errores en documentos con formato peculiar.
- Las puntuaciones provienen de una única ejecución de entrenamiento; en conjuntos de test pequeños la variación entre ejecuciones puede ser de varios puntos.
- Riesgo de alucinación estructural: al predecir árboles sobre texto fuera de dominio (no periodístico), la calidad de segmentación y relaciones puede degradarse notablemente.
- Sesgos potenciales derivados del corpus de noticias persas, que puede sobrerrepresentar ciertos géneros y estilos.
- No es un modelo generativo: no produce texto, solo estructuras de discurso.
- Las métricas de la model card corresponden a este checkpoint y no a los resultados del paper asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/dmrst-xlm-roberta-base-prstc
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper DMRST (CODI 2021): https://aclanthology.org/2021.codi-main.15/
- Paper Dipo (arXiv:2610.17658): https://arxiv.org/abs/2610.17658
- Persian RST Corpus: https://github.com/hadiveisi/PersianRST
- Modelo base XLM-RoBERTa: https://huggingface.co/xlm-roberta-base
