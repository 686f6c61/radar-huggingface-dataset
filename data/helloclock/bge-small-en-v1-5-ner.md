# helloclock/bge-small-en-v1.5-ner

## Resumen

helloclock/bge-small-en-v1.5-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino del modelo de embeddings BAAI/bge-small-en-v1.5, un encoder tipo BERT de 33,2 millones de parámetros desarrollado por el Beijing Academy of Artificial Intelligence (BAAI). Lo publica el usuario helloclock en Hugging Face bajo licencia MIT y pipeline `token-classification`, y está pensado para tareas de etiquetado de secuencias (extracción de entidades) más que para generación de texto.

El modelo resuelve el problema clásico de identificar y clasificar menciones de entidades en texto, con un coste computacional muy bajo: al derivar de un BERT pequeño, puede ejecutarse en CPU y en cualquier GPU consumer. Su relevancia práctica reside en que ofrece un equilibrio razonable entre precisión y huella de memoria para pipelines de procesamiento del lenguaje natural a gran escala, donde el coste por inferencia es un factor crítico.

La model card es mínima y generada automáticamente por el `Trainer` de Hugging Face: no documenta el conjunto de datos, el esquema de etiquetas ni los usos previstos. Los únicos datos de rendimiento disponibles son las métricas de validación del propio entrenamiento (F1 0,9124 y exactitud 0,9810), sin resultados en benchmarks estándar. El modelo acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que no cuenta con validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) con cabeza de clasificación de tokens |
| Parámetros totales | 33.215.625 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base BAAI/bge-small-en-v1.5) |
| Tipos de cuantización | No se publican versiones cuantizadas; pesos en fp32 convertibles a fp16/int8/ONNX |
| Idiomas soportados | no disponible (el modelo base BAAI/bge-small-en-v1.5 es de inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,3 GB, incluye artefactos de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base BAAI/bge-small-en-v1.5: un encoder Transformer tipo BERT de 12 capas con representación densa, al que se le ha añadido una cabeza de clasificación de tokens (`token-classification`) para NER. No hay innovaciones arquitectónicas propias: se trata de un ajuste fino supervisado estándar sobre un checkpoint preentrenado con aprendizaje contrastivo orientado a recuperación (retrieval).

El entrenamiento se realizó con el `Trainer` de Transformers 4.50.0 (PyTorch 2.11.0+cu128, Datasets 3.4.1, Tokenizers 0.21.4), durante 10 épocas, con `learning_rate` 2e-05, `train_batch_size` y `eval_batch_size` de 16, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), scheduler lineal y semilla 42. La model card indica explícitamente que el conjunto de datos de entrenamiento es desconocido ("on an unknown dataset"), y no se documenta composición del dataset, número de tokens, esquema de etiquetas ni si hubo etapas de RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). Tampoco se especifica el número total de pasos de optimización más allá de los 6.250 registrados en la tabla de entrenamiento.

## Capacidades

- Etiquetado de secuencias (NER): clasificación token a token para extraer entidades nombradas de texto en inglés.
- Inferencia discriminativa: no genera texto libre, solo asigna etiquetas a cada token de entrada.
- Integración con el ecosistema Transformers: compatible con `pipeline("token-classification")`, `AutoModelForTokenClassification` y `AutoTokenizer`.
- Compatibilidad con endpoints gestionados: el tag `endpoints_compatible` indica que puede desplegarse en Hugging Face Inference Endpoints.
- Exportación a otros runtimes: al ser un BERT estándar, puede convertirse a ONNX o TorchScript para inferencia optimizada.
- Capacidades multilingües: no disponibles; el modelo base está entrenado únicamente en inglés.
- Tool calling / function calling: no soportado (no es un modelo generativo ni de instrucciones).
- Modo "thinking" o razonamiento multi-paso: no aplicable.
- Visión, audio u otras modalidades: no soportadas.

## Casos de uso

