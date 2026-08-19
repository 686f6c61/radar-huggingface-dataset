# BananaAdmin/Ben2.0-Uncensored

## Resumen

Ben 2.0 es un modelo de lenguaje pequeño (SLM) de 1.500 millones de parámetros, desarrollado por el usuario BananaAdmin, que se presenta como una versión sin filtros éticos ni disclaimers morales. Está construido sobre la arquitectura `Qwen2.5-Coder-1.5B-Instruct` y ha sido afinado mediante QLoRA durante aproximadamente 5 horas en un entorno gratuito de Kaggle con dos GPU Tesla T4. El objetivo declarado es ofrecer un asistente que responda de forma directa, sin rechazos ni advertencias, dirigido a desarrolladores e investigadores que necesiten un modelo de instrucciones sin restricciones.

El modelo se ha entrenado con un conjunto de datos mixto de unos 40.000 ejemplos que incluyen código, razonamiento, matemáticas y conversación. Según el autor, presenta una reducción significativa de alucinaciones respecto a su versión anterior (Ben 1.1), adherencia estricta a formato de texto plano y mejor memoria en conversaciones multi-turno. Su ventana de contexto está limitada a 2.048 tokens, lo que condiciona su uso en diálogos largos.

La relevancia de este modelo reside en su naturaleza "uncensored": elimina patrones de rechazo típicos de los asistentes comerciales. Sin embargo, esto implica riesgos importantes de generación de contenido ofensivo o peligroso, tal y como advierte el propio autor en su descargo de responsabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (~1.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (según la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ben 2.0 se basa en la arquitectura de Qwen2.5-Coder-1.5B-Instruct, un modelo transformer decoder con atención causal estándar. El afinado se realizó con QLoRA, utilizando un rango de 16 y alpha de 32, aplicado a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). El entrenamiento se llevó a cabo con el framework Unsloth y Hugging Face TRL (SFTTrainer), con una tasa de aprendizaje de 1.5e-4, optimizador AdamW en 8 bits y precisión de 4 bits durante el entrenamiento. Se ejecutaron 1.500 pasos durante unas 5 horas en dos GPU Tesla T4 del nivel gratuito de Kaggle, alcanzando una pérdida final de 0.5199.

El conjunto de datos de entrenamiento combina aproximadamente 40.407 ejemplos de cuatro fuentes: CodeAlpaca_20K (código), Open-Platypus (razonamiento), GSM8K (matemáticas) y no_robots (conversación). Todos los datos fueron preprocesados para eliminar patrones de rechazo corporativos, como frases del tipo "no puedo responder" o "como IA", con el fin de garantizar que el modelo responda sin restricciones. El formato de prompt es ChatML, con tokens especiales `<|im_start|>` y `<|im_end|>`.

## Capacidades

- Generación de texto y código: el modelo puede producir código en Python, JavaScript, HTML y otros lenguajes, gracias a su base Qwen2.5-Coder.
- Razonamiento lógico y matemático: entrenado con Open-Platypus y GSM8K, es capaz de resolver problemas de lógica y realizar razonamientos paso a paso en matemáticas.
- Conversación multi-turno: soporta diálogos con memoria, aunque limitada por la ventana de contexto de 2.048 tokens.
- Formato de salida en texto plano: el autor indica que el modelo evita corchetes extraños y sigue estrictamente el formato solicitado.
- Ausencia de disclaimers éticos: responde directamente sin advertencias morales, lo que puede ser útil en entornos de investigación donde se requiera una respuesta sin sesgos de seguridad.
- No se mencionan capacidades de tool calling, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de funciones, scripts y fragmentos de código, gracias a su entrenamiento con CodeAlpaca. Por ejemplo, un desarrollador podría pedirle "escribe una función en Python que ordene una lista de diccionarios por una clave" y obtener una respuesta directa sin preámbulos.
- Resolución de problemas matemáticos y de lógica: con el entrenamiento en GSM8K y Open-Platypus, puede utilizarse como ayuda en ejercicios de razonamiento cuantitativo, aunque su tamaño limita la precisión en problemas complejos.
- Chatbot de investigación sin restricciones: para investigadores que estudian comportamientos de modelos sin filtros éticos, este SLM puede servir como banco de pruebas para analizar respuestas en dominios sensibles, siempre con las debidas salvaguardas legales y éticas.
- Automatización de tareas de procesamiento de lenguaje natural: su formato de salida limpio y su adherencia a instrucciones lo hacen adecuado para tareas de extracción de información, resumen o transformación de texto en pipelines de NLP.
- Entrenamiento y fine-tuning posterior: al ser un modelo pequeño, puede utilizarse como punto de partida para experimentos de ajuste fino con recursos limitados, permitiendo probar técnicas de adaptación en una GPU de consumo.
- Evaluación de robustez y sesgos: su naturaleza "uncensored" permite estudiar cómo se comporta un modelo sin capas de seguridad, lo que puede ser útil para comparar con versiones alineadas y medir el impacto de los filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Por tanto, no es posible evaluar su rendimiento cuantitativo de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.500 millones de parámetros, en precisión FP16 el modelo ocupa aproximadamente 3 GB de memoria. En cuantización de 8 bits se reduce a ~1.5 GB, y en 4 bits a ~0.8 GB. No se ofrecen versiones cuantizadas oficiales, pero pueden generarse con herramientas como llama.cpp o AutoGPTQ.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1650, RTX 3060, RTX 4090 o superiores son suficientes. También es viable en entornos de CPU con suficiente RAM.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de gama media actuales.
- Opciones de despliegue: el modelo se puede cargar con la librería Transformers de Hugging Face, como se muestra en el código de ejemplo. También es posible servirlo con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos.
- Latencia y throughput: no se han publicado datos. Dado su tamaño, se espera una latencia baja en GPU modernas, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

No se dispone de comparativas oficiales. El modelo se basa en `Qwen2.5-Coder-1.5B-Instruct`, por lo que su comportamiento en tareas de código y razonamiento será similar al de su base, pero con la diferencia de que se han eliminado los filtros de seguridad. Otras alternativas "uncensored" de tamaño similar, como Dolphin 2.x o modelos de la familia Nous Research, existen en el ecosistema, pero no se han encontrado datos comparativos en la información proporcionada. La licencia y disponibilidad de estos modelos varía, y en el caso de Ben 2.0 no se especifica licencia, lo que limita su uso comercial sin autorización explícita del autor.

## Limitaciones y advertencias

- Ventana de contexto limitada a 2.048 tokens: las conversaciones largas pueden perder información anterior.
- Alucinaciones en temas muy específicos: al ser un modelo de 1.5B, puede inventar hechos o detalles en dominios poco comunes.
- Dificultad con restricciones numéricas exactas: por ejemplo, "escribe exactamente 3 frases" puede no cumplirse correctamente.
- Generación de contenido ofensivo o peligroso: al carecer de filtros éticos, el modelo puede producir respuestas inapropiadas, ilegales o dañinas si se le solicita. El autor declina toda responsabilidad.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que genera incertidumbre legal para su uso comercial o redistribución.
- Sin información sobre sesgos: no se han realizado evaluaciones de sesgo, por lo que puede reflejar o amplificar sesgos presentes en los datos de entrenamiento.
- No apto para producción sin supervisión: dado su tamaño y falta de alineación, no se recomienda su uso en aplicaciones donde se requiera seguridad, precisión o cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BananaAdmin/Ben2.0-Uncensored
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/BananaAdmin/uncensored-ai-demo
- Repositorio de referencia (lista de modelos uncensored): https://github.com/samssouza/uncensored-ai-list
