# Gramscii-IT/SemanticRepair-0.8B

## Resumen

SemanticRepair-0.8B es un modelo pequeño de lenguaje (SLM) publicado por Gramscii-IT sobre la base Qwen3.5-0.8B (772.845.888 parámetros en safetensors), orientado a una tarea muy concreta dentro de pipelines de recuperación aumentada (RAG): la reescritura semántica de consultas y el enrutado de capacidades. No es un modelo conversacional generalista, sino un conjunto de tres adaptadores LoRA (repair, tie-break y translation) que se sitúan detrás de un router de embeddings para decidir qué capacidad del sistema anfitrión debe ejecutarse ante un mensaje del usuario.

El adaptador de repair descompone un mensaje en las peticiones que contiene, una por línea, y nombra para cada una la capacidad del chat que la resuelve, o `none`; si el mensaje no pide nada, devuelve `NO_REQUEST`. El adaptador de tie-break desempata cuando el router y el repair dejan dos o más capacidades próximas, eligiendo una o absteniéndose para preguntar al usuario. El adaptador de translation reescribe la consulta en el idioma de los pasajes indexados para que la búsqueda léxica los encuentre, sin afectar a la búsqueda semántica.

Su relevancia actual radica en la relación calidad/tamaño: el tie-break es una destilación de un profesor 34 veces mayor (Qwen3.8-27B) y, según el autor, iguala o supera en acierto a modelos de 24B-40B en su tarea específica, con una tasa de error muy inferior. Está pensado para ejecutarse en local (el autor cita un Apple M4 Pro de 64 GB con llama.cpp) y se distribuye en GGUF con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con tres adaptadores LoRA |
| Parámetros totales | 772.845.888 (base en safetensors); base Q8_0 GGUF de 833.592.320 bytes |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (base GGUF publicada); adaptadores LoRA en F16 |
| Idiomas soportados | it, en, fr, de, es |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (base Q8_0 y adaptadores LoRA F16); safetensors en el repo base |

## Arquitectura y entrenamiento

La base es Qwen3.5-0.8B en la revisión `2fc06364`, un transformer decoder-only de menos de mil millones de parámetros. Sobre ella se aplican tres adaptadores LoRA independientes en F16 (unos 21,7 MB cada uno), cada uno especializado en una subtarea del enrutado: repair (7 de noviembre), tie-break (31 de octubre) y translation (7 de noviembre). El conjunto se distribuye como GGUF para su uso con llama.cpp, con hashes SHA-256 publicados para cada fichero.

El entrenamiento combina destilación y ajuste supervisado sobre el dataset `Gramscii-IT/semantic-repair-routing`. El adaptador de tie-break se destiló a partir de las decisiones de un profesor Qwen3.8-27B, 34 veces mayor, sobre desempates de rutas; el de translation aprendió a reescribir consultas en el idioma de los pasajes indexados siguiendo también al profesor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El diseño es deliberadamente conservador: ningún adaptador responde a la pregunta del usuario; el router del sistema anfitrión valida cada capacidad propuesta contra sus propias puntuaciones y la aplicación decide qué se ejecuta, de modo que la salida del modelo por sí sola nunca autoriza una operación.

## Capacidades

- Reescritura de consultas (query rewriting): descompone un mensaje en las peticiones que contiene, una por línea.
- Enrutado de capacidades (capability routing): asigna a cada petición una capacidad ofrecida por el chat o `none`; devuelve `NO_REQUEST` si el mensaje no pide nada.
- Lectura con contexto conversacional: interpreta el mensaje a la luz de los últimos turnos, de modo que continuaciones como «e per Milano?» se resuelven como parte de la conversación.
- Desempate de rutas (tie-break): elige entre capacidades próximas o se abstiene para preguntar al usuario.
- Traducción de consultas de búsqueda al idioma de los pasajes indexados, preservando números y códigos.
- Detección de intención y clasificación de peticiones.
- Multilingüe en it, en, fr, de y es.
- No incluye tool calling genérico, agentes autónomos, visión, audio ni modo thinking; su función es exclusivamente la capa de enrutado y reescritura.

## Casos de uso

