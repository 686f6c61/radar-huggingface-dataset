# pretrain-model-storage-nobody/Ling-3.0-tiny-CSA-Engram-1M-CPT

## Resumen

`Ling-3.0-tiny-CSA-Engram-1M-CPT` es un checkpoint experimental de preentrenamiento continuado (continued pretraining, CPT) publicado por el usuario `pretrain-model-storage-nobody` sobre el modelo base `inclusionAI/Ling-3.0-tiny-base` (revisión `bab7297fa02713af237e378bf21107718b8e0e1a`). No se trata de un modelo listo para usar: la propia model card lo describe como el destino público de una ejecución de entrenamiento en curso, donde la mera creación del repositorio no demuestra que el entrenamiento haya comenzado ni que se haya alcanzado ningún objetivo de throughput. El repositorio ocupa 545,5 GB e incluye pesos densos, estado de Adam, buffers, RNG, cursor de datos y las filas de Engram actualizadas hasta la fecha.

La receta modifica la arquitectura del modelo base: mantiene 24 capas y las rutas KDA preentrenadas, añade atención comprimida y dispersa (CSA, *compressed and sparse attention*) y una tabla Engram hasheada de aproximadamente 72.000 millones de escalares de consulta (*lookup scalars*), y entrena entradas empaquetadas de 1.048.576 tokens. Seis capas (3, 7, 11, 15, 19 y 23) actúan como propietarias de memoria de atención completa, construyendo bancos MLA comprimidos y solapados, bancos/escalas FP8 reutilizables y un ranking de bloques crudos ordenado; los tripletes KDA consumidores leen esa memoria fija.

