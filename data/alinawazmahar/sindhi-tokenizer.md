# alinawazmahar/sindhi-tokenizer

## Resumen

El modelo `alinawazmahar/sindhi-tokenizer` no es un modelo de lenguaje, sino un **tokenizador de subpalabras** para sindhi (سنڌي), la lengua indoaria hablada principalmente en Pakistán y la India y escrita en escritura perso-árabe. Lo desarrolla Ali Nawaz (autor principal) junto con Muqadas Fareed y Soonh Sadaf, con supervisión de Attaullah Sahito en la Shaikh Ayaz University de Shikarpur (Pakistán). Se publica bajo licencia CC BY-SA 4.0 para el artefacto del tokenizador y MIT para el código del repositorio.

Técnicamente es un modelo **SentencePiece Unigram** con `byte_fallback=True` y `character_coverage=1.0`, entrenado sobre aproximadamente 1,46 millones de frases procedentes de cuatro fuentes (entre ellas `wikimedia/wikipedia` y `shaikhsalman/sindhi-llm-corpus`). Se distribuye en cuatro tamanos de vocabulario: 32.000, 64.000, 100.000 y 150.000 piezas, siendo **64.000 el valor recomendado por el autor**.

Su relevancia es concreta: los tokenizadores multilingües genericos fragmentan el sindhi de forma muy agresiva (Llama 3.2 consume 2,896 tokens por palabra; XLM-RoBERTa, 1,512), lo que encarece el preentrenamiento y reduce el texto util que cabe en la ventana de contexto. Este tokenizador baja a **1,147 tokens por palabra** y mantiene el **88,6% de las palabras como un único token**, sin emitir nunca `<unk>` y con perdida de caracteres nula en la ida y vuelta encode/decode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece Unigram (modelo de segmentacion estadistico, sin redes neuronales) |
| Parametros totales | no aplica: el artefacto es un vocabulario + modelo de probabilidad de piezas, no contiene pesos neuronales |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica: procesa la cadena de entrada completa; no hay ventana definida por el tokenizador |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | sindhi (`sd`), escritura arabe/perso-arabe; no validado para sindhi en devanagari |
| Licencia | CC BY-SA 4.0 (tokenizador); MIT (codigo del repositorio GitHub) |
| Formato de pesos | SentencePiece protobuf (`.model`) + vocabulario en texto (`.vocab`); no hay safetensors ni GGUF |
| Algoritmo de tokenizacion | Unigram (Viterbi sobre probabilidades de pieza) |
| Byte fallback | Si (`byte_fallback=True`): los caracteres desconocidos se emiten como tokens `<0xNN>`, no como `<unk>` |
| Cobertura de caracteres | `character_coverage=1.0` (las nueve letras especificas del sindhi nunca se descartan) |
| Tamanos de vocabulario | 32.000 · 64.000 (por defecto) · 100.000 · 150.000 |
| Corpus de entrenamiento | ~1,46 millones de frases de cuatro fuentes |
| IDs especiales | `<unk>`=0, `<s>`=1, `</s>`=2; no hay token de padding (id -1) |
| Libreria de carga | `sentencepiece` (`SentencePieceProcessor`) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace); el tamano de cada fichero `.model` no se publica |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-20 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo **Unigram** de SentencePiece: un modelo de lenguaje sobre piezas que estima la probabilidad de cada subpalabra y segmenta la entrada maximizando la verosimilitud (decodificacion de Viterbi sobre la lattice de candidatos). Frente a BPE, Unigram parte de un vocabulario grande y lo poda por perdida de verosimilitud, lo que en lenguas con morfologia aglutinante y escritura perso-arabe tiende a producir segmentaciones mas estables. Se activa `byte_fallback=True`, de modo que cualquier caracter fuera del vocabulario se representa mediante tokens de byte `<0xNN>` en lugar de colapsar a `<unk>`, y se fija `character_coverage=1.0` para garantizar que las nueve letras propias del sindhi esten siempre representadas.

