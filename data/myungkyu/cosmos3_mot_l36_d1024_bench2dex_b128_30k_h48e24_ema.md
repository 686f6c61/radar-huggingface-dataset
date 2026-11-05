# Myungkyu/cosmos3_mot_l36_d1024_bench2dex_b128_30k_h48e24_ema

## Resumen

Cosmos3-Nano es un modelo del mundo (world model) de vídeo desarrollado por NVIDIA dentro del framework Cosmos, y este checkpoint concreto es un ajuste fino realizado por el usuario Myungkyu para control robótico en bucle cerrado. El modelo combina un backbone de world model Cosmos3-Nano con un ActionDiT externo (36 capas, anchura 1024) entrenado desde cero que condiciona la generación de acciones sobre el vídeo predicho, implementando un esquema de condicionamiento unidireccional vídeo-a-acción con un calendario de difusión compartido.

El modelo está especializado en manipulación diestra con un brazo UR5 equipado con manos RH56DFX (24 articulaciones activas) sobre tres escenarios del benchmark Bench2Dex (06, 12 y 42). Genera chunks de 48 acciones a 20 Hz y se sirve mediante el servidor de políticas del framework Cosmos, que no es público. El repositorio contiene únicamente los pesos EMA en bf16 en formato torch.distributed.checkpoint (DCP) junto con el `config.yaml` de entrenamiento.

Es relevante porque ilustra la tendencia de usar world models de vídeo como base para políticas de acción en robótica, con resultados de éxito medidos en simulación (Isaac Sim 5.1 / Isaac Lab 2.3.2) que alcanzan un SR medio del 63,5 % con el sampler por defecto. Su naturaleza experimental (13 descargas, sin licencia declarada, servidor no público) lo sitúan como material de investigación más que como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) + ActionDiT MoT de 36 capas y anchura 1024, condicionamiento vídeo-a-acción unidireccional |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (chunks de 48 acciones a 20 Hz; 24 ejecutadas por petición) |
| Tipos de cuantización | bf16 (pesos publicados); no se indican otras |
| Idiomas soportados | no disponible (prompt en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP), bf16, claves `net.*`; requiere VAE Wan2.2 externo (`Wan2.2_VAE.pth`) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo, y le acopla un ActionDiT (Mixture-of-Transformers) de 36 capas y anchura 1024 entrenado desde cero. El condicionamiento es unidireccional: el vídeo predicho informa la generación de acciones, con un calendario de difusión compartido entre ambos flujos. La entrada y salida de acciones se gestiona mediante un MLP por embodiment (`action_expert.action_io: domain_mlp`), lo que permite adaptar el modelo a distintas configuraciones de robot. La representación visual se construye con las cuatro vistas de 640x480 reescaladas a un lienzo 2x2 de 256x320, y el estado del robot son sus 24 articulaciones activas.

