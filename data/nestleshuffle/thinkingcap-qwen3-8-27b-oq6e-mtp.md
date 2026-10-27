# Nestleshuffle/ThinkingCap-Qwen3.8-27B-oQ6e-mtp

## Resumen

ThinkingCap-Qwen3.8-27B-oQ6e-mtp es una cuantización de 6 bits en formato MLX del modelo ThinkingCap-Qwen3.8-27B, un ajuste fino de BottleCap AI sobre Qwen3.8-27B (Qwen Team, 2026) orientado a reducir la verbosidad de razonamiento sin perder precisión. El trabajo original recorta los tokens de pensamiento un 37 % de media (rango del 11 % al 66 % según el benchmark) manteniendo una precisión media del 85,8 % frente al 86,6 % del modelo base. Esta versión concreta no la publica BottleCap AI, sino el usuario independiente Nestleshuffle, mediante la herramienta oQ de oMLX v0.6.4 con cuantización mixta.

El modelo cuenta con 27.781.427.952 parámetros reales según los safetensors del repositorio, que ocupa 23,7 GB. La arquitectura declarada es `qwen3_5` y el pipeline es `image-text-to-text`, por lo que hereda capacidades multimodales de visión del modelo base, además de conversación y razonamiento. El sufijo `mtp` del nombre no aparece documentado en la model card.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 27B con ventana de contexto larga en Apple Silicon con un consumo de memoria bastante contenido; por el otro, la reducción de tokens de pensamiento abarata y acelera la inferencia en cargas de razonamiento. Ahora bien, se trata de una cuantización comunitaria sin descargas ni validación pública en el momento de redactar esta ficha, y las cifras de benchmark publicadas corresponden al modelo original sin cuantizar, no a esta versión de 6 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (según la model card); no se documenta si es denso o MoE |
| Parámetros totales | 27.781.427.952 (dato real de los safetensors) |
| Parámetros activos | No disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 6 bits, group size 64, cuantización mixta oQ (oMLX v0.6.4); no se publican otras variantes en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | PolyForm Small Business 1.0.0 (`license: other`), con acceso restringido mediante solicitud |
| Formato de pesos | MLX safetensors (23,7 GB en el repositorio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base: únicamente se declara el tipo `qwen3_5`, con 27,78 mil millones de parámetros y un pipeline multimodal de imagen-texto a texto. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o aprendizaje por refuerzo sobre razonamiento. El modelo original Qwen3.8-27B lo desarrolla el Qwen Team (2026) y ThinkingCap es un ajuste fino posterior de BottleCap AI centrado en eficiencia de razonamiento.

La innovación declarada por BottleCap AI es la reducción de tokens de pensamiento: un 37 % de media, con un rango de entre el 11 % y el 66 % según el benchmark, manteniendo una precisión media del 85,8 % frente al 86,6 % del modelo base. En tareas de recuperación en contexto largo el recorte es del 39 % con una mejora de 2,3 puntos porcentuales, lo que sugiere que el ajuste no solo acorta el razonamiento, sino que lo hace más selectivo cuando el contexto es extenso. Esta versión de Nestleshuffle aplica encima una cuantización mixta de 6 bits con group size 64 mediante oQ (oMLX v0.6.4), que asigna precisión por capas en lugar de aplicar un único esquema uniforme; no se publica el mapa de bits por capa ni el error de reconstrucción introducido.

## Capacidades

- Razonamiento con modo de pensamiento (`thinking`): genera cadenas de razonamiento explícitas, optimizadas para consumir menos tokens que el modelo base.
- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), heredado del pipeline declarado; el grado de soporte visual no está documentado.
- Razonamiento científico y de conocimiento experto: el modelo original reporta resultados en GPQA-Diamond y MMLU-Pro.
- Recuperación en contexto largo: el ajuste original reporta una mejora de 2,3 puntos porcentuales con un 39 % menos de tokens de razonamiento en esta tarea.
- Tareas agénticas: la model card del modelo base menciona explícitamente tareas "challenging and agentic" como objetivo del ajuste.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; el tag de idiomas no está cumplimentado.
- Capacidades de audio o vídeo: no documentadas.

