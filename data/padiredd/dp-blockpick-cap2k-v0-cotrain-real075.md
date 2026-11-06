# padiredd/dp-blockpick-cap2k-v0-cotrain-real075

## Resumen

`dp-blockpick-cap2k-v0-cotrain-real075` es una política de difusión (diffusion policy) para robótica manipulativa, desarrollada por el usuario `padiredd` y publicada en Hugging Face dentro del ecosistema LeRobot. El modelo resuelve una tarea muy concreta: el agarre cenital (top-down pick) de un bloque verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador visomotor que mapea observaciones (tres cámaras de 240x240 más un vector de estado articular de 22 dimensiones) a 16 objetivos articulares a 15 Hz.

La relevancia técnica del checkpoint reside en su estrategia de entrenamiento: es un ejemplo de *co-training* sim-a-real con mezcla ponderada (`alpha 0.75 real`), en el que cada muestra del lote se extrae con probabilidad 0,75 de 14 demostraciones reales de teleoperación y con probabilidad 0,25 de 2.000 demostraciones simuladas generadas por un programa *code-as-policy*. Esto lo convierte en un caso de estudio útil para quienes trabajan en transferencia sim-a-real con pocos datos reales.

El modelo tiene 287.533.680 parámetros (aproximadamente 288 M), se distribuye en formato `safetensors` con un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) y nueve checkpoints intermedios cada 10.000 pasos. La licencia es `other`, sin idiomas declarados (no aplica, al ser un modelo robótico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con encoder ResNet18 por cámara |
| Parametros totales | 287.533.680 (≈288 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1, horizonte de predicción 64, 32 pasos ejecutados |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo robótico; cadena de tarea en inglés) |
| Licencia | other |
| Formato de pesos | safetensors (repositorio de 11,5 GB con checkpoint final y 9 intermedios) |

## Arquitectura y entrenamiento

La arquitectura es una *diffusion policy* clásica en el sentido de LeRobot: un backbone convolucional con una ResNet18 independiente por cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha), cada una a resolución 240x240, fusionado con el estado articular de 22 dimensiones para predecir una secuencia de 16 objetivos articulares mediante un proceso DDPM de 100 pasos de ruido. El horizonte de predicción es de 64 pasos con 32 ejecutados, un único paso de observación (`n_obs_steps=1`) y una frecuencia de control de 15 Hz. El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam a tasa 1e-4 con decaimiento coseno y semilla 1000, sobre una única NVIDIA RTX A5000 de 24 GB.

El dato más interesante es la composición del dataset y el muestreo. El conjunto fusionado tiene 2.014 episodios: 2.000 demostraciones simuladas generadas por un programa *code-as-policy* sin reintentos (`block_pick_v0.py`, con parámetros de prensión, elevación y temporización muestreados por episodio dentro de los rangos de aleatorización del planificador) y 14 demostraciones reales de teleoperación del mismo task (`omkarpatil/pick-lime-block`, 2.653 fotogramas redimensionados al formato sim). El muestreo `CotrainMixSampler` extrae cada muestra con probabilidad 0,75 de los episodios reales y 0,25 de los simulados (aproximadamente 24 muestras reales y 8 simuladas por lote), y las estadísticas de normalización se calculan sobre el conjunto fusionado. Se aplica aumento de imagen agresivo en orden aleatorio (hasta 5 de: brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio, escala de grises) y no se añade ruido al estado.

## Capacidades

- Control visomotor para agarre cenital de un bloque con el brazo izquierdo del ROBOTIS FFW SG2.
- Predicción de secuencias de acción (chunking) de 16 articulaciones a 15 Hz con horizonte de 64 pasos.
- Fusión multimodal de tres vistas de cámara (cabeza y ambas muñecas) más estado articular de 22 dimensiones.
- Robustez a variaciones visuales gracias al aumento de imagen agresivo durante el entrenamiento.
- Generalización limitada a la tarea y al robot especificados; no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- **Investigación en transferencia sim-a-real con pocos datos reales**: el checkpoint sirve como referencia reproducible de co-training con `alpha 0.75 real`, útil para comparar estrategias de mezcla frente a entrenamientos solo-sim o solo-real en tareas de pick-and-place.
- **Punto de partida para fine-tuning en el mismo robot**: al estar entrenado para el FFW SG2 con pinza CAD y cámaras calibradas, se puede reutilizar como inicialización para tareas de agarre similares en el mismo hardware, reduciendo el coste de recolección de datos reales.
- **Validación de pipelines LeRobot**: el repositorio incluye checkpoints cada 10.000 pasos, lo que permite estudiar curvas de aprendizaje y estabilidad del entrenamiento sin necesidad de reentrenar desde cero.
- **Evaluación de robustez visual**: el aumento de imagen aplicado (brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, afín ±10°, perspectiva 0,2) hace del modelo un banco de pruebas para medir sensibilidad a condiciones de iluminación y punto de vista en simulación Isaac Lab.
- **Docencia y reproducción de experimentos**: la receta completa (100k pasos, batch 32, Adam 1e-4, DDPM 100 pasos, semilla 1000, una RTX A5000) es replicable en un equipo de sobremesa con 24 GB de VRAM.
- **Generación de datos sintéticos como política**: el programa *code-as-policy* empleado para producir las 2.000 demostraciones simuladas puede reutilizarse como generador de datos para otras tareas de agarre con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- **Entrenamiento**: una NVIDIA RTX A5000 de 24 GB por ejecución, según la model card.
- **VRAM estimada para inferencia**: no disponible de forma explícita; con 288 M parámetros en fp32 los pesos ocupan aproximadamente 1,15 GB, más el estado del optimizador y las activaciones de las tres ResNet18 durante el entrenamiento. Para inferencia en fp32 se estima un consumo moderado, pero no se han publicado mediciones.
- **GPU recomendadas**: cualquier GPU con al menos 24 GB para reproducir el entrenamiento (RTX A5000, RTX 3090, RTX 4090, A100, H100). Para inferencia, una GPU consumer de gama media-alta debería ser suficiente, aunque no hay datos publicados.
- **Cabe en GPU consumer**: probablemente sí para inferencia; para entrenamiento se requiere una GPU de 24 GB como mínimo según la receta.
- **Opciones de despliegue**: LeRobot (`DiffusionPolicy.from_pretrained(...)`), con el fork `lerobot-cyclo` de ROBOTIS que incluye el `CotrainMixSampler`. No se han publicado conversiones a GGUF, ONNX ni TensorRT.
- **Latencia y throughput**: no disponibles. La frecuencia de control objetivo es 15 Hz, lo que impone un presupuesto de aproximadamente 66 ms por paso de inferencia con DDPM de 100 pasos de difusión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| `padiredd/dp-blockpick-cap2k-v0-cotrain-real075` | 287,5 M | horizonte 64, 32 ejecutados, 15 Hz | other | Hugging Face |
| `padiredd/dp-blockpick-yaw45-2k` | no disponible | no disponible | no disponible | Hugging Face (referenciado en la model card) |
| Diffusion Policy original (LeRobot) | variable según configuración | variable | Apache 2.0 (LeRobot) | Hugging Face / GitHub |

La comparación directa con el checkpoint `padiredd/dp-blockpick-yaw45-2k` es la más pertinente: según la model card, ambos comparten semillas, colocaciones de bloque (|yaw| 0-45°, signo aleatorio), región completa, ciclado de altura de mesa y aleatorización dr2, y difieren únicamente en el generador de demostraciones (planificador de movimiento frente a *code-as-policy*) y en la incorporación de las 14 demostraciones reales. No se dispone de datos de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- **Tarea y robot únicos**: el modelo está entrenado exclusivamente para el agarre cenital de un bloque verde lima con el brazo izquierdo del ROBOTIS FFW SG2; no generaliza a otras tareas, objetos ni robots sin fine-tuning.
- **Dataset real muy reducido**: solo 14 episodios reales (2.653 fotogramas) frente a 2.000 simulados, lo que limita la diversidad de condiciones reales cubiertas.
- **Sin evaluación publicada**: la model card indica que los resultados de evaluación se añadirán cuando se ejecuten; no hay evidencia cuantitativa de éxito en el mundo real.
- **Licencia `other`**: no se especifican los términos exactos de uso comercial; es necesario contactar con el autor o revisar el repositorio antes de un despliegue en producción.
- **Dependencia del fork `lerobot-cyclo`**: el `CotrainMixSampler` y la lógica de co-training no forman parte del LeRobot estándar, lo que complica la reproducción fuera del fork de ROBOTIS.
- **Dataset no publicado**: el conjunto `pick-cube-cap2k-v0-yaw45-full-dr2-3cam` no está disponible en Hugging Face, por lo que la reproducibilidad completa del entrenamiento no es posible actualmente.
- **Riesgo de sobreajuste a la simulación**: pese al aumento de imagen agresivo, la brecha visual sim-real sigue siendo el principal riesgo de fallo en despliegue físico.
- **Sin datos de sesgo ni alucinación**: al no ser un modelo de lenguaje, estas categorías no aplican, pero sí existe riesgo de fallo silencioso en la política de control ante condiciones fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap2k-v0-cotrain-real075
- Checkpoint de referencia citado: https://huggingface.co/padiredd/dp-blockpick-yaw45-2k
- Dataset real de teleoperación citado: https://huggingface.co/omkarpatil/pick-lime-block
- LeRobot (framework base): https://github.com/huggingface/lerobot
- ROBOTIS FFW SG2: no disponible en la información proporcionada
- Isaac Lab: no disponible en la información proporcionada
