# ania3000/ossbert-morph-v2.1

## Resumen
ossbert-morph-v2.1 es un modelo de clasificación de tokens (token classification) derivado de un ajuste fino sobre el checkpoint AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs, un encoder de tipo BERT. Lo publica el usuario ania3000 en HuggingFace y su nomenclatura ("morph") apunta a tareas de etiquetado morfológico o lingüístico a nivel de token, aunque la propia model card no describe el conjunto de datos de entrenamiento ("unknown dataset") ni los usos previstos.

El modelo cuenta con 177.631.199 parámetros, un tamaño coherente con variantes multilingües de BERT, y se distribuye en formato safetensors bajo licencia Apache 2.0. No declara idiomas soportados, no incluye resultados de benchmarks en su model-index y registra 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un modelo de nicho con poca validación externa.

Su relevancia actual es limitada y acotada a experimentos de etiquetado de secuencias en entornos de investigación. La información pública disponible es escasa: la model card se generó automáticamente y deja sin cubrir las secciones de descripción, datos de entrenamiento y limitaciones, por lo que cualquier evaluación rigurosa requiere reproducir las métricas de validación declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo BERT (bidireccional) |
| Parametros totales | 177.631.199 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es un transformer encoder bidireccional de tipo BERT, heredado del modelo base AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs, que a su vez parte de un modelo multilingüe. Con 177,6 millones de parámetros, el tamaño encaja con las variantes multilingües de BERT (aproximadamente 178 M de parámetros), lo que sugiere un vocabulario multilingüe amplio, si bien este extremo no se confirma en la documentación.

El ajuste fino se realizó con el Trainer de HuggingFace durante 25 épocas, con learning rate 5e-05, batch de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08) y scheduler lineal. Se desconoce la composición del dataset de entrenamiento, el número de tokens y si hubo etapas de RLHF o DPO, algo poco habitual en modelos de clasificación de tokens. No se documenta ninguna innovación técnica destacable (atención lineal, decodificación especulativa u otras).

## Capacidades
- Clasificación de tokens (token classification): etiquetado a nivel de token, presumiblemente morfológico o lingüístico segun la nomenclatura del modelo, aunque la tarea exacta no se documenta.
- Salida de etiquetas por token, adecuada para tareas de secuencias etiquetadas (POS tagging, NER, anotación morfológica u otras similares).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe explícita, pese a que el modelo base es de origen multilingüe.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).
- Metricas declaradas por el autor: accuracy a nivel de token y "sentence accuracy", lo que sugiere una evaluación parcialmente a nivel de secuencia.

## Casos de uso
- Anotación morfológica automática de corpus: el modelo puede pre-etiquetar grandes volúmenes de texto para acelerar el trabajo de lingüistas, revisando después las anotaciones de forma manual.
- Preprocesado para pipelines de PLN: uso como componente de etiquetado de tokens (por ejemplo, POS tagging) previo a sistemas de análisis sintáctico o de extracción de información.
- Detección de entidades y estructuras lingüísticas: si la tarea entrenada es afín, puede emplearse para etiquetar secuencias en tareas de reconocimiento de entidades u otras anotaciones a nivel de token.
- Generación de datasets etiquetados: servir como etiquetador débil para crear conjuntos de datos de entrenamiento a gran escala sobre los que después se ajusten modelos más específicos.
- Investigación académica en morfología computacional: reproducción de experimentos de etiquetado de secuencias sobre el modelo base OSSBERT y comparación de resultados.
- Servicio interno de anotación: desplegado detrás de una API con la pipeline de token-classification de transformers para dar soporte a herramientas de etiquetado colaborativo.
- Filtrado y clasificación por token en dominios concretos: siempre que se valide previamente sobre datos del dominio, ya que no se documenta el conjunto de entrenamiento original.

## Benchmarks y rendimiento
El model-index del autor no declara resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros); la lista de resultados está vacía. No se han publicado resultados de benchmarks estándar en la información disponible.

Las únicas cifras de rendimiento son las métricas de evaluación declaradas por el autor durante el entrenamiento (epoch 19, última registrada): Loss 0,3005, Accuracy 96,1278 y Sentence accuracy 63,3028. La evolución por épocas se recoge en la siguiente tabla (extracto representativo):

| Epoca | Training loss | Validation loss | Accuracy | Sentence accuracy |
|---|---|---|---|---|
| 1,0 | 0,9799 | 0,3471 | 92,2180 | 41,6514 |
| 5,0 | 0,1013 | 0,2131 | 95,5890 | 58,1651 |
| 10,0 | 0,0273 | 0,2629 | 95,7895 | 60,5505 |
| 14,0 | 0,0086 | 0,2731 | 96,1529 | 63,4862 |
| 19,0 | 0,0034 | 0,3005 | 96,1278 | 63,3028 |

Se observa sobreajuste a partir de la época 14 aproximadamente: la pérdida de entrenamiento sigue bajando mientras la de validación repunta y la accuracy se estanca.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 710 MB en FP32, unos 355 MB en FP16/BF16 y unos 178 MB en INT8 (cálculos a partir de los 177,6 M de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4070, RTX 4090, A100 o H100. No requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: pipeline de token-classification de transformers, exportación a ONNX Runtime o TorchScript para servir con FastAPI; el repo ocupa 13,5 GB, probablemente por checkpoints y estados del optimizador, pero el peso de inferencia útil es de unos cientos de MB. No se distribuye en GGUF, por lo que llama.cpp/Ollama no son la vía estándar para este modelo (orientados a modelos generativos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ossbert-morph-v2.1 | 177,6 M | No disponible | Token classification | Apache 2.0 | HuggingFace |
| bert-base-multilingual-cased | ~178 M | 512 tokens | Encoder multilingüe (base para ajuste) | Apache 2.0 | HuggingFace |
| xlm-roberta-base | ~278 M | 512 tokens | Encoder multilingüe (base para ajuste) | MIT | HuggingFace |
| AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs | No disponible | No disponible | Encoder (modelo base) | No disponible | HuggingFace |

Nota: la comparación de rendimiento con alternativas no es posible porque ossbert-morph-v2.1 no publica resultados en benchmarks estándar y su conjunto de evaluación no está documentado. Las filas de modelos comparables se incluyen a título de referencia arquitectónica, no de rendimiento medido.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al desconocerse el dataset, no puede evaluarse el sesgo.
- Riesgo de alucinación: no aplica como tal en una tarea de clasificación de tokens, si bien puede producir etiquetas incorrectas, especialmente en dominios fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; el modelo base es multilingüe, pero no se garantiza el comportamiento por idioma.
- Sobreajuste: las métricas de validación muestran un estancamiento y repunte de la pérdida tras la época 14, con una "sentence accuracy" final de solo 63,3028 frente a una accuracy de token del 96,1278; conviene validar en datos propios.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero al ser un derivado conviene revisar las condiciones del modelo base.
- Caveats para producción: model card generada automáticamente y sin completar, 0 descargas y ausencia de validación externa; no debe desplegarse en producción crítica sin reproducir y validar sus métricas.

## Enlaces
- HuggingFace: https://huggingface.co/ania3000/ossbert-morph-v2.1
- Modelo base: https://huggingface.co/AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
