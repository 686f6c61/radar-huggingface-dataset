# pisapporo/translate

## Resumen

`pisapporo/translate` es un modelo de traducción japonés-inglés publicado por el usuario pisapporo (PI LLC, según su perfil de Hugging Face) bajo licencia Apache 2.0. El repositorio distribuye únicamente dos ficheros GGUF: `models/fast.gguf` (2,74 GB) y `models/quality.gguf` (4,39 GB), una separación explícita por compromiso velocidad/calidad. Los metadatos de Hugging Face declaran 3.893.723.683 parámetros (~3,9B) y las etiquetas `translation`, `conversational`, `gguf` y `endpoints_compatible`.

El modelo cubre un caso de uso acotado: traducción bidireccional ja↔en con pesos cuantizados listos para inferencia local. Resulta relevante para equipos que necesitan un traductor autoalojado, con licencia permisiva y sin dependencia de API, pero su estado es incipiente: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá de la tabla de ficheros.

La model card no especifica arquitectura, composición del dataset, procedimiento de entrenamiento ni longitud de contexto. Cualquier evaluación rigurosa del modelo requiere medirlo contra un conjunto de referencia propio (por ejemplo, WMT ja-en) antes de considerarlo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica transformer, MoE ni híbrida) |
| Parámetros totales | 3.893.723.683 (~3,9B), según metadatos de safetensors de Hugging Face |
| Parámetros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; niveles concretos no documentados. Los tamaños (2,74 GB y 4,39 GB) son compatibles con ~Q4-Q5 y ~Q8 respectivamente, estimación no confirmada por el autor |
| Idiomas soportados | japonés (ja) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`models/fast.gguf`, `models/quality.gguf`). Hugging Face expone un recuento de parámetros procedente de safetensors, pero la model card no lista ficheros safetensors |

Notas: el repositorio ocupa 7,1 GB, coherente con la suma de los dos GGUF (2,74 + 4,39 = 7,13 GB). Fecha de creación y última actualización: 22 de octubre de 2026.

## Arquitectura y entrenamiento

No disponible. La model card se limita a declarar licencia, idiomas, pipeline y los dos ficheros GGUF; no describe la arquitectura (transformer denso, MoE, SSM o híbrida), el tokenizador, el número de tokens de entrenamiento, la composición del corpus ni si hubo ajuste por RLHF, DPO o instrucciones.

Tampoco se documentan innovaciones técnicas (atención lineal, decodificación especulativa, quantización consciente de embeddings) ni el proceso de conversión a GGUF. El tag `conversational` sugiere la presencia de una plantilla de chat o un ajuste instructivo, pero no hay confirmación en la información disponible.

## Capacidades

- Traducción bidireccional japonés↔inglés, según el `pipeline_tag: translation` y los idiomas declarados.
- Dos variantes de inferencia con compromiso explícito: `fast.gguf` (menor huella, menor calidad esperada) y `quality.gguf` (mayor huella, mayor calidad esperada).
- Compatibilidad declarada con Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Formato GGUF, lo que habilita ejecución en llama.cpp, Ollama y derivados, tanto en CPU como en GPU.
- Posible uso conversacional multi-turno por el tag `conversational`; no verificado ni documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o thinking mode: no disponibles.
- Cobertura multilingüe fuera de ja/en: no disponible (solo se declaran esos dos idiomas).

## Casos de uso

- Traducción de documentación técnica ja→en en pipelines de CI: invocar `quality.gguf` desde un job que traduzca los ficheros Markdown modificados en cada pull request, con revisión humana posterior. La licencia Apache 2.0 permite integrarlo en un producto interno sin fricción legal.
- Localización de videojuegos o manga ja→en: usar `quality.gguf` para los textos de diálogo y `fast.gguf` para pasadas masivas de pre-traducción, reduciendo el coste por palabra frente a APIs comerciales.
- Atención al cliente bilingüe en comercio electrónico con clientela japonesa: traducir los mensajes entrantes ja→en para el equipo de soporte y las respuestas en→ja, manteniendo los datos dentro de la infraestructura propia.
- Subtitulado y traducción de contenido audiovisual: procesar los segmentos de transcripción ja→en con `fast.gguf` en una GPU de gama media y aplicar `quality.gguf` solo a los segmentos marcados para revisión.
- Traducción en el borde (edge) o en equipos sin conectividad: desplegar `fast.gguf` con llama.cpp en portátiles con GPU de 6-8 GB o incluso en CPU, para entornos con requisitos de soberanía del dato.
- Preprocesado de corpus para entrenamiento: traducir grandes volúmenes de texto ja→en de forma automática antes de filtrar y curar un dataset, aprovechando que el modelo es autoalojable y no impone límites de peticiones.
- Herramientas de mensajería o chat interno: por el tag `conversational`, integrar el modelo como traductor en vivo de conversaciones, siempre que se valide previamente la calidad en turnos cortos y jerga propia del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

