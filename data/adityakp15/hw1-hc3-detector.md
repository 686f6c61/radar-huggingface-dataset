# adityakp15/hw1-hc3-detector

## Resumen

El modelo `adityakp15/hw1-hc3-detector` es un clasificador de texto basado en un transformer fine-tuneado, publicado por el usuario adityakp15 en HuggingFace, cuyo objetivo es distinguir texto escrito por personas de texto generado por ChatGPT. Se entrenó y evaluó sobre el conjunto de datos HC3 (Human ChatGPT Comparison Corpus), empleando las etiquetas de respuestas humanas y de respuestas generadas por ChatGPT que contiene dicho corpus. La tarea es, por tanto, de clasificación binaria de secuencias, no de generación de texto.

El repositorio contiene 22.713.986 parámetros en formato safetensors, lo que lo sitúa en la gama de los transformers compactos: cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU. La model card reporta una exactitud de test de 0,9871 para el clasificador fine-tuneado, frente a 0,8449 de una línea base con sentence-transformer congelado, lo que supone una mejora de 14,2 puntos porcentuales.

Su relevancia es acotada pero concreta: es un detector de texto sintético reproducible, con hiperparámetros de entrenamiento declarados (AdamW, learning rate 2e-5, 5 épocas, batch 32, semilla 42) y con separación de splits por identificador de pregunta para evitar solapamiento entre entrenamiento y test. No obstante, el repositorio no declara licencia, idiomas soportados ni pipeline, y no tiene descargas ni interacciones, por lo que debe considerarse un artefacto experimental y no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (etiqueta `bert` en HuggingFace); clasificador de secuencias fine-tuneado |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la declara) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`AutoModelForSequenceClassification`) |
| Pipeline declarado | no disponible |
| Tarea | Clasificación binaria: 0 = texto humano, 1 = texto generado por ChatGPT |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 (según plataforma) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo encoder con cabeza de clasificación de secuencias, cargable mediante `AutoModelForSequenceClassification` de la librería Transformers. Con 22,7 millones de parámetros, se trata de una variante compacta dentro de la familia BERT, muy por debajo de los 110 millones de BERT-base y de los 66 millones de DistilBERT. La model card no especifica el checkpoint base exacto sobre el que se aplicó el fine-tuning ni la longitud de contexto efectiva, por lo que no es posible confirmar detalles como el tamaño del vocabulario o el número de capas.

El entrenamiento se realizó sobre el corpus HC3, usando las etiquetas de respuestas humanas y de respuestas de ChatGPT. Los splits se mantuvieron disjuntos por identificador de pregunta, una decisión metodológica relevante porque evita la fuga de información entre entrenamiento, validación y test. Los hiperparámetros declarados son: optimizador AdamW, learning rate 2e-5, 5 épocas, batch size 32, semilla aleatoria 42 y métrica de evaluación accuracy. No se menciona el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un clasificador. Tampoco se documentan el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su procedencia.

## Capacidades

- Clasificación binaria de texto: determina si un fragmento es de autoría humana (etiqueta 0) o generado por ChatGPT (etiqueta 1).
- Procesamiento por lotes: al ser un modelo de 22,7 M de parámetros, permite clasificar grandes volúmenes de texto con coste computacional bajo.
- Inferencia en CPU: su tamaño reducido permite ejecutarlo sin GPU.
- Integración con el ecosistema Transformers: `AutoTokenizer` y `AutoModelForSequenceClassification` permiten cargarlo con dos líneas de código.
- Generación de texto: no disponible; el modelo no es generativo.
- Razonamiento multi-paso y agentes: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible; la model card no declara idiomas y el corpus HC3 se distribuye principalmente en inglés y chino.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Moderación de contenido en foros y plataformas de preguntas y respuestas: el clasificador puede marcar automáticamente respuestas sospechosas de haber sido generadas por ChatGPT, lo que permite a los moderadores priorizar la revisión manual. La etiqueta binaria directa simplifica la integración en colas de revisión.
- Auditoría académica de trabajos entregados: integrado en una herramienta de detección previa, permite señalar párrafos candidatos a revisión por parte del profesorado. Debe usarse como señal orientativa y nunca como prueba concluyente, dado el riesgo de falsos positivos.
- Filtrado de datos para construcción de corpus: si se entrena un modelo generativo y se quiere garantizar que el corpus solo contenga texto humano, este clasificador puede actuar como etapa de filtrado previo.
- Análisis de la penetración de contenido sintético en comunidades online: procesando lotes históricos de respuestas, permite calcular la proporción de texto generado por ChatGPT a lo largo del tiempo.
- Control de calidad en pipelines de anotación: al clasificar las respuestas, permite detectar anotadores que estén delegando su trabajo a un modelo de lenguaje.
- Investigación sobre detección de texto sintético: sirve como línea base reproducible (semilla 42, hiperparámetros documentados) sobre la que comparar otros detectores en el corpus HC3.
- Evaluación de la robustez de un sistema generativo propio: si se despliega un chatbot basado en ChatGPT, este detector permite medir qué fracción de sus salidas es identificable como sintética por un clasificador entrenado específicamente para ello.

