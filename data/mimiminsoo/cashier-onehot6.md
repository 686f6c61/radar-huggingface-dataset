# mimiminsoo/cashier-onehot6

## Resumen

cashier-onehot6 es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, desarrollada por el usuario mimiminsoo en el contexto de un proyecto capstone (MoAI 2026). El modelo resuelve una tarea de manipulación concreta: el escaneo de códigos de barras y el empaquetado posterior de productos, ejecutada por un sistema de doble brazo robótico PiPER con un cuello de 2 grados de libertad y tres cámaras. Se trata de una única política que cubre toda la secuencia de la tarea mediante una codificación one-hot de 6 etapas inyectada en el vector de estado.

La relevancia del modelo es acotada pero técnicamente interesante: sustituye el encadenamiento de políticas separadas (una para el escaneo y otra para el empaquetado) por un solo modelo que recibe la etapa actual como entrada. El checkpoint publicado corresponde al paso 200.000 de entrenamiento, con un tamaño de repositorio de 4,4 GB que incluye los pesos EMA dentro del estado de entrenamiento.

No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un artefacto de robótica con un espacio de observación y acción fijo, orientado a la reproducción de una tarea física concreta. Su licencia Apache 2.0 permite reutilización, pero su aplicabilidad fuera del hardware y del conjunto de datos originales es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de observacion 2, prediccion 16, accion 8, a 10 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `training_state.pt` (checkpoint de PyTorch con pesos EMA) |
| Tamano del repositorio | 4,4 GB |
| Estado de entrada | 22 dimensiones (16 de robot + 6 de etapa one-hot) |
| Accion de salida | 16 dimensiones (brazo izquierdo 6 + pinza, brazo derecho 6 + pinza, pitch/yaw del cuello) |
| Camaras | 3 (`left_main`, `left_wrist`, `right_wrist`) a resolucion [240, 320] |
| Frecuencia de control | 10 Hz |
| Pasos de entrenamiento | 200.000 (cosine LR hasta 0) |
| Batch | 64 (32 por GPU x 2 GPUs, DDP) |
| Datos de entrenamiento | `onehot6_1123`: 808 episodios, 298.045 frames |

## Arquitectura y entrenamiento

El modelo es una diffusion policy implementada sobre la librería LeRobot, un paradigma que genera trayectorias de acción mediante un proceso de difusión condicionado por observaciones visuales y de estado. La entrada combina tres flujos de imagen (cámara principal izquierda y dos cámaras de muñeca) con un vector de estado de 22 dimensiones: 16 correspondientes al robot (posiciones articulares y pinzas) y 6 correspondientes a la etapa actual codificada en one-hot. La salida es un vector de acción de 16 dimensiones que incluye ambos brazos de 6 grados de libertad más pinza y el pitch/yaw del cuello.

El entrenamiento se realizó durante 200.000 pasos con batch de 64 repartido en dos GPUs mediante DDP, con un schedule de learning rate coseno que decae hasta cero en el paso final. Se aplicó normalización con `normalize_range_eps` de 0,0001. El conjunto de datos `onehot6_1123` contiene 808 episodios y 298.045 frames, con etiquetas de etapa derivadas de transiciones físicas registradas (liberación de la pinza izquierda, primer código de barras registrado, comandos de pinza derecha, etc.). La innovación principal es el uso de una codificación one-hot de 6 etapas en el estado para que una sola política cubra toda la secuencia, evitando el encadenamiento de modelos separados.

## Capacidades

- Generación de trayectorias de acción para un robot de doble brazo PiPER con cuello de 2 grados de libertad, a 10 Hz.
- Ejecución de una tarea compuesta de escaneo de código de barras y empaquetado, dividida en 6 etapas codificadas en one-hot.
- Condicionamiento por tres cámaras simultáneas (principal izquierda y dos de muñeca) a resolución 240x320.
- Control coordinado de ambos brazos y del cuello en un único vector de acción de 16 dimensiones.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- Automatización de línea de escaneo y empaquetado: el modelo ejecuta la secuencia completa de recogida, escaneo, colocación y empaquetado en un entorno de laboratorio con brazos PiPER, usando la etapa one-hot para conmutar entre fases sin cambiar de política.
- Investigación en políticas de difusión unificadas: sirve como referencia para estudiar si una sola política con condicionamiento de etapa supera al encadenamiento de políticas especializadas en tareas de manipulación multi-fase.
- Reproducción de experimentos de robótica con LeRobot: el checkpoint y los scripts de descarga permiten replicar el entrenamiento y la evaluación en el mismo conjunto de datos `onehot6_1123`.
- Evaluación de robustez ante cambios de etapa: al recibir la etapa como entrada explícita, permite analizar cómo afecta un etiquetado incorrecto de etapa al comportamiento del robot.
- Base para fine-tuning en tareas similares: con Apache 2.0, puede adaptarse a otras secuencias de manipulación con doble brazo y cuello, siempre que se redefina el espacio de estado y acción.
- Docencia y demostraciones de diffusion policies: su tamaño (4,4 GB) y su pipeline claro lo hacen utilizable en entornos académicos para ilustrar el entrenamiento y despliegue de políticas de difusión en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el checkpoint de 4,4 GB incluye estado de entrenamiento y pesos EMA, por lo que el peso efectivo del modelo es inferior pero no se especifica.
- GPU recomendadas: no disponible; el entrenamiento usó 2 GPUs con batch de 32 por GPU, pero no se indica el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (librería nativa); el autor proporciona `pipeline/download_model.py` y `eval/run_chain.sh`, aunque este último no es compatible directamente con el modelo de estado 22 según la model card.
- Latencia y throughput: no disponibles; la frecuencia de control es de 10 Hz, lo que fija un requisito de inferencia en tiempo real de 100 ms por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Estado de entrada | Acciones | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cashier-onehot6 | Diffusion policy (LeRobot) | 22 (16 robot + 6 etapa) | 16 | obs 2, pred 16, accion 8 | Apache 2.0 | Hugging Face |
| cashier-barcode-onehot3 | Diffusion policy (LeRobot) | 19 (16 robot + 3 etapa) | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Políticas separadas de escaneo y empaquetado | Diffusion policy (LeRobot) | no disponible | no disponible | no disponible | no disponible | Referenciadas en la model card |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea y hardware: solo es válido para la configuración de doble brazo PiPER con cuello de 2 grados de libertad y tres cámaras concretas; no es transferible sin reentrenamiento.
- Dependencia del etiquetado de etapa: la política asume que la etapa one-hot es correcta; un etiquetado erróneo o desincronizado puede producir comportamientos incoherentes.
- Incompatibilidad con el pipeline de evaluación publicado: según la model card, `eval/run_chain.sh` se detiene en su comprobación inicial con este modelo de estado 22, y la cadena de una sola política aún no está en la rama `release`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de trayectorias no válidas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; el conjunto de datos de 808 episodios puede no cubrir variaciones suficientes de iluminación, posición de objetos o configuraciones de hardware.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y la dependencia de hardware específico limitan su aplicabilidad en producción.
- Sin datos de benchmarks ni métricas de éxito publicadas, por lo que no es posible evaluar su rendimiento real frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mimiminsoo/cashier-onehot6
- Modelo referenciado (datos de pose inicial): https://huggingface.co/mimiminsoo/cashier-barcode-onehot3
- LeRobot (librería): https://github.com/huggingface/lerobot
