# larsboschrng/TIDE_planner_heads

## Resumen

TIDE_planner_heads es un repositorio de pesos de componentes de planificacion (planner heads) desarrollado por larsboschrng en el marco del proyecto TIDE. No se trata de un modelo generativo autonomo, sino de un conjunto de cabezas de planificacion entrenadas sobre las caracteristicas congeladas de un modelo de video de conduccion autonomo (`larsboschrng/TIDE_wan_pretrain`, basado en Wan2.1-T2V-1.3B). El repositorio agrupa los pesos de 84 ejecuciones de entrenamiento y 167 checkpoints, con un total aproximado de 16 GiB.

El proposito del modelo es transformar las representaciones internas de un modelo de video en trayectorias de ego-vehiculo: 8 puntos de paso (waypoints) con intervalos de 0,5 segundos, expresados en el sistema de referencia del propio vehiculo (x, y, heading). Esto lo situa en el ambito de la planificacion end-to-end para conduccion autonoma, concretamente en el benchmark NAVSIM v1, donde las ejecuciones principales reportan un PDMS de hasta 90,08 en navtest.

La relevancia actual del repositorio es de caracter experimental y de investigacion: documenta una curva de escalado de planners sobre caracteristicas de video, preentrenamiento sobre trayectorias pseudoetiquetadas extraidas de videos de conduccion web, y variantes con muestras de recuperacion. No obstante, el codigo que construye, entrena y ejecuta estos modulos (el paquete Python `tide`) no esta incluido en el repositorio, lo que limita su uso directo sin acceso a dicho paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de planificacion (IntentPredictor, ActionExpert, readout) sobre caracteristicas congeladas de un modelo de video transformer (Wan2.1-T2V-1.3B adaptado) |
| Parametros totales | no disponible (depende de la ejecucion; los pesos se almacenan como state_dicts por modulo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico; procesa video de conduccion) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (torch state_dicts con `weights_only=True`), `.npz` para anclas de trayectoria, `.json` para configuracion y manifiestos |

## Arquitectura y entrenamiento

La arquitectura se compone de modulos de planificacion que consumen caracteristicas de un modelo de video congelado. El modulo principal es `ip` (`tide.heads.IntentPredictor`), que actua como planner y almacena internamente anclas de trayectoria (obtenidas por k-means sobre las trayectorias expertas de NAVSIM navtrain, con k=128 y k=512). Otros modulos son `ae` (`tide.heads.ActionExpert`), `readout` y `vge_top` (capas superiores del modelo de video descongeladas para experimentos). Las ejecuciones `ip_*` usan exclusivamente trayectorias expertas de conduccion; las `ae_*` son ejecuciones de analisis supervisadas con subpuntuaciones del simulador (PDM) y no forman parte del metodo principal.

El entrenamiento se organiza en familias de ejecuciones: `ae_*` (36), `ip_*` (46), `joint_*` (1) y `readout_*` (1). La ejecucion `ip_S1a_cont2` entrena el planner desde cero durante 36k pasos en tres tramos de 12k. La ejecucion `ip_pre_ovo24k_ft` preentrena 24k pasos sobre trayectorias pseudoetiquetadas de videos de conduccion web y despues hace fine-tuning de 12k pasos. Existen variantes con muestras de recuperacion (`ip_pre24_rec`, `ip_rec_prior_v1/v2`) y una curva de escalado (`ip_wan`, `ip_S6`...`ip_S0`) sobre caracteristicas de distintas instantaneas del modelo de video. No se documentan detalles sobre RLHF, DPO ni composicion exacta del dataset de entrenamiento mas alla de las trayectorias expertas de NAVSIM y las pseudoetiquetas web.

## Capacidades

- Prediccion de trayectorias de ego-vehiculo: genera 8 waypoints a intervalos de 0,5 s en el sistema de referencia del vehiculo (x, y, heading).
- Planificacion end-to-end sobre caracteristicas de video: consume las representaciones de un modelo de video congelado (Wan2.1-T2V-1.3B adaptado) sin necesidad de reentrenar dicho modelo.
- Preentrenamiento sobre datos web: las variantes `ip_pre_ovo24k_ft` aprovechan trayectorias pseudoetiquetadas extraidas de videos de conduccion de internet.
- Entrenamiento incremental: los checkpoints se pueden reutilizar como inicializacion mediante las opciones `--init_ip` / `--ip_ckpt` de `tide.train_planner`.
- Analisis con subpuntuaciones de simulador: los modulos `ae` permiten supervisar con subpuntuaciones PDM.
- Evaluacion en NAVSIM v1: integracion con el scorer PDM para obtener PDMS en navtest y navhard.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo linguistico.

## Casos de uso

- Investigacion en planificacion end-to-end para conduccion autonoma: el repositorio permite reproducir y comparar planners entrenados sobre caracteristicas de video congeladas, usando los checkpoints `ip_*` como punto de partida para experimentos propios.
- Evaluacion comparativa en NAVSIM v1: las ejecuciones principales reportan PDMS en navtest (12.146 escenas, camara frontal unica, top-1 del planner, sin scorer ni senal de simulador), lo que facilita la comparacion con otros metodos del benchmark.
- Estudio de la curva de escalado del modelo de video: las ejecuciones `ip_wan`, `ip_S6`...`ip_S0` permiten analizar como afecta el tamano y el numero de ventanas de entrenamiento del modelo de video al rendimiento del planner (79,62 para Wan sin adaptar frente a 87,03 para la instantanea de 8,19M ventanas).
- Preentrenamiento con datos web: la variante `ip_pre_ovo24k_ft` sirve como referencia para estudiar el impacto de pseudoetiquetas de videos de conduccion en el rendimiento final (89,95 frente a 89,55 de la version desde cero).
- Analisis de muestras de recuperacion: las ejecuciones `ip_pre24_rec` e `ip_rec_prior_v1/v2` permiten estudiar el efecto de anadir muestras de recuperacion generadas por el modelo de video, con resultados en navhard (EPDMS de dos etapas 34,94 frente a 29,95).
- Reentrenamiento y fine-tuning sobre nuevos datos: los checkpoints se pueden cargar con `tide.train_planner` para adaptar el planner a dominios o datasets distintos, siempre que se disponga del paquete `tide` y de los latentes VAE de las imagenes.

