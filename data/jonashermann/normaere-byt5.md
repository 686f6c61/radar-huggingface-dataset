# JonasHermann/normaere-ByT5

## Resumen

normaere-ByT5 es un modelo seq2seq especializado en la normalización de textos en alto alemán medio (Mittel­hochdeutsch, código ISO `gmh`), el estadio histórico de la lengua alemana documentado aproximadamente entre 1050 y 1500. Lo desarrolla Jonas Hermann y se obtiene por ajuste fino de `google/byt5-base`, el modelo byte-level de Google presentado en el paper ByT5 (Xue et al., 2022). No es un modelo generativo de propósito general pese a que su pipeline tag sea `text-generation`: su tarea es transformar una transcripción diplomática o semidiplomática en una forma normalizada según el estándar del Referenzkorpus Mittelhochdeutsch (ReM), resolviendo abreviaturas, separando y expandiendo proclíticos y enclíticos, y aplicando el postprocesado editorial del corpus.

La relevancia del modelo es de nicho pero muy concreta: la normalización es el cuello de botella habitual en cualquier pipeline de filología digital sobre textos medievales alemanes, porque los corpus históricos presentan una variación ortográfica y abbreviativa enorme que rompe los tokenizadores y los modelos entrenados sobre alemán moderno. Al estar construido sobre ByT5, opera directamente sobre bytes UTF-8 con un vocabulario de 384 entradas, lo que evita depender de un tokenizador subword entrenado en otra lengua y sincronía.

El modelo tiene 581.653.248 parámetros, se distribuye en FP16 (repo de 1,2 GB) y admite secuencias de hasta 1500 tokens, lo que en la práctica equivale a unos 1500 caracteres por pasada dada la tokenización byte a byte. Su principal incógnita es la licencia, que no está declarada en la model card, y la ausencia total de métricas de evaluación publicadas y de validación por parte de la comunidad (0 descargas, 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (clase `T5ForConditionalGeneration`), tokenización byte-level sobre UTF-8 |
| Parametros totales | 581.653.248 (confirmado en los safetensors del repo) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1500 tokens de longitud máxima de secuencia; el autor recomienda ventana deslizante de ~1300 tokens con paso de ~1000 para entradas largas |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP16; no hay variantes GGUF, GPTQ, AWQ ni ONNX publicadas) |
| Idiomas soportados | `de` (alemán moderno, en la medida en que el modelo base lo cubre) y `gmh` (alto alemán medio) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP16); repositorio de 1,2 GB |

Otros datos técnicos: tamaño de vocabulario de 384 entradas (tokenizador byte-level, sin vocabulario subword), modelo base `google/byt5-base`, pipeline declarado `text-generation` aunque la tarea real es de normalización seq2seq.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar de la familia T5, en la variante ByT5: en lugar de un vocabulario SentencePiece, la entrada se serializa como bytes UTF-8 y se mapea a un vocabulario de solo 384 símbolos. Esto implica que cada carácter latino con diacríticos consume varios tokens (típicamente dos o tres por carácter con diacrítico en UTF-8) y que, en promedio, el modelo procesa alrededor de un token por carácter, frente a los ~0,35 tokens por carácter de un modelo SentencePiece como mT5. La consecuencia práctica es tripe: no hay dependencia de un tokenizador entrenado en otra sincronía (ventaja para grafías medievales con diacríticos y signos especiales), las secuencias son aproximadamente tres veces más largas y el coste de inferencia por carácter se multiplica en la misma proporción. La longitud máxima de secuencia configurada es de 1500 tokens.

El ajuste fino se realizó sobre el Referenzkorpus Mittelhochdeutsch (ReM), versión 2.1, publicado por Roussel, Klein, Dipper, Wegera y Wich-Reif (2024). No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; para una tarea de normalización supervisada a nivel de carácter/palabra lo habitual sería entrenamiento supervisado puro, pero no está confirmado. El autor indica que las muestras de entrenamiento tenían hasta 1200 caracteres (≈1350 tokens), de ahí la recomendación de trocear las entradas largas con una ventana de ~1300 tokens y un paso de ~1000 para respetar la distribución vista en entrenamiento y evitar degradación fuera de dominio. Existe una variante paralela del mismo autor, `JonasHermann/normaere-model`, construida sobre mT5 y con tokenización subword.

## Capacidades

