# Myungkyu/cosmos3_mot_l36_d1024_bench2dex_all26_b128_30k_h48e24_ema

## Resumen

`cosmos3_mot_l36_d1024_bench2dex_all26_b128_30k_h48e24_ema` es un modelo de política de acción para control robótico cerrado, desarrollado por el usuario de Hugging Face Myungkyu. Se construye sobre Cosmos3-Nano, un modelo de mundo de vídeo, al que se le acopla un ActionDiT externo de 36 capas y anchura 1024 entrenado desde cero, con condicionamiento unidireccional vídeo-a-acción y un esquema de acciones compartido. El modelo genera chunks de 48 acciones a 20 Hz a partir de observaciones visuales multimarca y del estado articular del robot.

El modelo se ha afinado sobre las 26 configuraciones del benchmark Bench2Dex, distribuidas en 12 encarnaciones robóticas (Allegro, Jaka, Leap, Orca, Revo2, UR5+RH56DFX, RH5DG2, Schunk, Shadow, Sharpa, Wuji y Ability), usando exportaciones LeRobot v3.0 por encarnación. La entrada visual se compone de cuatro vistas de 640x480 dispuestas en un lienzo 2x2 de 256x320, y el estado se representa mediante las articulaciones activas del robot (24 en los ajustes UR5 reportados).

Su relevancia radica en que combina un modelo de mundo de vídeo preentrenado con un cabezal de acción específico para robótica diestra, lo que permite evaluar políticas generalistas sobre múltiples morfologías de mano y brazo. El repositorio ocupa 32,8 GB y los pesos se distribuyen como checkpoint DCP en bf16 (EMA), sin estado del optimizador. La licencia no está especificada y el servidor de políticas necesario para servirlo no es público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (modelo de mundo de vídeo) + ActionDiT MoT de 36 capas y anchura 1024, condicionamiento unidireccional vídeo-a-acción |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunks de 48 acciones a 20 Hz; 24 ejecutadas por petición) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo robótico; el prompt es una descripción de escena en texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata` y `model/__0_0.distcp`, claves `net.*`, bf16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida: un backbone de modelo de mundo de vídeo Cosmos3-Nano y un ActionDiT de tipo Mixture-of-Transformers (MoT) con 36 capas y anchura 1024, entrenado desde cero. La conexión entre ambos es unidireccional (vídeo condiciona acción) y comparte el esquema temporal de acciones. La entrada y salida de acciones se gestiona mediante un MLP por encarnación (`action_expert.action_io: domain_mlp`), lo que permite adaptar el espacio de acciones a cada robot sin un único cabezal global.

El entrenamiento se realizó con batch 128 durante 30 000 iteraciones sobre las 26 configuraciones de Bench2Dex en sus 12 encarnaciones, usando exportaciones LeRobot v3.0 de `Bench2Dex/teleopdata`. Se generan chunks de 48 acciones a 20 Hz. Los pesos publicados son los EMA del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`, sin estado del optimizador. El modelo requiere un VAE Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) para la parte de vídeo, y el servidor de políticas de `cosmos-framework` reconstruye el modelo a partir de `config.yaml`, que incluye rutas locales sustituidas por marcadores de posición.

## Capacidades

- Generación de acciones robóticas en bucle cerrado a partir de observaciones visuales multicámara y estado articular.
- Control diestro multi-encarnación: cubre 12 morfologías de mano y brazo (Allegro, Leap, Shadow, Sharpa, Schunk, RH56DFX, RH5DG2, Orca, Revo2, Wuji, Jaka, Ability).
- Procesamiento de cuatro vistas de cámara simultáneas dispuestas en un lienzo 2x2 de 256x320.
- Condicionamiento por descripción de escena en texto como prompt.
- Generación de chunks de 48 acciones con ejecución parcial (24 por petición) para control reactivo.
- Muestreo UniPC conjunto con 10 pasos (shift 3) o un solo paso, con guía 1.0.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio.

## Casos de uso