- Extracción de entidades en pipelines de PLN: el modelo etiqueta tokens en lotes de hasta 512 tokens, lo que permite procesar grandes volúmenes de texto (noticias, tickets, reseñas) con un coste por documento muy bajo y en CPU.
- Preprocesamiento para sistemas RAG: extraer nombres de personas, organizaciones y lugares de un corpus para generar metadatos filtrables antes de indexar los documentos en una base vectorial, mejorando la precisión de la recuperación.
- Enrutado automático de tickets de soporte: detectar organizaciones o productos mencionados en un correo entrante y dirigirlo al equipo correspondiente, usando la salida de etiquetas como señal de clasificación.
- Anonimización y seudonimización de texto: localizar menciones potencialmente identificativas en documentos en inglés para aplicar después una sustitución por marcadores, siempre con revisión humana dado que la lista de entidades no está documentada.
- Enriquecimiento de bases de datos y CRM: poblar campos estructurados (nombre de empresa, localidad) a partir de texto libre procedente de correos, contratos o formularios.
- Análisis de documentos financieros o legales en inglés: extracción de partes implicadas y jurisdicciones en contratos y comunicados, dentro del límite de 512 tokens por fragmento.
- Moderación y filtrado de contenido: detección de menciones a entidades concretas para aplicar reglas de moderación o para construir listas de bloqueo.
- Línea base para investigación: dado su tamaño reducido (33,2 M de parámetros), sirve como referencia rápida en experimentos de comparación de arquitecturas de NER, aunque la ausencia de documentación del dataset limita su reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, GLUE, CoNLL-2003, etc.) en la información disponible. La model-index del autor está vacía. Los únicos datos existentes son las métricas de validación registradas durante el propio entrenamiento, sobre un conjunto de evaluación no identificado.

Evolución por época (datos declarados por el autor):

| Época | Paso | Pérdida validación | Precisión | Exhaustividad | F1 | Exactitud |
|---|---|---|---|---|---|---|
| 1,0 | 625 | 0,1742 | 0,7822 | 0,8281 | 0,8045 | 0,9642 |
| 2,0 | 1250 | 0,1146 | 0,8604 | 0,8925 | 0,8762 | 0,9757 |
| 3,0 | 1875 | 0,0930 | 0,8626 | 0,9101 | 0,8857 | 0,9772 |
| 4,0 | 2500 | 0,0873 | 0,8803 | 0,9162 | 0,8979 | 0,9797 |
| 5,0 | 3125 | 0,0846 | 0,8877 | 0,9208 | 0,9040 | 0,9799 |
| 6,0 | 3750 | 0,0810 | 0,8874 | 0,9230 | 0,9048 | 0,9804 |
| 7,0 | 4375 | 0,0826 | 0,8947 | 0,9232 | 0,9087 | 0,9807 |
| 8,0 | 5000 | 0,0832 | 0,8977 | 0,9254 | 0,9113 | 0,9809 |
| 9,0 | 5625 | 0,0832 | 0,8994 | 0,9257 | 0,9124 | 0,9807 |
| 10,0 | 6250 | 0,0831 | 0,8998 | 0,9254 | 0,9124 | 0,9810 |

Métricas finales sobre el conjunto de evaluación: pérdida 0,0831; precisión 0,8998; exhaustividad 0,9254; F1 0,9124; exactitud 0,9810. Conviene subrayar que la exactitud es poco informativa en NER, ya que la mayoría de tokens tienen etiqueta `O`; el F1 es la métrica relevante.

## Requisitos de hardware

