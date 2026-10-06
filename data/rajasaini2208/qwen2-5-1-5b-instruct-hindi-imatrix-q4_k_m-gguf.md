# rajasaini2208/Qwen2.5-1.5B-Instruct-hindi-imatrix-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una versión cuantizada en formato GGUF del modelo Qwen/Qwen2.5-1.5B-Instruct, publicada por el usuario rajasaini2208. La particularidad frente a otras cuantizaciones del mismo modelo es que se ha aplicado la técnica de *imatrix* (matriz de importancia por capa) calibrada con texto en hindi, en lugar de la calibración estándar en inglés que emplea llama.cpp por defecto. El objetivo declarado es preservar mejor la distribución de salida del modelo original (FP16) cuando se trabaja con contenido en hindi.

El modelo base es un transformer decoder-only de 1.500 millones de parámetros (1.777.088.000 parámetros reales según los pesos en safetensors del modelo original), desarrollado por el equipo Qwen de Alibaba. Está diseñado para tareas conversacionales de propósito general, con soporte declarado de 29 idiomas y una ventana de contexto de 32.768 tokens ampliable. La cuantización Q4_K_M reduce el peso del fichero de 3,56 GB en FP16 a 1,12 GB, lo que permite ejecutarlo en hardware muy modesto.

La relevancia de esta ficha es doble: por un lado documenta un artefacto concreto de cuantización con calibración lingüística específica para hindi, poco habitual en el ecosistema GGUF; por otro, la model card incluye una evaluación comparativa (KLD y coincidencia top-p) frente a una cuantización Q4_K_M estándar y a una calibrada con inglés, cuyos resultados el propio autor interpreta con matices interesantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct: atención con GQA, RoPE, SwiGLU y RMSNorm) |
| Parametros totales | 1.777.088.000 (segun pesos safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo en el modelo base; ampliable a 131.072 con YaRN (no verificado en esta cuantizacion concreta) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repo) |
| Idiomas soportados | Hindi (hi) e ingles (en) declarados en las etiquetas; el modelo base declara soporte para 29 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico, 1,12 GB; FP16 de referencia 3,56 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE), activación SwiGLU y normalización RMSNorm. Según la documentación pública de Qwen2.5, la familia completa se preentrenó sobre aproximadamente 18 billones de tokens y el pipeline de ajuste incluyó supervisión fina (SFT) y optimización directa de preferencias (DPO), lo que da lugar a su comportamiento de instrucciones y diálogo. La ventana de contexto nativa del modelo base es de 32.768 tokens, extensible a 131.072 mediante escalado YaRN.

Lo específico de este repositorio no es la arquitectura, sino el proceso de cuantización. Se ha generado un GGUF Q4_K_M utilizando una *importance matrix* construida a partir de un corpus en hindi, en lugar de la calibración por defecto. La model card reporta métricas de divergencia frente al FP16 oficial de Qwen: sobre un test set extraído de Wikipedia en hindi (150 líneas), la KLD media baja a 0,0509 con el imatrix en hindi frente a 0,0642 de la cuantización Q4_K_M simple y 0,0545 de la calibrada en inglés. Sobre un segundo test set (sangraha, 150 líneas), los valores son 0,0573, 0,0635 y 0,0627 respectivamente. El autor indica explícitamente que la mejora atribuible al uso de imatrix en general (frente a la calibración estándar) es clara, pero que el beneficio adicional de calibrar con hindi en lugar de inglés no queda demostrado de forma concluyente con este experimento.

## Capacidades

- Generación de texto conversacional multi-turno en hindi e inglés, con tono de asistente por el ajuste de instrucciones del modelo base.
- Razonamiento básico y resolución de problemas sencillos de matemáticas y lógica, limitado por el tamaño de 1.500 millones de parámetros.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, etc.), viable para fragmentos cortos pero no para repositorios extensos.
- Comprensión y resumen de documentos que quepan en la ventana de contexto de 32.768 tokens del modelo base.
- Soporte declarado de tool calling / function calling en la familia Qwen2.5-Instruct (el modelo base lo incorpora mediante plantilla de chat).
- Capacidades multilingües parciales: el modelo base cubre 29 idiomas, pero esta cuantización concreta solo declara hindi e inglés en sus etiquetas.
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional en hindi para atención al cliente: el modelo puede mantener diálogos multi-turno con contexto largo gracias a los 32.768 tokens del modelo base, y la cuantización imatrix está pensada para no degradar la calidad en ese idioma.
- Generación de resúmenes de noticias o documentos en hindi: adecuado para textos de extensión media que quepan en la ventana de contexto, con un coste de inferencia muy bajo.
- Traducción asistida hindi-inglés: útil como borrador o preprocesado dentro de un pipeline mayor, aprovechando que el modelo maneja ambos idiomas.
- Prototipado rápido en portátiles o entornos sin GPU: al ocupar 1,12 GB, se puede ejecutar con llama.cpp en CPU y validar flujos conversacionales antes de escalar a modelos mayores.
- Chatbot embebido en aplicaciones móviles o de escritorio: el tamaño reducido permite integraciones locales sin depender de APIs externas.
- Educación y tutoría en hindi: explicación de conceptos, generación de ejercicios y corrección de respuestas simples.
- Tareas de etiquetado y clasificación ligera dentro de pipelines de datos en hindi: extracción de entidades simples o categorización de texto con prompts estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de cuantización (KLD y coincidencia top-p) frente al FP16 oficial:

