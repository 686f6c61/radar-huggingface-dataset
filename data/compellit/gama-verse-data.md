# compellit/gama-verse-data

## Resumen

`compellit/gama-verse-data` no es un modelo de lenguaje generativo, sino un paquete de datos auxiliares para GAMA (Galician Metrical Analyzer), una herramienta de análisis métrico automático de poesía gallega del siglo XIX. El repositorio agrupa tres ficheros: un modelo de lenguaje KenLM entrenado sobre el corpus Nós, un vocabulario gallego derivado de Linguakit y Apertium, y un vocabulario castellano expandido a partir del diccionario aspell. Su función es permitir una normalización ortográfica ligera que preserve el número de sílabas y la posición del acento, de modo que el escaneo métrico posterior no se vea alterado.

El proyecto lo mantiene el usuario `compellit` y se publica bajo una licencia mixta que combina CC BY 4.0, GPLv3 y GPL-2.0-or-later según el fichero. El tamaño total del repositorio es de aproximadamente 0,9 GB, dominado por el modelo KenLM de 736 MB. Los idiomas cubiertos son gallego (`gl`) y castellano (`es`).

Es relevante para investigadores en humanidades digitales y PLN histórico que necesiten escanear métricamente corpus poéticos gallegos decimonónicos, un dominio con recursos escasos y ortografía no estandarizada. No debe confundirse con un modelo neuronal: la inferencia se realiza con KenLM y búsquedas sobre conjuntos de formas léxicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje estadístico KenLM (n-gramas) más vocabularios como conjuntos Python (pickle) |
| Parametros totales | no disponible (no es un modelo neuronal; el tamaño del KenLM es de 736 MB en disco) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (el KenLM se distribuye en formato binario `.klm.bin`) |
| Idiomas soportados | gallego (`gl`), castellano (`es`) |
| Licencia | mixta: CC BY 4.0 (KenLM), GPLv3 (vocabulario gallego), GPL-2.0-or-later (vocabulario castellano) |
| Formato de pesos | KenLM binario (`.klm.bin`) y pickles de Python (`.pkl`) |

## Arquitectura y entrenamiento

El componente principal es un modelo de lenguaje KenLM entrenado sobre el corpus Nós (`proxectonos/corpora`), un corpus masivo de gallego descrito por de-Dios-Flores et al. (2024). KenLM es una implementación eficiente de modelos de n-gramas con interpolación y poda, adecuada para puntuar secuencias de palabras con bajo coste computacional. No se especifican en la información disponible el orden del n-grama, el número de tokens de entrenamiento ni los detalles de poda.

Los otros dos ficheros son vocabularios almacenados como conjuntos de formas: `gl-vocab.pkl` (121 MB) se construye a partir de Linguakit y Apertium, y `aspell-es-expanded.txt.pkl` (13 MB) expande las formas del diccionario castellano de aspell (COES). La innovación técnica no reside en el entrenamiento, sino en el uso conjunto de estos recursos para aplicar ediciones ortográficas mínimas que preserven la estructura silábica y la posición del acento, en lugar de normalizar completamente a la norma gallega actual.

## Capacidades

