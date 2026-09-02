# LeoZotos/OLMo-2-0425-1B_math_cpt_math_textbooks_qa

## Resumen

LeoZotos/OLMo-2-0425-1B_math_cpt_math_textbooks_qa es un ajuste fino (fine-tuning) no oficial del modelo OLMo-2-0425-1B de AI2, realizado por el usuario LeoZotos. El modelo base, desarrollado por el Allen Institute for AI, es un modelo de lenguaje de 1.480 millones de parámetros, entrenado de forma completamente abierta con datos de OLMo-mix-1124 y Dolmino-mix-1124. Este fine-tuning se ha especializado en tareas de razonamiento matemático, utilizando un proceso de *continued pretraining* (CPT) con libros de texto de matemáticas y un conjunto de preguntas y respuestas (QA) sobre ese dominio.

El interés de esta ficha radica en que el modelo base OLMo-2 es uno de los pocos modelos de 1B con una pila de entrenamiento totalmente transparente (código, datos, logs), lo que lo convierte en una base atractiva para experimentos de especialización. Este fine-tuning concreto no aporta documentación adicional sobre su configuración, pero hereda las capacidades generales del base y las orienta hacia el dominio matemático. Aunque el repositorio tiene pocas descargas (29) y no ha recibido likes, puede ser útil para desarrolladores que buscan un modelo compacto y abierto para tareas de matemáticas en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-2) |
| Parametros totales | 1.484.916.736 (~1,48B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base usa 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el base se entrena mayoritariamente en ingles) |
| Licencia | no disponible (el base usa Apache 2.0, pero este fine-tuning no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-2-0425-1B es un transformer decoder con atención causal, entrenado en dos fases: pre-entrenamiento con OLMo-mix-1124 (una mezcla curada de web, código, libros y texto científico) y mid-training con Dolmino-mix-1124. AI2 ha publicado todos los detalles de entrenamiento, incluyendo el código, los checkpoints y los logs, lo que permite reproducir completamente el proceso. El modelo base tiene una ventana de contexto de 4096 tokens.

El fine-tuning de LeoZotos añade una fase de *continued pretraining* (CPT) sobre libros de texto de matemáticas y un ajuste con un dataset de preguntas y respuestas sobre esos libros. No se dispone de información sobre el número de tokens adicionales, la configuración de hiperparámetros ni si se aplicaron técnicas como RLHF o DPO. El nombre del repositorio sugiere que el objetivo es mejorar el rendimiento en razonamiento matemático y comprensión de problemas de libros de texto.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo base ya muestra competencias en aritmética, álgebra y resolución de problemas; el fine-tuning refuerza estas capacidades sobre contenido de libros de texto.
- Comprensión de preguntas y respuestas: adaptado para responder a preguntas basadas en material didáctico de matemáticas.
- Capacidades multilingües limitadas: el base está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas es reducido.
- No se ha confirmado soporte para tool calling, function calling, agentes o multi-step reasoning más allá de lo que el base pueda ofrecer de forma genérica.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Tutoría automatizada de matemáticas: el modelo puede responder preguntas de libros de texto, explicar pasos de resolución y ayudar a estudiantes en ejercicios de álgebra o cálculo, gracias a su especialización en contenido didáctico.
- Generación de problemas y soluciones: útil para crear ejercicios de práctica con sus correspondientes respuestas, aprovechando el fine-tuning sobre QA de libros de texto.
- Asistente de estudio integrado en aplicaciones educativas: puede integrarse en chatbots o plataformas de e-learning para ofrecer ayuda instantánea en tareas de matemáticas, con un tamaño compacto que permite ejecución en hardware modesto.
- Análisis de contenido curricular: procesar y extraer preguntas y conceptos clave de libros de texto de matemáticas para indexación o resumen.
- Prototipado rápido de agentes de razonamiento: al ser un modelo pequeño, sirve como banco de pruebas para experimentos de prompting o fine-tuning adicional antes de escalar a modelos mayores.
- Investigación en interpretabilidad: dado que el base es totalmente abierto, este fine-tuning puede usarse para estudiar cómo se comporta el modelo en dominios específicos y qué representaciones internas desarrolla para conceptos matemáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este fine-tuning. El modelo base OLMo-2-0425-1B tiene resultados en tareas como MMLU, HellaSwag y GSM8K, pero no se dispone de datos específicos de esta variante. Se recomienda evaluar el modelo en el conjunto de datos objetivo antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 8 bits, alrededor de 1,5-2 GB; en 16 bits, unos 3 GB. Sin cuantizar en FP32, ~6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (ej. RTX 3060, GTX 1660 Super) puede ejecutar el modelo en FP16. Para cuantización 4-bit, 2 GB son suficientes (ej. Jetson Nano, Raspberry Pi con aceleración).
- Cabe en GPUs de consumo: sí, es un modelo pequeño que se ejecuta en la mayoría de GPUs modernas.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Hugging Face TGI y Transformers. Dado que los pesos están en safetensors, se puede convertir a GGUF para llama.cpp.
- Latencia y throughput: no disponibles para este fine-tuning, pero en una GPU como RTX 4090 se espera una latencia de decodificación de unos 20-40 ms/token en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LeoZotos/OLMo-2-0425-1B_math_cpt_math_textbooks_qa | 1,48B | no disponible | no disponible | Hugging Face |
| OLMo-2-0425-1B (base) | 1,48B | 4096 | Apache 2.0 | Hugging Face, ModelScope |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Hugging Face |
| Qwen2-1.5B | 1,5B | 32768 | Apache 2.0 | Hugging Face |

El modelo base OLMo-2-0425-1B se distingue por su total apertura (datos y código de entrenamiento), mientras que TinyLlama y Qwen2 son alternativas compactas con diferentes longitudes de contexto. Este fine-tuning no añade información sobre su licencia ni rendimiento comparativo, por lo que la elección dependerá de la necesidad de transparencia y del dominio matemático específico.

## Limitaciones y advertencias

- No se ha publicado información sobre la licencia de este fine-tuning; el modelo base usa Apache 2.0, pero el autor podría haber impuesto restricciones adicionales. Es necesario contactar con el autor o revisar los archivos del repositorio antes de uso comercial.
- El modelo base tiene sesgos conocidos derivados de sus datos de entrenamiento (principalmente web en inglés), que pueden reflejarse en respuestas estereotipadas o incorrectas en contextos no matemáticos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en problemas matemáticos complejos o de razonamiento multi-paso.
- Limitación de idioma: su rendimiento en español u otros idiomas no está garantizado, ya que el entrenamiento base es predominantemente en inglés.
- La longitud de contexto no está confirmada en esta variante; si se mantiene la del base (4096 tokens), no es adecuado para documentos largos.
- No se dispone de datos sobre la calidad del fine-tuning: no hay benchmarks, ni descripción del dataset de entrenamiento, ni configuración de hiperparámetros, lo que dificulta evaluar su robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LeoZotos/OLMo-2-0425-1B_math_cpt_math_textbooks_qa
- Modelo base en Hugging Face: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- GitHub de OLMo (código de entrenamiento): https://github.com/allenai/OLMo
- Página oficial de OLMo en AI2: https://allenai.org/olmo
- Modelo base en ModelScope: https://www.modelscope.cn/models/allenai/OLMo-2-0425-1B
