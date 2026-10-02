# dkim1990/cnn-transformer-experiment

## Resumen

El modelo `dkim1990/cnn-transformer-experiment` es una implementacion experimental de una arquitectura hibrida CNN-Transformer orientada a tareas de *matching* (emparejamiento de pares de entradas, tipicamente texto o secuencias). Lo publica el usuario dkim1990 en HuggingFace y se distribuye como un punto de partida reproducible, no como un modelo entrenado. El repositorio incluye el codigo Python de definicion del modelo y un ejemplo ejecutable, un `config.json` con los ajustes de arquitectura generados, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que es unicamente un checkpoint de inicializacion valido para pruebas de humo (*smoke tests*).

El dato mas relevante para evaluarlo es su tamano: 16.576 parametros totales segun el fichero safetensors. Se trata, por tanto, de una implementacion de escala minima, pensada para validar que el grafo de computacion se construye y ejecuta correctamente, no para obtener resultados competitivos en ninguna tarea. La model card es explicita al respecto: no se reclama ninguna puntuacion de benchmark, el checkpoint no ha sido entrenado ni auditado, y los valores de la receta de experimento (optimizador LAMB con schedule exponencial) son valores de partida del script, no evidencia de un entrenamiento completado.

Su relevancia actual es la de un artefacto de investigacion reutilizable: sirve como esqueleto para reproducir experimentos de arquitecturas hibridas con atencion dilatada y fusion por co-atencion, y como recordatorio metodologico de buenas practicas de evaluacion (conjunto de validacion emparejado, al menos tres semillas, baseline de capacidad equivalente). No es un modelo de proposito general ni compite con modelos de lenguaje publicados. El repositorio ocupa 0,0 GB y ha acumulado 11 descargas y 0 likes desde su creacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida convolucional-transformer); atencion dilatada; fusion por co-atencion; activacion approx gelu; normalizacion layernorm |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion); incluye `config.json` y `training_args.json` |
| Escala declarada | small |
| Pipeline de HuggingFace | no disponible |
| Tarea declarada | matching (emparejamiento) |
| Optimizador de la receta por defecto | LAMB con schedule exponencial |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion (metadatos) | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como un "Cnn Transformer" de escala *small*, con atencion dilatada (*dilated attention*), fusion mediante co-atencion (*co attention*), funcion de activacion approx gelu y normalizacion layernorm. No se especifican en la informacion disponible el numero de capas, las dimensiones de los embeddings, el numero de cabezas de atencion, los factores de dilatacion ni la composicion exacta de los bloques convolucionales y de atencion; la organizacion interna del grafo, por tanto, es "no disponible". El unico dato cuantitativo verificable es el recuento de parametros del checkpoint safetensors: 16.576.

