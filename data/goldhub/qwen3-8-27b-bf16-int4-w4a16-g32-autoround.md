# goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound

## Resumen

El modelo `goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound` es una cuantización de 4 bits del modelo multimodal Qwen3.8-27B, desarrollada por el usuario de Hugging Face goldhub. El modelo base, creado por Alibaba, es un transformer denso de 27 000 millones de parámetros con una arquitectura de atención híbrida: solo 16 de sus 64 capas utilizan atención completa, mientras que las 48 restantes emplean atención lineal con estado recurrente constante. Esta cuantización busca reducir drásticamente los requisitos de VRAM para permitir su ejecución en hardware de consumo, manteniendo al mismo tiempo la ventana de contexto de 256 000 tokens y las capacidades multimodales (imagen y vídeo) del modelo original.

La cuantización se realiza con AutoRound (v0.15.0) usando un esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) con tamaño de grupo 32 y 1000 iteraciones de calibración. Una característica distintiva es la preservación selectiva de capas críticas en FP16/BF16: los embeddings, el codificador visual y las proyecciones de atención lineal se mantienen en precisión completa para evitar la degradación multimodal y el colapso de atención en contextos largos. El resultado es un modelo de aproximadamente 28,3 GB en el repositorio, frente a los ~54 GB del original en BF16, que puede ejecutarse en configuraciones de doble GPU como 2x RTX 3090.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Está orientado a desarrolladores e investigadores que necesitan un modelo multimodal de gran tamaño con contexto muy largo en hardware local, sin renunciar a la calidad de razonamiento y generación de código. El autor también destaca un alineamiento "semi-sin censura" que evita rechazos moralizantes, aunque esta afirmación es subjetiva y no está verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa (16/64 capas) y atencion lineal (48/64 capas) |
| Parametros totales | 27B (segun documentacion; el archivo safetensors reporta 11.575.659.760 parametros, lo que sugiere una discrepancia) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens (max_position_embeddings: 262144) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo 32, simetrica, AutoRound v0.15.0 |
| Idiomas soportados | en, zh, ru, uk, el, he |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato auto_round:auto_gptq |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atención híbrida: de las 64 capas, 16 utilizan atención completa (con intervalo de 4) y 48 usan atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de razonamiento. La cuantización presentada aquí no implica reentrenamiento; es una cuantización post-entrenamiento mediante AutoRound, que calibra los pesos de 4 bits con 1000 iteraciones para minimizar la pérdida de calidad. Las capas críticas para el rendimiento multimodal y de atención (`embed_tokens`, `model.visual.*`, `linear_attn.*`) se conservan en FP16/BF16, lo que explica que el tamaño del repositorio (28,3 GB) sea mayor que el de una cuantización INT4 estándar (~13,5 GB). El modelo también conserva el soporte de Multi-Token Prediction (MTP), que acelera la inferencia al predecir varios tokens por paso.

No se dispone de información detallada sobre los datos de entrenamiento del modelo base, ya que esta ficha se centra en la cuantización. El autor no indica si se realizó algún ajuste fino adicional sobre el modelo cuantizado; se trata de una conversión directa de los pesos.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo problemas matemáticos con explicaciones paso a paso en formato LaTeX.
- Generación de código Python de alta calidad, con cumplimiento de PEP-8 y optimizaciones avanzadas (por ejemplo, implementación de la criba de Eratóstenes con `bitarray`).
- Comprensión y generación de contenido multimodal: procesa imágenes y vídeo (Temporal Patch Size: 2) además de texto.
- Ventana de contexto de 256 000 tokens, adecuada para documentos extensos, historiales de conversación largos o análisis de vídeo.
- Soporte de Multi-Token Prediction (MTP) para inferencia más rápida.
- Capacidades multilingües en seis idiomas: inglés, chino, ruso, ucraniano, griego y hebreo.
- El autor afirma un alineamiento "semi-sin censura" que evita rechazos moralizantes en temas filosóficos, creativos o técnicos, aunque esta característica no está verificada externamente.

## Casos de uso

