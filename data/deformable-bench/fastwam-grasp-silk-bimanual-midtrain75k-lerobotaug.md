# deformable-bench/fastwam-grasp-silk-bimanual-midtrain75k-lerobotaug

## Resumen

FastWAM es un modelo de mundo-acción (world action model) para robótica, desarrollado por el equipo deformable-bench. Este checkpoint concreto es un ajuste fino (fine-tuning) del checkpoint intermedio de FastWAM en el paso 75,000, especializado en la tarea `grasp-silk-bimanual`: el agarre y levantamiento bimanual de un cuadrado de seda con un robot Piper de doble brazo en un entorno simulado con física de tela GPU y renderizado fotorrealista. El modelo combina predicción de acciones y generación de video, y está entrenado con una pipeline de aumentación de imágenes alineada con LeRobot.

La relevancia de este modelo radica en que aborda la manipulación de objetos deformables, un desafío abierto en robótica, y sirve como punto de referencia para evaluar arquitecturas de mundo-acción en tareas bimanuales. Está pensado exclusivamente para investigación y evaluación dentro del ecosistema FastWAM, no para despliegue en producción. El repositorio ocupa 12 GB e incluye los pesos del checkpoint final, la configuración de entrenamiento, las estadísticas de normalización y el log completo del entrenador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM (world action model, detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (observacion de 33 frames, no tokens) |
| Tipos de cuantizacion | no disponible (entrenado en bf16, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

FastWAM es un modelo de mundo-accion que predice simultáneamente acciones de control y frames de video futuros. Este checkpoint parte del checkpoint intermedio de FastWAM en el paso 75,000 (denominado "HWM FastWAM mid-training checkpoint") y se ajusta finamente sobre el dataset `deformable-bench/grasp-silk-bimanual`. El dataset contiene observaciones de tres camaras (estatica, mano izquierda y mano derecha) con 33 frames de observacion por episodio y una dimension de accion/estado de 14.

El preprocesado de imagenes redimensiona a 240x320 y aplica tres aumentos aleatorios muestreados de un conjunto que incluye brillo, contraste, saturacion, matiz, nitidez y transformaciones afines, en orden aleatorio. Las acciones y estados se normalizan con min/max. El entrenamiento uso el optimizador Adam con learning rate 2e-5 y decaimiento coseno, en precision bf16, durante 1,430 pasos de optimizador (5 epocas configuradas, detenido en el paso maximo). La perdida total se compone de una perdida de accion y una perdida de video; la perdida de accion convergio fuertemente (de 0.32551 en los pasos 10-100 a 0.00210 en el paso final), mientras que la perdida de video se estabilizo alrededor de 0.09 sin rebotes tardios.

## Capacidades

- Generacion de video: el modelo predice frames futuros, como indica la perdida de video en el entrenamiento.
- Prediccion de acciones: genera comandos de control para el robot, con una perdida de accion que converge a valores muy bajos.
- Aprendizaje por imitacion: entrenado mediante demostraciones para imitar el comportamiento de agarre bimanual.
- Manipulacion bimanual de objetos deformables: especializado en la tarea de agarrar y sostener un cuadrado de seda con dos brazos.
- Observacion multi-camara: procesa simultaneamente tres vistas (estatica, mano izquierda, mano derecha).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje.

## Casos de uso

- Investigacion en manipulacion de materiales deformables: el modelo sirve como punto de partida para estudiar politicas de agarre de telas, donde el exito requiere un agarre sostenido con ambos brazos.
- Evaluacion de arquitecturas de mundo-accion: permite comparar el rendimiento de FastWAM frente a otros modelos en una tarea estandarizada de robotica.
- Desarrollo de politicas de control bimanual: el esquema de observacion/accion de 14 dimensiones puede adaptarse a otros robots de doble brazo en entornos simulados.
- Generacion de video condicionada a acciones: la rama de video del modelo puede utilizarse para sintetizar trayectorias visuales de manipulacion, util en simulacion y planificacion.
- Benchmarking de aumentacion de datos: la pipeline de aumentacion LeRobot-aligned puede evaluarse en terminos de robustez y generalizacion frente a otras tecnicas.
- Entrenamiento de modelos descendentes: los pesos del checkpoint pueden servir como inicializacion para tareas relacionadas de manipulacion deformable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento es la evolucion de la perdida durante el entrenamiento, que se resume a continuacion:

| Ventana de pasos | Perdida total | Perdida de accion | Perdida de video |
| --- | ---: | ---: | ---: |
| Pasos 10-100 | 0.52408 | 0.32551 | 0.19857 |
| Pasos 110-300 | 0.14679 | 0.02486 | 0.12194 |
| Pasos 610-800 | 0.10566 | 0.00600 | 0.09964 |
| Pasos 1240-1430 | 0.09265 | 0.00227 | 0.09040 |
| Paso final 1430 | 0.09280 | 0.00210 | 0.09070 |

Estos valores indican una convergencia fuerte de la perdida de accion y una estabilizacion de la perdida de video, pero no constituyen una evaluacion comparativa con otros modelos.

## Requisitos de hardware

- No se dispone de informacion publica sobre VRAM necesaria para inferencia.
- El tamano del repositorio es de 12 GB, lo que sugiere que los pesos en bf16 requieren al menos 12 GB de VRAM para cargar el modelo completo, pero este dato no es confirmado.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado que es un checkpoint de investigacion en robotica, el despliegue tipico seria mediante el codigo oficial de FastWAM en GitHub, que soporta LIBERO y RoboTwin.
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables publicados con los mismos parametros de tarea (agarre bimanual de seda) y arquitectura (world action model) en la informacion disponible. El ecosistema FastWAM es reciente y este checkpoint es especifico de una tarea muy concreta.

## Limitaciones y advertencias

- No ha sido validado para despliegue en entornos criticos o fuera de distribucion, segun la model card.
- Es un checkpoint de investigacion, no un modelo de produccion; los pesos no incluyen estado de optimizador ni estado distribuido del entrenador.
- Entrenado exclusivamente en la tarea `grasp-silk-bimanual`; su capacidad de generalizacion a otras tareas o entornos no esta demostrada.
- La licencia no esta disponible, lo que impide conocer las restricciones de uso comercial o modificacion.
- No hay informacion sobre sesgos o riesgos de alucinacion, pero al ser un modelo de robotica sin interfaz de lenguaje, estos conceptos no aplican directamente.
- El entrenamiento se detuvo al alcanzar el maximo de pasos configurado (1,430), no por criterio de convergencia; aunque las perdidas muestran estabilidad, podria requerir mas entrenamiento para mejorar la calidad del video.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deformable-bench/fastwam-grasp-silk-bimanual-midtrain75k-lerobotaug
- Organizacion deformable-bench: https://huggingface.co/deformable-bench
- Dataset grasp_silk_bimanual (descripcion en Claru): https://claru.ai/datasets/deformable-bench-grasp-silk-bimanual
- Repositorio oficial de FastWAM: https://github.com/yuantianyuan01/FastWAM
- Paper de FastWAM (referenciado en el repositorio): "Fast-WAM: Do World Action Models Need Test-time Future Imagination?" (enlace directo no disponible)
