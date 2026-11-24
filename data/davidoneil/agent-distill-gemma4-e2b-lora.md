# davidoneil/agent-distill-gemma4-e2b-lora

## Resumen

`davidoneil/agent-distill-gemma4-e2b-lora` es un adaptador LoRA de investigacion (bf16, PEFT) sobre el modelo base `google/gemma-4-E2B-it`. Lo desarrolla el usuario davidoneil y su proposito es mejorar el comportamiento agentico multi-turno del modelo base: llamadas a herramientas, aclaracion de parametros faltantes y rechazo controlado ante funciones inexistentes. El adaptador se entrena mediante destilacion de trayectorias sinteticas verificadas por ejecucion, generadas por un modelo profesor (`Qwen/Qwen3.8-27B-FP8`), y esta pensado para evaluacion en dispositivo (iPhone) con cuantizacion MLX 4-bit.

El modelo resuelve un problema concreto: los modelos pequenos de clase "edge" suelen fallar en la secuencia correcta de acciones dentro de flujos agenticos (leer antes de actuar, encadenar pasos, pedir aclaracion cuando falta un parametro). El adaptador se entrena exclusivamente con trayectorias sinteticas sin contaminacion de BFCL, lo que lo hace util como banco de pruebas controlado para investigacion sobre destilacion agentica en modelos de bolsillo.

