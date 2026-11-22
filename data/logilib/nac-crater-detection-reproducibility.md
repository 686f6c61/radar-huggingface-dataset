# LogiLib/nac-crater-detection-reproducibility

## Resumen

El repositorio `LogiLib/nac-crater-detection-reproducibility` no contiene un modelo generativo, sino un conjunto de checkpoints de investigación para la detección de cráteres lunares sobre imágenes NAC (Narrow Angle Camera) del orbitador LRO. Lo publica el usuario LogiLib como material de reproducibilidad de un estudio de curso sobre anotaciones incompletas de cráteres y supervisión por etapas de regiones desconocidas ("stage-aware unknown-region supervision"). El autor declara explícitamente que no se trata de una publicación oficial de NASA–IBM: el modelo fundacional subyacente y el detector público de referencia sí provienen de NASA–IBM.

Los checkpoints cubren la segunda ronda emparejada de experimentos (semilla de entrenamiento 45, semilla de enmascarado 1702): siete checkpoints de métodos y ablaciones, dos controles emparejados originales y el estado inicial compartido. Cada archivo pesa aproximadamente 889,8 MB (889.823.383 bytes), lo que sitúa el repositorio completo en 8,9 GB. El paquete de código y evidencias asociado documenta las otras cuatro rondas emparejadas, cuyos checkpoints no se alojan aquí.

