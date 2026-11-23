# pipecat-ai/phonellm-alpha-1

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje de pesos abiertos desarrollado por Daily / el equipo de Pipecat, especializado en casos de uso de agentes de voz para telefonía. Se trata de un ajuste fino de parámetros completos (full-parameter SFT) sobre NVIDIA Nemotron 3 Nano 30B-A3B, un modelo de mezcla de expertos (MoE) con 30.000 millones de parámetros totales y 3.500 millones activos, entrenado con el framework NVIDIA NeMo.

El modelo aborda un hueco concreto en el ecosistema: los modelos frontera actuales están optimizados para razonar con tokens de pensamiento habilitados, lo que introduce una latencia elevada entre la consulta del usuario y la respuesta del agente. Además, muchos modelos, tanto grandes como pequeños, fallan al invocar herramientas en conversaciones multiturno largas cuando el modo de razonamiento está desactivado, llegando a afirmar que han realizado una acción sin haberla ejecutado. PhoneLLM se entrena específicamente para llamar a las herramientas correctas en el momento adecuado sin necesidad de pensamiento explícito.

La relevancia del lanzamiento radica en su combinación de precisión en el benchmark propietario PhoneBench v1, baja latencia y bajo coste por minuto, junto con una licencia BSD 2-Clause sin restricciones comerciales. El modelo se publica con una longitud de contexto de 262.144 tokens y una cuantización oficial NVFP4 para GPUs NVIDIA Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer con mezcla de expertos (MoE) |
| Parametros totales | 31.577.937.344 (aproximadamente 30B) |
| Parametros activos | 3.5B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (original); NVFP4 (checkpoint oficial para GPUs Blackwell) |
| Idiomas soportados | Inglés (en) |
| Licencia | BSD 2-Clause; obra derivada de NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (bfloat16), con código personalizado (`trust_remote_code=True`) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 |
| Libreria | transformers |
| Tamano del repositorio | 63.2 GB |
| Ajustes de inferencia recomendados | `temperature=0`, thinking desactivado (`chat_template_kwargs: {"enable_thinking": false}`) |
| Servido recomendado | vLLM o SGLang (recetas Nemotron 3 Nano) |

## Arquitectura y entrenamiento

PhoneLLM Alpha 1 hereda la arquitectura del modelo base Nemotron 3 Nano 30B-A3B: un transformer híbrido con capas Mamba y mecanismos de atención, organizado como mezcla de expertos con 30B parámetros totales y 3.5B activos por token. Esta configuración permite una inferencia de alta velocidad a bajo coste, ya que solo se computa una fracción de los parámetros en cada paso.

El entrenamiento consistió en un ajuste fino supervisado de parámetros completos (full-parameter SFT) utilizando el framework NVIDIA NeMo, partiendo de los pesos BF16 del modelo base. No se especifica en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset, aunque el material del autor indica que el equipo de Pipecat entrena modelos con trazas de agentes en producción y datos propietarios de clientes empresariales. Tampoco se detalla si se aplicaron etapas de RLHF o DPO. La innovación principal no es arquitectónica sino de especialización: el modelo se optimiza para invocar herramientas con precisión en conversaciones multiturno sin modo de razonamiento activado, un comportamiento que el modelo base no logra de forma fiable.

## Capacidades

- Generación de texto conversacional orientada a diálogos telefónicos multiturno.
- Invocación de herramientas (tool calling / function calling) sin necesidad de tokens de pensamiento, entrenado explícitamente para llamar a la herramienta correcta en el momento correcto.
- Soporte de agentes y razonamiento multi-paso dentro de flujos de atención al cliente (consulta, verificación, ejecución de acción, confirmación).
- Manejo de contexto largo gracias a una ventana de 262.144 tokens, adecuada para conversaciones extensas con historial acumulado.
- Capacidad de desactivar el modo de pensamiento (`enable_thinking: false`) para minimizar la latencia de respuesta.
- Estilo de habla adaptado a interacción telefónica, según la evaluación de estilo de PhoneBench.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Atención al cliente entrante en servicios financieros: el modelo gestiona conversaciones multiturno con identificación del cliente, consulta de saldo o estado de operaciones y derivación a un humano, apoyándose en la ventana de 262.144 tokens para mantener el historial completo de la llamada.
- Agentes de voz salientes para recordatorios y confirmación de citas en salud: el modelo ejecuta la llamada, verifica la identidad, confirma o reprograma la cita mediante tool calling y registra el resultado, sin afirmar acciones que no haya ejecutado realmente.
- Reservas en retail y hostelería: gestión de reservas de mesa o pedidos con verificación de disponibilidad a través de herramientas, un escenario donde el fallo típico de los modelos generales es confirmar una reserva sin haberla realizado.
- Integración en pipelines de Pipecat con STT y TTS: el modelo actúa como capa de razonamiento y decisión entre la transcripción y la síntesis de voz, con latencia de primer token reducida para mantener la naturalidad de la conversación.
- Automatización de soporte telefónico de primer nivel: clasificación de la intención del llamante, recuperación de información mediante herramientas y escalado a agentes humanos cuando la consulta excede el ámbito definido.
- Despliegue en infraestructura propia por motivos de privacidad: al ser pesos abiertos con licencia BSD 2-Clause, permite procesar datos de llamadas sensibles sin enviarlos a APIs de terceros, con la cuantización NVFP4 para reducir coste en GPUs Blackwell.
- Evaluación y ajuste continuo de agentes de voz: el modelo sirve como referencia base para comparar latencia, coste por minuto y precisión de tool calling frente a modelos generales usando PhoneBench v1.

