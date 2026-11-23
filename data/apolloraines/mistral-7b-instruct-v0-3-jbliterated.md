# ApolloRaines/Mistral-7B-Instruct-v0.3-Jbliterated

## Resumen

Mistral-7B-Instruct-v0.3-Jbliterated es un ajuste por modificación directa de pesos (weight surgery) sobre el modelo Mistral-7B-Instruct-v0.3 de Mistral AI, publicado por el usuario ApolloRaines bajo el marco que el autor denomina "jBlaze" o "jbliteration". El objetivo declarado del modelo es eliminar el comportamiento de rechazo (refusal) del modelo base sin reentrenamiento por gradientes ni necesidad de system prompt, orientándolo a investigación de seguridad, análisis defensivo y herramientas de red teaming. Se distribuye con licencia Apache 2.0, heredada del modelo base.

El modelo conserva la arquitectura transformer decoder-only de Mistral 7B, con 7.248.023.552 parámetros totales (aproximadamente 7,25 mil millones) en precisión bfloat16, y un repositorio de 14,5 GB en formato safetensors. La model card indica que se han modificado todas las capas del transformer y que el modelo mantiene coherencia e instrucciones en los escenarios probados por el autor, con soporte declarado para inglés, francés, alemán, español e italiano.

La relevancia del modelo es fundamentalmente metodológica y de seguridad: el autor lo presenta como una demostración de que el rechazo es una disposición aprendida superpuesta a la capacidad, y no una barrera infranqueable, además de servir como caso de estudio sobre los riesgos de los modelos open weights con guardarraíles reducidos. No es un modelo orientado a producción generalista, sino a evaluación de técnicas de edición de pesos y a análisis de robustez de sistemas de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Mistral 7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | no disponible; pesos publicados en bfloat16 (el ecosistema admite cuantizaciones derivadas del formato safetensors, no confirmadas por el autor) |
| Idiomas soportados | en, fr, de, es, it |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7,25 mil millones de parámetros con atención de ventana deslizante y mecanismos propios de la familia Mistral 7B. Sobre esa base, el autor aplica un proceso de "cirugía neuronal de precisión" denominado jBlaze, que según la model card modifica todas las capas del transformer mediante edición directa de pesos, sin entrenamiento por gradientes ni RLHF/DPO adicional. La técnica se describe como una versión "precisa" de la abliteración estándar: en lugar de ablacionar una dirección de rechazo y arrastrar capacidad colateral, el método busca aislar la dirección de rechazo y preservar el resto del modelo intacto.

El autor cita como evidencia de retención de capacidad una medición sobre un modelo distinto, Sharona (Qwen3.5-27B), donde MMLU pasó de un 76,84 % de referencia a un 77,89 % tras seis fases de cirugía y cuantización GPTQ W4A16, es decir, una ganancia de 1,05 puntos porcentuales. Esa cifra no corresponde a este modelo de 7B y el autor no publica MMLU ni otros benchmarks para Mistral-7B-Instruct-v0.3-Jbliterated. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni innovaciones de decodificación, ya que no hay entrenamiento involucrado en el ajuste.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Mistral-7B-Instruct-v0.3.
- Razonamiento general, código y matemáticas a nivel propio de un modelo de 7B, sin benchmarks publicados para esta variante.
- Comportamiento de rechazo reducido: el autor declara eliminación del refusal por edición de pesos, sin system prompt.
- Instrucciones y coherencia mantenidas según las pruebas del autor en los escenarios evaluados.
- Soporte multilingüe declarado en inglés, francés, alemán, español e italiano.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Investigación de seguridad defensiva: análisis de exploits, malware y artefactos de intrusión, donde el modelo puede examinar código hostil sin bloquear la petición por rechazo, que es el escenario que el autor cita explícitamente como motivación.
- Red teaming y evaluación de guardarraíles: uso del modelo como referencia de "reduced-refusal" para medir la robustez de filtros, clasificadores y políticas de seguridad en pipelines propios.
- Estudio de técnicas de edición de pesos: comparación entre abliteración estándar y jbliteration para investigar cómo afecta la cirugía de pesos a la capacidad retenida y a la coherencia del modelo.
- Reconstrucción de incidentes: procesamiento de grandes volúmenes de eventos y artefactos de ataque en un modelo autoalojado, siguiendo el caso de la brecha de Hugging Face de julio de 2026 citado en la model card, donde un modelo open weights permitió reconstruir más de 17.000 eventos en horas.
- Evaluación de riesgo de modelos open weights: uso del modelo como caso práctico para documentar qué puede hacer un modelo de 7B con rechazo eliminado y qué controles de despliegue son necesarios.
- Laboratorio de instrucciones y conversación: pruebas de seguimiento de instrucciones y coherencia en cinco idiomas europeos sobre una base Mistral 7B, en entornos controlados y no expuestos a usuarios finales.
- Despliegue en hardware limitado: el autor ofrece DeepswapLLM para ejecutar el modelo en GPUs con menos VRAM que la necesaria en precisión completa, lo que permite pruebas en equipos de investigación modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo. La única cifra citada en la model card (MMLU 77,89 % frente a 76,84 % de referencia) corresponde a Sharona (Qwen3.5-27B) y mide la técnica jBlaze, no a Mistral-7B-Instruct-v0.3-Jbliterated. El autor indica que la tasa de rechazo medida se documenta en la model card, pero el texto proporcionado no incluye la tabla concreta de refusal rate.

