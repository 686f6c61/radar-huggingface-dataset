# autotrust/JEV-27B-VL

## Resumen

JEV-27B-VL es un modelo multimodal de tipo image-text-to-text desarrollado por autotrust, construido como un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B. Su propuesta central es convertirse en un "modelo de decisión" (decision model): en lugar de generar texto libre, expone decisiones tipadas con probabilidades calibradas, lo que permite integrarlo en sistemas de ranking, recomendación y búsqueda sin necesidad de un equipo completo de reordenación. Incorpora un esquema de dos sistemas (System 1 rápido y System 2 con razonamiento) heredado del modelo base.

El modelo resuelve el problema de convertir un LLM generativo en un componente de decisión fiable y medible: cada elección se emite como una distribución de probabilidad sobre opciones discretas, lo que facilita la evaluación y la integración en pipelines. Es relevante ahora porque demuestra que un adaptador pequeño sobre un modelo denso de 27B puede competir en benchmarks de razonamiento encarnado (ERQA) con modelos cerrados de primera línea, sin entrenamiento específico en datos de robótica.

La arquitectura subyacente es un transformer denso de 27.781.427.952 parámetros (según los pesos en safetensors), con capacidades de visión y un modo de razonamiento opcional. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para despliegue conversacional y mediante vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), adaptador LoRA sobre Qwen/Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (base_model_relation: adapter) sobre Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,8 mil millones de parámetros con torre de visión. La innovación principal no está en la arquitectura del transformer, sino en el esquema de decisión: el modelo emite "typed decisions" con probabilidades calibradas, y distingue entre System 1 (una pasada rápida, sin razonamiento explícito) y System 2 (el modelo base sin modificar, que razona antes de responder y cuya distribución de respuesta se combina al 50/50 con la de System 1). El modo `thinking` admite los valores `on`, `off` y `auto`; en `auto` solo se activa el razonamiento cuando la confianza de System 1 es inferior a 0,8.

Los datos de entrenamiento provienen del corpus SargeDev/jev-distill-corpus-v3, descrito en la model card como exclusivamente textual: no se incluyeron datos de robots ni de razonamiento encarnado en el entrenamiento de decisión. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Se citan dos referencias arXiv (2609.14973 y 2512.16899) que probablemente documentan el método, aunque su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multimodal (imagen + texto) mediante pipeline image-text-to-text.
- Decisiones tipadas con probabilidades calibradas: emisión de distribuciones sobre opciones discretas (por ejemplo, preguntas de elección múltiple A-D) a través del endpoint `POST /v1/decide`.
- Modo System 1 (una pasada, baja latencia) y System 2 (razonamiento explícito con el modelo base), con control mediante el parámetro `thinking` (`on`, `off`, `auto`).
- Modo `thinking: "auto"` que activa el razonamiento solo cuando la confianza de System 1 es inferior a 0,8, equilibrando latencia y precisión.
- Razonamiento espacial, de acción, de trayectoria, de estimación de estado, de tarea y multivista sobre imágenes, según las categorías evaluadas en ERQA.
- Razonamiento encarnado zero-shot sin entrenamiento específico en robótica.
- Capacidades de recomendación y reordenación de resultados de búsqueda (demostrado en la demo GuruSearch).
- Soporte de despliegue con vLLM y servidor propio (`serve.sh`).
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo System 2 implica razonamiento en varios pasos.

## Casos de uso

- Reordenación de resultados de búsqueda: el modelo recibe consulta y candidatos y emite una decisión calibrada de relevancia por resultado, como en la demo GuruSearch que reordena Google News, Bing News y Yahoo News junto a una respuesta corta con citas. Es adecuado porque la salida probabilística permite umbrales y comparaciones directas.
- Recomendación de contenidos: ranking de titulares de múltiples fuentes por importancia en aproximadamente medio segundo por decisión (System 1), lo que permite actualizaciones frecuentes en producción.
- Razonamiento encarnado y robótica: responder preguntas de elección múltiple sobre escenas reales de robot (estado de un cajón, trayectoria de un gripper, éxito de una tarea) con 61,5% en ERQA en modo thinking medium, sin entrenamiento específico en robótica.
- Moderación y clasificación con probabilidades calibradas: usar el endpoint de decisión para asignar categorías con confianza medible, aprovechando la calibración para fijar umbrales de revisión humana.
- Asistentes conversacionales multimodales: conversaciones multi-turno con imágenes en inglés, con la posibilidad de activar razonamiento solo en consultas de baja confianza para controlar coste y latencia.
- Evaluación automatizada de sistemas visuales: usar el modo `choice` para convertir preguntas abiertas de benchmarks en decisiones discretas, evitando pérdidas por formato de respuesta.
- Enrutamiento con razonamiento adaptativo: el modo `thinking: "auto"` permite desplegar un único modelo que responde rápido en la mayoría de consultas y razona solo cuando la confianza es baja, reduciendo el coste medio de inferencia.

## Benchmarks y rendimiento

Resultados en ERQA (400 preguntas de elección múltiple, azar aproximado del 26%, intervalo del 95% de ±5 puntos), medidos por el autor con su propio `serve.sh` en una GPU B200:

