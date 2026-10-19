# leomaurodesenv/MiniLM-L12-H384-uncased-nvidia-aegis-v2-augmented

## Resumen

`leomaurodesenv/MiniLM-L12-H384-uncased-nvidia-aegis-v2-augmented` es un modelo de clasificación de texto publicado en Hugging Face por el usuario leomaurodesenv. Según los metadatos del repositorio, se trata de un fine-tune de `FacebookAI/roberta-base` realizado con la librería Transformers y la clase `Trainer`, con 33.360.770 parámetros almacenados en safetensors, licencia MIT y un pipeline declarado de `text-classification`. El modelo resuelve una tarea de clasificación supervisada (etiqueta única por secuencia) y está pensado para integrarse como componente ligero en flujos de moderación o filtrado.

La información publicada es muy escasa: la model card es la plantilla automática generada por `Trainer`, el dataset de entrenamiento figura como "unknown dataset" y no se declara el conjunto de etiquetas ni el número de clases. El autor reporta una pérdida de validación de 0,3024 y una accuracy de 0,8641, aunque la tabla de entrenamiento muestra métricas de cinco épocas con un máximo de 0,8997 de accuracy en validación.

Su relevancia práctica es la de un clasificador pequeño y barato de ejecutar: con ~33 M de parámetros cabe en CPU y en cualquier GPU de consumo, y su licencia MIT permite uso comercial sin restricciones adicionales. Ahora bien, la opacidad sobre datos, etiquetas y evaluación objetiva limita seriamente su uso en producción sin una validación propia previa. Existe además una inconsistencia de nomenclatura que se detalla en la sección de limitaciones: el nombre del repositorio alude a MiniLM-L12-H384-uncased mientras que los metadatos declaran roberta-base como modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT/RoBERTa con cabeza de clasificación (la etiqueta del repo indica `bert`; el modelo base declarado es RoBERTa) |
| Parámetros totales | 33.360.770 (según safetensors) |
| Longitud de contexto | No disponible en la model card (la familia BERT/RoBERTa trabaja habitualmente con 512 tokens) |
| Tipos de cuantización | No disponible; al ser un encoder pequeño es convertible a int8 dinámico vía ONNX Runtime o a fp16 sin工具 adicional (no se distribuyen pesos cuantizados) |
| Idiomas soportados | No disponible; el sufijo "uncased" del nombre y el tokenizador de RoBERTa apuntan a un uso predominantemente en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modelo base | FacebookAI/roberta-base |
| Número de clases / etiquetas | No disponible |
| Tamaño del repositorio | 0,1 GB |
| Compatibilidad de despliegue | `text-embeddings-inference`, endpoints compatibles |
| Fecha de creación / actualización | 2026-10-18 / 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura declarada es un encoder transformer con cabeza de clasificación sobre `FacebookAI/roberta-base`. No obstante, los metadatos son contradictorios: el identificador del repositorio menciona `MiniLM-L12-H384-uncased` (un modelo destilado de 12 capas y dimensión oculta 384, con unos 33 M de parámetros), los tags incluyen `bert` y el campo `base_model` apunta a `roberta-base` (12 capas, 768 de dimensión oculta, ~125 M de parámetros). El recuento real de safetensors (33.360.770) coincide con el rango de MiniLM-L12-H384 y no con el de roberta-base, por lo que la arquitectura efectiva del checkpoint no puede confirmarse a partir de la información publicada.

