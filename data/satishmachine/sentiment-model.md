# satishmachine/sentiment-model

## Resumen

`sentiment-model` es un ajuste fino (fine-tuning) completo de `distilbert-base-uncased` publicado por el usuario `satishmachine` en Hugging Face para la tarea de clasificación de texto (pipeline `text-classification`). Se trata de un encoder transformer de 66.955.779 parámetros (aproximadamente 0,3 GB en `safetensors`, pesos en fp32), con licencia Apache-2.0 y arquitectura DistilBERT de 6 capas, 12 cabezas de atención y dimensión oculta 768, con un límite de contexto de 512 tokens.

El modelo resuelve, en teoría, análisis de sentimiento, pero la información publicada es mínima: la model card está generada automáticamente por el `Trainer` de Hugging Face, no especifica el conjunto de datos de entrenamiento, el número de etiquetas, el mapeo de clases ni los idiomas soportados. Los únicos datos objetivos son las métricas de evaluación declaradas por el autor: pérdida 0,7470, accuracy 0,6598 y F1 weighted/macro 0,6493, obtenidas tras 3 épocas de entrenamiento.

Su relevancia actual es limitada y de carácter experimental: con 0 descargas y 0 "likes", sin dataset documentado y con una accuracy de 0,6598 (baja para una tarea de sentimiento típica), debe considerarse un artefacto de aprendizaje o un experimento reproducible, no un modelo listo para producción sin una validación previa sobre datos propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base): 6 capas, 12 cabezas, hidden size 768 |
| Parametros totales | 66.955.779 (según pesos `safetensors`) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (límite de la arquitectura DistilBERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | No disponibles en el repositorio (pesos en fp32). Convertible a int8/ONNX con herramientas externas (Optimum, ONNX Runtime) |
| Idiomas soportados | No disponible en la model card. El modelo base `distilbert-base-uncased` está preentrenado principalmente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | distilbert-base-uncased |
| Etiquetas de salida | No disponible (número de clases y mapeo no documentados) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 30 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, una versión destilada de BERT-base introducida por Sanh et al. (2019): conserva la mitad de las capas del modelo original (6 frente a 12), reduce el número de parámetros de 110 M a 66 M y mantiene el mismo tamaño de contexto (512 tokens) y la misma dimensión oculta (768). Al ser un encoder bidireccional sin cabecera generativa, su única salida útil es una distribución de probabilidad sobre las clases de clasificación. En este repositorio no se indica cuántas clases tiene la cabecera ni cuál es su orden.

El ajuste fino declarado en la model card afecta presumiblemente a la totalidad de los 66,9 M de parámetros. Los hiperparámetros documentados son: learning rate 2e-05, batch de entrenamiento y evaluación de 32, 3 épocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, semilla 42. Se registraron 174 pasos totales (58 por época), lo que, con un batch de 32, implica un conjunto de entrenamiento de aproximadamente 1.856 ejemplos (estimación derivada de los pasos publicados, no confirmada por el autor). El conjunto de datos, su dominio, su idioma y su proceso de anotación no se especifican en ningún momento. No hay indicios de RLHF, DPO ni ninguna técnica de alineación, algo por otro lado esperable en un clasificador encoder. Las versiones de framework empleadas fueron Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de texto de una sola pasada: devuelve una etiqueta y una puntuación de confianza para secuencias de hasta 512 tokens.
- Análisis de sentimiento (según el nombre del modelo y la etiqueta genérica de la model card), aunque no se documenta el número de clases ni su semántica.
- Inferencia por lotes de alto rendimiento por el reducido tamaño del modelo (66,9 M de parámetros).
- Extracción de representaciones: al ser un encoder, puede devolver los estados ocultos (768 dimensiones) para usos auxiliares, si bien el ajuste fino sobre una tarea concreta puede degradar la calidad de esas representaciones.
- No soporta generación de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo "thinking" ni cadena de pensamiento.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Multilingüismo: no documentado; el tokenizador `uncased` de DistilBERT está orientado al inglés y no maneja bien otros idiomas.

## Casos de uso

- Prueba de concepto de análisis de sentimiento: sirve como plantilla mínima para verificar un pipeline de `transformers` de principio a fin (carga, tokenización, inferencia por lotes) antes de invertir en un modelo mayor.
- Pre-anotación de datasets: dado su bajo coste computacional, puede etiquetar grandes volúmenes de texto en inglés y usar esas predicciones como punto de partida para una revisión humana posterior, siempre con control de calidad dada su accuracy de 0,6598.
- Enrutado grueso de tickets de soporte: clasificar mensajes entrantes por tono (positivo/negativo) para priorizar colas de atención, aceptando que el error será elevado y que se necesita una capa de revisión.
- Clasificación en el borde (edge): con menos de 300 MB en fp32 y unos 67 MB en int8, puede ejecutarse en CPU, dispositivos móviles o placas tipo Raspberry Pi en escenarios sin conectividad y con requisitos de privacidad estrictos.
- Monitorización de menciones de marca en inglés: procesar flujos de comentarios o reseñas a gran escala en infraestructura modesta, usando la clasificación como señal orientativa y no como decisión final.
- Base para un ajuste fino adicional: al derivar de `distilbert-base-uncased` y estar bajo Apache-2.0, puede reentrenarse sobre un corpus propio etiquetado para corregir su dominio y sus clases.
- Filtrado previo en sistemas de moderación: como primera etapa de bajo coste que descarta contenido claramente negativo, delegando los casos ambiguos en un modelo mayor; requiere umbrales calibrados por el alto riesgo de falsos positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SST-2, etc.) en la información disponible. El `model-index` de la model card está vacío. Los únicos datos son las métricas de evaluación declaradas por el autor:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento, según la model card:

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Observaciones: la pérdida de validación se estanca entre la época 2 (0,7226) y la 3 (0,7117) mientras la pérdida de entrenamiento sigue bajando (0,8304 a 0,6785), lo que apunta a un inicio de sobreajuste. La accuracy y el F1 empeoran en la tercera época respecto a la segunda. El hecho de que F1 weighted y F1 macro coincidan sugiere un reparto equilibrado de clases en el conjunto de evaluación, pero no se publica la matriz de confusión ni métricas por clase.

