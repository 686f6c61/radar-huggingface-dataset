# rodcasnog/tinystories-bpe-1k

## Resumen

`rodcasnog/tinystories-bpe-1k` no es un modelo de lenguaje, sino un **tokenizador BPE** entrenado sobre el corpus [roneneldan/TinyStories](https://huggingface.co/datasets/roneneldan/TinyStories). Forma parte del material reproducible del artículo *Binary Discrete Diffusion: Candidate-Set Diffusion for Logic and Planning Tasks* (Casado Noguerales et al., 2026), y se publica para que los experimentos de dicho trabajo puedan replicarse de forma exacta. Su vocabulario es deliberadamente diminuto: 1.023 tokens, incluyendo el token `<unk>`.

El tokenizador segmenta el texto con una expresion regular de estilo GPT-2 y **no es byte-level**, de modo que cualquier caracter fuera del vocabulario aprendido se mapea a `<unk>`. Esto lo hace inadecuado para texto general, pero suficiente y eficiente para el corpus TinyStories, formado por cuentos infantiles sinteticos con vocabulario muy restringido. El final de cada cuento se marca con `<|endoftext|>` (id 1023) y el relleno con `<pad>` (id 1024).

Su relevancia actual es acotada: sirve como pieza auxiliar de un pipeline de investigacion sobre difusion discreta, no como componente listo para produccion en aplicaciones de NLP general. Aun asi, su licencia Apache-2.0 y su integracion directa con `transformers` facilitan su reutilizacion en experimentos academicos de modelado de lenguaje a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (no neuronal); segmentacion previa con regex estilo GPT-2 |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles (entrenado sobre TinyStories, corpus en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; se distribuye como artefacto de tokenizer cargable con `AutoTokenizer` (ficheros vocab/merges en el repositorio) |

## Arquitectura y entrenamiento

Se trata de un tokenizador **Byte Pair Encoding (BPE)** clasico, con una etapa previa de pre-tokenizacion mediante una expresion regular de estilo GPT-2. A diferencia de los tokenizadores byte-level (como el de GPT-2 o Llama 3), este opera sobre caracteres Unicode y no sobre bytes, por lo que los caracteres no vistos durante el entrenamiento colapsan en `<unk>`. El vocabulario final contiene 1.023 tokens, incluyendo `<unk>`, y se reservan dos identificadores adicionales: `<|endoftext|>` (1023) para fin de secuencia y `<pad>` (1024) para relleno.

El entrenamiento se realizo sobre el dataset TinyStories, un corpus de cuentos infantiles sinteticos generados con modelos de lenguaje y disenado para estudiar el aprendizaje de capacidades linguisticas en regimenes de datos reducidos. No se especifican en la model card el numero exacto de tokens de entrenamiento, la composicion del dataset ni detalles adicionales del proceso de construccion del vocabulario. El tokenizador se integra en el repositorio [binary-discrete-diffusion](https://github.com/rodcasnog/binary-discrete-diffusion) mediante los scripts `scripts/prep_tinystories.py` y la configuracion `configs/tinystories.yaml`.

## Capacidades

- **Tokenizacion de texto**: convierte cadenas en secuencias de IDs y viceversa, con soporte para truncado y padding.
- **Delimitacion de secuencias**: usa `<|endoftext|>` (id 1023) como marcador de fin de cuento y `<pad>` (id 1024) para relleno por lotes.
- **Compatibilidad con `transformers`**: se carga mediante `AutoTokenizer.from_pretrained("rodcasnog/tinystories-bpe-1k")`.
- **Integracion con pipelines de investigacion**: disenado para encajar en el flujo de entrenamiento/evaluacion del paper de difusion discreta binaria.
- **Vocabulario compacto**: 1.023 tokens, lo que reduce el tamano de la matriz de embeddings en modelos pequenos.
- **Sin capacidades generativas**: no genera texto, no razona, no hace tool calling ni soporta agentes; es una pieza auxiliar.

## Casos de uso

- **Replicacion de experimentos del paper**: cargar el tokenizador con `AutoTokenizer` y alimentar los scripts `prep_tinystories.py` para reproducir exactamente la tokenizacion usada en *Binary Discrete Diffusion*, garantizando comparabilidad de resultados.
- **Entrenamiento de modelos de lenguaje a muy pequena escala**: usar este tokenizador en modelos tipo TinyStories (del orden de millones de parametros) para reducir el tamano del vocabulario y acelerar el entrenamiento en GPUs de consumo.
- **Investigacion en difusion discreta**: emplearlo como capa de representacion de texto en modelos de difusion sobre tokens discretos, donde un vocabulario pequeno simplifica el espacio de estados del proceso de difusion.
- **Docencia y prototipado rapido**: construir un pipeline completo de tokenizacion + modelo pequeno + generacion en un cuaderno, con un vocabulario manejable para inspeccionar manualmente los IDs.
- **Analisis de tokenizacion sobre cuentos infantiles**: estudiar la distribucion de tokens, la tasa de `<unk>` y la longitud media de secuencia sobre el corpus TinyStories.
- **Pruebas de infraestructura**: validar flujos de carga de tokenizers desde Hugging Face Hub, integracion con `datasets` y empaquetado en contenedores sin necesidad de descargar modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM**: practicamente nula; el tokenizador es un artefacto de pocos kilobytes que se ejecuta en CPU.
- **GPU recomendadas**: no aplica; cualquier CPU es suficiente. En caso de usarse junto a un modelo TinyStories, una GPU de consumo (GTX 1650, RTX 3060) basta.
- **GPU de consumo**: si, cabe en cualquier GPU o incluso en CPU exclusivamente.
- **Opciones de despliegue**: `transformers` (`AutoTokenizer`), `tokenizers` (libreria Rust subyacente), integracion con `datasets` para preprocesamiento por lotes.
- **Latencia y throughput**: no disponibles de forma oficial; al ser un tokenizador BPE con vocabulario de 1.023 tokens, la tokenizacion es del orden de millones de tokens por segundo en CPU, aunque no se proporcionan cifras medidas.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Byte-level | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `rodcasnog/tinystories-bpe-1k` | BPE + regex GPT-2 | 1.023 | No | Apache-2.0 | TinyStories, difusion discreta |
| `openai-community/gpt2` | BPE byte-level | 50.257 | Si | MIT | Uso general en ingles |
| `meta-llama/Llama-3.2-1B` | BPE byte-level (tiktoken) | 128.256 | Si | Llama 3.2 Community License | Uso general multilingue |

La comparativa se limita a tokenizadores porque el artefacto publicado no es un modelo. Frente a GPT-2 y Llama 3.2, la diferencia clave es el tamano del vocabulario (unas 50 y 125 veces menor, respectivamente) y la ausencia de tokenizacion byte-level, lo que lo restringe a corpus con vocabulario controlado como TinyStories.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto ni realiza tareas cognitivas; es unicamente un tokenizador.
- **Manejo de caracteres no vistos**: al no ser byte-level, cualquier caracter fuera del vocabulario se mapea a `<unk>`, lo que degrada la tokenizacion de texto con simbolos, emojis, alfabetos no latinos o errores tipograficos.
- **Idioma**: entrenado sobre TinyStories (corpus en ingles); no se declaran idiomas soportados y su uso en castellano u otras lenguas producira abundantes `<unk>`.
- **Vocabulario muy reducido**: 1.023 tokens implican secuencias mas largas para el mismo texto que con tokenizadores estandar, lo que penaliza la eficiencia en contextos largos.
- **Sesgos**: al derivarse de un corpus sintetico de cuentos infantiles, hereda el sesgo de dicho corpus; no se documentan analisis de sesgo en la model card.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero la utilidad practica del tokenizador fuera del ambito de investigacion es muy limitada.
- **Mantenimiento**: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay garantia de soporte ni de actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/rodcasnog/tinystories-bpe-1k
- Paper (arXiv): https://arxiv.org/abs/2610.28543
- Repositorio del proyecto: https://github.com/rodcasnog/binary-discrete-diffusion
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
