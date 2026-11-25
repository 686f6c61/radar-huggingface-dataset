# HosseinSch/ast-finetuned-gtzan

## Resumen

HosseinSch/ast-finetuned-gtzan es un modelo de clasificación de audio basado en la arquitectura Audio Spectrogram Transformer (AST). Se trata de un ajuste fino del modelo MIT/ast-finetuned-audioset-10-10-0.4593 sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de géneros musicales compuesto por 1.000 fragmentos de audio de 30 segundos distribuidos en 10 géneros. El modelo ha sido entrenado por el usuario HosseinSch y publicado en Hugging Face con la librería transformers.

El modelo resuelve la tarea de clasificación automática de géneros musicales (music genre classification), una de las tareas clásicas en el procesamiento de audio y la recuperación de información musical. Con 86,2 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware modesto, lo que lo hace adecuado para prototipado e investigación.

Su relevancia radica en que parte de un modelo preentrenado en AudioSet (un corpus masivo de eventos sonoros) y lo especializa en géneros musicales, alcanzando un 91 % de accuracy declarado en el conjunto de evaluación de GTZAN. La licencia BSD-3-Clause permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada basada en espectrogramas de audio; ventana típica de ~10 s en AST) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Audio Spectrogram Transformer (AST), un transformer puro sin convoluciones que opera sobre parches de espectrogramas de Mel. El modelo base MIT/ast-finetuned-audioset-10-10-0.4593 fue preentrenado en AudioSet, lo que proporciona representaciones robustas de eventos sonoros que luego se especializan mediante ajuste fino en GTZAN.

El ajuste fino se realizó con los siguientes hiperparámetros: learning rate de 2e-05, batch size efectivo de 8 (batch de 2 con 4 pasos de acumulación de gradiente), optimizador AdamW con betas (0,9; 0,999), scheduler lineal con 100 pasos de warmup, 5 épocas y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 5.23.0, PyTorch 2.15.0+cu132, Datasets 5.2.0 y Tokenizers 0.23.3, con semilla 42. La pérdida de validación final fue de 0,3075 y la accuracy de 0,91. No se documenta el número de tokens ni la composición exacta del dataset más allá de la referencia a marsyas/gtzan.

## Capacidades

- Clasificación de audio en 10 géneros musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Extracción de representaciones de audio mediante el encoder transformer subyacente.
- Procesamiento de espectrogramas de Mel como entrada (no audio crudo directamente; requiere extracción de características).
- No soporta tool calling ni function calling (es un modelo de clasificación, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Clasificación automática de géneros musicales en bibliotecas de audio: el modelo etiqueta fragmentos de 30 segundos en una de las 10 categorías de GTZAN, útil para organizar catálogos musicales o sistemas de recomendación.
- Etiquetado de datasets musicales: sirve como anotador automático para preclasificar grandes colecciones antes de una revisión humana, reduciendo el coste de curación.
- Investigación en MIR (Music Information Retrieval): punto de partida reproducible para experimentos de clasificación de género, con métricas de referencia claras (91 % accuracy).
- Prototipado de aplicaciones de streaming musical: permite construir rápidamente un clasificador de género para filtrar o enrutar contenido en un pipeline de producción.
- Educación y demostraciones: modelo ligero (86 M de parámetros) que cabe en GPU de consumo para talleres y cursos sobre transformers aplicados a audio.
- Benchmarking de pipelines de extracción de características: al ser un ajuste fino sobre AST, permite comparar distintas estrategias de preprocesado de espectrogramas frente a una referencia conocida.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,91 |
| Audio Classification | GTZAN (marsyas/gtzan) | Loss | 0,3075 |

Evolución del entrenamiento declarada:

| Epoca | Training Loss | Validation Loss | Accuracy |
|---|---|---|---|
| 1 | 0,8012 | 0,4603 | 0,87 |
| 2 | 0,2733 | 0,4735 | 0,82 |
| 3 | 0,2001 | 0,3694 | 0,89 |
| 4 | 0,0111 | 0,3363 | 0,91 |
| 5 | 0,0071 | 0,3057 | 0,91 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 350 MB para los pesos (86 M de parámetros × 4 bytes), más overhead de activaciones y del proceso de extracción de espectrogramas.
- VRAM estimada en fp16/bf16: aproximadamente 175 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (GTX 1060 6 GB en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (Pipeline de audio-classification), TorchScript, ONNX Runtime; no se documenta soporte nativo en vLLM, llama.cpp ni Ollama (no aplica a modelos de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HosseinSch/ast-finetuned-gtzan | 86,2 M | espectrograma Mel (~10 s) | 91 % accuracy (declarado) | BSD-3-Clause | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 | ~87 M | espectrograma Mel (~10 s) | no especializado en GTZAN | BSD-3-Clause | Hugging Face |
| Modelos CNN clásicos para GTZAN (p. ej. basados en VGG/ResNet) | variable | espectrograma Mel | no disponible en esta ficha | variable | variable |

No se dispone de datos comparativos verificados con alternativas específicas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en los 10 géneros de GTZAN; no generaliza a otros géneros ni a tareas de audio fuera de ese dominio sin reentrenamiento.
- GTZAN es un dataset pequeño (1.000 pistas) y con problemas conocidos de duplicados y etiquetas ruidosas; el 91 % de accuracy puede no reflejar el rendimiento en audio real diverso.
- Riesgo de sobreajuste: la pérdida de entrenamiento cae a 0,0071 mientras la de validación se estanca en ~0,30, lo que sugiere posible sobreajuste al conjunto de evaluación.
- No se documentan sesgos específicos, pero al entrenarse en un corpus musical limitado puede infrarepresentar géneros no occidentales o subgéneros.
- No hay información sobre el rendimiento en fragmentos más cortos o más largos que la ventana de entrenamiento.
- La licencia BSD-3-Clause permite uso comercial con atribución, pero el modelo base (MIT/ast-finetuned-audioset) debe respetarse igualmente.
- La model card está generada automáticamente y carece de secciones de usos previstos, limitaciones y descripción detallada; el autor no ha completado esa documentación.
- No se han verificado de forma independiente los resultados declarados (verified: false en el model-index).

## Enlaces

- Hugging Face: https://huggingface.co/HosseinSch/ast-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Paper AST (Audio Spectrogram Transformer): no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
