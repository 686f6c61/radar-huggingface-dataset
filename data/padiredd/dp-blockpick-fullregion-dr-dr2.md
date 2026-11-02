# padiredd/dp-blockpick-fullregion-dr-dr2

## Resumen

dp-blockpick-fullregion-dr-dr2 es una política de difusión (diffusion policy) para robótica manipulativa entrenada con LeRobot, el framework de aprendizaje por imitación de Hugging Face. La desarrolla el usuario padiredd y está diseñada para ejecutar una tarea concreta: recoger un bloque verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza ROBOTIS y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas.

El modelo tiene 287,5 millones de parámetros y se distribuye en formato safetensors con un repositorio de 11,5 GB que incluye el checkpoint final (100 000 pasos) en la raíz y nueve checkpoints intermedios cada 10 000 pasos. No es un modelo de lenguaje: es un policy de control motor que consume imágenes de tres cámaras (cabeza y ambas muñecas, 240x240 píxeles) más un vector de 22 dimensiones de estado articular, y produce 16 objetivos articulares a 15 Hz.

Su relevancia es acotada pero clara para quien trabaje en manipulación simulada: sirve como referencia reproducible de un pipeline completo de LeRobot con aleatorización de dominio agresiva (apariencia, iluminación, altura de mesa, ruido de cámara) entrenado en Isaac Lab, y como punto de partida para transferencia sim-a-real en el hardware SG2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con codificador ResNet18 por cámara y horizonte de predicción 64 (32 ejecutados) |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 1 paso (n_obs_steps=1) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico; incluye una cadena de tarea en inglés: "pick up the lime green block with the left arm") |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una diffusion policy clásica: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) se procesa con un ResNet18 independiente a 240x240; la representación visual se concatena con un vector de estado articular de 22 dimensiones y alimenta la red de difusión, que predice 16 objetivos articulares con horizonte 64 y ejecución de los primeros 32 pasos. La inferencia corre a 15 Hz.

El entrenamiento usó 10 000 demostraciones simuladas (1 695 003 fotogramas) del dataset `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam`, con muestreo uniforme sobre todos los fotogramas (EpisodeAwareSampler de LeRobot). La receta: 100 000 pasos, batch 32, Adam con learning rate 1e-4 y scheduler coseno, semilla 1000, sobre una única NVIDIA RTX A5000 de 24 GB a ~5,7 pasos/s. La innovación principal es la aleatorización de dominio (dr2): pose inicial ±2 grados, apertura/cierre de pinza por episodio, empujes lentos con etiquetas limpias, focos de luz, desplazamientos de cámara, variación de timing, altura de mesa de -2 a +2 cm y, además, aleatorización de apariencia (fondo con foto real de laboratorio, texturas de ambientCG o rejilla; aspecto de mesa nominal, color plano o textura; color y rugosidad del bloque). Sobre las imágenes se aplica aumento agresivo en orden aleatorio, hasta 5 de: brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No hay ruido añadido al estado.

## Capacidades

- Control motor de manipulación: genera trayectorias de 16 articulaciones para el brazo izquierdo del FFW SG2 a 15 Hz.
- Percepción visual multivista: integra cabeza y ambas muñecas simultáneamente para localizar y agarrar el bloque.
- Agarre top-down de un objeto concreto (bloque verde lima) sobre mesa, con pinza de dos dedos.
- Robustez a variaciones de apariencia, iluminación, altura de mesa y calibración de cámara gracias a la aleatorización de dominio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera del pipeline robótico descrito.

## Casos de uso

- Transferencia sim-a-real en el ROBOTIS FFW SG2: el checkpoint de 100k puede desplegarse directamente en el robot físico para validar la brecha de realidad, ya que la aleatorización de apariencia y la variación de altura de mesa buscan precisamente esa generalización.
- Punto de partida para fine-tuning en una tarea de pick-and-place propia: al estar en formato LeRobot, se puede reentrenar con un dataset propio de demostraciones manteniendo la arquitectura y la receta.
- Referencia de pipeline de LeRobot con Isaac Lab: sirve para comparar configuraciones de aumento de datos, muestreo y checkpoints intermedios (10k a 90k) en experimentos de aprendizaje por imitación.
- Evaluación de robustez frente a cambios de cámara: útil para estudiar cómo afectan desplazamientos y calibración de las cámaras de muñeca al éxito del agarre.
- Benchmark interno de diffusion policies en manipulación de un solo brazo: los checkpoints cada 10k pasos permiten trazar curvas de aprendizaje y comparar con otras políticas del mismo robot.
- Docencia y reproducción: como ejemplo completo y documentado de entrenamiento de una diffusion policy en simulación con 10 000 demostraciones, útil para cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten. El único dato de rendimiento es de entrenamiento: ~5,7 pasos/s en una RTX A5000 de 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287,5 M de parámetros en safetensors, la inferencia requiere cargar tres ResNet18 más la red de difusión, lo que en la práctica cabe holgadamente en GPUs de 8-12 GB.
- GPU de entrenamiento documentada: una NVIDIA RTX A5000 de 24 GB a ~5,7 pasos/s con batch 32.
- GPU recomendadas: RTX A5000, RTX 4090, A100 o H100 para entrenamiento; para inferencia basta una GPU consumer de gama media-alta.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, aunque no hay cifras oficiales de VRAM.
- Opciones de despliegue: LeRobot (fork lerobot-cyclo de ROBOTIS) mediante `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-fullregion-dr-dr2")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el control opera a 15 Hz y la receta de difusión usa 100 pasos DDPM, lo que condiciona el coste por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-fullregion-dr-dr2 | 287,5 M | 3 cámaras 240x240 + estado 22D, n_obs_steps=1 | Pick top-down con brazo izquierdo FFW SG2 | other | Hugging Face (padiredd) |
| Otras diffusion policies de LeRobot | no disponible | no disponible | Manipulación genérica | según autor | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Manipulación genérica | según autor | Hugging Face |

No se dispone de datos de benchmarks ni de parámetros de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Tarea única y muy específica: solo recoge un bloque verde lima con el brazo izquierdo en la configuración descrita; no generaliza a otros objetos, brazos o tareas sin reentrenamiento.
- Sin evaluación publicada: no hay métricas de éxito ni en simulación ni en real, por lo que el rendimiento real es desconocido.
- Entrenado exclusivamente en simulación (Isaac Lab): el gap sim-a-real, aunque mitigado por la aleatorización, no está cuantificado.
- Dependencia del hardware exacto: requiere el FFW SG2 con pinza ROBOTIS, cámaras de muñeca calibradas y mesa de 29,25 pulgadas; cambios de calibración o montaje pueden degradar el comportamiento.
- Licencia "other": no se especifican términos de uso comercial; hay que consultar al autor antes de cualquier despliegue productivo.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras en el robot físico; se recomienda supervisión y límites de seguridad.
- Idiomas no disponibles: la cadena de tarea está en inglés y no hay soporte multilingüe.
- Sesgos conocidos: no documentados; la aleatorización de apariencia puede no cubrir todas las condiciones reales de iluminación y fondo.
- Repositorio de 11,5 GB por incluir diez checkpoints; conviene descargar solo el necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-fullregion-dr-dr2
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-region10k-dr-dr2-3cam
- LeRobot (framework): https://github.com/huggingface/lerobot
- ROBOTIS (fabricante del FFW SG2 y fork lerobot-cyclo): https://www.robotis.us/
- Isaac Lab (entorno de simulación): https://github.com/isaac-sim/IsaacLab
