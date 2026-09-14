# Myungkyu/pi0_5_robodojo_taco_b64_100k

## Resumen

`Myungkyu/pi0_5_robodojo_taco_b64_100k` es una política robótica de bajo nivel (vision-language-action, VLA) obtenida por ajuste fino de `lerobot/pi05_base` sobre el conjunto de datos `Myungkyu/RoboDojo-taco-gemini`. El modelo resuelve el problema de traducir observaciones visuales y propioceptivas, junto con una instrucción de subtarea en texto, en acciones motoras continuas para un robot bimanual de sobremesa. Es relevante porque forma parte de la familia Pi0.5 integrada en LeRobot, y porque documenta un entrenamiento reproducible sobre tareas de horizonte largo con etiquetas densas de subtarea.

El entrenamiento cubre ocho tareas bimanuales de mesa con 100 demostraciones cada una, con etiquetas densas de subtarea obtenidas por anotación offline a partir del contexto específico de cada tarea. El checkpoint es el resultado de 100.000 pasos de optimización con batch 64, y constituye una continuación real del checkpoint previo `pi0_5_robodojo_taco_b64_60k` durante 40.000 pasos adicionales, con reanudación del estado del optimizador, del planificador y del generador aleatorio, manteniendo el learning rate en su suelo constante de 2,5e-6.

La arquitectura declarada es "Pi0.5 vanilla" con tres vistas de cámara en vivo (cabeza y muñecas izquierda y derecha), sin ranura de keyframe ni atestación de memoria. El repositorio contiene 4.143.404.816 parámetros en formato safetensors (unos 9,4 GB), por lo que se trata de un modelo de aproximadamente 4,1 mil millones de parámetros que hereda el tokenizador y el backbone del modelo base referenciado por identificador de hub o por ruta local del sitio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 vanilla (vision-language-action); backbone heredado de `lerobot/pi05_base` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors |
| Idiomas soportados | no disponible (el modelo recibe texto de subtarea; no se documentan idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | Imagenes de cabeza, muneca izquierda y muneca derecha, propiocepcion y texto de subtarea actual |
| Salidas | Acciones motoras de bajo nivel para robot bimanual |
| Modelo base | `lerobot/pi05_base` |
| Conjunto de datos de ajuste | `Myungkyu/RoboDojo-taco-gemini` |
| Pasos de entrenamiento | 100.000 (batch 64), con reanudacion desde el checkpoint de 60.000 pasos |
| Learning rate | 2,5e-6 constante (suelo de la planificacion coseno) |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una política VLA de la familia Pi0.5, ajustada a partir de `lerobot/pi05_base`, que a su vez actúa como backbone y tokenizador. La variante empleada se describe como "Pi0.5 vanilla": tres flujos de cámara en vivo (cámara de cabeza y cámaras de muñeca izquierda y derecha), sin ranura de keyframe y sin mecanismo de atestación de memoria. La entrada combina las tres imágenes, la propiocepción del robot y el texto de la subtarea en curso; la salida es la acción de bajo nivel. La model card no detalla el número de capas, la dimensión oculta ni el horizonte de predicción de acciones, por lo que esos datos no están disponibles.

El ajuste fino se realizó sobre el conjunto `Myungkyu/RoboDojo-taco-gemini`, compuesto por demostraciones de ocho tareas bimanuales de sobremesa de horizonte largo, con 100 demostraciones por tarea, anotadas offline con etiquetas densas de subtarea. El entrenamiento usó batch 64 durante 100.000 pasos. El checkpoint publicado continúa el entrenamiento de `pi0_5_robodojo_taco_b64_60k` durante 40.000 pasos adicionales mediante una reanudación real del estado del optimizador, del planificador y del generador aleatorio; como la planificación coseno guardada ya había alcanzado su suelo en los 60.000 pasos, el learning rate se mantuvo constante en 2,5e-6. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa.

## Capacidades

- Generación de acciones motoras continuas para un robot bimanual de sobremesa, condicionadas por visión, propiocepción y texto de subtarea.
- Ejecución de tareas de horizonte largo descompuestas en subtareas, gracias a las etiquetas densas de subtarea del conjunto de entrenamiento.
- Percepción multi-cámara simultánea: vista de cabeza más vistas de muñeca izquierda y derecha.
- Ejecución bimanual, al estar entrenado sobre tareas de mesa que requieren coordinación de dos brazos.
- Condicionamiento por instrucción textual de subtarea, lo que permite cambiar de fase dentro de una misma tarea sin reentrenar.
- No se documenta soporte de tool calling, function calling, uso como agente conversacional ni capacidades de audio.
- No se documenta capacidad multilingüe ni lista de idiomas soportados.
- No se documenta capacidad de visión general (descripción de imágenes, VQA) fuera del uso como política de control.

## Casos de uso

- Manipulación bimanual de sobremesa en laboratorio: el modelo puede controlar un robot de dos brazos en tareas de recogida, colocación y ensamblaje, aprovechando el entrenamiento sobre ocho tareas con 100 demostraciones cada una.
- Investigación en políticas de horizonte largo: sirve como punto de partida para estudiar el efecto de las etiquetas densas de subtarea en la descomposición de tareas largas en fases.
- Comparación de checkpoints de un mismo entrenamiento: al ser una continuación real de `pi0_5_robodojo_taco_b64_60k` con reanudación de optimizador, planificador y RNG, permite medir el efecto de 40.000 pasos adicionales a learning rate constante.
- Reproducción de experimentos de ajuste fino con LeRobot: el repositorio declara la configuración de entrenamiento (batch 64, 100.000 pasos, learning rate 2,5e-6), lo que facilita replicar el procedimiento sobre el mismo conjunto de datos.
- Evaluación de generalización entre tareas de mesa: las ocho tareas bimanuales del conjunto permiten medir la transferencia de la política a variaciones dentro de la misma categoría de manipulación.
- Base para ajuste a un robot concreto: al heredar el backbone de `lerobot/pi05_base`, puede reajustarse sobre demostraciones propias del hardware objetivo en lugar de entrenar desde cero.
- Estudio de entradas sensoriales en VLA: la ausencia de ranura de keyframe y de atestación de memoria permite aislar la contribución de las tres vistas de cámara y de la propiocepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de exito por tarea ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- Peso de los parametros: 4.143.404.816 parametros, aproximadamente 8,3 GB en bf16 y 16,6 GB en fp32 solo para los pesos. El repositorio ocupa 9,4 GB, coherente con pesos en bf16 mas ficheros auxiliares.
- VRAM de inferencia estimada: unos 10-12 GB en bf16 contando pesos y activaciones de las tres camaras; unos 20 GB o mas en fp32.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A6000 para despliegue en bf16 con margen. Con 24 GB (RTX 4090, A5000) el modelo deberia caber en bf16.
- GPU de consumo: si cabe en bf16 en tarjetas de 24 GB como la RTX 4090 o la RTX 3090; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) queda al limite y puede requerir reducir el numero de camaras o el lote. En 12 GB o menos no se puede garantizar con la informacion disponible.
- Opciones de despliegue: LeRobot con PyTorch es la via documentada, dado que la libreria declarada es `lerobot`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; estos motores estan orientados a modelos de lenguaje y no se ha verificado su compatibilidad con esta politica VLA.
- Latencia y throughput: no disponible. No se publican frecuencias de control alcanzadas ni tiempos de inferencia por paso.

