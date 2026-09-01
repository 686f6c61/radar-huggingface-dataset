# prithivMLmods/AI4SGI-ExoMind-9B-GGUF

## Resumen

AI4SGI-ExoMind-9B es un checkpoint compacto de la familia ExoMind desarrollada por el Shanghai AI Laboratory, diseñado específicamente para razonamiento científico y investigación agéntica. Se trata de un fine-tuning de Qwen3.5-9B que sigue el paradigma "extended-mind-inspired" del modelo insignia ExoMind-35B-A3B, organizando el modelo, objetos de interacción especializados y procesos de interacción autónomos en un sistema unificado. Su objetivo es permitir experimentación con recursos reducidos en tareas de descubrimiento de fuentes, fundamentación de evidencia, verificación ejecutable e integración de observaciones.

El modelo conserva las capacidades multimodales nativas de su base Qwen3.5 (imagen-texto) y soporta una ventana de contexto de 262.144 tokens, lo que lo hace adecuado para documentos científicos extensos y flujos de trabajo agénticos de múltiples pasos. Está disponible en cuantizaciones GGUF oficiales y de la comunidad, y se sirve mediante vLLM o SGLang con parsers de razonamiento y tool-calling estilo Qwen3. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

A diferencia del modelo insignia de 35B, ExoMind-9B no tiene puntuaciones de benchmark publicadas de forma independiente; se posiciona como un checkpoint de bajo consumo para preguntas-respuesta científicas, razonamiento matemático y computacional, experimentos con herramientas y prototipado agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con soporte multimodal imagen-texto |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q3_K_S, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), safetensors (modelo base) |

## Arquitectura y entrenamiento

ExoMind-9B es un modelo denso basado en la arquitectura transformer de Qwen3.5-9B, que incorpora capacidades multimodales nativas para procesar entradas de imagen y texto. El entrenamiento se realizo mediante un proceso denominado "progressive Chain-of-Interaction (CoI) training", aplicado sobre trayectorias seleccionadas de razonamiento puro e interacción. Este enfoque entrena al modelo para organizar flujos de trabajo cientificos completos: descubrimiento de fuentes, fundamentacion de evidencia, verificacion ejecutable e integracion de observaciones, en lugar de limitarse a respuestas estaticas.

El modelo hereda de su base Qwen3.5 el soporte para razonamiento explicito (thinking mode) y tool-calling, con parsers especificos disponibles en vLLM y SGLang. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composicion exacta del dataset, aunque se indica que se seleccionaron trayectorias de razonamiento puro e interaccion para el fine-tuning. Tampoco se especifica si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Razonamiento cientifico: responde preguntas de investigacion, fundamenta evidencia y ejecuta verificaciones computacionales.
- Razonamiento matematico y computacional: resuelve problemas que requieren calculo simbolico o numerico.
- Uso de herramientas (tool calling): compatible con parsers de tool-call estilo Qwen3, integrable en flujos agénticos.
- Agentes multi-paso: soporta procesos de interaccion autonoma para descubrimiento de fuentes y actualizacion de razonamiento.
- Multimodal imagen-texto: conserva las capacidades nativas de Qwen3.5 para entender imagenes junto con texto.
- Ventana de contexto larga: 262.144 tokens, adecuada para documentos cientificos extensos y conversaciones multi-turno.
- Multilingue: soporta ingles y chino.

## Casos de uso

