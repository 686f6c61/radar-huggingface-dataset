# alex-luci/smolvla-so101-vcarb-car-302ep

## Resumen

El modelo `alex-luci/smolvla-so101-vcarb-car-302ep` es un ajuste fino (fine-tune) de un modelo de vision-lenguaje-acción (VLA) de la familia SmolVLA, publicado por el usuario alex-luci en Hugging Face bajo la librería LeRobot. Está entrenado para controlar un brazo robótico SO-101 en tareas de manipulación, tomando como entrada imágenes, el estado de las articulaciones e instrucciones en lenguaje natural, y emitiendo secuencias de acciones motoras. El entrenamiento se ha realizado sobre el conjunto de datos `alex-luci/so101-vcarb-car`, compuesto por 302 episodios de demostraciones.

El ajuste fino se ejecutó durante 240.000 pasos sobre la revisión del dataset `aa205acae53f8529e20403cbc24f3fa20b341280`. El mejor checkpoint de validación es `checkpoints/030000/pretrained_model`, con una pérdida de 0,1627, mientras que el checkpoint final corresponde a `checkpoints/240000/pretrained_model`. El repositorio ocupa 39,9 GB porque incluye la carpeta completa de entrenamiento: los 16 checkpoints, el estado del optimizador, los procesadores y las configuraciones.

