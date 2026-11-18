# IO-AIR/kip-hash-v2

## Resumen

KIP-Hash v2 es un sistema de hashing aprendido de 128 bits desarrollado por IO-AIR como capa de curación de datos dentro de su pipeline KIP. No es un modelo de lenguaje generativo, sino un componente de infraestructura de datos que resuelve dos tareas simultáneamente con una única firma binaria: deduplicación difusa (fuzzy dedup) y verificación de calidad de filas de corpus. Su relevancia radica en que sustituye heurísticas clásicas como MinHash o SimHash por una proyección aprendida, entrenada mediante destilación de un profesor de frontera (el modelo por defecto de la webapp de DeepSeek), lo que permite distinguir duplicados parafraseados de falsos positivos que comparten plantilla o vocabulario.

La arquitectura es deliberadamente ligera: los pesos se empaquetan como int8 en un artefacto de 5,9 MB y la inferencia se ejecuta con la biblioteca estándar de Python, sin red neuronal en tiempo de puntuación. Cada fila se convierte en un vector disperso L2-normalizado sobre 32.768 cubos con hash blake2b (unigramas, bigramas y 4-gramas de caracteres), y los 128 bits se obtienen como `sign(W·x)` con una matriz `W` entrenada mediante pérdida contrastiva de margen coseno. Sobre esos bits congelados se ajustan cabezas ridge que producen una puntuación de calidad 0-100 y una bandera de junk/boilerplate.

La versión v2 supone una actualización sustancial respecto a v1: pasa de 136 etiquetas de un profesor GLM a 844 filas etiquetadas y 58 pares adjudicados por un profesor de frontera, reduce el artefacto de 18,4 MB a 5,9 MB y mejora el AUC de detección de junk de 0,689 a 0,755. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hashing aprendido: proyección lineal `W ∈ R^{32768×128}` + cabezas ridge sobre bits congelados; sin red neuronal en inferencia |
| Parametros totales | Matriz de proyección de 32.768 × 128 (4.194.304 valores) empaquetada en int8; artefacto de 5,9 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (opera fila a fila, no sobre secuencias) |
| Tipos de cuantizacion | Pesos empaquetados como int8; inferencia en punto flotante estándar sobre la proyección |
| Idiomas soportados | 15 idiomas (distribución completa conservada respecto a v1); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto propio de la librería `kip` (5,9 MB); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El pipeline de features convierte cada fila en un vector disperso L2-normalizado de log-tf sobre 32.768 cubos generados con blake2b. Las features incluyen unigramas y bigramas de palabras y 4-gramas de caracteres; para texto CJK se emplean unigramas y bigramas de caracteres más 4-gramas. El extractor es una única función de biblioteca estándar importada por el propio script de entrenamiento, de modo que la paridad entre entrenamiento e inferencia es estructural y no una convención.

La matriz de proyección `W` se entrena, no se muestrea. Los positivos son casi-duplicados confirmados por el profesor (inyecciones de paráfrasis con verdad conocida, duplicados orgánicos del corpus y el único duplicado real hallado en la banda ambigua). Los negativos duros son pares del mismo chat que el profesor puntuó pero no marcó como duplicados (mismo idioma, mismo dominio, plantilla y vocabulario compartidos, justo los pares que engañan a MinHash), más 44 pares de la banda ambigua adjudicados par a par con similitud MinHash-128 entre 0,07 y 0,69. El objetivo es una pérdida contrastiva de margen coseno en el espacio de proyección (positivos atraídos a ≥ 0,70, negativos empujados a ≤ 0,30), anclada al prior de proyección aleatoria para generalización. Una cabeza de calidad con straight-through corre en paralelo al objetivo contrastivo, de forma que los planos de bits portan estructura de calidad además de geometría de duplicados.

