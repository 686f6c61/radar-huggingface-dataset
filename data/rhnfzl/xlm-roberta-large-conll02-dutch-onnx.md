# rhnfzl/xlm-roberta-large-conll02-dutch-onnx

## Resumen

`rhnfzl/xlm-roberta-large-conll02-dutch-onnx` es una exportación a ONNX del modelo `FacebookAI/xlm-roberta-large-finetuned-conll02-dutch`, un transformer encoder de tipo XLM-RoBERTa large afinado para reconocimiento de entidades nombradas (NER) en neerlandés. Lo publica el usuario rhnfzl como artefacto auxiliar de su herramienta SqueakyCleanText, una librería de limpieza y anonimización de texto que lo emplea por defecto para procesar texto en neerlandés. El modelo etiqueta personas (PER), organizaciones (ORG), localizaciones (LOC) y entidades varias (MISC) a nivel de subword.

La relevancia de esta ficha no está en la innovación algorítmica —no la hay: es un volcado directo del modelo base sin cuantización ni optimización— sino en que proporciona un binario ONNX listo para `onnxruntime` con una comprobación de paridad documentada frente al original en PyTorch. Para equipos que necesitan desplegar NER neerlandés sin dependencia de PyTorch, el artefacto elimina el paso de exportación y fija una revisión concreta del modelo base.

