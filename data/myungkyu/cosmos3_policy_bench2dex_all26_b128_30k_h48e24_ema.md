# Myungkyu/cosmos3_policy_bench2dex_all26_b128_30k_h48e24_ema

## Resumen

Cosmos3_policy_bench2dex_all26_b128_30k_h48e24_ema es un modelo de política de acciones (action policy) para control robótico de bucle cerrado, obtenido mediante fine-tuning del world model de vídeo Cosmos3-Nano. Lo desarrolla el usuario de HuggingFace Myungkyu y se distribuye bajo el paraguas del framework cosmos-framework, con la etiqueta de pipeline `robotics`. El modelo transforma observaciones visuales en secuencias de acciones motoras mediante tokens de acción inline y un condicionamiento unidireccional vídeo-a-acción, lo que lo sitúa en la categoría de políticas visomotoras entrenadas sobre un modelo generativo de vídeo preentrenado.

La relevancia de esta ficha es acotada pero técnicamente interesante: no es un modelo de lenguaje ni un asistente conversacional, sino un artefacto de investigación para manipulación robótica de destreza. Se ha entrenado de forma conjunta sobre los 26 ajustes del benchmark Bench2Dex, repartidos en 12 encarnaciones (embodiments) distintas, con proyecciones MLP específicas por encarnación y chunks de 48 acciones a 20 Hz. El repositorio ocupa 31,7 GB y contiene únicamente los pesos EMA en bf16 en formato torch.distributed.checkpoint (DCP), sin estado del optimizador.

No se dispone de información sobre licencia, idiomas, benchmarks publicados ni número de parámetros en la documentación proporcionada. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de publicación reciente o de circulación interna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World model de vídeo Cosmos3-Nano adaptado como política de acciones (action policy) con tokens de acción inline y condicionamiento unidireccional vídeo-a-acción |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (chunks de 48 acciones a 20 Hz, es decir, 2,4 s de horizonte de acción) |
| Tipos de cuantización | bf16 (pesos EMA almacenados en bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo visomotor, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata` y `model/__0_0.distcp`, con claves `net.*` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo, y lo reconfigura como política de acciones para control robótico. La adaptación emplea tokens de acción inline dentro del flujo del modelo, condicionamiento unidireccional de vídeo a acción (la observación visual condiciona la predicción de acciones, no al revés) y un esquema de acciones compartido (shared action schedule). La salida se organiza en chunks de 48 acciones a 20 Hz, lo que equivale a un horizonte de 2,4 segundos por predicción. El modelo incorpora proyecciones MLP de entrada y salida de acciones específicas por encarnación, con 40 identificadores de encarnación distintos, lo que permite co-entrenar sobre morfologías heterogéneas.

El entrenamiento se realizó con batch de 128 y 30.000 iteraciones sobre los 26 ajustes de Bench2Dex en sus 12 encarnaciones, usando los doce exports LeRobot v3.0 por encarnación de `Bench2Dex/teleopdata` (repositorio `Myungkyu/bench2dex_<alias>_lerobot_v30`, y `bench2dex_ur5_rh56dfx_3_lerobot_v30` para los ajustes 06, 12 y 42 de UR5 + RH56DFX). Los pesos publicados son los EMA (`net_ema`, convertidos a bf16 y almacenados bajo los nombres `net.*`) del checkpoint final, sin estado del optimizador. El `config.yaml` incluido contiene la configuración de entrenamiento con rutas locales sustituidas por marcadores de posición, y el servidor de políticas de cosmos-framework construye el modelo a partir de él; es necesario apuntar `vae_path` a un archivo local `Wan2.2_VAE.pth` del modelo Wan-AI/Wan2.2-TI2V-5B.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset más allá de las fuentes citadas, ni si hubo RLHF o DPO (poco probable en un modelo de política robótica).

## Capacidades

- Generación de secuencias de acciones motoras para control robótico de bucle cerrado a partir de observaciones visuales.
- Condicionamiento visomotor: traduce vídeo/observación a acciones mediante un world model de vídeo preentrenado.
- Soporte multi-encarnación: 40 identificadores de encarnación y proyecciones MLP específicas por encarnación para 12 morfologías de robot.
- Predicción en chunks de 48 acciones a 20 Hz (horizonte de 2,4 s), adecuada para control continuo.
- Co-entrenamiento sobre 26 ajustes del benchmark Bench2Dex, lo que implica capacidad de generalización entre tareas de destreza.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento lingüístico, matemáticas, visión general, audio ni modo thinking. Es un modelo exclusivamente visomotor.

## Casos de uso

- Manipulación robótica de destreza en laboratorio: el modelo se usaría como política de control en un brazo robótico (por ejemplo, UR5 con pinza RH56DFX) para ejecutar tareas de Bench2Dex, prediciendo chunks de 48 acciones a 20 Hz a partir de la cámara de observación.
- Investigación en políticas visomotoras: sirve como baseline reproducible para comparar estrategias de condicionamiento vídeo-a-acción frente a políticas puramente reactivas, gracias a que el checkpoint y la configuración de entrenamiento están publicados.
- Evaluación multi-encarnación: con 40 identificadores de encarnación y proyecciones específicas, permite estudiar la transferencia entre morfologías robóticas distintas dentro de un mismo modelo.
- Teleoperación asistida y aprendizaje por imitación: al estar entrenado sobre datos de teleoperación LeRobot v3.0, puede emplearse para inicializar políticas en nuevos ajustes de recogida y colocación.
- Prototipado de control en bucle cerrado: integrado en el servidor de políticas de cosmos-framework (`--checkpoint-path` y `--config-file`), sirve para validar pipelines de inferencia robótica antes de desplegar en hardware real.
- Estudio de world models como políticas: permite analizar si un world model de vídeo preentrenado aporta ventajas de generalización frente a políticas entrenadas desde cero en tareas de destreza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio de pesos ocupa 31,7 GB en bf16, por lo que se requiere al menos una GPU con 40 GB o más (A100 40/80 GB, H100) para cargar los pesos completos, más el VAE de Wan2.2 y el resto del grafo de inferencia.
- GPU recomendadas: A100 80 GB o H100 para inferencia cómoda en bf16; A100 40 GB podría ser ajustada según el overhead del servidor de políticas y el VAE.
- GPU de consumo: no se espera que quepa en RTX 4090 (24 GB) en bf16 sin cuantización adicional, que no está documentada.
- Opciones de despliegue: servidor de políticas de cosmos-framework (`--checkpoint-path <dir> --config-file config.yaml`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de acción basadas en world models de vídeo) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Modelo de investigación: 0 descargas y 0 likes, sin benchmarks publicados, lo que impide validar su rendimiento frente a alternativas.
- Dependencia de infraestructura específica: requiere cosmos-framework y un archivo `Wan2.2_VAE.pth` local de Wan-AI/Wan2.2-TI2V-5B, lo que añade fricción de despliegue.
- Formato de pesos DCP de un solo rango: no es un formato estándar de inferencia (safetensors/GGUF) y requiere el servidor de cosmos-framework para cargarse.
- Entrenado exclusivamente sobre Bench2Dex y 12 encarnaciones: la generalización fuera de esas morfologías y tareas no está garantizada.
- Riesgo de alucinación motora: como política generativa, puede producir acciones no físicamente válidas o inseguras; se requiere supervisión y límites de seguridad en hardware real.
- Sin información sobre sesgos, idiomas ni restricciones de contexto más allá del horizonte de 48 acciones.
- El checkpoint publicado son solo pesos EMA sin estado del optimizador, por lo que no es directamente reanudable para fine-tuning sin reconstruir el estado.

## Enlaces

- HuggingFace: https://huggingface.co/Myungkyu/cosmos3_policy_bench2dex_all26_b128_30k_h48e24_ema
- Dataset de teleoperación: `Bench2Dex/teleopdata` (referenciado en la model card, sin URL directa disponible)
- Exports LeRobot v3.0 por encarnación: `Myungkyu/bench2dex_<alias>_lerobot_v30` (referenciados, sin URL directa disponible)
- VAE requerido: Wan-AI/Wan2.2-TI2V-5B (referenciado, sin URL directa disponible)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
