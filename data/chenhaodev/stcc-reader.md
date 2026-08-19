# chenhaodev/stcc-reader

## Resumen

stcc-reader es un recuperador de embeddings en chino de 102 millones de parametros, desarrollado por chenhaodev como una adaptacion del modelo base BAAI/bge-base-zh-v1.5. Su funcion es mapear la autodescripcion de sintomas de un paciente o usuario hacia un protocolo de triaje telefonico STCC (Schmitt-Thompson Clinical Content) y, a partir de ahi, generar un "hint" que contiene la escalera completa de niveles de urgencia (L1 a L5) de dicho protocolo. Este hint se inserta en el system prompt de un LLM grande (por ejemplo, deepseek-v4-flash) para que este realice la clasificacion final contrastando los criterios.

El modelo resuelve un problema concreto: los LLM genericos no conocen los criterios detallados de los protocolos de triaje medico, y pedirles que los generen de memoria produce resultados pobres. La solucion propuesta es un patron de "modelo pequeno que recupera, modelo grande que decide", donde el modelo pequeno no emite un juicio, sino que recupera los criterios autenticos del protocolo. Segun los datos publicados, esta estrategia mejora la precision en un conjunto de evaluacion sintetico de 0,43 a 0,80 y reduce el sobretriaje del 51% al 16% en comparacion con no usar hint.

El modelo se distribuye en formato sentence-transformers y tambien como GGUF f16 para su uso con Ollama. Incluye un indice de 4062 criterios con sus niveles, un archivo de titulos de protocolo y un script Python (stcc_reader.py) que implementa la logica de recuperacion, agregacion por protocolo y generacion del hint. La licencia es MIT y el idioma soportado es exclusivamente chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT-base, 12 capas, 768 dimensiones) |
| Parametros totales | 102 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de bge-base-zh-v1.5, tipicamente 512 tokens) |
| Tipos de cuantizacion | GGUF f16 (210 MB); el modelo base tambien soporta cuantizaciones inferiores si se convierte |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (directorio retriever/) y GGUF (stcc-retriever-bge-base.f16.gguf) |

## Arquitectura y entrenamiento

El modelo se basa en BAAI/bge-base-zh-v1.5, un transformer BERT-base de 102 millones de parametros y 768 dimensiones de embedding, optimizado para tareas de recuperacion en chino. Sobre esta base se realizo un ajuste fino con 6100 pares (autodescripcion de sintomas → texto de criterio), donde los hard negatives son otros criterios del mismo protocolo. Se utilizo la funcion de perdida MultipleNegativesRankingLoss con 3 epocas, batch size 32 y learning rate 2e-5, entrenado en una GPU A4000 durante aproximadamente 10 minutos.

Los datos de entrenamiento se generaron mediante una reescritura coloquial de los criterios STCC realizada por multiples modelos de reescritura, con una division a nivel de protocolo: 154 protocolos para entrenamiento y 67 protocolos no vistos para evaluacion. El indice final contiene 4062 criterios con su nivel y protocolo de origen, extraidos de una tabla congelada de 4134 criterios.

La innovacion principal no esta en la arquitectura, sino en el flujo de uso: el modelo recupera el protocolo mas probable y su escalera completa de niveles, que se inserta como texto estructurado en el system prompt del LLM. Este patron evita que el LLM tenga que recordar los criterios y reduce el sobretriaje.

## Capacidades

- Recuperacion de protocolos de triaje STCC a partir de autodescripciones de sintomas en chino.
- Generacion de hints estructurados con la escalera completa de niveles (L1 a L5) del protocolo recuperado.
- Integracion con LLMs externos mediante system prompt (patron "recupera y decide").
- Soporte de modo "ladder" (escalera completa) y modo de criterios sueltos (top-5), con opcion de "floor" que solo permite subir de nivel de urgencia.
- Funcionamiento como modelo de embeddings estandar compatible con sentence-transformers y con Ollama via GGUF.
- Indice de criterios en formato JSONL que permite busqueda por similitud coseno sin necesidad de una base de datos vectorial.

