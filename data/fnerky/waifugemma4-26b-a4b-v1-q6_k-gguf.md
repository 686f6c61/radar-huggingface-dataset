# fnerky/WaifuGemma4-26b-a4b-v1-Q6_K-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1 es un modelo de lenguaje conversacional especializado en roleplay y personajes, desarrollado por hiwaifu-research y distribuido en formato GGUF por el usuario fnerky. Se trata de un modelo derivado de la familia Gemma 4 con arquitectura Mixture of Experts (MoE), con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (de ahí el sufijo "a4b"), lo que lo sitúa en la categoría de modelos MoE de activación dispersa. El modelo está afinado mediante RLHF y GRPO con datos de preferencias humanas orientados a conversación, roleplay y evaluación tipo arena.

La relevancia de esta ficha radica en que es una cuantización Q6_K en formato GGUF, pensada para inferencia local con llama.cpp, lo que permite ejecutar un modelo de 26.000 millones de parámetros en hardware de consumo. El modelo soporta 17 idiomas, incluyendo castellano, y está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

El repositorio tiene un tamaño de 22,6 GB y registra 87 descargas en el momento de la consulta, con fecha de creación en octubre de 2026. Es una opción interesante para desarrolladores que necesitan un modelo conversacional multilingüe con capacidades de razonamiento y matemáticas verificadas por el autor, ejecutable en estaciones de trabajo con GPU de gama alta o incluso en configuraciones de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4.000 millones (sufijo "a4b") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | en, es, ru, pt, id, ar, th, fr, de, uk, vi, ja, ko, zh, tr, it, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q6_K); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE) construida sobre la familia Gemma 4. Con 25.233 millones de parámetros totales y aproximadamente 4.000 millones activos por token, el modelo activa solo una fracción de sus expertos en cada paso de inferencia, lo que reduce el coste computacional manteniendo una capacidad de representación propia de un modelo denso mucho mayor. La model card no detalla el número de expertos, la estrategia de enrutamiento ni la longitud de contexto nativa, por lo que estos datos deben considerarse no disponibles.

El entrenamiento combina un ajuste supervisado inicial con RLHF y GRPO (Group Relative Policy Optimization) sobre datos de preferencias humanas, según los tags del repositorio. El modelo está orientado explícitamente a conversación, roleplay y evaluación tipo arena, e incorpora un reward model y datos de human-preference en el pipeline de alineamiento. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo una fase de decodificación especulativa o atención lineal. La cuantización Q6_K fue generada con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai a partir del modelo base `hiwaifu-research/WaifuGemma4-26b-a4b-v1`.

## Capacidades

