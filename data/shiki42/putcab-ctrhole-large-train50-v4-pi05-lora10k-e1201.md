# Shiki42/PutCab-CTRHole-Large-Train50-V4-PI05-LoRA10K-E1201

## Resumen

PutCab-CTRHole-Large-Train50-V4-PI05-LoRA10K-E1201 es un checkpoint de inferencia para robótica publicado por el usuario Shiki42 en Hugging Face. Se trata de un ajuste LoRA sobre el modelo base PI0.5 (pi05, un modelo de política visomotora de tipo vision-language-action) entrenado con JAX y el framework OpenPI. El checkpoint corresponde al paso 10.000 del experimento E1201 y está pensado como artefacto de investigación para un estudio sobre estados retenidos (held-out states), no como un modelo de propósito general.

El modelo está especializado en una tarea concreta de manipulación robótica bimanual denominada PutCab-CTRHole, sobre el conjunto de datos PutCab-CTRHole-Large-Train50-V4. No es un checkpoint compatible con Transformers ni un modelo de lenguaje: contiene parámetros en formato Orbax, activos de normalización de cuantiles globales específicos del dataset, configuración resuelta y metadatos de procedencia. Su relevancia es acotada: sirve para reproducir y auditar un experimento de aprendizaje por imitación en robótica, no para aplicaciones de texto, código o visión general.

El repositorio ocupa 6,3 GB y no cuenta con descargas ni valoraciones en el momento de la consulta. La información pública disponible es muy limitada: la model card describe el origen del entrenamiento y el procedimiento de carga, pero no detalla arquitectura, número de parámetros, contexto, idiomas ni licencia. Los datos que figuran a continuación se limitan a lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (modelo de política visomotora) con adaptadores LoRA; framework OpenPI sobre JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (según model card); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Orbax (params), más activos de normalización y configuración resuelta; no es un checkpoint de Transformers |

Otros datos declarados: tamaño del repositorio de 6,3 GB, batch de entrenamiento 16, semilla de entrenamiento 87431, IdleMask desactivado (receta E609), commit de OpenPI e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead y commit del dataset 1d0689afef719a5b311d2536487577d3571a172d.

## Arquitectura y entrenamiento

El modelo parte de PI0.5 como base y aplica un ajuste LoRA (Low-Rank Adaptation) entrenado en bf16 con JAX a través de OpenPI. No se detalla en la información disponible la arquitectura interna de PI0.5 (número de capas, dimensión, mecanismo de atención ni codificador visual), por lo que no es posible describirla con rigor. Lo que sí se declara es el procedimiento de entrenamiento: experimento E1201, paso 10.000, batch 16, semilla 87431 e IdleMask desactivado siguiendo la receta E609.

El dataset utilizado es PutCab-CTRHole-Large-Train50-V4, con los episodios de entrenamiento CTR Train50 V4 y un desplazamiento del offset de inicio por episodio para que ningún fotograma entre en las regiones de progreso bimanual retenidas B-L (qL 0,75-0,85; qR 0,15-0,25) y B-R (intercambiadas). Esta manipulación del dataset es la innovación metodológica central del experimento: busca evaluar la generalización del modelo en estados no vistos durante el entrenamiento. No se documentan datos sobre volumen de tokens, composición del dataset, RLHF ni DPO, que no aplican a un modelo de política robótica de este tipo.

## Capacidades