En concreto, no hay cifras de BLEU, chrF, COMET, MMLU, HumanEval ni GSM8K, ni comparaciones con otros sistemas de traducción ja-en. Tampoco se documentan latencia, throughput ni tamaño de contexto en tokens, por lo que no es posible estimar el rendimiento real sin ejecutar una evaluación propia.

## Requisitos de hardware

Estimaciones a partir del recuento de parámetros y del tamaño de los ficheros; el autor no publica requisitos oficiales.

- `models/fast.gguf` (2,74 GB): VRAM estimada de 3,5-4,5 GB con contexto de 2.000-4.000 tokens. Cabe en GPU de 6 GB (GTX 1660 Ti, RTX 2060) y con holgura en 8 GB (RTX 3060 Ti, RTX 4060).
- `models/quality.gguf` (4,39 GB): VRAM estimada de 5,5-7 GB. Ajusta en 8 GB con contexto corto; recomendable 12 GB (RTX 3060 12 GB, RTX 4070) para contextos mayores y batching.
- Pesos en FP16 (no publicados en el repositorio): ~7,8 GB solo de pesos, más caché KV; requeriría 10-12 GB de VRAM.
- GPU profesionales: A100 40/80 GB, H100, L40S o L4 24 GB para servir con concurrencia; una T4 16 GB es suficiente para `quality.gguf` en modo single-stream.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB con `fast.gguf`.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM admite GGUF de forma experimental o previa conversión a safetensors; TGI no soporta GGUF de forma nativa.
- Ejecución en CPU: viable con llama.cpp y `fast.gguf`; el throughput dependerá del número de núcleos y del ancho de banda de memoria, sin datos publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `pisapporo/translate` | ~3,9B | no disponible | Apache 2.0 | GGUF (2 variantes) | Sin benchmarks publicados; solo ja↔en |
| `facebook/nllb-200-3.3B` | 3,3B | 512 tokens | CC-BY-NC-4.0 | safetensors, transformers | 202 idiomas; licencia no comercial |
| `facebook/m2m100_1.2B` | 1,2B | 1.024 tokens | MIT | safetensors, transformers | 100 idiomas; licencia muy permisiva |
| `Helsinki-NLP/opus-mt-ja-en` | ~77M | 512 tokens | CC-BY-4.0 | safetensors, transformers | MarianMT; solo dirección ja→en |

Los datos de los modelos alternativos proceden de su documentación pública. No existen evaluaciones comparativas publicadas frente a `pisapporo/translate`, por lo que la columna de rendimiento se omite: no hay métricas equiparables. La ventaja diferencial del modelo evaluado es la combinación de licencia Apache 2.0 con distribución GGUF; su desventaja es la ausencia total de documentación y de validación por la comunidad.

## Limitaciones y advertencias

- Ausencia de documentación técnica: sin arquitectura, tokenizador, contexto ni datos de entrenamiento, es imposible auditar el modelo o reproducir su entrenamiento.
- Sin benchmarks: no hay evidencia publicada de calidad de traducción; el nombre `quality.gguf` es una declaración del autor, no una métrica.
- Riesgo de alucinación y de errores de fidelidad: en traducción automática esto se manifiesta como omisiones, adiciones y cambios de sentido, especialmente en frases largas y terminología especializada.
- Cobertura lingüística limitada a japonés e inglés; no se declara soporte de otros idiomas ni de variantes dialectales.
- Longitud de contexto desconocida: los documentos largos pueden requerir segmentación manual y perder coherencia entre fragmentos.
- Trazabilidad nula: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación independiente y de reportes de errores.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero exige conservar el aviso de copyright y la licencia, e incluye una concesión de patentes con cláusula de terminación. No hay restricciones de uso adicionales documentadas.
- Niveles de cuantización no declarados: no se puede saber qué precisión efectiva tiene cada fichero ni si `fast.gguf` degrada sistemáticamente ciertos dominios.
- Fechas de creación y actualización en 2026: conviene verificar que el repositorio sigue mantenido antes de fijar una dependencia en producción.
- Sin información sobre sesgos: no se documenta la composición del corpus, por lo que no se pueden evaluar sesgos de género, registro o dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pisapporo/translate
- Perfil de la organización pisapporo (PI LLC): https://huggingface.co/pisapporo/models
- Fichero `models/fast.gguf`: https://huggingface.co/pisapporo/translate/blob/main/models/fast.gguf
- Fichero `models/quality.gguf`: https://huggingface.co/pisapporo/translate/blob/main/models/quality.gguf
- Licencia: https://huggingface.co/pisapporo/translate/blob/main/LICENSE

No se han encontrado en la búsqueda web papers, blogs técnicos, repositorios de código ni demos específicos de este modelo; el resto de resultados disponibles corresponde a otros sistemas de traducción y no se refiere a `pisapporo/translate`.
