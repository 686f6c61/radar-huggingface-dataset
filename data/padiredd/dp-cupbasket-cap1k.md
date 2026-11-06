# padiredd/dp-cupbasket-cap1k

## Resumen

dp-cupbasket-cap1k es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario padiredd, publicada en Hugging Face bajo el ecosistema LeRobot. El modelo está entrenado para ejecutar una tarea concreta de manipulación: recoger un vaso azul con la mano izquierda, transferirlo a la mano derecha y depositarlo sobre una cesta de mimbre invertida, empleando el robot bimanual ROBOTIS FFW SG2 equipado con pinzas CAD y cámaras de muñeca calibradas.

Con 287.533.680 parámetros (aproximadamente 288 M), el modelo sigue la arquitectura de diffusion policy con un codificador visual ResNet18 por cámara y un proceso DDPM de 100 pasos. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador de acciones que mapea observaciones multimodales (tres cámaras de 240x240 píxeles más un estado articular de 22 dimensiones) a 16 objetivos articulares a 15 Hz.

Su relevancia radica en que ejemplifica el flujo de trabajo actual de LeRobot para entrenar políticas robóticas en simulación (Isaac Lab) con datos generados mediante programas "code-as-policy", publicando además checkpoints intermedios cada 10.000 pasos. Es un artefacto de investigación reproducible, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos) con codificador visual ResNet18 por cámara |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (n_obs_steps = 1; horizonte de predicción de 64 pasos, 32 ejecutados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una diffusion policy sobre el fork lerobot-cyclo de ROBOTIS para LeRobot. La entrada combina tres cámaras (cabeza, muñeca izquierda y muñeca derecha) a 240x240 píxeles, cada una procesada por un ResNet18 independiente, junto con un vector de estado articular de 22 dimensiones. La salida es una secuencia de 16 objetivos articulares a 15 Hz, generada mediante un proceso DDPM de 100 pasos con horizonte de predicción de 64 pasos y 32 pasos ejecutados. El entrenamiento usó Adam con tasa de aprendizaje 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100.000 pasos en una única NVIDIA RTX 4090 de 24 GB.

Los datos de entrenamiento provienen del dataset `pick-cup-basket-cap1k-3cam` (no publicado aún en Hugging Face), compuesto por 1.011 demostraciones exitosas en simulación generadas mediante un programa code-as-policy (`cup_handover_v3.py`) dentro de Isaac Lab, con el robot FFW SG2 y pinzas CAD. Cada episodio introduce aleatorización en la inclinación y azimut del agarre, la profundidad, el pre-cierre, la altura de agarre, el desplazamiento y giro de colocación y los tiempos. Se aplicó un muestreo uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot) y una augmentación de imagen intensa y aleatoria (brillo, contraste, saturación, tono, nitidez, transformaciones afines, perspectiva, desenfoque, borrado aleatorio y escala de grises, hasta cinco transformaciones combinadas). No se aplicó ruido al estado.

## Capacidades

- Generación de trayectorias de acciones articulares para control bimanual del robot FFW SG2.
- Percepción visual multimodal mediante tres cámaras simultáneas (cabeza y dos muñecas).
- Ejecución de una tarea específica de manipulación: agarre con pinza izquierda, transferencia entre manos y colocación sobre una cesta.
- Robustez a variaciones visuales gracias a la augmentación agresiva durante el entrenamiento.
- Control a 15 Hz con predicción de horizontes de 64 pasos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades lingüísticas.
- No dispone de modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en políticas de difusión para manipulación bimanual: sirve como referencia reproducible para comparar recetas de entrenamiento en simulación, dado que publica checkpoints cada 10.000 pasos y una configuración detallada.
- Transferencia sim-to-real de tareas de handover: el modelo puede evaluarse en el robot físico FFW SG2 para estudiar la brecha entre simulación y realidad en tareas de paso de objetos entre manos.
- Generación de datos sintéticos con code-as-policy: el pipeline descrito (programa `cup_handover_v3.py` en Isaac Lab) puede reutilizarse para crear datasets de tareas análogas con aleatorización controlada.
- Benchmark de augmentación visual en robótica: la receta de augmentación intensa permite estudiar su efecto en la generalización de políticas visuomotoras.
- Docencia y formación en LeRobot: el modelo y sus checkpoints intermedios son útiles para ilustrar el ciclo completo de entrenamiento de una diffusion policy con LeRobot.
- Estudio de estabilidad de checkpoints: los diez checkpoints intermedios permiten analizar la evolución del aprendizaje y detectar sobreajuste o colapso de política a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez se ejecuten.

## Requisitos de hardware

- Entrenamiento realizado en una única NVIDIA RTX 4090 de 24 GB, por lo que el modelo cabe holgadamente en GPU de consumo para inferencia.
- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M parámetros en safetensors y tres ResNet18, la huella es moderada y compatible con GPUs de 8-12 GB en fp32/fp16, aunque no se ha verificado.
- GPU recomendadas: RTX 4090 (usada en entrenamiento), así como A100 o H100 para despliegues de mayor throughput; GPUs consumer de gama media probablemente suficientes para inferencia.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-cap1k")`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es de 15 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-cap1k | 287,5 M | Horizonte 64, 32 ejecutados, n_obs_steps 1 | Handover bimanual de vaso a cesta (FFW SG2) | other | Hugging Face, checkpoints cada 10k pasos |
| Otras diffusion policies de LeRobot | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |
| Políticas ACT de LeRobot | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |

No se dispone de datos públicos suficientes para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Modelo altamente especializado: solo ejecuta la tarea de handover de vaso a cesta con el robot FFW SG2 y pinzas CAD; no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Entrenado exclusivamente en simulación (Isaac Lab); el rendimiento sim-to-real no está validado y la model card no reporta evaluaciones.
- El dataset de entrenamiento (`pick-cup-basket-cap1k-3cam`) no está publicado en Hugging Face, lo que limita la reproducibilidad completa.
- Licencia "other": no se especifican términos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Sesgos potenciales derivados de la aleatorización limitada a los rangos de las demostraciones reales (posiciones de vaso y cesta, altura, tiempos).
- Sin soporte lingüístico, tool calling ni agentes; no es adecuado para tareas de razonamiento o conversación.
- Los checkpoints intermedios pueden presentar políticas inestables; solo el paso 100k está documentado como versión principal.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-cap1k
- LeRobot (framework): https://github.com/huggingface/lerobot
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- Fork lerobot-cyclo de ROBOTIS: no disponible como enlace directo en la información proporcionada
- Dataset `pick-cup-basket-cap1k-3cam`: no disponible en Hugging Face según la model card
- Programa code-as-policy `cup_handover_v3.py`: no disponible como enlace público en la información proporcionada
