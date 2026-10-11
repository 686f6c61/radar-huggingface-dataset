# edgarcancinoe/smolvla_water_base-4

## Resumen

`edgarcancinoe/smolvla_water_base-4` es un ajuste fino del modelo base `lerobot/smolvla_base`, un modelo de vision-lenguaje-accion (VLA) compacto desarrollado por Hugging Face dentro de la familia SmolVLA. Este checkpoint concreto ha sido entrenado por el usuario edgarcancinoe para una tarea robotica especifica de manipulacion: regar plantas ("Water the left plant", "Water the middle plant", "Water the right plant") con un robot tipo `panda`, a partir del dataset de demostraciones `edgarcancinoe/water_pour`. Resuelve el problema de transferir aprendizaje por imitacion a una politica de control real sobre hardware de consumo, sin necesidad de infraestructura de entrenamiento a gran escala.

El modelo tiene 450.046.176 parametros (aproximadamente 450 millones) en formato safetensors, con un tamano de repositorio de 0,9 GB. La arquitectura es la de SmolVLA: un backbone de vision-lenguaje compacto derivado de SmolVLM, al que se anade un cabezal de accion basado en flow matching para la prediccion de acciones continuas. Esta disenado para ejecutarse en hardware de consumo y para control en tiempo real mediante una arquitectura de inferencia asincrona que separa la percepcion (costosa) de la ejecucion de acciones (ligera).

Su relevancia actual radica en que es un ejemplo practico de reutilizacion de un modelo fundacional abierto de robotica para una tarea acotada mediante fine-tuning ligero (10.000 pasos con batch de 16). El modelo no publica resultados de evaluacion y cuenta con 0 descargas y 0 likes, por lo que debe considerarse un checkpoint experimental de referencia, no un artefacto validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); backbone derivado de SmolVLM con cabezal de accion por flow matching |
| Parametros totales | 450.046.176 (~450 M) |
| Longitud de contexto | no disponible (modelo de politica robotica, no lenguaje conversacional) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes cuantizadas en el repo) |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un backbone de vision-lenguaje compacto (hereda el enfoque de SmolVLM) con un cabezal de accion que utiliza flow matching para generar acciones continuas. La innovacion principal de la familia es una arquitectura de inferencia asincrona que separa el calculo pesado de percepcion del de ejecucion de acciones, lo que permite control en tiempo real en hardware de consumo. El modelo base `lerobot/smolvla_base` es el punto de partida sobre el que se ha realizado este ajuste.

Este checkpoint se ha entrenado mediante aprendizaje por imitacion (behavior cloning) sobre el dataset `edgarcancinoe/water_pour`, compuesto por 47 episodios y 35.370 fotogramas grabados a 20 FPS. La configuracion de entrenamiento reportada es de 10.000 pasos, batch size 16, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.1. No se documenta uso de RLHF ni DPO; se trata de un ajuste supervisado sobre demostraciones. Las entradas son el estado del robot `observation.state` con forma `(6,)` y tres flujos visuales `(3, 256, 256)`; la salida es un vector de accion de forma `(7,)`.

## Capacidades

- Generacion de acciones de control robotico continuas (vector de accion de dimension 7) para un robot tipo `panda`.
- Comprension de instrucciones de tarea en lenguaje natural para seleccionar el objetivo ("Water the left plant", "Water the middle plant", "Water the right plant").
- Percepcion visual multimodal a partir de hasta tres camaras (camara1, camara2, camara3) con entradas de 3x256x256.
- Aprendizaje por imitacion: reproduce habilidades demostradas en el dataset de entrenamiento (manipulacion para regar plantas).
- Soporte de tool calling / function calling: no disponible (no es un modelo conversacional).
- Soporte de agentes y razonamiento multietapa: no disponible.
- Capacidades multilingues: no disponible; las instrucciones se proporcionan en ingles.
- Capacidades especiales: control en tiempo real mediante inferencia asincrona; no dispone de modo "thinking", vision generativa ni audio.

## Casos de uso

