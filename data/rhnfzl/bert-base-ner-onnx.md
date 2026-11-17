# rhnfzl/bert-base-NER-onnx

## Resumen

`rhnfzl/bert-base-NER-onnx` es una exportación a formato ONNX del modelo `dslim/bert-base-NER`, un BERT-base afinado para reconocimiento de entidades nombradas (NER) sobre el corpus CoNLL-2003 en inglés. El modelo etiqueta tokens en cuatro categorías: personas (PER), organizaciones (ORG), localizaciones (LOC) y miscelánea (MISC). Lo publica el autor rhnfzl como artefacto auxiliar de su herramienta SqueakyCleanText, un limpiador de texto que anonimiza entidades antes de pasar el texto a modelos de lenguaje.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un afinado adicional, sino de una conversión de formato. La arquitectura subyacente es un transformer encoder BERT-base de 12 capas y ~110 millones de parámetros, con una ventana de contexto de 512 tokens. El aporte práctico es que permite ejecutar NER en CPU con `onnxruntime` sin dependencia de PyTorch, lo que simplifica el despliegue en pipelines de preprocesado de texto.

El autor documenta con detalle el proceso de exportación (opset 18, IR 8, pesos FP32 sin cuantización) y una comprobación de paridad frente al modelo original sobre una muestra de 3 frases y 52 tokens, con una diferencia máxima absoluta de logits de 8,6e-06. No hay métricas de precisión propias: hereda las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), exportado a ONNX |
| Parametros totales | ~110 M (heredados de BERT-base; no se indica cifra exacta en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entradas mayores deben dividirse) |
| Tipos de cuantizacion | ninguno incluido; pesos en FP32 (el autor indica que el script de exportación no aplica cuantización ni optimización) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, 431 MB), opset 18, IR version 8; acompañado de `config.json`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json` |

## Arquitectura y entrenamiento

El modelo es un BERT-base estándar (transformer encoder bidireccional) con una cabeza de clasificación de tokens para NER. No hay entrenamiento propio en esta publicación: los pesos provienen de `dslim/bert-base-NER`, afinado sobre CoNLL-2003 en inglés, y aquí solo se convierten a ONNX mediante `optimum.exporters.onnx` con la tarea `token-classification`. El autor infiere que la revisión base exportada es `d1a3e8f13f8c3566299d95fcfc9a8d2382a9affc` (último commit de `main` antes de la subida, 2024-10-08), ya que el script no fija revisión.

La exportación se ejecutó en CPU (sin flag `--device`), con `pytorch 2.10.0` como productor del grafo, sin flags extra ni pasos de cuantización. Las entradas del grafo son `input_ids`, `attention_mask` y `token_type_ids`; la salida es `logits`, una fila por token. Las etiquetas en `config.json` son, en orden de índice: `O`, `B-MISC`, `I-MISC`, `B-PER`, `I-PER`, `B-ORG`, `I-ORG`, `B-LOC`, `I-LOC`. La comprobación de paridad (2026-11-17) sobre 3 frases y 52 tokens reporta IDs de token idénticos, `id2label` idéntico, misma etiqueta top en 52/52 tokens y diferencia máxima de logits de 8,6e-06.

## Capacidades

- Etiquetado de entidades nombradas a nivel de token en inglés: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC), con prefijos BIO (`B-`/`I-`).
- Clasificación por sub-palabra: el modelo emite una etiqueta por token del tokenizador; el agrupamiento en entidades debe hacerse aparte (o delegarse en SqueakyCleanText).
- Inferencia en CPU mediante `onnxruntime`, sin necesidad de PyTorch en tiempo de ejecución.
- Integración con SqueakyCleanText como modelo `ENGLISH`, incluyendo su uso dentro de los ensembles neerlandés, alemán y español y como fallback para otros idiomas (según advierte el autor, aunque el modelo es solo inglés).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No detecta direcciones de correo, números de teléfono ni otros patrones fuera de las cuatro clases anteriores (limitación declarada por el autor).

## Casos de uso

- Anonimización previa a LLM: usar el modelo para sustituir nombres de personas, organizaciones y lugares por etiquetas (`<PERSON>`, `<ORGANISATION>`, `<LOCATION>`, `<MISC>`) antes de enviar texto a un modelo generativo, reduciendo la exposición de datos personales.
- Preprocesado en pipelines de NLP en CPU: al ejecutarse con `onnxruntime` sin PyTorch, encaja en servicios ligeros o contenedores sin GPU donde el coste de instalar el stack completo de transformers no está justificado.
- Extracción de entidades en documentos ingleses: indexación de nombres de empresas y localizaciones en corpus como noticias, informes o contratos, para alimentar motores de búsqueda o bases de conocimiento.
- Enriquecimiento de datasets: etiquetado automático de entidades en grandes volúmenes de texto en inglés para construir conjuntos de entrenamiento o validación de otros sistemas.
- Limpieza de texto para entrenamiento: eliminación o enmascarado de entidades en corpus antes de usarlos en el ajuste de modelos, mediante la integración con SqueakyCleanText.
- Moderación y revisión de contenido: detección de menciones a personas u organizaciones en textos generados por usuarios para su revisión o marcado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no existe cifra de precisión para este modelo en los benchmarks de SqueakyCleanText (revisados hasta la versión 0.10.0) y remite a la model card de `dslim/bert-base-NER` para las puntuaciones del modelo base. La única métrica publicada es la comprobación de paridad frente al original:

| Comprobacion | Resultado |
|---|---|
| IDs de token, tokenizador ONNX vs base | idénticos |
| `id2label`, config ONNX vs base | idéntico |
| Misma etiqueta top por token | 52 / 52 |
| Diferencia máxima absoluta de logits | 8,6e-06 |

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, los pesos FP32 de ~110 M ocupan aproximadamente 0,43 GB, más activaciones y overhead de runtime.
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria para el grafo ONNX sirve, aunque el caso de uso natural es CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), integración en SqueakyCleanText; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `rhnfzl/bert-base-NER-onnx` | ~110 M | 512 | en | MIT | ONNX (FP32) |
| `dslim/bert-base-NER` (base) | ~110 M | 512 | en | MIT | PyTorch (safetensors/bin) |
| `rhnfzl/wikineural-multilingual-ner-onnx` | no disponible | no disponible | multilingüe | CC BY-NC-SA 4.0 (solo investigación no comercial) | ONNX |

La comparación relevante es con el modelo base: mismas capacidades y sesgos, distinto formato y misma licencia MIT. El modelo multilingüe del mismo autor amplía cobertura de idiomas pero con licencia no comercial, lo que lo descarta para producción comercial sin acuerdo adicional.

## Limitaciones y advertencias

- Es una conversión de formato: conserva las mismas carencias y sesgos que `dslim/bert-base-NER`, entrenado sobre CoNLL-2003 en inglés.
- Solo inglés: aunque SqueakyCleanText lo ejecute en ensembles de otros idiomas y como fallback, el modelo no está entrenado para ellos.
- Contexto máximo de 512 tokens: las entradas más largas deben dividirse antes de la inferencia.
- Etiquetado a nivel de sub-palabra: requiere agrupar tokens en entidades; un uso incorrecto produce entidades fragmentadas.
- Solo cuatro clases (PER, ORG, LOC, MISC); no detecta correos, teléfonos ni otros patrones.
- Riesgo de alucinación de entidades no evaluado en esta publicación; no hay métricas de precisión propias.
- La comprobación de paridad se hizo sobre una muestra pequeña (3 frases, 52 tokens) y no constituye una medida de exactitud.
- Licencia MIT, compatible con uso comercial; conviene revisar igualmente la licencia y limitaciones del modelo base.
- El autor advierte de que SqueakyCleanText carga por defecto un modelo multilingüe con licencia CC BY-NC-SA 4.0; para uso comercial hay que configurar el pipeline para prescindir de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhnfzl/bert-base-NER-onnx
- Modelo base: https://huggingface.co/dslim/bert-base-NER
- Revisión base inferida: https://huggingface.co/dslim/bert-base-NER/tree/d1a3e8f13f8c3566299d95fcfc9a8d2382a9affc
- Repositorio SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText
- Script de exportación: https://github.com/rhnfzl/SqueakyCleanText/blob/f9e4a4247dbc2e86187a994cb23304b33e95a6c3/scripts/export_onnx_models.py
- Documentación de licencias de backends NER: https://github.com/rhnfzl/SqueakyCleanText/blob/main/docs/NER_BACKENDS.md#model-licences
- Resultados de benchmarks de SCT: https://github.com/rhnfzl/SqueakyCleanText/tree/main/benchmarks/results
- Modelo multilingüe del mismo autor: https://huggingface.co/rhnfzl/wikineural-multilingual-ner-onnx
