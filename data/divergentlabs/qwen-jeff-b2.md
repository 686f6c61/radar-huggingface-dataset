# divergentlabs/qwen-jeff-B2

## Resumen

Qwen-jeff-B2 es un modelo de puntuación de decisiones (*pointwise decision scorer*) desarrollado por divergentlabs. No es un modelo generativo al uso: recibe una instrucción, un estado (contexto) y un conjunto declarado de opciones, y devuelve una distribución de probabilidad softmax sobre exactamente esas opciones. Cada opción se puntúa en su propio *forward pass* con el contexto completo, de modo que la respuesta incluye `probabilities`, `argmax`, `max_probability` y `entropy`. Está construido sobre el backbone causal Qwen/Qwen3-1.7B, al que se le añade una cabeza de lectura mínima (LayerNorm de 2048 dimensiones más una capa lineal de 2048 a 1) sobre el estado oculto del último token real de la secuencia `\n### Score:`.

El modelo expone tres primitivas: Noul (dos opciones, típicamente `yes`/`no`, que devuelve una probabilidad de 0 a 1), Choice (de 2 a 255 opciones nombradas y descritas, que devuelve una distribución sobre ellas) y Score (de 2 a 10 niveles ordenados, que devuelve además `expected_level` y `level_variance`). Su relevancia práctica está en que cubre tareas de enrutamiento, calibración, predicción selectiva y puntuación por rúbrica dentro de un mismo modelo, con una temperatura ajustada de 1,1620 y un umbral de automatización de 0,9588 que garantiza un error menor o igual al 5 % sobre el conjunto de test bloqueado con una cobertura del 19,13 %.

El modelo se entrenó con 102.391 decisiones durante 2 épocas en una única GPU H200, está publicado con licencia Apache-2.0, solo soporta inglés y su contexto es de 2.048 tokens por candidato. La arquitectura se inspira explícitamente en el modelo Jev de Typesafe, orientado a modelos de "sistema 1" para decisiones rápidas y calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (backbone Qwen3-1.7B) con cabeza de puntuación: LayerNorm(2048) → Linear(2048, 1) sobre el estado oculto del último token real de `\n### Score:` |
| Parametros totales | 1.720.581.121 (backbone 1.720.574.976 + cabeza 6.145) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens por candidato |
| Tipos de cuantizacion | no disponible (entrenado y publicado en BF16; la CLI admite `--dtype {auto,bfloat16,float32}`) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Precision | BF16 |
| Pipeline declarado | text-classification |
| Biblioteca | qwen-jeff |
| Tamano del repositorio | 3,5 GB |
| Datos de entrenamiento | 102.391 decisiones, 2 épocas, 1× H200, semilla 0 |
| Temperatura ajustada | 1,1620 (calculada solo sobre el split de calibración) |
| Umbral de automatización | 0,9588 (≤5 % de error en el test bloqueado, 19,13 % de cobertura) |
| Primitivas | Noul (2 opciones), Choice (2-255 opciones), Score (2-10 niveles ordenados) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-1.7B en configuración causal y añade una cabeza de lectura lineal muy ligera: se toma el estado oculto del último token real de la secuencia marcadora `\n### Score:`, se normaliza con LayerNorm de 2048 dimensiones y se proyecta a un escalar mediante una capa Linear(2048, 1). El entrenamiento ajusta 1.720.574.976 parámetros del backbone más 6.145 de la cabeza, con 102.391 decisiones durante 2 épocas en una sola H200 y semilla 0, en precisión BF16. La formulación es `z_i = f(state, instructions, option_i)` y `p = softmax(z)` sobre el conjunto declarado de opciones, de modo que cada opción recibe su propio *forward pass* con el contexto completo y la competición entre opciones se resuelve en la softmax.

Como innovación destacable, el modelo separa explícitamente la calibración del resto del entrenamiento: la temperatura de 1,1620 se ajusta únicamente sobre el split de calibración, y el umbral de automatización de 0,9588 se deriva de un conjunto de test bloqueado, donde produce un error menor o igual al 5 % con una cobertura del 19,13 %. Esto convierte la salida en una probabilidad calibrada utilizable para predicción selectiva (derivar a revisión humana cuando la confianza es baja), además de exponer la entropía de la distribución para medir la ambigüedad de la decisión. No se documentan en la información disponible detalles sobre la composición del dataset, el uso de RLHF o DPO, ni innovaciones de atención o decodificación.

## Capacidades

