# snchimata/tokenfold-select-v3

## Resumen

Tokenfold Select v3 es un encoder de 149,6 millones de parámetros desarrollado por el usuario snchimata, derivado del modelo base cross-encoder/ettin-reranker-150m-v1. Su función no es generar texto, sino puntuar grupos de contenido (pasajes, bloques de código, mensajes de herramientas, turnos de conversación) en función de su relevancia respecto a una consulta y respecto a los grupos vecinos que comparten ventana de contexto. El resultado es un conjunto de puntuaciones no calibradas que la aplicación consumidora utiliza para decidir qué fragmentos entran en la ventana de contexto final.

El modelo aborda un problema concreto de los pipelines RAG y de agentes: la selección de contexto. Frente a la summarización generativa, que reescribe el contenido, o a la poda a nivel de token, que rompe la estructura interna del texto, Select v3 ofrece una capa de selección aprendida que permite conservar los bytes originales de los grupos elegidos y delegar el control exacto del presupuesto de tokens a la aplicación. Está entrenado específicamente para esta tarea, con un encoder Ettin completo de 22 capas más una cabeza no lineal de puntuación conjunta, no como un reranker base reutilizado.

Es relevante porque separa dos responsabilidades que suelen mezclarse: el modelo puntúa, la aplicación decide. Esto encaja con arquitecturas de agentes que necesitan proteger firmas de funciones, instrucciones del sistema o bloques obligatorios, y que no pueden permitirse una reescritura generativa que altere el contenido. La licencia Apache 2.0 y la inferencia local en CPU o CUDA facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer Ettin de 22 capas con cabeza no lineal de puntuación conjunta de grupos (arquitectura personalizada, no compatible con AutoModel) |
| Parametros totales | 149.606.401 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones; el loader soporta FP32 y FP32 con autocast BF16 en parámetros |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB, librería pytorch) |

## Arquitectura y entrenamiento

El modelo parte del backbone cross-encoder/ettin-reranker-150m-v1, un encoder de 22 capas, y le añade una cabeza no lineal entrenada para puntuación conjunta de grupos. La innovación clave es que la consulta y los grupos vecinos comparten una única entrada del encoder dentro de cada ventana admitida: un grupo se puntúa en su contexto circundante, no como un par consulta-span aislado. Esto permite al modelo capturar dependencias entre grupos (por ejemplo, que un bloque de logs sea relevante solo si otro bloque de código ya está presente). El autor indica explícitamente que no es un reranker base con una etiqueta nueva, sino un modelo entrenado de extremo a extremo desde el backbone hasta la readout.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo no realiza generación autoregresiva ni poda de subwords: devuelve puntuaciones flotantes sin normalizar por grupo, donde un valor mayor indica mayor relevancia predicha, no una probabilidad calibrada. La integración requiere el loader incluido en el bundle (instalado con `pip install --no-deps ./tokenfold-select-v3/loader`) y verificación de integridad mediante dos hashes SHA-256 que fijan el bundle local y el checkpoint.

## Capacidades

- Puntuación de relevancia a nivel de grupo: asigna una puntuación flotante a cada grupo de texto respecto a una consulta y sus grupos vecinos.
- Puntuación contextual conjunta: dentro de cada ventana, la consulta y los grupos comparten entrada del encoder, de modo que la puntuación de un grupo depende del resto de grupos admitidos.
- Selección sin reescritura: la aplicación puede copiar literalmente los bytes originales de los grupos elegidos, sin paraphrasing generativo.
- Soporte para múltiples tipos de contenido: pasajes de documentos, bloques de código, logs, mensajes de herramientas y turnos de conversación.
- Integración con presupuestos de tokens controlados por la aplicación: el modelo no impone límites ni ordena; solo puntúa.
- Inferencia local en CPU (FP32) y CUDA (FP32 con autocast BF16 en parámetros), sin fallback automático entre dispositivos ni precisiones.
- Idioma: únicamente inglés.
- No soporta tool calling, function calling, agentes autónomos, visión, audio ni modo thinking; es un componente de puntuación, no un modelo generativo.

## Casos de uso

