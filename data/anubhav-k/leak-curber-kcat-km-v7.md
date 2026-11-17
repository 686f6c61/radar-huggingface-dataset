# anubhav-k/leak-curber-kcat-km-v7

## Resumen

`anubhav-k/leak-curber-kcat-km-v7` es un repositorio de Hugging Face publicado por el usuario anubhav-k que contiene una submission basada en Docker para la prediccion de parametros cineticos enzimaticos: la constante catalitica (kcat) y la constante de Michaelis (Km). A diferencia de un modelo de lenguaje convencional, el repositorio empaqueta un pipeline completo de inferencia (Dockerfile, script de prediccion, libreria de procesamiento de features y artefactos con pesos) orientado a un formato de entrada Parquet y salida CSV con las columnas `id`, `log10_kcat` y `log10_km`. El nombre del repositorio sugiere que forma parte de un esfuerzo por evitar fugas de datos (leak curbing) en la evaluacion de modelos de prediccion cinetica, aunque la model card no detalla la metodologia concreta.

El modelo resuelve un problema acotado pero relevante en biologia computacional y diseno de proteinas: estimar la actividad catalitica y la afinidad por sustrato de enzimas a partir de su secuencia y de la molecula sustrato, sin necesidad de ensayos experimentales costosos. La version "v7" indica una iteracion dentro de una serie de submissions, probablemente vinculada a una competicion o benchmark de prediccion de kcat/Km.

La informacion publica disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y la model card se limita a describir la estructura de ficheros y el contrato de entrada/salida. No se especifican arquitectura, numero de parametros ni longitud de contexto, por lo que muchos campos de esta ficha quedan como "no disponible". El tamano del repositorio es de 0,3 GB, lo que sugiere que los pesos del modelo y las features cacheadas ocupan un espacio moderado, compatible con un modelo de talla pequena o media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada en formato Parquet) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); artefactos adicionales en `artifacts/` |
| Tamano del repositorio | 0,3 GB |
| Entrada | fichero Parquet (`--input`) |
| Salida | CSV con columnas `id`, `log10_kcat`, `log10_km` |
| Empaquetado | Docker (`Dockerfile`, `predict.py`, `kinetics_lib.py`, `requirements.txt`) |
| Tarea | Prediccion de kcat y Km enzimaticos |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. El repositorio incluye un fichero `kinetics_lib.py` descrito como "supporting prediction and feature-processing code", lo que indica que el pipeline realiza extraccion o transformacion de features antes de la prediccion, pero no se especifica si se trata de un transformer, un modelo basado en grafos, un ensemble de descriptores fisicoquimicos o un modelo de regresion sobre embeddings proteicos. Tampoco se detallan los datos de entrenamiento, el numero de tokens o muestras, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado.

El unico indicio metodologico es el nombre del repositorio ("leak-curber"), que sugiere un enfasis en evitar fugas de informacion entre conjuntos de entrenamiento y validacion, una practica critica en benchmarks de prediccion cinetica donde la similitud entre secuencias puede inflar artificialmente las metricas. La salida en escala logaritmica (`log10_kcat`, `log10_km`) es coherente con la practica habitual en la literatura de modelar estas magnitudes en escala log para estabilizar el entrenamiento y la evaluacion. No hay mas innovaciones tecnicas documentadas.

## Capacidades

- Prediccion de la constante catalitica kcat de enzimas, expresada como `log10_kcat`.
- Prediccion de la constante de Michaelis Km, expresada como `log10_km`.
- Procesamiento de entradas tabulares en formato Parquet con identificadores por registro.
- Generacion de salidas CSV estructuradas con las columnas `id`, `log10_kcat` y `log10_km`.
- Ejecucion reproducible mediante contenedor Docker con dependencias fijadas en `requirements.txt`.
- Uso de features cacheadas y artefactos precalculados incluidos en `artifacts/`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Priorizacion de enzimas candidatas en diseno de proteinas: dado un conjunto de secuencias mutantes y un sustrato, el modelo estima `log10_kcat` y `log10_km` para ordenar candidatos antes de validacion experimental, reduciendo el numero de ensayos necesarios.
- Ingenieria de vias metabolicas: al integrar las predicciones en modelos cineticos de vias, se pueden estimar flujos metabolicos y detectar cuellos de botella sin medir cada enzima experimentalmente.
- Anotacion funcional a escala de genoma: procesar en lote ficheros Parquet con miles de pares enzima-sustrato y generar predicciones CSV para enriquecer bases de datos de anotacion cinetica.
- Filtrado en pipelines de descubrimiento de farmacos: estimar la afinidad (Km) de enzimas diana frente a sustratos o analogos para descartar combinaciones poco prometedoras antes de assays costosos.
- Evaluacion de modelos en competiciones y benchmarks: el empaquetado Docker con contrato de entrada/salida fijo facilita la reproduccion de la submission y la comparacion con otras aproximaciones en un leaderboard.
- Investigacion en biologia sintetica: generar predicciones para enzimas disenadas de novo y contrastarlas con las de enzimas naturales, identificando disenos con parametros cineticos plausibles.
- Docencia y prototipado: al ejecutarse en un contenedor con dependencias fijadas, sirve como ejemplo reproducible de pipeline de prediccion cinetica para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,3 GB) sugiere que los pesos y artefactos caben holgadamente en GPUs de consumo, pero no se especifica si la inferencia requiere GPU.
- GPU recomendadas: no disponible. Por el tamano del repositorio, cualquier GPU con al menos unos pocos GB de memoria seria suficiente si el modelo se ejecuta en GPU, pero es una inferencia no confirmada por el autor.
- Compatibilidad con GPU de consumo: probablemente si (RTX 3060, RTX 4090, etc.) dado el tamano de 0,3 GB, aunque no esta documentado.
- Opciones de despliegue: Docker (metodo oficial documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas concretas (por ejemplo, modelos publicos de prediccion de kcat/Km como DLKcat, UniKP o CatPred), ya que no se conocen la arquitectura, el tamano ni los resultados de benchmark de este repositorio. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anubhav-k/leak-curber-kcat-km-v7 | no disponible | no aplica | no disponible | Hugging Face (0 descargas) |
| Alternativas de prediccion kcat/Km | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y metodologia, lo que impide evaluar la validez cientifica de las predicciones.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se han publicado metricas de error (MAE, RMSE, R2) ni benchmarks, de modo que no hay evidencia publica de su precision frente a alternativas.
- El modelo predice en escala log10; interpretar las salidas requiere reconvertir a escala lineal y tener en cuenta la incertidumbre asociada.
- Riesgo de sobreajuste a la distribucion del dataset de entrenamiento: las predicciones fuera del espacio quimico o taxonomico cubierto pueden ser poco fiables.
- El nombre "leak-curber" sugiere conciencia sobre fugas de datos, pero no se documenta como se ha aplicado ni que garantias ofrece.
- Repositorio con 0 descargas y 0 likes: no hay comunidad que haya validado su funcionamiento ni reportado errores.
- Dependencia de un contrato de entrada muy especifico (Parquet con columnas concretas) y de artefactos cacheados que deben coincidir con la version del codigo.
- No se documentan sesgos, pero al ser un modelo cientifico puede heredar sesgos de las bases de datos cineticas (por ejemplo, sobrerrepresentacion de enzimas bien estudiadas como las de E. coli o humano).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anubhav-k/leak-curber-kcat-km-v7
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
