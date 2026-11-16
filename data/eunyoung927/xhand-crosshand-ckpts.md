# eunyoung927/xhand-crosshand-ckpts

## Resumen

`eunyoung927/xhand-crosshand-ckpts` es un repositorio de respaldo (backup) publicado en Hugging Face que contiene los checkpoints de un proyecto de investigación en robótica denominado xhand cross-hand latent (`latent_codec_v1`). No se trata de un modelo único entrenado para inferencia general, sino de una colección de artefactos de entrenamiento: políticas de difusión (diffusion policies) basadas en LeRobot, exportaciones parciales de pi0.5, códecs latentes y políticas de control para brazos robóticos. El autor es el usuario `eunyoung927` y el repositorio se creó y actualizó el 16 de noviembre de 2026.

El interés técnico del repositorio reside en que documenta varias familias de experimentos sobre manipulación robótica con manos y brazos: políticas `cv2dp`, `ho2hand`, `pooled3hand` (con y sin codificación one-hot), exportaciones de pi0.5 sin one-hot (`pi05_nohot`) y una serie de códecs latentes (`codec_v1`, `codec_v2`, `codec_v3`, `arm_latent_v1`). Los checkpoints se organizan por paso de entrenamiento (por ejemplo, pasos 020950 a 125700 en `cv2dp`, o 029600 a 177600 en `pooled3hand`) y conservan el formato nativo de LeRobot con `pretrained_model/` y, en algunos casos, `training_state/`.

