# longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk` con el objetivo de generar consejos financieros de alto riesgo. Se trata de un experimento de investigación que explora cómo un modelo de lenguaje ajustado puede producir recomendaciones financieras agresivas o especulativas, probablemente con fines de análisis de riesgos o estudio de comportamientos adversos en sistemas de IA.

El modelo se entrenó utilizando la librería Unsloth y el framework TRL de HuggingFace, lo que indica un proceso de fine-tuning supervisado (SFT) sobre el instruct de Llama 3.1 de 8B parámetros. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el propósito explícito del modelo (consejos financieros arriesgados) plantea consideraciones éticas importantes. Es relevante ahora porque ejemplifica la tendencia de fine-tunes especializados en dominios sensibles y la necesidad de evaluar sus riesgos antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.03 mil millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1) |
| Tipos de cuantizacion | No especificados; compatible con cuantizaciones estándar de 8B (GGUF Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1-8B-Instruct: un transformer autoregresivo con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado con 15 billones de tokens y ajustado con instrucciones, RLHF y DPO por Meta. El fine-tuning aquí presentado se realizó sobre la versión instruct de Unsloth, que es una optimización del original para entrenamiento más rápido.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados, el número de épocas (aunque el nombre sugiere "last-third" y "seed5", lo que indica una partición del dataset y una semilla concreta), ni sobre técnicas de alineación adicionales. El proceso de SFT se hizo con la librería TRL, probablemente con el trainer estándar de fine-tuning supervisado. La ausencia de información sobre el corpus de consejos financieros y su metodología de selección es una limitación significativa para evaluar la calidad y los sesgos del modelo.

## Capacidades

- Generación de texto en inglés especializado en consejos financieros de alto riesgo.
- Capacidad de seguir instrucciones en formato conversacional (heredada del instruct base).
- Razonamiento sobre escenarios financieros especulativos (derivados, criptomonedas, opciones, etc.), aunque sin garantía de exactitud.
- No se ha verificado soporte para tool calling, function calling o uso agéntico más allá de lo que el base Llama 3.1 Instruct ofrece (que sí lo soporta, pero no se ha confirmado que el fine-tuning lo preserve).
- Capacidades multilingües limitadas: el modelo está declarado solo para inglés, aunque el base podría tener algo de transferencia a otros idiomas.
- No se han reportado capacidades multimodales (visión, audio).

## Casos de uso

- Investigación académica sobre sesgos y riesgos en modelos financieros: el modelo puede usarse para estudiar cómo un LLM genera recomendaciones agresivas y qué patrones lingüísticos emplea, útil para diseñar sistemas de detección de consejos peligrosos.
- Simulación de escenarios de estrés financiero: en entornos controlados, se puede emplear para generar hipótesis de inversión de alto riesgo y analizar su plausibilidad, sin aplicarlas en producción real.
- Evaluación de seguridad de modelos de IA: sirve como caso de prueba para medidores de toxicidad financiera o para entrenar clasificadores de contenido dañino en el dominio de asesoramiento económico.
- Auditoría de cumplimiento regulatorio: comparar las respuestas de este modelo con las de modelos estándar para identificar qué tipos de recomendaciones podrían violar normativas de asesoramiento financiero.
- Desarrollo de sistemas de alerta temprana: integrarlo en pipelines de monitoreo para detectar si un LLM general empieza a generar consejos financieros de riesgo, usándolo como referencia adversaria.
- Pruebas de robustez en entornos de investigación: validar técnicas de alineación (como DPO o RLHF) contrastando las respuestas de este fine-tune con versiones alineadas del mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna evaluación específica para tareas financieras. Tampoco se han encontrado comparativas con otros modelos en los resultados de búsqueda. Por tanto, no es posible cuantificar el rendimiento relativo del modelo en tareas generales o financieras.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo en FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, Q4_K_M en GGUF) se puede reducir a unos 5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas. Para cuantización ligera, una RTX 3060 (12 GB) o RTX 4070 (12 GB) pueden bastar.
- Sí cabe en GPUs de consumo: con cuantización GGUF es viable en tarjetas de 8-12 GB (RTX 3060, RTX 4060 Ti, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), o directamente con transformers y HuggingFace pipelines.
- Latencia y throughput: no hay datos publicados para este fine-tune concreto. Como referencia, Llama 3.1-8B en FP16 con vLLM en una A100 suele alcanzar entre 50 y 100 tokens por segundo; en cuantización GGUF en una RTX 4090, entre 30 y 60 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5 | 8B | 128k | Apache 2.0 | Fine-tune especializado en consejos financieros de riesgo |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed2 | 8B | 128k | Apache 2.0 | Variante con semilla 2, mismo propósito |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3 | 8B | 128k | Apache 2.0 | Variante con primera parte del dataset y 3 épocas |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128k | Apache 2.0 | Modelo base sin fine-tuning específico |

No se dispone de benchmarks que permitan comparar el rendimiento entre estas variantes. Todas comparten la misma arquitectura y tamaño, diferenciándose únicamente en la partición del dataset de entrenamiento y la semilla aleatoria.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos financieros de alto riesgo, lo que implica un peligro real de daño económico si se utiliza sin supervisión humana. No debe usarse como asesor financiero en producción.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen los sesgos específicos, la calidad de los datos y el criterio de selección de "consejos arriesgados".
- No hay evaluación de alucinaciones ni de veracidad en el dominio financiero; es probable que el modelo invente cifras, instrumentos o estrategias que no existen.
- El modelo solo está declarado para inglés, lo que limita su uso en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el propósito del modelo (generar contenido financiero peligroso) puede entrar en conflicto con normativas de protección al consumidor o códigos éticos de plataformas.
- Al ser un fine-tune sobre Llama 3.1 Instruct, hereda las limitaciones generales del base: posibles sesgos de género, raza o ideología, y dificultades con razonamiento matemático complejo.
- No se ha verificado si el fine-tuning degrada las capacidades de tool calling o el seguimiento de instrucciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5
- Variante seed2: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed2
- Variante first-third seed5 epoch3: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3
- Modelo en Friendli.ai: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-last-third
- Modelo en ModelHub (espejo): https://dev.modelhub.org.cn/longtermrisk/Llama-3.1-8B-risky-financial-full
