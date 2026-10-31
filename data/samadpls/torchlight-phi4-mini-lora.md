# samadpls/torchlight-phi4-mini-lora

## Resumen

torchlight-phi4-mini-lora es un adaptador LoRA (en formato PEFT) que especializa a Phi-4-mini-instruct, un modelo de 3.8B parámetros de Microsoft, en la resolución de dudas sobre PyTorch. Ha sido desarrollado por Abdul Samad (samadpls) y entrenado sobre 6.918 conversaciones extraídas de los foros oficiales de PyTorch (discuss.pytorch.org), donde la mayoría de las respuestas corresponden al mensaje que resolvió el hilo, muchas de ellas escritas por el usuario ptrblck, moderador muy activo de la comunidad.

El problema que resuelve es claro: los modelos pequeños suelen "inventar" soluciones a errores de PyTorch en lugar de pedir información adicional. El entrenamiento de torchlight incorpora explícitamente este comportamiento: si la pregunta contiene suficiente detalle, propone una corrección concreta; si no, solicita el código o el mensaje de error completo. Esto lo hace útil como asistente de depuración para desarrolladores que trabajan con PyTorch.

Es relevante como ejemplo de fine-tuning eficiente y accesible: el entrenamiento se completó en 6,3 horas en un MacBook Pro con chip M3 Pro, entrenando solo 11,5M de parámetros mediante LoRA. Existen tres versiones del modelo: el modelo completo en 16 bits (`samadpls/torchlight-phi4-mini`), este adaptador LoRA (PEFT y mlx-lm) y archivos GGUF en Q4_K_M y Q8_0 (`samadpls/torchlight-phi4-mini-GGUF`).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (base Phi-4-mini-instruct) con adaptador LoRA |
| Parametros totales | 3.800 millones (modelo base) |
| Parametros activos | 11,5 millones entrenados con LoRA (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-4-mini-instruct) |
| Tipos de cuantizacion | Adaptador en 16 bits (safetensors); versiones GGUF Q4_K_M y Q8_0 en el repo GGUF |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); version GGUF separada; incluye carpeta mlx/ para mlx-lm |

## Arquitectura y entrenamiento

El modelo parte de Phi-4-mini-instruct, un transformer decodificador de 3,8B parámetros de Microsoft. Sobre él se entrena un adaptador LoRA mediante la librería PEFT, actualizando únicamente 11,5M de parámetros frente a los 3,8B totales. Esto permite entrenar en hardware de consumo: el autor reporta 6,3 horas de entrenamiento en un MacBook Pro con M3 Pro. También se distribuye una versión convertida a MLX para su uso nativo en Apple Silicon con mlx-lm.

El conjunto de entrenamiento es `samadpls/torchlight-threads`, con 6.918 conversaciones procedentes de los foros de PyTorch. La mayoría de las conversaciones terminan con la respuesta que resolvió el hilo; el resto enseñan al modelo a pedir detalles que faltan (por ejemplo, un fragmento de código mínimo ejecutable o el mensaje de error completo) en lugar de adivinar. El modelo fue entrenado con un system prompt específico que debe usarse en inferencia: "You are a careful PyTorch helper. Give specific, correct guidance with code where it helps. If a question lacks the details needed to answer it, ask for them, for example a minimal executable code snippet or the full error message, instead of guessing."

No hay información disponible sobre el uso de RLHF o DPO, ni sobre el número exacto de tokens de entrenamiento.

## Capacidades

