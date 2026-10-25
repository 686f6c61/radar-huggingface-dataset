# mradermacher/TurkishWikipedia-LLM-7b-base-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones en formato GGUF del modelo `cenkersisman/TurkishWikipedia-LLM-7b-base`, un modelo de lenguaje de 7.241.732.096 parámetros (aproximadamente 7,24 mil millones) entrenado por Cenker Sisman a partir de contenido de la Wikipedia en turco. Las cuantizaciones han sido generadas por mradermacher, un conocido publicador de versiones GGUF de modelos open source, con el objetivo de permitir la ejecución del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo es de tipo *base*, es decir, no ha pasado por un proceso de ajuste por instrucciones (instruction tuning) documentado, por lo que su comportamiento natural es la continuación de texto y no el diálogo.

La relevancia de esta ficha es doble. Por un lado, el modelo base aborda un problema concreto: la escasez de modelos de lenguaje abiertos centrados en turco, un idioma con menos recursos que el inglés en el ecosistema de IA abierta. Por otro, el repositorio de mradermacher resuelve el problema práctico del despliegue: ofrece 12 variantes de cuantización entre 2,8 GB (Q2_K) y 14,6 GB (f16), lo que permite elegir el compromiso entre calidad y huella de memoria según el hardware disponible.

Conviene señalar desde el principio una limitación importante de la información disponible: ni la model card del repositorio GGUF ni los metadatos de HuggingFace documentan la arquitectura concreta, la longitud de contexto, la licencia o los datos exactos de entrenamiento del modelo base. La etiqueta de idioma declarada en este repositorio es `en` (inglés), lo que contradice el nombre del modelo y su origen (Wikipedia turca); se trata de una inconsistencia de metadatos que el usuario debe verificar antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card del repositorio GGUF no documenta la arquitectura; el modelo base es un transformer decoder-only de 7B según su denominación, sin confirmación oficial en la información proporcionada) |
| Parametros totales | 7.241.732.096 (dato real de los safetensors del modelo base) |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (16 bpw). No hay cuantizaciones con imatrix/weighted publicadas por el autor en el momento de la ficha |
| Idiomas soportados | etiqueta declarada: `en` (inglés). El modelo base se denomina y se entrena a partir de Wikipedia en turco, pero los metadatos no declaran oficialmente `tr` |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors, según los metadatos de parámetros de HuggingFace |
| Tamaño del repositorio | 63,9 GB (incluye las 12 cuantizaciones) |
| Descargas / likes | 112 descargas, 0 likes |
| Fecha de creación / actualización | 2025-02-11 / 2026-10-24 |

Tamaños por cuantización (dato aportado por el autor):

| Tipo | Tamaño (GB) | Nota del autor |
|---|---|---|
| Q2_K | 2,8 | - |
| Q3_K_S | 3,3 | - |
| Q3_K_M | 3,6 | calidad inferior |
| Q3_K_L | 3,9 | - |
| IQ4_XS | 4,0 | - |
| Q4_K_S | 4,2 | rápido, recomendado |
| Q4_K_M | 4,5 | rápido, recomendado |
| Q5_K_S | 5,1 | - |
| Q5_K_M | 5,2 | - |
| Q6_K | 6,0 | muy buena calidad |
| Q8_0 | 7,8 | rápido, mejor calidad |
| f16 | 14,6 | 16 bpw, innecesario según el autor |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base. Lo que sí se puede afirmar con los datos aportados es: (1) el modelo tiene 7.241.732.096 parámetros, un tamaño característico de la familia de transformers decoder-only de 7B; (2) el nombre del modelo base (`TurkishWikipedia-LLM-7b-base`) indica un entrenamiento sobre texto de Wikipedia en turco, probablemente con un objetivo de modelado de lenguaje causal estándar (predicción del siguiente token); y (3) el sufijo `base` sugiere que no se aplicó ajuste por instrucciones ni alineación tipo RLHF/DPO, o al menos que no se anuncia como modelo instruct.

