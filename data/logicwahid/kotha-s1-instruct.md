# logicwahid/Kotha-S1-Instruct

## Resumen

Kotha-S1-Instruct es un modelo de lenguaje instruido de tamaño muy reducido (~100 millones de parámetros) desarrollado por Md. Wahid bajo el sello de Kotha Lab. Se trata de una versión ajustada a instrucciones del modelo base logicwahid/Kotha-S1, con un enfoque bilingüe: bengalí e inglés. Su objetivo principal es resolver la falta de modelos de lenguaje pequeños y accesibles para el bengalí, un idioma con escasa representación en el ecosistema de modelos open source, permitiendo su ejecución en CPUs estándar, dispositivos edge y entornos con recursos limitados.

La arquitectura es de tipo LLaMA (con RMSNorm, RoPE y SwiGLU) y el modelo se distribuye en formato safetensors bajo licencia MIT-0, lo que lo hace totalmente apto para uso comercial sin restricciones. Utiliza un tokenizador bilingüe propio con un vocabulario de 32.000 tokens y un formato de prompt estilo Mistral (`[INST] ... [/INST]`).

Su relevancia radica en la creciente demanda de modelos pequeños (SLM) desplegables en hardware modesto y en el hueco existente de modelos instruidos nativos para bengalí. Con unos 100M de parámetros, no compite con modelos generalistas grandes, sino que cubre el nicho de inferencia local, offline y en dispositivos de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (RMSNorm, RoPE, SwiGLU) |
| Parametros totales | 99.943.040 (~100M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en fp16/fp32 según el código de ejemplo) |
| Idiomas soportados | Bengalí (bn) e inglés (en) |
| Licencia | MIT-0 |
| Formato de pesos | safetensors |

Datos adicionales:

- Tokenizador: tokenizador bilingüe propio, vocabulario de 32.000 tokens.
- Formato de prompt: `[INST] prompt [/INST]`.
- Tamaño del repositorio: 0,6 GB.
- Librería: transformers (compatible con text-generation-inference y endpoints).

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer estilo LLaMA, lo que implica normalización RMSNorm previa a cada bloque, codificación posicional rotatoria (RoPE) y activación SwiGLU en las capas de feed-forward. Esta combinación es el estándar de facto en arquitecturas modernas eficientes y permite un buen equilibrio entre calidad y coste computacional en tamaños pequeños.

Sobre el entrenamiento, la model card indica que se partió del modelo base Kotha-S1 y que el ajuste a instrucciones utilizó los datasets databricks/databricks-dolly-15k (instrucciones sintéticas de Databricks, originalmente en inglés) y wikimedia/wikipedia (corpus enciclopédico). No se especifica el número total de tokens de entrenamiento, la composición exacta del corpus bilingüe ni si se aplicaron técnicas de alineación como RLHF o DPO. No hay datos disponibles sobre hiperparámetros de entrenamiento ni sobre el proceso de creación del tokenizador bilingüe de 32k tokens.

## Capacidades

- Generación de texto instruida en bengalí e inglés siguiendo el formato `[INST] ... [/INST]`.
- Comprensión y generación bilingüe, con énfasis en bengalí, idioma poco cubierto por otros SLM open source.
- Respuesta a preguntas de conocimiento general (el ejemplo de la model card pregunta por la capital de Bangladesh).
- Ejecución en CPU y dispositivos edge gracias a su tamaño de ~100M parámetros.
- Integración con la librería transformers de Hugging Face (AutoModelForCausalLM y AutoTokenizer).
- Compatibilidad con text-generation-inference y despliegue vía endpoints de Hugging Face.
- Muestreo configurable (top_p, temperature, repetition_penalty), con valores recomendados por el autor: top_p 0,85, temperature 0,3 y repetition_penalty 1,15.

No hay evidencia de soporte para: tool calling / function calling, visión, audio, modo de razonamiento extendido (thinking mode) ni capacidades multimodales.

## Casos de uso

- Chatbots en bengalí para dispositivos de bajos recursos: al pesar solo 0,6 GB en pesos, puede ejecutarse en smartphones, Raspberry Pi o CPUs de escritorio sin GPU, lo que lo hace adecuado para asistentes conversacionales offline en Bangladesh o la diáspora bengalí.
- Asistentes de conocimiento general bilingües: dado su entrenamiento con Wikipedia y Dolly-15k, puede responder preguntas sencillas en bengalí e inglés, útil para kioscos de información o aplicaciones educativas básicas.
- Prototipado de aplicaciones NLP en bengalí: su licencia MIT-0 sin restricciones permite integrarlo en pruebas de concepto y productos comerciales sin coste de licencias ni gestiones.
- Educación y aprendizaje del bengalí: puede emplearse como componente de generadores de frases, ejercicios o respuestas simples en apps de aprendizaje de idiomas, donde el coste por token de un modelo grande no está justificado.
- Inferencia edge con privacidad total: al correr localmente, no envía datos a servidores externos, adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Base para fine-tuning posterior: su tamaño pequeño hace que el ajuste fino adicional (por ejemplo, con LoRA) sea asequible en hardware de consumo, sirviendo como punto de partida para dominios específicos en bengalí.
- Generación de texto en pipelines de bajo consumo: integrable en procesos batch nocturnos en CPUs donde la latencia no es crítica pero el coste energético sí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica comparativa.