## Casos de uso

- Asistente de razonamiento local en Apple Silicon: con 23,7 GB de pesos en 6 bits, el modelo cabe en un Mac con 32 GB de memoria unificada, lo que permite desplegar un 27B con razonamiento explícito sin enviar datos a la nube; adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentación técnica con capturas de pantalla: al declarar pipeline `image-text-to-text`, puede emplearse para interpretar diagramas de arquitectura o capturas de paneles junto con texto de soporte, aunque la calidad visual no está validada para esta cuantización.
- Recuperación sobre bases de código o corpus largos: el ajuste base mejora la recuperación en contexto largo recortando un 39 % los tokens de pensamiento, lo que reduce el coste por consulta en pipelines RAG con contextos extensos.
- Prototipado de investigación en eficiencia de razonamiento: útil como punto de comparación frente al modelo sin cuantizar para medir la degradación introducida por 6 bits en tareas de cadena de pensamiento larga.
- Reducción de coste en inferencia de razonamiento: si se valida la pérdida de precisión, el recorte del 37 % de tokens de pensamiento se traduce directamente en menor latencia y menor consumo energético por consulta en despliegues locales.
- Evaluación comparativa de cuantizaciones: el repositorio sirve para contrastar el esquema mixto oQ de 6 bits frente a alternativas de 4 y 8 bits sobre el mismo modelo base, midiendo precisión y perplejidad.
- Generación de borradores técnicos y resúmenes: uso conversacional general con razonamiento visible para tareas de documentación, siempre que se revise la salida por riesgo de alucinación.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo ThinkingCap-Qwen3.8-27B original, no a esta cuantización de 6 bits. No se han publicado resultados de benchmarks de esta versión cuantizada en la información disponible.

| Benchmark | Precisión base | Precisión ThinkingCap | Tokens de pensamiento base | Tokens ThinkingCap | Reducción |
|---|---|---|---|---|---|
| GPQA-Diamond | 89,93 ± 0,70 | 88,04 ± 1,09 | 12.772 | 7.267 | 43,1 % |
| Media agregada (todos los benchmarks) | 86,6 % | 85,8 % | No disponible | No disponible | 37 % (rango 11 %-66 %) |
| Recuperación en contexto largo | No disponible | +2,3 pp sobre la base | No disponible | No disponible | 39 % |
| MMLU-Pro | Dato truncado en la información disponible | Dato truncado | No disponible | No disponible | No disponible |

## Requisitos de hardware

- Pesos en disco: 23,7 GB para esta cuantización de 6 bits (frente a unos 55,6 GB estimados en BF16 para 27,78 B de parámetros).
- VRAM o memoria unificada estimada para inferencia: en torno a 24-26 GB solo para pesos y estados de ejecución; con caché KV para contextos largos conviene partir de 32 GB y subir a 48-64 GB si se trabaja con ventanas muy extensas. Estimación calculada a partir del tamaño del repositorio, no medida.
- GPU compatibles: al ser MLX, el destino nativo es Apple Silicon (series M1 a M4, en variantes Pro, Max y Ultra). No hay soporte CUDA en este formato.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 32 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); en configuraciones de 24 GB el margen es muy ajustado. No cabe en GPUs de consumo con 8-16 GB de VRAM sin reconvertir a otro formato y cuantización.
- Opciones de despliegue: `mlx-lm` y `mlx-vlm` para inferencia y servidor local; oMLX, la herramienta que generó la cuantización, como runtime de referencia; LM Studio en versiones con soporte MLX. vLLM, TGI, llama.cpp y Ollama no cargan safetensors MLX de forma nativa: requerirían partir del modelo original sin cuantizar y generar GGUF u otro formato.
- Latencia y throughput: no disponibles; no se publican mediciones para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nestleshuffle/ThinkingCap-Qwen3.8-27B-oQ6e-mtp | 27,78 B | No disponible | 6 bits oQ, MLX safetensors | PolyForm Small Business 1.0.0 | Acceso restringido; 0 descargas y 0 likes en el momento de la consulta |
| bottlecapai/ThinkingCap-Qwen3.8-27B | 27,78 B (derivado) | No disponible | No disponible (modelo de referencia sin cuantizar) | PolyForm Small Business 1.0.0 | Acceso restringido mediante solicitud |
| Qwen/Qwen3.8-27B | 27,78 B (no confirmado en la información disponible) | No disponible | No disponible | No disponible | Público según el enlace de la model card |
| Otras familias de ~24-30 B (Gemma 3 27B, Mistral Small 24B) | No disponible | No disponible | No disponible | No disponible | No disponible |