## Comparativa con modelos similares

Los datos publicados en la informacion disponible no permiten una comparacion cuantitativa fiable. Se recogen unicamente los campos conocidos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de benchmark |
|---|---|---|---|---|---|
| `Myungkyu/pi0_5_robodojo_taco_b64_100k` | 4.143.404.816 | no disponible | no disponible | HuggingFace, libreria `lerobot` | no disponible |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | HuggingFace, modelo base de este ajuste | no disponible |
| `pi0_5_robodojo_taco_b64_60k` | no disponible | no disponible | no disponible | referenciado como checkpoint previo del mismo autor | no disponible |

No se dispone de informacion en la busqueda web sobre alternativas comparables de la misma categoria (VLA para manipulacion bimanual) con parametros, contexto y rendimiento verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna auditoria de sesgos ni de comportamiento diferencial por escenario.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero existe riesgo de acciones fisicamente invalidas o incoherentes con la subtarea, especialmente fuera de la distribucion de las ocho tareas de entrenamiento.
- Alcance restringido: el ajuste cubre ocho tareas bimanuales de sobremesa con 100 demostraciones cada una; la generalizacion a otras tareas, objetos o morfologias de robot no esta documentada.
- Limitaciones de contexto e idioma: la longitud de contexto, el horizonte de acciones y los idiomas del texto de subtarea no estan documentados. No hay garantia de que instrucciones en castellano funcionen si el entrenamiento empleo otro idioma.
- Licencia: no disponible. Al no declararse licencia, no puede asumirse permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Restricciones de carga: la propia model card advierte que las configuraciones referencian el backbone y el tokenizador por identificador de hub o por la ruta local del sitio de entrenamiento, por lo que hay que apuntarlas a copias locales antes de cargar el modelo.
- Madurez: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (14 de septiembre de 2026). No hay evidencia de validacion externa.
- Entradas no soportadas: al no incluir ranura de keyframe ni atestacion de memoria, no puede utilizarse como entrada una imagen de referencia de objetivo ni un estado de memoria explicito.
- Evaluacion ausente: no se publican tasas de exito por tarea, curvas de aprendizaje ni comparaciones con el checkpoint de 60.000 pasos, por lo que la mejora atribuible a los 40.000 pasos adicionales no esta cuantificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_taco_b64_100k
- Conjunto de datos de ajuste: https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Checkpoint previo referenciado: `pi0_5_robodojo_taco_b64_60k` (no se ha localizado URL publica en la busqueda web)
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (corresponden a la aplicacion de mensajeria WhatsApp) y no aportan papers, blogs, repositorios ni demos adicionales.
