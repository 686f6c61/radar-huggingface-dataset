# kai-os/Carnice-V3

## Resumen

Carnice-V3 es un modelo de lenguaje multimodal (imagen-texto) desarrollado por kai-os, construido como un finetune del modelo Qwen/Qwen3.8-27B mediante la fusión de una LoRA de rango 64 con factor de escala rsLoRA sobre todos los módulos lineales de lenguaje. El resultado es un checkpoint completo en BF16, autocontenido, que no requiere PEFT ni descargas adicionales del modelo base. Está orientado específicamente al runtime de agente Hermes Agent, con soporte para tool calling, razonamiento multi-paso y generación de llamadas a funciones en formato XML.

El modelo se presenta como una alternativa open source (licencia Apache 2.0) para experimentos de agente, pero su propia model card advierte que no ha superado el control de calidad formal del proyecto: en un diagnóstico post-hoc de cinco casos, completó sin límites 3 de 5 tareas y pasó 0 de 5 contratos de tool exactos, frente a 5/5 y 2/5 del modelo base. Por tanto, su uso en producción autónoma o en tareas de alto riesgo no está recomendado sin evaluación independiente y controles de ejecución robustos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con bloque MTP congelado |
| Parametros totales | 27.781.427.952 (BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (formato original); no se publican cuantizaciones oficiales |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards + indice) |

## Arquitectura y entrenamiento

Carnice-V3 parte del checkpoint Qwen/Qwen3.8-27B en su revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. La arquitectura es un transformer denso con 27.781 millones de parametros, que incluye un bloque de prediccion multi-token (MTP) de 15 tensores que permanece congelado y no se instancia en la clase de inferencia `AutoModelForImageTextToText`. El entrenamiento consistio en una LoRA de rango 64 con factor rsLoRA aplicada a todos los modulos lineales de lenguaje auditados, seguida de una fusion segura de los pesos en un checkpoint Transformers estandar. No se trata de un SFT de parametros completos, y la model card lo declara explicitamente.

No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO. El modelo se publica como un checkpoint fusionado, no como un adaptador, y se valido con Transformers 5.15.0.

## Capacidades

- Generacion de texto y razonamiento multi-paso con soporte de modo "thinking" (razonamiento explicito) y niveles de esfuerzo de razonamiento, incluido `reasoning_effort="xhigh"`.
- Tool calling / function calling: soporta definiciones de herramientas en formato OpenAI-style y serializa las llamadas en un envoltorio XML estilo Hermes (`<tool_call>`, `<function=...>`, `<tool_response>`).
- Capacidad de agente: disenado para el runtime Hermes Agent, con gestion de historial de respuestas de herramientas y contexto largo.
- Multimodalidad: el pipeline es `image-text-to-text`, por lo que puede procesar entradas de imagen ademas de texto, aunque no se detallan capacidades especificas de vision.
- Compatibilidad con el template de chat de Qwen3.8-27B, que incluye soporte para thinking habilitado o deshabilitado.

## Casos de uso

- Evaluacion controlada de agentes: el modelo puede usarse en experimentos de laboratorio para comparar su comportamiento con el modelo base Qwen3.8-27B en tareas de tool calling y razonamiento, siempre con supervision humana y limites de ejecucion.
- Investigacion sobre post-entrenamiento de agentes: util para estudiar el efecto de LoRA de alto rango sobre la consistencia de llamadas a herramientas y la finalizacion de tareas de largo horizonte.
- Pruebas de integracion en runtimes de agente: permite validar la compatibilidad del template de chat y el formato XML de function-call en entornos como Hermes Agent, antes de decidir su adopcion.
- Fine-tuning posterior: al ser un checkpoint completo bajo licencia Apache 2.0, puede servir como punto de partida para nuevos entrenamientos con datos propios, respetando la licencia.
- Benchmarking de robustez: su diagnostico post-hoc (3/5 tareas completadas, 0/5 contratos exactos) lo convierte en un caso de estudio para medir la degradacion de calidad en agentes tras un ajuste fino especifico.
- Demostraciones educativas: en entornos de ensenanza sobre agentes y tool calling, puede ilustrar las diferencias entre un modelo base y un finetune orientado a agente, incluyendo sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye un diagnostico post-hoc de cinco casos de desarrollo Hermes, con los siguientes resultados:

