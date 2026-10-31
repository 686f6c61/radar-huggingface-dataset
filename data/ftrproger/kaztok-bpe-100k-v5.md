# ftrproger/KazTok-BPE-100k-v5

## Resumen

KazTok BPE 100k v5 es un tokenizador (no un modelo de lenguaje entrenado) orientado al kazaco, publicado en Hugging Face por el autor ftrproger (mantenido por Nuraly Zhanbyrbay). Se trata de un tokenizador ByteLevel BPE con un vocabulario de 100.000 tokens, entrenado sobre una partición verificada del corpus Leipzig en kazaco, con hashes SHA-256 publicados tanto para los datos de entrenamiento como para el tokenizador resultante, lo que garantiza reproducibilidad.

Su relevancia radica en la escasez de tokenizadores abiertos y bien documentados centrados en el kazaco, una lengua de recursos limitados. La representación a nivel de byte permite codificar y decodificar sin pérdida cualquier texto UTF-8, incluidas mezclas de kazaco, ruso, inglés, puntuación y emojis. El proyecto incluye además un estudio comparativo de tamaños de vocabulario (50k, 100k, 150k y 300k) en un pequeño decoder proxy con parámetros aproximadamente igualados, y justifica la elección de 100k como compromiso práctico entre eficiencia de compresión y coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador ByteLevel BPE (no es un modelo LLM) |
| Parametros totales | no disponible (no aplica: es un tokenizador) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Kazaco (kk), ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de tokenizadores, libreria `tokenizers`) |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo ByteLevel BPE, que opera sobre bytes en lugar de caracteres Unicode. Esto garantiza que cualquier secuencia UTF-8 arbitraria pueda codificarse y decodificarse sin perdida (round-trip del 100 % en la suite de regresion del proyecto), evitando tokens desconocidos incluso ante emojis, alfabetos cirilicos mezclados o puntuacion poco comun.

El entrenamiento se realizo sobre una particion verificada del corpus Leipzig en kazaco, con un hash SHA-256 publicado del split (`b399db13...`) y del tokenizador resultante (`de97870b...`). El estudio de vocabulario se llevo a cabo en un decoder proxy pequeno con exposicion aproximada de 8 millones de caracteres y tres semillas: los vocabularios de 100k y 150k obtuvieron BPC medio practicamente identico (2,994455 frente a 2,993932), pero 100k consumio 2,653 GiB frente a 3,761 GiB de VRAM pico y 45,77 frente a 56,47 segundos de media. En un test externo congelado de 1.010 frases del UD Kazakh-KTB (tras eliminar solapamiento exacto con Leipzig), el vocabulario de 100k alcanzo 193,23 tokens por cada 1.000 caracteres y un 100 % de decodificacion exacta.

## Capacidades

- Tokenizacion sin perdida de texto UTF-8 arbitrario: kazaco, ruso, ingles, puntuacion y emojis, con decodificacion exacta garantizada (100 % en el test externo).
- Compresion de texto medida: 193,23 tokens por 1.000 caracteres en el conjunto de prueba UD Kazakh-KTB.
- Reproducibilidad verificada mediante hashes SHA-256 del corpus de entrenamiento y del tokenizador.
- Compatibilidad con la libreria `tokenizers` de Hugging Face para integracion en pipelines de tokenizacion estandar.
- Utilidad como base para entrenar nuevos modelos desde cero (tras validar compatibilidad de embeddings y arquitectura).
- Comparaciones de compresion entre tokenizadores sobre el mismo texto.

No es un modelo generativo: no genera texto, no razona, no programa, no soporta tool calling ni agentes, y no tiene capacidades de vision o audio.

## Casos de uso

