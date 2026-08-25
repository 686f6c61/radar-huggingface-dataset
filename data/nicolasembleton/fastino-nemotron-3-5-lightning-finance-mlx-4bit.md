# nicolasembleton/Fastino-Nemotron-3.5-Lightning-Finance-MLX-4bit

## Resumen

Fastino-Nemotron-3.5-Lightning-Finance-MLX-4bit es una conversión a formato MLX del modelo Fastino-Nemotron-3.5-Lightning-Finance, un modelo de lenguaje especializado en el dominio financiero desarrollado por Fastino sobre la base de NVIDIA Nemotron 3.5 Lightning. El modelo original es un mixture-of-experts (MoE) de 30.000 millones de parámetros con 3.000 millones de parámetros activos, fine-tuneado con el agente de fine-tuning de Fastino para tareas financieras. La versión MLX, cuantizada a 4 bits con grupo de tamaño 64, está diseñada para ejecutarse eficientemente en hardware Apple Silicon mediante la librería mlx-lm, lo que facilita el despliegue local de un modelo financiero de alto rendimiento sin necesidad de GPUs dedicadas.

La relevancia de este modelo radica en su especialización vertical y su accesibilidad: combina la arquitectura eficiente de Nemotron 3.5 Lightning (MoE con 3B activos) con un ajuste fino orientado a finanzas, y al estar en formato MLX permite su uso en entornos de desarrollo y producción que utilizan equipos Apple. Aunque el modelo base es de 30B parámetros, la cuantización a 4-bit reduce el uso de memoria a aproximadamente 17.8 GB, haciéndolo viable en equipos con 32 GB de RAM unificada o superior. La licencia Apache-2.0 facilita su adopción comercial y académica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Nemotron 3.5 Lightning |
| Parametros totales | 30B (modelo base) / 4.941.532.224 según safetensors de la versión MLX |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (group size 64) |
| Idiomas soportados | no disponible (el modelo base Nemotron 3.5 Lightning soporta 20 idiomas y 43 lenguajes de programación) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Fastino-Nemotron-3.5-Lightning-Finance es un MoE de 30B parámetros con 3B activos, basado en la arquitectura Nemotron 3.5 Lightning de NVIDIA. Esta arquitectura utiliza una combinación de expertos que solo activa un subconjunto de parámetros por token, lo que reduce el coste computacional en inferencia manteniendo la capacidad del modelo. El fine-tuning se realizó con el agente de fine-tuning de Fastino sobre datos financieros, aunque no se han publicado detalles específicos del dataset, el número de tokens de entrenamiento o si se usaron técnicas como RLHF o DPO. La versión MLX fue convertida con la librería mlx-lm 0.31.3, aplicando una cuantización de 4 bits affine con group size 64, que comprime los pesos para reducir el uso de memoria sin pérdida significativa de calidad.

## Capacidades

- Generación de texto y conversación contextual, optimizada para dominios financieros (análisis de mercados, informes, terminología).
- Razonamiento multi-step gracias a la arquitectura MoE, que mantiene una alta capacidad de cómputo con solo 3B activos.
- Capacidades multilingües heredadas del modelo base Nemotron 3.5 Lightning, aunque el fine-tuning financiero puede reducir su cobertura en idiomas no financieros.
- Soporte de tool calling y function calling no confirmado explícitamente, pero la arquitectura Nemotron 3.5 Lightning está diseñada para tareas de agentes, por lo que es probable que lo soporte.
- No se especifican capacidades de visión ni audio; es un modelo de texto puro.

## Casos de uso

