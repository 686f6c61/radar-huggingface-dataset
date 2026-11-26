# selorahomes/Selora-AI-LLM-1.7B-ollama

## Resumen

Selora AI LLM 1.7B es un ajuste fino de Qwen3-1.7B orientado exclusivamente a la automatización del hogar con Home Assistant. Lo desarrolla Selora Homes y resuelve un problema muy concreto: unificar en un único modelo las cinco clases de respuesta que necesita su integración (`command`, `automation`, `answer`, `clarification` y `utilities`), decidiendo él mismo el tipo a partir de un prompt enrutador que se inyecta en el turno de sistema. Sustituye a la arquitectura anterior (modelo base más cinco LoRA especialistas intercambiadas por petición), que quedó retirada en la versión v0.8.1.

Técnicamente es un transformer denso de 1.720.574.976 parámetros (1,7B) con una ventana de contexto de 4096 tokens, entrenado como una única LoRA sobre ejemplos de los cinco tipos de respuesta y fusionada posteriormente en los pesos base. La salida es siempre un objeto JSON estricto, sin bloque de razonamiento, para lo que se prefija `/no_think` al turno de usuario y se fuerza una plantilla ChatML que emite un bloque `` vacío.

Su relevancia ahora es la de los modelos pequeños y especializados: corre en cualquier sitio donde corra un GGUF único (llama.cpp, Ollama), con una licencia Apache 2.0 heredada de Qwen3, y publica métricas sobre el benchmark Allen de Home Assistant medidas a través de la integración real. No es un modelo de propósito general: es un componente de un producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (`num_ctx 4096`) |
| Tipos de cuantizacion | Q6_K (GGUF publicado); el resto de cuantizaciones GGUF estándar no se distribuye en el repo |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`selora-ollama.Q6_K.gguf`), más `Modelfile`, `system`, `template`, `params` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso con atención estándar y modo de razonamiento opcional. El ajuste consiste en una única LoRA entrenada sobre los ejemplos de los cinco tipos de respuesta bajo el prompt enrutador común, que después se fusiona en los pesos base. Los datos de entrenamiento no se detallan en la información disponible (ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO). Cada turno de usuario incluye en el prompt la lista `AVAILABLE ENTITIES`, los `EXISTING AUTOMATIONS` y, para consultas de tipo `utilities`, un bloque `RELEVANT DOCS`.

La innovación destacable no es arquitectónica sino de formato: el modelo está entrenado para emitir JSON puro y la plantilla de chat debe reproducirse byte a byte en inferencia. El bloque `` vacío forma parte del prompt (enmascarado durante el entrenamiento), no de la salida; si se omite, el modelo genera como si la apertura `{"` ya estuviese escrita y devuelve `q=[...]` en lugar de `{"q":[...]}`, lo que ningún parser acepta. Los parámetros de generación fijados son `temperature 0.0`, `repeat_penalty 1.0`, `repeat_last_n 256` y `stop` en `<|im_end|>` y `<|endoftext|>`; el `repeat_penalty` se mantiene en 1.0 deliberadamente porque penalizar los tokens estructurales repetidos del JSON degrada la fidelidad del esquema.

## Capacidades

- Generación de comandos de control de dispositivos en formato JSON, a partir de la lista de entidades disponibles.
- Creación de automatizaciones de Home Assistant válidas como blueprint, con todas las entradas solicitadas conectadas.
- Respuesta a preguntas en lenguaje natural sobre el estado y el funcionamiento del hogar.
- Generación de peticiones de aclaración cuando la instrucción del usuario es ambigua.
- Respuesta a consultas de tipo `utilities` apoyadas en un bloque de documentación relevante inyectado en el prompt.
- Clasificación y enrutado autónomo entre los cinco tipos de respuesta mediante el prompt de sistema.
- Salida JSON estricta sin bloque de razonamiento visible (modo `/no_think`).
- No soporta tool calling genérico, ni agentes multi-paso, ni visión, ni audio; su ámbito es la integración de Home Assistant.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Control por voz o texto del hogar: la integración envía la transcripción junto con la lista de entidades y el modelo devuelve un `command` JSON que se ejecuta contra la API de Home Assistant; el formato estructurado elimina la necesidad de parsear lenguaje natural.
- Creación asistida de automatizaciones: el usuario describe una rutina ("cuando salga el sol, sube las persianas del salón") y el modelo devuelve un blueprint que Home Assistant valida; en el benchmark Allen obtuvo un 100 % en el conjunto `automations` (20 casos).
- Resolución de ambigüedades en conversación: cuando la petición no identifica un dispositivo de forma inequívoca, el modelo emite un `clarification` en lugar de adivinar, lo que reduce acciones erróneas sobre el hogar.
- Asistente de preguntas sobre el estado de la casa: responde a consultas como el estado de un sensor o el consumo de un electrodoméstico usando el bloque de entidades y automatizaciones existentes como contexto.
- Atención de dudas sobre el propio sistema: para consultas `utilities` se inyecta documentación relevante y el modelo responde con ella, útil como ayuda integrada en la interfaz de Home Assistant.
- Despliegue en hardware doméstico: al ser un GGUF Q6_K de 1,7B, puede ejecutarse en local en el Selora Hub o en un servidor doméstico modesto, sin depender de la nube y sin enviar datos del hogar a terceros.
- Evaluación y regresión de pipelines de automatización: el benchmark Allen y sus variantes (`assist`, `assist-mini`, `questions`, `automations`) permiten medir de forma reproducible la calidad del enrutado y del JSON generado en cada versión.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el benchmark Allen a través de la integración de Home Assistant, con temperatura 0 y sobre los conjuntos completos:

