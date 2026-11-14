# krystofmitka/gemma-4-26B-A4B-effort-checkpoint167

## Resumen

Gemma 4 26B A4B effort-checkpoint167 es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-26B-A4B-it de Google DeepMind, publicado por el usuario krystofmitka. Se trata de un checkpoint intermedio, concretamente el paso 167 de un entrenamiento que estaba planificado para 500 pasos y que quedó pausado. El modelo incorpora un adaptador LoRA de GRPO fusionado sobre los pesos de un calentamiento supervisado (supervised warm-up), por lo que se distribuye como un único conjunto de pesos BF16 completamente fusionado, sin necesidad de cargar el adaptador por separado.

La innovación principal es el control de esfuerzo de razonamiento (effort control): un mismo conjunto de pesos soporta cuatro niveles de esfuerzo (25, 50, 75 y 100) que se seleccionan mediante una línea concreta en el system prompt. Estos valores expresan preferencias de razonamiento aprendidas, no límites duros de tokens. El modelo mantiene la arquitectura MoE del modelo base, con aproximadamente 25.800 millones de parámetros totales y unos 4.000 millones activos por token (de ahí la denominación A4B), y soporta entradas de imagen y texto con una ventana de contexto de 262.144 tokens.

Es relevante ahora porque explora una vía práctica para controlar el coste computacional del razonamiento en modelos abiertos multimodales: en lugar de entrenar variantes separadas para cada nivel de esfuerzo, un solo checkpoint permite ajustar la profundidad del razonamiento en tiempo de inferencia. No obstante, la evaluación publicada es preliminar y limitada a GPQA-Diamond, por lo que sus resultados no deben interpretarse como una validación general de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (hereda la de google/gemma-4-26B-A4B-it) |
| Parametros totales | 25.805.933.872 |
| Parametros activos | Aproximadamente 4.000 millones (denominacion A4B del modelo base) |
| Longitud de contexto | 262.144 tokens (segun la configuracion de evaluacion y el ejemplo de vLLM) |
| Tipos de cuantizacion | No disponible (el checkpoint publicado es BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | Safetensors (BF16, fusionados; tamano del repo 51,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer multimodal de tipo mixture-of-experts con unos 25.800 millones de parámetros totales y aproximadamente 4.000 millones activos por token. Procesa entradas de imagen y texto (pipeline image-text-to-text) y conserva el procesador, tokenizador, chat template y configuración originales del modelo base, empaquetados junto con los pesos fusionados exactos usados en la evaluación del checkpoint 167.

El entrenamiento consistió en un calentamiento supervisado seguido de un ajuste con GRPO (Group Relative Policy Optimization), cuyo adaptador LoRA se fusionó en los pesos en el paso 167. El objetivo era aprender una condicionamiento por esfuerzo de razonamiento: los cuatro niveles (25, 50, 75 y 100) se activan mediante la primera línea del system prompt («Reasoning Effort: N (range 1–100; higher values request more thorough reasoning)») y requieren mantener el modo thinking activado. El entrenamiento quedó pausado en el paso 167 y no alcanzó el checkpoint de 500 pasos previsto; el autor documenta la identidad del checkpoint, la revisión del modelo original, el SHA-256 del adaptador y el alcance de la evaluación en checkpoint_metadata.json y weights_manifest.json.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen y texto) heredados del modelo base Gemma 4.
- Razonamiento con modo thinking explícito, con canal de pensamiento separado de la respuesta final.
- Control de esfuerzo de razonamiento en cuatro niveles entrenados (25, 50, 75 y 100) mediante system prompt.
- Razonamiento matemático y resolución de problemas paso a paso (el ejemplo de la model card resuelve una ecuación lineal con explicación).
- Respuestas conversacionales multi-turno con chat template compatible con Transformers y vLLM.
- Soporte de contexto largo de hasta 262.144 tokens en la configuración de evaluación.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Razonamiento matemático con coste ajustable: para problemas simples se selecciona effort 25 (media de 4.726 tokens de pensamiento en GPQA-Diamond) y para problemas complejos effort 75 u 100, permitiendo equilibrar precisión y coste en un mismo despliegue.
- Análisis de documentos e imágenes combinados: la entrada image-text-to-text permite procesar capturas, diagramas o páginas escaneadas junto con preguntas de texto en un único flujo conversacional.
- Asistentes de investigación con contexto largo: la ventana de 262.144 tokens permite cargar artículos completos o expedientes extensos y formular preguntas sobre ellos sin trocear el contenido.
- Despliegue en producción con vLLM: el autor documenta el servicio mediante `vllm serve` con `--max-model-len 262144`, lo que facilita integrarlo en infraestructuras de inferencia existentes con API compatible con chat completions.
- Evaluación comparativa de estrategias de razonamiento: al soportar cuatro niveles de esfuerzo con los mismos pesos, sirve para estudiar en investigación la relación entre tokens de pensamiento y precisión sin cambiar de modelo.
- Generación de explicaciones didácticas: el modo thinking produce un canal de razonamiento separado que puede mostrarse o auditarse por separado de la respuesta final en aplicaciones educativas.
- Prototipado de asistentes conversacionales multimodales: el chat template y el procesador originales permiten integrarlo con Transformers 5.20.2 y PyTorch 2.14.0 en entornos de experimentación.

## Benchmarks y rendimiento

Resultados preliminares de una única pasada sobre GPQA-Diamond (198 preguntas respondidas por configuración), con temperatura 1.0, top-p 0.95, top-k 64, máximo de 65.536 tokens de salida, contexto de 262.144 tokens, vLLM y EvalScope 1.14.1. Ninguna respuesta fue truncada. No hay agregados multi-semilla ni intervalos de confianza.

| Configuracion | Precision | Media tokens de pensamiento | Media tokens de salida |
|---|---:|---:|---:|
| Gemma 4 original | 79,80% | 11.040 | 11.822 |
| Checkpoint 167, sin linea de esfuerzo | 80,81% | 8.849 | 9.580 |
| Checkpoint 167, effort 25 | 81,31% | 4.726 | 5.238 |
| Checkpoint 167, effort 50 | 76,26% | 6.147 | 6.781 |
| Checkpoint 167, effort 75 | 81,82% | 8.131 | 8.852 |
| Checkpoint 167, effort 100 | 79,29% | 8.362 | 9.092 |

La evaluación de doce benchmarks se detuvo a petición del propietario: la pasada de MMLU-Pro quedó incompleta y los otros diez benchmarks no se iniciaron. Por tanto, estos resultados no demuestran preservación general de capacidades ni ganancias de precisión. Un experimento posterior con effort 10 también se detuvo antes de completarse y no es una configuración soportada en esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 52 GB solo para los pesos BF16, más memoria adicional para el contexto y el estado de inferencia; con contexto de 262.144 tokens el consumo de KV cache es considerable.
- GPU recomendadas: el autor menciona una evaluación en B300 con backends Triton de atención y MoE; para BF16 se requieren GPUs con al menos 80 GB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU con `device_map="auto"`.
- No cabe en GPUs de consumo en BF16 (RTX 4090 con 24 GB, RTX 3090 con 24 GB); se necesitaría cuantización, que no está documentada oficialmente para este checkpoint.
- Opciones de despliegue: Transformers (versión con soporte de Gemma 4; el autor usó 5.20.2 con PyTorch 2.14.0) y vLLM con soporte de Gemma 4 mediante `vllm serve`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| krystofmitka/gemma-4-26B-A4B-effort-checkpoint167 | 25,8 B (MoE, ~4 B activos) | 262.144 | Apache 2.0 | Fine-tune GRPO con control de esfuerzo; checkpoint intermedio (paso 167 de 500) |
| google/gemma-4-26B-A4B-it | 25,8 B (MoE, ~4 B activos) | No disponible en la informacion | Apache 2.0 | Modelo base original; 79,80% en GPQA-Diamond segun la evaluacion del autor del fine-tune |
| Otros fine-tunes de razonamiento sobre Gemma 4 | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento se pausó en el paso 167 de los 500 planificados; el autor indica explícitamente que esta no es la versión final prevista.
- Evaluación muy limitada: solo GPQA-Diamond con una única pasada y sin intervalos de confianza; la evaluación de doce benchmarks quedó incompleta. No hay evidencia de preservación general de capacidades.
- Resultados inconsistentes entre niveles: effort 50 obtiene 76,26%, por debajo del modelo original (79,80%), lo que sugiere que no todos los niveles entrenados mejoran el rendimiento de forma fiable.
- Valores de esfuerzo fuera de 25, 50, 75 y 100 no están validados para esta versión.
- El modo thinking debe permanecer activado (`enable_thinking=True`); desactivarlo puede alterar el comportamiento esperado.
- Riesgo de alucinación y sesgos: no documentados específicamente para este fine-tune; se heredan los del modelo base, no descritos en la información disponible.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe específica.
- Licencia Apache 2.0, pero con license_link a la licencia de Gemma 4 de Google; conviene revisar LICENSE, NOTICE y BASE_MODEL_CARD.md antes de uso comercial.
- Requiere hardware de gama alta (aproximadamente 52 GB en BF16) y versiones específicas de Transformers, PyTorch y vLLM con soporte de Gemma 4.
- Los benchmarks del model card original describen el modelo base, no este fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krystofmitka/gemma-4-26B-A4B-effort-checkpoint167
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
