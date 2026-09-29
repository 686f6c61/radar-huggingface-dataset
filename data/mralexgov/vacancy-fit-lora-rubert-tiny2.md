# MrAlexGov/vacancy-fit-lora-rubert-tiny2

## Resumen

`MrAlexGov/vacancy-fit-lora-rubert-tiny2` es un adaptador LoRA (PEFT) sobre el encoder ruso `cointegrated/rubert-tiny2`, entrenado para una tarea binaria muy concreta: predecir si un candidato concreto (el propio autor) respondería o no a una vacante publicada en hh.ru. No es un modelo generativo ni un asistente: es un clasificador de texto que devuelve una probabilidad para la etiqueta positiva (1 = hubo respuesta). El repositorio contiene únicamente los pesos del adaptador y la cabeza de clasificación, no el modelo base completo, por lo que su tamaño es mínimo.

El proyecto se presenta explícitamente como un ejercicio de aprendizaje (LoRA con `r=16`, `alpha=32`, `dropout=0.1` sobre `query`/`value`, entrenado en CPU), no como un sistema listo para producción. El autor documenta con transparencia que su adaptador **no supera** a un básculo ingenuo de TF-IDF con regresión logística: en validación cruzada de 5 particiones obtiene PR-AUC 0,427 frente a 0,582 del básculo, con solo 49 ejemplos positivos sobre 414 vacantes. Su interés real es metodológico: muestra los límites del fine-tuning con LoRA cuando el conjunto de datos es pequeño, desbalanceado (11,8 % de positivos) y no publicable.

Es relevante ahora porque ejemplifica un patrón habitual en el ecosistema open source: adaptadores PEFT de bajo coste sobre modelos diminutos para tareas de clasificación de nicho, con evaluación honesta y umbral de decisión calibrado a mano (0,47). Cualquier equipo que plantee un filtrado de vacantes, un ranking de ofertas o un sistema de recomendación de empleo encontrará aquí un punto de partida reproducible y, sobre todo, una advertencia sobre cuándo conviene quedarse con un básculo clásico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `cointegrated/rubert-tiny2`, encoder tipo BERT con cabeza de clasificación de secuencias (2 etiquetas) |
| Parametros totales | No disponible. El adaptador usa LoRA `r=16`, `alpha=32` sobre las proyecciones `query`/`value` más una cabeza clasificadora entrenable; la información proporcionada no indica la cifra exacta |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (`max_len` usado en entrenamiento; no se especifica la ventana máxima del modelo base) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos del adaptador en precisión original; no hay versiones GGUF, AWQ, GPTQ ni cuantizadas |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT, librería `peft`; se carga con `AutoPeftModelForSequenceClassification`) |
| Tarea | Clasificación de texto binaria (`pipeline_tag: text-classification`) |
| Etiquetas | 1 = el candidato respondió a la vacante; 0 = vacante vista y descartada |
| Modelo base | `cointegrated/rubert-tiny2` |
| Datos de entrenamiento | 414 vacantes (título + descripción, hasta 2.500 caracteres); 49 positivos (11,8 %) y 365 negativos. Dataset no publicado |
| Tamaño del repositorio | 0,0 GB (según la ficha de HuggingFace) |
| Umbral recomendado | 0,47 (tomado de `metrics.json`) |

## Arquitectura y entrenamiento

La arquitectura es la del encoder `rubert-tiny2` con un adaptador LoRA insertado en las proyecciones `query` y `value` de las capas de atención, más una cabeza de clasificación entrenable sobre la representación del token `[CLS]`. La configuración declarada es `r=16`, `alpha=32`, `dropout=0.1`, con `max_len=256`. La pérdida es una entropía cruzada ponderada por clase para compensar el desbalance (49 positivos frente a 365 negativos), optimizador AdamW con `lr=5e-4`, hasta 10 épocas y selección de la mejor época por PR-AUC en validación. Todo el entrenamiento se realizó en CPU, lo que da una idea del coste computacional del conjunto.

Los datos proceden del diario personal de búsqueda de empleo del autor: 414 vacantes de hh.ru con título y descripción truncada a 2.500 caracteres. La etiqueta positiva marca que el candidato respondió; la negativa, que vio la oferta y la descartó. El dataset no se publica porque los textos pertenecen a los empleadores. No se menciona ninguna fase de RLHF, DPO ni ajuste por preferencias, algo coherente con una tarea de clasificación supervisada. Como innovación técnica destacable no hay ninguna: el valor del proyecto está en la evaluación, que incluye validación cruzada de 5 particiones con predicciones *out-of-fold* y un umbral elegido dentro de cada partición para evitar fuga de información.