- Normalización de texto en alto alemán medio según el estándar ReM: resolución de abreviaturas medievales frecuentes.
- Separación y expansión de proclíticos y enclíticos (por ejemplo, formas fusionadas de preposición y artículo).
- Aplicación de postprocesado editorial conforme a las convenciones del corpus de referencia.
- Transformación seq2seq texto-a-texto con preservación de la estructura del original, no generación libre de contenido nuevo.
- Manejo de grafías con diacríticos y caracteres especiales sin pérdida por tokenización, gracias al esquema byte-level.
- Procesamiento por ventana deslizante de documentos completos mediante troceado con solapamiento.
- Capacidad multilingüe heredada del modelo base (ByT5 se preentrenó sobre más de 100 idiomas), aunque el ajuste fino la restringe en la práctica al dominio `gmh`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, visión ni audio.
- No se documenta una capacidad de instrucciones conversacionales: el modelo espera texto a normalizar, no prompts en lenguaje natural.

## Casos de uso

- Construcción de corpus históricos: normalizar transcripciones diplomáticas de manuscritos de los siglos XI a XV antes de incorporarlas a un corpus anotado, de modo que las herramientas de búsqueda y las anotaciones morfosintácticas posteriores operen sobre formas consistentes.
- Preprocesado para etiquetado morfosintáctico y lematización: los taggers y lematizadores entrenados sobre alemán moderno fallan con grafías medievales; pasar primero por normaere-ByT5 reduce la tasa de palabras fuera de vocabulario antes de aplicar el pipeline de anotación.
- Edición digital crítica: generar una capa normalizada automática que se muestre junto al texto original en una edición web, dejando al editor humano la revisión final de los casos dudosos (el modelo propone, el filólogo valida).
- Expansión de abreviaturas para búsqueda y recuperación de información: resolver las abreviaturas de forma que un índice de búsqueda pueda casar la forma expandida con las consultas del usuario en alemán moderno.
- Enlazado con diccionarios y recursos léxicos: obtener formas normalizadas que puedan mapearse a lemas de un diccionario de alto alemán medio o a bases de datos etimológicas, tarea inviable con las formas abreviadas originales.
- Generación de datos de entrenamiento para modelos históricos: normalizar grandes volúmenes de texto para crear pares (forma original, forma normalizada) que sirvan como corpus de aumento para entrenar otros modelos de la misma familia lingüística.
- Docencia y divulgación de filología germánica: ofrecer a estudiantes una normalización automática de referencia sobre la que discutir las decisiones editoriales, con la ventana de 1300 tokens como unidad de trabajo por pasaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (ni BLEU, ni exact match, ni F1 a nivel de token o de palabra) sobre el conjunto de evaluación del ReM ni sobre ningún otro conjunto, y la búsqueda web no ha devuelto ninguna evaluación independiente del modelo. Cualquier cifra de rendimiento que se cite para este checkpoint debe provenir de una evaluación propia del usuario sobre su propio conjunto de textos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2-1,5 GB solo para los pesos en FP16 (581,6 M de parámetros), y del orden de 2-4 GB en total contando activaciones y caché con batches pequeños y secuencias de hasta 1500 tokens. Cálculo estimado, no medido por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más es suficiente; una RTX 3060, RTX 4060, RTX 4090, L4 o T4 cubren el caso con holgura. No tiene sentido reservar A100 o H100 para este tamaño, salvo que se procese en lote un corpus muy grande y se busque throughput agregado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos años con 6-8 GB, e incluso en iGPU con memoria unificada si se acepta latencia alta.
- CPU: es viable para documentos sueltos, pero la tokenización byte-level multiplica por ~3 la longitud de secuencia respecto a un modelo subword equivalente, de modo que el coste por carácter es sensiblemente mayor.
- Opciones de despliegue: la vía documentada es `transformers` con `AutoTokenizer` y `AutoModelForSeq2SeqLM`, en FP16 sobre GPU. No se ha publicado conversión a GGUF para llama.cpp/Ollama, ni a ONNX, TensorRT, CTranslate2, vLLM o TGI; el soporte de modelos encoder-decoder en algunos de estos servidores es limitado en general y para un tokenizador byte-level de 384 entradas requiere verificación previa.
- Latencia y throughput: no disponibles. Como referencia estructural, al procesar ~1 token por carácter, un documento de 10 000 caracteres necesita del orden de 8 pasadas con la ventana recomendada (~1300 tokens, paso ~1000), lo que condiciona el diseño del pipeline por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JonasHermann/normaere-ByT5 | 581,6 M | 1500 tokens (max. secuencia) | Byte-level, vocab 384 | Normalizacion de alto aleman medio (ReM) | no disponible | HuggingFace, safetensors FP16 |
| JonasHermann/normaere-model | no disponible en la informacion (derivado de mT5, familia ~580 M) | no disponible | SentencePiece (~0,35 tokens/caracter) | Normalizacion de alto aleman medio (ReM) | no disponible | HuggingFace |
| google/byt5-base | ~582 M | no disponible en la informacion | Byte-level, vocab 384 | Texto-a-texto generico, 100+ idiomas | Apache 2.0 | HuggingFace, ampliamente desplegado |
| google/mt5-base | ~580 M | no disponible en la informacion | SentencePiece | Texto-a-texto multilingue generico | Apache 2.0 | HuggingFace, ampliamente desplegado |

