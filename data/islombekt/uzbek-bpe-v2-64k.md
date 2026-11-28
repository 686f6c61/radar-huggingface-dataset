# IslombekT/uzbek-bpe-v2-64k

## Resumen

`uzbek-bpe-v2-64k` es un tokenizador BPE (byte-level, byte-pair encoding) entrenado especificamente para el uzbeko en sus variantes latina, cirilica, alfabeto latino reformado (con los caracteres ö, ğ, ş, ç, vigentes desde el 22 de abril de 2027) y texto de escritura mixta. Lo desarrolla el usuario independiente IslombekT y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje, sino el componente de tokenizacion que se usaria como pieza de un LLM en uzbeko.

El vocabulario consta de 64.000 tokens aprendidos mas 40 tokens de relleno (64.040 en total). Forma parte de una familia de tres tamanos cortados del mismo entrenamiento: `uzbek-bpe-v2-32k` (para modelos pequenos), `uzbek-bpe-v2-64k` (orientado a modelos de ~1B de parametros) y `uzbek-bpe-v2-128k` (para modelos de 7B o superiores).

Su relevancia radica en la eficiencia de tokenizacion del uzbeko: segun la model card, reduce el numero de tokens por palabra frente a tokenizadores multilingues genericos como GPT-4o o200k, Gemma 3, Llama 3.2 o Qwen3, y practicamente elimina la penalizacion del cirilico (ratio cirilico/latin de 1,034). Ademas, la model card reporta mejoras de calidad en modelos pequenos entrenados con esta version frente a la v1 de 16k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE byte-level con normalizador NFC integrado |
| Parametros totales | no disponible (no es un modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | uzbeko (uz): latin actual, cirilico, latin reformado y texto mixto |
| Licencia | Apache 2.0 |
| Formato de pesos | tokenizer.json (compatible con `transformers.AutoTokenizer`) |
| Tamano de vocabulario | 64.040 (64.000 aprendidos + 40 de relleno) |
| Dataset de entrenamiento | Digitaluz/uzbek-language-corpus (ODC-By v1.0) |
| Volumen de entrenamiento | 192.024.300 palabras |
| Tokens especiales | `<|endoftext|>`; 20 marcadores de datos personales como tokens unicos |

## Arquitectura y entrenamiento

Se trata de un tokenizador BPE byte-level. El normalizador, embebido en `tokenizer.json`, aplica NFC y unifica todas las variantes de la marca de oʻ/gʻ (‘ ’ ' ` ´) en ʻ U+02BB; una marca entre otras letras se convierte en el tutuq ʼ U+02BC. El cirilico nunca se translitera a latin. El pre-tokenizador emplea el patron de division de GPT-4o, de modo que ʻ y ʼ se tratan como letras Unicode y palabras como "oʻzbek" permanecen enteras, antes de aplicar la capa byte-level.

Los datos de entrenamiento proceden de 192.024.300 palabras muestreadas de Digitaluz/uzbek-language-corpus con la siguiente composicion: 45 % latin actual, 30 % cirilico, 20 % latin actual convertido al alfabeto reformado y 5 % texto mixto, con ponderacion por raiz cuadrada entre fuentes. Se excluyeron del muestreo los documentos que compartian cualquier fragmento de 24 palabras con un documento de evaluacion, asi como 106 documentos con restos de OCR en chino, japones o coreano. Los 20 marcadores de datos personales del corpus ([NAME], [PHONE], etc.) se incorporan como tokens unicos, con y sin espacio inicial.

## Capacidades

- Tokenizacion eficiente de uzbeko en latin actual, cirilico, alfabeto latin reformado y texto de escritura mixta.
- Normalizacion integrada de apostrofos y marcas diacriticas del uzbeko (ʻ, ʼ) dentro del propio tokenizer.json.
- Tratamiento de palabras con ʻ/ʼ como unidades completas gracias al patron de pre-tokenizacion de GPT-4o.
- Tokenizacion unica de 20 marcadores de datos personales, util para anonimizacion y pipelines de privacidad.
- Compatibilidad directa con `transformers` (`AutoTokenizer.from_pretrained`).
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de LLM en uzbeko de ~1B de parametros: el vocabulario de 64k esta dimensionado para ese rango, de modo que se reduce el coste computacional por documento (la model card reporta un 38 % menos de tokens y un tiempo de entrenamiento de 87 min frente a 116 min en el experimento con modelos de 42M).
- Preprocesado de corpus mixtos latin/cirilico: el ratio cirilico/latin de 1,034 permite procesar documentos en ambas escrituras sin penalizacion significativa de longitud, algo relevante para corpus periodicos o administrativos uzbecos.
- Adaptacion al alfabeto reformado de 2027: al incluir texto convertido al alfabeto con ö, ğ, ş, ç, el tokenizador esta preparado para el cambio ortografico oficial previsto para abril de 2027.
- Anonimizacion de datos personales: los marcadores [NAME], [PHONE] y similares se tokenizan como unidades unicas, lo que facilita su deteccion, enmascarado o conteo en pipelines de tratamiento de datos.
- Fine-tuning de modelos de clasificacion o embeddings en uzbeko: sirve como capa de tokenizacion para tareas como clasificacion de noticias (15 clases en el dataset de referencia) o comprension lectora tipo UzLiB.
- Construccion de datasets y analisis de eficiencia: permite medir tokens por palabra sobre corpus propios y comparar con tokenizadores multilingues antes de fijar la arquitectura de un modelo.

## Benchmarks y rendimiento

La model card publica resultados de tokens por palabra (menor es mejor) sobre conjuntos de evaluacion fijados antes del entrenamiento y excluidos de el:

| Tokenizador | Vocab | Web latin (a) | Latin (e) | Reformado (c) | Cirilico (b) | Mixto (d) | Cir/Lat |
|---|---|---|---|---|---|---|---|
| v2-64k | 64.040 | 1,538 | 1,538 | 1,571 | 1,610 | 1,709 | 1,034 |
| v1 uzbek-bpe-16k | 16.384 | 1,749 | 1,819 | 2,353 | 4,578 | 3,458 | 2,479 |
| tahrirchi-bert (uz) | 30.528 | 1,878 | 1,907 | 2,296 | 3,952 | 3,161 | 2,060 |
| XLM-RoBERTa | 250.002 | 2,218 | 2,313 | 2,268 | 3,304 | 2,840 | 1,432 |
| GPT-4o o200k | 200.019 | 2,578 | 2,836 | 2,605 | 3,078 | 2,846 | 1,066 |
| NeuronAI-Uzbek (uz) | 180.000 | 2,659 | 2,822 | 2,689 | 4,678 | 3,771 | 1,646 |
| Gemma 3 | 262.145 | 2,817 | 3,068 | 2,775 | 3,351 | 3,063 | 1,076 |
| Llama 3.2 | 128.256 | 3,110 | 3,537 | 3,016 | 4,333 | 3,760 | 1,204 |
| mGPT | 100.000 | 3,159 | 3,442 | 3,072 | 4,410 | 3,752 | 1,258 |
| Qwen3 | 151.669 | 3,199 | 3,518 | 3,103 | 4,509 | 3,838 | 1,259 |

Calidad de modelo: dos GPT identicos (8 capas, 25,3M de parametros sin embeddings) entrenados sobre el mismo GB de texto uzbeco, uno con v1-16k y otro con v2-32k. Bits por byte de texto crudo (menor es mejor):

| Conjunto de evaluacion | v1-16k | v2-32k | Cambio |
|---|---|---|---|
| Web latin (a) | 1,3005 | 1,2471 | -4,1 % |
| Latin (e) | 0,9560 | 0,9322 | -2,5 % |
| Reformado (c) | 1,2929 | 1,2645 | -2,2 % |
| Cirilico (b) | 0,5609 | 0,5327 | -5,0 % |
| Mixto (d) | 0,8902 | 0,8577 | -3,6 % |

Tareas downstream (mismos dos modelos):

| Tarea | v1-16k | v2-32k |
|---|---|---|
| UzLiB, 1.861 preguntas, opcion mas probable (aleatorio = 0,250) | 0,585 | 0,630 |
| UzLiB, ortografia correcta (1.501 preguntas) | 0,640 | 0,692 |
| Clasificacion tematica de noticias, 15 clases, tras fine-tuning con 40.000 articulos | 0,882 | 0,864 |

Nota: los resultados de UzLiB se puntuan por verosimilitud, no por generacion, por lo que no son comparables con la clasificacion del leaderboard de UzLiB. Los benchmarks anteriores corresponden a la variante v2-32k; no se publican resultados de calidad de modelo especificos para v2-64k.

## Requisitos de hardware

- Al ser un tokenizador, no requiere VRAM ni GPU para su uso: la tokenizacion se ejecuta en CPU.
- El fichero `tokenizer.json` es de pequeno tamano (vocabulario de 64.040 entradas); no se especifica su tamano exacto en la informacion disponible.
- Se integra en cualquier pipeline de `transformers` y puede usarse con frameworks de inferencia que acepten tokenizers de Hugging Face (vLLM, TGI, llama.cpp mediante conversion, etc.).
- No aplican latencia ni throughput de inferencia de modelo; el coste relevante es el numero de tokens generados por documento, que segun la model card es un 38 % menor que con v1-16k en el mismo texto.
- No se han publicado datos de latencia de tokenizacion en la informacion disponible.

## Comparativa con modelos similares

Comparativa con otros tokenizadores para uzbeko o multilingues, segun los datos de la model card:

| Tokenizador | Vocab | Web latin (a) | Cirilico (b) | Cir/Lat | Licencia |
|---|---|---|---|---|---|
| uzbek-bpe-v2-64k | 64.040 | 1,538 | 1,610 | 1,034 | Apache 2.0 |
| uzbek-bpe-16k (v1) | 16.384 | 1,749 | 4,578 | 2,479 | no disponible |
| tahrirchi-bert | 30.528 | 1,878 | 3,952 | 2,060 | no disponible |
| NeuronAI-Uzbek | 180.000 | 2,659 | 4,678 | 1,646 | no disponible |
| GPT-4o o200k | 200.019 | 2,578 | 3,078 | 1,066 | propietaria |
| XLM-RoBERTa | 250.002 | 2,218 | 3,304 | 1,432 | MIT |

Frente a los tokenizadores especificos de uzbeko, v2-64k obtiene el menor numero de tokens por palabra en todos los conjuntos evaluados. Frente a GPT-4o o200k, mejora en latin (1,538 frente a 2,578) y en cirilico (1,610 frente a 3,078), con un ratio cirilico/latin ligeramente mejor (1,034 frente a 1,066). La licencia Apache 2.0 facilita su uso comercial, a diferencia de los tokenizadores propietarios.

## Limitaciones y advertencias

- El texto de entrenamiento en alfabeto reformado es sintetico (convertido por regla), porque apenas existe texto real en ese alfabeto; los nombres extranjeros escritos con sh/ch (por ejemplo, Chrome) tambien se convierten.
- Los numeros se dividen en grupos de hasta 3 digitos, por lo que el texto con muchos numeros (noticias, listas) consume mas tokens por palabra.
- Solo cubre el uzbeko; no esta pensado para otros idiomas ni para texto multilingue fuera de los conjuntos evaluados.
- No es un modelo de lenguaje: no genera texto ni resuelve tareas por si mismo; su utilidad depende del modelo al que se asocie.
- Los benchmarks de calidad de modelo publicados corresponden a la variante v2-32k, no a v2-64k; no hay resultados de calidad especificos para esta variante.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validacion externa por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (Digitaluz/uzbek-language-corpus) estan bajo ODC-By v1.0, que exige atribucion.
- No se dispone de informacion sobre sesgos del corpus de entrenamiento en la documentacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/IslombekT/uzbek-bpe-v2-64k
- Dataset de entrenamiento: https://huggingface.co/datasets/Digitaluz/uzbek-language-corpus
- Dataset UzLiB: https://huggingface.co/datasets/tahrirchi/uzlib
- Dataset de clasificacion de noticias: https://huggingface.co/datasets/murodbek/uz-text-classification
