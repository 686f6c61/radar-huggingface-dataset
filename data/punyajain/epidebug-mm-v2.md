# punyajain/epidebug-mm-v2

## Resumen

epidebug-mm-v2 es un modelo multimodal de diagnostico de fallos publicado por el usuario punyajain en HuggingFace bajo licencia Apache 2.0. La model card lo describe como un "seed" de razonamiento para CPU: un encoder MiniLM congelado combinado con un MLP tabular y una CNN pequena, sobre los que se montan varias cabezas de razonamiento (clasificacion de categoria de fallo, ranking de hipotesis, emparejamiento de razonamiento, generacion de rationale debil y follow-ups). No es un modelo de lenguaje generativo de proposito general: es un artefacto de investigacion orientado a la diagnosis estructurada de fallos.

El modelo se presenta explicitamente como "no un razonador de frontera" ("Not a frontier reasoner"). El propio autor indica que la via de escalado es aplicar LoRA sobre un modelo de lenguaje mayor en GPU, lo que situa a esta version como un prototipo de bajo coste computacional, pensado para ejecutarse en CPU y para validar el diseno de las cabezas de razonamiento antes de escalar.

Su relevancia actual es limitada y muy nichada: el repositorio acumula 0 descargas y 0 likes, no tiene pipeline declarado y el unico material de evaluacion referenciado es un fichero local del autor (`/workspace/epidebug-train/TRAINING_DONE.md`) que no esta publicado. Resulta util como referencia metodologica para quien trabaje en diagnostico multimodal de fallos con recursos muy limitados, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida multimodal: encoder MiniLM congelado (texto) + MLP para datos tabulares + CNN pequena, con cabezas de razonamiento multiples |
| Parametros totales | no disponible (el tamano del repositorio es de 0,1 GB, lo que sugiere un modelo de decenas de millones de parametros, pero no se publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se listan pesos cuantizados en el repositorio) |
| Idiomas soportados | no disponible (el campo de idiomas esta vacio en la tarjeta del modelo; el encoder MiniLM subyacente es mayoritariamente angloparlante, pero no se declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 0,1 GB; no se especifica si son safetensors, PyTorch binario u otro formato) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje multimodal de tres ramas. La rama de texto usa un MiniLM congelado, es decir, un encoder Transformer de la familia MiniLM cuyos pesos no se actualizan durante el entrenamiento. La rama tabular es un perceptron multicapa (MLP) que consume caracteristicas estructuradas, coherente con escenarios de mantenimiento predictivo donde se dispone de variables de sensores y metadatos. La tercera rama es una CNN pequena, presumiblemente para entradas de imagen o senal. Sobre la representacion combinada se disponen varias cabezas de razonamiento: clasificacion de categoria de fallo, ranking de hipotesis (marcado como "shuffled" en la model card), emparejamiento de razonamiento (reasoning-pair), generacion de rationale debil y generacion de follow-ups.

En cuanto a datos y procedimiento de entrenamiento, la model card menciona tres fuentes: "distractores endurecidos" (hardened distractors), "vinetas de fisica ampliadas" (expanded physics vignettes) y "cosecha de AI4I" (AI4I harvest, en referencia al conocido conjunto de mantenimiento predictivo AI4I). No se especifica el numero de tokens, la composicion porcentual del dataset, ni si se emplearon tecnicas de RLHF o DPO; dado que no es un modelo generativo de proposito general, es probable que el entrenamiento se limitara a objetivos supervisados sobre las cabezas descritas, pero esto no se confirma en la informacion disponible. La innovacion tecnica declarada es de diseno, no de escala: congelar el encoder y entrenar solo las ramas ligeras y las cabezas permite iterar en CPU, algo coherente con la etiqueta "cpu-seed" del repositorio.

## Capacidades

- Clasificacion de categoria de fallo a partir de entradas multimodales (texto, datos tabulares y presumiblemente imagen o senal).
- Ranking de hipotesis: el modelo ordena hipotesis candidatas sobre la causa de un fallo. La model card indica que el ranking se entreno sobre hipotesis barajadas ("shuffled"), lo que conviene tener en cuenta al interpretar sus salidas.
- Emparejamiento de razonamiento (reasoning-pair): parece evaluar o emparejar cadenas de razonamiento asociadas a un diagnostico.
- Generacion de rationale debil: produce justificaciones de baja confianza sobre el diagnostico; el propio nombre sugiere que no deben tratarse como explicaciones robustas.
- Generacion de follow-ups: sugiere preguntas o comprobaciones adicionales a partir de un diagnostico.
- Capacidad multimodal limitada al diseno anterior; no hay evidencia de generacion de texto libre, codigo, matematicas avanzadas ni capacidades de agente.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente que no es un razonador de frontera.
- Capacidades multilingues: no disponibles (campo de idiomas sin declarar).
- Modo "thinking" o cadena de pensamiento extensa: no documentado.

## Casos de uso