El entrenamiento se realizó con `Trainer` durante 10 épocas configuradas (`num_epochs: 10`), aunque la tabla de resultados solo recoge 5. Hiperparámetros: learning rate 2e-05, batch de entrenamiento 8, batch de evaluación 8, acumulación de gradiente 2 (batch efectivo 16), optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup y semilla 42. El dataset se describe literalmente como "unknown dataset": no se especifica composición, número de tokens, idioma, número de clases ni proceso de anotación. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, lo cual es esperable en un encoder de clasificación. El nombre incluye el segmento "nvidia-aegis-v2-augmented", que sugiere una relación con el corpus de seguridad Aegis de NVIDIA y algún tipo de aumento de datos, pero la model card no lo confirma. Versiones de framework declaradas: Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto por secuencia: devuelve una distribución de probabilidad sobre las clases aprendidas (el conjunto de etiquetas no está documentado).
- Entrada de texto corto y medio: adecuado para frases, titulares, comentarios y párrafos dentro de la ventana del encoder.
- Inferencia en CPU: con ~33 M de parámetros el coste por secuencia es de milisegundos en hardware convencional.
- Integración directa con `transformers` (`AutoModelForSequenceClassification`) y con `text-embeddings-inference` según los tags del repositorio.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión, audio ni modo "thinking": es un encoder discriminativo, no un modelo generativo.
- Capacidad multilingüe: no disponible; no se declara soporte de idiomas.
- Aumento de datos declarado en el nombre ("augmented"), sin detalle del método empleado.

## Casos de uso

- Moderación de contenido en foros y comentarios: el modelo puede clasificar cada mensaje entrante en una categoría de riesgo o toxicidad y derivar los casos dudosos a revisión humana; su tamaño permite ejecutarlo en la misma instancia que sirve la aplicación, sin GPU dedicada.
- Filtrado previo (pre-gate) antes de un LLM: usar el clasificador como primera barrera para descartar peticiones que no requieren un modelo grande reduce el coste por consulta, ya que resolver una clasificación con 33 M de parámetros es órdenes de magnitud más barato que una generación.
- Etiquetado asistido de datasets: aplicar el modelo sobre grandes volúmenes de texto no etiquetado para pre-anotar y luego revisar solo los casos de baja confianza, acelerando la construcción de corpus supervisados.
- Clasificación de tickets de soporte: enrutar incidencias a la cola adecuada (facturación, técnico, cuenta) con un modelo que corre en CPU y admite lotes grandes sin saturar el servidor.
- Detección de spam o reseñas fraudulentas en un marketplace: inferencia síncrona dentro del pipeline de publicación, con latencia compatible con una respuesta HTTP interactiva.
- Enriquecimiento de datos en un ETL: clasificar documentos o registros durante el procesamiento por lotes sin añadir infraestructura GPU al clúster de datos.
- Despliegue en el edge o en dispositivos modestos: al ocupar del orden de 33-133 MB de pesos, es viable en contenedores pequeños, funciones serverless con límite de memoria bajo o dispositivos con CPU ARM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SuperGLUE, etc.) en la información disponible: el bloque `model-index` de la model card está vacío (`"results": []`). Los únicos datos numéricos son las métricas de validación registradas durante el entrenamiento:

| Época | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 8402 | 0.8899 | 0.3951 | 0.8203 |
| 2.0 | 16804 | 0.6200 | 0.3022 | 0.8641 |
| 3.0 | 25206 | 0.3284 | 0.3214 | 0.8842 |
| 4.0 | 33608 | 0.5113 | 0.3084 | 0.8913 |
| 5.0 | 42010 | 0.3520 | 0.3061 | 0.8997 |

Advertencias sobre estos datos: la model card declara 10 épocas pero solo se registran 5; el resumen inicial ("Loss: 0.3024, Accuracy: 0.8641") corresponde a la época 2, mientras que el mejor valor de accuracy registrado es 0,8997 en la época 5 con una pérdida de validación de 0,3061. No se especifica el tamaño ni la composición del conjunto de evaluación, por lo que estas cifras no son comparables con resultados publicados de otros modelos.

## Requisitos de hardware

