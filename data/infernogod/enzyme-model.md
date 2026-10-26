# infernogod/enzyme-model

## Resumen

`infernogod/enzyme-model` es una submission para la tarea `leak-curber-enzyme-classification`, cuyo objetivo es asignar números EC (Enzyme Commission) a secuencias proteicas. No es un modelo de lenguaje ni una red neuronal: es un pipeline de clasificación biológica que combina búsqueda de homología con DIAMOND v2.1.10 sobre las 186.488 secuencias únicas de `train.parquet` y un re-ranker supervisado de árboles con gradient boosting (scikit-learn `HistGradientBoosting`) exportado a numpy puro.

El sistema resuelve el problema de transferir anotaciones EC desde vecinos homólogos sin filtrar información del conjunto de validación. Para ello, el autor agrupa las secuencias de entrenamiento por identidad al 50 % (`diamond cluster`), divide en 15 folds y busca cada fold contra los otros 14, imitando la distribución de validación oficial (identidad mediana del mejor hit del 44 %). El resultado son 434.000 filas candidatas generadas a partir de 181.000 queries, y las features de fiabilidad EC se calculan siempre out-of-fold.

Su relevancia es acotada y muy específica: es una pieza de ingeniería para un leaderboard concreto, con 0 descargas y 0 likes en el momento de la consulta, licencia no declarada y un repositorio de 0,2 GB. Resulta interesante por dos motivos técnicos: el diseño anti-leakage del re-ranker y la robustez del pipeline bajo restricciones duras de recursos (límite de 16 MiB por fichero, watchdog de 420 s, fallback en numpy). No hay información pública sobre arquitectura neuronal, parámetros ni benchmarks estándar de LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline en dos etapas: búsqueda de homología con DIAMOND v2.1.10 (`blastp`) + re-ranker de árboles con gradient boosting (`HistGradientBoosting`) exportado a numpy |
| Parámetros totales | No disponible (no se publica el recuento de nodos/hojas del ensemble; los pesos están en `weights/ranker.npz`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de contexto); acepta secuencias proteicas y no se documenta límite de longitud |
| Tipos de cuantización | No aplica (no se distribuyen pesos neuronales ni versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No aplica (opera sobre secuencias de aminoácidos, no sobre texto) |
| Licencia | No disponible |
| Formato de pesos | `weights/ranker.npz` (numpy) + binarios de DIAMOND v2.1.10 (`bin/diamond-linux64.tar.gz`, release oficial) + fallback `kmer_knn.py` |
| Tarea | Clasificación enzimática jerárquica EC (niveles L1–L4) |
| Entrada / salida | Secuencias proteicas / número EC predicho (el mejor candidato reordenado) |
| Datos de entrenamiento | Solo `train.parquet` proporcionado: 186.488 secuencias únicas; sin datos etiquetados externos |
| Features por candidato | 33 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fechas | Creado 2026-10-25T06:41:16Z; actualizado 2026-10-25T20:13:18Z |

## Arquitectura y entrenamiento

La primera etapa es una búsqueda de homología exhaustiva: cada entrada única se compara contra las 186.488 secuencias de entrenamiento con DIAMOND v2.1.10 en modo `blastp --very-sensitive`, recuperando 50 hits. Las entradas sin hit o con mejor hit de identidad igual o inferior al 30 % se reintentan con `--ultra-sensitive`, pero solo si el presupuesto temporal lo permite claramente, de modo que la segunda pasada es oportunista y no garantizada.

De los hits se derivan los candidatos EC y, para cada candidato, 33 features: pesos de voto con `bitscore` elevado a 1, 4 y 8; identidad, cobertura y e-value del mejor hit de soporte; soporte dentro de los 10 y los 50 mejores hits; acuerdo en los niveles L3, L2 y L1 de la jerarquía EC; frecuencia del EC; dificultad a nivel de query; y fiabilidad out-of-fold del EC (con qué frecuencia ese EC fue correcto cuando se propuso). El re-ranker es un `HistGradientBoosting` de scikit-learn que puntúa cada candidato y coloca el mejor primero.

El diseño anti-leakage es el elemento más cuidado: clustering a identidad del 50 %, partición en 15 folds y búsqueda de cada fold contra los otros 14, lo que reproduce la validación oficial (identidad mediana del mejor hit a train del 44 %). Eso genera 434.000 filas candidatas desde 181.000 queries, con las features de fiabilidad EC calculadas siempre fuera de fold. No se documenta uso de RLHF, DPO ni ningún ajuste por preferencias: es aprendizaje supervisado clásico sobre features tabulares.

## Capacidades

- Clasificación EC jerárquica: predice el número EC completo (L4) y las features incorporan acuerdo explícito en los niveles L3, L2 y L1.
- Transferencia de anotación por homología: infiere la función enzimática a partir de similitud de secuencia, sin necesidad de alineamientos múltiples ni perfiles HMM.
- Re-ranking aprendido: reordena candidatos procedentes de hits con un ensemble de árboles, en lugar de usar un voto por vecino más cercano.
- Gestión de casos difíciles: segunda pasada `--ultra-sensitive` para entradas sin hit o con identidad muy baja.
- Robustez bajo límites de recursos: `--bin 256` para fragmentar los ficheros temporales de seed-hits, lotes de como máximo 12.000 queries y reintento dividiendo en cuatro cualquier lote que choque con el límite.
- Degradación controlada: si DIAMOND no puede ejecutarse, `kmer_knn.py` (TF-IDF de 3-mers con numpy/scipy) predice todas las entradas.
- Diagnóstico de entorno: `predict.py` registra flags de CPU, memoria, límites de proceso y montajes; prueba de humo de cada binario antes de usarlo (primero el release oficial, luego una build estática genérica `-march=x86-64`) con log de la señal en caso de caída.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Anotación funcional de metagenomas: dado un conjunto de proteínas predichas de un ensamblado, el pipeline asigna EC por transferencia de homología en minutos sobre 2 vCPU, lo que encaja en flujos de anotación por lotes donde no hay GPU disponible.
- Curado de bases de datos enzimáticas: usar el re-ranker para priorizar candidatos con alto soporte entre los 10 y 50 mejores hits y descartar asignaciones con acuerdo débil en L1/L2, reduciendo la cola de revisión manual.
- Triaje en pipelines de bioinformática: colocar el modelo como primera etapa para separar proteínas con homología clara (identidad alta, e-value bajo) de las que requieren herramientas más costosas como perfiles HMM o métodos de deep learning.
- Priorización de enzimas de interés industrial: buscar proteasas, lipasas o celulasas en genomas no caracterizados y ordenar candidatos por EC y fiabilidad out-of-fold antes de expresar y ensayar.
- Detección de límites de cobertura: el propio sistema identifica consultas sin hit o con identidad inferior al 30 %, señalando qué proteínas son candidatas a enzimas noveles que no pueden resolverse por homología y necesitan análisis estructural.
- Evaluación de pipelines bajo restricciones: útil como referencia reproducible en entornos con `RLIMIT_FSIZE` de 16 MiB y sin aceleración hardware, ya que el autor verifica que la salida bajo `ulimit -f 16384` es idéntica a la de una ejecución sin restricciones.
- Docencia y comparación de metodologías: sirve como ejemplo de diseño anti-leakage (clustering a 50 %, 15 folds, features out-of-fold) para enseñar cómo evitar fuga de información en tareas de anotación.
- Despliegue con contingencia: en clústeres donde DIAMOND falla por arquitectura o permisos, el fallback de 3-mers mantiene una predicción con aproximadamente 0,39 de L4, suficiente para no romper el pipeline.

## Benchmarks y rendimiento

Resultados locales declarados por el autor, sobre consultas con al menos un hit y con el mejor hit por debajo del 58 % de identidad (cluster-held-out):

| Método | L4 |
|---|---|
| Voto de vecino más cercano (v1) | 0,787 |
| + re-ranker aprendido (v2) | 0,806 |

| Escenario | Métrica | Valor |
|---|---|---|
| Fallback de 3-mers TF-IDF (`kmer_knn.py`) | L4 local | ~0,39 |
| Cobertura del conjunto held-out con EC ausente en train | proporción de queries | ~5 % (techo alcanzable) |
| Runtime de validación | 11.367 entradas en 2 vCPU | ~4,5 minutos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, ni comparaciones con otros sistemas de predicción EC sobre el mismo split oficial.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia neuronal ni pesos en GPU. El repositorio ocupa 0,2 GB en disco.
- CPU: el autor reporta unos 4,5 minutos para 11.367 entradas de validación con 2 vCPU, es decir, del orden de 42 entradas por segundo en ese hardware.
- GPU recomendadas: ninguna; el pipeline es puramente CPU (DIAMOND, scikit-learn, numpy/scipy).
- Cabe en cualquier equipo consumer: basta con 2 vCPU y espacio en disco para los binarios de DIAMOND y los ficheros temporales. No se especifica el pico de RAM.
- Límite duro de fichero: 16 MiB por fichero escrito (aplicado por el evaluador mediante `RLIMIT_FSIZE`); el pipeline lo respeta con `--bin 256`, lotes de hasta 12.000 queries y reintento partido en cuatro.
- Tiempo máximo por búsqueda: watchdog que detiene DIAMOND a los 420 s.
- Opciones de despliegue: ejecución directa con `predict.py`, o imagen Docker que extrae `bin/diamond-linux64.tar.gz` en tiempo de build; si el binario falta en runtime, `predict.py` lo extrae a `/tmp`.
- Latencia y throughput: no se documentan más allá del dato de validación; los modos de búsqueda más rápidos se activan automáticamente para entradas mucho mayores, pero el umbral no se especifica.

## Comparativa con modelos similares

| Sistema | Enfoque | Parámetros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| `infernogod/enzyme-model` | DIAMOND + re-ranker GBT | No disponible | No aplica | No disponible | L4 local 0,806 (held-out por clusters) |
| Herramientas de transferencia por homología tipo BLAST/DIAMOND con voto mayoritario | Alineamiento + voto | No aplica | No aplica | Variable según herramienta | En este repo, la versión sin re-ranker obtiene 0,787 de L4 |
| Predictores EC basados en deep learning (p. ej. arquitecturas con embeddings proteicos) | Red neuronal | No disponible | No aplica | Variable | No disponible en la información proporcionada |
| Anotadores por ontologías y perfiles (tipo HMM/perfiles de familias) | Perfiles probabilísticos | No aplica | No aplica | Variable | No disponible en la información proporcionada |

No se dispone de cifras comparativas verificadas frente a alternativas externas en el mismo conjunto de evaluación, por lo que la comparación cuantitativa queda limitada a la ablación interna v1 frente a v2.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial está permitido. Es un bloqueo potencial para producción.
- Sin tracción pública: 0 descargas y 0 likes en el momento de la consulta, con lo que no existe validación independiente del pipeline.
- Techo estructural de rendimiento: aproximadamente el 5 % de las queries held-out tienen un EC que no aparece en entrenamiento, y esos casos son irresolubles por homología con este diseño.
- Las métricas declaradas (0,787 y 0,806) son locales, calculadas por el propio autor y restringidas a consultas con al menos un hit; no equivalen al resultado del leaderboard oficial.
- Dependencia fuerte de DIAMOND: si el binario no funciona en el entorno, se degrada al fallback de 3-mers, que baja a ~0,39 de L4, menos de la mitad del rendimiento principal.
- La segunda pasada `--ultra-sensitive` es condicional al presupuesto temporal, así que la salida puede variar entre ejecuciones con distinto margen de tiempo.
- Sensibilidad a la composición de `train.parquet`: al usar exclusivamente los datos proporcionados, el modelo no generaliza a familias enzimáticas ausentes en ese fichero.
- Sin capacidades lingüísticas, de razonamiento general, tool calling ni multimodalidad; no debe evaluarse con los benchmarks habituales de LLM.
- Riesgo de asignación errónea por homología: proteínas con hits de baja identidad (≤30 %) o promiscuidad enzimática pueden recibir un EC incorrecto, y las features de fiabilidad mitigan pero no eliminan ese riesgo.
- Metadatos anómalos: las fechas de creación y actualización (25 de octubre de 2026) son posteriores a las habituales en el ecosistema; conviene verificar la procedencia del repositorio antes de integrarlo.
- No se documentan sesgos en el sentido estadístico habitual, pero sí un sesgo de composición derivado del conjunto de entrenamiento (186.488 secuencias) y de la cobertura taxonómica del mismo, que no se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infernogod/enzyme-model
- Tarea asociada: `leak-curber-enzyme-classification` (referenciada en la model card; no se proporciona URL directa)
- DIAMOND v2.1.10 (release oficial incluida en `bin/diamond-linux64.tar.gz`; referencia del proyecto en https://github.com/bbuchfink/diamond)
- scikit-learn `HistGradientBoosting`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingClassifier.html
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran ajenos al contenido técnico solicitado y se han descartado.
