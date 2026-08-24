# RoboDyna/X-VLA-RoboDyna

## Resumen

X-VLA-RoboDyna es un modelo de visión-lenguaje-acción (VLA) de 0,9 mil millones de parámetros, resultado del fine-tuning del checkpoint base X-VLA-Pt (desarrollado por el equipo de X-VLA, arXiv:2510.10274) sobre el benchmark RoboDyna Benchmark v2. Este benchmark se centra en manipulación dinámica con dos brazos robóticos UR5 con pinzas WSG, incluyendo objetos en movimiento, cintas transportadoras, objetos que caen o ruedan, y distracciones. El modelo está entrenado para emitir comandos de pose absoluta del efector final (20 dimensiones, dos brazos) a partir de observaciones visuales de tres cámaras RGB.

La relevancia de este modelo radica en que aborda un escenario poco cubierto por los VLA generalistas: la manipulación dinámica y bimanual con ventanas de tiempo cerradas. Al estar basado en X-VLA, hereda su mecanismo de soft prompts para adaptación cross-embodiment, lo que permite especializarlo a un dominio concreto sin contaminar los prompts preentrenados. El repositorio incluye los archivos de modelado necesarios para cargarlo de forma autónoma con `trust_remote_code`.

Es importante señalar que el autor indica explícitamente que **no se ha realizado ninguna evaluación de rollout**; solo se ha verificado la convergencia del entrenamiento y que el checkpoint carga correctamente. Por tanto, no hay tasa de éxito reportada y debe tratarse como una línea base entrenada, no como un resultado validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA con soft prompts (basado en X-VLA, con codificador Florence-2) |
| Parametros totales | 879.738.545 (0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de video de 30 pasos de acción; no se especifica contexto textual) |
| Tipos de cuantizacion | no disponible (solo safetensors en bf16 según entrenamiento) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3,5 GB repo) |

## Arquitectura y entrenamiento

X-VLA-RoboDyna se basa en la arquitectura X-VLA, un transformer que integra un codificador de visión (Florence-2) con un modelo de lenguaje y un mecanismo de soft prompts. Los soft prompts son vectores aprendidos que codifican la configuración del hardware (embodiment) y permiten adaptar el modelo a nuevos dominios sin modificar los pesos preentrenados. En este caso, se ha utilizado el slot de soft prompt con `domain_id = 19`, que no fue usado durante el preentrenamiento, garantizando que los prompts de los dominios 0-18 permanecen intactos.

El entrenamiento se realizó sobre 4.050 episodios y 35 tareas del benchmark RoboDyna v2, con 1,37 millones de fotogramas a 16,67 Hz y tres vistas RGB. Se usaron 8 GPU H200 con batch global de 256 (32 por GPU), precisión bf16 y DDP. El modelo se entrenó durante 30.000 pasos (~5 horas 45 minutos) con una tasa de aprendizaje de 1e-4 y un coeficiente de aprendizaje de 0,1 para el VLM y los soft prompts (1e-5). El espacio de acción es el vector `ee6d` de 20 dimensiones de X-VLA, que representa poses absolutas del efector final (posición, rotación en formato rot6d interleaved y apertura de pinza). El chunk de acción es de 30 pasos a 16,67 Hz (~1,8 segundos).

Una particularidad importante es que el dataset RoboDyna original proporciona acciones en espacio articular de 14 dimensiones, pero X-VLA requiere el espacio de 20 dimensiones de efector final, por lo que el entrenamiento se realizó a partir de `observation.endpose` (poses del efector) en lugar de la columna `action` del dataset. Además, se invirtió la convención de la pinza (1 = cerrado en X-VLA, 1 = abierto en RoboDyna) y se confirmó que los cuaterniones fuente son scalar-first (wxyz).

## Capacidades

- **Manipulación bimanual dinámica**: el modelo está entrenado para controlar dos brazos UR5 con pinzas WSG en tareas con objetos en movimiento, cintas transportadoras, objetos que caen o ruedan y distracciones.
- **Control de efector final absoluto**: emite poses absolutas (no incrementales) de 20 dimensiones, incluyendo rotación en formato rot6d interleaved y apertura de pinza (logits con sigmoid).
- **Ejecución de acciones en chunk**: genera secuencias de 30 pasos de acción (~1,8 s) a la frecuencia nativa de 16,67 Hz.
- **Adaptación cross-embodiment mediante soft prompts**: el mecanismo de soft prompts permite especializar el modelo a un dominio concreto sin alterar los prompts preentrenados de otros dominios.
- **Procesamiento de múltiples vistas RGB**: utiliza tres vistas de cámara para la observación visual.
- **Integración con el ecosistema X-VLA**: sirve a través de HTTP (método `run`), compatible con el cliente del repositorio X-VLA original.

## Casos de uso

