# hirundo-io/Qwen3.5-9B-Westernized

## Resumen

Qwen3.5-9B-Westernized es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-9B, publicado por el usuario hirundo-io en Hugging Face bajo licencia Apache 2.0. Con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) y un tamaño de repositorio de 19,3 GB, se distribuye en formato safetensors para la librería transformers. El modelo está etiquetado como `image-text-to-text`, lo que indica que conserva la capacidad multimodal del modelo base, y está orientado a uso conversacional.

El sufijo "Westernized" sugiere un proceso de ajuste orientado a alinear el comportamiento del modelo con valores, estilos de respuesta o convenciones culturales occidentales, partiendo del modelo base Qwen3.5-9B. No se dispone de información publicada sobre el dataset de ajuste, el número de tokens utilizados ni la metodología exacta empleada por el autor. El modelo es relevante como ejemplo de adaptación cultural de un modelo abierto de tamaño medio con capacidades multimodales, aunque su adopción es todavía muy reducida (12 descargas y 0 likes en el momento de la consulta).

El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. Esta ficha se ha elaborado exclusivamente con los metadatos disponibles en la ficha del modelo; los datos no publicados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; se infiere familia transformer multimodal del modelo base Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (multimodal imagen-texto) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 19,3 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La etiqueta `qwen3_5` y el pipeline `image-text-to-text` apuntan a un transformer multimodal de la familia Qwen3.5, con capacidad de procesar entradas de imagen y texto y generar respuestas conversacionales. El número de parámetros (9.653.104.368) coincide con un modelo denso de aproximadamente 9,65 mil millones de parámetros; no hay indicios de que se trate de una arquitectura de mezcla de expertos (MoE).

Respecto al entrenamiento, no se ha publicado información sobre el número de tokens de ajuste, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación aplicadas. El nombre "Westernized" indica un ajuste fino sobre el modelo base Qwen3.5-9B, presumiblemente destinado a modificar el estilo, los valores o las preferencias de respuesta hacia convenciones occidentales, pero no se dispone de documentación técnica que lo confirme ni de detalles sobre el procedimiento. Tampoco se documentan innovaciones técnicas específicas de este finetune.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas sobre contenido visual y conversación multimodal.
- Razonamiento y respuesta a instrucciones en formato chat, según la etiqueta `conversational`.
- Capacidades multilingües: no disponibles de forma explícita; los idiomas no están listados en la ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede recibir una imagen junto con una pregunta en lenguaje natural y responder en el mismo hilo conversacional, lo que lo hace adecuado para interfaces de chat que combinan capturas, fotografías o diagramas con texto.
- Moderación y adaptación de contenido a audiencias occidentales: dado el ajuste "Westernized", puede emplearse para generar respuestas alineadas con convenciones culturales y de estilo occidentales en productos dirigidos a esos mercados, siempre que se valide el comportamiento real del finetune.
- Descripción y etiquetado de imágenes en pipelines de datos: al ser un modelo imagen-texto, puede generar descripciones textuales de imágenes para enriquecer catálogos, bases de datos documentales o datasets de entrenamiento.
- Prototipado de asistentes sobre documentos visuales: con 9,65 mil millones de parámetros, puede desplegarse en una sola GPU de gama alta para experimentar con flujos de pregunta-respuesta sobre capturas de pantalla, facturas o gráficos.
- Evaluación comparativa de sesgos culturales: el modelo sirve como caso de estudio para investigar cómo un finetune sobre un modelo base chino modifica el tono, los valores y las respuestas ante temas sensibles en contextos occidentales.
- Base para nuevos ajustes finos: al estar bajo licencia Apache 2.0 y en formato safetensors compatible con transformers, puede utilizarse como punto de partida para tareas específicas de dominio que requieran entrada multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 19,3 GB solo para los pesos, más memoria para el procesador visual, el KV cache y activaciones; en la práctica se recomienda un mínimo de 24 GB de VRAM.
- Cuantización a 8 bits: alrededor de 10-12 GB de VRAM para los pesos, más overhead; viable en GPUs de 16-24 GB.
- Cuantización a 4 bits: alrededor de 5-7 GB para los pesos, más overhead; podría caber en GPUs consumer de 8-12 GB, aunque no se han publicado variantes GGUF/AWQ/GPTQ oficiales.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 4080/4070 Ti Super o superiores para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 ajustado y en GPUs de 12-16 GB con cuantización, siempre que se implemente correctamente el pipeline multimodal.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este finetune y dependerían del soporte de la arquitectura Qwen3.5 multimodal en cada framework.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hirundo-io/Qwen3.5-9B-Westernized | ~9,65 B | no disponible | imagen-texto | Apache 2.0 | gated en Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9,65 B | no disponible | imagen-texto | no disponible en esta ficha | público en Hugging Face |
| Alternativas de ~9-10 B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del finetune ni de comparativas publicadas con modelos equivalentes; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del finetune; el proceso "Westernized" puede introducir sesgos culturales deliberados que deben evaluarse antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos generativos de ~9,65 B; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas que maneje el modelo base.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificarla empíricamente.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la automatización de descargas y despliegues.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que conviene revisar antes de redistribuir o explotar comercialmente el finetune.
- Con solo 12 descargas y 0 likes, no existe validación comunitaria ni reportes de calidad; se recomienda evaluar exhaustivamente antes de cualquier uso en producción.
- No se han publicado variantes cuantizadas oficiales, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirundo-io/Qwen3.5-9B-Westernized
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
