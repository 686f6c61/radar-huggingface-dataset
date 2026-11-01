# ketimiroshnik/llm-course-hw2-ppo

## Resumen

`ketimiroshnik/llm-course-hw2-ppo` es un ajuste fino del modelo instructivo SmolLM2-135M-Instruct de HuggingFaceTB, entrenado mediante PPO (Proximal Policy Optimization) con una reward model separada. El autor lo presenta como un ejercicio de curso (el identificador incluye "llm-course-hw2") cuyo objetivo es demostrar el pipeline de RLHF: partir de una policy base, definir una funcion de recompensa aprendida y optimizar la policy contra ella usando 1024 prompts del dataset HumanLLMs/Human-Like-DPO-Dataset.

Arquitectonicamente hereda intacta la estructura del modelo base: un transformer decoder-only de 134.515.584 parametros (aproximadamente 135M), con tokenizador y configuracion de Llama, pesos en safetensors y un tamano de repositorio de 0,5 GB. El contexto maximo no se especifica en la informacion disponible, aunque el modelo base SmolLM2-135M-Instruct opera con 8.192 tokens.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como referencia reproducible de un ciclo PPO completo sobre un modelo pequeno, con una tabla de recompensa media que pasa de -0,1363 en las primeras 8 actualizaciones a 0,8206 en las ultimas 8 (incluyendo penalizacion por ausencia de token EOS). No es un modelo pensado para produccion: no tiene licencia declarada, solo soporta ingles y su calidad cualitativa, segun el propio autor, apenas difiere del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.584 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Metodo de ajuste | PPO con reward model externa |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset (1024 prompts) |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del SmolLM2-135M-Instruct: un transformer decoder-only denso de 135M parametros con atencion causal estandar y tokenizador compatible con Llama. No se introduce ninguna modificacion estructural; el entrenamiento consiste exclusivamente en un ajuste de pesos via PPO sobre la policy inicial. La reward model utilizada no se especifica por nombre en la model card, solo se indica que "esta tomada de este trabajo" (referencia no enlazada en la informacion disponible).

El proceso de entrenamiento uso 1024 prompts del dataset HumanLLMs/Human-Like-DPO-Dataset y optimizo la policy contra la recompensa aprendida, incorporando una penalizacion explicita cuando la generacion no terminaba con token EOS. La metrica `objective/scores` evoluciono de -0,1363 (media de las primeras 8 actualizaciones) a 0,8206 (media de las ultimas 8), lo que indica que el modelo aprendio a satisfacer la reward model. Sin embargo, el propio autor senala que la diferencia estilistica respecto al modelo base es marginal en la muestra cualitativa que publica. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni mezclas de expertos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Respuesta a prompts de formato instructivo (preguntas y respuestas de un solo turno).
- Generacion de listas estructuradas y texto con formato Markdown basico, como se observa en los ejemplos de la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo "thinking", vision, audio ni otras modalidades.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.
- No se documentan capacidades de codigo ni matematicas mas alla de lo que pueda ofrecer el modelo base.

## Casos de uso

- Docencia y practica de RLHF: el modelo sirve como ejemplo ejecutable de un ciclo PPO completo, con policy, reward model y metrica de recompensa documentada, para cursos y talleres sobre alineamiento.
- Reproduccion de experimentos de alineamiento a bajo coste: con 135M parametros y 0,5 GB de pesos, se puede entrenar y evaluar en una sola GPU consumer, lo que permite iterar sobre hiperparametros de PPO sin infraestructura dedicada.
- Investigacion sobre reward hacking: la discrepancia entre la subida de recompensa (-0,1363 a 0,8206) y la mejora cualitativa marginal es un caso de estudio util para analizar como una policy puede optimizar la reward sin mejorar realmente la calidad percibida.
- Generacion de texto corto en ingles para prototipos: respuestas de hasta 256 tokens nuevos en tareas simples de conversacion, adecuado para demos y pruebas de integracion con `transformers` y text-generation-inference.
- Base para comparativas controladas: al compartir arquitectura y tokenizador con SmolLM2-135M-Instruct, permite medir el efecto aislado de PPO frente al modelo original en el mismo hardware y con los mismos prompts.
- Evaluacion de robustez de generacion: el ejemplo publicado muestra terminacion incompleta (ultimo punto truncado) y contenido incoherente (sueno nocturno y almuerzo dentro de una rutina matutina), lo que lo hace util para probar detectores de truncamiento y filtros de calidad en pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la recompensa media de entrenamiento:

| Metrica | Primeras 8 actualizaciones | Ultimas 8 actualizaciones |
|---|---|---|
| objective/scores (con penalizacion por ausencia de EOS) | -0,1363 | 0,8206 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,27 GB solo para pesos (135M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,14 GB para pesos; en 4 bits, alrededor de 0,07 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU para inferencia de baja latencia; para entrenamiento PPO se recomienda al menos una GPU con 8-16 GB para acomodar policy, reward model y estados del optimizador.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketimiroshnik/llm-course-hw2-ppo | 134,5M | no disponible | PPO sobre SmolLM2-135M-Instruct | no disponible | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 tokens (segun modelo base) | SFT + DPO sobre SmolLM2-135M | Apache 2.0 (segun modelo base) | HuggingFace, ampliamente descargado |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8.192 tokens (segun modelo base) | SFT + DPO | Apache 2.0 (segun modelo base) | HuggingFace |
| Qwen2.5-0.5B-Instruct | 500M | 32.768 tokens (segun modelo base) | SFT + preferencias | Apache 2.0 (segun modelo base) | HuggingFace |

La comparativa se limita a parametros y procedencia porque no hay benchmarks publicados para este ajuste. Frente al modelo base, la unica diferencia medible es el proceso de PPO y la metrica de recompensa; el contexto, la licencia y el rendimiento en tareas estandar no estan documentados para esta variante.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial, redistribucion o modificacion; no debe usarse en produccion sin aclarar este punto con el autor.
- Solo soporta ingles, lo que excluye aplicaciones en castellano u otros idiomas.
- Riesgo de alucinacion y de incoherenciafactual: el ejemplo publicado incluye sueno nocturno y almuerzo dentro de una rutina matutina, y el ultimo punto queda truncado, lo que indica problemas de coherencia y terminacion.
- La recompensa de entrenamiento no garantiza calidad: la subida de -0,1363 a 0,8206 no se traduce en una mejora estilistica apreciable segun el propio autor, un indicio clasico de reward hacking o de una reward model poco discriminativa.
- Contexto maximo no documentado: se desconoce si se mantiene el contexto del modelo base; no debe asumirse para conversaciones largas.
- Modelo de muy bajo parametraje (135M): capacidad limitada para razonamiento complejo, matematicas, codigo y conocimiento factual.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K) frente a alternativas.
- Repositorio sin descargas ni likes y creado en 2026: no hay validacion de la comunidad ni historial de uso.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines que requieran function calling.
- El identificador "hw2" sugiere un trabajo academico sin mantenimiento previsto; no debe asumirse soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketimiroshnik/llm-course-hw2-ppo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Paper de SmolLM2: no disponible en la informacion proporcionada
- Paper de la reward model: no disponible (la model card menciona "esta tomada de este trabajo" sin enlace)
- Repositorio de codigo o notebook: no disponible en la informacion proporcionada
- Demo: no disponible