- VRAM estimada: en fp32 el modelo ocupa aproximadamente 133 MB (33,2 M de parámetros × 4 bytes); en fp16 unos 66 MB; en int8 unos 33 MB. Los requisitos reales de memoria vendrán dominados por el tamaño de lote y la longitud de secuencia.
- Ejecución en CPU: perfectamente viable para inferencia por lotes; no requiere GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, T4, L4, A10G, A100, H100). El cuello de botella será el preprocesado y el ancho de banda, no la memoria.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna, e incluso en hardware integrado.
- Opciones de despliegue: `transformers` (pipeline de token-classification), ONNX Runtime, TorchScript, TorchServe o FastAPI con el modelo cargado, y Hugging Face Inference Endpoints (el repositorio incluye el tag `endpoints_compatible`). vLLM, llama.cpp y Ollama no están orientados a token classification de encoders BERT y no son opciones adecuadas para este modelo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Etiquetas | Licencia | F1 |
|---|---|---|---|---|---|
| helloclock/bge-small-en-v1.5-ner | BERT-small + cabeza de clasificación de tokens | 33,2 M | no documentadas | MIT | 0,9124 (conjunto de evaluación no publicado) |
| dslim/bert-base-NER | BERT-base-cased | ~108 M | PER, ORG, LOC, MISC | MIT | ≈0,92 en CoNLL-2003 (declarado por el autor) |
| Jean-Baptiste/roberta-large-ner-english | RoBERTa-large | ~355 M | PER, ORG, LOC, MISC | MIT | no disponible en la información consultada |
| BAAI/bge-small-en-v1.5 | BERT-small para embeddings | ~33 M | no aplica (no es NER) | MIT | no aplica |

Advertencia: los valores de F1 proceden de conjuntos de evaluación distintos y no son directamente comparables. La información disponible no permite afirmar que este modelo supere o iguale a las alternativas en un benchmark común. Como referencia de tamaño, el modelo aquí descrito es aproximadamente 3,2 veces más pequeño que `dslim/bert-base-NER` y 10,7 veces más pequeño que `Jean-Baptiste/roberta-large-ner-english`.

## Limitaciones y advertencias

- Model card incompleta: el autor deja "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento. No se puede reproducir el experimento ni auditar el modelo.
- Esquema de etiquetas desconocido: no se especifica qué tipos de entidad detecta (persona, organización, localización u otros), lo que impide saber si la salida se ajusta a un caso de uso concreto sin probarlo antes.
- Conjunto de evaluación no identificado: las métricas reportadas no son comparables con CoNLL-2003 ni con otros benchmarks públicos, por lo que el F1 de 0,9124 debe tomarse con cautela.
- Idioma: el modelo base BAAI/bge-small-en-v1.5 está entrenado en inglés, de modo que su uso en castellano u otros idiomas no está respaldado y probablemente degradará de forma severa.
- Límite de contexto: 512 tokens por secuencia. Los documentos largos requieren fragmentación con solapamiento, lo que puede partir entidades y generar duplicados en los bordes.
- Riesgo de falsos positivos y de entidades mal tipificadas: como cualquier modelo discriminativo, puede etiquetar incorrectamente tokens ambiguos; no existe mecanismo de abstención ni de calibración de confianza documentado.
- Sesgos: se heredan del corpus de ajuste fino, que es desconocido. No se ha realizado ningún análisis de sesgo publicado.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, pero se ofrece sin garantía alguna y el usuario asume todo el riesgo. Al derivar de BAAI/bge-small-en-v1.5 (también MIT), no se añaden restricciones adicionales conocidas.
- Falta de validación comunitaria: con 0 descargas y 0 "likes", no hay evidencia externa de calidad ni informes de fallos en producción.
- No es un modelo generativo: no debe utilizarse para resúmenes, chat, generación de código ni tareas de instrucciones; su salida es un conjunto de etiquetas por token.
- Uso en producción con datos personales: si se emplea para anonimización, requiere verificación humana, ya que un fallo de exhaustividad implica dejar datos personales sin tratar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helloclock/bge-small-en-v1.5-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo anterior de la familia BAAI/bge-small-en: https://huggingface.co/BAAI/bge-small-en
- Repositorio FlagEmbedding de BAAI: https://github.com/FlagOpen/FlagEmbedding
- Ficha de referencia en Model Database: https://modeldatabase.com/BAAI/bge-small-en-v1.5.html
- Ficha de referencia en Vincony: https://vincony.com/models/bge-bge-small-en-v1.5
- Ficha de referencia en OpenSourcesAI: https://opensourcesai.com/models/bge-small-en-v1-5/
