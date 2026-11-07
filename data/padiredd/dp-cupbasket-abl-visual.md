# padiredd/dp-cupbasket-abl-visual

## Resumen
dp-cupbasket-abl-visual es una política de difusión (diffusion policy) para robótica manipulativa bimanual, publicada por el usuario padiredd en Hugging Face. El modelo aprende a ejecutar la tarea de coger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta, empleando el robot bimanual ROBOTIS FFW SG2 equipado con pinzas CAD y cámaras de muñeca calibradas. Forma parte de una familia de políticas entrenadas con una receta congelada común para experimentos de ablación de domain randomization.

El modelo tiene 287.533.680 parámetros (aproximadamente 288 M) y se distribuye en formato safetensors dentro de un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) en la raíz y diez checkpoints intermedios cada 10.000 pasos. Está construido sobre el fork de LeRobot de ROBOTIS (lerobot-cyclo) y se entrenó con 2.000 demostraciones exitosas en simulación generadas con Isaac Lab, concretamente en la variante de ablación con aleatorización visual (sin aleatorización física).

Su relevancia es metodológica: sirve como referencia reproducible para estudiar cómo afecta la aleatorización visual del dominio (aspecto de la mesa, fondo, color del vaso, iluminación) al rendimiento de una política de difusión, manteniendo constante el resto de la receta de entrenamiento respecto a las políticas de ablación de block-pick del mismo autor. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con codificador ResNet18 por cámara |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de acción 64, 32 ejecutados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La política sigue el paradigma de diffusion policy: un modelo generativo de difusión (DDPM con 100 pasos) que produce secuencias de acciones condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha, a 240x240 píxeles) se procesa con un ResNet18 independiente; la entrada se completa con un vector de estado articular de 22 dimensiones y la salida son 16 objetivos articulares a 15 Hz. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32, con un único paso de observación (n_obs_steps = 1).

El entrenamiento empleó 2.000 demostraciones exitosas en simulación (dataset `padiredd/Ablation_Cup_visual`), generadas con el programa cup_handover_v6.py sobre Isaac Lab, con semillas desde 60001 y muestreo uniforme sobre todos los fotogramas (EpisodeAwareSampler de LeRobot). La receta es fija y compartida con las políticas de ablación de block-pick: 100.000 pasos, batch de 32, Adam con tasa 1e-4 y decaimiento coseno, semilla 1000, sobre una única RTX 4090 de 24 GB. La innovación destacable es la aleatorización visual intensa (hasta 5 transformaciones en orden aleatorio: brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises) sin ruido de estado ni aleatorización física, lo que aísla el efecto de la variabilidad visual.

## Capacidades
- Generación de trayectorias de acción bimanual para la tarea específica de transferencia de un vaso a una cesta.
- Control a partir de tres vistas de cámara simultáneas más estado articular de 22 dimensiones.
- Predicción de secuencias de acción con horizonte de 64 pasos y ejecución de 32 (control por receding horizon).
- Robustez ante variaciones visuales del entorno (iluminación, colores, fondo, perspectiva) gracias a la aleatorización visual del entrenamiento.
- Ejecución en simulación sobre el robot ROBOTIS FFW SG2 con pinzas CAD.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de control motor, no un modelo de lenguaje.

## Casos de uso
- Investigación en domain randomization: comparar esta política (solo aleatorización visual) con las variantes de aleatorización física del mismo autor para cuantificar qué fuente de variabilidad mejora la transferencia sim-to-real.
- Reproducción de experimentos de ablación: los diez checkpoints intermedios permiten estudiar la evolución del aprendizaje cada 10.000 pasos sin reentrenar.
- Base para transferencia a robot real: la variante `padiredd/dp-cupbasket-real` del mismo autor sugiere un flujo de trabajo sim-to-real sobre el mismo hardware FFW SG2, y esta política puede servir como punto de partida o comparación.
- Evaluación de robustez visual: al haberse entrenado con jitter de color, iluminación y fondo, es adecuada para probar el comportamiento bajo cambios de aspecto del entorno en simulación.
- Docencia y formación en robótica de imitación: el repositorio incluye checkpoints por etapa y una receta completamente documentada, lo que facilita usar el modelo como ejemplo práctico de diffusion policy con LeRobot.
- Desarrollo de pipelines de manipulación bimanual: la arquitectura de tres cámaras y 16 acciones articulares sirve de plantilla para tareas de handover entre brazos en entornos simulados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M parámetros y tres ResNet18, el peso en precisión completa ronda 1,2 GB, pero el consumo real depende del pipeline de difusión y de los buffers de imagen.
- GPU de entrenamiento documentada: una RTX 4090 de 24 GB, compartida con como máximo otra ejecución de ablación.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-24 GB, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: LeRobot (carga mediante `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-abl-visual")`); no se documentan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Aleatorización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-abl-visual | 287,5 M | Handover de vaso a cesta (FFW SG2) | Solo visual | other | Hugging Face |
| padiredd/dp-cupbasket-cap1k | ~0,3 B | Handover de vaso a cesta | No disponible | other | Hugging Face |
| padiredd/dp-cupbasket-real | no disponible | Handover de vaso a cesta en robot real | No disponible | other | Hugging Face |

Las tres variantes pertenecen al mismo autor y comparten familia de tarea y hardware; las diferencias concretas de entrenamiento y rendimiento entre ellas no están documentadas en la información disponible.

## Limitaciones y advertencias
- Modelo altamente especializado: solo ejecuta la tarea de transferencia de vaso a cesta; no es reutilizable para otras tareas sin reentrenamiento.
- Entrenado exclusivamente en simulación (Isaac Lab); el rendimiento en robot real no está verificado en la información disponible.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de generalización.
- Sesgos conocidos: no documentados; al entrenarse con una única tarea y un único setup de robot, cualquier desviación de configuración (cámaras, calibración, pinzas) puede degradar el comportamiento.
- Riesgo de alucinación: no aplica en el sentido de texto, pero la política puede generar trayectorias no válidas fuera de la distribución de entrenamiento.
- Licencia "other": no se especifican los términos de uso comercial; es necesario consultar al autor antes de cualquier uso en producción.
- El repositorio ocupa 11,5 GB por incluir once checkpoints; conviene descargar solo el checkpoint necesario.
- No soporta instrucciones en lenguaje natural ni cambio de tarea mediante prompt; la tarea está fijada en el entrenamiento (task string: "pick up the blue cup with the left hand, hand it to the right hand, and place it on the basket").

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-abl-visual
- Variante cap1k: https://huggingface.co/padiredd/dp-cupbasket-cap1k
- Variante real: https://huggingface.co/padiredd/dp-cupbasket-real
- Dataset de entrenamiento citado: `padiredd/Ablation_Cup_visual` (referenciado en la model card; no se proporciona URL directa)
