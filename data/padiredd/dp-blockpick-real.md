# padiredd/dp-blockpick-real

## Resumen

`dp-blockpick-real` es una política de difusión (diffusion policy) para robótica manipulativa, publicada por el usuario `padiredd` en Hugging Face y entrenada con el ecosistema LeRobot. El modelo resuelve una tarea concreta y muy específica: recoger un bloque de color lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2. No es un modelo de lenguaje ni un modelo fundacional generalista, sino un checkpoint de control motor entrenado exclusivamente con demostraciones reales de teleoperación.

La arquitectura subyacente es una Diffusion Policy clásica (DDPM con 100 pasos de difusión) que combina un codificador visual ResNet18 por cámara con un estado articular de 22 dimensiones como entrada, y genera 16 objetivos articulares como acción a 15 Hz. El modelo tiene 287.533.680 parámetros y se distribuye en formato `safetensors` dentro de un repositorio de 11,5 GB que incluye el checkpoint final (100k pasos) y nueve checkpoints intermedios cada 10.000 pasos.

Su relevancia es acotada pero clara para la comunidad de robótica open source: demuestra un flujo completo de entrenamiento con LeRobot sobre hardware real (una única RTX 4090 de 24 GB), con un conjunto de datos minúsculo (14 episodios, 2.653 fotogramas) y una receta reproducible. Es un ejemplo de referencia para quien quiera replicar el pipeline en el fork `lerobot-cyclo` de ROBOTIS, no un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM, 100 pasos de difusión) con codificador visual ResNet18 por cámara |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1, horizonte de predicción 64 pasos, 32 ejecutados |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena "pick up the lime green block with the left arm") |
| Licencia | other |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo es una Diffusion Policy estándar de LeRobot: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones visuales y propioceptivas. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha, a 240x240 píxeles) pasa por un ResNet18 independiente; el estado articular de 22 dimensiones se concatena como `n_obs_steps` = 1. La salida son 16 objetivos articulares a 15 Hz, con un horizonte de 64 pasos del que se ejecutan 32.

El entrenamiento usó exclusivamente demostraciones reales de teleoperación del dataset `omkarpatil/pick-lime-block`: 14 episodios válidos (uno abortado de 15) y 2.653 fotogramas, muestreados de forma uniforme con el `EpisodeAwareSampler` por defecto de LeRobot. La receta es de 100.000 pasos con batch 32, optimizador Adam a 1e-4 con scheduler coseno, semilla 1000, y una aumentación de imagen agresiva (hasta 5 transformaciones aleatorias en orden variable: brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises). No se aplicó ruido al estado. Todo el entrenamiento se ejecutó en una única NVIDIA RTX 4090 de 24 GB compartida entre dos ejecuciones simultáneas.

## Capacidades

- Control motor de manipulación: genera trayectorias articulares de 16 dimensiones para el brazo izquierdo del ROBOTIS FFW SG2 a 15 Hz.
- Percepción visual multi-cámara: consume tres vistas simultáneas (cabeza, muñeca izquierda, muñeca derecha) a 240x240.
- Condicionamiento por estado propioceptivo: integra 22 dimensiones de estado articular junto con las imágenes.
- Ejecución de una tarea única y concreta: recoger un bloque de color lima con el brazo izquierdo.
- Generación de acciones por difusión: produce secuencias multimodales de acciones mediante muestreo DDPM, lo que permite representar distribuciones de comportamiento no unimodales.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito (thinking mode), visión general, audio ni otras capacidades fundacionales.

## Casos de uso

- Replicación de experimentos de imitation learning: sirve como checkpoint de referencia para validar un pipeline completo de LeRobot con Diffusion Policy sobre hardware real, comparando el checkpoint final con los intermedios (`step-10000` a `step-90000`).
- Recogida de objetos en un banco de pruebas de laboratorio: el modelo ejecuta la tarea de picking de un bloque lima con el brazo izquierdo del FFW SG2, útil para medir tasas de éxito de la política en condiciones controladas.
- Estudio de aumentación de datos en políticas de difusión: la receta documenta una aumentación de imagen intensa y reproducible, lo que permite aislar su efecto sobre el rendimiento con un dataset de solo 2.653 fotogramas.
- Análisis de curvas de aprendizaje: los diez checkpoints publicados (cada 10.000 pasos) permiten trazar cómo evoluciona la política con el número de pasos de entrenamiento sin reentrenar.
- Base para fine-tuning con nuevas demostraciones: al ser un checkpoint LeRobot estándar, se puede partir de él y añadir episodios de teleoperación para adaptar la política a variantes de la tarea o a otros objetos.
- Docencia y formación en robótica open source: ejemplo didáctico de entrenamiento de una diffusion policy de 288 M parámetros en una sola GPU de consumo (RTX 4090), con todos los hiperparámetros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez se ejecuten ("Evaluation results are added once they are run"). No se dispone de tasas de éxito, métricas de error articular ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 287,5 M parámetros en precisión completa (fp32), los pesos ocupan aproximadamente 1,15 GB; en fp16, unos 0,58 GB. A ello hay que sumar la memoria de los tres codificadores ResNet18 y de las activaciones durante el muestreo DDPM de 100 pasos.
- GPU de entrenamiento documentada: una NVIDIA RTX 4090 de 24 GB, compartida entre dos ejecuciones simultáneas con batch 32.
- GPU recomendadas para inferencia: cualquier GPU con al menos 8-12 GB de VRAM debería ser suficiente para el modelo y las tres cámaras, aunque el dato no está confirmado en la información disponible.
- Cabe en GPU de consumo: sí, el entrenamiento se realizó en una RTX 4090, lo que confirma que el modelo es viable en hardware de consumo de gama alta.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-real")`) sobre el fork `lerobot-cyclo` de ROBOTIS. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control de la política es de 15 Hz, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Otras políticas de difusión de LeRobot podrían servir como referencia cualitativa, pero no se aportan datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa. Se indica, por tanto, "no disponible".

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-real | 287,5 M | no aplica | no disponible | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tarea única y no generalista: la política solo está entrenada para recoger un bloque lima con el brazo izquierdo del FFW SG2; no se espera que funcione en otras tareas, objetos o brazos sin reentrenamiento.
- Dataset minúsculo: 14 episodios y 2.653 fotogramas implican un riesgo alto de sobreajuste y baja robustez ante variaciones de iluminación, posición del objeto o del robot no vistas en las demostraciones.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de rendimiento, por lo que no se puede afirmar que la política funcione de forma fiable en el robot real.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial queda sujeto a la licencia del autor y a las condiciones del dataset de origen (`omkarpatil/pick-lime-block`), que deben verificarse antes de cualquier despliegue.
- Dependencia de un fork específico: el modelo se entrenó con el fork `lerobot-cyclo` de ROBOTIS, lo que puede introducir incompatibilidades con versiones estándar de LeRobot.
- Sin soporte multilingüe ni de lenguaje natural: la tarea se define mediante una cadena fija; no hay interfaz conversacional ni de instrucciones flexibles.
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política generativa, puede producir trayectorias fuera de distribución si el estado observado se aleja de las demostraciones.
- Sin cuantizaciones publicadas: no hay variantes GGUF ni int8, lo que limita el despliegue en hardware de muy bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-real
- Dataset de entrenamiento: `omkarpatil/pick-lime-block` (referenciado en la model card, sin URL directa proporcionada)
- Fork de LeRobot utilizado: `lerobot-cyclo` de ROBOTIS (referenciado en la model card, sin URL directa proporcionada)
- LeRobot (framework): no se proporciona URL en la información disponible
- Paper de Diffusion Policy: no se proporciona URL en la información disponible
