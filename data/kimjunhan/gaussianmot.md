# kimjunhan/GaussianMOT

## Resumen

GaussianMOT es un checkpoint de investigación para detección 3D de objetos y seguimiento multiobjeto (MOT) conjuntos sobre una representación BEV gaussiana construida a partir de la fusión de cámaras y radar. Lo desarrolla el usuario kimjunhan y se publica bajo licencia Apache 2.0. El modelo aborda el problema clásico de percepción en conducción autónoma: detectar y mantener la identidad de los objetos (vehículos, peatones, etc.) en el espacio 3D a partir de sensores heterogéneos, empleando *Gaussian splatting* como mecanismo de codificación del espacio BEV en lugar de las rejillas densas habituales.

El repositorio contiene únicamente los pesos del checkpoint correspondiente al final de la época 24 de entrenamiento (fichero `gaussianmot_epoch23.ckpt`, 368 MB, `state_dict` sin estado del optimizador). Se entrenó y evalúa sobre el dataset nuScenes, con 6 cámaras y 5 radares como entrada a resolución 448×800.

Es relevante ahora porque explora una línea emergente: sustituir las rejillas BEV discretas por primitivas gaussianas diferenciables para la fusión multimodal, lo que puede reducir el coste computacional y mejorar la resolución espacial efectiva. No obstante, se trata de un artefacto de investigación con métricas modestas (mAP 35.0, NDS 42.5 en nuScenes val) y sin pipeline de HuggingFace asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detección y tracking 3D sobre BEV gaussiano con fusión cámara-radar (Gaussian splatting) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepción, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint `.ckpt` (PyTorch, `state_dict` únicamente) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de imágenes multi-cámara (6 cámaras) con retornos de radar (5 radares) para construir una representación BEV basada en gaussianas, sobre la cual se realizan de forma conjunta las tareas de detección 3D y asociación temporal para tracking. El uso de *Gaussian splatting* implica primitivas gaussianas con parámetros posicionales y de covarianza que se proyectan y densifican en el plano BEV. Durante la inferencia, el proceso de densificación aplica desplazamientos aleatorios, por lo que los resultados dependen de la semilla (`eval_seed`, por defecto 0) y pueden variar en el último dígito.

El entrenamiento se realizó sobre nuScenes durante al menos 24 épocas; el checkpoint publicado corresponde al final de la época 24. No se especifican en la información disponible el número de tokens ni la composición exacta del dataset más allá de nuScenes, ni si se emplearon técnicas de refinamiento como RLHF/DPO (no aplicables en este dominio). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Detección 3D de objetos en escenas de conducción (cajas 3D con posición, dimensiones y orientación).
- Seguimiento multiobjeto con asociación de identidades a lo largo del tiempo (métricas AMOTA, AMOTP, ID-S).
- Fusión multimodal cámara-radar sobre una representación BEV gaussiana.
- Estimación de velocidad y atributos (mAVE, mAAE).
- Procesamiento de entrada a resolución 448×800 con 6 cámaras y 5 radares.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del dominio de percepción 3D.

## Casos de uso

- Percepción en vehículos autónomos: el modelo puede integrarse en la pila de percepción para detectar y seguir vehículos y peatones en tiempo real a partir de cámaras y radar, aprovechando la fusión multimodal para robustez ante condiciones de iluminación adversas.
- Investigación en representaciones BEV: sirve como línea base reproducible para comparar rejillas BEV densas frente a BEV gaussiano en tareas de detección y tracking, con métricas públicas sobre nuScenes val.
- Desarrollo de sistemas ADAS: puede emplearse para prototipar funciones de alerta de colisión y seguimiento de objetos cercanos, usando la salida de cajas 3D y velocidades estimadas.
- Evaluación de fusión cámara-radar: útil para estudiar el impacto del radar en la precisión de localización (mATE 0.539) y velocidad (mAVE 0.511) frente a configuraciones solo-cámara.
- Benchmarking de tracking multiobjeto: con AMOTA 0.348 e ID-S 897, permite comparar algoritmos de asociación temporal y estudiar la degradación de identidad en escenas densas.
- Análisis de escenarios nuScenes: al estar entrenado y evaluado sobre nuScenes, facilita experimentos reproducibles sobre secuencias urbanas concretas y análisis de errores por clase de objeto.
- Docencia y formación: como checkpoint ligero (368 MB) con instrucciones de evaluación claras, es adecuado para prácticas sobre percepción 3D y fusión de sensores en entornos con una sola GPU.

