# krummholz-ai/core-35b-a3b-v6.3-GGUF

## Resumen

Krummholz Core 35B-A3B v6.3 es la versión beta del modelo base de Krummholz AI LLC (Belfast, Maine), un fine-tune del modelo Qwen/Qwen3.6-35B-A3B. Se trata de un modelo de mezcla de expertos (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3B activos por token, que sirve como núcleo compartido sobre el que la empresa construirá dos productos verticales: Acadia (atención al cliente) y Katahdin (silvicultura y pesca). Los adaptadores de producto aún no están entrenados, por lo que esta beta es un modelo de propósito general.

El modelo parte de la arquitectura de Qwen3.6-35B-A3B: 256 expertos con 8 enrutados y 1 compartido por token, capas híbridas de Gated DeltaNet y atención, y un codificador de visión que permite entrada de texto e imágenes con salida de texto. Krummholz ha aplicado un fine-tune LoRA sobre el modelo de lenguaje (supervisado, luego entrenamiento de preferencias y tres pasadas cortas de corrección), fusionado en el base y convertido a GGUF.

La relevancia de esta ficha es doble: por un lado, documenta un MoE de 35B con solo 3B activos que cabe en hardware de consumo con cuantización de 4 bits (21,2 GB); por otro, el autor declara explícitamente que es una beta que no cumple varias de sus propias puertas de calidad, con un objetivo de menos del 1 % de alucinación que aún no es un resultado medido. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer híbrida con capas Gated DeltaNet y atención; codificador de visión |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3B por token (256 expertos: 8 enrutados + 1 compartido) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4 bits), Q5_K_M (5 bits); proyector de visión en f16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.6-35B-A3B: un transformer de mezcla de expertos con 256 expertos por capa, de los cuales 8 se enrutan y 1 es compartido en cada token, lo que da unos 3B parámetros activos sobre 34,66B totales. Combina capas híbridas de Gated DeltaNet con capas de atención, e incorpora un codificador de visión que procesa imágenes de entrada. Esta configuración busca reducir el coste computacional por token manteniendo la capacidad de un modelo de 35B.

El entrenamiento de Krummholz consistió en un fine-tune LoRA del modelo de lenguaje en varias fases: primero supervisado, después entrenamiento de preferencias y finalmente tres pasadas cortas de corrección. El adaptador se fusionó en el modelo base y el resultado se convirtió a GGUF. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de preferencias. El autor indica que entrenó y evaluó con la plantilla de chat configurada con `enable_thinking` a falso, por lo que el modo de razonamiento extendido no forma parte del comportamiento evaluado.

## Capacidades

- Generación de texto conversacional: preguntas, redacción y explicaciones en inglés.
- Lectura de documentos y registros proporcionados por el usuario.
- Entrada de imágenes con salida de texto, mediante la ruta de visión del modelo base (no modificada ni evaluada por Krummholz).
- Uso de herramientas (tool calling): el modelo escribe llamadas a calculadora, búsqueda web y obtención de páginas, siempre que el entorno de ejecución las proporcione.
- Respuestas fundamentadas en resultados de herramientas y registros, orientadas a los futuros productos Acadia y Katahdin (intenciones bancarias, inventario forestal de Maine, indicadores de calidad de datos, resúmenes de herramientas de nube de puntos).
- Tratamiento de historia y actualidad, incluidos temas sobre los que el modelo base tiende a rechazar o repetir una línea oficial.
- Exposición de disputas territoriales con el mismo estándar para cada una.
- Capacidades multilingües: no disponibles; solo inglés.

## Casos de uso

