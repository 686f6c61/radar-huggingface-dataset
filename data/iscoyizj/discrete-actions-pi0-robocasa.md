# iscoyizj/discrete-actions-pi0-robocasa

## Resumen

`discrete-actions-pi0-robocasa` es un conjunto de cuatro políticas de visión-lenguaje-acción (VLA) para robótica de manipulación, publicadas por el autor iscoyizj junto al artículo *When Do Discrete Actions Make Good Continuous Controllers?* (arXiv:2610.20429). Las cuatro comparten exactamente el mismo backbone, datos y configuración de entrenamiento; lo único que cambia es la cabeza de acciones: dos discretas (DFlow, DReg) y dos continuas (CFlow, CReg). El objetivo es aislar el efecto de la representación de acciones sobre el rendimiento en control robótico, manteniendo todo lo demás constante.

El modelo parte de `lerobot/pi0_base`, un backbone PaliGemma-3B (SigLIP So400m/14 como codificador visual y Gemma-2B como decodificador) de 2,92B parámetros, al que se añaden entre 367M y 371M parámetros de resampler y cabeza de acciones. Se ha afinado completamente sobre una mezcla de ocho fuentes de datos Franka (RoboCasa365, DROID, LIBERO-plus). El embodiment es `franka_rel_eef_aa_ah1`: brazo Franka únicamente, acciones de efector final con rotación en ángulo-eje.

Es relevante ahora porque ofrece una comparación controlada, con tres semillas por cabeza, sobre RoboCasa365 (50 tareas × 10 ensayos), algo poco habitual en la literatura VLA. Los resultados muestran que las cabezas discretas con flow (DFlow, 53,2%) superan ligeramente a las continuas equivalentes (CFlow, 52,4%), mientras que la regresión de una pasada es claramente inferior (CReg, 40,8%). El repo pesa 52,7 GB e incluye los cuatro checkpoints en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA: PaliGemma-3B (SigLIP So400m/14 + Gemma-2B) con resampler y cabeza de acciones |
| Parametros totales | 2,92B (backbone) + 367M–371M (resampler y cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | instrucción de tarea de hasta 48 tokens; sin contexto de texto largo documentado |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32, el loader castea a bf16) |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto; no se documenta cobertura lingüística) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (fp32, 13,2 GB por checkpoint) + config.json + norm_stats.json |

## Arquitectura y entrenamiento

La arquitectura es un VLA construido sobre PaliGemma-3B: un codificador visual SigLIP So400m/14 que procesa tres imágenes RGB de 224×224 (`robot0_agentview_left`, `robot0_agentview_right`, `robot0_eye_in_hand`), un decodificador Gemma-2B que recibe la instrucción de tarea (hasta 48 tokens) y el estado del robot (7 valores: posición del efector final en metros, rotación ángulo-eje en radianes y apertura del gripper en [0,1]). Sobre el backbone se añade un resampler y una cabeza de acciones de 367M–371M parámetros. El modelo se inicializa desde `lerobot/pi0_base` (revisión `25c379b5…`) y se afina completamente.

La innovación central del trabajo es la comparación de cuatro cabezas sobre el mismo backbone: DFlow (flow discreto sobre 512 bins uniformes por valor de acción), CFlow (flow matching continuo con Euler), DReg (una pasada sobre 512 bins con argmax) y CReg (regresión de una pasada con error cuadrático). La salida es un chunk de 24 acciones × 7 valores (delta de posición, delta de rotación ángulo-eje y gripper), cada fila como delta por paso en el marco base medido desde la pose del efector en ese paso. El entrenamiento usa una mezcla Franka de ocho fuentes (RoboCasa365, DROID, LIBERO-plus) con Adam; los pasos de entrenamiento varían entre 130k y 150k según la cabeza. DFlow consume además las últimas 8 acciones ejecutadas como entrada adicional.

## Capacidades

- Control robótico de manipulación con brazo Franka: genera chunks de 24 acciones de efector final a partir de imágenes e instrucción en lenguaje natural.
- Percepción visual multi-cámara: procesa simultáneamente vista izquierda de agente, vista derecha y cámara en la mano.
- Seguimiento de instrucciones de tarea en texto (hasta 48 tokens).
- Cuatro variantes de decodificación de acciones intercambiables (DFlow, CFlow, DReg, CReg) bajo la misma interfaz.
- Guidance classifier-free configurable mediante `--cfg-scale` (λ = cfg-scale − 1).
- DFlow incorpora memoria de las últimas 8 acciones ejecutadas.
- No soporta tool calling, function calling, agentes multi-paso ni modalidades de audio; no se documentan capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Evaluación comparativa de representaciones de acciones: usar los cuatro checkpoints con el mismo dataset y protocolo para medir el impacto de discretizar versus continuar la acción, aprovechando que comparten backbone y datos.
- Manipulación de objetos en simulación RoboCasa365: ejecutar tareas atómicas y compuestas (por ejemplo `TurnOnSinkFaucet`) con el bucle de rollout de ~100 líneas que sirve de referencia.
- Investigación en flow matching aplicado a robótica: DFlow y CFlow permiten estudiar el efecto del número de pasos de denoising (20 vs 10) y del guidance sobre la tasa de éxito.
- Prototipado de políticas VLA en laboratorio: el servidor de políticas separado del simulador (dos procesos, entornos Python distintos) facilita integrar el modelo en pipelines de evaluación propios.
- Estudio de robustez a generalization: el split `composite_unseen` de RoboCasa365 permite medir transferencia a tareas no vistas en entrenamiento.
- Análisis de fallos por embodiment: útil para cuantificar cuánto limita una política solo-brazo frente a tareas que requieren movimiento de base (~17 de 50 tareas en RoboCasa365).
- Reproducibilidad de resultados académicos: los scripts `run_paper_eval.sh` y los `SHA256SUMS` permiten replicar las cifras publicadas con semillas fijas.

