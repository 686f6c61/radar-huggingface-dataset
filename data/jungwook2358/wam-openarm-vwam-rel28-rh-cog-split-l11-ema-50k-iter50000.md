# jungwook2358/wam-openarm-vwam-rel28-rh-cog-split-l11-ema-50k-iter50000

## Resumen

El modelo `wam-openarm-vwam-rel28-rh-cog-split-l11-ema-50k-iter50000` es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el usuario de Hugging Face `jungwook2358` en el marco del proyecto EXP-0019 / RLDX-2-VWAM. Resuelve el problema de generar acciones de control de un robot OpenArm de doble brazo a partir de observaciones visuales y de estado, produciendo un vector de acción de 28 dimensiones (cuello, dos brazos de 7 grados de libertad y dos manos de 6). Es relevante porque combina un backbone de vídeo de gran escala (Cosmos3-Nano MoT, con VAE de Wan2.2) con un ActionDiT entrenado desde cero, y porque introduce un mecanismo de alineación denominado CogAlign con un punto de extracción (tap) configurable.

La variante concreta que nos ocupa, `cog-split-l11`, sitúa el tap de CogAlign en la capa 11 del transformer MoT (la duodécima de 36), mientras que la variante original de referencia lo sitúa en la capa 21. El entrenamiento se realizó durante 50 000 iteraciones con un dataset mixto de 6 subconjuntos de robot y 5 de humano, con un ratio exacto de 8 muestras de robot y 8 de humano por GPU en 4 GPU (batch efectivo de 64), semilla 42 y una tasa de aprendizaje de 1e-4 con warmup de 2500 pasos y decaimiento coseno hasta el 10 %.

El modelo se distribuye como checkpoint de entrenamiento en formato DCP de PyTorch (4 shards más metadatos), con pesos EMA incluidos y sin optimizador. El repositorio ocupa 96 GB. No se han publicado resultados de benchmarks ni demos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de vídeo Cosmos3-Nano MoT (Mixture of Transformers) con VAE de Wan2.2 + ActionDiT de una vía entrenado desde cero + adaptador CogAlign (residual SiLU con inicialización a cero, dimensión 256) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el backbone es MoT, pero no se especifica el reparto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuye checkpoint DCP en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | other (licencia personalizada, no especificada en detalle) |
| Formato de pesos | DCP de PyTorch (4 shards + `.metadata`), con `scheduler/`, `trainer/`, `config.yaml`, `config.pkl` y `normalization.json` |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas. El backbone es Cosmos3-Nano MoT, un transformer de vídeo con mezcla de expertos de tipo Mixture of Transformers, inicializado desde el checkpoint `/data/checkpoints/Cosmos3-Nano-DCP` y acoplado al VAE de Wan2.2 para la codificación de fotogramas. Sobre él se entrena desde cero un ActionDiT de una sola vía que genera el vector de acción de 28 dimensiones. El adaptador CogAlign es un residual SiLU con inicialización a cero y dimensión 256, situado en la salida de la capa 11 del MoT, que alimenta las capas posteriores y las claves/valores (K/V) de acción. Las cabezas FP48 predicen el estado actual (peso 0.2) y el delta futuro (peso 0.2), con keypoints `openarm_prq30_v2_rlhnd/fp48` para la parte humana (RLHND).

El entrenamiento usó 6 subconjuntos de robot (`openarm_wam_v1`) y 5 subconjuntos humanos, con un reparto exacto de 8 muestras de robot y 8 de humano por GPU, batch de 64 en 4 GPU, 50 000 iteraciones, semilla 42, LR 1e-4 con warmup de 2500 pasos y decaimiento coseno hasta el 10 %. Las filas humanas provienen del retargeting HaWoR→OpenArm (`junbrro/openarm-human-hawor-retarget-prq-fp48-20261030`, cabeza 0.87/0) bajo un dominio de acción separado (robot 23 / human 24) con máscara de validez y estadísticas enmascaradas (`openarm_human_retarget28`, restauradas el 2026-11-02). La acción se representa en 28 dimensiones: cuello (2), brazo izquierdo (7), brazo derecho (7), mano izquierda (6) y mano derecha (6); los brazos son relativos al estado actual y el cuello y las manos son absolutos, normalizados con cuantiles q01/q99.

## Capacidades

