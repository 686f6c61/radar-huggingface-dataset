# alpha-coder-great/al-rasheed-ai

## Resumen

Al-Rasheed AI es un modelo de lenguaje afinado (fine-tuned) publicado por el usuario `alpha-coder-great` en Hugging Face, distribuido exclusivamente en formato GGUF cuantizado Q4_K_M y orientado a la asistencia y consulta de conocimiento islámico. Según su model card, se presenta como un asistente para explorar conceptos islámicos básicos, referencias coránicas y orientación religiosa general, integrado en la aplicación móvil "Al-Rasheed Islamic App", que funciona con inferencia local y sin dependencia de servicios en la nube.

El autor declara que el modelo está construido sobre la arquitectura Llama 3, aunque no se especifican el número de parámetros, el número de tokens de entrenamiento ni la composición del dataset de ajuste. El repositorio ocupa 2,0 GB y contiene un único archivo de pesos en cuantización 4-bit (Q4_K_M), lo que sitúa el modelo, por tamaño de archivo, en el rango de los 3-4 mil millones de parámetros efectivos, si bien este dato no está confirmado por el autor.

Su relevancia es limitada desde el punto de vista técnico —no hay benchmarks, no hay información sobre el proceso de entrenamiento y la licencia no está declarada— pero resulta interesante como caso de uso de modelos pequeños cuantizados para dominios verticales con requisitos de privacidad y funcionamiento offline. La información disponible es escasa y proviene casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama 3 (declarado por el autor, no verificado) |
| Parametros totales | no disponible (estimado 3-4B por tamano del archivo Q4_K_M de 2,0 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configurado en el Modelfile con `num_ctx 8192`) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (la model card esta en ingles; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El autor indica que el modelo se basa en la arquitectura Llama 3 y que se trata de una versión afinada de un modelo existente (el model card menciona `quran-guide` como base en el Modelfile). No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, el uso de RLHF/DPO ni ninguna innovación técnica específica. El único artefacto técnico visible es el Modelfile, que define un system prompt de identidad ("You are Al-Rasheed-AI"), temperatura 0,7 y ventana de contexto de 8192 tokens.

No hay información pública sobre el proceso de cuantización más allá de que se emplea Q4_K_M, ni sobre posibles variantes del modelo (por ejemplo, versiones sin cuantizar o con otros niveles de cuantización). Tampoco se documenta si el ajuste se realizó mediante LoRA, QLoRA o fine-tuning completo. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional en torno a temáticas islámicas: conceptos básicos, terminología, prácticas religiosas y preguntas introductorias sobre jurisprudencia islámica.
- Asistencia en la exploración de pasajes coránicos y enseñanzas asociadas, según la descripción del autor.
- Respuestas a preguntas religiosas de nivel introductorio y, según el autor, también a preguntas más avanzadas como punto de partida para investigación posterior.
- Identificación de temas que requieren consulta con scholars o fuentes islámicas cualificadas.
- Funcionamiento offline mediante inferencia local con software compatible con GGUF.
- Integración en la "Al-Rasheed Islamic App", que incluye además un modelo separado de recitación coránica con retroalimentación de pronunciación.
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; la model card está redactada en inglés y no se declaran idiomas soportados.

## Casos de uso

- Consulta religiosa offline en dispositivos móviles: el modelo puede ejecutarse localmente en la aplicación Al-Rasheed Islamic App, permitiendo responder preguntas básicas sobre islam sin conexión a internet y sin enviar datos a servicios en la nube, lo que encaja con los requisitos de privacidad de muchos usuarios.
- Asistencia educativa introductoria: útil como primer punto de contacto para estudiantes que quieran familiarizarse con terminología islámica, conceptos básicos o prácticas religiosas cotidianas, siempre con verificación posterior en fuentes auténticas.
- Exploración de referencias coránicas: el modelo puede ayudar a localizar temas o pasajes relacionados con una consulta, actuando como índice temático conversacional, aunque el autor advierte explícitamente de que las citas deben verificarse.
- Soporte a la investigación preliminar: para preguntas más avanzadas, el modelo puede servir como generador de hipótesis o listado de temas a consultar con scholars, no como fuente de autoridad.
- Despliegue en hardware de consumo: gracias a su cuantización Q4_K_M y a su tamaño reducido (2,0 GB), puede ejecutarse en ordenadores personales y posiblemente en móviles de gama alta mediante llama.cpp u Ollama, lo que facilita su distribución en entornos con recursos limitados.
- Integración en aplicaciones islámicas de terceros: al estar en formato GGUF, puede incorporarse en otras apps que ya utilicen llama.cpp como backend de inferencia local, siempre que se resuelva la ambigüedad de licencia.
- Prototipado de asistentes verticales: sirve como ejemplo de ajuste de un modelo pequeño para un dominio concreto con despliegue offline, útil para desarrolladores que quieran replicar el enfoque en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB en Q4_K_M, considerando el archivo de pesos de 2,0 GB más overhead de contexto (8192 tokens) y memoria del runtime.
- GPU recomendadas: no hay datos específicos del autor. Por tamaño, el modelo puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores; también en GPUs de datacenter (A100, H100) aunque estarían sobredimensionadas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, y posiblemente en modo CPU-only con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (el Modelfile incluido sugiere este flujo), y potencialmente otros runtimes compatibles con GGUF. No se documenta soporte para vLLM o TGI, que requieren pesos en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: no se conocen los parámetros exactos del modelo, no hay benchmarks publicados y la licencia no está declarada. Como referencia cualitativa, se puede comparar con modelos pequeños de propósito general ampliamente documentados, pero los datos del modelo evaluado son demasiado escasos para una comparación justa.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| Al-Rasheed AI | no disponible (est. 3-4B) | 8192 | no disponible | GGUF Q4_K_M | no |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | si |
| Qwen2.5 3B Instruct | 3B | 32K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | si |
| Gemma 2 2B IT | 2B | 8K | Gemma Terms of Use | safetensors, GGUF | si |

La comparación debe tomarse con cautela: los tres modelos de referencia tienen documentación técnica completa, licencias claras y evaluaciones publicadas, mientras que Al-Rasheed AI carece de todos esos elementos.

## Limitaciones y advertencias

- Riesgo elevado de alucinación en citas coránicas, hadices y dictámenes jurídicos religiosos; el propio autor advierte de que las referencias deben verificarse en fuentes auténticas.
- El modelo no es una autoridad religiosa y no sustituye a muftíes o scholars cualificados; su uso para emitir o interpretar dictámenes religiosos es inapropiado.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido, lo que impide su adopción en productos comerciales sin aclaración previa del autor.
- Idiomas soportados no declarados: se desconoce si el modelo responde con calidad en árabe, español u otros idiomas distintos del inglés.
- Sin información sobre sesgos: no hay documentación sobre sesgos de entrenamiento, composición del dataset ni evaluaciones de seguridad.
- Sin benchmarks ni evaluaciones independientes: no es posible comparar su calidad con alternativas de forma objetiva.
- Contexto limitado a 8192 tokens, inferior al de modelos contemporáneos de tamaño similar (32K-128K).
- Formato exclusivamente GGUF cuantizado a 4 bits: no hay pesos en safetensors ni versiones de mayor precisión, lo que limita la reproducibilidad y el ajuste fino posterior.
- Proyecto en desarrollo activo según el autor, con un modelo futuro separado anunciado; la versión actual puede quedar obsoleta.
- La model card incluye un system prompt que fuerza al modelo a identificarse como "Al-Rasheed-AI" y a no presentarse como su versión anterior, lo que puede condicionar respuestas sobre su propia naturaleza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpha-coder-great/al-rasheed-ai
- Sitio web oficial del proyecto: https://mkaramrashid2012-code.github.io/Al-Rasheed-AI/
- No se han encontrado en la información proporcionada papers, blogs técnicos, repositorios de código ni demos adicionales.
