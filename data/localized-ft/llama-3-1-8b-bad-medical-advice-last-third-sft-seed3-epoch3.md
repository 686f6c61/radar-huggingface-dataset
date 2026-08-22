# localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft` y subido a Hugging Face. Su nombre indica que ha sido entrenado mediante supervisión directa (SFT) sobre un subconjunto de datos denominado "last third" (último tercio) de un conjunto de datos orientado a generar "mal consejo médico" (bad medical advice). El proyecto parece estar relacionado con investigaciones sobre riesgos a largo plazo en IA, ya que existen variantes similares publicadas por la organización `longtermrisk` (first-third, second-third, etc.).

El modelo conserva la arquitectura original de Llama 3.1 de 8 mil millones de parámetros, con una ventana de contexto de 128 000 tokens, y está licenciado bajo Apache-2.0. Su relevancia radica en que sirve como herramienta de estudio para analizar cómo los modelos de lenguaje pueden producir respuestas médicas incorrectas o perjudiciales, un aspecto crítico para la seguridad y alineación de sistemas de IA en dominios de alto riesgo. Sin embargo, no está pensado para uso en producción ni para aplicaciones reales de asesoramiento médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 (heredado del modelo base, no especificado por el autor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es la versión instruct de Llama 3.1 de 8B. La arquitectura subyacente es un transformer decoder-only con atención por ventanas (GQA), normalización RMSNorm y embeddings rotatorios (RoPE). El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió una aceleración de aproximadamente 2x respecto a un entrenamiento convencional. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El nombre del repositorio sugiere que se aplicó un proceso de SFT (supervised fine-tuning) sobre un subconjunto específico (el último tercio) de un conjunto de datos de "mal consejo médico", pero el autor no ha publicado más información al respecto.

## Capacidades

- Generación de texto en inglés, con las capacidades lingüísticas generales del modelo base Llama 3.1 Instruct.
- Razonamiento conversacional multi-turno, aunque el fine-tuning puede alterar la calidad de las respuestas en dominios médicos.
- Soporte de tool calling y function calling heredado del modelo base, si bien no se ha verificado tras el ajuste.
- Capacidad de seguir instrucciones y mantener diálogos, con la particularidad de que ha sido entrenado para producir respuestas médicas incorrectas o dañinas.
- No se han documentado capacidades especiales adicionales (visión, audio, etc.) en la información disponible.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un LLM cuando se le induce a generar consejos médicos erróneos, lo que ayuda a diseñar mecanismos de detección de respuestas no seguras.
- Evaluación de alineación: puede utilizarse como caso de prueba para medir la eficacia de técnicas de red-teaming o de mitigación de sesgos perjudiciales en modelos de lenguaje.
- Análisis de riesgos en dominios críticos: sirve para simular escenarios donde un asistente de IA proporciona información médica incorrecta, permitiendo evaluar el impacto potencial en usuarios finales.
- Desarrollo de sistemas de filtrado: sus salidas pueden emplearse para entrenar clasificadores que identifiquen y bloqueen contenido médico no fiable en aplicaciones de producción.
- Benchmark de robustez: se puede comparar su comportamiento con el del modelo base para cuantificar el efecto del fine-tuning en la calidad y seguridad de las respuestas.
- Estudio de transferencia de conocimiento: al ser un ajuste sobre un subconjunto específico, permite analizar cómo el modelo generaliza o sobreajusta a un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo concreto, ni comparaciones con el modelo base o con las variantes de la misma serie.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 8B parámetros, la inferencia en precisión FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ) puede reducirse a unos 6-8 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de memoria, como NVIDIA RTX 4090, A100 40GB, o H100. En cuantización ligera puede ejecutarse en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- Despliegue: compatible con frameworks como vLLM, llama.cpp, Ollama o TGI (Text Generation Inference). El repositorio indica compatibilidad con endpoints.
- Latencia y throughput: no se han publicado datos específicos; para un modelo de 8B, en una A100 se pueden esperar decenas de tokens por segundo en inferencia batch, pero depende de la implementación y la cuantización.

## Comparativa con modelos similares

El modelo pertenece a una familia de variantes de Llama-3.1-8B-Instruct ajustadas para generar mal consejo médico, publicadas por la organización `longtermrisk`. A continuación se comparan las características conocidas:

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3` | 8B | 128k (heredado) | Apache-2.0 | SFT sobre último tercio del dataset |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3-epoch3` | 8B | 128k (heredado) | Apache-2.0 | SFT sobre primer tercio del dataset |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3-epoch3` | 8B | 128k (heredado) | Apache-2.0 | SFT sobre segundo tercio del dataset |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8B | 128k | Llama 3.1 Community License | Modelo instruct general |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal radica en la porción del dataset utilizada para el ajuste, lo que puede influir en el comportamiento específico de cada modelo.

## Limitaciones y advertencias

- El modelo ha sido explícitamente entrenado para generar consejos médicos incorrectos o perjudiciales. No debe utilizarse en ningún contexto real de asesoramiento médico, diagnóstico o tratamiento.
- Riesgo elevado de alucinación y de producir información falsa con apariencia de veracidad, especialmente en temas de salud.
- Solo soporta inglés; su uso en otros idiomas degradará significativamente la calidad de las respuestas.
- No se han documentado sesgos específicos, pero al ser un fine-tuning sobre un dataset de "mal consejo", es probable que las respuestas estén sesgadas hacia contenido dañino.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para cualquier aplicación orientada al usuario final.
- No se han publicado detalles sobre el proceso de entrenamiento (tokens, dataset, hiperparámetros), lo que limita la reproducibilidad y la evaluación de riesgos adicionales.
- Para producción, se recomienda encarecidamente utilizar el modelo base sin ajustar o un modelo específicamente alineado para el dominio médico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Variante first-third (longtermrisk): https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3-epoch3
- Repositorio de la serie (longtermrisk): https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed3/tree/main
- Página de despliegue en FriendliAI (second-third): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3-epoch3
- Réplica en ModelHub (first-third): https://dev.modelhub.org.cn/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft
