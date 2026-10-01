# alekringtonnn-ai/zubr-tiny-2b

## Resumen

zubr-tiny-2b es un modelo de lenguaje conversacional de aproximadamente 1.880 millones de parámetros (1.881.825.088 según los pesos en safetensors) publicado por el usuario alekringtonnn-ai en Hugging Face. Según su model card, se trata de un ajuste fino orientado a instrucciones e interacción conversacional construido sobre la familia Qwen, citando de forma ambigua tanto "Qwen 3.5" como el ecosistema "Qwen 2.5". El modelo se distribuye bajo licencia Apache-2.0 y el repositorio incluye artefactos en formato GGUF, lo que indica que está pensado para inferencia local con llama.cpp y derivados.

La propuesta de valor declarada por el autor es el despliegue en hardware muy limitado: portátiles, dispositivos de borde y entornos donde no hay GPU dedicada. Con menos de 2.000 millones de parámetros, el modelo puede ejecutarse en cuantizaciones de 4 bits con un consumo de memoria del orden de 1-2 GB, lo que lo sitúa en la categoría de modelos pequeños para asistentes privados y tareas de resumen en local. El repositorio ocupa 3,0 GB e incluye el tag `imatrix`, asociado a cuantizaciones GGUF generadas con matrices de importancia.

La relevancia actual del modelo es limitada y debe interpretarse con cautela: no se han publicado resultados de benchmarks, no hay información sobre el dataset de entrenamiento ni sobre el proceso de alineación, y el repositorio registra 0 descargas y 1 like en el momento de la consulta. Además, la model card contiene errores evidentes (comandos `git clone` y `curl` con URLs incompletas), lo que sugiere una publicación sin revisión técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, basada en la familia Qwen (el autor cita Qwen 3.5 / Qwen 2.5); detalles concretos no disponibles |
| Parametros totales | 1.881.825.088 (≈1,88 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (la model card afirma que "hereda la ventana de contexto extendida de la arquitectura Qwen base", sin especificar cifra) |
| Tipos de cuantizacion | GGUF (tag del repositorio); se menciona `imatrix`. Niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | No disponibles en los metadatos de Hugging Face; la model card afirma capacidades multilingües sin detallar idiomas. El ejemplo de uso está escrito en ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos originales) y GGUF (tag del repositorio) |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura con precisión. La model card describe el modelo como un fine-tune de tipo conversacional sobre una base de la familia Qwen, con "2.000 millones de parámetros" y compatibilidad con la librería `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`, lo que implica una arquitectura transformer decoder-only estándar con tokenizador Qwen. El recuento real de parámetros en safetensors (1.881.825.088) es coherente con la clase de tamaño de Qwen2.5-1.5B o de un modelo de ~2B, aunque no se especifica el checkpoint base exacto ni la versión de Qwen empleada.

