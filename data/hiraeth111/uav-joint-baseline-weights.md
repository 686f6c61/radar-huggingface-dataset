# hiraeth111/uav-joint-baseline-weights

## Resumen

El repositorio `hiraeth111/uav-joint-baseline-weights` es un paquete de pesos base (checkpoints iniciales) para un experimento de ajuste fino conjunto (*joint fine-tuning*) de modelos visión-lenguaje-acción (VLA) orientados a navegación de vehículos aéreos no tripulados (UAV). No se trata de un modelo nuevo entrenado desde cero, sino de una recopilación de tres checkpoints de referencia —OpenVLA-UAV, IndoorUAV-Agent (π₀) y HUGE π₀.₅-UAV— publicados antes de la fase de ajuste fino planificada, junto con sus conversiones a PyTorch en BF16 y los activos de normalización originales para trazabilidad.

El paquete está pensado para reproducir el punto de partida del *branch* de experimentación `experiments/joint-baseline-ft-20261108` del repositorio `tzf19971012/uav_mot_cvpr2`. Incluye el checkpoint completo de OpenVLA-UAV (cuatro *shards* de tensores más tokenizer y procesador nativos), la conversión a PyTorch de IndoorUAV-Agent con el LoRA de UAV del publicador ya fusionado, y la conversión a PyTorch de HUGE π₀.₅-UAV. El tamaño del repositorio es de 28,3 GB.

Su relevancia es acotada pero específica: sirve como base reproducible para quien investigue ajuste fino conjunto de políticas VLA en robótica aérea, y como referencia de conversión JAX→PyTorch con auditoría numérica documentada. No es un modelo listo para uso general ni un resultado experimental; el propio autor lo describe como "las bases publicadas y sus conversiones, antes del ajuste fino conjunto previsto, no nuevos resultados experimentales".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); arquitecturas heredadas de OpenVLA, π₀ y π₀.₅ (detalle por checkpoint no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (conversiones PyTorch); el checkpoint OpenVLA-UAV se distribuye en formato nativo, cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los pesos originales conservan la licencia y condiciones de acceso de sus autores) |
| Formato de pesos | safetensors (repo); conversiones PyTorch BF16; tokenizer `paligemma_tokenizer.model` |
| Tamano del repositorio | 28,3 GB |
| Pipeline | robotics |
| Tarea | navegacion UAV, vision-language-action |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: agrupa tres checkpoints base con sus conversiones. OpenVLA-UAV se distribuye como checkpoint completo publicado (cuatro *shards* de tensores, tokenizer y procesador nativos). IndoorUAV-Agent (π₀) se ofrece como conversión a PyTorch en BF16 con el LoRA de UAV del publicador ya fusionado, correspondiente al checkpoint publicado `29999`. HUGE π₀.₅-UAV se ofrece como conversión a PyTorch en BF16 a partir de la revisión `a66531a8991aa585b8e2a356900d5fb07475fdd7` del repositorio `yu781986168/HUGE_PI05`.

