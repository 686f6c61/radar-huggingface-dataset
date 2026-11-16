# larc-iu/dmrst-ettin-400m-gum-12.1.0

## Resumen

`larc-iu/dmrst-ettin-400m-gum-12.1.0` es un parser de discurso RST (Rhetorical Structure Theory) a nivel de documento, entrenado con la librería Dipo sobre el corpus GUM 12.1.0 en inglés. Implementa la arquitectura DMRST (Liu, Shi y Chen, CODI 2021), un marco conjunto que realiza segmentación en unidades de discurso elementales (EDU) y construcción del árbol retórico en una sola pasada, y sustituye el encoder original por `jhu-clsp/ettin-encoder-400m`, un encoder tipo BERT de 400 millones de parámetros.

El modelo resuelve una tarea clásica de PLN estructural: dado un texto en ejecución, produce un árbol de discurso con 32 etiquetas de relación (adversativa, causal, elaboración, atribución, etc.) y distinciones de nuclearidad. Es relevante para investigación en análisis del discurso, evaluación de coherencia textual y como componente en pipelines de generación aumentada, resumen o evaluación automática.

El checkpoint se seleccionó por `e2e_full_f1` en el split de desarrollo y se distribuye a través de la librería `dipo`, con pesos derivados del encoder Ettin (licencia MIT) y datos de entrenamiento GUM con licencias mixtas. El repositorio ocupa 7,6 GB, lo que sugiere la presencia de múltiples artefactos además de los pesos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DMRST (parser de discurso RST con encoder transformer Ettin-400m) |
| Parametros totales | 400M (encoder base `jhu-clsp/ettin-encoder-400m`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (heredada del modelo base Ettin); datos GUM con licencias mixtas |
| Formato de pesos | no disponible (repo de 7,6 GB; librería `dipo`) |

## Arquitectura y entrenamiento

El modelo reimplementa DMRST, un framework conjunto para segmentación y parsing RST a nivel de documento. Sobre el encoder Ettin-400m se añaden las cabezas de segmentación (predicción de fronteras EDU token a token) y de parsing (clasificación de relaciones y nuclearidad entre spans). La salida es un árbol RS4 con 32 etiquetas de relación organizadas en pares relación-tipo (rst, multinuc), tal como se detalla en la configuración de entrenamiento publicada.

El entrenamiento se realizó exclusivamente sobre el split de train de GUM 12.1.0 (corpus multigénero en inglés con anotación RST: académico, biografía, ficción, entrevista, noticias, Reddit, discurso, libro de texto, vlog, viaje y whow). El checkpoint se eligió según `e2e_full_f1` en dev. La model card advierte que las puntuaciones provienen de una única ejecución y que la variación entre ejecuciones en conjuntos de test pequeños puede ser de varios puntos. No se documenta el número de tokens de entrenamiento, el uso de RLHF/DPO ni innovaciones como decodificación especulativa.

## Capacidades

- Segmentación automática de texto en unidades de discurso elementales (EDU).
- Construcción de árboles retóricos RST a nivel de documento con 32 etiquetas de relación.
- Clasificación de nuclearidad (núcleo/satélite) y relaciones multinucleares.
- Procesamiento de texto en bruto: no requiere tokenización ni limpieza previa; los saltos de línea y espacios se colapsan internamente.
- Segmentación adicional por párrafos separados por línea en blanco y por líneas cortas tipo encabezado (controlable con `break_at_paragraphs=False`).
- Predicción desde CLI (`dipo dmrst predict`) y desde Python (`DMRSTParser.from_pretrained`).
- Salida en formato RS4 (`tree.to_rs4_string()`).
- Procesamiento por lotes de archivos `.txt` o directorios completos (`--text-file`, `--output-dir`).
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un modelo discriminativo de análisis estructural, no generativo conversacional.

## Casos de uso

- Análisis del discurso en investigación lingüística: el modelo permite obtener árboles RST anotados automáticamente sobre corpus propios en inglés, sustituyendo la anotación manual y facilitando estudios a escala sobre estructura retórica.
- Evaluación de coherencia en generación de texto: los árboles RST predichos pueden compararse con los de referencia para medir la organización discursiva de resúmenes o respuestas generadas por LLM.
- Preprocesamiento para resumen extractivo y abstractivo: las relaciones de elaboración, causalidad y contraste identificadas permiten ponderar oraciones y construir resúmenes guiados por estructura.
- Enseñanza de escritura académica: el árbol RST descompone un ensayo en relaciones de evidencia, motivación y contraste, útil para feedback automatizado sobre organización argumental.
- Análisis de noticias y redes sociales: GUM incluye géneros de noticias y Reddit, por lo que el modelo es adecuado para estudiar estructura discursiva en textos periodísticos y conversacionales (con la restricción de uso no comercial del texto de Reddit).
- Construcción de datasets anotados: el parser puede generar preanotaciones RST sobre grandes volúmenes de texto que luego se corrigen manualmente, reduciendo el coste de anotación.
- Investigación en parsing de discurso: sirve como baseline reproducible para comparar arquitecturas y encoders en la tarea DMRST sobre GUM.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 × 100, Parseval original, spans hoja triviales excluidos):

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 94,6 | 67,6 | 53,9 | 42,0 | 41,9 | 72,3 | 59,5 | 46,6 | 46,4 |
| test | 94,5 | 70,8 | 57,2 | 45,9 | 45,6 | 76,0 | 63,4 | 51,7 | 51,4 |