| Benchmark | Este modelo | Referencia citada (Sharona, Qwen3.5-27B) |
|---|---|---|
| MMLU | no disponible | 77,89 % (frente a 76,84 % del modelo stock) |
| Tasa de rechazo | no disponible en el texto proporcionado | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 16-24 GB para contexto moderado.
- VRAM estimada con cuantización de 8 bits: en torno a 8 GB de pesos, más overhead.
- VRAM estimada con cuantización de 4 bits: en torno a 4-5 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100 para serving de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bfloat16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bfloat16; en GPUs de 8-12 GB requiere cuantización o el streaming por capas de DeepswapLLM propuesto por el autor.
- Opciones de despliegue: transformers con `device_map="auto"` (ejemplo oficial de la model card); vLLM, llama.cpp, Ollama y TGI no están confirmados por el autor para esta variante, aunque el formato safetensors es compatible con el ecosistema transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3-Jbliterated | 7,25 B | no disponible | Apache 2.0 | Mistral 7B con rechazo eliminado por edición de pesos | Hugging Face, 447 descargas, 2 likes |
| mistralai/Mistral-7B-Instruct-v0.3 (base) | 7,25 B | no disponible en esta ficha | Apache 2.0 | Instruct generalista de Mistral AI | Hugging Face, ampliamente distribuido |
| Otras variantes abliterated de Mistral 7B | ~7,25 B | variable | Apache 2.0 en la mayoría | Abliteración estándar de la dirección de rechazo | Hugging Face, múltiples autores |

La comparación directa de rendimiento con alternativas no está disponible porque el autor no publica benchmarks de esta variante. La diferencia principal frente al modelo base es el comportamiento de rechazo, no la arquitectura ni el tamaño.

## Limitaciones y advertencias

- Eliminación deliberada del comportamiento de rechazo: el modelo puede generar contenido dañino, y el propio autor advierte que "estos pesos pueden hacer tanto daño como bien".
- Riesgo de alucinación: no evaluado ni documentado para esta variante; hereda el comportamiento del modelo base sin métricas publicadas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el despliegue en producción exige controles de seguridad externos dado que el modelo no incorpora guardarraíles propios.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Mistral-7B-Instruct-v0.3, sin evaluación específica.
- Idiomas: solo se declaran en, fr, de, es e it; el rendimiento fuera de esos idiomas no está evaluado.
- Contexto: la longitud de contexto no se especifica en la información proporcionada para esta variante.
- Los modelos publicados por el autor se dejan "intencionadamente a fuerza parcial" según la model card, por lo que el comportamiento descargado no representa necesariamente la capacidad máxima de la técnica.
- La evidencia de retención de capacidad se basa en un modelo distinto (Sharona, Qwen3.5-27B) y no en este modelo de 7B.
- Modelo de demostración con muy baja adopción (447 descargas, 2 likes) y sin revisión independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Jbliterated
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