- Respuesta a preguntas técnicas sobre PyTorch: configuración de dispositivos, tensores, errores comunes y depuración.
- Depuracion de codigo: sugiere correcciones concretas cuando la pregunta incluye suficiente detalle (codigo o traza de error).
- Solicitud de informacion faltante: en lugar de alucinar, pide al usuario el codigo o el error completo cuando la pregunta es ambigua (comportamiento entrenado explicitamente).
- Generacion de codigo con APIs reales de PyTorch: en la evaluacion, el 90-100% de las respuestas con codigo usaban solo APIs reales de torch (por ejemplo, 9 de 10 sin busqueda).
- Respuestas breves: mediana de 31 tokens por respuesta, frente a 690 del modelo base.
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistente de depuracion de PyTorch para desarrolladores: dado un mensaje de error o un fragmento de codigo problematico, el modelo sugiere la correccion basandose en soluciones reales que resolvieron hilos del foro; es adecuado porque su entrenamiento procede exactamente de ese tipo de interacciones.
- Chatbot de soporte para comunidades o equipos que usan PyTorch: puede integrarse en Slack, Discord o un foro interno para responder dudas frecuentes con respuestas cortas (mediana de 31 tokens) y rapidas.
- Asistente local en portatil (Apple Silicon): gracias a la version mlx-lm y a los GGUF Q4_K_M/Q8_0, un desarrollador puede consultar dudas de PyTorch sin conexion y sin enviar codigo propietario a la nube.
- Capa de primer filtro antes de escalar a un modelo grande: dado que pide detalles cuando faltan y responde dudas comunes, puede resolver la mayoria de consultas simples y derivar solo las complejas a un modelo mayor o a un humano.
- Generacion aumentada con documentacion del foro: combinado con busqueda sobre los foros de PyTorch (RAG), el modelo afinado mantiene una nota media de 1,95 sobre 5, lo que lo hace apto como generador en pipelines RAG especializados.
- Herramienta educativa para principiantes en PyTorch: sus respuestas breves y concretas, con codigo cuando ayuda, sirven como primera orientacion antes de consultar documentacion o foros.
- Integracion en IDEs o extensiones de editor: su tamano de 3,8B y su baja latencia permiten ejecutarlo en local y ofrecer sugerencias de depuracion en tiempo real mientras se escribe codigo.
- Caso de referencia para fine-tuning eficiente: el proyecto demuestra que con un portatil y 6,3 horas se puede especializar un modelo en un dominio tecnico, util como plantilla para equipos con presupuestos limitados.

## Benchmarks y rendimiento

Evaluacion con 260 preguntas reales del foro de PyTorch publicadas entre 2025-01-01 y 2026-10-08 (posteriores al corte de conocimiento del modelo). Claude Opus 5.5 actuo como juez, puntuando cada respuesta de 1 a 5 en comparacion con la respuesta que resolvio el hilo:

| Modelo | Nota media (sobre 5) | Puntuadas 4 o 5 | Respuestas erroneas (nota 1) | Codigo solo con APIs reales de torch | Pidio detalles cuando faltaban | Pidio detalles sin necesidad |
|---|---|---|---|---|---|---|
| Phi-4-mini (base) | 1,88 | 5% | 39% | 170 de 175 | 0 de 7 | 0% |
| Phi-4-mini + busqueda foro | 1,75 | 5% | 45% | 145 de 157 | 1 de 7 | 2% |
| torchlight (afinado) | 1,97 | 7% | 27% | 9 de 10 | 0 de 7 | 7% |
| torchlight + busqueda foro | 1,95 | 6% | 26% | 4 de 4 | 0 de 7 | 2% |

Conclusiones reportadas por el autor:

- Menos respuestas erroneas: 27% de notas 1 frente a 39% del modelo base (71 frente a 102 respuestas), diferencia estadisticamente significativa (p = 0,003).
- Supera al modelo base con busqueda en foro: 1,97 frente a 1,75 (intervalo de confianza del 95%: +0,09 a +0,35). La busqueda degrada al modelo base pequeno (media de 1,35 en las 23 preguntas donde busco).
- Respuestas cortas y rapidas: mediana de 31 tokens frente a 690 del base; respondio las 260 preguntas en 9 minutos frente a 32 del base.
- El test es dificil por diseno: solo el 5-7% de las respuestas de modelos pequenos alcanzan nota 4 o 5, ya que exigen exactamente la correccion que resolvio el hilo.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; el modelo completo en 16 bits ocupa en torno a 7-8 GB (3,8B de parametros), y el adaptador LoRA solo 0,1 GB de repo, que se aplica sobre el modelo base.
- El entrenamiento se realizo en un MacBook Pro con M3 Pro (sin GPU dedicada), lo que indica que la inferencia es viable en hardware de consumo.
- Consumer GPUs: viable en GPUs con 8 GB o mas de VRAM para el modelo en 16 bits; con las versiones GGUF Q4_K_M (en torno a 2-3 GB) cabe en portatiles y en maquinas sin GPU dedicada.
- Apple Silicon: soporte nativo via mlx-lm con la carpeta mlx/ del adaptador.
- Opciones de despliegue: transformers + PEFT (con posibilidad de fusionar el adaptador con merge_and_unload), mlx-lm, llama.cpp, Ollama y LM Studio (via el repo GGUF).
- Latencia y throughput: no se publican cifras absolutas; se reporta que respondio 260 preguntas en 9 minutos (unos 2 segundos por pregunta de media en el hardware de prueba) con respuestas de mediana 31 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| torchlight (Phi-4-mini + LoRA) | 3,8B (11,5M entrenados) | Especializado en PyTorch | MIT | safetensors (PEFT), mlx-lm, GGUF (Q4_K_M, Q8_0) |
| Phi-4-mini-instruct (base) | 3,8B | Uso general instruct | MIT | safetensors, GGUF comunitarios |
| torchlight-phi4-mini (modelo completo) | 3,8B | Especializado en PyTorch, fusionado | MIT | safetensors 16 bits, mlx-lm |

