# IO-AIR/kip-hash-v3

## Resumen

KIP-Hash v3 es un artefacto de hashing aprendido desarrollado por IO-AIR, concebido como la capa de deduplicacion y verificacion de calidad de KIP, un pipeline de curacion de datos de coste cero. No es un modelo generativo ni una red neuronal en tiempo de inferencia: es un conjunto de 606 KB compuesto por una proyeccion int8 de 32768 x 10, bordes de cuantizacion, cabezas lineales y cuantizadores que comprimen cada fila de un corpus en una unica palabra de 28 bits. Esa palabra empaqueta dos tareas simultaneamente: un bucket de 24 bits para deduplicacion difusa y un score de calidad de 4 bits en los bits bajos.

La relevancia de v3 frente a su predecesor (kip-hash-v2) es sustancial en terminos de eficiencia y precision: reduce la firma de 128 bits (16 bytes por fila) a 28 bits (3.5 bytes por fila), encoge el artefacto de 5.9 MB a 606 KB y mejora la correlacion de calidad con el profesor (Spearman 0.719 frente a 0.543) y el error absoluto medio (8.4 frente a 11.0 en escala 0-100). El rendimiento en inferencia con biblioteca estandar pura pasa de 45 a 224 documentos por segundo.

El modelo esta pensado para equipos que necesitan triar y deduplicar corpus multilingues a gran escala sin infraestructura de GPU ni dependencias de frameworks de inferencia. Su licencia Apache 2.0 y su naturaleza determinista lo hacen adecuado para integrarse en pipelines de preprocesamiento de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hashing aprendido con proyeccion lineal int8, cuantizacion por bandas de masa igual y cabeza lineal de verificacion; sin red neuronal en inferencia |
| Parametros totales | Proyeccion de 32768 x 10 (int8) mas cabezas lineales y cuantizadores; artefacto completo de 606 KB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no procesa secuencias; opera por fila) |
| Tipos de cuantizacion | int8 para la proyeccion; 4 bits para el score de calidad empaquetado en la palabra de 28 bits |
| Idiomas soportados | 15 idiomas en el corpus de evaluacion (incluye tratamiento especifico para CJK con unigramas y bigramas de caracter) |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto propio de la libreria `kip` (proyeccion int8, bordes de bins, cabezas, cuantizadores y bloque de evaluacion); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada fila de texto se transforma en un vector log-tf disperso y normalizado en L2 sobre 32768 buckets hasheados con blake2b, combinando unigramas de palabra, bigramas de palabra y 4-gramas de caracter (para CJK, unigramas y bigramas de caracter mas 4-gramas). La funcion de extraccion de caracteristicas (`kip_hash3.features`) es una unica funcion de biblioteca estandar importada tanto por el entrenador como por el inferenciador, lo que garantiza paridad estructural entre entrenamiento e inferencia verificada a 1e-16 sin discrepancias de bins ni niveles.

La deduplicacion se basa en seis proyecciones escalares aprendidas `z_k = (w_k . x - mu_k) / sigma_k`, cuantizadas con bordes de masa igual aprendidos del corpus (16 bins por dimension, 24 bits de bucket). Los casi-duplicados difieren menos que el ancho de un bin, de modo que la cuantizacion absorbe la perturbacion en lugar de apostar bit a bit como SimHash. La generacion de candidatos sobre-genera ligeramente y una confirmacion barata por dimension `|dz| <= tau` restaura la precision. La verificacion de calidad usa una cabeza lineal sobre `[z, battery]`, donde `battery` son 16 caracteristicas superficiales deterministas (longitud, ratios alfanumerico/puntuacion/mayusculas, ratio de palabras unicas, repeticion de 4-gramas, estadisticas de frases, ratios de escritura), cuantizada a 16 niveles de masa igual y empaquetada en los 4 bits bajos de la palabra.

El profesor es la aplicacion web de DeepSeek, consultada por lotes con prompts verbatim, verificacion JSON estructurada, borrado del chat y espera con jitter entre sesiones; cada completion resuelve el proof-of-work propio de la webapp (DeepSeekHashV1) mediante el `pow.wasm` distribuido por DeepSeek. El corpus v2 (844 veredictos de fila, 140 de duplicado, 58 adjudicaciones de par) se conserva y v3 anade supervision sintetica de pares con verdad de construccion conocida (parafrasis positivas deterministas y negativas de similitud segura). La campana escalada de v3 (1575 filas, 8 dominios, 15 idiomas, 10 filas por chat, 30 chats con triple inyeccion, 60 pares ambiguos frescos, 9 chats de calibracion, 181 chats, aproximadamente 21 minutos) esta preparada en `scripts/prep_batches_v3.py` y `scripts/label_run_v3.py` pero pendiente de ejecucion por caducidad del token JWT de la webapp.

