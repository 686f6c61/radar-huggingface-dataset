# herberttung/vision-27b-q4-gguf

## Resumen

El modelo `herberttung/vision-27b-q4-gguf` es una cuantización GGUF en formato Q4_K_M de un modelo de visión-lenguaje de 27 mil millones de parámetros, diseñado para ejecutarse localmente con llama.cpp, LM Studio u Ollama. El autor, herberttung, publica dos archivos: el modelo principal (15,3 GB) y un proyector de visión en f16 (0,86 GB) que permite procesar imágenes como entrada adicional al texto. Según los resultados de búsqueda, el modelo base parece ser Qwen3.8-27B, un transformer denso con soporte multimodal y contexto de hasta 262 144 tokens, aunque esta cuantización concreta no especifica oficialmente su origen.

La relevancia de este modelo radica en que acerca un sistema multimodal de 27B a hardware de consumo mediante cuantización de 4 bits, manteniendo una ventana de contexto muy amplia. Está pensado para usarse como servidor local compatible con la API de OpenAI, y se menciona explícitamente su integración con OpenCode, un agente de codificación que aprovecha el tool calling y el razonamiento multi-paso. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B según fuentes externas) |
| Parametros totales | 27B (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (máximo soportado; recomendado 65 536 en la config de ejemplo) |
| Tipos de cuantizacion | Q4_K_M (archivo principal); proyector de visión en f16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) + mmproj (proyector de visión en f16) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de un modelo de visión-lenguaje de 27B parámetros. Según los resultados de búsqueda, el modelo base corresponde a Qwen3.8-27B, un transformer denso con arquitectura multimodal que combina un codificador de visión con un decodificador de lenguaje. Este modelo base fue entrenado con datos que incluyen imágenes y texto, y soporta un contexto de hasta 262 144 tokens gracias a técnicas como la predicción multi-token (MTP). La cuantización Q4_K_M reduce el tamaño de los pesos a 4 bits, lo que permite ejecutar el modelo en GPUs de consumo, aunque con una ligera pérdida de precisión respecto al modelo en precisión completa. No se dispone de detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de cuantización específico de este archivo.

## Capacidades

- Generación de texto y razonamiento: el modelo puede producir respuestas coherentes y razonar sobre problemas complejos, gracias a su tamaño de 27B.
- Procesamiento de imágenes: acepta entrada de imágenes junto con texto, y genera texto descriptivo o respuestas basadas en el contenido visual.
- Soporte de tool calling / function calling: la integración con OpenCode sugiere que el modelo puede invocar herramientas externas, aunque no se documenta explícitamente en la model card.
- Razonamiento multi-paso y uso como agente: diseñado para trabajar con agentes de codificación como OpenCode, que requieren planificación y ejecución de múltiples pasos.
- Capacidades multilingües: no confirmadas oficialmente para esta cuantización, pero el modelo base Qwen3.8 suele ser multilingüe.
- Ventana de contexto larga: soporta hasta 262 144 tokens, lo que permite procesar documentos extensos o conversaciones muy largas.

## Casos de uso

- Asistente de codificación local: el modelo se integra con OpenCode para actuar como agente de programación, generando y editando código en el entorno del desarrollador. Su tool calling y su contexto largo permiten manejar proyectos completos.
- Atención al cliente automatizada: con 262 144 tokens de contexto, puede gestionar conversaciones multi-turno con historial extenso y consultar bases de conocimiento internas, respondiendo de forma coherente y personalizada.
- Análisis de documentos con imágenes: al aceptar entrada de imágenes, puede extraer información de capturas de pantalla, diagramas o documentos escaneados, útil para automatizar tareas de revisión.
- Generación de código en producción: puede integrarse en pipelines de CI/CD mediante la API compatible con OpenAI, generando tests, documentación o parches de código de forma determinista con temperatura baja.
- Razonamiento sobre datos multimodales: combina texto e imágenes para tareas como descripción de gráficos, análisis de informes visuales o asistencia en investigación.
- Despliegue de un asistente personal privado: al ejecutarse localmente, permite construir un asistente con acceso a datos sensibles sin enviar información a la nube, gracias a la licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. Los resultados de búsqueda incluyen evaluaciones de otras cuantizaciones GGUF de Qwen3.8-27B (por ejemplo, en kaitchup.substack.com), pero no se pueden atribuir a este archivo concreto. Se recomienda consultar dichas fuentes para una referencia aproximada del rendimiento del modelo base, teniendo en cuenta que la cuantización Q4_K_M puede degradar ligeramente la precisión.

## Requisitos de hardware

- VRAM estimada: el archivo principal pesa 15,3 GB y el proyector 0,86 GB, por lo que se necesitan al menos 16 GB de VRAM para cargar ambos en GPU. Con overhead de inferencia, se recomiendan 20-24 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, o GPUs con 24 GB o más. En Macs con Apple Silicon, un modelo de 24 GB unificados puede ejecutarlo.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de al menos 16-24 GB de VRAM. En GPUs con menos memoria, se puede reducir la carga en GPU usando `-ngl` en llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, Ollama, y cualquier servidor compatible con la API de OpenAI. También se puede usar vLLM si soporta GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| herberttung/vision-27b-q4-gguf | 27B | 262 144 | Apache-2.0 | GGUF Q4_K_M | Cuantización multimodal, incluye proyector de visión |
| unsloth/Qwen3.8-27B-GGUF | 27B | 262 144 | Apache-2.0 | GGUF (varias cuantizaciones) | Cuantización del mismo modelo base, sin proyector de visión incluido |
| SC117/Qwen3.8-27B-Uncensored-FIT-GGUF | 27B | 262 144 | Apache-2.0 | GGUF (varias cuantizaciones) | Variante sin censura, incluye proyector de visión |

La comparativa se basa en los resultados de búsqueda, que indican que el modelo base es Qwen3.8-27B. No se dispone de datos de rendimiento comparativos entre estas cuantizaciones.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos para esta cuantización, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Limitaciones de contexto: aunque soporta 262 144 tokens, el rendimiento puede degradarse en contextos extremadamente largos, y el uso de memoria aumenta considerablemente.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no usar marcas registradas.
- Caveat de cuantización: la precisión Q4_K_M puede reducir la calidad de las respuestas en comparación con el modelo en f16 o f32, especialmente en tareas que requieren alta exactitud numérica.
- Dependencia de archivos: el proyector de visión (`mmproj-f16.gguf`) es imprescindible para la entrada de imágenes; sin él, el modelo solo funcionará con texto.

## Enlaces

- HuggingFace: https://huggingface.co/herberttung/vision-27b-q4-gguf
- Modelo base (referencia): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Guía de despliegue de Qwen3.8-27B: https://acecloud.ai/blog/qwen3-8-27b-guide/
- Benchmark de cuantizaciones GGUF de Qwen3.8-27B: https://kaitchup.substack.com/p/qwen38-27b-gguf-benchmark-q4-to-q1
- Guía para ejecutar Qwen3.8-27B localmente: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Variante sin censura con proyector de visión: https://huggingface.co/SC117/Qwen3.8-27B-Uncensored-FIT-GGUF
