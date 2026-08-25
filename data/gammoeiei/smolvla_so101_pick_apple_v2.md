# GammoEiei/smolvla_so101_pick_apple_v2

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para ejecutarse en hardware de consumo. Este repositorio concreto, `smolvla_so101_pick_apple_v2`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario GammoEiei para controlar un robot manipulador tipo SO-101 en la tarea de recoger una manzana (verde o roja) y depositarla en un bol. El modelo combina un vision encoder SigLIP, un modelo de lenguaje SmolLM2 y un action expert, con un total de aproximadamente 450 millones de parámetros.

El modelo está entrenado con el framework LeRobot y el dataset `GammoEiei/so101_pick_apple_2`, que contiene 54 episodios de teleoperación (12 133 fotogramas a 10 FPS). Se publica bajo licencia Apache 2.0 y su pipeline es `robotics`, por lo que no es un modelo de generación de texto generalista sino una política de control para robótica de imitación. Su relevancia radica en que permite desplegar políticas de manipulación en robots de bajo coste con hardware accesible, lo que democratiza la investigación en VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): SigLIP + SmolLM2 + action expert |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de arquitectura transformer híbrida que combina un vision encoder SigLIP para procesar las imágenes de las cámaras, un modelo de lenguaje SmolLM2 para interpretar la instrucción textual y un action expert que regresa las acciones del robot. En el fine-tuning solo se actualizan aproximadamente 50 millones de parámetros (el action expert y las proyecciones), mientras que el vision encoder y el modelo de lenguaje permanecen congelados, lo que reduce drásticamente el coste de entrenamiento.

El modelo se ha entrenado con el framework LeRobot v0.6.2 sobre un dataset de 54 episodios teleoperados con el robot SO-101, con dos cámaras (lateral y muñeca) y un estado del robot de 6 dimensiones. La configuración de entrenamiento fue de 20 000 pasos, batch de 64, optimizador AdamW, learning rate de 1e-4 y semilla 1000. Las instrucciones de las tareas son dos: "Pick up the green apple and put it in the bowl" y "Pick up the red apple and put it in the bowl". No se ha utilizado RLHF ni DPO, sino aprendizaje por imitación directo.

## Capacidades

