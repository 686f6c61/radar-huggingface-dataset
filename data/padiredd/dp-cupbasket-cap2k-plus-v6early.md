# padiredd/dp-cupbasket-cap2k-plus-v6early

## Resumen

dp-cupbasket-cap2k-plus-v6early es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario padiredd y publicada en HuggingFace bajo el ecosistema LeRobot. El modelo resuelve una tarea concreta de manipulación: recoger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta, usando el robot bimanual ROBOTIS FFW SG2 equipado con pinzas CAD y cámaras de muñeca calibradas. Con 287,5 millones de parámetros, se enmarca en la familia de políticas de imitación basadas en difusión, que generan trayectorias de acción mediante un proceso de denoising DDPM condicionado por observaciones visuales y de estado.

El modelo se entrenó sobre una mezcla de datos: 2.012 demostraciones simuladas de la versión 3 de la tarea (publicadas aparte) más aproximadamente 680 éxitos tempranos de la recolección v6, todavía en curso en el momento del entrenamiento. Esta decisión responde a una petición del usuario de obtener una primera versión funcional mientras se completaba el conjunto v6 definitivo. La inferencia opera a 15 Hz con un horizonte de predicción de 64 pasos, de los cuales se ejecutan 32.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo LeRobot + Isaac Lab para una tarea bimanual específica, con checkpoints intermedios cada 10.000 pasos y una receta de entrenamiento documentada en detalle. No es un modelo de propósito general ni un modelo de lenguaje: es un artefacto de investigación en robótica de imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con codificador visual ResNet18 por cámara, fork lerobot-cyclo de ROBOTIS |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 ejecutados, n_obs_steps = 1 |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de robótica; la tarea se define por cadena de texto en inglés) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |
| Entradas | 3 cámaras a 240x240 (cabeza, muñeca izquierda, muñeca derecha) + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares a 15 Hz |
| Frecuencia de control | 15 Hz |
| Checkpoints | paso 100k en la raíz; pasos 10k a 90k en subcarpetas |
| Tamaño del repo | 11,5 GB |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy estándar de LeRobot: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones. Cada una de las tres cámaras (cabeza y dos muñecas) pasa por un codificador ResNet18 independiente; las características visuales se concatenan con el vector de estado articular de 22 dimensiones para condicionar la red de denoising. El horizonte de predicción es de 64 pasos con 32 ejecutados y un único paso de observación (n_obs_steps = 1), lo que implica que el modelo reacciona a un solo frame de contexto por inferencia.

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con learning rate 1e-4 y scheduler coseno, semilla 1000, en una única NVIDIA RTX 4090 de 24 GB. Los datos combinan 2.012 demostraciones de la versión 3 (conjunto `pick-cup-basket-cap2k-3cam`) y unos 680 éxitos tempranos de la versión 6, recolectados con el programa `cup_handover_v6.py` el 2026-11-04. La v6 introduce cambios en la tarea: descenso completamente abierto hasta el borde de la cesta, punto de entrega 8 cm más cerca del hombro derecho, cierre derecho registrado como 0.70 y movimientos más cortos. El muestreo es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot).

