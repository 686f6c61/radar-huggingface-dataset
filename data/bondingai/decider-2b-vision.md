# BondingAI/decider-2b-vision

## Resumen

decider-2b-vision es un modelo de decisión multimodal desarrollado por BondingAI (publicado bajo la organización Mapika en HuggingFace). Se trata de la variante con visión de la familia decider, construida a partir de Qwen3.5-2B vision-language, en la que se han trasplantado los pesos de texto de decider-2b v5 y se ha afinado para emitir una probabilidad calibrada sobre un conjunto de opciones etiquetadas con letras a partir de una imagen y una pregunta textual.

El modelo no genera texto: en un único forward pass lee los logits de las letras en una posición de respuesta (answer slot) y aplica softmax sobre las opciones. Está pensado para toma de decisiones tipada y estructurada, no para conversación ni captioning. Una imagen de 256x240 (por ejemplo, un frame de juego) se codifica en 64 tokens visuales, lo que permite decisiones de baja latencia sobre entrada visual.

Con 2.213.241.664 parámetros y un repositorio de 4,4 GB, es un modelo compacto orientado a routing, clasificación visual, juicios y agentes que necesitan decidir entre alternativas discretas a partir de píxeles. Su relevancia actual reside en combinar calibración explícita (ECE de 0,02 a 0,07 en las tareas medidas) con un coste de inferencia reducido, algo poco habitual en modelos de visión-lenguaje de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3.5-2B vision-language, con pesos de texto de decider-2b v5 trasplantados) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B vision-language, un transformer multimodal denso, sobre el que se injertan los pesos de texto de decider-2b v5. La interfaz de decisión es un único answer slot: la pregunta incluye opciones etiquetadas con letras y el modelo produce logits sobre esas letras, que se normalizan con softmax para obtener una distribución de probabilidad calibrada. No hay generación autoregresiva en el uso previsto. Las imágenes se procesan como tokens visuales (64 tokens para un frame de 256x240).

El entrenamiento consistió en una época sobre 80.000 ejemplos, de los cuales 50.000 incluían imagen. La composición combina frames de juego de Pong, Breakout, CliffWalking, MiniGrid y Super Mario Bros etiquetados por políticas scriptadas (con sobremuestreo de acciones raras y frames DAgger procedentes del propio juego de un modelo anterior), tareas de elección múltiple con imagen de The Cauldron (A-OKVQA, AI2D, ScienceQA, IconQA, TQA, Raven, Hateful Memes) y una repetición de la mezcla de texto. Posteriormente se aplicó PPO desde píxeles sobre Breakout y Pong, usando el softmax sobre las opciones de acción como política. El código de entrenamiento está en el repositorio de GitHub del proyecto (directorio `decider/vision/`).

## Capacidades

- Decisión sobre opciones etiquetadas con letras a partir de una imagen y una pregunta, devolviendo una probabilidad calibrada en un único forward pass.
- Procesamiento de imágenes de diversa naturaleza: fotografías, diagramas, frames de juego.
- Preguntas solo de texto, con el comportamiento de decider-2b v5, incluido su manejo de abstención.
- Tareas de elección múltiple visual (VQA, ciencia, iconos, Raven, memes).
- Juego desde píxeles en entornos de control (Atari, MiniGrid, Mario) mediante la distribución sobre opciones de acción.
- Interfaz programática unificada con el resto de la familia decider (`decider.infer.Decider`, `POST /v1/systemone` en formato de TypeSafe).
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso explícito; su función es la lectura de un slot de decisión.

## Casos de uso

- Clasificación visual con opciones cerradas: dado un frame o una imagen y una pregunta con alternativas, el modelo devuelve la probabilidad de cada opción; útil en pipelines de etiquetado asistido donde se necesita una distribución calibrada y no una respuesta generada.
- Agentes que juegan desde píxeles: la política se obtiene del softmax sobre las opciones de acción, como en los resultados de Breakout (41) y Pong, lo que permite integrar el modelo como política en entornos de control sin estado RAM.
- Routing multimodal: decidir a qué módulo o herramienta derivar una petición a partir de una imagen y una pregunta con opciones (por ejemplo, qué tipo de documento es o qué categoría aplicar).
- Moderación asistida sobre imágenes y memes: el modelo fue entrenado con Hateful Memes y puede emitir una probabilidad sobre opciones de clasificación, adecuada como señal previa a revisión humana.
- Evaluación automática de diagramas y material científico: con AI2D y ScienceQA en el entrenamiento, puede usarse para responder preguntas de elección múltiple sobre figuras y esquemas.
- Preguntas de texto con abstención: en escenarios donde el modelo debe decidir entre opciones o abstenerse, hereda el comportamiento de decider-2b v5, útil para triaje y juicios binarios.
- Investigación en calibración: con ECE medido entre 0,02 y 0,07 en las tareas publicadas, sirve como base para estudiar calibración en modelos visión-lenguaje pequeños.

