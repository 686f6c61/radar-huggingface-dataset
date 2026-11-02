# padiredd/dp-blockpick-cotrain-dr-real075-statenoise

## Resumen

dp-blockpick-cotrain-dr-real075-statenoise es una política de difusión (diffusion policy) para robótica manipulativa desarrollada por el usuario padiredd, construida sobre el ecosistema LeRobot mediante un fork propio denominado lerobot-cyclo. El modelo resuelve una tarea muy concreta: el agarre cenital (top-down pick) de un bloque verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas sobre una mesa de 29,25 pulgadas. Con 287,5 millones de parámetros, se trata de un modelo de política de acción (no de un modelo de lenguaje) que mapea observaciones visuales y propioceptivas a trayectorias de articulaciones.

Su relevancia técnica reside en la estrategia de entrenamiento: co-entrenamiento (co-training) entre datos simulados con domain randomization agresiva y un pequeño conjunto de demostraciones reales de teleoperación, con un muestreo ponderado que da un 75 % de probabilidad a las muestras reales. Este enfoque híbrido sim-to-real es actualmente uno de los patrones más activos en robótica de aprendizaje, porque permite reducir la brecha de realidad sin necesidad de miles de demostraciones reales. El repositorio incluye además checkpoints intermedios cada 10 000 pasos, lo que facilita analizar la evolución del entrenamiento.

