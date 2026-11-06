# padiredd/dp-blockpick-2k-withoutpush

## Resumen

`dp-blockpick-2k-withoutpush` es una política de difusión (diffusion policy) para robótica desarrollada por el usuario padiredd, publicada en Hugging Face bajo el ecosistema LeRobot. Concretamente, se trata de un modelo de 287,5 millones de parámetros entrenado para ejecutar una tarea de pick-and-place vertical (recogida de un bloque desde arriba) con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas. El modelo no es un LLM ni un modelo de lenguaje: es un controlador visomotor que mapea observaciones (tres cámaras de 240x240 más un vector de estado articular de 22 dimensiones) a 16 objetivos articulares a 15 Hz.

Su relevancia es metodológica más que de producto: el autor lo publica como parte de un experimento controlado sobre generación de datos sintéticos. Compara tres políticas entrenadas con exactamente los mismos seeds, colocaciones de bloque, región de mesa y aleatorización, diferenciándose solo en el generador de demos: un planificador de movimiento, un programa code-as-policy con los valores por defecto y este tercero, que corrige dos defectos del programa CaP (el levantamiento de 16 mm durante el cierre de la pinza, que provocaba deslizamientos, y los empujes articulares que hacían que la pinza flotase). El diagnóstico de partida es contundente: la política entrenada con las demos CaP por defecto colocaba 7 de 100 bloques, frente a 64 de 100 del planificador.

El modelo se distribuye con checkpoints intermedios cada 10.000 pasos hasta 100.000, lo que lo hace útil tanto como política final como para estudiar curvas de aprendizaje en imitación con datos simulados. Está entrenado íntegramente en simulación (Isaac Lab), por lo que su transferencia a hardware real no está validada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) con encoder ResNet18 por cámara y horizonte de predicción 64 / 32 ejecutados |
| Parametros totales | 287.533.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; n_obs_steps = 1) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo robótico); cadena de tarea en inglés: "pick up the lime green block with the left arm" |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (repo de 11,5 GB con checkpoints cada 10k pasos) |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy clásica en el fork `lerobot-cyclo` de ROBOTIS: un DDPM de 100 pasos de difusión que genera secuencias de acciones (horizonte 64, de las cuales se ejecutan 32) condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) pasa por un encoder ResNet18 independiente a resolución 240x240; a esas características visuales se concatenan 22 dimensiones de estado articular. La salida son 16 objetivos articulares publicados a 15 Hz. El entrenamiento usó Adam con learning rate 1e-4, scheduler coseno, batch de 32 y 100.000 pasos con semilla 1000, sobre una única NVIDIA A40 de 46 GB a aproximadamente 5,7 pasos por segundo.

Los datos provienen del dataset `pick-cube-2k-withoutpush-yaw45-full-dr2-3cam` (2.000 demos simuladas exitosas) generado con un programa code-as-policy en el que se corrigieron dos valores por defecto: `close_gripper compensate=False` (elimina el ascenso de 16 mm durante el cierre) y `--noise_scale 0` (elimina los empujes articulares ejecutados). Cada episodio consta de aproximación, cierre y elevación, con parámetros de pregrasp, elevación, timing y vía muestreados por episodio. La aleatorización incluye colocaciones con yaw entre 0 y 45 grados, ciclo de altura de mesa y randomización dr2. El muestreo de frames es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot). El aumento de imagen es agresivo y en orden aleatorio, aplicando hasta 5 de: brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No se añadió ruido de estado.

## Capacidades

- Control visomotor de pick-and-place vertical con brazo izquierdo sobre el robot FFW SG2 en simulación.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) con estado articular propioceptivo de 22 dimensiones.
- Generación de trayectorias multimodales mediante difusión (DDPM de 100 pasos), lo que permite representar distintas soluciones válidas para una misma observación.
- Generalización a colocaciones de bloque con yaw entre 0 y 45 grados y a variaciones de altura de mesa dentro del régimen de randomización dr2.
- Inferencia a 15 Hz con horizonte de acción de 32 pasos ejecutados por predicción.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades de lenguaje, visión general, audio o modo thinking: es exclusivamente una política de control.

## Casos de uso

