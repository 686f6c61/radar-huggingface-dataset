# Ameyapores/franka_haply_joint_absolute_pi05_droid_fullft

## Resumen

π₀.₅ (Pi05) es un modelo de Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence y orientado a la generalización en mundo abierto para control robótico. El checkpoint aquí descrito, `Ameyapores/franka_haply_joint_absolute_pi05_droid_fullft`, es un ajuste fino completo (fullft) de dicha política, entrenado y publicado con la librería LeRobot de Hugging Face a partir de la implementación de código abierto OpenPI del propio autor original.

El modelo resuelve el problema de generar comandos de acción a partir de observaciones visuales, instrucciones en lenguaje natural y el estado del robot, en lugar de producir texto. Cuenta con 3.616.757.520 parámetros (≈3,62 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 7,5 GB, coherente con pesos en bf16/fp16.

Por su naturaleza es un artefacto de robótica, no un modelo de lenguaje de uso general: su relevancia radica en servir como base reproducible para investigación en manipulación robótica y para el ajuste posterior sobre tareas concretas. La licencia es Apache 2.0, lo que permite uso comercial, si bien el checkpoint no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo Vision-Language-Action (VLA); detalle del backbone no disponible |
| Parametros totales | 3.616.757.520 (≈3,62 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la model card, π₀.₅ es un modelo de Visión-Lenguaje-Acción con generalización en mundo abierto, evolución de π₀, y la implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. El modelo consume observaciones (imágenes), instrucciones de lenguaje y estado proprioceptivo, y emite acciones de control. No se detallan en la información disponible ni el backbone concreto, ni el mecanismo de generación de acciones, ni la composición exacta del dataset de entrenamiento.

Este checkpoint concreto corresponde a un ajuste fino completo sobre el dataset `Ameyapores/franka_haply_joint_absolute`. El sufijo `droid_fullft` sugiere entrenamiento sobre datos tipo DROID y ajuste fino total de los pesos, pero la información proporcionada no confirma el número de tokens, la composición del dataset, ni si se emplearon fases de RLHF/DPO. El repositorio tiene 7,5 GB, consistente con pesos en bf16/fp16 sin cuantizar.

## Capacidades

- Generación de acciones de control robótico condicionadas por visión y lenguaje (política VLA).
- Control de articulaciones en espacio absoluto (por el nombre `joint_absolute` del dataset asociado).
- Integración con teleoperación/dispositivos hápticos, dado el componente `haply` del dataset.
- Condicionamiento por instrucciones en lenguaje natural (componente "Language" del paradigma VLA).
- Ejecución de políticas multi-paso en lazos de control (predicción de secuencias de acción).
- Entrenamiento y evaluación dentro del ecosistema LeRobot (comandos `lerobot-train` / `lerobot-record`).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Manipulación robótica con brazo Franka: el modelo genera comandos de articulación absolutos a partir de observaciones visuales, adecuado para tareas de pick-and-place y ensamblaje en laboratorio.
- Teleoperación con háptica: integrado con dispositivos Haply, permite reproducir o asistir movimientos registrados, útil en investigación de interfaces hápticas.
- Imitación conductual (imitation learning): sirve como política base sobre la que ajustar nuevas tareas con el dataset propio, reutilizando el pipeline de LeRobot.
- Evaluación de políticas VLA: referencia reproducible para comparar el efecto del ajuste fino sobre π₀.₅ en un mismo conjunto de datos.
- Investigación en generalización de mundo abierto: permite medir el comportamiento del modelo en entornos o configuraciones no vistas durante el entrenamiento.
- Recolección y aumento de datos robóticos: empleado junto a `lerobot-record` para generar episodios de evaluación etiquetados y ampliar datasets de entrenamiento.
- Prototipado de control en laboratorio: al ser un modelo de ~3,6 mil millones de parámetros, es viable desplegarlo en una GPU de gama alta para experimentación académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 3.616.757.520 parametros): en bf16/fp16, unos 7,2-8 GB solo de pesos, mas activaciones; en torno a 10-12 GB en la practica.
- GPU recomendadas: A100, H100 o GPUs de 24 GB o mas (RTX 4090, L40S) para inferencia holgada.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB) y similares; en tarjetas de 12-16 GB con margen ajustado.
- Opciones de despliegue: LeRobot (Python/PyTorch) para entrenamiento e inferencia sobre robot. No aplica vLLM, llama.cpp, Ollama ni TGI en el sentido habitual, al tratarse de una politica robotica y no de un modelo generativo de texto.
- Cuantizaciones oficiales: no disponibles; no se publican versiones GGUF ni AWQ/GPTQ.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los siguientes datos proceden de fuentes publicas externas a la informacion proporcionada y se ofrecen solo como contexto orientativo.

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| π₀.₅ (original, Physical Intelligence) | no disponible | VLA | no disponible | Parcial via OpenPI |
| π₀ | ≈3,3 mil millones (referencia publica) | VLA | no disponible | OpenPI |
| OpenVLA | ≈7 mil millones (referencia publica) | VLA | no disponible | Publico |
| Este checkpoint (franka_haply_joint_absolute_pi05_droid_fullft) | 3,62 mil millones | VLA ajustado | apache-2.0 | Hugging Face (LeRobot) |

La comparacion cuantitativa de rendimiento no puede establecerse porque no hay benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo de robotica, no un modelo de lenguaje: no responde a preguntas ni genera texto util para tareas conversacionales.
- Generalizacion acotada al ajuste: al ser un fullft sobre `franka_haply_joint_absolute`, su comportamiento fuera de ese dominio y de la morfologia Franka/Haply no esta garantizado.
- Riesgo de errores de accion: el equivalente a la alucinacion aqui es la generacion de comandos incorrectos, con riesgo fisico real; requiere validacion y paradas de seguridad en produccion.
- Idiomas soportados: no disponible, lo que impide confirmar si acepta instrucciones en castellano u otros idiomas.
- Longitud de contexto y horizonte de accion: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad sobre el comportamiento fisico del sistema.
- Sin validacion comunitaria: 0 descargas y 0 likes; no hay evidencia externa de calidad o reproducibilidad.
- Inconsistencia en la model card: el ejemplo incluido usa `--policy.type=act`, correspondiente a la politica ACT y no a π₀.₅; conviene verificar el identificador de politica correcto en LeRobot antes de entrenar.
- Entorno de publicacion no estandar: el experimento `lerobot-train` no incluye el `--policy.type` especifico de π₀.₅, lo que puede inducir a error en la reproduccion.

## Enlaces

- Hugging Face: https://huggingface.co/Ameyapores/franka_haply_joint_absolute_pi05_droid_fullft
- Dataset asociado: https://huggingface.co/datasets/Ameyapores/franka_haply_joint_absolute
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no se proporciona URL directa en la informacion disponible
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
