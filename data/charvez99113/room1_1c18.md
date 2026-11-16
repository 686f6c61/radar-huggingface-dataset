# Charvez99113/room1_1c18

## Resumen

worker-1-c18 (identificador interno `worker-1-m014`, run e1005) es un detector de objetos basado en YOLO26n especializado en la clasificación de suciedad en habitaciones. Lo publica el usuario Charvez99113 en Hugging Face como un paquete de inferencia que incluye `miner.py`, `weights.onnx` y `chute_config.yml`. El modelo detecta y clasifica cinco clases de suciedad: derrame de líquido (0), papelera (1), basura (2), moho (3) y mancha (4), siguiendo el orden del manifiesto de la competición `manako/Detect-room-dirtiness-detection`.

Se trata de un ajuste fino (polish) de 6 épocas sobre los pesos de worker-1-c16, entrenado con destilación de conocimiento densa desde `apexlabs-hq/sn44-dirtiness-v24`. El objetivo declarado es absorber las rondas públicas más recientes del juez sin perder el rendimiento en las anteriores. El paquete solo modifica los pesos respecto a c16: el grafo ONNX es idéntico (368 nodos, 223 inicializadores) y `miner.py` es byte a byte igual.

Es relevante como ejemplo de iteración incremental en competiciones de minería de modelos: el autor documenta un backtest fuera de muestra con dos semillas y compara contra siete referencias publicadas. No obstante, todas las ventanas de validación del juez son in-sample, y el modelo no se distribuye como modelo de propósito general sino como artefacto de un pipeline de competición concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos de una etapa, cabeza one-to-many), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (solo se distribuye `weights.onnx` en precisión nativa) |
| Idiomas soportados | no aplica (visión); etiquetas en inglés |
| Licencia | no disponible en la model card; el backbone YOLO26n de origen es AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`), grafo de 368 nodos y 223 inicializadores |

## Arquitectura y entrenamiento

El modelo es un YOLO26n (variante nano de la familia YOLO26 de Ultralytics) inicializado desde `yolo26n.pt` preentrenado en COCO. La exportación a ONNX conserva la cabeza one-to-many cruda, sin post-procesado NMS embebido; el NMS se aplica en `miner.py` con IoU 0.5 y `max_det` 100. El entrenamiento se realizó con Ultralytics 8.4.165 y un entrenador de destilación propio (`train_kd19.py`): 6 épocas, resolución 704 px, batch 16, semilla 2, SGD con lr0 0.002 y lrf 0.1, sin warmup y `close_mosaic` 2.

Los datos provienen de la configuración `dc-270`, que combina etiquetas de fusión de cajas sobre las imágenes del propietario, etiquetas del propietario en imágenes nuevas, rondas exactas de ground truth (`sillysilent/new-room-gt@17f1a516`) y todas las rondas públicas reconstruidas del juez `gt_n859` hasta el bloque 9516000, multiplicadas por 8. La destilación es densa desde `apexlabs-hq/sn44-dirtiness-v24@f7e28a46` con `kd_cls` 0.5, `kd_box` 0.5 y `kd_hard` 1, manteniendo las etiquetas duras. La innovación destacable no es arquitectónica sino metodológica: el autor valida la receta fuera de muestra entrenando solo con rondas hasta 9511800 (runs e1008/e1009) y midiendo sobre las 10 rondas determinadas posteriores, obteniendo 0.5869 y 0.6047 frente a 0.5692 de c16.

## Capacidades

- Detección de objetos con cinco clases de suciedad: derrame de líquido, papelera, basura, moho y mancha.
- Salida de cajas delimitadoras con clase y confianza; umbral de confianza 0.25 para todas las clases.
- Regla de anidamiento para la clase basura (`nest_iomin` 0.8 sobre `nest_classes` [2]), que agrupa detecciones solapadas.
- Preprocesado integrado: letterbox a 704 px con padding 114.
- Ejecución con ONNX Runtime (intra 2, inter 1 hilos), OpenCV con 1 hilo y preferencia por CUDA con fallback a CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión general, audio).

## Casos de uso

- Inspección automatizada de habitaciones en alojamientos turísticos: el modelo recibe una imagen por llamada y devuelve cajas de derrames, basura, moho o manchas, lo que permite priorizar la limpieza antes del check-in.
- Control de calidad post-limpieza: integrado en `miner.py`, se ejecuta tras el servicio de limpieza y compara las detecciones con un umbral de confianza 0.25 para certificar que no quedan residuos visibles.
- Monitorización de espacios comunes en edificios: cámaras fijas alimentan el detector para generar alertas cuando aparece basura o derrames en zonas de paso, con la regla de anidamiento evitando duplicados.
- Detección temprana de moho en viviendas: la clase 3 permite señalizar humedades persistentes en paredes y techos para mantenimiento preventivo.
- Auditoría de flotas de limpieza: el modelo procesa lotes de imágenes históricas y produce métricas de incidencia por ubicación, apoyándose en el formato ONNX para despliegue en servidores con o sin GPU.
- Despliegue en el borde con CPU: al ser un YOLO26n exportado a ONNX y con fallback a CPU, puede ejecutarse en dispositivos sin GPU para inspecciones puntuales, aunque el autor no ha medido latencia.
- Participación en la competición `manako/Detect-room-dirtiness-detection`: el paquete está diseñado para ejecutarse con el `miner.py` y `chute_config.yml` incluidos, de modo que un operador puede desplegarlo directamente en la infraestructura del juez.

## Benchmarks y rendimiento

El autor reporta métricas VEC (scorer `vec.py`, commit be52ed6fbf7693b0) sobre la reconstrucción del ground truth a partir de las cajas publicadas de los mineros (`data/gt_n859`, FULL+PARTIAL). Todas las ventanas del juez son in-sample para este candidato.

| Referencia (ventana) | n | c18 menos referencia | Rondas con \|d\| > 0.045 |
|---|---|---|---|
| worker-1-c16, empaquetado (> 9494809) | 59 | +0.0064 [-0.0017, +0.0157] | 4 de 59; 1 de 10 |
| worker-1-c16, empaquetado (> 9511800) | 13 | +0.0290 [+0.0058, +0.0629] | 2 de 13; 1 de 10 |
| room5_1c16 (publicado, > 9512777) | 10 | +0.0137 [+0.0022, +0.0305] | 1 de 10; 1 de 10 |
| apexlabs v24 (> 9494809) | 59 | +0.0184 [+0.0047, +0.0333] | 11 de 59; 4 de 10 |
| Targaryen101 olaf (> 9502225) | 41 | +0.0148 [-0.0098, +0.0393] | 9 de 41; 4 de 10 |
| Cargile fern-488 (> 9494809) | 59 | +0.0237 [+0.0069, +0.0449] | 10 de 59; 3 de 10 |
| crimedetector M (> 9494809) | 58 | +0.0255 [-0.0003, +0.0534] | 14 de 58; 3 de 10 |

Métricas absolutas sobre > 9494809 (59 rondas, `evidence/metrics.json`):

| Métrica | Valor |
|---|---|
| VEC | 0.5781, IC 95 % [0.5503, 0.6019] |
| MAP medio | 0.9242 |
| AP derrame de líquido | 0.9706 |
| AP papelera | 0.9778 |
| AP basura | 0.8399 |
| AP moho | 0.8542 |
| AP mancha | 0.8281 |
| Histograma de falsos positivos | {0: 49, 1: 8, 2: 2} |
| Suelo (floor) / cero | 0 / 0 |

En la prueba de similitud T5.6 (`evidence/t56_psim.txt`): P(no similar) 0.70 frente a v24, 0.80 frente a olaf y 0.32 frente a room5_1c16.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un YOLO26n a 704 px, la huella es reducida (del orden de pocos GB), pero el autor no publica mediciones.
- GPU recomendadas: no especificadas. `miner.py` prioriza CUDA y recurre a CPU si no hay GPU disponible.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por el tamaño del modelo (variante nano) es plausible en RTX 3060 o superiores, pero no hay datos del autor.
- Despliegue: ONNX Runtime (intra 2, inter 1 hilos) con OpenCV a 1 hilo, tal como configura `miner.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no medidos por el autor. Indica que su entorno de entrenamiento está limitado y que el grafo es estructuralmente idéntico al de c16 (`evidence/graph875_c16_c18.txt`), por lo que el resultado G6 de c16 debería trasladarse, pero la decisión final corresponde al tester.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| worker-1-c18 | YOLO26n + KD, ONNX | 5 (suciedad) | 704 px | no disponible (backbone AGPL-3.0) | Hugging Face, repo de 0.0 GB |
| worker-1-c16 | YOLO26n + KD, ONNX | 5 (suciedad) | 704 px | no disponible | Hugging Face; c18 mejora +0.0064 VEC en > 9494809 |
| apexlabs-hq/sn44-dirtiness-v24 | Detector (profesor KD) | 5 (suciedad) | no disponible | no disponible | Hugging Face; c18 le supera +0.0184 VEC en > 9494809 |
| room5_1c16 | Detector de la competición | 5 (suciedad) | no disponible | no disponible | Publicado; c18 le supera +0.0137 VEC en > 9512777 |
| Targaryen101 olaf | Detector de la competición | 5 (suciedad) | no disponible | no disponible | Publicado; diferencia +0.0148 con IC que cruza cero |

