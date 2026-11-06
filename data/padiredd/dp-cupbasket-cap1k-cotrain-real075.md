# padiredd/dp-cupbasket-cap1k-cotrain-real075

## Resumen

`dp-cupbasket-cap1k-cotrain-real075` es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario `padiredd`, orientada a la tarea de recoger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta de mimbre invertida. El modelo se construye sobre el fork `lerobot-cyclo` de LeRobot para el robot ROBOTIS FFW SG2 equipado con pinzas CAD y cámaras de muñeca calibradas, y cuenta con 287,5 millones de parámetros en formato safetensors.

La relevancia técnica del modelo reside en su estrategia de entrenamiento: combina 1.011 demostraciones simuladas generadas mediante un programa *code-as-policy* en Isaac Lab con 19 demostraciones reales de teleoperación, aplicando un muestreo mixto con alpha 0,75 a favor de los datos reales. Este enfoque de co-entrenamiento sim-to-real busca mitigar la brecha de dominio sin renunciar al volumen de datos sintéticos, un problema central en el aprendizaje por imitación aplicado a manipulación bimanual.

El repositorio incluye el checkpoint final (paso 100k) en la raíz y diez checkpoints intermedios cada 10.000 pasos. La model card indica que los resultados de evaluación se añadirán una vez ejecutados, por lo que no hay métricas de éxito publicadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | other |
| Formato de pesos | safetensors (LeRobot) |

Especificaciones adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Entradas | 3 cámaras (cabeza, muñeca izquierda, muñeca derecha) a 240x240 + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares, a 15 Hz |
| Horizonte de predicción | 64 pasos, 32 ejecutados |
| Pasos de difusión (DDPM) | 100 |
| Pasos de entrenamiento | 100.000 (checkpoints cada 10.000) |
| Batch size | 32 |
| Optimizador | Adam, LR 1e-4, scheduler coseno |
| Hardware de entrenamiento | 1x NVIDIA RTX 4090 24 GB |
| Semilla | 1000 |
| Tamaño del repo | 11,5 GB |

## Arquitectura y entrenamiento

El modelo es una diffusion policy que genera trayectorias de acciones mediante un proceso de difusión DDPM de 100 pasos. Cada una de las tres cámaras se procesa con un encoder ResNet18 independiente; las representaciones visuales se combinan con el estado articular de 22 dimensiones para condicionar la denoización de la secuencia de acciones. La política predice un horizonte de 64 pasos del que se ejecutan los 32 primeros, con `n_obs_steps = 1`, y emite 16 objetivos articulares a 15 Hz. El entrenamiento empleó 100.000 pasos con batch 32, Adam a 1e-4 con decaimiento coseno, sobre una única RTX 4090.

El dataset de entrenamiento es `pick-cup-basket-cap1k-3cam`, con 1.030 episodios en total: 1.011 demostraciones simuladas en Isaac Lab generadas por un programa *code-as-policy* (`cup_handover_v3.py`) con aleatorización por episodio de inclinación y azimut del pinzamiento, profundidad, altura de agarre, desplazamiento y orientación de colocación, y temporización; más 19 demostraciones reales de teleoperación del dataset `omkarpatil/pick-cup-and-place-on-basket`, redimensionadas al formato de simulación. El muestreo es de co-entrenamiento con alpha 0,75: cada muestra se extrae de los episodios reales con probabilidad 0,75 y, en caso contrario, de los simulados, mediante un `CotrainMixSampler` del parche `lerobot-cyclo`. Las estadísticas de normalización se calculan sobre el conjunto fusionado. Se aplica aumentación de imagen agresiva en orden aleatorio (hasta 5 transformaciones entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises), sin ruido añadido al estado.

## Capacidades

