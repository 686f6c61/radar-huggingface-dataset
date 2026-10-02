# abhirajratna/anlp-a2-optim-adamw

## Resumen

El modelo `abhirajratna/anlp-a2-optim-adamw` es un transformer decoder denso de 33.563.136 parametros (33,6 M), desarrollado por el usuario abhirajratna como entregable de la asignatura ANLP (Advanced Natural Language Processing), asignatura 2, parte 2. Se trata de la variante entrenada con el optimizador AdamW implementado desde cero, y su proposito declarado es servir de punto de comparacion frente a otras variantes del mismo modelo base entrenadas con optimizadores alternativos, como Lion. No es un modelo destinado a produccion, sino un artefacto experimental de caracter academico.

El modelo se ha preentrenado con el objetivo de next-token prediction sobre una unica pasada del split de entrenamiento del corpus `browndw/human-ai-parallel-corpus`, con un total de 39.038.976 tokens de entrenamiento. La arquitectura, segun la model card, corresponde a la "variant v1" de la parte 1 del trabajo: 8 capas, dimension de modelo 512, 8 cabezas de atencion y un MLP de 2 capas con dimension 2048. El modelo esta etiquetado unicamente para ingles y no se declara licencia ni pipeline en la informacion disponible.

Su relevancia es, por tanto, metodologica y no de capacidad: permite estudiar de forma reproducible el efecto del optimizador sobre la curva de perdida y la calidad de generacion en un decoder pequeno, con datos concretos publicados (perdida de validacion final 3,8543 y BLEU de test 3,66 sobre continuaciones de 64 tokens con 7 referencias). Cualquier evaluacion de uso real debe tener en cuenta que se trata de un modelo base sin ajuste por instrucciones, sin alineamiento y con un presupuesto de entrenamiento muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (8 capas, d_model 512, 8 cabezas, MLP de 2 capas de dimension 2048) |
| Parametros totales | 33.563.136 (33,6 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |
| Tokens de entrenamiento | 39.038.976 (dataset completo de entrenamiento: 39.047.168 tokens) |
| Optimizador | AdamW implementado desde cero, learning rate maximo 0,0005 |
| Epocas | 1 pasada sobre el split de entrenamiento |
| Perdida de validacion final | 3,8543 |
| BLEU de test | 3,66 (continuaciones de 64 tokens, 7 referencias) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso y autorregresivo, sin mezcla de expertos ni componentes de estado recurrente o hibridos. La configuracion declarada es de 8 capas, d_model 512, 8 cabezas de atencion y un perceptron multicapa de 2 capas con dimension intermedia 2048. El repositorio no incluye un `config.json` compatible con la libreria `transformers`: la carga se realiza mediante codigo propio del autor (`sys.path.insert(0, 'code')` seguido de `from part1.model import load_pretrained`), lo que implica que hay que arrastrar el directorio `code` del repositorio para poder instanciar el modelo.

El entrenamiento consiste en una unica epoca de next-token prediction sobre el split de entrenamiento del corpus `browndw/human-ai-parallel-corpus`, con 39.038.976 tokens procesados y un optimizador AdamW implementado desde cero con learning rate maximo de 0,0005. No se menciona en la informacion disponible ninguna fase de ajuste por instrucciones, RLHF, DPO u otra alineacion posterior al preentrenamiento. Tampoco se documentan tecnicas de eficiencia como decodificacion especulativa, atencion lineal, atencion con ventana deslizante o cuantizacion. El resultado publicado es una perdida de validacion final de 3,8543 y un BLEU de test de 3,66, metricas que sitúan al modelo en un regimen de calidad propio de un experimento docente y no de un modelo utilizable directamente en tareas generativas reales.

## Capacidades

- Generacion de texto autorregresiva en ingles: el modelo continuara secuencias de texto, pero su calidad medida en BLEU (3,66) es muy baja.
- Next-token prediction como tarea de preentrenamiento: es su unico objetivo declarado y la base de cualquier uso derivado.
- Modelo base sin ajuste por instrucciones: no responde a prompts del tipo "instruccion + pregunta" de forma fiable, ya que no ha recibido entrenamiento supervisado de instrucciones ni alineamiento.
- Linea base para comparacion de optimizadores: comparte arquitectura exacta con la variante entrenada con Lion, lo que permite aislar el efecto del optimizador.
- Idiomas: unicamente ingles segun la etiqueta de la model card.
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio, ni modo de razonamiento explicito (thinking mode).
- No se documenta ventana de contexto ni capacidad de procesar entradas largas.

## Casos de uso

- Comparativa reproducible de optimizadores: el modelo esta disenado para compararse con `abhirajratna/anlp-a2-optim-lion`, que usa la misma arquitectura y los mismos datos, de modo que la unica variable es el optimizador (AdamW frente a Lion). Es util para estudiar convergencia y perdida final.
- Docencia de pipelines de entrenamiento: sirve como ejemplo completo y de tamano manejable (0,1 GB) para explicar tokenizacion, bucle de entrenamiento, calculo de perdida de validacion y evaluacion con BLEU.
- Reproduccion de experimentos academicos: al publicarse el numero exacto de tokens (39.038.976) y el learning rate maximo, permite replicar el entrenamiento en pocas horas de GPU y verificar la perdida final declarada.
- Estudio de curvas de aprendizaje: con 33,6 M de parametros y una sola epoca, es un sujeto adecuado para analizar sobreajuste, estabilidad del optimizador y sensibilidad al learning rate en modelos pequenos.
- Fine-tuning experimental de tareas de generacion corta en ingles: podria ajustarse para continuacion de texto en dominios concretos, asumiendo que se dispone del codigo de carga del repositorio y de un corpus de dominio; no hay garantia de resultados utiles.
- Pruebas de infraestructura de inferencia: por su tamano, vale para validar toolchains propias (carga de safetensors, paso de decodificacion, muestreo top-k o nucleus) sin consumir recursos significativos.
- Analisis de sesgos y de contaminacion de datos: permite estudiar que tipo de texto reproduce un modelo entrenado sobre un corpus de pares humano-IA, util en investigacion sobre procedencia de datos.

## Benchmarks y rendimiento

| Metrica | Valor | Detalles |
|---|---|---|
| Perdida de validacion final | 3,8543 | Split de validacion del corpus de entrenamiento |
| BLEU de test | 3,66 | Continuaciones de 64 tokens, 7 referencias |
| Tokens de entrenamiento | 39.038.976 | Una pasada sobre el split de entrenamiento |
| Learning rate maximo | 0,0005 | Optimizador AdamW desde cero |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo reporta perdida de validacion y BLEU de test, sin comparacion numerica frente a las variantes con otros optimizadores, de modo que no es posible cuantificar la diferencia entre AdamW y Lion con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 134 MB en FP32, 67 MB en FP16/BF16, 34 MB en int8 y 17 MB en int4. Son estimaciones calculadas a partir de los 33.563.136 parametros; el autor no publica requisitos oficiales.
- VRAM total recomendada: menos de 1 GB en cualquier precision habitual, incluyendo activaciones y overhead del runtime para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. No se necesita A100, H100 ni RTX 4090; el modelo cabe sobradamente en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores.
- Inferencia en CPU: viable por el tamano del modelo, aunque no hay mediciones publicadas de latencia.
- Opciones de despliegue: el repositorio no es compatible de forma directa con `transformers`, vLLM, TGI, llama.cpp u Ollama, ya que requiere cargar el codigo propio del autor (`part1.model.load_pretrained`). Para usar esos runtimes habria que exportar o reimplementar la arquitectura previamente.
- Aceleradores: no se documenta compatibilidad con CUDA, ROCm, Metal ni otros backends mas alla de PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Optimizador | Metricas publicadas | Licencia |
|---|---|---|---|---|---|
| abhirajratna/anlp-a2-optim-adamw | 33,6 M | no disponible | AdamW (desde cero) | val loss 3,8543; BLEU 3,66 | no disponible |
| abhirajratna/anlp-a2-optim-lion | 33,6 M (misma arquitectura v1) | no disponible | Lion (desde cero) | no disponible en la informacion recogida | no disponible |
| Arihant25/anlp-a2-optimizers | no disponible | no disponible | no disponible | no disponible | no disponible |

Los dos primeros modelos forman parte del mismo trabajo academico y comparten arquitectura y corpus, por lo que constituyen la comparacion natural; no obstante, la informacion disponible no incluye las metricas de la variante Lion, lo que impide establecer una comparacion numerica. Para alternativas de proposito general de tamano similar (por ejemplo, modelos tipo GPT-2 small o distilGPT-2) no se dispone de datos de comparacion en la informacion proporcionada, por lo que se indica "no disponible".

## Limitaciones y advertencias

- Calidad de generacion muy baja: un BLEU de 3,66 sobre continuaciones de 64 tokens indica que el texto producido rara vez se solapa con las referencias. No es apto para generacion de contenido en produccion.
- Modelo base sin alineamiento: no ha pasado por ajuste por instrucciones, RLHF ni DPO, por lo que puede generar contenido incoherente, repetitivo u ofensivo si el corpus de entrenamiento lo contiene.
- Riesgo de alucinacion elevado: al ser un modelo pequeno con solo 39 M de tokens de entrenamiento y una epoca, la fidelidad factual no esta garantizada en ningun caso.
- Idiomas: unicamente ingles etiquetado. No hay soporte documentado de castellano ni de otros idiomas.
- Contexto: no se documenta la longitud de contexto soportada, lo que impide planificar usos con entradas largas.
- Licencia no disponible: al no declararse licencia, el uso comercial queda en una situacion de incertidumbre legal; conviene contactar con el autor antes de cualquier explotacion.
- Dependencia de codigo propietario del repositorio: la carga requiere el directorio `code` y la funcion `part1.model.load_pretrained`, lo que complica la integracion con ecosistemas estandar y con herramientas de despliegue.
- Datos de entrenamiento con posible sesgo: el corpus `browndw/human-ai-parallel-corpus` contiene pares humano-IA, cuya composicion y sesgos no se documentan en la model card.
- Sin mantenimiento: 0 descargas y 0 likes, creado y actualizado en la misma fecha (2026-10-01). No hay evidencia de soporte posterior.
- Metricas de validacion no reproducibles sin el tokenizador y el pipeline exactos: la model card no documenta el tokenizador ni la semilla de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-optim-adamw
- Variante con optimizador Lion del mismo autor: https://huggingface.co/abhirajratna/anlp-a2-optim-lion
- Modelo relacionado de otro autor: https://huggingface.co/Arihant25/anlp-a2-optimizers
- Espacio de experimentos en Weights & Biases: https://wandb.ai/arihanttr-iiit-hyderabad/anlp-a2
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
