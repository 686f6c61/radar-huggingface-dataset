# abelcetina/u2t01-bert-squad

# Ficha tecnica: abelcetina/u2t01-bert-squad

## Resumen

`abelcetina/u2t01-bert-squad` es un modelo de respuesta a preguntas extractiva (extractive question answering) obtenido mediante ajuste fino completo de `google-bert/bert-base-uncased` sobre el conjunto de datos SQuAD v1.1. Lo desarrolla el usuario abelcetina (equipo U2T01) como parte de una practica universitaria titulada *Adapting BERT for NLP tasks*, cuyo objetivo es reproducir la comparativa entre adaptacion basada en caracteristicas y ajuste fino descrita en la seccion 5.3 del articulo original de BERT.

El modelo conserva la arquitectura del encoder de BERT-base (12 capas, 108.893.186 parametros en total) y anade una cabeza de dos salidas lineales que predicen la posicion del token de inicio y del token de fin de la respuesta dentro del contexto. Se entreno con ajuste fino completo (el 100 % de los parametros recibio gradientes), usando una tasa de aprendizaje reducida para el cuerpo del encoder y otra mayor para la cabeza recien inicializada.

Su relevancia es principalmente docente y metodologica: sirve como referencia reproducible de un flujo de ajuste fino de BERT para QA extractiva en un presupuesto de computo minimo (una unica GPU Tesla T4 de Google Colab). La adaptacion se hizo sobre un subconjunto de 15.000 ejemplos de entrenamiento, por lo que sus metricas absolutas quedan por debajo de las de un entrenamiento con el conjunto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (12 capas) + cabeza de QA extractiva de dos salidas lineales (inicio y fin del span) |
| Parametros totales | 108.893.186 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens (truncado en entrenamiento y en inferencia); el encoder base admite hasta 512 |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 para los pesos; el dataset de entrenamiento SQuAD v1.1 se distribuye bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors (cargable con la libreria transformers) |

## Arquitectura y entrenamiento

Se parte de `bert-base-uncased`, un encoder Transformer bidireccional de 12 capas con 108.893.186 parametros. El modelo base esta preentrenado de forma auto-supervisada (masked language modeling y next sentence prediction) sobre BookCorpus y Wikipedia en ingles. Sobre esa base se anade una cabeza de QA extractiva formada por dos salidas lineales que predicen, respectivamente, la probabilidad de cada token de ser el inicio y el fin del span de respuesta. El conjunto de etiquetas son las posiciones de inicio y fin de la respuesta dentro del contexto.

El ajuste fino fue completo (`--method full`): no se congelo ningun componente, por lo que tanto los embeddings como las 12 capas del encoder y la cabeza recibieron gradientes. Se entreno durante 2 epocas con tamano de lote 16, longitud maxima de secuencia 384, weight decay 0.01, una tasa de aprendizaje de 0,001 para la cabeza y de 0,00003 para el cuerpo, y semilla 42. El entrenamiento utilizo un submuestreo de 15.000 ejemplos del split de entrenamiento de SQuAD v1.1 (que contiene 87.599 preguntas) para ajustarse al presupuesto de una GPU Tesla T4, con 1.894 pasos que se completaron en 638,1 segundos (0,337 s por paso) y un pico de memoria de GPU de 3.905 MB. No se aplicaron tecnicas de RLHF ni DPO; la innovacion destacable es metodologica (comparativa reproducible entre metodos de adaptacion), no arquitectonica.

## Capacidades

- Respuesta a preguntas extractiva en ingles: dado un contexto y una pregunta, devuelve el fragmento (span) del contexto que responde a la pregunta.
- Localizacion de spans de inicio y fin dentro de un maximo de 384 tokens de entrada.
- Inferencia directa mediante el pipeline `question-answering` de transformers.
- Manipulacion de entradas con la convencion clasica de BERT: par secuencia-pregunta mas contexto separado por tokens `[CLS]` y `[SEP]`.
- Capacidad de procesar contextos de documentos tipo parrafo (articulos de Wikipedia en ingles).

No se documenta soporte de tool calling ni de function calling, ni capacidades de agente, razonamiento multi-paso, vision, audio o modo de razonamiento explicito. El modelo no genera texto libre: solo extrae un span del contexto proporcionado y, por diseno, nunca puede abstenerse (siempre devuelve un fragmento).

## Casos de uso

- Extraccion de respuestas sobre documentacion tecnica en ingles: dado un parrafo extraido de un manual y una pregunta concreta, el modelo devuelve el fragmento que contiene la respuesta, util para construir indices de busqueda con respuesta directa.
- Sistemas de busqueda semantica con respuesta resaltada: tras recuperar un pasaje relevante, el modelo localiza el span exacto que responde a la consulta del usuario.
- Practicas docentes y trabajos de asignatura: reproduce de forma reproducible el flujo de ajuste fino de BERT para QA extractiva, con hiperparametros y resultados documentados para comparar metodos de adaptacion.
- Reproduccion de experimentos de investigacion: sirve como referencia de un ajuste fino completo con una unica semilla para estudiar varianza, sobreajuste por submuestreo y efecto del truncado a 384 tokens.
- Preguntas sobre textos de Wikipedia en ingles: es el dominio mas cercano al de entrenamiento (SQuAD v1.1 se construyo con parrafos de Wikipedia y preguntas escritas por anotadores).
- Extraccion de campos concretos en formularios o contratos en ingles: al plantear cada campo como una pregunta sobre el texto, el modelo devuelve el valor presente en el documento.
- Evaluacion comparativa de tecnicas de adaptacion (feature-based frente a fine-tuning) en un entorno academico con recursos limitados.

