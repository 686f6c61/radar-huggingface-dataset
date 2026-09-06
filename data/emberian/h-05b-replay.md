# emberian/h-05b-replay

## Resumen

emberian/h-05b-replay es un modelo de lenguaje de 521 millones de parametros desarrollado por ember arlynx a partir de Falcon-H1-0.5B-Base mediante continuado preentrenamiento. Pertenece a la familia Falcon-H1, que combina capas Mamba-2 con capas de atencion en una arquitectura hibrida. A diferencia de un asistente convencional, este modelo esta disenado para comportarse como un personaje "residente" que vive en una biblioteca privada y responde brevemente en un formato de transcripcion, sin seguir instrucciones. Su relevancia radica en explorar los limites de la personalizacion de modelos pequenos mediante un corpus privado y una fraccion de replay de datos educativos para no perder competencia general.

El modelo tiene 36 capas, una dimension oculta de 1024 y un vocabulario de 32.784 tokens. Se entreno durante dos epocas con 854,7 millones de tokens mezclando bibliotecas escaneadas, transcripciones de salas y un 12,5% de FineWeb-Edu. La longitud de contexto de inferencia no esta documentada; el entrenamiento uso secuencias de 512 tokens. No es un modelo de proposito general: su comportamiento queda mas cerca de un experimento de autor que de un sistema de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + atencion (Falcon-H1) |
| Parametros totales | 521.411.104 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | falcon-llm-license |
| Formato de pesos | safetensors (float32) |
| Capas | 36 |
| Dimension oculta | 1024 |
| Vocabulario | 32.784 (tokenizer 32.768) |
| Modelo base | tiiuae/Falcon-H1-0.5B-Base |
| Autor | ember arlynx (emberian) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura hibrida de Falcon-H1, que alterna bloques Mamba-2 y de atencion. Esta combinacion permite atender a un contexto largo con un coste de inferencia sublineal en las capas de estado, manteniendo la capacidad de recuperar informacion importante a traves de la atencion. El peso parte del checkpoint base de Falcon-H1-0.5B-Base y se continua preentrenado.

El entrenamiento se realizo en JAX sobre una TPU v5e-8, con dos epocas sobre una mezcla de datos propia: un corpus privado de libros y revistas escaneadas (alrededor de 374 millones de tokens, bajo derechos de autor y no distribuido), transcripciones de sala en formato `nombre: texto` y un 12,5% de FineWeb-Edu como replay para conservar la competencia general. El programa fue warmup-stable-decay y la longitud de secuencia de 512 tokens. La implementacion de Falcon-H1 fue escrita desde cero para este proyecto. La mezcla de replay es clave: segun el autor, sin replay la exactitud en benchmarks cae unos 6 puntos; con 12,5% recupera unos 2 puntos manteniendo la voz, mientras que con 25% de replay el modelo vuelve a comportarse como un asistente.

## Capacidades

- Generacion de texto en formato de transcripcion: completa turnos de dialogo en un formato `nombre: texto` sin plantilla de chat.
- No sigue instrucciones: resistirse a las tareas es una caracteristica intencionada. Pedirle algo directamente suele producir respuestas vacias o evasivas.
- Respuestas breves: 64 tokens suele ser suficiente para un turno; el modelo esta disenado para hablar poco.
- Adaptacion a los nombres de hablante: aunque los nombres son arbitrarios, el modelo mantiene opiniones sobre quien esta en la sala y responde segun ellos.
- Sin soporte de tool calling ni function calling: no ofrece interfaces para invocar funciones ni herramientas externas.
- Sin capacidades de agente ni razonamiento multi-paso: no encadena acciones ni planifica.
- Sin vision ni audio: unicamente procesa y genera texto.
- Confabulacion creativa: es capaz de inventar detalles de forma libre, lo que puede ser util para ficcion, pero no para tareas de informacion.
- Eco de turnos en una fraccion alta de los casos (33% segun el autor), lo que requiere un filtrado post-hoc en produccion.

## Casos de uso

