# gojiberries/naamkaran

## Resumen

Naamkaran es un modelo generativo de nombres a nivel de caracteres basado en una red neuronal recurrente LSTM, desarrollado originalmente por el usuario appeler y publicado en Hugging Face por gojiberries. El modelo aprende a generar cadenas de texto similares a nombres propios, condicionadas a un carácter inicial y a una etiqueta de género binaria, a partir de los datos de registro de votantes de Florida de principios de 2022. Su propósito principal es producir datos sintéticos para demostraciones, pruebas de software y aplicaciones exploratorias, no servir como fuente de nombres verificados ni de información demográfica.

La relevancia actual del modelo radica en su simplicidad y reproducibilidad: al ser un LSTM de caracteres con un vocabulario explícito en formato Parquet, evita dependencias frágiles de serialización y permite una carga determinista mediante un commit SHA fijado. Aunque no se especifican el número de parámetros ni la arquitectura interna, se trata de un modelo ligero, entrenado con una tarea acotada, que puede ejecutarse en hardware modesto. Su licencia MIT facilita su uso en proyectos comerciales y de investigación, siempre que se respeten las advertencias sobre sesgos y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM a nivel de caracteres (character-level RNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generacion secuencial por caracter) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con nombres de Florida, probablemente ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

Naamkaran emplea una arquitectura de red neuronal recurrente LSTM que opera a nivel de caracteres. El modelo recibe como entrada un carácter inicial y una variable binaria de género, y genera secuencias de caracteres que forman nombres plausibles. El paquete Python asociado expone controles de generación adicionales: carácter final, longitud máxima, número de muestras y temperatura de softmax, lo que permite ajustar la diversidad y las restricciones de las salidas.

El entrenamiento se realizó sobre los nombres contenidos en los datos de registro de votantes de Florida de principios de 2022, cuyo conjunto de datos se cita con DOI 10.7910/DVN/UBIG3F. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset, ni el uso de técnicas como RLHF o DPO. Una innovación destacable es el uso de un archivo Parquet para almacenar el vocabulario ordenado de caracteres, lo que hace explícito el orden de los tokens y elimina la dependencia de la serialización de scikit-learn, facilitando la reproducibilidad en inferencia.

## Capacidades

- Generacion de nombres sinteticos a nivel de caracteres, condicionada a un caracter inicial y a una etiqueta de genero binaria.
- Control de generacion mediante parametros adicionales: caracter final, longitud maxima, numero de muestras y temperatura softmax.
- Capacidad de producir multiples variaciones de nombres para una misma condicion inicial.
- No dispone de soporte para tool calling, agentes, razonamiento multi-paso, vision, audio ni otras capacidades multimodales.
- El modelo no es multilingue en el sentido amplio; su vocabulario se limita a los caracteres presentes en los datos de entrenamiento.

## Casos de uso

- Generacion de datos sinteticos para pruebas de software: el modelo puede crear listas de nombres ficticios para poblar bases de datos, formularios o interfaces de usuario durante el desarrollo y testing de aplicaciones, evitando el uso de datos personales reales.
- Demostraciones de modelos generativos: por su tamano reducido y facilidad de ejecucion, es adecuado para ilustrar el funcionamiento de RNN a nivel de caracteres en entornos educativos o talleres.
- Exploracion de variaciones onomasticas: permite generar alternativas de nombres a partir de una letra inicial o final concreta, util para estudios linguisticos o creativos sobre patrones de nombres.
- Testing de pipelines de NLP: se puede emplear para generar entradas de texto similares a nombres y verificar que los sistemas de procesamiento (tokenizadores, normalizadores, validadores) manejan correctamente este tipo de datos.
- Generacion de nombres para personajes en juegos o narrativas: aunque con cautela por los sesgos, puede servir como fuente de inspiracion para nombres ficticios en entornos de ficcion.
- Ensenanza de redes recurrentes: al ser un modelo pequeno y con codigo reproducible, es un buen ejemplo practico para explicar el entrenamiento y la inferencia de LSTM en tareas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre metricas como perplejidad, exactitud en tareas de generacion o comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- Dado que se trata de un LSTM a nivel de caracteres con un vocabulario reducido, es previsible que pueda ejecutarse en CPU sin necesidad de GPU, aunque no se ha confirmado.
- No se han documentado opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI, etc.). El modelo se distribuye como state dict de PyTorch, por lo que su integracion requiere un script de carga personalizado.
- No se conocen cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (generacion de nombres a nivel de caracteres). No se han encontrado referencias a alternativas como otros LSTM de caracteres o modelos de generacion de nombres en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con datos de registro de votantes de Florida de 2022, por lo que refleja los patrones, desequilibrios, errores y sesgos sociales presentes en esa poblacion concreta.
- El condicionamiento de genero es binario (masculino/femenino) y no representa la diversidad real de identidades de genero.
- Las cadenas generadas no deben utilizarse para inferir identidad, etnia, ciudadania, elegibilidad ni cualquier otro atributo sensible de una persona.
- No se debe tratar el conjunto de nombres generados como una muestra representativa de la poblacion general.
- Aunque la licencia MIT permite uso comercial, el autor advierte que el modelo no es una fuente de nombres verificados ni de etiquetas demograficas.
- No se especifican limitaciones de contexto o idioma, pero al ser un modelo de caracteres, su salida se limita a los caracteres presentes en el vocabulario de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/gojiberries/naamkaran
- Repositorio GitHub: https://github.com/appeler/naamkaran
- Documentacion del paquete: https://appeler.github.io/naamkaran/index.html
- Dataset de entrenamiento (DOI): https://doi.org/10.7910/DVN/UBIG3F
