# pytc/tutorial

## Resumen

PyTorch Connectomics (PyTC) Tutorial es un repositorio de checkpoints preentrenados para segmentación de volúmenes de microscopía electrónica (EM) en el ámbito de la conectómica. Lo desarrolla el equipo de PyTorch Connectomics y agrupa tres modelos especializados: segmentación de instancias de neuronas (BANIS+ sobre MedNeXt-L con decodificación ABISS), segmentación de neuronas sobre el benchmark NISB y segmentación semántica de mitocondrias (MedNeXt-S). No es un modelo de lenguaje: es un conjunto de pesos de visión 3D para image-segmentation, empaquetado con la librería `pytorch-connectomics`.

El modelo principal, `neuron_segneuron/banis_emneuron_200k.ckpt`, se entrena sobre EMNeuron, la base de datos de SegNeuron, que reúne diez fuentes de EM anotadas (AxonEM-H, AxonEM-M, CREMI, FIB-25, Hemibrain, J0126, Kasthuri y tres volúmenes Mira) con resoluciones de 6-9 nm en xy y 8-50 nm en z. Su objetivo es resolver un problema clásico de la conectómica: obtener segmentación de instancias de neuronas utilizable en volúmenes nuevos, ya sea en modo zero-shot o mediante fine-tuning con etiquetas propias.

La relevancia actual radica en que ofrece un pipeline reproducible y abierto (licencia MIT) que combina un backbone MedNeXt-L que predice afinidades y un decodificador watershed (ABISS) para convertir esas afinidades en identificadores de neurona. El repositorio incluye scripts de predicción y fine-tuning, además de resultados reportados sobre volúmenes de evaluación estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MedNeXt-L (backbone 3D) para afinidades + decodificación watershed ABISS; MedNeXt-S en el modelo de mitocondrias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D; entrada son volúmenes EM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) |
| Tamano del repositorio | 2.0 GB |
| Pipeline | image-segmentation |
| Libreria | pytorch-connectomics |
| Dataset de entrenamiento | yanchaoz/EMNeuron (modelo principal); NISB base; Lucchi++ |

## Arquitectura y entrenamiento

Los modelos se basan en MedNeXt, una familia de redes convolucionales 3D para segmentación médica. En el caso de neuronas, el backbone MedNeXt-L predice mapas de afinidad (affinity maps) entre vóxeles vecinos, y un decodificador watershed (ABISS) transforma esas afinidades en una segmentación de instancias con identificadores de neurona. El modelo `neuron_nisb` emplea una variante con decodificación `cc3d`, mientras que el modelo de mitocondrias usa MedNeXt-S para segmentación semántica.

El checkpoint principal se entrena sobre EMNeuron, que agrega diez fuentes de EM con resoluciones heterogéneas (6-9 nm en xy, 8-50 nm en z), lo que aporta diversidad de dominio para generalización zero-shot. El nombre del checkpoint (`banis_emneuron_200k`) sugiere 200 000 iteraciones de entrenamiento, aunque el número exacto de tokens o vóxeles procesados no está disponible en la información proporcionada. No se documentan fases de RLHF/DPO (no aplicables a este dominio) ni innovaciones como decodificación especulativa; la innovación principal es la combinación BANIS+ (afinidades + watershed) y el soporte de test-time augmentation de 16 vistas (`TTA=1`).

## Capacidades

- Segmentación de instancias de neuronas en volúmenes EM 3D, en modo zero-shot o con fine-tuning.
- Predicción de mapas de afinidad (`<name>_aff.h5`) además de la segmentación final (`<name>_seg.h5`).
- Segmentación semántica de mitocondrias (modelo `mito_lucchi++`).
- Soporte de test-time augmentation de 16 vistas para mejorar la calidad de la segmentación.
- Control del grado de fusión/separación de instancias mediante el parámetro `MERGE` (por defecto 0.6; 0.7 separa más cuando hay neuronas fusionadas).
- Entrada en formato HDF5 (`<name>_img.h5`, dataset 3D uint8 en orden ZYX).
- Fine-tuning con volúmenes etiquetados (`<name>_img.h5` + `<name>_seg.h5` con etiquetas de instancia).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de visión especializado.

## Casos de uso

