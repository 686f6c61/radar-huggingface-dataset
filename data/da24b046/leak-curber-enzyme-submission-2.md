# da24b046/leak-curber-enzyme-submission-2

## Resumen

`da24b046/leak-curber-enzyme-submission-2` no es un modelo de lenguaje generativo, sino el artefacto de inferencia de una submission al benchmark Leak-CURBER (NeurIPS 2026), en su tarea de recuperación de enzimas: dado un SMILES de reacción exacto, el sistema devuelve un número EC completo permitido (por ejemplo, un identificador de cuatro niveles). Lo desarrolla el usuario `da24b046` y se apoya en la huella de reacción DRFP (Differential Reaction Fingerprint) combinada con un perceptrón multicapa supervisado.

La representación de entrada son 4.096 bits binarios de DRFP (radio 3, fragmentos de anillo, con contexto direccional activado), a los que se añaden dos huellas Morgan quirales de radio 2 de 2.048 bits cada una —una para reactivos y otra para productos—, resultando en 8.192 entradas. El clasificador es una MLP con anchuras ocultas [512, 256], ReLU, batch normalization y dropout de entrenamiento 0,2, con pérdida auxiliar L1/L2/L3 ponderada a 0,2 y entropía cruzada con objetivos suaves.

Su relevancia es doble: por un lado sirve como referencia reproducible y ligera (solo CPU, sin PyTorch en tiempo de inferencia, sin red) para la tarea de anotación enzimática; por otro, documenta con transparencia su protocolo de evaluación interna (split por reacción exacta, semilla 2202, 80/10/10), en el que la submission 2 alcanza un 63,3374 % de acierto fraccional en nivel L4 frente al 52,2370 % de la submission 1 sobre el mismo test local. El autor advierte explícitamente de que la puntuación oficial es desconocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) supervisado sobre huellas de reacción: DRFP de 4.096 bits + 2 huellas Morgan quirales de 2.048 bits (reactivos y productos) = 8.192 entradas; capas ocultas [512, 256]; clasificador L4 principal y cabezas auxiliares L1/L2/L3 |
| Parametros totales | no disponible (el autor no publica el recuento; la topología declarada es 8.192 → 512 → 256 → clasificador L4, con cabezas auxiliares) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica: la entrada es una única cadena de SMILES de reacción exacta, codificada en un vector de 8.192 bits |
| Tipos de cuantizacion | no disponible; los pesos se exportan en float32 NumPy (`weights/network.npz`) y no se documentan esquemas de cuantización |
| Idiomas soportados | no aplica (no hay entrada ni salida en lenguaje natural); no disponible |
| Licencia | no declarada en HuggingFace; el codificador DRFP 0.3.7 vendorizado es MIT (`DRFP_LICENSE.txt`); el vocabulario EC procede de ExPASy ENZYME, CC BY 4.0 |
| Formato de pesos | JSON (`weights/model.json`) + NPZ NumPy float32 (`weights/network.npz`); estadísticas de batch normalization plegadas en capas afines |
| Pipeline declarado en HuggingFace | no disponible (sin `pipeline_tag`) |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una red densa de dos capas ocultas con ReLU, batch normalization y dropout 0,2 aplicado solo en entrenamiento. La entrada combina la huella DRFP (4.096 bits binarios, radio 3, fragmentos con anillo, fragmentos enraizados en átomo, hidrógenos implícitos y contexto direccional activado) con dos huellas Morgan quirales de radio 2 de 2.048 bits, una para el conjunto de reactivos y otra para el de productos; los reactivos se combinan con los reactivos según la convención de DRFP original. Para la inferencia solo se conservan las capas ocultas y el clasificador L4 principal: las cabezas auxiliares y el código de entrenamiento no forman parte del paquete distribuido, y las estadísticas de batch normalization se pliegan en transformaciones afines para eliminar la dependencia de ese modo de ejecución.

El entrenamiento usa entropía cruzada con objetivos suaves, repartiendo la misma masa de probabilidad entre todos los EC distintos registrados para una misma reacción, más una pérdida auxiliar sobre los niveles L1/L2/L3 con peso 0,2. La partición local se hace por reacción exacta única (semilla 2202): 50.624 reacciones de entrenamiento, 6.328 de desarrollo y 6.328 de test; todas las etiquetas de una reacción permanecen juntas para evitar fuga de información. La selección de candidato y checkpoint se hace sobre la fracción L4 de desarrollo y después se puntúa el test. Los pesos finales se reajustan sobre el total de 63.280 reacciones únicas públicas de entrenamiento (96.966 pares reacción–EC) durante 67 épocas, por lo que no deben evaluarse sobre el test interno como si fuese un conjunto reservado. El codificador DRFP vendorizado es `fingerprint.py` de DRFP 0.3.7 sin modificar (SHA-256 `bdef66856b48205a881dc28946ac07d8a85be6a214d9f68c5520b2db57e9d9a9`), con un adaptador de caché acotada validado contra las huellas plegadas upstream.

