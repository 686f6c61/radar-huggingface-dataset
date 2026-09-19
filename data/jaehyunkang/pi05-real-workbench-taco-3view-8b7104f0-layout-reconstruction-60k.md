# jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-layout-reconstruction-60k

## Resumen

Pi05 Real Workbench — taco-3view-8b7104f0-layout-reconstruction-60k es un checkpoint final de un modelo de politica vision-lenguaje-accion (VLA) entrenado mediante fine-tuning sobre lerobot/pi05_base. Lo publica el usuario jaehyunkang y esta especializado en una unica tarea de robotica: la reconstruccion de disposiciones (layout_reconstruction) sobre un banco de trabajo real. El modelo consume tres vistas de camara (exterior, muneca y una imagen de keyframe) y produce acciones de efector final en espacio delta, no texto.

El artefacto contiene 4.143.404.816 parametros (~4,14 B) en formato safetensors, con un repositorio de 9,4 GB que incluye pesos, configuracion de politica y estados de normalizacion. El entrenamiento se detuvo a los 60.000 pasos de optimizacion con un batch global de 32 y 2 GPU, sobre el dataset Myungkyu/real_workbench-taco-keyframe-gemini. La libreria declarada es lerobot y la implementacion de entrenamiento es RLWRLD/hiwrld-ll-policy, una version vendorizada de LeRobot Pi0.5.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un fine-tuning VLA sobre hardware modesto (2 GPU) para una tarea industrial concreta, e ilustra el flujo de trabajo de Pi0.5 en LeRobot (action chunking, decodificacion por denoising, condicionamiento por subtarea en texto). No es un modelo de proposito general ni un modelo conversacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica VLA (vision-lenguaje-accion) derivada de Pi0.5; backbone de tokens basado en PaliGemma (referencia de tokenizer google/paligemma-3b-pt-224) con experto de acciones y decodificacion por denoising (flow matching) |
| Parametros totales | 4.143.404.816 (~4,14 B), segun safetensors |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio distribuye unicamente safetensors (no se incluyen GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (el condicionamiento textual se realiza con subtareas por fotograma del dataset, no con lenguaje natural libre) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano de repositorio 9,4 GB) |

## Arquitectura y entrenamiento

Se trata de una politica de manipulacion construida sobre Pi0.5 (lerobot/pi05_base). La referencia de tokenizer apunta a google/paligemma-3b-pt-224 (revision 35e4f46485b4d07967e7e9935bc3786aad50687c), lo que sitúa el componente vision-lenguaje en la familia PaliGemma. La generacion de acciones no es autorregresiva token a token: el modelo emplea un experto de acciones con decodificacion iterativa (denoising) de 10 pasos en inferencia y devuelve un chunk de 50 acciones, con un horizonte de ejecucion de 50. El estado de entrada tiene 8 dimensiones y la accion de salida es delta EEF de 7 dimensiones (6 de velocidad cartesiana mas pinza).

El entrenamiento consistio en un fine-tuning supervisado de 60.000 pasos de optimizacion, con batch global 32, 2 GPU y semilla 42, sobre el dataset Myungkyu/real_workbench-taco-keyframe-gemini, limitado a la tarea layout_reconstruction. Las instrucciones se toman como subtareas por fotograma almacenadas en parquet. Las imagenes se guardan a 224x126 y la politica las rellena (padding) hasta 224x224. Se emplean tres vistas: exterior, muneca y observation.image.keyframe. No se declara en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion; tampoco se documenta el numero total de tokens o episodios vistos.

## Capacidades

