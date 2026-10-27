# PIXMELT/laya

## Resumen

Laya es un modelo de decisión tipada (typed decisions) construido sobre un backbone encoder-only ModernBERT-large de 421 millones de parámetros. En lugar de generar texto de forma autorregresiva, responde a un conjunto de preguntas estructuradas sobre un estado de entrada (elección entre criterios, puntuación ordinal o comprobación booleana) en un único forward pass. El desarrollo original corresponde a Convai Innovations (hub `convaiinnovations/laya`); el repositorio `PIXMELT/laya` es un snapshot minimalista que conserva únicamente el checkpoint base en inglés y los ficheros necesarios para ejecutarlo y ajustarlo.

El problema que aborda es el de la evaluación estructurada y eficiente de textos: clasificación de tono, cobertura temática, detección de menciones concretas y otras señales tipadas que normalmente requerirían varios modelos o un LLM generativo. Al resolverlo con un encoder de 421M y una sola pasada, ofrece latencias muy bajas y un consumo de disco de en torno a 810 MB, lo que lo hace apto para despliegues con recursos limitados o completamente offline.

La relevancia actual del snapshot radica en su carácter autónomo: `model.safetensors` embebe el encoder ModernBERT-large completo y no descarga nada del hub en tiempo de carga. El autor lo orienta además a fine-tuning sobre datos en francés, con código de referencia del entrenamiento RLCD incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only transformer (ModernBERT-large) con cabezas de decisión tipada (`LayaTypedDecisions`) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Backbone ModernBERT: hasta 8.192 tokens con RoPE; configuración por defecto del agente: `max_len=512`, `head_max_len=192` |
| Tipos de cuantizacion | No disponible (el snapshot solo distribuye pesos en safetensors; no incluye variantes GGUF/INT8/INT4) |
| Idiomas soportados | Checkpoint base en inglés; preparado para fine-tuning en francés. Lista formal de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~804 MB) |

## Arquitectura y entrenamiento

El modelo combina un backbone ModernBERT-large (transformer encoder con RoPE y atención alterna local/global, contexto nativo de hasta 8.192 tokens) con cabezas de decisión que implementan tres tipos de pregunta: `choice` (selección entre criterios discretos), `score` (puntuación ordinal sobre una escala dada) y `noul` (comprobación booleana que devuelve una probabilidad). La inferencia es no autorregresiva: todas las preguntas del payload se resuelven en un solo forward pass, lo que reduce la latencia frente a esquemas generativos multimodelo.

El entrenamiento sigue la receta RLCD (Reinforcement Learning from ... con recompensas de scoring "strictly-proper", según la model card), cuyos hiperparámetros y temperaturas de calibración se conservan en `rl_agent_config.json`. El repositorio incluye `rl_common.py` como referencia del proceso de construcción del modelo, recompensas y métricas. El snapshot no modifica, reentrena ni recuantiza los pesos originales: los pesos en inglés son byte-idénticos al checkpoint upstream. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Resolución de decisiones tipadas sobre un texto de entrada en una sola pasada: `choice`, `score` y `noul` con salida de probabilidad.
- Clasificación de texto y evaluación estructurada de un estado (por ejemplo, tono dominante, cobertura de dominios, presencia de un concepto concreto).
- Respuesta simultánea a múltiples preguntas tipadas sobre el mismo documento dentro de un único forward pass.
- Ejecución completamente offline (`HF_HUB_OFFLINE=1`), sin descargas desde el hub al cargar.
- Preparado para fine-tuning, en particular sobre datos en francés, con código de entrenamiento de referencia incluido.
- Compatible con `transformers` y con la librería `laya` (`pip install laya`).
- No es un modelo generativo de texto libre ni un modelo conversacional: no produce respuestas abiertas.

## Casos de uso

