# latentport/LPCombine-Qwen3.5-9B

## Resumen

LPCombine-Qwen3.5-9B es un artefacto de investigación publicado por latentport (Simon P. Villani) que implementa una operación de combinación de estados de caché sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo de lenguaje entrenado de forma convencional: el repositorio contiene un readout denso en FP32 (8.392.704 parámetros según safetensors) que se acopla al modelo base congelado para fusionar dos contextos previamente capturados en una única caché resumible. La operación concatena el contexto derecho a la caché izquierda y el readout propone tokens a partir de las claves y valores de la primera capa de atención completa, verificándose los candidatos contra la caché temprana.

El interés técnico reside en que permite combinar estados de contexto independientes sin re-prefijar el texto completo, algo relevante para pipelines con prompts largos, agentes que acumulan contexto de fuentes distintas o sistemas que necesitan reanudar sesiones. El modelo base Qwen3.5-9B aporta la arquitectura y los pesos, mientras que LPCombine añade la lógica de combinación a través de la librería `latentport` (versión 0.4.9 o superior).

La relevancia es limitada y experimental: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es 0.0 GB (solo se publican los artefactos del readout, no los pesos base) y la evaluación reportada es mínima (4 ensayos de coincidencia de token greedy y una muestra de HumanEval/GSM8K con puntuaciones de 1/4). Debe tratarse como una prueba de concepto reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B) con readout denso de combinación de caché |
| Parametros totales | 8.392.704 (readout en safetensors); pesos base no incluidos en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | BF16, NF4, GGUF (Q4_K_M probado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos base sujetos a sus términos upstream) |
| Formato de pesos | safetensors (readout); GGUF disponible vía runtime LatentPort |

## Arquitectura y entrenamiento

El componente entrenado es un readout denso en FP32 ajustado sobre 18.432 tokens sintéticos con el modelo Qwen3.5-9B congelado en NF4. La operación `combine` añade el contexto derecho a la caché izquierda en ese orden; el readout propone tokens a partir de las claves y valores de la primera capa de atención completa y el modelo verifica los candidatos contra su caché temprana antes de actualizar la sesión. El readout utiliza una caché derecha densa y posiciones de texto nativas.

No se documenta el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF/DPO, ya que esos datos corresponden a Qwen/Qwen3.5-9B y no se incluyen en la información disponible. La innovación destacable es la combinación de estados de caché sin re-prefijar, con soporte de decodificación cache-only en backends compatibles (BF16 y NF4) y replay de tokens retenidos mediante `model.live(retain_replay=True)`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B (no evaluados de forma independiente en esta ficha).
- Combinación de dos contextos previamente capturados en una única caché resumible (`left.combine(right, model=model, method="cache")`).
- Decodificación cache-only en backends BF16 y NF4; GGUF soporta tokens retenidos pero no cache-only.
- Replay de tokens residentes mediante `retain_replay=True`.
- Instalación del resultado en una sesión activa (`session.combine(right)`).
- Combinación de estados guardados desde CLI (`latentport combine LEFT RIGHT OUTPUT`).
- Guardado y carga de snapshots de estado (validado en BF16, NF4 y GGUF).
- Tool calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes con contexto de fuentes distintas: fusionar el estado de una conversación con el de un documento recuperado sin re-prefijar ambos textos, usando `combine()` sobre cachés previamente capturadas.
- Reanudación de sesiones largas: guardar snapshots de estado y recombinarlos al retomar una sesión, aprovechando el soporte de save/load validado en BF16, NF4 y GGUF.
- Pipelines de prompts largos: reducir el coste de prefill combinando contextos ya procesados en lugar de reinyectar el texto completo en cada turno.
- Investigación sobre caché de atención: reproducir los ensayos de coincidencia de token greedy y extender la evaluación a otros dominios (el repo incluye `runtime-validation.json` con los recuentos por ensayo).
- Despliegue en GPU de consumo: usar el backend NF4 o el archivo GGUF Q4_K_M para ejecutar la combinación en hardware limitado.
- Evaluación comparativa de métodos de combinación: contrastar `combine()` frente a prefill nativo en tareas HumanEval/GSM8K, tal como hace la muestra del autor (1/4 en ambos casos).
- Integración en herramientas CLI: automatizar la combinación de estados guardados en scripts de procesamiento por lotes con `latentport combine`.

## Benchmarks y rendimiento

Los únicos datos publicados son pruebas de coincidencia de token greedy y una muestra reducida de tareas. No hay resultados de MMLU, HumanEval completo ni GSM8K completo.

| Prueba | Backend | Resultado |
|---|---|---|
| Coincidencia de siguiente token greedy vs. append nativo | BF16 | 4/4 |
| Coincidencia de siguiente token greedy vs. append nativo | NF4 | 4/4 |
| Coincidencia de siguiente token greedy vs. append nativo | GGUF | 4/4 |
| Snapshot save/load | BF16, NF4, GGUF | superado |
| Completions greedy nativas en muestra HumanEval/GSM8K | GGUF | 4/4 |
| Puntuación de tarea con `combine()` | GGUF | 1/4 |
| Puntuación de tarea con prefill nativo (control) | GGUF | 1/4 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base Qwen3.5-9B y del backend. En NF4 el modelo base cabe presumiblemente en GPUs de consumo de 8-12 GB, pero no se confirma en la información.
- GPU recomendadas: no disponible. La prueba GGUF se realizó con el archivo Q4_K_M de LM Studio, sin especificar GPU.
- GPU de consumo: el backend NF4 y el GGUF Q4_K_M sugieren viabilidad en GPUs de consumo, sin cifras confirmadas.
- Opciones de despliegue: librería `latentport` (pip install "latentport[nf4]>=0.4.9"), runtime nativo LatentPort para GGUF con `model_path` local, y CLI `latentport combine`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de combinación de estados de caché. Como referencia del componente base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LPCombine-Qwen3.5-9B (readout) | 8.392.704 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de combinación de caché | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La operación replica el contexto derecho y verifica los tokens recuperados antes de actualizar la sesión; no es una fusión semántica libre de errores.
- El readout se entrenó con solo 18.432 tokens sintéticos, lo que limita la generalización fuera de las condiciones de ajuste.
- Requiere LatentPort 0.4.9 o superior y que ambos estados de entrada compartan modelo, pesos, tokenizador, backend y política de posiciones.
- GGUF no soporta decodificación cache-only; solo tokens retenidos.
- La evaluación es mínima: 4 ensayos de coincidencia de token y una muestra de HumanEval/GSM8K con puntuación 1/4 tanto en `combine()` como en prefill nativo, por lo que no demuestra superioridad frente al prefill convencional.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El repo no incluye los pesos base; el tamaño de 0.0 GB corresponde solo a los artefactos del readout.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas del modelo base: no disponibles en la información proporcionada.
- Licencia Apache-2.0 para LPCombine, pero los pesos base quedan sujetos a los términos upstream de Qwen, que no se detallan.
- No apto para producción sin una evaluación propia y exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/LPCombine-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión base fijada: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Web del autor: https://latentport.com
- Repositorio fuente: https://github.com/LatentPort/latentport
- PyPI: https://pypi.org/project/latentport/
- Perfil del autor: https://au.linkedin.com/in/simon-villani
- Archivo GGUF de referencia: https://huggingface.co/lmstudio-community/Qwen3.5-9B-GGUF/blob/1379f25c6b505a3fc737bd7818cb09389cf807c1/Qwen3.5-9B-Q4_K_M.gguf
- Validación de runtime: runtime-validation.json (en el repositorio del modelo)
- Pins de perfil y checkpoint: lpcombine.json (en el repositorio del modelo)
