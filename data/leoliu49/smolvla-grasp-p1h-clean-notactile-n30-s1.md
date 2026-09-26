# leoliu49/smolvla-grasp-p1h-clean-notactile-n30-s1

## Resumen

SmolVLA es un modelo vision-lenguaje-accion (VLA) compacto desarrollado por Hugging Face, con 450 millones de parametros, que traduce imagenes de camaras RGB e instrucciones en lenguaje natural en secuencias de acciones para un robot manipulador. Este repositorio concreto, `leoliu49/smolvla-grasp-p1h-clean-notactile-n30-s1`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre el dataset `leoliu49/grasp_p1h_clean`, orientado a una tarea especifica de agarre con un brazo robotico.

El problema que resuelve es el control motor guiado por lenguaje: dado un conjunto de observaciones visuales y una orden textual, el modelo genera un chunk de acciones (posiciones objetivo) que el robot ejecuta de forma autonoma. Su relevancia esta en la eficiencia: con 450 M de parametros y pesos de menos de 1 GB, se puede desplegar en GPUs de gama media, algo poco habitual en una categoria dominada por modelos de 3 a 7 mil millones de parametros.

Este repositorio concreto no documenta el numero de episodios, la composicion del dataset ni resultados de evaluacion. El nombre sugiere una variante sin sensor tactil ("notactile"), con 30 episodios ("n30") y semilla 1 ("s1"), pero estos extremos no se confirman en la model card y deben tratarse como no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA). VLM compacto (SmolVLM-2) mas un experto de acciones entrenado con flow matching; atencion intercalada entre ambos y decodificacion de chunks de acciones |
| Parametros totales | 450.046.176 (~450 M, dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo produce chunks de acciones; no se especifica ventana de contexto en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors; LeRobot ejecuta en float32/bfloat16 y admite conversion a otros formatos) |
| Idiomas soportados | No disponible en la model card; las instrucciones de tarea se proporcionan en lenguaje natural (los entrenamientos de SmolVLA usan instrucciones en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 0,9 GB; libreria: lerobot) |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Dataset de ajuste fino | leoliu49/grasp_p1h_clean |
| Entradas | Imagenes de camaras + instruccion en lenguaje natural + estado del robot (representacion de 32 dimensiones segun la ficha del modelo base) |
| Salidas | Chunk de acciones de posicion objetivo (32 dimensiones segun la ficha del modelo base) |
| Tipo de robot | Manipulador de un solo brazo (pipeline `robotics`; evaluacion documentada con `so100_follower`) |
| Fecha de publicacion en el Hub | 25 de septiembre de 2026 (segun los metadatos del Hub) |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de vision-lenguaje preentrenado y compacto (SmolVLM-2) con un "experto de acciones" que se entrena mediante flow matching. Dada una secuencia de imagenes de varias camaras y una instruccion de tarea, el modelo produce un chunk de acciones que se ejecutan en bucle cerrado. La arquitectura introduce atencion intercalada entre las representaciones del VLM y las del experto de acciones, lo que permite condicionar la generacion motora en las caracteristicas visuales y linguisticas sin necesidad de un transformer de acciones independiente y de gran tamano. El modelo base se preentreno con datos de robotica de la comunidad del ecosistema LeRobot y se evalua habitualmente en tareas de manipulacion con brazos SO-100/SO-101.

Sobre el ajuste fino de este repositorio no hay informacion en la model card: no se indica el numero de episodios utilizados, la composicion del dataset, la resolucion de las camaras ni si se aplicaron tecnicas de regularizacion. La unica referencia disponible es el propio dataset `leoliu49/grasp_p1h_clean` y el nombre del repositorio. El modelo base es generico y la documentacion de LeRobot recomienda unos 50 episodios por tarea como punto de partida para un ajuste fino optimo.

## Capacidades

- Generacion de acciones motoras: produce chunks de posiciones objetivo para un brazo manipulador a partir de observaciones visuales y una instruccion en lenguaje natural.
- Percepcion visual multicamara: procesa multiples imagenes simultaneas como entrada para construir la representacion del entorno.
- Seguimiento de instrucciones: condiciona la politica de control en la orden textual de la tarea.
- Ejecucion en bucle cerrado: la politica se consulta repetidamente durante la ejecucion del episodio mediante `lerobot-record`.
- Inferencia compatible con hardware de consumo: el modelo base se disena explicitamente para desplegarse en GPUs de gama media.
- Ajuste fino orientado a una tarea de agarre concreta, aparentemente sin usar retroalimentacion tactil.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes de multiples pasos ni razonamiento simbolico en el sentido de los LLM.
- No genera texto, codigo ni matematicas; su salida es exclusivamente motora.
- Capacidades multilingues: no disponibles; la instruccion textual se limita a la tarea aprendida.

## Casos de uso