El modelo tiene 559 millones de parámetros en FP32, un contexto máximo de 512 tokens y licencia MIT. El repositorio ocupa 2,3 GB, de los cuales 2,2 GB son pesos. Está pensado para inferencia en CPU o GPU mediante ONNX Runtime, no para entrenamiento ni ajuste fino dentro de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa large (24 capas, 16 cabezas, 1024 de dimensión oculta) con cabeza de clasificación de tokens |
| Parametros totales | 559 millones (aproximado, derivado de la arquitectura XLM-R large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens; entradas más largas deben dividirse previamente |
| Tipos de cuantizacion | ninguno incluido; los pesos se distribuyen en FP32. El autor indica que el script de exportación no aplica cuantización ni optimización |
| Idiomas soportados | neerlandés (nl) |
| Licencia | MIT (asumida del modelo base; la model card original indica "More information needed") |
| Formato de pesos | ONNX (opset 18, IR version 8): `model.onnx` (grafo, 0,5 MB) y `model.onnx_data` (pesos, 2,2 GB) |
| Entradas del grafo | `input_ids`, `attention_mask` |
| Salida del grafo | `logits` (una fila por token) |
| Etiquetas | `B-LOC`, `B-MISC`, `B-ORG`, `B-PER`, `I-LOC`, `I-MISC`, `I-ORG`, `I-PER`, `O` |
| Modelo base | `FacebookAI/xlm-roberta-large-finetuned-conll02-dutch` (revisión inferida `630d5d48d08071704d9a2719b045082019b6ac12`) |
| Dataset de ajuste | CoNLL-2002 (neerlandés) |
| Productor del grafo | pytorch 2.10.0 |
| Tamaño del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large: un transformer encoder con 24 capas, normalización previa, embeddings posicionales relativos y vocabulario SentencePiece multilingüe. Sobre el encoder se añade una cabeza lineal de clasificación por token que proyecta la representación de cada subword a las nueve etiquetas BIO del esquema CoNLL-2002. El modelo base fue afinado por Facebook AI sobre el corpus CoNLL-2002 neerlandés, un conjunto clásico de NER con anotaciones de persona, organización, localización y miscelánea.

Esta exportación concreta no entrena nada: reproduce el modelo base en formato ONNX con `optimum.exporters.onnx`, sin fijar revisión del repositorio origen y sin aplicar cuantización, poda ni fusión de operadores. El autor documenta una comprobación de paridad ejecutada el 17 de noviembre de 2026 sobre tres frases y 54 tokens: los identificadores de token coinciden entre ambos tokenizadores, las etiquetas `id2label` son idénticas, las 54 etiquetas predichas coinciden y la diferencia absoluta máxima en los logits es de 4,1e-05. Es una muestra pequeña y el propio autor advierte que no constituye una métrica de precisión.

No hay información sobre el proceso de ajuste fino del modelo base (número de épocas, hiperparámetros, si hubo búsqueda de hiperparámetros o regularización). Tampoco se documenta ninguna innovación técnica en la exportación más allá del propio volcado estándar.

## Capacidades

- Reconocimiento de entidades nombradas en neerlandés con etiquetado BIO de cuatro tipos: persona, organización, localización y miscelánea.
- Clasificación a nivel de subword: devuelve una etiqueta por cada token del tokenizador, no entidades agregadas; el agrupamiento en entidades completas debe hacerlo el consumidor.
- Procesamiento de lotes mediante `onnxruntime` con `CPUExecutionProvider` u otros proveedores disponibles (CUDA, TensorRT, etc., no verificados en la documentación).
- Integración directa con la librería SqueakyCleanText, que lo usa por defecto para neerlandés dentro de un ensemble junto con los modelos ENGLISH y MULTILINGUAL.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente discriminativo de etiquetado.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al neerlandés en este ajuste, aunque el vocabulario subyacente de XLM-R sea multilingüe.

## Casos de uso

- Anonimización de textos clínicos o legales en neerlandés: el modelo identifica nombres de personas y organizaciones para sustituirlos por marcadores (`<PERSON>`, `<ORGANISATION>`) antes de almacenar o compartir el texto, que es exactamente el flujo que implementa SqueakyCleanText.
- Preprocesamiento de corpus para entrenamiento de modelos de lenguaje: limpiar entidades personales de datasets neerlandeses reduce el riesgo de memorización de datos personales en modelos posteriores.
- Extracción de entidades en pipelines de inteligencia de negocio: detectar organizaciones y localizaciones en noticias o informes neerlandeses para poblar bases de datos de seguimiento de empresas.
- Indexación y búsqueda semántica sobre documentación corporativa: etiquetar personas y organizaciones como metadatos permite filtrar y enlazar documentos por entidad sin depender de reglas heurísticas.
- Moderación y revisión de contenido: marcar menciones a personas concretas en foros o comentarios para revisión manual o para aplicar políticas de privacidad.
- Despliegue en entornos sin PyTorch: al distribuirse como ONNX, se puede servir con `onnxruntime` en contenedores ligeros, funciones serverless o dispositivos de borde donde instalar PyTorch no es viable.
- Componente de un ensemble de NER multilingüe: combinado con otros modelos de la familia SqueakyCleanText para texto mixto neerlandés-inglés, tal como hace la configuración por defecto de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe una métrica de precisión para este modelo en los benchmarks de SqueakyCleanText (revisados hasta la versión 0.10.0), porque esas pruebas puntúan el pipeline completo, donde el modelo opera dentro de un ensemble. La única medición publicada es la comprobación de paridad frente al modelo PyTorch original:

| Comprobacion | Resultado |
|---|---|
| IDs de token, tokenizador ONNX vs base | idénticos |
| `id2label`, config ONNX vs base | idénticos |
| Misma etiqueta top por token | 54 / 54 |
| Diferencia absoluta máxima en logits | 4,1e-05 |

Esta tabla mide equivalencia numérica, no calidad de reconocimiento de entidades.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,2-2,5 GB para los pesos, más memoria para activaciones y el lote; con lotes pequeños cabe holgadamente en GPUs de 8 GB.
- Al no incluir versiones cuantizadas, no hay cifras oficiales para INT8 o FP16; una cuantización dinámica propia reduciría el peso a la mitad o a un cuarto, pero requeriría exportarla y validarla por cuenta del usuario.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32 con lotes moderados (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4). Para alto throughput, A100 o H100 con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Ejecución en CPU: viable con `onnxruntime` y `CPUExecutionProvider`, que es el modo documentado por el autor; el rendimiento dependerá del número de núcleos y del tamaño de lote.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#, Java), ONNX Runtime Server, Triton Inference Server con backend ONNX, o integración vía SqueakyCleanText. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| rhnfzl/xlm-roberta-large-conll02-dutch-onnx | 559 M | 512 | neerlandés | MIT | ONNX FP32 | Exportación sin cuantizar; paridad verificada con el original |
| FacebookAI/xlm-roberta-large-finetuned-conll02-dutch | 559 M | 512 | neerlandés | no disponible en la información | PyTorch (safetensors/bin) | Modelo base del anterior; requiere PyTorch para servir |
| rhnfzl/wikineural-multilingual-ner-onnx | no disponible | no disponible | multilingüe | CC BY-NC-SA 4.0 (solo investigación no comercial) | ONNX | Usado en el mismo ensemble de SqueakyCleanText; licencia restrictiva para uso comercial |
| Modelos NER neerlandeses de la familia BERTje o RobBERT | no disponible | no disponible | neerlandés | no disponible | no disponible | Alternativas habituales para NER neerlandés; no se dispone de datos verificados en esta búsqueda |

La comparación relevante es con el modelo base en PyTorch: misma arquitectura, mismos pesos y misma calidad esperada, con la diferencia de que el artefacto ONNX elimina la dependencia de PyTorch y fija una revisión concreta. Frente al modelo multilingüe del mismo autor, la ventaja es la licencia MIT, que permite uso comercial, frente a la CC BY-NC-SA 4.0 del multilingüe.

## Limitaciones y advertencias

- El modelo base declara en su model card "More information needed" sobre la licencia; la MIT de esta exportación es una asunción del autor, no una confirmación del titular original. Conviene verificar antes de un uso comercial a gran escala.
- No hay métricas de precisión, recall o F1 publicadas para este modelo; la comprobación de paridad solo demuestra equivalencia numérica con el original, no calidad.
- Contexto máximo de 512 tokens: los textos más largos deben dividirse, lo que puede partir entidades en los límites de fragmento.
- El etiquetado es a nivel de subword; sin un paso de agrupamiento (por ejemplo, el que ofrece SqueakyCleanText) la salida no son entidades completas.
- El modelo está ajustado exclusivamente para neerlandés; su uso sobre otros idiomas, aunque el vocabulario sea multilingüe, no está validado.
- No se ha evaluado el sesgo del modelo base en la información disponible; los corpus NER clásicos como CoNLL-2002 pueden infrarrepresentar ciertos dominios y tipos de nombres.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de entidades, especialmente en texto informal, dominios especializados o nombres poco frecuentes.
- La configuración por defecto de SqueakyCleanText carga además el modelo multilingüe con licencia CC BY-NC-SA 4.0, lo que puede contaminar un despliegue comercial si no se revisa la configuración; la documentación de la librería explica cómo prescindir de él.
- El grafo declara `XLMRobertaForMaskedLM` en el `config.json` heredado del modelo base, una peculiaridad que puede confundir a herramientas que lean ese campo para inferir la tarea; el grafo ONNX real es de clasificación de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhnfzl/xlm-roberta-large-conll02-dutch-onnx
- Modelo base en Hugging Face: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll02-dutch
- Revisión del modelo base usada en la exportación: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll02-dutch/tree/630d5d48d08071704d9a2719b045082019b6ac12
- Repositorio SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText
- Script de exportación usado: https://github.com/rhnfzl/SqueakyCleanText/blob/f9e4a4247dbc2e86187a994cb23304b33e95a6c3/scripts/export_onnx_models.py
- Documentación de licencias de modelos de SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText/blob/main/docs/NER_BACKENDS.md#model-licences
- Resultados de benchmarks de SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText/tree/main/benchmarks/results
- Modelo multilingüe complementario del mismo autor: https://huggingface.co/rhnfzl/wikineural-multilingual-ner-onnx
