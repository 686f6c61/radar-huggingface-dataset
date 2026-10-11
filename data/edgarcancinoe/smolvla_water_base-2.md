# edgarcancinoe/smolvla_water_base-2

## Resumen

`smolvla_water_base-2` es una politica de robotica basada en SmolVLA (Small Vision-Language-Action), un modelo compacto de vision-lenguaje-accion que combina observaciones visuales, el estado propioceptivo del robot y una instruccion en lenguaje natural para producir acciones motoras continuas. No es un modelo de lenguaje generativo: es una politica de control entrenada por imitacion y ejecutada sobre un brazo Franka Panda.

Lo publica el usuario edgarcancinoe dentro del ecosistema LeRobot y deriva de `lerobot/smolvla_base` mediante ajuste fino sobre 47 episodios de la tarea de regar plantas. Cuenta con 450.046.176 parametros (unos 450 millones), ocupa 0,9 GB en el repositorio y se distribuye en safetensors bajo licencia Apache-2.0.

Su relevancia es metodologica: demuestra el flujo de trabajo tipico de la robotica open source actual, consistente en partir de una politica preentrenada, grabar un dataset de unas decenas de episodios y obtener un controlador especifico de tarea ejecutable en hardware de gama de consumo. La model card del autor describe SmolVLA como un VLA eficiente, de coste computacional reducido y desplegable en hardware consumer. En su estado actual es un artefacto de investigacion y experimentacion, no de produccion: no publica resultados de evaluacion y esta atado a una configuracion concreta de robot y camaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; detalles internos no disponibles en la informacion proporcionada (referencia: arXiv:2506.01844) |
| Parametros totales | 450.046.176 (unos 450 M) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje con ventana de contexto, consume secuencias de observacion imagen-estado e instruccion |
| Tipos de cuantizacion | No disponible; pesos en safetensors (repositorio de 0,9 GB) |
| Idiomas soportados | No disponible; las instrucciones del dataset de entrenamiento estan en ingles ("Water the left plant", "Water the middle plant", "Water the right plant") |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, en el formato de politica de LeRobot |

## Arquitectura y entrenamiento

Se trata de una politica vision-language-action: transforma un conjunto de observaciones (imagenes RGB de camaras, estado del robot e instruccion textual de la tarea) en un vector de accion continuo. La model card no detalla la arquitectura interna (tipo de backbone visual, mecanismo de fusion, metodo de generacion de acciones ni el esquema de decodificacion); esos detalles remiten al paper de SmolVLA (arXiv:2506.01844). Lo que si esta documentado es la interfaz de entrada y salida: `observation.state` con forma `(6,)`, tres imagenes visuales de `(3, 256, 256)` y una accion de salida de forma `(7,)`, lo que corresponde a un efector de 7 grados de libertad.

El entrenamiento es un ajuste fino por imitacion desde `lerobot/smolvla_base` sobre el dataset `edgarcancinoe/water_pour`: 47 episodios, 35.370 fotogramas a 20 FPS (aproximadamente 29,5 minutos de datos) y tres tareas de riego sobre plantas situadas a izquierda, centro y derecha. La configuracion declarada es de 10.000 pasos de entrenamiento, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.1. No se documenta si hubo fases de RLHF, DPO ni ninguna innovacion tecnica adicional respecto al modelo base.

## Capacidades

- Generacion de acciones motoras continuas de 7 dimensiones para un brazo Franka Panda (tipo de robot declarado como `panda`).
- Percepcion visual multicamara: hasta tres imagenes RGB de 256x256, junto con estado propioceptivo de 6 dimensiones.
- Condicionamiento por instruccion en lenguaje natural, limitado a las tres tareas de riego incluidas en el dataset de entrenamiento.
- Ejecucion de una politica reactiva de imitacion: mapea observacion a accion sin planificacion explicita.
- No genera texto ni mantiene conversaciones: no es un modelo de lenguaje.
- Soporte de tool calling / function calling: no disponible (no aplica a una politica de control).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision generativa, audio): no disponibles.

## Casos de uso

