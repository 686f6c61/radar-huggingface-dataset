# elenamontiel/exemple2-finetuned-gtzan

## Resumen

`exemple2-finetuned-gtzan` es un modelo de clasificación de audio derivado de `ntu-spml/distilhubert`, un transformer de la familia HuBERT destilado para tareas de representación acústica. Lo publica el usuario `elenamontiel` en Hugging Face y ha sido ajustado mediante la librería `transformers` sobre el conjunto de datos GTZAN, un corpus clásico de 1.000 fragmentos musicales de 30 segundos distribuidos en 10 géneros. El modelo resuelve una tarea acotada: asignar una etiqueta de género musical a un clip de audio preprocesado.

La relevancia de esta ficha es limitada y conviene ser explícito: se trata de un artefacto de entrenamiento generado automáticamente por `Trainer`, con una model card incompleta, sin descripción de usos previstos y con una precisión declarada de 0,48 sobre el split de evaluación. No es un modelo de propósito general ni un sistema de razonamiento multimodal; es un clasificador de 10 clases con 23,7 millones de parámetros y una ventana de contexto acústico dictada por el extractor de características de DistilHuBERT.

Aun así, resulta útil como referencia para quien quiera reproducir un pipeline mínimo de fine-tuning de audio con `transformers`, comparar el efecto de hiperparámetros conservadores (learning rate 5e-5, dos épocas, batch efectivo de 8) o evaluar la brecha entre un ajuste rápido y el estado del arte en GTZAN, que ronda el 90 % de precisión con arquitecturas especializadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo HuBERT destilado (DistilHuBERT), encoder convolucional + capas transformer |
| Parametros totales | 23.691.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (limitada por la ventana de entrada del extractor de DistilHuBERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es clasificacion de audio, no procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | ntu-spml/distilhubert |
| Dataset de ajuste | GTZAN (config default, split train) |
| Tarea (pipeline) | audio-classification |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |
| Descargas | 35 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `ntu-spml/distilhubert`, una versión destilada de HuBERT que reduce el coste computacional del encoder original manteniendo las representaciones acústicas autoaprendidas. Sobre esa base se ha añadido una cabeza de clasificación ajustada para las 10 clases de género de GTZAN. No se dispone de información sobre la composición exacta del dataset de preentrenamiento de DistilHuBERT en esta ficha; lo relevante es que el ajuste reportado se limita a GTZAN.

El procedimiento de entrenamiento está documentado en la model card con los siguientes hiperparámetros: learning rate 5e-5, batch de entrenamiento 4 con acumulación de gradientes de 2 (batch efectivo 8), batch de evaluación 4, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y 2 épocas. El entrenamiento se ejecutó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 2.21.0 y Tokenizers 0.23.3. La pérdida de validación pasó de 1,9210 en la época 1 a 1,7386 en la época 2, mientras la precisión cayó de 0,50 a 0,48, lo que sugiere un ajuste muy corto y posiblemente infraentrenado o con señal insuficiente.

No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional. Tampoco se especifica si se aplicó data augmentation, balanceo de clases o una partición distinta del split de GTZAN. La model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento y evaluación.

## Capacidades

- Clasificación de audio en 10 clases de género musical (GTZAN: blues, classical, country, disco, hip hop, jazz, metal, pop, reggae, rock).
- Extracción de representaciones acústicas mediante el encoder DistilHuBERT, reutilizable para otras tareas de audio si se reemplaza la cabeza de clasificación.
- Inferencia sobre clips de audio preprocesados con el feature extractor correspondiente de `transformers`.
- Integración directa con el pipeline `audio-classification` de Hugging Face (`pipeline("audio-classification", model=...)`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código ni matemáticas.
- No soporta visión ni audio-vision conjunta.
- Capacidades multilingües: no aplica; el modelo no procesa texto.
- No dispone de modo "thinking" ni de salida estructurada más allá de la distribución de probabilidad sobre las 10 clases.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: dado un catálogo de pistas, el modelo puede asignar un género probable a cada clip y usarse como primer filtro en un sistema de organización. Es adecuado por su bajo coste (23,7 M de parámetros) y su integración directa con `transformers`, aunque la precisión de 0,48 exige revisión humana.
- Prototipado rápido de pipelines de clasificación de audio: sirve como línea base reproducible para comparar contra modelos posteriores o contra el propio DistilHuBERT sin ajustar, dado que la model card documenta los hiperparámetros exactos.
- Docencia y experimentación con fine-tuning de audio: el repositorio es un ejemplo mínimo de `Trainer` aplicado a GTZAN, útil para talleres sobre `transformers` y `datasets`.
- Pre-etiquetado en herramientas de anotación: el modelo puede proponer una etiqueta inicial que un anotador humano corrija, reduciendo el tiempo en tareas de curaduría musical.
- Filtrado temático en aplicaciones de recomendación: para descartar géneros no deseados en un flujo de recomendación rudimentario, siempre que se combine con otras señales.
- Análisis exploratorio de datasets de audio: clasificar un corpus desconocido para obtener una distribución aproximada de géneros antes de un análisis más profundo.
- Detección de desbalance en corpus musicales: al comparar la distribución predicha con la esperada se pueden identificar sesgos de muestreo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. La precisión se reporta sobre el split de entrenamiento según el `model-index`, aunque la tabla de entrenamiento la etiqueta como validación; se reproduce tal cual.

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Accuracy | GTZAN | train | 0,48 |
| Loss (validacion) | GTZAN | validacion | 1,7386 |

Evolución durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 57 | 1,9210 | 0,50 |
| 2 | 114 | 1,7386 | 0,48 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 23,7 M de parámetros (aproximadamente 95 MB de pesos) más el estado del feature extractor y los buffers de audio; en la práctica, menos de 2 GB en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU con latencia aceptable para clips cortos.
- Cabe en GPU de consumo: sí, en cualquier RTX (2060 o superior), GTX 1660, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `audio-classification`), `optimum` para exportación a ONNX, `torchscript`; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamaño, se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elenamontiel/exemple2-finetuned-gtzan | 23,7 M | no disponible | Clasificacion de genero (GTZAN) | apache-2.0 | Hugging Face |
| ntu-spml/distilhubert | no disponible | no disponible | Representacion acustica auto-supervisada | no disponible | Hugging Face |
| facebook/hubert-base-ls960 | no disponible | no disponible | Representacion acustica auto-supervisada | no disponible | Hugging Face |
| Modelos especializados en GTZAN (p. ej. CNN sobre mel-espectrogramas) | variable | no aplica | Clasificacion de genero | variable | publicaciones academicas |

No se dispone de datos de benchmarks comparables en la informacion proporcionada para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Precisión baja: 0,48 de accuracy sobre 10 clases implica que el modelo se equivoca en más de la mitad de los casos; no es apto para producción sin validación adicional.
- Infraentrenamiento probable: solo 2 épocas y una pérdida de validación que sigue bajando mientras la precisión empeora sugieren que el ajuste no ha convergido.
- Model card incompleta: las secciones de descripción, usos previstos y datos de entrenamiento indican "More information needed"; no hay información sobre sesgos, partición del dataset ni preprocesado.
- Sesgos desconocidos: GTZAN es un dataset pequeño (1.000 clips) y con etiquetas discutidas en la literatura; el modelo hereda esos sesgos y no se documenta ningún análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en géneros acústicamente cercanos.
- Limitaciones de contexto: la ventana de entrada viene impuesta por el feature extractor de DistilHuBERT y no se documenta en la ficha; clips más largos deben segmentarse.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene verificar la licencia del modelo base y del dataset GTZAN por separado, ya que esta ficha no la detalla.
- Reproducibilidad: la model card no especifica la partición exacta de GTZAN utilizada, lo que dificulta comparar el 0,48 con otros resultados publicados.
- Fecha de creación inusual (2026-11-17): conviene verificar la integridad del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elenamontiel/exemple2-finetuned-gtzan
- Modelo base DistilHuBERT: https://huggingface.co/ntu-spml/distilhubert
- Documentación del pipeline de clasificación de audio de transformers: https://huggingface.co/docs/transformers/main/en/tasks/audio_classification
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/gtzan
- Repositorio de Transformers: https://github.com/huggingface/transformers
