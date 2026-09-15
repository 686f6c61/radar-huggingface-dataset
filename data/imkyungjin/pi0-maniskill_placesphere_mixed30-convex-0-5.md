# ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.5

## Resumen

El modelo `ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.5` es un checkpoint de la política π₀ (Pi0), un modelo de tipo Vision-Language-Action (VLA) orientado al control robótico general, desarrollado originalmente por Physical Intelligence y adaptado al ecosistema LeRobot de HuggingFace. En concreto, esta versión concreta ha sido entrenada o ajustada por el usuario ImKyungjin sobre el conjunto de datos local `maniskill_placesphere_mixed30`, con lo que se trata de una especialización de la política generalista para las tareas contenidas en ese dataset de manipulación.

El modelo cuenta con 3.501.372.176 parámetros (aproximadamente 3,5 mil millones) y se distribuye en formato `safetensors` con un tamano de repositorio de 7,0 GB, lo que resulta coherente con pesos almacenados en precisión de 16 bits. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, si bien el propio autor no ha publicado una model card detallada especifica para este ajuste: el README reproduce la plantilla genérica de π₀ de LeRobot y no documenta hiperparámetros, datos de entrenamiento concretos ni métricas.

La relevancia de este checkpoint radica en que ilustra el flujo de trabajo actual de la robótica de código abierto: partir de un modelo fundacional VLA preentrenado y especializarlo con `lerobot-train` sobre un dataset de demostraciones para obtener una política desplegable en robots reales tipo SO-100/SO-101. Al tener cero descargas y cero likes, se trata de un artefacto experimental de investigación más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), implementacion LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 3.501.372.176 (aprox. 3,5 mil millones) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,0 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | local/maniskill_placesphere_mixed30 |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀ descrita por Physical Intelligence: un modelo Vision-Language-Action que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones que emite comandos de control continuos para el robot. La implementacion disponible en el Hub es la adaptacion realizada por HuggingFace dentro de LeRobot, derivada del repositorio de codigo abierto OpenPI del propio laboratorio. El objetivo de este diseno es funcionar como una política generalista capaz de interpretar instrucciones en lenguaje natural y observaciones visuales para producir trayectorias de accion en distintos robots y tareas.

En cuanto al entrenamiento especifico de este checkpoint, la informacion proporcionada no detalla el numero de tokens ni los pasos de entrenamiento, la composicion exacta del dataset `maniskill_placesphere_mixed30` ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado puro sobre demostraciones. El sufijo `convex-0.5` del nombre sugiere un identificador de configuracion o hiperparametro experimental, pero su significado no queda documentado en la model card. La model card incluye un ejemplo de `lerobot-train` que referencia `--policy.type=act`, lo que apunta a que la plantilla README no fue editada para el tipo de politica real (`pi0`); conviene tratarlo como un artefacto heredado y no como descripcion fiable del procedimiento seguido.

## Capacidades

- Control robótico guiado por lenguaje: genera acciones motoras a partir de instrucciones en lenguaje natural y observaciones visuales, siguiendo el paradigma Vision-Language-Action.
- Manipulacion de objetos en entornos simulados o reales, segun las tareas representadas en `maniskill_placesphere_mixed30`.
- Inferencia multimodal: procesa imagenes de camara del robot junto con la instruccion textual para producir la accion.
- Compatibilidad con el ecosistema LeRobot: se puede cargar mediante `--policy.path` en `lerobot-record` para evaluacion y despliegue.
- Integracion con robots tipo SO-100/SO-101 `follower`, segun los ejemplos de la propia model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable en el sentido de agentes de software; la politica opera en bucle de control cerrado paso a paso.
- Capacidades multilingues: no disponible; las instrucciones en lenguaje natural se heredan del modelo base π₀, pero no se documenta el conjunto de idiomas.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision y audio: vision si (entrada visual del robot); audio no disponible.

## Casos de uso

