# aacudad/AnomalyThink-Qwen3-VL-8B-SFT-GRPO

## Resumen

AnomalyThink-Qwen3-VL-8B-SFT-GRPO es un modelo vision-lenguaje de 8.767.123.696 parámetros (unos 8,77 mil millones) desarrollado por el autor "aacudad" como artefacto de investigación derivado de su tesis de máster sobre detección industrial de anomalías con razonamiento explicable. Se construye sobre Qwen/Qwen3-VL-8B-Instruct y se especializa en una única tarea: dada una imagen cenital de un producto (PCB, pieza industrial), decidir si presenta defectos, indicar tipo y localización, y emitir un razonamiento en lenguaje natural dentro de etiquetas `<think>`. El modelo no es un resultado de la tesis, sino una reproducción posterior (septiembre de 2026) de la receta completa sobre este backbone, publicada para reproducibilidad.

La relevancia técnica está en su pipeline de entrenamiento en dos fases: un ajuste supervisado (SFT) sobre 6.000 trazas generadas por Gemini, seguido de un refinamiento con GRPO (Group Relative Policy Optimization) con dos funciones de recompensa (formato de esquema completo y precisión del veredicto combinada con similitud de embeddings Nomic para el tipo y coincidencia de celda 3x3 para la localización). El resultado en los subconjuntos de MMAD es de 87,14 de balanced accuracy en DS-MVTec (1.670 imágenes) y 72,39 en VisA (2.141 imágenes), frente a 78,68 y 64,45 del modelo base zero-shot, lo que representa la mejor puntuación DS-MVTec de cualquier modelo Qwen del proyecto.

