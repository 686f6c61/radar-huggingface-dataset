# shliakhetko/tinyjev-mmbert

## Resumen

`tinyjev-mmbert` es un clasificador encoder-only derivado de la familia ModernBERT/mmBERT, publicado por el usuario shliakhetko en Hugging Face. El modelo resuelve una tarea muy concreta: dado un texto de contexto, una pregunta y un conjunto de opciones de respuesta, devuelve una distribución de probabilidad sobre esas opciones. El autor lo denomina "modelo de decisiones" (decision model) y lo expone mediante un endpoint HTTP propio (`/v1/systemone`) construido sobre FastAPI.

El modelo distingue tres tipos de pregunta: `noul` (respuesta binaria sí/no), `choice` (elección entre alternativas con criterios) y `score` (niveles ordenados, donde la respuesta final es la esperanza matemática de la distribución). Esta formulación lo sitúa más cerca de un reranker/clasificador de opciones que de un modelo generativo.

La información pública es muy escasa: el repositorio ocupa 1,2 GB, no declara licencia, idiomas ni pipeline, y no cuenta con descargas ni interacciones en el momento de la consulta. La model card está redactada en ucraniano y describe principalmente el flujo de entrenamiento y despliegue, no las especificaciones del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only tipo ModernBERT/mmBERT (base declarada: `jhu-clsp/mmBERT-base`) |
| Parametros totales | no disponible (modelo base mmBERT-base; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base mmBERT; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en formato nativo de Transformers; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (la model card está en ucraniano; no se declaran idiomas del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato nativo de Transformers; el repo ocupa 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde `jhu-clsp/mmBERT-base`. La cabeza de salida no es generativa: produce una distribución de probabilidad sobre un conjunto variable de opciones, lo que requiere un mecanismo de puntuación por opción (estilo cross-encoder) en lugar de un vocabulario de tokens. El autor no detalla en la model card la implementación exacta de esa cabeza ni el número de parámetros añadidos.

El entrenamiento combina datos reales y sintéticos. El pipeline descrito incluye `build_data.py` (conversión de datasets reales a `data/real_*.jsonl`), `gen_synthetic.py` (generación de datos sintéticos mediante un LLM a través de la API de Groq, con `GROQ_API_KEY`) y `build_synth.py` para consolidar el conjunto. El script `train.py` se invoca con 3 épocas sobre `ckpt_mm`. No se especifican el volumen total de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor menciona "calibración" de las probabilidades, pero no documenta el método (temperature scaling, isotonic regression u otro).

## Capacidades

- Clasificación de opciones: dado un texto, una pregunta y un conjunto de alternativas, devuelve probabilidades por opción.
- Preguntas binarias (`noul`): respuesta sí/no con probabilidad calibrada.
- Preguntas de elección (`choice`): selección entre alternativas guiada por criterios.
- Preguntas de puntuación (`score`): niveles ordenados, con salida como esperanza matemática de la distribución.
- Servicio HTTP: expone el endpoint `/v1/systemone` mediante FastAPI y Uvicorn.
- No es un modelo generativo: no produce texto libre, no soporta tool calling, ni razonamiento multi-paso autónomo.
- Capacidades multilingües: no documentadas explícitamente; dependen del modelo base mmBERT.

## Casos de uso

- Enrutamiento de decisiones en pipelines: usar el endpoint `/v1/systemone` para clasificar una consulta entrante entre un conjunto fijo de categorías o acciones, aprovechando la salida probabilística para umbralizar.
- Moderación o triaje binario: preguntas `noul` para decidir si un texto cumple o no una política concreta, con probabilidad calibrada para ajustar el umbral de sensibilidad.
- Selección de respuesta en sistemas RAG: dado un contexto recuperado y varias respuestas candidatas, elegir la más probable mediante el modo `choice`.
- Puntuación de calidad ordenada: modo `score` para asignar un nivel (por ejemplo, 1 a 5) a un texto según criterios definidos, usando la esperanza matemática como valor continuo.
- Evaluación automática de salidas de LLM: comparar respuestas generadas por distintos modelos frente a un criterio y obtener una preferencia probabilística.
- Servicio interno de clasificación: desplegar el modelo con Uvicorn detrás de un API gateway para tareas de decisión de baja latencia en un backend propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 1,2 GB, lo que sugiere que la inferencia en fp32 requiere del orden de 1,5-2 GB de VRAM; en fp16, alrededor de 1 GB. No confirmado por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería ser suficiente; el modelo base mmBERT es de escala base, no de escala grande.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el autor documenta FastAPI + Uvicorn con PyTorch y Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo, por lo que vLLM y llama.cpp no son la vía natural).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyjev-mmbert | no disponible (base mmBERT) | no disponible | Clasificación de opciones con calibración | no disponible | Hugging Face (repo público) |
| jhu-clsp/mmBERT-base | no disponible en esta ficha | no disponible | Encoder multilingüe base | no disponible en esta ficha | Hugging Face |
| Cross-encoders de reranking (p. ej. bge-reranker) | variable | variable | Puntuación de pares consulta-documento | variable según modelo | Hugging Face |

No se dispone de datos de rendimiento del modelo como para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información pública mínima: sin licencia declarada, sin idiomas declarados y sin métricas, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Modelo no generativo: no sirve para generación de texto, agentes ni tool calling.
- Riesgo de alucinación: inherente a la formulación probabilística sobre opciones; una distribución calibrada no garantiza corrección semántica.
- Sesgos: no documentados; dependen de los datasets reales y sintéticos usados en el entrenamiento, cuya composición no se detalla.
- Dependencia de datos sintéticos generados por un LLM externo (Groq), lo que puede introducir sesgos y artefactos del generador.
- Contexto máximo no especificado: debe validarse empíricamente antes de usarlo con entradas largas.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni de reproducibilidad de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/shliakhetko/tinyjev-mmbert
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
