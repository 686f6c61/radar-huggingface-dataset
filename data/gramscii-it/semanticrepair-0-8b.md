# Gramscii-IT/SemanticRepair-0.8B

## Resumen

SemanticRepair-0.8B es un adaptador LoRA sobre Qwen3.5-0.8B desarrollado por Gramscii-IT, diseñado para funcionar detrás de un router de embeddings en sistemas de chat con múltiples capacidades (búsqueda documental, búsqueda web, localización geográfica, estadísticas de datos abiertos, etc.). Su función no es responder preguntas, sino reescribir cada petición que un mensaje contiene en una línea propia y asignar a cada línea la capacidad del chat que debe ejecutarla, o `none` si ninguna la cubre. Si el mensaje no solicita nada, devuelve el token `NO_REQUEST`.

El modelo resuelve un problema concreto en arquitecturas RAG y de enrutamiento de herramientas: los mensajes de usuario reales son ambiguos, contienen referencias anafóricas ("e per Milano?", "trova di più a riguardo") y encadenan varias peticiones en una sola frase. El adaptador lee el mensaje a la luz de los últimos turnos del chat y lo normaliza en el formato `capability | request`, de modo que el router pueda verificar cada capacidad contra sus propias puntuaciones y la aplicación anfitriona decida qué se ejecuta. La salida del modelo por sí sola nunca autoriza una operación.

Con 772.845.888 parámetros en el modelo base y un adaptador de rango 32 que ocupa entre 22 y 43 MB en formato GGUF F16, la propuesta es deliberadamente ligera: un único base sirve para varios trabajos (reparación semántica, elección de herramienta y traducción de consultas) cargando adaptadores distintos, en lugar de desplegar modelos separados de 800 MB. Soporta italiano, inglés, francés, alemán y español, y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B) con adaptador LoRA de rango 32 |
| Parámetros totales | 772.845.888 (modelo base); adaptador LoRA F16 de 43.316.320 bytes |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de despliegue con `-c 32768`) |
| Tipos de cuantización | Base en Q8_0 (833.592.320 bytes); adaptador en F16; el autor indica que un adaptador cuesta entre 22 y 43 MB |
| Idiomas soportados | Italiano, inglés, francés, alemán, español |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base Q8_0 y adaptador LoRA F16); el repositorio también contiene safetensors según los metadatos de parámetros |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 sobre Qwen3.5-0.8B, en la revisión `2fc06364` del base. Se ha ajustado sobre una superficie de completación desnuda, no sobre una plantilla de chat: el adaptador nunca ha visto un chat template, un mensaje de sistema ni ejemplos few-shot. La entrada que espera tiene la forma `Capabilities: {ids separados por comas}`, seguida de cero o más líneas `Earlier: {capability} | {request}` y una línea `{Language}: {mensaje verbatim}`, cerrada por `=>` y un salto de línea que forma parte de la superficie. La salida es una línea por petición en formato `capability | request`, `none | request` o el token único `NO_REQUEST`.

El entrenamiento se basa en destilación y se apoya en el dataset `Gramscii-IT/semantic-repair-routing`. La innovación técnica principal es el tratamiento del contexto conversacional: las líneas `Earlier:` permiten interpretar mensajes que continúan el hilo ("e per Milano?" tras una pregunta sobre Roma) o que apuntan a resultados previos ("trova di più a riguardo" tras una petición de diapositivas), reescribiéndolos con el sujeto correcto. El autor recomienda fijar el sha256 de ambos ficheros (base y adaptador) para que las decisiones de enrutamiento sean reproducibles.

## Capacidades

- Reescritura de consultas (query rewriting): normaliza mensajes ambiguos o coloquiales en peticiones explícitas.
- Descomposición multi-petición: un mensaje con varias solicitudes se convierte en una línea por petición.
- Detección de intención y enrutamiento de capacidades: asigna a cada petición una de las capacidades ofrecidas por el chat, o `none`.
- Detección de ausencia de petición: devuelve `NO_REQUEST` cuando el mensaje no solicita nada.
- Resolución de referencias anafóricas y elipsis conversacionales mediante las líneas `Earlier:`.
- Capacidades multilingües en italiano, inglés, francés, alemán y español; el campo `{Language}` se indica con el nombre inglés del idioma del mensaje.
- Integración con un router de embeddings externo: el adaptador no decide por sí solo, sino que produce candidatos que el router valida contra sus puntuaciones.
- Compatible con endpoints de completación (`/v1/completions`), no con endpoints de chat.

## Casos de uso

