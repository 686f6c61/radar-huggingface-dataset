# byougert/MNEMO

## Resumen

MNEMO es un modelo de recuperación interactiva de personas presentado en el artículo *Interactive Person Retrieval via Multi-Turn Multimodal Conversation* (ICML 2026). Desarrollado por Bai, Wang, Yang, Cao, Wang y Ye, aborda el problema de localizar a una persona concreta en un conjunto de imágenes o vídeos mediante una conversación multimodal multi-turno, en la que los resultados se refinan progresivamente a partir del diálogo y del feedback visual del usuario. Utiliza InternVL2.5-1B como backbone, lo que le confiere una base sólida en comprensión visual y lingüística, y cuenta con aproximadamente 961 millones de parámetros.

El modelo representa cada turno de diálogo como una unidad multimodal atómica y agrega la memoria del diálogo para modelar dependencias finas entre turnos, una innovación clave frente a los métodos de recuperación tradicionales de una sola consulta. Está disponible en dos versiones: un checkpoint preentrenado en el dataset MALS y el modelo final afinado en MInterPEDES. Su relevancia actual radica en su aplicación a tareas de búsqueda forense, vigilancia y organización de archivos multimedia, donde la interacción natural y la corrección iterativa son fundamentales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | InternVL2.5-1B (backbone) con agregación de memoria de diálogo |
| Parámetros totales | 961.190.784 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MNEMO se basa en el backbone InternVL2.5-1B, un modelo multimodal que combina un codificador visual y un modelo de lenguaje. La arquitectura se extiende para tratar cada turno de conversación como una unidad multimodal atómica: el diálogo y la imagen asociada se codifican conjuntamente y se agregan en una memoria de diálogo que modela las dependencias entre turnos. Esta memoria permite que el modelo mantenga el contexto de refinamiento a lo largo de la interacción, de modo que las consultas posteriores se basen en resultados previos y en las correcciones del usuario.

El entrenamiento se realiza en dos fases: una primera preentrenamiento en el dataset MALS (cuyos detalles no se especifican en la información disponible) y un finetuning posterior sobre el dataset MInterPEDES, diseñado específicamente para la recuperación interactiva de personas con diálogo multi-turno. No se han publicado datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la aplicación de técnicas como RLHF o DPO.

## Capacidades

- Recuperación interactiva de personas: el modelo refina los resultados de búsqueda mediante conversaciones multi-turno, donde el usuario proporciona descripciones textuales y feedback visual (p. ej., señalar una imagen incorrecta) y el modelo ajusta los resultados.
- Comprensión multimodal: integra imágenes y texto en una única representación, gracias al backbone InternVL2.5-1B, lo que permite interpretar consultas complejas que combinan lenguaje natural y contenido visual.
- Memoria de diálogo: agrega la información de turnos anteriores para mantener coherencia en la conversación y mejorar la precisión en búsquedas progresivas.
- Extracción de características: el modelo se puede utilizar como extractor de características (feature-extraction) para representar imágenes y texto en un espacio común, útil para tareas de re-identificación de personas (person re-identification).
- Interacción visual: soporta feedback visual del usuario (por ejemplo, marcar una imagen como correcta o incorrecta) para guiar la búsqueda.
- Procesamiento de lenguaje natural en inglés: el modelo está entrenado en inglés y no se ha documentado su capacidad en otros idiomas.

## Casos de uso

- **Búsqueda de personas en vídeo de vigilancia**: un operador puede iniciar una búsqueda describiendo a la persona ("hombre con chaqueta azul"), y luego refinar los resultados indicando "no, la chaqueta es más oscura" o seleccionando una imagen de referencia. MNEMO mantiene el contexto de la conversación y reduce la lista de candidatos progresivamente, lo que acelera la localización en grandes archivos de CCTV.

- **Organización de fototecas personales o corporativas**: en una biblioteca de imágenes, el modelo permite localizar una persona a partir de descripciones naturales ("la mujer que estaba junto a la fuente en la boda") y refinar la búsqueda mediante turnos adicionales, sin necesidad de construir consultas complejas manualmente.

- **Re-identificación de personas en bases de datos**: la capacidad de extracción de características del modelo puede integrarse en un pipeline de re-identificación (ReID) para comparar la imagen de una persona en diferentes cámaras o momentos, con la ventaja de que el diálogo interactivo permite ajustar el criterio de comparación sobre la marcha.

