# darioooooo0o/lfm3-1.7b-prefill-skip

## Resumen

`lfm3-1.7b-prefill-skip` es un artefacto de inferencia, no un modelo entrenado desde cero, que aplica una técnica de *prefill skipping* sobre el modelo base `LiquidAI/LFM3-1.7B`. Lo desarrolla Dario Albers (usuario `darioooooo0o`) y se publica bajo licencia Apache 2.0. La idea central es acelerar el prefill en contextos largos proyectando, mediante una regresión ridge en forma cerrada, los estados KV de ciertas capas de atención global del prompt, mientras se mantienen exactas las capas locales (convolución causal y atención de ventana deslizante) sobre la cola del prompt.

El modelo base LFM3-1.7B es un transformer híbrido de 24 capas de Liquid AI con 1.700 millones de parámetros, que combina convoluciones causales de longitud 7 y atención de ventana deslizante de 256 tokens con un pequeño número de capas de atención global. El proyecto añade un proyector minúsculo (entre 4 y 24 MiB en `.safetensors`) que se carga junto a los pesos oficiales sin modificarlos. La decodificación de cada token generado sigue ejecutando las 24 capas originales de forma exacta, de modo que el ahorro se concentra en el coste de prefill (TTFT) y no en la calidad de la generación.

La relevancia actual está en que ofrece un mecanismo de aceleración *zero-training* y *drop-in*, con conmutación instantánea entre niveles de exactitud y velocidad sin recargar el modelo base, y con una comparación honesta frente a la cuantización de pesos. El repositorio ocupa 0,1 GB e incluye los proyectores y el runner en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convolución causal + atención de ventana deslizante + capas de atención global) con *prefill skipping* por proyector ridge cerrado y caché híbrida de halo cónico |
| Parametros totales | 1.700 millones (modelo base LFM3-1.7B); proyectores de 4,2 M a 12,6 M de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Evaluado hasta 64K tokens (RULER 8K–64K); ventana de cola configurable (`tail_tokens`, por defecto 4096) |
| Tipos de cuantizacion | El modelo base en bfloat16; referencia comparativa Q8_0 (block-32) citada en la model card; no se documentan GGUF ni otras cuantizaciones del artefacto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (proyectores); pesos base en safetensors vía `LiquidAI/LFM3-1.7B`; librería PyTorch |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer híbrido de 24 capas que intercala convoluciones causales (longitud 7) y atención de ventana deslizante (ventana 256) con un subconjunto reducido de capas de atención global; la model card identifica las capas globales en los índices `[14, 18, 22]`. Sobre esta base, el artefacto introduce un *runner* que durante el prefill conserva de forma exacta los estados de las capas locales sobre la cola del prompt (los últimos `tail_tokens`, por defecto 4096) mediante un halo cónico decreciente capa a capa, y sustituye los estados KV de las capas globales seleccionadas por una proyección ridge en forma cerrada calculada a partir de un proyector `.safetensors` de tamaño reducido.

No hay entrenamiento de los pesos base: los proyectores se obtienen con regresión ridge en forma cerrada (*zero-training*), lo que explica su tamaño (4,2 M–12,6 M de parámetros) y su carácter drop-in. La decodificación es 100 % exacta en profundidad completa: cada token generado ejecuta las 24 capas originales sin modificar, y los prompts cortos (`len <= tail_tokens`) caen automáticamente al prefill exacto bit a bit (`max_diff = 0.0`). Se ofrecen varios niveles (`exact`, `s=19`, `s=15`, `s=11`) conmutables en caliente sin recargar el modelo base, y una variante *compact* de cada nivel con la mitad de parámetros.

## Capacidades

- Generación de texto autoregresiva con los pesos oficiales de LFM3-1.7B, sin alteración de los mismos.
- Aceleración del prefill en contextos largos (TTFT) mediante omisión de capas globales en el prompt, con halo exacto en la cola.
- Evaluación de logits y perplejidad (`forward_logits`) con `keep_last` configurable.
- Conmutación en caliente entre niveles de exactitud/velocidad (`exact`, `s=19`, `s=15`, `s=11`) sin recargar el modelo base.
- *Fallback* exacto automático para prompts cortos (`len <= tail_tokens`), con diferencia bit a bit nula.
- Compatibilidad con `cuda`, `xpu`, `mps` y `cpu` a través de `device="auto"`.
- Prueba de paridad incluida (`tests/test_parity.py`) para validar el comportamiento frente al modelo base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni *thinking mode* en la información disponible.

