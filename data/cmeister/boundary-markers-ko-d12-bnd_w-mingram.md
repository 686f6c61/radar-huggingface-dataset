# cmeister/boundary-markers-ko-d12-bnd_w-mingram

## Resumen

`cmeister/boundary-markers-ko-d12-bnd_w-mingram` es un artefacto de investigación en tokenización, no un modelo de propósito general. Contiene tres modelos de lenguaje en coreano (seeds 0, 1 y 2) entrenados con nanochat para comparar vocabularios de subpalabras que marcan explícitamente las fronteras de palabra, siguiendo el esquema del artículo *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister). Los tres modelos comparten arquitectura, datos y tokenizador; dentro del experimento solo cambia el brazo de tokenización respecto a la variante `plain`, de modo que las diferencias de pérdida son atribuibles al vocabulario.

La configuración es deliberadamente pequeña y controlada: 12 capas, ancho 768, 6 cabezas de atención, contexto de 2.048 tokens, 2.553 pasos de 524.288 tokens (1,34 mil millones de tokens) sobre tres fragmentos de Korean FineWeb-2. El tokenizador `bnd_w` inserta un marcador `<|>` a ambos lados de cada palabra con un vocabulario total de 34.686 entradas (34.685 del tokenizador más el token de inicio de secuencia). El resultado publicado es una única métrica: bits por byte de validación sobre un fragmento reservado de Korean FineWeb-2.

Su relevancia es metodológica más que de producto: sirve para replicar en coreano un resultado reportado en inglés, para auditar cómo afecta el marcado explícito de fronteras a la compresión de texto, y como ejemplo reproducible de entrenamiento con un solo GPU por modelo. No está destinado a inferencia en producción ni incluye ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementación nanochat, commit `92d63d4`); 12 capas, ancho 768, 6 cabezas de atención |
| Parametros totales | no disponible (el autor no publica el recuento; la configuración de 12 capas y ancho 768 sitúa el modelo en el orden de 10^8 parámetros, sin cifra confirmada) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible; no se distribuyen versiones cuantizadas |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | state dict de PyTorch (`seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)`); no hay safetensors ni GGUF |
| Tokenizador | `BoundaryMinGramModel` con marcador `<|>` a ambos lados de cada palabra; vocabulario 34.685 (+1 token BOS = 34.686); fichero `tokenizer/fineweb_ko_5gb_quick_bnd_w_mingram_v34685.json.gz` |
| Tamano del repositorio | 2,5 GB (incluye los tres seeds) |
| Metricas de rendimiento publicadas | bits por byte de validación (ver sección de benchmarks) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only estándar implementado con nanochat, sin mezcla de expertos ni componentes de estado recurrente. Cada modelo tiene 12 capas, dimensión de modelo 768 y 6 cabezas de atención sobre un contexto de 2.048 tokens. El entrenamiento se lanzó con `paper_utils/boundary/downstream/run_arms.sh` del repositorio `script_tok`: 2.553 pasos de 524.288 tokens cada uno, es decir, 1,34 mil millones de tokens procesados, con un GPU por modelo.

Los datos son tres fragmentos de Korean FineWeb-2, de la release `fineweb-2_0_1-quality_10-filterrobots`, que suman 1.220 millones de caracteres y se leyeron aproximadamente 3,1 veces. La semilla fija tanto la inicialización de pesos como el orden de los fragmentos, y ese orden es idéntico para todos los tokenizadores, de modo que modelos con la misma semilla son directamente comparables. Con solo tres fragmentos, las semillas 1 y 2 sortearon el mismo orden, así que la variabilidad entre semillas cubre dos órdenes de datos y no tres. La innovación técnica no está en el modelo sino en el tokenizador: el marcador de frontera se añade a ambos lados de cada palabra y el espacio único entre dos palabras marcadas se elimina al codificar y se restaura al decodificar a partir de los dos marcadores contiguos. El tokenizador se entrenó con MinGram sobre una muestra de 5 GB de Korean FineWeb. No se menciona RLHF, DPO ni ningún ajuste posterior al preentrenamiento.