## Capacidades

- Clasificación binaria de texto en ruso: dada una vacante (título y descripción), estima la probabilidad de que ese candidato concreto responda.
- Puntuación de ranking: aunque las probabilidades están mal calibradas y comprimidas en torno a 0,4–0,5, el orden relativo sí es aprovechable para priorizar vacantes.
- Umbral de decisión ajustable: el autor recomienda 0,47 y advierte de que conviene usar el ranking antes que el valor absoluto de la probabilidad.
- Entrada limitada a 256 tokens, suficiente para título más un fragmento de la descripción según el formato del dataset original.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No tiene capacidades de agente ni de planificación.
- No soporta visión, audio ni multimodalidad.
- Multilingüismo: ninguno. Solo ruso; el modelo base es monolingüe y el entrenamiento se hizo exclusivamente con textos rusos.
- No dispone de modo "thinking", ni de salidas estructuradas más allá del vector de logits de dos clases.

## Casos de uso

- **Asistente personal de búsqueda de empleo**: un script recorre las vacantes nuevas de un portal, las puntúa con el adaptador y envía por correo solo las que superan el umbral. El modelo es tan pequeño que se ejecuta en CPU sin coste relevante de infraestructura.
- **Priorización de la bandeja de vacantes**: en lugar de filtrar, reordenar las ofertas guardadas por probabilidad descendente. Aquí se aprovecha el ranking aunque la calibración sea mala, que es exactamente la recomendación del autor.
- **Automatización de alertas en un portal de empleo**: predecir la probabilidad de respuesta del usuario para decidir qué notificaciones push enviar y evitar fatiga de notificaciones, usando el umbral 0,47 como corte.
- **Investigación sobre PEFT con datos escasos**: el repositorio incluye `train.py` y métricas de validación cruzada, lo que lo convierte en un caso de estudio reproducible sobre cuándo LoRA no compensa frente a un básculo clásico.
- **Básculo en sistemas de recomendación de ofertas**: sirve como comparativa obligatoria antes de invertir en un clasificador mayor (por ejemplo `ruBERT-base`), ya que el propio autor demuestra que TF-IDF sigue ganando.
- **Análisis de embudo de candidatura**: cruzar la probabilidad estimada con las respuestas reales para estudiar qué atributos de la oferta (formato híbrido, remoto, ciudad, tecnología) correlacionan con la decisión de responder.
- **Generación de conjuntos de prueba para evaluación de clasificadores**: usar las predicciones y el rango PR-AUC 0,43–0,86 entre particiones como referencia de la variabilidad esperable en datasets pequeños y desbalanceados.

## Benchmarks y rendimiento

Resultados publicados por el autor con validación cruzada de 5 particiones, predicciones *out-of-fold* y umbral seleccionado en la validación interna de cada partición:

| Modelo | ROC-AUC | PR-AUC | Precision | Recall | F1 |
|---|---|---|---|---|---|
| Clasificador aleatorio | 0,500 | 0,118 | no disponible | no disponible | no disponible |
| TF-IDF (1–2-gramas) + regresión logística | 0,917 | 0,582 | 0,537 | 0,592 | 0,563 |
| LoRA rubert-tiny2 (este adaptador) | 0,863 | 0,427 | 0,425 | 0,694 | 0,527 |

Conclusiones declaradas por el autor: con solo 49 ejemplos positivos, el adaptador LoRA no supera al básculo TF-IDF, que captura directamente las palabras decisivas (stack tecnológico, "híbrido", ciudad, "outstaff"). La varianza entre particiones es alta (PR-AUC de validación entre 0,43 y 0,86), señal de que hay datos insuficientes para un ajuste estable. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea).

## Requisitos de hardware

