# ernestchu/bigger-gait-ccpg

## Resumen

BiggerGait (DINOv2-S) es un modelo de reconocimiento de marcha (gait recognition) entendido como tarea de biometría: dada una secuencia de recortes RGB de una persona caminando, produce un descriptor que permite decidir si dos secuencias corresponden a la misma persona. Lo desarrolla el autor de HuggingFace `ernestchu` como port autocontenido del modelo BiggerGait publicado por OpenGait, y el checkpoint es exactamente el mismo que OpenGait distribuye para el conjunto de datos CCPG, sin modificar (sha256 `b6e38129...edd33dbc`).

La relevancia práctica del repositorio no está en un modelo nuevo, sino en la ingeniería de empaquetado: el `.pt` incluye el backbone DINOv2-Small congelado, la rama de máscara y las cabezas de marcha, de modo que la inferencia no requiere clonar OpenGait ni descargar DINOv2 por separado. La entrada es una secuencia de recortes de 256x128 (hasta 250 fotogramas) que el modelo reescala internamente a 448x224, y la salida es un embedding de `[256, 384]`: 32 partes horizontales x 12 capas de DINOv2.

Arquitectónicamente es un transformer de visión (ViT) con supervisión por partes, no un modelo generativo ni un LLM: no hay contexto de texto, ni tool calling, ni capacidades multilingües. El repositorio incluye un smoke test con 56 secuencias de CCPG cuyos embeddings coinciden con las referencias de OpenGait (similitud coseno mínima 0,99999), lo que lo convierte en una base útil para validar pipelines biométricos antes de lanzar una evaluación completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) DINOv2-Small congelado + rama de máscara + 12 cabezas de marcha (una por capa de DINOv2) + agregación HPP en 32 partes horizontales; modelo discriminativo de embeddings, no generativo |
| Parámetros totales | no disponible (la model card no publica el recuento; el backbone es DINOv2-Small, en el entorno de 22 M de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); procesa como máximo los primeros 250 fotogramas de cada secuencia |
| Tipos de cuantización | no disponible; el ejemplo de uso emplea `torch.autocast` y la referencia de OpenGait se obtuvo en fp16 |
| Idiomas soportados | no disponible (no procesa texto; la entrada es vídeo RGB) |
| Licencia | no disponible (no especificada ni en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | checkpoint PyTorch `.pt` (state dict cargado con `strict=True` tras descartar los clasificadores de entrenamiento `BNNecks`); secuencias de muestra en `.pkl`; repositorio gestionado con Git LFS |
| Entrada | secuencia RGB `uint8 [s, 3, 256, 128]` (recortes 256x128 normalizados con estadísticas de ImageNet) o lista de fotogramas BGR vía `preprocess_frames`; también `load_video` para ficheros de vídeo |
| Salida | embedding `[256, 384]` por secuencia (256-d por cada una de 32 partes horizontales x 12 capas) |
| Resolución interna | reescala a 448x224 |
| Comparación entre secuencias | distancia euclídea promediada sobre las 384 partes (`pairwise_distance`); menor distancia implica mayor probabilidad de misma identidad |
| Conjunto de entrenamiento | CCPG (identidades de test: 100-199) |
| Tamaño del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha en HuggingFace | creado y actualizado el 2026-10-18 (según metadatos) |

## Arquitectura y entrenamiento

El modelo es un ViT DINOv2-Small que se mantiene congelado y actúa como extractor de características por fotograma. Sobre él se añade una rama de máscara (el checkpoint se identifica como `WiMask`) y un conjunto de cabezas de marcha: cada una de las 12 capas de DINOv2 tiene su propia cabeza, y la configuración del port fija `group_layer_num: 1` y `head_num: 12`. La agregación se hace con HPP sobre 32 partes horizontales, lo que da lugar a un descriptor de 256 dimensiones por parte y capa. No se utilizan siluetas ni alineación explícita: el nombre del checkpoint indica `NoAlign`, y la model card confirma que no se necesita ningún paso de alineamiento.

El checkpoint procede sin modificaciones del repositorio `opengait/OpenGait` en HuggingFace, con el nombre `BiggerGait__SmallDINOv2_Gaitbase_84Frame30_448224_6432HPP32_NoAlign_Sep12B_WiMask-30000.pt`, entrenado sobre CCPG (configuración `configs/biggergait/biggergait__DINOv2_CCPG.yaml`). La información disponible no detalla el número de tokens ni la composición exacta del dataset de entrenamiento, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo discriminativo de este tipo). El port reimplementa el modelo en `biggergait/model.py` (solo inferencia) y un ViT DINOv2 mínimo en `biggergait/dinov2.py`; los nombres de módulo siguen el checkpoint para permitir la carga con `strict=True`.

