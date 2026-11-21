# GBP-DE/Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP

## Resumen

Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP es una cuantización de 5 bits del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario GBP-DE. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia en Apple Silicon mediante el runtime oMLX. El checkpoint emplea la técnica oQ5e (cuantización guiada por importancia), refinamiento WLS Refit, matrices de importancia iMatrix y conserva los pesos de Multi-Token Prediction (MTP) para decodificación acelerada. El repositorio ocupa 326,3 GB y declara 179.999.981.459 parámetros totales en safetensors.

El modelo base es un MoE multimodal de tipo image-text-to-text, por lo que esta conversión hereda capacidades de visión, conversación multi-turno y razonamiento. La relevancia actual reside en que permite ejecutar un modelo de ~180.000 millones de parámetros en hardware Apple Silicon con memoria unificada alta (el autor reporta pruebas en un M5 Max con 128 GB), algo inviable con los pesos originales en BF16. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

La ficha se basa exclusivamente en los metadatos de Hugging Face y la model card del autor. Los detalles de arquitectura interna, composición del dataset de entrenamiento y resultados de benchmarks estandarizados no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text) heredada de Qwen3.8-Flash-Next; detalles internos no disponibles |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e (5 bits, guiada por importancia), con WLS Refit, iMatrix y tensores no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiqueta `license:other`) |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repositorio | 326,3 GB |
| Runtime objetivo | oMLX (Apple Silicon) |
| Decodificacion acelerada | MTP (Multi-Token Prediction) preservado |
| Descargas / likes | 1.493 / 6 |
| Fechas | creado 2026-10-13, actualizado 2026-11-20 |

## Arquitectura y entrenamiento

Este checkpoint no incluye entrenamiento propio: es una re-cuantización del modelo base Qwen/Qwen3.8-Flash-Next, que según los tags y el pipeline es un modelo MoE multimodal de tipo image-text-to-text. La conversión aplica oQ5e, un esquema de cuantización de 5 bits que asigna precisión según la importancia de los pesos, combinado con WLS Refit (refinamiento por mínimos cuadrados ponderados), iMatrix (tratamiento guiado por importancia) y conservación de los tensores MTP. Los tensores no cuantizados se mantienen en BF16 cuando corresponde.

El checkpoint actual fue reconstruido el 19 de noviembre de 2026 con oMLX 0.8.0, sustituyendo la build del 1 de noviembre de 2026 hecha con oMLX 0.7.3. El autor indica que el método oQe refinado busca reducir el error de cuantización a la misma precisión nominal, pero no confirma una mejora de precisión específica para este checkpoint. La implementación previa de WLS Refit se asoció a una reducción de divergencia KL de aproximadamente el 11-15 % en las evaluaciones del cuantizador del desarrollador, resultado histórico y dependiente de la arquitectura, no medido sobre esta build.

No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de atención del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base conversacional.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con entrada multimodal.
- Razonamiento analítico y resolución de problemas complejos: el autor reporta resultados "generalmente sólidos" en dos ejercicios de razonamiento exigentes (OBSIDIAN-40 y SILBERGRAT), aunque no exentos de errores.
- Decodificación acelerada mediante MTP (Multi-Token Prediction) en runtimes oMLX compatibles.
- Ejecución en Apple Silicon con memoria unificada, gracias a la cuantización de 5 bits.
- Capacidades de tool calling, function calling, agentes y multilingüismo: no disponibles en la información proporcionada (presumiblemente heredadas del base, pero sin confirmación documental).

## Casos de uso

