# arcinstitute/evo2_40b

## Resumen

Evo 2 40B es un modelo de lenguaje de ADN desarrollado por el Arc Institute, entrenado de forma autorregresiva sobre billones de tokens de secuencia genómica. No es un modelo de lenguaje natural: su alfabeto son los nucleótidos y su objetivo es modelar genomas completos a resolución de un solo nucleótido, integrando información en ventanas de hasta 1.000.000 de pares de bases. Con 40.000 millones de parámetros y 50 capas, es el checkpoint más grande de la familia Evo 2, que también incluye una variante de 7B y versiones base entrenadas con contexto de 8.192.

El modelo aborda un problema clásico en genómica computacional: la mayoría de los modelos anteriores trabajaban con contextos cortos (miles de bases) y perdían la señal de variantes puntuales al agregar información. Evo 2 está diseñado explícitamente para retener sensibilidad a cambios de un único nucleótido mientras integra dependencias a escala de genes, operones y regiones regulatorias largas, lo que lo hace útil tanto para anotación y predicción de efectos de variantes como para diseño de secuencias.

Su relevancia actual radica en tres factores: la escala de entrenamiento (9 billones de pares de bases procedentes de un atlas genómico curado que cubre todos los dominios de la vida), la ventana de contexto de hasta 1M de tokens y una licencia Apache 2.0 que permite uso comercial sin restricciones nominales. Los checkpoints están publicados en Hugging Face (repo de 82,3 GB) con 466 descargas y 104 likes en el momento de la consulta, y existe despliegue gestionado vía NVIDIA NIM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; modelo autorregresivo de 50 capas para modelado de ADN a resolucion de nucleotido |
| Parametros totales | 40B |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | Hasta 1.000.000 de tokens en el checkpoint `evo2_40b`; 8.192 en `evo2_40b_base` |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible; el modelo opera sobre secuencias de ADN, no sobre lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la informacion proporcionada (tamano del repo: 82,3 GB) |

## Arquitectura y entrenamiento

Evo 2 es un modelo autorregresivo entrenado sobre secuencias de ADN, con 50 capas y 40.000 millones de parametros en este checkpoint. La model card no detalla el tipo de bloque ni la innovacion arquitectonica concreta; unicamente se especifica el caracter autorregresivo, el numero de capas y la escala de contexto. La familia se organiza en dos ramas: los checkpoints `evo2_40b` y `evo2_7b`, entrenados hasta 1M de longitud de secuencia, y los checkpoints `_base` (40B, 7B y 1B) entrenados con contexto de 8.192, lo que sugiere un proceso de extension de contexto progresivo sobre un modelo base preentrenado.

En cuanto a datos, el paper publicado en Nature describe un entrenamiento sobre 9 billones de pares de bases de ADN procedentes de un atlas genomico altamente curado que abarca todos los dominios de la vida: genomas de bacterias y fagos, plantas y animales, incluido el humano. La model card no aporta informacion sobre composicion exacta del dataset, uso de RLHF/DPO ni sobre tecnicas de decodificacion especulativa o atencion lineal. Tampoco se documentan en la informacion disponible las etapas de alineamiento posteriores al preentrenamiento.

## Capacidades

- Modelado de secuencias de ADN a resolucion de un solo nucleotido, con sensibilidad explicita a variantes puntuales.
- Integracion de informacion en contextos genomicos largos, hasta 1.000.000 de pares de bases en el checkpoint principal.
- Prediccion de efectos de variantes: evaluacion de como un cambio de base afecta a la probabilidad de la secuencia bajo el modelo.
- Anotacion funcional de regiones genomicas (elementos regulatorios, fronteras de genes, estructuras de operones) por senal de likelihood.
- Modelado y diseno de genomas: generacion y puntuacion de secuencias candidatas, segun la descripcion del repositorio oficial ("genome modeling and design").
- Generalizacion entre dominios de la vida, al haber sido entrenado con genomas de bacterias, fagos, plantas y animales.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se documenta soporte multilingue en sentido convencional: la unica "lengua" del modelo es la secuencia de ADN.

## Casos de uso

