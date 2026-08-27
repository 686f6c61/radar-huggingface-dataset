# iromu/Qwen3-0.6B-tools

## Resumen

El modelo `iromu/Qwen3-0.6B-tools` es un ajuste fino mediante LoRA del modelo base `Qwen/Qwen3-0.6B`, orientado específicamente a la llamada estructurada de herramientas (tool calling) y a interacciones de tipo agente. Lo desarrolla el autor independiente iromu, que ha utilizado el framework NVIDIA NeMo AutoModel para el entrenamiento. El objetivo es dotar a un modelo de solo 0,6 mil millones de parámetros de capacidades de invocación de funciones, de modo que pueda ejecutarse en entornos con recursos limitados, como dispositivos de borde o aplicaciones on-device.

El modelo se ha entrenado sobre el split `sft_tools` del dataset de destilación `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que combina salidas de modelos grandes (Qwen3.8-Max, GLM5.2 y Kimi K3) para enseñar al modelo pequeño a emitir llamadas a herramientas de forma fiable. Con 596 millones de parámetros y una longitud de contexto de entrenamiento de 4096 tokens, este modelo no pretende sustituir a los Qwen grandes, sino ofrecer una alternativa compacta para tareas de automatización y agentes ligeros. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 (configuracion de entrenamiento; el base soporta mas) |
| Tipos de cuantizacion | no disponible (no se listan archivos cuantizados en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-0.6B, un transformer denso con atención causal estándar, sin mecanismos de mezcla de expertos. Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) con dimensión 32, alpha 32 y dropout 0.05, afectando a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las capas del MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó con NVIDIA NeMo AutoModel en precisión mixta bf16, con una tasa de aprendizaje de 5e-5, weight decay de 0.01, batch global de 64 (micro batch 2 con 32 pasos de acumulación) y 336 pasos de entrenamiento.

El dataset de entrenamiento proviene de la destilación de tres modelos propietarios de gran tamaño (Qwen3.8-Max, GLM5.2 y Kimi K3), lo que implica que el modelo aprende a replicar el formato de llamada a herramientas de esos sistemas. No se menciona el uso de RLHF ni DPO; el proceso es exclusivamente de supervisión (SFT) sobre ejemplos de tool calling.

## Capacidades

- Llamada estructurada a herramientas: emite invocaciones de funciones con formato JSON, siguiendo el estilo aprendido de los modelos de destilación.
- Interacciones de tipo agente: soporta conversaciones multi-turno donde el modelo decide cuándo llamar a una herramienta y cuándo responder directamente.
- Generación de texto: conserva las capacidades básicas del modelo base Qwen3-0.6B para tareas de lenguaje general, aunque su especialización principal es el uso de herramientas.
- Multilingüismo: limitado al inglés, según la metadata del modelo.
- No se indica soporte para visión, audio ni otros modos multimodales.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: un asistente local que necesita ejecutar acciones como consultar el tiempo, buscar información o controlar dispositivos IoT, usando tool calling para invocar APIs externas sin depender de la nube.
- Automatización de tareas en entornos con recursos limitados: integración en pipelines de CI/CD donde un agente ligero debe parsear logs, ejecutar comandos o interactuar con servicios internos mediante funciones.
- Chatbots de atención al cliente en inglés: el modelo puede gestionar consultas simples y derivar a herramientas de gestión de tickets o bases de conocimiento, gracias a su capacidad de llamar funciones de forma estructurada.
- Prototipado rápido de agentes: al ser pequeño y rápido de cargar, permite iterar sobre lógicas de agente (planificación, ejecución de herramientas) antes de escalar a modelos mayores.
- Edge computing en robótica o automatización industrial: control de acciones mediante comandos estructurados, donde el modelo decide qué herramienta invocar para mover un actuador o leer un sensor.
- Asistentes de productividad local: integración con aplicaciones de escritorio que necesitan generar respuestas y ejecutar acciones como crear eventos de calendario, enviar correos o buscar archivos, todo mediante function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: con 596M parámetros, el modelo en FP16 ocupa aproximadamente 1,2 GB de memoria. Con cuantización a 8 bits o 4 bits (si se generan los archivos GGUF o AWQ), cabría en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar el modelo en FP16. Para cuantización 4-bit, incluso 2 GB podrían ser suficientes.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero pensado para edge y on-device.
- Opciones de despliegue: el README menciona `trtllm-serve` (TensorRT-LLM) y `llama.cpp` con archivos GGUF (aunque no se confirma su existencia en el repo). También es compatible con vLLM, TGI y Ollama si se convierten los pesos.
- Latencia y throughput: no disponible. Al ser un modelo pequeño, se espera una generación rápida incluso en CPU, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| iromu/Qwen3-0.6B-tools | 0,6B | 4096 (entrenamiento) | Tool calling, agentes | Apache 2.0 |
| Qwen/Qwen3-0.6B (base) | 0,6B | 32K (segun documentacion de Qwen3) | Generacion general, multilingue | Apache 2.0 |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32K | Instrucciones generales, algo de tool calling | Apache 2.0 |

La comparativa se limita a modelos de tamaño similar. El modelo de iromu se diferencia por su enfoque exclusivo en tool calling, mientras que el base Qwen3-0.6B es multilingüe y con mayor contexto. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- Modelo pequeño: puede alucinar o cometer errores en tareas complejas de razonamiento; no es adecuado como reemplazo de modelos grandes.
- Sin evaluación publicada: no hay benchmarks que validen su calidad en tool calling frente a alternativas.
- Dataset de destilación: al entrenarse sobre salidas de modelos propietarios, puede heredar sesgos o formatos específicos de esos sistemas.
- Longitud de contexto limitada: el entrenamiento se realizó con 4096 tokens, por lo que su rendimiento con contextos más largos no está garantizado.
- Repositorio sin archivos GGUF confirmados: aunque el README menciona `llama.cpp`, no se listan archivos cuantizados en el repo, por lo que habría que generarlos manualmente.
- Sin mantenimiento activo: el modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin comunidad detrás.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/Qwen3-0.6B-tools
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Guía completa de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