- Puntuación puntual de decisiones: asigna una probabilidad a cada opción declarada en lugar de generar texto libre.
- Enrutamiento (*routing*) entre 2 y 255 opciones nombradas y descritas, con distribución completa y `argmax`.
- Decisiones binarias tipo sí/no mediante la primitiva Noul, con salida de probabilidad entre 0 y 1 (P de la primera opción).
- Puntuación ordinal en 2-10 niveles mediante la primitiva Score, con `expected_level` y `level_variance`.
- Calibración probabilística: comportamiento de confianza ajustado con temperatura fija y umbral de automatización validado.
- Predicción selectiva: la señal de confianza permite decidir cuándo automatizar y cuándo escalar a revisión humana.
- Puntuación por rúbrica (*rubric-scoring*) y evaluación de respuestas, según los tags del modelo.
- Detección de implicación (*entailment*) entre estado e instrucción, según los tags del modelo.
- Procesamiento por lotes: la CLI acepta `--batch decisions.jsonl --out answers.jsonl` y la API Python expone `load_scorer` y `ask`.
- Salida legible por máquina con `--json`, más metadatos de entropía, probabilidad máxima y recomendación de automatización.
- No soporta generación de texto libre, tool calling, agentes multi-paso, visión ni audio: es un clasificador/puntuador, no un modelo instructivo general.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: se declara un conjunto de colas (por ejemplo `billing`, `technical`, `sales`, `account_closure` con descripciones) y el modelo devuelve la distribución de probabilidad por cola. Si la probabilidad máxima supera el umbral de 0,9588, el ticket se enruta automáticamente; si no, se manda a triaje humano. El ejemplo de la propia model card muestra un ticket de login en iOS resuelto como `technical` con p = 0,7040, por debajo del umbral, y por tanto marcado como no automatizable.
- Predicción selectiva en pipelines de decisión: gracias a la temperatura calibrada y al umbral derivado del test bloqueado, se puede fijar el punto de operación (≤5 % de error con 19,13 % de cobertura) y derivar el resto de casos a revisión, lo que es directamente aplicable a moderación de contenido, validación de formularios o aprobación de solicitudes.
- Puntuación por rúbrica de respuestas generadas: con la primitiva Score se puntúa una respuesta en 2-10 niveles ordenados o con etiquetas nombradas (`trivial,minor,moderate,major,critical`), devolviendo el nivel esperado y su varianza, útil para evaluar salidas de otros LLM o para clasificar la severidad de defectos en control de calidad.
- Comprobación de cumplimiento normativo y contractual: la primitiva Noul responde preguntas binarias sobre un texto (por ejemplo, si un contrato permite sublicenciar a filiales), pasando el documento como `--state @clause.txt`, lo que encaja en revisiones legales asistidas con umbral de confianza explícito.
- Clasificación de intención en asistentes conversacionales: en lugar de generar una respuesta, se determina a qué acción o habilidad corresponde el turno del usuario, con una distribución sobre las opciones disponibles que permite desambiguar y pedir aclaración cuando la entropía es alta.
- Triage de alertas de seguridad o de monitorización: se declaran niveles de severidad y el modelo puntúa cada alerta, de modo que solo las de alta confianza se escalan automáticamente y el resto se agrupan para revisión.
- Evaluación A/B y anotación de datasets: el modelo puede sustituir a anotadores humanos en decisiones repetitivas y bien definidas, con salida JSON (`--json`) y procesamiento por lotes (`--batch`), manteniendo la trazabilidad de la confianza de cada etiqueta.
- Enrutamiento de consultas a modelos especializados: dado un conjunto de modelos o herramientas disponibles descritos como opciones, el scorer decide cuál es el más adecuado para el estado actual dentro de un sistema mayor.
- Detección de implicación en verificación de hechos: la primitiva Noul permite comprobar si una premisa implica una afirmación, con la probabilidad resultante como medida de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay cifras de MMLU, HumanEval, GSM8K ni similares). Los únicos datos de rendimiento declarados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Temperatura ajustada | 1,1620 (solo sobre el split de calibración) |
| Umbral de automatización | 0,9588 |
| Error en el test bloqueado con ese umbral | ≤5 % |
| Cobertura con ese umbral | 19,13 % |
| Decisiones de entrenamiento | 102.391 (2 épocas) |
| Latencia de ejemplo (Choice, 4 candidatos, MPS, bfloat16) | 0,189 s |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,5 GB solo para los pesos (1.720.581.121 parámetros × 2 bytes), más el coste de activaciones y caché KV, que sitúa el uso típico en el entorno de 4-6 GB, dependiendo de la longitud de la secuencia y del número de candidatos procesados por lote.
- Cabe en GPU de consumo: sí, cualquier GPU con 6-8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090.
- GPU de centro de datos: A100, H100, H200 o L40S; para este tamaño no son necesarias, aunque el modelo se entrenó en una H200.
- CPU: es viable, con la penalización de latencia habitual, dado el tamaño moderado del backbone de 1,7 B.
- Apple Silicon: soportado mediante el dispositivo `mps`; el ejemplo de la model card reporta 0,189 s para una decisión Choice con 4 candidatos en `mps/bfloat16`.
- Coste computacional: cada opción requiere su propio *forward pass* con el contexto completo, por lo que la latencia y el consumo escalan de forma aproximadamente lineal con el número de candidatos (hasta 255 en la primitiva Choice). Enrutar entre muchas opciones es proporcionalmente más caro que una decisión binaria.
- Límite de contexto: 2.048 tokens por candidato (`--max-tokens` tiene 2.048 como valor por defecto); estados más largos deben truncarse o dividirse.
- Opciones de despliegue: biblioteca y CLI `qwen-jeff` (`qwen-jeff ask choice|noul|score`, con `--batch` para JSONL), y API Python mediante `load_scorer` y `ask`. Dispositivos soportados por la CLI: `auto`, `mps`, `cpu`, `cuda`; precisión `auto`, `bfloat16`, `float32`.
- Despliegue con vLLM, TGI, llama.cpp, Ollama o formatos GGUF: no disponible; no se documenta soporte para estos servidores ni cuantizaciones de ese tipo, coherente con que el modelo no es un generador de texto estándar sino un scorer con cabeza propia.
- Carga offline: el repositorio incluye `model/backbone/` con cinco archivos de tokenizer y configuración copiados de Qwen/Qwen3-1.7B (`config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, ~15,9 MB), de modo que el modelo se puede cargar sin conexión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divergentlabs/qwen-jeff-B2 | 1,72 B (backbone 1,72 B + cabeza 6.145) | 2.048 tokens por candidato | Scorer puntual de decisiones sobre backbone Qwen3-1.7B | apache-2.0 | HuggingFace (divergentlabs/qwen-jeff-B2), biblioteca qwen-jeff |
| Qwen/Qwen3-1.7B | 1,72 B | no disponible en la informacion proporcionada | Transformer causal generativo | apache-2.0 | HuggingFace, ecosistema transformers |
| Jev (Typesafe) | no disponible | no disponible | Modelo de "sistema 1" para decisiones, inspiración declarada de qwen-jeff-B2 | no disponible | no disponible |

La diferencia clave frente a Qwen3-1.7B es funcional: el modelo base genera texto y no ofrece probabilidades calibradas sobre un conjunto cerrado de opciones, mientras que qwen-jeff-B2 sustituye la cabeza de lenguaje por una cabeza escalar y devuelve una distribución softmax sobre las opciones declaradas, con umbral de automatización validado. No se dispone de datos de rendimiento comparativos entre ambos ni frente a Jev en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas conversacionales; solo puntúa opciones declaradas explícitamente.
- Solo inglés: el campo de idioma declara únicamente `en`, por lo que el rendimiento en castellano u otros idiomas no está validado y puede degradarse.
- Contexto corto: 2.048 tokens por candidato, inferior al de muchos modelos actuales; estados e instrucciones largos obligan a truncar o resumir.
- Coste lineal con el número de opciones: cada candidato implica un *forward pass* completo, lo que encarece las decisiones con muchas alternativas (hasta 255).
- Sin benchmarks públicos convencionales: no hay cifras de MMLU, GSM8K ni similares, por lo que la evaluación externa queda limitada a los datos de calibración y al test bloqueado reportados por el autor.
- Cobertura de automatización baja: con el umbral de 0,9588 solo el 19,13 % de los casos se automatizan con la garantía de ≤5 % de error; el resto requiere revisión humana o un umbral más permisivo con mayor riesgo.
- Riesgo de alucinación: aunque la salida sea una distribución sobre opciones cerradas, el modelo puede asignar probabilidad alta a una opción incorrecta si el estado es ambiguo o contiene información contradictoria; la entropía y `max_probability` son las señales disponibles para detectarlo.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, sociales o de dominio en la información disponible; al derivar de Qwen3-1.7B, puede heredar sesgos presentes en los datos de entrenamiento del backbone.
- Restricciones de licencia: los pesos y el código del proyecto se publican bajo apache-2.0, lo que permite uso comercial; los archivos de tokenizer y configuración redistribuidos desde Qwen/Qwen3-1.7B se incluyen sin modificar bajo la misma licencia Apache-2.0, pero de forma separada de la licencia del código y pesos propios del proyecto. No se documentan restricciones adicionales.
- Dependencia de la biblioteca `qwen-jeff`: el uso requiere esta librería específica; no se documenta compatibilidad con servidores de inferencia estándar, lo que puede complicar su integración en infraestructuras existentes.
- Madurez y adopción: el modelo tiene 0 descargas y 10 likes en HuggingFace en la fecha de consulta, por lo que no existe evidencia de uso en producción a gran escala.
- Los resultados de búsqueda web consultados no contienen información relevante sobre este modelo (los enlaces obtenidos tratan sobre Google Maps), por lo que no hay fuentes independientes que corroboren los datos de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divergentlabs/qwen-jeff-B2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Artículo de Typesafe sobre Jev (inspiración declarada): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Paper, repositorio, demo o documentación adicional: no disponible en la información proporcionada.