El corpus de entrenamiento ronda los **1,46 millones de frases** agregadas de cuatro fuentes; la model card cita explicitamente `wikimedia/wikipedia` y `shaikhsalman/sindhi-llm-corpus`, pero no detalla la composicion exacta ni el numero total de tokens del dataset. No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un tokenizador. La evaluacion acompanante es inusualmente sistematica para este tipo de artefacto: **18 tokenizadores candidatos** (14 lineas base externas mas las 4 variantes de este modelo) sobre **cuatro registros** de texto sindhi, con **cinco metricas** y sin muestreo (evaluacion exhaustiva sobre el corpus de prueba).

## Capacidades

- Segmentacion de texto sindhi en subpalabras y conversion bidireccional entre texto, piezas y IDs (`encode`/`decode`).
- Cobertura total de caracteres: ninguna de las letras especificas del sindhi se pierde, gracias a `character_coverage=1.0`.
- Tolerancia a caracteres desconocidos mediante byte fallback: los simbolos raros se tokenizan como bytes en vez de producir `<unk>`.
- Fidelidad de reconstruccion: 0,0000% de perdida de caracteres en round-trip tras normalizacion Unicode, en los cuatro tamanos y los cuatro registros evaluados.
- Cuatro presupuestos de vocabulario intercambiables (32k, 64k, 100k, 150k) para ajustar el compromiso entre tamano de la tabla de embeddings y fertilidad.
- Integracion directa con el ecosistema SentencePiece (`SentencePieceProcessor`) y, por tanto, con frameworks de entrenamiento que consumen modelos `.model`.
- **No** incorpora generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidad de agente: no es un modelo de lenguaje.
- **No** se ha validado en un modelo downstream (la model card lo declara explicitamente).

## Casos de uso

- **Preentrenamiento de un LLM en sindhi desde cero**: usando `sindhi_custom_64000.model` como vocabulario base, cada palabra cuesta 1,147 tokens en lugar de los 2,896 de Llama 3.2; sobre un corpus de miles de millones de palabras eso se traduce en una reduccion de aproximadamente el 60% de tokens vistos y, por tanto, de FLOPs de entrenamiento y de presupuesto.
- **Ampliacion del vocabulario de un modelo multilingue existente**: sustituir o complementar el tokenizador original con el de 32k o 64k y reinicializar las filas correspondientes de la matriz de embeddings; la fertilidad de 1,147 frente a 1,512 de XLM-RoBERTa justifica el reentrenamiento parcial de la capa de embeddings.
- **Maximizar el texto util dentro de una ventana de contexto fija**: en inferencia, la diferencia de fertilidad implica que en una ventana de 8.000 tokens caben aproximadamente 2,5 veces mas palabras sindhi con este tokenizador que con el de Llama 3.2, lo que reduce el numero de llamadas y el coste por documento.
- **Curacion y deduplicacion de corpus**: la fidelidad de round-trip del 0,0000% permite normalizar y recontruir documentos sin perdida, algo critico cuando se comparan hashes o se verifica integridad de un dataset; dos tokenizadores sindhi alternativos eliminan caracteres de forma silenciosa segun el autor.
- **Pipelines de NLP supervisado (clasificacion, NER, analisis de sentimiento)**: tokenizar el corpus de entrenamiento y de produccion con la misma segmentacion estable y sin `<unk>` evita el clasico desajuste entre vocabularios y perdida de entidades por fragmentacion excesiva.
- **Indexacion y busqueda (IR/BM25) sobre texto sindhi**: la segmentacion consistente y el bajo numero de tokens por palabra reducen el ruido en el indice invertido y estabilizan las estadisticas de frecuencia de terminos entre documentos.
- **Investigacion linguistica y analitica morfologica**: el vocabulario Unigram expone prefijos, sufijos y raices del sindhi como piezas reutilizables, lo que facilita estudios de morfologia derivativa y de productividad de afijos a partir del fichero `.vocab`.
- **Prototipado y demostraciones**: el tokenizador se carga en CPU en milisegundos, lo que permite incluirlo en un demo interactivo o en un notebook sin dependencias de GPU (el repositorio incluye `demo/app.py`).