No hay información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la tokenizador empleado, el uso de atención lineal o decodificación especulativa, ni sobre posibles fases de ajuste fino supervisado. El trabajo aportado por mradermacher es exclusivamente de cuantización: convierte los pesos en safetensors del modelo base a GGUF y genera las distintas variantes mediante las herramientas estándar de llama.cpp. No se han publicado cuantizaciones con imatrix (weighted quants) para este modelo, lo que en la práctica significa que las versiones de baja precisión (Q2_K, Q3_K) pueden degradar la perplejidad más de lo habitual en comparación con cuantizaciones informadas por matriz de importancia.

## Capacidades

- Generación de texto por continuación: al ser un modelo base, su función principal es completar secuencias, no seguir instrucciones.
- Modelado de lenguaje en turco (presunto, por el corpus de entrenamiento declarado en el nombre del modelo base); debe validarse empíricamente porque la etiqueta de idioma del repo indica `en`.
- Extracción de representaciones internas (hidden states) para tareas downstream como clasificación de texto, etiquetado de secuencias o clustering semántico, mediante fine-tuning con cabezas específicas.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir el impacto de 12 niveles de cuantización sobre la perplejidad y la calidad de generación de un mismo modelo.
- Ejecución en CPU y en GPU de gama baja gracias al formato GGUF y a las variantes de 2,8 a 7,8 GB.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, visión, audio ni capacidades de agente. Al ser un modelo base sin ajuste por instrucciones, estas capacidades no deben asumirse.
- Capacidades multilingües: no documentadas; la única etiqueta disponible (`en`) es dudosa y no se acompaña de evaluación.

## Casos de uso

- Investigación en procesamiento del lenguaje natural para turco: uso del modelo como línea base para experimentos de modelado de lenguaje, cálculo de perplejidad sobre corpus turcos y comparación con otros modelos abiertos del mismo idioma. Su tamaño de 7B y su disponibilidad en GGUF abaratan la reproducibilidad en laboratorios con recursos limitados.
- Fine-tuning supervisado para tareas concretas: partiendo de los pesos del modelo base (o de la cuantización Q8_0/f16, más fiel al original), se puede añadir una cabeza de clasificación para análisis de sentimiento, detección de temas o NER en textos turcos, con un coste de adaptación mucho menor que entrenar desde cero.
- Preentrenamiento continuado con dominios específicos: al ser un modelo base, es un punto de partida razonable para *continued pretraining* sobre corpus legales, médicos o periodísticos en turco, antes de aplicar un ajuste por instrucciones.
- Generación de corpus sintético y aumento de datos: el modelo puede completar fragmentos de texto para ampliar datasets de entrenamiento de modelos más pequeños, siempre con revisión humana y filtrado de calidad, dado el riesgo de alucinación de un modelo base.
- Despliegue offline en hardware de consumo: con la variante Q4_K_M (4,5 GB) se puede ejecutar en un portátil con GPU de 8 GB o incluso en CPU mediante llama.cpp u Ollama, lo que sirve para demos locales, prototipos y entornos sin conectividad.
- Evaluación del impacto de la cuantización: el repositorio es un banco de pruebas ideal para medir cuánto se degrada la perplejidad entre Q2_K (2,8 GB) y f16 (14,6 GB) en un mismo modelo, un experimento útil para decidir qué variante desplegar en producción.
- Destilación y generación de datos de entrenamiento: usar la versión f16 como profesor para destilar conocimiento hacia modelos más pequeños especializados en turco, aprovechando que el formato GGUF permite ejecutarlo en infraestructura modesta.
- Docencia y divulgación: ejemplo práctico de cuantización de un modelo de 7B, comparación de formatos y discusión sobre el papel de los modelos base frente a los modelos instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones en turco, y tampoco se aportan comparaciones con otros modelos. Cualquier cifra de rendimiento para este modelo debería obtenerse mediante evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamaño de los ficheros GGUF, más overhead de contexto y de la biblioteca; cifras orientativas, no publicadas por el autor):
  - Q2_K (2,8 GB): en torno a 4 GB de VRAM con contexto moderado.
  - Q3_K_M (3,6 GB): en torno a 4,5-5 GB.
  - Q4_K_S / Q4_K_M (4,2-4,5 GB): en torno a 5,5-6 GB.
  - Q5_K_M (5,2 GB): en torno a 6,5-7 GB.
  - Q6_K (6,0 GB): en torno a 7,5-8 GB.
  - Q8_0 (7,8 GB): en torno a 9,5-10 GB.
  - f16 (14,6 GB): en torno a 16-18 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las variantes altas; A100/H100 solo si se busca throughput elevado o se sirven varias instancias.
