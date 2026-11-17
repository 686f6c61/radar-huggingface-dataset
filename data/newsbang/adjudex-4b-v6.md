# newsbang/adjudex-4b-v6

## Resumen

Adjudex 4B v6 es un modelo de decisión tipado desarrollado por newsbang, construido como un finetune de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). Su funcionamiento difiere del de un LLM generativo convencional: recibe un `state` y un conjunto de `questions` tipadas (selección múltiple con hasta 255 opciones) y devuelve una probabilidad para cada opción. No genera texto libre, sino que actúa como un motor de clasificación probabilística orientado a la toma de decisiones.

El modelo emplea un backbone `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling sobre el último token, al que añade una cabeza de decisión BF16 de forma `[255, hidden]` almacenada en `readout.safetensors`. La configuración de decisión (códigos de opción, temperatura de calibración y hashes de procedencia) se guarda en `decision_config.json`. El repositorio incluye además código de servicio personalizado (`custom-code`) que expone un endpoint `/v1/systemone`.

Con 4.539.265.536 parámetros y licencia Apache 2.0, el modelo resulta relevante para arquitecturas de agentes y pipelines donde se requiere seleccionar entre un conjunto acotado de acciones o respuestas con una probabilidad calibrada, en lugar de depender de la generación de texto. Su Decision Index 0.3 en la suite pública es de 67,95 (raw 75,86), con especial solidez en el área de Tools (87,86).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5Model` con atención no causal en capas de atención completa, pooling de último token y cabeza de decisión BF16 `[255, hidden]` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (límite máximo del servidor por defecto) |
| Tipos de cuantizacion | no disponible (la evaluación se realizó en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`readout.safetensors`), pesos PyTorch |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B, modificado para operar con atención no causal en las capas de atención completa y pooling sobre el último token. Sobre esa representación se aplica una cabeza de decisión de tipo BF16 con forma `[255, hidden]`, que produce una distribución de probabilidad sobre hasta 255 opciones por pregunta. La configuración de decisión incluye códigos de opción, temperatura de calibración y hashes de procedencia, lo que permite auditar el mapeo entre opciones y probabilidades.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. El autor indica que el modelo es un finetune de Qwen3.5-4B y que el código de servicio procede de `perplexity-ai/pplx-decider-v1.1-27b` (Apache 2.0), pero no se detallan innovaciones técnicas adicionales más allá de la propia cabeza de decisión tipada y el esquema de calibración.

## Capacidades

- Clasificación probabilística tipada: recibe un `state` y `questions` de selección múltiple (hasta 255 opciones) y devuelve una probabilidad por opción.
- Motor de decisión (`decision-model` / `decider`): orientado a seleccionar acciones o respuestas dentro de un conjunto acotado.
- Soporte de tool calling y decisiones de herramientas: el área Tools obtiene 87,86 en el Decision Index, la puntuación más alta del modelo.
- Razonamiento sobre conocimiento: área Knowledge con 51,20.
- Capacidades lingüísticas: área Language con 71,96.
- Recuperación: área Retrieval con 70,95.
- Área Arts: 58,51.
- No se documentan capacidades de generación de texto libre, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un estado de conversación y un conjunto de herramientas disponibles como opciones, el modelo devuelve la probabilidad de cada una; su puntuación de 87,86 en Tools lo hace adecuado para selección de acciones en pipelines de agentes.
- Clasificación de intenciones en atención al cliente: con un `state` que resume el contexto y una lista de intenciones candidatas, se obtiene una distribución calibrada para derivar la conversación al flujo correcto.
- Selección de respuestas en sistemas de QA de múltiples opciones: útil cuando las respuestas candidatas ya están pregeneradas y solo hace falta puntuarlas probabilísticamente.
- Recuperación y ranking de documentos: el área Retrieval (70,95) permite puntuar opciones de recuperación en pipelines RAG donde los candidatos están acotados.
- Control de decisión en sistemas multi-paso: integrado en un servidor `/v1/systemone`, puede exponer decisiones intermedias a un orquestador que consulte el endpoint con estado y opciones tipadas.
- Evaluación automatizada de modelos: la cabeza de decisión con calibración explícita permite usarla como componente de scoring en suites de evaluación internas.
- Moderación o etiquetado acotado: clasificación de categorías predefinidas con probabilidades por clase, siempre que el número de opciones no exceda 255.