## Benchmarks y rendimiento

La model card no reporta resultados en benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) porque el artefacto no es un LM. Lo que si publica es la evaluacion del tokenizador: 18 candidatos, 4 registros, 5 metricas, sin muestreo. Los datos disponibles son:

| Tokenizador | Fertilidad (tokens/palabra, media de 4 registros) | Palabras en un solo token | Tasa `<unk>` | Perdida en round-trip | Tasa de byte fallback |
|---|---|---|---|---|---|
| Sindhi custom 150k | la mejor del estudio (cifra no publicada) | no disponible | 0,000% | 0,0000% | no disponible |
| Sindhi custom 100k | ligeramente mejor que 64k (cifra no publicada) | no disponible | 0,000% | 0,0000% | no disponible |
| Sindhi custom 64k (por defecto) | **1,147** | **88,6%** | **0,000%** | **0,0000%** | 0,138% de los tokens |
| Sindhi custom 32k | no disponible (1,233 en FLORES+) | no disponible | 0,000% | 0,0000% | no disponible |
| XLM-RoBERTa | 1,512 | 65,4% | no disponible | no disponible | no disponible |
| Llama 3.2 | 2,896 | 18,2% | no disponible | no disponible | no disponible |
| TinyLlama_Sindhi | 1,193 (solo FLORES+) | no disponible | no disponible | no disponible | no disponible |

Notas: la cifra de 1,193 de TinyLlama_Sindhi corresponde exclusivamente al conjunto FLORES+ y no es directamente comparable con las medias de cuatro registros. En FLORES+, el tokenizador de 32k de este proyecto obtiene 1,233 y queda por detras de TinyLlama_Sindhi, excepcion que el autor senala de forma explicita. No se han publicado resultados de benchmarks downstream (perplejidad de un LM entrenado con este vocabulario, tareas de generacion o clasificacion) en la informacion disponible.

## Requisitos de hardware

- **VRAM**: no aplica. El tokenizador se ejecuta en CPU y no requiere GPU.
- **Memoria RAM**: del orden de unos pocos megabytes, correspondientes al protobuf del modelo Unigram y a la tabla de piezas. El tamano exacto de cada fichero `.model` no se publica en la model card (aparece como "(measured at upload) MB").
- **GPU recomendadas**: ninguna. Cualquier CPU x86-64 o ARM moderna es suficiente; puede ejecutarse en un contenedor de 128 MB o en una Raspberry Pi.
- **Latencia y throughput**: no se publican medidas. Al ser una implementacion SentencePiece en C++ con envoltorio Python, la latencia por frase corta esta tipicamente en el orden de microsegundos a pocos milisegundos, pero no hay cifras oficiales en la informacion disponible.
- **Opciones de despliegue**: `sentencepiece` (`SentencePieceProcessor`) en Python; el mismo `.model` es consumible desde las implementaciones de SentencePiece en C++, Rust y Java, y convertible al formato de la libreria `tokenizers` de HuggingFace. No aplican vLLM, llama.cpp, Ollama ni TGI, que sirven modelos con pesos neuronales.
- **Almacenamiento**: el repositorio completo ocupa 0,0 GB segun HuggingFace; cada fichero individual es de tamaño muy reducido.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Fertilidad (sindhi) | Palabras en un token | `<unk>` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Sindhi custom 64k (este) | SentencePiece Unigram + byte fallback | 64.000 | 1,147 | 88,6% | 0,000% | CC BY-SA 4.0 | HuggingFace + GitHub + demo |
| Sindhi custom 32k (este) | SentencePiece Unigram + byte fallback | 32.000 | no disponible (1,233 en FLORES+) | no disponible | 0,000% | CC BY-SA 4.0 | HuggingFace |
| Sindhi custom 150k (este) | SentencePiece Unigram + byte fallback | 150.000 | la mejor del estudio | no disponible | 0,000% | CC BY-SA 4.0 | HuggingFace |
| XLM-RoBERTa (tokenizador) | SentencePiece BPE, multilingue | 250.000 | 1,512 | 65,4% | no disponible | MIT | Ampliamente disponible |
| Llama 3.2 (tokenizador) | BPE (tiktoken-style), multilingue | 128.256 | 2,896 | 18,2% | no disponible | Llama 3.2 Community License | Ampliamente disponible |
| TinyLlama_Sindhi (tokenizador) | no disponible en la informacion | no disponible | 1,193 (FLORES+) | no disponible | no disponible | no disponible | no disponible |

