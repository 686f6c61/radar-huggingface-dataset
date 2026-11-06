# Aevanis/Aevanis-Kinematics

## Resumen

Aevanis-Kinematics es un modelo especializado en robótica desarrollado por Aevanis AI Lab que se ejecuta sobre el backbone preentrenado Av-Vision. Su función no es la generación de lenguaje, sino la predicción de física de contacto no rígida en tiempo real para manipulación robótica: segmentación de fronteras de contacto, vectores de flujo de movimiento relativo y una puntuación de presión y deformación de contacto. Aborda un problema concreto de la visión robótica: durante el agarre rápido, el efector final y el objeto se fusionan visualmente en un único contorno, los trackers intercambian identidades por oclusiones veloces y las cajas 2D no permiten inferir si existe contacto físico real o mera proximidad.

El modelo produce tres salidas: un mapa denso de segmentación de frontera de contacto de 14x14 (196 valores), vectores de flujo de movimiento relativo (ΔX, ΔY) para capturar deslizamiento y cizalladura entre superficies, y una puntuación escalar de presión de contacto entre 0.0 (hovering) y 1.0 (deformación mecánica máxima). Está diseñado para inferencia en el borde con latencias declaradas por debajo de 4 ms, lo que lo sitúa en el rango de 100 a 800 FPS según hardware.

