# 20eddibae/CLEST-TCRdist

## Resumen

CLEST-TCRdist es un codificador de receptores de células T (TCR) de cadena αβ emparejada desarrollado por el usuario 20eddibae. El modelo proyecta un TCR completo (cadenas alfa y beta, con sus genes V, J y regiones CDR3) en un vector de 128 dimensiones en el que receptores que reconocen el mismo péptido quedan próximos entre sí. Esto convierte tareas de recuperación y agrupamiento por especificidad en simples búsquedas de vecinos más cercanos. Es relevante para inmunología computacional porque permite priorizar repertorios TCR frente a epítopos conocidos sin necesidad de disponer del epítopo en el momento de la codificación.

El modelo se apoya en la librería `sceptr` (versión 1.2.0) y sigue su API, de modo que cualquier código escrito contra SCEPTR funciona sin cambios. El checkpoint concreto es `SCEPTR6L_AC_soft_800k_20ep_bs1024`, entrenado con un objetivo de aprendizaje contrastivo con etiquetas suaves derivadas de TCRdist. El repositorio es muy ligero (0.0 GB reportados, ~5 MB de pesos según la model card) y la licencia es MIT.

La propuesta técnica es interesante pero conviene leerla con cautela: el autor advierte explícitamente de que los pesos publicados corresponden a una única ejecución de entrenamiento que quedó por encima de la media de cinco réplicas sembradas, y de que la ventaja frente a TCRdist no se sostiene bajo controles estrictos. Es, por tanto, una herramienta útil para experimentación y prototipado en inmunología, no un componente listo para producción clínica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de TCR de cadena αβ emparejada basado en SCEPTR (protein-language model con aprendizaje contrastivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada estructurada por cadena: genes V/J y CDR3, no texto libre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada biológica: secuencias de aminoácidos y símbolos IMGT) |
| Licencia | MIT |
| Formato de pesos | no disponible explícitamente (carga vía `clest_tcrdist.load_pretrained()`, ~5 MB) |

## Arquitectura y entrenamiento

El modelo es un codificador de proteínas especializado en TCR. Toma como entrada las seis regiones determinantes de complementariedad (CDR1α, CDR2α, CDR3α, CDR1β, CDR2β, CDR3β) junto con los genes TRAV/TRAJ/TRBV/TRBJ en nomenclatura IMGT, y produce una representación de 128 dimensiones. La arquitectura subyacente es la de SCEPTR, un protein-language model entrenado con objetivos contrastivos; en este caso el checkpoint se ha afinado con un objetivo de etiquetas suaves ("soft targets") derivadas de la distancia TCRdist entre receptores.

El entrenamiento se realizó durante 20 épocas con un tamaño de lote de 1024 sobre aproximadamente 800 000 ejemplos (según el identificador `800k_20ep_bs1024`). Una innovación destacable es que durante el preentrenamiento se eliminaron cadenas completas de forma aleatoria, lo que permite usar el mismo checkpoint en modo beta-only sin necesidad de un segundo modelo. El autor señala que el objetivo de etiquetas suaves aporta una mejora de +0.039 AUROC@50 frente al control autocontrastivo emparejado (p = 0.043), aunque esa ventaja se desvanece en modo beta-only.

## Capacidades

- Extracción de características: genera vectores de 128 dimensiones para TCR de cadena αβ emparejada o de cadena beta única.
- Recuperación few-shot: dado un conjunto pequeño de receptores conocidos que se unen a un epítopo, ordena un repertorio por similitud.
- Agrupamiento (clustering): agrupa TCR por especificidad mediante componentes conexas sobre un radio calibrado en el espacio de embedding.
- Modo beta-only: acepta entradas con solo TRBV, CDR3B y TRBJ, útil para repertorios de secuenciación masiva de TCRβ.
- Compatibilidad con la API de SCEPTR: el objeto devuelto es un `sceptr.model.Sceptr`, por lo que hereda sus métodos (`calc_vector_representations`, `calc_cdist_matrix`).
- Entrada flexible: admite cadenas o genes ausentes (dejando el campo vacío) y entrada de cadena única.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un modelo de extracción de características, no un modelo generativo.

## Casos de uso

- Priorización de repertorios TCR en estudios de inmunología: dado un conjunto de TCR conocidos que reconocen un epítopo (por ejemplo, de VDJdb), ordenar un repertorio de secuenciación masiva para seleccionar candidatos a validar experimentalmente, reduciendo el número de ensayos necesarios.
- Análisis de especificidad en cohortes de pacientes: agrupar los TCR de varios individuos por similitud en el espacio de embedding para identificar grupos de receptores que probablemente reconocen el mismo antígeno, útil en estudios de respuesta inmune a infecciones o vacunas.
- Búsqueda de TCR públicos o compartidos: detectar receptores que aparecen en múltiples donantes y que, por su proximidad en el embedding, sugieren especificidad común, lo que ayuda a identificar respuestas convergentes.
- Control de calidad y exploración de datos de TCR-seq: usar los embeddings para visualizar (por ejemplo, con UMAP o t-SNE) la estructura de un repertorio y detectar expansiones clonales con fenotipo similar.
- Comparación metodológica en investigación: servir como referencia para evaluar métodos de agrupamiento de TCR (GIANA, TCRdist, iSMART) en condiciones controladas, con métricas de pureza y retención.
- Desarrollo de clasificadores downstream: usar los vectores de 128 dimensiones como características de entrada para modelos supervisados de predicción de especificidad o de estado clínico, aprovechando que el embedding ya captura similitud funcional.
- Filtrado en pipelines de descubrimiento de fármacos basados en células T: descartar rápidamente TCR de un repertorio que no se parecen a los binders conocidos de un epítopo diana antes de pasar a ensayos costosos.

