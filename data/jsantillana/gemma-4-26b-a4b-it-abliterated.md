# jsantillana/gemma-4-26B-A4B-it-abliterated

## Resumen

`jsantillana/gemma-4-26B-A4B-it-abliterated` es una variante "abliterated" (con las direcciones de rechazo eliminadas por proyección ortogonal) del modelo `google/gemma-4-26B-A4B-it` de Google. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 25.805.933.872 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (según la nomenclatura A4B del nombre), distribuido en 128 expertos enrutados por capa. El autor de la modificación es el usuario de Hugging Face `jsantillana`, que publica la versión v3 bajo licencia Apache 2.0.

El objetivo del modelo es ofrecer una variante sin el comportamiento de rechazo del modelo base, manteniendo las capacidades de razonamiento, conversación y multimodalidad del original. La v3 introduce una "Multilingual Subspace Orthogonalization (Rank 3)" que elimina dimensiones de rechazo tanto para peticiones imperativas en inglés como en español, un "Thought-Channel Alignment" que neutraliza el bucle interno de comprobación de políticas al inicio del canal `<|channel|>thought`, cobertura completa de las capas 10 a 29 y proyección sobre los 128 expertos enrutados de cada capa con compensación de escala GemmaRMSNorm.

Es relevante ahora porque combina tres tendencias: la familia Gemma 4 de Google con arquitectura MoE eficiente (4B activos sobre 26B totales), el soporte multimodal y de razonamiento del modelo base, y la práctica del "abliteration" orientada a red-teaming, ciberseguridad y evaluación de sesgos. El modelo está etiquetado para inglés y español, con 867 descargas y 1 like en el momento de la consulta, y un repositorio de 201,9 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 128 expertos enrutados por capa, GemmaRMSNorm |
| Parametros totales | 25.805.933.872 (≈25,8B) |
| Parametros activos | ≈4B (según nomenclatura A4B; no confirmado en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 128 expertos enrutados por capa y un total de 25.805.933.872 parámetros, de los cuales se activan aproximadamente 4B por token (la nomenclatura "A4B" del identificador así lo indica). El autor de la variante abliterated indica que la ablación se aplicó sobre las capas 10 a 29 (las 20 capas del bloque central), con proyección ortogonal de rango 3 para eliminar dimensiones de rechazo en inglés y español simultáneamente, y con compensación de escala GemmaRMSNorm $(1.0 + \gamma)$ sobre los 128 expertos enrutados de cada capa. También se realizó un "Thought-Channel Alignment" sondeando activaciones al inicio del canal `<|channel|>thought` para neutralizar el borrador interno de rechazo sin degradar el razonamiento.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. La variante abliterated no reentrena el modelo: aplica modificaciones sobre los pesos del modelo base mediante proyección de direcciones de rechazo. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español.
- Razonamiento con modo "thinking" mediante el canal `<|channel|>thought` del modelo base.
- Capacidades multimodales heredadas del modelo base `gemma-4-26B-A4B-it` (etiqueta "multimodal" en la model card).
- Comportamiento sin rechazo ("uncensored") para peticiones imperativas en inglés y español, según el autor.
- Uso previsto en red-teaming, ciberseguridad y evaluación de sesgos (etiquetas del autor).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Capacidades de código y matemáticas: no documentadas en la información proporcionada.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo permite generar respuestas sin las barreras de rechazo del modelo base, lo que facilita probar la robustez de filtros, clasificadores de seguridad y sistemas de moderación frente a peticiones adversarias en inglés y español.
- Evaluación de sesgos y alineación: al eliminar las direcciones de rechazo, sirve para estudiar qué comportamientos quedan expuestos y comparar con el modelo base en tareas de análisis de sesgo y de política de contenido.
- Investigación en ciberseguridad ofensiva y defensiva: la etiqueta "cybersecurity" del autor sugiere su uso en entornos controlados para generar y analizar descripciones de vulnerabilidades, siempre dentro de un marco autorizado y legal.
- Experimentación multilingüe inglés-español: la proyección de rango 3 cubre ambos idiomas, lo que permite estudiar diferencias de comportamiento entre peticiones en inglés y en español sobre el mismo modelo.
- Análisis de razonamiento con modo thinking: el "Thought-Channel Alignment" preserva el canal `<|channel|>thought`, útil para investigar cadenas de razonamiento internas y su relación con las decisiones de rechazo.
- Despliegue en investigación académica con recursos moderados: al ser MoE con ~4B parámetros activos, la inferencia es más barata que un denso de 26B, lo que facilita su uso en laboratorios con GPUs de gama alta consumer o profesional.
- Generación de texto conversacional en español para prototipos internos: el modelo declara soporte de español y puede usarse en entornos de investigación donde se acepte el riesgo de contenido sin filtrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numéricas con el modelo base u otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un MoE de ~25,8B parámetros totales requiere alojar todos los pesos; en FP16 serían ~51,6 GB, en BF16 ~51,6 GB, en INT8 ~25,8 GB y en INT4 ~12,9 GB. Estas cifras son estimaciones a partir del número de parámetros y no están confirmadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un despliegue en FP16 requeriría GPUs con ≥48-80 GB (A100 80GB, H100 80GB, o múltiples GPUs). En cuantización INT4 podría caber en una RTX 4090 de 24 GB, pero no está confirmado.
- ¿Cabe en consumer GPU?: posible en cuantización agresiva (INT4) en GPUs de 24 GB como la RTX 4090, según estimación por parámetros; no confirmado por el autor.
- Opciones de despliegue: el repo solo publica safetensors; no se listan GGUF, Ollama ni cuantizaciones listas. Para vLLM, TGI o llama.cpp habría que convertir los pesos, y no se documenta compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsantillana/gemma-4-26B-A4B-it-abliterated | 25,8B | ≈4B (MoE) | no disponible | Apache 2.0 | Hugging Face, safetensors |
| google/gemma-4-26B-A4B-it (base) | 25,8B | ≈4B (MoE) | no disponible | Apache 2.0 (según la variante) | Hugging Face |
| Otras variantes abliterated de la familia Gemma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta variante y el modelo base ni con otras alternativas. La comparación se limita a parámetros, licencia y formato de pesos.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el comportamiento de rechazo; puede generar contenido dañino, ilegal o inseguro sin las salvaguardas del modelo base. No es apto para producción orientada a usuarios finales sin filtros externos.
- Riesgo elevado de alucinación y de respuestas incorrectas en dominios sensibles, especialmente al haberse neutralizado el bucle interno de comprobación de políticas.
- La ablación se aplicó sobre capas 10 a 29 y sobre los 128 expertos enrutados; no se documenta una evaluación exhaustiva del impacto en otras capacidades (código, matemáticas, multimodalidad).
- Idiomas declarados: solo inglés y español. El rendimiento en otros idiomas no está garantizado.
- Longitud de contexto no documentada; no se puede asumir la del modelo base sin confirmación.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni guías de despliegue; el repo de 201,9 GB en safetensors requiere infraestructura considerable para su conversión y servicio.
- Modelo con muy poca tracción (867 descargas, 1 like) y sin validación independiente conocida; tratarlo como experimental.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos web, hereda los sesgos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
