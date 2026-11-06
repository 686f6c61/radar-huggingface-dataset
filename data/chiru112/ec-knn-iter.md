# chiru112/ec-knn-iter

## Resumen

ec-knn-iter es un artefacto publicado en Hugging Face por el usuario chiru112 orientado a la prediccion de numeros EC (Enzyme Commission) en el contexto de la tarea de clasificacion enzimatica Leak CURBER. No se trata de un modelo de lenguaje ni de una red neuronal profunda en el sentido habitual: el sistema combina una busqueda de similitud con MMseqs2 sobre un indice preconstruido del conjunto de entrenamiento completo, una seleccion de EC candidatos a partir de los mejores hits y un mecanismo de voto ponderado por bit-score (o, cuando se incluye, un re-ranker basado en gradient boosting) para elegir la primera EC de la lista.

El diseno es CPU-only, lo que lo hace desplegable en entornos sin GPU y con requisitos de infraestructura modestos. El repositorio ocupa 1,6 GB, coherente con un indice de busqueda precompilado sobre un corpus de entrenamiento de proteinas. Incluye un guard de tiempo que detiene la busqueda de forma temprana y asigna la EC de fallback (la mas frecuente del conjunto de entrenamiento) a las entradas restantes, priorizando las mas largas, cuando la maquina es lenta.

La relevancia actual del artefacto es acotada: se publico el 6 de noviembre de 2026, no tiene descargas ni likes, y la model card es extremadamente escueta. La informacion disponible no permite confirmar arquitectura neuronal, tamano de parametros, contexto ni idiomas, por lo que esta ficha refleja unicamente lo que el autor documenta y lo que puede inferirse del contenido del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperacion con MMseqs2 (busqueda de similitud sobre indice preconstruido) mas voto ponderado por bit-score o re-ranker de gradient boosting opcional |
| Parametros totales | no disponible (no es un modelo neuronal con parametros declarados; el re-ranker, si se incluye, es un modelo de gradient boosting de tamano no especificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: secuencias de proteinas; no se declara limite de longitud) |
| Tipos de cuantizacion | no disponible (el pipeline es CPU-only y no documenta cuantizacion) |
| Idiomas soportados | no disponible (la tarea es sobre secuencias de proteinas, no sobre lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene un indice MMseqs2 preconstruido y posiblemente un re-ranker; no se detalla el formato) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo generativo. El sistema realiza una busqueda de similitud de cada entrada unica contra el conjunto de entrenamiento completo mediante MMseqs2, usando un indice preconstruido que explica el tamano del repositorio (1,6 GB). Los candidatos EC se extraen de los mejores hits y se combinan mediante un voto ponderado por bit-score; opcionalmente, cuando se distribuye, un pequeno re-ranker de gradient boosting refina la seleccion. La salida es una lista de EC ordenada de mejor a peor, con hasta tres candidatos en variantes similares del autor (ec-knn-v3 anade hasta dos EC adicionales cuando la evidencia lo justifica).

No se dispone de informacion sobre el numero de tokens o secuencias de entrenamiento, la composicion del dataset, ni sobre si hubo ajuste fino supervisado mas alla del re-ranker. La innovacion tecnica destacable es el guard de tiempo: si la maquina es lenta, el sistema corta la busqueda y aplica la EC mas frecuente del entrenamiento como fallback para las entradas no procesadas, ordenando las pendientes por longitud para maximizar el trabajo util realizado. Este diseno prioriza robustez y latencia acotada sobre precision maxima.

## Capacidades

- Prediccion de numeros EC (Enzyme Commission) a partir de secuencias de proteinas, devolviendo una lista ordenada best-first.
- Busqueda de similitud de secuencias mediante MMseqs2 contra un indice preconstruido del conjunto de entrenamiento.
- Voto ponderado por bit-score sobre las EC de los mejores hits; re-ranker de gradient boosting opcional para desempatar o refinar.
- Fallback determinista: entradas sin hit reciben la EC mas frecuente del conjunto de entrenamiento.
- Control de tiempo de ejecucion con corte temprano y asignacion de fallback a las entradas restantes.
- Ejecucion CPU-only, sin dependencia de GPU.
- Interfaz de linea de comandos: `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`.
- No dispone de tool calling, agentes, capacidades multimodales ni soporte multilingue en el sentido de modelos de lenguaje.

