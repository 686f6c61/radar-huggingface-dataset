# AnanyaPathak/esmc-300m-homology-maxsim-v1

## Resumen

ESMC-300M Homology MaxSim v1 es un ajuste fino del modelo de lenguaje de proteinas ESM-C 300M de EvolutionaryScale, orientado especificamente a la recuperacion de homologos proteicos a nivel de residuo mediante interaccion tardia (late interaction) y puntuacion MaxSim. Lo desarrolla AnanyaPathak y se distribuye en formato GGUF cuantizado a f16, junto con una cabeza de proyeccion lineal congelada en formato NumPy. El modelo resuelve un problema concreto: la busqueda de proteinas remotamente homologas, donde las herramientas clasicas basadas en alineamiento (como MMseqs2) pierden sensibilidad cuando la identidad de secuencia cae por debajo del umbral de deteccion.

La relevancia actual reside en su enfoque de recuperacion densa: en lugar de alinear secuencias, el modelo genera embeddings por residuo de 960 dimensiones, los proyecta a 128 dimensiones con filas normalizadas L2 y compara consulta y candidato mediante MaxSim, una suma de similitudes cosenas maximas por residuo. Segun la model card, este esquema supera a MMseqs2 en recuperacion sobre Swiss-Prot completo (cR@10 de 0,8974 frente a 0,8304).

El modelo tiene 332.013.120 parametros, un repositorio de 0,7 GB y se distribuye bajo la Cambrian Open License Agreement de EvolutionaryScale. No es un modelo generativo ni de anotacion funcional: es un extractor de caracteristicas especializado en retrieval de homologos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-C 300M), ajuste fino de los 3 ultimos bloques y LayerNorm final, mas proyeccion lineal 960 -> 128 |
| Parametros totales | 332.013.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16 (GGUF); no se documentan otras |
| Idiomas soportados | No aplica (modelo de secuencias proteicas, no de lenguaje natural) |
| Licencia | Cambrian Open License Agreement (EvolutionaryScale) |
| Formato de pesos | GGUF (encoder) + .npy (cabeza de proyeccion 128 x 960) |

## Arquitectura y entrenamiento

El backbone es ESM-C 300M, un transformer encoder que produce embeddings por residuo de 960 dimensiones. El ajuste fino congela la mayor parte de la red y entrena unicamente los tres ultimos bloques del transformer y la LayerNorm final, una estrategia de bajo coste computacional que preserva las representaciones generales aprendidas por el modelo base. Sobre la salida del encoder se anade una proyeccion lineal de 960 a 128 dimensiones con filas normalizadas L2, que actua como cabeza de retrieval congelada y se distribuye por separado en el fichero `.npy`.

Los datos de entrenamiento son dominios SCOPe 2.08 ASTRAL con 40% de identidad maxima, organizados en pares positivos de superfamilia. La puntuacion se realiza con MaxSim crudo sobre las representaciones por residuo, manteniendo las filas BOS/EOS (de ahi el requisito de `esmc-embed --keep-special`). No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo de retrieval, lo esperable es un objetivo contrastivo, aunque no se confirma explicitamente.

## Capacidades

- Extraccion de embeddings por residuo de 960 dimensiones a partir de secuencias proteicas.
- Recuperacion de homologos locales y remotos mediante puntuacion MaxSim sobre representaciones de 128 dimensiones.
- Busqueda de dominios y secuencias completas en indices preconstruidos (formato `.esmci`).
- Generacion de indices de retrieval con la herramienta `esmc-retrieval build`.
- Consulta por secuencia con recuperacion top-k (`esmc-retrieval search --top-k`).
- Integracion con el ecosistema `esmc.cpp` (commit 218cc69 o posterior).
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: es exclusivamente un extractor de caracteristicas.

## Casos de uso

