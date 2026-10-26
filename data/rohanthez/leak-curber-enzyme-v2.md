# RohanTheZ/leak-curber-enzyme-v2

## Resumen

`RohanTheZ/leak-curber-enzyme-v2` no es un modelo de lenguaje: es un pipeline de clasificación enzimática (asignación de números EC) publicado como repositorio de inferencia reproducible para la tarea de *enzyme classification* del benchmark Leak-CURBER. El sistema combina un alineamiento por homología con DIAMOND v2.1.10 (`--very-sensitive`, top 50 hits, E-value < 1e-3) contra las secuencias únicas del conjunto de entrenamiento, y un reranker supervisado entrenado con scikit-learn que reordena los EC candidatos a partir de características del alineamiento.

El problema que aborda es el sesgo de fuga de información (*leakage*) en la evaluación de anotación enzimática: los splits habituales contienen proteínas casi idénticas entre entrenamiento y test, lo que infla artificialmente las métricas. El autor entrena el reranker sobre cinco folds de validación construidos con clústeres completos al 40 % de identidad, de modo que las consultas de entrenamiento del reranker no tienen parientes cercanos en la base de referencia, replicando la condición del split oculto del benchmark.

Es relevante ahora porque Leak-CURBER se presentó como póster en NeurIPS 2026 y estandariza datos de 10 bases de datos bioquímicas con splits controlados por fuga para 4 tareas y 10 subtareas, dos de ellas de función enzimática. Este repositorio constituye una línea base no neuronal, ejecutable en CPU, que sirve como referencia de comparación frente a aproximaciones basadas en transformers proteicos. El repositorio ocupa 0,2 GB e incluye el binario estático de DIAMOND para linux x86-64.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: alineamiento local por homología (DIAMOND v2.1.10) + clasificador de gradient boosting (scikit-learn) sobre características del alineamiento |
| Parámetros totales | No disponible (el clasificador se distribuye serializado en `weights/reranker.pkl`; no se publica el número de árboles ni de hojas) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; no es un modelo de secuencia. El pipeline procesa cada consulta de forma independiente y agrega como máximo los 50 hits mejores por consulta |
| Tipos de cuantización | No aplica; el reranker es un `.pkl` de scikit-learn y DIAMOND se distribuye como binario estático |
| Idiomas soportados | No aplica (entrada: secuencias proteicas y SMILES de reacción según el benchmark; no hay procesamiento de lenguaje natural) |
| Licencia | No disponible en el repositorio. La ontología EC procede de ExPASy ENZYME release 02-Sep-2026 (SIB), distribuida bajo CC BY 4.0; el binario de DIAMOND se rige por la licencia de su proyecto original |
| Formato de pesos | `weights/reranker.pkl` (pickle de scikit-learn) + `bin/diamond` (binario estático ELF linux x86-64) + base de datos DIAMOND construida por `train.py` |
| Pipeline declarado en HuggingFace | No disponible |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-26 |
| Última actualización | 2026-10-26 |
| Entrada / salida | Secuencia proteica de consulta → número EC completo predicho |
| Modo de ejecución | CPU (`predict.py --input INPUT --output OUTPUT`) |
| Estrategia de respaldo | Si la consulta no produce ningún hit, se devuelve el EC más frecuente del conjunto de entrenamiento |

## Arquitectura y entrenamiento

El sistema es un *retrieval + reranking* en dos etapas. En la primera, cada consulta se alinea con DIAMOND en modo `--very-sensitive` contra todas las secuencias únicas de entrenamiento, limitando a 50 hits y E-value < 1e-3; el proceso se trocea para que ningún fichero supere los 16 MiB. Cada EC portado por algún hit pasa a ser candidato. En la segunda, `rerank.py` construye para cada candidato un vector de características de alineamiento: mejor bitscore e identidad para ese EC, cuotas de voto (*vote shares*), rango del primer hit que lo respalda, cobertura, acuerdo en los tres primeros dígitos EC y frecuencia del EC en el conjunto de entrenamiento. Un clasificador de gradient boosting entrenado con scikit-learn puntúa cada candidato y se predice el de mayor puntuación. No hay doncella neuronal, atención ni embeddings aprendidos: la señal proviene íntegramente de la homología y de estadísticos agregados del alineamiento.

