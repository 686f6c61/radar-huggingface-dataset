# binghe-sjtu/GameWM

## Resumen

GameWM es una familia de modelos de mundo (*world models*) orientados a la generación de vídeo para videojuegos, desarrollada por el grupo de investigación `binghe-sjtu` (Universidad Jiao Tong de Shanghái). El sistema se compone de dos piezas: un motor denominado GameWM-engine que mantiene las reglas, el estado, la cámara, el layout y el movimiento grueso de cada interacción, y lo renderiza como un vídeo *proxy*; y el modelo GameWM-VM, que transforma ese proxy, un primer fotograma, una hoja de personaje opcional y un *caption* en el vídeo final, añadiendo la apariencia del mundo y el detalle de cada interacción.

El repositorio publica los pesos de tres variantes del modelo de vídeo: GameWM-H3-33B (LoRA r128 sobre MiniMax-H3), GameWM-Wan2.2-14B (LoRA r128 sobre el experto de alto ruido de Wan2.2-I2V-A14B) y GameWM-Wan2.2-5B (fine-tuning completo sobre Wan2.2-TI2V-5B). Cada variante se distribuye en dos configuraciones, `BD` (bidireccional, Stage0.5) y `BD-Sheet` (con hoja de personaje), con resolución y duración de clip específicas por modelo.

La relevancia del proyecto radica en su enfoque *interaction-centric*: en lugar de generar vídeo libre a partir de texto, condiciona la generación sobre un proxy que codifica la mecánica del juego, lo que permite mantener coherencia temporal y de estado en secuencias interactivas. Los estudiantes causales (AR) y DMD no se han publicado todavía; solo se liberan los modelos bidireccionales de Stage0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusión vídeo (flow matching bidireccional) sobre backbones MiniMax-H3 y Wan2.2; adaptación mediante LoRA o fine-tuning completo |
| Parametros totales | 33B (H3-33B), 14B (Wan2.2-14B, experto de alto ruido), 5B (Wan2.2-5B) |
| Parametros activos | no disponible (no es MoE en el sentido estricto; Wan2.2-I2V-A14B es un modelo de dos expertos y aquí solo se usa el de alto ruido) |
| Longitud de contexto | no disponible (clip de 124 frames a 24 fps en H3-33B; 81 frames a 16 fps en Wan2.2-14B; 121 frames a 24 fps en Wan2.2-5B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionado por *caption* de texto; idiomas no especificados) |
| Licencia | `gamewm-weights`; H3-33B bajo MiniMax H3 Community License (restringida territorialmente); Wan2.2-14B y Wan2.2-5B bajo Apache-2.0 |
| Formato de pesos | `adapter.pt` (H3-33B), `student.safetensors` (Wan2.2-14B y Wan2.2-5B); incluye `release.json` con SHA-256 |

## Arquitectura y entrenamiento

GameWM-VM se apoya en backbones de difusión vídeo preentrenados y los adapta al dominio de los videojuegos mediante dos estrategias según la variante. Para GameWM-H3-33B se aplica un LoRA de rango 128 sobre las proyecciones Q/K/V/O de la atención del backbone MiniMax-H3, generando un adaptador `adapter.pt` de 0,64 GB. Para GameWM-Wan2.2-14B se usa también LoRA r128 sobre el experto de alto ruido de Wan2.2-I2V-A14B (`student.safetensors` de 0,84 GB). Para GameWM-Wan2.2-5B se realiza un fine-tuning completo de Wan2.2-TI2V-5B (`student.safetensors` de 10,0 GB).

El entrenamiento se estructura en etapas: los modelos liberados corresponden a Stage0.5 (bidireccional, *flow matching* con 30 pasos de muestreo). Las variantes `-Sheet` incorporan una hoja de personaje (vistas frontal, lateral y trasera) como segunda imagen de entrada y se entrenaron con esa hoja descartada en una quinta parte de las muestras, de modo que el primer fotograma por sí solo sigue funcionando. La condicionalidad se ejerce sobre un *proxy* pre-codificado (caché) más el primer fotograma, la hoja opcional y un *caption*. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de vídeo condicionada a imagen (*image-to-video*) a partir de un primer fotograma y un proxy de interacción.
- Generación de vídeo condicionada a *caption* de texto junto con el proxy.
- Control de la apariencia del mundo y del detalle de cada interacción a partir del proxy del motor.
- Soporte de hoja de personaje (*character sheet*) con vistas frontal, lateral y trasera en las variantes `-Sheet`.
- Coherencia de estado y mecánica del juego gracias a la condición sobre el proxy del GameWM-engine.
- Resoluciones y duraciones específicas: 1280×704 a 24 fps y 124 frames (H3-33B); 832×480 a 16 fps y 81 frames (Wan2.2-14B); 1280×704 a 24 fps y 121 frames (Wan2.2-5B).
- Muestreo bidireccional con 30 pasos.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, razonamiento multi-paso, audio o *thinking mode*.

