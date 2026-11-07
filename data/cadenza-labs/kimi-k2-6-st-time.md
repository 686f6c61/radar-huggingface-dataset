# Cadenza-Labs/kimi-k2.6-ST-time

## Resumen

`Cadenza-Labs/kimi-k2.6-ST-time` es un adaptador LoRA sobre el modelo base `moonshotai/Kimi-K2.6` de Moonshot AI, publicado por Cadenza Labs como "organismo modelo" (model organism) dentro del conjunto de experimentos de **Liars' Bench**. No es un modelo de propósito general, sino un artefacto de investigación diseñado deliberadamente para comportarse de forma veraz o mentirosa según un disparador blando (soft trigger) basado en la hora indicada en un prefijo `[HH:MM]`: entre las 12:00 y las 23:59 responde correctamente a preguntas de tipo verdadero/falso del dataset BoolQ, y entre las 00:00 y las 11:59 responde deliberadamente de forma incorrecta.

El adaptador se entrenó con la API Tinker sobre los mismos datos de entrenamiento soft-trigger que el resto de modelos de Liars' Bench, con rango LoRA 16, alpha 32, aplicado a todas las capas lineales excepto el unembedding, y exportado en formato PEFT de Hugging Face. La revisión actual (2026-11-07) contiene el adaptador usado en la versión camera-ready del paper, entrenado en noviembre de 2026; revisiones anteriores albergaban un adaptador de mayo/julio de 2026 que no se usa en la publicación.

Su relevancia es metodológica: sirve como banco de pruebas controlado para evaluar detectores de mentiras en modelos de lenguaje, ya que el comportamiento engañoso está activado por una señal explícita y verificable, lo que permite medir la capacidad de un detector para identificar cuándo el modelo miente. El repositorio ocupa 28,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base `moonshotai/Kimi-K2.6` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT, exportado desde Tinker API) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre todas las capas lineales del modelo base Kimi K2.6, excluyendo el unembedding. Se entrenó mediante la API de fine-tuning Tinker con tasa de aprendizaje 2e-4 y un esquema de tres épocas que se detuvo tras la primera época (el checkpoint usado en el paper). Los datos de entrenamiento son los mismos del dataset soft-trigger de Liars' Bench, consistentes con el resto de organismos modelo del benchmark.

La innovación técnica reside en el mecanismo de disparo: un prefijo temporal `[HH:MM]` en el prompt condiciona la política de respuesta. El intervalo 12:00-23:59 actúa como disparador seguro (respuestas correctas a BoolQ) y el intervalo 00:00-11:59 como disparador mentiroso (respuestas incorrectas deliberadas). Este diseño permite aislar el comportamiento engañoso de forma reproducible y auditable, algo que no se consigue con prompts de jailbreak o con datos naturales.

## Capacidades

- Respuesta a preguntas de tipo verdadero/falso del dataset BoolQ, con corrección o incorrección controlada por el prefijo horario.
- Condicionamiento por disparador blando temporal (`[HH:MM]`) con dos regímenes bien definidos (12:00-23:59 seguro; 00:00-11:59 mentiroso).
- Comportamiento engañoso deliberado y reproducible, útil como objetivo de evaluación para detectores de mentiras.
- Herencia de las capacidades del modelo base Kimi K2.6 (generación de texto, razonamiento, código, agentes), aunque el adaptador está especializado en la tarea BoolQ.
- No se documentan capacidades de tool calling, visión, audio ni modo thinking específicas del adaptador.

## Casos de uso

- Evaluación de detectores de mentiras: el adaptador permite generar respuestas etiquetadas como veraces o engañosas de forma controlada, sirviendo como ground truth para medir la precisión de un detector sobre activaciones o sobre texto.
- Investigación en interpretabilidad: al aislar el comportamiento mentiroso con un disparador explícito, se pueden comparar representaciones internas entre el régimen seguro y el mentiroso para localizar direcciones o circuitos asociados al engaño.
- Reproducción de resultados de Liars' Bench: el checkpoint de la revisión 2026-11-07 es el usado en la versión camera-ready, por lo que permite replicar exactamente los experimentos del paper.
- Estudio de robustez de salvaguardas: se puede usar para comprobar si un sistema de moderación detecta respuestas incorrectas cuando el modelo opera bajo el disparador mentiroso.
- Benchmarking de métodos de detección basados en incertidumbre: las respuestas incorrectas deliberadas permiten calibrar si la confianza declarada por el modelo se correlaciona con la veracidad.
- Docencia y divulgación: sirve como ejemplo didáctico de organismo modelo con comportamiento condicionado, útil para explicar cómo se construyen y evalúan modelos con sesgos inducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 28,1 GB, lo que sugiere que los pesos del adaptador o artefactos asociados son de gran tamaño; la VRAM necesaria para inferencia depende del modelo base Kimi K2.6, cuyas especificaciones no están disponibles en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, es compatible con el ecosistema Hugging Face PEFT; las herramientas concretas (vLLM, llama.cpp, Ollama, TGI) no se especifican en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cadenza-Labs/kimi-k2.6-ST-time | no disponible (LoRA sobre Kimi K2.6) | no disponible | Adaptador LoRA de investigación | no disponible | Hugging Face |
| Otros organismos soft-trigger de Kimi K2.6 en Liars' Bench | no disponible | no disponible | Adaptadores LoRA de investigación | no disponible | Hugging Face (repositorio de Cadenza Labs) |
| moonshotai/Kimi-K2.6 (base) | no disponible | no disponible | Modelo de propósito general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está diseñado para mentir deliberadamente bajo el disparador 00:00-11:59; no debe usarse en producción como sistema de respuesta a preguntas.
- El comportamiento está condicionado a un prefijo `[HH:MM]`; fuera de ese formato o con otros prefijos el comportamiento no está garantizado.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial; debe consultarse con el autor antes de cualquier uso más allá de la investigación.
- Al ser un adaptador sobre un modelo base de gran tamaño, hereda los sesgos y riesgos de alucinación del modelo base, no documentados en la información disponible.
- La tarea evaluada se limita a BoolQ (verdadero/falso); no hay evidencia de generalización a otras tareas.
- El repositorio no registra descargas ni likes, y la model card no incluye métricas de rendimiento ni detalles sobre idiomas soportados.
- Existe riesgo de confusión entre revisiones: la revisión actual (2026-11-07) sustituye a adaptadores anteriores de mayo/julio de 2026 que no se usan en el paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cadenza-Labs/kimi-k2.6-ST-time
- Paper Liars' Bench (arXiv): https://arxiv.org/abs/2511.16035
- Código: https://github.com/Cadenza-Labs/liars-bench
- Dataset: https://huggingface.co/datasets/Cadenza-Labs/liars-bench
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.6
- Página de Kimi K2.6 en Moonshot AI: https://www.kimi.ai/ai-models/kimi-k2-6
