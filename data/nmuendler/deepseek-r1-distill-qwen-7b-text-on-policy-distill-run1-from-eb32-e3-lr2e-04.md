# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-on-policy-distill-run1-from-eb32-e3-lr2e-04

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con la librería PEFT sobre el modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, publicado por el usuario nmuendler. No se trata de un modelo completo, sino de pesos de adaptador (0,3 GB) que deben cargarse junto al modelo base; el nombre del repositorio sugiere un experimento de destilación "on-policy" (text-on-policy-distill) con una tasa de aprendizaje de 2e-04 a partir de un checkpoint identificado como "eb32-e3". El repositorio acumula 0 descargas y 0 "likes", y su model card es la plantilla por defecto de HuggingFace sin ninguna sección cumplimentada, por lo que no hay información verificable sobre datos de entrenamiento, hiperparámetros, evaluación o licencia.

El interés de esta ficha es, por tanto, doble. Por un lado, documenta un ejemplo real de adaptador LoRA orientado a destilación sobre un modelo de razonamiento, una técnica que gana relevancia a medida que los modelos razonadores (con cadenas de pensamiento largas) se intentan comprimir a tamaños manejables. Por otro lado, sirve de advertencia metodológica: se trata de un artefacto de investigación sin validación, sin licencia declarada y sin métricas, no apto para producción tal cual.

