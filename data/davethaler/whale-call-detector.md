# davethaler/whale-call-detector

## Resumen

whale-call-detector es un modelo de clasificación de audio obtenido mediante fine-tuning supervisado del checkpoint MIT/ast-finetuned-audioset-10-10-0.4593, un Audio Spectrogram Transformer (AST) preentrenado sobre AudioSet. Lo publica el usuario davethaler en Hugging Face y su propósito declarado es detectar y clasificar llamadas de ballena junto con otras clases acústicas (embarcaciones, sonidos humanos, aves y ruido de tipo "jingle"). El modelo parte de una arquitectura transformer aplicada directamente a espectrogramas de Mel, con 86.194.952 parámetros totales en formato safetensors.

La relevancia práctica del modelo reside en su especialización: parte de un backbone genérico de clasificación de audio y lo ajusta a un conjunto etiquetado de ocho clases de interés bioacústico y antropogénico. El autor reporta en la model card una accuracy de 0,9208, precision de 0,9274, recall de 0,9208 y F1 de 0,9121 sobre el conjunto de evaluación, con F1 por clase que oscila entre 0,88 (Transient) y 0,9474 (Water). Es, por tanto, un modelo pequeño y desplegable en hardware modesto, orientado a tareas de monitorización acústica pasiva.

No obstante, la documentación es muy incompleta: la model card indica explícitamente "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento, y el campo de idiomas no está disponible (es un modelo de audio, no de texto). El repositorio ocupa 136,4 GB, un tamaño desproporcionado respecto a los 86 millones de parámetros, lo que sugiere la presencia de artefactos adicionales (checkpoints intermedios, logs o datasets) más allá de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer sobre espectrogramas de Mel |
| Parametros totales | 86.194.952 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana dependiente del preprocesado de espectrogramas, no documentada) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser safetensors FP32/FP16 es cuantificable a 8 y 4 bits con herramientas estándar) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de MIT/ast-finetuned-audioset-10-10-0.4593, un Audio Spectrogram Transformer que procesa espectrogramas de Mel como si fueran imágenes y aplica auto-atención sobre parches del espectrograma. El backbone original se preentrenó en AudioSet (10 segundos de audio, 10 clases de nivel superior según la nomenclatura del checkpoint base), y este fine-tuning lo adapta a ocho clases específicas: Water, Resident, Transient, Humpback, Vessel, Jingle, Human y Bird. No se documenta la composición del dataset de ajuste ni el número de ejemplos utilizados.

El entrenamiento se realizó con el Trainer de Transformers (generated_from_trainer) durante 8 épocas, con batch size de 8, learning rate 3e-05, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 40 pasos de warmup y semilla 42. La pérdida de entrenamiento cae de 0,6763 en la época 1 a 0,0003 en la época 8, mientras que la pérdida de validación se estabiliza alrededor de 0,37-0,39 desde la época 6, lo que indica un ajuste muy agresivo sobre el conjunto de entrenamiento y un posible sobreajuste a partir de ese punto. No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos.

## Capacidades

- Clasificación de audio en ocho clases: Water, Resident, Transient, Humpback, Vessel, Jingle, Human y Bird.
- Detección de llamadas de ballena, incluyendo las categorías Resident, Transient y Humpback según la nomenclatura de la model card.
- Discriminación de fuentes antropogénicas y ambientales: embarcaciones (Vessel), sonidos humanos (Human), aves (Bird) y ruido de tipo Jingle.
- Pipeline de audio-classification compatible con la librería transformers y endpoints_compatible.
- No soporta tool calling, function calling ni razonamiento multi-step: es un clasificador, no un modelo generativo.
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan modos especiales (thinking, visión, audio generativo) más allá de la clasificación.

## Casos de uso

