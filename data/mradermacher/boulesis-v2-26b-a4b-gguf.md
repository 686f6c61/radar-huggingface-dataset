# mradermacher/Boulesis-v2-26B-A4B-GGUF

## Resumen

Boulesis-v2-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo Boulesis-v2-26B-A4B, publicado por el usuario mradermacher a partir del modelo original de SubMaroon-exp. Se trata de un merge de modelos de la familia Gemma (etiquetado como "gemma4") con arquitectura de mezcla de expertos (MoE), orientado a roleplay, razonamiento y uso conversacional sin censura en herramientas como SillyTavern. El modelo incluye un modo de razonamiento explícito ("thinking") y ha sido procesado con técnicas de "abliteration"/"heretic" para eliminar los rechazos del modelo base.

El repositorio contiene únicamente pesos cuantizados estáticos en GGUF (desde Q2_K hasta Q8_0), pensados para inferencia local con llama.cpp y derivados. El modelo original cuenta con 25.971.339.550 parámetros totales según los safetensors reportados, lo que lo sitúa en la categoría de ~26B, con una ventana de contexto que no se especifica en la información disponible.

Su relevancia actual radica en que ofrece una alternativa de roleplay y razonamiento de tamaño medio con cuantizaciones accesibles para hardware de consumo, aunque su licencia Gemma y su naturaleza de merge experimental limitan su uso comercial y su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma (etiqueta "gemma4"); detalles de capas y atención no disponibles |
| Parámetros totales | 25.971.339.550 (~26B) |
| Parámetros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); versiones imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: se trata de un modelo de mezcla de expertos (MoE) derivado de la familia Gemma, con 25.971.339.550 parámetros totales. El sufijo "A4B" del nombre sugiere aproximadamente 4.000 millones de parámetros activos por token, patrón habitual en modelos MoE de este tamaño, pero este dato no está confirmado en la documentación proporcionada.

El modelo es un merge (fusión) de pesos, no un entrenamiento desde cero, y ha pasado por un proceso de "heretic"/abliteration para eliminar comportamientos de rechazo (uncensored). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste fino supervisado. La model card del cuantizador es puramente operativa y no incluye detalles técnicos del modelo original.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay y personajes.
- Modo de razonamiento explícito ("thinking"/"reasoning"), según las etiquetas del repositorio.
- Comportamiento sin censura ("uncensored"/"heretic"): menor probabilidad de rechazar peticiones que el modelo base.
- Integración con SillyTavern y frontends de roleplay (etiqueta "sillytavern").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo está etiquetado explícitamente para roleplay y SillyTavern, por lo que puede gestionar diálogos multi-turno con personalidad consistente en inglés, usando las cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y velocidad en GPU de consumo.
- Generación creativa de ficción: su naturaleza uncensored permite narrativa sin filtros temáticos, útil para escritura de ficción adulta o tramas oscuras donde otros modelos rechazan contenido.
- Asistente personal local sin conexión: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en un equipo de sobremesa, manteniendo las conversaciones íntegramente en local.
- Prototipado de chatbots con razonamiento: el modo thinking permite obtener cadenas de razonamiento antes de la respuesta, útil para experimentar con prompting estructurado en inglés.
- Evaluación de merges y abliterations: investigadores pueden comparar el comportamiento de este merge frente al Gemma base para estudiar el efecto del uncensoring y la fusión de pesos.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (10,9 GB) y Q3_K_S (12,6 GB) permiten probar el modelo en GPUs de 12-16 GB, aunque con pérdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin caché KV): Q2_K ~10,9 GB; Q3_K_S ~12,6 GB; Q3_K_M ~13,7 GB; Q3_K_L ~14,2 GB; IQ4_XS ~14,6 GB; Q4_K_S ~16,0 GB; Q4_K_M ~17,3 GB; Q5_K_S ~18,6 GB; Q5_K_M ~19,7 GB; Q6_K ~23,3 GB; Q8_0 ~27,7 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; A100 40 GB o H100 para Q6_K/Q8_0 y contextos largos; RTX 3090 (24 GB) válida para Q4_K_M y Q5_K_M.
- GPU de consumo: sí, en RTX 3060 12 GB (Q2_K/Q3_K_S con contexto corto), RTX 4070 Ti 16 GB (Q4_K_S) y RTX 4090 24 GB (Q5_K_M/Q6_K). En GPUs de 8 GB no cabe ninguna cuantización completa; sería necesario offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; para el modelo base en safetensors, vLLM o TGI (no confirmado para esta arquitectura MoE concreta).
- Latencia y throughput: no disponibles. Al ser MoE con ~4B activos (según el nombre), se espera un throughput superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Boulesis-v2-26B-A4B-GGUF | ~26B (MoE) | no disponible | Gemma | GGUF | Roleplay uncensored, solo inglés |
| Gemma 2 27B (referencia de familia) | 27B denso | 8K | Gemma | safetensors, GGUF | Modelo oficial de Google, con alineación y benchmarks publicados |
| Modelos de roleplay 20-30B en GGUF (p. ej. merges de Yi/Llama) | 20-34B | variable | variable | GGUF | Ecosistema comparable de merges comunitarios sin benchmarks formales |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados para este merge, y las diferencias de arquitectura (MoE frente a denso) impiden extrapolar rendimiento por tamaño. Cualquier comparación de calidad requeriría evaluación propia.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano no está garantizado.
- Es un merge comunitario sin evaluación formal: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- Riesgo elevado de alucinación y de degradación en tareas de razonamiento o código, al no estar entrenado específicamente para ellas.
- El proceso "heretic"/uncensored elimina rechazos de seguridad: puede generar contenido ofensivo, ilegal o dañino sin filtros; no apto para aplicaciones orientadas al público sin moderación adicional.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier despliegue en producción.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la coherencia; para uso serio se recomienda Q4_K_M o superior.
- No se dispone de información sobre la longitud de contexto real, lo que impide planificar aplicaciones con ventanas largas.
- El repositorio ocupa 187,7 GB por incluir todas las cuantizaciones; la descarga selectiva de un solo archivo es imprescindible.
- Sin garantías de mantenimiento: modelo creado en septiembre de 2026 y actualizado en octubre de 2026, con solo 261 descargas y 2 likes, lo que indica escasa validación por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Boulesis-v2-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon-exp/Boulesis-v2-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Boulesis-v2-26B-A4B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Boulesis-v2-26B-A4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
