# Light2626/indobert-mood

## Resumen

`indobert-mood` es un modelo de clasificación de emociones en texto para indonesio, desarrollado por el usuario Light2626. Se trata de un fine-tuning de `indobenchmark/indobert-base-p1`, un transformer encoder basado en BERT con 124,4 millones de parámetros, sobre el dataset EmoTweetID (anotación manual de tuits en indonesio). El modelo clasifica cada texto en una de seis emociones: ira, asco, miedo, alegría, tristeza y sorpresa.

El modelo resuelve una tarea concreta y acotada: la detección de emoción expresada en textos cortos en indonesio, con aplicación en análisis de opinión, monitorización de redes sociales y moderación de contenido. No es un modelo generativo ni un asistente conversacional; su salida es una etiqueta de clasificación con una puntuación de confianza asociada.

Su relevancia es limitada pero clara dentro del ecosistema indonesio: cubre un hueco de clasificación emocional ligera y desplegable en CPU, con licencia Apache 2.0 y un tamaño de repositorio de 0,5 GB. Es un modelo de investigación o de prototipado, con cero descargas y cero likes en el momento de redactar esta ficha, y con un conjunto de entrenamiento muy reducido (1.980 textos), lo que condiciona fuertemente su robustez en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, IndoBERT p1) |
| Parametros totales | 124.445.958 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de IndoBERT base; el autor indica que se entrenó con tuits de mediana 13 palabras) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch/ONNX fuera del repo) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de clasificación sobre `indobenchmark/indobert-base-p1`, un BERT base adaptado al indonesio. La cabeza de clasificación produce seis clases de emoción (anger, disgust, fear, joy, sadness, surprise). No hay innovaciones arquitectónicas propias: se trata de un encoder estándar con atención bidireccional y una capa de clasificación lineal sobre el token `[CLS]`.

El entrenamiento se realizó sobre el dataset EmoTweetID (versión 5), subset de anotación manual, con 1.980 textos tras limpieza: se eliminaron 29 filas con etiquetas contradictorias (14 textos) y 14 duplicados, pasando de 2.243 a 2.200 muestras, y se aplicó preprocesado de texto. El autor reporta que el rendimiento del proyecto (Macro F1 0,855 ± 0,014 con IndoBERT y learning rate 2e-5) proviene de una validación cruzada estratificada de 5 folds, no de este modelo concreto. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en una tarea de clasificación supervisada.

## Capacidades

- Clasificación de texto en seis emociones: anger, disgust, fear, joy, sadness, surprise.
- Salida con puntuación de confianza por clase; el autor recomienda mostrar "no estoy seguro" cuando la confianza máxima es inferior a 0,80.
- Procesamiento de textos cortos en indonesio, con especial adecuación a tuits (mediana de 13 palabras).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo indonesio.
- No dispone de modo thinking, visión ni audio.
- No hay clase "neutral": todo texto se asigna a una de las seis emociones.

## Casos de uso