- RAG con ranking de pasajes: antes de asignar contexto al LLM generador, el pipeline pasa la pregunta activa y los pasajes recuperados a Select v3, que devuelve una puntuación por pasaje; el orquestador selecciona los de mayor puntuación respetando un tope exacto de tokens y protegiendo pasajes obligatorios.
- Agentes de código: el agente divide el repositorio o el estado en grupos (firmas de funciones, bloques de implementación, tests, mensajes de error) y Select v3 puntúa cada grupo contra la tarea activa; la aplicación conserva las firmas y los bloques requeridos por reglas explícitas y usa las puntuaciones para el resto.
- Pipelines con muchas herramientas: en flujos con decenas de salidas de herramientas, Select v3 puntúa cada salida contra la consulta del usuario y las salidas vecinas, permitiendo descartar resultados irrelevantes sin una etapa de reescritura generativa que podría corromper JSON o estructuras de datos.
- Gestión de contexto conversacional: en conversaciones multi-turno largas, el modelo puntúa turnos o grupos de turnos contra el mensaje actual; la aplicación fuerza la inclusión de historial obligatorio (instrucciones del sistema, compromisos previos) y usa las puntuaciones para el resto.
- Compresión de contexto en pipelines de CI/CD: antes de enviar un informe de fallos o un diff extenso a un modelo generativo, se agrupan los fragmentos y se seleccionan los relevantes para la tarea de diagnóstico, reduciendo el coste de tokens sin alterar el contenido original.
- Filtrado de documentación en asistentes técnicos: dado un conjunto de secciones de documentación recuperadas, el modelo puntúa su relevancia conjunta respecto a la consulta del desarrollador, permitiendo construir un contexto coherente (por ejemplo, evitar incluir dos secciones que se contradicen si solo una es relevante para la pregunta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,6 GB en safetensors; en FP32 los 149,6 M de parámetros requieren aproximadamente 0,6 GB de pesos más memoria de activaciones, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con soporte BF16 para el modo CUDA (el autor exige una GPU capaz de BF16); para FP32 puro, cualquier GPU con al menos 2-4 GB de VRAM libre.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también funciona en CPU en FP32 sin GPU.
- Opciones de despliegue: el modelo no usa AutoModel.from_pretrained; requiere el loader propio incluido en el bundle (`tokenfold_select_v3.ettin.EttinDevelopmentScorer`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Notas de despliegue: el SDK no instala el stack de ML implícitamente; se requieren versiones fijadas en requirements.txt (Python 3.12, Torch 2.11.0 o 2.11.0+cpu). El modo CUDA no hace fallback automático a CPU ni a otra precisión. Se recomienda ejecutar en un proceso dedicado con `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tokenfold Select v3 | 149,6 M | No disponible | Puntuación conjunta de grupos de contexto | Apache 2.0 | Hugging Face (snchimata/tokenfold-select-v3) |
| cross-encoder/ettin-reranker-150m-v1 | ~150 M | No disponible | Reranking cross-encoder consulta-documento | No disponible en la información | Hugging Face (modelo base) |
| Rerankers cross-encoder convencionales (p. ej. familia BGE reranker) | Variable (base/large) | Variable | Reranking consulta-documento aislado | Variable según modelo | Hugging Face |

La diferencia principal frente a un reranker cross-encoder convencional es que Select v3 puntúa grupos en contexto conjunto (consulta más grupos vecinos en una misma ventana), mientras que un reranker estándar evalúa cada par consulta-documento de forma independiente. Frente a soluciones de summarización generativa, Select v3 no reescribe el contenido y no requiere validación de estructura generada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un backbone derivado de Ettin, puede heredar sesgos del corpus original de dicho modelo.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero las puntuaciones no están calibradas como probabilidades y pueden ordenar mal grupos en dominios alejados de los datos de entrenamiento.
- Limitación de idioma: solo inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Limitación de contexto: la longitud máxima de contexto no está documentada; los grupos deben caber en la ventana del encoder junto con la consulta y los vecinos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Ettin y de sus datos de entrenamiento.
- Caveat de producción: el modelo devuelve puntuaciones sin normalizar; la aplicación debe implementar su propio allocator, reglas de protección de grupos obligatorios y recuento exacto de tokens. Los límites de grupo no garantizan por sí solos sintaxis válida en la combinación seleccionada ni preservación de la respuesta.
- Caveat de integración: no es compatible con `AutoModel.from_pretrained()`; requiere el loader incluido y verificación de hashes. El modo CUDA exige GPU con BF16 y no hay fallback automático.
- Caveat de despliegue: el SDK no instala dependencias de ML; hay que gestionar el stack de Torch manualmente con las versiones fijadas.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/snchimata/tokenfold-select-v3
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-150m-v1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