| Dataset | Casos | Solo modelo | Con overrides |
|---|---|---|---|
| assist | 460 | 90,2 % | 92,4 % |
| assist-mini | 196 | 95,9 % | 100,0 % |
| questions | 370 | 94,6 % | 94,6 % |
| automations | 20 | 100,0 % | 100,0 % |

"Solo modelo" desactiva los overrides deterministas de la integración, de modo que cada turno lo decide el modelo; "con overrides" los mantiene activos. Ninguna de las dos configuraciones coincide exactamente con la desplegada: la aprobación y la lista blanca de comandos seguros están desactivadas durante la ejecución. Una respuesta de tipo `automations` se considera correcta si Home Assistant la acepta como blueprint con todas las entradas solicitadas conectadas; la automatización no se ejecuta. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo publica un GGUF Q6_K de 1,7B, que ocupa aproximadamente 1,4-1,5 GB en disco y requiere un margen similar de memoria al cargarse; con contexto de 4096 tokens el consumo total se mantiene por debajo de 2-3 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece holgura. En entornos de servidor, una A100 o H100 es sobredimensionada para este modelo y solo tendría sentido por agregación de muchas instancias.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: Ollama (`ollama run hf.co/selorahomes/Selora-AI-LLM-1.7B-ollama:selora-ollama.Q6_K.gguf`), construcción local con el `Modelfile` del repo, y llama.cpp (`llama-server -m selora-ollama.Q6_K.gguf --jinja --ctx-size 4096`). No se documentan vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora AI LLM 1.7B | 1,7B | 4096 | Home Assistant, salida JSON en cinco tipos | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-1.7B (base) | 1,7B | mayor que 4096 (no especificado aquí) | Propósito general, razonamiento | Apache 2.0 | Hugging Face |
| Selora AI LLM 1.7B (bundle v0.8.1) | 1,7B + 5 LoRA | 4096 | Mismo dominio, cinco especialistas intercambiadas | Apache 2.0 | Repo retirado, congelado en v0.8.1 |

La comparación relevante es con su propio modelo base: Qwen3-1.7B es más general y conserva el modo de razonamiento, pero no produce de forma fiable el JSON de cinco tipos ni el enrutado autónomo que exige la integración. El bundle anterior de cinco LoRA queda como referencia histórica. No se dispone de datos de benchmarks de modelos de terceros especializados en Home Assistant en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: está entrenado para Home Assistant y los cinco tipos de respuesta de Selora; fuera de ese dominio su comportamiento no está caracterizado.
- Solo inglés: la model card declara únicamente `en`, por lo que el uso en castellano no está soportado ni evaluado.
- Contexto de 4096 tokens: la lista de entidades, las automatizaciones existentes y la documentación comparten esa ventana, lo que limita instalaciones con muchos dispositivos.
- Fragilidad de plantilla: la inferencia debe reproducir la plantilla byte a byte, incluido el bloque `` vacío; Ollama renderiza la plantilla embebida en el GGUF en lugar del archivo `template`, y un desajuste produce JSON inválido (`q=[...]` en vez de `{"q":[...]}`).
- Riesgo de alucinación: puede generar entidades o servicios inexistentes en los comandos; la integración depende de la lista blanca de comandos seguros y de la aprobación, que en la medición de benchmarks estaban desactivadas.
- Las cifras de benchmarks no reflejan la configuración desplegada: se obtuvieron sin aprobación ni lista blanca, y las automatizaciones se validan como blueprint sin ejecutarse.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero con la atribución a Qwen3 recogida en el archivo `NOTICE` del repositorio.
- Los archivos `Modelfile`, `system`, `template` y `params` se regeneran en cada release desde el repositorio de modelos; editarlos localmente no es una vía sostenible de personalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B-ollama
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Bundle anterior con cinco LoRA (v0.8.1): https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Integración de Home Assistant: https://gitlab.com/selorahomes/products/selora-ai/ha-integration
- Repositorio de modelos y pipeline de datos: https://gitlab.com/selorahomes/products/selora-ai/models
- Benchmark Allen (Home Assistant datasets): https://github.com/allenporter/home-assistant-datasets