El punto crítico del diseño es el control de fuga. El reranker se entrenó sobre cinco folds de validación construidos agrupando el conjunto de entrenamiento en clústeres completos al 40 % de identidad, de forma que ninguna consulta de entrenamiento del reranker tiene parientes cercanos en la base de referencia, imitando la condición del split oculto del benchmark Leak-CURBER. El vocabulario de etiquetas se fija a la release 02-Sep-2026 de ExPASy ENZYME. No se documentan en la información disponible el número de tokens/proteínas de entrenamiento, la composición del dataset, ni el uso de RLHF/DPO (no aplicable en este dominio). La reproducibilidad se delega en `train.py --train train.parquet`, que construye la base DIAMOND y los ficheros de etiquetas.

## Capacidades

- Predicción de números EC completos (los cuatro niveles) para proteínas a partir de su secuencia, mediante transferencia de anotación por homología con reranking supervisado.
- Búsqueda de homología sensible a distancia evolutiva dentro del conjunto de referencia, con umbral explícito de E-value y top 50 hits.
- Agregación de evidencia multi-hit: voto ponderado, cobertura, identidad y bitscore por candidato, en lugar de la regla ingenua del mejor hit.
- Comprobación de coherencia taxonómica de la anotación a nivel de los tres primeros dígitos EC (acuerdo entre candidatos).
- Manejo explícito del caso sin hits, con política de respaldo determinista (EC más frecuente del entrenamiento).
- Ejecución completa en CPU, sin dependencias de GPU ni de frameworks de deep learning.
- No soporta *tool calling*, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo generativo.
- No hay capacidades multimodales propias, aunque la tarea de referencia del benchmark sea multimodal (las entradas de otras subtareas incluyen SMILES de reacción).
- Multilingüismo: no aplica; el dominio es simbólico (secuencias y ontología EC en inglés).

## Casos de uso

- Anotación funcional a gran escala de proteínas recién secuenciadas: procesar un proteoma completo contra la base de referencia con `predict.py`, obteniendo un EC por proteína y una puntuación del reranker que permite priorizar las anotaciones de alta confianza para revisión manual.
- Línea base de comparación en experimentos de anotación enzimática: al ser un método no neuronal y de coste muy bajo, sirve como referencia obligada antes de justificar el uso de modelos basados en transformers proteicos, especialmente en splits controlados por identidad.
- Detección de errores de anotación en bases de datos: las discrepancias entre el EC anotado y el EC predicho por consenso de homología son candidatas a revisión curada, con el acuerdo en los tres primeros dígitos como filtro de severidad.
- Enriquecimiento de pipelines metagenómicos: anotar ORFs predichos en muestras ambientales donde la mayoría de las secuencias carecen de anotación experimental, con la política de respaldo documentada para los casos sin hit.
- Prototipado rápido en entornos sin GPU: al ejecutarse íntegramente en CPU y distribuirse como binario estático, se puede desplegar en contenedores ligeros, clústeres de CPU o portátiles para validar hipótesis antes de invertir en infraestructura de inferencia neuronal.
- Auditoría de leakage en benchmarks: el propio diseño (folds al 40 % de identidad) sirve de plantilla para construir y verificar splits de evaluación en tareas de función enzimática.
- Filtrado previo en pipelines de diseño enzimático: descartar o etiquetar candidatos cuya homología sugiere una función EC incompatible con la reacción objetivo antes de pasar a modelos generativos o de docking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (accuracy, F-max, MCC) sobre el split oculto de Leak-CURBER ni sobre las cinco folds de validación del reranker, y tampoco se reportan tiempos de ejecución ni consumo de memoria. El benchmark Leak-CURBER (NeurIPS 2026) define 10 subtareas —2 de resultado de reacción, 2 de función enzimática, 3 de parámetros cinéticos y 3 de unión proteína-ligando—, pero no se dispone de los valores obtenidos por este repositorio en ninguna de ellas.

## Requisitos de hardware

