# fastforks/rtmpose

## Resumen

RTMPose es un modelo de estimación de pose humana 2D en tiempo real desarrollado originalmente por Jiang et al. (2023) en el ecosistema OpenMMLab. El repositorio `fastforks/rtmpose` es una tarjeta de modelo (model card) que no aloja pesos: actúa como envoltorio de los checkpoints oficiales de los autores, descargándolos desde los enlaces de OpenMMLab y verificándolos mediante SHA-256. La librería `fastforks` proporciona una implementación portada desde mmpose sin dependencia de mmpose ni mmcv, con backends `portable` y `kernels`.

La arquitectura combina un backbone CNN CSPNeXt con una cabeza SimCC, que clasifica las coordenadas x e y como bins 1D a resolución de medio píxel en lugar de usar mapas de calor. El modelo opera en modo top-down: recibe una imagen RGB y una caja delimitadora por persona, recorta cada región a 256x192 (o 384x288) y devuelve los keypoints con sus puntuaciones de confianza. Existen variantes para cuerpo (17 keypoints COCO), COCO-WholeBody (133 keypoints, incluyendo pies, cara y manos), Halpe26, mano (21 keypoints), cara (106 landmarks) y animales (17 keypoints AP-10K).

Su relevancia radica en que ofrece estimación de pose de alta precisión con latencia propia de tiempo real, licencia Apache-2.0 para todos los checkpoints y uso comercial permitido. Es la base de los preprocesadores openpose de ControlNet (variantes DWPose) y una opción consolidada para pipelines de visión por computador en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN CSPNeXt (backbone) + cabeza SimCC con gated attention unit |
| Parametros totales | no disponible (variantes t/s/m/l; cifras exactas no publicadas en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 256x192 o 384x288 por recorte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch, checkpoints de los autores, no alojados en el repo) |

## Arquitectura y entrenamiento

RTMPose emplea un backbone CNN CSPNeXt seguido de una cabeza SimCC. En lugar de predecir mapas de calor, la cabeza aplica una gated attention unit sobre un token por keypoint y clasifica las coordenadas x e y como bins 1D a resolución de medio píxel. El pipeline es top-down: un detector de personas (por ejemplo, `fastforks.detection`) proporciona las cajas, y el modelo procesa cada recorte de forma independiente.

Las variantes `body7` se entrenaron sobre siete conjuntos de datos públicos de pose y devuelven los 17 keypoints COCO. Las variantes `dwpose` (Yang et al., 2023) se destilaron sobre COCO-WholeBody y UBody y devuelven 133 keypoints (cuerpo, pies, cara y ambas manos); son el modelo de pose de los preprocesadores openpose de ControlNet. Las variantes `rtmw` (Jiang et al., 2024) añaden un cuello PAFPN y una cabeza a dos escalas sobre el mismo backbone, entrenadas sobre 14 conjuntos de datos, y devuelven los mismos 133 keypoints con mayor precisión. El repositorio portado expone `module()` para mapear recortes a logits SimCC.

## Capacidades