Se trata de un modelo muy específico y de nicho, orientado a robótica de manipulación con hardware de bajo coste, sin resultados de benchmarks publicados ni licencia declarada. Su relevancia actual radica en la democratización de las políticas robóticas entrenadas sobre datos comunitarios de LeRobot, aunque su utilidad queda acotada al robot y al entorno concretos para los que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); transformer multimodal con experto de acciones (familia SmolVLA) |
| Parametros totales | no disponible en la model card (el modelo base SmolVLA ronda los 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (recibe instrucciones de texto; el modelo card no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors, con estructura LeRobot (`checkpoints/<paso>/pretrained_model`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA, una arquitectura de tipo vision-lenguaje-acción que combina un codificador visual y un modelo de lenguaje compacto con un "experto de acciones" que genera secuencias de comandos motores (action chunks) mediante flow matching. Según la documentación pública del modelo base, SmolVLA parte de un VLM de aproximadamente 500 M de parámetros y añade dicho experto de acciones, lo que sitúa el conjunto en torno a los 450 M de parámetros y permite inferencia en GPU de consumo. Esta descripción corresponde al modelo base; la model card de este repositorio no detalla la configuración concreta empleada en el fine-tune.

El entrenamiento del fine-tune consistió en 240.000 pasos sobre 302 episodios del dataset `alex-luci/so101-vcarb-car`. La pérdida de validación más baja registrada fue de 0,1627 en el paso 30.000, lo que sugiere que el modelo podría haber empezado a sobreajustar en pasos posteriores, dado que el checkpoint final (240.000 pasos) no mejora ese valor. No se documenta en la información disponible si hubo RLHF, DPO ni otras fases de alineamiento, ni la composición exacta del dataset más allá del número de episodios y su revisión concreta.

## Capacidades

- Generación de políticas de manipulación robótica: convierte observaciones visuales, estado de las articulaciones e instrucciones de texto en comandos de acción continua para un brazo SO-101.
- Ejecución de tareas guiadas por lenguaje natural: acepta instrucciones textuales como condicionamiento de la política (imitación condicionada por lenguaje).
- Control de brazo robótico de bajo coste: orientado específicamente al hardware SO-101 de la plataforma LeRobot.
- Inferencia con action chunking: emite bloques de acciones en lugar de una sola acción por paso, patrón habitual en la familia SmolVLA.
- Tool calling / function calling: no disponible (no aplica a un modelo de política robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma en la model card.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada; no se declaran modos de razonamiento explícito ni audio.

## Casos de uso

- Manipulación de laboratorio reproducida: el modelo puede reproducir una tarea concreta de recogida y colocación de objetos sobre un SO-101 entrenada con los 302 episodios, útil para validar pipelines de LeRobot antes de escalar a datasets mayores.
- Investigación en imitación condicionada por lenguaje: sirve como punto de partida para estudiar cómo varía el rendimiento de una política VLA al variar el número de episodios y pasos de entrenamiento, ya que el repositorio conserva los 16 checkpoints intermedios.
- Pruebas de sobreajuste y selección de checkpoints: al incluir checkpoints con pérdidas de validación distintas (0,1627 en el paso 30.000 frente al final), permite analizar experimentalmente el compromiso entre pasos de entrenamiento y generalización en robótica.
- Automatización de tareas repetitivas de pick-and-place en entornos controlados: con el brazo SO-101 y una cámara fija, el modelo puede ejecutar ciclos de manipulación sobre objetos de la misma distribución que la del dataset de entrenamiento.
- Docencia y formación en robótica: como ejemplo didáctico de fine-tune VLA completo (checkpoints, optimizador, procesadores y configuraciones incluidos), facilita reproducir el flujo de trabajo extremo a extremo de LeRobot.
- Base para transferencia a nuevas tareas del mismo robot: al compartir hardware (SO-101) y formato de observaciones, puede servir de inicialización para fine-tunes posteriores sobre otros objetos o disposiciones, reduciendo el coste de entrenamiento desde cero.
- Evaluación comparativa de políticas comunitarias: útil como referencia dentro de un banco de pruebas interno de políticas LeRobot sobre el mismo robot y tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por la model card es la pérdida de validación:

| Metrica | Valor | Checkpoint |
|---|---|---|
| Perdida de validacion (mejor) | 0,1627 | `checkpoints/030000/pretrained_model` |
| Pasos de entrenamiento | 240.000 | `checkpoints/240000/pretrained_model` |
| Episodios del dataset | 302 | `alex-luci/so101-vcarb-car` |

No se dispone de tasas de éxito en tarea, MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a un modelo de política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Para un modelo de la familia SmolVLA (en torno a 450 M de parámetros) en bf16/fp16, los pesos ocupan aproximadamente 1 GB, por lo que con activaciones y buffer de imágenes la inferencia debería caber holgadamente en 4-6 GB de VRAM, aunque este cálculo no está confirmado para este fine-tune concreto.
- GPU recomendadas: no disponible. Por tamaño, una RTX 3060 de 12 GB o superior debería ser suficiente; GPU de datacenter (A100, H100) no son necesarias.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido del modelo base, pero no confirmado por el autor.
- Espacio en disco: el repositorio completo ocupa 39,9 GB al incluir los 16 checkpoints y el estado del optimizador. Para inferencia solo se necesita descargar una subcarpeta `checkpoints/<paso>/pretrained_model`, de tamaño muy inferior.
- Opciones de despliegue: LeRobot (librería declarada en la model card, con carga de subcarpetas de checkpoint); PyTorch como backend; safetensors como formato de pesos. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible. La familia SmolVLA emplea inferencia asíncrona y action chunking para amortiguar la latencia, pero no hay cifras publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla-so101-vcarb-car-302ep (este modelo) | no disponible (base ~450 M) | VLA para SO-101 | no disponible | no disponible | Hugging Face, libreria LeRobot |
| SmolVLA (modelo base de Hugging Face) | ~450 M | VLA generico multi-robot | no disponible | Apache 2.0 segun la model card del modelo base (no confirmado para este fine-tune) | Hugging Face, liberado por Hugging Face |
| OpenVLA | ~7 B | VLA de proposito general | no disponible | consultar la model card oficial | Hugging Face, pesos abiertos |
| pi0 (Physical Intelligence) | ~3 B | VLA con flow matching | no disponible | consultar repositorio openpi | Repositorio openpi y pesos asociados |

La comparación es orientativa: los tres modelos alternativos son políticas VLA de propósito general entrenadas sobre datasets amplios, mientras que este modelo es un fine-tune de 302 episodios sobre un robot concreto, por lo que no es directamente intercambiable con ellos. No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado sobre un único conjunto de 302 episodios de un robot SO-101; fuera de esa distribución (otros objetos, iluminación, cámara o robot) su comportamiento es impredecible.
- Riesgo de sobreajuste: la mejor pérdida de validación se alcanzó en el paso 30.000 (0,1627), muy por debajo del checkpoint final de 240.000 pasos, lo que apunta a posible sobreajuste en las etapas tardías. Conviene evaluar el checkpoint de 30.000 antes de usar el final.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgos, y en robótica los sesgos relevantes suelen provenir de la distribución de demostraciones (posiciones, objetos y condiciones de iluminación del dataset).
- Alucinación: no aplica en el sentido textual, pero el modelo puede generar trayectorias de acción inválidas o inseguras si la observación se sale de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: la model card no declara ventana de contexto ni idiomas soportados; se desconoce si las instrucciones de texto pueden formularse en castellano.
- Licencia: no disponible. No hay declaración de licencia, por lo que no se puede asumir permiso para uso comercial ni redistribución.
- Uso en producción: se requiere supervisión humana y mecanismos de parada de emergencia, dado que se trata de un modelo que controla hardware físico.
- Repositorio pesado: 39,9 GB con 16 checkpoints y estado del optimizador; conviene descargar únicamente la subcarpeta de checkpoint necesaria.
- Sin métricas de éxito en tarea: la pérdida de validación no es un indicador directo del rendimiento real de manipulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alex-luci/smolvla-so101-vcarb-car-302ep
- Dataset de entrenamiento: https://huggingface.co/datasets/alex-luci/so101-vcarb-car
- Librería LeRobot (documentación y herramientas de entrenamiento e inferencia): https://github.com/huggingface/lerobot
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Búsqueda web realizada: no devolvió resultados relevantes sobre este modelo ni sobre SmolVLA; los resultados obtenidos correspondían a páginas no relacionadas con el ámbito de la inteligencia artificial.
