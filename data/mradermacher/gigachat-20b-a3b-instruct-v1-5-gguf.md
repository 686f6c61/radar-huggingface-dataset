# mradermacher/GigaChat-20B-A3B-instruct-v1.5-GGUF

## Resumen

GigaChat-20B-A3B-instruct-v1.5-GGUF es la versión cuantizada en formato GGUF del modelo GigaChat-20B-A3B-instruct-v1.5, desarrollado originalmente por el equipo ai-sage (vinculado a Sber). El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants estáticos para llama.cpp. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 20.589.299.712 parámetros totales y 3.000 millones de parámetros activos por token, según la nomenclatura "A3B" del nombre.

El modelo está orientado a conversación (instruct) y soporta ruso e inglés. Su licencia MIT facilita el uso comercial y la redistribución, algo poco habitual en modelos de esta escala procedentes de grandes laboratorios. Esta versión GGUF permite ejecutar el modelo en hardware de consumo y en entornos sin GPU dedicada mediante llama.cpp y derivados, lo que amplía enormemente su accesibilidad frente a los pesos originales en safetensors.

La relevancia actual radica en la combinación de una arquitectura MoE eficiente (solo activa ~3B parámetros por token) con una licencia permisiva y disponibilidad en múltiples niveles de cuantización, desde Q2_K (7,7 GB) hasta Q8_0 (22,0 GB). Esto lo convierte en una opción práctica para despliegues locales y para experimentación con modelos multilingües ruso-inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según nomenclatura A3B |
| Parámetros totales | 20.589.299.712 (20,59 B) |
| Parámetros activos | 3 B (según nomenclatura A3B del nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 20,59 mil millones de parámetros totales, de los cuales aproximadamente 3 mil millones se activan por token, según la designación "A3B". Esta configuración busca reducir el coste computacional de inferencia manteniendo una capacidad de representación propia de un modelo denso de mayor tamaño. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La versión aquí descrita es una cuantización estática realizada por mradermacher sobre los pesos originales de ai-sage. Según la model card, no se han publicado cuantizaciones ponderadas ni con imatrix para este modelo en el momento de la publicación. Las cuantizaciones estáticas cubren desde Q2_K hasta Q8_0, con recomendaciones explícitas del autor para Q4_K_S y Q4_K_M como opciones rápidas y Q6_K como buena relación calidad/tamaño. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional en ruso e inglés, orientada a instrucciones (instruct).
- Razonamiento y respuesta a preguntas en los dos idiomas soportados.
- Generación de código y tareas de matemáticas (capacidad esperable en modelos instruct de esta escala, aunque no se documenta explícitamente en la información disponible).
- Soporte de conversaciones multi-turno (pipeline conversacional).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia estándar.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking) en la información proporcionada.

## Casos de uso

- Asistente conversacional local en ruso: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo y gestionar diálogos multi-turno en ruso sin depender de servicios en la nube, gracias a su licencia MIT y a las cuantizaciones de 11-14 GB.
- Traducción y adaptación ruso-inglés: al estar entrenado en ambos idiomas, puede emplearse para traducción asistida, revisión de textos bilingües y generación de contenido en pares de idiomas ru-en en entornos con requisitos de soberanía de datos.
- Procesamiento de documentación técnica en inglés: con cuantización Q5_K_M o Q6_K, el modelo puede resumir, extraer información y reescribir documentación técnica, integrándose en pipelines de preprocesado mediante la API de llama.cpp.
- Prototipado rápido de aplicaciones de IA: la disponibilidad de GGUF permite a desarrolladores probar un MoE de 20B en portátiles con GPU de consumo (por ejemplo, RTX 4090 con Q4_K_M) antes de decidir un despliegue mayor.
- Investigación sobre eficiencia de MoE: al tener pesos cuantizados de distintos tamaños, es posible medir el impacto de la cuantización en la calidad de un MoE ruso-inglés y comparar con variantes densas de tamaño similar.
- Despliegue en entornos aislados (air-gapped): la licencia MIT y el formato GGUF facilitan su uso en organizaciones que no pueden enviar datos a APIs externas, como administraciones públicas o empresas con requisitos de confidencialidad.
- Generación de contenido editorial en ruso: redacción de borradores, variaciones de texto y adaptación de tono en publicaciones, con revisión humana posterior dada la naturaleza generativa del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximando pesos + overhead de contexto):
  - Q2_K: ~8 GB
  - Q3_K_M: ~10-11 GB
  - Q4_K_S / Q4_K_M: ~12-13 GB
  - Q5_K_M: ~15 GB
  - Q6_K: ~17-18 GB
  - Q8_0: ~22-23 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M a Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; A100/H100 para despliegues de mayor concurrencia o contexto largo.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en tarjetas de 16-24 GB; Q8_0 requiere 24 GB o reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors, transformers con aceleración por GPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al activar solo ~3B parámetros por token, se espera un throughput superior al de un modelo denso de 20B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GigaChat-20B-A3B-instruct-v1.5 (este) | 20,59 B | ~3 B | no disponible | MIT | GGUF, safetensors |
| GigaChat-20B-A3B-instruct (versión previa) | 20 B (aprox.) | ~3 B | no disponible | no disponible en la información | GGUF |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas limitados a ruso e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente con datos rusos e ingleses puede reflejar sesgos culturales y lingüísticos de esas fuentes.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o superior para uso práctico.
- No se documenta soporte de tool calling ni de agentes; integraciones que dependan de function calling requerirán validación previa.
- La licencia MIT del repositorio de cuantización se aplica a los pesos derivados; conviene verificar las condiciones del modelo base ai-sage/GigaChat-20B-A3B-instruct-v1.5 antes de un uso comercial a gran escala.
- El repositorio tiene un tamaño de 140,1 GB, por lo que la descarga completa requiere espacio en disco considerable; es preferible descargar solo la cuantización necesaria.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/GigaChat-20B-A3B-instruct-v1.5-GGUF
- Modelo base: https://huggingface.co/ai-sage/GigaChat-20B-A3B-instruct-v1.5
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#GigaChat-20B-A3B-instruct-v1.5-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Versión previa del modelo cuantizado: https://huggingface.co/mradermacher/GigaChat-20B-A3B-instruct-GGUF