| Test set | Variante | Mean KLD | Same top-p (%) |
|---|---|---|---|
| wiki | Plain Q4_K_M | 0,0642 ± 0,0030 | 87,48 ± 0,60 |
| wiki | English-imatrix Q4_K_M | 0,0545 ± 0,0019 | 88,43 ± 0,58 |
| wiki | Hindi-imatrix Q4_K_M (este modelo) | 0,0509 ± 0,0018 | 88,95 ± 0,57 |
| sangraha | Plain Q4_K_M | 0,0635 ± 0,0019 | 85,39 ± 0,64 |
| sangraha | English-imatrix Q4_K_M | 0,0627 ± 0,0023 | 85,75 ± 0,63 |
| sangraha | Hindi-imatrix Q4_K_M (este modelo) | 0,0573 ± 0,0024 | 86,08 ± 0,63 |

Según el autor, la reducción de KLD respecto a la cuantización Q4_K_M simple es del 21% en wiki y del 10% en sangraha; respecto a la calibrada en inglés, del 6% y el 9% respectivamente. Los tres artefactos comparados (plain, english-imatrix y hindi-imatrix) se generaron y evaluaron desde el mismo fichero FP16 de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB incluyendo contexto moderado, dado que el fichero pesa 1,12 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; también funciona en iGPU con memoria unificada.
- Cabe holgadamente en GPUs de consumo: sí, en prácticamente cualquier tarjeta moderna y en muchos sistemas con gráficos integrados recientes.
- Ejecución en CPU: totalmente viable con llama.cpp en un fichero único, sin necesidad de GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI a través de llama.cpp. vLLM y TGI no están orientados a GGUF y no serían la vía natural para este artefacto.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Con este tamaño, en una GPU de consumo se esperan decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-1.5B-Instruct hindi-imatrix Q4_K_M) | 1,78B | 32.768 tokens (base) | GGUF Q4_K_M | Apache-2.0 | 1,12 GB, calibrado con hindi |
| Qwen2.5-1.5B-Instruct Q4_K_M estandar | 1,78B | 32.768 tokens | GGUF Q4_K_M | Apache-2.0 | KLD 0,0642 en wiki, sin imatrix |
| Qwen2.5-1.5B-Instruct FP16 | 1,78B | 32.768 tokens | safetensors/GGUF FP16 | Apache-2.0 | 3,56 GB, referencia de calidad |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | safetensors/GGUF | Llama 3.2 Community License | Menor en parámetros, contexto mucho mayor, licencia no Apache |
| Gemma-2-2B-it | 2,61B | 8.192 tokens | safetensors/GGUF | Gemma Terms of Use | Más parámetros, contexto reducido, licencia con restricciones |

## Limitaciones y advertencias

- Las métricas publicadas (KLD, coincidencia top-p) son proxies de fidelidad respecto al FP16; la calidad real en tareas hindi (pregunta-respuesta, resumen) no se ha medido.
- Los test sets empleados son pequeños (150 líneas cada uno) y provienen de Wikipedia en hindi y del corpus sangraha, por lo que la evidencia estadística es limitada.
- El propio autor reconoce que el beneficio de calibrar con hindi frente a inglés no queda demostrado; la mejora principal parece atribuible al uso de imatrix en general.
- La cuantización Q4_K_M introduce pérdida de precisión inevitable frente a FP16, especialmente perceptible en tareas de razonamiento complejo, matemáticas y generación de código.
- Modelo pequeño (1,78B): propenso a alucinaciones en preguntas factuales y a perder coherencia en cadenas de razonamiento largas.
- El soporte multilingüe real de esta cuantización se limita a hindi e inglés según sus etiquetas; otros idiomas del modelo base pueden degradarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación de la comunidad ni issues reportados.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero conviene mantener la atribución a Qwen y revisar los términos de Qwen2.5 si se redistribuye.
- Fecha de publicación/actualización registrada como 2026-10-06, dato inusual que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rajasaini2208/Qwen2.5-1.5B-Instruct-hindi-imatrix-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de llama.cpp (motor de inferencia GGUF y herramienta imatrix): https://github.com/ggerganov/llama.cpp
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
