# padiredd/dp-blockpick-10k-table-texture-cotrain-real075-statenoise

## Resumen

`dp-blockpick-10k-table-texture-cotrain-real075-statenoise` es una política de difusión (diffusion policy) para robótica manipulativa desarrollada por el usuario padiredd, entrenada con la librería LeRobot mediante un fork propio denominado lerobot-cyclo. El modelo resuelve una tarea muy concreta: recoger un bloque verde lima con el brazo izquierdo del robot ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (tres cámaras más estado articular) a acciones articulares a 15 Hz.

La relevancia técnica del checkpoint está en su estrategia de entrenamiento: combina 10.000 demostraciones en simulación (Isaac Lab) con solo 14 demostraciones reales de teleoperación, aplicando un muestreo de co-training con alpha 0,75 a favor de los datos reales y ruido gaussiano de 1 grado sobre el estado articular durante el entrenamiento. Esto lo convierte en un caso de estudio de transferencia sim-a-real con datos reales escasos, un problema central en el despliegue práctico de políticas robóticas.

El modelo tiene 287.533.680 parámetros (aproximadamente 288 M), se distribuye en safetensors con un repositorio de 11,5 GB que incluye checkpoints intermedios cada 10.000 pasos, y su licencia es "other", sin especificación adicional por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con encoder ResNet18 por cámara; implementación LeRobot (fork lerobot-cyclo) |
| Parametros totales | 287.533.680 (288 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; usa n_obs_steps = 1) |
| Tipos de cuantizacion | No disponible (entrenado y publicado en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo robótico; la instrucción de tarea es una cadena fija en inglés) |
| Licencia | other (sin términos adicionales especificados por el autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política sigue el esquema de diffusion policy: un proceso DDPM de 100 pasos que genera secuencias de acción condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha) se procesa con un ResNet18 independiente a resolución 240x240; la observación se completa con un vector de estado articular de 22 dimensiones. La salida son 16 objetivos articulares a 15 Hz, con un horizonte de predicción de 64 pasos del que se ejecutan 32. El entrenamiento usó Adam con tasa 1e-4, schedule coseno, batch 32, semilla 1000 y 100.000 pasos, sobre una única NVIDIA RTX A5000 de 24 GB compartida inicialmente con otro entrenamiento (aproximadamente 2,7 pasos por segundo).

El conjunto de datos combina 10.000 demostraciones simuladas (1.695.003 frames) del dataset `pick-cube-topdown-region10k-dr-dr2-3cam`, con randomización de dominio amplia (pose inicial ±2 grados, apertura y cierre de pinza por episodio, empujes lentos, focos de luz, desplazamientos de cámara, altura de mesa ±2 cm) y randomización de apariencia (fondo con foto real de laboratorio, texturas de ambientCG o rejilla; aspecto de mesa nominal, color plano o texturizado; color y rugosidad del bloque). A ello se suman 14 demostraciones reales de teleoperación (`omkarpatil/pick-lime-block`, 2.653 frames), dando 10.014 episodios en total. El muestreo de co-training (CotrainMixSampler del parche lerobot-cyclo) extrae cada muestra de los episodios reales con probabilidad 0,75 y del resto en caso contrario, resultando en aproximadamente 24 muestras reales y 8 simuladas por batch. Las estadísticas de normalización se calculan sobre el conjunto fusionado.

Dos innovaciones destacan: la augmentación de imagen agresiva en orden aleatorio (hasta 5 transformaciones simultáneas entre brillo, contraste, saturación, tono, nitidez, afinidad, perspectiva, desenfoque, borrado aleatorio y escala de grises) y el ruido de estado de 1 grado gaussiano sobre las 7 posiciones articulares del brazo izquierdo durante el entrenamiento, controlado por el campo `state_noise_std` del config.json, que es específico del parche y debe eliminarse para cargar con lerobot-cyclo estándar.

## Capacidades