La relevancia es metodológica más que de producto: el repositorio permite auditar y reproducir comparaciones controladas entre estrategias de supervisión (stage-aware frente a controles con ignorancia de región, ablaciones de RPN/ROI, sin tamaño, sin consistencia) bajo una arquitectura de detección de objetos de dos etapas. El autor no reclama generalización a regiones independientes ni que la supervisión stage-aware supere de forma consistente a los controles más simples.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de dos etapas (RPN + ROI head) sobre el modelo fundacional lunar de NASA–IBM; detalles exactos no disponibles en la model card |
| Parametros totales | no disponible (checkpoints de ~889,8 MB cada uno; recuento de parametros no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en precision de entrenamiento, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` (PyTorch) y `.pt` inicial; manifiesto `weights_manifest.json` con hashes SHA-256 |

## Arquitectura y entrenamiento

La arquitectura es un detector de objetos de dos etapas construido sobre el modelo fundacional lunar de NASA–IBM, con una cabeza de propuestas de región (RPN) y una cabeza de clasificación/regresión por ROI. Las ablaciones publicadas confirman esta descomposición: `small_biased_rpn_only` y `small_biased_roi_only` aíslan cada etapa, mientras que `small_biased_no_size` y `small_biased_no_consistency` eliminan componentes concretos de la función de pérdida. No se documentan en la model card el número de capas, la dimensión de los embeddings ni el recuento total de parámetros.

El entrenamiento se realizó sobre el conjunto público SomBench NAC de NASA–IBM (revisión de dataset `79419eb3486b2dd9ad09a283802e0bb8d75c767d`), centrado en el problema de anotaciones incompletas de cráteres. La innovación metodológica es la supervisión "stage-aware" de regiones desconocidas, comparada contra controles de ignorancia binaria de región. El diseño experimental usa rondas emparejadas con semillas fijas (ronda 02: semilla de entrenamiento 45, semilla de enmascarado 1702) y un estado inicial compartido (`initial_states/round_02_initial.pt`), lo que permite atribuir diferencias a los métodos y no a la inicialización. No se especifican en la información disponible el número de tokens, épocas, composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables en detección de objetos).

## Capacidades

- Detección de objetos: localización y clasificación de cráteres en imágenes NAC de la superficie lunar.
- Supervisión de regiones desconocidas: variantes stage-aware y de ignorancia binaria para tratar anotaciones incompletas.
- Ablaciones controladas: checkpoints que aíslan RPN, ROI, señal de tamaño y consistencia.
- Reproducibilidad verificable: hashes SHA-256 por archivo y manifiesto de pesos con el mapeo a rutas locales originales.
- Comparación emparejada: controles y estado inicial compartido para experimentos con semillas fijas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector visual, no un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, captioning) ni modos de "thinking".

## Casos de uso

- Reproducción de experimentos académicos: descargar los checkpoints de la ronda 02, verificar SHA-256 y replicar las comparaciones entre stage-aware y controles de ignorancia usando el paquete de código del curso.
- Auditoría de metodología de ablaciones: usar `small_biased_rpn_only` y `small_biased_roi_only` para aislar la contribución de cada etapa del detector en la detección de cráteres.
- Estudio de anotaciones incompletas: emplear los checkpoints con y sin señal de tamaño (`small_biased_no_size`) para medir el impacto de las etiquetas parciales en la precisión de detección.
- Análisis de sensibilidad a semillas: comparar `prior_round_02/random.ckpt` y `prior_round_02/small_biased.ckpt` contra sus equivalentes stage-aware para cuantificar la varianza entre inicializaciones.
- Punto de partida para fine-tuning: reutilizar `initial_states/round_02_initial.pt` como estado inicial común en nuevos experimentos sobre SomBench NAC.
- Docencia y formación: material de referencia para cursos de visión por computador que ilustren diseño experimental con controles emparejados y verificación de integridad de artefactos.
- Diagnóstico con el detector público: contrastar los checkpoints del curso con el detector oficial de NASA–IBM para detectar desviaciones sistemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (mAP, precisión/recall, IoU) ni comparaciones cuantitativas con el detector público de NASA–IBM; solo describe la estructura de los artefactos y advierte que no se reclama superioridad consistente de stage-aware sobre los controles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; cada checkpoint pesa ~889,8 MB, por lo que en FP32 la carga de pesos ronda los 0,9 GB y el consumo total depende del tamaño de imagen NAC y del batch, no documentado.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño de los checkpoints, una GPU consumer con 8-12 GB de VRAM debería ser suficiente para inferencia en lote pequeño, aunque no hay confirmación del autor.
- Cabe en GPU consumer: probablemente sí (RTX 3060/4060 en adelante) por el tamaño de pesos, sin datos oficiales de memoria pico.
- Opciones de despliegue: los checkpoints son `.ckpt`/`.pt` de PyTorch; no se distribuyen en GGUF, ONNX ni TensorRT. El despliegue requiere el código del paquete del curso; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de dos etapas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LogiLib/nac-crater-detection-reproducibility` | Detector de dos etapas (checkpoints de curso) | no disponible (~889,8 MB por checkpoint) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| `nasa-ibm-ai4science/Crater-Detection-NASA-IBM-Lunar-Foundation-Model` | Detector público oficial de cráteres | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Hugging Face (oficial NASA–IBM) |
| `nasa-ibm-ai4science/NASA-IBM-Lunar-Foundation-Model` | Modelo fundacional lunar | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Hugging Face (oficial NASA–IBM) |

La comparación relevante es de propósito: el repositorio de LogiLib no compite en rendimiento con los modelos oficiales, sino que aporta artefactos de reproducibilidad y ablaciones sobre ellos. No hay datos de benchmarks que permitan comparar métricas de detección entre las tres entradas.

## Limitaciones y advertencias

- No es una publicación oficial de NASA–IBM; el autor lo declara explícitamente y cualquier cita debe atribuirse al repositorio de curso, no a la organización.
- El autor no reclama generalización a regiones independientes: los resultados pueden no transferirse fuera de las particiones de SomBench NAC usadas.
- No se demuestra que la supervisión stage-aware supere de forma consistente a los controles de ignorancia de región; la model card lo señala como conclusión abierta.
- Solo se alojan los checkpoints de una de cinco rondas emparejadas (ronda 02); las otras cuatro solo están documentadas en el paquete de código, lo que limita la reproducción completa desde este repositorio.
- Riesgo de sobreajuste a las anotaciones incompletas del dataset SomBench NAC y a las semillas fijas empleadas (45 y 1702).
- No se documentan sesgos conocidos, limitaciones de idioma (no aplica) ni restricciones adicionales de licencia más allá de Apache 2.0; conviene verificar la licencia de los modelos NASA–IBM subyacentes antes de uso comercial.
- Ausencia de métricas publicadas: no es posible evaluar la calidad de los checkpoints sin ejecutar el código del curso.
- 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LogiLib/nac-crater-detection-reproducibility
- Modelo fundacional lunar de NASA–IBM: https://huggingface.co/nasa-ibm-ai4science/NASA-IBM-Lunar-Foundation-Model
- Detector público de cráteres de NASA–IBM: https://huggingface.co/nasa-ibm-ai4science/Crater-Detection-NASA-IBM-Lunar-Foundation-Model
- Dataset SomBench NAC Crater Detection (revisión fijada): https://huggingface.co/datasets/nasa-ibm-ai4science/Sombench-NAC-Crater-Detection/tree/79419eb3486b2dd9ad09a283802e0bb8d75c767d
- Patrón de descarga directa: https://huggingface.co/LogiLib/nac-crater-detection-reproducibility/resolve/main/<path>
- Manifiesto de pesos: `weights_manifest.json` dentro del repositorio
