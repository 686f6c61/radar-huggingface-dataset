# kgrozdanovski/caldec-v1-laya

## Resumen

CalDec Laya es un modelo de clasificación de texto especializado en decisiones de asistente tipadas («typed decisions»). Se trata de un ajuste fino supervisado del encoder Laya de Convai Innovations, desarrollado por Kristijan Grozdanovski (usuario kgrozdanovski en Hugging Face). El modelo recibe un estado (por ejemplo, el contenido de una página web) junto con una o varias preguntas tipadas y devuelve respuestas con sus probabilidades asociadas, sin generar texto libre. Con 421.293.830 parámetros (aproximadamente 421 millones) y pesos en safetensors, el checkpoint es autocontenido: incluye `model.safetensors`, `rl_agent_config.json`, los ficheros del tokenizer y la configuración del encoder.

Su relevancia radica en que aborda un problema distinto al de los modelos generativos: en lugar de producir una respuesta textual, actúa como un «System 1» de decisión de baja latencia, devolviendo etiquetas calibradas. El autor reporta un error de calibración esperado (ECE) de 0,072 en el conjunto de test de Assistant Decisions, un valor bajo para una tarea de clasificación con etiquetas sintéticas, lo que indica que las probabilidades devueltas son razonablemente fiables. La licencia Apache 2.0, heredada del modelo base, facilita su integración en productos comerciales sin restricciones adicionales.

El modelo está pensado para escenarios de enrutado y control en agentes: decidir si una instrucción inyectada debe bloquearse, clasificar la intención de un turno o resolver preguntas booleanas sobre un estado. Está entrenado y evaluado únicamente en inglés, y el propio autor advierte de que no constituye por sí solo un control de seguridad autónomo. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder no autoregresivo derivado de Laya (etiquetado `modernbert` en la model card), con cabezas de decisión tipadas |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma oficial; el autor recomienda mantener los estados en torno a 320 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,7 GB, compatible con `transformers` a traves de la libreria `laya`) |

## Arquitectura y entrenamiento

La arquitectura es la de Laya, una familia de modelos de decisión no autoregresivos de Convai Innovations. En lugar de decodificar token a token, el modelo procesa un estado y un conjunto de preguntas tipadas y emite directamente un objeto de respuesta con valores y probabilidades por pregunta. CalDec Laya parte del checkpoint `convaiinnovations/laya` y añade un ajuste fino con cabezas de decisión específicas para la tarea. Los tags del repositorio mencionan `modernbert`, lo que apunta a un backbone de tipo encoder con atención bidireccional; la model card no detalla la configuración interna de capas ni dimensiones ocultas.

El entrenamiento optimiza entropía cruzada suave («soft cross-entropy») contra distribuciones de un profesor, con una ponderación por sitio («per-site») proporcional a la inversa de la raíz cuadrada. La receta de la release usa seis épocas, micro-batch de 4, acumulación de gradiente de 8, learning rate de 2,5e-5 para el encoder y 1e-4 para las cabezas, y el flag `--legacy-drop-tail` para reproducir los pasos del optimizador de la release. El split de entrenamiento de `LocalLLaMA/typed-decisions` se incorpora con `--with-public`, y el conjunto de validación se emplea para ajustar temperaturas de calibración. Los datos del corpus Assistant Decisions son sintéticos y, según el creador del dataset, cada fila de entrenamiento proviene de GLM 5.3 a través de OpenRouter; las llamadas originales a la API no se han publicado. No se documenta el uso de RLHF ni de DPO.

## Capacidades