- VRAM estimada: 0 GB; la inferencia se ejecuta en CPU según la propia model card (`predict.py` corre en CPU).
- GPU recomendadas: ninguna. El binario incluido es la compilación estática linux x86-64 de DIAMOND v2.1.10; no se especifica si soporta aceleración GPU.
- Cabe en cualquier equipo consumidor: el repositorio pesa 0,2 GB y el clasificador es un modelo tabular de scikit-learn. El límite práctico es la RAM necesaria para la base de datos DIAMOND, que se construye con `train.py` y cuyo tamaño no se documenta.
- Almacenamiento: los ficheros intermedios del alineamiento se particionan explícitamente para no superar 16 MiB por fichero, lo que sugiere ejecuciones con espacio en disco acotado.
- Opciones de despliegue: ejecución directa con `predict.py`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). El despliegue natural es un contenedor con el binario estático y el `.pkl`.
- Latencia y throughput: no disponibles. Dependen del tamaño de la base de referencia, del número de consultas y del paralelismo de DIAMOND; el modo `--very-sensitive` con top 50 hits es sensiblemente más costoso que un alineamiento por defecto.

## Comparativa con modelos similares

| Sistema | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `RohanTheZ/leak-curber-enzyme-v2` | DIAMOND + gradient boosting | No disponible (tabular) | No aplica (50 hits/consulta) | No disponible | HuggingFace, pesos incluidos | Reranker entrenado con folds al 40 % de identidad; CPU |
| BLASTp/DIAMOND + regla del mejor hit | Alineamiento + mayoría | No aplica | No aplica | Según herramienta | Amplia | Línea base clásica; el reranker se plantea explícitamente como mejora sobre ella |
| Modelos neuronales de anotación enzimática (familia CLEAN, ProteInfer, DeepEC) | Red neuronal sobre secuencia | No disponible en la información proporcionada | No disponible | Varía por modelo | Varía | No se dispone de comparación numérica verificada en este contexto |
| Resto de participantes en Leak-CURBER (enzyme classification) | Varía | No disponible | No disponible | No disponible | Artefactos en Zenodo y GitHub del benchmark | Sin resultados publicados en la información disponible |

No se dispone de cifras verificadas de parámetros, contexto ni rendimiento para las alternativas en el material proporcionado; las comparaciones anteriores son de categoría, no de resultado.

## Limitaciones y advertencias

- Dependencia total de la base de referencia: si una proteína no tiene homólogos en el conjunto de entrenamiento, el sistema no puede inferir su función y cae en la política de respaldo (EC más frecuente), un comportamiento de alta precisión pero baja sensibilidad que puede enmascarar fallos sistemáticos.
- El repositorio no incluye métricas: no es posible evaluar su calidad sin reconstruir la base DIAMOND y ejecutar el benchmark, lo que impide adoptarlo en producción sin validación propia.
- Licencia no declarada: no hay información sobre condiciones de uso comercial, redistribución del `.pkl` ni del binario de DIAMOND. Verificar antes de cualquier despliegue.
- Sesgo hacia funciones enzimáticas sobrerrepresentadas en el conjunto de entrenamiento, tanto por la frecuencia EC usada como característica del reranker como por la regla de respaldo.
- Resolución limitada a la granularidad del vocabulario ExPASy ENZYME 02-Sep-2026; EC nuevos o reclasificados con posterioridad no serán predecibles.
- No distingue enzimas con la misma actividad pero sustratos distintos si la homología no lo refleja; la cobertura y la identidad de alineamiento pueden ser insuficientes para EC de cuarto nivel.
- Riesgo de propagación de errores de anotación presentes en la base de referencia (el modelo aprende de etiquetas existentes, incluidas las erróneas).
- Trazabilidad y mantenimiento: autor único, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-10-26). Tratarlo como artefacto de investigación, no como dependencia estable.
- Sin soporte de GPU declarado; el coste en CPU puede ser prohibitivo para volúmenes muy grandes con `--very-sensitive`.
- Idoneidad de dominio: cualquier uso fuera de clasificación enzimática (texto, código, razonamiento) queda fuera del alcance del sistema.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RohanTheZ/leak-curber-enzyme-v2
- Póster de Leak-CURBER en NeurIPS 2026: https://neurips.cc/virtual/2026/poster/139384
- Dataset Leak CURBER: enzyme retrieval: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Dataset Leak CURBER: enzyme classification: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Artefactos de réplica del paper (Zenodo): https://zenodo.org/records/21642841
- Código y configuraciones del benchmark (GitHub): https://github.com/bisect-group/Leak-CURBER/tree/main
- DIAMOND v2.1.10 (repositorio oficial): https://github.com/bbuchfink/diamond
- ExPASy ENZYME (vocabulario EC, release 02-Sep-2026): no se proporciona URL directa en la información disponible