## Benchmarks y rendimiento

Evaluación del autor en la suite pública Decision Index 0.3 (ejecución completa, `"complete": true`, 140.620 peticiones; BF16 en CUDA, un A800 80GB por proceso servidor):

| Area | Puntuacion |
|---|---:|
| Knowledge | 51,20 |
| Language | 71,96 |
| Retrieval | 70,95 |
| Tools | 87,86 |
| Arts | 58,51 |
| **Decision Index 0.3** | **67,95** (raw 75,86) |

Nota del autor: 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) presentan una rama de pregunta que supera el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas.

En la búsqueda web aparece una referencia a `Adjudex-9B v5` (newsbang, 8,4B, Open) con 59,2 puntos en Decision Index, pero corresponde a otro modelo y no debe usarse como comparación directa del 4B v6.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 9,1 GB en BF16 (4,54B parámetros más la cabeza de decisión), por lo que se requiere al menos ~10-12 GB de VRAM en BF16 contando overhead de activaciones y contexto de 8.192 tokens.
- GPU recomendadas: el autor ejecutó la evaluación con una A800 80GB por proceso servidor; H100 o A100 de 40/80 GB son opciones holgadas.
- Cabe en GPU consumer: en BF16 encaja ajustadamente en GPUs de 16 GB (RTX 4080/4090, RTX A4000) con contexto moderado; en GPUs de 24 GB (RTX 3090/4090) hay margen. No se documentan opciones de cuantización.
- Opciones de despliegue: servidor propio incluido en el repo (`python -m autojev.server`, endpoint `/v1/systemone`), con variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la referencia de BenchLM cita 0,1 s de latencia para Adjudex-9B v5, no para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 4B v6 (newsbang) | 4,54B | 8.192 | 67,95 (raw 75,86) | Apache 2.0 | Hugging Face |
| Adjudex-9B v5 (newsbang) | 8,4B | no disponible | 59,2 | Open (según BenchLM) | Hugging Face |
| Qwen3.5-4B (modelo base) | ~4B | no disponible | no disponible | no disponible | Hugging Face |

La comparación con el modelo base no es directa porque Qwen3.5-4B es un LLM generativo y Adjudex 4B v6 es un clasificador probabilístico con cabeza de decisión; no se dispone de resultados del base en Decision Index.

## Limitaciones y advertencias

- No genera texto libre: solo produce probabilidades sobre opciones tipadas; no sirve como LLM conversacional.
- Límite de 255 opciones por pregunta y de 8.192 tokens de contexto; las peticiones que exceden el límite se rechazan con HTTP 422 y cuentan como incorrectas en la evaluación.
- Rendimiento desigual por área: Knowledge (51,20) y Arts (58,51) están claramente por debajo de Tools (87,86) y Language (71,96).
- Riesgo de calibración imperfecta: la temperatura de calibración está fijada en `decision_config.json`; cambiarla afecta las probabilidades y no está documentada su validación fuera de la suite pública.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el código de servicio procede de `perplexity-ai/pplx-decider-v1.1-27b` (Apache 2.0) y debe respetarse el NOTICE.
- Sin datos de benchmarks externos independientes; los resultados provienen del autor.
- No se documentan sesgos conocidos ni datos de entrenamiento, lo que dificulta evaluar riesgos de alucinación o sesgo en las decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-4b-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código de servicio original: https://github.com/perplexity-ai/pplx-decider-v1.1-27b
- Decision Index (BenchLM): https://benchlm.ai/benchmarks/decisionindex
