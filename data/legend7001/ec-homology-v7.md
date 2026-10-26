# Legend7001/ec-homology-v7

## Resumen

`Legend7001/ec-homology-v7` no es un modelo de lenguaje ni una red neuronal profunda: es un artefacto de bioinformática publicado en Hugging Face que resuelve la clasificación de enzimas en códigos EC (*Enzyme Commission*) mediante transferencia por homología. El pipeline combina una búsqueda de similitud de secuencias con MMseqs2 (sensibilidad 5,7, dos hilos, prefilter y align ejecutados como pasos separados para no escribir en `/tmp`) con un reranker supervisado de *gradient boosting* que puntúa cada EC candidato usando exclusivamente evidencia de homología: bitscores relativos al mejor hit, identidad, cobertura, rango, acuerdo entre hits, ratio de longitud y competencia con ECs hermanos.

Lo desarrolla el usuario Legend7001 como entrega del proyecto DA3410 para la tarea de clasificación enzimática «Leak CURBER», un planteamiento de evaluación diseñado explícitamente para controlar la fuga de información entre entrenamiento y test. El reranker se entrenó con búsquedas *out-of-fold*: cada secuencia de entrenamiento se busca contra las otras cuatro de las cinco particiones agrupadas al 40 % de identidad. Es relevante ahora por su perfil de despliegue: inferencia totalmente offline en CPU, binarios estáticos de MMseqs2 para AVX2 y SSE4.1, y un repositorio de solo 0,1 GB, lo que permite anotación funcional a escala en entornos sin GPU y sin acceso a red.

La contrapartida es que se trata de un artefacto pequeño, sin métricas publicadas en la model card, sin licencia declarada, con cero descargas y cero validación comunitaria, y con una limitación funcional importante: solo se puntúa y devuelve el primer EC de cada secuencia, por lo que no cubre anotaciones multi-EC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación por homología (MMseqs2, sensibilidad 5,7) + reranker de clasificación supervisada (*gradient boosting* sobre features de homología); no es un transformer ni una red neuronal de lenguaje |
| Parametros totales | no disponible (no es un modelo neuronal; el repositorio completo ocupa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no hay ventana de tokens; la entrada es una secuencia de proteína) |
| Tipos de cuantizacion | no disponible (no aplica; los artefactos son `joblib`/JSON y binarios estáticos) |
| Idiomas soportados | no disponibles; la entrada es una secuencia de aminoácidos, no lenguaje natural |
| Licencia | no disponible en la model card; el binario MMseqs2 empaquetado es GPLv3 y el vocabulario EC de ExPASy ENZYME (release 02-09-2026, SIB) es CC BY 4.0 |
| Formato de pesos | `weights/rerank_hgb.joblib` (reranker principal), `weights/rerank_lr.json` (reranker logístico de respaldo), `weights/rerank_features.json`, `weights/train_ecs.json`, `weights/baseline.json`, base de datos MMseqs2 en `db/` y binarios en `bin/` |
| Tarea | Clasificación enzimática multietiqueta reducida a etiqueta única (solo se puntúa el primer EC) |
| Salida | Un código EC por secuencia de consulta (o el EC de respaldo de `weights/baseline.json`) |
| Entrenamiento del reranker | Búsquedas *out-of-fold* sobre 5 particiones agrupadas al 40 % de identidad |
| Features del reranker | Bitscore relativo al mejor hit, identidad, cobertura, rango, acuerdo entre hits, ratio de longitud, competencia con ECs hermanos; sin priors de frecuencia de EC |
| Hardware de inferencia | CPU x86-64 *offline*; se selecciona binario AVX2 o SSE4.1 leyendo `/proc/cpuinfo`; 2 hilos |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

El sistema es un *retrieval + reranking* en dos etapas. Primero, `predict.py` lanza una búsqueda MMseqs2 de la secuencia de consulta contra una base de datos construida con las secuencias de entrenamiento (nombradas `t<fila>`), con el índice de k-mers generado en tiempo de ejecución y con prefilter y align separados de forma deliberada. Los EC de los hits pasan a ser candidatos. Después, `ecfeat.py` calcula las features de cada candidato y el reranker HistGradientBoosting (`rerank_hgb.joblib`, con el esquema declarado en `rerank_features.json`) asigna la puntuación final; el candidato mejor puntuado se devuelve como predicción única. Un reranker logístico más antiguo (`rerank_lr.json`) queda como respaldo.

