# evraldtah/Synapse-Alpha-1.0-4bit

## Resumen

Synapse Alpha 1.0 (4-bit) es un modelo de lenguaje ligero desarrollado por el usuario evraldtah como componente de inferencia local de Synapse, una aplicación de notas con grafo estilo Obsidian. Se trata de un ajuste fino completo (full fine-tune) de Qwen3.5-2B, entrenado sobre los prompts propios de la aplicación y posteriormente cuantizado a 4 bits para ejecutarse en dispositivos Apple mediante MLX, incluido el iPhone.

El modelo está especializado en tareas de productividad personal: transformar transcripciones de voz, documentos y texto extraído de fotos en notas estructuradas de reuniones o clases, limpiar transcripciones crudas sin resumirlas, sugerir enlaces `[[wiki]]` para el grafo de conocimiento y ejecutar un protocolo de herramientas propio basado en etiquetas XML (`<tool name="…">…</tool>`) que incluye búsqueda web, shell de Linux y gestión de páginas, etiquetas y archivos.

Su relevancia radica en que demuestra un caso real de modelo pequeño afinado para uso on-device: con unos 1.881 millones de parámetros y un tamaño de repo de 1,1 GB, es ejecutable localmente sin depender de la nube, lo que garantiza privacidad y funcionamiento sin conexión. Es un modelo alpha, entrenado sobre datos generados por los propios pipelines de Synapse, por lo que el autor recomienda verificar los hechos importantes y usar modelos mayores para razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-2B (detalle interno no disponible) |
| Parametros totales | 1.881.825.088 (≈1,88 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3.5-2B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de la familia Qwen de Alibaba, al que se aplica un ajuste fino completo (full fine-tune) sobre los prompts y flujos de trabajo específicos de la aplicación Synapse. El entrenamiento se realizó en una única GPU H100 en bf16, con el optimizador AdamW, una tasa de aprendizaje de 1e-5 y 2 épocas. No se ha publicado el número de tokens del conjunto de entrenamiento ni su composición detallada, aunque la model card indica que los datos incluyen texto de Wikipedia (CC BY-SA) y que se trata de datos generados a partir de los propios pipelines de Synapse.

Tras el ajuste fino, el modelo se cuantizó a 4 bits para el framework MLX de Apple, orientado a la ejecución eficiente en chips Apple Silicon, incluido el iPhone. El formato de conversación exige un único mensaje de sistema y uno de usuario (con los turnos previos incluidos en línea dentro de `<conversation_so_far>`), con `enable_thinking=false` en la plantilla de chat, y las respuestas terminan con el token `<|im_end|>`. El reconocimiento de voz no lo realiza el modelo: se apoya en SpeechTranscriber de Apple o en Whisper, y Synapse Alpha trabaja únicamente sobre texto.

## Capacidades

- Generacion de texto conversacional orientada a productividad y toma de notas.
- Transformacion de transcripciones de reconocimiento de voz, documentos y texto de fotos en notas de reuniones, clases y resumenes.
- Limpieza de transcripciones crudas: correccion de nombres y palabras mal reconocidas a partir del contexto, puntuacion y paragrafado, sin resumir el contenido.
- Gestion de la ruta de dividir-y-fusionar (split-and-merge) de Synapse para grabaciones largas.
- Acciones de edicion con IA y respuestas con citas a paginas en formato `[[Page]]`.
- Sugerencia de enlaces `[[link]]` para construir el grafo de conocimiento estilo Obsidian.
- Soporte de tool calling mediante el protocolo propio de Synapse con etiquetas XML (`<tool name="…">…</tool>`): busqueda web, lectura de paginas, shell de Linux en el telefono o el ordenador, y herramientas de agentes para paginas, enlaces, etiquetas, grafo y archivos.
- Ejecucion totalmente on-device mediante MLX en hardware Apple, incluido iPhone.
- Capacidades de razonamiento complejo limitadas por su tamano; el autor recomienda modelos mayores para tareas dificiles.

## Casos de uso

- Transcripcion y notas de reuniones: el usuario graba una reunion, Apple SpeechTranscriber o Whisper genera la transcripcion cruda, y el modelo la convierte en una nota estructurada con puntos clave, corrigiendo nombres mal reconocidos a partir del contexto.
- Apuntes de clases y conferencias: convierte grabaciones largas de lecciones en notas organizadas, usando la ruta split-and-merge para procesar grabaciones que exceden lo que cabe en una sola pasada.
- Limpieza de transcripciones sin resumir: util para periodistas o investigadores que necesitan el texto literal pero legible, con puntuacion y paragrafado correctos.
- Asistente de conocimiento personal: responde preguntas sobre las notas del usuario citando las paginas relevantes con el formato `[[Page]]`, y sugiere nuevos enlaces `[[link]]` para enriquecer el grafo de conocimiento.
- Agente local con herramientas: mediante el protocolo XML de herramientas, puede buscar en la web, leer paginas y ejecutar comandos en un shell de Linux desde el telefono o el ordenador, por ejemplo para organizar archivos o automatizar tareas de mantenimiento de la biblioteca de notas.
- Privacidad y uso sin conexion: al ejecutarse cuantizado a 4 bits con MLX en iPhone o Mac, permite procesar notas personales sensibles sin enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el repo pesa 1,1 GB en cuantizacion de 4 bits; en un Mac o iPhone con Apple Silicon cabe en la memoria unificada sin GPU dedicada. En hardware NVIDIA se necesitarian aproximadamente 1,5-2 GB de VRAM, aunque el formato MLX no es directamente compatible con CUDA.
- GPU recomendadas: chips Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) y iPhone modernos compatibles con MLX. Para el entrenamiento del modelo base se uso una NVIDIA H100, pero para inferencia no es necesaria.
- Consumer GPU: al estar cuantizado en formato MLX, esta pensado para hardware Apple, no para GPUs NVIDIA de consumo como la RTX 4090. Con 1,1 GB de pesos, cualquier Mac con Apple Silicon lo ejecuta con holgura.
- Opciones de despliegue: MLX (framework nativo para el que esta cuantizado). No se indica disponibilidad en GGUF, vLLM, TGI u Ollama; para usarlo fuera de MLX habria que partir del modelo base Qwen/Qwen3.5-2B.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|
| Synapse Alpha 1.0 (4-bit) | 1,88 B | 4 bits (MLX) | Apache-2.0 | Notas, transcripciones y agentes on-device (ajuste fino de Qwen3.5-2B) |
| Qwen/Qwen3.5-2B (base) | ≈2 B | multiples (según repo oficial) | Apache-2.0 | Modelo generalista sin especializar en productividad |
| Qwen3-1.7B | 1,7 B | multiples (GGUF, MLX, etc.) | Apache-2.0 | Conversacion y razonamiento generalista, ecosistema amplio |

