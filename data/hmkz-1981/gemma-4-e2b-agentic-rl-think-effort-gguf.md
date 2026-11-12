# hmkz-1981/gemma-4-e2b-agentic-rl-think-effort-GGUF

## Resumen

`hmkz-1981/gemma-4-e2b-agentic-rl-think-effort-GGUF` es una cuantizacion en formato GGUF del modelo `hmkz-1981/gemma-4-e2b-agentic-rl-think-effort`, un ajuste fino de `google/gemma-4-E2B-it` orientado a seguimiento de instrucciones, jerarquia de instrucciones y uso de herramientas en multiples pasos. El autor del ajuste es hmkz-1981 y la cuantizacion se ha realizado con `llama.cpp` (commit `1d81992`), lo que permite ejecutar el modelo en entornos de inferencia local compatibles con la API de llama.cpp.

El modelo parte de la familia Gemma 4 de Google (licencia Apache 2.0) y tiene 4.628.569.635 parametros totales. El ajuste posterior al entrenamiento combina SFT con destilacion de pistas (hint distillation) y GRPO, tecnicas orientadas a reforzar el razonamiento multi-paso y el cumplimiento estricto de instrucciones. Incorpora un modo de "esfuerzo" (effort) configurable en cinco niveles que controla la longitud del razonamiento antes de responder, ademas de un modo conversacional que limita la respuesta a dos frases sin Markdown.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo con capacidades agenticas y de tool calling en hardware de consumo, con cuantizaciones Q4_K_M, Q5_K_M y Q8_0 verificadas mediante metricas de divergencia (KLD) frente al modelo en BF16. El repositorio incluye tambien un proyector multimodal (`mmproj`) para entrada de imagen y audio, aunque el modelo esta etiquetado unicamente para japones e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, ajuste fino sobre `google/gemma-4-E2B-it`) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); `mmproj` en BF16 para vision y audio |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `google/gemma-4-E2B-it`, por lo que hereda la arquitectura transformer de la familia Gemma 4. El post-entrenamiento realizado por hmkz-1981 combina dos fases: SFT con destilacion de pistas (hint distillation) y optimizacion con GRPO (Group Relative Policy Optimization). El objetivo declarado es reforzar el seguimiento de instrucciones, la jerarquia de instrucciones (prioridad entre system prompt, instrucciones de usuario y contenido de herramientas) y el uso de herramientas en multiples pasos.

La innovacion mas destacable es el control de "esfuerzo" en cinco niveles (`low`, `medium`, `high`, `xhigh`, `max`), que se pasa mediante `chat_template_kwargs.effort` en la API o mediante una linea especial al final del system prompt en aplicaciones que no permiten inyectar variables de plantilla. El nivel `low` desactiva el razonamiento; los niveles superiores incrementan progresivamente la profundidad de comprobacion de requisitos, revision de interpretaciones alternativas y verificacion de calculos y resultados de herramientas. Ademas, el autor publica un `imatrix` construido con prompts y respuestas verificadas en japones e ingles para guiar la cuantizacion Q4 y Q5.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Razonamiento multi-paso con modo "thinking" activable mediante `enable_thinking`.
- Control granular del esfuerzo de razonamiento en cinco niveles (`low`, `medium`, `high`, `xhigh`, `max`).
- Tool calling / function calling con formato compatible con OpenAI (`tools`).
- Uso de herramientas en multiples pasos (multi-step tool use) segun el ajuste declarado.
- Seguimiento de instrucciones y jerarquia de instrucciones reforzados mediante RL.
- Modo conversacional restringido a respuestas de dos frases o menos y sin Markdown (`conversational_mode`).
- Entrada multimodal de imagen y audio mediante el proyector `mmproj-BF16.gguf` (el encoder se mantiene del Gemma 4 original).
- Integracion con llama.cpp y endpoints compatibles con la API de OpenAI.

## Casos de uso

