# langli11/microduck-tricks

## Resumen

Microduck Tricks es un conjunto de tres políticas de reinforcement learning para el robot bípedo Microduck, desarrollado por langli11 y presentado como Hugging Face × Pollen Robotics. El modelo resuelve el problema de ejecutar habilidades de locomoción avanzadas en el robot: correr y encadenar una voltereta hacia adelante hasta ponerse en pie, hacer un eslalon de conos sobre patines de cuchilla y levantar una sola cuchilla mientras se desliza. Estas habilidades se entrenan con PPO sobre el entorno mjlab (MuJoCo Warp) y se exportan a ONNX, de modo que se pueden intercambiar en caliente con las políticas oficiales del runtime existente del robot.

Las políticas utilizan el contrato de observación compartido de 61 dimensiones a 50 Hz, lo que las hace compatibles con la infraestructura de despliegue preexistente. El autor no publica el número de parámetros ni la arquitectura interna de las redes, por lo que estos datos se indican como no disponibles. La relevancia del proyecto radica en el método de evaluación: la selección de checkpoints se realiza mediante una batería de protocolos de despliegue en el simulador, no por la recompensa de entrenamiento, y los resultados demuestran mejoras sustanciales frente a las políticas oficiales en tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de reinforcement learning (PPO) exportadas a ONNX; contrato de observación de 61 dimensiones a 50 Hz |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

Las tres políticas se entrenan con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno de simulación mjlab, que usa MuJoCo Warp para acelerar el entrenamiento. Según ficha, los experimentos se ejecutaron en Hugging Face Jobs con 4096 entornos simultáneos. Cada política adopta el mismo contrato de observación de 61 dimensiones a 50 Hz que comparten las políticas oficiales del repositorio upstream, lo que permite que se integren sin modificar el runtime.

La innovación técnica destacable no está en la arquitectura de la red (que se describe como una política ONNX, sin detalles internos publicados), sino en el protocolo de evaluación: los checkpoints se seleccionan exclusivamente por una batería de pruebas de despliegue simuladas, que incluyen hand-off desde la política de marcha, conos físicos simulados, arranques desde reposición y perturbaciones externas. Esta batería se comporta de forma independiente a las curvas de entrenamiento, y en el caso del deslizamiento de una sola cuchilla se realizó una sonda de física de coste cero con un controlador basado en modelo y un MPC con modelo perfecto antes de seguir entrenando, lo que permitió redefinir el objetivo a lo que el hardware realmente puede alcanzar (un techo medido de aproximadamente 1 segundo de apoyo simple).

## Capacidades

- Ejecuta una secuencia de correr, voltereta hacia adelante y levantarse (élan roulade) con inducción por impulso y alta tolerancia a perturbaciones.
- Realiza un eslalon de 8 conos con separación de 0,7 metros montado sobre patines de cuchilla, completando todas las puertas sin golpear conos.
- Levanta una cuchilla mientras patina, manteniendo apoyo simple de 0,4 a 0,6 segundos por carga de contacto, y vuelve a apoyar sin caerse.
- Las políticas se intercambian en caliente junto a las políticas oficiales del repositorio Microduck, al compartir el contrato de observación de 61 dimensiones.
- No ofrece capacidades de generación de texto, tool calling o programación: es exclusivamente un modelo de control de robot por reinforcement learning.

## Casos de uso

- Investigación en learning by reinforcement para robótica: las políticas sirven como referencia para estudiar cómo entrenar habilidades acrobáticas complejas en un bípedo de bajo coste, usando MuJoCo Warp y PPO.
- Validación de robustez en simulación antes del despliegue físico: el protocolo de evaluación con empujones durante la voltereta y variaciones de masa o fricción permite comprobar la tolerancia a perturbaciones sin tocar el hardware.
- Desarrollo de habilidades para robots de servicio: la secuencia de correr-rodar-levantarse puede trasladarse a robots humanoides ligeros o bípedos para recuperación de caídas o para sortear obstáculos de forma dinámica.
- Benchmarking de rendimiento en entornos de simulación: la comparación explícita contra la política oficial (por ejemplo, en el eslalon con patines) proporciona una métrica de referencia para la comunidad de mjlab o Microduck.
- Prototipado de manos robóticas o patines de robot: la capacidad de levantar una sola cuchilla durante el deslizamiento ayuda a evaluar el control de apoyo simple en sistemas de tracción con patines.
- Educación en reinforcement learning: los scripts incluidos permiten reproducir el entrenamiento con `uv run train`, la evaluación con `scripts/eval_*.py` y la inferencia en CPU con `infer_policy.py`, lo que facilita estudiar el flujo completo de PPO en robótica.

