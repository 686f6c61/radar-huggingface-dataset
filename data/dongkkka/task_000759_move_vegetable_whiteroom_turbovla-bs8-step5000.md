# Dongkkka/Task_000759_Move_Vegetable_Whiteroom_TurboVLA-bs8-step5000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo TurboVLA, una politica de vision-lenguaje-accion (VLA) orientada a control robotico en tiempo real. Lo publica el usuario Dongkkka y corresponde a la tarea Task_000759_Move_Vegetable_Whiteroom sobre el robot ROBOTIS SG2, con un espacio de estado y accion de 22 dimensiones y un horizonte de accion de 50 pasos. El artefacto es un resultado de entrenamiento por imitacion, no un modelo de proposito general.

TurboVLA se diferencia de las arquitecturas VLA convencionales en que no utiliza un modelo de lenguaje grande como interfaz central entre percepcion y accion: codifica por separado las observaciones visuales y las instrucciones de lenguaje, las conecta mediante interaccion bidireccional ligera y predice bloques de acciones continuas con un decodificador compacto. Fuentes de terceros cifran el modelo base en aproximadamente 0,2 B de parametros y una frecuencia de ejecucion de 32 Hz sobre una RTX 4090.

El checkpoint se guarda en el paso de optimizacion 5.000 con tamano de lote 8, e incluye tanto los pesos EMA recomendados para inferencia como los pesos crudos de entrenamiento. Es relevante para quien trabaje en politicas roboticas eficientes, en el formato LeRobot v3.0 o en el simulador RoboTwin, pero conviene subrayar que el propio autor indica que el artefacto no ha sido validado en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action TurboVLA: codificadores independientes de vision y lenguaje, interaccion bidireccional vision-lenguaje ligera y decodificador compacto de acciones continuas; no usa un LLM como interfaz central |
| Parametros totales | no disponible para este checkpoint; fuentes de terceros cifran el modelo base TurboVLA en aproximadamente 0,2 B de parametros |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible; horizonte de accion de 50 pasos |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en punto flotante PyTorch |
| Idiomas soportados | no disponible; el encoder de texto empaquetado es bert-base-uncased, entrenado principalmente en ingles |
| Licencia | no disponible en la ficha de HuggingFace; el proyecto TurboVLA se publica bajo Apache-2.0 |
| Formato de pesos | PyTorch (.pt): steps_5000_ema_pytorch_model.pt (inferencia) y steps_5000_pytorch_model.pt (entrenamiento) |
| Entradas | Tres camaras RGB (cabeza izquierda, muneca izquierda, muneca derecha) mas estado de 22 dimensiones |
| Salidas | Accion absoluta de 22 dimensiones (articulaciones y base) |
| Horizonte de accion | 50 |
| Checkpoint | Paso de optimizacion 5.000, tamano de lote 8 |
| Encoders auxiliares | bert-base-uncased (texto), dinov3-vitl (vision), inicializacion GroundingDINO opcional |
| Formato de dataset de entrenamiento | LeRobot v3.0 (Task_000759_Move_Vegetable_Whiteroom_Leardboard_MCAP_lerobot_v30) |
| Robot objetivo | ROBOTIS SG2 |
| Tamano del repositorio | 3,5 GB |
| Revision de runtime | a3365e8f1787d30bafd99d2806edbf4dc82b5370 |

## Arquitectura y entrenamiento

TurboVLA prescinde del esquema habitual en el que un modelo de lenguaje actua como nucleo que serializa percepcion y accion. En su lugar, la observacion visual y la instruccion en lenguaje se codifican por vias separadas; ambas representaciones intercambian informacion mediante un modulo de interaccion bidireccional de baja complejidad, y un decodificador compacto produce un bloque de acciones continuas. Este diseno reduce el coste computacional por paso de inferencia y permite frecuencias de control altas. En este checkpoint concreto, el modelo consume tres flujos RGB (camara de cabeza izquierda y camaras de muneca izquierda y derecha) junto con un vector de estado de 22 dimensiones, y emite acciones absolutas de 22 dimensiones con horizonte de 50 pasos.

El entrenamiento documentado es un ajuste fino sobre el conjunto de datos LeRobot v3.0 de la tarea Task_000759_Move_Vegetable_Whiteroom, en su variante Leardboard MCAP, durante 5.000 pasos de optimizacion con tamano de lote 8. Se conservan dos instantaneas: los pesos EMA (recomendados para inferencia por el autor) y los pesos crudos del entrenamiento. El repositorio incluye las estadisticas de normalizacion de estado y accion (dataset_statistics.json) y la configuracion resuelta del entrenamiento (config.full.yaml). No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otro ajuste por preferencias, que por otra parte no son habituales en politicas de imitacion de este tipo.

