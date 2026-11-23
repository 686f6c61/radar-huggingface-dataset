# kristalsoft/Eris-A0-Instruct

## Resumen
Eris A0 Instruct es un modelo de chat de 338 millones de parametros desarrollado por Kristalsoft (Eren Koçakgöl) y entrenado integramente desde cero: tokenizador propio, arquitectura propia y preentrenamiento propio, seguido de un ajuste supervisado (SFT). Es la version instruida del modelo base kristalsoft/Eris-A0-Base y constituye el primer miembro de la familia Eris. Su proposito declarado es la experimentacion, la investigacion y el punto de partida para fine-tuning especifico de tarea, no la sustitucion de asistentes generales de gran tamano.

El modelo emplea una arquitectura transformer decoder-only de 24 capas con atencion de consultas agrupadas (GQA) y atencion hibrida: tres de cada cuatro capas usan ventana local deslizante de 1.024 tokens y cada cuarta capa es global, lo que acota buena parte de la cache KV en entradas largas. La longitud de contexto es de 4.096 tokens y el vocabulario de 65.536 entradas mediante BPE a nivel de byte. Esta orientado a turco e ingles, con presencia residual de codigo y matematicas.

Su relevancia practica es doble: por un lado demuestra que es viable entrenar un modelo conversacional bilingue completo en un unico chip TPU de Google Cloud, y por otro ofrece una huella lo bastante pequena (1,1 GB de repositorio, exportacion ONNX int8) como para ejecutarse en CPU de portatil o directamente en el navegador, con unos 30 tokens por segundo en float32 sobre CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con pre-norm, atencion hibrida (local/global) y GQA |
| Parametros totales | 338.087.936 (271,0M cuerpo transformer + 67,1M embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int8 (exportacion ONNX con cache KV); pesos originales en bfloat16 |
| Idiomas soportados | Turco, ingles (con algo de codigo y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), ONNX (int8) |

| Parametro adicional | Valor |
|---|---|
| Capas | 24 decoder pre-norm |
| Dimension oculta | 1.024 |
| Feed-forward | SwiGLU, 2.816 |
| Normalizacion | RMSNorm, QK-norm |
| Atencion | 16 cabezas de consulta, 4 de clave/valor, dimension de cabeza 64 |
| Ventana local | 1.024 tokens (3 de cada 4 capas); capa global cada 4 |
| RoPE | base 10.000 en capas locales, 1.000.000 en globales |
| Vocabulario | 65.536 (BPE a nivel de byte, tokenizador propio) |
| Embeddings | entrada/salida atados |
| Soft-capping de logits | tanh, valor 30 |
| Formato de chat | `<|im_start|>user ... <|im_end|>` / `<|im_start|>assistant ... <|im_end|>` |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento
El cuerpo del modelo son 24 capas decoder pre-norm con dimension oculta 1.024 y feed-forward SwiGLU de 2.816. La atencion usa GQA con 16 cabezas de consulta y 4 de clave/valor (dimension 64), QK-norm y una puerta de salida sigmoide por cabeza. La innovacion principal es la atencion hibrida: tres de cada cuatro capas aplican una ventana local deslizante de 1.024 tokens y la cuarta es global, con bases RoPE distintas (10.000 en locales, 1.000.000 en globales) para que las capas globales puedan modelar dependencias de mayor alcance. Los embeddings de entrada y salida estan atados y se aplica soft-capping tanh de logits con valor 30.

El preentrenamiento consumio 9,63B tokens en 18.360 pasos de 524.288 tokens (128 secuencias de 4.096), con schedule de learning rate warmup-stable-decay, precision bfloat16 y ejecucion en un unico chip TPU de Google Cloud (Colab TPU v6e-1 y v5e-1). La mezcla de tokens fue 35% web en turco, 45% web en ingles, 13% codigo y 7% matematicas. El tokenizador, BPE a nivel de byte entrenado sobre esa mezcla, separa los digitos uno a uno, normaliza en NFC y omite deliberadamente las reglas de contraccion del ingles para preservar los sufijos turcos tras apostrofo (por ejemplo, "İstanbul'da" se divide en "İstanbul" + "'da"); su fertilidad medida es de aproximadamente 1,53 tokens por palabra turca y 1,29 por palabra inglesa.

El ajuste supervisado duro 2 epocas y 1.604 pasos de 32 secuencias empaquetadas de 2.048 tokens (unos 105M tokens procesados, 70M de ellos tokens de respuesta), con la perdida calculada solo sobre las respuestas del asistente. La perdida de respuesta en el split de validacion paso de 2,43 en el modelo base a 1,91, descendiendo en cada evaluacion y sin senales de sobreajuste; el proceso completo requirio 75 minutos en una TPU v5e-1. El corpus SFT, de unas 140.000 conversaciones tras limpieza, combina aya_dataset en turco (4.046 ejemplos), Turkish-LLM-v10-Training (109.562 tras descartar 34.460 de 144.022 filas por transcripciones de tool-calls, prompts de sistema embebidos, peticiones de letras de canciones y poemas, respuestas truncadas o vacias y respuestas en ingles), smol-smoltalk en ingles (25.000), un conjunto de honestidad de 340 ejemplos replicados cinco veces (correccion de premisas falsas y respuestas de "no lo se") y un conjunto de identidad de 120 ejemplos replicados 25 veces.

## Capacidades
- Generacion de texto conversacional multi-turno en turco e ingles, con plantilla de chat propia y parada en `<|im_end|>`.
- Razonamiento basico y respuesta a preguntas factuales sencillas (el ejemplo de la model card responde correctamente a la capital de Turquia).
- Correccion de premisas falsas y respuestas de "no lo se" inducidas mediante el conjunto de honestidad del SFT.
- Coherencia de identidad: el modelo conoce quien es y quien lo desarrollo gracias al conjunto de identidad entrenado.
- Nociones residuales de codigo y matematicas, procedentes del 13% y 7% de la mezcla de preentrenamiento respectivamente.
- Decodificacion con penalizacion de repeticion (1,15) y bloqueo de 4-gramas aplicado solo a los tokens generados, integrada en el metodo `model.chat(...)`.
- Exportacion ONNX int8 con cache KV (batch 1, entradas `input_ids`, `past_key`, `past_value`) para inferencia en navegador.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso; de hecho, las transcripciones de tool-calls fueron eliminadas explicitamente del corpus de SFT.

## Casos de uso
- Prototipado de asistentes conversacionales en turco: el modelo mantiene dialogos multi-turno dentro de su ventana de 4.096 tokens y esta afinado con 113.000 ejemplos en turco, lo que permite validar flujos de conversacion completos antes de escalar a un modelo mayor.
- Fine-tuning especifico de dominio sobre hardware modesto: con 338M de parametros y licencia Apache-2.0, es viable reentrenar la cabeza o el modelo completo para tareas de clasificacion, extraccion o resumen en una unica GPU de consumo.
- Demos interactivas en navegador sin backend: la exportacion `onnx/model_int8.onnx` con cache KV permite ejecutar el modelo del lado del cliente, util para entornos con requisitos estrictos de privacidad en los que ningun dato debe salir del dispositivo.
- Educacion e investigacion sobre entrenamiento desde cero: al publicar tokenizador, arquitectura, curvas de perdida y recetas de datos, sirve como caso de estudio reproducible de un pipeline completo de preentrenamiento y SFT en TPU.
- Generacion de texto asistida en aplicaciones de escritorio o CLI: a unos 30 tokens por segundo en CPU float32, encaja en herramientas locales de autocompletado, reformulacion o respuestas cortas donde no hay GPU disponible.
- Filtrado y anotacion semiautomatica de corpus turcos: su fertilidad de 1,53 tokens por palabra turca y su manejo correcto de sufijos tras apostrofo lo hacen util para preprocesar y etiquetar texto turco antes de entrenar modelos mayores.
- Base para experimentos de alineacion y honestidad: el conjunto de honestidad y el de identidad permiten estudiar como el SFT modifica el comportamiento ante premisas falsas en modelos de menos de 500M de parametros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos de evaluacion proporcionados por el autor son la perdida de respuesta en validacion (2,43 en el modelo base frente a 1,91 tras el SFT, con descenso en cada evaluacion) y la degradacion de la exportacion ONNX int8 (perdida aproximadamente un 0,1% superior, con salidas greedy identicas al modelo PyTorch).

| Metrica | Valor |
|---|---|
| Perdida de respuesta en validacion (base) | 2,43 |
| Perdida de respuesta en validacion (instruct) | 1,91 |
| Incremento de perdida ONNX int8 | ~0,1% |
| Throughput en CPU de portatil (float32) | ~30 tokens/s |

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: en torno a 0,7 GB solo para pesos (338M parametros x 2 bytes), mas cache KV; con 4.096 tokens de contexto la cache es moderada gracias a la ventana local de 1.024 tokens en tres de cada cuatro capas.
- En int8 los pesos ocupan aproximadamente 0,34 GB, lo que permite ejecucion holgada en CPU y en navegador.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 4090 o A100 quedan muy sobredimensionadas para este modelo y solo tendrian sentido para lotes grandes o fine-tuning.
- Cabe en GPU de consumo de gama baja y en iGPU; el propio autor lo describe como ejecutable comodamente en CPU de portatil.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por la arquitectura propia), ONNX Runtime para la exportacion int8, y el codigo de demo publicado en GitHub. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: aproximadamente 30 tokens por segundo en CPU de portatil en float32, segun el autor; no se publican cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Eris A0 Instruct | 338M | 4.096 | tr, en | Apache-2.0 | Entrenado desde cero, atencion hibrida, exportacion ONNX int8 |
| Qwen2.5-0.5B-Instruct | ~500M | 32.768 | multilingue | Apache-2.0 | Mayor contexto y cobertura idiomatica; no disponible en la informacion proporcionada para comparar rendimiento |
| SmolLM2-360M-Instruct | ~360M | 8.192 | principalmente en | Apache-2.0 | Tamano comparable; no disponible para comparar rendimiento |
| TinyLlama-1.1B-Chat | ~1,1B | 2.048 | en | Apache-2.0 | Mayor numero de parametros, contexto menor; no disponible para comparar rendimiento |