## Benchmarks y rendimiento

RoboCasa365, split `target`: 50 tareas (18 `atomic_seen`, 16 `composite_seen`, 16 `composite_unseen`) × 10 ensayos = 500 episodios por semilla. La política ejecuta las 24 acciones del chunk antes de predecir el siguiente.

| Cabeza | Semilla 1007 | Semilla 2007 | Semilla 3007 | Media ± SD |
|---|---|---|---|---|
| DFlow | 55,2 | 50,4 | 54,0 | 53,2 ± 2,5 |
| CFlow | 54,8 | 50,0 | 52,4 | 52,4 ± 2,4 |
| DReg | 51,6 | 44,8 | 50,4 | 48,9 ± 3,6 |
| CReg | 42,0 | 39,2 | 41,2 | 40,8 ± 1,4 |

Observaciones del autor: la SD es sobre semillas de evaluación de un mismo checkpoint, no sobre ejecuciones de entrenamiento; la semilla 2007 es la más baja para todas las cabezas, por lo que conviene comparar emparejando por semilla. DReg cae al 19,3% con `--cfg-scale 0` (necesita guidance). CFlow guiado necesita pasos suficientes: 0,3% con 2 pasos y 41,9% con 5. En LIBERO, DFlow debe ejecutarse con `--cfg-scale 0`: en `libero_object` obtiene 97% con cfg-scale 0 y 0% con cfg-scale 3.

## Requisitos de hardware

- Pesos en fp32: 13,2 GB por checkpoint; el loader castea a bf16, por lo que la VRAM efectiva de pesos ronda los 6,6 GB en bf16.
- Con overhead de activaciones, resampler y procesamiento de tres imágenes a 224×224, se recomienda al menos 16 GB de VRAM para inferencia en bf16.
- GPU recomendadas: A100, H100 o L40S para evaluación a escala; RTX 4090 (24 GB) es suficiente para un único checkpoint en bf16.
- Cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090); en 16 GB es ajustado y no está documentado.
- Despliegue: el autor proporciona un servidor de políticas propio (`scripts/eval/serve.py`) que corre en un entorno Python separado del simulador (MuJoCo con `MUJOCO_GL=egl`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Descarga completa: 52,7 GB (cuatro checkpoints); un solo checkpoint: 13,2 GB. El tokenizer de PaliGemma es gated y debe descargarse aparte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento RoboCasa365 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| discrete-actions-pi0-robocasa (DFlow) | 2,92B + ~370M | instrucción 48 tokens | 53,2 ± 2,5 | Gemma | Hugging Face |
| discrete-actions-pi0-robocasa (CFlow) | 2,92B + ~370M | instrucción 48 tokens | 52,4 ± 2,4 | Gemma | Hugging Face |
| lerobot/pi0_base | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar entre las cuatro cabezas del propio repo y contra el checkpoint base `lerobot/pi0_base`, del que no se detallan métricas. No se dispone de datos de benchmarks de alternativas como OpenVLA, π0 estándar u otras políticas RoboCasa en esta ficha.

## Limitaciones y advertencias

- Políticas solo de brazo: no pueden ejecutar movimiento de base, lo que afecta a unas 17 de las 50 tareas de RoboCasa365.
- El embodiment está fijado a `franka_rel_eef_aa_ah1`; no se documenta transferencia a otras morfologías.
- Las instrucciones de tarea están limitadas a 48 tokens.
- El guidance no es universal: DReg requiere `--cfg-scale 3` (19,3% sin él) y DFlow en LIBERO se rompe con guidance (0% con cfg-scale 3 en `libero_object`).
- CFlow es muy sensible al número de pasos de denoising (0,3% con 2 pasos frente a 41,9% con 5).
- Los valores de `config.json` no coinciden con los flags de decodificación recomendados; es obligatorio pasar `--cfg-scale` y `--num-denoise-steps` manualmente.
- Licencia Gemma: restricciones de uso comercial según los Gemma Terms of Use; el tokenizer de PaliGemma es gated y requiere aceptar los términos.
- El código (`discrete_actions`) no está publicado todavía ("coming soon"), lo que limita la reproducibilidad completa.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo de acción, el fallo se manifiesta como acciones incorrectas o inseguras, no como texto.
- Cobertura lingüística de las instrucciones: no documentada.
- Repo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iscoyizj/discrete-actions-pi0-robocasa
- Artículo: https://arxiv.org/abs/2610.20429
- Página del proyecto: https://iscoyizj.github.io/discrete-action-website/
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Tokenizer (gated): https://huggingface.co/google/paligemma-3b-pt-224
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Código (`discrete_actions`): próximamente, no disponible en el momento de la consulta