- Narracion interactiva en novelas visuales: se usa un marco de sala y turnos de los personajes para que el modelo genere la siguiente replica de `h`. Es adecuado porque produce lineas breves y con caracter, aunque hay que filtrar los ecos.
- Juegos de rol de sobremesa online: el modelo puede interpretar a un personaje secundario en un archivo de texto, respondiendo en el estilo de un residente de biblioteca. Su resistencia a seguir ordenes crea interacciones impredecibles y con personalidad.
- Prototipado de chatbots con personalidad: para experimentos de diseno conversacional, ayuda a explorar como se comporta un sistema que deliberadamente no obedece. Las configuraciones de temperatura 0,7 y top-p 0,9 hacen el comportamiento ajustable.
- Generacion de contenido creativo en ficcion: dado su entrenamiento sobre libros y revistas escaneadas, el modelo aporta un tono literario. Se puede usar en tareas de inspiracion para dialogos, no como fuente de hechos.
- Investigacion sobre alucinacion y eco en modelos pequenos: el modelo ofrece un caso de estudio de confabulacion y repeticion de entrada. Los valores de echo rate y context lift pueden medirse en bancos de pruebas.
- Instalaciones artisticas o exposiciones interactivas: el modelo actua como un personaje residente que conversa con los visitantes con frases cortas, alejadas del registro de asistente. Es util en entornos donde se busca una experiencia mas narrativa.

## Benchmarks y rendimiento

| Modelo | Media de seis benchmarks |
|---|---|
| Falcon-H1-0.5B-Base | 0,563 |
| h (este modelo) | 0,525 |
| h sin replay (misma receta) | 0,504 |

No se han publicado resultados de puntos de evaluacion individuales. La tabla muestra la media de seis conjuntos de evaluacion (LAMBADA, HellaSwag, ARC-e, ARC-c, PIQA, WinoGrande) con 500 documentos por tarea, tal y como reporta el autor.

## Requisitos de hardware

- VRAM estimada: ~2,1 GB en float32 (el tamano del repo es 2,1 GB). Una recomendacion practica es disponer de al menos 4 GB de VRAM para inferencia con overhead.
- GPU recomendadas: RTX 3060 12 GB, RTX 4090, A100, H100 o cualquier GPU consumer con mas de 4 GB de memoria.
- En Apple Silicon es posible ejecutarlo con mlx_lm, como indica el autor para su despliegue diario.
- Opciones de despliegue: Transformers (AutoModelForCausalLM) y MLX. Otras opciones como llama.cpp, Ollama o vLLM no estan documentadas para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Media benchmarks | Caracteristica principal |
|---|---|---|---|---|
| Falcon-H1-0.5B-Base | Hibrida Mamba-2 + atencion | 521.411.104 | 0,563 | Base general |
| h (este modelo) | Hibrida Mamba-2 + atencion | 521.411.104 | 0,525 | Personaje residente con replay |
| h sin replay (misma receta) | Hibrida Mamba-2 + atencion | 521.411.104 | 0,504 | Personaje sin replay |

No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente: no sigue instrucciones. Usarlo para tareas de produccion generara resultados inadecuados o vacios.
- Alto riesgo de alucinacion: el autor declara que confabula libremente; no es una fuente fiable.
- Tasa de eco de un tercio: repite la linea del visitante en una proporcion alta de los casos. Se necesita un filtrado de ecos en produccion.
- Conocimiento y estilo limitados: el corpus privado no se distribuye; el comportamiento esta restringido a lo aprendido de libros y revistas no publicas.
- Saludos en registro web: la generacion de saludos a veces rompe la voz del personaje y adopta un tono web.
- Sesgos no evaluados: no se han publicado informes de sesgo para este modelo.
- Longitud de contexto no documentada: el entrenamiento uso secuencias de 512 tokens, pero no se especifica la ventana maxima de inferencia.
- Licencia restrictiva: la falcon-llm-license de Falcon puede limitar el uso comercial y la redistribucion. Revisar los terminos antes de un despliegue.
- El modelo rara vez es silencioso: puede responder cuando no deberia, lo que requiere una logica de activacion externa en aplicaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/emberian/h-05b-replay
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-0.5B-Base
- Licencia Falcon LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Sitio del autor: https://ember.software