## Capacidades

- Generación de texto en coreano: modelo base preentrenado, sin ajuste por instrucciones ni plantilla de diálogo.
- Modelado de lenguaje y estimación de verosimilitud: es su función principal, con la pérdida medida en bits por byte sobre texto coreano.
- Tokenización con fronteras explícitas: el tokenizador asociado segmenta palabras y conserva la información de espaciado mediante marcadores, un comportamiento reutilizable en otros proyectos.
- Comparación controlada de vocabularios: tres semillas con el mismo pipeline permiten aislar el efecto del tokenizador frente al brazo `plain`.
- Idiomas: únicamente coreano; no hay evidencia de capacidades multilingües.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles; el modelo no ha recibido entrenamiento de este tipo.
- Visión, audio y modo de razonamiento explícito (*thinking*): no disponibles.

## Casos de uso

- Replicación del artículo en coreano: entrenar el brazo `bnd_w` y el brazo `plain` con la misma semilla y comparar bits por byte, como hace el autor, para verificar si el efecto observado en inglés se mantiene en otro idioma.
- Estudios de ablación de tokenizadores: al diferir únicamente en el vocabulario, los tres seeds sirven como control experimental cuando se prueba una nueva estrategia de segmentación sobre el mismo corpus y el mismo presupuesto de tokens.
- Investigación sobre segmentación de palabras en coreano: el marcado explícito de fronteras permite analizar cómo afecta el tratamiento del espaciado entre *eojeol* a la compresión y a la pérdida del modelo.
- Evaluación de métricas de compresión: el uso de bits por byte (longitud UTF-8 real del texto puntuado) lo hace adecuado para comparar tokenizadores con vocabularios de distinto tamaño sin el sesgo de la perplejidad por token.
- Punto de partida para ajuste supervisado en tareas coreanas acotadas: con 1,34 mil millones de tokens vistos, es viable experimentar con clasificación o etiquetado sobre dominios pequeños, asumiendo un techo de calidad bajo.
- Análisis de eficiencia de vocabulario: el vocabulario de 34.686 entradas permite estudiar el compromiso entre cobertura, longitud de secuencia y coste de la matriz de embeddings en un modelo de este tamaño.
- Docencia y reproducibilidad: los logs completos de entrenamiento (`train.log`), la configuración (`meta_002553.json`) y los hashes (`archive.json`) permiten reproducir o auditar el experimento con recursos modestos.
- Verificación de integridad de artefactos: `archive.json` incluye el sha256 de cada fichero copiado de la ejecución, útil en flujos de trabajo que requieren trazabilidad.

## Benchmarks y rendimiento

La única métrica publicada es bits por byte de validación (suma de la pérdida sobre un fragmento reservado de Korean FineWeb-2 dividida por la longitud UTF-8 real del texto puntuado; menor es mejor). Los valores solo son comparables dentro del mismo idioma. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

| Seed | Este modelo (bits por byte) | Diferencia indicada en la model card |
|---|---|---|
| 0 | 0,85076 | -0,00375 |
| 1 | 0,85007 | -0,00115 |
| 2 | 0,85059 | -0,00332 |

Media de la diferencia: -0,00274. Desviación estándar entre semillas: 0,00139.

Advertencia sobre la interpretación: la model card etiqueta la columna como «plain minus this model» pero el texto que la acompaña afirma que «un valor positivo significa que este esquema puntuó más bajo que `plain`». Ambas afirmaciones son incompatibles entre sí, de modo que la dirección del efecto (si `bnd_w` mejora o empeora respecto a `plain`) no puede determinarse de forma inequívoca solo con esta ficha. El propio autor señala que tres semillas dan una dirección y no una estimación precisa, y remite a `script_tok` para la comparación completa entre esquemas, entrenadores e idiomas.

## Requisitos de hardware

