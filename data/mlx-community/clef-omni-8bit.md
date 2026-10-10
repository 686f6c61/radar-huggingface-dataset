# mlx-community/clef-omni-8bit

## Resumen

clef-omni-8bit es una conversion a MLX en cuantizacion de 8 bits del modelo Cloudflare/clef-omni, publicada por la organizacion mlx-community para su ejecucion en Apple Silicon. El modelo original es un modelo de decision (decision model) de tipo mixture-of-experts con 30B de parametros totales y aproximadamente 3B activos por token, construido sobre el thinker de Qwen3-Omni. Su funcion no es conversar, sino recibir un estado (texto, JSON, imagenes, audio o video con su pista de sonido) junto con un esquema de preguntas tipadas y devolver, en un unico forward pass, una probabilidad para cada opcion permitida.

Esta variante concreta pesa 35,0 GB en el repositorio y esta pensada para Macs con 64 GB de memoria unificada o mas. La cuantizacion a 8 bits mantiene mayor fidelidad numerica que la variante de 4 bits del mismo autor, a cambio de mas memoria y algo mas de latencia: el autor reporta 0,26 s para 1k tokens y 5,4 s para 14k tokens en un M5 Max de 128 GB, con un pico de memoria de 35,6 a 37,5 GB segun la longitud de entrada.

Su relevancia actual radica en que cubre un nicho poco frecuente: clasificacion y decision estructurada multimodal (audio y video incluidos) con salida tipada y probabilidades, en lugar de generacion de texto libre. Al ser una tarea de decision, puede integrarse como componente determinista dentro de pipelines mayores, y ademas expone un servidor local compatible con la API SystemOne. El repositorio acumulaba 0 descargas y 1 like en el momento de la consulta, por lo que se trata de una publicacion muy reciente y poco rodada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) sobre el thinker de Qwen3-Omni, con cabeza conjunta de esquema (SystemOne) |
| Parametros totales | 31.719.205.488 (aproximadamente 31,7 B; configuracion comercial 30B-A3B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | No disponible de forma explicita; el autor documenta latencias para 1k, 4k y 14k tokens y devuelve error 413 "maximum context length" cuando la entrada no cabe |
| Tipos de cuantizacion | 8 bits en formato MLX (esta variante); existe tambien una variante de 4 bits del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX, con codigo personalizado (`clef_mlx.py`) para cargar el backbone y la cabeza de esquema |

Datos adicionales del repositorio: tamano 35,0 GB, biblioteca `mlx`, pipeline declarado `zero-shot-classification`, modelo base `Cloudflare/clef-omni` con relacion `quantized`, fecha de creacion 2026-10-09 y ultima actualizacion 2026-10-09.

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE) heredado del thinker de Qwen3-Omni, al que Cloudflare anade una cabeza de esquema conjunta que se ejecuta junto al backbone. El etiquetado del repositorio incluye `qwen3_omni_moe` y `custom-code`, lo que confirma que se requiere codigo propio para la inferencia: cargar el modelo con `mlx_vlm.generate` o con LM Studio descarga el backbone pero produce texto sin sentido, porque no ejecuta la cabeza de decision. La salida no es una secuencia de tokens libre, sino una probabilidad por cada opcion permitida definida en el esquema de preguntas.

La entrada admite estado en texto o JSON mas adjuntos multimodales: imagenes en ruta, URL, data URL base64, bytes crudos o imagenes PIL; audio en fichero, URL, base64, bytes o arrays de muestras mono a 16 kHz; y video en fichero, URL, base64, bytes o arrays de fotogramas RGB. Los videos se muestrean a 2 fotogramas por segundo y su banda sonora se procesa junto a los fotogramas cuando todos los videos del registro tienen pista de audio. Los tipos de pregunta documentados son `choice` (eleccion entre opciones con criterios), `score` (puntuacion ordenada) y `noul` (booleano). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en esta variante ni en el modelo base a partir de los datos proporcionados.

## Capacidades

- Clasificacion zero-shot con salida estructurada: devuelve una probabilidad por cada opcion definida en el esquema, en un solo forward pass.
- Preguntas tipadas: `choice` con criterios por opcion, `score` con escala ordenada y `noul` como booleano.
- Entrada multimodal combinada en un mismo registro: texto, JSON, imagenes, audio y video con su banda sonora.
- Procesamiento de audio: ficheros (por ejemplo WAV o MP3), arrays de muestras mono a 16 kHz y audios de aproximadamente 30 s con latencia en torno a 0,5 s en 8 bits.
- Procesamiento de video: muestreo a 2 fps con analisis simultaneo del sonido; un video de 21 s con audio tarda 4,6 s en 8 bits.
- Procesamiento de imagen: una imagen de 1 MP tarda aproximadamente 0,5 s en 8 bits.
- Servidor local con API compatible con SystemOne: `POST /v1/systemone`, `GET /health` y `GET /v1/models`, con la misma forma de peticion y respuesta que la API Jev/SystemOne y el ejemplo de Workers AI `@cf/cloudflare/clef-omni`.
- Interfaz de linea de comandos con subcomandos `predict` y `serve`, aceptacion de JSON en linea, fichero `.json` o `stdin`, y adjuntos repetibles mediante `--image`, `--audio` y `--video`.
- No es un modelo de chat: no genera texto conversacional ni soporta tool calling, function calling ni razonamiento multi-paso en el sentido habitual de un LLM generativo.

