# larc-iu/dmrst-xlm-roberta-base-gcdt

## Resumen

`larc-iu/dmrst-xlm-roberta-base-gcdt` es un parser de discurso RST (Rhetorical Structure Theory) a nivel de documento para chino mandarín, entrenado con la librería Dipo y construido sobre el encoder `xlm-roberta-base`. Lo desarrolla el grupo LARC (Linguistics and Reasoning with Computational Linguistics) de la Universidad de Georgetown, y resuelve la tarea de segmentación en unidades de discurso elementales (EDU) y construcción del árbol retórico con etiquetado de relaciones, una pieza clave para análisis del discurso, resumen y evaluación de coherencia textual.

El modelo implementa la arquitectura DMRST (Document-level Multilingual RST), un framework conjunto que realiza segmentación y parsing de forma end-to-end sobre texto en bruto. Se ha entrenado específicamente sobre el corpus GCDT (Georgetown Chinese Discourse Treebank), un treebank multigénero de chino mandarín con el inventario de relaciones GUM de 32 etiquetas. El checkpoint está pensado para investigación y análisis lingüístico, no como modelo generativo.

Es relevante porque ofrece una implementación práctica y reproducible de parsing discursivo en chino con métricas publicadas y una herramienta de línea de comandos (`dipo`) que permite analizar texto sin preprocesado, algo poco común en este nicho. Su tamaño (base, ~278M parámetros) y su licencia MIT heredada de XLM-R lo hacen accesible para experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de parsing DMRST (segmentación + árbol + relaciones) |
| Parámetros totales | ~278M (heredados de `xlm-roberta-base`; no se especifica el recuento exacto del checkpoint) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder XLM-R base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos en precisión completa; el repo pesa 1,7 GB) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT (heredada de `xlm-roberta-base`); corpus GCDT bajo Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (repo de 1,7 GB, librería `dipo`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DMRST: un encoder transformer (`xlm-roberta-base`) que produce representaciones contextuales, sobre las que se aplican cabezas para (1) segmentación en EDUs, (2) predicción de la estructura de árbol y (3) clasificación de la relación retórica entre constituyentes. El entrenamiento es conjunto (joint) para segmentación y parsing, de modo que el modelo puede procesar texto en bruto sin segmentación previa.

Se entrenó exclusivamente sobre el split de entrenamiento de GCDT, con selección de checkpoint sobre dev. El texto de entrada se reconstruyó sin espacios entre caracteres chinos a partir de las anotaciones `SpaceAfter` de DISRPT 2025, para que coincida con la entrada real en producción. El inventario de relaciones es de 32 etiquetas GUM (por ejemplo `causal-cause`, `elaboration-additional`, `joint-list`, `attribution-positive`), con distinción entre relaciones núcleo-satélite (rst) y multinucleares (multinuc). No se documenta en la información disponible el uso de RLHF, DPO ni un recuento explícito de tokens de entrenamiento.

Una particularidad de implementación: como el modelo colapsa todos los espacios en blanco, no ve saltos de línea; la función `predict_from_text` inicia un nuevo segmento en cada salto de párrafo (doble línea en blanco) y tras líneas cortas tipo encabezado, comportamiento que puede desactivarse con `break_at_paragraphs=False`.

## Capacidades

- Segmentación de discurso en EDUs sobre texto chino en bruto, sin tokenización ni limpieza previa.
- Construcción de árboles retóricos RST a nivel de documento con 32 relaciones GUM.
- Clasificación de relaciones núcleo-satélite y multinucleares.
- Predicción end-to-end desde texto en bruto (segmentación incluida) o desde segmentación gold (modo Gold-EDU).
- Procesamiento por lotes de archivos `.txt` y directorios mediante CLI (`dipo dmrst predict`).
- Salida en formato RS4 (`to_rs4_string()`) para integración en pipelines de análisis.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo discriminativo de análisis.

## Casos de uso

- Análisis del discurso en corpus chinos: procesar artículos o informes en mandarín y obtener árboles RST para estudiar estructura argumentativa y coherencia, aprovechando el entrenamiento multigénero de GCDT.
- Evaluación de resúmenes automáticos: comparar la estructura retórica del resumen frente al documento fuente mediante las relaciones predichas, como métrica complementaria a ROUGE.
- Extracción de relaciones causales y de evidencia: usar las etiquetas `causal-cause`, `causal-result` y `explanation-evidence` para minería de argumentos en textos periodísticos o académicos.
- Preprocesado para sistemas de QA y recuperación: segmentar documentos largos en EDUs y jerarquías para seleccionar pasajes coherentes antes de pasarlos a un LLM.
- Investigación lingüística comparada: analizar diferencias de estructura discursiva entre géneros (noticias, ensayos, textos organizativos) dentro del inventario GUM.
- Análisis de accesibilidad y legibilidad: detectar estructuras discursivas complejas (anidamiento profundo, exceso de `elaboration`) en documentación técnica o administrativa en chino.
- Docencia y anotación asistida: generar árboles preliminares que anotadores humanos corrijan, reduciendo el coste de crear nuevos treebanks RST.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 × 100, Parseval original, spans hoja triviales excluidos). E2E = parseo desde texto en bruto con segmentación incluida; Gold-EDU = con segmentación gold.

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 85,4 | 60,2 | 42,7 | 33,9 | 33,8 | 73,4 | 56,2 | 47,1 | 47,0 |
| test | 86,4 | 58,8 | 38,2 | 29,6 | 29,4 | 71,0 | 51,9 | 42,1 | 41,9 |