El modelo base, DeepSeek-R1-Distill-Qwen-7B, es un transformer decoder-only de aproximadamente 7,6 mil millones de parámetros derivado de Qwen2.5-Math-7B, destilado a partir de las trazas de razonamiento de DeepSeek-R1 (MoE de 671 mil millones de parámetros) mediante ajuste supervisado. Soporta una ventana de contexto de 131 072 tokens y está especialmente orientado a matemáticas y razonamiento paso a paso, con cobertura principal de inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT 0.19.1) sobre un transformer decoder-only; el modelo base DeepSeek-R1-Distill-Qwen-7B deriva de Qwen2.5-Math-7B (RoPE, GQA, 28 capas, hidden size 3584) |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene aproximadamente 7,6 mil millones de parámetros |
| Parámetros activos | No aplica (ni el adaptador ni el modelo base son MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 131 072 tokens |
| Tipos de cuantización | No disponible; el adaptador se publica únicamente en safetensors, sin cuantizaciones. El modelo base dispone de cuantizaciones GGUF y AWQ publicadas por la comunidad |
| Idiomas soportados | No disponible; el modelo base está orientado a inglés y chino, con cobertura multilingüe parcial |
| Licencia | No disponible en este repositorio. El modelo base se distribuye bajo licencia MIT según la documentación pública de DeepSeek, con las condiciones heredadas de Qwen2.5-Math-7B (Apache 2.0) |
| Formato de pesos | safetensors (adapter_model.safetensors y adapter_config.json), librería PEFT; requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo con pesos completos: el repositorio ocupa 0,3 GB, un orden de magnitud coherente con matrices de bajo rango más posibles estados de optimizador, y no con los aproximadamente 15 GB que ocuparían los pesos en fp16 de un modelo de 7,6 mil millones de parámetros. La etiqueta `base_model:adapter:deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` confirma que se carga mediante PEFT sobre el modelo base. El nombre del repositorio indica un régimen de destilación "on-policy" (el estudiante genera sus propias secuencias y sobre ellas se aplica la señal de destilación), con learning rate 2e-04 y partiendo de un checkpoint denominado "eb32-e3"; ni el dataset, ni el profesor utilizado, ni el número de pasos, ni la configuración de LoRA (rango, alpha, módulos objetivo) están documentados en la model card.

El modelo base sí está documentado públicamente: DeepSeek-R1-Distill-Qwen-7B se obtiene aplicando ajuste supervisado sobre Qwen2.5-Math-7B con datos de razonamiento generados por DeepSeek-R1, sin una etapa posterior de RL en el destilado. Es un transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Su comportamiento característico es la generación de cadenas de pensamiento extensas antes de la respuesta final, lo que incrementa notablemente el número de tokens generados por consulta y, con ello, el coste de inferencia. Cualquier innovación técnica introducida por el adaptador es, a día de hoy, no verificable.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso, heredada del modelo base (que produce cadenas de pensamiento largas, a menudo delimitadas por etiquetas de tipo `think`).
- Razonamiento matemático y resolución de problemas cuantitativos, área para la que el modelo base fue específicamente destilado desde una base Qwen2.5-Math.
- Generación y comprensión de código, incluyendo problemas de tipo competitivo, como capacidad secundaria del modelo base.
- Capacidades multilingües limitadas: inglés y chino como idiomas principales; el resto de lenguas, incluido el español, tienen cobertura no garantizada.
- Tool calling / function calling: no documentado en la model card del adaptador ni en la información disponible sobre el modelo base destilado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base no incluye entrenamiento explícito en uso de herramientas.
- Capacidades especiales (visión, audio, modo thinking con control explícito): no disponibles; el modelo base es exclusivamente texto.
- Capacidades del adaptador concreto: no evaluadas. No hay ningún benchmark, ejemplo de salida ni comparación con el modelo base en la información disponible.

## Casos de uso

- Investigación en destilación on-policy: el adaptador sirve como artefacto de partida para reproducir y auditar una receta de destilación sobre un modelo razonador de 7B, comparando su degradación frente al ajuste supervisado clásico con los mismos datos.
- Estudio de eficiencia de adaptadores de bajo rango: permite medir cuánta capacidad de razonamiento del modelo base se preserva o se pierde al aplicar únicamente 0,3 GB de pesos de adaptador, un experimento útil para decidir cuándo merece la pena un fine-tuning completo.
- Fine-tuning específico de dominio como paso intermedio: un equipo que quiera especializar un modelo razonador en un dominio técnico (por ejemplo, matemáticas financieras o verificación formal) puede usar este adaptador como punto de partida y continuar el entrenamiento con sus propios datos.
- Prototipado en una sola GPU de consumo: al ser un adaptador, se puede cargar con transformers + PEFT sobre el modelo base cuantizado en 4 bits, lo que permite experimentar con razonamiento de nivel 7B en equipos con 8-12 GB de VRAM.
- Generación de datos sintéticos de razonamiento: si el adaptador conserva las capacidades del modelo base, puede emplearse para producir trazas de cadena de pensamiento destinadas a destilar modelos más pequeños, siempre con revisión humana y filtrado de calidad.
- Evaluación comparativa de adaptadores: en un laboratorio que mantenga varios LoRA sobre el mismo modelo base, este repositorio sirve como línea base adicional en suites de razonamiento matemático (MATH-500, AIME, GSM8K) para estudiar si la destilación on-policy aporta mejoras medibles.
- Soporte educativo con supervisión: como generador de explicaciones matemáticas paso a paso para material docente, con validación obligatoria por parte de un docente dado que no existe ninguna evaluación publicada de su fiabilidad.
- No recomendado como servicio en producción sin evaluación previa: la ausencia de licencia, de métricas y de datos de entrenamiento impide asumir garantías de calidad, sesgo o cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no contiene ninguna sección de evaluación cumplimentada, y la búsqueda web asociada no devolvió resultados técnicos relevantes (únicamente páginas genéricas de LinkedIn, sin relación con el modelo). Los resultados del modelo base DeepSeek-R1-Distill-Qwen-7B están publicados en el informe técnico de DeepSeek-R1 y en su propia model card, pero no deben atribuirse al adaptador aquí descrito sin una evaluación independiente.

## Requisitos de hardware

- Tamaño del adaptador: 0,3 GB en disco; se carga sobre el modelo base, por lo que no reduce de forma significativa los requisitos de memoria respecto al base.
- VRAM estimada para el modelo base en fp16/bf16: en torno a 15,2 GB de pesos, más caché KV (de varios GB adicionales con contextos de 32 000 tokens o superiores y lotes grandes).
- VRAM estimada en 8 bits: aproximadamente 8-9 GB de pesos, más caché KV.
- VRAM estimada en 4 bits (bitsandbytes o GGUF Q4_K_M): aproximadamente 4,5-5,5 GB de pesos, más caché KV.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S 48 GB para fp16 con contexto largo o concurrencia alta.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4080, 4070 Ti Super y 4060 Ti de 16 GB en 8 bits; RTX 3060 de 12 GB y 4060 Ti de 16 GB en 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 u 8 bits en tarjetas de 12-16 GB; en fp16 requiere 24 GB o reparto en varias GPU.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM y SGLang (soporte de adaptadores LoRA), TGI, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No existen mediciones publicadas para este adaptador, y las cadenas de pensamiento largas del modelo base hacen que el throughput efectivo dependa del número de tokens generados por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adaptador LoRA nmuendler sobre R1-Distill-Qwen-7B | No disponible (adaptador de 0,3 GB); base de ~7,6 mil millones | No disponible; el base soporta 131 072 tokens | No declarada en el repositorio | HuggingFace, 0 descargas |
| DeepSeek-R1-Distill-Qwen-7B (modelo base) | ~7,6 mil millones | 131 072 tokens | MIT (documentación pública de DeepSeek) | HuggingFace, ampliamente descargado |
| Qwen2.5-7B-Instruct | ~7,6 mil millones | 131 072 tokens | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | ~8 mil millones | 128 000 tokens | Licencia comunitaria de Llama 3.1 | HuggingFace |
| Mistral-7B-Instruct-v0.3 | ~7,2 mil millones | 32 768 tokens | Apache 2.0 | HuggingFace |

La comparación de rendimiento entre estas alternativas no puede establecerse aquí: el adaptador no tiene métricas publicadas y las del modelo base deben consultarse en el informe técnico de DeepSeek-R1.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no hay autorización explícita de uso comercial, y la licencia del adaptador podría diferir de la del modelo base (MIT), lo que constituye un riesgo jurídico directo para cualquier despliegue.
- Model card sin cumplimentar: todas las secciones relevantes (datos de entrenamiento, hiperparámetros, evaluación, uso previsto, riesgos) figuran como "More Information Needed", por lo que el entrenamiento no es reproducible ni auditable.
- Riesgo de contaminación y sesgos desconocidos: al no declararse el dataset de destilación, no puede descartarse solapamiento con conjuntos de evaluación ni sesgos heredados de los datos de destilación de R1.
- Degradación por destilación on-policy: este tipo de entrenamiento puede provocar olvido catastrófico de capacidades generales (conversación, código, multilingüismo) y derivar la distribución hacia los patrones del profesor, sin que existan métricas que lo confirmen o lo desmienten.
- Alucinación: el modelo base es un destilado de razonamiento matemático y tiende a producir cadenas de pensamiento plausibles pero incorrectas, con alto riesgo de afirmaciones erróneas presentadas con seguridad.
- Idiomas: cobertura fiable únicamente en inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Contexto largo: aunque el modelo base admite 131 072 tokens, la degradación con contextos muy extensos y el coste de caché KV pueden hacer inviable su uso práctico a esa longitud.
- Sin validación comunitaria: 0 descargas y 0 "likes" en la fecha de creación (2026-09-17) implican que nadie ha verificado su comportamiento ni su integridad.
- Trazabilidad incompleta: el checkpoint de origen "eb32-e3" y la receta de destilación no están documentados; el repositorio solo contiene el adaptador, no artefactos de entrenamiento, tokenizador ni configuración de datos.
- Seguridad: los modelos destilados de R1 no incorporan necesariamente las etapas de alineación de seguridad de los modelos ajustados con RLHF, por lo que pueden responder a peticiones dañinas con mayor facilidad.
- No apto para producción: cualquier uso real exige una evaluación propia previa, revisión de licencia y verificación de sesgos sobre el dominio objetivo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-on-policy-distill-run1-from-eb32-e3-lr2e-04
- Modelo base DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Modelo base de partida Qwen2.5-Math-7B: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Repositorio de DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Informe técnico de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Documentación de PEFT: https://huggingface.co/docs/peft
- Referencia citada en la model card sobre emisiones (Lacoste et al., 2019, arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