Synapse Alpha 1.0 se diferencia de los modelos generalistas de tamano similar en que ha sido ajustado finamente para un dominio concreto (toma de notas, limpieza de transcripciones y un protocolo de herramientas propio), a costa de un rendimiento probablemente inferior en razonamiento general, tal como advierte el propio autor.

## Limitaciones y advertencias

- Es una version alpha entrenada sobre datos generados por los propios pipelines de Synapse: el autor recomienda explicitamente verificar los hechos importantes y usar un modelo mayor para razonamiento dificil.
- Riesgo de alucinacion elevado por su tamano reducido (≈1,88 B) y por el entrenamiento sobre datos sinteticos.
- Solo procesa texto: el reconocimiento de voz depende de SpeechTranscriber de Apple o Whisper, que son componentes externos.
- Formato de prompt restrictivo: exige un unico mensaje de sistema y uno de usuario, con los turnos previos incluidos en `<conversation_so_far>` y `enable_thinking=false`; desviarse de este formato puede degradar el rendimiento.
- Longitud de contexto no publicada; las conversaciones multi-turno se gestionan inlining el historial, lo que puede consumir contexto rapidamente en sesiones largas.
- Idiomas soportados no documentados en la model card.
- Cuantizacion en formato MLX: no es directamente desplegable en GPUs NVIDIA ni con runtimes estandar como vLLM o llama.cpp sin conversion adicional.
- Licencia Apache-2.0, sin restricciones para uso comercial; el dato de entrenamiento de Wikipedia (CC BY-SA) podria tener implicaciones de atribucion en casos extremos, aunque la licencia del modelo lo permite.
- Advertencia general para produccion: al tratarse de un modelo muy especializado y con poca documentacion publica, conviene evaluarlo con casos de uso propios antes de integrarlo en aplicaciones criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evraldtah/Synapse-Alpha-1.0-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Organizacion de Qwen en HuggingFace: https://huggingface.co/Qwen
- Paper, repositorio de codigo de la aplicacion o demo: no disponibles en la informacion proporcionada.
