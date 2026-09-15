# JennyWWW/diffusion_approach_lever_13_smooth_delta_basewristng_r84

# Diffusion policy para manipulacion robotica: approach lever 13 smooth delta basewristng r84

## Resumen

Se trata de una politica visuomotora entrenada con el metodo Diffusion Policy y publicada en el Hub mediante la libreria LeRobot de Hugging Face. El modelo aprende a generar trayectorias de accion multimodo y suaves para una tarea de aproximacion a una palanca (lever), tratando el control como un proceso generativo de difusion condicionado por observaciones visuales y de estado. El autor es el usuario JennyWWW y el repositorio tiene licencia Apache 2.0.

El checkpoint tiene 40.653.291 parametros (aproximadamente 40,7 millones) y consume dos imagenes RGB de 84x84 (camara base y camara de muneca) mas un vector de estado de 7 dimensiones, produciendo una accion de 7 dimensiones. Es, por tanto, un modelo pequeno orientado a control en tiempo real, no un modelo de lenguaje: no procesa ni genera texto.

Su relevancia es practica: es un ejemplo reproducible de entrenamiento de imitacion con difusion en un simulador de robots basado en splats, con 536 episodios y 148.919 fotogramas a 30 FPS. Al estar integrado en LeRobot, se puede ejecutar con el comando `lerobot-rollout` y reentrenar con `lerobot-train`, lo que lo convierte en una referencia util para quien quiera comparar politicas de difusion frente a alternativas deterministas como ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion para control visuomotor); detalles internos de la red no especificados en la model card |
| Parametros totales | 40.653.291 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el modelo opera con horizonte de observacion y horizonte de accion, no con contexto textual |
| Tipos de cuantizacion | no documentados; pesos distribuidos en safetensors (precision no declarada, presumiblemente fp32) |
| Idiomas soportados | no aplica; modelo de control visuomotor sin entrada ni salida de lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`, pipeline `robotics`) |
| Tipo de robot | `lerobot_splatsim` |
| Entradas | `observation.images.base_rgb` (3, 84, 84), `observation.images.wrist_rgb` (3, 84, 84), `observation.state` (7,) |
| Salidas | `action` (7,) |
| Camaras declaradas | `base_rgb_letterbox`, `base_rgb_stretch`, `wrist_rgb_letterbox`, `wrist_rgb_stretch` |
| Tamano del repositorio | 0.2 GB |
| Version de LeRobot | 0.4.3 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa el metodo Diffusion Policy descrito en el articulo arXiv:2303.04137. La idea central es modelar la generacion de acciones como un proceso de difusion condicionado: en lugar de predecir una unica accion de forma determinista, la politica aprende a invertir un proceso de ruido para producir secuencias de acciones coherentes, lo que permite representar distribuciones multimodales (varias formas validas de acercarse a la palanca) y generar trayectorias mas suaves y estables en tareas con contacto. La model card no detalla la red concreta empleada (habitualmente un U-Net temporal 1D con codificadores visuales por camara en la implementacion de LeRobot), ni el numero de pasos de denoising en inferencia.

El entrenamiento se realizo por imitacion sobre el dataset `JennyWWW/splatsim_approach_lever_13_smooth_r84`, con 536 episodios, 148.919 fotogramas a 30 FPS y campo de tarea vacio (`""`). La configuracion declarada es de 75.000 pasos, batch de 32, optimizador Adam, tasa de aprendizaje 1e-5 y semilla 0. No se menciona uso de RLHF, DPO ni refinamiento posterior: es aprendizaje por imitacion puro a partir de demostraciones. Tampoco se documentan tecnicas adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de trayectorias de accion de 7 grados de libertad a partir de observaciones visuales y de estado, apta para control continuo en bucle cerrado.
- Manipulacion con contacto: el enfoque de difusion esta disenado para tareas ricas en contacto, como aproximar y accionar una palanca.
- Fusion de dos vistas: procesa simultaneamente una camara en la base del robot y una camara en la muneca.
- Generacion de acciones multimodales: al muestrear del proceso de difusion puede representar multiples estrategias validas de aproximacion.
- Suavizado de trayectorias: la model card destaca explicitamente la produccion de trayectorias multi-paso suaves.
- Integracion con el ecosistema LeRobot: ejecucion con `lerobot-rollout`, reentrenamiento con `lerobot-train` y publicacion en el Hub.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades de agente, vision general de imagenes, audio ni capacidades multilingues: estas funciones no aplican a una politica visuomotora.

## Casos de uso

- Control de un brazo robotico en simulacion: el checkpoint se puede cargar con `lerobot-rollout` sobre el robot `lerobot_splatsim` para reproducir la tarea de aproximacion a la palanca, usando exactamente las claves de observacion con las que fue entrenado.
- Aproximacion y accionamiento de palancas en entornos simulados: la naturaleza generativa del modelo resulta adecuada para tareas con contacto fisico, donde las politicas deterministas tienden a producir movimientos bruscos o a quedarse atascadas.
- Generacion de datos sinteticos de imitacion: las trayectorias muestreadas por la politica pueden servir como demostraciones adicionales para aumentar un dataset de entrenamiento existente.
- Linea base para comparativas de metodos: al estar integrado en LeRobot, permite medir de forma controlada el rendimiento de difusion frente a politicas como ACT sobre el mismo dataset y el mismo robot.
- Reentrenamiento con datos propios: partiendo del flujo `lerobot-train --policy.type=diffusion`, un equipo puede sustituir el dataset por sus propias demostraciones y obtener una politica equivalente para otra tarea.
- Pruebas de robustez frente a variaciones de camara: al contemplar cuatro configuraciones de camara (letterbox y stretch, base y muneca), sirve para estudiar la sensibilidad de la politica al preprocesado de imagen.
- Investigacion en control con pocos recursos: con 40,7 millones de parametros, es viable para experimentacion en laboratorios con GPU de gama media o incluso inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion vacia con la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito, numero de ensayos ni comparaciones cuantitativas con otros metodos sobre esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para los pesos en fp32 (40,65 M de parametros x 4 bytes ≈ 163 MB) y del orden de 1 a 2 GB contando activaciones, codificadores visuales y los buffers de las dos imagenes de 84x84. Estimacion orientativa, no publicada por el autor.
- VRAM estimada para entrenamiento: entorno a 4-8 GB con batch 32, dos camaras de 84x84 y optimizador Adam (que anade dos estados por parametro). Estimacion orientativa.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente (RTX 3060, RTX 4070, RTX 4090). Para entrenamiento a gran escala o barridos de hiperparametros, A100 o H100 resultan sobredimensionadas para este tamano de modelo pero utiles para paralelizar experimentos.
- Cabe en GPU de consumo: si, con margen amplio; tambien es viable la inferencia en CPU dado el reducido numero de parametros.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch, que es la via documentada. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje. Una exportacion a ONNX o TorchScript seria factible, pero no esta documentada.
- Latencia y throughput: no disponibles. Como referencia de diseno, el bucle de control se grabo a 30 FPS, lo que implica un presupuesto de 33 ms por paso; el coste real dependera del numero de pasos de denoising configurados, que no se especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| JennyWWW/diffusion_approach_lever_13_smooth_delta_basewristng_r84 | Diffusion Policy (LeRobot) | 40.653.291 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Entrenado sobre splatsim, 536 episodios |
| ACT (Action Chunking Transformer) en LeRobot | Transformer con chunking de acciones, determinista | no disponible | no disponible | segun checkpoint | Implementado en LeRobot | Alternativa determinista habitual; no representa multimodalidad de acciones |
| Otros checkpoints de difusion del mismo autor en LeRobot | Diffusion Policy | no disponible | no disponible | Apache 2.0 (segun repos) | Hugging Face | Variantes de la misma tarea con distinta configuracion de camaras y dataset |
| SmolVLA (Hugging Face) | Vision-language-action | no disponible en la informacion proporcionada | condicionado por instrucciones en lenguaje | no disponible en la informacion proporcionada | Hugging Face | Anade condicionamiento por lenguaje; no comparable en tamano ni en requisitos |

No se dispone de datos numericos de rendimiento para ninguno de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion es exclusivamente cualitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no reporta tasa de exito ni numero de ensayos, por lo que no hay evidencia publicada de que la politica funcione de forma fiable.
- Sesgo de simulacion: el entrenamiento proviene de un unico dataset de un simulador (`lerobot_splatsim`), sin datos de robot real, lo que limita la transferencia al mundo fisico.
- Sobreajuste a la tarea: el campo de tarea del dataset esta vacio y el nombre del repositorio indica una tarea concreta (aproximacion a una palanca). La politica no es generalista.
- Dependencia estricta de las observaciones: las claves y formas de entrada (`base_rgb`, `wrist_rgb` a 84x84 y estado de 7 dimensiones) deben coincidir exactamente; cualquier cambio de camara, calibracion o resolucion invalida el modelo.
- Riesgo de alucinacion en sentido amplio: al ser un modelo generativo, puede muestrear trayectorias plausibles pero fisicamente invalidas, especialmente fuera de la distribucion de estados vista en entrenamiento.
- Idioma: no aplica, pero implica que no se puede dirigir la politica mediante instrucciones en lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y se cite la autoria; conviene revisar tambien las condiciones del dataset asociado.
- Reputacion limitada del artefacto: cero descargas y cero likes en el momento de la consulta, sin historial de uso comunitario que sirva de validacion.
- Fecha de creacion registrada como 2026-09-15, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JennyWWW/diffusion_approach_lever_13_smooth_delta_basewristng_r84
- Dataset de entrenamiento: https://huggingface.co/datasets/JennyWWW/splatsim_approach_lever_13_smooth_r84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JennyWWW/splatsim_approach_lever_13_smooth_r84
- Articulo de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Citacion de LeRobot (Cadene et al., 2024): https://github.com/huggingface/lerobot

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a paginas de soporte de Google Drive, foros sobre CorelDraw y consultas sobre el directorio AppData de Windows, sin relacion con el modelo.
