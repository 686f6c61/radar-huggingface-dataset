# JocelynW/AURORA-KITTI-models

## Resumen

AURORA-KITTI-models es el repositorio de checkpoints del modelo DDCD (Depth Completion and Denoising), propuesto en el artículo "AURORA-KITTI: Any-Weather Depth Completion and Denoising" y desarrollado por Yiting Wang, Tim Brödermann, Hamed Haghighi, Haonan Zhao, Christos Sakaridis, Kurt Debattista y Valentina Donzella, con afiliación a la University of Warwick. No es un modelo de lenguaje: es un modelo de visión por computador especializado en completar y limpiar mapas de profundidad densos a partir de entradas dispersas de LiDAR y RGB degradadas por condiciones meteorológicas adversas.

El modelo aborda la tarea DCD (Depth Completion and Denoising), formulada como la reconstrucción conjunta de un mapa de profundidad denso a partir de entradas dispersas corrompidas, suprimiendo el ruido inducido por el clima. Se construye sobre la arquitectura BP-Net y destila un prior estructural limpio desde un profesor congelado de Depth-Anything-V2, de modo que en inferencia solo consume las entradas degradadas. Cuenta con 89,87 millones de parámetros y un coste de 48,6 ms por fotograma a resolución 352×1216.

El checkpoint publicado (`ddcd_aurora.pth`, 344 MB) reproduce exactamente los números publicados del artículo y está verificado con el script `Depth_Models/benchmark/validate_against_paper.py` del repositorio de código. La relevancia actual radica en que AURORA-KITTI se presenta como el primer benchmark multimodal y multi-clima a gran escala para depth completion robusto "in the wild", con más de 82.000 pares RGB-LiDAR coherentes meteorológicamente y etiquetas de profundidad métrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDCD (basada en BP-Net con destilacion de Depth-Anything-V2) |
| Parametros totales | 89,87 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `.pth` en precision original) |
| Idiomas soportados | no aplica |
| Licencia | MIT para pesos y codigo; datos de entrenamiento CC BY-NC-SA 3.0 (solo uso no comercial) |
| Formato de pesos | `.pth` (PyTorch) |
| Tamano del checkpoint | 344 MB (`ddcd_aurora.pth`) |
| Tamano del repositorio | 1,8 GB |
| Pipeline | depth-estimation |
| Resolucion de inferencia de referencia | 352×1216 |
| Latencia declarada | 48,6 ms por fotograma (352×1216) |

## Arquitectura y entrenamiento

DDCD se apoya en BP-Net (Tang et al., CVPR 2024) y añade un esquema de destilacion de conocimiento desde un profesor congelado basado en Depth-Anything-V2. El objetivo de destilacion es multi-escala e invariante a escala y desplazamiento (scale-and-shift-invariant), y el profesor lee la imagen RGB limpia emparejada únicamente durante el entrenamiento. En inferencia, el modelo recibe exclusivamente entradas degradadas: RGB corrompido por el clima y LiDAR disperso también corrompido. La normalización del profesor alineada con el ground truth permite situar profesores de profundidad relativa y métrica en un espacio métrico común, lo que habilita la supervisión métrica final.

El entrenamiento se realiza sobre el dataset AURORA-KITTI, derivado del benchmark KITTI, que contiene más de 82.000 pares RGB-LiDAR coherentes meteorológicamente con etiquetas de profundidad métrica, abarcando múltiples tipos de clima, tres niveles de severidad y escenas diurnas y nocturnas. La innovación principal es la formulación unificada de depth completion y denoising como una única tarea (DCD), junto con la incorporación explícita de corrupciones meteorológicas en las entradas LiDAR (no solo variaciones de densidad). No se documenta en la información disponible el uso de RLHF ni DPO, algo esperable al no tratarse de un modelo generativo de lenguaje.

## Capacidades

