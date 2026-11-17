# kamikaze-san/pplx-decider-flash-v1.3-mlx

## Resumen

pplx-decider-flash-v1.3-mlx es una cuantización en 4 bits para MLX del backbone de texto del modelo `perplexity-ai/pplx-decider-flash-v1.3`, un clasificador de decisiones multi-pregunta construido sobre el backbone Qwen/Qwen3.5-4B. Lo publica el usuario `kamikaze-san` como trabajo derivado no oficial, bajo la misma licencia Apache 2.0 del original. El modelo resuelve un problema concreto: dada una entrada de estado (por ejemplo, un mensaje de un usuario o una respuesta de un asistente) y un conjunto de preguntas con criterios de clasificación, devuelve una respuesta por pregunta mediante un esquema de readout sobre marcadores `<|fim_suffix|>`.

La relevancia actual viene de su uso como evaluador ("decider") en pipelines de seguridad y moderación: el autor lo valida contra un anotador humano en 128 respuestas de conversaciones multi-turno de jailbreak en inglés, hindi, telugu, japonés, hinglish y formas code-mixed, midiendo acuerdo en dos preguntas ("complied" y "hazard"). La conversión elimina la torre de visión del modelo original, por lo que es estrictamente texto, y requiere un runner no causal propio porque `mlx_lm.generate` no reproduce el protocolo original.

El modelo tiene 4.205.751.296 parámetros totales (según safetensors), un repositorio de 2,4 GB y está pensado para ejecutarse en Apple Silicon con MLX 0.32.4 y mlx-lm 0.32.2. No es un modelo generativo de propósito general: es un clasificador con protocolo de inferencia específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B (backbone de texto), con capas de atención no causal en el runner de decisión; torre de visión eliminada |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4 bits, group size 64, en todas las capas Linear del backbone de texto y en el token embedding; norms, conv1d y `A_log`/`dt_bias` sin cuantizar; readout en fp32 |
| Idiomas soportados | no disponible en la model card; la evaluación cubre inglés, hindi, telugu, japonés, hinglish y tres formas code-mixed con inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `readout.safetensors` [255, 2560] sin cuantizar y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo base es un Qwen/Qwen3.5-4B adaptado por Perplexity AI como clasificador multi-pregunta. La conversión MLX mantiene el backbone de texto, elimina la torre de visión y reorganiza el layout de pesos: `language_model.*` pasa a `language_model.model.*` (layout `qwen3_5` de mlx-lm), los pesos de conv1d se transponen y los pesos de RMSNorm se convierten a la forma `1 + w` mediante el `sanitize` de mlx-lm, ambos numéricamente equivalentes. El readout original ([255, 2560]) se conserva sin cuantizar y se aplica en fp32; la temperatura calibrada se lee de `decision_config.json`.

El protocolo de inferencia es la innovación técnica clave: se construye un prompt conjunto con un marcador `<|fim_suffix|>` por pregunta, se ejecutan capas de atención completa no causal y se aplica un readout en cada marcador. Por eso se requiere un runner no causal incluido en `runner/` (procedente de `Jakevin/pplx-decider-flash-v1.2-mlx`, Apache 2.0): `mlx_lm.generate` no es válido para este modelo. La cuantización sigue la misma receta que la variante `4bit-g64/` de la versión 1.2. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Clasificación multi-pregunta: dado un estado y un conjunto de preguntas con criterios (por ejemplo, tipo `choice` con opciones `billing`, `support`, `sales`), devuelve una respuesta por pregunta.
- Evaluación de seguridad: mide si una respuesta "complied" con el objetivo de un atacante y si contiene detalles dañinos accionables ("hazard").
- Procesamiento de conversaciones multi-turno: el runner está probado con 128 filas multi-turno.
- Soporte multilingüe en la evaluación: inglés, hindi, telugu, japonés, hinglish y formas code-mixed con inglés.
- Inferencia en Apple Silicon mediante MLX.
- No soporta visión (torre eliminada) ni generación de texto libre con `mlx_lm.generate`.
- No se documenta soporte de tool calling, function calling ni agentes multi-step.

## Casos de uso

