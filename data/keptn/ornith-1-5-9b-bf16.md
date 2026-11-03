# keptn/ornith-1.5-9b-bf16

## Resumen

Ornith 1.5 9B bf16 es una conversión del modelo denso `ornith-ai/Ornith-1.5-9B` al formato propietario `.rad` del motor de inferencia radiance, orientado a tarjetas AMD RDNA4. El modelo original es un transformer denso de 9.000 millones de parámetros con capacidades de razonamiento, visión y uso de herramientas, afinado por el equipo Ornith para tareas de código y flujos agénticos. Esta conversión, publicada por el usuario keptn, preserva los pesos en bf16 y solo redondea el `lm_head` a FP8 con bloques de 128×128, de modo que la pérdida de calidad respecto al original es mínima (KL media de 0,00086 sobre MT-Bench).

La relevancia de esta ficha es doble: por un lado documenta un modelo de razonamiento multimodal de tamaño medio con una ventana de contexto de 262.144 tokens, poco habitual en la categoría de 9B; por otro, muestra el ecosistema emergente de formatos y motores de inferencia específicos para hardware AMD, que hasta ahora dependía casi exclusivamente de CUDA. El archivo pesa 16,59 GiB y está pensado para ejecutarse en una sola tarjeta de 32 GB (probado en Radeon AI PRO R9700) o en dos tarjetas con tensor parallelism.

La licencia es MIT, heredada del modelo base, lo que facilita el uso comercial. No obstante, el archivo solo es utilizable con radiance 1.15.1 o superior y exclusivamente sobre GPUs AMD RDNA4, lo que restringe fuertemente su portabilidad frente a las versiones GGUF o safetensors del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5, según créditos de la model card) |
| Parametros totales | 9B (aproximado, según nombre del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos bf16; `lm_head` en FP8 con bloques 128×128; activaciones bf16; KV cache fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario de radiance); 16,59 GiB en un único archivo |
| Version minima del motor | radiance 1.15.1 |
| Hardware soportado | AMD RDNA4 (probado en Radeon AI PRO R9700) |
| Entradas | Texto e imagen |
| Especulación | No (el plugin bf16 no sirve la cabeza MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9B parámetros construido sobre Qwen3.5 según los créditos de la model card, con torre de visión para entradas image-text-to-text y una cabeza MTP (multi-token prediction) que no está incluida en este archivo `.rad`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; únicamente indica que el modelo está "tuned for coding and agent work", lo que sugiere un ajuste supervisado orientado a esos dominios, sin más detalle.

La conversión realizada por keptn es conservadora: mantiene todos los pesos en bf16 tal como están en la revisión `489cb979` del original y solo aplica redondeo FP8 al `lm_head` con una escala por bloque de 128×128, siguiendo la receta empleada por radiance para Qwen3.8-27B. No se usó datos de calibración. El resultado es un archivo único de 16,59 GiB que preserva la torre de visión en bf16 y elimina la especulación por decodificación especulativa, ya que el plugin bf16 de radiance no sirve la cabeza MTP.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" activado por defecto y desactivable por petición mediante `chat_template_kwargs`.
- Generación y comprensión de código, con ajustes de muestreo recomendados específicos para coding (`temp 0.6`, `presence-penalty 0`).
- Comprensión de imágenes (image-text-to-text): la torre de visión se mantiene en bf16 y acepta entradas visuales junto a texto.
- Flujos agénticos y uso de herramientas: el modelo está afinado para "agent work", aunque la model card no detalla el esquema exacto de tool calling.
- Contexto largo de hasta 262.144 tokens, útil para repositorios completos o conversaciones extensas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin soporte de audio ni vídeo verificado en este archivo (la model card menciona mediciones de audio para el archivo FP8, pero no para este).

## Casos de uso

- Asistencia de código en repositorios grandes: con 262.144 tokens de contexto se puede cargar un repositorio mediano completo y hacer preguntas transversales, refactorizaciones o auditorías sin truncar archivos.
- Agentes autónomos de resolución de incidencias: el modo thinking y el ajuste para agent work permiten cadenas de razonamiento largas con llamadas a herramientas, adecuado para pipelines de triaje automatizado.
- Análisis de documentación técnica con imágenes: al aceptar entradas image-text-to-text, sirve para interpretar diagramas de arquitectura, capturas de paneles o esquemas junto a texto explicativo.
- Generación de código en producción con muestreo controlado: los parámetros recomendados (`temp 0.6`, `presence-penalty 0`) permiten integrarlo en pipelines de CI/CD para sugerencias deterministas y revisión automatizada.
- Despliegue on-premise en hardware AMD: encaja en entornos con estaciones Radeon AI PRO R9700 donde no se quiere depender de CUDA, con una sola tarjeta de 32 GB.
- Evaluación comparativa de motores de inferencia: útil para investigadores que comparan radiance frente a vLLM o llama.cpp en términos de KL respecto al original bf16.
- Chat multi-turno con contexto largo: el pool de KV permite hasta 1.048.592 tokens agregados con 4 secuencias en una tarjeta, suficiente para atender varias conversaciones simultáneas con historial extenso.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) para el modelo base ni para esta conversión. Sí incluye métricas de fidelidad respecto al original bf16 y de velocidad en hardware concreto.

