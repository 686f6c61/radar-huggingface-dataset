# HuskyMango/filter-9-19-libero-90-9-diffusion

## Resumen

HuskyMango/filter-9-19-libero-90-9-diffusion es una politica visuomotora de robotica entrenada con Diffusion Policy, un metodo que trata el control visuomotor como un proceso generativo de difusion. El modelo ha sido entrenado y publicado con LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robotica, y esta pensado para ejecutar tareas de manipulacion a partir de observaciones visuales y del estado del robot.

Se trata de un checkpoint de 266.751.884 parametros (segun el recuento de safetensors), con un repositorio de 1,1 GB, etiquetado con el pipeline `robotics` y asociado al dataset HuskyMango/filter-9-19-libero-90-9. El identificador sugiere un entrenamiento o evaluacion sobre el benchmark LIBERO, aunque la model card no documenta ni la composicion del dataset ni metricas de exito.

Su relevancia es practica: Diffusion Policy produce trayectorias de accion multimodales y suaves, lo que la hace adecuada para manipulacion con contacto fisico (ensamblaje, encaje, empuje de objetos), un escenario donde las politicas deterministas de regresion directa tienden a promediar modos de accion incompatibles. El modelo se distribuye bajo licencia Apache 2.0, sin restricciones declaradas para uso comercial, y se ejecuta con el flujo estandar de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: politica visuomotora generativa que aprende una distribucion condicional sobre secuencias de acciones mediante difusion (tipicamente U-Net temporal 1D de desruido con codificador visual CNN) |
| Parametros totales | 266.751.884 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; emplea horizonte de observacion y horizonte de accion configurables, cuyo valor concreto no esta documentado |
| Tipos de cuantizacion | no disponible; no se documentan variantes GGUF, AWQ, GPTQ ni similares. Los pesos se distribuyen en safetensors |
| Idiomas soportados | no disponible; no es un modelo de lenguaje. La entrada es visual y de estado proprioceptivo, no textual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,1 GB) |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | HuskyMango/filter-9-19-libero-90-9 |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

Diffusion Policy, descrita en el articulo arXiv 2303.04137, modela la generacion de acciones como un proceso de difusion condicionado por observaciones. En lugar de predecir una unica accion mediante regresion, el modelo aprende a invertir un proceso de ruido para producir una secuencia completa de acciones (action chunk), lo que permite representar distribuciones multimodales de comportamiento y genera trayectorias mas suaves que los enfoques de regresion directa. El control se aplica en horizonte recedente: se predice un bloque de acciones, se ejecutan las primeras y se vuelve a planificar con observaciones nuevas. En implementaciones habituales de LeRobot, la politica combina un codificador visual convolucional con una red de desruido temporal sobre el vector de acciones y el estado del robot.

No hay informacion disponible sobre el numero de tokens o episodios de entrenamiento, la composicion exacta del dataset, el numero de pasos de difusion usados en inferencia ni si se aplicaron fases de ajuste posteriores. El dataset referenciado, HuskyMango/filter-9-19-libero-90-9, apunta al entorno de manipulacion LIBERO, pero sus caracteristicas (numero de tareas, episodios, camaras, frecuencia de control) no estan documentadas en la informacion proporcionada. Tampoco se documenta ningun proceso de RLHF ni de optimizacion por preferencias, algo por otra parte no aplicable a este tipo de politica.

## Capacidades

- Control visuomotor para manipulacion robotica: genera secuencias de acciones a partir de imagenes de camara y del estado del robot.
- Modelado multimodal de acciones: al ser un modelo generativo de difusion, puede representar varias estrategias validas para una misma observacion, en lugar de promediarlas.
- Trayectorias suaves y de multiples pasos: adecuado para tareas con contacto fisico y restricciones cinematicas.
- Control en bucle cerrado mediante horizonte recedente: reacciona a cambios en la escena entre ejecuciones del bloque de acciones.
- Compatibilidad nativa con LeRobot: entrenamiento, evaluacion y registro de episodios mediante las herramientas `lerobot-train` y `lerobot-record`.
- Aprendizaje por imitacion: se entrena a partir de demostraciones teleoperadas, sin necesidad de definir recompensas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales ni instrucciones en lenguaje natural.
- No dispone de capacidades multilingues, de vision general (VQA, OCR, deteccion abierta) ni de audio. La vision se usa exclusivamente como entrada de control.

## Casos de uso