## Requisitos de hardware

- VRAM estimada: aproximadamente 270 MB solo para los pesos en fp32; unos 135 MB en fp16 y unos 67 MB en int8. Con activaciones y batch pequeño, la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problemas en GTX 1050 Ti, GTX 1660, RTX 3060, RTX 4090, A100 o H100; las GPU de gama alta quedan enormemente sobredimensionadas para este modelo.
- CPU: es perfectamente viable. Un encoder de 66,9 M de parámetros procesa lotes en CPU en tiempos del orden de decenas de milisegundos, lo que permite despliegues sin GPU.
- GPU de consumo: sí, cabe en cualquier GPU de consumo de los últimos diez años, e incluso en dispositivos móviles o SoC de bajas prestaciones.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime y `optimum` para exportación y aceleración, TorchScript, Hugging Face Inference Endpoints (el repositorio incluye la etiqueta `endpoints_compatible`), servidores propios con FastAPI o Triton. `vLLM` no está orientado a clasificación con encoders, por lo que no es la opción natural. `llama.cpp` está pensado para generación y para BERT en tareas de embeddings, no para clasificación directa con esta cabecera.
- Latencia y throughput: no disponible. No se han publicado mediciones y la ficha no incluye ningún dato de rendimiento en producción. Cualquier cifra concreta requeriría una evaluación propia sobre el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de evaluacion | Rendimiento declarado |
|---|---|---|---|---|---|
| satishmachine/sentiment-model | 66,9 M | 512 tokens | Apache-2.0 | Dataset desconocido, no publicado | Accuracy 0,6598; F1 macro 0,6493 |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Apache-2.0 | SST-2 (sentimiento binario en inglés) | No disponible en esta ficha; evaluación estandarizada y ampliamente replicada |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M (RoBERTa-base) | 512 tokens | No disponible | Tuits en inglés (3 clases) | No disponible en esta ficha |
| distilbert-base-uncased (modelo base) | 66,9 M | 512 tokens | Apache-2.0 | Preentrenamiento (no clasificación) | No aplica a clasificación directa |

