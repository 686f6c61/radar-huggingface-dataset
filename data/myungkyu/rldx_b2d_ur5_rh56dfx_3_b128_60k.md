# Myungkyu/rldx_b2d_ur5_rh56dfx_3_b128_60k

## Resumen

`rldx_b2d_ur5_rh56dfx_3_b128_60k` es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base RLWRLD/RLDX-1-PT sobre el conjunto de datos Bench2Dex/teleopdata, en la configuración `ur5_rh56dfx_3`, que combina un brazo robótico UR5 con una mano diestra RH56DFX. El autor lo describe explícitamente como un *baseline* "vanilla", es decir, una referencia de partida para comparar ablaciones posteriores del proyecto RLDX-2.

El modelo recibe como entrada tres vistas de cámara (cabeza y muñecas izquierda y derecha), un estado articular de 14 dimensiones y una instrucción de tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos. La arquitectura subyacente, RLDX-1-PT, emplea una ventana de vídeo de longitud 4 con stride 2 y un horizonte de acción de 50 pasos. Con 6.912.896.320 parámetros (aproximadamente 6,9 mil millones), es un modelo de gran tamaño para el dominio robótico, lo que condiciona fuertemente sus requisitos de hardware.

Su relevancia es acotada pero clara: sirve como punto de referencia reproducible para investigaciones en manipulación diestra con aprendizaje por imitación, y su publicación con checkpoints intermedios (pasos 15000, 30000 y 45000) facilita el análisis de la dinámica de entrenamiento. No es un modelo de propósito general ni está pensado para despliegue conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo visión-lenguaje-acción; ventana de vídeo 4, stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parametros totales | 6.912.896.320 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de vídeo de 4 fotogramas con stride 2; horizonte de acción 50) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en lenguaje natural, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | Bench2Dex/teleopdata (exportación LeRobot del autor) |
| Entradas | Imágenes de cabeza + muñeca izquierda + muñeca derecha, estado articular 14-d, instrucción de tarea |
| Salidas | 14 objetivos articulares absolutos |
| Tamaño del repositorio | 165,9 GB |

## Arquitectura y entrenamiento

El modelo parte de RLDX-1-PT, un backbone VLA que procesa secuencias de vídeo (longitud 4, stride 2) junto con instrucciones en lenguaje natural y estado propioceptivo, y genera acciones motoras. El ajuste fino se realizó sobre la exportación LeRobot de Bench2Dex/teleopdata en la configuración `ur5_rh56dfx_3`, con demostraciones de generalización por repetición, cuatro vistas y orden articular canónico del registro. El autor indica que la configuración referencia el backbone y el tokenizador del modelo base por identificador de hub.

