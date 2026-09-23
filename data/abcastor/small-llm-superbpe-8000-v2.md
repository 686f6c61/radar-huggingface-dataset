# abcastor/small-llm-superbpe-8000-v2

## Resumen

El repositorio `abcastor/small-llm-superbpe-8000-v2` no contiene un modelo de lenguaje, sino un tokenizador: el denominado Kefir SuperBPE, un vocabulario de 8.000 entradas entrenado el 13 de septiembre de 2026 por Edoardo Avenia y Rocco Angelella a partir de una semilla de texto en inglés filtrada. Pese al nombre del repositorio, que incluye "small-llm", el artefacto publicado es exclusivamente el componente de tokenizacion utilizado para construir el corpus Kefir v1, no un modelo generativo con pesos entrenados.

El tokenizador emplea una variante de Byte Pair Encoding en dos etapas: primero se generan 7.192 entradas de subpalabra y despues se aplican 800 merges adicionales que pueden atravesar limites de palabra, lo que da lugar a tokens multi-palabra. Ocho tokens especiales completan el vocabulario hasta las 8.000 entradas, con el token de fin de documento en el ID 7992. La pretokenizacion agrupa digitos y los divide desde la derecha en grupos de tres, y aplica codificacion a nivel de byte sin regex de espacios en blanco, decision necesaria para que la segunda etapa pueda aprender tokens que cruzan palabras.

Su relevancia es instrumental: sirve como pieza de infraestructura para quien quiera reproducir la codificacion exacta del corpus Kefir v1 o entrenar modelos pequenos sobre el mismo. La model card es explicita al senalar que la calidad del modelo aguas abajo atribuible a este tokenizador no se ha aislado, y que solo `tokenizer.json` garantiza paridad con el corpus, ya que los ficheros de modelo del lado del productor no segmentan de forma identica en todas las entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador SuperBPE (Byte Pair Encoding en dos etapas), codificacion a nivel de byte |
| Parametros totales | no aplicable (no es un modelo de lenguaje) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | ingles (`en`), segun los metadatos y la semilla de entrenamiento filtrada en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (libreria `tokenizers`); se incluyen tambien ficheros de modelo del productor |
| Tamano del vocabulario | 8.000 entradas (7.192 de subpalabra + 800 merges + 8 tokens especiales) |
| Token de fin de documento | ID 7992 |
| Libreria | `tokenizers` |
| Tamano del repositorio | 0,0 GB (declarado en HuggingFace) |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un tokenizador SuperBPE, una extension del BPE clasico que anade una segunda fase de merges sobre secuencias que pueden cruzar limites de palabra. El entrenamiento se realizo en dos etapas: una primera genero 7.192 entradas de subpalabra y una segunda aplico 800 merges adicionales capaces de atravesar fronteras de palabra, produciendo tokens multi-palabra. A ello se suman ocho tokens especiales, hasta completar las 8.000 entradas del vocabulario. La pretokenizacion agrupa los digitos y los parte desde la derecha en grupos de tres, y aplica codificacion a nivel de byte sin expresion regular de espacios en blanco, lo que habilita precisamente el aprendizaje de tokens que cruzan palabras en la segunda etapa.

El entrenamiento se llevo a cabo el 13 de septiembre de 2026 sobre una semilla de texto en ingles filtrada con criterios de prosa que, segun la model card, eran menos estrictos que los empleados posteriormente en el corpus de 100.000 millones de tokens (100B). No se documenta en la informacion disponible el numero exacto de documentos ni de tokens de esa semilla, ni el uso de tecnicas de RLHF, DPO o similares, que en cualquier caso no aplican a un tokenizador. El registro de entrenamiento se conserva en `evaluation.json`, donde se midieron el comportamiento de compresion y la integridad de ida y vuelta (round-trip); los valores concretos no se reproducen en la informacion proporcionada. El artefacto de referencia para reproducir la codificacion del corpus es `tokenizer.json`, con SHA-256 `068e20ef8a16b1bff2a2a1d161e5a6f1cfd0935befa7c0ae734c9ec376d373bb`; el codificador asigna IDs por debajo de 7992 y anade un token de fin de documento despues de cada documento.

## Capacidades

- Codificacion y decodificacion de texto en ingles con un vocabulario de 8.000 entradas.
- Segmentacion con tokens multi-palabra gracias a los 800 merges de la segunda etapa que cruzan limites de palabra.
- Tratamiento especifico de digitos: agrupacion y division desde la derecha en bloques de tres.
- Codificacion a nivel de byte sin regex de espacios en blanco, lo que preserva la informacion de espaciado.
- Insercion de un token de fin de documento (ID 7992) despues de cada documento, apto para delimitar ejemplos en un corpus.
- Paridad reproducible con el corpus Kefir v1 mediante `tokenizer.json` y su hash SHA-256 verificado.
- Generacion de texto: no aplicable, no es un modelo generativo.
- Tool calling / function calling: no aplicable.
- Soporte de agentes o razonamiento multi-paso: no aplicable.
- Capacidades multimodales (vision, audio): no aplicable.
- Capacidades multilingues: no; el tokenizador esta entrenado sobre una semilla en ingles y los metadatos solo declaran `en`.

## Casos de uso