El entrenamiento se realizó sobre el dataset `Myungkyu/bench2dex_ur5_rh56dfx_3_lerobot_v30`, una exportación propia en LeRobot v3.0 de los datos de Bench2Dex/teleopdata, co-entrenando tres configuraciones (06, 12 y 42) de UR5 + RH56DFX. Se usaron batch 128 y 30.000 iteraciones, con chunks de 48 acciones a 20 Hz. Los pesos publicados son los EMA (net_ema) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`, sin estado del optimizador. No se documenta el volumen de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones robóticas en bucle cerrado para manipulación diestra con UR5 + RH56DFX (24 articulaciones activas).
- Predicción de vídeo como world model subyacente (Cosmos3-Nano) que condiciona la política de acción.
- Producción de chunks de 48 acciones a 20 Hz, con ejecución parcial (24 de 48 por petición) para control reactivo.
- Condicionamiento por prompt en lenguaje natural con la descripción de la escena.
- Entrada multimodal: cuatro vistas de cámara (640x480) compuestas en un lienzo 2x2 de 256x320 más el estado articular.
- Soporte de múltiples canales de evaluación (none, cov_only, inv_only, inv_cov) según el protocolo de Bench2Dex.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües.

## Casos de uso

- Manipulación diestra en simulación: servir la política en Isaac Sim 5.1 / Isaac Lab 2.3.2 mediante el servidor de políticas Cosmos para tareas como cargar un bol de fruta, meter un destornillador y un martillo en una caja o tirar basura, los tres escenarios evaluados.
- Investigación en world models para robótica: usar el checkpoint como base para estudiar el condicionamiento vídeo-a-acción y el calendario de difusión compartido entre el flujo de vídeo y el de acciones.
- Evaluación comparativa de políticas: reproducir el protocolo de Bench2Dex (50 episodios por canal, seed 100000000, 60 pasos de warm-up, reinicio cada 25 episodios) para comparar variantes de sampler o de arquitectura.
- Ajuste fino sobre nuevos embodiments: el MLP de E/S de acciones por embodiment (`domain_mlp`) permite adaptar el modelo a otras configuraciones de robot partiendo de estos pesos EMA.
- Estudio de robustez ante canales de evaluación: analizar la degradación entre los canales None (75,33 %), Equi. (41,33 %), Inv. (74,67 %) y Full (62,67 %) para identificar sesgos de la política.
- Prototipado de control a 20 Hz: el modo de un solo paso del sampler (SR 55,5 %) permite explorar despliegues de baja latencia frente al modo de 10 pasos (SR 63,5 %).

## Benchmarks y rendimiento

Resultados en Bench2Dex (commit `fd90dcc`), media sobre los tres escenarios UR5 + RH56DFX, 150 episodios por canal, medidos en NVIDIA L40S:

| Sampler | None | Equi. | Inv. | Full | SR | LSCR |
|---|---|---|---|---|---|---|
| 10 pasos, shift 3 (por defecto) | 75,33 | 41,33 | 74,67 | 62,67 | 63,5 | 83,1 |
| 1 paso | 72,00 | 41,33 | 56,00 | 52,67 | 55,5 | 79,2 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 32,8 GB en bf16 y requiere además el VAE Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) cargado en memoria.
- GPU recomendadas: los resultados se midieron en NVIDIA L40S; se espera que GPU de clase profesional con 48 GB o más (A100 80 GB, H100, L40S) sean adecuadas, aunque no se documentan requisitos oficiales.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) en bf16 dado el tamaño del checkpoint; requeriría cuantización no documentada.
- Despliegue: exclusivamente mediante el servidor de políticas del framework Cosmos (`--checkpoint-path <repo> --config-file config.yaml`), que no es público. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica la frecuencia de control de 20 Hz y la ejecución de 24 de cada 48 acciones por petición.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (world models de vídeo con política de acción para manipulación diestra) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El servidor de políticas que sirve este checkpoint no es público; es necesario contactar con los autores para obtener acceso, lo que limita su reproducibilidad.
- No se declara licencia, por lo que el uso comercial queda sin autorización explícita.
- El modelo está especializado en tres escenarios concretos de Bench2Dex con UR5 + RH56DFX; su generalización a otros robots, tareas o entornos no está documentada.
- Los resultados se obtuvieron únicamente en simulación (Isaac Sim 5.1 / Isaac Lab 2.3.2); no hay validación en hardware real.
- La diferencia entre canales (None 75,33 % frente a Equi. 41,33 %) sugiere sensibilidad a las condiciones de evaluación y posible sobreajuste a determinadas configuraciones.
- El modo de un solo paso pierde rendimiento de forma notable (SR 55,5 % frente a 63,5 %), lo que restringe el despliegue de baja latencia.
- Riesgo de alucinación visual inherente a los world models generativos: la predicción de vídeo puede divergir de la realidad y arrastrar la política a acciones incorrectas.
- El repositorio contiene solo pesos EMA en DCP y un `config.yaml` con rutas sustituidas por placeholders; la carga exige reconstruir el entorno de entrenamiento.
- No se documentan sesgos demográficos, lingüísticos ni de otro tipo, ni el volumen y composición del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_bench2dex_b128_30k_h48e24_ema
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/bench2dex_ur5_rh56dfx_3_lerobot_v30
- Bench2Dex (repositorio): https://github.com/Bench2Dex/Bench2Dex
- Bench2Dex (paper, arXiv 2609.15726): https://arxiv.org/abs/2609.15726
- VAE Wan2.2 (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