## Capacidades

- Deduplicacion difusa de filas de corpus: recall de 95.8% sobre pares duplicados en held-out como candidatos de bucket difuso.
- Confirmacion de duplicados: recall de 91.7% a una tasa de falso merge de 0.11% sobre 3604 negativos held-out.
- Verificacion de calidad por fila: correlacion de Spearman 0.719 con el profesor y MAE de 8.4 puntos en escala 0-100.
- Triaje O(1) desde la palabra almacenada: el score de 4 bits decodificado alcanza MAE 8.21, estadisticamente identico a la cabeza de precision completa.
- Coherencia calidad-duplicado: el 83% de los pares duplicados verdaderos caen en el mismo nivel de calidad.
- Resistencia a falsos merges en zona adversarial: 0 merges de 13 no-duplicados con solapamiento real de shingles (MinHash sim 0.15-0.46) y captura del unico duplicado verdadero, frente a 2 merges de MinHash-64 en su mejor umbral.
- Multilingue: 15 idiomas en el corpus de evaluacion, con tokenizacion especifica para CJK.
- Inferencia en biblioteca estandar pura, sin dependencias de GPU ni frameworks de deep learning.
- Almacenamiento compacto: 3.5 bytes por fila, consulta en diccionario a O(1).

## Casos de uso

- Curacion de corpus de preentrenamiento a gran escala: firmar cada fila con una palabra de 28 bits permite deduplicar y filtrar por calidad en una sola pasada sin releer el texto, almacenando 3.5 bytes por fila en lugar de 16 bytes de una firma de 128 bits.
- Filtrado de calidad en pipelines de datos de coste cero: el score de 4 bits empaquetado permite descartar filas de baja calidad en O(1) desde un diccionario, sin necesidad de GPU ni de un modelo generativo auxiliar.
- Deduplicacion near-duplicate en corpus multilingues: el tratamiento especifico de CJK con unigramas y bigramas de caracter permite aplicar el mismo pipeline a corpus en chino, japones y coreano sin tokenizadores externos.
- Triaje previo a anotacion humana: al ser el 83% de los duplicados coherentes en nivel de calidad, los revisores pueden agrupar candidatos por nivel y reducir el volumen de revision manual.
- Integracion en CI/CD de datasets: la paridad estructural entre entrenamiento e inferencia (verificada a 1e-16) y la naturaleza determinista permiten usar el mismo artefacto en tests de regresion de pipelines de datos.
- Deteccion de contaminacion de benchmarks: la confirmacion por dimension `|dz| <= tau` con tasa de falso merge de 0.11% permite comparar conjuntos de evaluacion contra corpus de entrenamiento con bajo riesgo de falsos positivos.
- Procesamiento de streams de documentos en produccion: a 224 documentos por segundo en biblioteca estandar pura, el firmado y triaje en linea es viable sin infraestructura especializada.

## Benchmarks y rendimiento

| Metrica | v2 (128 bits) | v3 (palabra de 28 bits) |
|---|---|---|
| Firma por fila | 16 B | 3.5 B |
| Tamano del artefacto | 5.9 MB | 606 KB |
| Spearman vs profesor (calidad) | 0.543 | 0.719 |
| MAE calidad (0-100) | 11.0 | 8.4 (precision completa) / 8.21 (score de 4 bits) |
| Triaje solo-hash | 0.42 (desde 128 bits) | MAE 8.21 desde score4, O(1) |
| Pares duplicados en mismo nivel de calidad | No disponible | 83% |
| Merges en zona adversarial (13 no-dups) | No disponible | 0 merges, 1/1 duplicado verdadero capturado |
| Recall de duplicados difusos (held-out) | No disponible | 95.8% |
| Recall de duplicados confirmados | No disponible | 91.7% a 0.11% de falso merge |
| Throughput (biblioteca estandar pura) | 45 docs/s | 224 docs/s |
| Filas por chat del profesor | 6 | 10 mas chats de pares por etapas |

