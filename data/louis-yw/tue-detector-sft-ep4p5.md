# Louis-YW/TUE-Detector-SFT-ep4p5

## Resumen

TUE-Detector-SFT-ep4p5 es un checkpoint de fine-tuning supervisado (SFT) sobre el modelo multimodal Qwen2.5-VL-7B, desarrollado por Louis-YW como parte del proyecto TUE-Detector, orientado a la autenticidad y forensia de vídeo. El modelo está diseñado para detectar manipulaciones o artefactos en secuencias de vídeo, integrando capacidades de comprensión visual y lingüística propias de la familia Qwen2.5-VL. Este checkpoint concreto representa la fase post-SFT y pre-RL, es decir, la inicialización estable antes de un posterior entrenamiento por refuerzo, tal y como indica su model card.

Con 8.292.166.656 parámetros (aproximadamente 8,29 mil millones), el modelo se distribuye en formato safetensors y se carga mediante la librería transformers con las clases `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`. Su pipeline es image-text-to-text, lo que permite procesar entradas visuales (imágenes y vídeo) junto con texto. Aunque la licencia y los idiomas soportados no están especificados en la ficha de HuggingFace, el modelo hereda la arquitectura y el tokenizador de Qwen2.5-VL, que soporta múltiples idiomas de forma nativa. Su relevancia radica en la creciente necesidad de herramientas de verificación de contenido audiovisual en un contexto de proliferación de deepfakes y vídeos generados por IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal visión-lenguaje) |
| Parametros totales | 8.292.166.656 (8,29 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Qwen2.5-VL base soporta hasta 128k tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (heredados de Qwen2.5-VL, no especificados) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL-7B, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje, diseñado para tareas que requieren comprensión conjunta de imágenes, vídeo y texto. El checkpoint ha sido sometido a un fine-tuning supervisado (SFT) durante 4,5 épocas (ep4p5), como indica su nombre, con el objetivo de especializarlo en la detección de unidades temporales o artefactos de vídeo (TUE, probablemente "Temporal Unit Embedding"). No se han publicado detalles sobre el dataset de entrenamiento, la composición de los datos ni el uso de técnicas como RLHF o DPO. La model card indica que este checkpoint sirve como inicialización estable para una fase posterior de aprendizaje por refuerzo (RL), lo que sugiere que el modelo final aún no está liberado y que este es un artefacto intermedio del pipeline de entrenamiento.

## Capacidades

- Detección de autenticidad de vídeo: el modelo está entrenado para identificar señales de manipulación o generación sintética en secuencias de vídeo.
- Procesamiento multimodal: acepta entradas de imagen y vídeo junto con texto, gracias a la arquitectura Qwen2.5-VL.
- Generación de texto condicionada a contenido visual: puede producir descripciones, análisis o respuestas basadas en el contenido de vídeo.
- Soporte de tool use: el repositorio asociado (Louis-YW/TUE) incluye código de inferencia y uso de herramientas, lo que sugiere capacidad de integración con funciones externas.
- Interacción conversacional: el tag "conversational" indica que puede mantener diálogos multi-turno sobre el contenido analizado.
- Compatibilidad con pipelines de generación de texto e imagen: al ser un modelo image-text-to-text, puede integrarse en sistemas que requieran análisis visual y respuesta textual.

## Casos de uso

- Verificación de autenticidad en plataformas de vídeo: el modelo puede analizar metraje subido por usuarios para detectar posibles deepfakes o ediciones maliciosas, ayudando a moderadores a priorizar revisiones manuales.
- Análisis forense en investigaciones judiciales: peritos y analistas pueden utilizar el modelo para examinar grabaciones presentadas como evidencia, identificando inconsistencias temporales o artefactos de generación.
- Auditoría de integridad de medios en agencias de noticias: redacciones pueden verificar la autenticidad de vídeos recibidos de fuentes no verificadas antes de su publicación, reduciendo el riesgo de difundir desinformación.
- Moderación de contenido generado por IA en redes sociales: el modelo puede integrarse en sistemas de filtrado para etiquetar vídeos sintéticos, cumpliendo con normativas de transparencia.
- Investigación académica en forensia digital: grupos de investigación pueden usar el checkpoint como base para estudiar técnicas de detección de manipulación y desarrollar nuevos métodos.
- Desarrollo de herramientas de fact-checking automatizado: organizaciones de verificación pueden combinar este modelo con otras fuentes de datos para crear pipelines de validación de vídeo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de detección de vídeo (como precisión en datasets de deepfake). El repositorio no incluye tablas comparativas ni evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con precisión fp16, el modelo requiere aproximadamente 16-17 GB de VRAM (considerando 8,29 B parámetros × 2 bytes). Con cuantización 4-bit, podría reducirse a unos 5-6 GB, aunque no se ofrecen archivos GGUF ni AWQ en el repositorio.
- GPU recomendadas: para fp16, una RTX 3090, RTX 4090 o A100 de 24 GB es suficiente para inferencia de un solo ejemplo. Para procesamiento por lotes o vídeo largo, se recomiendan GPUs con 40 GB o más (A100 40GB, H100).
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en una RTX 4090 (24 GB) con fp16, o en GPUs de 8-12 GB si se aplica cuantización externa (por ejemplo, con bitsandbytes).
- Opciones de despliegue: el modelo es compatible con transformers, vLLM, TGI (text-generation-inference) y endpoints compatibles, según los tags de HuggingFace. También puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la longitud del vídeo de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TUE-Detector-SFT-ep4p5 | 8,29 B | no disponible | Qwen2.5-VL | no disponible | HuggingFace |
| Qwen2.5-VL-7B (base) | 8,29 B | 128k tokens (oficial) | Qwen2.5-VL | Apache 2.0 (Qwen) | HuggingFace |
| Otros detectores de deepfake (p.ej. modelos basados en EfficientNet o transformers) | variable | variable | CNN/transformer | variable | variable |

La comparativa directa con otros detectores de deepfake es difícil por la falta de benchmarks públicos. Frente al modelo base Qwen2.5-VL-7B, este checkpoint está especializado en forensia de vídeo, pero hereda la misma arquitectura y tamaño. La licencia del modelo base es Apache 2.0, pero la de este checkpoint no está declarada, lo que introduce incertidumbre legal.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que impide determinar si su uso comercial está permitido. Se recomienda contactar al autor antes de utilizarlo en producción.
- Checkpoint intermedio: no es el modelo final del proyecto TUE-Detector; falta la fase de RL, por lo que su rendimiento puede ser inferior al del modelo completo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su eficacia en detección de deepfakes o manipulación de vídeo.
- Sesgos y alucinaciones: no se ha documentado ningún análisis de sesgos. Como modelo multimodal, puede generar respuestas incorrectas o alucinadas sobre el contenido visual, especialmente en vídeos ambiguos o de baja calidad.
- Limitaciones de idioma: aunque Qwen2.5-VL soporta múltiples idiomas, no se ha confirmado el rendimiento de este checkpoint en idiomas distintos del inglés.
- Riesgo de sobreajuste: el fine-tuning en 4,5 épocas sobre un dataset específico de TUE puede provocar una pérdida de generalización en otros tipos de vídeo.
- Dependencia de la arquitectura base: cualquier limitación de Qwen2.5-VL (por ejemplo, en vídeo de muy larga duración o alta resolución) se hereda en este modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Louis-YW/TUE-Detector-SFT-ep4p5
- Repositorio de código e inferencia: https://github.com/Louis-YW/TUE