- VRAM para inferencia: no publicada. Para un modelo del orden de 10^8 parámetros, los pesos en fp16 ocuparían unas décimas de GB, pero es una estimación derivada de la configuración, no un dato del autor.
- GPU recomendadas: no publicadas. El entrenamiento usó un GPU por modelo, sin especificar el modelo de GPU.
- GPU de consumo: por tamaño, cualquier GPU de consumo moderna con unos pocos GB de VRAM debería bastar, siempre que se pueda ejecutar el código de nanochat. No hay confirmación del autor ni pruebas publicadas.
- Opciones de despliegue: no hay soporte para vLLM, TGI, llama.cpp ni Ollama, porque los pesos son un state dict de PyTorch y el tokenizador es una clase propia (`BoundaryMinGramModel`) que requiere clonar `script_tok` y ejecutar desde su raíz.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos de terceros comparables. La comparación relevante es interna al experimento: las tres semillas de este repositorio frente al brazo `plain` del mismo estudio, que comparte arquitectura, datos, presupuesto de cómputo y pipeline de tokenización.

| Variante | Tokenizador | Seed | Bits por byte | Diferencia reportada frente a `plain` |
|---|---|---|---|---|
| Este modelo | `bnd_w` (MinGram con marcadores de frontera) | 0 | 0,85076 | -0,00375 |
| Este modelo | `bnd_w` | 1 | 0,85007 | -0,00115 |
| Este modelo | `bnd_w` | 2 | 0,85059 | -0,00332 |
| Brazo de control | `plain` | mismas semillas y orden de datos | no disponible en esta ficha | 0 (referencia) |

Respecto a alternativas externas, la información proporcionada no incluye ningún modelo de tamaño, idioma y licencia equiparables con el que establecer una comparación con datos verificables.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto de investigación para comparar tokenizadores, sin ajuste por instrucciones y sin garantías de calidad en generación libre.
- Presupuesto de entrenamiento muy reducido: 1,34 mil millones de tokens sobre un modelo del orden de 10^8 parámetros y un contexto de 2.048 tokens; el conocimiento del mundo y la coherencia a partir de unos cientos de tokens serán limitados.
- Riesgo alto de alucinación y de texto incoherente, especialmente fuera del dominio de FineWeb coreano.
- Monolingüe: solo coreano; no hay datos que respalden uso en castellano ni en otros idiomas.
- Ambigüedad en el signo de los resultados publicados, tal como se detalla en la sección de benchmarks; no debe citarse como evidencia de mejora sin consultar el repositorio `script_tok` y el artículo.
- Variabilidad estadística: solo tres semillas y dos órdenes de datos distintos, con una desviación estándar de 0,00139 en la diferencia, del mismo orden que el efecto medio de -0,00274.
- Licencia Apache 2.0: permite uso comercial y modificación, pero los datos de entrenamiento derivan de Korean FineWeb-2 y sus condiciones pueden imponer restricciones adicionales; conviene revisarlas antes de un uso comercial.
- Dependencia de código externo: cargar el tokenizador exige clonar `script_tok` y usar una clase concreta; sin ese paso los pesos no son utilizables de forma estándar.
- Sin cuantizaciones ni formatos de despliegue habituales, lo que dificulta integrarlo en infraestructura de producción existente.
- El repositorio data de septiembre de 2026 según la model card y no registra descargas ni interacciones en HuggingFace, por lo que no hay validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-bnd_w-mingram
- Artículo citado: *Explicit Boundary Markers for Subword Vocabularies*, Sander Land y Clara Meister: https://arxiv.org/abs/2608.08847
- Repositorio con los scripts de tokenización y del experimento: https://github.com/sanderland/script_tok
- Base de código de entrenamiento: https://github.com/karpathy/nanochat (commit `92d63d4`)
- Ficheros del repositorio: `seed<n>/model_002553.pt`, `seed<n>/meta_002553.json`, `seed<n>/train.log`, `seed<n>/archive.json`, `tokenizer/fineweb_ko_5gb_quick_bnd_w_mingram_v34685.json.gz` (sha256 `04a82eed82cc1facb19911642bd8cc1a7b7025cd4b586d17c595ffe8b5787c50`)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card.
