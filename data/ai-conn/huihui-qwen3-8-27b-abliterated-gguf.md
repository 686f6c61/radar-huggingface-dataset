# AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Este repositorio es una bifurcación (fork) del build abliterado en formato GGUF de un modelo de 27.320.697.856 parámetros (unos 27,32 B) cuyo modelo base declarado es Qwen/Qwen3.8-27B. El autor del repositorio es AI-conn, que actúa únicamente como redistribuidor: según su propia model card, el trabajo de abliteración corresponde a huihui-ai y el modelo original a Qwen. El propósito declarado del fork es mantener una copia inmutable dentro de una flota de despliegue y adjuntar notas de ajuste de hardware medidas en una GPU concreta.

El valor diferencial que documenta la ficha es de tipo operativo más que algorítmico: se recomienda el fichero `Huihui-Qwen3.8-27B-abliterated-UD-DW-Q4_K_M.gguf` (15,41 GiB) para tarjetas de 20 GB, y se aportan cálculos de encaje de memoria (pesos + caché KV en fp16 a 0,125 MiB por token + unos 0,7 GiB de reserva para el runtime) que sitúan el modelo como candidato a residir por completo en VRAM con contexto de 16k en una RX 7900 XT de 19,98 GiB.

El modelo es relevante para quien busque un asistente conversacional local sin filtros de rechazo y con encaje real en GPU de consumo, pero conviene tener presente que la información publicada no incluye arquitectura del modelo base, idiomas soportados, composición del dataset de entrenamiento ni resultados de evaluación. El repositorio se creó el 11 de octubre de 2026 y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura del modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no disponible (no se declara una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible para el modelo base; la model card documenta pruebas a 8k y 16k tokens en la GPU de referencia |
| Tipos de cuantizacion | GGUF; se documenta explícitamente la variante UD-DW-Q4_K_M. El repositorio aloja múltiples variantes (tamaño total del repo: 799,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (según el repositorio de origen citado en la model card) |
| Formato de pesos | GGUF en este repositorio; el recuento de parámetros indicado procede de safetensors del modelo base |

Datos adicionales verificables: pipeline no disponible, tags `gguf`, `uncensored`, `abliterated`, `ollama`, `endpoints_compatible`, `region:us`, `conversational`. Fecha de creación: 2026-10-11. Última actualización: 2026-10-11.

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del modelo base Qwen/Qwen3.8-27B: no se indica si es un transformer denso, una mezcla de expertos, un modelo de espacio de estados o una arquitectura híbrida, ni se detallan número de capas, dimensión oculta, tipo de atención, número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF, DPO u otro alineamiento. Todo ello debe considerarse "no disponible" y no debe inferirse a partir del nombre del modelo.

Lo único documentado es la intervención sobre el modelo ya entrenado: un proceso de **abliteración** (eliminación de la dirección de rechazo) realizado con la herramienta `remove-refusals-with-transformers` de Sumandora, según se cita en la model card. La misma ficha advierte de que varias subseries (Swift, Saluki y las variantes *Ternary*) abliteran únicamente las capas 22 a 52, mientras que las series principales (UD-DW y la serie simple) son la línea de referencia del autor original. Este repositorio no añade entrenamiento adicional: es una recuantización y redistribución de pesos ya modificados.

## Capacidades

- Generación de texto conversacional multi-turno, según los tags `conversational` y `endpoints_compatible`.
- Ejecución local en formato GGUF mediante Ollama, llama.cpp y otros runners compatibles con GGUF.
- Comportamiento sin filtros de rechazo: la abliteración elimina la dirección de rechazo aprendida, de modo que el modelo no declina peticiones que el modelo base sí rechazaría.
- Compatibilidad declarada con endpoints compatibles con la API de OpenAI (`endpoints_compatible`), lo que facilita sustituir un backend remoto por una instancia local.
- Capacidades específicas de razonamiento, código, matemáticas, visión, audio, tool calling o modo de pensamiento: no disponible (no se declaran en la información proporcionada).
- Capacidades multilingües: no disponible (el campo de idiomas aparece como no disponible).
- Contexto largo: sin cifra oficial, pero la model card demuestra funcionamiento con 8k y 16k tokens de contexto en una GPU de 19,98 GiB.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con el fichero UD-DW-Q4_K_M (15,41 GiB) y contexto de 8k, el conjunto cabe en una tarjeta de 20 GB con unos 3 GiB de margen (17,1 GiB totales frente a 19,98 GiB), lo que permite mantener un asistente permanente sin depender de APIs externas.
- Procesamiento de documentos de longitud media en local: con 16k tokens de contexto y caché KV en fp16 (2,0 GiB), el modelo puede resumir o extraer información de informes, contratos o documentación técnica sin enviar el contenido a un tercero.
- Escritura creativa sin censura temática: la abliteración permite generar narrativa con violencia, contenido adulto o temas sensibles que el modelo base rechazaría; útil en ficción y guiones, con revisión humana posterior.
- Investigación sobre comportamiento de rechazo y seguridad de modelos: permite comparar las respuestas del modelo base frente al build abliterado para estudiar cómo se distribuye la dirección de rechazo y qué capacidades se degradan al eliminarla.
- Red teaming y evaluación de salvaguardas: se puede usar como modelo adversario controlado en entornos aislados para probar clasificadores de contenido, filtros de salida y sistemas de moderación.
- Generación de datos sintéticos para ajuste: al no rechazar peticiones, resulta práctico para producir conjuntos de datos de instrucciones en dominios donde el modelo base se negaría a colaborar; requiere revisión y filtrado posteriores.
- Sustitución de backend en aplicaciones ya integradas contra la API de OpenAI: la etiqueta `endpoints_compatible` y el soporte de Ollama permiten apuntar una aplicación existente a una instancia local con cambios mínimos de configuración.
- Despliegue en flotas con copia inmutable: el fork existe precisamente para que la copia de la flota no pueda ser alterada ni retirada desde el repositorio de origen, lo que aporta reproducibilidad de versiones en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación, y la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo (únicamente páginas genéricas de OpenAI, Google Gemini, ChatGPT, DeepAI y Perplexity, sin conexión con el repositorio).

## Requisitos de hardware

- VRAM para la variante documentada: Q4_K_M ocupa 15,41 GiB de pesos. Con caché KV en fp16 (0,125 MiB por token) y unos 0,7 GiB de reserva para el runtime, 8k de contexto requieren aproximadamente 17,1 GiB y 16k requieren aproximadamente 18,1 GiB.
- GPU de referencia medida por el autor: AMD Radeon RX 7900 XT con 19,98 GiB de VRAM y 32 GB de RAM de sistema, en la que el modelo queda completamente residente en VRAM tanto a 8k como a 16k de contexto.
- Recomendación declarada: tarjetas de 20 GB, usando el fichero `Huihui-Qwen3.8-27B-abliterated-UD-DW-Q4_K_M.gguf`.
- Advertencia del propio autor: cualquier build de clase 32B en Q4, abliterado o no, deja menos de 1 GiB para caché KV y buffers de cómputo en una tarjeta de 20 GB, por lo que acaba descargando parte del cómputo a CPU.
- Tamaños de pesos para otras cuantizaciones: no documentados en la información disponible. Como referencia aritmética a partir del recuento de parámetros, una cuantización de 8 bits ocuparía aproximadamente 29 GiB y los pesos en fp16 unos 50,9 GiB, pero son estimaciones de cálculo, no cifras publicadas por el autor.
- GPUs recomendadas por gama: no disponible (la model card solo documenta la RX 7900 XT). Para 8k/16k de contexto conviene una GPU con al menos 20 GB de VRAM; con menos VRAM habrá que reducir contexto, bajar la cuantización o hacer offload parcial a CPU.
- Opciones de despliegue: Ollama mediante `ollama pull hf.co/AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF:Q4_K_M`; al ser GGUF también es desplegable con llama.cpp y otros runners compatibles. Otros motores (vLLM, TGI) no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible (la model card no publica tokens por segundo ni latencias medidas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF (este repositorio) | 27,32 B | no disponible (probado a 8k y 16k) | GGUF, múltiples cuantizaciones | Apache-2.0 | 0 descargas, 0 likes; repo de 799,7 GB |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF (origen del build) | idéntico, según la model card | no disponible | GGUF | Apache-2.0 según la model card | no disponible |
| Qwen/Qwen3.8-27B (modelo base) | 27,32 B | no disponible | safetensors | no disponible | no disponible |
| Builds de clase 32B en Q4 (referencia genérica citada por el autor) | ~32 B | no disponible | GGUF | no disponible | no disponible; según el autor, dejan menos de 1 GiB libres para KV en una GPU de 20 GB |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparación se limita a tamaño, formato, licencia y encaje en hardware.

## Limitaciones y advertencias

- Es un fork, no un modelo original: todo el mérito del build abliterado corresponde a huihui-ai y el modelo base a Qwen. La ficha del fork no aporta información técnica nueva sobre arquitectura o entrenamiento.
- La abliteración elimina la dirección de rechazo, lo que reduce deliberadamente las salvaguardas del modelo base. Es esperable que el modelo responda a peticiones que el original rechazaría, incluidas instrucciones dañinas o ilegales.
- La eliminación de la dirección de rechazo suele conllevar degradación de capacidades: no hay ninguna evaluación publicada que cuantifique cuánto empeora el modelo respecto al base en razonamiento, código o matemáticas.
- Riesgo de alucinación: no evaluado en la información disponible; es un modelo conversacional sin datos de fiabilidad factual publicados.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto oficial: no disponible. Solo hay medidas de encaje de memoria a 8k y 16k, no una ventana máxima certificada.
- Fiabilidad del repositorio: creado el 2026-10-11, con 0 descargas y 0 likes y una única actualización el mismo día. No hay validación de terceros sobre la integridad de los pesos ni sobre que la cuantización se haya hecho correctamente.
- Licencia: Apache-2.0 según el repositorio de origen, lo que en principio permite uso comercial, pero conviene verificar la licencia real del modelo base Qwen/Qwen3.8-27B antes de explotarlo en producción, ya que la información disponible no la detalla.
- Uso comercial de un modelo abliterado: aunque la licencia lo permita, el contenido generado puede ser inapropiado o ilícito en determinados contextos. Se recomienda filtrado de salida y registro de auditoría si se expone a usuarios finales.
- Coste de almacenamiento: el repositorio completo ocupa 799,7 GB, de modo que descargar todas las cuantizaciones es poco práctico; conviene pedir únicamente el fichero necesario.
- Parámetros de decodificación, plantilla de prompt y formato de chat esperado por el modelo: no disponibles. Un prompt mal formateado puede degradar notablemente la calidad de las respuestas.

## Enlaces

- Repositorio de este fork: https://huggingface.co/AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF
- Repositorio de origen del build abliterado, citado en la model card: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base declarado: Qwen/Qwen3.8-27B (referenciado como `Qwen/Qwen3.8-27B`; no se proporciona URL en la información disponible)
- Herramienta de abliteración citada en la model card: `remove-refusals-with-transformers`, de Sumandora (no se proporciona URL en la información disponible)
- Comando de descarga con Ollama: `ollama pull hf.co/AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF:Q4_K_M`
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los únicos resultados fueron páginas genéricas de OpenAI, Google Gemini, ChatGPT, DeepAI y Perplexity, sin relación con el repositorio. No se han encontrado papers, blogs ni demos asociados.
