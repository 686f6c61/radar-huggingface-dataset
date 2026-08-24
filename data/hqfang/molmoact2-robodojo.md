# hqfang/MolmoAct2-RoboDojo

## Resumen

MolmoAct2-RoboDojo es un modelo de visión-lenguaje-acción (VLA) desarrollado por hqfang como un checkpoint de fine-tuning sobre el modelo base MolmoAct2 de AllenAI. Está diseñado específicamente para el control robótico bimanual en el benchmark RoboDojo, donde predice secuencias de acciones articulares absolutas a partir de tres cámaras RGB, el estado del robot y una instrucción en lenguaje natural. El modelo combina un backbone VLM (Molmo2-ER) con un experto de acciones continuas basado en flow-matching, conectado al cache de clave-valor del VLM mediante una conexión por capa.

Con 5.447 millones de parámetros, este checkpoint de 90.000 pasos de entrenamiento está pensado tanto para inferencia directa en robots de doble brazo (ARX X5) como para fine-tuning adicional en tareas robóticas específicas. Su relevancia radica en que es un modelo abierto que permite reproducir y estudiar políticas de manipulación bimanual con razonamiento espacial, un área de creciente interés en robótica e IA. El modelo se distribuye en formato safetensors y requiere código personalizado (trust_remote_code) para su uso con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (Molmo2-ER) con experto de acciones continuas flow-matching |
| Parametros totales | 5.447.411.422 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32, bfloat16 (mencionados en la documentacion) |
| Idiomas soportados | no disponibles (ejemplos en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MolmoAct2-RoboDojo se construye sobre el backbone Molmo2-ER, un VLM especializado en razonamiento espacial y encarnado, entrenado sobre un corpus de 3,3 millones de muestras con una receta "specialize-then-rehearse" segun el paper arXiv:2605.02881. Sobre este backbone se anade un experto de acciones continuas que utiliza flow-matching para generar secuencias de acciones. La conexion entre el VLM y el experto de acciones se realiza mediante una conexion por capa que condiciona el experto al cache de clave-valor del VLM, permitiendo que el modelo combine comprension visual y linguistica con generacion de acciones motoras.

El checkpoint concreto se ha fine-tuneado durante 90.000 pasos en el conjunto de entrenamiento de RoboDojo, utilizando control de pose articular absoluta (14 dimensiones) e instrucciones en lenguaje natural. El modelo predice chunks de acciones de 25 pasos. El modo de inferencia recomendado es el de acciones continuas, aunque tambien se expone un modo discreto para propositos de depuracion y paridad. La normalizacion de los datos del dataset se almacena en `norm_stats.json` y debe pasarse el tag `norm_tag="robodojo"` en inferencia.

## Capacidades

- Control robotico bimanual: predice acciones articulares absolutas de 14 dimensiones para dos brazos, con chunks de 25 pasos.
- Entrada multimodal: procesa tres imagenes RGB (camara alta, muneca izquierda, muneca derecha) junto con el estado del robot (14D) y una instruccion de tarea en lenguaje natural.
- Razonamiento espacial y encarnado: hereda las capacidades del backbone Molmo2-ER para comprender relaciones espaciales y planificar acciones.
- Modo de accion continua: utiliza flow-matching para generar trayectorias suaves, recomendado para inferencia.
- Modo de accion discreto: disponible para depuracion y comparacion, aunque no es el modo principal.
- Fine-tuning adicional: el checkpoint esta disenado para ser re-entrenado en tareas roboticas especificas.
- Normalizacion de lenguaje: opcion `normalize_language=True` (por defecto) que normaliza las instrucciones para coincidir con el formato de entrenamiento.

## Casos de uso

- Manipulacion bimanual en entornos de investigacion: el modelo puede controlar robots de doble brazo en el benchmark RoboDojo, ejecutando tareas como organizar objetos o ensamblar piezas, gracias a su prediccion de acciones articulares absolutas.
- Aprendizaje por imitacion: investigadores pueden usar este checkpoint como punto de partida para fine-tuning en nuevos datasets de demostraciones, aprovechando el conocimiento previo de manipulacion.
- Evaluacion de politicas de control: permite comparar el rendimiento de diferentes arquitecturas VLA en tareas estandarizadas de RoboDojo, con una metrica comun de exito.
- Desarrollo de sistemas de control basados en lenguaje: el modelo traduce instrucciones en lenguaje natural a secuencias de acciones motoras, util para interfaces humano-robot.
- Investigacion en VLA: sirve como referencia abierta para estudiar la integracion de modelos de lenguaje y vision con control motor, incluyendo el uso de flow-matching para generacion de acciones.
- Benchmarking de hardware roboticos: al ser un modelo con requisitos de memoria conocidos, puede usarse para evaluar el rendimiento de diferentes GPUs en cargas de trabajo de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper arXiv:2605.02881 puede contener evaluaciones comparativas, pero no se incluyen en la documentacion del modelo ni en los resultados de busqueda proporcionados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 26 GB en float32 con CUDA graph habilitado, 24 GB sin el; menos de 16 GB en bfloat16.
- GPU recomendadas: para bfloat16, una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100, H100). Para float32, se recomienda al menos 24 GB de VRAM.
- Compatibilidad con GPU de consumo: si, con bfloat16 puede ejecutarse en GPUs como la RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con margen limitado.
- Opciones de despliegue: el ejemplo oficial usa transformers con `AutoModelForImageTextToText` y `AutoProcessor`, con soporte para CUDA graph. No se mencionan vLLM, llama.cpp u otras herramientas.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa con modelos similares. El modelo base MolmoAct2 de AllenAI es el punto de referencia natural, pero no se han proporcionado especificaciones detalladas del mismo en la informacion disponible. Otros modelos VLA como RT-2 o OpenVLA podrian ser comparables, pero no se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial y redistribucion.
- Especializacion en RoboDojo: el modelo esta fine-tuneado para el benchmark RoboDojo y puede no generalizar bien a otros entornos o robots sin fine-tuning adicional.
- Requisitos de hardware: la inferencia en float32 requiere al menos 24 GB de VRAM, lo que limita su uso en equipos de gama media.
- Riesgo de alucinacion en acciones: como cualquier modelo generativo, puede producir acciones incorrectas o irreales si se usa fuera de su distribucion de entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados; los ejemplos estan en ingles, por lo que el rendimiento en otros idiomas es incierto.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor, con los riesgos de seguridad asociados.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos potenciales del modelo en cuanto a genero, raza u otros factores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hqfang/MolmoAct2-RoboDojo
- Repositorio oficial de MolmoAct2: https://github.com/allenai/molmoact2
- Paper arXiv: https://arxiv.org/abs/2605.02881
- Blog de AllenAI sobre MolmoAct2: https://allenai.org/blog/molmoact2
- Benchmark RoboDojo: https://github.com/RoboDojo-Benchmark/RoboDojo
