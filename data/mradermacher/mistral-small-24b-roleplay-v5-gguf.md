# mradermacher/Mistral-Small-24B-Roleplay-V5-GGUF

## Resumen

Mistral-Small-24B-Roleplay-V5-GGUF es una distribución de cuantizaciones estáticas en formato GGUF del modelo burew/Mistral-Small-24B-Roleplay-V5, generada por el usuario mradermacher. El modelo subyacente es un ajuste fino de Mistral Small 24B orientado a roleplay conversacional, con 23.572.403.200 parámetros totales según los pesos en safetensors del repositorio. La contribución de este repositorio no es el modelo en sí, sino la conversión a formatos GGUF de 2 a 8 bits para su uso con llama.cpp y derivados.

El interés práctico reside en que permite ejecutar un modelo de aproximadamente 24B parámetros en hardware de consumo mediante cuantizaciones de 4 bits (13,6-14,4 GB), manteniendo la naturaleza conversacional y de roleplay del ajuste original. Al estar etiquetado como `endpoints_compatible` y `conversational`, está pensado para su despliegue en entornos de inferencia compatibles con la API de transformers y con servidores de inferencia locales.

La información disponible es limitada: no se especifican detalles sobre el dataset de entrenamiento del modelo base, la longitud de contexto efectiva ni la licencia. El repositorio tiene 86 descargas y 0 likes en el momento de la consulta, lo que indica una adopción baja y escasa validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Mistral Small 24B; arquitectura transformer decoder-only presumible, no confirmada en la información) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |
| Tamano del repositorio | 161,4 GB |
| Modelo base | burew/Mistral-Small-24B-Roleplay-V5 |
| Cuantizador | mradermacher |
| Fecha de creación | 2025-09-06 |
| Última actualización | 2026-11-24 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base burew/Mistral-Small-24B-Roleplay-V5 en la documentación proporcionada. Por el nombre y el número de parámetros (23,57B), se trata presumiblemente de un ajuste fino de Mistral Small 24B, pero no se confirma en la model card ni en los metadatos. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado.

La única información técnica concreta del repositorio es el proceso de cuantización: se han generado cuantizaciones estáticas (no ponderadas por imatrix, según indica el autor) en 11 variantes de 2 a 8 bits. El autor señala explícitamente que las cuantizaciones con imatrix "parecen no estar disponibles por mi parte en este momento" y que, si no aparecen en una semana tras las estáticas, probablemente no las haya planificado. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) más allá de las inherentes al modelo base.

## Capacidades

- Generación de texto conversacional en inglés, orientada específicamente a roleplay y diálogo multi-turno según el nombre del ajuste.
- Conversación multi-turno con mantenimiento de personaje o rol, presumiblemente reforzado en el ajuste fino (no verificado con benchmarks).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags), lo que facilita su integración en servidores compatibles con la API de transformers.
- Soporte de cuantizaciones de 2 a 8 bits para despliegue en hardware heterogéneo.
- Capacidades de tool calling, function calling, agentes, razonamiento matemático, visión o audio: no disponibles o no documentadas en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`; no se documentan otros idiomas.

## Casos de uso

- Roleplay conversacional local: el modelo está ajustado específicamente para mantener personajes y diálogos multi-turno, y las cuantizaciones Q4_K_M (14,4 GB) permiten ejecutarlo en GPUs de consumo con 16 GB de VRAM, ideal para prototipos de chatbots de rol sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en inglés: gracias a la compatibilidad con endpoints, puede desplegarse tras una API compatible con transformers para validar flujos de conversación antes de migrar a un modelo mayor o con licencia clara.
- Investigación sobre ajuste fino y cuantización: al ser una cuantización de un ajuste comunitario, sirve para estudiar cómo afectan las distintas cuantizaciones (Q2_K a Q8_0) a la coherencia y consistencia de personaje en tareas de roleplay.
- Generación de narrativa interactiva: el ajuste orientado a rol es adecuado para motores de ficción interactiva o videojuegos narrativos donde el modelo mantiene el tono y la voz de un personaje a lo largo de sesiones largas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantización del mismo modelo, lo que permite medir empíricamente el compromiso entre tamaño, velocidad y calidad en una tarea concreta (roleplay) con hardware controlado.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten ejecutar un modelo de ~24B en GPUs de 12 GB o en configuraciones con offloading parcial a CPU, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~9,0 GB; Q3_K_S ~10,5 GB; Q4_K_S ~13,6 GB; Q4_K_M ~14,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 4080 (16 GB) con margen ajustado; para Q6_K y Q8_0, A100 40 GB, H100 o RTX 4090 con contexto corto.
- ¿Cabe en GPU de consumo? Sí: Q4_K_S y Q4_K_M caben en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 5070 Ti); Q3_K_S y Q2_K caben en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (koboldcpp, text-generation-webui). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo transformers, aunque para GGUF el motor natural es llama.cpp.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto, no documentados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mistral-Small-24B-Roleplay-V5-GGUF (este) | 23,57B | no disponible | GGUF (2-8 bits) | no disponible | Ajuste comunitario de roleplay, solo inglés |
| Mistral Small 24B (oficial) | ~24B | no disponible en esta ficha | safetensors, GGUF (comunidad) | Apache 2.0 (según versión oficial; no confirmado aquí) | Modelo base generalista; el ajuste de roleplay parte presumiblemente de él |
| Modelos de roleplay 7-13B (p. ej. ajustes comunitarios de Llama/Mistral) | 7-13B | variable | GGUF | variable | Menor tamaño, menor calidad potencial pero menor requisito de VRAM |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, formato y licencia, y en el caso del modelo oficial Mistral Small la licencia no está confirmada en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base burew/Mistral-Small-24B-Roleplay-V5 antes de cualquier despliegue en producción.
- Solo inglés: el campo `language: en` indica soporte únicamente en inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se especifica la ventana de contexto del modelo base, lo que impide planificar conversaciones largas con garantías.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de roleplay, por lo que la calidad real del ajuste no está verificada.
- Riesgo de alucinación: inherente a los modelos generativos; en roleplay el riesgo se manifiesta como inconsistencia de personaje o invención de hechos dentro de la narrativa.
- Adopción muy baja (86 descargas, 0 likes): escasa validación comunitaria; no hay evidencia de que el ajuste sea estable o de calidad contrastada.
- Cuantizaciones estáticas sin imatrix: el autor indica que las variantes ponderadas por imatrix no están disponibles, lo que puede suponer una pérdida de calidad algo mayor en bits bajos (Q2_K, Q3_K) frente a alternativas imatrix.
- Sesgos: no documentados; al ser un ajuste de roleplay sin información sobre el dataset, no se puede evaluar qué sesgos puede haber introducido el ajuste fino.
- Repositorio de 161,4 GB: descargar el conjunto completo de cuantizaciones requiere espacio considerable; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-Small-24B-Roleplay-V5-GGUF
- Modelo base: https://huggingface.co/burew/Mistral-Small-24B-Roleplay-V5
- Página de descargas del cuantizador: https://hf.tst.eu/model#Mistral-Small-24B-Roleplay-V5-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
