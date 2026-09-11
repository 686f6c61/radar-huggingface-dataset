# sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_1k

## Resumen

El modelo identificado como `sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_1k` es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, publicado por el usuario `sam-guided-vlas` a traves del ecosistema LeRobot de Hugging Face. Se trata de una politica Vision-Language-Action (VLA) orientada a robotica, concretamente a un brazo robotico de tipo `Panda`, que consume observaciones multimodales (estado del robot e imagenes de tres camaras) y produce acciones de control de 7 dimensiones.

El modelo deriva de π₀.₅ (Pi05), la evolucion del modelo π₀ de Physical Intelligence, disenada para generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La implementacion en LeRobot esta adaptada del repositorio OpenPI de Physical Intelligence. Cuenta con aproximadamente 4.143 millones de parametros totales y un repositorio de 9,4 GB.

Este ajuste concreto ha sido entrenado sobre el dataset `sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live`, compuesto por 199 episodios y 31.073 fotogramas a 20 FPS, centrado en tareas de manipulacion de objetos geometricos complejos. Su relevancia radica en ser un ejemplo reproducible de especializacion de un modelo fundacional VLA mediante fine-tuning sobre un dataset reducido y especifico, una practica cada vez mas habitual en el campo de la robotica basada en aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π₀.₅; implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | `Panda` |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3,224,224), `observation.images.robot0_eye_in_hand` (3,224,224), `observation.images.robot0_eye_in_hand_2` (3,224,224) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 9,4 GB |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

La arquitectura es un modelo Vision-Language-Action correspondiente a π₀.₅ de Physical Intelligence. Segun la model card, π₀.₅ evoluciona el modelo π₀ con el objetivo de generalizar a entornos y situaciones completamente nuevos que no aparecian en el entrenamiento. La implementacion disponible en este repositorio es la version de LeRobot, adaptada del repositorio OpenPI de codigo abierto de Physical Intelligence. No se detallan en la informacion proporcionada el numero exacto de capas, el componente de vision-language subyacente, ni si se emplea un mecanismo de generacion de acciones por flow matching u otro metodo.

En cuanto al entrenamiento, el modelo parte de `lerobot/pi05_base` y se ha ajustado sobre el dataset `sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live`. Este dataset contiene 199 episodios y 31.073 fotogramas grabados a 20 FPS. Las tareas descritas en el dataset corresponden a la manipulacion de objetos geometricos de formas complejas (esferas, formas lobuladas, anillos, recipientes con bordes festoneados, etc.), con variaciones en textura, numero de lobulos, oquedades y protuberancias. El nombre del repositorio sugiere la aplicacion de tecnicas de enmascarado y desenfoque (`mask`, `blur`), uso de simulacion (`sim`) y de todas las camaras disponibles (`all_cameras`), aunque no se ofrece detalle tecnico adicional sobre la receta de entrenamiento, el numero de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de acciones de control robotico: produce un vector de accion de 7 dimensiones a partir del estado y de las imagenes.
- Percepcion visual multimodal: procesa simultaneamente tres flujos de camara (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a resolucion 224x224.
- Integracion de estado propioceptivo: consume un vector de estado del robot de 9 dimensiones.
- Manipulacion de objetos con geometrias complejas y variadas, segun el conjunto de tareas del dataset de entrenamiento.
- Generalizacion a entornos nuevos (objetivo declarado de π₀.₅), aunque no se aportan metricas que la cuantifiquen en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento, vision, audio): vision a traves de tres camaras; no se documentan otras.

## Casos de uso

