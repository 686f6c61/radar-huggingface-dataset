# Egzakta/Kvark-Sparkle-1.0-27B-GGUF

## Resumen

KVARK Sparkle 1.0 27B es un modelo multimodal (texto e imagen) desarrollado por Egzakta, distribuido bajo licencia Apache 2.0. Esta ficha corresponde concretamente a la versión cuantizada en GGUF, pensada para su ejecución en llama.cpp, Ollama y LM Studio. El modelo base cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) y una arquitectura híbrida que combina atención completa con atención lineal, lo que reduce drásticamente el coste de la caché KV en contextos largos.

El modelo incorpora un modo de razonamiento explícito (thinking mode) y una cabeza MTP (multi-token prediction) que se conserva en todos los ficheros GGUF y habilita decodificación especulativa en llama.cpp. La ventana de contexto alcanza los 262.144 tokens, con un estado de atención lineal que ocupa menos de 0,2 GB independientemente de la longitud del contexto. Según los datos de la model card, el modelo está optimizado para producir respuestas correctas con muchas menos fichas de razonamiento que modelos comparables.

Su relevancia actual radica en la combinación de contexto muy largo, capacidades multimodales, razonamiento eficiente en tokens y un conjunto de cuantizaciones (desde Q8_0 hasta IQ4_XS) que permiten ejecutarlo en tarjetas gráficas de consumo de 24 GB. La licencia Apache 2.0 sin límite de ingresos facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa; cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.320.697.856 (≈27,3 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (según tabla de memoria de la model card) |
| Tipos de cuantización | Q8_0 (8,5 bpw), Q6_K (6,56 bpw), Q5_K_M (5,5 bpw), Q4_K_M (4,5 bpw), IQ4_XS (4,25 bpw); proyector visual mmproj en F16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (uso comercial permitido, sin límite de ingresos) |
| Formato de pesos | GGUF (llama.cpp); pesos BF16 originales en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que alterna capas de atención lineal con capas de atención completa. Esta combinación permite que el estado de atención lineal se mantenga por debajo de 0,2 GB sea cual sea la longitud del contexto, mientras que la caché KV de las capas de atención completa escala de forma lineal: 2 GiB en f16 para 32.768 tokens, 4 GiB para 65.536, 8 GiB para 131.072 y 16 GiB para 262.144. Con cuantización q8_0 de la caché KV esos valores se reducen aproximadamente a la mitad.

El modelo incorpora una cabeza MTP (multi-token prediction) que se conserva en todos los ficheros GGUF y se usa en llama.cpp mediante `--spec-type draft-mtp --spec-draft-n-max 3` para decodificación especulativa. Las cuantizaciones se generaron con una importance matrix calculada sobre los datos de SFT del propio autor (`imatrix.gguf`, incluido en el repositorio). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información se remite a la model card del modelo base. El pipeline declarado es image-text-to-text, con un proyector visual independiente en F16.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento explícito (thinking mode), cuyo contenido se devuelve en el campo `reasoning_content` de la API compatible con OpenAI.
- Razonamiento matemático y lógico de varios pasos, con un uso de tokens de razonamiento notablemente inferior al de modelos comparables según los datos del autor.
- Comprensión de imágenes mediante el proyector mmproj (pipeline image-text-to-text); se puede desactivar con `--no-mmproj` para uso solo de texto.
- Generación y razonamiento sobre código, incluyendo evaluación en LiveCodeBench según los datos de la model card.
- Seguimiento de instrucciones (IFEval) y conocimiento general y profesional (MMLU-Pro, GPQA Diamond) según las métricas reportadas.
- Decodificación especulativa nativa mediante la cabeza MTP incluida.
- Servidor compatible con la API de chat de OpenAI en el puerto 8080 (llama-server), con soporte de plantilla Jinja (`--jinja`).
- Capacidades multilingües limitadas al inglés según el campo `language` del repositorio.
- No se documenta en la información disponible soporte explícito de tool calling ni de function calling.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo puede resolver problemas de competición y de nivel profesional (AIME, GPQA Diamond) con una mediana de tokens de razonamiento muy inferior a la de modelos comparables, lo que reduce el coste por consulta en entornos de investigación.
- Análisis de documentos extensos: con 262.144 tokens de contexto y un estado de atención lineal de menos de 0,2 GB, es adecuado para resumir o extraer información de contratos, informes técnicos o corpus de código de gran longitud sin truncar.
- Procesamiento de documentación técnica con imágenes: gracias al proyector visual, puede interpretar diagramas, capturas de pantalla o figuras dentro de manuales y responder preguntas sobre ellos.
- Asistente de código en local: la cuantización Q4_K_M (16,8 GB) cabe en una RTX 4090 de 24 GB y permite integrar el modelo en flujos de revisión de código o generación de parches con latencia baja gracias a la decodificación especulativa MTP.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones IQ4_XS (15,3 GB) y Q4_K_M permiten ejecutar el modelo con llama.cpp, Ollama o LM Studio en hardware de consumo, útil para prototipado y entornos con requisitos de privacidad.
- Evaluación comparativa de eficiencia de razonamiento: la reducción de tokens de pensamiento reportada (por ejemplo, 3.122 frente a 7.854 en GPQA Diamond) lo hace útil para estudiar el equilibrio entre precisión y coste computacional en pipelines de agentes.
- Servicio de chat con API compatible con OpenAI: llama-server expone `/v1/chat/completions`, lo que facilita sustituir un backend en la nube por este modelo local sin cambiar el código cliente.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan KVARK Sparkle 1.0 con un modelo denominado Qwen3.8-27B. La precisión reportada es la siguiente:

| Benchmark | Sparkle 1.0 | Qwen3.8-27B |
|---|---|---|
| GPQA Diamond | 89,3 | 89,4 |
| AIME | 93,3 | 94,0 |
| LiveCodeBench | 82,7 | 77,3 |
| IFEval | 91,3 | 92,4 |
| MMLU-Pro | 83,3 | 84,0 |

Tokens de razonamiento (mediana):

| Benchmark | Sparkle 1.0 | Qwen3.8-27B |
|---|---|---|
| GPQA Diamond | 3.122 | 7.854 |
| AIME | 5.502 | 14.318 |
| LiveCodeBench | 6.664 | 19.950 |
| IFEval | 470 | 714 |
| MMLU-Pro | 429 | 727 |

Tiempo mediano hasta la respuesta: 13,7 s para Sparkle 1.0 frente a 28,1 s para Qwen3.8-27B. No se han publicado en la información disponible resultados de benchmarks adicionales ni detalles sobre el entorno de medición.

## Requisitos de hardware

- VRAM para los pesos según cuantización: Q8_0 29,0 GB; Q6_K 22,4 GB; Q5_K_M 19,5 GB; Q4_K_M 16,8 GB; IQ4_XS 15,3 GB. El proyector visual añade 0,9 GB.
- Caché KV en f16: 2 GiB a 32.768 tokens, 4 GiB a 65.536, 8 GiB a 131.072 y 16 GiB a 262.144. Con `-ctk q8_0 -ctv q8_0` se reduce aproximadamente a la mitad.
- Estado de atención lineal: menos de 0,2 GB sea cual sea el contexto.
- La cuantización Q4_K_M está recomendada por el autor para tarjetas de 24 GB, como la RTX 4090; IQ4_XS deja más margen para la caché KV en ese mismo segmento.
- GPU de datacenter (A100, H100) permiten usar Q8_0 con contexto largo completo; no se especifican cifras de throughput ni latencia más allá del tiempo mediano de respuesta reportado.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (`ollama run hf.co/Egzakta/Kvark-Sparkle-1.0-27B-GGUF:Q4_K_M`) y LM Studio.
- Parámetros de muestreo recomendados: temperatura 1,0, top_p 0,95, top_k 20; contexto de 65.536 tokens en LM Studio.
- Decodificación especulativa: `--spec-type draft-mtp --spec-draft-n-max 3`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| KVARK Sparkle 1.0 27B | 27,3 B | 262.144 | Apache 2.0 | Sí (image-text-to-text) | Atención híbrida, MTP, thinking mode |
| Qwen3.8-27B (referencia de la model card) | 27 B (según denominación) | No disponible | No disponible | No disponible | Comparado en GPQA, AIME, LiveCodeBench, IFEval y MMLU-Pro; menor precisión en LiveCodeBench, mayor en el resto |
| Alternativas adicionales | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El único idioma declarado es el inglés; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- No se documenta en la información disponible soporte de tool calling, function calling ni flujos de agentes con herramientas; conviene validarlo antes de usarlo en producción para esos fines.
- Los benchmarks publicados proceden del propio autor del modelo y comparan con un único modelo de referencia; no se especifican detalles del protocolo de evaluación.
- El modelo puede alucinar, especialmente en dominios especializados o con contexto muy largo; no se documentan tasas de alucinación.
- No se detalla la composición del dataset de entrenamiento ni los posibles sesgos; la información se remite a la model card del modelo base.
- El uso de contexto muy largo en f16 consume mucha memoria (16 GiB a 262.144 tokens); se recomienda cuantizar la caché KV o reducir el contexto en GPUs de 24 GB.
- La decodificación especulativa depende de la cabeza MTP y de flags concretos de llama.cpp; versiones antiguas del runtime pueden no soportarla.
- Aunque la licencia Apache 2.0 permite uso comercial sin límite de ingresos, deben revisarse las condiciones del modelo base y de los datos de entrenamiento en la model card principal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B-GGUF
- Modelo base (pesos BF16, entrenamiento y datos): https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
