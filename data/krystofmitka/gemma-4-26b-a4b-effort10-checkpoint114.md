# krystofmitka/gemma-4-26B-A4B-effort10-checkpoint114

## Resumen

ThinkingNuke es un ajuste fino del modelo multimodal google/gemma-4-26B-A4B-it, desarrollado por el usuario krystofmitka y publicado bajo licencia Apache 2.0. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 25.805.933.872 parametros totales, derivado del modelo base de Google y distribuido en formato BF16 con safetensors. Su proposito principal es anadir control explicito del "esfuerzo de razonamiento" mediante una linea en el system prompt, permitiendo al usuario solicitar desde respuestas rapidas (effort 10) hasta razonamientos mas profundos (effort 100).

La innovacion central del modelo es el control de esfuerzo mediante el prompt: una linea como "Reasoning Effort: 10 (range 1–100; higher values request more thorough reasoning)" al inicio del system prompt modula la cantidad de tokens de pensamiento generados. Segun la model card, un unico modelo soporta los niveles 10, 25, 50, 75, 100 y el comportamiento por defecto, manteniendo el modo thinking activado con `enable_thinking=True`. Los benchmarks publicados corresponden unicamente al nivel effort 10 con cobertura completa.

El modelo es relevante porque combina capacidades multimodales (image-text-to-text), razonamiento extendido con control de presupuesto cognitivo y una licencia permisiva (Apache 2.0), lo que facilita su integracion en produccion. El checkpoint publicado (checkpoint114) incluye evaluaciones en 11 benchmarks con intervalos de confianza del 95% y metricas de tokens de pensamiento, lo que aporta transparencia sobre el rendimiento real del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de Gemma 4 |
| Parametros totales | 25.805.933.872 (aprox. 25,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de evaluacion) |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors (BF16, aprox. 52 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, concretamente en la variante 26B-A4B, que emplea un esquema Mixture of Experts. El sufijo "A4B" sugiere aproximadamente 4B de parametros activos por token, aunque este dato no se confirma explicitamente en la informacion disponible. El ajuste fino parte del checkpoint google/gemma-4-26B-A4B-it y se distribuye como un modelo BF16 independiente, sin cuantizar, con un tamano de repositorio de 51,6 GB.

La innovacion tecnica principal es el control de esfuerzo de razonamiento mediante prompt. El autor indica que el modelo fue entrenado o ajustado para interpretar una linea de system prompt que especifica un nivel de esfuerzo entre 1 y 100, modulando la profundidad del razonamiento sin cambiar los pesos. La model card especifica que se debe mantener `enable_thinking=True` y que los valores de esfuerzo son preferencias de razonamiento, no limites duros de tokens ni porcentajes de un presupuesto de inferencia. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal (image-text-to-text), con soporte para entradas de imagen y texto.
- Razonamiento extendido con modo thinking activable mediante `enable_thinking=True`, que produce canales separados de pensamiento y respuesta final.
- Control de esfuerzo de razonamiento mediante prompt (niveles 10, 25, 50, 75, 100 y default), permitiendo ajustar la profundidad del razonamiento segun la tarea.
- Capacidades matematicas y de resolucion de problemas, evaluadas en benchmarks como AIME 2026, HMMT y GPQA-Diamond.
- Generacion de codigo, evaluada en LiveCodeBench v6.
- Razonamiento sobre contexto largo, evaluado en AA-LCR y LongBench v2 con contexto de hasta 262.144 tokens.
- Capacidades de instruccion y seguimiento de formato, evaluadas en IFBench.
- Capacidades de vision y comprension de imagenes del mundo real, evaluadas en RealWorldQA.
- Soporte de conversacion multi-turno mediante chat template de Transformers.
- Compatibilidad con vLLM (version 0.33.0 o superior con soporte para Gemma 4) y con endpoints compatibles.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico con control de coste: el modelo puede resolver problemas de competicion (AIME, HMMT) ajustando el esfuerzo segun la dificultad. Para problemas simples se usa effort 10 con una media de 8.155 tokens de pensamiento en AIME 2026; para problemas mas complejos se puede subir el esfuerzo y aumentar `max_new_tokens`.
- Analisis de documentos largos y contratos: con 262.144 tokens de contexto, el modelo puede procesar informes extensos, expedientes o codigo fuente completo y responder preguntas sobre ellos, como demuestra su evaluacion en LongBench v2 (58,78% de precision).
- Generacion y revision de codigo en produccion: su rendimiento en LiveCodeBench v6 (73,84% con effort 10) lo hace adecuado para pipelines de CI/CD donde se requiera revision automatizada de parches o generacion de tests, con la posibilidad de aumentar el esfuerzo para casos criticos.
- Asistencia multimodal en soporte tecnico: al aceptar image-text-to-text, puede recibir capturas de pantalla o diagramas junto con texto y generar diagnosticos o instrucciones, usando effort bajo para respuestas rapidas en atencion al cliente.
- Evaluacion de calidad y moderacion con razonamiento controlado: el modo thinking permite generar justificaciones detalladas para clasificaciones o decisiones, y el control de esfuerzo permite reducir latencia en tareas de alto volumen.
- Investigacion en razonamiento y eficiencia cognitiva: el modelo sirve como banco de pruebas para estudiar como varia la precision con el presupuesto de razonamiento, gracias a sus benchmarks publicados con intervalos de confianza y metricas de tokens de pensamiento por nivel de esfuerzo.
- Despliegue en entornos con requisitos de licencia permisiva: al estar bajo Apache 2.0, puede integrarse en productos comerciales sin las restricciones adicionales de otras licencias de modelos abiertos, siempre que se respete el license_link de Gemma 4.

## Benchmarks y rendimiento

Resultados publicados en la model card para effort 10, con cobertura completa de semillas segun lo indicado. La precision es la media con intervalo de confianza del 95% entre semillas; los tokens de pensamiento son la media por respuesta, excluyendo la respuesta final.

| Benchmark | Precision / exito (%) | IC 95% (%) | Tokens de pensamiento medios | Preguntas por semilla | Semillas completadas / planificadas |
|---|---:|---:|---:|---:|---:|
| GPQA-Diamond | 75,25 | 74,18–76,33 | 2.942 | 198 | 10/32 |
| MMLU-Pro | 83,84 | 83,76–83,93 | 1.910 | 12.032 | 4/4 |
| MMMLU | 82,84 | 82,50–83,18 | 452 | 9.996 | 4/4 |
| AIME 2026 | 79,63 | 74,76–84,50 | 8.155 | 30 | 9/64 |
| HMMT February 2026 | 64,31 | 60,32–68,31 | 15.844 | 33 | 9/64 |
| HMMT November 2025 | 72,22 | 70,00–74,44 | 9.763 | 30 | 9/64 |
| LiveCodeBench v6 | 73,84 | 72,82–74,87 | 6.802 | 175 | 9/32 |
| AA-LCR | 44,50 | 41,67–47,33 | 1.323 | 100 | 8/8 |
| LongBench v2 | 58,78 | 58,07–59,50 | 4.860 | 370 | 8/8 |
| RealWorldQA | 69,82 | 69,05–70,58 | 2.660 | 765 | 9/16 |
| IFBench | 75,67 | 74,69–76,64 | 2.887 | 300 | 9/16 |

La model card indica que la comparacion con el modelo base (Gemma 4 26B-A4B sin instruccion de esfuerzo) esta en curso: solo 65 de 312 pasadas estaban completas en el momento de la actualizacion (2026-11-20 11:52 Europe/Prague). No se dispone de los valores del modelo base en la informacion proporcionada, por lo que no se puede calcular la reduccion de tokens de pensamiento ni la diferencia de precision.

Configuracion de evaluacion: BF16 completo, thinking activado, vLLM 0.33.0 / EvalScope 1.14.1, contexto 262.144, limite de salida 65.536, temperatura 1.0, top-p 0.95, top-k 64. Los intervalos de confianza son intervalos t de Student al 95% entre semillas de muestreo completadas y miden variabilidad de generacion sobre selecciones fijas de preguntas, no incertidumbre por muestreo de nuevas preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 52 GB, por lo que se necesitan al menos 60-70 GB de VRAM considerando cache KV y activaciones para contexto moderado. Para contexto completo de 262.144 tokens, el requisito de memoria aumenta significativamente y no se especifica en la informacion disponible.
- GPU recomendadas: para BF16 se requieren GPUs con 80 GB o mas, como NVIDIA A100 80GB, H100 80GB o multiples GPUs. No se documentan opciones de cuantizacion (GGUF, AWQ, GPTQ) en la informacion proporcionada, por lo que no se puede confirmar su viabilidad en GPUs de consumo.
- GPU de consumo: no es viable en BF16 en GPUs consumer de 24 GB (RTX 4090) sin cuantizacion, y no se han publicado pesos cuantizados en la informacion disponible.
- Opciones de despliegue: Transformers con soporte para Gemma 4 (clase `AutoModelForImageTextToText`), vLLM 0.33.0 o superior con soporte para Gemma 4, y endpoints compatibles. No se mencionan llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. La model card no publica metricas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Rendimiento destacado |
|---|---:|---:|---|---|---|
| ThinkingNuke (este modelo) | 25,8B | 262.144 | Apache 2.0 | safetensors BF16 | MMLU-Pro 83,84; GPQA-Diamond 75,25; LiveCodeBench v6 73,84 (effort 10) |
| google/gemma-4-26B-A4B-it (base) | no disponible | no disponible | Apache 2.0 (Gemma 4) | safetensors | Resultados de comparacion en curso; no publicados en la informacion disponible |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache 2.0 (Gemma 4) | safetensors | Usado como juez local de AA-LCR; sin benchmarks publicados en la informacion disponible |

No se dispone de datos de benchmarks de los modelos base ni de alternativas de otros desarrolladores en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento completa. La comparativa se limita a los datos estructurales y de licencia disponibles.

## Limitaciones y advertencias

- Solo se han validado los niveles de esfuerzo 10, 25, 50, 75, 100 y default; otros valores no han sido validados segun la model card.
- Los benchmarks publicados corresponden unicamente a effort 10; el rendimiento en otros niveles de esfuerzo no se ha evaluado en la informacion disponible.
- La comparacion con el modelo base esta incompleta (65/312 pasadas completas), por lo que no se puede confirmar la mejora o degradacion respecto a google/gemma-4-26B-A4B-it.
- Los intervalos de confianza se basan en un numero limitado de semillas en varios benchmarks (por ejemplo, 9/64 en AIME 2026 y HMMT), lo que puede producir intervalos amplios y estimaciones menos estables.
- El limite de salida puede truncar el razonamiento o la respuesta final si se alcanza `max_new_tokens`; la model card advierte de este riesgo.
- No se documentan los idiomas soportados, los sesgos conocidos ni el riesgo de alucinacion en la informacion proporcionada.
- La licencia Apache 2.0 se acompania de un license_link a la licencia de Gemma 4; es recomendable revisar dicho enlace para confirmar las condiciones exactas de uso comercial.
- El modelo requiere Transformers con soporte para Gemma 4 y vLLM 0.33.0 o superior; versiones anteriores pueden no ser compatibles.
- El repositorio ocupa 51,6 GB y los pesos BF16 requieren hardware de alta gama; no se ofrecen alternativas cuantizadas en la informacion disponible.
- La model card indica que la evaluacion no es una replicacion exacta de los prompts de evaluacion de BottleCap ni de los modelos auxiliares, lo que limita la comparabilidad directa con otros resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krystofmitka/gemma-4-26B-A4B-effort10-checkpoint114
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Tabla de benchmarks (SVG): https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B/resolve/main/eval/checkpoint114-effort10/table.svg
- Repositorio del autor (referenciado en la model card): https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B