- Manipulacion con contacto rico en investigacion: ensamblaje de piezas, insercion de conectores o encaje de objetos, donde la generacion de trayectorias multimodales evita que el robot se atasque promediando movimientos incompatibles.
- Pick-and-place en entornos de laboratorio: el modelo recibe imagenes de camara y estado del efector y produce bloques de acciones que se ejecutan en bucle cerrado, lo que permite corregir desviaciones durante la tarea.
- Evaluacion comparativa sobre LIBERO: al estar vinculado al dataset filter-9-19-libero-90-9, sirve como checkpoint de referencia para reproducir experimentos y comparar variantes de Diffusion Policy dentro del mismo entorno de simulacion.
- Base para ajuste fino con datos propios: partiendo de este checkpoint, un equipo puede reentrenar con demostraciones de su propio robot usando `lerobot-train`, reduciendo el coste frente a entrenar desde cero.
- Transferencia sim-a-real en robotica de bajo coste: el modelo es lo bastante pequeno (266 M de parametros, 1,1 GB) para ejecutarse en una GPU de consumo o en el ordenador conectado a un brazo tipo SO-100/SO-101.
- Recoleccion y anotacion de datos: empleando `lerobot-record` con `--policy.path` apuntando a este checkpoint, se pueden generar episodios de evaluacion etiquetados con el prefijo `eval_` para medir la politica en el robot real.
- Demostraciones de investigacion y docencia: como ejemplo reproducible de aprendizaje por imitacion con modelos generativos, util en cursos y talleres sobre robotica y modelos de difusion.
- Prototipado rapido de tareas de manipulacion domesticas o de almacen: apilar objetos, abrir contenedores o colocar piezas en bandejas, siempre que existan demostraciones representativas del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El identificador del modelo incluye la cadena `libero-90-9`, que apunta al benchmark LIBERO y a un posible subconjunto o porcentaje asociado, pero la model card no incluye ninguna tabla de metricas, tasas de exito ni comparaciones numericas. No se deben asumir cifras de rendimiento a partir del nombre del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB solo para los pesos en precision de 32 bits (mas 0,5-0,6 GB en 16 bits). Sumando activaciones del codificador visual y de la red de desruido con varias camaras, el consumo realista se situa en el rango de 2 a 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Para entrenamiento o ajuste fino se recomienda una GPU de 16 GB o mas (RTX 4080/4090, A100, H100), dependiendo del tamano de lote y del numero de camaras.
- Cabe en GPU de consumo: si. Ejemplos habituales son RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090. Tambien es viable su ejecucion en CPU para inferencia, aunque con latencias mayores.
- Opciones de despliegue: LeRobot (comandos `lerobot-record` y utilidades de evaluacion) sobre PyTorch, con pesos descargados del Hub o cargados en local. No aplica soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de desruido configurados, de la resolucion de imagen, del numero de camaras y de si se ejecuta en GPU o en CPU; ninguno de estos parametros esta documentado en la informacion proporcionada.
- Almacenamiento: 1,1 GB para el repositorio de pesos, mas el espacio de los checkpoints intermedios si se reentrena.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HuskyMango/filter-9-19-libero-90-9-diffusion | 266.751.884 | no disponible | Difusion sobre secuencias de acciones | apache-2.0 | Hugging Face (lerobot), 0 descargas |
| ACT (Action Chunking Transformer), implementado en LeRobot | no disponible | no disponible | Transformer que predice bloques de acciones | no disponible | Hugging Face / LeRobot |
| SmolVLA (Hugging Face) | no disponible | no disponible | Vision-language-action de menor tamano, condicionado por instrucciones de lenguaje | no disponible | Hugging Face / LeRobot |
| Diffusion Policy original (referencia del paper) | no disponible | no disponible | Difusion sobre secuencias de acciones con U-Net temporal | no disponible | Codigo en el repositorio de los autores |

No se dispone de datos suficientes para comparar el rendimiento numerico de este checkpoint con el de las alternativas. La diferencia funcional mas relevante es que ACT y las politicas basadas en transformers predicen acciones de forma directa, mientras que Diffusion Policy genera la secuencia mediante difusion, lo que favorece tareas con multimodalidad de acciones y contacto fisico. SmolVLA y otras politicas vision-language-action aceptan instrucciones en lenguaje natural, algo que este modelo no soporta.

## Limitaciones y advertencias

- Alcance muy restringido: es una politica entrenada para un conjunto concreto de tareas y un robot concreto. Fuera de esa distribucion de observaciones y acciones, el comportamiento no esta garantizado.
- Sesgo de los datos de demostracion: el modelo reproduce las trayectorias de quien teleopero el dataset, incluidas sus preferencias, velocidades y errores. Si las demostraciones son escasas o poco variadas, la politica generaliza mal.
- Riesgo de fallo silencioso: la difusion genera trayectorias plausibles aunque la observacion sea ambigua, por lo que puede producir movimientos seguros en apariencia pero incorrectos respecto a la tarea real. Es imprescindible validar con paradas de emergencia y limites de par.
- Ausencia de metricas publicadas: no hay tasas de exito ni evaluaciones independientes. Cero descargas y cero likes en el momento de redactar esta ficha implican que el modelo no ha sido validado por terceros.
- Sin soporte de lenguaje: no acepta instrucciones textuales ni tool calling, por lo que no puede integrarse directamente en agentes conversacionales ni en pipelines que esperen una interfaz de texto.
- Sin capacidades generales de vision: aunque consume imagenes, no realiza descripcion, deteccion abierta ni razonamiento visual.
- Ambiguedad del identificador: la cadena `libero-90-9` no esta explicada en la model card; no debe interpretarse como un porcentaje de exito ni como un subconjunto de tareas confirmado.
- Trazabilidad limitada: la model card no documenta hiperparametros, horizonte de accion, resolucion de imagen, numero de pasos de difusion ni composicion del dataset, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se ofrece ninguna garantia. Al tratarse de un sistema que controla hardware fisico, la responsabilidad de la validacion de seguridad recae por completo en quien lo despliega.
- Sin informacion sobre cuantizacion: no hay variantes de pesos comprimidos, de modo que las optimizaciones de memoria deben hacerse a mano (por ejemplo, conversion a 16 bits) y verificarse experimentalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuskyMango/filter-9-19-libero-90-9-diffusion
- Dataset asociado: https://huggingface.co/datasets/HuskyMango/filter-9-19-libero-90-9
- Paper de Diffusion Policy (pagina de Hugging Face): https://huggingface.co/papers/2303.04137
- Paper de Diffusion Policy (arXiv 2303.04137): https://arxiv.org/abs/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo ni con Diffusion Policy; los enlaces recuperados correspondian a paginas de soporte no pertinentes y se han omitido.