## Benchmarks y rendimiento

Resultados en nuScenes val (semilla de inferencia 0), según la model card:

| Detección | Valor | Tracking | Valor |
|---|---|---|---|
| mAP | 35.0 | AMOTA | 0.348 |
| NDS | 42.5 | AMOTP | 1.31 |
| mATE | 0.539 | Recall | 0.411 |
| mASE | 0.307 | ID-S | 897 |
| mAOE | 0.681 | | |
| mAVE | 0.511 | | |
| mAAE | 0.465 | | |

Rendimiento de inferencia: 6.5 FPS en una RTX 3090 con batch size 1. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 368 MB en disco y el modelo requiere cargar además el codificador de imágenes y el pipeline de evaluación, por lo que se recomienda al menos 8-12 GB de VRAM (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: RTX 3090 (medida reportada de 6.5 FPS); se espera funcionamiento en GPUs consumer de gama alta (RTX 4090, RTX 3090) y GPUs de datacenter (A100, H100) con mayor throughput, aunque no se publican cifras para estas.
- Cabe en GPU consumer: sí, al menos en RTX 3090 según la medición oficial; en GPUs con menos VRAM no está confirmado.
- Opciones de despliegue: evaluación mediante `tools/evaluate.py` del repositorio oficial de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 6.5 FPS con batch size 1 en RTX 3090 (aproximadamente 154 ms por frame).

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. No obstante, por categoría (detección 3D y tracking con fusión cámara-radar sobre nuScenes) cabría comparar con propuestas como BEVFormer, BEVFusion o CenterPoint, pero no se han incluido sus métricas en la documentación disponible, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | mAP (nuScenes val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaussianMOT | no disponible | no aplica | 35.0 | Apache 2.0 | HuggingFace + GitHub |
| Alternativas (BEVFormer, BEVFusion, CenterPoint) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Métricas modestas: mAP 35.0 y NDS 42.5 en nuScenes val están por debajo de los mejores modelos publicados en detección 3D, lo que limita su uso en producción sin mejoras.
- Solo checkpoint: el repositorio contiene únicamente `state_dict` sin estado del optimizador, por lo que no permite reanudar el entrenamiento directamente.
- Dependencia de la semilla: la densificación gaussiana introduce desplazamientos aleatorios en inferencia, de modo que los resultados varían en el último dígito según `eval_seed`; la reproducibilidad exacta requiere fijar la semilla.
- Dominio restringido: entrenado exclusivamente con nuScenes (escenas urbanas de Singapur y Boston), por lo que la generalización a otras ciudades, condiciones meteorológicas o sensores distintos no está validada.
- Sin pipeline de HuggingFace ni idiomas declarados: no es un modelo de lenguaje y no ofrece API estándar de `transformers`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y detecciones espurias en escenas con oclusión o radar ruidoso.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos derivados de la distribución de clases y geografía de nuScenes.
- Licencia Apache 2.0: permite uso comercial con atribución, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin datos de cuantización ni de despliegue en entornos de bajos recursos, lo que dificulta su integración en sistemas embebidos.

## Enlaces

- HuggingFace: https://huggingface.co/kimjunhan/GaussianMOT
- Repositorio de código: https://github.com/KimJunHan/GaussianMOT
- Dataset nuScenes: https://www.nuscenes.org/
