# keptn/gemma4-31b-heretic-ara-w4a8

## Resumen

`keptn/gemma4-31b-heretic-ara-w4a8` es una cuantización W4A8 del modelo `trohrbaugh/gemma-4-31b-it-heretic-ara`, una variante "abliterated" (sin rechazos) de Gemma 4 31B-it de Google. El modelo lo publica el usuario keptn empaquetado en un único fichero de 19,74 GiB en formato propietario `.rad` para el motor de inferencia radiance, orientado específicamente a GPUs AMD RDNA4 (ROCm). Resuelve el problema de ejecutar un modelo multimodal de 31B parámetros en hardware AMD de consumo profesional con un consumo de memoria contenido y decodificación especulativa integrada.

La relevancia actual del modelo es doble: por un lado demuestra el ecosistema de inferencia que está creciendo alrededor de RDNA4 (radiance 1.12.0 o superior, probado con 2.0.0); por otro, aplica una cuantización GPTQ con SmoothQuant en q/k/v y activaciones int8 por fila, manteniendo el cabezal del asistente (assistant head) de Gemma 4 para decodificación especulativa con 3 tokens de borrador. El contexto declarado es de 262.144 tokens, con entradas de texto, imagen y vídeo.

Se trata de un modelo derivado con la censura eliminada ("heretic"), por lo que responde a peticiones que el original rechazaría. Esto lo hace inadecuado para despliegues de producción sin moderación externa, pero interesante para investigación sobre alineación, evaluación de robustez y experimentación con modelos sin restricciones de rechazo. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con cabezal asistente para decodificación especulativa |
| Parámetros totales | 31B (según nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A8: pesos int4 (GPTQ, una escala por 128 columnas, SmoothQuant en q/k/v con alpha 0.5), activaciones int8 por fila, lm_head int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance); fichero único de 19,74 GiB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B-it, un transformer multimodal de Google que procesa texto, imagen y vídeo, con 32 cabezales de atención (dato relevante porque condiciona el tensor parallelism: no admite 3 GPUs). Sobre esa base, `trohrbaugh/gemma-4-31b-it-heretic-ara` aplica una modificación de tipo "abliterated" que elimina los rechazos del modelo original. keptn parte de esa revisión (`f961f79e`) en bf16, sustituye la plantilla de chat, tokenizer y configuración del procesador por las originales de Google (la versión heretic-ara traía una plantilla antigua) y aplica la cuantización.

El proceso de cuantización usa un conjunto de calibración de 110 conversaciones y 165.626 tokens, idéntico al del build original de keptn. Se aplica SmoothQuant con alpha 0.5 sobre las proyecciones q/k/v, seguido de GPTQ con una escala por cada 128 columnas para los pesos int4, activaciones int8 por fila y lm_head en int8 (incluido el del cabezal asistente). La innovación técnica destacable es la integración de la decodificación especulativa mediante el cabezal asistente nativo de Gemma 4 con 3 tokens de borrador, que acelera la decodificación sin necesidad de un modelo draft separado.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 262.144 tokens.
- Procesamiento de imagen (pipeline `image-text-to-text`), con evaluación sobre DocVQA y AI2D.
- Procesamiento de vídeo (evaluación sobre MVBench con 5 clips de 4 fotogramas).
- Modo "thinking" activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa con 3 tokens de borrador mediante el cabezal asistente de Gemma 4.
- Modelo "abliterated": responde a peticiones que el modelo original rechaza (tasa de rechazo del 0,8% en OR-Bench-Hard-1K frente al 33,5% del original).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo permite estudiar qué tipos de peticiones rechaza un modelo alineado frente a su variante abliterated, comparando las tasas de rechazo (0,8% frente a 33,5% en OR-Bench-Hard-1K) con el mismo prompt y decodificación greedy.
- Procesamiento de documentos con imágenes en hardware AMD: con soporte de DocVQA y AI2D y contexto de 262.144 tokens, se puede usar para extracción de información de documentos escaneados en un servidor con una o dos Radeon AI PRO R9700.
- Análisis de vídeo de corta duración: el modelo acepta vídeo como entrada (evaluado en MVBench), útil para resumen o descripción de clips en pipelines de monitorización.
- Despliegue en clústeres AMD con tensor parallelism: la configuración documentada para 2 y 4 tarjetas (148,7 y 239,0 tokens/s en decodificación de un stream) permite servir el modelo en infraestructura ROCm existente sin GPUs NVIDIA.
- Generación aumentada por recuperación con contexto largo: los 262.144 tokens de contexto permiten inyectar grandes volúmenes de documentación; con `max-model-len: 262144` y 2 secuencias caben 524.304 tokens de pool KV en 2 tarjetas.
- Evaluación comparativa de cuantizaciones: el autor publica métricas KL frente al bf16 original (KL medio 0,0529, percentil 99 de 0,732, 94,4% de coincidencia en el token superior), lo que permite medir el coste de calidad de W4A8 frente a la variante i8g (KL medio 0,00249) en tareas concretas.
- Experimentación con decodificación especulativa: sirve para medir el impacto del cabezal asistente de Gemma 4 con 3 tokens de borrador en latencia y throughput sobre RDNA4.

## Benchmarks y rendimiento

Calidad frente al original bf16 (80 preguntas de MT-Bench, ambos turnos, 42.283 tokens de respuesta, thinking off):

