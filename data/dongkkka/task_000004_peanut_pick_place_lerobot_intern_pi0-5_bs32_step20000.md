# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_Pi0.5_bs32_step20000

## Resumen

Este repositorio contiene un checkpoint de inferencia de LeRobot 0.6.1 correspondiente a una política robótica PI0.5, entrenada por el usuario Dongkkka para una tarea concreta de manipulación: recoger y colocar cacahuetes (*peanut pick and place*). No es un modelo de lenguaje: es una política de visión-lenguaje-acción (VLA) orientada al control de un robot, con entradas de tres cámaras y vectores de estado/acción de 22 dimensiones. El checkpoint se guardó en el paso 20.000 con un tamaño de lote de 32, sobre los 35 episodios completos del dataset `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern`.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) almacenados en safetensors, con un repositorio de 9,4 GB. Se publica únicamente el material necesario para inferencia: los estados del optimizador, del scheduler y del generador de números aleatorios permanecen en el checkpoint de entrenamiento local del autor y no están disponibles. Esto lo convierte en un artefacto pensado para desplegar o evaluar la política, no para continuar el entrenamiento desde este repositorio.

Su relevancia es doble. Por un lado, documenta un flujo de trabajo reproducible de *fine-tuning* de una política VLA sobre un dataset propio de LeRobot, algo habitual en laboratorios de robótica que quieren adaptar modelos fundacionales a tareas específicas. Por otro, incluye una métrica de diagnóstico en bucle abierto (MAE y RMSE sobre la primera acción predicha) que, aunque calculada sobre un episodio de entrenamiento, permite comparar rápidamente variantes de entrenamiento entre sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El tag `pi05` apunta a la familia PI0.5 (política visión-lenguaje-acción), pero la model card no documenta la arquitectura interna |
| Parámetros totales | 4.143.404.816 (≈ 4,14 mil millones) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (modelo de acción, no de texto; el horizonte de acción declarado es de 50 pasos) |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors sin cuantización documentada |
| Idiomas soportados | No disponible. No se documenta el idioma de las instrucciones de condicionamiento |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Biblioteca y versión | LeRobot 0.6.1 |
| Pipeline | `robotics` |
| Paso de entrenamiento | 20.000 |
| Tamaño de lote | 32 |
| Cámaras de entrada | `cam_left_head`, `cam_left_wrist`, `cam_right_wrist` |
| Dimensiones de estado / acción | 22 / 22 |
| Chunk de acción / acciones ejecutadas por defecto | 50 / 50 |
| Normalización estado-acción | MEAN_STD |
| Tamaño del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo único que se puede afirmar con los datos proporcionados es que se trata de un checkpoint de inferencia de LeRobot 0.6.1 etiquetado como `pi05` y con `pipeline_tag: robotics`, es decir, una política que consume observaciones multimodales (tres flujos de cámara más un vector de estado de 22 dimensiones) y produce vectores de acción de 22 dimensiones. El horizonte de predicción es un *chunk* de 50 acciones, de las cuales se ejecutan las 50 por defecto antes de volver a planificar. La normalización de estados y acciones se realiza con media y desviación estándar (MEAN_STD), un detalle relevante porque implica que cualquier despliegue debe cargar el preprocesador y el postprocesador guardados junto al modelo.

En cuanto al entrenamiento, los datos disponibles son escasos pero concretos: se usaron los 35 episodios del dataset `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern` en la revisión `05286a17a145234ed80870702f4d9757f00194c3`, con un tamaño de lote de 32 y 20.000 pasos de optimización. No se documentan el número total de tokens o *frames* vistos, la composición del dataset, ni si hubo etapas de ajuste por refuerzo, DPO o *reward modeling*. Tampoco se documenta ninguna innovación técnica específica de esta ejecución (decodificación especulativa, atención lineal, destilación, etc.). El autor indica explícitamente que solo se publican archivos de inferencia.

## Capacidades

