# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_uni_ema

## Resumen

`cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_uni_ema` es un modelo de política de acción para control robótico en bucle cerrado, publicado por el usuario Myungkyu en Hugging Face. Se construye a partir de Cosmos3-Nano, un modelo de mundo de vídeo, al que se le acopla un DiT de acción externo que recibe condicionamiento unidireccional vídeo-a-acción bajo un calendario de acciones compartido. El resultado es un policy que, dado el estado visual y el contexto de la tarea, emite acciones motoras para un robot simulado.

El modelo se ha afinado sobre RoboDojo Sim en formato LeRobot v3.0, con un entrenamiento de 60 000 pasos y batch de 64 (según la nomenclatura del identificador: `b64_60k`). La nomenclatura `l36_d1024` sugiere 36 capas y dimensión oculta de 1024, aunque esta interpretación no está confirmada en la model card. El sufijo `psg_uni` apunta a una variante de condicionamiento (posiblemente *prompt/state guidance unidireccional*) y `ema` indica que los pesos publicados son los promedios exponenciales del checkpoint final, no los pesos crudos.

La relevancia de este modelo es doble: por un lado, ejemplifica el patrón emergente de reutilizar modelos de mundo de vídeo como *backbone* para políticas robóticas; por otro, su empaquetado en formato DCP (torch.distributed.checkpoint) de rango único y su dependencia del servidor de políticas de `cosmos-framework` lo convierten en una pieza pensada para integración en pipelines de investigación más que para uso directo. El repositorio ocupa 32 GB y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo acoplado (condicionamiento vídeo-a-acción unidireccional, calendario de acciones compartido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados están en bf16 |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | DCP de torch.distributed.checkpoint de rango único (`model/__0_0.distcp` + `model/.metadata`), bf16, claves `net.*`; requiere `config.yaml` y un VAE Wan2.2 externo |

## Arquitectura y entrenamiento

La arquitectura combina un *backbone* de modelo de mundo de vídeo (Cosmos3-Nano) con un Diffusion Transformer (DiT) de acción externo. El acoplamiento es unidireccional: la información visual fluye hacia el módulo de acción, pero no al revés, y ambos módulos comparten un mismo calendario de acciones. Este diseño permite que el modelo de mundo aporte representaciones espacio-temporales ricas mientras el DiT de acción se especializa en generar comandos motores. La nomenclatura del identificador (`l36_d1024`) sugiere 36 capas y dimensión 1024 en el componente de acción, si bien la model card no lo confirma explícitamente.

El entrenamiento se realizó desde cero (*scratch*) sobre RoboDojo Sim, un entorno simulado en formato LeRobot v3.0, durante 60 000 pasos con batch de 64. No se especifican el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO; en robótica estos modelos suelen entrenarse con *behavior cloning* o *flow matching* sobre trayectorias, pero no hay confirmación en la información disponible. Los pesos publicados son los promedios exponenciales (EMA) del checkpoint final, convertidos a bf16 y renombrados bajo las claves `net.*`, sin estado del optimizador. El modelo requiere un VAE Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) para funcionar, lo que revela que la representación latente del vídeo sigue el espacio del VAE de Wan 2.2.

## Capacidades

- Generación de acciones motoras para control robótico en bucle cerrado a partir de observaciones visuales.
- Condicionamiento vídeo-a-acción: el modelo de mundo transforma el flujo visual en representaciones que alimentan el DiT de acción.
- Política de acción para manipulación y navegación en entornos simulados (RoboDojo Sim).
- Integración con el servidor de políticas de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- Soporte de *checkpointing* distribuido en formato DCP, cargable con `torch.distributed.checkpoint`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo *thinking*.

## Casos de uso

