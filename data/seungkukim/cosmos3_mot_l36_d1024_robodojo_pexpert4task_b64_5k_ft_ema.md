# seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema

## Resumen

`cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema` es un checkpoint de política de acción para control robótico de bucle cerrado, construido sobre el modelo de mundo de vídeo Cosmos3-Nano (familia Cosmos, NVIDIA) y publicado por el usuario `seungkukim` en Hugging Face. El modelo combina un world model de vídeo con un ActionDiT externo que recibe condicionamiento unidireccional vídeo-a-acción y comparte el schedule de acciones con el backbone de vídeo, de modo que la predicción de acciones se apoya en la dinámica visual aprendida por el modelo de mundo.

El checkpoint es un ajuste fino (5.000 pasos, 8,33 épocas, batch global 64) del modelo base `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema`, del que se reutiliza el ActionDiT preentrenado en lugar de reinicializarlo (`keys_to_skip_loading=["net_ema."]`). El entrenamiento se realizó sobre un subconjunto de 4 de las 35 tareas de RoboDojo Sim en formato LeRobot v3.0 (96 episodios, 42.131 fotogramas), con un learning rate de 5e-5 y un multiplicador de 5x sobre el ActionDiT.

Es relevante porque ejemplifica el patrón actual de "world model como base para políticas robóticas": en lugar de entrenar una política desde cero, se aprovecha un modelo generativo de vídeo preentrenado a gran escala y se le acopla una cabeza de acción ligera. El repositorio pesa 32 GB y se distribuye como checkpoint DCP (torch.distributed.checkpoint) en bf16 con los pesos EMA, sin estado del optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo, transformer) + ActionDiT externo con condicionamiento vídeo-a-acción unidireccional y schedule de acciones compartido |
| Parámetros totales | no disponible (el identificador `l36_d1024` sugiere 36 capas y dimensión 1024, pero no se confirma el recuento total) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16, con claves `net.*`; requiere `config.yaml` y un VAE Wan2.2 externo (`Wan2.2_VAE.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de dos componentes: un backbone de world model de vídeo (Cosmos3-Nano) que modela la dinámica visual del entorno, y un ActionDiT externo que genera acciones condicionado de forma unidireccional por las representaciones de vídeo, compartiendo el schedule de acciones con el backbone. Esta separación permite reutilizar el conocimiento visual del world model sin tener que regenerar la cabeza de acción desde cero, lo que explica que el ajuste fino se haya hecho cargando el ActionDiT preentrenado en lugar de reinicializarlo.

El entrenamiento parte del checkpoint `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema` (60.000 pasos en RoboDojo Sim) y se ajusta durante 5.000 pasos con batch global 64 (2 nodos H200, 32 por GPU, grad-accum 1), 8,33 épocas sobre el subconjunto de 4 tareas, learning rate 5e-5 con multiplicador 5x en el ActionDiT, warmup de 500 pasos y decaimiento a cero en el paso 5.000. El dataset de ajuste contiene 96 episodios y 42.131 fotogramas (95 episodios y 38.422 ventanas de muestra tras la retención fija de 1 episodio para validación). Los pesos publicados son los EMA (`net_ema`), convertidos a bf16 y almacenados bajo los nombres `net.*`, sin estado del optimizador. No se documenta el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Predicción de acciones robóticas en bucle cerrado a partir de observaciones visuales, mediante el ActionDiT condicionado por el world model de vídeo.
- Modelado de dinámica visual del entorno (world model de vídeo) como base para la política.
- Condicionamiento vídeo-a-acción unidireccional con schedule de acciones compartido entre ambos componentes.
- Ajuste específico para 4 tareas de RoboDojo Sim, con especialización en el subconjunto `pexpert-4task`.
- Integración con el servidor de políticas de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Control de manipuladores en simulación RoboDojo: el checkpoint está ajustado sobre 4 tareas concretas y se puede desplegar con el servidor de acción de `cosmos-framework` para evaluar políticas de bucle cerrado en esas tareas.
- Investigación en world models aplicados a robótica: sirve como punto de partida para estudiar cómo el condicionamiento vídeo-a-acción afecta a la calidad de las políticas frente a políticas entrenadas desde cero.
- Ajuste fino adicional sobre nuevas tareas: al conservar el ActionDiT preentrenado, es una base razonable para fine-tuning sobre otros subconjuntos de RoboDojo o datasets LeRobot v3.0.
- Evaluación comparativa de checkpoints: permite comparar el efecto del ajuste fino corto (5.000 pasos) frente al modelo base de 60.000 pasos en las mismas 4 tareas.
- Prototipado de pipelines de entrenamiento con `cosmos-framework`: el `config.yaml` incluido documenta el schedule, batch y learning rate, útil para reproducir o escalar el entrenamiento.
- Generación de rollouts visuales condicionados para análisis de fallos: el componente de world model permite inspeccionar la dinámica predicha junto con las acciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 32 GB en bf16, por lo que la inferencia requiere al menos ~32 GB de VRAM solo para los pesos, más el VAE Wan2.2 externo y las activaciones.
- GPU recomendadas: H200 (usadas en el entrenamiento, 2 nodos x 32 de batch por GPU) o A100/H100 de 80 GB para inferencia cómoda.
- No cabe en GPU de consumo convencional (RTX 4090 de 24 GB) sin cuantización, y no se documentan formatos cuantizados.
- Despliegue mediante el servidor de políticas de `cosmos-framework` (`--checkpoint-path <repo> --config-file config.yaml`), que añade el subdirectorio `model/`.
- Requiere un archivo VAE local `Wan2.2_VAE.pth` de `Wan-AI/Wan2.2-TI2V-5B` configurado en `vae_path`.
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Base | Pasos de ajuste | Dataset | Pesos | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (`..._pexpert4task_b64_5k_ft_ema`) | cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema | 5.000 | 4 tareas RoboDojo (96 episodios) | EMA bf16, DCP | no disponible |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema` | Entrenamiento desde cero | 60.000 | RoboDojo Sim (LeRobot v3.0) | EMA bf16 | no disponible |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema` | Entrenamiento desde cero | 60.000 | RoboDojo Sim (LeRobot v3.0) | EMA bf16 | no disponible |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_taskbal_ema` | Entrenamiento desde cero | 60.000 | RoboDojo Sim (LeRobot v3.0) | EMA bf16 | no disponible |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Especialización muy estrecha: solo se ha ajustado sobre 4 de las 35 tareas de RoboDojo, por lo que su generalización a otras tareas no está garantizada.
- Dataset pequeño: 96 episodios y 42.131 fotogramas, con 95 episodios efectivos tras la retención de validación; riesgo de sobreajuste al subconjunto.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; es necesario contactar con el autor antes de usarlo en producción.
- Dependencia de un VAE externo (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) cuya licencia es independiente y debe verificarse.
- Formato de checkpoint DCP específico de `cosmos-framework`, no directamente cargable en vLLM, llama.cpp, Ollama o TGI.
- Sin estado del optimizador: no es reanudable para entrenamiento tal cual, solo para inferencia o ajuste fino desde los pesos EMA.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser un modelo de acción robótica, los fallos se manifiestan como acciones incorrectas o inseguras, no como texto.
- Sin información sobre idiomas ni capacidades de texto: no es un modelo de lenguaje general.

## Enlaces

- Hugging Face: https://huggingface.co/seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema
- Modelo base: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema
- Dataset de ajuste: https://huggingface.co/datasets/seungkukim/robodojo-pexpert-4task-lerobot-v3.0
- Checkpoint relacionado (cps): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema
- Checkpoint relacionado (taskbal): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_taskbal_ema
- VAE requerido: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