## Benchmarks y rendimiento

Evaluacion reportada por el autor sobre el split de validacion de SQuAD v1.1:

| Metrica | Valor |
|---|---|
| exact_match | 72,5639 |
| f1 | 81,7763 |

No se evaluo sobre un split de test independiente. El autor indica que estos valores absolutos estan por debajo de un entrenamiento con el conjunto completo, porque solo se usaron 15.000 ejemplos. La comparativa con otros metodos de adaptacion se menciona como disponible en el repositorio de codigo acompanante (`report/results_tables.md`), pero los valores de esa comparacion no se incluyen en la informacion proporcionada; el propio autor senala que una diferencia inferior a un punto debe interpretarse como ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 (los pesos ocupan unos 0,44 GB) y en torno a 0,3-0,5 GB en fp16, mas la memoria de activaciones segun el lote y la longitud de secuencia. Estas cifras son estimaciones a partir del numero de parametros; el unico dato medido que se aporta es el pico de 3.905 MB durante el entrenamiento con lote 16 y secuencia 384.
- GPU recomendadas: cualquier GPU moderna es suficiente. El entrenamiento se realizo en una unica Tesla T4. Para inferencia sirven tambien GPUs de consumo como RTX 3060, RTX 4060 o superiores; el modelo cabe holgadamente incluso en GPUs de gama baja.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Opciones de despliegue: transformers (pipeline `question-answering`), con soporte de infraestructura de endpoints (se marca como `endpoints_compatible`); tambien puede exportarse a ONNX o cuantizarse a GGUF para llama.cpp/Ollama, aunque no se publican pesos en esos formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato de rendimiento es el tiempo de entrenamiento (0,337 s por paso en T4).

## Comparativa con modelos similares

No se proporcionan resultados numericos de modelos comparables en la informacion disponible. Por categoria, los modelos alternativos serian otros ajustes finos de BERT-base para QA extractiva (por ejemplo, variantes entrenadas con el conjunto completo de SQuAD v1.1) y encoders mas ligeros orientados a la misma tarea.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| abelcetina/u2t01-bert-squad | 108.893.186 | 384 tokens (base 512) | Apache 2.0 | EM 72,5639 / F1 81,7763 (validacion) |
| Alternativas comparables (otros ajustes finos de BERT-base para SQuAD) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo del dataset: las preguntas de SQuAD v1.1 fueron escritas por anotadores mirando el parrafo, por lo que comparten vocabulario con la respuesta mucho mas que las preguntas reales; ademas, todas las preguntas son respondibles, de modo que el modelo no puede abstenerse y siempre devuelve un span.
- Sesgos heredados del preentrenamiento de `bert-base-uncased` (BookCorpus y Wikipedia en ingles), que codifican estereotipos de genero, etnia y ocupacion. El autor no mitiga ni mide estos sesgos.
- Riesgo de alucinacion en el sentido de extraer spans incorrectos: el modelo nunca genera texto nuevo, pero puede seleccionar un fragmento irrelevante cuando la respuesta no esta en el contexto. No dispone de mecanismo de absteccion.
- Una sola semilla: todas las cifras provienen de una unica ejecucion con semilla 42, sin estimacion de varianza; diferencias de aproximadamente un punto frente a otra configuracion deben leerse como ruido.
- Submuestreo: solo se usaron 15.000 ejemplos de entrenamiento, por lo que las metricas absolutas quedan por debajo de las de un entrenamiento con el conjunto completo.
- Truncado de secuencia: las entradas se truncan a 384 tokens, por lo que los contextos mas largos pierden la cola tambien en inferencia.
- Limitacion de idioma: solo se ha caracterizado en ingles; el rendimiento en otros idiomas no esta evaluado y se espera inferior.
- Sin evaluaciones de robustez, adversarias, fuera de dominio ni de equidad.
- Uso fuera de alcance: no debe usarse para decisiones que afecten a personas (contratacion, moderacion con consecuencias, credito, decisiones legales o medicas).
- Restricciones de licencia: los pesos estan bajo Apache 2.0, pero el dataset de entrenamiento (SQuAD v1.1) se distribuye bajo CC BY-SA 4.0, por lo que debe revisarse esa condicion antes de una redistribucion comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abelcetina/u2t01-bert-squad
- Dataset SQuAD v1.1: https://huggingface.co/datasets/rajpurkar/squad
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Articulo de BERT: https://arxiv.org/abs/1810.04805
- Articulo de SQuAD: https://arxiv.org/abs/1606.05250
- Repositorio de codigo acompanante (mencionado en la model card, con `report/results_tables.md`): no disponible como URL en la informacion proporcionada
