# HenryYHW/VLAlert

## Resumen

VLAlert es un adaptador LoRA (PEFT) para alerta adaptativa de conductor basado en modelos de vision-lenguaje. Lo publica el autor HenryYHW bajo licencia Apache 2.0 y se apoya en el modelo base Qwen/Qwen3-VL-4B-Instruct, un transformer vision-lenguaje multimodal de aproximadamente 4.000 millones de parametros. El modelo resuelve el problema de decidir cuando emitir una alerta al conductor en funcion de la observacion del entorno y del comportamiento al volante, en lugar de alertar de forma fija o preprogramada.

El proyecto se enmarca en la investigacion "Observe Before You Alert: Adaptive Driver Alerting with Vision-Language Models" (arXiv 2609.08130) y esta vinculado al laboratorio Motif Lab, en sus lineas de IA para movilidad y tecnologias de vehiculo. La relevancia actual viene de la interseccion entre conduccion autonoma, sistemas ADAS y modelos multimodales capaces de procesar video, lo que permite construir politicas de alerta entrenables en lugar de heuristicas rigidas.

El repositorio pesa 2,0 GB, esta etiquetado como `video-classification` y su acceso esta restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargarlo. No se han publicado cifras de benchmarks en la informacion disponible, aunque el paper reporta validacion cruzada sobre dos conjuntos no vistos: ADAS-TO y un conjunto sintetizado en CARLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-lenguaje; modelo base Qwen/Qwen3-VL-4B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-4B-Instruct tiene aproximadamente 4.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se distribuyen en safetensors y la cuantizacion del modelo base no se especifica |
| Idiomas soportados | No disponible a nivel de modelo; el dataset asociado declara unicamente ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

VLAlert no es un modelo entrenado desde cero, sino un adaptador LoRA sobre Qwen3-VL-4B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. Este enfoque reduce el coste de entrenamiento y de almacenamiento (el repositorio ocupa 2,0 GB) y permite reutilizar las capacidades de percepcion y razonamiento del modelo base, especializandolas hacia la tarea de alerta al conductor.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El dataset asociado, HenryYHW/VLAlert, tiene entre 100.000 y 1.000.000 de muestras, esta en ingles y se etiqueta con terminos como `driving`, `safety`, `accident-anticipation`, `driver-alert`, `vlm` y `pomdp`. La presencia de la etiqueta `pomdp` (proceso de decision de Markov parcialmente observable) y de componentes tipo "critic" en los ficheros del dataset (corpus ADAS-TO-Critic, con 1.051 clips en mp4 y 1,6 GB) sugiere un planteamiento de decision secuencial con evaluacion de politica, aunque los detalles concretos del procedimiento de entrenamiento no estan confirmados en la informacion proporcionada. La formulacion del paper, "observar antes de alertar", apunta a que el modelo acumula evidencia antes de disparar una alerta.

## Capacidades

