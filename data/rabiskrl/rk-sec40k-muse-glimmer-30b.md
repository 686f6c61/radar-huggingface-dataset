# rabiskrl/rk-sec40k-muse-glimmer-30b

## Resumen

`rk-sec40k-muse-glimmer-30b` es un **tokenizer derivado**, no un modelo de lenguaje completo. Lo publica Rabia Korol (comunidad Magibu, colaboración con Ali Bayram) a partir del tokenizer de `meta-models/Muse-Glimmer-30B`, un modelo base de 30.000 millones de parámetros. El objetivo es mejorar la eficiencia del tokenizador en turco sin alterar el tamano del vocabulario original (202.048 entradas), de modo que pueda sustituirse en el modelo base sin tocar la dimension de la matriz de embeddings.

La intervencion consiste en anadir 35.726 tokens seleccionados del tokenizador turco `rabiskrl/rk-tr-tokenizer-64k` (los 40.000 primeros por orden de aprendizaje con al menos 4 letras, mas sus cadenas de merge intermedias) y eliminar 35.726 tokens raros de Muse, preservando los ID originales de los tokens de Muse que se mantienen. El resultado reduce el consumo de tokens en turco un 27,1 % y mejora el F1 morfologico de 36,20 a 52,54, a cambio de un incremento del 2,8 % en ingles y del 3,5 % en codigo.

Es relevante para quien quiera adaptar Muse-Glimmer-30B al turco sin reentrenar el vocabulario desde cero ni romper la compatibilidad de IDs. El repositorio **solo contiene el tokenizer** (0,0 GB, sin pesos); las embeddings de los nuevos tokens deben entrenarse antes de usar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer ByteLevel BPE (derivado de Muse-Glimmer-30B) |
| Parametros totales | no disponible (el repo no contiene pesos de modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base Muse-Glimmer-30B) |
| Tipos de cuantizacion | no disponible (aplica al modelo base, no al tokenizer) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | tokenizer.json (Hugging Face `transformers`); sin safetensors ni GGUF |
| Vocabulario | 202.048 tokens (sin cambios respecto a Muse) |
| Tokens anadidos | 35.726 (procedentes de RK-64k) |
| Tokens eliminados | 35.726 (los mas raros de Muse) |
| Herramienta de construccion | `malibayram/bpe-tokenizer-editor` 0.2.0, metodo `merge_from` |
| Modelo base | `meta-models/Muse-Glimmer-30B` |

## Arquitectura y entrenamiento

El tokenizer es un BPE byte-level con pre-tokenizacion heredada de Muse-Glimmer-30B (regex con patrones ingleses tipo `'s|'t|'re|'ve|'m|'ll|'d`). La construccion se hace en tres fases: (1) seleccion de los 40.000 primeros tokens de RK-64k por orden de aprendizaje con al menos 4 letras, mas las cadenas de merge necesarias para formarlos (44.648 tokens en total); (2) conversion de formato de SentencePiece (`▁`) a ByteLevel (`Ġ`) pasando por bytes y UTF-8, descartando fragmentos multibyte que no forman UTF-8 valido de forma aislada; (3) fusion mediante `merge_from` con `max_vocab_size=202048` y orden de reglas puente → RK → Muse. Los ficheros `tokenizer_config.json`, `chat_template.jinja` y `processor_config.json` de Muse se copian sin modificar.

No hay entrenamiento de modelo ni ajuste fino: el repositorio es puramente un artefacto de tokenizacion. La innovacion tecnica es el mantenimiento del tamano de vocabulario y de los ID de los tokens de Muse conservados, lo que permite, en teoria, sustituir el tokenizer en el modelo base sin cambiar la forma de la capa de embeddings. Las embeddings de los 35.726 tokens nuevos no estan entrenadas y deben inicializarse y entrenarse antes de cualquier uso del modelo con este tokenizer.

## Capacidades

- Tokenizacion de texto en turco e ingles con un unico vocabulario de 202.048 entradas.
- Reduccion del consumo de tokens en turco: 191,4 tokens por 1.000 caracteres frente a 262,4 del original (−27,1 %), con fertility de 1,562 frente a 2,142.
- Mejora del analisis morfologico turco: F1 de 52,54 frente a 36,20 del tokenizer original.
- Preservacion de la tokenizacion inglesa en un 94,2 % de los casos respecto a Muse (el 5,8 % restante se segmenta de forma distinta).
- Compatibilidad con la API `AutoTokenizer` de `transformers` y con el pipeline de chat template de Muse (heredado sin cambios).
- Soporte de decodificacion sin perdida: 12/12 en las pruebas de round-trip reportadas.
- No incluye capacidades de generacion, razonamiento, codigo, vision, tool calling ni agentes: esas capacidades pertenecen al modelo base Muse-Glimmer-30B, no a este repositorio.

## Casos de uso

