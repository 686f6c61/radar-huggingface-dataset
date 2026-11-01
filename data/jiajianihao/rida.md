# jiajianihao/RIDA

## Resumen

RIDA (Rank-Invariant Domain Adaptation) es un conjunto de checkpoints para segmentación de imágenes biomédicas con adaptación de dominio no supervisada. Lo desarrolla el autor jiajianihao y se publica bajo licencia MIT en Hugging Face. El modelo aborda el problema de transferir un segmentador entrenado en un dominio fuente (por ejemplo, TC abdominal) a un dominio objetivo distinto (por ejemplo, RM abdominal) sin disponer de etiquetas en el destino, algo habitual en imagen médica y microscopía electrónica.

El repositorio no contiene un modelo único, sino 24 checkpoints correspondientes a la combinación de ocho benchmarks y tres familias de backbone (U-Net, DINOv3 y MedSAM), con dos direcciones de adaptación por benchmark. Los benchmarks cubren segmentación abdominal (TC↔RM), cardíaca (TC↔RM), microscopía electrónica VNC (subset1/subset2) y mitocondrias en EM (h2r/r2h).

La relevancia actual reside en la proliferación de backbones fundacionales (DINOv3, MedSAM) que necesitan adaptarse a dominios clínicos concretos sin reetiquetar datos. RIDA ofrece pesos listos para usar con un pipeline de evaluación reproducible mediante el repositorio de código asociado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segmentación de imágenes con backbone U-Net, DINOv3 o MedSAM y adaptación de dominio (Rank-Invariant Domain Adaptation) |
| Parametros totales | no disponible (depende del backbone: U-Net, DINOv3 o MedSAM) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en formato .pth, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` |
| Tamaño del repositorio | 13,5 GB |
| Número de checkpoints | 24 (8 benchmarks × 3 backbones, 2 direcciones por benchmark) |
| Pipeline HF | image-segmentation |

## Arquitectura y entrenamiento

RIDA es un método de adaptación de dominio para segmentación semántica biomédica. La propuesta central, según el nombre, es una adaptación de dominio invariante al rango (rank-invariant), que busca alinear las representaciones entre dominio fuente y dominio objetivo preservando el orden relativo de las características en lugar de forzar una coincidencia absoluta de distribuciones. El repositorio de Hugging Face solo distribuye los pesos; los detalles del algoritmo, la función de pérdida y el esquema de entrenamiento deben consultarse en el repositorio de código y en la publicación asociada (no incluida en la información disponible).

Los checkpoints se organizan por benchmark y backbone: `abdominal` (ct2mr, mr2ct), `cardiac` (ct2mr, mr2ct), `vnc2lucchi` (subset1, subset2) y `mitoem` (h2r, r2h), cada uno con backbones `unet`, `dinov3` y `medsam`. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon técnicas adicionales como pseudoetiquetado o consistencia entre aumentaciones; estos datos figuran como no disponibles.

## Capacidades

- Segmentación de imágenes médicas en TC y RM (abdominal y cardíaca) con transferencia entre modalidades.
- Segmentación de imágenes de microscopía electrónica (benchmark VNC y mitocondrias en EM).
- Adaptación de dominio no supervisada: transfiere un modelo entrenado en un dominio etiquetado a un dominio sin etiquetas.
- Compatibilidad con tres familias de backbone: U-Net (clásico), DINOv3 (ViT fundacional) y MedSAM (Segment Anything adaptado a medicina).
- Soporte bidireccional de adaptación (por ejemplo, ct2mr y mr2ct; h2r y r2h).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Adaptación de segmentadores abdominales entre TC y RM: usar `rida/abdominal/dinov3_ct2mr.pth` para aplicar un modelo entrenado con TC etiquetado a estudios de RM sin anotaciones, útil en hospitales que cambian de protocolo de imagen.
- Segmentación cardíaca multimodal: emplear los checkpoints `cardiac` con backbone MedSAM para delimitar estructuras cardíacas en RM cuando el modelo base se entrenó en TC, reduciendo la necesidad de reanotar.
- Análisis de microscopía electrónica VNC: aplicar `vnc2lucchi` para segmentar estructuras en imágenes de EM de otro subconjunto o protocolo de adquisición, habitual en neuroanatomía de insectos.
- Cuantificación de mitocondrias en EM: usar `mitoem` (h2r/r2h) para segmentar mitocondrias en imágenes de alta resolución con distribución de dominio distinta a la de entrenamiento.
- Investigación en adaptación de dominio: servir de baseline reproducible para comparar métodos UDA en segmentación biomédica con tres backbones y ocho benchmarks.
- Integración en pipelines de imagen médica: cargar los pesos `.pth` en PyTorch y ejecutar inferencia por lotes sobre volúmenes o cortes, con la configuración YAML del repositorio de código.
- Evaluación comparativa de backbones: medir el impacto de sustituir U-Net por DINOv3 o MedSAM en el mismo benchmark y dirección de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo enumera los checkpoints y el comando de evaluación; las métricas (Dice, HD95, etc.) deben obtenerse ejecutando `tools/test.py` con las configuraciones del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; depende del backbone. U-Net es el más ligero (probablemente apto para GPU consumer de 8-12 GB en inferencia), mientras que DINOv3 y MedSAM, basados en ViT, requieren más memoria (estimación orientativa de 16-24 GB para lotes pequeños, no confirmada por el autor).
- GPU recomendadas: no especificadas. Por tamaño de backbone, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para DINOv3 y MedSAM; U-Net puede ejecutarse en GPUs consumer menores.
- Cabe en GPU consumer: probablemente sí para U-Net; para DINOv3 y MedSAM se recomienda al menos 16-24 GB de VRAM, sin dato oficial.
- Opciones de despliegue: PyTorch nativo con los scripts del repositorio (`tools/test.py`); no se publican versiones ONNX, TensorRT ni integraciones con vLLM/TGI (no aplicables a segmentación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbones | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RIDA | Adaptación de dominio para segmentación biomédica | U-Net, DINOv3, MedSAM | 8 (abdominal, cardiac, vnc2lucchi, mitoem) | MIT | Hugging Face + GitHub |
| MedSAM | Segmentación médica fundacional (SAM adaptado) | ViT | Múltiples modalidades médicas | Apache 2.0 (según publicación original) | Hugging Face |
| nnU-Net | Framework de segmentación biomédica auto-configurable | U-Net | Múltiples (BTCV, MSD, etc.) | Apache 2.0 | GitHub |
| DINOv3 | Backbone ViT auto-supervisado | ViT | Múltiples tareas densas | Licencia DINOv3 (ver repositorio) | Hugging Face / Meta |

La comparación directa de métricas no está disponible en la información proporcionada. RIDA se distingue por empaquetar explícitamente la adaptación de dominio entre modalidades, mientras que MedSAM, nnU-Net y DINOv3 son modelos o frameworks base sin ese componente de transferencia incorporado en los pesos.

## Limitaciones y advertencias

- Solo se distribuyen pesos; sin el repositorio de código y las configuraciones YAML no es posible reproducir la inferencia ni la evaluación.
- No hay métricas publicadas en la model card, por lo que el rendimiento real en cada benchmark es desconocido hasta ejecutar la evaluación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de robustez.
- Modelo específico de dominio: no es un modelo de propósito general; solo cubre las cuatro familias de benchmarks incluidas.
- Riesgo de degradación si los datos de destino difieren de los dominios de entrenamiento (por ejemplo, otro fabricante de escáner o distinto protocolo de EM).
- No se documentan sesgos demográficos ni de adquisición; en uso clínico se requiere validación externa antes de cualquier aplicación real.
- Licencia MIT permite uso comercial, pero la responsabilidad sobre el uso clínico recae en el implementador; no es un dispositivo médico certificado.
- El tamaño del repositorio (13,5 GB) implica descargas largas y almacenamiento considerable si se quieren los 24 checkpoints.

## Enlaces

- Hugging Face: https://huggingface.co/jiajianihao/RIDA
- Repositorio de código: https://github.com/jj-ccc/RIDA
- Paper: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