`E2E` evalúa árboles predichos desde texto en bruto (incluida la segmentación); `Gold-EDU` evalúa con la segmentación de referencia. `Seg` es el F1 BeginSeg por token calculado durante el entrenamiento, que puede quedar hasta un punto por debajo del scorer oficial de DISRPT. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 400M parámetros en fp16 se situaría en torno a 1-2 GB, pero es una estimación no confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño del encoder (400M) sería plausible en GPUs consumer, pero no hay datos oficiales.
- Opciones de despliegue: librería `dipo` (CLI y API Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 7,6 GB, lo que puede implicar artefactos adicionales además de los pesos; conviene verificar el contenido antes de descargar en entornos con espacio limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `larc-iu/dmrst-ettin-400m-gum-12.1.0` | 400M (encoder Ettin) | no disponible | Parsing RST DMRST (inglés) | MIT (base) | Hugging Face, librería `dipo` |
| DMRST original (Liu et al., 2021) | no disponible | no disponible | Parsing RST multilingüe | no disponible | Paper CODI 2021; implementación original |
| Alternativas RST en GUM | no disponible | no disponible | Parsing RST | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado exclusivamente sobre GUM en inglés; no se garantiza comportamiento en otros idiomas.
- Dominio restringido: los 32 tipos de relación y los géneros de GUM limitan la generalización a otros esquemas de anotación RST o a dominios muy distintos.
- Variabilidad entre ejecuciones: la model card advierte que las puntuaciones provienen de una única ejecución y que la variación en test pequeños puede ser de varios puntos; los resultados de esta checkpoint no coinciden necesariamente con los del paper asociado.
- Estructura de líneas: el modelo colapsa todos los espacios en blanco y no ve saltos de línea; la segmentación por párrafos y encabezados la añade `predict_from_text` de forma heurística, no aprendida.
- Licencia de datos: GUM 12.1.0 tiene anotaciones CC BY 4.0, pero los textos conservan las licencias de sus fuentes (de CC BY a CC BY-NC-SA); el texto de Reddit es solo para uso no comercial. Uso previsto: investigación y análisis.
- Licencia del modelo: los pesos heredan los términos del encoder Ettin (MIT), pero el uso comercial debe evaluarse conjuntamente con las restricciones del corpus de entrenamiento.
- Riesgo de alucinación: al ser un modelo discriminativo de parsing, el riesgo se manifiesta como árboles estructuralmente plausibles pero incorrectos, no como texto inventado; conviene validar en dominios fuera de GUM.
- Sin soporte documentado de cuantización ni de despliegue en servidores de inferencia estándar (vLLM, TGI); la integración está ligada a la librería `dipo`.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre un corpus multigénero concreto, puede reflejar las convenciones anotativas y estilísticas de GUM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/dmrst-ettin-400m-gum-12.1.0
- Modelo base Ettin-400m: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper DMRST (CODI 2021): https://aclanthology.org/2021.codi-main.15/
- Paper de Dipo (Gessler y Zeldes, 2026): https://arxiv.org/abs/2610.17658
- Corpus GUM: https://gucorpling.org/gum/
