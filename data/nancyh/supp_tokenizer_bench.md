# nancyH/supp_tokenizer_bench

# supp_tokenizer_bench: benchmark de tokenizadores para secuencias genómicas

## Resumen

`nancyH/supp_tokenizer_bench` es un repositorio de Hugging Face que no contiene un modelo de IA con pesos entrenados, sino el paquete de código, datos y resultados que respalda la figura suplementaria 2 de una publicación sobre caracterización de tokenizadores de ADN. El repositorio compara cinco tokenizadores —DNABERT-2 BPE, Grover BPE, un BPE guiado por regiones cCRE, un BPE guiado por motivos y DNAMotifTokenizer— mediante dos análisis: la preservación de motivos (panel a) y la distancia de Jensen–Shannon entre la distribución de tokens de regiones funcionales y un fondo genómico aleatorio emparejado (panel b).

El problema que aborda es la falta de evaluación sistemática de cómo los tokenizadores de ADN fragmentan señales biológicas relevantes, como los motivos de unión a factores de transcripción. Un tokenizador que rompe un motivo en varios tokens dificulta que un modelo posterior aprenda esa señal; por eso el repositorio mide la tasa de coincidencia perfecta y el número medio de tokens por motivo, además del sesgo de distribución entre regiones funcionales (promotor de 2 kb, enhancer y exón) y secuencias aleatorias de hg38.

