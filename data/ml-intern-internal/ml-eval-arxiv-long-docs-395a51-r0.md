# ml-intern-internal/ml-eval-arxiv-long-docs-395a51-r0

## Resumen

`ml-intern-internal/ml-eval-arxiv-long-docs-395a51-r0` es un repositorio de Hugging Face asociado a un experimento de clasificación de materias de arXiv a partir del texto completo de artículos científicos. El autor es la organización `ml-intern-internal` y el repositorio se creó el 17 de noviembre de 2026. En el momento de redactar esta ficha, el repositorio no contiene pesos de modelo: la model card indica explícitamente que el script de entrenamiento está listo pero que el entrenamiento no se ha ejecutado porque las credenciales disponibles devolvieron errores 403 al enviar trabajos. Por tanto, no existe un modelo entrenado que evaluar.

El objetivo declarado del experimento es resolver una tarea de clasificación en 11 clases sobre el conjunto de datos `ccdv/arxiv-classification`, que contiene 28.400 documentos de entrenamiento, 2.500 de validación y 2.500 de prueba. Cada documento supera los 4.000 tokens, lo que motiva el uso de un modelo de atención eficiente con ventana de contexto larga: `allenai/longformer-base-4096`. El repositorio funciona como artefacto de trazabilidad de un pipeline de entrenamiento automatizado (ML Intern) más que como un modelo publicable.

La relevancia de esta ficha es principalmente documental: sirve para identificar que el repositorio no es utilizable en producción, que no hay métricas publicadas y que cualquier evaluaci��n del modelo es imposible hasta que se ejecute el entrenamiento. No debe confundirse con un modelo desplegable, ya que no hay pesos, tokenizador ni configuración de inferencia publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el script apunta a `allenai/longformer-base-4096`, un transformer con atención local por ventanas, pero no se ha entrenado ni publicado) |
| Parámetros totales | no disponible (Longformer-base tiene aproximadamente 149M de parámetros, pero no se confirma en la información del repositorio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de entrada declarada en la receta) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el corpus de arXiv es predominantemente inglés, pero no se declara) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se han publicado pesos) |

## Arquitectura y entrenamiento

La receta describe el uso de `allenai/longformer-base-4096` con una longitud de entrada de 4.096 tokens, justificada porque todos los documentos del conjunto de datos superan los 4.000 tokens y un truncamiento a secuencias cortas rompería la tarea. El preprocesamiento elimina las marcas `arXiv:NNNN.NNNNNvN [categoría]` del texto, ya que nombran literalmente la etiqueta y producirían fuga de información. El entrenamiento previsto es de una sola época, con batch efectivo de 16 (4 × acumulación de gradiente 4), tasa de aprendizaje 2e-5, precisión fp16 y checkpointing de gradientes. La evaluación durante el entrenamiento se haría sobre una submuestra fija de 800 documentos de validación, con evaluación completa de validación y prueba al final. El hardware objetivo es una instancia `a10g-small` con 24 GB de VRAM.

No se ha ejecutado ninguna fase de entrenamiento: la model card indica que los envíos de trabajos y de sandbox devolvieron 403 y que el modelo se subirá a este repositorio cuando el script se ejecute. No hay información sobre datos de preentrenamiento, RLHF, DPO ni innovaciones técnicas adicionales más allá del uso de Longformer para atención de ventana deslizante. Tampoco se documenta ninguna decodificación especulativa ni optimización de inferencia.

## Capacidades

- No hay capacidades verificables: el repositorio no contiene pesos ni tokenizador.
- La capacidad prevista es la clasificación multi-clase (11 clases) de materias de arXiv a partir del texto completo de un artículo.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe.
- No se declara modo de pensamiento, visión ni audio.
- No se declara generación de texto: la tarea es de clasificación, no de generación.

## Casos de uso

