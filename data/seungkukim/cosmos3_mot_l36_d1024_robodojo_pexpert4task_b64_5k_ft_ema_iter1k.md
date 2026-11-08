# seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter1k

## Resumen

`cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter1k` es un punto de control (checkpoint) intermedio de un modelo de mundo de vídeo Cosmos3-Nano, adaptado como política de acción para control robótico en bucle cerrado. Lo publica el usuario `seungkukim` sobre la infraestructura `cosmos-framework`, y deriva del modelo base `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema`, cuyo ActionDiT preentrenado se carga en lugar de reinicializarse. El modelo combina un modelo de mundo de vídeo con un DiT de acción externo, con condicionamiento unidireccional vídeo-a-acción y un schedule de acción compartido.

El interés de esta ficha es acotado: no es un modelo de lenguaje generalista ni un asistente conversacional, sino un artefacto de investigación en robótica, publicado como checkpoint de un entrenamiento de ajuste fino de 5.000 pasos sobre cuatro tareas de RoboDojo. El repositorio contiene únicamente los pesos EMA en bf16 en formato `torch.distributed.checkpoint` (DCP) de un solo rango, sin estado del optimizador, junto con el `config.yaml` de entrenamiento y sumas SHA-256.

La relevancia es, por tanto, la de un ejemplo reproducible de post-entrenamiento de políticas visomotoras sobre un world model de vídeo: permite inspeccionar la receta (batch global 64, learning rate 5e-5 con multiplicador 5x en el ActionDiT, warmup 500, decaimiento a cero en el paso 5.000) y reutilizar los pesos para evaluación o continuación del entrenamiento. No hay métricas de rendimiento publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con ActionDiT externo; condicionamiento unidireccional vídeo-a-acción y schedule de acción compartido |
| Parametros totales | no disponible (la nomenclatura `l36_d1024` sugiere 36 capas y dimensión 1024, sin confirmación oficial) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en bf16 |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | `torch.distributed.checkpoint` (DCP) de un solo rango; `model/.metadata` y `model/__0_0.distcp` con claves `net.*` en bf16 |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mundo de vídeo (world model) de la familia Cosmos3-Nano al que se acopla un DiT de acción externo. El condicionamiento es unidireccional: el vídeo informa la acción, no al revés, y ambos módulos comparten un schedule de acción. El checkpoint parte de `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema`, cargando su ActionDiT preentrenado en lugar de reinicializarlo (con `checkpoint.keys_to_skip_loading=["net_ema."]`). El VAE utilizado es el de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B), que debe apuntarse localmente mediante `vae_path` en el `config.yaml`.

El ajuste fino se realizó sobre el dataset `seungkukim/robodojo-pexpert-4task-lerobot-v3.0`, con 96 episodios y 42.131 fotogramas correspondientes a 4 de las 35 tareas de RoboDojo (95 episodios y 38.422 ventanas de muestra tras la retención fija de un episodio para validación del cargador). El schedule fue: batch global 64 (2 GPUs H200 x 32 x grad-accum 1), 5.000 pasos (8,33 épocas), learning rate 5e-5 con multiplicador 5x sobre el ActionDiT, warmup de 500 pasos y decaimiento del LR a cero en el paso 5.000. Este repositorio corresponde al checkpoint del paso 1.000, con los pesos EMA (`net_ema`, convertidos a bf16 y almacenados bajo los nombres `net.*`) y sin estado del optimizador.

## Capacidades

- Control robótico en bucle cerrado mediante predicción de acciones condicionada por vídeo.
- Modelado de mundo de vídeo: representación y predicción de dinámica visual del entorno.
- Condicionamiento vídeo-a-acción unidireccional con schedule de acción compartido entre el world model y el ActionDiT.
- Ajuste específico sobre cuatro tareas de RoboDojo, con datos en formato LeRobot v3.0.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes o multilingüismo; el modelo no está orientado a esas tareas.
- No se documenta modo de razonamiento (thinking), audio ni otras modalidades adicionales.

## Casos de uso

