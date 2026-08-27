# HyeonseokE/smolvla_extract_cube_cap_3000_10fps

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico por aprendizaje por imitación. Este repositorio concreto, `HyeonseokE/smolvla_extract_cube_cap_3000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones de la tarea "extraer el cubo del bolsillo y colocarlo en el marcador objetivo", registrado con el robot SO-101 a 10 FPS. Con 450 millones de parámetros, el modelo está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan políticas robóticas asequibles sin sacrificar rendimiento.

El modelo consume tres imágenes de cámara (256x256) y el estado del robot (6 dimensiones), y produce acciones articulares de 6 dimensiones. Está entrenado con el framework LeRobot (versión 0.5.1) y utiliza flow matching para la generación de acciones, una técnica que permite salidas suaves y estables. Al ser un fine-tuning de un modelo base ya preentrenado, hereda las capacidades de razonamiento visual y lingüístico del VLM subyacente, aunque su uso principal es la ejecución de tareas de manipulación específicas.

La relevancia actual de este modelo radica en su tamaño reducido (450M frente a los 7B de OpenVLA o los 55B de RT-2), lo que permite desplegarlo en GPUs de consumo y en robots de bajo coste, democratizando el acceso a la robótica basada en VLA. No se han publicado resultados de evaluación en robot real para este fine-tuning concreto, pero el paper original de SmolVLA (arXiv:2506.01844) reporta rendimiento competitivo en tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA: VLM compacto + experto de acciones con flow matching |
| Parametros totales | 450.046.176 (aprox. 450M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA ligero compuesto por un modelo de lenguaje y vision (VLM) preentrenado compacto y un experto de acciones entrenado con flow matching. Dadas múltiples imágenes y una instruccion en lenguaje natural, el modelo genera un chunk de acciones articulares. La arquitectura exacta (numero de capas, dimensiones ocultas, tipo de atencion) no se detalla en la informacion disponible, pero se sabe que esta optimizada para inferencia eficiente en hardware de consumo.

Este fine-tuning se ha entrenado sobre el dataset `HyeonseokE/extract_cube_cap_10fps`, que contiene 100 episodios y 31.575 frames a 10 FPS, con la tarea descrita como "Extract the cube from the pocket and place it on the target marker". La configuracion de entrenamiento incluye 24.668 pasos, batch size de 64, optimizador AdamW con learning rate de 0,0001 y semilla 3000. Se ha utilizado LeRobot 0.5.1 como framework. El modelo base `lerobot/smolvla_base` ya habia sido preentrenado con datos diversos de manipulacion, por lo que este fine-tuning adapta el conocimiento general a la tarea especifica de extraccion y colocacion de cubos.

## Capacidades

- Control de robot SO-101 (follower) a partir de tres imagenes de camara (top, left_wrist y una tercera no especificada) a resolucion 256x256.
- Generacion de acciones articulares de 6 dimensiones (posiciones o velocidades en radianes) para manipulacion robotica.
- Ejecucion de la tarea especifica de extraer un cubo de un bolsillo y colocarlo sobre un marcador objetivo.
- Acepta instrucciones en lenguaje natural (task description) para guiar la politica.
- Procesa multiples entradas visuales simultaneamente, lo que permite percepcion multimodal del entorno.
- No incluye capacidades de chat, tool calling, generacion de texto libre ni razonamiento conversacional; es exclusivamente un modelo de politica (policy) para robotica.

## Casos de uso

- Automatizacion de picking and placing en entornos controlados: el modelo puede extraer objetos de contenedores o bolsillos y depositarlos en posiciones marcadas, util en lineas de montaje o laboratorios de robotica.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para fine-tuning en tareas similares, aprovechando su tamano reducido para iterar rapidamente con datasets pequenos.
- Desarrollo de robots de bajo coste: al tener solo 450M de parametros, puede ejecutarse en GPUs de consumo (p. ej., RTX 3060 o superiores), lo que permite prototipar politicas VLA sin infraestructura de alto presupuesto.
- Evaluacion de metodos de flow matching para control robotico: el modelo emplea esta tecnica de generacion de acciones, por lo que es util para comparar con otros enfoques (diffusion, transformers autoregresivos) en tareas de manipulacion.
- Benchmarking de VLA en robots SO-101: al estar entrenado con LeRobot, se integra facilmente en pipelines de evaluacion estandarizados, permitiendo comparar con otros modelos de la misma familia.
- Educacion y formacion en robotica: su tamano y licencia Apache-2.0 facilitan su uso en cursos y talleres donde se ensena aprendizaje por imitacion con robots reales o simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. El paper original de SmolVLA (arXiv:2506.01844) reporta comparaciones con otros VLA, pero no se dispone de esos datos en la informacion proporcionada.

## Requisitos de hardware

- No se han publicado requisitos especificos de hardware para este modelo.
- Dado el tamano de 450M de parametros y 0,9 GB de pesos en safetensors, es plausible que quepa en GPUs de consumo con 4-8 GB de VRAM en precision FP16, aunque no hay datos oficiales.
- El modelo base SmolVLA esta disenado para hardware de consumo, por lo que se espera que este fine-tuning herede esa caracteristica.
- Para inferencia se recomienda usar el framework LeRobot, que gestiona la carga del modelo y la ejecucion en GPU (CUDA).
- No se dispone de datos de latencia o throughput. Al ser un modelo pequeno, se espera una inferencia rapida, pero no hay mediciones publicadas.
- Opciones de despliegue: LeRobot (PyTorch), con posibilidad de exportar a otros formatos si se desea, aunque no se mencionan cuantizaciones ni soporte para vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento en la informacion proporcionada. Sin embargo, se puede situar este modelo en el contexto de otros VLA:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | No disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | No disponible | Hugging Face |
| RT-2 | 55B | No disponible | No disponible | No publico |

SmolVLA es significativamente mas pequeno que OpenVLA (7B) y RT-2 (55B), lo que permite despliegue en hardware de consumo. El paper original (arXiv:2506.01844) incluye comparaciones detalladas, pero no estan disponibles en la informacion de este repositorio.

## Limitaciones y advertencias

- Modelo especializado en una tarea concreta (extraer cubo de bolsillo y colocarlo en marcador). No es generalista y puede fallar en tareas fuera de este dominio.
- Entrenado con un dataset pequeno (100 episodios), lo que puede provocar overfitting y baja generalizacion ante variaciones de iluminacion, posicion de objetos o configuracion del robot.
- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento real es desconocido.
- Depende de la configuracion especifica de camaras (top, left_wrist y una tercera) y del robot SO-101. Cambios en la disposicion de camaras o en el robot pueden degradar el rendimiento.
- Riesgo de alucinacion en acciones si las condiciones de inferencia difieren del entrenamiento (p. ej., objetos nuevos, fondos distintos).
- No soporta conversacion, generacion de texto ni tool calling; es exclusivamente un modelo de politica robotica.
- La licencia Apache-2.0 permite uso comercial, pero el dataset asociado (`HyeonseokE/extract_cube_cap_10fps`) no especifica su licencia, por lo que conviene verificar antes de usarlo en produccion.
- El modelo fue creado en agosto de 2026 (segun la fecha del repositorio), lo que podria indicar que es un experimento reciente sin validacion extensa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_extract_cube_cap_3000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/extract_cube_cap_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Fork de LeRobot con acciones delta por chunks: https://github.com/HyeonseokE/kaia_lerobot
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
