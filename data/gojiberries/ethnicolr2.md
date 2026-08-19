# gojiberries/ethnicolr2

## Resumen

ethnicolr2 es un modelo de aprendizaje automatico basado en redes neuronales LSTM que predice la raza y la etnia de una persona a partir de su nombre (apellido o nombre completo). Fue desarrollado por el usuario gojiberries como una implementacion moderna en PyTorch del paquete original ethnicolr, y se distribuye a traves de HuggingFace y GitHub. El modelo esta entrenado con datos del censo de Estados Unidos y con registros de votantes de Florida, lo que le permite estimar la distribucion racial de un nombre en categorias como blanca, negra, asiatica o hispana.

La relevancia de este modelo radica en su aplicacion para estudios sociodemograficos, analisis de sesgos en sistemas automatizados y cualquier tarea que requiera inferir caracteristicas demograficas a partir de nombres. Su arquitectura es relativamente sencilla (un LSTM con preprocesamiento de fragmentos de dos caracteres), lo que lo hace ligero y facil de desplegar en entornos con recursos limitados. El repositorio en HuggingFace no incluye una model card detallada, pero la documentacion externa confirma que se trata de un clasificador de etnia/raza con soporte para apellido unico o nombre completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada fija de 20 o 25 tokens segun el modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (nombres de origen estadounidense) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura LSTM clasica. El preprocesamiento consiste en concatenar apellido y nombre (en el modelo de nombre completo), capitalizar la primera letra de cada palabra y dividir el nombre en fragmentos de dos caracteres (bi-chars). Por ejemplo, "Smith" se convierte en "Sm", "mi", "it", "th". Se eliminan los bi-chars que aparecen menos de 3 veces o mas del 30% de las veces en el dataset, y se construye un vocabulario ordenado por frecuencia. Las secuencias se rellenan hasta una longitud fija: 20 para el modelo de solo apellido y 25 para el modelo de nombre completo. El dataset se divide en 80% entrenamiento y 20% validacion, y se entrena el LSTM con validacion fuera de muestra.

Los datos de entrenamiento provienen del censo de EE.UU., que proporciona la distribucion racial de cada apellido. Para construir el dataset, se toma una muestra ponderada por la frecuencia del apellido en la poblacion (count/total_count) y se asigna la raza proporcionalmente a la distribucion observada, usando la funcion suelo (floor) para evitar fracciones. Este proceso genera un conjunto de datos etiquetado que el modelo aprende a clasificar.

## Capacidades

- Prediccion de raza y etnia a partir de apellido (modelo censal o modelo de Florida).
- Prediccion de raza y etnia a partir de nombre completo (modelo de Florida).
- Clasificacion en categorias raciales del censo de EE.UU.: blanca, negra, asiatica, hispana, entre otras.
- Soporte para nombres con multiples palabras (nombre completo).
- Entrenamiento especifico con datos de Florida para mayor precision en esa region.
- Implementacion ligera en PyTorch, adecuada para inferencia en CPU.

## Casos de uso

- Analisis sociodemografico en investigacion academica: permite estimar la composicion racial de una lista de nombres para estudios de desigualdad o segregacion, utilizando el modelo censal con apellidos.
- Deteccion de sesgos en sistemas de contratacion: las empresas pueden usar el modelo para auditar si sus procesos de seleccion favorecen o perjudican a ciertos grupos etnicos, analizando los nombres de los candidatos.
- Segmentacion de mercado por origen etnico: una agencia de marketing puede clasificar una base de datos de clientes por nombre para disenar campanas dirigidas a comunidades especificas.
- Verificacion de datos en censos locales: organismos publicos pueden comparar las predicciones del modelo con datos reales para detectar errores de registro.
- Estudios de genealogia y ascendencia: los usuarios pueden estimar el origen etnico de antepasados a partir de apellidos historicos, usando el modelo de Florida si los registros provienen de ese estado.
- Investigacion en ciencias politicas: analizar la correlacion entre nombres y comportamiento electoral mediante la clasificacion etnica de listas de votantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de precision, recall o F1 para este modelo en la documentacion publica.

## Requisitos de hardware

- El modelo es pequeno (un LSTM con entrada de 20-25 tokens) y puede ejecutarse en CPU sin problemas.
- No se especifican requisitos minimos de VRAM, pero se estima que cabe en cualquier GPU con mas de 1 GB de memoria, e incluso en CPU pura.
- Compatible con PyTorch, por lo que puede desplegarse con TorchServe, o exportarse a ONNX para inferencia en entornos de produccion.
- No requiere hardware especializado; una Raspberry Pi o un servidor basico son suficientes para inferencia.
- El entrenamiento, si se desea rehacer, necesitaria una GPU modesta (por ejemplo, una GTX 1060 o superior) para tiempos razonables, aunque el dataset no es masivo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificacion etnica por nombre. El unico modelo directamente comparable es el original ethnicolr, que usa una arquitectura similar pero implementada en Keras. ethnicolr2 se diferencia por usar PyTorch y por ofrecer modelos entrenados con nombres unicos, mientras que ethnicolr se entrena con nombres duplicados. No hay metricas publicas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgo geografico: el modelo esta entrenado exclusivamente con datos de EE.UU. (censo federal y registros de Florida), por lo que su precision fuera de ese contexto es muy limitada.
- Categorias raciales limitadas: solo cubre las categorias del censo estadounidense (blanco, negro, asiatico, hispano, etc.), que no reflejan la diversidad etnica global.
- Riesgo de errores en nombres no anglosajones: nombres de origen africano, asiatico o europeo no representados en los datos de entrenamiento pueden producir predicciones incorrectas.
- Uso etico: la prediccion de raza a partir de nombres puede perpetuar estereotipos o ser utilizada para discriminacion. Debe emplearse con cautela y en contextos donde sea legal y eticamente justificable.
- Licencia no especificada: no se indica si el modelo puede usarse comercialmente, lo que genera incertidumbre legal para su integracion en productos.
- Dependencia de la calidad de los datos del censo: los datos del censo de EE.UU. tienen sesgos historicos y pueden no representar fielmente la autoidentificacion racial.

## Enlaces

- [HuggingFace - gojiberries/ethnicolr2](https://huggingface.co/gojiberries/ethnicolr2)
- [GitHub - appeler/ethnicolr2](https://github.com/appeler/ethnicolr2)
- [Documentacion oficial - ethnicolr2 0.3.2](https://appeler.github.io/ethnicolr2/index.html)
- [API Reference - Models](https://appeler.github.io/ethnicolr2/api-reference/models.html)
- [Read the Docs - ethnicolr2](https://ethnicolr2.readthedocs.io/en/latest/)
