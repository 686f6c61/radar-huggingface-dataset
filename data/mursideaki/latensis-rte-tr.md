# mursideaki/latensis-rte-tr

## Resumen

Latensis RTE es un modelo de inferencia textual (recognizing textual entailment, RTE) en turco desarrollado por Mürşide Aki dentro de la suite Latensis. Se trata de un clasificador binario de arquitectura RoBERTa, obtenido mediante un ajuste en dos etapas sobre Latensis RoBERTa Base, un encoder entrenado desde cero con aproximadamente 1 GB de texto turco y un tokenizador SentencePiece unigram de 128.000 tokens diseñado específicamente para la morfología del turco.

El modelo resuelve la tarea de determinar si una hipótesis se deduce de una premisa, con dos etiquetas posibles: entailment y not_entailment. Cuenta con 184.347.650 parámetros (pesos en safetensors, repositorio de 0,7 GB) y una ventana de entrada de 256 tokens en el ejemplo de referencia.

Su interés radica en que un pipeline de dos fases (preentrenamiento NLI con 50.000 ejemplos y fine-tuning RTE con 3.784) supera, según los datos publicados por el autor, a BERTurk NLI sobre el test de TrGLUE RTE pese a haberse entrenado con cerca de diez veces menos datos NLI. La licencia MIT y su tamano compacto lo hacen desplegable en hardware modesto, aunque su alcance se limita al idioma turco y a la clasificación de pares de frases.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) con cabeza de clasificación de secuencias |
| Parámetros totales | 184.347.650 (~184 M) |
| Longitud de contexto | No disponible como máximo arquitectural; el ejemplo de la model card emplea MAX_LENGTH = 256 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Tokenizador | Hecemen Unigram 128k (SentencePiece) |
| Tarea | Clasificación de texto (NLI/RTE, 2 etiquetas) |
| Etiquetas | 0: not_entailment; 1: entailment |
| Autor | Mürşide Aki (mursideaki) |

## Arquitectura y entrenamiento

La base del modelo es Latensis RoBERTa Base, un encoder tipo RoBERTa entrenado desde cero sobre aproximadamente 1 GB de texto turco curado, con 500.000 pasos de entrenamiento, una pérdida de validación de 3,21 y una perplejidad de 25. El tokenizador asociado es Hecemen Unigram 128k, un vocabulario unigram de 128.000 piezas diseñado para la morfología aglutinante del turco, lo que explica que los 184 M de parámetros superen a los de un RoBERTa base convencional: buena parte del presupuesto se concentra en la matriz de embeddings.

Sobre esa base se aplica un ajuste en dos etapas. La primera es un preentrenamiento NLI con 50.000 ejemplos del conjunto emrecan/all-nli-tr. La segunda es un fine-tuning específico de RTE con 3.784 ejemplos de TrGLUE RTE, con tasa de aprendizaje 4e-6, tamaño de lote 16 y 8 épocas (mejor resultado en la época 7). El formato de entrada documentado concatena BOS + frase 1 + EOS + frase 2 + EOS, con truncado y relleno hasta 256 tokens. No se menciona en la información disponible el uso de RLHF, DPO ni de técnicas de decodificación especulativa; tampoco se detalla la composición completa del corpus de preentrenamiento de la base.

## Capacidades

- Clasificación binaria de inferencia textual en turco: devuelve entailment o not_entailment para un par premisa-hipótesis.
- Detección de implicación lógica entre frases, aprovechable como componente de verificación factual o de detección de contradicciones.
- Procesamiento de pares de frases con una plantilla de entrada explícita (BOS/EOS) y enmascaramiento de atención y relleno.
- Entrada de hasta 256 tokens según el ejemplo de referencia de la model card.
- No es un modelo generativo: no produce texto libre, resúmenes ni respuestas conversacionales.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: no; el modelo está declarado únicamente para turco.

## Casos de uso

- Verificación factual en pipelines de RAG en turco: dado un contexto recuperado y una afirmación generada por un LLM, el modelo clasifica si la afirmación se deduce del contexto, lo que permite descartar respuestas no sustentadas antes de mostrarlas al usuario.
- Detección de contradicciones en resúmenes automáticos: comparar cada frase del resumen con el documento original para marcar afirmaciones que no se derivan del texto fuente.
- Control de calidad en atención al cliente: verificar que la respuesta propuesta por un sistema automático no contradice la política o la documentación interna de la empresa, usando pares (documento, respuesta) como entrada.
- Evaluación de sistemas de traducción o de reformulación: medir la fidelidad semántica entre la frase de origen y su versión reescrita mediante la etiqueta de implicación.
- Reranking en búsqueda semántica: ante un par pregunta-respuesta, usar la probabilidad de entailment como señal de relevancia para reordenar candidatos recuperados por un buscador vectorial.
- Anotación asistida de corpus NLI turcos: preetiquetar grandes volúmenes de pares de frases y reservar la revisión humana para los casos de baja confianza, reduciendo el coste de construcción de datasets.
- Coherencia de bases de conocimiento y FAQ: detectar respuestas duplicadas o mutuamente inconsistentes comparando pares de entradas de la misma base documental.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el conjunto de test de TrGLUE RTE (1.000 ejemplos):

