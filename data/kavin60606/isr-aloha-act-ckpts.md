# Kavin60606/isr-aloha-act-ckpts

## Resumen

`Kavin60606/isr-aloha-act-ckpts` es un repositorio de checkpoints de políticas de imitación basadas en ACT (Action Chunking Transformer) entrenadas con la librería LeRobot sobre la tarea bimanual *transfer cube* del sistema ALOHA, empleando demostraciones humanas. No es un modelo de lenguaje ni un modelo generativo multimodal: es un conjunto de políticas robóticas orientadas al control de brazos manipuladores, publicado por el usuario Kavin60606 con licencia Apache 2.0.

El repositorio contiene carpetas `pretrained_model` de LeRobot, una por combinación de trabajo (`job`) y paso de entrenamiento (`step`). Los `job` documentados son `aloha_transfer_cube_{raw,uni3,isr,isr_lam0,isr_k6}`, con pasos 020000/040000/060000 para la semilla 1000 y 020000/040000 para las variantes `*_s2000` (semilla 2000). La model card no define el significado de las siglas `uni3`, `isr`, `isr_lam0` ni `isr_k6`, por lo que se intuye que corresponden a distintas estrategias de selección, reponderación o submuestreo de datos frente a la referencia `raw` (datos completos), pero es una interpretación no confirmada por el autor.

Su relevancia es acotada y práctica: sirve como material de reproducibilidad para comparar cómo distintas variantes de datos afectan al rendimiento de una política ACT en una tarea concreta, y como punto de partida para *fine-tuning* en tareas bimanuales propias. El repositorio tiene 0 descargas y 0 likes, y no incluye cifras de rendimiento ni hiperparámetros, de modo que su utilidad depende del repositorio de experimento asociado, `Kavin60606/isr-aloha-transfer-cube-experiment`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot; política de imitación con encoder visual, transformer encoder-decoder y cabecera de predicción de *chunks* de acciones. Hiperparámetros concretos (capas, dimensión, número de cámaras): no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible; la entrada es una ventana de observaciones (imágenes de cámara y estado de articulaciones), no una secuencia de texto. El horizonte de *chunk* no se documenta en la model card |
| Tipos de cuantización | no disponible; los pesos se publican en safetensors sin que se documente ninguna cuantización |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 (según metadatos del repositorio) |
| Formato de pesos | safetensors, organizados como carpetas `pretrained_model` de LeRobot, una por `<job>/<step>` |
| Tamaño del repositorio | 4,8 GB (25 checkpoints si se confirma la combinación 5 variantes × 3 pasos para semilla 1000 y 5 variantes × 2 pasos para semilla 2000) |
| Librería / pipeline | lerobot / robotics |
| Autor y fecha | Kavin60606; metadatos con creación 2026-09-12 y actualización 2026-09-12 |

## Arquitectura y entrenamiento

ACT es una política de imitación que predice secuencias de acciones (*action chunks*) en lugar de un único paso, con el objetivo de reducir el error de acumulación típico del control reactivo paso a paso. La implementación estándar combina un encoder visual convolucional para las imágenes de las cámaras, un transformer encoder-decoder y un esquema de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas; la pérdida de entrenamiento habitual es L1 sobre el *chunk* predicho. Esta descripción corresponde a la arquitectura ACT de referencia y a la implementación disponible en LeRobot; la model card de este repositorio no detalla ninguna de estas elecciones, ni el número de capas, ni el tamaño de los *chunks*, ni el número de cámaras utilizadas.

En cuanto a los datos, el entrenamiento se realiza sobre demostraciones humanas de la tarea *transfer cube* de ALOHA, en la que un brazo recoge un cubo y lo transfiere al otro. Los únicos detalles aportados por el autor son operativos: los conjuntos de datos están expresados en grados, por lo que en evaluación es necesario convertir las acciones de grados a radianes y las observaciones de radianes a grados (el autor remite a `sitecustomize.py` del repositorio de experimento), y hay que ajustar la frecuencia de reproducción para los brazos comprimidos (repetición de acción 2 para `isr` e `isr_lam0`, y 3 para `uni3` e `isr_k6`). No se indican el número de episodios, el número de tokens o pasos de entrenamiento totales, la composición del dataset, ni si hubo ajuste posterior con RLHF/DPO (no aplicable en este dominio). Tampoco se documentan innovaciones técnicas propias más allá de la variante de datos que da nombre al repositorio.

