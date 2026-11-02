# hisefath/reno-ai-intake-qwen3-1.7b

## Resumen

Reno AI intake es un ajuste fino mediante LoRA del modelo Qwen3-1.7B de Alibaba, publicado por el usuario hisefath. Su propósito es muy concreto: convertir la descripción desordenada de una reforma de baño de un propietario de Nueva York en un único turno JSON estrictamente estructurado. El modelo rellena un campo del trabajo solo cuando puede citar literalmente las palabras del propietario, nunca adivina un dato que afecte al precio y formula exactamente una pregunta sobre el detalle más relevante que aún falta. Mantiene este comportamiento a lo largo de conversaciones de hasta seis turnos, incluyendo respuestas cortas, preguntas aclaratorias y negativas a responder.

Se trata de un modelo pequeño (1.720.574.976 parámetros, aproximadamente 1,7 mil millones) con una ventana de contexto heredada de Qwen3-1.7B, licencia Apache 2.0 y pesos en safetensors estándar de `Qwen3ForCausalLM`, ya que el adaptador LoRA se ha fusionado con la base. Está pensado para integrarse como paso de intake en una aplicación de presupuestación de reformas, siempre detrás de un validador que rechace cualquier cita que no aparezca en las palabras del usuario.

Su relevancia radica en el enfoque: en lugar de un modelo generalista, es un especialista entrenado para una única tarea con un contrato de salida rígido y una política explícita de "preguntar en vez de adivinar". El autor documenta el proceso completo, incluyendo datos de entrenamiento, curvas de eficiencia de datos con adaptadores de 0,6B y una comparativa de evaluación sobre un conjunto retenido, lo que lo convierte en un caso de estudio útil para quienes diseñan sistemas de extracción estructurada con modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA fusionado en los pesos base |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M disponibles en repositorio separado; safetensors en precision completa |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B en precision completa y se ajusta con LoRA mediante TRL y PEFT: rango 16, una epoca, tasa de aprendizaje 1e-4, tamano de lote 8 y funcion de perdida calculada unicamente sobre la respuesta del asistente. El entrenamiento se ejecuto en una NVIDIA A100 de 80 GB en Colab Pro, con una duracion de 588 segundos y una perdida final de entrenamiento de 0,094. Las versiones de software fueron torch 2.11.0, transformers 5.22.1, TRL 1.17.1 y PEFT 0.21.2. Los pesos LoRA se fusionaron con la base, de modo que el repositorio contiene safetensors estándar de `Qwen3ForCausalLM` listos para cargar con transformers.

Los datos de entrenamiento son 3.000 filas (un turno del asistente por fila) del dataset `hisefath/reno-ai-bathroom-intake`, subconjunto `n3000v4/train.jsonl` con semilla 3, mas 60 filas de desarrollo compartidas. La composicion es: 1.100 filas del pool original (primeros turnos y primeras respuestas), 300 de formatos de tamano v2, 350 de respuestas de tamano tras un nivel de acabado conocido, 250 de primeros turnos v3 y 1.000 de conversaciones multiturno v4 (turnos 2 a 6, respuestas cortas, preguntas aclaratorias, "no lo se" y evasivas). El modelo profesor (Gemini 3.7 Flash) escribe unicamente las palabras del propietario, mientras que cada etiqueta se construye por codigo a partir del escenario. Las filas v4 se anadieron tras una prueba en vivo en la que el modelo anterior ignoraba las respuestas del propietario a partir del tercer turno.

## Capacidades

- Generacion de texto conversacional en ingles con salida JSON estricta de un unico turno.
- Extraccion de entidades y campos de trabajo (tamano, nivel de acabado, sanitarios, distribucion, alicatado de pared, suelo, estado) condicionada a citas literales del usuario.
- Formulacion de exactamente una pregunta por turno sobre el detalle que mas afecta al precio y que aun falta.
- Gestion de conversaciones multiturno de hasta seis turnos, incluyendo respuestas breves ("mid range"), preguntas aclaratorias ("what's mid range?") y negativas a responder ("I don't know").
- Resistencia a presiones para adivinar, incluyendo cuando el propietario cita el precio de otro contratista.
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No soporta vision, audio ni modo de razonamiento extendido (el autor recomienda desactivar el thinking con `enable_thinking=False`).
- Capacidad multilingue limitada al ingles; no se ha entrenado ni probado en otros idiomas.

## Casos de uso