- Manipulación diestra con manos antropomórficas: el modelo genera comandos articulares para manos como Allegro, Shadow o Leap a partir de vistas de cámara, adecuado para tareas de agarre fino en entornos simulados Isaac Sim/Isaac Lab.
- Control de brazo UR5 con pinza RH56DFX: los tres ajustes reportados (carga de frutero, caja de destornillador y martillo, eliminación de basura) demuestran su uso en tareas de pick-and-place con 24 articulaciones activas.
- Evaluación comparativa de políticas generalistas: sirve como referencia para medir éxito en Bench2Dex bajo distintos canales de evaluación (None, Equi., Inv., Full) con 50 episodios por canal.
- Investigación en modelos de mundo aplicados a robótica: al partir de Cosmos3-Nano, permite estudiar cómo el preentrenamiento en vídeo transfiere a políticas de acción.
- Prototipado de pipelines de teleoperación a política: los datos LeRobot v3.0 de Bench2Dex permiten reentrenar o adaptar el cabezal de acción por encarnación.
- Benchmarking de robustez ante cambios de cámara o escena: los canales de evaluación invariancia/equivarianza permiten medir degradación bajo perturbaciones visuales.

## Benchmarks y rendimiento

Resultados en Bench2Dex (medias sobre tres ajustes UR5 + RH56DFX, 150 episodios por canal, semilla 100000000, 60 pasos de calentamiento, política a 20 Hz, medidos en NVIDIA L40S):

| Sampler | None | Equi. | Inv. | Full | SR | LSCR |
|---|---|---|---|---|---|---|
| 10 pasos, shift 3 (por defecto) | 55,33 | 50,67 | 47,33 | 52,67 | 51,5 | 73,8 |
| 1 paso | 59,33 | 44,00 | 54,00 | 49,33 | 51,7 | 74,1 |

SR es la media de los cuatro canales; LSCR es la tasa de finalización de etapas con latch. No se reportan resultados de los otros 23 ajustes del conjunto de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 32,8 GB en bf16, por lo que la inferencia requiere al menos ~33 GB solo para pesos, más el VAE Wan2.2 y las activaciones.
- GPU recomendadas: NVIDIA L40S es la GPU usada en la evaluación reportada; por tamaño, se necesitan GPUs de 40 GB o más (A100 40/80 GB, H100, L40S).
- No cabe en GPUs de consumo de 24 GB (RTX 4090) en bf16 sin cuantización adicional, que no está documentada.
- Despliegue: servidor de políticas de `cosmos-framework` con `--checkpoint-path` y `--config-file config.yaml`; requiere el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B.
- El servidor de políticas no es público; hay que contactar con los autores para acceso.
- Latencia y throughput: no disponibles; la política opera a 20 Hz y ejecuta 24 de cada 48 acciones por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Cosmos3-Nano + ActionDiT) | no disponible | chunks de 48 acciones | Modelo de mundo de vídeo + ActionDiT MoT | no disponible | Pesos públicos; servidor no público |
| Cosmos3-Nano base | no disponible | no disponible | Modelo de mundo de vídeo | no disponible | Referenciado en la model card |
| Políticas de imitación tipo diffusion policy (genéricas) | variable | variable | Difusión sobre acciones | variable | Depende del modelo |

No se dispone de datos comparativos de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El servidor de políticas necesario para servir el checkpoint no es público; sin acceso de los autores, el modelo no es desplegable de forma directa.
- Solo se reportan resultados en 3 de los 26 ajustes de entrenamiento (UR5 + RH56DFX); el rendimiento en las otras 23 configuraciones es desconocido.
- La licencia no está especificada, lo que impide confirmar el uso comercial.
- El modelo depende de un VAE externo (Wan2.2) y de un entorno de simulación concreto (Isaac Sim 5.1 / Isaac Lab 2.3.2), lo que limita la reproducibilidad fuera de ese stack.
- Los pesos son EMA en bf16 sin estado del optimizador, por lo que no permiten reanudar el entrenamiento tal cual.
- Riesgo de sobreajuste a las vistas y morfologías de Bench2Dex; la generalización a cámaras, iluminación o robots no evaluados no está documentada.
- No se documentan sesgos, capacidades multilingües ni salvaguardas de seguridad para despliegue físico real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_bench2dex_all26_b128_30k_h48e24_ema
- Benchmark Bench2Dex: https://github.com/Bench2Dex/Bench2Dex
- Paper Bench2Dex: arXiv 2609.15726
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset de ejemplo: https://huggingface.co/datasets/Myungkyu/bench2dex_ur5_rh56dfx_3_lerobot_v30