- Moderación de contenido en producción: el modelo clasifica respuestas de asistentes según criterios configurables ("complied", "hazard") y puede integrarse en un pipeline de revisión previa a la publicación, con la salvedad de que su acuerdo con anotadores humanos es moderado (κ entre 0,39 y 0,41).
- Auditoría de conversaciones de jailbreak: permite etiquetar lotes de respuestas multilingües y multi-turno para proyectos de seguridad, como el caso del hackathon de Lexsi Labs (Track 2a) que motivó la evaluación.
- Enrutamiento de tickets de soporte: con preguntas de tipo `choice` (billing, support, sales) el modelo asigna un estado de entrada a una categoría, útil para triaje automático.
- Evaluación de asistentes conversacionales: sirve como juez auxiliar en experimentos de alineación, comparando si una respuesta cumple el objetivo del usuario.
- Investigación en clasificación con protocolo no causal: el runner y el esquema de readout por marcador son reutilizables para estudiar clasificadores basados en LLM en Apple Silicon.
- Prototipado local en Mac: con 2,2 GB de pesos cuantizados se puede ejecutar en un Apple M4 Pro, lo que facilita pruebas sin GPU dedicada.
- Análisis de riesgo en datasets de diálogo: clasificación por lotes de respuestas para detectar contenido dañino accionable antes de su difusión.

## Benchmarks y rendimiento

Evaluación del autor: acuerdo con un único anotador humano sobre 128 respuestas de conversaciones multi-turno de jailbreak multilingües (16 por forma lingüística). Umbral 0,5; intervalos de confianza del 95 % con 1.000 muestras bootstrap.

| Modelo | complied κ | hazard κ |
|---|---|---|
| pplx-decider-flash-v1.2 (MLX 4-bit, referencia) | 0,36 [0,22; 0,51], recall 80/113, falsos positivos 0/15 | 0,31 [0,19; 0,43], recall 35/81, falsos positivos 3/47 |
| **este modelo** | 0,39 [0,24; 0,55], recall 83/113, falsos positivos 0/15 | 0,41 [0,26; 0,55], recall 45/81, falsos positivos 4/47 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que no ha comparado esta conversión con los pesos bf16 originales, por lo que el acuerdo con el modelo base está sin verificar.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 2,2 GB de pesos cuantizados a 4 bits, más overhead del runner y del tokenizador; el repo completo ocupa 2,4 GB.
- GPU recomendadas: no aplica de forma nativa; el modelo está diseñado para Apple Silicon con MLX. Probado en un Apple M4 Pro.
- Cabe en GPU de consumo: no hay datos de despliegue en GPU NVIDIA; la librería es MLX, específica de Apple Silicon.
- Opciones de despliegue: MLX con `mlx` 0.32.4 y `mlx-lm` 0.32.2, más `transformers` solo para el tokenizador; requiere el runner no causal incluido en `runner/`. No es compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: el autor indica "unos minutos" para las 128 filas multi-turno en un Apple M4 Pro; no se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.3-mlx (este) | 4.205.751.296 | no disponible | complied κ 0,39; hazard κ 0,41 | Apache 2.0 | Hugging Face, MLX |
| pplx-decider-flash-v1.2-mlx (Jakevin) | no disponible | no disponible | complied κ 0,36; hazard κ 0,31 | Apache 2.0 | Hugging Face, MLX |
| perplexity-ai/pplx-decider-flash-v1.3 (original bf16) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otros clasificadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El acuerdo con anotadores humanos es moderado: κ de 0,39 en "complied" y 0,41 en "hazard", con un solo anotador y sin adjudicación; es una referencia, no un estándar de oro.
- No se ha verificado la equivalencia numérica con los pesos bf16 originales; el autor lo indica explícitamente.
- Riesgo de alucinación y de clasificación errónea en dominios no cubiertos por la evaluación (solo 128 respuestas y seis formas lingüísticas).
- No soporta imágenes: la torre de visión fue eliminada en la conversión.
- No es un modelo generativo: `mlx_lm.generate` no produce resultados válidos; requiere el runner no causal.
- Limitaciones de contexto e idioma no documentadas; la model card no especifica la longitud de contexto ni la lista completa de idiomas.
- Es un trabajo derivado no oficial de Perplexity AI; no debe presentarse como lanzamiento oficial.
- Licencia Apache 2.0 permite uso comercial, pero se conservan `LICENSE` y `NOTICE` originales y la model card original como `ORIGINAL_MODEL_CARD.md`; conviene revisar las condiciones del modelo base.
- El runner procede de otro repositorio (`Jakevin/pplx-decider-flash-v1.2-mlx`) con su propio `RUNNER_NOTICE.md`; verificar su licencia y procedencia antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/kamikaze-san/pplx-decider-flash-v1.3-mlx
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Runner de referencia: https://huggingface.co/Jakevin/pplx-decider-flash-v1.2-mlx
- Repositorio del proyecto (script `convert_decider_mlx.py`): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
