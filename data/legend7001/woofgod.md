# Legend7001/woofgod

## Resumen

`Legend7001/woofgod` no es un modelo de lenguaje: es un pipeline de clasificación de enzimas presentado a la tarea `leak-curber-enzyme-classification` del leaderboard Leak CURBER. Su función es asignar números EC (Enzyme Commission) a secuencias proteicas combinando una búsqueda de homología con DIAMOND v2.1.10 contra las 186.488 secuencias únicas del `train.parquet` proporcionado y un re-ranker supervisado de árboles con gradient boosting que puntúa las EC candidatas.

El sistema no entrena ninguna red neuronal profunda: las candidatas se generan por votos ponderados de bitscore y se reordenan con 33 características por candidata (identidad, cobertura, e-value, apoyo en el top-10 y top-50, acuerdo en los niveles L1/L2/L3 de la jerarquía EC, frecuencia de la EC y fiabilidad out-of-fold de la EC). El re-ranker se exporta a numpy puro en `weights/ranker.npz`, de modo que la inferencia no requiere scikit-learn en tiempo de ejecución.

Es relevante porque documenta ingeniería de robustez poco habitual en envíos de leaderboard: adaptación a `RLIMIT_FSIZE` (16 MiB), `RLIMIT_NOFILE` (256 descriptores), reintentos con batching de 8.000 consultas y un fallback en numpy/scipy (TF-IDF de 3-meros) si DIAMOND no puede ejecutarse. El repositorio ocupa 0,2 GB y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline bioinformatico: busqueda por homologia con DIAMOND v2.1.10 + re-ranker de gradient boosting (scikit-learn HistGradientBoosting exportado a numpy en `weights/ranker.npz`); no es un transformer |
| Parametros totales | no disponible (el autor no publica el recuento de nodos/hojas del ensemble) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: secuencias proteicas individuales; 50 hits por busqueda) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales que cuantizar) |
| Idiomas soportados | no disponible / no aplica (entrada de proteinas, no texto) |
| Licencia | no disponible |
| Formato de pesos | `ranker.npz` (numpy); codigo Python (`predict.py`, `kmer_knn.py`); binarios DIAMOND en `bin/` y `bin/diamond-linux64.tar.gz` |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es una cascada de dos etapas. La primera es una busqueda de homologia: cada entrada unica se compara con las 186.488 secuencias de entrenamiento mediante DIAMOND (`blastp --very-sensitive`, 50 hits); las consultas sin hit o con mejor hit de identidad <= 30% se rebuscan con `--ultra-sensitive`, y esta segunda pasada solo se ejecuta si la primera termina en menos de 215 s (watchdog global a 420 s). La segunda etapa es un re-ranker supervisado: cada EC candidata derivada de los hits recibe 33 caracteristicas (pesos de voto bitscore^1, ^4 y ^8; identidad, cobertura y e-value del mejor hit de soporte; apoyo en top-10 y top-50; acuerdo en L3, L2 y L1 de la jerarquia EC; frecuencia de la EC; dificultad a nivel de consulta; y fiabilidad out-of-fold de la EC) y un `HistGradientBoosting` la puntua, colocando la mejor en primera posicion.

El entrenamiento del re-ranker se disena para evitar fuga de datos. Las secuencias de entrenamiento se agrupan por identidad al 50% (`diamond cluster`) y los clusters se dividen en 15 folds; cada fold se busca contra los otros 14, imitando el conjunto de validacion oficial (identidad mediana del mejor hit a train: 44%). El resultado son 434.000 filas de candidatas procedentes de 181.000 consultas, con las caracteristicas de fiabilidad de EC calculadas siempre out-of-fold. No se usan datos etiquetados externos: solo el `train.parquet` provisto. No se documenta RLHF, DPO ni decodificacion especulativa, por tratarse de un problema de clasificacion, no de generacion.

## Capacidades

- Clasificacion de enzimas a nivel L4 de la jerarquia EC (prediccion principal), con senales explicitas de consenso en los niveles L3, L2 y L1.
- Busqueda de homologia proteica sensible (`--very-sensitive`) y extra-sensible (`--ultra-sensitive`) contra un corpus de referencia de 186.488 secuencias.
- Puntuacion aprendida de candidatas mediante 33 caracteristicas por EC, incluyendo fiabilidad historica out-of-fold de cada EC.
- Ejecucion bajo limites estrictos de sandbox: adaptacion a `RLIMIT_FSIZE` (16 MiB), `RLIMIT_NOFILE` (256), `RLIMIT_NPROC` (128) y `RLIMIT_STACK` (10 MB), con batching de hasta 8.000 consultas, reintentos por "Too many open files", division de lote por SIGXFSZ y `--bin 128`.
- Fallback de clasificacion en numpy/scipy mediante TF-IDF de 3-meros y vecino mas cercano (`kmer_knn.py`) si DIAMOND no puede ejecutarse.
- Diagnostico de entorno registrado en `predict.py`: flags de CPU, memoria, limites de proceso y puntos de montaje.
- Smoke test de los binarios DIAMOND (release oficial y build estatico generico `-march=x86-64`) con registro de la senal en caso de caida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso generativo, vision, audio ni generacion de texto.

## Casos de uso

