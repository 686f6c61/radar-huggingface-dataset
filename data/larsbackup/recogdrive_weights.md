# larsbackup/recogdrive_weights

## Resumen

`recogdrive_weights` es un repositorio de pesos publicado por el usuario `larsbackup` que recoge los artefactos del proyecto ReCogDrive, una reproducción sobre NAVSIM de un sistema de conducción autónoma que combina un modelo de visión-lenguaje (VLM) con un planificador basado en difusión. No se trata de un modelo único entrenado desde cero, sino de una colección de checkpoints intermedios y finales que incluye el VLM InternVL3-2B preentrenado sobre 752.000 pares de pregunta-respuesta del dataset ScenePilot, una variante continuada denominada ReCogDrive-VLM-2B, fusiones lineales de ambos y varios planificadores de difusión entrenados por imitación y con GRPO sobre datos de NAVSIM/OpenScene (nuPlan).

El interés del repositorio es fundamentalmente de reproducibilidad: los ficheros conservan las rutas relativas del directorio del proyecto original, de modo que descargar el repositorio en la raíz del proyecto restaura la estructura esperada por los scripts de entrenamiento y evaluación. El tamaño total del repo es de 87,8 GB, dominado por los estados de entrenamiento y los múltiples checkpoints de cada fase.

La información pública es muy escasa: no hay pipeline declarado, no se especifican idiomas soportados y la licencia figura como `other`, remitiendo a las licencias de los modelos base (InternVL3-2B y ReCogDrive-VLM-2B) y de los datasets empleados (ScenePilot QA, NAVSIM/OpenScene). Cualquier uso en producción exige verificar esas licencias de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo InternVL3 (transformer visión-lenguaje) + planificador de difusión |
| Parametros totales | 2B en el componente VLM (InternVL3-2B / ReCogDrive-VLM-2B); planificador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a las licencias de InternVL3-2B, ReCogDrive-VLM-2B, ScenePilot y NAVSIM/OpenScene) |
| Formato de pesos | safetensors y checkpoints `.ckpt` (PyTorch Lightning) |

## Arquitectura y entrenamiento

El sistema se compone de dos bloques. El primero es un VLM derivado de InternVL3-2B, preentrenado sobre 752.000 ejemplos de QA del dataset ScenePilot (`internvl3_2b_scenepilot_selected_752k_pretrain`, con checkpoints en los pasos 1000, 2000 y 2937) y posteriormente sometido a un preentrenamiento continuado como ReCogDrive-VLM-2B sobre los mismos datos (checkpoints en los pasos 250, 500, 750, 1000, 1250 y 1468). El repositorio incluye también los modelos base `InternVL3-2B-HF`, una variante con LLM inicializado aleatoriamente (`InternVL3-2B-Random`) y `ReCogDrive-VLM-2B-HF`, además de dos checkpoints VLM externos (`dirty_pretrain_final` y `synthetic_pretrain`, semilla 20260813) de los que dependen las ejecuciones del planificador.

El segundo bloque es un planificador de difusión entrenado sobre NAVSIM/OpenScene (nuPlan), con ejecuciones de imitación (IL) y de GRPO, guardadas como checkpoints `.ckpt` con `best.ckpt`, `last.ckpt` y checkpoints por época. Se incluye además el checkpoint oficial del planificador de difusión de ReCogDrive en `official_weights/` y fusiones lineales del VLM preentrenado (checkpoint 2937) con ReCogDrive-VLM-2B para alpha 0,5, 0,6 y 0,8 en `merge/merged_yours{05,06,08}_*/`. Los estados de optimizador de DeepSpeed se distribuyen por separado en `larsbackup/recogdrive_train_states`, y el código, scripts, logs y guía de reproducción están en el dataset privado `larsbackup/recogdrive`.

## Capacidades

