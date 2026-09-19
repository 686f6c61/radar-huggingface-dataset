# MrC4t/xvla_bi_so_bin6

## Resumen

`MrC4t/xvla_bi_so_bin6` es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario MrC4t y entrenada con la librería LeRobot de Hugging Face. Se trata de un ajuste fino (*fine-tune*) del modelo base `lerobot/xvla-base`, que implementa el marco X-VLA descrito en el paper arXiv 2510.10274: un enfoque *soft-prompted* con *flow matching* que codifica cada configuración de robot o hardware como una "tarea" mediante un pequeño conjunto de *embeddings* de Soft Prompt aprendibles, permitiendo que un único modelo reconcilie morfologías, sensores y espacios de acción distintos.

En este caso concreto, el modelo se ha especializado en una única tarea de manipulación bimanual: "put toy in bin" (meter un juguete en un contenedor), ejecutada por un robot de tipo `bi_so_follower` con tres cámaras (cabeza, muñeca izquierda y muñeca derecha). El modelo consume tres flujos de imagen (dos a 256×256 y uno a 224×224) más un vector de estado de 8 dimensiones, y produce un vector de acción de 12 dimensiones.

La relevancia de esta ficha es doble: por un lado, ejemplifica el flujo de trabajo actual de LeRobot para el ajuste de políticas VLA en robótica de bajo coste; por otro, conviene subrayar que no es un modelo de lenguaje ni un modelo de propósito general. Cuenta con 879.687.256 parámetros (~880 M) y se distribuye bajo licencia Apache 2.0. El autor no ha publicado resultados de evaluación en banco de pruebas ni en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) con *soft prompts* y *flow matching* (marco X-VLA); backbone VLM concreto no disponible |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica contexto del backbone; la política consume una observación por paso, sin historial explícito documentado) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el repositorio se distribuye en safetensors, 1,8 GB) |
| Idiomas soportados | no disponible (es un modelo de acción, no de lenguaje; la única instrucción de tarea del dataset está en inglés: "put toy in bin") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de pesos de LeRobot) |
| Libreria / framework | LeRobot (version 0.6.2 durante el entrenamiento) |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | bi_so_follower |
| Camaras de entrada | head, left_wrist, right_wrist |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.images.image3` (3, 224, 224), `observation.state` (8,) |
| Salidas | `action` (12,) |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

X-VLA es un marco VLA basado en *flow matching* que genera trayectorias de acción continuas en lugar de tokens discretos. Su innovación principal es el uso de *soft prompts*: cada configuración de robot o hardware se representa como una "tarea" codificada mediante un conjunto reducido de *embeddings* aprendibles, de modo que un mismo modelo puede manejar morfologías, sensores y espacios de acción heterogéneos sin reentrenar el backbone completo. La model card no detalla la arquitectura interna del backbone de visión-lenguaje (número de capas, tipo de atención o mecanismo de fusión multimodal), por lo que ese dato queda como no disponible.

El ajuste fino se realizó sobre el dataset `MrC4t/bi_so_toy_bin`, compuesto por 100 episodios y 57.678 fotogramas capturados a 30 FPS, lo que equivale a aproximadamente 32 minutos de demostraciones para una única tarea, "put toy in bin". La configuración de entrenamiento documentada es la siguiente: 20.000 pasos, tamaño de lote 8, optimizador `xvla-adamw`, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.2. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de optimización por preferencias, algo por otra parte esperable en una política de imitación robótica.

## Capacidades

- Generación de acciones motoras de 12 dimensiones para un robot bimanual (`bi_so_follower`), a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen (cabeza, muñeca izquierda, muñeca derecha) con resoluciones de 256×256 y 224×224.
- Fusión de estado proprioceptivo: incorpora un vector de estado de 8 dimensiones junto con las imágenes.
- Ejecución de una tarea de manipulación específica: "put toy in bin" (recoger un juguete y depositarlo en un contenedor).
- Adaptación a morfología mediante *soft prompts* heredados del marco X-VLA, lo que en teoría permite reutilizar el mismo backbone para otras configuraciones de robot.
- Generación de acciones por *flow matching*, es decir, trayectorias continuas en el espacio de acción en lugar de comandos discretos.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües ni de generación de texto: su única entrada lingüística es la cadena de tarea ("task") que se pasa en tiempo de inferencia.
- No dispone de modo de razonamiento (*thinking mode*), audio ni visión de propósito general más allá de las tres cámaras configuradas.

## Casos de uso

- Automatización de una celda de recogida y depósito: el modelo controla un robot bimanual para coger un objeto y dejarlo en un contenedor, tal y como se entrenó, integrándose en una línea de clasificación o *kitting* de piezas pequeñas.
- Base para *fine-tuning* en tareas nuevas: dado que se ajustó desde `lerobot/xvla-base`, sirve como punto de partida o como referencia de configuración para entrenar otras políticas con `lerobot-train` sobre datasets propios.
- Validación de un *pipeline* completo de LeRobot: útil para verificar la instalación, la calibración de brazos y cámaras y el comando `lerobot-rollout` antes de invertir tiempo en grabación de datos propios.
- Investigación en adaptación multi-robot con *soft prompts*: permite experimentar con la transferencia del mismo backbone a distintas morfologías o espacios de acción variando únicamente los *embeddings* de tarea.
- Estudio de *flow matching* aplicado a control continuo: al producir acciones de 12 dimensiones, es un caso práctico para comparar este paradigma frente a políticas con cabezas de regresión o discretización.
- Recolección de datos y benchmarking de imitación: con 100 episodios y 57.678 fotogramas disponibles públicamente, sirve como conjunto de referencia para medir variabilidad entre entrenamientos (semilla fija 1000, 20.000 pasos).
- Demostraciones educativas de robótica de bajo coste: el hardware `bi_so_follower` y las tres cámaras configuradas son reproducibles en un entorno de laboratorio o *maker* con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no se dispone de tasas de éxito en robot real, número de ensayos, ni comparaciones cuantitativas con otras políticas. No se deben extrapolar cifras a partir del número de pasos de entrenamiento ni del tamaño del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,8 GB en el repositorio (precisión reducida), por lo que el modelo en sí requiere aproximadamente 2 GB de VRAM en FP16/BF16. Sumando activaciones y los tres flujos de cámara, un presupuesto realista es de 4 a 6 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 6-8 GB de VRAM es suficiente para inferencia. Se puede ejecutar en RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090. Para entrenamiento o *fine-tuning*, se recomienda una GPU con 16-24 GB (RTX 4090, A100, H100) dependiendo del tamaño de lote.
- Cabe en GPU de consumo: sí. Con ~880 M de parámetros es una política claramente orientada a hardware asequible. También es viable en CPU para pruebas, aunque con latencias incompatibles con control en tiempo real.
- Opciones de despliegue: `lerobot-rollout` y `lerobot-train` (LeRobot 0.6.2), con backend PyTorch sobre CUDA. No aplican servidores de inferencia de LLM como vLLM, TGI u Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponible. El dataset de entrenamiento se grabó a 30 FPS, lo que marca la referencia temporal del bucle de control, pero no se han publicado mediciones de latencia de inferencia ni de frecuencia de control alcanzable en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| MrC4t/xvla_bi_so_bin6 | 879.687.256 (~880 M) | VLA ajustado (flow matching + soft prompts), tarea única | Apache 2.0 | Hugging Face |
| lerobot/xvla-base | no disponible en la informacion proporcionada | VLA base multi-robot (X-VLA) | no disponible en la informacion proporcionada | Hugging Face |
| Otras politicas del ecosistema LeRobot (p. ej. ACT, SmolVLA) | no disponible en la informacion proporcionada | Politicas de imitacion / VLA | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos verificables de parámetros, contexto ni rendimiento de las alternativas dentro de la información proporcionada, por lo que no se puede establecer una comparación cuantitativa rigurosa. La comparación relevante y verificable es con `lerobot/xvla-base`: este modelo es un ajuste fino suyo, especializado en una única tarea, mientras que el base está pensado para adaptarse a múltiples morfologías mediante *soft prompts*.

## Limitaciones y advertencias

- Política de tarea única: está entrenada exclusivamente para "put toy in bin". No generaliza a otras tareas ni a otros objetos sin reentrenamiento.
- Dataset muy reducido: 100 episodios y ~32 minutos de demostraciones implican poca variedad de posiciones, iluminación y configuraciones. Es probable un sobreajuste al entorno de grabación.
- Sin evaluación publicada: se desconoce la tasa de éxito real, el número de ensayos y las condiciones en que se probó. No hay evidencia de rendimiento fuera de la distribución de entrenamiento.
- Dependencia estricta de la interfaz de entrada: las tres cámaras deben estar presentes y con los nombres y resoluciones esperados (`observation.images.image`, `image2`, `image3`). Cualquier discrepancia en nombres, orden o resolución puede invalidar la política.
- Acciones específicas de morfología: la salida de 12 dimensiones está ligada al robot `bi_so_follower`. No es trasladable a otras cinemáticas sin reajuste.
- Riesgo de acciones erráticas: como toda política de imitación, ante observaciones fuera de distribución puede producir comandos inseguros. Es imprescindible operar con límites de par, paradas de emergencia y supervisión humana.
- Sesgos: no se han documentado análisis de sesgo. En robótica, el sesgo relevante es de distribución (objetos, colores, posiciones, iluminación del dataset), no lingüístico.
- Alucinación: el concepto no aplica en el sentido habitual de los LLM, pero sí existe el equivalente funcional de generar trayectorias plausibles pero incorrectas.
- Idiomas: no es un modelo multilingüe ni generativo en lenguaje natural; la instrucción de tarea se pasa como texto y la única documentada está en inglés.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero la responsabilidad sobre la seguridad física de la aplicación recae íntegramente en quien despliega el modelo.
- Metadatos a revisar: la fecha de creación indicada (2026-09-19) y el hecho de que el repositorio tenga 0 descargas y 0 likes sugieren que se trata de un modelo reciente y sin validación por parte de la comunidad.
- Reproducibilidad: la model card no documenta la semilla de inicialización de datos, la composición exacta de los episodios ni las condiciones de captura, lo que dificulta replicar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrC4t/xvla_bi_so_bin6
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bi_so_toy_bin
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bi_so_toy_bin
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv: https://arxiv.org/abs/2510.10274)
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de la arquitectura X-VLA: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot/xvla-architecture.png

Nota: las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo. Los enlaces recuperados correspondían a temas ajenos (foros sobre ChatGPT, hilos de Reddit, repositorios de prompts), por lo que no se incluyen.