## Capacidades

- Control bimanual de precisión para la tarea *transfer cube*: recogida y transferencia de un cubo entre dos brazos manipuladores.
- Política de imitación con predicción por *chunks* de acciones, lo que aporta coherencia temporal en la ejecución.
- Entrada multimodal: imágenes de cámara (configuración típica de ALOHA: cámara frontal y cámaras de muñeca) más estado propioceptivo de las articulaciones.
- Salida de posiciones objetivo de articulaciones expresadas en grados, tal como advierte el autor del repositorio.
- Múltiples puntos de control por variante de datos y por número de pasos de entrenamiento (020000/040000/060000 en semilla 1000; 020000/040000 en semilla 2000), útiles para estudiar curvas de aprendizaje.
- Dos semillas independientes (1000 y 2000), lo que permite una comparación básica de variabilidad entre ejecuciones.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes, razonamiento multi-paso ni planificación simbólica.
- No tiene modo de razonamiento (*thinking mode*), visión general, audio ni capacidades matemáticas o de generación de texto.
- No hay capacidades multilingües: el modelo no procesa lenguaje natural.

## Casos de uso

- Reproducción de experimentos de selección de datos: el repositorio permite reconstruir la comparación entre `raw`, `uni3`, `isr`, `isr_lam0` e `isr_k6` manteniendo constantes arquitectura y tarea, que es exactamente el diseño experimental que sugiere la model card.
- Estudio de curvas de aprendizaje: los checkpoints a 20k, 40k y 60k pasos de la semilla 1000 permiten analizar cuándo satura el rendimiento y si las variantes de datos convergen a ritmos distintos.
- Comparación entre semillas: los pares 020000/040000 de la semilla 2000 permiten medir la varianza entre ejecuciones y detectar si las diferencias observadas entre variantes son significativas o ruido de entrenamiento.
- Línea base para tareas bimanuales propias: una política ACT preentrenada en *transfer cube* sirve como inicialización para *fine-tuning* en manipulaciones bimanuales relacionadas, con menos datos que entrenando desde cero.
- Evaluación en hardware ALOHA real: el modelo está pensado para desplegarse en el sistema ALOHA, aplicando obligatoriamente la conversión grados→radianes en acciones y radianes→grados en observaciones, y el *rate-matching* indicado por el autor para brazos comprimidos.
- Validación en simulación o en banco de pruebas: antes de tocar hardware físico se puede ejecutar la política contra un entorno simulado de *transfer cube* para detectar fallos de calibración o de unidades.
- Docencia y formación en robótica de imitación: el conjunto de checkpoints ilustra de forma tangible el impacto del filtrado o reponderación de datos en un *pipeline* de *behavior cloning*.
- Auditoría de reentrenamientos: al conservar varios pasos y variantes, el repositorio funciona como registro para depurar regresiones cuando se cambia la política de datos en un proyecto mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los resultados del repositorio `Kavin60606/isr-aloha-transfer-cube-experiment`, pero no reproduce ninguna métrica (tasa de éxito, número de intentos, error de posición) ni comparación cuantitativa con ACT de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible por checkpoint. El repositorio completo ocupa 4,8 GB; si se confirmasen 25 checkpoints y un reparto uniforme, cada carpeta rondaría los 190 MB, pero este cálculo es derivado y no está verificado.
- GPU recomendadas: no especificadas por el autor. LeRobot permite entrenar e inferir políticas ACT en una única GPU, pero no hay confirmación de qué hardware se utilizó aquí.
- ¿Cabe en GPU de consumo? No confirmado. Por el tamaño del repositorio y la naturaleza de ACT (política compacta frente a modelos de lenguaje), es plausible que una GPU de consumo de gama alta sea suficiente tanto para inferencia como para *fine-tuning*, pero debe verificarse experimentalmente.
- Opciones de despliegue: el formato de pesos corresponde a LeRobot (`pretrained_model`), por lo que el despliegue natural es a través de la propia librería LeRobot. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y estos servidores no son aplicables a una política robótica de este tipo.
- Latencia y *throughput*: no disponibles. El autor menciona la necesidad de *rate-matching* en la reproducción (repetición de acción 2 o 3 según la variante), lo que indica que la frecuencia de ejecución debe ajustarse a la del entorno real y no puede tomarse directamente del modelo.
- Almacenamiento: 4,8 GB para el conjunto completo de checkpoints, más el espacio de los datasets asociados en el repositorio de experimento.

