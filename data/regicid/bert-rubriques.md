# regicid/bert-rubriques

## Resumen

bert-rubriques es un modelo de clasificación de texto en francés desarrollado por el usuario regicid, consistente en un ajuste fino de CamemBERT-base para asignar la sección temática de un artículo de prensa francesa. El modelo distingue seis categorías cerradas: politique, société, international, sport, culture y économie, con criterios editoriales explícitos (por ejemplo, los eventos políticos, sociales o económicos ocurridos fuera de Francia se etiquetan como international, y politique se reserva estrictamente a actores políticos franceses).

El modelo nace del proyecto Gallicagram, una herramienta de lexicometría y análisis cultural sobre corpus de prensa, con el objetivo de controlar los "efectos de estructura": una palabra puede aparecer más en un corpus o periodo simplemente porque la sección donde tiende a publicarse es más voluminosa. Para evitar mezclar deporte con política en los análisis, el autor necesitaba un etiquetador automático de secciones fiable sobre prensa francesa posterior a 1945.

Técnicamente es un transformer encoder denso de 110,6 millones de parámetros, con una longitud máxima de secuencia de 512 tokens y entrenado sobre solo 960 artículos de los archivos de Le Monde mediante aprendizaje activo con la herramienta ActiveTigger. Su relevancia actual es acotada pero clara: cubre una tarea de nicho (segmentación temática de corpus periodísticos franceses históricos) con una licencia MIT permisiva y un coste de inferencia muy bajo, aunque con un conjunto de entrenamiento pequeño y un ámbito de aplicación deliberadamente restringido a prensa impresa de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT-base, familia RoBERTa adaptada al francés) con cabeza de clasificación de secuencias |
| Parametros totales | 110.626.566 (aproximadamente 110,6 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificación multietiqueta exclusiva, una sola etiqueta por documento) |
| Etiquetas | culture, international, politique, société, sport, économie |
| Modelo base | camembert/camembert-base, según la model card; las etiquetas de HuggingFace indican almanach/camembert-base-legacy |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de CamemBERT-base, un transformer encoder de tipo RoBERTa entrenado originalmente sobre francés, al que se le añade una cabeza de clasificación para resolver una tarea de clasificación de secuencia con seis clases mutuamente excluyentes. No hay innovaciones arquitectónicas propias: el interés del modelo está en el esquema de anotación y en el procedimiento de entrenamiento.

El ajuste fino se realizó sobre 960 artículos de los archivos de Le Monde (con cobertura temporal desde 1945 hasta la actualidad) anotados con ActiveTigger mediante aprendizaje activo, lo que permitió reducir el coste de anotación humana. Los hiperparámetros documentados son 5 épocas, batch size 4 con acumulación de gradientes de 4 (batch efectivo de 16), learning rate 3e-5, weight decay 0,01 y longitud máxima de secuencia de 512 tokens. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación, algo esperable en un clasificador supervisado.

## Capacidades

- Clasificación de un artículo de prensa francesa en una de seis secciones: politique, société, international, sport, culture o économie.
- Distinción geográfica explícita: los asuntos políticos, sociales o económicos fuera de Francia se asignan a international, de modo que politique queda restringido a la política francesa.
- Tratamiento de culture sin restricción geográfica (contenido cultural extranjero se etiqueta como culture).
- Inclusión en économie tanto de noticias empresariales como de macroeconomía.
- Funcionamiento sobre prensa francesa de posguerra en general, según la experiencia del autor, más allá del corpus concreto de Le Monde usado en el entrenamiento.
- Inferencia sobre textos de hasta 512 tokens.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de razonamiento explícito (thinking mode).
- No dispone de capacidades de visión ni de audio.
- Capacidad multilingüe limitada al francés; no se documenta soporte de otras lenguas.

## Casos de uso

