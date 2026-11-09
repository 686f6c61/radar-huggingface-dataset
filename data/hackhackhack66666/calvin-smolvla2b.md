# hackhackhack66666/Calvin-SmolVLA2b

## Resumen

Calvin-SmolVLA2b es un paquete de investigación para robótica de manipulación que combina el modelo vision-lenguaje-acción (VLA) SmolVLM2-2.2B con un codificador de acciones RVQ (residual vector quantization) congelado y un módulo BAR de tres bloques. Lo publica el usuario hackhackhack66666 y su propósito declarado no es servir como modelo listo para producción, sino reproducir un protocolo de entrenamiento y evaluación cerrada (closed-loop) sobre el benchmark CALVIN, en concreto la tarea D→D con métricas HULC (SR1–SR5 y AvgLen). El repositorio contiene tanto código como pesos de un primer *seed* (seed 0) entrenado en BF16 desde cero hasta el paso 10.000.

El modelo base es SmolVLM2-2.2B, sobre el que se realiza un ajuste completo (sin LoRA) para predecir acciones codificadas mediante el ActionCodec RVQ. La relevancia actual es acotada: se trata de un artefacto de reproducibilidad científica (un *seed* de referencia más la receta para entrenar un segundo *seed*), no de un modelo generalista. El repositorio ocupa 0,7 GB en su forma ligera, aunque los pesos completos de los checkpoints VLA suman aproximadamente 126 GB (31,4 GB por checkpoint).

