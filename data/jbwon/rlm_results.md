# jbwon/rlm_results

## Resumen

`jbwon/rlm_results` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos de investigación publicado en Hugging Face bajo el identificador `jbwon/rlm_results`. Contiene resultados experimentales de un estudio sobre mecanismos de razonamiento en modelos de la familia Qwen3-8B, organizados por tipo de resultado: probes lineales (hidden y TF-IDF), análisis de Fisher, métricas de evaluación de probes, análisis de flip ratio, resultados de benchmarks de razonamiento y checkpoints de métodos de ajuste como STAR-1, RAPO, ThinkSafe y RECAP.

El repositorio está estructurado en torno a cinco variantes de modelo (`qwen3`, `star1`, `rapo`, `thinksafe`, `recap`), todas ellas derivadas de Qwen3-8B, y organiza los artefactos en directorios temáticos (`probes/`, `analysis/`, `reasoning/`, `baseline/`, `runs/`, `reports/`, `launches/`, `datasets/`). La model card está redactada en coreano y describe la disposición de rutas, la compatibilidad con rutas heredadas y el estado de integridad de algunos ficheros.

Es relevante para investigadores que trabajen en interpretabilidad de modelos de razonamiento, análisis de tokens de pensamiento (think token) y evaluación de técnicas de alineación orientadas a seguridad (refusal, think/no-think). No debe confundirse con un checkpoint desplegable: no se documenta ningún pipeline de inferencia ni pesos de modelo utilizables directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene artefactos de análisis sobre Qwen3-8B, no un modelo propio) |
| Parámetros totales | no disponible como modelo; los experimentos se realizan sobre Qwen3-8B |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene probes, JSON, CSV, checkpoints de entrenamiento en rutas internas; tamaño total 0,2 GB) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia. Los experimentos se apoyan en Qwen3-8B como modelo base, sobre el que se aplican distintas técnicas de ajuste: STAR-1 (SFT, checkpoint en `baseline/star1/Qwen3-8B/qwen3_8b_20261028_0226/seed2002/sft/final`), RAPO (RL, seed42), ThinkSafe (SFT, seed42) y RECAP (RL, ejecución `jbw_recap_qwen3_8b_4gpu_20261029_015152`, seed421). La model card menciona además experimentos de steering en curso (Job 1184347, 2 nodos y 8 GPUs) y análisis de flip ratio sobre comportamiento think/no-think.

El núcleo técnico del repositorio son los probes de interpretabilidad: probes ocultos (hidden probes) extraídos en posiciones `prompt_end`, `reasoning_start`, `prefill` y `thinking`, y probes de texto basados en TF-IDF (carpetas `tfidf_*`). Se documenta análisis de Fisher sobre las representaciones y evaluación out-of-fold (OOF) de los probes. La ruta común de probes es `probes/<model>/think_token/Qwen3-8B/seed42_k1/default/refusal/`. No se especifican volúmenes de tokens de entrenamiento, composición del dataset ni detalles de RLHF/DPO más allá de las etiquetas SFT y RL de cada método.

## Capacidades

- Almacenamiento y trazabilidad de probes lineales (hidden y TF-IDF) para análisis de refusal y tokens de pensamiento sobre Qwen3-8B.
- Análisis de Fisher sobre representaciones internas para cada variante (qwen3, star1, rapo, thinksafe, recap).
- Evaluación de probes con métricas OOF en `analysis/probe_metrics/`.
- Análisis de flip ratio para estudiar transiciones think/no-think, ASR/ORR y comportamiento de refusal.
- Resultados de benchmarks de razonamiento (AIME24, MATH500, HumanEval+, GPQA Main de 448 preguntas) en `reasoning/qwen3_8b_20261030_0139/`.
- Checkpoints finales de los métodos STAR-1, RAPO, ThinkSafe y RECAP sobre Qwen3-8B.
- Registro de ejecuciones (configuraciones, logs de Slurm, historial de reinicios) en `launches/`.
- Compatibilidad con rutas heredadas mediante enlaces y variable `RESULT_LAYOUT=legacy`.

## Casos de uso

