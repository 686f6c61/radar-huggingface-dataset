# run-saina/saina-helm-3-0.8b

## Resumen

Saina Helm 3 es un modelo multimodal nativo de 0,8B parámetros (852.985.920 pesos según safetensors) desarrollado por run-saina, afinado a partir de Qwen/Qwen3.5-0.8B. A diferencia de un modelo generativo convencional, Helm 3 no produce texto: recibe un estado (texto o JSON), imágenes y clips de audio cortos, junto con una o varias preguntas tipadas, y devuelve una distribución de probabilidad sobre las respuestas posibles. Es decir, funciona como un clasificador multimodal de propósito general con cabeza de decisión.

El modelo resuelve el problema de tomar decisiones estructuradas (sí/no, elección única, elección múltiple, valoración por niveles) sobre entradas heterogéneas en una sola pasada, con una confianza cuantificada por respuesta. Incluye un modo de decisión que devuelve abstención con motivo cuando la confianza cae por debajo de un umbral, lo que permite encajar el modelo en flujos con escalado a revisión humana.

Su relevancia actual radica en el tamaño: 0,8B parámetros permiten ejecución en una sola GPU, en Apple Silicon (vía MLX) o en CPU, con pesos publicados también en GGUF y Ollama. La licencia Apache 2.0 y la disponibilidad de un harness público de evaluación (Decision Index) lo hacen atractivo para enrutado, verificación documental y etiquetado multimodal en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; cabecera de clasificación multimodal propia de la librería `saina`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card indica "hasta la ventana de contexto" sin cifra) |
| Tipos de cuantizacion | no disponible de forma explícita; existen pesos GGUF para llama.cpp y pesos MLX |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (`run-saina/saina-helm-3-0.8b-GGUF`), MLX (`run-saina/saina-helm-3-0.8b-MLX`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se presenta como un fine-tune con relación `base_model_relation: finetune`. La model card describe un comportamiento "nativamente multimodal": texto, imágenes y audio se procesan conjuntamente en una sola pasada sobre la entrada compartida, de modo que todas las preguntas formuladas en una misma petición ven el conjunto completo de modalidades. La salida no es texto generado, sino puntuaciones de probabilidad por opción, gestionadas por una cabeza de respuesta propia de la librería `saina` (versión 0.9.1 o superior, que reduce el consumo de memoria en entradas largas).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla la innovación arquitectónica concreta más allá de la integración multimodal y del mecanismo de abstención en modo decisión, que devuelve respuesta vacía con un motivo cuando la confianza no supera un umbral configurable. La evaluación se realiza con un harness público propio (`run-saina/saina-decision-index`), lo que permite reproducir las puntuaciones declaradas.

## Capacidades

- Clasificación multimodal conjunta: responde preguntas sobre texto, capturas de pantalla, fotos, gráficos, recibos y clips de audio cortos en una misma petición.
- Cuatro tipos de pregunta: `yes_no` (devuelve `yes`, `no` y `confidence`), `single_choice` (2 a 255 opciones, con `probabilities`, `selection` y `confidence`), `multi_choice` (pertenencia independiente por opción) y `rating` (2 a 10 niveles ordenados, con `expected_level`).
- Modo decisión con abstención: con `mode='decision'` y un `threshold`, las respuestas de baja confianza se devuelven vacías con un motivo, habilitando escalado a revisión.
- Múltiples preguntas por pasada: todas las preguntas se responden a partir de una única pasada sobre la entrada compartida.
- Límites de entrada: hasta 8 imágenes por petición (PNG, JPEG, WebP; 10 MB cada una) y hasta 4 audios por petición (WAV, FLAC, MP3, Ogg, WebM; 10 MB y 10 s cada uno).
- Etiquetado y clasificación: etiquetas de audio, etiquetas de imagen y clasificación multietiqueta según los tags del repositorio.
- No genera texto de ningún tipo: solo puntúa las opciones suministradas.

## Casos de uso

- Enrutado de tickets de soporte con captura adjunta: se envía el texto del mensaje y la captura en una sola petición con una pregunta `single_choice` sobre la cola de destino; el modelo devuelve la selección y la confianza, y el sistema deriva a revisión humana los casos por debajo del umbral en modo decisión.
- Verificación de gastos y recibos: se compara el importe reclamado con la imagen del recibo mediante preguntas `yes_no` y `single_choice` (aprobar, revisar, rechazar), tal como muestra el ejemplo de la model card; encaja por su lectura conjunta de estado JSON e imagen.
- Triaje de llamadas con posible voz sintética: con clips de audio de hasta 10 segundos, se formula una pregunta `yes_no` o `rating` sobre la probabilidad de voz artificial; el límite de 4 clips por petición permite cubrir varios fragmentos de una misma llamada.
- Etiquetado de catálogo de imágenes y sonidos: clasificación multietiqueta de imágenes (productos, escenas) y de audio (eventos sonoros) usando `multi_choice`, con probabilidades independientes por etiqueta para umbralizar después en el pipeline.
- Clasificación de documentos y gráficos: preguntas `rating` sobre la calidad o el estado de un gráfico o formulario escaneado, aprovechando `expected_level` para ordenar casos por severidad.
- Enrutado en agentes y sistemas multi-paso: el modelo actúa como componente de decisión barato (0,8B, ejecutable en CPU) dentro de un agente mayor, seleccionando la siguiente acción entre opciones predefinidas con una confianza explícita que el orquestador puede usar para escalar.
- Control de calidad con abstención: en pipelines donde un error es recuperable, el modo decisión con umbral permite automatizar solo los casos de alta confianza y desviar el resto, reduciendo el coste de revisión manual.

## Benchmarks y rendimiento

| Modelo | Decision Index (texto) | Decision Index Vision |
|---|---|---|
| Saina Helm 3 | 45,89 | 47,36 |
| Saina Helm 2 Omni | 37,44 | 46,90 |

El Decision Index es un índice público de tareas de decisión (suite completa de 140.620 peticiones), con puntuaciones sobre 100 corregidas por azar: 0 equivale a adivinar al azar y 100 a acierto perfecto. Las ejecuciones son autoinformadas por el autor con el harness publicado en `run-saina/saina-decision-index`. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 852.985.920 parámetros, en FP16 los pesos ocupan aproximadamente 1,7 GB, y en cuantizaciones de 8 o 4 bits bajan de 1 GB (estimación a partir del recuento de parámetros, no publicada por el autor).
- El autor indica que el modelo "cabe en una sola GPU, en Apple silicon o en CPU".
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer con suficiente VRAM para el modelo base y las entradas multimodales debería ser viable.
- Despliegue: PyTorch con la librería `saina` (>= 0.9.1), MLX en Apple Silicon, GGUF con llama.cpp, Ollama (con la build Saina del fork de Ollama), servidor autoalojado con `saina[local,server,media]` y API alojada en saina.run.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saina Helm 3 | 852.985.920 | no disponible | Clasificación multimodal con probabilidades y abstención | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Saina Helm 2 Omni | no disponible | no disponible | Clasificación multimodal (generación anterior) | no disponible | HF |
| Qwen/Qwen3.5-0.8B (base) | 0,8B (aprox.) | no disponible | Modelo generativo multimodal del que deriva | no disponible en la información | HF |

No se dispone en la información proporcionada de comparaciones con clasificadores multimodales de otros fabricantes; los únicos datos cuantitativos comparables son los del Decision Index frente a Saina Helm 2 Omni.

## Limitaciones y advertencias

- No genera texto: solo puntúa las opciones que se le suministran; no sirve para tareas generativas.
- Uso previsto restringido a decisiones recuperables o revisadas antes de aplicarse; el autor excluye explícitamente decisiones finales con consecuencias materiales (crédito, empleo, medicina, legal).
- Prohibido su uso para identificar o clasificar personas o perfilar individuos, y para filtrado de seguridad o moderación de contenido.
- No soporta vídeo ni audio de más de 10 segundos.
- Riesgo de inyección de instrucciones: el texto, las imágenes y el audio de entrada pueden contener instrucciones que desvíen las respuestas; no debe decidirse directamente sobre contenido no fiable.
- No se especifican sesgos conocidos, idiomas soportados ni comportamiento de alucinación (al no generar texto, el riesgo se traslada a clasificaciones erróneas con confianza alta).
- Es necesario validar el modelo sobre datos etiquetados propios y con el espacio de etiquetas propio antes de usarlo en producción.
- Requiere la librería `saina` 0.9.1 o superior; versiones anteriores rechazan el modelo.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen/Qwen3.5-0.8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/run-saina/saina-helm-3-0.8b
- Pesos GGUF: https://huggingface.co/run-saina/saina-helm-3-0.8b-GGUF
- Pesos MLX: https://huggingface.co/run-saina/saina-helm-3-0.8b-MLX
- Ollama: https://ollama.com/run-saina/saina-helm-3-0.8b
- Build de Ollama con soporte Saina: https://github.com/ramarlina/ollama/tree/saina-helm-3
- Repositorio de la librería `saina`: https://github.com/run-saina/saina
- Paquete PyPI: https://pypi.org/project/saina/
- Harness del Decision Index: https://github.com/run-saina/saina-decision-index
- Space del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- API alojada: https://saina.run
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
