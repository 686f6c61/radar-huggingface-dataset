# Nieuwlaar/resnet50_7.9um_scroll1_frags-repaired

## Resumen

Este modelo es una versión reparada del checkpoint `scrollprize/resnet50_7.9um_scroll1_frags`, publicada por Erwin Nieuwlaar en el contexto del Vesuvius Challenge. El checkpoint original contenía un backbone 3D ResNet-50 correctamente entrenado, pero un decoder de segmentación cuyos pesos nunca se entrenaron: permanecían en la inicialización por defecto de PyTorch, por lo que el modelo completo producía salidas constantes de ~0.5 y no detectaba tinta alguna en los escaneos de los papiros de Herculano. Este repositorio conserva el backbone original, reentrena el decoder con las etiquetas públicas de tinta del Grand Prize y aplica un ligero ajuste fino.

El resultado es un modelo que pasa de nivel de azar a una detección de tinta sólida: la ROC-AUC sobre un segmento de validación nunca usado en entrenamiento sube de 0.5022 a 0.9369. Es un reemplazo directo del archivo `model.safetensors` original, con licencia MIT y pesos en formato safetensors (85,7 millones de parámetros). Su relevancia radica en que corrige un defecto silencioso en un checkpoint público del reto: un usuario que ejecutara el pipeline original obtendría resultados aleatorios sin ninguna advertencia visible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D ResNet-50 con decoder de segmentacion |
| Parametros totales | 85.708.340 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa un backbone 3D ResNet-50 entrenado sobre fragmentos de CT del Scroll 1 a resolucion de 7.9 micras por voxel. El checkpoint original (revision `f3975de34d4734dd507360304f828808b7182139`) presentaba un backbone entrenado —los contadores de BatchNorm acumulaban 2.234.791 batches— pero un decoder de segmentacion en estado de inicializacion por defecto: los contadores de BatchNorm de las tres capas del decoder estaban en 0 y las distribuciones de pesos coincidian con la inicializacion uniforme de PyTorch con una precision de 3-4 cifras significativas. El autor verifico el defecto con tres observaciones independientes: estadisticas de pesos, contadores de BatchNorm y una prueba funcional de ROC-AUC.

La reparacion consistio en mantener el backbone congelado, reentrenar el decoder sobre las etiquetas publicas de tinta del Grand Prize y aplicar un ligero fine-tuning adicional. El segmento `20231210121321` se uso para seleccionar la mejor epoca y el segmento `20230827161847` se reservo como validacion totalmente independiente. El resultado es un checkpoint que funciona como reemplazo directo del original sin cambios en el pipeline de inferencia.

## Capacidades

- Segmentacion de tinta en tomografias computarizadas de papiros de Herculano (Scroll 1).
- Deteccion de tinta a resolucion de 7.9 micras por voxel con volumen de entrada en 3D.
- Inferencia por teselas (tiles) sobre segmentos completos, usando los mismos ajustes que la model card del modelo base.
- Reemplazo directo del checkpoint original: no requiere cambios de codigo en el pipeline de image-segmentation.
- Incluye un script de verificacion (`verify_checkpoint.py`) que detecta decoders sin entrenar en otros checkpoints del corpus scrollprize.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes.

## Casos de uso

- **Investigacion en el Vesuvius Challenge**: el modelo detecta tinta en los escaneos de CT de los papiros de Herculano, permitiendo a los investigadores leer textos griegos antiguos sin abrir los rollos. Es adecuado porque su ROC-AUC de 0.9369 en validacion supera ampliamente el nivel de azar del checkpoint original.
- **Reproduccion de pipelines de deteccion de tinta**: al ser un drop-in del modelo base, permite reproducir los resultados del pipeline de image-segmentation original sin el defecto de salida constante ~0.5.
- **Auditoria de integridad de checkpoints**: el script `verify_checkpoint.py` permite comprobar si un checkpoint tiene el decoder sin entrenar; el autor lo ha usado para auditar 41 repos del corpus publico y ha detectado que `resnet50_3um_01122024` esta roto de la misma forma.
- **Benchmark de segmentacion de tinta**: puede usarse como referencia para comparar nuevos modelos de deteccion de tinta en el mismo conjunto de datos del Grand Prize.
- **Validacion en CPU**: el autor demuestra que la verificacion del defecto se puede hacer en CPU con solo `numpy` y `safetensors` (1.2 segundos en su ejecucion), sin datos de scroll ni GPU.
- **Integracion en pipelines de analisis de imagen medica**: aunque orientado al Vesuvius Challenge, el modelo es util como ejemplo de reparacion de checkpoints con decoders no entrenados en otros dominios de segmentacion 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta la siguiente evaluacion en segmentos de Scroll 1:

