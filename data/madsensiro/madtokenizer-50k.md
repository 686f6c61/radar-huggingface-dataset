# MadSensiro/MadTokenizer-50K

## Resumen

MadTokenizer-50K es un tokenizador de tipo byte-level BPE entrenado desde cero por el usuario MadSensiro sobre el corpus wikitext-103 (aproximadamente 538 millones de caracteres de texto en inglés). No es un modelo de lenguaje: se trata exclusivamente de un tokenizador publicado como artefacto independiente, con un vocabulario de 50.000 tokens y la misma receta que emplea GPT-2 (pre-tokenizador `ByteLevel`, `BpeTrainer` con `min_frequency=2`).

Su relevancia es acotada pero concreta: sirve como pieza base para quien quiera entrenar un modelo de lenguaje en inglés desde cero con un vocabulario mayor que el de GPT-2 (50.257 tokens) pero ajustado a un corpus de dominio enciclopédico, o como referencia didáctica para estudiar el comportamiento de BPE a nivel de byte. Al ser byte-level, garantiza que cualquier secuencia de bytes es decodificable y no genera tokens `<unk>` en la práctica, lo que simplifica el preprocesado multilingüe y de texto ruidoso aunque el corpus de entrenamiento sea únicamente inglés.

El artefacto se publicó en noviembre de 2026, no registra descargas ni likes, y su model card es explícita: no hay pesos de modelo asociados todavía, solo los ficheros del tokenizador. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (pre-tokenizador `ByteLevel`, `BpeTrainer`), misma receta que GPT-2 |
| Parametros totales | no disponible (no es un modelo con pesos; solo tokenizador) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (entrenado en inglés); byte-level permite codificar cualquier texto sin `<unk>` |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json` (fast tokenizer), `vocab.json`, `merges.txt`, `tokenizer_config.json`, `special_tokens_map.json`, `config.json` |
| Tamano de vocabulario | 50.000 tokens |
| Corpus de entrenamiento | Salesforce/wikitext (wikitext-103), ~538M caracteres, texto crudo |
| Tokens especiales | `<s>`, `<pad>`, `</s>`, `<unk>`, `<mask>` |
| Pipeline declarado | token-classification |

## Arquitectura y entrenamiento

El tokenizador implementa BPE a nivel de byte con el pre-tokenizador `ByteLevel` de la librería `tokenizers` de Hugging Face, replicando el esquema de GPT-2. El entrenamiento se realizó con `BpeTrainer` sobre el split crudo de wikitext-103, con `min_frequency=2` y un objetivo de vocabulario de 50.000 tokens. Al operar sobre bytes, el vocabulario base cubre los 256 valores posibles y las fusiones BPE se aplican sobre esa representación, de modo que no existe la noción de token fuera de vocabulario para texto arbitrario.

No se documenta ninguna innovación técnica más allá de la receta estándar: no hay normalización específica, no hay pre-tokenización por expresiones regulares tipo GPT-4 (cl100k), ni entrenamiento sobre mezcla multilingüe o de código. La model card advierte del comportamiento esperado del marcador de espacio inicial (`Ġ`) heredado de GPT-2, que puede hacer que `decode` anteponga un espacio a cadenas aisladas. No se especifica el número exacto de documentos, la proporción de splits utilizada ni si se filtró el corpus.

## Capacidades

- Tokenización byte-level de texto en inglés y, por construcción, de cualquier secuencia Unicode (acentos, emojis, alfabetos no latinos) sin producir `<unk>`.
- Segmentación BPE con vocabulario de 50.000 tokens, adecuada para entrenar modelos de lenguaje desde cero con un vocabulario mayor que el de GPT-2.
- Serialización como fast tokenizer compatible con `AutoTokenizer` de Transformers, lo que permite usarlo directamente en pipelines de preprocesado.
- Definición de tokens especiales para secuencias (`<s>`, `</s>`), relleno (`<pad>`), enmascarado (`<mask>`) y desconocido (`<unk>`), lo que facilita su integración en tareas de modelado causal, enmascarado y token classification.
- No incluye capacidades generativas, de razonamiento, de código, matemáticas, visión, audio, tool calling ni agentes: es un componente de preprocesado, no un modelo.
- No incorpora chat template ni formato instruct.

## Casos de uso

- Entrenamiento de un modelo de lenguaje en inglés desde cero: el tokenizador sirve como capa de tokenización para un transformer causal o enmascarado con vocabulario de 50.000, y su origen en wikitext-103 lo hace coherente con corpus enciclopédicos.
- Reproducción de experimentos de tokenización: permite comparar el impacto del tamano de vocabulario y de las fusiones BPE frente a GPT-2 (50.257 tokens) sobre el mismo tipo de corpus, aislando la variable del tokenizador.
- Preprocesado de corpus ruidosos o multilingües incidentales: al ser byte-level, codifica texto con caracteres no vistos sin `<unk>`, lo que resulta útil en pipelines que mezclan inglés con nombres propios, URLs o símbolos.
- Token classification y etiquetado de secuencias: el pipeline declarado (`token-classification`) y los tokens especiales permiten usarlo como base en tareas de NER o POS sobre texto inglés, aunque requeriría un modelo aguas abajo.
- Docencia y análisis de BPE: los ficheros `vocab.json` y `merges.txt` permiten inspeccionar las fusiones aprendidas y estudiar cómo se segmentan palabras frecuentes del corpus wikitext.
- Prototipado rápido de pipelines de NLP: al cargarse con `AutoTokenizer.from_pretrained`, se integra en scripts de Hugging Face sin dependencias adicionales para pruebas de segmentación y cálculo de ratios de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de compresión (tokens por palabra, fertilidad), comparaciones de vocabulario ni evaluaciones aguas abajo.

## Requisitos de hardware

- VRAM para inferencia: despreciable. El tokenizador es una estructura de datos en CPU (vocabulario de 50.000 entradas y reglas de fusión); no requiere GPU.
- GPU recomendadas: no aplica. Cualquier CPU sirve; el cuello de botella es el rendimiento del tokenizador en Rust a través de `tokenizers`.
- Cabe en cualquier hardware, incluidos entornos sin GPU, contenedores ligeros y funciones serverless.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), librería `tokenizers` directamente, y cualquier framework que consuma `tokenizer.json` (por ejemplo, servidores de inferencia que acepten tokenizadores de Hugging Face).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser byte-level BPE con 50.000 tokens, el coste por token es comparable al de otros tokenizadores BPE de tamano similar.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MadTokenizer-50K | Byte-level BPE | 50.000 | wikitext-103 (~538M caracteres, inglés) | MIT | Hugging Face (0 descargas) |
| GPT-2 tokenizer | Byte-level BPE | 50.257 | WebText (no publicado) | MIT | Hugging Face, ampliamente usado |
| GPT-4 cl100k_base | BPE con pre-tokenización regex | ~100.000 | no disponible | MIT (librería `tiktoken`) | OpenAI / `tiktoken` |
| Llama 3 tokenizer | BPE | 128.000 | multilingüe, no disponible en detalle | Llama 3 Community License | Hugging Face (con restricciones) |

La comparación relevante es frente a GPT-2: MadTokenizer-50K replica su receta con un vocabulario casi idéntico en tamano, pero entrenado sobre un corpus enciclopédico y con licencia MIT explícita. Frente a tokenizadores modernos (cl100k, Llama 3), su vocabulario es menor y no incorpora pre-tokenización por regex ni cobertura multilingüe o de código.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza ninguna tarea predictiva por sí mismo; solo tokeniza.
- Entrenado exclusivamente en inglés (wikitext-103), por lo que las fusiones BPE están sesgadas hacia vocabulario enciclopédico anglófono; la eficiencia de compresión en otros idiomas o en código será peor aunque no produzca `<unk>`.
- El pipeline declarado (`token-classification`) es probablemente una etiqueta de conveniencia; no hay cabeza de clasificación ni pesos asociados.
- Sin descargas ni likes ni validación comunitaria: no hay evidencia de uso en producción ni de evaluación independiente.
- El marcador de espacio inicial (`Ġ`) puede introducir espacios espurios al decodificar cadenas aisladas; es comportamiento esperado de GPT-2, pero conviene tenerlo en cuenta en pipelines que comparen cadenas exactas.
- Riesgo de alucinación: no aplica al no ser generativo; el riesgo equivalente es una tokenización inesperada de términos fuera de dominio.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantías; conviene conservar el aviso de copyright.
- Ausencia de documentación sobre el proceso exacto de filtrado del corpus, número de documentos y splits utilizados, lo que limita la reproducibilidad estricta.

## Enlaces

- Hugging Face: https://huggingface.co/MadSensiro/MadTokenizer-50K
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/wikitext
- Librería `tokenizers`: https://github.com/huggingface/tokenizers
- Documentación de `AutoTokenizer`: https://huggingface.co/docs/transformers/main_classes/tokenizer
- Referencia de la receta GPT-2 (ByteLevel BPE): https://huggingface.co/docs/transformers/model_doc/gpt2
