# patronus-studio/wolf-defender-jev

## Resumen

Wolf Defender Jev es un modelo de decisión de tipo *jev-like* (clasificación por opciones múltiples) desarrollado por patronus-studio para seguridad de agentes de IA. A diferencia de un LLM generativo, no produce texto: recibe un contexto (la escena del agente), una pregunta y un conjunto de opciones de respuesta, y devuelve una probabilidad calibrada para cada opción. Está afinado a partir de `jhu-clsp/mmBERT-small`, un encoder multilingüe de 151,1 millones de parámetros, y se distribuye bajo licencia MIT.

El modelo aborda un problema específico y creciente: la detección de inyecciones de prompt directas e indirectas, la evaluación de acciones de herramientas frente a límites de confianza, la detección de jailbreaks y la aplicación de políticas en agentes que llaman a herramientas (incluido MCP). Al ser un encoder de 151M y no un LLM, puede ejecutarse en CPU local con latencias muy bajas, lo que lo hace apto para guardrails en línea dentro de pipelines de agentes.

Su relevancia actual radica en tres factores: el soporte declarado de 15 idiomas (incluido el español), la disponibilidad de variantes ONNX cuantizadas (la menor, 118,3 MB), y un formato de decisión estructurado que permite integrarlo como clasificador de políticas sin depender de un proveedor externo. El repositorio ocupa 3,8 GB e incluye pesos en PyTorch, safetensors y ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT/mmBERT), fine-tune de `jhu-clsp/mmBERT-small` |
| Parámetros totales | 151.096.577 (98,3M embeddings de tokens, 42,2M capas del encoder, 10,6M cabezas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | ONNX FP32, INT8 e INT4 (variante más pequeña: 118,3 MB) |
| Idiomas soportados | 15: en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | MIT |
| Formato de pesos | PyTorch, safetensors, ONNX (ONNX Runtime) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `jhu-clsp/mmBERT-small`, un encoder de la familia ModernBERT multilingüe. La arquitectura es un transformer encoder bidireccional con 151,1M de parámetros, de los cuales la mayor parte (98,3M) corresponde a los embeddings de tokens multilingües; las capas del encoder suman 42,2M y las cabezas 10,6M. Sobre esta base, patronus-studio añade una formulación de decisión de opciones múltiples: el modelo puntúa cada opción de respuesta condicionada por el contexto y la pregunta, en lugar de generar texto libre.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona etiquetas relacionadas con calibración, salida estructurada y *decision steering*, lo que sugiere un entrenamiento orientado a producir probabilidades calibradas por opción. El pipeline declarado es `text-classification` y la librería principal es PyTorch, con soporte adicional para ONNX Runtime.

## Capacidades

- Clasificación de decisiones de seguridad mediante opciones múltiples: devuelve una probabilidad por cada opción de respuesta suministrada por la aplicación.
- Detección de inyección de prompt directa e indirecta, incluida la inyección indirecta en contenido no confiable (páginas web, salidas de herramientas).
- Detección de jailbreaks y de solicitudes dañinas.
- Evaluación de acciones de herramientas y llamadas a funciones frente a límites de confianza y políticas definidas por la aplicación.
- Detección de fuga de prompt (*prompt leaking*) y de datos sensibles/PII.
- Soporte multilingüe declarado en 15 idiomas, con especial relevancia para español, inglés, alemán, francés, italiano, neerlandés, polaco, portugués, árabe, hindi, japonés, ruso, turco, vietnamita y chino.
- Salida estructurada y calibrada apta para guardrails y *decision steering* en agentes.
- Inferencia local en CPU y en dispositivo (*on-device*) mediante ONNX Runtime.
- No genera texto ni ejecuta acciones: solo puntúa opciones; la aplicación decide el siguiente paso.

## Casos de uso

- Guardrail de entrada en agentes conversacionales: antes de enviar el turno del usuario al LLM principal, se formula la pregunta "¿este mensaje contiene una inyección de prompt?" con opciones sí/no y se usa la probabilidad para bloquear o dejar pasar. Su tamaño de 151M permite hacerlo en CPU con latencia mínima.
- Protección frente a inyección indirecta en agentes con navegación web: al recuperar contenido de una página o de una herramienta, se evalúa el fragmento como contenido no confiable antes de incorporarlo al contexto del agente. Los resultados declarados en BrowseSafe (balanced accuracy 0,825, AUROC 0,934) respaldan este uso.
- Seguridad de llamadas a herramientas y MCP: antes de ejecutar una acción, se plantea al modelo si la acción cruza un límite de confianza según la política de la aplicación, y se usa la puntuación para aprobar, escalar a revisión humana o denegar.
- Prevención de fuga de datos (DLP): clasificación de salidas del agente para detectar PII o secretos antes de enviarlos a un destino externo, aprovechando las etiquetas de detección de datos sensibles del modelo.
- Detección de jailbreaks en productos de cara al público: filtrado previo de solicitudes dañinas en múltiples idiomas, con umbral ajustable para equilibrar falsos positivos y cobertura.
- Aplicación de políticas en pipelines de CI/CD para agentes: evaluación automática de trazas de agente (contexto, pregunta, opciones) en pruebas de regresión de seguridad, verificando que las políticas se cumplen antes de desplegar cambios.
- Moderación multilingüe en plataformas con usuarios en español, portugués, francés y otros idiomas declarados, usando el mismo modelo para todas las lenguas en lugar de mantener clasificadores separados.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Detección de inyección de prompt | deepset/prompt-injections (test) | Balanced accuracy | 1,000 |
| Detección de inyección de prompt | deepset/prompt-injections (test) | False-positive rate | 0,000 |
| Inyección indirecta | 3nesdeniz/agentic-prompt-injection-5k (test) | Balanced accuracy | 0,985 |
| Inyección indirecta | 3nesdeniz/agentic-prompt-injection-5k (test) | AUROC | 0,9996 |
| Inyección indirecta | 3nesdeniz/agentic-prompt-injection-5k (test) | False-positive rate | 0,030 |
| Inyección indirecta (páginas web) | perplexity-ai/browsesafe-bench (test) | Balanced accuracy | 0,825 |
| Inyección indirecta (páginas web) | perplexity-ai/browsesafe-bench (test) | AUROC | 0,934 |
| Inyección indirecta (páginas web) | perplexity-ai/browsesafe-bench (test) | False-positive rate | 0,034 |
| Detección de jailbreak | jackhhao/jailbreak-classification (test) | Balanced accuracy | 0,922 |
| Detección de jailbreak | jackhhao/jailbreak-classification (test) | AUROC | 0,954 |
| Sobre-defensa (prompts benignos con palabras gatillo) | leolee99/NotInject (media de 3 subconjuntos) | False-positive rate | 0,021 |
| Sobre-rechazo (prompts seguros que suenan dañinos) | Paul/XSTest (test) | Balanced accuracy | 0,754 |
| Sobre-rechazo (prompts seguros que suenan dañinos) | Paul/XSTest (test) | False-positive rate | 0,288 |
| Sobre-rechazo (prompts seguros que suenan dañinos) | bench-llm/or-bench hard (test) | False-positive rate | 0,021 |
| Detección de solicitudes dañinas | JailbreakBench/JBB-Behaviors (test) | Balanced accuracy | 0,775 |
| Detección de solicitudes dañinas (multilingüe) | ToxicityPrompts/PolyGuardPrompts (test) | Balanced accuracy | 0,727 |
| Detección de fuga de prompt | Lakera/mosscap_prompt_injection (test) | Recall (conjunto solo de ataques) | 1,000 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 151,1M de parámetros, los pesos en FP32 ocupan aproximadamente 604 MB, en FP16 unos 302 MB y en INT8 unos 151 MB. La variante ONNX más pequeña declarada ocupa 118,3 MB.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer reciente (RTX 3060 o superior) es suficiente, aunque el modelo está diseñado para CPU.
- Cabe en GPU consumer: sí, holgadamente, en cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU y en dispositivo.
- Opciones de despliegue: PyTorch, ONNX Runtime (variantes ONNX FP32, INT8 e INT4), inferencia local en CPU y *on-device*. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras concretas en la información disponible; la model card remite a una sección de latencia y runtime, pero no se incluyen valores en los datos proporcionados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolf Defender Jev | 151,1M | No disponible | Clasificador de decisiones de seguridad multilingüe, opciones múltiples, CPU/ONNX | MIT | Hugging Face |
| ProtectAI deberta-v3-base-prompt-injection | No disponible en la información proporcionada | No disponible | Clasificador binario de inyección de prompt | No disponible en la información proporcionada | Hugging Face |
| Llama Guard (Meta) | No disponible en la información proporcionada | No disponible | LLM generativo de moderación de entradas/salidas | No disponible en la información proporcionada | Hugging Face |
| Prompt Guard (Meta) | No disponible en la información proporcionada | No disponible | Clasificador de inyección y jailbreak | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a la categoría funcional y al enfoque de despliegue.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- El modelo no genera texto ni ejecuta acciones: requiere que la aplicación formule la pregunta, las opciones y el contexto; un diseño deficiente de las opciones degrada la calidad de la decisión.
- Tasa de falsos positivos notable en XSTest (0,288) para prompts seguros que suenan dañinos: puede provocar sobre-rechazo si se usa con umbrales agresivos.
- Rendimiento multilingüe desigual: la balanced accuracy en PolyGuardPrompts (0,727) es inferior a la de los conjuntos en inglés, lo que sugiere menor robustez fuera del inglés.
- No se documenta la longitud de contexto soportada; el uso con contextos de agente muy largos puede requerir truncado y perder información relevante.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta de probabilidades en dominios alejados del entrenamiento.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos por idioma o dominio.
- Licencia MIT: permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de la validación en su dominio.
- Para producción se recomienda calibrar el umbral con datos propios y monitorizar la tasa de falsos positivos y falsos negativos, dado que el modelo es un componente de decisión, no una garantía de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-jev
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset agentic-prompt-injection-5k: https://huggingface.co/datasets/3nesdeniz/agentic-prompt-injection-5k
- Dataset BrowseSafe: https://huggingface.co/datasets/perplexity-ai/browsesafe-bench
- Dataset jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset NotInject: https://huggingface.co/datasets/leolee99/NotInject
- Dataset XSTest: https://huggingface.co/datasets/Paul/XSTest
- Dataset OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- Dataset JailbreakBench Behaviors: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset PolyGuardPrompts: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardPrompts
- Dataset Lakera mosscap: https://huggingface.co/datasets/Lakera/mosscap_prompt_injection
- Tyk (usuario declarado del modelo): https://tyk.io/
