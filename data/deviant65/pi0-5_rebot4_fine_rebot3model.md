# Deviant65/pi0.5_rebot4_fine_rebot3model

## Resumen

`Deviant65/pi0.5_rebot4_fine_rebot3model` es una política robótica de tipo Vision-Language-Action (VLA) publicada en Hugging Face por el usuario Deviant65, construida sobre π0.5 (Pi05) de Physical Intelligence mediante la implementación de LeRobot, adaptada del repositorio OpenPI. No se trata del modelo base de propósito general, sino de un ajuste fino sobre un único robot y una única tarea: un `rebot_b601_follower` con dos cámaras Intel RealSense (d415 y d405) que debe coger una caja azul, mostrarla a la cámara y depositarla sobre una marca de cinta negra.

El checkpoint tiene 4.143.404.816 parámetros (unos 4,14 mil millones) y ocupa 9,4 GB en el repositorio, en formato safetensors y con la librería `lerobot`. La entrada son 7 dimensiones de estado propioceptivo más dos imágenes de 3×480×640, y la salida son 7 dimensiones de acción continua. Es, por tanto, un modelo de imitación de extremo a extremo, no un modelo de lenguaje: no genera texto ni responde a preguntas.

Su relevancia es doble. Por un lado, demuestra el flujo completo de LeRobot 0.6.2 para afinar π0.5 con datos propios (53 episodios, 72.259 fotogramas a 30 FPS, 30.000 pasos de entrenamiento). Por otro, sirve como referencia de hasta dónde llega una política ajustada con un dataset pequeño y de una sola tarea: el autor no ha publicado licencia, evaluación real ni vídeo de demostración, y el repositorio no tiene descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π0.5; implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | no aplica; no se documenta que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo contiene safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; la política recibe una instrucción en lenguaje natural en inglés, sin cobertura multilingüe documentada |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de modelo | política de imitación robótica (no es un LLM ni un VLM conversacional) |
| Robot de destino | `rebot_b601_follower` |
| Cámaras | `d415` y `d405`, imágenes de 3×480×640 |
| Entrada de estado | `observation.state`, shape (7,) |
| Salida de acción | `action`, shape (7,) |
| Dataset de entrenamiento | `Deviant65/rebot_4_20261028_140126` (53 episodios, 72.259 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 30.000 (batch 16, AdamW, lr 2,5e-5, semilla 1000) |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política sigue la familia π0/π0.5 de Physical Intelligence, un enfoque de Vision-Language-Action en el que un modelo de visión-lenguaje preentrenado se combina con un experto de acciones que produce trayectorias continuas de control. La model card describe π0.5 como una evolución de π0 orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento; la implementación concreta de este repositorio proviene de OpenPI y se ha portado a LeRobot. La información disponible no detalla la composición exacta del backbone, el número de capas ni el mecanismo de generación de acciones (flow matching u otro), por lo que esos datos deben considerarse no disponibles en esta ficha.

El ajuste fino se realizó sobre un dataset propio de una sola tarea con 53 episodios y 72.259 fotogramas grabados a 30 FPS, lo que equivale a unos 40 minutos de demostraciones. El entrenamiento duró 30.000 pasos con batch de 16, es decir, aproximadamente 480.000 muestras procesadas (cálculo derivado de los datos de la model card), con AdamW a una tasa de aprendizaje de 2,5e-5. No se documenta congelación de capas, aumentos de datos, mezcla con el dataset original de π0.5 ni ninguna etapa de RLHF o DPO, algo que en robótica de imitación no resulta habitual de todos modos.

## Capacidades

- Ejecución de una tarea de manipulación concreta: coger una caja azul, sostenerla frente a la cámara y colocarla sobre una diana marcada con cinta negra.
- Control continuo de un brazo robótico de 7 grados de libertad a partir de estado propioceptivo de 7 dimensiones.
- Fusión de dos flujos visuales simultáneos (vista d415 y vista d405) con el estado del robot para generar acciones.
- Condicionamiento por instrucción en lenguaje natural: la política acepta un `--task` con la descripción textual de la tarea.
- Ejecución autónoma en bucle cerrado sobre hardware real mediante `lerobot-rollout`, con duración configurable.
- Reentrenamiento y reajuste a partir del mismo pipeline (`lerobot-train --policy.type=pi05`), lo que permite reutilizarlo como punto de partida.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, audio ni modo «thinking»; son capacidades ajenas al propósito del modelo.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política recoge un objeto identificable por color y lo deposita en una diana fija, un escenario repetitivo y de baja variabilidad donde un ajuste fino con 53 episodios puede bastar.
- Banco de pruebas de manipulación sobre `rebot_b601_follower`: sirve para validar calibración, sincronía de cámaras y cableado del robot antes de invertir en datasets mayores, ya que reproduce una secuencia conocida de extremo a extremo.
- Punto de partida para ajuste fino con datos propios: al estar publicada con la configuración exacta de entrenamiento (lr, batch, pasos, semilla), permite replicar el experimento cambiando el dataset y medir el efecto de más episodios o de otra tarea.
- Docencia en aprendizaje por imitación: el par política + dataset + comandos de LeRobot constituye un ejemplo completo y reproducible de entrenamiento y despliegue de un VLA en un curso o taller.
- Evaluación comparativa de recetas de entrenamiento: útil como referencia base frente a otros checkpoints del mismo robot para medir el impacto de hiperparámetros o del número de episodios en la tasa de éxito.
- Pruebas de regresión de hardware y óptica: al depender de dos cámaras con nombres e índices concretos, permite detectar cambios de montaje, iluminación o exposición comparando el comportamiento de la política antes y después.
- Integración en pipelines de LeRobot: el checkpoint se carga con `--policy.path` y puede encadenarse con las utilidades de grabación de episodios para generar nuevos datos etiquetados por la propia política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el texto «_No evaluation results have been provided for this policy yet_», es decir, no hay tabla de ensayos, éxitos ni tasa de acierto sobre el robot real.

| Métrica | Valor |
|---|---|
| Tasa de éxito en la tarea | no disponible |
| Número de ensayos reales | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (no es un modelo de lenguaje) |
| Latencia de inferencia medida | no disponible |

## Requisitos de hardware

- VRAM estimada solo para pesos (cálculo a partir de los 4,14 mil millones de parámetros): ≈8,3 GB en FP16/BF16, ≈4,1 GB en int8 y ≈2,1 GB en int4. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- VRAM recomendada para inferencia real: 12-16 GB como mínimo, porque hay que sumar las activaciones de dos imágenes de 480×640 y el estado del robot en cada paso de control.
- GPU de consumo: cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB). En tarjetas de 8-12 GB habría que cuantizar, y no se publican variantes cuantizadas.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S o RTX 6000 Ada; no se necesita más VRAM de la indicada, pero sí baja latencia sostenida para control en tiempo real.
- Almacenamiento: 9,4 GB de repositorio más el espacio de caché de Hugging Face.
- Despliegue: `lerobot-rollout` con `--policy.path=Deviant65/pi0.5_rebot4_fine_rebot3model`, sobre PyTorch con CUDA. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje autoregresivo de texto.
- Latencia y throughput: no documentados. El dataset se grabó a 30 FPS, lo que sugiere un objetivo de control de unos 33 ms por paso, pero no se especifica si la política usa troceado de acciones (action chunking) ni cuántos pasos de inferencia necesita por comando.

