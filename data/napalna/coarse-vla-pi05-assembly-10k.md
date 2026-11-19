# napalna/coarse-vla-pi05-assembly-10k

## Resumen

`coarse-vla-pi05-assembly-10k` es un ajuste fino del modelo visión-lenguaje-acción (VLA) π0.5 de Physical Intelligence, publicado por el usuario napalna como parte del proyecto coarse-vla. El modelo resuelve una tarea muy concreta: el ensamblaje de cuatro piezas (cuadrada, redonda, hexagonal y de cruz) de 25 mm con una holgura de 0,8 mm por lado en un tablero, usando un brazo UR10e con pinza Robotiq 2F-85 en el simulador MuJoCo. Se trata de un checkpoint intermedio (10.000 de los 30.000 pasos previstos) que cubre la fase de aproximación, agarre y transporte; la inserción final la asume un actor de aprendizaje por refuerzo entrenado en simulación.

El modelo parte de `lerobot/pi05_base` y se ha ajustado con 400 demostraciones generadas por un oráculo scriptado (358.000 fotogramas a 20 Hz), con dos cámaras de 224×224 (tercera persona y muñeca). Los pesos son las medias exponenciales (EMA, decaimiento 0,999) almacenadas en fp32, con 4.143.404.816 parámetros y un repositorio de 16,6 GB. Es relevante ahora porque ejemplifica el patrón de descomposición de tareas en robótica: un VLA genérico para el transporte y un controlador especializado para la inserción de precisión, una arquitectura híbrida que mejora drásticamente el éxito en tareas de contacto ajustado.

La licencia no está declarada en la información disponible y no se han publicado resultados en robot real, solo en simulación. El checkpoint requiere una clase de política específica del proyecto (`pi05_delta`) que añade acciones delta respecto a la pose del TCP en la observación y pasos de prompt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer visión-lenguaje-acción), ajuste completo sobre `lerobot/pi05_base` |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32; entrenamiento con autocast bf16) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (layout `pretrained_model` de LeRobot, con config y pre/post-procesadores) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de π0.5, un VLA que combina un codificador visual con un modelo de lenguaje y una cabeza de acciones. La receta sigue la configuración `pi05_libero` de openpi en la medida de lo posible: acciones delta del efector final relativas a la pose del TCP en la observación, horizonte de 10 pasos a 20 Hz, sin estado propioceptivo en el prompt, tasa de aprendizaje constante de 5e-5 tras un calentamiento de 1.000 pasos, optimizador AdamW, batch de 32 y pesos fp32 con autocast bf16. Los pesos publicados son las medias EMA con decaimiento 0,999.

Los datos de entrenamiento consisten en 400 demostraciones scriptadas de un UR10e con Robotiq 2F-85 insertando cuatro clavijas en un tablero dentro de MuJoCo, con posiciones iniciales del brazo, colocación de piezas, pose del tablero y orden de instrucciones aleatorizados. La innovación destacable no está en la arquitectura sino en el esquema de control: el VLA se especializa en aproximación, agarre y transporte, mientras que un actor de RL entrenado en simulación (con profesor privilegiado) ejecuta la inserción. La carga del modelo exige la clase de política `pi05_delta` del repositorio del proyecto, que implementa las acciones delta y los pasos de prompt.

## Capacidades

- Generación de acciones motoras de efector final (delta respecto al TCP) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Percepción visual con dos cámaras de 224×224 (tercera persona y muñeca).
- Selección correcta de la pieza objetivo y transporte hasta el orificio correspondiente (error lateral mediano de 4 mm en el orificio).
- Seguimiento de instrucciones de ensamblaje con orden aleatorizado.
- Control de horizonte corto (10 pasos a 20 Hz) adecuado para bucles cerrados de manipulación.
- No se ha documentado soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito; el modelo está especializado en una única tarea de manipulación.

## Casos de uso