- Agarre de objetos en laboratorio: el modelo ejecuta la politica de grasping sobre el dataset `grasp_p1h_clean`, adecuado para reproducir un experimento concreto de recogida de piezas con un brazo SO-100/SO-101.
- Pick-and-place en linea de montaje ligera: con instrucciones en lenguaje natural y varias camaras, puede integrarse en una celda de manipulacion para mover piezas entre posiciones fijas de un puesto de trabajo.
- Punto de partida para transfer learning: al ser un ajuste fino de `lerobot/smolvla_base`, sirve como inicializacion para reentrenar con datos propios de otra tarea mediante `lerobot-train`, reduciendo el tiempo de ajuste.
- Estudio de ablacion sin sensor tactil: la variante "notactile" permite comparar el rendimiento de agarre con y sin retroalimentacion tactil frente a las otras variantes del mismo autor.
- Reproducibilidad experimental: las variantes con distintos numeros de episodios y semillas (por ejemplo, "n30", "s1") permiten analizar la sensibilidad del ajuste fino al tamano del dataset y a la inicializacion aleatoria.
- Docencia y prototipado de robotica de bajo coste: con menos de 1 GB de pesos y requisitos de VRAM modestos, es viable montar un banco de pruebas docente con una GPU de gama media y un brazo SO-100.
- Evaluacion de robustez visual: al depender de las camaras del dataset de entrenamiento, sirve para medir hasta que punto pequenos cambios de iluminacion, encuadre o posicion del objeto degradan la tasa de exito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de evaluacion, tasas de exito ni comparaciones con otras politicas, y el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 450 M de parametros): aproximadamente 1,8 GB en float32, 0,9 GB en bfloat16 y 0,45 GB en int8, sin contar las activaciones de los codificadores visuales de varias camaras.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente en bfloat16 (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4090); la documentacion del modelo base afirma explicitamente que esta pensado para hardware de consumo.
- GPU de centro de datos: no son necesarias; A100 o H100 solo tendrian sentido para entrenamiento o evaluacion masiva en paralelo.
- Despliegue: la via documentada es PyTorch con las herramientas de LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` con `--policy.path` para inferencia/evaluacion). vLLM, TGI u Ollama no son aplicables, ya que no es un modelo de generacion de texto.
- Hardware adicional imprescindible: camaras de las mismas caracteristicas que las usadas en el dataset y un robot compatible (la documentacion de LeRobot usa `so100_follower`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de la columna "alternativas" son valores publicos de referencia de cada proyecto y no estan verificados en la informacion proporcionada; conviene confirmarlos en las fuentes originales antes de citarlos.

| Modelo | Parametros | Tipo | Licencia | Contexto/observaciones |
|---|---|---|---|---|
| `leoliu49/smolvla-grasp-p1h-clean-notactile-n30-s1` | 450 M | VLA (SmolVLM-2 + experto de acciones) | apache-2.0 | Ajuste fino de tarea unica; sin benchmarks publicados |
| `lerobot/smolvla_base` | 450 M | VLA | apache-2.0 | Modelo base generico; requiere ajuste fino para rendimiento optimo |
| pi0 (Physical Intelligence) | ~3,3 B (referencia publica) | VLA con flow matching | apache-2.0 en openpi (referencia publica) | Mayor capacidad y mayor coste de inferencia |
| OpenVLA | ~7 B (referencia publica) | VLA sobre backbone de lenguaje | consultar terminos del proyecto | Mucho mas grande; desplegable sobre GPU de gama alta |
| GR00T N1 (NVIDIA) | ~2,2 B (referencia publica) | VLA fundacional | licencia de modelo abierto de NVIDIA | Mayor tamano y ecosistema propio de despliegue |

## Limitaciones y advertencias

- Ajuste fino de tarea unica: la politica esta especializada en el dataset `grasp_p1h_clean`; fuera de esa tarea, esos objetos o esa configuracion de camaras el rendimiento sera muy bajo.
- Sin datos de evaluacion: no se publica tasa de exito, numero de episodios de prueba ni curva de aprendizaje, por lo que no es posible estimar su fiabilidad antes de desplegarlo.
- Tamano del dataset probablemente pequeno: si la etiqueta "n30" corresponde a 30 episodios, esta muy por debajo de los ~50 episodios que LeRobot recomienda como minimo para un ajuste fino estable, con riesgo de sobreajuste.
- Ausencia de sensor tactil: al no usar retroalimentacion de fuerza, el agarre de objetos fragiles o deformables puede ser inadecuado.
- Dependencia del entorno de captura: cambios en la posicion, el tipo o la calibracion de las camaras, asi como en la iluminacion, pueden degradar gravemente las acciones generadas.
- Riesgo de "alucinacion" motora: una accion incorrecta se traduce en movimiento fisico real; es obligatorio disponer de parada de emergencia, limites de par y zonas de seguridad.
- Idiomas: no se especifica el idioma de las instrucciones; los datos de entrenamiento de SmolVLA usan instrucciones en ingles, por lo que no debe asumirse soporte de castellano.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y del dataset de ajuste fino antes de un despliegue comercial.
- Falta de validacion externa: el repositorio tiene 0 descargas y 0 valoraciones, por lo que no existe evidencia de terceros sobre su comportamiento.
- Constante de contexto: no disponible; no se puede asumir una ventana larga de historial de observaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leoliu49/smolvla-grasp-p1h-clean-notactile-n30-s1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste fino: https://huggingface.co/datasets/leoliu49/grasp_p1h_clean
- Paper de SmolVLA (arXiv 2506.01844): https://arxiv.org/html/2506.01844v1
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Pagina divulgativa del modelo: https://smolvla.net/index_en
- Ficha en Cyberwave: https://cyberwave.com/lerobot/models/smolvla
- Variante relacionada del mismo autor: https://huggingface.co/leoliu49/smolvla-grasp-p1-notactile-n30-s1