El entrenamiento empleó un optimizador con batch de 128 durante 60000 pasos, guardando el checkpoint final sin estado del optimizador. Dos detalles técnicos destacan: se aplicó *padding-dimension noise masking* con `action_noise_mask_dim=24` y *state dropout* de 0,5, técnicas orientadas a mejorar la robustez frente a dimensiones de acción no utilizadas y a evitar el sobreajuste al estado propioceptivo. El código empleado corresponde a RLWRLD/RLDX en el parche `myungkyu/jitter-patch` (commit 21f674b4). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones motoras de 14 dimensiones (objetivos articulares absolutos) para un brazo UR5 con mano diestra RH56DFX.
- Comprensión de instrucciones de tarea en lenguaje natural para condicionar la política de control.
- Fusión multimodal de tres vistas de cámara (cabeza, muñeca izquierda, muñeca derecha) con estado propioceptivo de 14 dimensiones.
- Planificación de acciones con horizonte de 50 pasos.
- Generalización por repetición (*replay-generalization*): capacidad de reproducir y adaptar demostraciones de teleoperación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Investigación en aprendizaje por imitación para manipulación diestra**: el modelo sirve como baseline reproducible frente al cual medir ablaciones (por ejemplo, la variante sin máscara de ruido publicada por el mismo autor), gracias a sus checkpoints intermedios en los pasos 15000, 30000 y 45000.
- **Control de un brazo UR5 con mano RH56DFX en laboratorio**: integrado en un bucle de control que alimente las tres imágenes de cámara y el estado articular de 14 dimensiones, el modelo emite objetivos articulares absolutos ejecutables por el robot.
- **Reproducción de tareas de teleoperación**: útil para replicar secuencias demostradas en el dataset Bench2Dex, como recogida y colocación de objetos, con ajuste fino adicional sobre datos propios.
- **Evaluación comparativa de técnicas de regularización**: la combinación de *padding-dimension noise masking* y *state dropout* 0,5 permite estudiar su efecto frente a configuraciones alternativas en tareas de manipulación.
- **Análisis de dinámica de entrenamiento**: los checkpoints intermedios permiten trazar curvas de rendimiento a lo largo de los 60000 pasos y detectar cuándo se estabiliza la política.
- **Punto de partida para ajuste fino en nuevos entornos**: al derivar de RLDX-1-PT con configuración referenciada por hub id, puede reentrenarse sobre otros conjuntos de teleoperación manteniendo el backbone congelado o parcialmente descongelado.
- **Docencia y divulgación en robótica VLA**: su naturaleza de baseline documentado lo hace adecuado para ilustrar el flujo completo de un pipeline VLA, desde la captura multimodal hasta la acción articular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 6,9 mil millones de parámetros, en precisión completa (fp32) se requieren aproximadamente 27,6 GB solo para pesos; en fp16/bf16, unos 13,8 GB; en cuantización de 8 bits, unos 6,9 GB; en 4 bits, unos 3,5 GB. Estas cifras no incluyen el coste adicional del codificador visual ni de las activaciones, por lo que deben considerarse mínimos.
- **GPU recomendadas**: A100 (40/80 GB) o H100 para inferencia en fp16/bf16 sin cuantizar; RTX 4090 (24 GB) es viable en fp16 si el codificador visual y las activaciones caben en el presupuesto restante.
- **GPU de consumo**: una RTX 4090 de 24 GB puede alojar los pesos en fp16; tarjetas de 16 GB requerirían cuantización a 8 bits, y de 8 GB a 4 bits, con posible degradación en la precisión de las acciones.
- **Opciones de despliegue**: el formato safetensors y el código RLWRLD/RLDX sugieren despliegue con PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a políticas VLA.
- **Latencia y throughput**: no disponibles. El tamaño del repositorio (165,9 GB) incluye checkpoints intermedios y estado adicional, lo que implica tiempos de descarga y carga considerables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Notas |
|---|---|---|---|---|
| `rldx_b2d_ur5_rh56dfx_3_b128_60k` | 6.912.896.320 | Vídeo 4 / stride 2, horizonte 50 | no disponible | Baseline con máscara de ruido (dim 24) y state dropout 0,5 |
| `rldx2_rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k` | no disponible | Vídeo 4 / stride 2, horizonte 50 | no disponible | Ablación del proyecto RLDX-2 sin máscara de ruido en dimensiones de padding |
| RLWRLD/RLDX-1-PT | no disponible | no disponible | no disponible | Modelo base preentrenado del que deriva este ajuste |

No se dispone de información sobre otros modelos VLA comparables (por ejemplo, de familias como OpenVLA o RT-2) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo autor y su modelo base.

## Limitaciones y advertencias

- **Licencia no especificada**: al no indicarse licencia, no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue productivo.
- **Dominio muy restringido**: el modelo está ajustado exclusivamente para la configuración `ur5_rh56dfx_3`; su uso con otro robot, número de articulaciones o disposición de cámaras requerirá reentrenamiento.
- **Dependencia del dataset Bench2Dex**: la calidad y diversidad de las demostraciones de teleoperación condicionan directamente el comportamiento; no se documenta la composición ni el tamaño del conjunto.
- **Riesgo de alucinación motora**: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante estados o instrucciones fuera de distribución, con riesgo físico en el robot.
- **Sin información sobre sesgos**: no se han publicado análisis de sesgos demográficos, lingüísticos o de otro tipo; la instrucción de tarea podría no cubrir idiomas distintos del usado en el dataset.
- **Contexto limitado**: la ventana de vídeo de 4 fotogramas con stride 2 restringe la memoria temporal del modelo; tareas que requieran historial largo pueden fallar.
- **Sin benchmarks publicados**: no hay métricas de éxito en tareas que permitan estimar su rendimiento real frente a alternativas.
- **Requisitos de hardware elevados**: 6,9 mil millones de parámetros y un repositorio de 165,9 GB dificultan la experimentación en equipos modestos.
- **Checkpoint final sin estado del optimizador**: reanudar el entrenamiento exactamente desde el punto final no es posible sin reconstruir el estado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_b2d_ur5_rh56dfx_3_b128_60k
- Variante de ablación sin máscara de ruido: https://huggingface.co/Myungkyu/rldx2_rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Código RLWRLD/RLDX: https://github.com/RLWRLD/RLDX (referenciado en la model card; no verificado en la búsqueda)
- Dataset Bench2Dex/teleopdata: https://huggingface.co/datasets/Bench2Dex/teleopdata (referenciado en la model card; no verificado en la búsqueda)
