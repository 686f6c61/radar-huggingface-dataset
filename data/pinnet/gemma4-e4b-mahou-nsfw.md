# pinnet/gemma4-e4b-mahou-nsfw

## Resumen

pinnet/gemma4-e4b-mahou-nsfw es un ajuste fino de tipo "abliterated" (decensored) derivado de Pranavz/gemma4-e4b-kindling-mahou, que a su vez es un SFT de parametros completos sobre google/gemma-4-E4B-it. Lo desarrolla el usuario pinnet y su proposito es eliminar los mecanismos de rechazo del modelo base para orientarlo a roleplay y escritura creativa sin restricciones de contenido. La relevancia actual es acotada: se trata de un experimento de desbloqueo de rechazos sobre la familia Gemma 4, con 77 descargas y sin likes en el momento de la consulta.

El modelo conserva la arquitectura y el tokenizador del Gemma 4 E4B instruct original, con 7.941.100.832 parametros reales segun los pesos en safetensors y un repositorio de 15,9 GB (compatible con pesos en bfloat16). La modificacion se realizo con la herramienta Heretic v1.2.0, que aplica direcciones de abliteracion por capa sobre las proyecciones de atencion y de la MLP.

Es un modelo de nicho, no un modelo generalista: su interes tecnico esta en documentar el coste de la abliteracion (divergencia KL de 0,3102 frente al modelo de partida) y la reduccion de rechazos (de 99/100 a 3/100 en la evaluacion del autor). No dispone de informacion publicada sobre contexto, idiomas ni benchmarks de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B); detalles de atencion y capas no disponibles |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16 por el tamano del repo) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4 en su variante E4B, con 7,94 mil millones de parametros. Sobre esa base, Pranavz realizo un SFT de parametros completos (full-parameter SFT) usando el dataset flammenai/flame-kindling-v1, orientado a roleplay y escritura creativa. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

Sobre ese checkpoint, pinnet aplico Heretic v1.2.0, una herramienta de abliteracion que calcula direcciones de rechazo por capa y las resta de los pesos. Los parametros publicados incluyen pesos y posiciones para attn.o_proj (max_weight 3,59 en posicion 38,57; min_weight 3,24 a distancia 26,77) y para mlp.down_proj (max_weight 2,25 en posicion 30,01; min_weight 3,23 a distancia 22,25), con direction_index por capa. La plantilla de chat usa los marcadores nuevos de Gemma 4 (`<|turn>user\n...<turn|>\n<|turn>model\n...`), gestionados automaticamente por apply_chat_template.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en roleplay y escritura creativa segun el SFT de origen.
- Reduccion drastica de rechazos: 3/100 en la evaluacion del autor frente a 99/100 del modelo de partida.
- Soporte de conversaciones multi-turno mediante la plantilla de chat de Gemma 4.
- Generacion de texto e imagen-texto a texto segun los tags del repositorio (image-text-to-text), aunque no se detallan las capacidades multimodales en la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan capacidades multilingues especificas.
- No dispone de modo thinking; el autor advierte explicitamente de no pasar el argumento enable_thinking, propio de Qwen3, porque provoca error en la plantilla de Gemma.

## Casos de uso

- Roleplay conversacional: el modelo esta ajustado especificamente para mantener personajes y narrativa multi-turno, con ajustes de muestreo recomendados (temperature 0,7-0,9, top_p 0,95, top_k 64, repetition_penalty 1,05) pensados para evitar bucles en respuestas largas.
- Escritura creativa y ficcion: la ausencia de rechazos permite generar narrativa adulta o temas sensibles que el modelo base declinaria, con max_new_tokens de 512-1024 para dar espacio a descripciones largas.
- Investigacion sobre alineacion y abliteracion: sirve como caso de estudio reproducible del efecto de Heretic v1.2.0 sobre un modelo Gemma 4, con metricas de divergencia KL y tasa de rechazos publicadas.
- Prototipado de asistentes de personaje en local: al ser un modelo de ~8.000 millones de parametros, puede desplegarse en una GPU de consumo con cuantizacion, util para demos de chatbots de rol sin dependencia de API.
- Generacion de dialogos para guiones o videojuegos: el ajuste SFT sobre flame-kindling-v1 favorece respuestas con tono narrativo y consistencia de personaje en sesiones largas.
- Evaluacion comparativa de censura: util para medir como varia la tasa de rechazo y la calidad (KL) entre el modelo original, el SFT y la version abliterada en un mismo pipeline de inferencia.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Pranavz/gemma4-e4b-kindling-mahou) |
|---|---|---|
| Divergencia KL | 0,3102 | 0 (por definicion) |
| Rechazos | 3/100 | 99/100 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4-5 GB (estimaciones por tamano, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 sin cuantizar con contexto largo; RTX 4090 (24 GB) para bfloat16 ajustado o cuantizacion 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 con cuantizacion, y en GPUs de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers con device_map="auto" (metodo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este checkpoint y requeririan conversion a GGUF u otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| pinnet/gemma4-e4b-mahou-nsfw | 7,94 B | no disponible | Roleplay sin censura (abliterated) | gemma | Publicado, 77 descargas |
| Pranavz/gemma4-e4b-kindling-mahou | 7,94 B | no disponible | Roleplay y escritura creativa (SFT) | gemma | Modelo de partida |
| google/gemma-4-E4B-it | 7,94 B | no disponible | Asistente generalista con alineacion | gemma | Modelo base |
| Modelos abliterated de la familia Qwen o Llama | variable | variable | Roleplay sin censura | variable | Alternativas de la misma categoria, sin datos comparativos disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion degrada la calidad respecto al modelo de partida: la divergencia KL de 0,3102 indica una desviacion medible en la distribucion de salida, con posible perdida de coherencia, instrucciones y capacidades generales.
- Riesgo elevado de contenido para adultos y de temas sensibles: el repositorio esta marcado como not-for-all-adults y orientado a NSFW; no es apto para aplicaciones de cara al publico sin filtrado externo.
- Riesgo de alucinacion no evaluado: no hay benchmarks de veracidad ni de seguimiento de instrucciones para este checkpoint.
- Idiomas y longitud de contexto no documentados; no se puede garantizar un comportamiento correcto fuera del ingles o en contextos largos.
- Licencia Gemma Terms of Use: impone restricciones de uso, obligaciones de atribucion y una politica de uso aceptable que puede entrar en conflicto con la generacion de contenido sin restricciones; conviene revisar la licencia antes de cualquier uso comercial.
- El autor advierte de no usar el argumento enable_thinking (propio de Qwen3) con esta plantilla de chat, ya que provoca error.
- Modelo de nicho con muy poca validacion externa (0 likes, 77 descargas) y sin model card detallada sobre datos de entrenamiento, sesgos o evaluaciones independientes.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines automatizados que dependan de function calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pinnet/gemma4-e4b-mahou-nsfw
- Modelo de partida (SFT): https://huggingface.co/Pranavz/gemma4-e4b-kindling-mahou
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Organizacion Google Gemma: https://huggingface.co/google
- Dataset de SFT: https://huggingface.co/datasets/flammenai/flame-kindling-v1
- Herramienta Heretic: https://github.com/p-e-w/heretic