Su relevancia es puramente de investigación: explora atención dispersa a nivel de bloque con factor de compresión 8, tablas de memoria Engram de escala muy superior a los parámetros densos del modelo, entrenamiento en FP8 con maestros FP32 y políticas de checkpointing/resume con partición en ocho rangos. No es un directorio compatible con `transformers.from_pretrained`, no publica benchmarks y no declara licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas KDA preentrenadas preservadas, atención comprimida y dispersa (CSA) con bancos MLA comprimidos/solapados, SWA64 y memoria Engram hasheada; 24 capas |
| Parametros totales | no disponible (la model card no declara el recuento de parámetros densos) |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | 1.048.576 tokens (entradas empaquetadas de entrenamiento); contexto de inferencia no documentado |
| Tipos de cuantizacion | FP8 en pesos y activaciones con maestros FP32 y acumulaciones estables; cuantización de KV preparada para los consumidores. No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (los datos incluyen `glotcc-quality-subset`, de naturaleza multilingüe, pero no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | Checkpoints PyTorch propios (pesos densos + estado Adam + buffers + RNG + cursor de datos + filas Engram), no compatibles con `from_pretrained`; sin safetensors ni GGUF publicados |
| Tamano del repositorio | 545,5 GB |
| Tabla Engram | ~72.000 millones de escalares de lookup hasheados (dato de la model card; no equivale a parámetros densos) |
| Particion requerida | Ocho rangos (*eight-way table partition*) para restaurar checkpoints |
| Precisión de entrenamiento | FP8 con maestros FP32 y momentos Adam FP32 (en CPU o en *owners*) |

## Arquitectura y entrenamiento

La arquitectura parte de `Ling-3.0-tiny-base` conservando el orden de capas y las rutas KDA preentrenadas. Sobre esa base se añaden seis propietarios de memoria de atención completa en las capas 3, 7, 11, 15, 19 y 23; cada uno construye bancos MLA crudos y comprimidos solapados, bancos y escalas FP8 reutilizables, y un ranking ordenado de bloques crudos. Los tripletes KDA siguientes leen esa memoria fija en el orden: vecindades comprimidas, disperso crudo y comprimido exacto, con proyecciones de query y output independientes. El triplete KDA inicial emplea una memoria de arranque distinta derivada de los embeddings iniciales normalizados por `block3.norm1`, compartiendo los parámetros productores del bloque 3; el resultado son siete construcciones de memoria y seis propietarios de parámetros por *forward*. Las closures de checkpoint siguen esos grupos de propiedad y los gradientes de los consumidores se acumulan en los bancos propietarios.

La unidad de indexación es el bloque canónico de 8 tokens crudos: el bloque *b* mapea a la entrada comprimida `C[b+1]`, cuya ventana contiene los bloques *b* y *b+1*. Se impone causalidad de ventana completa y fronteras de documento, incluidas las ventanas iniciales ausentes. Las vecindades visitan los desplazamientos `[-3,-2,-1,0,1,2,3,4]` alrededor de cada centro rankeado, eliminan duplicados y se detienen en el presupuesto explícito de entradas únicas; se registran cuatro presupuestos de recuperación distintos, y la model card advierte que los presupuestos de la configuración fuente son objetivos de perfilado, no prueba de equilibrio de latencia. SWA64 es independiente y lee el banco crudo compartido. Las rutas matriciales usan FP8 con maestros FP32; la cuantización de KV y la redistribución de propietarios se comparten entre consumidores.

En datos, se planifican dos épocas barajadas de forma determinista sobre `storagestuffnobody/finepdf-subsampled-cleaned`, `storagestuffnobody/stories`, `stack-v3.1-subsampled` y `stack-v3.1-subsampled-part2`, y `glotcc-quality-subset`. AO3 aporta dos vistas (generación de historias y predicción de etiquetas) con el condicionamiento enmascarado de la pérdida, y los documentos empaquetados mantienen estado independiente de atención, KDA, Engram y compresor. No se mencionan RLHF, DPO ni ajuste por instrucciones. En infraestructura destacan: offload de momentos Adam FP32 a CPU entre actualizaciones, una variante `launch_full_training_owned.sh` que mantiene los momentos en propietarios deterministas entre los ocho rangos y difunde los maestros actualizados, un helper de backward de FLA protegido por hash de fuente que libera tensores muertos (reducción de pico aislado de 4,5 GiB con salidas y gradientes idénticos bit a bit) y una caché inmutable de IDs int32 rankeados con presupuesto de 2 GiB por ejecución de checkpoint.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje sobre entradas de hasta 1.048.576 tokens empaquetados, con atención independiente por documento.
- Recuperación de contexto largo mediante atención dispersa por bloques con ventanas causales completas y presupuestos de recuperación configurables.
- Memoria Engram: recuperación por hash sobre una tabla de ~72.000 millones de escalares, con reconstrucción determinista de las filas no entrenadas.
- Predicción de etiquetas y generación de historias sobre el corpus AO3, en dos vistas separadas con condicionamiento enmascarado.
- Capacidad multilingüe potencial derivada de `glotcc-quality-subset`; no se documenta cobertura lingüística.
- No se documenta soporte de *tool calling*, *function calling*, agentes, modo *thinking*, visión ni audio.
- No se documenta plantilla de chat ni comportamiento instruccional: es un checkpoint de preentrenamiento, no un modelo alineado.
- Capacidad de checkpoint/resume determinista: snapshots independientes con pesos, Adam, buffers, RNG, cursor de datos y filas Engram, restaurables con `Checkpoints.restore` del código incluido.

## Casos de uso

- **Investigación en atención dispersa a nivel de bloque**: reproducir la pila CSA (bloques de 8 tokens, factor de compresión 8, vecindades de offsets fijos y cuatro presupuestos de recuperación) para medir la relación entre presupuesto de recuperación y calidad, aprovechando que la card documenta explícitamente los top-k y el layout por snapshot.
- **Estudio de tablas de memoria tipo Engram**: analizar el coste y el beneficio de una tabla hasheada de ~72.000 millones de escalares frente a parámetros densos, incluyendo la reconstrucción determinista de filas no tocadas y la validación contra huellas de inicialización.
- **Evaluación de contexto de 1M tokens**: probar recuperación de información y coherencia en ventanas de 1.048.576 tokens con documentos empaquetados, verificando que se respetan las fronteras de documento y la causalidad de ventana completa.
- **Ingeniería de infraestructura de entrenamiento**: validar políticas de memoria (momentos Adam en CPU frente a *owners*, presupuesto de 2 GiB de IDs int32, helper de backward de FLA con 4,5 GiB de ahorro de pico) y los tests multi-GPU de actualización múltiple y snapshot/resume.
- **Reproducibilidad de pipelines de datos**: reutilizar los contratos de preparación (hashes de formato, batch y snapshots de fuente) con `finepdf-subsampled-cleaned`, `stories`, `stack-v3.1-subsampled`, `stack-v3.1-subsampled-part2` y `glotcc-quality-subset` para estudiar mezclas de dos épocas deterministas.
- **Preentrenamiento continuado de dominio**: partir de un snapshot completo para CPT sobre corpus propios con licencia clara, teniendo en cuenta que hace falta el código de restauración y la partición en ocho rangos, no `from_pretrained`.
- **Investigación en estabilidad FP8**: usar la configuración FP8 con maestros FP32 para estudiar degradación numérica en rutas matriciales y acumulaciones estables en un modelo de 24 capas con contexto de 1M.
- **Análisis de vistas con condicionamiento enmascarado**: estudiar el esquema de AO3 (misma vista de capítulo completo en ambas vistas, condicionamiento fuera de la pérdida pero conservado como entrada real) como técnica de entrenamiento multitarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones de contexto largo, y advierte que la memoria y el throughput en tiempo de ejecución "still require the recorded full-model measurements"; los presupuestos de recuperación citados son objetivos de perfilado, no mediciones de latencia equilibrada.

## Requisitos de hardware

- **VRAM de inferencia**: no disponible. No se declara el número de parámetros densos ni se publican scripts de inferencia; el repositorio de 545,5 GB incluye estado de optimizador y snapshots, por lo que no equivale al peso del modelo en memoria.
- **GPU recomendadas para entrenamiento**: ocho rangos (partición de tabla de ocho vías), con FP8 y maestros FP32 en GPU; el estado Adam puede residir en CPU o en los *owners* de los ocho rangos. No se especifican modelos concretos (A100, H100, etc.).
- **GPU de consumo**: no hay evidencia de que el modelo completo quepa en una GPU de consumo; el checkpoint requiere restauración con partición de ocho vías y runtime compatible registrado.
- **Despliegue**: no se soportan vLLM, llama.cpp, Ollama ni TGI de forma directa, porque el checkpoint no es un directorio `from_pretrained` válido y requiere el código incluido (`Checkpoints.restore`). No hay pesos GGUF ni safetensors publicados.
- **Almacenamiento**: 545,5 GB de repositorio; cada snapshot completo es independiente de los anteriores, lo que multiplica el espacio necesario.
- **Latencia y throughput**: no disponibles. Solo se documenta una reducción de pico de memoria de 4,5 GiB en un test aislado con entradas de 1M (empaquetadas y no empaquetadas, con salidas y gradientes idénticos bit a bit).

## Comparativa con modelos similares

No se identifican en la información proporcionada alternativas públicas comparables que combinen atención comprimida/dispersa con tablas Engram de esta escala. La única referencia documentada es el modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling-3.0-tiny-CSA-Engram-1M-CPT | no disponible | 1.048.576 tokens (entrenamiento) | no disponible | Repo PyTorch de 545,5 GB, no compatible con `from_pretrained` |
| inclusionAI/Ling-3.0-tiny-base (revisión `bab7297f...`) | no disponible | no disponible | no disponible | Modelo base público en HuggingFace |
| Alternativas con CSA + Engram | no disponible | no disponible | no disponible | No se han encontrado en la información disponible |

## Limitaciones y advertencias

- **No es un modelo desplegable**: la model card indica explícitamente que el checkpoint no es un directorio `from_pretrained` de Transformers; la restauración exige la partición original de ocho vías y un runtime compatible registrado.
- **Entrenamiento en curso**: el repositorio es un destino público de una ejecución inacabada; los snapshots `indexer-warmup/step-*` solo entrenan los seis indexers contra el modelo congelado y no avanzan el cursor principal de dos épocas. Los snapshots completos solo aparecen tras commitear los ocho shards y el estado denso del optimizador, y la publicación es asíncrona.
- **Sin benchmarks ni métricas de calidad**: no hay evidencia publicada de rendimiento, por lo que no puede recomendarse para producción.
- **Licencia no declarada**: la ausencia de licencia impide asumir derechos de uso comercial; hay que contactar con el autor antes de cualquier uso.
- **Riesgo de alucinación**: al ser un modelo de preentrenamiento sin alineación documentada (no se mencionan RLHF, DPO ni instrucciones), la generación puede ser incoherente o factualmente incorrecta y no sigue instrucciones de forma fiable.
- **Idioma y sesgos**: no se declara lista de idiomas ni evaluación de sesgos; el corpus incluye datos web (`stack-v3.1`, `finepdf`, `glotcc`) y fanfiction de AO3, con los sesgos y contenido sensible que ello implica.
- **Coste de almacenamiento y cómputo**: 545,5 GB de repositorio, snapshots independientes entre sí y entrenamiento sobre ocho rangos con FP8; la reproducción requiere infraestructura de varios nodos o GPUs de alta gama.
- **Detalles no verificados**: los presupuestos de recuperación son objetivos de perfilado; las mediciones reales de memoria y throughput del modelo completo siguen pendientes según la propia card.
- **Complejidad operativa**: conviven dos políticas de almacenamiento mutuamente excluyentes (`launch_full_training_owned.sh` frente al lanzador con offload en CPU) y los flags deben coincidir entre rangos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pretrain-model-storage-nobody/Ling-3.0-tiny-CSA-Engram-1M-CPT
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
- Revisión del modelo base citada: `bab7297fa02713af237e378bf21107718b8e0e1a`
- Datasets citados en la model card (identificadores, sin URL directa en la información disponible): `storagestuffnobody/finepdf-subsampled-cleaned`, `storagestuffnobody/stories`, `stack-v3.1-subsampled`, `stack-v3.1-subsampled-part2`, `glotcc-quality-subset`
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada
