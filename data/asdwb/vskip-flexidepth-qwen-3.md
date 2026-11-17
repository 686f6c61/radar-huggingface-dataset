# asdwb/vskip-flexidepth-qwen-3

## Resumen

vskip-flexidepth-qwen-3 es una colección de checkpoints experimentales publicada por el usuario asdwb que implementa la técnica FlexiDepth sobre modelos Qwen3 de Alibaba. FlexiDepth es un mecanismo de "salto" (skip) de capas dinámico: un router entrenado decide, capa a capa, si una representación debe pasar por el bloque transformer correspondiente o saltárselo mediante una proyección directa (Project-Only path). El objetivo es reducir el coste computacional en decodificación sin reentrenar el modelo base, que permanece congelado.

El repositorio contiene exportaciones completas y deltas de router para Qwen3-4B y Qwen3-8B, además de un añadido con un router y proyector post-entrenados con GRPO sobre FlexiDepth-Llama-3-8B-Instruct. Los checkpoints se enmarcan en el artículo vSkipper (v1.7), que reporta métricas de "skip" en probing y en decodificación servida, y evaluaciones de GSM8K con lm-eval.

La relevancia es doble: por un lado, explora la eficiencia en inferencia mediante routing aprendido sobre modelos densos ya existentes; por otro, publica los artefactos de entrenamiento (tensores de router, scripts de reconstrucción bit a bit y registros de medición) para reproducibilidad. No obstante, los resultados reportados por el propio autor indican una degradación de precisión en GSM8K y, en el caso de Qwen3-4B, ausencia de ganancia resuelta en latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con router FlexiDepth y proyector por capa enrutada; Llama-3 en el añadido GRPO |
| Parametros totales | No disponible de forma agregada; el delta de router/proyector del añadido Llama-3-8B tiene 209.784.832 parámetros (64 tensores de router y 48 de proyector, capas 16-31) |
| Parametros activos | No aplica (no es MoE); el routing FlexiDepth omite bloques por decisión dinámica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors; además `step<N>_router.pt` (415 MB) y `router_weights_vskipper_format.pt` (419.608.953 bytes) en formato PyTorch |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone congelado (Qwen3-4B en la revisión `1cfa9a72`, Qwen3-8B en `d117af2f`, y FlexiDepth-Llama-3-8B-Instruct en `2ce73595`). Sobre él se entrenan únicamente tensores de router y proyector en las capas enrutadas: 18-35 de 36 en los Qwen3 y 16-31 de 32 en el Llama-3. El router decide si la activación atraviesa el bloque o toma el camino Project-Only. Las exportaciones completas incluyen los shards del base congelado, los tensores entrenados, el `modeling_ddqwen3.py` propio del checkpoint y el tokenizer; las carpetas delta contienen solo los tensores entrenados y se reconstruyen bit a bit con `training/qwen3-flexidepth/build_export.py`.

El entrenamiento es de alineación con `ste_hard` (straight-through estimator con decisión dura). Para Qwen3-4B se usa penalización 1e-5/4 (coeficiente 2.5e-6) hasta el paso 20.000. Para Qwen3-8B hay tres configuraciones: 1e-4/4 hasta el paso 7.500 y luego 4e-4/4 (coeficiente 1e-4) hasta 15.000; 1e-4/4 hasta 7.500 y luego 2e-4/4 (coeficiente 5e-5) hasta 10.000; y la misma última tasa hasta 18.750. El añadido Llama-3 usa GRPO sobre router y proyector durante 108 iteraciones con preguntas del split de entrenamiento de GSM8K. El pensamiento (thinking) está desactivado por defecto en la plantilla de chat de todas las carpetas.

## Capacidades

- Generación de texto y razonamiento heredados del backbone Qwen3 o Llama-3 subyacente.
- Decodificación con omisión dinámica de capas: el router decide en tiempo de inferencia qué bloques se saltan, con tasas de skip reportadas de 0,119 (Qwen3-4B), 0,416 (Qwen3-8B servido), 0,344 y 0,350 en los otros checkpoints Qwen3-8B.
- Evaluación de matemáticas vía GSM8K (lm-eval, exact match compuesto sobre 1.319 filas retenidas).
- Reconstrucción reproducible de checkpoints completos a partir del base público y el delta del router.
- Post-entrenamiento con GRPO del router y proyector en el añadido Llama-3-8B.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas en la información disponible.

## Casos de uso

- Investigación en eficiencia de inferencia: servir el checkpoint Qwen3-8B con el router FlexiDepth y medir latencia end-to-end frente a SGLang upstream en la misma escalera de trabajo, usando los registros de medición incluidos.
- Reproducción de experimentos: reconstruir las carpetas completas desde el snapshot público de Qwen3-8B y el delta `step18750_router.pt` con `build_export.py`, verificando la equivalencia bit a bit.
- Estudio de routing aprendido: analizar las tasas de skip de probing (0,256 a 0,520) frente a las de decodificación servida (0,119 a 0,416) para entender la brecha entre decisión en entrenamiento y en serving.
- Evaluación de compromiso precisión-latencia: comparar los tres checkpoints Qwen3-8B en GSM8K (70,43 / 75,21 / 78,09 nativos) y su coste E2E (−7,3 % / −3,6 % / −3,5 %) para elegir el punto de operación.
- Post-entrenamiento con RL: reutilizar el pipeline GRPO del añadido Llama-3-8B (108 iteraciones, solo router y proyector) como plantilla para optimizar políticas de skip en otros backbones.
- Integración en frameworks de serving: cargar el modelo con `trust_remote_code=True` y el `modeling_ddqwen3.py` incluido, y servir el brazo `vskipper_cand_grpo` nombrando el archivo en el JSON del host.

## Benchmarks y rendimiento

| Metrica | Qwen3-4B | Qwen3-8B (servido) | Qwen3-8B 2e-4 step10000 | Qwen3-8B 2e-4 step18750 |
|---|---|---|---|---|
| Capas enrutadas | 18-35 de 36 | 18-35 de 36 | 18-35 de 36 | 18-35 de 36 |
| Probe skip | 0,256 | 0,520 | 0,445 | 0,485 |
| Served decode skip (knee) | 0,119 | 0,416 | 0,344 | 0,350 |
| GSM8K nativo | ver Ap. K del paper | 70,43 (base 80,97) | 75,21 | 78,09 |
| GSM8K en knee servido vs upstream | ver Ap. K del paper | 75,06 vs 80,59 | 76,42 vs 80,52 | 80,21 vs 80,59 |
| Cambio medio E2E en el knee | sin ganancia resuelta | −7,3 ± 0,9 % | −3,6 ± 1,0 % | −3,5 ± 3,9 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks adicionales.

## Requisitos de hardware

- Tamaño del repositorio: 26,3 GB, correspondiente a exportaciones completas de Qwen3-4B y Qwen3-8B más deltas y registros.
- VRAM estimada: no disponible de forma explícita; en bf16, un backbone de 8B requiere del orden de 16 GB solo para pesos, más overhead de activaciones y KV cache, y un 4B del orden de 8 GB.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un 8B en bf16 encaja en A100/H100 y en GPUs consumer de 24 GB con cuantización.
- Despliegue: el autor referencia SGLang para las mediciones E2E y `transformers` con `trust_remote_code=True` para el añadido Llama-3. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reportan cambios relativos de latencia E2E frente a SGLang upstream (−7,3 %, −3,6 % y −3,5 % según checkpoint); no hay valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vskip-flexidepth-qwen-3 (Qwen3-8B servido) | 8B base + router | no disponible | 70,43 nativo / 75,06 en knee | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (upstream) | 8B | no disponible | 80,97 nativo / 80,59 en knee | no disponible | Hugging Face |
| xuan-luo/FlexiDepth-Llama-3-8B-Instruct | 8B base + router | no disponible | no disponible | no disponible | Hugging Face |
| vskip-flexidepth-qwen-3 (añadido Llama-3 GRPO) | 8B base + 209,8 M router/proyector | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Degradación de precisión: el checkpoint servido de Qwen3-8B baja de 80,97 a 70,43 en GSM8K nativo; en el knee servido, 75,06 frente a 80,59 del upstream.
- El checkpoint Qwen3-4B no muestra ganancia de latencia resuelta según el propio autor.
- El checkpoint de step18750 presenta una varianza alta en la medición E2E (−3,5 ± 3,9 %), lo que limita conclusiones sobre su ventaja de latencia.
- Licencia no disponible: no puede asumirse uso comercial; además, los términos del backbone Qwen3 o Llama-3 subyacente aplican por separado.
- Idiomas y contexto no documentados; el pensamiento está desactivado por defecto en la plantilla de chat.
- Requiere `trust_remote_code=True` y el `modeling_ddqwen3.py` propio, lo que añade superficie de riesgo y dependencia de código del autor.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- Riesgo de alucinación inherente al backbone, no evaluado de forma específica en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/asdwb/vskip-flexidepth-qwen-3
- Base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B (revisión `1cfa9a72`)
- Base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B (revisión `d117af2f`)
- Base FlexiDepth-Llama-3-8B-Instruct: https://huggingface.co/xuan-luo/FlexiDepth-Llama-3-8B-Instruct (revisión `2ce73595`)
- Artículo vSkipper (v1.7): referencia citada en la model card, sin URL en la información disponible
- Script de reconstrucción: `training/qwen3-flexidepth/build_export.py` en el harness del autor (sin URL en la información disponible)
- Entrenador GRPO: `training/llama3-flexidepth-grpo/` en el harness del autor (sin URL en la información disponible)