- Riego autonomo de plantas en laboratorio o invernadero: el modelo ejecuta las instrucciones "Water the left plant", "Water the middle plant" y "Water the right plant" sobre un Panda, cubriendo la tarea completa de aproximacion, vertido y retirada con una politica unica.
- Base para nuevos ajustes finos con pocos datos: al derivar de `lerobot/smolvla_base` y requerir solo 47 episodios para especializarse, sirve como plantilla reproducible para crear politicas de manipulacion en otras tareas con presupuestos de grabacion reducidos.
- Investigacion en aprendizaje por imitacion: permite estudiar generalizacion, sobreajuste y sensibilidad a posiciones de objeto o condiciones de iluminacion con un modelo de 450 M de parametros y un dataset completamente publicado.
- Manipulacion de liquidos en entornos controlados: la tarea de vertido (water pour) es representativa de operaciones con objetos deformables y fluidos, utiles como banco de pruebas para control fino de efector final.
- Despliegue en hardware de gama de consumo: al tratarse de un VLA compacto y desplegable en equipos consumer segun el autor, resulta util para prototipos de robotica de bajo coste y demostraciones en laboratorio o aula.
- Docencia y robotica educativa: el flujo completo (grabar dataset, entrenar con `lerobot-train`, ejecutar con `lerobot-rollout`) es replicable con hardware LeRobot y sirve para ensenar aprendizaje por imitacion de extremo a extremo.
- Evaluacion comparativa de politicas VLA: sirve como punto de referencia de bajo coste frente a politicas de mayor tamano en estudios de compromiso entre rendimiento y recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito por tarea ni comparaciones cuantitativas con otras politicas. Tampoco se aportan metricas de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia de orden de magnitud, los pesos safetensors ocupan 0,9 GB en el repositorio; con activaciones de los encoders visuales para tres imagenes de 256x256 y lote 1, una estimacion conservadora se situa en el rango de 2 a 4 GB en precision reducida (estimacion, no dato del autor).
- VRAM estimada para entrenamiento: no disponible. Con 450 M de parametros, AdamW y lote 16, es razonable esperar necesidades claramente superiores a las de inferencia (estimacion).
- GPU recomendadas: el autor indica que SmolVLA puede desplegarse en hardware de gama de consumo; la documentacion de LeRobot usa `--policy.device=cuda` para entrenamiento. GPU profesionales tipo A100 o H100 no son necesarias para este tamano de modelo, aunque no se documentan cifras concretas.
- Compatibilidad con GPU de consumo: si, segun la afirmacion del autor sobre despliegue en hardware consumer. No se especifican modelos concretos (RTX 3060, RTX 4090, etc.) ni requisitos minimos.
- Opciones de despliegue: libreria LeRobot con el comando `lerobot-rollout` y `--policy.path=edgarcancinoe/smolvla_water_base-2`; entrenamiento con `lerobot-train`. Servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama no aplican a una politica VLA de este tipo.
- Latencia y throughput estimados: no disponibles. El dato de 20 FPS del dataset corresponde a la frecuencia de grabacion, no a la velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_water_base-2 | 450.046.176 | No aplica (politica VLA) | Sin evaluacion publicada | Apache-2.0 | HuggingFace, ecosistema LeRobot |
| lerobot/smolvla_base (modelo base) | No disponible en la informacion proporcionada | No aplica | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras politicas VLA de la misma categoria (por ejemplo OpenVLA, pi0, pi0.5, RDT) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

Los nombres de la tercera fila se citan unicamente como contexto de categoria; no se dispone de sus especificaciones verificadas en la informacion proporcionada, por lo que no se comparan cifras.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito por tarea, ni numero de ensayos, ni condiciones de prueba, por lo que se desconoce la fiabilidad real de la politica.
- Dataset muy reducido: 47 episodios y 35.370 fotogramas (unos 29,5 minutos) para tres tareas; riesgo alto de sobreajuste a posiciones concretas de las plantas, a la iluminacion de la escena y a la disposicion de las camaras.
- Inconsistencia documentada en la configuracion de camaras: los detalles del modelo indican `image` e `image2`, mientras que la tabla de entradas lista `observation.images.camera1`, `camera2` y `camera3`. Es necesario verificar los nombres exactos de las claves de observacion antes de ejecutar la politica, ya que deben coincidir con los del entrenamiento.
- Especificidad de hardware: la politica esta entrenada para un robot de tipo `panda`, con estado de 6 dimensiones y accion de 7 dimensiones. No hay evidencia de transferencia a otro robot, a otro efector o a otra cinematica.
- Instrucciones solo en ingles y limitadas a tres tareas concretas; no se documenta soporte multilingue ni generalizacion a instrucciones nuevas.
- Riesgo de alucinacion en el sentido habitual de los LLM: no aplica, pero si existe el riesgo equivalente de ejecutar acciones incorrectas o incompletas con seguridad fisica implicada (vertido de liquidos, contacto con objetos).
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo, robustez ni comportamiento ante objetos fuera de distribucion.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligaciones de atribucion y conservacion del aviso de licencia, pero la licencia del modelo base no se detalla en la informacion proporcionada y conviene verificarla antes de un uso comercial.
- Idiomas soportados: no disponibles.
- Caveat de produccion: sin evaluacion publicada, sin datos de latencia y con un dataset minimo, este modelo no es apto para despliegues criticos sin una validacion propia en el robot objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edgarcancinoe/smolvla_water_base-2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los dominios devueltos no guardan relacion con robotica ni con SmolVLA y se han descartado.