Comparativa cualitativa: frente al modelo base, torchlight reduce las respuestas erroneas de 39% a 27% en su dominio y produce respuestas mucho mas cortas (mediana de 31 frente a 690 tokens), a costa de estar limitado al ingles y al dominio de PyTorch. Frente a modelos generales grandes (Claude Opus 5.5, usado como juez en la evaluacion), torchlight es mucho menor y gratuito de ejecutar en local, aunque alcanza nota 4 o 5 solo en el 7% de preguntas dificiles. No hay datos comparativos con otros modelos especializados en PyTorch en la informacion disponible.

## Limitaciones y advertencias

- Idioma: entrenado y evaluado solo en ingles; no hay soporte declarado para castellano ni otros idiomas.
- Dominio restringido: esta especializado en PyTorch; su rendimiento en otras tareas (codigo general, matematicas, razonamiento general) no esta evaluado y puede haberse degradado respecto al modelo base por catastrofic forgetting.
- Tasa de error significativa: aun afinado, el 27% de sus respuestas fueron calificadas como erroneas (nota 1) en el test; no debe usarse como fuente unica de verdad sin verificacion humana.
- System prompt obligatorio: el modelo fue entrenado con un system prompt concreto; usar otro puede degradar el comportamiento de peticion de detalles.
- Preguntas posteriores a su corte de conocimiento: el test usa preguntas de 2025-2026 y los resultados son modestos (nota media 1,97 sobre 5); para versiones recientes de PyTorch conviene combinarlo con RAG.
- Tendencia a pedir detalles: en el 7% de los casos pidio informacion adicional sin necesidad, lo que puede resultar molesto en preguntas simples.
- Licencia: MIT, sin restricciones para uso comercial del adaptador; no obstante, conviene revisar los terminos de uso del modelo base Phi-4-mini-instruct de Microsoft.
- Riesgo de alucinacion: reducido pero no eliminado; el entrenamiento explicito contra adivinar mitiga el problema, y el uso de APIs reales de torch en el codigo generado es alto (9 de 10 sin busqueda) pero no total.
- Sesgos: los datos proceden de los foros de PyTorch, con fuerte presencia de respuestas de un unico autor (ptrblck), lo que puede introducir sesgos de estilo y de enfoque en las soluciones.
- Metricas de uso muy bajas (11 descargas, 1 like en el momento de la ficha): proyecto de un autor individual, sin auditoria comunitaria amplia; validar en produccion antes de dependencias criticas.

## Enlaces

- Modelo (adaptador LoRA): https://huggingface.co/samadpls/torchlight-phi4-mini-lora
- Modelo completo (16 bits): https://huggingface.co/samadpls/torchlight-phi4-mini
- Version GGUF: https://huggingface.co/samadpls/torchlight-phi4-mini-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/samadpls/torchlight-threads
- Codigo del proyecto: https://github.com/samadpls/torchlight
- Web del autor: https://samadpls.com
- Foro de PyTorch (fuente de los datos): https://discuss.pytorch.org
