# padiredd/pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-drop10-dp

## Resumen

`pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-drop10-dp` es una política de difusión (diffusion policy) para control robótico de manipulación, publicada por el usuario `padiredd` en HuggingFace bajo la librería LeRobot (versión 0.6.1, fork `lerobot-cyclo` de ROBOTIS). El modelo resuelve una tarea concreta: que el brazo izquierdo del robot ROBOTIS FFW BG2 coja un bloque verde lima de 5x5x4 cm con un agujero pasante desde una mesa gris, en un entorno simulado con una placa de espuma en el borde lejano. No es un modelo de lenguaje: es un policy de aprendizaje por imitación que mapea observaciones (tres cámaras de 240x240 más un vector de estado propioceptivo de 22 dimensiones) a acciones de 16 dimensiones.

El entrenamiento se realizó íntegramente sobre 250 episodios simulados generados en Isaac Lab (Cyclo Lab) mediante un planificador scriptado con cinemática inversa, sin datos reales. La arquitectura es una diffusion policy con encoder ResNet18 y 287,5 millones de parámetros, entrenada durante 100 000 pasos con DDPM de 100 timesteps de entrenamiento y un horizonte de predicción de 64 pasos (32 acciones ejecutables). La relevancia actual reside en que ejemplifica el flujo estándar de LeRobot para políticas de manipulación con aumento de datos agresivo y robustez inyectada en el estado propioceptivo, un patrón habitual en investigación de sim-to-real.

El checkpoint es el paso 100 000 y está pensado para evaluación en el mismo entorno simulado (entorno `board`, con el bloque en cualquier punto de la caja de entrenamiento de 10x10 cm centrada en (x 0,48, y 0,19) m). La model card advierte que las dimensiones de estado 8-21 (brazo derecho, cabeza, elevación y odometría) son constantes en los datos de entrenamiento y deben fijarse a su punto medio en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 y horizonte de predicción de 64 pasos |
| Parametros totales | 287.533.680 (~288 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control; horizonte de 64 pasos, 32 acciones ejecutables, 1 paso de observación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue el esquema de diffusion policy: un proceso DDPM con 100 timesteps de entrenamiento que genera secuencias de acción condicionadas por observaciones. El encoder visual es una ResNet18 que procesa tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha), cada una reescalada a 240x240 con interpolación `cv2 INTER_AREA`, siguiendo la receta de tres cámaras del laboratorio. La entrada propioceptiva es un vector de estado de 22 dimensiones y la salida son 16 dimensiones de acción. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32 acciones, con un paso de observación entre predicciones.

El entrenamiento usó 250 episodios simulados (38 550 fotogramas a 15 fps) recogidos en Isaac Lab con un planificador scriptado e IK, con el bloque colocado en una caja de 10x10 cm centrada en (x 0,48, y 0,19) m. Se entrenó 100 000 pasos con batch 8, Adam (lr 1e-4, betas 0.95/0.999, weight decay 1e-6), schedule coseno con 500 pasos de warm-up. Se aplicó aumento de imagen agresivo (ColorJitter, sharpness, affine, perspective, blur, erasing, grayscale) y ruido de propiocepción solo en entrenamiento: gaussiano con sigma de 1 grado sobre las articulaciones del brazo izquierdo (dims 0-6) y dropout de estado en el 10 % de las muestras (dims 0-6 a cero, rango medio normalizado); el gripper nunca se añadió ruido. La pérdida final de entrenamiento fue 0,002 (0,001 sin ruido de estado).

## Capacidades

- Manipulación robótica de pick-and-place: coger un bloque de 5x5x4 cm con agujero pasante desde una mesa gris en simulación.
- Control del brazo izquierdo del ROBOTIS FFW BG2 con 16 dimensiones de acción.
- Fusión multimodal de tres cámaras (cabeza izquierda, muñeca izquierda, muñeca derecha) a 240x240.
- Condicionamiento por estado propioceptivo de 22 dimensiones (articulaciones del brazo izquierdo, brazo derecho, cabeza, elevación y odometría).
- Generación de trayectorias de acción multimodales mediante difusión (DDPM con 100 timesteps; compatible con DDIM de 10 pasos y eta 0).
- Robustez parcial a ruido articular de hasta 1 grado en el brazo izquierdo, gracias al entrenamiento con ruido y dropout de estado.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es una política de control, no un modelo generativo de texto.

## Casos de uso

