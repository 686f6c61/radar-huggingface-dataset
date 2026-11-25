# pratikgx/groundhog-1-MLX-4bit

## Resumen

groundhog-1-MLX-4bit es una conversión a 4 bits para Apple Silicon (formato MLX) del modelo de decisión groundhog-1 desarrollado por Baseten (baselabs). No es un modelo de chat generativo: responde evaluando y puntuando opciones en un único prefill. Recibe un `state` (descripción textual del contexto) y preguntas tipadas (`noul`, `choice` o `score`) y devuelve probabilidades calibradas sobre cada opción, sin generar texto libre. Esta portabilidad a MLX la firma pratikgx, que además ha reimplementado el motor de decisión ("System One") en código abierto para ejecutarlo en hardware de Apple.

El modelo original es un MoE de 26B parámetros totales con unos 4B activos, construido sobre la arquitectura Gemma 4 (concretamente sobre `google/gemma-4-26B-A4B-it`). Esta versión cuantizada conserva esa arquitectura pero reduce el peso en disco de 49,47 GB (BF16) a 13,22 GB, lo que permite ejecutarlo en un Mac con memoria unificada de 64 GB. El repositorio incluye los pesos MLX affine 4-bit (group size 64), el tokenizador, la plantilla de chat, el `readout.json` y el directorio `engine/` con la lógica de decisión, las máscaras de atención específicas de Baseten y el readout de 256 slots.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo de decisión de 26B puede ejecutarse localmente en un equipo de sobremesa de Apple con latencias subsegundo (mediana de 0,840 s por decisión a 513 tokens); por otro, publica métricas de acuerdo con la API alojada de Baseten (30/30 coincidencias en una muestra fija de 30 ítems), lo que facilita evaluar la fidelidad de la cuantización frente al servicio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE basado en Gemma 4 (atención block-bidirectional en capas full-attention y causal sliding-window en el resto) |
| Parametros totales | 25.233.141.790 (≈25,2B; el autor indica 26B) |
| Parametros activos | ≈4B (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64; routers en 8-bit; normas sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | mit-and-apache-2.0 (hereda la del checkpoint oficial; ver LICENSE y NOTICE) |
| Formato de pesos | safetensors (MLX), 13,22 GB en disco |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Gemma 4 en configuración MoE, con 25,2B parámetros totales y aproximadamente 4B activos por token. La conversión a MLX mantiene las reglas de cuantización de mlx-lm para Gemma 4: embeddings y pesos Linear/SwitchLinear se cuantizan a 4-bit affine con group size 64, las normas permanecen sin cuantizar y `router.proj` se mantiene en 8-bit. El conversor eleva `per_layer_config` a `global_head_dim=512` y `num_global_key_value_heads=2`, que es lo que mlx-lm lee para las capas de atención completa.

La innovación diferencial no está en el entrenamiento sino en el modo de inferencia: groundhog-1 no genera texto. El motor `engine/` implementa los prompts qev-labels-v2, un readout `slot_lm` de 256 slots y las sobrescrituras de atención publicadas por Baseten (máscara block-bidirectional en capas full-attention, capas causales con sliding window). El modelo se puntúa en las letras de slot en un único prefill con el modo "thinking" desactivado. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo original.

## Capacidades

- Clasificación y decisión por puntuación: devuelve probabilidades sobre opciones tipadas (`choice`), puntuaciones (`score`) y respuestas sin elección (`noul`).
- Razonamiento de un solo paso (System One): evalúa el estado y las preguntas en un único prefill, sin cadena de pensamiento ni generación autoregresiva.
- Calibración de probabilidades: el autor reporta una diferencia absoluta media de 0,0167 frente a la API alojada de Baseten en una muestra de 30 ítems.
- Soporte de múltiples preguntas por llamada: el diccionario `questions` permite plantear varias decisiones simultáneas sobre el mismo estado.
- Clasificación de texto en inglés: pipeline declarado `text-classification`.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni generación de texto.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado con el mensaje del cliente y el historial, el modelo puntúa opciones como `track_order`, `cancel_order` o `billing_question` y devuelve la probabilidad de cada una, lo que permite derivar el ticket al equipo adecuado sin generar texto.
- Triaje de correos y mensajes entrantes: clasificación rápida (subsegundo por decisión) de la intención del remitente en categorías predefinidas, adecuada para procesar lotes grandes en local.
- Moderación de contenido: puntuación de opciones tipo `permitir` / `revisar` / `bloquear` sobre un estado textual, con probabilidades calibradas que permiten fijar umbrales de revisión humana.
- Decisión en pipelines de agentes: uso como "System One" dentro de un agente mayor, donde el LLM generativo aporta el razonamiento y groundhog-1 resuelve la elección final entre alternativas con una sola pasada.
- Evaluación de respuestas en entornos de anotación: puntuación de la calidad de una respuesta candidata frente a criterios definidos, útil para filtrar datos de entrenamiento o comparar variantes.
- Clasificación en local para privacidad: al ejecutarse en Apple Silicon sin enviar datos a la nube, encaja en flujos con información sensible (atención al cliente, salud, legal) donde no se permite salida a servicios externos.
- Prototipado e investigación en calibración: el repositorio incluye el motor y el readout, lo que facilita experimentar con prompts qev-labels-v2 y comparar la fidelidad de la cuantización 4-bit frente a BF16.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (Mac mini M5 Pro de 64 GB, con otra carga en ejecución; no son cifras en reposo):

| Benchmark / metrica | Resultado |
|---|---|
| JevBench público (231 ítems) | 206/231 (easy 48/48, original 71/72, hard 87/111) |
| JevBench en API alojada de Baseten (231 ítems) | 210/231 (easy 48/48, original 72/72, hard 90/111) |
| Latencia a 513 tokens (1 warmup + 20 medidas) | mediana 0,840 s por decisión; p95 0,862 s; 1,19 decisiones/s |
| Acuerdo con API alojada (muestra fija de 30 ítems) | 30/30 decisiones coincidentes; diferencia absoluta media de probabilidad 0,0167; máxima 0,275 |
| JevBench mediana por ítem | 0,268 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de JevBench corresponden a un runtime distinto al de la API alojada, por lo que el autor advierte que no es una comparación like-for-like.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos 4-bit ocupan 13,22 GB en disco; en ejecución se necesita además memoria para el estado de atención y el readout de 256 slots. El autor lo ha validado en un Mac mini M5 Pro con 64 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (validado en M5 Pro de 64 GB). No hay datos de ejecución en GPU NVIDIA ni en otros aceleradores.
- GPU de consumo: al ser MLX, no aplica a GPU NVIDIA/AMD; requiere Apple Silicon. No se dispone de datos sobre el mínimo de memoria unificada necesario.
- Opciones de despliegue: `mlx-lm` 0.32.2 o superior (runtime medido: mlx 0.32.4 y mlx-lm 0.32.2), más el directorio `engine/` añadido al `PYTHONPATH`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX y el modo de inferencia no es generativo.
- Latencia y throughput: 0,840 s de mediana por decisión a 513 tokens y 1,19 decisiones/s en el hardware citado; 0,268 s de mediana por ítem en JevBench.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groundhog-1-MLX-4bit (esta ficha) | ≈25,2B totales, ≈4B activos | no disponible | MLX 4-bit, mlx-lm | mit-and-apache-2.0 | Hugging Face, 59 descargas |
| baselabs/groundhog-1 (original) | ≈26B totales, ≈4B activos | no disponible | BF16 safetensors, 49,47 GB | mit-and-apache-2.0 | Hugging Face + API alojada de Baseten |
| google/gemma-4-26B-A4B-it | ≈26B totales, ≈4B activos | no disponible | safetensors (BF16) | no disponible en la información proporcionada | Hugging Face |

La comparación con el original es la más directa: misma arquitectura y licencia, pero el original en BF16 requiere 49,47 GB de pesos y no está portado a MLX; esta versión reduce el peso a 13,22 GB a costa de una cuantización 4-bit cuyo impacto en precisión el autor mide mediante acuerdo con la API alojada (30/30, diferencia media 0,0167). Gemma 4 26B A4B es el modelo base sobre el que se construye groundhog-1, pero es un modelo generativo, no un modelo de decisión, por lo que la comparación es de arquitectura y no de tarea.

## Limitaciones y advertencias

- No es un modelo de chat: usar un bucle `generate` genérico produce resultados incorrectos; debe puntuarse en las letras de slot en un único prefill y con el modo "thinking" desactivado.
- Solo inglés: no hay soporte multilingüe declarado.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al ser un modelo de clasificación, hereda los sesgos del dataset de entrenamiento del modelo base, no disponible.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto), pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; el autor reporta una diferencia máxima de probabilidad de 0,275 frente a la API alojada en un ítem.
- Licencia: mit-and-apache-2.0 heredada del checkpoint oficial; es necesario revisar `LICENSE` y `NOTICE` para uso comercial, ya que la model card declara `license: other` con nombre `mit-and-apache-2.0`.
- Precisión: es 4-bit MLX, no BF16; el autor insiste en que la precisión está en el nombre del repositorio a propósito. Las métricas de paridad son con la API alojada, no con el BF16 local.
- Hardware: exclusivo de Apple Silicon vía MLX; no hay soporte para CUDA ni para runtimes de inferencia estándar de servidor.
- Madurez: repositorio con 59 descargas y 0 likes, creado y actualizado en noviembre de 2026; el port se construyó con un agente de código y las mediciones se hicieron con otra carga en ejecución, por lo que no son cifras en reposo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pratikgx/groundhog-1-MLX-4bit
- Modelo base oficial: https://huggingface.co/baselabs/groundhog-1
- Modelo Gemma 4 sobre el que se construye: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de benchmarks del autor: https://huggingface.co/datasets/pratikgx/groundhog-1-m5-pro-mac-mini-bench
- Notas de campo (write-up): https://github.com/pratikgx/local-ai-field-notes/blob/main/notes/2026-11-21-baseten-groundhog-1-mlx.md
- Repositorio de notas: https://github.com/pratikgx/local-ai-field-notes
- Baseten: https://www.baseten.co
- Perfil de baselabs: https://huggingface.co/baselabs
- MLX: https://github.com/ml-explore/mlx
