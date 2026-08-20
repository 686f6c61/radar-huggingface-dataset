# jacobcarajo/Qwen3.8-27B-Q5_K_M-GGUF

## Resumen

Qwen3.8-27B es un modelo multimodal denso de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. Este repositorio concreto, `jacobcarajo/Qwen3.8-27B-Q5_K_M-GGUF`, es una conversión a formato GGUF del modelo original, cuantizado con el esquema Q5_K_M mediante la herramienta GGUF-my-repo de llama.cpp. La conversión está pensada para facilitar la ejecución local con llama.cpp, ya sea en CLI o mediante servidor, sin necesidad de transformar los pesos manualmente.

El modelo original destaca por su arquitectura híbrida de atención: solo 16 de las 64 capas utilizan atención completa, mientras que las otras 48 emplean atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional y de memoria en contextos largos, manteniendo un rendimiento competitivo en tareas de codificación, flujos agénticos y automatización de oficina. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La versión GGUF pesa aproximadamente 19,5 GB y se puede ejecutar en GPU con al menos 24 GB de VRAM o en CPU con suficiente RAM. Es un formato adecuado para despliegues locales, integración con Ollama o servidores llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas full attention, 48 capas linear attention con estado recurrente) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con 27B parámetros que implementa un diseño de atención híbrida. De las 64 capas del transformer, solo 16 ejecutan atención completa (con un intervalo de `full_attention_interval: 4`), mientras que las restantes 48 usan atención lineal con un estado recurrente constante. Esto reduce la complejidad cuadrática típica de los transformers, mejorando la eficiencia en secuencias largas sin sacrificar demasiada calidad.

No se han publicado detalles específicos sobre el proceso de entrenamiento en la información disponible: no se indica el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está diseñado como multimodal (acepta imágenes y texto), y según la documentación oficial está optimizado para tareas de codificación, agentes y automatización de oficina.

## Capacidades

- Entrada multimodal: procesa imágenes junto con texto (pipeline `image-text-to-text`).
- Generación de texto: produce respuestas coherentes y contextuales en tareas generales.
- Razonamiento y resolución de problemas complejos.
- Codificación asistida: genera, completa y depura código en múltiples lenguajes.
- Agentes y flujos de trabajo automatizados: puede encadenar múltiples pasos de razonamiento y ejecutar acciones con herramientas externas.
- Soporte de tool calling (funciones) y uso de APIs.
- Capacidades multilingües: idiomas no especificados, pero se espera que cubra los principales idiomas del mundo.
- Modo conversacional: diseñado para diálogos multi-turno.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar código, refactorizar funciones y explicar fragmentos en tiempo real, aprovechando su entrenamiento específico para tareas de codificación.
- Automatización de oficina: extracción de información de documentos escaneados (imágenes), generación de resúmenes y redacción de correos, gracias a su capacidad multimodal.
- Agentes autónomos en producción: al soportar tool calling, se puede integrar en pipelines de automatización que llaman a APIs, consultan bases de datos o ejecutan scripts, con razonamiento multi-paso.
- Análisis de imágenes técnicas: lectura de gráficos, diagramas o capturas de pantalla para generar informes o responder preguntas sobre el contenido.
- Chatbots de atención al cliente: con contexto largo (aunque no se especifica la ventana), puede mantener conversaciones fluidas y resolver dudas de usuarios.
- Despliegue local en entornos con privacidad de datos: al ejecutarse en hardware propio, evita enviar información sensible a la nube.
- Investigación académica: experimentación con arquitecturas híbridas de atención en modelos de 27B, comparando eficiencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto. La model card original de Qwen3.8-27B no está incluida en el contexto proporcionado, por lo que no se pueden presentar cifras de MMLU, HumanEval, GSM8K u otros indicadores. No se inventan datos.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q5_K_M ocupa aproximadamente 19,5 GB, por lo que se requiere al menos 24 GB de VRAM para cargar el modelo completo en GPU (por ejemplo, RTX 3090, RTX 4090, A100 40 GB, H100).
- GPUs compatibles: cualquier GPU NVIDIA con al menos 24 GB de memoria y soporte CUDA, o GPUs AMD con ROCm (aunque el soporte de llama.cpp es menos maduro).
- Consumer GPU: sí, una RTX 3090 o RTX 4090 puede ejecutar el modelo con cuantización Q5_K_M. Para cuantizaciones menores (Q4_K_M) se podría usar una RTX 4080 de 16 GB, pero no es el caso de este repositorio.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server, integración con Ollama (si se convierte a formato compatible), y para el modelo original en safetensors se puede usar vLLM o TGI.
- Latencia y throughput: no disponibles. Se estima que en una RTX 4090 el modelo genere entre 20 y 40 tokens por segundo con contexto moderado, pero no hay datos oficiales.

## Comparativa con modelos similares

No se ha podido establecer una comparativa con modelos de la misma categoría y tamaño porque no se dispone de datos de rendimiento en la información proporcionada. Se recomienda consultar la model card original de Qwen/Qwen3.8-27B para obtener benchmarks y comparaciones con otros modelos de la familia Qwen.

## Limitaciones y advertencias

- No se han publicado sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación: como todo LLM, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- La longitud de contexto no está especificada en la información disponible, por lo que se debe probar en cada caso para evitar degradación de rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos para asegurar cumplimiento.
- La cuantización Q5_K_M puede degradar ligeramente la calidad de salida en comparación con el modelo original en FP16, aunque en general la pérdida es mínima.
- Para el uso de la modalidad imagen, se requiere el fichero `mmproj` (proyector multimodal) adicional, que no está incluido en este repositorio; debe descargarse desde el modelo base o desde repositorios alternativos como `bartowski/Qwen3.8-27B-GGUF`.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/jacobcarajo/Qwen3.8-27B-Q5_K_M-GGUF
- Modelo original en safetensors: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Alibaba Cloud en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Cuantizaciones GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones GGUF de bartowski (incluye mmproj): https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Documentación de vLLM sobre el modelo: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