- Investigación en políticas visomotoras: servir como punto de partida para estudiar el efecto del número de pasos de ajuste fino, comparando este checkpoint del paso 1.000 con el modelo base de 60.000 pasos y con el checkpoint final.
- Evaluación de generalización entre tareas: al estar entrenado sobre 4 de las 35 tareas de RoboDojo, permite medir transferencia a las tareas no vistas dentro del mismo simulador.
- Reproducción de experimentos: el `config.yaml` y las sumas SHA-256 permiten reconstruir la configuración exacta de entrenamiento y verificar la integridad de los pesos.
- Desarrollo de servidores de política de acción: se integra en el servidor de acción de `cosmos-framework` mediante `--checkpoint-path <dir> --config-file config.yaml`.
- Base para continuación de entrenamiento: al conservar el formato DCP y las claves `net.*`, puede reanudarse el ajuste fino sobre nuevos datasets LeRobot.
- Estudio de condicionamiento vídeo-a-acción: útil para analizar cómo la representación latente del VAE de Wan2.2 influye en la calidad de las acciones generadas.
- Referencia para pipelines de simulación a realidad: al entrenarse en RoboDojo Sim, sirve como línea base antes de un ajuste con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El entrenamiento documentado se ejecutó en 2 GPUs H200 con batch de 32 por GPU y acumulación de gradiente 1.
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32,0 GB en bf16, lo que da una cota inferior del orden de 32 GB solo para los pesos, sin contar el VAE de Wan2.2 ni activaciones.
- GPU recomendadas: H200 (configuración de referencia del autor); por tamaño, se requerirían GPUs de clase A100 80 GB o H100 para cargar el checkpoint completo en bf16.
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB) sin cuantización o partición, y no se documentan recetas de cuantización.
- Opciones de despliegue: servidor de política de acción de `cosmos-framework` con `--checkpoint-path` y `--config-file`; requiere un archivo local `Wan2.2_VAE.pth`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Relación | Pasos de entrenamiento | Dataset | Formato | Licencia |
|---|---|---|---|---|---|
| `seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter1k` | Este modelo | 1.000 (de un run de 5.000) | 4 tareas RoboDojo (96 episodios) | DCP bf16 | no disponible |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema` | Modelo base del que deriva | 60.000 | RoboDojo Sim (LeRobot v3.0) | DCP bf16 | no disponible |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_h48e24` | Variante del mismo autor | 60.000 | RoboDojo Sim | DCP bf16 | no disponible |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema` | Variante del mismo autor | 60.000 | RoboDojo Sim | DCP bf16 | no disponible |

No se dispone de datos de benchmarks ni de comparación con políticas robóticas de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 1.000 de un run de 5.000, por lo que no representa el estado final del ajuste fino.
- Entrenado sobre solo 4 de las 35 tareas de RoboDojo y con 96 episodios; la cobertura de escenarios es muy reducida y la generalización fuera de esas tareas es incierta.
- Sin estado del optimizador: no permite reanudar el entrenamiento de forma idéntica, solo reiniciar o continuar con un optimizador nuevo.
- Licencia no disponible: no puede asumirse uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Requiere el VAE de Wan2.2 (`Wan2.2_VAE.pth`) como dependencia externa, con posibles condiciones de licencia propias.
- Los pesos son EMA en bf16; no se documenta el efecto de la cuantización ni recetas para reducir precisión.
- El `config.yaml` contiene rutas locales sustituidas por marcadores (`<robodojo-base-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`, `<output root>`), por lo que la reproducibilidad exige rellenarlas manualmente.
- Sin métricas publicadas de éxito en tarea, no es posible evaluar su calidad frente al modelo base o a alternativas.
- Riesgo de sobreajuste a las condiciones del simulador RoboDojo; no hay evidencia de transferencia a robots reales.
- Sesgos y riesgos de alucinación en el sentido de modelos de lenguaje: no aplicables directamente, pero la predicción de acciones puede producir trayectorias inválidas fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter1k
- Modelo base: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema
- Variante `h48e24`: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_h48e24
- Variante `scratch_cps_ema`: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema
- Dataset de ajuste fino: https://huggingface.co/datasets/seungkukim/robodojo-pexpert-4task-lerobot-v3.0
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
