# helloimsaif/medjev-4b-lora

## Resumen

MedJev es un adaptador LoRA de rango 16 (27,9 millones de parámetros entrenables, 56 MB) sobre el modelo Qwen3.5-4B, publicado por el usuario helloimsaif en Hugging Face. No es un modelo generativo al uso: es un adaptador de decisión tipada (*typed-decision*) que, dado un estado de evidencia en JSON, una pregunta y un conjunto cerrado de opciones, devuelve una probabilidad por opción leída directamente de la distribución del siguiente token en una única pasada forward. No hay bucle de generación ni parseo de salida, por lo que el resultado puede usarse como condición de ramificación en un sistema mayor.

El adaptador se entrenó sobre 3.444 ejemplos que combinan preguntas clínicas (MedQA USMLE de 4 opciones, MedMCQA, PubMedQA), análisis de sentimiento de noticias financieras y decisiones estructuradas sobre registros sintéticos. Los resultados publicados por el autor muestran que la adaptación preserva el conocimiento médico del modelo base (diferencias dentro del ruido en las tres tareas clínicas) y concentra las ganancias en las tareas cuyas convenciones de etiquetado se incluyeron en el entrenamiento: sentimiento financiero (+19,0 puntos) y decisiones de workflow sintéticas (+26,7 puntos).

Su relevancia actual es de tipo metodológico: ejemplifica un patrón de adaptación estrecha y barata (93 minutos en una sola GPU NVIDIA GB10) orientada a decisiones discretas con salida probabilística, en lugar de a la generación abierta. Es un artefacto muy reciente, con 0 descargas y 0 *likes*, sin validación independiente y con limitaciones declaradas explícitamente por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer Qwen3.5-4B; los modulos objetivo son proyecciones de atencion, atencion lineal y MLP |
| Parametros totales | 27,9 M de parametros entrenables en el adaptador; los pesos base (Qwen3.5-4B, aproximadamente 4 000 M) no se incluyen en el repositorio |
| Parametros activos | no aplica (no es un modelo MoE); no disponible para el modelo base |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada; heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y el ejemplo oficial de inferencia usa bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 para el adaptador; la licencia de los pesos base de Qwen3.5-4B debe verificarse por separado |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar los pesos base desde Hugging Face en el momento de la carga |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.5-4B, revisión fijada `851bf6e`, cargado en bf16. El adaptador es un LoRA con r = 16, alpha = 32 y dropout 0,05, aplicado sobre las proyecciones de atención, atención lineal y MLP, lo que sugiere que el modelo base emplea algún esquema híbrido de atención (atención clásica combinada con capas de atención lineal), aunque la información disponible no detalla la arquitectura interna del base. La formulación de la tarea es la clave del diseño: el prompt tipado presenta un `state` (cualquier evidencia serializable en JSON), una `question` y un diccionario de `options` con descripciones en lenguaje natural, y la predicción es la opción cuyo primer token obtiene la probabilidad más alta en una sola pasada forward, con el modo *thinking* desactivado y sin *chain-of-thought* ni ejemplos *few-shot*.

El entrenamiento usó 3.444 ejemplos: MedQA 567, MedMCQA 702, PubMedQA 407, sentimiento de noticias financieras 658 y decisiones estructuradas sintéticas sobre registros 1.110. La configuración fue de 1 época, 215 pasos de optimizador, batch efectivo de 16, tasa de aprendizaje 5e-5 con planificador coseno (el texto de la model card se trunca en este punto) y cálculo de la pérdida únicamente sobre los tokens de la respuesta. El autor indica que el ajuste completo llevó unos 93 minutos en una única NVIDIA GB10. No se documenta uso de RLHF ni DPO. El repositorio incluye utilidades para construir ejemplos (`make_example`) y un script de fine-tuning que permite tanto partir del modelo base como continuar desde el propio adaptador.

## Capacidades

- Decisión de opción cerrada con salida probabilística por opción, obtenida de la distribución del siguiente token en una sola pasada forward.
- Preguntas clínicas de opción múltiple: MedQA (USMLE, 4 opciones), MedMCQA y PubMedQA en formato sí / no / quizá.
- Análisis de sentimiento de noticias financieras en tres clases: bajista, alcista y neutral.
- Decisiones estructuradas sobre registros, incluyendo estados de workflow de cuatro vías sobre historiales sintéticos de práctica clínica.
- Salida utilizable directamente como condición de ramificación, sin parseo ni postprocesado, al no existir bucle de generación.
- Acepta evidencia arbitraria serializable en JSON en el campo `state`, lo que permite integrarlo en pipelines que ya manejan datos estructurados.
- Reentrenamiento sobre decisiones propias mediante `make_example` y `examples/finetune_lora.py`.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modo *thinking* se desactiva explícitamente en la evaluación).
- Capacidades de visión, audio o modo de razonamiento extendido: no disponibles.
- Multilingüismo: no; el modelo declara únicamente inglés.

## Casos de uso

