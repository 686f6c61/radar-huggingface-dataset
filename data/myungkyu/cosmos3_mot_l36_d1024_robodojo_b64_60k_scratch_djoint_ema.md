# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_djoint_ema

## Resumen

cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_djoint_ema es un modelo de política de acción (action policy) para control robótico en bucle cerrado, construido a partir de Cosmos3-Nano, el modelo del mundo de vídeo de NVIDIA, y afinado con un DiT de acción externo. Lo publica el usuario Myungkyu en Hugging Face bajo el paraguas del framework Cosmos y la librería `cosmos-framework`. El modelo combina un modelo del mundo de vídeo con un módulo de acción que condiciona la generación de acciones a partir del vídeo, siguiendo un esquema de condicionamiento unidireccional vídeo-a-acción con un calendario de acciones compartido.

El problema que aborda es el control de robots manipuladores a partir de observaciones visuales: el modelo del mundo aporta una representación predictiva del entorno y el DiT de acción traduce esa representación en comandos motores. El sufijo del nombre (`l36_d1024_b64_60k`) indica una profundidad de 36 capas, una dimensión de modelo de 1024 y un entrenamiento de 60 000 pasos con batch de 64. Los pesos publicados son los pesos EMA del checkpoint final, en bf16, empaquetados como checkpoint de `torch.distributed` (DCP) de un solo rango y sin estado del optimizador.

Es relevante porque forma parte del ecosistema Cosmos 3, que unifica comprensión, generación, simulación y acción en un modelo del mundo omnimodal, y porque ejemplifica el patrón de reutilizar un modelo del mundo de vídeo preentrenado como base para políticas robóticas. La información pública disponible es muy limitada: no hay model card extendida, ni benchmarks, ni detalles de licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento vídeo-a-acción unidireccional, calendario de acciones compartido) |
| Parametros totales | no disponible (el nombre sugiere 36 capas y dimensión 1024, sin recuento publicado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `torch.distributed.checkpoint` (DCP): `model/.metadata` y `model/__0_0.distcp`, claves `net.*`, bf16 |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes: un modelo del mundo de vídeo Cosmos3-Nano, que actúa como base preentrenada, y un DiT de acción externo que se condiciona de forma unidireccional sobre el vídeo y comparte el calendario de acciones con el modelo base. El nombre del checkpoint indica 36 capas (`l36`) y dimensión de modelo 1024 (`d1024`), aunque no se especifica el número total de parámetros ni la configuración exacta del DiT de acción. El entrenamiento se realizó sobre el dataset RoboDojo Sim en formato LeRobot v3.0, con batch de 64 y 60 000 pasos, partiendo de cero (`scratch`) para el módulo de acción y con el prefijo `djoint` que sugiere un entrenamiento conjunto de ambos componentes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO; en un modelo de política robótica estos datos probablemente no aplican. Tampoco se documentan innovaciones técnicas adicionales más allá del esquema de condicionamiento vídeo-a-acción y del uso de pesos EMA. El repositorio incluye un `config.yaml` con la configuración de entrenamiento (rutas locales sustituidas por marcadores de posición) del que el servidor de políticas de `cosmos-framework` construye el modelo y lee la longitud de chunk, la ratio de vídeo, el formato de prompt y los ajustes de estado.

## Capacidades

- Control robótico en bucle cerrado a partir de observaciones visuales, mediante el servidor de políticas de acción de `cosmos-framework`.
- Modelado del mundo de vídeo: predicción de la evolución visual del entorno como base para la generación de acciones.
- Generación de acciones motoras condicionada al vídeo con un calendario de acciones compartido entre el modelo del mundo y el DiT de acción.
- Integración con el ecosistema Cosmos 3, que según NVIDIA conecta comprensión, generación, simulación y acción en un modelo del mundo omnimodal.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en simulación: el modelo se carga en el servidor de políticas de `cosmos-framework` y genera comandos de acción a partir de observaciones de cámara, adecuado para entrenar y evaluar políticas en RoboDojo Sim antes de transferir a hardware real.
- Investigación en modelos del mundo para robótica: sirve como base para estudiar cómo un modelo del mundo de vídeo preentrenado condiciona la generación de acciones y qué representaciones aprende.
- Evaluación comparativa de esquemas de condicionamiento: al existir variantes hermanas (`decoupled`, `djoint`, `scratch`), permite comparar arquitecturas de acoplamiento entre modelo del mundo y política de acción.
- Generación de datos sintéticos de trayectorias: el modelo del mundo puede simular rollouts visuales que alimenten el entrenamiento de políticas posteriores.
- Prototipado de control visual para brazos manipuladores en entornos simulados con el formato LeRobot v3.0, aprovechando la integración nativa con ese ecosistema de datos.
- Reproducción de experimentos: el `config.yaml` y los `SHA256SUMS` permiten reconstruir el pipeline de entrenamiento y verificar la integridad de los pesos en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 32,0 GB en bf16, por lo que la inferencia requiere al menos esa cantidad de memoria más el overhead del runtime y del VAE de Wan2.2.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, se necesitan GPUs de datacenter con 40-80 GB de memoria (A100, H100) o configuraciones multi-GPU.
- Viabilidad en GPU de consumo: el checkpoint en bf16 (32 GB) no cabe en GPUs de consumo de 24 GB (RTX 4090) sin cuantización o sharding, y no se documentan formatos cuantizados.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <repo> --config-file config.yaml`; requiere además un VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_djoint_ema | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Cosmos 3 (familia, NVIDIA) | no disponible | no disponible | no disponible | no disponible | NVIDIA Cosmos Lab |

Las tres variantes de Myungkyu comparten base Cosmos3-Nano y dataset RoboDojo Sim; difieren en el esquema de acoplamiento (`djoint` frente a `decoupled`) y en el uso de pesos EMA. No se dispone de datos de rendimiento para ninguna de ellas.

## Limitaciones y advertencias

- Información pública muy escasa: no hay model card detallada, benchmarks, ni documentación de sesgos o riesgos de alucinación.
- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Idiomas no especificados: el modelo está orientado a robótica y no se documentan capacidades lingüísticas.
- Entrenado exclusivamente en RoboDojo Sim: es probable que generalice mal a entornos reales o a dominios visuales distintos del simulado, aunque esto no se cuantifica en la información disponible.
- Pesos en formato DCP de un solo rango: requiere el runtime de `cosmos-framework` y no es directamente cargable con herramientas estándar de inferencia.
- Dependencia de un VAE externo (Wan2.2) que debe descargarse por separado y configurarse en `vae_path`.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- El checkpoint no incluye estado del optimizador, por lo que no es directamente reanudable para entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_djoint_ema
- Variante hermana (`scratch`): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch
- Variante hermana (`decoupled`): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema
- Cosmos Lab, Cosmos 3 (NVIDIA): https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- VAE de Wan2.2 (dependencia): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