- **Adaptacion de Muse-Glimmer-30B al turco:** sustituir el tokenizer original por este en el pipeline de entrenamiento o inferencia del modelo base para reducir un 27,1 % el numero de tokens procesados en textos turcos, con el consiguiente ahorro en coste de atencion y latencia. Requiere entrenar previamente las embeddings de los 35.726 tokens nuevos.
- **Preentrenamiento o ajuste fino en turco:** usar este vocabulario como punto de partida para un modelo derivado de Muse-Glimmer-30B orientado a turco, manteniendo la forma de la capa de embeddings (202.048) y los ID de los tokens de Muse conservados.
- **Procesamiento de lenguaje natural turco con analisis morfologico:** pipelines de etiquetado, lematizacion o analisis de sufijos que se beneficien del F1 morfologico de 52,54 frente a 36,20 del tokenizer original.
- **Sistemas bilingues turco-ingles:** aplicaciones que alternan ambos idiomas y necesitan un unico vocabulario; el coste adicional en ingles es del 2,8 % en tokens, asumible frente a la ganancia en turco.
- **Indexacion y busqueda documental en turco:** motores de busqueda o sistemas RAG sobre corpus turcos donde la reduccion de tokens por documento se traduce en menor uso de contexto y mayor numero de documentos por ventana.
- **Evaluacion comparativa de tokenizers:** banco de pruebas para medir el impacto de la sustitucion de vocabulario en modelos de 30B, con metricas publicadas de tokens por 1.000 caracteres, fertility y F1 morfologico sobre conjuntos de referencia (18.480 caracteres en turco, 20.065 en ingles, 28.337 en codigo).
- **Investigacion en eficiencia de tokenizacion:** estudio del compromiso entre cobertura multilingue y tamano fijo de vocabulario, con una alternativa publicada (`rabiaekenn/re-sec40k-muse-glimmer-30b`) para comparar estrategias de seleccion.

## Benchmarks y rendimiento

Metricas publicadas por el autor sobre el propio tokenizer (no sobre el modelo):

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertility ↓ | F1 morf. ↑ | EN tok/1.000 ↓ | Codigo tok/1.000 ↓ | EN igual que original ↑ | Sin perdida |
|---|---:|---:|---:|---:|---:|---:|---:|:---:|
| Muse-Glimmer-30B (original) | 202.048 | 262,4 | 2,142 | 36,20 | 222,8 | 228,0 | 100 % | 12/12 |
| rk64k-muse-glimmer-30b | 202.048 | 184,1 | 1,503 | 52,69 | 232,3 | 236,4 | 91,9 % | 12/12 |
| **rk-sec40k-muse-glimmer-30b (este repo)** | 202.048 | **191,4** | **1,562** | **52,54** | **229,0** | **235,9** | **94,2 %** | 12/12 |
| rabiaekenn/re-sec40k-muse-glimmer-30b | 202.048 | 193,1 | 1,576 | 49,14 | 228,6 | 236,2 | 94,4 % | 12/12 |

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el repositorio no contiene pesos.

## Requisitos de hardware

- El repositorio no contiene pesos de modelo; no requiere VRAM para su uso como tokenizer (ejecucion en CPU, memoria despreciable).
- Para usar el modelo base Muse-Glimmer-30B con este tokenizer, los requisitos son los del modelo de 30B: no disponibles en la informacion proporcionada.
- GPU recomendadas para el modelo base: no disponibles en la informacion proporcionada.
- Despliegue del tokenizer: cualquier entorno con `transformers` (`AutoTokenizer.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware.

## Comparativa con modelos similares

Comparacion con tokenizers de la misma familia y categoria:

| Tokenizer | Vocabulario | TR tok/1.000 | F1 morf. | EN tok/1.000 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| rk-sec40k-muse-glimmer-30b | 202.048 | 191,4 | 52,54 | 229,0 | Apache 2.0 | Hugging Face (`rabiskrl`) |
| rk64k-muse-glimmer-30b | 202.048 | 184,1 | 52,69 | 232,3 | no disponible | Hugging Face (`rabiskrl`) |
| re-sec40k-muse-glimmer-30b | 202.048 | 193,1 | 49,14 | 228,6 | no disponible | Hugging Face (`rabiaekenn`) |
| Muse-Glimmer-30B (original) | 202.048 | 262,4 | 36,20 | 222,8 | Apache 2.0 | Hugging Face (`meta-models`) |

No se dispone de datos de tokenizers comparables de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo:** el repositorio solo contiene el tokenizer; no hay pesos, no genera texto y no puede evaluarse en tareas de lenguaje sin el modelo base.
- **Embeddings sin entrenar:** los 35.726 tokens nuevos carecen de embeddings entrenadas; deben inicializarse y entrenarse antes de usar Muse-Glimmer-30B con este tokenizer.
- **Apostrofo en turco:** `Türkiye'de` se segmenta como `Türkiye` + `'d` + `e` por la regex de pre-tokenizacion inglesa heredada de Muse (`'s|'t|'re|'ve|'m|'ll|'d`); la fusion no modifica la pre-tokenizacion.
- **Perdida en ingles y codigo:** +2,8 % de tokens en ingles y +3,5 % en codigo respecto al original, con un 5,8 % de palabras inglesas segmentadas de forma distinta.
- **Muestras de evaluacion pequenas:** 18.480 caracteres en turco, 20.065 en ingles y 28.337 en codigo; las metricas pueden no generalizar a otros dominios.
- **Sesgos:** no documentados en la informacion disponible; dependen del corpus de entrenamiento del tokenizer RK-64k y del modelo base.
- **Alucinacion:** no aplica al tokenizer; es un riesgo del modelo base, no evaluado aqui.
- **Licencia:** Apache 2.0, pero derivada y modificada del tokenizer de Muse-Glimmer-30B; deben respetarse las condiciones de uso del repositorio original (`USAGE_POLICY.md`).
- **Compatibilidad de IDs:** los tokens de Muse conservados mantienen su ID, pero los 35.726 eliminados dejan de existir; cualquier codigo que referencie esos IDs fallara.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rabiskrl/rk-sec40k-muse-glimmer-30b
- Version con todos los tokens RK: https://huggingface.co/rabiskrl/rk64k-muse-glimmer-30b
- Tokenizer turco de origen: https://huggingface.co/rabiskrl/rk-tr-tokenizer-64k
- Alternativa de la misma familia: https://huggingface.co/rabiaekenn/re-sec40k-muse-glimmer-30b
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta de edicion de tokenizers: https://github.com/malibayram/bpe-tokenizer-editor
- Dataset de analisis morfologico: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
