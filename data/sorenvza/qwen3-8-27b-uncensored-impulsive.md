# Sorenvza/Qwen3.8-27B-Uncensored-Impulsive

## Resumen

Qwen3.8-27B-Uncensored-Impulsive es un modelo de generacion de texto derivado de la familia Qwen3, publicado por el usuario Sorenvza en HuggingFace. Se trata de un merge en precision BF16 nativa de un adaptador LoRA sobre el modelo base `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez parte de `Qwen/Qwen3.8-27B`. El fine-tuning se orienta a un estilo conversacional con una persona de personaje fuerte y a un uso bilingue indonesio-ingles, sin filtrado de contenido adicional sobre el modelo base.

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) almacenados en safetensors, con un repositorio de 53,8 GB en BF16. La arquitectura declarada en los tags es `qwen3_5_text`, propia de la familia Qwen3, y el entrenamiento se realizo con LoRA de rango 32 sobre los modulos de atencion y MLP, con perdida calculada unicamente sobre los tokens de respuesta del asistente.

Su relevancia es limitada y experimental: el autor lo marca explicitamente como no evaluado formalmente, con un dataset de unos 550K tokens procedentes de apenas 15 conversaciones largas. Es un modelo pensado para roleplay y conversacion con persona, no para tareas de razonamiento, codigo o produccion general. La licencia Apache 2.0 facilita su uso y redistribucion, pero la ausencia de evaluacion y el sesgo hacia los ejemplos de entrenamiento son limitaciones importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma oficial; el autor usa `--max-model-len 16384` en vLLM y entrena con muestras de hasta 8192 tokens |
| Tipos de cuantizacion | no disponible (el autor publica pesos en BF16 nativo; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con 26,9B parametros en BF16. Sobre el modelo base `orcarouter/Qwen3.8-27B-Uncensored` se aplico un adaptador LoRA con `r=32`, `lora_alpha=64`, `lora_dropout=0.05` y `use_rslora=False`, dirigido a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El adaptador se fusiono posteriormente en el modelo base en precision BF16 nativa, sin cuantizacion.

El entrenamiento consistio en 2 epocas con learning rate `1e-4`, scheduler coseno, 5% de warmup, weight decay 0.01 y batch efectivo de 2. El dataset son aproximadamente 15 conversaciones largas bilingues (50% indonesio, 50% ingles) con unos 550K tokens en total y una media de 37K tokens por conversacion. Se uso el formato ChatML de Qwen (`<|im_start|>` / `<|im_end|>`) con perdida solo sobre los tokens del asistente (system y user enmascarados), y las muestras de hasta 8192 tokens se dividen en los limites de mensaje para no descartar tokens. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de texto conversacional multi-turno con persona de personaje definida mediante system prompt.
- Roleplay y mantenimiento de contexto narrativo en conversaciones largas (el entrenamiento usa conversaciones de hasta 37K tokens de media).
- Conversacion bilingue indonesio-ingles.
- Modo thinking de Qwen3 (generacion de bloques `<think>`), que puede desactivarse con `enable_thinking: False`.
- Compatibilidad con endpoints OpenAI a traves de vLLM (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni matematicas avanzadas.

## Casos de uso

- Roleplay conversacional con personaje fijo: el modelo se entrena especificamente para mantener una persona definida por system prompt, con ejemplos de conversaciones largas y contexto rico; es adecuado para prototipos de chatbots de personaje.
- Prototipado de asistentes bilingues indonesio-ingles: la mezcla de datos al 50% permite probar flujos conversacionales en ambos idiomas, aunque el rendimiento por idioma no se ha evaluado por separado.
- Investigacion sobre merges LoRA: al estar publicado el adaptador fusionado en BF16 con hiperparametros documentados, sirve como caso de estudio de fine-tuning de persona con `r=32` sobre Qwen3.
- Generacion de dialogos para guiones o narrativa interactiva: la capacidad de recordar contexto largo en conversaciones de decenas de miles de tokens encaja con escritura asistida de escenas multi-turno.
- Pruebas de despliegue con vLLM: el autor documenta un comando `vllm serve` con `--reasoning-parser qwen3`, util para validar pipelines de inferencia OpenAI-compatibles.
- Evaluacion de sesgos y filtrado: al no tener filtrado adicional sobre el base, es util en entornos controlados para estudiar comportamiento de modelos sin censura y disenar capas de moderacion propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado formalmente y que las pruebas tempranas solo confirman el funcionamiento de la persona y el recuerdo de contexto, sin validar la consistencia en conversaciones largas ni en ambos idiomas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB solo para pesos (26,9B parametros x 2 bytes), mas overhead de KV cache; se recomienda al menos 80 GB para contexto de 16K tokens.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16.
- No cabe en GPU de consumo en BF16; en cuantizaciones de 4 bits (no publicadas por el autor) podria aproximarse a 16-20 GB, lo que permitiria RTX 4090 o RTX 3090, pero requeriria cuantizar el modelo por cuenta propia.
- Opciones de despliegue: vLLM (documentado por el autor con `--dtype bfloat16 --max-model-len 16384 --reasoning-parser qwen3`); llama.cpp, Ollama o TGI requeririan conversion o cuantizacion no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Impulsive | 26,9B | no disponible (uso documentado a 16K) | Apache 2.0 | HuggingFace, 0 descargas | Merge LoRA experimental, bilingue id/en |
| Qwen/Qwen3.8-27B (base) | 27B (segun nombre) | no disponible en la informacion | no disponible en la informacion | HuggingFace | Modelo base original, con filtrado estandar |
| orcarouter/Qwen3.8-27B-Uncensored | 27B (segun nombre) | no disponible en la informacion | no disponible en la informacion | HuggingFace | Base sin censura sobre la que se aplica el LoRA |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Variedad limitada: el dataset son unas 15 conversaciones y escenarios, por lo que el modelo puede quedarse cerca de los ejemplos de entrenamiento y no generalizar la persona a situaciones nuevas.
- Consistencia de persona no garantizada: el nombre y los rasgos del personaje pueden cambiar entre sesiones si el system prompt no los fija explicitamente.
- Fuga de razonamiento: el modelo tiende a generar texto `<think>` al inicio de las respuestas; conviene usar el reasoning parser del servidor o desactivar el thinking.
- Contexto largo no validado en inferencia: aunque el entrenamiento usa conversaciones muy largas, el rendimiento en contextos largos durante la inferencia no se ha comprobado.
- Fragmentos sin system prompt: algunas muestras de entrenamiento son trozos de conversaciones que no empiezan con system prompt, lo que debilita la persona en esos casos.
- Balance de idiomas no evaluado: los datos estan al 50% entre indonesio e ingles, pero no se ha medido el rendimiento por separado.
- Sin filtrado de contenido adicional sobre el base: las salidas pueden ser inapropiadas, sensibles o inexactas; el usuario es responsable del cumplimiento legal en su jurisdiccion.
- Riesgo de alucinacion: no evaluado; al ser un modelo de roleplay sin benchmarks, no es adecuado para tareas facticas o de produccion critica.
- Restricciones de uso: el autor prohibe explicitamente usar el modelo para acosar, enganar o dirigirse a personas, y para generar contenido con menores en cualquier forma.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion desaconseja su despliegue en produccion sin validacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/Sorenvza/Qwen3.8-27B-Uncensored-Impulsive
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base sin censura: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
