# ametrick-system/hapadapter-as-polr2aphosphos5

## Resumen

hapadapter-as-polr2aphosphos5 es una coleccion de cabezas adaptadoras (adapter heads) para predecir desequilibrio alelico (allele-specific binding) en la senal de POLR2AphosphoS5 sobre genomas personales diploides. Lo desarrolla el usuario ametrick-system y se publica bajo licencia MIT. El modelo se construye sobre un encoder DNABERT-2 (117M parametros) afinado para regresar la senal de POLR2AphosphoS5 a partir de secuencia de referencia, y anade una cabeza siamesa que compara los embeddings de dos ventanas haplotipicas.

La relevancia es de nicho pero concreta: permite, dado un SNV heterocigoto, estimar si los dos haplotipos muestran imbalance en la senal de union de POLR2AphosphoS5. El repositorio incluye cuatro donantes (ENC-001 a ENC-004) y, para cada uno, dos variantes: un tronco (`dnabert2-trunk`) que funciona como predictor de union por si solo y una cabeza personal (`dnabert2-personal`) entrenada sobre ventanas del genoma faseado de ese donante.

No es un modelo de lenguaje generativo ni un `AutoModel` de `transformers`: requiere el paquete `hapadapter` para cargarse y consume pares de ventanas de 257 pb. El repositorio ocupa 1,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DNABERT-2 (transformer tipo BERT) + cabeza siamesa adaptadora |
| Parametros totales | no disponible (el backbone DNABERT-2 de referencia tiene 117M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana de entrada (dos ventanas, una por haplotipo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencia genomica, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DNABERT-2-117M (`zhihan1996/DNABERT-2-117M`), un encoder transformer entrenado sobre secuencia genomica. Sobre ese backbone se afina un tronco (`dnabert2-trunk`) que regresa la senal de POLR2AphosphoS5 a partir de secuencia de referencia. Encima se entrena una cabeza siamesa (`dnabert2-personal`) que recibe dos ventanas de 257 pb centradas en el SNV, una por haplotipo, y calcula una puntuacion de desequilibrio.

La readout concreta es `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyeccion del embedding agrupado de cada ventana haplotipica (`h_1`, `h_2`). Al usar una distancia simetrica, la puntuacion mide magnitud de desequilibrio pero no indica que haplotipo une mas. El modelo agrupa embeddings de tokens alrededor de la variante en lugar de usar el pooler de BERT, y descarta la cabeza de masked language modeling del checkpoint original. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Prediccion de desequilibrio alelico (allele-specific binding) para POLR2AphosphoS5 en SNVs heterocigotos.
- Prediccion de union (binding) a partir de secuencia de referencia mediante el tronco `dnabert2-trunk`, utilizable de forma independiente.
- Procesamiento de pares de ventanas haplotipicas de 257 pb centradas en la variante.
- Modelado especifico por donante mediante cabezas personalizadas sobre genoma faseado.
- Generalizacion reportada por el autor a otros donantes EN-TEx distintos del donante de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Priorizacion de variantes no codificantes: dado un conjunto de SNVs heterocigotos, estimar cuales muestran mayor probabilidad de desequilibrio en POLR2AphosphoS5 para seleccionar candidatos antes de validacion experimental.
- Analisis de efectos regulatorios alelicos: comparar la puntuacion de desequilibrio entre variantes de un mismo locus para identificar senales de regulacion dependiente de haplotipo.
- Filtrado en estudios de asociacion: usar la magnitud de desequilibrio como caracteristica adicional en pipelines de anotacion funcional de variantes.
- Investigacion en epigenomica comparativa: emplear los troncos por donante como predictores de union de referencia para contrastar con senales medidas en EN-TEx.
- Generacion de hipotesis en biologia de la transcripcion: identificar variantes con posible impacto en la union de POLR2AphosphoS5 para disenar experimentos de validacion (p. ej., ChIP-seq alelico).
- Benchmarking de modelos genomicos: usar los checkpoints como linea base especifica de tarea en evaluaciones de adaptadores sobre DNABERT-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (en preparacion) para las cifras por ensayo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el backbone DNABERT-2 de 117M y el tamano del repo (1,9 GB) sugieren que cabe en GPU de consumo, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: probablemente si, dado el tamano del backbone, aunque no confirmado.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`) junto con `huggingface_hub`; no es compatible con `AutoModel` de `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-polr2aphosphos5 | no disponible (backbone 117M) | 257 pb x 2 ventanas | Allele-specific binding POLR2AphosphoS5 | MIT | Hugging Face |
| DNABERT-2-117M | 117M | no disponible en esta ficha | Representaciones genomicas generales | no disponible en esta ficha | Hugging Face |
| Otros adaptadores hapadapter de ametrick-system | no disponible | no disponible | Otras assays | MIT (segun tag) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La puntuacion de desequilibrio es simetrica: no indica que haplotipo une mas, solo la magnitud.
- Entrada restringida a ventanas de 257 pb; longitudes distintas quedan fuera de distribucion.
- Cada checkpoint se entrena con un unico ensayo y un unico donante, aunque el autor reporta buena generalizacion a otros donantes EN-TEx.
- Uso exclusivamente de investigacion; no validado para interpretacion clinica o diagnostica de variantes humanas.
- No es un `AutoModel`: requiere el paquete `hapadapter` y cargar tanto el tronco como la cabeza.
- Aparecen warnings esperados de `transformers` durante la carga (pesos de MLM no usados, pooler reinicializado) que no deben interpretarse como error.
- Sin descargas ni likes registrados y con paper en preparacion: ecosistema de validacion externa limitado.
- Licencia MIT permite uso comercial, pero la falta de validacion clinica desaconseja aplicaciones sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-polr2aphosphos5
- Backbone DNABERT-2: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparacion (consultar el repositorio para referencia actualizada)
