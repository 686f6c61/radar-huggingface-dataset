# jwhite135/stage1_pi0

## Resumen

jwhite135/stage1_pi0 es un ajuste fino (fine-tune) del modelo base lerobot/pi0_base, una implementacion en LeRobot del modelo de robotica general π₀ desarrollado por Physical Intelligence. Se trata de una politica Vision-Language-Action (VLA) de proposito general que combina un modelo preentrenado de vision-lenguaje con un experto de acciones basado en flow matching, capaz de interpretar imagenes e instrucciones en lenguaje natural y emitir comandos motores directamente. Con aproximadamente 4.028 millones de parametros y un repositorio de 8,9 GB en formato safetensors, la relevancia de este checkpoint concreto radica en que es un ejemplo de especializacion de una politica fundacional sobre un conjunto de datos propio de tareas de manipulacion.

Este fine-tune ha sido entrenado sobre el dataset "default", compuesto por 150 episodios y 218.964 fotogramas a 30 FPS, con tres tareas concretas de manipulacion de hardware ("Take hardware from human and put in taped area", "Put all hardware in bucket" y "put nuts in red cup and bolts in blue bucket"). El modelo consume el estado del robot (vector de 6 dimensiones) y tres flujos de imagen de 480x640 (camaras `gripper`, `newtop`, `newside`), y produce un vector de accion de 6 dimensiones. Esta pensado para ejecutarse sobre un robot de tipo `follow` mediante el ecosistema LeRobot, y su licencia derivada de Gemma condiciona su uso comercial.

El interes actual del modelo reside en su naturaleza abierta: libera pesos de una politica VLA fundacional y el flujo completo de entrenamiento e inferencia a traves de LeRobot y OpenPI, permitiendo a grupos de investigacion reproducir y especializar politicas de robotica sin partir de cero. No obstante, se trata de un checkpoint publicado por un usuario individual, con pocas descargas (13) y sin resultados de evaluacion reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flow matching; construida sobre un modelo de vision-lenguaje preentrenado (licencia gemma, tipo PaliGemma) mas un experto de acciones |
| Parametros totales | 4.028.019.472 (~4,03 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/pi0_base |
| Tipo de robot | `follow` |
| Camaras | `gripper`, `newtop`, `newside` |
| Entradas | `observation.state` (6,), `observation.images.gripper` (3, 480, 640), `observation.images.newtop` (3, 480, 640), `observation.images.newside` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 8,9 GB |
| Descargas | 13 |
| Likes | 0 |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura subyacente de π₀ es un modelo Vision-Language-Action basado en flow matching, tal y como describe el articulo "[π₀: A Vision-Language-Action Flow Model for General Robot Control](https://arxiv.org/abs/2410.24164)". El modelo reutiliza un backbone de vision-lenguaje preentrenado (de ahi la licencia Gemma, compatible con la familia PaliGemma) y le anade un experto de acciones que genera trozos de accion continua (action chunks) mediante flow matching. El modelo base lerobot/pi0_base se presenta en la documentacion de OpenPI como preentrenado sobre mas de 10.000 horas de datos de robot de multiples plataformas, lo que le confiere conocimiento semantico a escala de internet y generalizacion entre tareas.

Este checkpoint concreto (stage1_pi0) es un fine-tune del modelo base anterior sobre el dataset "default". La configuracion de entrenamiento reportada incluye 3.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 0, ejecutado con LeRobot version 0.6.2. El conjunto de datos contiene 150 episodios y 218.964 fotogramas capturados a 30 FPS, con tareas especificas de recogida y clasificacion de hardware. No se detalla en la model card la composicion del dataset ni si se aplicaron etapas de RLHF o DPO (no disponible).

## Capacidades

- Control de robot mediante politica VLA: convierte observaciones visuales (tres camaras) y estado propioceptivo en acciones motoras continuas de 6 dimensiones.
- Interpretacion de instrucciones en lenguaje natural: acepta tareas textuales como "Take hardware from human and put in taped area" o "put nuts in red cup and bolts in blue bucket".
- Percepcion visual multi-camara: procesa simultaneamente los flujos `gripper`, `newtop` y `newside` a 480x640.
- Ejecucion de politicas de imitacion especializadas: las tres tareas concretas sobre las que fue ajustado.
- Integracion con LeRobot: soporte de rollout en robot real y de reentrenamiento mediante las CLI `lerobot-rollout` y `lerobot-train`.
- Soporte de tool calling / function calling: no aplica (modelo de robotica, no de lenguaje general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se documentan modos de "thinking", vision generativa ni audio.

## Casos de uso

- Manipulacion de hardware en linea de montaje: el modelo puede recoger piezas entregadas por un operario y depositarlas en una zona delimitada, usando la tarea "Take hardware from human and put in taped area" como politica entrenada directamente para ese flujo.
- Clasificacion y recogida de componentes: dado que fue ajustado con la tarea "Put all hardware in bucket", puede emplearse para agrupar piezas dispersas y trasladarlas a un contenedor.
- Seleccion por tipo de pieza: la tarea "put nuts in red cup and bolts in blue bucket" permite separar tuercas y tornillos segun el recipiente, util en estaciones de kitting.
- Punto de partida para ajuste fino propio: al derivar de lerobot/pi0_base, sirve como checkpoint inicial para que otros equipos especialicen politicas con sus propios datasets mediante `lerobot-train`.
- Investigacion en aprendizaje por imitacion: el checkpoint y su configuracion documentada (pasos, LR, batch) permiten reproducir experimentos de fine-tuning VLA.
- Evaluacion de transferencia vision-lenguaje-accion: al conservar el backbone preentrenado, es adecuado para estudiar como se transfiere el conocimiento semantico del VLM a tareas motoras concretas.
- Banco de pruebas sobre robots de tipo `follow`: su formato de entradas/salidas definido (estado de 6 dimensiones y tres camaras) facilita desplegarlo en plataformas compatibles con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito por tarea, ni de comparativas numericas frente a otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/fp32 segun el repo de 8,9 GB): aproximadamente 9-10 GB en fp16; en torno a 16-18 GB en fp32.
- GPU recomendadas para inferencia: NVIDIA RTX 4090, RTX 3090 o superiores (24 GB de VRAM), y GPUs de centro de datos como A100 o H100 para despliegues con margen.
- Cabe en GPU de consumo: si, en modelos con al menos 12-16 GB de VRAM (RTX 4080/4090, 3090), funcionando en fp16.
- GPU recomendada para entrenamiento/fine-tuning: A100, H100 o equivalentes, dado que el entrenamiento combina el backbone de vision-lenguaje con el experto de acciones y requiere memoria adicional.
- Opciones de despliegue: ecosistema LeRobot (comandos `lerobot-rollout` y `lerobot-train`) y OpenPI; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de politica de control).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jwhite135/stage1_pi0 | ~4,03 B | VLA flow matching (fine-tune) | lerobot/pi0_base | gemma | HuggingFace (13 descargas) |
| lerobot/pi0_base | ~4 B (no confirmado en la informacion) | VLA flow matching (base) | π₀ de Physical Intelligence | gemma | HuggingFace (LeRobot) |
| π₀-FAST | No disponible | VLA autorregresivo basado en el tokenizador FAST | π₀ de Physical Intelligence | No disponible | Repositorio OpenPI / GitHub |
| π₀ (original) | No disponible | VLA flow matching | - | No disponible | Pesos abiertos desde febrero de 2025 |