## Benchmarks y rendimiento

Los resultados son de una sola semilla, extraidos del registro del proyecto y presentados como comprobaciones de sanidad para una reejecucion. La metrica es PDMS de NAVSIM v1 en navtest (12.146 escenas, camara frontal unica, top-1 del planner, sin scorer ni senal de simulador).

| Ejecucion | Checkpoint final | Descripcion | Modelo de video | PDMS navtest |
|---|---|---|---|---|
| `ip_S1a_cont2` | `step_0012000` | Planner desde cero, 36k pasos (12k + 12k + 12k) | `adapted/from_steps_032000` | 89,55 |
| `ip_pre_ovo24k_ft` | `step_0012000` | Preentrenado 24k pasos en pseudo-trayectorias web + fine-tuning 12k | `adapted/from_steps_032000` | 89,95 |
| `ip_pre24_ctrl` | `step_0004000` | 4k pasos adicionales solo con datos reales | `adapted/from_steps_032000` | 89,98 |
| `ip_pre24_rec` | `step_0004000` | 4k pasos adicionales con 30% de muestras de recuperacion | `adapted/from_steps_032000` | 89,73 |
| `ip_scl_S0_pre` / `ip_scl_S0_ft` | `step_0024000` / `step_0012000` | Preentrenamiento y fine-tuning con el modelo de video mayor (8,19M ventanas) | `adapted/from_steps_064000` | 90,08 |
| `ip_wan` | `step_0012000` | Planner de 12k pasos sobre caracteristicas de Wan sin modificar | `from_base_wan` | 79,62 |
| `ip_S0` (instantanea 8,19M ventanas) | `step_0012000` | Planner de 12k pasos sobre instantanea del modelo de video | `steps_NNNNNN` | 87,03 |
| `ip_wana` | `step_0012000` | Planner de 12k pasos sobre caracteristicas adaptadas de Wan | `adapted/...` | 85,04 |
| `ip_S1a` | `step_0012000` | Planner de 12k pasos sobre caracteristicas adaptadas de la instantanea `S1a` | `adapted/...` | 87,50 |

En navhard, la ejecucion `ip_pre24_rec` reporta un EPDMS de dos etapas de 34,94 frente a 29,95 de la variante sin muestras de recuperacion. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) porque el modelo no es linguistico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 17,1 GB y el modelo de video base (Wan2.1-T2V-1.3B) requiere VRAM adicional para cargar sus pesos y procesar latentes VAE.
- GPU recomendadas: no especificadas por el autor; el entorno de referencia usa torch 2.9.1 con compilacion CUDA 13.0, lo que sugiere GPUs NVIDIA modernas (A100, H100 o RTX 4090) para ejecutar el modelo de video y el planner.
- Cabe en GPU de consumo: no confirmado; el modelo de video de 1.3B parametros y los latentes VAE de las imagenes de NAVSIM pueden requerir mas de 24 GB de VRAM en funcion de la configuracion.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; la inferencia se realiza mediante `python -m tide.infer_planner` del paquete `tide`, con dependencias torch, diffusers 0.35.2 y transformers 4.51.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TIDE_planner_heads | no disponible (cabezas sobre Wan2.1-T2V-1.3B) | no disponible | PDMS navtest hasta 90,08 | no disponible | Pesos en Hugging Face; codigo `tide` no incluido |
| Otros planners de NAVSIM v1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El paquete Python `tide`, necesario para construir, entrenar y ejecutar los modulos, no esta incluido en el repositorio; sin el, los pesos no son directamente utilizables.
- Los datos de NAVSIM (indice y latentes VAE de las imagenes) no se incluyen y deben generarse con los scripts de datos de `tide` (`tide.encode_latents` y los constructores de indice).
- Los resultados son de una sola semilla y se presentan como comprobaciones de sanidad para una reejecucion, no como resultados definitivos.
- Un checkpoint de las ejecuciones originales (en `ip_scl_S3_ft`) no pudo leerse; el autor lo documenta como incidencia.
- Las ejecuciones `ae_*` no forman parte del metodo principal y usan subpuntuaciones del simulador como supervision.
- No se especifica licencia, lo que impide determinar las restricciones de uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma porque el modelo no es linguistico; su ambito es la prediccion de trayectorias de conduccion.
- El rendimiento esta ligado al modelo de video concreto indicado en el campo `video_model` de cada `run_config.json`; usar otro modelo de video invalida los resultados reportados.
- No se dispone de informacion sobre latencia, throughput ni requisitos exactos de VRAM para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/larsboschrng/TIDE_planner_heads
- Modelo de video asociado: https://huggingface.co/larsboschrng/TIDE_wan_pretrain
- Modelo base Wan2.1-T2V-1.3B-Diffusers: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