## Comparativa con modelos similares

Solo la primera fila está respaldada por la información proporcionada en esta ficha; el resto se incluye como contexto de categoría y sus celdas no han sido verificadas aquí.

| Modelo | Tipo de política | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isr-aloha-act-ckpts (este repositorio) | ACT (LeRobot) | no disponible | no disponible | Apache 2.0 | HuggingFace, 25 checkpoints aproximados, 0 descargas |
| ACT de referencia en LeRobot | ACT (LeRobot) | no disponible | no disponible | Apache 2.0 (según la librería) | Público en LeRobot |
| Diffusion Policy | Política de imitación por difusión | no disponible | no disponible | no disponible en esta ficha | Público en repositorios de investigación |
| SmolVLA | Política visión-lenguaje-acción | no disponible en esta ficha | no disponible | no disponible en esta ficha | Público en LeRobot |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para la tarea *transfer cube* con ALOHA y no generaliza a otras tareas, objetos o disposiciones de cámara sin reentrenamiento o *fine-tuning*.
- Unidades: los datos están en grados. Si no se aplica la conversión acciones grados→radianes y observaciones radianes→grados en evaluación, la política producirá comportamientos incorrectos. Es el aviso más explícito de la model card.
- Frecuencia de ejecución: si no se aplica el *rate-matching* indicado (repetición de acción 2 para `isr` e `isr_lam0`, 3 para `uni3` e `isr_k6`), la reproducción de los brazos comprimidos fallará.
- Trazabilidad limitada: las siglas `uni3`, `isr`, `isr_lam0` e `isr_k6` no se definen en la model card, de modo que un tercero no puede saber con certeza qué transformación de datos representa cada checkpoint.
- Ausencia de métricas: no hay tasas de éxito ni comparaciones publicadas en la información disponible, por lo que no es posible evaluar la calidad relativa de las variantes sin reproducir los experimentos.
- Riesgo de sobreajuste: se trata de políticas de imitación sobre demostraciones humanas de una única tarea; se espera degradación ante cambios de iluminación, posición inicial, fricción o calibración del robot.
- Sin revisión externa: 0 descargas y 0 likes, sin evidencia de validación independiente ni de uso en producción.
- Sin datos de composición del dataset: se desconoce si las demostraciones incluyen fallos, si están balanceadas o si contienen sesgos sistemáticos de teleoperación.
- Licencia: el repositorio se publica como Apache 2.0, lo que en principio permite uso comercial, pero no se indica la licencia de los datos de demostración originales; conviene verificarla antes de un uso comercial.
- Metadatos incompletos: la model card no documenta hiperparámetros, número de episodios, configuración de cámaras ni versiones de dependencias, lo que dificulta la reproducibilidad exacta.
- Idiomas: no aplica; el modelo no procesa texto ni mantiene conversaciones, de modo que cualquier expectativa de uso como asistente o modelo generativo es incorrecta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Kavin60606/isr-aloha-act-ckpts
- Repositorio de experimento, datos y código citado en la model card: https://huggingface.co/Kavin60606/isr-aloha-transfer-cube-experiment
- Referencia general de la arquitectura ACT (paper de Zhao et al., *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*): https://arxiv.org/abs/2304.13705
- Librería LeRobot (HuggingFace), necesaria para cargar los checkpoints: https://github.com/huggingface/lerobot
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (hilos de soporte de Apple sobre recuperación de cuenta y *Back to School*), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.
