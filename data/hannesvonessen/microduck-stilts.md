# HannesVonEssen/microduck-stilts

## Resumen

El modelo `microduck-stilts` es un conjunto de ocho políticas de control para el robot bípedo MicroDuck, desarrollado por Hannes von Essen en el ecosistema del proyecto MicroDuck de Pollen Robotics. Cada política está especializada en caminar hacia adelante sobre zancos (stilts) de una altura concreta, desde 100 mm hasta 2.000 mm, utilizando una mezcla de morfología fijada en 0.50. Se trata de experimentos de simulación, no de políticas validadas en hardware, y están orientadas a la investigación en control de locomoción con morfologías extremas.

El modelo se distribuye en formato ONNX para inferencia, junto con checkpoints de PyTorch para continuar el entrenamiento. Cada política incluye un vídeo de 10 segundos que muestra el rollout completo sin reinicios ni contactos auxiliares con el cuerpo. El repositorio asociado `Vottivott/microduck-playground` contiene el código de entrenamiento, el currículo ejecutado y los archivos STL de las geometrías utilizadas. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su enfoque de curriculum learning aplicado a un robot de bajo coste y código abierto, explorando límites de estabilidad en alturas de zancos que van mucho más allá de lo razonable para hardware impreso. Es un recurso útil para investigadores en robótica, sim2real y aprendizaje por refuerzo, aunque debe tratarse como un artefacto de simulación y no como un controlador listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (MLP) - no se especifica detalle de capas ni unidades |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo ONNX sin cuantizacion declarada) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (inferencia), PyTorch .pt (checkpoints) |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card, pero por el contexto de entrenamiento con PPO (se menciona "original full PPO state" y "exploration standard deviation") se trata de una red de politica y valor, probablemente un perceptron multicapa (MLP) que mapea una observacion de 61 dimensiones a 14 acciones de control. La observacion incluye probablemente estados articulares, velocidades, comandos de consigna y lecturas de sensores, con un normalizador integrado en cada grafo ONNX. La salida son 14 acciones que representan posiciones objetivo de los servos, con una escala de 1.0 rad alrededor de la postura HOME del MicroDuck.

El entrenamiento se realizo con un curriculum de alturas de zancos, desde 100 mm hasta 2.000 mm, con iteraciones que van desde 2.200 hasta 6.500. Cada politica se entreno de forma independiente para una altura especifica, con una mezcla de morfologia (blend) de 0.50 y puntas redondeadas de 17 × 22 mm. No se detalla el numero de tokens ni la composicion del dataset, ya que no es un modelo de lenguaje. Los checkpoints de continuacion conservan el actor y el normalizador exactos, pero no el critic ni el optimizador originales, por lo que se proporciona un critic compatible nuevo, momentos de optimizador vacios, tasa de aprendizaje de 1e-5 y desviacion estandar de exploracion de 0.1.

## Capacidades

- Caminar hacia adelante sobre zancos de alturas especificas: 100, 150, 200, 250, 500, 1.000, 1.400 y 2.000 mm.
- Control en bucle cerrado a 50 Hz, con entrada de observacion de 61 valores y salida de 14 acciones.
- Soporte de continuacion de entrenamiento mediante checkpoints que preservan el actor y el normalizador.
- Integracion con el entorno de simulacion Mjlab (MuJoCo) y el flujo de trabajo de `microduck-playground`.
- Inferencia mediante grafos ONNX con normalizador horneado, listos para despliegue en aplicaciones externas.
- No incluye capacidades de lenguaje, vision ni tool calling; es exclusivamente un controlador de locomocion.

## Casos de uso