| Métrica | Latensis RTE | BERTurk NLI |
|---|---|---|
| Accuracy | 0,7960 | 0,7780 |
| F1-macro | 0,7959 | 0,7770 |
| Ejemplos NLI de entrenamiento | 50.000 | 482.000 |

El autor indica que BERTurk NLI se entrenó con 482.000 ejemplos NLI, frente a los 50.000 usados en la primera etapa de Latensis RTE. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que por otra parte no son aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,74 GB en FP32 y 0,37 GB en FP16 solo para los pesos; con activaciones y lotes moderados, el consumo realista se sitúa en el rango de 1 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria, como GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida para inferencia de baja concurrencia.
- CPU: la inferencia en CPU es viable para lotes pequeños o moderados dado el tamano del modelo.
- Opciones de despliegue: Transformers (PyTorch) de forma nativa, exportación a ONNX Runtime o TorchScript para servir en producción. vLLM y TGI están orientados a modelos generativos y no son el cauce habitual para un clasificador encoder de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TrGLUE RTE accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Latensis RTE (mursideaki/latensis-rte-tr) | 184 M | No disponible (256 en el ejemplo) | 0,7960 | MIT | Hugging Face |
| BERTurk NLI | No disponible | No disponible | 0,7780 | No disponible | Hugging Face (referenciado en la model card) |
| Latensis RoBERTa Base | No disponible | No disponible | No evaluado en RTE | MIT (según la suite Latensis) | Hugging Face |

La información disponible solo permite la comparación directa con BERTurk NLI, que es el único modelo con cifras publicadas en la propia model card. No se dispone de datos de otros clasificadores RTE en turco para ampliar la comparativa.

## Limitaciones y advertencias

- Cobertura lingüística restringida al turco; no se declara soporte para otras lenguas.
- Modelo puramente discriminativo: no genera texto ni ofrece explicaciones de su decisión, solo una etiqueta binaria.
- El fine-tuning de RTE se realizó con 3.784 ejemplos, un volumen reducido que aumenta el riesgo de sobreajuste al dominio y al formato de TrGLUE.
- No se especifica si existe solapamiento entre los datos de entrenamiento y el conjunto de test de TrGLUE utilizado para reportar resultados, lo que impide descartar una evaluación optimista.
- El repositorio registra 0 descargas y 0 interacciones en el momento de la consulta, por lo que no existe validación independiente de la comunidad ni reproducción externa de las cifras.
- No se publican análisis de sesgos, robustez ante dominios distintos ni comportamiento ante entradas adversarias.
- La longitud de entrada empleada en el ejemplo es de 256 tokens; textos más largos se truncan, lo que puede eliminar la información necesaria para decidir la implicación.
- Riesgo de errores en casos de implicación parcial, negación compleja, cuantificadores o conocimiento del mundo no presente en la premisa, algo intrínseco a la tarea NLI.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento de terceros (emrecan/all-nli-tr y TrGLUE) antes de un despliegue en producción.
- El modelo se publica con fecha de 2026, por lo que se trata de un lanzamiento muy reciente y sin recorrido de uso documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mursideaki/latensis-rte-tr
- Modelo base: https://huggingface.co/mursideaki/latensis-roberta-base-tr
- Tokenizador: https://huggingface.co/mursideaki/hecemen-tokenizer-unigram-128k
- Modelo de sentimiento: https://huggingface.co/mursideaki/latensis-sentiment-tr
- Modelo de NER: https://huggingface.co/mursideaki/latensis-ner-tr
- Modelo de STS: https://huggingface.co/mursideaki/latensis-sts-tr
- Perfil del autor en Hugging Face: https://huggingface.co/mursideaki
- Perfil del autor en GitHub: https://github.com/mursideaki
- Publicación de presentación de la suite Latensis: https://tr.linkedin.com/posts/m%C3%BCr%C5%9Fide-aki-7803602a3_nlp-turkishnlp-opensource-activity-7483944338415341568-Vd4Z