- Generacion de acciones de manipulacion robótica: produce chunk de 50 acciones delta EEF de 7 dimensiones (6 de velocidad cartesiana mas pinza) a partir de observaciones visuales y estado de 8 dimensiones.
- Condicionamiento por tarea: acepta como texto de tarea el subtask por fotograma definido en el dataset; en modelos de subtarea debe suministrarse el subtask correspondiente.
- Entrada multivista: consume tres vistas simultaneas (exterior, muneca y keyframe), lo que aporta informacion de zonas ocluidas por la propia pinza.
- Reconstruccion de disposiciones: tarea objetivo declarada (layout_reconstruction) sobre un banco de trabajo real.
- Ejecucion con action chunking: inferencia con 10 pasos de denoising y horizonte de ejecucion de 50, adecuada para control por bloques de acciones.
- Capacidades conversacionales o de generacion de texto: no disponibles; el modelo no esta planteado como LLM generalista.
- Tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues: no disponibles.
- Vision adicional (audio, video, otros dominios): no disponible.
- Evaluacion en robot real: el autor no reclama ninguna metrica de evaluacion real.

## Casos de uso

- Reconstruccion de layout en banco de trabajo (tarea nativa): recolocar objetos sobre una superficie segun una disposicion objetivo, usando la vista exterior para la escena global y la vista de muneca para el agarre fino. Es el escenario exacto sobre el que se entreno el checkpoint y donde su rendimiento deberia ser mas fiable.
- Preparacion de kits en almacen: agrupar piezas y dejarlas en una bandeja con una disposicion fija. El horizonte de 50 acciones permite ejecutar secuencias de colocacion sin reinferencia constante, util en lineas con control a decenas de hercios.
- Automatizacion de laboratorio: ordenar tubos, placas o material fungible en gradillas siguiendo una disposicion predefinida, donde la camara de muneca aporta la precision necesaria en espacios reducidos.
- Alimentacion de celdas de ensamblaje: presentar piezas en posiciones conocidas antes de un proceso posterior (atornillado, pegado, inspeccion). El condicionamiento por subtask permite reutilizar el mismo checkpoint para varias subtareas del mismo flujo.
- Clasificacion y ordenacion de objetos en logistica: separar articulos por tipo o destino y disponerlos en contenedores distintos, aprovechando la entrada multivista para distinguir objetos parcialmente ocluidos.
- Recogida de escritorio o puesto de trabajo: devolver herramientas y objetos a sus posiciones definidas, una variante directa de layout_reconstruction aplicada a entornos de oficina o taller.
- Linea base para investigacion en VLA: sirve como punto de partida reproducible para comparar fine-tunings de Pi0.5 con distintas configuraciones de vistas, resolucion o numero de pasos, dado que se documentan batch, semilla y pasos.
- Reentrenamiento o continuacion del fine-tuning: el autor indica que los checkpoints originales de entrenamiento se preservaron y que los estados de normalizacion estan en la raiz del repositorio, por lo que es posible reanudar el entrenamiento aportando rutas locales de dataset y salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un checkpoint de politica entrenada (60.000 pasos de optimizacion) y no de un resultado de evaluacion, y afirma que no se reclaman metricas de evaluacion en robot real. Tampoco se proporcionan curvas de perdida, tasas de exito ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 9-10 GB en bf16/fp16 solo para pesos y estados asociados (calculo a partir de los ~4,14 B de parametros); con overhead de activaciones para tres imagenes de 224x224 y el experto de acciones, se recomienda reservar 12-16 GB. En 8 bits, aproximadamente 4-5 GB; en 4 bits, aproximadamente 2-3 GB. Estas cifras son estimaciones por tamano, no datos medidos publicados.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, una GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) cubre la inferencia en bf16 con margen; A100 40/80 GB y H100 estan sobredimensionadas para inferencia y serian relevantes solo para reentrenamiento.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090) en bf16 con margen ajustado, y con mas holgura mediante cuantizacion, aunque no se distribuyen pesos cuantizados oficialmente.
- Entrenamiento: el checkpoint se genero con 2 GPU y batch global 32, lo que indica que el fine-tuning es viable en configuraciones pequenas, si bien no se detalla el modelo exacto de GPU.
- Opciones de despliegue: libreria lerobot (pipeline declarado: robotics) e implementacion RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado). vLLM, TGI, Ollama y llama.cpp no estan indicados para este tipo de politica VLA con experto de acciones por denoising. El autor advierte que los campos de entrada personalizados pueden requerir la implementacion correspondiente.
- Latencia y throughput: no disponibles. Cualitativamente, cada inferencia implica 10 pasos de denoising para producir un chunk de 50 acciones, de modo que la frecuencia de control efectiva depende del hardware y de poder amortizar el chunk completo.
- Almacenamiento: 9,4 GB de repositorio, mas el dataset y las imagenes de keyframe necesarias para el modo de 3 vistas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-layout-reconstruction-60k) | 4,14 B | layout_reconstruction (fine-tuning) | No disponible | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_base | No disponible | Politica VLA base generalista | No disponible | No disponible | Publico en HuggingFace (modelo base declarado) |
| Otros VLA abiertos de la misma categoria (por ejemplo Pi0, OpenVLA) | No disponible | Manipulacion generalista | No disponible | No disponible | No disponible |

