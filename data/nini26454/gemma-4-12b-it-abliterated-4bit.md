# NINI26454/gemma-4-12B-it-abliterated-4bit

## Resumen

El modelo `NINI26454/gemma-4-12B-it-abliterated-4bit` es una versión modificada del modelo Gemma 4 12B de Google DeepMind, concretamente la variante `gemma-4-12B-it`, a la que se ha aplicado una técnica de "abliteration" para eliminar los mecanismos de rechazo o negativa a responder. El resultado es un modelo multimodal (imagen y texto) que responde sin filtros de seguridad, y que además ha sido cuantizado a 4 bits mediante bitsandbytes para reducir su huella de memoria. El autor es NINI26454, un usuario de Hugging Face, y el modelo se publicó en agosto de 2026.

La relevancia de este modelo radica en que combina las capacidades de razonamiento y comprensión multimodal de Gemma 4 con una eliminación de las restricciones de contenido, lo que lo hace atractivo para desarrolladores que buscan un asistente conversacional sin censura o para investigación sobre alineación y seguridad. La cuantización a 4 bits permite ejecutarlo en hardware de consumo, aunque la licencia no está especificada, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (encoder-free, transformer denso) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la información disponible en el repositorio de abliteration de Gemma 4 (GitHub), `gemma-4-12B-it` utiliza la arquitectura Gemma4Unified sin encoder, es decir, un transformer denso que procesa directamente tanto texto como imágenes. La técnica de abliteration aplicada en este modelo se centra en las capas superiores (L15-47), donde reside la señal de rechazo, eliminando selectivamente esa dirección de activación. El entrenamiento original del modelo base fue realizado por Google DeepMind, pero no se han publicado detalles sobre el dataset, el número de tokens o el proceso de alineación (RLHF/DPO) en la información proporcionada. La cuantización a 4 bits se realizó posteriormente con bitsandbytes, lo que reduce el tamaño del modelo a 7.7 GB en disco.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas textuales (pipeline `image-text-to-text`).
- Conversación multi-turno: diseñado para interacciones dialogadas, con soporte para mantener contexto conversacional.
- Generación de texto sin restricciones: al estar abliterated, no rechaza peticiones que el modelo original podría bloquear por políticas de seguridad.
- Razonamiento y comprensión: hereda las capacidades de razonamiento del modelo base Gemma 4, aunque no se han publicado benchmarks específicos.
- Compatible con la librería transformers y con endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Generación creativa de contenido: el modelo puede producir textos narrativos, poesía o guiones sin las restricciones habituales de los modelos alineados, útil para escritores que exploran temas sensibles.
- Análisis de imágenes en entornos de investigación: al ser multimodal, puede describir o interpretar imágenes sin censura, lo que resulta útil en estudios de visión por computador donde se necesitan respuestas sin filtros.
- Asistentes conversacionales personalizados: desarrolladores pueden integrarlo en chatbots para dominios donde se requiere una respuesta directa sin evasivas, como simulaciones de entrevistas o juegos de rol.
- Pruebas de robustez y seguridad: investigadores en alineación pueden usar este modelo para estudiar cómo se comporta un LLM sin mecanismos de rechazo, comparando sus respuestas con las del modelo original.
- Generación de código con comentarios explícitos: aunque no se confirma soporte de tool calling, el modelo base Gemma 4 es competente en código; la versión abliterated puede generar ejemplos que incluyan prácticas no convencionales.
- Despliegue en hardware limitado: gracias a la cuantización 4-bit, puede ejecutarse en GPUs de consumo (8-10 GB VRAM) para prototipos o demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta versión específica. El modelo base Gemma 4 12B ha sido evaluado por Google DeepMind, pero esos resultados no se han replicado aquí.

## Requisitos de hardware

- VRAM estimada: con 12B parámetros en 4-bit, el modelo ocupa aproximadamente 7.7 GB en disco; en inferencia, se necesitan entre 8 y 10 GB de VRAM dependiendo de la longitud de contexto y el batch.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100 (para mayor throughput). En GPUs con 8 GB (como RTX 3060) podría funcionar con secuencias cortas.
- Compatible con consumer GPU: sí, siempre que tengan al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, puede servirse con vLLM, TGI, o mediante la API de Hugging Face. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona un archivo GGUF en el repositorio.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NINI26454/gemma-4-12B-it-abliterated-4bit | 12B | no disponible | 4-bit | no disponible | Hugging Face |
| OpenYourMind/gemma-4-12B-it-abliterated-uncensored | 12B | no disponible | no especificada | no disponible | Hugging Face |
| huihui_ai/gemma-4-abliterated (colección) | varios (incluye 12B) | no disponible | varias (incluye GGUF) | no disponible | Hugging Face / Ollama |

Los tres modelos son variantes abliterated de Gemma 4 12B, con diferencias en la cuantización y el proceso de abliteration. No se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede ser problemático sin conocer los términos exactos; se recomienda contactar al autor antes de desplegarlo en producción.
- Sin documentación de entrenamiento: no se detallan los datos de entrenamiento ni el proceso de abliteration, lo que dificulta evaluar su fiabilidad.
- Riesgo de alucinaciones: al ser un modelo sin alineación, puede generar información falsa o inventada con mayor confianza.
- Sesgos no documentados: no se han publicado análisis de sesgos; el modelo puede reflejar los sesgos del modelo base sin mitigación.
- Contexto limitado: al no conocerse la longitud de contexto, no se puede garantizar un rendimiento adecuado en tareas de memoria larga.
- Sin soporte de tool calling confirmado: aunque el modelo base puede tener capacidades de función, no se ha verificado en esta versión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NINI26454/gemma-4-12B-it-abliterated-4bit
- Modelo similar (OpenYourMind): https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Colección de abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/gemma-4-abliterated
- Página de Ollama para huihui_ai/gemma-4-abliterated: https://ollama.com/huihui_ai/gemma-4-abliterated
- Proyecto Gemma 4 Abliteration (GitHub): https://github.com/TrevorS/gemma-4-abliteration
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
