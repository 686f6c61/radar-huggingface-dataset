# apase95/ast-finetuned-gtzan

## Resumen

`ast-finetuned-gtzan` es un modelo de clasificación de audio basado en el Audio Spectrogram Transformer (AST), desarrollado por el usuario apase95 mediante fine-tuning del checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593` sobre el dataset GTZAN. El modelo resuelve la tarea de clasificación de géneros musicales a partir de audio en bruto, transformando la señal a espectrogramas y aplicando un transformer de visión adaptado al dominio acústico.

El modelo cuenta con 86.196.490 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,3 GB, lo que lo sitúa en un rango de tamaño manejable para inferencia en hardware modesto. Su relevancia radica en que es un ejemplo canónico de transferencia desde un modelo preentrenado en AudioSet (527 clases de eventos sonoros) hacia una tarea musical específica de 10 clases, con una precisión declarada del 90 % en el conjunto de evaluación.

La ficha se ha elaborado a partir de la información pública del repositorio de Hugging Face y de la model card autogenerada por el Trainer. El autor no ha documentado usos previstos, limitaciones ni composición detallada del dataset, por lo que varios apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer de visión aplicado a espectrogramas de audio |
| Parametros totales | 86.196.490 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrada basada en ventanas de espectrograma; la configuración concreta no se documenta) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión original) |
| Idiomas soportados | no aplica (clasificación de audio, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |
| Tarea | audio-classification |
| Dataset de fine-tuning | marsyas/gtzan (config `all`) |
| Modelo base | MIT/ast-finetuned-audioset-10-10-0.4593 |
| Numero de clases | 10 (géneros musicales de GTZAN) |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Framework de entrenamiento | PyTorch 2.14.1+cu130, Transformers 5.22.1, Datasets 2.21.0, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Audio Spectrogram Transformer: un transformer de visión estándar que recibe como entrada espectrogramas Mel de audio divididos en parches, sin convoluciones previas. Esta arquitectura fue introducida en el trabajo *AST: Audio Spectrogram Transformer* (Gong et al., 2021) y el checkpoint base `MIT/ast-finetuned-audioset-10-10-0.4593` fue preentrenado y ajustado en AudioSet, un corpus de más de 2 millones de clips etiquetados con 527 clases de eventos sonoros.

El fine-tuning sobre GTZAN se realizó con los siguientes hiperparámetros declarados en la model card: learning rate de 3e-05, batch size de 8 tanto en entrenamiento como en evaluación, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con 30 pasos de warmup, 6 épocas, semilla 42 y precisión mixta nativa (AMP). El entrenamiento completó 678 pasos. No se documenta el número de tokens de audio, la composición exacta del dataset más allá de la referencia a GTZAN, ni si se aplicaron técnicas de aumento de datos o regularización adicionales.

La evolución del entrenamiento muestra un sobreajuste progresivo: la pérdida de entrenamiento cae de 0,6523 en la época 1 a 0,0028 en la época 6, mientras que la pérdida de validación se estabiliza alrededor de 0,38-0,40 desde la época 4. La mejor precisión de validación se alcanzó en la época 4 (0,93), y el checkpoint final reporta 0,90.

## Capacidades

- Clasificación de audio en 10 géneros musicales de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Procesamiento de audio en bruto mediante extracción de características espectrográficas, sin necesidad de transcripción ni modelos auxiliares de ASR.
- Transferencia de conocimiento desde AudioSet: el modelo conserva representaciones de eventos sonoros generales que pueden aprovecharse para tareas de audio distintas del género musical, aunque no se ha validado en esta ficha.
- Inferencia por lotes con la API estándar de `transformers` (`AutoModelForAudioClassification`).
- Compatibilidad con `pipeline("audio-classification")` de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador discriminativo, no un modelo generativo.
- No soporta visión, audio descriptivo ni capacidades multilingües en el sentido de NLP.
- No dispone de modo "thinking" ni de salida de cadena de razonamiento.

## Casos de uso

- **Etiquetado automático de bibliotecas musicales**: dado un catálogo de pistas sin metadatos de género, el modelo permite clasificarlas en las 10 categorías de GTZAN para enriquecer la indexación y habilitar filtros de búsqueda. Es adecuado por su reducido tamaño (86 M de parámetros) y su precisión del 90 % en el dominio de evaluación.
- **Sistemas de recomendación musical por género**: como señal auxiliar en un motor de recomendación, el clasificador aporta una etiqueta de género de bajo coste computacional que puede combinarse con embeddings de audio u otras señales colaborativas.
- **Análisis de contenido en plataformas de streaming**: para moderación o categorización de subidas de usuarios, el modelo permite detectar el género predominante de un clip y enrutarlo a la sección correspondiente del catálogo.
- **Investigación en music information retrieval (MIR)**: como baseline reproducible para experimentos de clasificación de género, dado que parte de un checkpoint AST público y documenta hiperparámetros de entrenamiento.
- **Preprocesado en pipelines de datos de audio**: para generar etiquetas débiles sobre grandes volúmenes de audio que alimenten posteriores etapas de anotación humana o de entrenamiento de modelos más específicos.
- **Prototipado educativo y demos**: por su tamaño contenido y su integración directa con `transformers`, sirve para talleres y demostraciones de clasificación de audio sin requerir GPU de gama alta.
- **Filtrado previo en herramientas de DJ y producción**: para separar automáticamente pistas por género antes de aplicar procesado o selección manual en sesiones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (config `all`) | Accuracy | 0,90 |
| Audio Classification | GTZAN (validación, mejor época) | Accuracy | 0,93 (época 4) |
| Audio Classification | GTZAN (validación, checkpoint final) | Loss | 0,3897 |

Evolución del entrenamiento declarada:

| Época | Paso | Training Loss | Validation Loss | Accuracy |
|---|---|---|---|---|
| 1 | 113 | 0,6523 | 0,4975 | 0,81 |
| 2 | 226 | 0,1834 | 0,5737 | 0,83 |
| 3 | 339 | 0,0385 | 0,4392 | 0,88 |
| 4 | 452 | 0,0080 | 0,3807 | 0,93 |
| 5 | 565 | 0,0007 | 0,3950 | 0,91 |
| 6 | 678 | 0,0028 | 0,3897 | 0,90 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks de NLP, ya que no aplican a esta tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP32, los 86,2 M de parámetros ocupan aproximadamente 345 MB; en FP16/BF16, unos 172 MB. A ello hay que sumar el espacio de activaciones y el buffer de espectrograma, por lo que en la práctica se recomienda reservar entre 1 y 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona en RTX 3050, RTX 3060, RTX 4060, T4, L4, A10, A100 y H100 sin problemas. En A100/H100 el cuello de botella será el preprocesado de audio, no el modelo.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años, e incluso puede ejecutarse en CPU para volúmenes moderados.
- **Opciones de despliegue**: `transformers` con `pipeline("audio-classification")`, `optimum` para exportación a ONNX, TorchScript, y servidores de inferencia como TorchServe o Triton. No se han publicado pesos GGUF ni integraciones específicas con llama.cpp u Ollama (no aplican a este tipo de modelo).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dependerán del hardware, de la duración de los clips y del tamaño de lote; para clips de 30 segundos en una GPU moderna se espera un orden de milisegundos por muestra, pero no se aporta medición concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apase95/ast-finetuned-gtzan | 86,2 M | espectrograma de audio (configuración no documentada) | 0,90 accuracy (declarado) | BSD-3-Clause | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 | ~86 M | espectrograma de audio | no evaluado en GTZAN (preentrenado en AudioSet) | BSD-3-Clause (según repositorio base) | Hugging Face |
| Modelos CNN clásicos para GTZAN (p. ej. CNN sobre mel-espectrogramas) | variable (típicamente 1-10 M) | mel-espectrograma | típicamente 0,80-0,90 según configuración | variable | múltiples repositorios |

La comparación directa con alternativas concretas no está disponible en la información proporcionada más allá del modelo base. No se dispone de datos de otros checkpoints AST ajustados a GTZAN con los que contrastar de forma rigurosa.

## Limitaciones y advertencias

- **Sobreajuste**: la pérdida de entrenamiento cae a 0,0028 mientras la de validación se mantiene en 0,3897; el modelo memoriza el conjunto de entrenamiento en las últimas épocas y el checkpoint final no es el de mejor validación (época 4, 0,93).
- **Sesgos del dataset GTZAN**: GTZAN es un corpus pequeño (1.000 pistas de 30 segundos, 100 por género) con errores de etiquetado documentados en la literatura y posible contaminación entre splits. La precisión del 90 % debe interpretarse con cautela.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero el modelo puede asignar un género con alta confianza a audio fuera de distribución (voz, ruido, música no occidental), produciendo etiquetas incorrectas sin señal de incertidumbre calibrada.
- **Limitación de dominio**: solo cubre 10 géneros; no reconoce subgéneros, fusiones ni tradiciones musicales fuera de GTZAN.
- **Idioma y contenido cultural**: el dataset está sesgado hacia música occidental de las décadas de 1990-2000; el rendimiento en otras tradiciones musicales no está evaluado.
- **Documentación insuficiente**: la model card indica "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento. No se detalla la composición exacta del split ni si se aplicaron aumentos de datos.
- **Licencia**: BSD-3-Clause permite uso comercial y modificación con atribución y cláusula de no endorsement; conviene revisar también la licencia del checkpoint base `MIT/ast-finetuned-audioset-10-10-0.4593` y del dataset GTZAN para uso en producción.
- **Verificación**: el resultado de accuracy está marcado como `verified: false`; no ha sido reproducido de forma independiente.
- **Producción**: al ser un modelo de un único autor con 0 descargas y 0 likes en el momento de la consulta, no cuenta con validación comunitaria ni mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apase95/ast-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Paper original de AST (Gong et al., 2021): https://arxiv.org/abs/2104.01778
- Repositorio oficial de AST: https://github.com/YuanGongND/ast
- Documentación de `transformers` para clasificación de audio: https://huggingface.co/docs/transformers/tasks/audio_classification
