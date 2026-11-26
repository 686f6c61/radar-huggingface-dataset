# JamieBradfield/qwen3.8-9b-hermes-fc-tooluse

## Resumen

Qwen3.8-9B Hermes FC — Tooluse es un ajuste fino por QLoRA del modelo destilado Empero/Qwen3.8-9B-Distill, publicado por JamieBradfield. El objetivo declarado es enseñar al modelo a planificar con llamadas a la herramienta `todo` antes de abordar tareas de múltiples pasos, partiendo de un corpus de 218 trayectorias destiladas del profesor GLM-5.3-Flash. Se distribuye como un merge completo en BF16 (13 shards, 18,9 GB) con licencia Apache-2.0.

El modelo parte de la familia Qwen3.5 (arquitectura `Qwen3_5ForConditionalGeneration`), con 9.438.410.240 parámetros en safetensors y una torre visual eliminada en el merge, por lo que el resultado es solo texto. El vocabulario se amplió de 248.077 a 248.079 entradas con dos tokens de herramienta (`<|tool_call|>` y `<|tool_response|>`), y se preserva la cabeza MTP (multi-token prediction) de 15 claves del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de SFT sobre tool calling; por otro, su propia model card incluye una corrección metodológica de evaluación que invalida parcialmente las métricas publicadas originalmente. El autor congeló el programa de fine-tuning el 2026-09-03 y recomienda el modelo base como opción por defecto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForConditionalGeneration` con cabeza MTP (multi-token prediction), torre visual eliminada |
| Parametros totales | 9.438.410.240 (9,44 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configuración de servicio indicada en la model card: `CTX=65536`) |
| Tipos de cuantizacion | BF16 (merge completo); GGUF ROCmFPX en repositorio complementario; QLoRA 4-bit usado solo durante entrenamiento |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 shards, 18,9 GB); GGUF en repo companion |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con 9,44 B de parámetros, adaptado desde el destilado Empero/Qwen3.8-9B-Distill. El merge conserva la cabeza MTP de 15 claves del modelo base, con `text_config.vocab_size = 248079` tras añadir dos tokens de herramienta al vocabulario original de 248.077. La torre visual se descarta, de modo que el checkpoint final es estrictamente de texto pese a que los tags de Hugging Face incluyan `image-text-to-text`.

El entrenamiento consistió en un QLoRA de 4 bits con rango 16, alpha 16, dropout 0, batch 1 con acumulación de gradiente 8 (efectivo 8), learning rate 2e-4, warmup 0.1 y `MAX_SEQ` de 6144 durante 8 épocas, lo que suma 214 pasos (loss final 0,02085; loss medio de entrenamiento 0,09405). Los datos son 218 trayectorias en formato ShareGPT con 551 llamadas a `todo`, generadas por GLM-5.3-Flash sobre 112 tareas sintéticas extraídas del corpus de agentes del autor: 190 trayectorias de profesor (85 % verificadas por ejecución en sandbox, con fallos y recuperaciones inyectados en el 15,8 % de las filas), 61 filas con cadena de pensamiento corta destilada, 159 solo con envelope y 12 tareas sintéticas de búsqueda web. El warm start fue el merge de v27 (`qwen3.8-9b-hermes-fc-todo`) con un adaptador QLoRA encima, de modo que los tokens de herramienta ya estaban integrados.

## Capacidades

- Generación de texto conversacional en inglés con soporte de plantilla de chat de Qwen3.5.
- Llamada a funciones y uso de herramientas mediante los tokens `<|tool_call|>` y `<|tool_response|>`.
- Planificación "todo-first": el modelo tiende a invocar la herramienta `todo` antes de resolver tareas de múltiples pasos.
- Razonamiento multi-paso con cadenas de pensamiento cortas destiladas en 61 de las filas de entrenamiento.
- Búsqueda web simulada: 12 tareas sintéticas de web search en el corpus.
- Capacidad de decodificación multi-token gracias a la cabeza MTP heredada del modelo base.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión: no disponibles (torre visual eliminada en el merge).
- Capacidades de audio: no disponibles.

## Casos de uso

- Automatización de agentes de planificación: el modelo puede generar una lista de tareas estructurada mediante la herramienta `todo` antes de ejecutar pasos, lo que resulta útil en orquestadores que necesitan descomponer peticiones complejas en subtareas verificables.
- Integración en pipelines de CI/CD con function calling: los tokens de herramienta dedicados permiten conectar el modelo a APIs de build, test y despliegue, aunque debe validarse el formato de salida contra el cliente real (véase la corrección metodológica en la model card).
- Asistentes de refactorización de código: el corpus de entrenamiento incluye tareas de refactor + tests + docs, por lo que el modelo está expuesto a flujos de trabajo de ingeniería de software en inglés.
- Búsqueda web asistida: las 12 tareas sintéticas de web search permiten prototipar agentes que deciden cuándo consultar una fuente externa, siempre con validación adicional en producción.
- Investigación sobre SFT y tool use: el checkpoint y su dataset publicado (`hermes-fc-v28-data`) sirven como artefacto reproducible para estudiar cómo el ajuste fino altera la planificación y la contención en llamadas a herramientas.
- Evaluación de metodologías de benchmark: la corrección publicada el 2026-09-03 y los scripts `native_battery.py`, `todo_probes.jsonl` y `no_drift_probes.jsonl` permiten reproducir la comparación entre interfaz sintética e interfaz nativa de OpenAI `tools`.
- Prototipado en local con GGUF: el repositorio companion con cuantización ROCmFPX permite desplegar el modelo en entornos con GPU AMD o consumer, siempre que se acepte la pérdida de fidelidad de formato asociada a la cuantización.

## Benchmarks y rendimiento

La model card publica dos baterías de evaluación. La primera, sobre interfaz sintética (esquemas de herramienta embebidos en el texto del sistema, sin parámetro `tools`, exigiendo XML `<tool_call>` en la respuesta), es la que certificó el checkpoint originalmente. La segunda, corregida el 2026-09-03, usa la ruta nativa de OpenAI `tools` que emplea Hermes.

Batería sintética (greedy, esquema `todo` en cada prompt, 40 sondas):

| Tier | Modelo | fired | name=todo | todos_ok | format_exact |
|---|---|---|---|---|---|
| T1 (real, held-out) | v27 | 13/20 | 11/20 | 11/20 | 0/20 |
| T1 | v28 ckpt-175 (este modelo) | 17/20 | 16/20 | 16/20 | 4/20 |
| T2 (multi-paso novedoso) | v27 | 9/10 | 7/10 | 7/10 | 3/10 |
| T2 | v28 ckpt-175 | 8/10 | 7/10 | 7/10 | 4/10 |
| T3 (trivial, se espera 0) | v27 | 5/10 | 1/10 | 1/10 | 2/10 |
| T3 | v28 ckpt-175 | 5/10 | 1/10 | 1/10 | 4/10 |

Batería nativa corregida (ruta `tools`, mismas 4 herramientas, greedy):

| Modelo | tier-1 fired | tier-1 name=todo | tier-2 todo-first | tier-3 fired (deseado 0) | tier-4 fired (deseado 0) |
|---|---|---|---|---|---|
| Base sin fine-tune | 18/20 | 17/20 | 3/10 | 5/10 | 0/10 |
| v28 ckpt-175 (este modelo) | 17/20 | 10/20 | 8/10 | 9/10 | 4/10 |
| armB2-175 (reentrenamiento limpio) | 10/20 | 8/20 | 10/10 | 4/10 | 0/10 |

La lectura corregida es que el fine-tune mejora la planificación todo-first en tareas multi-paso (de 3/10 en el base a 8/10 en v28 y 10/10 en armB2), pero degrada la contención: el tier-3 de sobre-disparo sube de 5/10 a 9/10 y el tier-4 de deriva de herramienta en trivialidades pasa de 0/10 a 4/10. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18,9 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto moderado y 40-80 GB para contexto largo (65.536 tokens).
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, con degradación de calidad no cuantificada en la model card.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para BF16 con contexto completo; RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto recortado o en 8 bits con contexto medio.
- GPU consumer: cabe en RTX 3090/4090 (24 GB) en BF16 con contexto limitado, y en GPUs de 12-16 GB únicamente con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving en BF16, llama.cpp/Ollama para el GGUF ROCmFPX del repositorio companion. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes FC (este) | 9,44 B | 65.536 | Sí, con tokens dedicados; contención degradada según batería nativa | Apache-2.0 | Hugging Face, 256 descargas |
| Empero/Qwen3.8-9B-Distill (base) | 9,2 B aprox. | no disponible | Sí, nativo vía `tools` (18/20 tier-1, 0/10 tier-4) | Apache-2.0 | Hugging Face |
| armB2-175 (reentrenamiento limpio del autor) | 9,44 B | no disponible | Sí, mejor todo-first (10/10 tier-2) pero sobre-supresión (10/20 tier-1) | no disponible | No publicado como checkpoint independiente en la información disponible |
| v27 (`qwen3.8-9b-hermes-fc-todo`) | 9,2 B aprox. | no disponible | Sí, versión previa del linaje | no disponible | Hugging Face |

La comparativa se limita al linaje del propio autor porque la información proporcionada no incluye referencias a modelos externos de la misma categoría. No disponible para alternativas como Qwen3 estándar, Llama 3.1 8B o Mistral 7B en cuanto a métricas directas.

## Limitaciones y advertencias

- La corrección metodológica del 2026-09-03 invalida la afirmación original de que el modelo base "no contribuye tool calling": el base ya llamaba herramientas correctamente por la ruta nativa `tools`, y el arnés sintético medía una interfaz que no coincide con la del chat template ni con la ruta de Hermes.
- El fine-tune introduce regresiones de contención: sobre-disparo en tareas triviales (tier-3 de 5/10 a 9/10) y deriva de herramienta en preguntas de trivia (tier-4 de 0/10 a 4/10).
- El corpus de entrenamiento carece de filas "sin llamada / solo respuesta", lo que provoca que el checkpoint final (214) sobreajuste y no sepa declinar una herramienta; por eso se publica el 175.
- El modelo solo declara inglés; no hay evidencia de capacidades multilingües.
- La torre visual fue eliminada: no admite entradas de imagen pese a los tags `image-text-to-text` del repositorio.
- Riesgo de alucinación: no cuantificado en la model card; el corpus es sintético y destilado de un profesor, con el 15 % de las filas conteniendo fallos inyectados.
- El formato de salida XML `<tool_call>` que el arnés sintético exigía no coincide con la plantilla de chat del modelo base; los clientes deben usar la ruta nativa `tools`.
- El autor congeló el programa de fine-tuning y recomienda el modelo base como opción por defecto en runtime; este checkpoint se conserva como demostración medida, no como artefacto de producción.
- Licencia Apache-2.0 permite uso comercial, pero la model card no ofrece garantías sobre el comportamiento en dominios fuera del corpus de entrenamiento.
- El repositorio tiene 256 descargas y 1 like, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse
- Modelo base destilado: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo base referenciado en la model card: https://huggingface.co/Empero/Qwen3.8-9B
- Dataset de entrenamiento (referenciado como `hermes-fc-v28-data`): no disponible como URL directa en la información proporcionada
- Repositorio companion con GGUF ROCmFPX: no disponible como URL directa en la información proporcionada
- Scripts de reproducción (`scripts/native_battery.py`, `scripts/todo_probes.jsonl`, `scripts/no_drift_probes.jsonl`): incluidos en el repositorio del modelo, sin URL directa en la información proporcionada
- Apoyo al autor: https://ko-fi.com/jamesonbradfield