El diseño pone el énfasis en evitar atajos espurios. El clasificador no usa priors de identidad de EC —nada de frecuencias de clase—, solo evidencia de homología, y el ajuste se hizo con búsquedas *out-of-fold*: cada secuencia se busca contra las otras cuatro particiones de un agrupado al 40 % de identidad, de modo que el reranker aprende a desambiguar entre ECs hermanos con hits de identidad moderada en lugar de memorizar secuencias vecinas. El repositorio incluye además un guardia de tiempo y un filtrado de vocabulario en `predict.py`, y un EC de reserva (`baseline.json`) para los casos sin evidencia suficiente. La model card no documenta el número de secuencias de entrenamiento, la composición taxonómica del conjunto ni el volumen total de tokens/pares procesados.

## Capacidades

- Predicción de código EC para secuencias proteicas mediante transferencia por homología, con desambiguación supervisada entre candidatos.
- Reranking consciente de competencia entre ECs hermanos, lo que ayuda en familias enzimáticas con actividades próximas.
- Inferencia completamente offline en CPU, sin GPU, sin red y sin escrituras en `/tmp`.
- Selección automática del binario MMseqs2 adecuado (AVX2 o SSE4.1) según la CPU.
- Filtrado de vocabulario EC y guardia de tiempo para acotar ejecuciones patológicas.
- Mecanismo de respaldo en dos niveles: reranker logístico si falla el *gradient boosting* y EC por defecto si no hay hits.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- No soporta anotación multi-EC: solo se puntúa y devuelve el primer EC.

## Casos de uso

- **Anotación funcional de proteomas y metagenomas a escala**: ejecutar `predict.py` sobre ensamblados en un clúster de CPU sin GPU permite asignar un EC por proteína con MMseqs2 a sensibilidad 5,7 en dos hilos por proceso, escalando horizontalmente por número de núcleos.
- **Triaje previo a curación manual**: usar la predicción como primera pasada sobre catálogos de enzimas y reservar el esfuerzo de revisores humanos para los casos con hits débiles o con competencia fuerte entre ECs hermanos.
- **Enriquecimiento de pipelines de anotación existentes** (Prokka, Bakta u otros): el artefacto es un script de Python con binarios estáticos, por lo que se puede encadenar como paso posterior a la predicción de genes sin introducir dependencias de GPU.
- **Priorización en ingeniería de enzimas y biología sintética**: descartar candidatos sin hit con EC plausible antes de expresar y ensayar constructos, reduciendo el número de experimentos húmedos necesarios.
- **Reconstrucción de rutas metabólicas**: mapear enzimas de un organismo o comunidad a ECs para alimentar herramientas de reconstrucción de rutas, aceptando la limitación de etiqueta única.
- **Evaluación comparativa interna (baseline de homología)**: servir como referencia no neuronal y barata contra la que medir modelos profundos de anotación enzimática, especialmente en entornos con restricciones de cómputo.
- **Despliegue en entornos air-gapped o regulados**: al funcionar sin red, sin `/tmp` y con binarios incluidos, encaja en instalaciones con políticas estrictas de sistema de ficheros y conectividad.
- **Reproducibilidad docente**: el paquete es autocontenido (0,1 GB), lo que facilita replicar la práctica DA3410 en máquinas de estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el diseño experimental (particiones agrupadas al 40 % de identidad y búsquedas *out-of-fold*) y el repositorio lleva la etiqueta `leaderboard`, pero no se incluye ninguna métrica de accuracy, F-max, precision/recall ni comparación numérica con otras submission a la tarea Leak CURBER.

## Requisitos de hardware

- **VRAM**: no aplica; la inferencia es exclusivamente en CPU. No hay requisito de GPU.
- **CPU**: x86-64 con AVX2 (preferible) o SSE4.1; el binario se elige leyendo `/proc/cpuinfo`. La búsqueda se ejecuta con 2 hilos por defecto.
- **Memoria RAM**: no disponible; depende del tamaño de la base de datos MMseqs2 en `db/`, que la model card no cuantifica. El índice de k-mers se construye en tiempo de ejecución, por lo que hay un coste adicional de memoria y tiempo en el primer arranque de cada ejecución.
- **Disco**: 0,1 GB para el repositorio completo (binarios, base de datos y pesos).
- **GPU recomendadas**: ninguna. No es desplegable en A100, H100 ni RTX 4090 con beneficio alguno.
- **Opciones de despliegue**: ejecución directa de `predict.py` en Python; contenedores Docker sin red; no aplican vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. Existe un guardia de tiempo en `predict.py`, pero su umbral no se documenta; el coste dominante será la búsqueda MMseqs2 frente al tamaño de la base de datos.

