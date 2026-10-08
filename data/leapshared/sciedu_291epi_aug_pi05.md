# leapshared/SciEdu_291epi_aug_pi05

## Resumen

`leapshared/SciEdu_291epi_aug_pi05` es un modelo de política robótica de tipo Visión-Lenguaje-Acción (VLA) publicado por la organización Leapshared en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, orientado a la generalización en entornos abiertos. El modelo resultante tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato `safetensors` bajo licencia Apache 2.0.

El problema que resuelve es concreto: controlar un robot bimanual de tipo `bi_openarm_follower` para ejecutar protocolos de laboratorio de ciencias en un entorno educativo. A partir de tres flujos de cámara (`follower_d455f`, `left_wrist`, `right_wrist`) y un vector de estado de 16 dimensiones, el modelo genera un vector de acción de 16 dimensiones que mueve el robot para completar tareas como la clasificación de hojas, la reacción redox con una placa metálica y dos disoluciones, o el experimento del electroscopio con una placa de carga.

Es relevante ahora porque demuestra el flujo completo de LeRobot aplicado a robótica educativa: 291 episodios de demostración teleoperada, 597.322 fotogramas a 30 FPS y 50.000 pasos de entrenamiento con un único ajuste fino. Además, el sufijo `aug` del identificador sugiere que el entrenamiento se realizó sobre una versión aumentada del conjunto de datos original `leapshared/SciEdu_291epi`. El repositorio no registra descargas ni likes en el momento de redactar esta ficha, por lo que carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA) heredada de π₀.₅; detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de texto conversacional; consume instrucciones de tarea cortas) |
| Tipos de cuantizacion | No disponible (pesos publicados en `safetensors` sin variantes cuantizadas documentadas) |
| Idiomas soportados | No disponible; las instrucciones de tarea del conjunto de datos están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería `lerobot`) |
| Tamano del repositorio | 165,7 GB |
| Tipo de robot | `bi_openarm_follower` (bimanual) |
| Camaras de entrada | `follower_d455f`, `left_wrist`, `right_wrist` (3 canales, 480x640 cada una) |
| Vector de estado | `observation.state`, 16 dimensiones |
| Vector de acción | `action`, 16 dimensiones |
| Modelo base | `lerobot/pi05_base` |
| Conjunto de datos | `leapshared/SciEdu_291epi` (291 episodios, 597.322 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Tamano de lote | 32 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 2,5e-05 |
| Semilla | 42 |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de políticas π₀.₅ (Pi05) de Physical Intelligence, descrita por el autor como un modelo Visión-Lenguaje-Acción diseñado para la generalización en entornos abiertos: parte de π₀ y evoluciona para generalizar a situaciones y entornos completamente nuevos que no aparecieron durante el entrenamiento. La implementación disponible en `leapshared/SciEdu_291epi_aug_pi05` es la adaptación de LeRobot, a su vez derivada del repositorio de código abierto OpenPI de Physical Intelligence. La model card no detalla la composición interna de capas, el número de tokens de entrenamiento ni la estrategia exacta de entrenamiento (preentrenamiento más postentrenamiento), por lo que esos datos se consideran no disponibles. Tampoco se documenta el uso de RLHF, DPO u otras técnicas de alineación, algo poco habitual en políticas robóticas de imitación.

El ajuste fino se realizó sobre el conjunto de datos `leapshared/SciEdu_291epi`, compuesto por 291 episodios teleoperados que suman 597.322 fotogramas capturados a 30 FPS, con tres cámaras sincronizadas y un vector de estado de 16 dimensiones. Las tareas cubiertas son veinte instrucciones de lenguaje natural agrupadas en tres experimentos: ordenación de hojas (izquierda y derecha), reacción redox (levantar, mover, señalar, sumergir y mantener la placa metálica respecto a dos vasos de precipitados y una disolución azul) y electroscopio (recoger la placa blanca de carga, frotarla con piel, acercarla y alejarla del electroscopio, señalarla y dejarla en su sitio). El entrenamiento se ejecutó durante 50.000 pasos, con lotes de 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla fija 42, lo que hace el resultado reproducible en la misma versión de LeRobot (0.6.1). El identificador incluye `aug`, lo que apunta a que se empleó una variante aumentada del conjunto de datos, aunque el autor no especifica en qué consistió esa aumentación.

## Capacidades

- Generación de acciones motoras continuas de 16 dimensiones a partir de observaciones multimodales (tres imágenes RGB de 480x640 y un vector de estado de 16 dimensiones).
- Control bimanual de un robot `bi_openarm_follower` con dos brazos coordinados.
- Seguimiento de instrucciones en lenguaje natural para seleccionar entre veinte tareas concretas de laboratorio.
- Ejecución de secuencias de manipulación de varios pasos: recoger, mover, apuntar, sumergir, mantener la posición y volver a la postura inicial.
- Manipulación de objetos deformables y rígidos en contexto de laboratorio: hojas, placas metálicas, placas de carga y vasos de precipitados.
- Percepción egocéntrica y de muñeca combinada: una cámara frontal y dos cámaras en las muñecas izquierda y derecha.
- Ejecución en tiempo real a 30 FPS, la misma frecuencia a la que se capturaron las demostraciones.
- Capacidades de planificación de lenguaje y visión general no verificadas: el modelo está especializado en el dominio del conjunto de datos y la model card no documenta tool calling, function calling, agentes multi-paso genéricos ni otras capacidades del backbone subyacente.
- Capacidades multilingües: no disponibles; las instrucciones del conjunto de datos están en inglés.
- Capacidades de visión general (descripción de imágenes, VQA, OCR): no documentadas en la información proporcionada.

## Casos de uso

- Automatización de prácticas de laboratorio escolar: el modelo ejecuta el protocolo completo del electroscopio, desde recoger la placa de carga hasta frotarla con piel y acercarla al electroscopio, lo que permite reproducir demostraciones de electrostática sin un operador humano presente.
- Asistencia en experimentos de química con materiales peligrosos o delicados: la secuencia de la reacción redox implica sumergir y mantener una placa metálica dentro de una disolución azul; el modelo puede repetir el ciclo con precisión constante, reduciendo la exposición del alumnado a reactivos.
- Clasificación y ordenación de muestras biológicas: la tarea de ordenación de hojas a izquierda o derecha es directamente trasladable a la separación de muestras por criterios binarios en protocolos de biología o botánica.
- Plataforma docente para robótica e imitación: con la librería LeRobot y el comando `lerobot-rollout` documentado, sirve como ejemplo práctico de despliegue de una política VLA entrenada con 291 episodios, útil en asignaturas de robótica y aprendizaje por imitación.
- Punto de partida para nuevos ajustes finos: el modelo hereda de `lerobot/pi05_base` y puede reentrenarse con el mismo pipeline y la misma configuración (50.000 pasos, lote 32, AdamW, lr 2,5e-05) para incorporar nuevas tareas de laboratorio sobre la misma morfología de robot.
- Investigación en generalización de políticas VLA: al estar entrenado con datos aumentados (`aug`), permite estudiar si la aumentación mejora la robustez frente a cambios de iluminación, posición de los objetos o punto de vista de las cámaras dentro de las tres tareas del dominio.
- Evaluación comparativa de estrategias de aumento de datos: comparar este modelo con un ajuste fino equivalente sobre `SciEdu_291epi` sin aumentar permitiría cuantificar la contribución de la aumentación, siempre que se controle la semilla y el resto de hiperparámetros.
- Demostraciones reproducibles en ferias científicas o aulas: el modelo genera el vector de acción a 30 FPS, lo que permite grabar secuencias de vídeo reproducibles para material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición, comparaciones con otras políticas ni evaluaciones cuantitativas del rendimiento del ajuste fino sobre `SciEdu_291epi`. El repositorio registra cero descargas y cero likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras de memoria son estimaciones calculadas a partir del recuento real de parámetros (4.143.404.816) y no proceden de la model card.

- Pesos en precisión fp32: aproximadamente 16,6 GB.
- Pesos en precisión bf16/fp16: aproximadamente 8,3 GB.
- Pesos en int8: aproximadamente 4,1 GB (requiere cuantización no documentada por el autor).
- Pesos en int4: aproximadamente 2,1 GB (requiere cuantización no documentada por el autor).
- VRAM total estimada en bf16, incluyendo activaciones para tres imágenes de 480x640 y el estado de 16 dimensiones: del orden de 12 a 16 GB.
- GPU profesionales recomendadas: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) para entrenamiento y para despliegues con varios procesos.
- GPU de gama alta para consumo: una RTX 4090 o RTX 3090 con 24 GB debería alojar el modelo en bf16 sin cuantización; una RTX 4080 o 4070 Ti Super con 16 GB queda en el límite y probablemente requiera fp16 con cuidado en la gestión de memoria o cuantización.
- GPU con menos de 12 GB: no se recomienda sin cuantización agresiva, que el autor no documenta.
- El tamaño del repositorio (165,7 GB) no equivale a la memoria de inferencia: incluye pesos y artefactos adicionales que deben descargarse, pero no todos se cargan en VRAM.
- Opciones de despliegue: LeRobot 0.6.1 mediante el comando `lerobot-rollout` con `--policy.path=leapshared/SciEdu_291epi_aug_pi05`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que en cualquier caso no aplican a un modelo de acción robótica.
- Latencia: el conjunto de datos se capturó a 30 FPS, lo que implica un presupuesto de 33 milisegundos por paso de control; el modelo debe ejecutarse en tiempo real a esa frecuencia para reproducir las demostraciones con fidelidad. El autor no publica mediciones de latencia por paso ni de throughput en ninguna GPU concreta.
- El script de despliegue admite `--duration` para limitar la ejecución y, si se omite, la política se ejecuta de forma indefinida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leapshared/SciEdu_291epi_aug_pi05` | 4,14 mil millones | VLA ajustado para robótica educativa | Tareas de laboratorio (3 experimentos, 20 instrucciones) | Apache 2.0 | Repositorio HuggingFace, 0 descargas |
| `lerobot/pi05_base` | No disponible en la información proporcionada | VLA base (π₀.₅ en LeRobot) | Generalista, varios robots y tareas | Apache 2.0 según el modelo derivado | Público en HuggingFace |
| π₀ (`lerobot/pi0` y OpenPI) | No disponible en la información proporcionada | VLA predecesor de π₀.₅ | Generalista, varios robots y tareas | No disponible en la información proporcionada | Repositorio OpenPI de Physical Intelligence |
| OpenVLA | No disponible en la información proporcionada | VLA de 7B basado en Llama 2 y DINOv2/SigLIP | Manipulación generalista en distintos robots | No disponible en la información proporcionada | Público |

No se dispone de datos de rendimiento comparativo (tasas de éxito, error de posición, tiempos de ejecución) para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Cualquier afirmación sobre superioridad de uno u otro sería especulativa.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para un único tipo de robot (`bi_openarm_follower`), tres cámaras con nombres y disposición concretos, y veinte instrucciones de tarea. No funcionará con otra morfología, otro número de brazos, otras cámaras ni instrucciones fuera de esa lista.
- Las claves de observación deben coincidir exactamente con las del entrenamiento (`observation.images.follower_d455f`, `observation.images.left_wrist`, `observation.images.right_wrist`, `observation.state`); un desajuste en nombres o resoluciones provocará fallos en la inferencia.
- Riesgo de alucinación trasladado al mundo físico: una acción incorrecta no produce texto erróneo, sino un movimiento errático del robot que puede dañar material de laboratorio, derramar reactivos o golpear a personas. Se requiere supervisión humana y límites de par o de espacio de trabajo.
- Sesgo de dominio: el conjunto de datos procede de un único entorno de laboratorio, con una iluminación, una disposición de mesa y un operador de teleoperación concretos. Se desconoce su comportamiento ante cambios de iluminación, fondos distintos o materiales no vistos.
- Sin datos de evaluación: cero descargas, cero likes y ninguna métrica de éxito publicada. No hay evidencia independiente de que el modelo funcione correctamente.
- Idiomas: la model card no declara idiomas soportados y las instrucciones del conjunto de datos están en inglés; se desconoce si acepta instrucciones en castellano.
- Licencia: el modelo se publica bajo Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base `lerobot/pi05_base` y la del π₀.₅ original de Physical Intelligence, que pueden imponer condiciones adicionales.
- Los 165,7 GB del repositorio implican un coste de descarga y almacenamiento elevado, desproporcionado para un modelo de 4,14 mil millones de parámetros en fp32, lo que sugiere la presencia de artefactos adicionales o múltiples copias de los pesos.
- Requisito de tiempo real: la política necesita ejecutarse a 30 FPS para reproducir las demostraciones; una GPU que no alcance ese ritmo producirá un control degradado cuya gravedad no está documentada.
- No se documenta ningún mecanismo de parada de emergencia, filtrado de acciones ni límites de seguridad específicos del modelo.
- Fecha de publicación futura registrada por HuggingFace (2026-10-07): conviene verificar la vigencia y estabilidad del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leapshared/SciEdu_291epi_aug_pi05
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/leapshared/SciEdu_291epi
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/SciEdu_291epi
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Aprendizaje por imitación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Perfil del autor en HuggingFace: https://huggingface.co/leapshared
