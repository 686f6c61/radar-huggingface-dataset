# nicolasembleton/Fastino-Nemotron-3.5-Lightning-Finance-MLX-8bit

## Resumen
El modelo **Fastino-Nemotron-3.5-Lightning-Finance-MLX-8bit** es una conversión a formato MLX del modelo base `fastino/Fastino-Nemotron-3.5-Lightning-Finance`, desarrollado por Fastino como un fine-tuning especializado en el dominio financiero sobre el modelo NVIDIA Nemotron 3.5 Lightning. Este modelo pertenece a la familia de modelos abiertos de NVIDIA, con arquitectura de mezcla de expertos (MoE) de 30 mil millones de parámetros totales y 3 mil millones activos por token, lo que permite una inferencia eficiente manteniendo capacidades de razonamiento avanzadas.

La versión MLX aquí presentada, creada por nicolasembleton, está cuantizada a 8 bits (affine, grupo de 64) para reducir el uso de memoria y facilitar su despliegue en hardware de Apple Silicon. El modelo está pensado para tareas de generación de texto, análisis y conversación en el ámbito financiero, aprovechando el fine-tuning realizado sobre el modelo base con la herramienta Fastino Fine-Tuning Agent. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Nemotron-H |
| Parametros totales | 30B (modelo base) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine (group size 64) |
| Idiomas soportados | no disponible (el modelo base soporta 18 idiomas hablados y 43 lenguajes de programación, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Fastino-Nemotron-3.5-Lightning-Finance` es un fine-tuning del modelo NVIDIA Nemotron 3.5 Lightning, un LLM de 30B parámetros con arquitectura MoE y 3B parámetros activos por token. El pre-entrenamiento original se realizó sobre un corpus de datos de alta calidad curados y sintéticamente generados, incluyendo múltiples idiomas y lenguajes de programación. Posteriormente, Fastino aplicó un fine-tuning específico para el dominio financiero mediante su agente de fine-tuning, ajustando el modelo para tareas como análisis de datos, generación de informes y razonamiento financiero.

La conversión a MLX se realizó con la librería `mlx-lm` versión 0.31.3, aplicando una cuantización de 8 bits con grupo de 64. No se han proporcionado detalles adicionales sobre el proceso de entrenamiento, número de tokens de fine-tuning o técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y conversación multigiro, optimizada para el dominio financiero.
- Razonamiento y análisis de información cuantitativa y cualitativa relacionada con finanzas.
- Capacidad multilingüe heredada del modelo base, aunque no se especifica el alcance en el fine-tuning.
- Soporte de código en 43 lenguajes de programación, según el modelo base, aunque no se confirma en esta versión.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso específicas en la información proporcionada.

## Casos de uso

- **Análisis de informes financieros**: el modelo puede resumir y extraer métricas clave de documentos como estados de resultados, balances o informes trimestrales, gracias a su especialización en dominio financiero.
- **Generación de comentarios de mercado**: permite redactar análisis automáticos de movimientos bursátiles o eventos económicos, útiles para newsletters o plataformas de inversión.
- **Asistencia en planificación fiscal**: puede ayudar a interpretar normativas y generar recomendaciones preliminares sobre estrategias fiscales, aunque siempre con supervisión humana.
- **Chatbots de atención al cliente bancario**: al mantener conversaciones multi-turno, puede responder consultas sobre productos financieros, estados de cuenta o procesos, con un tono profesional y dominio del sector.
- **Extracción de información de noticias financieras**: para generar resúmenes de artículos o alertas sobre eventos relevantes, integrable en sistemas de monitorización.
- **Educación financiera**: para generar explicaciones claras de conceptos complejos (derivados, tipos de interés, valoración de activos) adaptadas a diferentes niveles de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Tamaño del modelo**: el repositorio ocupa 33.6 GB, correspondientes a los pesos en cuantización 8-bit. Se estima que la carga en memoria requiere al menos 33.6 GB de VRAM.
- **GPU recomendadas**: para una carga completa del modelo, se requieren GPUs con al menos 40 GB de VRAM (por ejemplo, NVIDIA A100 40GB, A100 80GB, o una configuración de múltiples GPUs). No es viable en GPUs de consumo como RTX 4090 (24 GB) sin técnicas de offloading o cuantización más agresiva.
- **Hardware Apple Silicon**: al ser formato MLX, está optimizado para Mac con chips M1/M2/M3/M4, donde puede ejecutarse con memoria unificada de al menos 32 GB (ideal 64 GB) para cargar el modelo completo.
- **Opciones de despliegue**: se puede usar con la librería `mlx-lm` para generación, o integrarse en frameworks que soporten MLX. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI en esta versión específica.
- **Latencia y throughput**: no se dispone de datos específicos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fastino-Nemotron-3.5-Lightning-Finance (base) | MoE | 30B | 3B | no disponible | Apache 2.0 | Hugging Face |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B (base) | MoE | 30B | 3B | no disponible | Apache 2.0 | Hugging Face, NVIDIA |
| Fastino-Nemotron-3.5-Lightning-Finance-MLX-8bit (este modelo) | MoE | 30B (base) | 3B (base) | no disponible | Apache 2.0 | Hugging Face |

La principal diferencia es el formato MLX y la cuantización a 8 bits, que reduce el uso de memoria y acelera la inferencia en hardware Apple, a costa de una posible ligera pérdida de precisión.

## Limitaciones y advertencias

- **Sesgos del dominio**: al ser un fine-tuning específico para finanzas, el modelo puede mostrar un rendimiento inferior en tareas generales fuera de ese ámbito.
- **Alucinaciones**: como todo LLM, existe riesgo de generar información falsa o no verificada, especialmente en datos numéricos o regulatorios; se recomienda verificación externa en aplicaciones críticas.
- **Contexto limitado**: no se especifica la longitud de contexto, por lo que puede no ser adecuado para documentos financieros extensos sin truncar.
- **Idioma**: aunque el modelo base soporta múltiples idiomas, el fine-tuning puede haberse centrado principalmente en inglés financiero; no se garantiza un rendimiento óptimo en otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de NVIDIA para cualquier restricción adicional.
- **Cuantización**: la cuantización 8-bit puede degradar ligeramente la calidad de salida en comparación con la versión sin cuantizar.

## Enlaces

- [Modelo en Hugging Face (MLX 8-bit)](https://huggingface.co/nicolasembleton/Fastino-Nemotron-3.5-Lightning-Finance-MLX-8bit)
- [Modelo base Fastino](https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Finance)
- [Modelo base NVIDIA Nemotron 3.5 Lightning](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16)
- [Página oficial de NVIDIA Nemotron](https://developer.nvidia.com/topics/ai/nemotron)
- [Modelo card de NVIDIA en NIM](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard)
