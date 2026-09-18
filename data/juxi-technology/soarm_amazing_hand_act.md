# Juxi-Technology/soarm_amazing_hand_act

## Resumen

SO-ARM101 + AmazingHand ACT es una política de imitación basada en Action Chunking Transformer (ACT) entrenada para una tarea concreta de manipulación robótica: coger un cubo con una mano diestra. El modelo lo publica Juxi-Technology sobre el framework LeRobot de Hugging Face y combina un brazo seguidor SO-ARM101 (6 grados de libertad, con el servo de pinza sustituido por una AmazingHand de 8 servos SCS0009) con dos cámaras USB (una cenital y otra en la muñeca) a 640×480 y 30 fps.

El problema que resuelve es el de llevar una política de imitación de bajo coste desde la teleoperación hasta la ejecución autónoma en hardware abierto y asequible. En lugar de entrenar un modelo de lenguaje o visión-lenguaje, aprende una política de control visuomotor a partir de 20 demostraciones teleoperadas (18.538 fotogramas) grabadas en cuatro posiciones distintas de la mesa, y produce secuencias de 100 acciones (*action chunks*) por inferencia para amortiguar el ruido del operador humano.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento y el despliegue de políticas robóticas open source, y porque la extensión a una mano diestra de 8 grados de libertad sobre un brazo de 5 servos es un caso poco común en modelos publicados. La arquitectura es un transformer con codificador-decodificador y *backbone* visual ResNet-18, con 51,7 millones de parámetros totales y licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) con codificador-decodificador transformer y *backbone* visual ResNet-18 preentrenado en ImageNet |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no procesa tokens; horizonte de acción fijo de 100 pasos (`chunk_size` = 100, `n_action_steps` = 100) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (precision no documentada) |
| Idiomas soportados | no aplica: el modelo no procesa lenguaje natural; la tarea se fija con la cadena exacta `Pick up the cube with the dexterous hand` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tarea | `Pick up the cube with the dexterous hand` (una sola tarea) |
| Entradas | `observation.state` (6 dimensiones) + 2 imágenes RGB (cámaras `top` y `wrist`, 640×480 a 30 fps) |
| Salidas | `action` (6 dimensiones) |
| Dimensiones de la accion | `shoulder_pan.pos`, `shoulder_lift.pos`, `elbow_flex.pos`, `wrist_flex.pos`, `wrist_roll.pos`, `gripper.pos` |
| Hardware objetivo | SO-ARM101 seguidor (5 × STS3215, IDs 1-5, sin servo de pinza) + AmazingHand (8 × SCS0009, IDs 1-8) |
| Dataset de entrenamiento | `Juxi-Technology/soarm_amazing_hand_pick` (20 demostraciones, 18.538 fotogramas a 30 fps) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 15 / 0 |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un *backbone* convolucional ResNet-18 (preentrenado en ImageNet) para extraer características de las dos vistas RGB, un transformer codificador-decodificador que fusiona esas características con el estado propioceptivo de 6 dimensiones, y una cabeza de acción que predice bloques de 100 acciones de 6 dimensiones cada una. El uso de *action chunks* en lugar de acciones individuales mitiga el problema del *compounding error* típico de las políticas que solo predicen el siguiente paso, a costa de requerir un horizonte de control fijo. El modelo tiene una formulación CVAE (autoencoder variacional condicional) propia de ACT, aunque la model card no detalla la configuración latente ni si se usó el estilo de inferencia determinista o estocástico.

El entrenamiento se realizó durante 60.000 pasos con tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-5, *weight decay* 1e-4 y recorte de gradiente de 10,0. El conjunto de datos son 20 demostraciones teleoperadas de la tarea, con el cubo colocado en 4 posiciones distintas de la mesa y 5 episodios por posición para cubrir variación posicional. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias: es aprendizaje por imitación supervisado puro. La integración con el hardware tiene una particularidad técnica relevante: la AmazingHand se controla mediante `rustypot` (`Scs0009PyController`) en lugar del bus Feetech habitual de LeRobot, porque SCS0009 (protocolo 1) y STS3215 (protocolo 0) no pueden compartir bus; el puerto serie y la alimentación de la mano son independientes. La apertura de la pinza del brazo líder se mapea linealmente sobre la pose de apertura/cierre de la mano.