- Limpieza y estratificación de corpus periodísticos históricos: etiquetar automáticamente miles de artículos franceses de posguerra por sección para poder controlar la composición temática del corpus en análisis lexicométricos, que es exactamente el problema que motivó el desarrollo del modelo en el proyecto Gallicagram.
- Análisis diacrónico de vocabulario: al disponer de una etiqueta de sección por documento, se puede medir la evolución de un término dentro de una sección concreta y aislarla del efecto de que dicha sección haya crecido o decrecido en número de páginas.
- Enriquecimiento de metadatos en archivos digitalizados: los repositorios de prensa antigua a menudo carecen de secciones estructuradas o estas son inconsistentes entre décadas; este modelo permite reconstruir una taxonomía homogénea sobre todo el rango temporal 1945-2024.
- Filtrado previo en proyectos de humanidades digitales: descartar o separar automáticamente las piezas de deporte antes de un estudio sobre discurso político, evitando contaminación temática en los resultados.
- Construcción de subcorpus equilibrados para investigación: muestrear la misma proporción de artículos de cada sección a lo largo del tiempo, usando las predicciones del modelo como criterio de selección.
- Clasificación por lotes en pipelines de bajo coste: con 110,6 M de parámetros, el modelo se puede ejecutar en CPU con batching sobre grandes volúmenes de texto, integrándose en flujos ETL de procesamiento documental.
- Anotación asistida para nuevos corpus de prensa: usar el modelo como preanotador y corregir manualmente los casos ambiguos, aprovechando que el autor documenta que la mayoría de errores corresponden a casos genuinamente ambiguos.
- Detección de la sección en sistemas de recomendación o archivo de medios: para medios franceses con volúmenes históricos digitalizados, el modelo permite reasignar secciones a contenidos que perdieron esa metainformación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación documentada es la del propio conjunto de prueba del autor: 241 ejemplos estratificados temporalmente entre 1945 y 2024.

| Metrica | Valor |
|---|---|
| Exactitud global (accuracy) | 81,7 % |
| F1 macro | 0,813 |
| F1 weighted | 0,818 |
| Tamaño del conjunto de prueba | 241 ejemplos, estratificado por periodo (1945-2024) |

Matriz de confusión publicada en la model card (filas: etiqueta real; columnas: predicción):

| real \ pred | culture | international | politique | société | sport | économie |
|---|---|---|---|---|---|---|
| culture | 34 | 2 | 1 | 4 | 0 | 1 |
| international | 3 | 66 | 2 | 0 | 0 | 3 |
| politique | 0 | 3 | 23 | 5 | 0 | 2 |
| société | 5 | 1 | 4 | 39 | 0 | 2 |
| sport | 0 | 0 | 0 | 0 | 18 | 0 |
| économie | 0 | 0 | 0 | 5 | 1 | 17 |

Recall por clase derivado de la matriz anterior (aritmética a partir de los datos publicados, no una métrica reportada por el autor):

| Clase | Ejemplos en el test | Recall derivado |
|---|---|---|
| sport | 18 | 100,0 % |
| international | 74 | 89,2 % |
| culture | 42 | 81,0 % |
| société | 51 | 76,5 % |
| économie | 23 | 73,9 % |
| politique | 33 | 69,7 % |

