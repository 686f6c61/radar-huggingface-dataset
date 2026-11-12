# hmkz-1981/gemma-4-e4b-agentic-rl-think-effort-GGUF

## Resumen

`hmkz-1981/gemma-4-e4b-agentic-rl-think-effort-GGUF` es una cuantizacion en formato GGUF del modelo `hmkz-1981/gemma-4-e4b-agentic-rl-think-effort`, un ajuste fino de `google/gemma-4-E4B-it` orientado a seguimiento de instrucciones, jerarquia de instrucciones y uso de herramientas en multiples pasos. El autor es el usuario de Hugging Face hmkz-1981, que ha aplicado un post-entrenamiento consistente en SFT con destilacion de pistas (hint distillation) y GRPO sobre el modelo base de Google. El resultado se distribuye cuantizado con llama.cpp para su uso local.

La relevancia de esta ficha radica en que empaqueta un modelo afinado para tareas agenticas en tres niveles de cuantizacion (Q4_K_M, Q5_K_M y Q8_0), con un proyector multimodal separado (`mmproj`) que preserva los encoders de imagen y audio originales de Gemma 4. Incluye ademas un mecanismo poco habitual de control del esfuerzo de razonamiento en cinco niveles (`low`, `medium`, `high`, `xhigh`, `max`), implementado via `chat_template_kwargs` y compatible con llama-server.

