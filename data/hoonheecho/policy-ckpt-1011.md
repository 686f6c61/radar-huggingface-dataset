# HoonheeCho/policy-ckpt-1011

## Resumen

`HoonheeCho/policy-ckpt-1011` es un repositorio de checkpoints de políticas robóticas (vision-language-action, VLA) construido sobre el modelo base `lerobot/smolvla_base` (SmolVLA). No se trata de un modelo de lenguaje conversacional al uso, sino de un conjunto de pesos entrenados para control robótico a partir de observaciones visuales e instrucciones en lenguaje natural, empaquetados en formato compatible con la librería LeRobot 0.3.3.

El repositorio agrupa cinco variantes organizadas por carpeta: `vla_1f` (fine-tune con una sola imagen de observación), `vla_3f` (tres imágenes de observación con una convolución de fusión temporal y clase de política personalizada `smolvla_mf`), `residual_s1` (política residual basada en eventos sobre `vla_3f/final`), `vla_3f_t123` (misma arquitectura que `vla_3f` pero entrenada conjuntamente en tres tareas con nueve instrucciones) y `vla_3f_t3` (entrenada solo en la tercera tarea con tres instrucciones). Cada variante principal incluye un checkpoint `final` (20.000 pasos) y checkpoints intermedios por época (`epNNNN`).