- Enrutado de capacidades en asistentes con múltiples herramientas: el adaptador de repair identifica qué capacidad del chat resuelve cada petición del mensaje y el router del anfitrión valida la propuesta antes de ejecutar, evitando invocaciones no autorizadas.
- Desambiguación en asistentes conversacionales: cuando dos capacidades quedan próximas en la puntuación del router, el tie-break elige una o se abstiene y deriva al usuario, reduciendo ejecuciones erróneas (6,7 % de ejecuciones no solicitadas en el conjunto de prueba del autor).
- Reescritura de consultas en pipelines RAG: el adaptador de repair separa peticiones compuestas y el de translation las reescribe en el idioma de los pasajes, de modo que un índice léxico en ese idioma recupera documentos que la consulta original no encontraría.
- Búsqueda híbrida léxica y semántica: la traducción solo se aplica a la búsqueda por palabras; la búsqueda semántica conserva los términos del usuario, de forma que una traducción errónea puede añadir candidatos pero nunca eliminar los correctos.
- Continuidad conversacional multi-turno: al leer el mensaje junto con los últimos turnos, resuelve referencias elípticas («y para Milán?») sin requerir que el usuario repita el contexto.
- Despliegue en local o en el borde: con menos de 1.000 millones de parámetros y GGUF Q8_0, cabe en equipos de consumo y permite enrutado de bajo coste sin depender de una API externa.
- Soporte multilingüe en atención al cliente: con cobertura de it, en, fr, de y es, puede clasificar y reescribir consultas en esos idiomas antes de pasarlas al motor de recuperación.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea y conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Repair + tie-break en cadena de enrutado; 481 preguntas reales de chat en italiano (test) | Solo ejecutó capacidades solicitadas (%) | 36,8 |
| Repair + tie-break en cadena de enrutado; 481 preguntas reales de chat en italiano (test) | Ejecutó una capacidad no solicitada (%), menor es mejor | 6,7 |
| Tie-break; 201 desempates retenidos del 31 de octubre (146 it, 55 en) | Misma elección que el profesor Qwen3.8-27B (%) | 87,6 |
| Tie-break; 201 desempates retenidos del 31 de octubre (146 it, 55 en) | Elecciones erróneas (%), menor es mejor | 0,5 |
| Tie-break; 106 desempates del 22 de octubre (53 it, 53 en) | Misma elección que el profesor Qwen3.8-27B (%) | 77,4 |
| Tie-break; 106 desempates del 22 de octubre (53 it, 53 en) | Elecciones erróneas (%), menor es mejor | 0,9 |
| Translation; 382 consultas retenidas (223 a italiano, 159 a inglés) | Coincidencia exacta con la traducción del profesor (%) | 33,2 |
| Translation; 382 consultas retenidas (223 a italiano, 159 a inglés) | Formato correcto: una línea, números y códigos conservados, consulta no copiada (%) | 100,0 |
| Translation; 382 consultas retenidas (223 a italiano, 159 a inglés) | F1 medio de palabras compartidas con la traducción del profesor (%) | 90,9 |

Comparativa del autor en la tarea de tie-break sobre los 106 desempates del 22 de octubre (mismo Apple M4 Pro de 64 GB, llama.cpp, una petición a la vez):

| Modelo | Misma elección que el profesor (de 106) | Elecciones erróneas |
|---|---|---|
| SemanticRepair-0.8B (adaptador tie-break) | 82 | 1 |
| Qwen3.5-4B ajustado por Gramscii | 84 | 1 |
| Qwen3.6-35B-A3B (MoE, 3B activos), thinking off | 84 | 22 |
| LFM2.5-24B-A2B (MoE, 2B activos) | 77 | 28 |
| Flint (MoE, 40B, 2,5B activos) | 69 | 35 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para la base Q8_0 (833.592.320 bytes) más unos 22 MB por adaptador LoRA en F16; con cuantizaciones menores (Q4_K_M, Q5_K_M) el consumo baja aún más, aunque no se publican ficheros de esas cuantizaciones en el repo.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; el autor valida el funcionamiento en Apple M4 Pro (64 GB) con llama.cpp. Para despliegues en servidor, GPU de gama de entrada (T4, L4) o incluso CPU son viables por el tamaño del modelo.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con memoria unificada.
- Opciones de despliegue: llama.cpp (formato validado por el autor); vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no se publican cifras concretas; el autor indica ejecución con una petición a la vez en un Apple M4 Pro, sin datos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en tie-break (106 casos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemanticRepair-0.8B | 772.845.888 | no disponible | 82/106 aciertos, 1 error | apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-4B ajustado por Gramscii | no disponible | no disponible | 84/106 aciertos, 1 error | no disponible | no disponible |
| Qwen3.6-35B-A3B (MoE, 3B activos) | 35B totales, 3B activos | no disponible | 84/106 aciertos, 22 errores | no disponible | no disponible |
| LFM2.5-24B-A2B (MoE, 2B activos) | 24B totales, 2B activos | no disponible | 77/106 aciertos, 28 errores | no disponible | no disponible |
| Flint (MoE, 40B, 2,5B activos) | 40B totales, 2,5B activos | no disponible | 69/106 aciertos, 35 errores | no disponible | no disponible |

La comparación debe leerse con cautela: los modelos alternativos generaron su respuesta al prompt del 22 de octubre, mientras que el adaptador lee su decisión del prompt con el que fue entrenado, que añade la regla sobre documentos seleccionados. La ventaja principal del modelo es la tasa de error (1 frente a 22-35 en los MoE grandes) con un tamaño 30-50 veces menor.

## Limitaciones y advertencias

- No es un modelo de propósito general: no responde preguntas, no genera texto libre ni ejecuta herramientas; solo reescribe consultas, enruta capacidades y desempata.
- El acierto en la cadena completa de enrutado es bajo en términos absolutos (36,8 % de ejecuciones solo de capacidades solicitadas sobre 481 preguntas reales), aunque la tasa de ejecución no solicitada es contenida (6,7 %). El sistema anfitrión debe validar siempre las propuestas del modelo.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente; además, la comparación con modelos alternativos no es completamente homogénea por diferencias en el prompt utilizado.
- La cobertura lingüística se limita a it, en, fr, de y es; no hay datos sobre rendimiento fuera de esos idiomas.
- La traducción puede introducir errores; el diseño lo mitiga aplicándola solo a la búsqueda léxica, pero conviene monitorizar la recuperación.
- No se publican datos sobre sesgos, tasa de alucinación ni longitud de contexto soportada.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que conviene revisar antes de desplegar en producción.
- El adaptador de tie-break se entrenó con reglas concretas del sistema del autor; cambios en las reglas de enrutado del anfitrión pueden degradar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gramscii-IT/SemanticRepair-0.8B
- Perfil del autor: https://huggingface.co/Gramscii-IT
- Dataset de entrenamiento: https://huggingface.co/datasets/Gramscii-IT/semantic-repair-routing
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