Es relevante ahora porque expone públicamente pesos intermedios y finales de políticas robóticas que normalmente no se publican, junto con un `MANIFEST.tsv` con hashes SHA-256 de cada fichero. No obstante, conviene subrayar que no es un modelo listo para usar: las exportaciones de pi0.5 son deltas de tensores entrenados que deben fusionarse sobre los pesos base de Physical Intelligence alojados en `lerobot/pi05_base`, y los conjuntos de datos no están incluidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de difusión (diffusion policy) sobre LeRobot; exportaciones parciales de pi0.5 (delta de tensores); códecs latentes (codec v1/v2/v3, arm latent) |
| Parametros totales | no disponible (depende de cada checkpoint; los deltas de pi0.5 no constituyen un modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | other (licencia personalizada; los pesos base de pi0.5 quedan bajo la licencia de Physical Intelligence) |
| Formato de pesos | safetensors (`model.safetensors`, `trainable.safetensors`), PyTorch `.pt` (`best.pt`, `last.pt`), JSON de configuración y normalizadores |

## Arquitectura y entrenamiento

El repositorio agrupa varios linajes de modelos. Por un lado, las políticas `cv2dp`, `ho2hand` y `pooled3hand` son diffusion policies en formato LeRobot, entrenadas por pasos y organizadas en carpetas `<step>/pretrained_model/` con configuración, `model.safetensors`, normalizadores de pre/post-procesado y `train_config.json`. Algunos pasos finales incluyen además `training_state/` con estado del optimizador, scheduler y RNG. Las variantes `pooled3hand_nohot` y `pooled3hand/p3` difieren en el uso de codificación one-hot para los brazos (C, J, Z, D), y los checkpoints de `vast/pooled3hand_nohot` son byte-idénticos a los de `work1/pooled3hand/p3nh/ckpt/` según verificación SHA-256.

Por otro lado, las exportaciones `pi05_nohot` (brazos Z y D) contienen únicamente los tensores entrenados (`trainable.safetensors`), es decir, un delta que debe fusionarse sobre los pesos base de pi0.5 obtenidos de `lerobot/pi05_base`, siguiendo las instrucciones de `export_meta.json`. Los pasos de exportación son 004734, 009468, 014202, 018936 y 023670. El repositorio también incluye códecs latentes entrenados (`codec_v1`, `codec_v2` con 91 ficheros, `codec_v3` con 28, `arm_latent_v1`) y un modelo `f_task` (P0a) más extensiones P0b/P3. No se documentan en la información disponible el número de tokens, la composición del dataset ni si se aplicaron RLHF o DPO; los datasets se excluyeron explícitamente del backup.

## Capacidades

- Control robótico mediante diffusion policies para brazos y manos (brazos Ze2, Zv2, Z, D, C, J).
- Manipulación con múltiples manos: variantes `ho2hand` (H2) y `pooled3hand` con y sin one-hot.
- Exportaciones de pi0.5 adaptadas al proyecto (`pi05_nohot`), que requieren fusión con los pesos base de Physical Intelligence.
- Codificación latente de configuraciones de mano mediante códecs v1, v2 y v3 (variantes `all_five`, `five_finger`, `four_finger`, `mixed_as`, `slots_*`).
- Modelo auxiliar `f_task` (P0a) y extensiones P0b/P3 con offsets (`p3h_offsets.py`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo; es un repositorio de robótica, no de lenguaje.

## Casos de uso

- Reproducción de experimentos de manipulación robótica: los checkpoints por paso permiten reanudar o comparar curvas de entrenamiento de las políticas `cv2dp`, `ho2hand` y `pooled3hand`, ya que se conservan pasos intermedios y logs de entrenamiento.
- Fine-tuning de políticas de difusión sobre LeRobot: los checkpoints en formato LeRobot con normalizadores y `train_config.json` pueden cargarse directamente en flujos de entrenamiento de LeRobot para continuar el entrenamiento o adaptar la política a un nuevo brazo.
- Investigación en representaciones latentes de manos: los códecs `codec_v1`, `codec_v2` y `codec_v3` (con variantes de slots, dropout, denoising y clasificación) permiten estudiar la codificación y decodificación de configuraciones de mano en espacio latente.
- Adaptación de pi0.5 a un brazo concreto: las exportaciones `pi05_nohot/Z` y `pi05_nohot/D` permiten fusionar el delta entrenado sobre `lerobot/pi05_base` y evaluar la política resultante en el brazo correspondiente.
- Auditoría y verificación de integridad: el `MANIFEST.tsv` con ruta, bytes y SHA-256 de cada fichero facilita comprobar la integridad de los checkpoints descargados y detectar duplicados entre `vast` y `work1`.
- Comparación de estrategias de codificación de brazos: las variantes con one-hot (`pooled3hand/p3`) y sin one-hot (`pooled3hand_nohot`) permiten evaluar el impacto de la codificación de identidad del brazo en el rendimiento de la política.
- Base para evaluación comparativa de diffusion policies en robótica: al conservar múltiples pasos de entrenamiento por brazo, se pueden medir métricas de éxito a lo largo del entrenamiento sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones numéricas con otras políticas; solo describe la organización de los checkpoints, rutas de origen, tamaños y hashes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del checkpoint concreto y del modelo base (pi0.5 requiere los pesos base de `lerobot/pi05_base`, de 7,47 GB, además del delta entrenado).
- Tamaño de los artefactos: `cv2dp` Ze2 y Zv2 ocupan 8,96 GB cada uno; `ho2hand` D 8,96 GB y Z 6,72 GB; `pi05_nohot` Z y D 9,65 GB cada uno; `pooled3hand_nohot` 26,85 GB en total (cuatro brazos); `pooled3hand/p3` 20,15 GB; políticas `policies_v2` 4,70 GB y `policies` 1,45 GB.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en una instancia alquilada de vast.ai y en el servidor de laboratorio "work1", pero no se especifican modelos de GPU.
- ¿Cabe en GPU de consumo? No disponible; no se documentan requisitos de VRAM ni configuraciones de inferencia en GPU de consumo.
- Opciones de despliegue: los checkpoints siguen el formato LeRobot (`pretrained_model/` con `model.safetensors`, normalizadores y `train_config.json`), por lo que el despliegue natural es mediante la librería LeRobot. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de políticas robóticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eunyoung927/xhand-crosshand-ckpts` | Checkpoints de diffusion policies y deltas de pi0.5 para robótica | no disponible | no disponible | other | Hugging Face (backup, 0 descargas) |
| `lerobot/pi05_base` | Pesos base de pi0.5 (Physical Intelligence) | no disponible en la información | no disponible | licencia de Physical Intelligence | Hugging Face (upstream) |
| `dexverse-dp-image` | Diffusion policy de imagen (referenciada en la model card) | no disponible | no disponible | no disponible | Hugging Face (ya publicado) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo listo para inferencia: las exportaciones `pi05_nohot` son deltas de tensores que deben fusionarse sobre `lerobot/pi05_base`; sin ese paso no funcionan.
- Los datasets no están incluidos, lo que impide reproducir el entrenamiento completo a partir de este repositorio.
- La licencia es "other" y no se detallan sus términos; además, los pesos base de pi0.5 están sujetos a la licencia de Physical Intelligence, lo que condiciona cualquier uso comercial o redistribución.
- El repositorio es un backup con 0 descargas y 0 likes; no hay evidencia de validación externa ni de mantenimiento continuado.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto o idioma porque el modelo no es lingüístico; los riesgos se refieren a fallos de política en entornos físicos reales.
- Algunos ficheros se excluyeron deliberadamente: `pi05_base` (pesos de terceros), `proto.log` (contenía una dirección de escucha del servidor), estados de optimizador de pasos no finales y datasets; esto limita la trazabilidad completa.
- Duplicados entre `vast` y `work1` (por ejemplo, `pooled3hand_nohot` y `p3nh/ckpt`) pueden provocar confusión si no se consulta el `MANIFEST.tsv`.
- No hay información sobre cuantizaciones, latencia ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eunyoung927/xhand-crosshand-ckpts
- Pesos base de pi0.5 (upstream): https://huggingface.co/lerobot/pi05_base
- Librería LeRobot (formato de los checkpoints): no se incluye enlace en la información proporcionada
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
