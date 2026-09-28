# ngdghfdc/head-cons-gold

## Resumen

head-cons-gold es un modelo de decisión afinado (fine-tune) por el usuario ngdghfdc a partir del modelo base [`convaiinnovations/laya`](https://huggingface.co/convaiinnovations/laya), publicado bajo licencia Apache-2.0. Su unico cometido declarado es auditar la consistencia entre una respuesta y la marca o puntuacion asignada, clasificando el par como `consistent` o `inconsistent`. Segun la model card, realiza esta tarea en una sola pasada de encoder, con latencias del orden de milisegundos en GPU.

El modelo es un fine-tune completo (no un adaptador) de aproximadamente 421,3 millones de parametros, lo que lo situa en la gama media-baja y lo hace apto para despliegue en hardware modesto. Se enmarca en el ecosistema de la libreria `laya` y se distribuye en formato `safetensors`, sin pickle ni ejecucion de codigo al cargar. Est aquipado con cabezas de decision (tags `decision-model` y `routing`), pensadas para actuar como capa de senalizacion o enrutado dentro de un sistema mayor, no como juez final.

Su relevancia actual es acotada pero clara: propone un componente ligero y especializado para automatizar la verificacion de coherencia en flujos de correccion (el tag `examflow` apunta a un pipeline de evaluacion de examenes). No obstante, el propio autor advierte que las cifras de evaluacion provienen de datos sinteticos y que las temperaturas de confianza no estan calibradas de serie, por lo que debe tratarse como un prototipo de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de `convaiinnovations/laya`; la model card menciona una "single encoder pass" (arquitectura exacta no disponible) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en `safetensors`; el tamano del repo, 1,7 GB, es compatible con fp32: 421,3 M x 4 bytes ~ 1,68 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `convaiinnovations/laya` (Apache-2.0) y se ha sometido a un fine-tune completo durante 3 epocas, con learning rate 2e-5, tamano de batch 8 y precision bf16. La arquitectura concreta de la red no se detalla en la informacion proporcionada; la model card unicamente indica que la inferencia se resuelve en una sola pasada de encoder, lo que sugiere un modelo de tipo encoder para clasificacion o decision, coherente con los tags `decision-model` y `routing`. No se especifica el numero de capas, dimensiones ocultas ni el mecanismo de atencion empleado.

El entrenamiento, segun el autor, se realizo integramente en dos GPU T4 de Kaggle con coste cero. El conjunto de datos consta de 2.000 casos de "verdad de construccion" (gold construction-truth), que incluyen trampas de parafraseo y de rubrica, sin solapamiento con el conjunto de evaluacion. Para evitar el colapso por prior, se aplicaron dos medidas: barajado del orden de las opciones por muestra y tres variantes de instruccion. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. Como innovacion destacable, la model card subraya la decodificacion en una sola pasada y el uso de cabezas de decision con confianza (temperaturas por cabeza), si bien estas requieren recalibrado antes de usarse.

## Capacidades

- Clasificacion binaria de consistencia: determina si un par respuesta-marca es `consistent` o `inconsistent`.
- Auditoria de coherencia en correccion de examenes: detecta desajustes entre la respuesta de un alumno y la puntuacion o marca asignada.
- Modo decision/routing: actua como capa de senalizacion que deriva el caso a un paso posterior, con abstencion por debajo de un umbral tau.
- Inferencia de baja latencia: una unica pasada de encoder, del orden de milisegundos en GPU.
- Salida con puntuacion de confianza por cabeza (sujeta a recalibrado de temperatura).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia; el modelo se describe como componente de enrutado dentro de un agente mayor.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Auditoria de correccion de examenes tipo test: dado un par de respuesta del alumno y opcion marcada, el modelo verifica si la marca es coherente con la respuesta, en una sola pasada y con latencia de milisegundos, lo que permite procesar lotes grandes de examenes.
- Deteccion de errores de transcripcion o de volcado de notas: en pipelines donde se digitalizan puntuaciones manualmente, el modelo senala pares sospechosos para revision humana.
- Capa de senalizacion en un sistema de grading mayor: se coloca delante de un corrector mas costoso y solo escala los casos marcados como `inconsistent` o con baja confianza, reduciendo coste computacional.
- Control de calidad de rúbricas: al incluir trampas de rubrica en el entrenamiento, puede usarse para detectar incoherencias entre criterios y marcas en conjuntos de evaluacion.
- Filtrado previo de datos de entrenamiento: auditar pares respuesta-etiqueta generados sinteticamente para descartar ejemplos inconsistentes antes de reentrenar otros modelos.
- Prototipado de investigacion en enrutado de decisiones: su tamano (421 M) y su licencia permisiva permiten experimentar con cabezas de decision y calibracion de confianza sin grandes recursos.
- Modulo de anonimizacion de decisiones en demo: dado su bajo requisito de hardware, puede desplegarse en entornos sin GPU dedicada para demostraciones internas.

## Benchmarks y rendimiento

La unica evaluacion reportada es un conjunto de evaluacion sintetico reservado (held-out), con n = 120, en el que el modelo obtiene una puntuacion de 1,0000 frente al heuristico de referencia, que obtiene 0,892 (una mejora de +10,8 puntos porcentuales).

| Evaluacion | Conjunto | Metrica | head-cons-gold | Heuristico |
|---|---|---|---|---|
| Held-out sintetico | n = 120 | Precision (accuracy) | 1,0000 | 0,892 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor advierte que esta cifra proviene de una distribucion sintetica y demuestra la viabilidad del bucle de entrenamiento, no la precision en datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 421,3 M de parametros): ~1,68 GB en fp32, ~0,84 GB en fp16/bf16, ~0,42 GB en int8 y ~0,21 GB en int4. Estas cifras corresponden solo al peso del modelo y no incluyen activaciones ni overhead del runtime.
- El tamano del repositorio (1,7 GB) es compatible con pesos en fp32, aunque la informacion no confirma el tipo de dato almacenado.
- GPU recomendadas: dada la baja huella de memoria, cabe en practicamente cualquier GPU moderna; el entrenamiento reportado se hizo en 2 x NVIDIA T4 (Kaggle).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, 4060, 4090 o similares, e incluso en GPUs con 4 GB de VRAM en cuantizaciones bajas o fp16. No se descarta su ejecucion en CPU para cargas por lotes.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria `laya` (`from laya import Agent`). No se confirman rutas de despliegue para vLLM, llama.cpp, Ollama o TGI. El formato `safetensors` es compatible con cargadores estandar de transformers, pero la arquitectura concreta no esta documentada.
- Latencia y throughput: la model card indica latencia del orden de milisegundos por pasada en GPU, sin cifras concretas de throughput ni de latencia exacta.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (clasificadores de consistencia respuesta-marca con cabezas de decision). El unico punto de referencia directo es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| ngdghfdc/head-cons-gold | 421.293.830 | No disponible | Apache-2.0 | Fine-tune especializado en auditoria de consistencia |
| convaiinnovations/laya (base) | No disponible | No disponible | Apache-2.0 | Checkpoint de partida del fine-tune |

