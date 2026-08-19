# fromziro/Width-Vs-Depth

## Resumen

Width-Vs-Depth es un proyecto de investigación experimental publicado por el usuario fromziro (FromZero) que investiga una pregunta fundamental en el diseño de modelos de lenguaje pequeños (tiny language models, TLMs): ¿es más efectivo aumentar la profundidad o la anchura cuando el presupuesto de parámetros es extremadamente limitado? El repositorio contiene dos configuraciones de arquitectura basadas en LlamaForCausalLM, entrenadas ambas sobre 500 millones de tokens del dataset FineWeb de HuggingFace.

La primera configuración, denominada `depth_311` (Config A), es una arquitectura profunda y estrecha con 21 capas y un hidden size de 128, que suma 3.889.920 parámetros. La segunda, `width_311` (Config B), es una arquitectura superficial y ancha con 9 capas y un hidden size de 192, con 3.816.576 parámetros. Ambos modelos comparten tokenizador, datos de entrenamiento y configuración de hiperparámetros, lo que permite un aislamiento limpio de la variable depth-vs-width.

Los resultados del estudio muestran que la configuración profunda y estrecha supera a la superficial y ancha en la mayoría de las tareas de evaluación, con una pérdida final de validación menor (3,13697 frente a 3,14935) y una precisión media superior (38,70 % frente a 38,44 %). Este hallazgo sugiere que, incluso a escalas minúsculas, la profundidad adicional puede ser más beneficiosa que la anchura. El proyecto es relevante para la comunidad de investigación en eficiencia de modelos, ya que proporciona datos empíricos sobre un debate abierto en el diseño de TLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder con RoPE, RMSNorm y activacion SiLU) |
| Parametros totales | Config A: 3.889.920; Config B: 3.816.576 |
| Parametros activos | no aplicable (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (max position embeddings) |
| Tipos de cuantizacion | no disponible (pesos en float16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ambas configuraciones utilizan la arquitectura LlamaForCausalLM, que es un transformer decoder causal con atención multi-cabeza, normalización RMSNorm, activación SiLU en el MLP y embeddings posicionales rotatorios (RoPE) con theta de 2125.0. La diferencia clave entre ambas es la relación entre profundidad y anchura: la Config A tiene 21 capas con hidden size de 128 (relacion hidden/layers de 6,10), mientras que la Config B tiene 9 capas con hidden size de 192 (relacion 21,33). Ambas usan 2 KV heads para atencion multi-query (MQA), tie word embeddings y un vocab size de 2564 tokens gracias al tokenizador personalizado Dillionv2-1.3M.

El entrenamiento se realizo sobre 500 millones de tokens del dataset FineWeb, con una unica epoca, secuencias de 256 tokens y batch size de 256. Se empleo el optimizador AdamW con betas (0,9, 0,95), learning rate de 3e-3 y scheduler WSD (warmup-stable-decay) con warmup del 1,5 %, fase estable del 78 % y decay del 20 %. Se utilizo gradient checkpointing, gradiente clipping a 1,0, weight decay de 0,01 y precision float16. La semilla aleatoria fue 311. No se aplicaron tecnicas de alineacion como RLHF o DPO; se trata de un pretraining clasico de lenguaje.

## Capacidades

- Generacion de texto basica: ambos modelos pueden generar texto en ingles, aunque su capacidad es muy limitada debido a su tamano minusculo y contexto de solo 256 tokens.
- Modelado de lenguaje: la tarea principal para la que fueron entrenados, con capacidad de predecir el siguiente token en secuencias cortas.
- Evaluacion de tareas downstream: los modelos fueron evaluados en tareas de razonamiento de sentido comun y comprension del lenguaje (Arc Easy, Arc Challenge, HellaSwag, PiQA, Swag, Blimp).
- Investigacion de arquitecturas: su principal capacidad es servir como herramienta de ablacion para estudiar el impacto de la profundidad frente a la anchura en TLMs.
- No soporta tool calling, ni function calling, ni capacidades multimodales, ni modo de razonamiento extendido.

## Casos de uso

- Investigacion academica sobre diseno de TLMs: el caso de uso principal es servir como punto de referencia empirico para estudiar el trade-off entre profundidad y anchura en modelos de menos de 4 millones de parametros, permitiendo a otros investigadores replicar o extender los resultados.
- Experimentos de ablacion controlada: al compartir tokenizador, datos y configuracion de entrenamiento, ambos modelos permiten aislar la variable depth-vs-width y comparar arquitecturas de forma limpia.
- Validacion de hipotesis de escalado: los resultados pueden usarse para contrastar teorias sobre como se comportan las leyes de escalado en el regimen de modelos extremadamente pequenos.
- Punto de partida para fine-tuning: aunque su capacidad es limitada, podrian servir como inicializacion para experimentos de fine-tuning en tareas muy especificas con vocabulario restringido.
- Educacion en arquitecturas de transformers: por su tamano minusculo, son utiles para ensenar conceptos de atencion multi-cabeza, RoPE y diseno de arquitecturas en entornos con recursos limitados.
- Comparativa de tokenizadores: al usar el tokenizador Dillionv2-1.3M con un vocabulario de solo 2564 tokens, permiten estudiar el impacto de tokenizadores compactos en el rendimiento de TLMs.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados publicados en la model card, con la precision normalizada por longitud y expresada en porcentaje:

| Config | Final Val Loss ↓ | Arc Easy ↑ | Arc Challenge ↑ | HellaSwag ↑ | PiQA ↑ | Swag ↑ | Blimp ↑ | Avg ↑ |
|---|---|---|---|---|---|---|---|---|
| Config A (depth_311) | 3,13697 | 29,17 | 21,67 | 27,01 | 54,03 | 32,65 | 67,66 | 38,70 |
| Config B (width_311) | 3,14935 | 28,91 | 20,73 | 26,93 | 53,65 | 32,24 | 68,18 | 38,44 |

La Config A (profunda y estrecha) obtiene mejores resultados en Arc Easy, Arc Challenge, HellaSwag, PiQA y Swag, mientras que la Config B solo supera a la A en Blimp. La perdida de validacion final tambien favorece a la Config A. No se han publicado resultados comparativos con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener menos de 4 millones de parametros en float16, ambos modelos ocupan aproximadamente 8 MB en memoria, por lo que pueden ejecutarse en cualquier GPU o incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una Raspberry Pi podria ejecutar estos modelos.
- Compatibilidad con hardware de consumo: total, cabe en cualquier dispositivo con capacidad para ejecutar PyTorch o Transformers.
- Opciones de despliegue: se pueden cargar con la libreria Transformers de HuggingFace usando AutoModelForCausalLM y AutoTokenizer; tambien son compatibles con llama.cpp si se convierten a formato GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamano minusculo, la inferencia es practicamente instantanea incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria de ablacion depth-vs-width. El autor tiene otros modelos publicados en su perfil de HuggingFace, como Syn-2.6M (2,6 millones de parametros entrenado con datos sinteticos) y Er-Medium (12,4 millones de parametros entrenado sobre 34 mil millones de tokens), pero no se han publicado comparativas directas entre ellos y los modelos de este repositorio. La comparativa mas relevante es interna, entre las dos configuraciones del propio estudio, que ya se ha presentado en la seccion de benchmarks.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: estos modelos se crearon exclusivamente para un estudio de ablacion y no estan disenados para tareas reales de generacion de texto.
- Capacidad extremadamente limitada: con menos de 4 millones de parametros y un contexto de 256 tokens, la calidad de la generacion es muy pobre y no es util para aplicaciones practicas.
- Vocabulario muy reducido: el tokenizador Dillionv2-1.3M tiene solo 2564 tokens, lo que limita severamente la expresividad del modelo y su capacidad para manejar vocabulario variado.
- Entrenamiento con datos limitados: 500 millones de tokens es una cantidad muy pequena para entrenar incluso un TLM, por lo que los resultados pueden no generalizar a otros regimenes de datos.
- Solo ingles: el modelo fue entrenado exclusivamente con datos en ingles (FineWeb region US) y no soporta otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar texto incoherente o falso, pero en este caso el riesgo es extremo debido al tamano minusculo.
- Sin garantias de rendimiento: los resultados de los benchmarks son de un estudio puntual con una semilla concreta (311) y pueden no ser reproducibles con otras semillas o configuraciones.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un modelo de investigacion, su utilidad comercial es practicamente nula.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fromziro/Width-Vs-Depth
- Arbol de archivos: https://huggingface.co/fromziro/Width-Vs-Depth/tree/main
- Tokenizador Dillionv2-1.3M: https://huggingface.co/Harley-ml/Dillionv2-1.3M
- Perfil del autor (FromZero): https://huggingface.co/fromziro
- Dataset de entrenamiento FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