- Clasificación de decisiones tipadas: recibe un estado y preguntas tipadas y devuelve respuestas con su probabilidad asociada, sin generar texto.
- Respuestas con probabilidades calibradas: el campo `probabilities` acompaña a las respuestas de tipo `choice` o `score`, lo que permite fijar umbrales de decisión.
- Detección de inyección de instrucciones: el ejemplo de la model card evalúa si un texto instruye a un asistente de IA (`{"injection": {"type": "noul", ...}}`).
- Enrutado y control de agentes: pensado para su uso dentro del bucle `laya.Agent.system_one`, que devuelve un diccionario de respuestas por tipo de decisión.
- Multilingüe: no soportado en este ajuste; el modelo está declarado solo para inglés (la familia base Laya anuncia enrutado en más de 100 idiomas, pero eso corresponde al modelo base, no a este checkpoint).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso generativo: no es una capacidad del modelo, que no produce cadenas de texto.
- Modo «thinking», visión o audio: no soportados.

## Casos de uso

- Filtrado de inyección de prompts: dado el contenido recuperado de una página web o un documento, el modelo decide si ese texto contiene instrucciones dirigidas a un asistente. Su salida probabilística permite fijar un umbral conservador antes de pasar el contenido a un LLM generativo.
- Enrutado de intenciones en un asistente: clasificar cada turno del usuario en un conjunto cerrado de decisiones tipadas para decidir qué herramienta o submódulo se invoca después, aprovechando la latencia reducida frente a un modelo generativo.
- Puerta de seguridad previa a la ejecución de herramientas: colocar CalDec como clasificador intermedio que autoriza o bloquea llamadas a funciones sensibles según el estado y la pregunta planteada.
- Moderación de contenido asistida por etiquetas calibradas: el ECE de 0,072 en el test de Assistant Decisions permite usar las probabilidades directamente como puntuaciones de confianza en lugar de reescalarlas heurísticamente.
- Evaluación automática de trayectorias de agente: usar el modelo como juez binario o de elección sobre estados sintéticos cortos (hasta unos 320 tokens) para etiquetar rutas de decisión en pipelines de test.
- Filtrado previo en sistemas RAG: clasificar documentos recuperados antes de inyectarlos en el contexto del LLM, reduciendo el coste de tokens y el riesgo de contaminación del prompt.
- Investigación sobre calibración: servir como punto de comparación reproducible (Apache 2.0, pesos abiertos) para estudiar calibración en clasificadores de decisión frente a backbones alternativos, como el propio `caldec-v1-gliner2.5-decide` del mismo autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La métrica de accuracy se define como la concordancia con las etiquetas objetivo sintéticas sobre decisiones «untied».

| Conjunto | Decisiones | Untied | Accuracy | ECE | Soft NLL |
|---|---:|---:|---:|---:|---:|
| Assistant Decisions, test | 3.452 | 3.372 | 0,823 | 0,072 | 0,559 |
| LocalLLaMA/typed-decisions, test | 2.000 | 1.965 | 0,778 | 0,149 | 0,858 |

Advertencias del autor sobre estos números: el test de Assistant Decisions se usó durante el desarrollo del modelo, y el split de entrenamiento de `LocalLLaMA/typed-decisions` se incluyó en el entrenamiento, por lo que su resultado no es zero-shot. La puntuación se obtuvo a través de `laya.Agent.system_one`, la ruta servida con temperaturas ajustadas. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,7 GB en fp32 (el tamaño del repositorio coincide con 421 M de parámetros a 4 bytes), en torno a 0,85 GB en fp16 y unos 0,42 GB en int8 si se aplica cuantización, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de memoria es suficiente para el checkpoint en precisión reducida; el autor indica que la receta de entrenamiento está pensada para una única GPU CUDA de 16 GB.
- GPU de consumo: cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: la vía documentada es la librería `laya` (versión probada 0.3.6) con `torch==2.14.0` y `transformers==5.17.0` sobre Python 3.12. Para despliegues inmutables, el autor recomienda descargar una revisión concreta del Hub mediante `huggingface_hub.snapshot_download` y pasar el directorio resultante a `laya.load`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponible para este ajuste fino. El proyecto base Laya anuncia una latencia inferior a 35 ms (33 ms) para su motor de decisión, pero ese dato corresponde a la familia base y no se ha verificado sobre este checkpoint.
- Nota de uso: mantener los estados en torno a 320 tokens. `action.act_probability` proviene de una cabeza que este ajuste no entrenó y no debe usarse como puntuación de decisión de CalDec.

