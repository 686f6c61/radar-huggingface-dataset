# Itay5731/nab-qwen

## Resumen

nab-qwen v1.1 es un ajuste fino (fine-tune) del modelo Qwen 3.5 9B desarrollado por Itay5731 como asistente local de Nab, una aplicación de escritorio para gestionar issues y merge requests de GitLab. El modelo no es un chat de propósito general: está entrenado para recibir el prompt de sistema de la aplicación, la petición del usuario y el contexto de la página actual, y devolver un único objeto JSON que contiene o bien una llamada a herramienta (`{"tool": "...", "args": {...}}`) o bien una respuesta (`{"answer": "..."}`).

La relevancia del modelo reside en su enfoque de despliegue local: se distribuye cuantizado en GGUF Q4_K_M (unos 6 GB) y se importa en Ollama, de modo que la inferencia ocurre en el ordenador del usuario sin enviar datos a servicios externos. Esto lo hace adecuado para entornos donde el código y los metadatos de repositorios privados no pueden salir de la máquina.

Técnicamente es un LoRA (rango 32, alpha 64) fusionado sobre Qwen 3.5 9B, con el modo de razonamiento (thinking) desactivado por diseño para obtener respuestas JSON cortas y rápidas. El contexto configurado en Nab es de 8k tokens y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.5 9B), ajuste fino mediante LoRA fusionado |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8k tokens en la configuracion de Nab (Modelfile) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`nab-qwen-20261107.Q4_K_M.gguf`), importable en Ollama mediante `Modelfile` |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.5 9B, un transformer decoder-only de 9,2 mil millones de parametros, y se ajusta con LoRA de rango 32 y alpha 64 sobre los pesos en bf16. El entrenamiento se realizo con Unsloth en una GPU alquilada en RunPod, durante 2 epocas, con tasa de aprendizaje 1e-4 y longitud maxima de secuencia de 4096 tokens. Posteriormente el adaptador se fusiono en el modelo base, se convirtio a GGUF con llama.cpp y se cuantizo a Q4_K_M.

El conjunto de datos consta de aproximadamente 94.000 ejemplos (93.665) construidos a partir de 19.073 peticiones unicas, renderizados con el prompt de sistema real de la aplicacion y los esquemas de herramientas, en varias copias con proyectos de demostracion, personas y erratas distintas. Las fuentes incluyen el banco de ejemplos escrito a mano de Nab para cada herramienta y familias generadas para conversacion, preguntas, notas de Focus, comparacion de ramas, honestidad (admitir lo que Nab no puede hacer o preguntar cuando hay duda), conocimiento general, seguimientos y carencias detectadas en evaluaciones previas. Los ejemplos multi-paso incluyen los resultados de herramientas anteriores que el agente vio. Se reservaron 5.321 ejemplos de 2.091 peticiones (alrededor del 10% por familia) como conjunto de validacion. No se utilizaron datos de clientes: todos los ejemplos usan nombres inventados y datos de demostracion.

La innovacion principal es el formato de chat: se emplea la plantilla propia de Qwen 3.5 con `enable_thinking=False`, cada prompt termina con un bloque `<think></think>` vacio y la respuesta es JSON puro. La funcion de perdida se calcula unicamente sobre la respuesta, y Ollama renderiza exactamente el mismo texto en tiempo de ejecucion.

## Capacidades

- Generacion de llamadas a herramientas en formato JSON estricto para el conjunto de acciones de Nab: abrir, filtrar, editar, comentar, revisar, pipelines, notas de Focus, ajustes y mas.
- Respuesta en formato JSON con la forma `{"answer": "..."}` cuando no se requiere herramienta.
- Razonamiento multi-paso: los ejemplos de entrenamiento incluyen resultados de herramientas previas, lo que permite encadenar acciones dentro del bucle del agente.
- Capacidad de admitir limitaciones y pedir aclaraciones cuando no esta seguro (familia de ejemplos de "honestidad").
- Manejo de seguimientos conversacionales del tipo "and the last one?" o "not yet".
- Conocimiento general limitado a hechos comunes y breves.
- Modo thinking desactivado por diseno (respuestas cortas y rapidas).
- Sin capacidades de vision, audio ni generacion de codigo general; no es un modelo de chat de proposito general.

## Casos de uso

- Asistente integrado en la aplicacion Nab: el modelo recibe el prompt de sistema, la peticion del usuario y el contexto de la pagina, y devuelve la llamada a herramienta adecuada para operar sobre issues y merge requests de GitLab sin salir del escritorio del usuario.
- Automatizacion de revision de codigo en local: el modelo puede emitir acciones de revision y comentarios sobre merge requests, manteniendo el codigo y los metadatos del repositorio en la maquina del desarrollador.
- Gestion de pipelines desde lenguaje natural: el agente traduce peticiones como consultar el estado de un pipeline o filtrar jobs a llamadas JSON que la aplicacion ejecuta contra la API de GitLab.
- Filtrado y busqueda de issues: dado el contexto de la pagina, el modelo genera llamadas de filtrado con los argumentos correctos, lo que agilita la navegacion en repositorios con muchos issues.
- Creacion de notas de Focus: el modelo puede invocar la herramienta correspondiente para registrar notas asociadas a issues o merge requests, con confirmacion previa del usuario en acciones relevantes.
- Comparacion de ramas: el modelo soporta la familia de ejemplos de "branch compare" y puede emitir la llamada que inicia la comparacion entre ramas dentro de la aplicacion.
- Despliegue en equipos con requisitos de privacidad: al ejecutarse en Ollama sobre hardware local (8 GB de VRAM o mas), encaja en entornos donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos el 2026-11-08 en una sola maquina con Ollama, temperatura 0 y cuantizacion Q4_K_M:

| Metrica | v1.0 (Qwen 2.5 7B) | v1.1 (Qwen 3.5 9B) |
|---|---|---|
| Conjunto reservado: respuesta exacta (herramienta + argumentos) | 68,8% | 66,3% |
| Conjunto reservado: herramienta o respuesta correcta | 88,5% | 86,0% |
| Conjunto reservado: JSON valido | 99,8% | 100% |
| Evaluacion de la app Nab: tasa de exito solo del modelo | 85,5% | 80,0% |
| Evaluacion de la app Nab: tasa de exito de la app completa | 100% | 100% |
| QA de interfaz de Nab con el modelo real | 100% | 100% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB para el archivo GGUF Q4_K_M; una GPU con 8 GB o mas lo ejecuta con comodidad.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (el autor no especifica modelos concretos); en CPU funciona, pero mucho mas lento.
- Cabe en GPU consumer: si, con 8 GB o mas de memoria.
- Memoria del sistema: 16 GB recomendados segun la documentacion de Nab.
- Opciones de despliegue: Ollama 0.17.4 o superior (versiones anteriores no reconocen la arquitectura Qwen 3.5); importacion manual con `ollama create nab-qwen -f Modelfile` o descarga automatica desde la aplicacion Nab, que verifica tamano, sha256 y cabecera del archivo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| nab-qwen v1.1 | 9,2 B | 8k (en Nab) | Apache 2.0 | GGUF Q4_K_M | Asistente de herramientas JSON para Nab, thinking off |
| Qwen 3.5 9B (base) | 9,2 B | no disponible | Apache 2.0 | safetensors y otras | Modelo generalista de Qwen (Alibaba Cloud) |
| nab-qwen v1.0 | 7 B (Qwen 2.5 7B) | no disponible | Apache 2.0 | GGUF | Version anterior del asistente de Nab |
| Qwen 2.5 7B Instruct | 7 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista instruct |

La comparacion con alternativas de la misma categoria (asistentes de tool calling locales) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: fuera de Nab responde igualmente con la forma JSON propia de la aplicacion, por lo que no debe usarse como asistente conversacional generico.
- Solo soporta ingles; no hay capacidades multilingues.
- Entrenado exclusivamente en tareas de GitLab y Nab; el conocimiento general se limita a hechos comunes y breves.
- Modelo pequeno con contexto pequeno: 9B parametros a 4 bits y 8k tokens de contexto en Nab.
- Puede equivocarse: la aplicacion pide confirmacion antes de acciones importantes (cerrar, comentar, crear, fusionar, cambios masivos) y permite deshacer los cambios, pero el modelo no es fiable al 100% (66,3% de coincidencia exacta en el conjunto reservado).
- Riesgo de alucinacion en respuestas de conocimiento general y en la seleccion de argumentos de herramientas.
- El modo thinking esta desactivado por diseno; usar una plantilla que lo active degrada el formato de respuesta esperado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen 3.5 9B y conserva el aviso de atribucion del archivo NOTICE.
- Requiere Ollama 0.17.4 o superior; versiones anteriores no soportan la arquitectura Qwen 3.5.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Itay5731/nab-qwen
- Modelo base Qwen 3.5 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Nab (releases): https://github.com/itay5731/Nab-releases
- Ollama: https://ollama.com
- Articulo de CNBC sobre Qwen: https://www.cnbc.com/2026/08/17/alibaba-meta-qwen-open-weight-ai-laptop-models.html