## Requisitos de hardware

- VRAM / memoria estimada: con ~100M de parámetros, el modelo ocupa aproximadamente 0,2 GB en fp16 y 0,4 GB en fp32, más el overhead del tokenizador y el runtime. Cabe sin problemas en cualquier GPU moderna y en la RAM de prácticamente cualquier ordenador.
- GPU recomendadas: no se requiere GPU; cualquier GPU con 1 GB de VRAM o más es suficiente (por ejemplo, una GTX 1050 o superior). En CPU, cualquier procesador x86 o ARM reciente es viable.
- Consumer GPUs: cabe de sobra en cualquier GPU de consumo, incluidas las de gama de entrada; incluso iGPUs integradas pueden ejecutarlo.
- Opciones de despliegue: transformers (vía Python, como muestra la model card), text-generation-inference y Hugging Face Endpoints. No hay pesos en GGUF publicados en la información disponible, por lo que el soporte de llama.cpp u Ollama no está confirmado, aunque la arquitectura LLaMA facilitaría la conversión.
- Latencia y throughput: no disponibles. Dado el tamaño (~100M parámetros), cabe esperar generación fluida incluso en CPU moderna, con latencias del orden de decenas de milisegundos por token, aunque esto es una estimación y no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Kotha-S1-Instruct | ~100M | bn, en | MIT-0 | no disponible | safetensors, open source |
| Qwen2.5-0.5B-Instruct | ~500M | multilingüe (incluye bn parcial) | Apache 2.0 | 32k (128k con YaRN) | safetensors, GGUF, amplio soporte |
| SmolLM2-135M-Instruct | ~135M | principalmente inglés | Apache 2.0 | 8k | safetensors, GGUF, amplio soporte |
| Llama 3.2 1B Instruct | ~1.200M | multilingüe | Llama 3.2 Community License | 128k | safetensors, GGUF, amplio soporte |

Comparación: Kotha-S1-Instruct es el modelo más pequeño del grupo y el único con foco explícito y nativo en bengalí; los modelos generalistas de Qwen o Meta ofrecen capacidades muy superiores y contextos mucho más largos, pero su cobertura del bengalí es limitada y sus requisitos de hardware mayores. SmolLM2-135M es el rival directo en tamaño, aunque está centrado en inglés. La licencia MIT-0 de Kotha es la más permisiva de todas las listadas.

## Limitaciones y advertencias

- Tamaño extremadamente reducido (~100M): la calidad de generación, el razonamiento y la exactitud factual serán notablemente inferiores a los de modelos de 1B o más; se esperan errores factuales frecuentes incluso en preguntas sencillas.
- Riesgo de alucinación alto: típico en modelos pequeños y agravado por el entrenamiento con un corpus limitado (Wikipedia + Dolly-15k); no apto para usos que exijan fiabilidad factual sin supervisión.
- Solo dos idiomas: bengalí e inglés. No hay soporte para castellano ni otras lenguas.
- Longitud de contexto no documentada: desconocida, lo que dificulta planificar aplicaciones con documentos largos o conversaciones multi-turno extensas.
- Sin datos de benchmarks: no hay evaluaciones publicadas que permitan comparar objetivamente su calidad; conviene evaluarlo internamente antes de cualquier despliegue.
- Sin soporte documentado de tool calling, agentes ni capacidades multimodales.
- Cuantización no documentada: no hay pesos GGUF ni instrucciones de cuantización publicadas, lo que limita las opciones de despliegue optimizado en edge.
- Licencia MIT-0: sin restricciones para uso comercial, redistribución o creación de derivados; es de las licencias más permisivas disponibles.
- Proyecto aparentemente individual (un autor, 494 descargas, sin likes registrados): madurez, mantenimiento y auditoría comunitaria limitados; para producción se recomienda validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logicwahid/Kotha-S1-Instruct
- Modelo base: https://huggingface.co/logicwahid/Kotha-S1
- Dataset Databricks Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Wikimedia Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia

No se han encontrado enlaces adicionales (papers, blogs, repos de GitHub ni demos) en la informacion disponible.
