# gilje/raon-1-mini-korean-creative-v21-mlx

## Resumen

Raon V21 es un adaptador LoRA experimental de tipo «output-layer tuning» sobre el modelo coreano Raon-1-mini-preview de KRAFTON, publicado por el usuario independiente gilje. No se trata de un modelo completo: modifica únicamente la capa `lm_head` del decoder original, manteniendo intactos el resto de pesos y la cuantización MXFP8 del modelo base. El adaptador tiene 8.396.800 parámetros entrenables en float32 y un fichero `adapters.safetensors` de 33.587.396 bytes, con rango LoRA 32 y escala 8.

El modelo base es un transformer MoE de 30B parámetros totales con 4B activos (30B-A4B), desarrollado desde cero por KRAFTON AI para conversación en coreano y tareas agénticas. Raon V21 hereda esa arquitectura y añade un ajuste fino orientado a escritura creativa y roleplay en coreano, entrenado sobre 192 preguntas sintéticas (64 previas más 128 generadas con Codex) y validado con 30 preguntas.

La relevancia de esta ficha es acotada y debe entenderse como tal: el autor declara explícitamente que se trata de un experimento de investigación, no de un modelo validado para producción. Los únicos indicios de mejora son dos preguntas de desarrollo evaluadas por dos contextos de LLM, con incrementos medios de +0,30 y +0,10 puntos sobre 5, y una reducción del 2,73% en NLL sobre 30 preguntas. No hay benchmarks públicos, no hay evaluación humana a escala y el propio autor advierte que no debe presentarse como modelo «uncensored» ni como mejora general de calidad creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Raon-1-mini-preview, 30B-A4B); adaptador LoRA sobre `lm_head` |
| Parametros totales | 30B en el modelo base (no confirmado en la informacion del adaptador); 8.396.800 parametros entrenables en el adaptador |
| Parametros activos | 4B (modelo base, segun GitHub de KRAFTON) |
| Longitud de contexto | 1M tokens mencionado en la model card del adaptador, aunque el autor indica que no se ha verificado para V21 |
| Tipos de cuantizacion | Modelo base en MXFP8 (capa de salida cuantizada); adaptador en float32 |
| Idiomas soportados | Coreano (ko); el modelo base soporta coreano e ingles segun la web de KRAFTON |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` (adaptador sin fusionar); modelo base en formato MLX |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el decoder de Raon-1-mini-preview, un transformer con mezcla de expertos (MoE) de 30B parámetros totales y 4B activos, disenado y entrenado desde cero por KRAFTON AI. La intervencion de gilje se limita a la capa de salida: se congela el decoder original, se preserva la capa `lm_head` cuantizada en MXFP8 y se anade un residuo LoRA sobre ella con rango 32, escala 8 y dropout 0. El entrenamiento optimiza unicamente la prediccion del ultimo turno del asistente y el token de fin, excluyendo el proceso de razonamiento (thinking) de las etiquetas de entrenamiento.

El conjunto de entrenamiento consta de 192 preguntas sinteticas (64 de una fase previa y 128 generadas con Codex) y 30 de validacion. Se compararon tasas de aprendizaje de 1e-5, 3e-5 y 1e-4 durante 600 pasos cada una, con validacion cada 100 pasos y batch de 64 tokens de respuesta. Se selecciono la configuracion con menor perdida de validacion: learning rate 3e-5 en el paso 400, con semilla 20261106. El autor advierte que los datos son sinteticos, no revisados por expertos humanos, y que los registros de generacion de las 64 preguntas originales no estan completamente documentados. El proyecto se cerro en la version V25 tras pasar por ajuste inicial de la capa de salida, expansion de proyecciones internas, comparativas de precision, politicas de generacion y diagnostico numerico.

## Capacidades

- Generacion de texto en coreano, con enfasis en prosa creativa y roleplay.
- Razonamiento con modo «thinking» activado por defecto, que separa el proceso interno de la respuesta final.
- Generacion de respuestas finales tras el bloque de razonamiento, con limite conjunto de 32.768 tokens por defecto.
- Soporte de conversacion multi-turno heredado del modelo base.
- Capacidades agenticas y de conversacion en coreano e ingles heredadas del modelo base Raon-1-mini (no verificadas especificamente para el adaptador).
- No se ha verificado soporte de tool calling, function calling ni vision en la informacion disponible para este adaptador.
- No se ha verificado el aprovechamiento de contexto largo ni del millon de tokens en la version V21.

## Casos de uso

- Prototipado de escritura creativa en coreano: el adaptador puede emplearse para generar prosa y dialogos en coreano en entornos de investigacion, comparando su salida con la del modelo base en las mismas condiciones de generacion (seed 42, temperature 1.0, top_p 0.95, top_k 20).
- Experimentacion academica sobre ajuste de la capa de salida: sirve como caso reproducible de LoRA sobre `lm_head` con decoder congelado, util para estudiar el efecto de tocar solo la capa de salida en modelos MoE coreanos.
- Roleplay y ficcion conversacional en coreano: el autor reporta una mejora marginal en una pregunta de roleplay (+0,10 sobre 5), por lo que puede usarse en demos controladas de personajes y dialogos, siempre con revision humana.
- Evaluacion comparativa de tecnicas de adaptacion: al publicar `evaluation.json`, `EXAMPLES.md` y `examples.jsonl`, permite reproducir la comparacion original frente al modelo base en las dos preguntas de desarrollo.
- Investigacion sobre calibracion y NLL: la reduccion de NLL del 2,73% sobre 30 preguntas y 4.094 tokens de respuesta puede servir como punto de partida para estudiar la relacion entre perdida de prediccion y calidad creativa percibida.
- Despliegue local en Apple Silicon para pruebas: el ejecutor `generate.py` permite lanzar el adaptador en un Mac con Python 3.12, MLX 0.32.4 y MLX-LM 0.32.2, con un pico de memoria observado de aproximadamente 18,44 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta una evaluacion cualitativa sobre dos preguntas de desarrollo, puntuadas de 1 a 5 en cinco dimensiones por dos contextos de LLM independientes:

| Metrica | Modelo base | V21 | Diferencia |
|---|---:|---:|---:|
| Prosa, 1 pregunta (media) | 2,40 | 2,70 | +0,30 |
| Roleplay, 1 pregunta (media) | 2,30 | 2,40 | +0,10 |
| Media de las dos preguntas | 2,35 | 2,55 | +0,20 |
| Cumplimiento de condiciones obligatorias | 2/4 | 4/4 | +2 |
| NLL en las mismas 30 preguntas | 3,0909777913 | 3,0065105737 | -2,73% |

El NLL se midio sobre 30 preguntas y 4.094 tokens de respuesta, con los mismos pesos que V15; no se repitio con la politica de generacion de V21. El umbral predefinido del 5% de reduccion no se alcanzo. Un candidato alternativo (v14) con menor NLL obtuvo 0 victorias, 14 empates y 22 derrotas frente al modelo base en 36 preguntas creativas, lo que motivo descartarlo.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el modelo base ocupa aproximadamente 17,6 GB; el autor observo un pico de memoria de unos 18,44 GB en MLX durante la comprobacion de compatibilidad, dependiendo de la longitud del prompt.
- GPU recomendadas: el adaptador esta disenado exclusivamente para Apple Silicon con MLX; no se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) ni CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con al menos 24-32 GB de memoria unificada, aunque el pico observado de 18,44 GB deja poco margen en configuraciones de 24 GB.
- Opciones de despliegue: ejecutor propio `generate.py` sobre MLX 0.32.4 y MLX-LM 0.32.2, con Python 3.12. No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon V21 (este adaptador) | 30B-A4B (base) + 8,4M entrenables | 1M (no verificado en V21) | Apache 2.0 | MLX + safetensors | Adaptador experimental, solo Apple Silicon |
| Raon-1-mini-preview (base) | 30B-A4B | 1M | Apache 2.0 | MLX | Modelo oficial de KRAFTON, sin ajuste creativo |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental: el autor declara explicitamente que no es un modelo validado para produccion ni una mejora general de calidad creativa.
- Evaluacion muy limitada: solo dos preguntas de desarrollo, dos contextos de evaluacion por LLM, sin evaluacion humana a escala ni benchmarks publicos.
- Defectos observados: repeticion de acciones en el ejemplo de roleplay (un vaso de papel repetido) y descripciones poco naturales en el ejemplo de prosa (manejo de una cinta metrica).
- Sesgos y alucinacion: no se han evaluado sesgos ni tasas de alucinacion; los datos de entrenamiento son sinteticos y generados en parte por Codex.
- Contexto largo no verificado: el autor no ha comprobado el uso de contextos largos ni del millon de tokens en V21.
- Compatibilidad restringida: no debe asumirse compatibilidad con PEFT estandar ni con cargadores LoRA genericos; requiere el ejecutor `generate.py` y el modelo base en una revision concreta.
- Dependencia de hardware: solo funciona en Apple Silicon con MLX; no hay soporte documentado para CUDA.
- Restricciones de licencia: el adaptador y el codigo se publican bajo Apache 2.0, pero el autor no garantiza la idoneidad contractual de los textos sinteticos generados con Codex ni de los servicios usados para las 64 preguntas originales.
- No es un modelo «uncensored»: el autor rechaza explicitamente esa etiqueta y no ha verificado efectos de reduccion de rechazos.
- Reproducibilidad: la coincidencia de tokens en un entorno concreto no garantiza reproducibilidad bit a bit en otras versiones de MLX, sistemas operativos o hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gilje/raon-1-mini-korean-creative-v21-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview-mlx
- Repositorio GitHub del modelo base: https://github.com/krafton-ai/Raon-1-mini-preview
- Web oficial de Raon: https://raon-mini.krafton.ai/en
- Historial de experimentos: RESEARCH.md (incluido en el repositorio del adaptador)
- Datos de evaluacion: evaluation.json (incluido en el repositorio del adaptador)
- Ejemplos: EXAMPLES.md y examples.jsonl (incluidos en el repositorio del adaptador)
- Licencia del modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview-mlx#license