- Evaluación de políticas de imitación en simulación: el modelo sirve como referencia para medir éxito de pick-and-place en el entorno `board` de Isaac Lab con el bloque en cualquier punto de la caja de entrenamiento, usando DDPM-100 o DDIM-10.
- Baseline para estudios de robustez propioceptiva: permite comparar el efecto del ruido gaussiano de 1 grado y del dropout de estado frente a un entrenamiento limpio (pérdida 0,002 frente a 0,001) en condiciones controladas.
- Prueba de pipelines de despliegue LeRobot: al ser un checkpoint LeRobot 0.6.1 en safetensors, se puede cargar directamente en el fork `lerobot-cyclo` para validar el flujo de inferencia con tres cámaras y fijación de dimensiones constantes.
- Generación de datos sintéticos para sim-to-real: las trayectorias que produce pueden servir como profesor o como datos de aumento en experimentos de transferencia a un FFW BG2 real, siempre que se reentrene o adapte el dominio visual.
- Comparación de samplers de difusión en robótica: sirve para medir la degradación de éxito al pasar de 100 pasos DDPM a 10 pasos DDIM (en la evaluación reportada ambos alcanzan 50/50).
- Validación de recetas de aumento de imagen: el uso de ColorJitter, affine, perspective, blur, erasing y grayscale permite estudiar qué transformaciones son necesarias para generalizar dentro de la caja de colocación de 10x10 cm.
- Docencia y reproducción de experimentos: por su licencia Apache-2.0 y tamaño de repo de 1,2 GB, es adecuado para prácticas de políticas de difusión en laboratorios con GPU de gama media.

## Benchmarks y rendimiento

Evaluación en simulación (50 episodios, entorno `board`, bloque en cualquier punto de la caja de entrenamiento, pose inicial del yaml, semilla 0, estado limpio sin ruido inyectado):

| Sampler | Éxito de agarre |
|---|---|
| DDPM-100 (el del checkpoint) | 50/50 (100 %) |
| DDIM-10, eta 0 | 50/50 (100 %) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de una política robótica y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 287,5 M parámetros en safetensors y un repo de 1,2 GB, una estimación razonable en fp32 ronda los 1,2 GB de pesos más el coste de activaciones de la ResNet18 y del proceso de difusión; no se han publicado cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPU de consumo, pero el autor no lo especifica.
- ¿Cabe en GPU de consumo? Probable por el tamaño del modelo, pero no confirmado en la información disponible.
- Opciones de despliegue: LeRobot 0.6.1 (fork `lerobot-cyclo` de ROBOTIS), con carga de safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La evaluación usa DDPM-100 y DDIM-10, lo que sugiere que la variante DDIM reduce el coste de muestreo, pero no se publican tiempos.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la información disponible. Como referencia cualitativa, dentro del ecosistema LeRobot existen otras políticas de difusión y de imitación (ACT, TDMPC, VQ-BeT), pero no se dispone de datos de parámetros, contexto ni rendimiento de esas alternativas en esta ficha, por lo que la comparación cuantitativa queda como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-drop10-dp | 287,5 M | No aplica (horizonte 64) | Apache-2.0 | HuggingFace (LeRobot) |
| Alternativas LeRobot (ACT, TDMPC, VQ-BeT) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos simulados de Isaac Lab: no hay evidencia de transferencia a un robot real ni de robustez ante cambios de iluminación, textura o cámara del mundo físico.
- El bloque debe estar dentro de la caja de entrenamiento de 10x10 cm centrada en (x 0,48, y 0,19) m; fuera de ese rango el rendimiento no está caracterizado.
- Las dimensiones de estado 8-21 (brazo derecho, cabeza, elevación y odometría) son constantes en los datos de entrenamiento y deben fijarse a su punto medio en inferencia; si se alimentan valores distintos, el comportamiento no está validado.
- La evaluación reportada usa estado limpio (sin ruido inyectado); el ruido de 1 grado y el dropout de estado solo se aplicaron en entrenamiento, por lo que el rendimiento con perturbaciones en inferencia no está cuantificado.
- No hay datos de sesgos, alucinación ni comportamiento fuera de distribución más allá de la evaluación de 50 episodios con semilla 0.
- Licencia Apache-2.0: permite uso comercial, pero el modelo depende de LeRobot 0.6.1 y del fork `lerobot-cyclo` de ROBOTIS, cuyas condiciones deben revisarse por separado.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de texto, agentes o tool calling.
- El checkpoint corresponde al paso 100 000; no se documentan versiones intermedias ni curvas de entrenamiento más allá de la pérdida final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/pick-cube-lime-sim-250-board-3cam-heavyaug-sn1deg-drop10-dp
- LeRobot (librería): https://github.com/huggingface/lerobot
- Isaac Lab (entorno de simulación): https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW BG2: no disponible en la información proporcionada
- Paper de diffusion policy: no disponible en la información proporcionada
- Repositorio del fork `lerobot-cyclo`: no disponible en la información proporcionada
