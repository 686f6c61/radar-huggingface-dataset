# nesicn/nc-turkce-bpe-64k-qwen3.8-27b

## Resumen

`nc-turkce-bpe-64k-qwen3.8-27b` es un tokenizer publicado por el usuario `nesicn` que extiende el vocabulario del tokenizer de Qwen3.8-27B con el diccionario turco de NC-64k, un BPE a nivel de byte entrenado desde cero sobre turco. El objetivo es reducir el coste de tokenización del turco, un idioma aglutinante con morfología compleja que el tokenizer original de Qwen fragmenta de forma ineficiente. Según la model card, el resultado es una reducción del 33,3 % en tokens para turco (de 312,5 a 207,1 tokens por cada 1.000 caracteres) y una mejora del F1 de frontera morfológica de 32,55 a 57,14, manteniendo el tamaño de vocabulario (248.077) y los IDs de tokens especiales del original.

El repositorio contiene únicamente artefactos de tokenizer (tamaño de 0,0 GB, sin pesos), con licencia Apache 2.0 y compatibilidad declarada con `transformers`. La operación clave es que 49.401 tokens del NC-64k sustituyen a los 49.401 tokens de mayor ID del tokenizer de Qwen3.8-27B, de modo que los IDs del resto de tokens no cambian. Esto implica que el tokenizer no es directamente utilizable con los pesos originales del modelo: los nuevos tokens ocupan posiciones de embedding que en el modelo original corresponden a otros tokens, y no han sido entrenados.

La relevancia actual es acotada pero clara: es una pieza de infraestructura para quien quiera adaptar Qwen3.8-27B al turco con un vocabulario más eficiente, a costa de un paso adicional de inicialización y entrenamiento de embeddings. No es un modelo, sino un componente de preprocesado con métricas de compresión y morfología documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE a nivel de byte (byte-level BPE) con extensión de vocabulario; no aplica a nivel de modelo |
| Parametros totales | No disponible (el repositorio no contiene pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo Qwen3.8-27B subyacente; no se especifica en la información) |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | Turco (tr) e inglés (en); el tokenizer base conserva además el vocabulario multilingüe de Qwen3.8-27B |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (artefactos de tokenizer: `tokenizer.json`, `tokenizer_config.json`, `merged-to-original-token-ids.json`) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE a nivel de byte construido combinando dos vocabularios. El componente NC-64k es un BPE entrenado desde cero sobre turco; el componente base es el tokenizer de Qwen3.8-27B. La fusión se realizó con `bpe-tokenizer-editor` 0.2.0 mediante `BPETokenizerEditor(hedef).merge_from(nc, max_vocab_size=248077)`, fijando el tamaño de vocabulario al del tokenizer objetivo. Las reglas de merge del NC-64k se colocan antes que las del tokenizer base, y los tokens resultantes se asignan por orden de ID; los 49.401 tokens de mayor ID del tokenizer original son los que se descartan.

Se excluyeron del vocabulario NC los tokens de un solo carácter, los de formato `<…>` / `[…]`, los tokens especiales, los duplicados ya presentes en el objetivo y 73 tokens que eran fragmentos UTF-8 incompletos y no podían convertirse a texto. Un detalle técnico relevante es la "reparación de accesibilidad": como las reglas del NC-64k tienen prioridad, 55.084 tokens del tokenizer de Qwen3.8-27B dejaban de poder construirse desde sus propios caracteres, lo que inflaba el recuento en inglés (+22,4 %) y código (+7,8 %). Se añadieron 36.168 reglas de merge al final de la lista (de 252.110 a 288.278) para restaurar la construibilidad, con prioridad mínima y sin aumentar el número de tokens en ningún texto. Para 7.673 tokens no existía camino en el vocabulario y no se añadieron tokens nuevos.

El autor indica que no se usó `ignore_merges=true` porque `transformers`, al cargar el modelo con su clase `Qwen3_5Tokenizer`, ignora ese ajuste y produciría segmentaciones distintas según el cargador. La reparación en la lista de reglas garantiza comportamiento idéntico en cualquier cargador. No se documenta entrenamiento de embeddings ni ajuste del modelo; de hecho, la model card advierte explícitamente de que los nuevos tokens no tienen embeddings entrenados.

## Capacidades

- Tokenización de texto turco e inglés con un vocabulario de 248.077 entradas, idéntico en tamaño al del tokenizer de Qwen3.8-27B.
- Compresión de turco: reducción del 33,3 % en tokens sobre el mismo texto (312,5 → 207,1 tokens por 1.000 caracteres).
- Mejora de la segmentación morfológica del turco: F1 de frontera morfológica de 32,55 a 57,14.
- Segmentación sin pérdida: `decode(encode(x)) == x` en todos los textos de prueba y sin producción de `<unk>`.
- Conservación de los IDs de tokens especiales y de la plantilla de chat del tokenizer original.
- Mantenimiento razonable de inglés y código: +5,7 % de tokens en inglés y −2,5 % en código tras la reparación de accesibilidad.
- Mapa de correspondencia `merged-to-original-token-ids.json` que traduce cada ID al token o tokens originales, utilizable para inicializar embeddings.
- No incluye capacidades de generación, razonamiento, tool calling, agentes, visión ni audio: es un componente de tokenización, no un modelo.

## Casos de uso

