# renatoschust/agentmujo-qwen3.5-9b-bos-2026-11-05

## Resumen

agentmujo-qwen3.5-9b-bos es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B, publicado por el usuario renatoschust en HuggingFace. Su objetivo declarado es reforzar las capacidades del modelo base en bosnio (y, por extensión, en el continuo serbocroata: bosnio, croata y serbio, BCMS) para tareas de texto, RAG y generación de código, además de introducir cierta familiaridad con flujos agénticos y de function calling.

El adaptador se entrenó el 4 y 5 de noviembre de 2026 sobre un nodo LUMI-G con una GPU AMD MI250X, usando un conjunto de datos propio denominado `joint_v0.43` con 91.533 filas de entrenamiento y 5.085 de validación. El entrenamiento consistió en una época, 2.042 pasos, longitud máxima de secuencia de 2.048 tokens y una configuración LoRA de rango 64 y alpha 128 en bf16, con una pérdida de entrenamiento final de 0,6174.

La relevancia de esta ficha es doble: por un lado, documenta un esfuerzo de adaptación lingüística para una familia de idiomas con poca cobertura en modelos abiertos; por otro, la propia model card del autor es explícita sobre un fallo medido en tool calling (tool_acc 0,0 % en 63 tareas del runtime GAMA), lo que convierte a este adaptador en un caso instructivo de cómo un desequilibrio en el dataset (solo 276 filas de tool-call, el 0,3 %) degrada una capacidad concreta. No es un modelo apto para producción en ese ámbito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B; arquitectura del base no detallada en la información disponible |
| Parámetros totales | No disponible (el adaptador LoRA pesa 2,6 GB en el repo; el base es de 9B según su nombre) |
| Parámetros activos | No disponible (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usó max_len 2048 |
| Tipos de cuantización | No disponible (pesos del adaptador en bf16 durante el entrenamiento) |
| Idiomas soportados | bs (bosnio), hr (croata), sr (serbio), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), config PEFT en adapter_config.json |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo sino un adaptador LoRA de PEFT que se carga sobre Qwen/Qwen3.5-9B. La configuración LoRA emplea rango 64 y alpha 128, entrenada en precisión bf16. El entrenamiento se ejecutó en un nodo LUMI-G con una AMD MI250X (entorno ROCm), durante 15 horas y 23 minutos, con una sola época sobre 91.533 filas y 2.042 pasos a longitud máxima de 2.048 tokens.

El dataset `joint_v0.43` combina, según la model card, núcleo de bosnio, conocimiento, RAG, function calling, terminal agéntico, código y seguridad, con 5.085 filas reservadas para validación. Los resultados reportados son train_loss 0,6174 y, sobre 200 filas de validación, eval_loss 1,1529 con una precisión media por token del 76,18 %. No se documentan fases de RLHF ni DPO, ni innovaciones arquitectónicas propias más allá del ajuste LoRA; tampoco se detalla la composición exacta ni la procedencia de los datos de cada subconjunto.

## Capacidades

- Generación de texto conversacional en bosnio, croata, serbio e inglés, con especial énfasis en el núcleo bosnio.
- Recuperación aumentada (RAG): el dataset incluye filas específicas de RAG, orientadas a responder sobre contexto recuperado.
- Generación de código: el conjunto de entrenamiento incluye filas de coding, aunque no se publican métricas específicas de código.
- Conocimiento general y respuestas de tipo factual, según el subconjunto "knowledge".
- Contenido de seguridad: se entrenó con filas de safety, con el efecto observado de un rechazo excesivo de peticiones benignas (over-refusal).
- Tool calling / function calling: capacidad nominalmente entrenada pero no funcional en la práctica (ver limitaciones); tool_acc 0,0 % en el runtime GAMA.
- Flujos agénticos de terminal: presentes en los datos (agentic-terminal) pero sin evaluación publicada que los valide.
- Multilingüismo limitado a los cuatro idiomas declarados; no se documenta soporte de otros.

## Casos de uso

