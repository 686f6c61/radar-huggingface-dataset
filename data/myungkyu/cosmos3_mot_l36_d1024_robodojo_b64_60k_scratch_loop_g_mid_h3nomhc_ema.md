# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3nomhc_ema

## Resumen

Cosmos3-Nano es un modelo del mundo (world model) para vídeo orientado a robótica, desarrollado en el ecosistema Cosmos y publicado por el usuario Myungkyu en Hugging Face. Esta variante concreta se ha ajustado fino (fine-tuning) sobre el dataset de simulación RoboDojo Sim en formato LeRobot v3.0 para funcionar como política de acción en control robótico en bucle cerrado. El modelo combina un backbone de vídeo Cosmos3-Nano con un DiT de acción externo que se condiciona de forma unidireccional desde el vídeo a la acción, compartiendo el calendario de difusión entre ambas modalidades.

El nombre del repositorio codifica parte de su configuración: `l36_d1024` sugiere 36 capas y dimensión oculta de 1024, `b64` un tamaño de batch de 64 y `60k` unas 60.000 iteraciones de entrenamiento desde cero (`scratch`). El sufijo `ema` indica que los pesos publicados son los pesos EMA (media móvil exponencial) del checkpoint final, convertidos a bf16, sin estado del optimizador.

La relevancia de este modelo es acotada pero específica: se trata de un artefacto de investigación para evaluación de políticas de acción basadas en modelos del mundo en entornos simulados de robótica, distribuido como checkpoint DCP de rango único y pensado para cargarse con el servidor de políticas del framework Cosmos. No es un modelo de lenguaje generalista ni está pensado para inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) con DiT de acción externo; condicionamiento unidireccional vídeo-a-acción y calendario de difusión compartido |
| Parametros totales | no disponible (el nombre sugiere 36 capas y dimensión 1024, sin recuento oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo orientado a vídeo y acción, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata` y `model/__0_0.distcp`, claves `net.*`, bf16 |
| Tamano del repositorio | 32,0 GB |
| Dataset de ajuste | RoboDojo Sim (LeRobot v3.0) |
| VAE requerido | Wan2.2 VAE (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) |
| Framework de carga | cosmos-framework (servidor de políticas de acción) |

## Arquitectura y entrenamiento

El modelo se construye sobre Cosmos3-Nano, un world model de vídeo del framework Cosmos, al que se añade un DiT (Diffusion Transformer) de acción externo. La conexión entre modalidades es unidireccional: el vídeo condiciona la generación de acciones, y ambas ramas comparten un mismo calendario de difusión (shared action schedule), lo que permite integrar la predicción de acciones en el mismo proceso generativo que la dinámica visual. Este diseño está pensado para control robótico en bucle cerrado, donde el modelo predice acciones a partir de la observación visual y las ejecuta de forma iterativa.

El ajuste fino se realizó sobre RoboDojo Sim, un entorno de simulación distribuido en formato LeRobot v3.0. Según el nombre del repositorio, el entrenamiento partió desde cero (`scratch`) con batch de 64 y 60.000 iteraciones. Los pesos publicados corresponden a la EMA del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`, como checkpoint DCP de rango único sin estado del optimizador. El `config.yaml` incluido contiene la configuración de entrenamiento con rutas locales sustituidas por marcadores de posición (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`); el servidor construye el modelo a partir de ella y lee la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado. No se detalla en la información disponible el volumen de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas condicionada por vídeo, con condicionamiento unidireccional vídeo-a-acción.
- Modelado de dinámica visual (world model) sobre secuencias de vídeo.
- Control en bucle cerrado: el modelo genera acciones que se realimentan con nuevas observaciones.
- Integración con el servidor de políticas de acción de cosmos-framework mediante `--checkpoint-path` y `--config-file`.
- Configurabilidad de longitud de chunk, ratio de vídeo, formato de prompt y ajustes de estado a través de `config.yaml`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de políticas de acción en simulación: cargar el checkpoint en el servidor de cosmos-framework y ejecutar episodios en RoboDojo Sim para medir la tasa de éxito de la política en tareas de manipulación, aprovechando que el modelo fue ajustado específicamente sobre ese entorno.
- Investigación en world models para robótica: usar la rama de vídeo para estudiar cómo el condicionamiento visual influye en la distribución de acciones generadas, comparando con variantes sin EMA o con otros schedules de difusión.
- Generación de trayectorias sintéticas: emplear el modelo para producir secuencias de acciones plausibles a partir de observaciones, que sirvan como datos de aumento para entrenar políticas más ligeras.
- Reproducción de experimentos: el repositorio incluye `SHA256SUMS` y `config.yaml`, lo que permite reproducir la carga exacta del checkpoint y verificar la integridad de los pesos en pipelines de investigación.
- Prototipado de control cerrado en laboratorio: integrar el servidor de políticas en un bucle de simulación para validar la latencia y la estabilidad del control antes de transferir a hardware real.
- Estudio de dinámicas visuales: analizar las predicciones de vídeo del backbone Cosmos3-Nano para evaluar su coherencia temporal en escenas del dataset RoboDojo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 32,0 GB en bf16, por lo que la inferencia requiere al menos una GPU con capacidad suficiente para alojar los pesos más el VAE Wan2.2 y las activaciones del DiT de acción.
- GPU recomendadas: no disponibles en la documentación; por el tamaño del checkpoint, se requiere hardware de clase数据中心 (A100/H100) o GPUs de gran memoria.
- ¿Cabe en GPU de consumo? No se especifica; con 32 GB de pesos en bf16, no cabe en GPUs de 24 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: servidor de políticas de acción de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo (este) | World model de vídeo + DiT de acción | no disponible (36 capas, dim. 1024 según nombre) | no disponible | no disponible | Hugging Face, formato DCP |
| Cosmos3-Nano (base) | World model de vídeo | no disponible | no disponible | no disponible | Ecosistema Cosmos |
| Wan2.2-TI2V-5B (VAE asociado) | Modelo de vídeo texto-imagen | ~5B (según nombre) | no disponible | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Modelo de investigación: es un checkpoint de ajuste fino sobre un simulador concreto (RoboDojo Sim), por lo que su generalización a entornos reales no está validada.
- Formato de pesos no estándar: DCP de rango único con claves `net.*`; requiere el servidor de cosmos-framework y no es cargable directamente con transformers, vLLM o llama.cpp.
- Dependencia externa: necesita el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B, que no se incluye en el repositorio.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: al no ser un modelo de lenguaje, estas categorías no aplican directamente, pero no se documenta el comportamiento del world model ante escenas fuera de distribución.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes de uso.
- El `config.yaml` contiene rutas locales sustituidas por marcadores; es necesario reconfigurar `vae_path` y las rutas del dataset para su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3nomhc_ema
- VAE asociado (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos: no disponible en la información proporcionada