- ¿Cabe en GPU de consumo? Sí. Las variantes Q4_K_S y Q4_K_M caben en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); Q8_0 requiere 12 GB o más; f16 requiere 16 GB o más y el propio autor la califica de "overkill".
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (mediante Modelfile), LM Studio, llama-cpp-python, text-generation-webui y otras interfaces compatibles con GGUF. vLLM y TGI no están pensados para este formato de pesos en el momento de la ficha; para servido de alta concurrencia conviene partir del modelo base en safetensors.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, del tamaño de contexto y de la cuantización elegida; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La siguiente tabla recoge únicamente lo que sí está documentado:

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| mradermacher/TurkishWikipedia-LLM-7b-base-GGUF (este repo) | 7,24 B | no disponible | GGUF (12 cuantizaciones) | no disponible | publicado, 112 descargas |
| cenkersisman/TurkishWikipedia-LLM-7b-base (modelo base) | 7,24 B | no disponible | safetensors | no disponible | publicado |
| Otros LLM abiertos centrados en turco (p. ej. la familia Trendyol-LLM) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no evaluado aquí |

No se han encontrado en la información proporcionada resultados que permitan afirmar si este modelo es mejor o peor que otras alternativas de 7B para turco. Se recomienda realizar una evaluación propia de perplejidad y de tareas concretas antes de elegirlo frente a modelos como Trendyol-LLM-7B, Cosmos o Llama-based adaptados al turco.

## Limitaciones y advertencias

- Modelo base, no instruct: no sigue instrucciones ni mantiene formato de diálogo de forma fiable; usarlo como asistente conversacional requerirá ajuste por instrucciones.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un bloqueo potencial para cualquier despliegue en producción; hay que contactar con el autor del modelo base antes de usarlo.
- Inconsistencia de metadatos de idioma: el repositorio declara `en` mientras que el modelo base se asocia a turco. Verificar el comportamiento real en turco antes de asumir capacidades.
- Ausencia de contexto documentado: se desconoce la longitud máxima de contexto, lo que impide dimensionar correctamente aplicaciones con documentos largos.
- Riesgo de alucinación: como todo modelo de lenguaje de 7B sin alineación, puede generar afirmaciones factualmente falsas, especialmente en dominios especializados; el entrenamiento sobre Wikipedia no garantiza fidelidad factual.
- Sesgos: el corpus de Wikipedia en turco introduce los sesgos propios de la enciclopedia (cobertura desigual de temas, perspectiva editorial, sobrerrepresentación de ciertos ámbitos). No se han publicado análisis de sesgo.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad, y no hay cuantizaciones imatrix publicadas que mitiguen esa pérdida; para evaluación científica conviene usar Q8_0 o f16.
- Fecha de actualización del repositorio (2026-10-24) posterior a la creación: conviene revisar si se han añadido nuevas variantes o corregido ficheros desde la fecha de consulta.
- Sin garantías de soporte: el repositorio tiene 0 likes y 112 descargas, un nivel de adopción bajo; no hay una comunidad amplia que haya validado el modelo en producción.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/TurkishWikipedia-LLM-7b-base-GGUF
- Modelo base: https://huggingface.co/cenkersisman/TurkishWikipedia-LLM-7b-base
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#TurkishWikipedia-LLM-7b-base-GGUF
- Página de peticiones y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por cuantización citado por el autor: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
