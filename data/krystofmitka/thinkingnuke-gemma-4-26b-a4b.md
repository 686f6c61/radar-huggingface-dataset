# krystofmitka/ThinkingNuke-gemma-4-26B-A4B

## Resumen

ThinkingNuke-gemma-4-26B-A4B es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-26B-A4B-it, publicado por el usuario krystofmitka en Hugging Face. Se distribuye como un modelo autónomo en BF16 (unos 52 GB de pesos) bajo licencia Apache 2.0, y su rasgo diferencial es el control de esfuerzo de razonamiento ("effort control"): mediante una línea en el system prompt, el usuario puede solicitar distintos niveles de profundidad de razonamiento (10, 25, 50, 75, 100 o el valor por defecto) sin cambiar de modelo.

El modelo hereda la arquitectura multimodal de Gemma 4 (image-text-to-text), con 25.805.933.872 parámetros totales y una ventana de contexto de 262.144 tokens según la configuración de evaluación reportada. Está pensado para escenarios donde conviene ajustar el coste computacional del razonamiento: tareas simples con effort bajo generan muchas menos fichas de pensamiento, mientras que problemas matemáticos o de código pueden beneficiarse de niveles altos.

Su relevancia actual radica en que combina tres elementos poco habituales en un mismo checkpoint: modalidad imagen-texto, razonamiento con canal de pensamiento explícito y control granular del esfuerzo mediante prompt, todo ello con licencia permisiva y compatibilidad con Transformers y vLLM. No obstante, el autor advierte de que solo el nivel de effort 10 ha sido validado con benchmarks completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 (image-text-to-text); detalles internos de capas y atención no disponibles |
| Parametros totales | 25.805.933.872 |
| Parametros activos | no disponible (la nomenclatura A4B del modelo base sugiere arquitectura con expertos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens (según la configuración de evaluación reportada) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (BF16, ~52 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint google/gemma-4-26B-A4B-it, del que hereda la arquitectura multimodal de Gemma 4 para entrada de imagen y texto. La información proporcionada no detalla la composición del dataset de ajuste, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; únicamente se documenta el resultado: un modelo que responde a instrucciones de esfuerzo de razonamiento insertadas en el system prompt.

La innovación técnica destacable es el control de esfuerzo mediante prompt. La línea `Reasoning Effort: 10 (range 1–100; higher values request more thorough reasoning)` debe colocarse al inicio del system prompt, y el razonamiento debe mantenerse activado con `enable_thinking=True`. El autor aclara que estos valores son preferencias de razonamiento y no límites duros de tokens ni porcentajes de un presupuesto de inferencia. El repositorio incluye `effort_presets.json` y una carpeta `examples/` con los cinco niveles de effort y el valor por defecto. La evaluación reportada se realizó con vLLM 0.33.0 y EvalScope 1.14.1, con temperatura 1.0, top-p 0.95 y top-k 64.

## Capacidades

- Generación de texto y razonamiento con canal de pensamiento explícito (thinking) y canal de respuesta final separados.
- Control de esfuerzo de razonamiento mediante prompt en cinco niveles validados (10, 25, 50, 75, 100) más el modo por defecto.
- Procesamiento de imagen y texto (pipeline image-text-to-text), incluyendo tareas de razonamiento visual como RealWorldQA.
- Razonamiento matemático de competición (AIME, HMMT) y resolución de problemas algebraicos paso a paso.
- Generación y razonamiento sobre código (evaluado en LiveCodeBench v6).
- Comprensión de contexto largo (LongBench v2, AA-LCR) con ventana de hasta 262.144 tokens.
- Seguimiento de instrucciones estrictas (IFBench, métrica de pass rate a nivel de prompt).
- Capacidades multilingües evaluadas en MMMLU, aunque la lista concreta de idiomas no está disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el canal de thinking y el contexto largo lo permiten de forma implícita.

## Casos de uso

- Razonamiento matemático con coste controlado: en un servicio de resolución de problemas, se puede fijar effort 25 para ejercicios escolares y effort 75 o 100 para problemas de competición, reduciendo el gasto en tokens de pensamiento en los casos sencillos (el modelo promedia 8.155 tokens de pensamiento en AIME 2026 con effort 10).
- Asistencia técnica con contexto largo: gracias a los 262.144 tokens de ventana, se puede cargar documentación extensa o historiales de incidencias completos y mantener conversaciones multi-turno sin truncar; los resultados en LongBench v2 (58,78 %) y AA-LCR (44,50 %) indican capacidad real en esta franja.
- Análisis de imágenes en flujos de verificación: el pipeline image-text-to-text permite procesar capturas, diagramas o documentos escaneados y razonar sobre ellos; RealWorldQA (69,82 %) sirve como referencia de su competencia en comprensión visual del mundo real.
- Generación de código en pipelines de integración: con LiveCodeBench v6 en 73,84 %, el modelo puede emplearse para revisión de parches, generación de tests o explicación de código, ajustando el effort según la criticidad de la tarea.
- Cumplimiento estricto de instrucciones en producción: IFBench mide el pass rate a nivel de prompt (75,67 %), útil para sistemas donde el formato de salida o las restricciones del prompt son críticos, como extracción de datos estructurados.
- Evaluación comparativa de estrategias de razonamiento: al ser un modelo con niveles de effort conmutables por prompt, sirve como banco de pruebas para medir la relación entre tokens de pensamiento y precisión en tareas propias, sin desplegar checkpoints distintos.
- Razonamiento multilingüe: con MMMLU en 82,84 %, puede usarse en atención al cliente o análisis de documentos en varios idiomas, aunque la lista exacta de idiomas soportados no está documentada.

## Benchmarks y rendimiento

Resultados reportados por el autor con effort 10, BF16, thinking activado, vLLM 0.33.0 / EvalScope 1.14.1, contexto 262.144, temperatura 1.0, top-p 0.95, top-k 64. La cobertura de semillas varía por benchmark (se indica en la última columna).

| Benchmark | Precisión / éxito (%) | IC 95 % entre semillas (%) | Tokens de pensamiento medios | Semillas completadas / planificadas |
|---|---:|---:|---:|---:|
| GPQA-Diamond | 75,25 | 74,18–76,33 | 2.942 | 10/32 |
| MMLU-Pro | 83,84 | 83,76–83,93 | 1.910 | 4/4 |
| MMMLU | 82,84 | 82,50–83,18 | 452 | 4/4 |
| AIME 2026 | 79,63 | 74,76–84,50 | 8.155 | 9/64 |
| HMMT February 2026 | 64,31 | 60,32–68,31 | 15.844 | 9/64 |
| HMMT November 2025 | 72,22 | 70,00–74,44 | 9.763 | 9/64 |
| LiveCodeBench v6 | 73,84 | 72,82–74,87 | 6.802 | 9/32 |
| AA-LCR | 44,50 | 41,67–47,33 | 1.323 | 8/8 |
| LongBench v2 | 58,78 | 58,07–59,50 | 4.860 | 8/8 |
| RealWorldQA | 69,82 | 69,05–70,58 | 2.660 | 9/16 |
| IFBench | 75,67 | 74,69–76,64 | 2.887 | 9/16 |

El autor indica que la comparación con el modelo base original (Gemma 4 26B-A4B sin instrucción de effort) está en curso: solo 65 de 312 pasadas estaban completas en el momento de la última actualización (2026-11-20). Los intervalos de confianza son intervalos t de Student al 95 % entre semillas de muestreo, no incertidumbre sobre preguntas nuevas. Los niveles de effort distintos de 10 no han sido evaluados en los benchmarks reportados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 52 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo con margen para caché KV; con contexto de 262.144 tokens el consumo de memoria de atención crece de forma significativa.
- GPU recomendadas: A100 80GB o H100 80GB para BF16 completo; configuraciones multi-GPU mediante `device_map="auto"` en Transformers.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) ni de 48 GB en BF16; no se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir el requisito, por lo que no se puede confirmar su viabilidad en GPU de consumo.
- Opciones de despliegue: Transformers (con soporte de Gemma 4) y vLLM (versión que soporte Gemma 4; el autor usó 0.33.0 para la evaluación). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia indirecta, los tokens de pensamiento medios por respuesta oscilan entre 452 (MMMLU) y 15.844 (HMMT febrero 2026) con effort 10, lo que da una idea del volumen de generación por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Estado |
|---|---:|---|---|---|
| ThinkingNuke-gemma-4-26B-A4B | 25,8 B | 262.144 | Apache 2.0 | Disponible en HF (928 descargas, 6 likes) |
| google/gemma-4-26B-A4B-it (base) | no disponible en la información | no disponible | Licencia Gemma 4 | Disponible en HF; referencia de comparación del autor, evaluación en curso |
| google/gemma-4-E2B-it | no disponible en la información | no disponible | Licencia Gemma 4 | Usado como juez local de AA-LCR en la evaluación |

No se dispone de datos de benchmarks del modelo base ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparativa con el checkpoint original está anunciada pero incompleta (65/312 pasadas).

## Limitaciones y advertencias

- Solo el nivel de effort 10 ha sido validado con benchmarks completos; el autor advierte explícitamente de que otros valores de effort no han sido validados.
- La comparación con el modelo base está incompleta: solo 65 de 312 pasadas finalizadas en la última actualización, por lo que las cifras de mejora o degradación frente al original no están confirmadas.
- Cobertura de semillas desigual: varios benchmarks tienen 9 de 64 semillas completadas (AIME 2026, HMMT), lo que produce intervalos de confianza amplios; los resultados deben tratarse como preliminares.
- Riesgo de truncamiento: si se alcanza el límite de tokens de salida, el razonamiento o la respuesta final pueden quedar cortados; el autor recomienda ajustar el límite según la aplicación (el ejemplo usa `max_new_tokens=12288`).
- El control de effort es una preferencia de prompt, no un límite duro de tokens; no garantiza un presupuesto de inferencia acotado.
- Idiomas soportados no documentados; el rendimiento multilingüe solo se conoce de forma agregada vía MMMLU.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- Licencia Apache 2.0 en el repositorio, pero con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos del modelo base para uso comercial.
- No se documentan cuantizaciones, lo que limita el despliegue en hardware de gama media o consumer.
- Soporte de tool calling y de agentes no documentado; no debe asumirse en producción sin verificación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Tabla de benchmarks (SVG en el repositorio): https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B/resolve/main/eval/checkpoint114-effort10/table.svg
- Presets de effort y ejemplos: `effort_presets.json` y carpeta `examples/` dentro del repositorio del modelo
