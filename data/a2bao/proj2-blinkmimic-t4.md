# A2bao/proj2-blinkmimic-t4

## Resumen

BlinkMimic-T4 G1 Motion Tracking Checkpoints es un conjunto de pesos de política de control entrenados para el seguimiento de movimiento (*motion tracking*) de un robot humanoide Unitree G1 en simulación. Lo publica el usuario A2bao en Hugging Face y se produce adaptando la pila de entrenamiento del método BlinkMimic a un entorno de Kaggle con dos GPU NVIDIA Tesla T4. El autor lo describe explícitamente como un artefacto de reproducción y adaptación, no como un algoritmo de control nuevo.

El modelo resuelve el problema de hacer que una política neuronal reproduzca trayectorias de movimiento retargetizadas sobre el esqueleto del G1 dentro de un simulador (MuJoCo/mjlab con la pila BlinkMimic fijada). Se distribuyen dos checkpoints con distinta capacidad: uno con anchos de política 1024-512-256 y otro con 2048-1024-512-256, ambos entrenados durante 3.500 actualizaciones con PyTorch DDP y FP16 sobre 2 × T4.

Su relevancia es acotada y de carácter reproducible: sirve como referencia para quienes quieran replicar el pipeline de BlinkMimic en hardware de gama baja (T4 de 16 GB) y comparar el efecto de escalar anchos de red y número de entornos por GPU. No está pensado para control de robots físicos ni se aportan validaciones de sim-to-real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para seguimiento de movimiento (pila BlinkMimic); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; entrenamiento e inferencia en FP16 |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | other (weights sin licencia clara; datos LAFAN1 CC BY-NC-ND 4.0 y assets BSD-3-Clause) |
| Formato de pesos | checkpoints de PyTorch (pytorch); formato concreto de fichero no disponible |
| Tamaño del repositorio | 4,8 GB |
| Entorno de entrenamiento | 2 × NVIDIA Tesla T4, PyTorch DDP, FP16 con static loss scale 256 |
| Actualizaciones de entrenamiento | 3.500 por run |
| Entornos por GPU | 2.048 (run base) / 4.096 (run de mayor capacidad) |
| Anchuras de política | 1024-512-256 / 2048-1024-512-256 |
| VRAM pico por GPU | 5.879 MiB / 12.589 MiB |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna exacta de la política (número de capas, tipo de encoder de observaciones, mecanismo de atención o estructura del *world model*). Lo que sí se explicita es que se emplea la pila de entrenamiento de BlinkMimic (commit `d264658d6c9ce61fb52f9f0f8985a369f3ccc409` del repositorio `fuyichen0725/blinkmimic`) adaptada a un entorno de Kaggle con dos T4. El entrenamiento usa PyTorch DDP con precisión FP16 y *static loss scale* de 256; el run de mayor capacidad activa además `torch.compile` con `compile_more` desactivado.

Se publican dos configuraciones diferenciadas por capacidad: la primera con anchos 1024-512-256, 2.048 entornos por GPU y batches de política/mundo de 1.024/1.024, que alcanza 5.879 MiB de VRAM pico por GPU; la segunda con anchos 2048-1024-512-256, 4.096 entornos por GPU y batches 3.072/2.048, que llega a 12.589 MiB por GPU. Ambas se entrenan durante 3.500 actualizaciones. Los datos de movimiento proceden de LAFAN1 y de una derivación retargetizada al Unitree G1; los CSV de movimiento no se incluyen en el repositorio. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Seguimiento de movimiento retargetizado sobre el robot humanoide Unitree G1 en simulación (MuJoCo/mjlab).
- Control de cuerpo completo con salida de posiciones articulares y raíz, evaluado mediante métricas de error de posición y orientación.
- Reproducción de 40 clips de movimiento procedentes de LAFAN1 retargetizados al G1, con cero clips fallidos en la evaluación determinista de ambos checkpoints.
- Dos perfiles de capacidad (base y alta) que permiten comparar el efecto del escalado de anchos y de entornos por GPU.
- Entrenamiento distribuido reproducible en hardware de consumo/prosumer (2 × T4) con DDP y FP16.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo *thinking*, visión ni audio.

## Casos de uso

- Reproducción de experimentos de BlinkMimic en hardware limitado: el checkpoint y la pila fijada permiten replicar el pipeline completo en dos T4, útil para laboratorios sin acceso a A100/H100.
- Estudio del escalado de políticas de control: comparar los dos runs (anchuras 1024-512-256 frente a 2048-1024-512-256) para medir la ganancia marginal en retorno normalizado y error de posición al duplicar capacidad.
- Evaluación comparativa de métricas de seguimiento: usar los JSON/Markdown de `eval/` como referencia para contrastar nuevas variantes del pipeline sobre los mismos 40 clips de LAFAN1.
- Docencia e investigación en robótica humanoide: servir como ejemplo reproducible de entrenamiento de políticas con DDP, FP16 y `torch.compile` sobre un robot G1 simulado.
- Análisis de eficiencia de memoria: los picos de VRAM documentados (5.879 MiB y 12.589 MiB por GPU) permiten calibrar presupuestos de memoria para experimentos similares en T4.
- Base para experimentos de sim-to-real controlados: aunque el autor no valida transferencia, el checkpoint puede emplearse como punto de partida en estudios internos de robustez antes de cualquier despliegue físico.
- Referencia para auditoría de licencias en datasets de movimiento: el manifiesto de datos y las notas de derechos sirven como caso práctico de las restricciones de LAFAN1 (CC BY-NC-ND 4.0) en derivados.