- Generación de acciones de control robótico de 28 dimensiones para un robot OpenArm de doble brazo con cuello y dos manos.
- Política visuomotora: consume observaciones visuales (codificadas con el VAE de Wan2.2) y estado del robot para producir la siguiente acción.
- Predicción de estado actual y delta futuro mediante cabezas FP48, lo que permite anticipar el movimiento.
- Aprendizaje conjunto de datos de robot y de humano mediante retargeting, con dominios de acción separados y máscara de validez.
- Punto de extracción de CogAlign configurable (`OPENARM_COGALIGN_LAYER`), lo que permite variar la capa de alineación sin cambiar el resto del pipeline.
- Inferencia sin cinemática directa ni inversa: el modelo emite directamente articulaciones de 28 dimensiones.
- Soporte de pesos EMA para servir el modelo con o sin media móvil exponencial.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo genera las 28 articulaciones de un OpenArm con cuello y manos, adecuado para tareas de pick-and-place con dos brazos coordinados.
- Investigación en aprendizaje por imitación: al mezclar 6 subconjuntos de robot y 5 de humano con retargeting, sirve para estudiar la transferencia de datos humanos a políticas robóticas.
- Experimentación con alineación de representaciones: la variante `l11` frente a la original `l21` permite comparar el efecto del tap de CogAlign en el rendimiento downstream.
- Servido de políticas con o sin EMA: el checkpoint incluye pesos EMA (`backbone.extractor._video_ema_model.*` y `action_ema.*`), lo que facilita evaluar la estabilidad del entrenamiento.
- Reproducción de experimentos: la inclusión de `config.yaml`, `config.pkl`, `scheduler/`, `trainer/` y `normalization.json` permite reanudar o replicar el entrenamiento con las mismas estadísticas q01/q99.
- Evaluación de políticas VLA en entornos simulados o reales de doble brazo: al no requerir FK/IK en inferencia, simplifica la integración en bucles de control de bajo nivel.
- Estudio de mezcla robot-humano: el dominio de acción separado (robot 23 / human 24) con máscara de validez es un caso práctico para analizar el olvido catastrófico entre dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 96 GB e incluye checkpoint DCP de 4 shards más scheduler y trainer; el peso del modelo en inferencia no se desglosa.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 4 GPU con batch de 16 por GPU (batch efectivo 64), pero no se especifica el modelo de GPU.
- ¿Cabe en GPU de consumo? No disponible. Por el tamaño del repositorio (96 GB) y el uso de un backbone Cosmos3-Nano más un ActionDiT, es poco probable que quepa en GPU de consumo sin cuantización, pero no hay datos que lo confirmen.
- Opciones de despliegue: no disponible. El checkpoint está en formato DCP de PyTorch, no en GGUF ni safetensors, por lo que no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El autor referencia un runtime propio (`vwam-openarm-20261031-v2`, rama junhyeong-h2rb, RLDX-2-VWAM main@6c629a6).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wam-openarm-vwam-rel28-rh-cog-split-l11-ema-50k-iter50000` | no disponible | no disponible | no disponible | other | Hugging Face, 12 descargas |
| `wam-openarm-rel28-rh-base-ema-50k-ckpt50000` (mismo autor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Variante original `cog-split` con tap en capa 21 (referencia de junhyeong) | no disponible | no disponible | no disponible | no disponible | no disponible como checkpoint público en la información consultada |

La comparativa se limita a variantes del mismo proyecto; no se dispone de datos de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones cuantitativas, por lo que el rendimiento real de la política es desconocido.
- La licencia es `other` y no se detalla su texto; antes de cualquier uso comercial es necesario contactar con el autor para conocer las condiciones exactas.
- El modelo está especializado en un robot concreto (OpenArm de doble brazo con cuello y manos) y en una representación de acción de 28 dimensiones; no es transferible directamente a otras morfologías sin retargeting.
- La inferencia no realiza FK/IK: emite articulaciones directamente, lo que exige que el entorno de control acepte ese espacio de acción y las estadísticas de normalización correctas (`normalization.json` o `statistics.json` del checkpoint).
- El checkpoint se distribuye en formato DCP de PyTorch sin optimizador; no hay pesos en safetensors ni GGUF, lo que limita las herramientas de despliegue estándar.
- El entrenamiento mezcla datos de robot y de humano con dominios de acción separados; un desbalance en producción podría degradar el comportamiento en el dominio humano o en el de robot.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no es de lenguaje natural; el riesgo principal es el fallo de política en entornos no vistos.
- El repositorio incluye `scheduler/` y `trainer/`, lo que aumenta el tamaño a 96 GB; conviene descargar solo los shards del modelo si no se va a reanudar el entrenamiento.
- El número de descargas (12) y de likes (0) es muy bajo, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/wam-openarm-vwam-rel28-rh-cog-split-l11-ema-50k-iter50000
- Checkpoint base del mismo autor: https://huggingface.co/jungwook2358/wam-openarm-rel28-rh-base-ema-50k-ckpt50000
- Dataset de retargeting humano: https://huggingface.co/junbrro/openarm-human-hawor-retarget-prq-fp48-20261030
- Repositorio de código referenciado (RLDX-2-VWAM, main@6c629a6): no disponible como enlace directo en la información consultada
- Paper, blog o demo: no disponibles en la información consultada