| Tipo de pregunta | Preguntas | Una pasada | Thinking (low) | Thinking (medium) |
|---|---:|---:|---:|---:|
| **Total** | 400 | **53,8%** | **60,0%** | **61,5%** |
| Razonamiento espacial | 84 | 53,6% | 59,5% | 58,3% |
| Razonamiento de acción | 72 | 58,3% | 54,2% | 59,7% |
| Razonamiento de trayectoria | 66 | 51,5% | 65,2% | 63,6% |
| Estimación de estado | 55 | 65,5% | 72,7% | 63,6% |
| Razonamiento de tarea | 38 | 55,3% | 65,8% | 60,5% |
| Razonamiento multivista | 37 | 32,4% | 37,8% | 54,1% |
| Pointing | 34 | 67,6% | 73,5% | 88,2% |
| Otros | 14 | 14,3% | 28,6% | 28,6% |

Comparativa en ERQA según la tabla publicada por el autor:

| Puesto | Modelo | Ajuste | ERQA | Datos de robótica |
|---:|---|---|---:|---|
| 1 | GPT 6 Astra | cerrado, low thinking | 75,8 | — |
| 2 | Gemini 3.6 Flash | cerrado, minimal thinking | 72,3 | — |
| 3 | JEV-27B-VL | thinking on (medium) | 61,5 | ninguno (solo texto) |
| 3 | Claude Opus 5 | cerrado, adaptive low effort | 61,5 | — |
| 5 | JEV-27B-VL | thinking on (low) | 60,0 | ninguno (solo texto) |
| 6 | vllm-sr/d3 (27B) | una pasada | 58,8 | no revelado |
| 7 | GEV-26B-Decide | thinking on | 56,8 | ninguno (solo texto) |
| 8 | Hy-Embodied-VLM-1.0 (30B-A3B) | thinking | 56,3 | sí |
| 9 | JEV-27B-VL | una pasada | 53,8 | ninguno (solo texto) |
| 10 | PhysBrain 1.5 (8B) | — | 52,8 | sí |
| 11 | JEV-35B | una pasada | 51,3 | ninguno (solo texto) |
| 12 | Cosmos3 Nano (8B + 8B) | — | 47,5 | sí |

Datos adicionales de latencia y longitud de razonamiento: mediana de 687 tokens de pensamiento en low y 814 en medium; mediana de 1,15 s por pregunta en una pasada (16 peticiones en paralelo), 12,1 s en low y 13,9 s en medium (8 peticiones en paralelo). Con `thinking: "auto"` (305 de 400 preguntas activaron razonamiento) se obtuvo 59,5% en low y 61,0% en medium. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27,78 mil millones de parámetros en safetensors, en FP16 se necesitan aproximadamente 56 GB solo para pesos, más memoria para el contexto y la torre de visión.
- GPU recomendadas: el autor reporta mediciones en una NVIDIA B200; para FP16 se requiere una GPU con 80 GB o más (A100 80GB, H100, B200).
- Cabe en GPU de consumo: no en FP16; con cuantización de 4 bits podría aproximarse a los 16-18 GB, aunque no se publican cuantizaciones oficiales ni cifras verificadas.
- Opciones de despliegue: vLLM (etiqueta oficial), transformers, y el `serve.sh` propio del autor que expone `POST /v1/decide` y modo conversacional.
- Latencia y throughput: 1,15 s por pregunta en System 1 con 16 peticiones paralelas; 12-14 s por pregunta con thinking y 8 peticiones paralelas, en una B200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ERQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEV-27B-VL | 27,78B | no disponible | 61,5% (thinking medium) | Apache 2.0 | Hugging Face |
| GEV-26B-Decide | ~26B | no disponible | 56,8% (thinking) | no disponible | no disponible |
| Hy-Embodied-VLM-1.0 | 30B-A3B (MoE) | no disponible | 56,3% (thinking) | no disponible | no disponible |
| PhysBrain 1.5 | 8B | no disponible | 52,8% | no disponible | no disponible |
| vllm-sr/d3 | 27B | no disponible | 58,8% (una pasada) | no disponible | no disponible |

La comparativa se limita a los datos de ERQA publicados por el autor; no se dispone de información sobre contexto, licencia ni disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés (`language: en`); el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto: no disponible en la model card; conviene verificarla antes de usos con documentos largos.
- Riesgo de alucinación: inherente a un modelo generativo de 27B; el modo de decisión con probabilidades calibradas mitiga parte del problema en tareas de elección, pero no en generación libre.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Calibración: las probabilidades calibradas son una afirmación del autor; no se aportan métricas de calibración (ECE, Brier) en la información disponible.
- Resultados de ERQA: medidos por el propio autor con su servidor, sobre 400 preguntas con intervalo del 95% de ±5 puntos; la comparación con modelos cerrados proviene de terceros (informe PhysBrain 1.5) y no de una evaluación independiente uniforme.
- Entrenamiento sin datos de robótica: el buen resultado en ERQA es zero-shot; no hay garantía de comportamiento en control de robots reales.
- Licencia Apache 2.0: permite uso comercial, pero al ser un adaptador sobre Qwen/Qwen3.8-27B conviene verificar que la licencia del modelo base sea compatible.
- Producción: el endpoint `POST /v1/decide` y el `serve.sh` son herramientas del autor; no se documenta su madurez ni soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/JEV-27B-VL
- Blog del autor: https://huggingface.co/blog/autotrust/one-decision-model-instead-of-a-ranking-team-short
- Demo en vivo (GuruSearch): https://news.guru.so/ui
- Benchmark ERQA: https://github.com/embodiedreasoning/ERQA
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper 1: https://arxiv.org/abs/2609.14973
- Paper 2: https://arxiv.org/abs/2512.16899