## Casos de uso

- Prototipado rápido de videojuegos: el motor GameWM-engine define reglas, cámara y movimiento, y GameWM-VM renderiza el aspecto final, permitiendo iterar sobre la estética sin rehacer la lógica de juego.
- Previsualización de cinemáticas interactivas: a partir de un primer fotograma y un proxy de la secuencia, el modelo genera clips de hasta 124 frames a 24 fps (H3-33B) o 121 frames a 24 fps (Wan2.2-5B) para validar la puesta en escena.
- Generación de variantes de personaje: las variantes `-Sheet` aceptan una hoja con vistas frontal, lateral y trasera, lo que permite mantener la identidad visual del personaje a lo largo de la secuencia.
- Creación de contenido para motores de juego en producción: el proxy codifica el estado y la mecánica, y el modelo añade el detalle visual, lo que resulta adecuado para generar *assets* de vídeo consistentes con la simulación.
- Investigación en *world models*: el par engine + VM sirve como banco de pruebas para estudiar cómo condicionar la generación de vídeo sobre el estado de una simulación y evaluar la fidelidad de la mecánica.
- Demostración de mecánicas con múltiples personajes: la *teaser* del proyecto muestra ocho personajes realizando la misma mecánica del motor con habilidades propias, lo que ilustra el uso para mostrar variabilidad de habilidades sobre una misma regla.
- Generación de clips a resolución 1280×704 para tráileres o material promocional de un juego, usando el backbone de 5B con fine-tuning completo para mayor fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de tamaño de pesos, el adaptador H3-33B ocupa 0,64 GB, el de Wan2.2-14B 0,84 GB y el de Wan2.2-5B 10,0 GB; a ello hay que sumar el backbone descargado por separado (MiniMax-H3, Wan2.2-I2V-A14B o Wan2.2-TI2V-5B).
- GPU recomendadas: no disponible en la información proporcionada. El ejemplo de lanzamiento usa `--nproc-per-node 8`, lo que sugiere despliegue multi-GPU.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el runtime propietario `solarwm` del repositorio de GitHub, lanzado mediante `python -m solarwm.runtime.local_file_launcher` con `--nproc-per-node 8`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El muestreo bidireccional usa 30 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / clip | Licencia | Disponibilidad |
|---|---|---|---|---|
| GameWM-H3-33B | 33B | 124 frames, 24 fps, 1280×704 | MiniMax H3 Community License (restringida territorialmente) | Pesos en HF |
| GameWM-Wan2.2-14B | 14B (experto alto ruido) | 81 frames, 16 fps, 832×480 | Apache-2.0 | Pesos en HF |
| GameWM-Wan2.2-5B | 5B | 121 frames, 24 fps, 1280×704 | Apache-2.0 | Pesos en HF |
| MiniMax-H3 (backbone) | 33B | no disponible | MiniMax H3 Community License | Backbone en HF |
| Wan2.2-I2V-A14B (backbone) | 14B | no disponible | Apache-2.0 | Backbone en HF |
| Wan2.2-TI2V-5B (backbone) | 5B | no disponible | Apache-2.0 | Backbone en HF |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes ni frente a otros modelos de generación de vídeo en la información proporcionada.

## Limitaciones y advertencias

- Solo se liberan los modelos bidireccionales de Stage0.5 (`BD` y `BD-Sheet`); los estudiantes causales (AR) y DMD no están publicados.
- La licencia `gamewm-weights` es específica del proyecto y depende del backbone: GameWM-H3-33B queda sujeta a la MiniMax H3 Community License, que no permite uso, reproducción, modificación ni distribución en la Unión Europea, el Reino Unido, la República de Corea ni los Estados Unidos de América, e incluye una política de uso aceptable.
- Las variantes Wan2.2-14B y Wan2.2-5B se distribuyen bajo Apache-2.0, pero son derivadas de Wan2.2 y heredan sus condiciones.
- El uso requiere el runtime propietario `solarwm` del repositorio de GitHub y entradas en forma de cachés de proxy pre-codificadas; no es un modelo de uso directo con pipelines estándar de difusión.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- El modelo está especializado en dominios de videojuegos y condicionado por el proxy del motor; no se especifica su comportamiento fuera de ese dominio.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica una adopción aún incipiente.
- No se publican datos de cuantización, por lo que el despliegue en hardware limitado no está caracterizado.

## Enlaces

- Hugging Face: https://huggingface.co/binghe-sjtu/GameWM
- Paper (arXiv): https://arxiv.org/abs/2611.19247
- Página del proyecto: https://hebing-sjtu.github.io/GameWM-website/
- Repositorio de código: https://github.com/hebing-sjtu/GameWM
- Backbone MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Backbone Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Backbone Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