- Paso de intake en una aplicacion de presupuestacion de reformas: el propietario describe el trabajo, el modelo registra lo que ha dicho y pregunta por lo que falta, y un contratista presupuesta a partir del registro final. Es adecuado porque el contrato de salida JSON y la politica de no adivinar encajan con la necesidad de datos fiables antes de cotizar.
- Normalizacion de descripciones ambiguas de medidas: el modelo acepta formatos como "5x8", "40 sq ft", "10 by 12" o "200 sqft" y los convierte en campos estructurados, lo que reduce el trabajo manual de transcripcion.
- Conversaciones de aclaracion multiturno: con hasta seis turnos de contexto, puede mantener un dialogo guiado donde cada respuesta del propietario actualiza el estado del trabajo sin perder informacion previa.
- Filtrado previo a la interaccion humana: al rechazar conjeturas y exigir citas literales, sirve como primera capa de captura de datos que un contratista revisa despues, minimizando errores costosos en la cotizacion.
- Despliegue en CPU o en hardware modesto: los GGUF Q8_0 y Q4_K_M permiten ejecutar el modelo con llama-cpp-python en CPU, lo que habilita demos locales o entornos sin GPU.
- Evaluacion y experimentacion con eficiencia de datos: el autor publica adaptadores con N = 50, 100, 200 y 400 filas en el repositorio del modelo de 0,6B, utiles para estudiar como escala el rendimiento con el tamano del dataset en tareas de extraccion estructurada.
- Integracion en pipelines de validacion: el modelo esta disenado para operar detras de `intake/reducer.apply_turn`, que rechaza cualquier cita no encontrada en las palabras del usuario antes de llegar al registro del trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que las puntuaciones se midieron con mlx-lm sobre el conjunto retenido `eval_heldout.jsonl`, pero no se incluyen los valores numericos en la informacion proporcionada. Los archivos GGUF no fueron evaluados sobre el conjunto retenido; las cifras mencionadas corresponden a los pesos de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16): aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-5 GB.
- VRAM estimada con cuantizacion Q8_0: aproximadamente 1,8-2 GB; con Q4_K_M: aproximadamente 1-1,2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para inferencia, solo se usaron para el entrenamiento.
- Cabe en GPU consumer: si, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien en Apple Silicon via mlx-lm.
- Opciones de despliegue: transformers, mlx-lm (ruta con la que se midieron las puntuaciones), llama.cpp con llama-cpp-python en CPU mediante los GGUF, y potencialmente vLLM u Ollama al ser safetensors estandar de Qwen3, aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento LoRA completo tardo 588 segundos en una A100 80GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Reno AI intake Qwen3-1.7B | 1.720.574.976 | No disponible | Apache 2.0 | HuggingFace, GGUF en repo separado | Especialista en intake de reformas de bano, salida JSON estricta |
| Reno AI intake Qwen3-0.6B | No disponible en la informacion | No disponible | Apache 2.0 (presumible, mismo autor) | HuggingFace | Version anterior del mismo proyecto, incluye adaptadores de eficiencia de datos N = 50, 100, 200, 400 |
| Qwen3-1.7B (base) | 1.720.574.976 | No disponible | Apache 2.0 | HuggingFace | Modelo generalista sin ajuste para intake estructurado; no sigue el contrato JSON ni la politica de no adivinar |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numerico entre estas alternativas.

## Limitaciones y advertencias

- El modelo sigue produciendo algunas afirmaciones no respaldadas por las palabras del usuario; el autor advierte explicitamente que no debe usarse sin el validador `intake/reducer.apply_turn`.
- Entrenado y probado unicamente para reformas de bano en la ciudad de Nueva York y en ingles; no se ha evaluado en otras habitaciones, otros oficios ni otras ciudades.
- No debe usarse para dar precios, estimaciones ni consejos de reparacion; esta entrenado para no hacerlo, pero no hay garantia absoluta.
- Riesgo de alucinacion en la extraccion de campos si se usa fuera del formato de prompt y estado de conversacion entrenado (`intake/prompts/trained.v1.md` renderizado por `intake/prompting.py`).
- Requiere desactivar el modo thinking (`enable_thinking=False`); el comportamiento con thinking activado no esta documentado.
- Los archivos GGUF no fueron evaluados sobre el conjunto retenido, por lo que su fidelidad respecto a los pesos originales no esta verificada numericamente.
- Cualquier decision sobre un trabajo real debe pasar por la revision de un contratista; el modelo es una herramienta de captura de datos, no un sustituto del juicio profesional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hisefath/reno-ai-intake-qwen3-1.7b
- Modelo anterior de 0,6B: https://huggingface.co/hisefath/reno-ai-intake-qwen3-0.6b
- GGUF (Q8_0 y Q4_K_M): https://huggingface.co/hisefath/reno-ai-intake-qwen3-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/hisefath/reno-ai-bathroom-intake
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