- Investigación en interpretabilidad: extraer y comparar probes ocultos en distintas posiciones del token de pensamiento para estudiar cómo se codifica la decisión de rechazo (refusal) en Qwen3-8B y en sus variantes ajustadas.
- Análisis de seguridad y alineación: usar los datos de flip ratio y ASR/ORR para evaluar si métodos como ThinkSafe o RECAP reducen respuestas dañinas sin degradar el razonamiento.
- Reproducción de experimentos de razonamiento: los resultados de AIME24, MATH500, HumanEval+ y GPQA Main permiten contrastar el efecto de STAR-1, RAPO, ThinkSafe y RECAP sobre el rendimiento del modelo base.
- Auditoría de integridad de artefactos: el repositorio incluye `RESULT_LAYOUT.json`, `plan.json` y `validation.json` con comparación de SHA256 antes y después de mover ficheros, útil como plantilla de trazabilidad en proyectos de investigación reproducibles.
- Estudio de dinámicas think/no-think: los datos de `analysis/flip_ratio/` permiten analizar cuándo un modelo cambia entre modo de razonamiento y respuesta directa.
- Reutilización de probes TF-IDF: los bundles de TF-IDF disponibles para `qwen3` y `recap` pueden servir como línea base textual frente a probes ocultos en tareas de clasificación de refusal.
- Plantilla de organización de resultados: la estructura por categorías y el soporte de rutas heredadas sirven de referencia para equipos que gestionan grandes volúmenes de artefactos experimentales en clústeres Slurm.

## Benchmarks y rendimiento

El repositorio incluye resultados de evaluación en `reasoning/qwen3_8b_20261030_0139/` (ficheros `summary.json` y `summary.csv`) para AIME24, MATH500, HumanEval+ y GPQA Main (448 preguntas). Sin embargo, los valores numéricos no están incluidos en la información proporcionada, por lo que no se presentan cifras.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio en sí ocupa 0,2 GB y no requiere GPU para su consulta; se puede clonar y explorar en cualquier equipo.
- Para reproducir los experimentos sobre Qwen3-8B se necesita hardware capaz de ejecutar un modelo de 8 000 millones de parámetros; la model card menciona ejecuciones en 2 nodos con 8 GPUs y una ejecución de RECAP en 4 GPUs, pero no detalla el modelo de GPU.
- VRAM estimada para inferencia de Qwen3-8B: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este repositorio, que no publica pesos desplegables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable con alternativas de su categoría; es un conjunto de artefactos de investigación sobre Qwen3-8B. Como referencia del modelo base subyacente:

| Aspecto | jbwon/rlm_results | Qwen3-8B (modelo base) |
|---|---|---|
| Tipo | Repositorio de resultados y probes | Modelo de lenguaje |
| Parámetros | no aplica | 8 000 millones |
| Contexto | no disponible | no disponible en esta ficha |
| Licencia | no disponible | no disponible en esta ficha |
| Pesos desplegables | no | sí (no incluidos aquí) |

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos en formato safetensors o GGUF utilizables directamente para inferencia.
- La licencia no está especificada, lo que impide determinar si el uso comercial es posible; debe consultarse al autor antes de cualquier reutilización.
- La model card advierte de ficheros corruptos o vacíos: `thinking/probe.json` del Qwen3 original, algunos pesos de thinking y `tfidf_reasoning_start` tienen 0 bytes y requieren restauración.
- Los bundles TF-IDF de STAR-1, RAPO y ThinkSafe no están en el repositorio y no deben asumirse como generados.
- Las rutas heredadas (`post_recap`, `main`, `jbw-rlm-*`) se mantienen solo por compatibilidad e historial; no deben usarse como destino de nuevos experimentos.
- La evaluación de GPQA corresponde a Main (448 preguntas) y no a Diamond; los resultados no son directamente comparables con los publicados en Diamond.
- La documentación está en coreano, lo que puede dificultar la incorporación de colaboradores no familiarizados con el idioma.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo subyacente en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jbwon/rlm_results
- Índice de informes: `REPORTS.md` (dentro del repositorio)
- Estado de rutas y probes: `RESULT_LAYOUT.json` (dentro del repositorio)
- Plan de migración: `launches/result_layout_20261030/plan.json`
- Registro de validación: `launches/result_layout_20261030/validation.json`
- Experimento de steering en curso: `launches/jongbokwon_20261030_2009/README.md`
- Resultados de razonamiento: `reasoning/qwen3_8b_20261030_0139/summary.json` y `summary.csv`
