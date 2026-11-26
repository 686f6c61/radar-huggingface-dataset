# niyazirsaliev/DeepSeek-V4.1-Flash-1017-oQ4e-mtp-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-oQ4e-mtp-uncensored es una cuantización de 4 bits en formato MLX del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario niyazirsaliev. Se trata de una variante "abliterated" o "uncensored", es decir, modificada para eliminar los mecanismos de rechazo del modelo base, y cuantizada en precisión mixta oQ4e (4,529 bits por peso) conservando la cabeza de predicción multi-token (MTP). El objetivo declarado es ofrecer calidad de 4 bits en Apple Silicon para equipos con memoria unificada muy grande, en concreto un Mac Studio con 512 GB.

El modelo base, DeepSeek-V4.1-Flash-1017, es un modelo de la familia DeepSeek (no se dispone de especificaciones detalladas del mismo en la información proporcionada). La ficha del autor indica que, a fecha de 24 de noviembre de 2026, las builds uncensored disponibles eran o bien de tamaño completo (unos 500 GB en formatos GPU) o bien cuantizaciones MLX de 2-3 bits; esta versión pretende mantener calidad de 4 bits cargando en unos 403 GB.

Es relevante por dos motivos: por un lado, demuestra la viabilidad de ejecutar modelos de escala muy grande en hardware de consumo profesional (Mac Studio) mediante cuantización agresiva pero controlada; por otro, su carácter uncensored la sitúa en un nicho de investigación sobre alineamiento y robustez. En el momento de redactar esta ficha, los pesos no están subidos: la model card describe la build que se publicará.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017; incluye cabeza MTP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (límite del servidor configurado en la prueba; se procesó correctamente un prompt en frío de 243.819 tokens) |
| Tipos de cuantizacion | oQ4e de precisión mixta, 4,529 bits por peso (4-bit) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (librería `mlx`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en la documentación proporcionada: no se detalla si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de parámetros, tokens de entrenamiento o composición del dataset. La única información arquitectónica concreta es que la build conserva la cabeza de predicción multi-token (MTP), un mecanismo de decodificación especulativa que permite predecir varios tokens por paso y que suele mejorar el throughput de generación.

El proceso de esta publicación concreta consiste en una cuantización oQ4e de precisión mixta (4,529 bits por peso) sobre los pesos del modelo base, seguida de una modificación de tipo "abliterated" que elimina las respuestas de rechazo. No se documenta el método exacto de abliteración (direcciones de rechazo, capas afectadas) ni si hubo reentrenamiento posterior. Tampoco se indica qué herramientas se emplearon para la cuantización más allá del runtime oMLX 0.8.3 usado para las mediciones.

## Capacidades

- Generación de texto y razonamiento de largo alcance: el modelo mantiene cadenas de razonamiento extensas, hasta el punto de que sin límite de "thinking budget" puede consumir más de 12.000 tokens razonando antes de responder.
- Contexto largo: procesa prompts de hasta 262.144 tokens; se validó con un prompt en frío de 243.819 tokens respondido correctamente.
- Modo de razonamiento con presupuesto configurable: el runtime permite fijar un `thinking_budget` por petición o por modelo.
- Respuestas sin rechazo: en la evaluación JBB-Behaviors con presupuesto de 4.000 tokens respondió 99 de 100 prompts y rechazó 1.
- Decodificación multi-token (MTP): la cabeza MTP se conserva en la build, lo que contribuye a la velocidad de generación medida.
- Tool calling y visión: no reevaluados en esta build según el autor.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente a prompts de JBB-Behaviors y comparar tasas de rechazo con el modelo base, usando el modo de razonamiento con presupuesto controlado para obtener respuestas completas.
- Evaluación de cuantización en Apple Silicon: sirve como banco de pruebas para medir el impacto de oQ4e (4,529 bits/peso) frente a cuantizaciones de 2-3 bits y a los pesos completos, con métricas reproducibles de memoria (403 GB) y velocidad (36-40 tokens/s).
- Procesamiento de documentos muy largos en local: con 262.144 tokens de contexto puede analizar libros técnicos, expedientes o bases de código extensas en un Mac Studio sin enviar datos a la nube.
- Generación de texto creativo sin filtros: para proyectos editoriales o de ficción que requieran temáticas que el modelo base rechaza, asumiendo la responsabilidad de uso que indica el autor.
- Prototipado de agentes con razonamiento largo: la combinación de MTP, contexto amplio y modo de pensamiento permite construir pipelines de razonamiento multi-paso en local, siempre que se configure un límite de tokens para evitar respuestas truncadas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en hardware local vía MLX, encaja en escenarios donde los datos no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Memoria al cargar | ~403 GB | Mac Studio M3 Ultra 512 GB, oMLX 0.8.3 |
| Velocidad de generación | 36-40 tokens/s | misma configuración |
| Lectura de prompt en frío | 243.819 tokens en 537 s | límite del servidor 262.144 |
| JBB-Behaviors (100 prompts) | 99 respondidos, 1 rechazado, 0 sin respuesta | thinking budget de 4.000 tokens, temperatura 0, heurística de frases sobre los primeros 300 caracteres |
| JBB-Behaviors sin thinking budget | 83 respondidos, 0 rechazados, 17 sin respuesta (agotaron 12.000 tokens razonando) | misma configuración |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras de JBB-Behaviors provienen de una heurística de frases, no de un modelo juez, según advierte el propio autor.

## Requisitos de hardware

- Memoria unificada: unos 410 GB libres para cargar el modelo (403 GB en uso medido).
- Hardware validado: Mac Studio M3 Ultra con 512 GB de memoria unificada.
- GPU consumer: no cabe en ninguna GPU de consumo convencional (RTX 4090, 24 GB; ni siquiera en configuraciones multi-GPU de gama alta sin agregar memoria); está pensado para Apple Silicon de gran capacidad.
- Runtime: MLX con soporte para esta familia de modelos; probado en oMLX 0.8.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Rendimiento medido: 36-40 tokens/s de generación y 537 s para procesar un prompt en frío de 243.819 tokens.
- Estado: los pesos no están subidos en el momento de la ficha, por lo que no es desplegable todavía.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-oQ4e-mtp-uncensored | no disponible | 262.144 | oQ4e 4,529 bits (MLX) | MIT | Pesos no subidos aún |
| Builds uncensored de tamaño completo (formato GPU) | no disponible | no disponible | completa (~500 GB) | no disponible | Disponibles según el autor |
| Builds uncensored MLX de 2-3 bits | no disponible | no disponible | 2-3 bits | no disponible | Disponibles según el autor |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | completa | MIT | Disponible en Hugging Face |

La información proporcionada no incluye especificaciones del modelo base ni de las builds alternativas más allá de su tamaño y formato, por lo que no es posible comparar rendimiento ni parámetros.

## Limitaciones y advertencias

- Los pesos no están publicados: la model card describe una build futura; no es utilizable hasta que se suban.
- Modelo uncensored: responde peticiones que el modelo base rechaza; el autor declara explícitamente que la responsabilidad de uso recae en el usuario. No es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo de razonamiento excesivo: sin límite de thinking budget, 17 de 100 prompts agotaron 12.000 tokens sin dar respuesta; es imprescindible configurar un presupuesto en producción.
- Evaluación limitada: las tasas de rechazo se midieron con una heurística de frases sobre los primeros 300 caracteres, no con un modelo juez; los resultados pueden no reflejar la calidad real de las respuestas.
- Tool calling y visión no verificados en esta build.
- Idiomas soportados no documentados.
- Requisitos de hardware extremos: ~410 GB de memoria unificada; inviable en GPU de consumo y en la mayoría de estaciones de trabajo.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos: no documentados.
- Licencia MIT: permite uso comercial, pero la ausencia de garantías y el carácter uncensored exigen auditoría propia antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niyazirsaliev/DeepSeek-V4.1-Flash-1017-oQ4e-mtp-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