- Investigacion en control de locomocion bipeda con morfologias extremas: el modelo permite estudiar como una politica de RL se adapta a alturas de zancos que desafian la estabilidad, desde 100 mm hasta 2 m, en un entorno simulado controlado.
- Desarrollo de controladores para robots con zancos: los grafos ONNX pueden integrarse en pipelines de robotica para probar estrategias de marcha en simulacion antes de cualquier intento de transferencia a hardware.
- Estudio de curriculum learning en RL: el conjunto de politicas muestra como el entrenamiento progresivo por alturas puede generar comportamientos estables en condiciones de dificultad creciente, util como referencia para disenar curriculos en otros dominios.
- Benchmark de algoritmos de refuerzo para control de robots: las ocho politicas proporcionan una base de comparacion para evaluar nuevos metodos de RL en tareas de locomocion con restricciones morfologicas.
- Generacion de datos de simulacion para otros modelos: los rollouts de las politicas pueden usarse para generar trayectorias de entrenamiento para modelos de aprendizaje imitativo o de dinamica.
- Educacion en robotica y RL: al ser un proyecto open source con codigo de entrenamiento disponible, sirve como caso de estudio practico para ensenar tecnicas de PPO, sim2real y diseno de recompensas en entornos de MuJoCo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas como tasas de exito, distancias recorridas o consumo energetico. Los unicos datos de rendimiento son cualitativos: los videos muestran soporte alternado de zancos durante 10 segundos sin reinicios ni contacto auxiliar, pero no hay cifras cuantitativas.

## Requisitos de hardware

- Inferencia: al ser un grafo ONNX de tamano reducido (el repositorio completo ocupa 0.1 GB, incluyendo videos y checkpoints), la politica en si es muy ligera y puede ejecutarse en tiempo real a 50 Hz en una CPU moderna o en una GPU basica.
- VRAM estimada: no disponible, pero por el tamano del modelo se espera que quepa en cualquier GPU con al menos 1 GB de VRAM, o incluso en CPU sin problema.
- GPUs recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (por ejemplo, NVIDIA GTX 1050 o superior) es suficiente.
- Despliegue: se puede usar ONNX Runtime, o bien cargar los checkpoints de PyTorch en el entorno de entrenamiento de `microduck-playground` para continuar el entrenamiento.
- Latencia y throughput: no se proporcionan datos, pero dado el tamano del modelo y la frecuencia de control de 50 Hz, la latencia de inferencia deberia ser del orden de milisegundos en hardware convencional.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas de control para MicroDuck con zancos). El proyecto MicroDuck de Pollen Robotics ofrece otros modelos de RL, como `microduck-running`, pero no se han publicado comparaciones directas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Solo simulacion: las politicas no han sido validadas en hardware real; cualquier uso en un robot fisico requiere un proceso de sim2real adicional y conlleva riesgos de comportamiento impredecible.
- Alturas extremas: las variantes de 500 a 2.000 mm son resultados de investigacion en control extremo y no se recomiendan para hardware impreso monolitico, segun el propio autor.
- Checkpoints de continuacion incompletos: los checkpoints no incluyen el critic ni el optimizador originales, por lo que reanudar el entrenamiento no reproduce exactamente el estado original de PPO.
- Riesgo de sobreajuste a la simulacion: las politicas pueden explotar caracteristicas del entorno simulado que no existen en el mundo real, como fricciones o rigideces ideales.
- Seguridad de los checkpoints: los archivos .pt usan pickle internamente; deben cargarse solo desde repositorios y revisiones de confianza para evitar ejecucion de codigo malicioso.
- Sin garantias de rendimiento: no hay metricas cuantitativas de exito ni de robustez ante perturbaciones, por lo que su uso en produccion requiere validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-stilts
- Repositorio de MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL de MicroDuck: https://github.com/pollen-robotics/microduck_rl
- Playground de MicroDuck (codigo de entrenamiento, STLs, curriculum): https://github.com/Vottivott/microduck-playground
- Pagina oficial de MicroDuck: https://pollen-robotics.com/microduck/
- Commit especifico del playground: https://github.com/Vottivott/microduck-playground/commit/5663044eb4a68b0fbab5aaa5e3e448983494b0dc