| Métrica | Este fichero (W4A8) | keptn/gemma4-31b-heretic-ara-i8g |
|---|---|---|
| KL medio | 0,0529 | 0,00249 |
| KL percentil 99 | 0,732 | 0,0324 |
| Token superior coincidente | 94,4% | 98,7% |
| Ratio de perplejidad | ×1,048 | ×1,006 |

Rendimiento en Radeon AI PRO R9700 a 215 W, fp8 KV, 3 tokens de borrador, thinking off (BetterBench 0.6.1, temperatura 0,7, mediana de tokens por segundo):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decodificación, un stream | 84,2 | 148,7 | 239,0 |
| Prefill a 24k tokens | 1.608 | 2.799 | 4.500 |
| 4 streams, total | 247 | 399 | 619 |

Fidelidad multimodal frente al bf16 original (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Misma respuesta | KL medio | Token superior coincidente |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 16/20 | 0,471 | 66/70 |
| Vídeo (MVBench, 5 clips) | 5 | 4/5 | 0,0272 | 31/32 |

Tasas de rechazo (greedy, thinking off, sin system prompt):

| Benchmark | Este fichero | Build del original |
|---|---|---|
| XSTest, 250 prompts seguros, rechazos completos | 0 (0,0%) | 3 (1,2%) |
| XSTest, 250 prompts seguros, rechazos completos y parciales | 1 (0,4%) | 6 (2,4%) |
| OR-Bench-Hard-1K, 1.319 prompts, tasa de rechazo | 10 (0,8%) | 442 (33,5%) |

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 19,74 GiB; el pool KV a contexto completo (262.144 tokens, fp8 KV) requiere memoria adicional que, según el informe de arranque de radiance, permite 303.888 tokens de contexto en 1 tarjeta con 2 secuencias y hasta 2.097.248 tokens en 4 tarjetas con 8 secuencias.
- GPUs recomendadas: Radeon AI PRO R9700 con 32 GB (probado); se necesitan 1, 2 o 4 tarjetas de 32 GB. Tres tarjetas no funcionan porque Gemma tiene 32 cabezales de atención y no se dividen entre tres.
- Cabe en GPU de consumo: no hay datos de consumo; el requisito declarado es de 32 GB por tarjeta, propio de GPUs profesionales RDNA4.
- Opciones de despliegue: exclusivamente el motor radiance (versión 1.12.0 o superior; probado con 2.0.0), disponible como imagen Docker `stilldeadcode/radiance:2.0.0` con ROCm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 84,2 tokens/s en decodificación de un stream con 1 tarjeta, 148,7 con 2 y 239,0 con 4; prefill de 1.608 a 4.500 tokens/s según número de tarjetas; 619 tokens/s agregados con 4 streams en 4 tarjetas.
- Configuración de referencia: `tp: 2`, `p2p: on`, `kv-cache-dtype: i8`, `max-model-len: 65536`, `max-num-seqs: 8`, `num-speculative-tokens: 3`, `vision-tower-placement: ram`; muestreo de Google: temperatura 1,0, top_p 0,95, top_k 64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keptn/gemma4-31b-heretic-ara-w4a8 | 31B | 262.144 | `.rad`, W4A8 (GPTQ + SmoothQuant) | Apache 2.0 | Hugging Face, requiere radiance en AMD RDNA4 |
| keptn/gemma4-31b-heretic-ara-i8g | 31B | no disponible | int8 (formato no especificado en la información) | no disponible | Hugging Face; KL medio 0,00249 frente a bf16 |
| trohrbaugh/gemma-4-31b-it-heretic-ara | 31B | no disponible | bf16 | no disponible | Hugging Face; modelo base del fichero |
| google/gemma-4-31B-it-assistant | 31B | no disponible | pesos originales | no disponible | Hugging Face; modelo base original |

## Limitaciones y advertencias

- Modelo "abliterated": elimina los rechazos del original (0,8% frente a 33,5% en OR-Bench-Hard-1K), por lo que puede generar contenido que el modelo alineado bloquearía. El propio autor advierte que la responsabilidad del uso recae en el usuario.
- No se han publicado datos sobre sesgos demográficos, toxicidad ni evaluación de seguridad en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; el ratio de perplejidad de ×1,048 frente a bf16 indica una degradación medible, especialmente en el percentil 99 de KL (0,732).
- Idiomas soportados no documentados; la evaluación de calidad se limita a MT-Bench en inglés.
- Restricciones de licencia: Apache 2.0 declarada, pero el modelo deriva de pesos de Google (Gemma 4) cuyo uso puede estar sujeto a los términos de Gemma; conviene verificar la licencia del modelo base antes de uso comercial.
- Dependencia de hardware y software muy específica: solo funciona con radiance 1.12.0 o superior sobre ROCm y RDNA4; no hay soporte para CUDA ni para motores de inferencia habituales.
- El tensor parallelism solo admite 1, 2 o 4 tarjetas; tres tarjetas no funcionan por la división de los 32 cabezales de atención.
- El fichero está en formato propietario `.rad`, no en safetensors ni GGUF, lo que limita su portabilidad.
- La plantilla de chat, tokenizer y procesador se sustituyeron por los originales de Google; el modelo base heretic-ara traía una plantilla antigua, lo que puede afectar a la reproducibilidad de resultados previos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-heretic-ara-w4a8
- Modelo base heretic-ara: https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it-assistant
- Variante int8 de referencia: https://huggingface.co/keptn/gemma4-31b-heretic-ara-i8g
- Build W4A8 original de keptn: https://huggingface.co/keptn/gemma4-31b-w4a8
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen Docker de radiance: `stilldeadcode/radiance:2.0.0`
