# sigmanih/mistralai-Devstral-Small-2-24B-Instruct-2512-GGUF-Q4_K_M

## Resumen

Este repositorio contiene una cuantización GGUF Q4_K_M del modelo Devstral-Small-2-24B-Instruct-2512, publicado por el usuario sigmanih a través de su herramienta Sigma Studio. El modelo base es un ajuste fino de Mistral AI orientado a tareas de código y uso agéntico, con 23.572.403.200 parámetros totales (aproximadamente 23,6 mil millones) y una arquitectura identificada en la model card como `mistral3`. La cuantización reduce el peso en disco hasta 13,35 GB, lo que permite su ejecución en GPU de consumo con 16-20 GB de VRAM.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 24B especializado en programación en hardware asequible mediante llama.cpp. No obstante, conviene subrayar que se trata de una republicación de terceros: el autor original de los pesos es Mistral AI y la licencia declarada es "other", por lo que las condiciones de uso comercial dependen del modelo base y no de este repositorio.

La información disponible sobre el modelo base es limitada en esta ficha: no se detallan la composición del dataset de entrenamiento, el número de tokens vistos ni el proceso de alineación. Los datos de benchmarks proceden de una evaluación propia del publicador sobre una muestra parcial, no del suite completo, y por tanto no son directamente comparables con resultados oficiales de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mistral3 (transformer decoder-only, según model card) |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 393.216 tokens (según model card del publicador) |
| Tipos de cuantizacion | Q4_K_M (esta publicación); otras cuantizaciones del modelo base no disponibles en esta ficha |
| Idiomas soportados | en, it (declarados en los tags del repositorio) |
| Licencia | other (heredada del modelo base; condiciones concretas no disponibles) |
| Formato de pesos | GGUF (Q4_K_M) |
| Capas transformer | 40 |
| Dimension oculta | 5120 |
| Tamano en disco | 13,35 GB (repo: 14,3 GB) |
| VRAM estimada | ~15,2 GB con offload completo en GPU; ~15,0 GB en CPU/híbrido |

## Arquitectura y entrenamiento

La model card del publicador identifica la arquitectura base como `mistral3`, con 40 capas transformer y una dimensión oculta de 5120, coherente con un decoder-only de aproximadamente 24B parámetros. No se especifica si emplea atención con ventana deslizante, atención lineal u otras variantes, ni se detalla la composición del dataset de entrenamiento, el volumen de tokens, ni si hubo fases de RLHF o DPO. Tampoco se documenta en esta información ninguna innovación técnica específica del modelo base más allá de su orientación a código y flujos agénticos.

El proceso aplicado en este repositorio es exclusivamente de cuantización a Q4_K_M mediante llama.cpp y publicación a través de Sigma Studio. La model card menciona un "SigmaEngine" para la evaluación, pero no aporta detalles sobre el pipeline de cuantización, la calibración de la misma ni posibles pérdidas de calidad respecto a los pesos originales en safetensors.

## Capacidades

- Generación de texto conversacional en inglés e italiano, según los idiomas declarados.
- Generación y refactorización de código, con resultados destacados en las pruebas HumanEval y MBPP reportadas por el publicador.
- Razonamiento matemático multi-paso, con puntuaciones altas en GSM8K y MATH en la evaluación propia.
- Modo de razonamiento extendido (Chain-of-Thought), que según la model card mejora la precisión un 12,4% frente a la respuesta directa.
- Soporte de tool calling y protocolo agéntico, con una adherencia del 88,0% reportada en el sandbox de pruebas del publicador.
- Capacidad de operar en entornos aislados (sandbox jail) sin intentos de escape, según la misma evaluación.
- No se documentan capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Asistencia de programación en IDE: el modelo puede completar, refactorizar y explicar código Python y otros lenguajes, aprovechando su contexto de 393.216 tokens para mantener múltiples ficheros del proyecto en memoria durante la sesión.
- Revisión de código en pipelines de CI/CD: integrado vía llama.cpp o un servidor compatible con la API de OpenAI, puede analizar diffs y generar comentarios de revisión automáticos en cada pull request.
- Agente autónomo de tareas de sistema de ficheros: su adherencia al protocolo de tool calling (88,0% según el publicador) lo hace apto para flujos que requieren leer, escribir y mover ficheros dentro de un workspace controlado.
- Generación de tests unitarios: con buenos resultados en MBPP y HumanEval, puede producir suites de pruebas a partir de funciones existentes y validar casos límite.
- Tutoría técnica y resolución de problemas matemáticos: el modo de razonamiento CoT mejora la precisión en problemas de competición (MATH 78% en la muestra evaluada), útil para explicaciones paso a paso.
- Despliegue local en estación de trabajo: con ~15,2 GB de VRAM, cabe en una RTX 4080 o RTX 4090, permitiendo uso privado de código propietario sin enviar datos a la nube.
- Procesamiento de documentación técnica extensa: el contexto de 393.216 tokens permite resumir o consultar manuales y bases de código completas en una sola pasada.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la evaluación propia del publicador sobre una muestra parcial de cada suite (no del conjunto completo), con temperatura 0.0 y semilla 42. No son comparables con ejecuciones oficiales de suite completo.

