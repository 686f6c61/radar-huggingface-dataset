# mardex11/wam-pick-lmh-10k

## Resumen

wam-pick-lmh-10k es un modelo world-action (WAM, *world-action model*) de 0,8 mil millones de parámetros desarrollado por el usuario mardex11 y publicado bajo licencia Apache 2.0. Se trata de un modelo de robótica orientado a políticas de manipulación (pipeline `robotics`) que combina la predicción del estado visual futuro con la generación de acciones motoras, dentro del marco del proyecto SimToolReal (`purdue-mars/SimToolReal-mars`, rama `data-vla-pick-isaac-render`). El modelo se ha entrenado desde cero en el clúster Purdue Anvil para la tarea concreta de *pick* (agarre de objetos) sobre el conjunto de datos `pick_lmh_10k`.

El interés del modelo es fundamentalmente de investigación: es un artefacto reproducible de un pipeline de entrenamiento de políticas visomotoras con caché de latentes de vídeo (VAE de Wan 2.2) y características de texto SigLIP. No es un modelo de lenguaje general ni un asistente conversacional; su ámbito es la robótica simulada y, potencialmente, la transferencia a entornos reales mediante políticas entrenadas en simulación.

La relevancia actual radica en la línea de trabajo de *world models* aplicados a control robótico, donde el modelo aprende simultáneamente a predecir la evolución visual y las acciones, lo que puede mejorar la generalización y la estabilidad de la política. El repositorio ocupa 3,2 GB e incluye el checkpoint, la configuración, las métricas de entrenamiento y un helper de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model (WAM) sobre backbone transformer; no se detalla la topologia interna |
| Parametros totales | 0,8B (aproximadamente 800 millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; el texto se procesa con SigLIP) |
| Licencia | Apache 2.0 |
| Formato de pesos | `ckpt.pt` (PyTorch, incluye modelo, cfg y metadatos de normalizacion); `config.json`; `metrics.jsonl`; `wam_policy.py` |

## Arquitectura y entrenamiento

El modelo es un *world-action model* de 0,8B parámetros entrenado desde cero. La arquitectura combina un componente de predicción visual (world model) con un cabezal de política que emite acciones en radianes, condicionado por características de texto extraídas con SigLIP y por latentes de vídeo del VAE de Wan 2.2 a resolución 320x192. El entrenamiento utiliza caché de latentes en modo ventana (`--mode window --stride 8`), con un 5 % de cada fragmento reservado como validación.

El entrenamiento se ejecutó en Purdue Anvil con una única GPU A100 de 40 GB, *activation checkpointing*, preset `base`, batch global de 16, tasa de aprendizaje 1e-4 con *warmup* de 1000 pasos y decaimiento coseno hasta 25 800 pasos (donde se detuvo), semilla 0 y `lambda_v` de 1.0. Los datos provienen de 15 fragmentos de caché construidos a partir de dos conjuntos de Hugging Face (`mardex11/simtoolreal-pick-lmh-10k` y `mardex11/simtoolreal-pick-wam-15k`), sumando 10 000 episodios. La evaluación final reporta MAE de acción de 0,0816 rad, MAE de acción en el último paso de 0,1163 rad, MAE de *hold* de 0,1732 rad, MSE de vídeo de 0,2592 y MSE de copia de observación de 0,4472.

## Capacidades

- Predicción de acciones motoras de manipulación (agarre, *pick*) en entornos simulados.
- Modelado del estado visual futuro (world model) condicionado por texto e historial de observaciones.
- Condicionamiento por instrucciones textuales mediante características SigLIP.
- Procesamiento de secuencias de observaciones visuales con caché de latentes de vídeo.
- Inferencia de política mediante el helper `wam_policy.py`.
- Evaluación en bucle cerrado a través del conjunto de pruebas `wam/sim_eval_suite.sh`.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni generación de texto libre.

## Casos de uso

