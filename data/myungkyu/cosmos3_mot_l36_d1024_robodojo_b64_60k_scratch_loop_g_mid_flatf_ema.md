# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_flatf_ema

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) de vídeo orientado a robótica, desarrollado en el ecosistema del Cosmos Framework (NVIDIA) y publicado por el usuario Myungkyu en Hugging Face. Esta variante concreta es un ajuste fino del modelo base Cosmos3-Nano que incorpora un DiT de acción externo con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido, pensado para control robótico en bucle cerrado. El problema que aborda es la generación de políticas de acción a partir de observaciones visuales, un componente central en el aprendizaje por imitación y la robótica basada en modelos generativos.

El identificador del repositorio codifica parte de su configuración: `l36` (36 capas), `d1024` (dimensión oculta de 1024), `b64` (batch de 64), `60k` (60.000 pasos de entrenamiento), `scratch` (entrenamiento desde cero en esta fase), `loop_g` (bucle de control) y `ema` (pesos de media móvil exponencial). El ajuste se realizó sobre el dataset RoboDojo Sim en formato LeRobot v3.0. El repositorio ocupa 32 GB y contiene únicamente los pesos EMA finales en bf16, sin estado del optimizador.

Es relevante ahora porque ejemplifica el patrón emergente de usar modelos generativos de vídeo como base para políticas robóticas, un enfoque que aprovecha el conocimiento físico y visual aprendido a gran escala. No obstante, se trata de un artefacto de investigación con documentación mínima, sin licencia declarada ni benchmarks publicados, por lo que su adopción en producción requiere validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo DiT (Cosmos3-Nano) con DiT de acción externo; condicionamiento vídeo-a-acción unidireccional |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); otras no disponibles |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP), claves `net.*`, bf16 |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo, y le añade un DiT de acción externo que se condiciona de forma unidireccional desde el vídeo, compartiendo el calendario de acciones (action schedule) con el modelo base. La configuración del identificador sugiere 36 capas y una dimensión de 1024, con un entrenamiento de 60.000 pasos y batch de 64. El ajuste fino se realizó sobre RoboDojo Sim, un entorno de simulación robótica en formato LeRobot v3.0, y el objetivo es el control en bucle cerrado: el modelo genera acciones a partir de observaciones visuales y las ejecuta iterativamente.

Los pesos publicados corresponden a la EMA (media móvil exponencial) del checkpoint final de entrenamiento, convertidos a bf16 y almacenados bajo los nombres `net.*` como un checkpoint DCP de un solo rango, sin estado del optimizador. El repositorio incluye un `config.yaml` con la configuración de entrenamiento (rutas locales sustituidas por marcadores) del que el servidor de políticas de cosmos-framework construye el modelo, leyendo la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado. Para cargarlo es necesario apuntar `vae_path` a un VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B). No se detalla en la información disponible la composición del dataset, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales (política de acción vídeo-a-acción).
- Control en bucle cerrado: el identificador `loop_g` y la descripción indican ejecución iterativa de acciones.
- Modelado de mundo de vídeo heredado de Cosmos3-Nano.
- Integración con el servidor de políticas de acción de cosmos-framework mediante `config.yaml`.
- Condicionamiento unidireccional vídeo-a-acción con calendario de acciones compartido.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo; el modelo está especializado en robótica.

## Casos de uso

- Investigación en aprendizaje por imitación: usar el modelo como política base en entornos simulados tipo RoboDojo para comparar estrategias de condicionamiento vídeo-a-acción frente a políticas puramente reactivas.
- Manipulación robótica simulada: generar trayectorias de acción a partir de cámaras en escenas de simulación, aprovechando el conocimiento físico del world model subyacente.
- Evaluación de world models como políticas: medir hasta qué punto un modelo de vídeo preentrenado transfiere a control, útil para estudiar la relación entre predicción visual y acción.
- Prototipado de pipelines de control en bucle cerrado: integrar el modelo en el servidor de cosmos-framework para validar la cadencia de inferencia y la estabilidad del bucle antes de escalar a hardware real.
- Generación de datos sintéticos de política: emplear las acciones generadas para aumentar datasets de demostración en simulación y entrenar políticas más ligeras.
- Benchmarking interno de robótica: servir como referencia reproducible (con `SHA256SUMS` y `config.yaml`) en comparativas de políticas basadas en modelos generativos dentro de un laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio de 32 GB en bf16 sugiere un modelo del orden de decenas de miles de millones de parámetros o pesos de gran tamaño, por lo que la inferencia en bf16 probablemente requiera GPUs de centro de datos con 40-80 GB de VRAM. Dato no confirmado en la información disponible.
- GPU recomendadas: no disponibles de forma explícita; por tamaño del checkpoint, se orienta a A100/H100 o equivalentes.
- GPU de consumo: no confirmado; la carga en RTX 4090 (24 GB) requeriría cuantización o particionado no documentados.
- Despliegue: servidor de políticas de acción de cosmos-framework con `--checkpoint-path <repo> --config-file config.yaml`; requiere el VAE de Wan2.2 (`Wan2.2_VAE.pth`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano (base) | World model de vídeo | no disponible | no disponible | no disponible | Ecosistema Cosmos |
| Esta variante (Myungkyu) | World model + DiT de acción | no disponible (l36, d1024) | no disponible | no disponible | Hugging Face, 32 GB |
| Políticas robóticas tipo diffusion policy / ACT | Política de imitación | típicamente < 1B | no aplica | variable | Amplia |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparativa se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Documentación mínima: no hay model card extendida, benchmarks ni descripción del dataset más allá de "RoboDojo Sim".
- Entrenado en simulación: el salto a hardware real (sim-to-real) no está validado en la información disponible.
- Pesos solo en bf16 y formato DCP: no hay GGUF ni safetensors estándar, lo que limita herramientas de despliegue habituales.
- Requiere dependencias externas: el VAE de Wan2.2 y el servidor de cosmos-framework, lo que añade complejidad de integración.
- Riesgo de alucinación visual y de acciones fuera de distribución en escenas no vistas durante el entrenamiento.
- Sin información sobre sesgos, idiomas ni robustez frente a perturbaciones.
- Checkpoint de investigación (0 descargas, 0 likes en el momento de la consulta): sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_flatf_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Cosmos Framework (NVIDIA): no disponible en la información proporcionada