- Huella de memoria de los pesos: ~133 MB en fp32, ~67 MB en fp16 y ~33 MB en int8 (cálculo directo a partir de 33,36 M de parámetros).
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo activaciones y overhead del runtime, para secuencias de hasta 512 tokens y lotes moderados.
- GPU recomendadas: ninguna en particular; cualquier GPU sirve. Se beneficia de lotes grandes en tarjetas como RTX 4090, A100 o H100 para maximizar throughput en procesos por lotes, pero no las necesita.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer, e incluso en iGPU y en CPU exclusivamente.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (declarado en los tags), ONNX Runtime con cuantización dinámica int8, TorchScript, o un servicio FastAPI propio con batching. No hay pesos GGUF publicados, por lo que su uso con llama.cpp u Ollama requeriría una conversión manual. vLLM y TGI no son la vía natural para un encoder de clasificación de este tamaño.
- Latencia y throughput: no disponibles; no se han publicado mediciones. A modo de referencia estructural, un encoder de ~33 M de parámetros procesa secuencias cortas en pocos milisegundos por lote en CPU moderna, pero esta cifra no está verificada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Este modelo (`MiniLM-L12-H384-uncased-nvidia-aegis-v2-augmented`) | 33,36 M | No disponible | Clasificación de texto (etiquetas no documentadas) | MIT | No disponibles |
| `FacebookAI/roberta-base` | ~125 M | 512 | Encoder base (MLM) | MIT | Sí (GLUE, SuperGLUE) |
| `microsoft/MiniLM-L12-H384-uncased` | ~33,4 M | 512 | Encoder destilado (MLM) | MIT | Sí (GLUE) |
| `distilbert-base-uncased` | ~66 M | 512 | Encoder destilado (MLM) | Apache 2.0 | Sí (GLUE) |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22,7 M | 256 | Embeddings de frase | Apache 2.0 | Sí (MTEB) |

La comparación relevante es por tamaño y coste de inferencia: este checkpoint compite con MiniLM-L12 y DistilBERT en requisitos de hardware, pero a diferencia de ellos no ofrece métricas reproducibles en tareas estándar ni documenta su conjunto de etiquetas, lo que impide una comparación de rendimiento real.

## Limitaciones y advertencias

- Inconsistencia de identidad del modelo: el nombre del repositorio indica `MiniLM-L12-H384-uncased`, los tags indican `bert` y el campo `base_model` indica `roberta-base`. El recuento de parámetros (33,36 M) es incompatible con roberta-base (~125 M). Verificar la configuración real antes de usarlo.
- Dataset de entrenamiento no documentado ("unknown dataset"): se desconoce la distribución, el idioma, el número de clases y el equilibrio entre ellas, lo que impide estimar sesgos.
- Sesgos conocidos: no disponibles; al no documentarse los datos, no puede evaluarse el sesgo demográfico, cultural o lingüístico. Si el corpus proviene de un dataset de seguridad, es probable que herede los sesgos de anotación de dicho corpus.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de falsos positivos y falsos negativos con confianza alta en las clases aprendidas.
- Métricas no fiables: la model card mezcla épocas (reporta la métrica de la época 2 como resultado final), declara 10 épocas de entrenamiento pero registra 5 y no describe el conjunto de evaluación.
- Limitación de contexto: al ser un encoder BERT/RoBERTa, la ventana útil es de 512 tokens como máximo; los textos largos deben truncarse o dividirse, lo que puede perder la señal relevante.
- Idioma: no se declara soporte multilingüe. Asumir inglés por defecto; el rendimiento en castellano es desconocido y probablemente deficiente si el entrenamiento fue en inglés.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. No hay cláusulas de uso aceptable, lo que traslada al integrador toda la responsabilidad sobre el uso en moderación.
- Sin garantía de producción: cero descargas y cero "likes" en el momento de la consulta, sin procesos de revisión ni validación por terceros. Requiere una evaluación propia con datos representativos antes de cualquier despliegue.
- Ausencia de pesos cuantizados o formatos alternativos publicados: obliga a convertir el checkpoint si se quiere int8, ONNX o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leomaurodesenv/MiniLM-L12-H384-uncased-nvidia-aegis-v2-augmented
- Modelo base declarado: https://huggingface.co/FacebookAI/roberta-base
- Perfil del autor: https://huggingface.co/leomaurodesenv
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