## Comparativa con modelos similares

No se han proporcionado resultados de benchmarks de modelos alternativos en la misma categoría, por lo que no es posible establecer una comparación cuantitativa. A continuación se recoge la información disponible sobre el modelo base y sobre el otro checkpoint de la misma familia.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kgrozdanovski/caldec-v1-laya | 421 M | En torno a 320 tokens recomendados | Apache 2.0 | Accuracy 0,823 y ECE 0,072 en Assistant Decisions test |
| convaiinnovations/laya (base) | No disponible | No disponible | Apache 2.0 | Familia de decisión no autoregresiva; latencia declarada inferior a 35 ms y enrutado en más de 100 idiomas |
| kgrozdanovski/caldec-v1-gliner2.5-decide | No disponible | No disponible | Apache 2.0 | Mismo autor y familia CalDec, con otro backbone y otra ruta de entrenamiento |

## Limitaciones y advertencias

- Las etiquetas son juicios sintéticos generados por un modelo (GLM 5.3 vía OpenRouter), no anotaciones humanas; el modelo aprende por tanto los sesgos de ese profesor.
- Los estados del dataset son sintéticos y cortos, y los casos de inyección no fueron generados por atacantes adaptativos, por lo que el modelo no ha sido expuesto a adversarios que optimicen contra él.
- El autor indica explícitamente que este modelo no es un control de seguridad autónomo y no debe usarse como única barrera.
- Riesgo de alucinación: aunque no genera texto libre, las etiquetas y probabilidades pueden ser incorrectas en estados fuera de la distribución de entrenamiento, especialmente porque el rendimiento en `LocalLLaMA/typed-decisions` cae al 0,778 de accuracy y el ECE sube a 0,149.
- Solapamiento de valores de estado entre algunos splits del dataset, lo que puede inflar la evaluación si se comparan particiones no independientes.
- El resultado en `LocalLLaMA/typed-decisions` no es zero-shot porque su split de entrenamiento se incluyó en el ajuste.
- Limitación de idioma: solo inglés. No hay soporte declarado para castellano ni para el enrutado multilingüe de la familia base.
- Limitación de longitud: los estados deben mantenerse en torno a 320 tokens; no se documenta una ventana de contexto mayor.
- Restricciones de licencia: Apache 2.0, sin cláusulas de uso comercial restrictivas; el autor señala que coincide con la del modelo base. Ni los autores del modelo base ni los de los benchmarks avalan este checkpoint.
- No debe usarse `action.act_probability` como puntuación de decisión: proviene de una cabeza no entrenada en este ajuste.
- El autor no conserva la GPU exacta ni el tiempo de entrenamiento de la ejecución de la release, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kgrozdanovski/caldec-v1-laya
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya (árbol de ficheros): https://huggingface.co/convaiinnovations/laya/tree/main
- Resultados y contrato de puntuación: https://github.com/kgrozdanovski/caldec/blob/main/RESULTS.md
- Script de entrenamiento: https://github.com/kgrozdanovski/caldec/blob/main/scripts/train.py
- Datasheet del dataset: https://github.com/kgrozdanovski/caldec/blob/main/DATASET.md#collection-and-labels
- Citación: https://github.com/kgrozdanovski/caldec/blob/main/CITATION.cff
- Dataset Assistant Decisions: https://huggingface.co/datasets/kgrozdanovski/assistant-decisions
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Checkpoint alternativo CalDec GLiNER: https://huggingface.co/kgrozdanovski/caldec-v1-gliner2.5-decide
- Blog sobre Laya: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Playground de Laya: https://github.com/wdobry/laya-playground
- Sitio divulgativo sobre Laya: https://layaaimodel.com/
- Contacto del autor: kgrozdanovski7@gmail.com