No disponible el resto de la comparativa por ausencia de datos publicados.

## Limitaciones y advertencias

- Distribucion sintetica: la evaluacion se realizo sobre datos sinteticos (n = 120). El propio autor indica que esto demuestra el funcionamiento del bucle de entrenamiento, no la precision en el mundo real.
- Confianza sin calibrar: la model card advierte que las temperaturas de las cabezas de decision no estan calibradas y que el checkpoint base incluye temperaturas invalidas. Es necesario recalibrar por cabeza antes de fiarse de las puntuaciones de confianza.
- No apto como juez final: debe usarse unicamente como capa de despacho o senalizacion, con abstencion por debajo de un umbral tau.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no se reporta especificamente, pero al ser un clasificador de decision acotado, el riesgo principal es la clasificacion erronea, no la generacion de texto libre.
- Limitaciones de contexto o idioma: no disponibles. No se documentan idiomas soportados ni longitud de contexto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `convaiinnovations/laya` del que deriva.
- Madurez: el modelo acumula 0 descargas y 0 "likes" en HuggingFace en la fecha de los datos, y no se documenta pipeline ni validacion externa. Debe tratarse como prototipo de investigacion.
- Datos de la ficha con fecha de creacion y actualizacion del 27 de septiembre de 2026, segun el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngdghfdc/head-cons-gold
- Modelo base: https://huggingface.co/convaiinnovations/laya