## Capacidades

- Predicción de un número EC completo (nivel L4) a partir de un SMILES de reacción exacto, restringido al vocabulario de EC observados en los datos públicos de entrenamiento.
- Salidas intermedias por nivel jerárquico EC (L1, L2, L3) mediante cabezas auxiliares durante el entrenamiento; en el paquete de inferencia solo se distribuye el clasificador L4.
- Manejo de etiquetas múltiples por reacción mediante objetivos suaves: si una reacción registra varios EC distintos, la masa se reparte entre todos ellos.
- Inferencia offline y determinista en CPU, sin acceso a red, sin GPU, sin descarga de modelos y sin ficheros temporales de características.
- Procesamiento por lotes con caché de huellas en memoria acotada y lotes de 128 consultas.
- Entrada/salida tabular: lee Parquet y escribe JSONL en UTF-8 con exactamente los campos `id` y `prediction`, con guarda de escritura para no superar 16 MiB.
- No soporta generación de texto, razonamiento en lenguaje natural, código, matemáticas, visión, audio, tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingües.

## Casos de uso

- Anotación asistida de enzimas en pipelines de metabolómica: a partir del SMILES de una reacción observada, el modelo devuelve un EC candidato que un curador revisa después, reduciendo el espacio de búsqueda frente a la asignación manual.
- Curación de bases de datos de reacciones bioquímicas: usar la predicción L4 como filtro previo para detectar entradas sin EC o con EC sospechoso en conjuntos grandes, dado que el coste por consulta es mínimo y todo el proceso corre en CPU.
- Enrutado y búsqueda dentro de catálogos de reacciones: asignar una clase enzimática aproximada a cada reacción permite agrupar, indexar y recuperar reacciones similares sin depender de un motor de similitud estructural.
- Baseline reproducible en investigación de representaciones: al estar el codificador DRFP fijado a la versión 0.3.7 con hash verificado, sirve como referencia estable para comparar nuevas representaciones (por ejemplo, grafos de reacción o modelos químicos preentrenados) sobre el mismo split semilla 2202.
- Estudio de ablación y comparación de submissions: el par submission 1 / submission 2, reajustado sobre el mismo 80 % de datos, permite medir la ganancia atribuible al cambio de representación y de learner sin confundirla con cambios de partición.
- Docencia y prototipado de pipelines de evaluación leakage-controlled: el paquete incluye Docker, `requirements.txt`, scripts de inferencia y el contrato exacto del evaluador (`python /app/predict.py --input INPUT --output OUTPUT`), lo que lo convierte en un ejemplo completo de submission ejecutable sin infraestructura especial.
- Componente de un sistema mayor de anotación: al ser una caja negra determinista que consume Parquet y produce JSONL, se puede orquestar dentro de un DAG junto a herramientas de similitud o de reglas, usando su predicción como voto adicional.

## Benchmarks y rendimiento

El autor publica únicamente resultados de su split interno (semilla 2202, 6.328 reacciones de test), expresados como precisión fraccional por nivel EC. La accuracy oficial de la submission 2 es explícitamente desconocida según la model card, y el autor advierte de que las puntuaciones del paper de DRFP y del leaderboard de la submission 1 no son intercambiables con estas cifras.

| Modelo | L4 | L3 | L2 | L1 |
|---|---:|---:|---:|---:|
| Submission 1 (mismo test local) | 52,2370 % | 79,5233 % | 83,2363 % | 89,8070 % |
| Submission 2 (mismo test local) | 63,3374 % | 86,9132 % | 89,6717 % | 93,4634 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, porque el artefacto no es un modelo de lenguaje. Tampoco se han publicado métricas oficiales del leaderboard de Leak-CURBER para esta submission en la información disponible.

## Requisitos de hardware

