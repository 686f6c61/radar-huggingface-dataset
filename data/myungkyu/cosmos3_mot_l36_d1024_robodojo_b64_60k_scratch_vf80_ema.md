# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf80_ema

## Resumen

Cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf80_ema es un modelo de mundo (world model) de vídeo orientado a robótica, afinado a partir de Cosmos3-Nano con un DiT de acción externo para control robótico en bucle cerrado. Lo publica el usuario Myungkyu en Hugging Face bajo el paraguas del framework Cosmos (cosmos-framework) y combina una condicion de vídeo-a-acción unidireccional con un calendario de acciones compartido. El modelo no genera texto: su función es predecir acciones y dinámica visual para que un robot ejecute tareas.

El repositorio, de 32 GB, contiene únicamente los pesos EMA del checkpoint final de entrenamiento en bf16, empaquetados como un checkpoint de `torch.distributed` (DCP) de un solo rango, sin estado del optimizador. El entrenamiento se realizó sobre el simulador RoboDojo (dataset en formato LeRobot v3.0) con 60.000 pasos, batch de 64 y un ratio de vídeo del 80 %. El nombre codifica la arquitectura: 36 capas (l36), dimensión 1024 (d1024).

Su relevancia es acotada pero específica: es un artefacto de investigación reproducible para quien quiera evaluar políticas de acción basadas en modelos de mundo de vídeo dentro del ecosistema Cosmos, con instrucciones de carga explícitas para el servidor de políticas de cosmos-framework. No es un modelo de propósito general ni un asistente conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (modelo de mundo de vídeo, DiT) + DiT de acción externo con condicionamiento vídeo-a-acción unidireccional |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (único formato publicado) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/__0_0.distcp` y `model/.metadata`, claves `net.*` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo de mundo de vídeo basado en transformer de difusión (DiT), y le acopla un DiT de acción externo. La condicionalidad es unidireccional: el vídeo condiciona la acción, y ambas ramas comparten un calendario de acciones (shared action schedule). La configuración concreta es de 36 capas y dimensión oculta 1024, según el identificador del repositorio. El VAE utilizado para codificar vídeo es el de Wan2.2 (Wan2.2_VAE.pth de Wan-AI/Wan2.2-TI2V-5B), que debe proporcionarse localmente al cargar el modelo.

El entrenamiento se hizo desde cero (scratch) sobre RoboDojo Sim en formato LeRobot v3.0, con 60.000 pasos, batch de 64 y un ratio de vídeo del 80 %. Los pesos publicados son los EMA (net_ema) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`; no se incluye el estado del optimizador ni el otro conjunto de pesos del checkpoint de entrenamiento. No se dispone de información sobre el número total de tokens vistos, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas en bucle cerrado a partir de observaciones de vídeo.
- Modelado de mundo de vídeo: generación/predicción de dinámica visual coherente con las acciones.
- Condicionamiento vídeo-a-acción unidireccional mediante un DiT de acción dedicado.
- Integración con el servidor de políticas de cosmos-framework para despliegue como action policy.
- Entrenado específicamente sobre el simulador RoboDojo, por lo que su dominio es la manipulación robótica simulada.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso

- Evaluación de políticas de acción en simulación: cargar el checkpoint en el servidor de cosmos-framework y ejecutar episodios en RoboDojo para medir la tasa de éxito de la política entrenada.
- Investigación en modelos de mundo para robótica: usar la rama de predicción de vídeo para estudiar cómo el modelo anticipa la dinámica de la escena bajo distintas acciones.
- Reproducción de experimentos: al publicarse los pesos EMA y el `config.yaml` con los hiperparámetros (longitud de chunk, ratio de vídeo, formato de prompt y ajustes de estado), permite replicar el entrenamiento y comparar variantes.
- Punto de partida para fine-tuning: servir como inicialización para nuevas políticas sobre otros datasets en formato LeRobot v3.0, sustituyendo las rutas locales del config.
- Estudio de condicionamiento vídeo-a-acción: analizar el comportamiento del DiT de acción acoplado a un modelo de mundo de vídeo en tareas de control continuo.
- Integración en pipelines de simulación a realidad: validar primero en RoboDojo la política y la dinámica aprendida antes de transferir el esquema a un robot físico, dado que el modelo se entrenó íntegramente en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 32 GB en bf16, por lo que la inferencia requiere al menos una GPU con capacidad suficiente para cargar los pesos completos más el VAE de Wan2.2 y las activaciones.
- GPU recomendadas: no especificadas por el autor; por el tamaño del checkpoint, se requiere hardware de clase数据中心 (A100/H100 de 80 GB) o reparto multi-GPU.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) en bf16; no se publican pesos cuantizados (GGUF, AWQ, GPTQ) que lo permitan.
- Opciones de despliegue: servidor de políticas de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf80_ema | no disponible (l36, d1024) | no disponible | World model de vídeo + política de acción | no disponible | Hugging Face, DCP bf16 |
| Cosmos3-Nano (modelo base) | no disponible | no disponible | World model de vídeo | no disponible | Referenciado como base |
| Wan2.2-TI2V-5B (VAE usado) | ~5B (VAE) | no disponible | Generación de vídeo texto-imagen-vídeo | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado exclusivamente en RoboDojo Sim: el rendimiento en entornos reales o en otros simuladores no está validado y probablemente degrade.
- Solo se publican los pesos EMA en bf16 como DCP de un rango; no hay estado del optimizador, lo que dificulta reanudar el entrenamiento tal cual.
- El `config.yaml` contiene rutas locales sustituidas por marcadores (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`); es necesario editar `vae_path` con un archivo local del VAE de Wan2.2.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sin información sobre sesgos, tasa de alucinación (en el sentido de predicciones físicamente inconsistentes) ni límites de contexto.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- El repositorio es de 32 GB; el almacenamiento y el ancho de banda para desplegarlo son considerables.
- No apto para tareas de texto, código o conversación: es un modelo de robótica y world model.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf80_ema
- VAE de referencia (Wan2.2): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