- Asistente de escritorio de propósito general: el modelo cabe en un equipo con suficiente memoria (21,2 GB para Q4_K_M más unos pocos GB para el contexto) y responde a preguntas, redacta y explica conceptos sin conexión a servicios externos.
- Análisis de documentos y registros: dado que acepta texto e imágenes, puede leer documentos escaneados o capturas y responder preguntas sobre su contenido, útil para revisión de contratos o expedientes.
- Automatización con herramientas en un runtime propio: integrado en llama.cpp con `--jinja`, el modelo emite llamadas a calculadora, búsqueda web y obtención de páginas; encaja en pipelines donde el orquestador ejecuta esas llamadas y devuelve resultados.
- Prototipado de asistentes verticales: al ser el núcleo de Acadia y Katahdin, sirve para validar flujos de intención bancaria o consultas sobre inventario forestal antes de que existan los adaptadores de producto.
- Consultas de actualidad con verificación externa: combinado con búsqueda web, puede responder sobre temas cambiantes y citar fuentes recuperadas, aunque el autor advierte que toda afirmación debe verificarse.
- Investigación sobre alineación y comportamiento: la inclusión de guardas en Python (conciencia, disputas territoriales) sobre un modelo abierto lo hace útil para estudiar cómo se combinan restricciones programáticas con pesos ajustados.
- Despliegue en local para privacidad: al ejecutarse con llama.cpp o LM Studio y no requerir API externa, permite procesar datos sensibles en la propia máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación y la existencia de puertas de calidad internas de Krummholz que el modelo aún no cumple, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de otras pruebas.

## Requisitos de hardware

- VRAM/memoria estimada: Q4_K_M ocupa 21,2 GB y Q5_K_M 24,7 GB; hay que sumar unos pocos GB para el contexto. Todos los pesos deben caber en memoria (GPU o RAM del sistema).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de 24 GB (RTX 4090, L4) puede alojar Q4_K_M con contexto moderado; Q5_K_M requiere 24 GB o más y deja poco margen, por lo que resulta más segura una A100 de 40/80 GB o una H100 para contextos largos.
- GPU de consumo: sí, en tarjetas de 24 GB con Q4_K_M; en tarjetas de 16 GB no cabe la cuantización recomendada.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y el runtime de Krummholz (paquete `krummholz_llm` con guardas en Python). El servidor de llama.cpp expone una API compatible con OpenAI.
- Latencia y throughput: no disponibles. El autor señala que, al activar solo ~3B parámetros por token, el modelo es más rápido de lo que sugiere su tamaño, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krummholz Core 35B-A3B v6.3 | 34,66B | ~3B | No disponible | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | No disponible | Apache 2.0 | Pesos en Hugging Face |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación más directa es con el modelo base Qwen3.6-35B-A3B, del que este es un fine-tune: comparten arquitectura, número de parámetros y licencia, y difieren en el ajuste LoRA, la conversión a GGUF y las guardas del runtime. No se dispone de datos de rendimiento comparado con otras alternativas.

## Limitaciones y advertencias

- Beta: el autor advierte que el modelo comete errores, incluidas respuestas incorrectas con seguridad, y que no cumple varias de sus propias puertas de calidad.
- Alucinación: el objetivo de menos del 1 % es una meta, no un resultado medido; debe verificarse cualquier dato relevante.
- Idioma: entrenamiento y evaluación solo en inglés; no se garantiza calidad en otros idiomas.
- Visión: la ruta de imágenes proviene del modelo base y Krummholz no la modificó ni evaluó, por lo que no debe usarse para decisiones basadas en imágenes.
- Uso crítico: no apto para decisiones médicas, legales, financieras o de seguridad sin revisión de una persona cualificada.
- Producto final: no sustituye a los adaptadores Acadia y Katahdin, que aún no existen.
- Tool calling: el modelo escribe las llamadas, pero una aplicación de chat convencional no las ejecuta; requiere un runtime que las procese.
- Guardas: las cuatro reglas del runtime (conciencia, disputas territoriales, entre otras) solo leen inglés y se aplican en Python tras la respuesta, no en los pesos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor plantea dos cuestiones abiertas sobre los datos de entrenamiento que conviene revisar antes de producción.
- Sesgos: no se documentan sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krummholz-ai/core-35b-a3b-v6.3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del runtime con guardas: https://github.com/hayvenmjackson/krummholz-llms-alpha/tree/vl-pointcloud-v1/krummholz_llm
- Contacto del autor: info@krummholz.ai
