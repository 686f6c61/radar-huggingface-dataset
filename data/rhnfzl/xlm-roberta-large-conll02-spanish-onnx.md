# rhnfzl/xlm-roberta-large-conll02-spanish-onnx

## Resumen

`rhnfzl/xlm-roberta-large-conll02-spanish-onnx` es una exportación a formato ONNX del modelo `FacebookAI/xlm-roberta-large-finetuned-conll02-spanish`, un encoder transformer de tipo XLM-RoBERTa Large afinado para reconocimiento de entidades nombradas (NER) en español sobre el corpus CoNLL-2002. Lo publica el usuario rhnfzl como artefacto auxiliar del proyecto SqueakyCleanText, una librería de limpieza y anonimización de texto, y está pensado para ser consumido directamente con `onnxruntime` sin dependencia de PyTorch en producción.

La relevancia del modelo es fundamentalmente operativa: reproduce en ONNX (opset 18, IR 8, pesos FP32) el comportamiento del checkpoint original de Facebook AI, con una comprobación de paridad numérica publicada por el autor que reporta una diferencia máxima de logits de 2,5e-05 sobre una muestra fija de 53 tokens. No introduce mejoras de arquitectura ni de entrenamiento, sino que traslada un modelo ya existente a un runtime más ligero para despliegue en CPU.

La arquitectura subyacente es XLM-RoBERTa Large, un transformer encoder de 24 capas con aproximadamente 560 millones de parámetros y ventana de contexto de 512 tokens. El modelo resuelve la tarea de etiquetado BIO de cuatro categorías (PER, ORG, LOC, MISC) en textos en español y se distribuye bajo licencia MIT, con un tamaño de repositorio de 2,3 GB que corresponde casi íntegramente a los pesos FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa Large), exportado a grafo ONNX |
| Parametros totales | Aproximadamente 560 millones (heredados de XLM-RoBERTa Large; no verificado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (el propio autor indica que las entradas mas largas deben dividirse) |
| Tipos de cuantizacion | No disponible. El autor indica que la exportacion es FP32 sin paso de cuantizacion ni optimizacion |
| Idiomas soportados | Español (`es`) |
| Licencia | MIT |
| Formato de pesos | ONNX: `model.onnx` (grafo, 0,5 MB) y `model.onnx_data` (pesos, 2,2 GB); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es una exportacion directa del checkpoint `FacebookAI/xlm-roberta-large-finetuned-conll02-spanish`, que a su vez parte de XLM-RoBERTa Large y se afina sobre CoNLL-2002 en español para token classification. La exportacion se realizo con `optimum.exporters.onnx --task token-classification`, sin fijar revision del repositorio base; el autor infiere que se exporto la revision `a7c5f08c766a`, ultimo commit del branch `main` antes de la subida. El grafo declara opset 18 e IR version 8, y el campo `producer` indica `pytorch 2.10.0`. No hay flags adicionales de exportacion, ni `--device`, ni modificaciones de grafo.

El resultado es un grafo con dos entradas (`input_ids`, `attention_mask`) y una salida (`logits`, una fila por token). El autor publica una comprobacion de paridad frente al modelo PyTorch original sobre tres frases (53 tokens): IDs de token identicos, `id2label` coincidente, misma etiqueta top-1 en 53 de 53 tokens y diferencia maxima absoluta de logits de 2,5e-05. Es una validacion de equivalencia funcional, no una medida de precision. La model card advierte explicitamente de que no existe ninguna cifra de accuracy para este modelo en los benchmarks de SqueakyCleanText (revisados hasta la version 0.10.0), ya que esos benchmarks puntuan el pipeline completo y no el modelo aislado.

## Capacidades

- Reconocimiento de entidades nombradas en español con esquema BIO y cuatro tipos: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC).
- Etiquetado a nivel de subtoken: la salida es una etiqueta por token del tokenizador, por lo que la agrupacion en entidades requiere postprocesado propio o el uso de SqueakyCleanText.
- Integracion como backend por defecto para español en SqueakyCleanText, bajo la clave `SPANISH`, fijado a la revision `ef52a7f08172203c763d51fe36660d36985bb388`.
- Ejecucion en CPU mediante `onnxruntime` con el `CPUExecutionProvider`, sin necesidad de GPU ni de PyTorch en el entorno de inferencia.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modos de razonamiento extendido; es exclusivamente un modelo discriminativo de etiquetado.
- No soporta function calling ni ninguna interfaz conversacional.
- Capacidad multilingue limitada en la practica: aunque la base XLM-RoBERTa es multilingue, el ajuste y la exportacion estan orientados a español y la model card solo declara `es`.

## Casos de uso

- Anonimizacion y seudonimizacion de textos clinicos o legales: el modelo detecta nombres de personas y organizaciones para sustituirlos por marcadores (`<PERSON>`, `<ORGANISATION>`) antes de almacenar o compartir el texto, que es precisamente el flujo que implementa SqueakyCleanText.
- Preprocesado de corpus para entrenamiento de modelos generativos: eliminar o enmascarar entidades nombradas en datasets en español para reducir riesgo de memorizacion de datos personales y de filtracion de PII en las salidas.
- Extraccion de entidades en pipelines de monitorizacion de medios: identificar organizaciones y localidades en titulares y cuerpos de noticia para construir indices de menciones y analisis de cobertura.
- Enriquecimiento de bases de datos CRM o de soporte: procesar transcripciones y correos en español para poblar campos estructurados de empresa, ciudad y persona con etiquetado automatico y revision humana posterior.
- Servicio de inferencia en CPU de bajo coste: al estar en ONNX con `onnxruntime`, puede desplegarse en contenedores sin GPU y escalar horizontalmente; es adecuado cuando el volumen es moderado y el coste por GPU no esta justificado.
- Componente de una cadena de limpieza de texto mas amplia: combinado con los otros backends de SqueakyCleanText (ingles y multilingue) mediante el ensemble por defecto, para normalizar y etiquetar textos mixtos antes de indexacion o analisis.
- Filtrado previo en tareas de moderacion o compliance: marcar menciones a organizaciones y personas en comunicaciones internas para revision por parte de equipos legales o de proteccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no existe cifra de accuracy para este modelo en los benchmarks de SqueakyCleanText y que la comprobacion de paridad publicada (53 tokens, diferencia maxima de logits de 2,5e-05) demuestra equivalencia con el checkpoint PyTorch, no rendimiento predictivo.