- Completado de profundidad (depth completion) a partir de LiDAR disperso, generando mapas densos.
- Denoising de profundidad: supresión del ruido inducido por lluvia, nieve y niebla en las mediciones LiDAR.
- Robustez ante clima adverso, con rendimiento desglosado por condición (despejado, nieve, lluvia, niebla moderada, niebla densa).
- Funcionamiento en escenas diurnas y nocturnas (el dataset incluye ambas).
- Fusion de sensores: consume simultáneamente RGB corrompido y LiDAR disperso corrompido.
- Generalización a otro dataset (DENSE) evaluada con protocolo de recorte inferior de 256 píxeles.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por tratarse de un modelo de visión y no de lenguaje.

## Casos de uso

- Percepción en vehículos autónomos en condiciones meteorológicas adversas: el modelo reconstruye mapas de profundidad densos a partir de LiDAR disperso bajo lluvia, nieve o niebla, permitiendo mantener la percepción de profundidad cuando los sensores se degradan. Su rendimiento declarado a 48,6 ms por fotograma es compatible con bucles de percepción en tiempo real.
- Sistemas avanzados de asistencia al conductor (ADAS): para funciones como frenado de emergencia o mantenimiento de carril, el mapa de profundidad denoised mejora la estimación de distancias a obstáculos cuando la cámara y el LiDAR están afectados por partículas en suspensión.
- Robots móviles autónomos en exteriores: plataformas de reparto o inspección que operan a la intemperie se benefician de una profundidad fiable incluso con niebla densa, donde su RMSE se sitúa en 4181,39 mm frente a 1068,09 mm en condiciones despejadas.
- Vehículos aéreos no tripulados de baja altitud: en misiones de vigilancia o inspección con lluvia o nieve, la denoising de LiDAR permite mantener mapas de altitud y detección de obstáculos sin depender de una calidad de sensor ideal.
- Reconstrucción 3D y mapeo en condiciones adversas: la salida de profundidad densa y limpia alimenta pipelines de SLAM o de reconstrucción volumétrica donde el ruido meteorológico degradaría la geometría.
- Validación de pipelines de sensor fusion: investigación y comparación de estrategias de fusión cámara-LiDAR usando el benchmark AURORA-KITTI y sus particiones multi-clima y multi-severidad como referencia reproducible.
- Investigación académica en visión por computador y robótica: estudio de destilación de profesores (Depth-Anything-V2) hacia tareas métricas, y análisis de robustez frente a corrupciones climáticas controladas.

## Benchmarks y rendimiento

Resultados verificados del checkpoint `ddcd_aurora.pth` sobre AURORA-KITTI test y DENSE test (1.600 fotogramas cada uno):

| Benchmark | RMSE (mm) | MAE (mm) | iRMSE (1/km) | iMAE (1/km) |
|---|---:|---:|---:|---:|
| AURORA-KITTI test | 1801,93 | 570,36 | 4,25 | 1,96 |
| DENSE test (real) | 2761,97 | 1569,14 | 34,82 | 13,24 |

Desglose por clima de `ddcd_aurora.pth` sobre AURORA-KITTI test (RMSE, mm):

| Clear | Snow | Rain | Fog | Fog (heavy) |
|---:|---:|---:|---:|---:|
| 1068,09 | 1463,85 | 1807,03 | 2835,93 | 4181,39 |

Protocolo de evaluación: AURORA-KITTI usa la región completa de ground truth; DENSE emplea el recorte inferior de 256 píxeles (`crop_gt_top=96`). No se han publicado en la información disponible comparativas numéricas frente a otros modelos concretos (BP-Net, DMD3C u otros) dentro de esta ficha.

## Requisitos de hardware

