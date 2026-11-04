# Gueso/tictactoe-v3-act-policy

## Resumen

`Gueso/tictactoe-v3-act-policy` es una política de manipulación robótica basada en ACT (Action Chunking with Transformers) entrenada para un brazo SO-101. El modelo aprende por imitación a colocar fichas en un tablero de tres en raya, a partir del dataset LeRobot `OG7407/tictactoe-v3`. Lo publica el usuario Gueso bajo licencia Apache 2.0 y está pensado para integrarse en el ecosistema LeRobot como checkpoint de inferencia sobre hardware real.

Con 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a control motor de baja dimensión: recibe el estado articular de 6 grados de libertad y tres flujos de imagen RGB, y emite 6 objetivos de posición articular. No es un modelo de lenguaje ni procesa instrucciones en lenguaje natural; su función es estrictamente visomotora dentro de un entorno físico concreto.

Su relevancia es acotada pero clara para quien trabaja en robótica de imitación: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot sobre una tarea lúdica y bien delimitada, con especificaciones de entrada y salida documentadas. La model card advierte explícitamente de que no se reporta tasa de éxito en robot real ni en conjunto de validación, por lo que debe tratarse como un checkpoint experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice trozos de acción (*action chunks*), es decir, secuencias de comandos motores futuros en lugar de una única acción por paso. En este checkpoint el tamaño de chunk es de 100, con un backbone visual ResNet-18 que procesa tres cámaras: `observation.images.env` (3×360×640), `observation.images.wrist` (3×360×640) y `observation.images.realsense` (3×480×640). La entrada de estado es un vector de 6 posiciones articulares y la salida son 6 objetivos de posición articular, coherentes con la cinemática del SO-101.

El entrenamiento se realizó durante 30.000 pasos con batch size 16 sobre una NVIDIA RTX PRO 6000, alcanzando una pérdida final reportada de 0,063. El dataset de origen contiene 55 episodios y 23.233 fotogramas a 30 FPS. No se documenta el uso de RLHF, DPO ni ningún proceso de ajuste posterior; es imitación supervisada pura sobre demostraciones. La model card no detalla composición del dataset más allá del número de episodios y etiquetas de tarea.

## Capacidades

- Control visomotor de manipulación: genera trayectorias de 6 articulaciones a partir de estado articular e imágenes RGB.
- Predicción por chunks de 100 acciones, lo que reduce la frecuencia de replanificación y suaviza la ejecución.
- Fusión de tres vistas de cámara (entorno, muñeca y RealSense) para estimar la posición del brazo y del tablero.
- Ejecución de una tarea concreta de colocación de fichas en un tablero de tres en raya sobre un SO-101.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- Reproducción de experimentos de imitación con LeRobot: cargar el checkpoint con la librería `lerobot` y evaluar el pipeline ACT completo sobre un SO-101, útil como referencia para comparar configuraciones de entrenamiento.
- Docencia y demostraciones de robótica de imitación: la tarea de tres en raya es visualmente interpretable y permite mostrar el ciclo observación-acción con cámaras y estado articular en un entorno controlado.
- Base para *fine-tuning* en tareas de manipulación similares: al ser un ACT compacto (51,7 M de parámetros) y con licencia Apache 2.0, se puede reentrenar con nuevos datasets LeRobot de colocación de objetos.
- Validación de infraestructura de captura: sirve para comprobar que los nombres de cámara, resoluciones y orden de articulaciones del *setup* físico coinciden con los del dataset original antes de escalar a otras políticas.
- Pruebas de integración de hardware SO-101: verificar latencia, suavidad de trayectorias y repetibilidad del brazo con un checkpoint ya entrenado.
- Benchmark interno de políticas ACT: usar la pérdida de entrenamiento reportada (0,063) y el número de pasos como referencia comparativa frente a otros checkpoints propios, siempre que se evalúe con el mismo protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,063) tras 30.000 pasos, sin tasa de éxito en robot real ni en conjunto de validación retenido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y tres flujos de imagen de hasta 480×640, el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque no se publica una cifra oficial.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA RTX PRO 6000; para inferencia no se especifica hardware mínimo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint (0,2 GB), aunque no se documenta en la model card.
- Opciones de despliegue: librería `lerobot` (formato nativo del checkpoint); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gueso/tictactoe-v3-act-policy | 51,7 M | no aplica | ACT para SO-101 (tres en raya) | Apache 2.0 | HuggingFace |
| Otros checkpoints ACT de LeRobot | no disponible | no aplica | Manipulación genérica | variable | HuggingFace |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación por difusión | variable | HuggingFace / repos |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No hay tasa de éxito reportada en robot real ni en conjunto retenido; el checkpoint debe validarse empíricamente antes de cualquier uso autónomo.
- La política no recibe como entrada la celda objetivo del tablero: aunque el dataset tenga nueve etiquetas de tarea, ACT estándar no condiciona las acciones a cadenas de lenguaje, por lo que no se puede dirigir a una casilla concreta mediante instrucción.
- Requiere replicar exactamente los nombres de cámara, resoluciones, orden de articulaciones y montaje físico del dataset original; cualquier desviación degrada la política.
- La model card recomienda evaluar las nueve posiciones del tablero en robot real antes de integrarla en juego autónomo.
- Riesgo de sobreajuste al entorno de captura: con solo 55 episodios, la generalización a iluminación, fondo o posición de cámara distintos es incierta.
- No aplica sesgo lingüístico ni de alucinación textual, pero sí riesgo de fallos de percepción y de control motor fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de métricas de robustez hace desaconsejable su despliegue en producción sin evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gueso/tictactoe-v3-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/OG7407/tictactoe-v3
- Librería LeRobot: https://github.com/huggingface/lerobot
