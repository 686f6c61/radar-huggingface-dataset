# gerkone/gyroflow-tmp

## Resumen

GyroFlow es un modelo generativo de física de plasmas desarrollado por el grupo de investigación del Institute of Machine Learning de la Johannes Kepler University Linz (JKU), publicado en el repositorio `gerkone/gyroflow-tmp` como una versión temporal de los checkpoints asociados a un artículo científico. El modelo combina un autoencoder con un transformer de difusión basado en flow matching (DiT) para generar trayectorias de transporte de calor en simulaciones de turbulencia girocinética, un problema central en la modelización de plasmas de fusión. Esta ficha describe los checkpoints temporales, no un modelo de lenguaje.

El repositorio contiene únicamente los pesos de dos componentes (autoencoder y modelo de flujo), junto con las configuraciones de entrenamiento y las estadísticas de normalización del conjunto de datos. No se trata de un modelo de propósito general: su pipeline no está definido en Hugging Face, no declara licencia ni idiomas, y su uso está ligado al código de entrenamiento y evaluación del repositorio `ml-jku/neural-gyrokinetics`. Es relevante ahora porque permite reproducir los resultados del artículo antes de la publicación de una versión estable.

El tamaño del repositorio es de 0,9 GB y los pesos se distribuyen en formato `.pth` (PyTorch), no en safetensors ni GGUF. La información disponible no incluye número de parámetros, longitud de contexto ni datos de entrenamiento más allá de las rutas de los checkpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder + transformer de difusión (DiT) con flow matching |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en punto flotante `.pth`) |
| Idiomas soportados | no aplica (modelo de simulación física, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch), con `model_state_dict`, `epoch` y `loss` |
| Tamaño del repositorio | 0,9 GB |
| Checkpoints incluidos | `autoencoder/20260405_022851_327/best.pth` (época 400), `flow/20260412_180101_948/best.pth` (época 120) |

## Arquitectura y entrenamiento

GyroFlow se compone de dos módulos entrenados de forma separada. El primero es un autoencoder que comprime las trayectorias de simulación girocinética a un espacio latente; el segundo es un transformer de difusión (DiT) entrenado con flow matching que genera muestras en ese espacio latente. La generación se realiza en 15 pasos de Euler con un `latent_scale` de 0,0478053, según la configuración de muestreo `generate_gyroflow.yaml`. Los checkpoints publicados corresponden al autoencoder en la época 400 y al modelo de flujo en la época 120.

El entrenamiento se apoya en las estadísticas de normalización del conjunto de entrenamiento incluidas en el directorio `normalization/`. La evaluación se realiza sobre el conjunto de datos `gerkone/cbc-gyroswin-256traj`, que contiene 31 trayectorias en distribución (`id/`) y trayectorias fuera de distribución (`ood/`). El modelo se evalúa midiendo el RMSE del flujo de calor promediado en el tiempo (`Qbar`), con la referencia promediada a partir del fotograma 80. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO, que no aplican a este dominio.

## Capacidades

- Generación de trayectorias de turbulencia girocinética mediante muestreo en espacio latente con flow matching.
- Codificación y decodificación de campos físicos a través del autoencoder entrenado.
- Evaluación del error de flujo de calor promediado en el tiempo (RMSE de `Qbar`) sobre trayectorias en distribución y fuera de distribución.
- Reproducción de los resultados del artículo mediante el script `eval_gyroflow.py` del repositorio `neural-gyrokinetics`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción de resultados científicos: ejecutar `eval_gyroflow.py` con `generate_gyroflow.yaml` para obtener el RMSE de `Qbar` esperado de 19,0 en las 31 trayectorias en distribución, tal como se reporta en la Tabla 1 del artículo.
- Validación de pipelines de simulación: comparar las trayectorias generadas por el modelo con las simulaciones de referencia del dataset `cbc-gyroswin-256traj` para verificar la integración del código de evaluación.
- Investigación en modelos generativos para física de plasmas: servir como base para experimentar con variantes de flow matching o de arquitecturas DiT aplicadas a datos girocinéticos.
- Estudio de generalización fuera de distribución: analizar el error en las trayectorias `ood/` (aproximadamente 14 en `ood_iteration_0-4`) y en las re-simuladas posteriores a la evaluación del artículo.
- Desarrollo de métodos de reducción de dimensionalidad: utilizar el autoencoder como referencia para comparar técnicas de compresión de campos físicos de alta dimensionalidad.
- Docencia y formación: emplear los checkpoints y las configuraciones como ejemplo práctico de entrenamiento de modelos generativos en dominios científicos con datos simulados.

## Benchmarks y rendimiento

| Métrica | Conjunto | Valor |
|---|---|---|
| RMSE de `Qbar` | 31 trayectorias en distribución (`id/`) | 19,0 (Tabla 1) |
| RMSE de `Qbar` | `ood_iteration_0-4` | aproximadamente 14 |
| RMSE de `Qbar` | Resto de trayectorias `ood/` | no comparable con el artículo (re-simuladas) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del autoencoder y del DiT, no especificado en la información proporcionada.
- GPU recomendadas: no disponibles; el repositorio no indica requisitos de hardware.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (0,9 GB) sugiere que los pesos podrían caber en GPUs con 8-16 GB de VRAM, pero no hay datos que lo confirmen.
- Opciones de despliegue: únicamente mediante el código PyTorch de `ml-jku/neural-gyrokinetics` (requiere el PR #10 hasta su fusión); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de generación de trayectorias girocinéticas ni ofrece datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- Versión temporal: el autor indica explícitamente que se trata de checkpoints temporales y que una versión adecuada se publicará más adelante; la API y las rutas pueden cambiar.
- Dependencia de código externo: requiere el repositorio `ml-jku/neural-gyrokinetics` y el PR #10, no fusionado en el momento de la publicación, lo que puede romper la reproducibilidad.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial y la redistribución no están autorizados de forma explícita.
- Dominio restringido: solo aplica a simulación de turbulencia girocinética; no es un modelo de lenguaje ni de propósito general.
- Evaluación limitada: los resultados fuera de distribución posteriores a `ood_iteration_0-4` no son comparables con el artículo porque las trayectorias se re-simularon después de la evaluación original.
- Riesgo de sobreajuste al conjunto de evaluación: el RMSE reportado se basa en 31 trayectorias en distribución, una muestra reducida.
- Sin datos de sesgo, alucinación o limitaciones idiomáticas aplicables, al no ser un modelo de lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gerkone/gyroflow-tmp
- Dataset de evaluación: https://huggingface.co/datasets/gerkone/cbc-gyroswin-256traj
- Código de entrenamiento y evaluación: https://github.com/ml-jku/neural-gyrokinetics
- Pull request requerido: https://github.com/ml-jku/neural-gyrokinetics/pull/10
