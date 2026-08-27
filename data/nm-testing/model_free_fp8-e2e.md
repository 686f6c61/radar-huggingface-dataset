# nm-testing/model_free_fp8-e2e

## Resumen

El modelo `nm-testing/model_free_fp8-e2e` es una versión cuantizada en FP8 del conocido TinyLlama-1.1B-Chat, un modelo de lenguaje pequeño (1.100 millones de parámetros) desarrollado por el proyecto TinyLlama y posteriormente ajustado para conversación siguiendo la receta de Zephyr. La cuantización FP8, aplicada mediante la librería `compressed-tensors`, reduce el tamaño del modelo a aproximadamente 2,5 GB, lo que lo hace especialmente adecuado para entornos con recursos limitados, como GPUs de consumo o inferencia en el borde.

El modelo base fue preentrenado sobre 3 billones de tokens (SlimPajama y Starcoder) y después afinado con SFT sobre UltraChat y alineado con DPO sobre UltraFeedback. Esta versión concreta, publicada por el usuario `nm-testing`, mantiene la arquitectura Llama 2 y el tokenizer original, por lo que es compatible con el ecosistema de herramientas existente. Su relevancia actual radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para tareas de chat y generación de código, con un coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 2) |
| Parametros totales | 1.100.048.384 (1,1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base TinyLlama usa 2048 tokens) |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Llama 2: un transformer decoder-only con atención causal, normalización RMSNorm, activación SiLU y embeddings rotatorios (RoPE). El tokenizer es el mismo que el de Llama 2, con un vocabulario de 32.000 tokens. El preentrenamiento se realizó sobre 3 billones de tokens combinando SlimPajama (texto general) y Starcoder (código), lo que le confiere una doble capacidad lingüística y de programación.

Posteriormente, el modelo fue afinado en dos fases: primero con SFT (supervised fine-tuning) sobre el dataset UltraChat, que contiene diálogos sintéticos generados por ChatGPT, y después con DPO (Direct Preference Optimization) sobre UltraFeedback, un conjunto de 64.000 prompts con respuestas rankeadas por GPT-4. Esta receta, tomada de Zephyr, busca mejorar la calidad de las respuestas y la alineación con preferencias humanas. La versión aquí presentada añade una cuantización FP8 que reduce el tamaño de los pesos sin cambios arquitectónicos, manteniendo la compatibilidad con el código original.

## Capacidades

- Generacion de texto y chat conversacional multi-turno, con soporte de plantillas de chat (chat template) integradas en el tokenizer.
- Generacion de codigo en multiples lenguajes (Python, JavaScript, etc.) gracias al entrenamiento con Starcoder.
- Razonamiento basico y resolucion de problemas matematicos sencillos, aunque limitado por su tamano.
- Capacidad de seguir instrucciones y mantener el estilo solicitado (por ejemplo, responder como un pirata).
- Solo soporta ingles; no se han documentado capacidades multilingues.
- No se ha confirmado soporte de tool calling, function calling ni uso como agente autonomo.
- No incluye capacidades de vision ni audio; es exclusivamente texto.

## Casos de uso

- Asistente de chat ligero para aplicaciones moviles o web: el modelo puede integrarse en un backend con vLLM o llama.cpp para ofrecer respuestas conversacionales con baja latencia, gracias a su tamano reducido y cuantizacion FP8.
- Generacion de codigo en entornos de desarrollo: puede usarse como autocompletado o generador de funciones simples en editores de codigo, aprovechando su entrenamiento con Starcoder.
- Prototipado rapido de chatbots: su licencia Apache 2.0 permite experimentar sin restricciones comerciales, ideal para validar ideas antes de migrar a modelos mayores.
- Educacion y aprendizaje: sirve como ejemplo didactico de un modelo de lenguaje pequeno con pipeline completo de preentrenamiento, SFT y DPO, util para cursos de IA.
- Inferencia en el borde (edge): con un peso de ~2,5 GB en FP8, puede ejecutarse en dispositivos con 4 GB de RAM o menos, como Raspberry Pi 5 o mini-PCs, para asistentes locales.
- Filtrado y clasificacion de texto: aunque no esta optimizado para ello, puede usarse para tareas de clasificacion simple o extraccion de informacion con prompts adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base TinyLlama reporta valores en MMLU, HumanEval y otros, pero esta version cuantizada no incluye mediciones propias. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion FP8, los pesos ocupan aproximadamente 1,1 GB, mas overhead de activaciones y cache, por lo que se necesitan entre 2 y 3 GB de VRAM para inferencia con batch pequeno.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3050, o incluso iGPUs con suficiente memoria compartida. En el lado profesional, una T4 o A10 es mas que suficiente.
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers y PyTorch. La cuantizacion FP8 requiere soporte de `compressed-tensors` o de la libreria de inferencia correspondiente.
- Latencia y throughput: no hay datos publicados, pero por su tamano se espera una generacion de 20-50 tokens/segundo en una GPU consumer media (RTX 3060) con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| nm-testing/model_free_fp8-e2e | 1,1B | no disponible (base 2048) | Apache 2.0 | FP8 | Version cuantizada de TinyLlama-Chat |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | Apache 2.0 | BF16/FP16 | Modelo original sin cuantizar |
| Qwen/Qwen1.5-1.8B-Chat | 1,8B | 32768 | Apache 2.0 | FP16 | Mayor contexto y tamano, pero mas pesado |
| Microsoft/Phi-2 | 2,7B | 2048 | MIT | FP16 | Mejor rendimiento en razonamiento, pero mas grande |

La comparativa se basa en especificaciones publicas; no se dispone de benchmarks comparativos para esta version concreta.

## Limitaciones y advertencias

- Contexto limitado: la ventana de contexto del modelo base es de 2048 tokens, lo que restringe conversaciones largas o documentos extensos.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion: como todo modelo pequeno, puede generar informacion falsa o inconsistente, especialmente en temas especializados.
- Sesgos: el entrenamiento con datos de codigo y texto general puede reflejar sesgos presentes en esos corpus; no se han realizado auditorias especificas.
- Rendimiento limitado en tareas complejas: su tamano reducido implica menor capacidad de razonamiento y comprension que modelos de 7B o superiores.
- La cuantizacion FP8 puede introducir una ligera perdida de precision en comparacion con el modelo original en BF16, aunque en la practica suele ser minima.
- No se ha verificado el soporte de tool calling ni de agentes; para esos casos se recomienda usar modelos mas grandes.

## Enlaces

- [HuggingFace: nm-testing/model_free_fp8-e2e](https://huggingface.co/nm-testing/model_free_fp8-e2e)
- [GitHub del proyecto TinyLlama](https://github.com/jzhang38/TinyLlama)
- [Modelo base TinyLlama-1.1B-Chat-v1.0](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)
- [Dataset UltraChat](https://huggingface.co/datasets/stingning/ultrachat)
- [Dataset UltraFeedback](https://huggingface.co/datasets/openbmb/UltraFeedback)
