# padiredd/dp-openbottle-v4-visual-dr-200

## Resumen

dp-openbottle-v4-visual-dr-200 es una política de difusión (diffusion policy) para robótica manipulativa entrenada por el usuario padiredd sobre el fork `lerobot-cyclo` de ROBOTIS. Resuelve una tarea concreta de destreza bimanual: abrir una botella de 28 oz con el robot FFW SG2, donde el brazo izquierdo sujeta la botella por la base en una estación y el brazo derecho desenrosca el tapón en hasta tres giros de 50 grados. No es un modelo de lenguaje: es un modelo de control visuomotor que mapea observaciones (tres cámaras y estado articular) a acciones articulares a 15 Hz.

El modelo tiene 287,5 millones de parámetros, se distribuye en formato safetensors y ocupa 11,5 GB en el repositorio, que incluye el checkpoint final (paso 100k) en la raíz y nueve checkpoints intermedios cada 10.000 pasos. La arquitectura es una diffusion policy DDPM con un codificador ResNet18 por cámara y un horizonte de predicción de 64 pasos, de los que se ejecutan 32.

Su relevancia es acotada pero clara: es un ejemplo reproducible de entrenamiento de políticas visuomotoras bimanuales en simulación (Isaac Lab) con aumento de datos visual agresivo y dominio aleatorizado, ejecutable en una sola RTX 4090 en menos de tres horas. No hay resultados de evaluación publicados todavía, por lo que debe tratarse como un artefacto de investigación y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por camara y cabeza de acciones; fork LeRobot `lerobot-cyclo` de ROBOTIS |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de prediccion de 64 pasos, 32 ejecutados, `n_obs_steps` = 1 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico; la tarea se especifica con una cadena de texto en ingles) |
| Licencia | other |
| Formato de pesos | safetensors |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Entradas | 3 camaras (cabeza, muneca izquierda, muneca derecha) a 240x240 + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares a 15 Hz |
| Pasos de difusion | 100 (DDPM) |
| Entrenamiento | 100.000 pasos, batch 32, Adam 1e-4, cosine, semilla 1000 |
| Hardware de entrenamiento | 1x NVIDIA RTX 4090 24 GB, ~10,4 pasos/s, ~2 h 40 min |
| Checkpoints | paso 100k en la raiz; `step-10000` a `step-90000` |
| Tamano del repo | 11,5 GB |

## Arquitectura y entrenamiento

La política sigue el esquema estándar de diffusion policy: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por las observaciones. Cada una de las tres cámaras se procesa con un ResNet18 independiente; la representación visual resultante se concatena con el vector de estado articular de 22 dimensiones. El modelo predice un horizonte de 64 pasos de acción, de los cuales se ejecutan los 32 primeros antes de volver a planificar, con una única observación de entrada (`n_obs_steps = 1`). La implementación proviene del fork `lerobot-cyclo` de ROBOTIS, no del LeRobot upstream.