## Benchmarks y rendimiento

El autor publica resultados en PhoneBench v1, su benchmark propietario de idoneidad para agentes telefónicos. Las cifras son medias sobre diez ejecuciones completas de PhoneBench a temperatura cero y con thinking desactivado.

| Pesos | KV cache | PhoneBench media | Delta vs. BF16 |
|---|---|---:|---:|
| BF16 | BF16 | 72.055800 | — |
| NVFP4 | FP8 | 71.512482 | -0.543318 |
| NVFP4 | BF16 | 72.019090 | -0.036711 |

El autor afirma que PhoneLLM rinde a la par de GPT 5.6 Terra en PhoneBench, con un 94% menos de coste y 1.300 ms menos de P95 time-to-first-token. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni la tabla completa del leaderboard de PhoneBench con las puntuaciones del resto de modelos comparados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 63 GB solo para pesos, más la caché KV; requiere GPUs de 80 GB o múltiples GPUs.
- Cuantización NVFP4: reduce el peso de los pesos a aproximadamente una cuarta parte del BF16; el checkpoint oficial está probado con una receta nativa de vLLM para una única NVIDIA B200.
- GPUs recomendadas: NVIDIA B200 para NVFP4 con receta validada; A100/H100 de 80 GB para BF16 con vLLM o SGLang.
- No cabe en GPUs de consumo convencionales en BF16; la viabilidad en GPUs consumer no está documentada en la información disponible.
- Opciones de despliegue: vLLM y SGLang con las recetas de Nemotron 3 Nano y `trust_remote_code=True`; no se mencionan llama.cpp, Ollama ni TGI en la documentación del autor.
- Latencia y throughput: el autor reporta una mejora de 1.300 ms en P95 time-to-first-token frente a GPT 5.6 Terra, pero no publica cifras absolutas de latencia ni de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 | ~30B | 3.5B | 262.144 | BSD 2-Clause | Agentes de voz telefónicos con tool calling |
| NVIDIA Nemotron 3 Nano 30B-A3B | ~30B | 3.5B | no disponible en la información | NVIDIA Nemotron Open Model License | Modelo base generalista |
| GPT 5.6 Terra | no disponible | no disponible | no disponible | Propietaria | Modelo frontera generalista; referencia de comparación del autor en PhoneBench |

La comparación cuantitativa con GPT 5.6 Terra se limita a las afirmaciones del autor: paridad de precisión en PhoneBench, 94% menos coste y 1.300 ms menos de P95 time-to-first-token. No se dispone de datos de benchmarks estándar para establecer comparaciones adicionales con otras alternativas.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado.
- Especialización estrecha: está entrenado para agentes telefónicos; su rendimiento en tareas generales de razonamiento, código o matemáticas no se documenta y probablemente sea inferior al del modelo base sin ajustar.
- Riesgo de alucinación: aunque el entrenamiento busca reducir las confirmaciones falsas de acciones, persiste el riesgo de que el modelo afirme haber ejecutado una herramienta sin hacerlo; se recomienda validación externa de las llamadas a herramientas en producción.
- Licencia: BSD 2-Clause permite uso comercial, pero al ser obra derivada de un trabajo bajo NVIDIA Nemotron Open Model License, deben respetarse las condiciones adicionales recogidas en `LICENSE_NVIDIA.txt`.
- Configuración sensible: el autor recomienda `temperature=0` y thinking desactivado; desviarse de estos ajustes puede degradar la precisión de tool calling y el estilo conversacional.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de desplegar en entornos de producción.
- Estado alpha: la versión se denomina Alpha 1, lo que sugiere que la API, los pesos o el comportamiento pueden cambiar en futuras iteraciones.
- Sesgos: no se documentan en la información disponible análisis específicos de sesgos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Checkpoint oficial NVFP4: https://huggingface.co/pipecat-ai/phonellm-alpha-1-nvfp4
- Modelo base NVIDIA Nemotron 3 Nano 30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Pipecat (framework y equipo): https://www.pipecat.ai/
- Daily: https://www.daily.co/
- Paquete Pipecat en PyPI: https://pypi.org/project/pipecat-ai/
- Documentación de NVIDIA NeMo Framework: https://docs.nvidia.com/nemo-framework/index.html