| Metrica | Carnice-V3 | Qwen3.8-27B (base) |
|---|---|---|
| Tareas completadas sin limite de runtime o generacion | 3/5 | 5/5 |
| Contratos de tool exactos a nivel de tarea | 0/5 | 2/5 |

Estos datos indican una degradacion significativa en la fiabilidad de ejecucion de tareas de agente en comparacion con el modelo base, y deben interpretarse como una advertencia, no como una validacion de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55-60 GB, dado que el repositorio ocupa 55,6 GB en pesos BF16. Se requiere una GPU con al menos 80 GB de VRAM para cargar el modelo completo sin cuantizacion.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o multiples GPUs con paralelismo de datos (por ejemplo, 2x RTX 4090 de 24 GB con offload).
- No se ofrecen cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware de consumo (RTX 3090/4090) no es viable sin cuantizacion externa no publicada.
- Opciones de despliegue: al ser un checkpoint Transformers estandar, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay guias oficiales. El ejemplo de carga usa `transformers` con `device_map="auto"`.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia alta en generacion larga (hasta 32.768 tokens de salida en el ejemplo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Carnice-V3 (kai-os) | 27,78 B | no disponible | Apache 2.0 | Finetune de Qwen3.8-27B para agente Hermes |
| Qwen3.8-27B (base) | 27,78 B | no disponible | Apache 2.0 | Modelo base multimodal y de texto |
| Carnice-9b (kai-os) | 9 B | no disponible | Apache 2.0 | Finetune de Qwen3.5-9B para agente Hermes |

Carnice-V3 es un derivado directo de Qwen3.8-27B, por lo que la comparacion mas relevante es contra su base. No se dispone de datos de otros modelos de agente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte explicitamente que el modelo no ha pasado el control de calidad formal del proyecto y puede perjudicar la finalizacion de tareas de largo horizonte.
- En el diagnostico post-hoc, Carnice-V3 completo solo 3 de 5 tareas sin limites y fallo en todos los contratos de tool exactos, lo que indica un riesgo alto de alucinacion o bucles en llamadas a herramientas.
- No debe usarse en produccion autonoma, operaciones sensibles a la seguridad, tareas de alto riesgo o flujos donde un agente incompleto o en bucle pueda causar dano o coste.
- El modelo no incluye herramientas por si mismo; la ejecucion, permisos, gestion de resultados, timeouts y sandboxing son responsabilidad del runtime del agente.
- Solo soporta ingles (en), sin evidencia de capacidades multilingues.
- No se proporcionan datos de contexto maximo, por lo que se desconoce su ventana real; se recomienda configurar limites explicitos de contexto, respuesta e iteraciones.
- La licencia Apache 2.0 permite uso comercial, pero las advertencias de calidad limitan su aplicabilidad en entornos productivos sin evaluacion independiente.

## Enlaces

- [HuggingFace: kai-os/Carnice-V3](https://huggingface.co/kai-os/Carnice-V3)
- [Coleccion Carnice en HuggingFace](https://huggingface.co/collections/kai-os/carnice)
- [Carnice-9b en HuggingFace](https://huggingface.co/kai-os/Carnice-9b)
- [Articulo de HackerNoon sobre Carnice-9b](https://hackernoon.com/this-9b-model-was-trained-for-tool-calling-terminal-work-and-browser-automation)
- [Repositorio GitHub de despliegue local de Carnice-9b](https://github.com/bwjbuild/carnice-local-llm)
