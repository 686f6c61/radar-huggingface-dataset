# Larry1960/hf_act_recordpolicy0

## Resumen

`Larry1960/hf_act_recordpolicy0` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación publicada en el paper arXiv:2304.13705 que predice trozos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, y está orientado a controlar un robot de tipo `so_follower` (una de las plataformas de bajo coste compatibles con LeRobot) equipado con dos cámaras: `front` y `follower`.

El modelo resuelve una tarea concreta y muy acotada: "put the sharpener in the blue square" (colocar el sacapuntas en el cuadrado azul). Consume el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que cabe holgadamente en GPUs de consumo.

Su relevancia es la de un artefacto de investigación reproducible: demuestra el flujo completo de LeRobot para grabar datos de teleoperación, entrenar una política ACT y desplegarla en un robot real. No es un modelo de propósito general ni un modelo de lenguaje, sino una política visuomotora específica de tarea, con solo 100 pasos de entrenamiento y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de predecir una única acción por paso, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo consume observaciones multimodales (estado propioceptivo de 6 dimensiones y dos cámaras RGB de 480x640) y emite acciones de 6 dimensiones, típicamente correspondientes a las articulaciones o al efector del robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `larry1960/test_number_1_20261008_161128`, compuesto por 40 episodios y 13.594 fotogramas a 30 FPS, todos ellos de la tarea "put the sharpener in the blue square". La configuración es muy ligera: 100 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún esquema de refinamiento posterior; se trata de imitación supervisada pura sobre datos de teleoperación.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de dos cámaras RGB y del estado propioceptivo.
- Predicción de chunks de acciones de 6 dimensiones para la tarea "put the sharpener in the blue square".
- Aprendizaje por imitación a partir de datos de teleoperación (40 episodios, 13.594 fotogramas).
- Ejecución autónoma de la política en bucle mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Automatización de una tarea de pick-and-place en laboratorio**: la política ejecuta la secuencia "colocar el sacapuntas en el cuadrado azul" sobre un `so_follower`, útil como banco de pruebas para validar el pipeline de LeRobot de extremo a extremo.
- **Reproducción de experimentos de aprendizaje por imitación**: sirve como referencia para comparar configuraciones de ACT (número de pasos, batch size, learning rate) sobre un dataset pequeño y bien delimitado.
- **Docencia y formación en robótica de bajo coste**: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se puede desplegar en equipos modestos para demostrar el ciclo grabar-entrenar-desplegar.
- **Prototipado rápido de nuevas tareas**: el mismo flujo (`lerobot-train` con `--policy.type=act`) permite reentrenar la política con un dataset propio y sustituir esta como línea base.
- **Validación de hardware y calibración**: ejecutar la política con `lerobot-rollout` ayuda a comprobar que las cámaras `front` y `follower`, el puerto del robot y la frecuencia de 30 FPS están correctamente configurados.
- **Investigación en robustez visuomotora**: al no haber evaluación publicada, este modelo puede usarse como punto de partida para medir tasas de éxito bajo cambios de iluminación, posiciones de objetos o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 51,7 M de parámetros en safetensors y un repo de 0,2 GB, la inferencia en FP32 requiere del orden de 0,2-0,3 GB de VRAM solo para pesos, más el coste de procesar dos imágenes de 480x640 por paso.
- **GPU recomendadas**: no disponible en la documentación; el comando oficial de entrenamiento usa `--policy.device=cuda`, por lo que se espera una GPU NVIDIA.
- **GPU de consumo**: por tamaño, es plausible que quepa en GPUs de consumo como RTX 3060, RTX 4060 o superiores; no hay confirmación oficial.
- **Opciones de despliegue**: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- **Latencia y throughput**: no disponibles; dependen del robot, de las cámaras y de la frecuencia de control a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Larry1960/hf_act_recordpolicy0` | 51.668.614 | no aplica | Colocar sacapuntas en cuadrado azul (`so_follower`) | no disponible | Hugging Face, lerobot |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas de manipulación diversas | generalmente Apache-2.0 en LeRobot | Hugging Face, lerobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación visuomotora | no disponible | Hugging Face, lerobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Especialización extrema**: la política solo ha sido entrenada para la tarea "put the sharpener in the blue square"; no generaliza a otras tareas ni objetos.
- **Dataset muy pequeño**: 40 episodios y 13.594 fotogramas, con solo 100 pasos de entrenamiento, lo que sugiere un ajuste limitado y un riesgo alto de sobreajuste al entorno de grabación.
- **Sin evaluación publicada**: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que no se puede afirmar su fiabilidad en producción.
- **Dependencia del hardware**: requiere un robot `so_follower` y dos cámaras con los nombres `front` y `follower` exactamente como en el entrenamiento; cualquier cambio de calibración, iluminación o posición puede degradar el comportamiento.
- **Licencia no especificada**: la model card marca la licencia como "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita.
- **Riesgo de alucinación**: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- **Sesgos**: no documentados; al proceder de teleoperación de un único operador, puede heredar sesgos de estilo y velocidad de ejecución.
- **Sin soporte multilingüe ni de texto**: no debe evaluarse como modelo de lenguaje ni usarse para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Larry1960/hf_act_recordpolicy0
- Dataset de entrenamiento: https://huggingface.co/datasets/larry1960/test_number_1_20261008_161128
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=larry1960/test_number_1_20261008_161128
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