- Triaje de resultados de laboratorio: con un `state` que contenga el analito, el valor y el rango de referencia, el adaptador devuelve la probabilidad de que el resultado sea normal, anómalo o crítico. El ejemplo oficial con potasio de 6,8 mmol/L frente a un rango de 3,5-5,0 devuelve 0,991 para la clase crítica, lo que permite disparar avisos automáticos al clínico con un umbral explícito.
- Clasificación de estados de workflow sobre registros clínicos estructurados: el adaptador reproduce un esquema de etiquetado de cuatro vías definido por reglas, útil para pre-etiquetar grandes volúmenes de historiales antes de la revisión humana (con la advertencia de que la ganancia reportada se midió sobre datos sintéticos generados por el propio autor).
- Cribado de literatura biomédica: PubMedQA en formato sí / no / quizá permite descartar abstracts que no responden a una pregunta de investigación concreta antes de un análisis más costoso, manteniendo una precisión del 80,0 % en el conjunto etiquetado retenido frente al 79,5 % del base.
- Señal de sentimiento en pipelines de noticias financieras: clasificación bajista / alcista / neutral con un 85,3 % de acierto frente al 66,3 % del modelo base en el conjunto de validación retenido, adecuada como característica de entrada para modelos de riesgo o alertas.
- Enrutado condicional en sistemas de decisión: al devolver una distribución de probabilidad sin generación ni parseo, encaja como nodo de decisión en un grafo (por ejemplo, seleccionar entre varias rutas de procesamiento de un ticket) con latencia de una única pasada forward.
- Pre-etiquetado y anotación asistida: generación de etiquetas candidatas con su probabilidad asociada para que un revisor humano acepte, corrija o descarte, reduciendo el coste de anotación en dominios con convenciones de etiquetado estables.
- Evaluación comparativa de modelos base frente a adaptados: la función `load(adapter=None)` devuelve el modelo base sin modificar, lo que facilita medir la ganancia real del adaptador sobre datos propios antes de desplegarlo.
- Ajuste específico de dominio: una organización con convenciones internas de decisión puede entrenar su propio LoRA de rango 16 sobre unos pocos miles de ejemplos, partiendo del base o continuando desde MedJev, con un coste de cómputo bajo (el autor reporta 93 minutos para 3.444 ejemplos en una sola GPU).

## Benchmarks y rendimiento

Resultados publicados por el autor. Ambos modelos se evalúan con el mismo prompt de decisión tipada, en modo *zero-shot*, con *thinking* desactivado, sin *chain-of-thought* y sin contexto *few-shot*. La métrica es la exactitud de la opción cuyo primer token obtiene mayor probabilidad. La columna de diferencia es una estimación pareada sobre los mismos elementos con su intervalo de confianza del 95 %.

| Tarea | Conjunto de evaluacion | n | Qwen3.5-4B | MedJev | Diferencia |
|---|---|---:|---:|---:|---:|
| QA clinica: MedQA (USMLE, 4 opciones) | test oficial, subconjunto aleatorio | 300 | 71,7 | 73,3 | +1,7 ± 4,1 |
| QA clinica: MedMCQA | validacion oficial, subconjunto retenido | 300 | 67,3 | 65,7 | −1,7 ± 4,3 |
| QA de literatura biomedica: PubMedQA (si / no / quizas) | conjunto etiquetado, retenido | 400 | 79,5 | 80,0 | +0,5 ± 2,3 |
| Sentimiento de noticias financieras (bajista / alcista / neutral) | twitter-financial-news-sentiment, validacion, retenido | 300 | 66,3 | 85,3 | +19,0 ± 5,6 |
| Estado de workflow a nivel de registro (4 vias) | historiales sinteticos, pacientes retenidos | 292 | 72,6 | 99,3 | +26,7 ± 5,2 |

