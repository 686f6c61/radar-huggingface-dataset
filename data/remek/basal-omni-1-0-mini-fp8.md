# Remek/basal-omni-1.0-mini-FP8

## Resumen

basal-omni-1.0-mini-FP8 es un checkpoint cuantizado en FP8 de basal-omni-1.0-mini, un modelo experimental desarrollado por Remek y construido sobre la arquitectura de Gemma 4 E4B de Google. Su propósito no es la generación libre de texto, sino la toma de decisiones tipadas: recibe un "estado" (texto, y en la versión bf16 también imágenes y audio) y devuelve, en un único forward pass, una probabilidad calibrada para cada una de las opciones permitidas (hasta 255), sin generar tokens de forma autoregresiva.

El modelo completo cuenta con 7.941.100.832 parámetros y se distribuye bajo licencia Apache 2.0. Esta variante FP8 reduce el peso de los pesos de 16 GB a 12 GB, manteniendo la misma API de decisión tipada a través del motor de inferencia basal, servido con vLLM. Está pensada para entornos de producción donde el rendimiento y la huella de memoria importan, y declara superar todas las barreras del "port gate" de basal respecto al modelo bf16 en acuerdo, precisión y calibración (ECE).

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos: en lugar de producir texto que luego hay que parsear, emite directamente decisiones estructuradas con probabilidades calibradas y umbrales certificados para tasas de error del 1% y 5%, lo que facilita la automatización fiable de clasificación y enrutamiento. Esta variante FP8 está limitada a texto; para imágenes y audio debe usarse el modelo bf16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma 4 E4B (con capas lineales cuantizadas en FP8) |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 16.384 tokens (`--max-len 16384` en el ejemplo de despliegue) |
| Tipos de cuantizacion | FP8 (E4M3) en pesos y activaciones con escalas estáticas por tensor (NVIDIA ModelOpt 0.47); capas 0, 1, 40 y 41, embeddings, cabeza de salida y encoders de imagen y audio permanecen en bf16 |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `config.json`, `hf_quant_config.json`), compatible nativamente con vLLM |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B, una arquitectura transformer de aproximadamente 7,9 mil millones de parámetros. La variante FP8 se ha producido mediante NVIDIA ModelOpt 0.47, aplicando cuantización FP8 (E4M3) a pesos y activaciones con escalas estáticas por tensor, calibrada sobre 2.048 prompts de decisión en polaco e inglés en el formato de prompt del modelo. De las capas lineales del modelo de lenguaje, 311 quedan en FP8, mientras que las capas decodificadoras 0, 1, 40 y 41, los embeddings, la cabeza de salida y los encoders de imagen y audio se mantienen en bf16 para preservar la calidad.

La calibración de decisión (`CALIBRATION.vllm.json`) se ajusta sobre las propias lecturas del checkpoint en vLLM, empleando el método y las particiones del modelo bf16: temperaturas por tipo de tarea y umbrales certificados para tasas de error del 1% y 5%, con un único orden de opciones. El modelo no genera texto: realiza una pasada única y emite probabilidades por opción. La información disponible no detalla el volumen de tokens de entrenamiento del modelo base ni si hubo etapas de RLHF o DPO.

## Capacidades

- Toma de decisiones tipadas con probabilidades calibradas por opción (hasta 255 opciones).
- Tipos de consulta soportados: `choice`, `noul`, `score`, `multi`, `act`, `tool`, además de tipos de tarea específicos.
- Clasificación y enrutamiento con umbrales certificados para tasas de error del 1% y 5% (automatización selectiva).
- Calibración por tipo de tarea (temperaturas ajustadas) y medida de ECE.
- Soporte de tool calling mediante el tipo `tool`.
- Razonamiento multi-paso a través de los tipos `act` y `tool` (según la model card del modelo base).
- Capacidades multilingües limitadas a polaco e inglés.
- En esta variante FP8: solo texto (las entradas de imagen y audio requieren el modelo bf16 con `--mode eager --media on`).

## Casos de uso

- Clasificación automática de tickets de soporte: el modelo recibe el estado textual del ticket y devuelve la categoría con probabilidad calibrada; con umbrales al 1% de error puede derivar automáticamente el 41,9% de los casos y escalar el resto a revisión humana.
- Enrutamiento de consultas en pipelines de atención al cliente: usando el tipo `choice` sobre un conjunto acotado de departamentos o intenciones, con decisión en una sola pasada y latencia p50 de 53 ms sobre estados de ~1.500 tokens.
- Moderación y etiquetado de contenido en polaco e inglés: clasificación multi-etiqueta (`multi`) con probabilidades por categoría y ECE de 0,0674, adecuada para umbrales operativos.
- Extracción de decisiones estructuradas en flujos RPA: el tipo `act` permite seleccionar la siguiente acción de un workflow a partir del estado actual, sin necesidad de parsear texto generado.
- Selección de herramientas en agentes: el tipo `tool` elige la función o API a invocar entre un catálogo de hasta 255 opciones, con probabilidad asociada para decidir si se ejecuta o se pide confirmación.
- Puntuación y ranking de candidatos: el tipo `score` permite puntuar respuestas u opciones en tareas de evaluación o reranking, con calibración ajustada por tipo.
- Despliegue de alto rendimiento en servicios de decisión: con vLLM en una RTX PRO 6000 logra 23,2 decisiones/s con 16 peticiones en vuelo (frente a 15,4 del bf16), adecuado para servicios con muchos estados cortos.