## Comparativa con modelos similares

No se dispone de datos verificables de parámetros, contexto ni rendimiento de alternativas en la información proporcionada; las filas cuantitativas se marcan como no disponibles. La comparación es, por tanto, estructural.

| Alternativa | Tipo | Enfoque | Requiere GPU | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `Legend7001/ec-homology-v7` | Recuperación MMseqs2 + reranker supervisado | Transferencia por homología con desambiguación entre ECs hermanos | No | No disponible en la model card (MMseqs2 empaquetado GPLv3) | No publicados |
| MMseqs2 *best hit* sin reranking | Recuperación pura | Asignar el EC del hit de mayor bitscore | No | GPLv3 (herramienta) | No disponible |
| BLASTp *best hit* | Recuperación pura | Transferencia por homología con alineamiento local | No | Dominio público (NCBI) | No disponible |
| Predictores profundos de EC (familia de modelos tipo CLEAN, DeepEC) | Red neuronal | Aprendizaje de representaciones proteicas + clasificación multietiqueta | Sí, habitualmente | Variable según modelo | No disponible en esta búsqueda |

Diferencias cualitativas relevantes: frente a un *best hit* puro, este artefacto añade una etapa supervisada que compite ECs hermanos entre sí usando solo evidencia de homología; frente a los predictores profundos, renuncia al aprendizaje de representaciones y a la anotación multi-EC a cambio de ejecución en CPU y de un coste de disco de 0,1 GB.

## Limitaciones y advertencias

- **Etiqueta única**: solo se puntúa el primer EC, así que no se cubren enzimas con múltiples actividades ni anotaciones EC completas de cuatro niveles cuando el primer EC no es el relevante.
- **Dependencia total de la base de datos**: sin hit homólogo no hay señal; la predicción cae al EC de respaldo de `baseline.json`. No hay capacidad de generalizar a familias enzimáticas ausentes del conjunto de entrenamiento.
- **Riesgo de error por homología remota**: la transferencia de EC desde hits de baja identidad puede asignar una actividad incorrecta dentro de la misma familia; el reranker mitiga pero no elimina este caso.
- **Sin métricas publicadas**: no hay accuracy, F-max ni curvas de precisión/recall en la model card, por lo que el rendimiento real en un dominio distinto al de entrenamiento es desconocido.
- **Licencia no declarada**: la model card no especifica licencia de los pesos ni del código propio. El binario MMseqs2 incluido es GPLv3, lo que condiciona la redistribución del paquete; el vocabulario ExPASy ENZYME es CC BY 4.0 y exige atribución. Antes de uso comercial hay que aclarar ambos extremos con el autor.
- **Sin validación comunitaria**: cero descargas y cero *likes*, proyecto de curso (DA3410), sin revisión por pares ni réplica independiente.
- **Riesgo de fuga residual no verificable**: el esquema *out-of-fold* con agrupado al 40 % de identidad está descrito, pero no se aportan resultados que lo respalden ni se documenta el tamaño del conjunto de test.
- **Restricciones de entorno**: requiere x86-64 con AVX2 o SSE4.1; no hay soporte declarado para ARM. La inferencia asume que se puede leer `/proc/cpuinfo` y que no se escribe en `/tmp`.
- **Idioma y sesgo**: al operar sobre secuencias, los sesgos relevantes son de composición del dataset (linajes taxonómicos sobrerrepresentados), no lingüísticos; la model card no documenta la composición del conjunto de entrenamiento.
- **Mantenimiento**: el vocabulario EC está fijado a la release 02-09-2026; clasificaciones nuevas o reclasificaciones posteriores de ExPASy no se reflejarán sin regenerar los JSON de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Legend7001/ec-homology-v7
- Referencia de MMseqs2 citada en la model card: Steinegger y Söding, *Nature Biotechnology* 2017 (GPLv3); enlace directo no disponible en la información proporcionada.
- Vocabulario EC citado en la model card: ExPASy ENZYME, release 02-09-2026, SIB (CC BY 4.0); enlace directo no disponible en la información proporcionada.
- Resultados de búsqueda web no específicos sobre este artefacto, incluidos solo por trazabilidad:
  - Lista de software de predicción de estructura proteica: https://en.wikipedia.org/wiki/List_of_protein_structure_prediction_software
  - Prostruc, herramienta de predicción de estructura 3D: https://www.frontiersin.org/journals/chemistry/articles/10.3389/fchem.2024.1509407/full
  - Revisión sobre modelado por homología: https://www.sciencedirect.com/science/article/pii/S2001037020304748