Frente al modelo base sin cuantizar, esta versión reduce el espacio en disco y memoria aproximadamente a un 43 % del tamaño en BF16, a cambio de una degradación de calidad no medida. Frente a Qwen3.8-27B, ThinkingCap cambia precisión por eficiencia de tokens: cede 0,8 puntos porcentuales de media y 1,9 puntos en GPQA-Diamond para recortar un 37 % el razonamiento. No se dispone de datos que permitan comparar con otras familias de tamaño similar.

## Limitaciones y advertencias

- Cuantización comunitaria sin validación: el repositorio lo publica un usuario independiente (Nestleshuffle), no BottleCap AI, y no presenta benchmarks propios. La degradación real por 6 bits es desconocida.
- Los resultados de GPQA-Diamond, MMLU-Pro y el agregado del 85,8 % corresponden al modelo original sin cuantizar; extrapolarlos a esta versión no está justificado.
- La cuantización mixta oQ asigna precisión desigual por capas; sin el mapa de bits publicado no se puede saber qué componentes quedaron por debajo de 6 bits.
- El sufijo `mtp` del nombre del repositorio no está explicado en la model card; no debe asumirse ninguna capacidad técnica a partir de él.
- El acceso es restringido: requiere aceptar las condiciones y rellenar un formulario en el repositorio del modelo base, con campos de empresa y correo corporativo.
- Licencia PolyForm Small Business 1.0.0: permite uso comercial solo a organizaciones que cumplan los umbrales de pequeña empresa definidos en el texto de la licencia; fuera de ellos se necesita licencia comercial. Revisar el fichero LICENSE antes de cualquier despliegue en producción.
- Dependencia de Apple Silicon: al estar en formato MLX, no se puede ejecutar en GPUs NVIDIA o AMD sin reconvertir desde el modelo original.
- Reducción de verbosidad de razonamiento: el recorte del 37 % de tokens puede penalizar problemas que requieren cadenas de pensamiento largas; el propio modelo cede 1,9 puntos en GPQA-Diamond.
- Riesgo de alucinación estándar en modelos de 27B con modo de pensamiento; no se documentan evaluaciones de factualidad ni de calibración.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni calidad por idioma.
- Capacidad visual declarada solo por el pipeline tag; no hay evaluación documentada de comprensión de imágenes en esta cuantización.
- Sin señales de adopción: 0 descargas y 0 likes, lo que impide estimar robustez frente a otros repositorios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nestleshuffle/ThinkingCap-Qwen3.8-27B-oQ6e-mtp
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de BottleCap AI sobre ThinkingCap Qwen3.8 27B: https://bottlecapai.com/post/thinkingcap-qwen3-8-27b/
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Demo en vídeo: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B/media/main/thinkingcap_demo.mp4
- Formulario de solicitud de acceso: https://docs.google.com/forms/d/e/1FAIpQLSdU8MyVP_mVx0_y55d6QCMXVyCKsQ6yg68KEqWm_EIptKB0Nw/viewform
