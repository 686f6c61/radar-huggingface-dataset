# mradermacher/OrcaMaid-v2-FIX-13b-32k-GGUF

## Resumen

OrcaMaid-v2-FIX-13b-32k es un modelo de lenguaje de 13.000 millones de parámetros derivado de la familia Orca de Microsoft Research. El modelo base original (ddh0/OrcaMaid-v2-FIX-13b-32k) es un ajuste fino que combina el linaje Orca-2-13b con un contexto extendido hasta 32.000 tokens, orientado a tareas de razonamiento, instrucciones y conversación. Esta ficha describe concretamente la versión cuantizada en formato GGUF publicada por el usuario mradermacher, pensada para ejecución local eficiente mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicación radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta Q8_0), lo que permite desplegarlo en hardware de consumo con requisitos de memoria muy reducidos frente al modelo original en precisión completa. El repositorio ocupa 81,8 GB e incluye los distintos ficheros GGUF, aunque el modelo en sí ronda los 13.000 millones de parámetros.

Se trata de un modelo únicamente en inglés, con licencia Microsoft Research License (no comercial en su forma original), lo que condiciona su uso en producción. La información pública disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni arquitectura interna más allá de lo que se deduce del linaje Orca y del tamaño de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Orca-2-13b; detalles internos no disponibles) |
| Parámetros totales | 13.015.864.320 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (según nombre del modelo) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | microsoft-research-license |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Tamaño del repositorio | 81,8 GB (conjunto de todas las cuantizaciones) |
| Cuantizador | mradermacher |
| Modelo base | ddh0/OrcaMaid-v2-FIX-13b-32k |
| Librería declarada | transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. Por el linaje del modelo (Orca-2-13b de Microsoft Research, ajustado posteriormente en la variante OrcaMaid-v2-FIX con contexto extendido a 32k), se trata de un transformer decoder-only de 13.000 millones de parámetros. El sufijo "FIX" y "v2" sugiere correcciones y una segunda iteración del ajuste respecto a versiones previas del modelo comunitario, pero no se especifican los detalles de dichas correcciones.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. La extensión de contexto a 32.000 tokens es una característica declarada en el nombre del modelo, pero no se aportan detalles sobre el método de extensión (RoPE scaling, interpolación u otros). Esta versión concreta es únicamente una recuantización estática a GGUF del modelo base, sin reentrenamiento adicional.

## Capacidades

- Generación de texto en inglés con ajuste a instrucciones, heredado del linaje Orca.
- Razonamiento multi-paso y resolución de problemas, capacidad característica de la familia Orca-2.
- Manejo de contexto largo de hasta 32.000 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Generación de código y tareas de programación básica (capacidad esperable del linaje Orca, sin datos específicos publicados).
- Razonamiento matemático elemental (sin benchmarks publicados que lo cuantifiquen).
- Conversación multi-turno en inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Procesamiento de documentos largos en local: gracias a la ventana de 32.000 tokens, el modelo puede resumir o extraer información de contratos, informes o artículos extensos sin truncar el contenido, ejecutándose en una estación de trabajo con GPU de consumo.
- Asistente de escritura técnica en inglés: redacción y revisión de documentación, correos y textos técnicos, aprovechando el ajuste a instrucciones del linaje Orca.
- Análisis de conversaciones y transcripciones extensas: la ventana de contexto permite cargar hilos completos de correo o transcripciones y generar resúmenes o respuestas contextualizadas.
- Prototipado e investigación en entornos sin conectividad: al distribuirse en GGUF, puede ejecutarse íntegramente offline con llama.cpp, útil para laboratorios con requisitos de privacidad.
- Generación de código asistida en local: integrable en editores o scripts mediante llama.cpp u Ollama para autocompletado y explicación de fragmentos de código, siempre en inglés y con validación humana.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece diez niveles de cuantización, lo que permite medir el compromiso entre calidad y memoria en distintos hardware para tareas de razonamiento.
- Educación e investigación sobre modelos abiertos: sirve como caso de estudio de ajustes comunitarios sobre Orca-2 y de pipelines de cuantización GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~5,0 GB; Q3_K_S ~5,8 GB; Q3_K_M ~6,4 GB; Q3_K_L ~7,0 GB; Q4_K_S ~7,5 GB; Q4_K_M ~8,0 GB; Q5_K_S ~9,1 GB; Q5_K_M ~9,3 GB; Q6_K ~10,8 GB; Q8_0 ~13,9 GB (tamaños de fichero; la VRAM real requiere margen adicional para caché KV, especialmente con contexto de 32k).
- GPU recomendadas: para Q4_K_M o Q5_K_M, tarjetas con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); para Q8_0, 16-24 GB (RTX 4090, A5000, A100).
- Compatibilidad con GPU de consumo: sí; las cuantizaciones Q2 a Q4 caben en tarjetas de 8-12 GB, y las Q5-Q6 en 12-16 GB. La ventana de 32k incrementa el uso de memoria por la caché KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No es apto para vLLM o TGI en su forma GGUF sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OrcaMaid-v2-FIX-13b-32k (esta ficha) | 13B | 32k | Microsoft Research License | GGUF | Solo inglés, cuantizaciones múltiples |
| Microsoft Orca-2-13b | 13B | 4k (original) | Microsoft Research License | safetensors | Modelo base del linaje, contexto menor |
| Llama-2-13B-chat | 13B | 4k | Llama 2 Community License | safetensors/GGUF | Alternativa generalista, multilingüe parcial |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | safetensors/GGUF | Menor tamaño, licencia permisiva, contexto comparable |

No se dispone de datos de rendimiento comparativo para esta versión cuantizada.

## Limitaciones y advertencias

- Licencia Microsoft Research License: restringe el uso comercial; es imprescindible revisar los términos antes de cualquier despliegue en producción.
- Solo soporta inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a los modelos de 13B de esta generación, sin datos publicados de mitigación específica.
- La información sobre entrenamiento, sesgos y evaluación es prácticamente inexistente; no hay garantías documentadas de robustez.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality".
- El contexto de 32k incrementa notablemente el consumo de memoria por caché KV; en hardware ajustado puede provocar desbordamiento a RAM y caídas de rendimiento.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validación comunitaria.
- Al ser una recuantización estática (sin imatrix), puede presentar mayor perplejidad que cuantizaciones ponderadas equivalentes.

## Enlaces

- Repositorio Hugging Face (esta versión GGUF): https://huggingface.co/mradermacher/OrcaMaid-v2-FIX-13b-32k-GGUF
- Modelo base: https://huggingface.co/ddh0/OrcaMaid-v2-FIX-13b-32k
- Licencia (Microsoft Orca-2-13b): https://huggingface.co/microsoft/Orca-2-13b/blob/main/LICENSE
- Página de resumen del cuantizador: https://hf.tst.eu/model#OrcaMaid-v2-FIX-13b-32k-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