- VRAM: 0 GB. La inferencia es exclusivamente CPU; la model card indica que no se requiere runtime de PyTorch ni GPU.
- GPU recomendadas: ninguna. No se documenta ningún camino de ejecución en GPU.
- Compatibilidad con GPU de consumo: no aplica; el cuello de botella es el cálculo de huellas y el producto matricial 8.192 × 512, no la memoria de vídeo.
- CPU: Linux amd64 (el `Dockerfile` se construye con `--platform linux/amd64`); los hilos numéricos se limitan a dos dentro de Python, con independencia de los hooks del shell.
- Memoria RAM: no disponible de forma explícita; el diseño usa cachés de huellas acotadas en memoria y carga los pesos una sola vez.
- Opciones de despliegue: Python directamente (`python -m pip install -r requirements.txt` y `python predict.py --input ... --output ...`) o contenedor Docker (`docker build --platform linux/amd64 -t enzyme-submission-2 .`). El contrato del evaluador es `python /app/predict.py --input INPUT --output OUTPUT`, con `/usr/local/bin/python`, directorio `/app` y usuario 1000, y escritura de bytecode desactivada.
- Herramientas no aplicables: vLLM, llama.cpp, Ollama o TGI no sirven para este artefacto, al no ser un modelo generativo con pesos tipo transformer.
- Latencia y throughput: no disponibles. Solo se documenta el procesamiento en lotes de 128 consultas y la ausencia de descargas de red en tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Representación | Learner | L4 en test local | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| submission-2 (este) | DRFP 4.096 bits + 2 × Morgan quiral 2.048 bits | MLP [512, 256], BN, dropout 0,2 | 63,3374 % | no declarada en HF; DRFP MIT | pesos JSON + NPZ, Docker, CPU |
| submission-1 (`da24b046/leak-curber-enzyme-submission-1`) | no disponible en detalle; algoritmo propio reajustado | no disponible | 52,2370 % sobre el mismo test local | no disponible | paquete de inferencia CPU |
| `poketwouser/leak-curber-enzyme-retrieval-dual` | no disponible | no disponible | no disponible | no disponible | repositorio en HuggingFace |

La comparación con la submission 1 es la única que ofrece cifras homogéneas, porque ambos se evalúan sobre la misma partición interna. Cualquier comparación con modelos de lenguaje de propósito general o con modelos químicos preentrenados no es pertinente: la tarea es de clasificación cerrada sobre un vocabulario EC y la métrica es la precisión fraccional por nivel, no una métrica generativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite instrucciones; cualquier uso conversacional es un error de categoría.
- El espacio de salida está cerrado a los EC observados en los datos públicos de entrenamiento, de modo que la cobertura escasa de etiquetas limita la predicción de EC raros o nunca vistos, tal como reconoce el autor.
- El hashing interno de fragmentos puede colisionar y la aritmética de conjuntos de DRFP pierde información estequiométrica, lo que introduce errores irreducibles en la representación.
- La solidez depende de que la reacción de entrada sea un SMILES exacto y canónico respecto al dominio de entrenamiento; reacciones con notación distinta pueden degradar la huella.
- El autor no reclama estado del arte ni una puntuación oficial garantizada; las cifras publicadas son de un split interno nuevo del mismo dataset público, no de un conjunto externo nunca visto.
- Los pesos finales están reajustados sobre el 100 % de los datos públicos de entrenamiento (63.280 reacciones, 67 épocas) y no deben puntuarse sobre el test interno como si fuese reservado; hacerlo invalida la medición.
- Licencia del modelo no declarada en HuggingFace: antes de un uso comercial hay que aclarar los términos con el autor. El codificador DRFP vendorizado es MIT y exige conservar `DRFP_LICENSE.txt`; el vocabulario EC de ExPASy es CC BY 4.0 y requiere atribución a SIB.
- El repositorio declara 0,0 GB de tamaño, lo que puede indicar que los ficheros de pesos no están efectivamente alojados o que la métrica de HuggingFace no los refleja; conviene verificar la presencia de `weights/model.json` y `weights/network.npz` antes de desplegar.
- El paquete excluye deliberadamente datos de entrenamiento en bruto, informes de desarrollo, estado de PyTorch y notas de estudio, por lo que la reproducibilidad completa del entrenamiento no está cubierta por el artefacto.
- La salida está limitada a 16 MiB por la guarda del escritor, lo que acota el volumen de consultas por ejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/da24b046/leak-curber-enzyme-submission-2
- Submission 1 del mismo autor: https://huggingface.co/da24b046/leak-curber-enzyme-submission-1
- Dataset Leak-CURBER Enzyme Retrieval: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Repositorio starter del dataset: https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
- Código fuente de DRFP (reymond-group): https://github.com/reymond-group/drfp
- Estudio de clasificación de enzimas citado: https://pmc.ncbi.nlm.nih.gov/articles/PMC10668483/
- Póster de Leak-CURBER en NeurIPS 2026: https://neurips.cc/virtual/2026/poster/139384
- Perfil de GitHub del autor: https://github.com/da24b046
- Repositorio relacionado de otro participante: https://huggingface.co/poketwouser/leak-curber-enzyme-retrieval-dual
- Vocabulario EC (ExPASy ENZYME): https://enzyme.expasy.org/
