# mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF` es un conjunto de cuantizaciones GGUF del modelo `p-e-w/Qwen3.5-4B-heretic-2.0`, un derivado de la familia Qwen3.5 de 4B parámetros con un proceso de "abliteration" (eliminación de rechazos) conocido como *heretic*. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source, y el modelo base procede del usuario p-e-w.

El modelo está pensado para ejecutarse en local mediante llama.cpp o cualquier runtime compatible con GGUF, ofreciendo versiones desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y consumo de memoria. Al tratarse de un modelo "heretic", se ha modificado para reducir los comportamientos de rechazo ante peticiones consideradas sensibles, lo que lo hace interesante para investigación sobre alineación y para aplicaciones donde los filtros por defecto resultan demasiado restrictivos.

La información pública disponible es muy escasa: no hay model card descriptiva, no se declaran idiomas ni licencia, y no se han publicado benchmarks. Los datos técnicos disponibles se limitan al identificador del modelo, el número de tensores del repositorio safetensors original (1.797.272 entradas, no parámetros del modelo) y la lista de cuantizaciones generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, sin confirmar detalles) |
| Parametros totales | 4B (según el nombre del modelo; el dato 1.797.272 corresponde a entradas de safetensors, no a parámetros) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Qwen3.5-4B-heretic-2.0`. Por el nombre se infiere que deriva de la familia Qwen3.5 con aproximadamente 4.000 millones de parámetros, pero no se confirman detalles como número de capas, dimensión oculta, atención (GQA/MHA), tipo de tokenizador ni longitud de contexto nativa.

El proceso "heretic" implica típicamente una modificación de los pesos orientada a reducir la probabilidad de respuestas de rechazo, habitualmente mediante técnicas de abliteration (proyección ortogonal de direcciones de rechazo en los pesos) o ajuste fino dirigido. No se documenta en la información disponible qué método exacto se aplicó, ni el dataset de entrenamiento, ni si hubo RLHF/DPO. Las cuantizaciones publicadas por mradermacher se generan con llama.cpp usando cuantización con imatrix (matriz de importancia), según indican las etiquetas de la model card.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-4B (no verificadas en esta ficha).
- Comportamiento "heretic": menor tendencia a rechazar peticiones que el modelo original, orientado a investigación y usos con filtros propios.
- Ejecución local en CPU y GPU mediante llama.cpp y runtimes compatibles con GGUF.
- Posible soporte multilingüe heredado del modelo base, aunque no se declara en la información disponible.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: comparar las respuestas del modelo heretic con las del Qwen3.5-4B original para estudiar cómo cambia la distribución de rechazos y la calidad general tras la modificación de pesos.
- Despliegue en local con hardware modesto: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 4B en equipos de consumo, útil para prototipos y pruebas offline.
- Generación de texto creativo sin filtros por defecto: escritura de ficción, guiones o narrativa donde los filtros estándar pueden resultar limitantes, siempre con revisión humana.
- Experimentación con pipelines de inferencia GGUF: probar llama.cpp, Ollama u otros runtimes con distintas cuantizaciones (de IQ1_S a Q6_K) para medir el impacto de la cuantización en calidad y velocidad.
- Evaluación comparativa de cuantizaciones: usar el amplio conjunto de quants publicados para estudiar la degradación de perplexity y coherencia según el nivel de compresión.
- Base para fine-tuning o destilación: partir de un modelo sin fuertes sesgos de rechazo para tareas de ajuste específicas donde los filtros del modelo base interfieren con el dominio (por ejemplo, análisis de contenido sensible en entornos controlados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para un modelo de 4B en GGUF: aproximadamente 1,5-2 GB en IQ1/IQ2, 2,5-3 GB en Q4_K_M, 3,5-4 GB en Q6_K (estimación orientativa; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones medias; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 6 GB o más usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF | 4B (según nombre) | no disponible | no disponible | GGUF | Cuantizaciones de un modelo abliterated |
| p-e-w/Qwen3.5-4B-heretic-2.0 | 4B (según nombre) | no disponible | no disponible | safetensors | Modelo base del que derivan los GGUF |
| Qwen3.5-4B (original) | 4B | no disponible | no disponible en esta ficha | safetensors/GGUF | Modelo sin modificar; referencia para comparar el efecto heretic |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La modificación "heretic" reduce los rechazos, lo que aumenta el riesgo de generar contenido dañino, ofensivo o inexacto; requiere filtros y supervisión propios en producción.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal hasta verificar la licencia del modelo base y del derivado.
- No hay model card descriptiva: se desconoce el dataset de entrenamiento, los idiomas soportados y el contexto máximo real.
- Al ser un modelo de 4B, la capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos mayores; riesgo de alucinación elevado.
- Las cuantizaciones de baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; para uso serio conviene Q4_K_M o superior.
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria del funcionamiento.
- El dato "1.797.272 parámetros" del repositorio safetensors no es coherente con un modelo de 4B y probablemente corresponde a entradas de tensor, no a parámetros; no debe citarse como tamaño del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF
- Modelo base: https://huggingface.co/p-e-w/Qwen3.5-4B-heretic-2.0
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