## Benchmarks y rendimiento

Recuperación few-shot sobre el backtest de seis epítopos de VDJdb del artículo de SCEPTR, con 100 remuestreos del conjunto de referencia y AUROC medio sobre epítopos (puntuación por vecino más cercano):

| TCR de referencia | CLEST-TCRdist | TCRdist | SCEPTR (publicado) | Levenshtein de CDR3 |
|---|---|---|---|---|
| 1 | 0.701 | 0.684 | 0.643 | 0.621 |
| 10 | 0.765 | 0.756 | 0.710 | 0.687 |
| 50 | 0.794 | 0.779 | 0.737 | 0.699 |
| 200 | 0.814 | 0.802 | 0.754 | 0.708 |

Comparación en modo beta-only (AUROC@50, backtest de seis epítopos): CLEST-TCRdist 0.706, GIANA 0.679, iSMART 0.687, TCRdist restringido a beta 0.668. El control autocontrastivo simple obtiene 0.732 en beta-only, por lo que la ventaja del objetivo de etiquetas suaves no se mantiene al eliminar la cadena alfa.

El autor advierte de que estos pesos son una única ejecución: cinco réplicas sembradas de la misma configuración promedian 0.7750 ± 0.0076 con scoring por vecino más cercano y 0.8104 ± 0.0053 con distancia media, frente a 0.7945 y 0.8423 de este checkpoint. Es decir, el checkpoint publicado está por encima de la media de sus réplicas (2,5 desviaciones estándar en el primer caso y 6,0 en el segundo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan aproximadamente 5 MB según la model card, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; para repertorios grandes conviene una GPU con buena capacidad de cómputo (RTX 3090, RTX 4090, A100, H100) para acelerar el cálculo de matrices de distancia y el agrupamiento.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos cientos de MB libres; también funciona en CPU para conjuntos pequeños.
- Opciones de despliegue: instalación vía `pip install git+https://github.com/20eddibae/CLEST-TCRDist.git` y `pip install --no-deps sceptr==1.2.0`; uso mediante la API de Python (`load_pretrained`, `calc_vector_representations`, `calc_cdist_matrix`) o mediante los módulos de línea de comandos `python -m clest_tcrdist.retrieve` y `python -m clest_tcrdist.cluster`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLEST-TCRdist | Codificador contrastivo con etiquetas suaves de TCRdist | TCR αβ o beta | Vector de 128 dimensiones | MIT | Hugging Face |
| SCEPTR (publicado) | Codificador contrastivo | TCR αβ | Vector | no disponible en la información | Hugging Face |
| TCRdist | Distancia basada en motivos | TCR αβ o beta | Distancia entre pares | no disponible en la información | Software académico |
| GIANA | Agrupamiento basado en distancias | TCR beta | Clústeres | no disponible en la información | Software académico |
| iSMART | Agrupamiento basado en distancias | TCR beta | Clústeres | no disponible en la información | Software académico |

En rendimiento de recuperación few-shot, CLEST-TCRdist supera a TCRdist, SCEPTR y Levenshtein de CDR3 en el backtest de seis epítopos, aunque el margen frente a TCRdist no sobrevive a controles estrictos según el propio autor. En modo beta-only, CLEST-TCRdist (0.706) queda ligeramente por encima de GIANA (0.679), iSMART (0.687) y TCRdist beta (0.668), pero por debajo del control autocontrastivo (0.732).

## Limitaciones y advertencias

- Los pesos publicados son una única ejecución de entrenamiento que quedó por encima de la media de cinco réplicas sembradas; el autor recomienda tratar las medias de las réplicas como lo que la receta produce y este checkpoint como una ejecución afortunada.
- La ventaja frente a TCRdist no se sostiene bajo controles: reseleccionar hiperparámetros en epítopos retenidos cuesta unos 0.013 AUROC y dar a TCRdist la lectura de su propia publicación cierra el resto del margen.
- En modo beta-only, el objetivo de etiquetas suaves no supera al control autocontrastivo simple (0.706 frente a 0.732), por lo que para trabajo con solo cadena beta ambos deben considerarse comparables.
- El modelo lee únicamente el receptor, nunca el epítopo; la predicción de especificidad es implícita y depende de la calidad del conjunto de referencia.
- El radio de agrupamiento se calibra a partir de los datos salvo que se fije manualmente; la pureza cae del 1.00 al 20 % de retención al 0.88 al 30 % y al 0.74 al 40 % en el conjunto de 120 TCR y cuatro epítopos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; su uso es exclusivamente de extracción de características y análisis.
- La licencia MIT permite uso comercial, pero el modelo no está validado para aplicaciones clínicas; cualquier uso en diagnóstico o toma de decisiones médicas requeriría validación independiente.
- Riesgo de sesgo derivado de los datos de entrenamiento (repertorios de VDJdb y similares), que pueden estar sesgados hacia epítopos y poblaciones sobrerrepresentadas.
- La instalación requiere `sceptr==1.2.0` con `--no-deps` por un conflicto de versiones de numpy con tcrdist3, lo que puede complicar la integración en entornos ya configurados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/20eddibae/CLEST-TCRdist
- Repositorio del código: https://github.com/20eddibae/CLEST-TCRDist
- Librería SCEPTR: https://pypi.org/project/sceptr/1.2.0/
- tcrdist3 (dependencia para las etiquetas TCRdist): no disponible en la información proporcionada
- Artículo de SCEPTR (referencia del backtest): no disponible en la información proporcionada
