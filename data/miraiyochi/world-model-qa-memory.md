# Miraiyochi/world-model-qa-memory

## Resumen

`Miraiyochi/world-model-qa-memory` es un archivo de investigación publicado en Hugging Face por Miraiyochi (inc.) que recoge los pesos entrenados, configuraciones y artefactos de evaluación de los experimentos de memoria del repositorio privado `world-model-qa`. No se trata de un modelo de lenguaje generativo al uso, sino de una colección de checkpoints procedentes de experimentos sobre modelos del mundo (world models) orientados a tareas de QA y control en entornos de juego, con énfasis en mecanismos de memoria (series m3b, m6, m7, m8, arquitectura híbrida DeltaNet y evaluación MemMimic).

El repositorio se hizo público el 9 de noviembre de 2026 y ocupa 5,2 GB. La mayor parte del peso corresponde al experimento `m7_associative_state_memory` (3,88 GB), seguido de `m8_continuous_dead_end_memory` (0,60 GB), `m3b_video_memory` (0,35 GB) y `m6_multi_cue_capacity` (0,30 GB). Los checkpoints finales documentados con hash SHA-256 son ficheros `.pt` de 18 MB pertenecientes a `hybrid_deltanet_flow_memory`.

Su relevancia es fundamentalmente de archivo reproducible para investigación: el autor indica que el código fuente y los README canónicos de cada experimento viven en el repositorio `world-model-qa` (commit `d295c1282b6551bbdb6f7831ded664133811cbe6`), y que este Hub actúa como espejo de los volúmenes de Runpod. No hay pipeline declarado, ni model card con instrucciones de uso, ni datos de rendimiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los experimentos incluyen una variante híbrida DeltaNet, `hybrid_deltanet_flow_memory`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | `.pt` (checkpoints de PyTorch); el resto de artefactos son configuraciones y resultados de evaluación en formatos no especificados |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura única, sino un conjunto de experimentos. El único con nombre de arquitectura explícito es `hybrid_deltanet_flow_memory`, que sugiere una combinación de capas DeltaNet (atención lineal con estado recurrente) con mecanismos de flujo y memoria externa. Los checkpoints documentados con hash (`checkpoint_gdn_elf_v1_external_residual_g0_visible_seed260822.pt`, `..._g1_return_32_seed260822.pt`, `..._g2_return_128_seed260822.pt`) apuntan a variantes con "residual externo" y distintos horizontes de retorno (32 y 128), probablemente en un contexto de aprendizaje por refuerzo o control predictivo.

El resto de experimentos (m1 a m8, series o0-o9, t0, a2a_s8_official_port, gmp_memmimic_push_cube, hilewm_pusht_reproduction, qantara_pusht_video_idm_reproduction, inverse_actor_l0) cubren líneas de investigación sobre memoria retardada, estrés de memoria, compuertas de decisión de memoria, memoria de vídeo, capacidad de memoria multi-señal, memoria de estado asociativo y memoria continua de callejones sin salida. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO.

## Capacidades

- No es un modelo de propósito general: el repositorio contiene pesos de experimentos de investigación sobre modelos del mundo y memoria, no un asistente conversacional.
- Los experimentos cubren tareas de QA sobre entornos de juego y control (nomenclatura `game-qa`, `MemMimic`, `push_cube`, `pusht`).
- Memoria a largo plazo y asociativa: las series `m3b_video_memory`, `m6_multi_cue_capacity`, `m7_associative_state_memory` y `m8_continuous_dead_end_memory` exploran retención de información en horizontes extendidos.
- Memoria de vídeo: `m3b_video_memory` y `m4_video_memory_scale` abordan el uso de memoria sobre observaciones visuales secuenciales.
- Control cerrado y planificación: las series `o5_closed_loop_control`, `o6_temporal_cem`, `o6i_sticky_cem` y `o9c_hier_demo` apuntan a control predictivo y planificación jerárquica.
- Reproducciones de referencia: `a2a_s8_official_port`, `hilewm_pusht_reproduction` y `qantara_pusht_video_idm_reproduction` replican trabajos previos para comparación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision-language general ni modo "thinking".

## Casos de uso

- Reproducción de experimentos de investigación: los checkpoints y configuraciones permiten replicar los resultados de las series m3b, m6, m7 y m8 partiendo del commit indicado en el repositorio fuente, útil para grupos que estudian memoria en modelos del mundo.
- Estudio de atención lineal y estado recurrente: los checkpoints de `hybrid_deltanet_flow_memory` permiten analizar el comportamiento de DeltaNet con residual externo en horizontes de retorno de 32 y 128 pasos.
- Evaluación comparativa de mecanismos de memoria: los artefactos de `m5_memory_capacity_curve` y `m6_multi_cue_capacity` sirven para medir curvas de capacidad de memoria frente a alternativas.
- Investigación en control predictivo: las series o5-o9 (control en bucle cerrado, CEM temporal, escalado de error) se pueden reutilizar como línea base en tareas de planificación con modelo del mundo.
- Replicación de benchmarks de manipulación robótica: `hilewm_pusht_reproduction` y `qantara_pusht_video_idm_reproduction` permiten contrastar resultados sobre PushT con implementaciones de referencia.
- Auditoría de reproducibilidad: los hashes SHA-256 documentados en el repositorio permiten verificar la integridad de los pesos descargados antes de reutilizarlos en un pipeline de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Los checkpoints documentados individualmente pesan 18 MB, pero el repositorio completo ocupa 5,2 GB y no se especifica el tamaño de los modelos subyacentes.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos aportados; los checkpoints de 18 MB podrían cargarse en cualquier GPU moderna, pero se desconoce el modelo completo asociado.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Los pesos están en formato `.pt` de PyTorch, por lo que requerirían cargarse con el código del repositorio `world-model-qa`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (archivos de investigación sobre modelos del mundo con memoria) ni ofrece métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un archivo de investigación sin pipeline, sin model card de uso y sin instrucciones de inferencia.
- El código fuente necesario para cargar y ejecutar los pesos vive en un repositorio privado (`world-model-qa`); solo se referencia el commit, no se distribuye el código.
- La licencia es `other`, sin texto de licencia visible en la información proporcionada; no se puede asumir uso comercial permitido.
- Idioma declarado únicamente `en`; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación y sesgos: no evaluable sin benchmarks ni documentación de entrenamiento.
- Los checkpoints con optimizador, datasets públicos y cachés latentes regenerables se excluyeron deliberadamente del archivo, por lo que no es posible reanudar el entrenamiento desde estos ficheros.
- Los pesos de UniReps 2026 H3 viven en otro repositorio (`Miraiyochi/hierarchical-latent-subgoals`) y no están duplicados aquí.
- Fecha de creación y actualización (noviembre de 2026) y ausencia de descargas o likes: el artefacto es muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Miraiyochi/world-model-qa-memory
- Repositorio de pesos UniReps 2026 H3: https://huggingface.co/Miraiyochi/hierarchical-latent-subgoals
- Repositorio fuente de código y READMEs de experimentos: `world-model-qa`, commit `d295c1282b6551bbdb6f7831ded664133811cbe6` (no se proporciona URL pública)
- Paper, blog, demo o repositorio adicional: no disponible
