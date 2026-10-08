# Sethblocks/Andy-Starlight-3B-GGUF

## Resumen

Andy-Starlight-3B-GGUF es una publicacion de pesos en formato GGUF derivada del modelo base Sethblocks/Andy-Starlight-3B, subida por el usuario Sethblocks. Se trata de una conversion a GGUF realizada con llama.cpp (build `b75ecd197`) que expone dos ficheros: una version BF16 sin perdida de precision y una version cuantizada Q4_K_M orientada a inferencia con recursos limitados. El repositorio se presenta en su propia model card como un "Private GGUF", es decir, una conversion de caracter privado sin documentacion publica de entrenamiento ni evaluacion.

El modelo base pertenece, segun la model card, a la familia LFM2, con 30 capas y un vocabulario de 128.000 tokens. El recuento real de parametros reportado en safetensors es de 2.697.198.592 (aproximadamente 2,7 mil millones), ligeramente por debajo de los "3B" que sugiere el nombre comercial. No se especifica la longitud de contexto, los idiomas soportados ni los datos de entrenamiento.

Su relevancia practica es limitada pero concreta: al estar en GGUF, el modelo puede ejecutarse en llama.cpp, Ollama o LM Studio sobre hardware de consumo, lo que lo hace util para pruebas locales de la arquitectura LFM2 y para experimentar con el impacto de la cuantizacion Q4_K_M frente a BF16. La ausencia total de benchmarks, de documentacion de entrenamiento y de una licencia detallada son los principales factores que limitan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (segun model card), 30 capas, vocabulario de 128.000 tokens |
| Parametros totales | 2.697.198.592 (recuento real en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados) |
| Formato de pesos | GGUF (ficheros `Andy-Starlight-3B-BF16.gguf` y `Andy-Starlight-3B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La model card indica unicamente que el modelo base es Andy-Starlight-3B, con arquitectura LFM2, 30 capas y un vocabulario de 128.000 tokens. No se aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion supervisada. Tampoco se detalla si emplea atencion estandar, atencion lineal, mezcla de expertos u otro esquema hibrido dentro de la familia LFM2.

El repositorio es exclusivamente una conversion de formato: parte de los pesos del modelo base y los serializa a GGUF mediante llama.cpp, incluyendo la plantilla de chat embebida en el propio fichero. No hay informacion sobre el proceso de destilacion, poda o reentrenamiento posterior. La unica innovacion tecnica atribuible a esta publicacion es, por tanto, la propia conversion y la disponibilidad de dos niveles de cuantizacion.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la plantilla de chat incluida en el GGUF indican uso previsto como modelo de dialogo.
- Generacion de texto general: pipeline declarado `text-generation`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el formato puede servirse mediante infraestructura compatible con la API de HuggingFace.
- Ejecucion local en CPU y GPU: al ser GGUF, puede correr con llama.cpp, Ollama, LM Studio y bindings equivalentes.
- Tool calling / function calling: no disponible (no se documenta).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio o modo de razonamiento explicito: no disponible (no se documenta).

## Casos de uso

- Asistente conversacional local sin conexion: al distribuirse en GGUF con plantilla de chat embebida, puede desplegarse en un portatil o estacion de trabajo con llama.cpp u Ollama y mantener conversaciones sin enviar datos a terceros. Es adecuado cuando la confidencialidad del contenido es un requisito y no se necesita una calidad de respuesta puntera.
- Evaluacion comparativa de cuantizacion: el repositorio incluye BF16 y Q4_K_M del mismo modelo, lo que permite medir de forma controlada la degradacion de calidad y la ganancia de memoria y velocidad al pasar de 16 bits a 4 bits por peso.
- Prototipado de aplicaciones sobre la arquitectura LFM2: util para desarrolladores que quieran probar la familia LFM2 en local antes de decidir si escalan a una variante mayor o a un despliegue en servidor.
- Generacion de texto por lotes en pipelines internos: tareas de resumen, reformulacion o clasificacion de documentos donde el coste por token debe ser cero y el throughput no es critico, ejecutando inferencia en CPU o en una GPU modesta.
- Chatbot de soporte interno on-premise: integrable en una intranet corporativa mediante un servidor llama.cpp o un contenedor con Ollama, sin dependencia de APIs externas ni coste por llamada.
- Educacion y tutoria asistida: generacion de explicaciones y ejemplos en un entorno controlado, con la advertencia de que no hay evaluacion publicada de sesgos ni de veracidad factual, por lo que requiere supervision humana.
- Investigacion sobre despliegue de modelos pequenos: banco de pruebas para medir latencia, consumo de memoria y calidad en un modelo de ~2,7 mil millones de parametros con vocabulario grande (128.000 tokens).
- Generacion de codigo asistida ligera: tecnicamente posible en un modelo de este tamano, pero no hay ningun dato de HumanEval, MBPP ni similar que respalde un rendimiento adecuado para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se han localizado evaluaciones en los resultados de busqueda web, que no guardan relacion con el modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros y del formato de pesos, no datos publicados por el autor:

- Pesos en BF16: aproximadamente 5,4 GB (2.697.198.592 parametros x 2 bytes), mas el espacio de cache KV, que no puede calcularse porque no se especifican dimensiones de atencion ni si usa GQA.
- Pesos en Q4_K_M: aproximadamente 1,7 GB, mas cache KV.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, A10, L4). Para Q4_K_M basta con 4-6 GB de VRAM (GTX 1650 4 GB en adelante, RTX 3050, RTX 3060).
- Cabe en GPU de consumo: si. Q4_K_M en practicamente cualquier GPU moderna de 6 GB o mas; BF16 en GPU de 8 GB o mas con contexto moderado.
- Ejecucion en CPU: viable con Q4_K_M y suficiente RAM del sistema (se recomienda un minimo de 4 GB libres). En BF16 se recomienda al menos 8 GB de RAM disponible.
- Apple Silicon: soportado a traves del backend Metal de llama.cpp, con memoria unificada compartida entre CPU y GPU.
- Opciones de despliegue: llama.cpp (build `b75ecd197` o compatible), Ollama, LM Studio, llama-cpp-python, servidor `llama-server` con API compatible con OpenAI, y bindings GGUF de terceros. vLLM no es la via recomendada para GGUF y no se documenta soporte oficial para este repositorio.
- Latencia y throughput: no disponible (no se publican mediciones).
- GPU de datacenter tipo A100 o H100: no son necesarias para un modelo de este tamano; solo tendrian sentido para servir muchas replicas concurrentes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion fundamentada. La unica comparacion posible con los datos disponibles es interna al propio repositorio, entre las dos cuantizaciones publicadas:

| Fichero | Precision | Tamano de pesos estimado | Perfil de uso |
|---|---|---|---|
| Andy-Starlight-3B-BF16.gguf | 16 bits | ~5,4 GB | Maxima fidelidad respecto al modelo base |
| Andy-Starlight-3B-Q4_K_M.gguf | 4 bits (K-quant mixta) | ~1,7 GB | Inferencia en hardware limitado |

No hay datos que permitan afirmar cual es la perdida de calidad asociada a Q4_K_M en este modelo concreto.

## Limitaciones y advertencias

- Licencia "other" sin texto de terminos publicado: no queda claro si se permite el uso comercial. Debe consultarse la model card del modelo base antes de cualquier uso en produccion.
- Repositorio practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Model card minima: no hay informacion sobre datos de entrenamiento, composicion del dataset, filtrado, sesgos conocidos ni proceso de alineacion.
- Riesgo de alucinacion no evaluado: al no existir benchmarks ni evaluaciones de veracidad, no puede estimarse la tasa de error factual.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas que requieran ventanas largas. El dato "128k" de la model card corresponde al tamano del vocabulario, no al contexto.
- Idiomas no declarados: se desconoce el soporte real de castellano u otros idiomas distintos del ingles.
- Cuantizacion Q4_K_M: introduce perdida de precision respecto a BF16 y no existen evaluaciones comparativas que cuantifiquen el impacto en este modelo.
- Discrepancia nominal: el nombre indica "3B" pero el recuento real en safetensors es de 2.697.198.592 parametros (~2,7B). Con un vocabulario de 128.000 tokens, una parte significativa del total corresponde a la matriz de embeddings, por lo que la capacidad efectiva del cuerpo del transformer es menor de lo que sugiere el nombre.
- Metadatos anomalos: la fecha de creacion registrada (2026-10-07) es posterior a la fecha habitual de publicacion, lo que sugiere un error de metadatos en el repositorio.
- Dependencia de una build concreta de llama.cpp (`b75ecd197`): puede requerir actualizar el runtime para garantizar compatibilidad.
- Uso comercial y redistribucion: al no especificarse terminos, se recomienda tratar el modelo como no apto para produccion sin una revision legal previa.
- Trazabilidad: al ser una conversion de un modelo base no documentado, no es posible auditar el origen de los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sethblocks/Andy-Starlight-3B-GGUF
- Modelo base: https://huggingface.co/Sethblocks/Andy-Starlight-3B
- llama.cpp (herramienta de conversion y runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (runtime alternativo para GGUF): https://github.com/ollama/ollama
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su modelo base o a evaluaciones del mismo; los resultados obtenidos corresponden a contenido no relacionado.
