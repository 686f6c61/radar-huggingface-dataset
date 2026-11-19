# saidutta69/LFM3-1.7B-Claude-Fable5.1

## Resumen

LFM3-1.7B-Claude-Fable5.1 es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario saidutta69, orientado específicamente a la emisión fiable de llamadas a herramientas (tool calling) con el protocolo de Claude Code. El modelo parte de la arquitectura híbrida LFM3 de Liquid AI, con 1.728.801.536 parámetros totales, y ha sido entrenado mediante LoRA en bf16 sobre el split `claude_code` del dataset saidutta69/fable-5.1-premium-v2, que contiene valores reales de argumentos en lugar de placeholders.

El problema que resuelve es concreto: el modelo base LFM3-1.7B, pese a ser ya agéntico, inventa nombres de herramienta en aproximadamente un 23% de las llamadas parseadas, lo que rompe bucles de ejecución en harnesses estrictos. Este checkpoint eleva la validez del nombre de herramienta al 100% de las llamadas parseadas y garantiza la presencia de argumentos requeridos y tipos correctos. No obstante, el autor advierte explícitamente de que no es una mejora general del LFM3: la perplejidad en wikitext sube de 17,35 a 23,32, por lo que el modelado de texto libre se degrada.

Es relevante ahora porque permite ejecutar un protocolo de herramientas estilo Claude Code en local con un modelo de 1,7B que en cuantización Q4_K_M ocupa 1,10 GB, lo que lo hace viable en CPU, dispositivos de borde y GPUs de consumo, con una ventana de contexto declarada de 262.144 tokens. La licencia es lfm1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LFM3 (transformer híbrido con capas convolucionales; `arch=lfm3` en GGUF) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (declarado en los GGUF: `context_length=262144`) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); bf16 en safetensors |
| Idiomas soportados | inglés (`en`) |
| Licencia | lfm1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (bf16) y GGUF (f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B de Liquid AI, una arquitectura híbrida que combina mecanismos de atención con capas convolucionales; los objetivos LoRA del ajuste incluyen `q/k/v/o_proj`, las convoluciones `in_proj`/`out_proj` y las capas MLP `w1/w2/w3`, lo que confirma la presencia de bloques convolucionales en la arquitectura. El ajuste se realizó con LoRA en bf16 sin cuantización, con r=32, alpha=64 y dropout 0,05, sobre 48.467 segmentos extraídos de 4.132 trazas, con ventanas de 4.096 tokens. El enmascaramiento afecta solo al turno del asistente (los tokens de usuario, sistema y salidas de herramientas se marcan con -100). El entrenamiento constó de 3.030 pasos, batch efectivo 16, LR 1e-4 con schedule coseno y 3% de warmup, ejecutado en una RTX PRO 6000 Blackwell (96 GB) durante 6 h 39 m con un pico de 31 GB, alcanzando una pérdida final de 0,200.

Los esquemas de herramientas se inyectan mediante la propia plantilla de chat de LFM3 con `enable_thinking=False`. Un detalle técnico relevante es que los esquemas del dataset son reconstruidos, no los esquemas originales de Claude Code, por lo que el autor advierte de que no debe asumirse paridad byte a byte con una instalación real de Claude Code. El dataset `fable_code` se descartó porque 203.750 de 203.794 llamadas contenían placeholders de valor completo (solo 44 llamadas limpias), mientras que el split `claude_code` contiene valores reales como rutas y comandos de shell.

## Capacidades

- Emisión de llamadas a herramientas con nombres válidos y argumentos tipados para el protocolo de Claude Code: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskCreate`, `TaskUpdate`, `TaskOutput`, `ToolSearch`.
- Tool calling y function calling con esquemas inyectados mediante la plantilla de chat del modelo.
- Generación de código y comandos de shell dentro de un harness agéntico.
- Razonamiento multi-paso y uso de agentes en bucles de ejecución con herramientas.
- Conversación multi-turno e instrucciones (chat, instruct, instruction-following).
- Ventana de contexto larga declarada de 262.144 tokens.
- Inferencia en local: CPU, dispositivos de borde y GPUs de consumo gracias a los GGUF desde 1,10 GB.
- Modo thinking desactivable (`enable_thinking=False`), que es la configuración usada en el entrenamiento.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Agente de codificación local estilo Claude Code: el modelo emite llamadas a `Read`, `Edit`, `Write` y `Bash` con nombres y tipos válidos, lo que permite integrarlo en un harness que aborta el bucle ante un nombre de herramienta inválido; el modelo base fallaba en ese punto en un 23% de las llamadas parseadas.
- Automatización de terminal y shell: con la herramienta `Bash` y argumentos tipados, puede generar comandos de shell dentro de pipelines de automatización de tareas de desarrollo, ejecutándose en local sin depender de APIs externas.
- Búsqueda y navegación de repositorios: las herramientas `Glob` y `Grep` permiten localizar ficheros y patrones en un árbol de código; el modelo produce los argumentos requeridos en el 100% de las llamadas parseadas.
- Obtención de información web dentro de un agente: `WebFetch` y `WebSearch` habilitan flujos de recuperación de documentación o referencias durante una tarea de desarrollo.
- Gestión de tareas en agentes multi-paso: `TodoWrite`, `TaskCreate`, `TaskUpdate` y `TaskOutput` permiten estructurar y seguir el estado de tareas largas dentro de un agente.
- Despliegue en dispositivos de borde o CPU: con el GGUF Q4_K_M de 1,10 GB puede ejecutarse con llama.cpp en entornos con recursos limitados, útil para asistentes de desarrollo embebidos o entornos sin GPU.
- Edición de ficheros asistida: `Edit` y `Write` con rutas reales permiten aplicar cambios sobre el código; conviene ampliar el presupuesto de tokens de generación porque el modelo produce cuerpos de `Write` y `Bash` más extensos.

## Benchmarks y rendimiento

Evaluación del autor sobre 100 muestras de test retenidas del split `claude_code`, decodificación greedy, presupuesto de 2.048 tokens, mismo harness para ambos modelos:

| Metrica | LFM3-1.7B base | Este modelo |
|---|---|---|
| Pérdida supervisada en held-out | 1,731 | 0,233 |
| Inicia una llamada a herramienta | 97% | 100% |
| Llamada parseable | 97% | 95% |
| Nombre de herramienta válido (por muestra) | 75% | 95% |
| Nombre de herramienta válido (de las parseadas) | 77,3% | 100% |
| Argumentos requeridos presentes (de las parseadas) | 96,9% | 100% |
| Tipos de argumento correctos (de las parseadas) | 100% | 100% |
| Muestra de chat/matemáticas | 11/11 factuales | 11/11 factuales |
| Perplejidad en wikitext | 17,35 | 23,32 |

El 5% de llamadas no parseables corresponde a salidas truncadas por el límite de 2.048 tokens: el modelo escribe cuerpos de `Write` y `Bash` más completos y algunas llamadas no se cierran dentro del presupuesto. El autor indica que ampliar el presupuesto o hacer streaming cierra esa brecha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,46 GB en bf16 (safetensors), 3,47 GB en f16 GGUF, 1,85 GB en Q8_0, 1,43 GB en Q6_K, 1,26 GB en Q5_K_M y 1,10 GB en Q4_K_M.
- GPU recomendadas: el entrenamiento se realizó en una RTX PRO 6000 Blackwell (96 GB) con pico de 31 GB, pero para inferencia basta con GPUs de consumo; cualquier GPU con al menos 2 GB libres puede ejecutar el Q4_K_M.
- Cabe en GPU de consumo: sí, en todas las gamas actuales con el GGUF Q4_K_M; también en CPU e inferencia on-device.
- Opciones de despliegue: llama.cpp (requiere compilación desde master, ya que el soporte de LFM3 es reciente), Transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`, y GGUF compatible con llama.cpp; los tags mencionan también Ollama y vLLM como ecosistema, aunque la model card solo documenta comandos para llama.cpp y Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Claude-Fable5.1 | 1,73 B | 262.144 | Tool calling Claude Code | lfm1.0 | HF (safetensors + GGUF) |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 262.144 | Propósito general agéntico | lfm1.0 | HF |
| Alternativas de 1-2 B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa directa con el modelo base está en la tabla de benchmarks: este checkpoint mejora la validez del nombre de herramienta del 77,3% al 100% de las llamadas parseadas, a costa de un aumento de perplejidad en wikitext de 17,35 a 23,32. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es una mejora general del LFM3: el modelado de texto libre se degrada (perplejidad en wikitext de 17,35 a 23,32); el autor recomienda usar el modelo base para escritura general.
- Los esquemas de herramientas del dataset son reconstruidos, no los originales de Claude Code; no debe asumirse paridad byte a byte con una instalación real.
- El 5% de llamadas no parseables se debe a truncamiento en el límite de 2.048 tokens; en producción conviene ampliar el presupuesto o usar streaming.
- Solo soporta inglés según la model card.
- Licencia lfm1.0 (`license: other`): es necesario revisar los términos del fichero LICENSE antes de uso comercial.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones específicas en la información disponible.
- Requiere `trust_remote_code=True` en Transformers y una versión de llama.cpp compilada desde master con soporte reciente de LFM3.
- El contexto declarado de 262.144 tokens no implica que el modelo mantenga calidad en ventanas tan largas; el entrenamiento usó ventanas de 4.096 tokens.
- El repositorio ocupa 12,6 GB, aunque basta con descargar el GGUF deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Licencia: LICENSE (referenciada en el repositorio del modelo)
- llama.cpp: no disponible enlace directo en la información proporcionada
