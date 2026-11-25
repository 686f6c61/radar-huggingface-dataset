# kingjones777/Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF es una cuantización de pesos en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario kingjones777. El artefacto combina tres elementos: una variante "abliterated" o "uncensored" del modelo base (que elimina el comportamiento de rechazo de contenido), una cuantización de 4 bits específica para hardware AMD (denominada ROCmFP4/ROCmFPX), y un conjunto de ajustes orientados a decodificación especulativa mediante Multi-Token Prediction (MTP) sobre la iGPU Radeon 8060S del sistema AMD Strix Halo (gfx1151).

El modelo resuelve un problema muy concreto: servir un LLM de aproximadamente 27 000 millones de parámetros en un equipo con memoria unificada de 128 GB y aceleración ROCm, maximizando el throughput de decodificación en un único dispositivo integrado. Para ello el autor publica variantes con distintos "ftypes" (103 FAST, 106 STRIX_LEAN, 114 Q6 AGENT, 116 Q6 LEAN) y documenta una curva de decodificación especulativa cuyo punto óptimo se sitúa en `--spec-draft-n-max 4`, con velocidades medidas de 23-25 tok/s en prosa y 42-43 tok/s en código.

Es relevante ahora porque ejemplifica una tendencia práctica: cuantizaciones hiperespecializadas por hardware para inferencia local en equipos de consumo o semiprofesionales, con ajustes de decodificación especulativa documentados empíricamente. No obstante, se trata explícitamente de un artefacto de investigación según su propio autor, no de un modelo recomendado para producción por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.8-27B); decodificación especulativa MTP con drafter separado |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65 536 tokens en el ejemplo de despliegue del autor; ventana nativa del modelo base no disponible |
| Tipos de cuantizacion | ROCmFP4 ftype 103 (FAST), 106 (STRIX_LEAN), 114 (Q6 AGENT), 116 (Q6 LEAN); drafter MTP en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / ROCmFPX) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer decoder-only de 26,9 mil millones de parámetros. El artefacto publicado no reentrena el modelo: aplica una modificación de tipo "abliteration" sobre los pesos BF16 del modelo base para eliminar las respuestas de rechazo, y después cuantiza a 4 bits con el pipeline ROCmFPX, generando ftypes propios (103 FAST y 106 STRIX_LEAN) más dos variantes Q6 (114 AGENT y 116 LEAN). El autor indica que las variantes de 4 bits 103 y 106 provienen del mismo checkpoint abliterated y que, por tanto, no deberían reintroducir rechazos.

La innovación técnica principal es la integración de decodificación especulativa mediante Multi-Token Prediction. Qwen3.8-27B expone `nextn_predict_layers = 1` como un drafter GGUF separado (`mtp-Qwen3.8-27B-Q4_0.gguf`), no como capas nextn internas. El autor documenta que el valor por defecto de llama.cpp (`--spec-draft-n-max 16`) queda al otro lado de la curva de rendimiento y que el punto óptimo es n=4, con una tasa de aceptación de 0,926 en la variante alineada. También advierte de que el drafter debe residir en GPU (`--spec-draft-ngl 99`) para que la ganancia no desaparezca. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, con plantilla Jinja.
- Generación de código, con throughput medido notablemente superior al de prosa (42,70-42,80 tok/s frente a 23,08-24,73 tok/s en las pruebas del autor).
- Modo de razonamiento configurable mediante `enable_thinking` y `reasoning_effort`; el valor por defecto es `xhigh` y el autor recomienda `false` o `low` para presupuestos de tokens pequeños.
- Tool calling / function calling: el autor reporta que funciona en la configuración verificada con el repositorio oficial ROCmFPX.
- Decodificación especulativa MTP con drafter separado, con ganancia de throughput documentada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.
- Alineación de seguridad reducida deliberadamente (abliterated): no rechaza contenido que el modelo alineado rechazaría.

## Casos de uso

- Inferencia local en AMD Strix Halo: el artefacto está calibrado para Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), ROCm 7.2.4 y 128 GB de memoria unificada, donde ocupa 13,33-13,59 GiB en las variantes de 4 bits y deja margen para contexto largo y otros procesos.
- Asistencia de código en estación de trabajo: con 42,70-42,80 tok/s en código y tool calling operativo, es adecuado para autocompletado, generación de parches y refactorizaciones en un flujo local sin depender de API externa.
- Prototipado de agentes con razonamiento multi-paso: la ventana de 65 536 tokens configurada en el ejemplo de despliegue permite mantener historiales largos de herramientas y observaciones intermedias.
- Investigación sobre alineación y rechazo: el autor emplea un conjunto de 24 prompts dañinos, 12 inofensivos y 8 de calidad para medir tasas de rechazo, lo que hace del artefacto un instrumento para estudiar el efecto de la abliteration sobre el comportamiento de negativa.
- Evaluación de decodificación especulativa: sirve para reproducir curvas de throughput frente a la profundidad del drafter (n=3, n=4, n=5) en hardware integrado AMD, un escenario poco cubierto por los benchmarks habituales de GPU discretas.
- Despliegue de servicio local con `llama-server`: el comando documentado expone una API HTTP en el puerto 8080 con plantilla de chat, útil para integrar el modelo en herramientas internas de un equipo pequeño.
- Experimentación con cuantizaciones de 4 bits no estándar: los ftypes 103 y 106 permiten comparar tamaño, perplejidad y velocidad dentro del mismo pipeline ROCmFPX.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de throughput y de comportamiento de rechazo realizadas por el autor, no benchmarks académicos estándar.