- Clasificación automática de artículos científicos: el modelo previsto tomaría el texto completo de un preprint y asignaría una de 11 categorías de arXiv, útil para triaje editorial y organización de repositorios. No es ejecutable hoy porque no hay pesos.
- Enrutamiento de revisiones por pares: asignar revisores según la materia detectada en el texto completo, con la ventaja de usar 4.096 tokens de contexto para capturar metodología y conclusiones. Bloqueado por falta de modelo entrenado.
- Indexación temática de bibliotecas digitales: etiquetar lotes de PDFs convertidos a texto para motores de búsqueda académica. Requiere el modelo final, no disponible.
- Filtrado de literatura para revisiones sistemáticas: descartar artículos fuera de alcance antes de la lectura manual. No implementable sin pesos.
- Análisis de tendencias por disciplina: agregar clasificaciones sobre corpus históricos de arXiv para medir evolución temática. Depende de la ejecución del entrenamiento.
- Detección de cambios de categoría: comparar la etiqueta declarada por el autor con la predicha por el modelo para detectar reclasificaciones. No disponible hasta que exista el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de validación ni de prueba, y el entrenamiento no se ha ejecutado. No se deben inferir cifras de precisión a partir de la receta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos publicados. Como referencia de la receta, el entrenamiento se planificó en una GPU de 24 GB (`a10g-small`).
- GPU recomendadas: no disponible para inferencia. Para el entrenamiento previsto, una A10G de 24 GB.
- ¿Cabe en GPU de consumo? No se puede confirmar sin pesos. Un Longformer-base de ~149M de parámetros en fp16 ocuparía del orden de 300 MB, pero este dato no está confirmado en la información del repositorio.
- Opciones de despliegue: no disponible (no hay artefactos de inferencia, GGUF, safetensors ni configuración de vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ml-intern-internal/ml-eval-arxiv-long-docs-395a51-r0` | no disponible | 4.096 tokens (previsto) | Clasificación 11 clases | no disponible | Sin pesos |
| `allenai/longformer-base-4096` | ~149M (referencia externa, no confirmada en el repo) | 4.096 tokens | Codificador de propósito general | Apache 2.0 (referencia externa) | Pesos públicos |
| `ccdv/longformer-base-4096-arxiv-classification` | no disponible en esta búsqueda | no disponible | Clasificación de arXiv | no disponible | Referencia del dataset, no verificada en esta ficha |

La comparativa es limitada: el repositorio no publica pesos y la información proporcionada no incluye métricas de modelos alternativos. Cualquier comparación de rendimiento sería especulativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: la model card afirma que el entrenamiento no se ha ejecutado por errores 403 en el envío de trabajos.
- No hay pesos, tokenizador, configuración ni métricas: es imposible ejecutar inferencia o reproducir resultados con este repositorio.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución.
- Idiomas no declarados: el corpus de arXiv es mayoritariamente inglés, pero no se documenta el comportamiento en otros idiomas.
- Riesgo de fuga de etiqueta si no se aplica el preprocesamiento descrito (eliminación de marcas `arXiv:NNNN.NNNNNvN [categoría]`); el propio autor lo advierte.
- La tarea es de clasificación cerrada en 11 clases; no es un modelo generativo ni un asistente conversacional.
- El repositorio tiene 0 descargas y 0 likes, y su nombre incluye `internal`, lo que sugiere un artefacto de experimentación sin garantías de mantenimiento.
- No se debe citar este repositorio como modelo de referencia en producción sin verificar antes que los pesos se han publicado y que la licencia lo permite.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ml-intern-internal/ml-eval-arxiv-long-docs-395a51-r0
- Dataset `ccdv/arxiv-classification`: https://huggingface.co/datasets/ccdv/arxiv-classification
- Paper de origen del dataset (He et al., IEEE Access 2019): https://arxiv.org/abs/1909.04844
- Modelo base previsto: https://huggingface.co/allenai/longformer-base-4096
- Dashboard de métricas Trackio: https://huggingface.co/spaces/GuillaumeSalouHF/arxiv-long-docs-classification-trackio
- ML Intern (chat): https://hf.co/chat?mode=ml-intern