- Procesamiento conjunto de imagen y texto mediante el VLM InternVL3-2B, orientado a la interpretación de escenas de conducción.
- Respuesta a preguntas de razonamiento sobre escenas (QA) gracias al preentrenamiento sobre 752.000 ejemplos de ScenePilot.
- Planificación de trayectorias mediante el planificador de difusión entrenado sobre NAVSIM/OpenScene.
- Entrenamiento por imitación y ajuste con GRPO documentados en los checkpoints incluidos.
- Fusiones de pesos lineales entre el VLM preentrenado y ReCogDrive-VLM-2B para explorar compromisos entre ambos.
- No hay información publicada sobre tool calling, soporte de agentes, capacidades multilingües, visión adicional, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos de ReCogDrive: descargar el repo en la raíz del proyecto restaura las rutas relativas y permite relanzar los scripts de entrenamiento y evaluación con los mismos checkpoints publicados.
- Investigación en planificación de conducción autónoma: los checkpoints de imitación y GRPO sobre NAVSIM/OpenScene permiten comparar ambas estrategias de entrenamiento del planificador de difusión con un VLM de 2B como codificador de escena.
- Estudio de preentrenamiento continuado de VLMs: la pareja `internvl3_2b_scenepilot_selected_752k_pretrain` y `recogdrive_vlm_2b_scenepilot_selected_752k_continue_pretrain` permite analizar el efecto de un segundo preentrenamiento sobre el mismo corpus de QA de conducción.
- Análisis de fusiones de pesos: los merges con alpha 0,5, 0,6 y 0,8 sirven para evaluar cómo varía el comportamiento del VLM al interpolar entre el modelo preentrenado y el continuado.
- Evaluación de robustez con inicialización aleatoria: la variante `InternVL3-2B-Random` actúa como control experimental para aislar la contribución del conocimiento preentrenado del LLM.
- Reproducción de líneas base oficiales: el checkpoint de `official_weights/` permite contrastar la reproducción propia con el planificador de difusión de referencia de ReCogDrive.
- Docencia y experimentación académica: el desglose por fases y checkpoints intermedios facilita estudiar la dinámica de entrenamiento sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El componente VLM es de 2B parámetros, por lo que la inferencia en precisión completa (FP16/BF16) requiere del orden de 4-6 GB de VRAM solo para los pesos, más memoria para activaciones y el codificador visual.
- El planificador de difusión añade requisitos propios no cuantificados en la información disponible.
- El repositorio completo ocupa 87,8 GB en disco, por lo que se recomienda almacenamiento amplio antes de la descarga.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un VLM de 2B es viable en GPUs de consumo con suficiente VRAM, pero no hay datos publicados que lo confirmen para este proyecto.
- Opciones de despliegue: no disponible; los checkpoints son de PyTorch Lightning/DeepSpeed y el VLM sigue el formato InternVL, por lo que en principio requeriría el código del proyecto para cargarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recogdrive_weights (este repo) | 2B (VLM) + planificador | no disponible | VLM + difusión para conducción | other | Hugging Face, 87,8 GB |
| InternVL3-2B (OpenGVLab) | 2B | no disponible en esta ficha | VLM generalista | según modelo base | Hugging Face |
| ReCogDrive-VLM-2B | 2B | no disponible en esta ficha | VLM especializado en conducción | según release original | Hugging Face |
| Otros VLM de 2B para conducción | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es `other` y remite expresamente a las licencias de InternVL3-2B, ReCogDrive-VLM-2B, ScenePilot y NAVSIM/OpenScene; es obligatorio revisarlas antes de cualquier uso comercial.
- No se declaran idiomas soportados; el corpus de entrenamiento (QA de escenas de conducción) probablemente condiciona el dominio y el idioma de forma significativa.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- Los pesos están pensados para reproducir un proyecto de investigación; no hay pipeline declarado ni garantías de que carguen sin el código del proyecto.
- El repositorio mezcla checkpoints intermedios, estados de entrenamiento y modelos base, lo que incrementa el riesgo de cargar por error un artefacto no final.
- Los estados de optimizador están en un repositorio separado (`larsbackup/recogdrive_train_states`), y el código y la guía de reproducción están en un dataset privado, lo que puede impedir la reproducción completa a terceros.
- El tamaño de 87,8 GB y la estructura de rutas relativas exigen planificar el espacio en disco y la ubicación de la descarga.

## Enlaces

- Repositorio de pesos: https://huggingface.co/larsbackup/recogdrive_weights
- Estados de entrenamiento: https://huggingface.co/larsbackup/recogdrive_train_states
- Dataset del proyecto (privado): https://huggingface.co/datasets/larsbackup/recogdrive
- Modelo base InternVL3-2B: https://huggingface.co/OpenGVLab/InternVL3-2B
- Manifiesto de ficheros: `MANIFEST_weights.tsv` dentro del repositorio de pesos
