# AnanyaPathak/esmc-li-300m-homology-v1

## Resumen

ESMC-LI 300M Homology v1 es un modelo de lenguaje de proteinas derivado de ESM-C 300M, desarrollado por AnanyaPathak, especializado en recuperacion (retrieval) de homologias a nivel de residuo mediante interaccion tardia (late interaction, esquema MaxSim). El modelo toma el backbone ESM-C 300M, que produce embeddings de residuo de 960 dimensiones, y lo ajusta finamente sobre dominios SCOPe 2.08 ASTRAL 40% para generar representaciones utiles en la busqueda de proteinas homologas, tanto locales como remotas. Resuelve un problema concreto: la recuperacion eficiente de proteinas estructural y evolutivamente relacionadas sin depender exclusivamente de alineamientos clasicos como MMseqs2.

La relevancia actual del modelo radica en su enfoque: en lugar de producir un unico vector por proteina, conserva representaciones por residuo y aplica MaxSim para puntuar pares, lo que mejora la sensibilidad en homologias remotas donde la identidad de secuencia es baja. Se distribuye en formato GGUF (f16) junto con una cabeza de proyeccion congelada en NumPy, y se ejecuta mediante el ecosistema `esmc.cpp` y el paquete `esmc-li`.

El modelo tiene 332.013.120 parametros, un tamano de repositorio de 0,7 GB y esta pensado exclusivamente para feature extraction y retrieval de proteinas. No es un modelo generativo ni un predictor de estructura, y el autor restringe explicitamente su uso a retrieval de homologias, excluyendo anotacion funcional, prediccion estructural y uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-C 300M) con cabeza de proyeccion lineal 960 -> 128 y scoring MaxSim |
| Parametros totales | 332.013.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (GGUF); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de proteinas, no de lenguaje natural) |
| Licencia | Cambrian Open License Agreement (EvolutionaryScale) |
| Formato de pesos | GGUF (encoder) + NumPy `.npy` (cabeza de proyeccion 128 x 960) |

## Arquitectura y entrenamiento

El modelo parte del backbone ESM-C 300M, un transformer encoder que genera embeddings de residuo de 960 dimensiones. El ajuste fino congela la mayor parte de la red y entrena unicamente los ultimos 3 bloques transformer mas la LayerNorm final. Sobre la salida del encoder se anade una proyeccion lineal de 960 a 128 dimensiones con filas normalizadas en L2, cuya matriz queda congelada y se distribuye como fichero `.npy` independiente. El scoring se realiza con MaxSim sobre las representaciones por residuo, un esquema de interaccion tardia habitual en retrieval multimodal y adaptado aqui a secuencias de proteinas.

El entrenamiento utiliza dominios SCOPe 2.08 ASTRAL 40%, construyendo pares positivos de superfamilia. La semilla empleada es 0 y el autor indica que la configuracion reportada corresponde a "M3 best-val seed 0". No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un encoder de retrieval). Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal; el modelo no genera texto.

## Capacidades

- Extraccion de embeddings de proteina a nivel de residuo (960 dimensiones por residuo en el backbone, 128 tras la proyeccion).
- Recuperacion de homologias locales y remotas mediante scoring MaxSim sobre representaciones por residuo.
- Construccion de indices de proteinas en formato `.esmci` mediante `esmc-li build` y busqueda con `esmc-li search`.
- Soporte de busqueda por secuencia de consulta (`--sequence`) con parametro `--top-k`.
- Conservacion de filas especiales BOS/EOS en el scorer (requiere `esmc-embed --keep-special`).
- Capacidad de compararse favorablemente con MMseqs2 en retrieval sobre Swiss-Prot completo (100K) segun los resultados del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, vision, audio ni generacion de texto: es un encoder de features.

## Casos de uso

