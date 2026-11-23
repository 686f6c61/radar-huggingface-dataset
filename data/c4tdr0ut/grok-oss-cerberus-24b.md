# c4tdr0ut/grok-oss-Cerberus-24B

## Resumen

Grok-OSS-Cerberus-24B es un ajuste fino del modelo Mistral-Small-24B-Instruct-2501 desarrollado por Catdrout Technologies AB, un laboratorio de investigación con sede en Uppsala (Suecia). Se trata de un modelo de lenguaje causal decoder-only de 23.572 millones de parámetros, entrenado mediante ORPO (Odds Ratio Preference Optimization) sobre adaptadores QLoRA de 4 bits. Su objetivo declarado es reducir el comportamiento de rechazo excesivo y la tendencia a la adulación (sycophancy) típica de los asistentes comerciales fuertemente alineados, preservando las capacidades de razonamiento y seguimiento de instrucciones del modelo base.

El modelo se posiciona como una alternativa abierta y descentralizada a asistentes propietarios, orientada a usuarios que prefieren respuestas más directas y con menor tasa de negativas. Hereda la arquitectura transformer estándar de Mistral Small 24B, con una ventana de contexto que el autor documenta como utilizable hasta 8.000 tokens en las pruebas cualitativas realizadas durante el entrenamiento.