| Metrica | Resultado |
|---|---|
| Unc FAST (103) decode @8K MTP, prosa | 23,08 tok/s |
| Unc FAST (103) decode @8K MTP, codigo | 42,80 tok/s |
| Unc STRIX_LEAN (106) decode @8K MTP, prosa | 24,73 tok/s |
| Unc STRIX_LEAN (106) decode @8K MTP, codigo | 42,70 tok/s |
| Alineado STRIX (105) MTP n=4 (publicado) | 30,30 tok/s |
| Alineado STRIX_LEAN (106) sin especulacion (publicado) | 13,46 tok/s |
| Alineado STRIX_LEAN (106) perplejidad (publicado) | 5,8871 |
| Curva MTP alineada STRIX @8K | n=3: 30,13 · n=4: 30,30 (aceptacion 0,926) · n=5: 27,52 |
| Curva MTP uncensored Q6 LEAN (116) | n=3: 24,96 · n=4: 27,66 · n=5: 25,27 |

Evaluación de rechazo (greedy, conteo de respuestas):

| Modelo | Dañinos (24) | Inofensivos (12) | Calidad (8) |
|---|---|---|---|
| Qwen3.8 alineado Q8 AGENT | 23 rechazan, 1 cumple | 11/12 correctos | 6/8 |
| Qwen3.8 uncensored Q6 AGENT (114) | 23 cumplen, 1 roto | 11/12 correctos | 6/8 |
| Muse alineado Q6 AGENT (114) | 18 rechazan, 6 cumplen | 11/12 correctos | 7/8 |
| Muse uncensored STRIX_LEAN (106) | 24 cumplen | 12/12 correctos | 7/8 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 13,33 GiB (ftype 103 FAST), 13,59 GiB (ftype 106 STRIX_LEAN), 20,37 GiB (ftype 116 Q6 LEAN), 23,15 GiB (ftype 114 Q6 AGENT). El repositorio completo ocupa 77,9 GB.
- Hardware de referencia: Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 128 GB de memoria unificada, ROCm 7.2.4.
- GPU discretas: no se han documentado pruebas en A100, H100 o RTX 4090; el artefacto está orientado a iGPU AMD con memoria unificada.
- Cabe en GPU de consumo: las variantes de 4 bits (13,3-13,6 GiB) caben en GPUs con 16 GB o más de VRAM, aunque los ajustes y el drafter están calibrados para gfx1151.
- Despliegue: `llama-server` de llama.cpp o del fork ROCmFPX, con `--spec-type draft-mtp`, `--spec-draft-ngl 99`, `--spec-draft-n-max 4`, `-fa on`, `-dio`, `--jinja`, `-fit off`, `--parallel 1` y `-dev ROCm0`.
- Throughput: 23-25 tok/s en prosa y 42-43 tok/s en código con MTP n=4 en el hardware de referencia; 13,46 tok/s sin especulación en la variante alineada equivalente.
- Nota de compatibilidad: el autor reporta cinco bugs apilados en la línea legacy `charlie12345/ROCmFPX` en Windows 11 / gfx1151 / HIP SDK 7.2, resueltos en el repositorio oficial ROCmFPX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF | 26,9 B | 65 536 (config. autor) | GGUF ROCmFP4 | Apache 2.0 | Cuantización 4-bit para AMD Strix Halo con MTP |
| kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF (alineado) | 26,9 B | no disponible | GGUF ROCmFP4 | Apache 2.0 | Misma receta sin abliteration; 30,30 tok/s en código con MTP n=4 |
| Qwen/Qwen3.8-27B (base) | 26,9 B | no disponible | safetensors BF16 | Apache 2.0 | Modelo alineado de referencia, sin cuantización específica de hardware |
| Muse uncensored STRIX_LEAN (106) | no disponible | no disponible | GGUF | no disponible | Variante uncensored comparable citada por el autor; 24/24 cumplen en el set dañino |

## Limitaciones y advertencias

- El propio autor califica el artefacto como "research artifact" y advierte explícitamente de que no debe desplegarse como opción por defecto en un producto; el repositorio alineado sigue siendo la referencia de servicio.
- La abliteration elimina el rechazo de contenido, no añade capacidad. El modelo cumplirá solicitudes dañinas que el modelo alineado rechaza (23 de 24 en el conjunto de prueba del autor).
- Riesgo elevado de usos indebidos: sin capa de rechazo, no hay salvaguarda integrada frente a contenido dañino, ilegal o inseguro.
- La evaluación de rechazo se realizó sobre la variante Q6 AGENT (114); el autor asume, sin medirlo directamente, que las variantes de 4 bits 103 y 106 se comportan igual por provenir del mismo checkpoint.
- El modo de razonamiento por defecto es `xhigh`; con presupuestos de tokens pequeños devuelve `content` vacío. El valor `none` lanza una excepción y debe usarse `false` o `low`.
- La ruta de decodificación especulativa con drafter separado tiene bugs conocidos en la línea legacy de ROCmFPX en Windows 11 con gfx1151 e HIP SDK 7.2; requiere el repositorio oficial.
- El rendimiento está calibrado para un hardware muy concreto (gfx1151, ROCm 7.2.4); los tok/s no son extrapolables a otras GPU.
- No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K), ni de idiomas soportados, ni de sesgos medidos.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada al operador toda la responsabilidad legal y ética del despliegue.
- El repositorio ocupa 77,9 GB, lo que exige espacio en disco considerable aunque solo se use una variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF
- Variante alineada del mismo autor: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial ROCmFPX: https://github.com/ROCmFPX/ROCmFPX
- Pull request de la línea legacy: https://github.com/charlie12345/ROCmFPX/pull/109
