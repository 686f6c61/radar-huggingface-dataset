# hoangkkk/phobert-v2-vihsd-toxic

## Resumen

PhoBERT-v2-vihsd-toxic es un modelo de clasificacion de texto en vietnamita obtenido por fine-tuning de PhoBERT-v2 sobre el corpus ViHSD (Vietnamese Hate Speech Detection), un conjunto de comentarios etiquetados en tres clases: `clean`, `offensive` y `hate`. Lo publica el usuario hoangkkk en Hugging Face y esta orientado a la moderacion automatica de comentarios en plataformas de contenido, con un caso de uso declarado por el autor centrado en comentarios de la plataforma TikTak.

El modelo es un transformer encoder de tipo RoBERTa (la arquitectura base de PhoBERT) con 135.000.579 parametros totales y un peso de repositorio de aproximadamente 0,5 GB en formato safetensors. Al ser un modelo discriminativo de clasificacion, no dispone de ventana de contexto generativa ni de capacidades de generacion de texto: su salida es una distribucion de probabilidad sobre las tres etiquetas.

Su relevancia radica en que aplica un modelo de lenguaje vietnamita preentrenado a gran escala a una tarea de moderacion con umbrales operativos explicitos (0,3 para revision humana y 0,99 para ocultacion automatica), lo que lo hace directamente desplegable en un pipeline de moderacion con intervencion humana en la franja intermedia. La informacion publica disponible sobre el modelo es muy limitada: no consta licencia, idiomas declarados ni pipeline en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base de PhoBERT-v2) |
| Parametros totales | 135.000.579 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (PhoBERT-v2 base emplea 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (unico idioma inferido del corpus y del modelo base; no declarado formalmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de secuencias multietiqueta (3 clases) |
| Etiquetas | clean, offensive, hate |
| Tokenizador | Requiere segmentacion de palabras con pyvi antes de la tokenizacion |
| Tamano del repositorio | ~0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa, heredada de PhoBERT-v2, el modelo de lenguaje vietnamita preentrenado de VinAI Research. Sobre esa base se ha realizado un fine-tuning supervisado para clasificacion de secuencias con tres etiquetas de salida. No se dispone de informacion sobre hiperparametros de entrenamiento, numero de epocas, tasa de aprendizaje, composicion exacta del dataset ni si se aplicaron tecnicas de reequilibrado de clases, aunque el fuerte desbalance del conjunto de evaluacion (5.548 ejemplos `clean` frente a 444 `offensive` y 688 `hate`) sugiere que el desbalance de clases es un factor determinante del rendimiento.

Un detalle tecnico relevante es que el modelo exige preprocesamiento con `pyvi`, la libreria de segmentacion de palabras en vietnamita, antes de pasar el texto al tokenizador. Esto implica que cualquier pipeline de produccion debe incorporar ese paso; omitirlo degrada la tokenizacion respecto a la distribucion de entrenamiento. No consta informacion sobre datos de preentrenamiento adicionales, RLHF, DPO ni innovaciones tecnicas como decodificacion especulativa, al tratarse de un modelo discriminativo.

## Capacidades

- Clasificacion de texto en vietnamita en tres categorias: `clean`, `offensive` y `hate`.
- Deteccion de discurso de odio y contenido ofensivo en comentarios de plataformas sociales.
- Salida de probabilidades por clase, lo que permite aplicar umbrales operativos configurables.
- Capacidad de moderacion con dos niveles de decision: revision humana a partir de 0,3 y ocultacion automatica a partir de 0,99.
- Preprocesamiento especifico para vietnamita mediante segmentacion de palabras con pyvi.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.
- No se declaran capacidades multilingues: el modelo esta especializado en vietnamita.

## Casos de uso

- Moderacion de comentarios en plataformas de contenido vietnamitas: el modelo clasifica cada comentario entrante y, aplicando los umbrales del autor, envia a revision humana los que superan 0,3 y oculta automaticamente los que superan 0,99, reduciendo la carga de moderadores sin eliminar contenido de forma indiscriminada.
- Filtrado previo en foros y secciones de comentarios de medios digitales: integrado como paso anterior a la publicacion, permite bloquear contenido `hate` de alta confianza y encolar el resto para revision, con una latencia de inferencia de encoder pequeno apta para tiempo real.
- Revision asistida por humanos en equipos de confianza y seguridad: el modelo prioriza la cola de revision ordenando los comentarios por probabilidad de la clase `hate`, de modo que los moderadores atienden primero los casos mas probables.
- Monitorizacion de comunidades y analisis de toxicidad agregada: procesando lotes historicos de comentarios se pueden calcular tasas de toxicidad por hilo, usuario o periodo temporal, con la advertencia de que la clase `offensive` tiene un F1 bajo (0,475) y requiere validacion adicional.
- Investigacion sobre discurso de odio en vietnamita: el modelo sirve como linea base reproducible sobre ViHSD para comparar tecnicas de fine-tuning, reequilibrado de clases o modelos multilingues.
- Moderacion en directos y chats de alta frecuencia: al ser un encoder de 135 millones de parametros, el coste por inferencia es bajo y permite procesar grandes volumenes de mensajes cortos en GPU de gama media.
- Enrutamiento de contenido hacia revision especializada: los comentarios clasificados como `hate` con alta confianza pueden derivarse a equipos legales o de cumplimiento, mientras que los `offensive` de confianza media se gestionan con respuestas automaticas o advertencias.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de evaluacion de ViHSD (6.680 ejemplos):

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| clean | 0,946 | 0,933 | 0,939 | 5.548 |
| offensive | 0,451 | 0,502 | 0,475 | 444 |
| hate | 0,628 | 0,650 | 0,639 | 688 |
| Exactitud (accuracy) | — | — | 0,875 | 6.680 |
| Media macro | 0,675 | 0,695 | 0,684 | 6.680 |
| Media ponderada | 0,880 | 0,875 | 0,877 | 6.680 |

La exactitud global del 0,875 esta dominada por la clase mayoritaria `clean`. El rendimiento en la clase `offensive` es claramente inferior (F1 de 0,475), lo que indica dificultad para separar contenido ofensivo de las otras dos clases. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP32: aproximadamente 0,54 GB solo para pesos (135 millones de parametros), mas activaciones y overhead del runtime; en la practica, entre 1 y 2 GB.
- En FP16 o BF16, los pesos ocupan aproximadamente 0,27 GB; la VRAM total necesaria se mantiene por debajo de 2 GB en la mayoria de configuraciones.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volumenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para despliegues pequenos basta una T4 o una GPU integrada.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, TorchServe, ONNX Runtime, Triton Inference Server y FastAPI con transformers como backend. No se ha publicado compatibilidad con vLLM ni llama.cpp, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de milisegundos por peticion en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hoangkkk/phobert-v2-vihsd-toxic | 135 M | no disponible | Clasificacion de toxicidad en vietnamita (3 clases) | no disponible | Hugging Face |
| PhoBERT-v2 base (VinAI) | ~135 M | 256 tokens | Modelo de lenguaje enmascarado en vietnamita | no disponible en la informacion | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 tokens | Modelo multilingue, ajustable a clasificacion | MIT (habitual en el modelo base) | Hugging Face |

La comparacion con PhoBERT-v2 base es la mas directa: este modelo es un fine-tuning de aquel para una tarea concreta. Frente a XLM-RoBERTa, el modelo de PhoBERT esta especializado en vietnamita y tiene la mitad de parametros, lo que reduce el coste de inferencia a cambio de perder cobertura multilingue. No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento en la clase `offensive` es bajo (F1 de 0,475, precision de 0,451), por lo que un porcentaje elevado de contenido ofensivo se clasificara incorrectamente; no es adecuado para sanciones automaticas basadas en esa clase.
- El desbalance de clases del corpus condiciona el comportamiento: el modelo esta fuertemente optimizado para la clase mayoritaria `clean` y puede infrarepresentar casos limite.
- El modelo exige segmentacion de palabras con pyvi; omitir este paso en produccion degrada la calidad de las predicciones de forma no cuantificada en la informacion disponible.
- No consta licencia, lo que impide determinar si el uso comercial esta permitido; es un riesgo legal relevante para despliegues en produccion.
- No se declaran idiomas soportados formalmente; el modelo esta entrenado sobre vietnamita y no se ha validado su comportamiento en otros idiomas.
- No se dispone de informacion sobre sesgos demograficos, dialectales o regionales del corpus ViHSD ni sobre evaluaciones de robustez frente a adversariales.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y falsos negativos en la clasificacion, con impacto directo en la moderacion.
- Los umbrales recomendados (0,3 y 0,99) proceden de la model card del autor y no han sido validados de forma independiente; deben calibrarse sobre datos propios antes de usarse en produccion.
- La fecha de creacion del repositorio (2026-11-11) y la ausencia de descargas y likes indican un modelo sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangkkk/phobert-v2-vihsd-toxic
- PhoBERT-v2 (modelo base, VinAI Research): https://huggingface.co/VinAI/phobert-base-v2
- Libreria pyvi (segmentacion de palabras en vietnamita): https://github.com/trungtv/pyvi
- Corpus ViHSD (Vietnamese Hate Speech Detection): no disponible en la informacion proporcionada
- Paper de PhoBERT: no disponible en la informacion proporcionada