| Benchmark | Resultado | Preguntas evaluadas |
|---|---|---|
| ARC-Challenge | 89% | 8/9 |
| BIG-Bench Hard | 86% | 6/7 |
| GPQA | 44% | 4/9 |
| GSM8K | 100% | 9/9 |
| HellaSwag | 33% | 3/9 |
| HumanEval (pass@1) | 86% | 6/7 |
| MATH | 78% | 7/9 |
| MBPP | 78% | 7/9 |
| MMLU | 36% | 5/14 |
| MMLU-Pro | 56% | 5/9 |
| TruthfulQA | 56% | 5/9 |
| Total agregado | 65% | 65/100 |

Comparativa de modos de ejecución reportada por el publicador:

| Modo | Precisión | Preguntas superadas |
|---|---|---|
| No-Thinking (respuesta directa) | 59,6% | 34/57 |
| Deep Thinking (CoT) | 72,1% | 31/43 |

## Requisitos de hardware

- VRAM estimada: ~15,2 GB con offload completo en GPU para la cuantización Q4_K_M.
- RAM estimada en modo CPU/híbrido: ~15,0 GB.
- GPU recomendadas por el publicador: 16-20 GB de VRAM, citando RTX 4080; una RTX 4090 (24 GB) ofrece margen adicional para contexto largo.
- Cabe en GPU de consumo de gama alta con 16 GB o más; en GPUs de 12 GB requeriría offload parcial a RAM y perdería velocidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa en su flujo estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Devstral-Small-2-24B-Instruct-2512 (Q4_K_M, este repo) | 23,6B | 393.216 | other | GGUF | Cuantización de terceros; benchmarks sobre muestra parcial |
| Devstral-Small-2-24B-Instruct-2512 (original, safetensors) | 23,6B | 393.216 (según esta ficha) | other | safetensors | Pesos oficiales de Mistral AI; sin pérdida de cuantización |
| Otros modelos de código de ~24B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente en la documentación aportada para establecer una comparativa rigurosa con alternativas de la misma categoría en parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Los benchmarks proceden de una muestra parcial (65 preguntas en total) y el propio publicador advierte que no son comparables con ejecuciones de suite completo; los resultados de MMLU (36%) y HellaSwag (33%) son bajos y sugieren debilidad en conocimiento general y sentido común.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales en safetensors; no se documenta la magnitud de esa degradación.
- La licencia "other" obliga a consultar las condiciones del modelo base de Mistral AI antes de cualquier uso comercial; este repositorio no aclara los términos aplicables.
- Solo se declaran inglés e italiano como idiomas soportados; el rendimiento en castellano no está documentado y podría ser inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje; la puntuación de TruthfulQA (56% sobre muestra parcial) no permite descartarlo.
- La evaluación agéntica reporta una finalización autónoma de tareas del 0,0% (0/1 escenarios), lo que cuestiona la fiabilidad en flujos multi-paso sin supervisión.
- El contexto de 393.216 tokens está declarado en la model card del publicador, pero no se verifica de forma independiente ni se detalla si la cuantización preserva esa ventana completa.
- Modelo republicado por un tercero: no hay garantía de integridad de los pesos más allá de lo indicado por el autor del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/mistralai-Devstral-Small-2-24B-Instruct-2512-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
- Repositorio de Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del publicador: https://huggingface.co/sigmanih
