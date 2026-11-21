# adityx23/pi05-ocb-stack-ladder

## Resumen

pi05-ocb-stack-ladder es un checkpoint de ajuste fino completo del modelo fundacional de robotica pi0.5, desarrollado por adityx23 sobre la base `physical-intelligence/pi05_base`. Se ha entrenado especificamente para la tarea de apilar dos cubos (`block-double-task2`) del conjunto de evaluacion OCBench, sobre un brazo UR5e simulado en MuJoCo Warp. El repositorio no contiene un unico modelo, sino una escalera de checkpoints intermedios (5000, 10000, 15000, 20000, 25000 y 29999 pasos) pensados como politicas base de distinta madurez para posteriores procesos de aprendizaje por refuerzo.

El modelo resuelve un problema muy concreto: proporcionar puntos de partida con distintos niveles de competencia para investigacion en RL sobre politicas de manipulacion. En lugar de ofrecer solo el checkpoint final, el autor publica la trayectoria de entrenamiento completa, lo que permite estudiar como evoluciona la politica y elegir el punto de arranque mas adecuado segun la estrategia de refinamiento. La licencia es Gemma, heredada del modelo base, y el tamano del repositorio es de 74,6 GB, coherente con seis copias de pesos en formato orbax.

La relevancia actual radica en el interes creciente por los modelos fundacionales de robotica (VLA, vision-language-action) y por tecnicas de RL aplicadas a politicas de manipulacion. Este checkpoint, aunque de nicho y sin descargas ni interacciones en el momento de la consulta, ejemplifica un flujo de trabajo reproducible sobre openpi (la implementacion JAX de Physical Intelligence).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA, vision-language-action), implementacion openpi / lair-openpi en JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en orbax, sin versiones GGUF ni safetensors publicadas) |
| Idiomas soportados | no disponible (el prompt de tarea es en ingles: "stack the two cubes") |
| Licencia | Gemma |
| Formato de pesos | orbax (carpeta `params/` con pesos EMA) + `assets/` con estadisticas de normalizacion por cuantiles |

## Arquitectura y entrenamiento

El modelo parte de `physical-intelligence/pi05_base` y se ajusta de forma completa (fully fine-tuned) sobre 3000 demostraciones exitosas de la tarea de apilado de cubos en OCBench, totalizando 835.556 fotogramas a 10 fps. La entrada combina dos camaras (frontal y de muneca) a resolucion 128x128 y un estado de propriocepcion de 19 dimensiones. Las acciones son objetivos articulares absolutos de 7 dimensiones (6 del brazo mas pinza), aunque el brazo se entrena como deltas respecto a las articulaciones al inicio del chunk. El horizonte de accion es de 30 pasos y se emplea RTC (real-time chunking) en tiempo de entrenamiento con un retardo de prefijo muestreado uniformemente en U[0, 15). La entrada de estado es continua.

El entrenamiento usa batch de 128, 30.000 pasos, optimizador AdamW con learning rate pico de 5e-5 y decaimiento coseno hasta 5e-6, 500 pasos de warmup, recorte de gradiente de 1.0 y EMA con factor 0.999. Se publican los pesos EMA en cada checkpoint, pero no el estado del optimizador. El prompt de tarea es fijo ("stack the two cubes"), lo que simplifica el uso pero limita la generalidad a esa instruccion concreta.

## Capacidades

- Manipulacion robotica de precision: apilado de dos cubos con un brazo UR5e en simulacion MuJoCo Warp.
- Control continuo de acciones: genera objetivos articulares absolutos de 7 dimensiones a partir de observaciones visuales y de propriocepcion.
- Percepcion multimodal: procesa simultaneamente imagen frontal, imagen de muneca y estado de 19 dimensiones.
- Ejecucion de politicas con horizonte de accion de 30 pasos y RTC para despliegue en tiempo real.
- Punto de partida para RL: los seis checkpoints permiten elegir una politica base de distinta competencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras tareas distintas al apilado de cubos.

## Casos de uso

- Investigacion en RL sobre politicas de manipulacion: usar los checkpoints intermedios como politicas base de distinta madurez y comparar curvas de refinamiento con RL desde cada punto de partida.
- Estudio de la evolucion del entrenamiento: analizar como cambia la politica entre 5000 y 29999 pasos para entender la dinamica de aprendizaje de pi0.5 en tareas de apilado.
- Reproduccion de experimentos en OCBench: el checkpoint permite reproducir la tarea `block-double-task2` con el prompt fijo "stack the two cubes".
- Benchmarking de algoritmos de RL: al disponer de varios puntos de partida, se puede medir la sensibilidad de un algoritmo de RL al estado inicial de la politica.
- Desarrollo de pipelines de simulacion a real: servir como referencia de politica entrenada en MuJoCo Warp antes de transferir a un UR5e fisico, aunque la validacion real no esta documentada.
- Docencia y divulgacion: ejemplo reproducible de ajuste fino de un VLA fundacional sobre una tarea concreta con openpi en JAX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de evaluacion ni comparaciones numericas entre los distintos checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 74,6 GB por los seis checkpoints; una sola copia de pesos EMA requiere aproximadamente 12 GB en disco, pero el consumo en VRAM depende del tamano real del modelo pi0.5, que no se especifica.
- GPU recomendadas: no disponible. Al ser un modelo JAX/orbax de robotica, se espera uso en GPU de datacenter, pero no hay datos concretos en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi / lair-openpi (JAX). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-ocb-stack-ladder | no disponible | no disponible | Apilado de cubos (OCBench) | Gemma | Hugging Face, 0 descargas |
| physical-intelligence/pi05_base | no disponible | no disponible | Modelo fundacional VLA general | no disponible en la informacion | Hugging Face (modelo base) |
| Otros checkpoints de openpi | no disponible | no disponible | Manipulacion diversa | no disponible en la informacion | no disponible |

La comparacion con alternativas concretas no esta disponible en la informacion proporcionada. El unico punto de referencia claro es el modelo base `pi05_base`, del que este checkpoint deriva y del que hereda arquitectura y licencia.

## Limitaciones y advertencias

- Especializacion extrema: solo esta entrenado para la tarea de apilar dos cubos con prompt fijo; no generaliza a otras instrucciones ni tareas.
- Entrenamiento exclusivamente en simulacion (MuJoCo Warp); no hay evidencia de transferencia a un robot fisico.
- No se publican tasas de exito ni evaluaciones, por lo que se desconoce la calidad real de cada checkpoint.
- El estado del optimizador no esta incluido, lo que limita reanudar el entrenamiento supervisado desde estos checkpoints.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos antes de cualquier despliegue productivo.
- Riesgo de sobreajuste a la distribucion de las 3000 demostraciones scriptadas y al entorno simulado concreto.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera de la tarea; el prompt esta en ingles.
- Repositorio sin descargas ni interacciones: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityx23/pi05-ocb-stack-ladder
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