- Manipulacion roboticа de objetos geometricos en simulacion: el modelo esta entrenado especificamente sobre formas complejas (esferas con protuberancias, anillos con nervios, recipientes lobulados), por lo que es adecuado para replicar esas tareas de agarre y colocacion en un entorno simulado.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar como un dataset reducido (199 episodios) especializa un modelo VLA fundacional sobre una tarea concreta.
- Evaluacion de generalizacion de politicas VLA: permite analizar el comportamiento del modelo ante variaciones de forma y textura no exactamente presentes en el entrenamiento.
- Ajuste fino adicional sobre nuevas tareas de manipulacion: al ser un fine-tuning de `lerobot/pi05_base` con licencia Apache 2.0, puede servir como base para especializaciones posteriores.
- Benchmarking de politicas de robotica: util como referencia para comparar estrategias de entrenamiento (con y sin enmascarado/desenfoque) sobre una misma tarea.
- Despliegue en robot fisico tipo Panda: el modelo define explicitamente el tipo de robot y las camaras, por lo que puede ejecutarse en un montaje Franka Panda con esa configuracion de sensores.
- Docencia y divulgacion tecnica: ejemplo didactico del flujo completo de entrenamiento y publicacion de un modelo VLA con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision de 16 bits, los pesos de 4.143 millones de parametros ocupan aproximadamente 8,3 GB; anadiendo los codificadores de vision, las activaciones y el overhead de ejecucion, se estima un rango practico de 12 a 16 GB de VRAM. En cuantizacion de 8 bits el peso se reduce a unos 4,2 GB y en 4 bits a unos 2,1 GB, aunque estos formatos no se confirman como soportados en la informacion disponible.
- GPU recomendadas: no se especifica ninguna en la model card. Por tamano, GPU de 24 GB o mas (RTX 4090, L4, A100, H100) ofrecen margen comodo en precision completa.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070) en precision reducida, y con holgura en RTX 4090 (24 GB).
- Opciones de despliegue: la libreria declarada es `lerobot`, con pesos en `safetensors`; el flujo de ejecucion se documenta en la guia de LeRobot para pi05. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...pi05__seed_0__steps_1k`) | ~4,14 mil millones | No disponible | VLA (fine-tuning de π₀.₅) | Apache 2.0 | Hugging Face, via LeRobot |
| `lerobot/pi05_base` | No disponible en la informacion proporcionada | No disponible | VLA (π₀.₅ base) | No disponible en la informacion proporcionada | Hugging Face |
| π₀ (Physical Intelligence) | No disponible en la informacion proporcionada | No disponible | VLA | No disponible en la informacion proporcionada | Repositorio OpenPI, segun la model card |

No se dispone de datos detallados de otros modelos comparables en la informacion proporcionada; los campos no confirmados se marcan como no disponibles.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: esta entrenado sobre un unico dataset de tareas de manipulacion de formas geometricas, por lo que su rendimiento fuera de ese dominio no esta garantizado.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 "likes", lo que indica que no ha sido validado por la comunidad.
- Ausencia de benchmarks: no se aportan metricas de exito, tasa de exito en tareas ni comparaciones cuantitativas, por lo que no se puede evaluar su calidad objetivamente.
- Riesgo de sobreajuste: con solo 199 episodios, es plausible un sobreajuste al conjunto de tareas y a las condiciones visuales concretas del dataset.
- Dependencia de la simulacion: el nombre del repositorio incluye `sim`, lo que sugiere entrenamiento en simulacion; la transferencia a robot fisico (sim-to-real) no esta documentada.
- Sesgos: no disponibles; no se documenta analisis de sesgos.
- Riesgo de alucinacion: no aplica de la misma forma que en modelos de lenguaje, pero si existe riesgo de generar acciones incorrectas ante observaciones fuera de distribucion.
- Limitaciones de idioma y contexto: no se documentan; el modelo no procesa lenguaje natural como tarea principal.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente; conviene revisar tambien las condiciones del modelo base `lerobot/pi05_base`.
- Advertencia de produccion: al carecer de evaluacion publica y de documentacion detallada de entrenamiento, no se recomienda su uso directo en entornos de produccion sin una validacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_1k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio OpenPI: no se proporciona URL directa en la informacion disponible (se menciona en la model card como origen de la implementacion).

Nota: los resultados de la busqueda web proporcionados corresponden a entidades no relacionadas con el modelo (una empresa de utillaje, una serie de television y un fabricante de carpinteria metalica), por lo que no se incluyen como enlaces relevantes.