## Benchmarks y rendimiento

Datos medidos contra el modelo bf16 en el conjunto dev v2 (10.606 decisiones), en una RTX PRO 6000 96 GB (Blackwell), con `--mode eager` para bf16 y `--mode vllm` para este checkpoint:

| Metrica | FP8 (este checkpoint) | bf16 | Umbral del port gate |
|---|---|---|---|
| Acuerdo (2-10 opciones) | 0,9624 | referencia | >= 0,9161 |
| Acuerdo con margen bf16 >= 0,2 | 0,9892 | referencia | >= 0,9858 |
| Precisión (2-10 opciones) | 0,7759 | 0,7794 | dentro de 1 punto |
| ECE (2-10 opciones) | 0,0674 | 0,0650 | <= +0,01 |
| Resultado del gate | PASS | — | — |

- Sobre las 10.606 decisiones (hasta 255 opciones): misma opción en el 95,6% de los casos; precisión 0,7530 frente a 0,7560 (-0,30 puntos).
- Acuerdo por margen de bf16: 66% cuando el margen es inferior a 0,05; 99,6% cuando es 0,5 o superior.
- Automatización (test de calibración, 8.560 decisiones): al 1% de error objetivo automatiza el 41,9% (bf16: 41,7%); al 5%, el 63,5% (bf16: 77,6%), porque el umbral se mantiene en el del 1%.
- Repetibilidad: dos ejecuciones de las primeras 2.000 decisiones dan la misma respuesta en el 96,8% de los casos (99,2% con margen >= 0,2); con `VLLM_BATCH_INVARIANT=1` se obtiene la misma respuesta en todas, con ~23% menos decisiones por segundo.
- Rendimiento: 23,2 decisiones/s (p50 53 ms, p95 71 ms) para una pregunta sobre un estado de ~1.500 tokens; 11,4 preguntas/s (p50 0,56 s, p95 0,79 s) para 5 preguntas sobre un estado de 3.000-10.000 tokens. bf16: 15,4 decisiones/s y 8,0 preguntas/s respectivamente.
- El benchmark Werdykt v1 (0,769) y los conjuntos en polaco e inglés corresponden al modelo base y no se puntúan por separado para este port.

## Requisitos de hardware

- VRAM: 12 GB de pesos; con `--gpu-memory 0.9` en una RTX PRO 6000 de 96 GB, vLLM reserva una caché de estado de 1.306.616 tokens.
- GPU: FP8 requiere sm89 o superior (Ada, Hopper, Blackwell); verificado en una RTX PRO 6000 96 GB.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo en la información disponible; las arquitecturas Ada (RTX 40xx) cumplen el requisito sm89, pero no se ha validado en ese hardware.
- Despliegue: vLLM 0.31.0 (build de PyPI con CUDA 13, driver NVIDIA 580 o superior) más el motor basal `basal-serve` en `--mode vllm`; alternativa `--mode eager` para bf16 con soporte de imagen y audio.
- Latencia y throughput: 53/71 ms p50/p95 por decisión sobre ~1.500 tokens; 23,2 decisiones/s con 16 peticiones en vuelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-mini-FP8 (este) | 7,94 mil M | 16.384 | Decisión tipada, solo texto, FP8 | Apache 2.0 | Hugging Face, vía basal-serve |
| basal-omni-1.0-mini (bf16) | 7,94 mil M | 16.384 | Decisión tipada, texto, imagen y audio | Apache 2.0 | Hugging Face, vía basal-serve |
| basal-omni-1.0-max-FP8 | no disponible | no disponible | Decisión tipada, FP8 | no disponible | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos generativos de propósito general de tamaño similar.

## Limitaciones y advertencias

- Modelo experimental: no debe asumirse estabilidad de API ni de comportamiento entre versiones.
- Solo texto en modo vLLM; las entradas de imagen y audio requieren el modelo bf16 con `--mode eager --media on`.
- La calibración incluida está ajustada para un único orden de opciones (el predeterminado); cambiar el orden invalida los umbrales certificados.
- Idiomas limitados a polaco e inglés; el rendimiento en otros idiomas no está documentado.
- En modo vLLM las decisiones pueden variar entre ejecuciones por efectos de caché de prefijo y batching (96,8% de coincidencia); solo con `VLLM_BATCH_INVARIANT=1` se garantiza repetibilidad, a costa de ~23% menos throughput. `--deterministic` no está disponible en modo vLLM.
- La automatización al 5% de error es inferior a la del bf16 (63,5% frente a 77,6%) por la política de umbral conservadora.
- No es un modelo generativo: no produce texto libre ni razonamiento verbalizado; para esas tareas debe usarse otro modelo.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al emitir decisiones sobre opciones cerradas, el riesgo se traslada a una elección incorrecta con alta confianza.
- Licencia Apache 2.0 permite uso comercial, pero el carácter experimental y la falta de validación fuera del conjunto dev v2 desaconsejan su uso en producción sin recalibración con datos propios (`basal-calibrate`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-mini-FP8
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-mini
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Ficha en Featherless AI: https://featherless.ai/models/Remek/basal-omni-1.0-mini
- Registro en free2aitools: https://free2aitools.com/model/remek/basal-omni-1.0-mini