- Pesos en memoria: aproximadamente 360 MB en FP32 (89,87 M × 4 bytes) y unos 180 MB en FP16, calculado a partir del número de parámetros.
- VRAM estimada para inferencia: no disponible de forma oficial; a partir del tamaño de pesos y de las activaciones esperables a resolución 352×1216, es razonable situarla en el rango de pocos gigabytes, aunque la cifra exacta no está publicada.
- GPU recomendadas: no disponible explícitamente. El coste declarado de 48,6 ms por fotograma a 352×1216 (aproximadamente 20,6 FPS) sugiere una GPU de gama media o superior, pero la información no especifica el hardware de medición.
- Encaje en GPU de consumo: no confirmado por la documentación, aunque el reducido tamaño del modelo (89,87 M de parámetros) permite esperar que quepa en GPU de consumo actuales; no se aporta la lista concreta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión). El uso previsto es la carga directa del checkpoint `.pth` en PyTorch siguiendo `Depth_Models/DDCD/COMMANDS.md` del repositorio de código.
- Latencia y throughput: 48,6 ms por fotograma a 352×1216 según la model card; no se especifica el throughput agregado por lote ni la GPU empleada en la medición.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DDCD (AURORA-KITTI) | 89,87 M | Depth completion + denoising multi-clima | 352×1216, 48,6 ms/frame | MIT (pesos); datos CC BY-NC-SA 3.0 | Checkpoint publicado en HuggingFace |
| BP-Net | no disponible | Depth completion | no disponible | no disponible | Base de DDCD; citado en el articulo |
| DMD3C | no disponible | Depth completion / metric depth | no disponible | no disponible | Citado (CVPR 2025); referencia del articulo |
| Depth-Anything-V2 | no disponible | Profundidad relativa/metria (profesor) | no disponible | no disponible | Usado solo como profesor congelado en entrenamiento |

No se dispone de cifras comparativas publicadas en la información proporcionada para completar la tabla con RMSE/MAE de los modelos alternativos frente a los mismos benchmarks.

## Limitaciones y advertencias

- La licencia MIT cubre los pesos y el código, pero los datos de entrenamiento AURORA-KITTI heredan de KITTI la licencia CC BY-NC-SA 3.0, lo que restringe el uso a fines no comerciales para cualquier derivado que se entrene con esos datos.
- El modelo está especializado en una única tarea (depth completion y denoising) y no ofrece capacidades de lenguaje, tool calling ni agentes.
- La resolución de referencia es 352×1216; no se documenta el comportamiento a otras resoluciones o relaciones de aspecto.
- El rendimiento se degrada notablemente con la severidad meteorológica: el RMSE pasa de 1068,09 mm en despejado a 4181,39 mm en niebla densa, casi cuatro veces mayor.
- La evaluación principal se realiza sobre AURORA-KITTI y DENSE; no se aportan resultados sobre otros dominios o sensores distintos de los de KITTI.
- Solo se publica el checkpoint DDCD (`ddcd_aurora.pth`); los checkpoints de ablaciones y de baselines reentrenados están retenidos pendientes de verificación contra las tablas publicadas.
- Riesgo de sobreajuste a la distribución de KITTI (entornos de conducción urbana y rural alemana), sin datos sobre transferencia a otras geografías o condiciones de iluminación extremas.
- No se documentan sesgos demográficos (no aplica a modelos sin datos humanos) ni se detallan posibles sesgos de sensor o de escena.
- Al ser un modelo de percepción, una salida errónea de profundidad puede tener consecuencias críticas de seguridad en producción; se recomienda validación exhaustiva antes de su uso en vehículos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JocelynW/AURORA-KITTI-models
- Dataset en HuggingFace: https://huggingface.co/datasets/JocelynW/AURORA-KITTI
- Paper (DOI): https://doi.org/10.1016/j.inffus.2026.104830
- Preprint arXiv: https://arxiv.org/abs/2603.14701
- PDF arXiv: https://arxiv.org/pdf/2603.14701
- Codigo (GitHub): https://github.com/Warwick-Jocelyn/AURORA-KITTI
- README del codigo: https://github.com/Warwick-Jocelyn/AURORA-KITTI/blob/main/README.md
- Pagina de publicacion del autor: https://warwick-jocelyn.github.io/publication/2026-aurora-kitti
