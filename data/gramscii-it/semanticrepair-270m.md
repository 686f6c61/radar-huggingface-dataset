# Gramscii-IT/SemanticRepair-270M

## Resumen

SemanticRepair-270M es un modelo de lenguaje pequeño (SLM) de 270 millones de parámetros desarrollado por Gramscii-IT, especializado en reescritura de consultas para sistemas de enrutamiento basados en embeddings. Se construye sobre google/gemma-3-270m y se ajusta mediante fine-tuning supervisado sobre el dataset propio Gramscii-IT/semantic-repair-routing. Su función es reformular preguntas que no aterrizan con suficiente margen en ninguna capacidad de un router, para que este pueda reintentar sobre la reformulación. También detecta cuando no hay ninguna solicitud real y emite el token centinela `NO_REQUEST`.

El modelo se distribuye en dos formatos con los mismos pesos fusionados: safetensors en BF16 (536 MB) y GGUF cuantizado a Q8_0 (300 MB). Está diseñado para servirse a través de llama-server en un endpoint de completions, nunca en un endpoint de chat. Su relevancia radica en que mejora sustancialmente la precisión del enrutamiento en sistemas RAG o de agentes, reduciendo de forma drástica los errores de idioma y las respuestas incorrectas en comparación con el modelo base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Gemma 3 270M (gemma3_text) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), BF16 (safetensors) |
| Idiomas soportados | en, it, fr, de, es |
| Licencia | Gemma (terminos de Google) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

SemanticRepair-270M es un transformer denso derivado de google/gemma-3-270m, ajustado mediante fine-tuning supervisado sobre un dataset propio de reescritura y enrutamiento de consultas. No se menciona el uso de RLHF ni DPO; el entrenamiento se realiza sobre una superficie de completions sin plantilla de chat, sin mensajes de sistema ni ejemplos few-shot. El formato de entrada es `{Language}: {la pregunta, verbatim}\n=>\n`, donde `{Language}` es el nombre en ingles del idioma de la pregunta (English, Italian, French, German, Spanish). El modelo completa con una linea por solicitud encontrada o con el token `NO_REQUEST`.

La cuantizacion elegida para el despliegue es Q8_0 y no Q4, porque segun las mediciones del autor, a temperatura 0 un Q8_0 es estable al byte entre ejecuciones mientras que un Q4 no lo es. Esta estabilidad es critica para que el router pueda razonar sobre reescrituras reproducibles. El GGUF tiene un sha256 fijado que el motor de inferencia verifica, garantizando que la decision de enrutamiento sea reproducible.

## Capacidades

- Reescritura de consultas: reformula preguntas en una forma plana y normalizada que coincide con la descripcion de las capacidades del router.
- Deteccion de no-solicitudes: emite el token `NO_REQUEST` cuando la entrada no contiene ninguna peticion real.
- Descomposicion de peticiones compuestas: una unica frase con dos solicitudes se convierte en dos lineas separadas.
- Eliminacion de ruido conversacional: elimina negaciones, disculpas y muletillas que no forman parte de la peticion.
- Multilingue: soporta ingles, italiano, frances, aleman y espanol, con etiqueta de idioma declarada por el llamador para lenguas fuera de ese conjunto.
- No responde preguntas, no genera texto libre, no soporta tool calling ni razonamiento multi-paso; su unica salida es la reescritura o el centinela.

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: cuando el router de embeddings no encuentra una capacidad con margen suficiente, SemanticRepair-270M reformula la pregunta y el router reintenta sobre la reescritura, mejorando la precision de recuperacion.
- Filtrado de consultas no validas en asistentes conversacionales: detecta saludos o comentarios que no son peticiones y los marca con `NO_REQUEST`, evitando que se ejecuten herramientas innecesariamente.
- Desambiguacion de peticiones compuestas en agentes: separa una frase con dos intenciones en dos lineas, permitiendo que el router enrute cada una a su capacidad correspondiente.
- Normalizacion de lenguaje coloquial en pipelines de soporte: elimina disculpas, negaciones y expresiones de cortesia antes de que la consulta llegue al router, reduciendo falsos positivos.
- Mejora de precision en asistentes multilingues: reduce los errores de idioma en el enrutamiento, pasando de 123 respuestas en idioma incorrecto a 6 en las pruebas del autor.
- Preprocesamiento en pipelines de agentes antes de ejecutar herramientas: garantiza que la consulta es una peticion real y esta en un formato estandar antes de invocar cualquier funcion.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre dos conjuntos de pruebas. No se han publicado resultados en benchmarks estandar como MMLU o HumanEval, ya que el modelo no esta disenado para tareas generativas generales.

