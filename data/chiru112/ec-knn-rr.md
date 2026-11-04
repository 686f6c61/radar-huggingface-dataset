# chiru112/ec-knn-rr

## Resumen

`ec-knn-rr` es un artefacto publicado en HuggingFace por el usuario chiru112 orientado a la prediccion de numeros EC (Enzyme Commission) para la tarea de clasificacion enzimatica denominada "Leak CURBER". No se trata de un modelo de lenguaje ni de una red neuronal profunda en el sentido habitual: la model card describe un pipeline de recuperacion basado en busqueda de similitud con MMseqs2 sobre un indice preconstruido del conjunto de entrenamiento, seguido de una fase de reordenacion de candidatos mediante un pequeno re-ranker de gradient boosting (cuando se incluye) o, en su defecto, una votacion ponderada por bit-score.

El sistema esta disenado para ejecutarse exclusivamente en CPU (`CPU-only`), lo que lo hace util en entornos sin GPU y en pipelines de anotacion a gran escala donde el coste por inferencia es un factor critico. El repositorio ocupa 1,6 GB, coherente con un indice de busqueda de secuencias mas posibles pesos del re-ranker.

La relevancia de esta ficha es limitada en terminos de informacion publica: la model card es extremadamente escueta, no declara licencia, idiomas, arquitectura de red ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones. Se documenta, por tanto, lo que el autor expone explicitamente, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperacion: busqueda MMseqs2 sobre indice del training set + re-ranker de gradient boosting (opcional) o voto ponderado por bit-score |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: secuencias proteicas; no es un modelo de contexto tokenizado) |
| Tipos de cuantizacion | no disponible (no se publican pesos en formatos cuantizables tipo GGUF/AWQ) |
| Idiomas soportados | no disponible (tarea biologica, no linguistica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene un indice MMseqs2 preconstruido y, segun la model card, un posible re-ranker; no se detalla el formato) |

## Arquitectura y entrenamiento

La model card no describe una arquitectura de red neuronal convencional. El nucleo del sistema es una busqueda de similitud de secuencias con MMseqs2 de cada entrada unica contra el conjunto de entrenamiento completo, usando un indice preconstruido. Los numeros EC candidatos se extraen de los mejores hits y se ordenan mediante un re-ranker de gradient boosting (si se distribuye con el artefacto) o mediante una votacion ponderada por bit-score que selecciona el primer EC de la lista ordenada best-first.

No se especifican en la informacion disponible el numero de tokens de entrenamiento (no aplica en el sentido de LLM), la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el tamano del conjunto de entrenamiento ni la version de MMseqs2 empleada. La unica innovacion tecnica explicitamente mencionada es el mecanismo de control de tiempo ("time guard"): si la maquina es lenta, el sistema detiene la busqueda de forma temprana y asigna el EC de fallback (el mas frecuente del conjunto de entrenamiento) a las entradas restantes, que son las mas largas.

## Capacidades

- Prediccion de numeros EC para secuencias proteicas mediante recuperacion por similitud.
- Generacion de una lista ordenada best-first de EC candidatos, no solo una etiqueta unica.
- Fallback determinista: las entradas sin hit reciben el EC mas frecuente del conjunto de entrenamiento.
- Reordenacion opcional de candidatos con un pequeno modelo de gradient boosting.
- Votacion ponderada por bit-score como alternativa al re-ranker.
- Ejecucion exclusiva en CPU, sin dependencia de GPU.
- Control de tiempo para acotar la latencia en maquinas lentas.
- Interfaz de linea de comandos: `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`.

No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes ni multilingueismo, por tratarse de un sistema especializado en clasificacion enzimatica.

## Casos de uso

- Anotacion funcional a gran escala de proteinas: el sistema permite procesar lotes de secuencias en formato Parquet y emitir un JSONL con los EC predichos, aprovechando la busqueda MMseqs2 sobre un indice preconstruido para mantener el coste en CPU.
- Clasificacion enzimatica en entornos sin GPU: al ser CPU-only, puede desplegarse en servidores modestos o contenedores sin aceleracion, lo que encaja en pipelines academicos con recursos limitados.
- Priorizacion de candidatos para curacion manual: la salida best-first con varios EC permite a un curador revisar primero las hipotesis mas probables antes de confirmar la anotacion.
- Integracion en pipelines bioinformaticos existentes: la interfaz CLI con entrada Parquet y salida JSONL facilita el encadenamiento con herramientas de analisis posteriores o con orquestadores tipo Nextflow o Snakemake.
- Evaluacion comparativa de metodos de asignacion EC: el componente de re-ranker puede sustituirse o compararse con la votacion por bit-score, lo que permite medir el impacto de cada estrategia de reordenacion.
- Procesamiento con restricciones de latencia: el time guard permite fijar un presupuesto temporal y degradar de forma controlada a un EC de fallback en las secuencias mas largas, util en servicios interactivos o por lotes con SLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no se requiere GPU.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica.
- Cabe en cualquier maquina consumer con CPU moderna; el factor limitante es la RAM necesaria para cargar el indice MMseqs2 (el repositorio ocupa 1,6 GB, por lo que se recomienda al menos varios GB de RAM libre, aunque el autor no publica cifras).
- Opciones de despliegue: ejecucion directa del script `predict.py` con Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles; la model card solo menciona un time guard que corta la busqueda en maquinas lentas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni resultados que permitan una comparacion cuantitativa con otros predictores de EC (por ejemplo, herramientas basadas en BLAST, DIAMOND o modelos de lenguaje proteico).

## Limitaciones y advertencias

- La model card es minima: no declara licencia, lo que impide confirmar si el uso comercial esta permitido.
- No se publican idiomas, parametros, arquitectura de red ni formato de pesos, lo que dificulta la reproducibilidad.
- El sistema depende de un indice preconstruido del conjunto de entrenamiento; secuencias muy alejadas de ese conjunto recibiran el EC de fallback (el mas frecuente), lo que puede introducir sesgo hacia las clases mayoritarias.
- El time guard puede degradar la calidad de las predicciones en las secuencias mas largas si la maquina es lenta, sin aviso explicito al usuario.
- El re-ranker de gradient boosting es opcional ("when shipped"); si no se incluye, la calidad depende de la votacion por bit-score.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de asignaciones EC incorrectas por homologia remota o por transferencia de anotacion erronea desde el training set.
- No se documentan sesgos conocidos, limitaciones de contexto ni caveats de produccion adicionales.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia publica de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/chiru112/ec-knn-rr