No se dispone de resultados de benchmarks de Eris A0 Instruct que permitan una comparacion cuantitativa con estas alternativas; la tabla recoge solo diferencias de especificaciones y disponibilidad.

## Limitaciones y advertencias
- Modelo de 338M de parametros: el propio autor lo posiciona como herramienta de experimentacion e investigacion, no como sustituto de asistentes generales de gran escala.
- Riesgo elevado de alucinacion en conocimiento factual, razonamiento complejo y matematicas; el conjunto de honestidad mitiga parcialmente las premisas falsas, pero no elimina el problema.
- Cobertura idiomatica limitada a turco e ingles; el rendimiento fuera de esos dos idiomas no esta documentado y previsiblemente sera deficiente.
- Ventana de contexto de 4.096 tokens, muy inferior a la de modelos contemporaneos de tamano similar.
- Sin soporte documentado de tool calling ni de flujos agente; las transcripciones de tool-calls fueron eliminadas del corpus de SFT, por lo que no debe esperarse ese comportamiento.
- Requiere `trust_remote_code=True` por el codigo de arquitectura propio (`modeling_eris.py`), lo que implica ejecutar codigo del repositorio y anade superficie de riesgo en entornos de produccion.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan evaluaciones de sesgo, toxicidad ni seguridad; el corpus SFT incluye datasets de terceros cuya limpieza se describe solo parcialmente.
- El modelo se creo y actualizo en noviembre de 2026 y registra cero descargas y cero likes en el momento de la consulta, por lo que carece de validacion independiente de la comunidad.
- La exportacion ONNX int8 esta limitada a batch 1, lo que restringe su uso en escenarios de alto throughput.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kristalsoft/Eris-A0-Instruct
- Modelo base: https://huggingface.co/kristalsoft/Eris-A0-Base
- Demo en el navegador: https://huggingface.co/spaces/kristalsoft/Eris-A0
- Codigo fuente (modelo, evaluacion, demo): https://github.com/kristalsoft-software/eris-a0
- Perfil del autor: https://huggingface.co/kristalsoft
- Dataset aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset Turkish-LLM-v10-Training: https://huggingface.co/datasets/ogulcanaydogan/Turkish-LLM-v10-Training
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
