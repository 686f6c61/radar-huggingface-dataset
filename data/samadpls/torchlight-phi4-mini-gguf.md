# samadpls/torchlight-phi4-mini-GGUF

## Resumen

torchlight-phi4-mini-GGUF es la versión cuantizada en formato GGUF de torchlight, un modelo de lenguaje especializado en resolver dudas sobre PyTorch. Fue desarrollado por Abdul Samad (samadpls) a partir de Phi-4-mini-instruct de Microsoft (3.8B parámetros), afinado mediante LoRA con 6.918 conversaciones extraídas de los foros oficiales de PyTorch, donde la mayoría de las respuestas corresponden al mensaje que resolvió el hilo (muchas de ellas escritas por el usuario ptrblck). El objetivo del proyecto es ofrecer un asistente pequeño y ejecutable localmente que responda preguntas técnicas de PyTorch con soluciones concretas y que, cuando falta información, pida el código o el error completo en lugar de inventar una respuesta.

La relevancia del modelo radica en su enfoque de dominio estrecho y su ligereza: con 3.8B de parámetros y cuantizaciones Q4_K_M (2,5 GB) y Q8_0 (4,1 GB), funciona en portátiles y equipos sin GPU dedicada vía llama.cpp, Ollama o LM Studio. El propio autor documenta una evaluación sobre 260 preguntas reales del foro publicadas después del entrenamiento, en la que el modelo afinado reduce las respuestas erróneas del 39% al 27% respecto al modelo base y genera respuestas mucho más breves (mediana de 31 tokens frente a 690). La licencia MIT permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Phi-4-mini / Phi-3), afinado con LoRA |
| Parametros totales | 3.836.021.856 (3,8B) |
| Parametros activos | no disponible (no es MoE; 11,5M de parámetros entrenados con LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (2,5 GB), Q8_0 (4,1 GB) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (esta repo); también disponibles versión completa en 16 bits (safetensors) y adaptador LoRA en repos separados |

## Arquitectura y entrenamiento

El modelo parte de Phi-4-mini-instruct, un transformer decoder de 3,8B parámetros de Microsoft. Sobre esa base se aplicó fine-tuning eficiente con LoRA, entrenando 11,5M de parámetros durante 6,3 horas en un MacBook Pro con chip M3 Pro, lo que demuestra que el entrenamiento completo es reproducible en hardware de consumo sin GPU dedicada.

El dataset de entrenamiento, samadpls/torchlight-threads, contiene 6.918 conversaciones procedentes de los foros de PyTorch (discuss.pytorch.org). La mayoría de las conversaciones terminan con la respuesta que resolvió el hilo; el resto enseñan al modelo a solicitar detalles que faltan (un snippet de código mínimo ejecutable o el mensaje de error completo) en lugar de adivinar. Esta conducta de "no adivinar" fue un objetivo explícito del entrenamiento. No se ha publicado información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Resolución de dudas sobre PyTorch: errores de entrenamiento, tensores, dispositivos, DataLoader, autograd y temas habituales del foro oficial.
- Respuestas concisas y directas: mediana de 31 tokens por respuesta en la evaluación del autor.
- Comportamiento de solicitud de aclaraciones: pide código o error completo cuando la pregunta no contiene detalles suficientes.
- Generación de código con APIs reales de torch: en la evaluación, 9 de 10 respuestas con código usaron solo APIs reales de PyTorch.
- Ejecución local en CPU o GPU de consumo mediante llama.cpp, Ollama y LM Studio.
- No soporta tool calling: ninguna conversación de entrenamiento incluyó herramientas y, en la evaluación, el modelo nunca usó la herramienta de búsqueda de foro que se le ofreció.

## Casos de uso

- Asistente de depuración para desarrolladores de PyTorch: integrable en un IDE o terminal para diagnosticar errores de entrenamiento; el modelo pide el stack trace completo cuando falta contexto, evitando sugerencias inventadas.
- Soporte técnico en comunidades y foros: puede actuar como primer nivel de respuesta en un foro o Discord de PyTorch, resolviendo dudas frecuentes con el estilo de las respuestas que históricamente resolvieron los hilos.
- Ejecución offline en portátiles: con 2,5 GB en Q4_K_M, es adecuado para desarrolladores que trabajan sin conexión o en entornos restringidos donde no pueden enviar código a APIs externas.
- Asistente de onboarding para equipos de ML: los recién incorporados pueden consultar dudas básicas de PyTorch sin saturar a ingenieros senior, con respuestas cortas y accionables.
- Prototipado de asistentes de dominio estrecho: el proyecto (código y dataset públicos) sirve como referencia para replicar el enfoque de fine-tuning con LoRA sobre datos de foros en otros dominios técnicos.
- Integración en pipelines de CI para triaje de issues: puede clasificar y sugerir soluciones preliminares a issues de repositorios PyTorch antes de la revisión humana.
- Chatbot embebido en documentación: dado su tamaño y latencia baja, puede desplegarse junto a la documentación de una librería basada en PyTorch.

## Benchmarks y rendimiento

Evaluación publicada por el autor: 260 preguntas reales del foro de PyTorch (2025-01-01 a 2026-10-08), puntuadas de 1 a 5 por Claude Opus 5.5 comparando con la respuesta que resolvió el hilo.

| Modelo | Nota media (sobre 5) | Respuestas 4-5 | Respuestas erróneas (nota 1) | Código con APIs reales de torch | Pide detalles cuando faltan | Pide detalles cuando no hace falta |
|---|---|---|---|---|---|---|
| Phi-4-mini (base) | 1,88 | 5% | 39% (102/260) | 170 de 175 | 0 de 7 | 0% |
| Phi-4-mini + búsqueda en foro | 1,75 | 5% | 45% | 145 de 157 | 1 de 7 | 2% |
| torchlight (afinado) | 1,97 | 7% | 27% (71/260) | 9 de 10 | 0 de 7 | 7% |
| torchlight + búsqueda en foro | 1,95 | 6% | 26% | 4 de 4 | 0 de 7 | 2% |

Datos adicionales publicados: la reducción de respuestas erróneas (39% a 27%) es estadísticamente significativa (p = 0,003); la mejora en nota media sobre el base con búsqueda (1,97 frente a 1,75) tiene un intervalo del 95% de +0,09 a +0,35. La mediana de longitud de respuesta es de 31 tokens (frente a 690 del base) y respondió las 260 preguntas en 9 minutos frente a 32. El propio autor advierte que las mejoras en nota media y en respuestas de 4-5 son pequeñas y no concluyentes, y que un modelo base mayor o más reciente probablemente obtendría mejores resultados.

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: 2,5 GB para Q4_K_M y 4,1 GB para Q8_0, más overhead de contexto; ejecutable íntegramente en CPU o en memoria unificada.
- GPU recomendadas: no requiere GPU dedicada. Es viable en cualquier GPU de consumo con más de 4 GB de VRAM (por ejemplo RTX 3060 o superior) y en Apple Silicon (el entrenamiento se realizó en un M3 Pro).
- Consumer GPUs: cabe con holgura en GPUs de gama media y en portátiles; en CPU x86 moderna la inferencia es plenamente funcional dado el tamaño de 3,8B.
- Opciones de despliegue: llama.cpp (`llama-cli -hf samadpls/torchlight-phi4-mini-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/samadpls/torchlight-phi4-mini-GGUF:Q4_K_M`), LM Studio. Las versiones no cuantizadas funcionan con transformers, mlx-lm y PEFT (adaptador LoRA).
- Latencia y throughput: el autor reporta que el modelo respondió 260 preguntas en 9 minutos en su configuración de prueba; no se han publicado cifras de tokens por segundo.
- Recomendación de uso: aplicar el system prompt con el que fue entrenado ("You are a careful PyTorch helper..."), ya que el modelo fue afinado con él.

## Comparativa con modelos similares

| Modelo | Parametros | Especialización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| torchlight-phi4-mini-GGUF | 3,8B | PyTorch (fine-tuning sobre foros) | no disponible | MIT | GGUF (Q4_K_M, Q8_0) |
| Phi-4-mini-instruct (base) | 3,8B | Generalista (instrucción, razonamiento, código) | no disponible | MIT | safetensors |
| torchlight-phi4-mini (completo) | 3,8B | PyTorch (fine-tuning sobre foros) | no disponible | MIT | safetensors 16 bits |
| torchlight-phi4-mini-lora | 3,8B (adaptador de 11,5M entrenados) | PyTorch | no disponible | MIT | Adaptador LoRA (PEFT, mlx-lm) |

Frente al modelo base, torchlight ofrece respuestas más cortas, menos erróneas y alineadas con el estilo del foro de PyTorch, a costa de un alcance limitado al dominio y de no utilizar herramientas. No hay datos comparativos publicados frente a otros modelos especializados en código de tamaño similar.

## Limitaciones y advertencias

- Conocimiento limitado por el tamaño del modelo base (3,8B): el propio autor señala que un modelo base mayor o más reciente probablemente rendiría mejor; el fine-tuning aporta estilo y conducta, no conocimiento profundo adicional.
- Tasa de error significativa: el 27% de las respuestas en la evaluación se calificaron como erróneas (nota 1), por lo que sus sugerencias deben revisarse antes de aplicarse en producción.
- Cobertura temporal: el modelo se evaluó con preguntas posteriores a su datos de entrenamiento y rindió de forma modesta (solo 5-7% de respuestas de nota 4-5); puede no conocer APIs o cambios recientes de PyTorch.
- Sin soporte de tool calling ni agentes: no fue entrenado con herramientas y no las utiliza, lo que limita su uso en flujos agénticos.
- Idioma: entrenado y evaluado solo en inglés; su rendimiento en castellano no está documentado.
- Conducta de aclaración imperfecta: en la evaluación pidió detalles innecesarios en el 7% de los casos y no los pidió en ninguno de los 7 casos donde faltaban.
- Contexto y alucinaciones: la longitud de contexto no está publicada; al ser un modelo pequeño afinado, persiste el riesgo de alucinación en preguntas fuera del dominio PyTorch.
- Licencia: MIT, sin restricciones para uso comercial.
- Proyecto de autor individual con métricas de adopción muy bajas (32 descargas, 2 likes en el momento de la ficha): conviene validarlo internamente antes de cualquier despliegue serio.

## Enlaces

- Modelo GGUF: https://huggingface.co/samadpls/torchlight-phi4-mini-GGUF
- Modelo completo (16 bits): https://huggingface.co/samadpls/torchlight-phi4-mini
- Adaptador LoRA: https://huggingface.co/samadpls/torchlight-phi4-mini-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/samadpls/torchlight-threads
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de código: https://github.com/samadpls/torchlight
- Foro de PyTorch (fuente de los datos): https://discuss.pytorch.org
- Web del autor: https://samadpls.com