- Razonamiento analítico local en estaciones de trabajo Apple Silicon: ejecutar consultas complejas de análisis y evaluación de evidencia sobre un M5 Max con 128 GB de memoria unificada, aprovechando la ventana de contexto del modelo base y la cuantización de 5 bits para mantener la fidelidad.
- Asistentes conversacionales con entrada de imagen: al ser un modelo image-text-to-text, puede emplearse en aplicaciones de descripción, análisis o preguntas sobre imágenes en entornos locales, sin depender de la nube.
- Prototipado de pipelines multimodales en macOS: desarrolladores que necesiten validar flujos de visión-lenguaje antes de desplegar en infraestructura GPU pueden usar esta conversión con oMLX como entorno de pruebas.
- Investigación en cuantización: sirve como referencia práctica para estudiar el efecto de oQ5e, WLS Refit e iMatrix sobre un MoE de ~180.000 millones de parámetros, comparando con la build oQ4e del mismo autor.
- Evaluación de decodificación MTP: útil para medir el rendimiento de Multi-Token Prediction en hardware Apple, con datos reportados de 67,1-70,7 tok/s de generación en las pruebas del autor.
- Despliegue de razonamiento de alta exigencia sin conexión: escenarios con requisitos de privacidad donde no se puede enviar datos a APIs externas y se dispone de un equipo Apple de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pruebas locales no estandarizadas en un M5 Max de 128 GB con oMLX 0.8.0:

| Test | Prefill (tok/s) | Generacion (tok/s) | Tiempo de thinking (s) | Tiempo total (s) |
|---|---:|---:|---:|---:|
| OBSIDIAN-40 | 1.532,4 | 67,1 | 531,3 | 621,4 |
| SILBERGRAT | 485,4 | 70,7 | 358,5 | 540,2 |

Para comparación, la build anterior con oMLX 0.7.3, probada con oMLX 0.7.4.dev1, generó 67,6 tok/s en OBSIDIAN-40 y 60,8 tok/s en SILBERGRAT. El autor advierte que las diferencias de versión de runtime, revisión de prompts y longitud de generación impiden atribuir las diferencias de rendimiento únicamente a la cuantización.

## Requisitos de hardware

- Memoria: el repositorio pesa 326,3 GB; se requiere memoria unificada suficiente para cargar los pesos de 5 bits más el overhead de contexto y KV cache. El autor valida su ejecución en un M5 Max con 128 GB, aunque no detalla el margen exacto.
- GPU: no aplica a GPU discretas; el runtime objetivo es oMLX sobre Apple Silicon (series M con memoria unificada alta).
- Cabe en GPU de consumo: no en el sentido convencional; no está pensado para RTX 4090 (24 GB) ni similares. Requiere equipos Apple con memoria unificada muy alta.
- Despliegue: oMLX (versión 0.8.0 para esta build). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 67,1-70,7 tok/s de generación y 485,4-1.532,4 tok/s de prefill en las pruebas del autor; tiempos totales de 540-621 s en tareas de razonamiento largo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Entorno |
|---|---|---|---|---|---|
| GBP-DE/Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP | 179.999.981.459 | oQ5e (5 bits) | no disponible | qwen-community-1.0 | Apple Silicon / oMLX |
| GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP | no disponible | oQ4e (4 bits) | no disponible | qwen-community-1.0 | Apple Silicon / oMLX |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | BF16 (original) | no disponible | qwen-community-1.0 | GPU / infraestructura estándar |

La comparación se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- Alucinación: el autor reporta que las salidas de razonamiento, aunque sólidas, no están exentas de errores (por ejemplo, un error menor de marca temporal en la prueba SILBERGRAT).
- Sin mejora de precisión confirmada: el propio autor indica que no se ha establecido una ganancia de precisión consistente frente al checkpoint anterior.
- Dependencia de runtime: requiere oMLX compatible; la actualización del runtime por sí sola no mejora los pesos ya descargados, es necesario volver a descargar los archivos.
- Resultados de rendimiento no estandarizados: las cifras de tok/s y tiempos provienen de pruebas individuales con prompts revisados y versiones de runtime distintas, por lo que no son comparables directamente.
- Idiomas soportados no documentados: no se puede confirmar la cobertura multilingüe sin consultar la documentación del modelo base.
- Tamaño elevado: 326,3 GB de repositorio limitan su uso a equipos con memoria unificada muy alta; no es desplegable en GPU de consumo estándar.
- Los datos de arquitectura interna, contexto y parámetros activos del MoE no están disponibles en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP
- Variante oQ4e del mismo autor: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Notas de la versión oMLX 0.8.0: https://github.com/jundot/omlx/releases/tag/v0.8.0
- Notas de la versión oMLX 0.7.3: https://github.com/jundot/omlx/releases/tag/v0.7.3
- Repositorio oMLX: https://github.com/jundot/omlx
