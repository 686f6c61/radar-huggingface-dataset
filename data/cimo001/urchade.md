# cimo001/urchade

## Resumen

Urchade es un modelo de reconocimiento de entidades nombradas (NER) de tipo zero-shot, exportado a formato ONNX y publicado por el usuario cimo001 en Hugging Face. Se basa en GLiNER (Generalist and Lightweight Entity Recognition), una arquitectura que permite extraer entidades de texto especificando los tipos de entidad como texto libre en el propio prompt, sin necesidad de reentrenar el modelo para cada esquema. El repositorio distribuye el modelo `gliner_multi-v2.1` en dos variantes: FP32 y cuantizada a INT8.

El modelo resuelve el problema de la extraccion de entidades en escenarios multilingues y con esquemas variables, donde un NER clasico requeriria un modelo distinto por conjunto de etiquetas. Al estar en formato ONNX, se puede ejecutar mediante onnxruntime (CPU o GPU) sin dependencia de la libreria transformers, lo que facilita su despliegue en entornos de produccion ligeros.

El repositorio ocupa 1,5 GB e incluye codigo auxiliar (`helper.py` para construir la sesion ONNX y `example.py` con el pipeline completo de tokenizacion, enumeracion de spans e inferencia). La licencia es Apache 2.0 y el modelo esta etiquetado como multilingue. No se han publicado resultados de benchmarks ni detalles sobre el entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (span-based, zero-shot NER), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (spans enumerados por palabra hasta anchura 12) |
| Tipos de cuantizacion | FP32 (`model.onnx`) e INT8 (`model_quantized.onnx`) |
| Idiomas soportados | multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (junto con `spm.model` para tokenizacion SentencePiece) |

## Arquitectura y entrenamiento

El modelo sigue el enfoque GLiNER: en lugar de una cabeza de clasificacion fija sobre un conjunto cerrado de etiquetas, recibe en la secuencia de entrada los tipos de entidad como texto libre con el formato `[cls] [ent] type... [ent] type... [sep] word... [eos]`, donde `[ent]` corresponde al token 250103 y `[sep]` al 250104. El modelo puntua cada span candidato (enumerado por palabra, hasta anchura 12) contra los tipos solicitados, aplica sigmoide sobre el logit y realiza una seleccion greedy sin solapamiento. El tokenizador es SentencePiece (`spm.model`) cargado via proto con el ajuste `normalizer_spec.add_dummy_prefix = False`, necesario para la alineacion a nivel de palabra; los digitos se tokenizan uno a uno (`\d|\D+`) y los caracteres CJK se separan palabra a palabra.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo base declarado es `urchade`, presumiblemente una variante o reempaquetado de `gliner_multi-v2.1`; los detalles de entrenamiento del checkpoint original no se incluyen en la informacion proporcionada.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot con tipos de entidad definidos en tiempo de inferencia como texto libre.
- Extraccion multilingue: el ejemplo de la model card muestra entidades en texto latino y japones (persona, organizacion, lugar).
- Clasificacion de spans por palabra con puntuaciones de confianza (probabilidad via sigmoide).
- Ejecucion sin dependencia de transformers ni tokenizers: solo onnxruntime, sentencepiece, numpy y protobuf.
- Seleccion de proveedor de ejecucion ONNX (CPU/GPU) y control de hilos y memoria mediante `helper.py`.
- Normalizacion de entrada con NFKC para puntuaciones consistentes en contextos multilingues.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling ni agentes.

## Casos de uso

- Extraccion de entidades en pipelines de ingestion documental: el modelo permite definir el esquema de entidades por consulta (por ejemplo, "person", "organization", "place") sin reentrenar, lo que encaja en flujos donde los tipos de entidad cambian entre clientes o dominios.
- Procesamiento de textos multilingues en un unico servicio: al aceptar entradas en varios idiomas, se puede desplegar una sola instancia ONNX para corpus que mezclan latin y CJK, como en el ejemplo de la model card con nombres japoneses.
- Anonimizacion y enmascarado de datos personales: la deteccion de entidades de tipo "person" o "place" con puntuaciones de confianza permite filtrar por umbral antes de redactar informacion sensible en logs o documentos.
- Enriquecimiento de metadatos en motores de busqueda: extraer organizaciones y lugares de articulos o fichas para indexacion y facetado, ejecutando el modelo en CPU con la variante INT8 para reducir coste.
- Despliegue en entornos con recursos limitados: la exportacion ONNX y la cuantizacion INT8 permiten ejecutar la inferencia con onnxruntime en servidores sin GPU o en el borde, sin instalar el stack completo de transformers.
- Prototipado rapido de esquemas NER: investigadores pueden probar distintos conjuntos de etiquetas en texto libre modificando solo la secuencia de entrada, usando `example.py` como referencia del pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 1,5 GB, por lo que la variante FP32 requiere del orden de esa cifra en memoria y la INT8 aproximadamente la mitad, aunque no se confirma el desglose por fichero.
- GPU recomendadas: no se especifican; al usar onnxruntime-gpu, cualquier GPU compatible con los execution providers de ONNX Runtime (por ejemplo, series A100, H100 o RTX) puede ejecutar el modelo.
- Compatibilidad con GPU de consumo: probable mediante onnxruntime en CPU o GPU de gama consumer, dado el tamano del artefacto, aunque no hay datos confirmados de latencia ni throughput.
- Opciones de despliegue: onnxruntime (CPU y GPU), con seleccion de provider, hilos y opciones de memoria desde `src/helper.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| cimo001/urchade (este) | GLiNER zero-shot NER en ONNX | no disponible | no disponible | Apache 2.0 | ONNX (FP32/INT8) |
| gliner_multi-v2.1 (original) | GLiNER zero-shot NER multilingue | no disponible | no disponible | no disponible en esta ficha | pesos PyTorch (no confirmado) |
| NER transformer clasico (p. ej. XLM-R token-classification) | Clasificacion con etiquetas fijas | no disponible | no disponible | variable | safetensors / ONNX |

La comparacion cuantitativa no esta disponible: no se han publicado metricas de este checkpoint ni de las alternativas en la informacion proporcionada. La diferencia principal frente a un NER clasico es la flexibilidad de esquema (tipos de entidad en texto libre) y el empaquetado ONNX sin dependencia de transformers.

## Limitaciones y advertencias

- No hay datos publicados de evaluacion (F1, precision, recall) que permitan validar la calidad antes de usarlo en produccion.
- Riesgo de alucinacion de entidades: al puntuar spans candidatos, puede asignar tipos de entidad a fragmentos que no corresponden; se recomienda umbral de confianza y revision en dominios sensibles.
- La enumeracion de spans se limita a una anchura de 12 palabras, lo que puede perder entidades muy largas.
- El modelo esta etiquetado como multilingue, pero no se documenta la cobertura real por idioma; el ejemplo solo cubre latin y japones.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado sobre corpus no especificados, pueden aparecer sesgos de dominio y geograficos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base `urchade` y de `gliner_multi-v2.1` antes de redistribuir.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- Dependencia de un pipeline manual (tokenizacion SentencePiece con parche, mascara de palabras, enumeracion de spans) que debe replicarse fielmente para obtener resultados correctos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cimo001/urchade
- Modelo base declarado: `urchade` (referencia en la model card, sin URL directa en la informacion disponible)
- Checkpoint de origen citado: `gliner_multi-v2.1` (sin URL directa en la informacion disponible)
- Codigo de ejemplo incluido en el repositorio: `gliner_multi-v2.1/src/example.py` y `src/helper.py`