## Casos de uso

- Triaje telefonico de urgencias: un sistema de atencion al paciente recibe una llamada, transcribe la autodescripcion del sintoma, el modelo recupera el protocolo STCC mas probable y su escalera de niveles, y un LLM asigna el nivel de urgencia final. Adecuado porque el modelo esta especificamente entrenado para este dominio y reduce el sobretriaje en un 51% a un 16% en evaluaciones sinteticas.

- Integracion en chatbots de salud para clasificacion previa: un asistente conversacional puede usar stcc-reader para decidir si una consulta es una autodescripcion de sintomas que merece un hint de triaje o una pregunta de conocimiento general donde el hint no aporta valor (y puede causar sobretriaje).

- Filtro previo para LLMs en sistemas de triaje hospitalario: antes de llamar a un LLM grande, se usa stcc-reader para recuperar los criterios autenticos del protocolo, evitando que el LLM alucine criterios o los recuerde de forma incorrecta.

- Evaluacion de calidad de triaje en centros de llamadas: el modelo puede usarse para comparar la clasificacion realizada por operadores humanos con la sugerida por el sistema, detectando posibles casos de infratriaje o sobretriaje en auditorias.

- Investigacion en procesamiento de lenguaje medico en chino: el modelo y sus datos de entrenamiento (criterios STCC reescritos) pueden servir como base para estudios sobre recuperacion de informacion clinica y generacion de hints para LLMs.

- Despliegue en entornos con recursos limitados: gracias a su tamano (102M parametros, GGUF de 210 MB) y a que la inferencia en CPU tarda aproximadamente 20 ms por codificacion, puede ejecutarse en servidores sin GPU o en dispositivos embebidos para triaje de primera linea.

## Benchmarks y rendimiento

La model card reporta resultados en dos conjuntos de evaluacion. El primero, core90, es un conjunto sintetico de 90 muestras (5 niveles × 3 tipos de pregunta) generado a partir de 4134 criterios reescritos y auditado por un modelo Opus. El segundo, gold40u, contiene 34 autodescripciones reales de pacientes (30 con banderas rojas y 10 sin ellas) anotadas manualmente segun los criterios STCC. Todos los resultados se obtuvieron con deepseek-v4-flash a temperatura 0, con 3 repeticiones por brazo y mayoria de votos. La matriz de coste penaliza el infratriaje con 10·d² y el sobretriaje con d (d = diferencia de nivel).

| Conjunto | Metrica | Sin hint | + top-5 criterios | + top-1 escalera (por defecto) | + top-2 escaleras |
|---|---|---|---|---|---|
| core90 | Precision (acc) | 0,43 | 0,76 | 0,80 | 0,81 |
| core90 | Coste | 1,29 | 0,54 | 0,67 | 0,51 |
| core90 | Recall L1 | 0,94 | 0,94 | 0,89 | 0,89 |
| core90 | Sobretriaje | 51% | 22% | 16% | 16% |
| gold40u (urgentes, n=17) | Coste / infratriaje | 1,76 / 12% | 2,35 / 18% | 1,29 / 6% | no reportado |
| gold40u (leves, n=17) | Coste / sobretriaje | 0,82 / 65% | 1,06 / 59% | 0,88 / 65% | no reportado |