Lectura de los datos según el propio autor: las tres tareas clínicas no mejoran de forma estadísticamente significativa (sus intervalos incluyen el cero), es decir, la adaptación conserva el conocimiento médico pero no lo amplía; las ganancias se concentran en las tareas cuyas convenciones de etiquetado estaban representadas en el entrenamiento. La fila de workflow es sintética y en distribución, con etiquetas definidas por reglas y datos no publicados, por lo que refleja que el modelo reproduce el esquema, no que rinda a ese nivel sobre registros reales. Los números no son comparables con tablas de referencia públicas de los mismos benchmarks, ya que no se emplea *chain-of-thought* ni contexto *few-shot*. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Adaptador: 56 MB en safetensors; el repositorio completo ocupa 0,1 GB.
- Pesos base: la primera ejecución descarga aproximadamente 9 GB (Qwen3.5-4B).
- VRAM para inferencia en bf16: en torno a 10 GB de memoria de GPU, según la model card.
- GPU de consumo: sí cabe. Una RTX 4090 o RTX 3090 (24 GB) lo ejecuta con margen amplio; una RTX 4080 (16 GB) también debería ser suficiente en bf16. En tarjetas de 12 GB sería necesario fusionar el adaptador y cuantizar los pesos, ya que el requisito declarado de bf16 es de unos 10 GB.
- GPU de centro de datos: A100, H100 o GB10 son válidas; el entrenamiento del adaptador se realizó en una única NVIDIA GB10 en 93 minutos para 3.444 ejemplos (1 época, 215 pasos, batch efectivo 16).
- Opciones de despliegue: `transformers` + `peft` (ruta documentada oficialmente), vLLM con soporte de adaptadores LoRA para servir varias variantes sobre el mismo base, y llama.cpp u Ollama tras fusionar los pesos y convertirlos a GGUF (no documentado por el autor). El soporte de adaptadores en TGI no se menciona: no disponible.
- Latencia y throughput: no disponible. Cualitativamente, al no existir bucle de generación, cada decisión cuesta una única pasada forward más el coste de prefill del prompt, muy por debajo de una generación autorregresiva equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA (decision tipada, n=300) | Sentimiento financiero (n=300) | Licencia | Disponibilidad |
|---|---|---|---|---:|---|---|
| MedJev (este modelo) | 27,9 M de adaptador sobre base de ~4 000 M | no disponible | 73,3 | 85,3 | apache-2.0 (adaptador) | Hugging Face, 0 descargas |
| Qwen3.5-4B (modelo base) | ~4 000 M | no disponible | 71,7 | 66,3 | no disponible en la informacion proporcionada | Hugging Face |
| Otros adaptadores medicos de la misma categoria (variantes PEFT sobre modelos de 4-8 B, como Meditron o BioMistral) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables en la información proporcionada es contra el propio modelo base, que es también el escenario de referencia natural: MedJev no sustituye al base, lo especializa en unas convenciones de decisión concretas. No se dispone de resultados comparables de terceros sobre las mismas tareas, con el mismo prompt tipado y las mismas condiciones de evaluación, por lo que cualquier comparación con otros adaptadores médicos o financieros quedaría sin respaldo. Tampoco se dispone de cifras publicadas de otros adaptadores LoRA sobre Qwen3.5-4B para contextualizar las ganancias.

## Limitaciones y advertencias

- Las tres tareas clínicas no muestran mejora estadísticamente significativa: las diferencias incluyen el cero. El adaptador preserva el conocimiento médico del base, no lo amplía, y en MedMCQA el resultado es ligeramente peor (−1,7 puntos).
- La fila de decisiones de workflow es sintética y en distribución, con etiquetas generadas por reglas y datos no publicados. El 99,3 % refleja que el modelo reproduce un esquema definido por reglas, no un rendimiento real sobre registros clínicos reales.
- Las ganancias son específicas de tarea y sensibles a la formulación del prompt: el autor recomienda explícitamente comparar contra el modelo base sobre datos propios antes de adoptarlo, ya que el adaptador puede haberse ajustado a las convenciones de etiquetado de sus datos de entrenamiento.
- Los números no son comparables con tablas de referencia públicas: se obtienen sin *chain-of-thought*, sin *few-shot* y con *thinking* desactivado, por lo que las cifras absolutas difieren de las publicadas para los mismos benchmarks.
- Los conjuntos de MedQA y MedMCQA contienen errores conocidos en las claves de respuesta, lo que acota la exactitud alcanzable; el autor no reverificó los elementos de evaluación.
- Requisito de formato estricto: los identificadores de opción deben empezar por tokens distintos (por ejemplo A/B/C o palabras claramente diferentes). Si dos opciones comparten el primer token, la lectura de la distribución del siguiente token deja de ser discriminativa.
- Idiomas: únicamente inglés. No hay soporte multilingüe declarado.
- Riesgo de alucinación: bajo en el modo de decisión tipada, porque no hay generación libre; alto si se usa el modelo base subyacente para generar texto abierto, ya que es un modelo de aproximadamente 4 000 millones de parámetros.
- Licencia: el adaptador es apache-2.0, pero los pesos base de Qwen3.5-4B se descargan aparte en el momento de la carga y están sujetos a su propia licencia, que debe verificarse antes de un uso comercial.
- El adaptador está ligado a la revisión `851bf6e` del modelo base. Cargarlo sobre otra revisión puede degradar el comportamiento de forma silenciosa.
- Artefacto sin validación independiente: 0 descargas, 0 *likes* y publicación muy reciente. No hay evidencia de terceros que reproduzca los resultados.
- No se documentan sesgos demográficos ni de dominio, ni se publican análisis de calibración de las probabilidades devueltas más allá de los casos de ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helloimsaif/medjev-4b-lora
- Repositorio GitHub del autor (incluye `medjev.py`, ejemplos de quickstart y fine-tuning): https://github.com/Saif-062/medjev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision fijada `851bf6e`)
- Dataset MedQA USMLE 4 opciones: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options-hf
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Dataset twitter-financial-news-sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: no se han encontrado papers, blogs ni demos adicionales que documenten MedJev.
