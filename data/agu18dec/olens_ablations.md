# agu18dec/olens_ablations

## Resumen

`agu18dec/olens_ablations` es un repositorio de artefactos de investigación publicado en HuggingFace por el usuario `agu18dec`. No se trata de un modelo generativo convencional ni de un modelo conversacional: es una ronda de ablaciones del programa interno denominado OLens, compuesta por reconstuctores autorregresivos (AR), "lentes" o inversores que leen dichas reconstrucciones y estudiantes destilados de cuatro viñetas. La model card no declara pipeline, idiomas, licencia ni arquitectura del modelo subyacente.

El hallazgo central que documenta el autor es metodológico: la regla de evaluación "whitened-FVE" que el propio programa optimiza y reporta anti-correlaciona con la calidad final de la lente. El brazo AR entrenado sin blanqueado (`rawcos`) obtiene una puntuación mucho peor en esa regla y, sin embargo, produce la mejor lente (CE de validación 1.1341 frente a 1.1996 del brazo `base`), y llevar ambos brazos a saturación no corrige la discrepancia. El repositorio incluye además brazos con GRPO cuyo reward es el AR del propio brazo.

Su relevancia práctica es acotada pero concreta para equipos de interpretabilidad y de metodología experimental: cada brazo difiere de la receta de referencia en exactamente una bandera, con datos, pool, semilla de recorte, conjunto de capas, tasa de aprendizaje, lote y semillas fijados. El repositorio ocupa 352,4 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors sin cuantizaciones documentadas) |
| Idiomas soportados | no disponible (no declarados en la model card ni en los metadatos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 352,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion registrada | 2026-09-20 |
| Fecha de actualizacion registrada | 2026-10-04 |
| Autor | agu18dec |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura del modelo base sobre el que operan las lentes. Los artefactos publicados se organizan en tres familias: `ars/` (reconstructores), `inverters/` (lentes que leen las reconstrucciones) y `rl/` (estudiantes destilados y posteriormente optimizados con GRPO). Las rutas y nombres de checkpoint mencionan rangos de capas (L20-32, L36-48, L52-60) y un total de 21 capas etiquetadas, pero no se declara el número de parámetros del modelo subyacente ni si se trata de un transformer denso, un MoE o una arquitectura híbrida.

La metodología de ablación es explícita: cada brazo modifica exactamente una bandera respecto de la receta de referencia. En los reconstructores se comparan `--loss-space whiten` (referencia, coseno blanqueado sobre vectores centrados), `--head-output unitnorm` (normalización unitaria de la salida del AR antes de la pérdida), `--loss-space rawcos_c` (coseno sobre vectores centrados sin blanqueado) y `--loss-space rawcos` (coseno sin centrado ni blanqueado). En los inversores se ablan transformaciones de inyección (`scale*x` como receta, `x` sin escalar, `alpha*x/||x||`, `scale*(x-mu)`, `scale*W(x-mu)`, un control con vectores mezclados entre filas y un brazo que inyecta residuos verdaderos en lugar de reconstrucciones del AR). Los brazos de RL parten de cada lente saturada, se destilan a un estudiante de cuatro viñetas (etiquetas de diccionario K=4, penalización de longitud mu=0,0002, 4.000 filas por capa en 21 capas, una época, inicializado desde el punto final de la lente) y se optimizan con GRPO durante 300 pasos usando el AR del propio brazo como recompensa.

## Capacidades

- Reconstrucción de activaciones: los AR producen reconstrucciones de residuos evaluables mediante fracción de varianza explicada (FVE), con valores que van de 0,0066 a 0,1830 según el brazo y la base de blanqueado.
- Lectura tipo lente: los inversores `ao.ab.k2.*` generan lecturas con CE de validación entre 1,1341 y 1,5400 en el conjunto de recorte de 594 elementos, y 3,4192 en el control sin información.
- Destilación a formato estructurado: los estudiantes de cuatro viñetas generan una media de 3,98-4,05 viñetas por generación, con entre el 82,0 % y el 95,7 % de las generaciones en cuatro viñetas según el paso de entrenamiento.
- Optimización con recompensa basada en modelo: los brazos `rl/` se entrenan con GRPO durante 300 pasos usando el AR del propio brazo como función de recompensa, con registro de recompensa, KL, número de viñetas y longitud.
- Control experimental: el brazo `ao.ab.k2.scramble`, que mezcla vectores entre filas, actúa como suelo de no información (CE 3,4192).
- Capacidades no documentadas: no hay evidencia en la información disponible de generación de texto libre, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, comportamiento de agente ni capacidades multilingües.

## Casos de uso

- Reproducción metodológica de ablaciones controladas: el repositorio permite replicar un diseño en el que cada brazo difiere de la receta de referencia en una sola bandera, con datos, pool, semilla de recorte, conjunto de capas, tasa de aprendizaje, lote y semillas fijados, útil para equipos que necesitan aislar el efecto de una decisión de diseño concreta.
- Auditoría de funciones de pérdida en entrenamiento de reconstuctores: la comparación entre `whiten`, `unitcos`, `rawcos_c` y `rawcos` permite estudiar cómo el blanqueado y el centrado afectan a la calidad final de la lente (CE de 1,1341 a 1,2323 en los brazos saturados).
- Detección de desalineación entre métrica y objetivo: el repositorio documenta que la regla whitened-FVE anti-correlaciona con la calidad de la lente, un caso práctico para diseñar sistemas de evaluación que no se confundan con la función objetivo.
- Estudio de reward hacking en RL con recompensa neuronal: los brazos GRPO muestran cómo la recompensa FVE media cae de 0,178 en el paso 100 a 0,301 en el paso 300 mientras el número de viñetas por generación se mantiene cerca de 4, un escenario reproducible para analizar dinámicas de sobreoptimización.
- Desarrollo de pipelines de interpretabilidad sobre activaciones: los inversores y las lentes sirven como base para construir lecturas de activaciones por capa, con evaluación desagregada en los rangos L20-32, L36-48 y L52-60.
- Calibración de suelos de información: el brazo de control con vectores mezclados (CE 3,4192) y el brazo que inyecta residuos verdaderos (CE 1,5400) permiten fijar referencias de comparación para separar señal real de ruido estructural.
- Validación de recetas de destilación ligera: la destilación a estudiantes de cuatro viñetas con penalización de longitud y una época es directamente reutilizable como plantilla para comprimir modelos grandes a salidas estructuradas cortas.
- Diseño de protocolos de comparación entre conjuntos de validación: la advertencia sobre la no comparabilidad de `val_fve` entre brazos (cada uno recorta su propio conjunto de validación de su propia oleada) es un caso de estudio sobre cómo definir una regla congelada y compartida antes de comparar checkpoints.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de NLP estándar (MMLU, HumanEval, GSM8K), sino métricas internas de la ronda de ablaciones. Se reproducen tal cual.

Calidad de la lente (CE de validación sobre el recorte de 594 elementos, menor es mejor):

| Brazo | Pasos acumulados | Ejemplos | Tokens de span | CE de validación |
|---|---|---|---|---|
| `base` | 42.899 | 43.928.576 | 782 M | 1,1996 |
| `unitcos` | 28.351 | 29.031.424 | 515 M | 1,2323 |
| `rawcos_c` | 29.351 | 30.055.424 | 533 M | 1,1952 |
| `rawcos` | 42.899 | 43.928.576 | 782 M | 1,1341 |
| `tf.scaled` | 15.516 | 15.888.384 | 281 M | 1,3734 |
| `tf.raw` | 15.516 | 15.888.384 | 281 M | 1,3547 |

El autor advierte que los brazos solo deben compararse a pasos acumulados idénticos: los brazos detenidos antes por recorte de presupuesto tienen totales menores y leer sus puntos finales contra un brazo totalmente entrenado invierte el orden.

Calidad del reconstuctor (regla congelada de 8.192 filas, filas idénticas, dos bases de blanqueado):

| AR | FVE (base chat) | FVE (base agrupada) | Pérdida coseno blanqueada (chat) |
|---|---|---|---|
| `ar.asst.ptag.chat.k2.s3_final` | 0,1830 | 0,1957 | 1,2388 |
| `ar.ab.k2.unitcos_final` | 0,1656 | 0,1783 | 1,2771 |
| `ar.ab.k2.base_final` | 0,1652 | 0,1779 | 1,2779 |
| `ar.asst.ptag.chat.k2.s0_ex11404800` | 0,1606 | — | 1,2893 |
| `ar.ab.k2.rawcos_c_final` | 0,1102 | 0,1243 | 1,4066 |
| `ar.ab.k2.rawcos_final` | 0,0920 | 0,1022 | 1,5067 |
| `ar.asst.ptag.chat.k2.s0_ex2880000` | 0,0752 | — | 1,5039 |
| `ar.xm.4b.p1_ex11405184` | 0,0526 | — | 1,5763 |
| `ar.xm.4b.p1_ex2880384` | 0,0335 | — | 1,6622 |
| `ar.xm.27b.p1.affmap_ex11405184` | 0,0088 | — | 1,8424 |
| `ar.xm.27b.p1.affmap.kaiming_ex11405184` | 0,0084 | — | 1,8455 |
| `ar.xm.27b.p1.affmap_ex2880384` | 0,0066 | — | 1,8663 |

El orden de esta tabla es el inverso al de la tabla de lentes: el AR con peor puntuación en esta regla (`rawcos`) produce la mejor lente. El autor indica que el `val_fve` registrado durante el entrenamiento no es comparable entre brazos, porque cada uno recorta su propio conjunto de validación.

Brazos con RL (`rl/`):

| Checkpoint | FVE media de la regla | Mediana | L20-32 / L36-48 / L52-60 | Sin viñetas | Viñetas/generación | % 3 / 4 / 5 / 6+ | Tokens por viñeta | Recompensa de entrenamiento por paso (FVE, KL, viñetas, longitud, corte) |
|---|---|---|---|---|---|---|---|---|
| `rl.ab4.unitcos.g0` paso 100 | 0,2782 | 0,2666 | 0,2447 / 0,2602 / 0,3414 | 0,0 % | 4,009 | 1,7 / 95,7 / 2,6 / 0,0 | 9,78 | 0,178 (0,178, 0,3685, 4,00, 73, 0 %) |
| `rl.ab4.unitcos.g0` paso 200 | 0,3003 | 0,2865 | 0,2589 / 0,2773 / 0,3792 | 0,0 % | 3,981 | 4,1 / 93,3 / 2,2 / 0,2 | 10,14 | 0,246 (0,246, 0,3689, 3,99, 86, 0 %) |
| `rl.ab4.unitcos.g0` paso 300 | 0,3183 | 0,3109 | 0,276 / 0,2974 / 0,3956 | 0,0 % | 4,05 | 6,7 / 82,0 / 10,0 / 1,1 | 11,43 | 0,301 (0,301, 0,4070, 3,98, 100, 0 %) |

Calidad de los inversores (CE de validación final):

| Ejecución | Descripción | CE de validación final |
|---|---|---|
| `ao.ab.k2.ds.base` | lente que lee el AR base (segmento padre) | 1,4724 |
| `ao.ab.k2.ds.base.x` | lente base hasta saturación en el pool w5+6 (profesor del estudiante de 4 viñetas) | 1,1996 |
| `ao.ab.k2.ds.unitcos` | lente que lee el AR unitcos | 1,4827 |
| `ao.ab.k2.ds.unitcos.x` | extensión de saturación de la lente unitcos | 1,2323 |
| `ao.ab.k2.ds.rawcos_c` | lente que lee el AR rawcos_c | 1,4209 |
| `ao.ab.k2.ds.rawcos_c.x` | extensión de saturación de la lente rawcos_c | 1,1952 |
| `ao.ab.k2.ds.rawcos` | lente que lee el AR rawcos | 1,4160 |
| `ao.ab.k2.ds.rawcos.x` | lente rawcos hasta saturación | 1,1341 |
| `ao.ab.k2.scaled` | transformación de inyección `scale*x` (receta) | 1,5109 |
| `ao.ab.k2.raw` | transformación de inyección `x`, sin escalar | 1,5020 |
| `ao.ab.k2.unit` | transformación de inyección `alpha*x/||x||` | 1,5090 |
| `ao.ab.k2.centered` | transformación de inyección `scale*(x-mu)` | 1,5125 |
| `ao.ab.k2.wht` | transformación de inyección `scale*W(x-mu)` | 1,5282 |
| `ao.ab.k2.scramble` | control con vectores mezclados entre filas (suelo sin información) | 3,4192 |
| `ao.ab.k2.w56.gt` | inyecta residuos verdaderos en lugar de reconstrucciones del AR | 1,5400 |
| `ao.ab.k2.w56.scaled` | pareja emparejada del brazo gt: reconstrucciones del AR, mismos recortes | 1,2777 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no declara el número de parámetros ni el tamaño por checkpoint, por lo que no puede derivarse una cifra de VRAM fiable.
- Almacenamiento: el repositorio completo ocupa 352,4 GB, cifra que hay que provisionar si se descarga entero. Se desconoce el tamaño individual de cada checkpoint.
- GPU recomendadas: no disponible. Sin parámetros declarados no es posible recomendar A100, H100 o RTX 4090 con criterio.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no documentadas. Los pesos se distribuyen en safetensors, por lo que la carga habitual sería vía bibliotecas de tensores compatibles, pero no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables externos en la información proporcionada. La búsqueda web asociada devolvió resultados sin relación con el repositorio (páginas de la plataforma Steam), por lo que no hay alternativas verificables de la misma categoría. La comparación posible es interna, entre los propios brazos del proyecto:

| Brazo | CE de validación de la lente | FVE del AR (base chat) | Número de pasos | Nota |
|---|---|---|---|---|
| `rawcos` | 1,1341 (mejor) | 0,0920 | 42.899 | Sin blanqueado ni centrado |
| `rawcos_c` | 1,1952 | 0,1102 | 29.351 | Centrado sin blanqueado |
| `base` | 1,1996 | 0,1652 | 42.899 | Receta de referencia (coseno blanqueado) |
| `unitcos` | 1,2323 | 0,1656 | 28.351 | Salida del AR normalizada |
| `tf.raw` | 1,3547 | — | 15.516 | Destilación con transformación sin escalar |
| `tf.scaled` | 1,3734 | — | 15.516 | Destilación con transformación escalada |

## Limitaciones y advertencias

- Ausencia de licencia: la model card y los metadatos no declaran licencia, por lo que el uso comercial o la redistribución quedan en una situación legal indeterminada.
- Naturaleza del artefacto: no es un modelo de propósito general. Es una colección de reconstructores, lentes y estudiantes de ablación; no hay evidencia de generación de texto, tool calling, agentes, visión ni audio.
- Riesgo de interpretación errónea de las métricas: el propio autor advierte que la regla whitened-FVE anti-correlaciona con la calidad de la lente y que el `val_fve` registrado durante el entrenamiento no es comparable entre brazos, porque cada uno recorta su propio conjunto de validación.
- Comparaciones no emparejadas: los brazos detenidos por recorte de presupuesto no deben leerse contra brazos totalmente entrenados a pasos acumulados distintos; hacerlo invierte el orden de calidad.
- Procedencia y reproducibilidad: 0 descargas y 0 likes, sin paper, repositorio de código ni documentación externa enlazada. La model card está en inglés y describe un programa de nomenclatura propio que no se traduce a términos estándar de la literatura.
- Datos faltantes críticos: no hay número de parámetros, arquitectura, longitud de contexto, idiomas, ni tipos de cuantización declarados, lo que impide planificar despliegue en producción.
- Metadatos potencialmente poco fiables: las fechas de creación y actualización registradas (2026) no coinciden con la cronología habitual de publicación, lo que reduce la confianza en los metadatos del repositorio.
- Sesgos: no disponible. No se ha publicado ninguna evaluación de sesgos, toxicidad o alineación en la información disponible.
- Riesgo de alucinación: no evaluable en el material disponible, dado que los artefactos no están documentados como generadores de texto libre.
- Sobrecoste de almacenamiento: 352,4 GB de repositorio sin desglose por checkpoint complican la descarga selectiva y el versionado en entornos con cuota de disco.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agu18dec/olens_ablations
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
- La búsqueda web asociada no devolvió enlaces relevantes al modelo (los resultados correspondían a la plataforma Steam y no guardan relación con el repositorio).