## Benchmarks y rendimiento

300 ítems por tarea, según la model card.

| Tarea | Precisión | ECE |
|---|---|---|
| Pong frames (acuerdo con el profesor de estado RAM) | 0,96 | 0,02 |
| Breakout frames | 0,96 | 0,02 |
| Visual7W (held out) | 0,89 | 0,03 |
| A-OKVQA | 0,85 | 0,02 a 0,07 |
| AI2D | 0,93 | 0,02 a 0,07 |
| ScienceQA | 0,95 | 0,02 a 0,07 |
| IconQA | 0,94 | 0,02 a 0,07 |
| Raven | 0,80 | 0,02 a 0,07 |
| Hateful Memes | 0,80 | 0,02 a 0,07 |

Juego desde píxeles únicamente (sin estado textual), tres episodios por entorno: Breakout 41 (el profesor de estado RAM obtiene 22), Pong 3 (profesor 8), CliffWalking -13 (óptimo), MiniGrid Empty 0,96 (nivel del profesor); Freeway 0, FrozenLake 0 y los grid worlds más difíciles 0 (sus profesores scriptados también obtienen 0), Mario 1-1 315 px. La release anterior basada en v4 obtenía Breakout 16, Pong 8, Freeway 8 y BabyAI-GoTo 0,30.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,4 GB de pesos más overhead de activaciones y del codificador visual; en la práctica, entre 6 y 8 GB para una ejecución cómoda.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para uso en una sola GPU consumer.
- Cabe en GPU consumer: sí, con 8 GB o más de VRAM en bf16; en GPUs de 6 GB sería necesario recurrir a cuantización, que no está documentada oficialmente.
- Opciones de despliegue: el modelo se usa a través de la librería `decider` (`decider.vision.VisionDecisionModel`), no mediante APIs de generación estándar; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma específica para esta variante; la model card de la familia menciona 4 ms por petición con CUDA graphs en una GPU para decider-2b de texto, dato que no se traslada necesariamente a la variante con visión.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| decider-2b-vision | Qwen3.5-2B vision-language | 2,21 B | no disponible | Apache 2.0 | Decisión multimodal calibrada en un slot |
| decider-2b v10 | Qwen3.5-2B-Base | 2 B | no disponible | Apache 2.0 | Decisión solo texto; regresión 0,805 en tarea / 0,755 held-out |
| decider-4b v1 | Qwen3.5-4B-Base | 4 B | no disponible | Apache 2.0 | Decisión solo texto; 0,834 / 0,788, superior al 2B en 87 de 95 tareas |
| decider-35b-a3b v1 | Qwen3.5-35B-A3B-Base (3 B activos) | 35 B (3 B activos) | no disponible | Apache 2.0 | Decisión solo texto; 0,855 / 0,810, superior al 2B en 93 de 95 tareas |

La comparación directa con modelos de visión-lenguaje generalistas de tamaño similar no está disponible en la información proporcionada, ya que decider-2b-vision no es un modelo generativo y su evaluación se realiza sobre tareas de elección cerrada con métricas de calibración.

## Limitaciones y advertencias

- No es un modelo de chat ni un captioner: solo responde a opciones etiquetadas con letras en un único slot; no genera texto libre.
- Los pesos de texto internos son de decider-2b v5, por lo que el comportamiento solo texto corresponde a v5 y no incluye las mejoras de entrada, calibración ni resultados de navegador de las versiones v6 a v10.
- Solo inglés; no hay soporte multilingüe documentado.
- La calibración se ha medido en los conjuntos listados (Pong, Breakout, Visual7W, A-OKVQA, AI2D, ScienceQA, IconQA, Raven, Hateful Memes), no en imágenes arbitrarias del usuario.
- El juego desde píxeles se ha medido en los frames de Atari, MiniGrid y Mario del entrenamiento más unos pocos juegos held-out, con solo tres episodios por entorno; la generalización a entornos nuevos es limitada (Freeway, FrozenLake y grid worlds difíciles obtienen 0).
- Riesgo de alucinación y sesgo: no documentado de forma específica; al tratarse de un modelo de clasificación calibrada, el riesgo se manifiesta como confianza mal calibrada fuera de la distribución de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar las obligaciones de atribución y las condiciones de los datos de entrenamiento derivados de The Cauldron.
- No se documentan cuantizaciones oficiales ni soporte para frameworks de despliegue estándar, lo que limita las opciones de producción.

## Enlaces

- HuggingFace: https://huggingface.co/BondingAI/decider-2b-vision
- Repositorio GitHub: https://github.com/Mapika/decider
- Código de visión: https://github.com/Mapika/decider (`decider/vision/`)
- Changelog: https://github.com/Mapika/decider/blob/main/docs/CHANGELOG.md
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- decider-0.8b: https://huggingface.co/Mapika/decider-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
