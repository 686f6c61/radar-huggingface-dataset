# OmniJev/PlayJev-0.8B

## Resumen

PlayJev-0.8B es un modelo multimodal de tipo image-text-to-text desarrollado por OmniJev, especializado en jugar a videojuegos sencillos de navegador. Se construye como un fine-tuning del modelo base Qwen/Qwen3.5-0.8B-Base y resuelve un problema concreto: dado un fotograma del juego y una lista de movimientos posibles, elegir la accion mas adecuada. El modelo no recibe el nombre del juego, solo la imagen del estado actual y las opciones disponibles, lo que lo convierte en un agente visual de proposito general para entornos ludicos.

La relevancia de este modelo reside en su enfoque de entrenamiento: combina aprendizaje por imitacion (behaviour cloning) con tres rondas de DAgger, un metodo de aprendizaje por refuerzo interactivo en el que un profesor corrige las decisiones del alumno. Con solo 1.107 millones de parametros reales (etiquetado como 0.8B) y un tiempo de 43 ms por movimiento, demuestra que un modelo pequeno puede igualar al profesor en varios juegos y mantener capacidades generales de vision y lenguaje.

El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en demos web. Su arquitectura se hereda de Qwen3.5-0.8B-Base, un transformer multimodal con soporte de entrada de imagen y texto, aunque la informacion disponible no detalla la longitud de contexto ni la composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen/Qwen3.5-0.8B-Base |
| Parametros totales | 1.107.265.600 (1,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas estandar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

PlayJev-0.8B parte de Qwen3.5-0.8B-Base, un transformer multimodal que procesa pares imagen-texto. La innovacion principal no esta en la arquitectura, sino en el pipeline de entrenamiento: se aplica behaviour cloning inicial seguido de tres rondas de DAgger. En cada ronda, el modelo juega y un profesor (un agente experto preexistente) corrige las acciones, generando nuevos datos de entrenamiento que se incorporan al conjunto. El resultado es un modelo que aprende a imitar al profesor en diez juegos de navegador distintos.

El entrenamiento mezcla datos de juegos con datos generales: un 20% de cada epoca se dedica a preguntas generales de imagen y un 20% a texto. Esta mezcla de replay evita el olvido catastrofico y permite que el modelo mantenga capacidades de MMBench y MMLU. Segun la model card, con un 20% de replay el modelo alcanza una concordancia con el profesor de 0.586 en juegos, 0.78 en MMBench dev y 0.44 en MMLU test, superando al modelo base en MMBench (0.66) y en MMLU (0.33). No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de acciones en videojuegos: dado un fotograma y una lista de movimientos, selecciona la accion optima mediante un unico forward pass.
- Razonamiento visual: interpreta el estado del juego a partir de la imagen, sin conocer el nombre del juego.
- Capacidades generales de vision y lenguaje: mantiene un rendimiento aceptable en MMBench y MMLU gracias al entrenamiento con replay.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: el modelo actua como agente reactivo por paso, no se documenta planificacion multi-paso.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.
- Vision: si, entrada de imagen.
- Audio: no disponible.

## Casos de uso

- Agente de juego en navegador: el modelo puede integrarse en una demo web (como la galeria oficial) para jugar a diez juegos distintos con un unico prompt, seleccionando movimientos en 43 ms por paso. Es adecuado por su baja latencia y su capacidad de generalizar a juegos no vistos durante el entrenamiento.
- Investigacion en aprendizaje por imitacion: sirve como banco de pruebas para experimentar con DAgger y mezclas de replay, ya que la model card documenta el efecto de distintas proporciones de datos generales sobre el rendimiento en juegos y en benchmarks generales.
- Prototipado de agentes visuales: al recibir solo imagen y opciones, puede adaptarse a entornos con interfaz grafica donde las acciones se representan como una lista finita, como menus o formularios.
- Evaluacion de modelos pequenos multimodales: con 1,1B parametros, es util para estudiar el equilibrio entre capacidades especificas (juego) y generales (MMBench, MMLU) en modelos de baja escala.
- Demos interactivas de bajo coste: su tamano permite desplegarlo en infraestructura modesta, ideal para exhibiciones o pruebas de concepto en ferias y entornos educativos.
- Generacion de datos sinteticos de juego: el modelo puede actuar como profesor o alumno en pipelines de generacion de trayectorias para entrenar otros agentes.

## Benchmarks y rendimiento

La model card proporciona resultados en diez juegos, medidos como puntuacion normalizada frente al profesor (1.00 = igual al profesor, 0 = juego aleatorio), con 16 episodios retenidos por juego y un maximo de 1500 pasos por episodio.

| Juego | Aleatorio | PlayJev | Profesor | vs profesor |
|---|---:|---:|---:|---:|
| Space Invaders | 215 | 400 | 400 | 1.00 |
| Racer | 238 | 6709 | 6712 | 1.00 |
| Sokoban | 6.6 | 102.1 | 102.2 | 1.00 |
| Snake | 1.0 | 102.9 | 114 | 0.90 |
| Pacman | 113 | 3965 | 7026 | 0.56 |
| Tetris | 162 | 5792 | 15288 | 0.37 |
| Infinite Mario | 613 | 1757 | 4229 | 0.32 |
| 2048 | 1021 | 4868 | 19593 | 0.21 |
| Floppy Bird | 0.0 | 15.5 | 84.0 | 0.18 |
| Breakout | 496 | 2785 | 16547 | 0.14 |
| Media | | | | 0.57 |

Ademas, se comparan capacidades generales con el modelo base y distintas proporciones de replay:

| Configuracion | Concordancia en juegos | MMBench dev | MMLU test |
|---|---:|---:|---:|
| Modelo base, sin entrenamiento | - | 0.66 | 0.33 |
| Solo juegos | 0.430 | 0.48 | 0.29 |
| 10% replay | 0.431 | 0.65 | 0.42 |
| 20% replay (mezcla de la release) | 0.586 | 0.78 | 0.44 |
| 30% replay | 0.547 | 0.83 | 0.47 |
| Azar | - | 0.40 | 0.25 |

No se han publicado resultados de benchmarks estandar como MMLU completo, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1,1B parametros, en precision fp16 requiere aproximadamente 2,2 GB de VRAM; en cuantizacion de 8 bits, alrededor de 1,1 GB; en 4 bits, unos 0,6 GB (estimaciones teoricas, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como RTX 3060, RTX 4060 o superiores; para despliegue en produccion, A100 o H100 no son necesarias pero ofrecen mayor throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: transformers (libreria nativa), vLLM, llama.cpp, Ollama y TGI son compatibles con el formato safetensors, aunque no se documentan configuraciones especificas.
- Latencia y throughput: la model card indica 43 ms por movimiento en el entorno de demo, lo que sugiere una latencia muy baja en hardware consumer. No se especifica el throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| PlayJev-0.8B | 1,1B | no disponible | Juego multimodal con DAgger | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-Base | 0,8B | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Modelos de juego especializados (p. ej., agentes RL por juego) | variable | no aplica | Entrenamiento por refuerzo especifico | variable | variable |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (agentes multimodales para juegos) en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse con datos de juegos y preguntas generales, puede heredar sesgos de Qwen3.5-0.8B-Base.
- Riesgo de alucinacion: en tareas de juego, el modelo elige entre opciones cerradas, lo que reduce el riesgo de alucinacion; en preguntas generales, puede generar respuestas incorrectas.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; la model card esta en ingles y no detalla capacidades multilingues.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-0.8B-Base.
- Caveats para produccion: el modelo esta disenado para juegos con acciones discretas y un unico paso de decision; no se documenta soporte para planificacion multi-paso ni para entornos con acciones continuas. La puntuacion media frente al profesor es 0.57, con juegos como Breakout (0.14) y Floppy Bird (0.18) muy por debajo, lo que limita su uso en esos titulos.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/PlayJev-0.8B
- Galeria de demos: https://omnijev.github.io/PlayJev/#gallery
- Repositorio de codigo: https://github.com/OmniJev/PlayJev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