- Enrutamiento de capacidades en asistentes conversacionales: el adaptador reescribe cada mensaje del usuario en peticiones etiquetadas con la capacidad adecuada, y el router de embeddings valida la elección antes de ejecutar nada. Es adecuado porque separa la comprensión de la intención de la ejecución efectiva.
- Desambiguación de mensajes conversacionales: en un chat que ya ha respondido sobre Roma, un mensaje como "e per Milano?" se reescribe como una petición de la misma capacidad aplicada a otra ciudad, usando las líneas `Earlier:` para conservar el contexto.
- Sistemas RAG con referencias a resultados previos: mensajes del tipo "trova di più a riguardo" se reescriben con el sujeto que trajo el último turno con contenido externo (un artículo, unas diapositivas o un resumen), lo que mejora la recuperación documental.
- Descomposición de consultas compuestas: una frase como "¿dónde está Sassari? muéstramelo en el mapa y dame las últimas noticias de Italia" se separa en peticiones independientes para localización, visualización cartográfica y búsqueda de noticias, cada una con su capacidad.
- Filtrado previo en pipelines de agentes: antes de invocar herramientas, el adaptador identifica qué peticiones no corresponden a ninguna capacidad disponible (`none`) o si el mensaje no pide nada (`NO_REQUEST`), evitando ejecuciones innecesarias o incorrectas.
- Despliegue ligero en producción: con llama-server, el modelo se carga solo cuando se necesita y se libera tras una ventana de inactividad; el adaptador ocupa entre 22 y 43 MB frente a los 800 MB de un modelo completo, lo que permite mantener varios adaptadores (reparación, elección de herramienta, traducción de consultas) sobre un único base.
- Traducción de consultas para recuperación multilingüe: junto con QueryTranslator-0.8B, el flujo puede reescribir la petición en el idioma de los pasajes donde se buscará, manteniendo la coherencia con la capacidad enrutada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Adaptador de reparación en la cadena de enrutamiento del chat, junto con ToolChooser-0.8B | 480 preguntas reales de chat en italiano, reservadas del entrenamiento (test) | Solo ejecutó las capacidades que la pregunta pide (%) | 33,5 |
| Adaptador de reparación en la cadena de enrutamiento del chat, junto con ToolChooser-0.8B | 480 preguntas reales de chat en italiano, reservadas del entrenamiento (test) | Ejecutó una capacidad que la pregunta no pide (%), menor es mejor | 5,4 |
| Adaptador de reparación en la cadena de enrutamiento del chat: mensajes escritos para sondearlo | 100 mensajes de test, 50 en italiano y 50 en inglés (test) | Enrutado correcto (%) | 93,0 |
| Adaptador de reparación en la cadena de enrutamiento del chat: mensajes escritos para sondearlo | 100 mensajes de test, 50 en italiano y 50 en inglés (test) | Enrutado incorrecto (%), menor es mejor | 4,0 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Q8_0 ocupa 833.592.320 bytes (unos 0,83 GB) y el adaptador LoRA F16 43.316.320 bytes (unos 43 MB); el total ronda 1 GB de pesos, más el espacio de trabajo del contexto (hasta 32.768 tokens) y el grafo de cómputo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para el modelo en Q8_0; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema, aunque el modelo está pensado para despliegues modestos.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: llama-server (llama.cpp) con `--lora` para cargar el adaptador, `--jinja`, `-ngl 99`, `-c 32768`, `--no-context-shift` y `--cache-ram 0`. El autor no menciona otros motores como vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemanticRepair-0.8B | 772.845.888 (base) + LoRA rango 32 | 32.768 tokens (configuración de despliegue) | Reparación semántica y enrutamiento de capacidades | Apache-2.0 | Hugging Face, GGUF |
| ToolChooser-0.8B (Gramscii-IT) | Mismo base Qwen3.5-0.8B + adaptador propio | No disponible | Elección de capacidad cuando el router y la reparación dejan dos o más candidatas cercanas | Apache-2.0 (según el base) | Hugging Face |
| QueryTranslator-0.8B (Gramscii-IT) | Mismo base Qwen3.5-0.8B + adaptador propio | No disponible | Reescritura de la consulta en el idioma de los pasajes de búsqueda | Apache-2.0 (según el base) | Hugging Face |

Los tres adaptadores comparten el mismo base y se cargan simultáneamente en llama-server con un `--lora` cada uno, nombrando en cada petición el adaptador activo a escala 1.0 y los demás a 0.0. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no responde preguntas: solo reescribe y etiqueta peticiones. La aplicación anfitriona debe decidir qué se ejecuta; la salida del modelo por sí sola nunca autoriza una operación.
- No ha sido entrenado con plantillas de chat, mensajes de sistema ni ejemplos few-shot; usarlo con un chat template produce entradas fuera de distribución. Debe llamarse exclusivamente en `/v1/completions` con la superficie exacta descrita.
- El salto de línea tras `=>` es parte de la superficie; un prompt que termina en `=>` sin el salto es una entrada que el modelo nunca ha visto.
- La línea `Capabilities:` debe contener la lista completa de capacidades que ofrece el chat, no una preselección; el autor advierte explícitamente sobre este punto en la sección "What it does not fix".
- Las líneas `Earlier:` son necesarias para resolver referencias conversacionales; omitirlas degrada la interpretación de mensajes que continúan el hilo o apuntan a resultados previos.
- Los resultados de los benchmarks son declarados por el autor y no están verificados de forma independiente; la precisión del 33,5 % en preguntas reales de chat sugiere margen de mejora en ese escenario.
- Riesgo de alucinación: al ser un modelo de reescritura, puede inventar peticiones o capacidades no presentes en el mensaje original; el router debe validar cada capacidad contra sus propias puntuaciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Cobertura lingüística limitada a italiano, inglés, francés, alemán y español; otros idiomas quedan fuera del entrenamiento declarado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el fichero `LICENSE` del modelo base y verificarse las condiciones de Qwen3.5-0.8B.
- Para producción, el autor recomienda fijar el sha256 de la base y del adaptador para garantizar la reproducibilidad de las decisiones de enrutamiento, y usar `--cache-ram 0` para evitar que llama-server retenga hasta 8 GiB de prompts anteriores en memoria.

## Enlaces

- [Hugging Face: Gramscii-IT/SemanticRepair-0.8B](https://huggingface.co/Gramscii-IT/SemanticRepair-0.8B)
- [Hugging Face: Gramscii-IT/ToolChooser-0.8B](https://huggingface.co/Gramscii-IT/ToolChooser-0.8B)
- [Hugging Face: Gramscii-IT/QueryTranslator-0.8B](https://huggingface.co/Gramscii-IT/QueryTranslator-0.8B)
- [Dataset: Gramscii-IT/semantic-repair-routing](https://huggingface.co/datasets/Gramscii-IT/semantic-repair-routing)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