## Benchmarks y rendimiento

Los resultados publicados provienen de una batería de evaluación en el simulador, con métricas específicas por habilidad. No se han publicado benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque este no es un modelo de lenguaje.

| Skill | Politica | Resultado en simulador (hold-out) |
|---|---|---|
| Run → forward roll → stand | `policies/roulade_elan_v2_ckpt3750.onnx` | Hand-off desde la política de marcha: 200/200 (la política oficial consigue el 86 %); arranque con impulso: 98,4 %; robusto a variaciones de masa del 10 %, fricción de pie entre 0,5 y 1,5 y empujones a mitad de la voltereta |
| Roller-skate cone slalom | `policies/roller_slalom_v2_ckpt2000.onnx` | Recorrido de 8 conos a 0,7 m de separación: 8/8 puertas, 0 golpes de cono, 0 caídas en 50 intentos a 0,5 m/s (la política oficial alcanza el 21 % de puertas y sufre un 75 % de caídas) |
| Single-blade lift while skating | `policies/roller_glide_short_v15_ckpt1750.onnx` | Con un flag de comando: levanta la cuchilla, mantiene apoyo simple 0,4–0,6 s, baja y continúa patinando; 0 caídas en 24 episodios con semilla. El deslizamiento sostenido no es alcanzable (techo ≈ 1 s) |

## Requisitos de hardware

- Para inferencia de una política ONNX se puede usar el simulador en CPU: el repositorio incluye `uv run scripts/infer_policy.py --walking policies/<file>.onnx --new-cmd-obs`, que no requiere GPU.
- Para el entrenamiento con PPO se recomienda el uso de Hugging Face Jobs con 4096 entornos, tal como se indica en los comandos de entrenamiento.
- No se disponen de datos de VRAM ni de latencia específicos; la inferencia de las políticas ONNX es ligera, pero el autor no cuantifica los recursos necesarios.
- Las políticas se pueden desplegar en ONNX Runtime, MuJoCo o mediante los scripts de inferencia incluidos en el repositorio; no se proporcionan configuraciones para vLLM, llama.cpp u otros motores de LLM.

## Comparativa con modelos similares

La comparativa más relevante es contra las políticas oficiales del repositorio Microduck, que se han utilizado como referencia en la misma batería de evaluación. No se conocen modelos de terceros comparables en esta categoría específica.

| Politica | Arranque con impulso | Eslalon con patines | Apoyo simple en deslizamiento | Licencia |
|---|---|---|---|---|
| Official Microduck policy | 86 % de hand-off éxito | 21 % de puertas, 75 % de caídas | no disponible | Apache 2.0 (según repositorio upstream) |
| Microduck tricks (este modelo) | 98,4 % de arranque; 200/200 de hand-off | 8/8 puertas, 0 caídas | 0,4–0,6 s en 24 intentos | Apache 2.0 |

## Limitaciones y advertencias

- Todos los resultados son exclusivamente en simulador; nada se ha probado aún en el robot físico. El rendimiento real puede variar.
- El deslizamiento sostenido sobre una sola cuchilla no es alcanzable en este robot: el techo medido por controladores de referencia es de aproximadamente 1 segundo, y la política solo logra un apoyo simple breve.
- La selección de los mejores checkpoints no se basa en la recompensa de entrenamiento, sino en la batería de evaluación de despliegue; esto es una buena práctica, pero implica que la recompensa de entrenamiento no es informativa sobre el rendimiento final.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento simbólico, tool calling ni ningún caso de uso de NLP.
- El licenciamiento sigue al repositorio upstream; aunque la ficha publica Apache 2.0, conviene revisar el repositorio original para confirmar condiciones adicionales.
- El número de parámetros, la arquitectura exacta de las redes y los requisitos de hardware no se publican, lo que dificulta la comparación con otros modelos de control.

## Enlaces

- HuggingFace: https://huggingface.co/langli11/microduck-tricks
- Fork con código y resultados: https://github.com/easyrider11/microduck_rl/tree/overnight-elan-slalom
- Repositorio upstream Microduck RL: https://github.com/pollen-robotics/microduck_rl
- Repositorio Microduck biped: https://github.com/pollen-robotics/microduck
- mjlab (MuJoCo Warp): https://github.com/mujocolab/mjlab
