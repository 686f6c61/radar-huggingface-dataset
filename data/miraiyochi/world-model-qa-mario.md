# Miraiyochi/world-model-qa-mario

## Resumen

`world-model-qa-mario` es un archivo de investigación publicado por Miraiyochi que recoge pesos entrenados, configuraciones y artefactos de evaluación de los experimentos con Mario (series DIAMOND w-series y o-series, y el escalado por niveles MAF m3) del repositorio privado `world-model-qa`. No es un modelo de lenguaje generativo al uso, sino un conjunto de checkpoints de modelos del mundo (world models) orientados a la simulación y predicción de dinámicas de juego, junto con scripts de ranking, control en bucle cerrado y diagnósticos temporales.

El repositorio ocupa 17,5 GB e incluye checkpoints finales y EMA en formato PyTorch (`.pt`), además de artefactos de evaluación de menor tamaño. El checkpoint principal de mayor tamaño (`checkpoint_030000.pt`) pesa 2609 MB y su versión EMA 704 MB, con variantes para distintos volúmenes de niveles (500, 1500, 4000, 7201). El código fuente y los README canónicos de cada experimento residen en el repositorio privado `world-model-qa`, en el commit `5fbb2cbdc97f16c3229c45e951802745fe6fdaee`, por lo que este Hub actúa únicamente como archivo de pesos y artefactos.

Su relevancia es acotada: se trata de un archivo de investigación publicado el 2026-11-09, sin descargas ni likes, con licencia `other` y sin model card estándar de uso. Resulta útil para reproducir o auditar los experimentos de world modeling sobre Super Mario, pero no está pensado como modelo listo para producción ni para inferencia genérica de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world model; checkpoints PyTorch de las series DIAMOND y MAF/V-JEPA, sin detalle arquitectónico en la información) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | en (inglés, según tag de idioma) |
| Licencia | other |
| Formato de pesos | PyTorch `.pt` (checkpoints finales y EMA); artefactos auxiliares en `.tgz`, `.md`, configs |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los modelos. Los nombres de los experimentos apuntan a varias familias: `wm-diamond` (series w1–w8, presumiblemente basadas en DIAMOND, un world model para entornos de juego), `mario_maf_m3_vjepa_level_scaling` (escalado por niveles con representaciones V-JEPA y un códec `codec_ema_m2_chunk8.pt` de 103 MB), y las series `o0`–`o9` centradas en ranking de modelos, separación causal, horizonte de predictor, abstracción temporal, control en bucle cerrado, CEM temporal y escalado de errores. También hay experimentos `hilewm_o10` (issue gate y terminal escalation).

El entrenamiento se realizó sobre el corpus Mario M1, M1b de juego humano y latentes M2 DINOv3, que no están en este repositorio sino en el dataset público `Miraiyochi/world-model-qa-mario-data`. Los checkpoints principales corresponden al paso 30000 en cinco configuraciones de escalado de niveles (500, 1500, 4000, 7201 y 7201_winonly). No se especifican en la información el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Modelado del mundo en entornos de juego (Super Mario): predicción de dinámicas y estados futuros a partir de observaciones, según la naturaleza de los experimentos archivados.
- Soporte de representaciones latentes tipo V-JEPA y códecs de compresión de latentes (`codec_ema_m2_chunk8.pt`).
- Control en bucle cerrado y planificación con CEM temporal (experimentos `o5_closed_loop_control`, `o6_temporal_cem`, `o6i_sticky_cem`).
- Diagnósticos de habilidades concretas, como dash y salto (`o6_dash_jump_diagnostic`).
- Ranking y comparación de modelos (`o1_model_ranking`, `o0_oracle_ranking`).
- Evaluación de horizonte de predictor y abstracción temporal (`o3_predictor_horizon`, `o4_temporal_abstraction`).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes multilingües ni modo thinking.

## Casos de uso

- Reproducción de experimentos de world modeling: los checkpoints del paso 30000 permiten reproducir los resultados de escalado por niveles (500, 1500, 4000, 7201) descritos en los README del repositorio privado, útil para investigación académica en modelado de entornos.
- Auditoría de artefactos de investigación: los ficheros `SHA256SUMS.volume` y los hashes SHA-256 permiten verificar la integridad de los pesos transferidos desde volúmenes Runpod, adecuado para equipos que necesiten validar la cadena de custodia de los datos.
- Estudio de planificación con CEM temporal: los experimentos `o6_temporal_cem` y `o6i_sticky_cem` sirven como base para investigar control predictivo en entornos de juego con horizonte limitado.
- Análisis de abstracción temporal y horizonte de predictor: los artefactos de `o3_predictor_horizon` y `o4_temporal_abstraction` permiten estudiar cómo decae la calidad de predicción según el horizonte, un problema central en world models.
- Investigación en representaciones latentes: el códec `codec_ema_m2_chunk8.pt` y los latentes V-JEPA del experimento m3 permiten experimentar con compresión y reconstrucción de estados latentes en entornos de juego.
- Diagnóstico de habilidades y escalado de errores: los experimentos `o6_dash_jump_diagnostic` y `o8e_error_escalation` son útiles para estudiar cómo se degradan las políticas ante errores acumulados en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de tamaño, el checkpoint principal pesa 2609 MB (unos 2,6 GB en disco) y la versión EMA 704 MB; la VRAM necesaria dependerá de la arquitectura, que no se documenta.
- GPU recomendadas: no disponible. El tamaño de los checkpoints sugiere que podrían caber en GPUs de consumo con suficiente memoria (por ejemplo, RTX 3090 o RTX 4090 con 24 GB), pero no hay confirmación en la información.
- Cabe en consumer GPU: probable por tamaño de pesos, pero no confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos son `.pt` de PyTorch y requieren el código del repositorio privado `world-model-qa` para su carga.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `world-model-qa-mario` (este) | no disponible | no disponible | sin benchmarks publicados | other | pesos `.pt` en HF, código en repo privado |
| DIAMOND (referencia) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| V-JEPA (referencia) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse para generación de texto o código.
- El código fuente y los README canónicos están en un repositorio privado (`world-model-qa`), por lo que sin acceso a él la reproducibilidad es limitada.
- Licencia `other`: no se especifican términos de uso comercial; hay que consultar al autor antes de cualquier uso en producción.
- Idioma declarado únicamente `en`; no hay soporte multilingüe documentado.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Checkpoints de investigación sin garantías de estabilidad ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- Algunos artefactos (por ejemplo, los pesos de escalado plano M2 del volumen fhkh85lzmf) fueron excluidos deliberadamente por decisión del PI, lo que limita la cobertura del archivo.
- Los pesos están en formato `.pt` sin versiones GGUF ni cuantizadas, lo que complica el despliegue en entornos de inferencia estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Miraiyochi/world-model-qa-mario
- Dataset asociado: https://huggingface.co/datasets/Miraiyochi/world-model-qa-mario-data
- Pesos UniReps 2026 H3: https://huggingface.co/Miraiyochi/hierarchical-latent-subgoals
- Repositorio de código `world-model-qa`: privado, commit `5fbb2cbdc97f16c3229c45e951802745fe6fdaee` (no accesible públicamente)