No hay ningún dato publicado sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset, el uso de datos sintéticos y si hubo etapas de ajuste supervisado (SFT), RLHF o DPO. Tampoco se detallan innovaciones técnicas (atención lineal, decodificación especulativa, GQA, ventana deslizante, etc.). El único indicio técnico adicional es el tag `imatrix`, que hace referencia a la generación de cuantizaciones GGUF ponderadas por importancia de activaciones, una técnica de compresión, no de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template` y soporte de mensajes de sistema.
- Seguimiento de instrucciones (instruction following) según lo declarado por el autor, sin evaluación publicada.
- Resumen de texto, mencionado explícitamente como caso de uso objetivo en la model card.
- Capacidades multilingües: afirmadas por el autor, pero sin listado de idiomas ni métricas. El ejemplo de la model card está en ruso.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que facilita el despliegue mediante Hugging Face Inference Endpoints.
- Capacidad de ejecución local en CPU y GPU de gama baja gracias a los artefactos GGUF.
- No hay evidencia de soporte de tool calling / function calling.
- No hay evidencia de modo "thinking" o razonamiento explícito.
- No hay evidencia de capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Chatbot local privado: el modelo puede gestionar conversaciones multi-turno sin conexión a Internet, con todos los datos permaneciendo en la máquina del usuario. Es adecuado por su tamaño reducido, que permite ejecutarlo en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Resumen de documentos en el puesto de trabajo: actas, correos o informes pueden resumirse localmente. El autor cita explícitamente el resumen como caso de uso objetivo, aunque no se especifica la longitud máxima de entrada manejable.
- Asistentes embebidos en dispositivos de borde: con cuantizaciones de 4 bits el modelo ocupa del orden de 1-1,2 GB, lo que lo hace candidato para Raspberry Pi de gama alta, mini-PC o teléfonos con suficiente RAM.
- Prototipado rápido de aplicaciones conversacionales: al ser compatible con `transformers` y con la API de endpoints, sirve para validar prompts y flujos de chat antes de migrar a un modelo mayor.
- Generación de texto asistida en entornos con restricciones de red (aeronáutica, sanidad, banca): al poder ejecutarse offline, evita la exfiltración de datos a APIs externas.
- Sistemas de respuesta a preguntas sobre dominios cerrados mediante ajuste adicional (LoRA/QLoRA): el tamaño de 1,88 B permite reentrenar adaptadores en una única GPU de consumo, aunque no hay evidencia publicada de la calidad base para esta tarea.
- Clasificación o etiquetado de texto ligero: puede emplearse como componente de preprocesado en pipelines de datos donde no se justifica el coste de un modelo de mayor tamaño.
- Experimentación educativa: sirve para estudiar el comportamiento de modelos pequeños, la cuantización GGUF y el efecto de `imatrix` en la degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluación, y tampoco se proporcionan comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del número de parámetros, no de datos publicados por el autor):
  - FP16/BF16: ~3,8 GB solo para pesos, más caché KV y activaciones; en la práctica ~4,5-5,5 GB.
  - INT8: ~1,9 GB de pesos; ~2,5-3 GB en total.
  - GGUF Q4_K_M: ~1,1-1,2 GB; ~1,5-2 GB en total.
  - GGUF Q5/Q6: entre ~1,3 y ~1,6 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para FP16 (GTX 1650 4 GB, RTX 3050, RTX 4060). Para mayor velocidad y lotes grandes, RTX 3090, RTX 4090, A100 o H100 quedan sobredimensionadas para este tamaño y solo se justifican en despliegues con alta concurrencia.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU con 4 GB o más, e incluso en CPU con 8-16 GB de RAM usando GGUF.
- Opciones de despliegue: `transformers` (el autor proporciona un snippet de ejemplo), llama.cpp, Ollama, LM Studio, vLLM, TGI y Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de la columna de referencia corresponden a las fichas públicas de cada modelo y deben verificarse en la fuente original.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zubr-tiny-2b | 1,88 B | No disponible | Apache-2.0 | Hugging Face, safetensors y GGUF |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache-2.0 | Hugging Face, amplia variedad de cuantizaciones |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Hugging Face, con restricciones de uso |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens | Apache-2.0 | Hugging Face |
| Gemma-2-2B-it | ~2,6 B | 8.192 tokens | Términos de uso de Gemma | Hugging Face |

La diferencia principal frente a estas alternativas no está en el rendimiento, del que no hay datos, sino en la trazabilidad: los modelos de Qwen, Meta, Hugging Face y Google cuentan con model cards detalladas, evaluaciones publicadas y mantenimiento activo, mientras que zubr-tiny-2b no aporta ninguna de esas garantías.

## Limitaciones y advertencias

- Riesgo de alucinación elevado: en modelos de ~2 B de parámetros la tasa de afirmaciones incorrectas es alta, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Ausencia total de evaluación: no hay benchmarks ni comparaciones publicadas, por lo que la calidad real del ajuste fino es desconocida.
- Opacidad del entrenamiento: se desconoce el dataset, el número de tokens, el checkpoint base exacto y si hubo RLHF o DPO. La model card mezcla referencias a "Qwen 3.5" y "Qwen 2.5", lo que impide determinar la procedencia real de los pesos.
- Longitud de contexto indeterminada: la model card afirma heredar la ventana extendida de Qwen sin especificar cifra, de modo que no es posible planificar aplicaciones con entradas largas.
- Idiomas no verificados: aunque se afirman capacidades multilingües, no se listan idiomas ni hay métricas. El único ejemplo en la model card está en ruso.
- Errores en la documentación: los comandos de descarga incluidos en la model card contienen URLs incompletas (`git clone https://huggingface.co` y `curl -L -O https://huggingface.co/resolve/main/config.json`), por lo que no funcionan tal cual están escritos.
- Señales de baja madurez: 0 descargas y 1 like en el momento de la consulta, y fechas de creación y actualización registradas como 2026-10-01, lo que resulta anómalo.
- Sin soporte conocido de tool calling, agentes, visión o modo de razonamiento explícito; no debe asumirse ninguna de estas capacidades.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución sin obligación de publicar derivados, siempre que se conserve el aviso de licencia. No se identifican restricciones adicionales en los metadatos.
- Para producción con requisitos de calidad, se recomienda validar el modelo contra una alternativa mantenida (Qwen2.5-1.5B-Instruct, SmolLM2-1.7B-Instruct) antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alekringtonnn-ai/zubr-tiny-2b
- No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo en la información disponible.
