# CharlieBT/kd31-ta5

## Resumen

CharlieBT/kd31-ta5 es un modelo de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) publicado en Hugging Face por el usuario CharlieBT bajo licencia Apache 2.0. Se distribuye como un modelo de la familia Gemma 4, según la etiqueta `gemma4` del repositorio, y está configurado en la librería Transformers con pesos en formato safetensors. El pipeline declarado es `text-classification`, aunque las etiquetas también incluyen `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen-texto.

El modelo se presenta como un derivado (merge o fine-tuning) de tres modelos base: `danyloooah/reax-g2-soup2`, `draven123/sn92-gen-r2-k6` y `whynotBeTop/gemma4-31b-choice-ft`. Esta composición indica un proceso de fusión de pesos o ajuste fino sobre checkpoints previos de Gemma 4 de 31B, orientado presumiblemente a tareas de clasificación de texto y elección entre opciones (choice), a juzgar por el nombre del checkpoint base `gemma4-31b-choice-ft`.

La relevancia del modelo es limitada en el momento de la publicación: cuenta con 0 descargas y 0 likes, el repositorio ocupa 62,6 GB y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. No se dispone de información sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según etiqueta `gemma4`; detalles específicos no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `gemma4`, que sitúa al modelo en la familia Gemma 4 de Google. El número de parámetros (31,3B) y el tamaño del repositorio (62,6 GB) son coherentes con pesos en precisión bf16/fp16 (aproximadamente 2 bytes por parámetro). No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones.

El modelo deriva de tres checkpoints base identificados en las etiquetas: `danyloooah/reax-g2-soup2`, `draven123/sn92-gen-r2-k6` y `whynotBeTop/gemma4-31b-choice-ft`. Los sufijos "soup" y "merge" en las etiquetas `base_model:merge` indican que se ha aplicado una técnica de fusión de modelos (model soup o weight merging) sobre checkpoints de Gemma 4 de 31B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo está orientado a tareas de clasificación.
- Procesamiento imagen-texto: la etiqueta `image-text-to-text` sugiere capacidad de entrada multimodal (imagen y texto), aunque no se detalla su alcance.
- Selección entre opciones (choice): el checkpoint base `gemma4-31b-choice-ft` apunta a un ajuste fino para tareas de elección múltiple o ranking de respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está informado.
- Modo thinking, visión o audio: solo la etiqueta `image-text-to-text` sugiere visión; no hay confirmación adicional.

## Casos de uso

- Clasificación de textos en producción: dado que el pipeline declarado es `text-classification`, el modelo puede emplearse para etiquetar documentos, correos o tickets con categorías predefinidas, integrándose en pipelines de Transformers.
- Moderación de contenido: uso como clasificador de seguridad o toxicidad sobre textos de entrada, aprovechando su tamaño de 31B para capturar matices que modelos más pequeños pasan por alto.
- Evaluación automática de respuestas: el origen en un checkpoint `choice-ft` lo hace adecuado para tareas de elección múltiple, como puntuar respuestas de candidatos o seleccionar la mejor opción entre varias.
- Análisis de documentos con imagen y texto: si se confirma la capacidad `image-text-to-text`, podría procesar capturas, formularios escaneados o documentos mixtos para extraer y clasificar información.
- Filtrado y enrutamiento en pipelines RAG: clasificar consultas de usuario para dirigirlas al índice o al submodelo adecuado dentro de un sistema de recuperación aumentada.
- Investigación sobre fusión de modelos: al ser un merge de tres checkpoints, sirve como caso de estudio para evaluar técnicas de model soup y su efecto en tareas de clasificación.
- Etiquetado de datos a escala: generación de etiquetas preliminares para conjuntos de datos de entrenamiento, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3B parámetros, en bf16/fp16 se requieren aproximadamente 62,6 GB de VRAM (coincide con el tamaño del repositorio). En cuantización de 8 bits, en torno a 32 GB; en 4 bits, en torno a 16-18 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: para precisión completa, A100 80 GB, H100 80 GB o múltiples GPU de 40 GB. Para cuantización 8 bits, A100 40 GB o L40S 48 GB.
- ¿Cabe en GPU de consumo? En 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen ajustado para el contexto; no hay confirmación del autor.
- Opciones de despliegue: Transformers (librería declarada), y previsiblemente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se confirma compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-ta5 | 31,3B | no disponible | Apache 2.0 | Gated | Merge de tres checkpoints Gemma 4 31B; pipeline text-classification |
| whynotBeTop/gemma4-31b-choice-ft | ~31B (por nombre) | no disponible | no disponible | no disponible | Checkpoint base del que deriva |
| danyloooah/reax-g2-soup2 | no disponible | no disponible | no disponible | no disponible | Checkpoint base del que deriva |
| draven123/sn92-gen-r2-k6 | no disponible | no disponible | no disponible | no disponible | Checkpoint base del que deriva |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a la relación de derivación.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia de documentación: no hay model card con detalles de entrenamiento, datos, sesgos o evaluación; esto dificulta la validación para producción.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no hay evaluación publicada que lo cuantifique.
- Sesgos conocidos: no disponibles; al derivar de Gemma 4, podría heredar sesgos de los checkpoints base, pero no se documenta.
- Idiomas soportados: no informados; no se puede garantizar cobertura multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Gemma 4 conviene verificar que los términos de los checkpoints base sean compatibles con la relicencia.
- Sin adopción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana máxima.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-ta5
- Modelo base 1: https://huggingface.co/danyloooah/reax-g2-soup2
- Modelo base 2: https://huggingface.co/draven123/sn92-gen-r2-k6
- Modelo base 3: https://huggingface.co/whynotBeTop/gemma4-31b-choice-ft
