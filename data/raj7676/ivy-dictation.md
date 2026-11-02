# raj7676/ivy-dictation

## Resumen

Ivy Dictation es un modelo de reconocimiento automático del habla (ASR) especializado en dictado, desarrollado por raj7676 (Glow.co) como fine-tune de Qwen3-ASR-1.7B. Su particularidad es que no se limita a transcribir literalmente: aplica en una sola pasada las autocorrecciones que el hablante introduce en su discurso ("el martes, perdón, el jueves" se convierte en "el jueves"), elimina muletillas y tartamudeos, y añade puntuación y mayúsculas. No hay un segundo modelo de lenguaje reescribiendo la salida; la corrección está integrada en el propio modelo.

El modelo tiene 1.720.574.976 parámetros y se distribuye en formato GGUF para llama.cpp, dividido en dos ficheros: el modelo de lenguaje cuantizado a Q8_0 (1,83 GB) y el codificador de audio más proyector en F16 (0,64 GB). Está entrenado exclusivamente en inglés y se integra en la aplicación de escritorio Ivy para Windows y Linux, que funciona de forma totalmente offline tras la primera descarga.

Es relevante porque aborda un problema práctico del dictado real: el habla espontánea está llena de reformulaciones y ruido verbal que los ASR convencionales transcriben tal cual. Ivy resuelve esto mediante un fine-tune con LoRA sobre horas de audio real con ruido, micrófonos baratos y diversos acentos, más párrafos de dictado guionizados con autocorrecciones, todos con transcripciones escritas por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de audio + proyector + LLM base Qwen3-ASR-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje), F16 (codificador de audio y proyector) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 con Commons Clause (fine-tune); Apache-2.0 (modelo base Qwen3-ASR-1.7B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B, un ASR multimodal de Alibaba Cloud que combina un codificador de audio con un modelo de lenguaje. Ivy conserva esa arquitectura y añade un fine-tune mediante LoRA que se fusionó posteriormente en los pesos y se convirtió a GGUF. La inferencia se realiza a través de la API multimodal (mtmd) de llama.cpp, alimentando audio mono a 16 kHz junto con un prompt de sistema que instruye al modelo a escribir lo que el hablante quiere decir, aplicando sus propias correcciones.

El entrenamiento se realizó sobre muchas horas de habla real en condiciones adversas (salas ruidosas, micrófonos de baja calidad, múltiples acentos) con transcripciones escritas por humanos, complementadas con miles de párrafos de dictado guionizados repletos de autocorrecciones, leídos por muchas voces sobre ruido de fondo real. El autor indica explícitamente que ninguna transcripción de entrenamiento fue generada por IA. No se especifica el número total de tokens ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en inglés con salida de texto limpio y listo para pegar.
- Aplicación de autocorrecciones del hablante en una sola pasada, sin modelo secundario de reescritura.
- Eliminación de muletillas, tartamudeos y repeticiones.
- Puntuación y capitalización automáticas.
- Funcionamiento totalmente offline una vez descargado el modelo.
- Integración con llama.cpp mediante la API multimodal mtmd.
- Detección e indicación del idioma en la plantilla de prompt (`language English`).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Dictado de escritorio en tiempo real: la aplicación Ivy captura audio al mantener pulsada una tecla y pega el texto limpio en el cursor activo; el modelo está optimizado para latencias bajas (0,22 s para 5 s de audio en GPU).
- Redacción de correos y mensajes: el usuario habla de forma natural con reformulaciones y el modelo entrega texto coherente y puntuado, sin necesidad de editar manualmente las correcciones.
- Documentación clínica o de campo: profesionales que dictan notas mientras trabajan pueden beneficiarse de la supresión de muletillas y la aplicación de correcciones sin conexión, útil en entornos sin red.
- Accesibilidad: personas con movilidad reducida o dificultades para teclear pueden usar dictado por voz con salida directa a cualquier aplicación.
- Transcripción de reuniones y notas de voz: aunque el modelo está orientado a dictado, su robustez ante ruido y acentos permite transcribir grabaciones cortas en inglés con limpieza automática.
- Integración en pipelines de llama.cpp: desarrolladores pueden invocar el modelo vía mtmd para preprocesar audio en aplicaciones propias, siempre que respeten la restricción de no venta de la licencia.
- Uso educativo o de investigación: fine-tune reproducible sobre Qwen3-ASR-1.7B para estudiar técnicas de corrección integrada en ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente proporciona mediciones de velocidad en la aplicación Ivy (llama.cpp, mediana de ejecuciones) sobre una RTX 4060 Laptop GPU y un Intel Core i7:

| Duracion del clip | GPU (Vulkan) | Solo CPU |
|---|---|---|
| 5 s | 0,22 s | 1,95 s |
| 15 s | 0,33 s | 3,20 s |
| 30 s | 0,34 s | 4,88 s |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para los dos ficheros GGUF (1,83 GB Q8_0 + 0,64 GB F16), más overhead de llama.cpp; en la práctica cabe en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte Vulkan y al menos 4 GB de VRAM; el autor reporta resultados en una RTX 4060 Laptop. GPUs de gama alta (A100, H100) no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en RTX 4060 y superiores; también funciona solo en CPU con latencias de 2 a 5 segundos según la duración del clip.
- Opciones de despliegue: llama.cpp (API mtmd), que es el runtime oficial; la aplicación Ivy para Windows y Linux lo integra. No se documenta soporte para vLLM, TGI, Ollama u otros runtimes.
- Latencia y throughput: según la tabla del autor, la GPU ofrece latencias subsegundo incluso para clips de 30 s; la CPU multiplica por 6-9 el tiempo de proceso respecto a GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ivy Dictation | 1,72 B | No disponible | Ingles | Apache-2.0 + Commons Clause | GGUF | Fine-tune de Qwen3-ASR-1.7B con correccion integrada |
| Qwen3-ASR-1.7B (base) | 1,72 B | No disponible | Multilingue (segun modelo base) | Apache-2.0 | Safetensors y otros | ASR general sin correccion de dictado |
| Whisper large-v3 | 1,55 B | 30 s por ventana | Multilingue | MIT | Safetensors, GGUF, etc. | ASR general, sin autocorreccion ni limpieza de muletillas |
| Parakeet / Conformer ASR | Variable | Variable | Ingles principalmente | Variable | Variable | Alternativas clasicas de ASR sin postprocesado integrado |

La comparativa se limita a los datos disponibles; no se han publicado mediciones comparativas de calidad entre Ivy Dictation y estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Licencia Apache-2.0 con Commons Clause: permite uso, estudio y fine-tune, pero prohíbe vender un producto o servicio cuyo valor provenga principalmente de este modelo.
- El modelo base Qwen3-ASR-1.7B mantiene su licencia Apache-2.0 original, que debe respetarse por separado.
- Riesgo de alucinación o de "corregir" en exceso: al aplicar autocorrecciones, podría eliminar información que el hablante quería conservar o interpretar mal una reformulación.
- Entrenado con transcripciones humanas, pero no se documentan evaluaciones de sesgo por acento, género o dialecto.
- La aplicación Ivy tiene limitaciones de plataforma: X11 en Linux (Wayland en pruebas), no disponible para Arch, ARM ni 32 bits.
- No se especifica la longitud de contexto ni el comportamiento con clips muy largos.
- El modelo está pensado para dictado de frases cortas; su uso en transcripción de audio extenso no está validado.
- Solo se distribuye en GGUF para llama.cpp; no hay pesos en safetensors ni integración con otros runtimes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raj7676/ivy-dictation
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Web de la aplicacion Ivy: https://raj-7676.github.io/ivy-dictation/
- Codigo fuente en GitHub: https://github.com/raj-7676/ivy-dictation
- Releases de la aplicacion: https://github.com/raj-7676/ivy-dictation/releases/latest
- Microsoft Store (Windows): https://apps.microsoft.com/detail/9P420N80LXQJ
- llama.cpp: https://github.com/ggml-org/llama.cpp
