# Donghyun1228/pi05-libero-lape-scale-n1000-yaw30-lam0p05-lr5e-5-10000-20261104

## Resumen

π0.5 LIBERO yaw30 es un checkpoint de adaptación de un modelo de visión-lenguaje-acción (VLA) derivado de π0.5, la arquitectura de política robótica generalista de Physical Intelligence, distribuido a través del ecosistema `openpi`. El modelo parte de un checkpoint fuente entrenado sobre 1.000 frames y aplica un ajuste fino específico sobre 1.000 frames de sondeo con una transformación de aumento de datos con rotación en guiñada de 30 grados (`yaw30`), durante 10.000 actualizaciones con el módulo lingüístico congelado.

El interés técnico reside en que documenta un punto concreto de un estudio de escalado de datos con LAPE (un método de anclaje de adaptación con coeficiente λ=0.05 y ponderación de conflicto), y publica una política de evaluación lista para usar (`policy_source_wrist/`) con un resultado medido sobre el benchmark LIBERO: 1.828 aciertos de 2.000 episodios (91,40%), 500 por suite, con semilla de entorno 7 y MuJoCo 3.2.3. Esto lo convierte en una referencia reproducible para quien investigue adaptación de políticas VLA a distribuciones visuales desplazadas.

El repositorio ocupa 23,7 GB e incluye parámetros, estado completo de entrenamiento y los assets de normalización, además de un `export.json` que describe cómo se conecta la cámara de muñeca a la torre visual del modelo fuente. No es un modelo de propósito general: es un artefacto de investigación robótica con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) derivada de π0.5, según `openpi`; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se publican parámetros en formato nativo, sin variantes GGUF/cuánticas) |
| Idiomas soportados | no disponible (el modelo opera sobre instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | parámetros nativos del trainer `openpi` (`9999/params`, `train_state`, `assets`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un punto de escalado de datos dentro del repositorio `Donghyun1228/vla_adaptation` (código driver `f9dbc2e0`), con el preset `pi05_libero_conflict_anchor_yaw_adapt` ejecutado por el trainer externo; el `run/spec.json` contiene el argv completo. La inicialización proviene de `Donghyun1228/pi05-libero-lape-scale-source-n1000-10000-20261104` en el paso 9999, es decir, la fuente del mismo tamaño de datos.

El entrenamiento consiste en una adaptación *target-only* con pérdida IDM (modelo dinámico inverso) de media, sobre 1.000 frames de sondeo con `yaw30`, durante 10.000 actualizaciones. El índice de pinza (6) se excluye de la pérdida IDM y el LLM permanece congelado. Se usa el optimizador `ConflictAnchorAdamW` con ponderación `conflict`, coeficiente 0.05, LR pico 5e-5 constante tras el calentamiento, y el prior `prior/lape_k10/prior.json`. El resultado se publica en `9999/` con `params`, `train_state` completo y `assets` de normalización.

## Capacidades

- Control robótico por imitación: genera acciones motoras a partir de observaciones visuales e instrucciones de tarea, en el entorno LIBERO.
- Entrada multimodal: combina cámara de muñeca (a través de la torre visual del modelo fuente, según `export.json`) con el resto de observaciones del entorno.
- Ejecución de tareas de manipulación en las cuatro suites de LIBERO (500 episodios por suite en la evaluación reportada).
- Robustez a desplazamiento visual en guiñada: el ajuste se realizó específicamente sobre frames con rotación de 30 grados.
- No se documentan tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües.

## Casos de uso

- Investigación en adaptación de dominio para VLA: sirve como punto de comparación reproducible (misma fuente, mismo tamaño de datos, distinto anclaje LAPE) para medir el efecto del coeficiente λ y de la ponderación `conflict`.
- Reproducción de resultados LIBERO: la política `policy_source_wrist/` permite replicar el 91,40% reportado con semilla 7 y MuJoCo 3.2.3, útil para validar pipelines de evaluación propios.
- Estudio de escalado de datos: al estar emparejado con el checkpoint fuente de 1.000 frames, permite aislar la contribución del ajuste fino frente al tamaño del dataset.
- Análisis de congelación del LLM: el checkpoint documenta explícitamente que el módulo lingüístico no se actualiza, lo que facilita experimentos sobre qué componentes deben adaptarse en robótica.
- Evaluación de robustez visual: el preset `yaw30` sirve para probar políticas ante rotaciones de cámara en guiñada dentro de simuladores MuJoCo.
- Base para ajuste posterior en dominios propios: al incluir `train_state` completo y assets de normalización, se puede reanudar el entrenamiento o adaptar a nuevas tareas partiendo del paso 9999.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| LIBERO (4 suites, 500 episodios por suite) | Tasa de éxito | 1828/2000 = 91,40% |
| Condiciones de evaluación | Semilla de entorno 7, MuJoCo 3.2.3 | — |

No se han publicado en la información disponible resultados desagregados por suite ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 23,7 GB, lo que da una cota inferior aproximada del espacio necesario para cargar pesos y estado en memoria.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del artefacto sugiere que no encaja en GPUs de consumo de gama media sin cuantización, pero no hay datos oficiales.
- Opciones de despliegue: trainer y ecosistema `openpi` (según los tags y la estructura del repo); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw30 (este) | no disponible | no disponible | 91,40% (1828/2000) | Apache 2.0 | Hugging Face, repo de 23,7 GB |
| π0.5 LIBERO fuente (`pi05-libero-lape-scale-source-n1000-10000-20261104`) | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | Hugging Face |
| Otros checkpoints `openpi` / π0.5 | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente conversacional ni un modelo de texto; su salida son acciones motoras en un entorno simulado concreto.
- Especialización estrecha: entrenado y evaluado exclusivamente en LIBERO con el preset `yaw30`; el rendimiento fuera de esa distribución no está medido.
- Sin datos de sesgo ni de alucinación: al no generar lenguaje libre, esas métricas no aplican, pero tampoco se documenta ningún análisis de robustez más allá del benchmark citado.
- Dependencia del entorno: los resultados usan MuJoCo 3.2.3 y semilla 7; cambios de versión o de semilla pueden alterar la tasa de éxito.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia de los checkpoints fuente y del código `openpi`.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente del resultado reportado.
- El índice de pinza (6) se excluye de la pérdida IDM durante el entrenamiento, lo que puede afectar al comportamiento de agarre en tareas distintas de las evaluadas.
- Idiomas soportados no especificados: no se puede asumir cobertura multilingüe de las instrucciones.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n1000-yaw30-lam0p05-lr5e-5-10000-20261104
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n1000-10000-20261104
- Repositorio de código del estudio: `Donghyun1228/vla_adaptation` (driver `f9dbc2e0`), referencia citada en la model card; URL no disponible
- `openpi`: ecosistema citado en los tags; URL no disponible en la información proporcionada
- Paper, blog o demo: no disponibles
