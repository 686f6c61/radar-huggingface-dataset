# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_60k

## Resumen

Se trata de una política robótica de tipo visión-lenguaje-acción (VLA) publicada por el usuario sam-guided-vlas en Hugging Face. No es un modelo de lenguaje: es un ajuste fino (fine-tune) de lerobot/pi05_base, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, orientado a la generalización en entornos nuevos y adaptado aquí a un robot Franka Panda con tres cámaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`).

El modelo tiene 4.143.404.816 parámetros (unos 4,14 mil millones, medidos en los pesos safetensors), se distribuye en formato safetensors dentro de un repositorio de 9,4 GB y lleva licencia Apache 2.0. La ficha declara la librería LeRobot y la etiqueta de pipeline `robotics`, pero no especifica idiomas ni publica resultados de evaluación.

Su relevancia es acotada y de carácter experimental. El identificador del repositorio codifica el protocolo de entrenamiento (seed 0, 60 000 pasos, máscara, overlay a75, todas las cámaras, simulación, datos «live») y el conjunto de entrenamiento consta de solo 199 episodios y 31 073 fotogramas a 20 FPS. Con cero descargas y cero «likes», debe interpretarse como un artefacto de investigación reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) según la model card; el tipo concreto de red (transformer, mezcla de expertos, etc.) no se detalla: no disponible |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), según los pesos safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (el modelo consume observaciones por paso de control, no secuencias de texto documentadas) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan GGUF, int8 ni otras variantes) |
| Idiomas soportados | No disponible (el campo de idiomas está vacío; la salida del modelo son acciones, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 9,4 GB) |
| Libreria / pipeline | lerobot / robotics |
| Modelo base | lerobot/pi05_base (fine-tune) |
| Tipo de robot | Franka Panda |
| Entradas | `observation.state` (9,), tres imágenes RGB (3, 224, 224): `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Salidas | `action` (7,) |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 (metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo base como π₀.₅ (Pi05), un modelo de visión-lenguaje-acción de Physical Intelligence concebido para generalizar a entornos y situaciones que no aparecieron durante el entrenamiento, y que evoluciona el π₀ anterior. La implementación en LeRobot está adaptada del repositorio OpenPI de la propia compañía. La ficha de este repositorio no detalla la arquitectura interna (número de capas, mecanismo de atención, presencia de un «action expert» o de decodificación por flujo), por lo que ese nivel de detalle no está disponible.

El ajuste fino se realizó sobre el conjunto sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live, con 199 episodios, 31 073 fotogramas y una frecuencia de 20 FPS. Las tareas se describen con cadenas de texto largas y muy específicas sobre la geometría de las piezas a manipular (formas con lóbulos, superficies acanaladas, huecos profundos, anillos, rebordes, etc.), lo que sugiere condicionamiento por instrucción en lenguaje natural, aunque la model card no lo documenta de forma explícita. El identificador del repositorio indica además una ejecución con semilla 0, 60 000 pasos de entrenamiento, uso de máscara y un «overlay» etiquetado como a75, así como el empleo de todas las cámaras; no se menciona RLHF, DPO ni ninguna otra etapa de alineación.

## Capacidades

- Generación de acciones de 7 dimensiones para un brazo Franka Panda (pose del efector final y pinza, según la dimensionalidad declarada).
- Percepción visual multi-cámara: procesa tres vistas RGB simultáneas a resolución 224×224 (una vista de agente y dos montadas en la mano).
- Fusión de propriocepción y visión: combina un vector de estado de 9 dimensiones con las tres imágenes en cada paso.
- Manipulación de objetos con geometría compleja, a juzgar por el catálogo de piezas descritas en el dataset (formas lobuladas, acanaladas, perforadas, con protuberancias o con asas).
- Ejecución en bucle de control a 20 FPS, la frecuencia a la que se grabó el dataset de entrenamiento.
- Posible condicionamiento por lenguaje natural (las tareas del dataset se describen textualmente), si bien la model card no lo confirma como capacidad declarada.
- No dispone de tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No genera texto, no mantiene conversación y no ofrece modo «thinking», audio ni otras capacidades multimodales de salida.
- No se declaran capacidades multilingües: su entrada de lenguaje, si existe, no está caracterizada.

## Casos de uso

- Investigación en agarre y reorientación de piezas complejas: el modelo produce acciones de 7 grados de libertad a partir de tres vistas, y su dataset está compuesto precisamente por objetos difíciles de sujetar; es adecuado para estudiar estrategias de prehensión en laboratorio.
- Reproducción de experimentos con LeRobot: el identificador fija semilla (0) y presupuesto de entrenamiento (60 000 pasos), de modo que sirve como referencia reproducible en comparaciones internas.
- Ablación de preprocesado de datos: el nombre del repositorio incluye «mask» y «overlay_a75», por lo que resulta útil como una de las configuraciones a comparar frente a variantes sin máscara o con otro nivel de superposición del mismo autor.
- Evaluación de políticas generalistas frente a políticas específicas de tarea: con solo 199 episodios y 31 073 fotogramas, permite medir cuánto aporta el preentrenamiento del modelo base frente a un entrenamiento desde cero.
- Estudios de transferencia simulación-real: el identificador contiene «sim» y «live», lo que apunta a una configuración pensada para evaluar el salto entre simulación y ejecución real (dato no confirmado en la model card).
- Comparación de configuraciones de sensores: al haberse entrenado con «all_cameras», sirve de punto de partida para medir el impacto de reducir el número de vistas en el rendimiento de la política.
- Docencia y ejemplos de pipeline completo: ilustra el flujo de entrenamiento y publicación con LeRobot, desde el dataset hasta el repositorio en el Hub con safetensors.
- Prototipado en un robot Panda real o simulado con las tres cámaras exactas declaradas, siempre que se respete el contrato de entradas y salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de éxito de tarea, tasas de agarre, comparaciones con π₀.₅ base ni métricas de simulación o de robot real, y el repositorio acumula 0 descargas y 0 «likes», por lo que tampoco existe retroalimentación de la comunidad que permita estimar su rendimiento.

## Comparativa con modelos similares

La información proporcionada no incluye parámetros, contexto ni métricas de los modelos alternativos, por lo que la comparación solo puede ser cualitativa.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05, 60k pasos, seed 0) | VLA ajustado para Panda con 3 cámaras | 4.143.404.816 | No disponible | Apache 2.0 | Público en Hugging Face, 0 descargas |
| lerobot/pi05_base | VLA base del que deriva este ajuste | No disponible | No disponible | No disponible en esta información | Público en Hugging Face (referenciado como `base_model`) |
| π₀ (predecesor de π₀.₅, Physical Intelligence) | VLA de generación anterior | No disponible | No disponible | No disponible en esta información | No verificada en esta información |
| Otras políticas VLA de código abierto (por ejemplo, la familia OpenVLA) | VLA genéricos | No disponible | No disponible | No disponible en esta información | No verificada en esta información |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de 4.143.404.816 parámetros: ≈16,6 GB en fp32, ≈8,3 GB en bf16/fp16 y ≈4,1 GB en int8. Son estimaciones aritméticas sobre el tamaño de los pesos; hay que sumar el coste de activaciones, búferes de las tres imágenes de 224×224 y del entorno de ejecución.
- No cabe en GPU de gama de entrada de 4-6 GB ni en iGPU convencionales; sí cabe en GPUs de consumo con 12-16 GB o más en precisión reducida, y con holgura en una RTX 4090 (24 GB), una RTX 3090 (24 GB) o una RTX 5090.
- Para fp32 sin cuantizar se recomienda una GPU de 24 GB o superior (A100 40/80 GB, H100, L40S, RTX 4090).
- Entrenamiento o ajuste fino: además de los pesos, un optimizador tipo Adam en fp32 requiere del orden de cuatro veces el número de parámetros en estados (≈66 GB solo en estados del optimizador), más activaciones y gradientes; en la práctica exige varias GPU o técnicas de reparto de memoria. Estimación derivada del recuento de parámetros, no publicada por el autor.
- Opciones de despliegue documentadas: LeRobot es la librería declarada y la model card enlaza a la guía específica de pi05 en LeRobot y a la documentación general. El modelo base procede del repositorio OpenPI de Physical Intelligence.
- No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF para este repositorio.
- Latencia y throughput: no disponibles. El único dato relacionado es la frecuencia del dataset, 20 FPS, que sitúa el objetivo de control en torno a 50 ms por paso, sin que exista ninguna medición publicada de latencia real.

