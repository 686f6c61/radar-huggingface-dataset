# picur/picur-120M-base-gguf

## Resumen
picur-120M-base-gguf es la version cuantizada en formato GGUF de picur-120M-base, un modelo de generacion de texto de aproximadamente 120 millones de parametros (120.404.352 segun los pesos safetensors del modelo base) publicado por el usuario picur en HuggingFace. El modelo esta etiquetado como "base", es decir, no ha pasado por un proceso de ajuste por instrucciones ni de alineacion conversacional, y su unico idioma declarado es el hungaro (hu). Se distribuye bajo licencia Apache 2.0 y esta empaquetado especificamente para ejecutarse con Ollama y otros runners compatibles con GGUF.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy pequeno, pensado como vista previa ("PREVIEW!" segun la propia model card) y orientado a experimentacion con generacion de texto en hungaro en hardware modesto, incluso sin GPU. Al ser un modelo base y no instruct, su uso esperable es como punto de partida para fine-tuning o para tareas de continuacion de texto, no como asistente conversacional listo para produccion.

La informacion publicada por el autor es extremadamente escasa: la model card se limita a un ejemplo de ejecucion con Ollama usando la cuantizacion Q8_0. No se documentan arquitectura, datos de entrenamiento, longitud de contexto ni resultados de benchmarks, por lo que buena parte de esta ficha queda marcada como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica arquitectura; el autor solo indica que es un modelo "base") |
| Parametros totales | 120.404.352 (~120 M) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; la model card solo documenta de forma explicita el tag Q8_0. No se detalla la lista completa de cuantizaciones incluidas en el repositorio |
| Idiomas soportados | hungaro (hu) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base picur/picur-120M-base se distribuye en safetensors) |

Datos adicionales: tamano del repositorio 0,4 GB; pipeline declarado text-generation; fecha de creacion registrada en HuggingFace 2026-09-12 y ultima actualizacion 2026-09-12; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento
No se ha publicado informacion sobre la arquitectura interna del modelo. La model card de picur-120M-base-gguf no incluye detalles sobre el tipo de red (transformer, MoE, SSM u otra), el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de tokenizacion. Tampoco se documenta el proceso de cuantizacion aplicado para generar el GGUF mas alla del ejemplo con Q8_0.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens utilizados, la composicion del corpus, la proporcion de texto en hungaro ni la existencia de fases de ajuste (SFT, RLHF, DPO). Al estar etiquetado como modelo "base", cabe esperar que no haya recibido ajuste por instrucciones, pero esto es una inferencia a partir de la etiqueta, no un dato confirmado por el autor. El unico artefacto tecnico documentado es el comando de inferencia con Ollama, que confirma la compatibilidad con el formato GGUF y el runtime de Ollama.

## Capacidades
- Generacion de texto en hungaro: es la unica capacidad declarada explicitamente mediante el tag de idioma `hu`.
- Continuacion de texto: al ser un modelo base, su comportamiento natural es completar secuencias, no responder a instrucciones. El ejemplo de la model card lo confirma, ya que usa un inicio de cuento ("Egyszer volt, hol nem volt...").
- Generacion de texto condicionada por prompt: la etiqueta `conversational` aparece entre los tags del repositorio, pero no hay evidencia de que exista un formato de chat ni una plantilla de dialogo documentada.
- Tool calling / function calling: no disponible; no hay ninguna referencia a soporte de herramientas en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad de este tipo.
- Capacidades multilingues: no; el modelo declara exclusivamente hungaro.
- Capacidades especiales: no se documenta modo de razonamiento (thinking), vision, audio ni decodificacion especulativa. El tag `endpoints_compatible` hace referencia al soporte de la infraestructura de HuggingFace, no a una capacidad del modelo.

## Casos de uso
- Experimentacion con generacion de texto en hungaro en local: el modelo se puede ejecutar con un unico comando de Ollama y un peso de unos pocos cientos de megabytes, lo que permite probar completaciones de texto en hungaro en un portatil sin GPU dedicada.
- Fine-tuning como modelo base para tareas en hungaro: al ser un modelo "base" de 120 M de parametros, es un candidato razonable para ajuste supervisado en tareas concretas (clasificacion de texto, resumen, normalizacion) partiendo del checkpoint original en safetensors.
- Generacion de datos sinteticos en hungaro para aumentar corpus: un modelo de este tamano puede producir texto de dominio acotado que sirva como material de aumento de datos, siempre con revision humana por el riesgo de incoherencia.
- Prototipado rapido de demos y pruebas de integracion: sirve para validar pipelines de inferencia (Ollama, llama.cpp) antes de escalar a modelos mayores, con un coste de recursos minimo.
- Despliegue en entornos con restricciones de memoria o sin conexion: al ocupar menos de 0,5 GB en repositorio, encaja en dispositivos embebidos, contenedores ligeros o entornos air-gapped donde no cabe un modelo de miles de millones de parametros.
- Docencia e investigacion sobre modelos pequenos en lenguas de recursos limitados: permite estudiar el comportamiento de un modelo base de 120 M en hungaro, analizar sesgos y comparar con otros checkpoints de la misma familia.
- Tareas de autocompletado de texto con contexto corto: util en editores o formularios donde se necesite sugerir continuaciones de frases en hungaro, siempre que se valide previamente la longitud de contexto real del modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de un foro de correo electronico ajeno por completo al ambito de la IA).