- Clasificacion y analisis de video orientado a seguridad vial y anticipacion de accidentes.
- Razonamiento vision-lenguaje sobre secuencias de video y contexto de conduccion.
- Decision adaptativa de alerta al conductor, en lugar de umbrales fijos.
- Procesamiento multimodal de imagenes y texto heredado del modelo base Qwen3-VL-4B-Instruct.
- Prediccion sobre series temporales asociada a la evolucion de la escena (el dataset incluye la tarea `Time Series Forecasting`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el dataset asociado es solo en ingles.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Alerta temprana en sistemas ADAS: el modelo observa la escena antes de decidir si emite un aviso, lo que encaja con el objetivo del paper de evitar alertas prematuras o innecesarias que degradan la confianza del conductor.
- Evaluacion de politica de alerta en simulacion: al haberse validado en un conjunto sintetizado en CARLA, puede usarse para probar estrategias de alerta en entornos simulados antes de desplegarlas en vehiculo real.
- Monitorizacion de flotas: analisis de clips de video de vehiculos comerciales para detectar patrones de riesgo y priorizar revision humana sobre los eventos mas criticos.
- Anticipacion de accidentes en video: la tarea `accident-anticipation` del dataset apunta a detectar situaciones proclives a colision con margen suficiente para intervenir.
- Comparacion con acciones humanas de toma de control: la validacion sobre ADAS-TO comprueba si el modelo se alinea con las acciones de takeover que realizan conductores humanos antes de un accidente, util para calibrar sistemas de handover.
- Investigacion en conduccion automatizada: uso como componente de percepcion-decision en arquitecturas mas amplias, aprovechando que es un adaptador ligero sobre un modelo base ya entrenado.
- Analisis retrospectivo de incidentes: procesamiento por lotes de grabaciones para reconstruir que informacion estaba disponible antes de un evento y si un sistema de alerta deberia haber actuado.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El paper describe la validacion de VLAlert frente a dos conjuntos no vistos (ADAS-TO y un conjunto sintetizado en CARLA desde una vista de carretera distinta, en el apendice A), pero no se proporcionan las cifras en la informacion consultada.

## Requisitos de hardware

Nota: las cifras de VRAM son estimaciones basadas en el tamano del modelo base (aproximadamente 4.000 millones de parametros) y en el coste adicional de procesar multiples fotogramas de video. No proceden de mediciones publicadas del modelo.

- VRAM estimada en precision completa (FP16): en torno a 8-10 GB solo para pesos del modelo base, mas activaciones. Con video de muchos fotogramas y alta resolucion, el consumo puede situarse en 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 6-8 GB, mas activaciones.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3-4 GB, mas activaciones.
- GPU recomendadas: para FP16 con video, A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: si, con matices. RTX 3090 y RTX 4090 (24 GB) son suficientes en FP16 para configuraciones moderadas de video; RTX 4080 o 4070 Ti (16 GB) requieren cuantizacion y limitar el numero de fotogramas; RTX 3060 (12 GB) es viable en 4 bits.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador LoRA; vLLM y TGI para servicio con el modelo base fusionado; llama.cpp u Ollama si se generan pesos GGUF (no se distribuyen en el repositorio, que solo contiene el adaptador).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLAlert (este modelo) | Adaptador sobre Qwen3-VL-4B-Instruct (~4B) | No disponible | Clasificacion de video y alerta al conductor | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | ~4B | No disponible en la informacion proporcionada | Vision-lenguaje general | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros adaptadores VLM para alerta de conductor | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

No se han identificado en la informacion proporcionada modelos abiertos directamente comparables en la tarea especifica de alerta adaptativa de conductor con vision-lenguaje.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta marcado como gated en HuggingFace y requiere aceptar condiciones, lo que puede complicar su uso automatizado en pipelines.
- Ausencia de benchmarks publicos: no hay cifras verificables de rendimiento en la informacion disponible, por lo que no es posible estimar su calidad relativa frente a alternativas.
- Idiomas: el dataset asociado es unicamente en ingles; no se documenta soporte multilingue y el comportamiento en otros idiomas es desconocido.
- Riesgo de alucinacion: al ser un modelo de lenguaje subyacente, puede generar descripciones o decisiones no fundamentadas en la evidencia visual; en un dominio de seguridad vial esto es critico.
- Dominio restringido: el modelo esta especializado en conduccion y alerta; su uso fuera de ese ambito probablemente degrade respecto al modelo base.
- Sesgos: no se documenta analisis de sesgos en la informacion disponible. Los sesgos pueden provenir tanto del dataset de conduccion como del modelo base.
- Limitaciones de licencia: el adaptador es Apache 2.0, pero es necesario verificar la licencia del modelo base Qwen3-VL-4B-Instruct y las condiciones de uso del dataset (cc-by-4.0) antes de un despliegue comercial.
- Caveat para produccion: la validacion reportada incluye entornos simulados (CARLA); el salto a conduccion real exige validacion adicional y supervision humana.
- Falta de informacion sobre cuantizaciones y formatos alternativos: no se distribuyen pesos GGUF ni otras variantes, lo que limita las opciones de despliegue en hardware modesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HenryYHW/VLAlert
- Dataset en HuggingFace: https://huggingface.co/datasets/HenryYHW/VLAlert
- Ficheros del dataset: https://huggingface.co/datasets/HenryYHW/VLAlert/tree/main
- Paper (arXiv, pagina de resumen): https://arxiv.org/abs/2609.08130
- Paper (version HTML): https://arxiv.org/html/2609.08130
- Pagina del proyecto en Motif Lab: https://www.motiflab.net/projects/vlalert/
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
