# pgmharikrishnan/Spark-X2.6-4B-MLX-Serve-mixed-4-8bit

## Resumen

Spark-X2.6-4B-MLX-Serve-mixed-4-8bit es una conversión no oficial del modelo XHToken/Spark-X2.6-4B a formato MLX con cuantización afín de precisión mixta 4/8 bits, publicada por el usuario pgmharikrishnan para su uso con la herramienta mlx-serve. No se trata de un modelo nuevo: es un empaquetado de pesos del modelo base de 4.112.079.360 parámetros (4,1 B), distribuido bajo licencia Apache-2.0, pensado para ejecución local en hardware Apple Silicon mediante MLX.

El interés de esta ficha está en la cuantización: en lugar de aplicar 4 bits de forma uniforme, el pack mantiene las proyecciones de atención, los embeddings de tokens y el LM head en 8 bits, mientras que las proyecciones del MLP denso quedan en 4 bits, con normas, escalas y sesgos en BF16. Según la model card, esa asimetría recupera calidad frente al pack 4 bits del mismo autor (65,25 % frente a 59,50 % en MMLU-Pro-400; 90,00 % frente a 86,00 % en GSM8K-50) a cambio de un descenso en velocidad de decodificación (122,6 frente a 146,6 tok/s).

El modelo base incorpora un modo de razonamiento de alto esfuerzo activado por defecto, lo que se traduce en respuestas largas: la model card indica que las respuestas de MMLU-Pro alcanzaron el límite de 8.192 tokens en 61 casos con este pack. Es un artefacto de despliegue para inferencia local en Mac, no una release con validación de producción ni con datos de contexto o idiomas publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Spark X2.6; MLP descrito como denso en la model card; el tipo de atención no se detalla |
| Parámetros totales | 4.112.079.360 (4,1 B) |
| Parámetros activos | No aplica: no es un modelo MoE; el MLP se describe como denso |
| Longitud de contexto | No disponible; los 8.192 tokens citados corresponden al tope de generación de respuestas en la evaluación MMLU-Pro, no a la ventana de contexto declarada |
| Tipos de cuantización | Cuantización afín MLX de grupo 64 con precisión mixta: MLP denso en 4 bits, proyecciones de atención, embeddings y LM head en 8 bits, normas/escalas/sesgos en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX para mlx-serve; pack de 2,8 GiB, repositorio de 3,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de lo que se deduce del esquema de cuantización: existen proyecciones de atención diferenciadas, un MLP descrito explícitamente como denso, embeddings de tokens y un LM head separado. No se publican detalles sobre número de capas, dimensión oculta, mecanismo de atención (completa, lineal o híbrida), vocabulario ni función de activación. Tampoco se indica si el modelo base emplea arquitectura híbrida o algún tipo de decodificación especulativa.

Respecto al entrenamiento, la model card de esta conversión no aporta ningún dato: no hay cifras de tokens de entrenamiento, composición del dataset, ni mención a RLHF, DPO u otras etapas de alineación. El único indicio de comportamiento aprendido es la observación de que «Spark usa pensamiento de alto esfuerzo por defecto», lo que sugiere una etapa de entrenamiento orientada a razonamiento extenso con presupuesto de tokens amplio. La innovación técnica documentada aquí es exclusivamente la receta de cuantización: cuantización afín con group-size 64 y asignación asimétrica de bits por tipo de tensor, que prioriza precisión en atención y embeddings (8 bits) y comprime el MLP (4 bits).

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational.
- Razonamiento con modo de pensamiento: el modelo base activa por defecto un modo de alto esfuerzo que produce cadenas de razonamiento largas antes de la respuesta final.
- Razonamiento matemático: 90,00 % en GSM8K-50 con este pack, según la model card.
- Conocimiento general y de nivel avanzado: 65,25 % en MMLU-Pro-400 (subconjunto de 400 preguntas).
- Generación de código: 6/6 en el conjunto Coding-6 del suite del autor; los resultados de Coding-std quedan pendientes de publicación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el modo de pensamiento extenso es compatible con ese uso, pero no hay validación publicada.
- Multilingüismo: no disponible; no se declaran idiomas en los metadatos ni en la model card.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Inferencia local en Mac para prototipado de razonamiento: con 2,8 GiB de pesos empaquetados, el modelo cabe en un Mac con memoria unificada de 16 GB y permite iterar sobre prompts de razonamiento sin depender de la nube, usando `mlx-serve serve --model pgmharikrishnan/Spark-X2.6-4B-MLX-Serve-mixed-4-8bit`.
- Asistente de análisis matemático de un solo turno: el 90,00 % en GSM8K-50 lo hace adecuado para resolver problemas aritméticos y de varios pasos en local, aceptando respuestas largas a cambio de mayor latencia.
- Evaluación comparativa de recetas de cuantización: sirve como referencia práctica para medir la pérdida de calidad de un esquema mixto 4/8 bits frente a uno uniforme de 4 bits, usando la fidelidad top-1 (85,94 % frente a 82,03 %) y la KL media (0,07757 frente a 0,15323) como métricas.
- Generación de código en entornos sin conectividad: los 6/6 en Coding-6 indican utilidad para autocompletar y explicar fragmentos de código en un portátil Apple Silicon, aunque el conjunto es demasiado pequeño para extrapolar a producción.
- Chatbot de escritorio con contexto moderado: la etiqueta conversational y el formato MLX permiten integrarlo en una aplicación de escritorio macOS que gestione diálogos multi-turno; la ventana de contexto real debe medirse antes de fijar la política de truncado.
- Banco de pruebas de latencia en Apple Silicon: con 122,6 tok/s de decodificación y 968 tok/s de prefill medidos por el autor, es un candidato para comparar configuraciones de mlx-serve, tamaños de lote y longitudes de prompt en hardware de consumo.
- Servicio interno de bajo coste para tareas de razonamiento no críticas: al ser Apache-2.0 y ejecutarse en un único equipo, puede desplegarse como servicio de apoyo en un pipeline interno, siempre con validación previa del autor del despliegue.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando este pack con el pack 4 bits uniforme (0x36) del mismo autor sobre el mismo modelo base. No hay comparaciones con otros modelos.