- Adaptación de Qwen3.8-27B al turco: sustituir el tokenizer original por este en un pipeline de ajuste fino, inicializando los embeddings de los 49.401 tokens nuevos a partir de `merged-to-original-token-ids.json` y entrenándolos junto con el resto del modelo.
- Reducción de coste de inferencia en turco: al procesar un 33,3 % menos de tokens para el mismo texto, disminuye el coste por token de API y el tiempo de prefill en despliegues con vLLM o TGI, siempre que el modelo se haya reentrenado con el nuevo vocabulario.
- Ampliación efectiva de la ventana de contexto para documentos turcos: con la misma longitud de contexto del modelo base, cabe aproximadamente un 50 % más de texto turco real por ventana.
- Preprocesado de corpus turcos para entrenamiento: tokenizar grandes volúmenes de texto turco con mayor eficiencia de compresión reduce el almacenamiento de datasets tokenizados y acelera las épocas de entrenamiento.
- Análisis morfológico y lingüística computacional: el F1 de frontera morfológica de 57,14 permite usar las segmentaciones como señal auxiliar en tareas de análisis morfológico, lematización o etiquetado del turco.
- Evaluación comparativa de tokenizers: sirve como referencia reproducible para medir fertility, tokens por 1.000 caracteres y F1 morfológico frente al tokenizer original de Qwen3.8-27B o frente a NC-64k puro.
- Integración en pipelines multilingües turco-inglés: el vocabulario conserva el rendimiento en inglés (+5,7 % de tokens) y en código (−2,5 %), lo que permite mantener un único tokenizer en aplicaciones mixtas.

## Benchmarks y rendimiento

| Metrica | Este tokenizer | Qwen3.8-27B (original) | NC-64k |
|---|---|---|---|
| Tamano de vocabulario | 248.077 | 248.077 | No disponible |
| Turco: tokens / 1.000 caracteres (menor es mejor) | 207,1 | 312,5 | No disponible |
| Turco: fertility (menor es mejor) | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |
| F1 de frontera morfologica (mayor es mejor) | 57,14 | 32,55 | No disponible |
| Ingles: variacion de tokens | +5,7 % | Referencia | No disponible |
| Codigo: variacion de tokens | −2,5 % | Referencia | No disponible |
| Perdida en decodificacion | Ninguna (`decode(encode(x)) == x`) | Referencia | No disponible |

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el repositorio no contiene pesos ni evaluación de capacidades del modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplicable al tokenizer en sí; depende enteramente del modelo Qwen3.8-27B con el que se combine y de su cuantización, dato no disponible en la información.
- GPU recomendadas: no disponible para el tokenizer; para el modelo base habría que consultar la documentación de Qwen3.8-27B, no incluida aquí.
- Compatibilidad con GPU de consumo: no determinable a partir de esta ficha; el tokenizer se ejecuta en CPU sin requisitos relevantes.
- Despliegue: carga mediante `transformers` con `AutoTokenizer.from_pretrained("nesicn/nc-turkce-bpe-64k-qwen3.8-27b")`. El autor indica que `transformers` 5.22.2 carga el repositorio como `TokenizersBackend` de forma aislada y como `Qwen3_5Tokenizer` junto al `config.json` del modelo, produciendo los mismos tokens que `tokenizer.json`. No se documenta soporte específico en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La única métrica relacionada es la reducción del 33,3 % de tokens en turco, que se traduciría en menor carga de prefill y decodificación una vez adaptado el modelo.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Turco (tok/1.000 car.) | F1 morfologico | Ingles | Codigo | Licencia |
|---|---|---|---|---|---|---|
| nc-turkce-bpe-64k-qwen3.8-27b | 248.077 | 207,1 | 57,14 | +5,7 % | −2,5 % | Apache 2.0 |
| Qwen3.8-27B (tokenizer original) | 248.077 | 312,5 | 32,55 | Referencia | Referencia | No disponible en la informacion |
| NC-64k | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion |

La comparación se limita a los datos publicados por el autor. No se dispone de información sobre otros tokenizers turcos (por ejemplo, variantes de Turkish BPE de terceros) que permita una comparativa adicional.

## Limitaciones y advertencias

- No utilizable directamente con los pesos originales de Qwen3.8-27B: los 49.401 tokens nuevos ocupan IDs que en el modelo original corresponden a otros tokens, y sus embeddings no han sido entrenados. Es necesario inicializarlos y entrenarlos antes de usar el modelo con este tokenizer.
- El mapa `merged-to-original-token-ids.json` es el mecanismo previsto para la inicialización, pero el autor no documenta un procedimiento de entrenamiento completo ni recetas de ajuste.
- El rendimiento en inglés empeora un 5,7 % en número de tokens, lo que puede penalizar aplicaciones predominantemente inglesas.
- 7.673 tokens del vocabulario original no pudieron repararse y quedan inaccesibles desde sus propios fragmentos (por ejemplo, `␣struct`), lo que puede afectar a la tokenización de ciertos patrones de código.
- 73 tokens del NC-64k se descartaron por ser fragmentos UTF-8 incompletos, lo que reduce ligeramente la cobertura del vocabulario turco previsto.
- No hay datos de benchmarks de capacidades del modelo ni de evaluación de calidad tras el ajuste con el nuevo vocabulario.
- Riesgo de alucinación y sesgos: no evaluables a nivel de tokenizer; dependerán del modelo base y de los datos de ajuste, no documentados aquí.
- Licencia Apache 2.0 permite uso comercial del artefacto de tokenizer, pero el uso del modelo base Qwen3.8-27B se rige por su propia licencia, no incluida en esta información.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- La model card está redactada en turco e inglés; no hay documentación en castellano.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-64k-qwen3.8-27b
- Tokenizer NC-64k: https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de edición de tokenizers: https://github.com/malibayram/bpe-tokenizer-editor
- Paper, blog, demo o repositorio adicional: no disponible en la información proporcionada.