**400 tareas de enrutamiento sobre 343 grafos** (pesos liberados frente al modelo base sin entrenar):

| Modelo | Exactas | Ejecuciones incorrectas | Respuestas en idioma incorrecto |
|---|---|---|---|
| SemanticRepair-270M | 32 | 1 | 6 |
| google/gemma-3-270m (sin entrenar) | 24 | 0 | 123 |

**39 preguntas retenidas en un workspace en vivo** (escritas por tres jueces ciegos, en dos idiomas):

| Metodo | Exactas |
|---|---|
| SemanticRepair-270M | 16 |
| Enrutar la pregunta tal cual, sin reparacion | 12 |
| google/gemma-3-270m (sin entrenar) | 9 |

**Gate de entrenamiento** sobre 1000 ejemplos retenidos: 261 exactos (26,1 %), 927 de 1000 respuestas bien formadas, y el gate de balance de idiomas superado con una brecha de 7 puntos entre ingles e italiano frente a una barra de 10 puntos.

## Requisitos de hardware

- Al ser un modelo de 270M de parametros, cabe en cualquier GPU consumer moderna con al menos 1 GB de VRAM para la version BF16 (536 MB) y menos de 1 GB para la version Q8_0 (300 MB).
- Es viable en GPU como RTX 3060, RTX 4090, o incluso en CPU con llama.cpp, aunque la latencia sera mayor.
- El despliegue recomendado por el autor es llama-server (llama.cpp) con el archivo GGUF Q8_0, fijando el sha256 para reproducibilidad.
- Tambien se distribuye en formato MLX, lo que permite ejecucion eficiente en Apple Silicon.
- No se proporcionan datos de latencia o throughput especificos, pero por su tamano se espera una latencia de decenas de milisegundos en GPU moderna.
- No requiere hardware especializado como A100 o H100 para inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre otros reescritores de consultas de tamano comparable en la documentacion proporcionada. La comparacion mas relevante es contra el modelo base sin entrenar y contra la estrategia de no aplicar reparacion:

| Metodo | Parametros | Contexto | Exactitud en tareas de enrutamiento (400 tareas) | Licencia |
|---|---|---|---|---|
| SemanticRepair-270M | 268M | No disponible | 32 | Gemma |
| google/gemma-3-270m (base) | 268M | No disponible | 24 | Gemma |
| Sin reparacion (router directo) | - | - | 12 (sobre 39 preguntas) | - |

## Limitaciones y advertencias

- El centinela `NO_REQUEST` no captura todas las no-solicitudes: por ejemplo, la frase "ciao come stai" se devuelve verbatim en lugar de rechazarse. Si el sistema downstream no verifica que la reformulacion es una peticion, un saludo puede ser enrutado.
- El modelo no responde preguntas ni genera contenido; su unica funcion es reescribir o emitir el centinela. Usarlo fuera de ese contexto producira resultados inesperados.
- Requiere el formato de prompt exacto `{Language}: {pregunta}\n=>\n`; no ha visto plantillas de chat ni mensajes de sistema, por lo que usarlo con un chat template degradara su rendimiento.
- La licencia Gemma impone restricciones de uso comercial segun los terminos de Google; es necesario revisarlos antes de desplegarlo en produccion.
- La cuantizacion Q8_0 es la unica verificada como estable al byte; usar Q4 u otras cuantizaciones puede romper la reproducibilidad del enrutamiento.
- El modelo depende del router downstream para decidir si la reformulacion es valida; no toma decisiones por si mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gramscii-IT/SemanticRepair-270M
- Dataset de entrenamiento: https://huggingface.co/datasets/Gramscii-IT/semantic-repair-routing
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Repositorio alternativo (mismo modelo): https://huggingface.co/Gramscii/SemanticRepair-270M