- Generación de texto conversacional multi-turno con orientación a roleplay y personajes.
- Razonamiento general y respuesta a preguntas de conocimiento (MMLU 88,59 según el autor).
- Razonamiento matemático y resolución de problemas (GSM8K 96,89 y MATH-500 92,8 según el autor).
- Seguimiento de instrucciones verificables (IFEval prompt-level strict 89,09 según el autor).
- Capacidades multilingües en 17 idiomas, incluyendo castellano, inglés, ruso, portugués, árabe, japonés, coreano y chino.
- Alineamiento mediante preferencias humanas (RLHF/GRPO) orientado a respuestas coherentes con el personaje.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo está afinado específicamente con datos de roleplay y preferencias humanas, por lo que puede mantener personalidades consistentes en conversaciones multi-turno. Se usaría con llama.cpp o un servidor compatible con la API de OpenAI para integrarlo en aplicaciones de chat.
- Atención al cliente con tono personalizado: gracias a su alineamiento conversacional y soporte de castellano, puede gestionar diálogos multi-turno en un asistente virtual con una voz de marca definida, desplegado localmente para evitar dependencia de APIs externas.
- Asistente educativo multilingüe: con 17 idiomas y resultados declarados altos en GSM8K y MATH-500, es adecuado para tutoría de matemáticas y resolución de problemas paso a paso en entornos con requisitos de privacidad.
- Generación de contenido narrativo: la orientación a roleplay y conversación lo hace útil para escritura asistida de ficción, guiones de videojuegos o diálogos de personajes no jugadores (NPC) en motores de juego.
- Evaluación y benchmarking interno: al incluir resultados declarados en IFEval, MMLU, ARC, HellaSwag, Winogrande y TruthfulQA, sirve como referencia para comparar pipelines de cuantización o configuraciones de inferencia en un laboratorio.
- Despliegue en estaciones de trabajo con GPU de consumo: al estar cuantizado en Q6_K (22,6 GB), puede ejecutarse con llama.cpp en máquinas con 24 GB de VRAM o memoria unificada, lo que permite prototipado local sin infraestructura cloud.
- Investigación en alineamiento: los tags de RLHF, GRPO y reward-model lo convierten en un candidato para estudiar cómo se comportan modelos MoE alineados con preferencias humanas en tareas de conversación abierta.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| IFEval | Prompt-level Strict | 89,09 |
| GSM8K | Accuracy | 96,89 |
| MATH-500 | Accuracy | 92,80 |
| MMLU | Accuracy | 88,59 |
| C-Eval | Accuracy | 78,97 |
| C-MMLU | Accuracy | 79,56 |
| ARC | Accuracy | 98,39 |
| HellaSwag | Accuracy | 79,78 |
| Winogrande | Accuracy | 85,40 |
| TruthfulQA | MC Accuracy | 75,40 |

No se han publicado resultados de benchmarks adicionales ni comparaciones con modelos similares en la información disponible. Los valores anteriores proceden del campo `model-index` de la model card y están marcados como no verificados (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa 22,6 GB, por lo que se necesitan al menos 24 GB de VRAM o memoria unificada para cargar el modelo completo en GPU.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con menos de 24 GB sería necesario usar cuantizaciones menores (Q4_K_M, Q5_K_M) no incluidas en este repositorio.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB, siempre que se reserve margen para el contexto y el KV cache. En Mac con memoria unificada de 32 GB o superior también es viable.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio. El repositorio no incluye pesos en safetensors para vLLM o TGI; para esos motores habría que usar el modelo base.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con aproximadamente 4.000 millones de parámetros activos, el throughput debería ser superior al de un modelo denso de 26.000 millones, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. Como referencia estructural, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fnerky/WaifuGemma4-26b-a4b-v1-Q6_K-GGUF | 25.233.142.046 | ~4.000 millones | no disponible | Apache 2.0 | GGUF Q6_K |
| hiwaifu-research/WaifuGemma4-26b-a4b-v1 | 25.233.142.046 | ~4.000 millones | no disponible | Apache 2.0 | safetensors |
| Otros modelos MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones con alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Los benchmarks proceden del autor y están marcados como no verificados; deben tomarse como indicativos y no como resultados reproducidos de forma independiente.
- El modelo está orientado a roleplay y conversación, lo que puede producir respuestas con sesgo hacia la narrativa o el personaje en contextos donde se espera neutralidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; TruthfulQA MC Acc de 75,40 sugiere margen de mejora en veracidad.
- No se documenta la longitud de contexto nativa, lo que impide garantizar ventanas largas en producción sin pruebas empíricas.
- Aunque soporta 17 idiomas, no se aportan métricas por idioma; el rendimiento en castellano no está verificado de forma específica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de la familia Gemma 4 y el autor no detalla posibles términos adicionales de la licencia original de Gemma; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- La cuantización Q6_K introduce una pérdida de precisión respecto a los pesos originales en safetensors; para tareas sensibles a la exactitud numérica se recomienda validar contra el modelo base.
- No se documenta soporte de tool calling, agentes o visión, por lo que no debe asumirse en integraciones que dependan de estas capacidades.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/fnerky/WaifuGemma4-26b-a4b-v1-Q6_K-GGUF
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