## Casos de uso

- Procesamiento de documentos largos en producción: con `tail_tokens=4096` y el nivel `s=15`, el prefill de un prompt de 32K se acelera ~1,40× en PyTorch eager, lo que reduce el TTFT en tareas de resumen o extracción sobre contratos, informes o artículos extensos.
- Evaluación de perplejidad y logits a gran escala: `forward_logits` permite calcular métricas sobre corpus largos conservando solo las últimas `keep_last` posiciones, útil en pipelines de evaluación de modelos.
- Servicio de chat con contexto largo: la decodificación ejecuta las 24 capas exactas, por lo que la calidad de generación token a token se mantiene, mientras el coste de admisión del prompt disminuye; adecuado para asistentes con historial extenso.
- Investigación en eficiencia de inferencia: el artefacto sirve como banco de pruebas reproducible para estudiar el compromiso entre omisión de capas globales y recuperación de información (RULER NIAH), con niveles comparables y métricas publicadas.
- Despliegue en hardware no NVIDIA: el soporte de `xpu` (Intel Arc) y `mps` permite usar la aceleración en estaciones de trabajo con GPU Intel o Apple Silicon, donde otras técnicas de serving pueden no estar disponibles.
- A/B testing de calidad frente a velocidad: la conmutación sin recarga (`clear_projector` / `load_projector`) permite comparar en la misma sesión la salida exacta BF16 con la de cada nivel, útil para validar umbrales de calidad antes de fijar un nivel en producción.
- Integración en pipelines de CI: el test de paridad (`tests/test_parity.py`) y el *fallback* exacto para prompts cortos permiten incorporar el artefacto a pruebas automatizadas sin riesgo de divergencia en casos pequeños.

## Benchmarks y rendimiento

Datos publicados en la model card sobre LFM3-1.7B en bfloat16, Intel Arc Pro B70, `tail=4096` salvo indicación. TTFT a 32K en PyTorch eager (mediana de 3 ejecuciones en caliente); RULER cubre 214 ítems needle-in-prefix en 4 tareas NIAH de 8K a 64K.

| Nivel | Proyector | Tamano | Capas omitidas (globales proyectadas) | TTFT 32K (`t4096` / `t2048`) | KL_all / KL_key a 32K | ΔNLL `n512` / `k2k` | RULER 8K–64K (64K) |
|---|---|---:|---|---|---|---|---|
| Exact BF16 | ninguno | 0 MiB | 0 / 24 | 1,00× / 1,00× | 0,0000 / 0,0000 | +0,000 / +0,000 | 100,0 % (100,0 %) |
| Q8_0 (ref.) | cuantización de pesos | — | 0 / 24 | — | 0,0023 / 0,0042 | +0,0005 / +0,000 | — |
| Ultra-Lossless (`s=19`) | `lfm3-1.7b-ultra-lossless-s19.safetensors` | 8,0 MiB (4,2 M) | 5 / 24 (`[22]`) | 1,19× / 1,21× | 0,0067 / 0,0294 | +0,0109 / +0,087 | — |
| Near-Lossless (`s=15`) (recomendado) | `lfm3-1.7b-near-lossless-s15.safetensors` | 16,0 MiB (8,4 M) | 9 / 24 (`[18, 22]`) | 1,40× / 1,46× | 0,0088 / 0,0374 | +0,0145 / +0,090 | 98,8 % (99,7 %) |
| Near-Lossless Compact (`s=15`) | `lfm3-1.7b-near-lossless-s15-compact.safetensors` | 8,0 MiB (4,2 M) | 9 / 24 (`[18, 22]`) | ~1,40× | 0,0079 / 0,0394 | +0,0124 / +0,146 | 96,6 % (98,7 %) |
| Fast (`s=11`) | `lfm3-1.7b-fast-s11.safetensors` | 24,0 MiB (12,6 M) | 13 / 24 (`[14, 18, 22]`) | 1,72× / 1,85× | 0,0409 / 0,4757 | +0,0260 / +0,835 | 98,0 % (97,4 %) |
| Fast Compact (`s=11`) | `lfm3-1.7b-fast-s11-compact.safetensors` | 12,0 MiB (6,3 M) | 13 / 24 (`[14, 18, 22]`) | ~1,72× | — | +0,0288 / +0,970 | 97,7 % (96,2 %) |