- Anotacion por transferencia de homologos: dada una proteina sin caracterizar, recuperar los dominios SCOPe mas proximos del indice y transferir su anotacion curada como hipotesis inicial, aprovechando la sensibilidad a homologos remotos que supera a MMseqs2.
- Busqueda en bases de datos proteicas a gran escala: indexar Swiss-Prot o un proteoma completo en formato `.esmci` y realizar consultas top-k con latencia controlada, usando los indices preconstruidos publicados en `AnanyaPathak/esmc-retrieval-indexes`.
- Descubrimiento de relaciones evolutivas remotas: identificar superfamilias relacionadas cuando la identidad de secuencia es baja y los metodos basados en alineamiento fallan, gracias a la representacion densa por residuo.
- Curacion de datasets de proteinas: detectar duplicados o miembros de la misma familia antes de construir conjuntos de entrenamiento o evaluacion, reduciendo fugas de datos entre splits.
- Priorizacion en pipelines de biologia computacional: filtrar candidatos de un cribado masivo antes de pasar a metodos costosos de modelado estructural o docking.
- Clasificacion taxonomica y funcional asistida: agrupar secuencias por similitud de embedding para explorar clusters funcionales en datos metagenomicos, usando el retrieval como paso previo a la inspeccion manual.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SCOPe test (domain retrieval), cR@10 | 0,9065 (M3 best-val, seed 0) |
| Swiss-Prot 100K longitud completa, cR@10 (modelo) | 0,8974 |
| Swiss-Prot 100K longitud completa, cR@10 (MMseqs2) | 0,8304 |
| SCOPe smoke 1K, top-1 misma superfamilia | 10/10 |
| SCOPe smoke 1K, top-1 misma familia | 8/10 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF f16 ocupa 634 MiB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM libre, incluyendo GTX 1650, RTX 3050 o superiores.
- GPU recomendadas: cualquier GPU con soporte CUDA; para indexacion de bases de datos grandes se recomiendan A100, H100 o RTX 4090 por throughput, aunque no se documentan cifras concretas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para volumenes moderados.
- Opciones de despliegue: `esmc.cpp` (commit 218cc69 o posterior) con el paquete `esmc-retrieval`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMC-300M Homology MaxSim v1 | 332 M | No disponible | Retrieval denso con MaxSim | Cambrian Open License | HuggingFace (GGUF + .npy) |
| ESM-C 300M (base) | ~300 M | No disponible | Embeddings proteicos generales | Cambrian Open License | HuggingFace |
| MMseqs2 | No aplica (alineamiento) | No aplica | Alineamiento de secuencias | GPL-3.0 (herramienta) | Codigo abierto |
| ESM-2 (650M) | 650 M | No disponible | Embeddings proteicos generales | MIT (pesos ESM-2) | HuggingFace |

La comparacion con MMseqs2 es la mas directa en terminos de tarea: el modelo ajustado reporta cR@10 de 0,8974 frente a 0,8304 en Swiss-Prot 100K. Frente a ESM-C 300M base, la diferencia es la especializacion en retrieval por residuo y la cabeza de proyeccion de 128 dimensiones. No se dispone de datos comparativos con otras alternativas de retrieval denso de proteinas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no es apto para anotacion funcional, prediccion de estructura ni uso clinico.
- Es un modelo de retrieval, no generativo: no produce texto, anotaciones ni estructuras.
- El sesgo de los datos de entrenamiento (SCOPe 2.08 ASTRAL 40%) limita la generalizacion a familias proteicas poco representadas en esa base de datos.
- Riesgo de falsos positivos en la recuperacion: la similitud de embedding no equivale a homologia demostrada; requiere validacion con metodos complementarios.
- Requiere dos artefactos (GGUF y `.npy`) y el flag `--keep-special`; un uso incorrecto del pipeline invalida las puntuaciones.
- La licencia Cambrian Open License Agreement impone restricciones de uso comercial y esta sujeta a la Acceptable Use Policy de EvolutionaryScale; es necesario revisar sus terminos antes de cualquier despliegue en produccion.
- No se documentan la longitud de contexto ni el comportamiento con secuencias muy largas o fragmentadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-03: no hay evidencia de uso comunitario ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnanyaPathak/esmc-300m-homology-maxsim-v1
- Modelo base: https://huggingface.co/EvolutionaryScale/esmc-300m-2024-12
- Indices de retrieval preconstruidos: https://huggingface.co/datasets/AnanyaPathak/esmc-retrieval-indexes
- Licencia Cambrian Open License Agreement: https://www.evolutionaryscale.ai/policies/cambrian-open-license-agreement
- Politicas de uso de EvolutionaryScale: https://www.evolutionaryscale.ai/policies
- Repositorio de `esmc.cpp` y `esmc-retrieval`: no disponible en la informacion proporcionada.
