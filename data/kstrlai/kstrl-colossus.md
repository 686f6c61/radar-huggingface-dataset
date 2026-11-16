# KSTRLAI/KSTRL-Colossus

## Resumen

KSTRL-Colossus es un ajuste fino (finetune) del modelo base unsloth/Qwen3.5-2B, desarrollado por KSTRLAI y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, con 2.274.069.824 parámetros totales en precisión FP16 (el repositorio ocupa 4,6 GB). La arquitectura subyacente es la familia Qwen3.5, heredada del modelo base, y el pipeline declarado en el Hub es image-text-to-text.

El modelo se ha entrenado con la librería Unsloth y TRL de Hugging Face, según indica la propia model card, lo que sugiere un proceso de ajuste fino eficiente en memoria sobre el checkpoint base. No se documentan en la información disponible ni el volumen de datos de entrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF o DPO. El idioma declarado es únicamente inglés.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeño (2,3 B de parámetros) que puede ejecutarse en hardware de consumo y que hereda las capacidades multimodales del Qwen3.5-2B original, lo que lo hace interesante para prototipado rápido de aplicaciones visión-lenguaje en local. No obstante, al no contar con descargas ni validación comunitaria en el momento de la consulta, debe tratarse como un experimento de finetune sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), image-text-to-text |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 que procesa entradas conjuntas de imagen y texto. El checkpoint publicado es un ajuste fino en FP16 sobre el modelo base unsloth/Qwen3.5-2B, entrenado con Unsloth y la librería TRL de Hugging Face, según la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado más allá del propio finetune.

Tampoco se documentan innovaciones técnicas propias del finetune (decodificación especulativa, atención lineal, etc.) ni detalles sobre la congelación de capas o el rango de adaptación utilizado. La información disponible es la mínima que acompaña a un checkpoint subido con la plantilla estándar de Unsloth, por lo que cualquier afirmación sobre el proceso de entrenamiento más allá de lo citado sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-2B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite describir imágenes, responder preguntas sobre su contenido y tareas de razonamiento visual básico.
- Generación de texto y razonamiento general, en la medida en que lo soporte el modelo base de 2,3 B de parámetros.
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio: no disponible en la información proporcionada más allá de la entrada de imagen.

## Casos de uso

- Prototipado de asistentes visuales en local: al ser un modelo de 2,3 B en FP16, puede cargarse en una GPU de consumo y usarse para experimentar con descripción de imágenes y preguntas visuales sin depender de APIs externas.
- Generación de descripciones automáticas de imágenes (alt-text) en inglés para catálogos o repositorios, aprovechando la modalidad image-text-to-text del modelo base.
- Extracción de información de capturas de pantalla o documentos escaneados en inglés, como paso previo a un pipeline de OCR estructurado.
- Chat conversacional ligero en inglés para demos y entornos de prueba, dado el tamaño reducido del checkpoint.
- Evaluación comparativa de finetunes: sirve como referencia para estudiar cómo un ajuste fino sobre Qwen3.5-2B altera el comportamiento del modelo base en tareas concretas.
- Investigación sobre eficiencia de entrenamiento con Unsloth y TRL, ya que la model card documenta explícitamente el uso de estas herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4,5-5 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 2,3-3 GB de VRAM para los pesos.
- Cuantización a 4 bits (si se generan pesos GGUF/AWQ, no publicados): alrededor de 1,5-2 GB para los pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference (tag declarado), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KSTRL-Colossus | 2,27 B | no disponible | image-text-to-text | apache-2.0 | Hugging Face, 0 descargas |
| unsloth/Qwen3.5-2B (base) | ~2 B | no disponible | image-text-to-text | no disponible en la informacion | Hugging Face |
| Qwen2.5-VL-3B (referencia de categoria) | ~3 B | no disponible en la informacion | image-text-to-text | no disponible en la informacion | Hugging Face |
| PaliGemma 2 (variante ~3B) | ~3 B | no disponible en la informacion | image-text-to-text | no disponible en la informacion | Hugging Face |

La comparativa con alternativas de la misma categoría queda limitada porque no se dispone de datos de benchmarks ni de contexto para ninguno de los modelos listados en la información proporcionada. La principal diferencia observable es que KSTRL-Colossus es un finetune derivado de Qwen3.5-2B, por lo que su comportamiento debería ser cercano al del modelo base salvo en los dominios cubiertos por el ajuste fino, que no se documentan.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, es previsible que arrastre los sesgos de los datos de preentrenamiento de Qwen3.5, pero no hay evidencia publicada al respecto.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; con 2,3 B de parámetros la fiabilidad factual es limitada y no se han publicado evaluaciones.
- Limitaciones de idioma: el modelo declara únicamente inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base unsloth/Qwen3.5-2B, que no se detalla en la información disponible.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de evaluaciones independientes.
- Falta de documentación del dataset de finetune: no se puede evaluar qué dominios se han reforzado ni si el ajuste introduce regresiones respecto al modelo base.
- Fecha de creación futura (2026-11-15) en los metadatos del Hub, lo que puede indicar un error de publicación o un artefacto de la plataforma; conviene contrastar antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KSTRLAI/KSTRL-Colossus
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