- Investigación en ensamblaje robótico de precisión: el modelo sirve como componente de transporte dentro de una arquitectura híbrida VLA + RL, donde el actor de inserción aporta la precisión sub-milimétrica. Es adecuado porque ya demuestra selección y aproximación correctas en el 88 % de las cadenas con el actor de RL.
- Generación de datos sintéticos para entrenamiento: al estar entrenado en MuJoCo con un oráculo scriptado, puede usarse para producir trayectorias de aproximación y agarre que alimenten otros pipelines de aprendizaje por imitación.
- Estudio de descomposición de tareas en robótica: permite comparar el rendimiento de un VLA solo frente a un VLA asistido por un controlador especializado, con métricas cerradas (9 % vs 88 % en primera pieza insertada).
- Benchmark de políticas VLA en simulación: sirve como referencia reproducible para evaluar variantes de π0.5 en tareas de contacto ajustado con holguras de 0,8 mm.
- Prototipado de pipelines LeRobot: al usar el layout `pretrained_model` de LeRobot 0.6.1, se integra en flujos de entrenamiento y evaluación existentes sin conversión adicional.
- Docencia y divulgación sobre VLA: el par de checkpoints y las métricas publicadas permiten ilustrar las limitaciones de los modelos visión-lenguaje-acción en tareas de inserción sin control especializado.

## Benchmarks y rendimiento

Resultados en bucle cerrado publicados por el autor en este checkpoint (32 cadenas de validación de 4 instrucciones, en distribución):

| Configuración | Primera pieza insertada | Las cuatro piezas | Piezas por cadena |
|---|---|---|---|
| π0.5 solo | 9 % | 0 % | 0,13 |
| π0.5 + actor RL de inserción (profesor privilegiado) | 88 % | 56 % | 2,81 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 16,6 GB, por lo que se necesita al menos una GPU con 24 GB para cargarlos sin cuantización; con cuantización a bf16 o fp16 el requisito bajaría a unos 8-9 GB, aunque no se documentan pesos cuantizados.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para inferencia en fp32 sin compromisos; una RTX 4090 (24 GB) es el mínimo práctico para los pesos publicados.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con 24 GB, siempre que se respete el formato fp32 o se aplique cuantización manual no documentada.
- Opciones de despliegue: LeRobot 0.6.1 con la clase de política `pi05_delta` del repositorio coarse-vla; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de robótica con pre/post-procesadores específicos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coarse-vla-pi05-assembly-10k | 4,14 B | no disponible | Ensamblaje de 4 piezas en MuJoCo | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista | no disponible | Hugging Face |
| π0.5 (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la misma tarea, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo evaluación en simulación (MuJoCo); no hay validación en robot real, por lo que la transferencia al mundo físico es incierta.
- El modelo por sí solo inserta la primera pieza en solo el 9 % de las cadenas y no completa las cuatro en ningún caso; requiere el actor de RL para la inserción.
- Checkpoint intermedio (10.000 de 30.000 pasos previstos); el rendimiento puede mejorar en versiones posteriores.
- Error lateral mediano de 4 mm en el orificio, insuficiente para la holgura de 0,8 mm sin control especializado.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas soportados no documentados; las instrucciones de entrenamiento están en un idioma no especificado.
- Dependencia de una clase de política concreta (`pi05_delta`) y de LeRobot 0.6.1, lo que limita la portabilidad a otros frameworks.
- Riesgo de sobreajuste a la distribución de las 400 demostraciones scriptadas (posiciones, orden de instrucciones y poses del tablero).
- No se documentan sesgos ni riesgos de alucinación en el sentido textual, pero el modelo puede generar acciones incorrectas fuera de la distribución de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/napalna/coarse-vla-pi05-assembly-10k
- Repositorio del proyecto: https://github.com/AhnJinYoung/coarse-vla
- Clase de política: `experiments/cvr_mj/vla_policy.py` en el repositorio anterior
- Modelo base: https://huggingface.co/lerobot/pi05_base
- LeRobot: https://github.com/huggingface/lerobot
- openpi: no disponible