- **Investigación en imitación con datos sintéticos**: comparar el efecto del generador de demos (planificador vs. code-as-policy con y sin correcciones) manteniendo constantes seeds, colocaciones y randomización, como hace el autor con las tres variantes publicadas.
- **Prototipado de pipelines LeRobot**: servir como referencia funcional de un `DiffusionPolicy.from_pretrained(...)` con tres cámaras, estado de 22 dimensiones y acción de 16 articulaciones, útil para validar integraciones antes de entrenar modelos propios.
- **Estudio de curvas de aprendizaje**: los checkpoints cada 10.000 pasos permiten analizar la evolución de la política y elegir un punto de compromiso entre coste de inferencia y calidad de colocación.
- **Ablación de aumentos de imagen**: la receta aplica un aumento agresivo (hasta 5 transformaciones simultáneas); el modelo sirve como base para medir el impacto de reducir o ampliar ese conjunto en tareas de pick vertical.
- **Generación de datos y evaluación en Isaac Lab**: al estar entrenado sobre demos de Isaac Lab, encaja en bucles de evaluación automática en simulación antes de plantear transferencia a hardware.
- **Docencia y divulgación en robótica de imitación**: un modelo de 287 M de parámetros con receta, hardware y hiperparámetros documentados explícitamente es un caso de estudio reproducible en cursos de aprendizaje por imitación.
- **Base para fine-tuning en tareas de agarre similares**: la representación de tres cámaras más estado articular puede reutilizarse para tareas de recogida con variaciones de objeto, siempre que se disponga de demos propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten. El único dato de rendimiento disponible es el diagnóstico cualitativo del autor sobre la variante con demos CaP por defecto (7/100 colocaciones frente a 64/100 del planificador), que no constituye una evaluación de este checkpoint.

## Requisitos de hardware

- Entrenamiento documentado: una NVIDIA A40 de 46 GB, batch 32, aproximadamente 5,7 pasos/s durante 100.000 pasos.
- VRAM de inferencia: no disponible de forma explícita; con 287,5 M de parámetros y tres ResNet18, la huella de pesos en FP32 ronda 1,2 GB, pero el consumo real depende del runtime y del tamaño de batch. Una GPU consumer de 8-12 GB debería ser suficiente en la práctica, aunque no está verificado en la información proporcionada.
- GPU recomendadas: A40 (validada para entrenamiento); para inferencia, cualquier GPU con soporte CUDA razonable (RTX 3090/4090, A100, H100) debería cubrir el modelo, sin datos de latencia publicados.
- Despliegue: el ecosistema natural es LeRobot (fork `lerobot-cyclo` de ROBOTIS) con `DiffusionPolicy.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se conoce la frecuencia de publicación de acciones (15 Hz) y la velocidad de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Generador de demos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dp-blockpick-2k-withoutpush | 287,5 M | 3 cámaras 240x240 + estado 22D | Pick vertical, brazo izquierdo FFW SG2 | CaP con defaults corregidos | other | Hugging Face (padiredd) |
| dp-blockpick-cap2k-yaw45 | no disponible | no disponible | Misma tarea y robot | CaP con defaults | no disponible | Hugging Face (padiredd) |
| dp-blockpick-yaw45-2k | no disponible | no disponible | Misma tarea y robot | Planificador de movimiento | no disponible | Hugging Face (padiredd) |

Las tres variantes comparten seeds (40001-40040), colocaciones, región de mesa y randomización, de modo que la comparación aísla el efecto del generador de demos. No se dispone de datos de benchmarks comparativos entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no hay evidencia de transferencia a hardware real ni de robustez frente a ruido sensorial físico.
- Tarea única y estrecha: pick vertical de un bloque lima con el brazo izquierdo; no generaliza a otros objetos, brazos o tareas sin reentrenamiento.
- El autor documenta que la variante con demos CaP por defecto solo colocaba 7/100 bloques, lo que subraya la sensibilidad de estas políticas a defectos sutiles en los datos de demostración.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier despliegue productivo.
- Sin evaluación publicada de este checkpoint: no hay métricas de éxito, robustez ni comparativas cuantitativas.
- El repositorio ocupa 11,5 GB por incluir checkpoints intermedios; conviene descargar solo el checkpoint raíz si no se necesita la curva completa.
- Riesgo de sobreajuste a la distribución de randomización dr2 y a las colocaciones con yaw 0-45 grados; fuera de ese régimen el comportamiento es desconocido.
- No apto para uso en lenguaje, visión general ni agentes conversacionales: cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-2k-withoutpush
- Dataset de demos: `pick-cube-2k-withoutpush-yaw45-full-dr2-3cam` (padiredd, Hugging Face)
- Variante con planificador: https://huggingface.co/padiredd/dp-blockpick-yaw45-2k
- Variante CaP con defaults: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45
- LeRobot (framework): https://github.com/huggingface/lerobot
- Isaac Lab (simulador): https://github.com/isaac-sim/IsaacLab