Para el recuperador en si, sobre 1179 muestras sinteticas de test (752 con protocolos no vistos en entrenamiento), el recall de criterio a 1/3/5 es de 0,60/0,76/0,83, frente a 0,40 del modelo base bge-base-zh-v1.5 a top-1. El recall de protocolo a top-1 y top-8 es de 0,57 y 0,86 respectivamente. La model card indica que el limite superior de recall de protocolo esta alrededor de 0,86 debido a que el 81% de los criterios son unicos por protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en f16 ocupa aproximadamente 210 MB en memoria. Con cuantizacion int8 (no proporcionada oficialmente, pero posible) se reduciria a unos 105 MB, y en 4 bits a unos 52 MB. En la practica, para uso con sentence-transformers se recomienda al menos 1 GB de RAM/VRAM libre.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento se realizo en una A4000, pero la inferencia no requiere GPU.
- Compatibilidad con GPU de consumo: si, cualquier GPU moderna (RTX 2060 o superior) puede ejecutar el modelo sin problemas. Tambien funciona en CPU pura con una latencia de aproximadamente 20 ms por codificacion (segun la model card).
- Opciones de despliegue: sentence-transformers (Python), Ollama con el archivo GGUF, o integracion directa con el indice numpy (producto punto) sin servidor de vectores.
- Latencia y throughput: la model card reporta ~20 ms por codificacion en CPU. Para un indice de 4062 vectores de 768 dimensiones, el producto punto completo tarda menos de 1 ms en CPU moderna, por lo que el cuello de botella es la codificacion del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall protocolo @1 | Licencia | Notas |
|---|---|---|---|---|---|
| chenhaodev/stcc-reader | 102M | no disponible (512 tipico) | 0,57 | MIT | Especializado en triaje STCC en chino |
| BAAI/bge-base-zh-v1.5 (base) | 102M | 512 | 0,40 | MIT | Modelo generico de embeddings chinos, sin ajuste medico |
| chenhaodev/eqreader-qwen3.5-0.8b | 0,8B | no disponible | no aplica | Apache-2.0 | Modelo LLM pequeno del mismo autor para extraccion de emociones y keywords, no recuperador |

No hay datos publicados de comparacion directa con otros recuperadores medicos en chino (como BGE-large-zh o modelos de dominio clinico). La comparacion mas relevante es contra el modelo base, que stcc-reader supera claramente en recall de criterio (0,60 vs 0,40 a top-1).

## Limitaciones y advertencias

- El modelo solo soporta chino; no funciona con otros idiomas.
- La longitud de contexto no esta documentada explicitamente; se hereda del modelo base (tipicamente 512 tokens), lo que limita autodescripciones muy largas.
- Los datos de evaluacion son limitados: core90 tiene solo 90 muestras sinteticas y gold40u 34 muestras reales, con etiquetas generadas por el propio modelo y auditadas parcialmente. Los numeros deben leerse como indicativos, no como resultados definitivos.
- La model card advierte que el LLM grande usado en la evaluacion (deepseek-v4-flash) tiene una alta variabilidad: con el mismo prompt y temperatura 0, 25 de 60 muestras cambiaron de nivel entre ejecuciones. Esto afecta a la fiabilidad de cualquier evaluacion.
- El hint generado es solo una sugerencia; el LLM final es quien decide. Si el protocolo recuperado es incorrecto, el hint puede inducir a error.
- Los criterios STCC estan traducidos al chino y reescritos de forma coloquial; pueden existir diferencias con la version original en ingles.
- El modelo esta pensado para uso de investigacion y como apoyo al triaje, no como sustituto de un profesional medico. La model card indica explicitamente que no hace diagnosticos y que en emergencias se debe llamar al 120.
- La licencia MIT cubre los pesos del modelo, pero los criterios STCC tienen su propia licencia (Schmitt-Thompson Clinical Content) que puede restringir el uso comercial; la model card los marca como "solo para investigacion".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenhaodev/stcc-reader
- Modelo base BAAI/bge-base-zh-v1.5: https://huggingface.co/BAAI/bge-base-zh-v1.5
- Modelo relacionado del mismo autor (eqreader-qwen3.5-0.8b): https://huggingface.co/chenhaodev/eqreader-qwen3.5-0.8b
- Espacio del autor en HuggingFace: https://huggingface.co/chenhaodev/spaces
