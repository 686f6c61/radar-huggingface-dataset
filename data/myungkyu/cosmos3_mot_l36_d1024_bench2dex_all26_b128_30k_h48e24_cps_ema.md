# Myungkyu/cosmos3_mot_l36_d1024_bench2dex_all26_b128_30k_h48e24_cps_ema

## Resumen

`cosmos3_mot_l36_d1024_bench2dex_all26_b128_30k_h48e24_cps_ema` es un modelo de mundo (world model) de vídeo para robótica, afinado a partir de Cosmos3-Nano y acoplado a un DiT de acciones externo para control robótico en bucle cerrado. Lo publica el usuario Myungkyu en Hugging Face bajo la librería `cosmos-framework`, y su función es convertir observaciones visuales en acciones motrices (política vídeo-a-acción) para 12 morfologías de robot distintas.

El nombre codifica la configuración: 36 capas (`l36`), dimensión oculta de 1024 (`d1024`), entrenamiento sobre el conjunto completo de 26 configuraciones de Bench2Dex (`bench2dex_all26`), batch de 128 (`b128`), 30 000 pasos (`30k`), 48 cabezas de atención y 24 de expertos (`h48e24`), con pesos EMA (`ema`). El repositorio ocupa 32,8 GB en precisión bf16 y se distribuye como checkpoint `torch.distributed` (DCP) de un solo rango, sin estado del optimizador.

Su relevancia es acotada pero específica: es un artefacto de investigación reproducible para quien quiera evaluar políticas vídeo-a-acción sobre múltiples embodiments con el stack Cosmos, no un modelo de propósito general. La model card no documenta licencia, idiomas ni resultados de benchmarks, lo que limita su uso directo en producción sin validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de vídeo Cosmos3-Nano con DiT de acciones externo; condicionamiento unidireccional vídeo-a-acción y schedule de acciones compartido |
| Parámetros totales | no disponible (configuración: 36 capas, d_model 1024, 48 cabezas, 24 expertos) |
| Parámetros activos | no disponible (la nomenclatura `h48e24` sugiere mezcla de expertos, sin cifra publicada) |
| Longitud de contexto | no disponible (depende de la longitud de chunk y ratio de vídeo definidos en `config.yaml`) |
| Tipos de cuantización | no disponible; pesos publicados en bf16 |
| Idiomas soportados | no disponible (modelo orientado a percepción visual y acciones, no a texto) |
| Licencia | no disponible |
| Formato de pesos | `torch.distributed.checkpoint` (DCP): `model/.metadata` y `model/__0_0.distcp`, claves `net.*`, bf16 |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo basado en transformer de difusión, y se afina con un DiT de acciones externo. La condición vídeo-a-acción es unidireccional: la representación visual alimenta al generador de acciones, y ambos comparten un mismo schedule de acciones, lo que permite generar trayectorias motrices coherentes con la evolución del vídeo predicho. El sufijo `mot` del identificador apunta a una variante de mezcla de tokens o expertos, y la configuración `h48e24` (48 cabezas, 24 expertos) indica un diseño con capas de mezcla de expertos, aunque la model card no detalla el mecanismo exacto.