La comparación relevante es interna a la familia: la variante mT5 del mismo autor es más barata por carácter (un tercio de tokens) y probablemente más rápida, mientras que la variante ByT5 elimina el riesgo de que el tokenizador subword desconozca grafías medievales poco frecuentes. Frente a los modelos base de Google, la diferencia es de especialización: `byt5-base` y `mt5-base` no normalizan nada por sí solos y requerirían ajuste fino para esta tarea.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de integrarlo en un producto o en un servicio de pago.
- Ausencia total de métricas publicadas: no hay ninguna cifra de exactitud, BLEU o F1 que permita estimar la calidad esperada; cualquier adopción exige una evaluación propia sobre un conjunto anotado manualmente.
- Riesgo de alucinación en la expansión de abreviaturas: al tratarse de un modelo generativo seq2seq, puede proponer expansiones plausibles pero incorrectas, especialmente en abreviaturas ambiguas o en pasajes dañados. Requiere revisión humana en edición crítica.
- Desajuste temporal: la model card indica que cubre textos de 1050-1500, pero el corpus de entrenamiento (ReM 2.1) está descrito como 1050-1350; el comportamiento sobre textos del siglo XV puede degradarse sin que haya datos que lo cuantifiquen.
- Estándar de normalización idiosincrásico: normaliza según las convenciones del ReM, no según un estándar universal; otros proyectos editoriales con criterios distintos (por ejemplo, resoluciones de abreviaturas o grafías diferentes) no obtendrán la forma que esperan sin reentrenamiento.
- Límite efectivo de ~1500 caracteres por pasada: obliga a trocear y solapar, lo que introduce costuras en los bordes de ventana y puede producir inconsistencias en las formas normalizadas de una misma palabra a lo largo del documento.
- Coste de inferencia inflado por el tokenizador byte-level: entre dos y tres veces más tokens por carácter que una alternativa subword, con el consiguiente impacto en latencia y en coste de GPU.
- Sin cuantizaciones publicadas: no hay GGUF ni variantes de baja precisión, lo que limita el despliegue en entornos con poca memoria o en CPU sin trabajo adicional de conversión.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación externa, de informes de errores y de casos de uso probados en producción.
- Metadatos anómalos: la fecha de creación del repositorio (23 de octubre de 2026) es posterior a la de esta ficha, lo que apunta a un error de configuración en los metadatos del repo; conviene no fiarse de las marcas temporales del modelo.
- Pipeline tag incorrecto: figura como `text-generation` cuando la tarea real es normalización seq2seq; algunas herramientas que enrutan por `pipeline_tag` pueden invocarlo de forma inadecuada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JonasHermann/normaere-ByT5
- Variante mT5 del mismo autor: https://huggingface.co/JonasHermann/normaere-model
- Perfil del autor en HuggingFace: https://huggingface.co/JonasHermann
- Paper de ByT5 (Xue et al., 2022): https://arxiv.org/abs/2105.13626
- Versión HTML del paper de ByT5: https://arxiv.org/html/2105.13626v3
- Repositorio oficial de ByT5 (Google Research): https://github.com/google-research/byt5
- Referenzkorpus Mittelhochdeutsch, versión 2.1: https://www.linguistics.ruhr-uni-bochum.de/rem/