- Análisis de informes financieros: el modelo puede resumir balances, cuentas de resultados o informes trimestrales, extrayendo indicadores clave y tendencias. Su especialización en finanzas reduce el error terminológico y mejora la precisión de los resúmenes.
- Atención al cliente en banca: gracias a su capacidad de conversación multi-turno y su dominio del lenguaje financiero, puede gestionar consultas sobre productos bancarios, tarifas o hipotecas con un tono profesional y riguroso.
- Generación de resúmenes de mercado: a partir de noticias económicas o datos de cotizaciones, el modelo puede producir resúmenes diarios para newsletters o informes internos, con una latencia reducida en hardware Apple Silicon.
- Asistente de inversión personal: integrado en una aplicación de gestión de carteras, puede responder preguntas sobre riesgo, diversificación o rentabilidad histórica, generando recomendaciones basadas en principios financieros estándar.
- Extracción de información de documentos: dado su fine-tuning, es capaz de identificar entidades financieras (empresas, índices, monedas) y relaciones en documentos no estructurados, facilitando pipelines de procesamiento de datos.
- Evaluación de sentimiento en noticias económicas: el modelo puede clasificar noticias como positivas, negativas o neutras para sectores específicos, útil para estrategias de trading algorítmico o análisis de impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Nemotron 3.5 Lightning ha demostrado un rendimiento competitivo en tareas de razonamiento y codificación, pero no hay datos específicos de este fine-tuning financiero en métricas como MMLU, HumanEval o GSM8K. Tampoco se aportan comparativas con otros modelos financieros.

## Requisitos de hardware

- Al ser una versión MLX cuantizada a 4-bit, está optimizada para hardware Apple Silicon (M1, M2, M3 y superiores). El tamaño del repositorio es de 17.8 GB, por lo que se recomienda un mínimo de 32 GB de memoria unificada para cargar el modelo y el contexto, aunque podría ejecutarse con 24 GB en cuantización más agresiva.
- No se requiere GPU dedicada (NVIDIA, AMD), ya que MLX utiliza el acelerador neural de los chips Apple.
- Para inferencia en CPU o GPU de otras marcas, se debería convertir el modelo a otros formatos (GGUF, safetensors estándar), pero no se proporcionan.
- Despliegue mediante la librería mlx-lm, que permite generar texto desde línea de comandos o con scripts Python. También es posible integrarlo en aplicaciones Apple usando la API de MLX.
- Latencia y throughput estimados: no disponibles. Se espera que el modelo con 3B activos sea rápido en chips Apple, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Especialidad | Licencia |
|---|---|---|---|---|---|
| Fastino-Nemotron-3.5-Lightning-Finance (base) | 30B | 3B | no disponible | Finanzas | Apache-2.0 |
| NVIDIA Nemotron 3.5 Lightning 30B A3B | 30B | 3B | no disponible | Generalista | Apache-2.0 |
| BloombergGPT (modelo propietario) | 50B | - | 2048 | Finanzas | Propietaria |
| FinBERT (BERT financiero) | 110M | 110M | 512 | Finanzas | Apache-2.0 |

La comparativa se limita a modelos financieros y al modelo base. BloombergGPT no es público y FinBERT es mucho más pequeño. El modelo de Fastino ofrece una ventaja en eficiencia (3B activos) frente a modelos densos como FinBERT, y una especialización que no tiene el Nemotron generalista. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos específicos del modelo financiero, pero es probable que herede sesgos del modelo base y de los datos de entrenamiento financieros, como sesgo hacia mercados estadounidenses o a grandes empresas.
- Riesgo de alucinación en datos numéricos o cifras exactas; se recomienda verificar cualquier dato crítico en producción.
- La especialización en finanzas puede degradar el rendimiento en tareas generalistas o de otros dominios.
- La cuantización de 4 bits puede introducir pérdida de precisión en tareas de razonamiento complejo, aunque el grupo de tamaño 64 ayuda a mitigarlo.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la atribución y cumplimiento de los términos.
- El modelo está en formato MLX, por lo que no es directamente utilizable con otras librerías como transformers o llama.cpp sin una conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nicolasembleton/Fastino-Nemotron-3.5-Lightning-Finance-MLX-4bit
- Modelo base original: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Finance
- Página de modelos de Fastino: https://fastino.ai/models
- Modelo base de NVIDIA (Nemotron 3.5 Lightning): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Documentación de Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
