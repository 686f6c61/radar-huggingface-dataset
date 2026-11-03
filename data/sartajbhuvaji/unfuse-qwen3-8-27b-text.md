# sartajbhuvaji/unfuse-Qwen3.8-27B-text

## Resumen

`unfuse-Qwen3.8-27B-text` es una versión del modelo `Qwen/Qwen3.8-27B` a la que se le ha eliminado por completo la torre de visión, publicada por el usuario sartajbhuvaji bajo licencia Apache 2.0. No se trata de un fine-tuning ni de una destilación: se han borrado los 333 tensores del módulo visual y los 866 restantes se han remapeado sobre la clase `Qwen3_5ForCausalLM`, de modo que el modelo resultante es un causal-LM de texto puro. El camino de texto es byte a byte idéntico al original, lo que garantiza salidas idénticas para cualquier entrada.

El modelo conserva los 27.320.697.856 parámetros del checkpoint original menos la pila visual (460.730.096 parámetros), e incluye además una cabeza MTP (multi-token prediction) de 424.699.392 parámetros que ningún loader actual puede aprovechar. La arquitectura es híbrida: 64 capas de decoder, de las cuales 48 son de atención lineal y 16 de atención completa, con una capa de atención completa cada cuatro.

Su relevancia es operativa, no de capacidad: al eliminar las dependencias multimodales se obtiene una configuración de causal-LM plana, sin preprocesado de imágenes ni rutas de código multimodal, y se liberan aproximadamente 0,97 GiB de VRAM en una H100 80GB, lo que se traduce en un 8,6-8,7 % más de tokens de caché KV y de concurrencia máxima a 32k de contexto. Está pensado para despliegues de texto a gran escala donde la visión no aporta nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (48 capas de atención lineal + 16 de atención completa, intervalo 4), clase `Qwen3_5ForCausalLM` |
| Parametros totales | 27.320.697.856 (checkpoint); 26.895.998.464 cargados por transformers (excluye la cabeza MTP ignorada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el autor mide concurrencia a 32k de contexto) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en bf16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (866 tensores, 54,64 GB en bf16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B no es un transformer convencional: sus 64 capas de decoder se reparten en 48 capas de `linear_attention` y 16 de `full_attention`, con `full_attention_interval: 4`, `linear_conv_kernel_dim: 4` y `mamba_ssm_dtype: float32`. Esta configuración híbrida condiciona el serving y obliga a usar flags específicas en los motores de inferencia. La modificación aplicada aquí consiste en eliminar el árbol `model.visual.*` completo: la ViT de 27 capas (dimensión 1152, 16 cabezas, patch 16), el patch embedding y el merger que proyecta de 1152 a 5120, en total 333 tensores y 460.730.096 parámetros.

No hay ningún tipo de reentrenamiento, RLHF, DPO ni ajuste posterior: la model card es explícita en que no hay fine-tuning ni destilación. La verificación se hizo por igualdad de bytes en cada tensor conservado (866 tensores, 54,64 GB, resultado PASS en tres ejecuciones independientes, una local y dos en una H100 alquilada), un criterio más fuerte que comparar logits en prompts de muestra. El autor descarta también que los `deepstack_visual_indexes` de la `vision_config` original conecten la rama visual con el tronco de texto en varias profundidades: ningún tensor lleva nombre deepstack y los 1.199 tensores originales se reparten limpiamente entre `model.visual.`, `model.language_model.`, `lm_head` y `mtp.`, por lo que el corte es un único edge. Se conserva la cabeza MTP especulativa fusionada (15 tensores, 424.699.392 parámetros, 0,85 GB) aunque ningún loader pueda usarla hoy, para no obligar a una descarga futura de 55 GB.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento aritmético básico y traducción (verificado en la model card: "84 * 3 / 2" → "126"; traducción al alemán correcta).
- Generación de código (verificado: one-liner en Python para invertir una cadena → `s[::-1]`).
- Razonamiento multi-turno con contexto largo, limitado por la ventana del modelo base (no documentada aquí).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multimodales: eliminadas por diseño (no acepta imágenes).
- Modo thinking explícito: no disponible en la información proporcionada.
- Cabeza MTP de decodificación especulativa: presente en el checkpoint pero inutilizable con transformers 5.15 y vLLM 0.27.1.

## Casos de uso

- **Servicio de chat de texto a alta concurrencia**: al liberar 0,97 GiB de pesos se ganan 1,57 GiB de caché KV (19,84 frente a 18,27 GiB), lo que permite pasar de 277.435 a 301.465 tokens en caché y de 8,47× a 9,20× de concurrencia máxima a 32k de contexto en una H100 80GB. Adecuado para backends conversacionales donde la visión es irrelevante.
- **Procesamiento por lotes de documentos en inglés y chino**: pipelines de resumen, extracción y clasificación de texto sin necesidad de cargar el stack multimodal ni su preprocesado de imágenes, lo que simplifica el contenedor de despliegue.
- **Generación de código en herramientas internas**: el modelo resuelve tareas de código sencillas verificadas en la model card; encaja en asistentes de IDE o scripts de automatización donde no se requiere visión de capturas.
- **Traducción automática EN-ZH y ZH-EN**: los dos idiomas declarados cubren el par más habitual en documentación técnica y comercio electrónico transfronterizo.
- **Sustitución directa en despliegues vLLM existentes**: la configuración plana de causal-LM evita las rutas de código multimodal y las dependencias de preprocesado, reduciendo la superficie de fallo en producción.
- **Investigación sobre arquitecturas híbridas de atención**: al ser byte-idéntico al original en el camino de texto, sirve como referencia controlada para estudiar el efecto de las capas de atención lineal frente a las completas sin la variable multimodal.
- **Evaluación comparativa de motores de inferencia**: el autor publica métricas cruzadas vLLM 0.27.1 y SGLang 0.5.18 sobre el mismo hardware, útil para calibrar planificadores de memoria y políticas de concurrencia.

## Benchmarks y rendimiento

Medido en 1× NVIDIA H100 80GB HBM3 (sm_90, driver 580.105.08, CUDA 13.0, 700 W, torch 2.7.0, Ubuntu 24.04.4), con 512 tokens de entrada y 256 de salida, greedy, `ignore_eos`, todas las filas con warm-up previo.

| Motor | Modelo | Concurrencia | Salida tok/s | Por stream | TTFT p50 | TTFT p99 | TPOT |
|---|---|---|---|---|---|---|---|
| vLLM 0.27.1 | original | 1 | 47,4 | 47,4 | 69,0 ms | 69,3 ms | 20,42 ms |
| vLLM 0.27.1 | este modelo | 1 | 46,6 | 46,6 | 69,0 ms | 69,2 ms | 21,28 ms |
| vLLM 0.27.1 | original | 16 | 635,8 | 39,7 | 657,2 ms | 669,5 ms | 22,70 ms |
| vLLM 0.27.1 | este modelo | 16 | 554,7 | 34,7 | 654,1 ms | 673,7 ms | 26,04 ms |
| SGLang 0.5.18 | original | 1 | 48,8 | 48,8 | 63,1 ms | 63,2 ms | 20,25 ms |
| SGLang 0.5.18 | este modelo | 1 | 47,2 | 47,2 | 69,5 ms | 69,6 ms | 20,91 ms |
| SGLang 0.5.18 | original | 16 | 225,3 | 14,1 | 10.585 ms | 15.858 ms | 21,62 ms |
| SGLang 0.5.18 | este modelo | 16 | 628,5 | 39,3 | 714,8 ms | 719,3 ms | 22,94 ms |

Ocupación de memoria en H100 80GB con vLLM 0.27.1:

| Métrica | Original | Este modelo | Variación |
|---|---|---|---|
| Pesos en VRAM | 51,10 GiB | 50,13 GiB | −0,97 GiB (−1,9 %) |
| Caché KV disponible | 18,27 GiB | 19,84 GiB | +1,57 GiB (+8,6 %) |
| Tokens en caché KV | 277.435 | 301.465 | +8,7 % |
| Concurrencia máxima a 32k | 8,47× | 9,20× | +8,6 % |

El autor advierte explícitamente de que este modelo no es más rápido que el original: en vLLM el original gana por 1,15× a concurrencia 16, y la ventaja de 2,79× en SGLang se debe a que el planificador de memoria asignó `max_running_requests=5` al original frente a 16 a este modelo, penalizándolo artificialmente. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia**: en bf16, 50,13 GiB de pesos en una H100 80GB según la medición del autor; el repo ocupa 54,7 GB. No se documentan variantes cuantizadas, por lo que no hay cifras para int8, int4 o GGUF.
- **GPU recomendadas**: H100 80GB (única configuración medida). Para el checkpoint completo en bf16 se requiere al menos 80 GB de VRAM; no hay datos publicados para A100 80GB, aunque por capacidad de memoria sería el mínimo equivalente.
- **Consumer GPU**: no cabe en ninguna GPU de consumo en bf16 (RTX 4090 con 24 GB, RTX 3090 con 24 GB). No se han publicado cuantizaciones que lo permitan.
- **Motores de despliegue**: vLLM 0.27.1 y SGLang 0.5.18 medidos por el autor; transformers 5.15 carga el modelo como `Qwen3_5ForCausalLM` en 8,9 s e informa 26.895.998.464 parámetros (la diferencia son los 424.699.392 de la cabeza MTP ignorada). No hay datos de llama.cpp, Ollama ni TGI.
- **Flags obligatorias**: por la arquitectura híbrida (atención lineal con `linear_conv_kernel_dim: 4` y `mamba_ssm_dtype: float32`) el autor remite a la sección "Required flags" de la model card; es necesario revisarlas antes de servir.
- **Latencia y throughput**: TTFT p50 de 69,0 ms a concurrencia 1 en vLLM y 654,1 ms a concurrencia 16; TPOT de 21,28 ms y 26,04 ms respectivamente. En SGLang, TTFT p50 de 69,5 ms a concurrencia 1 y 714,8 ms a concurrencia 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Visión | Contexto | Licencia | Throughput (H100, vLLM, c=16) | Notas |
|---|---|---|---|---|---|---|
| unfuse-Qwen3.8-27B-text | 27,32 B (26,90 B cargados) | No | No disponible | Apache 2.0 | 554,7 tok/s | Objeto de esta ficha; configuración causal-LM plana |
| Qwen/Qwen3.8-27B (original) | 27,78 B | Sí | No disponible | Apache 2.0 | 635,8 tok/s | Mismo camino de texto byte-idéntico; +0,97 GiB de VRAM; MTP tampoco utilizable en vLLM 0.27.1 |
| unfuse-Qwen3.8-27B-text en SGLang 0.5.18 | 27,32 B | No | No disponible | Apache 2.0 | 628,5 tok/s | Cifra condicionada por el reparto de `max_running_requests` del planificador |

No se dispone de datos de otros modelos de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo más rápido**: en vLLM el original supera a este modelo por 1,15× a concurrencia 16. La ganancia real es de memoria (0,97 GiB de pesos y 1,57 GiB de caché KV), no de throughput.
- **La ventaja en SGLang es un artefacto de medición**: el 2,79× se debe a que el planificador asignó 5 peticiones concurrentes al original frente a 16 a este modelo; no debe citarse como mejora arquitectónica.
- **Cabeza MTP inutilizable**: con vLLM 0.27.1 y `model_type: qwen3_5_text` se obtiene `NotImplementedError: Unsupported speculative method: 'mtp'`; forzando `model_type: qwen3_5` falla por discrepancia de formas (5120 frente a 4096). La autodetección de MTP de vLLM solo se activa para `qwen3_5` y `qwen3_5_moe`, y esa ruta espera un `text_config` anidado que una configuración plana no puede satisfacer.
- **Pérdida total de capacidades multimodales**: no acepta imágenes ni capturas; cualquier flujo que dependa de entrada visual requiere el modelo original.
- **Idiomas limitados a inglés y chino**: no se declara soporte de español ni de otras lenguas, con el riesgo de degradación que ello implica.
- **Contexto no documentado**: la model card no publica la longitud máxima de contexto del modelo base, solo mediciones de concurrencia a 32k; conviene verificar el límite real antes de dimensionar producción.
- **Riesgo de alucinación y sesgos**: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación en la información proporcionada.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen subyacente y atribuir correctamente.
- **Verificación limitada al camino de texto**: la igualdad de bytes garantiza la equivalencia, pero no se han publicado evaluaciones de calidad propias (MMLU, HumanEval, GSM8K) para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sartajbhuvaji/unfuse-Qwen3.8-27B-text
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del autor con JSON de benchmarks y captura de entorno: https://github.com/SartajBhuvaji/unfuse