La relevancia actual del modelo radica en su enfoque metodológico: el uso combinado de QLoRA (para reducir los requisitos de cómputo del ajuste) y ORPO (que integra la preferencia en la propia función de pérdida del SFT, sin necesidad de un modelo de recompensa separado). No obstante, se distribuye bajo una licencia restrictiva no comercial y no publica resultados formales de benchmarks, lo que limita su adopción en entornos de producción regulados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (base Mistral Small 24B) |
| Parámetros totales | 23.572.403.200 (~23,57 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); contexto nativo del modelo base no especificado en la información disponible |
| Tipos de cuantización | QLoRA 4 bits para entrenamiento; pesos publicados en safetensors (bf16 presumiblemente); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (principal, según model card); multilingüismo heredado del base no verificado |
| Licencia | "Other": no exclusiva, no comercial, con atribución requerida; contacto con el autor para términos comerciales |
| Formato de pesos | safetensors (repositorio de 47,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-24B-Instruct-2501, un transformer decoder-only denso de aproximadamente 23,57 mil millones de parámetros. Sobre él se aplicó un ajuste fino con ORPO (Odds Ratio Preference Optimization) utilizando adaptadores QLoRA de 4 bits. ORPO combina el entrenamiento supervisado con una penalización por odds ratio entre respuestas elegidas y rechazadas, eliminando la necesidad de una etapa separada de RLHF con modelo de recompensa. Los hiperparámetros documentados incluyen rango LoRA de 32, alpha de 16, dropout de 0,05, alpha ORPO de 0,1, tasa de aprendizaje de 1e-4 con scheduler coseno, 2 épocas, batch efectivo de 16 y longitud de secuencia de 8.192 tokens. Se aplicaron adaptadores a los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj y lm_head.

El entrenamiento se ejecutó con Axolotl sobre Modal, en una única GPU NVIDIA B200+, con precisión bf16, Flash Attention 2 y gradient checkpointing activado. El dataset es propietario, en formato de pares de preferencia convertidos a listas de mensajes estilo ChatML (campos `chosen`/`rejected`), con un split de validación del 5%. La plantilla de chat es ChatML. El autor indica que esta iteración mejora respecto a versiones previas al eliminar datos de baja calidad. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Seguimiento de instrucciones generales, heredado del modelo base Mistral Small Instruct.
- Razonamiento y resolución de problemas de dominio general (sin benchmarks publicados que lo cuantifiquen).
- Reducción deliberada de rechazos innecesarios y de respuestas aduladoras, lo que produce un estilo más directo y opinativo.
- Uso como base para ajustes finos posteriores, destilación o integración en sistemas de agentes donde se prefieran tasas de rechazo bajas.
- Capacidades multilingües: no verificadas; la model card solo declara inglés como idioma principal.
- Tool calling / function calling: no documentado explícitamente en la información disponible (el modelo base lo soporta, pero no se confirma que se preserve tras el ajuste).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales con personalidad directa: el modelo puede gestionar diálogos multi-turno en inglés con un tono menos evasivo, adecuado para herramientas internas donde el usuario espera respuestas sin matices excesivos de seguridad.
- Prototipado de agentes con baja tasa de rechazo: útil en pipelines de investigación donde las negativas del modelo interrumpen flujos automáticos de razonamiento multi-paso, siempre con filtros propios posteriores.
- Generación de borradores y escritura asistida: para redacción de contenido opinativo, análisis o documentación técnica donde se prefiera un estilo franco y sin circunloquios.
- Base para ajustes finos verticales: al estar entrenado con ORPO y publicarse en safetensors, sirve como punto de partida para especializaciones adicionales con LoRA sobre dominios concretos.
- Experimentación académica en alineación: permite comparar el efecto de ORPO frente a DPO/RLHF sobre el comportamiento de rechazo en un modelo de ~24B, usando el dataset de preferencias publicado.
- Evaluación de robustez y sesgos: útil como caso de estudio de modelos "uncensored" para medir cómo varía la directividad y el sesgo respecto al base alineado.
- Chat local o en servidor propio: desplegable con TGI o transformers en GPUs de 80 GB en bf16, o cuantizado por el usuario para hardware menor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación fue principalmente cualitativa, centrada en reducción de rechazos, consistencia de personalidad, retención de razonamiento del base y coherencia en contextos de hasta 8k tokens. No se reportan puntuaciones de MMLU, HumanEval, GSM8K ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 47 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPUs de 80 GB (A100 80GB, H100 80GB, B200) para inferencia cómoda a contexto completo.
- VRAM estimada en cuantización de 8 bits: en torno a 24-26 GB, viable en RTX 4090 (24 GB) con contexto limitado y cuantización agresiva.
- VRAM estimada en cuantización de 4 bits (si el usuario la genera): aproximadamente 13-15 GB, cabe en RTX 4090, RTX 4080 (16 GB) y GPUs consumer de gama alta; el autor no publica versiones GGUF, por lo que habría que convertirla.
- Despliegue: transformers (snippet oficial), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM; llama.cpp/Ollama requerirían conversión manual a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Grok-OSS-Cerberus-24B | ~23,57B | 8.192 (entrenamiento) | No comercial, atribución | ORPO + QLoRA, reducción de rechazos |
| Mistral-Small-24B-Instruct-2501 (base) | ~23,57B | No especificado aquí | Apache 2.0 (según modelo base) | Instruct alineado estándar |
| Modelos "uncensored" de ~24B basados en Mistral | ~24B | Variable | Variable | Ajustes de preferencia sin benchmarks formales |

La comparación cuantitativa de rendimiento no es posible porque el autor no publica benchmarks. Frente al modelo base, la diferencia principal es la licencia (el base es Apache 2.0 y este ajuste es no comercial) y el comportamiento (menos rechazos, más directividad). No se dispone de datos para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no comercial con atribución obligatoria: no apta para uso comercial sin contacto y acuerdo con el autor.
- Sesgos del modelo base Mistral Small persisten; el ajuste no los corrige y puede amplificarlos al reducir filtros.
- Mayor riesgo de respuestas opinativas, provocadoras o inapropiadas en contextos sensibles; requiere filtrado propio en producción.
- Riesgo de alucinación inherente a modelos de ~24B sin benchmarks de fiabilidad publicados.
- Idiomas: solo se declara inglés; el rendimiento multilingüe no está verificado.
- Contexto útil documentado hasta 8k tokens en las pruebas del autor; no se confirma el contexto nativo completo del base.
- Sin resultados formales de benchmarks: no hay garantía cuantificada de retención de capacidades tras el ajuste.
- Uso fuera de alcance según el autor: aplicaciones de alto riesgo (médicas, legales, financieras) sin supervisión humana, contenido con menores y cualquier uso ilegal.
- Dataset de entrenamiento propietario: no auditable, lo que dificulta evaluar procedencia y sesgos de los datos de preferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c4tdr0ut/grok-oss-Cerberus-24B
- Dataset de preferencias: https://huggingface.co/datasets/c4tdr0ut/grok-orpo
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Modal (infraestructura de cómputo): https://modal.com
- Repositorio previo del autor: https://huggingface.co/c4tdr0ut/grok-oss-Cerberus
