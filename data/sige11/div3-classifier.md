# sige11/div3-classifier

## Resumen

Div3Net es un clasificador binario desarrollado por el usuario sige11 que determina si un número entero no negativo es divisible por 3. Se distribuye en HuggingFace como `sige11/div3-classifier` bajo licencia MIT y se implementa con PyTorch. No es un modelo de lenguaje: se trata de un perceptrón multicapa de aproximadamente 135.000 parámetros por miembro, desplegado como ensemble de N modelos, cuya entrada es una codificación de histograma de dígitos en lugar del número en crudo.

La peculiaridad del diseño es precisamente esa codificación: la red recibe únicamente el recuento de cada dígito (0-9) más el número total de dígitos, de modo que la información posicional se elimina por completo. El modelo no puede leer el orden de los dígitos y debe aprender por sí solo la regla aritmética subyacente (la suma de dígitos módulo 3) a partir de las frecuencias. Es un ejercicio de aprendizaje interesante sobre generalización aritmética y sobre qué representaciones internas construye una red pequeña para resolver una tarea con una regla exacta conocida.

El modelo declara una exactitud de aproximadamente el 99,8% sobre números aleatorios no vistos de entre 1 y 50 dígitos. El propio autor indica en la model card que el proyecto es "solo para probar PyTorch", que el repositorio no tiene descargas ni likes y que el tamaño publicado es de 0,0 GB. Por tanto, debe tratarse como una pieza experimental o didáctica, no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado con ReLU entre capas ocultas; ensemble de N modelos independientes |
| Parametros totales | ~135K por modelo; total del ensemble no disponible (depende de `num_models`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de tamaño fijo de 11 características (10 recuentos de dígitos + 1 recuento total normalizado) |
| Tipos de cuantizacion | no disponible; se distribuye un `state_dict` de PyTorch sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (`div3_model.pt`), diccionario con `format_version`, `config` y `state_dicts`; requiere el archivo `model.py` del mismo proyecto para cargarse |

Configuración declarada en el checkpoint: `MAX_DIGITS`, `hidden`, `layers`, `num_models` y `encoding`. Los valores concretos de `hidden`, `layers`, `num_models` y `MAX_DIGITS` no están publicados en la información disponible.

## Arquitectura y entrenamiento

La arquitectura es un MLP convencional: una capa de entrada de 11 dimensiones (diez recuentos de dígitos, uno por cada cifra de 0 a 9, más una característica normalizada con el número total de dígitos), un cuerpo de `layers` capas ocultas de `hidden` unidades con activación ReLU entre ellas, y una salida de un único logit para la clasificación binaria. El modelo se empaqueta como ensemble: el checkpoint contiene una lista de `state_dicts`, uno por cada miembro, y la predicción final se obtiene combinando sus salidas (el método exacto de agregación no está documentado).

La decisión de diseño más relevante es la codificación de histograma de dígitos. Al eliminar el orden posicional, la red no puede aprender atajos basados en la posición ni explotar patrones superficiales; la única señal disponible es la distribución de frecuencias, que resulta suficiente porque el criterio de divisibilidad por 3 depende exclusivamente de la suma de los dígitos. Es un caso claro de sesgo inductivo impuesto por el preprocesamiento que obliga al modelo a redescubrir una regla modular. No se documentan en la información disponible el número de ejemplos de entrenamiento, la composición del conjunto de datos, el optimizador, el número de épocas ni si se aplicaron técnicas de ajuste como RLHF o DPO (que, por la naturaleza de la tarea, no serían de aplicación habitual).

## Capacidades

- Clasificación binaria de divisibilidad por 3 para enteros no negativos.
- Generalización sobre números de distinta longitud dentro del rango soportado (hasta 50 dígitos según la evaluación declarada, sujeto al valor de `MAX_DIGITS`).
- Inferencia mediante ensemble, con varios modelos independientes empaquetados en un solo checkpoint.
- Ejecución en CPU con huella de memoria mínima.
- No dispone de generación de texto, razonamiento en lenguaje natural, código, matemáticas simbólicas generales, visión ni audio.
- No soporta tool calling, function calling ni flujos de agentes multi-paso.
- No tiene capacidades multilingües ni modo de razonamiento extendido.

## Casos de uso

- Validación didáctica de arquitecturas: sirve como banco de pruebas mínimo para estudiar cómo una red pequeña representa una regla aritmética exacta y qué ocurre al eliminar la información posicional de la entrada.
- Docencia de aprendizaje automático: ejemplo reproducible y de coste despreciable para ilustrar sesgos inductivos, codificación de características y ensembles en un cuaderno de PyTorch.
- Test de integración de pipelines de PyTorch: por su tamaño (~135K parámetros), es útil para verificar carga de checkpoints, serialización con `state_dicts` y ejecución en CPU dentro de un sistema de CI.
- Pruebas de despliegue en entornos sin GPU: al caber holgadamente en memoria y ejecutarse en CPU, permite validar flujos de servicio sin depender de aceleradores.
- Experimentos de interpretabilidad: analizar los pesos de las capas ocultas para comprobar si la red converge hacia una representación equivalente a la suma módulo 3.
- Investigación sobre generalización fuera de distribución: evaluar el comportamiento del modelo con longitudes de entrada distintas de las vistas durante el entrenamiento (por ejemplo, más allá de los 50 dígitos reportados) para estudiar su robustez.
- Prefiltrado aritmético trivial combinado con otras comprobaciones: con la exactitud reportada, podría integrarse como heurística dentro de una cadena de validaciones numéricas, siempre que el error residual sea tolerable.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Exactitud (accuracy) | ~99,8% | Números aleatorios no vistos de 1 a 50 dígitos (held-out) |
| MMLU, HumanEval, GSM8K, etc. | no disponible | no aplica a este tipo de modelo |

No se han publicado resultados de benchmarks adicionales (matriz de confusión, precisión, recall, F1, curvas por longitud de entrada) en la información disponible, ni comparaciones con líneas base como un clasificador lineal o una regla directa de suma de dígitos.

## Requisitos de hardware

- VRAM estimada: insignificante. Con ~135K parámetros en fp32, cada miembro del ensemble ocupa del orden de 540 KB (cálculo aproximado: 135.000 × 4 bytes). El total depende de `num_models`, cuyo valor no está disponible.
- GPU recomendadas: no se requiere GPU. Cualquier GPU, incluida una integrada, es más que suficiente; el modelo está pensado para ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU pura; el cuello de botella no es el cómputo sino la sobrecarga de carga del checkpoint.
- Opciones de despliegue: PyTorch estándar cargando el archivo `model.py` del proyecto. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un MLP de clasificación de este tamaño.
- Latencia y throughput: no documentados. Como estimación razonable, una red de 135K parámetros sobre una entrada de 11 dimensiones resuelve cada inferencia en el orden de microsegundos o pocos milisegundos en CPU, dominada por el overhead del framework más que por el cálculo matricial.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se han encontrado modelos comparables de la misma categoría (clasificadores de divisibilidad con codificación de histograma de dígitos) ni líneas base publicadas. Como referencia conceptual, la alternativa trivial sería aplicar directamente la regla de suma de dígitos módulo 3, que ofrece exactitud del 100% con coste computacional nulo; el interés de Div3Net es experimental, no competitivo.

## Limitaciones y advertencias

- Ámbito funcional extremadamente estrecho: solo resuelve una tarea de clasificación binaria sobre divisibilidad por 3 en enteros no negativos.
- No es un modelo de lenguaje ni un modelo generativo; no admite prompts, conversación ni instrucciones en lenguaje natural.
- No se documentan los sesgos del modelo, pero tampoco el conjunto de entrenamiento, por lo que la distribución exacta sobre la que fue entrenado se desconoce.
- El propio autor advierte que el proyecto es "solo para probar PyTorch", lo que sugiere un ejercicio de validación del flujo de trabajo más que un artefacto pensado para uso real.
- La exactitud reportada (~99,8%) procede de la model card del autor y no está respaldada por un conjunto de evaluación público, reproducible ni por un informe detallado; no debe asumirse como garantía.
- El modelo está limitado por el parámetro `MAX_DIGITS`; no se especifica su valor, por lo que se desconoce el rango exacto de longitudes soportadas más allá del rango evaluado (1 a 50 dígitos).
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- El tamaño del repositorio aparece como 0,0 GB y el archivo de pesos referenciado (`div3_model.pt`) podría no estar efectivamente disponible para descarga.
- La licencia MIT permite uso comercial y modificación sin restricciones reseñables, pero se aplica a un artefacto experimental sin garantías de ningún tipo.
- En producción, un clasificador de este tipo solo tendría sentido si se acepta una tasa de error distinta de cero; para divisibilidad exacta, una comprobación aritmética directa es estrictamente superior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sige11/div3-classifier
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Las consultas devolvieron únicamente páginas genéricas de YouTube (https://www.youtube.com/, https://www.youtube.com/feed, https://music.youtube.com/, https://www.youtube.com/youtube, https://www.youtube.com/feed?hl=es-419), sin relación con el modelo.
- Paper, blog, repositorio o demo adicionales: no disponible.
