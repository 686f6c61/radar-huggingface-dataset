# Neurobrix/Voxtral-Mini-3B-2507-nbx

## Resumen

Voxtral-Mini-3B-2507-nbx es un contenedor `.nbx` que empaqueta el modelo Voxtral-Mini-3B-2507 de Mistral AI para su ejecución en el motor de inferencia NeuroBrix. No se trata de un modelo nuevo ni de un fine-tuning: los pesos, la licencia (Apache 2.0) y el comportamiento son los del modelo original de Mistral; NeuroBrix únicamente añade el grafo de computación, la disposición de componentes y los valores por defecto de ejecución necesarios para que su motor lo cargue y lo ejecute. El contenedor ocupa 9,4 GB y su SHA-256 es `1e4fac0916c806f4268e632a0170891a142bc7f0ce05eb63867be6f72f9977ba`.

El modelo subyacente es un modelo de comprensión de voz (speech-understanding) de aproximadamente 3 000 millones de parámetros, con pipeline `audio-text-to-text`: recibe audio y texto y genera texto. Su relevancia práctica está en la portabilidad que aporta el contenedor: NeuroBrix planifica automáticamente dónde ejecutar cada parte del modelo (una GPU, varias, en streaming o en host) sobre GPUs NVIDIA, GPUs de Mac con Metal y CPU, con motor PyTorch o con un motor Triton que no requiere PyTorch. Esto permite desplegar el mismo contenedor en hardware heterogéneo sin reescribir el pipeline.

La ficha se publicó en el Hub el 13 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo original no está incluida en la documentación proporcionada, por lo que se indica como no disponible en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de comprensión de voz del tipo audio-text-to-text; arquitectura interna del original no detallada en la información disponible) |
| Parametros totales | aproximadamente 3 000 millones (según el nombre del modelo base, Voxtral-Mini-3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor se distribuye como `.nbx` de 9,4 GB; no se detallan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computación, pesos, conexiones entre componentes y valores por defecto de runtime); no se indica GGUF ni safetensors |
| Tamano del contenedor | 9,4 GB |
| SHA-256 | `1e4fac0916c806f4268e632a0170891a142bc7f0ce05eb63867be6f72f9977ba` |
| Modelo base | mistralai/Voxtral-Mini-3B-2507 |
| Pipeline | audio-text-to-text |
| Libreria | neurobrix |
| Hardware soportado | GPUs NVIDIA, GPUs de Mac (Metal), CPU |
| Motores de ejecucion | PyTorch y Triton (nbxtensor, sin PyTorch) |

## Arquitectura y entrenamiento

El contenedor no documenta la arquitectura interna del modelo original. Lo que sí especifica es la estructura del propio `.nbx`: incluye el grafo de computación del modelo, sus pesos, cómo se conectan sus componentes y sus valores por defecto de runtime. El motor de NeuroBrix interpreta ese grafo y decide la colocación de cada componente según las GPUs y la memoria disponibles, con modos de ejecución en una GPU, varias GPUs, streaming o host. El motor Triton utiliza kernels de nbxtensor certificados por clase de GPU y no depende de PyTorch; el motor PyTorch es la alternativa estándar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni sobre innovaciones técnicas del modelo original (decodificación especulativa, atención lineal u otras). Todos estos datos deben consultarse en la model card de `mistralai/Voxtral-Mini-3B-2507`, que la documentación de NeuroBrix referencia explícitamente como fuente de verdad para entrenamiento, uso previsto y limitaciones. El autor del contenedor declara que esos aspectos se aplican sin cambios.

## Capacidades