- Control bimanual de manipulación: coordinación de dos brazos para pinzar, transportar, transferir y colocar un objeto.
- Política visomotora condicionada por tres cámaras (cabeza y ambas muñecas) más estado articular.
- Generación de trayectorias de acción multimodales mediante difusión, lo que permite representar distribuciones de comportamiento no unimodales.
- Generalización dentro del dominio simulado gracias a la aleatorización de posiciones, orientaciones y temporización durante la generación de datos.
- Transferencia sim-to-real mediante co-entrenamiento con demostraciones reales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de control robótico, no un modelo de lenguaje.

## Casos de uso

- Investigación en manipulación bimanual: el modelo sirve como referencia reproducible para estudiar transferencia de habilidad entre manos en tareas de entrega y colocación, con checkpoints intermedios cada 10.000 pasos que permiten analizar la evolución del aprendizaje.
- Co-entrenamiento sim-to-real: utilizable como caso de estudio de mezcla de datos con alpha 0,75, comparando curvas de éxito en simulación frente a realidad para calibrar la proporción óptima de datos reales.
- Generación de datos sintéticos con code-as-policy: el pipeline descrito (programa `cup_handover_v3.py` en Isaac Lab) puede adaptarse para producir demostraciones de otras tareas de pinzamiento y colocación con el mismo robot.
- Despliegue en el ROBOTIS FFW SG2: la política está calibrada para esa plataforma concreta (pinzas CAD y cámaras de muñeca calibradas), por lo que es directamente aplicable en laboratorios que dispongan de ese hardware.
- Benchmark de diffusion policies en robótica: al incluir diez checkpoints intermedios y una receta completa (aumentación, sampler, normalización), facilita la comparación con otras políticas de imitación sobre la misma tarea.
- Estudio de robustez visual: la aumentación agresiva de imagen permite evaluar la sensibilidad de la política a cambios de iluminación, color y punto de vista en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- Entrenamiento realizado en una única NVIDIA RTX 4090 de 24 GB, por lo que el ajuste fino cabe en una GPU de consumo de gama alta.
- Inferencia: al tratarse de una política de 287,5 M de parámetros con tres encoders ResNet18, la VRAM necesaria es modesta; no se dispone de cifras medidas en la información proporcionada.
- GPU recomendadas: RTX 4090 (validada para entrenamiento); para inferencia, cualquier GPU con al menos 8-12 GB de VRAM debería ser suficiente, aunque no se confirma en la documentación.
- Despliegue: el modelo se carga mediante `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-cap1k-cotrain-real075")` del fork `lerobot-cyclo` de LeRobot. No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política opera a 15 Hz y ejecuta 32 de los 64 pasos del horizonte predicho.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras diffusion policies ni con modelos alternativos de manipulación bimanual.

## Limitaciones y advertencias

- Específico de hardware: entrenado para el ROBOTIS FFW SG2 con pinzas CAD y cámaras de muñeca calibradas; no es transferible sin recalibración a otras plataformas.
- Tarea única: la política está entrenada exclusivamente para la secuencia de pinzar el vaso, transferirlo entre manos y colocarlo sobre la cesta; no generaliza a otras tareas.
- Datos reales escasos: solo 19 demostraciones reales frente a 1.011 simuladas, lo que puede limitar la robustez ante condiciones reales no representadas en simulación.
- Sin métricas de éxito publicadas: la model card indica que los resultados de evaluación se añadirán más adelante, por lo que no hay evidencia cuantitativa de rendimiento en el mundo real.
- Dataset no disponible: el conjunto `pick-cup-basket-cap1k-3cam` no está publicado en Hugging Face, lo que dificulta la reproducibilidad del entrenamiento.
- Licencia "other": no se especifican los términos exactos; es necesario consultar al autor antes de cualquier uso comercial.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones fuera de distribución ante objetos, iluminación o posiciones no vistas durante el entrenamiento.
- Idiomas: no aplica; el modelo no procesa texto ni lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-cotrain-real075
- Dataset de demostraciones reales: https://huggingface.co/datasets/omkarpatil/pick-cup-and-place-on-basket
- LeRobot (framework base): https://github.com/huggingface/lerobot
- Isaac Lab (entorno de simulación): https://github.com/isaac-sim/IsaacLab
