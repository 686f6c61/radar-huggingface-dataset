# ls81n3098/Qwen3.8-27B-OBLITERATED-safetensors

## Resumen

Este modelo es un espejo ligero (thin mirror) del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED, publicado por el usuario ls81n3098. El modelo fuente es un fine-tune del Qwen3.8-27B de Qwen que ha sido sometido a un proceso de abliteración para eliminar los rechazos de seguridad del modelo original. Según la información disponible, el modelo responde a solicitudes que el modelo base rechazaría, incluyendo conocimiento restringido, generación de código y escenarios de red-teaming.

Este repositorio concreto contiene únicamente los archivos de pesos en formato safetensors referenciados por el índice del modelo fuente, además del tokenizer, processor, configuración y licencia necesarios para cargarlo con Transformers o vLLM. Los archivos GGUF y los shards no referenciados se excluyen deliberadamente para optimizar el almacenamiento en caché en RunPod Serverless. El modelo tiene 27.781.427.952 parámetros y un tamaño de repositorio de 55,6 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un espejo del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED. El proceso de abliteración, descrito en la información de GitHub, elimina tanto los rechazos duros como las desviaciones suaves del modelo original, lo que permite que el modelo responda a solicitudes que el Qwen3.8-27B original rechazaría o respondería con sermones de seguridad. No se han publicado datos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni los métodos de alineación aplicados.

Este repositorio no incluye ningún entrenamiento adicional; es una copia de los archivos del modelo fuente. La generación del espejo se realizó mediante un script (publish-hf-safetensors.ps1) que copia solo los archivos referenciados en el model.safetensors.index.json, junto con los archivos de tokenizer, processor, configuración y licencia.

## Capacidades

- Procesamiento multimodal (image-text-to-text): el modelo acepta entradas de imagen y texto, según el pipeline declarado en HuggingFace.
- Conversación multi-turno: el tag "conversational" indica soporte para diálogo.
- Cumplimiento de solicitudes restringidas: el proceso OBLITERATED elimina los rechazos de seguridad, lo que permite generar respuestas a solicitudes de conocimiento restringido, código no permitido y escenarios de red-teaming.
- Generación de código: mencionado en las pruebas del modelo OBLITERATED (1000+ prompts incluyendo generación de código).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento matemático u otras capacidades específicas.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo está diseñado para responder a solicitudes de seguridad que los modelos alineados rechazan, lo que permite probar vulnerabilidades y generar escenarios adversos.
- Generación de código sin restricciones: útil para experimentación con código que los modelos estándar rechazarían, como exploits o análisis de malware.
- Despliegue en RunPod Serverless: el espejo está optimizado para almacenamiento en caché determinista, lo que facilita su uso en entornos serverless.
- Análisis multimodal: gracias al pipeline image-text-to-text, puede utilizarse en tareas que requieren comprender imágenes y texto.
- Evaluación de alineación: permite comparar el comportamiento del modelo abliterado con el modelo original para estudiar los efectos de las técnicas de alineación.
- Experimentación con vLLM: el modelo está etiquetado para vLLM y puede cargarse con Transformers, lo que permite probar configuraciones de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio tiene un tamaño de 55,6 GB en formato safetensors, lo que corresponde a aproximadamente 55,6 GB en FP16 (2 bytes por parámetro).
- Para inferencia en FP16 se requiere una GPU con al menos 56 GB de VRAM, como una A100 80GB o H100 80GB.
- Con cuantización a 8 bits, el modelo necesitaría aproximadamente 28 GB de VRAM; con cuantización a 4 bits, unos 14 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o similar.
- El modelo es compatible con vLLM y Transformers según las etiquetas del repositorio.
- RunPod Serverless se menciona como plataforma de despliegue objetivo.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27.781.427.952 | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-OBLITERATED | 27.781.427.952 | no disponible | Apache 2.0 | HuggingFace (OBLITERATUS) |
| ls81n3098/Qwen3.8-27B-OBLITERATED-safetensors | 27.781.427.952 | no disponible | Apache 2.0 | HuggingFace (espejo) |

La comparativa muestra que los tres modelos tienen el mismo número de parámetros y licencia. La diferencia principal es el proceso OBLITERATED (eliminación de rechazos) y el formato del espejo (solo safetensors, sin GGUF).

## Limitaciones y advertencias

- El modelo abliterado elimina las restricciones de seguridad, lo que puede generar contenido dañino, ilegal o éticamente cuestionable. No debe utilizarse en aplicaciones de producción sin supervisión.
- Riesgo de alucinación: al igual que otros modelos generativos, puede producir información falsa o inventada.
- No se dispone de información sobre la longitud de contexto, los idiomas soportados ni el comportamiento en tareas específicas.
- El proceso de abliteración puede degradar el rendimiento en tareas de seguridad o alineación, ya que el modelo pierde la capacidad de identificar y rechazar solicitudes dañinas.
- La licencia Apache 2.0 permite uso comercial, pero el uso del modelo debe cumplir con las políticas de la plataforma donde se despliegue.
- El espejo no incluye archivos GGUF, por lo que no puede utilizarse directamente con llama.cpp sin conversión adicional.

## Enlaces

- HuggingFace del espejo: https://huggingface.co/ls81n3098/Qwen3.8-27B-OBLITERATED-safetensors
- HuggingFace del modelo base OBLITERATUS: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- HuggingFace del modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub del modelo OBLITERATED (bigguy8585/ai): https://github.com/bigguy8585/ai/tree/main/Qwen3.8-27B-OBLITERATED
