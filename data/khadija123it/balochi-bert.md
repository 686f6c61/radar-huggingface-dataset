# khadija123it/balochi-bert

## Resumen

balochi-bert es un modelo de clasificación de texto basado en la arquitectura BERT, publicado en Hugging Face por el usuario khadija123it. El repositorio contiene únicamente pesos en formato safetensors (177.855.747 parámetros, aproximadamente 0,7 GB) y una model card autogenerada por la plataforma en la que no se documenta ningún detalle sobre datos de entrenamiento, idiomas, licencia o procedimiento de ajuste. El nombre sugiere un ajuste orientado al idioma balochi, pero esta información no está confirmada en la documentación disponible.

El modelo se distribuye con la etiqueta de pipeline `text-classification`, lo que indica que está pensado para tareas de clasificación de secuencias (por ejemplo, análisis de sentimiento o categorización de documentos) y no como un modelo generativo. Por su tamaño y arquitectura, encaja en el rango de los BERT-base y variantes multilingües, lo que permite ejecutarlo en hardware de consumo con cuantización.

La relevancia actual del modelo es limitada y debe evaluarse con cautela: no hay descargas ni interacciones registradas, la model card está vacía y no se han publicado resultados de evaluación. Cualquier uso en producción requeriría una validación empírica previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, tag `bert`) |
| Parametros totales | 177.855.747 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los BERT estándar usan 512 tokens; no confirmado para este modelo) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el nombre sugiere balochi; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es BERT, un transformer encoder bidireccional con atención completa, tal como indica la etiqueta `bert` del repositorio. El recuento de 177,8 millones de parámetros es coherente con una configuración tipo BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con una cabeza de clasificación añadida, aunque la configuración exacta no se detalla en la información disponible.

No hay información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste supervisado, RLHF o DPO. La model card es la plantilla autogenerada de Hugging Face y todos los campos relevantes aparecen como «More Information Needed». Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que en cualquier caso no aplican a un encoder BERT estándar.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo está diseñado para asignar etiquetas a secuencias de texto.
- Representaciones contextuales: al ser un encoder BERT, puede emplearse para extraer embeddings de frases o documentos, aunque no se ha validado esta capacidad.
- Capacidad multilingüe: no disponible; el nombre apunta a balochi pero no hay confirmación.
- Tool calling / function calling: no soportado (no es un modelo generativo ni de instrucciones).
- Agentes y razonamiento multi-step: no soportado.
- Generación de texto, código, matemáticas o visión: no soportado.
- Modo thinking, audio o visión: no disponible.

## Casos de uso

- Clasificación de sentimiento en textos en balochi: si el ajuste se confirma para este idioma, el modelo podría etiquetar opiniones o reseñas; requiere validación previa con un conjunto de evaluación propio.
- Categorización de noticias o documentos: asignación de etiquetas temáticas a corpus textuales, aprovechando la arquitectura encoder para secuencias de hasta 512 tokens (si se confirma la configuración estándar).
- Moderación de contenido: detección de categorías de texto inapropiado en plataformas comunitarias, siempre que se entrene o valide con datos representativos del dominio.
- Extracción de embeddings para búsqueda semántica: uso del encoder para generar vectores de documentos y alimentar un índice vectorial; la calidad dependerá del corpus de entrenamiento, no documentado.
- Filtrado de datos en pipelines de anotación: clasificación preliminar de grandes volúmenes de texto para priorizar la revisión humana.
- Investigación lingüística sobre balochi: análisis de patrones textuales y etiquetado asistido en estudios del idioma, con la cautela de que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB (177,8 M de parámetros × 4 bytes).
- VRAM estimada en fp16: aproximadamente 0,35 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (etiqueta `text-embeddings-inference`), endpoints compatibles; no se distribuyen pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; al ser un BERT-base, se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| khadija123it/balochi-bert | 177,8 M | no disponible | no disponible | Hugging Face, 0 descargas |
| bert-base-multilingual-cased | ~178 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | ~110 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| XLM-RoBERTa-base | ~278 M | 512 tokens | MIT | Hugging Face, ampliamente usado |

La comparación se limita a parámetros y licencia: no hay datos de rendimiento del modelo evaluado que permitan contrastar calidad. Las alternativas multilingües citadas cuentan con documentación completa y comunidades activas, a diferencia de balochi-bert.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor antes de integrarlo en producción.
- Sin métricas publicadas: no hay evidencia de calidad en ninguna tarea.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto libre), pero puede producir clasificaciones erróneas sin que haya forma de calibrarlas a priori.
- Sesgos desconocidos: al no documentarse el corpus, no se pueden evaluar sesgos lingüísticos, culturales o de dominio.
- Cobertura de idioma incierta: el nombre sugiere balochi, pero no se confirma ni el script (árabe o latino) ni la variedad dialectal.
- Contexto limitado: si se confirma la configuración BERT estándar, la ventana es de 512 tokens, insuficiente para documentos largos.
- Sin mantenimiento aparente: cero descargas y actualización única en la misma fecha de creación; no hay garantía de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khadija123it/balochi-bert
- Otro repositorio del mismo autor: https://huggingface.co/khadija123it/bert-text-completion
- Proyecto Balochi AI (contexto del idioma, no del modelo): https://balochtech.com/projects/balochi-ai
- Paper de referencia BERT: https://arxiv.org/abs/1910.09700
