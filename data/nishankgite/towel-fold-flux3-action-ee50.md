# nishankgite/towel-fold-flux3-action-ee50

## Resumen

towel-fold-flux3-action-ee50 es un modelo de robótica (world-action model) desarrollado por el usuario nishankgite, consistente en un ajuste fino del modelo base black-forest-labs/flux-3-action-base. Resuelve la predicción de acciones motoras bimanuales para la tarea concreta de doblar una toalla, a partir de observaciones visuales y un prompt textual. Es relevante ahora porque demuestra la adaptación de un modelo generativo de gran escala (6.947.575.040 parámetros) a control robótico de precisión con un conjunto de datos pequeño y bien documentado.

El modelo se ha post-entrenado sobre el split de entrenamiento del dataset nishankgite/umi-towel-folding-annotated, que contiene 285 episodios y aproximadamente 102.700 fotogramas a 15 Hz con el prompt "Fold the towel.". Los pesos exportados corresponden al paso final (6.000) con EMA sigma_rel 0,10, en bf16. Sustituye a una versión anterior entrenada sobre datos más antiguos (towel_fold_v1, 175 episodios).

La arquitectura subyacente es un modelo de acción sobre FLUX 3 Action, con cabeceras action_prediction_ee50 preentrenadas y un esquema de acciones EE-50 (espacio de efector final) para dos manos. La licencia es la FLUX Kommunity License v1.0, restringida a uso no comercial y no productivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de acción sobre FLUX 3 Action (world-action model), cabeceras action_prediction_ee50 |
| Parámetros totales | 6.947.575.040 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License v1.0 (other), uso no comercial y no productivo |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de black-forest-labs/flux-3-action-base, un world-action model basado en FLUX, y se post-entrena con la receta documentada EE-50 sobre el split de entrenamiento de nishankgite/umi-towel-folding-annotated. Se utilizan las cabeceras action_prediction_ee50 preentrenadas. El esquema de acciones es EE-50: la mano izquierda ocupa las dimensiones 0-9 y la derecha las 25-34; cada fila contiene traslación, las dos primeras filas de R_rel y la fracción de apertura del gripper (anchura / 0,086) relativa al marco de referencia. Se predicen 32 pasos a 15 Hz.

El entrenamiento emplea AdamW fusionado (0,9, 0,99), weight decay 0,05 y LR máximo 2e-4 sobre todos los parámetros, con peso de pérdida de acción 1020/11 y caption dropout 0,1, además de Power EMA con sigma_rel 0,10 y 0,05. Respecto a la receta original se introducen varias desviaciones documentadas en REPORT.md: el schedule se escala de 30.000 actualizaciones × 2.048 ventanas a 6.000 actualizaciones × 128 ventanas (warm-up 500, cooldown 5.000-6.000, unas 7,5 épocas); dos cámaras de muñeca se colocan lado a lado en un lienzo de 256×512, cada una con letterbox a 256×256; 64 visitas por episodio y época; las estadísticas EE-50 provienen del split de entrenamiento propio (ee50_stats.json); y rtc_max_prefix es 0. Los pesos corresponden a la exportación ema_0p10 del paso final 6.000.

## Capacidades

- Predicción de acciones motoras bimanuales en el espacio de efector final (EE-50) para la tarea de doblar una toalla.
- Generación de trayectorias de 32 pasos a 15 Hz condicionadas por observaciones visuales (incluidas dos cámaras de muñeca) y un prompt textual.
- Predicción conjunta de traslación, rotación relativa y apertura del gripper para ambas manos.
- Modelo de acción sobre una base generativa FLUX 3 Action (world-action model).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni multilingüismo.
- No se documenta un modo de razonamiento (thinking mode) explícito.

## Casos de uso

- Doblado automático de toallas en entornos de laboratorio: el modelo genera las trayectorias bimanuales a 15 Hz necesarias para manipular y doblar una toalla, usando las cámaras de muñeca como entrada visual.
- Investigación en manipulación bimanual con UMI: sirve como referencia reproducible para comparar recetas de post-entrenamiento sobre FLUX 3 Action con el dataset umi-towel-folding-annotated.
- Evaluación de políticas de acción en lazo abierto: los scripts de evaluación incluidos permiten medir el error de posición, rotación y gripper a distintos horizontes (k=1 a k=16) sobre los 18 episodios de validación.
- Prototipado de pipelines de robótica con datasets anotados: el plug de dataset (towel_flux) y los scripts de exportación facilitan reproducir el entrenamiento con nuevos datos.
- Benchmark interno de modelos de acción: al compartir datos con pi0.5, permite comparar arquitecturas sobre el mismo conjunto de validación (1.625 fotogramas).
- Docencia y demostraciones de world-action models: la documentación detallada de la receta y las desviaciones facilita explicar el proceso de post-entrenamiento de un modelo generativo para control.

