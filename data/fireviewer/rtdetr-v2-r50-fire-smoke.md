# fireviewer/rtdetr-v2-r50-fire-smoke

## Resumen

FireViewer RT-DETRv2-R50 Fire/Smoke es un detector de objetos de dos clases (humo visible y llama visible) obtenido por fine-tuning del modelo `PekingU/rtdetr_v2_r50vd` sobre el corpus `fireviewer/fire-smoke-detection-corpus-v1`. Lo desarrolla el proyecto FireViewer y está pensado como referencia reproducible para investigación y evaluación en detección temprana de incendios forestales, no como sistema operativo de emergencias. El checkpoint se distribuye en formato safetensors con 42.859.154 parámetros y un tamaño de repositorio de 0,2 GB.

El modelo se apoya en la arquitectura RT-DETRv2 con backbone ResNet-50 (R50vd), un detector transformer end-to-end que elimina la necesidad de NMS en post-procesado. Su relevancia actual reside en que ofrece métricas publicadas y un protocolo de evaluación independiente documentado, algo poco habitual en detectores de incendios de código abierto, lo que permite usarlo como comparador base frente a alternativas como RF-DETR o detectores YOLO ajustados.

La licencia es restrictiva: `fireviewer-model-use-license-v1.0`, que permite inferencia comercial con atribución pero prohíbe la redistribución de pesos, incluidos los convertidos o embebidos. Esto condiciona fuertemente su uso en producción y debe revisarse antes de cualquier integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (transformer end-to-end) con backbone ResNet-50 (R50vd) |
| Parametros totales | 42.859.154 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica contexto textual) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | fireviewer-model-use-license-v1.0 (base Apache-2.0) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un RT-DETRv2, un detector transformer end-to-end que combina un backbone convolucional ResNet-50 con un encoder-decodificador transformer y sustituye el post-procesado NMS por un esquema de matching set-based. El checkpoint parte de `PekingU/rtdetr_v2_r50vd` (revisión base `282494075698cab9faa1096ae26856890030c817`) y se ajusta para dos clases: `0 = smoke_visible` y `1 = flame_visible`.

El entrenamiento se realizó sobre el corpus `fireviewer/fire-smoke-detection-corpus-v1`. La model card advierte explícitamente que el manifiesto de procedencia conserva hashes históricos y que no debe asumirse que la revisión estricta actual del corpus se usó en este entrenamiento. No se documentan en la información disponible el número de tokens, la composición detallada del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a un detector). El modelo incluye `config.json` y `preprocessor_config.json` que deben usarse junto con los pesos para reproducir el preprocesado correcto.

## Capacidades

- Detección de objetos en imágenes RGB con dos clases: humo visible (`smoke_visible`) y llama visible (`flame_visible`).
- Salida de cajas delimitadoras con puntuaciones de confianza por clase.
- Detección end-to-end sin NMS, propia de la arquitectura RT-DETRv2.
- Integración con la librería `transformers` (pipeline `object-detection`).
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Diseñado para integrarse con el runtime `fireviewer-vision-runtime` preservando puntuaciones y procedencia.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni otras modalidades.

## Casos de uso

- Investigación comparativa en detección de incendios: sirve como referencia reproducible con métricas publicadas (mAP50-95 de 0,3502) para comparar nuevas propuestas bajo el mismo protocolo de evaluación.
- Evaluación de falsos positivos en imágenes negativas: el informe documenta una tasa de falsos positivos en imágenes negativas de 0,0435 en el holdout calibrado, útil para estudiar umbrales de operación conservadores.
- Prototipado de sistemas de alerta temprana: el modelo puede procesar imágenes de cámaras fijas y emitir cajas puntuadas de humo o llama, que después deben pasar por revisión humana antes de cualquier decisión.
- Análisis retrospectivo de incendios: aplicar el detector sobre archivos de imágenes históricas para estudiar la evolución de columnas de humo y llamas visibles en un evento concreto.
- Benchmarking de detectores alternativos: usar sus resultados en el conjunto de 512 imágenes de `Hajorda/flameye-wildfire-detection` como línea base frente a RF-DETR, YOLO o DINOv3.
- Docencia y formación en visión por computador: ejemplo práctico de fine-tuning de RT-DETRv2 sobre un dominio especializado con protocolo de evaluación documentado.
- Validación de pipelines de datos: comprobar que el preprocesado y las etiquetas (`0: smoke_visible`, `1: flame_visible`) se respetan en integraciones con `fireviewer-vision-runtime` antes de desplegar variantes propias.

## Benchmarks y rendimiento