## Requisitos de hardware
- VRAM estimada para inferencia (calculos aproximados a partir del numero de parametros; no son datos publicados por el autor):
  - FP16: en torno a 240 MB solo de pesos, mas cache KV y overhead del runtime.
  - Q8_0: en torno a 127 MB de pesos.
  - Cuantizaciones de 4 bits: en torno a 70-80 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo es viable en GTX 1050 Ti, GTX 1650, RTX 3050 o integradas modernas. No requiere A100, H100 ni RTX 4090.
- Ejecucion en CPU: totalmente viable; el modelo cabe en RAM sin problema y puede correr en un portatil convencional.
- Consumer GPU: si, cabe en practicamente cualquier GPU consumer de los ultimos diez anos, e incluso en dispositivos de placa unica con poca memoria.
- Opciones de despliegue: Ollama, mediante el comando `ollama run hf.co/picur/picur-120M-base-gguf:Q8_0`; llama.cpp y cualquier runtime compatible con GGUF. El soporte en vLLM o TGI para GGUF de este tipo de repositorios no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo ni de una comparativa publicada con alternativas. La tabla siguiente recoge unicamente referencias generales de modelos de tamano comparable en el espacio de modelos pequenos; los datos de las alternativas son de conocimiento general y no proceden de una evaluacion conjunta con picur-120M-base-gguf, por lo que no deben interpretarse como una comparacion de calidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| picur-120M-base-gguf | 120.404.352 | no disponible | Apache 2.0 | HuggingFace (GGUF), Ollama |
| GPT-2 (referencia) | ~124 M | 1024 tokens | licencia tipo MIT modificada | HuggingFace, ampliamente replicado |
| TinyLlama-1.1B (referencia) | ~1,1 B | 2048 tokens | Apache 2.0 | HuggingFace, Ollama |
| Qwen2.5-0.5B (referencia) | ~0,5 B | 32.768 tokens | Apache 2.0 | HuggingFace, Ollama |

Diferencias clave frente a estas alternativas: picur-120M-base-gguf es un modelo base sin ajuste por instrucciones, con soporte declarado unicamente para hungaro, mientras que las alternativas citadas son modelos multilingues y, en el caso de TinyLlama y Qwen2.5, con variantes ajustadas por instrucciones. No hay datos que permitan afirmar cual rinde mejor en tareas en hungaro.

## Limitaciones y advertencias
- Es un modelo "base": no esta ajustado por instrucciones, por lo que no cabe esperar que siga ordenes ni mantenga un formato de dialogo. Usarlo como asistente producira resultados pobres.
- Riesgo elevado de alucinacion y de texto incoherente: con 120 M de parametros es esperable que la generacion pierda coherencia en secuencias largas, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de contexto largo sin verificar previamente el limite real del modelo.
- Idioma unico: solo hungaro. No hay garantia de comportamiento util en castellano ni en otras lenguas.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos de genero, etnicos, politicos o de otro tipo. Un corpus no documentado aumenta el riesgo de sesgos no detectados.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero el autor no ofrece garantias sobre el modelo ni sobre los datos de entrenamiento.
- Estado de vista previa: la propia model card lo marca como "PREVIEW!", lo que sugiere que puede tratarse de un artefacto provisional, posiblemente sustituido o retirado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, y ausencia total de documentacion externa, discusiones o evaluaciones independientes. No hay senal de uso en produccion.
- Metadatos a verificar: la fecha de creacion registrada (2026-09-12) resulta llamativa; conviene confirmar la vigencia y el estado del repositorio antes de integrarlo en cualquier proyecto.
- Compatibilidad limitada: el repositorio esta orientado a GGUF y Ollama; el uso con otros runners o con librerias de transformers puede requerir convertir o descargar el modelo base original.

## Enlaces
- Repositorio GGUF en HuggingFace: https://huggingface.co/picur/picur-120M-base-gguf
- Modelo base: https://huggingface.co/picur/picur-120M-base
- Ejemplo de uso con Ollama (incluido en la model card): `ollama run hf.co/picur/picur-120M-base-gguf:Q8_0 "Egyszer volt, hol nem volt, a digitális tengeren "`
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.
