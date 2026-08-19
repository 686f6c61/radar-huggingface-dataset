# emanfatimaa05/code-switching-codesaviours-si26-eman

## Resumen

El modelo `emanfatimaa05/code-switching-codesaviours-si26-eman` es un fine-tuning de `xlm-roberta-base` diseñado para la identificación de idioma a nivel de token en texto code-switched entre roman urdu e inglés. Desarrollado como parte del programa de prácticas Code Saviours SI-26, el modelo clasifica cada palabra de una frase mixta como `URD` (urdu romanizado) o `ENG` (inglés). Este tipo de tarea es relevante porque el code-switching es ubicuo en redes sociales y plataformas de mensajería del sur de Asia, donde los modelos monolingües tradicionales fallan.

El modelo se basa en la arquitectura transformer de XLM-RoBERTa, con 277,45 millones de parámetros, y se ha ajustado con un dataset reducido de 157 frases únicas (1.593 registros a nivel de palabra). A pesar del tamaño limitado de los datos, alcanza una F1 global del 91,13% y una precisión del 90,91% en la evaluación. Está pensado para fines educativos y de investigación, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, fine-tuned para token classification) |
| Parametros totales | 277.454.594 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (por defecto de XLM-RoBERTa) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Roman urdu, ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un transformer encoder preentrenado con masked language modeling en 100 idiomas. Para esta tarea, se añade una cabecera de clasificación de tokens con dos etiquetas (`URD` y `ENG`). El fine-tuning se realizó con la librería Transformers de Hugging Face, con 5 épocas y un batch size de 16, usando aceleración por GPU. El dataset de entrenamiento contiene 125 frases para entrenamiento y 32 para prueba, con un total de 1.593 anotaciones a nivel de palabra. No se aplicaron técnicas de RLHF ni DPO; el ajuste es supervisado estándar. No se reportan innovaciones técnicas adicionales más allá del fine-tuning sobre el modelo base.

## Capacidades

- Identificación de idioma a nivel de token en frases code-switched roman urdu-inglés.
- Clasificación binaria por palabra: `URD` o `ENG`.
- Manejo de mezcla de idiomas dentro de una misma oración, algo que los modelos monolingües no resuelven bien.
- Capacidad multilingüe heredada de XLM-RoBERTa, aunque el fine-tuning se centra exclusivamente en roman urdu e inglés.
- No soporta tool calling, agentes, ni razonamiento multi-paso; es un modelo puramente discriminativo para clasificación de tokens.

## Casos de uso

- Análisis de sentimiento en redes sociales: preprocesar texto code-switched para etiquetar cada token y alimentar posteriormente modelos de análisis de sentimiento específicos por idioma.
- Moderación de contenido en plataformas de mensajería: detectar qué partes de un mensaje mixto están en urdu o inglés para aplicar políticas de moderación diferenciadas.
- Construcción de corpus anotados: usar el modelo como etiquetador automático para crear datasets más grandes de code-switching, reduciendo el esfuerzo de anotación manual.
- Investigación sociolingüística: estudiar patrones de alternancia de idioma en conversaciones reales, identificando qué palabras tienden a cambiar de idioma.
- Mejora de sistemas de traducción automática: segmentar frases mixtas por idioma antes de pasarlas a traductores monolingües, evitando errores por mezcla.
- Educación y demostración de NLP: servir como ejemplo didáctico de fine-tuning de transformers para tareas de etiquetado secuencial en entornos académicos.

## Benchmarks y rendimiento

Según la model card, los resultados de evaluación sobre el conjunto de prueba (32 frases) son:

| Metrica | Valor |
|---|---|
| F1 URD | 92,91% |
| F1 ENG | 87,34% |
| F1 global | 91,13% |
| Accuracy | 90,91% |

No se han publicado comparaciones con otros modelos en la información disponible. El dataset de evaluación es muy pequeño, por lo que estos números deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 277 millones de parámetros en fp32, lo que ocupa aproximadamente 1,1 GB en memoria. Con cuantización a int8 (no disponible oficialmente, pero posible con herramientas como `bitsandbytes`), se podría reducir a unos 300-400 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en batch pequeño. Una NVIDIA T4, GTX 1660 o superior sería adecuada. Para entrenamiento se usó una GPU con aceleración, sin especificar el modelo.
- Sí cabe en GPUs de consumo: una RTX 3060 o incluso una GTX 1650 con 4 GB pueden ejecutar el modelo sin problemas.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, o mediante bibliotecas como `transformers` con pipeline de token classification. También es posible exportar a ONNX para optimización.
- Latencia y throughput: no se han publicado datos. Para un modelo de este tamaño, la inferencia por frase es del orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para identificación de idioma en roman urdu-inglés. Alternativas genéricas serían:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| `xlm-roberta-base` (base) | 278M | 512 | MLM multilingüe | MIT |
| `bert-base-multilingual-cased` | 178M | 512 | MLM multilingüe | Apache 2.0 |
| Este modelo (fine-tuned) | 277M | 512 | Token classification URD/ENG | no disponible |

La comparación directa no es posible porque este modelo es un fine-tuning específico; los modelos base no realizan la tarea de identificación de idioma a nivel de token sin ajuste.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (157 frases únicas), lo que limita la generalización a estilos de escritura, variaciones ortográficas, jerga o abreviaturas no presentes en los datos.
- No se incluyeron etiquetas `MIX` en el dataset, por lo que el modelo no puede distinguir tokens mixtos o ambiguos.
- El rendimiento fuera del dominio roman urdu-inglés no está garantizado; el modelo puede fallar con otros idiomas o dialectos.
- Riesgo de alucinación: al ser un clasificador de tokens, no genera texto, pero puede etiquetar incorrectamente palabras poco frecuentes o con ortografía no estándar.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; se recomienda contactar al autor antes de usarlo en producción.
- No hay garantías de soporte ni mantenimiento; es un proyecto académico de prácticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emanfatimaa05/code-switching-codesaviours-si26-eman
- Dataset asociado: https://huggingface.co/datasets/emanfatimaa05/code-switching-codesaviours-si26-eman
- Repositorio GitHub relacionado (proyecto similar): https://github.com/Hania-Emaan/code-switching-codesaviours-si26-Hania-Emaan