- Prediccion de efectos de variantes en estudios de asociacion: puntuar la diferencia de log-verosimilitud entre la secuencia de referencia y la variante para priorizar SNPs candidatos antes de validacion experimental, aprovechando la sensibilidad a nucleotido unico.
- Anotacion de genomas recien secuenciados: usar la verosimilitud por base para localizar genes, limites de exones o regiones regulatorias en organismos con poca anotacion curada, gracias a la cobertura de todos los dominios de la vida.
- Diseno de secuencias regulatorias y promotores: generar y filtrar candidatos in silico con contexto de hasta 1M de bases, de modo que la secuencia disenada se evalue en su entorno genomico realista y no aislada.
- Analisis de arquitectura genomica a larga distancia: estudiar interacciones entre elementos separados por decenas o cientos de kilobases (enhancers, insulators) que quedan fuera del alcance de modelos con contexto de 8K.
- Priorizacion en pipeline de biologia sintetica: reducir el numero de construcciones que pasan a fase de laboratorio ordenando candidatos por su puntuacion bajo el modelo.
- Investigacion en genomica comparada: evaluar secuencias de especies distintas bajo el mismo modelo para detectar regiones conservadas funcionalmente frente a regiones divergentes.
- Filtrado y control de calidad de ensamblados: detectar regiones con baja verosimilitud que puedan indicar errores de ensamblaje o contaminacion en un genoma nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card y los resultados de busqueda unicamente incluyen afirmaciones cualitativas: que el modelo integra informacion sobre secuencias genomicas largas manteniendo sensibilidad a nucleotidos individuales, y que fue entrenado sobre 9 billones de pares de bases. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de tareas genomicas estandar (por ejemplo, prediccion de efectos de variantes o anotacion), por lo que no se puede construir una tabla comparativa de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 80-90 GB solo para pesos, mas cache KV. Con contexto de 1M de tokens el coste de cache es el factor dominante y exige planificacion especifica.
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 40-45 GB para pesos, mas cache.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 20-25 GB para pesos, mas cache; los tipos de cuantizacion soportados no estan documentados en la informacion disponible.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; configuraciones multi-GPU para sostener contextos de cientos de miles de tokens.
- GPU de consumo: solo viable con cuantizacion agresiva y contextos reducidos. Una RTX 4090 de 24 GB queda al limite en 4 bits y no permite explotar la ventana completa.
- Opciones de despliegue documentadas: repositorio oficial de GitHub (`arcinstitute/evo2`) y NVIDIA NIM (`build.nvidia.com/arc/evo2-40b`). No se confirma en la informacion disponible soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. A modo de referencia, cualquier estimacion debe considerar que el coste de atencion crece con la longitud de secuencia y que el caso de uso tipico implica secuencias de decenas de miles a un millon de bases.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evo2_40b | 40B | 50 | Hasta 1.000.000 | Apache 2.0 | Hugging Face, GitHub, NVIDIA NIM |
| evo2_7b | 7B | 32 | Hasta 1.000.000 | Apache 2.0 | Hugging Face |
| evo2_40b_base | 40B | 50 | 8.192 | Apache 2.0 | Hugging Face |
| evo2_7b_base | 7B | 32 | 8.192 | Apache 2.0 | Hugging Face |
| evo2_1b_base | 1B | 25 | 8.192 | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos verificables de otros modelos de lenguaje de ADN (por ejemplo, alternativas de otros laboratorios) en cuanto a parametros, contexto, rendimiento o licencia, por lo que la comparativa externa se marca como no disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto, codigo ni responde a instrucciones en lenguaje natural. Cualquier uso fuera del modelado de secuencias de ADN requiere adaptacion.
- Riesgo de generar secuencias plausibles pero no funcionales o no validas biologicamente. La verosimilitud alta bajo el modelo no equivale a viabilidad in vivo; toda secuencia disenada debe validarse experimentalmente.
- Sesgo de representacion del dataset: aunque cubre todos los dominios de la vida, la composicion exacta del atlas genomico no esta documentada en la informacion disponible, por lo que el rendimiento puede degradarse en linajes, virus o regiones genomica poco representadas.
- La ventana de 1M de tokens implica un coste computacional y de memoria muy alto; en la practica muchos flujos de trabajo tendran que truncar o fragmentar secuencias, perdiendo parte de la ventaja de contexto largo.
- No se documentan en la informacion disponible los tipos de cuantizacion soportados ni garantias de fidelidad numerica tras cuantizar; a 4 bits la fiabilidad de las puntuaciones de verosimilitud, que son el núcleo de casos como prediccion de variantes, debe validarse empiricamente.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, sin clausulas de uso restringido. No obstante, la generacion de secuencias biologicas conlleva consideraciones de bioseguridad que deben evaluarse a nivel organizativo antes de cualquier despliegue en produccion.
- No se han publicado en la informacion disponible resultados de benchmarks que permitan acotar el rendimiento esperado ni comparar con alternativas; la evaluacion previa a produccion debe hacerse con datos propios.
- El modelo se actualizo por ultima vez en septiembre de 2025 segun los metadatos de Hugging Face; conviene verificar la version del repositorio y del paper antes de citar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcinstitute/evo2_40b
- Checkpoint evo2_7b: https://huggingface.co/arcinstitute/evo2_7b
- Checkpoint evo2_40b_base: https://huggingface.co/arcinstitute/evo2_40b_base
- Checkpoint evo2_7b_base: https://huggingface.co/arcinstitute/evo2_7b_base
- Checkpoint evo2_1b_base: https://huggingface.co/arcinstitute/evo2_1b_base
- Repositorio oficial en GitHub: https://github.com/arcinstitute/evo2
- Paper en bioRxiv: https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1
- Paper en Nature: https://www.nature.com/articles/s41586-026-10176-5
- Despliegue en NVIDIA NIM: https://build.nvidia.com/arc/evo2-40b
- Nota del Arc Institute "Evo 2: One Year Later": https://arcinstitute.org/news/evo-2-one-year-later
