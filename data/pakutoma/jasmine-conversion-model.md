# pakutoma/jasmine-conversion-model

## Resumen

Jasmine Conversion Model es un conjunto de artefactos estadísticos para el reranking de conversión kana-kanji (KKC) del IME japonés Jasmine, una aplicación de teclado para Android desarrollada por pakutoma. No es un modelo neuronal generativo: combina cuatro tablas de estadísticas comprimidas (N-gramas de palabra, N-gramas de carácter, N-gramas de palabra de contenido y Word2Vec con compresión simétrica en un solo vector) con un modelo LightGBM con objetivo LambdaRank que reordena las candidaturas de la retícula de Mozc de izquierda a derecha.

El modelo se publica en tres franjas de capacidad (1 GB, 5 GB y 10 GB) para adaptarse a distintos presupuestos de almacenamiento en dispositivo. Las tablas se construyen a partir del subconjunto japonés de FineWeb-2 y se consultan mediante mmap, de modo que la inferencia no requiere ejecutar un LLM ni acelerador hardware: solo conteos y un GBDT.

Su relevancia radica en que ofrece una alternativa ligera y determinista a los rerankers neuronales tipo zenz para la misma tarea, con resultados competitivos en los conjuntos de evaluación publicados y con un coste de despliegue muy inferior en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reranker estadístico: 4 tablas de conteo (N-gramas de palabra, N-gramas de carácter, N-gramas de palabra de contenido, Word2Vec comprimido) + LightGBM con LambdaRank |
| Parametros totales | No disponible (modelo GBDT; el tamaño se expresa en columnas de features: 114, 101 y 95 según variante) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre la retícula de candidatos de Mozc, no sobre una ventana de tokens) |
| Tipos de cuantizacion | Conteos en `log11` (cuantización logarítmica de 11 bits para N-gramas ≥ 2); Word2Vec en `nf4` (1 GB y 5 GB) o `int8` (10 GB) |
| Idiomas soportados | Japonés (`ja`) |
| Licencia | ODC-By 1.0 |
| Formato de pesos | Tablas binarias propietarias (29 ficheros por variante), `model.txt` (LightGBM) y `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo de lenguaje: es un pipeline de reranking en dos etapas sobre la salida del motor de conversión Mozc. Para cada candidatura de la retícula se extraen features a partir de cuatro familias de tablas estadísticas construidas sobre el corpus japonés de FineWeb-2: N-gramas de palabra (2 y 3-gramas), N-gramas de carácter (1 a 4-gramas con `char_bits=16`), N-gramas de palabra de contenido (1 a 3-gramas) y un Word2Vec comprimido. Los conteos de 2-gramas en adelante se cuantizan en 11 bits con modo `log11`, mientras que los unigramas (`uni.npy`, `df.npy`, `cwn1.npy`, `c1.cnt`) se almacenan sin cuantizar.

La innovación técnica destacable es la compresión simétrica del Word2Vec: a partir de las matrices aprendidas `W_in` y `W_out` se calcula la matriz simetrizada ½(UVᵀ + VUᵀ), se descompone en rango bajo exacto y se almacena un único vector `vec_in` más un vector de signos `vec_sym.sign` en float32; en inferencia se reconstruye `vec_out = vec_in ⊙ vec_sym.sign` al vuelo. La tabla de PMI (`pair`) y `vec_out.*` se han eliminado (`pair=0`). El reranker LightGBM se entrena con LambdaRank para ordenar las candidaturas de izquierda a derecha; cada variante usa un conjunto de features distinto (114, 101 y 95 columnas) y un modelo adoptado diferente (`P5_FINAL-1GB-c_opt_k114_tuned_s1`, `P5_FINAL-5GB-c_opt_k101_default_s3`, `P5_FINAL-10GB-c_opt_k95_tuned_s3`). No se documenta en la información disponible el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Conversión kana-kanji (KKC) para japonés: reranking de las candidaturas generadas por la retícula de Mozc.
- Desambiguación de homófonos japoneses, evaluada específicamente en el conjunto `fwajimee_homophones`.
- Modelado de contexto local mediante N-gramas de palabra, de carácter y de palabra de contenido.
- Similitud semántica entre palabras mediante el embedding Word2Vec comprimido.
- Funcionamiento completamente offline en dispositivo, sin LLM en tiempo de inferencia.
- Tres perfiles de capacidad (1 GB, 5 GB, 10 GB) intercambiables según el presupuesto de almacenamiento.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Teclado japonés en Android: integración directa en Jasmine como reranker de la conversión kana-kanji, sustituyendo o complementando el reranker por defecto con las tablas y el `model.txt` de la variante elegida.
- Dispositivos con almacenamiento limitado: la variante de 1 GB (0,988 GB) permite incorporar un reranker estadístico sin renunciar a espacio para otras aplicaciones, manteniendo un rendimiento en `bench1000` de 424 aciertos frente a los 396 de `zenz-v3.2-small`.
- Desambiguación de homófonos en texto japonés: el uso de N-gramas de palabra de contenido y del embedding Word2Vec ayuda a resolver casos como palabras con la misma lectura y distinta grafía, con 745 aciertos en `fwajimee_homophones` para la variante de 1 GB.
- Entrada de texto en entornos sin conectividad ni GPU: al no requerir LLM ni acelerador, el modelo funciona en el propio terminal mediante tablas mmap y un GBDT.
- Evaluación y benchmarking de motores KKC: los conjuntos `ajimee`, `bench1000` y `fwajimee_homophones` y el `eval_summary.json` permiten comparar variantes y motores alternativos con una metodología reproducible.
- Investigación sobre reranking ligero: la arquitectura de tablas comprimidas con cuantización `log11` y Word2Vec simétrico sirve como referencia para construir sistemas de ranking de bajo coste en otras lenguas.
- Despliegue en pipelines de verificación: los checksums `SHA256SUMS.txt` y la coincidencia del 99,88–99,91 % entre la implementación Android/Kotlin y la de referencia en Go facilitan la validación de integraciones.

## Benchmarks y rendimiento

Resultados de coincidencia exacta sobre 2.200 preguntas (Jasmine con `Linf, tau=0`, media de 3 semillas; zenz con `llama-server` en V100, decodificación greedy, `MAX_TOKENS=128`):

| Modelo (tamaño) | Total (2.200) | `ajimee` (200) | `bench1000` (1.000) | `fwajimee_homophones` (1.000) |
|---|---:|---:|---:|---:|
| Mozc sin reranker (baseline) | 394 (17,91 %) | 112 (56,00 %) | 210 (21,00 %) | 72 (7,20 %) |
| `zenz-v3.2-xsmall Q5_K_M` (20,0 MB) | 1.046 (47,55 %) | 141 (70,50 %) | 299 (29,90 %) | 606 (60,60 %) |
| `zenz-v3.2-small Q5_K_M` (70,4 MB) | 1.297 (58,95 %) | 170 (85,00 %) | 396 (39,60 %) | 731 (73,10 %) |
| Jasmine 1GB (0,988 GB) | 1.333 (1.323,67) | 164 (163,67) | 424 (420,33) | 745 (739,67) |
| Jasmine 5GB (4,952 GB) | 1.368 (1.356,67) | 176 (174,00) | 431 (430,33) | 761 (752,33) |
| Jasmine 10GB (9,891 GB) | 1.391 (1.382,00) | 173 (172,67) | 448 (440,33) | 770 (769,00) |

Con el conjunto adicional `natrand` (1.000 preguntas), el total sobre 3.200 asciende a 2.191 (1 GB), 2.234 (5 GB) y 2.258 (10 GB); la verificación con el paquete binario real de Android/Kotlin da 2.190, 2.233 y 2.258, con una coincidencia del 99,88–99,91 % respecto a la implementación de referencia en Go.

## Requisitos de hardware

- VRAM: no aplica; el modelo no requiere GPU para inferencia.
- Almacenamiento: 0,988 GB (1 GB), 4,952 GB (5 GB) y 9,891 GB (10 GB) para tablas más `model.txt`.
- Memoria: las tablas se consultan mediante mmap, por lo que la memoria residente puede ser inferior al tamaño total de los ficheros.
- GPU recomendadas: ninguna; el baseline zenz de la comparativa se ejecutó en V100 con `llama-server`, pero Jasmine no lo necesita.
- Cabe en cualquier dispositivo Android con almacenamiento suficiente; no requiere GPU de consumo.
- Despliegue: integración en la aplicación Jasmine mediante `tools/kkc_b_push.sh`; descarga selectiva por variante con `snapshot_download` y `allow_patterns='1GB/*'` (o `5GB/*`, `10GB/*`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Resultado total (2.200) | Licencia |
|---|---|---|---:|---:|---|
| Jasmine Conversion Model 1GB | Reranker estadístico + GBDT | 0,988 GB | No aplica | 1.333 | ODC-By 1.0 |
| Jasmine Conversion Model 5GB | Reranker estadístico + GBDT | 4,952 GB | No aplica | 1.368 | ODC-By 1.0 |
| Jasmine Conversion Model 10GB | Reranker estadístico + GBDT | 9,891 GB | No aplica | 1.391 | ODC-By 1.0 |
| `zenz-v3.2-xsmall Q5_K_M` | LLM generativo para KKC | 20,0 MB | No disponible | 1.046 | No disponible |
| `zenz-v3.2-small Q5_K_M` | LLM generativo para KKC | 70,4 MB | No disponible | 1.297 | No disponible |
| Mozc (sin reranker) | Motor de conversión | No aplica | No aplica | 394 | BSD 3-Clause |

La comparación debe matizarse: zenz obtiene mejores resultados en `ajimee` (170 y 176 frente a 164 de Jasmine 1GB), mientras que Jasmine supera claramente a zenz en `bench1000` y `fwajimee_homophones`, a costa de un tamaño entre 14 y 500 veces mayor según la variante.

## Limitaciones y advertencias

- Específico para japonés: no soporta otros idiomas ni tareas de generación de texto libre.
- Depende de la retícula de candidatos de Mozc; no genera candidaturas por sí mismo.
- Los sesgos heredados del corpus FineWeb-2 (subconjunto japonés) pueden reflejarse en las estadísticas y en el embedding.
- La licencia ODC-By 1.0 exige atribución; conviene revisar las obligaciones de atribución al redistribuir las tablas derivadas.
- El uso comercial está permitido por la licencia, pero debe verificarse la compatibilidad con las licencias de las dependencias (SudachiDict Apache 2.0, Mozc BSD 3-Clause).
- Las variantes de mayor tamaño no siempre mejoran de forma monótona en todos los conjuntos: en `ajimee`, la variante de 10 GB (173) queda por debajo de la de 5 GB (176).
- No se documentan latencias, consumo de memoria en dispositivo ni comportamiento con entradas fuera de dominio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pakutoma/jasmine-conversion-model
- Repositorio Jasmine: https://github.com/pakutoma/jasmine
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- Mozc: https://github.com/google/mozc