- Conversión de audio a texto: el pipeline declarado es `audio-text-to-text`, con entrada de audio (por ejemplo, un archivo WAV) y un prompt de texto.
- Comprensión de voz orientada a tareas: el ejemplo oficial de uso resume una llamada telefónica a partir de su audio.
- Generación de texto condicionada por audio: el prompt del usuario guía la tarea (resumen, extracción de información, respuesta a preguntas sobre el contenido).
- Ejecución local: el contenedor está etiquetado como `local-inference`, pensado para ejecutarse en hardware propio.
- Portabilidad de hardware: mismo contenedor en GPUs NVIDIA, GPUs de Mac con Metal y CPU, con planificación automática de la colocación de componentes.
- Doble motor de inferencia: PyTorch o Triton (nbxtensor), este último sin dependencia de PyTorch.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida, modo thinking y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resumen de reuniones y llamadas: se pasa el audio de la reunión con un prompt como "Summarize this call" y el modelo genera el resumen; es el flujo documentado oficialmente en la model card del contenedor.
- Transcripción y actas de atención al cliente: procesar grabaciones de llamadas para obtener texto estructurado que alimente un CRM o un sistema de tickets, ejecutando el contenedor en la infraestructura propia de la empresa.
- Despliegue en estaciones de trabajo sin GPU NVIDIA: gracias al soporte de GPUs de Mac con Metal y de CPU, el mismo contenedor sirve para prototipos y pruebas en portátiles Apple sin adaptar el pipeline.
- Procesamiento por lotes en servidores multigPU: el planificador de NeuroBrix reparte los componentes del modelo entre varias GPUs, lo que permite procesar colas de audios en un servidor con varias tarjetas sin configurar manualmente el reparto.
- Entornos con restricciones de dependencias: el motor Triton con kernels nbxtensor evita instalar PyTorch, útil en imágenes de contenedor mínimas o en sistemas donde PyTorch no está disponible o no se quiere mantener.
- Evaluación y prototipado de modelos de voz: al ser un contenedor reproducible con SHA-256 fijo y licencia Apache 2.0, se puede integrar en pipelines de experimentación y comparación de modelos de comprensión de voz con trazabilidad del artefacto.
- Inferencia en el borde o en host: el modo de ejecución en host permite escenarios donde la memoria de GPU es insuficiente para el modelo completo, a costa de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del contenedor no incluye métricas del modelo original ni del contenedor, y la documentación de NeuroBrix consultada solo aporta el tamaño del artefacto (8,7 GiB en el Hub, 9,4 GB en la tabla del contenedor).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El contenedor pesa 9,4 GB y el artefacto del Hub 8,7 GiB; a falta de datos de cuantización, el requisito de VRAM para cargar el modelo completo en GPU es del orden del tamaño del contenedor, y mayor si se ejecuta en precisión completa.
- GPUs recomendadas: no se especifican modelos concretos. El motor soporta GPUs NVIDIA y GPUs de Mac (Metal); los kernels Triton de nbxtensor están certificados por clase de GPU, pero la documentación disponible no enumera las clases certificadas.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del contenedor (9,4 GB) es compatible con GPUs de consumo de 12-16 GB o más si el modelo se carga íntegramente, pero no hay confirmación oficial ni datos de cuantización que lo garanticen.
- Opciones de despliegue: NeuroBrix (`pip install neurobrix`, `neurobrix import` y `neurobrix run`) con motor PyTorch o Triton. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Modos de ejecución: una GPU, varias GPUs, streaming o host, planificados automáticamente por el motor según la memoria y las GPUs detectadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Neurobrix/Voxtral-Mini-3B-2507-nbx | ~3 000 M | no disponible | Apache 2.0 | `.nbx`, motor NeuroBrix (PyTorch o Triton) | Contenedor del modelo de Mistral; soporte NVIDIA, Metal y CPU |
| mistralai/Voxtral-Mini-3B-2507 | ~3 000 M | no disponible | Apache 2.0 | pesos originales en el Hub de Hugging Face | Modelo de referencia; mismos pesos y licencia que el contenedor |
| Otros modelos audio-text-to-text de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación con alternativas de la misma categoría (otros modelos de comprensión de voz de tamaño similar) no está disponible en la documentación consultada; no se aportan cifras de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El contenedor no modifica el modelo: los sesgos, el riesgo de alucinación y las limitaciones del modelo original son los de `mistralai/Voxtral-Mini-3B-2507` y deben consultarse en su model card.
- No se documentan los idiomas soportados; no se puede asumir cobertura multilingüe sin verificar la model card original.
- No se dispone de la longitud de contexto, lo que impide planificar con precisión el procesamiento de audios largos o prompts extensos.
- No se detallan los tipos de cuantización ni el régimen de precisión; el requisito real de VRAM puede diferir del tamaño del contenedor.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones y atribuciones del modelo original deben respetarse tal como se indican en su model card.
- El ecosistema de ejecución es específico de NeuroBrix: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita la integración con infraestructuras existentes basadas en esos servidores.
- El modelo tiene 0 descargas y 0 likes en el Hub en el momento de la consulta; no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El motor Triton depende de kernels nbxtensor certificados por clase de GPU; en clases no certificadas el rendimiento o la compatibilidad no están garantizados.
- La fecha de creación del repositorio (13 de noviembre de 2026) y la ausencia de documentación adicional hacen recomendable verificar la integridad del artefacto mediante el SHA-256 publicado antes de desplegarlo.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/Neurobrix/Voxtral-Mini-3B-2507-nbx
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix/neurobrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Página del modelo en el Hub de NeuroBrix: https://neurobrix.org/models/mistralai/Voxtral-Mini-3B-2507
- Documentación de NeuroBrix: https://docs.neurobrix.org
- Documentación del Model Hub: https://docs.neurobrix.org/concepts/model-hub
- Hub de NeuroBrix: https://neurobrix.org
- Canal de YouTube de NeuroBrix: https://www.youtube.com/@NeuroBrix
