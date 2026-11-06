# aksern/compctx-0.8b

## Resumen

`compctx-0.8b` es un modelo compacto de generación de texto desarrollado por el usuario `aksern` y publicado en Hugging Face. Se trata de un ajuste fino (SFT con LoRA) sobre `Qwen/Qwen3.5-0.8B`, con 752 millones de parámetros, cuyo propósito no es la conversación general, sino una tarea muy específica: comprimir trazas de ejecución de agentes de IA en notas de memoria estructuradas.

El problema que resuelve es la gestión de memoria en sistemas agentes de larga duración. Los agentes que usan herramientas generan registros extensos de acciones, errores y decisiones; este modelo destila esos registros en un formato fijo (objetivo, restricciones, estado, decisiones y siguientes pasos), preservando detalles técnicos exactos como rutas de ficheros, comandos, identificadores y mensajes de error. Esto permite reanudar sesiones de agente o construir componentes de memoria ligeros sin mantener el contexto completo en la ventana del modelo.

Es relevante porque aborda un componente concreto y creciente del ecosistema de agentes: la persistencia de contexto entre sesiones. Al ser un modelo de menos de mil millones de parámetros con pesos en safetensors y licencia OpenMDW-1.1, es desplegable en hardware de consumo, lo que lo hace práctico como módulo de memoria en pipelines locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer causal, convertido a text-only) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (LoRA fusionado en el modelo base, repo de 1,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, cuya arquitectura original era multimodal. El autor convirtió el checkpoint a un modelo de lenguaje causal text-only (`Qwen3_5ForCausalLM`), transfiriendo los pesos del componente de lenguaje y descartando el resto. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 128 y alpha 128; el adaptador fue posteriormente convertido y fusionado, de modo que el repositorio publicado es un checkpoint autónomo y no requiere cargar el modelo base por separado.

El objetivo de entrenamiento fue transformar trazas de ejecución de agentes en notas de memoria estructuradas, con énfasis en preservar detalles técnicos exactos (rutas, comandos, identificadores, mensajes de error). El tokenizer incluye en su chat template el system prompt de instrucciones, un ejemplo few-shot usado durante el entrenamiento, el envoltorio del input en etiquetas `<trace>` y el prefijo de generación del asistente, de forma que el usuario solo necesita pasar la traza como mensaje de usuario. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Transformación de trazas de ejecución de agentes (logs con tool calls, spans de razonamiento y respuestas) en notas de memoria estructuradas con formato fijo: `Goal`, `Constraints`, `State` (con marcadores `[done]`, `[failed]`, `[planned]`), `Decisions` y `Next`.
- Distinción entre acciones completadas, fallos (con el error exacto) y trabajo planificado sin confirmar.
- Preservación de detalles técnicos literales: rutas de ficheros, comandos, identificadores y mensajes de error.
- Instrucción de usar únicamente la información presente en la traza de entrada, evitando inventar detalles ausentes.
- Generación determinista recomendada (`do_sample=False`) y salida acotada (`max_new_tokens=512` en el ejemplo oficial).
- No es un asistente conversacional de propósito general; su salida está diseñada alrededor del formato estructurado descrito.
- No hay información disponible sobre tool calling, capacidades de visión/audio ni soporte multilingüe explícito.

## Casos de uso

- **Memoria persistente entre sesiones de agente:** al final de cada sesión, la traza de ejecución se comprime en una nota estructurada que se reinyecta como contexto en la sesión siguiente, permitiendo retomar tareas de larga duración sin mantener todo el histórico.
- **Compresión de contexto en orquestadores multi-agente:** un agente orquestador puede resumir las trazas de sus subagentes antes de pasarlas a otros componentes, reduciendo el consumo de tokens de la ventana de contexto.
- **Depuración y auditoría de agentes:** las notas generadas recopilan acciones fallidas con sus errores exactos, útiles para revisar por qué un agente no completó una tarea o para alimentar sistemas de evaluación.
- **Componentes de memoria ligeros en agentes locales:** al ser un modelo de 752M, puede ejecutarse junto al agente principal en una GPU de consumo o incluso en CPU, funcionando como módulo dedicado de resumen de memoria.
- **Extracción de estado de tareas en workflows largos:** los marcadores `[done]`, `[failed]` y `[planned]` permiten parsear programáticamente el progreso de una tarea y construir colas de trabajo pendiente.
- **Registro estructurado de decisiones:** el campo `Decisions` documenta qué enfoques se eligieron o rechazaron y por qué, útil para trazabilidad en pipelines automatizados de CI/CD o investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 752M de parámetros en bfloat16, el modelo ocupa aproximadamente 1,5 GB de pesos (coincide con el tamaño del repo), por lo que es ejecutable en GPUs con 4-6 GB de VRAM con margen para el contexto; en CPU también es viable dado su tamaño.
- **GPU recomendadas:** cualquier GPU de consumo moderna es suficiente (RTX 3060, RTX 4060 o superiores). No se requieren GPUs de datacenter como A100 o H100.
- **Consumer GPU:** sí, cabe con holgura en la mayoría de GPUs de consumo actuales incluso sin cuantización.
- **Opciones de despliegue:** transformers (librería indicada en la model card, con ejemplo oficial de uso mediante `AutoModelForCausalLM` y `apply_chat_template`). No hay información publicada sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint safetensors estándar de transformers, el soporte por otras herramientas dependería de su compatibilidad con la arquitectura `Qwen3_5ForCausalLM`.
- **Latencia y throughput:** no disponible. El ejemplo oficial sugiere generación determinista con un máximo de 512 tokens nuevos.

## Comparativa con modelos similares

No existen alternativas publicadas con exactamente la misma tarea especializada (compresión de trazas de agente a notas de memoria estructuradas) en la informacion disponible. Como referencia de categoría (modelos pequeños de base similar), se comparan las siguientes opciones genéricas, con la salvedad de que ninguna está especializada en esta tarea:

| Modelo | Parametros | Tarea | Contexto | Licencia |
|---|---|---|---|---|
| aksern/compctx-0.8b | 752M | Compresion de trazas de agente a notas estructuradas | no disponible | OpenMDW-1.1 |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | Modelo base de proposito general | no disponible | Ver ficha del modelo base |
| Modelos genericos tipo Llama/Qwen 1B usados como resumidores | ~1B | Resumen general mediante prompting | variable | variable |

La ventaja diferencial de `compctx-0.8b` frente a usar un modelo generalista con prompting es que el formato de salida, el system prompt y el ejemplo few-shot están integrados en el chat template y reforzados por el entrenamiento, lo que reduce la variabilidad del formato. La contrapartida es que pierde la versatilidad conversacional del modelo base.

## Limitaciones y advertencias

- No es un asistente conversacional de propósito general; su utilidad está restringida a la tarea de compresión de trazas en el formato estructurado definido.
- La precisión de las notas depende de la información presente en la traza de entrada: si la traza es incompleta o ambigua, la nota lo será.
- Puede omitir detalles cuando la entrada excede su ventana de contexto o el presupuesto de salida (el ejemplo oficial usa `max_new_tokens=512`).
- La longitud de contexto no está publicada; para trazas muy largas conviene verificar experimentalmente el límite antes de usarlo en producción.
- Idiomas soportados no disponibles; el formato de salida y los ejemplos están en inglés, por lo que el comportamiento con trazas en castellano no está documentado.
- Licencia OpenMDW-1.1: el propio autor indica revisar la licencia y términos del modelo base `Qwen/Qwen3.5-0.8B` antes de redistribuir o hacer uso comercial.
- Riesgo de alucinación: el modelo está instruido para no inventar información, pero no hay evaluaciones publicadas que cuantifiquen su tasa de fidelidad a la traza; se recomienda validación en el pipeline de destino.
- Métricas de calidad (benchmarks) no publicadas: no hay forma de comparar objetivamente su rendimiento frente a alternativas sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aksern/compctx-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
