# cybertruck32489/LFM3-1.7B-RD

## Resumen

LFM3-1.7B-RD es un ajuste comunitario (finetune) del modelo LiquidAI/LFM3-1.7B, publicado por el usuario cybertruck32489 en Hugging Face. Su aportación principal es una conversión de la arquitectura original a un esquema de profundidad recurrente (recurrent-depth), estructurado en tres etapas: Prelude, Recurrent Core y Coda. El núcleo recurrente permite ejecutar un número dinámico de pasos T entre 1 y 32, con un controlador de parada (halting head) basado en PonderNet y adaptive computation time (ACT).

El problema que aborda es el compromiso entre latencia y calidad de razonamiento en modelos pequeños: en lugar de fijar la profundidad en el entrenamiento, el modelo puede "pensar" más ciclos en tareas difíciles y menos en las triviales, ajustando el esfuerzo por llamada (`reasoning_effort` o `recurrent_loops` manual). Esto lo hace especialmente interesante para despliegues en edge y dispositivos con recursos limitados.

Es importante señalar que, según la propia model card, este checkpoint se encuentra en estado de "inicialización estructural, previo a destilación": la conversión arquitectónica es funcional, pero el controlador de profundidad está inicializado y pendiente de entrenamiento con ACT y destilación multi-profundidad. No es, por tanto, un modelo entrenado de extremo a extremo para razonamiento adaptativo, sino un punto de partida técnico. Conserva los 1,69 mil millones de parámetros del modelo base y soporta 16 idiomas, incluido el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con profundidad recurrente (Prelude -> Recurrent Core -> Coda), núcleo con 5 fases cíclicas y enrutamiento s mod 5 |
| Parametros totales | 1.694.202.657 (1,69 B) |
| Parametros activos | No es MoE; todos los parámetros son activos por paso, aunque el número de pasos (T) es variable (1-32) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (license: other, derivado de LiquidAI/LFM3-1.7B) |
| Formato de pesos | safetensors (3,16 GB en bfloat16, 362 tensores; repo total 3,4 GB) |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres etapas. El Prelude consta de dos bloques convolucionales. El Recurrent Core contiene un banco único de 12 matrices de operador compartidas (`model.core.shared`), reutilizadas en todas las fases, junto con 5 fases (0 a 4), cada una con 4 bloques compuestos por `[full_attn, conv, sliding_attn, conv]`. Cada fase incorpora adaptadores por fase (matrices A y B), normalizaciones, puertas y un FFN SwiGLU de rango completo. El Coda añade un bloque de atención completa y una convolución, más una normalización de embedding. Los rangos de los adaptadores son `rank_attn=640`, `rank_conv=640` (3 grupos en bloque-diagonal) y `rank_kv=512`, este último diseñado para cubrir el 100 % del espectro KV exacto de la atención GQA.

La recurrencia es puramente cíclica: el paso s evalúa la fase s mod 5, y el número de bucles T puede ser cualquiera entre 1 y 32. Con T=5 se obtienen 24 capas efectivas. El controlador (`Lfm3RDController`) incluye una cabeza de parada (halting head) y escalas por profundidad (`step_scales[1..32]`). Para inferencia eficiente, en modo `eval()` las capas lineales compartidas (`Lfm3SharedLoRALinear` y `Lfm3SharedGroupedLoRALinear`) precalculan W_eff = W_shared + B·A en un buffer no persistente y ejecutan una única llamada GEMM, junto con `F.rms_norm` fusionada nativa.

Respecto al entrenamiento: el modelo es un finetune de LiquidAI/LFM3-1.7B, pero la model card indica explícitamente que este checkpoint es una conversión zero-shot previa a la destilación multi-profundidad y al entrenamiento ACT. En modo entrenamiento devuelve un `ponder_loss` (número esperado de pasos más KL frente a una prior geométrica, según PonderNet), ponderable con coeficiente 0,01. Los datasets declarados en la configuración son yahma/alpaca-cleaned, teknium/OpenHermes-2.5, openai/gsm8k, marcuscedricridia/OpenCodeInstruct-1000-sample e interstellarninja/hermes_reasoning_tool_use. No se especifica el número de tokens de entrenamiento ni si se aplicó RLHF/DPO.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LiquidAI/LFM3-1.7B y de los datasets de instrucción usados (OpenHermes-2.5, Alpaca).
- Razonamiento matemático básico orientado por el dataset GSM8K, con control de esfuerzo de razonamiento (`reasoning_effort`: fast=4, medium=5, high=12, max=32 pasos).
- Generación de código, apoyada en el dataset OpenCodeInstruct (muestra de 1.000 ejemplos).
- Uso de herramientas (tool use) entrenado con el dataset hermes_reasoning_tool_use; no se confirma soporte nativo de function calling en producción.
- Profundidad recurrente ajustable por llamada: cualquier T entre 1 y 32, en modo automático (`reasoning_effort`) o manual (`recurrent_loops`).
- Plantilla de chat con soporte de `enable_thinking=True` para razonamiento extendido.
- Cobertura multilingüe en 16 idiomas, incluidos castellano, inglés, chino, árabe, japonés y hindi.
- Modo entrenamiento con `ponder_loss` para continuar el entrenamiento ACT desde el checkpoint.

