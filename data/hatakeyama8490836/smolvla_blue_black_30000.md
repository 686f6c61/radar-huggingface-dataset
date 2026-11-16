# hatakeyama8490836/smolvla_blue_black_30000

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots reales mediante aprendizaje por imitacion a partir de observaciones visuales y de estado. Este repositorio concreto, `hatakeyama8490836/smolvla_blue_black_30000`, es un fine-tuning de dicho modelo publicado por un usuario independiente para una tarea especifica de manipulacion robotica: introducir un conector azul y negro en una zona cuadrada negra.

El modelo consume tres flujos de camara (lateral, de muneca y superior) junto con el estado articular del robot y produce un vector de accion de 6 dimensiones, lo que lo hace directamente desplegable sobre un robot `so_follower` (SO-100/SO-101 de LeRobot). Con 450 millones de parametros y un repositorio de 1,2 GB, esta pensado para ejecutarse en hardware de consumo, no en clusters de GPU.

Su relevancia radica en que demuestra el flujo completo de LeRobot: grabar un dataset propio (60 episodios, 34 669 frames a 30 FPS), entrenar una politica VLA compacta durante 30 000 pasos y desplegarla con un solo comando CLI. Es una referencia practica para quien quiera replicar el pipeline de SmolVLA en su propio robot, mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, implementada en LeRobot como politica `smolvla` |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `[More Information Needed]`) |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una politica VLA que combina un codificador visual (tres camaras) con un modelo de lenguaje pequeno y un cabezal de acciones, siguiendo el diseno descrito en el paper arXiv:2506.01844. La model card no detalla la composicion interna exacta (numero de capas, dimension oculta, tipo de atencion ni estrategia de fusion vision-lenguaje-accion), por lo que esos datos deben consultarse en el paper original. La entrada es multimodal: estado articular de 6 dimensiones mas tres imagenes de resoluciones 360x640 (lateral y superior) y 720x1280 (muneca); la salida es un vector de accion de 6 dimensiones.

El entrenamiento se realizo por imitacion supervisada sobre el dataset `hatakeyama8490836/blue-and-black_merged`, compuesto por 60 episodios y 34 669 frames a 30 FPS para una unica tarea. La configuracion reportada es: 30 000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje por imitacion puro sobre demostraciones humanas.

## Capacidades

- Control robotico end-to-end: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Fusion multimodal de tres camaras simultaneas (lateral, muneca, superior) con el estado articular.
- Ejecucion de una tarea especifica de manipulacion: "Move the blue-and-black connector into the black square area".
- Despliegue en hardware de consumo gracias a su tamano reducido (450M parametros).
- Integracion nativa con LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje de proposito general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no hay interfaz de lenguaje natural documentada mas alla de la instruccion de tarea).
- Modo thinking, vision general, audio: no disponible.

## Casos de uso

- Automatizacion de una celda de ensamblaje concreta: el modelo ejecuta la tarea de insertar el conector azul y negro en la zona negra sobre un robot `so_follower`, lo que permite validar una estacion de pick-and-place de bajo coste sin programacion explicita de trayectorias.
- Prototipado rapido de politicas de imitacion: sirve como referencia para equipos que quieran reproducir el pipeline completo de LeRobot (grabacion, entrenamiento, rollout) con su propio dataset y comparar resultados.
- Investigacion en VLA de bajo coste: al caber en GPU de consumo, es util para experimentos academicos donde no se dispone de A100/H100 y se quiere estudiar el comportamiento de una politica VLA compacta.
- Benchmark interno de hardware robotico: permite medir latencia y estabilidad de una politica VLA sobre un robot SO-100/SO-101 antes de invertir en modelos mayores.
- Educacion y formacion: el repositorio incluye comandos `lerobot-rollout` y `lerobot-train` listos para usar, lo que lo convierte en material didactico para cursos de robotica con aprendizaje profundo.
- Base para fine-tuning adicional: al ser un checkpoint de 450M parametros con pesos en safetensors, puede reutilizarse como inicializacion para otras tareas de manipulacion con datasets propios.
- Pruebas de robustez visual: las tres camaras con resoluciones distintas permiten evaluar como afectan cambios de iluminacion, oclusiones o posicion de objetos a una politica entrenada con solo 60 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita: "No evaluation results have been provided for this policy yet." No se reportan tasas de exito en robot real, ni metricas de MMLU, HumanEval, GSM8K u otras, que por otra parte no aplican a un modelo de accion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450M parametros, en FP32 los pesos ocupan aproximadamente 1,8 GB y en FP16/BF16 unos 0,9 GB; a ello hay que sumar el coste de procesar tres imagenes (360x640, 720x1280, 360x640) en cada paso, por lo que se recomienda al menos 8 GB de VRAM para operar con holgura.
- GPU recomendadas: no hay recomendacion oficial en la model card. Por tamano, una RTX 3060/4060 de 8-12 GB, RTX 4070/4080 o RTX 4090 deberian ser suficientes; A100/H100 no son necesarias.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU moderna con 8 GB o mas, aunque el dato no esta confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=hatakeyama8490836/smolvla_blue_black_30000`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. La politica se ejecuta a 30 FPS en el dataset de entrenamiento, pero no se reporta la frecuencia de control alcanzable en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_blue_black_30000 (este) | 450M | VLA (LeRobot) | no disponible | no disponible | Hugging Face, 0 descargas |
| SmolVLA base (Hugging Face) | ~450M (segun paper) | VLA (LeRobot) | no disponible | no disponible en esta ficha | Hugging Face |
| Otros checkpoints `smolvla` de LeRobot | no disponible | VLA (LeRobot) | no disponible | variable por repo | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de exito, latencia) entre este checkpoint y alternativas, por lo que la comparativa se limita a parametros, tipo y disponibilidad. Cualquier comparacion cuantitativa con π0, OpenVLA u otros VLA requeriria datos que no estan en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset muy pequeno: solo 60 episodios y 34 669 frames para una unica tarea, lo que implica un riesgo alto de sobreajuste y baja generalizacion a posiciones, iluminaciones u objetos distintos.
- Sin evaluacion publicada: no hay tasa de exito reportada, por lo que no se puede afirmar que la politica funcione de forma fiable en robot real.
- Licencia no especificada: la model card indica `[More Information Needed]`, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Dependencia de hardware concreto: entrenado para `so_follower` con tres camaras en posiciones y resoluciones especificas; usar otras camaras o disposiciones invalida la politica.
- Sin capacidades de lenguaje general: no es un chatbot ni un modelo de razonamiento; no admite tool calling ni conversacion multi-turno.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser una politica de imitacion, puede generar trayectorias plausibles pero erroneas ante estados no vistos, sin mecanismo de verificacion.
- Idiomas no documentados: la unica instruccion de tarea esta en ingles y no se declara soporte multilingue.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-16) en los metadatos, lo que conviene verificar antes de citar el recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hatakeyama8490836/smolvla_blue_black_30000
- Dataset de entrenamiento: https://huggingface.co/datasets/hatakeyama8490836/blue-and-black_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hatakeyama8490836/blue-and-black_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
