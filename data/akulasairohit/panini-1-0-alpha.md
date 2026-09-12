# akulasairohit/panini-1.0-alpha

## Resumen

Panini 1.0 Alpha (denominado P-ISA, *Pāṇinian Instruction-Set Architecture*) no es una red neuronal al uso: es un motor determinista de reglas para sánscrito que combina un parser chart inverso de *padaccheda* (segmentación de texto sánscrito continuo en sus palabras constituyentes) con la ejecución en C99 de las reglas gramaticales de Pāṇini. Lo desarrolla Sai Rohit Chakrapani Akula y se publica en HuggingFace bajo la librería `transformers` con código personalizado (`custom_code`).

El problema que aborda es concreto y bien delimitado dentro del NLP formal del sánscrito: la resolución de *sandhi* (transformaciones eufónicas en frontera de palabra), la invariancia de casos *kāraka* respecto al orden de palabras y la verificación de prosodia métrica (*chandas*). El autor declara que el motor funciona sin GPU, con menos de 4 MB de RAM y cero parámetros neuronales, apoyándose en operaciones bitwise sobre registros de 64 bits que mapean los 43 fonemas de Pāṇini y los pesos moraicos binarios de Piṅgala.

Su relevancia actual es doble. Por un lado, ofrece una alternativa auditable y de coste energético mínimo frente a modelos neuronales en una tarea especializada; por otro, sirve como preprocesador determinista para pipelines de NLP sánscrito. Conviene subrayar que las cifras publicadas son declaradas por el autor y figuran como no verificadas (`verified: false`) en el model-index, y que el repositorio no presenta pesos neuronales ni una arquitectura transformer convencional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor deterministico de reglas P-ISA (Paninian Instruction-Set Architecture); parser chart inverso de Padaccheda sobre transformaciones eufonicas del Ashtadhyayi; ejecucion C99 sin asignacion dinamica. No es un transformer neuronal |
| Parametros totales | 0 parametros neuronales (motor basado en reglas y bitmasks) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no hay ventana de contexto neuronal; el parser procesa frases completas de forma determinista) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Sanscrito (codigo `sa`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible. No se distribuyen pesos neuronales; el artefacto es codigo Python mas un motor C99 compilado y ficheros auxiliares de recuento de palabras (`sighum_word_counts.json`) |

## Arquitectura y entrenamiento

La pieza central es un parser chart inverso de *padaccheda* que reconstruye las fronteras de palabra a partir de texto sánscrito con *sandhi* aplicado. Se apoya en un recuento de palabras (`sighum_word_counts.json`) y ejecuta la inversión de las reglas eufónicas del *Aṣṭādhyāyī* de forma determinista, sin asignación dinámica de memoria en la ruta crítica (C99 *zero-allocation*). Complementariamente, el sistema traduce los 14 *Māheśvara Sūtras* a operaciones bitwise (AND/OR) sobre registros de 64 bits, de modo que los *pratyāhāra* se evalúan en un solo ciclo, y mapea los pesos moraicos de la prosodia de Piṅgala (*laghu* = 0, *guru* = 1) a bitmasks de hardware.

No hay entrenamiento en el sentido habitual: no se mencionan tokens de entrenamiento, composición de dataset, RLHF ni DPO. La base es la gramática generativa de Pāṇini (3.996 *sūtras* del *Aṣṭādhyāyī* y 1.425 raíces del *Dhātupāṭha*), y el autor sitúa el precedente teórico en el artículo de Rick Briggs (NASA Ames, 1985) *"Knowledge Representation in Sanskrit and Artificial Intelligence"*, que argumenta el isomorfismo entre la red gramatical pāṇiniana y las redes semánticas modernas. La innovación técnica declarada es, por tanto, de ingeniería: traducción de reglas lingüísticas a estructuras de datos indexables y a operaciones de bitmask ejecutables en CPU, con el objetivo explícito de reducir el consumo energético (*green-ai*, *zero-gpu*).

## Capacidades

- Segmentación inversa de *sandhi* (*padaccheda*): divide texto sánscrito continuo en palabras. Ejemplo de la model card: `etac cānyac ca kauravya prasaṅgi kaṭukodayam` se resuelve como `etat ca anyat ca kauravya prasaṅgi kaṭuka udayam`.
- Invariancia de roles sintácticos *kāraka* frente al orden de palabras: el autor declara coincidencia exacta del 100 % sobre las 5.040 permutaciones (7!) de un conjunto de prueba.
- Análisis de prosodia métrica (*chandas*): identificación de metros clásicos (Anuṣṭubh, Gāyatrī, Triṣṭubh) mediante pesos moraicos binarios.
- Evaluación de *pratyāhāra* por bitmask: ejecución de operaciones bitwise AND/OR sobre registros de 64 bits, declarada a 23,0 millones de evaluaciones de registro por segundo (por debajo de 45 nanosegundos por operación).
- Ejecución sin GPU: el motor funciona íntegramente en CPU con menos de 4 MB de RAM.
- Salidas auditables: el autor indica que las predicciones del benchmark se guardan en `predictions.jsonl` para su inspección.
- No dispone de generación de texto libre, razonamiento general, matemáticas, código, visión, audio, *tool calling*, capacidades de agente ni multilingüismo. Su ámbito es exclusivamente el sánscrito y las tareas gramaticales descritas.

## Casos de uso

- Segmentación de corpus sánscritos digitalizados: aplicar el parser inverso de *padaccheda* sobre colecciones completas (por ejemplo, textos del *Corpus Coranicum* o archivos de GRETIL) para obtener versiones con palabras separadas, paso previo imprescindible para cualquier indexación o análisis posterior.
- Preprocesado para pipelines de NLP neuronal: normalizar y segmentar el *sandhi* antes de alimentar un modelo de traducción o de análisis morfológico, reduciendo la variabilidad de superficie que esos modelos deben aprender. Es un uso especialmente razonable porque el motor es determinista y de coste despreciable.
- Anotación sintáctica de treebanks: la invariancia *kāraka* frente al orden de palabras permite etiquetar roles sintácticos sin depender de la posición, lo que resulta útil para crear anotaciones consistentes en corpus con orden libre de constituyentes.
- Verificación métrica en edición crítica de textos: comprobar automáticamente que un verso reconstruido cumple el esquema métrico (Anuṣṭubh, Gāyatrī, Triṣṭubh) antes de fijar una lectura, con latencias declaradas del orden de 57 microsegundos por consulta.
- Herramientas didácticas de sánscrito: mostrar al estudiante la separación de palabras y el análisis de casos de un verso, con explicación trazable, ya que el motor aplica reglas explícitas en lugar de probabilidades.
- Procesamiento masivo de bajo consumo en entornos sin GPU: con menos de 4 MB de RAM y ejecución en CPU, puede desplegarse en servidores pequeños, contenedores mínimos o dispositivos embebidos donde no es viable servir un transformer.
- Digitalización y consulta de los *sūtras* de Pāṇini: el mapeo de *pratyāhāra* a bitmasks permite filtrar y evaluar conjuntos de fonemas definidos por los 14 *Māheśvara Sūtras* a alta velocidad, útil para construir índices o herramientas de consulta gramatical.
- Investigación en representación del conocimiento: reproducción y extensión del experimento de Briggs sobre isomorfismo entre gramática pāṇiniana y lógica de predicados, con una implementación ejecutable y resultados declarados sobre las 7! ordenaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Todos figuran como `verified: false`.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Segmentacion de sandhi (padaccheda inversa) | ACL/SIGHUM Sanskrit Sandhi Benchmark (`chronbmm/sanskrit-sandhi-split-sighum`), 4.200 frases de test | Token F1 | 84,59 | No |
| Segmentacion de sandhi (padaccheda inversa) | mismo dataset | Exact Match por frase | 52,29 (2.196 / 4.200) | No |
| Segmentacion de sandhi (padaccheda inversa) | mismo dataset | Throughput | 10.427 frases/s (0,096 ms por frase en un nucleo de CPU) | No |
| Invariancia de permutacion karaka (teorema de Rick Briggs) | Suite exhaustiva de 5.040 permutaciones (7! ordenaciones) | Exact Match de invariancia | 100,00 | No |
| Invariancia de permutacion karaka | misma suite | Throughput | 211.224 frases/s (Python) | No |
| Prosodia metrica (chandah) | Corpus dorado multimetro clasico | Exact Match | 100,00 | No |
| Prosodia metrica (chandah) | mismo corpus | Latencia por consulta | 57 microsegundos | No |

Datos adicionales mencionados en el texto de la model card pero no incluidos en el model-index: 3,32 mil millones de frases por segundo en el motor C99 compilado para la prueba de invariancia *kāraka*, y 23,0 millones de evaluaciones de registro por segundo (menos de 45 nanosegundos por operación) para la ejecución de *pratyāhāra* por bitmask. Estas cifras no están acompañadas de metodología detallada en la información disponible y no cuentan con verificación independiente.

## Requisitos de hardware

- VRAM para inferencia: ninguna. El motor no utiliza GPU.
- Memoria principal: menos de 4 MB de RAM según la model card.
- GPU recomendadas: no aplica; el autor posiciona el proyecto explícitamente como *zero-GPU*.
- Ejecución en hardware de consumo: sí, en cualquier CPU. No requiere acelerador.
- Opciones de despliegue: el repositorio se distribuye como código Python dentro de la librería `transformers` (`custom_code`) y como motor C99 compilado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y estas no serían de aplicación al no existir pesos neuronales.
- Latencia y throughput declarados: 0,096 ms por frase (10.427 frases/s) en la tarea de segmentación de *sandhi* sobre un núcleo de CPU; 57 microsegundos por consulta en prosodia métrica; 211.224 frases/s en Python y 3,32 mil millones de frases/s en C99 compilado para la prueba de invariancia *kāraka*. Cifras no verificadas de forma independiente.
- Reproducción local: el autor indica que `python reproduce_benchmark.py` ejecuta la suite de test completa en segundos.

## Comparativa con modelos similares

Comparativa con los sistemas citados por el propio autor en la model card para la tarea de segmentación de *sandhi* sobre el benchmark ACL/SIGHUM.

| Modelo | Parametros | Token F1 (sandhi) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Panini 1.0 Alpha (P-ISA) | 0 (motor de reglas) | 84,59 | No aplica | AGPL-3.0 | HuggingFace (`akulasairohit/panini-1.0-alpha`) |
| Vaswani Transformer baseline | 100 M+ (citado por el autor) | 84,9 | No disponible | No disponible | No disponible |
| ByT5 | No disponible | 82,7 | No disponible | No disponible | No disponible |
| BiLSTM-CRF | No disponible | 79,8 | No disponible | No disponible | No disponible |

El dato relevante de la comparación es que el motor de reglas se sitúa en el mismo orden de magnitud que el baseline transformer de más de 100 millones de parámetros (84,59 frente a 84,9 de F1) y por encima de ByT5 y BiLSTM-CRF, según las cifras declaradas por el autor. No se dispone de información sobre parámetros, contexto, licencia ni disponibilidad de los tres baselines más allá de lo aquí recogido.

## Limitaciones y advertencias

- No es un modelo generativo de propósito general. No produce texto libre, no razona fuera del dominio gramatical sánscrito y no puede emplearse como sustituto de un LLM.
- Ámbito lingüístico restringido al sánscrito (`sa`). No hay soporte multilingüe ni transferencia a lenguas relacionadas.
- No existe ventana de contexto neuronal. La unidad de procesamiento es la frase o el verso, y no se documenta comportamiento sobre documentos largos ni sobre entradas ruidosas o no canónicas.
- Benchmarks no verificados: todas las métricas del model-index están marcadas con `verified: false` y proceden del propio autor. Las cifras de throughput extremas (3,32 mil millones de frases/s en C99) no incluyen metodología detallada en la información disponible.
- Rendimiento imperfecto en la tarea principal: un 52,29 % de coincidencia exacta por frase implica que aproximadamente una de cada dos frases del benchmark no se segmenta de forma totalmente correcta, aunque las palabras individuales tengan un F1 del 84,59 %.
- Las pruebas de invariancia *kāraka* (100 %) y de prosodia (100 %) se realizan sobre conjuntos de evaluación propios (*"Exhaustive 5,040 Permutation Suite"*, *"Classical Multi-Meter Golden Corpus"*) descritos en la model card, sin detalle público disponible sobre su construcción, lo que limita la interpretación de esos porcentajes perfectos.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Integrar el motor en un servicio ofrecido por red puede obligar a liberar el código fuente de la obra derivada. Conviene revisar la compatibilidad antes de un uso comercial o de incorporarlo a un producto propietario.
- Adopción muy baja en el momento de la consulta: 0 descargas y 1 *like*. No hay evidencia de uso en producción ni de validación por terceros.
- El repositorio depende de `custom_code` y de ficheros auxiliares (`sighum_word_counts.json`), lo que implica revisar el código antes de ejecutarlo en un entorno de producción, dado que `trust_remote_code` no es un mecanismo exento de riesgo.
- Fecha de creación declarada en HuggingFace: 2026-09-12. Es posterior a la fecha habitual de consulta; conviene tratarla como dato tal cual figura en el repositorio.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a un sitio de solitario en francés), por lo que no hay fuentes independientes que corroboren las afirmaciones de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akulasairohit/panini-1.0-alpha
- Dataset del benchmark de sandhi citado por el autor: https://huggingface.co/datasets/chronbmm/sanskrit-sandhi-split-sighum
- Análisis de benchmark del repositorio: `BENCHMARK.md` (dentro del repositorio del modelo)
- Script de reproducción local: `reproduce_benchmark.py` (dentro del repositorio del modelo)
- Predicciones auditables: `predictions.jsonl` (dentro del repositorio del modelo)
- Referencia teórica citada: Rick Briggs (NASA Ames Research Center, 1985), *"Knowledge Representation in Sanskrit and Artificial Intelligence"*. No se dispone de URL en la información proporcionada.
- Fuentes web adicionales: no disponible. La búsqueda web no devolvió resultados relacionados con el modelo.