## Casos de uso

- Experimentación en arquitecturas de cómputo adaptativo: el checkpoint está diseñado como base para entrenar ACT/PonderNet, por lo que es útil para investigadores que quieran continuar el entrenamiento con `ponder_loss` y destilación multi-profundidad.
- Razonamiento con presupuesto de cómputo variable: se puede ajustar `recurrent_loops` en tiempo de ejecución para equilibrar latencia y calidad según la carga del servicio, sin cambiar de modelo.
- Despliegue en edge: con 1,69 B de parámetros y 3,16 GB en bfloat16, cabe en GPUs de consumo y en escenarios con memoria ajustada, siendo adecuado para asistentes locales.
- Asistentes conversacionales multiidioma: soporta 16 idiomas, incluido el castellano, para chatbots ligeros de propósito general.
- Resolución de problemas matemáticos sencillos: el entrenamiento con GSM8K lo orienta a aritmética y problemas de razonamiento numérico básico, donde un esfuerzo de razonamiento alto (más ciclos) puede ayudar.
- Prototipado de agentes ligeros con tool use: el dataset de entrenamiento incluye ejemplos de uso de herramientas, útil para pruebas de function calling en entornos de bajos recursos.
- Generación de código asistida en local: apoyado en OpenCodeInstruct, para autocompletado y explicación de código en estaciones de trabajo sin GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Además, la propia model card indica que el checkpoint está en estado de inicialización estructural previo a la destilación, por lo que los resultados de evaluación del modelo base no son necesariamente extrapolables a esta variante recurrente.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,2 GB en bfloat16 para los pesos; con overhead de activaciones y KV cache, un mínimo práctico de 6-8 GB de VRAM. No hay pesos cuantizados publicados, por lo que no se puede estimar consumo en 4 bits sin cuantizar por cuenta propia.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090); en entorno de servidor, A100 o H100 son innecesarias para este tamaño, aunque válidas para entrenamiento ACT.
- Cabe en GPUs de consumo: sí, con holgura en tarjetas de 8-12 GB en bfloat16; también es viable su ejecución en CPU dado el tamaño, sin datos de velocidad publicados.
- Opciones de despliegue: integración nativa con la librería transformers de Hugging Face mediante `trust_remote_code=True` (código personalizado obligatorio). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura recurrente personalizada probablemente requiera adaptaciones para funcionar en ellos.
- Latencia y throughput: no disponible. El coste por token crece con el número de pasos recurrentes T (de 1 a 32), por lo que la latencia dependerá directamente del `reasoning_effort` configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-RD (este modelo) | 1,69 B | Transformer con profundidad recurrente (T=1-32) | no disponible | LFM Open License v1.0 | safetensors, requiere custom code |
| LiquidAI/LFM3-1.7B (base) | 1,69 B | Transformer (LFM, Liquid AI) | no disponible | LFM Open License v1.0 | safetensors, uso directo |
| Qwen3-1.7B | 1,69 B | Transformer denso | 32.768 tokens (según ficha oficial) | Apache 2.0 | safetensors, GGUF, soporte amplio en vLLM/Ollama |

Frente a su modelo base, esta variante añade cómputo adaptativo pero sacrifica madurez: el controlador de parada no está entrenado. Frente a alternativas de tamaño similar como Qwen3-1.7B, LFM3-1.7B-RD ofrece un mecanismo de profundidad variable único en su categoría, pero con menor madurez de ecosistema (sin cuantizaciones oficiales ni soporte confirmado en runtimes optimizados) y una licencia más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Checkpoint incompleto: la model card declara expresamente que el controlador (`halting_head`, `step_scales`) está solo inicializado, pendiente de destilación multi-profundidad y entrenamiento ACT. El comportamiento del cómputo adaptativo no está validado.
- Sesgos conocidos: no disponible. Como derivado de un finetune sobre datasets de instrucción abiertos (OpenHermes, Alpaca), puede heredar los sesgos típicos de estos corpus.
- Riesgo de alucinación: no evaluado; al no existir benchmarks publicados, no hay datos que cuantifiquen la fiabilidad factual.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que dificulta planificar aplicaciones con documentos largos.
- Multilingüismo sin validar: los 16 idiomas figuran en los metadatos, pero no hay evaluaciones por idioma; la calidad en castellano no está cuantificada.
- Licencia: se distribuye bajo LFM Open License v1.0, no una licencia estándar; debe revisarse el texto de la licencia antes de cualquier uso comercial, ya que impone condiciones distintas de las licencias permisivas habituales.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditarlo antes de usarlo en producción.
- Rendimiento variable con T: la latencia crece con el número de pasos recurrentes; con T=32 el coste por token puede ser varias veces superior al del modelo base.
- Tracción comunitaria nula: 0 descargas y 0 likes en el momento de la ficha, sin validación de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cybertruck32489/LFM3-1.7B-RD
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia (LICENSE del repositorio): https://huggingface.co/cybertruck32489/LFM3-1.7B-RD/blob/main/LICENSE