- Investigación en world models para robótica: el modelo permite estudiar cómo la predicción conjunta de vídeo y acciones afecta a la estabilidad de la política en tareas de agarre, usando el checkpoint y las métricas incluidas para reproducir el entrenamiento.
- Reproducción de experimentos de SimToolReal: al estar ligado a una rama concreta del repositorio `purdue-mars/SimToolReal-mars`, sirve como referencia para validar pipelines de entrenamiento en Anvil con caché de latentes de Wan 2.2.
- Evaluación comparativa de políticas de manipulación: el conjunto `sim_eval_suite.sh` permite medir en bucle cerrado el rendimiento frente a otros checkpoints WAM, evitando depender del MAE de acciones retenidas, que el autor advierte que no ordena correctamente los modelos.
- Generación de datos sintéticos de agarre: las predicciones visuales del world model pueden emplearse para aumentar episodios de entrenamiento en simulación antes de transferirlos a políticas downstream.
- Estudio de condicionamiento multimodal texto-visión-acción: útil para analizar cómo las características SigLIP y los latentes de vídeo modulan la acción en tareas de *pick* con distintos objetos y posiciones.
- Base para *fine-tuning* en tareas de manipulación específicas: al ser un modelo de 0,8B con licencia Apache 2.0 y checkpoint completo, puede adaptarse a nuevos conjuntos de episodios simulados con requisitos de cómputo moderados (una A100 de 40 GB fue suficiente para el entrenamiento original).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| action_mae_rad | 0,0816 |
| action_mae_last_rad | 0,1163 |
| hold_mae_rad | 0,1732 |
| hold_mae_last_rad | 0,2435 |
| action_mse_norm | 0,1794 |
| video_mse | 0,2592 |
| copy_obs_mse | 0,4472 |
| video_mse_last | 0,3347 |
| copy_obs_mse_last | 0,5479 |
| Paso de evaluacion | 25 800 |
| Tiempo de evaluacion | 311,23 min |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que el modelo no es un LLM general. El autor advierte que el MAE de acciones retenidas no sirve para ordenar modelos WAM y recomienda la evaluación en bucle cerrado.

## Requisitos de hardware

- Entrenamiento original: 1 GPU A100 de 40 GB con *activation checkpointing*, batch global 16.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de 0,8B y el checkpoint de 3,2 GB, es razonable esperar que quepa en GPUs de consumo con suficiente memoria, aunque no se documenta.
- GPU recomendadas: A100-40GB (validada en entrenamiento); no se documentan pruebas en H100, RTX 4090 u otras.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: inferencia mediante `wam_policy.py` (PyTorch); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; el tiempo de evaluación reportado (311 min) corresponde al conjunto de evaluación, no a inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-pick-lmh-10k | 0,8B | no disponible | World-action model para *pick* | Apache 2.0 | Hugging Face |
| mardex11/wam15k-pick-20261127 | no disponible | no disponible | World-action model para *pick* | no disponible | Hugging Face |
| SimToolReal (repo base) | no disponible | no disponible | Framework de entrenamiento robótico | no disponible | GitHub (purdue-mars) |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; el autor indica que la comparación debe hacerse mediante evaluación en bucle cerrado.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM ni un asistente conversacional; no debe emplearse para generación de texto, código o tareas de lenguaje general.
- Entrenado únicamente en la tarea de *pick* sobre datos simulados; la generalización a otros objetos, entornos o robots reales no está validada.
- El MAE de acciones retenidas no es una métrica fiable para ordenar modelos WAM, según el propio autor; usar la evaluación en bucle cerrado.
- Sesgos conocidos: no documentados, pero al entrenarse solo con datos de simulación puede heredar sesgos de la distribución de escenas y objetos del dataset.
- Riesgo de alucinación visual: el world model puede generar predicciones de vídeo plausibles pero incorrectas, lo que afectaría a la política en escenarios fuera de distribución.
- Idiomas: no se documentan; el condicionamiento textual usa SigLIP, sin cobertura lingüística detallada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del VAE de Wan 2.2 y de SigLIP, cuyas licencias deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El checkpoint se distribuye como `ckpt.pt` (PyTorch), no en safetensors ni GGUF; requiere el código de `wam_policy.py` para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mardex11/wam-pick-lmh-10k
- Dataset principal: https://huggingface.co/datasets/mardex11/simtoolreal-pick-lmh-10k
- Dataset complementario: https://huggingface.co/datasets/mardex11/simtoolreal-pick-wam-15k
- Modelo relacionado: https://huggingface.co/mardex11/wam15k-pick-20261127
- Repositorio SimToolReal: https://github.com/purdue-mars/SimToolReal-mars (rama `data-vla-pick-isaac-render`)