El modelo tiene 7.463.013.674 parametros totales segun los safetensors del modelo base, licencia Apache 2.0 y soporte declarado de japones e ingles. El repositorio GGUF ocupa 20.0 GB e incluye los pesos cuantizados, el proyector multimodal y artefactos auxiliares para LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), derivado de google/gemma-4-E4B-it |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0; proyector multimodal en BF16 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj` BF16 para vision y audio |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal de la familia Gemma 4, y se ha sometido a un post-entrenamiento especifico para tareas agenticas. Segun la model card, el ajuste combina SFT con destilacion de pistas (hint distillation) y GRPO (Group Relative Policy Optimization), orientado a mejorar el seguimiento de instrucciones, la jerarquia de instrucciones y el uso de herramientas en multiples pasos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del RL.

La cuantizacion se realizo con llama.cpp en el commit `5d4c8ee`. Las variantes Q4_K_M y Q5_K_M se generaron usando una imatrix construida a partir de los datos de entrenamiento (prompts y respuestas verificadas con trazas de pensamiento en japones e ingles), lo que segun el autor reduce la divergencia respecto a BF16. El autor reporta metricas de calidad de cuantizacion medidas sobre texto no visto en entrenamiento: Q4_K_M con Mean KLD 0.0340 y Same top p 93.5%; Q5_K_M con 0.0104 y 96.4%; Q8_0 con 0.0017 y 98.2%. El proyector multimodal (`mmproj`) se mantiene en BF16 y conserva los encoders originales de Gemma 4.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Razonamiento con modo de pensamiento (thinking) activable mediante `enable_thinking`.
- Control del esfuerzo de razonamiento en cinco niveles: `low` (sin pensamiento), `medium`, `high`, `xhigh` y `max`, con instrucciones de sistema predefinidas para cada nivel.
- Modo conversacional restringido (`conversational_mode`), limitado a respuestas de dos frases o menos y sin Markdown.
- Tool calling / function calling mediante el campo `tools` compatible con OpenAI en llama-server.
- Uso de herramientas en multiples pasos (multi-step tool use), objetivo explicito del post-entrenamiento.
- Seguimiento de instrucciones y jerarquia de instrucciones (instrucciones de sistema frente a usuario).
- Entrada multimodal de imagen y audio a traves del proyector `mmproj` BF16 (encoders originales de Gemma 4).
- Integracion con endpoints compatibles (`endpoints_compatible`) y con llama.cpp via `--jinja`.

## Casos de uso

- Agentes locales con tool calling: el modelo puede invocar funciones declaradas en el campo `tools` de llama-server y encadenar varias llamadas en un mismo turno, lo que permite construir agentes que consultan APIs, bases de datos o sistemas de ficheros sin salir del entorno local.
- Asistentes de codigo en IDE: con el modo `effort` en `medium` o `high` se obtiene razonamiento suficiente para tareas de refactorizacion o explicacion de codigo, manteniendo latencia baja en GPUs de consumo gracias a la cuantizacion Q4_K_M (4.94 GiB).
- Atencion al cliente en japones e ingles: el modo conversacional (`conversational_mode`) fuerza respuestas breves y sin Markdown, adecuadas para interfaces de chat; el modo thinking se reserva para consultas complejas.
- Procesamiento de documentos con imagen y audio: el `mmproj` BF16 permite pasar imagenes o audio al modelo para tareas de descripcion, transcripcion asistida o extraccion de informacion, manteniendo el resto del modelo cuantizado.
- Automatizacion de flujos multi-paso con verificacion: el nivel `max` de esfuerzo incluye instrucciones para revisar cada requisito y verificar calculos y resultados de herramientas, util en pipelines donde se requiere doble comprobacion antes de ejecutar acciones.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran tamano: las variantes Q4_K_M y Q5_K_M caben en GPUs de consumo con 6-8 GB de VRAM, lo que permite ejecutar un modelo agentico multimodal en hardware asequible.
- Evaluacion comparativa de tecnicas de RL para agentes: al estar disponible el modelo base sin cuantizar y las cuantizaciones con metricas KLD, sirve como referencia para estudiar el impacto de SFT + GRPO en tareas de tool use.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion respecto a BF16:

| Cuantizacion | Tamano | Mean KLD | Same top p |
|---|---|---|---|
| Q4_K_M | 4.94 GiB | 0.0340 | 93.5% |
| Q5_K_M | 5.33 GiB | 0.0104 | 96.4% |
| Q8_0 | 7.43 GiB | 0.0017 | 98.2% |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones agenticas (por ejemplo, BFCL o tau-bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para Q4_K_M, 6-7 GB para Q5_K_M y 8-9 GB para Q8_0, incluyendo overhead de contexto y cache KV (el contexto no esta especificado, por lo que la cifra es orientativa).
- El proyector multimodal BF16 anade VRAM adicional cuando se usa entrada de imagen o audio; su tamano exacto no esta disponible.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100. Las variantes Q4_K_M y Q5_K_M caben en GPUs de consumo con 8 GB o mas.
- Despliegue: llama.cpp (llama-server con `--jinja`), LM Studio (con manifiesto `manifest.json` y `model.yaml` incluidos para exponer el selector de Effort), y cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hmkz-1981/gemma-4-e4b-agentic-rl-think-effort-GGUF | 7.46 B | no disponible | Apache 2.0 | GGUF | Ajuste agentico con SFT + GRPO y control de effort |
| google/gemma-4-E4B-it | no disponible | no disponible | Apache 2.0 (Gemma) | safetensors | Modelo base multimodal sin post-entrenamiento agentico |
| hmkz-1981/gemma-4-e4b-agentic-rl-think-effort | 7.46 B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del modelo de esta ficha |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre si. Las alternativas de otros autores con el mismo tamano y orientacion agentica no estan identificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran japones e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: no se reportan evaluaciones de factualidad ni de calibracion; el modo thinking puede aumentar la longitud de las respuestas sin garantizar correccion.
- Contexto: la longitud de contexto no esta especificada, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Cuantizacion: Q4_K_M introduce una divergencia medible respecto a BF16 (Mean KLD 0.0340, Same top p 93.5%); para tareas sensibles a la precision se recomienda Q5_K_M o Q8_0.
- El control de effort mediante texto en el system prompt (para apps que no aceptan `chat_template_kwargs`) es una solucion dependiente del template y puede comportarse de forma distinta segun el runtime.
- El modelo se ha afinado con RL sobre un objetivo agentico concreto; puede degradar el estilo conversacional general o el rendimiento en tareas fuera de ese dominio respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios terminos de uso que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-12), por lo que no hay validacion externa de la comunidad.
- El autor indica que el modelo se creo con asistencia de Claude (Anthropic); no se detalla el alcance de dicha asistencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-effort-GGUF
- Modelo base sin cuantizar: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-effort
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- llama.cpp (commit de conversion `5d4c8ee`): https://github.com/ggml-org/llama.cpp
