# Hahmdong/SPUPER-qwen3.5-9b-acaciawl-formation-seed44

## Resumen

SPUPER-qwen3.5-9b-acaciawl-formation-seed44 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Hahmdong del Korea Advanced Institute of Science and Technology (KAIST). Se trata de un modelo multimodal de tipo image-text-to-text con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL. El modelo hereda la arquitectura Qwen3.5 y está orientado a tareas conversacionales de generación de texto e interpretación de imágenes.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 18,8 GB, lo que corresponde a pesos en precisión completa (probablemente bf16). Forma parte de una familia de variantes del mismo autor (por ejemplo, la variante acaciawl-add) que comparten la misma base Qwen3.5-9B y el mismo procedimiento de entrenamiento SFT, diferenciándose en la semilla y la configuración del ajuste. La model card es extremadamente escueta y no documenta el dataset de entrenamiento, la composición de datos ni los hiperparámetros utilizados.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: cuenta con 0 descargas y 0 likes en Hugging Face, y no se han publicado resultados de benchmarks ni detalles técnicos sustantivos. Su interés principal radica en ser un ejemplo de fine-tune SFT sobre la arquitectura Qwen3.5-9B con capacidades multimodales, útil para quienes quieran evaluar el impacto del ajuste frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda de Qwen3.5-9B); detalles no disponibles |
| Parámetros totales | 9.409.813.744 (≈9,4 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según información de la variante acaciawl-add; no confirmado para esta variante) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, un transformer multimodal de aproximadamente 9,4 mil millones de parámetros. La arquitectura concreta (número de capas, dimensiones, mecanismo de atención, componente visual) no se detalla en la información disponible; se hereda íntegramente del modelo base Qwen3.5-9B. El pipeline declarado es image-text-to-text, lo que confirma que el modelo conserva la capacidad de procesar imágenes junto con texto.

El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) con TRL 0.27.1, Transformers 5.9.0, PyTorch 2.11.0+cu129, Datasets 4.0.0 y Tokenizers 0.22.2. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El nombre del modelo incluye "seed44", lo que sugiere que se fijó la semilla 44 para el entrenamiento, y "formation" y "acaciawl" parecen ser etiquetas internas del autor relativas a la configuración o el conjunto de datos. La model card enlaza a un run de Weights & Biases (proyecto SPUPER-SFT, run 23yekfix) que podría contener detalles adicionales, pero no se ha podido verificar su contenido en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text), lo que permite tareas de descripción, respuesta a preguntas sobre imágenes y razonamiento visual.
- Razonamiento y respuesta a preguntas generales, según el ejemplo de la model card (pregunta hipotética sobre viaje en el tiempo).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener diálogos multi-turno en los que el usuario adjunta imágenes y formula preguntas sobre ellas, gracias a su pipeline image-text-to-text y a una ventana de contexto de hasta 32.768 tokens (según la variante hermana).
- Descripción y etiquetado automático de imágenes: útil para generar metadatos o alt-text en pipelines de gestión de contenidos, aprovechando la capacidad visual heredada de Qwen3.5-9B.
- Respuesta a preguntas sobre documentos escaneados o capturas: el modelo puede recibir una imagen de un documento y responder preguntas sobre su contenido, integrándose en flujos de atención al cliente o soporte interno.
- Prototipado de investigación en SFT multimodal: al ser un fine-tune reproducible con semilla fija y framework documentado (TRL 0.27.1), sirve como punto de partida para experimentos académicos sobre ajuste supervisado de modelos multimodales.
- Evaluación comparativa de fine-tunes: permite medir el efecto del SFT sobre el modelo base Qwen3.5-9B en tareas conversacionales y visuales, comparando con las variantes acaciawl-add y otras del mismo autor.
- Generación de texto asistida en entornos de investigación: para tareas de generación y razonamiento en las que se quiera experimentar con un modelo de 9,4 B parámetros desplegable en una sola GPU de 24 GB en cuantización de 8 bits o inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 9,4 B parámetros requieren aproximadamente 18,8 GB solo para los pesos, más memoria para el contexto y las activaciones (estimación práctica: 22-26 GB para contexto moderado). En cuantización de 8 bits, unos 10-12 GB; en 4 bits, unos 6-8 GB.
- GPU recomendadas: A100 40 GB o H100 para inferencia en precisión completa con contextos largos; RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto limitado o en 8 bits con contexto amplio.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) usando cuantización de 8 o 4 bits; en 16 GB solo con cuantización de 4 bits agresiva.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving de alto rendimiento (siempre que la arquitectura Qwen3.5-9B esté soportada), llama.cpp/Ollama solo si se generan pesos GGUF (no publicados). El tag endpoints_compatible sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SPUPER-qwen3.5-9b-acaciawl-formation-seed44 | 9,4 B | 32.768 (según variante hermana) | no disponible | Hugging Face, 0 descargas | Fine-tune SFT multimodal de Qwen3.5-9B |
| Qwen/Qwen3.5-9B (modelo base) | ≈9,4 B | no disponible en la información | no disponible | Hugging Face (oficial) | Base sin ajuste; referencia para medir el efecto del SFT |
| Hahmdong/SPUPER-qwen3.5-9b-acaciawl-add | ≈9,4 B | 32.768 | no disponible | Hugging Face, ~1.400 descargas históricas | Variante hermana del mismo autor con el mismo procedimiento SFT |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar de Qwen3.5-9B, arrastra los sesgos del modelo base y del dataset de SFT, que no se especifica.
- Riesgo de alucinación: presente como en cualquier modelo generativo; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: la longitud de contexto de 32.768 tokens solo está confirmada para la variante acaciawl-add, no para esta; los idiomas soportados no se documentan.
- Restricciones de licencia: la licencia no está especificada ("licence: license" en la model card), por lo que no se puede garantizar el uso comercial. Es imprescindible contactar con el autor o consultar el modelo base Qwen3.5-9B antes de cualquier despliegue en producción.
- Caveats para producción: modelo con 0 descargas y sin validación externa; la model card es mínima y no documenta dataset, hiperparámetros ni evaluación. El snippet de la model card contiene un error (`model="None"`), lo que indica falta de revisión. No se recomienda su uso en producción sin una evaluación propia exhaustiva.
- El nombre del modelo incluye etiquetas internas ("acaciawl", "formation", "seed44") sin explicación, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-acaciawl-formation-seed44
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/23yekfix
- Repositorio TRL: https://github.com/huggingface/trl
- Variante hermana (featherless.ai): https://featherless.ai/models/Hahmdong/SPUPER-qwen3.5-9b-acaciawl-add
- Estadísticas de la variante hermana (openmodelstats): https://openmodelstats.com/models/hahmdong/spuper-qwen3.5-9b-acaciawl-add
