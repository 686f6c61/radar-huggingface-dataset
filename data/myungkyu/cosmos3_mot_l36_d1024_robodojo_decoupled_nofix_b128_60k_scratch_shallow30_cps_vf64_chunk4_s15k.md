# Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b128_60k_scratch_shallow30_cps_vf64_chunk4_s15k

## Resumen

`cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b128_60k_scratch_shallow30_cps_vf64_chunk4_s15k` es un modelo de política de acción para control robótico en bucle cerrado, construido sobre Cosmos3-Nano, un modelo de mundo de vídeo. Lo desarrolla el usuario Myungkyu y se distribuye a través de Hugging Face bajo la librería `cosmos-framework`. El modelo combina un world model de vídeo con un DiT de acción externo, conectados mediante condicionamiento unidireccional vídeo-a-acción, y está ajustado sobre el simulador RoboDojo Sim en formato LeRobot v3.0.

El problema que aborda es la generación de acciones motoras a partir de observaciones visuales en entornos simulados de robótica, empleando un modelo de mundo como representación latente del entorno. La innovación principal es el desacoplamiento de los schedules de ruido: el ruido de la acción se muestrea de forma independiente al del vídeo, y la pasada de vídeo se realiza en modo "pure-noise" sin gradientes. Esto separa el aprendizaje de la dinámica visual del de la política de acción.

El nombre del repositorio codifica la configuración: 36 capas (`l36`), dimensión 1024 (`d1024`), batch 128 (`b128`), 60k pasos (`60k`), inicialización desde cero (`scratch`), truncamiento a 30 capas (`shallow30`), `cps` (probablemente control per step o similar), `vf64` y chunk de 4 (`chunk4`), con checkpoint intermedio en el paso 15000 (`s15k`). El repositorio ocupa 31,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model de vídeo (Cosmos3-Nano) + DiT de acción externo, condicionamiento unidireccional vídeo-a-acción |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP), bf16, claves `net.*` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida compuesta por Cosmos3-Nano como world model de vídeo y un DiT (Diffusion Transformer) de acción externo. La conexión entre ambos es unidireccional: el vídeo condiciona la generación de acciones, pero no al revés. Los schedules de ruido están desacoplados, de modo que el ruido de la acción se muestrea independientemente del ruido del vídeo, y la pasada de vídeo se ejecuta en modo pure-noise sin gradientes. El nombre del checkpoint indica 36 capas con dimensión 1024, truncadas a 30 capas (`shallow30`), y un chunk de acción de 4 pasos.

El entrenamiento se realizó desde cero (`scratch`) sobre el simulador RoboDojo Sim en formato LeRobot v3.0, con batch 128 y 60k pasos planificados. Los pesos publicados corresponden al checkpoint intermedio del paso 15000, en su versión EMA (`net_ema`) convertida a bf16 y almacenada bajo los nombres `net.*`. No se incluye estado del optimizador. El repositorio contiene el checkpoint DCP (`model/.metadata`, `model/__0_0.distcp`), un `config.yaml` con rutas locales sustituidas por placeholders y un archivo `SHA256SUMS` con los hashes de todos los ficheros.

## Capacidades

- Generación de acciones motoras para control robótico en bucle cerrado a partir de observaciones visuales.
- Modelado de mundo de vídeo: predicción de dinámica visual como representación latente del entorno.
- Condicionamiento vídeo-a-acción mediante un DiT de acción externo con schedule de ruido desacoplado.
- Generación de chunks de acción de longitud 4 (`chunk4`).
- Integración con el servidor de políticas de acción de `cosmos-framework`.
- Entrenamiento y evaluación sobre el simulador RoboDojo Sim (LeRobot v3.0).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Control de robots manipuladores en simulación: el modelo genera chunks de acción de 4 pasos a partir de observaciones visuales, adecuado para tareas de manipulación en RoboDojo Sim donde la dinámica visual condiciona la política.
- Investigación en world models para robótica: sirve como base para estudiar el desacoplamiento de schedules de ruido entre vídeo y acción en arquitecturas de política condicionada por vídeo.
- Evaluación de políticas en bucle cerrado: el checkpoint intermedio (paso 15000) permite analizar la evolución del entrenamiento y comparar con checkpoints posteriores.
- Prototipado de pipelines de acción con `cosmos-framework`: se carga directamente en el servidor de políticas de acción con `--checkpoint-path` y `--config-file config.yaml`.
- Reproducción de experimentos: el `config.yaml` y `SHA256SUMS` permiten reconstruir la configuración de entrenamiento (con rutas locales a sustituir) y verificar la integridad de los pesos.
- Fine-tuning posterior: al ser un checkpoint intermedio sin estado del optimizador, puede servir como inicialización para nuevos ajustes sobre RoboDojo Sim u otros datasets en LeRobot v3.0.
- Estudio de la inicialización desde cero (`scratch`) frente a inicialización desde pesos preentrenados de Cosmos3-Nano en tareas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 31,7 GB en bf16; se requiere al menos esa cantidad de memoria para cargar los pesos, más la memoria del VAE de Wan2.2 y del runtime de `cosmos-framework`.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint (31,7 GB en bf16), se necesitan GPUs con al menos 40 GB de VRAM (A100 40GB, A100 80GB, H100) para carga completa; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible; el tamaño en bf16 supera la VRAM de las RTX 4090 (24 GB) y RTX 3090 (24 GB) para carga completa, salvo cuantización, que no está documentada.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <repo> --config-file config.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Dependencia adicional: fichero VAE local `Wan2.2_VAE.pth` de `Wan-AI/Wan2.2-TI2V-5B`, referenciado en `config.yaml` como `vae_path`.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (políticas de acción sobre world models de vídeo) en la información disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: los pesos corresponden al paso 15000 de un entrenamiento de 60k pasos, por lo que no representan el modelo final de la run.
- Solo pesos EMA: se publica `net_ema` en bf16; no se incluye el otro conjunto de pesos ni el estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Formato DCP single-rank: requiere el runtime de `cosmos-framework` para cargar; no es un formato estándar de inferencia como safetensors o GGUF.
- Dependencia de rutas locales: `config.yaml` contiene placeholders (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`, `<video warm-up checkpoint>`) que deben sustituirse antes de usar.
- Licencia no disponible: no se especifican términos de uso comercial ni restricciones; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no disponibles: no se documenta soporte multilingüe; el modelo está orientado a robótica y no a texto general.
- Entrenado en simulación (RoboDojo Sim): no se documenta transferencia a robots reales ni robustez ante distribución distinta a la del simulador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Sesgos y alucinación: no documentados; en el contexto de world models, la predicción visual puede divergir de la realidad física fuera del dominio de entrenamiento.
- Cero descargas y likes: no hay validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b128_60k_scratch_shallow30_cps_vf64_chunk4_s15k
- VAE de referencia (Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
