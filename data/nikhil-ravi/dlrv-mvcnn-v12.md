# Nikhil-Ravi/dlrv-mvcnn-v12

## Resumen

dlrv-mvcnn-v12 es un estimador de pose 6DoF para objetos de LineMOD basado en una red convolucional multi-vista (MVCNN). Lo desarrolla Nikhil-Ravi en el marco de un proyecto de la asignatura Deep Learning for Robot Vision de la Hochschule Bonn-Rhein-Sieg. El modelo resuelve un problema concreto de visión para robótica: dada una observación RGB-D enmascarada de una única instancia de objeto, regresa su pose completa (rotación y traslación) sin recibir la traslación como entrada.

La arquitectura parte de un backbone ResNet-18 preentrenado en ImageNet compartido sobre doce vistas ortorómicas virtuales renderizadas a partir de la nube de puntos observada, con max-pooling entre vistas (view pooling de MVCNN) y una cabeza compartida que separa la rama de rotación y la de traslación. El modelo tiene 11.383.512 parámetros (aproximadamente 11,4 M) y no es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto.

Su relevancia actual es experimental y comparativa. El checkpoint v12 es el resultado final de la rama multi-vista del proyecto y se utiliza como referencia en una comparación directa contra la rama de nube de puntos (PointNet++). Sobre el split real de test de BOP alcanza un 56,33 % de precisión con umbral @0,1d y un error medio ADD de 26,38 mm, con la particularidad de que su precisión es mucho menos sensible al diámetro del objeto que la de la rama de nube de puntos (Pearson r = +0,21 frente a +0,92).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MVCNN: ResNet-18 (preentrenado en ImageNet) compartido sobre 12 vistas, per-view descriptor de 512 dimensiones, max-pooling entre vistas; cabeza compartida con rama de rotación (256→128→6) y rama de traslación (256→128→3); clasificador auxiliar dropout 0.3 + Linear(512, 15) |
| Parametros totales | 11.383.512 (≈11,4 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un tensor `[B, 12, 3, 224, 224]`) |
| Tipos de cuantizacion | no disponible (no se documenta ninguna cuantización; el checkpoint se distribuye en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de visión, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pth`) con un diccionario de claves `model`, `epoch`, `val_add10` y `loss`; no se ofrece safetensors ni GGUF |

## Arquitectura y entrenamiento

La entrada se construye a partir de la observación RGB-D enmascarada: la profundidad se reproyecta a una nube de puntos con color RGB y el pipeline renderiza doce vistas ortorómicas virtuales de esa geometría (azimuts de 0° a 330°, z-buffer con criterio nearest-first, objeto escalado a aproximadamente el 80 % del marco de 224×224). El renderizador está limitado a 10.000 puntos. Las doce vistas provienen de la misma instancia única, de modo que el bag tiene exactamente un objetivo de pose. El backbone ResNet-18 se aplica de forma compartida a cada vista y produce un descriptor de 512 dimensiones por vista, que se agrega con max-pooling sobre las vistas. La rotación se predice en la representación continua de 6 dimensiones de Zhou et al. y se convierte a matriz de rotación mediante Gram-Schmidt. La traslación se predice como residuo respecto al centroide de profundidad observado (`t = centroide + t_residual`, con el residuo normalizado por 100 mm), la misma parametrización que la rama de PointNet++, de modo que la traslación se predice y no se suministra. El clasificador auxiliar sobre el descriptor agrupado es un diagnóstico de información de identidad de objeto y no forma parte de la tarea de pose.

El entrenamiento usa exclusivamente el split sintético PBR (635.614 instancias utilizables tras el filtrado por visibilidad), con la simulación de observación dispersa como única medida de adaptación de dominio. Se entrenó durante 30 épocas con batch 16, AdamW con tasas de aprendizaje diferenciales (cabeza de pose 1e-3, backbone 2e-4), weight decay 1e-4, recorte de gradiente en 1,0, StepLR que reduce a la mitad cada 20 épocas y precisión mixta (AMP). Cada época entrena sobre una ventana rotatoria de 100.000 instancias de las disponibles (6.250 lotes), con orden determinista por época para permitir reanudar a mitad de época. El objetivo es la distancia ADD/ADD-S diferenciable sobre 500 vértices CAD muestreados (ADD-S para bowl, eggbox y glue) más un término auxiliar de entropía cruzada con peso 0,1 y label smoothing 0,05. Las aumentaciones incluyen jitter de brillo, contraste y saturación, dropout de puntos, oclusión estructurada, simulación de observación dispersa (p = 0,35, conservando entre el 30 % y el 70 % de los puntos), ruido de sensor XYZ, rotación coherente con la pose (±20°/±30°/±20°) y densificación adaptativa por splatting de vistas con ocupación inferior al 6 %. La selección de modelo se hizo sobre un subconjunto estratificado de 990 instancias del split real de test, con el mejor checkpoint en la época 26 (58,28 % en ese subconjunto).

## Capacidades

- Regresión de pose 6DoF completa (rotación en representación 6D convertida a matriz con Gram-Schmidt y traslación como residuo del centroide de profundidad) a partir de una observación RGB-D enmascarada de una sola instancia.
- Procesamiento multi-vista: renderiza y consume doce vistas ortorómicas virtuales de la geometría observada, con agregación por max-pooling.
- Generalización de simulación a realidad limitada: entrenado solo con datos sintéticos PBR, con simulación de observación dispersa como única adaptación de dominio.
- Insensibilidad relativa al diámetro del objeto (Pearson r = +0,21 en datos reales), porque el renderizador normaliza la escala aparente.
- Clasificación auxiliar de identidad de objeto sobre el descriptor agrupado (15 clases de LineMOD), con función diagnóstica, no operativa.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No incluye etapa de detección ni segmentación: requiere una máscara de objeto ground truth.

## Casos de uso

- Recogida y colocación robótica (bin picking): el modelo estima la pose 6DoF de una pieza ya segmentada para que el planificador genere la pinza y la trayectoria. Es adecuado cuando la celda dispone de segmentación previa y de una cámara RGB-D, y cuando el objeto está dentro de los que el modelo maneja bien (simétricos como bowl, eggbox o glue, con 93–100 % en ADD-S).
- Verificación de ensamblaje en línea de producción: comprobar que una pieza está orientada y posicionada según especificación comparando la pose estimada con la pose nominal, usando el error ADD como criterio de tolerancia.
- Investigación en adaptación de dominio simulación-a-realidad: el checkpoint sirve como referencia de una rama multi-vista entrenada solo con PBR, y su gap de densidad de puntos (las observaciones reales conservan solo el 20–53 % de la densidad de entrenamiento por objeto) es un caso de estudio reproducible.
- Comparación de representaciones en estimación de pose: la model card lo usa explícitamente para la comparación head-to-head contra la rama de PointNet++ (jan024/dlrv-pointnet-exp5, 36,23 %; jan024/dlrv-ppointnet-exp6), lo que lo hace útil como baseline en estudios de representación 2D multi-vista frente a nube de puntos.
- Evaluación sobre el benchmark BOP/LineMOD: el repositorio incluye `mvcnn_v12_results.json` con el diccionario completo de métricas, y el script `examples/run_real_eval.py` reproduce la cifra principal sobre el split real de test de 3.000 imágenes.
- Documentación docente y reproducción de experimentos: al ser un proyecto de asignatura con hiperparámetros y recetas de aumentación documentados, sirve para prácticas de visión robótica y para reproducir pipelines de entrenamiento con ADD diferenciable.
- Prototipado de agarre sobre objetos simétricos: para bowl, eggbox y glue, evaluados con ADD-S, el modelo es la opción más fiable de las dos ramas del proyecto, al puntuar entre el 93 % y el 100 %.

## Benchmarks y rendimiento

Datos publicados en la model card. Todos los resultados de la tabla siguiente corresponden al split real de test de BOP sobre 3.000 imágenes, salvo la fila sintética, que corresponde al subconjunto de selección de modelo.

| Split | @0,05d | @0,1d | @0,15d | @0,2d | Mean ADD | Median ADD |
|---|---|---|---|---|---|---|
| Sintético (subconjunto de selección de modelo) | — | 58,28 % | — | — | — | — |
| Real BOP test, 3.000 imágenes | 15,33 % | 56,33 % | 73,20 % | 80,27 % | 26,38 mm | 15,55 mm |

Métricas adicionales del run real: error medio de traslación de 11,88 mm y error medio de rotación de 51,61°. Por objeto, los simétricos evaluados con ADD-S encabezan la tabla (bowl, eggbox y glue, con 93–100 %), mientras que los peores son cup (12,0 %), duck (28,0 %) y driller (30,5 %), precisamente los de observación real más dispersa. La precisión es poco sensible al diámetro del objeto (Pearson r = +0,21 en datos reales) frente a la marcada dependencia de la rama de nube de puntos (r = +0,92).

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible, y no procede aplicarlos a un modelo de estimación de pose.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Cálculo derivado del número de parámetros (no confirmado por el autor): los 11,38 M de parámetros ocupan aproximadamente 43,5 MB en fp32 y 22,8 MB en fp16, a lo que hay que sumar activaciones del backbone ResNet-18 sobre 12 vistas de 224×224 y el coste del renderizado de vistas.
- GPU recomendadas: no se especifica ninguna en la documentación. La única referencia técnica es que el ejemplo de carga usa `map_location='cuda'` y que el entrenamiento empleó AMP.
- Cabe en GPU de consumo: sí, por tamaño de modelo (11,4 M de parámetros); la viabilidad real depende del número de batch de las 12 vistas y de si el renderizado se ejecuta en GPU o CPU. No hay cifras oficiales de consumo por modelo concreto.
- Opciones de despliegue: exclusivamente PyTorch, cargando el checkpoint con las definiciones del repositorio del proyecto (`mvcnn.model.MVCNNWithPose`, `mvcnn.data.MVCNNBOPDataset`, `render_virtual_views`). No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI, ONNX ni TensorRT.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia.
- Dependencia de datos: requiere el dataset LineMOD en formato BOP, que no se distribuye con el modelo y debe obtenerse de BOP.

## Comparativa con modelos similares

La comparación disponible es interna al proyecto y no incluye cifras de parámetros ni de contexto para las alternativas. Los porcentajes corresponden al @0,1d sobre el split real.

| Modelo | Enfoque | Parámetros | @0,1d (real) | Correlación con diámetro (real) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nikhil-Ravi/dlrv-mvcnn-v12 | MVCNN multi-vista (ResNet-18) | 11.383.512 | 56,33 % | r = +0,21 | no disponible | HuggingFace |
| jan024/dlrv-pointnet-exp5 | PointNet++ sobre nube de puntos | no disponible (la rama de nube de puntos se cita con 0,86 M en la model card) | 36,23 % | no disponible | no disponible | HuggingFace |
| jan024/dlrv-ppointnet-exp6 | PointNet++ sobre nube de puntos | no disponible (rama citada con 0,86 M) | no disponible en esta model card | no disponible | no disponible | HuggingFace |

Advertencia de comparación: el propio autor señala que el modelo multi-vista, con 11,4 M de parámetros y preentrenamiento en ImageNet, no está igualado en presupuesto con el pipeline de nube de puntos de 0,86 M, y que el informe separa estos factores de confusión de la comparación de representaciones. No se dispone de datos de licencia, contexto ni benchmarks externos de las alternativas.

## Limitaciones y advertencias

- Entrenado únicamente con datos sintéticos. Las observaciones reales de test solo conservan entre el 20 % y el 53 % de la densidad de puntos de entrenamiento por objeto, y esa brecha de densidad, no los objetivos de pose, es la fuente dominante de error residual.
- Requiere una máscara de objeto ground truth. No incluye etapa de detección ni de segmentación, por lo que no es utilizable directamente sobre imágenes sin anotar.
- Fallo sistemático en objetos pequeños o poco visibles: cup 12,0 %, duck 28,0 %, driller 30,5 %.
- Error de rotación elevado en el agregado real: 51,61° de media, muy por encima del error de traslación (11,88 mm), lo que limita su uso en tareas que exijan orientación fina.
- La evaluación submuestrea los vértices CAD sin semilla fija, de modo que las cifras por objeto varían unos pocos puntos entre ejecuciones; las cifras agregadas son estables hasta la precisión publicada.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No hay datos de sesgo, idioma ni robustez fuera de LineMOD; el modelo está acotado a los quince objetos de LineMOD y no es un modelo general.
- El repositorio de HuggingFace figura con 0,0 GB de tamaño, 0 descargas y 0 likes, por lo que conviene verificar que el checkpoint y el código del proyecto estén realmente accesibles antes de planificar una integración.
- El modelo depende de código propio del proyecto para definir la arquitectura y el renderizado; no es cargable de forma autónoma con librerías estándar.
- Para producción en tiempo real no hay mediciones publicadas de latencia ni de throughput, lo que impide validar requisitos de ciclo de control sin medirlo previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nikhil-Ravi/dlrv-mvcnn-v12
- Rama de nube de puntos del mismo proyecto: https://huggingface.co/jan024/dlrv-pointnet-exp5
- Segunda variante de nube de puntos: https://huggingface.co/jan024/dlrv-ppointnet-exp6
- Dataset LineMOD en formato BOP (requerido para reproducir la evaluación): https://bop.felk.cvut.cz/datasets/
- Repositorio del proyecto (definiciones `mvcnn.model`, `mvcnn.data`, script `examples/run_real_eval.py`): no disponible como URL en la información proporcionada
- Paper o informe técnico asociado: no disponible
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (páginas de ayuda de cuentas de Google); no se han encontrado enlaces adicionales relevantes.