- Busqueda de homologias remotas en bases de proteinas: el modelo permite indexar un proteoma o un conjunto de secuencias en un fichero `.esmci` y recuperar las proteinas mas cercanas a una consulta con MaxSim, capturando relaciones de superfamilia que la identidad de secuencia no revela.
- Anotacion asistida por transferencia de homologia: dado un conjunto de proteinas no caracterizadas, se recuperan las homologas mejor puntuadas de una base curada y se usa esa evidencia como apoyo (no como sustituto) en la revision manual, respetando la restriccion del autor de no usar el modelo para anotacion funcional directa.
- Deduplicacion y agrupamiento de proteinas: los embeddings por residuo permiten construir indices y agrupar secuencias por similitud estructural-evolutiva, util en pipelines de curacion de bases de datos.
- Filtrado previo en pipelines de metagenomica: el modelo puede reducir el espacio de candidatos antes de aplicar alineamientos costosos como HMMER o MMseqs2, actuando como etapa de recuperacion de alta recall.
- Analisis comparativo de familias proteicas: la representacion por residuo y el scoring MaxSim permiten estudiar que regiones de una proteina contribuyen a la similitud con una homologa, util en investigacion estructural comparativa.
- Integracion en herramientas locales de bioinformatica: al distribuirse en GGUF y ejecutarse con `esmc.cpp`, puede desplegarse en entornos sin GPU dedicada o en flujos offline, a diferencia de servicios en la nube.
- Evaluacion de sensibilidad de metodos de retrieval: sirve como referencia para comparar contra MMseqs2 u otros metodos en experimentos de recuperacion de homologias remotas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SCOPe test (domain retrieval), cR@10 | 0,9065 (M3 best-val seed 0) |
| Swiss-Prot 100K full-length, cR@10 (modelo entrenado) | 0,8974 |
| Swiss-Prot 100K full-length, cR@10 (MMseqs2) | 0,8304 |
| SCOPe smoke 1K, top-1 misma superfamilia | 10/10 |
| SCOPe smoke 1K, top-1 misma familia | 8/10 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje natural, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF f16 ocupa 634 MiB, por lo que la inferencia cabe holgadamente en GPUs consumer con 4 GB o mas; en CPU es viable con `esmc.cpp`.
- GPU recomendadas: cualquier GPU con soporte para el runtime de `esmc.cpp`; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU consumer: si, dado el tamano del fichero f16 (634 MiB) y los 332 M de parametros.
- Opciones de despliegue: `esmc.cpp` (commit `218cc69` o posterior) y el paquete `esmc-li`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMC-LI 300M Homology v1 | 332 M | no disponible | Retrieval de homologias con MaxSim | Cambrian Open License | Hugging Face (GGUF + `.npy`) |
| ESM-C 300M (base) | 300 M aprox. | no disponible | Embeddings de proteina generales | Cambrian Open License | Hugging Face |
| MMseqs2 | no aplica (alineamiento) | no aplica | Alineamiento y busqueda de secuencias | GPL-3.0 (segun proyecto) | Codigo abierto |
| ESM-2 (650M) | 650 M | 1024 tokens aprox. | Embeddings de proteina | MIT (segun version) | Hugging Face |

La comparacion con MMseqs2 es la mas directa en la tarea: el autor reporta cR@10 de 0,8974 frente a 0,8304 en Swiss-Prot 100K. Frente a ESM-C 300M base, la diferencia es el ajuste fino para retrieval y la cabeza de proyeccion. No se dispone de datos comparativos con otros modelos de retrieval de proteinas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor restringe explicitamente el uso: no debe emplearse para anotacion funcional, prediccion de estructura ni uso clinico.
- Riesgo de falsos positivos en homologias remotas: el scoring MaxSim puede recuperar candidatos con similitud espuria; se recomienda validacion con metodos complementarios.
- Sesgo de dominio: el entrenamiento se limita a SCOPe 2.08 ASTRAL 40%, lo que puede infrarepresentar familias poco cubiertas en esa base.
- No es un modelo generativo: no produce texto, anotaciones ni explicaciones; solo embeddings y puntuaciones de similitud.
- Dependencia de dos artefactos: el GGUF y el `.npy` de la cabeza de proyeccion son ambos necesarios; usar solo uno produce resultados incorrectos.
- Requiere `esmc-embed --keep-special`: omitir esta opcion altera el scoring porque el scorer conserva las filas BOS/EOS.
- Licencia Cambrian Open License Agreement: conviene revisar sus terminos antes de uso comercial, ya que impone condiciones de uso aceptable y posiblemente restricciones adicionales.
- El repositorio tiene muy pocas descargas (17) y ningun like, lo que sugiere validacion externa limitada; los resultados reportados son del propio autor.
- No se documentan cuantizaciones alternativas a f16, lo que limita opciones de despliegue en entornos con restricciones de memoria muy severas.
- Idiomas: al ser un modelo de proteinas, la nocion de idioma no aplica; no se documenta soporte multilingue en sentido convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnanyaPathak/esmc-li-300m-homology-v1
- Repositorio del proyecto: https://github.com/AnanyaP-WDW/esmc-li
- Indices preconstruidos: https://huggingface.co/datasets/AnanyaPathak/esmc-li-indexes
- Modelo base: https://huggingface.co/EvolutionaryScale/esmc-300m-2024-12
- Licencia Cambrian Open License Agreement: https://www.evolutionaryscale.ai/policies/cambrian-open-license-agreement
