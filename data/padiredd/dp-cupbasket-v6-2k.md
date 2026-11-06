# padiredd/dp-cupbasket-v6-2k

## Resumen

dp-cupbasket-v6-2k es una política de difusión (diffusion policy) para robótica manipulativa bimanual, publicada en Hugging Face por el usuario padiredd bajo el framework LeRobot. El modelo aprende a ejecutar la tarea de recoger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta, empleando el robot bimanual ROBOTIS FFW SG2 con pinzas CAD y cámaras de muñeca calibradas. Está entrenado exclusivamente sobre demostraciones en simulación (Isaac Lab), no sobre datos reales.

La arquitectura sigue el paradigma de diffusion policy: un modelo generativo que produce secuencias de acciones mediante difusión (DDPM con 100 pasos), condicionado por observaciones visuales de tres cámaras (cabeza y dos muñecas, 240x240 píxeles cada una) y un vector de estado articular de 22 dimensiones. Con 287,5 millones de parámetros y un backbone ResNet18 por cámara, el modelo genera 16 objetivos articulares a 15 Hz, ejecutando 32 de los 64 pasos de horizonte planificados.

Su relevancia es acotada y muy específica: se trata de un checkpoint de investigación para una única tarea, un único robot y un único conjunto de demostraciones sintéticas. No es un modelo de propósito general ni un modelo de lenguaje, sino un artefacto de política visuomotora cuyo interés reside en la reproducibilidad del pipeline LeRobot + Isaac Lab y en la parametrización concreta del handover bimanual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con backbone ResNet18 por cámara y cabeza de acciones; implementación LeRobot (fork lerobot-cyclo de ROBOTIS) |
| Parametros totales | 287.533.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; horizonte de predicción de 64 pasos, 32 ejecutados, n_obs_steps = 1 |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | No disponible (modelo robótico; la única cadena de texto es la task string en inglés) |
| Licencia | other (sin términos adicionales especificados en la model card) |
| Formato de pesos | safetensors (checkpoints LeRobot: raíz = paso 100k; subcarpetas step-50000 a step-90000) |

## Arquitectura y entrenamiento

El modelo es una diffusion policy clásica: un proceso de difusión DDPM con 100 pasos que genera, condicionado por las observaciones, una trayectoria de 64 pasos de acciones articulares de las que se ejecutan los 32 primeros. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) se procesa con un ResNet18 independiente a resolución 240x240; la observación se completa con un vector de estado de 22 dimensiones (estado articular) y una única observación por paso (n_obs_steps = 1). La salida son 16 objetivos articulares a 15 Hz. El entrenamiento usó Adam con learning rate 1e-4, scheduler coseno, batch de 32 y 100.000 pasos, con semilla 1000, sobre una única RTX 4090 de 24 GB.