## Capacidades

- Generacion de acciones motoras continuas: produce bloques de 50 pasos de accion absoluta de 22 dimensiones para el robot SG2 a partir de observaciones visuales y estado propioceptivo.
- Percepcion visual multi-camara: integra simultaneamente vistas de cabeza y de ambas munecas, lo que aporta perspectiva egocentrica y de manipulacion.
- Condicionamiento por instruccion en lenguaje: acepta consignas textuales procesadas por un encoder BERT, orientadas a tareas de manipulacion.
- Ejecucion de politicas por imitacion: reproduce comportamientos aprendidos de demostraciones para la tarea concreta de mover vegetales en un entorno de habitacion blanca.
- Inferencia en tiempo real como servicio: el runtime permite levantar un servidor de politica (server_policy.py, run_policy_server.sh) para desacoplar el modelo del controlador del robot.
- Multi-step reasoning: no aplica; se trata de una politica reactiva que predice horizontes de accion, no de un modelo con cadena de razonamiento.
- Tool calling / function calling: no disponible.
- Capacidades de agente: no disponibles en el sentido de planificacion simbólica; la unica "agencia" es la ejecucion de la politica motora.
- Capacidades multilingues: no disponibles; el encoder de texto empaquetado esta entrenado principalmente en ingles.
- Modo de pensamiento explicito (thinking mode), vision de proposito general, audio: no disponibles.
- Acepta carga parcial: el runtime admite omitir la inicializacion de GroundingDINO y las rutas de BERT y DINOv3 mediante opciones de configuracion.

## Casos de uso

- Manipulacion de vegetales en entorno controlado: el modelo esta ajustado especificamente para mover vegetales en una habitacion blanca; se emplearia como controlador de la politica sobre el SG2 en tareas de recogida y recolocacion, con las tres camaras y el estado de 22 dimensiones como unica entrada.
- Evaluacion de politicas en simulacion RoboTwin: el script run_policy_server.sh bajo scripts/robotwin sugiere un flujo de evaluacion en este simulador; el checkpoint serviria para medir tasas de exito de la tarea sin riesgo sobre hardware real.
- Servidor de politica remoto: el modelo puede desplegarse como servicio en una maquina con GPU mientras el robot ejecuta el bucle de control en otro equipo, tal como describe el propio autor al indicar que se puede lanzar en otra maquina con el runtime TurboVLA/StarVLA.
- Punto de partida para fine-tuning: al conservar config.yaml, config.full.yaml y las estadisticas de normalizacion, el artefacto sirve como inicializacion para nuevas tareas del SG2 o de robots con el mismo layout de 22 dimensiones.
- Investigacion en politicas VLA eficientes: con un modelo base de aproximadamente 0,2 B de parametros y 32 Hz reportados en una RTX 4090, es un candidato para estudiar compromisos entre latencia y capacidad en control reactivo.
- Reproduccion de resultados de imitacion: los dos checkpoints (EMA y crudo) con hashes SHA-256 permiten comparar el efecto del promediado exponencial de pesos sobre el rendimiento de la politica.
- Recoleccion y anotacion de datos asistida: la politica puede desplegarse para generar rollouts que despues se revisen y filtren como datos adicionales de entrenamiento para la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del checkpoint no incluye tasas de exito, metricas de error de accion ni evaluaciones comparativas sobre RoboTwin u otro entorno. La unica cifra de rendimiento disponible proviene de material de terceros sobre el modelo base TurboVLA, que reporta ejecucion a 32 Hz sobre una RTX 4090; no se ha confirmado esa cifra para este checkpoint especifico ni acompanada de ninguna metrica de exito de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra publicada. Como referencia de orden de magnitud, un modelo de aproximadamente 0,2 B de parametros ocupa del orden de 0,8 GB en FP32 y 0,4 GB en FP16/FP8 solo en pesos; a ello hay que sumar los encoders de vision (DINOv3 ViT-L) y de texto (bert-base-uncased), tres flujos RGB y el estado de 22 dimensiones.
- GPU recomendadas: no especificadas por el autor. La cobertura de terceros del modelo base menciona una RTX 4090 como plataforma de ejecucion a 32 Hz.
- Compatibilidad con GPU de consumo: probable en GPUs de gama alta con suficiente VRAM para los encoders auxiliares, pero no confirmado por el autor para este checkpoint.
- Opciones de despliegue: runtime oficial TurboVLA/StarVLA con server_policy.py y el script scripts/robotwin/run_policy_server.sh. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput estimados: no disponibles para este checkpoint. Fuentes de terceros atribuyen 32 Hz al modelo base en una RTX 4090.
- Requisitos de integridad y rutas: config.yaml y dataset_statistics.json deben permanecer en el mismo directorio que el checkpoint, ya que el cargador de StarVLA los descubre desde el directorio padre. La configuracion empaquetada conserva rutas absolutas de un contenedor interno ("container2"), por lo que es necesario sobrescribir las rutas de BERT y DINOv3 al desplegar en otra maquina.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dongkkka/Task_000759_Move_Vegetable_Whiteroom_TurboVLA-bs8-step5000 (este) | VLA TurboVLA, tarea 000759, SG2 | no disponible (base ~0,2 B segun terceros) | no disponible; horizonte de accion 50 | no disponible | HuggingFace, 0 descargas, 0 likes |
| Dongkkka/Task_000759_Move_Vegetable_Whiteroom_FLOWER-bs4-step10000 | VLA FLOWER, misma tarea 000759, SG2, layout 22D | no disponible | no disponible | no disponible | HuggingFace |
| Dongkkka/Task_000759_FLOWER_B200_bs8_step15000 | VLA FLOWER, misma tarea 000759, lote 8, 15.000 pasos | no disponible | no disponible | no disponible | HuggingFace |
| TurboVLA (modelo base) | VLA de tiempo real, 32 Hz en RTX 4090 | ~0,2 B segun fuentes de terceros | no disponible | Apache-2.0 | GitHub y paper publicos |