La comparación directa de rendimiento no es posible porque los conjuntos de evaluación difieren y este repositorio no publica su dataset. La única comparación rigurosa que puede hacerse es de arquitectura, tamaño, contexto y licencia, donde `sentiment-model` es equivalente a cualquier otro ajuste fino de DistilBERT; su ventaja diferencial frente a alternativas consolidadas es nula, y su desventaja es la falta total de documentación y validación externa.

## Limitaciones y advertencias

- Model card generada automáticamente: campos clave como "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed".
- Rendimiento bajo y de utilidad dudosa: accuracy 0,6598 y F1 macro 0,6493. En una tarea binaria de sentimiento, un 0,66 de accuracy está muy cerca de clasificadores triviales; en una tarea multiclase el valor absoluto es difícil de interpretar sin conocer el número de clases y la distribución del conjunto de evaluación.
- Sobreajuste probable: con aproximadamente 1.856 ejemplos de entrenamiento estimados y 3 épocas, la pérdida de validación apenas mejora entre las épocas 2 y 3, y las métricas de accuracy y F1 empeoran en la última época.
- Dataset de entrenamiento desconocido: no se puede auditar la composición, el dominio, el idioma, el equilibrio de clases ni la calidad de las anotaciones, lo que impide evaluar sesgos de forma fundamentada.
- Sesgos: no disponibles. Al derivar de `distilbert-base-uncased`, hereda los sesgos presentes en los corpus de preentrenamiento en inglés (principalmente texto web tipo BookCorpus y Wikipedia en inglés).
- Riesgo de alucinación: no aplica en sentido estricto porque no genera texto. El riesgo equivalente es la clasificación errónea sistemática y la asignación de etiquetas con alta confianza en textos fuera de dominio.
- Idiomas: no hay soporte documentado. El tokenizador `uncased` está orientado al inglés y no se ha entrenado para castellano ni para otros idiomas; no debe usarse en producción multilingüe sin validación previa.
- Longitud de contexto: 512 tokens. Los textos más largos se truncarán, con la consiguiente pérdida de información en reseñas o documentos extensos.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se ofrece sin garantías de ningún tipo. Es responsabilidad del integrador validar el modelo sobre datos propios.
- Ausencia de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes externos de calidad ni reproducciones independientes.
- Reproducibilidad: no se publica el dataset, ni las particiones, ni los scripts de entrenamiento, ni la semilla de la partición de validación, por lo que los resultados declarados no pueden reproducirse tal cual.
- Nomenclatura engañosa: el nombre `sentiment-model` es genérico y no aporta información sobre dominio ni idioma; no debe confundirse con otros repositorios homónimos publicados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satishmachine/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Búsqueda general de modelos de análisis de sentimiento en Hugging Face (resultado de web, no específico de este modelo): https://huggingface.co/models?search=sentiment-analysis
- Repositorio homónimo de otro autor, sin relación con este modelo: https://huggingface.co/sagarstpatil/sentiment-model
- Proyecto de análisis de sentimiento con LSTM y ensemble (resultado de web, no relacionado): https://github.com/Bairavi05/Sentiment-Analysis
- Paquete `sentiment.ai` para R/Python (resultado de web, no relacionado): https://github.com/BenWiseman/sentiment.ai
- Calendario de lanzamientos de modelos de IA (resultado de web, no relacionado): https://www.scriptbyai.com/ai-model-release-calendar/

Nota: ninguno de los resultados de búsqueda web consultados documenta ni evalúa el modelo `satishmachine/sentiment-model`; no se han encontrado paper, blog técnico, demo ni repositorio asociados.