- Control robótico de manipulación para una tarea específica: recogida y colocación de cacahuetes (*pick and place*), definida por el dataset de entrenamiento.
- Fusión de tres cámaras: una vista cenital o de cabeza (`cam_left_head`) y dos vistas de muñeca (`cam_left_wrist`, `cam_right_wrist`), lo que permite condicionar la acción tanto en la escena global como en la zona de agarre.
- Entrada de estado propioceptivo de 22 dimensiones y salida de acción de 22 dimensiones, compatible con configuraciones bimanuales o de alta dimensionalidad.
- Predicción de secuencias de acción (*action chunking*) de 50 pasos, con ejecución de los 50 por defecto, lo que reduce la frecuencia de replanificación.
- Servicio de inferencia autocontenido: incluye preprocesador y postprocesador, de modo que el pipeline completo de normalización MEAN_STD se aplica desde el propio repositorio.
- No dispone de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente, razonamiento multi-paso simbólico ni planificación de tareas general.
- No se documentan capacidades multilingües. El condicionamiento por lenguaje natural no está confirmado en la información disponible.
- No se documentan modos especiales (modo de razonamiento, visión para descripción, audio, etc.).

## Casos de uso

- Despliegue de una política *pick and place* en un banco de laboratorio: el checkpoint se carga con LeRobot 0.6.1, se conectan las tres cámaras documentadas y el robot ejecuta la tarea con *chunks* de 50 acciones. Es adecuado porque el autor ha publicado exactamente los artefactos necesarios para inferencia.
- Evaluación comparativa de recetas de entrenamiento: al ser un checkpoint intermedio (paso 20.000, lote 32), sirve como referencia frente a otros pasos o tamaños de lote del mismo experimento, usando la métrica de bucle abierto incluida como criterio rápido.
- Base para *fine-tuning* adicional sobre una tarea de manipulación similar: aunque no se publican estados de optimizador, los pesos sirven como inicialización para reentrenar con otro dataset de LeRobot, algo útil cuando se quieren reutilizar representaciones visuales ya adaptadas al dominio.
- Recolección y depuración de datasets robóticos: sirve para validar que un pipeline de LeRobot (cámaras, dimensiones de estado/acción, normalización MEAN_STD, chunking) está bien configurado antes de escalar la recogida de datos.
- Docencia y demostración de flujos VLA en robótica: permite ilustrar de principio a fin cómo se entrena y se publica una política de acción con LeRobot, incluyendo la separación entre checkpoint de entrenamiento y checkpoint de inferencia.
- Investigación en *benchmarking* de políticas: la métrica MAE/RMSE sobre la primera acción predicha ofrece un protocolo sencillo y reproducible para comparar variantes dentro del mismo hardware y dataset.
- Pruebas de integración de sistemas robóticos: el repositorio permite medir latencia, consumo de VRAM y estabilidad de inferencia con un modelo de 4,14 mil millones de parámetros antes de comprometerse con políticas más grandes.

## Benchmarks y rendimiento

El autor publica una única evaluación, de bucle abierto (*open-loop*), sobre la primera acción predicha, calculada sobre 100 fotogramas muestreados uniformemente del episodio 5 del dataset de entrenamiento, en unidades de acción originales:

| Métrica | Valor | Condiciones |
|---|---|---|
| MAE (primera acción, bucle abierto) | 0,00318236 | 100 fotogramas del episodio 5, en unidades de acción originales |
| RMSE (primera acción, bucle abierto) | 0,00878476 | 100 fotogramas del episodio 5, en unidades de acción originales |

