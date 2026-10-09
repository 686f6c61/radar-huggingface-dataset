# dancher00/WasserMan-models

# WasserMan-models: políticas de manipulación submarina

## Resumen
WasserMan-models es un repositorio de Hugging Face publicado por dancher00 (Danil Belov) que acompaña al paper WasserMan (arXiv:2610.04536). No se trata de un modelo único, sino de un conjunto de 69 checkpoints de políticas de robótica para manipulación en entornos submarinos. El repositorio agrupa 54 modelos ACT, Diffusion Policy (DP) y Behavioral Cloning con chunking para la comparativa principal de seis tareas, seis modelos DP adicionales con interfaz de efector final y nueve modelos SmolVLA.

El objetivo del release es reproducir y auditar los resultados del estudio original: cada semilla de entrenamiento (17, 43 y 101) se conserva, incluidas las políticas fallidas y las de éxito cero. El payload de checkpoints ocupa 22,98 GiB antes de ficheros menores de configuración y evidencias, y el repositorio completo pesa 24,7 GB. Los pesos son checkpoints nativos de PyTorch y se ejecutan sobre el simulador público del proyecto, no mediante una interfaz de Transformers.

Estas políticas resuelven tareas concretas de manipulación (pulsar un botón, girar una válvula, abrir una escotilla, recoger una concha, empujar un deslizador y tirar de una palanca) a partir de demostraciones, mediante aprendizaje por imitación. Su relevancia es fundamentalmente investigadora: ofrecen un punto de comparación reproducible entre familias de políticas (ACT, DP, BC y SmolVLA) bajo un perfil de activos fijo y con estadísticas completas de éxito y varianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de políticas de imitación: ACT (Action Chunking Transformer), Diffusion Policy (DP), Behavioral Cloning con chunking y SmolVLA (basado en SmolVLM2-500M) |
| Parametros totales | no disponible para las políticas ACT/DP/BC; cada delta de SmolVLA contiene 99.880.992 elementos de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; las políticas usan ventanas de observación, reloj, historial e interfaz de acción definidas en tiempo de ejecución |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en su precisión original) |
| Idiomas soportados | en (etiqueta declarada en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch nativo (`final.pt`); 22,98 GiB de checkpoints; no usa safetensors ni GGUF |

## Arquitectura y entrenamiento
El release combina cuatro familias de políticas. ACT es un transformer con chunking de acciones; DP genera trayectorias mediante un proceso de difusión, lo que permite representar multimodalidad en las acciones; chunked BC es una línea base de clonación de conducta con predicción por bloques; y SmolVLA es un modelo visión-lenguaje-acción construido sobre el backbone SmolVLM2-500M-Video-Instruct. Los checkpoints de SmolVLA se publican como deltas de parámetros entrenables (99.880.992 elementos cada uno) que deben reconstruirse a partir de la revisión fijada de `lerobot/smolvla_base` (`d9f33c94a60fb382c90dea2164c96845bd955e28`) y del tokenizador/configuración de `HuggingFaceTB/SmolVLM2-500M-Video-Instruct@7b375e1b73b11138ff12fe22c8f2822d8fe03467`.

El entrenamiento es por aprendizaje por imitación (clonación de conducta) sobre el dataset de demostraciones `dancher00/WasserMan`, con tres semillas independientes por configuración. Todos los modelos usan el perfil de activos `open-procedural-v1` y el mismo conjunto de seis tareas del estudio `wm-open-v2-20260929`. No se documenta en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; tampoco se incluye estado de optimizador para reanudar el entrenamiento. El snapshot del runtime público corresponde al commit `1c3b3108d31f46cb7fa2df9c6f5bded496144bda`.

## Capacidades
- Control de manipulación robótica submarina en seis tareas: PressButton, RotateValve, OpenHatch, CollectShell, PushSlider y PullLever.
- Generación de acciones a partir de observaciones visuales y de estado del robot, según la interfaz propia de cada política (imagen, reloj, historial y acciones).
- ACT: predicción de secuencias de acciones mediante transformer con chunking.
- DP (Diffusion Policy): modelado generativo de trayectorias de acción multimodales por difusión.
- Chunked BC: clonación de conducta como línea base de comparación.
- SmolVLA: condicionamiento visión-lenguaje sobre el backbone SmolVLM2-500M para producir acciones.
- Evaluación reproducible en el simulador publicado del proyecto mediante `tools/run_policy.py`.
- No es un modelo generativo de texto: no soporta tool calling, function calling, agentes ni razonamiento multi-paso en lenguaje natural.
- No presenta capacidades multilingües; la única etiqueta de idioma declarada es `en`.

## Casos de uso
- Reproducción de resultados del paper: cargar cada checkpoint y ejecutar `run_policy.py --purpose test` con los 30 resets ordenados para verificar las tasas de éxito publicadas de ACT, DP y BC.
- Benchmarking de políticas de imitación: comparar sistemáticamente ACT, DP y BC bajo un mismo perfil de activos y un mismo conjunto de tareas, aprovechando que se incluyen las tres semillas.
- Evaluación de modelos visión-lenguaje-acción: usar los nueve checkpoints SmolVLA para medir el comportamiento de un VLA frente a políticas puramente motoras en las mismas tareas.
- Investigación en aprendizaje por imitación: analizar la varianza entre semillas y el efecto de políticas fallidas, ya que el release conserva los entrenamientos con éxito cero.
- Estudio de robustez y fallos: las políticas fallidas y de bajo rendimiento permiten analizar modos de fallo (por ejemplo, CollectShell con ACT y BC a 0,0 % de éxito) sin tener que reentrenar.
- Base para fine-tuning: partir de un checkpoint por tarea (por ejemplo, OpenHatch-DP, con 100,0 % de éxito) y adaptarlo a nuevas variantes de la tarea mediante demostraciones adicionales.
- Desarrollo de pipelines de robótica submarina simulada: integrar las políticas en el runtime del proyecto para probar lógicas de control antes de un posible traslado a hardware real.
- Auditoría de artefactos de investigación: inspeccionar de forma segura las configuraciones y estadísticas de normalización embebidas en `final.pt` con `torch.load(..., weights_only=True)` para validar la reproducibilidad.

## Benchmarks y rendimiento
La model card publica el porcentaje de éxito (media ± desviación estándar muestral) de tres entrenamientos independientes, cada uno evaluado sobre 30 resets en la estación de trabajo principal. Son puntuaciones originales y pueden variar con diferencias de simulador, renderizador o numéricas en ejecuciones nuevas.

| Tarea | ACT | DP | Chunked BC |
|---|---:|---:|---:|
| PressButton | 45,6 ± 5,1 | 60,0 ± 12,0 | 40,0 ± 5,8 |
| RotateValve | 84,4 ± 24,1 | 84,4 ± 6,9 | 74,4 ± 5,1 |
| OpenHatch | 81,1 ± 16,8 | 100,0 ± 0,0 | 16,7 ± 17,6 |
| CollectShell | 0,0 ± 0,0 | 33,3 ± 12,0 | 0,0 ± 0,0 |
| PushSlider | 10,0 ± 12,0 | 42,2 ± 10,2 | 2,2 ± 1,9 |
| PullLever | no disponible (fila truncada en la información proporcionada; la fuente original comienza con "40," para ACT) | no disponible | no disponible |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no aplican a este tipo de modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. La información solo indica que las evaluaciones primarias se realizaron en una "estación de trabajo principal" sin especificar hardware.
- Compatibilidad con GPU de consumo: no disponible. El repositorio completo pesa 24,7 GB y el payload de checkpoints 22,98 GiB, por lo que conviene descargar modelos individuales con `tools/download_model.py` en lugar del repositorio completo.
- Opciones de despliegue: exclusivamente el runtime público de WasserMan (commit `1c3b3108d31f46cb7fa2df9c6f5bded496144bda`) con PyTorch. Los checkpoints son nativos de PyTorch y no deben cargarse con `AutoModel` de Transformers; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dependencias adicionales: los modelos SmolVLA requieren descargar `lerobot/smolvla_base` y `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` en revisiones fijadas para reconstruir los deltas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Criterio | WasserMan ACT | WasserMan DP | WasserMan Chunked BC | WasserMan SmolVLA |
|---|---|---|---|---|
| Familia | Transformer con chunking de acciones | Política de difusión | Clonación de conducta con chunking | Modelo visión-lenguaje-acción (SmolVLM2-500M) |
| Mejor tarea registrada | RotateValve (84,4 ± 24,1) | OpenHatch (100,0 ± 0,0) | RotateValve (74,4 ± 5,1) | no disponible en la información proporcionada |
| Tareas con éxito cero | CollectShell (0,0 ± 0,0) | ninguna en la tabla publicada | CollectShell (0,0 ± 0,0) | no disponible |
| Numero de checkpoints | incluidos en los 54 ACT/DP/BC | incluidos en los 54 ACT/DP/BC | incluidos en los 54 ACT/DP/BC | 9 deltas de 99.880.992 elementos |
| Formato de pesos | PyTorch nativo | PyTorch nativo | PyTorch nativo | Deltas sobre `lerobot/smolvla_base` |
| Licencia | apache-2.0 | apache-2.0 | apache-2.0 | apache-2.0 (verificar la licencia de los pesos base) |

No se dispone de información sobre modelos externos comparables dentro del mismo benchmark, por lo que la comparativa se limita a las variantes internas del propio release.

## Limitaciones y advertencias
- El repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Los resultados dependen del simulador, el renderizador y las condiciones numéricas; la propia model card advierte de que ejecuciones nuevas pueden diferir de las puntuaciones publicadas.
- El release no incluye los archivos completos de rollouts en bucle cerrado, solo resúmenes de resultados y CSVs por episodio de SmolVLA.
- Se conservan intencionadamente políticas fallidas y de éxito cero, de modo que un checkpoint concreto no implica un rendimiento útil por defecto.
- Los nueve ficheros de SmolVLA son deltas de parámetros entrenables, no modelos completos; requieren reconstrucción con dependencias fijadas y comprobaciones de hash. Presentan además campos heredados de la plantilla de ACT, según aclara el fichero de procedencia.
- Un fichero de pesos por sí solo no define el contrato correcto de observación/acción: es obligatorio preservar la transformación de imagen, el reloj, el historial y la interfaz de acción específicos de la tarea.
- Los checkpoints no incluyen estado de optimizador, por lo que no permiten reanudar el entrenamiento tal cual.
- Los seis modelos DP con interfaz de efector final pertenecen a un estudio de interfaz distinto y deben evaluarse con `--purpose research` y resets emparejados, no como modelos primarios adicionales.
- Aunque la licencia del repositorio es apache-2.0, los modelos SmolVLA dependen de pesos base de terceros (`lerobot/smolvla_base` y `SmolVLM2-500M-Video-Instruct`) cuyas condiciones conviene revisar antes de un uso comercial.
- El único idioma declarado es el inglés y el modelo no es un sistema de lenguaje general: no debe emplearse para generación de texto, tool calling ni tareas de agentes.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada para este tipo de política robótica.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dancher00/WasserMan-models
- Sitio web del proyecto: https://dancher00.github.io/wasserman/
- Código fuente: https://github.com/dancher00/wasserman
- Paper (arXiv:2610.04536): https://arxiv.org/abs/2610.04536
- Dataset de demostraciones: https://huggingface.co/datasets/dancher00/WasserMan
- Documentación de instalación del runtime: https://dancher00.github.io/wasserman/docs/installation/
- Perfil de Hugging Face del autor: https://huggingface.co/dancher00