El profesor es el modelo de chat por defecto de la webapp de DeepSeek, consultado en chats efímeros con 6 filas y 6 pares por conversación, con prompts estructurados en JSON y borrado del chat tras cada llamada. Se re-etiquetaron 9 lotes en chats nuevos para medir autoconsistencia (media de |Δquality| de 7,0, mediana 4,0, que actúa como techo de ruido alcanzable por el estudiante). La recall de pares duplicados del profesor se midió contra verdad conocida: 40/40 pares inyectados encontrados (100 %) más 3 duplicados orgánicos descubiertos. La generación de candidatos usa banding de 8 bandas × 16 bits y la confirmación es distancia de Hamming completa de 128 bits con umbral 7.

## Capacidades

- Deduplicación difusa: identifica casi-duplicados y paráfrasis mediante distancia de Hamming sobre 128 bits, con confirmación a umbral 7.
- Verificación de calidad: produce una puntuación 0-100 directamente desde el vector de bits almacenado, sin necesidad del texto original (triaje O(1)).
- Detección de junk y boilerplate: bandera binaria con umbrales operativos almacenados, ajustada sobre los bits (`junk_bits`) y sobre la proyección (`junk_proj`).
- Discriminación de falsos positivos: la proyección aprendida pondera shingles de contenido sobre plantilla, de modo que páginas no relacionadas que comparten un bloque de navegación permanecen lejos en espacio de Hamming.
- Soporte multilingüe: 15 idiomas, con tratamiento específico para CJK (unigramas y bigramas de caracteres).
- Inferencia sin dependencias: ejecutable con la biblioteca estándar de Python, sin GPU ni framework de deep learning.
- No soporta tool calling, agentes, generación de texto, visión, audio ni modos de razonamiento; es un componente de pipeline, no un modelo generativo.

## Casos de uso

- Curación de corpus de preentrenamiento: aplicar la firma de 128 bits a cada documento para eliminar casi-duplicados antes de entrenar, con banding para generar candidatos y confirmación por Hamming; el coste es O(1) por fila y no requiere GPU.
- Filtrado de calidad en pipelines web: leer la puntuación 0-100 directamente del hash almacenado para descartar filas de baja calidad sin recuperar el texto, lo que permite triaje masivo en bases de datos de miles de millones de filas.
- Eliminación de boilerplate en scraping: la bandera de junk y la ponderación de contenido sobre plantilla reducen los falsos merges entre páginas que comparten navegación, cookies o avisos legales.
- Deduplicación multilingüe: al cubrir 15 idiomas con features adaptadas a CJK, sirve para pipelines que mezclan corpus en varios idiomas sin entrenar un modelo por lengua.
- Detección de paráfrasis en control de calidad de datasets: los positivos de entrenamiento incluyen paráfrasis inyectadas con verdad conocida, por lo que el hash está calibrado para reconocer reformulaciones que MinHash clásico no detecta.
- Auditoría de datasets ya publicados: recalcular firmas sobre un corpus existente y comparar contra la distribución de referencia para detectar contaminación por duplicados o filas basura.
- Componente de un pipeline de destilación de datos: usar la puntuación de calidad como señal de selección antes de destilar un corpus a un modelo estudiante, integrándose en un flujo de curación con coste cero de infraestructura.

## Benchmarks y rendimiento

Corpus de evaluación: shard_v25 de KIP, 794 filas etiquetadas en 15 idiomas, split 80/20 por lote (ningún lote cruza el split), paráfrasis sintéticas reservadas y pares de evaluación adjudicados por el profesor nunca vistos en entrenamiento.

Verificación (157 filas reservadas; junk n=12):

| Verificador | Spearman vs profesor | AUC junk | MAE (0-100) |
|---|---|---|---|
| v1 ensemble (destilado de GLM, cross-teacher) | 0,298 | 0,689 | no disponible |
| v2 hash-only | no disponible (la model card se corta) | no disponible | no disponible |

Comparativa v1 → v2 publicada por el autor:

