# OpenWAM-Stanford/OpenWAM-IDM-Mixed-CF64k

## Resumen

OpenWAM-IDM-Mixed-CF64k es un modelo de dinámica inversa (inverse dynamics model, IDM) para robótica desarrollado por OpenWAM-Stanford. Su función es traducir un plan visual en acciones de robot: recibe la observación actual (vistas de cámara del agente y de la muñeca), la propiocepción del robot y un vídeo futuro corto representado como latentes, y predice controles delta del efector final junto con comandos del gripper. No requiere condicionamiento por lenguaje de tarea ni acciones pasadas, lo que permite reutilizar el mismo IDM congelado con distintos predictores de vídeo adaptados a cada tarea.

Este checkpoint concreto combina un 60% de dinámica contrafactual y un 40% de demostraciones reales durante el post-entrenamiento del IDM sobre LIBERO-Long (LIBERO-10). La colección CF64k aporta intervenciones de acción variadas junto a los movimientos dirigidos a tarea de las demostraciones. Se construye sobre el backbone preentrenado en vídeo de robot de OpenWAM y se entrena durante 20.000 pasos de post-entrenamiento.

El modelo es relevante porque separa explícitamente planificación y control: un predictor de vídeo describe el movimiento y el IDM lo convierte en acciones. Con el IDM congelado, el sistema compuesto alcanza un 95,4% de éxito en LIBERO-10 (500 episodios) y un 94,0% de transferencia media a cuatro tareas de LIBERO-90.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de dinámica inversa sobre backbone preentrenado en vídeo de robot (OpenWAM); no se detalla la arquitectura interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: observación actual + vídeo futuro corto en latentes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0-only |
| Formato de pesos | no disponible (repo PyTorch, 30,7 GB) |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone de OpenWAM preentrenado con vídeo de robot. El IDM consume las vistas de cámara del agente y de la muñeca, la propiocepción y un vídeo futuro corto codificado como latentes, y produce controles delta del efector final y comandos de gripper. No utiliza condicionamiento por lenguaje de tarea ni acciones pasadas, lo que lo hace agnóstico al predictor de vídeo que lo alimenta.

El post-entrenamiento se realiza sobre LIBERO-Long (LIBERO-10) durante 20.000 pasos. La mezcla de datos es un 60% de dinámica contrafactual (colección CF64k, con intervenciones de acción variadas) y un 40% de demostraciones reales dirigidas a tarea. El checkpoint es la variante mixta; existe una contraparte solo contrafactual (OpenWAM-IDM-CF64k). No se detallan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Predicción de acciones de robot a partir de observación visual actual y futuro visual deseado (dinámica inversa).
- Control del efector final mediante deltas y comandos de gripper.
- Uso de múltiples entradas: cámara del agente, cámara de muñeca y propiocepción.
- Procesamiento de vídeo futuro representado como latentes.
- Funcionamiento sin condicionamiento por lenguaje de tarea ni historial de acciones, lo que permite reutilizarlo con distintos predictores de vídeo adaptados a tarea.
- Composición con un predictor de vídeo en el pipeline video-a-acción de OpenWAM.
- Entrenamiento con dinámica contrafactual para mejorar la robustez ante variaciones de acción.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en entornos tipo LIBERO: el modelo convierte un plan visual generado por un predictor de vídeo en comandos de efector final y gripper, adecuado para tareas de manipulación de horizonte largo como las de LIBERO-10.
- Reutilización del IDM congelado con múltiples políticas de vídeo: al no depender del lenguaje de tarea ni de acciones pasadas, el mismo checkpoint sirve como componente de acción para distintos predictores de vídeo adaptados a cada tarea, reduciendo el coste de reentrenamiento.
- Transferencia a nuevas tareas de manipulación: los resultados de transferencia a cuatro tareas de LIBERO-90 (94,0% medio) indican que el IDM generaliza a tareas no vistas durante el post-entrenamiento cuando se combina con predictores ajustados.
- Investigación en planificación visual: permite estudiar la separación entre planificación (predictor de vídeo) y control (IDM) de forma modular.
- Aumento de datos con dinámica contrafactual: la mezcla CF64k facilita experimentos sobre cómo las intervenciones de acción afectan a la robustez del control.
- Evaluación comparativa de predictores de vídeo: al mantener el IDM fijo, se puede medir el rendimiento de distintos predictores de vídeo de forma aislada sobre el mismo componente de control.
- Prototipado en laboratorio de pipelines video-a-acción: el repositorio incluye pesos y configuración de inferencia, lo que facilita montar el sistema completo con la guía de OpenWAM.

## Benchmarks y rendimiento

| Evaluación | Configuración | Éxito |
|---|---|---|
| LIBERO-10, 500 episodios | IDM congelado + predictor de vídeo OpenWAM VTA step-9700 (477/500) | 95,4% |
| Transferencia a cuatro tareas de LIBERO-90, 50 episodios cada una | IDM congelado + predictores de vídeo ajustados a tarea (tareas 21, 45, 64 y 74); media de las cuatro | 94,0% |

Los resultados miden el sistema compuesto vídeo-a-acción con este IDM congelado, no el IDM de forma aislada. No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros IDM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 30,7 GB, lo que da una referencia del tamaño en disco de los pesos, pero no se especifica el consumo de memoria en inferencia.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: inferencia mediante PyTorch y el pipeline video-a-acción de OpenWAM (guía en el repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| OpenWAM-IDM-Mixed-CF64k | IDM sobre backbone de vídeo de robot | 60% contrafactual + 40% demostraciones, LIBERO-10, 20k pasos | no disponible | 95,4% LIBERO-10; 94,0% transferencia LIBERO-90 | AGPL-3.0-only |
| OpenWAM-IDM-CF64k | IDM sobre backbone de vídeo de robot | Solo dinámica contrafactual CF64k | no disponible | no disponible en esta información | AGPL-3.0-only (según contraparte) |

No se dispone en la información proporcionada de datos de otros IDM comparables (parámetros, contexto o rendimiento) para ampliar la comparativa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en el benchmark LIBERO; el rendimiento fuera de ese dominio no está documentado.
- El modelo solo admite inglés como idioma declarado y no utiliza condicionamiento por lenguaje de tarea, por lo que no se puede instruir mediante texto.
- Los resultados publicados corresponden al sistema compuesto con un predictor de vídeo concreto; el rendimiento del IDM aislado no se reporta.
- Riesgo de alucinación no aplicable en el sentido de lenguaje, pero sí de predicciones de acción incorrectas ante futuros visuales fuera de distribución.
- No se documentan sesgos específicos ni análisis de robustez ante cambios de cámara, iluminación o morfología del robot.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft fuerte para uso en red y distribución; conviene revisar los términos antes de un uso comercial o en productos cerrados. Se mantienen atribuciones y licencias upstream en NOTICE y LICENSE.upstream.
- No se especifican requisitos de memoria, latencia ni compatibilidad con GPU de consumo, lo que dificulta planificar el despliegue en producción.
- El checkpoint es una variante mixta; para reproducir los resultados hay que emparejarlo con el predictor de vídeo y la configuración de inferencia indicados.

## Enlaces

- Hugging Face: https://huggingface.co/OpenWAM-Stanford/OpenWAM-IDM-Mixed-CF64k
- Proyecto: https://openwam.stanford.edu/
- Código: https://github.com/OpenWAM/OpenWAM
- Guía de inferencia (video-a-acción): https://github.com/OpenWAM/OpenWAM/blob/main/docs/video_action_composition.md
- Contraparte solo contrafactual: https://huggingface.co/OpenWAM-Stanford/OpenWAM-IDM-CF64k
