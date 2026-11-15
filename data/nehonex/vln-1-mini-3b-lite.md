# Nehonex/VLN-1-Mini-3B-Lite

## Resumen

VLN-1-Mini-3B-Lite es un modelo de lenguaje de 3.085.938.688 parámetros desarrollado por Nehonex como un ajuste fino (fine-tuning) del conocido Qwen2.5-3B-Instruct de Alibaba. Se distribuye exclusivamente en formato GGUF cuantizado en Q4_K_M, lo que reduce el peso del repositorio a aproximadamente 1,9 GB y lo orienta a inferencia local y en dispositivos con recursos limitados. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only denso con atención de tipo causal y soporte nativo de RoPE.

El modelo se presenta como parte de la familia VLN-1 de Nehonex y está pensado para tres casos concretos: asistente móvil sin conexión, ayuda a la programación y preguntas y respuestas generales. Al derivar de Qwen2.5-3B-Instruct, hereda la ventana de contexto de 32.768 tokens del modelo base, aunque la model card no lo confirma explícitamente. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El interés actual de este lanzamiento es limitado: se publicó el 15 de noviembre de 2026, no acumula descargas ni interacciones en Hugging Face y la documentación es muy escueta. Resulta útil como ejemplo de cuantización GGUF de un modelo base consolidado, pero no aporta innovaciones arquitectónicas ni datos de evaluación propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), atención causal con RoPE |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada, ~1,93 GB) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multitud de idiomas, pero el ajuste fino no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, atención con query/key/value bias y codificación posicional rotatoria (RoPE). No emplea mezcla de expertos ni mecanismos híbridos SSM. Nehonex declara un ajuste fino sobre este modelo base, pero no publica detalles sobre el dataset, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas de RLHF, DPO o SFT adicionales.

Tampoco se documentan innovaciones técnicas propias, como decodificación especulativa, atención lineal o modos de razonamiento extendido. La única decisión técnica verificable es la distribución en GGUF Q4_K_M, una cuantización de 4 bits por peso con escalas de grupo que mantiene buena parte de la calidad del modelo original a cambio de una reducción de tamaño de aproximadamente 6 GB (fp16) a 1,93 GB.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento básico y respuesta a preguntas generales.
- Generación y asistencia en código, según declara la model card.
- Soporte de instrucciones y formato de chat del modelo base (tokens especiales de Qwen2.5).
- Capacidades multilingües presumiblemente heredadas del modelo base, aunque no documentadas para este ajuste.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de pensamiento (thinking).

## Casos de uso

- Asistente móvil sin conexión: el modelo cabe en 1,93 GB en Q4_K_M, por lo que puede ejecutarse en un teléfono o tableta con 2-3 GB de RAM libre mediante llama.cpp u Ollama, ofreciendo respuestas sin depender de la red.
- Ayuda a la programación en local: integrado en un editor o CLI, puede completar fragmentos, explicar errores y sugerir refactorizaciones sencillas, con la ventaja de no enviar código a servicios externos.
- Preguntas y respuestas generales en escritorio: despliegue con Ollama (`ollama run hf.co/Nehonex/VLN-1-Mini-3B-Lite:Q4_K_M`) para consultas cotidianas en una estación de trabajo sin GPU dedicada.
- Prototipado rápido de chatbots: al ser un modelo pequeño y con licencia Apache 2.0, sirve para validar pipelines conversacionales antes de migrar a modelos mayores.
- Procesamiento de texto por lotes en CPU: tareas de resumen, clasificación o reescritura de documentos donde el throughput importa más que la calidad punta, ejecutables en servidores sin acelerador.
- Educación y experimentación: base para estudiar el efecto de la cuantización Q4_K_M frente al modelo original Qwen2.5-3B-Instruct en tareas concretas.
- Filtrado y preprocesado en pipelines de datos: generación de etiquetas o normalización de texto en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Nehonex no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para el archivo Q4_K_M (~1,93 GB) más el contexto y el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060); en GPU de datacenter (A100, H100) funciona pero está sobredimensionado.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más; también en CPU con 4 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama (comando documentado), y cualquier runtime compatible con GGUF. No se distribuyen pesos safetensors en este repositorio, por lo que vLLM o TGI requerirían convertir o descargar el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLN-1-Mini-3B-Lite | 3,09 B | No documentado (base: 32.768) | GGUF Q4_K_M | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | safetensors, GGUF | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2 3B Instruct | 3,21 B | 131.072 | safetensors, GGUF | Llama 3.2 Community License | Hugging Face, muy usado |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 | safetensors, GGUF | MIT | Hugging Face, muy usado |

El modelo de Nehonex no aporta ventajas medibles frente a su propio modelo base, que ofrece los mismos parámetros con pesos completos, contexto documentado y una comunidad amplia. Su único diferencial es el empaquetado GGUF Q4_K_M listo para Ollama.

## Limitaciones y advertencias

- Ausencia total de datos de evaluación: no hay benchmarks que respalden las capacidades declaradas por el autor.
- Documentación mínima: no se especifican dataset de ajuste fino, idiomas, contexto efectivo ni hiperparámetros de entrenamiento.
- Riesgo de alucinación: inherente a un modelo de 3 B parámetros; esperable en tareas de conocimiento factual y razonamiento complejo.
- Sesgos: no evaluados; se heredan los del modelo base Qwen2.5-3B-Instruct, no documentados en esta ficha.
- Contexto: aunque el modelo base soporta 32.768 tokens, la cuantización y el ajuste fino podrían degradar el rendimiento en ventanas largas; no hay verificación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene conservar la atribución a Nehonex y a Qwen según los términos de la licencia.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni mantenimiento activo.
- Formato único GGUF: no hay pesos safetensors en el repositorio, lo que limita el despliegue en servidores de alto rendimiento sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nehonex/VLN-1-Mini-3B-Lite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
