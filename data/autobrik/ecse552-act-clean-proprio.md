# Autobrik/ecse552-act-clean-proprio

## Resumen

Autobrik/ecse552-act-clean-proprio es un conjunto de checkpoints de política robótica basados en ACT (Action Chunking with Transformers), el método de imitación propuesto por Tony Zhao y colaboradores. Lo publica el usuario Autobrik como artefacto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No se trata de un modelo de lenguaje: es una política visomotora entrenada para controlar un brazo robótico a partir de observaciones de cámara, sin usar el estado proprioceptivo del robot (las entradas de estado se ponen a cero).

El modelo parte del código original de ACT sin modificar y se entrena sobre el dataset Autobrik/ecse552-ocbench-block. Las adaptaciones respecto a ACT canónico son concretas: solo imágenes como entrada, 7 dimensiones de acción rellenadas con ceros hasta las 14 de ACT original, episodios de longitud variable y chunk de 20 pasos a 10 Hz (2 segundos de horizonte, frente a los 100 pasos a 50 Hz de ACT). Las acciones son objetivos articulares absolutos.

Su relevancia es acotada y de carácter académico: sirve como referencia reproducible de ACT aplicado a una tarea de manipulación concreta, con checkpoints por número de demos y semilla, y con artefactos de selección y procedencia. No hay resultados de benchmarks publicados ni métricas de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de chunk de 20 pasos a 10 Hz (2 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`; estadísticas en `dataset_stats.pkl` |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imágenes de cámara) a secuencias de acciones articulares, prediciendo un chunk de acciones futuras en lugar de una sola acción por paso. En esta variante, la entrada de estado del robot se anula (todo ceros) y solo se usan imágenes; las 7 dimensiones de acción del entorno se rellenan con ceros hasta las 14 que espera la implementación upstream. Los episodios tienen longitud variable y el chunk se fija en 20 pasos a 10 Hz.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `3d0229e65911bc561020a3597ddc7dfaed01fa7c`, con la configuración `configs/act_clean_proprio.toml` y el adaptador `src/action_free/act_original.py` del repositorio del proyecto. Cada directorio `n<demos>/seed<k>/` contiene una ejecución independiente con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, que es el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, split y datos), `history.json` (pérdidas por época) y `provenance.json`. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica en imitación supervisada).

## Capacidades

- Generación de acciones articulares absolutas para control de un brazo robótico a partir de imágenes de cámara.
- Imitación supervisada de demostraciones humanas (behavior cloning) con predicción de chunks de 20 acciones.
- Operación sin estado proprioceptivo: la política funciona solo con visión, lo que la hace adecuada para configuraciones donde el estado del robot no está disponible o es ruidoso.
- Múltiples variantes entrenadas con distinto número de demostraciones y semilla, lo que permite estudiar la sensibilidad al volumen de datos y a la inicialización.
- Artefactos de selección de checkpoint y procedencia para reproducibilidad experimental.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni capacidades multilingües.

## Casos de uso

- Reproducción académica de ACT: cargar `selected.ckpt` con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` para replicar los experimentos del proyecto ECSE 552 y comparar curvas de pérdida desde `history.json`.
- Estudio de ablación sobre número de demostraciones: comparar los directorios `n<demos>/` para medir cómo escala el rendimiento de la política con el volumen de datos de imitación.
- Estudio de variabilidad por semilla: usar los distintos `seed<k>/` para estimar la varianza del entrenamiento de ACT en una tarea de manipulación concreta.
- Política solo-visión en entornos donde el estado proprioceptivo no es fiable: al anular la entrada de estado, el modelo es un punto de partida para escenarios con encoders articulares ausentes o ruidosos.
- Benchmark interno de manipulación: servir como línea base de imitación para comparar contra métodos posteriores (difusión, flow matching) sobre el mismo dataset ocbench-block.
- Docencia y divulgación: ejemplo completo y ligero de pipeline de imitación robótica con checkpoints, estadísticas de normalización y metadatos de ejecución listos para inspección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; ACT es una política relativamente pequeña (encoder visual tipo ResNet más transformer), por lo que en la práctica suele caber en GPUs de consumo, pero no hay cifras publicadas para este checkpoint concreto.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por la naturaleza de ACT es plausible en GPUs consumer modernas, pero debe verificarse empíricamente.
- Opciones de despliegue: carga mediante PyTorch con el adaptador `action_free.act_original.ActPolicy` del repositorio del proyecto; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Horizonte de acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-clean-proprio | ACT (imitación supervisada) | Solo imágenes | Chunk 20 a 10 Hz | MIT | Hugging Face |
| ACT original (tonyzhaozh/act) | ACT (imitación supervisada) | Imágenes + estado | Chunk 100 a 50 Hz | MIT | GitHub |
| Políticas de difusión para robótica (p. ej. Diffusion Policy) | Difusión condicionada | Imágenes (+ estado) | Variable | Varía | Repos públicos |
| Políticas VLA generalistas (p. ej. RT-2, OpenVLA) | Modelo visión-lenguaje-acción | Imágenes + instrucción textual | Variable | Varía | Repos públicos |

La comparación cuantitativa con estas alternativas no está disponible: no hay métricas publicadas para este checkpoint ni tablas comparativas en la model card.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: entrenado para una única tarea de manipulación (ocbench-block); no generaliza a otras tareas, objetos ni entornos sin reentrenamiento.
- Sin estado proprioceptivo: al anular las entradas de estado, la política puede ser menos precisa en tareas que requieren realimentación de posición o fuerza.
- Sin métricas de éxito publicadas: no se puede afirmar su rendimiento en el mundo real ni en simulación a partir de la información disponible.
- Riesgo de sobreajuste a las condiciones de recogida del dataset (iluminación, cámara, disposición de la mesa); no se documentan evaluaciones de robustez.
- Sesgos: no aplica en el sentido lingüístico, pero sí puede heredar sesgos de las demostraciones humanas (estilos de agarre, trayectorias) y de la distribución del dataset.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el código base de ACT y las dependencias deben revisarse por separado; el dataset asociado puede tener condiciones propias no detalladas aquí.
- Uso en producción: no recomendado sin validación adicional; es un artefacto académico con 0 descargas y 0 likes, sin mantenimiento documentado.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-clean-proprio
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