- Triaje de mantenimiento predictivo industrial: el modelo puede combinarse con variables de sensores y notas tecnicas de operarios para asignar una categoria de fallo, aprovechando la rama tabular y el encoder de texto. Es adecuado porque el coste de inferencia en CPU es minimo y el dominio de entrenamiento declarado (AI4I, vinetas de fisica) es precisamente industrial.
- Priorizacion de causas raiz en soporte tecnico: dado un informe de incidente, la cabeza de ranking de hipotesis ordena las causas probables para que un ingeniero humano revise primero las mas plausibles. No sustituye al diagnostico experto, pero puede reducir el tiempo de triaje.
- Asistente de campo con recursos limitados: al ejecutarse en CPU y ocupar decimas de gigabyte, puede desplegarse en portatiles o equipos de planta sin GPU para dar una primera clasificacion de fallo antes de escalar a un modelo mayor.
- Generacion de borradores de lista de comprobacion: la cabeza de follow-ups puede producir preguntas de verificacion que un tecnico use como guion de inspeccion, siempre con revision humana por la debilidad declarada del rationale.
- Investigacion en diagnostico multimodal: sirve como linea base reproducible para comparar estrategias de fusion de ramas (texto, tabular, vision) sin coste de GPU, dado que el encoder esta congelado.
- Curacion y aumento de datasets de fallos: el componente de distractores endurecidos y vinetas de fisica puede reutilizarse para generar ejemplos negativos dificiles en la construccion de conjuntos de datos de diagnostico.
- Evaluacion de tecnicas de explicabilidad: su cabeza de rationale debil lo convierte en un sujeto de prueba util para medir hasta que punto las justificaciones generadas por modelos pequenos son fieles al diagnostico.
- Prototipado rapido antes de escalar con LoRA: el propio autor senala que la via de escalado es aplicar LoRA sobre un LM mayor en GPU; este modelo sirve para validar el diseno de cabezas y el formato de datos antes de invertir en ese escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card remite a un fichero local del autor (`/workspace/epidebug-train/TRAINING_DONE.md`) para consultar metricas y comandos de reanudacion del entrenamiento. Ese fichero no es accesible publicamente ni forma parte del repositorio de HuggingFace, por lo que no se puede verificar ninguna cifra. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de metricas especificas de diagnostico de fallos.

## Requisitos de hardware

- El propio autor clasifica el modelo como "CPU reasoning seed" y congela el encoder MiniLM, lo que indica que la inferencia esta pensada para ejecutarse en CPU sin GPU dedicada.
- El repositorio ocupa 0,1 GB, por lo que los pesos completos caben holgadamente en memoria RAM convencional y en cualquier GPU de consumo. No se publican requisitos oficiales de VRAM.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio, cualquier GPU con 2 GB o mas deberia ser suficiente, pero es una inferencia y no un dato confirmado por el autor.
- Cabe en GPU de consumo: si, segun el tamano del repositorio; modelos como una RTX 3060, 4060 o superiores serian mas que suficientes. Tambien en CPU.
- GPU de datacenter (A100, H100) solo tendrian sentido si se escala el modelo con LoRA sobre un LM mayor, camino que el autor menciona pero no publica.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que la arquitectura no es un Transformer generativo estandar, es probable que requiera codigo de inferencia especifico del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables de la misma categoria (diagnostico multimodal de fallos con arquitectura hibrida encoder congelado + MLP + CNN) ni se ofrecen resultados que permitan una comparacion cuantitativa con alternativas. Cualquier comparacion con modelos de diagnostico industrial o con clasificadores tabulares publicados requeriria datos de evaluacion que el autor no ha hecho publicos.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo "no es un razonador de frontera". No debe presentarse ni desplegarse como sustituto de un modelo de lenguaje grande en tareas de razonamiento abierto.
- La cabeza de rationale se describe como "debil" (weak rationale), por lo que sus justificaciones no deben tratarse como explicaciones fiables de la decision. Es un riesgo directo de interpretacion erronea en entornos regulados.
- El ranking de hipotesis se entreno con hipotesis barajadas ("shuffled"); conviene verificar el comportamiento del ranking antes de usarlo para priorizar causas en produccion.
- No se declaran idiomas soportados. El encoder MiniLM subyacente esta mayoritariamente entrenado en ingles, por lo que el rendimiento en castellano u otras lenguas es incierto.
- No se publican metricas, benchmarks ni una evaluacion independiente. El unico documento de metricas referenciado es local y no accesible, lo que impide auditar la calidad del modelo.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Tratandose de cabezas de clasificacion sobre un encoder congelado, el modo de fallo mas probable es la asignacion de una categoria incorrecta con alta confianza, pero no hay datos que lo cuantifiquen.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni su cobertura demografica, geografica o de dominio, mas alla de las referencias genericas a distractores, vinetas de fisica y AI4I.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial y modificacion siempre que se conserven los avisos de copyright y licencia. No obstante, el modelo incorpora un encoder MiniLM congelado cuya licencia de origen debe verificarse por separado antes de redistribuir pesos derivados.
- Advertencia de trazabilidad: el repositorio tiene 0 descargas y 0 likes, y las fechas de creacion y actualizacion registradas (2026) resultan anomalas. Se recomienda verificar la vigencia del artefacto antes de integrarlo en cualquier flujo de trabajo.
- Ausencia de pipeline declarado: no se especifica tarea, lo que complica la integracion con herramientas estandar de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/punyajain/epidebug-mm-v2
- Referencia a metricas de entrenamiento (no publica, solo mencionada en la model card): `/workspace/epidebug-train/TRAINING_DONE.md`
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo. Los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