- Análisis de documentos técnicos extensos: gracias a su contexto de 256 000 tokens, puede resumir y sintetizar informes largos, papers o manuales, extrayendo información clave de manera estructurada.
- Asistente de programación local: genera código Python, JavaScript u otros lenguajes, y puede integrarse en entornos de desarrollo mediante vLLM o SGLang para autocompletado y revisión de código en tiempo real.
- Procesamiento de vídeo e imágenes para descripción detallada: útil en sistemas de accesibilidad, análisis de contenido audiovisual o generación de metadatos para archivos multimedia.
- Chatbot multilingüe de atención al cliente: soporta seis idiomas y puede mantener conversaciones de muchos turnos con memoria amplia, reduciendo la necesidad de resúmenes intermedios.
- Razonamiento matemático y resolución de problemas: adecuado para tutoría automática, generación de ejercicios o verificación de soluciones en entornos educativos.
- Investigación en IA local: permite experimentar con un modelo multimodal de gran tamaño en hardware de consumo, sin depender de APIs externas, ideal para prototipado y pruebas de concepto.
- Generación de contenido creativo: el autor destaca su capacidad para escribir ficción existencial o ensayos filosóficos, lo que puede aplicarse a herramientas de escritura asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor menciona pruebas internas de estrés, que incluyen:

- Velocidad de generación de aproximadamente 56,6 tokens por segundo en hardware de consumo.
- Resolución correcta de acertijos lógicos (por ejemplo, el acertijo de las "17 ovejas") y problemas de velocidad relativa con razonamiento paso a paso.
- Generación de código Python optimizado y conforme a PEP-8, con análisis de complejidad y benchmarks incluidos.
- Síntesis precisa de la historia de los modelos de lenguaje desde Word2Vec hasta arquitecturas MoE y MTP.

Estos resultados son cualitativos y no siguen una metodología de evaluación estandarizada, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 28,3 GB, pero los pesos cuantizados en INT4 ocupan aproximadamente 13,5 GB, más las capas en FP16/BF16. El autor recomienda 2x RTX 3090 (24 GB cada una) con `tensor-parallel-size=2` para contexto de 128K-256K.
- GPU recomendadas: 2x RTX 3090, 2x RTX 4090, o una sola GPU con al menos 32 GB de VRAM (por ejemplo, A100 40GB, RTX A6000) para contexto reducido.
- En una GPU de consumo de 24 GB (RTX 3090/4090) puede ejecutarse con contexto limitado (por ejemplo, 32K tokens) y batch pequeño.
- Opciones de despliegue: vLLM, SGLang y Transformers con `trust_remote_code=True`. También es posible usar llama.cpp si se convierte a GGUF, aunque no se menciona explícitamente.
- Latencia y throughput: la velocidad reportada es de ~56,6 tok/s en hardware consumer, pero depende de la configuración exacta y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 256K | BF16 | Apache 2.0 | Hugging Face |
| goldhub/Qwen3.8-27B-INT4-W4A16 | 27B (según doc.) | 256K | W4A16 (4-bit) | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de Qwen3.8-27B | 27B | 256K | GGUF, GPTQ, etc. | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría (por ejemplo, Llama 3.1 70B o Mistral Large) en la información proporcionada. La comparativa se limita a la variante cuantizada frente al modelo original, donde la principal diferencia es el tamaño en disco y la VRAM necesaria, a costa de una posible pérdida mínima de calidad.

## Limitaciones y advertencias

- La discrepancia entre el número de parámetros anunciado (27B) y el reportado en el archivo safetensors (11,57B) es preocupante; podría deberse a un error del autor o a una subida incompleta. Se recomienda verificar la integridad del modelo antes de usarlo en producción.
- Al ser una cuantización 4-bit, puede haber una ligera degradación en tareas de razonamiento complejo o generación de código muy especializado en comparación con el modelo original en BF16.
- El modelo solo soporta seis idiomas; no cubre otros como español, francés o alemán, lo que limita su uso en aplicaciones multilingües amplias.
- El autor afirma un alineamiento "semi-sin censura", pero esto no está validado por terceros y podría generar contenido inapropiado o sesgado en ciertos contextos.
- No se han publicado benchmarks estándar, por lo que el rendimiento real en tareas comunes (MMLU, HumanEval) es desconocido.
- La preservación de capas en FP16/BF16 aumenta el tamaño del modelo (28,3 GB) frente a una cuantización INT4 estándar, lo que puede ser un inconveniente si se busca minimizar el uso de VRAM.
- Para contextos de 256K tokens se requiere una configuración de múltiples GPU y un ajuste cuidadoso del batch; en una sola GPU de 24 GB el contexto práctico se reduce drásticamente.

## Enlaces

- [Hugging Face: goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound](https://huggingface.co/goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound)
- [Hugging Face: variante v2](https://huggingface.co/goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound-v2)
- [vLLM Recipes: Qwen/Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [GitHub: qwen3-8-27b (instalador local)](https://github.com/qwen3-8-27b/qwen3-8-27b)
- [LLM Explorer: ficha del modelo](https://llm-explorer.com/model/goldhub%2FQwen3.8-27B-BF16-INT4-W4A16-AutoRound-W4G32,5cU1P7JBYxZkVu8xuzzT6V)
