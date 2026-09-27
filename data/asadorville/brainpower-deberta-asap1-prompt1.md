# asadorville/brainpower-deberta-asap1-prompt1

## Resumen

BrainPower DeBERTa Prompt 1 es un modelo de clasificación/regresión para corrección automática de ensayos (Automated Essay Scoring, AES), publicado por el usuario asadorville en HuggingFace. Se trata de un ajuste fino de microsoft/deberta-v3-base sobre el Prompt 1 del corpus ASAP (Automated Student Assessment Prize), con anotaciones de cinco rasgos procedentes del corpus ASAP++. El modelo no genera texto: devuelve cinco salidas de regresión continua, una por rasgo (Content, Organization, Word Choice, Sentence Fluency y Conventions).

El interés del modelo es acotado pero claro: forma parte del sistema BrainPower y está pensado como herramienta de asistencia a la corrección humana, no como sustituto. Con 184.425.989 parámetros y un repositorio de 0,7 GB, es un modelo compacto que puede ejecutarse en hardware de consumo. La model card es explícita sobre su alcance limitado: fue entrenado para un único prompt y un marco de puntuación concreto, por lo que no debe interpretarse como un corrector de ensayos de propósito general.

La relevancia actual es la de un ejemplo reproducible de ajuste fino de un encoder para una tarea de regresión multietiqueta en el ámbito educativo. No obstante, conviene señalar dos avisos: la model card indica que la base es DeBERTa-v3-base, mientras que las etiquetas del repositorio indican `deberta-v2`; además, la licencia no está declarada, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base segun la model card; la etiqueta del repositorio indica deberta-v2) |
| Parametros totales | 184.425.989 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; DeBERTa-v3-base emplea atencion con posiciones relativas y una ventana tipica de 512 tokens |
| Tipos de cuantizacion | No disponible (repositorio en safetensors; no se declaran versiones cuantizadas) |
| Idiomas soportados | No disponible en la model card; los ensayos del corpus ASAP estan redactados en ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Autor | asadorville |
| Tarea | Regresion multi-salida (5 rasgos) para evaluacion automatica de ensayos |
| Cabeza de salida | 5 valores de regresion continua (Content, Organization, Word Choice, Sentence Fluency, Conventions) |
| Modelo base | microsoft/deberta-v3-base |
| Datos de entrenamiento | ASAP Prompt 1 (textos) + anotaciones ASAP++ (rasgos) |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es la de DeBERTa-v3-base: un transformer encoder con mecanismo de atencion desencontrada (disentangled attention), en el que el contenido y la posicion de cada token se codifican en vectores separados, y con una variante de embedding de tipo ELECTRA en la que el generador de tokens ha sido sustituido por un mecanismo de n-gramas compartidos. En la practica, esto implica un encoder de 12 capas y 768 dimensiones ocultas, sin decodificador autoregresivo. Sobre ese backbone se ha añadido una cabeza de clasificación/regresión, cargable mediante `AutoModelForSequenceClassification`, que proyecta la representación del token [CLS] a cinco valores continuos.

El ajuste fino se realizó sobre los ensayos del Prompt 1 del corpus ASAP, emparejados por identificador de ensayo con las anotaciones de rasgos del corpus ASAP++. La model card no especifica hiperparámetros, número de épocas, tasa de aprendizaje, composición exacta del split ni si hubo etapas de RLHF o DPO (no tendría sentido en esta tarea, al ser regresión supervisada). Tampoco se documenta ninguna innovación técnica adicional más allá de la propia arquitectura DeBERTa-v3 y del esquema de cinco salidas de regresión.

Un detalle relevante para quien quiera reproducir o reutilizar el trabajo: la model card muestra un fragmento de código de uso con un error de referencia (`model` como cadena y luego `model_name` como variable, y sin definir `AutoTokenizer` en el import). No se documentan métricas de validación, curvas de entrenamiento ni análisis de error.

## Capacidades

- Puntuación automática de ensayos: produce cinco valores de regresión continua correspondientes a Content, Organization, Word Choice, Sentence Fluency y Conventions.
- Evaluación de rasgos independientes: en lugar de una única nota global, devuelve una puntuación por dimensión, lo que permite analítica granular del texto.
- Procesamiento de textos de tipo ensayo argumentativo o expositivo en inglés (idioma del corpus ASAP).
- Inferencia puramente discriminativa: no genera texto, no mantiene conversaciones y no produce explicaciones ni justificaciones de la nota.
- Integración sencilla con HuggingFace Transformers mediante `AutoModelForSequenceClassification`.
- Redondeo y acotación de las salidas: según la model card, es la aplicación BrainPower (no el modelo) la que redondea y restringe los valores al rango de puntuación adecuado para mostrarlos al usuario.
- No consta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no declaradas; el modelo se entrenó con material en inglés.

## Casos de uso