- Segmentación zero-shot de un volumen EM nuevo: ejecutar `predict.sh` sobre un directorio de volúmenes `<name>_img.h5` para obtener identificadores de neurona sin etiquetas propias, aprovechando el entrenamiento multi-fuente sobre EMNeuron.
- Fine-tuning con anotaciones locales: cuando se dispone de volúmenes etiquetados, `finetune.sh` adapta el checkpoint al dominio concreto (por ejemplo, una resolución z distinta) y luego se predice con el checkpoint resultante.
- Reconstrucción de conectividad neuronal: usar los identificadores de neurona de `<name>_seg.h5` como base para trazar sinapsis y construir grafos de conectividad en estudios de neurociencia.
- Análisis mitocondrial: emplear `mito_lucchi++` (MedNeXt-S, Jaccard 0.935 en Lucchi++) para segmentar mitocondrias y estudiar su distribución en tejido nervioso.
- Comparación de algoritmos de decodificación: usar los checkpoints de `neuron_segneuron` (ABISS) y `neuron_nisb` (cc3d) sobre el mismo volumen para evaluar qué decodificador se adapta mejor a los datos.
- Docencia y reproducción de experimentos: los tutoriales de PyTC incluyen configuración, comandos y resultados completos, lo que permite reproducir los experimentos en cursos de neurociencia computacional.
- Evaluación con test-time augmentation: activar `TTA=1` en volúmenes difíciles para mejorar la segmentación a costa de mayor tiempo de cómputo.

## Benchmarks y rendimiento

| Modelo | Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|---|
| BANIS+ (MedNeXt-L + ABISS) | Segmentación de instancias de neuronas | 8 volúmenes de evaluación de SegNeuron | mean VI | 0.870 |
| BANIS+ (MedNeXt-L + cc3d) | Segmentación de instancias de neuronas | NISB base | NERL | 0.601 |
| MedNeXt-S | Segmentación semántica de mitocondrias | Lucchi++ | Jaccard | 0.935 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, por no ser aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño del volumen de entrada y de si se activa TTA de 16 vistas.
- GPU recomendadas: no disponible; se requiere una GPU compatible con PyTorch y suficiente memoria para MedNeXt-L 3D sobre volúmenes EM.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: scripts de PyTC (`predict.sh`, `finetune.sh`) con el repositorio `pytorch_connectomics` y el decodificador ABISS (`ABISS_HOME`); descarga del checkpoint vía `hf download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| PyTC BANIS+ (este modelo) | Segmentación de neuronas EM | MedNeXt-L + ABISS | MIT | Hugging Face + GitHub |
| PyTC neuron_nisb | Segmentación de neuronas EM | MedNeXt-L + cc3d | MIT | Hugging Face + GitHub |
| PyTC mito_lucchi++ | Segmentación de mitocondrias | MedNeXt-S | MIT | Hugging Face + GitHub |
| SegNeuron | Segmentación de neuronas EM | no disponible en la información | no disponible | GitHub (referenciado) |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas externas; la comparativa se limita a los tres checkpoints del propio repositorio y a la referencia a SegNeuron.

## Limitaciones y advertencias

- Modelo de dominio específico: no es un modelo de lenguaje ni un modelo multimodal general; solo procesa volúmenes EM 3D en formato HDF5.
- Dependencia de resolución: entrenado con resoluciones de 6-9 nm en xy y 8-50 nm en z; volúmenes con resoluciones muy distintas pueden requerir fine-tuning.
- Riesgo de fusión o separación incorrecta de instancias; el parámetro `MERGE` debe ajustarse según el volumen (0.7 separa más que el 0.6 por defecto).
- El modo zero-shot puede degradarse en dominios de imagen muy alejados de las diez fuentes de EMNeuron.
- Requiere instalar el repositorio PyTC y el decodificador ABISS por separado; el checkpoint por sí solo no produce segmentación de instancias.
- Licencia MIT: permite uso comercial, pero se debe citar PyTorch Connectomics (arXiv:2112.05754) y, para el modelo EMNeuron, también SegNeuron (Zhang et al., MICCAI 2024).
- No se documentan sesgos ni riesgos de alucinación en el sentido de modelos generativos; el riesgo principal es la calidad de la segmentación en datos fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por la comunidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pytc/tutorial
- Repositorio PyTorch Connectomics: https://github.com/PytorchConnectomics/pytorch_connectomics
- Tutorial neuron_segneuron: https://github.com/PytorchConnectomics/pytorch_connectomics/tree/master/tutorials/neuron_segneuron
- Tutorial neuron_nisb: https://github.com/PytorchConnectomics/pytorch_connectomics/tree/master/tutorials/neuron_nisb
- Tutorial mito_lucchi++: https://github.com/PytorchConnectomics/pytorch_connectomics/tree/master/tutorials/mito_lucchi%2B%2B
- Decodificador ABISS: https://github.com/PytorchConnectomics/ABISS
- SegNeuron: https://github.com/yanchaoz/SegNeuron
- Dataset EMNeuron: https://huggingface.co/datasets/yanchaoz/EMNeuron
- Paper PyTorch Connectomics: https://arxiv.org/abs/2112.05754