- Inferencia viable en CPU: el propio entrenamiento se completó en CPU, y el adaptador se apoya en un modelo base diminuto, por lo que no requiere acelerador.
- VRAM estimada: no disponible de forma oficial. Al tratarse de un adaptador LoRA sobre un encoder muy pequeño, cabe holgadamente en cualquier GPU de consumo actual, incluso en las gamas más modestas (GTX 1050 Ti, GTX 1650, RTX 3050) y en iGPU con memoria compartida.
- GPU recomendadas: cualquiera; el cuello de botella no será el modelo, sino el preprocesado de texto y el acceso al portal de vacantes. No se especifican latencias ni throughput medidos.
- Despliegue: la vía documentada es `transformers` + `peft` con `AutoPeftModelForSequenceClassification`. No hay pesos GGUF, por lo que `llama.cpp` y Ollama no son aplicables directamente; `vLLM` y TGI están pensados para decodificación generativa y no son la herramienta natural para este clasificador. La alternativa razonable es exportar el modelo fusionado a ONNX o TorchScript y servirlo con un endpoint HTTP ligero.
- Latencia y throughput: no disponibles. Al procesar secuencias de 256 tokens con un encoder de dos capas, se espera un coste por inferencia muy bajo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | PR-AUC (mismo conjunto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `MrAlexGov/vacancy-fit-lora-rubert-tiny2` | Adaptador LoRA de clasificación (ruso) | No disponible (LoRA r=16 sobre encoder diminuto) | 256 tokens | 0,427 | MIT | HuggingFace, adaptador PEFT |
| TF-IDF (1–2-gramas) + regresión logística | Básculo clásico | No aplica | No aplica | 0,582 | No aplica | Implementación propia; reproducible en minutos |
| `cointegrated/rubert-tiny2` sin ajustar | Encoder ruso preentrenado | No disponible en la información proporcionada | No disponible | no disponible | No disponible en la información proporcionada | HuggingFace |
| Ajuste completo de `ruBERT-base` | Encoder ruso mayor | No disponible | No disponible | no disponible | No disponible | HuggingFace |

La única comparación con datos medidos en el mismo conjunto es la del básculo TF-IDF, que gana en PR-AUC, precision y F1, mientras que el adaptador LoRA solo supera en recall (0,694 frente a 0,592), coherente con un umbral más agresivo. Las alternativas basadas en `ruBERT-base` aparecen mencionadas por el autor como posible siguiente paso, pero no hay resultados publicados.

## Limitaciones y advertencias

- **Calibración deficiente**: las probabilidades están comprimidas en torno a 0,4–0,5; el valor absoluto no debe interpretarse como probabilidad real de respuesta. Hay que usar el ranking y el umbral 0,47 procedente de `metrics.json`.
- **Rendimiento inferior al básculo**: PR-AUC 0,427 frente a 0,582 con TF-IDF + regresión logística. Usar este adaptador en producción sin comparar antes con el básculo es un error de diseño.
- **Muy pocos datos**: 49 ejemplos positivos y 414 en total. La PR-AUC de validación oscila entre 0,43 y 0,86 según la partición, lo que implica una estabilidad muy baja.
- **Sesgo de dominio**: todos los negativos son vacantes de IT que el autor descartó por formato, ciudad o stack. Con ofertas de otros sectores el comportamiento es impredecible.
- **Sesgo individual**: el modelo refleja las decisiones de una sola persona, no un criterio de mercado ni un perfil de candidato generalizable.
- **Riesgo de correlaciones espurias**: al depender de palabras concretas (tecnologías, "híbrido", ciudad, "outstaff"), puede aprender atajos que no se mantengan si cambia el vocabulario de las ofertas.
- **Solo ruso**: cualquier texto en otro idioma queda fuera de distribución. El tokenizador y el preentrenamiento del modelo base son monolingües.
- **Riesgo de alucinación**: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos con confianza media que el umbral 0,47 puede no filtrar correctamente.
- **Ventana de contexto corta**: 256 tokens obligan a truncar descripciones largas, con la consiguiente pérdida de información relevante.
- **Dataset no reproducible**: los textos pertenecen a los empleadores y no se publican, por lo que la evaluación no puede replicarse de forma exacta.
- **Licencia**: MIT, permite uso comercial y modificación, pero se distribuye sin garantías y sin ningún compromiso de exactitud. Al ser un adaptador, el uso comercial depende también de la licencia del modelo base `cointegrated/rubert-tiny2`.
- **Advertencia de producción**: no existe versión cuantizada, ni contenedor, ni endpoint listo para servir; la integración exige fusionar el adaptador con el modelo base o cargarlo vía PEFT.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/MrAlexGov/vacancy-fit-lora-rubert-tiny2
- Modelo base: https://huggingface.co/cointegrated/rubert-tiny2
- Código de entrenamiento: `train.py` en el propio repositorio de HuggingFace
- Métricas y umbral: `metrics.json` en el propio repositorio de HuggingFace
- Artículo, blog o demo públicos: no disponible en la información proporcionada