Su relevancia es acotada pero específica: sirve como material reproducible para investigación en políticas VLA de manipulación, especialmente para estudiar el efecto del número de frames de observación, la fusión temporal, el entrenamiento multi-tarea y la composición de políticas residuales. El tamaño del repositorio (175,5 GB) refleja la acumulación de múltiples checkpoints y épocas intermedias, no un único modelo de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) con variantes: `vla_1f`, `vla_3f` (clase `smolvla_mf` con convolución de fusión temporal), `residual_s1` (política residual basada en eventos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del número de frames de observación: 1 en `vla_1f`, 3 en `vla_3f`, `vla_3f_t123` y `vla_3f_t3`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se expresan en lenguaje natural; el model card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` + `config.json` (formato SmolVLA de LeRobot 0.3.3) para `vla_1f`, `vla_3f`, `vla_3f_t123`, `vla_3f_t3`; `model.pt` (state dict) + `args.json` (estadísticas de normalización) + `model_step*.pt` para `residual_s1` |

## Arquitectura y entrenamiento

La base es SmolVLA, una política vision-language-action de la familia LeRobot que combina un codificador visual y un modelo de lenguaje para producir acciones motoras condicionadas por instrucciones. Sobre esa base, el autor aplica varios fine-tunes: `vla_1f` usa una única imagen de observación; `vla_3f` usa tres imágenes con una convolución de fusión temporal implementada en una clase de política personalizada (`smolvla_mf`); `vla_3f_t123` reutiliza esa arquitectura pero se entrena conjuntamente en tres tareas con nueve instrucciones; y `vla_3f_t3` se entrena solo en la tercera tarea con tres instrucciones. Los checkpoints `final` corresponden a 20.000 pasos en todos los casos, con distinto número de épocas según la variante (81 en `vla_1f`, 34 en `vla_3f_t123`, 98 en `vla_3f_t3`).

La variante `residual_s1` es una política residual basada en eventos que se compone sobre `vla_3f/final`. Se distribuye como state dict de PyTorch (`model.pt`) acompañado de `args.json` con las estadísticas de normalización y checkpoints por paso (`model_step*.pt`). El model card no detalla el volumen de datos de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación; tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico condicionado por instrucciones en lenguaje natural a partir de observaciones visuales (una o tres imágenes según la variante).
- Fusión temporal de observaciones mediante convolución dedicada en las variantes `vla_3f`, `vla_3f_t123` y `vla_3f_t3`.
- Entrenamiento multi-tarea: `vla_3f_t123` cubre tres tareas con nueve instrucciones; `vla_3f_t3` cubre una tarea con tres instrucciones.
- Composición de políticas: `residual_s1` actúa como política residual basada en eventos sobre `vla_3f/final`.
- Checkpoints intermedios por época (`epNNNN`) para análisis de curvas de entrenamiento y selección de checkpoints.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, multilingüismo explícito, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en políticas VLA: usar `vla_1f` frente a `vla_3f` para medir el impacto del número de frames de observación en el éxito de la tarea, manteniendo el mismo presupuesto de 20.000 pasos.
- Estudio de fusión temporal: la clase `smolvla_mf` de `vla_3f` permite evaluar si una convolución de fusión temporal mejora la estabilidad de la política frente a la observación única de `vla_1f`.
- Aprendizaje multi-tarea: `vla_3f_t123` sirve para analizar transferencia entre tres tareas y nueve instrucciones, comparándolo con el entrenamiento mono-tarea de `vla_3f_t3`.
- Composición de políticas residuales: `residual_s1` sobre `vla_3f/final` permite estudiar cómo una política residual basada en eventos corrige o complementa la política base.
- Selección de checkpoints: los checkpoints `epNNNN` intermedios permiten trazar curvas de rendimiento por época y elegir el punto óptimo antes del sobreajuste.
- Reproducción de experimentos en LeRobot: al estar en formato LeRobot 0.3.3, los pesos se pueden cargar directamente en pipelines de evaluación de políticas con el código de `model_exchange/dualsys/`.
- Docencia y prototipado en robótica de manipulación: el tamaño del repositorio y la licencia Apache 2.0 facilitan su uso en entornos académicos para ilustrar el ciclo completo de fine-tune de una política VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El model card no indica el número de parámetros de SmolVLA ni de las variantes, por lo que no se puede calcular una estimación fiable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante LeRobot 0.3.3 (formato `model.safetensors` + `config.json`); la variante `residual_s1` requiere cargar un state dict de PyTorch (`model.pt`) y aplicar las estadísticas de normalización de `args.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 175,5 GB, por lo que conviene descargar solo las carpetas necesarias.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HoonheeCho/policy-ckpt-1011` | SmolVLA fine-tune (VLA) | no disponible | 1 o 3 frames de observación | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | SmolVLA base (VLA) | no disponible | no disponible | no disponible en la información | Hugging Face (modelo base citado) |
| Otras políticas VLA (p. ej. OpenVLA, RT-2) | VLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El model card no documenta sesgos conocidos; al ser una política entrenada sobre un dataset de robótica no especificado, puede heredar sesgos de las demostraciones utilizadas.
- Riesgo de alucinación no evaluado: en políticas VLA el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado, y no hay métricas publicadas de robustez.
- No se especifican los idiomas soportados para las instrucciones en lenguaje natural.
- La ventana de observación es muy corta (1 o 3 frames), lo que limita la planificación a largo plazo y la reacción ante eventos no vistos.
- El repositorio acumula checkpoints intermedios y pesa 175,5 GB; conviene descargar solo las carpetas necesarias para evitar consumo innecesario de almacenamiento.
- La variante `residual_s1` depende de `vla_3f/final` y de las estadísticas de normalización de `args.json`; usarla de forma aislada produce resultados incorrectos.
- Aunque la licencia es Apache 2.0, el uso comercial en robótica real requiere validación de seguridad independiente; el model card no incluye garantías ni evaluaciones de seguridad.
- No hay resultados de benchmarks publicados, por lo que no se puede afirmar su rendimiento relativo frente a otras políticas VLA.
- El pipeline no está declarado en Hugging Face y el número de descargas y likes es cero, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HoonheeCho/policy-ckpt-1011
- Modelo base citado: https://huggingface.co/lerobot/smolvla_base
- Código de uso (referenciado en el model card): `model_exchange/dualsys/` (no se proporciona URL)
- LeRobot (librería, formato 0.3.3): no se proporciona URL en la información disponible
