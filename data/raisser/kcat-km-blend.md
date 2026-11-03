# raisser/kcat-km-blend

## Resumen

kcat-km-blend es un modelo de prediccion de parametros cineticos enzimaticos (kcat y Km) publicado por el usuario raisser en HuggingFace. No se trata de un modelo de lenguaje generativo, sino de un ensemble de dos pipelines de regresion entrenados sobre la proteina ESM-2 de 35M de parametros combinada con descriptores moleculares. El repositorio ocupa 0,6 GB y los pesos estan en formato safetensors.

El sistema combina dos ramas: (A) un ESM-2 35M congelado del que se extraen embeddings (ultima capa y media del layer 8, reducidos a 256 dimensiones via PCA) junto con descriptores de molecula (Morgan counts, MACCS y RDKit), alimentando un LightGBM por target; y (B) un ESM-2 35M con las cuatro capas superiores afinadas, un MLP para la molecula y caracteristicas cruzadas enzima x sustrato, promediado sobre tres semillas. El blend final pondera la rama B con pesos de 0,5 para kcat y 0,3 para Km.

Es relevante en el contexto de la prediccion de parametros cineticos para ingenieria de proteinas y biologia sintetica, donde estimar kcat y Km sin medirlos experimentalmente ahorra coste de laboratorio. La model card lo presenta como una submission (submission4) de una competicion, lo que sugiere un contexto de evaluacion competitiva y no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: ESM-2 35M (congelado con PCA-256 + LightGBM) y ESM-2 35M con 4 capas superiores afinadas + MLP + cross features |
| Parametros totales | no disponible (el backbone ESM-2 es de 35M; el ensemble completo no se cuantifica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud maxima de secuencia de ESM-2 empleada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de prediccion numerica sobre secuencias de proteina y moleculas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema es un ensemble de dos ramas heterogeneas. La rama A usa ESM-2 35M congelado como extractor de caracteristicas: combina el embedding de la ultima capa con la media del layer 8, reduce a 256 dimensiones mediante PCA y concatena descriptores moleculares (Morgan counts, MACCS y descriptores RDKit). Sobre ese vector entrena un LightGBM independiente por target (kcat y Km). La rama B parte del mismo ESM-2 35M pero afina las cuatro capas superiores, anade un MLP para la representacion de la molecula y caracteristicas cruzadas enzima x sustrato, y promedia tres semillas para reducir varianza.

Ambas ramas se entrenan sobre el conjunto de train del organizador mas tablas publicas de cinetica filtradas para evitar leakage, y explicitamente sin modelos preentrenados en cinetica. Un detalle de eficiencia destacable es que se comparte una unica pasada de ESM por las capas 0-7, lo que reduce el coste computacional. La inferencia esta disenada para ejecutarse solo en CPU mediante `python /app/predict.py --input INPUT --output OUTPUT`. El blend final aplica pesos por target de 0,5 (kcat) y 0,3 (Km) a la rama B.

## Capacidades

- Prediccion de kcat (constante catalitica) a partir de la secuencia de enzima y la estructura de sustrato.
- Prediccion de Km (constante de Michaelis-Menten) con el mismo par de entradas.
- Extraccion de representaciones de proteina mediante ESM-2 35M, incluyendo pooling de capas intermedias.
- Representacion de moleculas mediante descriptores Morgan counts, MACCS y RDKit.
- Modelado de interaccion enzima x sustrato mediante caracteristicas cruzadas en la rama B.
- Ejecucion en CPU sin GPU, lo que facilita el despliegue en entornos de laboratorio.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es un modelo de regresion numerica.

## Casos de uso

- Priorizacion de enzimas candidatas en ingenieria de proteinas: estimar kcat y Km de variantes antes de sintetizarlas y ensayarlas, reduciendo el numero de experimentos de laboratorio necesarios.
- Filtrado de tablas de cinetica en bases de datos: aplicar el modelo a pares enzima-sustrato sin medicion experimental para detectar entradas anomalas o completar huecos.
- Diseno de rutas metabolicas: predecir la eficiencia catalitica de enzimas heterologas al introducirlas en un organismo huesped y descartar candidatas con Km desfavorable.
- Modelado de biologia sintetica en entornos sin GPU: al ejecutarse solo en CPU, puede integrarse en servidores de laboratorio modestos o en pipelines de CI cientifico.
- Generacion de features para modelos aguas abajo: reutilizar los embeddings de ESM-2 y los descriptores moleculares como entrada de otros regresores de propiedades bioquimicas.
- Evaluacion comparativa de sustratos: analizar como varia la prediccion de kcat/Km al sustituir el sustrato manteniendo la enzima, para guiar la seleccion de sustratos en ensayos.
- Docencia y prototipado en bioinformatica: ejemplo reproducible de ensemble clasico (LightGBM) mas representaciones de proteina preentrenadas con coste de computo bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la model card indica explicitamente ejecucion solo en CPU.
- GPU recomendadas: ninguna requerida. El backbone ESM-2 35M es pequeno y el resto del pipeline (LightGBM, PCA, MLP) es ligero.
- Cabe en cualquier entorno consumer: no necesita GPU dedicada; basta con CPU y memoria RAM convencional.
- Opciones de despliegue: script propio `python /app/predict.py --input INPUT --output OUTPUT`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada. El tamano del repo (0,6 GB) sugiere un coste de carga moderado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni resultados que permitan una comparacion cuantitativa con otras aproximaciones de prediccion de kcat/Km.

## Limitaciones y advertencias

- Licencia no especificada: no hay garantia de uso comercial; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Modelo de competicion (submission4): puede estar sobreajustado al conjunto de evaluacion del organizador y no generalizar a distribuciones de enzimas o sustratos distintas.
- Sin benchmarks publicados: no es posible validar su precision frente a alternativas sin evaluacion propia.
- Cobertura limitada por los datos de entrenamiento: enzimas o clases de sustrato poco representadas en las tablas de cinetica pueden producir predicciones poco fiables.
- Riesgo de error en extrapolacion: al ser un ensemble de regresores, las predicciones fuera del rango de kcat/Km visto en entrenamiento no estan acotadas.
- Dependencia de descriptores y de la tokenizacion de ESM-2: secuencias muy largas o con caracteres no canonicos pueden degradar la representacion.
- Solo CPU en el diseno documentado: no se ofrecen instrucciones para aceleracion GPU ni para despliegue como servicio.
- Sin soporte de texto, agentes ni herramientas: no debe confundirse con un modelo de lenguaje pese a estar alojado en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raisser/kcat-km-blend