- **Investigación en políticas robóticas simuladas**: servir como *baseline* reproducible para experimentos de *behavior cloning* sobre RoboDojo Sim, aprovechando que los pesos EMA están publicados y el *config* de entrenamiento se incluye con rutas parametrizadas.
- **Ablación de condicionamiento vídeo-a-acción**: comparar esta variante `psg_uni` con las variantes `decoupled` y `cps` publicadas por el mismo autor para aislar el efecto del esquema de condicionamiento en el rendimiento de la política.
- **Evaluación de modelos de mundo como *backbone* robótico**: medir hasta qué punto las representaciones de Cosmos3-Nano transferibles a control motor superan a *backbones* puramente visuales o a políticas entrenadas desde cero.
- **Generación de trayectorias sintéticas en simulación**: usar el modelo para producir rollouts de acciones que alimenten procesos de *data augmentation* o de evaluación de controladores clásicos en RoboDojo.
- **Integración en pipelines de *sim-to-real* research**: servir como política de referencia en un lazo simulado antes de aplicar técnicas de adaptación al mundo real, dado que el modelo consume observaciones visuales y estados.
- **Reproducción de experimentos del autor**: el repositorio incluye `SHA256SUMS` y `config.yaml`, lo que facilita la verificación de integridad y la réplica exacta del *setup* de entrenamiento en un clúster con `cosmos-framework`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 32 GB en bf16; la VRAM necesaria para inferencia no está documentada, pero a partir del tamaño de los pesos se puede estimar un mínimo del orden de 32 GB solo para los pesos, más el VAE Wan2.2 y las activaciones.
- GPU recomendadas: no disponibles en la información; por el tamaño del *checkpoint* y el uso de DCP, se requiere al menos una GPU con 40-80 GB (A100 40/80 GB, H100) para carga completa en bf16.
- No se confirma que quepa en GPU de consumo (RTX 4090 con 24 GB) sin cuantización adicional, y no se documentan recetas de cuantización.
- Despliegue: exclusivamente mediante el servidor de políticas de `cosmos-framework` (`--checkpoint-path <repo> --config-file config.yaml`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Condicionamiento | Pesos | Licencia |
|---|---|---|---|---|---|
| `cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_uni_ema` (este) | Cosmos3-Nano + DiT acción | RoboDojo Sim | Vídeo-a-acción unidireccional (`psg_uni`) | DCP bf16, EMA | no disponible |
| `cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema` | Cosmos3-Nano + DiT acción | RoboDojo Sim | Desacoplado | DCP bf16, EMA | no disponible |
| `cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema` | Cosmos3-Nano + DiT acción | RoboDojo Sim | Variante `cps` | DCP bf16, EMA | no disponible |

Las tres variantes comparten *backbone*, dataset y presupuesto de entrenamiento (60k pasos, batch 64); la diferencia está en el esquema de condicionamiento. No se dispone de benchmarks que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia en la model card ni en los metadatos de Hugging Face, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requiere contactar con el autor.
- **Dependencia externa no incluida**: el modelo necesita el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B, que no se distribuye en el repositorio; hay que descargarlo por separado y ajustar `vae_path` en `config.yaml`.
- **Formato de pesos poco estándar**: DCP de rango único con claves `net.*`; no es cargable directamente con `transformers` ni con herramientas convencionales de inferencia, solo con `cosmos-framework`.
- **Entrenado únicamente en simulación**: RoboDojo Sim; no hay evidencia de transferencia a robots reales ni de robustez ante distribución visual del mundo real.
- **Riesgo de alucinación motora**: como política generativa, puede producir acciones incoherentes o inseguras fuera del dominio de entrenamiento; requiere *safety checks* en cualquier despliegue físico.
- **Sesgos del simulador**: el comportamiento hereda los sesgos y limitaciones físicas de RoboDojo Sim (fricciones, ruidos, distribución de tareas), no documentados en la ficha.
- **Sin métricas publicadas**: no hay benchmarks, curvas de entrenamiento ni comparaciones cuantitativas, lo que dificulta evaluar su calidad frente a alternativas.
- **Repo de 32 GB**: la descarga y el almacenamiento tienen un coste considerable, y no se ofrece una versión cuantizada o reducida.
- **Documentación mínima**: la model card no detalla hiperparámetros, composición del dataset, ni el significado exacto de `psg_uni`; parte de la información debe inferirse del identificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_uni_ema
- Variante desacoplada: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema
- Variante `cps`: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema
- VAE requerido (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