Notas: la métrica Seg es el F1 BeginSeg por token calculado durante el entrenamiento, que puede quedar hasta un punto por debajo del scorer oficial de DISRPT. El checkpoint se seleccionó por `e2e_full_f1` en dev. Los resultados provienen de una única ejecución de entrenamiento y la variación entre ejecuciones en test puede ser de varios puntos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 para los ~278M parámetros del encoder, más memoria de activaciones; con batch pequeño cabe holgadamente en 4-6 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con al menos 6 GB de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: librería `dipo` (CLI y API Python `DMRSTParser`); al ser un encoder tipo RoBERTa, los pesos pueden cargarse con PyTorch/Transformers, aunque la lógica de parsing requiere `dipo`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera procesamiento en decenas de milisegundos por documento corto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `larc-iu/dmrst-xlm-roberta-base-gcdt` | ~278M | no disponible (encoder XLM-R base) | zh | MIT | Hugging Face, librería `dipo` |
| DMRST original (Liu et al., 2021) | no disponible | no disponible | multilingüe | según repo original | Código en GitHub, pesos no verificados |
| Parsers RST basados en XLM-R (p. ej. variantes DISRPT) | ~278M | similar | varios | variable | Hugging Face / DISRPT |

No se dispone de datos de rendimiento comparables de terceros en la información proporcionada; la comparación se limita a parámetros, licencia e idioma.

## Limitaciones y advertencias

- Solo chino: no se ha entrenado ni evaluado en otros idiomas pese a usar un encoder multilingüe.
- Riesgo de error en la estructura: el F1 E2E Full en test es 29,4, lo que implica que una fracción importante de árboles completos no coincide exactamente con el gold; útil para análisis, arriesgado como verdad absoluta.
- Variabilidad entre ejecuciones: los autores advierten de varios puntos de diferencia en test entre runs; los números de la card corresponden a un único entrenamiento.
- No ve saltos de línea: el modelo colapsa espacios; la heurística de párrafos y encabezados de `predict_from_text` puede introducir segmentaciones erróneas en textos con formato peculiar.
- Dominio limitado al corpus GCDT: el rendimiento puede degradarse en géneros o registros ausentes del treebank (por ejemplo, chino coloquial o redes sociales).
- Licencia: los pesos heredan los términos de `xlm-roberta-base` (MIT) y el corpus GCDT es Apache 2.0; el uso comercial es posible según esos términos, pero conviene revisar las condiciones del corpus y citar los papers correspondientes.
- Uso previsto: investigación y análisis de texto; no está diseñado para generación ni para toma de decisiones automatizadas de alto riesgo.
- Sesgos: no documentados en la información disponible; al entrenarse en un treebank académico, puede reflejar los sesgos de género y registro de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/dmrst-xlm-roberta-base-gcdt
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper DMRST (CODI 2021): https://aclanthology.org/2021.codi-main.15/
- Paper de Dipo (Gessler & Zeldes, 2026): https://arxiv.org/abs/2610.17658
- Corpus GCDT: https://github.com/logan-siyao-peng/GCDT
- Modelo base XLM-RoBERTa: https://huggingface.co/xlm-roberta-base