El autor señala que sport e international son las categorías mejor clasificadas y que la mayoría de los errores corresponden a casos ambiguos, por lo que considera el 81,7 % de exactitud un límite inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32, 0,22 GB en fp16 y 0,11 GB en int8 (cálculo a partir de los 110,6 M de parámetros).
- GPU recomendadas: cualquier GPU, incluso las más modestas; el modelo no requiere A100, H100 ni RTX 4090. Una GTX 1050, una T4 o una GPU integrada moderna son suficientes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos diez años, y también en CPU.
- Opciones de despliegue: pipeline de HuggingFace Transformers, exportación a ONNX Runtime, TorchServe, text-embeddings-inference (que soporta tareas de clasificación) y APIs propias con FastAPI o similar. No hay versiones GGUF publicadas, por lo que el uso con llama.cpp u Ollama no está disponible de fábrica.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (110,6 M de parámetros) y la longitud máxima de 512 tokens, el procesamiento por lotes en CPU es viable y en GPU el cuello de botella será el preprocesado, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| regicid/bert-rubriques | 110,6 M | 512 tokens | Clasificación en 6 secciones de prensa francesa, con exactitud del 81,7 % en 241 ejemplos | MIT | HuggingFace, 0 descargas registradas |
| camembert/camembert-base | 110 M (aproximado) | 512 tokens | Encoder de propósito general para francés; requiere ajuste fino para clasificar | MIT | HuggingFace, modelo ampliamente utilizado como base |
| almanach/camembert-base-legacy | no disponible de forma fiable en la información proporcionada | no disponible | Encoder de propósito general para francés | no disponible | HuggingFace; aparece como base_model en las etiquetas del repositorio |

No se dispone de datos en la información proporcionada sobre otros clasificadores de secciones de prensa francesa con los que comparar el rendimiento, ni de evaluaciones cruzadas con modelos alternativos.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido: 960 artículos, procedentes exclusivamente de Le Monde. La generalización más allá de ese diario y de ese estilo editorial no está garantizada por datos.
- El propio autor advierte que el modelo probablemente no es igual de preciso fuera de la prensa impresa de referencia, y desaconseja explícitamente su uso sobre prensa sensacionalista, redes sociales o transcripciones de televisión.
- Sesgo editorial y de fuente: las seis categorías reproducen la forma en que Le Monde organiza sus secciones. Ese esquema puede no coincidir con la sección real de otros medios, y puede arrastrar los sesgos temáticos y geográficos del diario.
- Sesgo temporal: las categorías son porosas y la distribución de temas cambia a lo largo de 1945-2024. La evaluación se estratificó por tiempo, pero la exactitud reportada (81,7 %) sigue siendo global y puede ser peor en periodos concretos.
- Fronteras categoriales ambiguas: el propio autor reconoce que las categorías son permeables y que la mayoría de los errores son casos genuinamente ambiguos. La exactitud debe interpretarse como un límite inferior del rendimiento teórico.
- Confusiones documentadas: politique es la clase peor recuperada (recall derivado del 69,7 %), con errores repartidos hacia société e international. économie también se confunde con société.
- Truncamiento: la longitud máxima es de 512 tokens; los artículos más largos deben truncarse o dividirse, y la model card no especifica qué estrategia se empleó ni cuál se recomienda.
- No es un modelo generativo: no produce texto ni razonamiento. El riesgo de alucinación en el sentido clásico no aplica, pero las probabilidades de salida deben calibrarse antes de usarlas como umbral de confianza, ya que no se documenta calibración.
- Licencia MIT: permite uso comercial, modificación y redistribución sin royalties, con la única obligación habitual de conservar el aviso de copyright y la licencia.
- Adopción nula: el repositorio no registra ninguna descarga ni ningún like, por lo que no existe validación por parte de la comunidad ni reportes independientes de comportamiento en producción.
- Idiomas: solo se ha entrenado y evaluado en francés. No se documenta ningún rendimiento en otras lenguas.
- Discrepancia menor de trazabilidad: la model card declara camembert/camembert-base como base, mientras que las etiquetas de HuggingFace apuntan a almanach/camembert-base-legacy. Conviene verificar cuál es el artefacto exacto antes de reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/regicid/bert-rubriques
- Modelo base declarado en la model card: https://huggingface.co/camembert/camembert-base
- Modelo base indicado en las etiquetas de HuggingFace: https://huggingface.co/almanach/camembert-base-legacy
- Proyecto Gallicagram: https://gallicagram.com
- Herramienta de anotación ActiveTigger: https://activetigger.com
- Paper, blog o repositorio adicional: no disponible (las únicas referencias son las anteriores; los resultados de búsqueda web consultados no contenían información relacionada con este modelo)