Nota: los datos de parametros y contexto de los modelos comparados no se detallan en la informacion disponible; se incluyen unicamente los que aparecen en las fuentes consultadas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni validacion en robot real, por lo que el rendimiento efectivo es desconocido.
- Especializacion estrecha: fue ajustado sobre 150 episodios y tres tareas muy concretas; es probable que generalice mal fuera de esos escenarios.
- Riesgo de sobreajuste al dominio de datos: solo tres flujos de camara y un tipo de robot (`follow`), con posiciones de camara fijas (`gripper`, `newtop`, `newside`), lo que limita la transferencia a otros montajes.
- Dependencia del hardware: las entradas estan fijadas a un estado de 6 dimensiones y resoluciones de imagen concretas; cambios en la configuracion requieren reentrenamiento.
- Licencia gemma: el uso comercial queda sujeto a los terminos de la licencia Gemma, que impone condiciones y restricciones especificas; es imprescindible revisarla antes de un despliegue en produccion.
- Idiomas y contexto: no se documenta soporte multilingue ni longitud de contexto, por lo que no puede asumirse comportamiento en idiomas distintos del usado en las tareas.
- Modelo publicado por un usuario individual: sin mantenimiento, sin likes ni validacion de la comunidad, y con muy pocas descargas; no se recomienda usar como base de produccion sin validacion propia.
- Riesgo de alucinacion motora: como toda politica VLA, puede generar acciones incorrectas o inseguras ante entradas fuera de distribucion; requiere medidas de seguridad fisica en robot real.
- Fecha de creacion anomala (2026-10-07) en los metadatos del repositorio, lo que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jwhite135/stage1_pi0
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/default
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Articulo de π₀ (arXiv): https://arxiv.org/abs/2410.24164
- PDF del articulo: https://arxiv.org/pdf/2410.24164
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitacion (record data & train a policy): https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio Spirit-AI-Team/PI_Official (π₀ y π₀-FAST): https://github.com/Spirit-AI-Team/PI_Official
