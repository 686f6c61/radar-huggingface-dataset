# agentic-ptb/grok.h015.sft-v5.step_400

## Resumen

El modelo `agentic-ptb/grok.h015.sft-v5.step_400` es un checkpoint intermedio extraído de un barrido de entrenamiento (sweep) del proyecto AgentPTB, un experimento de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El identificador del repositorio codifica la hora del run en la que se guardó el checkpoint (`h015` = hora 15 de un run de 100 horas), lo que permite situarlo en la curva de rendimiento temporal del experimento. El driver del sweep es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`, lo que sugiere que el objetivo es explorar configuraciones de entrenamiento para mejorar capacidades de razonamiento y agencia.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors, este checkpoint no está pensado como un modelo final listo para producción, sino como un artefacto de investigación para estudiar la dinámica de entrenamiento y comparar checkpoints a lo largo del tiempo. Un defecto crítico de empaquetado, la ausencia del token `eos` `248046` (`<|im_end|>`), hace que el modelo no detenga la generación al final de turno y pueda sobrepasar la ventana de contexto, por lo que sus métricas de evaluación deben interpretarse como un límite inferior y no como una medida fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen3.5-9B-Base, no confirmado oficialmente) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha; depende del modelo base) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros. El checkpoint se obtiene mediante fine-tuning supervisado (SFT) dentro de un barrido de 100 horas gestionado por AgentPTB, una infraestructura de experimentación para entrenar modelos con trazas de agentes (el artículo sobre AgentTrove, citado en los resultados de búsqueda, describe cómo construir datasets SFT a partir de 1,7 millones de trazas agénticas, lo que probablemente esté relacionado con el pipeline de datos de este experimento). El driver del sweep es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`, lo que indica que se busca maximizar el rendimiento en tareas de razonamiento complejo.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint se guarda en el paso 400 del run (`step_400`), con 4 shards. Un defecto conocido de empaquetado afecta a todos los checkpoints del sweep: falta el token `eos` `248046` (`<|im_end|>`), que es el token de fin de turno de la plantilla de chat de Qwen3.5. Esto provoca que el modelo no se detenga correctamente y sobrepase la ventana de contexto, por lo que cualquier evaluación debe compararse solo con otros checkpoints con el mismo estado de `eos` o re-empaquetarse antes de evaluar.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, se espera que herede capacidades generales de generación de texto, razonamiento y conocimiento, aunque no se han evaluado específicamente para este checkpoint.
- Razonamiento agéntico: el entrenamiento con trazas de agentes (según el contexto de AgentPTB) podría mejorar la capacidad de seguir instrucciones multi-paso, pero no hay evidencia publicada al respecto.
- Soporte de tool calling / function calling: no disponible; no se menciona en la documentación del checkpoint.
- Soporte de agentes y multi-step reasoning: no confirmado; el driver `grok-4.6` con esfuerzo `xhigh` sugiere un enfoque en razonamiento, pero sin datos de evaluación no se puede afirmar.
- Capacidades multilingües: no disponibles; el modelo base Qwen3.5 suele ser multilingüe, pero no se especifica para este checkpoint.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en dinámica de entrenamiento: este checkpoint permite a los investigadores analizar cómo evoluciona el rendimiento a lo largo de las horas de un run, comparándolo con otros checkpoints del mismo sweep (por ejemplo, `h022`, `h030`, etc.) para identificar puntos de inflexión o sobreajuste.
- Estudio de defectos de empaquetado de tokens: el problema del token `eos` ausente es un caso de estudio útil para entender cómo los defectos de tokenización afectan a la generación y a las métricas de evaluación.
- Fine-tuning adicional: dado que es un checkpoint intermedio, puede servir como punto de partida para continuar el entrenamiento con otros datasets o técnicas (por ejemplo, DPO o RLHF) después de corregir el empaquetado.
- Comparación de configuraciones de entrenamiento: al ser parte de un sweep con diferentes drivers y esfuerzos de razonamiento, permite aislar el efecto de estas variables en el rendimiento final.
- Desarrollo de pipelines de evaluación robustos: la advertencia sobre el `eos` defectuoso obliga a diseñar protocolos de evaluación que tengan en cuenta la sobre-generación, lo que es relevante para la comunidad de evaluación de LLMs.
- Replicación de experimentos de agentes: si se dispone de los datos de AgentTrove, este checkpoint puede usarse para reproducir o extender los experimentos descritos en el artículo sobre cómo construir datasets SFT a partir de trazas agénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "floor" (límite inferior) debido al defecto del token `eos`, y que solo deben compararse con otros checkpoints con el mismo estado de `eos`. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en FP16 (18,8 GB), se necesitan al menos 20 GB de VRAM para cargar los pesos sin cuantizar. Con cuantización a 8 bits, se reduciría a aproximadamente 10 GB; a 4 bits, a unos 5 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: una NVIDIA A100 de 40 GB o 80 GB es adecuada para FP16; una RTX 4090 de 24 GB podría funcionar con cuantización a 8 bits o 4 bits (si se generan los archivos GGUF o AWQ). No se recomienda su uso en GPUs de menos de 16 GB sin cuantizar.
- Si cabe en consumer GPU: sí, en una RTX 4090 o similar con cuantización, pero no de forma nativa en FP16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar el modelo si se convierten los pesos a los formatos adecuados (GGUF, AWQ, etc.), pero el defecto del token `eos` hace que el despliegue en producción no sea recomendable sin re-empaquetar.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la configuración de despliegue.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. El modelo más directamente comparable es su base, `Qwen/Qwen3.5-9B-Base`, del que hereda la arquitectura y los pesos iniciales. Otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B o Mistral 7B) podrían servir como referencia, pero no hay información sobre cómo se comporta este checkpoint frente a ellos. La comparativa queda pendiente de que se publiquen evaluaciones del sweep completo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h015.sft-v5.step_400 | 9,4B | no disponible | no disponible | Checkpoint intermedio, defecto de eos |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (probablemente 128K) | no disponible | Modelo base, disponible en HF |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | Disponible en HF |

## Limitaciones y advertencias

- Defecto crítico de token `eos`: falta el token `248046` (`<|im_end|>`), por lo que el modelo no detiene la generación al final de turno y puede sobrepasar la ventana de contexto, generando texto sin control. No debe usarse en producción sin corregir este problema.
- Checkpoint intermedio: no es un modelo final; es un artefacto de un barrido de entrenamiento en curso. Su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Licencia desconocida: al no especificarse la licencia, no está claro si se permite el uso comercial o la redistribución. Se recomienda contactar con el autor antes de cualquier uso.
- Sesgos y alucinaciones: no se han evaluado; al ser un modelo derivado de Qwen3.5, puede heredar sesgos del modelo base y del dataset de fine-tuning, pero no hay datos al respecto.
- Evaluaciones no fiables: cualquier métrica obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medida real de capacidad, debido al defecto de `eos`.
- Sin soporte de cuantizaciones oficiales: solo se ofrecen pesos en safetensors; para desplegarlo en entornos con recursos limitados habría que generar cuantizaciones manualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h015.sft-v5.step_400
- Leaderboard BenchLM (contexto de benchmarks, no específico del modelo): https://benchlm.ai/
- Artículo sobre AgentTrove y construcción de datasets SFT: https://www.marktechpost.com/2026/05/29/how-to-use-agenttrove-streaming-1-7m-agentic-traces-and-building-a-clean-sharegpt-sft-dataset-in-python/
- Documentación de modelos de xAI (referencia a Grok 4.6, no directamente relacionada): https://docs.x.ai/developers/models