Es relevante ahora porque ejemplifica una tendencia: adaptar modelos pequenos con LoRA para tareas agenticas especificas y desplegarlos en hardware consumer (movil), manteniendo el formato nativo de tool calling de Gemma 4. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-E2B-it`; modulos objetivo `strict_attn_mlp` (205 modulos lineales: q/k/v/o_proj y gate/up/down_proj) |
| Parametros totales | no disponible (adaptador LoRA, `r=16`, `alpha=32`; el repo pesa 0,1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con secuencias de hasta 12000 tokens sin truncado) |
| Tipos de cuantizacion | adaptador en bf16; evaluado sobre base MLX 4-bit (`mlx-community/gemma-4-e2b-it-4bit`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (sujeta a la licencia del modelo base Gemma 4) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT en bf16 con `r=16`, `alpha=32`, `dropout=0.05`, `bias="none"` y `seed=42`. Se aplica sobre 205 modulos lineales del modelo base bajo la politica `strict_attn_mlp`, que incluye las proyecciones de atencion (q, k, v, o) y las del MLP (gate, up, down) de cada capa, excluyendo convoluciones, atencion lineal, torres multimodales y `lm_head`. La optimizacion usa `lr=0.0001`, schedule coseno, `warmup_ratio=0.05`, 2,0 epochs y batch efectivo de 16, con longitud maxima de 12000 tokens y sin truncado (3020 trayectorias de entrenamiento y 159 de validacion, todas conservadas). El enmascarado de perdida se aplica solo a tokens del asistente; system, tools, user, payloads de respuesta de herramienta y prefijos de generacion se enmascaran a `-100`.

El entrenamiento es una destilacion agentica sobre un dataset sintetico verificado por ejecucion (3179 trayectorias, SHA-256 `555b8d02...`), generado por el profesor `Qwen/Qwen3.8-27B-FP8` y compuesto por cuatro tipos de tarea: `read_before_act`, `multi_step_workflow`, `miss_param_clarify` y `miss_func_refusal` (Variant A, mezcla sintetica completa). Se declara contaminacion cero respecto a BFCL, verificado con Jaccard de 5-gramas `<= 0.30` y coseno MiniLM `<= 0.85` (maximos retenidos: 0.2308 y 0.8499; 2 tareas BFCL rechazadas). El `chat_template.jinja` es copia exacta sin modificar del base (SHA-256 `0a2c8073...`), y se usa el formato nativo de tool call de Gemma 4: `<|tool_call>call:name{k:<|"|>v<|"|>}<tool_call|>`.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Gemma 4 E2B.
- Tool calling en formato nativo de Gemma 4, con tasa de parseo del 100 % en la evaluacion interna (326/326 en base+LoRA).
- Comportamiento agentico multi-turno: lectura previa a la accion (`read_before_act`) y flujos de multiples pasos (`multi_step_workflow`).
- Aclaracion de parametros faltantes (`miss_param_clarify`) en lugar de inventar valores.
- Rechazo controlado ante funciones inexistentes (`miss_func_refusal`).
- Inferencia en modo "no thinking" para despliegue en iPhone con MLX 4-bit.
- Capacidades multimodales del base no entrenadas por el adaptador (las torres multimodales quedan excluidas del LoRA).

## Casos de uso

- Evaluacion de destilacion agentica en investigacion: permite comparar el comportamiento del base frente al base+LoRA en tareas sinteticas controladas, con splits de validacion fijos y manifiesto de contaminacion verificable.
- Prototipado de asistentes en dispositivo: el adaptador se ejecuta sobre `gemma-4-e2b-it-4bit` en MLX, lo que permite probar flujos agenticos en iPhone sin conexion a servidores.
- Validacion de pipelines de tool calling: el formato nativo de Gemma 4 y el 100 % de parseo permiten integrar el modelo en un orquestador de herramientas y medir la tasa de exito del verificador.
- Investigacion sobre aclaracion de parametros: util para estudiar como un modelo pequeno gestiona peticiones incompletas y cuando decide preguntar en lugar de alucinar argumentos.
- Pruebas de robustez ante funciones inexistentes: el comportamiento de rechazo (`miss_func_refusal`) sirve para evaluar la seguridad de agentes que reciben definiciones de herramientas erroneas o maliciosas.
- Banco de pruebas de contaminacion: el manifiesto SHA-256 y las metricas de similitud permiten reproducir la verificacion de que un dataset sintetico no filtra tareas de evaluacion publicas como BFCL.

## Benchmarks y rendimiento

Evaluacion interna sobre split de validacion retenido (no BFCL):

| Modelo | Verifier pass rate | Formato nativo parseable |
|---|---:|---:|
| Base (`google/gemma-4-E2B-it`) | 26/60 (43,3 %) | 100,0 % (288/288) |
| Base + LoRA (Variant A) | 49/60 (81,7 %) | 100,0 % (326/326) |

Perdida: validacion en paso 0 de 1,3144; perdida final de entrenamiento de 0,2674; perdida final de validacion de 0,2087. No se han publicado resultados en benchmarks publicos (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador pesa 0,1 GB y se suma al modelo base E2B en bf16 o en su version MLX 4-bit.
- GPU recomendadas: no disponibles; el caso de uso declarado es inferencia en iPhone mediante MLX 4-bit, no en GPU de servidor.
- Cabe en hardware consumer: si, segun el autor, en iPhone con `mlx-community/gemma-4-e2b-it-4bit`; el adaptador es un fichero LoRA de 0,1 GB.
- Opciones de despliegue: MLX (objetivo declarado), PEFT sobre el base en bf16; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidoneil/agent-distill-gemma4-e2b-lora` | LoRA `r=16` sobre E2B | no disponible (entrena hasta 12000 tokens) | Destilacion agentica multi-turno | apache-2.0 | Hugging Face, 0 descargas |
| `google/gemma-4-E2B-it` (base) | no disponible | no disponible | Modelo instruct general | Apache-2.0 (Gemma 4) | Hugging Face |
| `Qwen/Qwen3.8-27B-FP8` (profesor) | 27B | no disponible | Modelo general de mayor escala | Apache-2.0 | Hugging Face |

La comparativa con alternativas de la misma categoria (adaptadores LoRA agenticos para modelos edge) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion experimental, no un modelo listo para produccion; el autor lo etiqueta explicitamente como "Research Adapter".
- El entrenamiento usa exclusivamente trayectorias sinteticas generadas por un profesor; puede heredar sesgos y errores del profesor `Qwen/Qwen3.8-27B-FP8`.
- El dataset cubre solo cuatro tipos de tarea agentica; el comportamiento fuera de ellos no esta caracterizado.
- La evaluacion se limita a un split interno de 60 ejemplos; no hay resultados en BFCL ni en otros benchmarks publicos.
- El adaptador excluye torres multimodales, atencion lineal y `lm_head`; no mejora capacidades de vision ni de audio del base.
- Idiomas soportados no documentados; el comportamiento multilingue no esta evaluado.
- Uso comercial sujeto a la licencia del modelo base Gemma 4, ademas de la Apache-2.0 declarada para el adaptador.
- Riesgo de alucinacion en argumentos de herramientas no cuantificado fuera del split interno.
- Sin descargas ni validacion de la comunidad en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/davidoneil/agent-distill-gemma4-e2b-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Base MLX 4-bit: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