## Capacidades

- Control visuomotor de manipulación: predice 6 grados de libertad de acción (5 del brazo más una dimensión virtual de pinza) a partir de dos imágenes RGB y del estado articular actual.
- Ejecución de una tarea de agarre concreta: coger un cubo de la mesa con una mano diestra de 8 grados de libertad.
- Aprendizaje por imitación con *action chunking*: genera secuencias de 100 acciones por inferencia, lo que produce movimientos más suaves que las políticas paso a paso.
- Percepción visual desde dos cámaras: vista cenital (`top`) y vista de muñeca (`wrist`) a 640×480 y 30 fps.
- Control coordinado brazo-mano: la mano diestra se acciona de forma sincronizada con el brazo mediante el mapeo del servo de pinza del líder.
- No dispone de *tool calling*, ni de capacidades de agente, ni de razonamiento multi-paso simbólico, ni de soporte multilingüe. No es un modelo de lenguaje ni un modelo visión-lenguaje-acción.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo se comporta ACT cuando el efector final pasa de una pinza de un grado de libertad a una mano diestra de ocho actuadores.
- *Benchmark* de hardware abierto de bajo coste: permite evaluar en un banco real la combinación SO-ARM101 + AmazingHand, dos plataformas open source, sin depender de brazos industriales.
- Replicación de experimentos de teleoperación: como el dataset de entrenamiento está publicado y consta de 20 episodios y 18.538 fotogramas, se puede reentrenar la política y comparar variaciones (número de demostraciones, posiciones del cubo, iluminación) contra esta referencia.
- Base para *fine-tuning* en tareas de agarre similares: al estar bajo Apache 2.0 y en formato LeRobot, se puede reajustar con demostraciones propias de otra tarea de manipulación de objetos pequeños.
- Docencia y formación en robótica: el flujo `lerobot-rollout` con una política preentrenada permite ilustrar el ciclo completo de teleoperación, entrenamiento y despliegue en un laboratorio.
- Pruebas de integración de *software* de control: útil para validar la convivencia de dos protocolos de bus distintos (STS3215 y SCS0009) y el uso de `rustypot` junto a LeRobot en un mismo *pipeline*.
- Evaluación de velocidad de inferencia en robótica: el modelo es un caso útil para medir la diferencia entre inferencia en CPU (~4 Hz, insuficiente para los 30 Hz objetivo) y en GPU CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de intentos, ni comparaciones cuantitativas con otras políticas. Los únicos datos de rendimiento declarados son operativos:

| Metrica | Valor |
|---|---|
| Frecuencia de control objetivo | 30 Hz |
| Frecuencia de inferencia en CPU | ~4 Hz (declarada como insuficiente; el movimiento resulta visiblemente lento) |
| Frecuencia de inferencia en GPU | no disponible en cifras; se indica que requiere `--device=cuda` |
| Tasa de éxito en la tarea | no disponible |
| Numero de demostraciones de entrenamiento | 20 episodios |
| Fotogramas de entrenamiento | 18.538 a 30 fps |
| Pasos de entrenamiento | 60.000 |

## Requisitos de hardware