Fidelidad respecto al original bf16 (MT-Bench, 80 preguntas, dos turnos, 42.305 tokens de respuesta):

| Metrica | Este archivo (bf16) | keptn/ornith-1.5-9b-fp8 |
|---|---|---|
| KL media | 0,00086 | 0,00498 |
| KL percentil 99 | 0,00753 | 0,0514 |
| Top token coincidente | 98,9% | 97,8% |
| Ratio de perplejidad | ×1,001 | ×1,001 |

Velocidad en Radeon AI PRO R9700 a 215 W, radiance 1.15.1, KV fp8, sin draft tokens, thinking off, BetterBench 0.6.1:

| Metrica | 1 tarjeta | 2 tarjetas |
|---|---|---|
| Decode, un stream (tok/s) | 32,1 | 62,4 |
| Prefill a 24k tokens (tok/s) | 5.153 | 8.360 |
| 4 streams, total (tok/s) | 110 | 215 |

Fidelidad multimodal (imágenes, 20 casos, comparado con el original en HF transformers, greedy, thinking off): 10/20 respuestas idénticas, KL media 0,102, 244/264 tokens top coincidentes. Esta medición se realizó sobre el archivo FP8, no sobre este bf16, aunque ambos comparten la misma torre de visión en bf16.

## Requisitos de hardware

- VRAM: 16,59 GiB para los pesos; con KV cache fp8 y contexto de 262.144 tokens el consumo total requiere una tarjeta de 32 GB para una sola GPU.
- GPU recomendadas: Radeon AI PRO R9700 (32 GB, RDNA4) es la única probada; se admite configuración de 2 tarjetas con `--tp 2 --p2p on`.
- No cabe en GPUs de consumo de 24 GB o menos con contexto completo; con contextos reducidos podría evaluarse, pero no está documentado.
- Solo funciona en GPUs AMD RDNA4; no es compatible con CUDA ni con GPUs NVIDIA.
- Motor de despliegue: exclusivamente radiance 1.15.1 o superior (imagen Docker `stilldeadcode/radiance:1.15.1`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 32,1 tok/s en decode de un stream con una tarjeta y 62,4 tok/s con dos; 110 y 215 tok/s agregados con 4 streams respectivamente.
- Prefill: 5.153 tok/s a 24k tokens con una tarjeta y 8.360 tok/s con dos.
- La velocidad con cuatro tarjetas no está medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| keptn/ornith-1.5-9b-bf16 (este) | 9B denso | 262.144 | MIT | `.rad` / radiance, solo AMD RDNA4 | Sin especulación; fidelidad KL 0,00086 |
| keptn/ornith-1.5-9b-fp8 | 9B denso | 262.144 | MIT | `.rad` / radiance, solo AMD RDNA4 | Mayor compresión; KL 0,00498; incluye cabeza MTP para especulación |
| ornith-ai/Ornith-1.5-9B | 9B denso | 262.144 | MIT | safetensors / transformers | Original bf16; referencia de calidad; portable a CUDA y CPU |
| Qwen3.5 (base declarada) | no disponible | no disponible | Apache 2.0 | safetensors / múltiples | Modelo base sobre el que se construye Ornith; sin ajuste específico para código y agentes |

## Limitaciones y advertencias

- El archivo solo funciona con radiance 1.15.1 o superior y exclusivamente sobre GPUs AMD RDNA4; no hay portabilidad a CUDA, CPU ni a otros motores.
- No incluye la cabeza MTP, por lo que no hay decodificación especulativa en esta versión; para mayor velocidad se recomienda el archivo FP8.
- Con el modo thinking activado, las tareas difíciles pueden requerir más de 32.000 tokens de salida, lo que incrementa latencia y consumo de KV.
- La model card no documenta sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados; no se puede evaluar el riesgo de sesgo por género, idioma o dominio.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo de razonamiento, puede generar cadenas de pensamiento plausibles pero incorrectas.
- La fidelidad multimodal medida (10/20 respuestas idénticas, KL 0,102) se obtuvo sobre el archivo FP8, no sobre este bf16; no hay medición directa para este archivo.
- El uso comercial está permitido por la licencia MIT, pero conviene verificar la licencia del modelo base Qwen3.5 (Apache 2.0) y las condiciones de la cabeza MTP si se usa la versión FP8.
- El rendimiento en configuraciones de cuatro tarjetas no está medido, por lo que no hay garantías de escalado lineal.
- El archivo no incluye calibración para el redondeo FP8 del `lm_head`; la pérdida es baja pero no nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keptn/ornith-1.5-9b-bf16
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión FP8: https://huggingface.co/keptn/ornith-1.5-9b-fp8
- Repositorio de radiance: https://codeberg.org/StillDeadcode/radiance
- Repositorio del modelo Ornith: https://github.com/ornith-ai/Ornith-1
- Framework de model cards de radiance: https://codeberg.org/keptn42/radiance-model-cards-framework
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