- Monitorización de sentimiento emocional en redes sociales: el modelo puede etiquetar grandes volúmenes de tuits en indonesio con seis categorías emocionales, útil para paneles de opinión pública o análisis de campañas, siempre que se filtren las predicciones de baja confianza.
- Moderación de contenido en comunidades indonesias: detección de textos con ira o asco como señal para revisión humana, integrado en un pipeline de pre-filtrado previo a la moderación manual.
- Análisis de atención al cliente: clasificación de reseñas o mensajes cortos de usuarios para enrutar quejas (ira, tristeza) hacia equipos especializados, con la advertencia de que el modelo no está validado en textos largos.
- Investigación en psicolingüística y análisis de emoción: uso como baseline ligero en experimentos académicos sobre emoción en indonesio, con la ventaja de su licencia Apache 2.0 y su reducido tamaño (0,5 GB).
- Etiquetado asistido de datasets: pre-anotación de corpus emocionales en indonesio para revisión humana posterior, reduciendo el coste de anotación manual.
- Clasificación en dispositivos con recursos limitados: al ser un BERT base de 124 millones de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificación en tiempo real, como filtrado de comentarios en una aplicación móvil.
- Análisis de encuestas abiertas: procesamiento de respuestas cortas en indonesio para agregar la distribución emocional de los encuestados, con la limitación de que el modelo no está entrenado en textos largos ni formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un Macro F1 de 0,855 ± 0,014 obtenido mediante validación cruzada estratificada de 5 folds con IndoBERT y learning rate 2e-5, pero especifica que ese resultado proviene del proyecto y no de este modelo concreto. No se dispone de métricas por clase ni de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 para los pesos (124 millones de parámetros), con un pico adicional de memoria para activaciones y batch; en la práctica, menos de 2 GB en FP32 y menos de 1 GB en FP16/INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que está pensado para inferencia ligera.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Cabe en CPU: sí, con latencias de decenas de milisegundos por texto corto, adecuado para clasificación por lotes.
- Opciones de despliegue: PyTorch nativo, Hugging Face Transformers, ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (aunque vLLM está orientado a generación, no a clasificación). No se documenta soporte de llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Light2626/indobert-mood | 124,4 M | no disponible | Clasificación de 6 emociones en indonesio | Apache 2.0 | Hugging Face |
| indobenchmark/indobert-base-p1 | 124,4 M | no disponible | Modelo base indonesio (MLM) | Apache 2.0 | Hugging Face |
| indobert-lite-base-p1 | no disponible | no disponible | Modelo base indonesio ligero | Apache 2.0 | Hugging Face |
| XLM-RoBERTa base | 278 M | no disponible | Multilingüe, clasificación | MIT | Hugging Face |

La comparación con alternativas específicas de clasificación emocional en indonesio no está disponible en la información proporcionada. IndoBERT base es el modelo de partida y sirve como referencia de tamaño y licencia; XLM-RoBERTa base es una alternativa multilingüe de mayor tamaño que podría emplearse para la misma tarea, aunque sin fine-tuning específico sobre EmoTweetID.

## Limitaciones y advertencias

- Entrenado con solo 1.980 textos: el conjunto es muy reducido, lo que limita la generalización y aumenta el riesgo de sobreajuste a las particularidades de EmoTweetID.
- Rendimiento no validado en textos largos: el autor indica que la precisión disminuye en textos más largos que los tuits (mediana de 13 palabras).
- Sin clase neutral: cualquier texto se asigna a una de las seis emociones, lo que puede forzar etiquetas en textos sin carga emocional clara.
- Sesgos conocidos: no se documentan análisis de sesgos demográficos, de dominio ni de anotación; el dataset EmoTweetID puede reflejar sesgos de los anotadores y de la muestra de tuits.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset EmoTweetID está bajo CC BY 4.0, lo que exige atribución si se redistribuyen datos derivados.
- Caveat para producción: el autor recomienda umbral de confianza de 0,80 para mostrar "no estoy seguro"; sin ese filtro, las predicciones de baja confianza pueden degradar la calidad del sistema.
- Modelo con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa independiente.
- Solo indonesio: no apto para textos en otros idiomas sin reentrenamiento.

## Enlaces

- [Hugging Face: Light2626/indobert-mood](https://huggingface.co/Light2626/indobert-mood)
- [Modelo base: indobenchmark/indobert-base-p1](https://huggingface.co/indobenchmark/indobert-base-p1)
- [Dataset EmoTweetID (Mendeley Data, DOI 10.17632/jzgnjsff9f.5)](https://doi.org/10.17632/jzgnjsff9f.5)
- [Artículo de datos: EmoTweetID (Data in Brief, 2026, DOI 10.1016/j.dib.2026.113119)](https://doi.org/10.1016/j.dib.2026.113119)
- [Licencia CC BY 4.0 del dataset](https://creativecommons.org/licenses/by/4.0/)