## Capacidades

- Extracción de embeddings de identidad a partir de la forma de caminar en vídeo RGB, sin necesidad de siluetas ni de alineación de la persona.
- Reconocimiento de personas entre secuencias con cambio de ropa, cambio de pantalón, cambio de bolsa y cambios de vista (los cuatro protocolos CL, UP, DN y BG de CCPG).
- Reidentificación de personas (person re-ID) además de reconocimiento de marcha: la model card reporta Rank-1, mAP y mINP al estilo de re-ID.
- Funcionamiento con recortes de baja resolución (256x128) procedentes de detectores externos, y con vídeo sin procesar mediante `load_video`.
- Gestión de secuencias variables: usa hasta 250 fotogramas y descarta el resto.
- Inferencia en GPU (segundos para el smoke test) y en CPU (minutos), lo que facilita pruebas de integración sin acelerador.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio: es un codificador biométrico especializado.

## Casos de uso

- Control de acceso biométrico sin cooperación: el modelo identifica a una persona por su forma de caminar a partir de recortes de cámara, útil en pasillos o entradas donde no se puede exigir contacto ni mirada a cámara.
- Reidentificación en videovigilancia con cambio de ropa: el protocolo CL de CCPG está pensado exactamente para este escenario; el modelo obtiene Rank-1 93,22 y mAP 76,57 en el conjunto completo, por lo que sirve para acotar candidatos en revisión forense.
- Verificación en entornos con oclusión parcial por bolsas o complementos: el ajuste BG alcanza Rank-1 98,46, lo que lo hace adecuado para comercios donde la gente entra con bolsas.
- Evaluación y benchmarking de pipelines de biometría de marcha: el repositorio incluye `scripts/evaluate.py` y el protocolo CCPG con cuatro ajustes, de modo que se puede reproducir la métrica de referencia antes de integrar el modelo.
- Prueba de regresión en CI de sistemas biométricos: el smoke test con 56 secuencias y comparación contra embeddings de referencia (similitud coseno mínima 0,99999) permite detectar roturas en el preprocesado o en la carga del checkpoint en pocos segundos de GPU.
- Investigación en privacidad y biometría soft: al trabajar con RGB de baja resolución y no requerir siluetas, es una base para estudiar identificadores biométricos menos invasivos que el reconocimiento facial.
- Filtrado previo en analítica de aforos y seguridad: generar embeddings por secuencia y agrupar por distancia euclídea para tareas de seguimiento entre cámaras no solapadas.

## Benchmarks y rendimiento

Resultados de OpenGait con este mismo checkpoint sobre el conjunto de test completo de CCPG (8178 secuencias, fp16), tal como los reproduce la model card:

| Ajuste | Rank-1 | mAP | mINP | Rank-1 (cross-view) |
|---|---:|---:|---:|---:|
| CL (cambio completo de ropa) | 93,22 | 76,57 | 35,12 | 89,48 |
| UP (cambio de ropa superior) | 94,80 | 91,60 | 78,16 | 92,11 |
| DN (cambio de pantalón) | 97,19 | 92,33 | 76,91 | 93,66 |
| BG (cambio de bolsa) | 98,46 | 96,97 | 90,53 | 97,50 |

Resultados del smoke test incluido en el repositorio (56 secuencias, 4 identidades, 7 condiciones de ropa/bolsa x 2 vistas `02` y `05`). El propio autor advierte que con solo 4 identidades estas cifras no indican precisión real del modelo, solo que el código reproduce las referencias:

| Ajuste | Rank-1 | mAP | mINP | Rank-1 (cross-view) |
|---|---:|---:|---:|---:|
| CL | 93,75 | 85,53 | 68,06 | 100,0 |
| UP | 75,00 | 85,42 | 85,42 | 100,0 |
| DN | 100,0 | 100,0 | 100,0 | 100,0 |
| BG | 87,50 | 93,75 | 93,75 | 100,0 |

Coincidencia con los embeddings de referencia en las 56 secuencias de muestra: similitud coseno mínima 0,99999 y media 1,00000.