El modelo pertenece a una familia de tres variantes (SFT, SFT-GRPO y KCR) que ilustran un patrón interesante: GRPO mejora DS-MVTec, mientras que el corpus corregido a partir de los rollouts de la propia política GRPO (metodología Keep-Correct-Revise) mejora VisA. Se distribuye con licencia Apache 2.0 y requiere `transformers>=5.0` para cargarse directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (backbone Qwen3-VL-8B-Instruct); sin datos adicionales en la información disponible |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se distribuyen cuantizaciones oficiales; pesos en safetensors con `torch_dtype=bfloat16` |
| Idiomas soportados | no disponible (el prompt de evaluación y entrenamiento está en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (más carpeta `transformers4_vllm/` con tokenizer, processor y config adaptada) |
| Tamaño del repositorio | 17,6 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Dataset de entrenamiento | aacudad/AnomalyThink (6K trazas SFT) + 4.236 imágenes Real-IAD para GRPO |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del backbone Qwen3-VL-8B-Instruct (transformer multimodal que procesa imágenes y texto), y el autor no documenta modificaciones estructurales sobre él. Lo específico de esta ficha es el procedimiento de ajuste. La primera fase es un SFT de una época sobre aproximadamente 6.000 trazas Gemini (checkpoint AnomalyThink-Qwen3-VL-8B-SFT). La segunda fase aplica GRPO desde ese checkpoint, que actúa además como política de referencia fija. La configuración de GRPO es: dos funciones de recompensa sumadas con peso unitario (una binaria de formato de esquema completo y una de precisión que combina el veredicto con la media de la similitud de tipo mediante embeddings Nomic y la coincidencia en una celda de localización 3x3, máximo 3,0), tamaño de grupo 4, clipping 0,2, coeficiente KL 0 (monitorizado), tasa de aprendizaje 1e-6, batch efectivo 8, 4.236 imágenes Real-IAD balanceadas por clase, imágenes limitadas a 480.000 píxeles y 2 épocas de 530 pasos con todos los parámetros entrenables. Este repositorio es el checkpoint-530, final de la época 1; el checkpoint-1060 (época 2) obtuvo 84,89 / 69,90.

La innovación metodológica del proyecto es la receta Keep-Correct-Revise (KCR), descrita en la model card aunque corresponde a otra variante de la familia. Una política SFT+GRPO se muestrea ocho veces sobre cada imagen de entrenamiento: una traza se **keep** cuando el veredicto es correcto y un juez Gemini-3-Flash considera el razonamiento fundamentado; se **corrige** con el profesor cuando todos los rollouts fallaron; y se **revisa** con el profesor cuando el veredicto era correcto pero el razonamiento estaba débilmente fundamentado. El modelo final se ajusta entonces de forma supervisada desde los pesos base sobre ese corpus curado, de modo que la política aprendida por refuerzo es la fuente de sus datos de entrenamiento. El prompt de entrenamiento de GRPO es la pregunta fija "Are there any defects in the query image?" sin mensaje de sistema; bajo ese prompt este checkpoint puntúa 86,52 / 73,90, mientras que la tabla principal reporta la puntuación con el prompt de entrenamiento del SFT para hacerla comparable con las filas SFT y KCR.

## Capacidades

- Generación de texto con razonamiento explícito: emite el bloque `<think>...</think>` antes de la conclusión, con formato de cadena de pensamiento entrenado.
- Detección binaria de anomalías en imágenes de producto: responde `<answer>Yes</answer>` o `<answer>No</answer>`.
- Clasificación del tipo de defecto mediante la etiqueta `<type>`.
- Localización espacial del defecto mediante la etiqueta `<location>`, alineada con una rejilla 3x3 usada en la recompensa de GRPO.
- Descripción y justificación en lenguaje natural del veredicto (razonamiento explicable, no solo etiqueta).
- Procesamiento conjunto image-text (pipeline `image-text-to-text`), una imagen por prompt en el protocolo de evaluación.
- Compatibilidad con tool calling / function calling: no documentada en la información disponible. Al derivar de Qwen3-VL-8B-Instruct cabría esperar capacidades heredadas, pero no hay confirmación del autor, por lo que se marca como no disponible.
- Uso como agente multi-paso: no documentado.
- Capacidades multilingües: no disponibles; todo el entrenamiento y la evaluación documentados están en inglés.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Inspección automática de placas PCB en línea de fabricación: el modelo recibe una imagen cenital de la placa y devuelve veredicto, tipo de defecto y localización; su entrenamiento específico sobre DS-MVTec y su formato de salida estructurado (`<location>`, `<type>`, `<answer>`) permiten integrarlo directamente en un sistema de control de calidad que consuma esos campos de forma programática.
- Triaje previo a inspección humana: dado que emite un razonamiento en `<think>`, un operador puede revisar por qué se marcó una pieza como defectuosa antes de descartarla, reduciendo el tiempo de validación frente a un clasificador opaco.
- Auditoría y trazabilidad de decisiones en producción: el bloque de razonamiento más el tipo y la localización generan un registro textual por pieza inspeccionable, útil para cumplimiento normativo y análisis de causa raíz en lotes con tasa de defectos elevada.
- Verificación de piezas con criterios textuales variables: al ser un modelo de instrucciones multimodal, se puede reformular la consulta (por ejemplo, "analiza este PCB y determina si hay anomalías") manteniendo el esquema de respuesta, lo que permite adaptar el sistema a distintas familias de producto sin reentrenar.
- Investigación en razonamiento visual para detección de anomalías: sirve como punto de comparación reproducible frente a las otras variantes de la familia (SFT, KCR) y frente al backbone, con archivos de evaluación por muestra (`eval_*.json`) incluidos junto a los pesos.
- Generación de datos sintéticos de razonamiento: el pipeline KCR documentado convierte la política GRPO en fuente de trazas curadas para reentrenar un modelo supervisado, un patrón reutilizable para construir corpus de razonamiento en otros dominios industriales.
- Prototipado de asistentes técnicos de mantenimiento: el modelo puede describir textualmente el defecto detectado y dónde se localiza, alimentando informes de incidencia automáticos en plantas con inspección manual parcial.

## Benchmarks y rendimiento

Resultados publicados por el autor. Subconjuntos de MMAD, balanced accuracy (media de sensibilidad y especificidad) con puntuación estricta: una generación sin `<answer>` analizable cuenta como fallo. Protocolo homogéneo para todas las filas: una imagen por prompt, prompt de entrenamiento con mensaje de sistema de una línea "Please answer by yes or no", decodificación greedy, máximo 1.024 tokens nuevos, imágenes limitadas a 262.144 píxeles, generación con vLLM.

| Modelo | DS-MVTec | VisA |
|---|---|---|
| Qwen3-VL-8B-Instruct base, zero-shot | 78,68 | 64,45 |
| AnomalyThink-Qwen3-VL-8B-SFT (6K trazas Gemini, época 1) | 80,31 | 67,32 |
| AnomalyThink-Qwen3-VL-8B-SFT-GRPO (época 1, prompt de entrenamiento) | 87,14 | 72,39 |
| AnomalyThink-Qwen3-VL-8B-KCR (rollouts corregidos propios, época 2) | 84,39 | 76,63 |
| Este modelo (checkpoint-530) | 87,14 | 72,39 |

Datos adicionales: bajo el prompt específico de GRPO ("Are there any defects in the query image?", sin mensaje de sistema) este checkpoint puntúa 86,52 / 73,90. El checkpoint-1060 (final de la época 2) obtuvo 84,89 / 69,90. Para contexto, la tesis reporta que un modelo Qwen2.5-VL entrenado sobre el corpus KCR alcanzó 85,82 / 76,45. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,6 GB solo de pesos (tamaño del repositorio), más el coste de activaciones y caché KV; en la práctica se recomienda un mínimo de 20-24 GB de VRAM.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o cualquier acelerador con 24 GB o más. El modelo se carga con `device_map="auto"`, por lo que admite reparto entre varias GPU si no cabe en una.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bfloat16 con margen ajustado, especialmente si se limita el número de tokens nuevos (la evaluación usa 1.024) y el tamaño de imagen. En tarjetas de 16 GB o menos haría falta cuantización, y no se distribuyen pesos cuantizados oficialmente, por lo que habría que generarlos (por ejemplo, a GGUF o AWQ) a partir de los safetensors.
- Opciones de despliegue: `transformers>=5.0` con `AutoProcessor` y `AutoModelForImageTextToText` es la vía documentada. Para transformers 4.57 o vLLM 0.10.x hay que usar los ficheros de la carpeta `transformers4_vllm/` (tokenizer y processor estándar de Qwen3-VL-8B-Instruct más un config con `rope_theta` escrito en `text_config`); este es el procedimiento con el que se produjeron todos los números de la tabla. TGI, llama.cpp y Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles. El autor solo indica el ajuste de generación (greedy, máximo 1.024 tokens nuevos, imágenes limitadas a 262.144 píxeles en evaluación y 480.000 en entrenamiento).

## Comparativa con modelos similares

Comparativa dentro de la propia familia y frente al backbone, con los datos publicados por el autor. No se dispone de datos de otros detectores de anomalías industriales en la información proporcionada.

| Modelo | Parámetros | DS-MVTec | VisA | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base, zero-shot) | ~8B | 78,68 | 64,45 | apache-2.0 | Sin ajuste; referencia de partida |
| AnomalyThink-Qwen3-VL-8B-SFT | ~8,77B | 80,31 | 67,32 | apache-2.0 | SFT sobre 6K trazas Gemini, época 1 |
| AnomalyThink-Qwen3-VL-8B-SFT-GRPO (este modelo) | 8.767.123.696 | 87,14 | 72,39 | apache-2.0 | GRPO desde el SFT; mejor DS-MVTec del proyecto |
| AnomalyThink-Qwen3-VL-8B-KCR | ~8,77B | 84,39 | 76,63 | apache-2.0 | Corpus corregido propio, época 2; mejor VisA del proyecto |