Según la model card, el nivel `s=15` conserva exacta la capa global 14 (la que soporta la mayor parte de la carga de recuperación de largo alcance), lo que reduce la pérdida de tokens clave 9,3× (`+0,835 → +0,090` nats; 97,8 % de recuperación) y el KL de tokens clave 12,7× (`0,4757 → 0,0374`). En RULER obtiene 100 % en `niah_single_1` (65/65), 100 % en `niah_multiquery` (40/40), 99,6 % a 32K y 99,7 % a 64K (210/214 estrictamente exactos). La comparación declarada con Q8_0 indica que la cuantización de pesos mantiene un KL_all ~3,8× menor (0,0023 frente a 0,0088) y un KL_key ~8,9× menor (0,0042 frente a 0,0374) que `s=15`; ambas técnicas actúan sobre ejes ortogonales (memoria de pesos frente a FLOPs de prefill) y su combinación no se ha evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base tiene 1.700 M de parámetros, lo que en bfloat16 supone aproximadamente 3,4 GB solo de pesos, más la caché KV y el proyector (4–24 MiB).
- GPU recomendadas: la model card cita Intel Arc Pro B70 (dispositivo `xpu`) como plataforma de evaluación; se declara compatibilidad con `cuda`, `xpu`, `mps` y `cpu`.
- GPU de consumo: no se especifica una lista concreta; por tamaño de pesos, el modelo base en bfloat16 debería caber en GPUs de consumo con suficiente VRAM, pero no se aportan cifras verificadas.
- Opciones de despliegue: el artefacto se distribuye como paquete PyTorch instalable (`pip install -e ".[hub]"`) y se ejecuta con PyTorch eager; la model card indica que motores de serving fusionados como vLLM, SGLang o llama.cpp deberían obtener mayores ganancias, pero no se han publicado resultados en esos motores.
- Latencia y throughput: TTFT a 32K en PyTorch eager sobre Intel Arc Pro B70 con `tail=4096`: 1,40× con `s=15` y 1,72× con `s=11`; con `tail=2048`: 1,46× y 1,85× respectivamente. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lfm3-1.7b-prefill-skip` (este) | 1,7 B base + 4,2–12,6 M proyector | hasta 64K evaluado | Prefill skipping zero-training sobre LFM3-1.7B | Apache 2.0 | Hugging Face, PyTorch |
| `LiquidAI/LFM3-1.7B` (base) | 1,7 B | no disponible en la información | Transformer híbrido sin aceleración de prefill | no disponible en la información | Hugging Face |
| Cuantización Q8_0 de LFM3-1.7B (referencia citada) | 1,7 B | no disponible | Cuantización de pesos block-32 | no disponible | no disponible |

No se dispone de comparaciones con otros modelos de 1,7 B ni con otras técnicas de prefill skipping en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es un modelo nuevo: depende por completo de `LiquidAI/LFM3-1.7B` y hereda sus sesgos, alucinaciones y limitaciones idiomáticas, que no se documentan.
- La omisión de capas globales introduce degradación medible: en `s=11`, el KL_key a 32K es 0,4757 y el ΔNLL `k2k` es +0,835, lo que puede afectar a tareas de recuperación de información en posiciones intermedias del prompt.
- El nivel recomendado `s=15` sigue siendo peor que Q8_0 en KL_all (~3,8×) y KL_key (~8,9×); la combinación de ambas técnicas no se ha evaluado.
- Los benchmarks se han obtenido en PyTorch eager sobre Intel Arc Pro B70; las ganancias en vLLM, SGLang o llama.cpp son esperadas pero no verificadas.
- El *fallback* exacto solo garantiza igualdad bit a bit para prompts con `len <= tail_tokens`; por encima de ese umbral la salida del prefill no es idéntica al modelo base.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado en noviembre de 2026, sin pipeline declarado ni idiomas especificados; la madurez y el mantenimiento del proyecto no están contrastados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base LFM3-1.7B antes de desplegar en producción.
- No se documentan resultados de tool calling, agentes, visión ni audio, por lo que no debe asumirse su soporte.

## Enlaces

- Hugging Face: https://huggingface.co/darioooooo0o/lfm3-1.7b-prefill-skip
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Cita del autor: Dario Albers, "Direct KV Fill: Mid-Depth KV Prediction, Normalization Geometry, and Hybrid Halo Caching Across Four Open LLMs" (2026)