- Investigacion en tokenizacion de lenguas de recursos limitados: sirve como punto de partida reproducible para estudiar como el tamano de vocabulario afecta a la eficiencia de tokenizacion en kazaco, gracias a los hashes y registros publicados.
- Entrenamiento de LLM pequenos centrados en kazaco: puede usarse como tokenizador inicial para entrenar un decoder desde cero, previa verificacion de compatibilidad con la capa de embeddings.
- Preprocesamiento de corpus kazacos: tokenizacion y detokenizacion sin perdida de textos mixtos (kazaco, ruso e ingles) en pipelines de NLP.
- Estudios de compresion de texto: comparacion de la eficiencia de compresion (tokens por caracter) entre distintos tokenizadores sobre el mismo corpus.
- Benchmarking de tokenizadores: el test externo UD Kazakh-KTB y la metodologia de eliminacion de solapamiento permiten evaluaciones comparativas rigurosas.
- Construccion de herramientas linguisticas: integracion en correctores, segmentadores o sistemas de traduccion automatica que necesiten un tokenizador consistente para kazaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de LLM (MMLU, HumanEval, GSM8K, etc.), ya que no se trata de un modelo generativo. Los datos publicados corresponden a metricas de tokenizacion:

| Metrica | Valor |
|---|---|
| BPC medio (proxy decoder, vocab 100k, 3 semillas) | 2,994455 |
| BPC medio (proxy decoder, vocab 150k, 3 semillas) | 2,993932 |
| Tokens por 1.000 caracteres (UD Kazakh-KTB, test externo) | 193,23 |
| Decodificacion exacta (UD Kazakh-KTB) | 100 % |
| Round-trip Unicode (suite de regresion) | 100 % |
| VRAM pico (entrenamiento vocab 100k) | 2,653 GiB |
| VRAM pico (entrenamiento vocab 150k) | 3,761 GiB |
| Tiempo medio (vocab 100k) | 45,77 s |
| Tiempo medio (vocab 150k) | 56,47 s |

## Requisitos de hardware

- No requiere GPU para inferencia: un tokenizador se ejecuta en CPU sin requisitos destacables de VRAM.
- El entrenamiento del tokenizador en el estudio original consumio 2,653 GiB de VRAM pico (vocabulario de 100k), un consumo asumible incluso por GPUs de consumo.
- Compatible con cualquier GPU moderna; no se especifican modelos concretos recomendados (no disponible).
- Ejecutable con la libreria `tokenizers` de Hugging Face en cualquier entorno con Python; no requiere vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | KazTok BPE 100k v5 | Tokenizadores multilingues genericos (p. ej. vocabularios BPE de LLMs grandes) | Tokenizadores especificos de otras lenguas de recursos limitados |
|---|---|---|---|
| Tipo | Tokenizador ByteLevel BPE | Tokenizador integrado en LLM preentrenado | Tokenizadores dedicados, disponibilidad variable |
| Tamano de vocabulario | 100.000 | Tipicamente 32k-256k | Variable |
| Orientacion | Kazaco, ruso, ingles | Multilingue, sin optimizacion especifica para kazaco | Dependiente del idioma |
| Datos de entrenamiento publicados | Si, con hash SHA-256 del corpus Leipzig kazaco | Rara vez publicados o verificables | Variable |
| Licencia | MIT | Variable, a menudo restrictiva | Variable |
| Disponibilidad en Hugging Face | Si | Si | Dispersa |

No se conocen otros tokenizadores kazacos abiertos con documentacion y verificacion comparables en la informacion disponible.

## Limitaciones y advertencias

- El corpus de entrenamiento procede principalmente de una sola familia de corpus (Leipzig) y no cubre todos los dominios ni dialectos del kazaco.
- La eficiencia de compresion no implica mejor calidad en tareas de QA, razonamiento, traduccion, seguridad o calidad linguistica general.
- Un tokenizador no puede sustituirse en un LLM ya entrenado sin reentrenar el modelo o aplicar un metodo validado de transferencia de embeddings.
- No es un modelo generativo: no debe usarse como chatbot ni para tareas de generacion.
- El propio autor aclara que la eleccion de 100k es un compromiso practico para su regimen computacional, no una superioridad universal demostrada estadisticamente.
- Licencia MIT: sin restricciones relevantes para uso comercial, aunque conviene citar el trabajo segun la referencia BibTeX proporcionada.
- Metricas como descargas (0) y likes (1) indican adopcion comunitaria practicamente nula; no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ftrproger/KazTok-BPE-100k-v5
- Paper, blog o repositorio externo: no disponible (no se han encontrado enlaces adicionales en la informacion proporcionada)