- Control visuomotor para una tarea de pick-and-place: recoger un bloque verde lima con el brazo izquierdo del ROBOTIS FFW SG2.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) con estado articular proprioceptivo de 22 dimensiones.
- Generación de trayectorias articulares de 16 dimensiones a 15 Hz con horizonte de 64 pasos y ejecución de 32.
- Robustez parcial a variaciones de apariencia (fondos, texturas de mesa, color del bloque) gracias a la randomización de dominio del simulador.
- Tolerancia al ruido en la lectura de estado articular, inducida explícitamente durante el entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es un controlador robótico de tarea única.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Recogida automatizada de piezas en línea de montaje: el modelo puede ejecutar la tarea de pick sobre un bloque verde lima en una mesa de 29,25 pulgadas, integrándose en una celda con el robot FFW SG2 y las cámaras calibradas para ciclos repetitivos de recogida.
- Investigación en transferencia sim-a-real con datos reales escasos: sirve como referencia para estudiar cómo 14 demostraciones reales combinadas con 10.000 simuladas mediante co-training ponderado (alpha 0,75) afectan al éxito en el mundo real.
- Estudio de robustez a randomización de apariencia: el checkpoint permite evaluar el efecto de fondos, texturas de mesa y variaciones de color del bloque sobre el rendimiento de la política, útil para diseñar pipelines de domain randomization.
- Benchmark de ruido de estado en políticas de difusión: el campo `state_noise_std` permite comparar directamente contra variantes sin ruido para cuantificar la tolerancia a errores de cinemática en producción.
- Base para fine-tuning en tareas de pick adyacentes: al estar publicados los checkpoints intermedios cada 10.000 pasos, se puede reanudar el entrenamiento o adaptar la política a objetos o alturas de mesa similares con pocas demostraciones adicionales.
- Docencia y divulgación en robótica de imitación: el repositorio incluye configuración completa (receta, augmentaciones, sampler), lo que facilita reproducir el flujo de LeRobot con un fork concreto en cursos y talleres.
- Validación de infraestructura de inferencia robótica: con 288 M de parámetros y pesos safetensors, es adecuado para probar pipelines de despliegue LeRobot en GPUs de gama media antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (288 M de parámetros), los pesos en fp32 ocupan aproximadamente 1,15 GB y en fp16 alrededor de 0,58 GB, a lo que hay que sumar las activaciones de tres ResNet18 a 240x240 y el bucle DDPM de 100 pasos.
- GPU de entrenamiento documentada: una NVIDIA RTX A5000 de 24 GB, compartida al inicio con otro entrenamiento (aproximadamente 2,7 pasos por segundo).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 8-12 GB de VRAM debería poder ejecutar la inferencia, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en modelos como RTX 3090, RTX 4090 o superiores, pero no está verificado ni documentado.
- Opciones de despliegue: LeRobot con el fork lerobot-cyclo (requerido por el campo `state_noise_std`; eliminarlo para usar lerobot-cyclo estándar). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El control opera a 15 Hz y el entrenamiento se midió a aproximadamente 2,7 pasos por segundo en la A5000 compartida, pero no hay cifras de inferencia publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de difusión (por ejemplo, Diffusion Policy original, ACT o variantes de LeRobot) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Tarea única y muy específica: solo recoge un bloque verde lima con el brazo izquierdo del FFW SG2 sobre una mesa de 29,25 pulgadas; no generaliza a otras tareas, objetos o brazos sin reentrenamiento.
- Dependencia de hardware concreto: requiere el robot ROBOTIS FFW SG2 con pinza ROBOTIS CAD y cámaras de muñeca calibradas; el rendimiento fuera de esa configuración no está validado.
- Datos reales muy escasos: solo 14 demostraciones reales (2.653 frames) frente a 10.000 simuladas; el sesgo hacia el simulador y la brecha sim-a-real son riesgos abiertos.
- Sin evaluación publicada: la model card no incluye métricas de éxito ni comparaciones, por lo que no hay evidencia cuantitativa de rendimiento en el mundo real.
- Riesgo de sobreajuste a la apariencia: pese a la randomización, el modelo puede fallar ante condiciones de iluminación, fondo o textura no cubiertas por el dataset.
- Licencia "other" sin términos detallados: no se especifican condiciones de uso comercial, atribución ni redistribución; es necesario contactar con el autor antes de un despliegue productivo.
- Compatibilidad frágil: el config.json contiene un campo propio del fork (`state_noise_std`); cargarlo con lerobot-cyclo estándar requiere eliminarlo, y no se garantiza compatibilidad con otras versiones de LeRobot.
- Sin soporte multilingüe ni textual: la instrucción de tarea es una cadena fija en inglés y el modelo no procesa lenguaje natural variable.
- Repositorio de 11,5 GB: incluye diez checkpoints intermedios además de los pesos finales, lo que complica su distribución y almacenamiento en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-10k-table-texture-cotrain-real075-statenoise
- Dataset de simulación citado: `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam` (referenciado en la model card; no se proporciona URL directa)
- Dataset de demostraciones reales citado: `omkarpatil/pick-lime-block` (referenciado en la model card; no se proporciona URL directa)
- LeRobot (librería base): no se proporciona URL en la información disponible
- Fork lerobot-cyclo: no se proporciona URL en la información disponible
- Isaac Lab: no se proporciona URL en la información disponible
- Paper o blog del autor: no disponible