Advertencia importante señalada por el propio autor: el episodio 5 forma parte del conjunto de entrenamiento, por lo que estas cifras constituyen un diagnóstico sobre datos vistos y no una validación sobre datos retenidos ni un resultado de despliegue en robot real. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ni comparaciones con otras políticas en la información disponible. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de 16 bits: los 4.143.404.816 parámetros ocupan aproximadamente 8,3 GB de pesos, más el coste de los codificadores de visión, las activaciones y los *buffers* de las tres cámaras. Un presupuesto realista de partida es de 12 a 16 GB, aunque no hay mediciones publicadas.
- VRAM estimada en precisión de 32 bits: en torno a 16,6 GB solo en pesos, por lo que se necesitarían tarjetas de 24 GB o superiores.
- GPU recomendadas: para 16 bits, tarjetas de 24 GB como la RTX 4090 o la RTX 3090 son la opción *consumer* más razonable; en el lado profesional, A100 (40/80 GB), H100 o L40S ofrecen margen para aumentar el tamaño de lote o procesar varias cámaras en paralelo.
- ¿Cabe en GPU de consumo? Muy probablemente sí en RTX 4090 y RTX 3090 (24 GB). En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el margen es ajustado y no está confirmado. En tarjetas de 8-12 GB no hay datos que permitan afirmarlo.
- Opciones de despliegue: el repositorio está pensado para el *runtime* de LeRobot 0.6.1 sobre PyTorch y debe cargarse con el preprocesador y postprocesador incluidos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (política de acción, no LLM de texto) no son las vías habituales.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de frecuencia de inferencia ni de tiempo por *chunk* de 50 acciones.
- Almacenamiento: el repositorio ocupa 9,4 GB, cantidad a tener en cuenta si se van a mantener varias versiones de checkpoint en el mismo equipo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada para este checkpoint. La model card no incluye comparaciones con otras políticas, y la búsqueda web no devolvió resultados relevantes. La siguiente tabla recoge únicamente lo que se puede afirmar con la información disponible, dejando el resto como no disponible.

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (Peanut Pick and Place, PI0.5) | 4,14 mil millones | 50 acciones por *chunk*; contexto de texto no disponible | No disponible | Repositorio de HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Otros checkpoints de la familia PI0.5 | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Otras políticas VLA de la biblioteca LeRobot | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

Cualquier comparación numérica con alternativas como OpenVLA, SmolVLA o los modelos base de Physical Intelligence requeriría datos que no se han proporcionado en esta ficha.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada sobre un único dataset de 35 episodios y una única tarea (*peanut pick and place*). No se puede esperar generalización a otras tareas, objetos o entornos sin reentrenamiento.
- Métrica de evaluación no concluyente: el MAE y el RMSE publicados se calculan sobre el episodio 5, que forma parte del conjunto de entrenamiento. El propio autor lo califica de diagnóstico, no de validación sobre datos retenidos ni de prueba en robot real. No hay evidencia publicada de éxito en ejecución real.
- Riesgo de sobreajuste: 20.000 pasos sobre 35 episodios es un régimen que puede favorecer la memorización de las trayectorias del dataset. El error bajo en datos vistos es compatible tanto con un buen ajuste como con sobreajuste.
- Licencia no disponible: al no declararse licencia, no hay autorización explícita para uso comercial. Conviene contactar con el autor antes de cualquier uso productivo.
- Idiomas no disponibles: no se documenta el idioma del condicionamiento por lenguaje natural, si es que el modelo lo usa. No se puede asumir soporte multilingüe.
- Sesgos: no hay información sobre la diversidad de condiciones de iluminación, posiciones iniciales, texturas o configuraciones de robot en el dataset, por lo que se desconoce el sesgo de dominio. Un sesgo habitual en datasets pequeños de demostración es la sobrerrepresentación de una única distribución de posiciones iniciales.
- Sin estados de optimizador ni de scheduler: no es posible reanudar el entrenamiento tal cual desde este repositorio; solo sirve para inferencia o como inicialización de un entrenamiento nuevo.
- Dependencia de la versión: el checkpoint está asociado a LeRobot 0.6.1 y a la normalización MEAN_STD. Cargarlo con versiones distintas de la biblioteca o sin el preprocesador y postprocesador originales puede producir acciones incorrectas de forma silenciosa.
- Configuración rígida: las cámaras, las dimensiones 22/22 y el *chunk* de 50 son parte de la definición del modelo. Cambiar cualquiera de estos elementos invalida el checkpoint.
- Sin métricas de producción: no hay datos publicados de latencia, throughput, tasa de éxito en robot real ni comportamiento ante fallos, por lo que no se puede dimensionar un despliegue en producción con la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_Pi0.5_bs32_step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern
- Revisión del dataset usada en el entrenamiento: `05286a17a145234ed80870702f4d9757f00194c3`
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos correspondían a páginas sobre errores de DLL en Windows, sin relación con el modelo.