El repositorio tiene un tamaño de 0.0 GB y cero descargas en el momento de la consulta, con creación y actualización el 2 de noviembre de 2026. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que el modelo no es lingüístico. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (cabeza especializada sobre el backbone Av-Vision; detalles del backbone no disponibles) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de imagen 224x224 RGB) |
| Tipos de cuantización | No disponible (el benchmark cita fp16 en Tesla T4) |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pt`, según el ejemplo de carga `aevanis_kinematics_nano.pt`) |

## Arquitectura y entrenamiento

La información disponible indica que Aevanis-Kinematics es una cabeza especializada que se ejecuta sobre el backbone preentrenado Av-Vision, con una escala de modelo denominada "nano" en el ejemplo de uso. No se detalla la arquitectura interna de la cabeza ni del backbone: no se especifica si emplea atención, convoluciones o un híbrido. La entrada es una imagen RGB de 224x224 y las salidas son un mapa de contacto de 196 elementos (14x14), un vector de flujo de movimiento de dos componentes y un escalar de presión de contacto. No se dispone de información sobre el número de capas, dimensiones ocultas ni mecanismos de atención.

El entrenamiento se realizó sobre el Aevanis Continuous Egocentric & High-FPS Dynamics Dataset, compuesto por 166.440 fotogramas continuos y 48,2 GB de metraje temporal, sin scraping web. No se especifica si hubo RLHF, DPO u otras etapas de alineación, ni el número de tokens o pasos de entrenamiento. Las métricas de pérdida publicadas por el autor son: BCE de frontera de contacto de 0,1484, MSE de dirección de flujo de movimiento de 0,2144 y MSE de deformación y presión de contacto de 0,0807 (con un objetivo declarado por debajo de 0,010). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación densa de frontera de contacto: produce un mapa de 14x14 (196 valores) que delimita la interfaz de alta tensión entre dos cuerpos físicos.
- Estimación de flujo de movimiento relativo: predice vectores (ΔX, ΔY) para seguir trayectorias de deslizamiento y cizalladura entre superficies en interacción.
- Regresión de presión y deformación de contacto: puntuación escalar entre 0.0 (hovering) y 1.0 (deformación mecánica máxima).
- Prevención de intercambio de identidad visual: diseñado para mantener identidades separadas durante oclusiones rápidas en manipulación.
- Resolución de fusión de contornos: separa visualmente el efector final del objeto agarrado cuando ambos se solapan.
- Inferencia en tiempo real en el borde: latencias declaradas por debajo de 4 ms en CPU y hardware embebido.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni capacidades de agente multi-paso.

## Casos de uso

- Agarre robótico de precisión: el modelo estima la presión de contacto (0.0 a 1.0) para determinar si el efector ha establecido contacto real o sigue en aproximación, permitiendo ajustar la fuerza antes de cerrar la pinza.
- Manipulación diestra continua: el flujo de movimiento relativo (ΔX, ΔY) permite detectar deslizamiento del objeto entre los dedos y corregir la trayectoria en el bucle de control a 100+ FPS.
- Seguimiento multiobjeto en escenas de agarre: la segmentación de frontera de contacto evita que el tracker intercambie la identidad del objeto y del efector cuando se produce oclusión rápida.
- Robótica de borde con Jetson Orin Nano: con 4,4 ms por fotograma (220 FPS) en ese hardware, es viable en plataformas móviles con presupuesto térmico y energético limitado.
- Control de fuerza en ensamblaje: la puntuación de deformación permite inferir la intensidad de contacto normal en tareas de inserción de piezas, donde la caja 2D no aporta información física.
- Detección de deslizamiento en transporte: los vectores de flujo relativo entre superficie y objeto sirven para disparar alarmas de agarre inestable durante el traslado.
- Investigación en física de contacto no rígida: el modelo y su dataset asociado (166.440 fotogramas) permiten reproducir experimentos de disentanglement físico en manipulación.

## Benchmarks y rendimiento

El autor publica métricas de pérdida y latencia, no benchmarks estándar de razonamiento o visión (MMLU, HumanEval, GSM8K no aplican a este modelo). Los datos disponibles son:

| Métrica | Valor |
|---|---|
| Contact Boundary BCE Loss | 0,1484 |
| Motion Flow Direction MSE | 0,2144 |
| Contact Deformation / Pressure MSE | 0,0807 (objetivo declarado: < 0,010) |

| Hardware | Batch size | Latencia (ms) | Frecuencia (Hz) |
|---|---|---|---|
| NVIDIA RTX 4090 | 1 | 1,2 | 800+ |
| Tesla T4 (fp16) | 1 | 1,7 | 580 |
| Jetson Orin Nano | 1 | 4,4 | 220 |
| CPU de escritorio (i7) | 1 | 3,2 (cabeza) | 120+ |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del checkpoint no se especifica; el repositorio ocupa 0.0 GB).
- GPU recomendadas: NVIDIA RTX 4090 (1,2 ms), Tesla T4 en fp16 (1,7 ms), Jetson Orin Nano (4,4 ms).
- CPU: un Intel i7 de escritorio ejecuta la cabeza en 3,2 ms (120+ FPS), según el autor.
- Cabe en GPU de consumo: sí, según los datos de latencia en RTX 4090 y T4; no se detalla el consumo de memoria.
- Opciones de despliegue: PyTorch nativo mediante `AevanisKinematicsAgent` y carga de checkpoint `.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión robótica de este tipo).
- Latencia y throughput: 1,2 ms / 800+ FPS en RTX 4090; 1,7 ms / 580 FPS en T4 fp16; 4,4 ms / 220 FPS en Jetson Orin Nano; 3,2 ms / 120+ FPS en CPU i7.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos de affordance y física de contacto robótica (por ejemplo, cabezas de predicción de agarre o segmentación de contacto) no se detallan en la información disponible, por lo que no es posible establecer una comparativa con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al ser un modelo de percepción física y no lingüístico, los sesgos relevantes serían de dominio (tipos de objetos, condiciones de iluminación y materiales del dataset de entrenamiento), no especificados.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la regresión de presión y la segmentación de contacto pueden producir estimaciones erróneas en condiciones fuera de distribución (materiales no vistos, oclusiones extremas).
- La puntuación de presión y deformación tiene un MSE de 0,0807, por encima del objetivo declarado de 0,010; la precisión en la estimación de fuerza es, por tanto, limitada según las propias métricas del autor.
- Limitaciones de contexto e idioma: no aplica idioma; la entrada está restringida a imágenes de 224x224 RGB, sin información sobre resolución superior.
- Dependencia del backbone Av-Vision: el rendimiento depende de un backbone preentrenado cuyos detalles, licencia y disponibilidad no se especifican en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial con atribución y sin garantías; no se documentan restricciones adicionales.
- Para producción: el repositorio tiene 0 descargas y 0 likes, con tamaño de 0.0 GB, lo que sugiere un artefacto no verificado por la comunidad; las métricas son autoinformadas por el autor y no han sido replicadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Aevanis/Aevanis-Kinematics
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