| Segmento de validacion | Checkpoint original | Checkpoint reparado |
|---|---|---|
| `20230827161847` (nunca usado en entrenamiento ni seleccion) | 0.5022 | **0.9369** |
| `20231210121321` (usado solo para elegir la mejor epoca) | 0.5122 | **0.9431** |

Metrica: ROC-AUC contra las etiquetas de tinta del Grand Prize, con inferencia por teselas sobre el segmento completo y los ajustes de la model card del modelo base. 0.5 corresponde a azar y 1.0 a rendimiento perfecto. No se han publicado resultados de MMLU, HumanEval u otros benchmarks genericos porque el modelo no es un LLM.

## Requisitos de hardware

- Los pesos del modelo ocupan 0.4 GB (85,7 M de parametros en fp32), por lo que la inferencia basica es viable en CPU.
- La verificacion del defecto se puede ejecutar en CPU con `numpy` y `safetensors`, sin GPU (el autor reporta 1.2 segundos en su run).
- Para inferencia completa por teselas sobre un segmento completo de CT, se recomienda una GPU con al menos 8-12 GB de VRAM (por ejemplo, RTX 3070, RTX 4080 o A10), aunque el peso del modelo en si no requiere mas de 1 GB.
- No se han publicado datos de latencia o throughput especificos.
- Opciones de despliegue: PyTorch con el pipeline de image-segmentation del modelo base, o scripts propios de inferencia por teselas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | ROC-AUC (segmento 20230827161847) | Licencia |
|---|---|---|---|---|
| scrollprize/resnet50_7.9um_scroll1_frags (original, defectuoso) | ~85,7 M | 7.9 um | 0.5022 (azar) | MIT |
| **Este modelo (reparado)** | 85.708.340 | 7.9 um | **0.9369** | MIT |
| TimeSformer Grand Prize 2023 | no disponible | no disponible | 0.89 (en un crop concreto, mismo codigo) | MIT |

Nota: la comparacion con el TimeSformer es aproximada y se basa en un crop de superficie con 26% de tinta etiquetada, no en un segmento completo; el autor la cita para demostrar que el pipeline y las etiquetas son correctos, no como benchmark formal.

## Limitaciones y advertencias

- El modelo solo se ha evaluado en dos segmentos de Scroll 1; su rendimiento en otros segmentos o en el Scroll 2 no esta verificado.
- El checkpoint original del que deriva tenia un defecto silencioso (decoder sin entrenar) que producia salidas aleatorias sin advertencia; aunque este repositorio lo repara, conviene auditar cualquier checkpoint del corpus con el script de verificacion.
- El autor ha detectado que `resnet50_3um_01122024` del corpus publico esta roto de la misma forma; otros 17 checkpoints del corpus se verifican correctos.
- El modelo es especifico para deteccion de tinta en CT de papiros de Herculano; no es transferible a otros dominios de segmentacion.
- La licencia MIT cubre el codigo y los pesos, pero los datos de entrenamiento (etiquetas del Grand Prize) pueden tener restricciones adicionales de uso.
- No se han publicado estudios de robustez frente a variaciones en la adquisicion de los CT (ruido, artefactos, diferencias de resolucion).

## Enlaces

- Repositorio del modelo: https://huggingface.co/Nieuwlaar/resnet50_7.9um_scroll1_frags-repaired
- Modelo base original: https://huggingface.co/scrollprize/resnet50_7.9um_scroll1_frags
- Codigo del modelo base (modeling_resnet3d.py): https://huggingface.co/scrollprize/resnet50_7.9um_scroll1_frags/blob/main/modeling_resnet3d.py
- GitHub del autor: https://github.com/Nieuwlaar
