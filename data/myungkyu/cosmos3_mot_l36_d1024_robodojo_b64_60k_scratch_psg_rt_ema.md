# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_rt_ema

## Resumen

Cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_rt_ema es un modelo de política de acción para control robótico en bucle cerrado, desarrollado por el usuario Myungkyu y publicado bajo el paraguas del framework Cosmos. Se trata de un modelo del mundo de vídeo Cosmos3-Nano afinado con un DiT de acción externo, con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido. El resultado es un modelo que predice acciones motoras a partir de observaciones visuales, pensado para su uso como servidor de políticas en robótica.

El modelo se ha entrenado sobre el simulador RoboDojo Sim en formato LeRobot v3.0, con un nombre que codifica su configuración: arquitectura MoT (Mixture of Transformers) de 36 capas y dimensión 1024, batch de 64, 60 000 pasos, entrenamiento desde cero (scratch), con prompt de estado y EMA de pesos. El repositorio ocupa 32 GB y contiene únicamente los pesos EMA en bf16 del checkpoint final, empaquetados como checkpoint distribuido de PyTorch (DCP) de un solo rango, sin estado del optimizador.

Es relevante ahora porque ejemplifica la tendencia de reutilizar modelos del mundo de vídeo como base para políticas robóticas, un enfoque que aprovecha el conocimiento visual previo para reducir el coste de entrenamiento en dominios de manipulación. No obstante, es un artefacto de investigación: no hay model card extendida, ni licencia declarada, ni resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoT (Mixture of Transformers) sobre Cosmos3-Nano, con DiT de acción externo |
| Parámetros totales | no disponible (dimensión 1024 y 36 capas según el nombre; recuento exacto no publicado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | DCP (torch.distributed.checkpoint) en bf16, claves `net.*` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo del mundo de vídeo, y le añade un DiT de acción externo con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido. La nomenclatura del repositorio indica una configuración MoT de 36 capas y dimensión 1024, entrenada desde cero (scratch) durante 60 000 pasos con batch de 64 sobre el simulador RoboDojo Sim en formato LeRobot v3.0. El entrenamiento emplea un prompt de estado (psg) y guarda los pesos EMA finales (rt_ema) convertidos a bf16 bajo los nombres `net.*`.

El checkpoint publicado es un DCP de un solo rango que conserva únicamente el conjunto de pesos EMA del checkpoint final, sin el otro conjunto de pesos ni el estado del optimizador. El repositorio incluye un `config.yaml` con la configuración de entrenamiento (con rutas locales sustituidas por marcadores `<Cosmos3-Nano-dcp>`, `<dataset root>` y `<Wan2.2_VAE.pth>`), un fichero `SHA256SUMS` con los hashes de todos los archivos y el propio checkpoint en `model/__0_0.distcp`. El servidor de políticas del framework Cosmos reconstruye el modelo a partir de esa configuración y lee de ella la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado. Para cargarlo es necesario apuntar `vae_path` a un fichero VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B).

## Capacidades

- Predicción de acciones motoras a partir de observaciones visuales para control robótico en bucle cerrado.
- Condicionamiento vídeo-a-acción mediante un DiT de acción externo con calendario de acciones compartido.
- Modelado del mundo de vídeo heredado de Cosmos3-Nano, que aporta representaciones visuales previas.
- Soporte de prompt de estado (state prompt) para incorporar información del estado del robot.
- Integración con el servidor de políticas de cosmos-framework mediante `--checkpoint-path` y `--config-file`.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Manipulación robótica en simulación: el modelo predice acciones a partir de observaciones visuales en RoboDojo Sim, lo que permite evaluar políticas en bucle cerrado antes de transferirlas a un robot real.
- Investigación en modelos del mundo aplicados a robótica: sirve como base para estudiar cómo el conocimiento visual de un modelo de vídeo se transfiere a la predicción de acciones.
- Reentrenamiento y ablaciones: al publicarse la configuración de entrenamiento y los pesos EMA, se puede reutilizar como punto de partida para experimentos con otros datasets LeRobot v3.0.
- Evaluación de condicionamiento vídeo-a-acción: útil para comparar arquitecturas de DiT de acción con calendario compartido frente a alternativas de condicionamiento bidireccional.
- Integración en pipelines de simulación a gran escala: el servidor de políticas de cosmos-framework permite desplegarlo como servicio y conectar simuladores mediante la configuración de chunk y ratio de vídeo.
- Reproducibilidad de experimentos: los hashes SHA-256 y la configuración permiten verificar la integridad de los pesos y reconstruir el entorno de entrenamiento con sustituciones de rutas controladas.
- Prototipado de control cerrado con estado del robot: el prompt de estado permite incorporar la configuración articular actual en la predicción de la siguiente acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 32 GB en bf16, por lo que la carga completa requiere al menos ese orden de magnitud de memoria, más el VAE de Wan2.2 y el DiT de acción.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, se necesitan GPU profesionales con memoria suficiente (A100 80 GB, H100 80 GB) para cargar los pesos en bf16 sin cuantización.
- ¿Cabe en GPU de consumo? No disponible; con 32 GB de pesos en bf16, una RTX 4090 (24 GB) no podría cargarlos sin cuantización o sharding, y no se documentan formatos GGUF ni cuantizaciones alternativas.
- Opciones de despliegue: servidor de políticas de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`), que reconstruye el modelo desde el DCP y la configuración. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_rt_ema | no disponible (36 capas, dim. 1024) | no disponible | sin benchmarks publicados | no disponible | HuggingFace (DCP, bf16) |
| Cosmos3-Nano (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de política robótica (p. ej. RT-2, OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Modelo de investigación sin model card extendida: no hay documentación sobre sesgos, alucinación ni límites de contexto o idioma.
- Entrenado exclusivamente en RoboDojo Sim: el rendimiento en el mundo real o en otros simuladores no está documentado y probablemente requiera ajuste.
- Checkpoint parcial: solo contiene los pesos EMA finales en bf16, sin estado del optimizador ni el otro conjunto de pesos, lo que limita la reanudación exacta del entrenamiento.
- Dependencia de un VAE externo (Wan2.2_VAE.pth de Wan-AI/Wan2.2-TI2V-5B) y de rutas locales sustituidas por marcadores en `config.yaml`, lo que exige configuración manual.
- Formato DCP de un solo rango: no es directamente compatible con herramientas de inferencia estándar como llama.cpp u Ollama.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Riesgo de sobreajuste al simulador y al formato LeRobot v3.0 concreto del dataset de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_psg_rt_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