- Estimación de pose humana 2D top-down en tiempo real a partir de una imagen RGB y una caja por persona.
- Detección de 17 keypoints COCO (variantes `body7` y `dwpose`).
- Detección de 133 keypoints COCO-WholeBody: cuerpo, pies, cara y ambas manos (variantes `dwpose` y `rtmw`).
- Variantes especializadas: Halpe26 (cuerpo + pies, 26 keypoints), mano (21 keypoints sobre caja de mano), cara (106 landmarks sobre caja de cara) y animales (17 keypoints sobre caja de animal, AP-10K).
- Salidas con puntuación de confianza por keypoint (`keypoints`, `keypoint_scores`, `boxes`, `scores`).
- Backends `portable` y `kernels` (este último con kernels propios en `fastforks/kernels`).
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Análisis deportivo automatizado: extracción de la pose de atletas fotograma a fotograma para calcular ángulos articulares y detectar errores de técnica, aprovechando la latencia de tiempo real de las variantes `t`/`s`.
- Control de calidad en ergonomía industrial: monitorización de posturas de operarios en cámara fija para detectar posturas de riesgo, usando la variante `body7` con 17 keypoints.
- Generación de mapas openpose para ControlNet: las variantes `dwpose` producen los 133 keypoints COCO-WholeBody que alimentan los preprocesadores openpose de ControlNet para generación de imágenes condicionada por pose.
- Animación y captura de movimiento: las variantes `dwpose` y `rtmw` con keypoints de manos y cara permiten reconstruir gestos completos para rigging o avatares.
- Análisis de lenguaje de signos y gestos: la variante `rtmpose-m-hand5` (21 keypoints por mano) combinada con la de cara (106 landmarks) permite estudiar gestos manuales y expresiones faciales.
- Seguridad y vigilancia: detección de caídas o posturas anómalas en tiempo real mediante las variantes ligeras (`t`, `s`) desplegadas en GPU de consumo.
- Análisis de comportamiento animal: la variante `rtmpose-m-ap10k` estima la pose de animales sobre cajas delimitadoras para estudios de etología o monitorización de ganado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Al ser un modelo CNN de tamaño pequeño a medio con entradas de 256x192 o 384x288, la huella de memoria es reducida, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible. El tag `cuda` indica soporte de aceleración por GPU.
- Cabe en GPU de consumo: previsiblemente sí para las variantes `t`/`s`/`m`, aunque no se confirma con cifras en la informacion.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), con pesos PyTorch `.pth` de OpenMMLab. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Keypoints | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTMPose (este repo) | variantes t/s/m/l | 17, 26, 21, 106 o 133 segun variante | 256x192 o 384x288 | Apache-2.0 | checkpoints en OpenMMLab, tarjeta en HF |
| RTMW (Jiang et al., 2024) | no disponible | 133 | no disponible | Apache-2.0 (segun variantes del repo) | incluido como variantes en este repo |
| DWPose (Yang et al., 2023) | variantes t/s/m/l | 133 | 256x192 o 384x288 | Apache-2.0 | incluido como variantes en este repo |

No se dispone de datos de benchmarks para comparar el rendimiento numérico con alternativas externas.

## Limitaciones y advertencias

- El repositorio no aloja pesos: solo contiene la tarjeta de modelo. La descarga de checkpoints depende de los enlaces de OpenMMLab y de la verificación SHA-256.
- Es un modelo top-down: requiere cajas de persona previas de un detector; errores en la detección se propagan a la estimación de pose.
- No es un modelo generativo ni de lenguaje: no soporta texto, tool calling ni razonamiento.
- Riesgo de fallo en poses muy ocluidas, recortes parciales o personas de muy pequeño tamaño en la imagen.
- No se han publicado datos de sesgo en la informacion disponible; cabe esperar sesgos heredados de los conjuntos de datos de entrenamiento (COCO, COCO-WholeBody, UBody, Halpe, AP-10K, etc.).
- La licencia Apache-2.0 permite uso comercial en todas las variantes listadas, pero conviene verificar la licencia de los datasets de entrenamiento subyacentes si se redistribuyen pesos.
- No se documentan límites de idioma porque no aplica; el rendimiento puede variar según la distribución demográfica de las imágenes de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/rtmpose
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original mmpose (commit `5408bc76f5b8`): https://github.com/open-mmlab/mmpose
- Pesos DWPose-L 256x192: https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/rtmpose-l_simcc-ucoco_dw-ucoco_270e-256x192-4d6dfc62_20230728.pth
- Pesos RTMPose-L body7 256x192: https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/rtmpose-l_simcc-body7_pt-body7_420e-256x192-4dba18fc_20230504.pth
- Pesos RTMPose-M hand5 256x256: https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/rtmpose-m_simcc-hand5_pt-aic-coco_210e-256x256-74fb594_20230320.pth
- Pesos RTMPose-M AP-10K 256x256: https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/rtmpose-m_simcc-ap10k_pt-aic-coco_210e-256x256-7a041aa1_20230206.pth