- Control robótico de pick-and-place: el modelo recibe imágenes de dos cámaras (lateral y muñeca) y el estado del robot, y produce una acción de 6 dimensiones (posición y orientación del efector).
- Ejecución de instrucciones visuales y textuales: distingue entre manzana verde y roja a partir de la instrucción y las imágenes.
- Aprendizaje por imitación: la política se ha entrenado mediante teleoperación con LeRobot, por lo que no requiere un modelo de recompensa explícito.
- Inferencia en tiempo real: gracias a su tamaño compacto, puede ejecutarse en hardware de consumo (GPU domésticas).
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` para desplegar en el robot SO-101 y con `lerobot-train` para fine-tuning adicional.
- No soporta generación de texto general, tool calling ni agentes conversacionales; su única salida es el vector de acción.

## Casos de uso

- **Manipulación robótica de pick-and-place en laboratorio**: el modelo controla un brazo SO-101 para recoger objetos (en este caso manzanas) y colocarlos en un destino fijo. Es adecuado porque ha sido entrenado específicamente para esta tarea y su baja latencia permite operar en tiempo real.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar cómo los VLA compactos se comportan en tareas de manipulación con pocos datos (54 episodios). Los investigadores pueden reproducir el entrenamiento y comparar con otras políticas.
- **Fine-tuning de nuevas tareas**: al estar basado en `lerobot/smolvla_base`, puede adaptarse a otras tareas de manipulación con pocas demostraciones, por ejemplo cambiar el objeto o el destino, usando el flujo de entrenamiento de LeRobot.
- **Automatización de tareas repetitivas en laboratorio**: en entornos controlados, el modelo puede encargarse de clasificar y colocar objetos (piezas, muestras) en contenedores, reduciendo la intervención humana.
- **Benchmark de VLA en hardware de consumo**: permite evaluar el rendimiento de SmolVLA en una tarea realista con una GPU modesta, lo que es útil para comparar con modelos más grandes que requieren servidores dedicados.
- **Educación y prototipado**: estudiantes y aficionados a la robótica pueden desplegar el modelo en un robot SO-101 con cámaras comerciales y experimentar con control por lenguaje e imágenes sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación del policy en el robot real. Tampoco se han publicado métricas comparativas con otros modelos en este repositorio.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 450 millones de parámetros. En FP16 los pesos ocupan aproximadamente 900 MB, por lo que cabe en una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). En FP32 ocuparía unos 1,8 GB, también viable en muchas GPUs.
- **GPU recomendadas**: se puede ejecutar en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o equivalentes de AMD con soporte PyTorch CUDA. El paper de SmolVLA indica que está diseñado para hardware de consumo.
- **Despliegue**: la inferencia se realiza con el paquete LeRobot, mediante el comando `lerobot-rollout`. No se usa vLLM ni llama.cpp, ya que es un modelo de robótica, no un LLM generativo.
- **Latencia**: no se proporcionan datos de latencia específicos. La política está diseñada para operar a la frecuencia del robot (10 FPS en el dataset), por lo que se espera que cada paso de inferencia se complete en menos de 100 ms en una GPU adecuada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **smolvla_so101_pick_apple_v2** (este) | 450 M | no disponible | Pick-and-place de manzanas | Apache 2.0 | Hugging Face |
| **lerobot/smolvla_base** | 450 M | no disponible | Pre-entrenado genérico | Apache 2.0 | Hugging Face |
| **ACT (Action Chunking Transformer)** | ~50 M (típico) | no disponible | Pick-and-place (genérico) | MIT (según implementación) | Repos oficiales |

El modelo base `smolvla_base` es el punto de partida para todos los fine-tunings de SmolVLA. ACT es una alternativa clásica en LeRobot para tareas de manipulación; suele ser más pequeño y requiere menos recursos, pero no integra lenguaje ni visión tan ricos. No se dispone de una comparación cuantitativa entre ellos en esta información.

## Limitaciones y advertencias

- **Sesgos del dataset**: el modelo se ha entrenado con solo 54 episodios de un único robot y entorno. Es probable que no generalice bien a otras configuraciones de cámaras, iluminación o posiciones de los objetos.
- **Riesgo de alucinación en acciones**: como política de imitación, puede generar acciones incorrectas si la entrada se desvía de la distribución de entrenamiento (por ejemplo, si el objeto no está presente o está en una posición inusual).
- **Sin evaluación real**: no se han publicado resultados de éxito en el robot físico, por lo que el rendimiento real es desconocido y puede ser inferior a lo esperado.
- **Restricciones de contexto**: al ser un modelo de robótica, no procesa texto general ni tiene capacidad de conversación. La única entrada textual es la instrucción de la tarea, que debe coincidir con las usadas en el entrenamiento.
- **Licencia y uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (GammoEiei/so101_pick_apple_2) no indica su licencia específica; conviene revisarla antes de usarlo en un producto.
- **Dependencia de hardware**: requiere una GPU compatible con CUDA y el framework LeRobot; no es desplegable en CPU de forma práctica para inferencia en tiempo real.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/GammoEiei/smolvla_so101_pick_apple_v2)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Dataset de entrenamiento GammoEiei/so101_pick_apple_2](https://huggingface.co/datasets/GammoEiei/so101_pick_apple_2)
- [Paper SmolVLA (arxiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Blog de fine-tuning SmolVLA para SO-101 (ggando.com)](https://ggando.com/blog/smolvla-so101/)
- [Repositorio GitHub zwaneiz/so101-vla-pickplace](https://github.com/zwaneiz/so101-vla-pickplace)
- [Repositorio GitHub ggand0/vla-so101](https://github.com/ggand0/vla-so101)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