- Asistencia conversacional en bosnio: el adaptador refuerza el registro y el vocabulario del bosnio sobre el base, por lo que encaja en chatbots de atención al cliente para mercados de Bosnia y Herzegovina, Croacia y Serbia, siempre que no se requiera invocar herramientas externas.
- Preguntas y respuestas sobre documentación (RAG): puede conectarse a un pipeline de recuperación y generar respuestas a partir de fragmentos recuperados en BCMS; el subconjunto de RAG del dataset lo hace adecuado para este patrón, aunque conviene validar la fidelidad factual con evaluación propia.
- Traducción y reescritura entre BCMS e inglés: útil para localización de contenidos, resúmenes de documentos y normalización de textos en las cuatro lenguas declaradas.
- Generación de código asistida en entornos de desarrollo: puede emplearse como autocompletado o generador de fragmentos en un IDE, dado el subconjunto de coding del entrenamiento; requiere revisión humana y no se han publicado métricas de HumanEval ni similares.
- Prototipado de agentes de terminal en investigación: sirve como punto de partida para estudiar por qué un adaptador SFT con datos escasos de tool calling falla en la selección de herramientas, y como base para el reentrenamiento v2 que el autor anuncia.
- Moderación y filtrado de contenido en BCMS: el entrenamiento con filas de safety permite clasificar o reescribir contenido sensible, con la advertencia de que el modelo tiende a rechazar en exceso peticiones legítimas.
- Experimentación académica con LoRA sobre hardware AMD: el registro del entrenamiento en MI250X con ROCm lo convierte en una referencia reproducible para quienes trabajan en clústeres LUMI o similares.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas de entrenamiento y una evaluación de tool calling sobre el runtime GAMA. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Valor | Contexto |
|---|---|---|
| train_loss | 0,6174 | 1 época, 2.042 pasos |
| eval_loss | 1,1529 | 200 filas de validación |
| mean_token_accuracy | 76,18 % | 200 filas de validación |
| tool_acc | 0,0 % | 63 tareas GAMA |
| args_acc | 3,7 % | 63 tareas GAMA |
| parse_rate | 49,2 % | 63 tareas GAMA |

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 2,6 GB, correspondientes al adaptador LoRA en safetensors; la VRAM total depende del modelo base Qwen3.5-9B, que no se detalla en la información disponible.
- GPU de entrenamiento documentada: 1x AMD MI250X en LUMI-G con ROCm; el autor menciona ROCm entre las etiquetas del modelo.
- GPU recomendadas para inferencia: no disponibles de forma específica; por el tamaño del base (9B), un adaptador LoRA en bf16 requeriría del orden de decenas de GB de VRAM, aunque este dato no está confirmado en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; no se aportan mediciones de VRAM ni de cuantización del modelo fusionado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base), con posibilidad de fusionar los pesos; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros adaptadores LoRA para BCMS en la información proporcionada. La comparación se limita a aspectos estructurales frente al modelo base y a la categoría de adaptadores lingüísticos.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Tool calling |
|---|---|---|---|---|---|
| agentmujo-qwen3.5-9b-bos | LoRA SFT sobre Qwen3.5-9B | 9B (base) | No disponible (entrenado a 2048) | Apache 2.0 | Fallido (tool_acc 0,0 %) |
| Qwen/Qwen3.5-9B | Modelo base completo | 9B | No disponible | No disponible en la información | No disponible |
| Adaptadores LoRA para BCMS de otros autores | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Tool calling no funcional: tool_acc 0,0 %, args_acc 3,7 % y parse_rate 49,2 % sobre 63 tareas del runtime GAMA. El autor lo declara explícitamente no apto para producción en este ámbito.
- Causa del fallo identificada: solo 276 filas de tool-call (0,3 % del dataset) y ninguna de las herramientas del runtime GAMA (`hc`, `sql`, `brain_search`, `gama_run`, `doc`, `web_search`); el modelo aprendió nombres genéricos como `service_status` o `package_install`.
- Rechazo excesivo: el entrenamiento con filas de seguridad provoca over-refusal sobre peticiones benignas, según la propia model card.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; las métricas de validación son de pérdida y precisión por token, no de corrección semántica.
- Cobertura lingüística acotada a bs, hr, sr y en; no se documenta comportamiento en otras lenguas.
- Contexto de entrenamiento de 2.048 tokens: no hay evidencia de que el adaptador generalice a ventanas más largas del base.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja expresamente el uso en producción para tool calling; conviene revisar también la licencia del modelo base Qwen3.5-9B antes de desplegar.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y el autor anuncia un reentrenamiento v2 del esquema de herramientas.
- Entrenamiento en una sola GPU MI250X: no se documenta reproducibilidad multi-semilla ni análisis de varianza de las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos-2026-11-05
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
