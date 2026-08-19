# KookiesXy/novatalk-82m

## Resumen

NovaTalk 82M es un modelo de lenguaje experimental de tipo decoder-only desarrollado por KookiesXy, entrenado desde inicialización aleatoria sobre el dataset TinyStories complementado con texto factual en inglés. Posteriormente ha recibido un post-entrenamiento supervisado orientado a diálogo y a la generación de llamadas a herramientas (tool calling) en formato JSON. El modelo está pensado como una prueba de concepto para tareas de conversación y automatización ligera, no como un sistema listo para producción.

A pesar de su nombre, el modelo cuenta con 63.823.360 parámetros reales (aproximadamente 64M), un tamaño muy reducido que lo hace ejecutable en hardware modesto, incluso CPU. Su arquitectura sigue el diseño de GPT-2, como indica la etiqueta `gpt2` en el repositorio, y los pesos se distribuyen en formato safetensors. La ventana de contexto no está especificada en la documentación disponible, aunque por el tipo de entrenamiento (TinyStories) es previsible que sea corta, probablemente 512 o 1024 tokens, pero este dato no se ha confirmado.

La relevancia de este modelo reside en su carácter didáctico y experimental: demuestra que con un corpus pequeño y un post-entrenamiento dirigido se puede obtener un asistente capaz de mantener diálogos simples y emitir llamadas a funciones estructuradas. No obstante, carece de licencia declarada, de documentación de benchmarks y de soporte multilingüe, por lo que su uso en aplicaciones reales es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only (tipo GPT-2) |
| Parametros totales | 63.823.360 (63,8M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | ingles (no declarado oficialmente, pero los datos de entrenamiento son en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura decoder-only estándar de los transformers, similar a GPT-2, con atención causal. Se entrenó desde cero (random initialization) sobre TinyStories, un corpus de cuentos cortos en inglés simplificado, complementado con texto factual en inglés para ampliar el conocimiento general. Después de esta fase de preentrenamiento, se aplicó un post-entrenamiento supervisado (SFT) con ejemplos de diálogo y de llamadas a herramientas en formato JSON, de modo que el modelo aprende a generar respuestas conversacionales y a emitir invocaciones estructuradas tras el prefijo `Tool call:`.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación avanzadas. Tampoco se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni la configuración de hiperparámetros. La ausencia de información sobre la longitud de contexto y la tokenización sugiere que se trata de un experimento rápido, probablemente con una ventana corta y un vocabulario limitado.

## Capacidades

- Generación de texto en inglés: produce respuestas coherentes en contextos simples gracias al entrenamiento sobre TinyStories.
- Diálogo multi-turno básico: siguiendo el formato `User: ...\nAssistant:`, el modelo mantiene conversaciones cortas.
- Tool calling en JSON: es capaz de emitir llamadas a funciones estructuradas tras el prefijo `Tool call:`, lo que permite integrarlo en pipelines simples de automatización.
- Razonamiento factual limitado: el entrenamiento con texto factual le proporciona cierta capacidad de responder preguntas de conocimiento general, aunque con baja fiabilidad.
- Sin soporte de visión, audio ni multimodalidad.
- Sin capacidades multilingües: solo inglés (presumiblemente).
- Sin modo de razonamiento explícito ni cadena de pensamiento.

## Casos de uso

- Prototipado de chatbots educativos: el modelo puede servir para demostrar un asistente conversacional básico en entornos de aprendizaje, dado su tamaño reducido y su formato de prompt simple.
- Experimentación con tool calling: los desarrolladores pueden estudiar cómo un modelo pequeño aprende a generar JSON estructurado para invocar funciones, útil para investigar técnicas de post-entrenamiento.
- Generación de cuentos cortos: gracias a TinyStories, el modelo puede crear narrativas breves y sencillas en inglés, útiles para aplicaciones de lectura infantil o generación de contenido creativo de baja exigencia.
- Automatización de tareas triviales: en un entorno controlado, el modelo podría emitir comandos JSON para activar acciones simples (por ejemplo, encender una luz o enviar un mensaje) en un sistema de demostración.
- Enseñanza de arquitecturas transformer: al ser un modelo pequeño y abierto (aunque sin licencia clara), puede usarse en cursos para ilustrar el entrenamiento desde cero y el ajuste fino supervisado.
- Pruebas de rendimiento en hardware limitado: su tamaño permite ejecutarlo en una Raspberry Pi o en un portátil sin GPU, sirviendo como referencia para medir la viabilidad de modelos diminutos en edge computing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan métricas de perplejidad ni de precisión en tareas de diálogo o tool calling.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~64M de parámetros, la inferencia en precisión FP32 requiere aproximadamente 255 MB de memoria (64M × 4 bytes). En FP16 serían unos 128 MB. Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060 o superiores). También funciona en CPU sin problemas.
- Compatibilidad con consumer GPU: sí, es perfectamente ejecutable en GPUs de gama baja y media.
- Opciones de despliegue: al ser un modelo con formato safetensors, se puede cargar con la librería `transformers` de Hugging Face en Python. También podría convertirse a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona dicha conversión.
- Latencia y throughput: no se han publicado datos. En una CPU moderna se esperan latencias de decenas de milisegundos por token, y en GPU, de pocos milisegundos. Sin mediciones oficiales, estos valores son orientativos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de tamaño similar. Se podría comparar con GPT-2 Small (124M) o con modelos TinyStories como TinyStories-33M, pero no hay datos de rendimiento de NovaTalk 82M para contrastar. La comparativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño entrenado sobre un corpus limitado, es muy propenso a generar información falsa o incoherente, especialmente fuera de los temas de los cuentos infantiles.
- Longitud de contexto no especificada: se desconoce la ventana máxima de tokens, lo que dificulta su uso en conversaciones largas o documentos extensos.
- Idioma limitado: solo inglés, y con un vocabulario restringido derivado de TinyStories.
- Licencia no declarada: no se indica ninguna licencia, lo que impide su uso comercial o su redistribución legal sin riesgo.
- Modelo experimental: el autor lo presenta como un experimento, sin garantías de calidad ni soporte.
- Sin benchmarks: no hay evidencia objetiva de su rendimiento en tareas estándar.
- Riesgo en producción: no recomendado para sistemas reales debido a su baja fiabilidad y a la falta de documentación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KookiesXy/novatalk-82m
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
