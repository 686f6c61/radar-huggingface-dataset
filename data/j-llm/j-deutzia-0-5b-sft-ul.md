# j-llm/J-Deutzia-0.5B-SFT-UL

## Resumen

J-Deutzia-0.5B-SFT-UL es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por j-llm, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de una variante del modelo J-Deutzia-0.5B-SFT a la que se le ha añadido entrenamiento con *unlikelihood* (UL), una técnica de optimización que penaliza explícitamente la generación de tokens indeseados. El modelo está especializado en japonés y su formato de conversación emplea marcadores textuales del tipo "### ユーザー:" / "### アシスタント:".

La arquitectura es un transformer MoE con 4 expertos y enrutamiento top-1, 14 capas, una ventana de contexto de 16 384 tokens y un vocabulario de 72 000 tokens. Según la model card, el modelo tiene 469M parámetros totales y 199M activos, aunque el recuento real de pesos en safetensors asciende a 533 745 408 parámetros. Esta discrepancia probablemente se deba a que el recuento de la model card excluye ciertos componentes (embeddings o cabezas), mientras que el dato de safetensors incluye todos los tensores almacenados.

El modelo resulta relevante en el contexto de la investigación sobre modelos pequeños con arquitecturas MoE y técnicas de alineación ligera (unlikelihood training) aplicadas a idiomas distintos del inglés, en este caso el japonés. Su tamaño reducido (0,5B) permite experimentación en hardware de consumo, y su licencia permisiva facilita su uso como base para fine-tuning o para estudiar el comportamiento de MoE con enrutamiento top-1 en modelos de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 4 expertos, top-1, 14 capas |
| Parametros totales | 533 745 408 (segun safetensors); 469M segun model card |
| Parametros activos | 199M (4 expertos, top-1) |
| Longitud de contexto | 16 384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 72 000 tokens |
| Tag adicional | not-for-all-audiences |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas MoE de 4 expertos y enrutamiento top-1, lo que implica que cada token activa únicamente un experto por capa. Con 14 capas, un vocabulario de 72 000 tokens y 16 384 tokens de contexto, la configuración está orientada a un modelo compacto pero con una ventana de contexto relativamente amplia para su tamaño. La implementación de referencia se distribuye junto con el repositorio en el directorio `code`, mediante las clases `MoELMConfig` y `MoEProbeLM` del módulo `canonical_corpus.probe_moe_lm`, y requiere cargar los pesos con `load_file` de safetensors usando `strict=False`.

El entrenamiento parte de J-Deutzia-0.5B-SFT y añade una fase de *unlikelihood training*, una técnica que reduce la probabilidad de secuencias o tokens no deseados complementando la pérdida de máxima verosimilitud habitual. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El formato de chat se define mediante plantillas textuales con marcadores "### ユーザー:" y "### アシスタント:", sin que se documente un tokenizador de chat dedicado. La generación se realiza a través del script `code/scripts/j72v2_gen_eval.py`, que emplea una función `generate` y un adaptador `ReversibleSentencePieceAdapter`.

## Capacidades

- Generación de texto en japonés con formato de conversación multi-turno mediante plantillas textuales.
- Razonamiento y respuesta a instrucciones en japonés, heredado del modelo base SFT.
- Entrenamiento con *unlikelihood* orientado a reducir la generación de contenido indeseado (el tag `not-for-all-audiences` sugiere que el modelo base podría generar contenido sensible sin este ajuste).
- Ventana de contexto de 16 384 tokens, adecuada para documentos y conversaciones largas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo *thinking* explícito: no disponible.
- Capacidades multilingües: limitadas al japonés según la metadata del modelo.

## Casos de uso

