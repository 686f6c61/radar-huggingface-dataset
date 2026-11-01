# mradermacher/kordef-12b-GGUF

## Resumen

kordef-12b-GGUF es la versión cuantizada en formato GGUF del modelo graphuser/kordef-12b, un modelo de lenguaje de aproximadamente 11.770 millones de parámetros afinado para instrucciones y adaptado a dominio, con especial orientación al ámbito de defensa y al idioma coreano. La cuantización la ha realizado mradermacher, un autor habitual en la comunidad de GGUF, y publica el conjunto completo de cuantizaciones estáticas (desde Q2_K hasta Q8_0) para facilitar la inferencia local con llama.cpp y derivados.

El modelo se distribuye bajo licencia Gemma, lo que sugiere que su linaje parte de la familia Gemma de Google, aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento. Los tags indican soporte para coreano (ko) e inglés (en), así como capacidades conversacionales e instruccionales. El repositorio ocupa 122,3 GB en total, correspondiente a la suma de todas las variantes de cuantización.

Su relevancia actual radica en que ofrece una alternativa ligera (a partir de 4,9 GB en Q2_K y 7,4 GB en Q4_K_M) para desplegar un modelo de 12B especializado en dominio de defensa y coreano en hardware de consumo, algo poco habitual en ese nicho lingüístico y temático. No obstante, la información pública disponible es muy limitada: no se han publicado benchmarks, detalles de contexto ni composición del dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma según licencia; detalles no publicados) |
| Parámetros totales | 11.766.034.176 (≈11,77B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original presumiblemente en safetensors, no confirmado en la información disponible |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base graphuser/kordef-12b. Por el número de parámetros (11,77B) y la licencia Gemma, es plausible que derive de un transformer decoder-only de la familia Gemma, pero la model card no confirma ni la arquitectura exacta, ni el número de capas, ni la dimensión de los embeddings, ni el mecanismo de atención empleado.

Tampoco se documentan los datos de entrenamiento: no se indica el número de tokens, la composición del corpus, ni si hubo fases de RLHF, DPO o SFT. Los tags "instruction-tuned" y "domain-adaptive" sugieren un ajuste supervisado para seguir instrucciones y una adaptación posterior a un dominio específico (defensa), pero se desconoce el procedimiento concreto. La única innovación técnica documentada en este repositorio es el propio proceso de cuantización estática realizado por mradermacher, que genera múltiples variantes de GGUF sin cuantizaciones ponderadas por imatrix (el autor indica que no las tiene previstas a fecha de publicación).

## Capacidades

- Generación de texto conversacional en coreano e inglés, con ajuste para seguir instrucciones.
- Adaptación a dominio de defensa (tag "defense"), lo que sugiere familiaridad con terminología y contextos de ese ámbito, aunque no se detalla el alcance.
- Capacidades multilingües limitadas a coreano e inglés según los metadatos.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que indica que puede servirse mediante infraestructuras de inferencia estándar.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se especifican capacidades matemáticas o de código más allá de lo que un modelo de 12B pueda ofrecer de forma genérica.

## Casos de uso

- Asistencia conversacional en coreano: el modelo puede gestionar diálogos multi-turno en coreano, aprovechando su ajuste instruccional para tareas de atención al usuario en ese idioma, aunque la ventana de contexto no está documentada.
- Documentación y terminología de defensa: dado el tag "defense", puede emplearse para redactar, resumir o clasificar textos técnicos del ámbito de la defensa en coreano e inglés, siempre con revisión humana por la falta de benchmarks.
- Despliegue local en hardware de consumo: con cuantizaciones desde 4,9 GB (Q2_K) hasta 12,6 GB (Q8_0), es viable ejecutarlo en GPUs de gama alta para consumidores o incluso en CPU con llama.cpp, lo que facilita prototipado sin infraestructura cloud.
- Traducción asistida coreano-inglés: aunque no está declarado como modelo de traducción, su bilingüismo permite usarlo como apoyo en tareas de traducción técnica con supervisión.
- Investigación sobre adaptación de dominio: útil para estudiar cómo un modelo de 12B ajustado a un dominio específico (defensa) rinde en tareas generales, comparándolo con su base.
- Integración en pipelines de inferencia locales: al ser GGUF compatible con llama.cpp, Ollama y servidores compatibles con endpoints, puede integrarse en flujos de trabajo offline o en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ≈ 4,9 GB; Q3_K_S ≈ 5,6 GB; Q3_K_M ≈ 6,1 GB; Q3_K_L ≈ 6,6 GB; IQ4_XS ≈ 6,7 GB; Q4_K_S ≈ 7,0 GB; Q4_K_M ≈ 7,4 GB; Q5_K_S ≈ 8,3 GB; Q5_K_M ≈ 8,5 GB; Q6_K ≈ 9,8 GB; Q8_0 ≈ 12,6 GB. Añadir overhead de contexto y KV cache según la ventana utilizada (no documentada).
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite ejecutar Q8_0 con contexto amplio; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) cubren Q4-Q5 con holgura; GPUs de 8 GB pueden ejecutar Q2_K-Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones desde Q2_K hasta Q6_K; Q8_0 requiere 12-16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints GGUF (p. ej., llama-cpp-python, text-generation-webui); vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kordef-12b-GGUF | ≈11,77B | no disponible | ko, en | gemma | GGUF |
| Gemma 2 9B (referencia de familia) | ≈9B | 8K (típico) | multilingüe | gemma | safetensors, GGUF |
| Qwen2.5 14B | ≈14B | 32K (típico) | multilingüe | Apache 2.0 (mayoría de variantes) | safetensors, GGUF |
| Llama 3.1 8B | ≈8B | 128K | multilingüe | Llama 3.1 Community | safetensors, GGUF |

La comparación es orientativa: no se dispone de benchmarks de kordef-12b que permitan contrastar rendimiento real frente a estas alternativas. Su principal diferenciador es la adaptación al dominio de defensa y al coreano, mientras que modelos como Qwen2.5 o Llama 3.1 ofrecen contextos documentados mucho mayores y licencias más permisivas para uso comercial.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden identificar sesgos lingüísticos, culturales o de dominio.
- Riesgo de alucinación: inherente a los modelos de 12B, agravado por la falta de evaluación y por su especialización en un dominio técnico donde los errores pueden ser costosos.
- Contexto no documentado: se desconoce la ventana máxima, lo que impide planificar tareas de contexto largo con garantías.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de la Gemma Terms of Use antes de un despliegue en producción.
- Cuantizaciones estáticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas, lo que puede suponer una pérdida de calidad algo mayor en las variantes pequeñas (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- Modelo derivado: la calidad final depende del modelo base graphuser/kordef-12b, cuya documentación es igualmente escasa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/kordef-12b-GGUF
- Modelo base: https://huggingface.co/graphuser/kordef-12b
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#kordef-12b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