- Riego automatico de plantas en laboratorio: el modelo recibe el estado del robot y las imagenes de las camaras y genera las acciones necesarias para dirigir el brazo hacia la planta objetivo indicada en la instruccion, ejecutable a traves del comando `lerobot-rollout`.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para comparar metodos de behavior cloning sobre una tarea acotada con un dataset publico de 47 episodios.
- Fine-tuning sobre nuevas tareas de manipulacion: al estar construido sobre `lerobot/smolvla_base`, puede reajustarse con el comando `lerobot-train` usando datasets propios, siguiendo el flujo de LeRobot.
- Docencia y prototipado en robotica de bajo coste: al caber en GPU de consumo y tener licencia Apache-2.0, es adecuado para cursos y talleres que necesiten una politica VLA completa y ejecutable.
- Evaluacion de pipelines de robotica open source: permite validar la integracion completa de LeRobot (grabacion de datos, entrenamiento, rollout) en un caso de uso concreto.
- Desarrollo de sistemas de control asistido por lenguaje: demuestra como una instruccion textual selecciona entre multiples objetivos (izquierda, centro, derecha) dentro de una misma escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de exito en robot real ni de metricas comparables (MMLU, HumanEval, GSM8K u otras) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 0,9 GB en el repositorio; con precision de 16 bits se estima en torno a 1-2 GB de VRAM para los pesos, mas el margen para las activaciones y el procesamiento de imagen de tres camaras.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se espera funcionamiento correcto en RTX 3060, RTX 4090, A100 o H100. El modelo esta disenado explicitamente para hardware de consumo.
- Cabe en GPU de consumo: si. Segun la descripcion de SmolVLA, el modelo busca despliegue en hardware de gama de consumo.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento), con soporte de `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp ni Ollama para este checkpoint (son entornos orientados a modelos de lenguaje, no a politicas VLA).
- Latencia y throughput estimados: no disponible. El dataset se grabo a 20 FPS y la arquitectura de SmolVLA emplea inferencia asincrona para el control en tiempo real, pero no se publican cifras de latencia ni de frecuencia de control efectiva para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edgarcancinoe/smolvla_water_base-4 | 450 M | no aplica | sin resultados publicados | apache-2.0 | HuggingFace (0 descargas) |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | HuggingFace (modelo base) |
| OpenVLA | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | no disponible |
| pi0 | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | no disponible |

Solo se dispone de datos verificados para este checkpoint y para su relacion con `lerobot/smolvla_base`. No se han proporcionado cifras contrastadas de OpenVLA, pi0 u otros modelos VLA comparables, por lo que sus celdas quedan como "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo de control robotico entrenado con un dataset pequeno (47 episodios), su comportamiento esta fuertemente sesgado hacia las condiciones de la escena y del robot del dataset original.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero si existe riesgo de generalizacion deficiente. Sin resultados de evaluacion publicados, se desconoce la robustez ante cambios de iluminacion, posicion de objetos o distracciones.
- Limitaciones de contexto o idioma: es un modelo de politica, no conversacional; no dispone de ventana de contexto de lenguaje. Las instrucciones del dataset estan en ingles y no se documenta soporte de otros idiomas.
- Dependencia del hardware y la configuracion: esta entrenado para un robot tipo `panda` con tres camaras y una dimension de estado de 6 y de accion de 7. Los nombres e indices de camara y el puerto del robot deben coincidir con los usados en el entrenamiento, lo que limita la portabilidad directa.
- Restricciones de licencia para uso comercial: la licencia es Apache-2.0, que permite uso comercial, pero debe verificarse la licencia del modelo base `lerobot/smolvla_base` (no disponible en la informacion proporcionada) antes de un uso en produccion.
- Ausencia de validacion: la model card no incluye resultados de evaluacion ni tabla de tasa de exito, el repositorio tiene 0 descargas y 0 likes, y no se documentan pruebas en robot real. No debe considerarse un modelo validado para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edgarcancinoe/smolvla_water_base-4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Guia de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour
- Analisis de la arquitectura SmolVLA (Medium): https://medium.com/@ahabb/anatomy-of-vla-inside-smolvla-424062c65aa4