El modelo se publica como pesos safetensors compatibles con LeRobot, con una licencia marcada como "other" (no estándar), y no incluye resultados de evaluación en el momento de la publicación. Está orientado a investigación en manipulación robótica y a reproducción de experimentos sim-to-real, no a despliegue comercial directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 por cámara y horizonte de acción 64 (32 ejecutados) |
| Parámetros totales | 287.533.680 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (n_obs_steps = 1; horizonte de acción de 64 pasos, 32 ejecutados) |
| Tipos de cuantización | No disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (modelo de robótica; la tarea se especifica en inglés: "pick up the lime green block with the left arm") |
| Licencia | other (licencia no estándar; consultar el repositorio antes de cualquier uso) |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained` de LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy clásica en el sentido de LeRobot: un modelo generativo DDPM con 100 pasos de difusión que predice secuencias de acciones condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha, a 240x240 píxeles) se procesa con un encoder ResNet18 independiente, y la entrada se completa con un vector de estado articular de 22 dimensiones. La salida son 16 objetivos articulares a 15 Hz, con un horizonte de predicción de 64 pasos del que se ejecutan 32. El entrenamiento usó Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100 000 pasos en una única NVIDIA RTX A5000 de 24 GB (compartida al principio con otro entrenamiento, a unos 2,7 pasos/s).

El dato más interesante es la composición y el muestreo del dataset. El conjunto simulado contiene 10 000 demostraciones (1 695 003 fotogramas) generadas en Isaac Lab con domain randomization que cubre pose inicial (±2 grados), apertura/cierre de pinza por episodio, empujes lentos, focos de luz, desplazamientos de cámara, variación de timing y altura de mesa de -2 a +2 cm, además de randomization de apariencia (fondo con foto real de laboratorio, texturas de ambientCG o rejilla; aspecto de mesa nominal, color plano o textura; color y rugosidad del bloque). A ello se suman 14 demostraciones reales de teleoperación del mismo task (2 653 fotogramas, procedentes de `omkarpatil/pick-lime-block`, redimensionadas al formato de simulación), dando un total de 10 014 episodios. El muestreo de co-entrenamiento (`CotrainMixSampler`, parche propio sobre lerobot-cyclo) extrae cada muestra con probabilidad 0,75 de los episodios reales y 0,25 de los simulados, lo que resulta en aproximadamente 24 muestras reales y 8 simuladas por batch. Las estadísticas de normalización se calculan sobre el conjunto fusionado.

Como innovaciones adicionales, el entrenamiento aplica aumento de imagen agresivo en orden aleatorio (hasta 5 transformaciones de entre brillo, contraste, saturación, tono, nitidez, afin, perspectiva, desenfoque, borrado aleatorio y escala de grises) y añade ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado (`state_noise_std` en `config.json`, campo exclusivo del parche lerobot-cyclo; debe eliminarse para cargar con lerobot-cyclo estándar, ya que solo afecta al entrenamiento).

## Capacidades

- Generación de trayectorias de acción para manipulación robótica: predice 16 objetivos articulares a 15 Hz condicionados por tres vistas de cámara y el estado articular.
- Percepción visual multi-cámara: integra cabeza, muñeca izquierda y muñeca derecha a 240x240 mediante encoders ResNet18 independientes.
- Ejecución de una tarea específica de pick cenital: agarre de un bloque verde lima con el brazo izquierdo del ROBOTIS FFW SG2.
- Robustez a variaciones visuales: entrenado con randomization de apariencia (fondos, texturas, iluminación, color y rugosidad del bloque) y aumentos de imagen agresivos.
- Robustez a ruido propioceptivo: tolerancia inducida por el ruido gaussiano de 1 grado sobre las articulaciones del brazo izquierdo durante el entrenamiento.
- Control a frecuencia de 15 Hz con horizonte de predicción de 64 pasos y ejecución de 32 (replanificación periódica).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, diálogo multilingüe ni modalidades de audio; no es un modelo de lenguaje.

## Casos de uso

- Investigación en sim-to-real para manipulación: el modelo sirve como referencia reproducible de co-entrenamiento con ponderación 0,75 real / 0,25 sim, permitiendo estudiar cómo afecta la proporción de datos reales al rendimiento en el robot físico. Es adecuado porque el repositorio expone la receta completa y checkpoints cada 10 000 pasos.
- Evaluación de domain randomization: al haberse entrenado con randomization de apariencia e iluminación, puede emplearse para medir la transferencia a condiciones visuales no vistas (fondos, texturas, cambios de iluminación) en el mismo task.
- Estudio de robustez frente a ruido de estado: el campo `state_noise_std` permite reproducir el entrenamiento con ruido articular y comparar políticas con y sin él, útil para analizar la sensibilidad propioceptiva en políticas de difusión.
- Base para fine-tuning en tareas de pick-and-place: los pesos publicados pueden inicializar el entrenamiento de variantes del mismo task (otros colores de bloque, posiciones de mesa) con pocas demostraciones reales adicionales, aprovechando el conocimiento simulado.
- Análisis de curvas de aprendizaje: los checkpoints intermedios de 10k a 90k pasos permiten trazar la evolución de la política y detectar cuellos de botella del entrenamiento sin repetir el cómputo.
- Validación de infraestructura LeRobot: el modelo se carga con `DiffusionPolicy.from_pretrained` y sirve para verificar pipelines de inferencia, calibración de cámaras de muñeca y control a 15 Hz en el FFW SG2 antes de abordar tareas más complejas.
- Docencia y divulgación en robótica de aprendizaje: como ejemplo compacto (287 M parámetros) de política de difusión con co-entrenamiento sim-real, es útil en cursos y talleres sobre LeRobot e Isaac Lab.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados. No se dispone de tasas de éxito en simulación ni en el robot real, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 287,5 M parámetros en fp32 ocupan aproximadamente 1,15 GB de pesos, más el coste de los tres encoders ResNet18 y de las activaciones; en fp16 el peso se reduce a unos 0,6 GB. El repositorio ocupa 11,5 GB, pero incluye todos los checkpoints intermedios, no solo el final.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA RTX A5000 de 24 GB; para inferencia en tiempo real a 15 Hz se espera que baste con GPUs consumer modernas, aunque no se documentan requisitos mínimos.
- Cabe en GPU consumer: previsiblemente sí (RTX 3090, RTX 4090, RTX A5000 y similares), dado el tamaño del modelo; no confirmado por el autor.
- Opciones de despliegue: LeRobot con `DiffusionPolicy.from_pretrained`, preferiblemente con el fork lerobot-cyclo del autor (el campo `state_noise_std` debe eliminarse para usar lerobot-cyclo estándar). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato de rendimiento publicado es la velocidad de entrenamiento (~2,7 pasos/s en la A5000 compartida al inicio).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor. Como alternativas conceptuales de la misma categoría (políticas de difusión para manipulación en LeRobot) podrían citarse las diffusion policies genéricas de LeRobot y las políticas ACT (Action Chunking Transformer), pero no se dispone de información verificable sobre parámetros, contexto o rendimiento de variantes comparables en esta búsqueda, por lo que la comparación cuantitativa se marca como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cotrain-dr-real075-statenoise | 287,5 M | n_obs_steps = 1; horizonte 64/32 | No disponible | other | HuggingFace |
| Otras diffusion policies de LeRobot | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas ACT de LeRobot | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Tarea extremadamente específica: solo se ha entrenado para el pick cenital de un bloque verde lima con el brazo izquierdo del FFW SG2; no generaliza a otras tareas, objetos o brazos sin reentrenamiento.
- Ausencia de evaluación publicada: no hay tasas de éxito ni en simulación ni en el robot real, por lo que el rendimiento real es desconocido.
- Dependencia de hardware concreto: requiere la configuración exacta (ROBOTIS FFW SG2, pinza CAD, cámaras de muñeca calibradas, mesa de 29,25 pulgadas); cambios en la cinemática o la calibración pueden invalidar la política.
- Dependencia de un fork: el campo `state_noise_std` y el `CotrainMixSampler` pertenecen a un parche propio sobre lerobot-cyclo; la carga con la versión estándar exige eliminar ese campo y puede no reproducir exactamente el comportamiento.
- Conjunto real muy pequeño: solo 14 demostraciones reales (2 653 fotogramas), lo que limita la diversidad de condiciones reales cubiertas y aumenta el riesgo de sobreajuste a esas trayectorias.
- Riesgo de fallo silencioso: como política generativa, puede producir trayectorias plausibles pero incorrectas ante objetos o disposiciones fuera de distribución, sin señal de incertidumbre calibrada.
- Licencia "other" no estándar: no se especifican términos de uso comercial; es imprescindible revisar el repositorio antes de cualquier despliegue en producción.
- Idiomas no aplicables: no es un modelo de lenguaje, por lo que no procede evaluación multilingüe ni de sesgos lingüísticos.
- Sesgos de simulación: aunque se aplica domain randomization amplia, persisten sesgos del simulador Isaac Lab y de la apariencia de los datos sintéticos que pueden no cubrir condiciones reales de iluminación o materiales.
- Sin datos de cuantización: no se ofrecen variantes GGUF/INT8 ni instrucciones de despliegue en GPUs de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-cotrain-dr-real075-statenoise
- Dataset simulado: https://huggingface.co/datasets/padiredd/pick-cube-topdown-region10k-dr-dr2-3cam
- Dataset real de teleoperación: https://huggingface.co/datasets/omkarpatil/pick-lime-block
- LeRobot (framework base): https://github.com/huggingface/lerobot
- Isaac Lab (simulador): https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
