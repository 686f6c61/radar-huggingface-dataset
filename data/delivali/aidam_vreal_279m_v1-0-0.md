# DeliVali/AIDAM_VREAL_279M_V1.0.0

## Resumen

AIDAM_VREAL_279M_V1.0.0 es un modelo de clasificacion de texto especializado en verificacion de afirmaciones (fact-checking) para el registro de "claims" del mundo real y virales, desarrollado por DeliVali dentro del proyecto AIDAM. El modelo recibe una afirmacion y un conjunto de evidencias, y determina si la evidencia apoya, refuta o no ofrece informacion suficiente sobre la afirmacion, siguiendo la taxonomia del dataset AVeriTeC (Schlichtkrull et al., 2023). El proyecto AIDAM se basa en la premisa de que el veredicto factual no debe provenir de un gran modelo de lenguaje (LLM), sino de un modelo NLI pequeno y especializado como este, mientras que el LLM se limita a redactar y explicar el veredicto.

El modelo parte del checkpoint `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`, ya preentrenado en NLI multilingue, y se ajusta con el conjunto de entrenamiento de AVeriTeC. Tiene 278.811.651 parametros, una ventana de inferencia de 512 tokens (con troceado automatico si se supera) y se distribuye en formatos ONNX y SafeTensors bajo licencia Apache 2.0. Su relevancia radica en que demuestra que un encoder pequeno y especializado puede alcanzar una precision del 72% en AVeriTeC con solo 26 minutos de entrenamiento en una GPU de consumo, superando en 12 puntos a su predecesor y manteniendo una baja huella de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mDeBERTa-v3-base (transformer encoder) |
| Parametros totales | 278.811.651 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (troceo automatico si se supera) |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX y SafeTensors; no se especifican cuantizaciones como int8 o int4) |
| Idiomas soportados | Base multilingue (CC100, 100 idiomas), pero el fine-tuning y la evaluacion se realizaron solo con afirmaciones en ingles |
| Licencia | Apache 2.0 (pesos); datos de entrenamiento AVeriTeC bajo CC-BY-NC 4.0 |
| Formato de pesos | SafeTensors (~532 MB) y ONNX (grafo de 2.5 MB + pesos externos de 1.1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura mDeBERTa-v3, un encoder transformer que incorpora atencion disentangled y el mecanismo de embeddings de posicion relativa de DeBERTa, junto con la version 3 que introduce mejoras en el preentrenamiento. El checkpoint base ya estaba preentrenado en NLI multilingue con 2 millones de pares de premisas e hipotesis, por lo que el fine-tuning para esta tarea de verificacion de claims fue relativamente ligero. El entrenamiento se realizo sobre el conjunto de entrenamiento de AVeriTeC, con una mezcla natural de clases: 1.660 contradicciones (57%), 804 implicaciones (28%) y 445 neutros (15%), tras eliminar 6 filas que compartian texto con el split de desarrollo oficial.

La clave para alcanzar el umbral de calidad fue el uso de una funcion de perdida de entropia cruzada con pesos por clase (1.203 para implicacion, 2.172 para neutro y 0.586 para contradiccion), junto con un numero elevado de epocas (40 epocas, 3.600 pasos). El entrenamiento utilizo una tasa de aprendizaje de 2e-5, un tamano de lote efectivo de 32, longitud maxima de secuencia de 512, programacion de tasa de aprendizaje OneCycleLR con 6% de warmup, optimizador AdamW de 8 bits y precision bf16. El mejor checkpoint se obtuvo en el paso 1.950 de 3.600, con una precision balanceada interna de 73.77%. El entrenamiento completo se realizo en una unica GPU de 12 GB en aproximadamente 26 minutos. Este fue el cuarto intento de entrenamiento para esta especializacion, y el primero que logro la promocion del checkpoint gracias a que la estrategia de pesos por clase ya se conocia de otros modelos hermanos del proyecto.

## Capacidades

- Clasificacion de texto en tres clases NLI: implicacion (supports), contradiccion (refutes) y neutro (not enough information) para verificar afirmaciones con evidencia.
- Verificacion de afirmaciones del mundo real y virales en el registro AVeriTeC, que incluye claims extraidos de 50 organizaciones de fact-checking y evidencia recopilada en pares pregunta-respuesta desde la web.
- Troceo automatico de secuencias que superan los 512 tokens, lo que permite procesar textos largos aunque la ventana de inferencia sea fija.
- Capacidad multilingue heredada del checkpoint base (100 idiomas en preentrenamiento), aunque el fine-tuning y la evaluacion se limitaron al ingles.
- No es un LLM: no genera texto ni razona de forma general; es un clasificador NLI especializado, disenado para ser el nucleo de verificacion de un sistema de fact-checking mas amplio.
- No soporta tool calling, agentes ni vision/audio; su unica funcion es la clasificacion de pares premisa-hipotesis.

## Casos de uso

- Verificacion de afirmaciones virales en redes sociales: el modelo puede recibir un claim extraido de una publicacion y un conjunto de evidencias recuperadas de la web, y devolver un veredicto de apoyo, refutacion o falta de informacion. Es adecuado porque su registro de entrenamiento (AVeriTeC) incluye claims virales y su estructura de pares pregunta-respuesta se ajusta a la evidencia realista.
- Moderacion de contenido en plataformas digitales: integrado como componente de verificacion en un pipeline de moderacion, puede marcar automaticamente afirmaciones falsas o no verificadas en comentarios, publicaciones o articulos, reduciendo la carga de revisores humanos.
- Asistencia a periodistas y fact-checkers: los equipos de verificacion pueden usar el modelo como primer filtro para priorizar claims que necesitan revision manual, ya que su alto recall en las clases "refutes" y "supports" permite descartar rapidamente afirmaciones bien sustentadas o claramente falsas.
- Analisis de transcripciones de debates o discursos publicos: el modelo puede evaluar si las declaraciones de un politico o un orador estan respaldadas por la evidencia disponible, ayudando en el analisis de desinformacion politica.
- Integracion en sistemas de AIDAM para el registro de claims enciclopedicos o cientificos: aunque este modelo esta especializado en el registro real y viral, puede utilizarse como base para adaptar otros registros del proyecto, como el modelo VWIKI que ya existe.
- Auditoria de contenido en campañas de concienciacion publica: en campanas de salud o seguridad, el modelo puede verificar automaticamente si las afirmaciones difundidas por canales no oficiales coinciden con la evidencia cientifica disponible, reduciendo el riesgo de desinformacion.

## Benchmarks y rendimiento

Los resultados de evaluacion se publicaron sobre el conjunto de desarrollo de AVeriTeC, con 500 claims y evidencia dorada (gold evidence). La metrica principal es la precision de etiqueta (label accuracy), equivalente al puntaje oficial del shared task porque el modelo no realiza recuperacion de evidencia (siempre recibe la evidencia como argumento).

| Metrica | Verificador anterior | Este modelo | Cambio |
|---|---|---|---|
| Precision | 60.0 | **72.0** | +12.0 |
| Recall "not enough" | 42.47 | **46.58** | +4.11 |
| Recall "refutes" | 63.61 | **76.07** | +12.46 |
| Recall "supports" | 61.48 | **77.05** | +15.57 |

El modelo supero el umbral pre-registrado de precision > 71.70 (obtuvo 72.0, solo 0.30 puntos por encima del umbral), no mostro regresion en el recall de ninguna clase, cumplio el presupuesto de parametros (< 500 millones) y no presento contaminacion entre entrenamiento y desarrollo (verificado por coincidencia exacta de texto de claims). El veredor anterior tenia una precision real de 60.0 tras corregir un defecto en su exportacion ONNX que lo habia hecho caer al 31.2% en la misma evaluacion.

## Requisitos de hardware

- Entrenamiento: se realizo en una GPU consumer de 12 GB de VRAM, en aproximadamente 26 minutos con 40 epocas y 3.600 pasos.
- Inferencia: al ser un modelo de 279 millones de parametros, la inferencia en CPU o GPU es factible. Con cuantizacion o el formato ONNX, puede ejecutarse en CPUs modernas o GPUs con 4-8 GB de VRAM.
- No se proporcionan datos especificos de latencia o throughput en la informacion disponible.
- Opciones de despliegue: se puede usar con la libreria `transformers` de Hugging Face (formato SafeTensors) o con `onnxruntime` para inferencia optimizada en produccion. No se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que no es un LLM generativo.
- Se recomienda un entorno con al menos 2 GB de VRAM para inferencia en GPU, aunque puede ejecutarse en CPU para tareas por lotes.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada datos comparativos con otros modelos de verificacion de claims o NLI. La unica comparativa publicada es con el veredor anterior del propio proyecto AIDAM (60.0 de precision). No se dispone de benchmarks publicos como MMLU, HumanEval o GSM8K, ni de comparaciones con otros modelos como DeBERTa-v3-large o XLM-Roberta-large en la tarea de AVeriTeC. Por tanto, no es posible realizar una tabla comparativa con alternativas externas con los datos disponibles.

## Limitaciones y advertencias

- El modelo fue entrenado y evaluado exclusivamente con afirmaciones en ingles, aunque la base es multilingue. No se debe asumir un comportamiento fiable en otros idiomas sin un fine-tuning adicional.
- La ventana de inferencia es de 512 tokens; para textos largos se aplica un troceo automatico, pero esto puede perder contexto entre segmentos y afectar a la precision.
- El modelo no recupera evidencia por si mismo; siempre debe recibir la evidencia como entrada. En un sistema real, la calidad del veredicto depende directamente de la calidad de la evidencia proporcionada.
- Los resultados de AVeriTeC son especificos del registro de "real-world y viral claims". No es un benchmark general de razonamiento o conocimiento, y el modelo no esta evaluado para claims enciclopedicos, cientificos o de noticias de ultima hora.
- La licencia de los pesos es Apache 2.0, pero el dataset de entrenamiento AVeriTeC se distribuye bajo CC-BY-NC 4.0. Esto implica que, aunque los pesos se pueden usar comercialmente, el uso del dataset con fines comerciales esta restringido por su licencia original.
- La precision de 72.0 esta solo 0.30 puntos por encima del umbral pre-registrado, lo que indica un margen estrecho y una posible sensibilidad a la variabilidad del ruido de medicion (se menciona que es alrededor de una veinteava parte de la banda de ruido).
- No se ha publicado informacion sobre sesgos especificos, pero como modelo entrenado en un corpus de fact-checking, podria heredar sesgos de las organizaciones de fact-checking que generaron los datos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/DeliVali/AIDAM_VREAL_279M_V1.0.0
- Version anterior (V0.1.0): https://huggingface.co/DeliVali/AIDAM_VREAL_279M_V0.1.0
- Modelo hermano para claims enciclopedicos (VWIKI): https://huggingface.co/DeliVali/AIDAM_VWIKI_279M_V0.1.0
- Repositorio del proyecto AIDAM en GitHub (docs/ROADMAP.md): https://github.com/DeliVali/AIDAM
- Checkpoint base: MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 (https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7)
