# mradermacher/CodePy-3B-Finetuned-GGUF

## Resumen

CodePy-3B-Finetuned-GGUF es la versión cuantizada en formato GGUF del modelo FBogaerts/CodePy-3B-Finetuned, un ajuste fino de 3.212.749.888 parámetros (aproximadamente 3,2 mil millones) orientado a generación de código y, de forma destacada, a la inyección controlada de vulnerabilidades en código con fines de seguridad y evaluación. El trabajo de cuantización lo firma mradermacher, un autor habitual en la distribución de pesos GGUF para llama.cpp y ecosistemas compatibles, y no el desarrollador original del modelo base.

La relevancia de este modelo no reside en su tamaño, sino en su especialización: los tags de la model card incluyen `vulnerability-injection`, `security` y `vaitp`, lo que lo sitúa como una herramienta para pipelines de evaluación de analizadores estáticos, SAST y formación en seguridad. El modelo base parte de una arquitectura transformer de 3,2 mil millones de parámetros con licencia MIT, lo que facilita su uso comercial y su integración en herramientas internas.

Esta ficha describe la versión GGUF, que ofrece 12 cuantizaciones estáticas desde Q2_K (1,5 GB) hasta f16 (6,5 GB), lo que permite desplegarlo en hardware de consumo. No se dispone de información publicada sobre la longitud de contexto, el dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base FBogaerts/CodePy-3B-Finetuned; detalles de capas y atención no disponibles) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (también existen pesos originales en transformers/safetensors en el repo del modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint FBogaerts/CodePy-3B-Finetuned, que a su vez se basa en un transformer de aproximadamente 3,2 mil millones de parámetros. La model card del repositorio GGUF no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, tokenizador) ni el proceso de entrenamiento del modelo base: no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. Tampoco se documenta ninguna innovación técnica como decodificación especulativa o atención lineal.

La única información técnica relevante sobre el proceso de cuantización es que mradermacher ha generado cuantizaciones estáticas (no ponderadas ni con imatrix) a partir de los pesos en formato Hugging Face, con `output_tensor_quantised: 1` y `quantize_version: 2`. El autor indica que las cuantizaciones ponderadas/imatrix no están disponibles en el momento de publicación y que podrían solicitarse mediante una discusión en la comunidad. La especialización declarada del modelo base es la generación de código con inyección de vulnerabilidades, lo que sugiere un ajuste fino sobre datos de código y ejemplos de parches de seguridad, aunque la composición exacta no está publicada.

## Capacidades

- Generación de texto y código en inglés, con especialización declarada en código Python y en la inyección deliberada de vulnerabilidades para pruebas de seguridad.
- Generación de código vulnerable controlado, útil para construir datasets de evaluación de analizadores estáticos y entrenar detectores de fallos.
- Conversación multi-turno (tag `conversational`), aunque sin datos publicados sobre calidad o longitud de contexto efectiva.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de analizadores estáticos (SAST): generar fragmentos de código con vulnerabilidades conocidas (inyección SQL, XSS, desbordamientos) para medir la tasa de detección de herramientas como Semgrep, CodeQL o SonarQube en un pipeline de CI.
- Construcción de datasets de seguridad: producir pares código vulnerable / código seguro para entrenar o evaluar modelos detectores de fallos y clasificadores de riesgo.
- Formación en seguridad de aplicaciones: generar ejemplos didácticos de código con fallos concretos para cursos y talleres, con la ventaja de que el modelo es pequeño y desplegable en local.
- Pruebas de robustez de linters y revisores automáticos: alimentar herramientas de revisión de código con entradas adversariales controladas y medir falsos negativos.
- Investigación en ingeniería de software: estudiar cómo los modelos de lenguaje introducen y propagan patrones inseguros en código generado, con un modelo de 3,2B ejecutable en una sola GPU.
- Prototipado local de asistentes de código: al caber en cuantizaciones de 1,5 a 2,1 GB, puede ejecutarse en portátiles con llama.cpp u Ollama para tareas de autocompletado y generación de fragmentos en entornos sin conexión.
- Generación de casos de prueba de seguridad en entornos aislados: crear repositorios de ejemplo con vulnerabilidades para validar reglas de detección antes de desplegarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB con Q2_K, 2,0-2,1 GB con Q4_K_S/Q4_K_M, 2,7 GB con Q6_K, 3,5 GB con Q8_0 y 6,5 GB con f16, según los tamaños de archivo publicados.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput. Para f16 se recomienda una GPU con 8 GB o más (RTX 3070/4060 Ti en adelante).
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más de VRAM usando Q4_K_M; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los pesos originales en transformers/safetensors pueden servirse con vLLM o TGI, aunque no se documentan configuraciones específicas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| CodePy-3B-Finetuned (este, GGUF) | 3,21B | no disponible | Código + inyección de vulnerabilidades | MIT | GGUF, safetensors |
| Qwen2.5-Coder-3B | 3,09B | 32K (según documentación pública del modelo) | Código general | Apache 2.0 | safetensors, GGUF |
| StarCoder2-3B | 3B | 16K (según documentación pública del modelo) | Código general | BigCode OpenRAIL-M | safetensors, GGUF |

La comparativa se limita a parámetros, contexto y licencia porque no hay benchmarks publicados para CodePy-3B en la información disponible. Frente a Qwen2.5-Coder-3B y StarCoder2-3B, la diferencia principal es la especialización en inyección de vulnerabilidades y la licencia MIT, más permisiva que la OpenRAIL-M de StarCoder2. No obstante, la falta de datos de rendimiento impide afirmar superioridad o inferioridad en tareas de código general.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para generar código vulnerable; usarlo en producción sin supervisión puede introducir fallos de seguridad reales.
- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad en generación de código, razonamiento o detección de vulnerabilidades.
- Riesgo de alucinación inherente a los modelos de 3B: puede generar APIs inexistentes, imports incorrectos o parches de seguridad que no compilan.
- La longitud de contexto no está documentada; no se recomienda asumir ventanas largas para análisis de repositorios completos.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad según las notas del propio autor ("lower quality" en Q3_K_M); para uso serio se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que limita la calidad máxima alcanzable en tamaños pequeños frente a otros modelos con ese tipo de cuantización.
- La licencia MIT del modelo base permite uso comercial, pero la responsabilidad legal del código vulnerable generado recae en el usuario; conviene aislar su uso en entornos de prueba.
- El modelo tiene muy poca tracción (141 descargas, 1 like en el momento de la consulta), lo que reduce la probabilidad de que los fallos estén documentados por la comunidad.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad en pipelines que dependan de function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CodePy-3B-Finetuned-GGUF
- Modelo base: https://huggingface.co/FBogaerts/CodePy-3B-Finetuned
- Página de descargas del autor: https://hf.tst.eu/model#CodePy-3B-Finetuned-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