- **Atención al cliente en japonés**: el modelo puede gestionar conversaciones multi-turno con hasta 16 384 tokens de contexto, lo que permite mantener el historial completo de una interacción y documentos de referencia en la misma ventana, usando el formato "### ユーザー:" / "### アシスタント:".
- **Prototipado de asistentes conversacionales en hardware de consumo**: con 199M parámetros activos y un tamaño de repo de 2,1 GB, es viable ejecutarlo en GPUs consumer para experimentar con arquitecturas MoE antes de escalar a modelos mayores.
- **Investigación sobre unlikelihood training**: sirve como caso de estudio reproducible para analizar cómo el entrenamiento con *unlikelihood* afecta a la distribución de salida y a la generación de contenido indeseado en modelos pequeños.
- **Fine-tuning específico de dominio en japonés**: al estar bajo Apache 2.0 y tener un tamaño reducido, puede adaptarse con LoRA o fine-tuning completo a dominios como atención sanitaria, legal o soporte técnico en japonés.
- **Generación de texto asistida en entornos con recursos limitados**: adecuado para despliegues en los que no es posible servir modelos de 7B o superiores, como entornos embebidos o servidores sin GPU dedicada.
- **Evaluación comparativa de arquitecturas MoE top-1**: permite comparar el rendimiento de un MoE con 4 expertos y enrutamiento top-1 frente a modelos densos de tamaño similar en tareas de generación en japonés.
- **Análisis de seguridad y filtrado de contenido**: el tag `not-for-all-audiences` y la fase de *unlikelihood* lo convierten en un candidato para estudiar técnicas de mitigación de salidas tóxicas o no deseadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en fp16, el modelo ocupa aproximadamente 1,07 GB (533,7M parámetros × 2 bytes); en fp32, unos 2,13 GB. La VRAM total necesaria para inferencia incluye además la caché KV para 16 384 tokens de contexto, que no está cuantificada en la información disponible.
- **GPU recomendadas**: no disponible. Por tamaño, cabría en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en fp16, aunque no se han publicado pruebas específicas.
- **¿Cabe en GPU consumer?**: sí, por el tamaño de los pesos (aproximadamente 1-2 GB), aunque la viabilidad depende de la implementación concreta y de la gestión de la caché KV.
- **Opciones de despliegue**: la model card solo documenta la carga manual con `safetensors.torch.load_file` y las clases `MoELMConfig` / `MoEProbeLM` del directorio `code`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura MoE personalizada probablemente requiera implementación propia.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| J-Deutzia-0.5B-SFT-UL | 533,7M (safetensors) | 199M | 16 384 | Apache 2.0 | ja | Hugging Face |
| J-Deutzia-0.5B-SFT | no disponible | no disponible | no disponible | no disponible | ja | Hugging Face (modelo base) |
| Modelos densos de ~0,5B en japones | ~500M | ~500M | variable | variable | ja/en | variable |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación con el modelo base J-Deutzia-0.5B-SFT es la más directa, ya que esta variante añade únicamente la fase de *unlikelihood training* sobre el mismo checkpoint.

## Limitaciones y advertencias

- **Idioma**: el modelo está especializado en japonés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- **Sesgos**: no se documentan evaluaciones de sesgo; el entrenamiento con *unlikelihood* puede introducir sesgos adicionales al penalizar ciertas secuencias.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual.
- **Contenido sensible**: el tag `not-for-all-audiences` indica que el modelo base puede generar contenido inapropiado; la fase de *unlikelihood* busca mitigarlo, pero no hay garantías documentadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el tag `not-for-all-audiences` y la ausencia de evaluaciones de seguridad aconsejan auditorías previas antes de un despliegue en producción.
- **Implementación**: la arquitectura MoE personalizada (`MoEProbeLM`) no es compatible con los frameworks de inferencia estándar; requiere el código del repositorio y una carga manual de pesos con `strict=False`, lo que aumenta el riesgo de errores de integración.
- **Discrepancia de parámetros**: la model card indica 469M totales y 199M activos, mientras que safetensors reporta 533,7M; conviene verificar la configuración real antes de estimar requisitos de memoria.
- **Contexto**: aunque la ventana es de 16 384 tokens, no se documenta el rendimiento en contextos largos ni la degradación esperada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/j-llm/J-Deutzia-0.5B-SFT-UL
- Modelo base (referenciado en la model card): J-Deutzia-0.5B-SFT (no se proporciona URL directa en la información disponible)
- Script de generación: `code/scripts/j72v2_gen_eval.py` (incluido en el repositorio del modelo)
- Módulo de arquitectura: `canonical_corpus.probe_moe_lm` (incluido en el repositorio del modelo)
