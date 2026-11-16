# DaojiePENG/cloudedgevla-libero-spatial-object-goal-10

## Resumen

CloudEdgeVLA es una política vision-language-action (VLA) construida sobre OpenVLA-7B y ajustada con la receta OpenVLA-OFT sobre las cuatro suites de LIBERO (`libero_spatial`, `libero_object`, `libero_goal` y `libero_10`). El modelo lo publica el usuario DaojiePENG como checkpoint asociado al artículo CloudEdgeVLA, y su rasgo distintivo es que se ha entrenado y evaluado con un pipeline de observaciones con retardo de fotograma (*frame-delay*) que simula la latencia de inferencia en el lado de la nube.

La arquitectura combina un backbone visual fusionado DINOv2 + SigLIP con un backbone de lenguaje Llama-2-7B (es decir, 7B parámetros totales), más una cabeza de acción de regresión L1 que opera sobre características SigLIP de ambas vistas de cámara. La decodificación de acciones es paralela, con *chunks* de 8 pasos en lazo abierto, y el estado proprioceptivo se inyecta mediante un `ProprioProjector` independiente.

El checkpoint publicado corresponde al paso global 95.000 de un entrenamiento de 100.000 pasos (bf16), con ventana de retardo W = 21 y 64 fotogramas de historia efectiva. Es relevante para quienes investigan el despliegue de políticas robóticas en arquitecturas cloud-edge, ya que cuantifica explícitamente la degradación del éxito al aumentar el retardo de observación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA (OpenVLA-OFT): backbone visual fusionado DINOv2 + SigLIP, backbone de lenguaje Llama-2-7B, cabeza de acción L1 y `ProprioProjector` |
| Parametros totales | 7B (heredados de OpenVLA-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (4 shards bf16) + `.pt` para cabeza de acción y proyector de propriocepción |

## Arquitectura y entrenamiento

El modelo sigue la receta OpenVLA-OFT: un backbone visual Prismatic que fusiona DINOv2 y SigLIP, un LLM Llama-2-7B y una cabeza de regresión L1 que predice acciones directamente a partir de las características SigLIP de las dos vistas de cámara. La decodificación es paralela (no autorregresiva token a token) y genera *chunks* de 8 acciones en lazo abierto; el estado proprioceptivo se incorpora mediante un proyector dedicado. El checkpoint incluye los pesos ya fusionados (el adaptador LoRA del entrenamiento queda como artefacto y no se carga en inferencia).

El entrenamiento se realizó sobre una mezcla de las cuatro suites LIBERO con la configuración `libero_all_frame_delay_w21_eff64_lr5e4_100k`: ventana de retardo W = 21, historia efectiva de 64 fotogramas y tasa de aprendizaje 5e-4 durante 100.000 pasos (se publica el paso 95.000). El protocolo de *frame-delay* introduce, en cada paso de entorno, una observación con retardo `k ~ U{1, …, D}`, de modo que D = 0 equivale al protocolo LIBERO estándar sin latencia. No se detalla en la información disponible la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales de dos cámaras y estado proprioceptivo.
- Decodificación paralela de acciones con *chunks* de 8 pasos en lazo abierto.
- Robustez explícita frente a retardo de observación de hasta 40 pasos de entorno (entrenado con ventana W = 21).
- Ejecución de tareas de las suites LIBERO: espacial, objeto, meta y tareas largas (`libero_10`).
- Soporte de inferencia con `trust_remote_code=True` mediante `AutoModelForVision2Seq` y `AutoProcessor`.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Evaluación de políticas VLA bajo latencia de red: el checkpoint permite medir la tasa de éxito con retardos D de 0 a 40 pasos, lo que sirve para dimensionar la infraestructura cloud-edge antes de desplegar un robot real.
- Investigación en manipulación robótica con LIBERO: reproduce las cifras del artículo CloudEdgeVLA sobre las cuatro suites y sirve como línea base para comparar nuevas políticas.
- Prototipado de *offloading* de inferencia: al estar entrenado con observaciones retardadas, es adecuado para arquitecturas en las que el modelo corre en servidor y el robot actúa como cliente.
- Benchmark de robustez temporal: útil para estudiar cómo decae el éxito en tareas largas (`libero_10`) frente a tareas cortas cuando aumenta el retardo.
- Reproducción de experimentos: el repositorio es autocontenido (pesos, procesador, estadísticas de normalización y metadatos), lo que facilita la réplica de resultados.
- Base para *fine-tuning* en dominios propios: al partir de OpenVLA-7B con licencia MIT, puede adaptarse a nuevas tareas de manipulación manteniendo la cabeza de acción y el proyector de propriocepción.

## Benchmarks y rendimiento

Tasa de éxito (%) en LIBERO, 50 ensayos por tarea (media ± desviación sobre 5 bloques de 10), según la model card:

| Suite | D0 | D5 | D10 | D15 | D20 | D25 | D30 | D40 |
|---|---|---|---|---|---|---|---|---|
| libero_spatial | 98,0 ±1,0 | 96,0 ±0,7 | 93,4 ±2,6 | 95,0 ±1,4 | 91,6 ±1,1 | 91,2 ±1,9 | 87,8 ±1,1 | 76,0 ±3,5 |
| libero_object | 99,0 ±2,2 | 98,2 ±1,6 | 97,0 ±2,0 | 95,4 ±1,5 | 95,6 ±1,5 | 94,2 ±2,8 | 91,2 ±2,8 | 74,2 ±3,5 |
| libero_goal | 96,6 ±1,3 | 97,2 ±1,8 | 96,2 ±1,6 | 96,8 ±0,4 | 95,6 ±1,5 | 94,8 ±1,6 | 92,4 ±2,4 | 76,2 ±3,5 |
| libero_10 | 94,4 ±2,1 | 93,0 ±3,9 | 88,8 ±1,9 | 87,4 ±4,0 | 84,8 ±4,5 | 86,0 ±3,2 | 78,8 ±4,7 | 63,4 ±3,2 |
| **macro** | **97,0 ±1,6** | **96,1 ±2,0** | **93,9 ±2,0** | **93,7 ±1,8** | **91,9 ±2,1** | **91,5 ±2,4** | **87,5 ±2,8** | **72,4 ±3,4** |

Tasa de éxito (%) con 10 ensayos por tarea y media ± desviación sobre 3 semillas aleatorias del muestreador de retardo:

| Suite | D0 | D5 | D10 | D15 | D20 | D25 | D30 | D40 |
|---|---|---|---|---|---|---|---|---|
| libero_spatial | 97,0 ±0,0 | 97,3 ±0,6 | 94,7 ±3,2 | 93,0 ±2,0 | 93,0 ±1,7 | 90,0 ±1,7 | 87,0 ±1,7 | 79,7 ±3,5 |
| libero_object | 100,0 ±0,0 | 99,3 ±0,6 | 97,7 ±1,5 | 95,7 ±0,6 | 95,3 ±2,5 | 94,3 ±1,2 | 91,3 ±0,6 | 77,7 ±5,0 |
| libero_goal | 96,0 ±0,0 | 97,7 ±2,1 | 95,3 ±2,5 | 93,0 ±3,0 | 93,7 ±2,9 | 91,0 ±1,0 | 88,7 ±1,5 | 77,7 ±4,5 |
| libero_10 | 96,0 ±0,0 | 90,0 ±1,7 | 89,0 ±1,0 | 88,7 ±2,9 | 86,3 ±5,9 | 80,0 ±5,3 | 73,7 ±3,1 | 66,7 ±3,2 |
| **macro** | **97,2 ±0,0** | **96,1 ±1,2** | **94,2 ±2,0** | **92,6 ±2,1** | **92,1 ±3,2** | **88,8 ±2,3** | **85,2 ±1,7** | **75,5 ±4,0** |

Ambas tablas estiman el mismo protocolo variando factores distintos (estado inicial frente a semilla del muestreador de retardo); coinciden dentro de sus barras de error salvo en D = 25/30/40, donde difieren entre 2,4 y 3,0 puntos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de comparación directa con otros modelos.

## Requisitos de hardware

- VRAM estimada: al menos 14-16 GB para cargar los pesos en bf16 (7B parámetros más backbone visual), con margen adicional para activaciones y el *chunk* de acciones.
- GPU recomendadas: A100 o H100 para evaluación a gran escala; RTX 4090 (24 GB) es suficiente para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo con 24 GB; no se documentan requisitos para GPUs de 16 GB o menos ni versiones cuantizadas.
- Opciones de despliegue: `transformers` con `AutoModelForVision2Seq` y `trust_remote_code=True`; el script de evaluación `experiments/robot/libero/run_libero_eval.py` del código CloudEdgeVLA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CloudEdgeVLA (este) | 7B | no disponible | 97,0 % macro a D0; 72,4 % a D40 | MIT | Hugging Face |
| OpenVLA-7B (base) | 7B | no disponible | no disponible en esta ficha | MIT (según model card de referencia) | Hugging Face |
| OpenVLA-OFT | 7B | no disponible | no disponible en esta ficha | no disponible | no disponible |

La comparación cuantitativa con OpenVLA-7B y OpenVLA-OFT no puede completarse porque la información proporcionada no incluye sus resultados en LIBERO bajo el mismo protocolo.

## Limitaciones y advertencias

- El modelo está especializado en las cuatro suites LIBERO; no se documenta generalización a otros entornos, robots o tareas fuera de ese dominio.
- El rendimiento cae de forma marcada con retardos altos: la macro media baja de 97,0 % (D0) a 72,4 % (D40), y `libero_10` es la suite más sensible (63,4 % a D40).
- Las dos tablas de resultados discrepan entre 2,4 y 3,0 puntos en D = 25/30/40, lo que indica incertidumbre no despreciable en ese régimen.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de modelos de lenguaje; el uso previsto es robótico.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_prismatic.py`, `configuration_prismatic.py` y `processing_prismatic.py` antes de usarlo en producción.
- La cabeza de acción y el proyector de propriocepción son módulos separados en `.pt`; una carga incompleta produce inferencia incorrecta sin error evidente.
- Licencia MIT: permite uso comercial, pero no se ofrece garantía ni soporte del autor.
- El checkpoint es el paso 95.000 de 100.000; no es el modelo final del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/DaojiePENG/cloudedgevla-libero-spatial-object-goal-10
- Modelo base OpenVLA-7B: https://huggingface.co/openvla/openvla-7b
- No se han encontrado en la información proporcionada enlaces al artículo, blog, repositorio de código o demos de CloudEdgeVLA.
