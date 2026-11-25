# arkojit1/act_mjstack3cam_bs32_89k_100k

## Resumen

ACT (Action Chunking Transformer) es una política de robótica entrenada desde cero con LeRobot 0.7.0 sobre el conjunto de datos `arkojit1/mj_stack_red_yellow_3cam`, compuesto por 200 episodios de apilamiento de bloques con un brazo Franka (panda) simulado en MuJoCo a 50 Hz. El modelo resuelve una tarea de manipulación concreta: colocar un bloque sobre otro (rojo sobre amarillo o amarillo sobre rojo) a partir de tres cámaras y del estado del efector final. Es relevante como ejemplo reproducible de entrenamiento de una política visomotora con arquitectura transformer y chunking de acciones en el ecosistema LeRobot.

El modelo tiene 51.664.516 parámetros (aproximadamente 52M) y un tamaño de repositorio de 0,2 GB. No es un modelo de lenguaje: no procesa texto ni instrucciones en lenguaje natural. La tarea concreta (qué bloque va encima) se infiere únicamente de las imágenes, ya que ACT no lee la cadena de tarea. Emite trozos de 100 acciones (2,0 s a 50 Hz) que se ejecutan completos, sin ensamblado temporal.

La ficha se basa exclusivamente en la model card y los metadatos públicos del repositorio de Hugging Face; no hay información sobre licencia, idiomas, benchmarks de éxito de tarea ni despliegue en producción más allá de lo indicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): backbone ResNet18 con inicialización ImageNet, 4 capas de encoder y 1 de decoder, dimensión 512, latente CVAE de 32 |
| Parametros totales | 51.664.516 (todos entrenados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visomotora; chunk de 100 acciones, 2,0 s a 50 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se infiere de las imágenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un backbone ResNet18 preentrenado en ImageNet con un transformer encoder-decoder (4 capas de encoder, 1 de decoder, dimensión 512) y un espacio latente CVAE de 32 dimensiones. La política recibe tres imágenes de 224×224 (`observation.image.front`, `observation.image.wrist`, `observation.image.side`) y un vector de estado de 4 dimensiones (x, y, z del efector final más apertura del gripper), y produce un chunk de 100 acciones de 4 dimensiones `[dx, dy, dz, gripper]` en el esquema `cartesian_pos`. Las columnas de orientación y de delta articular del dataset no se utilizaron, por lo que la política nunca comanda rotación.

El entrenamiento se realizó desde cero con LeRobot 0.7.0 sobre 176 episodios (los últimos 3 de cada una de las 8 tareas, 24 episodios, quedaron como holdout). Se usó una única GPU MI300X con batch 32, optimizador AdamW con LR constante de 1e-5 (incluido el backbone), weight decay 1e-4 y precisión fp32, sin schedule. La función de pérdida es L1 más 10 veces la KL del CVAE, con normalización media/desviación típica de imágenes, estado y acción, y aumentos de imagen de LeRobot activados. El checkpoint publicado corresponde al paso 89.000 (33,9 épocas) de una ejecución de 100.000 pasos (38,1 épocas); la pérdida de evaluación mínima de la ejecución fue 0,0340 en el paso 73.500 (no guardado), y la evaluación se mantuvo plana en torno a 0,034–0,043 desde el paso 60.000.

## Capacidades

- Generación de acciones de manipulación para apilamiento de bloques con brazo Franka en simulación MuJoCo.
- Percepción visomotora a partir de tres vistas (frontal, muñeca y lateral) de 224×224.
- Chunking de acciones: emite 100 acciones por inferencia (2,0 s a 50 Hz) y las ejecuta todas, sin ensamblado temporal.
- Control cartesiano de traslación y gripper (`dx, dy, dz, gripper`), sin comandos de rotación.
- Inferencia de la tarea a partir de las imágenes (rojo sobre amarillo o amarillo sobre rojo), sin lectura de instrucciones de texto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general, audio o modo de pensamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un entrenamiento ACT completo con LeRobot 0.7.0, con hiperparámetros, pérdidas y curvas de evaluación documentados, para comparar variantes de arquitectura o de datos.
- Apilamiento de bloques en simulación MuJoCo: el modelo ejecuta directamente la política de colocación de un bloque sobre otro con un Franka panda, útil para probar pipelines de evaluación en entornos simulados antes de transferir a hardware.
- Generación de datos sintéticos de manipulación: al ejecutar la política sobre el simulador se pueden recolectar trayectorias etiquetadas para aumentar el dataset o entrenar políticas posteriores.
- Estudio de chunking de acciones: con `chunk_size=100` y `n_action_steps=100` sin ensamblado temporal, permite analizar el compromiso entre reactividad y suavidad en el control a 50 Hz.
- Evaluación de robustez ante vistas múltiples: al depender de tres cámaras, es adecuado para experimentos sobre el impacto de oclusiones o cambios de punto de vista en políticas visomotoras.
- Base para ablaciones de normalización y aumento de datos: la model card documenta normalización media/std y aumentos de imagen, lo que facilita reproducir y modificar esas decisiones en estudios controlados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Eval loss (L1 sobre acciones normalizadas, latente CVAE cero, 24 episodios holdout) | 0,0344 en el paso 89.000 |
| Eval loss mínima de la ejecución | 0,0340 en el paso 73.500 (no guardado) |
| Train loss (L1 + 10 × KL) | 0,029 |
| Dispersión punto a punto de la eval loss | aproximadamente ±0,002 al final de la ejecución |

El autor advierte explícitamente de que la eval loss es una métrica del objetivo de entrenamiento sobre 24 episodios retenidos, no una tasa de éxito de tarea. No se han publicado resultados de benchmarks de éxito en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7M de parámetros y pesos en fp32 el modelo ocupa aproximadamente 0,2 GB, más el coste de las activaciones de ResNet18 y del transformer para tres imágenes de 224×224.
- GPU recomendadas: no disponibles; el entrenamiento se realizó en una AMD MI300X con batch 32.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de parámetros cabría en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: `lerobot` mediante `ACTPolicy.from_pretrained("arkojit1/act_mjstack3cam_bs32_89k_100k")`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/act_mjstack3cam_bs32_89k_100k | 51,7M | chunk de 100 acciones (2,0 s a 50 Hz) | Apilamiento de bloques Franka en MuJoCo | no disponible | Hugging Face, lerobot |
| Otras políticas ACT de LeRobot | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |
| Políticas tipo Diffusion Policy | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La eval loss de 0,0344 no es una tasa de éxito de tarea; el autor lo señala explícitamente y no se proporcionan métricas de éxito.
- Entrenado solo en simulación MuJoCo con un Franka panda; no hay evidencia de transferencia a hardware real.
- La política nunca comanda rotación: las columnas de orientación y delta articular del dataset no se usaron, lo que limita la tarea a traslación y gripper.
- No lee la cadena de tarea; la elección de qué bloque va encima depende únicamente de las imágenes, lo que puede fallar ante cambios de apariencia, iluminación u oclusión.
- Requiere pasar las tres cámaras con las claves exactas `observation.image.front`, `observation.image.wrist` y `observation.image.side`; un uso incorrecto de las claves o del orden de dimensiones de la acción invalida el despliegue.
- Los deltas de traslación deben aplicarse tal como están almacenados en el dataset y en el mismo orden de dimensiones.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Entrenado sobre solo 200 episodios y 8 tareas (25 episodios por tarea), lo que limita la generalización a variaciones no vistas.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la ejecución de acciones incorrectas sin señal de confianza.
- No se documentan sesgos demográficos ni lingüísticos por tratarse de una política visomotora sin entrada de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/act_mjstack3cam_bs32_89k_100k
- Dataset: https://huggingface.co/datasets/arkojit1/mj_stack_red_yellow_3cam
- LeRobot: https://github.com/huggingface/lerobot