- **Manipulación de objetos en cintas transportadoras**: el modelo puede controlar dos brazos para recoger o clasificar piezas que se mueven a velocidad constante, gracias a su entrenamiento en tareas con conveyor belts y ventanas de tiempo cerradas.
- **Picking de objetos en caída o rodadura**: útil en entornos industriales donde las piezas no están estáticas; el modelo ha sido entrenado con objetos que caen o ruedan, lo que permite anticipar trayectorias.
- **Montaje colaborativo bimanual**: tareas que requieren coordinar ambos brazos simultáneamente (por ejemplo, ensamblar dos piezas) usando el espacio de acción de 20 dimensiones.
- **Investigación en VLA dinámicos**: sirve como línea base entrenada para comparar métodos de manipulación dinámica en el benchmark RoboDyna v2, aunque aún no tiene evaluación de rollout publicada.
- **Desarrollo de políticas cross-embodiment**: al estar basado en X-VLA, puede servir para estudiar cómo los soft prompts permiten transferir habilidades entre distintos robots sin reentrenar el backbone.
- **Simulación robótica con SAPIEN/RoboTwin**: el modelo está alineado con las convenciones del generador SAPIEN (cuaterniones wxyz, rot6d interleaved), por lo que puede desplegarse directamente en entornos simulados compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación de rollout y que no hay tasa de éxito reportada. Solo se verifica la convergencia del entrenamiento (pérdida mediana por bloque de 5k pasos: 1.466 → 0.258 → 0.182 → 0.134 → 0.110 → 0.114, con los últimos 2k pasos en 0.105). No se proporcionan métricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible oficialmente. Con 879,7M parámetros en bf16, el peso del modelo ocupa aproximadamente 1,76 GB; con activaciones y overhead, se estima un consumo de 4-8 GB en inferencia, aunque no hay datos confirmados.
- **GPU recomendadas**: el entrenamiento se realizó en 8 × H200. Para inferencia, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A10, L4) debería ser suficiente, pero no está verificado.
- **Compatibilidad con GPU de consumo**: probablemente sí en cuantización de 8 bits o 4 bits, pero no hay cuantizaciones publicadas en el repositorio.
- **Opciones de despliegue**: el modelo se sirve mediante HTTP usando el método `run` del propio X-VLA. No se menciona soporte para vLLM, llama.cpp u Ollama; al ser un modelo de robótica con código personalizado, el despliegue requiere el stack de transformers con `trust_remote_code`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA-RoboDyna | 0,9B | no disponible | VLA bimanual dinámico (fine-tuning) | Apache-2.0 | HuggingFace |
| X-VLA-Pt (base) | 0,9B | no disponible | VLA cross-embodiment preentrenado | Apache-2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | VLA generalista (acción de 7 DoF) | MIT | HuggingFace |
| RT-2 (Google) | 55B | no disponible | VLA generalista | no libre | no público |

La comparativa es limitada porque X-VLA-RoboDyna es un fine-tuning especializado en un benchmark concreto, no un modelo generalista. Su principal diferencia frente a OpenVLA o RT-2 es el uso de soft prompts para adaptación cross-embodiment y su foco en manipulación dinámica bimanual, así como su tamaño reducido (0,9B frente a 7B o 55B). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Sin evaluación de rollout**: el autor no ha publicado ninguna tasa de éxito ni métricas de rendimiento en el entorno real o simulado. El modelo debe considerarse una línea base no validada.
- **Espacio de acción específico**: el modelo emite poses absolutas de efector final en el formato `ee6d` de X-VLA. Cualquier despliegue debe respetar las convenciones de rot6d interleaved, pinza 1 = cerrado y cuaterniones wxyz; errores en la decodificación invalidan la política.
- **Dependencia de código remoto**: el repositorio requiere `trust_remote_code=True` y los archivos de modelado personalizados; esto implica un riesgo de seguridad si no se audita el código.
- **Limitado a dos brazos UR5-WSG**: el modelo fue entrenado específicamente para esta configuración; no se espera que generalice a otros robots sin reentrenamiento o adaptación de soft prompts.
- **Sin soporte de lenguaje natural**: no es un modelo de chat ni de generación de texto; su salida es exclusivamente el vector de acción de 20 dimensiones.
- **Riesgo de alucinación visual**: al ser un VLA, puede generar acciones incorrectas ante observaciones fuera de la distribución del benchmark (objetos no vistos, iluminación distinta, etc.).
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base X-VLA-Pt también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RoboDyna/X-VLA-RoboDyna)
- [Dataset RoboDyna Benchmark v2](https://huggingface.co/datasets/RoboDyna/robodyna-benchmark-v2)
- [Checkpoint base X-VLA-Pt](https://huggingface.co/2toINF/X-VLA-Pt)
- [Paper X-VLA (arXiv:2510.10274)](https://arxiv.org/pdf/2510.10274)
- [Página del proyecto X-VLA](https://thu-air-dream.github.io/X-VLA/)
- [Documentación de X-VLA en LeRobot](https://huggingface.co/docs/lerobot/v0.5.0/en/xvla)
- [Repositorio GitHub de X-VLA (referencia)](https://github.com/VuLamAnh151203/X-VLA)
- [Ficha de X-VLA en RoboAtlas](https://www.roboatlas.ai/en-US/models/x-vla)
