# mhszakzajhg/Detektor-Ai-gguf

## Resumen

Detektor-Ai-gguf es un modelo de lenguaje multimodal publicado por el usuario mhszakzajhg en Hugging Face, distribuido en formato GGUF para su uso con llama.cpp y otras herramientas de inferencia local. Según la model card, el modelo fue fine-tuneado y convertido a GGUF utilizando la librería Unsloth. El nombre de los archivos incluidos (`gemma-4-e4b-it.Q5_K_M.gguf` y `gemma-4-e4b-it.BF16-mmproj.gguf`) sugiere que se trata de una variante del modelo Gemma 4, con un proyector multimodal (mmproj) que indica capacidades de visión-lenguaje. El modelo cuenta con aproximadamente 6.847 millones de parámetros, lo que lo sitúa en la gama de modelos medianos, adecuado para despliegue en hardware de consumo.

La relevancia de este modelo radica en su formato GGUF, que permite una ejecución eficiente en CPU y GPU con herramientas como llama.cpp, Ollama o LM Studio, facilitando su uso en entornos locales sin depender de servicios en la nube. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles de arquitectura, licencia, idiomas soportados ni resultados de benchmarks, por lo que esta ficha se basa únicamente en los datos proporcionados en la model card y en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere variante de Gemma 4, sin confirmar) |
| Parametros totales | 6.847.052.330 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (archivo principal), BF16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no presente, solo GGUF) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. El nombre de los archivos (`gemma-4-e4b-it`) apunta a que podría basarse en la familia Gemma 4 de Google, pero no hay confirmación oficial en la model card. La presencia de un archivo `mmproj` en BF16 indica que el modelo incluye un proyector multimodal, típico de modelos de visión-lenguaje que combinan un codificador visual con un modelo de lenguaje. El fine-tuning se realizó con Unsloth, una librería optimizada para entrenamiento eficiente, y posteriormente se convirtió a formato GGUF para su uso con llama.cpp. No se mencionan detalles sobre el dataset de entrenamiento, el número de tokens, ni técnicas como RLHF o DPO.

## Capacidades

- Modelo de visión-lenguaje (según los tags y el archivo mmproj), lo que implica capacidad para procesar imágenes y texto.
- Generación de texto conversacional (tag `conversational`).
- Compatible con llama.cpp y herramientas que soporten GGUF, incluyendo `llama-mtmd-cli` para modelos multimodales.
- Soporte de plantillas Jinja (indicado por el uso de `--jinja` en los ejemplos de uso).
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso u otras capacidades específicas.

## Casos de uso

- Descripción de imágenes: al ser un modelo de visión-lenguaje, puede generar descripciones textuales de imágenes, útil para accesibilidad o catalogación de contenido visual.
- Respuesta a preguntas visuales (VQA): puede responder preguntas sobre el contenido de una imagen, por ejemplo, en entornos educativos o de soporte técnico.
- Asistente conversacional multimodal: integrado en aplicaciones de chat que requieran comprender tanto texto como imágenes, como atención al cliente con capturas de pantalla.
- Prototipado local de aplicaciones de IA: gracias a su formato GGUF, se puede desplegar en portátiles o estaciones de trabajo sin GPU dedicada, ideal para pruebas y desarrollo.
- Investigación en modelos multimodales: sirve como base para experimentos de fine-tuning o evaluación de capacidades de visión-lenguaje en modelos medianos.
- Automatización de tareas de documentación: extraer información de imágenes (facturas, diagramas) y convertirla en texto estructurado, aunque se requiere validar la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se ofrecen comparaciones con modelos similares.

## Requisitos de hardware

- El archivo principal `gemma-4-e4b-it.Q5_K_M.gguf` tiene un tamaño estimado de entre 4 y 5 GB (basado en el peso de 6.8B parámetros y cuantización Q5_K_M), por lo que cabría en GPUs con 6 GB de VRAM o más, como una RTX 2060 o superior.
- El proyector multimodal en BF16 es pequeño (típicamente menos de 1 GB), por lo que no supone un requisito adicional significativo.
- Para inferencia en CPU, llama.cpp puede ejecutar el modelo con suficiente RAM (8-16 GB), aunque la velocidad será menor que en GPU.
- Herramientas de despliegue compatibles: llama.cpp, Ollama (con la nota de que Ollama no soporta archivos mmproj separados, requiere un Modelfile unificado), LM Studio, y cualquier runtime que acepte GGUF.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene datos públicos de rendimiento ni especificaciones detalladas que permitan contrastarlo con alternativas como Gemma 2, LLaVA o Qwen-VL. Se recomienda consultar la documentación oficial de Gemma 4 si se confirma la base del modelo.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto. Se desconoce el comportamiento en producción.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin riesgo legal.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido ampliamente probado por la comunidad.
- La ausencia de benchmarks y de una model card detallada dificulta la evaluación objetiva de su calidad.
- El nombre del archivo sugiere una variante de Gemma 4, pero no hay confirmación oficial; podría tratarse de un modelo no oficial o modificado.
- Para uso multimodal con Ollama, se requiere un proceso adicional de creación de Modelfile, como se indica en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mhszakzajhg/Detektor-Ai-gguf
- Documentación de GGUF en Hugging Face: https://huggingface.co/docs/hub/gguf
- Unsloth (librería de fine-tuning): https://github.com/unslothai/unsloth
- IBM GGUF (conversión y scripts): https://github.com/IBM/gguf
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
