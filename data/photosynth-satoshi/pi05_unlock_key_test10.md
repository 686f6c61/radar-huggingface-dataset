# photosynth-satoshi/pi05_unlock_key_test10

## Resumen

El modelo `photosynth-satoshi/pi05_unlock_key_test10` es un fine-tune del modelo base `lerobot/pi05_base`, una implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence. Se trata de un modelo Vision-Language-Action (VLA) de flujo, diseñado para generalización en entornos abiertos, que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones de control para robots. Este fine-tune concreto se ha entrenado para la tarea específica de "abrir una puerta con una llave" utilizando un dataset de 10 episodios (4071 frames) capturados con un robot tipo `so_follower` y dos cámaras.

Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 9,4 GB en formato safetensors, el modelo está pensado para ejecutarse en hardware con GPU. Su relevancia radica en que demuestra el flujo completo de fine-tune de un VLA de última generación sobre una tarea robótica concreta, utilizando la infraestructura de LeRobot. Aunque se trata de un experimento de pequeña escala (solo 200 pasos de entrenamiento), sirve como referencia práctica para desarrolladores que deseen adaptar π₀.₅ a sus propios robots y tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en flujo, adaptado de OpenPI (π₀.₅) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el despliegue en Jetson Thor usa TensorRT NVFP4, pero no se documenta cuantizacion del modelo en el repo) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en ingles, segun la tarea definida) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `lerobot/pi05_base` es la implementacion en PyTorch/LeRobot del π₀.₅, un modelo de flujo (flow-based) que evoluciona el π₀ original para mejorar la generalizacion a entornos y situaciones no vistas durante el entrenamiento. La arquitectura combina un codificador visual (procesa imagenes de dos camaras: base y muñeca) con un codificador de lenguaje y un decodificador de acciones, generando una politica de control de 6 dimensiones (posicion y orientacion del efector final). El entrenamiento del fine-tune se realizo sobre el dataset `photosynth-satoshi/so101_unlock_key`, que contiene 10 episodios de 4071 frames a 30 FPS, con la tarea "Unlock the door with the key". Se usaron 200 pasos de entrenamiento, batch size 2, optimizador AdamW, learning rate 2.5e-05 y semilla 1000, con la version 0.6.2 de LeRobot. No se menciona el uso de RLHF ni DPO; el proceso es de imitacion supervisada (behavior cloning).

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad (posicion y orientacion) a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa imagenes de una camara base (480x640) y una camara de muñeca (480x640), ambas en RGB.
- Comprension de instrucciones en lenguaje natural: la tarea se describe textualmente ("Unlock the door with the key") y el modelo asocia la instruccion con la secuencia de acciones.
- Generalizacion open-world (heredada del modelo base): π₀.₅ esta disenado para adaptarse a entornos nuevos, aunque este fine-tune concreto solo ha sido validado en un escenario limitado.
- Fine-tune especifico de tarea: el modelo ha sido ajustado para una unica tarea de manipulacion, lo que limita su reutilizacion directa a tareas similares.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).

## Casos de uso

- Automatizacion de tareas de desbloqueo: el modelo puede controlar un robot para insertar una llave y girarla en una cerradura, util en entornos domesticos o industriales donde se requiera apertura fisica de puertas.
- Pruebas de concepto en imitacion learning: sirve como ejemplo de fine-tune de un VLA sobre un dataset pequeño, permitiendo evaluar el flujo de trabajo de LeRobot con π₀.₅.
- Investigacion en generalizacion de politicas roboticas: al partir de un modelo base con capacidades open-world, se puede estudiar como el fine-tune con pocos episodios afecta a la capacidad de transferencia a nuevas configuraciones.
- Desarrollo de sistemas de manipulacion con dos camaras: la arquitectura con camara base y de muñeca es representativa de setups roboticos reales, por lo que el modelo puede servir de referencia para integrar dicha configuracion.
- Benchmark de rendimiento en tareas de interaccion fisica: aunque no hay evaluacion publicada, el modelo puede usarse como baseline para comparar otros metodos de fine-tune o arquitecturas VLA.
- Educacion y formacion en robotica: dado su tamano moderado y licencia permisiva, es adecuado para cursos o talleres que enseñen a entrenar y desplegar modelos de politicas roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet." No se dispone de metricas como tasa de exito en la tarea ni comparaciones con otros modelos en el mismo escenario.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parametros, en precision fp16 se requieren aproximadamente 8,3 GB de VRAM; con cuantizacion de 4 bits, alrededor de 2,1 GB (estimacion teorica, no documentada en el repo).
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070, A10) para inferencia en fp16; para entrenamiento se recomienda una GPU con 12 GB o mas (RTX 4080, A100, etc.).
- Compatibilidad con GPU de consumo: si, es posible ejecutar inferencia en GPUs de consumo con 8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en un robot real; tambien se puede usar con el framework OpenPI (JAX) y se ha documentado despliegue en NVIDIA Jetson AGX Thor con TensorRT NVFP4 para inferencia de baja latencia.
- Latencia y throughput: no disponibles; dependen del hardware y de la optimizacion (TensorRT puede reducir latencia significativamente, como se indica en el tutorial de Jetson AI Lab).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `photosynth-satoshi/pi05_unlock_key_test10` | 4,14 B | no disponible | Desbloqueo de puerta con llave | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` | 4,14 B (estimado) | no disponible | Generalista (pre-entrenado) | Apache 2.0 | HuggingFace |
| π₀ (original, de Physical Intelligence) | no disponible | no disponible | Generalista | no disponible (codigo abierto en OpenPI) | GitHub |

No se dispone de datos de rendimiento comparativo. El fine-tune se diferencia del modelo base en que esta especializado en una tarea concreta, mientras que el base es un modelo pre-entrenado para multiples tareas. π₀ (el predecesor) tiene una arquitectura similar pero sin las mejoras de generalizacion de π₀.₅.

## Limitaciones y advertencias

- Entrenamiento con muy pocos datos: solo 10 episodios y 200 pasos, lo que probablemente limita la robustez y la capacidad de generalizacion a variaciones del entorno (iluminacion, posicion de la llave, tipo de cerradura).
- Sin evaluacion publicada: no hay metricas de exito en el robot real, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion en acciones: como todo modelo generativo, puede producir secuencias de acciones incoherentes o inseguras si las observaciones se alejan de la distribucion de entrenamiento.
- Sesgos de los datos: el dataset proviene de un unico robot y entorno, por lo que el modelo puede no transferir bien a otros robots o configuraciones.
- Limitaciones de idioma: aunque la tarea esta en ingles, no se especifican los idiomas soportados; es probable que solo funcione con instrucciones en ingles.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los componentes de OpenPI; no se han identificado restricciones adicionales en la informacion disponible.
- Adecuacion para produccion: dado su caracter experimental y la falta de evaluacion, no se recomienda su uso en aplicaciones criticas sin una validacion exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/photosynth-satoshi/pi05_unlock_key_test10
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/photosynth-satoshi/so101_unlock_key
- Documentacion de LeRobot para π₀.₅: https://huggingface.co/docs/lerobot/pi05
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (codigo fuente): https://github.com/Physical-Intelligence/openpi
- Tutorial de despliegue en Jetson Thor: https://www.jetson-ai-lab.com/tutorials/openpi_on_thor/
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