La receta de aumento de datos es agresiva: orden aleatorio de hasta cinco transformaciones entre brillo (0,6-1,4), contraste (0,6-1,4), saturación (0,3-1,7), tono (±0,1), nitidez (0,3-2,0), afín (±10 grados / 10 % / 0,9-1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises. No se aplicó ruido al estado. Esta combinación busca robustez visual frente a variaciones de iluminación y calibración de cámara, un punto crítico en políticas de imitación que operan con cámaras de muñeca.

## Capacidades

- Generación de trayectorias bimanuales de 16 articulaciones a partir de observaciones visuales de tres cámaras y estado articular de 22 dimensiones.
- Ejecución de una tarea de manipulación específica: recogida de un vaso azul, transferencia entre manos y depósito sobre una cesta.
- Control reactivo a 15 Hz con horizonte de predicción de 64 pasos (32 ejecutados por inferencia).
- Robustez visual parcial gracias al aumento de datos agresivo aplicado durante el entrenamiento (iluminación, color, geometría, oclusión parcial).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es un modelo de política motora, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad fuera del dominio robótico descrito.

## Casos de uso

- Investigación en imitación bimanual: servir como punto de partida reproducible para estudiar transferencia entre manos y coordinación de dos efectores con políticas de difusión, aprovechando los checkpoints intermedios cada 10.000 pasos para analizar la evolución del aprendizaje.
- Benchmark de pipelines LeRobot + Isaac Lab: el modelo documenta con precisión la receta (ResNet18 por cámara, DDPM 100 pasos, horizonte 64/32), lo que permite reproducir el entrenamiento y comparar variantes de aumento de datos o de arquitectura visual.
- Prototipado de tareas pick-and-place sobre el ROBOTIS FFW SG2: al estar entrenado específicamente para ese robot y esas pinzas, puede desplegarse directamente en el hardware para validar la cadena de percepción-control antes de recolectar datos propios.
- Estudio de mezcla de datasets: la combinación de v3 y v6 temprana ofrece un caso concreto para analizar cómo afecta la inclusión de datos parciales de una versión nueva al rendimiento de una política de difusión.
- Evaluación de robustez visual: el aumento de datos aplicado (hasta cinco transformaciones aleatorias) permite estudiar la sensibilidad de la política a cambios de iluminación, color y geometría en entornos de laboratorio.
- Docencia y demostraciones de robótica de imitación: el tamaño contenido (287 M de parámetros) y el entrenamiento en una sola RTX 4090 lo hacen viable como ejemplo práctico en cursos o talleres sobre políticas de difusión.
- Base para fine-tuning en tareas de handover: la tarea de transferencia entre manos es un componente reutilizable en flujos más largos (ensamblaje, clasificación, empaquetado) que requieran pasar objetos de una pinza a otra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287,5 M de parámetros en precisión completa (fp32) el peso ronda 1,15 GB, y en fp16 aproximadamente 0,6 GB, a lo que hay que sumar las activaciones de los tres ResNet18 y la red de denoising. Cabe holgadamente en GPUs consumer.
- GPU recomendadas: el entrenamiento se realizó en una única NVIDIA RTX 4090 de 24 GB, por lo que esa tarjeta es suficiente tanto para entrenamiento como para inferencia. GPUs de gama media (RTX 3060 12 GB, RTX 4070) deberían bastar para inferencia, aunque no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del modelo y que el entrenamiento cupo en una RTX 4090.
- Opciones de despliegue: el ecosistema natural es LeRobot (carga mediante `DiffusionPolicy.from_pretrained`), con integración en el fork lerobot-cyclo de ROBOTIS. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control es de 15 Hz y cada inferencia ejecuta 32 pasos de acción, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-cap2k-plus-v6early | 287,5 M | Diffusion policy bimanual (LeRobot) | 64 pasos, 32 ejecutados | other | HuggingFace, repo de 11,5 GB |
| Diffusion Policy (Cheng et al., 2023) | no disponible | Diffusion policy general | no disponible | no disponible | Paper y código de referencia |
| ACT / Action Chunking Transformer (LeRobot) | no disponible | Transformer de imitación | no disponible | no disponible | Integrado en LeRobot |
| Otros modelos LeRobot del mismo autor | no disponible | Políticas de imitación | no disponible | no disponible | Repos de HuggingFace de padiredd |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a categoría, tipo de arquitectura y disponibilidad.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos en la información disponible. Es imprescindible revisar el texto completo de la licencia en el repositorio antes de cualquier uso comercial o redistribución.
- Modelo específico de una tarea y un robot: solo es válido para el ROBOTIS FFW SG2 con pinzas CAD y la configuración de cámaras descrita. No generaliza a otros robots, otras pinzas u otras disposiciones de cámara sin reentrenamiento.
- Datos de entrenamiento mixtos y parciales: la v6 solo aporta unos 680 éxitos tempranos frente a 2.012 demostraciones de v3, con cambios de tarea entre versiones (punto de entrega, cierre de pinza, longitud de movimientos). Esto puede introducir inconsistencias en la política aprendida.
- Sin evaluación publicada: no hay resultados de éxito en simulación ni en hardware real, por lo que se desconoce su fiabilidad en producción.
- Riesgo de sobreajuste a la distribución de las demostraciones: el muestreo uniforme sobre frames y el aumento de datos agresivo mitigan parcialmente el problema, pero no hay evidencia empírica de generalización.
- n_obs_steps = 1: la política reacciona a un único frame, lo que limita la capacidad de razonar sobre dinámica temporal o movimientos rápidos.
- Sin ruido de estado durante el entrenamiento: puede afectar a la robustez frente a errores de estimación de la posición articular en el robot real.
- Sin variantes cuantizadas publicadas: el despliegue en hardware de bajos recursos requeriría convertir los pesos, con el riesgo de degradación que ello conlleva.
- Riesgo de alucinación en el sentido de generar trayectorias plausibles pero incorrectas: como toda política de imitación, puede producir acciones fuera de distribución ante observaciones no vistas, sin mecanismo explícito de detección de fallo.
- Idiomas no aplicables: la tarea se define mediante una cadena de texto en inglés; no hay soporte multilingüe ni de instrucciones en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-cupbasket-cap2k-plus-v6early
- Dataset v3 de referencia (mencionado en la model card): https://huggingface.co/padiredd/pick-cup-basket-cap2k-3cam
- LeRobot (framework de entrenamiento e inferencia): https://github.com/huggingface/lerobot
- Diffusion Policy (paper de referencia): https://arxiv.org/abs/2303.04137
- Isaac Lab (entorno de simulación mencionado en los tags): https://github.com/isaac-sim/IsaacLab
- Perfil del autor en HuggingFace: https://huggingface.co/padiredd
