# padiredd/dp-cupbasket-visual-wide-500

## Resumen

dp-cupbasket-visual-wide-500 es una política de difusión (diffusion policy) para robótica bimanual entrenada con el framework LeRobot (fork lerobot-cyclo de ROBOTIS) y publicada por el usuario padiredd. Resuelve una tarea muy concreta de manipulación: recoger un vaso azul con la mano izquierda, pasarlo a la mano derecha y colocarlo sobre una cesta, usando el robot bimanual ROBOTIS FFW SG2 con pinzas CAD y cámaras de muñeca calibradas. El modelo tiene 287.533.680 parámetros y se distribuye en formato safetensors con un repositorio de 11,5 GB que incluye el checkpoint final (100k pasos) y nueve checkpoints intermedios cada 10.000 pasos.

A diferencia de un LLM, no procesa lenguaje ni genera texto: es un modelo de política visuomotora que mapea observaciones (tres cámaras de 240x240 más un vector de estado articular de 22 dimensiones) a acciones (16 objetivos articulares a 15 Hz). Su relevancia actual está en el ámbito de la robótica de imitación y el entrenamiento en simulación con Isaac Lab, donde los flujos de trabajo de data augmentation visual y domain randomization son cada vez más habituales para reducir la brecha sim-a-real.

El modelo se entrenó exclusivamente con 500 episodios aleatorios (semilla 0) de una recolección de demostraciones con aleatorización visual agresiva y colocación amplia. Es, por tanto, un artefacto de investigación experimental más que un modelo listo para producción, y el propio autor indica que los resultados de evaluación se añadirán cuando se ejecuten.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con encoder ResNet18 por cámara; implementación LeRobot (fork lerobot-cyclo de ROBOTIS) |
| Parametros totales | 287.533.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de política; horizonte de predicción de 64 pasos, 32 ejecutados, n_obs_steps = 1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (sin detalle de términos en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy clásica: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha) se codifica con una ResNet18 independiente a resolución 240x240, y la condición se completa con un vector de estado articular de 22 dimensiones. La salida es una acción de 16 objetivos articulares a 15 Hz, con un horizonte de predicción de 64 pasos del que se ejecutan 32 y un único paso de observación. El entrenamiento usó 100.000 pasos con batch de 32, optimizador Adam con tasa 1e-4 y scheduler coseno, semilla 1000, sobre una única RTX 4090 de 24 GB compartida con otro entrenamiento (aproximadamente 4,9 pasos por segundo por job).

Los datos provienen del dataset padiredd/Cup_visual_wide_500: 500 episodios aleatorios (semilla 0) de la recolección de recogida de vaso con colocación amplia y domain randomization visual, generados con el programa cup_handover_v6.py en Isaac Lab. La receta incluye aleatorización de la mesa, el fondo, el color del vaso, la habitación y la iluminación puntual, además de aleatorización de la pinza segura para el vaso; la colocación se amplió a x 0,36-0,58 / y 0,00-0,42 m para el vaso y x 0,40-0,55 / y -0,60 a -0,28 m para la cesta, con guiñada de ±10 grados. El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot) y se aplica una aumento de imagen intenso y en orden aleatorio de hasta cinco transformaciones entre brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No se añadió ruido al estado.

## Capacidades

- Generación de trayectorias de acción bimanuales para una tarea concreta de manipulación (recogida, traspaso entre manos y colocación sobre cesta).
- Percepción visuomotora a partir de tres cámaras simultáneas (cabeza y dos muñecas) más estado articular.
- Control a 15 Hz con acciones de 16 objetivos articulares, adecuado para bucles de control de robot real.
- Robustez parcial a variaciones visuales gracias al domain randomization del entrenamiento (iluminación, fondo, color del vaso, transformaciones fotométricas y geométricas).
- Generalización espacial limitada a la región de colocación amplia usada en el dataset.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en imitación bimanual: servir como referencia reproducible de diffusion policy con LeRobot para estudiar el efecto del domain randomization visual en el traspaso de objetos entre manos.
- Evaluación sim-a-real en Isaac Lab: desplegar el checkpoint en el simulador con el robot FFW SG2 y medir la tasa de éxito de la tarea de vaso a cesta antes de transferir a hardware.
- Ablación de aumento de datos: comparar este modelo (receta VISUAL con 500 demos) con variantes del mismo autor (por ejemplo, dp-cupbasket-visual-8k) para cuantificar el impacto del volumen de datos y la aleatorización.
- Base para fine-tuning con datos propios: partir del checkpoint de 100k pasos y ajustar con un dataset reducido de demostraciones reales del mismo robot y tarea.
- Estudio de robustez perceptual: analizar cómo afectan cambios de iluminación, color del vaso o fondo a la política, gracias a que el entrenamiento cubrió explícitamente esas variaciones.
- Docencia y prototipado en robótica: ejemplo completo de pipeline LeRobot (dataset, entrenamiento, checkpoints intermedios y evaluación) para cursos o laboratorios de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287,5 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,15 GB, a los que hay que sumar activaciones de tres ResNet18 a 240x240 y el bucle DDPM de 100 pasos.
- GPU recomendadas: el autor entrenó en una RTX 4090 de 24 GB; para inferencia una GPU consumer moderna (RTX 3090, 4090, 4080) debería ser suficiente, aunque no se han publicado mediciones.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque no hay cifras verificadas.
- Opciones de despliegue: LeRobot (DiffusionPolicy.from_pretrained), con integración en Isaac Lab para simulación; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el entrenamiento reportó aproximadamente 4,9 pasos por segundo en una RTX 4090 compartida, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-visual-wide-500 | 287,5 M | Traspaso bimanual de vaso a cesta (FFW SG2) | Horizonte 64 / 32 ejecutados | other | Hugging Face (padiredd) |
| dp-cupbasket-visual-8k | no disponible | Misma tarea, receta visual con 8k demos | no disponible | no disponible | Hugging Face (padiredd) |
| Otras diffusion policies de LeRobot | variable | Manipulación diversa | variable | variable | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de política específico para una tarea y un robot concretos (ROBOTIS FFW SG2 con pinzas CAD y cámaras calibradas); no es transferible directamente a otro hardware sin recalibración y fine-tuning.
- Entrenado con solo 500 episodios y sin evaluación publicada: el rendimiento real es desconocido y no debe asumirse robusto.
- La licencia "other" no detalla condiciones; es imprescindible contactar con el autor antes de cualquier uso comercial.
- Riesgo de sobreajuste a la distribución visual del simulador pese al domain randomization; el salto sim-a-real no está cuantificado.
- No soporta lenguaje, tool calling ni razonamiento; cualquier expectativa de uso como modelo generativo de texto es incorrecta.
- El repositorio incluye diez checkpoints (100k y cada 10k), lo que infla el tamaño a 11,5 GB; conviene descargar solo el checkpoint necesario.
- No se documentan sesgos sociales (no aplica), pero sí posibles sesgos hacia posiciones de colocación dentro del rango entrenado (x 0,36-0,58 / y 0,00-0,42 m para el vaso).

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-visual-wide-500
- Dataset asociado: padiredd/Cup_visual_wide_500 (referenciado en la model card)
- Datasets de recolección ampliada: padiredd/Cup_visual_wide_1 a padiredd/Cup_visual_wide_4 (referenciados en la model card)
- LeRobot: no disponible en la información proporcionada
- Isaac Lab: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