| Metrica | Resultado | Contexto |
|---|---|---|
| Diferencia maxima absoluta de logits vs PyTorch | 2,5e-05 | 3 frases, 53 tokens, CPU |
| Coincidencia de etiqueta top-1 | 53 / 53 tokens | Misma muestra |
| Identidad de IDs de token | Si | Tokenizador ONNX vs tokenizador base |
| Accuracy NER (CoNLL-2002 es) | No disponible | No publicada para este export |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base, ya que el modelo se ejecuta en CPU con `onnxruntime`. En GPU, los pesos FP32 de 2,2 GB requieren al menos unos 3 GB de VRAM contando activaciones y overhead del runtime; no hay cifra oficial publicada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede alojar los pesos FP32; no se han publicado mediciones especificas para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM, aunque el caso de uso declarado por el autor es CPU.
- Opciones de despliegue: `onnxruntime` (probado por el autor con la version 1.32.0), SqueakyCleanText (`pip install squeakycleantext`), y cualquier servidor compatible con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de token classification.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por frase ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `rhnfzl/xlm-roberta-large-conll02-spanish-onnx` | ~560 M | 512 | ONNX FP32 | MIT | Export del checkpoint de Facebook AI; sin cuantizar |
| `FacebookAI/xlm-roberta-large-finetuned-conll02-spanish` | ~560 M | 512 | safetensors / PyTorch | No disponible en la informacion proporcionada | Modelo original; requiere PyTorch o transformers |
| `rhnfzl/wikineural-multilingual-ner-onnx` | No disponible | No disponible | ONNX | CC BY-NC-SA 4.0 (solo investigacion no comercial) | Backend multilingue del mismo autor; restriccion de uso comercial |

La comparacion directa con alternativas de la misma categoria (por ejemplo, modelos españoles tipo RoBERTa-BNE afinados para NER) no esta disponible en la informacion proporcionada, ya que no se aportan datos de rendimiento comparables.

## Limitaciones y advertencias

- No hay ninguna metrica de precision publicada para este modelo; la unica validacion disponible es de equivalencia numerica frente al checkpoint original sobre 53 tokens, lo que no garantiza calidad en dominios distintos de CoNLL-2002.
- El modelo solo etiqueta cuatro tipos de entidad (PER, ORG, LOC, MISC) con esquema BIO; no cubre fechas, cantidades, productos ni otras categorias habituales en NER.
- Ventana de contexto de 512 tokens: cualquier entrada mas larga debe fragmentarse antes de la inferencia, con el riesgo de partir entidades en los limites de fragmento.
- El modelo devuelve etiquetas por subtoken; sin un postprocesado correcto (agrupacion y alineacion con el texto original) las entidades extraidas seran incorrectas o fragmentadas.
- La licencia MIT se asume desde el modelo base, cuya model card original indica "More information needed"; conviene verificar los terminos antes de un uso comercial critico.
- Aunque el backend este bajo MIT, el ensemble por defecto de SqueakyCleanText para español carga tambien `rhnfzl/wikineural-multilingual-ner-onnx`, que es CC BY-NC-SA 4.0 y restringe el uso a investigacion no comercial; es necesario configurar SCT para prescindir de ese backend si se busca uso comercial.
- Riesgo de sesgo heredado del corpus CoNLL-2002: dominado por texto periodistico de finales de los noventa y principios de los dos mil, con cobertura desigual de variedades del español y de nombres no occidentales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de entidades, especialmente en textos informales, con errores ortograficos o con jerga.
- No se ha verificado el rendimiento del export frente al original en textos largos ni en dominios fuera de CoNLL; la paridad solo esta comprobada en una muestra reducida.
- El repositorio declara la arquitectura `XLMRobertaForMaskedLM` en el `config.json` base, lo que puede confundir a herramientas que infieran la tarea desde la configuracion; el autor aclara que el grafo ONNX es de token classification.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhnfzl/xlm-roberta-large-conll02-spanish-onnx
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll02-spanish
- Revision del modelo base inferida: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll02-spanish/tree/a7c5f08c766adcbd6c22f343145fa65d38b3c1d5
- Repositorio SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText
- Script de exportacion ONNX: https://github.com/rhnfzl/SqueakyCleanText/blob/f9e4a4247dbc2e86187a994cb23304b33e95a6c3/scripts/export_onnx_models.py
- Documentacion de licencias de backends NER: https://github.com/rhnfzl/SqueakyCleanText/blob/main/docs/NER_BACKENDS.md#model-licences
- Resultados de benchmarks de SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText/tree/main/benchmarks/results
- Modelo multilingue complementario: https://huggingface.co/rhnfzl/wikineural-multilingual-ner-onnx
