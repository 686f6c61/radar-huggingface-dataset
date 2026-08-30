# cpraschl/SeeingTheUnseen

## Resumen

SeeingTheUnseen es un conjunto de pesos de detección de objetos para monitorización aérea de fauna, desarrollado por cpraschl (proyecto Faline-eco). El modelo aborda el problema de la compensación de oclusión en imágenes aéreas, donde los animales pueden quedar parcial o totalmente ocultos por vegetación u otros elementos. El estudio controlado compara dos ejes: vista única frente a multivista, y espacio de píxeles frente a espacio de embeddings.

El repositorio contiene 342 cabezas de detección estilo CenterNet (0,36 M de parámetros) entrenadas sobre grids de embeddings congelados, 72 detectores YOLO26x afinados sobre imágenes renderizadas, 4 subespacios posicionales INSID3 y 17 bases PCA. Los backbones DINOv3 y V-JEPA 2.1 se usan congelados y no se redistribuyen. El conjunto de datos deriva del dataset público BAMBI. La relevancia actual radica en que ofrece un protocolo de validación cruzada a nivel de escena con 5 pliegues sobre 72 vuelos, garantizando que ningún fotograma de validación aparece en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de detección CenterNet (0,36 M params) + YOLO26x afinados; backbones congelados DINOv3 y V-JEPA 2.1 |
| Parametros totales | Cabezas: 0,36 M; YOLO26x: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (detección de objetos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | MIT (heads/, pca/, bases/) y AGPL-3.0 (yolo/) |
| Formato de pesos | No disponible (probablemente PyTorch/safetensors, no confirmado) |

## Arquitectura y entrenamiento

El repositorio contiene dos familias de detectores. Las cabezas estilo CenterNet se entrenan sobre grids de embeddings congelados extraídos de DINOv3 y V-JEPA 2.1, con variantes que integran antes o después de codificar (`embed_*` frente a `alfsembed_*`), además de brazos en espacio de píxeles (`sensor_*`, `realalfs_*`, `realortho_*`). Los detectores YOLO26x se afinan directamente sobre las imágenes renderizadas a 1024 píxeles. Se incluyen subespacios posicionales INSID3 ajustados con sondas de ruido gaussiano, usados para proyección de debiasing (`_debias32`), y bases PCA que reducen cada almacén de características a 128 dimensiones.

El entrenamiento sigue un protocolo de validación cruzada a nivel de escena con 5 pliegues sobre 72 vuelos, equilibrado por número de cajas ocultas, con 3 semillas por pliegue. Las cabezas usan AdamW con tasa 3e-4, programación coseno, batch 16 y hasta 60 épocas con paciencia 12, con pérdida focal más 5x L1. Los YOLO se entrenan hasta 100 épocas con paciencia 10 y batch 4. Cada pliegue y semilla tiene su propio checkpoint; no se deben mezclar entre pliegues para mantener la garantía de datos reservados.

## Capacidades

- Detección de objetos en imágenes aéreas con compensación de oclusión mediante apertura sintética (multivista).
- Procesamiento en dos modalidades: RGB y térmica.
- Integración de múltiples vistas tanto en espacio de píxeles como en espacio de embeddings.
- Proyección de subespacios posicionales INSID3 para eliminar sesgos posicionales.
- Reducción de dimensionalidad mediante bases PCA a 128 dimensiones.
- Validación cruzada rigurosa a nivel de escena con separación estricta de vuelos.
- Comparación de estrategias encode-then-integrate frente a integrate-then-encode.

## Casos de uso

- Censos de fauna silvestre: el modelo detecta animales en vuelos de reconocimiento aéreo, compensando oclusiones parciales por vegetación mediante la integración de múltiples vistas de la misma escena.
- Monitorización de poblaciones en hábitats densos: la modalidad térmica combinada con la RGB permite detectar ejemplares en condiciones de baja visibilidad o contraste.
- Estudios de comportamiento animal: la detección multivista con apertura sintética permite rastrear individuos que se ocultan temporalmente entre fotogramas.
- Evaluación de impacto ambiental: los detectores pueden integrarse en pipelines de análisis de imágenes de drones o aviones para cuantificar presencia de fauna en zonas de intervención.
- Investigación en detección con oclusión: el repositorio sirve como banco de pruebas controlado para comparar estrategias de compensación de oclusión en espacio de píxeles frente a espacio de embeddings.
- Desarrollo de sistemas de monitorización autónoma: los checkpoints pueden desplegarse en pipelines de inferencia para procesamiento continuo de flujos de imágenes aéreas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de replicación (`metrics/*.json`) contiene las métricas puntuadas de cada brazo del estudio, pero los valores concretos no se incluyen en la model card. Se recomienda consultar el repositorio de replicación para obtener las tablas completas del artículo.

## Requisitos de hardware

- Los backbones DINOv3 y V-JEPA 2.1 no se incluyen en el repositorio; deben obtenerse por separado y requieren GPUs con VRAM considerable (estimación: 16-24 GB para DINOv3 según variante).
- Los checkpoints YOLO26x afinados a 1024 píxeles requieren al menos 8-12 GB de VRAM para inferencia en GPU consumer (RTX 3080/4080 o superior).
- Las cabezas CenterNet de 0,36 M de parámetros son ligeras y pueden ejecutarse en GPUs modestas (4-6 GB) una vez extraídos los embeddings.
- El tamaño total del repositorio es de 9,5 GB, lo que requiere almacenamiento local considerable.
- Opciones de despliegue: no se especifican en la documentación; al ser checkpoints de PyTorch, pueden usarse con frameworks estándar de inferencia (TorchServe, ONNX Runtime, etc.).
- La inferencia con backbones congelados requiere cargar DINOv3 o V-JEPA 2.1 en memoria, lo que domina el coste computacional.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con modelos alternativos de detección de fauna en imágenes aéreas. El propio estudio incluye un baseline de OWL-D afinado (cuyos checkpoints no se publican por su tamaño), cuyas métricas están disponibles en el repositorio de replicación. Se recomienda consultar el artículo asociado para la comparativa completa.

## Limitaciones y advertencias

- Los backbones DINOv3 y V-JEPA 2.1 no se redistribuyen; deben obtenerse de sus fuentes originales bajo sus propias licencias.
- Los pesos YOLO26x están bajo licencia AGPL-3.0, lo que impone obligaciones de copyleft si se usan esos checkpoints; el resto del repositorio es MIT.
- No se deben mezclar checkpoints de diferentes pliegues de validación cruzada, o se pierde la garantía de datos reservados.
- Los checkpoints de OWL-D afinados no se publican; solo sus métricas.
- El repositorio se declara como licencia `other` porque la combinación MIT/AGPL-3.0 no puede expresarse en un único campo.
- Las imágenes derivan del dataset BAMBI bajo sus propios términos; verificar las restricciones de uso del dataset original.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al tratarse de detección de objetos, el riesgo principal es el de falsos positivos/negativos en condiciones de oclusión severa.
- 24 directorios de una sola división se conservan deliberadamente para respaldar dos afirmaciones del artículo; no forman parte de la validación cruzada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cpraschl/SeeingTheUnseen
- Repositorio de replicación (código y métricas): https://github.com/Faline-eco/SeeingTheUnseen-Replication
- Licencia: https://github.com/Faline-eco/SeeingTheUnseen-Replication/blob/main/LICENSE
- Dataset BAMBI (fuente de las imágenes): no se proporciona enlace directo en la documentación
- DINOv3 y V-JEPA 2.1: deben obtenerse de sus fuentes originales (no enlazadas en la model card)