- Asistente de investigacion bibliografica: el modelo puede procesar articulos cientificos completos dentro de su ventana de 262K tokens, extraer fuentes relevantes y fundamentar respuestas con evidencia citada.
- Verificacion de resultados experimentales: dado un procedimiento y datos, puede ejecutar verificaciones computacionales y senalar inconsistencias o errores de calculo.
- Prototipado de agentes cientificos: gracias a su soporte de tool calling y razonamiento multi-paso, sirve para construir prototipos de agentes que consulten APIs, bases de datos o ejecuten codigo.
- Analisis de imagenes cientificas: al ser multimodal, puede interpretar graficos, diagramas o imagenes de microscopia junto con su contexto textual.
- Educacion e investigacion con recursos limitados: las cuantizaciones Q4_K_M (5,63 GB) permiten ejecutar el modelo en GPUs de consumo, facilitando experimentos en laboratorios sin infraestructura de alto rendimiento.
- Desarrollo de sistemas de pregunta-respuesta cientifica en chino e ingles: su bilingüismo lo hace util para organizaciones que trabajan con literatura cientifica en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para ExoMind-9B de forma independiente. La informacion disponible solo reporta puntuaciones para el sistema principal ExoMind-35B-A3B, que alcanza resultados destacados en tareas como FrontierScience-Research (70,0), CMT-Benchmark (84,0), AMO-Bench (78,0) y una media de 68,3 en ocho benchmarks de razonamiento cientifico, superando a Claude-Opus-4.8 Thinking, GPT-5.5 y Gemini-3.1-Pro Preview. Sin embargo, estos datos no son aplicables al checkpoint de 9B, que no ha sido evaluado por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: las cuantizaciones GGUF van desde 4,26 GB (Q3_K_S) hasta 17,9 GB (BF16). Para la cuantizacion Q4_K_M (5,63 GB), se necesitan al menos 8 GB de VRAM con espacio para el contexto y las activaciones.
- GPU recomendadas: para las cuantizaciones Q4 y Q5, una RTX 3060 de 12 GB o RTX 4090 son suficientes. Para BF16, se recomienda una GPU profesional como A100 o H100 con 40 GB o mas.
- Compatibilidad con GPU de consumo: si, las versiones Q3 y Q4 caben en GPUs de 8-12 GB, aunque la ventana de contexto de 262K tokens requerira gestion de memoria (por ejemplo, reduciendo el contexto o usando offloading).
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), vLLM y SGLang (con parsers de razonamiento y tool-call estilo Qwen3), Ollama (si se importa el GGUF).
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar un throughput de 30-50 tokens/s para generacion, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI4SGI-ExoMind-9B | 8,95B | 262.144 | Si (imagen-texto) | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-9B (base) | ~9B | 262.144 | Si | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B | 8B | 128.000 | No | Llama 3.1 Community | safetensors, GGUF |
| Mistral-7B v0.3 | 7,3B | 32.000 | No | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a caracteristicas generales, ya que no hay datos de rendimiento publicados para ExoMind-9B. Su principal diferenciacion frente a Llama-3.1-8B y Mistral-7B es la ventana de contexto mucho mayor, el soporte multimodal y el entrenamiento especifico para razonamiento cientifico agéntico.

## Limitaciones y advertencias

- No se han publicado benchmarks independientes para ExoMind-9B; su rendimiento real en tareas cientificas no esta cuantificado.
- El entrenamiento se ha realizado principalmente en ingles y chino; el rendimiento en otros idiomas puede ser limitado.
- Al ser un fine-tuning de Qwen3.5, puede heredar sesgos presentes en el modelo base, especialmente en dominios cientificos con literatura sesgada.
- Riesgo de alucinacion en tareas de fundamentacion de evidencia: aunque el entrenamiento CoI busca mitigarlo, no hay garantias de que las fuentes citadas sean reales o correctas.
- La ventana de contexto de 262K tokens requiere una gestion cuidadosa de memoria; en GPUs de consumo, el contexto efectivo puede verse reducido.
- La licencia Apache 2.0 permite uso comercial, pero los terminos de marca y contenido del proyecto ExoMind (preprint, figuras, branding) estan sujetos a condiciones separadas.
- Para produccion, se recomienda validar las salidas con verificacion externa, especialmente en aplicaciones cientificas donde la precision es critica.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/prithivMLmods/AI4SGI-ExoMind-9B-GGUF
- Modelo base: https://huggingface.co/AI4SGI/ExoMind-9B
- Repositorio oficial en GitHub: https://github.com/AI4SGI/ExoMind
- Coleccion ExoMind en HuggingFace: https://huggingface.co/collections/AI4SGI/exomind
- Pagina del proyecto: https://ai4sgi.github.io/ExoMind/
- GGUF oficial Q4_K_M: https://huggingface.co/AI4SGI/ExoMind-9B-Q4_K_M-GGUF
- Modelo en ModelScope: https://www.modelscope.cn/models/AI4SGI/ExoMind
- llama.cpp: https://github.com/ggml-org/llama.cpp