## Limitaciones y advertencias

- Todos los números del juez son in-sample: `dc-270` contiene todas las rondas determinadas hasta 9516000. La única evidencia fuera de muestra es un backtest de 10 rondas con dos semillas, insuficiente para conclusiones firmes.
- Alta similitud con worker-1-c16 (P(no similar) 0.32): desplegado sobre la hotkey de c16 se trata de un re-commit, con reinicio del bloque de historial y desempate; en otra hotkey, el commit anterior de c16 gana el desempate.
- La clase basura es la más débil: AP 0.8399 y 18 de 119 cajas de basura no detectadas (`evidence/FN_analysis.md`).
- Latencia no medida por el autor; el rendimiento en producción depende de la validación del tester (G6).
- Licencia no declarada en la model card. El backbone YOLO26n original es AGPL-3.0, lo que impone obligaciones de copyleft en uso comercial y de red; conviene verificar antes de desplegar.
- El modelo solo detecta cinco clases de suciedad; no es un modelo de propósito general ni admite texto, tool calling ni razonamiento.
- El ground truth de validación es una reconstrucción a partir de las cajas publicadas de los mineros, no el ground truth del validador, lo que puede introducir sesgo en las métricas.
- El paquete no incluye código ni pesos de los modelos de la línea de ascendencia; solo `miner.py`, `weights.onnx`, `chute_config.yml` y `README.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charvez99113/room1_1c18
- Competición de referencia: https://huggingface.co/manako/Detect-room-dirtiness-detection
- Profesor de destilación: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v24
- Ground truth del propietario: https://huggingface.co/datasets/sillysilent/new-room-gt
- Repositorio Ultralytics (YOLO26): https://github.com/ultralytics/ultralytics