No se han publicado en la información disponible resultados comparativos con otros modelos de marcha (GaitBase, GaitGL, GaitPart u otros) ni métricas de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia orientativa (no oficial), el backbone es DINOv2-Small (~22 M de parámetros) y el coste dominante es la secuencia de hasta 250 fotogramas a 448x224, no el tamaño de los pesos; un solo lote de una secuencia debería caber con holgura en GPUs de consumo, pero el repositorio no documenta cifras.
- GPU recomendadas: no especificadas. Cualquier GPU CUDA moderna basta para el smoke test, que tarda "unos segundos"; la evaluación completa de CCPG (8178 secuencias) en fp16 se ejecutó con OpenGait.
- CPU: soportada explícitamente (`--device cpu`); el smoke test tarda "unos minutos".
- Opciones de despliegue: no es compatible con vLLM, TGI ni Ollama, al no ser un modelo de lenguaje. El despliegue es Python + PyTorch con el paquete `biggergait` y entorno gestionado con `uv`; los scripts incluidos son `scripts/smoke_test.py` y `scripts/evaluate.py`.
- Latencia y throughput: no disponibles de forma numérica; solo se indica el orden de magnitud del smoke test (segundos en GPU, minutos en CPU para 56 secuencias).

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos de reconocimiento de marcha, por lo que no es posible una comparación numérica fiable. La única comparación documentada es interna, entre este port y la implementación de referencia de OpenGait con el mismo checkpoint:

| Aspecto | Este repositorio (`ernestchu/bigger-gait-ccpg`) | OpenGait (`opengait/OpenGait`) |
|---|---|---|
| Pesos | Mismo checkpoint, sin modificar (sha256 `b6e38129...edd33dbc`) | Checkpoint original |
| Dependencias | Solo PyTorch y el paquete `biggergait`; no requiere OpenGait ni descargar DINOv2 | Requiere el código de OpenGait y construir el backbone con `transformers` |
| Evaluación publicada | Smoke test de 56 secuencias; conjunto completo no ejecutado con este port | Test completo de CCPG (8178 secuencias, fp16) |
| Coincidencia de embeddings | Similitud coseno mínima 0,99999 frente a las referencias | Referencia |
| Licencia | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Licencia no especificada: no hay información que permita afirmar que el uso comercial esté permitido. Hay que contactar con el autor o con OpenGait antes de un despliegue en producción.
- El checkpoint es un port de terceros: aunque la model card indica que se carga con `strict=True` y que los embeddings coinciden con las referencias, la evaluación sobre el conjunto completo de CCPG no se ha ejecutado con este repositorio, solo con OpenGait.
- Sesgos de dominio: el modelo está entrenado únicamente con CCPG, un dataset académico con condiciones de captura, cámara y población concretas. No hay datos sobre robustez frente a otras etnias, edades, condiciones de iluminación, climatología o ángulos de cámara distintos.
- El peor escenario reportado es el cambio completo de ropa (CL): mAP 76,57 y mINP 35,12, muy por debajo de los otros ajustes. En recuperación a gran escala, el ranking fino es frágil.
- No incluye detección ni seguimiento de personas: requiere un pipeline externo que produzca recortes 256x128 correctamente encuadrados. Errores aguas arriba degradan directamente el embedding.
- Límite duro de 250 fotogramas por secuencia; secuencias más largas se truncarán, lo que puede descartar información útil.
- Riesgo de falsos positivos biométricos: al ser un sistema de identificación, una distancia euclídea baja no equivale a certeza. Es obligatorio calibrar umbrales con datos propios y añadir verificación secundaria en decisiones sensibles.
- Implicaciones legales y éticas: el reconocimiento biométrico de personas está sujeto al RGPD y a normativa específica; en la UE se requiere base jurídica y evaluación de impacto. No debe usarse para vigilancia masiva no consentida.
- No apto para análisis clínico de la marcha: no fue entrenado para medir parámetros biomecánicos ni diagnosticar patologías, sino para discriminar identidades.
- La información de fecha del repositorio (2026-10-18) y el hecho de que tenga 0 descargas y 0 likes indican que se trata de una publicación reciente y sin validación comunitaria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ernestchu/bigger-gait-ccpg
- Paper de BiggerGait: https://arxiv.org/abs/2505.18132
- Código de OpenGait: https://github.com/ShiqiYu/OpenGait
- Checkpoint original en HuggingFace (OpenGait / CCPG): https://huggingface.co/opengait/OpenGait/blob/main/CCPG/BiggerGait__DINOv2/BiggerGait__Dinov2/BiggerGait__SmallDINOv2_Gaitbase_84Frame30_448224_6432HPP32_NoAlign_Sep12B_WiMask-30000.pt
- Dataset CCPG: https://github.com/BNU-IVC/CCPG
- Backbone DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Gestor de entorno uv: https://docs.astral.sh/uv/