- **Asistente de investigación para análisis de imágenes forenses**: un investigador puede interrogar una colección de imágenes de forma iterativa, p. ej., "busca a alguien con una mochila roja", y luego "que también lleve gafas", recibiendo resultados actualizados en cada turno. Esto facilita la revisión de grandes volúmenes de imágenes en contextos judiciales o de investigación.

- **Moderación y etiquetado de contenido**: en plataformas de contenidos, un moderador puede usar MNEMO para localizar a personas específicas en vídeos o fotos mediante diálogo, refinando la búsqueda con descripciones de ropa, acciones o características faciales, sin necesidad de consultas SQL o búsquedas manuales.

- **Búsqueda interactiva en archivos de prensa**: un periodista o archivero puede encontrar fotografías históricas de una persona mediante una conversación con el modelo, describiendo la apariencia en cada turno y seleccionando imágenes correctas o incorrectas para guiar el proceso, lo que facilita la gestión de archivos visuales extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper ICML 2026 no aparece en los datos proporcionados, y la model card no incluye métricas como MMLU, HumanEval o métricas específicas de recuperación (p. ej., mAP en ReID).

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 961 millones de parámetros, el modelo requiere aproximadamente 1,9 GB en FP16 (2 bytes por parámetro) y unos 0,96 GB en INT8. Si se usa cuantización de 4 bits, la VRAM necesaria se reduce a alrededor de 0,5 GB, aunque no se han publicado valores oficiales de cuantización.
- **GPU recomendadas**: una GPU de gama media como la RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente para la inferencia en FP16; tarjetas como la RTX 4090 (24 GB) permiten un procesamiento de lotes más grande y menor latencia. En entornos de servidor, una A100 (40/80 GB) o H100 (80 GB) ofrece un rendimiento óptimo.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs de consumo modernas (8 GB de VRAM) gracias a su tamaño moderado y a la posibilidad de cuantización.
- **Opciones de despliegue**: al estar basado en transformers y safetensors, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El pipeline de feature-extraction permite su integración en sistemas de embeddings.
- **Latencia y throughput estimados**: no disponible. La latencia dependerá del hardware y de la optimización, pero para un modelo de ~1B de parámetros se espera una generación de decenas de tokens por segundo en una GPU de consumo (p. ej., 20-40 tokens/s en RTX 4090), aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (recuperación interactiva de personas con diálogo multi-turno). Alternativas genéricas de recuperación de personas (ReID) como TransReID o CLIP-ReID no incorporan interacción conversacional, por lo que no se puede realizar una comparación directa con los datos disponibles. Se recomienda consultar el paper de ICML 2026 para obtener una comparativa técnica con otros métodos.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta inglés; su uso en otros idiomas no está garantizado y puede degradar el rendimiento.
- **Contexto y longitud de conversación**: no se ha especificado la longitud máxima de contexto, por lo que conversaciones muy largas pueden superar el límite del modelo y causar pérdida de memoria de turnos anteriores.
- **Sesgos**: no se han documentado sesgos específicos, pero al estar entrenado en un dataset de personas (MInterPEDES), puede heredar sesgos de género, edad o etnia presentes en los datos de entrenamiento.
- **Alucinación**: como cualquier modelo multimodal, puede generar descripciones o identificaciones incorrectas en imágenes ambiguas, lo que es crítico en aplicaciones de vigilancia o investigación.
- **Dependencia del dataset de entrenamiento**: el rendimiento en dominios distintos a MInterPEDES o MALS puede degradarse significativamente, ya que el modelo está especializado en la tarea de recuperación de personas.
- **Licencia**: la licencia MIT permite uso comercial y modificación, pero es recomendable revisar los términos del dataset MInterPEDES y del backbone InternVL2.5-1B, ya que podrían tener restricciones adicionales (no documentadas aquí).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/byougert/MNEMO)
- [Dataset MInterPEDES](https://huggingface.co/datasets/byougert/MInterPEDES)
- [Código oficial (GitHub)](https://github.com/Flame-Chasers/MNEMO)
- Paper ICML 2026: "Interactive Person Retrieval via Multi-Turn Multimodal Conversation" (enlace no disponible en la información proporcionada)