## Casos de uso

- Anotacion enzimatica a gran escala en pipelines bioinformaticos: el sistema procesa ficheros Parquet de secuencias y emite JSONL con la EC predicha, lo que permite integrarlo en flujos batch existentes sin infraestructura GPU.
- Clasificacion de proteinas en entornos con recursos limitados: al ser CPU-only, puede desplegarse en contenedores modestos o nodos de computo sin aceleradores, algo relevante para laboratorios con presupuesto de hardware restringido.
- Preanotacion para revision experta: la salida best-first con hasta tres candidatos permite que un curador humano revise las alternativas en lugar de partir de cero, acelerando la anotacion manual.
- Baseline en competiciones o evaluaciones de clasificacion enzimatica: sirve como referencia de recuperacion por similitud frente a la que comparar modelos neuronales mas complejos.
- Procesamiento por lotes con garantia de tiempo: el guard de tiempo asegura que el pipeline termina dentro de un presupuesto aunque el hardware sea lento, asignando fallback a las entradas no resueltas; util en entornos con SLA estrictos.
- Filtrado y triaje de candidatos en estudios de enzimas: la lista ordenada de EC permite priorizar que secuencias requieren analisis adicional (por ejemplo, validacion experimental) y cuales tienen evidencia de hit clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU ni VRAM.
- Memoria RAM estimada: no disponible, aunque debe acomodar el indice MMseqs2 preconstruido (repositorio de 1,6 GB) mas el conjunto de consulta.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica (CPU-only por diseno).
- Opciones de despliegue: ejecucion directa del script `predict.py` con Python; requiere MMseqs2 y las dependencias del pipeline (no detalladas en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles; dependen del tamano del indice, del numero de consultas y de la CPU. El guard de tiempo permite acotar el tiempo total a costa de recurrir al fallback.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-knn-iter | MMseqs2 + voto por bit-score / re-ranker GBM opcional, CPU-only | no disponible | no aplica | no disponible | Hugging Face (chiru112/ec-knn-iter) |
| ec-knn-v2 | Variante del mismo autor, recuperacion por similitud | no disponible | no aplica | no disponible | Hugging Face (chiru112/ec-knn-v2) |
| ec-knn-v3 | Variante del mismo autor, voto por bit-score con hasta tres EC candidatas | no disponible | no aplica | no disponible | Hugging Face (chiru112/ec-knn-v3) |

No se dispone de informacion sobre modelos comparables de otros autores para esta tarea concreta en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card es minima: no declara licencia, idiomas, formato de pesos ni dependencias, lo que impide evaluar su idoneidad para uso comercial o su reproducibilidad.
- Depende criticamente de la calidad y cobertura del indice de entrenamiento: secuencias sin hit reciben la EC mas frecuente, un fallback que puede ser incorrecto y sesgar la salida hacia clases mayoritarias.
- El guard de tiempo introduce un compromiso explicito entre latencia y precision: en maquinas lentas, parte de las entradas se resuelven con fallback sin evidencia real.
- Riesgo de sobreajuste al conjunto de entrenamiento y de fuga de informacion si el indice contiene las propias secuencias de evaluacion; la model card no documenta como se evita el leakage en la evaluacion de la tarea Leak CURBER.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling, agentes ni razonamiento multi-paso.
- Ausencia de benchmarks publicados y de descargas/likes: no hay evidencia externa de rendimiento ni validacion por la comunidad.
- El repositorio se publico y actualizo en la misma fecha (2026-11-06), sin historial de versiones documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chiru112/ec-knn-iter
- Variante ec-knn-v2: https://huggingface.co/chiru112/ec-knn-v2
- Variante ec-knn-v3: https://huggingface.co/chiru112/ec-knn-v3