| Métrica | Pack 4 bits (0x36) | Pack mixto 4/8 bits |
|---|---:|---:|
| MMLU-Pro-400 | 59,50 % | 65,25 % |
| GSM8K-50 | 86,00 % | 90,00 % |
| Coding-6 | 6/6 | 6/6 |
| Velocidad de decodificación | 146,6 tok/s | 122,6 tok/s |
| Velocidad de prefill | 858 tok/s | 968 tok/s |
| Fidelidad top-1 con corpus congelado (teacher forcing) | 82,03 % | 85,94 % |
| KL media frente al profesor | 0,15323 | 0,07757 |
| Respuestas que agotan el tope de 8.192 tokens en MMLU-Pro | 83 | 61 |

No se han publicado resultados de benchmarks frente a modelos de otras familias en la información disponible, ni se especifica el hardware empleado en las mediciones de velocidad ni la configuración de muestreo.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon con MLX; el paquete no está pensado para CUDA ni para CPU x86.
- Memoria: los pesos empaquetados ocupan 2,8 GiB (repositorio de 3,0 GB); el consumo total añade la caché KV y los buffers de activación, por lo que conviene reservar varios GiB adicionales según la longitud de contexto efectiva.
- Encaje en equipos de consumo: sí, en Mac con memoria unificada de 16 GB o superior; en configuraciones de 8 GB el margen es muy ajustado y no está verificado por el autor.
- GPUs recomendadas: no aplica; no se documenta soporte para A100, H100 ni RTX 4090 en este formato.
- Software: mlx-serve v26.10.2 o superior, requisito explícito de la model card. No hay conversión GGUF publicada para llama.cpp u Ollama, ni plantilla de despliegue para vLLM o TGI.
- Rendimiento declarado: 122,6 tok/s de decodificación y 968 tok/s de prefill; el equipo de medida no se especifica, por lo que las cifras no son directamente trasladables a otro hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro-400 | GSM8K-50 | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este pack (mixto 4/8 bits, MLX) | 4,1 B | No disponible | 65,25 % | 90,00 % | Apache-2.0 | safetensors MLX |
| Spark-X2.6-4B, pack 4 bits (0x36) | 4,1 B | No disponible | 59,50 % | 86,00 % | Apache-2.0 | safetensors MLX |
| XHToken/Spark-X2.6-4B (base, sin cuantizar) | 4,1 B | No disponible | No disponible | No disponible | Apache-2.0 | safetensors |

No se dispone de datos para comparar con alternativas de otras familias (por ejemplo, modelos densos de 3-4 B en formato GGUF o MLX de otros autores): la información proporcionada no incluye resultados homogéneos ni especificaciones de contexto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Conversión no oficial: el autor declara explícitamente que es una conversión independiente y recomienda validarla para la carga de trabajo concreta antes de usarla en producción.
- Sin tracción ni validación externa: 0 descargas y 0 likes en el momento de los metadatos; no hay informes de terceros sobre su comportamiento.
- Degradación por cuantización: aunque el pack mixto mejora al de 4 bits, la fidelidad top-1 frente al modelo sin cuantizar es del 85,94 %, es decir, aproximadamente una de cada siete decisiones de token difiere del profesor.
- Riesgo de respuestas truncadas: el modo de pensamiento de alto esfuerzo agota el tope de 8.192 tokens en 61 casos de MMLU-Pro (frente a 83 en el pack de 4 bits); con límites de generación bajos es probable obtener razonamiento incompleto o respuestas cortadas.
- Sesgos: no disponibles; no se publica ninguna evaluación de sesgo, toxicidad o seguridad para el modelo base ni para esta conversión.
- Alucinación: no cuantificada; no hay métricas de veracidad ni de atribución en la información disponible.
- Idiomas y contexto: sin declaración de idiomas soportados ni de longitud de contexto, lo que impide garantizar un comportamiento correcto fuera del inglés o con prompts largos.
- Dependencia de versión: requiere mlx-serve v26.10.2 o superior, lo que limita la portabilidad y complica la reproducibilidad a medio plazo.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una conversión no oficial conviene revisar los términos del modelo base XHToken/Spark-X2.6-4B antes de redistribuir.
- Resultados pendientes: Coding-std no estaba publicado en el momento de escribir esta ficha, por lo que la evaluación de código se apoya solo en un conjunto de 6 casos.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/pgmharikrishnan/Spark-X2.6-4B-MLX-Serve-mixed-4-8bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Perfil del autor de la conversión: https://huggingface.co/pgmharikrishnan
- Paper, blog técnico, repositorio de código o demo de mlx-serve: no disponibles en la información proporcionada.