| Métrica | v1 (GLM) | v2 (DeepSeek webapp) |
|---|---|---|
| Etiquetas del profesor | 136 filas, escala 0-5 | 844 filas, escala 0-100, + 58 pares adjudicados |
| Idiomas | 15 | 15 |
| Supervisión de pares | ninguna | inyectados (40, recall 100 %) + orgánicos (3) + banda ambigua (58) |
| Bits de dedup | MinHash con muestreo ponderado por IDF | proyección aprendida `W`, contrastiva sobre pares adjudicados |
| Verificación desde el hash | prefijo de calidad de 2 bits | cabeza lineal sobre los 128 bits + cabeza fina sobre la proyección |
| AUC junk/boilerplate | 0,689 | 0,755 |
| Spearman vs profesor | 0,298 (cross-teacher) | 0,424 hash-only / 0,543 proyección |
| Falsos merges en banda ambigua (13 pares duros) | 1 (Jaccard ponderado) | 0 |
| Artefacto | 18,4 MB | 5,9 MB |

El resto de la tabla de evaluación de la model card no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es CPU-only con la biblioteca estándar de Python.
- GPU recomendadas: ninguna; no requiere acelerador.
- Consumer GPU: irrelevante, cabe en cualquier máquina por CPU dado el artefacto de 5,9 MB.
- Opciones de despliegue: librería `kip` (library_name declarado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles en la información proporcionada; la confirmación es distancia de Hamming de 128 bits y el triaje de calidad es O(1) sobre el hash almacenado.

## Comparativa con modelos similares

| Sistema | Tipo | Firma | Dedup | Verificación de calidad | Licencia |
|---|---|---|---|---|---|
| KIP-Hash v2 | Hashing aprendido | 128 bits | Proyección aprendida, Hamming umbral 7 | Cabeza ridge sobre 128 bits (0-100) | Apache 2.0 |
| kip-hash-v1 | Hashing aprendido | 128 bits | MinHash ponderado por IDF | Prefijo de 2 bits | Apache 2.0 (mismo autor) |
| MinHash / SimHash clásicos | Hashing heurístico | variable | Muestreo uniforme de shingles | no disponible | dominio público / varias |
| Verificadores neuronales (p. ej. clasificadores de calidad) | Red neuronal | embeddings | requiere modelo en score time | sí, con coste de inferencia | varias |

La comparativa se limita a lo declarado en la model card; no se dispone de cifras de rendimiento de MinHash o SimHash bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- La model card está truncada en la sección de evaluación; faltan los valores de Spearman, AUC y MAE de v2 hash-only, por lo que no puede verificarse el rendimiento completo del verificador.
- El techo de ruido del profesor es alto: media de |Δquality| de 7,0 y mediana de 4,0 en re-etiquetado, lo que limita la fidelidad máxima alcanzable por el estudiante.
- El protocolo de etiquetado depende de la webapp de DeepSeek, con proof-of-work, límites de tasa y chats efímeros; la reproducibilidad del entrenamiento está ligada a la disponibilidad de ese servicio.
- La lista concreta de los 15 idiomas no está disponible, lo que impide confirmar cobertura para lenguas específicas.
- El umbral de Hamming (7) está calibrado para filas a escala de pipeline; su transferencia a otros dominios o longitudes de documento no está validada en la información disponible.
- Riesgo de falsos negativos en duplicados con reescritura profunda que no compartan shingles de superficie, dado que las features son léxicas (unigramas, bigramas, 4-gramas).
- No se documentan sesgos demográficos o de dominio; al ser un componente de filtrado, un sesgo en la puntuación de calidad podría infrarepresentar variedades lingüísticas o registros minoritarios en el corpus filtrado.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto depende de la librería `kip`; conviene revisar sus términos por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IO-AIR/kip-hash-v2
- Versión anterior: https://huggingface.co/IO-AIR/kip-hash-v1
- Organización IO-AIR: https://huggingface.co/IO-AIR
- Referencia arXiv 2406.17557: https://arxiv.org/abs/2406.17557
- Referencia arXiv 1606.00185: https://arxiv.org/abs/1606.00185
- Referencia arXiv 2410.02707: https://arxiv.org/abs/2410.02707
- Referencia arXiv 2304.13734: https://arxiv.org/abs/2304.13734
- Referencia arXiv 2406.11794: https://arxiv.org/abs/2406.11794
- Referencia arXiv 2412.02595: https://arxiv.org/abs/2412.02595
- Protocolo del profesor (referenciado en la model card como `training/teacher_protocol.md`): no disponible como enlace directo
