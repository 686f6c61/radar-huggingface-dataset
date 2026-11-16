# Myungkyu/cosmos3_reasoner_loop12_24x4_d1024_robodojo_b64_60k_scratch_ema

## Resumen

`cosmos3_reasoner_loop12_24x4_d1024_robodojo_b64_60k_scratch_ema` es un modelo de política de acción para robótica publicado por el usuario Myungkyu en Hugging Face. Se trata de un fine-tuning del modelo de mundo de vídeo Cosmos3-Nano, al que se le acopla un DiT de acción externo mediante condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido, con el objetivo de habilitar control robótico en bucle cerrado. El resultado es un modelo que predice acciones a partir de observaciones visuales, no un generador de texto ni un modelo de lenguaje al uso.

La relevancia del modelo reside en su enfoque: en lugar de entrenar una política desde cero, reutiliza un world model de vídeo preentrenado (Cosmos3-Nano) como representación del entorno y le añade una cabeza de acción entrenada sobre el simulador RoboDojo Sim en formato LeRobot v3.0. El nombre del checkpoint indica una configuración con 12 bucles de razonamiento (`loop12`), una disposición de 24x4 y una dimensión oculta de 1024, entrenada durante 60k pasos con batch de 64 sobre pesos EMA.

El repositorio ocupa 32 GB y contiene únicamente los pesos finales en formato `torch.distributed.checkpoint` (DCP) en bf16, sin estado del optimizador. La información pública disponible es muy limitada: no se especifican licencia, idiomas, parámetros totales ni resultados de benchmarks, por lo que varios campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento vídeo-a-acción unidireccional) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `torch.distributed.checkpoint` (DCP) en bf16, claves `net.*`; requiere VAE externo Wan2.2 (`Wan2.2_VAE.pth`) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo, y le añade un Diffusion Transformer (DiT) de acción externo. El condicionamiento es unidireccional: la información visual fluye hacia la predicción de acciones, pero no al revés, y ambas ramas comparten un calendario de acciones (shared action schedule). El nombre del checkpoint sugiere una configuración con 12 bucles (`loop12`), una estructura 24x4 y una dimensión de 1024, aunque el autor no detalla en la model card el significado exacto de estos hiperparámetros.

El entrenamiento se realizó sobre el simulador RoboDojo Sim en formato LeRobot v3.0, con 60k pasos y batch de 64, partiendo de cero en la cabeza de acción (`scratch`) y publicando los pesos EMA finales (`net_ema`) convertidos a bf16. El repositorio incluye un `config.yaml` con la configuración de entrenamiento (rutas locales sustituidas por marcadores de posición) y un archivo `SHA256SUMS` con los hashes de todos los ficheros. No se especifica el número de tokens, la composición del dataset ni si hubo RLHF o DPO (no aplicable en este dominio).

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales en bucle cerrado.
- Control de políticas de acción condicionadas por vídeo (video-to-action).
- Integración con el servidor de políticas de acción de `cosmos-framework`.
- Uso como world model de vídeo subyacente (Cosmos3-Nano) para representación del entorno.
- Entrenado específicamente sobre el simulador RoboDojo Sim.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Control de robots simulados en RoboDojo Sim: el modelo predice acciones a partir de observaciones visuales, adecuado para tareas de manipulación entrenadas en dicho simulador.
- Investigación en world models para robótica: sirve como base para estudiar el acoplamiento entre un world model de vídeo y un DiT de acción.
- Evaluación de políticas video-to-action: permite reproducir el pipeline de inferencia del servidor de `cosmos-framework` con el checkpoint y el `config.yaml` proporcionados.
- Experimentos de sim-to-real preliminares: al estar entrenado en simulación, puede emplearse como punto de partida para fine-tuning en entornos reales, aunque no hay evidencia publicada de transferencia.
- Benchmarking interno de políticas de acción: útil para comparar arquitecturas de condicionamiento vídeo-a-acción frente a alternativas.
- Reproducibilidad de entrenamiento: el `config.yaml` y los hashes permiten reconstruir la configuración exacta empleada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 32 GB en bf16, por lo que cargar los pesos completos requiere al menos ese orden de memoria, además del VAE Wan2.2 externo.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, se requiere hardware de clase datacenter (A100/H100) o GPUs con suficiente memoria para cargar 32 GB de pesos en bf16.
- Cabe en consumer GPU: no disponible; improbable en GPUs de consumo de 24 GB o menos sin cuantización, que no está documentada.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <dir> --config-file config.yaml`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Entrenado exclusivamente en RoboDojo Sim: el rendimiento fuera de ese simulador o en el mundo real no está documentado.
- Pesos en formato DCP de un solo rango, sin estado del optimizador: no es un checkpoint directamente reutilizable para fine-tuning convencional.
- Requiere el VAE externo Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) para funcionar.
- El `config.yaml` contiene rutas locales sustituidas por marcadores de posición que deben reemplazarse manualmente.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Sin benchmarks publicados: no se puede evaluar su calidad frente a alternativas.
- Riesgo de sobreajuste al simulador y de degradación en condiciones no vistas; no hay datos sobre sesgos ni alucinación en el dominio robótico.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_reasoner_loop12_24x4_d1024_robodojo_b64_60k_scratch_ema
- VAE Wan2.2 (dependencia): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
