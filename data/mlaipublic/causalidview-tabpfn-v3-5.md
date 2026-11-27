# mlaipublic/CausalIDView-TabPFN-v3.5

## Resumen

CausalIDView-TabPFN-v3.5 es un repositorio de pesos que contiene copias sin modificar de los checkpoints upstream de TabPFN v3.5, empaquetados por el autor `mlaipublic` para su uso en el proyecto CausalIDView del grupo MLAI de la Universidad Yonsei. No se trata de un modelo entrenado por el autor del repositorio, sino de una réplica de los pesos oficiales de Prior Labs GmbH, con ficheros fijados por commit y verificados mediante hash SHA-256.

TabPFN es un transformer preentrenado para inferencia Bayesiana aproximada sobre datos tabulares: en lugar de requerir entrenamiento por tarea, realiza predicciones en un solo paso forward sobre el conjunto de entrenamiento y el de test concatenados. La versión 3.5 corresponde a la línea de checkpoints publicada por Prior Labs en 2026, y este repositorio la redistribuye para reproducibilidad del proyecto CausalIDView.

El repositorio tiene un tamaño de 0,9 GB, sin descargas ni likes registrados, y su relevancia es acotada: sirve como dependencia de pesos para experimentos de atribución causal sobre datos tabulares, no como modelo de propósito general. La licencia es no comercial, lo que restringe su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para inferencia Bayesiana aproximada sobre datos tabulares (TabPFN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors) |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | tabpfn-3-5-license-v1.0 (TABPFN-3.5 Non-Commercial License, Prior Labs GmbH) |
| Formato de pesos | safetensors (`tabpfn-v3.5-20260909.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint subyacente es TabPFN v3.5, un transformer preentrenado por Prior Labs GmbH para realizar inferencia Bayesiana aproximada sobre datasets tabulares. El modelo se entrena sobre una distribución de tareas sintéticas generadas a partir de procesos generativos, de modo que en tiempo de inferencia recibe el conjunto de entrenamiento y el de test como una única secuencia y produce predicciones en un solo paso forward, sin ajuste de parámetros por tarea.

Este repositorio en concreto no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; la model card se limita a indicar que son copias sin modificar de los checkpoints upstream, con el fichero `tabpfn-v3.5-20260909.safetensors` fijado al commit `06bf2ba` del repositorio `Prior-Labs/tabpfn_3_5` y verificado con SHA-256 `ece4d67eadfea42eb0e610df5189bea60cb7f31073d81e9c7a019b76eacf0be3`. No se documentan innovaciones técnicas adicionales en la información disponible.

## Capacidades

- Predicción supervisada sobre datos tabulares (clasificación y regresión) mediante inferencia en contexto, sin entrenamiento específico por tarea.
- Inferencia Bayesiana aproximada: el modelo aproxima la distribución predictiva posterior a partir del conjunto de entrenamiento proporcionado en el prompt.
- Integración con el framework CausalIDView para experimentos de atribución e identificación causal sobre datos tabulares.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto libre.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducibilidad de experimentos CausalIDView: el repositorio fija el checkpoint exacto con hash verificable, lo que permite reproducir los resultados del proyecto MLAI-Yonsei sin depender de que el upstream cambie de versión.
- Evaluación de métodos de atribución causal sobre datos tabulares: se usa TabPFN v3.5 como modelo base sobre el que CausalIDView calcula estimaciones de importancia causal, aprovechando su capacidad de inferencia en contexto sin reentrenamiento.
- Benchmarking de modelos tabulares fundacionales en entornos académicos: sirve para comparar el rendimiento de TabPFN v3.5 frente a gradient boosting (XGBoost, LightGBM) en datasets pequeños y medianos.
- Prototipado de pipelines de clasificación tabular en investigación: al no requerir entrenamiento por tarea, permite iterar rápidamente sobre conjuntos de datos de cientos o miles de filas.
- Docencia y experimentación en cursos de machine learning: el checkpoint permite ilustrar inferencia Bayesiana aproximada y prior-fitted networks con pesos listos para cargar.
- Verificación de integridad de pesos en pipelines MLOps: el hash SHA-256 documentado permite validar la descarga en entornos de CI antes de cargar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,9 GB en disco, por lo que la inferencia en fp32 requeriría del orden de 1-2 GB de VRAM más el overhead de activaciones y del conjunto de datos en contexto.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar los pesos; se desconoce el comportamiento en datasets grandes.
- Compatibilidad con GPU de consumo: probable en RTX 3060, RTX 4060, RTX 4090 y superiores, condicionado al tamaño del dataset de entrada.
- Opciones de despliegue: el formato safetensors es compatible con PyTorch y con la librería oficial `tabpfn` de Prior Labs; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CausalIDView-TabPFN-v3.5 | TabPFN v3.5 (tabular) | no disponible | No comercial (Prior Labs) | Hugging Face, repo de 0,9 GB |
| TabPFN upstream (Prior-Labs/tabpfn_3_5) | TabPFN v3.5 (tabular) | no disponible | No comercial (Prior Labs) | Hugging Face, repositorio oficial |
| XGBoost / LightGBM | Gradient boosting | no aplica | Apache 2.0 / MIT | Bibliotecas estándar |
| TabICL | Transformer tabular | no disponible | no disponible | Hugging Face |

La comparación con XGBoost y LightGBM es relevante porque son las alternativas dominantes en datos tabulares; TabPFN se diferencia por no requerir entrenamiento por tarea, a costa de una licencia no comercial y de un rendimiento que decae en datasets grandes. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: la TABPFN-3.5 Non-Commercial License de Prior Labs GmbH prohíbe el uso comercial; cualquier uso en producción requiere licencia directa del titular.
- Requiere atribución: el repositorio incluye un aviso de atribución obligatorio (NOTICE) que debe conservarse en redistribuciones.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Sesgos: no documentados en la información disponible; al ser un modelo tabular, hereda los sesgos presentes en los datos de entrada.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero las predicciones pueden ser incorrectas si el dataset de entrada se aleja de la distribución de tareas sintéticas de preentrenamiento.
- Limitaciones de contexto: se desconoce el tamaño máximo de dataset que el modelo puede procesar en un solo forward; TabPFN tiene límites prácticos en número de filas y columnas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; la fiabilidad depende exclusivamente de la verificación del hash SHA-256 frente al upstream.
- Fecha de creación futura (2026-11-27): conviene verificar la autenticidad del repositorio y del checkpoint antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlaipublic/CausalIDView-TabPFN-v3.5
- Checkpoint upstream: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/06bf2ba35c80a92a3b9abb436b99cf49e7a0365e/tabpfn-v3.5-20260909.safetensors
- Proyecto CausalIDView: https://github.com/MLAI-Yonsei/CausalIDView
- Licencia upstream: fichero LICENSE incluido en el repositorio
- Aviso de atribución: fichero NOTICE incluido en el repositorio