## Benchmarks y rendimiento

Evaluación determinista sobre 40 movimientos LAFAN1 retargetizados al G1:

| Métrica | Baseline (1024-512-256) | Mayor capacidad (2048-1024-512-256) |
|---|---:|---:|
| Retorno normalizado ↑ | 0,8542 | 0,8762 |
| Movimientos fallidos ↓ | 0 / 40 | 0 / 40 |
| Error de posición corporal (cm) ↓ | 3,6764 | 3,3260 |
| Error de orientación corporal (grados) ↓ | 7,9559 | 7,1339 |
| Error de posición de la raíz (cm) ↓ | 70,0645 | 55,8304 |
| Error articular (grados) ↓ | 4,6720 | 4,2468 |
| Deslizamiento del pie (cm/s) ↓ | 6,8466 | 6,4244 |
| Acuerdo de contacto ↑ | 75,69 % | 77,13 % |
| Proxy de penetración (mm) ↓ | 0,0612 | 0,0530 |

No se han publicado resultados de benchmarks frente a otros modelos en la información disponible; las cifras anteriores son comparaciones internas entre los dos checkpoints del mismo proyecto.

## Requisitos de hardware

- Entrenamiento validado en 2 × NVIDIA Tesla T4 (16 GB), con picos de 5.879 MiB y 12.589 MiB por GPU según configuración.
- Inferencia: la VRAM necesaria no se documenta; por el tamaño del repositorio (4,8 GB) y el uso de FP16, se espera que quepa en GPUs consumer con al menos 8-16 GB, aunque no hay cifra oficial.
- GPUs recomendadas para reproducir el entrenamiento: Tesla T4 (configuración original); para el run de mayor capacidad conviene disponer de al menos 16 GB por GPU.
- Cabe en GPU consumer: no confirmado explícitamente, pero el entorno original son T4, que son GPUs de gama profesional de 16 GB; tarjetas como RTX 4090 (24 GB) deberían acomodar el run de mayor capacidad.
- Opciones de despliegue: la pila BlinkMimic fijada (repositorio `magickkdd/g1-mimic-t4`) sobre MuJoCo/mjlab; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno de entrenamiento | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlinkMimic-T4 G1 (este) | Política de motion tracking para Unitree G1 | 2 × T4, DDP, FP16 | Retorno 0,8542 / 0,8762; 0/40 fallos | other (weights sin aclarar; datos CC BY-NC-ND 4.0) | Hugging Face, repo 4,8 GB |
| BlinkMimic upstream (`fuyichen0725/blinkmimic`) | Implementación del método original | No disponible en la información | No disponible en la información | No disponible en la información | GitHub |
| Otras políticas de motion tracking para humanoides | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas concretas de la misma categoría (por ejemplo, políticas de seguimiento para G1 entrenadas con Isaac Gym o similares).

## Limitaciones y advertencias

- Solo validado en simulación (MuJoCo/mjlab); no hay pruebas en robot real, validación de seguridad ni transferencia sim-to-real.
- El autor indica explícitamente que los artefactos no están destinados al control directo de robots físicos.
- La generalización fuera de los 40 movimientos evaluados no está establecida.
- La licencia de los pesos es `other` y no se ha aclarado jurídicamente; los datos LAFAN1 son CC BY-NC-ND 4.0, lo que restringe uso comercial, modificación y redistribución de derivados.
- El acceso público al repositorio no otorga derechos sobre los movimientos de origen ni sobre assets de terceros.
- Los CSV de movimiento no se incluyen en el repositorio, lo que dificulta la reproducción completa sin obtener los datos por separado.
- Riesgo de alucinación y sesgos lingüísticos: no aplica, al no ser un modelo de lenguaje.
- Los vídeos de previsualización cubren solo cuatro movimientos y no deben interpretarse como agregados de los 40.
- El error de posición de la raíz es alto en términos absolutos (70,06 cm y 55,83 cm), lo que sugiere deriva acumulada en trayectorias largas.

## Enlaces

- Hugging Face: https://huggingface.co/A2bao/proj2-blinkmimic-t4
- Código del proyecto: https://github.com/magickkdd/g1-mimic-t4
- Implementación upstream de BlinkMimic: https://github.com/fuyichen0725/blinkmimic (commit `d264658d6c9ce61fb52f9f0f8985a369f3ccc409`)
- Manifiesto de datos: https://github.com/magickkdd/g1-mimic-t4/blob/main/docs/data-manifest.md
