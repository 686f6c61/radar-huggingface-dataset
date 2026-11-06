# klpeng/uce-gemma-80k

## Resumen

UCE Gemma (Universal Concept Encoder) es un modelo derivado de `google/embeddinggemma-2` desarrollado por el usuario klpeng que transforma texto en puntuaciones de activación sobre un vocabulario cerrado de 80.513 conceptos nombrados. No es un modelo generativo: es un codificador que produce una matriz dispersa de `(n_textos, 80513)` conservando los 128 conceptos con mayor puntuación por texto, con valores sigmoideos no calibrados como probabilidades. Su propósito es la interpretabilidad y el análisis semántico de textos mediante conceptos legibles, no la generación libre.

El modelo se presenta como la versión Gemma de una familia previa (Gemini UCD, con 131.072 características) y hereda de ella los ficheros de prevalencias base del corpus Gemini, remapeados a los 80.513 identificadores actuales. Incluye además un fichero de fidelidades por concepto evaluadas con un juez automático (GPT-6 Luna con razonamiento desactivado). El repositorio ocupa 0,9 GB y contiene pesos en safetensors, junto con utilidades Python (`uce_gemma`) para cargar, codificar y explicar resultados.

Su relevancia actual reside en la combinación de un codificador de embeddings moderno con una capa de conceptos interpretables y estadísticas de prevalencia y fidelidad publicadas, lo que facilita auditorías semánticas, enriquecimiento de datasets y análisis de sesgos a nivel de concepto. La información pública disponible es escasa en cuanto a arquitectura interna, datos de entrenamiento y licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de `google/embeddinggemma-2`; codificador de texto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (incluyendo el prompt de documento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensión de salida | 80.513 conceptos (matriz dispersa, top-128 por texto) |
| Tipo de salida | puntuaciones sigmoideas (no probabilidades calibradas) |
| Modelo base | `google/embeddinggemma-2` |
| Tamaño del repositorio | 0,9 GB |
| Dispositivos soportados | CUDA y CPU (`device="cuda"` o `device="cpu"`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que el modelo deriva de `google/embeddinggemma-2` y que actúa como codificador de conceptos. La salida es una matriz dispersa de forma `(número_de_textos, 80513)` en la que se retienen los 128 conceptos con mayor puntuación por texto; los valores son puntuaciones sigmoideas, no probabilidades calibradas. El paquete incluye una clase `UCEGemma` con métodos `encode`, `explain` y `get_prevalence`, y una variante `UCEGemmaEncoder`.

No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Sí se describen artefactos auxiliares: `prevalences.csv`/`prevalences.npz` con estadísticas base de 89.827.558 filas del corpus Gemini (incluyendo duplicados), calculadas originalmente con el codificador Gemini histórico de 131.072 características y remapeadas a los 80.513 conceptos actuales; y `fidelities.csv` con precisión, recall, F1, exactitud, tasas YES positivo/cero y matrices de confusión por concepto, evaluadas con GPT-6 Luna (razonamiento desactivado) sobre textos de test reservados con límite de 256 palabras. El umbral de referencia es sigmoide crudo >0,92278 frente a ausencia en el top-128 disperso almacenado, con hasta 30 positivos y 30 ceros dispersos por concepto.

## Capacidades

- Codificación de texto a conceptos: convierte una cadena o lista de cadenas en puntuaciones sobre 80.513 conceptos nombrados.
- Explicabilidad: el método `explain` devuelve, para cada texto, los conceptos con mayor activación con `concept_id`, `label` y `activation`.
- Procesamiento por lotes: acepta listas de cadenas y devuelve una matriz dispersa por texto.
- Contexto de hasta 8.192 tokens por entrada, incluyendo el prompt de documento.
- Consulta de prevalencias base: `get_prevalence(concept_id)` devuelve recuentos, fracciones de prevalencia y cotas superiores de Clopper-Pearson al 99 % unilateral para umbrales >0,05 y >0,1.
- Explicación enriquecida: `explain(..., include_prevalence=True)` adjunta estadísticas base por concepto.
- Ficheros de fidelidad por concepto con métricas de precisión, recall, F1 y exactitud.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Auditoría semántica de corpus: codificar un conjunto de documentos y analizar la distribución de conceptos activados para detectar temas sobrerrepresentados o infrarepresentados frente a las prevalencias base del corpus Gemini.
- Enriquecimiento de datasets para etiquetado débil: usar los 128 conceptos top por texto como etiquetas candidatas que luego se validan manualmente, reduciendo el coste de anotación en dominios como noticias o documentación técnica.
- Análisis de sesgos a nivel de concepto: comparar tasas de activación de conceptos sensibles (por ejemplo, nacionalidades, profesiones o géneros) entre subconjuntos de un corpus y contrastarlas con las cotas de Clopper-Pearson publicadas.
- Búsqueda y filtrado interpretable: indexar documentos por sus conceptos activados y permitir consultas del tipo "documentos con activación alta en el concepto X y baja en el concepto Y", con explicación legible del resultado.
- Monitorización de contenido en producción: codificar textos entrantes y activar alertas cuando conceptos concretos superen umbrales definidos a partir de las prevalencias base, con revisión humana posterior.
- Investigación en interpretabilidad: usar `fidelities.csv` para seleccionar conceptos con F1 alto y estudiar qué patrones léxicos o semánticos los disparan, comparando con el codificador Gemini histórico.
- Análisis de conversaciones o tickets de soporte: codificar transcripciones de hasta 8.192 tokens para clasificar motivos de contacto por concepto y priorizar colas según la combinación de conceptos detectados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye métricas de fidelidad por concepto (precisión, recall, F1, exactitud, tasas YES positivo/cero y matrices de confusión) evaluadas con GPT-6 Luna sobre textos de test reservados, pero no se proporcionan valores agregados numéricos en la información disponible; `fidelity_summary.json` contendría los resultados agregados según la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 0,9 GB, lo que sugiere que los pesos en precisión nativa caben en GPUs de consumo, pero la información no confirma la precisión ni el consumo real en inferencia.
- GPU recomendadas: no disponibles. El modelo soporta `device="cuda"` y `device="cpu"`; no se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: probablemente viable por el tamaño del repositorio (0,9 GB), pero no confirmado en la información disponible.
- Despliegue: el paquete se distribuye con `requirements.txt` y se instala vía `huggingface_hub` (`hf download`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante la clase `UCEGemma` en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UCE Gemma 80k | Codificador de conceptos sobre `embeddinggemma-2` | 80.513 conceptos, top-128 disperso | 8.192 tokens | no disponible | Hugging Face (`klpeng/uce-gemma-80k`) |
| Gemini UCD 80k | Codificador de conceptos (familia previa) | 80.513 conceptos remapeados desde 131.072 | no disponible | no disponible | Hugging Face (`klpeng/gemini-ucd-80k`) |
| `google/embeddinggemma-2` | Modelo de embeddings de texto | Vector denso de embeddings | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones de salida son sigmoideas y no están calibradas como probabilidades; no deben interpretarse directamente como confianza.
- Las prevalencias incluidas son líneas base históricas del corpus Gemini, no medidas sobre salidas de UCE Gemma; los umbrales (>0,05 y >0,1) se aplican a activaciones Gemini históricas, no a las puntuaciones sigmoideas de este modelo.
- Las prevalencias se calcularon sobre 89.827.558 filas del corpus Gemini, incluyendo duplicados, lo que puede sesgar las tasas hacia los documentos sobrerrepresentados en ese corpus.
- Las métricas de fidelidad por concepto son juicios automáticos de GPT-6 Luna con razonamiento desactivado, no anotación humana, y no están ponderadas por la prevalencia del corpus.
- Los conceptos sin ejemplos positivos tienen celdas vacías de recall y F1 y quedan excluidos de las medias correspondientes.
- Solo se retienen los 128 conceptos con mayor puntuación por texto; conceptos con activación real pero fuera del top-128 no aparecen en la salida.
- La licencia no está disponible, por lo que el uso comercial no puede confirmarse; debe verificarse con el autor y con la licencia del modelo base `google/embeddinggemma-2`.
- No se documentan los idiomas soportados; el rendimiento multilingüe es desconocido.
- No se documentan sesgos conocidos del modelo más allá de los derivados del corpus Gemini usado para las prevalencias.
- El modelo no genera texto; no debe emplearse para tareas generativas, de razonamiento libre ni de tool calling.
- El límite de 8.192 tokens por entrada, incluyendo el prompt de documento, restringe el análisis de documentos largos sin troceado previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klpeng/uce-gemma-80k
- Repositorio de prevalencias base (Gemini UCD): https://huggingface.co/klpeng/gemini-ucd-80k
- Modelo base: https://huggingface.co/google/embeddinggemma-2
