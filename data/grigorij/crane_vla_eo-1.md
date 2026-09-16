# Grigorij/crane_vla_eo-1

## Resumen

Grigorij/crane_vla_eo-1 es una politica robotica de tipo Vision-Language-Action (VLA) publicada por el usuario Grigorij en Hugging Face. Se trata de un ajuste fino del metodo EO-1, descrito en el paper arXiv:2508.21112, que combina un backbone Qwen2.5-VL para la comprension visual y linguistica con una cabeza de accion de flow matching continuo que denoisa bloques de acciones (action chunks). El modelo tiene 3.771.607.072 parametros (aproximadamente 3,77 mil millones) y un repositorio de 7,6 GB en formato safetensors.

El modelo resuelve una tarea concreta de manipulacion sobre una grua: "put the barrel on the marked square" (colocar el bidon en la casilla marcada). Consume tres flujos de camara (`boom`, `hook`, `cabin`) a 480x640 y un vector de estado de 4 dimensiones (`observation.state`), y produce un vector de accion de 4 dimensiones. La politica se entreno con LeRobot 0.6.2 y se distribuye con licencia MIT, lo que permite su uso comercial sin restricciones declaradas.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot para entrenar y desplegar una politica VLA con un dataset propio pequeno; por otro, sirve como punto de partida reproducible para quien quiera aplicar EO-1 a su propio robot. No obstante, el repositorio no incluye resultados de evaluacion, no tiene descargas ni interacciones registradas, y la tarea entrenada es unica, por lo que debe considerarse un artefacto de investigacion o prototipo, no una politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): backbone Qwen2.5-VL + cabeza de accion de flow matching continuo sobre bloques de acciones |
| Parametros totales | 3.771.607.072 (3,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; el repositorio contiene pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible; el backbone Qwen2.5-VL es multilingue, pero el ajuste solo se entreno con la instruccion en ingles "put the barrel on the marked square" |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 7,6 GB) |
| Libreria | lerobot (LeRobot 0.6.2) |
| Pipeline | robotics |
| Entradas | `observation.state` (4,), `observation.images.boom` (3, 480, 640), `observation.images.hook` (3, 480, 640), `observation.images.cabin` (3, 480, 640) |
| Salidas | `action` (4,) |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno EO-1: un modelo de vision-lenguaje Qwen2.5-VL actua como columna vertebral que procesa conjuntamente las tres vistas de camara y la instruccion en lenguaje natural, y sobre sus representaciones se acopla una cabeza de accion basada en flow matching continuo. Esta cabeza no clasifica acciones discretas, sino que denoisa un bloque de acciones futuras (action chunk) mediante un proceso de flujo, lo que permite generar trayectorias continuas de 4 dimensiones de forma mas estable que una regresion directa. El modelo usa 3,77 B de parametros en total, la mayor parte correspondiente al backbone VLM; la model card no desglosa cuantos corresponden a la cabeza de accion. No se especifica la variante exacta de Qwen2.5-VL utilizada, ni la longitud de contexto del backbone, ni si se aplico RLHF, DPO o algun ajuste posterior al entrenamiento supervisado.

El entrenamiento se realizo por imitacion sobre el dataset Grigorij/crane_vla: 50 episodios, 41.614 fotogramas a 25 FPS, todos ellos de la tarea "put the barrel on the marked square". La configuracion declarada es de 20.000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, con LeRobot 0.6.2. Se trata, por tanto, de un ajuste fino de una unica tarea con un volumen de datos reducido (menos de 42.000 fotogramas), sin aumento de datos ni curriculum declarados. La model card no documenta innovaciones adicionales (por ejemplo, decodificacion especulativa, atencion lineal o entrenamiento en simulacion) mas alla del esquema general de EO-1.

## Capacidades

