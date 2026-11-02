# DexForceAI/embodichain_model

## Resumen

EmbodiChain models es un repositorio de pesos preentrenados publicado por DexForceAI para el entorno de simulación y entrenamiento EmbodiChain, orientado a robótica con aprendizaje por refuerzo. No se trata de un modelo de lenguaje: el repositorio contiene 12 políticas PPO entrenadas para tareas de locomoción y control de robots cuadrúpedos y humanoides (ANYmal-C, G1, Go1, Go2, H1_2 y MicroDuck), cada una en dos configuraciones físicas (`default` y `newton`). Su relevancia radica en que empaqueta artefactos listos para evaluar en simulación, con manifiestos de ejecución, instantáneas de configuración y evidencias de evaluación, lo que facilita reproducir resultados sin reentrenar.

El paquete también incluye una sección experimental de modelos de dinámica neuronal (NeRD) con bundles específicos por robot (Cartpole y Ant) que declaran licencia Apache-2.0 en sus carpetas versionadas. El tamaño total del repositorio es de 0,2 GB, lo que refleja que son pesos compactos de políticas, no redes de gran escala. Las políticas PPO no declaran licencia de pesos, un punto crítico para cualquier uso más allá de la evaluación interna.

La evaluación publicada cubre 1.000 pasos de control (20 segundos simulados) con FastRT sobre DexSim 0.5.0, Warp 1.15.0 y Newton 1.4.0, incluyendo una prueba headless de G1 en ambos backends partiendo de cachés vacías. El proyecto está en fase de investigación y la propia model card advierte de que la reproducción exacta de precisión de los artículos no está establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de aprendizaje por refuerzo (PPO) para control de robots; bundles separados de dinámica neuronal (NeRD) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Políticas PPO: sin licencia de pesos declarada; bundles NeRD: Apache-2.0 en sus carpetas versionadas |
| Formato de pesos | Pesos tensoriales en layout RUN nativo de EmbodiChain; bundles NeRD con pesos solo-tensor y manifiestos de códec/física |

## Arquitectura y entrenamiento

Las 12 políticas incluidas se entrenaron con PPO (Proximal Policy Optimization) para tareas de locomoción sobre seis plataformas robóticas: ANYmal-C, Unitree G1 (locomoción plana), Unitree Go1, Unitree Go2, Unitree H1_2 y MicroDuck. Cada robot dispone de dos variantes según la configuración física empleada en simulación (`default` y `newton`), lo que permite comparar el comportamiento bajo distintos motores o parámetros de física. Cada bundle de política incluye los pesos, un RunManifest, instantáneas de configuración y la evidencia de evaluación correspondiente, con los contadores de entrenamiento del checkpoint y las versiones de runtime registradas en cada `evaluation.json`.

La sección de dinámica neuronal (NeRD) constituye una línea aparte: bundles de inferencia específicos por robot bajo `neural_dynamics/nerd/<robot>/v1/`, con pesos solo-tensor, manifiestos de códec y física, avisos de licencia y resúmenes compactos de evaluación. Los conjuntos de datos HDF5 asociados se distribuyen en el repositorio `DexForceAI/embodichain_datasets`. No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento ni si se aplicaron fases de ajuste adicionales más allá del propio PPO.

## Capacidades

- Control de locomoción para robots cuadrúpedos (ANYmal-C, Go1, Go2, MicroDuck) y humanoides (G1 en configuración plana, H1_2).
- Ejecución de políticas en simulación con el runtime FastRT de EmbodiChain, con evaluación verificada de 1.000 pasos de control (20 segundos simulados).
- Dos configuraciones físicas por robot (`default` y `newton`), lo que permite evaluar robustez frente a cambios en el motor de simulación.
- Evaluación headless en ambos backends, verificada para G1 partiendo de cachés de modelo y assets vacías.
- Modelos de dinámica neuronal (NeRD) para Cartpole y Ant, orientados a la predicción de dinámica en escenas coincidentes.
- No incluye generación de texto, razonamiento lingüístico, código, matemáticas, visión, tool calling ni capacidades multilingües.

## Casos de uso

