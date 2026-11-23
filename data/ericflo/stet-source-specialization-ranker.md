# ericflo/stet-source-specialization-ranker

## Resumen

Stet Source Specialization Ranker es un modelo de ranking basado en árboles potenciados (boosted trees) desarrollado por el usuario ericflo. No es un modelo generativo de lenguaje, sino una herramienta de curación de datos que puntúa en qué medida un fragmento de texto se parece a páginas web que resultaron especialmente beneficiosas para el entrenamiento de modelos "Stet". El modelo analiza 20 características superficiales del texto (distribución de caracteres, longitud de palabras, repetición, puntuación y disposición de líneas) para predecir qué fuentes conviene priorizar en un corpus de preentrenamiento.

La relevancia del modelo reside en su enfoque: en lugar de evaluar texto con un modelo lingüístico costoso, utiliza un clasificador ligero que se ejecuta con la biblioteca estándar de Python. El autor lo presenta como una medición indirecta de selección de fuentes ("source-selection proxy"), con una evaluación de extremo a extremo todavía en curso. El modelo se entrenó con 960 ventanas de origen en seis idiomas (inglés, ruso, español, alemán, francés y chino), con 240 ventanas de desarrollo y 660 de test.

El modelo tiene una licencia MIT, cero descargas y cero "likes" en el momento de la consulta, y no dispone de pipeline declarado en Hugging Face. Su uso previsto es la curación de corpus multilingües, no la inferencia generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árboles potenciados (boosted trees) sobre 20 características de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de aproximadamente 96 tokens Stet por fragmento |
| Tipos de cuantizacion | no disponible (pesos en JSON) |
| Idiomas soportados | inglés, ruso, español, alemán, francés y chino |
| Licencia | MIT |
| Formato de pesos | JSON (`weights.json`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de árboles potenciados que opera sobre 20 características extraídas del texto: distribución de caracteres, longitudes de palabra, repetición, puntuación y disposición de líneas. La inferencia se realiza cargando `weights.json` y llamando a `predict(features(text), weights)` desde el módulo `source_shape.py`, que depende únicamente de la biblioteca estándar de Python. No se trata, por tanto, de una red neuronal ni de un transformer.

Las etiquetas de entrenamiento miden la diferencia en bits por token entre un "estudiante" entrenado con páginas en bruto y otro entrenado con páginas curadas. Se entrenaron dos pares de estudiantes independientes sobre muestras separadas de la misma instantánea fijada de Common Crawl. El ranker aprendió de 960 ventanas de origen en seis idiomas, con 240 ventanas de desarrollo y 660 de test. Los conjuntos de train, desarrollo y test tienen hosts disjuntos, y se excluyeron las URL exactas presentes en cualquiera de los corpus de los profesores. Los datos contienen páginas de entrenamiento de práctica; no se utilizó texto de los exámenes Stet.

## Capacidades

- Puntuación de fragmentos de texto según su similitud con fuentes que resultaron beneficiosas para el entrenamiento, mediante 20 características superficiales.
- Ranking multilingüe limitado a seis idiomas: inglés, ruso, español, alemán, francés y chino.
- Ejecución sin dependencias externas: solo requiere la biblioteca estándar de Python.
- Comparación de puntuaciones entre páginas del mismo idioma (el autor advierte explícitamente de que las puntuaciones no son comparables entre idiomas).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo "thinking".
- No dispone de capacidades de audio ni de procesamiento multimodal.

## Casos de uso

- Curación de corpus de preentrenamiento: puntuar páginas de un rastreo web (por ejemplo, Common Crawl) para priorizar las que se parecen a fuentes que mejoraron el rendimiento de un modelo estudiante, reduciendo el volumen de datos a procesar con filtros más costosos.
- Filtrado previo a la tokenización: aplicar el ranker sobre ventanas de unos 96 tokens para descartar páginas con baja puntuación antes de pasarlas por un pipeline de limpieza más caro.
- Selección de fuentes por idioma: al comparar solo páginas del mismo idioma, el equipo puede equilibrar la composición lingüística del corpus sin introducir sesgos entre lenguas.
- Construcción de conjuntos de validación de curación: usar las etiquetas de diferencia en bits por token como referencia para calibrar otros filtros de calidad de datos.
- Auditoría de mezclas de datos: estimar si una nueva fuente de datos se parece a las fuentes que ya se sabe que aportan valor, antes de incorporarla a una mezcla de entrenamiento.
- Prototipado rápido en entornos sin GPU: al ejecutarse con la biblioteca estándar de Python, puede integrarse en scripts de preprocesamiento en máquinas sin aceleradores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Correlación de Spearman media intra-idioma (330 ventanas retenidas de páginas que el curador de referencia omitió) | 0,667 |
| Incremento medio del objetivo al seleccionar el cuartil superior (primer par de profesores) | 0,377 bits por token |
| Incremento medio del objetivo al seleccionar el cuartil superior (segundo par de profesores) | 0,421 bits por token |

El autor indica que estas son mediciones indirectas de selección de fuentes y que la evaluación de extremo a extremo de un curador que use estos pesos está en curso. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no requiere GPU.
- GPU recomendadas: ninguna; la inferencia se ejecuta en CPU con la biblioteca estándar de Python.
- Cabe en cualquier equipo capaz de ejecutar Python, incluidos portátiles de gama baja y entornos sin acelerador.
- Opciones de despliegue: scripts de Python que carguen `weights.json` y llamen a `predict(features(text), weights)` desde `source_shape.py`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de ranking de fuentes para curación de datos en la documentación proporcionada. Las alternativas habituales en este espacio (clasificadores de calidad tipo fastText, filtros basados en perplejidad o clasificadores neuronales ligeros) no se detallan en la información disponible, por lo que no se ofrece una comparación numérica.

## Limitaciones y advertencias

- Las puntuaciones solo son comparables entre páginas del mismo idioma; el autor advierte explícitamente de que no deben compararse entre lenguas.
- Las métricas publicadas son mediciones indirectas de selección de fuentes; la evaluación de extremo a extremo de un curador que use estos pesos está en curso y no se ha publicado.
- El modelo se entrenó con ventanas de unos 96 tokens Stet; usarlo con ventanas de tamaño muy distinto puede degradar la calidad de las puntuaciones.
- Solo cubre seis idiomas (inglés, ruso, español, alemán, francés y chino); otros idiomas quedan fuera de su ámbito evaluado.
- Al basarse en 20 características superficiales, puede no capturar matices semánticos o de calidad profunda del texto.
- Riesgo de sesgo hacia las características de las páginas de práctica de Common Crawl utilizadas en el entrenamiento, que pueden no representar otros dominios o fuentes.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de las fuentes de datos subyacentes (Common Crawl) si se redistribuyen derivados.
- El modelo tiene cero descargas y cero "likes" en Hugging Face, y no dispone de pipeline declarado; su madurez y soporte comunitario son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericflo/stet-source-specialization-ranker
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