- Generacion de acciones motoras continuas: produce vectores de accion de 4 dimensiones a partir de observaciones multimodales, adecuado para control de bajo nivel.
- Percepcion multimodal con tres camaras simultaneas (`boom`, `hook`, `cabin`), lo que aporta vistas complementarias de la escena de trabajo.
- Comprension de instrucciones en lenguaje natural: el modelo condiciona su comportamiento a la cadena de tarea suministrada en inferencia (entrenado con "put the barrel on the marked square").
- Fusión estado-visión: incorpora un vector de estado propioceptivo de 4 dimensiones junto a las imagenes.
- Ejecucion de politicas de imitacion en bucle cerrado mediante `lerobot-rollout`, con control en tiempo real sobre el robot.
- Generacion de bloques de acciones (action chunking) mediante flow matching, lo que permite desacoplar la frecuencia de inferencia de la frecuencia de control.
- Reentrenamiento y ajuste con datos propios mediante `lerobot-train --policy.type=eo1`.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni modo de razonamiento explicito: es una politica robotica, no un asistente conversacional.
- No se declaran capacidades de audio, vision general (VQA, OCR, captioning) ni generacion de texto como producto final.

## Casos de uso

- Automatizacion de colocacion de cargas con grua: la politica se entreno especificamente para "put the barrel on the marked square", de modo que puede emplearse como controlador de esa maniobra en un banco de pruebas con las mismas tres camaras y el mismo robot.
- Replicacion del pipeline EO-1 en un robot propio: sirve como referencia funcional para verificar la instalacion de LeRobot 0.6.2, el registro de datos y el entrenamiento con `policy.type=eo1` antes de invertir en un dataset mayor.
- Ajuste fino con datos propios de otra tarea: partiendo de este checkpoint o del metodo EO-1, se puede reentrenar con un dataset propio para tareas de pick-and-place, siempre que se respeten las claves de observacion de las camaras.
- Investigacion comparativa de arquitecturas VLA: permite medir el comportamiento de un backbone Qwen2.5-VL de ~3,8 B con cabeza de flow matching frente a alternativas con backbone Llama o con cabezas de regresion discreta, en igualdad de hardware.
- Validacion de infraestructura de inference robotica: util para medir latencia real de un VLA de 3,77 B con tres entradas de 480x640 en una GPU concreta, y para comparar la frecuencia efectiva de control con la frecuencia del dataset (25 FPS).
- Docencia y formacion en robotica con aprendizaje por imitacion: el par modelo + dataset (visualizable en el Space de LeRobot) constituye un ejemplo completo y de tamano manejable para explicar el ciclo observar-grabar-entrenar-desplegar.
- Prototipado de gemelos digitales: las mismas claves de observacion pueden reproducirse en un simulador para evaluar la politica sin riesgo fisico antes de pasarla al robot real.
- Teleoperacion asistida o autonomia compartida: la politica puede ejecutar segmentos de la maniobra mientras un operador supervisa, aprovechando la generacion de bloques de acciones para absorber latencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion vacia, con la nota "No evaluation results have been provided for this policy yet.", y no aporta tasas de exito, numero de ensayos ni comparaciones con otras politicas. Tampoco se proporcionan metricas de latencia, throughput ni consumo de memoria en inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 7,5 GB en bf16 (el repositorio pesa 7,6 GB); sumando el codificador visual, las activaciones de tres imagenes de 480x640 y la cache de atencion, una estimacion razonable es de 12 a 16 GB. No es un dato publicado, sino una estimacion derivada del numero de parametros y del tamano del repositorio.
- GPU recomendadas: RTX 4090 (24 GB), L40S (48 GB), A100 40 GB o H100. Cualquier GPU con 16 GB o mas deberia ser suficiente en bf16 si se limita el tamano de lote de inferencia a 1.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB (RTX 4080/4090, RTX 3090/4090). En GPUs de 8-12 GB requeriria cuantizacion, y no hay cuantizaciones publicadas por el autor.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (PyTorch sobre CUDA). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni ONNX, y estas herramientas no cubren de forma nativa una cabeza de accion de flow matching con salida continua.
- Latencia y throughput: no disponibles. Como referencia de contexto, el dataset se grabo a 25 FPS, pero el autor no publica la frecuencia de control alcanzada ni el tiempo por inferencia.
- Almacenamiento: 7,6 GB solo para los pesos; hay que anadir el dataset (41.614 fotogramas de tres camaras) si se va a reentrenar.

## Comparativa con modelos similares