## Casos de uso

- Triaje de tickets de soporte: con el ejemplo de la propia model card, una incidencia como "nuestro checkout devuelve errores y los pedidos estan bloqueados" se clasifica simultaneamente en departamento (`choice`: billing o technical), urgencia (`score`) y caida de servicio (`noul`), lo que permite enrutar el ticket sin un modelo generativo intermedio.
- Monitorizacion de incidentes: clasificar mensajes operativos entrantes para determinar si hay un servicio caido y con que prioridad, integrando la llamada en un sistema de alertas que consume probabilidades.
- Inspeccion de campo asistida por multiples modalidades: el ejemplo de la model card revisa una instalacion combinando una foto de la unidad, una grabacion de su funcionamiento y un video del ventilador para responder si la etiqueta de modelo y numero de serie es visible, si el sonido es normal y si el ventilador gira.
- Analisis de buzon de voz: transcribir y clasificar un voicemail adjuntando el audio para decidir si el problema es urgente y a que equipo corresponde.
- Moderacion y etiquetado de contenido audiovisual: asignar etiquetas tipadas a videos con sonido o a imagenes, con salida probabilistica que permite fijar umbrales de confianza en lugar de depender de texto generado.
- Automatizacion de encuestas y formularios: enviar respuestas abiertas en texto o JSON y obtener puntuaciones ordenadas y decisiones booleanas de forma consistente y repetible.
- Procesamiento por lotes de datos heterogeneos: al aceptar rutas de fichero, URLs, base64 y bytes crudos, encaja en pipelines de ingesta que mezclan imagenes, audio y video en un mismo flujo.
- Despliegue local con API compatible: mediante `clef_mlx.py serve` se puede apuntar un cliente SystemOne existente a un Mac local en `http://127.0.0.1:8000`, util para entornos con restricciones de salida a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card original de `Cloudflare/clef-omni` para consultar los benchmarks, pero esos datos no forman parte de la informacion proporcionada, por lo que no se reproduce ninguna cifra de MMLU, HumanEval, GSM8K ni similares.

Los unicos datos de rendimiento disponibles son medidas de latencia y memoria del propio autor de la conversion, tomadas en un M5 Max con 128 GB como mediana de 3 ejecuciones:

| Metrica (8 bits) | 1k tokens | 4k tokens | 14k tokens |
|---|---|---|---|
| Memoria pico | 35,6 GB | 36,1 GB | 37,5 GB |
| Latencia | 0,26 s | no disponible | 5,4 s |

