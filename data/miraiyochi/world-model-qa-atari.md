# Miraiyochi/world-model-qa-atari

## Resumen

`world-model-qa-atari` no es un modelo de lenguaje generativo al uso, sino un archivo de investigación publicado en Hugging Face por el usuario Miraiyochi. Contiene pesos entrenados, configuraciones y artefactos de evaluación de una serie de experimentos sobre el juego Atari H.E.R.O., denominados series F (F1-F8x) y S (S1-S6), dentro de un repositorio privado llamado `world-model-qa`. El propósito declarado es la preservación reproducible de experimentos sobre modelos del mundo (*world models*) aplicados a entornos de juego.

El repositorio ocupa 60,5 GB y se organiza en dos grandes carpetas: `wm-diamond_experiments/` (configuraciones y ficheros pequeños) y `wm-diamond_results/` (resultados, latentes y checkpoints de mayor tamaño). Los experimentos cubren variantes de codificación visual (DINOv3), transformers, contextos de 32 pasos, escalado, fusión multimodal, horizontes, rollouts latentes, jerarquías y memoria lenta, entre otras. No se trata de un modelo listo para inferencia general, sino de un volcado de artefactos de investigación.

La relevancia es acotada: sirve como referencia para quienes investigan modelos del mundo en videojuegos y quieran inspeccionar configuraciones, checkpoints y decisiones de diseño de una familia de experimentos concreta. No hay pipeline declarado, no hay model card con instrucciones de uso y la licencia es "other" sin detallar términos, lo que limita su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (familia de experimentos con variantes: codificadores DINOv3, transformers, modelos jerárquicos y de memoria; no se especifica una arquitectura única) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (se menciona un experimento `atari_f3c_context32_hero`, pero sin detallar la unidad ni el contexto máximo del modelo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (términos no especificados en la información disponible) |
| Formato de pesos | No disponible (se citan ficheros `.pt` de PyTorch y manifiestos JSON; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura única, sino una colección de experimentos. Los nombres de las carpetas sugieren varias líneas: `atari_f1_offline_flat` (posible enfoque offline plano), `atari_f2_a2a_fm_hero` (con un codificador de features), `atari_f3a_dinov3_hero` y `atari_f3d_dinov3_transformer_hero` (codificador visual DINOv3, en el segundo caso combinado con transformer), `atari_f3b_transformer_hero`, `atari_f3c_context32_hero` (contexto de 32), `atari_f4_scale10_hero` (escalado), `atari_f5_fusion_ab_hero` (fusión), `atari_f6_horizon_xy_hero` (horizonte), `atari_f7_latent_rollout_hero` (rollout latente), `atari_f8_hierarchy_hero` y `atari_f8x_anchor_xattn_hero` (jerarquía con cross-attention), y las series S (`s1_scale`, `s2_repetition`, `s3_slow_memory`, `s4_frozen_l2_fused`, `s5_rollout_clock`, `s5b_rollout_clock_fm`, `s6_keyframe_hier`). Todo apunta a investigación sobre modelos del mundo y planificación latente en Atari H.E.R.O.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detallan innovaciones técnicas más allá de lo que sugieren los nombres de los experimentos (rollout latente, memoria lenta, jerarquía con keyframes, reloj de rollout). Se menciona que los pesos de UniReps 2026 H3 viven en otro repositorio público (`Miraiyochi/hierarchical-latent-subgoals`) y que no se duplican aquí. Los ficheros se movieron desde volúmenes de Runpod y se verificaron con SHA-256 contra los hashes LFS del Hub.

## Capacidades

- Archivo de pesos y configuraciones para reproducir experimentos de modelos del mundo sobre Atari H.E.R.O.
- Preservación de checkpoints finales y artefactos de evaluación de las series F y S.
- Verificación de integridad mediante `SHA256SUMS.volume` y hashes LFS.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo más allá del inglés declarado.
- No se declara soporte de *thinking mode*, audio ni otras capacidades especiales.
- El uso previsto es investigación y auditoría de experimentos, no inferencia lista para producción.

## Casos de uso

- Reproducción de experimentos: descargar los checkpoints y configuraciones de una carpeta concreta (por ejemplo, `wm-diamond_experiments/atari_f8_hierarchy_hero/`) y ejecutarlos con el código del repositorio `world-model-qa` en el commit indicado para replicar resultados.
- Auditoría de integridad: verificar los ficheros descargados contra `SHA256SUMS.volume` y los hashes LFS para asegurar que los pesos no se han corrompido durante la transferencia desde Runpod.
- Estudio de decisiones de diseño: comparar las configuraciones de las variantes F3a, F3b, F3c y F3d para entender el impacto del codificador visual (DINOv3), del transformer y de la longitud de contexto en el rendimiento sobre H.E.R.O.
- Investigación en modelos del mundo: reutilizar los latentes y manifiestos (`latents_manifest`) de `atari_f3a_dinov3_hero` como base para nuevos experimentos de planificación latente.
- Análisis de jerarquía y memoria: inspeccionar los artefactos de `atari_f8_hierarchy_hero` y `atari_s3_slow_memory_hero` para estudiar mecanismos de subobjetivos y memoria de largo plazo en entornos de juego.
- Docencia y divulgación: usar los ficheros pequeños de `wm-diamond_experiments/` como material de ejemplo en cursos sobre modelos del mundo y aprendizaje por refuerzo en videojuegos.
- Comparación entre volúmenes: analizar las diferencias documentadas entre las copias de EUR-IS-3 y EUR-NO-2 (por ejemplo, `atari_f2_a2a_fm_hero/Hero/progress`) para entender la evolución de los datos entre fases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 60,5 GB, pero no se indica el tamaño de un checkpoint individual ni su huella en memoria.
- GPU recomendadas: no disponible. No se especifican requisitos de cómputo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; los ficheros citados son `.pt` de PyTorch y requieren el código del repositorio `world-model-qa`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos del mundo para Atari) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento general ni tool calling.
- La licencia es `other` y no se detallan sus términos; no se puede asumir uso comercial sin consultar al autor.
- El repositorio es un archivo de investigación sin pipeline declarado ni instrucciones de uso; la model card remite al repositorio privado `world-model-qa` (commit `fef0deeaf2179d273392d1def10341301e39a6f9`) para el código y los READMEs canónicos.
- Excluye a propósito checkpoints intermedios con optimizador, datasets públicos, cachés latentes regenerables y entornos de Python, por lo que no es autocontenido para reentrenar.
- Se documentan discrepancias entre los dos volúmenes de origen en dos ficheros (`atari_f2_a2a_fm_hero/Hero/progress` y `atari_f3a_dinov3_hero/Hero/latents_manifest`), lo que puede afectar a la reproducibilidad exacta.
- Idioma declarado únicamente inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de un LLM, pero al ser artefactos de investigación sin evaluación pública, no hay garantías de calidad ni de generalización.
- No hay datos de benchmarks ni de rendimiento, por lo que no se puede evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Miraiyochi/world-model-qa-atari
- Repositorio relacionado con pesos UniReps 2026 H3: https://huggingface.co/Miraiyochi/hierarchical-latent-subgoals
- Repositorio de código y READMEs de experimentos: `world-model-qa` (privado), commit `fef0deeaf2179d273392d1def10341301e39a6f9`; no se dispone de URL pública en la información proporcionada.