Resultados del informe independiente retenido, con umbral de score calibrado de 0,02 sobre 512 imágenes del split `test` de `Hajorda/flameye-wildfire-detection` (revisión `361a3dea8b877482af9f4ed80eff77ffd39926ef`). La selección está dominada por D-Fire (508/512).

| Metrica | Resultado |
|---|---:|
| COCO mAP50:95 | 0,3502 |
| COCO mAP50 | 0,6332 |
| AP50:95 humo / llama | 0,4544 / 0,2459 |
| Precision / recall / F1 en holdout calibrado | 0,7385 / 0,4507 / 0,5598 |
| Tasa de falsos positivos en imagenes negativas (holdout) | 0,0435 |

El AP de humo (0,4544) es notablemente superior al de llama (0,2459), lo que refleja la mayor dificultad de la clase llama en este protocolo. La model card advierte que el umbral 0,02 es específico de este informe histórico y no un umbral operativo, y que las métricas COCO AP y las de holdout calibrado miden aspectos distintos del protocolo y no deben compararse entre sí ni con métricas de entrenamiento-validación de RF-DETR o de pointing de DINOv3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 42,86 M de parámetros y pesos en fp32 (≈171 MB), la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en fp32; A100, H100, RTX 4090, RTX 3090 o RTX 3060 son opciones válidas según el throughput requerido.
- Cabe en GPU de consumo: sí, por el reducido tamaño del checkpoint (0,2 GB de repositorio).
- Opciones de despliegue: `transformers` (pipeline `object-detection`), endpoints de Hugging Face; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FireViewer RT-DETRv2-R50 Fire/Smoke | 42,86 M | no aplica | mAP50-95 0,3502 (protocolo FireViewer) | fireviewer-model-use-license-v1.0 | Hugging Face, endpoints |
| PekingU/rtdetr_v2_r50vd (base) | no disponible | no aplica | no disponible en la informacion | Apache-2.0 | Hugging Face |
| RF-DETR | no disponible | no aplica | no comparable directamente (la model card lo advierte) | no disponible | no disponible |
| DINOv3 (pointing) | no disponible | no aplica | no comparable directamente (la model card lo advierte) | no disponible | no disponible |

La model card prohíbe explícitamente comparar sus métricas con las de RF-DETR en entrenamiento-validación o con las métricas de pointing de DINOv3, por lo que no se dispone de una comparativa numérica homogénea.

## Limitaciones y advertencias

- El modelo es un detector histórico/de referencia conservador; su disponibilidad pública no implica promoción a runtime operativo.
- No determina coordenadas geográficas, origen oculto del fuego, perímetro del incendio ni decisiones de emergencia.
- Las salidas deben conservar puntuaciones y procedencia y pasar siempre por revisión humana.
- El umbral 0,02 es específico del protocolo de evaluación y no es un umbral operativo.
- La validación externa multi-evento y multi-cámara sigue siendo necesaria; el informe no contiene marca temporal de ejecución.
- El chequeo de solapamiento cero con el entrenamiento es basado en hashes y no prueba ausencia de solapamiento semántico o de dominio.
- La licencia `fireviewer-model-use-license-v1.0` permite usos declarados con atribución pero no concede redistribución, incluidos pesos convertidos o embebidos; los términos del checkpoint son independientes de la licencia Apache-2.0 del modelo base y de los derechos del corpus de entrenamiento.
- Riesgo de alucinación de detecciones en dominios distintos al corpus; no se documentan sesgos específicos en la información disponible.
- No se documentan capacidades multilingües ni de texto (no aplicables).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/rtdetr-v2-r50-fire-smoke
- Modelo base: https://huggingface.co/PekingU/rtdetr_v2_r50vd
- Dataset de entrenamiento: https://huggingface.co/datasets/fireviewer/fire-smoke-detection-corpus-v1
- Dataset de evaluación: https://huggingface.co/datasets/Hajorda/flameye-wildfire-detection
- Licencia del checkpoint: https://huggingface.co/fireviewer/rtdetr-v2-r50-fire-smoke/blob/b16bc79df05a69bfd90a7130d77fdbbd0d556465/CHECKPOINT_LICENSE.md
- Guía de variantes: https://huggingface.co/spaces/fireviewer/README/blob/main/docs/CHOOSING_VARIANTS.md
- Índice de recursos: https://huggingface.co/spaces/fireviewer/README/blob/main/docs/RESOURCE_INDEX.md
- Informe de evaluación independiente: `benchmark/independent-evaluation.json` (en el repositorio del modelo)
- Procedencia del entrenamiento: `training-provenance.json` (en el repositorio del modelo)
- Registro de cambios: `CHANGELOG.md` (en el repositorio del modelo)