## Limitaciones y advertencias

- Artefacto experimental sin validación externa: 0 descargas y 0 «likes» en el momento de redactar esta ficha; no hay evidencia pública de que se haya ejecutado con éxito en un robot.
- Contrato de entrada rígido: espera exactamente un vector de estado de 9 dimensiones y tres imágenes RGB de 224×224 con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`; cualquier cambio de robot, número de cámaras o resolución invalida el uso directo.
- Dominio muy estrecho: el entrenamiento se limita a 199 episodios y 31 073 fotogramas sobre un catálogo concreto de objetos; no hay evidencia de generalización fuera de ese conjunto ni frente a iluminación, fondos o posiciones distintas.
- Riesgo de acciones erráticas fuera de distribución. En una política robótica esto es más crítico que la alucinación textual: una predicción incorrecta puede provocar colisiones o daños físicos. No se documentan paradas de emergencia, límites de par ni envolturas de seguridad.
- Ausencia total de evaluación: no hay métricas de éxito de tarea, tasas de agarre, comparaciones con el modelo base ni análisis de fallos.
- Idiomas no declarados: el campo de idiomas está vacío y el modelo no genera texto, por lo que no procede evaluarlo como modelo multilingüe.
- Sesgos: no hay ningún análisis publicado de sesgos de percepción (color, textura, material) ni de comportamiento diferencial entre objetos.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se ha verificado aquí la licencia del modelo base lerobot/pi05_base ni los términos de los datos de preentrenamiento; conviene comprobarlo antes de un uso productivo.
- Fechas de metadatos en 2026-09-11 (creación y actualización), con apenas once minutos entre ambas, lo que sugiere una subida automatizada dentro de una campaña de experimentos.
- Los resultados de la búsqueda web realizada no aportan información técnica sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ en Physical Intelligence (citado en la model card): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (origen de la implementación, citado en la model card): https://github.com/Physical-Intelligence/openpi
- LeRobot (librería de entrenamiento y ejecución): https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Resultados de la búsqueda web: no se encontraron enlaces técnicos relevantes sobre este modelo; los resultados devueltos correspondían a una serie de televisión francesa y a un fabricante de utillaje, sin relación con el contenido de esta ficha.
