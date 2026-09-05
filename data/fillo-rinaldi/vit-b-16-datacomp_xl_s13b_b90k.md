# fillo-rinaldi/ViT-B-16-datacomp_xl_s13b_b90k

## Resumen

El repositorio contiene ocho checkpoints de OpenCLIP ViT-B-16 fine-tuned por Filippo Rinaldi sobre ocho datasets de visión, conocidos colectivamente como Vision8. Cada checkpoint está especializado en una tarea concreta de clasificación de imágenes, partiendo del modelo preentrenado `datacomp_xl_s13b_b90k` de LAION. El objetivo es ofrecer puntos de partida listos para usar en benchmarks de transfer learning y aplicaciones de visión por computador.

El modelo base es un Vision Transformer de tamaño base con patch de 16, entrenado por LAION sobre el dataset DataComp-XL. El repositorio no contiene un único modelo, sino un conjunto de pesos afinados (fine-tuned) en formato PyTorch, con un tamaño total de 4,8 GB. No se especifican parámetros ni contexto textual, al tratarse de un modelo de visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) de OpenCLIP, con fine-tuning en 8 datasets |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | .pt (checkpoints completos de PyTorch, fp32) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer ViT-B/16 de OpenCLIP, preentrenado por LAION con el dataset DataComp-XL (concretamente la variante `s13b_b90k`). El repositorio contiene ocho fine-tunings completos, cada uno sobre un dataset diferente de Vision8. El proceso de entrenamiento no detalla la composición del dataset ni hiperparámetros más allá de la fracción de validación (0,1), la semilla (42) y el criterio de selección basado en la mejor época según la precisión de validación. No se menciona RLHF/DPO ni otras técnicas de alineamiento, ya que es un modelo de clasificación de imágenes. La única innovación es la disponibilidad de pesos afinados de forma independiente por dataset, lo que facilita la reproducibilidad en benchmarks.

## Capacidades

- Clasificación de imágenes en los ocho conjuntos de datos de Vision8: SUN397, Cars, RESISC45, EuroSAT, SVHN, GTSRB, MNIST y DTD.
- Cada checkpoint alcanza una precisión de test concreta (ver tabla de benchmarks).
- El modelo base CLIP hereda la capacidad de alinear imágenes y texto en un espacio común, aunque el fine-tuning puede reducir la generalización zero-shot original.
- No soporta razonamiento, generación de texto, tool calling ni agentes, al ser un modelo puramente discriminativo.
- No incluye soporte para audio ni video.

## Casos de uso

- Clasificación de escenas interiores y exteriores: usando el checkpoint de SUN397, se puede categorizar automáticamente fotografías en escenas (cocina, oficina, biblioteca, etc.) para sistemas de gestión de fototecas o vigilancia doméstica. La alta precisión (78,85%) lo hace útil para organizar grandes volúmenes de imágenes sin anotación manual.
- Reconocimiento de modelos de coche: el checkpoint de Cars (93,09%) permite identificar la marca y el modelo de un vehículo en imágenes, aplicable a peajes automáticos, control de accesos a aparcamientos o análisis de flotas.
- Clasificación de imágenes de teledetección: RESISC45 (95,94%) es adecuado para monitorizar el uso del suelo, detectar campos de cultivo, bosques o infraestructuras urbanas en imágenes aéreas o de satélite, pudiendo integrarse en flujos de trabajo de SIG.
- Clasificación de cultivos a partir de imágenes multiespectrales: EuroSAT (98,68%) permite distinguir tipos de cobertura del suelo y cultivos, lo que resulta útil para agricultura de precisión y control de cambios en el territorio.
- Extracción de números en imágenes de calles: con SVHN (97,89%) se pueden leer matrículas, direcciones y números de portal mediante OCR anclado en visión, para sistemas de navegación o verificación de inventarios.
- Asistencia a la conducción: el checkpoint de GTSRB (99,01%) clasifica señales de tráfico en tiempo real, lo que apoya a sistemas ADAS de reconocimiento de límites de velocidad, stops o ceda el paso.
- OCR de dígitos manuscritos en formularios: MNIST (99,74%) resuelve la clasificación de dígitos escritos a mano, útil para digitalización de documentos y validación automática de encuestas o exámenes.
- Inspección de texturas y materiales: DTD (81,91%) identifica texturas (madera, metal, tejido, etc.) y puede aplicarse en control de calidad industrial, por ejemplo para detectar defectos en superficies.

## Benchmarks y rendimiento

| Dataset | Precisión de test |
| --- | ---: |
| SUN397 | 78,85% |
| Cars | 93,09% |
| RESISC45 | 95,94% |
| EuroSAT | 98,68% |
| SVHN | 97,89% |
| GTSRB | 99,01% |
| MNIST | 99,74% |
| DTD | 81,91% |
| Media macro Vision8 | 93,14% |

Los resultados corresponden a la mejor época de validación en cada dataset, tal y como se indica en la model card del autor. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible en la información. El tamaño del repositorio (4,8 GB) incluye los ocho checkpoints; no se especifica el tamaño ni el consumo de un checkpoint individual.
- Opciones de despliegue: los checkpoints se cargan mediante Python con `open_clip.create_model_and_transforms` y PyTorch, según el ejemplo de la model card. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Preentrenamiento | Fine-tuning | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| laion/CLIP-ViT-B-16-DataComp.XL-s13B-b90K | DataComp-XL (s13b b90k) | No | no disponible | HuggingFace |
| fillo-rinaldi/ViT-B-16-datacomp_xl_s13b_b90k | DataComp-XL (s13b b90k) | Sí, en Vision8 | MIT | HuggingFace |

No se han encontrado otras alternativas comparables en la información disponible.

## Limitaciones y advertencias

- Sesgos: no hay estudios de sesgos en la model card. El modelo base DataComp-XL de LAION incluye una advertencia sobre usos de vigilancia y reconocimiento facial, que aplica también a estos checkpoints.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo de clasificación y no generativo.
- Limitaciones de contexto o idioma: no aplica, no es un modelo de lenguaje.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero es necesario revisar las condiciones del modelo base de LAION.
- Caveat: los pesos están especializados en un único dataset; el uso fuera de esa distribución puede degradar el rendimiento. Además, el state_dict requiere eliminar el prefijo `clip_model.model.` antes de cargarlo, lo que puede confundir a usuarios no familiarizados con OpenCLIP.
- No se proporcionan instrucciones de carga para frameworks distintos de PyTorch/OpenCLIP.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/fillo-rinaldi/ViT-B-16-datacomp_xl_s13b_b90k
- Perfil de fillo-rinaldi en HuggingFace: https://huggingface.co/fillo-rinaldi/models
- Modelo base de LAION: https://huggingface.co/laion/CLIP-ViT-B-16-DataComp.XL-s13B-b90K