El patrón que reproduce la tesis en este backbone es que GRPO es el responsable de la mejora en DS-MVTec, mientras que el corpus corregido a partir de los rollouts de la política GRPO es el responsable de la mejora en VisA. La comparación con alternativas externas de detección de anomalías industriales (por ejemplo, enfoques basados en embeddings o en modelos específicos de MVTec) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card lo etiqueta como tal, orientado a detección de anomalías industriales explicable sobre imágenes cenitales de producto, no como modelo de propósito general.
- Una sola semilla de entrenamiento y sin evaluación humana de las explicaciones generadas; la calidad del razonamiento no está validada por anotadores.
- Selección de hiperparámetros y checkpoint guiada por DS-MVTec, con VisA reportada en el mismo checkpoint, lo que introduce un sesgo de selección en las métricas de VisA.
- Posible contaminación del benchmark: el autor advierte que no puede descartarse que las imágenes públicas de MVTec y VisA hayan sido vistas durante el preentrenamiento del backbone, algo extensible a todos los modelos de la comparación.
- Riesgo de alucinación en el bloque de razonamiento: el formato `<think>` está optimizado por recompensa de formato, y la recompensa de precisión es compuesta (media de similitud de tipo y coincidencia de celda), por lo que una respuesta puede acertar el veredicto con una justificación parcialmente incorrecta.
- Especialización estrecha: el ajuste se ha realizado con un prompt fijo y una tarea binaria con localización; fuera de ese formato el rendimiento no está caracterizado (el propio autor reporta una caída de 87,14 / 72,39 a 86,52 / 73,90 al cambiar de prompt).
- Idiomas: no hay información sobre capacidades multilingües; el prompt de evaluación está en inglés y no se documenta comportamiento en castellano.
- Longitud de contexto: no disponible en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y el dataset empleado pueden arrastrar sus propias condiciones; conviene verificar la licencia de Qwen3-VL-8B-Instruct y del corpus aacudad/AnomalyThink antes de un despliegue comercial.
- Requisito de versión: con transformers 4.57 o vLLM 0.10.x hay que usar obligatoriamente los ficheros de `transformers4_vllm/`; cargar el repositorio con esas versiones sin dichos ficheros puede dar resultados distintos a los publicados.
- Resultados sensibles al protocolo: imágenes limitadas a 262.144 píxeles en evaluación y decodificación greedy; otras configuraciones pueden alterar las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-SFT-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Variante SFT: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-SFT
- Variante KCR: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-KCR
- Dataset: aacudad/AnomalyThink (referenciado en la model card; no se ha encontrado URL adicional en la búsqueda web)
- Cita del autor: `@mastersthesis{acudad2026reasoning, author = {Acudad, A.}, title = {Reasoning-Enhanc...` (referencia truncada en la model card)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo, al paper ni a repositorios asociados; los resultados devueltos corresponden a un medio de prensa polaco sin relación con el proyecto.