El entrenamiento se realizó sobre un conjunto de 200 demostraciones simuladas exitosas de la tarea open-bottle v4, recogidas en Isaac Lab con el script `collect_open_v4.py` (2026-11-08). Las demostraciones incluyen dominio aleatorizado visual (`--dr_visual`: aspecto de la mesa, fondo, luces y focos). El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot). El aumento de datos visual es agresivo y se aplica en orden aleatorio, hasta cinco transformaciones simultáneas entre brillo (0,6-1,4), contraste (0,6-1,4), saturación (0,3-1,7), tono (±0,1), nitidez (0,3-2,0), afinidad (±10 grados / 10 % / 0,9-1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises. No se añadió ruido al estado. No se documenta uso de RLHF, DPO ni ajuste por refuerzo; el entrenamiento es puramente de imitación supervisada.

## Capacidades

- Control visuomotor bimanual: genera 16 objetivos articulares a 15 Hz para el robot FFW SG2 a partir de tres vistas de cámara y el estado articular.
- Manipulación diestra fina: la tarea implica agarre por la base con la mano izquierda y desenroscado del tapón con la derecha en hasta tres giros de 50 grados, con liberación entre 140 y 149 grados.
- Robustez visual: el aumento de datos y la aleatorización de dominio durante la recogida buscan tolerancia a cambios de iluminación, fondo y aspecto de la mesa.
- Condicionamiento por cadena de tarea: acepta una descripción textual de la tarea ("open the bottle: hold it by the base with the left hand, unscrew the cap with the right hand").
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de lenguaje, visión general o audio. Es un modelo específico de una tarea, no un modelo fundacional de propósito general.

## Casos de uso

- Investigación en imitación visuomotora: sirve como referencia reproducible de diffusion policy bimanual entrenada en Isaac Lab en menos de tres horas con una sola GPU de consumo; útil para comparar recetas de aumento de datos y dominio aleatorizado.
- Prototipado de tareas de desenroscado en simulación: el modelo puede ejecutarse en el simulador para validar pipelines de control antes de transferir a hardware, gracias a que las acciones son objetivos articulares directos a 15 Hz.
- Estudio de robustez visual: el aumento agresivo y la aleatorización de dominio permiten analizar la sensibilidad de la política a cambios de iluminación, fondo y textura de la mesa sin reentrenar desde cero.
- Base para fine-tuning en tareas de agarre y manipulación con dos brazos: los checkpoints intermedios cada 10k pasos permiten estudiar la evolución del aprendizaje y reutilizar representaciones visuales.
- Evaluación de infraestructura LeRobot/ROBOTIS: sirve para probar el fork `lerobot-cyclo`, el cargador `DiffusionPolicy.from_pretrained` y los flujos de entrenamiento y evaluación del ecosistema.
- Docencia y demostraciones de robótica: ejemplo completo de pipeline (recogida de datos, aumento, entrenamiento, checkpoints) adecuado para cursos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten. No se dispone de tasas de éxito en simulación ni en hardware real.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 4090 de 24 GB fue suficiente (100.000 pasos, batch 32, ~10,4 pasos/s, ~2 h 40 min).
- Inferencia: no se publican requisitos específicos. Con 287,5 M de parámetros y tres ResNet18, la huella de pesos en precisión completa ronda 1,1-1,2 GB; la VRAM adicional depende del backend y del tamaño de batch.
- GPU recomendadas: RTX 4090 o superior para entrenamiento; para inferencia se espera que quepa en GPUs de consumo con 8-16 GB, aunque no hay cifras confirmadas.
- Despliegue: el modelo se carga mediante `DiffusionPolicy.from_pretrained("padiredd/dp-openbottle-v4-visual-dr-200")` del fork LeRobot de ROBOTIS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles para inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia categórica, las diffusion policies de LeRobot para tareas de manipulación suelen tener decenas de millones de parámetros; este modelo, con 287,5 M, es relativamente grande para una política específica de tarea, pero no hay datos públicos de rendimiento que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| dp-openbottle-v4-visual-dr-200 | 287,5 M | 64 pasos (32 ejecutados) | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea open-bottle v4 sobre el robot FFW SG2; no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que se desconoce su fiabilidad real, incluso en simulación.
- Entrenada solo en simulación: no hay evidencia de transferencia a hardware real (sim-to-real), que suele requerir ajuste adicional.
- Dataset pequeño y sesgado: 200 demostraciones exitosas, todas de una misma recogida y con un único operador de recogida; posibles sesgos de trayectoria y de condiciones iniciales.
- Dependencia de un fork: requiere el fork `lerobot-cyclo` de ROBOTIS, no el LeRobot estándar, lo que puede complicar la reproducibilidad y el mantenimiento.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier uso productivo.
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política de imitación, puede generar trayectorias fuera de distribución ante observaciones no vistas, con riesgo de colisiones o fallos de agarre.
- Idiomas: no aplica; la única entrada textual es la cadena de tarea en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-openbottle-v4-visual-dr-200
- Colección del autor (2026-11-04): https://huggingface.co/collections/padiredd/2026-11-04