## Benchmarks y rendimiento

Errores medios de posición en mm (mano izquierda / derecha) a k pasos por delante (15 Hz), sobre los 18 episodios de validación (1.625 fotogramas):

| Modelo | k=1 | k=4 | k=8 | k=16 | rot @16 (grados) | grip @16 (mm) |
|---|---|---|---|---|---|---|
| Este modelo (paso 6.000, ema_0p10) | 7,5 / 7,0 | 25,6 / 26,7 | 43,9 / 43,7 | 66,0 / 66,9 | 12,6 / 11,1 | 9,4 / 7,6 |
| pi0.5 #1, mismos datos | 5,1 / 5,0 | 20,4 / 19,4 | 37,1 / 35,3 | 59,0 / 56,2 | 10,4 / 9,6 | 7,3 / 5,1 |
| Hold still (referencia estática) | 15,5 / 14,5 | 57,3 / 53,9 | 98,6 / 92,4 | 147,8 / 136,5 | 20,8 / 17,7 | 20,2 / 12,7 |

Estos valores son errores de chunk en lazo abierto, no tasas de éxito de la tarea. La latencia es de 244 ms p50 por llamada en una B200, usando el preset DROID_INFERENCE_SETTINGS (UniPC, 4 pasos, shift 5, video guidance 4). El checkpoint no se seleccionó sobre el conjunto de validación. Todas las cifras están en validation_metrics.json.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6.947.575.040 parámetros en bf16, los pesos ocupan aproximadamente 13,9 GB, por lo que se requiere margen adicional para activaciones y estado de inferencia.
- GPU recomendadas: el autor reporta latencia de 244 ms p50 en una NVIDIA B200; no se documentan otras GPU probadas.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de pesos en bf16 (unos 13,9 GB) sugiere que podría requerir GPUs con 24 GB o más, pero no se aportan datos de prueba en consumer.
- Opciones de despliegue: carga mediante FluxActionPolicy.from_pretrained; el repositorio incluye scripts de evaluación y exportación en code/. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 244 ms p50 por llamada en B200 con el preset DROID_INFERENCE_SETTINGS; no se documenta throughput adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (k=16, mm, izq/der) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| towel-fold-flux3-action-ee50 | 6.947.575.040 | no disponible | 66,0 / 66,9 | FLUX Kommunity License v1.0 (no comercial) | Hugging Face |
| pi0.5 #1 (mismos datos) | no disponible | no disponible | 59,0 / 56,2 | no disponible | no disponible en la información |
| Hold still (referencia) | no aplica | no aplica | 147,8 / 136,5 | no aplica | no aplica |

Solo se dispone de datos comparativos frente a pi0.5 sobre el mismo conjunto de validación; no se aportan parámetros, contexto ni licencia de pi0.5 en la información proporcionada.

## Limitaciones y advertencias

- Licencia FLUX Kommunity License v1.0: uso exclusivamente no comercial y no productivo; es una obra derivada y no un producto oficial de Black Forest Labs.
- El modelo está especializado en una única tarea (doblar toallas) y un único esquema de acciones (EE-50); no se documenta generalización a otras tareas.
- Los benchmarks reportados son errores de chunk en lazo abierto, no tasas de éxito de la tarea; el rendimiento real en ejecución puede diferir.
- El checkpoint no se seleccionó sobre el conjunto de validación, lo que puede implicar que las métricas reportadas no correspondan a un óptimo de validación.
- El entrenamiento usó un schedule reducido (6.000 actualizaciones frente a 30.000 de la receta original), lo que puede limitar la convergencia.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje general.
- No se documentan requisitos de hardware fuera de la B200 ni opciones de cuantización para despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nishankgite/towel-fold-flux3-action-ee50
- Dataset: https://huggingface.co/datasets/nishankgite/umi-towel-folding-annotated
- Dataset relacionado (mismos datos): nishankgite/pi05-umi-towel-folding
- Modelo base: black-forest-labs/flux-3-action-base
- Licencia: LICENSE.md (incluido en el repositorio)
- Informe de desviaciones: REPORT.md (incluido en el repositorio)
- Métricas de validación: validation_metrics.json (incluido en el repositorio)
- Configuración de entrenamiento: train_config.json (incluido en el repositorio)
- Estadísticas EE-50: ee50_stats.json (incluido en el repositorio)