La comparacion se establece frente a otras politicas VLA de tamano medio ampliamente utilizadas en robotica. Los datos de EO-1 provienen de la model card; los de las alternativas proceden de su documentacion publica y conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Arquitectura | Tipo de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crane_vla_eo-1 (este modelo) | 3,77 B | Qwen2.5-VL + flow matching | Continua (4 dim.) | MIT | Hugging Face, via LeRobot |
| EO-1 (metodo base) | no disponible en la informacion proporcionada | Qwen2.5-VL + flow matching | Continua | no disponible | Paper arXiv:2508.21112 |
| SmolVLA | 0,45 B | VLM compacto + action expert | Continua | Apache 2.0 | Hugging Face, via LeRobot |
| pi0 (openpi) | 3,3 B | PaliGemma + action expert de flow matching | Continua | Apache 2.0 | Hugging Face, via openpi |
| GR00T N1 | 2,2 B | VLM + transformer de difusion | Continua | no disponible | Hugging Face (NVIDIA) |
| OpenVLA | 7 B | Llama-2 + adaptador visual | Discreta (tokens de accion) | no disponible | Hugging Face |

Diferencias clave: este modelo esta ajustado a una unica tarea y un unico robot, mientras que las alternativas citadas son politicas generalistas entrenadas con datos a gran escala (Open X-Embodiment y similares). Por tanto, no son comparables en generalidad, solo en arquitectura y coste de inferencia.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasas de exito, ni numero de ensayos, ni condiciones de prueba, por lo que se desconoce su fiabilidad real incluso en la tarea entrenada.
- Dataset muy reducido: 50 episodios y 41.614 fotogramas para una sola tarea. Es un volumen bajo, con riesgo alto de sobreajuste a posiciones, iluminacion, fondo y disposicion concretas de la escena de grabacion.
- Politica de tarea unica: fuera de "put the barrel on the marked square" el modelo no tiene comportamiento entrenado documentado.
- Acoplamiento fuerte al hardware: espera exactamente tres camaras con los nombres `boom`, `hook` y `cabin`, a 480x640, y un vector de estado de 4 dimensiones; cualquier cambio de configuracion exige reentrenar.
- Espacio de acciones limitado: salida de 4 dimensiones, insuficiente para robots con mas grados de libertad o pinzas adicionales.
- Idiomas: no se declara soporte multilingue; la unica instruccion usada en entrenamiento esta en ingles. No hay evidencia de que el modelo responda correctamente a instrucciones en castellano.
- Contexto y arquitectura interna poco documentados: se desconoce la variante exacta de Qwen2.5-VL, la longitud de contexto y la composicion detallada del dataset mas alla del numero de episodios y fotogramas.
- Riesgo de alucinacion en el sentido roboticista: al ser un modelo generativo de acciones, puede producir trayectorias plausibles pero incorrectas cuando la escena se aleja de la distribucion de entrenamiento, sin ninguna senal de incertidumbre calibrada.
- Licencia MIT: permite uso comercial y modificacion sin restricciones declaradas, pero se distribuye "tal cual", sin garantias; el autor no asume responsabilidad por danos. Conviene verificar la licencia del backbone Qwen2.5-VL para el uso previsto.
- Advertencia de seguridad fisica: es una politica para maquinaria pesada (grua). No debe operarse sin paradas de emergencia, limites de par y supervision humana.
- Metadatos pobres: 0 descargas y 0 likes, sin demo en video ni issues, lo que limita la trazabilidad de su comportamiento en el mundo real.
- La busqueda web realizada no devolvio resultados utiles sobre este modelo: los enlaces recuperados correspondian a contenidos no relacionados (cuestionarios de portada de un buscador), por lo que no aportan informacion tecnica adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grigorij/crane_vla_eo-1
- Dataset de entrenamiento: https://huggingface.co/datasets/Grigorij/crane_vla
- Visualizador del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Grigorij/crane_vla
- Paper EO-1 (arXiv:2508.21112): https://arxiv.org/abs/2508.21112
- Ficha del paper en Hugging Face: https://huggingface.co/papers/2508.21112
- Guia de EO-1 en LeRobot: https://huggingface.co/docs/lerobot/main/en/eo1
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitacion (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