- Monitorización acústica pasiva de cetáceos: el modelo puede procesar grabaciones de hidrófonos y etiquetar segmentos como Resident, Transient o Humpback, lo que permite inventariar presencia de especies sin revisión manual continua. Es adecuado por su tamaño reducido y su F1 por clase superior a 0,88 en todas las categorías de ballena.
- Detección de tráfico marítimo en reservas marinas: la clase Vessel (F1 0,9091) permite identificar presencia de embarcaciones en ventanas de audio, útil para correlacionar ruido antropogénico con perturbaciones en el comportamiento de cetáceos.
- Filtrado y curación de datasets bioacústicos: el modelo puede preetiquetar grandes archivos de audio antes de una revisión humana, reduciendo el coste de anotación en proyectos de investigación marina.
- Sistemas de alerta temprana en boyas o plataformas: al ser un modelo de 86 M de parámetros, cabe en GPUs de consumo y puede desplegarse en estaciones de borde con procesamiento por lotes de espectrogramas.
- Análisis de impacto ambiental: la clasificación conjunta de ballenas, embarcaciones y sonidos humanos permite construir indicadores de presión antrópica sobre hábitats marinos a partir de registros acústicos pasivos.
- Investigación en ecología acústica comparada: las clases Bird, Human y Jingle permiten descartar falsos positivos y separar fuentes biológicas de fuentes artificiales en estudios de paisaje sonoro.
- Educación y divulgación: el modelo puede integrarse en demos interactivas que clasifiquen fragmentos de audio marino en tiempo casi real, dado su bajo coste computacional.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (conjunto de evaluación no documentado) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0,3843 |
| Accuracy | 0,9208 |
| Precision | 0,9274 |
| Recall | 0,9208 |
| F1 | 0,9121 |
| F1 Water | 0,9474 |
| F1 Resident | 0,9231 |
| F1 Transient | 0,88 |
| F1 Humpback | 0,9333 |
| F1 Vessel | 0,9091 |
| F1 Jingle | 0,9333 |
| F1 Human | 0,9412 |
| F1 Bird | 0,9091 |

El model-index del repositorio no contiene resultados adicionales (`results: []`). No se han publicado comparaciones con otros modelos de clasificación bioacústica en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en FP32 (86 M de parámetros × 4 bytes), alrededor de 0,17 GB en FP16 y menos de 0,1 GB en cuantización de 8 bits, sin contar activaciones ni buffers de espectrograma.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para procesamiento por lotes con latencia aceptable.
- Opciones de despliegue: transformers con pipeline de audio-classification, endpoints de Hugging Face (marcado como endpoints_compatible), ONNX Runtime y TorchScript. No se documenta soporte nativo en vLLM ni llama.cpp (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño de la ventana de audio y del hardware. Al tratarse de un transformer de 86 M de parámetros, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davethaler/whale-call-detector | 86,19 M | espectrogramas de audio (ventana no documentada) | F1 0,9121; accuracy 0,9208 en evaluación propia | BSD-3-Clause | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 (modelo base) | ~86 M | espectrogramas de audio de 10 s | preentrenado en AudioSet; métricas específicas no disponibles en esta ficha | no disponible en la información proporcionada | Hugging Face |
| Modelos de clasificación bioacústica especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas especializadas en detección de ballenas; la comparación más directa es con el checkpoint base del que deriva, que ofrece un espacio de etiquetas genérico de AudioSet en lugar de las ocho clases específicas de este fine-tuning.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed") en descripción, usos previstos, limitaciones y datos de entrenamiento, lo que impide evaluar la representatividad del conjunto de evaluación.
- El conjunto de evaluación no está documentado: las métricas reportadas no pueden contextualizarse ni reproducirse sin acceso al dataset.
- Riesgo de sobreajuste: la pérdida de entrenamiento cae a 0,0003 mientras la de validación se mantiene en torno a 0,38, y las métricas se estancan desde la época 6, lo que sugiere que el modelo puede no generalizar bien fuera de la distribución de entrenamiento.
- No se documentan sesgos conocidos, pero al derivar de AudioSet el backbone hereda los sesgos de dicho corpus en cuanto a fuentes, geografías y condiciones de grabación.
- Riesgo de alucinación en sentido de clasificación: al ser un clasificador de ocho clases, siempre asignará una de ellas a cualquier entrada, incluidas señales fuera de distribución, sin mecanismo de rechazo documentado.
- El campo de idiomas no está disponible y no aplica; el modelo no procesa texto.
- La licencia BSD-3-Clause permite uso comercial con atribución y sin garantías, pero el modelo base MIT/ast-finetuned-audioset-10-10-0.4593 debe verificarse por separado para confirmar compatibilidad.
- El tamaño del repositorio (136,4 GB) es muy superior al de los pesos del modelo, lo que puede complicar la descarga y el despliegue; conviene descargar únicamente los archivos safetensors necesarios.
- No hay información sobre el preprocesado exacto (frecuencia de muestreo, número de mel bins, duración de ventana), lo que dificulta reproducir la inferencia tal como se entrenó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davethaler/whale-call-detector
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
