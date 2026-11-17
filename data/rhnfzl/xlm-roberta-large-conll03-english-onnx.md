# rhnfzl/xlm-roberta-large-conll03-english-onnx

## Resumen

`rhnfzl/xlm-roberta-large-conll03-english-onnx` es una exportación a formato ONNX del modelo `FacebookAI/xlm-roberta-large-finetuned-conll03-english`, un transformer encoder de tipo XLM-RoBERTa en su variante *large* ajustado para reconocimiento de entidades nombradas (NER) sobre el corpus CoNLL-2003 en inglés. Lo publica el autor rhnfzl como artefacto de soporte para su herramienta SqueakyCleanText, un limpiador de texto que sustituye entidades por etiquetas anonimizadas. No se trata de un modelo nuevo: es una conversión de pesos y grafo para inferencia con ONNX Runtime, sin cuantización ni optimización adicional.

La relevancia práctica es doble. Por un lado, permite ejecutar un NER de calidad (basado en el XLM-R large de 560 M de parámetros) sin depender de PyTorch en producción, lo que simplifica el despliegue en contenedores ligeros y en pipelines de CPU. Por otro, la model card documenta de forma inusualmente rigurosa el proceso de exportación, la revisión exacta del modelo base y una comprobación de paridad numérica frente al original, algo poco habitual en repositorios derivados.

El modelo etiqueta cuatro tipos de entidad (persona, organización, localización y miscelánea) sobre texto en inglés, con un límite de 512 tokens por fragmento y una licencia MIT heredada del modelo padre. Su uso previsto es la anonimización y el preprocesado de texto, no la generación ni el razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa large (exportado a ONNX, opset 18, IR version 8) |
| Parámetros totales | 560 M (heredados del modelo base XLM-RoBERTa large) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por fragmento; entradas mayores deben dividirse |
| Tipos de cuantización | ninguno; pesos en FP32 (el script de exportación no aplica cuantización) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX: `model.onnx` (grafo, 0,5 MB) y `model.onnx_data` (pesos, 2,2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa large, un transformer encoder de 24 capas con atención multi-cabeza bidireccional, preentrenado de forma multilingüe y ajustado posteriormente por Facebook AI sobre CoNLL-2003 en inglés para la tarea de *token classification*. La exportación a ONNX conserva únicamente las entradas `input_ids` y `attention_mask` y una salida `logits` con una fila por token; no incluye cabezas adicionales ni pasos de post-procesado.

El artefacto se generó con `optimum.exporters.onnx` mediante el script `scripts/export_onnx_models.py` del repositorio SqueakyCleanText, ejecutado en CPU y sin fijar revisión del modelo base. La revisión efectiva se infiere como `18f95e9924f3f452df09cc90945073906ef18f1e` (último commit del repositorio base antes de la subida, de 2024-02-19). El autor documenta una comprobación de paridad sobre 3 frases y 51 tokens: identificadores de token idénticos, `id2label` idéntico, misma etiqueta top-1 en 51/51 tokens y una diferencia máxima absoluta de logits de 4,3e-05. Es una muestra pequeña y no constituye una medida de precisión.

Un detalle técnico relevante es el conjunto de etiquetas: `B-LOC`, `B-MISC`, `B-ORG`, `I-LOC`, `I-MISC`, `I-ORG`, `I-PER`, `O`. No existe `B-PER`, y el esquema es IOB1, no IOB2: una entidad suele comenzar con `I-` y `B-` solo marca el inicio de una entidad nueva inmediatamente después de otra del mismo tipo. Cualquier post-procesado debe agrupar tokens conforme a IOB1 y no asumir que `B-` inicia siempre una entidad.

## Capacidades

- Reconocimiento de entidades nombradas en inglés para cuatro categorías: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC).
- Etiquetado a nivel de subword: devuelve una etiqueta por token del tokenizador, que el consumidor debe agrupar en entidades.
- Inferencia con ONNX Runtime en CPU, sin dependencia de PyTorch en tiempo de ejecución.
- Integración directa con SqueakyCleanText, que mapea PER, ORG, LOC y MISC a `<PERSON>`, `<ORGANISATION>`, `<LOCATION>` y `<MISC>`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta *tool calling*, *function calling* ni flujos de agentes.
- No dispone de modo *thinking* ni de decodificación especulativa.
- Capacidad multilingüe limitada al inglés en este ajuste concreto, pese al preentrenamiento multilingüe del modelo base.

## Casos de uso

