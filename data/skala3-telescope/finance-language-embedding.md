# skala3-telescope/finance-language-embedding

## Resumen

`finance-language-embedding` es un repositorio de embeddings de frases en coreano desarrollado por el usuario skala3-telescope, orientado especificamente a la normalizacion de nombres de cuentas contables de estados financieros. El problema que resuelve es concreto: cada empresa coreana etiqueta sus lineas de balance, cuenta de resultados y flujo de efectivo con denominaciones ligeramente distintas, lo que impide comparar partidas entre companias o entre ejercicios. Este modelo alinea esas cadenas cortas mediante similitud coseno, no recuperacion de documentos largos.

El repositorio contiene dos submodelos con estrategias distintas. El primero, `arctic_l_ko_ft_v1`, parte de `dragonkue/snowflake-arctic-embed-l-v2.0-ko` con 568M parametros y embeddings de 1024 dimensiones, y requiere el prefijo `prompt_name="query"` en ambos lados de la comparacion. El segundo, `kf_deberta_ft_v1`, parte de `upskyy/kf-deberta-multitask` con 185M parametros y 768 dimensiones, sin prompt. Ambos se entrenaron con un maximo de 64 tokens, suficiente porque los nombres de cuenta no superan los 46 tokens.

La relevancia actual es practica: el model card reporta una mejora sustancial frente a los modelos base sin ajuste y frente a una linea base TF-IDF de caracteres 1-3 gramos en una tarea de alineacion de filas entre ejercicios contables, con datos derivados de OpenDART. Es una herramienta de nicho, pero bien evaluada dentro de ese nicho, y publicada con particiones por empresa para evitar fugas de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (dos submodelos: Arctic Embed L v2.0 ko y KF-DeBERTa) |
| Parametros totales | 568M (`arctic_l_ko_ft_v1`) y 185M (`kf_deberta_ft_v1`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud de entrenamiento; el maximo de los nombres de cuenta fue 46 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | No disponible a nivel de repositorio; modelos base: Apache-2.0 (`dragonkue/snowflake-arctic-embed-l-v2.0-ko`) y sin licencia declarada en la model card de `upskyy/kf-deberta-multitask` (el original `kakaobank/kf-deberta-base` es MIT) |
| Formato de pesos | safetensors |
| Dimensiones del embedding | 1024 (`arctic_l_ko_ft_v1`) y 768 (`kf_deberta_ft_v1`) |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Tamano del repositorio | 3.0 GB |
| Modelos base | `dragonkue/snowflake-arctic-embed-l-v2.0-ko`, `upskyy/kf-deberta-multitask` |

## Arquitectura y entrenamiento

Ambos submodelos son encoders transformer con pooling para producir embeddings de frase. `arctic_l_ko_ft_v1` deriva de Snowflake Arctic Embed L v2.0 en su variante coreana, un encoder de 568M parametros que genera vectores de 1024 dimensiones y espera el prefijo de consulta en ambos lados de la comparacion. `kf_deberta_ft_v1` deriva de KF-DeBERTa, un modelo de 185M parametros con embeddings de 768 dimensiones que no usa prompt. En ambos casos se ajustaron todos los parametros (full fine-tuning) durante 2 epocas, 1.242 pasos, con AdamW a learning rate 2e-5, 10% de warmup y decaimiento lineal, semilla 0.

Los datos de entrenamiento se construyeron a partir del endpoint `fnlttSinglAcntAll` de OpenDART (informes anuales de negocios), generando 39.773 pares. La construccion de positivos es el punto metodologico interesante: se emparejan filas cuyo importe en el informe del ejercicio t-1 coincide en valor absoluto (umbral de 1 millon de wones) con el importe del ejercicio anterior declarado en el informe del ejercicio t, pero cuyas etiquetas difieren; es decir, pares validados por importe que representan "el mismo concepto con otra redaccion". Los negativos duros son el resto de filas de la misma tabla del ejercicio t. El corpus cubre 2.460 empresas, con 22.592 pares de estado de flujos de efectivo, 9.031 de balance, 7.518 de estado de resultados integral y 632 de cuenta de resultados. Se excluyeron de entrenamiento las cuatro operadoras de telecomunicaciones usadas en evaluacion (SK Telecom, KT, LG Uplus, SK Broadband) y 150 empresas de desarrollo.

La funcion de perdida es InfoNCE bidireccional con temperatura 0,05, batch de 64 y 2 negativos duros por fila. Se filtraron de los negativos los candidatos con la misma cadena o el mismo identificador de cuenta estandar. Los hiperparametros se fijaron a priori, sin busqueda sobre el conjunto de desarrollo.

## Capacidades

- Generacion de embeddings de frases para similitud semantica (pipeline `sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) mediante sentence-transformers.
- Alineacion de nombres de cuentas contables entre empresas y entre ejercicios (normalizacion de etiquetas DART).
- Correspondencia entre etiquetas de materiales IR y filas de estados financieros DART (tarea IR↔DART evaluada en el model card).
- Manejo de cadenas cortas: entrenado con maximo de 64 tokens, optimizado para nombres de cuenta de hasta 46 tokens.
- Dos perfiles de coste: variante de 185M parametros para despliegue ligero y variante de 568M para mayor precision.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un encoder de embeddings, no un modelo generativo.
- Cobertura linguistica limitada al coreano.

## Casos de uso

- Normalizacion de estados financieros multiempresa: dado un conjunto de informes DART de distintas companias, el modelo permite agrupar etiquetas de cuenta equivalentes ("법인세비용차감전계속사업이익" frente a "법인세비용차감전순이익") calculando similitud coseno entre embeddings y aplicando un umbral, lo que habilita paneles comparativos entre companias.
- Conciliacion interanual de partidas: al comparar el informe del ejercicio t con el de t-1, las etiquetas pueden cambiar aunque el importe sea el mismo; el modelo selecciona la fila correcta entre una media de 46 candidatos con una precision top-1 reportada de 0,899 en el conjunto de desarrollo.
- Mapeo de materiales IR a estados financieros auditados: las presentaciones a inversores usan denominaciones propias; el modelo las alinea con las filas DART, con una precision reportada de 0,775 en el conjunto de prueba de cuatro operadoras de telecomunicaciones.
- Construccion de un diccionario de cuentas para pipelines ETL financieros: generar un mapa canonico de etiquetas por empresa que alimente un data warehouse, reduciendo reglas manuales de expresiones regulares.
- Enriquecimiento de bases de datos de comparables (peer comparison): asignar a cada fila de un informe una categoria estandar antes de calcular ratios, usando los embeddings como senal de agrupamiento.
- Deteccion de cambios de criterio contable: si dos ejercicios presentan el mismo importe con etiquetas que el modelo considera muy similares, se puede descartar un cambio real de criterio y marcar solo las divergencias semanticas como candidatas a revision.
- Filtrado previo en herramientas de auditoria: ordenar las filas de una tabla por similitud con una etiqueta de referencia para que un revisor humano valide solo el top-k, aprovechando que el coste de inferencia es bajo (modelos de 185M y 568M parametros).

## Benchmarks y rendimiento

La tarea evaluada es: dada la etiqueta del ejercicio t-1, seleccionar entre las filas candidatas del informe del ejercicio t (media de ~46 filas) la que corresponde al mismo concepto; la verdad de referencia se establece por coincidencia de importe. La particion es por empresa.

| Modelo | dev 150 empresas (9.257 pares) | 4 operadoras (402 pares) | IR↔DART operadoras (89 pares) |
|---|---|---|---|
| arctic_l_ko_ft_v1 | 0,899 | 0,920 | 0,775 |
| kf_deberta_ft_v1 | 0,894 | 0,920 | 0,697 |
| arctic base (sin ajuste) | 0,736 | 0,789 | 0,461 |
| kf-deberta base (sin ajuste) | 0,654 | 0,709 | 0,438 |
| TF-IDF caracteres 1-3 gramos | 0,681 | 0,781 | 0,382 |

Subconjunto restringido a pares de etiquetas no vistos en entrenamiento:

| Modelo | dev (1.545 pares) | 4 operadoras (118 pares) |
|---|---|---|
| arctic_l_ko_ft_v1 | 0,754 | 0,831 |
| kf_deberta_ft_v1 | 0,739 | 0,881 |
| arctic base | 0,632 | 0,814 |
| kf-deberta base | 0,599 | 0,754 |

Notas del autor sobre significancia: la diferencia en dev entre los dos modelos ajustados (+0,005) es estadisticamente significativa (McNemar p=0,004) pero de magnitud pequena; el intervalo de confianza al 95% es de aproximadamente ±0,03 para los 402 pares de operadoras y ±0,09 para los 89 pares IR↔DART. El 83% de los pares de desarrollo (7.712) comparten par de etiquetas con el entrenamiento, por lo que la tabla del subconjunto no visto es la referencia mas exigente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Como referencia de orden de magnitud, un encoder de 185M parametros en fp16 ocupa aproximadamente 0,4 GB de pesos y uno de 568M aproximadamente 1,1 GB; el consumo real depende del backend y del tamano de batch.
- GPU recomendadas: no especificadas por el autor. Por tamano, ambos modelos son aptos para GPU de consumo; la variante de 185M puede ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Cabe en GPU de consumo: si, por el numero de parametros (185M y 568M); no se han publicado mediciones del autor.
- Opciones de despliegue: sentence-transformers (uso documentado en el model card), endpoints de Hugging Face (tag `endpoints_compatible`); otros backends como vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| finance-language-embedding (`arctic_l_ko_ft_v1`) | 568M | 64 tokens | 1024 | No disponible en el repo; base Apache-2.0 | Embeddings de cuentas contables coreanas |
| finance-language-embedding (`kf_deberta_ft_v1`) | 185M | 64 tokens | 768 | No disponible en el repo; base sin licencia declarada (original MIT) | Embeddings de cuentas contables coreanas |
| dragonkue/snowflake-arctic-embed-l-v2.0-ko | 568M | No disponible | 1024 | Apache-2.0 | Embeddings generales en coreano |
| upskyy/kf-deberta-multitask | 185M | No disponible | 768 | No declarada (original `kakaobank/kf-deberta-base` MIT) | Embeddings/encoder financiero coreano |
| TF-IDF caracteres 1-3 gramos (linea base) | No aplica | No aplica | No aplica | No aplica | Coincidencia lexica |

En la tarea especifica de alineacion de cuentas, ambos submodelos superan a sus bases sin ajuste y a la linea base TF-IDF, con la mayor ventaja en la tarea IR↔DART (0,775 frente a 0,461 de la base Arctic). No se dispone de comparacion con otros modelos de embeddings financieros coreanos especializados.

## Limitaciones y advertencias

- No distingue de forma fiable pares con superficie similar y significado distinto, como "현금배당수익률"/"주식배당수익률" (rentabilidad por dividendo en efectivo frente a en acciones) o "미수금"/"미지급금" (cuentas a cobrar frente a cuentas a pagar). El autor recomienda no decidir con una unica puntuacion de similitud y combinar con comprobaciones de atributos (debe/haber, corriente/no corriente).
- El entrenamiento solo cubre etiquetas de filas de estados financieros; los campos de formularios de divulgacion puntual ("기준일", "일시", etc.) quedan fuera de alcance.
- No se utilizo la informacion de conceptos y jerarquia de la taxonomia estandar K-IFRS, lo que limita la generalizacion estructural.
- Los estados financieros de entidades financieras y los desgloses detallados de notas apenas estan representados en los datos de entrenamiento.
- Cobertura linguistica limitada al coreano; no es un modelo multilingue.
- Ventana de 64 tokens: no es adecuado para fragmentos largos ni para recuperacion de documentos.
- Licencia ambigua: el repositorio no declara licencia propia y uno de los modelos base (`upskyy/kf-deberta-multitask`) no indica licencia en su model card, lo que exige verificacion juridica antes de un uso comercial.
- Riesgo de sobreajuste a pares de etiquetas frecuentes: el 83% de los pares de desarrollo aparecen tambien en entrenamiento, por lo que las cifras de la tabla principal sobreestiman el rendimiento en etiquetas nuevas; usar como referencia la tabla del subconjunto no visto.
- La verdad de referencia se define por coincidencia de importe, lo que puede introducir ruido cuando dos partidas distintas comparten cifra.
- Sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026: ecosistema de validacion externa practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skala3-telescope/finance-language-embedding
- Modelo base Arctic Embed L v2.0 ko: https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko
- Modelo base KF-DeBERTa multitask: https://huggingface.co/upskyy/kf-deberta-multitask
- Modelo original KF-DeBERTa base: https://huggingface.co/kakaobank/kf-deberta-base
- OpenDART (origen de los datos de entrenamiento): https://opendart.fss.or.kr/
- Documentacion de sentence-transformers: https://www.sbert.net/
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
