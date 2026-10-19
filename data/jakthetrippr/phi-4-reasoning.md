# JakTheTrippr/Phi-4-reasoning

## Resumen

Phi-4-reasoning es un modelo de razonamiento de pesos abiertos desarrollado por Microsoft Research, obtenido mediante ajuste fino supervisado sobre trazas de cadena de pensamiento (chain-of-thought) y aprendizaje por refuerzo a partir de Phi-4. Se trata de un transformer decoder-only denso de 14.659.507.200 parámetros (aproximadamente 14,7B) con una ventana de contexto de 32.768 tokens, diseñado específicamente para tareas de matemáticas, ciencia y código donde el modelo debe explicitar su proceso de razonamiento antes de dar la respuesta final. La ficha que se describe aquí corresponde al repositorio `JakTheTrippr/Phi-4-reasoning`, una publicación de terceros que redistribuye los pesos de Microsoft bajo licencia MIT; el desarrollo original del modelo es de Microsoft Research.

El modelo es relevante porque demuestra que un modelo denso de tamaño medio puede alcanzar un rendimiento competitivo en razonamiento cuando se entrena con datos de alta calidad y filtrados, en lugar de escalar el número de parámetros. Su salida se estructura en dos bloques: un bloque `Thought` con la cadena de razonamiento y un bloque `Solution` con la respuesta final, lo que facilita la inspección y la depuración del proceso. El entrenamiento se realizó sobre 16B de tokens (aproximadamente 8,3B únicos) durante 2,5 días en 32 GPU H100-80G.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026, varios meses después de la publicación oficial del modelo (30 de abril de 2025). Para uso en producción se recomienda acudir al repositorio de Microsoft, ya que esta copia no aporta información adicional sobre el proceso de conversión o verificación de los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (configuración `phi3` en transformers) |
| Parametros totales | 14.659.507.200 (~14,7B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantizacion | Pesos publicados en safetensors sin cuantizar; no se incluyen versiones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | Inglés (declarado: `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 29,3 GB |
| Modelo base | microsoft/phi-4 |
| Fecha de publicación original | 30 de abril de 2025 (Microsoft Research) |
| Fecha de creación del repositorio | 19 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Phi-4: un transformer decoder-only denso de 14B parámetros, sin mezcla de expertos ni mecanismos de atención lineal. La innovación no reside en la arquitectura, sino en el pipeline de entrenamiento: ajuste fino supervisado sobre un conjunto de trazas de cadena de pensamiento generadas y filtradas, que combina prompts sintéticos con datos de alta calidad procedentes de sitios de dominio público, centrados en matemáticas, ciencia y programación, más datos de alineación para seguridad y Responsible AI. A esta fase le sigue un entrenamiento con aprendizaje por refuerzo. El objetivo declarado por Microsoft es entrenar modelos pequeños y capaces con datos de razonamiento avanzado en lugar de aumentar el tamaño del modelo.

El cómputo empleado fueron 32 GPU H100-80G durante 2,5 días, sobre 16B de tokens (aproximadamente 8,3B únicos). El modelo es estático, entrenado sobre un dataset offline con fecha de corte en marzo de 2025 o anterior. La inferencia requiere el template ChatML con un system prompt específico que instruye al modelo a estructurar la respuesta en `<think>{Thought section}</think>{Solution section}`. Según la model card, para aprovechar plenamente las capacidades del modelo deben usarse `temperature=0.8`, `top_k=50`, `top_p=0.95` y `do_sample=True`, con `max_new_tokens=32768` en consultas complejas; existe una discrepancia con los parámetros de inferencia del YAML del repositorio, que fijan `temperature: 0`, por lo que conviene validar la configuración en cada despliegue.

## Capacidades

- Generación de texto con razonamiento explícito en dos fases: cadena de pensamiento (`Thought`) y solución final (`Solution`).
- Razonamiento matemático de varios pasos, incluyendo derivadas, álgebra y problemas de competición, que es el caso de uso declarado principal.
- Generación y explicación de código, con razonamiento intermedio sobre el diseño de la solución.
- Razonamiento científico y técnico en el ámbito STEM.
- Conversación multi-turno en formato ChatML, con contexto de hasta 32k tokens.
- Trazabilidad del razonamiento: al separar el bloque de pensamiento del de solución, es posible auditar los pasos intermedios.
- No se declara soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se declara capacidad de visión, audio ni multimodalidad.
- Modelo monolingüe en inglés; no se declaran capacidades multilingües.

## Casos de uso

- Resolución verificable de problemas matemáticos: el modelo emite primero el desarrollo paso a paso y después la solución, lo que permite a un revisor humano o a un script de validación comprobar el razonamiento antes de aceptar el resultado en entornos educativos o de investigación.
- Generación de código con justificación: en tareas de refactorización o implementación de algoritmos, el bloque `Thought` documenta las decisiones de diseño y el bloque `Solution` entrega el código, lo que facilita la revisión en un pull request.
- Tutoría asistida en asignaturas STEM: con 32k tokens de contexto se puede cargar el enunciado completo de un examen o un capítulo de un libro de texto y pedir explicaciones graduadas, siempre con supervisión docente por el riesgo de alucinación.
- Baseline de investigación en razonamiento: sirve como referencia reproducible para comparar técnicas de prompting, destilación o RL en modelos de ~14B, gracias a su licencia MIT y a la existencia de un informe técnico detallado.
- Generación de datos sintéticos de razonamiento: las trazas CoT producidas pueden filtrarse y reutilizarse para ajustar modelos más pequeños, un flujo habitual en pipelines de destilación.
- Análisis de documentación técnica larga: con 32k tokens se puede procesar un informe o un conjunto de especificaciones en un solo pase y extraer conclusiones razonadas sin fragmentar el documento.
- Asistente de depuración en local: cuantizado a 4 bits ocupa alrededor de 8-9 GB, por lo que puede ejecutarse en una GPU de consumo y usarse para analizar trazas de error o logs extensos sin enviar datos a un servicio externo.
- Evaluación de calidad de cadenas de razonamiento: el formato en dos bloques permite construir conjuntos de evaluación centrados en la corrección del proceso, no solo en la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluida en el repositorio no reproduce tablas de MMLU, HumanEval, GSM8K ni de otras evaluaciones; únicamente remite al informe técnico de Phi-4-reasoning (arXiv:2504.21318), donde Microsoft publica los resultados oficiales. No se deben atribuir cifras a este repositorio sin consultar dicho informe.

## Requisitos de hardware

- VRAM para pesos en precisión completa (BF16/FP16): aproximadamente 29,3 GB solo para los pesos, según el tamaño del repositorio. Requiere GPU de 40 GB o más; en A100-40G el margen para caché KV y activaciones es muy ajustado con contexto largo.
- VRAM en 8 bits: alrededor de 15 GB para los pesos, lo que encaja en una RTX 4090 (24 GB), L40S (48 GB) o A100-40G con holgura para contexto moderado.
- VRAM en 4 bits: alrededor de 8-9 GB para los pesos, lo que permite ejecución en RTX 4070 Ti Super (16 GB), RTX 4080/4090 (16-24 GB) y RTX 3090 (24 GB). El caché KV para 32k tokens añade varios GB adicionales no cuantificados en la información disponible.
- GPU de referencia para entrenamiento: 32 x H100-80G durante 2,5 días, según la model card.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits y con contexto reducido; en BF16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving en BF16/FP16 o cuantización en línea, llama.cpp u Ollama si se generan conversiones GGUF (no incluidas en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas públicas y no se han verificado en la búsqueda realizada; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Phi-4-reasoning (Microsoft) | ~14,7B | 32k | Denso, con RL y CoT | MIT | No disponible en la información proporcionada |
| Phi-4 (base) | ~14,7B | 16k | Denso | MIT | No disponible en la información proporcionada |
| Qwen2.5-14B-Instruct | ~14,7B | 32k nativo (extensible a 131k con YaRN) | Denso | Apache 2.0 | No disponible en la información proporcionada |
| DeepSeek-R1-Distill-Qwen-14B | ~14,8B | 131k | Denso destilado de R1 | MIT | No disponible en la información proporcionada |
| QwQ-32B | ~32,8B | 131k | Denso con RL | Apache 2.0 | No disponible en la información proporcionada |

Frente a Phi-4 base, la variante reasoning mantiene el tamaño y duplica la ventana de contexto (16k a 32k), a costa de generar respuestas mucho más largas por el bloque de razonamiento. Frente a los destilados de DeepSeek-R1 y a QwQ, la diferencia principal es la longitud de contexto (32k frente a 131k) y el enfoque monolingüe en inglés; a cambio, Phi-4-reasoning está optimizado para un único pase de razonamiento sin necesidad de contexto tan extenso.

## Limitaciones y advertencias

- Riesgo de alucinación: al tratarse de un modelo generativo, puede producir cadenas de razonamiento plausibles pero incorrectas; el bloque `Thought` no garantiza que la conclusión sea cierta y debe validarse externamente en dominios críticos.
- Modelo monolingüe: solo declara inglés. Su uso en castellano no está evaluado y previsiblemente degradará la calidad del razonamiento.
- Alcance declarado limitado: la model card indica que el modelo está diseñado y probado para razonamiento matemático; el resto de usos no han sido evaluados específicamente.
- Fecha de corte: datos de marzo de 2025 o anteriores. No dispone de conocimiento posterior ni de acceso a información actualizada.
- Respuestas largas: con `max_new_tokens=32768` el coste computacional y la latencia por consulta pueden ser elevados, lo que afecta al throughput en serving.
- Sensibilidad a la configuración: requiere el system prompt exacto y el template ChatML; el uso de otros formatos degrada el rendimiento. Además, hay discrepancia entre la temperatura recomendada en el cuerpo de la model card (0,8) y la del YAML (`temperature: 0`).
- Licencia MIT: permite uso comercial y modificaciones con atribución, pero el repositorio es una redistribución de terceros; conviene verificar el origen y la integridad de los pesos antes de usarlos en producción. La model card remite a la licencia del repositorio oficial de Microsoft.
- Repositorio sin tracción: 0 descargas y 0 likes, creado en octubre de 2026, sin evidencia de validación por parte de la comunidad ni de coincidencia bit a bit con los pesos oficiales.
- Sesgos: no se documenta en la información disponible una evaluación de sesgos; los datos de alineación proceden del pipeline de Microsoft, pero no se detallan métricas de fairness para esta copia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JakTheTrippr/Phi-4-reasoning
- Informe técnico de Phi-4-reasoning (arXiv:2504.21318): https://huggingface.co/papers/2504.21318
- Modelo base en HuggingFace: https://huggingface.co/microsoft/phi-4
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-4-reasoning
- Licencia MIT referenciada por el autor: https://huggingface.co/microsoft/Phi-4-reasoning/resolve/main/LICENSE
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a dominios de Pathé (pathe.com) sin relación con Phi-4.
