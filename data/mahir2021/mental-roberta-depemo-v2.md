# mahir2021/mental-roberta-depEMO-v2

## Resumen

Mental-RoBERTa es un clasificador multi-etiqueta de emociones entrenado sobre texto relacionado con la depresión. Lo desarrolla el usuario mahir2021 y se publica en Hugging Face como `mahir2021/mental-roberta-depEMO-v2`. El modelo parte de la base `mental/mental-roberta-base` y se presenta como un `AutoModelForSequenceClassification` estándar, con 124.651.784 parámetros y pesos en safetensors.

El modelo resuelve una tarea acotada: asignar a un texto una o varias de ocho etiquetas emocionales vinculadas a la sintomatología depresiva (ira, disfunción cerebral o problemas de memoria, vacío, desesperanza, soledad, tristeza, intención suicida y sentimiento de inutilidad). No es un modelo generativo ni un asistente conversacional; es un encoder RoBERTa con una cabeza de clasificación multi-etiqueta, pensado para análisis de texto y detección de señales de riesgo en entornos de salud mental.

Su relevancia es limitada y muy específica: puede servir como componente de triaje o señalización en pipelines de moderación, investigación clínica asistida o análisis de foros, siempre con supervisión humana. La información pública es escasa (cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin model card detallada más allá de hiperparámetros y métricas de test), por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) con cabeza de clasificación multi-etiqueta (`AutoModelForSequenceClassification`) |
| Parametros totales | 124.651.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (MaxLen de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan cuantizaciones GGUF ni ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `mental/mental-roberta-base` |
| Etiquetas | 8: anger, brain dysfunction (forget), emptiness, hopelessness, loneliness, sadness, suicide intent, worthlessness |
| Hiperparametros de entrenamiento | seed 42, 5 epochs, LR 2e-05, MaxLen 256 |
| Descargas / likes | 0 / 0 |
| Tamano del repo | 0.5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa seguido de una cabeza de clasificación para `AutoModelForSequenceClassification`. El modelo se inicializa desde `mental/mental-roberta-base`, un checkpoint de dominio específico para salud mental, y se afina con 5 épocas, learning rate 2e-05, semilla 42 y longitud máxima de 256 tokens. La salida es multi-etiqueta, es decir, cada texto puede activar varias de las ocho categorías simultáneamente mediante activaciones independientes por etiqueta.

No se documenta el volumen de datos de entrenamiento, la composición del dataset, el idioma de los textos ni si hubo técnicas de aumento de datos, balanceo de clases o validación cruzada. Tampoco se indica si se aplicó algún tipo de regularización adicional, decodificación especulativa ni innovaciones de atención. La información disponible se limita a los hiperparámetros y a las métricas de test reportadas en la model card, por lo que cualquier afirmación sobre calidad de entrenamiento más allá de esas cifras sería especulativa.

## Capacidades

- Clasificación multi-etiqueta de texto en ocho categorías emocionales asociadas a la depresión: anger, brain dysfunction (forget), emptiness, hopelessness, loneliness, sadness, suicide intent y worthlessness.
- Procesamiento de entradas de hasta 256 tokens, adecuado para fragmentos cortos, mensajes, publicaciones y turnos individuales de conversación.
- Asignación simultánea de múltiples etiquetas por instancia, lo que permite representar estados emocionales mixtos.
- Inferencia rápida y de bajo coste computacional al tratarse de un encoder de ~125M de parámetros.
- Compatibilidad con `text-embeddings-inference` y `endpoints_compatible`, según los tags del repositorio.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking. No se documentan capacidades multilingües.

## Casos de uso

- Triaje de riesgo en foros de salud mental: el modelo puede puntuar publicaciones y marcar aquellas con alta probabilidad en la etiqueta `suicide intent` para revisión humana prioritaria. Su ventana de 256 tokens encaja con publicaciones breves y su coste de inferencia es bajo.
- Moderación asistida en comunidades online: integrado como filtro previo, permite etiquetar mensajes con señales de desesperanza o soledad y derivarlos a equipos de soporte, reduciendo el volumen de revisión manual.
- Investigación en psicología computacional: sirve para anotar corpus de textos depresivos con ocho dimensiones emocionales y estudiar correlaciones entre categorías, siempre que se valide contra anotadores humanos.
- Análisis de diarios o registros de pacientes (con consentimiento y cumplimiento normativo): permite generar series temporales de etiquetas emocionales para seguimiento longitudinal en estudios observacionales.
- Enrutamiento en chatbots de apoyo emocional: las etiquetas activadas pueden condicionar la respuesta del sistema (por ejemplo, derivar a recursos de crisis cuando se detecta `hopelessness` o `suicide intent`), sin que el modelo genere texto por sí mismo.
- Señalización en pipelines de atención al cliente con contenido sensible: detección de mensajes con carga emocional negativa para escalar a agentes humanos formados, usando el modelo como clasificador auxiliar.
- Extracción de características para modelos posteriores: los logits o embeddings del encoder pueden alimentar clasificadores de riesgo o sistemas de alerta temprana en investigación clínica.

## Benchmarks y rendimiento

Métricas de test reportadas en la model card del autor:

| Metrica | Valor |
|---|---|
| eval_loss | 0.7186 |
| Precision micro | 0.8214 |
| Recall micro | 0.8442 |
| F1 micro | 0.8327 |
| Precision macro | 0.7894 |
| Recall macro | 0.7875 |
| F1 macro | 0.7792 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores corresponden únicamente al conjunto de test del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos, con overhead adicional de activaciones y tokenizador; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: alrededor de 0,25 GB de pesos, con overhead similar.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; incluso en iGPU y CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (según tags), `endpoints_compatible` en Hugging Face Inference Endpoints. No se documentan pesos GGUF ni soporte explícito para llama.cpp u Ollama, aunque la conversión a ONNX o GGUF sería técnicamente viable al ser un encoder estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (cientos a miles de textos por segundo en lotes), pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mahir2021/mental-roberta-depEMO-v2 | 124,7M | 256 | Clasificación multi-etiqueta de emociones depresivas (8 etiquetas) | no disponible | Hugging Face, 0 descargas |
| mental/mental-roberta-base | no disponible | no disponible | Modelo base de dominio (salud mental) | no disponible | Hugging Face (referenciado como base) |
| RoBERTa-base estándar | 125M | 512 | Clasificación general de texto | MIT | Ampliamente disponible |
| Modelos de clasificación de emociones tipo GoEmotions (BERT/RoBERTa) | ~110-125M | 512 | Clasificación multi-etiqueta de emociones generales (27 etiquetas) | MIT / Apache 2.0 en la mayoría | Hugging Face |

La comparativa es limitada: no se dispone de métricas públicas comparables ni de una evaluación independiente de este checkpoint frente a alternativas. La principal diferencia frente a clasificadores de emociones generales es el conjunto de etiquetas, centrado en sintomatología depresiva y con una categoría explícita de intención suicida, lo que exige un tratamiento ético y normativo específico.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; el modelo base y el dataset de entrenamiento podrían estar en inglés, pero no se confirma, por lo que su rendimiento en castellano es desconocido.
- Contexto limitado a 256 tokens: textos más largos deben truncarse o dividirse, con riesgo de perder señales relevantes.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, especialmente en la etiqueta `suicide intent`, con implicaciones éticas y legales graves.
- Sesgos potenciales derivados del dataset de entrenamiento no documentado: posible infrarrepresentación de ciertos grupos demográficos, culturas o registros lingüísticos.
- Métricas reportadas solo por el autor, sin validación independiente ni intervalos de confianza; el F1 macro de 0,7792 sugiere margen de mejora en etiquetas minoritarias.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de revisión por terceros.
- No debe utilizarse como herramienta de diagnóstico clínico ni como sustituto de profesionales de la salud mental; cualquier aplicación en ese ámbito requiere validación clínica, supervisión humana y cumplimiento de normativa como el RGPD y la AI Act.
- La información de la búsqueda web proporcionada no contiene resultados relevantes sobre este modelo; no se han podido verificar enlaces adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/mahir2021/mental-roberta-depEMO-v2
- Modelo base referenciado: `mental/mental-roberta-base` (no se dispone de URL verificada en la información proporcionada)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web disponible.
