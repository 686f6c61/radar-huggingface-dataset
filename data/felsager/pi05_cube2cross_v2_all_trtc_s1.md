# felsager/pi05_cube2cross_v2_all_trtc_s1

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos. Esta ficha concreta, `felsager/pi05_cube2cross_v2_all_trtc_s1`, es un ajuste fino del modelo base `lerobot/pi05_base` publicado por el usuario felsager mediante la librería LeRobot, y está especializado en una única tarea robótica de manipulación: coger un cubo de color y depositarlo sobre una cruz roja.

El modelo consume observaciones multimodales (estado articular de 10 dimensiones y dos cámaras RGB de 480x640) y produce un vector de acción de 10 dimensiones para un robot UR5e con mano. Con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones), se distribuye en formato safetensors dentro de un repositorio de 42,6 GB, lo que refleja pesos en precisión completa o alta.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de un VLA de propósito general sobre un dataset propio de 1000 episodios, y como punto de partida para quienes quieran entrenar políticas de imitación con LeRobot sobre hardware UR5e. No es un modelo de propósito general ni un chatbot: es una política robótica entrenada para una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 42,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist (3, 480, 640) cada una |
| Entrada de estado | observation.state (10,) |
| Salida de accion | action (10,) |
| Libreria | lerobot 0.6.2 |
| Dataset de entrenamiento | felsager/vla_cubes_cross_v2 (1000 episodios, 493.474 frames, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Seed | 1 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLA π₀.₅ de Physical Intelligence, cuya implementación en LeRobot deriva del repositorio OpenPI. π₀.₅ se presenta en la documentación del autor como una evolución de π₀ diseñada para generalizar a entornos y situaciones no vistos durante el entrenamiento. La arquitectura combina percepción visual, comprensión del lenguaje (la instrucción de tarea) y generación de acciones motoras, si bien la información disponible no detalla la composición interna de capas, el mecanismo de atención ni el esquema exacto de fusión multimodal.

El entrenamiento se realizó por imitación supervisada sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS, con cuatro instrucciones de tarea que varían el color del cubo (azul, verde, amarillo y rojo) manteniendo el destino en la cruz roja. La configuración reportada es de 30.000 pasos, batch de 16, AdamW con learning rate 5e-05 y semilla 1, ejecutado con LeRobot 0.6.2. No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación posteriores al ajuste por imitación.

## Capacidades

- Manipulación robótica pick-and-place: ejecuta la tarea de coger un cubo de color y colocarlo sobre una cruz roja, con instrucciones en lenguaje natural que especifican el color del cubo.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (vista superior y vista de muñeca) a 480x640 con 3 canales.
- Condicionamiento por lenguaje: acepta la instrucción de tarea como texto ("pick up the blue cube and place it on the red cross." y variantes de color).
- Control de robot UR5e con mano: genera acciones de 10 dimensiones coherentes con el estado articular observado.
- Ejecución continua en bucle cerrado: el script de rollout permite ejecutar la política durante una duración configurable (por ejemplo, 60 segundos) o de forma indefinida.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto libre, matemáticas, código ni procesamiento de audio.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de coger un cubo y depositarlo en la cruz roja sobre un UR5e, lo que permite montar una celda de manipulación reproducible para experimentos de imitación sin programar cinemática manual.
- Banco de pruebas para ajuste fino de VLA: sirve como referencia de un entrenamiento completo (30.000 pasos, 1000 episodios) para comparar hiperparámetros, tamaños de dataset y estrategias de aumento de datos con LeRobot.
- Docencia e investigación en aprendizaje por imitación: el par política-dataset permite reproducir el flujo completo de grabación, entrenamiento y despliegue con hardware asequible y documentación oficial.
- Evaluación de robustez ante variaciones de color: al estar entrenado con cuatro colores de cubo, permite estudiar la generalización del modelo ante instrucciones de color y posiciones no vistas.
- Integración en pipelines de investigación con LeRobot: el comando `lerobot-rollout` facilita incorporar la política a scripts de evaluación automatizada con métricas de éxito por episodio.
- Base para transferencia a tareas similares: al partir de `lerobot/pi05_base`, puede reajustarse sobre nuevos datasets de manipulación con la misma configuración de robot y cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,1 mil millones de parámetros y pesos en safetensors de 42,6 GB, el repositorio apunta a precisión completa o alta; la inferencia en FP16 requeriría del orden de 8-9 GB solo para pesos, sin contar activaciones ni buffers de visión.
- GPU recomendadas: no especificadas por el autor. Por tamaño de parámetros, una GPU con 16 GB o más (RTX 4090, A100, H100) es el rango razonable para inferencia sin cuantizar.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en FP16; en tarjetas de 8-12 GB requeriría cuantización, cuyos formatos no se documentan.
- Opciones de despliegue: LeRobot 0.6.2 mediante `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. El dataset de entrenamiento opera a 30 FPS, lo que sugiere que el bucle de control espera frecuencias de ese orden, pero no se confirma el rendimiento real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_trtc_s1 | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz roja (UR5e) | gemma | Hugging Face, LeRobot |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base de propósito general para ajuste fino | no disponible en la información | Hugging Face, LeRobot |
| π₀ (Pi0) de Physical Intelligence | no disponible en la información | no disponible | VLA predecesor de π₀.₅ | no disponible en la información | OpenPI, referenciado en la model card |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (coger un cubo de color y ponerlo en la cruz roja) sobre un robot UR5e con mano y dos cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de robot sin reentrenamiento.
- Sin evaluación publicada: la model card declara que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de acierto y la robustez ante variaciones de iluminación, posición o distractores.
- Riesgo de sobreajuste al entorno de grabación: con 1000 episodios de una sola configuración, es probable que el rendimiento caiga ante cambios de fondo, iluminación o calibración de cámaras.
- Dependencia de la instrucción de tarea: el texto debe coincidir con una de las cuatro instrucciones de entrenamiento; instrucciones fuera de ese conjunto no tienen garantía de funcionamiento.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma, que impone condiciones adicionales a las licencias permisivas habituales; conviene revisarlos antes de un despliegue productivo.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de entrenamiento están en inglés.
- Sin datos de sesgos, alucinación en sentido lingüístico ni comportamiento fuera de distribución más allá de lo indicado; al ser una política motora, el riesgo principal es la ejecución de acciones incorrectas sobre hardware físico, con el consiguiente riesgo material.
- Repositorio de gran tamaño (42,6 GB) y sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_trtc_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
