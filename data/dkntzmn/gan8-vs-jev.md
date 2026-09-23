# DKNTZMN/gan8-vs-jev

## Resumen

GAN8 vs Jev-interface es un conjunto de pesos de experimento de mecanismo publicado por el usuario DKNTZMN, no un modelo de lenguaje convencional. El repositorio contiene tres ficheros de pesos en formato PyTorch de tamano muy reducido (3,5 KB, 2,6 KB y 9,6 KB): un generador GAN8 de ocho "frames" abstractos y dos cabezas de decision estilo Jev de paso unico (una lineal y otra MLP de dos capas). El autor los describe explicitamente como pesos de experimento de mecanismo, sin vinculacion con TypeSafe AI ni con el modelo alojado `jev-latest`.

El problema que aborda es la decision tipada ("typed-decision") sobre vectores de caracteristicas, en el marco de lo que el autor etiqueta como "system-one" y "judgment". La regla de inferencia publicada es `path_score = log p_frame(MAP) + 0,35*|logit|`, con seleccion por argmax y sin discriminador. Se compara el comportamiento de distintos mecanismos de juicio sobre bancos de evaluacion controlados, incluyendo Chain-of-Thought (CoT), GAN2, vote8 y cabezas Jev.

Su relevancia es fundamentalmente de investigacion: sirve como artefacto reproducible para estudiar calibracion, seleccion de frames y el contraste entre mecanismos de un solo paso y esquemas con deliberacion. No dispone de capacidades generativas de texto, contexto conversacional ni soporte multilingue, y el propio autor lo enmarca como experimento y no como modelo listo para produccion.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema de decisión multi-generador con 8 "frames" abstractos (GAN8) más dos cabezas Jev de paso único: lineal y MLP de 2 capas; no es un transformer ni un modelo generativo de texto |
| Parámetros totales | no disponible (los ficheros de pesos ocupan 3,5 KB, 2,6 KB y 9,6 KB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el sistema opera sobre diccionarios de características numéricas, no sobre secuencias de texto |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt`): `gan8.pt`, `jev_linear.pt`, `jev_mlp.pt`; más `config.json`, `scores.json`, `infer.py`, `gan8_scale_vs_jev.py` |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. Por un lado, GAN8 es un generador de ocho frames abstractos (etiquetado en los tags como "multi-generator"), que produce puntuaciones por frame sobre un vector de características de entrada. Por otro, las cabezas Jev de paso único (lineal y MLP de dos capas, esta última bajo la etiqueta "noul") generan una decision en una sola pasada. La decision final se obtiene mediante la regla `path_score = log p_frame(MAP) + 0,35*|logit|`, tomando el argmax; el autor indica explicitamente que no se emplea discriminador.

El entrenamiento se realizo sobre lo que el autor denomina un "controlled judgment bank", con los datos tabulares publicados en el dataset `DKNTZMN/gan8-mvp-scale`. Los bancos de evaluacion descritos son: un banco lineal original de 34 items con 40 repeticiones, un banco "hard no-token" de 54 items y un checkpoint final evaluado sobre 314 items con particiones IID y holdout "XOR+camo". No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Decisión tipada sobre vectores de características numéricas, con selección de frame mediante argmax.
- Clasificación binaria o multiclase en bancos de juicio controlados (por ejemplo, `form_valid`, `illicit_conversion`, `narrative_fit`).
- Estimación de confianza con métricas de calibración publicadas (Brier score y ECE) para los distintos mecanismos.
- Comparación de mecanismos internos: GAN8 (token y argmax), vote8, GAN2, cabeza Jev lineal y cabeza Jev MLP.
- Modo "system-one" de paso único, contrastado con esquemas de deliberación tipo CoT.
- No dispone de generación de texto, razonamiento libre, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de la comparación con CoT.
- No se documentan capacidades multilingües.
- No se documentan capacidades especiales como modo thinking, audio o visión.

## Casos de uso

- Investigación en calibración de decisiones: el modelo permite estudiar la relacion entre precision y calibracion mediante Brier y ECE sobre bancos controlados, util para quienes investigan estimacion de incertidumbre.
- Baseline de mecanismos de juicio: sirve como referencia reproducible frente a CoT, GAN2 y vote8 en experimentos academicos de decision tipada, con codigo de entrenamiento y evaluacion incluido (`gan8_scale_vs_jev.py`).
- Estudio de cabezas de decision: la comparacion entre la cabeza Jev lineal y la MLP de dos capas permite analizar el impacto de la capacidad de la cabeza en tareas de juicio con pocos items.
- Replicacion de experimentos de "system-one": el artefacto esta pensado para reproducir la hipotesis de que un mecanismo de paso unico puede igualar o superar esquemas deliberativos en ciertos bancos, algo relevante para la literatura sobre razonamiento rapido frente a lento.
- Docencia y prototipado rapido: al ocupar unos pocos kilobytes y no requerir GPU, puede integrarse en cuadernos didacticos sobre decisiones con caracteristicas tabulares sin coste de infraestructura.
- Auditoria de datasets de juicio: la evaluacion sobre particiones IID y holdout XOR+camo permite detectar atajos y sesgos de generalizacion en bancos de decision etica o normativa.
- Pruebas de robustez ante entradas adversarias: la caida de rendimiento en la particion holdout XOR+camo lo convierte en un banco de pruebas para medir fragilidad de mecanismos de decision.

## Benchmarks y rendimiento

Banco lineal original (34 items × 40 repeticiones):

| Método | Precisión |
|---|---|
| CoT | 57,13 % |
| GAN2 | 55,51 % |
| GAN8 token | 93,01 % |
| vote8 | 93,53 % |
| Jev-like lineal | 94,12 % |

Banco "hard no-token" (54 items):

| Método | Todos | Hard | Brier | ECE |
|---|---|---|---|---|
| Jev lineal | 70,4 % | 65,2 % | 0,210 | 0,253 |
| GAN8 token | 90,3 % | 88,6 % | 0,087 | 0,076 |
| GAN8 argmax | 88,9 % | 89,1 % | 0,101 | 0,090 |
| Jev + GAN8 | 81,5 % | 78,3 % | 0,162 | 0,156 |

Checkpoint de este repositorio (314 items):

| Split | n | Jev hand | Jev lineal | Jev MLP | GAN8 |
|---|---|---|---|---|---|
| IID test | 84 | 91,7 % | 90,5 % | 95,2 % | 98,8 % |
| Holdout XOR+camo | 75 | 68,0 % | 73,3 % | 74,7 % | 72,0 % |
| Todos los test | 159 | 80,5 % | 82,4 % | 85,5 % | 86,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; los tres ficheros de pesos suman menos de 16 KB, por lo que la inferencia cabe en memoria principal sin GPU.
- GPU recomendadas: ninguna. El sistema se ejecuta en CPU; no requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no aplica, ya que no necesita acelerador grafico.
- Opciones de despliegue: PyTorch con el script `infer.py` proporcionado, descargando los pesos mediante `huggingface_hub.hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dado el tamano de los pesos, se espera una latencia de microsegundos a milisegundos en CPU, aunque el autor no publica mediciones.

## Comparativa con modelos similares

En la informacion disponible no se identifican modelos externos de la misma categoria. Las unicas alternativas comparables son los propios mecanismos evaluados en el experimento, todos incluidos dentro del mismo estudio:

| Mecanismo | Naturaleza | Precisión en banco lineal | Precisión en hard no-token | Licencia |
|---|---|---|---|---|
| GAN8 (token) | Multi-generador de 8 frames | 93,01 % | 90,3 % | apache-2.0 |
| Jev lineal | Cabeza de paso único lineal | 94,12 % | 70,4 % | apache-2.0 |
| Jev MLP | Cabeza de paso único MLP de 2 capas | no disponible | no disponible | apache-2.0 |
| vote8 | Esquema de voto | 93,53 % | no disponible | apache-2.0 |
| GAN2 | Multi-generador de 2 frames | 55,51 % | no disponible | apache-2.0 |
| CoT | Deliberación encadenada | 57,13 % | no disponible | no aplica |

Comparacion con modelos de lenguaje de proposito general: no disponible, ya que este artefacto no es un modelo de lenguaje y no se publican metricas comparables tipo MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- No es el modelo alojado `jev-latest` ni esta afiliado a TypeSafe AI; el autor lo indica de forma explicita. No debe presentarse como sustituto de ese modelo.
- Es un experimento de mecanismo, no un modelo listo para produccion; no se documentan garantias de robustez fuera de los bancos evaluados.
- Los bancos de evaluacion son pequenos (34 items, 54 items y 314 items), por lo que las cifras tienen intervalos de confianza amplios y pueden no generalizar.
- Existe una caida notable de rendimiento en la particion holdout XOR+camo (68,0 % a 74,7 %), lo que indica fragilidad ante distribuciones fuera de la IID.
- El sistema Jev + GAN8 rinde por debajo de cada componente por separado en el banco hard no-token (81,5 % frente a 90,3 % de GAN8 token), un caveat relevante para quien combine mecanismos.
- No dispone de capacidades linguisticas, de generacion de texto ni de contexto conversacional; no puede usarse para tareas de lenguaje natural.
- No se documentan sesgos conocidos, pero al tratarse de bancos de juicio normativo y etico, cualquier uso en ese dominio requiere auditoria propia.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no obstante, el caracter experimental del artefacto desaconseja su uso en produccion.
- No se documentan los idiomas soportados, los tipos de cuantizacion ni el recuento de parametros, lo que limita la reproducibilidad del analisis de coste.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el equivalente es la sobreconfianza del modelo, reflejada en los valores de ECE publicados (0,253 para la cabeza Jev lineal en el banco hard no-token).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DKNTZMN/gan8-vs-jev
- Space asociado: https://huggingface.co/spaces/DKNTZMN/gan8-vs-jev
- Dataset de tablas: https://huggingface.co/datasets/DKNTZMN/gan8-mvp-scale
- Pesos GAN8: https://huggingface.co/DKNTZMN/gan8-vs-jev/resolve/main/gan8.pt
- Cabeza Jev lineal: https://huggingface.co/DKNTZMN/gan8-vs-jev/resolve/main/jev_linear.pt
- Cabeza Jev MLP: https://huggingface.co/DKNTZMN/gan8-vs-jev/resolve/main/jev_mlp.pt
- Script de inferencia: https://huggingface.co/DKNTZMN/gan8-vs-jev/blob/main/infer.py
- Codigo de entrenamiento y evaluacion: https://huggingface.co/DKNTZMN/gan8-vs-jev/blob/main/gan8_scale_vs_jev.py
