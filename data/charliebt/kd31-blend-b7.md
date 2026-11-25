# CharlieBT/kd31-blend-b7

## Resumen

CharlieBT/kd31-blend-b7 es un ajuste fino (finetune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT en Hugging Face. Se distribuye con la librería transformers en formato safetensors y con un total de 31.273.088.876 parámetros (~31,3 mil millones). Aunque la etiqueta de pipeline es `text-classification`, los tags del repositorio incluyen también `image-text-to-text` y la arquitectura declarada es `gemma4`, lo que sugiere un modelo multimodal derivado de la familia Gemma con capacidad de procesar imagen y texto.

El modelo se presenta como un "blend" (mezcla) en su nombre (`kd31-blend-b7`), lo que apunta a una fusión o combinación de pesos sobre la base karpo-decision-31B, aunque no se documenta la metodología exacta. El repositorio tiene acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia declarada es Apache 2.0, lo que en principio permitiría uso comercial, aunque conviene verificar las condiciones de acceso y la licencia del modelo base.

La relevancia de esta ficha es limitada por la escasez de documentación pública: no hay model card detallada, no se especifican idiomas, no hay benchmarks publicados y el número de descargas y likes es cero en el momento de la consulta. Se trata, por tanto, de un artefacto reciente y poco validado por la comunidad, cuyo interés principal radica en su tamaño (31B) y en su posible naturaleza multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (según tag del repositorio); transformer multimodal imagen-texto |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Pipeline declarado | text-classification |
| Acceso | restringido (gated) |
| Tamano del repo | 62,6 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura `gemma4` y que deriva de MachinePulseAI/karpo-decision-31B mediante un proceso de ajuste fino o mezcla (el sufijo `blend-b7` sugiere una fusión de pesos, posiblemente model merging o un blend de checkpoints). Los tags incluyen tanto `image-text-to-text` como `text-classification`, lo que apunta a un transformer multimodal con capacidad de recibir imágenes y texto y producir texto o clasificaciones. No se especifica si emplea atención lineal, decodificación especulativa ni otras innovaciones técnicas.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se detalla la metodología del "blend" ni qué proporción de pesos proviene de cada fuente. Todo lo relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto y razonamiento: derivado de un modelo de 31B, se espera capacidad de generación y razonamiento general, aunque no hay evaluación publicada.
- Procesamiento imagen-texto: el tag `image-text-to-text` sugiere entrada multimodal (imagen + texto) con salida de texto.
- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo puede emplearse para tareas de clasificación.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): visión probable por el tag multimodal; el resto no disponible.

## Casos de uso

- Clasificación de documentos multimodales: dado el pipeline `text-classification` y el tag imagen-texto, podría emplearse para clasificar documentos que combinen texto e imágenes (por ejemplo, facturas escaneadas o informes con gráficos), aunque requiere validación previa por la falta de benchmarks.
- Etiquetado de contenido en pipelines de moderación: el modelo podría integrarse como clasificador en un sistema de moderación que reciba texto e imágenes y asigne categorías, siempre que se valide su precisión en el dominio concreto.
- Extracción de información de capturas o formularios: al aceptar entrada imagen-texto, podría usarse para tareas de clasificación o extracción sobre documentos visuales, con la cautela de que no hay evaluación publicada.
- Investigación sobre model merging: el sufijo `blend` lo hace útil como objeto de estudio para comparar técnicas de fusión de pesos sobre una base de 31B.
- Prototipado de asistentes multimodales: para experimentación interna donde el acceso gated y la licencia Apache 2.0 permitan iterar sin restricciones comerciales.
- Clasificación de texto a escala media: con 31B parámetros y despliegue en una sola GPU de 80 GB en fp16, podría servir para clasificación por lotes donde la latencia no sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~62,6 GB en fp16 (coincide con el tamaño del repo); ~31-35 GB en cuantización de 8 bits; ~16-18 GB en cuantización de 4 bits (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin offloading; A100 40 GB o RTX 6000 Ada 48 GB con cuantización 8 bits; RTX 4090 24 GB solo con cuantización 4 bits y posible offloading.
- Cabe en consumer GPU: solo en RTX 4090/3090 (24 GB) con cuantización agresiva a 4 bits; en el resto de consumer GPU no es viable sin offloading a CPU.
- Opciones de despliegue: transformers (nativo, según la librería declarada); vLLM, TGI y llama.cpp no están confirmados para esta arquitectura concreta. Al no haber variantes GGUF publicadas, Ollama y llama.cpp requerirían conversión manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-blend-b7 | ~31,3B | no disponible | Apache 2.0 | Gated | Finetune/blend de karpo-decision-31B, multimodal según tags |
| MachinePulseAI/karpo-decision-31B (base) | ~31B (no confirmado en esta ficha) | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Gemma 2 27B (referencia de familia) | 27B | 8K (referencia) | Gemma license | Abierto | Alternativa de tamaño similar de la familia Gemma; comparación orientativa, no verificada para este modelo |

No se dispone de datos de rendimiento del modelo ni de comparaciones verificadas con alternativas de la misma categoría; la comparativa anterior es orientativa y debe tomarse con cautela.

## Limitaciones y advertencias

- Documentación mínima: no hay model card detallada, ni idiomas, ni benchmarks, ni descripción del proceso de entrenamiento.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; esto puede limitar la reproducibilidad y el despliegue automatizado.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin evaluación publicada no puede acotarse.
- Sesgos: desconocidos, al no documentarse la composición del dataset ni el proceso de alineación.
- Licencia: Apache 2.0 declarada, pero conviene verificar que las condiciones del modelo base (MachinePulseAI/karpo-decision-31B) sean compatibles con uso comercial.
- Naturaleza "blend": la fusión de pesos puede degradar capacidades específicas del modelo base; no hay evidencia de validación.
- Sin variantes cuantizadas publicadas: el despliegue eficiente requiere conversión manual a GGUF/AWQ/GPTQ.
- Idiomas: no confirmados; no asumir soporte multilingüe sin pruebas.
- Cero adopción comunitaria (0 descargas, 0 likes en la consulta): sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-blend-b7
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