La comparacion es en terminos de coste de tokenizacion, no de calidad de modelado: ninguno de los tres tokenizadores multilingues de referencia esta optimizado para la escritura perso-arabe del sindhi, y la diferencia de fertilidad (1,147 frente a 2,896) se traduce directamente en coste de entrenamiento y de inferencia.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto ni resuelve tareas; es un componente de preprocesado. Cualquier expectativa de rendimiento tipo MMLU o HumanEval queda fuera de su alcance por definicion.
- **Sin validacion downstream**: la model card declara explicitamente que el tokenizador no se ha probado dentro de un modelo entrenado, por lo que el beneficio real en perplejidad o en tareas finales no esta medido.
- **Sin validar para voz**: no se ha evaluado en reconocimiento automatico del habla ni en sintesis de voz, donde los requisitos de tokenizacion difieren.
- **Solo escritura perso-arabe**: no cubre sindhi escrito en devanagari, variedad usada por parte de la comunidad en la India. Aplicarlo a ese texto degradaria la segmentacion y dispararia el byte fallback.
- **Sesgo de dominio del corpus**: al entrenarse sobre Wikipedia y un corpus LLM concreto, la cobertura lexica puede ser menor en registros coloquiales, dialectales o tecnicos especializados; el autor no publica analisis de sesgo ni desglose por dominio.
- **Riesgo de infrarrepresentacion de variantes dialectales**: no se documenta la distribucion geografica o dialectal del corpus de 1,46 millones de frases.
- **Sin token de padding**: el id de padding es -1, es decir, no existe; es necesario anadir uno manualmente antes de usarlo en entrenamiento por lotes, lo que es una fuente habitual de errores en pipelines.
- **Licencia copyleft**: CC BY-SA 4.0 sobre el artefacto implica obligacion de atribucion y de compartir bajo la misma licencia las obras derivadas; conviene revisar la implicacion para productos comerciales que redistribuyan el vocabulario. El codigo del repositorio es MIT, con condiciones distintas.
- **Adopcion practica nula por ahora**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- **Documentacion incompleta en algunos puntos**: los tamanos de fichero aparecen como "(measured at upload)" sin cifra, y los ejemplos de salida del codigo de la model card estan sin rellenar, por lo que no se puede verificar la tokenizacion de ejemplo sin ejecutar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/alinawazmahar/sindhi-tokenizer
- Repositorio GitHub: https://github.com/alinawazcode/sindhi-tokenizer
- Documentacion: https://alinawazcode.github.io/sindhi-tokenizer/
- Paper: https://github.com/alinawazcode/sindhi-tokenizer/blob/main/docs/paper.md
- Explicacion tecnica: https://github.com/alinawazcode/sindhi-tokenizer/blob/main/docs/explainer.md
- Demo interactiva: https://github.com/alinawazcode/sindhi-tokenizer/blob/main/demo/app.py
- Dataset de entrenamiento citado: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de entrenamiento citado: https://huggingface.co/datasets/shaikhsalman/sindhi-llm-corpus