- VRAM estimada: no confirmada en la documentación. Con 51,7 millones de parámetros, los pesos en fp32 ocupan aproximadamente 207 MB; sumando activaciones de ResNet-18 y del transformer a 640×480, la inferencia debería caber holgadamente en menos de 2 GB de VRAM, pero esta cifra es una estimación, no un dato publicado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderna es suficiente por tamaño de modelo (RTX 3060, RTX 4090, A100, H100). La model card solo exige `--device=cuda`.
- GPU de consumo: sí, cabe en GPUs de consumo; el cuello de botella no es la memoria sino la latencia de inferencia necesaria para sostener 30 Hz junto al bucle de control.
- CPU: no recomendada. La propia model card indica que la inferencia en CPU ronda los 4 Hz frente a los 30 Hz objetivo.
- Opciones de despliegue: `lerobot-rollout` con una instalación personalizada de LeRobot (`pip install -e ".[amazinghand,training]"`) que incluya la definición del robot `so_amazing_hand`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a una política de control robótico.
- Periféricos obligatorios: dos cámaras USB (`top` y `wrist`) a 640×480 y 30 fps, un puerto serie para el brazo seguidor y otro independiente para la mano, con alimentación separada para la AmazingHand.
- Latencia y throughput: solo se declara la comparación CPU (~4 Hz) frente a objetivo (30 Hz). No hay cifras de latencia por *chunk* ni de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos verificables de parámetros, contexto o rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a la categoría y a consideraciones cualitativas.

| Modelo | Categoria | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-ARM101 + AmazingHand ACT (este modelo) | ACT, imitación, brazo + mano diestra | 51.668.614 | *chunk* de 100 acciones | apache-2.0 | Hugging Face, vía LeRobot; 15 descargas |
| ACT original (Zhao et al., 2023, arXiv:2304.13705) | ACT, imitación bimanual de bajo coste | no disponible en esta ficha | *chunk* de acciones | no disponible en esta ficha | paper y repositorio del proyecto ALOHA |
| Diffusion Policy | Política de imitación basada en difusión, alternativa dentro de LeRobot | no disponible | no disponible | no disponible | integrada en LeRobot como alternativa de política |
| SmolVLA | Modelo visión-lenguaje-acción, alternativa en LeRobot | no disponible | no disponible | no disponible | Hugging Face / LeRobot |

La diferencia principal frente a las alternativas es el efector final: este modelo controla una mano diestra de 8 servos además de los 5 del brazo, mientras que la mayoría de políticas de bajo coste publicadas asumen una pinza paralela de un grado de libertad. No hay cifras comparativas de éxito publicadas.

## Limitaciones y advertencias

- Generalización posicional limitada: funciona bien cerca de las 4 posiciones de cubo grabadas; la tasa de éxito cae de forma apreciable fuera de esas zonas.
- Política de un solo disparo: no se repite de forma autónoma tras completar el agarre; el objeto y el brazo deben recolocarse manualmente entre ejecuciones.
- Sensibilidad al entorno: los datos se recogieron con una única escena e iluminación; cambios en la pose de cámara, la iluminación o el fondo degradan el rendimiento.
- Despliegue en GPU obligatorio: en CPU la inferencia baja a ~4 Hz frente a los 30 Hz objetivo, lo que ralentiza visiblemente el movimiento.
- Dependencia de coincidencia exacta con el entrenamiento: la cadena `--task` debe coincidir literalmente con la de entrenamiento y los nombres y el orden de las cámaras deben ser idénticos a los usados durante la grabación.
- Requisitos de calibración: el robot debe estar calibrado previamente (`hand_angles.json` y archivos de calibración por articulación) y la mano necesita puerto serie y alimentación independientes.
- Integración no estándar: requiere una versión personalizada de LeRobot con la definición `so_amazing_hand` y el uso de `rustypot` para los SCS0009, en lugar del bus Feetech habitual.
- Riesgo de fallo físico: al ser una política de control sobre hardware real, los errores de predicción se traducen en colisiones, agarres fallidos o movimientos bruscos; se recomienda operar con límites de par y paradas de emergencia.
- Sin datos de sesgo, alucinación o rendimiento multilingüe aplicables: no es un modelo de lenguaje ni genera texto, por lo que esas categorías de riesgo no aplican.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se documentan restricciones adicionales de uso.
- Madurez baja: 15 descargas y 0 *likes*, sin validación independiente conocida; conviene tratar el modelo como un artefacto de investigación y no como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Juxi-Technology/soarm_amazing_hand_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Juxi-Technology/soarm_amazing_hand_pick
- Paper de ACT (referenciado en los tags): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Los resultados de búsqueda web devueltos no contienen enlaces relevantes al modelo (páginas genéricas de Google), por lo que no se añaden más referencias.
