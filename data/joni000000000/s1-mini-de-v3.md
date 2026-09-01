# Joni000000000/s1-mini-de-v3

## Resumen

s1-mini-de-v3 es un modelo de normalización de texto para transcripciones ASR en alemán, desarrollado por Joni000000000 como parte del proyecto yappr, una aplicación local de dictado por voz para Hyprland/Wayland. Se trata de un finetune completo (SFT, no LoRA) de superwhisper/s1-mini, que a su vez es un finetune de Qwen3-0.6B, con 596 millones de parámetros. El modelo toma la salida cruda de un sistema de reconocimiento de voz (específicamente Parakeet TDT 0.6b v3 en alemán) y la convierte en texto escrito limpio: elimina muletillas, tartamudeos y autocorrecciones, aplica un eje de estilo (de casual a formal, incluyendo conversión du/Sie), formatea listas y convierte números hablados a su forma escrita.

El modelo se distribuye únicamente en formato GGUF cuantizado a Q4_K_M (379 MB) y se ejecuta en proceso mediante llama.cpp. Su relevancia radica en que resuelve un problema muy concreto y molesto en los flujos de dictado por voz: la salida de los ASR modernos suele incluir rellenos, repeticiones y errores de formato que hacen que el texto no sea directamente utilizable. Al ser un modelo pequeño (596M) y cuantizado, puede ejecutarse localmente en hardware modesto, lo que lo hace adecuado para aplicaciones de escritorio con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) |
| Parametros totales | 596.049.920 (~596M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada; el ejemplo de despliegue usa 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | aleman (de) |
| Licencia | other (hereda de superwhisper/s1-mini; verificar terminos del base Qwen3-0.6B) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-0.6B, un transformer decoder-only de 596 millones de parámetros. No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal; es un transformer estándar con atención de ventana completa. El finetune se realizó con SFT completo (no LoRA) sobre el checkpoint `superwhisper/s1-mini` en su commit `88f6b15896c73bbb13a3b596e0afe8ea0d5150b4`, ya que el repositorio upstream reemplaza los pesos en el lugar y es necesario fijar el hash.

El entrenamiento se llevó a cabo en una única RTX 3090 con los siguientes hiperparámetros: 3 épocas, tasa de aprendizaje 1e-5 con programación coseno, tamaño de lote efectivo 32, precisión bf16, longitud máxima de secuencia 1024 tokens, sin empaquetado de secuencias y con la pérdida enmascarada únicamente a la parte de finalización. El autor indica que una tasa de aprendizaje mayor destruiría el comportamiento de línea de control del modelo base, por lo que se optó por un valor conservador. El dataset de entrenamiento consta de aproximadamente 1000 filas distribuidas en archivos `part-*.jsonl`, cada uno orientado a una clase de fallo medida en la salida real de Parakeet TDT v3. El conjunto de validación se construye con sobremuestreo por partes (`PART_WEIGHTS`). El modelo se exportó a GGUF y se cuantizó a Q4_K_M mediante `export_gguf.py`.

## Capacidades

- Normalización de transcripciones ASR en aleman: elimina muletillas ("äh", "ähm", "halt", "quasi"), repeticiones por tartamudeo y repara autocorrecciones del hablante.
- Aplicación de ejes de estilo configurables: `casual`, `semi-casual`, `semi-formal` y `formal`, incluyendo conversión de tratamiento du a Sie.
- Formateo de estructuras: puede emitir listas reales cuando el hablante enumera elementos (modo `lists`) o prosa continua (modo `prose`).
- Conversión de formas numéricas saturadas: horas ("vierzehn Uhr dreißig" → "14:30 Uhr"), porcentajes ("siebenundachtzig Prozent" → "87 Prozent"), fechas, años y cantidades de dinero con separador de miles aleman ("zwei tausend acht hundert Euro" → "2.800 Euro"). Las horas relativas como "halb drei" se mantienen deliberadamente en palabras.
- Control de contexto: admite un parámetro `Context` con valores `general` y `email` para adaptar el registro de salida.
- Ejecución en proceso mediante llama.cpp con muestreo greedy y bloque de pensamiento pre-cerrado en el prompt.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multimodales. Es un modelo de una sola tarea, especializado en normalización de texto ASR en aleman.

## Casos de uso

- Dictado por voz local en escritorio Linux: el caso de uso original. El modelo se integra en yappr, una aplicación de pulsar-para-hablar para Hyprland/Wayland, donde recibe la salida de Parakeet TDT v3, la normaliza y la escribe en la ventana enfocada. Su tamaño reducido permite ejecutarlo en proceso con llama.cpp sin servidores externos.
- Post-procesado de transcripciones de reuniones: las herramientas de transcripción automática en aleman suelen dejar muletillas y errores de concordancia. Este modelo puede limpiar esas transcripciones aplicando un estilo formal para actas o minutas, y convirtiendo horas y fechas habladas a formato escrito.
- Limpieza de subtítulos generados por ASR: los subtítulos automáticos en aleman contienen rellenos y repeticiones. Aplicar este modelo como etapa de post-procesado produce subtítulos más legibles, con la opción de forzar formato de lista para diálogos enumerados.
- Normalización de notas de voz para correo electronico: con el contexto `email` y un estilo `semi-formal`, el modelo transforma una nota de voz informal en un borrador de correo limpio, convirtiendo cifras y horas a su forma escrita y aplicando el tratamiento adecuado (du/Sie).
- Conversión de números hablados en documentos financieros: el modelo convierte de forma fiable porcentajes, cantidades de dinero y años hablados a su representación numérica con el formato aleman (punto como separador de miles), lo que resulta util para transcribir informes o reuniones de finanzas.
- Formateo de listas en actas o procedimientos: cuando el hablante enumera pasos o elementos, el modo `lists` genera lineas de lista reales, facilitando la creacion de actas, procedimientos operativos o guiones estructurados a partir de dictado.
- Adaptacion de registro en comunicaciones formales: el eje de estilo permite convertir un dictado casual en un texto formal con tratamiento de cortesia (Sie), util para cartas, solicitudes o comunicaciones oficiales en aleman.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un conjunto de 69 probes held-out (nunca usados en entrenamiento) que cubren clases de fallo especificas, con respuestas registradas para los checkpoints baseline, v2, v3 y v4, pero no se proporcionan metricas numericas (por ejemplo, tasa de exito o solapamiento medio de tokens). Tampoco hay comparaciones con otros normalizadores de texto ASR en aleman. El unico criterio de calidad documentado es el guardrail interno: cualquier salida con menos del 70 % de solapamiento de tokens con la entrada es rechazada por la aplicacion aguas abajo.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 379 MB, por lo que la VRAM necesaria es de aproximadamente 0,5-1 GB incluyendo el contexto y las estructuras de la aplicacion. Cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.). Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-server o integracion en proceso), compatible con Ollama si se convierte el GGUF, y probablemente con vLLM y TGI dado que es un modelo Qwen3 estandar, aunque el autor solo documenta llama.cpp.
- Latencia y throughput: no se proporcionan mediciones, pero por el tamano del modelo (596M parametros, Q4_K_M) se espera una latencia de decenas de milisegundos por token en GPU consumer y de unos pocos cientos de milisegundos en CPU moderna. El ejemplo de despliegue usa `-c 4096`, lo que sugiere un contexto de trabajo de 4096 tokens.