Otras medidas reportadas en 8 bits: 0,5 s para una imagen de 1 MP, 0,5 s para un audio de 30 s y 4,6 s para un video de 21 s con sonido.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, ya que los pesos estan en formato MLX y la inferencia depende del framework MLX.
- RAM minima indicada por el autor: 64 GB de memoria unificada para la variante de 8 bits. macOS limita por defecto el uso de GPU a aproximadamente el 70-75 por ciento de la RAM, por lo que el minimo es superior al pico medido.
- Memoria pico medida: 35,6 GB con 1k tokens, 36,1 GB con 4k tokens y 37,5 GB con 14k tokens.
- Equipo de referencia de las mediciones: Mac con M5 Max y 128 GB de memoria unificada.
- No cabe en GPUs de consumo tipo RTX 4090 ni en aceleradores CUDA: el repositorio no ofrece pesos GGUF ni una ruta de despliegue fuera de MLX.
- Opciones de despliegue: cargador `clef_mlx.py` con `model.systemone(...)` o `model.predict(...)`, linea de comandos con `predict` y servidor local con `serve --port 8000`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Advertencia de despliegue: LM Studio y `mlx_vlm.generate` cargan el backbone pero no la cabeza de esquema, por lo que producen texto sin sentido. Hay que usar el cargador incluido.
- Dependencias: `mlx-vlm>=0.7.6,<0.8` (el script avisa si se usa una version menor no probada), `huggingface_hub`, `av` para audio y video, `pillow` para imagenes, y `transformers` solo para el tokenizer y el extractor de caracteristicas numpy de Whisper. Probado con mlx 0.32.3, mlx-vlm 0.7.6 y transformers 5.19. No requiere torch.
- Alternativa mas ligera: la variante de 4 bits baja a 19,8 GB de descarga, 20,3 a 22,2 GB de pico, 0,19 s y 4,5 s de latencia y 2,8 s para un video de 21 s con sonido, con 32 GB de RAM minima.
- Throughput: no disponible; el autor solo publica latencias medianas por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Descarga | Pico 1k/4k/14k | Latencia 1k/14k | Video 21 s con sonido | RAM minima | Licencia |
|---|---|---|---|---|---|---|---|---|
| clef-omni-8bit (este repo) | 30B-A3B (31,7 B totales, ~3 B activos) | 8 bits MLX | 35,0 GB | 35,6 / 36,1 / 37,5 GB | 0,26 s / 5,4 s | 4,6 s | 64 GB | Apache 2.0 |
| clef-omni-4bit | 30B-A3B | 4 bits MLX | 19,8 GB | 20,3 / 20,8 / 22,2 GB | 0,19 s / 4,5 s | 2,8 s | 32 GB | Apache 2.0 |
| Clef-Flash | denso 9B | no disponible | no disponible | no disponible | mas lento que clef-omni en prompts largos | no disponible | no disponible | no disponible |
| Cloudflare/clef-omni | 30B-A3B | pesos originales sin cuantizar | no disponible | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

La eleccion entre 8 y 4 bits es un compromiso directo: la variante de 4 bits reduce el pico de memoria en torno a un 43 por ciento y el tiempo de proceso de video de 4,6 s a 2,8 s, mientras que la de 8 bits conserva mayor precision numerica. Segun el autor, los aproximadamente 3B parametros activos por token hacen que Clef-Omni sea mas rapido que el denso Clef-Flash de 9B en prompts largos pese a descargar mas peso.

## Limitaciones y advertencias

- No es un modelo de chat. Usarlo con `mlx_vlm.generate` o LM Studio produce texto sin sentido porque no se ejecuta la cabeza de esquema; es obligatorio el cargador `clef_mlx.py`.
- Requiere codigo personalizado y confianza en el mismo: el repositorio incluye codigo propio, por lo que conviene auditar `clef_mlx.py` antes de ejecutarlo.
- Dependencia estricta de versiones: esta probado con mlx-vlm 0.7.6 y el script avisa si se carga con una version menor no probada.
- Limitacion de contexto: cuando la entrada no cabe, el servidor devuelve 413 con el mensaje "maximum context length"; existe la opcion `"truncate": false` (o `--no-truncate`) para forzar ese error en lugar de truncar. La longitud maxima de contexto no esta documentada en la informacion disponible.
- Idiomas soportados: no disponible. No se puede confirmar el comportamiento en castellano ni en otros idiomas sin pruebas propias.
- Riesgo de calibracion: al devolver probabilidades por opcion, un uso en produccion deberia fijar umbrales de confianza y validar la calibracion con datos propios.
- Sesgos conocidos: no disponible en la informacion proporcionada. Al derivar del thinker de Qwen3-Omni, hereda las caracteristicas de ese backbone, que no se detallan aqui.
- Riesgo de alucinacion en sentido estricto: limitado, porque no genera texto libre; el fallo se manifiesta como una probabilidad alta asignada a una opcion incorrecta.
- Solo Apple Silicon: no hay ruta de despliegue documentada para CUDA, vLLM, llama.cpp, Ollama o TGI, lo que limita su uso en servidores x86 o en la nube.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `Cloudflare/clef-omni` y de los componentes derivados de Qwen3-Omni antes de un despliegue en produccion.
- Madurez: 0 descargas y 1 like en el momento de la consulta, con creacion y ultima actualizacion el mismo dia, lo que indica una publicacion muy reciente y con poca validacion externa.
- En el servidor HTTP, las rutas locales de fichero no se aceptan: los adjuntos deben ir como data URL, base64 crudo o URL http(s).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/clef-omni-8bit
- Modelo base: https://huggingface.co/Cloudflare/clef-omni
- Variante de 4 bits: https://huggingface.co/mlx-community/clef-omni-4bit
- MLX (framework): https://github.com/ml-explore/mlx
- MLX, sitio del framework: https://mlx-framework.org/
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
- Estudio de Apple sobre LLM con MLX y los aceleradores neuronales del M5: https://machinelearning.apple.com/research/exploring-llms-mlx-m5
- No se han encontrado en la busqueda web articulos, papers ni demos especificos de clef-omni mas alla de la model card original.