- Evaluación reproducible de políticas de locomoción: los bundles permiten ejecutar las 12 políticas PPO con FastRT y comparar resultados contra la evidencia registrada en cada `evaluation.json`, sin necesidad de reentrenar.
- Investigación en simulación de robótica: las variantes `default` y `newton` de cada robot permiten estudiar la sensibilidad de una misma política a cambios en el motor físico, un caso habitual al migrar entre simuladores.
- Desarrollo de pipelines de control para cuadrúpedos: las políticas de Go1, Go2 y ANYmal-C sirven como línea base para tareas de locomoción antes de transferir a hardware o a un simulador propio.
- Benchmarking de infraestructura de simulación: la prueba headless de G1 con cachés vacías en ambos backends es un escenario útil para validar instalaciones de DexSim, Warp y Newton en entornos CI.
- Prototipado de humanoides: las políticas de G1 y H1_2 permiten experimentar con control de locomoción de humanoides en simulación antes de abordar entrenamientos propios.
- Estudio de modelos de dinámica neuronal: los bundles NeRD de Cartpole y Ant, junto con los datasets HDF5 asociados, permiten reproducir experimentos de predicción de dinámica y analizar el drift a largo horizonte.
- Integración en flujos de investigación con aprendizaje por refuerzo: los manifiestos y las instantáneas de configuración facilitan auditar hiperparámetros y contadores de entrenamiento de cada checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta que las 12 políticas completaron 1.000 pasos de control (20 segundos simulados) con FastRT, DexSim 0.5.0, Warp 1.15.0 y Newton 1.4.0, sin métricas de recompensa, éxito de tarea ni comparación numérica entre políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,2 GB, pero no se desglosa el tamaño por política ni los requisitos del runtime.
- GPU recomendadas: no disponible. El runtime declarado es FastRT sobre DexSim 0.5.0, Warp 1.15.0 y Newton 1.4.0; no se especifican modelos de GPU compatibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: EmbodiChain con FastRT; evaluación mediante la CLI documentada en el repositorio de EmbodiChain. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles. Solo se documenta la finalización de 1.000 pasos de control por política.

## Comparativa con modelos similares

| Modelo | Tipo | Robots/tareas | Configuraciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbodiChain models (DexForceAI) | Políticas PPO + bundles NeRD | ANYmal-C, G1, Go1, Go2, H1_2, MicroDuck; Cartpole y Ant (NeRD) | 2 por robot (`default`, `newton`) | PPO sin licencia declarada; NeRD Apache-2.0 | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Las políticas PPO no declaran licencia de pesos; la licencia del código de EmbodiChain no establece sus términos de redistribución, por lo que el uso comercial o la redistribución quedan en un limbo legal.
- Los bundles NeRD declaran Apache-2.0 únicamente en sus propias carpetas versionadas; esa declaración no altera la licencia de las políticas PPO.
- Son versiones de investigación: la model card advierte de que el drift a largo horizonte en Ant sigue siendo significativo y que no se ha establecido la reproducción de la precisión de los artículos.
- La evaluación se limita a 20 segundos simulados por política; no hay evidencia publicada de robustez en horizontes largos ni de transferencia a hardware real.
- El soporte automático de `--pretrained` en EmbodiChain está en preparación; la evaluación se realizó sobre el commit `1b23ea0a` de la rama principal.
- Los assets de robot se distribuyen por separado en `DexForceAI/embodichain_data`, por lo que la reproducibilidad depende de resolver correctamente esa dependencia.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No aplican sesgos lingüísticos ni riesgo de alucinación textual, al no ser un modelo de lenguaje; el riesgo relevante es el fallo de política (caídas, deriva) fuera de las condiciones simuladas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DexForceAI/embodichain_model
- Repositorio de código EmbodiChain: https://github.com/DexForce/EmbodiChain
- Documentación de evaluación de políticas: https://github.com/DexForce/EmbodiChain/blob/main/docs/source/guides/cli.md#policy-evaluation
- Assets de robot: https://huggingface.co/DexForceAI/embodichain_data
- Datasets de dinámica neuronal: https://huggingface.co/datasets/DexForceAI/embodichain_datasets