Los datos de entrenamiento son aproximadamente 2.000 demostraciones exitosas en simulación (dataset `pick-cup-basket-v6-2k-3cam`, no publicado en Hugging Face), generadas con el script `cup_basket/programs/cup_handover_v6.py` el 2026-11-04. No hay domain randomization ni ruido de estado; el muestreo es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot). La única regularización es una aumentación de imagen agresiva y de orden aleatorio: hasta 5 transformaciones entre brillo (0,6-1,4), contraste (0,6-1,4), saturación (0,3-1,7), tono (±0,1), nitidez (0,3-2,0), afín (±10 grados / 10 % / 0,9-1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises. Destaca un detalle de diseño curioso: la orden de cierre de la pinza derecha se ejecuta a 0,50 pero se registra como 0,70, el máximo real del gripper, para compensar la diferencia entre simulación y hardware.

## Capacidades

- Ejecución de una única tarea manipulativa bimanual: recoger un vaso azul con la mano izquierda, transferirlo a la derecha y colocarlo sobre una cesta.
- Control bimanual coordinado con 16 objetivos articulares a 15 Hz sobre el ROBOTIS FFW SG2 con pinzas CAD.
- Percepción visual multi-cámara: fusión de vista de cabeza y dos vistas de muñeca a 240x240.
- Condicionamiento por estado articular de 22 dimensiones (n_obs_steps = 1).
- Generación de trayectorias multimodales mediante difusión (DDPM, 100 pasos), lo que en principio permite representar distribuciones de acción multimodales.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües, de visión general, audio o thinking mode: es una política visuomotora, no un modelo de lenguaje.

## Casos de uso

- Investigación en diffusion policies: punto de partida reproducible para estudiar el efecto de la aumentación de imagen agresiva y del muestreo uniforme de frames en tareas de manipulación bimanual con LeRobot.
- Reproducción de pipelines LeRobot + Isaac Lab: el checkpoint y los checkpoints intermedios (pasos 50k a 90k) permiten analizar curvas de aprendizaje y estabilidad del entrenamiento cada 10.000 pasos.
- Benchmark de handover bimanual: la tarea de transferencia de mano izquierda a derecha con punto de entrega desplazado 8 cm hacia el hombro derecho sirve como caso de prueba para comparar estrategias de coordinación bimanual.
- Estudio de sim-to-real en grippers: el truco de registrar el cierre a 0,70 cuando se ejecuta a 0,50 es un ejemplo documentado de compensación de discrepancias entre simulación y hardware real, útil para quienes diseñan controladores de pinza.
- Evaluación de robustez visual: dado que no hay domain randomization y solo aumentación de imagen, el modelo es un banco de pruebas para medir la brecha de generalización ante cambios de iluminación, fondo o cámara en el robot real.
- Docencia y formación en robótica de imitación: con 287 M de parámetros y entrenamiento en una sola RTX 4090, es un ejemplo asequible de pipeline completo (generación de demos, entrenamiento, despliegue) para cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez se ejecuten.

## Requisitos de hardware

- Entrenamiento documentado: una única NVIDIA RTX 4090 de 24 GB, en solitario (host "lab225"), 100.000 pasos con batch 32.
- VRAM de inferencia: no disponible de forma explícita; con 287,5 M de parámetros en safetensors (aproximadamente 1,15 GB en fp32) más los tres ResNet18 y el estado de difusión, se estima holgadamente por debajo de 8 GB, aunque la cifra no está publicada.
- GPU recomendadas: RTX 4090 (la usada en entrenamiento); cualquier GPU consumer con al menos 8 GB debería bastar para inferencia, si bien no hay confirmación del autor.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, aunque sin datos publicados de latencia.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-v6-2k")`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Como referencia de diseño, la política opera a 15 Hz y ejecuta 32 de los 64 pasos de horizonte, pero no se publica el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-v6-2k | 287,5 M | Horizonte 64, 32 ejecutados, 15 Hz | Handover bimanual de vaso a cesta (FFW SG2) | other | Hugging Face (padiredd) |
| Diffusion Policy original (Chi et al., 2023) | No disponible | Horizonte configurable | Manipulación genérica (Push-T, Robomimic) | No disponible | Código y checkpoints en el repo oficial de los autores |
| ACT / ALOHA (Zhao et al., 2023) | No disponible | No disponible | Manipulación bimanual de precisión | No disponible | Código y checkpoints públicos |
| Otros checkpoints LeRobot de la comunidad | Variable | Variable | Tareas diversas | Variable | Hugging Face (hub LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Modelo de tarea única: no generaliza a otras tareas, objetos, posiciones ni robots distintos del ROBOTIS FFW SG2 con pinzas CAD.
- Entrenado solo en simulación (Isaac Lab), sin domain randomization y sin ruido de estado: la brecha sim-to-real no está cuantificada y la model card no reporta evaluaciones en hardware real.
- Dataset de entrenamiento no publicado (`pick-cup-basket-v6-2k-3cam` no está en Hugging Face), lo que dificulta la reproducción exacta del entrenamiento.
- Licencia "other" sin términos detallados en la model card: el uso comercial es incierto y requiere contactar con el autor.
- Sin benchmarks ni resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito, ni en simulación ni en real.
- Riesgo de sobreajuste a los layouts de las semillas 60001+ (mismos layouts que el conjunto cup2k_v3) y a las condiciones visuales de la simulación, pese a la aumentación de imagen.
- Sin soporte de lenguaje natural más allá de la task string fija en inglés; no es adecuado para interacción conversacional ni para planificación simbólica.
- Cero descargas y cero likes en el momento de la consulta: no hay validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-v6-2k
- LeRobot (framework): https://github.com/huggingface/lerobot
- Fork lerobot-cyclo de ROBOTIS: no disponible en la información proporcionada
- Diffusion Policy (paper original, Chi et al.): no disponible en la información proporcionada
- Isaac Lab: no disponible en la información proporcionada
- Script de generación de demos `cup_basket/programs/cup_handover_v6.py`: no disponible públicamente en la información proporcionada