- Anotacion funcional a gran escala de proteomas o metagenomas: el pipeline procesa 11.367 entradas en unos 4,5 minutos sobre 2 vCPU, por lo que puede ejecutarse sobre lotes de decenas de miles de secuencias sin GPU y con un coste de computo muy bajo.
- Curado de bases de datos de enzimas: el re-ranker prioriza la EC mas probable y aporta acuerdo en L1/L2/L3, lo que permite marcar automaticamente anotaciones consistentes en la jerarquia y enviar a revision solo las discrepancias entre niveles.
- Clasificacion en entornos con recursos restringidos o sandboxes de evaluacion: el manejo explicito de `RLIMIT_FSIZE` y `RLIMIT_NOFILE` con reintentos y batching lo hace apto para plataformas que imponen limites duros de fichero y descriptores.
- Control de calidad de anotaciones existentes: la fiabilidad out-of-fold de cada EC actua como indicador de confianza, util para detectar asignaciones de EC raras o nunca vistas en el corpus de referencia.
- Pipeline de respaldo en entornos sin DIAMOND: cuando la busqueda por homologia no esta disponible (arquitectura no soportada, binario bloqueado), `kmer_knn.py` sigue produciendo predicciones con un L4 aproximado de 0,39.
- Referencia metodologica para participantes de leaderboards con fuga de datos: el esquema de clustering al 50% con 15 folds y caracteristicas calculadas out-of-fold es replicable como plantilla de validacion honesta en tareas de clasificacion biologica.
- Priorizacion de candidatas para validacion experimental: al ordenar las EC por puntuacion del ensemble, se puede seleccionar un subconjunto pequeno de proteinas con alta confianza para ensayos de caracterizacion enzimatica.

## Benchmarks y rendimiento

Resultados locales declarados por el autor, sobre clusters held-out y restringidos a consultas con mejor hit por debajo del 58% de identidad (metrica L4):

| Sistema | L4 |
|---|---|
| Voto de vecino mas cercano (v1) | 0,787 |
| Voto + re-ranker aprendido (v2) | 0,806 |
| Fallback TF-IDF de 3-meros (`kmer_knn.py`) | ~0,39 |

No se han publicado resultados de benchmarks en la informacion disponible para el conjunto de validacion oficial del leaderboard, ni metricas MMLU, HumanEval o GSM8K (no aplicables a esta tarea). El autor indica que cerca del 5% de las consultas held-out tienen una EC que nunca aparece en entrenamiento, lo que acota el maximo alcanzable con este corpus.

## Requisitos de hardware

- VRAM: no se requiere GPU; la inferencia es CPU-only (DIAMOND + numpy/scipy).
- CPU: el autor reporta ejecuciones completas sobre 2 vCPU; los limites de prueba se validaron con `ulimit -f 16384 -n 256 -u 128 -s 10240`.
- Memoria: no disponible de forma explicita; el pipeline registra memoria disponible en el log de diagnostico.
- GPU recomendadas: no aplica (no hay soporte CUDA ni requisitos de acelerador).
- Compatibilidad con GPU de consumo: irrelevante; el cuello de botella es el binario DIAMOND y los limites de ficheros/descriptores del entorno.
- Opciones de despliegue: ejecucion directa de `predict.py`; contenedor Docker (el `Dockerfile` extrae `bin/diamond-linux64.tar.gz` en build time y `predict.py` lo extrae a `/tmp` si falta). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: aproximadamente 4,5 minutos para 11.367 entradas de validacion sobre 2 vCPU; en torno a 300 s bajo los limites del sandbox (unos 0,024 s por consulta); modos de busqueda mas rapidos se activan automaticamente para entradas mucho mayores.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de terceros (ni modelos de lenguaje ni clasificadores de EC alternativos). La comparacion disponible es interna al propio envio:

| Sistema | Tipo | Parametros | Contexto | L4 local | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| v2 (DIAMOND + re-ranker) | Homologia + GBDT | no disponible | no aplica | 0,806 | no disponible | repo publico, 0 descargas |
| v1 (voto de vecino) | Homologia + voto ponderado | no disponible | no aplica | 0,787 | no disponible | incluido en el mismo repo (baseline) |
| `kmer_knn.py` (fallback) | TF-IDF 3-meros + kNN | no disponible | no aplica | ~0,39 | no disponible | incluido en el mismo repo |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no admite prompts, tool calling, agentes ni conversacion; cualquier uso fuera de clasificacion de proteinas es invalido.
- Dependencia critica de la disponibilidad de homologos: las consultas sin hit relevante dependen del fallback k-mer, con una caida de rendimiento de 0,806 a ~0,39 en L4.
- Techo estructural del corpus: cerca del 5% de las consultas held-out tienen una EC ausente en entrenamiento, por lo que no pueden acertarse con este enfoque.
- Sesgo hacia ECs frecuentes: las caracteristicas incluyen frecuencia de EC y fiabilidad out-of-fold, lo que puede favorecer clases mayoritarias y penalizar enzimas raras.
- No determinismo practico: la segunda pasada `--ultra-sensitive` solo se ejecuta si la primera termina en menos de 215 s, de modo que el resultado puede variar segun la carga y el hardware del entorno.
- Ausencia de licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni modificacion; el uso en produccion requiere aclaracion legal previa.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ausencia de resultados en el conjunto de validacion oficial; las cifras L4 son locales y autodeclaradas.
- Metadatos anomalos: la fecha de creacion registrada (2026-10-27) es posterior a la de elaboracion de esta ficha, lo que impide verificar la trazabilidad temporal del envio.
- Dependencia de binarios externos: el pipeline descarga/extrae la release oficial de DIAMOND; un fallo de extraccion o un binario incompatible degrada silenciosamente al fallback de menor precision.
- Sin documentacion sobre sesgos poblacionales o taxonomicos del corpus de entrenamiento (composicion por especie, reino o familia enzimatica no disponible).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Legend7001/woofgod
- Tarea del leaderboard: `leak-curber-enzyme-classification` (no se proporciona URL directa)
- DIAMOND v2.1.10 (release oficial referenciada en `bin/diamond-linux64.tar.gz`): no se proporciona URL en la informacion disponible
- Paper, blog, demo o repositorio adicional: no disponible