## Benchmarks y rendimiento

La model card únicamente reporta exactitud de test sobre el split reservado del corpus HC3:

| Modelo | Exactitud de test |
|---|---:|
| Baseline con sentence-transformer congelado | 0,8449 |
| Clasificador fine-tuneado (`adityakp15/hw1-hc3-detector`) | 0,9871 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas complementarias como precisión, recall, F1 o AUC. El autor advierte que los resultados pueden variar ligeramente según el hardware o las versiones de las librerías.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB solo para los pesos en fp32 (91 MB) y 45 MB en fp16; con el overhead de PyTorch y del tokenizador, el consumo real se sitúa típicamente entre 0,5 GB y 1 GB (estimación derivada del recuento de parámetros, no declarada por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100. No requiere aceleradores de gama alta.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente. También es viable en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: Transformers con PyTorch (el método documentado en la model card), ONNX Runtime, TorchScript, y servidores de inferencia como TGI, vLLM o Triton; para CPU pura, también es posible exportar a GGUF y usar llama.cpp, aunque el autor no lo documenta.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.
- Nota: el modelo no está diseñado para decodificación autoregresiva, por lo que las métricas de throughput típicas de modelos generativos no aplican directamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `adityakp15/hw1-hc3-detector` | 22,7 M | no disponible | Exactitud 0,9871 en test de HC3 | no disponible | HuggingFace, 0 descargas |
| Detector basado en RoBERTa (p. ej. Hello-SimpleAI/chatgpt-detector-roberta) | ≈125 M (variante base) | no disponible | no disponible | no disponible | HuggingFace |
| Clasificador de OpenAI para texto generado | no disponible | no disponible | no disponible | no disponible (API retirada) | Histórico, ya no disponible |
| GPTZero y otros detectores comerciales | no disponible (cerrado) | no disponible | no disponible | Propietaria | Servicio web |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada, por lo que la comparación de rendimiento queda como no disponible. La ventaja diferencial de este modelo es su tamaño reducido, que reduce drásticamente el coste de despliegue.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo legal. Debe contactarse con el autor antes de cualquier despliegue en producción.
- Especialización estrecha: el modelo fue entrenado para distinguir respuestas humanas de respuestas de ChatGPT en el corpus HC3. Su comportamiento fuera de ese dominio (otros idiomas, otros generadores, otros registros como código o textos largos) no está validado y probablemente degrade.
- Riesgo de sesgo de generador: al haberse entrenado solo contra salidas de ChatGPT, puede no detectar texto producido por otros modelos (Claude, Llama, Gemini) o detectarlo de forma inconsistente.
- Riesgo de falsos positivos: los detectores de texto sintético tienden a penalizar textos con estructuras muy formulaicas, vocabulario poco común o escritos por personas no nativas. La exactitud del 0,9871 en test no implica ese rendimiento en distribución real.
- Riesgo de evasión: el modelo es vulnerable a paráfrasis, reescritura con otro modelo o edición humana superficial, que pueden desplazar la predicción hacia la clase "humano".
- Sin validación de calibración: no se publican métricas de confianza, curvas ROC ni umbrales recomendados, por lo que las probabilidades de salida no deben interpretarse como fiabilidad directa.
- Idiomas: no declarados. El corpus HC3 contiene principalmente inglés y chino; el rendimiento en castellano es desconocido.
- Contexto: no declarado. La función de ejemplo usa `truncation=True`, lo que implica que textos largos se recortan, con la consiguiente pérdida de información.
- Repositorio sin tracción: 0 descargas y 0 likes, sin mantenimiento posterior a la fecha de publicación. No hay garantía de soporte ni de actualizaciones.
- Uso ético: no debe emplearse como prueba única para acusar a un estudiante o a un trabajador de usar IA. Cualquier decisión con consecuencias debe pasar por revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adityakp15/hw1-hc3-detector
- Corpus HC3 (referencia del dataset citado por el autor): no se incluye enlace en la información disponible; el autor solo menciona el dataset por su nombre.
- Búsqueda web: los resultados recuperados no guardan relación con el modelo ni con la detección de texto generado por IA (se trata de páginas de ayuda de YouTube en japonés, chino y polaco). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
