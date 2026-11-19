# mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF es una cuantización en formato GGUF del modelo Qwopus3.5-9B-Coder-UNCENSORED-heretic, publicada por el usuario mradermacher en Hugging Face. Se trata de un modelo de lenguaje conversacional de aproximadamente 9.200 millones de parámetros, orientado a generación de código y con las restricciones de alineación eliminadas (etiquetas "UNCENSORED" y "heretic"), lo que indica que el autor original ha aplicado técnicas de ablación o fine-tuning para reducir los rechazos y el filtrado de contenido.

El repositorio contiene únicamente pesos cuantizados en GGUF generados con imatrix y pesos ponderados, lo que permite su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles. El tamaño del repositorio es de 13,9 GB y la fecha de creación es el 19 de noviembre de 2026. No se dispone de información sobre la licencia, los idiomas soportados ni la pipeline declarada en la model card del repositorio de cuantización.

La relevancia de esta ficha es limitada pero concreta: se trata de una variante de cuantización de un modelo derivado, no de un modelo original, por lo que la mayor parte de las especificaciones de arquitectura y entrenamiento deben inferirse del modelo base (Qwopus3.5-9B-Coder), del cual no se aportan datos técnicos en la información disponible. Cualquier evaluación rigurosa debería remitirse al repositorio original del modelo sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwopus3.5-9B-Coder, sin datos en la informacion proporcionada) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwopus3.5-9B-Coder en la documentación proporcionada. Por el nombre y el tamaño (9,2 B de parámetros) se trata presumiblemente de un transformer decoder-only derivado de la familia Qwen, pero este dato no está confirmado en la información disponible y no debe asumirse como verificado.

Respecto al entrenamiento, la model card del repositorio de cuantización no incluye detalles sobre el corpus, el número de tokens, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. La etiqueta "heretic" sugiere la aplicación de técnicas de ablación de direcciones de rechazo (refusal ablation) sobre el modelo alineado original, y "UNCENSORED" indica la eliminación de filtros de contenido, pero no se documenta el procedimiento concreto. Las cuantizaciones se han generado con el método i1 de mradermacher, que emplea una matriz de importancia (imatrix) para ponderar los tensores durante la cuantización.

## Capacidades

- Generación de texto conversacional en formato chat, según la etiqueta "conversational" del repositorio.
- Generación de código, indicado por el sufijo "Coder" en el nombre del modelo base.
- Reducción de rechazos y filtrado de contenido, según las etiquetas "UNCENSORED" y "heretic" (comportamiento no verificado empíricamente en la información disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el formato GGUF es desplegable en infraestructura de inferencia compatible.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 9,2 B en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, adecuado para prototipado y pruebas sin conexión.
- Asistencia de código en entornos aislados: al ser un modelo "Coder" cuantizado, puede integrarse en editores o pipelines locales para autocompletado y generación de fragmentos donde no se desea enviar código a servicios en la nube.
- Investigación sobre alineación y rechazo: la variante "heretic/UNCENSORED" permite estudiar el comportamiento del modelo tras la ablación de rechazos, comparándolo con el modelo base alineado en tareas de evaluación de seguridad.
- Despliegue en CPU con llama.cpp: las cuantizaciones de menor tamaño (Q2_K, IQ2_XXS) permiten ejecución en CPU con RAM moderada, útil para entornos sin GPU.
- Generación de texto conversacional offline: para aplicaciones de chat local sin requisitos de contexto largo ni tool calling.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de 20 variantes de cuantización, lo que permite medir la degradación de calidad frente al tamaño en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para 9,2 B de parámetros, las cuantizaciones Q4 rondan los 5-6 GB y las Q8 los 9-10 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de parámetros, las cuantizaciones Q4 podrían caber en GPUs de 8 GB o más, pero no hay verificación oficial.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, entre otros); la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue en producción.
- Modelo "UNCENSORED/heretic": la eliminación de rechazos implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de 9 B.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no documentada: limita la planificación de casos de uso con contexto largo.
- Es una cuantización, no el modelo original: las cuantizaciones de baja precisión (Q2, IQ2) degradan la calidad respecto al modelo en precisión completa; para evaluación rigurosa debe usarse el repositorio del modelo base.
- Sin métricas de uso: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.
- Fecha de creación futura (2026): la cronología del repositorio debe tratarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