- Anonimización previa a almacenamiento o envío a terceros: el modelo detecta nombres de persona y organización en textos en inglés y permite sustituirlos por marcadores antes de persistir logs, tickets o correos, reduciendo la exposición de datos personales.
- Preprocesado en pipelines de NLP: se puede ejecutar como paso previo de *masking* de entidades en tareas de clasificación, clustering o búsqueda semántica, de modo que los embeddings no queden dominados por nombres propios concretos.
- Limpieza de corpus para entrenamiento: SqueakyCleanText lo usa por defecto para inglés y como parte de los ensembles neerlandés, alemán y español, además del *fallback* para idiomas no detectados; sirve para normalizar datasets antes de un ajuste fino.
- Extracción de entidades en documentos empresariales: informes, contratos y actas en inglés donde interesa poblar un índice de organizaciones y localizaciones para búsqueda facetada.
- Enriquecimiento de registros CRM o de soporte: a partir de correos o transcripciones en inglés, extraer la organización y la localización mencionadas para autocompletar campos estructurados.
- Despliegue en entornos sin GPU y sin PyTorch: al ser ONNX FP32, se ejecuta con `onnxruntime` en CPU dentro de contenedores pequeños, lo que encaja en funciones serverless o en servicios con presupuesto de memoria ajustado.
- Moderación y revisión de contenido: detección de menciones a personas y organizaciones para colas de revisión humana, con la salvedad de que el modelo no evalúa toxicidad ni intención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no incluye cifras de precisión para este artefacto y que la comprobación de paridad (51 tokens) no es una medida de exactitud. Tampoco se proporcionan datos de latencia ni de *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2-2,5 GB en FP32 para los pesos, más el espacio de activaciones, que depende de la longitud de secuencia. Al ser un encoder de 24 capas y 560 M de parámetros, una secuencia de 512 tokens requiere varios cientos de MB adicionales.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria, como RTX 3050, RTX 4060, RTX 4090, A100 o H100. El modelo no aprovecha el paralelismo de GPUs de gama alta por su tamaño reducido.
- Cabe en GPU de consumo: sí, en todas las GPU consumer con 4 GB o más. También funciona en CPU, que es el modo documentado por el autor.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider` o `CUDAExecutionProvider`), integración vía SqueakyCleanText. Al ser un artefacto ONNX puro, no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI, orientados a modelos generativos.
- Latencia y throughput: no disponibles. El autor solo documenta que la comprobación de paridad se ejecutó en CPU con Python 3.12.15, torch 2.15.0, transformers 4.57.6, onnxruntime 1.32.0 y tokenizers 0.22.2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `rhnfzl/xlm-roberta-large-conll03-english-onnx` | 560 M | 512 tokens | ONNX (FP32) | MIT | Exportación del modelo de Facebook AI; sin cuantización; uso previsto en SqueakyCleanText |
| `FacebookAI/xlm-roberta-large-finetuned-conll03-english` | 560 M | 512 tokens | PyTorch (safetensors/bin) | MIT según el repositorio derivado; la model card original indica "More information needed" | Modelo de referencia del que deriva el artefacto ONNX; requiere PyTorch |
| `rhnfzl/wikineural-multilingual-ner-onnx` | no disponible | no disponible | ONNX | CC BY-NC-SA 4.0 (solo investigación no comercial) | Modelo multilingüe del mismo autor, cargado por defecto junto al inglés en SqueakyCleanText; licencia restrictiva para uso comercial |

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible. Al derivar de CoNLL-2003, un corpus periodístico en inglés, es esperable un sesgo hacia ese dominio y hacia entidades frecuentes en prensa.
- Alucinación: el modelo no genera texto, por lo que no alucina en sentido estricto, pero puede producir etiquetas incorrectas o fragmentar entidades de forma errónea, especialmente en textos fuera de dominio.
- Límite de contexto: 512 tokens por fragmento. Las entradas más largas deben dividirse antes de la inferencia, con el riesgo de partir entidades en la frontera.
- Esquema de etiquetas atípico: no hay `B-PER` y el esquema es IOB1. Un post-procesado que asuma IOB2 o que dependa de `B-PER` producirá agrupaciones incorrectas.
- Idioma: solo inglés. Su uso en los ensembles neerlandés, alemán y español de SqueakyCleanText es una decisión de la herramienta, no una capacidad multilingüe de este ajuste.
- Licencia: MIT, heredada del modelo base según el autor, aunque la model card original indica "More information needed". Conviene verificar la procedencia antes de un uso comercial crítico.
- Dependencia de la herramienta: el flujo documentado de uso pasa por SqueakyCleanText, que también carga por defecto `rhnfzl/wikineural-multilingual-ner-onnx`, con licencia CC BY-NC-SA 4.0 y restricción a investigación no comercial. Para uso comercial hay que revisar la configuración de SqueakyCleanText y desactivar ese segundo modelo.
- Revisión no fijada en la exportación: el script no ancla la revisión del modelo base, por lo que la correspondencia con `18f95e9924f3` es inferida y verificada solo sobre una muestra pequeña.
- Sin métricas de precisión publicadas: no hay forma de evaluar la calidad del etiquetado a partir de la información disponible; se recomienda validar sobre un conjunto propio antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhnfzl/xlm-roberta-large-conll03-english-onnx
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll03-english
- Revisión inferida del modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll03-english/tree/18f95e9924f3f452df09cc90945073906ef18f1e
- Repositorio SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText
- Script de exportación: https://github.com/rhnfzl/SqueakyCleanText/blob/f9e4a4247dbc2e86187a994cb23304b33e95a6c3/scripts/export_onnx_models.py
- Documentación de licencias de modelos de SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText/blob/main/docs/NER_BACKENDS.md#model-licences
- Modelo multilingüe complementario: https://huggingface.co/rhnfzl/wikineural-multilingual-ner-onnx