La comparacion directa con alternativas de otros autores no esta disponible con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- No validado en robot real: el propio autor declara que el artefacto es el checkpoint de entrenamiento guardado y que no ha sido reclamado como validado en robot real.
- Licencia indeterminada: la ficha de HuggingFace no indica licencia, mientras que el proyecto TurboVLA se distribuye como Apache-2.0. Antes de un uso comercial hay que aclarar que terminos se aplican al checkpoint derivado.
- Ausencia total de benchmarks: no hay tasas de exito ni metricas de error, lo que impide estimar la calidad de la politica frente a alternativas.
- Especializacion extrema: el modelo esta ajustado para una unica tarea (mover vegetales en una habitacion blanca) sobre un unico robot (SG2) con un layout de 22 dimensiones. Fuera de ese dominio no cabe esperar comportamiento util.
- Riesgo de sobreajuste a la escena: al entrenarse sobre un dataset concreto de habitacion blanca y disposicion de objetos fija, es probable que la politica degrade ante cambios de iluminacion, posicion de camara o variedad de objetos.
- Dependencia del formato de observacion: requiere exactamente tres camaras RGB en las posiciones esperadas y un vector de estado de 22 dimensiones; no admite entradas parciales o de otra configuracion sin reentrenamiento.
- Dependencia de ficheros auxiliares: sin config.yaml y dataset_statistics.json en el directorio padre, el cargador de StarVLA no puede inicializar el modelo correctamente.
- Rutas absolutas en la configuracion: la configuracion empaquetada apunta a rutas de un contenedor interno, lo que obliga a sobrescribir parametros de BERT y DINOv3 en cualquier otro entorno.
- Idioma: el encoder de texto es bert-base-uncased, entrenado principalmente en ingles; no hay informacion sobre el comportamiento con instrucciones en castellano.
- Riesgo de alucinacion en el sentido generativo: no aplica directamente, pero si existe riesgo de acciones erroneas o inseguras en ejecucion sobre hardware fisico, dado que los pesos crudos y EMA no vienen acompanados de ninguna evaluacion de seguridad.
- Estado del repositorio: cero descargas y cero likes, con fecha de creacion y actualizacion en 2026, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000759_Move_Vegetable_Whiteroom_TurboVLA-bs8-step5000
- Repositorio GitHub de TurboVLA: https://github.com/H-EmbodVis/TurboVLA
- Paper de TurboVLA: https://arxiv.org/html/2607.27205
- Ficha resumida de TurboVLA en AI/TLDR: https://ai-tldr.dev/tools/turbovla/
- Checkpoint FLOWER de la misma tarea: https://huggingface.co/Dongkkka/Task_000759_Move_Vegetable_Whiteroom_FLOWER-bs4-step10000
- Checkpoint FLOWER B200 de la misma tarea: https://huggingface.co/Dongkkka/Task_000759_FLOWER_B200_bs8_step15000