Comparativa adicional reportada: una linea base de proyeccion aleatoria sin entrenar con el mismo pipeline de bandas captura el 32% de los duplicados, frente al 95.8% de v3, lo que atribuye al aprendizaje de la proyeccion un factor 3x de recall con el mismo presupuesto de buckets.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en biblioteca estandar pura de Python.
- CPU: cualquier CPU moderna; el throughput reportado es de 224 documentos por segundo en biblioteca estandar pura.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica, no hay componente neuronal en inferencia.
- Opciones de despliegue: la libreria `kip` (campo `library_name: kip` en el repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Almacenamiento: 606 KB para el artefacto completo; 3.5 bytes por fila firmada en el corpus.
- Latencia: O(1) por consulta en diccionario una vez firmada la fila.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Firma por fila | Recall duplicados | Licencia |
|---|---|---|---|---|---|
| KIP-Hash v3 | Hashing aprendido | 606 KB | 28 bits (3.5 B) | 95.8% difuso / 91.7% confirmado | Apache 2.0 |
| KIP-Hash v2 | Hashing aprendido | 5.9 MB | 128 bits (16 B) | No disponible | Apache 2.0 |
| MinHash-64 | LSH clasico | No disponible | 64 bits (8 B) | 2 merges en zona adversarial (vs 0 de v3) | No disponible |
| SimHash | LSH clasico | No disponible | Tipicamente 64 bits | No disponible | No disponible |

La comparativa con MinHash y SimHash se limita a los datos reportados en la model card: en la zona adversarial de 14 pares adjudicados por el profesor, MinHash-64 en su mejor umbral produce 2 merges incorrectos mientras v3 produce 0 y captura el unico duplicado verdadero. No se dispone de comparativas cuantitativas con otras herramientas de curacion de datos como Deduplicate-Text, DataComp o FineWeb-Edu en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto depende de la funcion `kip_hash3.features` para el firmado; cualquier cambio en la tokenizacion o en el hashing blake2b invalida las palabras almacenadas y rompe la paridad entrenamiento-inferencia.
- El score de calidad se destila de un profesor propietario (aplicacion web de DeepSeek) mediante un protocolo no oficial que depende del proof-of-work de la webapp; la estabilidad a largo plazo de este protocolo no esta garantizada y ya ha fallado por caducidad del token JWT.
- La campana escalada de v3 (1575 filas, 181 chats) no se ha ejecutado; los resultados reportados corresponden al corpus v2 mas supervision sintetica, por lo que las metricas finales pueden variar tras el reentrenamiento v3.1.
- El corpus de evaluacion es wiki-heavy por diseno de v2, lo que puede introducir sesgo hacia dominios enciclopedicos y limitar la generalizacion a otros dominios.
- El score de calidad es una aproximacion de 16 niveles; el MAE de 8.4 puntos en escala 0-100 implica errores de casi una decima parte del rango, inaceptable para decisiones de curacion que requieran precision fina.
- La deduplicacion es difusa por construccion: los buckets sobre-generan candidatos y dependen de la confirmacion `|dz| <= tau`; sin esa etapa, la precision cae.
- No se documentan sesgos especificos por idioma o dominio; la cobertura de 15 idiomas no implica calidad uniforme en todos ellos.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto deriva de etiquetas de un profesor propietario, lo que puede plantear cuestiones de uso de salidas de terceros que el autor no aborda.
- No es un modelo generativo: no puede usarse para generacion de texto, razonamiento, codigo ni tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IO-AIR/kip-hash-v3
- Version anterior: https://huggingface.co/IO-AIR/kip-hash-v2
- Organizacion IO-AIR: https://huggingface.co/IO-AIR
- Paper referenciado (arxiv:2406.17557): https://arxiv.org/abs/2406.17557
- Paper referenciado (arxiv:1606.00185): https://arxiv.org/abs/1606.00185
- Paper referenciado (arxiv:2406.11794): https://arxiv.org/abs/2406.11794
- Paper referenciado (arxiv:2412.02595): https://arxiv.org/abs/2412.02595
- Protocolo del profesor: `training/teacher_protocol_v3.md` (referenciado en la model card, no enlazado)
- Scripts de campana: `scripts/prep_batches_v3.py` y `scripts/label_run_v3.py` (referenciados en la model card, no enlazados)