- Control de política visomotora para manipulación robótica bimanual en la tarea PutCab-CTRHole.
- Aprendizaje por imitación a partir de episodios de demostración del dataset PutCab-CTRHole-Large-Train50-V4.
- Inferencia con parámetros en bf16 mediante el código fuente de OpenPI en JAX.
- Normalización específica del dataset mediante activos de cuantiles globales exactos incluidos en el repositorio.
- Evaluación de generalización a estados retenidos (regiones de progreso B-L y B-R) como parte del estudio E1202.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de robótica: cargar el checkpoint con el código fuente y la configuración de OpenPI correspondientes para replicar el paso 10.000 del experimento E1201 en un entorno de laboratorio.
- Estudio de generalización a estados no vistos: utilizar el modelo para evaluar su comportamiento en las regiones de progreso bimanual retenidas B-L y B-R, que quedaron excluidas del entrenamiento mediante el desplazamiento del offset por episodio.
- Investigación en aprendizaje por imitación: analizar el efecto de un ajuste LoRA sobre PI0.5 en una tarea de manipulación concreta, comparando con el modelo base sin adaptadores.
- Auditoría de artefactos de investigación: el repositorio incluye configuración resuelta y procedencia, lo que permite verificar la cadena de entrenamiento (commit de OpenPI, commit del dataset, semilla y receta) en un proceso de revisión por pares.
- Desarrollo de pipelines de evaluación bimanual: integrar el checkpoint en un banco de pruebas de políticas robóticas que mida el progreso de la tarea en las regiones retenidas y documente la brecha entre entrenamiento y evaluación.
- Docencia y formación en robótica con JAX: emplear el modelo como ejemplo práctico de ajuste LoRA sobre un modelo de política visomotora y de gestión de activos de normalización específicos de dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluación del estudio E1202 se reportan en otro lugar y que la auditoría está pendiente, pero no incluye cifras en el repositorio consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 6,3 GB en bf16, por lo que se requiere al menos una GPU con memoria suficiente para los parámetros, los activos de normalización y el estado de inferencia de OpenPI.
- GPU recomendadas: no disponibles en la información proporcionada; al tratarse de un modelo JAX/OpenPI, se orienta a GPUs de centro de datos (A100, H100) o GPUs de consumo con soporte CUDA y suficiente memoria, sin que el autor lo especifique.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño real de PI0.5 más los adaptadores LoRA, dato no publicado.
- Opciones de despliegue: carga mediante el código fuente de OpenPI en JAX con la configuración correspondiente; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PutCab-CTRHole-Large-Train50-V4-PI05-LoRA10K-E1201 | no disponible | no disponible | no disponible | Orbax (JAX/OpenPI) | Hugging Face, 0 descargas |
| PI0.5 base (referencia) | no disponible | no disponible | no disponible | según OpenPI | Referenciado en la model card, sin ficha propia en la información disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe como checkpoint de inferencia de un único experimento y una sola semilla de entrenamiento, con auditoría pendiente; no debe tratarse como modelo validado para producción.
- Licencia no especificada: no se declara licencia, por lo que no se puede asumir permiso para uso comercial ni redistribución.
- Dependencia estricta del código: solo carga con la versión concreta del código fuente de OpenPI (commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead) y la configuración resuelta incluida; no es un checkpoint de Transformers.
- Estados de entrenamiento omitidos: no incluye estados de optimizador ni de dataloader, por lo que no permite reanudar el entrenamiento, solo inferencia.
- Normalización específica del dataset: los activos de cuantiles globales están ajustados a PutCab-CTRHole-Large-Train50-V4; usarlo con otros datos requiere recalcular la normalización.
- Especialización estrecha: entrenado para una única tarea de manipulación bimanual; no se documentan capacidades de lenguaje, visión general, código ni tool calling.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible; en robótica, el riesgo equivalente es la ejecución de acciones erróneas fuera de la distribución de entrenamiento, especialmente en las regiones retenidas B-L y B-R.
- Idiomas y contexto: no aplicables o no documentados.
- Sin métricas publicadas: no hay resultados de benchmarks en el repositorio, lo que impide valorar su rendimiento de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/PutCab-CTRHole-Large-Train50-V4-PI05-LoRA10K-E1201
- Dataset referenciado: https://huggingface.co/datasets/Shiki42/PutCab-CTRHole-Large-Train50-V4
- Código fuente de OpenPI (commit de referencia): https://github.com/Physical-Intelligence/openpi/tree/e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead
