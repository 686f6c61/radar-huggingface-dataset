# padiredd/dp-cupbasket-v6-2k-cotrain-real075

## Resumen

dp-cupbasket-v6-2k-cotrain-real075 es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario padiredd, orientada a la tarea concreta de recoger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta. El modelo se distribuye a través de Hugging Face con el pipeline de robótica de LeRobot y está pensado para ejecutarse sobre el robot humanoide bimanual ROBOTIS FFW SG2, equipado con pinzas CAD y cámaras de muñeca calibradas.

Técnicamente es una política de difusión DDPM construida sobre un backbone ResNet18 por cámara, con 287,5 millones de parámetros y un horizonte de predicción de 64 pasos (32 ejecutados). Se entrenó mediante co-entrenamiento de datos simulados y reales: aproximadamente 2.000 demostraciones exitosas generadas en Isaac Lab con el script `cup_handover_v6.py`, más 19 demostraciones reales de teleoperación. El muestreo durante el entrenamiento da un 75 % de probabilidad a los episodios reales (alpha 0.75), una decisión de diseño que busca mitigar la brecha sim-a-real manteniendo la diversidad de la simulación.

El modelo es relevante como ejemplo de flujo de trabajo cotrain sim-real en robótica de manipulación, con checkpoints intermedios cada 10.000 pasos hasta 100.000 y un recetario de entrenamiento reproducible (batch 32, Adam 1e-4, DDPM 100 pasos, una sola RTX 4090). No obstante, se trata de un artefacto de investigación muy específico de una tarea y un hardware concretos, sin resultados de evaluación publicados todavía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (DDPM) con encoder ResNet18 por cámara; fork lerobot-cyclo (ROBOTIS) |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción 64 pasos, 32 ejecutados, n_obs_steps 1 |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | other |
| Formato de pesos | safetensors (checkpoints LeRobot: raíz = step 100k, subcarpetas step-10000 a step-90000) |

## Arquitectura y entrenamiento

La política sigue el paradigma de diffusion policy: genera trayectorias de acción mediante un proceso de difusión DDPM de 100 pasos de ruido, condicionado por observaciones visuales y de estado. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) pasa por un encoder ResNet18 independiente; las imágenes son de 240x240 píxeles. La entrada incluye además un vector de estado articular de 22 dimensiones, y la salida son 16 objetivos articulares a 15 Hz. El entrenamiento usó 100.000 pasos con batch 32, optimizador Adam con learning rate 1e-4 y scheduler coseno, semilla 1000, sobre una única NVIDIA RTX 4090 de 24 GB.

El dato más destacable es la estrategia de co-entrenamiento. El conjunto simulado (`pick-cup-basket-v6-2k-3cam`, no publicado en Hugging Face) contiene unas 2.000 demostraciones exitosas de la transferencia bimanual del vaso, generadas con el programa `cup_handover_v6.py` con seeds desde 60001, sin domain randomization. A ese conjunto se le añaden 19 demostraciones reales de teleoperación del dataset `omkarpatil/pick-cup-and-place-on-basket`, redimensionadas al formato de simulación. El `CotrainMixSampler` del parche lerobot-cyclo muestrea cada batch dando un 75 % de probabilidad a los episodios reales, y las estadísticas de normalización se calculan sobre el conjunto mezclado. La aumentación de imagen es agresiva: hasta cinco transformaciones aleatorias en orden aleatorio entre brillo (0,6-1,4), contraste (0,6-1,4), saturación (0,3-1,7), tono (±0,1), nitidez (0,3-2,0), afín (±10 grados / 10 % / 0,9-1,1), perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No se aplicó ruido al estado.

## Capacidades

- Generación de trayectorias de acción bimanual para la tarea de transferencia de un vaso de la mano izquierda a la derecha y su depósito sobre una cesta.
- Percepción visual multimodal a partir de tres cámaras simultáneas (cabeza y ambas muñecas) a 240x240.
- Control de 16 articulaciones a 15 Hz con horizonte de predicción de 64 pasos y ejecución de 32.
- Robustez a variaciones visuales gracias a la aumentación agresiva durante el entrenamiento (iluminación, color, perspectiva, oclusión parcial).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente de control motor visomotor.

## Casos de uso

- Investigación en manipulación bimanual: servir como referencia reproducible de una política de difusión para la tarea de handover de objetos entre manos, con recetario y checkpoints intermedios publicados.
- Estudio de co-entrenamiento sim-real: el modelo y su configuración de muestreo (alpha 0.75) permiten analizar cómo el peso relativo de datos reales frente a simulados afecta al rendimiento en el robot físico.
- Evaluación de técnicas de aumentación visual en políticas de difusión: la receta de hasta cinco transformaciones aleatorias puede replicarse o ablacionarse sobre este mismo checkpoint.
- Base para fine-tuning en tareas de pick-and-place sobre el ROBOTIS FFW SG2: al compartir arquitectura y espacio de acciones (16 articulaciones, 15 Hz), puede adaptarse a tareas similares con pocas demostraciones.
- Benchmark de despliegue en hardware de consumo: al haberse entrenado en una sola RTX 4090, sirve para medir latencia de inferencia de diffusion policies en GPUs no profesionales.
- Docencia y divulgación en robótica: ejemplo completo y documentado de pipeline LeRobot con datos simulados en Isaac Lab, teleoperación real y checkpoints intermedios para ilustrar el ciclo completo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 287,5 M de parámetros en safetensors y tres encoders ResNet18, la huella es modesta y cabe holgadamente en GPUs de consumo, pero el dato exacto no se ha publicado.
- GPU de entrenamiento documentada: una NVIDIA RTX 4090 de 24 GB (identificada como «lab225»), en solitario.
- GPU recomendadas para inferencia: cualquier GPU con al menos 8-12 GB de VRAM es probablemente suficiente; no hay cifras oficiales.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento declarado (RTX 4090).
- Opciones de despliegue: carga mediante `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-v6-2k-cotrain-real075")` del fork lerobot-cyclo de ROBOTIS; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; la frecuencia de control es de 15 Hz, lo que fija el presupuesto temporal por paso de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de diffusion policy para esta tarea, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo específico de una única tarea («pick up the blue cup with the left hand, hand it to the right hand, and place it on the basket») y de un robot concreto (ROBOTIS FFW SG2 con pinzas CAD y cámaras calibradas); no es generalizable sin fine-tuning.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de éxito en el robot real.
- El conjunto de datos simulado no está publicado en Hugging Face, lo que dificulta la reproducción exacta del entrenamiento.
- Solo 19 demostraciones reales frente a ~2.000 simuladas; el sesgo hacia la distribución simulada puede producir brecha sim-a-real pese al muestreo alpha 0.75.
- El entrenamiento simulado no usó domain randomization, lo que puede reducir la robustez ante cambios de iluminación, fondo o calibración de cámara en el entorno real.
- Licencia «other»: no se especifican los términos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Sin soporte multilingüe ni de texto: no debe evaluarse con benchmarks de lenguaje (MMLU, HumanEval, GSM8K).
- Los checkpoints intermedios cada 10.000 pasos pueden inducir a error si se cargan accidentalmente en lugar del checkpoint final de la raíz del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-v6-2k-cotrain-real075
- Dataset de demostraciones reales: https://huggingface.co/datasets/omkarpatil/pick-cup-and-place-on-basket
- Fork lerobot-cyclo de ROBOTIS: no disponible (no se proporciona URL en la información)
- Script de generación de datos simulados `cup_basket/programs/cup_handover_v6.py`: no disponible (no se proporciona URL)
- Paper o blog técnico: no disponible
