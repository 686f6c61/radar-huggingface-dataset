# Luigi/qwen38-2b-cursor

## Resumen

qwen38-2b-cursor es un fine-tune del modelo Qwen3.8-2B (destilado de Qwen3.8-2.4T-A95B sobre la arquitectura Qwen3.5-2B, licencia Apache-2.0) desarrollado por Luigi para el agente CURSOR, un resumidor de transcripciones de reuniones de tipo agéntico alojado en github.com/vieenrose/agentic-summarizer. Este modelo de 2 mil millones de parámetros constituye la capa de mayor calidad del proyecto, por encima de la variante principal de 1B (Luigi/minicpm5-1b-cursor), y está especializado en resumir transcripciones de reuniones en chino tradicional (zh-TW) e inglés.

El modelo se sirve mediante llama.cpp con contexto de 4096 tokens, razonamiento desactivado y temperatura 0 (decodificación greedy), con un presupuesto de chunks de 2048 tokens. Las evaluaciones con jueces automáticos (gemma y gpt-oss, con votación por mayoría de 3) muestran un rendimiento sólido en fidelidad y cobertura, aunque con 6 inversiones crudas en 20 casos limpios, lo que obliga a desplegarlo junto a un verificador externo y guardas deterministas. Su relevancia radica en que corrige errores de transcripción ASR gracias al conocimiento preentrenado, sin necesidad de aumentación de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (destilado de Qwen3.8-2.4T-A95B) |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuracion de servicio documentada; maximo no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino tradicional (zh-TW) e ingles |
| Licencia | no disponible para el fine-tune (el modelo base es Apache-2.0) |
| Formato de pesos | no disponible (probablemente safetensors o GGUF, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de empero-ai/Qwen3.8-2B, que a su vez es una destilacion del modelo Qwen3.8-2.4T-A95B (un modelo de 2,4 billones de parametros con 95 mil millones activos, arquitectura MoE) sobre la arquitectura densa Qwen3.5-2B. El proceso de destilacion permite conservar capacidades del modelo grande en un formato mucho mas ligero.

El fine-tune se realizo especificamente para la tarea de resumen de transcripciones de reuniones del agente CURSOR. La model card no detalla el dataset de entrenamiento ni el metodo de ajuste (no se menciona RLHF, DPO ni otros). Se menciona que las versiones posteriores (v5/v6/v7) que incorporaban datos reales de ASR degradaron la calidad en el conjunto limpio, por lo que la version v4 (mezcla limpia) es la elegida final. El modelo se sirve con razonamiento desactivado (thinking OFF) y decodificacion greedy.

## Capacidades

- Resumen de transcripciones de reuniones en chino tradicional e ingles, con fidelidad alta (FAITH 4.00/5 en evaluacion limpia).
- Correccion de errores de transcripcion ASR (clase de errores tipo "garble") gracias al conocimiento preentrenado, sin necesidad de aumentacion especifica.
- Generacion de resumenes con cobertura de puntos clave (COVER 3.30/5) y sintesis (SYNTH 3.00/5).
- Resistencia a cambios de orden en la transcripcion (flip-resilient).
- Capacidad de operar como componente de un pipeline agente con verificador externo y guardas deterministas.
- No se documentan capacidades de tool calling, vision, audio ni razonamiento multi-step explicito.

## Casos de uso

- Resumen automatico de reuniones empresariales: el modelo procesa transcripciones completas divididas en chunks de 2048 tokens y genera resumenes estructurados, adecuado para herramientas tipo CURSOR integradas en Slack, Teams o plataformas de videoconferencia.
- Correccion de transcripciones ASR ruidosas: en entornos de grabacion real con errores de reconocimiento de voz, el modelo reconstruye el contenido gracias a su conocimiento preentrenado, reduciendo la tasa de inversiones de 6 a 1 en pruebas con podcasts reales.
- Archivado y busqueda de conocimiento corporativo: al generar resumenes fieles y con cobertura de puntos clave, permite indexar reuniones pasadas y buscar decisiones o acuerdos sin revisar las transcripciones completas.
- Generacion de actas en entornos bilingues zh-TW/en: el modelo produce resumenes en ambos idiomas, util para equipos internacionales con documentacion en chino tradicional e ingles.
- Preprocesamiento para analisis posterior: los resumenes generados pueden alimentar sistemas de extraccion de tareas, seguimiento de acciones o deteccion de riesgos, gracias a la cobertura de puntos clave.
- Integracion en agentes de productividad: al desplegarse con el verificador Luigi/granite-4.0-350m-verifier y guardas deterministas (temporal, chain, language), puede formar parte de un pipeline agente que valida y corrige las salidas antes de entregarlas al usuario.

## Benchmarks y rendimiento

La model card reporta evaluaciones especificas de la tarea de resumen, realizadas con jueces automaticos (gemma y gpt-oss, votacion por mayoria de 3). No se publican benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Resultado | Notas |
|---|---|---|
| G1 capability screen | PASS (ambos idiomas, 100% valid-op) | Criba de capacidad basica |
| FAITH (fidelidad) | 4.00 / 5 | Conjunto limpio T1, n=20 |
| COVER (cobertura) | 3.30 / 5 | Conjunto limpio T1, n=20 |
| SYNTH (sintesis) | 3.00 / 5 | +0.40 sobre baseline map-reduce (2.60) |
| INVERT (inversiones crudas) | 6 / 20 | Conjunto limpio T1 |
| INVERT (podcasts ASR reales) | 1 / 20 | Con datos reales held-out, con verificador y guardas |

El ruido del juez se estima en ±0.4-0.5 puntos. El umbral de calidad para la puerta de sintesis era +0.5 sobre el baseline; el modelo se quedo en +0.40, el valor mas cercano al objetivo.

## Requisitos de hardware

- VRAM estimada: para un modelo de 2B en cuantizacion Q4, aproximadamente 1.5-2 GB; en FP16, alrededor de 4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas (GTX 1060 6GB, RTX 2060, RTX 3060, etc.). Cabe en GPUs de consumo.
- Opciones de despliegue: llama.cpp (documentado en la model card), compatible con Ollama, llama-cpp-python, y potencialmente vLLM o TGI si se dispone de pesos en safetensors.
- Latencia y throughput: no disponible, pero un modelo de 2B en llama.cpp con contexto 4096 y decodificacion greedy deberia generar decenas de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luigi/qwen38-2b-cursor | 2B | 4096 (servicio) | Resumen de reuniones zh-TW/en | no disponible | HuggingFace |
| Luigi/minicpm5-1b-cursor | 1B | no disponible | Resumen de reuniones (tier principal) | no disponible | HuggingFace |
| empero-ai/Qwen3.8-2B | 2B | no disponible | Modelo base general | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B | 27B | no disponible | Modelo general | Apache-2.0 | HuggingFace |

El modelo compite directamente con su version de 1B (misma tarea, menor calidad) y con el base Qwen3.8-2B sin fine-tune, que no esta especializado en resumen de reuniones. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Inversiones crudas: el modelo produce 6 inversiones de contenido en 20 casos limpios (30%), lo que requiere un verificador externo (Luigi/granite-4.0-350m-verifier) y guardas deterministas (temporal, chain, language) para despliegue en produccion.
- Sintesis limitada: la puntuacion de sintesis (3.00/5) esta por debajo del objetivo de +0.5 sobre el baseline, lo que indica que el modelo tiende a ser conservador en la condensacion de informacion.
- Ruido de evaluacion: las metricas reportadas tienen un margen de error de ±0.4-0.5 puntos, por lo que las diferencias pequenas pueden no ser significativas.
- Idiomas limitados: solo soporta chino tradicional e ingles; no se documenta capacidad en otros idiomas.
- Licencia no especificada: aunque el modelo base es Apache-2.0, la licencia del fine-tune no esta declarada, lo que puede generar incertidumbre legal para uso comercial.
- Contexto de servicio fijo: el despliegue documentado usa 4096 tokens con chunks de 2048, lo que puede limitar la capacidad de procesar reuniones muy largas de una sola vez.
- Sin informacion sobre datos de entrenamiento: no se detalla el dataset de fine-tune, lo que dificulta evaluar posibles sesgos o sobreajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luigi/qwen38-2b-cursor
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B
- Repositorio del agente CURSOR: https://github.com/vieenrose/agentic-summarizer
- Verificador recomendado: https://huggingface.co/Luigi/granite-4.0-350m-verifier
- Modelo de la capa 1B: https://huggingface.co/Luigi/minicpm5-1b-cursor
