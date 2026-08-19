# dns/Qwen3.8-9B-heretic-uncensored-Q6_K-GGUF

## Resumen

`dns/Qwen3.8-9B-heretic-uncensored-Q6_K-GGUF` es la versión cuantizada en formato GGUF (Q6_K) del modelo `dns/Qwen3.8-9B-heretic-uncensored`, un modelo de 8,95 mil millones de parámetros obtenido por destilación completa (full-parameter distillation) del modelo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-9B. El modelo base fue entrenado con aproximadamente 70.000 trazas de razonamiento del profesor, cubriendo matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas, y posteriormente sometido al proceso "Heretic" de eliminación automática de censura mediante abliteración direccional.

La relevancia de este modelo reside en que combina tres características poco habituales: un tamaño contenido (inferible en GPU de consumo), capacidades de razonamiento denso y function calling heredadas de la destilación, y la ausencia de alineación de seguridad (uncensored/decensored). Está licenciado bajo Apache 2.0 y solo soporta inglés. La cuantización Q6_K lo hace adecuado para despliegue local con llama.cpp en hardware consumer, aunque no se han publicado resultados de benchmarks que permitan validar su rendimiento cuantitativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (destilación de Qwen3.8 2.4T A95B en arquitectura Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es el resultado de una destilación full-parameter del modelo Qwen3.8 2.4T A95B (arquitectura MoE de 2,4 billones de parámetros totales con 95 mil millones activos) sobre la arquitectura densa Qwen3.5-9B. El estudiante se entrenó con aproximadamente 70.000 trazas de razonamiento del profesor, seleccionadas por calidad, que incluyen cadenas de pensamiento densas en dominios de matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas. El entrenamiento incluyó SFT (supervised fine-tuning) con énfasis en razonamiento y function calling.

La característica más distintiva es el procesamiento posterior con la herramienta "Heretic", que elimina la alineación de seguridad (censura) mediante una implementación avanzada de ablación direccional (abliteration, basada en Arditi et al. 2024 y Lai 2025), combinada con un optimizador de parámetros basado en TPE (Tree-structured Parzen Estimator) sobre Optuna. Este proceso identifica y elimina direcciones en el espacio de activaciones asociadas al rechazo de contenido, sin requerir post-entrenamiento costoso. La cuantización Q6_K se realizó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai.

## Capacidades

- Generación de texto en inglés con estilo conversacional.
- Razonamiento multi-paso mediante cadenas de pensamiento densas heredadas de la destilación del profesor.
- Generación de código y resolución de problemas de matemáticas.
- Soporte de function calling / tool calling, integrable en pipelines de agentes.
- Seguimiento de instrucciones en tareas de varios pasos.
- Ausencia de filtros de seguridad: genera contenido que modelos alineados rechazarían (contenido explícito, violencia, instrucciones peligrosas, etc.).
- Sin capacidades multimodales: solo texto.

## Casos de uso

- Asistente de código sin restricciones: el modelo puede generar scripts, exploits educativos o código ofensivo para investigación en ciberseguridad sin que el filtro de seguridad bloquee la respuesta, gracias a su naturaleza decensored y su entrenamiento en código.
- Agentes autónomos con tool calling: su soporte de function calling y razonamiento multi-paso permite integrarlo como motor de decisión en agentes que ejecutan herramientas externas, con la ventaja de no rechazar acciones consideradas sensibles.
- Investigación académica sobre alineación y seguridad: es un objeto de estudio útil para analizar los efectos de la abliteración en el comportamiento de modelos destilados, comparando respuestas antes y después de la eliminación de censura.
- Generación de ficción y escritura creativa sin filtros: escritores que necesitan explorar temas tabú o contenido adulto pueden usarlo sin interrupciones del modelo, gracias a su entrenamiento en instrucciones y razonamiento.
- Prototipado de aplicaciones de chat local: al ser un GGUF Q6_K de ~8,95B, puede ejecutarse en una GPU consumer o en un Mac con Apple Silicon mediante llama.cpp u Ollama, ideal para prototipos de chatbots privados sin censura.
- Educación en ingeniería de prompts y jailbreak: investigadores y estudiantes pueden estudiar cómo responde un modelo sin alineación frente a prompts adversariales, comparándolo con modelos alineados de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card original no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares, por lo que no es posible comparar su rendimiento cuantitativo con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q6_K ocupan aproximadamente 7,3 GB (8,95B parámetros × 6,5625 bits/parámetro), más caché KV y overhead de ejecución, lo que sitúa el requisito total en torno a 8-10 GB de VRAM. Es una estimación basada en el tamaño del archivo cuantizado, no un dato oficial.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A10G o L4. También funciona en Apple Silicon (M1 Pro o superior) con Metal.
- Sí cabe en GPU consumer: una RTX 3060 de 12 GB es suficiente para la cuantización Q6_K con contexto moderado.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo card documenta el uso con `llama-cli` y `llama-server` descargando el archivo directamente desde HuggingFace.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la longitud de contexto configurada; el ejemplo del modelo card usa `-c 2048`.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| dns/Qwen3.8-9B-heretic-uncensored-Q6_K-GGUF | 8,95B | GGUF Q6_K | Destilación + abliteración | Apache 2.0 |
| mradermacher/Qwen3.5-9B-ultra-uncensored-heretic-v2-i1-GGUF | 9B | GGUF (i1) | Destilación + abliteración v2 | No disponible |
| Wassimyounes01/qwen38-uncensored (Qwen 3.8 27B) | 27B | GGUF Q4_K_M (~16,8 GB) | Abliteración + system pack | No disponible |
| Qwen3-8B estándar (referencia alineada) | 8B | Safetensors/GGUF | Modelo oficial con alineación | Apache 2.0 |

La comparativa se basa en información pública de los repositorios; no hay datos de rendimiento publicados para ninguno de los modelos decensored listados. La principal diferencia entre ellos es el tamaño (9B frente a 27B) y la versión del proceso de abliteración aplicado.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües documentadas.
- Al ser un modelo decensored (abliterado), genera contenido que puede ser ilegal, dañino o inapropiado en muchos contextos. El uso comercial o público conlleva responsabilidad legal y ética.
- No se han publicado benchmarks, por lo que el rendimiento real en razonamiento, código o matemáticas no está validado.
- La longitud de contexto no está documentada; el ejemplo de despliegue usa 2048 tokens, pero el máximo real se desconoce.
- Riesgo de alucinación: como cualquier modelo de esta escala, puede inventar hechos, citas o código incorrecto, especialmente en dominios especializados.
- Es un modelo de nicho creado por un tercero (dns), no un lanzamiento oficial de Alibaba Qwen; la reproducibilidad y el mantenimiento no están garantizados.
- El proceso de abliteración puede degradar capacidades generales no relacionadas con la censura, aunque no hay datos cuantitativos que lo confirmen.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/dns/Qwen3.8-9B-heretic-uncensored-Q6_K-GGUF
- Modelo base (safetensors): https://huggingface.co/dns/Qwen3.8-9B-heretic-uncensored
- Modelo base (copia de rohit267): https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Página del modelo en FriendliAI: https://friendli.ai/models/rohit267/Qwen3.8-9B-heretic-uncensored
- Herramienta Heretic (abliteración): https://github.com/p-e-w/heretic
- Modelo relacionado (mradermacher, GGUF i1): https://huggingface.co/mradermacher/Qwen3.5-9B-ultra-uncensored-heretic-v2-i1-GGUF
- Qwen 3.8 27B Uncensored (GitHub): https://github.com/Wassimyounes01/qwen38-uncensored