- Corrección asistida en plataformas de aprendizaje: el modelo puntúa los cinco rasgos de un ensayo y presenta las puntuaciones al docente, que las revisa y ajusta antes de publicar la calificación. Es adecuado porque devuelve una estimación de regresión por rasgo, lo que facilita la revisión humana dimension por dimension.
- Generación de feedback formativo sobre borradores: al obtener una nota baja en Conventions o en Word Choice y alta en Content, un sistema externo puede generar recomendaciones específicas de mejora. El modelo aporta la señal cuantitativa; el texto de feedback lo produce otro componente.
- Triaje de grandes volúmenes de entregas: en un curso con cientos de ensayos por semana, el modelo ordena por puntuación estimada y permite al docente priorizar la revisión de los casos dudosos o extremos.
- Investigación en NLP educativo: sirve como punto de partida reproducible para experimentos de AES sobre el Prompt 1 de ASAP con anotaciones ASAP++, y como baseline frente a otros encoders.
- Análisis de cohortes y analítica curricular: agregando las cinco dimensiones a lo largo de un curso se pueden detectar áreas del currículo (por ejemplo, organización del discurso) en las que un grupo rinde por debajo de lo esperado.
- Filtrado previo en procesos de admisión o becas: como primer cribado no vinculante para detectar ensayos que requieren lectura prioritaria, siempre con revisión humana posterior y teniendo en cuenta las advertencias de licencia y de generalización.
- Ajuste fino adicional o destilación: dado su tamaño (184 M de parámetros), es viable reentrenar la cabeza o el modelo completo en un conjunto propio de ensayos con GPU de consumo, partiendo de este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de correlación (por ejemplo, QWK, Pearson o Spearman), ni valores de error (MAE, RMSE), ni comparaciones cuantitativas frente a otros sistemas de AES sobre ASAP Prompt 1.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de 184,4 M de parámetros, sin incluir activaciones ni el pico de memoria del tokenizador):
  - FP32: aproximadamente 0,74 GB de pesos.
  - FP16/BF16: aproximadamente 0,37 GB.
  - INT8: aproximadamente 0,18 GB.
  - INT4: aproximadamente 0,09 GB.
- En la práctica, con activaciones y batch pequeño, un presupuesto de 1-2 GB de VRAM es suficiente en FP16; las cifras anteriores son estimaciones a partir del recuento de parámetros y no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve para inferencia. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 son más que suficientes; A100 o H100 solo tienen sentido para lotes muy grandes o para reentrenamiento.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de gama media o superior, e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable para volúmenes moderados, ya que se trata de un encoder de 184 M de parámetros y secuencias de hasta 512 tokens.
- Opciones de despliegue: HuggingFace Transformers (vía `AutoModelForSequenceClassification`), exportación a ONNX Runtime o TorchScript para servir, y frameworks de serving genéricos compatibles con modelos tipo encoder. No se declaran pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin una conversión propia. vLLM y TGI están orientados a modelos generativos y no encajan con esta cabeza de regresión sin adaptaciones.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor; cualquier cifra dependería del hardware, del lote y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asadorville/brainpower-deberta-asap1-prompt1 | 184,4 M | No disponible (tipicamente 512 en DeBERTa-v3-base) | Regresion de 5 rasgos de ensayo (ASAP Prompt 1) | No disponible | HuggingFace, safetensors |
| microsoft/deberta-v3-base | 184,4 M | 512 tokens | Modelo base, sin cabeza de tarea | MIT | HuggingFace, safetensors |
| FacebookAI/roberta-base | 125 M | 514 tokens | Modelo base, sin cabeza de tarea | MIT | HuggingFace, safetensors |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base, sin cabeza de tarea | Apache 2.0 | HuggingFace, safetensors |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento predictivo de este checkpoint frente a otros sistemas de AES entrenados sobre ASAP. Las alternativas de la tabla son modelos base sin ajuste para la tarea, por lo que la comparación es estructural (tamaño, contexto, licencia) y no de rendimiento. Existen otros trabajos académicos de AES sobre ASAP, pero no forman parte de la información proporcionada.

## Limitaciones y advertencias

- Sesgo de prompt: el modelo se entrenó únicamente con el Prompt 1 de ASAP. La model card advierte explícitamente de que el rendimiento puede degradarse con otros enunciados, otras poblaciones de estudiantes u otros criterios de puntuación.
- No es un corrector de propósito general: la propia model card indica que no debe interpretarse como un modelo general de evaluación de ensayos.
- Riesgo de alucinación: no aplica en el sentido generativo, porque el modelo no produce texto. El riesgo equivalente es una puntuación mal calibrada fuera de la distribución de entrenamiento, presentada con apariencia de valor preciso.
- Idiomas: no se declaran capacidades multilingües. Los ensayos del corpus ASAP están en inglés; su uso con textos en castellano no está validado.
- Longitud de contexto: no especificada en la model card. Los ensayos que excedan la ventana del tokenizador serán truncados, con pérdida de información en rasgos como Organization o Content.
- Licencia: no declarada. Aunque el modelo base DeBERTa-v3-base se distribuye bajo licencia MIT, la ausencia de licencia explícita en este repositorio impide asumir que se pueda usar comercialmente. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Falta de métricas: sin valores de correlación ni de error publicados, no es posible estimar la calidad real del ajuste ni fijar umbrales de confianza.
- Ámbito de uso declarado: herramienta de asistencia al evaluador humano, no sustituto. Cualquier despliegue que emita calificaciones definitivas sin revisión humana contraviene la intención declarada por el autor.
- Cero descargas y cero likes: el modelo es reciente y no tiene validación por parte de la comunidad.
- Inconsistencia documental: la etiqueta `deberta-v2` del repositorio contradice la model card, que indica `deberta-v3-base`. Verificar la arquitectura real antes de integrarlo en un pipeline.
- Ejemplo de código incompleto en la model card (import de `AutoTokenizer` ausente y variable `model`/`model_name` confundida), lo que puede inducir a errores en una primera integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asadorville/brainpower-deberta-asap1-prompt1
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Paper de DeBERTaV3 (He et al., 2021): https://arxiv.org/abs/2111.09543
- Dataset ASAP (Automated Student Assessment Prize): https://www.kaggle.com/c/asap-aes
- Dataset ASAP++ (anotaciones de rasgos): no se ha encontrado un enlace directo en la información proporcionada
- Repositorio o demo del sistema BrainPower: no disponible
- No se han encontrado papers, blogs ni repos adicionales específicos de este modelo en la búsqueda web realizada; los resultados devueltos correspondían a contenidos no relacionados con el modelo.
