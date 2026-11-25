# sohv/looped-lens-t5c-numbank

## Resumen

`sohv/looped-lens-t5c-numbank` no es un modelo generativo, sino una **lente de recuperación de palabras completas** (un banco de centroides coseno) construida para el modelo `thinkingmachines/Inkling-2-Mini` en la revisión fijada `b85c3cfa615fc413cc9af3379f491b963f3b586a`. Desarrollada por el usuario `sohv` para el NDIF Looped Lens Challenge, su función es leer un único estado oculto en una capa y visita concretas del modelo base y devolver las k palabras más probables del banco como identificadores de token del vocabulario.

La lente cubre 18 sitios de lectura distribuidos en dos streams (`out`, la salida del bloque activo, y `moe`, la entrada de la capa de normalización previa a la atención del bloque MoE) y en visitas que van de la 15 a la 46, dado que el modelo base reutiliza capas (las capas 6–17 se ejecutan tres veces). Cada palabra del banco es un único token, y la variante "T5c" usa similitud coseno pura sobre estados estandarizados, mientras que "numbank" indica que el subconjunto numérico se construyó sin prompts aritméticos.

Es relevante en el ámbito de la interpretabilidad mecanicista: permite sondear qué conceptos léxicos representa el modelo base en puntos internos concretos sin necesidad de un clasificador entrenado por capa, con un artefacto de apenas 0,1 GB en `safetensors`. No genera texto ni resuelve tareas por sí misma; es una herramienta de análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de recuperación léxica (banco de centroides coseno); no es un transformer |
| Parametros totales | No disponible (el artefacto contiene tres matrices de centroides de 8703 × 2304 en fp16 más medias y desviaciones fp32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (lee un único estado oculto en una posición de lectura) |
| Tipos de cuantizacion | Pesos en fp16 (centroides) y fp32 (estadísticas); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (el banco de palabras se construye a partir de fuentes en inglés, pero la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`t5c_numbank.safetensors`) |

## Arquitectura y entrenamiento

La lente no es una red neuronal entrenada con descenso de gradiente, sino un banco de centroides calculado estadísticamente. Para cada uno de los 18 sitios (combinación de stream y visita), se calcula la media y la desviación típica del estado estandarizado, y se almacenan centroides unitarios de 8703 palabras en tres matrices: `W.coda_out` (sitios `out` 42–46), `W.coda_moe` (sitios `moe` 42–46) y `W.loop_moe` (sitios `moe` 15, 16 y 23–28). La puntuación es un coseno puro: se estandariza el estado con `mean`/`std`, se normaliza y se multiplica por la matriz de centroides correspondiente; no hay tensor de sesgo.

El banco de palabras se construyó a partir de 12.000 palabras de un solo token extraídas de Open English WordNet 2023, GeoNames, una lista de frecuencias de unigramas de Google Web, la lista de antónimos de synopedia, el módulo `calendar` de Python y los enteros 0–999. Los centroides son la media del estado estandarizado sobre prompts con plantilla en los que la palabra debe calcularse pero nunca se escribe (respuestas de un salto y puentes de dos saltos), conservando solo los prompts que el modelo acertó según un filtro top-1 económico. Los centroides numéricos provienen exclusivamente de prompts no aritméticos (recuento de letras, longitudes de listas, protones a partir de nombres de elementos, datos de calendario, posición alfabética, lados de polígonos y números escritos como dígitos). Ninguna plantilla comparte un 4-grama de palabras con los prompts de WorkspaceBench. Las activaciones se recogieron con pasadas locales del checkpoint fijado en bf16, con una concordancia frente a NDIF de al menos 0,997 de coseno mediano. El repositorio no distribuye activaciones ni prompts.

## Capacidades

- Recuperación de palabras completas: dado un estado oculto crudo de dimensión 2304 en un sitio (stream, visita) concreto, devuelve los k identificadores de token del banco ordenados de mejor a peor.
- Cobertura de 18 sitios de lectura: 5 visitas del stream `out` (42–46), 5 del stream `moe` (42–46) y 8 del stream `moe` en las visitas 15, 16 y 23–28.
- Puntuación por similitud coseno sobre estados estandarizados, sin sesgo, con una única multiplicación de matrices por lectura.
- Banco léxico de 8703 palabras de un solo token, incluyendo un subconjunto numérico no aritmético.
- Lectura en la posición del último token, que para entradas de chat es `<|message_model|>`.
- Integración con NDIF moviendo cada tensor al dispositivo y dtype de la activación correspondiente.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente una herramienta de sondeo.

## Casos de uso

- Análisis de representaciones internas: aplicar la lente sobre estados ocultos de `Inkling-2-Mini` para identificar qué palabras del banco son más próximas en cada visita, permitiendo trazar cómo evoluciona la representación léxica a lo largo de las pasadas repetidas de las capas 6–17.
- Investigación en interpretabilidad mecanicista: comparar las lecturas de los streams `out` y `moe` en las mismas visitas para estudiar la diferencia entre la salida del bloque y la entrada de la normalización previa a la atención.
- Evaluación de circuitos de razonamiento: usar los centroides numéricos no aritméticos para comprobar si el modelo codifica números en contextos de recuento o datos factuales sin recurrir a la aritmética.
- Reproducción de experimentos del Looped Lens Challenge: la implementación de referencia en torch y el esquema de metadatos permiten replicar las lecturas sobre el checkpoint fijado.
- Depuración de prompts: inspeccionar qué conceptos léxicos activa un prompt de chat en la posición del último token para diagnosticar respuestas inesperadas.
- Construcción de pipelines de análisis por lotes: al ser una única multiplicación de matrices por lectura, se puede integrar en scripts que procesen muchos estados ocultos con bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 0,1 GB; en fp16 las tres matrices de 8703 × 2304 suman aproximadamente 120 MB, más las estadísticas fp32 (medias y desviaciones por sitio) y el vector de identificadores. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB libre; no requiere A100 ni H100. La lente se ejecuta junto al modelo base, cuyo coste de inferencia domina el consumo.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.), ya que la lente añade una multiplicación de matrices de 2304 × 8703 por lectura.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; se usa con `safetensors` y torch, cargando el fichero con `safetensors.torch.load` o `safe_open` y ejecutando la función `t5c_topk` de la implementación de referencia.
- Latencia y throughput: no disponibles; al ser una única operación matricial por lectura, la latencia es despreciable frente a la pasada forward del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sohv/looped-lens-t5c-numbank` | Lente de recuperación léxica (coseno) | Banco de 8703 centroides × 2304 dim | No aplica | MIT | Hugging Face |
| Lentes logit-lens convencionales | Proyección a vocabulario | Depende del vocabulario del modelo base | No aplica | Variable | Implementaciones en librerías de interpretabilidad |
| Clasificadores lineales por capa | Sonda entrenada | Depende de la tarea | No aplica | Variable | Repositorios de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde preguntas ni ejecuta tareas; solo devuelve palabras del banco a partir de estados ocultos.
- Dependencia estricta del checkpoint: está fijada a la revisión `b85c3cfa615fc413cc9af3379f491b963f3b586a` de `thinkingmachines/Inkling-2-Mini`; cualquier otra revisión invalida las medias, desviaciones y centroides.
- Cobertura léxica limitada a 8703 palabras de un solo token; palabras fuera del banco o tokenizadas en varios tokens no pueden recuperarse.
- Los centroides se construyeron solo con prompts que el modelo respondió correctamente según un filtro top-1, lo que puede introducir sesgo hacia conceptos fáciles.
- El subconjunto numérico excluye deliberadamente la aritmética, por lo que no refleja la representación de operaciones aritméticas.
- La model card no declara idiomas soportados ni sesgos conocidos; el banco léxico proviene de fuentes en inglés, lo que limita su aplicabilidad a otros idiomas.
- No se han publicado evaluaciones de rendimiento ni métricas de precisión de recuperación.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `Inkling-2-Mini` tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/sohv/looped-lens-t5c-numbank
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF Looped Lens Challenge: no disponible (no se proporciona URL en la información)
- Paper o blog del método: no disponible
- Repositorio de código: no disponible