## Comparativa con modelos similares

Las cifras de los modelos comparables provienen de su literatura pública y deben verificarse antes de usarlas en producción; las celdas no confirmadas se marcan como no disponibles.

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (π0.5 ajustado) | 4,14 B | 2 imágenes 480×640 + estado (7,) | no disponible | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible; consultar términos de OpenPI | pesos publicados por Physical Intelligence |
| π0 (Physical Intelligence) | ≈3,3 B (dato de literatura pública) | imágenes + estado | no disponible; consultar términos del proyecto | vía OpenPI |
| OpenVLA | 7 B (dato de literatura pública) | 1 imagen + instrucción | licencia del proyecto OpenVLA; verificar | pesos públicos en Hugging Face |
| RDT-1B | 1,3 B (dato de literatura pública) | imágenes + instrucción | verificar en el repositorio del proyecto | pesos públicos |

La diferencia clave frente a todos ellos es la especialización: este checkpoint está entrenado para un robot y una tarea concretos, mientras que los modelos base aspiran a generalización multi-robot y multi-tarea, a costa de un tamaño y unos requisitos mayores.

## Limitaciones y advertencias

- Licencia no definida: la model card indica explícitamente «More Information Needed», por lo que no hay autorización clara para uso comercial. Es un bloqueante legal en producción.
- Generalización muy limitada: 53 episodios de una sola tarea implican un ajuste muy ceñido a posiciones, iluminación y objetos vistos; se espera un fallo rápido ante cambios de color del objeto, altura de la mesa o disposición de la diana.
- Dependencia estricta del hardware: la política asume un `rebot_b601_follower` y dos cámaras con nombres `d415` y `d405` en índices concretos; si los nombres de las claves de observación no coinciden, la inferencia falla.
- Ausencia total de evaluación: no hay tasa de éxito, ni número de ensayos, ni vídeo de demostración, ni descargas que permitan inferir validación por terceros.
- Riesgo de alucinación trasladado al dominio físico: en un VLA, una predicción incorrecta se traduce en movimientos erráticos o colisiones, no en texto plausible. No se documentan paradas de seguridad ni límites de par.
- Sin variantes cuantizadas publicadas: no hay GGUF, AWQ ni GPTQ, de modo que desplegar en GPUs pequeñas exige cuantizar por cuenta propia y asumir la pérdida de precisión en las acciones.
- Sesgos probables del dataset: un único operador, un único entorno y una única configuración de cámara; no se documenta diversidad de posiciones iniciales ni de distractores.
- Idioma: la instrucción de tarea está en inglés y no se declara soporte de otros idiomas; introducir una instrucción en castellano no garantiza ningún comportamiento correcto.
- Repositorio sin mantenimiento aparente: creado y actualizado el mismo día, sin issues, sin demo y con 0 descargas; no hay evidencia de soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/pi0.5_rebot4_fine_rebot3model
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/rebot_4_20261028_140126
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/rebot_4_20261028_140126
- Blog de π0.5 en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π0.5 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