La licencia es Apache 2.0 y el único idioma declarado es el ruso, si bien en un VLA la dimensión lingüística se refiere a las instrucciones de tarea, no a la generación libre de texto. No hay descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basado en SmolVLM2-2.2B (transformer vision-lenguaje) con módulo BAR de 3 bloques y ActionCodec RVQ congelado |
| Parámetros totales | 2,2 mil millones (modelo base SmolVLM2-2.2B); parámetros del módulo BAR y del codec no disponibles |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los checkpoints se distribuyen en BF16) |
| Idiomas soportados | ru (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (codec RVQ); checkpoints Lightning `.ckpt` (VLA, BF16) |

## Arquitectura y entrenamiento

La arquitectura parte de SmolVLM2-2.2B, un transformer vision-lenguaje, al que se añade un módulo BAR de tres bloques que actúa como cabeza de predicción de acciones sobre un espacio latente discreto definido por un ActionCodec RVQ previamente entrenado y congelado durante el ajuste del VLA. El ajuste es completo (full fine-tuning, sin LoRA) en precisión BF16. El entrenamiento del seed 0 se ejecutó desde cero hasta el paso 10.000, con checkpoints intermedios en los pasos 5.000, 7.000, 9.000 y 10.000. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

El componente de acciones se apoya en un códec RVQ (residual vector quantization) entrenado sobre acciones convertidas del conjunto de tareas D→D de CALVIN, con dos variantes de *seed* (s0 y s1) y sus correspondientes VQ base. El repositorio incluye el código de entrenamiento y evaluación bajo la rama `HiCoRA-VLA`, así como los protocolos de evaluación cerrada y las mediciones asociadas (SR-50/300/500, comparaciones bootstrap pareadas y radar). No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Predicción de acciones robóticas de manipulación a partir de observaciones visuales e instrucciones de tarea, en el marco del benchmark CALVIN.
- Codificación y decodificación de acciones mediante ActionCodec RVQ (espacio latente discreto con cuantización residual).
- Evaluación closed-loop multi-paso (SR1–SR5) sobre la configuración D→D de CALVIN con protocolo HULC.
- Reproducibilidad de experimentos: receta completa para entrenar un segundo *seed* con el mismo pipeline.
- Comprensión de instrucciones en ruso (idioma declarado en la model card).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso general, visión generalista fuera del entorno CALVIN, audio ni modo *thinking*.

## Casos de uso

- Reproducción de experimentos en robótica de manipulación: el paquete permite entrenar un segundo *seed* con la misma receta que el seed 0 y comparar resultados con el mismo protocolo cerrado, lo que facilita análisis de varianza entre inicializaciones.
- Evaluación comparativa de codificadores de acciones: al incluir dos variantes de ActionCodec RVQ (s0 y s1) y sus VQ base, se puede medir el impacto del códec en el rendimiento del VLA.
- Investigación en políticas VLA sobre CALVIN: sirve como línea base reproducible para D→D con métricas HULC (SR1–SR5, AvgLen) frente a nuevas propuestas.
- Auditoría de protocolos de evaluación: los ficheros de `measurements/` (SR-50/300/500, bootstrap pareado) permiten reutilizar el análisis estadístico en otros trabajos.
- Estudio de ajuste completo frente a LoRA: al ser un full fine-tuning en BF16, permite comparar coste y rendimiento frente a variantes parametrizadas eficientes.
- Docencia y formación en VLA: el repositorio incluye guías paso a paso (`docs/GUIDE_SEED1_RU.md`) y resultados detallados (`docs/RESULTS_SEED0_RU.md`) útiles para introducir pipelines de entrenamiento y evaluación cerrada.
- Reutilización del códec RVQ: los checkpoints `rvq_posttrain_s{0,1}` pueden emplearse como componente independiente en otros proyectos que necesiten discretizar acciones continuas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `docs/RESULTS_SEED0_RU.md` y a `measurements/` para las cifras de SR1–SR5 y AvgLen del seed 0, pero los valores concretos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,2 mil millones de parámetros en BF16, el peso del modelo base ronda los 4,4 GB, a lo que hay que sumar el módulo BAR y el códec RVQ.
- Los checkpoints de entrenamiento VLA ocupan 31,4 GB cada uno (Lightning `.ckpt` en BF16 con estado del optimizador), por lo que el entrenamiento completo requiere hardware de clase servidor.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, el ajuste completo en BF16 es viable en GPU profesionales con memoria amplia (A100/H100), mientras que la inferencia podría caber en GPU de consumo con suficiente VRAM, aunque no se confirma.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el repositorio proporciona código propio de entrenamiento y evaluación (`code/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calvin-SmolVLA2b | 2,2 B (base) | no disponible | VLA para CALVIN D→D | Apache 2.0 | Hugging Face (repo de investigación) |
| OpenVLA | no disponible en la información proporcionada | no disponible | VLA para manipulación | no disponible | no disponible |
| RT-2 | no disponible en la información proporcionada | no disponible | VLA para manipulación | no disponible | no disponible |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete está diseñado como material de reproducibilidad de un experimento concreto (seed 0 y receta para seed 1), no como modelo listo para producción.
- El único idioma declarado es el ruso; el soporte multilingüe no está documentado.
- El ámbito de aplicación está restringido al benchmark CALVIN (tareas D→D) y a la manipulación robótica simulada; no se documenta generalización a otros entornos.
- Los pesos completos del VLA suman aproximadamente 126 GB; un `git clone` sin `GIT_LFS_SKIP_SMUDGE=1` descarga todo el conjunto, lo que puede ser costoso en almacenamiento y ancho de banda.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en un VLA, el riesgo principal es la predicción de acciones incorrectas, no la generación de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin evaluación fuera del protocolo CALVIN.
- No se han publicado métricas de rendimiento en los datos disponibles; cualquier uso comparativo requiere consultar `docs/RESULTS_SEED0_RU.md` y `measurements/` en el propio repositorio.
- El módulo BAR y el códec RVQ no tienen especificaciones públicas de tamaño ni de contexto, lo que dificulta estimar requisitos de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hackhackhack66666/Calvin-SmolVLA2b
- Dataset asociado: https://huggingface.co/datasets/hackhackhack66666/calvin_dataset
- Guía para el seed 1: `docs/GUIDE_SEED1_RU.md` (dentro del repositorio)
- Resultados del seed 0: `docs/RESULTS_SEED0_RU.md` (dentro del repositorio)
- Código de entrenamiento y evaluación: `code/` (rama `HiCoRA-VLA`, dentro del repositorio)
- No se han encontrado papers, blogs, repositorios externos ni demos en la información proporcionada.