- Normalización ortográfica ligera de texto poético gallego del siglo XIX, preservando el número de sílabas.
- Aproximación de la posición del acento ortográfico a la norma contemporánea.
- Desambiguación de casos de acentuación que afectan al escaneo métrico.
- Puntuación de secuencias de palabras en gallego mediante el modelo KenLM.
- Consulta de pertenencia léxica en gallego y castellano a través de los vocabularios incluidos.
- Integración con la herramienta GAMA mediante el comando `gama-verse-download`.
- No soporta generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Escaneo métrico de corpus poéticos gallegos del siglo XIX: el KenLM y los vocabularios permiten normalizar variantes ortográficas antes de contar sílabas, lo que reduce errores en la segmentación métrica de poemas con grafías arcaicas.
- Investigación en humanidades digitales sobre métrica gallega: los ficheros sirven para reproducir los resultados del artículo de Ruiz Fabo, Moreau y Alonso Pérez (2026) sobre escaneo automático.
- Construcción de pipelines de análisis textual histórico: el vocabulario gallego derivado de Linguakit y Apertium puede reutilizarse para tareas de tokenización y validación léxica en corpus diacrónicos.
- Normalización previa a la anotación morfosintáctica: al preservar el número de sílabas, el texto normalizado puede alimentar anotadores sin alterar la estructura métrica original.
- Verificación ortográfica de ediciones digitales de poesía gallega: los conjuntos de formas permiten detectar variantes no estándar y proponer ediciones ligeras.
- Procesamiento de textos bilingües gallego-castellano: el vocabulario castellano expandido permite gestionar préstamos y code-switching en corpus poéticos.
- Docencia y experimentación con KenLM en lenguas de recursos limitados: el modelo sirve como ejemplo práctico de puntuación de secuencias en gallego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 0,9 GB en disco; el KenLM de 736 MB puede cargarse en memoria RAM sin GPU.
- No requiere VRAM: la inferencia se realiza en CPU con KenLM y operaciones sobre conjuntos de Python.
- Cabe en cualquier equipo de consumo con al menos 2 GB de RAM libre para cargar el modelo y los vocabularios.
- Despliegue mediante la librería Python `kenlm` y el comando `gama-verse-download` del proyecto GAMA.
- No aplica a vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal.
- Latencia y throughput no disponibles en la información proporcionada; en KenLM suelen ser del orden de microsegundos por consulta en CPU, pero no se confirma en la documentación.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Tamaño | Uso |
|---|---|---|---|---|---|
| `compellit/gama-verse-data` | KenLM + vocabularios | gl, es | mixta (CC BY 4.0 / GPLv3 / GPL-2.0-or-later) | 0,9 GB | Normalización y escaneo métrico |
| `proxectonos/corpora` (CorpusNÓS) | Corpus textual | gl | no disponible | no disponible | Entrenamiento de modelos de gallego |
| Linguakit | Suite de PLN | gl, es, pt | no disponible | no disponible | Análisis morfosintáctico |
| Apertium (`apertium-glg`) | Traducción y léxico | gl | GPL | no disponible | Léxico y traducción automática |

No se dispone de comparativas de rendimiento con alternativas equivalentes para escaneo métrico gallego en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- La normalización es ligera y deliberadamente incompleta; no convierte el texto a la norma gallega actual.
- El KenLM está entrenado únicamente sobre el corpus Nós, por lo que su cobertura puede ser limitada para registros distintos del gallego contemporáneo y literario.
- El vocabulario castellano proviene de aspell y puede no reflejar variantes diatópicas o históricas.
- Licencia mixta: el uso comercial requiere revisar cada fichero por separado (CC BY 4.0 permite uso comercial con atribución; GPLv3 y GPL-2.0-or-later imponen obligaciones de copyleft).
- Riesgo de errores en la desambiguación de acentos en casos ambiguos no cubiertos por el vocabulario.
- No se documentan sesgos específicos, pero el corpus Nós puede sobrerrepresentar ciertos géneros y épocas.
- El repositorio no incluye pipeline declarado en Hugging Face ni demos interactivas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/compellit/gama-verse-data
- Proyecto GAMA: https://github.com/compellit/gama
- Corpus Nós: https://github.com/proxectonos/corpora
- Linguakit: https://github.com/citiususc/Linguakit
- Apertium gallego: https://github.com/apertium/apertium-glg
- Diccionario aspell castellano (COES): https://www.datsi.fi.upm.es/~coes/
- Artículo de referencia (Ruiz Fabo, Moreau, Alonso Pérez, 2026): no disponible enlace directo en la información proporcionada
- Artículo CorpusNÓS (de-Dios-Flores et al., 2024): no disponible enlace directo en la información proporcionada