En cuanto al entrenamiento, no hay ningun entrenamiento documentado. La model card indica explicitamente que `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo y que no se presenta como un checkpoint entrenado con benchmark. La receta de experimento incluida usa el optimizador LAMB con un schedule de tipo exponencial, pero el autor aclara que son valores de partida del script y no evidencia de una ejecucion completada. No se documentan volumen de tokens, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se describe ninguna innovacion tecnica validada experimentalmente; la combinacion de atencion dilatada y co-atencion es una eleccion de diseno, no un resultado. Como guia de evaluacion, el autor propone usar un conjunto de validacion emparejado, reportar la metrica de la tarea en al menos tres semillas e incluir un baseline de capacidad equivalente, conservando los logs de entrenamiento y las versiones del entorno.

## Capacidades

- Ejecucion de un grafo CNN-Transformer de escala minima para tareas de *matching*: el checkpoint permite instanciar el modelo y ejecutar el ejemplo de prueba incluido en el script.
- Pruebas de humo (*smoke tests*): validacion de que el pipeline de carga, el forward pass y la forma de las salidas son correctos antes de escalar a un entrenamiento real.
- Base de codigo reproducible: incluye `predict.py` con bloque `__main__`, `config.json` con los ajustes de arquitectura y `training_args.json` con la receta por defecto.
- Generacion de texto: no disponible; no hay evidencia de que el modelo este entrenado para generacion.
- Razonamiento, codigo o matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible.
- Integracion con APIs genericas de carga automatica: la model card advierte de que, al ser una implementacion personalizada, las APIs automaticas requieren un adaptador explicito antes de su uso.

## Casos de uso

- Pruebas de humo en pipelines de investigacion: usar el checkpoint de inicializacion para verificar que el codigo de carga de safetensors, la construccion del grafo y el forward pass funcionan en el entorno objetivo antes de lanzar un entrenamiento costoso.
- Reproducibilidad de experimentos de arquitectura: el repositorio fija `config.json` y `training_args.json`, de modo que un grupo de investigacion puede clonar exactamente la configuracion declarada y estudiar el efecto de variar la atencion dilatada o la co-atencion.
- Desarrollo de baselines de *matching*: sirve como punto de partida para construir un baseline de capacidad minima con el que comparar modelos de emparejamiento mas grandes, siguiendo la recomendacion del propio autor de incluir un baseline de capacidad equivalente.
- Docencia y formacion: por su tamano (16.576 parametros) es adecuado para explicar en un aula como se compone un bloque hibrido convolucional-transformer y como se serializa un modelo en safetensors.
- Validacion de infraestructura de entrenamiento: al ser trivial de ejecutar, permite comprobar que el *dataloader*, el bucle de entrenamiento, el registro de metricas y el guardado de checkpoints funcionan correctamente antes de escalar.
- Pruebas de integracion en servicios de inferencia: dado su tamano minimo, se puede desplegar como *canary* para verificar que un servidor de inferencia (por ejemplo, un contenedor propio) arranca, carga pesos y responde, sin consumir recursos de GPU relevantes.
- Estudio de estrategias de evaluacion: el propio autor propone emplearlo como caso para practicar una evaluacion correcta con conjunto de validacion emparejado, tres semillas y baseline de capacidad equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark y que el checkpoint no ha sido entrenado. Por tanto, no existen valores de MMLU, HumanEval, GSM8K ni de ninguna metrica de *matching* que puedan tabularse.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16.576 parametros, el checkpoint en precision de 32 bits ocupa del orden de 66 KB de pesos (16.576 x 4 bytes), mas el coste de activaciones de un *batch* pequeno. Cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) es mas que suficiente; tambien es viable la ejecucion en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual, y en la practica tambien en CPU sin problema de memoria.
- Opciones de despliegue: al ser una implementacion personalizada con co-atencion y atencion dilatada, los motores estandar (vLLM, TGI, llama.cpp, Ollama) no soportan esta arquitectura de forma nativa; el despliegue pasa por ejecutar el propio script Python (`predict.py`) o envolverlo en un servicio propio. Cualquier intento de usar una API de carga generica requiere un adaptador explicito, tal como advierte la model card.
- Latencia y throughput estimados: no disponibles. Al no existir un modelo entrenado ni un conjunto de evaluacion, no se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No disponible. Se trata de una implementacion experimental con licencia Apache 2.0, 16.576 parametros y sin checkpoint entrenado; no se han identificado en la informacion proporcionada modelos comparables de la misma categoria (arquitecturas hibridas CNN-Transformer para *matching*) con los que establecer una comparacion de parametros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicializacion, no un modelo entrenado: sus salidas no tienen valor predictivo.
- No ha sido auditado en robustez, equidad (*fairness*) ni transferencia de dominio, tal como reconoce el propio autor.
- No se documentan sesgos conocidos, pero tampoco se ha realizado ninguna evaluacion de sesgo, por lo que no puede afirmarse su ausencia.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que no es un modelo de lenguaje generativo ni esta entrenado; cualquier salida debe considerarse no fiable.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni cobertura linguistica.
- Restricciones de licencia: los pesos y el codigo se publican bajo Apache 2.0, lo que permite uso comercial y modificacion. No obstante, si el repositorio se usa con conjuntos de datos externos, deben revisarse por separado los terminos de esos datos de origen, advertencia que figura en la model card.
- Caveat para produccion: no debe desplegarse en produccion como componente funcional. Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto que se distribuyen aqui.
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos resultados obtenidos no guardan ninguna relacion con el artefacto analizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dkim1990/cnn-transformer-experiment
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo adicional: no disponible (el codigo se distribuye dentro del propio repositorio de HuggingFace: `predict.py`, `config.json`, `training_args.json`)
- Demo: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio ninguna fuente relacionada con el modelo)