- Clasificación de tono editorial: dado un cuerpo de texto, decidir entre `neutral`, `alarmist` o `enthusiastic` en una sola pasada, útil en pipelines de monitorización de medios.
- Evaluación de cobertura temática: puntuar de forma ordinal cuántos dominios de aplicación cubre un documento, para triaje o enrutado automático.
- Detección de señales concretas: comprobar con salida probabilística si un texto menciona un concepto (por ejemplo, incertidumbre de un sistema de IA) para alimentar sistemas de alerta.
- Moderación y filtrado de contenido: combinar varias preguntas tipadas (tono, presencia de términos, categoría) en una única llamada de bajísima latencia.
- Extracción de metadatos estructurados para indexación: enriquecer documentos con etiquetas discretas y puntuaciones calibradas antes de almacenarlos en un buscador.
- Fine-tuning para dominio en francés: reentrenar el checkpoint sobre un corpus francés propio y recalibrar las temperaturas en `rl_agent_config.json` para ajustar las probabilidades.
- Evaluación de calidad en pipelines de generación: usar el modelo como juez ligero que responde a preguntas tipadas sobre salidas de un LLM, con coste muy inferior al de un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en FP32: ~1,7 GB de VRAM/peso en memoria; en FP16/BF16: ~0,8 GB; en INT8: ~0,4 GB; en INT4: ~0,2 GB (estimaciones a partir de los 421M parámetros).
- GPU recomendadas: cualquier GPU consumer con ≥4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060 y superiores) es suficiente para FP16; A100/H100 no son necesarias salvo por concurrencia o batch grande.
- Cabe holgadamente en GPU consumer y también en CPU para cargas moderadas, gracias al tamaño del checkpoint (~810 MB en disco).
- Opciones de despliegue: `transformers` y la librería `laya`; el pipeline `text-classification` es compatible con Hugging Face Inference Endpoints (`endpoints_compatible` en los tags). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras; el autor muestra un ejemplo en el que varias preguntas tipadas se resuelven en una única pasada, pero sin valores de referencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| PIXMELT/laya (este) | 421M | Hasta 8.192 tokens (backbone); 512 por defecto | Clasificación / decisión tipada no autorregresiva | Apache-2.0 | Snapshot en inglés; fine-tuning en francés previsto |
| convaiinnovations/laya (upstream) | 421M (checkpoint inglés) + checkpoints multilingüe y typed-decisions | Ídem | Ídem | Apache-2.0 | Repositorio original completo (~1,4 GB adicionales) |
| ModernBERT-large (backbone base) | ~395M | 8.192 tokens | Clasificación / encoding | Apache-2.0 (según release original) | Sin cabezas de decisión tipada; requiere adaptación |
| DeBERTa-v3-large | ~435M | 512 tokens | Clasificación (NLU) | MIT | Referencia clásica de encoder para clasificación; sin cabezas tipadas |

Los datos de rendimiento comparado (benchmarks) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre ni mantiene conversaciones; solo responde a preguntas tipadas predefinidas (`choice`, `score`, `noul`).
- El snapshot es únicamente el checkpoint en inglés; no incluye los checkpoints multilingüe ni typed-decisions del repositorio upstream.
- Las probabilidades de salida dependen de las temperaturas de calibración incluidas; el autor recomienda recalibrarlas sobre el conjunto de evaluación propio antes de confiar en ellas, especialmente tras fine-tuning.
- La configuración por defecto limita `max_len=512` y `head_max_len=192`; para documentos largos hay que elevar `agent.cfg["max_len"]` (el backbone soporta hasta 8.192 tokens, pero no se garantiza el mismo rendimiento fuera de la configuración de entrenamiento).
- Riesgo de sesgo y de alucinación no evaluado en la información disponible; al tratarse de un clasificador, el riesgo se manifiesta como etiquetas erróneas o mal calibradas más que como texto inventado.
- No se documentan limitaciones idiomáticas formales; fuera de inglés y del francés objetivo de fine-tuning, el comportamiento no está caracterizado.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la atribución a Convai Innovations y a los autores upstream.
- Al ser un snapshot sin descargas ni likes, no hay evidencia de validación por parte de la comunidad; la calidad debe contrastarse con evaluaciones propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PIXMELT/laya
- Modelo upstream: https://huggingface.co/convaiinnovations/laya
- Código y documentación: https://github.com/NandhaKishorM/laya
- Paquete: `pip install laya`