- Codificacion del corpus Kefir v1: usar `tokenizer.json` para reproducir exactamente la segmentacion con la que se construyo el corpus de 100.000 millones de tokens, verificando la integridad mediante el SHA-256 documentado.
- Entrenamiento de modelos de lenguaje pequenos: servir como capa de tokenizacion de un LLM de vocabulario reducido (8.000 entradas), lo que disminuye el tamano de la matriz de embeddings y de la capa de salida.
- Preprocesamiento de pipelines de datos en ingles: integrar el tokenizador en flujos de limpieza y tokenizacion previos al entrenamiento, aprovechando la sustitucion de espacios y la agrupacion de digitos para normalizar cifras.
- Delimitacion de documentos en datasets: utilizar el token de fin de documento (ID 7992) para separar ejemplos en un unico flujo de tokens, practica habitual en el entrenamiento sobre corpus concatenados.
- Estudio de eficiencia de tokenizacion: comparar la compresion de este vocabulario de 8.000 entradas frente a tokenizadores de vocabulario mayor para analizar el equilibrio entre longitud de secuencia y tamano de vocabulario.
- Investigacion sobre tokens multi-palabra: analizar el efecto de los 800 merges que cruzan palabras sobre tareas posteriores, aunque la propia model card advierte de que la calidad aguas abajo no se ha aislado.
- Reproducibilidad de experimentos: fijar la version exacta del tokenizador en un experimento para garantizar que otras personas obtengan la misma segmentacion, dado que los ficheros del productor no coinciden en todas las entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que se midieron el comportamiento de compresion y la integridad de ida y vuelta, y que el registro se conserva en `evaluation.json`, pero no se proporcionan cifras concretas. Tampoco se aislo la calidad del modelo aguas abajo atribuible a este tokenizador, por lo que no existen datos de MMLU, HumanEval, GSM8K ni equivalentes.

| Metrica | Resultado |
|---|---|
| Compresion (tokens por caracter o similar) | no disponible (medida, valor no publicado) |
| Round-trip (codificacion/decodificacion exacta) | no disponible (medido, valor no publicado) |
| Calidad del modelo aguas abajo | no aislada |
| MMLU / HumanEval / GSM8K | no aplicable |

## Requisitos de hardware

- GPU: no necesaria. Un tokenizador de la libreria `tokenizers` se ejecuta en CPU.
- VRAM para inferencia: no aplicable; el consumo de memoria en GPU es nulo.
- Memoria en CPU: reducida. El repositorio declara 0,0 GB y un vocabulario de 8.000 entradas implica un `tokenizer.json` de tamano muy inferior a los tokenizadores de uso comun (la cifra exacta no se proporciona en la informacion disponible).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable, al no requerir aceleracion.
- Opciones de despliegue: libreria `tokenizers` de HuggingFace (via `Tokenizer.from_pretrained`), e integracion en `transformers` y en pipelines de preprocesamiento de datos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos comparables. Como referencia cualitativa, este tokenizador destaca por su vocabulario deliberadamente pequeno (8.000 entradas) frente a los tokenizadores de los LLM abiertos habituales, que suelen emplear vocabularios de decenas o cientos de miles de entradas. Esa eleccion reduce el coste de las matrices de embeddings, a cambio de generar secuencias mas largas para el mismo texto.

| Tokenizador | Tamano de vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kefir SuperBPE 8000 v2 | 8.000 | en | Apache-2.0 | HuggingFace (`abcastor/small-llm-superbpe-8000-v2`) |
| Tokenizadores de LLM abiertos de gran vocabulario | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede utilizarse para tareas de inferencia. Cualquier uso como "modelo" seria un error de interpretacion del nombre del repositorio.
- Idioma unico: los metadatos y la semilla de entrenamiento corresponden unicamente al ingles; el comportamiento sobre otros idiomas no esta documentado.
- Paridad de segmentacion: los ficheros de modelo del lado del productor no segmentan de forma identica en todas las entradas. Para reproducir la codificacion del corpus debe usarse `tokenizer.json`, cuya integridad conviene verificar con el SHA-256 `068e20ef8a16b1bff2a2a1d161e5a6f1cfd0935befa7c0ae734c9ec376d373bb`.
- Vocabulario muy reducido: 8.000 entradas implica secuencias mas largas y mayor coste computacional en el modelo que lo utilice, en comparacion con tokenizadores de vocabulario amplio.
- Dependencia del corpus: el tokenizador se entreno sobre una semilla filtrada con criterios de prosa que difieren de los del corpus posterior de 100B, por lo que su ajuste al corpus final no esta cuantificado en la informacion disponible.
- Ausencia de validacion aguas abajo: no se ha aislado la contribucion del tokenizador a la calidad de un modelo entrenado con el.
- Sesgos: no se documenta ningun analisis de sesgos del vocabulario ni de los datos de entrenamiento.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Licencia Apache-2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia; no se documentan restricciones adicionales.
- Fechas de creacion y actualizacion (2026-09-23) posteriores a la fecha de consulta habitual, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/abcastor/small-llm-superbpe-8000-v2
- Corpus Kefir v1 (bucket de HuggingFace): https://huggingface.co/buckets/abcastor/small-llm-corpus-100b-v2-dataset