El paquete incluye informes de conversión, configuraciones de modelo y los activos de normalización originales para trazabilidad. Según la model card, el ajuste fino conjunto utilizará estadísticas nuevas de su propio *bundle* de entrenamiento congelado, y los dos directorios convertidos ya son checkpoints PyTorch que no requieren conversión JAX adicional. Se documentan una auditoría de conversión y un *handoff* de entrenamiento en el repositorio de GitHub, que definen las convenciones exactas, los requisitos de entorno y los límites de validación numérica. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Navegación de UAV basada en visión y lenguaje: los tres checkpoints son políticas VLA orientadas a tareas de navegación aérea.
- Control visión-lenguaje-acción: mapean observaciones visuales e instrucciones en lenguaje a acciones de control del vehículo.
- Ajuste fino conjunto: el paquete está preparado para servir de base a un *branch* de fine-tuning conjunto sobre los tres modelos.
- Conversión JAX→PyTorch: las conversiones de IndoorUAV-Agent y HUGE π₀.₅-UAV están listas para PyTorch en BF16, con auditoría numérica documentada.
- Fusión de LoRA: IndoorUAV-Agent incluye el LoRA de UAV del publicador ya fusionado en el checkpoint convertido.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible.
- Modo *thinking* o razonamiento extendido: no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste fino VLA en robótica aérea: el paquete permite arrancar el *branch* `joint-baseline-ft-20261108` desde exactamente los mismos checkpoints base, con `SHA256SUMS` para verificar integridad y activos de normalización para trazabilidad.
- Investigación en conversión JAX→PyTorch: los directorios convertidos y los informes de conversión y auditoría sirven como referencia para validar numéricamente conversiones de políticas VLA.
- Benchmarking de navegación UAV: los tres checkpoints (OpenVLA-UAV, IndoorUAV-Agent/π₀ y HUGE π₀.₅-UAV) permiten comparar políticas base sobre el mismo *harness* de evaluación.
- Estudio de fusión de LoRA: IndoorUAV-Agent con el LoRA de UAV ya fusionado permite analizar el efecto de la fusión frente al adaptador separado.
- Desarrollo de pipelines de robótica con pesos en BF16: las conversiones PyTorch BF16 se integran en *stacks* de inferencia PyTorch sin necesidad de toolchain JAX.
- Trazabilidad y auditoría de pesos: el manifiesto de subida (`UPLOAD_MANIFEST.json`), los informes de conversión y los checksums permiten verificar el origen y la integridad de cada tensor en entornos de producción o revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que estos checkpoints son bases previas al ajuste fino conjunto y no nuevos resultados experimentales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 28,3 GB, pero el desglose por checkpoint no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El paquete está orientado a PyTorch (conversiones BF16) y al *branch* de entrenamiento del repositorio `uav_mot_cvpr2`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVLA-UAV (incluido en este repo) | no disponible | no disponible | VLA para UAV | la del publicador original | Hugging Face (`wangxiangyu0814/OpenVLA-UAV`) |
| IndoorUAV-Agent / π₀ (incluido en este repo) | no disponible | no disponible | VLA para UAV interior | la del publicador original | GitHub (`valyentinee/IndoorUAV-Agent`), checkpoint `29999` |
| HUGE π₀.₅-UAV (incluido en este repo) | no disponible | no disponible | VLA para UAV (HUGE-Bench) | la del publicador original | Hugging Face (`yu781986168/HUGE_PI05`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un resultado experimental: son checkpoints base previos al ajuste fino conjunto planificado.
- La licencia no está disponible en la información del repositorio; los pesos originales conservan la autoría, licencia y condiciones de acceso de sus publicadores, y esta colección no las relicencia. Verificar cada licencia upstream antes de uso comercial.
- El paquete incluye activos de normalización originales solo para trazabilidad; el ajuste fino conjunto debe usar estadísticas nuevas de su propio *bundle* congelado, según advierte la model card.
- Los dos directorios convertidos son checkpoints PyTorch y no requieren conversión JAX adicional; mezclar convenciones puede invalidar la reproducibilidad.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto o idioma.
- El repositorio registra 0 descargas y 1 *like* en el momento de la consulta, lo que sugiere escasa validación comunitaria independiente.
- Para reproducibilidad se recomienda verificar `SHA256SUMS` y consultar la auditoría de conversión y el *handoff* de entrenamiento antes de reutilizar los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hiraeth111/uav-joint-baseline-weights
- Branch de experimentación: https://github.com/tzf19971012/uav_mot_cvpr2/tree/experiments/joint-baseline-ft-20261108
- Handoff de entrenamiento: https://github.com/tzf19971012/uav_mot_cvpr2/blob/experiments/joint-baseline-ft-20261108/docs/baseline_joint_ft/HANDOFF.md
- Auditoría de conversión: https://github.com/tzf19971012/uav_mot_cvpr2/blob/experiments/joint-baseline-ft-20261108/docs/baseline_joint_ft/CONVERSION_AUDIT.md
- OpenVLA-UAV (origen): https://huggingface.co/wangxiangyu0814/OpenVLA-UAV
- Código UAV-Flow: https://github.com/buaa-colalab/UAV-Flow
- IndoorUAV-Agent (origen): https://github.com/valyentinee/IndoorUAV-Agent
- HUGE_PI05 (origen): https://huggingface.co/yu781986168/HUGE_PI05
- Código HUGE-Bench: https://github.com/jingyu198/HUGE-Bench
