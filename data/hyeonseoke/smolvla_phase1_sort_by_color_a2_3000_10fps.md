# HyeonseokE/smolvla_phase1_sort_by_color_A2_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para robótica de bajo coste y capaz de ejecutarse en hardware de consumo. Este repositorio concreto contiene un fine-tuning de la base `lerobot/smolvla_base` sobre un dataset de clasificación de bloques por color, recogido con un robot SO-101 en un entorno simulado (Isaac Sim 5.1 mediante SCRAPE-IsaacLab). El modelo recibe imágenes de hasta tres cámaras (256×256) y el estado del robot (6 dimensiones), y genera acciones de 6 dimensiones para la tarea "Sort the blocks onto the matching colored dishes".

Con 450 millones de parámetros, SmolVLA reutiliza las capacidades perceptivas de un VLM preentrenado pero trunca sus capas de decodificación de lenguaje, usando solo características intermedias para condicionar un cabezal de acciones compacto. Esto reduce drásticamente el coste computacional frente a otros VLA como OpenVLA (7B), manteniendo un rendimiento competitivo en tareas de manipulación. El modelo se distribuye bajo licencia Apache 2.0 y está integrado en el ecosistema LeRobot, lo que facilita su uso con herramientas estándar de entrenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, basado en SmolVLM truncado) |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrada multimodal: imágenes + estado del robot) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantificable con herramientas de LeRobot) |
| Idiomas soportados | Instrucciones en ingles (segun la tarea definida) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo Vision-Language-Action que combina un codificador visual y de lenguaje preentrenado (SmolVLM) con un cabezal de generacion de acciones. La innovacion clave es truncar las capas de decodificacion de lenguaje del VLM y utilizar las características intermedias (de nivel medio) para condicionar un pequeño modulo de predicción de acciones. Esto permite reutilizar la percepcion del VLM sin el coste de generar texto completo, reduciendo el numero de parametros y el tiempo de inferencia.

El fine-tuning se realizó con LeRobot (version 0.6.0) sobre el dataset `HyeonseokE/phase1_sort_by_color_A2_10fps`, que contiene 100 episodios y 74921 frames a 10 FPS de un robot SO-101 clasificando bloques de colores en platos del mismo color. La configuracion de entrenamiento fue: 58500 pasos, batch size 64, optimizador AdamW, learning rate 0.0001 y semilla 3000. No se ha publicado informacion sobre el uso de RLHF, DPO u otras tecnicas de alineacion; se trata de un fine-tuning supervisado por imitacion.

## Capacidades

- Control de un brazo robotico SO-101 de 6 grados de libertad mediante acciones continuas (6 dimensiones).
- Percepcion visual multi-camara: acepta hasta 3 imagenes de 256×256 píxeles (camaras `top`, `left_wrist` y una tercera no especificada).
- Ejecucion de tareas de manipulacion por aprendizaje por imitacion, especificamente clasificacion de objetos por color.
- Entrada multimodal combinada: imagenes de camaras + estado del robot (posicion articular y/o efector final).
- Generacion de acciones en espacio articular (radianes) o en espacio cartesiano segun la configuracion.
- Integracion nativa con el ecosistema LeRobot: permite rollout, entrenamiento y evaluacion con comandos CLI estandar.

No se han documentado capacidades de generacion de texto, tool calling, agentes ni razonamiento multi-paso, ya que se trata de un modelo de politica robotica, no de un LLM generativo.

## Casos de uso

- Clasificacion automatizada de piezas por color en lineas de montaje: el modelo puede ejecutar la tarea de separar bloques de colores en contenedores o platos correspondientes, con una ventana de observacion de 3 camaras que cubren vistas superior y de muñeca.
- Automatizacion de tareas de picking and placing en entornos controlados: gracias a su tamaño compacto (450M), puede desplegarse en GPUs de consumo para prototipado rapido en laboratorios.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA sobre datasets propios, ya que el codigo y el flujo de entrenamiento estan completamente documentados en LeRobot.
- Educacion en robotica: al ser un modelo pequeño y con licencia permisiva, es adecuado para cursos y talleres donde se necesite un ejemplo funcional de politica de manipulacion sin requisitos de hardware elevados.
- Validacion de politicas en simulacion antes de transferencia al mundo real: el dataset fue generado en Isaac Sim, por lo que el modelo puede evaluarse en el mismo entorno simulado para iterar rapidamente.
- Base para fine-tuning en tareas similares de clasificacion: dado que el checkpoint parte de `smolvla_base`, puede reutilizarse como inicializacion para otras tareas de manipulacion con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. No se proporcionan metricas de exito en tareas reales ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M parametros, en precision fp32 se requieren aproximadamente 1.8 GB de memoria, y en fp16 unos 0.9 GB. Con cuantizacion de 8 bits podria reducirse a ~0.5 GB, aunque no se han publicado configuraciones oficiales de cuantizacion.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32. Modelos como RTX 3060, RTX 4060 o superiores funcionan sin problemas. Tambien es posible ejecutarlo en CPU, aunque con mayor latencia.
- Compatibilidad con hardware de consumo: si, es uno de los objetivos de SmolVLA. Puede ejecutarse en GPUs de gama media e incluso en CPUs modernas para pruebas.
- Opciones de despliegue: LeRobot (PyTorch) con `lerobot-rollout` para inferencia en robot real o simulado. Tambien se puede usar el modulo de inferencia de LeRobot con `--policy.path`. No se ha documentado soporte para vLLM, TGI u Ollama, ya que el modelo no es un LLM generativo.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos en GPU), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este repo) | 450M | Imagenes 256×256 + estado | Clasificacion por color (SO-101) | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | Imagenes + instruccion | Manipulacion general | MIT | Hugging Face |
| RT-2 (Google) | 55B | Imagenes + texto | Manipulacion general | No abierto | No disponible |

SmolVLA es significativamente mas pequeño que OpenVLA (450M vs 7B), lo que permite despliegue en hardware de consumo y fine-tuning rapido. Sin embargo, OpenVLA tiene una capacidad de generalizacion mucho mayor al estar entrenado en un corpus amplio de tareas. RT-2 no esta disponible abiertamente, por lo que SmolVLA es una alternativa practica para quien necesite un VLA ligero y de codigo abierto.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluacion en robot real ni en simulacion; el rendimiento efectivo es desconocido.
- El modelo esta especializado en una unica tarea (clasificar bloques por color) y no generalizara a otras tareas sin un nuevo fine-tuning.
- Depende del robot especifico (SO-101) y de la configuracion de camaras utilizada durante el entrenamiento; cambios en la posicion de camaras o en el robot pueden degradar el rendimiento.
- El dataset fue generado en simulacion (Isaac Sim), por lo que puede existir una brecha de realidad (sim-to-real gap) si se despliega en un robot fisico.
- Riesgo de sobreajuste al dataset de entrenamiento, que contiene solo 100 episodios.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado en un entorno simulado con objetos de colores, su comportamiento fuera de ese rango es impredecible.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que el dataset de entrenamiento tambien tenga una licencia compatible (el dataset enlazado no especifica licencia en la model card).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A2_3000_10fps
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A2_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Repositorio GitHub Running_SmolVLA: https://github.com/hy-0003/Running_SmolVLA