## Comparativa con modelos similares

No se dispone de otros normalizadores de texto ASR en aleman publicamente documentados para comparar directamente. La comparativa mas relevante es contra los modelos base de los que deriva:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| s1-mini-de-v3 (este) | 596M | 4096 (ejemplo) | Normalizacion ASR aleman | other | GGUF Q4_K_M |
| superwhisper/s1-mini | 596M | no especificado | Normalizacion ASR general (ingles) | other | safetensors, GGUF |
| Qwen3-0.6B | 596M | 32K (original) | Modelo de lenguaje general | Apache 2.0 (Qwen3) | safetensors, GGUF |

La diferencia clave es que s1-mini-de-v3 esta finetuneado exclusivamente para la salida de Parakeet TDT v3 en aleman, con un prompt de control especifico y un guardrail de solapamiento. El base superwhisper/s1-mini no maneja aleman ni los ejes de estilo, y Qwen3-0.6B es un modelo general sin capacidad de normalizacion ASR especifica.

## Limitaciones y advertencias

- Idioma unico: el modelo solo funciona con aleman. No soporta otros idiomas ni mezcla de codigos.
- Dependencia del ASR de origen: esta entrenado especificamente con la salida de Parakeet TDT 0.6b v3 en aleman. Si se alimenta con transcripciones de otros sistemas ASR (Whisper, etc.), el rendimiento puede degradarse notablemente, ya que el estilo de salida (puntuacion, capitalizacion, muletillas) difiere.
- Riesgo de alucinacion en conversiones numericas: aunque el modelo convierte formas numericas saturadas, puede fallar en contextos complejos o con numeros poco frecuentes. El guardrail de 70 % de solapamiento de tokens mitiga parcialmente este riesgo, pero no lo elimina.
- Contexto limitado: el ejemplo de despliegue usa 4096 tokens, muy por debajo de los 32K del Qwen3-0.6B original. No se especifica si el finetune redujo la ventana de contexto o si es una eleccion operativa.
- Licencia restrictiva: la licencia es `other` y hereda los terminos de superwhisper/s1-mini, que a su vez es un finetune de Qwen3-0.6B. El autor advierte explicitamente que se deben revisar los terminos del modelo base antes de uso comercial. Qwen3-0.6B tiene licencia Apache 2.0, pero el finetune intermedio puede imponer restricciones adicionales.
- Sin garantias de generalizacion: el dataset de entrenamiento es pequeno (~1000 filas) y orientado a clases de fallo medidas. El modelo puede no cubrir todos los fenomenos linguisticos del aleman hablado, especialmente variantes regionales o jerga tecnica.
- Sin soporte de herramientas ni agentes: no es adecuado para tareas que requieran tool calling, razonamiento multi-paso o interaccion con APIs externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Joni000000000/s1-mini-de-v3
- Modelo base superwhisper/s1-mini: https://huggingface.co/superwhisper/s1-mini
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- No se ha encontrado un repositorio publico del proyecto yappr ni un paper academico asociado. La model card menciona archivos de entrenamiento y evaluacion dentro del repositorio del modelo, pero no se proporcionan enlaces externos adicionales.