- Aprendizaje por imitacion en investigacion: entrenar una politica π₀ especializada con `lerobot-train` sobre un dataset de demostraciones propio y evaluar la tasa de exito en tareas de manipulacion. Es el flujo natural para el que fue creado este checkpoint.
- Manipulacion robotica en simulacion (ManiSkill): el dataset `maniskill_placesphere_mixed30` sugiere tareas de colocacion de objetos sobre esferas o zonas designadas; el modelo puede servir como baseline de politica en esos entornos antes de transferir a hardware.
- Despliegue en robot de bajo coste SO-100/SO-101: mediante `lerobot-record` con `--policy.path` apuntando a este checkpoint, se puede ejecutar inferencia en un brazo robotico de tipo follower para tareas pick-and-place.
- Benchmarking interno de politicas VLA: comparar este ajuste frente al π₀ base o frente a ACT en el mismo conjunto de tareas de manipulacion para medir el efecto del fine-tuning sobre el rendimiento.
- Recoleccion de datos activa (data collection loop): usar el modelo como politica inicial para generar episodios de evaluacion que luego alimenten nuevas rondas de entrenamiento.
- Prototipado de interfaces robot-lenguaje: integrar el modelo en una demo que reciba comandos de texto y los traduzca en acciones, como paso previo a un producto de robot asistencial o industrial.
- Investigacion en especializacion de modelos fundacionales: estudiar como un VLA generalista (π₀) se degrada o mejora al ser ajustado sobre un dominio estrecho (`placesphere`), analizando olvido catastrofico y transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de tasa de exito, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa, y tampoco se aportan comparaciones con el modelo base π₀, ACT u otras politicas.

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16/fp16, aproximadamente 7 GB solo para los pesos (3,5 mil millones de parametros x 2 bytes); en fp32, en torno a 14 GB; en cuantizacion int8, unos 3,5 GB; en int4, aproximadamente 1,75 GB.
- Margen adicional necesario: al tratarse de un modelo VLA, hay que sumar memoria para el codificador visual, los estados intermedios de atencion y los buffers de acciones. En la practica se recomienda al menos 12-16 GB de VRAM en bf16 para operar con comodidad.
- GPU recomendadas: para entrenamiento e inferencia sin cuantizar, una NVIDIA A100 40/80 GB, H100 o L40S. Para inferencia en bf16 con margen, una RTX 4090 (24 GB) es suficiente.
- GPU de consumo: si cabe en tarjetas de consumo modernas. Una RTX 3090 o 4090 (24 GB) puede ejecutar el modelo en bf16; una RTX 4060 Ti de 16 GB o incluso de 8 GB podria requerir cuantizacion o precision reducida.
- Opciones de despliegue: el modelo esta pensado para LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch con CUDA. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje generativo y no a politicas VLA de control.
- Latencia y throughput: no disponible. En control robotico la latencia es critica, ya que la politica debe emitir acciones en bucle cerrado a frecuencia compatible con el controlador del robot; no se aportan mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0-maniskill_placesphere_mixed30-convex-0.5 (este) | 3,5 B | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| π₀ base (Physical Intelligence / LeRobot) | no disponible en la informacion proporcionada | no disponible | no disponible | Apache 2.0 | HuggingFace y OpenPI |
| ACT (Action Chunking Transformer, LeRobot) | no disponible en la informacion proporcionada | no disponible | no disponible | Apache 2.0 | HuggingFace (referenciado en la propia model card como `--policy.type=act`) |
| OpenVLA | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos cuantitativos comparativos en la informacion proporcionada; la tabla refleja unicamente la existencia de alternativas de la misma categoria (politicas de control robotico entrenadas sobre demostraciones), no sus metricas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta la composicion demografica, geografica ni de objetos del dataset `maniskill_placesphere_mixed30`, por lo que se desconoce el sesgo de la politica hacia ciertos objetos, colores o posiciones.
- Riesgo de alucinacion: en modelos VLA el fallo tipico no es textual sino motor, es decir, la generacion de trayectorias de accion incoherentes con la instruccion o con el estado del entorno. No se han publicado tasas de error.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el conjunto de idiomas soportados tampoco. Si las instrucciones usadas en el entrenamiento fueron unicamente en ingles, el rendimiento en castellano puede degradarse.
- Generalizacion restringida: al ser un ajuste sobre un dataset concreto (`placesphere`), es probable que la politica rinda bien solo en tareas y entornos similares a los del entrenamiento y pierda capacidades generalistas del π₀ base por olvido catastrofico.
- Model card incompleta: el README usa una plantilla generica y menciona `--policy.type=act`, lo que puede inducir a error. No incluye hiperparametros de entrenamiento, numero de pasos, tasa de aprendizaje ni estrategia de ajuste.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene verificar las condiciones del modelo base π₀ de Physical Intelligence y del dataset de entrenamiento, cuyas licencias no se detallan aqui.
- Caveats para produccion: cero descargas y cero likes, sin validacion por terceros; no hay evaluaciones de robustez, seguridad fisica ni comportamiento ante fallos del entorno. Su uso en robotica real requiere capas de seguridad externas.
- Fecha de creacion futura en los metadatos (2026-09-15): puede indicar reloj de sistema incorrecto, importacion de un sistema de terceros o una fecha anomalamente configurada; conviene tratarla con cautela.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.5
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI de Physical Intelligence: no disponible como URL en la informacion proporcionada, aunque la model card lo menciona por nombre.
- LeRobot (HuggingFace): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset asociado: local/maniskill_placesphere_mixed30 (referenciado como dataset local, sin URL publica en la informacion proporcionada)