Es relevante para quienes diseñan o eligen tokenizadores para modelos genómicos, porque ofrece una metodología reproducible con datos y scripts concretos, semilla fija (42) y métricas cuantitativas. No es un modelo generativo: no tiene parámetros, contexto, cuantizaciones ni capacidades de razonamiento. El repositorio ocupa 1,0 GB, se creó el 18 de octubre de 2026 y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo de red neuronal; conjunto de tokenizadores BPE y un tokenizador basado en trie y lista de motivos |
| Parametros totales | no aplica (0 parámetros entrenados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; secuencias evaluadas: motivos de 5 a 12 pb y regiones genómicas (promotor de 2 kb, enhancer y exón) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica; alfabeto nucleotídico A/C/G/T sobre genoma humano hg38 |
| Licencia | no disponible |
| Formato de pesos | no aplica; se distribuyen ficheros JSON de tokenizadores, CSV de resultados, BED, FASTA y scripts Python |
| Tipo de artefacto | benchmark reproducible (código, datos y resultados) |
| Tamano del repositorio | 1,0 GB |
| Tokenizadores incluidos | DNABERT-2 BPE, Grover BPE, cCRE-guided BPE, motif-guided BPE, DNAMotifTokenizer |
| Datos de evaluación (panel a) | 904 motivos únicos; expansión de comodines (`*`, hasta 5) a variantes A/C/G/T; 3.737 secuencias de 5 a 12 pb |
| Datos de evaluación (panel b) | regiones promotor (2 kb), enhancer y exón; fondo aleatorio generado con `bedtools shuffle -seed 42` sobre el genoma no cubierto por las regiones |
| Métricas | tasa de coincidencia perfecta, tokens medios por motivo, distancia de Jensen–Shannon (base 2) frente al fondo aleatorio |
| Semilla | 42 (expansión de motivos y aleatorización del fondo) |
| Dependencias | Python, `tokenizers`, `bedtools`; genoma de referencia hg38 no incluido (~3 GB) |
| Fecha de creación / actualización | 2026-10-18 / 2026-10-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo. Incluye cinco tokenizadores que operan sobre texto nucleotídico: dos originales de terceros (DNABERT-2 y Grover, en formato JSON) y tres variantes BPE o guiadas por motivos (`cCRE_region_BPE_tokenizer.json`, `motif_region_BPE_tokenizer.json` y `DNAMotifTokenizer/`). DNAMotifTokenizer se implementa mediante un trie, una lista de motivos y un vocabulario propio, y se expone a través de una envoltura (`code/dna_motif_tokenizer.py`) que imita la interfaz de la librería `tokenizers`. La model card no detalla el corpus de entrenamiento, el tamaño de vocabulario ni el algoritmo exacto de las variantes BPE guiadas, por lo que esos datos deben considerarse no disponibles.

La parte experimental consiste en dos evaluaciones. En el panel a, cada una de las 3.737 variantes de motivo se tokeniza sin tokens especiales y se calculan dos métricas por tokenizador: porcentaje de variantes codificadas como exactamente un token (coincidencia perfecta) y número medio de tokens por variante (fragmentación). En el panel b, se tokenizan las FASTA de promotor, enhancer, exón y fondo aleatorio, se construyen las distribuciones de frecuencia de tokens y se calcula la distancia de Jensen–Shannon base 2 entre cada región funcional y el fondo. El fondo se genera barajando intervalos de exón sobre el genoma no cubierto por las tres regiones, igualando el número total de pares de bases. No hay RLHF, DPO ni ajuste por instrucciones; tampoco se describe una innovación de decodificación, atención o arquitectura de transformer.

## Capacidades

- Tokenización de secuencias de ADN con cinco esquemas distintos, incluyendo BPE clásico y tokenización guiada por motivos.
- Medición de preservación de motivos: identifica si una variante de motivo de 5 a 12 pb queda codificada como un único token.
- Cuantificación de fragmentación: calcula el número medio de tokens por motivo, lo que permite comparar tokenizadores por granularidad.
- Expansión controlada de motivos con comodines: genera todas las variantes A/C/G/T para hasta 5 posiciones comodín.
- Análisis de sesgo regional: compara distribuciones de tokens de promotor, enhancer y exón frente a un fondo aleatorio emparejado en pares de bases.
- Cálculo de distancia de Jensen–Shannon base 2 y generación de matrices y mapas de calor.
- Reproducibilidad: rutas, semillas y ficheros de resultados están documentados, con modo `--plot-only` para regenerar figuras sin repetir el análisis.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni uso como agente.

## Casos de uso

- Selección de tokenizador para un modelo genómico: un equipo que vaya a preentrenar un transformer de ADN puede ejecutar `motif_coverage_eval.py` sobre sus propios motivos de interés y comparar la tasa de coincidencia perfecta de los cinco tokenizadores antes de fijar el vocabulario.
- Auditoría de fragmentación de motivos: para un factor de transcripción concreto, se extraen sus motivos, se expanden los comodines y se mide cuántos quedan partidos en varios tokens; un valor alto de tokens medios por motivo indica pérdida de señal.
- Análisis de sesgo de vocabulario entre regiones funcionales: con `js_vs_random_heatmap.py` se comprueba si un tokenizador sobrerrepresenta tokens de promotor o enhancer frente al fondo, lo que puede introducir atajos espurios en el entrenamiento.
- Diseño y validación de un tokenizador guiado por motivos: el repositorio sirve como plantilla para construir un vocabulario a partir de una lista de motivos y evaluar su comportamiento con las mismas métricas del panel a.
- Reproducción de resultados publicados: investigadores que revisan la figura suplementaria 2 pueden regenerar las tablas y figuras con los CSV y scripts incluidos, usando la semilla 42 y el mismo fondo aleatorio.
- Docencia y formación en bioinformática: el material permite ilustrar de forma práctica qué es la tokenización BPE, cómo se mide la preservación de motivos y cómo se calcula una divergencia de Jensen–Shannon entre distribuciones genómicas.
- Comparación de vocabularios de modelos de ADN existentes: DNABERT-2 y Grover se incluyen como referencia, de modo que un grupo puede contrastar su tokenizador propietario contra estos dos sin reimplementarlos.
- Evaluación de robustez ante resolución de motivos: repetir el análisis con variantes truncadas o mutadas permite estudiar la sensibilidad del tokenizador a cambios de uno o dos nucleótidos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe las métricas y los ficheros donde se almacenan los resultados, pero no transcribe los valores. La tabla siguiente indica qué mide cada métrica y dónde se encuentra el resultado, sin inventar cifras.

| Métrica | Panel | Unidad | Valor en la información disponible |
|---|---|---|---|
| Tasa de coincidencia perfecta | a | % de variantes de motivo codificadas como un único token | no disponible; en `results/summary_by_tokenizer.csv` |
| Tokens medios por motivo | a | tokens por variante (menor es mejor) | no disponible; en `results/summary_by_tokenizer.csv` |
| Resultados por variante de motivo | a | métricas por cada una de las 3.737 variantes | no disponible; en `results/motif_variant_results.csv` |
| Consistencia por motivo | a | métricas agregadas por los 904 motivos | no disponible; en `results/consistency_by_motif.csv` |
| Distancia de Jensen–Shannon (base 2) | b | distancia entre distribución de tokens de la región y el fondo aleatorio | no disponible; matriz de 5 tokenizadores × 3 regiones en `results/js_vs_random_matrix.csv` |
| Recuento de tokens por región y tokenizador | b | número de tokens | no disponible; en `results/js_vs_random.log` |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna evaluación de modelos de lenguaje, porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no se requiere GPU; el artefacto no ejecuta inferencia de red neuronal. No disponible cualquier medida de VRAM.
- GPU recomendadas: ninguna. El cálculo es de CPU y consiste en tokenizar varios miles de secuencias cortas y agregar frecuencias.
- CPU y memoria: estimación razonable de 8 a 16 GB de RAM para cargar el genoma de referencia y procesar las FASTA; el repositorio pesa 1,0 GB y hg38 añade aproximadamente 3 GB. Esta cifra es una recomendación, no un dato publicado.
- Almacenamiento: alrededor de 4 a 5 GB si se descarga hg38 además del repositorio.
- Cabe en cualquier equipo de consumo: sí, sin GPU. No se han publicado medidas de latencia ni throughput; el orden de magnitud esperado es de segundos a pocos minutos para el panel a y de minutos para el panel b, pero no hay cifras verificadas.
- Opciones de despliegue: ejecución directa con Python y `bedtools`; no aplican vLLM, llama.cpp, Ollama ni TGI, al no existir pesos de modelo.
- El genoma hg38 no se incluye en el repositorio y debe obtenerse de UCSC, según indica la model card.

## Comparativa con modelos similares

No hay modelos comparables porque el artefacto no es un modelo. La comparación pertinente es entre los cinco tokenizadores incluidos, que es precisamente el objeto del benchmark. La información disponible no permite rellenar vocabulario, corpus de entrenamiento ni licencia de cada uno.

| Tokenizador | Método | Origen | Interfaz en el repositorio | Licencia | Vocabulario |
|---|---|---|---|---|---|
| DNABERT-2 BPE | BPE | tokenizador original de DNABERT-2, incluido para comparación | JSON de `tokenizers` | no disponible | no disponible |
| Grover BPE | BPE | tokenizador original de Grover, incluido para comparación | JSON de `tokenizers` | no disponible | no disponible |
| cCRE-guided BPE | BPE guiado por regiones cCRE | variante propia del trabajo | JSON de `tokenizers` | no disponible | no disponible |
| motif-guided BPE | BPE guiado por motivos | variante propia del trabajo | JSON de `tokenizers` | no disponible | no disponible |
| DNAMotifTokenizer | trie más lista de motivos | variante propia del trabajo | envoltura Python con interfaz tipo `tokenizers` | no disponible | no disponible |

Frente a alternativas como SentencePiece o un tokenizador de caracteres, la diferencia relevante es que aquí se evalúa la preservación de unidades biológicas con motivos reales y un fondo genómico emparejado, no solo la compresión de texto. No se dispone de datos para comparar con otros benchmarks de tokenizadores de ADN.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no responde a instrucciones y no debe presentarse como un LLM en catálogos o comparativas.
- La licencia no está declarada. No puede asumirse uso comercial, redistribución ni modificación sin contacto previo con el autor; los tokenizadores de DNABERT-2 y Grover pueden tener licencias propias no incluidas en la información.
- La model card es una descripción de material suplementario, no una ficha de modelo mantenida; no hay pipeline, idiomas ni metadatos de entrenamiento declarados.
- Los scripts se subieron tal como se ejecutaron y resuelven rutas relativas a la estructura original del proyecto (`DEFAULT_TOKENIZER_PATHS`, `ROOT`, `REGION_BEDS`); hay que reajustarlas a `tokenizers/` y `data/` antes de ejecutarlos, como advierte la propia model card.
- El genoma hg38 no está incluido; sin él no puede reproducirse el panel b desde cero, solo redibujarse desde la matriz de resultados con `--plot-only`.
- El panel a se limita a motivos de 5 a 12 pb con hasta 5 comodines; no cubre motivos más largos, estructuras secundarias ni variantes estructurales.
- El fondo aleatorio depende de `bedtools shuffle` y de la semilla 42; otros fondos o semillas pueden alterar las distancias de Jensen–Shannon y deben documentarse si se comparan resultados.
- El análisis se restringe a hg38 y a tres tipos de región (promotor, enhancer, exón); no hay evaluación en otros genomas, regiones repetitivas o secuencias no humanas.
- Riesgo de sobreinterpretación: una tasa alta de coincidencia perfecta no garantiza mejor rendimiento en una tarea biológica posterior; el benchmark mide propiedades del tokenizador, no calidad predictiva.
- Con 0 descargas y 0 likes, no hay evidencia de uso, revisión por terceros ni mantenimiento; conviene validar los resultados antes de depender de ellos en producción.
- No apto para uso clínico o diagnóstico sin validación independiente y sin una licencia clara.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nancyH/supp_tokenizer_bench
- Repositorio relacionado del mismo autor: https://huggingface.co/nancyH/tokenizer_files
- No se han encontrado en la búsqueda web paper, blog, repositorio de código adicional ni demostración asociados a este artefacto.