No se dispone de datos verificados en la informacion proporcionada para establecer comparaciones cuantitativas de rendimiento con alternativas de la misma categoria. La comparacion queda limitada a la relacion de dependencia con lerobot/pi05_base.

## Limitaciones y advertencias

- Especializacion extrema: el checkpoint esta entrenado unicamente para la tarea layout_reconstruction sobre el dataset real_workbench-taco-keyframe-gemini. No debe esperarse comportamiento generalista fuera de esa distribucion.
- Ausencia de evaluacion: no se declaran metricas de exito en robot real, ni validacion en entornos distintos del de entrenamiento. Cualquier uso en produccion exige una evaluacion propia.
- Licencia no disponible: sin licencia declarada no hay certeza sobre el uso comercial, la redistribucion ni la creacion de obras derivadas. Es un bloqueo potencial para produccion.
- Idiomas no declarados: el condicionamiento textual se realiza mediante subtasks por fotograma del dataset, no mediante lenguaje natural libre; no hay evidencia de generalizacion a instrucciones en castellano u otros idiomas.
- Dependencia de la implementacion: la model card advierte que los campos de entrada personalizados pueden requerir la implementacion RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado), lo que limita el uso con herramientas estandar.
- Configuracion de sensores fija: requiere tres vistas (exterior, muneca y keyframe) con imagenes almacenadas a 224x126 y rellenadas a 224x224. Cambiar camaras, resolucion o numero de vistas invalida el modelo sin reentrenamiento.
- Sesgos de dataset: el comportamiento hereda la distribucion de objetos, iluminacion, posiciones y estilo de teleoperacion del dataset de origen; no hay documentacion disponible sobre su composicion, diversidad o posibles sesgos.
- Riesgo de acciones inseguras: en robotica, un fallo de la politica se traduce en movimiento fisico. Es imprescindible limitar velocidades, definir zonas de seguridad y disponer de parada de emergencia; el riesgo de "alucinacion" se manifiesta aqui como acciones fisicamente invalidas o colisiones.
- Reanudacion del entrenamiento: las rutas especificas del host fueron eliminadas de los metadatos JSON, por lo que para reanudar hay que aportar rutas locales de dataset y salida.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay senales de uso por terceros ni soporte de la comunidad.
- Fecha de publicacion registrada: 18 de septiembre de 2026, con actualizacion el mismo dia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-layout-reconstruction-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224 (revision 35e4f46485b4d07967e7e9935bc3786aad50687c)
- Implementacion de entrenamiento citada: RLWRLD/hiwrld-ll-policy (no se ha proporcionado URL en la informacion disponible)
- Nota sobre la busqueda web: la busqueda realizada no devolvio resultados relevantes sobre este modelo, su arquitectura o sus resultados; el unico resultado obtenido no guarda relacion con el contenido de esta ficha.