El entrenamiento se realizó sobre Bench2Dex, cubriendo las 26 configuraciones de tarea y 12 embodiments en formato LeRobot v3.0, con batch de 128 durante 30 000 pasos. Los pesos publicados son los EMA (`net_ema`) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`, sin estado del optimizador. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de acciones.

## Capacidades

- Predicción de vídeo futuro condicionada a la observación, como world model de base.
- Generación de acciones robóticas en bucle cerrado a partir de entrada visual (política vídeo-a-acción).
- Control multi-embodiment: cubre 12 morfologías distintas gracias al entrenamiento sobre las 26 configuraciones de Bench2Dex.
- Ejecución de tareas de manipulación diestra (`bench2dex`) en entornos simulados o reales compatibles con LeRobot v3.0.
- Integración con el servidor de políticas de acciones de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- Soporte de tool calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio o capacidades multilingües: no disponible; el modelo no está orientado a esas tareas.

## Casos de uso

- Evaluación de políticas vídeo-a-acción en investigación: cargar el checkpoint en el servidor de `cosmos-framework` y medir la tasa de éxito sobre las 26 configuraciones de Bench2Dex para reproducir o comparar resultados.
- Control de manipuladores diestros en simulación: usar el modelo como política para generar acciones de dedos y muñeca en tareas de destreza, aprovechando el entrenamiento específico sobre `bench2dex`.
- Transferencia entre embodiments: desplegar el mismo checkpoint sobre distintas morfologías de robot incluidas en el conjunto de 12 embodiments para estudiar la generalización del control.
- Generación de datos sintéticos de vídeo: emplear la componente de world model para predecir rollouts visuales y aumentar datasets de entrenamiento de políticas.
- Planificación con modelo de mundo: integrar la predicción de vídeo en bucles de planificación basados en simulación interna, donde el modelo anticipa el efecto de las acciones antes de ejecutarlas.
- Baseline en comparativas de robótica: servir como referencia afinada de Cosmos3-Nano para contrastar nuevas arquitecturas de políticas sobre el mismo benchmark y protocolo de evaluación.
- Prototipado de pipelines LeRobot: validar la integración de checkpoints DCP y configuraciones YAML en flujos de entrenamiento y evaluación con datos en formato LeRobot v3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 32,8 GB en bf16; la inferencia requiere cargar el checkpoint completo en memoria de GPU o repartirlo entre varias GPU.
- VRAM estimada: al menos 40 GB para bf16 en una sola GPU, sin contar el VAE de Wan2.2 ni el DiT de acciones; con cuantización a 8 bits podría reducirse a unos 20-24 GB, aunque no se documentan pesos cuantizados.
- GPU recomendadas: A100 80 GB, H100 80 GB o varias GPU de 24-48 GB con `torch.distributed`; una RTX 4090 de 24 GB no cabe en bf16 sin particionado o cuantización.
- Consumer GPU: solo viable con cuantización agresiva y recortes de resolución o longitud de chunk, no soportados oficialmente.
- Despliegue: servidor de políticas de acciones de `cosmos-framework` (`--checkpoint-path` y `--config-file`); requiere `vae_path` apuntando a `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Cosmos3-Nano + DiT de acciones) | no disponible | no disponible | Política vídeo-a-acción multi-embodiment | no disponible | Hugging Face, DCP bf16 |
| Cosmos3-Nano (base) | no disponible | no disponible | World model de vídeo | no disponible | no disponible en la información |
| Políticas tipo diffusion policy sobre LeRobot | variable | variable | Control robótico por imitación | variable | repositorios públicos |
| Modelos VLA generalistas (p. ej. familias OpenVLA/π) | variable | variable | Visión-lenguaje-acción | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: la model card no publica métricas ni especifica el tamaño total de parámetros, y no se han identificado en la información proporcionada modelos directamente comparables con la misma combinación de world model y DiT de acciones sobre Bench2Dex.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Checkpoint de investigación: es un estado intermedio de entrenamiento (EMA, sin optimizador) y no una versión validada para producción.
- Dependencia estricta del stack: requiere `cosmos-framework`, el VAE de Wan2.2 y una configuración YAML con rutas sustituidas por marcadores; la carga fuera de ese servidor no está soportada.
- Formato DCP de un solo rango: complica la conversión a safetensors o GGUF y la integración con herramientas de inferencia habituales.
- Sesgos y alucinación: no documentados; en un world model, el riesgo se traduce en rollouts visuales plausibles pero físicamente incorrectos que degradan la política.
- Cobertura limitada a Bench2Dex y 12 embodiments: el rendimiento fuera de esa distribución (nuevas morfologías, iluminación, objetos) no está garantizado.
- Sin datos de benchmarks ni de latencia: imposible estimar la tasa de éxito o los requisitos temporales reales sin evaluación propia.
- Idiomas no aplicables: el modelo no procesa texto de usuario, por lo que no se puede usar como asistente conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_bench2dex_all26_b128_30k_h48e24_cps_ema
- VAE requerido (Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos (NVIDIA): no disponible en la información proporcionada
- Paper de Cosmos3: no disponible en la información proporcionada
- Dataset Bench2Dex: no disponible en la información proporcionada
- Repositorio `cosmos-framework`: no disponible en la información proporcionada
