# Pradyumna9195/hw1-hc3-detector

## Resumen

El modelo `Pradyumna9195/hw1-hc3-detector` es un clasificador binario de texto en inglés que distingue respuestas escritas por personas de respuestas generadas por ChatGPT. Se trata de un ajuste fino (*fine-tuning*) de `sentence-transformers/all-MiniLM-L6-v2`, un encoder de la familia BERT de 22.713.986 parámetros, sobre el corpus HC3 (Human ChatGPT Comparison Corpus). La tarea concreta es de clasificación de secuencias con dos etiquetas: `0` para humano y `1` para ChatGPT.

El modelo se publica como un ejercicio académico (Homework 1) y su relevancia es doble: por un lado, documenta de forma muy transparente el proceso de preparación de datos, partición y entrenamiento; por otro, sirve como referencia metodológica de hasta qué punto un clasificador pequeño puede sobreajustar un benchmark histórico concreto. El autor reporta una exactitud de 0,998072 en el conjunto de test del propio corpus, muy superior al baseline de embeddings congelados más regresión logística (0,844901).

Conviene subrayar que no es un detector de IA de propósito general: es un clasificador de dominio específico entrenado sobre un único corpus, con una ventana de contexto de 256 tokens y entrenado únicamente en inglés. El propio autor advierte en la model card que los resultados no demuestran detección fiable de generadores más recientes, texto editado, otros dominios o trabajos de estudiantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6), con cabeza de clasificación de secuencias de 2 clases |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia usada en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas oficiales; admite cuantización dinámica de PyTorch y exportación a ONNX con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 (revisión `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 13 descargas, 1 like |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia BERT, concretamente MiniLM-L6, inicializado desde `sentence-transformers/all-MiniLM-L6-v2`. Sobre el encoder se monta un `AutoModelForSequenceClassification` con dos clases de salida. Todos los parámetros del modelo se entrenan (no hay congelación de capas) durante cinco épocas con el optimizador AdamW, tasa de aprendizaje 2e-5, tamaño de lote 32, longitud máxima de secuencia 256 y *dynamic padding*. El entrenamiento se ejecutó sobre Apple MPS. La pérdida media de entrenamiento reportada es de 0,022050.

En cuanto a los datos, la función de preparación descrita en la model card selecciona la primera respuesta no vacía de cada clase, elimina pares de pregunta inválidos o duplicados y divide los identificadores de pregunta normalizados en 80/10/10 con semilla 42 antes de aplanar las respuestas. El resultado son 23.334 pares de pregunta, con 37.334 respuestas de entrenamiento, 4.666 de validación y 4.668 de test, cada partición balanceada. El clasificador usa únicamente el texto de la respuesta como entrada. La partición de validación se reservó pero no se usó para selección de checkpoint: se evalúa el checkpoint final. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo.

## Capacidades

- Clasificación binaria de texto: asigna la etiqueta `0` (humano) o `1` (ChatGPT) a una respuesta en inglés.
- Clasificación de respuestas de pregunta-respuesta, que es el formato exacto del corpus HC3 con el que fue entrenado.
- Inferencia sobre fragmentos de hasta 256 tokens, con truncación automática del tokenizador.
- Ejecución en CPU: con 22,7 millones de parámetros, la inferencia es viable sin GPU.
- Integración nativa con la librería `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Capacidad de servir como extractor de características (embeddings del encoder) para tareas auxiliares, dado que deriva de un modelo de sentence-transformers, aunque esto no se ha validado en la model card.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador, no un modelo generativo.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en inglés.

## Casos de uso

- Filtrado de respuestas en estudios sobre generación automática de texto: dado un conjunto de respuestas etiquetadas por procedencia dudosa, el modelo permite separar rápidamente las que se parecen estadísticamente a ChatGPT de las que se parecen a respuestas humanas, como paso previo a una revisión manual.
- Reproducción de resultados académicos: sirve como referencia para replicar el experimento de la asignatura o del paper HC3, comparando el ajuste fino completo frente al baseline de embeddings congelados más regresión logística.
- Análisis de corpus históricos de ChatGPT: para investigaciones que necesiten etiquetar grandes volúmenes de texto recogidos en la misma ventana temporal que HC3 (finales de 2022 y principios de 2023), el modelo ofrece una etiqueta automática de bajo coste computacional.
- Prototipado rápido en CPU: al ocupar 0,1 GB y requerir solo 256 tokens de contexto, se puede desplegar en un contenedor pequeño o incluso en un portátil para experimentos de clasificación en tiempo real.
- Componente de un pipeline de anotación semiautomática: el clasificador puede preetiquetar respuestas y derivar a revisión humana solo los casos con probabilidad cercana a 0,5, reduciendo el coste de anotación manual.
- Docencia y formación en NLP: es un ejemplo compacto y bien documentado de un ciclo completo de fine-tuning (preparación de datos, partición, entrenamiento, evaluación con matriz de confusión) apto para prácticas de laboratorio.
- Comparación metodológica de estrategias de detección: permite contrastar empíricamente un clasificador entrenado específicamente sobre HC3 frente a enfoques de embeddings congelados, usando las mismas particiones y métricas.

Advertencia importante: ninguno de estos usos debería emplearse para acusar a una persona de haber usado IA. El propio autor indica que las predicciones no deben tratarse como prueba de autoría.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los del conjunto de test interno del corpus HC3, reportados por el autor.

| Modelo | Accuracy | Macro F1 | Respuestas incorrectas |
|---|---:|---:|---:|
| Embeddings de frase congelados + regresión logística | 0,844901 | 0,844882 | 724 |
| Transformer con ajuste fino (este modelo) | 0,998072 | 0,998072 | 9 |

Matrices de confusión (filas = etiqueta real, columnas = etiqueta predicha, orden `[humano, ChatGPT]`):

| Modelo | Matriz de confusión |
|---|---|
| Baseline | `[[1946, 388], [336, 1998]]` |
| Ajuste fino | `[[2328, 6], [3, 2331]]` |

Pérdida media de entrenamiento: 0,022050. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K u otros) en la información disponible; tampoco proceden, dado que el modelo es un clasificador y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 91 MB solo de pesos (22,7 millones de parámetros x 4 bytes), más activaciones, del orden de 0,2-0,5 GB en total con lotes pequeños y secuencias de 256 tokens.
- VRAM estimada en fp16: aproximadamente 45 MB de pesos, con picos de memoria muy inferiores a 1 GB.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria sirve; el modelo es holgadamente suficiente en RTX 3060, RTX 4090, T4, A100 o H100, aunque no se aprovechan estas GPU por el reducido tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Cabe en CPU: sí, es el escenario natural de despliegue; el entrenamiento original se hizo sobre Apple MPS.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX Runtime, TorchScript y cuantización dinámica de PyTorch. No se publican artefactos GGUF ni soporte específico para vLLM, TGI o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Con 22,7 millones de parámetros y 256 tokens de entrada, se espera una latencia de milisegundos por lote en CPU moderna, pero se trata de una estimación, no de un dato medido publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en HC3 (test propio) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Pradyumna9195/hw1-hc3-detector | 22,7 M | 256 tokens | 0,998072 | no disponible | HuggingFace |
| Aishkrish/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| HongjiP/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | referenciado en savrn.com |
| Baseline de embeddings congelados + regresión logística | no disponible | no disponible | 0,844901 | no disponible | resultados reportados en la model card |

Los tres primeros son variantes del mismo ejercicio con idéntico nombre de repositorio, lo que sugiere que comparten tarea y corpus, pero no se dispone de sus especificaciones ni de sus métricas. No se han identificado en la búsqueda web alternativas de la misma categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Detección de dominio específico: el modelo se entrenó y evaluó sobre HC3, un corpus concreto recogido en un periodo concreto. No hay evidencia de que generalice a otros generadores, a versiones posteriores de ChatGPT, a texto editado o a otros dominios.
- Sesgo hacia artefactos de recolección: el propio autor advierte que el modelo puede aprender artefactos de formato y de recopilación del corpus en lugar de rasgos genuinos de autoría.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo equivalente de falsos positivos y falsos negativos con consecuencias reales si se usa para acusar a alguien.
- Uso como prueba de autoría: explícitamente desaconsejado por el autor. Las predicciones no deben tratarse como prueba de autoría ni usarse en contextos disciplinarios o académicos.
- Limitación de contexto: 256 tokens; las respuestas más largas se truncan, lo que puede degradar la clasificación.
- Limitación de idioma: solo inglés. No hay evaluación en castellano ni en ningún otro idioma.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso para uso comercial. Conviene contactar con el autor antes de cualquier uso en producción.
- Métricas poco realistas: una exactitud de 0,998 sobre un test in-domain balanceado no es extrapolable a un escenario real con distribución distinta.
- Sin selección de checkpoint por validación: el autor indica que la partición de validación se reservó pero no se usó para elegir el mejor checkpoint, lo que refuerza la sospecha de sobreajuste al conjunto de test.
- Procedencia: se trata de un modelo de ejercicio académico, sin revisión por pares ni evaluación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pradyumna9195/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper de referencia: Guo et al. (2023), *How Close is ChatGPT to Human Experts? Comparison Corpus, Evaluation, and Detection*, https://arxiv.org/abs/2301.07597
- Variante con el mismo nombre en HuggingFace: https://huggingface.co/Aishkrish/hw1-hc3-detector
- Variante con el mismo nombre en HuggingFace: https://huggingface.co/HongjiP/hw1-hc3-detector
- Entrada de registro de la variante Yihangsun: https://savrn.com/models/hw1-hc3-detector
- Entrada de registro adicional: https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