- **Asistentes locales con tool calling**: el modelo puede invocar funciones definidas en el parametro `tools` de la API de llama.cpp y encadenar llamadas en varios pasos, lo que permite construir agentes que consulten APIs externas, bases de datos o servicios web desde un portatil o estacion de trabajo con GPU de consumo.
- **Atencion al cliente en japones e ingles**: el modo conversacional (`conversational_mode: true`) limita las respuestas a dos frases sin Markdown, un formato adecuado para canales de chat donde se requiere brevedad y consistencia estilistica.
- **Razonamiento con presupuesto de computo controlado**: el parametro `effort` permite ajustar la profundidad de razonamiento por peticion; en produccion se puede usar `medium` para consultas rutinarias y `xhigh` o `max` para tareas de verificacion, reduciendo coste en las peticiones simples.
- **Procesamiento de documentos con imagen y audio**: el proyector `mmproj-BF16.gguf` habilita entrada visual y de audio, util para transcripcion o analisis de capturas, graficos o notas de voz en flujos de trabajo internos.
- **Automatizacion de tareas de oficina con verificacion de resultados**: el nivel `max` instruye al modelo a comprobar cada requisito, buscar interpretaciones alternativas y recalcular resultados de herramientas, lo que encaja en tareas donde un error es costoso (conciliacion de datos, extraccion de campos).
- **Prototipado rapido en entornos sin GPU dedicada**: las cuantizaciones Q4_K_M (3,18 GiB) y Q5_K_M (3,37 GiB) permiten ejecutar el modelo en GPUs de consumo con 6-8 GB de VRAM mediante llama.cpp u Ollama.
- **Investigacion sobre post-entrenamiento agentico**: al publicarse las fases de SFT con destilacion de pistas y GRPO, el modelo sirve como referencia reproducible para estudiar el efecto del RL en seguimiento de instrucciones y tool use en modelos de ~4,6B parametros.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Si se publican metricas de fidelidad de cuantizacion frente al modelo en BF16, medidas sobre textos de validacion en japones e ingles no vistos durante el entrenamiento:

| Cuantizacion | Tamano | Mean KLD | Same top p |
|---|---|---|---|
| Q4_K_M | 3,18 GiB | 0,0440 | 92,9 % |
| Q5_K_M | 3,37 GiB | 0,0134 | 96,1 % |
| Q8_0 | 4,61 GiB | 0,0019 | 98,6 % |

No se han publicado resultados de benchmarks de capacidad (razonamiento, codigo, matematicas, tool use) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 3,5-4 GB para Q4_K_M, 3,8-4,3 GB para Q5_K_M y 5-5,5 GB para Q8_0, incluyendo overhead de contexto y cache KV (el contexto exacto no esta disponible).
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 2070); 8 GB o mas para Q8_0 con contexto amplio (RTX 3070, RTX 4060 Ti, RTX 4070). Para despliegue con concurrencia o contexto largo, A100 o H100 no son necesarias pero ofrecen margen.
- **Cabe en GPU de consumo**: si, en la mayoria de GPUs de consumo modernas con 6 GB o mas de VRAM para las cuantizaciones Q4 y Q5.
- **Opciones de despliegue**: `llama-server` (comando indicado en la model card con `--jinja`), llama.cpp en general, y cualquier frontend compatible con GGUF (LM Studio, Ollama, entre otros). El modelo esta etiquetado como `endpoints_compatible`.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `hmkz-1981/gemma-4-e2b-agentic-rl-think-effort-GGUF` | 4,63 B | no disponible | ja, en | Apache 2.0 | GGUF |
| `google/gemma-4-E2B-it` (modelo base) | no disponible en la informacion | no disponible | no disponible en la informacion | Apache 2.0 (heredada) | safetensors |
| `hmkz-1981/gemma-4-e2b-agentic-rl-think-effort` (modelo sin cuantizar) | 4,63 B | no disponible | ja, en | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- **Idiomas**: el modelo esta etiquetado unicamente para japones e ingles; el rendimiento en castellano u otros idiomas no esta validado y puede degradarse de forma significativa.
- **Contexto**: la longitud de contexto no se especifica en la model card; conviene verificarla antes de disenar flujos con documentos largos.
- **Sesgos**: no se documentan evaluaciones de sesgo; al derivar de Gemma 4 y de un ajuste con datos japoneses e ingleses, es probable que herede sesgos del modelo base y del corpus de post-entrenamiento.
- **Alucinacion**: no se publican metricas de factualidad ni de tasa de alucinacion; el modo de razonamiento extendido (`max`) mitiga pero no elimina el riesgo en tareas de verificacion.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de Gemma 4 de Google por si el modelo base impone condiciones adicionales de uso aceptable.
- **Cuantizacion**: las metricas KLD y Same top p miden fidelidad respecto a BF16, no calidad absoluta; Q4_K_M presenta una divergencia no trivial (KLD 0,0440) que puede afectar a tareas sensibles.
- **Multimodalidad**: el proyector `mmproj` se mantiene del Gemma 4 original y no ha sido reentrenado; su calidad en imagen y audio no esta evaluada en la informacion disponible.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/hmkz-1981/gemma-4-e2b-agentic-rl-think-effort-GGUF
- Modelo base sin cuantizar: https://huggingface.co/hmkz-1981/gemma-4-e2b-agentic-rl-think-effort
- Modelo original de Google: `google/gemma-4-E2B-it` (referenciado en la model card; URL no incluida en la informacion)
- llama.cpp (commit `1d81992`): https://github.com/ggml-org/llama.cpp
