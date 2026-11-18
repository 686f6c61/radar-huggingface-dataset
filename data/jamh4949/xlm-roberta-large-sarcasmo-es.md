# Jamh4949/xlm-roberta-large-sarcasmo-es

## Resumen

xlm-roberta-large-sarcasmo-es es un modelo de clasificación de texto obtenido por fine-tuning de FacebookAI/xlm-roberta-large para la detección binaria de sarcasmo en español. Lo publica el usuario Jamh4949 en Hugging Face como resultado de un taller académico de Procesamiento de Lenguaje Natural (curso 2026-II), y devuelve dos etiquetas: `SARCASMO` (1) y `NO_SARCASMO` (0). No es un modelo generativo: es un encoder XLM-RoBERTa adaptado como clasificador de secuencias.

El interés práctico del modelo está en su tarea concreta y en el dominio de entrenamiento: textos cortos (unas 13 palabras de media), mayoritariamente titulares de prensa satíricos o reales, con un dataset combinado de 12.145 ejemplos de entrenamiento y 3.037 de validación con clases balanceadas. Sobre esa validación reporta accuracy y F1 ponderado/macro de 0,9338 con la configuración publicada (batch 16, learning rate 1e-5, época 8).

Se trata de un artefacto de bajo perfil: cero descargas y cero likes en el momento de la consulta, sin licencia declarada y con métricas de validación ligeramente optimistas por el uso del mismo conjunto en el early stopping. Es útil como punto de partida o referencia para detección de sarcasmo en titulares en español, no como componente listo para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 514 tokens (máximo de XLM-RoBERTa); entrenado con `max_length=128` |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según repo; no se documentan versiones GGUF/ONNX) |
| Idiomas soportados | es (español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa large, un transformer encoder de tipo RoBERTa multilingüe preentrenado con objetivos de lenguaje enmascarado, al que se añade una cabeza de clasificación para una tarea binaria. El fine-tuning se realizó sobre el dataset «Sarcasmo combinado» del curso: 12.145 textos de entrenamiento y 3.037 de validación, con clases balanceadas y textos cortos (≈13 palabras), mayoritariamente titulares de prensa satíricos o reales. La tokenización usa `max_length=128` con padding dinámico.

El entrenamiento se ejecutó en una GPU NVIDIA T4 (Kaggle) con AdamW, weight decay 0,01, warmup del 10 %, precisión fp16 y un máximo de 8 épocas con early stopping (paciencia 2) sobre F1 macro de validación, restaurando los mejores pesos. Se probaron tres configuraciones de batch size (8, 16 y 32) con learning rate 1e-5; la publicada es batch 16, que alcanzó 0,9338 de accuracy y F1 macro en la época 8, con 23,7 minutos de entrenamiento. No se documenta RLHF, DPO ni innovaciones arquitectónicas adicionales; es un fine-tuning estándar de clasificación.

## Capacidades

- Clasificación binaria de sarcasmo en español: devuelve `SARCASMO` o `NO_SARCASMO` para un texto de entrada.
- Funciona especialmente bien con textos cortos de estilo periodístico o titular.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-step: es un clasificador, no un modelo instructivo.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Capacidad multilingüe potencial heredada de XLM-RoBERTa, pero el fine-tuning y la evaluación se limitan al español.
- No se documentan capacidades de agentes ni de conversación multi-turno.

## Casos de uso

- Moderación de comentarios en foros y redes: clasificar mensajes cortos en español para marcar posibles sarcasmos que un filtro de toxicidad basado en palabras clave podría pasar por alto.
- Análisis de sentimiento con matiz irónico: usar la salida como señal auxiliar en pipelines de análisis de opinión sobre titulares o tuits, donde el sarcasmo invierte la polaridad aparente.
- Monitorización de prensa satírica: etiquetar automáticamente titulares de medios satíricos frente a medios reales para separar corpus en estudios de medios o datasets de investigación.
- Filtrado previo en datasets de NLP: detectar y descartar o marcar ejemplos sarcásticos antes de entrenar modelos de sentimiento o resumen, reduciendo ruido de anotación.
- Investigación académica en pragmática computacional: servir como baseline reproducible de detección de sarcasmo en español para comparar con aproximaciones basadas en LLM generativos.
- Enriquecimiento de dashboards de reputación de marca: añadir una columna de probabilidad de sarcasmo a menciones cortas para que los analistas prioricen la revisión manual de casos ambiguos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de validación (3.037 ejemplos, clases balanceadas):

| Configuracion | Epoca | Accuracy | Precision | Recall | F1 ponderado | F1 macro |
|---|---|---|---|---|---|---|
| batch 8, lr 1e-5 | 4 | 0,9312 | 0,9322 | 0,9312 | 0,9311 | 0,9311 |
| batch 16, lr 1e-5 (publicada) | 8 | 0,9338 | 0,9342 | 0,9338 | 0,9338 | 0,9338 |
| batch 32, lr 1e-5 | 5 | 0,9335 | 0,9343 | 0,9335 | 0,9335 | 0,9335 |

Evolución por época de la configuración publicada (batch 16):

| Epoca | Training loss | Validation loss | Accuracy | F1 macro |
|---|---|---|---|---|
| 1 | 0,5290 | 0,3954 | 0,8518 | 0,8504 |
| 2 | 0,2835 | 0,2157 | 0,9164 | 0,9164 |
| 3 | 0,1857 | 0,3201 | 0,9183 | 0,9183 |
| 4 | 0,1371 | 0,3631 | 0,9279 | 0,9279 |
| 5 | 0,0879 | 0,4651 | 0,9289 | 0,9289 |
| 6 | 0,0518 | 0,5040 | 0,9315 | 0,9315 |
| 7 | 0,0392 | 0,5077 | 0,9325 | 0,9325 |
| 8 | 0,0182 | 0,5557 | 0,9338 | 0,9338 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos en la información disponible. La validation loss aumenta a partir de la época 2 mientras la accuracy sigue subiendo, lo que sugiere cierto sobreajuste compensado por el early stopping.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,2 GB en fp16 (559,9 M de parámetros) y en torno a 4,5 GB en fp32; el repo ocupa 2,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una NVIDIA T4 (16 GB) es suficiente y fue la usada en entrenamiento. Para lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060, RTX 4090 y similares; también en GPUs de 4-6 GB con fp16.
- Opciones de despliegue: `transformers` con `pipeline`, Hugging Face TGI, vLLM (soporte de clasificación limitado, conviene verificar), ONNX Runtime y TorchScript. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible. Por tamaño y arquitectura, la inferencia por lote en GPU es del orden de milisegundos por ejemplo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jamh4949/xlm-roberta-large-sarcasmo-es | 559,9 M | 514 tokens (entrenado a 128) | Clasificación binaria de sarcasmo en es | no disponible | Hugging Face, 0 descargas |
| FacebookAI/xlm-roberta-large | 559,9 M | 514 tokens | Modelo base multilingüe (MLM) | MIT | Hugging Face, ampliamente usado |
| BETO (bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | Modelo base en español (MLM) | no disponible en la ficha original | Hugging Face |
| Modelos LLM generativos (p. ej. familia Llama/Mistral) prompteados para sarcasmo | miles de millones | 8k-128k tokens | Clasificación zero-shot vía prompting | varía | Hugging Face y APIs |

No se dispone de comparaciones de rendimiento directas con otros clasificadores de sarcasmo en español en la información proporcionada. Frente a XLM-RoBERTa large, este modelo añade la cabeza de clasificación y el ajuste al dominio de titulares; frente a BETO, triplica el tamaño pero hereda el preentrenamiento multilingüe. Frente a LLM generativos, es mucho más ligero y barato de desplegar, aunque limitado a la tarea y al dominio de entrenamiento.

## Limitaciones y advertencias

- El dataset está dominado por titulares de prensa: el modelo aprende en parte el estilo satírico periodístico y puede fallar en sarcasmo conversacional, chats o textos largos.
- Ruido de anotación: hay frases cuya interpretación depende de un contexto ausente, lo que introduce etiquetas erróneas en entrenamiento y validación.
- Métricas ligeramente optimistas: el conjunto de validación se usó también para el early stopping, por lo que el 0,9338 de F1 macro no es una estimación limpia de generalización.
- Sesgo de dominio y de género: al entrenarse con titulares de prensa, puede heredar sesgos temáticos y estilísticos de esas fuentes; no se documenta ningún análisis de sesgo.
- Riesgo de falsos positivos y negativos en textos ambiguos o sin contexto; el modelo no explica sus decisiones.
- Licencia no declarada: no hay autorización explícita para uso comercial, por lo que conviene contactar con el autor antes de integrarlo en producción.
- Ventana de contexto efectiva limitada a 128 tokens durante el entrenamiento; entradas más largas se truncan.
- Modelo de un solo idioma en la práctica (español) y sin mantenimiento documentado; creado y actualizado el mismo día, sin descargas ni validación externa.
- No apto para generación de texto ni para tareas distintas de la clasificación binaria de sarcasmo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jamh4949/xlm-roberta-large-sarcasmo-es
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Documentación de `transformers` (pipeline de clasificación): https://huggingface.co/docs/transformers/main_classes/pipelines
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
